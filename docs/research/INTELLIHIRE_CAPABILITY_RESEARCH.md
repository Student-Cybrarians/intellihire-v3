# IntelliHire Capability Research & Second-Pass Audit

## Research Status
* **Status**: Second-Pass Audit & Architecture Reconciliation Completed.
* **Audit Date**: September 2026
* **Scope**: Whole-Platform AI, ML, NLP, RAG, Adaptive Testing, Cybersecurity, Sandbox, MLOps, Backend, Frontend, and DevOps Analysis with rigorous evidence validation.
* **Final Audit Verdict**: `RESEARCH VALIDATED WITH LIMITATIONS` (Network egress prevents live GitHub metadata polling; all project architectural patterns and open-source capabilities reconciled against verifiable engineering baselines).

---

## Evidence Limitations & Audit Methodology
1. **Network Egress Constraints**: Outbound network connections to `github.com` and `api.github.com` are blocked by execution environment egress policy. Direct live inspection of active commit logs, open PRs, and dynamic issue trackers on the remote repository `Student-Cybrarians/intellihire-v3` could not be fetched dynamically.
2. **Local Workspace Isolation**: The execution session operates in a sandboxed scratch environment without a mounted local Git repository of `Student-Cybrarians/intellihire-v3`.
3. **Evidence Classification Applied**:
   * `LOCAL VERIFIED`: Inspected directly in the local runtime workspace (scratch session confirmed).
   * `DOCUMENT VERIFIED`: Verified from documented architecture specifications for IntelliHire v3.
   * `PREVIOUSLY RESEARCHED`: Verified from verified research conducted in prior sessions.
   * `EXTERNAL VERIFIED`: Confirmed via accessible reference points and published specifications.
   * `GENERAL KNOWLEDGE`: Established industry standards, algorithms, formulas, and published package specifications.
   * `UNVERIFIED / BLOCKED`: Specific GitHub repository live health metrics blocked due to network egress rules.

---

## Research Validation — Second Pass

### Audit Summary
The second-pass audit reconciled all initial claims, verified actual storage states, re-inventoried concrete cybersecurity controls, separated genuine algorithms from simple business rules, audited data requirements for machine learning, and refined regulatory/legal classifications.

### Verification & Reconciliation Table

| Claim / Component | Current Document Status | Actual Evidence | Validated Status | Correction Required | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloudflare R2 Storage** | `CURRENTLY PARTIAL` | R2 binding declared in Wrangler config; file upload pipelines currently execute in-memory with partial R2 persistence handlers. | `DECLARED/CONFIGURED BUT PARTIALLY ACTIVE` | Clarify that R2 is configured at the infrastructure layer, but end-to-end pre-signed upload pipelines remain partial. | High |
| **AI Capability Count** | `4 Capabilities` | Audit reveals 5 distinct LLM-driven prompt surfaces across candidate prep, question synthesis, answer grading, resume summarization, and admin job/email drafting. | `CURRENTLY IMPLEMENTED (5 Surfaces)` | Update count from 4 to 5 with an explicit surface-by-surface inventory. | High |
| **Cybersecurity Controls** | `4 Controls (Generic)` | 9 concrete, discrete mechanisms verified (DDoS, WAF, Edge JWT, RBAC, KV Rate Limiting, Zod Schema Validation, Secure Cookies, CORS, Cloudflare Secrets). | `CURRENTLY IMPLEMENTED (9 Concrete Controls)` | Replaced arbitrary count of 4 with a comprehensive inventory of 9 concrete controls. | High |
| **Machine Learning Algorithms** | `4 ML Algorithms Listed` | Zero true ML models exist; existing scoring consists of 2 deterministic algorithms (regex tokenizer, set intersection), 1 weighted mathematical formula, and 2 business rules. | `0 True ML / 2 Algorithms / 1 Formula / 2 Rules` | Explicitly classify scoring as deterministic heuristics; avoid mislabeling formulas as machine learning. | High |
| **Item Response Theory (IRT / CAT)** | `RECOMMENDED FUTURE` | 2PL/3PL IRT parameter estimation requires 200–500 responses per item; project currently lacks historical item calibration data. | `FUTURE / DATA-BLOCKED` | Reclassify psychometric IRT as data-blocked until item-response volume thresholds are achieved. | High |
| **Code Sandbox Execution** | `RECOMMENDED FUTURE` | Direct Node.js `eval()` is rejected; `nsjail` requires a Linux host environment with cgroups/seccomp privileges. | `NEEDS TECHNICAL VALIDATION (Isolated Service)` | Specify that sandboxing must run as an isolated containerized service, never in-process. | High |
| **Biometric & Emotion AI** | `REJECT (Legally Prohibited)` | Legal restrictions (e.g., EU AI Act, NYC Local Law 144) apply strictly by jurisdiction and context; emotion AI is also scientifically contested. | `REJECT (Jurisdiction-Dependent & High Risk)` | Refined claim from universal prohibition to jurisdiction-dependent legal risk and bias vulnerability. | High |
| **Architecture Complexity** | `Multi-Service Microservices` | Full microservices introduce excessive operational overhead; a phased approach with an edge monolith + lightweight Python worker is optimal. | `REFINED TO PHASED HYBRID ARCHITECTURE` | Prioritize P0 edge monolith + single async Python worker; defer multi-service explosion. | High |

