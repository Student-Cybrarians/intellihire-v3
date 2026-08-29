import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseService, MemoryDriver, generateId } from "./db";
import type { AssessmentResult, TechInterviewSession, HRInterviewSession } from "./db";

/**
 * Every test gets a fresh in-memory driver so tests are isolated and
 * deterministic. `DatabaseService` is pure orchestration over the driver and
 * is fully instantiable in Node without any Cloudflare binding.
 */
let db: DatabaseService;
let driver: MemoryDriver;

beforeEach(() => {
  driver = new MemoryDriver();
  db = new DatabaseService(driver);
});

describe("DatabaseService user registration", () => {
  it("registers a user with a generated id and lowercased email", async () => {
    const user = await db.createUser({
      email: "Alice@Example.com",
      name: "Alice",
      passwordHash: "hash",
      role: "candidate",
    });
    expect(user.id).toMatch(/^usr_/);
    expect(user.createdAt).toBeTruthy();
    // DatabaseService lowercases email on registration
    expect(user.email).toBe("alice@example.com");

    // findable by both id and normalized email
    const byId = await db.findUserById(user.id);
    expect(byId?.name).toBe("Alice");
    const byEmail = await db.findUserByEmail("alice@example.com");
    expect(byEmail?.id).toBe(user.id);
  });

  it("bootstraps a default career context, roadmap milestone, and welcome activity", async () => {
    const user = await db.createUser({
      email: "bob@example.com",
      name: "Bob",
      passwordHash: "hash",
      role: "candidate",
    });

    const context = await db.getCareerContext(user.id);
    expect(context).not.toBeNull();
    expect(context?.targetRole).toBe("Software Engineer");
    expect(context?.readinessScore).toBe(75);
    expect(context?.skills).toContain("TypeScript");

    const roadmap = await db.getRoadmap(user.id);
    expect(roadmap).toHaveLength(1);
    expect(roadmap[0].title).toBe("Initial Skill Gap Assessment");
    expect(roadmap[0].status).toBe("in-progress");

    const activities = await db.getActivities(user.id);
    expect(activities.map((a) => a.type)).toContain("account");
  });
});

describe("DatabaseService career context", () => {
  it("upserts and partially updates career context, preserving other fields", async () => {
    const user = await db.createUser({
      email: "carol@example.com",
      name: "Carol",
      passwordHash: "hash",
      role: "candidate",
    });

    const updated = await db.updateCareerContext(user.id, {
      targetRole: "Staff Engineer",
      atsScore: 92,
    });
    expect(updated.targetRole).toBe("Staff Engineer");
    expect(updated.atsScore).toBe(92);

    const reloaded = await db.getCareerContext(user.id);
    expect(reloaded?.targetRole).toBe("Staff Engineer");
    // untouched fields preserved from the seed defaults
    expect(reloaded?.seniorityLevel).toBe("Mid-Level");
    expect(reloaded?.updatedAt).toBeTruthy();
  });

  it("creates a fresh context when none exists (update on unknown user)", async () => {
    const created = await db.updateCareerContext("usr_ghost", { targetRole: "Data Engineer" });
    expect(created.userId).toBe("usr_ghost");
    expect(created.targetRole).toBe("Data Engineer");
    expect(created.skills).toEqual([]);
  });
});

describe("DatabaseService roadmap", () => {
  it("adds milestones with generated ids and updates their status", async () => {
    const user = await db.createUser({
      email: "dave@example.com",
      name: "Dave",
      passwordHash: "hash",
      role: "candidate",
    });

    const added = await db.addRoadmapMilestone(user.id, {
      title: "Advanced React Patterns",
      category: "Frontend",
      status: "pending",
      estimatedHours: 8,
      description: "Deep dive into render props and hooks.",
    });
    expect(added.id).toMatch(/^ms_/);

    const updated = await db.updateRoadmapMilestone(user.id, added.id, "completed");
    expect(updated?.status).toBe("completed");

    const list = await db.getRoadmap(user.id);
    expect(list).toHaveLength(2);
    expect(list.find((m) => m.id === added.id)?.status).toBe("completed");
  });

  it("returns null when updating a nonexistent milestone", async () => {
    const user = await db.createUser({
      email: "erin@example.com",
      name: "Erin",
      passwordHash: "hash",
      role: "candidate",
    });
    expect(await db.updateRoadmapMilestone(user.id, "ms_nope", "completed")).toBeNull();
  });
});

describe("DatabaseService assessments", () => {
  it("returns the seeded catalog from the canonical static bank", async () => {
    const catalog = await db.getAssessmentCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    for (const test of catalog) {
      expect(test.id).toMatch(/^test_/);
      expect(test.questions.length).toBeGreaterThan(0);
      expect(["Beginner", "Intermediate", "Advanced", "Expert"]).toContain(
        test.difficulty
      );
    }
  });

  it("records an assessment result and updates the career context score", async () => {
    const user = await db.createUser({
      email: "frank@example.com",
      name: "Frank",
      passwordHash: "hash",
      role: "candidate",
    });

    const result: Omit<AssessmentResult, "id" | "completedAt"> = {
      userId: user.id,
      testId: "test_ts_adv",
      testTitle: "TypeScript Advanced",
      skill: "TypeScript",
      score: 90,
      totalQuestions: 4,
      correctCount: 4,
      levelReached: "Advanced",
    };

    const saved = await db.recordAssessmentResult(result);
    expect(saved.id).toMatch(/^res_/);

    const results = await db.getAssessmentResults(user.id);
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe(user.id);
    expect(results[0].levelReached).toBe("Advanced");

    // career context assessment score reflects the average
    const context = await db.getCareerContext(user.id);
    expect(context?.assessmentScore).toBe(90);

    const activities = await db.getActivities(user.id);
    expect(activities.map((a) => a.type)).toContain("assessment");
  });
});

