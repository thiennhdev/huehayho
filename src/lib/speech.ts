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
  u.rate = opts?.rate ?? (lang === "zh" ? prefs.rateZh : prefs.rate);
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
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
  onstart: () => void;
  onaudiostart: () => void;
};

export function sttSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface SttEnv {
  supported: boolean;
  ios: boolean;
  android: boolean;
  inApp: string | null; // Zalo, Facebook, Messenger…
  standalone: boolean; // mở từ biểu tượng màn hình chính
  browser: string;
  warning: string | null;
}

export function sttEnv(): SttEnv {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document);
  const android = /Android/i.test(ua);
  const inAppMatch = ua.match(/Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\/|MicroMessenger|TikTok|musical_ly/i);
  const inApp = inAppMatch ? (/Zalo/i.test(inAppMatch[0]) ? "Zalo" : /MicroMessenger/i.test(inAppMatch[0]) ? "WeChat" : /Instagram/i.test(inAppMatch[0]) ? "Instagram" : /TikTok|musical/i.test(inAppMatch[0]) ? "TikTok" : /Line/i.test(inAppMatch[0]) ? "LINE" : "Facebook/Messenger") : null;
  const standalone = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const brave = typeof navigator !== "undefined" && "brave" in navigator;
  const browser = brave ? "Brave" : /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) && !/OPR|coc_coc|CocCoc/i.test(ua) ? "Chrome" : /coc_coc|CocCoc/i.test(ua) ? "Cốc Cốc" : /OPR|Opera/.test(ua) ? "Opera" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "trình duyệt khác";
  const supported = sttSupported();
  let warning: string | null = null;
  if (inApp) warning = `Bạn đang mở trong ứng dụng ${inApp} — micro thường bị chặn. Bấm “…” → “Mở bằng trình duyệt” (Safari / Chrome).`;
  else if (!supported) warning = `${browser} chưa hỗ trợ nhận diện giọng nói. Hãy dùng ${ios ? "Safari" : "Google Chrome hoặc Microsoft Edge"}. Vẫn có thể dùng “Ghi âm & nghe lại” để tự so sánh.`;
  else if (["Brave", "Opera", "Cốc Cốc"].includes(browser)) warning = `${browser} thường không kết nối được dịch vụ nhận diện giọng nói. Nếu không nhận giọng, hãy dùng Google Chrome${ios ? " hoặc Safari" : ""}.`;
  else if (ios && standalone) warning = "Nếu không nhận giọng khi mở từ biểu tượng ở màn hình chính, hãy mở app bằng Safari.";
  return { supported, ios, android, inApp, standalone, browser, warning };
}

/** Giải thích lỗi nhận diện bằng tiếng Việt, kèm cách khắc phục theo thiết bị */
export function sttErrorMessage(code: string): string {
  const env = sttEnv();
  switch (code) {
    case "not-allowed":
    case "permission":
      return env.ios
        ? "Chưa cho phép micro. Trên iPhone/iPad: bấm “aA” ở thanh địa chỉ → Cài đặt trang web → Micro → Cho phép (hoặc Cài đặt → Safari → Micro → Cho phép), rồi tải lại trang."
        : env.android
          ? "Chưa cho phép micro. Bấm biểu tượng ⚙️/🔒 cạnh địa chỉ trang → Quyền → Micro → Cho phép, rồi tải lại trang."
          : "Chưa cho phép micro. Bấm biểu tượng 🔒 hoặc 🎙️ trên thanh địa chỉ → cho phép Micro, rồi tải lại trang.";
    case "service-not-allowed":
      return env.ios
        ? "iPhone/iPad đang tắt dịch vụ nhận diện giọng nói. Vào Cài đặt → Siri (hoặc Apple Intelligence & Siri) → bật Siri, và Cài đặt → Cài đặt chung → Bàn phím → bật Đọc chính tả. Sau đó tải lại trang."
        : `Trình duyệt (${env.browser}) chặn dịch vụ nhận diện. Hãy dùng Google Chrome hoặc Microsoft Edge.`;
    case "network":
      return `Không kết nối được dịch vụ nhận diện giọng nói${["Brave", "Opera", "Cốc Cốc"].includes(env.browser) ? ` (${env.browser} không hỗ trợ)` : ""}. Kiểm tra mạng, hoặc dùng Google Chrome / Safari.`;
    case "no-speech":
      return "Không nghe thấy tiếng nói. Nói to, rõ và gần micro hơn — hoặc vào ⚙️ Cài đặt → Kiểm tra micro.";
    case "audio-capture":
      return "Không tìm thấy micro, hoặc micro đang bị ứng dụng khác dùng (gọi điện, ghi âm…). Tắt ứng dụng đó rồi thử lại.";
    case "language-not-supported":
      return env.ios
        ? "Thiết bị chưa hỗ trợ ngôn ngữ này. Trên iPhone: Cài đặt → Cài đặt chung → Bàn phím → thêm bàn phím Tiếng Trung (Giản thể, Bính âm) / Tiếng Anh để bật đọc chính tả ngôn ngữ đó."
        : "Trình duyệt chưa hỗ trợ nhận diện ngôn ngữ này. Hãy dùng Google Chrome.";
    case "no-start":
      return "Micro không khởi động được. Kiểm tra quyền micro, đóng các tab/ứng dụng khác đang dùng micro rồi thử lại.";
    case "unsupported":
      return env.warning ?? "Trình duyệt chưa hỗ trợ nhận diện giọng nói.";
    case "aborted":
      return "Đã dừng nghe.";
    default:
      return `Không nhận diện được (${code}). Thử lại, hoặc dùng Chrome / Safari.`;
  }
}

