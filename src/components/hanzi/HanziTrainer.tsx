"use client";
// Luyện viết theo tiến trình của vở tập viết: Xem nét → Tô 2 lần (描红) → Tự viết (默写)
import { useEffect, useState } from "react";
import type { HanziEntry } from "@/content/hanzi-types";
import { useProgress } from "../ProgressProvider";
import { Button, SpeakButton, cx } from "../ui";
import { HanziPad, type StrokeEvent } from "./HanziPad";
import { XP, addXp } from "@/lib/progress";
import { sfx } from "@/lib/sfx";

const STAGES = [
  { label: "Xem nét", short: "①", mode: "watch" as const, hint: "Xem thứ tự viết từng nét. Phần tô đỏ là bộ thủ. Bấm “Từng nét” để xem chậm." },
  { label: "Tô lần 1", short: "②", mode: "trace" as const, hint: "Tô theo nét mờ, đúng thứ tự và chiều viết. Sai 2 lần sẽ có gợi ý." },
  { label: "Tô lần 2", short: "③", mode: "trace" as const, hint: "Tô lại một lần nữa để nhớ tay." },
  { label: "Tự viết", short: "④", mode: "write" as const, hint: "Viết không có mẫu (默写). Sai 3 lần một nét sẽ hiện gợi ý." },
];

