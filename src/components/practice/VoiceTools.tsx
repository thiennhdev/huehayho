"use client";
// Công cụ hỗ trợ giọng nói: cảnh báo môi trường, ghi âm & nghe lại (dự phòng), kiểm tra micro
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import { listen, recordingSupported, startRecording, stopListening, stopRecording, sttEnv, sttErrorMessage, type SttEnv } from "@/lib/speech";
import { Button, cx } from "../ui";

export function useSttEnv(): SttEnv | null {
  const [env, setEnv] = useState<SttEnv | null>(null);
  useEffect(() => setEnv(sttEnv()), []);
  return env;
}

export function SttWarning({ className }: { className?: string }) {
  const env = useSttEnv();
  if (!env?.warning) return null;
  return <div className={cx("rounded-xl border border-warn/40 bg-warn/10 p-3 text-left text-xs", className)}>⚠️ {env.warning}</div>;
}

/** Ghi âm giọng mình rồi nghe lại để so với giọng mẫu */
export function VoiceRecorder({ compact }: { compact?: boolean }) {
  const [ok, setOk] = useState(false);
  const [state, setState] = useState<"idle" | "rec">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => setOk(recordingSupported()), []);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  if (!ok) return null;
  return (
    <div className={cx("flex flex-wrap items-center gap-2", compact ? "" : "justify-center")}>
      <button
        type="button"
        onClick={async () => {
          if (state === "rec") return stopRecording();
          setErr("");
          setState("rec");
          try {
            const r = await startRecording(10000);
            setUrl(r.url);
            setTimeout(() => new Audio(r.url).play().catch(() => {}), 150);
          } catch (e) {
            const n = (e as Error).name;
            setErr(sttErrorMessage(n === "NotAllowedError" || n === "SecurityError" ? "not-allowed" : n === "NotFoundError" ? "audio-capture" : "audio-capture"));
          } finally {
            setState("idle");
          }
        }}
        className={cx(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold",
          state === "rec" ? "animate-pulse bg-zh text-white" : "bg-zh/10 text-zh hover:bg-zh/15",
        )}
      >
        {state === "rec" ? "⏹ Dừng ghi" : "⏺ Ghi âm & nghe lại"}
      </button>
      {url && state === "idle" && (
        <button type="button" onClick={() => new Audio(url).play().catch(() => {})} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand/10 px-3 text-sm font-semibold text-brand">
          ▶ Nghe giọng mình
        </button>
      )}
      {err && <div className="w-full text-xs text-zh">{err}</div>}
    </div>
  );
}

/** Kiểm tra micro (mức âm) và thử nhận diện giọng nói */
export function MicCheck() {
  const env = useSttEnv();
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [micState, setMicState] = useState<"idle" | "testing" | "ok" | "silent" | "error">("idle");
  const [micErr, setMicErr] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [sttState, setSttState] = useState<"idle" | "waiting" | "listening" | "done" | "error">("idle");
  const [heard, setHeard] = useState("");
  const [sttErr, setSttErr] = useState("");
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => () => stopRef.current(), []);

  async function testMic() {
    setMicErr("");
    setPeak(0);
    setMicState("testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      let max = 0;
      let raf = 0;
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const lv = Math.min(100, Math.round(Math.sqrt(sum / buf.length) * 300));
        max = Math.max(max, lv);
        setLevel(lv);
        setPeak(max);
        raf = requestAnimationFrame(tick);
      };
      tick();
      const stop = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
        setLevel(0);
      };
      stopRef.current = stop;
      setTimeout(() => {
        stop();
        setMicState(max >= 8 ? "ok" : "silent");
      }, 5000);
    } catch (e) {
      const n = (e as Error).name;
      setMicState("error");
      setMicErr(sttErrorMessage(n === "NotAllowedError" || n === "SecurityError" ? "not-allowed" : "audio-capture"));
    }
  }

  async function testStt() {
    setSttErr("");
    setHeard("");
    setSttState("waiting");
    try {
      const t = await listen(lang, (x) => setHeard(x), () => setSttState("listening"));
      setHeard(t);
      setSttState("done");
    } catch (e) {
      setSttState("error");
      setSttErr(sttErrorMessage((e as Error).message));
    }
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {env && (
        <div className="rounded-xl bg-bg p-3 text-xs text-muted">
          Trình duyệt: <b className="text-ink">{env.browser}</b>
          {env.ios ? " · iOS/iPadOS" : env.android ? " · Android" : ""}
          {env.inApp ? ` · trong app ${env.inApp}` : ""} · Nhận diện giọng nói: {env.supported ? <b className="text-ok">có hỗ trợ</b> : <b className="text-zh">không hỗ trợ</b>}
        </div>
      )}
      <SttWarning />

      <div className="flex flex-col gap-2">
        <div className="font-semibold">Bước 1 — Micro có thu được tiếng không?</div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="soft" onClick={testMic} disabled={micState === "testing"}>
            {micState === "testing" ? "Đang thu… nói gì đó đi" : "🎙️ Kiểm tra micro (5 giây)"}
          </Button>
          <div className="h-3 min-w-32 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${level}%` }} />
          </div>
        </div>
        {micState === "ok" && <div className="text-ok">✅ Micro hoạt động tốt (mức âm lớn nhất {peak}%).</div>}
        {micState === "silent" && <div className="text-warn">⚠️ Micro mở được nhưng gần như không có tiếng. Kiểm tra micro có bị tắt tiếng, tai nghe Bluetooth đang kết nối, hoặc nói to hơn.</div>}
        {micState === "error" && <div className="text-zh">{micErr}</div>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-semibold">Bước 2 — Thử nhận diện giọng nói</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line">
            {(["en", "zh"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cx("rounded-lg px-3 py-1.5 text-xs font-semibold", lang === l ? (l === "en" ? "bg-en text-white" : "bg-zh text-white") : "text-muted")}>
                {l === "en" ? "🇬🇧 Anh" : "🇨🇳 Trung"}
              </button>
            ))}
          </div>
          <Button
            variant="soft"
            onClick={() => (sttState === "listening" || sttState === "waiting" ? stopListening() : testStt())}
            disabled={!env?.supported}
          >
            {sttState === "waiting" ? "Đang bật micro…" : sttState === "listening" ? "⏹ Dừng" : "🗣️ Thử nói"}
          </Button>
          <span className="text-xs text-muted">Thử nói: {lang === "en" ? "“Hello, nice to meet you”" : "“你好，我叫…”"}</span>
        </div>
        {sttState === "listening" && <div className="text-love">Đang nghe… nói đi nào</div>}
        {heard && <div>Máy nghe được: <b className={cx(lang === "zh" && "han")}>“{heard}”</b></div>}
        {sttState === "done" && <div className="text-ok">✅ Nhận diện giọng nói hoạt động!</div>}
        {sttState === "error" && <div className="text-zh">{sttErr}</div>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-semibold">Dự phòng — Ghi âm & nghe lại</div>
        <div className="text-xs text-muted">Nếu bước 2 không được, bạn vẫn luyện phát âm bằng cách ghi âm giọng mình rồi nghe lại so với giọng mẫu.</div>
        <VoiceRecorder compact />
      </div>
    </div>
  );
}
