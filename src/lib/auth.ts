import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { currentCloudflareEnv, requestDb, requestKv } from "./db";
import type { UserRecord, KvStore } from "./db";

/**
 * Token lifetime. Sessions are deliberately short-lived (24h) so that a leaked
 * cookie has a small window of usefulness; misuse is further mitigated by jti
 * revocation on logout (see `revokeCurrentSession`).
 */
const JWT_EXPIRES_IN = "24h";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

/** bcrypt work factor for password hashing. */
const BCRYPT_COST = 12;

export const SESSION_COOKIE_NAME = "intellihire_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "candidate" | "recruiter" | "admin";
}

interface DecodedToken extends SessionPayload {
  jti?: string;
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// JWT_SECRET (fail closed)
// ---------------------------------------------------------------------------

let jwtSecret: string | undefined = process.env.JWT_SECRET;

/**
 * Test/dev seam: override the JWT secret at runtime (before signing). Not used
 * in production, where the secret always comes from the `JWT_SECRET`
 * environment variable / Pages secret binding.
 */
export function setJwtSecret(secret: string): void {
  jwtSecret = secret;
}

/**
 * Resolve the signing/verification secret. Fails closed in production: there is
 * deliberately NO hardcoded or guessable fallback, so a misconfiguration causes
 * a loud failure instead of silently signing tokens with a known key. Sources,
 * in priority order:
 *   1. runtime override (`setJwtSecret`, used by tests);
 *   2. `process.env.JWT_SECRET` (Node / local dev, re-read lazily);
 *   3. the Cloudflare Pages `JWT_SECRET` binding on the request context;
 *   4. a random ephemeral secret generated per process — used ONLY outside
 *      production so local `next dev` stays functional. It is unguessable and
 *      is never a known key, and sessions do not survive a restart. Production
 *      (NODE_ENV === "production") always throws when JWT_SECRET is missing.
 */
function requireJwtSecret(): string {
  if (jwtSecret) return jwtSecret;
  const fromProcess = process.env.JWT_SECRET;
  if (fromProcess) {
    jwtSecret = fromProcess;
    return fromProcess;
  }
  const fromContext = currentCloudflareEnv()?.JWT_SECRET;
  if (fromContext) {
    jwtSecret = fromContext;
    return fromContext;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is not set. Set the JWT_SECRET environment variable (or Pages secret binding) before using auth in production."
    );
  }
  // Non-production (dev/build/test) fallback: throw away the key on restart.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    jwtSecret = `dev-ephemeral-${crypto.randomUUID()}${crypto.randomUUID()}`;
  } else {
    jwtSecret = `dev-ephemeral-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
  console.warn(
    "[auth] JWT_SECRET is not set; using a random per-process secret. Set JWT_SECRET before deploying."
  );
  return jwtSecret;
}

// ---------------------------------------------------------------------------
// Sessions & token lifecycle
// ---------------------------------------------------------------------------

/** Per-request KV-backed revocation list, with an in-memory fallback. */
const revokedJtiMemory = new Map<string, number>(); // jti -> best-effort expiry (epoch ms)

async function isJtiRevoked(jti: string): Promise<boolean> {
  const kv: KvStore | undefined = requestKv();
  if (kv) {
    try {
      return (await kv.get(`revoked:${jti}`)) !== null;
    } catch {
      // Best effort: a KV failure must not silently break auth; treat as revoked
      // only if we cannot confirm otherwise would be unsafe. Instead, fall back
      // to the in-memory list (maybe empty) and continue.
      return revokedJtiMemory.has(jti);
    }
  }
  const expiresAt = revokedJtiMemory.get(jti);
  // Expired entries are pruned rather than treated as revoked forever.
  if (expiresAt === undefined) return false;
  if (expiresAt <= Date.now()) {
    revokedJtiMemory.delete(jti);
    return false;
  }
  return true;
}

/**
 * Revoke a token's `jti` so it can no longer be used to establish a session
 * (logout revocation). Ignored when called without a jti.
 */
export async function revokeSessionJti(jti: string | undefined): Promise<void> {
  if (!jti) return;
  const kv: KvStore | undefined = requestKv();
  if (kv) {
    try {
      await kv.put(`revoked:${jti}`, "1", { expirationTtl: SESSION_TTL_SECONDS });
    } catch {
      // Best effort; KV errors must not break logout. The token also expires
      // naturally after SESSION_TTL_SECONDS.
    }
    return;
  }
  revokedJtiMemory.set(jti, Date.now() + SESSION_TTL_SECONDS * 1000);
}

/**
 * Read the current request's session cookie, verify it, and blacklist its `jti`
 * so the session cannot be reused. Returns the revoked jti (or null when no
 * valid session was present). Used by logout handlers.
 */
export async function revokeCurrentSession(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = decodeAndVerifyToken(token);
  if (!decoded?.jti) return null;
  await revokeSessionJti(decoded.jti);
  return decoded.jti;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Sign a session token with a random `jti` for per-session revocation. */
export function createToken(payload: SessionPayload): string {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, requireJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify a token's signature and expiry. Returns the payload without the
 * internal `jti`/`iat`/`exp` claims. Session-level checks (revocation, expiry)
 * are applied in `getSession`, which is the path used by the API.
 */
export function verifyToken(token: string): SessionPayload | null {
  const decoded = decodeAndVerifyToken(token);
  if (!decoded) return null;
  return { userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role };
}

function decodeAndVerifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, requireJwtSecret()) as DecodedToken;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = decodeAndVerifyToken(token);
  if (!decoded) return null;
  // Reject tokens whose jti has been revoked (logout) before accepting the session.
  if (decoded.jti && (await isJtiRevoked(decoded.jti))) return null;
  return { userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role };
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
