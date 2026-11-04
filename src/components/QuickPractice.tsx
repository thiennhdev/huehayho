"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang, VocabItem } from "@/content/types";
import { useProgress } from "./ProgressProvider";
import { Button, Card, Empty, cx } from "./ui";
import { Session, type SessionResult } from "./practice/Session";
import { mixedSession, type Ex, type SentenceLite } from "./practice/exercises";
import { addXp, langOfId } from "@/lib/progress";
import { sttSupported } from "@/lib/speech";

type Dict = Record<string, VocabItem & { unitId: string }>;

export function QuickPractice() {
  const { lang: mainLang, progress, update } = useProgress();
  const [lang, setLang] = useState<Lang>(mainLang);
  const [dict, setDict] = useState<Dict | null>(null);
  const [sentences, setSentences] = useState<(SentenceLite & { unitId: string })[] | null>(null);
  const [items, setItems] = useState<Ex[] | null>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ r: SessionResult; xp: number } | null>(null);
  useEffect(() => setLang(mainLang), [mainLang]);
  useEffect(() => {
    setDict(null);
    setSentences(null);
    setItems(null);
    setResult(null);
    Promise.all([fetch(`/api/vocab/${lang}`).then((r) => r.json()), fetch(`/api/sentences/${lang}`).then((r) => r.json())])
      .then(([d, s]) => {
        setDict(d);
        setSentences(s);
      })
      .catch(() => {
        setDict({});
        setSentences([]);
      });
  }, [lang]);

  const learnedIds = Object.keys(progress.cards).filter((id) => langOfId(id) === lang && dict?.[id]);
  const ready = dict && sentences;

  function start() {
    if (!dict || !sentences) return;
    // Ưu tiên từ hay quên (nhiều lần quên, độ dễ thấp), sau đó ngẫu nhiên
    const weak = [...learnedIds]
      .sort((a, b) => {
        const ca = progress.cards[a];
        const cb = progress.cards[b];
        return cb.lapses - ca.lapses || ca.ease - cb.ease || Math.random() - 0.5;
      })
      .map((id) => dict[id]);
    const units = new Set(Object.keys(progress.units));
    const ss = sentences.filter((s) => units.has(s.unitId));
    const pool = Object.values(dict).filter((v) => units.has(v.unitId));
    setItems(mixedSession(lang, weak, pool, ss, sttSupported()));
    setResult(null);
    setRound((r) => r + 1);
  }

  function finish(r: SessionResult) {
    const xp = Math.max(5, r.correct * 2 + (!r.failed && r.correct === r.total ? 10 : 0));
    update((p) => addXp(p, xp));
    setResult({ r, xp });
    setItems(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">⚡ Luyện nhanh</h1>
          <p className="text-sm text-muted">Ghép cặp, nghe – chọn, xếp câu, nghe – chép, nói theo… từ những gì bạn đã học</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line">
          {(["en", "zh"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", lang === l ? (l === "en" ? "bg-en text-white" : "bg-zh text-white") : "text-muted")}>
              {l === "en" ? "🇬🇧 Anh" : "🇨🇳 Trung"}
            </button>
          ))}
        </div>
      </div>

      {items ? (
        <Session key={round} lang={lang} items={items} onFinish={finish} />
      ) : !ready ? (
        <Card>Đang tải…</Card>
      ) : learnedIds.length < 4 ? (
        <Card>
          <Empty icon="🌱" title="Chưa đủ từ để luyện">
            Cần ít nhất 4 từ trong bộ thẻ. Hoàn thành bài đầu tiên nhé!{" "}
            <Link href={`/learn/${lang}`} className="font-semibold text-brand">
              Đi học →
            </Link>
          </Empty>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          {result ? (
            <>
              <div className="text-6xl">{result.r.failed ? "💔" : result.r.correct === result.r.total ? "🏆" : "🎉"}</div>
              <div className="text-2xl font-extrabold">
                {result.r.correct}/{result.r.total} câu đúng
              </div>
              <div className="text-sm text-muted">+{result.xp} XP</div>
            </>
          ) : (
            <>
              <div className="text-6xl">⚡</div>
              <div className="text-lg font-bold">Phiên luyện ~12 câu (5 phút)</div>
              <div className="max-w-sm text-sm text-muted">Hệ thống ưu tiên những từ bạn hay quên trong {learnedIds.length} từ đã học. Có 5 ❤️ — sai 5 câu là kết thúc phiên.</div>
            </>
          )}
          <Button onClick={start} className="px-8 py-3">
            {result ? "Luyện tiếp" : "Bắt đầu"}
          </Button>
        </Card>
      )}
    </div>
  );
}
