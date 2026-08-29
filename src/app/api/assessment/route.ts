import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      tests,
      results,
    });
  } catch (error) {
    console.error("Assessment catalog fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
