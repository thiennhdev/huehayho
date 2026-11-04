"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lang, Unit, VocabItem } from "@/content/types";
import { useProgress } from "../ProgressProvider";
import { Button, Card, MicButton, SpeakButton, cx } from "../ui";
import { usePrefs } from "@/lib/prefs";
import { speak, speakAll, stopSpeaking, sttSupported } from "@/lib/speech";
import { Session, type SessionResult } from "../practice/Session";
import { OfficialBadge } from "../OfficialBadge";
import { HanziTrainer } from "../hanzi/HanziTrainer";
import type { HanziEntry } from "@/content/hanzi-types";
import { beginnerLessonSession, lessonSession, type SentenceLite } from "../practice/exercises";
import { XP, addXp, cardId, isBeginner } from "@/lib/progress";
import { ChunkLearner } from "./ChunkLearner";
import { newCard } from "@/lib/srs";

type Ref = { href: string; title: string } | null;
type PoolItem = { term: string; vi: string; py?: string };

interface Props {
  lang: Lang;
  unit: Unit;
  level: { id: string; code: string; title: string };
  position: { index: number; total: number; inLevel: number; levelSize: number };
  prev: Ref;
  next: Ref;
  pool: PoolItem[];
  sentences: SentenceLite[];
  hanzi?: HanziEntry[];
}

type StepKey = "vocab" | "hanzi" | "grammar" | "context" | "practice" | "output";

