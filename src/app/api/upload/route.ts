import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "File metadata required: fileName, fileType, fileSize" },
        { status: 400 }
      );
    }

    const r2Key = `resumes/${user.id}/${Date.now()}_${fileName}`;

    return NextResponse.json({
      success: true,
      r2Key,
      uploadUrl: `https://intellihire.is-a.dev/upload/${encodeURIComponent(r2Key)}`,
    });
  } catch (error) {
    console.error("Create upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