let currentRec: Rec | null = null;

/** Dừng nghe sớm (lấy kết quả đã nghe được) */
export function stopListening() {
  try {
    currentRec?.stop();
  } catch {}
}

export function listen(lang: Lang, onText: (t: string, final: boolean) => void, onStart?: () => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, new () => Rec>;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return reject(new Error("unsupported"));
    // Tắt giọng đọc mẫu để không tranh micro/loa (đặc biệt trên iPhone)
    stopSpeaking();
    try {
      currentRec?.abort();
    } catch {}
    const rec = new Ctor();
    currentRec = rec;
    rec.lang = lang === "zh" ? "zh-CN" : readPrefs().accent;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let text = "";
    let started = false;
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(startGuard);
      clearTimeout(maxGuard);
      if (currentRec === rec) currentRec = null;
      fn();
    };
    const markStarted = () => {
      if (!started) {
        started = true;
        onStart?.();
      }
    };
    rec.onstart = markStarted;
    rec.onaudiostart = markStarted;
    rec.onresult = (e) => {
      markStarted();
      text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onText(text, false);
    };
    rec.onerror = (e) => {
      // "no-speech"/"aborted" nhưng đã có chữ → vẫn tính là kết quả
      if (text && (e.error === "no-speech" || e.error === "aborted")) return;
      finish(() => reject(new Error(e.error || "unknown")));
    };
    rec.onend = () =>
      finish(() => {
        onText(text, true);
        text ? resolve(text) : reject(new Error(started ? "no-speech" : "no-start"));
      });
    const startGuard = setTimeout(() => {
      if (!started) {
        try {
          rec.abort();
        } catch {}
        finish(() => reject(new Error("no-start")));
      }
    }, 8000);
    const maxGuard = setTimeout(() => {
      try {
        rec.stop();
      } catch {}
      setTimeout(() => finish(() => (text ? resolve(text) : reject(new Error("no-speech")))), 2500);
    }, 12000);
    try {
      rec.start();
    } catch (err) {
      finish(() => reject(new Error((err as Error).name === "NotAllowedError" ? "not-allowed" : "no-start")));
    }
  });
}

// ---------- Ghi âm & nghe lại (dự phòng khi không nhận diện được) ----------
export interface Recording {
  url: string;
  ms: number;
}

let activeRecorder: MediaRecorder | null = null;

export function recordingSupported() {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
}

export async function startRecording(maxMs = 10000): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stopSpeaking();
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream);
    activeRecorder = rec;
    const t0 = Date.now();
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onerror = () => reject(new Error("audio-capture"));
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      activeRecorder = null;
      resolve({ url: URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/mp4" })), ms: Date.now() - t0 });
    };
    rec.start();
    setTimeout(() => rec.state === "recording" && rec.stop(), maxMs);
  });
}

export function stopRecording() {
  if (activeRecorder?.state === "recording") activeRecorder.stop();
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
