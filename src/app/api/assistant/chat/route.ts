import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { askAI } from "@/lib/ai";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = z.object({
      message: z.string().min(3),
    }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const { message } = parsed.data;

    // Get user context for AI response (authorized retrieved data).
    const context = await db.getCareerContext(user.id);
    const roadmap = await db.getRoadmap(user.id);
    const techInterviews = await db.getTechInterviews(user.id);
    const hrInterviews = await db.getHRInterviews(user.id);
    const assessments = await db.getAssessmentResults(user.id);

    const contextSummary = `Target: ${context?.targetRole || "Software Engineer"}, Industry: ${context?.targetIndustry || "Technology"}, Seniority: ${context?.seniorityLevel || "Mid-Level"}, Skills: ${context?.skills?.join(", ") || "General"}\n\nReadiness Score: ${context?.readinessScore || "N/A"}% | ATS: ${context?.atsScore || "N/A"}% | Assessment: ${context?.assessmentScore || "N/A"}% | Interview: ${context?.interviewScore || "N/A"}%`;

    // AI boundary: retrieved/authorized data goes into the SYSTEM turn; the
    // user's raw message goes into the USER turn. Never interpolate user
    // content into the system prompt (treat uploaded content as data).
    const systemPrompt = buildSystemPrompt(contextSummary, {
      roadmap,
      techInterviews,
      hrInterviews,
      assessments,
    });

    const content = await askAI({
      system: systemPrompt,
      user: message,
      maxTokens: 600,
    });

    const response = {
      role: "assistant",
      content,
      context: contextSummary,
    };

    await db.addActivity(user.id, {
      type: "ai",
      title: "AI Assistant Interaction",
      description: `User asked: "${message.substring(0, 50)}..."`,
      timestamp: "Just now",
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI assistant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildSystemPrompt(
  contextSummary: string,
  history: {
    roadmap: any[];
    techInterviews: any[];
    hrInterviews: any[];
    assessments: any[];
  }
): string {
  const { roadmap, techInterviews, hrInterviews, assessments } = history;

  const pendingMilestones = roadmap
    .filter((m) => m.status !== "completed")
    .slice(0, 6)
    .map((m) => `- ${m.title} (${m.category}, ${m.status})`)
    .join("\n") || "None pending.";

  const latestTech = techInterviews[0];
  const techSummary = latestTech
    ? `- ${latestTech.title} — score ${latestTech.score}% (correctness ${latestTech.feedback?.correctness}%, code quality ${latestTech.feedback?.codeQuality}%, efficiency ${latestTech.feedback?.efficiency}%)`
    : "None recorded yet.";

  const latestHr = hrInterviews[0];
  const hrSummary = latestHr
    ? `- ${latestHr.category} — STAR ${latestHr.feedback?.starScore}%, communication ${latestHr.feedback?.communicationScore}%, leadership ${latestHr.feedback?.leadershipScore}%`
    : "None recorded yet.";

  const latestAssessment = assessments[0];
  const assessmentSummary = latestAssessment
    ? `- ${latestAssessment.testTitle} (${latestAssessment.skill}) — ${latestAssessment.score}% (${latestAssessment.correctCount}/${latestAssessment.totalQuestions}), level ${latestAssessment.levelReached}`
    : "None recorded yet.";

  return [
    "You are IntelliHire, a grounded career coach helping a candidate prepare for job interviews and career growth.",
    "",
    "You have access ONLY to the AUTHORIZED user context below (retrieved server-side from the user's own profile).",
    "",
    "CONTEXT:",
    contextSummary,
    "",
    "ROADMAP MILESTONES (pending):",
    pendingMilestones,
    "",
    "RECENT TECHNICAL INTERVIEW:",
    techSummary,
    "",
    "RECENT BEHAVIORAL INTERVIEW:",
    hrSummary,
    "",
    "RECENT ASSESSMENT:",
    assessmentSummary,
    "",
    "RULES:",
    "- Answer ONLY from the provided context plus general, well-known career and interview knowledge.",
    "- NEVER invent user-specific facts, scores, milestones, companies, or experiences. If the context does not contain something, say you don't have that information and suggest how they can add it.",
    "- Be concise, encouraging, and practical. Use short sections and bullet points when helpful.",
    "- Do not expose or echo other users' data.",
  ].join("\n");
}
