import "server-only";



import { customPinyin, pinyin } from "pinyin-pro";
import type { Unit } from "@/content/types";
import { courses } from "@/content";

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");

/**
 * Nạp pinyin viết tay của từ vựng (có thanh nhẹ chuẩn từ điển, vd 谢谢 xièxie)
 * vào pinyin-pro, để pinyin câu ví dụ sinh tự động cũng đúng thanh nhẹ.
 */
function buildCustomDict() {
  const dict: Record<string, string> = {};
  for (const level of courses.zh.levels)
    for (const u of level.units)
      for (const v of u.vocab) {
        if (!v.py || v.term.length < 2 || v.term.includes("儿")) continue;
        const mine = v.py.normalize("NFC").replace(/[\s'’\-·]/g, "").toLowerCase();
        const auto = pinyin(v.term, { type: "array", toneType: "none" });
        if (auto.length !== [...v.term].length || strip(mine) !== auto.join("")) continue;
        const syl: string[] = [];
        let i = 0;
        for (const a of auto) {
          syl.push(mine.slice(i, i + a.length));
          i += a.length;
        }
        dict[v.term] = syl.join(" ");
      }
  customPinyin(dict);
}
buildCustomDict();

/** Sinh pinyin cho câu (chỉ chạy trên server lúc build) */
const PUNCT: Record<string, string> = { "，": ",", "。": ".", "！": "!", "？": "?", "、": ",", "；": ";", "：": ":", "“": "\"", "”": "\"", "（": "(", "）": ")" };

export function py(text: string): string {
  return pinyin(text, { type: "string", nonZh: "consecutive" })
    .replace(/[，。！？、；：“”（）]/g, (m) => PUNCT[m] ?? m)
    .replace(/\s+([,.!?;:)…])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    // âm cuộn lưỡi 儿: 一点儿 yì diǎnr, 哪儿 nǎr…
    .replace(/(^|\s)(diǎn|nǎ|zhè|nà|huì|wán|kuài|zhèng|fèn)\s+ér(?=$|[\s，。！？、；：,.!?;:])/g, "$1$2r")
    .trim();
}

/** Bổ sung pinyin cho ví dụ, hội thoại, bài đọc của bài tiếng Trung */
export function withPinyin(u: Unit): Unit {
  if (!u.id.startsWith("zh")) return u;
  return {
    ...u,
    vocab: u.vocab.map((v) => (v.ex && !v.exPy ? { ...v, exPy: py(v.ex) } : v)),
    grammar: u.grammar.map((g) => ({ ...g, examples: g.examples.map((e) => (e.py ? e : { ...e, py: py(e.text) })) })),
    dialogue: u.dialogue?.map((d) => (d.py ? d : { ...d, py: py(d.text) })),
    reading: u.reading ? { ...u.reading, py: u.reading.py ?? py(u.reading.text) } : undefined,
  };
}
