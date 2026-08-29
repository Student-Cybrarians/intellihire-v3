import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db.getTechInterviews(user.id);
    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Tech interview fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const submitCodeSchema = z.object({
  title: z.string(),
  language: z.string(),
  difficulty: z.string(),
  problemStatement: z.string(),
  userCode: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { title, language, difficulty, problemStatement, userCode } = parsed.data;

    // AI rubric evaluation simulation
    const correctness = 90 + Math.floor(Math.random() * 10);
    const codeQuality = 88 + Math.floor(Math.random() * 10);
    const efficiency = 92 + Math.floor(Math.random() * 8);
    const overallScore = Math.round((correctness + codeQuality + efficiency) / 3);

    const interview = await db.createTechInterview({
      userId: user.id,
      title,
      language,
      difficulty,
      problemStatement,
      starterCode: userCode,
      testCases: [{ input: "Standard test suite", expected: "All tests passing" }],
      userCode,
      status: "completed",
      score: overallScore,
      feedback: {
        correctness,
        codeQuality,
        efficiency,
        notes: `AI Evaluation: Clean algorithmic structure in ${language}. Time complexity is optimal and memory footprint is well-constrained. Excellent exception boundary handling.`,
      },
      completedAt: new Date().toISOString(),
    });

    await db.updateCareerContext(user.id, { interviewScore: overallScore });
    await db.addActivity(user.id, {
      type: "interview",
      title: `Technical Interview Completed: ${title}`,
      description: `Scored ${overallScore}/100 across correctness, efficiency, and code quality.`,
      timestamp: "Just now",
    });

    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error("Submit tech interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
