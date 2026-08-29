# IntelliHire v3 — Project Living Memory

**Repository**: `https://github.com/Student-Cybrarians/intellihire-v3.git`  
**Local Path**: `/Users/apple/Movies/AGENT/projects/intellihire`  
**Domain**: `https://intellihire.is-a.dev`  
**Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Cloudflare Pages/Workers/D1/R2/KV.

---

## Completed Milestones
- [x] **Phase 0: Documentation & Architecture** — Comprehensive PRD, Architecture, Rules, Phases, Design, Schema, Team Roster established.
- [x] **Phase 1: Authentication & App Foundation** —
  - Email/Password Registration (`/register`) with role support (`candidate` / `recruiter`).
  - Email/Password Login (`/login`) with demo autofill.
  - JWT session token generation and secure cookie storage (`intellihire_session`).
  - API Routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
  - Database Service (`src/lib/db.ts`) with User, Career Context, and Activity models.
  - Protected API routes and cookie validation helper (`src/lib/auth.ts`).
- [x] **Phase 2: Personal Career Command Center (Dashboard)** —
  - Authenticated Dashboard (`/dashboard`) with Career Context summary (Target Role, Readiness Score, ATS Score, Target Industry).
  - Navigation tiles for all 5 specialized modules.
  - Live activity feed.
  - Production build passing with all 13 pages/routes compiled.

---

## Active Milestone: Phase 3 (Core Module CRUD Functionality)
- [ ] **Module 1: Career Intelligence & Resume ATS Hub** (`/modules/career`)
  - Target role, industry, seniority level configuration UI.
  - Skill taxonomy manager (add, remove, verify skills).
  - Resume upload metadata & ATS score breakdown.
  - Career roadmap milestone generator.
  - API Routes: `/api/career/context` (GET/PUT), `/api/career/skills` (POST/DELETE), `/api/career/roadmap` (GET/POST), `/api/career/resume` (POST).
- [ ] **Module 2: Adaptive AI Online Assessment** (`/modules/assessment`)
  - Skill test catalog, active testing engine, question timer, score calculation.
  - API Routes: `/api/assessment/tests`, `/api/assessment/submit`.
- [ ] **Module 3: Technical Interview Simulator** (`/modules/tech-interview`)
  - Problem prompt, live code editor with syntax themes, language picker (TypeScript, Python, Go, Rust), AI code evaluation & rubric feedback.
  - API Routes: `/api/interview/tech/start`, `/api/interview/tech/submit`.
- [ ] **Module 4: HR / Behavioral Interview Simulator** (`/modules/hr-interview`)
  - Scenario generator, STAR method analysis, AI feedback on communication & clarity.
  - API Routes: `/api/interview/hr/start`, `/api/interview/hr/respond`.
- [ ] **Module 5: AI Hiring Committee & Readiness Aggregator** (`/modules/readiness`)
  - Cross-module intelligence aggregator, multi-dimensional radar score, hiring committee verdict (Strong Hire / Hire / Leaning No), actionable improvement gaps.
  - API Routes: `/api/readiness/report`.
- [ ] **Global AI Assistant Interface** (`/assistant` & floating drawer)
  - Unified contextual AI assistant capable of answering questions about user resume, assessments, roadmap, and interview prep.
  - API Routes: `/api/assistant/chat`.

---

## Architecture & Security Decisions
1. **Edge DB Persistence Layer**: Single source of truth in `src/lib/db.ts` bridging local development and Cloudflare D1.
2. **Stateless JWT + Secure HttpOnly Cookies**: Token payload contains `userId`, `email`, `role`. Expiration: 7 days.
3. **Strict Validation**: All API mutations validated with Zod schemas.
4. **Theme & Tokens**: IntelliHire dark navy (`#0b0f19`), electric blue (`#3b82f6`), emerald (`#10b981`), purple (`#8b5cf6`), amber (`#f59e0b`).
