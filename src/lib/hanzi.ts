import "server-only";
// Danh sách chữ Hán cần tập viết theo từng bài (chữ mới xuất hiện lần đầu = chữ của bài, giống phần 汉字 trong sách bài tập)
import { pinyin } from "pinyin-pro";
import { courses } from "@/content";
import type { Unit } from "@/content/types";
import type { HanziEntry, HanziLevel, HanziMem } from "@/content/hanzi-types";
import { STROKE_COUNT } from "@/content/hanzi-strokes";
import { COMPONENT_INFO, DECOMP } from "@/content/hanzi-decomp";
import { RADICAL_VI, STORIES, STRUCTURE_VI, TYPE_VI } from "@/content/hanzi-memory";
import "./pinyin"; // nạp từ điển pinyin chuẩn của giáo trình

const isHan = (c: string) => /\p{Script=Han}/u.test(c);
const hasTone = (s: string) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(s);

// Thứ tự xuất hiện đầu tiên của mỗi chữ trong toàn khoá
const firstUnit = new Map<string, string>();
for (const l of courses.zh.levels) for (const u of l.units) for (const v of u.vocab) for (const c of v.term) if (isHan(c) && !firstUnit.has(c)) firstUnit.set(c, u.id);

// Âm Hán Việt + nghĩa của từng chữ lấy từ chính giáo trình (dùng để gọi tên bộ phận)
const hvOf = new Map<string, string>();
const viOf = new Map<string, string>();
for (const l of courses.zh.levels)
  for (const u of l.units)
    for (const v of u.vocab) {
      const chars = [...v.term].filter(isHan);
      const hvs = v.hv?.split(/\s+/) ?? [];
      if (hvs.length === chars.length) chars.forEach((c, i) => !hvOf.has(c) && hvOf.set(c, hvs[i].toLowerCase()));
      if (chars.length === 1 && !viOf.has(chars[0])) viOf.set(chars[0], v.vi.split(/[;,(]/)[0].trim());
    }

const IDS_OP = /[\u2FF0-\u2FFB]/;
function leaves(ids: string): string[] {
  return [...ids].filter((c) => !IDS_OP.test(c) && c !== "？" && c !== "?");
}

const PY_FIX: Record<string, string> = { 子: "zǐ", 了: "liǎo", 卜: "bǔ" };
function compPy(c: string): string | undefined {
  if (PY_FIX[c]) return PY_FIX[c];
  if (COMPONENT_INFO[c]?.[0]) return COMPONENT_INFO[c][0];
  // Chỉ đoán pinyin cho chữ Hán thường (bỏ qua các biến thể bộ thủ như ⺍ 丷)
  if (!/[\u4E00-\u9FFF]/.test(c)) return undefined;
  const p = pinyin(c);
  return hasTone(p) ? p : undefined;
}

function partName(c: string): string | undefined {
  if (RADICAL_VI[c]) return RADICAL_VI[c];
  const hv = hvOf.get(c);
  if (hv) return viOf.get(c) ? `${hv} – ${viOf.get(c)}` : hv;
  return undefined;
}

/** Ghép mẹo nhớ cho một chữ từ dữ liệu chiết tự (Make Me a Hanzi) + tên bộ thủ tiếng Việt + câu chuyện */
export function hanziMem(c: string): HanziMem | undefined {
  const d = DECOMP[c];
  const story = STORIES[c];
  if (!d && !story) return undefined;
  const op = d?.d?.[0];
  const parts = d && IDS_OP.test(op ?? "")
    ? Array.from(new Set(leaves(d.d))).map((x) => ({
        c: x,
        name: partName(x),
        py: compPy(x),
        role: d.se === x ? ("nghĩa" as const) : d.ph === x ? ("âm" as const) : undefined,
      }))
    : [];
  const t = d?.t ? TYPE_VI[d.t] : undefined;
  return {
    type: t?.name,
    typeDesc: t?.desc,
    structure: op ? STRUCTURE_VI[op] : undefined,
    parts,
    story,
    radical: d?.r && d.r !== c ? `${d.r}${RADICAL_VI[d.r] ? ` (${RADICAL_VI[d.r]})` : ""}` : undefined,
  };
}

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
        mem: hanziMem(c),
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

/** Các bộ thủ hay gặp nhất trong giáo trình (để học bộ thủ trước) */
export function radicalStats(limit = 48): { r: string; name: string; chars: string[] }[] {
  const by = new Map<string, string[]>();
  for (const c of firstUnit.keys()) {
    const d = DECOMP[c];
    if (!d) continue;
    // ưu tiên bộ chỉ nghĩa (hình thanh), nếu không có thì dùng bộ thủ tra từ điển
    const r = d.se && RADICAL_VI[d.se] ? d.se : d.r;
    if (!r || r === c || !RADICAL_VI[r]) continue;
    by.set(r, [...(by.get(r) ?? []), c]);
  }
  return [...by.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, limit)
    .map(([r, chars]) => ({ r, name: RADICAL_VI[r], chars }));
}