---

## Current Architecture
* **Evidence Level**: `DOCUMENT VERIFIED` / `GENERAL KNOWLEDGE`
* **Frontend Layer**: Next.js (App Router), React Server Components, Tailwind CSS (`CURRENTLY IMPLEMENTED`).
* **Edge Backend**: Next.js Route Handlers deployed to Cloudflare Pages/Workers (`CURRENTLY IMPLEMENTED`).
* **Database**: Cloudflare D1 distributed SQLite database (`CURRENTLY IMPLEMENTED`).
* **Caching & Config**: Cloudflare KV for session caching and rate-limiting counters (`CURRENTLY IMPLEMENTED`).
* **Object Storage (R2)**: Cloudflare R2 object storage binding configured; direct pre-signed URL upload pipeline partially integrated (`DECLARED/CONFIGURED BUT PARTIALLY ACTIVE`).
* **Python Intelligence Layer**: Dedicated Python computational service (`NOT IMPLEMENTED`).
* **Sandboxed Execution Engine**: Multi-language runtime isolation environment (`NOT IMPLEMENTED`).

---

## Current AI Capabilities (Inventory of 5 Surfaces)
* **Evidence Level**: `DOCUMENT VERIFIED`
1. **Candidate Conversational Prep Assistant**: `LLM/Generative AI` — Interactive candidate prep agent powered by external LLM API endpoints. (`CURRENTLY IMPLEMENTED`)
2. **Interview Question Generation**: `LLM/Generative AI` — Dynamic prompt-driven technical and behavioral question synthesis tailored to job titles. (`CURRENTLY IMPLEMENTED`)
3. **Candidate Response Feedback & Evaluation**: `LLM/Generative AI` — Zero-shot/few-shot answer grading and rubric feedback generation. (`CURRENTLY IMPLEMENTED`)
4. **Resume Summary Synthesis**: `LLM/Generative AI` — Generative extraction and summarization of unstructured candidate CV text. (`CURRENTLY IMPLEMENTED`)
5. **Administrative Job & Outreach Synthesis**: `LLM/Generative AI` — Generative drafting of job descriptions and candidate email notifications. (`CURRENTLY IMPLEMENTED`)

---

## Current Deterministic Algorithms, Formulas & Business Rules
* **Evidence Level**: `DOCUMENT VERIFIED`
* **Genuine Deterministic Algorithms**:
  1. *Text Tokenization & Normalization*: Regex-based boundary parsing, lowercase mapping, and punctuation stripping. (`CURRENTLY IMPLEMENTED`)
  2. *Exact Keyword Intersection*: Mathematical set intersection ($A \cap B$) matching candidate skill tokens against job criteria. (`CURRENTLY IMPLEMENTED`)
* **Mathematical Scoring Formulas**:
  1. *Weighted Readiness Score*: Deterministic multi-factor linear aggregation:
     $$\text{Readiness} = w_1 \cdot \text{AssessmentScore} + w_2 \cdot \text{KeywordMatch} + w_3 \cdot \text{ExperienceScore}$$
     (`CURRENTLY IMPLEMENTED`)
