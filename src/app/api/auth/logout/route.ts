import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  // Blacklist the current token's jti (KV-backed) so it cannot be replayed,
  // then drop the session cookie.
  await revokeCurrentSession();

  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
