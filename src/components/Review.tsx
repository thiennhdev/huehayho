"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lang, VocabItem } from "@/content/types";
import { useProgress } from "./ProgressProvider";
import { Bar, Button, Card, Empty, SpeakButton, cx, shuffle } from "./ui";
import { XP, addXp, dueCards, langOfId } from "@/lib/progress";
import { isMature, previewLabel, schedule, type Rating } from "@/lib/srs";
import { usePrefs } from "@/lib/prefs";
import { speak } from "@/lib/speech";
import { OfficialBadge } from "./OfficialBadge";

type Dict = Record<string, VocabItem & { unitId: string }>;

const RATINGS: { r: Rating; label: string; cls: string; key: string }[] = [
  { r: 0, label: "Quên", cls: "bg-zh/10 text-zh hover:bg-zh/20", key: "1" },
  { r: 1, label: "Khó", cls: "bg-warn/10 text-warn hover:bg-warn/20", key: "2" },
  { r: 2, label: "Được", cls: "bg-ok/10 text-ok hover:bg-ok/20", key: "3" },
  { r: 3, label: "Dễ", cls: "bg-en/10 text-en hover:bg-en/20", key: "4" },
];

export function Review() {
  const { progress, update, lang: mainLang, loaded } = useProgress();
  const [lang, setLang] = useState<Lang>(mainLang);
  const [dict, setDict] = useState<Dict | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [mode, setMode] = useState<"due" | "free">("due");
  const [reverse, setReverse] = useState(false);
  const [shown, setShown] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [prefs] = usePrefs();

  useEffect(() => setLang(mainLang), [mainLang]);

  useEffect(() => {
    setDict(null);
    fetch(`/api/vocab/${lang}`)
      .then((r) => r.json())
      .then(setDict)
      .catch(() => setDict({}));
  }, [lang]);

  const allIds = useMemo(() => Object.keys(progress.cards).filter((id) => langOfId(id) === lang), [progress.cards, lang]);
  const due = useMemo(() => (loaded ? dueCards(progress, lang) : []), [progress, lang, loaded]);
  const tomorrow = useMemo(() => allIds.filter((id) => progress.cards[id].due <= Date.now() + 86400000).length, [allIds, progress.cards]);
  const mature = allIds.filter((id) => isMature(progress.cards[id])).length;

  const start = useCallback(
    (m: "due" | "free") => {
      setMode(m);
      setQueue(m === "due" ? due.slice(0, 100) : shuffle(allIds).slice(0, 20));
      setShown(false);
      setDoneCount(0);
      setStarted(true);
    },
    [due, allIds],
  );

  const id = started ? queue[0] : undefined;
  const v = id && dict ? dict[id] : undefined;
  const card = id ? progress.cards[id] : undefined;

  useEffect(() => {
    if (v && prefs.autoPlay && !reverse) speak(v.term, lang);
  }, [v, lang, prefs.autoPlay, reverse]);

  const rate = useCallback(
    (r: Rating) => {
      if (!id) return;
      if (mode === "due" && card) {
        update((p) => addXp({ ...p, cards: { ...p.cards, [id]: schedule(p.cards[id], r) } }, XP.review, { reviews: 1 }));
      }
      setDoneCount((c) => c + 1);
      setShown(false);
      setQueue((q) => (r === 0 ? [...q.slice(1), q[0]] : q.slice(1)));
    },
    [id, mode, card, update],
  );

  // Phím tắt: Space = lật, 1–4 = chấm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || !v) return;
      if (e.code === "Space") {
        e.preventDefault();
        setShown(true);
        if (reverse) speak(v.term, lang);
      } else if (shown && ["1", "2", "3", "4"].includes(e.key)) rate((Number(e.key) - 1) as Rating);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, v, shown, rate, reverse, lang]);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-2xl font-extrabold">🃏 Ôn tập từ vựng</h1>
      <div className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line">
        {(["en", "zh"] as const).map((l) => (
          <button
            key={l}
            onClick={() => {
              setLang(l);
              setStarted(false);
            }}
            className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", lang === l ? (l === "en" ? "bg-en text-white" : "bg-zh text-white") : "text-muted")}
          >
            {l === "en" ? "🇬🇧 Anh" : "🇨🇳 Trung"}
          </button>
        ))}
      </div>
    </div>
  );

  if (!started || !id) {
    const finished = started && !id;
    return (
      <div className="flex flex-col gap-4">
        {header}
        <Card>
          {allIds.length === 0 ? (
            <Empty icon="🌱" title="Chưa có thẻ nào">
              Học một bài và bấm “Thêm vào thẻ ôn tập” (hoặc hoàn thành phần Luyện tập) để tạo thẻ.{" "}
              <Link href={`/learn/${lang}`} className="font-semibold text-brand">
                Đi học ngay →
              </Link>
            </Empty>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {finished ? (
                <>
                  <div className="text-5xl">🎉</div>
                  <div className="text-xl font-bold">Xong phiên ôn tập! ({doneCount} lượt)</div>
                </>
              ) : (
                <div className="text-5xl">{due.length ? "🧠" : "✨"}</div>
              )}
              <div className="grid w-full max-w-md grid-cols-3 gap-2 text-center">
                <Stat n={due.length} label="cần ôn ngay" cls="text-love" />
                <Stat n={tomorrow} label="trong 24h tới" />
                <Stat n={`${mature}/${allIds.length}`} label="đã thuộc lâu" cls="text-ok" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button disabled={!due.length} onClick={() => start("due")}>
                  {due.length ? `Ôn ${Math.min(due.length, 100)} thẻ` : "Không có thẻ đến hạn"}
                </Button>
                <Button variant="soft" onClick={() => start("free")}>
                  Luyện tự do 20 thẻ
                </Button>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} /> Chiều ngược: nhìn nghĩa tiếng Việt → nhớ từ
              </label>
              <p className="max-w-md text-xs text-muted">
                Thuật toán lặp lại ngắt quãng (SM-2, giống Anki): từ nào bạn thấy dễ sẽ được hẹn ôn sau lâu hơn, từ hay quên sẽ xuất hiện lại sớm. Thẻ có khoảng lặp ≥ 21 ngày được tính là “đã thuộc lâu”.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="flex items-center gap-3">
        <Bar value={(doneCount / (doneCount + queue.length)) * 100} color="bg-love" />
        <span className="shrink-0 text-xs text-muted">còn {queue.length}</span>
        <button onClick={() => setStarted(false)} className="text-xs font-semibold text-muted hover:text-ink">
          Dừng
        </button>
      </div>

      {!v ? (
        <Card>Đang tải…</Card>
      ) : (
        <Card className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
          {mode === "free" && <span className="rounded-full bg-line px-2 py-0.5 text-[10px] text-muted">Luyện tự do — không thay đổi lịch ôn</span>}
          {reverse && !shown ? (
            <div className="text-2xl font-bold">{v.vi}</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={cx("font-extrabold", lang === "zh" ? "han text-6xl" : "text-4xl")}>{v.term}</div>
              <SpeakButton text={v.term} lang={lang} />
            </div>
          )}
          {shown ? (
            <div className="animate-pop flex w-full max-w-md flex-col items-center gap-2">
              <div className="text-sm">
                {lang === "zh" ? <span className="py font-semibold text-zh">{v.py}</span> : <span className="py text-muted">{v.ipa}</span>}
                {v.hv && <span className="ml-2 text-muted">· Hán Việt: <b className="text-ink">{v.hv}</b></span>}
                <span className="ml-2"><OfficialBadge lang={lang} term={v.term} /></span>
              </div>
              {!reverse && <div className="text-xl font-bold">{v.vi}</div>}
              {v.ex && (
                <div className="w-full rounded-xl bg-bg p-3 text-sm">
                  <div className="flex items-start gap-2 text-left">
                    <div className="min-w-0 flex-1">
                      <div className={cx(lang === "zh" && "han text-base")}>{v.ex}</div>
                      <div className="text-xs text-muted">{v.exVi}</div>
                    </div>
                    <SpeakButton text={v.ex} lang={lang} size="sm" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="soft"
              className="mt-4"
              onClick={() => {
                setShown(true);
                if (reverse) speak(v.term, lang);
              }}
            >
              Hiện đáp án <span className="hidden text-xs opacity-60 sm:inline">(Space)</span>
            </Button>
          )}
        </Card>
      )}

      {shown && v && (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((x) => (
            <button key={x.r} onClick={() => rate(x.r)} className={cx("flex flex-col items-center rounded-xl py-3 font-bold transition", x.cls)}>
              {x.label}
              {mode === "due" && card && <span className="text-[11px] font-medium opacity-80">{previewLabel(card, x.r)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ n, label, cls }: { n: number | string; label: string; cls?: string }) {
  return (
    <div className="rounded-xl bg-bg p-3">
      <div className={cx("text-2xl font-extrabold", cls)}>{n}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
