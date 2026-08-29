import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { requestDb } from "./db";
import type { UserRecord } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "intellihire-jwt-secret-key-32-chars-long";
const JWT_EXPIRES_IN = "7d";
export const SESSION_COOKIE_NAME = "intellihire_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getSession();
  if (!session) return null;
  return requestDb().findUserById(session.userId);
}

export async function requireAuth(): Promise<{ session?: SessionPayload; error?: string; status: number }> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }
  return { session, status: 200 };
}
