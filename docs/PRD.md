# Product Requirements Document — IntelliHire v3

**Status:** Living document, aligned to the implemented codebase (`git HEAD` + current working tree).
**Stack reality (verify against `src/` and `package.json` before editing):** Next.js 14 App Router · Cloudflare Pages via `@cloudflare/next-on-pages` · Cloudflare D1 (persistence) · Cloudflare KV (`SESSION_STORE` for sessions + auth rate limiting) · Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) · `jose` (WebCrypto HS256 JWT) · PBKDF2-HMAC-SHA-256 password hashing · Zod validation. **R2 is declared in `wrangler.toml` but is NOT enabled on the account; uploaded files are stored as base64 in D1 today.**
**Scope guard:** every capability below is implemented in code. Anything not implemented (see "Known limitations") is either marked in-progress/pending-human or omitted.

---

## 1. Overview & Mission

IntelliHire v3 is an AI-powered career intelligence platform. It gives a single job-seeker a persistent, unified view of their career — one target profile, one set of skills, one set of scores — and drives every specialized module (career/ATS, adaptive assessment, technical interview, HR/behavioral interview, readiness) from that shared context, rather than from isolated silos.

Mission: **one user, one persistent career context, five specialized modules, one grounded AI assistant.** The platform measures readiness explicitly (a weighted 0–100 score) and produces a hiring-committee-style verdict, so a candidate can see exactly where they stand and what to do next.

The product is a candidate-side preparation and measurement tool. There is no recruiter/employer-facing portal in the current code.

### 1.1 Build lifecycle & current phase

The project follows a phased lifecycle (research → product definition → UX/UI → architecture → implementation → testing → security → deployment; see the repo README and `docs/phases.doc.md`). Status today:

- **Research & planning:** complete (design system in `docs/design.md`, engineering rules in `docs/rules.md`, team roster in `docs/TEAM.md`, schema design in `docs/architecture/schema.sql`).
- **Implementation:** all five modules, the assistant, auth, uploads and the D1/KV/AI wiring are implemented and green (typecheck + 29 unit tests + production build).
- **Testing/security:** unit layer + auth/upload hardening done; CI runs lint/typecheck/test/build. E2E, a11y and security scanning in CI are deferred.
- **Deployment:** code path ready (`@cloudflare/next-on-pages` → `wrangler pages deploy`); the live Pages deploy, R2 enablement and the `intellihire.is-a.dev` custom domain are **pending human action** (see `docs/RELEASE_CHECKLIST.md`).

---

## 2. Target Users & Personas

| Persona | Goal | Core needs served by the platform |
|---|---|---|
| **Early-career engineer (0–3 YOE)** | Land a first/junior software role | Baseline assessment, roadmap of skill-gap milestones, ATS resume feedback, STAR interview practice |
| **Mid-level engineer (3–8 YOE)** | Move up or change domain | Target-role benchmarking, adaptive assessment scores, technical + behavioral interview drill, readiness verdict |
| **Senior/staff engineer (8+ YOE)** | Reach staff/principal pipelines | System-design technical interviews, leadership/conflict behavioral scenarios, aggregate readiness report, percentile-style benchmark |
| **Career switcher** | Transition into tech | Skills taxonomy management, resume keyword guidance for a new target role, roadmap scaffolding |

Roles in the system are limited to **`candidate`** (every new account; server-enforced, no self-promotion), **`recruiter`** and **`admin`** (exist as data-model roles; no recruiter/admin UI or endpoints are implemented).

---

## 3. Product Modules

The five modules are implemented in the exact order below (mirroring `src/app/modules/` and the load order on the dashboard). Modules 1–4 *write* their results back into the shared career context; Module 5 *reads* the context (plus latest results) to produce the aggregate verdict.

### 3.1 Module 1 — Career Intelligence & ATS Hub (`/modules/career`)

The profile + planning module. One shared, persistent `CareerContext` record (`targetRole`, `targetIndustry`, `seniorityLevel`, `skills[]`, and the four scores) is created for every user at registration and edited here.

- **Target Profile & Skills Taxonomy** — edit target role/industry/seniority; add/remove verified skills. Skills feed downstream module prompts and roadmap descriptions.
- **Career Roadmap** — an ordered list of milestones (`title`, `category`, `status`, `estimatedHours`, `description`). A seeded "Initial Skill Gap Assessment" milestone exists for every new account; milestones can be added (`POST /api/career/roadmap`) and toggled complete (`PATCH`).
- **Resume Intelligence & ATS** — `POST /api/career/resume` parses resume text (or a declared file) and returns an ATS score (0–100), a summary, `suggestedKeywords` and `missingKeywords` derived for the candidate's target role. The ATS score is written back into the career context.
- **AI career analysis** — `GET /api/career` returns the context, roadmap, resumes *and* an AI-written readiness analysis (overview, strengths, recommended next steps) generated by Workers AI from the candidate's *own* profile data only.

