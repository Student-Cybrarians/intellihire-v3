import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const milestoneSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  estimatedHours: z.number().min(1),
  description: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = milestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const milestone = await db.addRoadmapMilestone(user.id, {
      ...parsed.data,
      status: "pending",
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error) {
    console.error("Roadmap creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId, status } = await req.json();
    if (!milestoneId || !status) {
      return NextResponse.json({ error: "milestoneId and status required" }, { status: 400 });
    }

    const updated = await db.updateRoadmapMilestone(user.id, milestoneId, status);
    if (!updated) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error) {
    console.error("Roadmap update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
