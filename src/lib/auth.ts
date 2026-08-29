import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { currentCloudflareEnv, requestDb, requestKv } from "./db";
import type { UserRecord, KvStore } from "./db";

/**
 * Token lifetime. Sessions are deliberately short-lived (24h) so that a leaked
 * cookie has a small window of usefulness; misuse is further mitigated by jti
 * revocation on logout (see `revokeCurrentSession`).
 */
const JWT_EXPIRES_IN = "24h";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

/**
 * HMAC-SHA-256 signature algorithm for session JWTs. `jose` runs on WebCrypto,
 * so it is fully Cloudflare-Pages/edge compatible (no Node builtins).
 */
const JWT_ALG = "HS256";

// ---------------------------------------------------------------------------
// Password hashing (WebCrypto PBKDF2-HMAC-SHA-256)
//
// bcrypt was replaced with an edge-safe, self-describing PBKDF2 scheme because
// `bcryptjs` pulls in Node-only `crypto.randomBytes`. Iteration count, salt and
// derived key are all embedded in the stored string so hashes stay portable
// across environments and can be re-derived on verify.
// ---------------------------------------------------------------------------

/** PBKDF2-HMAC-SHA-256 work factor. 100k iterations matches modern guidance. */
const PBKDF2_ITERATIONS = 100_000;
/** Random salt length in bytes (16 => 128-bit salt). */
const SALT_BYTES = 16;
/** Output key length in bytes (32 => 256-bit derived key). */
const KEY_BYTES = 32;
const HASH_ALG = "SHA-256";

/**
 * Stored hash format (self-describing):
 *   `pbkdf2$<iterations>$<saltB64>$<derivedB64>`
 */
const HASH_PREFIX = "pbkdf2";

/** Minimum accepted password length. Kept at 8; enforced by zod in the API. */
export const PASSWORD_MIN_LENGTH = 8;

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
  const decoded = await decodeAndVerifyToken(token);
  if (!decoded?.jti) return null;
  await revokeSessionJti(decoded.jti);
  return decoded.jti;
}

// ---------------------------------------------------------------------------
// Password hashing & verification (edge-safe PBKDF2)
// ---------------------------------------------------------------------------

/** Constant-time byte comparison (side-channel safe, no Node `crypto` needed). */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: HASH_ALG, salt: salt as BufferSource, iterations },
    baseKey,
    KEY_BYTES * 8
  );
  return new Uint8Array(bits);
}

/** Hash a password with PBKDF2-HMAC-SHA-256 into a self-describing string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(derived)}`;
}

/**
 * Verify a password against a stored hash by re-deriving from the stored
 * salt/cost and comparing in constant time. Fails closed on malformed hashes.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== HASH_PREFIX) return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  let salt: Uint8Array;
  let expected: Uint8Array;
  try {
    salt = base64ToBytes(parts[2]);
    expected = base64ToBytes(parts[3]);
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  const derived = await deriveKey(password, salt, iterations);
  return timingSafeEqualBytes(derived, expected);
}

/**
 * Backward-compatible alias for `verifyPassword`, retained so the login
 * handler's awkwardly-named call site reads the same as before the bcrypt-jose
 * migration.
 */
export const comparePassword = verifyPassword;

// ---------------------------------------------------------------------------
// Token signing & verification (jose / WebCrypto)
// ---------------------------------------------------------------------------

/** Sign a session token with a random `jti` for per-session revocation. */
export async function createToken(payload: SessionPayload): Promise<string> {
  const key = new TextEncoder().encode(requireJwtSecret());
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setJti(crypto.randomUUID())
    .sign(key);
}

/**
 * Verify a token's signature and expiry. Returns the payload without the
 * internal `jti`/`iat`/`exp` claims. Session-level checks (revocation, expiry)
 * are applied in `getSession`, which is the path used by the API.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  const decoded = await decodeAndVerifyToken(token);
  if (!decoded) return null;
  return { userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role };
}

async function decodeAndVerifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const key = new TextEncoder().encode(requireJwtSecret());
    const { payload } = await jwtVerify(token, key, { algorithms: [JWT_ALG] });
    return payload as unknown as DecodedToken;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = await decodeAndVerifyToken(token);
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
