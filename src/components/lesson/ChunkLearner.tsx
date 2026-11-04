"use client";
// Học từ vựng cho người mới: chia nhóm 3 từ → xem kỹ từng từ (nghe chậm 2 lần) → kiểm tra nhẹ ngay → nhóm tiếp
// → cứ 2 nhóm lại ôn gộp. Dựa trên nguyên tắc "chia nhỏ" (chunking) và "tự nhớ lại ngay" (retrieval practice).
import { useEffect, useMemo, useState } from "react";
import type { Lang, VocabItem } from "@/content/types";
import { usePrefs } from "@/lib/prefs";
import { speak, stopSpeaking } from "@/lib/speech";
import { Bar, Button, Card, MicButton, SpeakButton, cx, shuffle } from "../ui";
import { Session } from "../practice/Session";
import { matchEx, vocabChoice, type Ex } from "../practice/exercises";
import { OfficialBadge } from "../OfficialBadge";

const SIZE = 3;

function chunk<T>(a: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  // nhóm cuối chỉ có 1 từ thì gộp vào nhóm trước
  if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2].push(...out.pop()!);
  return out;
}

function checkItems(lang: Lang, group: VocabItem[], learned: VocabItem[], all: VocabItem[], withReview: boolean): Ex[] {
  const pool = learned.length >= 3 ? learned : all;
  const out: Ex[] = [];
  shuffle(group).forEach((v) => out.push(vocabChoice(lang, v, pool, 0, true, 2)));
  shuffle(group).forEach((v) => out.push(vocabChoice(lang, v, pool, 2, true, 2)));
  if (withReview && learned.length >= 4) out.push(matchEx(lang, learned, Math.min(5, learned.length)));
  out.push(vocabChoice(lang, group[Math.floor(Math.random() * group.length)], pool, 1, true, 2));
  return out;
}

