import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang } from "@/content";
import { exams } from "@/content/exams";
import { ExamPractice } from "@/components/ExamPractice";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "zh" ? "Luyện thi HSK" : "Luyện thi IELTS" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default async function ExamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const g = exams[lang];
  const accent = lang === "en" ? "text-en" : "text-zh";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">🎯 Luyện thi {g.name}</h1>
          <p className="text-sm text-muted">
            Mục tiêu: <b className={accent}>{g.target}</b>
          </p>
        </div>
        <Link href={`/exam/${lang === "en" ? "zh" : "en"}`} className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-brand/5">
          {lang === "en" ? "🇨🇳 HSK" : "🇬🇧 IELTS"}
        </Link>
      </div>

      <Section title="📋 Tổng quan bài thi">
        <p className="mb-3 text-sm">{g.intro}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {g.sections.map((s) => (
            <div key={s.name} className="rounded-xl bg-bg p-3">
              <div className={`font-bold ${accent}`}>{s.name}</div>
              <div className="text-sm text-muted">{s.detail}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">ℹ️ {g.scoreNote}</p>
        {g.table && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  {g.table.head.map((h) => (
                    <th key={h} className="py-2 pr-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.table.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-line/60">
                    {r.map((c, i) => (
                      <td key={i} className={`py-2 pr-3 ${i === 0 ? `font-bold ${accent}` : ""}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {g.table.note && <p className="mt-2 text-xs text-muted">{g.table.note}</p>}
          </div>
        )}
      </Section>

      <Section title="🗺️ Lộ trình từ con số 0">
        <ol className="flex flex-col gap-3">
          {g.roadmap.map((r, i) => (
            <li key={r.stage} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
              <div>
                <div className="font-bold">
                  {r.stage} <span className={`text-sm ${accent}`}>· {r.target}</span>
                </div>
                <div className="text-sm text-muted">{r.focus}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {g.criteria.map((c) => (
        <Section key={c.title} title={`📏 ${c.title}`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.items.map((it) => (
              <div key={it.name} className="rounded-xl bg-bg p-3">
                <div className="font-bold">{it.name}</div>
                <div className="text-sm text-muted">{it.band7}</div>
              </div>
            ))}
          </div>
          {lang === "en" && <p className="mt-2 text-xs text-muted">Diễn giải yêu cầu ở mức Band 7 dựa trên band descriptors công khai của IELTS (đã tóm lược bằng tiếng Việt).</p>}
        </Section>
      ))}

      <ExamPractice lang={lang} prompts={g.writingPrompts} speaking={g.speakingPrompts} checklist={g.checklist} />

      <Section title="💡 Mẹo luyện thi">
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {g.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="📚 Tài liệu chuẩn nên dùng">
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {g.resources.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
