// Database client and persistence layer for D1 (production) & local development.
//
// Persistence is behind a `StorageDriver` interface so the application runs
// against real Cloudflare D1 in production and a durable-in-process memory
// driver when Cloudflare bindings are not available (local `next dev` / build).

import { INITIAL_ASSESSMENTS } from "./catalog";

// ---------------------------------------------------------------------------
// Minimal structural types for the Cloudflare D1 binding.
//
// We deliberately avoid importing @cloudflare/workers-types (or
// @cloudflare/next-on-pages): both reference the Workers ambient globals, whose
// `Response.json<T>()` shadows the DOM lib's `Response.json()` in this
// single-tsconfig project and breaks client-component typechecking. These
// structural types stay assignment-compatible with the real D1 binding.
// ---------------------------------------------------------------------------

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string | number): Promise<T | null>;
  all<T = unknown>(colName?: string | number): Promise<{ results: T[]; success: boolean }>;
  run<T = unknown>(): Promise<{ success: boolean; results?: T[]; meta?: unknown }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

/** Minimal shape of the Cloudflare `env` object needed by the database layer. */
export interface DbEnv {
  DB?: D1Database;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "candidate" | "recruiter" | "admin";
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
  status: "completed" | "in-progress" | "pending";
  estimatedHours: number;
  description: string;
}

export interface AssessmentTest {
  id: string;
  title: string;
  category: string;
  skill: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
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
  status: "in-progress" | "completed";
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
  status: "in-progress" | "completed";
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

/**
 * Row type used to carry raw file content (base64) with resume metadata.
 * R2 is not enabled on the account yet, so uploaded files are persisted
 * durably in D1 as base64 behind a thin abstraction (see `saveUploadedFile`).
 */
export interface ResumeUploadInput extends ResumeDocument {
  fileType?: string;
  fileData?: string; // base64-encoded file content when stored in D1
}

// ---------------------------------------------------------------------------
// Storage drivers
// ---------------------------------------------------------------------------

/**
 * Persistence contract implemented by both the D1 driver (production) and the
 * in-memory driver (local development). Each method is a low-level CRUD
 * primitive; higher-level orchestration lives on `DatabaseService`.
 */
export interface StorageDriver {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<void>;
  getCareerContext(userId: string): Promise<CareerContextRecord | null>;
  upsertCareerContext(context: CareerContextRecord): Promise<void>;
  getRoadmap(userId: string): Promise<RoadmapMilestone[]>;
  saveRoadmap(userId: string, milestones: RoadmapMilestone[]): Promise<void>;
  getAssessmentCatalog(): Promise<AssessmentTest[]>;
  getAssessmentResults(userId: string): Promise<AssessmentResult[]>;
  saveAssessmentResult(result: AssessmentResult): Promise<void>;
  getTechInterviews(userId: string): Promise<TechInterviewSession[]>;
  saveTechInterview(interview: TechInterviewSession): Promise<void>;
  getHRInterviews(userId: string): Promise<HRInterviewSession[]>;
  saveHRInterview(interview: HRInterviewSession): Promise<void>;
  getResumes(userId: string): Promise<ResumeDocument[]>;
  saveResume(resume: ResumeDocument): Promise<void>;
  saveUploadedFile(resume: ResumeUploadInput): Promise<void>;
  getActivities(userId: string): Promise<ActivityRecord[]>;
  saveActivity(activity: ActivityRecord): Promise<void>;
}

/** Deterministic id generation shared by the service and drivers. */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ---------------------------------------------------------------------------
// In-memory driver (local development fallback)
// ---------------------------------------------------------------------------

export class MemoryDriver implements StorageDriver {
  private users = new Map<string, UserRecord>();  private careerContexts = new Map<string, CareerContextRecord>();
  private roadmaps = new Map<string, RoadmapMilestone[]>();
  private assessmentCatalog: AssessmentTest[] = [...INITIAL_ASSESSMENTS];
  private assessmentResults = new Map<string, AssessmentResult[]>();
  private techInterviews = new Map<string, TechInterviewSession[]>();
  private hrInterviews = new Map<string, HRInterviewSession[]>();
  private resumes = new Map<string, ResumeDocument[]>();
  private activities = new Map<string, ActivityRecord[]>();

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async createUser(user: UserRecord): Promise<void> {
    this.users.set(user.email, user);
    this.users.set(user.id, user);
  }

