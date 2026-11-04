import { NextResponse } from "next/server";
import { isLang } from "@/content";
import { allSentences } from "@/lib/sentences";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export async function GET(_req: Request, ctx: { params: Promise<{ lang: string }> }) {
  const { lang } = await ctx.params;
  if (!isLang(lang)) return NextResponse.json([], { status: 404 });
  return NextResponse.json(allSentences(lang));
}
