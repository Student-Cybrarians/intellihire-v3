# Implementation Phases — IntelliHire v3

**Honest status:** what is done, what is in progress, and what remains (human + environment work). Verified against `src/`, `migrations/`, `.github/workflows/`, `wrangler.toml` and a green `typecheck` + `npm test` (29 passing) + `npm run build`.

Legend: ✅ done · ⏳ in progress · ⛔ not implemented / pending human.

---

## Phase 0 — Research, Planning & Governance (done)

- Repository scaffold, docs housekeeping, and the initial engineering-rules/design governance docs.
- **Note on phases:** the README outlines a full autonomous lifecycle (Research → Product Definition → UX/UI → Architecture → Implementation → Testing → Security Red Team → Hardening → Regression → Staging → Deploy → Post-Deploy Verification). Documentation reflecting research findings, the design system and engineering rules lives in `docs/`; the *product* work proceeded directly into implementation phases below.

---

## Phase 1 — Authentication & Application Foundation (done)

- Email/password registration & login, zod validation, rate-limited per `(ip, account)` (5 failures / 15 min).
- Session JWTs (HS256, WebCrypto `jose`), 24h TTL, HTTP-only cookie `intellihire_session`, `jti` revocation on logout via KV.
- Password hashing hardened to edge-safe **PBKDF2-HMAC-SHA-256** (100k iterations, constant-time compare); `JWT_SECRET` fails closed in production (no hardcoded fallback).
- Anti-enumeration on register; timing equalization on login.
- API routes: `/api/auth`, `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`, `/api/session`.
- All API routes marked `force-dynamic` (current tree adds `runtime = "edge"` on every handler).

---

## Phase 2 — Personal Career Dashboard (done)

- `/dashboard` — career-context summary cards, module navigation tiles, live activity feed, logout.
- Persistent `CareerContext` initialized per user at registration.

---

## Phase 3 — The Five Modules (done in code; production deployment pending)

Implemented in this integration order (matches the module pages and the dashboard tiles):

1. **Module 1 — Career Intelligence & ATS Hub** (`/modules/career`): profile/taxonomy editor, skills management, roadmap create/toggle, resume ATS analysis, AI career analysis. Routes: `/api/career`, `/api/career/context`, `/api/career/resume`, `/api/career/roadmap`, `/api/career/activities`.
2. **Module 2 — Adaptive Assessment** (`/modules/assessment`): static catalog seeded into D1 (`assessment_catalog`), answer keys stripped server-side, server-side grading, level tiers, running-average `assessmentScore`. Routes: `/api/assessment`, `/api/assessment/submit`.
3. **Module 3 — Technical Interview Simulator** (`/modules/tech-interview`): preset TypeScript problems, code sandbox textarea, deterministic rubric + Workers AI critique, `interviewScore` update. Route: `/api/interview/tech`.
4. **Module 4 — HR / Behavioral Interview Simulator** (`/modules/hr-interview`): preset behavioral scenarios, STAR response, deterministic rubric + Workers AI critique. Route: `/api/interview/hr`.
5. **Module 5 — AI Hiring Committee & Readiness Aggregator** (`/modules/readiness`): weighted 20/30/30/20 score, verdict (`Strong Hire` / `Hire / Qualified` / `Needs Improvement`), dimension breakdown, strengths/gaps, benchmark card. Route: `/api/readiness/report`.

Cross-cutting: **Global AI Assistant** — floating drawer mounted app-wide, grounded chat via `/api/assistant/chat` (non-streaming, deterministic fallback when the AI binding is absent).

---

## Phase 4 — File Upload & Storage (done, with a seam for R2)

- `/api/upload`: base64 JSON uploads, MIME allow-list, 5 MiB server-enforced cap, filename sanitization.
- Files stored durably as base64 in D1 behind the `StorageDriver`/`saveUploadedFile` abstraction.
- ⏳ **R2 object storage not enabled** on the account — switching the backend is the deferred human step (the handler does not change).

---

## Phase 5 — Testing & QA (done for unit layer; ongoing)

- ✅ Vitest suites: `src/lib/auth.test.ts`, `src/lib/db.test.ts`, `src/lib/catalog.test.ts` — **29 tests passing**.
- ✅ `tsc --noEmit` clean; `next build` clean (route manifest: 18 dynamic edge API handlers + 8 static pages).
- ✅ CI workflow `.github/workflows/ci.yml` (lint → typecheck → test → build).
- ⛔ No E2E suite (no Playwright), no automated a11y/security scanning in CI, no miniflare-based integration harness against D1.

---

## Phase 6 — Deployment (in progress / pending human)

Code path is ready: `npm run pages:build` (`@cloudflare/next-on-pages`) → `wrangler pages deploy .vercel/output/static`. D1/KV/AI bindings and the `JWT_SECRET` must exist on the Cloudflare Pages project.

Remaining human steps (see `docs/RELEASE_CHECKLIST.md` for the full runbook):

1. Connect a deploy source to the Pages project (or add a scoped Cloudflare API token for `wrangler pages deploy`).
2. Set the `JWT_SECRET` secret on the Pages project.
3. Point the custom domain **`intellihire.is-a.dev`** at the Pages project (configured on the Pages project; the stale Workers `routes` entry was removed from `wrangler.toml`).
4. Confirm the D1 database (`intellihire_db`, id `a73d035b-…`) is attached and `migrations/0001_init.sql` applied.
5. (Optional, for object storage) Enable **R2** on the account and connect the `BUCKET` binding; today uploads are D1 base64 and do not depend on it.
6. Confirm the **Workers AI** binding (`AI`, Llama 3.3 70B) is live on production and that `askAI` returns real model output (not fallback).

---

## Phase 7 — Post-launch hardening (backlog)

- E2E coverage (Playwright) and CI accessibility/security gates.
- Persist readiness reports; replace fixed benchmark strings with derived analytics.
- Recruiter/admin surfaces (data-model roles already exist; no UI/endpoints).
- True per-question adaptive assessment; interactive multi-turn interview flows.
- Interactive multi-turn interviews, token streaming for the assistant, and a working `/modules/assistant` page (currently a dead dashboard tile).

---

*Last updated: 2026-08-29.*