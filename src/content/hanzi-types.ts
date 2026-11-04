/** Mẹo nhớ một chữ: loại chữ, cấu trúc, các bộ phận (bộ chỉ nghĩa / phần gợi âm), câu chuyện chiết tự */
export interface HanziMem {
  type?: string;
  typeDesc?: string;
  structure?: string;
  parts: { c: string; name?: string; py?: string; role?: "nghĩa" | "âm" }[];
  story?: string;
  radical?: string;
}

export interface HanziEntry {
  c: string; // chữ
  py: string; // pinyin của chữ (theo ngữ cảnh từ)
  hv?: string; // âm Hán Việt
  word: string; // từ chứa chữ
  wordPy?: string;
  wordVi: string;
  strokes: number;
  isNew: boolean; // lần đầu xuất hiện trong giáo trình
  unitId: string;
  mem?: HanziMem;
}

export interface HanziUnit {
  id: string;
  title: string;
  levelId: string;
  chars: HanziEntry[];
}

export interface HanziLevel {
  id: string;
  code: string;
  title: string;
  units: HanziUnit[];
}
