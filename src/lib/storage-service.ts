/**
 * IntelliHire v3 - Unified Persistence & Storage Service
 * Provides continuous candidate state management across resume upload,
 * profile extraction, ATS matching, telemetry, sandbox coding, and chatbot.
 */

import { ParsedResumeProfile, JobMatchResult, SandboxExecutionReport, ReadinessScorecard } from "./intelligence-engine";

export interface CandidateDossier {
  id: string;
  name: string;
  email: string;
  location: string;
  title: string;
  rawResumeText: string;
  parsedProfile: ParsedResumeProfile;
  selectedJob?: JobMatchResult;
  assessmentTelemetry: Array<{
    itemId: string;
    topic: string;
    selectedOption: number;
    isCorrect: boolean;
    latencyMs: number;
    timestamp: string;
    cttPValue: string;
  }>;
  codingSubmission?: {
    code: string;
    language: string;
    status: string;
    passedCount: number;
    totalCount: number;
    latencyMs: number;
    scorePercentage: number;
    timestamp: string;
  };
  readinessScorecard?: ReadinessScorecard;
  updatedAt: string;
}

export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  reqExp: string;
  requiredSkills: string[];
  description: string;
  budget: string;
  status: string;
}

const DEFAULT_REQUISITIONS: Requisition[] = [
  {
    id: "req-01",
    title: "Principal AI & Distributed Systems Architect",
    department: "AI Infrastructure & Core Systems",
    location: "San Francisco, CA / Remote",
    reqExp: "8+ years",
    requiredSkills: ["Python", "Go", "PyTorch", "Qdrant", "FastAPI", "Docker", "SHAP / Explainability", "Reciprocal Rank Fusion"],
    description: "Lead our sandboxed execution runtime, 384-d dense + Okapi BM25 hybrid vector search (RRF k=60), and EEOC-compliant algorithmic fairness pipeline across edge nodes.",
    budget: "$240k - $310k",
    status: "Active",
  },
  {
    id: "req-02",
    title: "Staff Machine Learning Engineer (Core Search)",
    department: "Information Retrieval & Ranking",
    location: "New York, NY / Hybrid",
    reqExp: "6+ years",
    requiredSkills: ["Python", "PyTorch", "Qdrant", "FastAPI", "Docker", "TypeScript"],
    description: "Design low-latency neural search pipelines combining 384-d bi-encoder dense vectors with sparse BM25 inverted indexes for candidate-requisition retrieval.",
    budget: "$210k - $270k",
    status: "Active",
  },
  {
    id: "req-03",
    title: "Lead Distributed Systems Engineer",
    department: "Platform Edge Infrastructure",
    location: "Remote",
    reqExp: "7+ years",
    requiredSkills: ["Go", "Python", "Docker", "Cloudflare D1/KV/R2", "FastAPI"],
    description: "Scale multi-tenant edge workers, D1 SQL persistent stores, and isolated sandboxed execution runtimes across 275+ global points of presence.",
    budget: "$195k - $250k",
    status: "Active",
  },
];

