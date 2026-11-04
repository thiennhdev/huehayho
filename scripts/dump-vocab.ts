import { courses } from "../src/content/index";
import { writeFileSync } from "node:fs";
const out: Record<string, { unit: string; level: string; term: string; py?: string; vi: string }[]> = { en: [], zh: [] };
for (const c of Object.values(courses)) for (const l of c.levels) for (const u of l.units) for (const v of u.vocab) out[c.lang].push({ unit: u.id, level: l.id, term: v.term, py: v.py, vi: v.vi });
writeFileSync(process.argv[2], JSON.stringify(out));
