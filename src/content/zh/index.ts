import type { Course } from "../types";
import { hsk0 } from "./hsk0";
import { hsk1 } from "./hsk1";
import { hsk2 } from "./hsk2";
import { hsk3 } from "./hsk3";
import { hsk4 } from "./hsk4";
import { hsk5 } from "./hsk5";
import { hsk6 } from "./hsk6";

export const chinese: Course = {
  lang: "zh",
  name: "Tiếng Trung",
  flag: "🇨🇳",
  framework: "Tiêu chuẩn HSK 3.0 (国际中文教育中文水平等级标准)",
  target: "HSK 6 → HSK 7+",
  levels: [hsk0, hsk1, hsk2, hsk3, hsk4, hsk5, hsk6],
};
