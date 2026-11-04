// Chép dữ liệu thứ tự nét (hanzi-writer-data, nguồn Make Me a Hanzi) cho các chữ dùng trong giáo án
// vào public/hanzi/<mã-unicode>.json để app tự phục vụ (không phụ thuộc CDN).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { courses } from "../src/content/index";
import { FOUNDATION_CHARS } from "../src/content/hanzi-foundation";

const src = join(process.cwd(), "node_modules/hanzi-writer-data");
const out = join(process.cwd(), "public/hanzi");
mkdirSync(out, { recursive: true });

const chars = new Set<string>(FOUNDATION_CHARS);
for (const l of courses.zh.levels) for (const u of l.units) for (const v of u.vocab) for (const c of v.term) if (/\p{Script=Han}/u.test(c)) chars.add(c);

const meta: Record<string, number> = {};
const missing: string[] = [];
for (const c of chars) {
  const f = join(src, `${c}.json`);
  if (!existsSync(f)) {
    missing.push(c);
    continue;
  }
  const hex = c.codePointAt(0)!.toString(16);
  copyFileSync(f, join(out, `${hex}.json`));
  meta[c] = (JSON.parse(readFileSync(f, "utf8")) as { strokes: string[] }).strokes.length;
}
writeFileSync(
  join(process.cwd(), "src/content/hanzi-strokes.ts"),
  `// Số nét của từng chữ (sinh tự động bởi scripts/copy-hanzi-data.ts)\nexport const STROKE_COUNT: Record<string, number> = ${JSON.stringify(meta)};\n`,
);
console.log(`Đã chép ${Object.keys(meta).length} chữ vào public/hanzi. Thiếu dữ liệu: ${missing.join(" ") || "không"}`);
