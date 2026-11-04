import type { Metadata } from "next";
import { courseHanzi } from "@/lib/hanzi";
import type { HanziEntry } from "@/content/hanzi-types";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Vở tập viết chữ Hán" };

const TRACE = 4; // số ô tô mờ
const EMPTY = 6; // số ô trống

const gridSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='1' y='1' width='98' height='98' fill='none' stroke='#e88' stroke-width='2'/><line x1='0' y1='50' x2='100' y2='50' stroke='#f2b3b3' stroke-width='1' stroke-dasharray='4 4'/><line x1='50' y1='0' x2='50' y2='100' stroke='#f2b3b3' stroke-width='1' stroke-dasharray='4 4'/><line x1='0' y1='0' x2='100' y2='100' stroke='#f6caca' stroke-width='0.8' stroke-dasharray='3 5'/><line x1='100' y1='0' x2='0' y2='100' stroke='#f6caca' stroke-width='0.8' stroke-dasharray='3 5'/></svg>`,
);

export default async function PrintHanzi({ searchParams }: { searchParams: Promise<{ u?: string; l?: string }> }) {
  const { u, l } = await searchParams;
  const levels = courseHanzi();
  let title = "Vở tập viết chữ Hán";
  let chars: HanziEntry[] = [];
  for (const lv of levels) {
    if (l && lv.id === l) {
      title = `${lv.code} — ${lv.title}`;
      chars = lv.units.flatMap((x) => x.chars);
    }
    for (const un of lv.units)
      if (u && un.id === u) {
        title = `${lv.code} · ${un.title}`;
        chars = un.chars;
      }
  }
  const cell: React.CSSProperties = { width: "15.5mm", height: "15.5mm", backgroundImage: `url("data:image/svg+xml,${gridSvg}")`, backgroundSize: "100% 100%" };

  return (
    <div className="mx-auto max-w-[200mm] bg-white p-6 text-black print:p-0">
      <style>{`@page { size: A4; margin: 10mm; } @media print { body { background: #fff !important; } .no-print { display: none !important; } } body { background: #fff; }`}</style>
      <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
        <PrintButton />
        <span>Trên iPad / iPhone: bấm In → chụm 2 ngón để xem trước → Chia sẻ → Lưu vào Tệp, rồi mở bằng GoodNotes / Notability để viết bằng Apple Pencil.</span>
      </div>
      <div className="mb-3 flex items-end justify-between border-b-2 border-black pb-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-neutral-500">Học Cùng Nhau · 汉字练习</div>
          <div className="text-xl font-bold">{title}</div>
        </div>
        <div className="text-sm text-neutral-600">Họ tên: ................ Ngày: ..........</div>
      </div>
      {chars.length === 0 && <p>Không có chữ nào.</p>}
      <div className="flex flex-col gap-[3mm]">
        {chars.map((e) => (
          <div key={e.c} className="flex items-center gap-[2mm]" style={{ breakInside: "avoid" }}>
            <div className="w-[16mm] shrink-0 text-center leading-tight">
              <div className="text-[9pt] font-semibold">{e.py}</div>
              <div className="text-[7.5pt] text-neutral-600">{e.hv}</div>
              <div className="text-[7pt] text-neutral-500">{e.strokes ? `${e.strokes} nét` : ""}</div>
            </div>
            <div className="flex">
              <div className="kai grid place-items-center text-[40pt] leading-none" style={cell}>
                {e.c}
              </div>
              {Array.from({ length: TRACE }).map((_, i) => (
                <div key={`t${i}`} className="kai grid place-items-center text-[40pt] leading-none" style={{ ...cell, color: i < 2 ? "#c9c9c9" : "#e4e4e4" }}>
                  {e.c}
                </div>
              ))}
              {Array.from({ length: EMPTY }).map((_, i) => (
                <div key={`e${i}`} style={cell} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[8pt] text-neutral-500">Ô đầu: chữ mẫu · 4 ô tiếp: tô theo (描红) · 6 ô trống: tự viết (默写). Thứ tự nét xem trong app (mục Tập viết).</p>
    </div>
  );
}
