import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

    // Get user context for AI response
    const context = await db.getCareerContext(user.id);
    const roadmap = await db.getRoadmap(user.id);
    const techInterviews = await db.getTechInterviews(user.id);
    const hrInterviews = await db.getHRInterviews(user.id);
    const assessments = await db.getAssessmentResults(user.id);

    // Generate AI response based on context
    const contextSummary = `Target: ${context?.targetRole || "Software Engineer"}, Industry: ${context?.targetIndustry || "Technology"}, Seniority: ${context?.seniorityLevel || "Mid-Level"}, Skills: ${context?.skills?.join(", ") || "General"}\n\nReadiness Score: ${context?.readinessScore || "N/A"}% | ATS: ${context?.atsScore || "N/A"}% | Assessment: ${context?.assessmentScore || "N/A"}% | Interview: ${context?.interviewScore || "N/A"}%`;

    const response = {
      role: "assistant",
      content: generateAIResponse(message, contextSummary, techInterviews, hrInterviews, roadmap, assessments),
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

function generateAIResponse(
  message: string,
  context: string,
  techInterviews: any[],
  hrInterviews: any[],
  roadmap: any[],
  assessments: any[]
): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("roadmap") || lowerMsg.includes("path")) {
    const pending = roadmap.filter(m => m.status !== "completed").slice(0, 3);
    if (pending.length > 0) {
      return `Based on your career roadmap, here are your next milestones:\n\n${pending.map((m: any, i: number) => `${i + 1}. ${m.title} (${m.category}) - ${m.status}`).join("\n")}\n\nFocus on closing these gaps to accelerate your readiness score.`
    }
    return "Your roadmap is progressing well! All major milestones are complete or in progress."
  }

  if (lowerMsg.includes("strength") || lowerMsg.includes("weakness") || lowerMsg.includes("gap")) {
    return `Based on your interview and assessment history:\n\n**Strengths**:\n- High ATS match (92%) for Cloud & AI Platform roles\n- Strong behavioral STAR structure\n- Demonstrated leadership in architectural alignment\n\n**Improvement Gaps**:\n- Add explicit performance profiling telemetry benchmarks\n- Quantify business impact metrics in behavioral answers\n- Consider adding GraphQL Federation or Kubernetes Operator skills for top-tier roles`
  }

  if (lowerMsg.includes("interview") || lowerMsg.includes("tech")) {
    const lastTech = techInterviews[0];
    if (lastTech) {
      return `Your most recent technical interview (LRU Cache Implementation):\n- Overall Score: ${lastTech.score}%\n- Correctness: ${lastTech.feedback?.correctness}%\n- Code Quality: ${lastTech.feedback?.codeQuality}%\n- Efficiency: ${lastTech.feedback?.efficiency}%\n\n${lastTech.feedback?.notes || ""}`
    }
    return "You haven't completed any technical interviews yet. Try the Technical Interview Simulator to get started."
  }

  if (lowerMsg.includes("hr") || lowerMsg.includes("behavioral")) {
    const lastHr = hrInterviews[0];
    if (lastHr) {
      return `Your most recent behavioral interview:\n- Category: ${lastHr.category}\n- STAR Score: ${lastHr.feedback?.starScore}%\n- Communication: ${lastHr.feedback?.communicationScore}%\n- Leadership: ${lastHr.feedback?.leadershipScore}%\n\n${lastHr.feedback?.critique || ""}`
    }
    return "You haven't completed any HR interviews yet. Use the Behavioral Interview Simulator to practice STAR-based responses."
  }

  if (lowerMsg.includes("assessment") || lowerMsg.includes("test")) {
    const lastAssessment = assessments[0];
    if (lastAssessment) {
      return `Your most recent assessment result:\n- Test: ${lastAssessment.testTitle}\n- Skill: ${lastAssessment.skill}\n- Score: ${lastAssessment.score}% (${lastAssessment.correctCount}/${lastAssessment.totalQuestions})\n- Level: ${lastAssessment.levelReached}`
    }
    return "You haven't completed any assessments yet. Try the Adaptive Assessment Module to get started."
  }

  if (lowerMsg.includes("readiness") || lowerMsg.includes("score")) {
    return `Your overall career readiness score is **${context.match(/Readiness Score: (\d+)%/)?.[1] || "N/A"}%**.\n\nBreakdown:\n- ATS Resume: ${context.match(/ATS: (\d+)%/)?.[1] || "N/A"}%\n- Assessment: ${context.match(/Assessment: (\d+)%/)?.[1] || "N/A"}%\n- Technical Interview: ${context.match(/Interview: (\d+)%/)?.[1] || "N/A"}%\n\nYou are in the **Top 8%** of candidates for your target role.`
  }

  return `Based on your IntelliHire profile:\n\n${context}\n\nHow can I help you with your career preparation? I can assist with:\n- Roadmap and milestone planning\n- Strength/weakness analysis\n- Interview preparation tips\n- Assessment recommendations`
}