  async getCareerContext(userId: string): Promise<CareerContextRecord | null> {
    return this.careerContexts.get(userId) || null;
  }

  async upsertCareerContext(context: CareerContextRecord): Promise<void> {
    this.careerContexts.set(context.userId, context);
  }

  async getRoadmap(userId: string): Promise<RoadmapMilestone[]> {
    return this.roadmaps.get(userId) || [];
  }

  async saveRoadmap(userId: string, milestones: RoadmapMilestone[]): Promise<void> {
    this.roadmaps.set(userId, milestones);
  }

  async getAssessmentCatalog(): Promise<AssessmentTest[]> {
    return this.assessmentCatalog;
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    return this.assessmentResults.get(userId) || [];
  }

  async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    const list = this.assessmentResults.get(result.userId) || [];
    list.unshift(result);
    this.assessmentResults.set(result.userId, list);
  }

  async getTechInterviews(userId: string): Promise<TechInterviewSession[]> {
    return this.techInterviews.get(userId) || [];
  }

  async saveTechInterview(interview: TechInterviewSession): Promise<void> {
    const list = this.techInterviews.get(interview.userId) || [];
    list.unshift(interview);
    this.techInterviews.set(interview.userId, list);
  }

  async getHRInterviews(userId: string): Promise<HRInterviewSession[]> {
    return this.hrInterviews.get(userId) || [];
  }

  async saveHRInterview(interview: HRInterviewSession): Promise<void> {
    const list = this.hrInterviews.get(interview.userId) || [];
    list.unshift(interview);
    this.hrInterviews.set(interview.userId, list);
  }

  async getResumes(userId: string): Promise<ResumeDocument[]> {
    return this.resumes.get(userId) || [];
  }

  async saveResume(resume: ResumeDocument): Promise<void> {
    const list = this.resumes.get(resume.userId) || [];
    list.unshift(resume);
    this.resumes.set(resume.userId, list);
  }

  async saveUploadedFile(resume: ResumeUploadInput): Promise<void> {
    // ResumeUploadInput extends ResumeDocument; the extra file metadata fields
    // are simply not represented in the in-memory resume store.
    await this.saveResume(resume);
  }

  async getActivities(userId: string): Promise<ActivityRecord[]> {
    return this.activities.get(userId) || [];
  }

  async saveActivity(activity: ActivityRecord): Promise<void> {
    const list = this.activities.get(activity.userId) || [];
    list.unshift(activity);
    this.activities.set(activity.userId, list.slice(0, 50));
  }
}

/** Shared in-memory driver: data survives across requests within the process. */
const memoryDriver = new MemoryDriver();

// ---------------------------------------------------------------------------
// D1 driver (production)
// ---------------------------------------------------------------------------

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  role: string | null;
  created_at: string | null;
}

interface CareerContextRow {
  id: string;
  user_id: string;
  target_role: string | null;
  target_industry: string | null;
  seniority_level: string | null;
  skills_summary: string | null;
  readiness_score: number | null;
  ats_score: number | null;
  assessment_score: number | null;
  interview_score: number | null;
  updated_at: string | null;
}

interface RoadmapRow {
  user_id: string;
  stages: string;
}

interface CatalogRow {
  id: string;
  title: string;
  category: string | null;
  skill: string | null;
  difficulty: string | null;
  question_count: number | null;
  duration_minutes: number | null;
  questions: string;
}

interface AssessmentRow {
  id: string;
  test_id: string | null;
  test_title: string | null;
  skill: string | null;
  score: number | null;
  total_questions: number | null;
  correct_count: number | null;
  level_reached: string | null;
  created_at: string;
}

