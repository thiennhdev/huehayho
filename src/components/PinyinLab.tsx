"use client";
// Phòng luyện pinyin cho người mới bắt đầu: 4 thanh điệu, nghe & chọn thanh, cặp thanh 2 âm tiết,
// cặp phụ âm dễ nhầm, bảng so sánh với âm tiếng Việt, quy tắc biến điệu.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { speak } from "@/lib/speech";
import { sfx } from "@/lib/sfx";
import { Button, Card, SpeakButton, cx, shuffle } from "./ui";

export interface TonePairWord {
  term: string;
  py: string;
  vi: string;
  tones: [number, number];
}

type Tab = "tones" | "drill" | "pairs" | "sounds" | "rules";

const TONES = [
  { n: 1, mark: "ā", name: "Thanh 1", desc: "Cao và đều, giữ hơi như đang hát nốt cao", vi: "≈ thanh ngang tiếng Việt nhưng CAO hơn", path: "M10,14 L110,14", color: "#ef4444" },
  { n: 2, mark: "á", name: "Thanh 2", desc: "Đi lên từ giữa lên cao, như khi hỏi lại “Hả?”", vi: "≈ thanh sắc", path: "M10,50 L110,14", color: "#f59e0b" },
  { n: 3, mark: "ǎ", name: "Thanh 3", desc: "Xuống thấp rồi hơi lên. Trong câu thường chỉ đọc phần thấp (nửa thanh 3)", vi: "≈ thanh hỏi (hoặc thanh nặng kéo dài)", path: "M10,38 Q45,86 75,74 T110,26", color: "#10b981" },
  { n: 4, mark: "à", name: "Thanh 4", desc: "Rơi mạnh từ cao xuống thấp, dứt khoát như ra lệnh “Đi!”", vi: "≈ giữa thanh huyền và nặng, nhưng bắt đầu từ CAO", path: "M10,14 L110,80", color: "#3b82f6" },
];

const TONE_SETS: { py: string; chars: [string, string, string, string]; vi: [string, string, string, string] }[] = [
  { py: "ma", chars: ["妈", "麻", "马", "骂"], vi: ["mẹ", "tê; cây gai", "ngựa", "mắng"] },
  { py: "ba", chars: ["八", "拔", "把", "爸"], vi: ["tám", "nhổ", "cầm; (lượng từ)", "bố"] },
  { py: "yi", chars: ["衣", "姨", "椅", "意"], vi: ["áo", "dì", "ghế", "ý"] },
  { py: "tang", chars: ["汤", "糖", "躺", "烫"], vi: ["canh", "đường", "nằm", "nóng bỏng"] },
  { py: "tong", chars: ["通", "同", "桶", "痛"], vi: ["thông", "cùng", "thùng", "đau"] },
  { py: "da", chars: ["搭", "答", "打", "大"], vi: ["dựng, bắc", "trả lời", "đánh", "to"] },
  { py: "fei", chars: ["飞", "肥", "匪", "费"], vi: ["bay", "béo", "phỉ, cướp", "phí"] },
  { py: "fang", chars: ["方", "房", "访", "放"], vi: ["vuông", "nhà", "thăm", "đặt, thả"] },
  { py: "shi", chars: ["诗", "十", "使", "是"], vi: ["thơ", "mười", "khiến", "là"] },
  { py: "wu", chars: ["屋", "无", "五", "雾"], vi: ["nhà", "không có", "năm", "sương mù"] },
];

const MINIMAL: { a: string; b: string; pa: string; pb: string; tip: string }[] = [
  { a: "知", b: "资", pa: "zhī", pb: "zī", tip: "zh uốn lưỡi (≈ “tr”) · z lưỡi thẳng chạm sau răng" },
  { a: "出", b: "粗", pa: "chū", pb: "cū", tip: "ch = zh + bật hơi · c = z + bật hơi" },
  { a: "诗", b: "丝", pa: "shī", pb: "sī", tip: "sh uốn lưỡi (≈ “s” chuẩn) · s lưỡi thẳng (≈ “x”)" },
  { a: "鸡", b: "七", pa: "jī", pb: "qī", tip: "j không bật hơi (≈ “ch”) · q bật hơi mạnh" },
  { a: "西", b: "丝", pa: "xī", pb: "sī", tip: "x môi dẹt như cười · s lưỡi chạm sau răng" },
  { a: "包", b: "抛", pa: "bāo", pb: "pāo", tip: "b không bật hơi · p bật hơi (tờ giấy trước miệng sẽ rung)" },
  { a: "多", b: "拖", pa: "duō", pb: "tuō", tip: "d ≈ “t” tiếng Việt · t ≈ “th” tiếng Việt" },
  { a: "哥", b: "科", pa: "gē", pb: "kē", tip: "g ≈ “c/k” tiếng Việt · k bật hơi (≈ “kh” nhẹ)" },
  { a: "兰", b: "南", pa: "lán", pb: "nán", tip: "l đầu lưỡi chạm lợi, hơi qua hai bên · n hơi qua mũi" },
  { a: "绿", b: "路", pa: "lǜ", pb: "lù", tip: "ü = đọc “i” nhưng chu tròn môi · u = “u”" },
  { a: "热", b: "乐", pa: "rè", pb: "lè", tip: "r uốn lưỡi nhẹ, không rung · l như “l” tiếng Việt" },
];