### 3.2 Module 2 — Adaptive Assessment (`/modules/assessment`)

A timed multiple-choice technical assessment with server-side grading.

- The catalog (`src/lib/catalog.ts`) currently ships **two** questions banks, provisioned into the D1 `assessment_catalog` table on first use: *TypeScript Advanced Type Systems & Generics* (Advanced) and *Cloud Edge Computing & Distributed Cache Coherence* (System Design).
- **Answer-key hygiene:** `GET /api/assessment` strips `correctIndex`/`explanation` before serving questions to the client; grading happens exclusively in `POST /api/assessment/submit`, so the client never sees the key.
- **Scoring & levels:** score = correct/total (rounded), mapped to a proficiency tier: Novice (L1) → Expert (L5). Each submission is persisted, and the career-context `assessmentScore` is automatically updated to the running average of all the user's assessment scores.
- True adaptive question derivation is **not** implemented — the test difficulty is fixed per bank; "adaptive" is aspirational naming in the UI copy. The level tier *is* adaptive in that it is earned from performance.

### 3.3 Module 3 — Technical Interview Simulator (`/modules/tech-interview`)

A code-writing practice interview with AI rubric evaluation.

- Ships with **two** TypeScript problems (LRU cache with O(1) ops; token-bucket rate limiter for edge workers), each with starter code.
- The candidate edits code in a plain sandbox textarea, then "Run & Submit to AI Interviewer" (`POST /api/interview/tech`).
- A deterministic rubric produces immediate, stable scores (correctness, code quality, efficiency, overall) so the UI always has feedback; the AI (Workers AI) then writes a *specific* critique grounded in the problem statement + submitted code. If the AI binding is unavailable, a canned non-fabricated note is used instead.
- The overall score is written back into the career-context `interviewScore`.

### 3.4 Module 4 — HR / Behavioral Interview Simulator (`/modules/hr-interview`)

STAR-method behavioral coaching.

- Ships with **two** scenario cards (conflict resolution & alignment; ambiguity/production outage triage), each with a question asking for a STAR-structured answer.
- The candidate writes a free-text response (min 10 chars, validated); `POST /api/interview/hr` scores it deterministically on STAR structure, communication and leadership, then has Workers AI write a behavioral critique + concrete improvements grounded in the actual response.
- **Note:** the module evaluates the *text the user pastes* — there is no interactive multi-turn interviewer, no "asking for batching control", and no seniority-mix logic; those are not in the code.

### 3.5 Module 5 — AI Hiring Committee & Readiness Aggregator (`/modules/readiness`)

The aggregate, calibrated verdict. `GET /api/readiness/report` computes a **weighted readiness score**:

```
readiness = atsScore×0.20 + assessmentScore×0.30 + techScore×0.30 + hrScore×0.20
```

- Where a user has no data yet, the report falls back to context scores or conservative defaults: `atsScore` = context or 85, `assessmentScore` = context or 80, `techScore` = latest completed tech interview score or 85, `hrScore` = 92 if any HR interview exists else 88.
- Verdict thresholds: **≥85 → "Strong Hire"**, **70–84 → "Hire / Qualified"** (the code names this `"Hire / Qualified"`, not a separate "Leaning No"), **<70 → "Needs Improvement"**.
- Output includes the four weighted dimensions, evidence-backed strengths, priority improvement gaps, and a benchmark card (percentile "Top 8%"; role-match "High Confidence"). The report is computed on the fly; it is **not** persisted (there is no `readiness_reports` write path).

### 3.6 Global AI Assistant (cross-cutting)

A floating chat drawer mounted app-wide in the root layout (`src/components/GlobalAssistant.tsx`), presented by a sparkle toggle button. Sends `POST /api/assistant/chat` with `{ message }`.

- The route loads the authenticated user's **own** career context + latest roadmap/tech/HR/assessment data, puts ONLY retrieved/authorized data into the system prompt, and the user's raw message into the user turn. The model is instructed to answer only from that context plus general career knowledge and to never invent user-specific facts.
- Responses are **non-streaming** JSON turns (one request/response; no token streaming). There is a simple "AI is thinking..." status while awaiting the reply — not a per-message typing indicator.
- AI capability: Works AI binding → real model; otherwise a deterministic, clearly-prefixed fallback (`[AI offline - deterministic fallback]`) so chat always responds.
- There is **no** `/modules/assistant` page — a dashboard tile links there today but no route exists; the assistant is the floating widget only.

