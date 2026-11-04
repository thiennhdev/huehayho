import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_DAYS, signSession } from "@/lib/session";
import { isConfigured, passwordFor, type UserId } from "@/lib/users";

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Chưa cấu hình USER1_PASSWORD / USER2_PASSWORD trên Vercel." }, { status: 500 });
  }
  const body = (await req.json().catch(() => ({}))) as { userId?: string; password?: string };
  const userId = body.userId === "u1" || body.userId === "u2" ? (body.userId as UserId) : null;
  const expected = userId ? passwordFor(userId) : undefined;
  if (!userId || !expected || !safeEqual(String(body.password ?? ""), expected)) {
    await new Promise((r) => setTimeout(r, 600)); // làm chậm dò mật khẩu
    return NextResponse.json({ error: "Sai mật khẩu rồi 🥲" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
