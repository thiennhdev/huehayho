import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { kvGet, kvSet, storageKind } from "@/lib/storage";
import { mergeProgress, normalize, type Progress } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const doc = await kvGet<Progress>(`progress:${user.id}`);
  return NextResponse.json({ progress: doc ? normalize(doc) : null, storage: storageKind() });
}

async function save(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const incoming = normalize(await req.json().catch(() => null));
  if (storageKind() === "none") return NextResponse.json({ progress: incoming, storage: "none" });
  const existing = await kvGet<Progress>(`progress:${user.id}`);
  const merged = existing ? mergeProgress(normalize(existing), incoming) : incoming;
  await kvSet(`progress:${user.id}`, merged);
  return NextResponse.json({ progress: merged, storage: storageKind() });
}

export const PUT = save;
export const POST = save;
