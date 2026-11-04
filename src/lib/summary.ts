// Tóm tắt tiến độ của 1 người (dùng cho trang chủ & bảng "Hai đứa mình")
import type { Lang, Outline, OutlineLevel, OutlineUnit } from "@/content/types";
import { dayKey, lastDays, reviewQueue, streakOf, totalXp, type Progress } from "./progress";
import { isMature } from "./srs";

export interface NextUnit {
  lang: Lang;
  level: OutlineLevel;
  unit: OutlineUnit;
  index: number;
  total: number;
}

export function nextUnit(outline: Outline, p: Progress, lang: Lang): NextUnit | null {
  let i = 0;
  const total = outline[lang].reduce((a, l) => a + l.units.length, 0);
  for (const level of outline[lang])
    for (const unit of level.units) {
      if (!p.units[unit.id]?.done) return { lang, level, unit, index: i, total };
      i++;
    }
  return null;
}

export function unitsDone(outline: Outline, p: Progress, lang: Lang): number {
  return outline[lang].reduce((a, l) => a + l.units.filter((u) => p.units[u.id]?.done).length, 0);
}

export function totalUnits(outline: Outline, lang: Lang): number {
  return outline[lang].reduce((a, l) => a + l.units.length, 0);
}

export interface LearnerSummary {
  id: string;
  name: string;
  lang: Lang;
  streak: number;
  todayXp: number;
  goal: number;
  totalXp: number;
  done: Record<Lang, number>;
  total: Record<Lang, number>;
  levelCode: string;
  levelTitle: string;
  nextTitle: string | null;
  cards: number;
  mature: number;
  due: number;
  week: { day: string; xp: number }[];
  lastActive: number;
}

export function summarize(
  outline: Outline,
  user: { id: string; name: string; lang: Lang },
  p: Progress,
  now = Date.now(),
): LearnerSummary {
  const lang = p.profile.lang ?? user.lang;
  const next = nextUnit(outline, p, lang);
  const lastLevel = outline[lang][outline[lang].length - 1];
  const cards = Object.entries(p.cards).filter(([id]) => id.startsWith(lang + ":"));
  return {
    id: user.id,
    name: p.profile.name || user.name,
    lang,
    streak: streakOf(p.days, now),
    todayXp: p.days[dayKey(now)]?.xp ?? 0,
    goal: p.profile.goal || 60,
    totalXp: totalXp(p),
    done: { en: unitsDone(outline, p, "en"), zh: unitsDone(outline, p, "zh") },
    total: { en: totalUnits(outline, "en"), zh: totalUnits(outline, "zh") },
    levelCode: next ? next.level.code : lastLevel.code,
    levelTitle: next ? next.level.title : "Hoàn thành khoá học 🎓",
    nextTitle: next ? next.unit.title : null,
    cards: cards.length,
    mature: cards.filter(([, c]) => isMature(c)).length,
    due: reviewQueue(p, lang, now).length,
    week: lastDays(7, now).map((d) => ({ day: d, xp: p.days[d]?.xp ?? 0 })),
    lastActive: p.t,
  };
}
