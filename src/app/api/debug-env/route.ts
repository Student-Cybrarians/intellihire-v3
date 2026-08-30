import { NextRequest, NextResponse } from "next/server";
import { currentCloudflareEnv } from "@/lib/db";

// TEMPORARY diagnostic endpoint (removed before launch). Returns only booleans
// and a D1 `SELECT 1` probe — never any secret value. Exists to confirm the
// production worker actually receives the D1/KV/AI bindings.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const env = currentCloudflareEnv();
  const hasDb = !!env?.DB;
  const hasKv = !!env?.SESSION_STORE;
  const hasAi = !!(env as never as Record<string, unknown>)?.AI;
  const jwtSecretSet = !!env?.JWT_SECRET;

  let d1Probe: unknown = null;
  if (hasDb) {
    try {
      d1Probe = await (env!.DB as never as {
        prepare: (s: string) => { first: () => Promise<unknown> };
      }).prepare("SELECT 1 as one").first();
    } catch (e) {
      d1Probe = { error: String((e as Error)?.message ?? e).slice(0, 200) };
    }
  }

  return NextResponse.json({ hasDb, hasKv, hasAi, jwtSecretSet, d1Probe });
}
