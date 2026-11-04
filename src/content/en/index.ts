import type { Course } from "../types";
import { a0 } from "./a0";
import { a1 } from "./a1";
import { a2 } from "./a2";
import { b1 } from "./b1";
import { b2 } from "./b2";
import { c1 } from "./c1";

export const english: Course = {
  lang: "en",
  name: "Tiếng Anh",
  flag: "🇬🇧",
  framework: "Khung tham chiếu châu Âu CEFR (Pre-A1 → C1)",
  target: "IELTS 7.0+",
  levels: [a0, a1, a2, b1, b2, c1],
};
