import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getUsers, isConfigured } from "@/lib/users";
import { kvGet } from "@/lib/storage";
import type { Progress } from "@/lib/progress";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect("/");
  const { next } = await searchParams;
  const users = await Promise.all(
    getUsers().map(async (u) => {
      const p = await kvGet<Progress>(`progress:${u.id}`).catch(() => null);
      return { ...u, name: p?.profile?.name || u.name };
    }),
  );
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-brand/15 via-bg to-love/15 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/icon.svg" alt="" className="mx-auto mb-3 h-16 w-16 drop-shadow" />
          <h1 className="text-2xl font-extrabold">Học Cùng Nhau</h1>
          <p className="mt-1 text-sm text-muted">Tiếng Anh 🇬🇧 & Tiếng Trung 🇨🇳 — chỉ dành cho hai đứa mình</p>
        </div>
        {!isConfigured() && (
          <div className="mb-4 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
            ⚠️ Chưa cấu hình mật khẩu. Hãy thêm biến môi trường <b>USER1_PASSWORD</b> và <b>USER2_PASSWORD</b> trong Vercel → Settings → Environment Variables rồi Redeploy.
          </div>
        )}
        <LoginForm users={users} next={next && next.startsWith("/") ? next : "/"} />
      </div>
    </div>
  );
}
