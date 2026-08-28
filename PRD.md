# IntelliHire — Product Requirements Document (PRD)

> **Status:** Product/architecture baseline  
> **Repository:** `Student-Cybrarians/intellihire-v3`  
> **Purpose:** Define the product vision, users, features, interconnected architecture, implementation expectations, and launch-readiness operating model for IntelliHire.

---

## 1. What to Build

IntelliHire is an **AI-powered career intelligence and placement platform** that takes a user's resume or manually entered professional/educational background and progressively turns it into a structured career profile, target-role strategy, personalized learning roadmap, assessment/interview evidence, and final readiness view.

The platform is organized around eight product layers/components:

1. **Whole IntelliHire platform shell** — navigation, shared services, global AI access and cross-module experience.
2. **Integrated Authentication** — secure identity, session management, authorization and account lifecycle.
3. **User Dashboard** — the user's command center for profile, activity, performance, consistency, analytics, recommendations, roadmap, documents, sessions and module progress.
4. **Module 1 — AI Recruitment Screening & ATS Resume Intelligence** — career discovery/selection, resume intelligence, ATS optimization, skill-gap analysis and roadmap creation.
5. **Module 2 — Adaptive AI Online Assessment** — adaptive role-aware assessment, scoring and actionable feedback.
6. **Module 3 — AI Technical Interview Simulator** — coding/DSA/technical interview simulation with evaluation and follow-up questions.
7. **Module 4 — AI HR Interview + Behavioral Analysis** — HR interview simulation, communication/behavioral evaluation and feedback.
8. **Module 5 — AI Hiring Committee & Candidate Readiness** — holistic aggregation of evidence, gap analysis, readiness and next-step recommendations.

### Core product principle

**One user. One persistent career context. Five specialized modules. One global AI assistant.**

Module outputs must be normalized into a shared **Global User Career Context** so that relevant information can be reused across the user's journey instead of being re-entered into every module.

---

## 2. Targeted Users

### Primary users

- Students and graduates preparing for placements.
- Job seekers seeking role-specific preparation.
- Internship applicants.
- Career switchers.
- Technical candidates.
- Non-technical candidates.
- Candidates exploring startup and emerging technology careers.

### Secondary users

- Training institutes and placement cells.
- Recruiters and HR teams.
- Career coaches/mentors where applicable.

### User problems

- Unclear career direction.
- Difficulty translating a resume into realistic job targets.
- Poor ATS alignment.
- Unknown or misunderstood skill gaps.
- Disconnected learning and interview preparation.
- Lack of measurable progress.
- Lack of persistent context across tools/sessions.
- Difficulty understanding what to do next.

---

## 3. Global Career & Job Taxonomy

Module 1 must provide a structured career/field selection experience before job-role selection.

Recommended hierarchy:

```text
Career Category
  → Field
    → Domain
      → Career Family
        → Role
          → Specialization
            → Seniority
              → Employment Type
```

The taxonomy must support technical and non-technical careers, jobs, internships, startup roles, hybrid roles and emerging career fields.

Examples include software engineering, AI/ML, data, cybersecurity, cloud, robotics, electronics, semiconductor, finance, marketing, HR, business, operations, law, education, healthcare, design, media, consulting, entrepreneurship and emerging AI/technology roles.

The taxonomy is intended to be **versioned and extensible**, not a giant hard-coded UI list. Natural-language user goals may refine or disambiguate the taxonomy selection.

---

## 4. User Journey

```text
INTELLIHIRE
   ↓
INTEGRATED AUTHENTICATION
   ↓
USER DASHBOARD
   ↓
CAREER / PROFILE CONTEXT
   ↓
MODULE 1
   ↓
MODULE 2
   ↓
MODULE 3
   ↓
MODULE 4
   ↓
MODULE 5
   ↓
FINAL CAREER READINESS
   ↓
DASHBOARD UPDATE
   ↓
NEXT RECOMMENDED ACTION
```

The Dashboard is the **user command center**. The AI Core is the **intelligence center**. The modules are **specialized evidence engines**.

---

# 5. Integrated Authentication — Detailed Requirements

Authentication is the gateway into the persistent IntelliHire experience.

