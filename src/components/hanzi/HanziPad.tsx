"use client";
// Ô tập viết chữ Hán: lưới 田字格 / 米字格 + Hanzi Writer (xem thứ tự nét, tô theo, tự viết có chấm từng nét)
// Hỗ trợ chuột (PC), ngón tay (iPhone) và Apple Pencil (iPad) với chế độ chống chạm lòng bàn tay.
import { useEffect, useRef, useState } from "react";
import type HanziWriterType from "hanzi-writer";
import { cx } from "../ui";

export type PadMode = "watch" | "trace" | "write" | "demo";

type CharData = { strokes: string[]; medians: number[][][]; radStrokes?: number[] };
const cache = new Map<string, Promise<CharData>>();
export function loadCharData(c: string): Promise<CharData> {
  if (!cache.has(c)) {
    const hex = c.codePointAt(0)!.toString(16);
    cache.set(
      c,
      fetch(`/hanzi/${hex}.json`)
        .then((r) => {
          if (!r.ok) throw new Error("local");
          return r.json();
        })
        .catch(() => fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`).then((r) => r.json())),
    );
  }
  return cache.get(c)!;
}

function isDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export interface StrokeEvent {
  strokeNum: number;
  ok: boolean;
  mistakes: number;
  remaining: number;
}

export function HanziPad({
  char,
  mode,
  grid = "tian",
  pencil = false,
  highlight,
  maxSize = 420,
  replayKey = 0,
  showControls = true,
  gentle = false,
  onComplete,
  onStroke,
  onStylus,
  className,
}: {
  char: string;
  mode: PadMode;
  grid?: "tian" | "mi";
  pencil?: boolean;
  highlight?: number;
  maxSize?: number;
  replayKey?: number;
  showControls?: boolean;
  /** người mới: chấm nét dễ hơn, gợi ý sớm hơn */
  gentle?: boolean;
  onComplete?: (r: { mistakes: number; strokes: number }) => void;
  onStroke?: (e: StrokeEvent) => void;
  onStylus?: () => void;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterType | null>(null);
  const [size, setSize] = useState(0);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const cb = useRef({ onComplete, onStroke, onStylus, pencil });
  cb.current = { onComplete, onStroke, onStylus, pencil };

  // Kích thước ô theo bề rộng khung chứa
  useEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const measure = () => setSize(Math.max(48, Math.floor(Math.min(el.clientWidth, maxSize))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxSize]);

  // Tạo Hanzi Writer
  useEffect(() => {
    if (!size || !hostRef.current) return;
    let cancelled = false;
    let loop: ReturnType<typeof setTimeout> | null = null;
    setStep(0);
    setError(false);
    (async () => {
      const HanziWriter = (await import("hanzi-writer")).default;
      if (cancelled || !hostRef.current) return;
      hostRef.current.innerHTML = "";
      const dark = isDark();
      const w = HanziWriter.create(hostRef.current, char, {
        width: size,
        height: size,
        padding: Math.round(size * 0.07),
        showOutline: mode !== "write",
        showCharacter: false,
        strokeColor: dark ? "#ece8f6" : "#1f1b2e",
        radicalColor: mode === "watch" ? (dark ? "#f87171" : "#dc2626") : null,
        outlineColor: dark ? "#3b3550" : "#e4dfee",
        highlightColor: dark ? "#c4b5fd" : "#7c3aed",
        drawingColor: dark ? "#f9a8d4" : "#7c3aed",
        drawingWidth: Math.max(5, Math.round(size / 38)),
        strokeAnimationSpeed: mode === "demo" ? 0.8 : 1,
        delayBetweenStrokes: 300,
        charDataLoader: (c, onLoad, onErr) => {
          loadCharData(c)
            .then((d) => {
              totalRef.current = d.strokes.length;
              if (!cancelled) setTotal(d.strokes.length);
              onLoad(d);
            })
            .catch((e) => {
              if (!cancelled) setError(true);
              onErr(e);
            });
        },
      });
      writerRef.current = w;
      if (mode === "watch") {
        w.animateCharacter();
      } else if (mode === "demo") {
        const run = () => {
          if (cancelled) return;
          w.hideCharacter();
          if (highlight === undefined) w.animateCharacter({ onComplete: () => (loop = setTimeout(run, 1600)) });
          else w.animateStroke(highlight, { onComplete: () => (loop = setTimeout(run, 1400)) });
        };
        run();
      } else {
        w.quiz({
          leniency: gentle ? (mode === "trace" ? 1.6 : 1.35) : mode === "trace" ? 1.3 : 1.1,
          showHintAfterMisses: gentle ? (mode === "trace" ? 1 : 2) : mode === "trace" ? 2 : 3,
          markStrokeCorrectAfterMisses: gentle ? 4 : 6,
          onCorrectStroke: (d) => cb.current.onStroke?.({ strokeNum: d.strokeNum, ok: true, mistakes: d.totalMistakes, remaining: d.strokesRemaining }),
          onMistake: (d) => cb.current.onStroke?.({ strokeNum: d.strokeNum, ok: false, mistakes: d.totalMistakes, remaining: d.strokesRemaining }),
          onComplete: (s) => cb.current.onComplete?.({ mistakes: s.totalMistakes, strokes: totalRef.current }),
        });
      }
    })();
    return () => {
      cancelled = true;
      if (loop) clearTimeout(loop);
      try {
        writerRef.current?.cancelQuiz();
      } catch {}
      writerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, mode, size, replayKey, highlight, gentle]);

  // Apple Pencil: phát hiện bút và (khi bật) chỉ nhận nét từ bút — bỏ qua lòng bàn tay
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const isStylus = (t: Touch) => (t as Touch & { touchType?: string }).touchType === "stylus";
    const svg = () => hostRef.current?.querySelector("svg");
    const opts: AddEventListenerOptions = { capture: true, passive: false };
    const start = (e: TouchEvent) => {
      const st = Array.from(e.changedTouches).find(isStylus);
      if (st) cb.current.onStylus?.();
      if (!cb.current.pencil) return;
      e.preventDefault();
      e.stopPropagation();
      if (st) svg()?.dispatchEvent(new MouseEvent("mousedown", { clientX: st.clientX, clientY: st.clientY, bubbles: true }));
    };
    const move = (e: TouchEvent) => {
      if (!cb.current.pencil) return;
      e.preventDefault();
      e.stopPropagation();
      const st = Array.from(e.touches).find(isStylus);
      if (st) svg()?.dispatchEvent(new MouseEvent("mousemove", { clientX: st.clientX, clientY: st.clientY, bubbles: true }));
    };
    const end = (e: TouchEvent) => {
      if (!cb.current.pencil) return;
      e.stopPropagation();
      if (Array.from(e.changedTouches).some(isStylus)) document.dispatchEvent(new MouseEvent("mouseup"));
    };
    el.addEventListener("touchstart", start, opts);
    el.addEventListener("touchmove", move, opts);
    el.addEventListener("touchend", end, opts);
    el.addEventListener("touchcancel", end, opts);
    return () => {
      el.removeEventListener("touchstart", start, opts);
      el.removeEventListener("touchmove", move, opts);
      el.removeEventListener("touchend", end, opts);
      el.removeEventListener("touchcancel", end, opts);
    };
  }, []);

  const gridColor = "var(--grid-line, #f1a7a7)";
  const s = size;

  return (
    <div className={cx("flex flex-col items-center gap-2", className)}>
      <div
        ref={wrapRef}
        className="relative select-none rounded-xl bg-card shadow-inner"
        style={{ width: s || undefined, height: s || undefined, touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
      >
        {s > 0 && (
          <svg width={s} height={s} className="pointer-events-none absolute inset-0" aria-hidden>
            <rect x={1.5} y={1.5} width={s - 3} height={s - 3} rx={10} fill="none" stroke={gridColor} strokeWidth={2.5} />
            <line x1={0} y1={s / 2} x2={s} y2={s / 2} stroke={gridColor} strokeWidth={1.2} strokeDasharray="7 6" />
            <line x1={s / 2} y1={0} x2={s / 2} y2={s} stroke={gridColor} strokeWidth={1.2} strokeDasharray="7 6" />
            {grid === "mi" && (
              <>
                <line x1={0} y1={0} x2={s} y2={s} stroke={gridColor} strokeWidth={1} strokeDasharray="5 7" />
                <line x1={s} y1={0} x2={0} y2={s} stroke={gridColor} strokeWidth={1} strokeDasharray="5 7" />
              </>
            )}
          </svg>
        )}
        <div ref={hostRef} className="absolute inset-0" />
        {error && <div className="absolute inset-0 grid place-items-center text-sm text-zh">Không tải được dữ liệu nét</div>}
      </div>

      {showControls && mode === "watch" && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStep(0);
              writerRef.current?.hideCharacter();
              writerRef.current?.animateCharacter();
            }}
            className="rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand"
          >
            ▶ Xem lại
          </button>
          <button
            type="button"
            onClick={() => {
              const w = writerRef.current;
              if (!w || !total) return;
              if (step === 0 || step >= total) {
                w.hideCharacter();
                w.animateStroke(0);
                setStep(1);
              } else {
                w.animateStroke(step);
                setStep(step + 1);
              }
            }}
            className="rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand"
          >
            ⏭ Từng nét {step > 0 && total ? `(${step}/${total})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
