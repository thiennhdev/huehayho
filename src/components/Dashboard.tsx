"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lang, Outline } from "@/content/types";
import { useProgress } from "./ProgressProvider";
import { Badge, Bar, Button, Card, Ring, cx } from "./ui";
import { nextUnit, summarize, type LearnerSummary } from "@/lib/summary";
import { unitHrefClient } from "@/lib/links";

interface Note {
  text: string;
  from: string;
  t: number;
}

const WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.round(h / 24)} ngày trước`;
}

export function Dashboard({ outline }: { outline: Outline }) {
  const { user, progress, lang, loaded, storage } = useProgress();
  const me = summarize(outline, user, progress);
  const next = nextUnit(outline, progress, lang);
  const [partner, setPartner] = useState<LearnerSummary | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [sent, setSent] = useState<Note | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/couple", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setPartner(d.partner);
        setNote(d.note);
        setSent(d.sent);
      })
      .catch(() => {});
  }, []);

  async function sendNote() {
    if (!draft.trim()) return;
    setSending(true);
    const r = await fetch("/api/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: draft }) });
    if (r.ok) {
      const d = await r.json();
      setSent(d.note);
      setDraft("");
    }
    setSending(false);
  }

  const pct = Math.min(100, Math.round((me.todayXp / me.goal) * 100));
  const otherLang: Lang = lang === "en" ? "zh" : "en";

  return (
    <div className="flex flex-col gap-4">
      {storage === "none" && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
          ⚠️ <b>Chưa kết nối database</b> — tiến độ hiện chỉ lưu trên thiết bị này và chưa chia sẻ được cho người kia. Vào Vercel → Storage → tạo database miễn phí (<b>Neon Postgres</b>, MongoDB Atlas hoặc Upstash Redis) → Connect vào project → Redeploy.
        </div>
      )}

      {/* Lời chào + mục tiêu ngày */}
      <Card className="bg-gradient-to-br from-brand/10 via-card to-love/10">
        <div className="flex items-center gap-4">
          <Ring value={pct} size={84} stroke={8}>
            <div>
              <div className="text-lg leading-none">{me.todayXp}</div>
              <div className="text-[10px] font-medium text-muted">/{me.goal} XP</div>
            </div>
          </Ring>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted">{greeting()},</div>
            <div className="truncate text-2xl font-extrabold">{me.name} 👋</div>
            <div className="mt-1 flex flex-wrap gap-2 text-sm">
              <Badge>🔥 {me.streak} ngày liên tiếp</Badge>
              <Badge className={lang === "en" ? "bg-en/10 text-en" : "bg-zh/10 text-zh"}>
                {lang === "en" ? "🇬🇧" : "🇨🇳"} {me.levelCode}
              </Badge>
              <Badge className="bg-ok/10 text-ok">⭐ {me.totalXp} XP</Badge>
            </div>
          </div>
        </div>
        {pct >= 100 && <div className="mt-3 text-sm font-semibold text-ok">🎉 Hoàn thành mục tiêu hôm nay rồi! Giỏi quá!</div>}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Học tiếp */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="font-bold">📖 Học tiếp</div>
            <span className="text-xs text-muted">
              {me.done[lang]}/{me.total[lang]} bài
            </span>
          </div>
          {next ? (
            <>
              <div className={cx("text-xs font-semibold", lang === "en" ? "text-en" : "text-zh")}>
                {next.level.code} · {next.level.title}
              </div>
              <div className="mt-0.5 text-lg font-bold">{next.unit.title}</div>
              <div className="text-sm text-muted">{next.unit.topic}</div>
              <Bar value={(me.done[lang] / me.total[lang]) * 100} className="mt-3" color={lang === "en" ? "bg-en" : "bg-zh"} />
              <Link href={unitHrefClient(lang, next.level.id, next.unit.id)}>
                <Button className="mt-4 w-full">{progress.units[next.unit.id] ? "Học tiếp bài này →" : "Bắt đầu bài học →"}</Button>
              </Link>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="text-4xl">🎓</div>
              <div className="font-bold">Bạn đã hoàn thành toàn bộ giáo trình!</div>
              <Link href={`/exam/${lang}`} className="text-sm font-semibold text-brand">
                Chuyển sang luyện đề →
              </Link>
            </div>
          )}
        </Card>

        {/* Ôn tập */}
        <Card>
          <div className="mb-2 font-bold">🃏 Ôn từ vựng (SRS)</div>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-4xl font-extrabold text-love">{loaded ? me.due : "–"}</div>
              <div className="text-xs text-muted">thẻ cần ôn hôm nay</div>
            </div>
            <div className="text-sm text-muted">
              <div>
                Tổng: <b className="text-ink">{me.cards}</b> từ
              </div>
              <div>
                Đã thuộc lâu: <b className="text-ink">{me.mature}</b>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Lặp lại ngắt quãng giúp nhớ từ vào trí nhớ dài hạn — ôn mỗi ngày trước khi học bài mới.</p>
          <Link href="/review">
            <Button variant={me.due ? "primary" : "soft"} className="mt-3 w-full">
              {me.due ? `Ôn ${me.due} thẻ ngay` : "Luyện thêm"}
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/practice">
          <Card className="h-full transition hover:border-brand/50">
            <div className="text-3xl">⚡</div>
            <div className="mt-1 font-bold">Luyện nhanh 5 phút</div>
            <div className="text-xs text-muted">Ghép cặp, xếp câu, nghe – chép kiểu Duolingo</div>
          </Card>
        </Link>
        <Link href="/speak">
          <Card className="h-full transition hover:border-brand/50">
            <div className="text-3xl">🎤</div>
            <div className="mt-1 font-bold">Luyện phát âm</div>
            <div className="text-xs text-muted">Chấm từng từ kiểu ELSA, thanh điệu tiếng Trung</div>
          </Card>
        </Link>
      </div>

      {/* Hai đứa mình */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-bold">💞 Hai đứa mình</div>
          <span className="text-xs text-muted">Cùng nhau giữ chuỗi nhé!</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PersonCard s={me} you />
          {partner ? <PersonCard s={partner} /> : <div className="grid place-items-center rounded-xl border border-dashed border-line p-6 text-sm text-muted">Đang tải…</div>}
        </div>

        {/* Biểu đồ 7 ngày */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-4 text-xs text-muted">
            <span>XP 7 ngày qua</span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2 w-2 rounded-full bg-brand" /> {me.name}
            </span>
            {partner && (
              <span className="flex items-center gap-1">
                <i className="inline-block h-2 w-2 rounded-full bg-love" /> {partner.name}
              </span>
            )}
          </div>
          <WeekChart a={me.week} b={partner?.week} />
        </div>

        {/* Lời nhắn */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-love/10 p-3">
            <div className="text-xs font-semibold text-love">💌 Lời nhắn từ {partner?.name ?? "người ấy"}</div>
            {note ? (
              <>
                <div className="mt-1 whitespace-pre-wrap">{note.text}</div>
                <div className="mt-1 text-[11px] text-muted">{timeAgo(note.t)}</div>
              </>
            ) : (
              <div className="mt-1 text-sm text-muted">Chưa có lời nhắn nào.</div>
            )}
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-xs font-semibold text-muted">Gửi lời động viên</div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={280}
              rows={2}
              placeholder={lang === "en" ? "Keep going! I'm proud of you 💜" : "加油！我为你骄傲 💜"}
              className="mt-1 w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <div className="flex items-center justify-between">
              <span className="truncate text-[11px] text-muted">{sent ? `Đã gửi: “${sent.text.slice(0, 30)}${sent.text.length > 30 ? "…" : ""}”` : ""}</span>
              <Button onClick={sendNote} disabled={sending || !draft.trim()} className="px-3 py-1.5 text-xs">
                Gửi 💌
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lộ trình nhanh */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickCourse outline={outline} lang={lang} main />
        <QuickCourse outline={outline} lang={otherLang} />
      </div>
    </div>
  );

  function QuickCourse({ outline, lang: l, main }: { outline: Outline; lang: Lang; main?: boolean }) {
    return (
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-bold">
            {l === "en" ? "🇬🇧 Tiếng Anh · CEFR → IELTS 7.0+" : "🇨🇳 Tiếng Trung · HSK 0 → 6+"}
          </div>
          {!main && <span className="text-xs text-muted">học thêm cho vui</span>}
        </div>
        <div className="flex flex-col gap-2">
          {outline[l].map((lv) => {
            const done = lv.units.filter((u) => progress.units[u.id]?.done).length;
            return (
              <Link key={lv.id} href={`/learn/${l}#${lv.id}`} className="group flex items-center gap-3">
                <span className={cx("w-16 shrink-0 text-xs font-bold", l === "en" ? "text-en" : "text-zh")}>{lv.code}</span>
                <Bar value={(done / lv.units.length) * 100} color={l === "en" ? "bg-en" : "bg-zh"} />
                <span className="w-10 shrink-0 text-right text-xs text-muted">
                  {done}/{lv.units.length}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
    );
  }
}

