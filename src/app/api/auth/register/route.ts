import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestDb } from "@/lib/db";
import { hashPassword, createToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { clientIp, isThrottled, throttleRetryAfter, recordFailure, recordSuccess } from "@/lib/rate-limit";

/**
 * Registration schema. Deliberately has NO `role` field: the server always
 * grants new accounts the least-privileged "candidate" role, so a client can
 * never self-assign recruiter/admin.
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // match 24h token expiry

export async function POST(req: NextRequest) {
  try {
    const db = requestDb();
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const ip = clientIp(req);

    // Throttle repeated registration attempts per (ip, attempted email).
    if (await isThrottled("register", ip, email)) {
      const retryAfter = await throttleRetryAfter("register", ip, email);
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // Check if user already exists.
    const existing = await db.findUserByEmail(email);
    if (existing) {
      // Anti-enumeration: indistinguishable from success (HTTP 200, no session).
      // Equalize timing against the real registration path and count the attempt
      // so repeated probes against the same address are throttled.
      await hashPassword("intellihire-dummy-registration-password");
      await recordFailure("register", ip, email);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Hash password and store user — always as a "candidate" (server-side).
    const passwordHash = await hashPassword(password);
    const user = await db.createUser({
      name,
      email,
      passwordHash,
      role: "candidate",
    });

    await recordSuccess("register", ip, email);

    // Create session token
    const token = createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
