// Kiểu dữ liệu tiến độ học + hàm gộp (dùng chung client/server)
import type { Lang } from "@/content/types";

export interface UnitProgress {
  /** thời điểm hoàn thành (ms) */
  done?: number;
  /** điểm cao nhất bài luyện tập (0-100) */
  best: number;
  tries: number;
  /** updatedAt */
  t: number;
}

export interface Card {
  due: number; // ms
  ivl: number; // ngày
  ease: number;
  reps: number;
  lapses: number;
  added: number;
  t: number;
}

export interface DayLog {
  xp: number;
  reviews: number;
  lessons: number;
  /** số thẻ mới đã học lần đầu trong ngày (để giới hạn từ mới/ngày) */
  fresh?: number;
}

export interface Profile {
  name?: string;
  lang?: Lang;
  /** mục tiêu XP mỗi ngày */
  goal: number;
  /** chế độ người mới theo ngôn ngữ (chậm hơn, chia nhỏ, nhiều gợi ý) */
  beginner?: Partial<Record<Lang, boolean>>;
  /** số từ mới tối đa mỗi ngày trong ôn tập */
  newPerDay?: number;
  t: number;
}

export interface Writing {
  text: string;
  t: number;
}

/** Tiến độ tập viết một chữ Hán */
export interface HanziProgress {
  reps: number; // số lần tự viết xong
  clean: number; // số lần tự viết không sai nét nào
  t: number;
}

export interface Progress {
  v: 1;
  profile: Profile;
  units: Record<string, UnitProgress>;
  cards: Record<string, Card>;
  days: Record<string, DayLog>;
  writings: Record<string, Writing>;
  hanzi: Record<string, HanziProgress>;
  t: number;
}

export const XP = {
  lessonComplete: 50,
  perfectBonus: 20,
  review: 2,
  writing: 15,
  speaking: 3,
  hanzi: 3,
  hanziClean: 2,
} as const;

export function emptyProgress(): Progress {
  return { v: 1, profile: { goal: 60, t: 0 }, units: {}, cards: {}, days: {}, writings: {}, hanzi: {}, t: 0 };
}

export function normalize(p: unknown): Progress {
  const e = emptyProgress();
  if (!p || typeof p !== "object") return e;
  const o = p as Partial<Progress>;
  return {
    v: 1,
    profile: { ...e.profile, ...(o.profile ?? {}) },
    units: o.units ?? {},
    cards: o.cards ?? {},
    days: o.days ?? {},
    writings: o.writings ?? {},
    hanzi: o.hanzi ?? {},
    t: o.t ?? 0,
  };
}

function mergeByT<T extends { t: number }>(a: Record<string, T>, b: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    if (!cur || (v?.t ?? 0) > (cur.t ?? 0)) out[k] = v;
  }
  return out;
}

/** Gộp 2 bản tiến độ (2 thiết bị) – lấy bản mới hơn theo từng mục */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const units = mergeByT(a.units, b.units);
  // Giữ thông tin "đã hoàn thành" và điểm cao nhất dù bản kia mới hơn
  for (const k of Object.keys(units)) {
    const x = a.units[k];
    const y = b.units[k];
    if (x && y) {
      units[k] = {
        ...units[k],
        done: x.done && y.done ? Math.min(x.done, y.done) : x.done ?? y.done,
        best: Math.max(x.best, y.best),
        tries: Math.max(x.tries, y.tries),
      };
    }
  }
  const days: Record<string, DayLog> = { ...a.days };
  for (const [k, v] of Object.entries(b.days)) {
    const c = days[k];
    days[k] = c
      ? { xp: Math.max(c.xp, v.xp), reviews: Math.max(c.reviews, v.reviews), lessons: Math.max(c.lessons, v.lessons), fresh: Math.max(c.fresh ?? 0, v.fresh ?? 0) }
      : v;
  }
  return {
    v: 1,
    profile: (b.profile.t ?? 0) > (a.profile.t ?? 0) ? b.profile : a.profile,
    units,
    cards: mergeByT(a.cards, b.cards),
    days,
    writings: mergeByT(a.writings, b.writings),
    hanzi: mergeByT(a.hanzi, b.hanzi),
    t: Math.max(a.t, b.t),
  };
}

