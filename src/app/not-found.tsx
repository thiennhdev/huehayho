import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <div className="text-6xl">🧭</div>
        <h1 className="mt-2 text-xl font-bold">Không tìm thấy trang</h1>
        <Link href="/" className="mt-3 inline-block font-semibold text-brand">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
