import type { Lang } from "@/content/types";
import { CEFR_LEVEL, HSK_LEVEL } from "@/content/official";

/** Nhãn cấp độ chính thức của từ (CEFR-J cho tiếng Anh, danh sách HSK cho tiếng Trung) */
export function OfficialBadge({ lang, term }: { lang: Lang; term: string }) {
  if (lang === "en") {
    const lv = CEFR_LEVEL[term];
    return (
      <span
        title={lv ? `Cấp CEFR theo CEFR-J Wordlist (ĐH Ngoại ngữ Tokyo)${lv.endsWith("*") ? " — cụm từ, tính theo từ khó nhất" : ""}` : "Từ học thuật/chủ đề IELTS, ngoài danh sách CEFR-J phổ thông"}
        className="rounded bg-en/10 px-1.5 text-[11px] font-semibold text-en"
      >
        {lv ? `CEFR ${lv.replace("*", "")}` : "Học thuật"}
      </span>
    );
  }
  const lv = HSK_LEVEL[term];
  if (!lv) return <span title="Không có trong danh sách HSK chính thức (thành ngữ / từ mở rộng)" className="rounded bg-line px-1.5 text-[11px] font-semibold text-muted">Mở rộng</span>;
  const [n, o] = lv;
  return (
    <span title="Cấp theo danh sách từ vựng HSK chính thức: HSK 3.0 (2021) và HSK 2.0" className="rounded bg-zh/10 px-1.5 text-[11px] font-semibold text-zh">
      {n ? `HSK3.0·${n === 7 ? "7–9" : n}` : "HSK3.0·–"}
      {o ? ` | HSK2.0·${o}` : ""}
    </span>
  );
}
