import type { Metadata } from "next";
import { pinyin } from "pinyin-pro";
import "@/lib/pinyin"; // nạp từ điển pinyin chuẩn (thanh nhẹ) của giáo trình
import { courses } from "@/content";
import { PinyinLab, type TonePairWord } from "@/components/PinyinLab";

export const metadata: Metadata = { title: "Luyện pinyin & thanh điệu" };

function tonePairs(): TonePairWord[] {
  const out: TonePairWord[] = [];
  const seen = new Set<string>();
  for (const l of courses.zh.levels.slice(0, 3))
    for (const u of l.units)
      for (const v of u.vocab) {
        const chars = [...v.term];
        if (chars.length !== 2 || !chars.every((c) => /\p{Script=Han}/u.test(c)) || seen.has(v.term)) continue;
        const nums = pinyin(v.term, { pattern: "num", type: "array", toneSandhi: false }).map((n) => Number(n) || 0);
        if (nums.length !== 2 || nums[0] === 0) continue;
        if (nums[0] === 3 && nums[1] === 3) continue; // 3+3 đọc thành 2+3 — dạy riêng ở phần biến điệu
        if (chars.some((c) => c === "一" || c === "不")) continue;
        seen.add(v.term);
        out.push({ term: v.term, py: v.py ?? "", vi: v.vi, tones: [nums[0], nums[1]] });
      }
  return out;
}

export default function PinyinPage() {
  return <PinyinLab pairs={tonePairs()} />;
}