export function Lesson({ lang, unit, level, position, prev, next, pool, sentences, hanzi = [] }: Props) {
  const [step, setStep] = useState<StepKey>("vocab");
  const { progress } = useProgress();
  const up = progress.units[unit.id];
  const beginner = isBeginner(progress, lang);
  const steps: { key: StepKey; label: string; icon: string }[] = [
    { key: "vocab", label: "Từ vựng", icon: "🔤" },
    ...(lang === "zh" && hanzi.length ? [{ key: "hanzi" as StepKey, label: "Tập viết", icon: "🖌️" }] : []),
    { key: "grammar", label: "Ngữ pháp", icon: "🧩" },
    { key: "context", label: unit.dialogue ? "Hội thoại" : "Bài đọc", icon: unit.dialogue ? "💬" : "📰" },
    { key: "practice", label: "Luyện tập", icon: "✍️" },
    { key: "output", label: "Nói & Viết", icon: "🎙️" },
  ];
  const si = steps.findIndex((s) => s.key === step);
  const accent = lang === "en" ? "text-en" : "text-zh";

  useEffect(() => {
    stopSpeaking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="flex flex-col gap-4">
      {/* Đầu bài */}
      <div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted">
          <Link href={`/learn/${lang}`} className="hover:text-brand">
            {lang === "en" ? "🇬🇧 Tiếng Anh" : "🇨🇳 Tiếng Trung"}
          </Link>
          <span>/</span>
          <Link href={`/learn/${lang}#${level.id}`} className={cx("font-semibold hover:underline", accent)}>
            {level.code}
          </Link>
          <span>
            / Bài {position.inLevel}/{position.levelSize}
          </span>
          {up?.done && <span className="ml-1 rounded-full bg-ok/15 px-2 py-0.5 font-semibold text-ok">✓ Đã hoàn thành · {up.best}%</span>}
        </div>
        <h1 className={cx("mt-1 text-2xl font-extrabold", lang === "zh" && "han")}>{unit.title}</h1>
        <p className="text-sm text-muted">{unit.topic}</p>
      </div>

      {beginner && (
        <Card className="border-ok/30 bg-ok/5 text-sm">
          <div className="font-bold">🌱 Chế độ người mới đang bật</div>
          <div className="mt-0.5 text-muted">
            Học 3 từ một lần · đọc chậm · có pinyin gợi ý dưới đáp án · sai không mất tim, câu sai được hỏi lại. Đừng vội — mỗi ngày 1 bài là rất tốt!{" "}
            <Link href="/settings#beginner" className="font-semibold text-brand">
              Tuỳ chỉnh
            </Link>
          </div>
          {lang === "zh" && unit.id.startsWith("zh-hsk0") && (
            <Link href="/pinyin" className="mt-2 inline-block font-semibold text-brand">
              🎵 Luyện thanh điệu & pinyin trước khi học →
            </Link>
          )}
        </Card>
      )}

      <Card className="bg-brand/5">
        <div className="text-xs font-bold uppercase tracking-wide text-brand">Mục tiêu bài học</div>
        <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
          {unit.goals.map((g) => (
            <li key={g}>✅ {g}</li>
          ))}
        </ul>
      </Card>

      {/* Thanh bước */}
      <div className="sticky top-[57px] z-20 -mx-4 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur">
        <div className="flex min-w-max gap-2">
          {steps.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={cx(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                step === s.key ? "bg-brand text-white shadow" : i < si ? "bg-brand/15 text-brand" : "bg-card text-muted ring-1 ring-line",
              )}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-pop" key={step}>
        {step === "vocab" && <VocabStep lang={lang} unit={unit} beginner={beginner} onNext={() => setStep(steps[1].key)} />}
        {step === "hanzi" && <HanziStep unitId={unit.id} entries={hanzi} beginner={beginner} />}
        {step === "grammar" && <GrammarStep lang={lang} unit={unit} />}
        {step === "context" && <ContextStep lang={lang} unit={unit} />}
        {step === "practice" && <PracticeStep lang={lang} unit={unit} pool={pool} sentences={sentences} beginner={beginner} onDone={() => setStep("output")} />}
        {step === "output" && <OutputStep lang={lang} unit={unit} />}
      </div>

      {unit.tip && (
        <Card className="border-warn/30 bg-warn/5 text-sm">
          <b>💡 Mẹo:</b> {unit.tip}
        </Card>
      )}

      <div className="flex items-center justify-between gap-2">
        {si > 0 ? (
          <Button variant="ghost" onClick={() => setStep(steps[si - 1].key)}>
            ← {steps[si - 1].label}
          </Button>
        ) : prev ? (
          <Link href={prev.href}>
            <Button variant="ghost">← Bài trước</Button>
          </Link>
        ) : (
          <span />
        )}
        {si < steps.length - 1 ? (
          <Button onClick={() => setStep(steps[si + 1].key)}>{steps[si + 1].label} →</Button>
        ) : next ? (
          <Link href={next.href}>
            <Button>Bài tiếp: {next.title} →</Button>
          </Link>
        ) : (
          <Link href={`/exam/${lang}`}>
            <Button>Luyện thi 🎯</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ---------------- Từ vựng ---------------- */

function useAddCards(lang: Lang, vocab: VocabItem[]) {
  const { progress, update } = useProgress();
  const missing = vocab.filter((v) => !progress.cards[cardId(lang, v.term)]);
  const add = () =>
    update((p) => {
      const cards = { ...p.cards };
      const now = Date.now();
      for (const v of vocab) {
        const id = cardId(lang, v.term);
        if (!cards[id]) cards[id] = newCard(now);
      }
      return { ...p, cards };
    });
  return { missing: missing.length, add };
}

function Phonetic({ v, lang }: { v: VocabItem; lang: Lang }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {lang === "zh" ? <span className="py font-semibold text-zh">{v.py}</span> : <span className="py text-muted">{v.ipa}</span>}
      {v.pos && <span className="rounded bg-line px-1.5 text-[11px] text-muted">{v.pos}</span>}
      <OfficialBadge lang={lang} term={v.term} />
      {v.hv && (
        <span className="text-xs text-muted">
          Hán Việt: <b className="text-ink">{v.hv}</b>
        </span>
      )}
    </div>
  );
}

function VocabStep({ lang, unit, beginner, onNext }: { lang: Lang; unit: Unit; beginner: boolean; onNext: () => void }) {
  const [mode, setMode] = useState<"learn" | "list" | "cards">(beginner ? "learn" : "list");
  const [prefs] = usePrefs();
  const { missing, add } = useAddCards(lang, unit.vocab);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">
          {unit.vocab.length} từ mới · bấm 🔊 để nghe, 🎙️ để luyện phát âm
        </div>
        <div className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line">
          {(["learn", "list", "cards"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", mode === m ? "bg-brand text-white" : "text-muted")}>
              {m === "learn" ? "🌱 Từng nhóm" : m === "list" ? "Danh sách" : "Thẻ lật"}
            </button>
          ))}
        </div>
      </div>

      {mode === "learn" ? (
        <ChunkLearner
          lang={lang}
          vocab={unit.vocab}
          onFinished={() => {
            add();
            onNext();
          }}
        />
      ) : mode === "list" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {unit.vocab.map((v) => (
            <Card key={v.term} className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className={cx("font-extrabold", lang === "zh" ? "han text-3xl" : "text-xl")}>{v.term}</div>
                  <Phonetic v={v} lang={lang} />
                </div>
                <SpeakButton text={v.term} lang={lang} />
              </div>
              <div className="font-semibold">{v.vi}</div>
              {v.ex && (
                <div className="rounded-xl bg-bg p-2.5 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      {lang === "zh" && prefs.showPinyin && v.exPy && <div className="py text-xs text-muted">{v.exPy}</div>}
                      <div className={cx(lang === "zh" && "han text-base")}>{v.ex}</div>
                      {prefs.showTranslation && <div className="text-xs text-muted">{v.exVi}</div>}
                    </div>
                    <SpeakButton text={v.ex} lang={lang} size="sm" />
                  </div>
                </div>
              )}
              <MicButton target={v.term} lang={lang} />
            </Card>
          ))}
        </div>
      ) : (
        <FlipCards lang={lang} vocab={unit.vocab} />
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          {missing ? (
            <>
              Thêm <b>{missing}</b> từ vào bộ thẻ ôn tập để hệ thống nhắc bạn ôn đúng lúc sắp quên.
            </>
          ) : (
            <>✅ Tất cả từ của bài đã nằm trong bộ thẻ ôn tập.</>
          )}
        </div>
        {missing > 0 && <Button onClick={add}>＋ Thêm vào thẻ ôn tập</Button>}
      </Card>
    </div>
  );
}

function FlipCards({ lang, vocab }: { lang: Lang; vocab: VocabItem[] }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const v = vocab[i];
  const go = (d: number) => {
    setFlip(false);
    setI((x) => (x + d + vocab.length) % vocab.length);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => {
          setFlip((f) => !f);
          if (!flip) speak(v.term, lang);
        }}
        className="flex min-h-64 w-full max-w-md flex-col items-center justify-center gap-2 rounded-3xl border border-line bg-card p-6 text-center shadow-md"
      >
        <div className={cx("font-extrabold", lang === "zh" ? "han text-6xl" : "text-4xl")}>{v.term}</div>
        {flip ? (
          <div className="animate-pop flex flex-col items-center gap-1">
            <Phonetic v={v} lang={lang} />
            <div className="text-xl font-bold">{v.vi}</div>
            {v.ex && <div className={cx("mt-2 text-sm text-muted", lang === "zh" && "han")}>{v.ex}</div>}
          </div>
        ) : (
          <div className="text-sm text-muted">Chạm để lật thẻ</div>
        )}
      </button>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => go(-1)}>
          ←
        </Button>
        <span className="text-sm text-muted">
          {i + 1}/{vocab.length}
        </span>
        <Button variant="ghost" onClick={() => go(1)}>
          →
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Tập viết chữ Hán ---------------- */

function HanziStep({ unitId, entries, beginner }: { unitId: string; entries: HanziEntry[]; beginner: boolean }) {
  const fresh = entries.filter((e) => e.isNew);
  const old = entries.filter((e) => !e.isNew);
  const ordered = [...fresh, ...old];
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">
          {fresh.length} chữ mới{old.length ? ` + ${old.length} chữ đã gặp ở bài trước` : ""} · Xem nét → Tô 2 lần → Tự viết
        </div>
        <a href={`/print/hanzi?u=${unitId}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand">
          🖨 In vở tập viết
        </a>
      </div>
      {beginner && fresh.length > 0 && (
        <div className="rounded-xl bg-ok/5 p-2.5 text-xs text-muted ring-1 ring-ok/20">
          🌱 Người mới: chỉ cần viết thật kỹ các <b>chữ mới</b> — đọc phần 🧠 Mẹo nhớ trước khi viết. Chữ đã gặp có thể bỏ qua. Không cần viết được mọi chữ ngay, nhận mặt chữ là đủ ở giai đoạn đầu.
        </div>
      )}
      <HanziTrainer entries={beginner && fresh.length ? fresh : ordered} beginner={beginner} />
    </Card>
  );
}

/* ---------------- Ngữ pháp ---------------- */

function GrammarStep({ lang, unit }: { lang: Lang; unit: Unit }) {
  const [prefs] = usePrefs();
  return (
    <div className="flex flex-col gap-4">
      {unit.grammar.map((g) => (
        <Card key={g.title} className="flex flex-col gap-3">
          <h2 className="text-lg font-extrabold">🧩 {g.title}</h2>
          {g.pattern && <div className={cx("rounded-xl border-l-4 border-brand bg-brand/5 px-3 py-2 font-mono text-sm font-semibold", lang === "zh" && "han")}>{g.pattern}</div>}
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{g.explain}</p>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">Ví dụ</div>
            {g.examples.map((e) => (
              <div key={e.text} className="flex items-start gap-2 rounded-xl bg-bg p-3">
                <div className="min-w-0 flex-1">
                  {lang === "zh" && prefs.showPinyin && e.py && <div className="py text-xs text-muted">{e.py}</div>}
                  <div className={cx("font-semibold", lang === "zh" && "han text-lg")}>{e.text}</div>
                  <div className="text-sm text-muted">{e.vi}</div>
                </div>
                <SpeakButton text={e.text} lang={lang} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Hội thoại / Bài đọc ---------------- */

function Toggles({ pinyin = true }: { pinyin?: boolean }) {
  const [prefs, set] = usePrefs();
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <label className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 ring-1 ring-line">
        <input type="checkbox" checked={prefs.showTranslation} onChange={(e) => set({ showTranslation: e.target.checked })} /> Nghĩa tiếng Việt
      </label>
      {pinyin && (
        <label className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 ring-1 ring-line">
          <input type="checkbox" checked={prefs.showPinyin} onChange={(e) => set({ showPinyin: e.target.checked })} /> Pinyin
        </label>
      )}
    </div>
  );
}

function ContextStep({ lang, unit }: { lang: Lang; unit: Unit }) {
  const [prefs] = usePrefs();
  const [playing, setPlaying] = useState<number | null>(null);
  const [showVi, setShowVi] = useState(false);
  const speakers = unit.dialogue ? Array.from(new Set(unit.dialogue.map((d) => d.s))) : [];

  if (unit.dialogue) {
    return (
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="soft"
            onClick={() => {
              if (playing !== null) {
                stopSpeaking();
                setPlaying(null);
                return;
              }
              speakAll(
                unit.dialogue!.map((d) => d.text),
                lang,
                (i) => setPlaying(i),
                () => setPlaying(null),
              );
            }}
          >
            {playing !== null ? "⏹ Dừng" : "▶ Nghe cả đoạn hội thoại"}
          </Button>
          <Toggles pinyin={lang === "zh"} />
        </div>
        <div className="flex flex-col gap-3">
          {unit.dialogue.map((d, i) => {
            const left = speakers.indexOf(d.s) % 2 === 0;
            return (
              <div key={i} className={cx("flex", left ? "justify-start" : "justify-end")}>
                <div className={cx("max-w-[88%] rounded-2xl p-3", left ? "rounded-tl-sm bg-bg" : "rounded-tr-sm bg-brand/10", playing === i && "ring-2 ring-brand")}>
                  <div className="mb-0.5 text-[11px] font-bold text-muted">{d.s}</div>
                  {lang === "zh" && prefs.showPinyin && d.py && <div className="py text-xs text-muted">{d.py}</div>}
                  <div className={cx("font-semibold", lang === "zh" && "han text-lg")}>{d.text}</div>
                  {prefs.showTranslation && <div className="text-sm text-muted">{d.vi}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SpeakButton text={d.text} lang={lang} size="sm" />
                    <MicButton target={d.text} lang={lang} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted">🎧 Phương pháp shadowing: nghe từng câu → bấm 🎙️ nói đuổi theo → so sánh điểm. Sau đó hai bạn đóng vai A và B với nhau!</p>
      </Card>
    );
  }

  const r = unit.reading!;
  const sentences = r.text.match(/[^。！？.!?]+[。！？.!?」”"]*/g) ?? [r.text];
  return (
    <Card className="flex flex-col gap-3">
      <h2 className={cx("text-xl font-extrabold", lang === "zh" && "han")}>📰 {r.title}</h2>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="soft"
          onClick={() => {
            if (playing !== null) {
              stopSpeaking();
              setPlaying(null);
              return;
            }
            speakAll(sentences, lang, (i) => setPlaying(i), () => setPlaying(null));
          }}
        >
          {playing !== null ? "⏹ Dừng" : "▶ Nghe bài đọc"}
        </Button>
        {lang === "zh" && <Toggles />}
      </div>
      {lang === "zh" && prefs.showPinyin && r.py && <p className="py rounded-xl bg-bg p-3 text-sm leading-relaxed text-muted">{r.py}</p>}
      <p className={cx("leading-loose", lang === "zh" ? "han text-lg" : "text-[16px]")}>
        {sentences.map((s, i) => (
          <span key={i} className={cx("rounded transition", playing === i && "bg-brand/20")}>
            {s}
            {lang === "en" ? " " : ""}
          </span>
        ))}
      </p>
      <button onClick={() => setShowVi((s) => !s)} className="self-start text-sm font-semibold text-brand">
        {showVi ? "Ẩn bản dịch" : "Xem bản dịch tiếng Việt"}
      </button>
      {showVi && <p className="animate-pop rounded-xl bg-bg p-3 text-sm leading-relaxed text-muted">{r.vi}</p>}
      <p className="text-xs text-muted">📌 Đọc lần 1 không xem dịch để đoán ý chính; lần 2 gạch chân từ mới; lần 3 đọc to theo giọng mẫu.</p>
    </Card>
  );
}

/* ---------------- Luyện tập (kiểu Duolingo) ---------------- */

function PracticeStep({ lang, unit, pool, sentences, beginner, onDone }: { lang: Lang; unit: Unit; pool: PoolItem[]; sentences: SentenceLite[]; beginner: boolean; onDone: () => void }) {
  const { progress, update } = useProgress();
  const [round, setRound] = useState(0);
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => setCanSpeak(sttSupported()), []);
  const items = useMemo(
    () => (beginner ? beginnerLessonSession(lang, unit.vocab, unit.practice, pool, sentences) : lessonSession(lang, unit.vocab, unit.practice, pool, sentences, canSpeak)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, unit, pool, sentences, canSpeak, round, beginner],
  );
  const [result, setResult] = useState<{ score: number; xp: number; first: boolean; failed: boolean } | null>(null);

  function finish(r: SessionResult) {
    const score = r.total ? Math.round((r.correct / r.total) * 100) : 0;
    const pass = !r.failed && score >= (beginner ? 60 : 70);
    const prevUnit = progress.units[unit.id];
    const first = pass && !prevUnit?.done;
    const xp = first ? XP.lessonComplete + (score === 100 ? XP.perfectBonus : 0) : pass ? 10 : 5;
    update((p) => {
      const now = Date.now();
      const cur = p.units[unit.id];
      const cards = { ...p.cards };
      if (pass) for (const v of unit.vocab) if (!cards[cardId(lang, v.term)]) cards[cardId(lang, v.term)] = newCard(now);
      const withUnit = {
        ...p,
        cards,
        units: {
          ...p.units,
          [unit.id]: { done: cur?.done ?? (pass ? now : undefined), best: Math.max(cur?.best ?? 0, score), tries: (cur?.tries ?? 0) + 1, t: now },
        },
      };
      return addXp(withUnit, xp, { lessons: first ? 1 : 0 }, now);
    });
    setResult({ score, xp, first, failed: r.failed });
  }

  if (result) {
    const pass = !result.failed && result.score >= (beginner ? 60 : 70);
    return (
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="text-6xl">{result.failed ? "💔" : result.score === 100 ? "🏆" : pass ? "🎉" : "💪"}</div>
        <div className="text-3xl font-extrabold">{result.score}%</div>
        <div className="font-semibold">
          {result.failed ? "Hết tim rồi! Ôn lại phần từ vựng & ngữ pháp rồi thử lại nhé" : pass ? (result.first ? "Hoàn thành bài học!" : "Làm tốt lắm!") : `Gần được rồi — cần đạt ${beginner ? 60 : 70}% để hoàn thành bài. Xem lại phần Từ vựng (🌱 Từng nhóm) rồi thử lại nhé`}
        </div>
        <div className="text-sm text-muted">
          +{result.xp} XP {pass && result.first && "· Từ vựng đã được thêm vào thẻ ôn tập"}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setRound((x) => x + 1);
              setResult(null);
            }}
          >
            Làm lại
          </Button>
          {pass && <Button onClick={onDone}>Nói & Viết →</Button>}
        </div>
      </Card>
    );
  }

  return <Session key={round} lang={lang} items={items} onFinish={finish} gentle={beginner} />;
}

/* ---------------- Nói & Viết ---------------- */

function countWords(text: string, lang: Lang) {
  if (lang === "zh") return (text.match(/[一-鿿]/g) ?? []).length;
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function OutputStep({ lang, unit }: { lang: Lang; unit: Unit }) {
  const { progress, update } = useProgress();
  const saved = progress.writings[unit.id];
  const [text, setText] = useState(saved?.text ?? "");
  const [msg, setMsg] = useState("");
  const [spoken, setSpoken] = useState<Record<number, boolean>>({});
  useEffect(() => {
    if (saved?.text && !text) setText(saved.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.text]);

  const n = countWords(text, lang);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">🎙️ Luyện nói</h2>
        <p className="text-sm text-muted">Nói to câu trả lời (30–60 giây). Bấm Ghi âm để xem máy nhận diện được gì — nếu máy hiểu, người bản xứ cũng hiểu! Tốt nhất là nói cho người yêu nghe 💜</p>
        {unit.speaking.map((s, k) => (
          <div key={k} className="flex flex-col gap-2 rounded-xl bg-bg p-3">
            <div className={cx("font-semibold", lang === "zh" && "han")}>
              {k + 1}. {s}
            </div>
            <MicButton
              lang={lang}
              onScore={(_, said) => {
                if (said && !spoken[k]) {
                  setSpoken((x) => ({ ...x, [k]: true }));
                  update((p) => addXp(p, XP.speaking));
                }
              }}
            />
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">✍️ Luyện viết</h2>
        <div className={cx("rounded-xl border-l-4 border-love bg-love/5 p-3 text-sm font-semibold", lang === "zh" && "han")}>{unit.writing}</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={lang === "en" ? "Write here…" : "在这里写…"}
          className={cx("w-full rounded-xl border border-line bg-bg p-3 leading-relaxed outline-none focus:border-brand", lang === "zh" && "han text-lg")}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted">
            {n} {lang === "zh" ? "chữ Hán" : "từ"}
            {saved && ` · đã lưu ${new Date(saved.t).toLocaleString("vi-VN")}`}
          </span>
          <Button
            disabled={!text.trim()}
            onClick={() => {
              const first = !saved;
              update((p) => {
                const next = { ...p, writings: { ...p.writings, [unit.id]: { text, t: Date.now() } } };
                return first ? addXp(next, XP.writing) : next;
              });
              setMsg(first ? `Đã lưu! +${XP.writing} XP` : "Đã lưu bản sửa ✓");
              setTimeout(() => setMsg(""), 2500);
            }}
          >
            Lưu bài viết
          </Button>
        </div>
        {msg && <div className="text-sm font-semibold text-ok">{msg}</div>}
        <details className="rounded-xl bg-bg p-3 text-sm">
          <summary className="cursor-pointer font-semibold">Tự kiểm tra trước khi lưu</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Đã dùng cấu trúc ngữ pháp chính của bài: “{unit.grammar[0].title}”</li>
            <li>Dùng ít nhất 5 từ mới trong bài</li>
            <li>{lang === "en" ? "Kiểm tra chia động từ, mạo từ a/an/the, số nhiều -s" : "Kiểm tra chữ viết đúng, trật tự từ (thời gian/địa điểm đứng trước động từ)"}</li>
            <li>Nhờ người yêu đọc và góp ý — dạy lại cho người khác là cách nhớ lâu nhất!</li>
          </ul>
        </details>
      </Card>
    </div>
  );
}
