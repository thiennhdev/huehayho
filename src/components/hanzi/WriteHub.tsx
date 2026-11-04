"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { HanziEntry, HanziLevel } from "@/content/hanzi-types";
import type { StrokeRule, StrokeType } from "@/content/hanzi-foundation";
import { useProgress } from "../ProgressProvider";
import { Bar, Button, Card, Empty, cx } from "../ui";
import { HanziPad } from "./HanziPad";
import { HanziTrainer } from "./HanziTrainer";
import { WRITING_TIPS } from "@/content/hanzi-memory";
import { isBeginner } from "@/lib/progress";
import { SpeakButton } from "../ui";

type Tab = "basics" | "lessons" | "review" | "tips";
type Radical = { r: string; name: string; chars: string[] };

export function WriteHub({ levels, strokes, rules, radicals }: { levels: HanziLevel[]; strokes: StrokeType[]; rules: StrokeRule[]; radicals: Radical[] }) {
  const { progress } = useProgress();
  const beginner = isBeginner(progress, "zh");
  const [tab, setTab] = useState<Tab>("lessons");
  const [levelId, setLevelId] = useState(levels[0].id);
  const [open, setOpen] = useState<{ title: string; entries: HanziEntry[]; start?: number } | null>(null);

  const all = useMemo(() => levels.flatMap((l) => l.units.flatMap((u) => u.chars)), [levels]);
  const written = all.filter((e) => progress.hanzi[e.c]);
  const mastered = all.filter((e) => (progress.hanzi[e.c]?.clean ?? 0) > 0);
  const level = levels.find((l) => l.id === levelId)!;

  if (open) {
    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => setOpen(null)} className="self-start text-sm font-semibold text-brand">
          ← Quay lại danh sách
        </button>
        <HanziTrainer entries={open.entries} startStage={open.start ?? 0} title={open.title} beginner={beginner} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">✍️ Tập viết chữ Hán</h1>
        <p className="text-sm text-muted">Viết bằng chuột, ngón tay hoặc Apple Pencil — app chấm từng nét theo đúng thứ tự bút thuận.</p>
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <div className="text-2xl font-extrabold">
            {mastered.length}/{all.length}
          </div>
          <div className="text-xs text-muted">chữ viết đúng không sai nét</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold">{written.length}</div>
          <div className="text-xs text-muted">chữ đã luyện</div>
        </div>
        <div className="min-w-40 flex-1">
          <Bar value={(mastered.length / Math.max(1, all.length)) * 100} color="bg-zh" />
        </div>
      </Card>

      {beginner && written.length < 15 && (
        <Card className="border-ok/30 bg-ok/5 text-sm">
          🌱 <b>Mới bắt đầu?</b> Đọc tab <button className="font-semibold text-brand" onClick={() => setTab("tips")}>💡 Mẹo nhớ</button> và{" "}
          <button className="font-semibold text-brand" onClick={() => setTab("basics")}>① Nét &amp; quy tắc</button> trước (10 phút), sau đó mỗi ngày chỉ cần <b>5 chữ</b>. Chế độ người mới đang bật: chấm nét dễ hơn, gợi ý sớm hơn, chia nhóm 5 chữ.
        </Card>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-card p-1 ring-1 ring-line sm:grid-cols-4">
        {(
          [
            ["basics", "① Nét & quy tắc"],
            ["lessons", "② Chữ theo bài"],
            ["review", "③ Ôn chữ đã học"],
            ["tips", "💡 Mẹo nhớ"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("rounded-lg px-2 py-2 text-sm font-semibold", tab === k ? "bg-zh text-white" : "text-muted")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "tips" && (
        <>
          <Card>
            <h2 className="mb-1 text-lg font-extrabold">💡 Mẹo nhớ &amp; viết chữ Hán</h2>
            <p className="mb-3 text-sm text-muted">Tổng hợp từ kinh nghiệm của giáo viên tiếng Trung và nghiên cứu về trí nhớ — áp dụng sẵn trong app.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {WRITING_TIPS.map((t) => (
                <div key={t.title} className="rounded-xl border border-line bg-bg p-3">
                  <div className="font-bold">
                    {t.icon} {t.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t.body}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-1 text-lg font-extrabold">🧩 {radicals.length} bộ thủ gặp nhiều nhất trong giáo trình</h2>
            <p className="mb-3 text-sm text-muted">Thuộc các bộ này là đoán được nghĩa của phần lớn chữ bạn sẽ học. Chạm vào bộ để nghe và xem các chữ chứa nó.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {radicals.map((r) => (
                <details key={r.r} className="rounded-xl border border-line bg-bg p-2">
                  <summary className="flex cursor-pointer list-none items-center gap-2">
                    <span className="kai text-3xl leading-none text-zh">{r.r}</span>
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="block font-semibold">{r.name}</span>
                      <span className="text-muted">{r.chars.length} chữ</span>
                    </span>
                  </summary>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <span className="kai text-xl">{r.chars.slice(0, 12).join(" ")}</span>
                    <SpeakButton text={r.chars.slice(0, 6).join("，")} lang="zh" size="sm" />
                  </div>
                </details>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === "basics" && (
        <>
          <Card>
            <h2 className="mb-1 text-lg font-extrabold">8 nét cơ bản (基本笔画)</h2>
            <p className="mb-3 text-sm text-muted">Mọi chữ Hán đều ghép từ các nét này. Nét đang minh hoạ được vẽ lại liên tục — bấm vào thẻ để tự tập.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {strokes.map((s) => (
                <button
                  key={s.name}
                  onClick={() =>
                    setOpen({
                      title: `Tập nét ${s.vi} (${s.name}) qua chữ ${s.char}`,
                      entries: [{ c: s.char, py: "", word: s.char, wordVi: s.how, strokes: 0, isNew: true, unitId: "basics" }],
                      start: 1,
                    })
                  }
                  className="flex flex-col items-center gap-1 rounded-xl border border-line bg-bg p-2 text-center hover:border-zh/50"
                >
                  <div className="w-full max-w-[130px]">
                    <HanziPad char={s.char} mode="demo" highlight={s.stroke} maxSize={130} showControls={false} />
                  </div>
                  <div className="font-bold">
                    <span className="han">{s.name}</span> <span className="py text-xs text-muted">{s.py}</span>
                  </div>
                  <div className="text-sm font-semibold text-zh">{s.vi}</div>
                  <div className="text-xs text-muted">{s.how}</div>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-1 text-lg font-extrabold">7 quy tắc bút thuận (笔顺规则)</h2>
            <p className="mb-3 text-sm text-muted">Viết đúng thứ tự giúp chữ cân đối, viết nhanh và tra từ điển viết tay chính xác.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {rules.map((r, i) => (
                <div key={r.rule} className="flex items-center gap-3 rounded-xl border border-line bg-bg p-3">
                  <div className="flex shrink-0 gap-1">
                    {r.chars.map((c) => (
                      <div key={c} className="w-[84px]">
                        <HanziPad char={c} mode="demo" maxSize={84} showControls={false} />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-muted">Quy tắc {i + 1}</div>
                    <div className="han font-bold">{r.rule}</div>
                    <div className="py text-xs text-muted">{r.py}</div>
                    <div className="text-sm font-semibold text-zh">{r.vi}</div>
                    <button
                      onClick={() =>
                        setOpen({
                          title: `Quy tắc: ${r.vi}`,
                          entries: r.chars.map((c) => ({ c, py: "", word: c, wordVi: r.vi, strokes: 0, isNew: true, unitId: "rules" })),
                        })
                      }
                      className="mt-1 text-xs font-semibold text-brand"
                    >
                      Tập viết →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === "lessons" && (
        <>
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex min-w-max gap-2">
              {levels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevelId(l.id)}
                  className={cx("rounded-full px-3.5 py-2 text-sm font-semibold", levelId === l.id ? "bg-zh text-white" : "bg-card text-muted ring-1 ring-line")}
                >
                  {l.code}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {level.units.map((u, i) => {
              const done = u.chars.filter((e) => (progress.hanzi[e.c]?.clean ?? 0) > 0).length;
              return (
                <Card key={u.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zh">
                        {level.code} · Bài {i + 1}
                      </div>
                      <div className="truncate font-bold">{u.title}</div>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {done}/{u.chars.length} chữ
                    </span>
                  </div>
                  {u.chars.length === 0 ? (
                    <div className="text-sm text-muted">Bài này không có chữ mới (các chữ đã học ở bài trước).</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {u.chars.map((e) => {
                        const p = progress.hanzi[e.c];
                        return (
                          <button
                            key={e.c}
                            onClick={() => setOpen({ title: `${level.code} · ${u.title}`, entries: u.chars, start: 0 })}
                            className={cx(
                              "kai grid h-10 w-10 place-items-center rounded-lg border text-xl",
                              p?.clean ? "border-ok/50 bg-ok/10" : p ? "border-warn/50 bg-warn/10" : "border-line bg-bg",
                            )}
                          >
                            {e.c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {u.chars.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setOpen({ title: `${level.code} · ${u.title}`, entries: u.chars })} className="py-2">
                        Tập viết {u.chars.length} chữ
                      </Button>
                      <Link href={`/print/hanzi?u=${u.id}`} target="_blank">
                        <Button variant="ghost" className="py-2">
                          🖨 In vở tập viết
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <Link href={`/print/hanzi?l=${level.id}`} target="_blank" className="self-center text-sm font-semibold text-brand">
            🖨 In vở tập viết cả cấp {level.code}
          </Link>
        </>
      )}

      {tab === "review" &&
        (written.length === 0 ? (
          <Card>
            <Empty icon="✍️" title="Chưa luyện chữ nào">
              Vào “Chữ theo bài” để bắt đầu. Những chữ đã viết sẽ xuất hiện ở đây để ôn lại.
            </Empty>
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="text-5xl">🖌️</div>
            <div className="font-bold">Ôn {Math.min(10, written.length)} chữ — ưu tiên chữ hay sai</div>
            <div className="max-w-sm text-sm text-muted">
              {beginner ? "Tô lại 1 lần cho nhớ tay rồi tự viết không có mẫu (默写)." : "Bỏ qua phần tô, viết thẳng không có mẫu (默写) như khi đi thi HSK."}
            </div>
            <Button
              onClick={() => {
                const pick = [...written]
                  .sort((a, b) => {
                    const pa = progress.hanzi[a.c];
                    const pb = progress.hanzi[b.c];
                    return pa.clean / pa.reps - pb.clean / pb.reps || pa.t - pb.t;
                  })
                  .slice(0, 10);
                setOpen({ title: "Ôn chữ đã học", entries: pick, start: beginner ? 2 : 3 });
              }}
            >
              Bắt đầu ôn
            </Button>
          </Card>
        ))}

      <Card className="text-sm">
        <div className="font-bold">💡 Mẹo cho iPad + Apple Pencil</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
          <li>Chạm bút vào ô viết lần đầu, app tự bật chế độ “Chỉ nhận Apple Pencil” — đặt tay lên màn hình thoải mái không bị nhận nhầm.</li>
          <li>Xoay ngang iPad để có ô viết lớn hơn.</li>
          <li>Muốn viết tự do như vở thật: bấm “In vở tập viết” → Chia sẻ → Lưu PDF → mở bằng GoodNotes / Notability / Ghi chú để viết bằng bút.</li>
        </ul>
      </Card>
    </div>
  );
}