function PersonCard({ s, you }: { s: LearnerSummary; you?: boolean }) {
  const pct = Math.min(100, Math.round((s.todayXp / s.goal) * 100));
  return (
    <div className={cx("flex items-center gap-3 rounded-xl border p-3", you ? "border-brand/30 bg-brand/5" : "border-love/30 bg-love/5")}>
      <Ring value={pct} size={56} stroke={6} color={you ? "var(--color-brand)" : "var(--color-love)"}>
        <span className="text-lg">{s.lang === "en" ? "🇬🇧" : "🇨🇳"}</span>
      </Ring>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">
          {s.name} {you && <span className="text-xs font-normal text-muted">(bạn)</span>}
        </div>
        <div className="text-xs text-muted">
          {s.levelCode} · {s.done[s.lang]}/{s.total[s.lang]} bài · {s.cards} từ
        </div>
        <div className="mt-1 text-xs">
          🔥 <b>{s.streak}</b> ngày · Hôm nay <b>{s.todayXp}</b>/{s.goal} XP
        </div>
      </div>
    </div>
  );
}

function WeekChart({ a, b }: { a: { day: string; xp: number }[]; b?: { day: string; xp: number }[] }) {
  const max = Math.max(20, ...a.map((d) => d.xp), ...(b ?? []).map((d) => d.xp));
  return (
    <div className="flex h-28 items-end gap-2">
      {a.map((d, i) => {
        const wd = WD[new Date(d.day + "T12:00:00+07:00").getDay()];
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end justify-center gap-0.5">
              <div className="w-1/2 max-w-3 rounded-t bg-brand" style={{ height: `${(d.xp / max) * 100}%`, minHeight: d.xp ? 3 : 0 }} title={`${d.xp} XP`} />
              {b && <div className="w-1/2 max-w-3 rounded-t bg-love" style={{ height: `${(b[i].xp / max) * 100}%`, minHeight: b[i].xp ? 3 : 0 }} title={`${b[i].xp} XP`} />}
            </div>
            <span className="text-[10px] text-muted">{wd}</span>
          </div>
        );
      })}
    </div>
  );
}