### Functional scope

- Secure registration/login flows as applicable.
- Google OAuth / OpenID Connect where configured.
- Secure sessions.
- Access/refresh-token strategy where applicable.
- Server-side authorization.
- Role-based access control.
- Protected application routes.
- Logout and session invalidation.
- Device/session visibility and revocation where implemented.
- Account settings and account lifecycle controls.

### Security expectations

- No credential leakage.
- Secure redirects.
- Proper expiration and invalidation.
- Secure token storage/transport.
- Least privilege.
- Protection against account enumeration where applicable.
- CSRF protection where applicable.
- Rate limiting.
- Audit/security event logging.

### Acceptance criteria

1. A successful authentication establishes a user identity.
2. The authenticated user reaches their personalized Dashboard before using the modules.
3. Unauthorized users cannot access another user's career data, documents, sessions or module state.
4. Logout invalidates the active session according to the session model.
5. Authentication errors are presented without leaking sensitive information.

---

# 6. User Dashboard — Detailed Requirements

The Dashboard is not only a navigation screen. It is the **Personal Career Command Center**.

### Dashboard responsibilities

#### Profile

- Personal/profile information.
- Education.
- Experience.
- Projects.
- Skills.
- Interests.
- Career history/context.

#### Career direction

- Active career field.
- Career path/domain.
- Target role.
- Job/internship type.
- Target company/industry where provided.
- Target job description where provided.

#### Activity and consistency

- Session history.
- Recent module activity.
- Practice activity.
- Completion/progress.
- Last activity.
- Learning consistency indicators where meaningful.

#### Performance analytics

- Module 1 ATS/resume evidence.
- Module 2 assessment score and section performance.
- Module 3 technical/coding performance.
- Module 4 HR/behavioral performance.
- Module 5 overall readiness.
- Score trends.
- Accuracy and attempts.
- Relevant communication/confidence metrics where actually measured.

#### Strengths and weaknesses

- Evidence-based strengths.
- Current weaknesses.
- Improvement priorities.
- Progress against previously identified gaps.

#### Recommendations and suggestions

The AI should recommend actions such as:

- Learn a missing skill.
- Practice a weak topic.
- Reattempt an assessment.
- Repeat a technical interview.
- Improve resume alignment.
- Complete a roadmap milestone.
- Review a weak behavioral area.
- Move to the next module.

Recommendations should be driven by evidence in the user's current context.

#### Resume Center

- Original resume.
- Extracted resume profile.
- ATS-generated versions.
- Target-specific versions.
- Version history.

#### Roadmap Center

- Current roadmap.
- Milestones.
- Learning priorities.
- Projects/practice.
- Readiness stages.

#### Session/Chat History

- All relevant sessions.
- Chat transcripts.
- Documents associated with sessions.
- Module state/results.

### Dashboard intelligence loop

```text
Observe activity
→ Analyze performance
→ Identify gaps
→ Recommend next action
→ Measure improvement
→ Update Global User Career Context
```

---

# 7. Module 1 — AI Recruitment Screening & ATS Resume Intelligence

## 7.1 Purpose

Module 1 is IntelliHire's **Career Intelligence Foundation**. It is not only a resume analyzer.

It establishes:

- the user's initial career context,
- relevant career options,
- target role intent,
- current-vs-required skill gaps,
- improved ATS resume outputs,
- personalized roadmap,
- initial strengths/weaknesses,
- context for downstream modules.

## 7.2 Inputs

The user may:

- Upload a resume (PDF/DOCX where supported), or
- Enter information manually.

Inputs can include:

- basic personal/contact details,
- education,
- experience,
- projects,
- technical skills,
- non-technical skills,
- certifications/achievements,
- career interests,
- preferred roles,
- target job/internship information.

Uploaded and manually entered information should be normalized into a unified user context.

## 7.3 Career selection BEFORE role selection

After initial AI analysis, the user should be able to select a career field/path using the Global Career & Job Taxonomy.

Example:

```text
Category → Field → Domain → Career Family → Role
```

The selection should be implemented as a cascading/filterable experience rather than one huge flat dropdown.

