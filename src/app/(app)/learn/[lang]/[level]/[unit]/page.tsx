import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allUnits, getLevel, getUnit, isLang, unitHref } from "@/content";
import { withPinyin } from "@/lib/pinyin";
import { unitSentences } from "@/lib/sentences";
import { Lesson } from "@/components/lesson/Lesson";

type P = { params: Promise<{ lang: string; level: string; unit: string }> };

export function generateStaticParams() {
  return (["en", "zh"] as const).flatMap((lang) => allUnits(lang).map((r) => ({ lang, level: r.levelId, unit: r.unit.id })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, level, unit } = await params;
  const u = isLang(lang) ? getUnit(lang, level, unit) : undefined;
  return { title: u ? u.title : "Bài học" };
}

export default async function UnitPage({ params }: P) {
  const { lang, level, unit } = await params;
  if (!isLang(lang)) notFound();
  const lv = getLevel(lang, level);
  const raw = getUnit(lang, level, unit);
  if (!lv || !raw) notFound();

  const refs = allUnits(lang);
  const idx = refs.findIndex((r) => r.unit.id === raw.id);
  const link = (i: number) => (refs[i] ? { href: unitHref(lang, refs[i].levelId, refs[i].unit.id), title: refs[i].unit.title } : null);
  // Kho từ để làm phương án nhiễu cho câu hỏi trắc nghiệm
  const pool = lv.units.flatMap((u) => u.vocab.map((v) => ({ term: v.term, vi: v.vi, py: v.py })));

  return (
    <Lesson
      lang={lang}
      unit={withPinyin(raw)}
      level={{ id: lv.id, code: lv.code, title: lv.title }}
      position={{ index: idx + 1, total: refs.length, inLevel: lv.units.findIndex((u) => u.id === raw.id) + 1, levelSize: lv.units.length }}
      prev={link(idx - 1)}
      next={link(idx + 1)}
      pool={pool}
      sentences={unitSentences(raw, lang)}
    />
  );
}
