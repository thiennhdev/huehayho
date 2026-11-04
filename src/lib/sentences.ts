import "server-only";


// Câu mẫu (đã tách từ) cho bài tập xếp câu, nghe – chép, nói theo
import { courses } from "@/content";
import type { Lang, Unit } from "@/content/types";
import { py } from "./pinyin";

export interface Sentence {
  text: string;
  vi: string;
  py?: string;
  tiles: string[];
  tilesPy?: string[];
  unitId: string;
}

// Từ điển tách từ tiếng Trung: toàn bộ từ vựng giáo trình + từ hư thông dụng
const COMMON = "我们 你们 他们 她们 什么 怎么 怎么样 这个 那个 这些 那些 一个 一下 一起 一点儿 可以 没有 不是 时候 已经 还是 或者 如果 非常 应该 需要 现在 每天 大家 自己 为什么 中文 一定 知道 觉得 可能 但是 所以 因为 虽然 而且 然后 以后 以前 一直 东西 地方 问题 喜欢 开始 准备 认为 发现 告诉 帮助 学习 工作 生活 身体 时间 今年 明年 去年 周末 晚上 早上 下午 上午 中午 一百 两百 三百 五百".split(" ");
const zhDict = new Set<string>(COMMON);
for (const l of courses.zh.levels) for (const u of l.units) for (const v of u.vocab) if (v.term.length <= 4) zhDict.add(v.term);

// Chữ thường đứng một mình như một từ — không ghép với chữ bên cạnh
const SOLO = new Set([..."我你他她它您的了是在有很不没也都就才还又和跟给把被比从到对去来吃喝看说听写读买卖做想要会能好大小多少太最更再一二三四五六七八九十两几个本件张次点天年月号吗呢吧啊得地着过这那哪谁让叫请等走跑坐开回进出上下里外前后家人水茶饭菜书钱块字课题新旧高长快慢冷热累饿忙远近早晚贵美红白黑死笑哭送找带放拿关洗住用学教问爱怕懂完错只每各别先正将于之其而但或如若便皆亦乃系何向往离为以由自所该此"]);

export function segmentZh(s: string): string[] {
  const raw = segmentGreedy(s);
  // Ghép 2 chữ đơn liền nhau khi cả hai đều không phải từ đơn thông dụng (vd 超|市 → 超市)
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    const b = raw[i + 1];
    if (b && a.length === 1 && b.length === 1 && !SOLO.has(a) && !SOLO.has(b)) {
      out.push(a + b);
      i++;
    } else out.push(a);
  }
  return out;
}

function segmentGreedy(s: string): string[] {
  const chars = [...s.replace(/[^一-鿿0-9a-zA-Z%]/g, "")];
  const out: string[] = [];
  let i = 0;
  while (i < chars.length) {
    let len = Math.min(4, chars.length - i);
    for (; len > 1; len--) if (zhDict.has(chars.slice(i, i + len).join(""))) break;
    out.push(chars.slice(i, i + len).join(""));
    i += len;
  }
  return out;
}

export function tokensEn(s: string): string[] {
  return s
    .replace(/[“”"—–]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9'%]+$/g, ""))
    .filter(Boolean);
}

export function unitSentences(u: Unit, lang: Lang): Sentence[] {
  const raw: { text: string; vi: string }[] = [];
  for (const v of u.vocab) if (v.ex && v.exVi) raw.push({ text: v.ex, vi: v.exVi });
  for (const g of u.grammar) for (const e of g.examples) raw.push({ text: e.text, vi: e.vi.replace(/\s*\(.*?\)\s*$/, "") });
  for (const d of u.dialogue ?? []) raw.push({ text: d.text, vi: d.vi });
  const seen = new Set<string>();
  const out: Sentence[] = [];
  for (const r of raw) {
    if (seen.has(r.text)) continue;
    seen.add(r.text);
    const tiles = lang === "zh" ? segmentZh(r.text) : tokensEn(r.text);
    const ok = lang === "zh" ? tiles.length >= 3 && tiles.length <= 9 && [...r.text].length <= 22 : tiles.length >= 3 && tiles.length <= 10;
    if (!ok) continue;
    out.push({ text: r.text, vi: r.vi, py: lang === "zh" ? py(r.text) : undefined, tiles, tilesPy: lang === "zh" ? tiles.map((t) => py(t)) : undefined, unitId: u.id });
  }
  return out;
}

export function allSentences(lang: Lang): Sentence[] {
  return courses[lang].levels.flatMap((l) => l.units.flatMap((u) => unitSentences(u, lang)));
}
