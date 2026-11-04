import type { Metadata } from "next";
import { courseHanzi, radicalStats } from "@/lib/hanzi";
import { RULES, STROKES } from "@/content/hanzi-foundation";
import { WriteHub } from "@/components/hanzi/WriteHub";

export const metadata: Metadata = { title: "Tập viết chữ Hán" };

export default function WritePage() {
  return <WriteHub levels={courseHanzi()} strokes={STROKES} rules={RULES} radicals={radicalStats()} />;
}
