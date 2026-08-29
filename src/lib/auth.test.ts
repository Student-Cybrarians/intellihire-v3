import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  createToken,
  verifyToken,
  hashPassword,
  comparePassword,
  verifyPassword,
  setJwtSecret,
  SESSION_COOKIE_NAME,
} from "./auth";
import type { SessionPayload } from "./auth";

const payload: SessionPayload = {
  userId: "usr_test1",
  email: "ada@example.com",
  name: "Ada Lovelace",
  role: "candidate",
};

/**
 * `src/lib/auth.ts` fails closed without a `JWT_SECRET`. Set a test-only secret
 * on the auth module before any signing/verification.
 */
beforeEach(() => {
  setJwtSecret("test-secret-0123456789abcdef-test-secret");
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("auth token signing & verification", () => {
  it("signs and verifies a token round-trip", async () => {
    const token = await createToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
    // verifyToken returns the payload plus jwt claims (exp/iat)
    expect(await verifyToken(token)).toMatchObject(payload);
  });

  it("rejects an invalid token", async () => {
    expect(await verifyToken("not-a-valid-token")).toBeNull();
    expect(await verifyToken("")).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createToken(payload);
    const [header, body] = token.split(".");
    const tampered = `${header}.${body}.${"a".repeat(40)}`;
    expect(await verifyToken(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createToken(payload);
    setJwtSecret("a-different-secret-0123456789abcdef");
    expect(await verifyToken(token)).toBeNull();
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const token = await createToken(payload);
    // Valid within the 24h window.
    vi.setSystemTime(new Date("2026-01-01T23:00:00Z"));
    expect(await verifyToken(token)).toMatchObject(payload);

    // Beyond 24h -> expired.
    vi.setSystemTime(new Date("2026-01-02T01:00:00Z"));
    expect(await verifyToken(token)).toBeNull();
  });

  it("exposes the session cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("intellihire_session");
  });
});

describe("auth password hashing (edge-safe PBKDF2)", () => {
  it("hashes a password and compares it correctly", async () => {
    const password = "S3cure-Pass!123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await comparePassword("wrong-password", hash)).toBe(false);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces self-describing hashes with salt and cost embedded", async () => {
    const hash = await hashPassword("another-pass-123");
    expect(hash).toMatch(/^pbkdf2\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    const [, iterations, salt, derived] = hash.split("$");
    expect(Number(iterations)).toBeGreaterThanOrEqual(100000);
    expect(salt).toBeTruthy();
    expect(derived).toBeTruthy();
    // salt and derived are distinct base64 blobs
    expect(salt).not.toBe(derived);
  });

  it("uses a unique salt per hash (same password, different hashes)", async () => {
    const a = await hashPassword("same-password-123");
    const b = await hashPassword("same-password-123");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same-password-123", a)).toBe(true);
    expect(await verifyPassword("same-password-123", b)).toBe(true);
  });

  it("fails closed on a malformed or non-PBKDF2 hash", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$2a$12$abcdef")).toBe(false);
    expect(await verifyPassword("x", "pbkdf2$notanumber$foo$bar")).toBe(false);
  });
});
