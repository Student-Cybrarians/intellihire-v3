import { NextResponse } from "next/server";
import { requestDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Upload endpoint.
 *
 * R2 object storage is not yet enabled on the account, so uploaded resume
 * files are persisted durably as base64 in D1 behind the storage abstraction
 * (`DatabaseService#saveUploadedFile`). This keeps uploads real and durable
 * today; swapping to R2 later only requires replacing the storage backend,
 * not this handler.
 *
 * Request body: { fileName, fileType, fileSize, fileData } where fileData is
 * a base64-encoded string of the file contents.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileType, fileSize, fileData } = body;

    if (!fileName || !fileType || typeof fileSize !== "number" || !fileData) {
      return NextResponse.json(
        { error: "File data required: fileName, fileType, fileSize, fileData (base64)" },
        { status: 400 }
      );
    }

    const db = requestDb();
    const stored = await db.saveUploadedFile({
      userId: user.id,
      fileName,
      fileType,
      fileSize,
      fileData,
      parsedSummary: "",
      atsScore: 0,
      suggestedKeywords: [],
      missingKeywords: [],
    });

    return NextResponse.json({
      success: true,
      upload: {
        id: stored.id,
        fileName: stored.fileName,
        fileSize: stored.fileSize,
        storageKey: `d1://${stored.id}`,
        uploadDate: stored.uploadDate,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
