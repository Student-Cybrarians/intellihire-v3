import { NextResponse } from "next/server";
import { getSession, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