### 3.7 Personal Career Dashboard (`/dashboard`)

Authenticated hub: welcome header, four key career-context cards (target role, readiness, ATS, industry), navigation tiles for the five modules + assistant entry, and the recent activity feed (`GET /api/career/activities`, last 50). Logout revokes the session server-side.

---

## 4. Authentication & Accounts

- **Registration** (`POST /api/auth/register`): email + name + password (min 8, max 200). Server always grants the least-privileged **`candidate`** role; the client can never self-assign a role. Duplicate-email attempts return an *indistinguishable* HTTP 200 success with no session, plus a timing-equalization hash burn, so the endpoint does not leak account existence or timing.
- **Login** (`POST /api/auth/login`): zod-validated; a cost-matching dummy hash keeps the "user not found" path the same latency as a wrong password (timing side-channel guard).
- **Sessions:** short-lived (24h) HS256 JWTs signed with `jose` (WebCrypto — edge-safe) using the `JWT_SECRET` binding. Each token carries a `jti`; logout (`POST /api/auth/logout` / `DELETE /api/auth`) blacklists the `jti` in KV for the remaining TTL so the token cannot be replayed. Verified before every session read.
- **Cookie:** `intellihire_session`, `httpOnly`, `sameSite=lax`, `secure` in production, 24h max-age.
- **Password hashing:** PBKDF2-HMAC-SHA-256, 100k iterations, 16-byte random salt, 256-bit key, constant-time compare, self-describing format `pbkdf2$iterations$salt$derived`. Production **fails closed** if `JWT_SECRET` is missing (loud error; never a known fallback key). Local dev uses a random per-process ephemeral secret.
- **Session endpoints:** `GET /api/auth` and `GET /api/auth/me` report the current session/user; `GET /api/session` is a thin session probe.

---

## 5. Persistent Career Context (the shared spine)

One `CareerContext` per user (D1 `career_contexts`; in-memory in local dev), initialized at registration and updated through whitelisted fields only:

| Field | Written by |
|---|---|
| `targetRole`, `targetIndustry`, `seniorityLevel`, `skills[]` | Module 1 edit (`PUT /api/career` / `PUT /api/career/context`) |
| `assessmentScore` | Module 2 (`running average` on each submission) |
| `atsScore` | Module 1 resume analysis |
| `interviewScore` | Module 3 tech interview overall score |
| `readinessScore` | Set at defaults (`75` initial, `70` fallback); consumed by Module 5 |

Security property: context updates only allow the whitelisted columns listed in `DatabaseService.CAREER_CONTEXT_UPDATABLE_FIELDS`; identity fields (`id`, `userId`, `updatedAt`) are never taken from the request body, so a write can never be redirected to another user's record.

Persistence: `StorageDriver` interface with two implementations — `D1Driver` (production, D1 + typed prepared statements) and `MemoryDriver` (durable in-process store for local `next dev`/build/tests). All reads/writes go through `DatabaseService`.

---

## 6. Non-Functional Requirements

### 6.1 Security (implemented)

- No plaintext passwords; PBKDF2 hashing with unique salt per hash.
- Sessions: short-lived (24h), HTTP-only + SameSite cookie, `jti`-revocable on logout via KV.
- `JWT_SECRET` fails closed in production.
- **Auth abuse protection** (`src/lib/rate-limit.ts`): fixed-window failure counter per `(action, ip, account)` — **5 failures per 15 minutes** for `login` and `register`; blocked attempts return HTTP 429 with `Retry-After`. Backed by KV `SESSION_STORE` in production, in-memory in dev. There is **no** per-route throttling on AI/other endpoints, and no per-region or per-account "billing" limits.
- Anti-enumeration: registration duplicates are indistinguishable from success; login equalizes timing for unknown accounts.
- Answer keys are never sent to the client; grading is server-side.
- Upload hardening (see §6.5): MIME whitelist, server-computed decoded-size cap, base64 validation, filename sanitization.
- Career-context writes are user-scoped and whitelisted (IDOR guard).
- AI hygiene: retrieved/authorized data goes into the system prompt; raw user content is never interpolated into the system prompt; prompts forbid fabricating user facts.

> Note: the Data-Model roles include `recruiter`/`admin`, but there is no RBAC enforcement layer beyond the server-granted `candidate` role at registration. HSTS/CSP header material exists in `docs/rules.md` as engineering *policy*, not as implemented response headers.

### 6.2 Performance

