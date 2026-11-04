// Viết tắt giúp soạn giáo án gọn gàng. Dùng dấu | để ngăn cách các trường.
import type { DialogueLine, Example, GrammarPoint, Question, Unit, VocabItem } from "./types";

const split = (s: string) => s.split("|").map((x) => x.trim());

/** Từ vựng tiếng Anh: "term|ipa|pos|nghĩa|câu ví dụ|nghĩa câu" */
export function V(line: string): VocabItem {
  const [term, ipa, pos, vi, ex, exVi] = split(line);
  return { term, ipa: ipa || undefined, pos: pos || undefined, vi, ex: ex || undefined, exVi: exVi || undefined };
}

/** Từ vựng tiếng Trung: "chữ Hán|pinyin|Hán Việt|nghĩa|câu ví dụ|nghĩa câu" (pinyin câu được sinh tự động) */
export function Z(line: string): VocabItem {
  const [term, py, hv, vi, ex, exVi] = split(line);
  return { term, py, hv: hv || undefined, vi, ex: ex || undefined, exVi: exVi || undefined };
}

/** Câu ví dụ: "câu|nghĩa" */
export function X(line: string): Example {
  const [text, vi] = split(line);
  return { text, vi };
}

/** Hội thoại: "người nói|câu|nghĩa" */
export function D(line: string): DialogueLine {
  const [s, text, vi] = split(line);
  return { s, text, vi };
}

export function G(title: string, pattern: string, explain: string, examples: string[]): GrammarPoint {
  return { title, pattern: pattern || undefined, explain, examples: examples.map(X) };
}

/** Trắc nghiệm: đáp án đúng đặt ĐẦU TIÊN, thứ tự sẽ được xáo khi hiển thị */
export function mcq(prompt: string, options: string[], explain?: string): Question {
  return { type: "mcq", prompt, options, answer: 0, explain };
}

/** Điền từ: dùng ___ cho chỗ trống, nhiều đáp án ngăn bởi / */
export function fill(prompt: string, answer: string, explain?: string): Question {
  return { type: "fill", prompt, answer: answer.split("/").map((a) => a.trim()), explain };
}

export function unit(id: string, u: Omit<Unit, "id">): Unit {
  return { id, ...u };
}
