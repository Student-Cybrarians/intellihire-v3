import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await db.getCareerContext(user.id);
    const roadmap = await db.getRoadmap(user.id);
    const resumes = await db.getResumes(user.id);

    return NextResponse.json({
      context,
      roadmap,
      resumes,
    });
  } catch (error) {
    console.error("Career hub fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateContextSchema = z.object({
  targetRole: z.string().optional(),
  targetIndustry: z.string().optional(),
  seniorityLevel: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function PUT(req: Request) {
  try {
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