export function ChunkLearner({ lang, vocab, onFinished }: { lang: Lang; vocab: VocabItem[]; onFinished?: () => void }) {
  const groups = useMemo(() => chunk(vocab, SIZE), [vocab]);
  const [g, setG] = useState(0);
  const [k, setK] = useState(0);
  const [phase, setPhase] = useState<"learn" | "check" | "done">("learn");
  const [round, setRound] = useState(0);
  const [prefs] = usePrefs();
  const group = groups[g] ?? [];
  const v = group[k];
  const learned = useMemo(() => groups.slice(0, g + 1).flat(), [groups, g]);
  const zh = lang === "zh";

  // Tự đọc chậm 2 lần khi sang từ mới
  useEffect(() => {
    if (phase !== "learn" || !v) return;
    const t1 = setTimeout(() => speak(v.term, lang, { rate: zh ? 0.55 : 0.75 }), 300);
    const t2 = setTimeout(() => speak(v.term, lang), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      stopSpeaking();
    };
  }, [v, phase, lang, zh]);

  const items = useMemo(
    () => (phase === "check" ? checkItems(lang, group, learned, vocab, g % 2 === 1 || g === groups.length - 1) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, g, round],
  );

  const totalDone = groups.slice(0, g).flat().length + (phase === "learn" ? k : group.length);

  if (phase === "done") {
    return (
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="text-5xl">🌱</div>
        <div className="text-xl font-extrabold">Đã học xong {vocab.length} từ!</div>
        <div className="flex max-w-md flex-wrap justify-center gap-1.5">
          {vocab.map((x) => (
            <button key={x.term} onClick={() => speak(x.term, lang)} className="rounded-xl bg-bg px-2.5 py-1 ring-1 ring-line">
              <span className={cx(zh && "han text-lg")}>{x.term}</span> <span className="text-xs text-muted">{x.vi}</span>
            </button>
          ))}
        </div>
        <p className="max-w-md text-sm text-muted">
          Mẹo: tối nay trước khi ngủ nhẩm lại 3–4 từ, sáng mai vào mục <b>Ôn tập</b> — ôn cách quãng giúp nhớ lâu hơn gấp nhiều lần so với học dồn.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setG(0);
              setK(0);
              setPhase("learn");
            }}
          >
            Học lại từ đầu
          </Button>
          {onFinished && <Button onClick={onFinished}>Tiếp tục bài học →</Button>}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-semibold text-muted">
        <span className="shrink-0">
          Nhóm {g + 1}/{groups.length}
        </span>
        <Bar value={(totalDone / vocab.length) * 100} color="bg-ok" />
        <span className="shrink-0">
          {totalDone}/{vocab.length} từ
        </span>
      </div>

      {phase === "check" ? (
        <div className="flex flex-col gap-2">
          <div className="text-center text-sm font-semibold text-brand">✅ Kiểm tra nhanh {group.length} từ vừa học {g % 2 === 1 && learned.length > group.length ? "+ ôn lại các nhóm trước" : ""}</div>
          <Session
            key={`${g}-${round}`}
            lang={lang}
            items={items}
            gentle
            onFinish={() => {
              if (g + 1 >= groups.length) setPhase("done");
              else {
                setG(g + 1);
                setK(0);
                setPhase("learn");
              }
            }}
          />
        </div>
      ) : (
        v && (
          <>
            <div className="flex justify-center gap-1.5">
              {group.map((x, i) => (
                <button key={x.term} onClick={() => setK(i)} className={cx("h-2.5 rounded-full transition-all", i === k ? "w-8 bg-brand" : i < k ? "w-2.5 bg-brand/50" : "w-2.5 bg-line")} aria-label={`Từ ${i + 1}`} />
              ))}
            </div>
            <Card key={v.term} className="animate-pop flex flex-col items-center gap-2 py-6 text-center">
              <div className={cx("font-extrabold leading-tight", zh ? "han text-7xl" : "text-5xl")}>{v.term}</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {zh ? <span className="py text-2xl font-semibold text-zh">{v.py}</span> : <span className="py text-lg text-muted">{v.ipa}</span>}
                <OfficialBadge lang={lang} term={v.term} />
              </div>
              <div className="text-2xl font-bold">{v.vi}</div>
              {v.hv && (
                <div className="rounded-full bg-warn/10 px-3 py-1 text-sm">
                  🇻🇳 Hán Việt: <b>{v.hv}</b>
                  <span className="text-muted"> — liên tưởng với từ tiếng Việt quen thuộc</span>
                </div>
              )}
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <SpeakButton text={v.term} lang={lang} size="lg" caption="🔊 Nghe" />
                <SpeakButton text={v.term} lang={lang} size="lg" rate={zh ? 0.45 : 0.6} caption="🐢 Thật chậm" />
                <MicButton target={v.term} lang={lang} />
              </div>
              {v.ex && (
                <div className="mt-2 w-full max-w-md rounded-xl bg-bg p-3 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      {zh && v.exPy && <div className="py text-xs text-muted">{v.exPy}</div>}
                      <div className={cx(zh && "han text-lg")}>{v.ex}</div>
                      {prefs.showTranslation && <div className="text-xs text-muted">{v.exVi}</div>}
                    </div>
                    <SpeakButton text={v.ex} lang={lang} size="sm" rate={zh ? 0.6 : 0.8} />
                  </div>
                </div>
              )}
              <div className="text-xs text-muted">💡 Đọc to theo 2–3 lần, vừa đọc vừa nghĩ đến nghĩa của từ.</div>
            </Card>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" disabled={k === 0 && g === 0} onClick={() => (k > 0 ? setK(k - 1) : (setG(g - 1), setK(groups[g - 1].length - 1)))}>
                ←
              </Button>
              {k + 1 < group.length ? (
                <Button className="flex-1" onClick={() => setK(k + 1)}>
                  Từ tiếp theo →
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => {
                    setRound((r) => r + 1);
                    setPhase("check");
                  }}
                >
                  Kiểm tra nhanh {group.length} từ này ✓
                </Button>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
