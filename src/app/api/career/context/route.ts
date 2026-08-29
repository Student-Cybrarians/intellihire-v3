import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";

/**
 * Whitelist of fields a client may update on their own career context.
 * Identity fields (`id`, `userId`, `updatedAt`) are intentionally absent so a
 * request can never redirect the write to another user's record.
 */
const careerContextUpdateSchema = z.object({
  targetRole: z.string().trim().min(1).max(200).optional(),
  targetIndustry: z.string().trim().min(1).max(200).optional(),
  seniorityLevel: z.string().trim().min(1).max(100).optional(),
  skills: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  readinessScore: z.number().int().min(0).max(100).optional(),
  atsScore: z.number().min(0).max(100).optional(),
  assessmentScore: z.number().min(0).max(100).optional(),
  interviewScore: z.number().min(0).max(100).optional(),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await db.getCareerContext(user.id);
    if (!context) {
      return NextResponse.json({ error: "Career context not found" }, { status: 404 });
    }

    return NextResponse.json({ context });
  } catch (error) {
    console.error("Get career context error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // zod objects strip unknown keys, so client-supplied `id`/`userId`/`updatedAt`
    // are dropped here before they reach the database layer.
    const result = careerContextUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    if (Object.keys(result.data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Always scope the write to the authenticated user's own record.
    const updated = await db.updateCareerContext(user.id, result.data);

    return NextResponse.json({ context: updated });
  } catch (error) {
    console.error("Update career context error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
