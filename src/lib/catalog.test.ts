import { describe, it, expect } from "vitest";
import { INITIAL_ASSESSMENTS } from "./catalog";

const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

describe("INITIAL_ASSESSMENTS catalog", () => {
  it("has non-empty catalog with unique ids", () => {
    expect(INITIAL_ASSESSMENTS.length).toBeGreaterThan(0);
    const ids = INITIAL_ASSESSMENTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^test_[a-z_]+$/);
    }
  });

  it("shapes each assessment test correctly", () => {
    for (const test of INITIAL_ASSESSMENTS) {
      expect(test.title).toBeTruthy();
      expect(test.category).toBeTruthy();
      expect(test.skill).toBeTruthy();
      expect(test.questionCount).toBe(test.questions.length);
      expect(test.durationMinutes).toBeGreaterThan(0);
      expect(Array.isArray(test.questions)).toBe(true);
    }
  });

  it("enumerates only valid difficulty levels", () => {
    for (const test of INITIAL_ASSESSMENTS) {
      expect(VALID_DIFFICULTIES).toContain(test.difficulty);
    }
  });

  it("has well-formed questions with a correct answer", () => {
    const total = INITIAL_ASSESSMENTS.reduce((n, t) => n + t.questions.length, 0);
    expect(total).toBeGreaterThan(0);
    for (const test of INITIAL_ASSESSMENTS) {
      for (const q of test.questions) {
        expect(q.id).toBeTruthy();
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBeGreaterThan(0);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation).toBeTruthy();
      }
    }
  });
});
