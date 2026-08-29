// Database client and persistence layer for D1 & local development

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'candidate' | 'recruiter' | 'admin';
  createdAt: string;
}

export interface CareerContextRecord {
  id: string;
  userId: string;
  targetRole: string;
  targetIndustry: string;
  seniorityLevel: string;
  skills: string[];
  readinessScore: number;
  atsScore: number;
  assessmentScore: number;
  interviewScore: number;
  updatedAt: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedHours: number;
  description: string;
}

export interface AssessmentTest {
  id: string;
  title: string;
  category: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  questionCount: number;
  durationMinutes: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  skill: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  levelReached: string;
  completedAt: string;
}

export interface TechInterviewSession {
  id: string;
  userId: string;
  title: string;
  language: string;
  difficulty: string;
  problemStatement: string;
  starterCode: string;
  testCases: { input: string; expected: string }[];
  userCode?: string;
  status: 'in-progress' | 'completed';
  score?: number;
  feedback?: {
    correctness: number;
    codeQuality: number;
    efficiency: number;
    notes: string;
  };
  completedAt?: string;
}

export interface HRInterviewSession {
  id: string;
  userId: string;
  category: string;
  question: string;
  scenario: string;
  userResponse?: string;
  status: 'in-progress' | 'completed';
  feedback?: {
    starScore: number;
    communicationScore: number;
    leadershipScore: number;
    critique: string;
    improvements: string[];
  };
  completedAt?: string;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface ResumeDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  parsedSummary: string;
  atsScore: number;
  suggestedKeywords: string[];
  missingKeywords: string[];
}

class DatabaseService {
  private users: Map<string, UserRecord> = new Map();
  private careerContexts: Map<string, CareerContextRecord> = new Map();
  private roadmaps: Map<string, RoadmapMilestone[]> = new Map();
  private assessments: Map<string, AssessmentTest[]> = new Map();
  private assessmentResults: Map<string, AssessmentResult[]> = new Map();
  private techInterviews: Map<string, TechInterviewSession[]> = new Map();
  private hrInterviews: Map<string, HRInterviewSession[]> = new Map();
  private resumes: Map<string, ResumeDocument[]> = new Map();
  private activities: Map<string, ActivityRecord[]> = new Map();