The user may also describe their career intent in natural language; the AI can map/refine it against the taxonomy.

## 7.4 Option 1 — Market-driven career discovery

The user chooses a path where IntelliHire analyzes the current profile and suggests the **top five suitable job roles**.

For each recommended role, the system can provide, where current evidence is available:

- Role title.
- Why the role fits.
- Role responsibilities / market-aligned job description.
- Expected skills.
- Technical and non-technical requirements.
- Experience expectations.
- Skill gaps.
- Relevant hiring/trend context.

The system then generates an upgraded **ATS/recruiter-friendly resume** using user-provided evidence plus the selected career context.

## 7.5 Option 2 — Dream job/internship analysis

The user describes:

- dream job/internship role,
- job description,
- company/industry if applicable,
- additional requirements or preferences.

The AI compares:

```text
Resume / User Profile
        +
Dream Role
        +
Job Description
        ↓
Required Skills
        ↔
Current Skills
        ↓
Skill Gaps
        ↓
Recommendations
        ↓
ATS Resume
```

## 7.6 Resume generation

Generated resumes must remain grounded in user-provided facts.

The system may improve:

- wording,
- structure,
- keyword alignment,
- bullet-point quality,
- clarity,
- relevance to target role.

The system must not fabricate:

- experience,
- projects,
- credentials,
- employment,
- achievements,
- technologies that the user did not provide or demonstrate.

### Versioning

The original resume must remain preserved. Generated versions should be immutable records with:

- version number,
- target role,
- job description/context,
- creation timestamp,
- generated content/metadata.

## 7.7 Freeze selected target

After a user chooses Option 1/2 and a target direction, the system should provide an explicit **freeze/confirm target** action.

The frozen target becomes the basis for the next roadmap step and should remain visible/editable through an intentional target-change workflow.

## 7.8 Roadmap

The roadmap should translate the chosen target into a practical progression:

```text
Current State
→ Skill Gaps
→ Fundamentals
→ Intermediate Skills
→ Advanced Skills
→ Projects
→ Practice
→ Resume/Portfolio
→ Interview Preparation
→ Job/Internship Readiness
```

The roadmap must be personalized to the active target and evidence collected in Module 1.

## 7.9 Strengths / weaknesses

The module should identify:

- strengths,
- weaknesses,
- why a weakness matters,
- required level,
- improvement strategy,
- recommended practice,
- reassessment path.

## 7.10 Global chatbot capability

Module 1's chatbot capabilities include career, jobs, internships, education, training, skills, resume, work life, coding, communication, English learning, DSA, programming languages, technology, AI, APIs, cloud computing and related topics.

The chatbot should support **context selection / answer modes** such as:

- simple explanation,
- educational,
- career advice,
- technical,
- interview preparation,
- resume-focused,
- roadmap-focused,
- quick answer,
- detailed answer.

However, the chatbot is not isolated to Module 1; it becomes a **global IntelliHire AI Assistant** available throughout the platform.

---

# 8. Module 2 — Adaptive AI Online Assessment

Module 2 simulates role-relevant online assessment experiences.

### Brief scope

- Aptitude and domain sections.
- Adaptive question selection/difficulty where implemented.
- Candidate answer capture.
- Real-time or near-real-time evaluation according to the implementation.
- Section-wise scoring.
- Explanations/hints where appropriate.
- Performance analytics.
- Recommendations based on weaknesses.

### Key dependency

Module 2 should consume relevant Module 1 context such as the target role, career domain, required skills and known gaps.

---

# 9. Module 3 — AI Technical Interview Simulator

Module 3 simulates technical interviews with real coding and follow-up reasoning.

### Brief scope

- Technical/role selection.
- Coding problems.
- DSA.
- Technical reasoning.
- System-design basics where relevant.
- Real-time code execution where supported.
- Test-case validation.
- Complexity analysis.
- AI interviewer follow-up questions.
- Technical score.
- Feedback and personalized improvement roadmap.

Module 3 should use relevant evidence from Module 1 and Module 2 to personalize interviews and follow-up questions.

---

# 10. Module 4 — AI HR Interview + Behavioral Analysis

Module 4 simulates HR and behavioral interviews.

