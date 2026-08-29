# System Architecture — IntelliHire v3

**Scope:** the architecture that *exists in `src/`*, not an aspirational sketch. Re-verify against the code before editing.

---

## 1. Overview

IntelliHire v3 is a Next.js **14** App Router application deployed to **Cloudflare Pages** via **`@cloudflare/next-on-pages`** (which emits a `.vercel/output/static` build artifact that `wrangler pages deploy` publishes — the project is **not** an OpenNext worker deployment).

The application is deliberately single-user-centric: one authenticated candidate, one persistent **CareerContext** record, five modules that read/write that context, and one grounded AI assistant on top. Every persistence and AI call is abstracted behind an interface so the same code path works against real Cloudflare bindings in production and durable in-process stores in local dev/tests.

### Architecture at a glance

```
Browser ──► Cloudflare Pages (static + edge functions via next-on-pages)
                 │  App Router pages (/ , /login, /register, /dashboard, /modules/*)
                 │  GlobalAssistant floating drawer (root layout)
                 ▼
            18 edge API routes (force-dynamic, runtime = "edge")
                 │
      ┌──────────┼───────────────────────────────┐
      ▼          ▼                               ▼
   D1 ("DB")   KV ("SESSION_STORE")        Workers AI ("AI")
   relational    jti revocation +           askAI(): system+user
   persistence   auth rate limiting         → @cf/meta/llama-3.3-70b
                                            (deterministic fallback)
```

### Deployed vs not-deployed (be exact)

| Capability | Declared in `wrangler.toml` | Actually used by code today |
|---|---|---|
| Cloudflare Pages | — | Yes — the deploy target |
| D1 (`DB`) | Yes | Yes — database layer in production |
| KV (`SESSION_STORE`) | Yes | Yes — session revocation + auth rate limiting |
| Workers AI (`AI`) | Yes | Yes — `askAI` inference (binding must be *live* on the Pages project) |
| R2 (`BUCKET`) | Yes | **No — R2 is NOT enabled on the account.** Uploads persist as base64 in D1 (`documents.file_data`); the `BUCKET` binding is inert until a human enables R2 |
| Custom domain `intellihire.is-a.dev` | Previously in Workers `routes` (removed) | No — must be configured on the Pages project (pending human action) |

---

## 2. Deployment topology

- **Frameworks:** Next.js 14.2 + TypeScript 5.6 + Tailwind 3.4 + Zod. Auth/crypto: `jose` (WebCrypto) + PBKDF2. Icons: `lucide-react`. Tests: Vitest. Wrangler 3.x.
- **Deploy command path (from `package.json`):**
  - `npm run pages:build` → `npx @cloudflare/next-on-pages` (produces `.vercel/output/static`)
  - `npm run preview` → `wrangler pages dev .vercel/output/static`
  - `npm run deploy` → `wrangler pages deploy .vercel/output/static`
- **Runtime:** all API routes declare `export const runtime = "edge"` (current working tree) + `compatibility_flags = ["nodejs_compat"]` in `wrangler.toml` so Pages functions can run Node-compatible APIs inside the edge runtime.
- **Secrets/bindings on the Pages project:** `DB` (D1), `SESSION_STORE` (KV), `AI` (Workers AI), and the `JWT_SECRET` secret. `wrangler.toml` carries the binding IDs; the JWT secret is set on the Pages project (env var/secret), never committed.
- **Domain:** the `is-a.dev` subdomain is provisioned/pointed via the Pages dashboard ("Custom domains"); it is a **pending human step**. The stale `routes = [intellihire.is-a.dev/*]` (a Workers appointing) and `main = ".open-next/worker.js"` (OpenNext) entries have been **removed** from `wrangler.toml` because they do not describe the Pages path.
- **CI:** `.github/workflows/ci.yml` runs lint → typecheck → 29 Vitest tests → `next build` on push/PR to `master`/`main`. It does **not** deploy (no Cloudflare token/credentials configured).

---

## 3. Persistence model: D1 + StorageDriver fallback

### 3.1 The `StorageDriver` interface (`src/lib/db.ts`)

