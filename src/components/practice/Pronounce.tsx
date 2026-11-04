"use client";
// Chấm phát âm kiểu ELSA (bản rút gọn): nói → máy nhận diện → tô màu từng từ / chữ đúng – sai
import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import { listen, speak, stopListening, sttErrorMessage, sttSupported } from "@/lib/speech";
import { SttWarning, VoiceRecorder } from "./VoiceTools";
import { sfx } from "@/lib/sfx";
import { Ring, SpeakButton, cx } from "../ui";
import { alignTokens } from "./exercises";

export function Pronounce({
  lang,
  text,
  phonetic,
  vi,
  hint,
  compact,
  onResult,
}: {
  lang: Lang;
  text: string;
  phonetic?: string;
  vi?: string;
  hint?: string;
  compact?: boolean;
  onResult?: (score: number, said: string) => void;
}) {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "starting" | "listening">("idle");
  const [said, setSaid] = useState("");
  const [res, setRes] = useState<{ tokens: string[]; ok: boolean[]; score: number } | null>(null);
  const [err, setErr] = useState("");
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => setSupported(sttSupported()), []);

  async function record() {
    if (state !== "idle") return stopListening();
    setErr("");
    setSaid("");
    setRes(null);
    setState("starting");
    try {
      const t = await listen(lang, (x) => setSaid(x), () => setState("listening"));
      if (!t.trim()) {
        setErr("Không nghe thấy gì — nói to và rõ hơn nhé");
        return;
      }
      const r = alignTokens(text, t, lang);
      setRes(r);
      setBest((b) => Math.max(b ?? 0, r.score));
      r.score >= 70 ? sfx.correct() : sfx.wrong();
      onResult?.(r.score, t);
    } catch (e) {
      setErr(sttErrorMessage((e as Error).message));
    } finally {
      setState("idle");
    }
  }

  const display = res?.tokens ?? (lang === "zh" ? [text] : text.split(/\s+/));

  return (
    <div className={cx("flex flex-col gap-3", compact ? "" : "items-center text-center")}>
      <div className={cx("flex flex-wrap gap-x-1.5 gap-y-1 font-bold", lang === "zh" ? "han text-3xl" : "text-2xl", compact ? "" : "justify-center")}>
        {res
          ? display.map((tk, k) => (
              <button
                key={k}
                type="button"
                title="Nghe riêng từ này"
                onClick={() => speak(tk, lang, { rate: 0.7 })}
                className={cx("rounded-md px-0.5 underline-offset-4 hover:underline", res.ok[k] ? "text-ok" : "text-zh")}
              >
                {tk}
              </button>
            ))
          : <span>{text}</span>}
      </div>
      {phonetic && <div className="py text-sm text-muted">{phonetic}</div>}
      {vi && <div className="text-sm text-muted">{vi}</div>}
      {hint && <div className="text-xs text-muted">💡 {hint}</div>}

      <div className={cx("flex flex-wrap items-center gap-3", compact ? "" : "justify-center")}>
        <SpeakButton text={text} lang={lang} size="lg" caption="🔊 Nghe mẫu" />
        <SpeakButton text={text} lang={lang} size="lg" rate={0.55} caption="🐢" />
        {supported ? (
          <button
            type="button"
            onClick={record}
            className={cx(
              "grid h-16 w-16 place-items-center rounded-full text-2xl text-white shadow-lg transition active:scale-95",
              state === "listening" ? "animate-pulse bg-love ring-8 ring-love/20" : state === "starting" ? "bg-warn" : "bg-brand hover:brightness-110",
            )}
            aria-label="Ghi âm"
            title="Bấm và đọc to câu này"
          >
            🎙️
          </button>
        ) : (
          <span className="text-xs text-warn">Trình duyệt chưa hỗ trợ nhận diện giọng nói (dùng Chrome / Edge / Safari)</span>
        )}
        {res && (
          <Ring value={res.score} size={60} stroke={6} color={res.score >= 85 ? "var(--color-ok)" : res.score >= 70 ? "var(--color-brand)" : res.score >= 50 ? "var(--color-warn)" : "var(--color-zh)"}>
            <span className="text-sm">{res.score}%</span>
          </Ring>
        )}
      </div>

      {state === "starting" && <div className="text-sm font-semibold text-warn">Đang bật micro…</div>}
      {state === "listening" && <div className="text-sm font-semibold text-love">Đang nghe… đọc to câu trên (bấm 🎙️ lần nữa để dừng)</div>}
      {said && state !== "listening" && (
        <div className="text-xs text-muted">
          Máy nghe được: <span className={cx("text-ink", lang === "zh" && "han")}>“{said}”</span>
        </div>
      )}
      {res && (
        <div className="text-sm font-semibold">
          {res.score >= 85 ? "Xuất sắc! Phát âm rất rõ 🌟" : res.score >= 70 ? "Tốt lắm! 👍" : res.score >= 50 ? "Khá rồi — bấm vào từ màu đỏ để nghe lại và thử tiếp" : "Thử lại nhé — nghe chậm 🐢 rồi đọc theo từng cụm"}
          {best !== null && best > res.score && <span className="ml-2 text-xs font-normal text-muted">(tốt nhất: {best}%)</span>}
        </div>
      )}
      {err && (
        <div className={cx("flex flex-col gap-2 text-sm", compact ? "" : "items-center")}>
          <div className="max-w-md text-zh">{err}</div>
          <div className="text-xs text-muted">Hoặc tự luyện: ghi âm giọng mình rồi nghe lại so với giọng mẫu 👇</div>
          <VoiceRecorder compact={compact} />
          <a href="/settings#mic" className="text-xs font-semibold text-brand">Kiểm tra micro →</a>
        </div>
      )}
      {!supported && <VoiceRecorder compact={compact} />}
      <SttWarning className="max-w-md" />
    </div>
  );
}