### Brief scope

- Opening/introductory questions.
- Behavioral questions.
- Situational questions.
- STAR-style answer evaluation.
- Communication analysis.
- Confidence indicators where actually measured.
- Tone/sentiment/behavioral analysis where technically and legally appropriate.
- Immediate feedback.
- Strengths and improvement areas.

Module 4 should use relevant Module 1 career context, Module 2 performance and Module 3 technical evidence.

---

# 11. Module 5 — AI Hiring Committee & Candidate Readiness

Module 5 is the final evidence aggregation layer.

### Brief scope

- Collect normalized results from Modules 1–4.
- Holistic performance view.
- Skill-gap summary.
- Strengths.
- Areas to improve.
- Readiness score.
- Hiring recommendation logic as a training/readiness simulation.
- Recommended certifications/resources where appropriate.
- Final career readiness roadmap.
- Export/share reports where implemented.

Module 5 should not fabricate a real employer hiring decision. It should clearly represent a simulation/training assessment unless the product is explicitly operating as a real recruiting workflow with the required legal/business controls.

---

# 12. Cross-Module Intelligence

The modules are **interlinked**, not siloed.

```text
Module 1
  → career target + resume + skills + skill gaps + roadmap
        ↓
Module 2
  → assessment performance + weak concepts
        ↓
Module 3
  → technical interview + coding evidence
        ↓
Module 4
  → HR + communication + behavioral evidence
        ↓
Module 5
  → holistic readiness + next actions
        ↓
Dashboard
```

### Bidirectional context principle

The flow should not be one-way. Each module contributes new evidence back into the Global User Career Context.

Example:

```text
Self-reported skill: strong
Observed assessment performance: weak
```

The system should preserve both signals and their provenance instead of blindly overwriting user claims.

---

# 13. Global AI Assistant

The AI chatbot must be accessible across:

- Dashboard,
- Module 1,
- Module 2,
- Module 3,
- Module 4,
- Module 5,
- relevant profile/resume/roadmap screens.

### Context routing

```text
User Question
     ↓
Intent Detection
     ↓
Context Router
     ├─ Global User Context
     ├─ Current Module Context
     ├─ Current Session
     └─ Relevant History
     ↓
AI Orchestrator
     ↓
Model
     ↓
Context-aware Response
```

Same UI, different context.

The assistant must not expose irrelevant or unauthorized session data merely because it exists elsewhere in the account.

---

# 14. Session, Document and Conversation Persistence

The platform should preserve the complete user journey where applicable:

- Uploaded documents.
- Extracted document information.
- User-entered information.
- Career taxonomy selections.
- Option selections.
- Target roles.
- Job descriptions.
- Skill analyses.
- Generated ATS resume variants.
- Roadmap versions.
- Module results.
- Chat messages and responses.
- User feedback.
- Activity history.
- Timestamps.
- Session/module state.

### Session model

A user can have multiple independent sessions, for example:

```text
User
 ├─ Career Session A: AI Engineer
 ├─ Career Session B: Product Manager
 └─ Internship Session C: Cybersecurity
```

A new chat can start a new session context, while reopening an existing chat restores the appropriate stored context.

---

# 15. Data / Memory Principles

Use a layered persistent model:

```text
IDENTITY
→ PROFILE
→ CAREER STATE
→ DOCUMENT STATE
→ INTERACTION STATE
→ PERFORMANCE STATE
→ RECOMMENDATION STATE
```

### Versioning rule

Do not overwrite important source evidence.

Use immutable or versioned records for:

- original resume,
- generated resumes,
- roadmap revisions,
- major assessment/interview attempts,
- relevant AI outputs where auditability is required.

---

# 16. Product UX/UI Requirements

The IntelliHire visual direction should retain the supplied product language:

- Deep navy foundations.
- Electric blue accents.
- Cyan highlights.
- Violet/purple secondary accents.
- Green success/readiness states.
- Amber/orange attention states.
- Strong card hierarchy.
- Clear progress visuals.
- High information density without clutter.
- Responsive layouts for web/mobile breakpoints.
- Consistent component and interaction patterns.

### UX priorities

