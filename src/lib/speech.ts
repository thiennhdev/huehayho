"use client";
// Phát âm (Text-to-Speech) & nhận diện giọng nói của trình duyệt — miễn phí, không cần API key
import type { Lang } from "@/content/types";
import { readPrefs } from "./prefs";

let voices: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voices = window.speechSynthesis.getVoices();
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(code: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) loadVoices();
  const lc = code.toLowerCase();
  const exact = voices.filter((v) => v.lang.toLowerCase().replace("_", "-") === lc);
  const loose = voices.filter((v) => v.lang.toLowerCase().startsWith(lc.slice(0, 2)));
  const pool = exact.length ? exact : loose;
  // Ưu tiên giọng chất lượng cao
  return (
    pool.find((v) => /google|natural|premium|enhanced|siri|samantha|daniel|tingting|xiaoxiao|yunxi/i.test(v.name)) ?? pool[0]
  );
}

export function speak(text: string, lang: Lang, opts?: { rate?: number; onEnd?: () => void }) {
  if (!ttsSupported() || !text) return;
  const prefs = readPrefs();
  const code = lang === "zh" ? "zh-CN" : prefs.accent;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = code;
  const v = pickVoice(code);
  if (v) u.voice = v;
  u.rate = opts?.rate ?? prefs.rate;
  if (opts?.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Đọc lần lượt nhiều câu */
export function speakAll(lines: string[], lang: Lang, onLine?: (i: number) => void, onDone?: () => void) {
  let i = 0;
  const next = () => {
    if (i >= lines.length) return onDone?.();
    onLine?.(i);
    speak(lines[i], lang, { onEnd: () => setTimeout(next, 350) });
    i++;
  };
  next();
}

// ---------- Nhận diện giọng nói ----------
type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
};

export function sttSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function listen(lang: Lang, onText: (t: string, final: boolean) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, new () => Rec>;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return reject(new Error("unsupported"));
    const rec = new Ctor();
    rec.lang = lang === "zh" ? "zh-CN" : readPrefs().accent;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let text = "";
    rec.onresult = (e) => {
      text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onText(text, false);
    };
    rec.onerror = (e) => reject(new Error(e.error));
    rec.onend = () => {
      onText(text, true);
      resolve(text);
    };
    rec.start();
    setTimeout(() => rec.stop(), 12000);
  });
}

/** Độ giống nhau 0–100 giữa câu mẫu và câu người học nói */
export function similarity(target: string, said: string, lang: Lang): number {
  const clean = (s: string) =>
    lang === "zh"
      ? [...s.replace(/[^一-鿿0-9]/g, "")]
      : s
          .toLowerCase()
          .replace(/[^a-z0-9'\s]/g, " ")
          .split(/\s+/)
          .filter(Boolean);
  const a = clean(target);
  const b = clean(said);
  if (!a.length || !b.length) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return Math.max(0, Math.round((1 - dp[a.length][b.length] / Math.max(a.length, b.length)) * 100));
}
