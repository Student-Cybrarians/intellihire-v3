import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import type { AssessmentTest } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Strip the answer key (`correctIndex`, `explanation`) before serving questions
 * to the client. Grading happens server-side in `/api/assessment/submit`, so a
 * client never needs the correct answers; exposing them would let a user score
 * 100% without any skill.
 */
function stripAnswerKey(test: AssessmentTest) {
  return {
    ...test,
    questions: test.questions.map(({ correctIndex: _correctIndex, explanation: _explanation, ...rest }) => rest),
  };
}

export async function GET() {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tests = await db.getAssessmentCatalog();
    const results = await db.getAssessmentResults(user.id);

    return NextResponse.json({
      tests: tests.map(stripAnswerKey),
      results,
    });
  } catch (error) {
    console.error("Assessment catalog fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