const COMPARE: [string, string][] = [
  ["b", "gần “p” nhẹ, không bật hơi"],
  ["p", "“p” bật hơi mạnh"],
  ["d", "≈ “t” tiếng Việt"],
  ["t", "≈ “th” tiếng Việt"],
  ["g", "≈ “c / k” tiếng Việt"],
  ["k", "≈ “kh” nhẹ (k bật hơi)"],
  ["h", "≈ “h” xát hơn, gần “kh”"],
  ["j", "≈ “ch” (môi dẹt)"],
  ["q", "≈ “ch” + bật hơi mạnh"],
  ["x", "≈ “x”, môi dẹt như cười"],
  ["zh", "≈ “tr” uốn lưỡi, không bật hơi"],
  ["ch", "≈ “tr” uốn lưỡi + bật hơi"],
  ["sh", "≈ “s” uốn lưỡi (giọng chuẩn)"],
  ["r", "uốn lưỡi nhẹ, gần “r” không rung"],
  ["z", "≈ “ch” đầu lưỡi thẳng sau răng"],
  ["c", "≈ “z” + bật hơi (“x-th”)"],
  ["s", "≈ “x” tiếng Việt"],
  ["e", "≈ “ơ” (hơi giống “ưa”)"],
  ["ü / yu", "đọc “i” nhưng tròn môi (≈ “uy” tròn môi)"],
  ["-i (zhi chi shi ri zi ci si)", "đọc như “ư”, không phải “i”"],
  ["ai / ei", "≈ “ai” / “ây”"],
  ["ao / ou", "≈ “ao” / “âu”"],
  ["an / ang", "≈ “an” / “ang”"],
  ["en / eng", "≈ “ân” / “âng”"],
  ["ian", "≈ “iên” (không phải “i-an”)"],
  ["ie / üe", "≈ “iê” / “uê” tròn môi"],
  ["uo", "≈ “ua / uô”"],
  ["ong", "≈ “ung”"],
];

const TIPS = [
  { icon: "✋", title: "Vẽ thanh điệu bằng tay", body: "Khi đọc, dùng tay vẽ đường đi của thanh trong không khí (ngang, lên, võng, rơi). Cử động giúp não nhớ cao độ — cách nhiều giáo viên dùng với lớp mới bắt đầu." },
  { icon: "👫", title: "Luyện theo cặp 2 âm tiết", body: "Từ tiếng Trung đa số có 2 âm tiết, nên luyện các cặp thanh (1-1, 1-2… 4-4) với từ thật như 中国, 学生 sẽ hiệu quả hơn luyện từng âm rời." },
  { icon: "🐢", title: "Nghe chậm → bắt chước → ghi âm", body: "Nghe ở tốc độ 0.6, đọc nhại theo (shadowing), rồi ghi âm giọng mình để so. Mỗi ngày 10 phút đều đặn tốt hơn 1 tiếng mỗi tuần." },
  { icon: "🔉", title: "Thanh 3 thường chỉ đọc một nửa", body: "Trong câu nói thực tế, thanh 3 chủ yếu đọc thấp xuống rồi dừng (không cần vòng lên). Chỉ đọc đủ khi đứng một mình hoặc cuối câu." },
  { icon: "🇻🇳", title: "Tận dụng âm tiếng Việt", body: "Người Việt có lợi thế lớn: tiếng Việt cũng có thanh điệu. Bám vào âm gần giống (bảng bên dưới), rồi chỉnh những chỗ khác: bật hơi (p t k q c ch) và uốn lưỡi (zh ch sh r)." },
  { icon: "🎯", title: "Ưu tiên nghe hiểu trước", body: "Giai đoạn đầu chưa cần đọc hoàn hảo. Nghe nhiều để tai quen phân biệt thanh, sau đó miệng sẽ dần theo kịp." },
];