describe("DatabaseService interviews", () => {
  it("saves and retrieves tech interviews scoped to the user", async () => {
    const user = await db.createUser({
      email: "grace@example.com",
      name: "Grace",
      passwordHash: "hash",
      role: "candidate",
    });

    const interview: Omit<TechInterviewSession, "id"> = {
      userId: user.id,
      title: "Two Sum Optimized",
      language: "typescript",
      difficulty: "Medium",
      problemStatement: "Find indices that sum to target.",
      starterCode: "function twoSum(nums: number[], target: number): number[] {}",
      testCases: [{ input: "[2,7,11,15], 9", expected: "[0,1]" }],
      status: "completed",
      score: 95,
      feedback: { correctness: 100, codeQuality: 90, efficiency: 95, notes: "Great" },
      completedAt: new Date().toISOString(),
    };

    const saved = await db.createTechInterview(interview);
    expect(saved.id).toMatch(/^tech_/);

    const list = await db.getTechInterviews(user.id);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Two Sum Optimized");
    expect(list[0].score).toBe(95);
    expect(list[0].userId).toBe(user.id);
  });

  it("saves and retrieves HR interviews scoped to the user", async () => {
    const user = await db.createUser({
      email: "heidi@example.com",
      name: "Heidi",
      passwordHash: "hash",
      role: "candidate",
    });

    const interview: Omit<HRInterviewSession, "id"> = {
      userId: user.id,
      category: "Leadership",
      question: "Tell me about a conflict you resolved.",
      scenario: "Team disagreement over a deadline.",
      userResponse: "STAR response...",
      status: "completed",
      feedback: {
        starScore: 85,
        communicationScore: 88,
        leadershipScore: 90,
        critique: "Strong structure",
        improvements: ["Add metrics"],
      },
      completedAt: new Date().toISOString(),
    };

    const saved = await db.createHRInterview(interview);
    expect(saved.id).toMatch(/^hr_/);

    const list = await db.getHRInterviews(user.id);
    expect(list).toHaveLength(1);
    expect(list[0].category).toBe("Leadership");
    expect(list[0].feedback?.starScore).toBe(85);
  });
});

describe("DatabaseService resumes & activity", () => {
  it("saves a resume and updates the career ATS score", async () => {
    const user = await db.createUser({
      email: "ivan@example.com",
      name: "Ivan",
      passwordHash: "hash",
      role: "candidate",
    });

    const resume = await db.saveResume({
      userId: user.id,
      fileName: "ivan-resume.pdf",
      fileSize: 1024,
      parsedSummary: "Full-stack engineer with 5 years experience.",
      atsScore: 88,
      suggestedKeywords: ["React", "Node.js"],
      missingKeywords: ["Kubernetes"],
    });
    expect(resume.id).toMatch(/^doc_/);

    const list = await db.getResumes(user.id);
    expect(list).toHaveLength(1);
    expect(list[0].fileName).toBe("ivan-resume.pdf");

    const context = await db.getCareerContext(user.id);
    expect(context?.atsScore).toBe(88);

    expect((await db.getActivities(user.id)).map((a) => a.type)).toContain("resume");
  });

  it("persists an uploaded resume (base64) without throwing", async () => {
    const user = await db.createUser({
      email: "judy@example.com",
      name: "Judy",
      passwordHash: "hash",
      role: "candidate",
    });

    const base64 = Buffer.from("fake-pdf-content").toString("base64");
    expect(typeof base64).toBe("string");
    const record = await db.saveUploadedFile({
      userId: user.id,
      fileName: "judy-resume.pdf",
      fileType: "application/pdf",
      fileSize: 1200,
      parsedSummary: "PDF resume.",
      atsScore: 91,
      suggestedKeywords: ["AWS"],
      missingKeywords: ["Docker"],
      fileData: base64,
    });
    expect(record.id).toMatch(/^doc_/);

    const list = await db.getResumes(user.id);
    expect(list).toHaveLength(1);
    expect(list[0].fileName).toBe("judy-resume.pdf");
  });

  it("logs activities newest-first, scoped per user", async () => {
    const user = await db.createUser({
      email: "karl@example.com",
      name: "Karl",
      passwordHash: "hash",
      role: "candidate",
    });
    await db.addActivity(user.id, { type: "resume", title: "First", description: "", timestamp: "1" });
    await db.addActivity(user.id, { type: "assessment", title: "Second", description: "", timestamp: "2" });

    const activities = await db.getActivities(user.id);
    // unshift => newest first
    expect(activities[0].title).toBe("Second");

    // isolated from other users
    const other = await db.getActivities("usr_none");
    expect(other).toEqual([]);
  });
});

describe("generateId", () => {
  it("produces prefixed, unique ids", () => {
    const a = generateId("usr");
    const b = generateId("usr");
    expect(a).toMatch(/^usr_/);
    expect(a).not.toBe(b);
  });
});
