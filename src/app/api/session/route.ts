import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, session }, { status: 200 });
}