const toneMark = (t: number) => (t === 0 ? "nhẹ" : String(t));

export function PinyinLab({ pairs }: { pairs: TonePairWord[] }) {
  const [tab, setTab] = useState<Tab>("tones");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/learn/zh" className="text-xs text-muted hover:text-brand">
          🇨🇳 Tiếng Trung
        </Link>
        <h1 className="text-2xl font-extrabold">🎵 Luyện pinyin & thanh điệu</h1>
        <p className="text-sm text-muted">Dành cho người mới bắt đầu: nắm chắc 4 thanh và các âm khó trước khi học nhiều từ — nền móng của nghe, nói và nhớ từ.</p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-card p-1 ring-1 ring-line sm:grid-cols-5">
        {(
          [
            ["tones", "① 4 thanh"],
            ["drill", "② Nghe chọn thanh"],
            ["pairs", "③ Cặp thanh"],
            ["sounds", "④ Âm khó"],
            ["rules", "⑤ Biến điệu"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("rounded-lg px-2 py-2 text-sm font-semibold", tab === k ? "bg-zh text-white" : "text-muted")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "tones" && <TonesIntro />}
      {tab === "drill" && <ToneDrill />}
      {tab === "pairs" && <PairDrill pairs={pairs} />}
      {tab === "sounds" && <Sounds />}
      {tab === "rules" && <Rules />}

      <Card>
        <h2 className="mb-2 text-lg font-extrabold">💡 Lời khuyên từ giáo viên</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((t) => (
            <div key={t.title} className="rounded-xl border border-line bg-bg p-3">
              <div className="font-bold">
                {t.icon} {t.title}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ToneDiagram({ active }: { active?: number }) {
  return (
    <svg viewBox="0 0 160 96" className="w-full max-w-xs" aria-label="Sơ đồ 4 thanh điệu">
      {[14, 32, 50, 68, 86].map((y, i) => (
        <g key={y}>
          <line x1={10} x2={110} y1={y} y2={y} stroke="var(--color-line)" strokeDasharray="3 4" />
          <text x={2} y={y + 3} fontSize={7} fill="var(--color-muted)">
            {5 - i}
          </text>
        </g>
      ))}
      {TONES.map((t) => (
        <path key={t.n} d={t.path} fill="none" stroke={t.color} strokeWidth={active === undefined || active === t.n ? 4 : 2} strokeLinecap="round" opacity={active === undefined || active === t.n ? 1 : 0.25} />
      ))}
      {TONES.map((t, i) => (
        <text key={t.n} x={118} y={18 + i * 20} fontSize={9} fontWeight={700} fill={t.color}>
          {t.n} {t.mark}
        </text>
      ))}
    </svg>
  );
}

function TonesIntro() {
  const [active, setActive] = useState<number | undefined>();
  return (
    <>
      <Card className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <ToneDiagram active={active} />
        <div className="text-sm text-muted">
          <p>
            Tiếng Trung phổ thông có <b className="text-ink">4 thanh + 1 thanh nhẹ</b>. Cùng âm <span className="py">ma</span> nhưng khác thanh là khác nghĩa hoàn toàn: <span className="han text-ink">妈 麻 马 骂</span> = mẹ, tê, ngựa, mắng.
          </p>
          <p className="mt-2">Trục dọc là độ cao giọng (5 = cao nhất). Bấm vào từng thanh để nghe và xem đường đi.</p>
          <p className="mt-2">
            <b className="text-ink">Thanh nhẹ</b> (không dấu, vd <span className="py">ma</span> trong <span className="han">吗</span>): đọc ngắn, nhẹ, không nhấn.
          </p>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {TONES.map((t, i) => (
          <Card key={t.n} className="flex flex-col gap-2">
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => {
                setActive(t.n);
                speak(TONE_SETS[0].chars[i], "zh", { rate: 0.6 });
              }}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white" style={{ background: t.color }}>
                {t.n}
              </span>
              <span>
                <span className="block font-bold">
                  {t.name} <span className="py">({t.mark})</span>
                </span>
                <span className="block text-sm text-muted">{t.desc}</span>
                <span className="block text-sm font-semibold" style={{ color: t.color }}>
                  🇻🇳 {t.vi}
                </span>
              </span>
            </button>
            <div className="flex flex-wrap gap-1.5">
              {TONE_SETS.slice(0, 5).map((s) => (
                <button
                  key={s.py + s.chars[i]}
                  onClick={() => {
                    setActive(t.n);
                    speak(s.chars[i], "zh", { rate: 0.6 });
                  }}
                  className="rounded-xl bg-bg px-2.5 py-1 ring-1 ring-line hover:ring-brand"
                  title={s.vi[i]}
                >
                  <span className="han text-lg">{s.chars[i]}</span> <span className="py text-xs text-muted">{addMark(s.py, t.n)}</span>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="flex flex-col gap-2">
        <div className="font-bold">So sánh cả 4 thanh</div>
        <div className="flex flex-wrap gap-2">
          {TONE_SETS.slice(0, 6).map((s) => (
            <Button key={s.py} variant="soft" onClick={() => s.chars.forEach((c, i) => setTimeout(() => speak(c, "zh", { rate: 0.6 }), i * 1300))}>
              ▶ {s.py}: <span className="han">{s.chars.join(" ")}</span>
            </Button>
          ))}
        </div>
      </Card>
    </>
  );
}

/** Đặt dấu thanh cho âm tiết pinyin không dấu */
function addMark(syl: string, tone: number): string {
  const marks: Record<string, string[]> = { a: ["ā", "á", "ǎ", "à"], e: ["ē", "é", "ě", "è"], i: ["ī", "í", "ǐ", "ì"], o: ["ō", "ó", "ǒ", "ò"], u: ["ū", "ú", "ǔ", "ù"], ü: ["ǖ", "ǘ", "ǚ", "ǜ"] };
  if (tone < 1 || tone > 4) return syl;
  const idx = syl.search(/[ae]/) >= 0 ? syl.search(/[ae]/) : syl.includes("ou") ? syl.indexOf("o") : (() => {
    for (let i = syl.length - 1; i >= 0; i--) if ("iouü".includes(syl[i])) return i;
    return -1;
  })();
  if (idx < 0) return syl;
  return syl.slice(0, idx) + marks[syl[idx]][tone - 1] + syl.slice(idx + 1);
}

function ToneDrill() {
  const [q, setQ] = useState(() => newQ());
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 });
  function newQ() {
    const s = TONE_SETS[Math.floor(Math.random() * TONE_SETS.length)];
    const t = Math.floor(Math.random() * 4);
    return { s, t };
  }
  useEffect(() => {
    const id = setTimeout(() => speak(q.s.chars[q.t], "zh", { rate: 0.7 }), 300);
    return () => clearTimeout(id);
  }, [q]);
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <div className="text-sm text-muted">Nghe âm tiết và chọn đúng thanh điệu. Mẹo: vẽ đường thanh bằng tay khi nghe.</div>
      <div className="flex gap-3">
        <SpeakButton text={q.s.chars[q.t]} lang="zh" size="lg" rate={0.7} />
        <SpeakButton text={q.s.chars[q.t]} lang="zh" size="lg" rate={0.45} caption="🐢" />
      </div>
      <div className="py text-3xl font-bold">{picked === null ? q.s.py : addMark(q.s.py, q.t + 1)}</div>
      <div className="grid w-full max-w-md grid-cols-4 gap-2">
        {TONES.map((t, i) => (
          <button
            key={t.n}
            disabled={picked !== null}
            onClick={() => {
              setPicked(i);
              const ok = i === q.t;
              ok ? sfx.correct() : sfx.wrong();
              setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }));
            }}
            className={cx(
              "flex flex-col items-center rounded-xl border-2 border-b-4 py-2 font-bold transition",
              picked === null && "border-line hover:bg-brand/5",
              picked !== null && i === q.t && "border-ok bg-ok/10",
              picked === i && i !== q.t && "border-zh bg-zh/10",
              picked !== null && i !== q.t && picked !== i && "border-line opacity-40",
            )}
          >
            <svg viewBox="0 0 120 96" className="h-8 w-12">
              <path d={t.path} fill="none" stroke={t.color} strokeWidth={8} strokeLinecap="round" />
            </svg>
            <span>Thanh {t.n}</span>
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="flex flex-col items-center gap-2 animate-pop">
          <div className={cx("font-bold", picked === q.t ? "text-ok" : "text-zh")}>
            {picked === q.t ? "Chính xác! 🎉" : `Chưa đúng — đây là thanh ${q.t + 1}`}
          </div>
          <div className="text-sm">
            <span className="han text-xl">{q.s.chars[q.t]}</span> <span className="py">{addMark(q.s.py, q.t + 1)}</span> — {q.s.vi[q.t]}
          </div>
          <Button variant="ghost" onClick={() => q.s.chars.forEach((c, i) => setTimeout(() => speak(c, "zh", { rate: 0.6 }), i * 1300))}>
            ▶ Nghe so sánh cả 4 thanh: <span className="han">{q.s.chars.join(" ")}</span>
          </Button>
          <Button
            onClick={() => {
              setPicked(null);
              setQ(newQ());
            }}
          >
            Câu tiếp →
          </Button>
        </div>
      )}
      <div className="text-xs text-muted">
        Đúng {score.ok}/{score.total} {score.streak >= 3 && <span className="font-bold text-warn">· 🔥 {score.streak} liên tiếp</span>}
      </div>
    </Card>
  );
}

function PairDrill({ pairs }: { pairs: TonePairWord[] }) {
  const pool = useMemo(() => shuffle(pairs), [pairs]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const w = pool[i % Math.max(1, pool.length)];
  const options = useMemo(() => {
    if (!w) return [];
    const key = (t: number[]) => t.join("-");
    const set = new Map<string, number[]>([[key(w.tones), w.tones]]);
    while (set.size < 4) {
      const t = [1 + Math.floor(Math.random() * 4), Math.random() < 0.15 ? 0 : 1 + Math.floor(Math.random() * 4)];
      if (t[0] === 3 && t[1] === 3) continue;
      set.set(key(t), t);
    }
    return shuffle([...set.values()]);
  }, [w]);
  useEffect(() => {
    if (!w) return;
    const id = setTimeout(() => speak(w.term, "zh", { rate: 0.7 }), 300);
    return () => clearTimeout(id);
  }, [w]);
  if (!w) return null;
  const answer = options.findIndex((o) => o.join("-") === w.tones.join("-"));
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <div className="text-sm text-muted">Nghe từ 2 âm tiết và chọn cặp thanh đúng — đây là cách luyện thanh điệu hiệu quả nhất vì đa số từ tiếng Trung có 2 âm tiết.</div>
      <div className="flex gap-3">
        <SpeakButton text={w.term} lang="zh" size="lg" rate={0.7} />
        <SpeakButton text={w.term} lang="zh" size="lg" rate={0.45} caption="🐢" />
      </div>
      {picked !== null && (
        <div className="animate-pop">
          <div className="han text-4xl font-bold">{w.term}</div>
          <div className="py text-lg text-zh">{w.py}</div>
          <div className="text-sm text-muted">{w.vi}</div>
        </div>
      )}
      <div className="grid w-full max-w-md grid-cols-2 gap-2">
        {options.map((o, k) => (
          <button
            key={o.join("-")}
            disabled={picked !== null}
            onClick={() => {
              setPicked(k);
              const ok = k === answer;
              ok ? sfx.correct() : sfx.wrong();
              setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
            }}
            className={cx(
              "flex items-center justify-center gap-2 rounded-xl border-2 border-b-4 py-3 font-bold transition",
              picked === null && "border-line hover:bg-brand/5",
              picked !== null && k === answer && "border-ok bg-ok/10",
              picked === k && k !== answer && "border-zh bg-zh/10",
              picked !== null && k !== answer && picked !== k && "border-line opacity-40",
            )}
          >
            {o.map((t, j) => (
              <span key={j} className="flex items-center gap-1">
                {t ? (
                  <svg viewBox="0 0 120 96" className="h-6 w-9">
                    <path d={TONES[t - 1].path} fill="none" stroke={TONES[t - 1].color} strokeWidth={9} strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-muted">•</span>
                )}
                <span>{toneMark(t)}</span>
                {j === 0 && <span className="text-muted">+</span>}
              </span>
            ))}
          </button>
        ))}
      </div>
      {picked !== null && (
        <Button
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          Từ tiếp →
        </Button>
      )}
      <div className="text-xs text-muted">
        Đúng {score.ok}/{score.total} · {pairs.length} từ từ Nhập môn → HSK 2
      </div>
    </Card>
  );
}

function Sounds() {
  const [q, setQ] = useState(() => Math.floor(Math.random() * MINIMAL.length));
  const [side, setSide] = useState(() => Math.random() < 0.5);
  const [picked, setPicked] = useState<boolean | null>(null);
  const m = MINIMAL[q];
  const target = side ? m.a : m.b;
  return (
    <>
      <Card className="flex flex-col items-center gap-3 text-center">
        <div className="font-bold">👂 Nghe và chọn âm đúng</div>
        <div className="flex gap-3">
          <SpeakButton text={target} lang="zh" size="lg" rate={0.7} />
          <SpeakButton text={target} lang="zh" size="lg" rate={0.45} caption="🐢" />
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-2">
          {[true, false].map((isA) => {
            const ok = isA === side;
            return (
              <button
                key={String(isA)}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(isA);
                  ok ? sfx.correct() : sfx.wrong();
                }}
                className={cx(
                  "flex flex-col items-center rounded-xl border-2 border-b-4 py-3 transition",
                  picked === null && "border-line hover:bg-brand/5",
                  picked !== null && ok && "border-ok bg-ok/10",
                  picked === isA && !ok && "border-zh bg-zh/10",
                )}
              >
                <span className="py text-2xl font-bold">{isA ? m.pa : m.pb}</span>
                {picked !== null && <span className="han text-lg">{isA ? m.a : m.b}</span>}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="flex flex-col items-center gap-2 animate-pop">
            <div className="text-sm">💡 {m.tip}</div>
            <div className="flex gap-2">
              <SpeakButton text={m.a} lang="zh" size="sm" rate={0.6} caption={`▶ ${m.pa}`} />
              <SpeakButton text={m.b} lang="zh" size="sm" rate={0.6} caption={`▶ ${m.pb}`} />
            </div>
            <Button
              onClick={() => {
                setPicked(null);
                setQ(Math.floor(Math.random() * MINIMAL.length));
                setSide(Math.random() < 0.5);
              }}
            >
              Câu tiếp →
            </Button>
          </div>
        )}
      </Card>
      <Card>
        <h2 className="mb-1 text-lg font-extrabold">🇻🇳 Pinyin so với âm tiếng Việt</h2>
        <p className="mb-3 text-sm text-muted">Chỉ là âm gần đúng để dễ bắt đầu — luôn nghe giọng mẫu để chỉnh. Hai điểm người Việt hay sai nhất: <b>bật hơi</b> (p t k q c ch) và <b>uốn lưỡi</b> (zh ch sh r).</p>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {COMPARE.map(([p, v]) => (
            <div key={p} className="flex items-baseline gap-3 border-b border-line/60 py-1.5 text-sm">
              <span className="py w-24 shrink-0 font-bold text-zh">{p}</span>
              <span className="text-muted">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Rules() {
  const R = [
    { title: "Hai thanh 3 đứng liền nhau → thanh đầu đọc thành thanh 2", ex: [["你好", "nǐ hǎo → ní hǎo"], ["很好", "hěn hǎo → hén hǎo"], ["可以", "kěyǐ → kéyǐ"]] },
    { title: "不 (bù) đứng trước thanh 4 → đọc bú", ex: [["不是", "bù shì → bú shì"], ["不要", "bù yào → bú yào"], ["不对", "bù duì → bú duì"]] },
    { title: "一 (yī) trước thanh 4 → yí; trước thanh 1, 2, 3 → yì", ex: [["一个", "yī gè → yí gè"], ["一起", "yī qǐ → yì qǐ"], ["一天", "yī tiān → yì tiān"]] },
    { title: "Thanh nhẹ: âm tiết sau đọc ngắn, nhẹ", ex: [["妈妈", "māma"], ["谢谢", "xièxie"], ["朋友", "péngyou"]] },
  ];
  return (
    <div className="flex flex-col gap-3">
      {R.map((r) => (
        <Card key={r.title} className="flex flex-col gap-2">
          <div className="font-bold">{r.title}</div>
          <div className="flex flex-wrap gap-2">
            {r.ex.map(([w, p]) => (
              <button key={w} onClick={() => speak(w, "zh", { rate: 0.6 })} className="rounded-xl bg-bg px-3 py-1.5 text-left ring-1 ring-line hover:ring-brand">
                <span className="han text-lg">{w}</span> <span className="py text-sm text-muted">{p}</span> 🔊
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Card className="text-sm text-muted">
        📌 Trong sách và app, pinyin thường ghi <b>thanh gốc</b> (nǐ hǎo) nhưng khi đọc phải áp dụng biến điệu. Giọng đọc mẫu của app đã tự đọc đúng biến điệu — hãy nghe và bắt chước.
      </Card>
    </div>
  );
}
