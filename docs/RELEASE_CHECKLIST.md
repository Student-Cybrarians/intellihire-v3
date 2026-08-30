# IntelliHire v3 — Production Release Checklist

> Status: **✅ PUBLIC MARKET LAUNCH VERIFIED (2026-08-30)** — IntelliHire v3 is **LIVE and launch-ready** at **`https://intellihire-v3.pages.dev`**. All release gates (G1 deploy, G2 pages.dev 200, G3 full prod smoke, G4 real Workers AI + D1 + KV + auth) are GREEN per independent QA re-test.

---

## 1. Executive Summary & Verification

- **Application:** IntelliHire v3 — AI-powered career intelligence & preparation platform (5 modules + global AI assistant, one persistent career context).
- **Production URL:** **`https://intellihire-v3.pages.dev`** (native Pages hostname, HTTPS included; G5 custom-domain decision = ship here, no `is-a.dev` per directive — is-a.dev ToS prohibits commercial/for-profit use).
- **Canonical Repository:** `https://github.com/Student-Cybrarians/intellihire-v3.git` (branch `master`; GitHub source connected to Pages — pushes auto-deploy).
- **Infrastructure:** Cloudflare Pages (`@cloudflare/next-on-pages`) · D1 `intellihire_db` (`DB`) · KV `SESSION_STORE` · Workers AI (`AI`) · `JWT_SECRET` secret. R2 **not enabled** (non-blocking; uploads persist as base64 in D1 behind `StorageDriver`).
- **2026-08-30 deploy-corrections (release-hold §2):**
  - `1de766c` — removed temporary `/api/debug-env` (pre-launch hygiene).
  - `6dcea89` — removed the `[[r2_buckets]]` binding to the non-existent `intellihire-uploads` bucket. That binding made the cloud build FAIL at the final Function-publish step, so the D1/KV/AI worker never went live and the site silently fell back to an in-memory worker (users could register but not log back in). Removing it lets the Function publish; D1/KV/AI confirmed live.
- **How this status was verified (2026-08-29/30):**
  - 2026-08-29: typecheck ✅, 29 tests ✅, build ✅, `pages:build` ✅ (18 edge routes).
  - 2026-08-30 independent QA re-test (live, build `c0bb9d1d`): G3 full prod smoke ✅, G4 real Workers AI (no offline fallback) ✅ + D1 persistence ✅ + KV revocation ✅ + auth ✅, user isolation ✅, `/api/debug-env` 404 ✅. Verdict **GREEN — launch-ready**.
- **How this status was verified (2026-08-29):**
  - `npm run typecheck` — ✅ clean.
  - `npm test` — ✅ 29 tests passing (auth, db, catalog).
  - `npm run build` — ✅ clean. Route manifest: **18 dynamic (edge) API handlers** + static pages (`/`, `/_not-found`, `/login`, `/register`, `/dashboard`, the five `/modules/*` pages).
  - `git check-ignore .claude-secrets.env` — ✅ excluded (`/ .gitignore`).

---

## 2. Core Functional Acceptance Gates (implemented)

| Module / System | Status | Where | Notes (against actual code) |
|---|---|---|---|
| Documentation (`docs/`) | ✅ Implemented | PRD · architecture · phases · checklist · schema · design · rules · TEAM | Re-written to match code; not stubs |
| Phase 1 — Authentication | ✅ Implemented | `/login`, `/register`, `/api/auth/*` | Email/password; HS256 JWTs via `jose` (WebCrypto); PBKDF2-HMAC-SHA-256 hashing; 24h httpOnly cookie; KV `jti` revocation; auth rate limiting (5 fails / 15 min per `ip`+`account`); anti-enumeration |
| Phase 2 — Personal Dashboard | ✅ Implemented | `/dashboard` | Career-context cards, module tiles, activity feed (last 50) |
| Module 1 — Career Intelligence & ATS Hub | ✅ Implemented | `/modules/career` | Profile/skills taxonomy editor; roadmap create+status-toggle; resume ATS analysis (score + suggested/missing keywords); AI career analysis |
| Module 2 — Adaptive Assessment | ✅ Implemented | `/modules/assessment` | 2-question-bank catalog; keys stripped server-side; server-side grading + level tiers; `assessmentScore` = running average |
| Module 3 — Technical Interview Simulator | ✅ Implemented | `/modules/tech-interview` | 2 preset TypeScript problems; code sandbox (textarea); rubric scores + Workers AI critique; writes `interviewScore` |
| Module 4 — HR / Behavioral Interview | ✅ Implemented | `/modules/hr-interview` | 2 preset scenarios; STAR response; rubric scores + Workers AI critique |
| Module 5 — Readiness Aggregator | ✅ Implemented | `/modules/readiness` | Weighted 20/30/30/20 score; verdict `Strong Hire` / `Hire / Qualified` / `Needs Improvement`; dimension breakdown, strengths/gaps, benchmark card |
| Global AI Assistant | ✅ Implemented | Floating drawer (root layout) | `POST /api/assistant/chat`; grounded in user's own context; **non-streaming**; deterministic fallback when AI binding absent |
| File upload | ✅ Implemented | `/api/upload` | base64 JSON; MIME allow-list; 5 MiB server-enforced cap; sanitized name; stored **as base64 in D1** (`storageKey: d1://…`) |

> Terminology truth: the UI copy uses "adaptive difficulty", "proctor engine", "radar", "lexicon sandbox" as decorative labels. Actual behavior is described in the Notes column; the docs (PRD/architecture) describe behavior, not marketing copy.

