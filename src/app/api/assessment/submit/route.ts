import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  testId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionIndex: z.number(),
  })),
});

export async function POST(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { testId, answers } = parsed.data;
    const catalog = await db.getAssessmentCatalog();
    const test = catalog.find(t => t.id === testId);

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    for (const answer of answers) {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (question && question.correctIndex === answer.selectedOptionIndex) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / test.questions.length) * 100);
    const levelReached = getLevelForScore(score);

    // Record result
    const result = await db.recordAssessmentResult({
      userId: user.id,
      testId: testId,
      testTitle: test.title,
      skill: test.skill,
      score,
      totalQuestions: test.questions.length,
      correctCount,
      levelReached,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Assessment submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getLevelForScore(score: number): string {
  if (score >= 95) return "Expert (Level 5)";
  if (score >= 85) return "Advanced (Level 4)";
  if (score >= 75) return "Intermediate (Level 3)";
  if (score >= 60) return "Beginner (Level 2)";
  return "Novice (Level 1)";
}
