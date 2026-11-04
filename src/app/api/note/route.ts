import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { kvSet, storageKind } from "@/lib/storage";
import { partnerOf } from "@/lib/users";

export interface Note {
  text: string;
  from: string;
  t: number;
}

// Gửi lời nhắn cho người kia (hiện trên trang chủ của họ)
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  const clean = String(text ?? "").trim().slice(0, 280);
  if (!clean) return NextResponse.json({ error: "Lời nhắn trống" }, { status: 400 });
  if (storageKind() === "none") return NextResponse.json({ error: "Chưa kết nối database" }, { status: 503 });
  const note: Note = { text: clean, from: user.id, t: Date.now() };
  await kvSet(`note:${partnerOf(user.id)}`, note);
  await kvSet(`note-sent:${user.id}`, note);
  return NextResponse.json({ ok: true, note });
}