const PREF_KEY = "hcn:hanzi-prefs";
type Prefs = { grid: "tian" | "mi"; pencil: boolean; big: boolean };
function readPrefs(): Prefs {
  try {
    return { grid: "tian", pencil: false, big: true, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") };
  } catch {
    return { grid: "tian", pencil: false, big: true };
  }
}

export function HanziTrainer({ entries, startStage = 0, title }: { entries: HanziEntry[]; startStage?: number; title?: string }) {
  const { progress, update } = useProgress();
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(startStage);
  const [replay, setReplay] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [result, setResult] = useState<{ mistakes: number; strokes: number } | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>({ grid: "tian", pencil: false, big: true });
  const [stylusSeen, setStylusSeen] = useState(false);
  useEffect(() => setPrefsState(readPrefs()), []);
  const setPrefs = (p: Partial<Prefs>) =>
    setPrefsState((cur) => {
      const n = { ...cur, ...p };
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify(n));
      } catch {}
      return n;
    });

  const e = entries[idx];
  useEffect(() => {
    setStage(startStage);
    setResult(null);
    setMsg(null);
  }, [idx, startStage]);

  if (!e) return null;
  const st = STAGES[stage];
  const hp = progress.hanzi[e.c];

  function onStroke(ev: StrokeEvent) {
    if (!ev.ok) setMsg({ ok: false, text: `Nét ${ev.strokeNum + 1} chưa đúng — chú ý thứ tự và chiều viết` });
    else setMsg(ev.remaining ? { ok: true, text: `Đúng nét ${ev.strokeNum + 1} ✓` } : null);
  }

  function onComplete(r: { mistakes: number; strokes: number }) {
    if (st.mode === "trace") {
      sfx.correct();
      setMsg({ ok: true, text: r.mistakes ? `Xong! (sai ${r.mistakes} lần)` : "Tô rất chuẩn! 🎉" });
      setTimeout(() => {
        setMsg(null);
        setStage((s) => Math.min(3, s + 1));
      }, 900);
      return;
    }
    // Tự viết xong → lưu tiến độ
    r.mistakes === 0 ? sfx.done() : sfx.correct();
    setResult(r);
    setMsg(null);
    update((p) => {
      const cur = p.hanzi[e.c] ?? { reps: 0, clean: 0, t: 0 };
      const next = { reps: cur.reps + 1, clean: cur.clean + (r.mistakes === 0 ? 1 : 0), t: Date.now() };
      return addXp({ ...p, hanzi: { ...p.hanzi, [e.c]: next } }, XP.hanzi + (r.mistakes === 0 ? XP.hanziClean : 0));
    });
  }

  const stars = result ? (result.mistakes === 0 ? 3 : result.mistakes <= 2 ? 2 : 1) : 0;
  const padMax = prefs.big ? 520 : 340;

  return (
    <div className="flex flex-col gap-3">
      {title && <div className="text-sm font-bold text-muted">{title}</div>}

      {/* Danh sách chữ */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-1.5">
          {entries.map((x, i) => {
            const p = progress.hanzi[x.c];
            return (
              <button
                key={x.c + i}
                onClick={() => setIdx(i)}
                className={cx(
                  "kai relative grid h-11 w-11 place-items-center rounded-xl border-2 text-2xl transition",
                  i === idx ? "border-zh bg-zh/10" : "border-line bg-card",
                )}
                title={x.py}
              >
                {x.c}
                {p && <span className={cx("absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-card", p.clean ? "bg-ok" : "bg-warn")} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Thông tin chữ */}
        <div className="flex flex-row items-center gap-4 rounded-2xl border border-line bg-card p-4 lg:w-64 lg:flex-col lg:items-start">
          <div className="kai text-6xl leading-none lg:text-8xl">{e.c}</div>
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="py text-lg font-bold text-zh">{e.py}</span>
              <SpeakButton text={e.c} lang="zh" size="sm" />
            </div>
            {e.hv && (
              <div>
                Hán Việt: <b>{e.hv}</b>
              </div>
            )}
            <div className="text-muted">{e.strokes ? `${e.strokes} nét` : ""}</div>
            <div className="pt-1">
              Trong từ: <span className="han font-semibold">{e.word}</span> <span className="py text-muted">{e.wordPy}</span>
              <div className="text-muted">{e.wordVi}</div>
            </div>
            {hp && (
              <div className="text-xs text-muted">
                Đã tự viết {hp.reps} lần · {hp.clean} lần không sai nét
              </div>
            )}
          </div>
        </div>

        {/* Ô viết */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s, i) => (
              <button
                key={s.label}
                onClick={() => {
                  setStage(i);
                  setResult(null);
                  setMsg(null);
                }}
                className={cx(
                  "rounded-full px-3 py-1.5 text-sm font-semibold",
                  i === stage ? "bg-zh text-white" : i < stage ? "bg-zh/15 text-zh" : "bg-card text-muted ring-1 ring-line",
                )}
              >
                {s.short} {s.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted">{st.hint}</div>

          <div className="w-full">
            {result ? (
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-line bg-card p-6 text-center animate-pop">
                <div className="kai text-7xl">{e.c}</div>
                <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
                <div className="font-semibold">
                  {result.mistakes === 0 ? "Hoàn hảo — không sai nét nào!" : `Viết xong, sai ${result.mistakes} lần`}
                </div>
                <div className="text-xs text-muted">+{XP.hanzi + (result.mistakes === 0 ? XP.hanziClean : 0)} XP</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setResult(null); setReplay((r) => r + 1); }}>
                    Viết lại
                  </Button>
                  {idx + 1 < entries.length ? (
                    <Button onClick={() => setIdx(idx + 1)}>Chữ tiếp: <span className="kai text-lg">{entries[idx + 1].c}</span> →</Button>
                  ) : (
                    <Button onClick={() => setIdx(0)}>Ôn lại từ đầu</Button>
                  )}
                </div>
              </div>
            ) : (
              <HanziPad
                key={`${e.c}-${stage}-${replay}`}
                char={e.c}
                mode={st.mode}
                grid={prefs.grid}
                pencil={prefs.pencil}
                maxSize={padMax}
                onStroke={onStroke}
                onComplete={onComplete}
                onStylus={() => {
                  if (!stylusSeen) {
                    setStylusSeen(true);
                    if (!prefs.pencil) setPrefs({ pencil: true });
                  }
                }}
              />
            )}
          </div>

          {msg && <div className={cx("text-center text-sm font-semibold", msg.ok ? "text-ok" : "text-zh")}>{msg.text}</div>}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {st.mode === "watch" && !result && <Button onClick={() => setStage(1)}>Bắt đầu tô →</Button>}
            {st.mode !== "watch" && !result && (
              <Button variant="ghost" onClick={() => setReplay((r) => r + 1)}>
                ↺ Viết lại từ đầu
              </Button>
            )}
          </div>

          {/* Tuỳ chọn */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex gap-1 rounded-full bg-card p-1 ring-1 ring-line">
              {(["tian", "mi"] as const).map((g) => (
                <button key={g} onClick={() => setPrefs({ grid: g })} className={cx("rounded-full px-2.5 py-1 font-semibold", prefs.grid === g ? "bg-zh text-white" : "text-muted")}>
                  {g === "tian" ? "田 ô điền" : "米 ô mễ"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 ring-1 ring-line">
              <input type="checkbox" checked={prefs.pencil} onChange={(ev) => setPrefs({ pencil: ev.target.checked })} />
              ✏️ Chỉ nhận Apple Pencil (chống chạm tay)
            </label>
            <label className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 ring-1 ring-line">
              <input type="checkbox" checked={prefs.big} onChange={(ev) => setPrefs({ big: ev.target.checked })} />
              Ô lớn
            </label>
          </div>
          {stylusSeen && <div className="text-center text-xs text-ok">✏️ Đã nhận Apple Pencil — chạm tay vào màn hình sẽ được bỏ qua.</div>}
        </div>
      </div>
    </div>
  );
}
