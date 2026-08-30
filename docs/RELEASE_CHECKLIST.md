# IntelliHire v3 — Production Release Checklist

> Status: **pre-launch**. The application code is feature-complete and green locally/CI; the live Pages deployment, R2, and the custom domain are **pending human action**. Do not mark an item green until the stated evidence exists.

---

## 1. Executive Summary & Verification

- **Application:** IntelliHire v3 — AI-powered career intelligence & preparation platform (5 modules + global AI assistant, one persistent career context).
- **Target Production URL:** `https://intellihire.is-a.dev` (**not yet pointed at the Pages project**).
- **Canonical Repository:** `https://github.com/Student-Cybrarians/intellihire-v3.git` (branch `master`; sync/push is performed by the repo owner — this checklist does not auto-push).
- **Infrastructure Target:** Cloudflare Pages (`@cloudflare/next-on-pages`) · D1 · KV (`SESSION_STORE`) · Workers AI — with R2 declared but **not enabled**.
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

## 4. Remaining Before Launch (human steps — REQUIRED)

None of these are code changes; each is an account/dashboard action or an environment confirmation.

- [ ] **Enable R2 (optional, for object storage).** `wrangler.toml` declares the `BUCKET` binding for `intellihire-uploads`, but R2 is not enabled on the account. Uploads currently persist as base64 in D1 and the app is fully functional without R2. Enabling R2 is a billing/dashboard toggle; the code does **not** auto-route to R2 when it is toggled — a future backend swap behind `StorageDriver.saveUploadedFile` is required to actually use it.
- [ ] **Connect the Pages project to a deploy source OR add a scoped Cloudflare API token.**
  - Option A (dashboard): create the Cloudflare Pages project `intellihire-v3` and connect the GitHub repo `Student-Cybrarians/intellihire-v3`.
  - Option B (CLI): configure a scoped token, then run `npm run pages:build && wrangler pages deploy .vercel/output/static --project-name intellihire-v3`.
- [ ] **Apply the D1 schema.** Create/attach the D1 database `intellihire_db` (id `a73d035b-1328-4eee-8e94-91db4c78f0f2`) to the Pages project and load `migrations/0001_init.sql` (import via the Cloudflare D1 API — see the migration header) so the tables `users`, `career_contexts`, `career_roadmaps`, `assessment_catalog`, `assessments`, `tech_interviews`, `hr_interviews`, `documents`, `activity_logs` exist.
- [ ] **Set `JWT_SECRET` on the Pages project** (secret/env binding). Production fails closed without it (routes will 500 on auth until set).
- [ ] **Confirm the Workers AI binding is live.** The `AI` binding maps to `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Without it the app still works via deterministic fallbacks, but "real AI" isn't active — verify in production that assistant/resume/interview responses are **not** prefixed with `[AI offline - deterministic fallback]`.
- [ ] **Point the custom domain `intellihire.is-a.dev`** at the Pages project (Cloudflare Pages → Custom domains; the `is-a.dev` subdomain is provisioned separately). The previously-declared Workers `routes` entry for the domain was removed from `wrangler.toml` as misleading for the Pages path. Verify HTTPS + DNS in the Pages dashboard.
- [ ] **Post-deploy smoke test:** register → dashboard renders → resume upload → one assessment → one tech + one HR interview → readiness report shows a verdict → assistant answers grounded in the user's data → logout revokes the session.

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

*Last updated: 2026-08-30 (release-hold policy applied). Status last verified against a green typecheck + test + build on the current working tree (HEAD c320eca).*