"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import type { LevelSummary } from "@/content";
import { useProgress } from "./ProgressProvider";
import { Bar, Card, cx } from "./ui";
import { unitHrefClient } from "@/lib/links";

export function Roadmap(props: { lang: Lang; name: string; flag: string; framework: string; target: string; levels: LevelSummary[] }) {
  const { lang, levels } = props;
  const { progress } = useProgress();
  const current = levels.find((l) => l.units.some((u) => !progress.units[u.id]?.done))?.id ?? levels[levels.length - 1].id;
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    setOpen(hash && levels.some((l) => l.id === hash) ? hash : current);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = lang === "en" ? "text-en" : "text-zh";
  const accentBg = lang === "en" ? "bg-en" : "bg-zh";
  const totalUnits = levels.reduce((a, l) => a + l.units.length, 0);
  const totalDone = levels.reduce((a, l) => a + l.units.filter((u) => progress.units[u.id]?.done).length, 0);
  const totalWords = levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.words, 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">
            {props.flag} Lộ trình {props.name}
          </h1>
          <p className="text-sm text-muted">
            {props.framework} · Mục tiêu <b className={accent}>{props.target}</b> ·{" "}
            <Link href="/sources" className="font-semibold text-brand hover:underline">
              Nguồn giáo trình
            </Link>
            {lang === "zh" && (
              <>
                {" · "}
                <Link href="/write" className="font-semibold text-zh hover:underline">
                  ✍️ Tập viết chữ Hán
                </Link>
                {" · "}
                <Link href="/pinyin" className="font-semibold text-zh hover:underline">
                  🎵 Pinyin & thanh điệu
                </Link>
              </>
            )}
          </p>
        </div>
        <Link href={`/learn/${lang === "en" ? "zh" : "en"}`} className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-brand/5">
          {lang === "en" ? "🇨🇳 Trung" : "🇬🇧 Anh"}
        </Link>
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <div className="text-2xl font-extrabold">
            {totalDone}/{totalUnits}
          </div>
          <div className="text-xs text-muted">bài đã hoàn thành</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold">{totalWords}</div>
          <div className="text-xs text-muted">từ vựng cốt lõi</div>
        </div>
        <div className="min-w-40 flex-1">
          <Bar value={(totalDone / totalUnits) * 100} color={accentBg} />
        </div>
      </Card>

      <ol className="relative flex flex-col gap-3 border-l-2 border-line pl-5">
        {levels.map((lv) => {
          const done = lv.units.filter((u) => progress.units[u.id]?.done).length;
          const isOpen = open === lv.id;
          const complete = done === lv.units.length;
          return (
            <li key={lv.id} id={lv.id} className="scroll-mt-20">
              <span className={cx("absolute -left-[9px] mt-5 h-4 w-4 rounded-full border-2 border-bg", complete ? "bg-ok" : lv.id === current ? accentBg : "bg-line")} />
              <Card className={cx(lv.id === current && "ring-2 ring-brand/30")}>
                <button className="flex w-full items-start gap-3 text-left" onClick={() => setOpen(isOpen ? null : lv.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx("text-lg font-extrabold", accent)}>{lv.code}</span>
                      <span className="font-bold">{lv.title}</span>
                      {complete && <span className="text-sm">✅</span>}
                      {lv.id === current && !complete && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">ĐANG HỌC</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      🎯 {lv.exam} · ⏱ {lv.hours}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Bar value={(done / lv.units.length) * 100} color={complete ? "bg-ok" : accentBg} />
                      <span className="shrink-0 text-xs text-muted">
                        {done}/{lv.units.length}
                      </span>
                    </div>
                  </div>
                  <span className={cx("mt-1 transition", isOpen && "rotate-180")}>▾</span>
                </button>
                {isOpen && (
                  <div className="mt-4 animate-pop">
                    <p className="text-sm">{lv.description}</p>
                    <details className="mt-3 rounded-xl bg-bg p-3 text-sm">
                      <summary className="cursor-pointer font-semibold">Năng lực đầu ra (Can-do) & giáo trình tham khảo</summary>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                        {lv.canDo.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      <div className="mt-3 font-semibold">📘 Học song song:</div>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                        {lv.books.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </details>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {lv.units.map((u, i) => {
                        const up = progress.units[u.id];
                        return (
                          <Link
                            key={u.id}
                            href={unitHrefClient(lang, lv.id, u.id)}
                            className={cx(
                              "flex items-center gap-3 rounded-xl border p-3 transition hover:border-brand/50 hover:bg-brand/5",
                              up?.done ? "border-ok/40" : "border-line",
                            )}
                          >
                            <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold", up?.done ? "bg-ok text-white" : "bg-brand/10 text-brand")}>
                              {up?.done ? "✓" : i + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold">{u.title}</span>
                              <span className="block truncate text-xs text-muted">{u.topic}</span>
                            </span>
                            {up && <span className="shrink-0 text-xs font-bold text-muted">{up.best}%</span>}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