  constructor() {
    // Seed demo user
    const demoUser: UserRecord = {
      id: "usr_demo_101",
      email: "demo@intellihire.dev",
      name: "Alex Mercer",
      passwordHash: "$2a$10$wE1Vp2e7O8KkL6sZg8.s.OPf3PZ1v5U3E1S1yO4t1tV7a4Hk9w4jS",
      role: "candidate",
      createdAt: new Date().toISOString(),
    };
    this.users.set(demoUser.email.toLowerCase(), demoUser);
    this.users.set(demoUser.id, demoUser);

    const demoContext: CareerContextRecord = {
      id: "ctx_demo_101",
      userId: demoUser.id,
      targetRole: "Senior Full-Stack Engineer",
      targetIndustry: "Cloud & AI Platforms",
      seniorityLevel: "Senior / Lead",
      skills: ["TypeScript", "Next.js", "React", "Cloudflare Workers", "SQLite", "System Design", "AI Integration", "Tailwind CSS"],
      readinessScore: 88,
      atsScore: 92,
      assessmentScore: 85,
      interviewScore: 87,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(demoUser.id, demoContext);

    // Seed Roadmaps
    this.roadmaps.set(demoUser.id, [
      {
        id: "ms_1",
        title: "Master Edge-First Architecture & SQLite/D1",
        category: "Backend & Systems",
        status: "completed",
        estimatedHours: 20,
        description: "Deep dive into serverless edge runtime boundaries, ACID transactions in D1, and KV caching models.",
      },
      {
        id: "ms_2",
        title: "Distributed Rate Limiting & Concurrency Controls",
        category: "Reliability & Scale",
        status: "in-progress",
        estimatedHours: 15,
        description: "Implement token bucket and sliding log algorithms across multi-region edge nodes.",
      },
      {
        id: "ms_3",
        title: "LLM Agentic Tool Routing & Prompt Optimization",
        category: "AI & Intelligence",
        status: "pending",
        estimatedHours: 25,
        description: "Build robust multi-turn agent tool callers with schema validation and self-healing error recovery.",
      },
      {
        id: "ms_4",
        title: "Executive Behavioral & System Design Simulation",
        category: "Interview Mastery",
        status: "pending",
        estimatedHours: 10,
        description: "Complete 5 mock rounds with AI hiring committee simulations targeting Director/Lead benchmarks.",
      }
    ]);

    // Seed Assessment Tests
    const initialTests: AssessmentTest[] = [
      {
        id: "test_ts_adv",
        title: "TypeScript Advanced Type Systems & Generics",
        category: "Frontend & Languages",
        skill: "TypeScript",
        difficulty: "Advanced",
        questionCount: 4,
        durationMinutes: 15,
        questions: [
          {
            id: "q1",
            question: "Which mapped type modifier removes the `readonly` constraint from all properties in `T`?",
            options: ["-readonly [P in keyof T]: T[P]", "readonly [P in keyof T]?: T[P]", "+mutable [P in keyof T]: T[P]", "[P in keyof T as -readonly]: T[P]"],
            correctIndex: 0,
            explanation: "The `-readonly` prefix strips the readonly modifier from mapped type properties."
          },
          {
            id: "q2",
            question: "What is the return type of `type Foo<T> = T extends (...args: any[]) => infer R ? R : never` given `() => Promise<string>`?",
            options: ["Promise<string>", "string", "never", "void"],
            correctIndex: 0,
            explanation: "The `infer R` extracts the full return type of the function signature, which is `Promise<string>`."
          },
          {
            id: "q3",
            question: "How do you enforce exhaustive checking in a TypeScript switch statement?",
            options: ["Assign the unhandled case value to type `never`", "Use `default: return undefined;`", "Add `@ts-expect-error` to default", "Enable `noImplicitAny`"],
            correctIndex: 0,
            explanation: "Assigning the remaining value to `const _exhaustive: never = value` causes compile errors if cases are missed."
          },
          {
            id: "q4",
            question: "What is the key difference between `interface` and `type` regarding declaration merging?",
            options: ["Interfaces merge with identical names in same scope; types throw duplicate identifier errors", "Types merge automatically; interfaces do not", "Interfaces cannot extend object types", "Types cannot be used in generic constraints"],
            correctIndex: 0,
            explanation: "Multiple interface declarations with the same name merge their definitions, while type aliases cannot be redeclared."
          }
        ]
      },
      {
        id: "test_sys_design",
        title: "Cloud Edge Computing & Distributed Cache Coherence",
        category: "System Architecture",
        skill: "System Design",
        difficulty: "Advanced",
        questionCount: 3,
        durationMinutes: 12,
        questions: [
          {
            id: "sd1",
            question: "In an edge-first multi-region deployment, how does Cloudflare D1 handle write replication?",
            options: ["Single primary leader handles writes with read replicas globally distributed", "Multi-master quorum writes across all regions", "Eventual consistency with client-side clock sync", "Two-phase commit across all edge pops"],
            correctIndex: 0,
            explanation: "D1 routes writes to a designated primary instance and asynchronously replicates read snapshots globally."
          },
          {
            id: "sd2",
            question: "Which cache invalidation strategy is most suitable for low-latency session validation at the edge?",
            options: ["Short-lived JWTs with KV blacklist for revoked tokens", "Synchronous DB queries on every request", "Long-lived cookies with client-stored hashes", "Polling centralized Redis clusters"],
            correctIndex: 0,
            explanation: "Stateless short-lived JWTs combined with edge KV revocation checks provide microsecond verification without central DB bottlenecks."
          },
          {
            id: "sd3",
            question: "What is the primary benefit of deploying serverless functions at the CDN edge rather than centralized origins?",
            options: ["Lower Time-To-First-Byte (TTFB) and TLS termination close to end-users", "Unlimited CPU execution timeouts", "Direct access to local disk filesystems", "Free background threads"],
            correctIndex: 0,
            explanation: "Edge execution runs code in hundreds of global data centers nearest the client, minimizing round-trip network latency."
          }
        ]
      }
    ];
    this.assessments.set("catalog", initialTests);

    // Seed assessment results
    this.assessmentResults.set(demoUser.id, [
      {
        id: "res_demo_1",
        userId: demoUser.id,
        testId: "test_ts_adv",
        testTitle: "TypeScript Advanced Type Systems & Generics",
        skill: "TypeScript",
        score: 100,
        totalQuestions: 4,
        correctCount: 4,
        levelReached: "Expert (Level 5)",
        completedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);

    // Seed Tech Interview
    this.techInterviews.set(demoUser.id, [
      {
        id: "interview_tech_1",
        userId: demoUser.id,
        title: "LRU Cache Implementation with O(1) Operations",
        language: "typescript",
        difficulty: "Hard",
        problemStatement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with `get(key)` and `put(key, value)` both running in O(1) average time complexity.",
        starterCode: `class LRUCache {\n  private capacity: number;\n  private cache: Map<number, number>;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key: number): number {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key)!;\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n\n  put(key: number, value: number): void {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      const oldestKey = this.cache.keys().next().value;\n      if (oldestKey !== undefined) this.cache.delete(oldestKey);\n    }\n    this.cache.set(key, value);\n  }\n}`,
        testCases: [
          { input: "put(1,1), put(2,2), get(1), put(3,3), get(2)", expected: "1, -1" }
        ],
        status: "completed",
        score: 95,
        feedback: {
          correctness: 100,
          codeQuality: 92,
          efficiency: 95,
          notes: "Excellent solution leveraging Map insertion order semantics for clean O(1) eviction."
        },
        completedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]);

    // Seed HR Interview
    this.hrInterviews.set(demoUser.id, [
      {
        id: "interview_hr_1",
        userId: demoUser.id,
        category: "Leadership & Conflict Resolution",
        scenario: "You are leading a high-impact product launch on a tight deadline. Two senior engineers on your team strongly disagree on whether to use GraphQL or tRPC, stalling progress for days. How do you resolve this?",
        question: "Describe your approach to resolving this architectural stalemate while keeping the team aligned and hitting the milestone.",
        userResponse: "I scheduled a time-boxed 45-minute decision matrix meeting. Beforehand, I asked both engineers to list their top 3 technical trade-offs against our specific launch criteria: bundle size, edge latency, and schema safety. We scored both options objectively against our deadline. We agreed to proceed with tRPC for the MVP due to our pure TypeScript stack, with a documented ADR acknowledging future GraphQL evaluation if public API requirements emerge. The team executed the decision collaboratively without lingering friction.",
        status: "completed",
        feedback: {
          starScore: 92,
          communicationScore: 90,
          leadershipScore: 94,
          critique: "Outstanding demonstration of structured mediation, objective evaluation frameworks, and team psychological safety.",
          improvements: [
            "Quantify the specific deadline metrics in the outcome statement."
          ]
        },
        completedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ]);

    // Seed Resumes
    this.resumes.set(demoUser.id, [
      {
        id: "res_doc_1",
        userId: demoUser.id,
        fileName: "Alex_Mercer_Senior_Staff_Resume_2026.pdf",
        fileSize: 142800,
        uploadDate: new Date(Date.now() - 7200000).toISOString(),
        parsedSummary: "Senior Full-Stack & Distributed Systems Architect with 8+ years scaling Next.js, Cloudflare Workers, and multi-agent AI ecosystems.",
        atsScore: 92,
        suggestedKeywords: ["Distributed Systems", "Cloudflare Workers", "D1", "Next.js 14", "Tailwind CSS", "High Concurrency", "Prompt Engineering"],
        missingKeywords: ["GraphQL Federation", "Kubernetes Operator"]
      }
    ]);

    this.activities.set(demoUser.id, [
      {
        id: "act_1",
        userId: demoUser.id,
        type: "resume",
        title: "ATS Resume Analysis Complete",
        description: "Your master resume scored 92/100 for Cloud Platform Engineer targets.",
        timestamp: "2 hours ago",
      },
      {
        id: "act_2",
        userId: demoUser.id,
        type: "assessment",
        title: "Adaptive Assessment Level 4 Passed",
        description: "Verified proficiency in Distributed Systems and Cloud Architecture.",
        timestamp: "Yesterday",
      },
      {
        id: "act_3",
        userId: demoUser.id,
        type: "interview",
        title: "Technical Mock Interview Passed",
        description: "Completed System Design simulation with 87% positive rubric score.",
        timestamp: "3 days ago",
      },
    ]);
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user: UserRecord = {
      ...data,
      id,
      email: data.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.email, user);
    this.users.set(user.id, user);

    const context: CareerContextRecord = {
      id: `ctx_${Date.now()}`,
      userId: id,
      targetRole: "Software Engineer",
      targetIndustry: "Technology",
      seniorityLevel: "Mid-Level",
      skills: ["JavaScript", "TypeScript", "React", "Node.js"],
      readinessScore: 75,
      atsScore: 78,
      assessmentScore: 70,
      interviewScore: 76,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(id, context);

    this.roadmaps.set(id, [
      {
        id: `ms_${Date.now()}_1`,
        title: "Initial Skill Gap Assessment",
        category: "Foundations",
        status: "in-progress",
        estimatedHours: 5,
        description: "Complete your baseline assessment across core language competencies.",
      }
    ]);

    this.activities.set(id, [
      {
        id: `act_${Date.now()}`,
        userId: id,
        type: "account",
        title: "Welcome to IntelliHire",
        description: "Your unified career intelligence context has been initialized.",
        timestamp: "Just now",
      },
    ]);

    return user;
  }

  async getCareerContext(userId: string): Promise<CareerContextRecord | null> {
    return this.careerContexts.get(userId) || null;
  }

  async updateCareerContext(userId: string, data: Partial<CareerContextRecord>): Promise<CareerContextRecord> {
    const current = await this.getCareerContext(userId);
    const updated: CareerContextRecord = {
      ...(current || {
        id: `ctx_${Date.now()}`,
        userId,
        targetRole: "Software Engineer",
        targetIndustry: "Technology",
        seniorityLevel: "Mid-Level",
        skills: [],
        readinessScore: 70,
        atsScore: 70,
        assessmentScore: 70,
        interviewScore: 70,
        updatedAt: new Date().toISOString(),
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.careerContexts.set(userId, updated);
    return updated;
  }

  async getRoadmap(userId: string): Promise<RoadmapMilestone[]> {
    return this.roadmaps.get(userId) || [];
  }

  async addRoadmapMilestone(userId: string, milestone: Omit<RoadmapMilestone, "id">): Promise<RoadmapMilestone> {
    const record: RoadmapMilestone = {
      ...milestone,
      id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const list = this.roadmaps.get(userId) || [];
    list.push(record);
    this.roadmaps.set(userId, list);
    return record;
  }

  async updateRoadmapMilestone(userId: string, milestoneId: string, status: RoadmapMilestone['status']): Promise<RoadmapMilestone | null> {
    const list = this.roadmaps.get(userId) || [];
    const item = list.find(m => m.id === milestoneId);
    if (!item) return null;
    item.status = status;
    return item;
  }

  async getAssessmentCatalog(): Promise<AssessmentTest[]> {
    return this.assessments.get("catalog") || [];
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    return this.assessmentResults.get(userId) || [];
  }

  async recordAssessmentResult(result: Omit<AssessmentResult, "id" | "completedAt">): Promise<AssessmentResult> {
    const record: AssessmentResult = {
      ...result,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      completedAt: new Date().toISOString(),
    };
    const list = this.assessmentResults.get(result.userId) || [];
    list.unshift(record);
    this.assessmentResults.set(result.userId, list);

    // Auto-update career context assessment score
    const avgScore = Math.round(list.reduce((acc, r) => acc + r.score, 0) / list.length);
    await this.updateCareerContext(result.userId, { assessmentScore: avgScore });

    await this.addActivity(result.userId, {
      type: "assessment",
      title: `Assessment Completed: ${result.testTitle}`,
      description: `Scored ${result.score}% (${result.correctCount}/${result.totalQuestions} correct) - ${result.levelReached}`,
      timestamp: "Just now"
    });

    return record;
  }

  async getTechInterviews(userId: string): Promise<TechInterviewSession[]> {
    return this.techInterviews.get(userId) || [];
  }

  async createTechInterview(interview: Omit<TechInterviewSession, "id">): Promise<TechInterviewSession> {
    const record: TechInterviewSession = {
      ...interview,
      id: `tech_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const list = this.techInterviews.get(interview.userId) || [];
    list.unshift(record);
    this.techInterviews.set(interview.userId, list);
    return record;
  }

  async getHRInterviews(userId: string): Promise<HRInterviewSession[]> {
    return this.hrInterviews.get(userId) || [];
  }

  async createHRInterview(interview: Omit<HRInterviewSession, "id">): Promise<HRInterviewSession> {
    const record: HRInterviewSession = {
      ...interview,
      id: `hr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const list = this.hrInterviews.get(interview.userId) || [];
    list.unshift(record);
    this.hrInterviews.set(interview.userId, list);
    return record;
  }

  async getResumes(userId: string): Promise<ResumeDocument[]> {
    return this.resumes.get(userId) || [];
  }

  async saveResume(resume: Omit<ResumeDocument, "id" | "uploadDate">): Promise<ResumeDocument> {
    const record: ResumeDocument = {
      ...resume,
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uploadDate: new Date().toISOString(),
    };
    const list = this.resumes.get(resume.userId) || [];
    list.unshift(record);
    this.resumes.set(resume.userId, list);

    await this.updateCareerContext(resume.userId, { atsScore: resume.atsScore });
    await this.addActivity(resume.userId, {
      type: "resume",
      title: `Resume Uploaded & Analyzed`,
      description: `${resume.fileName} scored ${resume.atsScore}/100 ATS compatibility.`,
      timestamp: "Just now"
    });

    return record;
  }

  async getActivities(userId: string): Promise<ActivityRecord[]> {
    return this.activities.get(userId) || [];
  }

  async addActivity(userId: string, activity: Omit<ActivityRecord, "id" | "userId">): Promise<ActivityRecord> {
    const record: ActivityRecord = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
    };
    const list = this.activities.get(userId) || [];
    list.unshift(record);
    this.activities.set(userId, list.slice(0, 20));
    return record;
  }
}

// Global singleton database instance
const globalForDb = globalThis as unknown as { dbService: DatabaseService };
export const db = globalForDb.dbService || new DatabaseService();
if (process.env.NODE_ENV !== "production") globalForDb.dbService = db;