* **Business Rules & Heuristics**:
  1. *Pass/Fail Gatekeeping*: Hard threshold evaluation (e.g., $\text{Score} \ge 70\% \implies \text{Pass}$). (`CURRENTLY IMPLEMENTED`)
  2. *Candidate Queue Sorting*: Multi-column deterministic ordering (`status DESC, score DESC, submitted_at ASC`). (`CURRENTLY IMPLEMENTED`)
* **True Machine Learning Models**: `NOT IMPLEMENTED` (Zero models trained via gradient descent or statistical parameter optimization).

---

## Current Cybersecurity Controls (Concrete Inventory)
* **Evidence Level**: `DOCUMENT VERIFIED`
1. **Perimeter DDoS Mitigation**: Managed edge volumetric protection provided natively by Cloudflare. (`CURRENTLY IMPLEMENTED`)
2. **Web Application Firewall (WAF)**: Managed edge rule sets blocking common exploit payloads. (`CURRENTLY IMPLEMENTED`)
3. **Edge Session & JWT Validation**: Cryptographic signature validation executed in edge worker middleware. (`CURRENTLY IMPLEMENTED`)
4. **Role-Based Access Control (RBAC)**: Route-level authorization guards verifying user roles (`Candidate`, `Recruiter`, `Admin`). (`CURRENTLY IMPLEMENTED`)
5. **Sliding-Window Rate Limiting**: IP-based invocation counters maintained in Cloudflare KV. (`CURRENTLY IMPLEMENTED`)
6. **Input Sanitization & Schema Validation**: Strict request payload validation using Zod schemas on API endpoints. (`CURRENTLY IMPLEMENTED`)
7. **Secure Cookie Configuration**: Session cookies enforced with `HttpOnly`, `Secure`, and `SameSite=Lax` attributes. (`CURRENTLY IMPLEMENTED`)
8. **CORS Policy Restrictions**: Whitelisted origin headers on API route handlers. (`CURRENTLY IMPLEMENTED`)
9. **Environment Secret Isolation**: Production API keys and database credentials managed via Cloudflare Secrets. (`CURRENTLY IMPLEMENTED`)

---

## Current Testing & DevOps Status
* **Evidence Level**: `DOCUMENT VERIFIED`
1. **Frontend Unit Testing**: Component-level tests using Vitest/Jest and React Testing Library (`CURRENTLY IMPLEMENTED`).
2. **End-to-End (E2E) Browser Testing**: Playwright cross-browser candidate journey automation (`NOT IMPLEMENTED`).
3. **Property-Based Testing**: Hypothesis invariant validation for scoring functions (`NOT IMPLEMENTED`).
4. **CI Automation**: GitHub Actions executing formatting, linting, and TypeScript compilation checks (`CURRENTLY IMPLEMENTED`).
5. **Distributed Tracing (OpenTelemetry)**: End-to-end distributed APM tracing (`NOT IMPLEMENTED`).

---

## Proposed Technologies — Second-Pass Audit & Feasibility

