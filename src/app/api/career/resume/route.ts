import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resumeAnalysisSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  textSnippet: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = resumeAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resume metadata" }, { status: 400 });
    }

    // AI-Powered ATS Score Calculation Simulation
    const { fileName, fileSize } = parsed.data;
    const baseScore = 88 + Math.floor(Math.random() * 8); // 88 - 95

    const resumeDoc = await db.saveResume({
      userId: user.id,
      fileName,
      fileSize,
      parsedSummary: `Analyzed ${fileName}: High technical alignment for ${user.role} role. Strong emphasis on modern edge runtime technologies and system design.`,
      atsScore: baseScore,
      suggestedKeywords: ["Distributed Systems", "Cloudflare Workers", "D1", "Next.js", "TypeScript", "Tailwind CSS", "High Concurrency"],
      missingKeywords: ["GraphQL Federation", "Kubernetes Operator", "Chaos Engineering"],
    });

    return NextResponse.json({ success: true, resume: resumeDoc });
  } catch (error) {
    console.error("Resume processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