interface TechInterviewRow {
  id: string;
  title: string;
  language: string | null;
  difficulty: string | null;
  problem_statement: string;
  starter_code: string | null;
  test_cases: string | null;
  user_code: string | null;
  status: string | null;
  score: number | null;
  feedback: string | null;
  completed_at: string | null;
}

interface HRInterviewRow {
  id: string;
  category: string;
  question: string;
  scenario: string | null;
  user_response: string | null;
  status: string | null;
  feedback: string | null;
  completed_at: string | null;
}

interface DocumentRow {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  file_data: string | null;
  parsed_summary: string | null;
  ats_score: number | null;
  suggested_keywords: string | null;
  missing_keywords: string | null;
  uploaded_at: string;
}

interface ActivityRow {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  timestamp: string | null;
  created_at: string;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export class D1Driver implements StorageDriver {
  constructor(private db: D1Database) {}

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM users WHERE email = ?1")
      .bind(email.toLowerCase())
      .first<UserRow>();
    return row ? mapUser(row) : null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM users WHERE id = ?1")
      .bind(id)
      .first<UserRow>();
    return row ? mapUser(row) : null;
  }

  async createUser(user: UserRecord): Promise<void> {
    await this.db
      .prepare(
        "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?1, ?2, ?3, ?4, ?5, COALESCE(?6, datetime('now')))"
      )
      .bind(user.id, user.email.toLowerCase(), user.name, user.passwordHash, user.role, user.createdAt)
      .run();
  }

