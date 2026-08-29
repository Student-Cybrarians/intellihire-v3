// Lightweight brute-force / abuse throttling for auth endpoints.
//
// Production uses the Cloudflare `SESSION_STORE` KV binding (resolved through
// the same request-context accessor as the database). Local dev / tests get an
// in-process in-memory fallback so behavior stays deterministic without any
// Cloudflare binding.
//
// Design: a fixed-time-window failure counter per (action, ip, account).
// After MAX_FAILED_ATTEMPTS failures inside WINDOW_SECONDS the pair is blocked
// and callers should return HTTP 429. A successful attempt clears the counter.

import { requestKv } from "./db";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

interface AttemptRecord {
  count: number;
  windowStartedAt: number; // epoch seconds
}

// In-memory fallback: key -> record + expiry.
const memoryStore = new Map<string, { record: AttemptRecord; expiresAt: number }>();

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function recordKey(action: string, ip: string, account: string): string {
  return `rl:${action}:${ip || "unknown"}:${(account || "").toLowerCase()}`;
}

async function readRecord(key: string): Promise<AttemptRecord | null> {
  const kv = requestKv();
  if (kv) {
    try {
      const raw = await kv.get(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AttemptRecord;
      if (nowSec() - parsed.windowStartedAt >= WINDOW_SECONDS) return null;
      return parsed;
    } catch {
      return null;
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowSec()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.record;
}

async function writeRecord(key: string, record: AttemptRecord): Promise<void> {
  const kv = requestKv();
  const ttl = Math.max(1, WINDOW_SECONDS - (nowSec() - record.windowStartedAt));
  if (kv) {
    try {
      await kv.put(key, JSON.stringify(record), { expirationTtl: ttl });
    } catch {
      // Best effort: a KV failure must not remove brute-force protection, so a
      // failed write simply leaves the previous record (if any) in place.
    }
    return;
  }
  memoryStore.set(key, { record, expiresAt: nowSec() + ttl });
}

/** True when (action, ip, account) is currently blocked by too many failures. */
export async function isThrottled(action: string, ip: string, account: string): Promise<boolean> {
  const record = await readRecord(recordKey(action, ip, account));
  return record !== null && record.count >= MAX_FAILED_ATTEMPTS;
}

/** Seconds remaining in the throttle window (0 when not throttled). */
export async function throttleRetryAfter(action: string, ip: string, account: string): Promise<number> {
  const record = await readRecord(recordKey(action, ip, account));
  if (!record) return 0;
  return Math.max(0, WINDOW_SECONDS - (nowSec() - record.windowStartedAt));
}

/** Record one failed attempt. */
export async function recordFailure(action: string, ip: string, account: string): Promise<void> {
  const key = recordKey(action, ip, account);
  const record = await readRecord(key);
  const next: AttemptRecord = record
    ? { count: record.count + 1, windowStartedAt: record.windowStartedAt }
    : { count: 1, windowStartedAt: nowSec() };
  await writeRecord(key, next);
}

/** Clear the failure counter after a successful attempt. */
export async function recordSuccess(action: string, ip: string, account: string): Promise<void> {
  const key = recordKey(action, ip, account);
  const kv = requestKv();
  if (kv) {
    try {
      await kv.delete(key);
    } catch {
      // best effort
    }
    return;
  }
  memoryStore.delete(key);
}

/** Best-effort client IP for throttling (proxy-aware). */
export function clientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("cf-connecting-ip") || "unknown";
}
