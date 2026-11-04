"use client";
// Phiên luyện tập kiểu Duolingo: tim, thanh tiến độ, kiểm tra từng câu, âm thanh đúng/sai
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import { Bar, Button, SpeakButton, cx } from "../ui";
import { speak } from "@/lib/speech";
import { sfx } from "@/lib/sfx";
import { editDistance, normText, shuffle, type Ex } from "./exercises";
import { Pronounce } from "./Pronounce";

export interface SessionResult {
  correct: number;
  total: number;
  hearts: number;
  failed: boolean;
}

interface Report {
  ready: boolean;
  correct: boolean;
  answer?: string;
  note?: string;
}

const MAX_HEARTS = 5;

export function Session({ lang, items, onFinish }: { lang: Lang; items: Ex[]; onFinish: (r: SessionResult) => void }) {
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [checked, setChecked] = useState(false);
  const [report, setReport] = useState<Report>({ ready: false, correct: false });
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [combo, setCombo] = useState(0);
  const ex = items[i];

  function check(r: Report = report) {
    if (checked || !r.ready) return;
    setReport(r);
    setChecked(true);
    setStats((s) => ({ correct: s.correct + (r.correct ? 1 : 0), total: s.total + 1 }));
    if (r.correct) {
      sfx.correct();
      setCombo((c) => c + 1);
    } else {
      sfx.wrong();
      setCombo(0);
      setHearts((h) => h - 1);
    }
  }

  function next(skip = false) {
    const nextStats = skip ? stats : stats;
    if (hearts <= 0) return onFinish({ ...nextStats, hearts: 0, failed: true });
    if (i + 1 >= items.length) {
      sfx.done();
      return onFinish({ ...nextStats, hearts, failed: false });
    }
    setI(i + 1);
    setChecked(false);
    setReport({ ready: false, correct: false });
  }

  // Enter = kiểm tra / tiếp tục
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (checked) next();
      else if (report.ready && ex.t !== "match") check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Bar value={(i / items.length) * 100} color="bg-ok" className="h-3" />
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-love" title="Tim — sai 1 câu mất 1 tim">
          {"❤️".repeat(Math.max(0, hearts))}
          <span className="opacity-30">{"🤍".repeat(Math.max(0, MAX_HEARTS - hearts))}</span>
        </span>
      </div>
      {combo >= 3 && !checked && <div className="animate-pop text-center text-sm font-bold text-warn">🔥 Chuỗi {combo} câu đúng liên tiếp!</div>}

      <div className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-brand">{ex.tag}</div>
        <ExerciseView key={i} lang={lang} ex={ex} checked={checked} onReport={setReport} onAuto={(r) => check(r)} />
      </div>

      {/* Chân trang phản hồi */}
      <div
        className={cx(
          "rounded-2xl p-4 transition",
          !checked && "bg-transparent",
          checked && report.correct && "bg-ok/15",
          checked && !report.correct && "bg-zh/15",
        )}
      >
        {checked && (
          <div className="mb-3 animate-pop">
            <div className={cx("text-lg font-extrabold", report.correct ? "text-ok" : "text-zh")}>
              {report.correct ? ["Tuyệt vời! 🎉", "Chính xác! ✨", "Giỏi quá! 💪", "Đúng rồi! 👏"][stats.total % 4] : hearts <= 0 ? "Hết tim rồi 💔" : "Chưa đúng 😅"}
            </div>
            {report.note && <div className="text-sm">{report.note}</div>}
            {!report.correct && report.answer && (
              <div className="mt-1 text-sm">
                Đáp án đúng: <b className={cx(lang === "zh" && "han text-base")}>{report.answer}</b>
              </div>
            )}
            {"explain" in ex && ex.explain && <div className="mt-1 text-sm text-muted">{ex.explain}</div>}
          </div>
        )}
        <div className="flex gap-2">
          {!checked && ex.t === "speak" && (
            <Button variant="ghost" onClick={() => next(true)}>
              Bỏ qua
            </Button>
          )}
          {!checked ? (
            ex.t !== "match" && (
              <Button className="flex-1 py-3" disabled={!report.ready} onClick={() => check()}>
                Kiểm tra
              </Button>
            )
          ) : (
            <Button className={cx("flex-1 py-3", report.correct ? "!bg-ok" : "!bg-zh")} onClick={() => next()}>
              {hearts <= 0 ? "Xem kết quả" : i + 1 >= items.length ? "Hoàn thành" : "Tiếp tục"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseView({ lang, ex, checked, onReport, onAuto }: { lang: Lang; ex: Ex; checked: boolean; onReport: (r: Report) => void; onAuto: (r: Report) => void }) {
  switch (ex.t) {
    case "choice":
      return <Choice lang={lang} ex={ex} checked={checked} onReport={onReport} />;
    case "fill":
      return <Fill ex={ex} checked={checked} onReport={onReport} />;
    case "match":
      return <Match lang={lang} ex={ex} onAuto={onAuto} />;
    case "build":
      return <Build lang={lang} ex={ex} checked={checked} onReport={onReport} />;
    case "type":
      return <TypeIt lang={lang} ex={ex} checked={checked} onReport={onReport} />;
    case "speak":
      return <Speak lang={lang} ex={ex} onReport={onReport} />;
  }
}

/* --- Trắc nghiệm --- */
function Choice({ lang, ex, checked, onReport }: { lang: Lang; ex: Extract<Ex, { t: "choice" }>; checked: boolean; onReport: (r: Report) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    if (ex.audio) setTimeout(() => speak(ex.audio!, lang), 250);
  }, [ex, lang]);
  return (
    <div className="flex flex-col gap-4">
      {ex.audio ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-bold">{ex.prompt}</div>
          <div className="flex gap-3">
            <SpeakButton text={ex.audio} lang={lang} size="lg" />
            <SpeakButton text={ex.audio} lang={lang} size="lg" rate={0.55} caption="🐢" />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className={cx("font-extrabold", ex.han && "han", ex.sub ? "text-4xl" : "text-xl")}>{ex.prompt}</div>
          {ex.sub && <div className="py mt-1 text-muted">{ex.sub}</div>}
          {ex.sub && (
            <div className="mt-2 flex justify-center">
              <SpeakButton text={ex.prompt} lang={lang} size="sm" />
            </div>
          )}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {ex.options.map((o, k) => (
          <button
            key={k}
            disabled={checked}
            onClick={() => {
              sfx.tap();
              setPicked(k);
              onReport({ ready: true, correct: k === ex.answer, answer: ex.options[ex.answer] });
              if (ex.optHan && ex.audio === undefined) speak(o, lang);
            }}
            className={cx(
              "flex items-center gap-3 rounded-xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition active:translate-y-0.5",
              ex.optHan && "han text-lg",
              !checked && picked === k && "border-brand bg-brand/10 text-brand",
              !checked && picked !== k && "border-line hover:bg-brand/5",
              checked && k === ex.answer && "border-ok bg-ok/10",
              checked && picked === k && k !== ex.answer && "border-zh bg-zh/10",
              checked && k !== ex.answer && picked !== k && "border-line opacity-50",
            )}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line text-xs text-muted">{k + 1}</span>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- Điền từ --- */
function Fill({ ex, checked, onReport }: { ex: Extract<Ex, { t: "fill" }>; checked: boolean; onReport: (r: Report) => void }) {
  const [text, setText] = useState("");
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?;:。！？，、]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return (
    <div className="flex flex-col gap-4">
      <div className={cx("text-center text-xl font-bold", ex.han && "han")}>{ex.prompt}</div>
      <input
        value={text}
        disabled={checked}
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          onReport({ ready: !!e.target.value.trim(), correct: ex.answers.some((a) => norm(a) === norm(e.target.value)), answer: ex.answers.join(" / ") });
        }}
        placeholder="Nhập đáp án…"
        className={cx("w-full rounded-xl border-2 bg-bg px-4 py-3 text-lg outline-none focus:border-brand", ex.han && "han", checked ? "border-line" : "border-line")}
      />
    </div>
  );
}

/* --- Ghép cặp --- */
function Match({ lang, ex, onAuto }: { lang: Lang; ex: Extract<Ex, { t: "match" }>; onAuto: (r: Report) => void }) {
  const left = useMemo(() => shuffle(ex.pairs.map((p) => p.a)), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p.b)), [ex]);
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [bad, setBad] = useState<[string, string] | null>(null);
  const mistakes = useRef(0);

  useEffect(() => {
    if (!selA || !selB) return;
    const ok = ex.pairs.some((p) => p.a === selA && p.b === selB);
    if (ok) {
      sfx.tap();
      const n = new Set(done);
      n.add(selA);
      setDone(n);
      if (n.size === ex.pairs.length)
        setTimeout(
          () =>
            onAuto({
              ready: true,
              correct: mistakes.current === 0,
              note: mistakes.current ? `Bạn ghép nhầm ${mistakes.current} lần — mất 1 tim.` : "Ghép đúng hết, không sai lần nào!",
            }),
          250,
        );
    } else {
      mistakes.current++;
      sfx.wrong();
      setBad([selA, selB]);
      setTimeout(() => setBad(null), 500);
    }
    setSelA(null);
    setSelB(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selA, selB]);

  const doneB = new Set(ex.pairs.filter((p) => done.has(p.a)).map((p) => p.b));
  const tile = (active: boolean, isDone: boolean, isBad: boolean) =>
    cx(
      "min-h-12 rounded-xl border-2 border-b-4 px-3 py-2 text-center font-semibold transition",
      isDone && "pointer-events-none border-line opacity-30",
      !isDone && active && "border-brand bg-brand/10 text-brand",
      !isDone && !active && !isBad && "border-line hover:bg-brand/5",
      isBad && "animate-pulse border-zh bg-zh/10",
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center text-lg font-bold">Chạm để ghép từ với nghĩa</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {left.map((a) => (
            <button
              key={a}
              className={cx(tile(selA === a, done.has(a), bad?.[0] === a), ex.han && "han text-lg")}
              onClick={() => {
                setSelA(a);
                speak(a, lang);
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((b) => (
            <button key={b} className={cx(tile(selB === b, doneB.has(b), bad?.[1] === b), "text-sm")} onClick={() => setSelB(b)}>
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Xếp câu (word bank) --- */
function Build({ lang, ex, checked, onReport }: { lang: Lang; ex: Extract<Ex, { t: "build" }>; checked: boolean; onReport: (r: Report) => void }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const listen = ex.prompt.startsWith("Nghe");
  useEffect(() => {
    if (listen && ex.audio) setTimeout(() => speak(ex.audio!, lang), 250);
  }, [ex, lang, listen]);

  function update(next: number[]) {
    setChosen(next);
    const said = next.map((k) => ex.bank[k]).join(ex.joiner);
    onReport({ ready: next.length > 0, correct: normText(said, lang) === normText(ex.answer.join(ex.joiner), lang), answer: ex.text });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <SpeakButton text={ex.audio ?? ex.text} lang={lang} size="lg" />
        <div className="min-w-0 pt-1">
          <div className="text-lg font-bold">{ex.prompt}</div>
          {listen && <SpeakButton text={ex.audio ?? ex.text} lang={lang} size="sm" rate={0.55} caption="🐢 Nghe chậm" />}
        </div>
      </div>
      <div className="flex min-h-14 flex-wrap content-start gap-2 border-b-2 border-line pb-2">
        {chosen.map((k, idx) => (
          <button
            key={`${k}-${idx}`}
            disabled={checked}
            onClick={() => update(chosen.filter((_, j) => j !== idx))}
            className={cx("rounded-xl border-2 border-b-4 border-line bg-card px-3 py-1.5 font-semibold", ex.han && "han text-lg")}
          >
            {ex.bank[k]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ex.bank.map((w, k) => {
          const used = chosen.includes(k);
          return (
            <button
              key={k}
              disabled={used || checked}
              onClick={() => {
                sfx.tap();
                if (lang === "zh") speak(w, lang);
                update([...chosen, k]);
              }}
              className={cx(
                "rounded-xl border-2 border-b-4 px-3 py-1.5 font-semibold transition",
                ex.han && "han text-lg",
                used ? "border-line bg-line text-transparent" : "border-line bg-card hover:bg-brand/5",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
      {checked && lang === "zh" && ex.py && <div className="py text-center text-sm text-muted">{ex.py}</div>}
    </div>
  );
}

/* --- Nghe & chép --- */
function TypeIt({ lang, ex, checked, onReport }: { lang: Lang; ex: Extract<Ex, { t: "type" }>; checked: boolean; onReport: (r: Report) => void }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setTimeout(() => speak(ex.audio, lang), 250);
  }, [ex, lang]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        <SpeakButton text={ex.audio} lang={lang} size="lg" />
        <SpeakButton text={ex.audio} lang={lang} size="lg" rate={0.55} caption="🐢" />
      </div>
      <div className="text-center text-sm text-muted">Gõ lại chính xác câu bạn nghe được</div>
      <textarea
        value={text}
        disabled={checked}
        rows={2}
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          const a = normText(e.target.value, lang);
          const b = normText(ex.text, lang);
          const dist = editDistance(a, b);
          const typo = dist > 0 && dist <= Math.max(1, Math.floor(b.length / 20));
          onReport({ ready: !!a, correct: dist === 0 || typo, answer: ex.text, note: typo ? `Có lỗi chính tả nhỏ. Câu đúng: “${ex.text}”` : `Nghĩa: ${ex.vi}` });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        placeholder="Gõ tiếng Anh…"
        className="w-full rounded-xl border-2 border-line bg-bg px-4 py-3 text-lg outline-none focus:border-brand"
      />
    </div>
  );
}

/* --- Nói theo (chấm phát âm) --- */
function Speak({ lang, ex, onReport }: { lang: Lang; ex: Extract<Ex, { t: "speak" }>; onReport: (r: Report) => void }) {
  return (
    <Pronounce
      lang={lang}
      text={ex.text}
      phonetic={ex.py}
      vi={ex.vi}
      onResult={(score) => onReport({ ready: true, correct: score >= 70, answer: ex.text, note: `Độ chính xác: ${score}% ${score >= 70 ? "" : "(cần ≥ 70%)"}` })}
    />
  );
}