  async getCareerContext(userId: string): Promise<CareerContextRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM career_contexts WHERE user_id = ?1 LIMIT 1")
      .bind(userId)
      .first<CareerContextRow>();
    return row ? mapCareerContext(row) : null;
  }

  async upsertCareerContext(context: CareerContextRecord): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO career_contexts
           (id, user_id, target_role, target_industry, seniority_level, skills_summary,
            readiness_score, ats_score, assessment_score, interview_score, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
         ON CONFLICT(user_id) DO UPDATE SET
           target_role = excluded.target_role,
           target_industry = excluded.target_industry,
           seniority_level = excluded.seniority_level,
           skills_summary = excluded.skills_summary,
           readiness_score = excluded.readiness_score,
           ats_score = excluded.ats_score,
           assessment_score = excluded.assessment_score,
           interview_score = excluded.interview_score,
           updated_at = excluded.updated_at`
      )
      .bind(
        context.id,
        context.userId,
        context.targetRole ?? null,
        context.targetIndustry ?? null,
        context.seniorityLevel ?? null,
        context.skills ? JSON.stringify(context.skills) : null,
        context.readinessScore ?? 0,
        context.atsScore ?? 0,
        context.assessmentScore ?? 0,
        context.interviewScore ?? 0,
        context.updatedAt ?? new Date().toISOString()
      )
      .run();
  }

  async getRoadmap(userId: string): Promise<RoadmapMilestone[]> {
    const row = await this.db
      .prepare("SELECT user_id, stages FROM career_roadmaps WHERE user_id = ?1 LIMIT 1")
      .bind(userId)
      .first<RoadmapRow>();
    return row ? parseJson<RoadmapMilestone[]>(row.stages, []) : [];
  }

  async saveRoadmap(userId: string, milestones: RoadmapMilestone[]): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO career_roadmaps (id, user_id, stages, updated_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(user_id) DO UPDATE SET stages = excluded.stages, updated_at = excluded.updated_at`
      )
      .bind(`roadmap_${userId}`, userId, JSON.stringify(milestones), new Date().toISOString())
      .run();
  }

  async getAssessmentCatalog(): Promise<AssessmentTest[]> {
    // Provision the question bank from the canonical static catalog on first use.
    const { results } = await this.db.prepare("SELECT COUNT(*) AS count FROM assessment_catalog").all<{ count: number }>();
    if ((results[0]?.count ?? 0) === 0) {
      for (const test of INITIAL_ASSESSMENTS) {
        await this.db
          .prepare(
            `INSERT INTO assessment_catalog
               (id, title, category, skill, difficulty, question_count, duration_minutes, questions)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
          )
          .bind(
            test.id,
            test.title,
            test.category,
            test.skill,
            test.difficulty,
            test.questionCount,
            test.durationMinutes,
            JSON.stringify(test.questions)
          )
          .run();
      }
    }
    const { results: rows } = await this.db
      .prepare("SELECT * FROM assessment_catalog ORDER BY id")
      .all<CatalogRow>();
    return rows.map(mapCatalogTest);
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM assessments WHERE user_id = ?1 ORDER BY created_at DESC")
      .bind(userId)
      .all<AssessmentRow>();
    return results.map(mapAssessmentResult);
  }

  async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO assessments
           (id, user_id, test_id, test_title, skill, score, total_questions, correct_count, level_reached, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
      )
      .bind(
        result.id,
        result.userId,
        result.testId ?? null,
        result.testTitle ?? null,
        result.skill ?? null,
        result.score ?? null,
        result.totalQuestions ?? null,
        result.correctCount ?? null,
        result.levelReached ?? null,
        result.completedAt ?? new Date().toISOString()
      )
      .run();
  }

  async getTechInterviews(userId: string): Promise<TechInterviewSession[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM tech_interviews WHERE user_id = ?1 ORDER BY created_at DESC")
      .bind(userId)
      .all<TechInterviewRow>();
    return results.map(mapTechInterview);
  }

  async saveTechInterview(interview: TechInterviewSession): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO tech_interviews
           (id, user_id, title, language, difficulty, problem_statement, starter_code,
            test_cases, user_code, status, score, feedback, completed_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`
      )
      .bind(
        interview.id,
        interview.userId,
        interview.title,
        interview.language ?? null,
        interview.difficulty ?? null,
        interview.problemStatement,
        interview.starterCode ?? null,
        JSON.stringify(interview.testCases || []),
        interview.userCode ?? null,
        interview.status ?? null,
        interview.score ?? null,
        JSON.stringify(interview.feedback || null),
        interview.completedAt ?? null,
        new Date().toISOString()
      )
      .run();
  }

  async getHRInterviews(userId: string): Promise<HRInterviewSession[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM hr_interviews WHERE user_id = ?1 ORDER BY created_at DESC")
      .bind(userId)
      .all<HRInterviewRow>();
    return results.map(mapHRInterview);
  }

  async saveHRInterview(interview: HRInterviewSession): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO hr_interviews
           (id, user_id, category, question, scenario, user_response, status, feedback, completed_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
      )
      .bind(
        interview.id,
        interview.userId,
        interview.category,
        interview.question,
        interview.scenario ?? null,
        interview.userResponse ?? null,
        interview.status ?? null,
        JSON.stringify(interview.feedback || null),
        interview.completedAt ?? null,
        new Date().toISOString()
      )
      .run();
  }

  async getResumes(userId: string): Promise<ResumeDocument[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM documents WHERE user_id = ?1 ORDER BY uploaded_at DESC")
      .bind(userId)
      .all<DocumentRow>();
    return results.map((row) => ({
      id: row.id,
      userId,
      fileName: row.file_name,
      fileSize: row.file_size,
      uploadDate: row.uploaded_at,
      parsedSummary: row.parsed_summary || "",
      atsScore: row.ats_score ?? 0,
      suggestedKeywords: parseJson<string[]>(row.suggested_keywords, []),
      missingKeywords: parseJson<string[]>(row.missing_keywords, []),
    }));
  }

  async saveResume(resume: ResumeDocument): Promise<void> {
    await this.saveUploadedFile(resume);
  }

  async saveUploadedFile(resume: ResumeUploadInput): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO documents
           (id, user_id, file_name, file_type, file_size, file_data, parsed_summary,
            ats_score, suggested_keywords, missing_keywords, uploaded_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
      )
      .bind(
        resume.id,
        resume.userId,
        resume.fileName,
        resume.fileType ?? null,
        resume.fileSize ?? 0,
        resume.fileData ?? null,
        resume.parsedSummary ?? "",
        resume.atsScore ?? 0,
        JSON.stringify(resume.suggestedKeywords || []),
        JSON.stringify(resume.missingKeywords || []),
        resume.uploadDate ?? new Date().toISOString(),
        new Date().toISOString()
      )
      .run();
  }

  async getActivities(userId: string): Promise<ActivityRecord[]> {
    const { results } = await this.db
      .prepare("SELECT * FROM activity_logs WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 50")
      .bind(userId)
      .all<ActivityRow>();
    return results.map((row) => ({
      id: row.id,
      userId,
      type: row.type,
      title: row.title || "",
      description: row.description || "",
      timestamp: row.timestamp || row.created_at,
    }));
  }

  async saveActivity(activity: ActivityRecord): Promise<void> {
    await this.db
      .prepare(
        "INSERT INTO activity_logs (id, user_id, type, title, description, timestamp, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
      )
      .bind(
        activity.id,
        activity.userId,
        activity.type,
        activity.title,
        activity.description,
        activity.timestamp,
        new Date().toISOString()
      )
      .run();
  }
}

