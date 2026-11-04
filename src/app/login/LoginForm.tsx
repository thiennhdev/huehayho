"use client";
import { useState } from "react";
import { Button, cx } from "@/components/ui";

interface U {
  id: string;
  name: string;
  lang: "en" | "zh";
}

export function LoginForm({ users, next }: { users: U[]; next: string }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel) return;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: sel, password: pw }),
    });
    if (res.ok) {
      window.location.href = next;
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Đăng nhập thất bại");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-card p-5 shadow-xl">
      <div className="mb-4 text-sm font-semibold text-muted">Bạn là ai?</div>
      <div className="grid grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            type="button"
            key={u.id}
            onClick={() => {
              setSel(u.id);
              setErr("");
            }}
            className={cx(
              "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition",
              sel === u.id ? (u.lang === "en" ? "border-en bg-en/10" : "border-zh bg-zh/10") : "border-line hover:border-brand/40",
            )}
          >
            <span className="text-4xl">{u.lang === "en" ? "🇬🇧" : "🇨🇳"}</span>
            <span className="font-bold">{u.name}</span>
            <span className="text-xs text-muted">{u.lang === "en" ? "Học tiếng Anh" : "Học tiếng Trung"}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="mt-4 animate-pop">
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-brand"
          />
          {err && <div className="mt-2 text-sm text-zh">{err}</div>}
          <Button type="submit" disabled={busy || !pw} className="mt-3 w-full py-3">
            {busy ? "Đang vào…" : "Vào học thôi 💜"}
          </Button>
        </div>
      )}
    </form>
  );
}