- Clear primary action.
- Obvious module state.
- Explainable scores.
- Strong empty/loading/error/success states.
- Accessible forms and navigation.
- Persistent global AI access.
- Easy resume/version/session retrieval.
- Clear next recommended action.

Do not introduce unrelated frameworks, arbitrary visual styles or unnecessary dependencies just for decoration.

---

# 17. Technical Architecture Expectations

The target architecture is conceptually:

```text
User
 ↓
Responsive Frontend
 ↓
Integrated Authentication
 ↓
Dashboard / Application State
 ↓
API Gateway / REST APIs / Realtime APIs
 ↓
Business Services
 ↓
Global AI Orchestrator + Module Services
 ↓
Database / Cache / File Storage
 ↓
External AI / payment / infrastructure services
 ↓
Deployment + Observability
```

The exact technology must be verified from the repository implementation before changes are made.

---

# 18. Cloudflare Requirement

Use Cloudflare where its free-tier capabilities are applicable and technically suitable.

Potential areas to evaluate include:

- DNS.
- CDN/proxy.
- TLS/HTTPS.
- Caching.
- WAF/rate-limiting capabilities available to the project's plan.
- Pages/Workers where they fit the runtime.
- Turnstile for bot protection where applicable.
- DDoS/network protection available to the plan.
- Rules/configuration as appropriate.
- Web analytics/observability where available.

**Important:** “all free Cloudflare features” must not be interpreted as blindly enabling every product. Each feature must be evaluated for compatibility, limits, security, privacy, operational value and actual availability on the selected plan.

---

# 19. Domain Requirement

The deployment should support a domain under **`[webappname].is-a.dev`**.

The exact subdomain name must be confirmed before DNS/domain changes are made if it has not already been finalized.

Required work includes evaluating:

- DNS record setup.
- HTTPS.
- canonical URL.
- authentication callback URLs.
- CORS/origin configuration.
- environment variables.
- Cloudflare/Vercel or other hosting configuration.

---

# 20. GitHub Repository Requirement

The project source of truth requested for implementation is:

`https://github.com/Student-Cybrarians/intellihire-v3.git`

Default branch currently observed from repository metadata:

`master-branch`

At the time this PRD was prepared, repository metadata was accessible but the repository contents appeared empty. Implementation should therefore verify the repository again before assuming any existing code, history or project structure.

---

# 21. Specialist Agent / Employee Allocation Requirement

A **Boss/Orchestrator** should allocate a persistent engineering agent/employee to break the work into streams and continue execution until the system is genuinely ready for launch.

### Recommended workstreams

**A. Product & Architecture Lead**
- Maintains PRD and architecture.
- Resolves requirements conflicts.
- Tracks dependencies and decisions.

**B. Frontend / UX Engineer**
- Dashboard.
- Navigation.
- Module experiences.
- Responsive UI.
- Accessibility.

**C. Backend / API Engineer**
- Services.
- APIs.
- Validation.
- Authorization.
- Integration boundaries.

**D. Identity & Security Engineer**
- Authentication.
- Sessions.
- RBAC.
- Security controls.
- Secrets.
- Security verification.

**E. AI / Agent Engineer**
- Global AI orchestrator.
- Context engineering.
- Module prompts/agents.
- Structured outputs.
- Evaluation/guardrails.

**F. Data / Memory Engineer**
- PostgreSQL schema.
- Session persistence.
- Document metadata.
- Resume versioning.
- Performance/history models.

**G. Module Specialists**
- M1 career/ATS.
- M2 adaptive assessment.
- M3 technical interview.
- M4 HR/behavioral.
- M5 aggregation/readiness.

**H. DevOps / SRE Engineer**
- Cloudflare.
- Deployment.
- CI/CD.
- Monitoring.
- Recovery.

**I. QA / Verification Engineer**
- Unit/integration/API/E2E testing.
- Accessibility.
- Performance.
- Security regression.
- Release evidence.

### Continuous execution loop

```text
DISCOVER
→ AUDIT
→ ARCHITECT
→ PLAN
→ IMPLEMENT
→ SECURE
→ TEST
→ REVIEW
→ VERIFY
→ DOCUMENT
→ REPEAT
```