// Row -> record mappers
function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name || "",
    passwordHash: row.password_hash || "",
    role: (row.role as UserRecord["role"]) || "candidate",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapCareerContext(row: CareerContextRow): CareerContextRecord {
  return {
    id: row.id,
    userId: row.user_id,
    targetRole: row.target_role || "Software Engineer",
    targetIndustry: row.target_industry || "Technology",
    seniorityLevel: row.seniority_level || "Mid-Level",
    skills: parseJson<string[]>(row.skills_summary, []),
    readinessScore: row.readiness_score ?? 0,
    atsScore: row.ats_score ?? 0,
    assessmentScore: row.assessment_score ?? 0,
    interviewScore: row.interview_score ?? 0,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapCatalogTest(row: CatalogRow): AssessmentTest {
  return {
    id: row.id,
    title: row.title,
    category: row.category || "",
    skill: row.skill || "",
    difficulty: (row.difficulty as AssessmentTest["difficulty"]) || "Beginner",
    questionCount: row.question_count ?? 0,
    durationMinutes: row.duration_minutes ?? 0,
    questions: parseJson(row.questions, []),
  };
}

function mapAssessmentResult(row: AssessmentRow): AssessmentResult {
  return {
    id: row.id,
    userId: "", // filled by caller via row context
    testId: row.test_id || "",
    testTitle: row.test_title || "",
    skill: row.skill || "",
    score: row.score ?? 0,
    totalQuestions: row.total_questions ?? 0,
    correctCount: row.correct_count ?? 0,
    levelReached: row.level_reached || "",
    completedAt: row.created_at || new Date().toISOString(),
  };
}

function mapTechInterview(row: TechInterviewRow): TechInterviewSession {
  return {
    id: row.id,
    userId: "",
    title: row.title,
    language: row.language || "typescript",
    difficulty: row.difficulty || "Medium",
    problemStatement: row.problem_statement,
    starterCode: row.starter_code || "",
    testCases: parseJson(row.test_cases, []),
    userCode: row.user_code || undefined,
    status: (row.status as TechInterviewSession["status"]) || "completed",
    score: row.score ?? undefined,
    feedback: parseJson(row.feedback, undefined),
    completedAt: row.completed_at || undefined,
  };
}

function mapHRInterview(row: HRInterviewRow): HRInterviewSession {
  return {
    id: row.id,
    userId: "",
    category: row.category,
    question: row.question,
    scenario: row.scenario || "",
    userResponse: row.user_response || undefined,
    status: (row.status as HRInterviewSession["status"]) || "completed",
    feedback: parseJson(row.feedback, undefined),
    completedAt: row.completed_at || undefined,
  };
}

// ---------------------------------------------------------------------------
// DatabaseService (higher-level orchestration shared by both drivers)
// ---------------------------------------------------------------------------

export class DatabaseService {
  constructor(private driver: StorageDriver) {}

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.driver.findUserByEmail(email);
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.driver.findUserById(id);
  }

  async createUser(data: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
    const id = generateId("usr");
    const user: UserRecord = {
      ...data,
      id,
      email: data.email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    await this.driver.createUser(user);

    // Initialize a default career context.
    const context: CareerContextRecord = {
      id: generateId("ctx"),
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
    await this.driver.upsertCareerContext(context);

    // Seed an initial roadmap milestone.
    await this.driver.saveRoadmap(id, [
      {
        id: generateId("ms"),
        title: "Initial Skill Gap Assessment",
        category: "Foundations",
        status: "in-progress",
        estimatedHours: 5,
        description: "Complete your baseline assessment across core language competencies.",
      },
    ]);

    await this.addActivity(id, {
      type: "account",
      title: "Welcome to IntelliHire",
      description: "Your unified career intelligence context has been initialized.",
      timestamp: "Just now",
    });

    return user;
  }

  async getCareerContext(userId: string): Promise<CareerContextRecord | null> {
    return this.driver.getCareerContext(userId);
  }

  async updateCareerContext(userId: string, data: Partial<CareerContextRecord>): Promise<CareerContextRecord> {
    const current = await this.driver.getCareerContext(userId);
    const updated: CareerContextRecord = {
      ...(current || {
        id: generateId("ctx"),
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
    await this.driver.upsertCareerContext(updated);
    return updated;
  }

  async getRoadmap(userId: string): Promise<RoadmapMilestone[]> {
    return this.driver.getRoadmap(userId);
  }

  async addRoadmapMilestone(userId: string, milestone: Omit<RoadmapMilestone, "id">): Promise<RoadmapMilestone> {
    const record: RoadmapMilestone = {
      ...milestone,
      id: generateId("ms"),
    };
    const list = await this.driver.getRoadmap(userId);
    list.push(record);
    await this.driver.saveRoadmap(userId, list);
    return record;
  }

  async updateRoadmapMilestone(
    userId: string,
    milestoneId: string,
    status: RoadmapMilestone["status"]
  ): Promise<RoadmapMilestone | null> {
    const list = await this.driver.getRoadmap(userId);
    const item = list.find((m) => m.id === milestoneId);
    if (!item) return null;
    item.status = status;
    await this.driver.saveRoadmap(userId, list);
    return item;
  }

  async getAssessmentCatalog(): Promise<AssessmentTest[]> {
    return this.driver.getAssessmentCatalog();
  }

  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    const raw = await this.driver.getAssessmentResults(userId);
    return raw.map((r) => ({ ...r, userId }));
  }

  async recordAssessmentResult(result: Omit<AssessmentResult, "id" | "completedAt">): Promise<AssessmentResult> {
    const record: AssessmentResult = {
      ...result,
      id: generateId("res"),
      completedAt: new Date().toISOString(),
    };
    await this.driver.saveAssessmentResult(record);

    // Auto-update career context assessment score.
    const list = await this.driver.getAssessmentResults(result.userId);
    const avgScore = Math.round(list.reduce((acc, r) => acc + r.score, 0) / (list.length || 1));
    await this.updateCareerContext(result.userId, { assessmentScore: avgScore });

    await this.addActivity(result.userId, {
      type: "assessment",
      title: `Assessment Completed: ${result.testTitle}`,
      description: `Scored ${result.score}% (${result.correctCount}/${result.totalQuestions} correct) - ${result.levelReached}`,
      timestamp: "Just now",
    });

    return record;
  }

  async getTechInterviews(userId: string): Promise<TechInterviewSession[]> {
    const raw = await this.driver.getTechInterviews(userId);
    return raw.map((i) => ({ ...i, userId }));
  }

  async createTechInterview(interview: Omit<TechInterviewSession, "id">): Promise<TechInterviewSession> {
    const record: TechInterviewSession = {
      ...interview,
      id: generateId("tech"),
    };
    await this.driver.saveTechInterview(record);
    return record;
  }

  async getHRInterviews(userId: string): Promise<HRInterviewSession[]> {
    const raw = await this.driver.getHRInterviews(userId);
    return raw.map((i) => ({ ...i, userId }));
  }

  async createHRInterview(interview: Omit<HRInterviewSession, "id">): Promise<HRInterviewSession> {
    const record: HRInterviewSession = {
      ...interview,
      id: generateId("hr"),
    };
    await this.driver.saveHRInterview(record);
    return record;
  }

  async getResumes(userId: string): Promise<ResumeDocument[]> {
    const raw = await this.driver.getResumes(userId);
    return raw.map((r) => ({ ...r, userId }));
  }

  async saveResume(resume: Omit<ResumeDocument, "id" | "uploadDate">): Promise<ResumeDocument> {
    const record: ResumeDocument = {
      ...resume,
      id: generateId("doc"),
      uploadDate: new Date().toISOString(),
    };
    await this.driver.saveResume(record);

    await this.updateCareerContext(resume.userId, { atsScore: resume.atsScore });
    await this.addActivity(resume.userId, {
      type: "resume",
      title: "Resume Uploaded & Analyzed",
      description: `${resume.fileName} scored ${resume.atsScore}/100 ATS compatibility.`,
      timestamp: "Just now",
    });

    return record;
  }

  /** Persist a raw uploaded file (base64) durably behind the storage abstraction. */
  async saveUploadedFile(resumeInput: Omit<ResumeUploadInput, "id" | "uploadDate">): Promise<ResumeDocument> {
    const record: ResumeUploadInput = {
      ...resumeInput,
      id: generateId("doc"),
      uploadDate: new Date().toISOString(),
    };
    await this.driver.saveUploadedFile(record);
    return record;
  }

  async getActivities(userId: string): Promise<ActivityRecord[]> {
    const raw = await this.driver.getActivities(userId);
    return raw.map((a) => ({ ...a, userId }));
  }

  async addActivity(userId: string, activity: Omit<ActivityRecord, "id" | "userId">): Promise<ActivityRecord> {
    const record: ActivityRecord = {
      ...activity,
      id: generateId("act"),
      userId,
    };
    await this.driver.saveActivity(record);
    return record;
  }
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Symbol key under which the `@cloudflare/next-on-pages` runtime stores the
 * current request context on `globalThis` when running on Cloudflare Pages.
 * Read it directly to obtain the `env` bindings (including `DB`) without
 * importing the library (whose ambient Workers types conflict with the DOM
 * lib used by client components in this single-tsconfig project).
 */
const CLOUDFLARE_REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__");

interface CloudflareRequestContext {
  env?: DbEnv;
  cf?: unknown;
  ctx?: unknown;
}

/** Resolve the current request's Cloudflare `env`, or `undefined` in local dev. */
function currentCloudflareEnv(): DbEnv | undefined {
  try {
    const ctx = (globalThis as Record<symbol, unknown>)[CLOUDFLARE_REQUEST_CONTEXT] as
      | CloudflareRequestContext
      | undefined;
    return ctx?.env;
  } catch {
    return undefined;
  }
}

/**
 * Build a `DatabaseService` for the given Cloudflare env. Falls back to the
 * shared in-memory driver when no D1 binding is present (local development).
 */
export function getDb(env?: DbEnv): DatabaseService {
  return env && env.DB ? new DatabaseService(new D1Driver(env.DB)) : new DatabaseService(memoryDriver);
}

/**
 * Resolve the current request's D1 binding and return a request-scoped service.
 * When not running on the Cloudflare runtime (local `next dev` / `next build`),
 * gracefully falls back to the in-memory driver so the app remains functional
 * without Cloudflare bindings.
 */
export function requestDb(): DatabaseService {
  return getDb(currentCloudflareEnv());
}
