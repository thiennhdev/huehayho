// Kiểm tra giáo án: id trùng, đáp án hợp lệ, pinyin từ vựng khớp với pinyin-pro
import { courses } from "../src/content/index";
import { pinyin } from "pinyin-pro";

let errors = 0;
let warns = 0;
const ids = new Set<string>();
const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/[\s'’\-·]/g, "").replace(/ér$/, "r");
const toneless = (s: string) => norm(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

for (const course of Object.values(courses)) {
  let units = 0, words = 0;
  const terms = new Map<string, string>();
  for (const level of course.levels) {
    for (const u of level.units) {
      units++;
      if (ids.has(u.id)) { console.error("ID trùng:", u.id); errors++; }
      ids.add(u.id);
      if (!u.id.startsWith(`${course.lang}-${level.id}-`)) { console.error("ID sai tiền tố:", u.id); errors++; }
      for (const v of u.vocab) {
        words++;
        if (terms.has(v.term)) { console.warn(`  ↺ từ lặp "${v.term}" (${terms.get(v.term)} & ${u.id})`); warns++; }
        else terms.set(v.term, u.id);
        if (!v.vi) { console.error("Thiếu nghĩa:", u.id, v.term); errors++; }
        if (course.lang === "zh") {
          if (!v.py) { console.error("Thiếu pinyin:", u.id, v.term); errors++; continue; }
          const auto = pinyin(v.term, { type: "string" });
          const autoNoSandhi = pinyin(v.term, { type: "string", toneSandhi: false });
          const sameLetters = toneless(auto) === toneless(v.py); // khác biệt chỉ do thanh nhẹ → bỏ qua
          if (!sameLetters && norm(auto) !== norm(v.py) && norm(autoNoSandhi) !== norm(v.py)) {
            console.warn(`  ? pinyin ${u.id} ${v.term}: viết "${v.py}" — pinyin-pro "${auto}"`); warns++;
          }
        } else if (!v.ipa) { console.warn("  thiếu IPA:", u.id, v.term); warns++; }
      }
      for (const q of u.practice) {
        if (q.type === "mcq" && (q.options.length < 2 || q.answer >= q.options.length)) { console.error("MCQ lỗi:", u.id, q.prompt); errors++; }
        if (q.type === "fill" && !q.prompt.includes("___")) { console.error("Fill thiếu ___:", u.id, q.prompt); errors++; }
      }
      if (u.grammar.length === 0) { console.error("Thiếu ngữ pháp:", u.id); errors++; }
      if (!u.dialogue && !u.reading) { console.warn("  không có hội thoại/bài đọc:", u.id); warns++; }
    }
  }
  console.log(`${course.flag} ${course.name}: ${course.levels.length} cấp độ, ${units} bài, ${words} từ (${terms.size} từ khác nhau)`);
}
console.log(`\n${errors} lỗi, ${warns} cảnh báo`);
process.exit(errors ? 1 : 0);
