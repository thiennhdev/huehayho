import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Học Cùng Nhau", template: "%s · Học Cùng Nhau" },
  description: "Hai đứa mình cùng học: Tiếng Anh (CEFR → IELTS 7.0+) & Tiếng Trung (HSK 0 → 6+).",
  appleWebApp: { capable: true, title: "Học Cùng Nhau", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0c18" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
