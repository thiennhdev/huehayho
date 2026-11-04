import type { Course, Lang, Level, Unit, VocabItem } from "./types";
import { english } from "./en";
import { chinese } from "./zh";

export const courses: Record<Lang, Course> = { en: english, zh: chinese };

export function isLang(v: string): v is Lang {
  return v === "en" || v === "zh";
}

export function getCourse(lang: Lang): Course {
  return courses[lang];
}

export function getLevel(lang: Lang, levelId: string): Level | undefined {
  return courses[lang].levels.find((l) => l.id === levelId);
}

export function getUnit(lang: Lang, levelId: string, unitId: string): Unit | undefined {
  return getLevel(lang, levelId)?.units.find((u) => u.id === unitId);
}

export interface UnitRef {
  lang: Lang;
  levelId: string;
  levelCode: string;
  unit: Unit;
  index: number; // thứ tự toàn khoá
}

/** Danh sách bài theo đúng thứ tự học */
export function allUnits(lang: Lang): UnitRef[] {
  const out: UnitRef[] = [];
  for (const level of courses[lang].levels)
    for (const unit of level.units)
      out.push({ lang, levelId: level.id, levelCode: level.code, unit, index: out.length });
  return out;
}

export function unitHref(lang: Lang, levelId: string, unitId: string) {
  return `/learn/${lang}/${levelId}/${unitId}`;
}

/** Từ điển: cardId (lang:term) -> từ vựng (lần xuất hiện đầu tiên) */
export function vocabIndex(lang: Lang): Record<string, VocabItem & { unitId: string }> {
  const out: Record<string, VocabItem & { unitId: string }> = {};
  for (const ref of allUnits(lang))
    for (const v of ref.unit.vocab) {
      const id = `${lang}:${v.term}`;
      if (!out[id]) out[id] = { ...v, unitId: ref.unit.id };
    }
  return out;
}

/** Bản rút gọn để hiển thị lộ trình (không gửi toàn bộ nội dung xuống trình duyệt) */
export interface LevelSummary {
  id: string;
  code: string;
  title: string;
  exam: string;
  hours: string;
  description: string;
  canDo: string[];
  books: string[];
  units: { id: string; title: string; topic: string; words: number }[];
}

export function levelSummaries(lang: Lang): LevelSummary[] {
  return courses[lang].levels.map((l) => ({
    id: l.id,
    code: l.code,
    title: l.title,
    exam: l.exam,
    hours: l.hours,
    description: l.description,
    canDo: l.canDo,
    books: l.books,
    units: l.units.map((u) => ({ id: u.id, title: u.title, topic: u.topic, words: u.vocab.length })),
  }));
}

export function getOutline(): import("./types").Outline {
  const map = (lang: Lang) =>
    courses[lang].levels.map((l) => ({
      id: l.id,
      code: l.code,
      title: l.title,
      exam: l.exam,
      units: l.units.map((u) => ({ id: u.id, title: u.title, topic: u.topic })),
    }));
  return { en: map("en"), zh: map("zh") };
}
