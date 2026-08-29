import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return Response.json({ authenticated: false });
  }

  const { verifySession } = await import("@/lib/auth");
  const session = await verifySession(token);

  return Response.json({ authenticated: !!session, session });
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const { createSession } = await import("@/lib/auth");
  const token = await createSession({ userId: "user-001", email, role: "candidate" });

  const res = Response.json({ success: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = Response.json({ success: true });
  res.cookies.delete("session", { path: "/" });
  return res;
}
