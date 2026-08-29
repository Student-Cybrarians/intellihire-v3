import { cookies } from "next/headers";
import { JWT, SignJWT, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "intellihire-secret-key-dev";
const JWT_EXPIRY = "7d";

export interface SessionData {
  userId: string;
  email: string;
  role?: string;
}

export async function createSession(data: SessionData) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(secret);

  return token;
}

export async function verifySession(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const verified = await verify(token, secret) as SessionData;
    return verified;
  } catch (e) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  return verifySession(token);
}

export function requireAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const session = verifySession(token);
  if (!session) {
    return { error: "Invalid session", status: 401 };
  }

  return { session, status: 200 };
}