---

## 3. Engineering, Security & Quality Verification

- [x] **No plaintext passwords** — PBKDF2-HMAC-SHA-256 (100k iterations, 16-byte salt, constant-time compare); unique salt per hash; self-describing `pbkdf2$iters$salt$key`.
- [x] **Sessions are short-lived & revocable** — 24h HS256 JWTs; `jti` blacklist on logout via KV.
- [x] **`JWT_SECRET` fails closed** — production throws if unset; no hardcoded/guessable fallback (local dev uses a per-process ephemeral key).
- [x] **No hardcoded production secrets in Git** — `.claude-secrets.env`, `.env`, `.env.local` excluded via `.gitignore` (verified with `git check-ignore`).
- [x] **Brute-force protection** — fixed-window failure counter per `(action, ip, account)` for `login`/`register`; HTTP 429 + `Retry-After`.
- [x] **IDOR/answer-key guards** — career-context updates are column-whitelisted and user-scoped; assessment answers are graded only server-side; uploads validate MIME, decoded size and base64 server-side.
- [x] **Strict type safety** — `tsc --noEmit` clean.
- [x] **Automated tests** — 29 Vitest tests green (`auth`, `db`, `catalog`).
- [x] **Production build** — `npm run build` clean; all 18 API handlers compile as dynamic edge routes; pages as static/prerendered output.
- [x] **CI gate** — `.github/workflows/ci.yml` (lint → typecheck → test → build) on push/PR to `master`/`main`.
- [x] **Edge-safe auth/AI/upload internals** — `jose`/WebCrypto, PBKDF2 via `crypto.subtle`, arithmetic base64-size check (no `Buffer`), `runtime = "edge"` on handlers, `nodejs_compat` compat flag.
- [~] **Responsive UI** — Tailwind responsive layout across the app; a recorded device-matrix audit (375/768/1280) has **not** been run this cycle — treat as deferred verification.
- [~] **E2E test suite** — not implemented (no Playwright); only unit-level Vitest today.

---

## 4. Launch Status (2026-08-30 — VERIFIED LAUNCH)

All launch-required steps are DONE and verified in production:

- [x] **Connect the Pages project to a deploy source.** GitHub repo `Student-Cybrarians/intellihire-v3` connected to Pages project `intellihire-v3` (branch `master`); pushes auto-deploy. Live prod build `c0bb9d1d`.
- [x] **Apply the D1 schema / bindings live.** D1 `intellihire_db` (`DB`, id `a73d035b-…`) + KV `SESSION_STORE` + Workers AI (`AI`) verified live in production (register→login returns the persisted user; career-context write→read identical; real AI output — no `[AI offline…]` fallback; logout revokes the jti).
- [x] **Set `JWT_SECRET`.** Present as a Pages secret; HS256 signatures verify; wrong-password login correctly 401s.
- [x] **Post-deploy smoke test (G3+G4).** Register → login → dashboard → upload (D1 base64) → Modules 1–5 → global assistant (real AI) → logout/revocation → user isolation — **all PASS** (independent QA re-test).
- [x] **Production URL.** Native `https://intellihire-v3.pages.dev` (HTTPS via Cloudflare). **G5 custom-domain decision = ship here** (no `is-a.dev` — ToS prohibits commercial/for-profit use). An owned/other domain can be attached later as a Pages custom hostname (optional, human).
- [ ] **Enable R2 (POST-LAUNCH, optional).** R2 is NOT enabled on the account. The `[[r2_buckets]]` binding is deliberately **removed** from `wrangler.toml` (a binding to the non-existent `intellihire-uploads` bucket failed the Function-publish step of the cloud build — see §1). Uploads persist as base64 in D1 behind `StorageDriver` and are fully functional. Re-add the binding only after R2 is enabled and, to actually use it, swap the upload backend behind `StorageDriver.saveUploadedFile`.

---

## 5. Deferred Post-Launch Items (backlog, not launch-blocking)

- E2E (Playwright) + CI a11y/security scanning.
- Persist readiness reports; replace fixed "Top 8%" / "High Confidence" benchmark strings with derived analytics.
- Recruiter/admin surfaces (roles exist as data-model values only).
- True per-question adaptive assessments; interactive multi-turn interviews; token streaming; a real `/modules/assistant` page (below the dashboard tile).
- Swap upload backend from D1-base64 to R2 once R2 is enabled.

---

---

## 6. Release-Hold Policy (2026-08-30, human directive)

- Release candidate has passed **independent QA** (verdict: READY, conditional on deploy steps). Engineering is frozen — **do not modify the verified candidate** without a concrete defect or a required deployment correction.
- **R2 is NON-BLOCKING.** The PRD does not require R2 for launch and uploads are fully functional as base64 in D1. R2 stays on the deferred backlog (section 5).
- **PUBLIC LAUNCH is NOT implied by a green source build.** Launch is declared only when: deployed to Cloudflare Pages **and** reachable at the custom domain **and** passed the full production smoke test **and** Workers AI is verified live (no `[AI offline…]` fallback) **and** the domain/HTTPS is verified.
- Runbook & smoke-test sequence: see board.md (sole scribe) and section 4 above.

*Last updated: 2026-08-30 (PUBLIC MARKET LAUNCH VERIFIED). Status verified live at `https://intellihire-v3.pages.dev` (prod build `c0bb9d1d`); repo HEAD `6dcea89` on `master`.*