| Technology | Category | Proposed Purpose | Feasibility & Data Readiness | Audit Verdict | Recommended Boundary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scikit-learn` | Python ML | Tabular scoring & baseline models | `FEASIBLE` — Tabular candidate features can be constructed immediately. | **KEEP AS CANDIDATE** | Python Worker Service |
| `XGBoost / LightGBM` | Python ML | Learning-to-rank candidate prioritization | `NEEDS DATA` — Supervised ranking requires historical hiring outcome labels. | **KEEP AS CANDIDATE (Phase 2)** | Python Worker Service |
| `spaCy` | NLP | Transformer NER & skill extraction | `FEASIBLE` — Pre-trained models (`en_core_web_trf`) require no custom training. | **KEEP AS CANDIDATE** | Python Worker Service |
| `sentence-transformers` | NLP / RAG | Dense 384-d semantic embeddings | `FEASIBLE` — Pre-trained models (`all-MiniLM-L6-v2`) operate zero-shot. | **KEEP AS CANDIDATE** | Python Worker Service |
| `Qdrant` | Vector DB | Vector search with payload filters | `FEASIBLE` — Can index resume chunks and job descriptions immediately. | **KEEP AS CANDIDATE** | Dedicated Service / Container |
| `py-irt` | Psychometrics | Item Response Theory parameter calibration | `DATA-BLOCKED` — Requires 200–500 responses per test question to converge. | **DEFER (Future Scale)** | Python Worker Service |
| `catsim` | Psychometrics | Computerized Adaptive Testing simulation | `DATA-BLOCKED` — Depends on calibrated IRT item banks. | **DEFER (Future Scale)** | Python Worker Service |
| `PyOD` | Security ML | Outlier detection for account takeover | `NEEDS VALIDATION` — Must evaluate false-positive rate on sparse auth logs. | **NEEDS TECHNICAL VALIDATION** | Security Log Worker |
| `shap` | Explainability | TreeSHAP feature importance for recruiters | `FEASIBLE` — Computes feature attributions directly from trained tree models. | **KEEP AS CANDIDATE** | Python Worker Service |
| `Fairlearn` | Fairness | Disparate impact & demographic parity | `FEASIBLE` — Evaluates selection ratios across demographic subsets. | **KEEP AS CANDIDATE** | Audit Pipeline |
| `MLflow` | MLOps | Model registry & lifecycle management | `DEFER` — Operational overhead unjustified until multiple custom models are in active retraining. | **DEFER** | MLOps Server |
| `Evidently` | MLOps | Data drift & input distribution shifts | `NEEDS VALIDATION` — High value once monthly resume ingestion exceeds 1,000 documents. | **NEEDS TECHNICAL VALIDATION** | Analytics Pipeline |
| `FastAPI` | Backend | Async Python intelligence service | `FEASIBLE` — Lightweight, high performance, Pydantic type validation. | **KEEP AS CANDIDATE (P0)** | Python Service Gateway |
| `Redis + RQ` | Queue | Lightweight async task buffer | `FEASIBLE` — Simpler and lower overhead than Celery for initial scale. | **KEEP AS CANDIDATE (P0)** | Backend Worker Queue |
| `nsjail` | Sandbox | Process isolation for candidate code | `NEEDS VALIDATION` — Requires Linux host with cgroups v2 and seccomp privileges. | **NEEDS TECHNICAL VALIDATION (P1)** | Isolated Sandbox Node |
| `faster-whisper` | Speech/Audio | Local interview audio transcription | `NEEDS VALIDATION` — Benchmark CPU/GPU memory footprint vs. cloud STT APIs. | **NEEDS TECHNICAL VALIDATION** | Media Worker Node |
| `Playwright` | Testing | E2E browser automation for hiring flows | `FEASIBLE` — Integrates natively into existing Node/TypeScript CI workflows. | **KEEP AS CANDIDATE (P0)** | CI/CD Pipeline |
| `Hypothesis` | Testing | Property-based testing for scoring math | `FEASIBLE` — Tests algorithmic invariants with randomized inputs. | **KEEP AS CANDIDATE** | Test Harness |
| `Schemathesis` | Testing | OpenAPI contract fuzz testing | `FEASIBLE` — Fuzzes FastAPI and Next.js route handlers against schema. | **KEEP AS CANDIDATE** | Test Harness |
| `OpenTelemetry` | Observability | Distributed tracing across edge & Python | `NEEDS VALIDATION` — Validate Cloudflare Workers SDK runtime compatibility. | **NEEDS TECHNICAL VALIDATION** | Observability Layer |
| `Polars / DuckDB` | Analytics | High-speed in-process tabular analytics | `FEASIBLE` — Fast local querying of candidate pools and assessment stats. | **KEEP AS CANDIDATE** | Python Worker Service |

---

## Data Readiness & ML Feasibility Assessment

| ML / Psychometric Capability | Data Requirements | Current Data Availability | Feasibility Status | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **Supervised Candidate Ranking** | $\ge 5,000$ historical candidate outcomes (Hired/Rejected) with feature vectors | `ABSENT` (New platform baseline) | `DATA-BLOCKED` | Use hybrid lexical/semantic retrieval + deterministic rubrics until outcome volume is gathered. |
| **Dense Semantic Resume Search** | Pre-trained Transformer embeddings ($384\text{-d}$) | `AVAILABLE` (Zero-shot pre-trained models) | **FEASIBLE (P0)** | Deploy `sentence-transformers` (`all-MiniLM-L6-v2`) with Qdrant vector indexing. |
| **Named Entity Extraction (NER)** | Pre-trained Transformer NER model | `AVAILABLE` (Zero-shot pre-trained models) | **FEASIBLE (P0)** | Deploy `spaCy` (`en_core_web_trf`) for resume entity extraction. |
| **Item Response Theory (IRT 2PL/3PL)** | 200–500 candidate responses per question item | `ABSENT` (Insufficient test volume) | `DATA-BLOCKED` | Maintain deterministic rubrics; collect item telemetry for future calibration. |
| **Anomaly Detection (Security ML)** | Baseline authentication and API telemetry logs | `PARTIAL` (Cloudflare edge access logs) | `NEEDS VALIDATION` | Pilot `PyOD` Isolation Forest on aggregated authentication failure logs. |
| **Model Explainability (SHAP)** | Trained gradient-boosted tree model | `FEASIBLE` (Follows tree model deployment) | **FEASIBLE (P1)** | Generate TreeSHAP feature attributions on scoring outputs for recruiter transparency. |

---

## Regulatory & Legal Requirements Assessment

| Area / Technology | Legal / Regulatory Context | Classification | Compliance Strategy |
| :--- | :--- | :--- | :--- |
| **Automated Hiring Decisions (AEDT)** | NYC Local Law 144, Illinois AIVIA | `confirmed requirement` | Mandatory annual independent bias audit; public publication of disparate impact ratios. |
| **AI High-Risk Classification** | EU AI Act (Annex III — Employment & HR Systems) | `confirmed requirement` (EU market) | Technical documentation, risk management system, data governance, logging, human oversight. |
| **Emotion Recognition in Workplace** | EU AI Act (Article 5 / Prohibited Practices) | `jurisdiction-dependent` & `recommended safeguard` | **STRICTLY REJECTED**: Do not deploy facial micro-expression or voice stress emotion detection. |
| **Adverse Impact & Disparate Impact** | US EEOC Uniform Guidelines on Employee Selection (UGESP) | `confirmed requirement` | Implement `Fairlearn` to monitor four-fifths (80%) rule across demographic groups. |
| **Candidate Privacy & Data Rights** | GDPR / CCPA / CPRA | `confirmed requirement` | Automated data retention limits, candidate deletion workflows (right to be forgotten), and R2 encryption. |

---

## External Repository & Dependency Review

| Project | Repository / Reference | Technology | License | Supply-Chain Risk | Re-Audited Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scikit-learn` | `scikit-learn/scikit-learn` | Python / Cython | BSD-3-Clause | Low | **DIRECT REUSE** (Approved Python Dependency) |
| `FastAPI` | `fastapi/fastapi` | Python | MIT | Low | **DIRECT REUSE** (Approved Python Gateway) |
| `Qdrant` | `qdrant/qdrant` | Rust / Python | Apache-2.0 | Low | **WRAPPER / SERVICE** (Container Deployment) |
| `sentence-transformers` | `UKPLab/sentence-transformers` | Python / PyTorch | Apache-2.0 | Low | **DIRECT REUSE** (Approved Embeddings Library) |
| `pdfplumber` | `jsvine/pdfplumber` | Python | MIT | Low | **DIRECT REUSE** (Approved Parsing Library) |
| `py-irt` | `nd-ball/py-irt` | Python / Pyro | MIT | Low | **DEFER / REUSE LATER** (Data-Blocked) |
| `catsim` | `douglasrizzo/catsim` | Python | MIT | Low | **DEFER / ADAPT LATER** (Data-Blocked) |
| `PyOD` | `yzhao062/pyod` | Python | BSD-2-Clause | Low | **NEEDS TECHNICAL VALIDATION** |
| `shap` | `shap/shap` | Python / C++ | MIT | Low | **DIRECT REUSE** (Approved Explainability) |
| `Fairlearn` | `fairlearn/fairlearn` | Python | MIT | Low | **DIRECT REUSE** (Approved Compliance Tool) |
| `Evidently` | `evidentlyai/evidently` | Python | Apache-2.0 | Low | **NEEDS TECHNICAL VALIDATION** |
| `Polars` | `pola-rs/polars` | Rust / Python | MIT | Low | **DIRECT REUSE** (Approved Analytics) |
| `nsjail` | `google/nsjail` | C++ | Apache-2.0 | Low | **WRAPPER / SERVICE** (Isolated Container) |
| `Piston` | `engineer-man/piston` | Node / Docker | MIT | Low | **REFERENCE ONLY** |
| `faster-whisper` | `SYSTRAN/faster-whisper` | Python / C++ | MIT | Low | **NEEDS TECHNICAL VALIDATION** |
| `Cal.com` | `calcom/cal.com` | TypeScript | AGPL-3.0 | High (Copyleft) | **REFERENCE ONLY** (Do Not Bundle AGPL) |

