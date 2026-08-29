import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createToken,
  verifyToken,
  hashPassword,
  comparePassword,
  SESSION_COOKIE_NAME,
} from "./auth";
import type { SessionPayload } from "./auth";

const payload: SessionPayload = {
  userId: "usr_test1",
  email: "ada@example.com",
  name: "Ada Lovelace",
  role: "candidate",
};

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("auth token signing & verification", () => {
  it("signs and verifies a token round-trip", () => {
    const token = createToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
    // verifyToken returns the payload plus jwt claims (exp/iat)
    expect(verifyToken(token)).toMatchObject(payload);
  });

  it("rejects an invalid token", () => {
    expect(verifyToken("not-a-valid-token")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });

  it("rejects a tampered token", () => {
    const token = createToken(payload);
    const [header, body] = token.split(".");
    const tampered = `${header}.${body}.${"a".repeat(40)}`;
    expect(verifyToken(tampered)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const token = createToken(payload);
    // Valid within the 7d window.
    vi.setSystemTime(new Date("2026-01-06T00:00:00Z"));
    expect(verifyToken(token)).toMatchObject(payload);

    // Beyond 7d -> expired.
    vi.setSystemTime(new Date("2026-01-10T00:00:00Z"));
    expect(verifyToken(token)).toBeNull();
  });

  it("exposes the session cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("intellihire_session");
  });
});

describe("auth password hashing", () => {
  it("hashes a password and compares it correctly", async () => {
    const password = "S3cure-Pass!123";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await comparePassword("wrong-password", hash)).toBe(false);
  });
});
