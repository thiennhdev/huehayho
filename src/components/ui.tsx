"use client";
import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import { listen, similarity, speak, stopListening, sttErrorMessage, sttSupported } from "@/lib/speech";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5", className)}>{children}</div>;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" | "danger" }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand text-white shadow-sm hover:brightness-110",
        variant === "soft" && "bg-brand/10 text-brand hover:bg-brand/15",
        variant === "ghost" && "border border-line text-ink hover:bg-brand/5",
        variant === "danger" && "bg-zh/10 text-zh hover:bg-zh/15",
        className,
      )}
    />
  );
}

export function Bar({ value, className, color = "bg-brand" }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className={cx("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 7, children, color = "var(--color-brand)" }: { value: number; size?: number; stroke?: number; children?: React.ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} style={{ transition: "stroke-dashoffset .4s" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-xs font-bold">{children}</div>
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand", className)}>{children}</span>;
}

export function langColor(lang: Lang) {
  return lang === "en" ? "text-en" : "text-zh";
}
export function langBg(lang: Lang) {
  return lang === "en" ? "bg-en" : "bg-zh";
}

/** Nút loa đọc to */
export function SpeakButton({ text, lang, size = "md", rate, label, caption }: { text: string; lang: Lang; size?: "sm" | "md" | "lg"; rate?: number; label?: string; caption?: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? "Nghe phát âm"}
      title={label ?? "Nghe phát âm"}
      onClick={(e) => {
        e.stopPropagation();
        setOn(true);
        speak(text, lang, { rate, onEnd: () => setOn(false) });
        setTimeout(() => setOn(false), 6000);
      }}
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full transition hover:bg-brand/15",
        on ? "bg-brand text-white" : "bg-brand/10 text-brand",
        size === "sm" && (caption ? "h-7 px-2.5 text-xs font-semibold" : "h-7 w-7 text-sm"),
        size === "md" && (caption ? "h-9 px-3 text-sm font-semibold" : "h-9 w-9"),
        size === "lg" && (caption ? "h-12 px-4 text-base font-semibold" : "h-12 w-12 text-xl"),
      )}
    >
      {caption ?? "🔊"}
    </button>
  );
}

/** Nút micro: đọc theo câu mẫu và chấm độ giống */
export function MicButton({ target, lang, onScore }: { target?: string; lang: Lang; onScore?: (score: number, said: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "starting" | "listening">("idle");
  const [said, setSaid] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => setSupported(sttSupported()), []);
  if (!supported) return null;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={async (e) => {
          e.stopPropagation();
          if (state !== "idle") return stopListening();
          setErr("");
          setScore(null);
          setSaid("");
          setState("starting");
          try {
            const text = await listen(lang, (t) => setSaid(t), () => setState("listening"));
            if (target) {
              const s = similarity(target, text, lang);
              setScore(s);
              onScore?.(s, text);
            } else onScore?.(100, text);
          } catch (e) {
            setErr(sttErrorMessage((e as Error).message));
          } finally {
            setState("idle");
          }
        }}
        className={cx(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition",
          state === "listening" ? "animate-pulse bg-love text-white" : state === "starting" ? "bg-warn/20 text-warn" : "bg-love/10 text-love hover:bg-love/15",
        )}
        title="Nói theo"
      >
        🎙️ {state === "starting" ? "Đang bật micro…" : state === "listening" ? "Đang nghe… (bấm để dừng)" : target ? "Nói theo" : "Nói"}
      </button>
      {(said || err) && (
        <div className="text-xs text-muted">
          {err || (
            <>
              Bạn nói: <span className="text-ink">“{said}”</span>
              {score !== null && (
                <span className={cx("ml-2 font-bold", score >= 80 ? "text-ok" : score >= 50 ? "text-warn" : "text-zh")}>
                  {score}% {score >= 80 ? "👏" : score >= 50 ? "👍" : "💪"}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-5xl">{icon}</div>
      <div className="text-lg font-bold">{title}</div>
      <div className="max-w-sm text-sm text-muted">{children}</div>
    </div>
  );
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
