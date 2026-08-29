import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requestDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    const db = requestDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await db.getActivities(user.id);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