// ---- Ngày theo giờ Việt Nam để client & server luôn khớp ----
const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dayKey(d: Date | number = Date.now()): string {
  return fmt.format(typeof d === "number" ? new Date(d) : d);
}

export function lastDays(n: number, now = Date.now()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(now - i * 86400000));
  return out;
}

export function streakOf(days: Record<string, DayLog>, now = Date.now()): number {
  let s = 0;
  let i = 0;
  // Nếu hôm nay chưa học thì vẫn giữ chuỗi tính tới hôm qua
  if (!(days[dayKey(now)]?.xp > 0)) i = 1;
  for (; ; i++) {
    const k = dayKey(now - i * 86400000);
    if (days[k]?.xp > 0) s++;
    else break;
    if (i > 3650) break;
  }
  return s;
}

export function totalXp(p: Progress): number {
  return Object.values(p.days).reduce((a, d) => a + (d.xp || 0), 0);
}

export function addXp(p: Progress, xp: number, extra?: Partial<DayLog>, now = Date.now()): Progress {
  const k = dayKey(now);
  const d = p.days[k] ?? { xp: 0, reviews: 0, lessons: 0 };
  return {
    ...p,
    days: {
      ...p.days,
      [k]: {
        xp: d.xp + xp,
        reviews: d.reviews + (extra?.reviews ?? 0),
        lessons: d.lessons + (extra?.lessons ?? 0),
        fresh: (d.fresh ?? 0) + (extra?.fresh ?? 0),
      },
    },
    t: now,
  };
}

/** Chế độ người mới: mặc định BẬT cho tiếng Trung khi chưa xong Nhập môn + HSK 1 */
export function isBeginner(p: Progress, lang: Lang): boolean {
  const v = p.profile.beginner?.[lang];
  if (v !== undefined) return v;
  if (lang === "en") return false;
  const doneZh = Object.entries(p.units).filter(([id, u]) => id.startsWith("zh-hsk0") || id.startsWith("zh-hsk1") ? !!u.done : false).length;
  return doneZh < 14;
}

export function newPerDay(p: Progress, lang: Lang): number {
  return p.profile.newPerDay ?? (isBeginner(p, lang) ? 8 : 20);
}

export function isNewCard(c: Card): boolean {
  return c.reps === 0 && c.lapses === 0;
}

/** Hàng đợi ôn tập: mọi thẻ cũ đến hạn + tối đa N thẻ mới mỗi ngày */
export function reviewQueue(p: Progress, lang: Lang, now = Date.now()): string[] {
  const due = dueCards(p, lang, now);
  const old = due.filter((id) => !isNewCard(p.cards[id]));
  const left = Math.max(0, newPerDay(p, lang) - (p.days[dayKey(now)]?.fresh ?? 0));
  const fresh = due
    .filter((id) => isNewCard(p.cards[id]))
    .sort((a, b) => p.cards[a].added - p.cards[b].added)
    .slice(0, left);
  return [...old, ...fresh];
}

/** Mỗi từ là 1 thẻ duy nhất theo ngôn ngữ (từ lặp lại ở nhiều bài vẫn chỉ 1 thẻ) */
export function cardId(lang: Lang, term: string): string {
  return `${lang}:${term}`;
}

export function langOfId(id: string): Lang {
  return id.startsWith("zh") ? "zh" : "en";
}

export function dueCards(p: Progress, lang: Lang, now = Date.now()): string[] {
  return Object.entries(p.cards)
    .filter(([id, c]) => langOfId(id) === lang && c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}
