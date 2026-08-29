import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { askAI, isFallback } from "@/lib/ai";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await db.getCareerContext(user.id);
    const roadmap = await db.getRoadmap(user.id);
    const resumes = await db.getResumes(user.id);

    const analysis = await analyzeCareer(context, roadmap, resumes);

    return NextResponse.json({
      context,
      roadmap,
      resumes,
      analysis,
    });
  } catch (error) {
    console.error("Career hub fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Generate an AI career/roadmap readiness analysis grounded in the candidate's
 * real profile (target role, skills, scores, roadmap progress, resumes). Uses a
 * deterministic fallback when the AI binding is unavailable. Never fabricates
 * qualifications: the model is told to reason only from the provided inputs.
 */
async function analyzeCareer(
  context: any,
  roadmap: any[],
  resumes: any[]
): Promise<{ text: string; generatedByAi: boolean }> {
  const targetRole = context?.targetRole || "Software Engineer";
  const skills = context?.skills?.join(", ") || "General";
  const milestoneSummary =
    roadmap.length > 0
      ? roadmap
          .map(
            (m) =>
              `- ${m.title} (${m.category}, ${m.estimatedHours}h, ${m.status})`
          )
          .join("\n")
      : "No roadmap milestones recorded yet.";
  const resumeSummary =
    resumes.length > 0
      ? resumes
          .slice(0, 3)
          .map((r) => `- ${r.fileName}: ATS ${r.atsScore}/100`)
          .join("\n")
      : "No resume analysis recorded yet.";

  const aiText = await askAI({
    system:
      "You are a career coach. Based ONLY on the profile below (target role, skills, scores, roadmap milestones, resume ATS scores), write a concise career readiness analysis: a short overview, 2-3 strengths, and 2-3 recommended next steps prioritized by impact. Do not invent skills, experiences, or companies not shown. Keep it under ~180 words.",
    user: [
      `Target role: ${targetRole}`,
      `Seniority: ${context?.seniorityLevel || "Mid-Level"}`,
      `Skills: ${skills}`,
      `Readiness: ${context?.readinessScore ?? "N/A"}% | ATS: ${context?.atsScore ?? "N/A"}% | Assessment: ${context?.assessmentScore ?? "N/A"}% | Interview: ${context?.interviewScore ?? "N/A"}%`,
      `Roadmap milestones:\n${milestoneSummary}`,
      `Resume analyses:\n${resumeSummary}`,
    ].join("\n\n"),
    maxTokens: 500,
  });

  if (isFallback(aiText)) {
    return {
      text: `Career analysis for ${targetRole} (${context?.seniorityLevel || "Mid-Level"}) with focus on ${skills}. Roadmap has ${
        roadmap.length
      } milestone(s); top pending item: ${
        roadmap.filter((m) => m.status !== "completed")[0]?.title || "none yet"
      }. Complete pending milestones and strengthen resume ATS scores to raise overall readiness.`,
      generatedByAi: false,
    };
  }

  return { text: aiText, generatedByAi: true };
}

const updateContextSchema = z.object({
  targetRole: z.string().optional(),
  targetIndustry: z.string().optional(),
  seniorityLevel: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function PUT(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateContextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const updated = await db.updateCareerContext(user.id, parsed.data);
    await db.addActivity(user.id, {
      type: "career",
      title: "Career Goals Updated",
      description: `Target set to ${updated.targetRole} (${updated.seniorityLevel}) in ${updated.targetIndustry}.`,
      timestamp: "Just now",
    });

    return NextResponse.json({ success: true, context: updated });
  } catch (error) {
    console.error("Career context update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