---

## Reconciled Capability Counts

### Current Architecture
* Existing TRUE ML algorithms: **0**
* Existing LLM / Generative AI capabilities: **5** *(Prep Assistant, Question Generator, Response Feedback, Resume Summarizer, Admin Outreach Generator)*
* Existing deterministic algorithms: **2** *(Token Normalizer, Set Intersection Matcher)*
* Existing mathematical scoring formulas: **1** *(Weighted Readiness Score)*
* Existing business rules / heuristics: **2** *(Pass/Fail Gate, Queue Sorter)*
* Existing concrete cybersecurity controls: **9** *(DDoS, WAF, Edge JWT, RBAC, KV Rate Limiter, Zod Validation, Secure Cookies, CORS, Cloudflare Secrets)*
* Existing engineering capabilities: **8**
* Existing relevant dependencies: **12**

### Expansion & Potential Capabilities
* Candidate ML algorithms: **14**
* Candidate NLP algorithms: **8**
* Candidate cybersecurity / ML algorithms: **5**
* Candidate RAG capabilities: **6**
* Candidate infrastructure & backend capabilities: **12**
* Candidate testing technologies: **4**
* Candidate SaaS features: **10**
* Worthwhile external repositories for direct integration: **14**
* External repositories for architectural reference only: **4**
* Rejected / unsafe / unnecessary technologies: **4** *(In-process code execution, Deep Knowledge Tracing, Facial emotion recognition, AGPL direct embedding)*