const INITIAL_CANDIDATE: CandidateDossier = {
  id: "cand_vishnu_p01",
  name: "Vishnu Sharma",
  email: "vishnu@demo.intellihire.ai",
  location: "San Francisco, CA",
  title: "Principal AI & Distributed Systems Architect",
  rawResumeText: `VISHNU SHARMA
Principal AI & Distributed Systems Architect
Email: vishnu@demo.intellihire.ai | Location: San Francisco, CA | Phone: +1 (555) 019-2834

SUMMARY
Principal AI Systems Architect with 10+ years of experience designing enterprise-scale distributed inference pipelines, vector databases (Qdrant, Milvus), high-throughput FastAPI/Go microservices, and fair algorithmic candidate evaluation systems. Deep expertise in PyTorch, TreeSHAP explainability, and EEOC algorithmic fairness compliance.

WORK EXPERIENCE
Principal AI Platform Engineer — Anthropic / Scale AI (2021 - Present)
• Architected isolated multi-tenant execution sandboxes processing 500k+ candidate code executions/day with sub-100ms cold starts.
• Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60), improving ATS recall by 34%.
• Authored automated TreeSHAP surrogate feature attribution engines and EEOC 80% Four-Fifths rule fairness auditing pipelines.

Lead Machine Learning Engineer — Uber Technologies (2018 - 2021)
• Built real-time matching engine using Go, Python, and Kafka handling 80,000 queries per second.
• Reduced inference latency by 42% through quantization, ONNX Runtime, and TensorRT compilation.

SKILLS
Languages: Python, Go, TypeScript, C++, Rust, SQL
AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn, spaCy, Scikit-learn
Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis, Kafka, CI/CD, Terraform

EDUCATION
Master of Science in Artificial Intelligence — Carnegie Mellon University (CMU), 2018
Bachelor of Technology in Computer Science — Indian Institute of Technology (IIT), 2016`,
  parsedProfile: {
    name: "Vishnu Sharma",
    email: "vishnu@demo.intellihire.ai",
    location: "San Francisco, CA",
    summary: "Principal AI Systems Architect with 10+ years of experience designing enterprise-scale distributed inference pipelines.",
    skills: [
      { skill: "Python", category: "Languages", domain: "Software & AI", span: [480, 486], confidence: 0.99, occurrences: 4, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
      { skill: "Go", category: "Languages", domain: "Systems", span: [488, 490], confidence: 0.98, occurrences: 2, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
      { skill: "TypeScript", category: "Languages", domain: "Frontend & Fullstack", span: [492, 502], confidence: 0.97, occurrences: 3, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
      { skill: "PyTorch", category: "AI & ML", domain: "Deep Learning", span: [518, 525], confidence: 0.99, occurrences: 3, excerpt: "AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn" },
      { skill: "Qdrant", category: "AI & ML", domain: "Vector Search", span: [541, 547], confidence: 0.96, occurrences: 2, excerpt: "AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn" },
      { skill: "SHAP / Explainability", category: "AI & ML", domain: "Model Governance", span: [557, 565], confidence: 0.99, occurrences: 3, excerpt: "Authored automated TreeSHAP surrogate feature attribution engines" },
      { skill: "FastAPI", category: "Frameworks", domain: "Backend", span: [210, 217], confidence: 0.98, occurrences: 2, excerpt: "high-throughput FastAPI/Go microservices" },
      { skill: "Docker", category: "Infrastructure", domain: "DevOps & Cloud", span: [620, 626], confidence: 0.95, occurrences: 2, excerpt: "Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis" },
      { skill: "Cloudflare D1/KV/R2", category: "Infrastructure", domain: "Edge & Serverless", span: [640, 658], confidence: 0.94, occurrences: 1, excerpt: "Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis" },
      { skill: "Reciprocal Rank Fusion", category: "Algorithms", domain: "Information Retrieval", span: [380, 408], confidence: 0.96, occurrences: 2, excerpt: "Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60)" },
    ],
    experience: [
      {
        role: "Principal AI Platform Engineer",
        company: "Anthropic / Scale AI",
        period: "2021 — Present (3.8 yrs)",
        highlights: [
          "Architected isolated multi-tenant execution sandboxes processing 500k+ candidate code executions/day.",
          "Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60)."
        ],
        durationYears: 3.8
      }
    ],
    totalYearsExperience: 10.0,
    seniorityTier: "Lead / Architect",
    education: [
      { institution: "Carnegie Mellon University (CMU)", degree: "Master of Science in Artificial Intelligence", year: "2018" }
    ],
    promptShield: {
      isClean: true,
      threatsDetected: [],
      riskScore: 0.0,
    }
  },
  assessmentTelemetry: [
    {
      itemId: "item_kadane_01",
      topic: "Algorithm Optimization & Dynamic Programming",
      selectedOption: 0,
      isCorrect: true,
      latencyMs: 1420,
      timestamp: new Date().toISOString(),
      cttPValue: "0.80",
    }
  ],
  codingSubmission: {
    code: `def max_sub_array(nums: list[int]) -> int:
    if not nums: return 0
    max_so_far = curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far`,
    language: "python",
    status: "ACCEPTED",
    passedCount: 4,
    totalCount: 4,
    latencyMs: 89.2,
    scorePercentage: 100,
    timestamp: new Date().toISOString(),
  },
  readinessScorecard: {
    readinessScore: 94.0,
    baseExpectedScore: 68.0,
    netLift: 26.0,
    attributions: [
      { feature: "Base Population Average", value: 68.0, isBase: true, isPositive: true, description: "Baseline candidate population average" },
      { feature: "Verified Canonical Skills (10 detected)", value: 12.4, isBase: false, isPositive: true, description: "Direct character provenance across PyTorch, Go, Qdrant, and FastAPI" },
      { feature: "Calibrated Experience (10.0 yrs)", value: 8.2, isBase: false, isPositive: true, description: "Calibrated 10.0 years verified Principal / Architect track record" },
      { feature: "Coding Sandbox Benchmark (100%)", value: 4.3, isBase: false, isPositive: true, description: "Kadane algorithm solved with 89.2ms execution latency" },
      { feature: "Psychometric Telemetry (p=0.80)", value: 3.1, isBase: false, isPositive: true, description: "Optimal latency curve and correct first-attempt response telemetry" },
      { feature: "Skill Gap Adjustments (2 missing)", value: -2.0, isBase: false, isPositive: false, description: "Target role requisition missing specialized ML deployment tools" },
    ],
    disparateImpactRatio: 0.94,
    plainSummary: "Candidate readiness score of 94.0 is +26.0 points compared to the baseline population (68.0).",
  },
  updatedAt: new Date().toISOString(),
};

export class StorageService {
  private static CANDIDATE_KEY = "ih_active_candidate_dossier";
  private static ALL_CANDIDATES_KEY = "ih_all_candidates_pool";
  private static REQUISITIONS_KEY = "ih_active_requisitions";

  static getActiveCandidate(): CandidateDossier {
    if (typeof window === "undefined") return INITIAL_CANDIDATE;
    try {
      const stored = localStorage.getItem(this.CANDIDATE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(this.CANDIDATE_KEY, JSON.stringify(INITIAL_CANDIDATE));
      return INITIAL_CANDIDATE;
    } catch {
      return INITIAL_CANDIDATE;
    }
  }

  static saveActiveCandidate(candidate: CandidateDossier): void {
    if (typeof window === "undefined") return;
    try {
      candidate.updatedAt = new Date().toISOString();
      localStorage.setItem(this.CANDIDATE_KEY, JSON.stringify(candidate));

      // Also upsert in all candidates pool
      const pool = this.getAllCandidates();
      const idx = pool.findIndex(c => c.id === candidate.id);
      if (idx >= 0) pool[idx] = candidate;
      else pool.unshift(candidate);
      localStorage.setItem(this.ALL_CANDIDATES_KEY, JSON.stringify(pool));
    } catch {}
  }

  static updateCandidateProfile(profile: ParsedResumeProfile, rawText: string): CandidateDossier {
    const current = this.getActiveCandidate();
    const updated: CandidateDossier = {
      ...current,
      name: profile.name,
      email: profile.email,
      location: profile.location,
      title: profile.skills.length > 0 ? `${profile.seniorityTier} AI & Systems Engineer` : current.title,
      rawResumeText: rawText,
      parsedProfile: profile,
      updatedAt: new Date().toISOString(),
    };
    this.saveActiveCandidate(updated);
    return updated;
  }

  static getAllCandidates(): CandidateDossier[] {
    if (typeof window === "undefined") return [INITIAL_CANDIDATE];
    try {
      const stored = localStorage.getItem(this.ALL_CANDIDATES_KEY);
      if (stored) return JSON.parse(stored);
      const initialPool = [INITIAL_CANDIDATE];
      localStorage.setItem(this.ALL_CANDIDATES_KEY, JSON.stringify(initialPool));
      return initialPool;
    } catch {
      return [INITIAL_CANDIDATE];
    }
  }

  static getRequisitions(): Requisition[] {
    if (typeof window === "undefined") return DEFAULT_REQUISITIONS;
    try {
      const stored = localStorage.getItem(this.REQUISITIONS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(this.REQUISITIONS_KEY, JSON.stringify(DEFAULT_REQUISITIONS));
      return DEFAULT_REQUISITIONS;
    } catch {
      return DEFAULT_REQUISITIONS;
    }
  }
}
