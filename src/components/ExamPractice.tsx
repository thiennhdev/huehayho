"use client";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import type { Prompt } from "@/content/exams";
import { useProgress } from "./ProgressProvider";
import { Button, Card, MicButton, cx } from "./ui";
import { XP, addXp } from "@/lib/progress";

function count(text: string, lang: Lang) {
  if (lang === "zh") return (text.match(/[一-鿿]/g) ?? []).length;
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function ExamPractice({ lang, prompts, speaking, checklist }: { lang: Lang; prompts: Prompt[]; speaking: string[]; checklist: string[] }) {
  const { progress, update } = useProgress();
  const [pid, setPid] = useState(prompts[0].id);
  const p = prompts.find((x) => x.id === pid)!;
  const key = `exam:${lang}:${pid}`;
  const saved = progress.writings[key];
  const [text, setText] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cue, setCue] = useState(0);

  useEffect(() => {
    setText(progress.writings[`exam:${lang}:${pid}`]?.text ?? "");
    setChecks({});
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setLeft(null);
  }
  function startTimer() {
    stop();
    setLeft(p.minutes * 60);
    timer.current = setInterval(() => setLeft((s) => (s === null ? null : s <= 1 ? (clearInterval(timer.current!), 0) : s - 1)), 1000);
  }
  useEffect(() => () => stop(), []);

  const n = count(text, lang);
  const unit = lang === "zh" ? "chữ" : "từ";
  const doneChecks = Object.values(checks).filter(Boolean).length;

  return (
    <>
      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">✍️ Phòng luyện viết (bấm giờ)</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {prompts.map((x) => (
            <button
              key={x.id}
              onClick={() => setPid(x.id)}
              className={cx(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                pid === x.id ? "bg-brand text-white" : "bg-bg text-muted ring-1 ring-line",
                progress.writings[`exam:${lang}:${x.id}`] && pid !== x.id && "ring-ok/60",
              )}
            >
              {progress.writings[`exam:${lang}:${x.id}`] ? "✓ " : ""}
              {x.kind}
            </button>
          ))}
        </div>
        <div className={cx("rounded-xl border-l-4 border-love bg-love/5 p-3", lang === "zh" && "han text-lg")}>{p.text}</div>
        {p.hint && <div className="text-xs text-muted">💡 {p.hint}</div>}
        <div className="flex flex-wrap items-center gap-2">
          {left === null ? (
            <Button variant="soft" onClick={startTimer}>
              ⏱ Bắt đầu {p.minutes} phút
            </Button>
          ) : (
            <>
              <span className={cx("rounded-xl px-3 py-2 font-mono text-lg font-bold", left < 120 ? "bg-zh/10 text-zh" : "bg-brand/10 text-brand")}>
                {Math.floor(left / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(left % 60).toString().padStart(2, "0")}
              </span>
              <Button variant="ghost" onClick={stop}>
                Dừng
              </Button>
              {left === 0 && <span className="text-sm font-semibold text-zh">Hết giờ!</span>}
            </>
          )}
          <span className={cx("ml-auto text-sm font-semibold", n >= p.minWords ? "text-ok" : "text-muted")}>
            {n}/{p.minWords} {unit}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={lang === "en" ? "Start writing your essay here…" : "在这里写你的文章…"}
          className={cx("w-full rounded-xl border border-line bg-bg p-3 leading-relaxed outline-none focus:border-brand", lang === "zh" && "han text-lg")}
        />
        <details className="rounded-xl bg-bg p-3 text-sm" open>
          <summary className="cursor-pointer font-semibold">
            ✅ Tự chấm theo tiêu chí ({doneChecks}/{checklist.length})
          </summary>
          <div className="mt-2 flex flex-col gap-1.5">
            {checklist.map((c, i) => (
              <label key={c} className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={!!checks[i]} onChange={(e) => setChecks((x) => ({ ...x, [i]: e.target.checked }))} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </details>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">{saved ? `Đã lưu lúc ${new Date(saved.t).toLocaleString("vi-VN")}` : "Chưa lưu"}</span>
          <Button
            disabled={!text.trim()}
            onClick={() => {
              const first = !saved;
              update((pr) => {
                const next = { ...pr, writings: { ...pr.writings, [key]: { text, t: Date.now() } } };
                return first ? addXp(next, XP.writing * 2) : next;
              });
              setMsg(first ? `Đã lưu! +${XP.writing * 2} XP` : "Đã lưu bản sửa ✓");
              setTimeout(() => setMsg(""), 2500);
            }}
          >
            Lưu bài
          </Button>
        </div>
        {msg && <div className="text-sm font-semibold text-ok">{msg}</div>}
        <p className="text-xs text-muted">Mẹo cho hai bạn: viết xong đổi bài cho nhau đọc. Người học tiếng Anh vẫn có thể góp ý bố cục, lập luận cho bài tiếng Trung và ngược lại!</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">🎙️ Phòng luyện nói</h2>
        <div className={cx("rounded-xl bg-bg p-4 font-semibold", lang === "zh" && "han text-lg")}>{speaking[cue]}</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => setCue((c) => (c - 1 + speaking.length) % speaking.length)}>
            ←
          </Button>
          <span className="text-sm text-muted">
            {cue + 1}/{speaking.length}
          </span>
          <Button variant="ghost" onClick={() => setCue((c) => (c + 1) % speaking.length)}>
            →
          </Button>
          <div className="ml-auto">
            <MicButton lang={lang} onScore={(_, said) => said && update((pr) => addXp(pr, XP.speaking))} />
          </div>
        </div>
        <p className="text-xs text-muted">
          {lang === "en"
            ? "Part 2: chuẩn bị 1 phút (ghi từ khoá), nói 2 phút. Nhờ người yêu làm giám khảo hỏi thêm câu Part 3!"
            : "HSKK: chuẩn bị 2–3 phút, nói khoảng 2 phút. Dùng cấu trúc 开头 – 主体 – 结尾."}
        </p>
      </Card>
    </>
  );
}