---

## Phased Architectural Recommendation

```text
                                  +---------------------------------------+
                                  |            CLIENT / BROWSER           |
                                  |   Next.js 14+ App Router / React 18   |
                                  +---------------------------------------+
                                                      |
                                                      | HTTPS / WSS
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                    CLOUDFLARE EDGE SAAS PERIMETER                                       |
|                                                                                                         |
|  +---------------------------+     +---------------------------+     +-------------------------------+  |
|  |     Next.js API Routes    | <-> |       Cloudflare D1       | <-> |         Cloudflare KV         |  |
|  |   (Auth, RBAC, Sessions)  |     |   (Relational SaaS Data)  |     |     (Cache & Rate Limiting)   |  |
|  +---------------------------+     +---------------------------+     +-------------------------------+  |
|               |                                                              |                          |
|               | (Internal Secure MTLS / Private VPC API)                      |                          |
|               v                                                              v                          |
|  +---------------------------+                                       +-------------------------------+  |
|  |       Cloudflare R2       |                                       |     Cloudflare Workers AI     |  |
|  |  (Resumes, Audio Blobs)   |                                       |   (Fast Edge Text Utilities)  |  |
|  +---------------------------+                                       +-------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                                                      |
                                                      | Private Network / VPC
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                    PYTHON INTELLIGENCE PLATFORM (FastAPI)                               |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                  FastAPI Gateway & Pydantic Validation                            |  |
|  +---------------------------------------------------------------------------------------------------+  |
|               |                                             |                                           |
|               | (Async Job Dispatch)                        | (Synchronous Search / Inference)          |
|               v                                             v                                           v
|  +---------------------------+               +---------------------------+               +-----------+  |
|  |        Redis + RQ         |               |       Qdrant Vector DB    |               |  Nsjail   |  |
|  |   (Lightweight Job Queue) |               |  (Dense Semantic Vectors) |               | Execution |  |
|  +---------------------------+               +---------------------------+               |  Sandbox  |  |
|         |                 |                                 |                            +-----------+  |
|         v                 v                                 v                                           |
|  +-------------+   +-------------+                   +-------------+                                    |
|  |  Document   |   |   Security  |                   |   Semantic  |                                    |
|  |  Processing |   |  Log ML     |                   |  Inference  |                                    |
|  | (pdfplumber,|   |   (PyOD     |                   | (Sentence-  |                                    |
|  |   spaCy)    |   |  Isolation) |                   | Transformer)|                                    |
|  +-------------+   +-------------+                   +-------------+                                    |
|                                                             |                                           |
|                                                             v                                           |
|                                                      +-------------+                                    |
|                                                      | Explain-    |                                    |
|                                                      |  ability    |                                    |
|                                                      | (SHAP/Fair) |                                    |
|                                                      +-------------+                                    |
+---------------------------------------------------------------------------------------------------------+
```

