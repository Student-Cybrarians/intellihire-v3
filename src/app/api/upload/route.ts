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
 *
 * Security: mime types are whitelisted, the decoded size is measured
 * server-side (never trusting the client-supplied `fileSize`), and the file
 * name is sanitized before persistence.
 */

/** Allowed resume mime types (pdf, doc, docx, txt). */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
]);

/** Server-enforced maximum decoded payload size: 5 MiB. */
const MAX_DECODED_BYTES = 5 * 1024 * 1024;

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/** Strip path components and control characters from a client-supplied name. */
function sanitizeFileName(raw: string): string {
  // Take only the final path segment (handles both / and \ path separators).
  const base = raw.split(/[\\/]/).pop() || "";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "") // control chars
    .replace(/^\.+/, "") // leading dots (dotfiles / traversal adornments)
    .slice(0, 255)
    .trim();
  return cleaned || "resume";
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const fileName = body.fileName;
    const fileType = body.fileType;
    const fileData = body.fileData;

    if (typeof fileName !== "string" || !fileName.trim()) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }
    if (typeof fileType !== "string" || !ALLOWED_MIME_TYPES.has(fileType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: PDF, DOC, DOCX, TXT" },
        { status: 400 }
      );
    }
    if (typeof fileData !== "string" || fileData.length === 0) {
      return NextResponse.json({ error: "fileData (base64) is required" }, { status: 400 });
    }
    if (fileData.length % 4 !== 0 || !BASE64_RE.test(fileData)) {
      return NextResponse.json({ error: "fileData must be valid base64" }, { status: 400 });
    }

    // Measure the decoded size server-side; never trust client `fileSize`.
    const decoded = Buffer.from(fileData, "base64");
    const decodedBytes = decoded.length;
    if (decodedBytes === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }
    if (decodedBytes > MAX_DECODED_BYTES) {
      const maxMiB = MAX_DECODED_BYTES / (1024 * 1024);
      return NextResponse.json(
        { error: `File exceeds the ${maxMiB} MiB upload limit` },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(fileName);

    const db = requestDb();
    const stored = await db.saveUploadedFile({
      userId: user.id,
      fileName: safeName,
      fileType,
      fileSize: decodedBytes,
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