- All API routes are `force-dynamic` and (in the current working tree) declare `runtime = "edge"` so they run on Cloudflare's edge runtime with `nodejs_compat`.
- D1 is the persistence layer (SQLite at the edge); all queries use prepared statements; list reads cap at 50 rows (activity feed).
- Workers AI uses a fast Llama 3.3 70B instruct model (`fp8-fast`) with a default 600-token cap to keep edge latencies predictable.
- Bundle: the full app builds with ~87.3 kB shared first-load JS from `next build` (see RELEASE/CI for verification commands).

### 6.3 Accessibility

The design system (`docs/design.md`) targets WCAG 2.1 AA (4.5:1 text contrast, focus-visible rings, semantic HTML, `prefers-reduced-motion`). The implemented pages use semantic elements (buttons, labels, nav) and keyboard-operable controls. A formal automated accessibility audit (Lighthouse/axe) is **not** run in CI yet.

### 6.4 Cloudflare platform

- Hosting: Cloudflare **Pages** via `@cloudflare/next-on-pages` (`npm run pages:build` → `wrangler pages deploy .vercel/output/static`). **The project is not OpenNext**; the `main`/`routes` entries that used to reference `.open-next/worker.js` have been removed from `wrangler.toml`.
- D1: single database `intellihire_db` (binding `DB`); schema in `docs/architecture/schema.sql` (aspirational/expanded) with the *implemented* initial schema in `migrations/0001_init.sql`.
- KV: `SESSION_STORE` for session revocation + auth rate limiting.
- R2: `BUCKET` binding declared for `intellihire-uploads`, **but R2 is NOT enabled on the account**; uploads are stored durably as base64 in D1 (`documents.file_data`) behind the storage abstraction. R2 is a pending human enablement, not current behavior.
- Workers AI: binding `AI`; model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.

### 6.5 Resume file upload (`POST /api/upload`)

- JSON body `{ fileName, fileType, fileData }`; `fileData` is base64. Allowed MIME types: PDF, DOC, DOCX, TXT. Decoded size is computed server-side (no client trust) with a **5 MiB** cap; empty/oversized files are rejected. The filename is sanitized (path stripped, control chars removed, 255-char cap). Persists to D1 as base64; returns a `storageKey` of form `d1://{id}`.
- No actual file-type sniffing beyond the MIME allow-list, and no background parsing pipeline — resume *text analysis* is the separate `POST /api/career/resume` flow.

---

## 7. Success Criteria

Measurable criteria the product is currently meeting (verified by `npm run typecheck`, `npm test` = 29 passing, `npm run build` clean):

1. A user can register, log in, and have a persistent career context within one flow.
2. All five modules write/read shared context so "one user, one context" holds end-to-end (module completions move the four scores).
3. Every AI surface degrades gracefully: if the Workers AI binding is absent/failing, the app still returns a deterministic, non-fabricated response rather than erroring.
4. Auth fails closed without `JWT_SECRET` in production; logout revokes sessions; brute-force attempts on login/register are throttled.
5. Uploads are constrained (MIME + size) and stored durably; nothing depends on R2 being enabled for today's functionality.
6. Build + typecheck + 29 unit tests pass in CI (see `.github/workflows/ci.yml`).

**Launch-gating criteria (NOT yet met — pending human/environment work):** live production deployment on Pages, R2 enablement (optional, for object storage), custom domain `intellihire.is-a.dev` pointing at the Pages project, and confirmation that the `AI` binding serves real model responses in production. See `docs/RELEASE_CHECKLIST.md`.

---

## 8. Known limitations / out of scope (honest inventory)

- **No recruiter/employer portal**, no job-board, no applications, no company-facing tools (the expanded `schema.sql` models for `jobs`, `applications`, `experiences`, `education`, `notifications`, `user_preferences`, `ai_conversations` are **not** implemented in code or UI).
- **No OAuth/SSO** and no password reset/MFA — email/password only.
- **No token streaming** in the AI assistant; one-shot JSON responses only.
- **No interactive multi-turn interviews** (tech/HR modules are single-shot submissions against preset problem/scenario banks).
- **No true per-question adaptivity** in assessments (fixed banks; level earned from score).
- **No R2-backed storage yet** (base64 in D1).
- **No dedicated assistant page** (`/modules/assistant` tile is a dead link in the dashboard).
- **Readiness report is computed, not persisted**; benchmark texts ("Top 8%", "Senior Engineer (High Confidence)") are fixed strings in the route, not derived analytics.
- **No CI gate beyond build/test/typecheck/lint** — no automated a11y or security scanning in CI.

---

*Last updated: 2026-08-29. Rewritten from the thin stub to match the implemented code. Re-verify claims against `src/` before any feature change.*