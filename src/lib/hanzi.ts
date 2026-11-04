import "server-only";
// Danh sách chữ Hán cần tập viết theo từng bài (chữ mới xuất hiện lần đầu = chữ của bài, giống phần 汉字 trong sách bài tập)
import { pinyin } from "pinyin-pro";
import { courses } from "@/content";
import type { Unit } from "@/content/types";
import type { HanziEntry, HanziLevel } from "@/content/hanzi-types";
import { STROKE_COUNT } from "@/content/hanzi-strokes";
import "./pinyin"; // nạp từ điển pinyin chuẩn của giáo trình

const isHan = (c: string) => /\p{Script=Han}/u.test(c);
const hasTone = (s: string) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(s);

// Thứ tự xuất hiện đầu tiên của mỗi chữ trong toàn khoá
const firstUnit = new Map<string, string>();
for (const l of courses.zh.levels) for (const u of l.units) for (const v of u.vocab) for (const c of v.term) if (isHan(c) && !firstUnit.has(c)) firstUnit.set(c, u.id);

export function unitHanzi(u: Unit): HanziEntry[] {
  const out: HanziEntry[] = [];
  const seen = new Set<string>();
  for (const v of u.vocab) {
    const chars = [...v.term];
    const sylls = pinyin(v.term, { type: "array" });
    const hvs = v.hv?.split(/\s+/) ?? [];
    chars.forEach((c, i) => {
      if (!isHan(c) || seen.has(c)) return;
      seen.add(c);
      const ctx = sylls.length === chars.length ? sylls[i] : "";
      out.push({
        c,
        py: ctx && hasTone(ctx) ? ctx : pinyin(c),
        hv: hvs.length === chars.length ? hvs[i] : chars.length === 1 ? v.hv : undefined,
        word: v.term,
        wordPy: v.py,
        wordVi: v.vi,
        strokes: STROKE_COUNT[c] ?? 0,
        isNew: firstUnit.get(c) === u.id,
        unitId: u.id,
      });
    });
  }
  return out;
}

export function courseHanzi(): HanziLevel[] {
  return courses.zh.levels.map((l) => ({
    id: l.id,
    code: l.code,
    title: l.title,
    units: l.units.map((u) => ({ id: u.id, title: u.title, levelId: l.id, chars: unitHanzi(u).filter((e) => e.isNew) })),
  }));
}
