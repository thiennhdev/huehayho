"use client";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/content/types";
import { useProgress } from "./ProgressProvider";
import { Button, Card, cx } from "./ui";
import { usePrefs } from "@/lib/prefs";
import { normalize } from "@/lib/progress";
import { speak, ttsSupported, sttSupported } from "@/lib/speech";
import { MicCheck } from "./practice/VoiceTools";

export function Settings() {
  const { user, progress, update, replace, name, lang, storage, sync } = useProgress();
  const [prefs, setPrefs] = usePrefs();
  const [draft, setDraft] = useState(name);
  const [msg, setMsg] = useState("");
  const [caps, setCaps] = useState({ tts: false, stt: false });
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(name), [name]);
  useEffect(() => setCaps({ tts: ttsSupported(), stt: sttSupported() }), []);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  const setProfile = (patch: Partial<typeof progress.profile>) => update((p) => ({ ...p, profile: { ...p.profile, ...patch, t: Date.now() } }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">⚙️ Cài đặt</h1>
      {msg && <div className="rounded-xl bg-ok/10 p-3 text-sm font-semibold text-ok">{msg}</div>}

      <Card className="flex flex-col gap-4">
        <h2 className="font-bold">👤 Hồ sơ</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Tên hiển thị</span>
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={30} className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand" />
            <Button
              onClick={() => {
                setProfile({ name: draft.trim() || undefined });
                flash("Đã lưu tên ✓");
              }}
            >
              Lưu
            </Button>
          </div>
        </label>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Ngôn ngữ chính đang học</span>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "zh"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setProfile({ lang: l })}
                className={cx("rounded-xl border-2 p-3 font-semibold", lang === l ? (l === "en" ? "border-en bg-en/10" : "border-zh bg-zh/10") : "border-line")}
              >
                {l === "en" ? "🇬🇧 Tiếng Anh (IELTS)" : "🇨🇳 Tiếng Trung (HSK)"}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted">Bạn vẫn có thể học cả hai — tiến độ được lưu riêng cho từng ngôn ngữ.</span>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Mục tiêu mỗi ngày</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              [30, "Nhẹ nhàng"],
              [60, "Đều đặn"],
              [100, "Chăm chỉ"],
              [150, "Thần tốc"],
            ].map(([xp, label]) => (
              <button key={xp} onClick={() => setProfile({ goal: Number(xp) })} className={cx("rounded-xl border-2 p-2", progress.profile.goal === xp ? "border-brand bg-brand/10" : "border-line")}>
                <div className="font-bold">{xp} XP</div>
                <div className="text-[11px] text-muted">{label}</div>
              </button>
            ))}
          </div>
          <span className="text-xs text-muted">1 bài học ≈ 50–70 XP · mỗi thẻ ôn tập = 2 XP · bài viết = 15 XP.</span>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-bold">🔊 Phát âm & hiển thị</h2>
        {!caps.tts && <div className="text-sm text-warn">Trình duyệt này không hỗ trợ đọc to. Hãy dùng Chrome, Edge hoặc Safari.</div>}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Tốc độ đọc: {prefs.rate.toFixed(2)}×</span>
          <input type="range" min={0.5} max={1.2} step={0.05} value={prefs.rate} onChange={(e) => setPrefs({ rate: Number(e.target.value) })} />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Giọng tiếng Anh</span>
          <div className="flex gap-2">
            {(["en-US", "en-GB"] as const).map((a) => (
              <button key={a} onClick={() => setPrefs({ accent: a })} className={cx("rounded-xl border-2 px-3 py-2", prefs.accent === a ? "border-en bg-en/10" : "border-line")}>
                {a === "en-US" ? "🇺🇸 Anh – Mỹ" : "🇬🇧 Anh – Anh"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => speak("Hello! Let's learn English together.", "en")}>
            Thử giọng Anh
          </Button>
          <Button variant="ghost" onClick={() => speak("你好！我们一起学习汉语吧。", "zh")}>
            Thử giọng Trung
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={prefs.autoPlay} onChange={(e) => setPrefs({ autoPlay: e.target.checked })} /> Tự đọc từ khi hiện thẻ ôn tập
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={prefs.showPinyin} onChange={(e) => setPrefs({ showPinyin: e.target.checked })} /> Hiện pinyin trong câu ví dụ / hội thoại
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={prefs.showTranslation} onChange={(e) => setPrefs({ showTranslation: e.target.checked })} /> Hiện nghĩa tiếng Việt
        </label>
        <p className="text-xs text-muted">
          Nhận diện giọng nói (🎙️): {caps.stt ? "✅ có hỗ trợ" : "❌ chưa hỗ trợ trên trình duyệt này (dùng Chrome / Edge / Safari mới)"}. Giọng đọc phụ thuộc thiết bị — trên điện thoại có thể cài thêm giọng Trung/Anh trong phần Cài đặt › Trợ năng › Nội dung được đọc.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 id="mic" className="scroll-mt-20 font-bold">🎙️ Kiểm tra micro & nhận diện giọng nói</h2>
        <MicCheck />
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-bold">💾 Dữ liệu</h2>
        <div className="text-sm">
          Trạng thái lưu trữ:{" "}
          {storage === "postgres" || storage === "mongodb" || storage === "redis" ? (
            <b className="text-ok">✅ Đang đồng bộ lên database ({storage === "postgres" ? "PostgreSQL" : storage === "mongodb" ? "MongoDB" : "Redis"})</b>
          ) : storage === "memory" ? (
            <b className="text-warn">Chạy local — lưu tạm trong bộ nhớ server</b>
          ) : storage === "none" ? (
            <b className="text-warn">⚠️ Chưa kết nối database — chỉ lưu trên máy này</b>
          ) : (
            <b>Đang kiểm tra…</b>
          )}
          {sync === "error" && <span className="ml-2 text-zh">(lỗi mạng, sẽ thử lại)</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `hoc-cung-nhau-${user.id}-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
            }}
          >
            ⬇️ Xuất bản sao lưu
          </Button>
          <Button variant="ghost" onClick={() => file.current?.click()}>
            ⬆️ Nhập bản sao lưu
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const data = normalize(JSON.parse(await f.text()));
                if (confirm("Thay toàn bộ tiến độ hiện tại bằng bản sao lưu này?")) {
                  replace(data);
                  flash("Đã nhập bản sao lưu ✓");
                }
              } catch {
                alert("File không hợp lệ");
              }
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      <a href="/sources" className="block">
        <Card className="text-sm font-semibold text-brand hover:bg-brand/5">📖 Nguồn giáo trình, dữ liệu đối chiếu & phương pháp học →</Card>
      </a>

      <Card className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted">
          Đang đăng nhập: <b className="text-ink">{name}</b>
        </div>
        <Button
          variant="danger"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
          Đăng xuất
        </Button>
      </Card>
    </div>
  );
}