All persistence goes through the `StorageDriver` contract (low-level CRUD for users, career contexts, roadmaps, assessment catalog/results, tech/HR interviews, resumes/documents, activity logs). Two implementations:

- **`D1Driver`** — production. Typed structural `D1Database`/`D1PreparedStatement` interfaces (deliberately *not* `@cloudflare/workers-types`, whose ambient Workers globals shadow the DOM lib and break client-component typechecking in this single-tsconfig project). All statements are prepared + bound.
- **`MemoryDriver`** — a durable, shared in-process store for local `next dev`, `next build` and Vitest. Data survives across requests within the process.

`DatabaseService` sits on top and adds the orchestration: id generation, whitelisted career-context updates, auto-updates of scores on module completion, activity logging, and seeding (default context + initial roadmap milestone on registration; static assessment catalog provisioning into D1 on first catalog read).

### 3.2 Binding resolution (no direct `env` propagation)

The app never threads `env` through handlers. Both `db.ts` and `ai.ts` read the Cloudflare request context off `globalThis` via the same symbol key `@cloudflare/next-on-pages` uses:

```
CLOUDFLARE_REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__")
currentCloudflareEnv()  → { DB?, SESSION_STORE?, JWT_SECRET? }
requestDb()             → D1Driver-backed DatabaseService, else MemoryDriver
requestKv()             → SESSION_STORE binding, else undefined (in-memory fallback inside auth/rate-limit)
```

This is what lets the *same code* run on Pages (real bindings) and locally (fallbacks) without conditional branches in handlers.

### 3.3 Schema truth

- **Implemented schema:** `migrations/0001_init.sql` (`users`, `career_contexts`, `career_roadmaps`, `assessment_catalog`, `assessments`, `tech_interviews`, `hr_interviews`, `documents`, `activity_logs`) — applied to D1 `a73d035b-…` via the Cloudflare D1 import API (see header comment in the migration).
- **`docs/architecture/schema.sql`** is an expanded, aspirational data model (adds `user_profiles`, `jobs`, `applications`, `experiences`, `education`, `readiness_reports`, `ai_conversations`/`ai_messages`, `notifications`, `user_preferences`, `skills_taxonomy`, `job_categories`). Those tables are **not** created by any migration and **not** referenced by `src/`. Treat it as a design reference, not ground truth.

---

## 4. Auth (JWT + cookies, rate limiting, revocation) — `src/lib/auth.ts`

Current implementation (post edge-hardening; supersedes the earlier `jsonwebtoken`/`bcryptjs` stack, which has been removed from `package.json`):

- **Session JWT:** HS256 via `jose` (`SignJWT`/`jwtVerify`) on WebCrypto — fully edge-safe. Payload: `{ userId, email, name, role, jti, iat, exp }`. TTL **24h**.
- **Secret:** `JWT_SECRET` resolved lazily from (1) test override, (2) `process.env.JWT_SECRET`, (3) the Pages binding on the request context, (4) a random per-process ephemeral secret for **non-production only**. In `NODE_ENV=production` a missing secret **throws** (fail closed — no hardcoded fallback).
- **Revocation:** each token has a random `jti`. Logout blacklists the `jti` for the remaining TTL in KV (`revoked:{jti}`); `getSession` rejects revoked jtis. KV failures degrade to an in-memory list (best effort) so logout never hard-fails.
- **Password hashing:** PBKDF2-HMAC-SHA-256 (`crypto.subtle`), 100k iterations, 16-byte salt, 256-bit derived key, constant-time byte compare, self-describing `pbkdf2$iters$salt$key` format. No Node `crypto` builtins — edge-safe.
- **Cookies:** `intellihire_session`, `httpOnly`, `sameSite=lax`, `secure` in production, 24h max-age.
- **Rate limiting** (`src/lib/rate-limit.ts`): fixed-time-window **failure** counter keyed `(action, ip, account)` — 5 failures / 15 min for `login` and `register`; HTTP 429 + `Retry-After` when blocked; success clears the counter. KV-backed, in-memory fallback. Client IP derived from `x-forwarded-for` then `cf-connecting-ip`.
- **Anti-enumeration:** login burns a cost-matching PBKDF2 hash for unknown accounts (timing equalization); register reports duplicate emails as indistinguishable HTTP 200 success and counts the attempt toward throttling.
- **Session status endpoints:** `GET /api/auth`, `GET /api/auth/me` (full user), `GET /api/session`.

