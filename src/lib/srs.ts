// Lặp lại ngắt quãng (Spaced Repetition) – biến thể SM-2 (thuật toán của Anki/SuperMemo)
import type { Card } from "./progress";

export type Rating = 0 | 1 | 2 | 3; // Quên | Khó | Được | Dễ

const DAY = 86400000;
const MIN = 60000;

export function newCard(now = Date.now()): Card {
  return { due: now, ivl: 0, ease: 2.5, reps: 0, lapses: 0, added: now, t: now };
}

export function schedule(c: Card, r: Rating, now = Date.now()): Card {
  let { ivl, ease, reps, lapses } = c;
  let due: number;
  if (r === 0) {
    lapses += 1;
    reps = 0;
    ivl = 0;
    ease = Math.max(1.3, ease - 0.2);
    due = now + 10 * MIN; // gặp lại sau 10 phút
  } else {
    if (r === 1) {
      ivl = reps === 0 ? 1 : Math.max(1, Math.round(ivl * 1.2));
      ease = Math.max(1.3, ease - 0.15);
    } else if (r === 2) {
      ivl = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(ivl * ease);
    } else {
      ivl = reps === 0 ? 4 : Math.round(Math.max(ivl, 1) * ease * 1.3);
      ease = ease + 0.15;
    }
    ivl = Math.min(ivl, 365);
    reps += 1;
    due = now + ivl * DAY;
  }
  return { ...c, ivl, ease, reps, lapses, due, t: now };
}

/** Nhãn khoảng thời gian dự kiến cho từng nút */
export function previewLabel(c: Card, r: Rating, now = Date.now()): string {
  const n = schedule(c, r, now);
  const ms = n.due - now;
  if (ms < 60 * MIN) return `${Math.round(ms / MIN)} phút`;
  const d = Math.round(ms / DAY);
  if (d < 30) return `${d} ngày`;
  if (d < 365) return `${Math.round(d / 30)} tháng`;
  return `${(d / 365).toFixed(1)} năm`;
}

/** Thẻ được coi là "đã thuộc" khi khoảng lặp >= 21 ngày */
export function isMature(c: Card): boolean {
  return c.ivl >= 21;
}
