// Bộ sinh bài tập kiểu Duolingo từ giáo án
import type { Lang, Question } from "@/content/types";

export interface VocabLite {
  term: string;
  vi: string;
  py?: string;
  ipa?: string;
}
export interface SentenceLite {
  text: string;
  vi: string;
  py?: string;
  tiles: string[];
}

export type Ex =
  | { t: "choice"; tag: string; prompt: string; sub?: string; audio?: string; options: string[]; answer: number; explain?: string; han?: boolean; optHan?: boolean }
  | { t: "fill"; tag: string; prompt: string; answers: string[]; explain?: string; han?: boolean }
  | { t: "match"; tag: string; pairs: { a: string; b: string }[]; han?: boolean }
  | { t: "build"; tag: string; prompt: string; audio?: string; text: string; py?: string; answer: string[]; bank: string[]; han?: boolean; joiner: string }
  | { t: "type"; tag: string; audio: string; vi: string; text: string }
  | { t: "speak"; tag: string; text: string; py?: string; vi: string };

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

function distractors(pool: VocabLite[], exclude: string, n = 3) {
  const seen = new Set([exclude]);
  const out: VocabLite[] = [];
  for (const p of shuffle(pool)) {
    if (seen.has(p.term) || seen.has(p.vi)) continue;
    seen.add(p.term);
    seen.add(p.vi);
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

export function vocabChoice(lang: Lang, v: VocabLite, pool: VocabLite[], kind: 0 | 1 | 2): Ex {
  const d = distractors(pool, v.term);
  const zh = lang === "zh";
  if (kind === 0) {
    const options = shuffle([v.vi, ...d.map((x) => x.vi)]);
    return { t: "choice", tag: "Chọn nghĩa đúng", prompt: v.term, sub: zh ? v.py : v.ipa, audio: undefined, options, answer: options.indexOf(v.vi), han: zh };
  }
  if (kind === 1) {
    const options = shuffle([v.term, ...d.map((x) => x.term)]);
    return { t: "choice", tag: "Chọn từ đúng", prompt: `“${v.vi}”`, options, answer: options.indexOf(v.term), optHan: zh };
  }
  const options = shuffle([v.term, ...d.map((x) => x.term)]);
  return { t: "choice", tag: "Nghe và chọn", prompt: "Bạn nghe thấy từ nào?", audio: v.term, options, answer: options.indexOf(v.term), optHan: zh };
}

export function matchEx(lang: Lang, vocab: VocabLite[]): Ex {
  return { t: "match", tag: "Ghép cặp", pairs: pick(vocab, 5).map((v) => ({ a: v.term, b: v.vi })), han: lang === "zh" };
}

export function buildEx(lang: Lang, s: SentenceLite, extra: string[], listen = false): Ex {
  const answerSet = new Set(s.tiles.map((x) => x.toLowerCase()));
  const extras = pick(
    Array.from(new Set(extra.filter((w) => !answerSet.has(w.toLowerCase())))),
    Math.min(3, Math.max(2, Math.round(s.tiles.length / 3))),
  );
  return {
    t: "build",
    tag: listen ? "Nghe và xếp câu" : "Dịch câu (xếp từ)",
    prompt: listen ? "Nghe rồi sắp xếp lại câu" : s.vi,
    audio: s.text,
    text: s.text,
    py: s.py,
    answer: s.tiles,
    bank: shuffle([...s.tiles, ...extras]),
    han: lang === "zh",
    joiner: lang === "zh" ? "" : " ",
  };
}

export function typeEx(s: SentenceLite): Ex {
  return { t: "type", tag: "Nghe và chép lại", audio: s.text, vi: s.vi, text: s.text };
}

export function speakEx(s: SentenceLite): Ex {
  return { t: "speak", tag: "Nói theo", text: s.text, py: s.py, vi: s.vi };
}

export function practiceEx(lang: Lang, qs: Question[]): Ex[] {
  const zh = lang === "zh";
  return qs.map((q) => {
    if (q.type === "mcq") {
      const correct = q.options[q.answer];
      const options = shuffle(q.options);
      return { t: "choice", tag: "Ngữ pháp", prompt: q.prompt, options, answer: options.indexOf(correct), explain: q.explain, han: zh, optHan: zh } as Ex;
    }
    return { t: "fill", tag: "Điền vào chỗ trống", prompt: q.prompt, answers: Array.isArray(q.answer) ? q.answer : [q.answer], explain: q.explain, han: zh } as Ex;
  });
}

/** Buổi luyện tập của một bài học (~13 câu) */
export function lessonSession(
  lang: Lang,
  vocab: VocabLite[],
  questions: Question[],
  pool: VocabLite[],
  sentences: SentenceLite[],
  canSpeak: boolean,
): Ex[] {
  const v = shuffle(vocab);
  const allTiles = sentences.flatMap((s) => s.tiles);
  const ss = shuffle(sentences);
  const out: Ex[] = [];
  if (vocab.length >= 4) out.push(matchEx(lang, vocab));
  out.push(vocabChoice(lang, v[0], pool, 0), vocabChoice(lang, v[1], pool, 2), vocabChoice(lang, v[2], pool, 1));
  if (ss[0]) out.push(buildEx(lang, ss[0], allTiles));
  if (v[3]) out.push(vocabChoice(lang, v[3], pool, 2));
  if (ss[1]) out.push(buildEx(lang, ss[1], allTiles, lang === "zh"));
  out.push(...practiceEx(lang, questions));
  if (ss[2]) out.push(lang === "en" ? typeEx(ss[2]) : buildEx(lang, ss[2], allTiles, true));
  if (canSpeak && ss[3]) out.push(speakEx(ss[3]));
  return out;
}

/** Luyện nhanh: trộn từ & câu đã học, ưu tiên từ hay quên */
export function mixedSession(lang: Lang, weak: VocabLite[], pool: VocabLite[], sentences: SentenceLite[], canSpeak: boolean): Ex[] {
  const v = weak.slice(0, 10);
  const allTiles = sentences.flatMap((s) => s.tiles);
  const ss = shuffle(sentences);
  const out: Ex[] = [];
  if (v.length >= 4) out.push(matchEx(lang, v));
  v.slice(0, 6).forEach((x, i) => out.push(vocabChoice(lang, x, pool.length >= 4 ? pool : v, (i % 3) as 0 | 1 | 2)));
  ss.slice(0, 3).forEach((s, i) => out.push(buildEx(lang, s, allTiles, i === 2)));
  if (ss[3]) out.push(lang === "en" ? typeEx(ss[3]) : buildEx(lang, ss[3], allTiles, true));
  if (canSpeak && ss[4]) out.push(speakEx(ss[4]));
  // xen kẽ cho đỡ đơn điệu, giữ ghép cặp ở đầu
  const head = out[0]?.t === "match" ? [out[0]] : [];
  return [...head, ...shuffle(out.slice(head.length))];
}

// ----- chấm điểm -----
export function normText(s: string, lang: Lang) {
  if (lang === "zh") return s.replace(/[^一-鿿0-9a-zA-Z]/g, "");
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

/** So khớp từng từ (EN) / từng chữ (ZH) giữa câu mẫu và câu nhận diện — kiểu ELSA */
export function alignTokens(target: string, said: string, lang: Lang): { tokens: string[]; ok: boolean[]; score: number } {
  const tok = (s: string) => (lang === "zh" ? [...s.replace(/[^一-鿿0-9]/g, "")] : normText(s, "en").split(" ").filter(Boolean));
  const display = lang === "zh" ? [...target.replace(/[^一-鿿0-9]/g, "")] : target.split(/\s+/).filter(Boolean);
  const a = tok(target);
  const b = tok(said);
  const n = a.length;
  const m = b.length;
  const L = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ok = Array(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ok[i] = true;
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  const tokens = display.length === n ? display : a;
  return { tokens, ok, score: n ? Math.round((ok.filter(Boolean).length / n) * 100) : 0 };
}
