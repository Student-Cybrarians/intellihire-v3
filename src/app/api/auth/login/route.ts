import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestDb } from "@/lib/db";
import { comparePassword, createToken, hashPassword, SESSION_COOKIE_NAME } from "@/lib/auth";
import { clientIp, isThrottled, throttleRetryAfter, recordFailure, recordSuccess } from "@/lib/rate-limit";
export const runtime = "edge";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(200),
});

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // match 24h token expiry

/**
 * Cost-matching PBKDF2 hash burn used only to equalize the timing between
 * "user not found" and "wrong password" so the endpoint does not leak account
 * existence through response latency. Deliberately discards the result.
 */
async function burnPasswordHash(): Promise<void> {
  await hashPassword("intellihire-timing-equalizer");
}

export async function POST(req: NextRequest) {
  try {
    const db = requestDb();
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const ip = clientIp(req);

    // Throttle failed logins per (ip, account).
    if (await isThrottled("login", ip, email)) {
      const retryAfter = await throttleRetryAfter("login", ip, email);
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // Find user by email; always run a cost-matching password hash to keep
    // timing uniform between "user not found" and "wrong password".
    const user = await db.findUserByEmail(email);
    const passwordMatches = user !== null && (await comparePassword(password, user.passwordHash));
    if (user === null) {
      // No such account: burn a cost-matching hash so the endpoint does not
      // reveal account existence through response latency.
      await burnPasswordHash();
    }

    if (!user || !passwordMatches) {
      await recordFailure("login", ip, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await recordSuccess("login", ip, email);

    // Create session token
    const token = await createToken({
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}
