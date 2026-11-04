export type Lang = "en" | "zh";

/** Một từ / cụm từ trong bài học */
export interface VocabItem {
  /** Từ tiếng Anh hoặc chữ Hán */
  term: string;
  /** Phiên âm IPA (tiếng Anh) */
  ipa?: string;
  /** Pinyin có dấu thanh (tiếng Trung) */
  py?: string;
  /** Âm Hán Việt (tiếng Trung) – giúp người Việt nhớ nhanh */
  hv?: string;
  /** Từ loại: n, v, adj, adv, prep, phr... */
  pos?: string;
  /** Nghĩa tiếng Việt */
  vi: string;
  /** Câu ví dụ */
  ex?: string;
  /** Pinyin của câu ví dụ (tiếng Trung) */
  exPy?: string;
  /** Nghĩa câu ví dụ */
  exVi?: string;
}

export interface Example {
  text: string;
  py?: string;
  vi: string;
}

export interface GrammarPoint {
  title: string;
  /** Công thức / cấu trúc */
  pattern?: string;
  /** Giải thích bằng tiếng Việt */
  explain: string;
  examples: Example[];
}

export interface DialogueLine {
  /** Người nói (A/B hoặc tên) */
  s: string;
  text: string;
  py?: string;
  vi: string;
}

export interface Reading {
  title: string;
  text: string;
  py?: string;
  vi: string;
}

export type Question =
  | {
      type: "mcq";
      prompt: string;
      options: string[];
      /** index đáp án đúng */
      answer: number;
      explain?: string;
    }
  | {
      type: "fill";
      prompt: string; // dùng ___ để đánh dấu chỗ trống
      answer: string | string[]; // chấp nhận nhiều đáp án
      hint?: string;
      explain?: string;
    };

export interface Unit {
  /** id duy nhất toàn app, ví dụ: en-a1-01, zh-hsk2-05 */
  id: string;
  title: string;
  /** Chủ đề ngắn gọn bằng tiếng Việt */
  topic: string;
  /** Mục tiêu "Can-do" của bài */
  goals: string[];
  vocab: VocabItem[];
  grammar: GrammarPoint[];
  dialogue?: DialogueLine[];
  reading?: Reading;
  /** Câu hỏi luyện tập viết tay (ngữ pháp, đọc hiểu). Bài tập từ vựng được sinh tự động. */
  practice: Question[];
  speaking: string[];
  writing: string;
  /** Mẹo học / phát âm / văn hoá */
  tip?: string;
}

export interface Level {
  /** id ngắn: a0, a1, ... hoặc hsk0, hsk1, ... */
  id: string;
  lang: Lang;
  /** Mã chuẩn: Pre-A1, A1, ... / HSK 1 ... */
  code: string;
  title: string;
  /** Tương đương bài thi (IELTS / HSK / CEFR) */
  exam: string;
  /** Số giờ học có hướng dẫn ước tính (cộng dồn) */
  hours: string;
  description: string;
  /** Mô tả năng lực đầu ra theo khung tham chiếu */
  canDo: string[];
  /** Giáo trình chuẩn nên học song song */
  books: string[];
  units: Unit[];
}

export interface Course {
  lang: Lang;
  name: string;
  flag: string;
  framework: string;
  target: string;
  levels: Level[];
}

/** Khung chương trình rút gọn (gửi xuống trình duyệt) */
export interface OutlineUnit {
  id: string;
  title: string;
  topic: string;
}
export interface OutlineLevel {
  id: string;
  code: string;
  title: string;
  exam: string;
  units: OutlineUnit[];
}
export type Outline = Record<Lang, OutlineLevel[]>;
