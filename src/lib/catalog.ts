import type { AssessmentTest } from "./db";

/**
 * Canonical adaptive-assessment question bank.
 *
 * This is static reference content (real interview questions), not user data.
 * It is the single source of truth used to provision both the D1 database
 * (`assessment_catalog` table, on first use) and the local in-memory driver,
 * so the assessment module is functional in every environment.
 */
export const INITIAL_ASSESSMENTS: AssessmentTest[] = [
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
        question:
          "Which mapped type modifier removes the `readonly` constraint from all properties in `T`?",
        options: [
          "-readonly [P in keyof T]: T[P]",
          "readonly [P in keyof T]?: T[P]",
          "+mutable [P in keyof T]: T[P]",
          "[P in keyof T as -readonly]: T[P]",
        ],
        correctIndex: 0,
        explanation:
          "The `-readonly` prefix strips the readonly modifier from mapped type properties.",
      },
      {
        id: "q2",
        question:
          "What is the return type of `type Foo<T> = T extends (...args: any[]) => infer R ? R : never` given `() => Promise<string>`?",
        options: ["Promise<string>", "string", "never", "void"],
        correctIndex: 0,
        explanation:
          "The `infer R` extracts the full return type of the function signature, which is `Promise<string>`.",
      },
      {
        id: "q3",
        question: "How do you enforce exhaustive checking in a TypeScript switch statement?",
        options: [
          "Assign the unhandled case value to type `never`",
          "Use `default: return undefined;`",
          "Add `@ts-expect-error` to default",
          "Enable `noImplicitAny`",
        ],
        correctIndex: 0,
        explanation:
          "Assigning the remaining value to `const _exhaustive: never = value` causes compile errors if cases are missed.",
      },
      {
        id: "q4",
        question:
          "What is the key difference between `interface` and `type` regarding declaration merging?",
        options: [
          "Interfaces merge with identical names in same scope; types throw duplicate identifier errors",
          "Types merge automatically; interfaces do not",
          "Interfaces cannot extend object types",
          "Types cannot be used in generic constraints",
        ],
        correctIndex: 0,
        explanation:
          "Multiple interface declarations with the same name merge their definitions, while type aliases cannot be redeclared.",
      },
    ],
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
        options: [
          "Single primary leader handles writes with read replicas globally distributed",
          "Multi-master quorum writes across all regions",
          "Eventual consistency with client-side clock sync",
          "Two-phase commit across all edge pops",
        ],
        correctIndex: 0,
        explanation:
          "D1 routes writes to a designated primary instance and asynchronously replicates read snapshots globally.",
      },
      {
        id: "sd2",
        question:
          "Which cache invalidation strategy is most suitable for low-latency session validation at the edge?",
        options: [
          "Short-lived JWTs with KV blacklist for revoked tokens",
          "Synchronous DB queries on every request",
          "Long-lived cookies with client-stored hashes",
          "Polling centralized Redis clusters",
        ],
        correctIndex: 0,
        explanation:
          "Stateless short-lived JWTs combined with edge KV revocation checks provide microsecond verification without central DB bottlenecks.",
      },
      {
        id: "sd3",
        question:
          "What is the primary benefit of deploying serverless functions at the CDN edge rather than centralized origins?",
        options: [
          "Lower Time-To-First-Byte (TTFB) and TLS termination close to end-users",
          "Unlimited CPU execution timeouts",
          "Direct access to local disk filesystems",
          "Free background threads",
        ],
        correctIndex: 0,
        explanation:
          "Edge execution runs code in hundreds of global data centers nearest the client, minimizing round-trip network latency.",
      },
    ],
  },
];
