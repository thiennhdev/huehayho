// Nền tảng tập viết chữ Hán: nét cơ bản & quy tắc bút thuận (theo giáo trình HSK Standard Course / Giáo trình Hán ngữ)

export interface StrokeType {
  name: string; // tên tiếng Trung
  py: string;
  vi: string; // tên tiếng Việt
  how: string; // cách viết
  char: string; // chữ ví dụ
  stroke: number; // chỉ số nét minh hoạ trong chữ ví dụ
}

export const STROKES: StrokeType[] = [
  { name: "横", py: "héng", vi: "Nét ngang", how: "Viết từ trái sang phải, hơi nghiêng lên một chút.", char: "一", stroke: 0 },
  { name: "竖", py: "shù", vi: "Nét sổ", how: "Viết thẳng từ trên xuống dưới.", char: "十", stroke: 1 },
  { name: "撇", py: "piě", vi: "Nét phẩy", how: "Từ trên phải kéo chéo xuống dưới bên trái, nhọn dần ở cuối.", char: "八", stroke: 0 },
  { name: "捺", py: "nà", vi: "Nét mác", how: "Từ trên trái kéo chéo xuống dưới bên phải, đè mạnh rồi thoát bút.", char: "八", stroke: 1 },
  { name: "点", py: "diǎn", vi: "Nét chấm", how: "Chấm ngắn từ trên xuống dưới bên phải.", char: "六", stroke: 0 },
  { name: "提", py: "tí", vi: "Nét hất", how: "Từ dưới trái hất chéo lên trên bên phải.", char: "江", stroke: 2 },
  { name: "横折", py: "héngzhé", vi: "Nét ngang gập", how: "Viết ngang sang phải rồi gập thẳng xuống, liền một nét.", char: "口", stroke: 1 },
  { name: "竖钩", py: "shùgōu", vi: "Nét sổ móc", how: "Sổ thẳng xuống rồi móc nhẹ lên bên trái ở cuối.", char: "小", stroke: 0 },
];

export interface StrokeRule {
  rule: string;
  py: string;
  vi: string;
  chars: string[];
}

export const RULES: StrokeRule[] = [
  { rule: "先横后竖", py: "xiān héng hòu shù", vi: "Ngang trước, sổ sau", chars: ["十", "干"] },
  { rule: "先撇后捺", py: "xiān piě hòu nà", vi: "Phẩy trước, mác sau", chars: ["人", "八"] },
  { rule: "从上到下", py: "cóng shàng dào xià", vi: "Trên trước, dưới sau", chars: ["三", "工"] },
  { rule: "从左到右", py: "cóng zuǒ dào yòu", vi: "Trái trước, phải sau", chars: ["川", "你"] },
  { rule: "从外到内", py: "cóng wài dào nèi", vi: "Ngoài trước, trong sau", chars: ["月", "同"] },
  { rule: "先里头后封口", py: "xiān lǐtou hòu fēngkǒu", vi: "Vào nhà trước, đóng cửa sau", chars: ["日", "国"] },
  { rule: "先中间后两边", py: "xiān zhōngjiān hòu liǎngbiān", vi: "Giữa trước, hai bên sau", chars: ["小", "水"] },
];

export const FOUNDATION_CHARS = Array.from(new Set([...STROKES.map((s) => s.char), ...RULES.flatMap((r) => r.chars), "丨", "丿", "丶", "乙"]));
