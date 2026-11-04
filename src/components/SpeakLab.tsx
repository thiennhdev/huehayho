"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/content/types";
import type { DrillGroup } from "@/content/pronunciation";
import { useProgress } from "./ProgressProvider";
import { Card, cx } from "./ui";
import { Pronounce } from "./practice/Pronounce";
import { XP, addXp } from "@/lib/progress";
import type { SentenceLite } from "./practice/exercises";

type S = SentenceLite & { unitId: string };

export function SpeakLab({ groups }: { groups: Record<Lang, DrillGroup[]> }) {
  const { lang: mainLang, progress, update } = useProgress();
  const [lang, setLang] = useState<Lang>(mainLang);
  const [gid, setGid] = useState<string>("");
  const [idx, setIdx] = useState(0);
  const [sentences, setSentences] = useState<S[] | null>(null);
  const [rewarded, setRewarded] = useState<Set<string>>(new Set());
  useEffect(() => setLang(mainLang), [mainLang]);
  useEffect(() => {
    setGid(groups[lang][0].id);
    setIdx(0);
    setSentences(null);
    fetch(`/api/sentences/${lang}`)
      .then((r) => r.json())
      .then(setSentences)
      .catch(() => setSentences([]));
  }, [lang, groups]);

  const learned = useMemo(() => {
    const ids = new Set(Object.keys(progress.units));
    return (sentences ?? []).filter((s) => ids.has(s.unitId));
  }, [sentences, progress.units]);

  const isLearned = gid === "learned";
  const group = groups[lang].find((g) => g.id === gid);
  const items = isLearned ? learned.map((s) => ({ text: s.text, phon: s.py ?? "", vi: s.vi })) : group?.items ?? [];
  const item = items[idx % Math.max(1, items.length)];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">🎤 Luyện phát âm</h1>
          <p className="text-sm text-muted">Nghe mẫu → bấm 🎙️ đọc to → từ <b className="text-ok">xanh</b> là chuẩn, <b className="text-zh">đỏ</b> là cần sửa</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-card p-1 ring-1 ring-line">
          {(["en", "zh"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", lang === l ? (l === "en" ? "bg-en text-white" : "bg-zh text-white") : "text-muted")}>
              {l === "en" ? "🇬🇧 Anh" : "🇨🇳 Trung"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex min-w-max gap-2">
          {groups[lang].map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setGid(g.id);
                setIdx(0);
              }}
              className={cx("rounded-full px-3.5 py-2 text-sm font-semibold", gid === g.id ? "bg-brand text-white" : "bg-card text-muted ring-1 ring-line")}
            >
              {g.title}
            </button>
          ))}
          <button
            onClick={() => {
              setGid("learned");
              setIdx(0);
            }}
            className={cx("rounded-full px-3.5 py-2 text-sm font-semibold", isLearned ? "bg-love text-white" : "bg-card text-love ring-1 ring-love/40")}
          >
            📚 Câu trong bài đã học ({learned.length})
          </button>
        </div>
      </div>

      {group && !isLearned && (
        <Card className="bg-brand/5 text-sm">
          <div className="font-bold">
            🎯 {group.focus}
          </div>
          <div className="mt-1 text-muted">{group.tip}</div>
        </Card>
      )}

      {!item ? (
        <Card className="py-10 text-center text-sm text-muted">{isLearned ? (sentences ? "Học một vài bài trước, câu trong bài sẽ xuất hiện ở đây để luyện nói." : "Đang tải…") : "Không có dữ liệu"}</Card>
      ) : (
        <Card className="py-8">
          <Pronounce
            key={`${lang}-${gid}-${idx}`}
            lang={lang}
            text={item.text}
            phonetic={item.phon}
            vi={item.vi}
            onResult={(score) => {
              const k = `${lang}:${item.text}`;
              if (score >= 50 && !rewarded.has(k)) {
                setRewarded(new Set(rewarded).add(k));
                update((p) => addXp(p, XP.speaking));
              }
            }}
          />
          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)} className="rounded-xl border border-line px-4 py-2 font-semibold">
              ←
            </button>
            <span className="text-sm text-muted">
              {(idx % items.length) + 1}/{items.length}
            </span>
            <button onClick={() => setIdx((i) => (i + 1) % items.length)} className="rounded-xl border border-line px-4 py-2 font-semibold">
              →
            </button>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted">
        ℹ️ Điểm được tính bằng cách so khớp từng từ/chữ mà công cụ nhận diện giọng nói của trình duyệt nghe được với câu mẫu — giúp phát hiện từ phát âm chưa rõ, nhưng chưa phân tích chi tiết từng âm vị như ELSA. Dùng Chrome/Edge trên máy tính hoặc Android, Safari trên iPhone.
      </p>
    </div>
  );
}
