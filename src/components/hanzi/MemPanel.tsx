"use client";
// Thẻ "Mẹo nhớ": loại chữ, cấu trúc, các bộ phận (chỉ nghĩa / gợi âm) và câu chuyện chiết tự
import type { HanziEntry } from "@/content/hanzi-types";
import { cx } from "../ui";

const meaning = (name?: string) => (name?.includes("–") ? name.split("–").slice(1).join("–").trim() : name);

export function memStory(e: HanziEntry): string | undefined {
  const m = e.mem;
  if (!m) return undefined;
  if (m.story) return m.story;
  const se = m.parts.find((p) => p.role === "nghĩa");
  const ph = m.parts.find((p) => p.role === "âm");
  if (se && ph)
    return `${se.c}${se.name ? ` (${meaning(se.name)})` : ""} cho biết nghĩa + ${ph.c}${ph.py ? ` (${ph.py})` : ""} gợi cách đọc → ${e.c} (${e.py}).`;
  if (m.parts.length >= 2)
    return `${m.parts.map((p) => `${p.c}${p.name ? ` (${meaning(p.name)})` : ""}`).join(" + ")} → ${e.c}. Thử tự nghĩ một câu chuyện nối các hình ảnh này lại — càng vui càng dễ nhớ!`;
  return undefined;
}

export function MemPanel({ e, compact }: { e: HanziEntry; compact?: boolean }) {
  const m = e.mem;
  if (!m) return null;
  const story = memStory(e);
  return (
    <div className={cx("flex flex-col gap-2 rounded-2xl border border-warn/30 bg-warn/5 p-3 text-sm", compact && "p-2.5")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-bold">🧠 Mẹo nhớ</span>
        {m.type && (
          <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold ring-1 ring-line" title={m.typeDesc}>
            {m.type}
          </span>
        )}
        {m.structure && <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold ring-1 ring-line">Cấu trúc {m.structure}</span>}
      </div>
      {m.parts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {m.parts.map((p, i) => (
            <span key={p.c + i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted">+</span>}
              <span className="flex items-center gap-1.5 rounded-xl bg-card px-2 py-1 ring-1 ring-line">
                <span className="kai text-2xl leading-none">{p.c}</span>
                <span className="flex flex-col leading-tight">
                  {p.name ? <span className="text-xs font-semibold">{p.name}</span> : p.py ? <span className="py text-xs">{p.py}</span> : null}
                  {p.role && (
                    <span className={cx("text-[10px] font-bold uppercase", p.role === "nghĩa" ? "text-ok" : "text-en")}>
                      {p.role === "nghĩa" ? "chỉ nghĩa" : `gợi âm${p.py ? ` · ${p.py}` : ""}`}
                    </span>
                  )}
                </span>
              </span>
            </span>
          ))}
          <span className="text-muted">=</span>
          <span className="kai text-3xl leading-none text-zh">{e.c}</span>
        </div>
      )}
      {story && <div className="leading-relaxed">📖 {story}</div>}
      {!compact && m.parts.length > 1 && (
        <div className="text-xs text-muted">
          ✍️ Viết theo cụm: {m.parts.map((p) => p.c).join(" → ")} {m.structure?.startsWith("bao") ? "(phần bao ngoài thường viết trước, nét đóng khung viết sau cùng)" : ""}
        </div>
      )}
    </div>
  );
}
