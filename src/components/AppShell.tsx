"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "./ProgressProvider";
import { cx } from "./ui";
import { dueCards, streakOf } from "@/lib/progress";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { lang, progress, name, sync, storage, loaded } = useProgress();
  const due = loaded ? dueCards(progress, lang).length : 0;
  const streak = streakOf(progress.days);
  const nav = [
    { href: "/", label: "Trang chủ", icon: "🏠", match: (p: string) => p === "/" },
    { href: `/learn/${lang}`, label: "Học", icon: "📚", match: (p: string) => p.startsWith("/learn") },
    { href: "/review", label: "Ôn tập", icon: "🃏", match: (p: string) => p.startsWith("/review"), badge: due },
    { href: "/practice", label: "Luyện", icon: "⚡", match: (p: string) => p.startsWith("/practice") },
    { href: "/speak", label: "Phát âm", icon: "🎤", match: (p: string) => p.startsWith("/speak") },
    { href: `/exam/${lang}`, label: lang === "en" ? "IELTS" : "HSK", icon: "🎯", match: (p: string) => p.startsWith("/exam") },
  ];
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <img src="/icon.svg" alt="" className="h-8 w-8" />
            <span className="hidden sm:inline">Học Cùng Nhau</span>
          </Link>
          <nav className="ml-4 hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "relative rounded-xl px-3 py-2 text-sm font-semibold transition",
                  n.match(path) ? "bg-brand/10 text-brand" : "text-muted hover:text-ink",
                )}
              >
                {n.label}
                {!!n.badge && <span className="ml-1.5 rounded-full bg-love px-1.5 text-[10px] text-white">{n.badge}</span>}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span title="Chuỗi ngày học liên tiếp" className="font-bold">🔥 {streak}</span>
            <span
              title={
                storage === "none"
                  ? "Chưa kết nối database — dữ liệu chỉ lưu trên máy này"
                  : sync === "error"
                    ? "Lỗi đồng bộ, sẽ thử lại"
                    : "Đã đồng bộ"
              }
              className={cx(
                "h-2.5 w-2.5 rounded-full",
                storage === "none" || sync === "offline" ? "bg-warn" : sync === "error" ? "bg-zh" : sync === "saving" ? "animate-pulse bg-brand" : "bg-ok",
              )}
            />
            <Link href="/settings" title="Cài đặt" className={cx("flex items-center gap-1 rounded-xl px-2 py-1 font-semibold hover:bg-brand/5", path.startsWith("/settings") && "bg-brand/10 text-brand")}>
              <span className="max-w-24 truncate">{name}</span> ⚙️
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-28 pt-4 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cx("relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold", n.match(path) ? "text-brand" : "text-muted")}>
              <span className="text-xl leading-none">{n.icon}</span>
              {n.label}
              {!!n.badge && <span className="absolute right-[18%] top-1 rounded-full bg-love px-1.5 text-[10px] text-white">{n.badge}</span>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
