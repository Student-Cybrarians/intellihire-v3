import { NextResponse } from "next/server";
import { nvidiaNimService } from "@/lib/nvidia-nim-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bullet, targetRole, targetSkills } = body;

    if (!bullet) {
      return NextResponse.json({ error: "Missing 'bullet' parameter" }, { status: 400 });
    }

    const result = await nvidiaNimService.rewriteResumeBulletXyz(
      bullet,
      targetRole || "Principal AI & Distributed Systems Architect",
      targetSkills || ["Python", "PyTorch", "Qdrant", "FastAPI", "Docker"]
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to rewrite resume bullet with NVIDIA NIM",
    }, { status: 500 });
  }
}
