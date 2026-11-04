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
