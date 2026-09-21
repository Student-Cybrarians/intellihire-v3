import { NextResponse } from "next/server";
import { nvidiaNimService } from "@/lib/nvidia-nim-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, temperature, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing or invalid 'messages' array" }, { status: 400 });
    }

    const reply = await nvidiaNimService.chatCompletion(messages, {
      model,
      temperature,
      max_tokens,
    });

    return NextResponse.json({
      success: true,
      model: model || "meta/muse-glimmer-30b",
      content: reply,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to execute chat completion with NVIDIA NIM",
    }, { status: 500 });
  }
}