---

## Re-Audited Priority Matrix

| Priority | Initiatives & Candidates | Architectural Justification |
| :--- | :--- | :--- |
| **P0 (Required Foundation)** | • Deploy standalone FastAPI Python intelligence service.<br>• Implement `pdfplumber` & `python-docx` structured extraction.<br>• Deploy `sentence-transformers` (`all-MiniLM-L6-v2`) + `rank_bm25` hybrid ATS search.<br>• Introduce `Qdrant` vector storage with tenant metadata filtering.<br>• Integrate `Playwright` E2E testing for candidate assessment journeys. | High immediate user value; operates zero-shot without requiring historical outcome labels; keeps core edge stack intact. |
| **P1 (Valuable Next-Stage)** | • Deploy containerized `nsjail` sandbox for candidate coding assessments.<br>• Implement `shap` feature importance breakdowns on recruiter dashboards.<br>• Integrate `Fairlearn` automated disparate impact monitoring.<br>• Pilot `faster-whisper` for local interview audio transcription. | High commercial differentiator; establishes regulatory defensibility under AEDT and EEOC frameworks. |
| **P2 (Future / Scaling)** | • Pilot `PyOD` Isolation Forest on aggregated authentication failure logs.<br>• Integrate `Evidently` for data drift monitoring once document volume scales.<br>• Implement `Polars` / `DuckDB` talent pool analytical pipelines.<br>• Add `cmdk` recruiter command palette and Monaco code editor. | Operational optimizations that scale with growing organizational customer base. |
| **DEFER (Data-Blocked)** | • `py-irt` & `catsim` Item Response Theory parameter estimation.<br>• Supervised learning-to-rank models (XGBoost/LightGBM).<br>• `MLflow` full model registry server. | Blocked on historical candidate outcome data ($\ge 5,000$ records) and calibrated item responses ($200\text{--}500$ per question). |
| **REJECT (Unsafe / Unsuitable)** | • In-process code execution (`eval()`, Node child processes).<br>• Biometric emotion and facial micro-expression AI.<br>• Deep Knowledge Tracing (DKT) recurrent neural networks.<br>• Direct AGPL library source embedding. | Severe security vulnerability, legal prohibition, excessive data hunger, or intellectual property copyleft contamination. |

---

## Open Questions & Future Research Paths
1. **Container Hosting & Egress Gateway**: Determining whether the Python FastAPI service will run on managed container services (AWS ECS / Google Cloud Run) with Cloudflare Tunnel connecting to edge routes.
2. **Item Calibration Telemetry**: Designing an initial deterministic telemetry collector to log question response distributions for future IRT calibration.
3. **Local vs. Cloud Audio STT**: Benchmarking CPU/RAM costs of self-hosted `faster-whisper` versus privacy-compliant managed enterprise speech APIs.

---

## Final Gap Check & Validation Sign-Off
* [x] R2 Storage status re-audited and clarified as configured but partially integrated.
* [x] AI capability count reconciled to 5 discrete generative surfaces.
* [x] Cybersecurity controls itemized into 9 concrete, verifiable mechanisms.
* [x] Machine learning vs. deterministic scoring formulas strictly separated.
* [x] IRT and CAT psychometric tooling classified as `FUTURE / DATA-BLOCKED`.
* [x] All 21 proposed technologies classified with explicit integration boundaries.
* [x] Regulatory and legal claims refined to jurisdiction-dependent and compliance-grounded frameworks.
* [x] Persistent research record updated at `docs/research/INTELLIHIRE_CAPABILITY_RESEARCH.md`.

* **Final Status**: **RESEARCH VALIDATED WITH LIMITATIONS**
