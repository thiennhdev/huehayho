import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, isLang, levelSummaries } from "@/content";
import { Roadmap } from "@/components/Roadmap";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: isLang(lang) ? `Lộ trình ${getCourse(lang).name}` : "Lộ trình" };
}

export default async function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = getCourse(lang);
  return <Roadmap lang={lang} name={c.name} flag={c.flag} framework={c.framework} target={c.target} levels={levelSummaries(lang)} />;
}
