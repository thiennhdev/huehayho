import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getOutline } from "@/content";
import { kvGet, storageKind } from "@/lib/storage";
import { emptyProgress, normalize, type Progress } from "@/lib/progress";
import { summarize } from "@/lib/summary";
import { getUser, partnerOf } from "@/lib/users";
import type { Note } from "../note/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const partner = getUser(partnerOf(me.id))!;
  const [pp, note, sent] = await Promise.all([
    kvGet<Progress>(`progress:${partner.id}`),
    kvGet<Note>(`note:${me.id}`),
    kvGet<Note>(`note-sent:${me.id}`),
  ]);
  const outline = getOutline();
  return NextResponse.json({
    storage: storageKind(),
    partner: summarize(outline, partner, pp ? normalize(pp) : emptyProgress()),
    note,
    sent,
  });
}
