import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await db.updateCareerContext(user.id, body);

    return NextResponse.json({ context: updated });
  } catch (error) {
    console.error("Update career context error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
