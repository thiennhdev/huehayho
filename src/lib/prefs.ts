"use client";
// Tuỳ chọn cá nhân lưu trên thiết bị (tốc độ đọc, giọng, hiện pinyin…)
import { useEffect, useState } from "react";

export interface Prefs {
  rate: number; // tốc độ đọc 0.6–1.2
  accent: "en-US" | "en-GB";
  showPinyin: boolean;
  showTranslation: boolean;
  autoPlay: boolean; // tự đọc khi lật thẻ
}

const DEFAULT: Prefs = { rate: 0.9, accent: "en-US", showPinyin: true, showTranslation: true, autoPlay: true };
const KEY = "hcn:prefs";

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
}

export function usePrefs(): [Prefs, (p: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  useEffect(() => setPrefs(readPrefs()), []);
  const update = (p: Partial<Prefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...p };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  return [prefs, update];
}
