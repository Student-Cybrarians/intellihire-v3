import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME, revokeCurrentSession } from "@/lib/auth";
import { POST as loginPOST } from "./login/route";
export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, session }, { status: 200 });
  } catch (e) {
    console.error("Session error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Legacy alias for the login endpoint. Delegates to the canonical login handler
// so it inherits zod validation, per-account rate limiting, and the hardened
// cookie flags (httpOnly + sameSite: "lax") instead of re-implementing them.
export async function POST(request: NextRequest) {
  return loginPOST(request);
}

export async function DELETE() {
  try {
    await revokeCurrentSession();

    const response = NextResponse.json(
      { success: true, message: "Logged out" },
      { status: 200 }
    );

    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