The allocated agent should keep a structured backlog, work only on evidence-backed tasks, preserve existing functionality, and stop for consolidated questions whenever implementation would otherwise require invention or destructive action.

---

# 22. Engineering Governance

Follow this priority order:

1. Explicit product requirements.
2. IntelliHire architecture/PRD documentation.
3. `CLAUDE.md` / `AGENTS.md`.
4. Repository rules.
5. Existing implementation.
6. Test/CI/CD evidence.
7. Specialist agents/skills.
8. General engineering conventions.

### Minimal-change principle

Use the smallest correct change that preserves the architecture and avoids unrelated refactoring.

### Reality-check principle

Do not claim a feature works until:

- the route is reachable,
- the backend supports it,
- authorization is verified,
- the real integration executes,
- tests/builds pass where applicable,
- and evidence is recorded.

---

# 23. Security Requirements

Audit and protect:

- authentication,
- authorization,
- file uploads,
- XSS,
- injection,
- CSRF,
- CORS,
- SSRF,
- path traversal,
- open redirects,
- IDOR,
- privilege escalation,
- rate limiting,
- secret handling,
- sensitive logs,
- API abuse,
- prompt injection,
- unsafe AI tool use.

Never expose model/provider credentials or user documents to unauthorized contexts.

---

# 24. Testing & Quality Gates

For applicable implementation work:

```text
FORMAT
→ LINT
→ TYPECHECK
→ UNIT TESTS
→ INTEGRATION TESTS
→ API TESTS
→ ACCESSIBILITY
→ PRODUCTION BUILD
→ DEPLOYMENT VERIFICATION
```

Only use commands actually defined by the repository/toolchain.

Recommended evidence includes:

- test results,
- build logs,
- security findings,
- accessibility findings,
- deployment verification,
- Git diff review.

---

# 25. Production Readiness

Applicable lifecycle and system states should be reviewed:

### Customer lifecycle

- Login.
- Registration.
- Verification where applicable.
- Onboarding.
- Account settings.
- Support/help.
- Billing/payment states if monetization exists.

### System states

- 404.
- 403.
- 500.
- Maintenance.
- Offline.
- Empty.
- Loading.
- No results.
- Error.
- Success.
- Session expired.

### Legal/business pages

Include only what is genuinely applicable to the product and business model. Do not invent legal identity, addresses, policies, warranties, refund terms or compliance claims.

---

# 26. Definition of Done

IntelliHire is not considered launch-ready merely because screens exist.

The baseline is:

```text
[ ] Architecture documented
[ ] User journey functional
[ ] Authentication secure
[ ] Dashboard functional
[ ] Module 1 career taxonomy flow functional
[ ] Module 1 ATS/resume workflow functional
[ ] Module 2 assessment functional
[ ] Module 3 technical interview functional
[ ] Module 4 HR/behavioral workflow functional
[ ] Module 5 aggregation/readiness functional
[ ] Global chat available and context-aware
[ ] Cross-module context verified
[ ] Session/document/chat persistence verified
[ ] Resume versioning verified
[ ] Recommendations verified
[ ] Security reviewed
[ ] Accessibility reviewed
[ ] Tests passing
[ ] Build passing
[ ] Deployment verified
[ ] Cloudflare/domain integration verified
[ ] Documentation synchronized with implementation
[ ] No secrets committed
[ ] No fake functionality
[ ] Remaining risks documented
```

---

# 27. First Implementation Action

Before modifying the repository, the allocated engineering agent must:

1. Inspect repository root and branch.
2. Inspect `CLAUDE.md` and `AGENTS.md` if present.
3. Inspect architecture/docs.
4. Verify current repository contents.
5. Determine the actual technology stack.
6. Build the verified architecture map.
7. Create a phased implementation backlog.
8. Identify blockers/missing facts.
9. Implement the highest-priority safe slice.
10. Test and verify before proceeding.

---

# 28. Launch Principle

**Never optimize for the appearance of progress. Optimize for verified engineering truth.**

IntelliHire should reach the market only when the user journey is real end-to-end, secure, observable, recoverable, maintainable and demonstrably useful.