---

## 5. AI intelligence layer — `src/lib/ai.ts`

**Single entry point:** `askAI({ system, user, maxTokens? })`.

- Resolves `env.AI` via the same request-context symbol as the DB layer.
- Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (fast, low-latency Llama 3.3 70B). Default output cap 600 tokens; askAI creates the `messages` array `[{role:"system"},{role:"user"}]` and calls `AI.run(model, { messages, max_tokens })`.
- **Grounding rule:** retrieved/authorized data (the user's own context, roadmap, interviews, assessments) is placed in the *system* turn; raw user content goes in the *user* turn. User content is never interpolated into the system prompt.
- **Deterministic fallback:** when the binding is absent or the call/parse fails, `askAI` returns a clearly-prefixed string (`[AI offline - deterministic fallback]`) that restates the caller's own input in a structured way — it never fabricates user-specific facts. `isFallback(text)` lets callers substitute their own canned content (used by the interview routes).
- **No streaming** anywhere; every AI surface returns a single JSON-wrapped string.

### Where `askAI` is used

| Route | Purpose |
|---|---|
| `GET /api/career` | AI career/readiness analysis grounded in the user's own context, roadmap, resumes |
| `POST /api/career/resume` | ATS resume analysis → `{ summary, atsScore, suggestedKeywords, missingKeywords }` (with JSON-parse recovery) |
| `POST /api/assistant/chat` | Global assistant turn, grounded in the user's context + latest results |
| `POST /api/interview/tech` | Technical critique grounded in problem + submitted code |
| `POST /api/interview/hr` | Behavioral critique grounded in question/scenario/response |

---

## 6. Data flow across the five modules via CareerContext

1. **Register** → user row created; default `CareerContext` (role "Software Engineer", industry "Technology", seniority "Mid-Level", default skills, base scores 75/78/70/76) + seed roadmap milestone + welcome activity.
2. **Module 1 (career hub)** edits the context directly (`PUT /api/career` / `PUT /api/career/context`, whitelisted fields only). Resume analysis writes `atsScore`; roadmap milestones add/toggle; `GET /api/career` returns context + roadmap + resumes + AI analysis.
3. **Module 2 (assessment)** — `GET /api/assessment` (tests sans answer keys + history) → `POST /api/assessment/submit` (server-side grading) → `assessmentScore` = running average → activity log.
4. **Module 3 (tech interview)** — `POST /api/interview/tech` writes the interview row, updates `interviewScore` to the overall score, logs activity.
5. **Module 4 (HR interview)** — `POST /api/interview/hr` writes the behavioral row + feedback; does **not** update the context score (the HR dimension is blended into the readiness report at read time).
6. **Module 5 (readiness)** — `GET /api/readiness/report` reads context + latest results and computes the weighted 20/30/30/20 score → verdict (`Strong Hire` / `Hire / Qualified` / `Needs Improvement`).
7. **Assistant** — reads the same context + latest module outputs to ground every reply.

All state changes also write an `activity_logs` row (capped at the latest 50 per user) surfaced on the dashboard.

---

## 7. Upload / file storage path

`POST /api/upload`: JSON base64 body → MIME allow-list (PDF/DOC/DOCX/TXT) → server-side decoded-size cap 5 MiB (computed arithmetically, **no `Buffer`/`atob`** — edge-safe) → filename sanitization → persisted via `saveUploadedFile` into D1 `documents` (`file_data` = base64) → returns `storageKey: "d1://{id}"`.

**R2 is a pending-enablement item.** The storage abstraction (`StorageDriver.saveUploadedFile`) is the seam where R2 would replace the base64-in-D1 backend without touching the handler. Enabling R2 on the account is a billing/dashboard toggle and does **not** change endpoint behavior — the code currently routes uploads to D1 regardless.