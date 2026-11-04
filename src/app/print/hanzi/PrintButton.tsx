"use client";
export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white">
      🖨 In / Lưu PDF
    </button>
  );
}
