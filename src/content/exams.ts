// Cẩm nang luyện thi: IELTS (tiếng Anh) & HSK/HSKK (tiếng Trung)
import type { Lang } from "./types";

export interface ExamSection {
  name: string;
  detail: string;
}

export interface Criterion {
  name: string;
  band7: string; // mô tả yêu cầu để đạt mục tiêu (paraphrase, không trích nguyên văn)
}

export interface Prompt {
  id: string;
  kind: string;
  minutes: number;
  minWords: number; // từ (EN) hoặc chữ (ZH)
  text: string;
  hint?: string;
}

export interface RoadmapStep {
  stage: string;
  target: string;
  focus: string;
}

export interface ExamGuide {
  lang: Lang;
  name: string;
  target: string;
  intro: string;
  sections: ExamSection[];
  scoreNote: string;
  criteria: { title: string; items: Criterion[] }[];
  roadmap: RoadmapStep[];
  tips: string[];
  writingPrompts: Prompt[];
  speakingPrompts: string[];
  checklist: string[];
  resources: string[];
  table?: { head: string[]; rows: string[][]; note?: string };
}

export const ielts: ExamGuide = {
  lang: "en",
  name: "IELTS Academic",
  target: "Band 7.0+",
  intro:
    "IELTS (International English Language Testing System) do British Council, IDP và Cambridge English đồng sở hữu. Band 7.0 tương đương CEFR C1 — mức thường được yêu cầu cho du học thạc sĩ, định cư và nhiều công việc quốc tế.",
  sections: [
    { name: "Listening", detail: "~30 phút · 4 phần · 40 câu (hội thoại đời sống → bài giảng học thuật)" },
    { name: "Reading", detail: "60 phút · 3 bài đọc học thuật dài · 40 câu (True/False/Not Given, Matching Headings, điền từ…)" },
    { name: "Writing", detail: "60 phút · Task 1: mô tả biểu đồ/quy trình ≥150 từ (~20') · Task 2: bài luận ≥250 từ (~40', điểm gấp đôi Task 1)" },
    { name: "Speaking", detail: "11–14 phút với giám khảo · Part 1: câu hỏi cá nhân · Part 2: nói 1–2 phút theo cue card · Part 3: thảo luận chuyên sâu" },
  ],
  scoreNote:
    "Điểm mỗi kỹ năng từ 0–9 (bước 0.5), Overall là trung bình 4 kỹ năng làm tròn. Để đạt 7.0 ở Listening/Reading cần khoảng 30/40 câu đúng (tham khảo, thay đổi nhẹ theo đề).",
  criteria: [
    {
      title: "Writing — 4 tiêu chí (mỗi tiêu chí 25%)",
      items: [
        { name: "Task Response / Achievement", band7: "Trả lời đủ mọi phần của đề, quan điểm rõ ràng xuyên suốt; ý chính được mở rộng và chứng minh (Task 1: có overview rõ xu hướng chính)." },
        { name: "Coherence & Cohesion", band7: "Bố cục logic, ý phát triển mạch lạc; mỗi đoạn có ý trung tâm rõ; dùng đa dạng từ nối/quy chiếu một cách tự nhiên, không máy móc." },
        { name: "Lexical Resource", band7: "Vốn từ đủ rộng để diễn đạt linh hoạt, chính xác; dùng được từ ít phổ biến với ý thức về văn phong và collocation; chỉ thỉnh thoảng sai từ/chính tả." },
        { name: "Grammatical Range & Accuracy", band7: "Dùng đa dạng cấu trúc phức; phần lớn câu không có lỗi; kiểm soát ngữ pháp và dấu câu tốt dù còn vài lỗi nhỏ." },
      ],
    },
    {
      title: "Speaking — 4 tiêu chí (mỗi tiêu chí 25%)",
      items: [
        { name: "Fluency & Coherence", band7: "Nói dài mà không thấy gắng sức, ngập ngừng chủ yếu do tìm ý chứ không do tìm từ; dùng linh hoạt từ nối, discourse markers." },
        { name: "Lexical Resource", band7: "Dùng từ vựng linh hoạt ở nhiều chủ đề; có từ ít phổ biến, thành ngữ dùng đúng ngữ cảnh; biết diễn đạt lại (paraphrase) hiệu quả." },
        { name: "Grammatical Range & Accuracy", band7: "Dùng nhiều cấu trúc phức khá linh hoạt; câu không lỗi xuất hiện thường xuyên dù vẫn còn một số lỗi." },
        { name: "Pronunciation", band7: "Dễ hiểu xuyên suốt; trọng âm, ngữ điệu, nối âm tương đối tự nhiên; giọng mẹ đẻ ít ảnh hưởng đến việc hiểu." },
      ],
    },
  ],
  roadmap: [
    { stage: "Giai đoạn 1 · Nền tảng", target: "0 → IELTS 4.0 (Pre-A1 → B1)", focus: "Phát âm IPA, 2.000 từ thông dụng, ngữ pháp cốt lõi (Unit Zero → B1 trong app). Nghe podcast chậm, đọc truyện graded readers." },
    { stage: "Giai đoạn 2 · Làm quen IELTS", target: "4.0 → 5.5 (B1 → B2)", focus: "Học từ vựng theo chủ đề thi (B2 trong app), làm quen 4 kỹ năng & dạng câu hỏi, luyện viết đoạn văn PEEL, Speaking Part 1–2." },
    { stage: "Giai đoạn 3 · Tăng tốc", target: "5.5 → 6.5 (B2)", focus: "Viết bài Task 1 & 2 hoàn chỉnh mỗi tuần, chữa lỗi; luyện đề Cambridge bấm giờ; mở rộng collocation; shadowing để cải thiện phát âm." },
    { stage: "Giai đoạn 4 · Về đích", target: "6.5 → 7.0+ (C1)", focus: "Hoàn thành C1 trong app; mỗi tuần 2 đề Listening/Reading full, 3 bài viết có chấm theo tiêu chí, mock Speaking với người yêu; sửa lỗi lặp lại." },
  ],
  tips: [
    "Học đều mỗi ngày 60–90 phút hiệu quả hơn học dồn 1 buổi 5 tiếng cuối tuần.",
    "Ôn thẻ từ vựng (SRS) mỗi ngày trước khi học bài mới — đừng để thẻ tồn đọng.",
    "Listening: luyện nghe chép chính tả (dictation) các đoạn khó; chú ý bẫy thông tin bị sửa lại (distractor).",
    "Reading: không đọc từng chữ — đọc lướt (skimming) lấy ý chính, quét (scanning) tìm từ khoá; True/False/Not Given cần phân biệt 'trái ngược' và 'không nhắc tới'.",
    "Writing: luôn dành 5 phút lập dàn ý và 5 phút soát lỗi; tránh học thuộc bài mẫu.",
    "Speaking: trả lời Part 1 dài 2–3 câu, Part 3 dùng công thức A-R-E-A; ghi âm lại để tự nghe.",
  ],
  writingPrompts: [
    { id: "t2-01", kind: "Task 2 · Opinion", minutes: 40, minWords: 250, text: "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?" },
    { id: "t2-02", kind: "Task 2 · Discussion", minutes: 40, minWords: 250, text: "Some people think that the best way to improve public health is by increasing the number of sports facilities. Others, however, think that this would have little effect and other measures are required. Discuss both views and give your own opinion." },
    { id: "t2-03", kind: "Task 2 · Advantages/Disadvantages", minutes: 40, minWords: 250, text: "Nowadays, more and more people decide to have children later in their life. What are the reasons for this? Do the advantages outweigh the disadvantages?" },
    { id: "t2-04", kind: "Task 2 · Problem/Solution", minutes: 40, minWords: 250, text: "In many cities, the use of private cars is increasing, causing traffic congestion and air pollution. What problems does this cause? What measures could be taken to solve them?" },
    { id: "t2-05", kind: "Task 2 · Two-part question", minutes: 40, minWords: 250, text: "Many young people today spend a lot of time on social media. Why is this the case? Is it a positive or negative development?" },
    { id: "t2-06", kind: "Task 2 · Opinion", minutes: 40, minWords: 250, text: "Learning a foreign language is more effective when you live in the country where it is spoken than when you study it at home. To what extent do you agree or disagree?" },
    { id: "t1-01", kind: "Task 1 · Line graph", minutes: 20, minWords: 150, text: "The line graph shows the percentage of households with internet access in three countries (Vietnam, Japan and the UK) between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", hint: "Tự giả định số liệu hợp lý: UK 25% → 96%, Japan 30% → 92%, Vietnam 2% → 75%." },
    { id: "t1-02", kind: "Task 1 · Process", minutes: 20, minWords: 150, text: "The diagram shows how coffee is produced, from harvesting the coffee cherries to packaging the final product. Summarise the information by selecting and reporting the main features.", hint: "Các bước: thu hoạch → phơi/sấy → xay vỏ → rang → làm nguội → xay bột → đóng gói. Dùng câu bị động và từ chỉ trình tự." },
  ],
  speakingPrompts: [
    "Part 1 · Do you work or are you a student? What do you like most about it?",
    "Part 1 · How do you usually spend your weekends? Has that changed since you were a child?",
    "Part 1 · Do you prefer to study alone or with other people? Why?",
    "Part 2 · Describe a person who has helped you achieve a goal. You should say: who this person is, what goal you had, how they helped you, and explain how you felt about their help.",
    "Part 2 · Describe a place you visited that you would like to go back to. You should say: where it is, when you went there, what you did there, and explain why you would like to return.",
    "Part 2 · Describe a skill you learned that took a long time. You should say: what the skill is, why you learned it, how you learned it, and explain how you feel about it now.",
    "Part 3 · Why do some people find it difficult to keep learning a new language?",
    "Part 3 · Do you think technology will replace teachers in the future?",
  ],
  checklist: [
    "Mở bài paraphrase đề và nêu rõ quan điểm/nội dung chính",
    "Mỗi đoạn thân bài có 1 ý trung tâm + giải thích + ví dụ cụ thể",
    "Dùng từ nối đa dạng, tự nhiên (không lặp Firstly/Secondly máy móc)",
    "Có ít nhất 3 collocation học thuật chính xác",
    "Có câu phức: mệnh đề quan hệ, điều kiện, bị động, nhượng bộ",
    "Đủ số từ tối thiểu (Task 1 ≥150, Task 2 ≥250)",
    "Đã soát lỗi: mạo từ, số nhiều, chia động từ, dấu câu",
    "Kết bài tóm tắt lại quan điểm, không thêm ý mới",
  ],
  resources: [
    "Cambridge IELTS 1–20 (Cambridge University Press) — đề thi thật, nguồn luyện đề quan trọng nhất",
    "ielts.org, takeielts.britishcouncil.org, ielts.idp.com — thông tin chính thức & đề mẫu miễn phí",
    "IELTS Simon (ielts-simon.com) và IELTS Liz (ieltsliz.com) — bài mẫu và mẹo theo từng dạng",
    "BBC Learning English, TED Talks, podcast 6 Minute English — luyện nghe",
    "The Guardian, BBC News, The Economist — đọc báo để lấy ý tưởng và collocation",
  ],
};

export const hsk: ExamGuide = {
  lang: "zh",
  name: "HSK · HSKK",
  target: "HSK 6 → HSK 7–9",
  intro:
    "HSK (汉语水平考试) là kỳ thi năng lực tiếng Trung quốc tế do Trung tâm Hợp tác Giao lưu Ngôn ngữ Trung – Ngoại (CLEC) tổ chức. Chuẩn mới HSK 3.0 (2021) gồm 9 cấp chia 3 giai đoạn: Sơ cấp (1–3), Trung cấp (4–6), Cao cấp (7–9). HSKK là kỳ thi khẩu ngữ đi kèm.",
  sections: [
    { name: "HSK 1", detail: "Nghe 20 + Đọc 20 câu · ~40 phút · đạt 120/200" },
    { name: "HSK 2", detail: "Nghe 35 + Đọc 25 câu · ~55 phút · đạt 120/200" },
    { name: "HSK 3", detail: "Nghe 40 + Đọc 30 + Viết 10 câu · ~90 phút · đạt 180/300" },
    { name: "HSK 4", detail: "Nghe 45 + Đọc 40 + Viết 15 câu · ~105 phút · đạt 180/300" },
    { name: "HSK 5", detail: "Nghe 45 + Đọc 45 + Viết 10 câu · ~125 phút · đạt 180/300" },
    { name: "HSK 6", detail: "Nghe 50 + Đọc 50 + Viết 1 bài (tóm tắt ~400 chữ) · ~140 phút · đạt 180/300" },
    { name: "HSK 7–9", detail: "Một bài thi chung: Nghe, Đọc, Viết, Dịch, Nói · ~210 phút · điểm số quyết định đạt cấp 7, 8 hay 9" },
    { name: "HSKK", detail: "Sơ cấp (≈HSK 1–2) · Trung cấp (≈HSK 3–4) · Cao cấp (≈HSK 5–6): nghe nhắc lại, đọc to, trả lời câu hỏi/nói theo chủ đề" },
  ],
  scoreNote:
    "Định dạng HSK 1–6 ở trên là định dạng đang dùng phổ biến; kỳ thi đang chuyển dần sang chuẩn HSK 3.0. Luôn kiểm tra định dạng & lịch thi mới nhất tại chinesetest.cn trước khi đăng ký.",
  table: {
    head: ["Cấp", "Chữ Hán", "Từ vựng", "Ngữ pháp", "≈ CEFR"],
    rows: [
      ["HSK 1", "300", "500", "48", "A1"],
      ["HSK 2", "600", "1.272", "129", "A2"],
      ["HSK 3", "900", "2.245", "210", "A2+/B1"],
      ["HSK 4", "1.200", "3.245", "286", "B1"],
      ["HSK 5", "1.500", "4.316", "357", "B2"],
      ["HSK 6", "1.800", "5.456", "424", "B2+/C1"],
      ["HSK 7–9", "3.000", "11.092", "572", "C1–C2"],
    ],
    note: "Số liệu cộng dồn theo chuẩn 国际中文教育中文水平等级标准 (HSK 3.0). Quy đổi CEFR chỉ mang tính tham khảo.",
  },
  criteria: [
    {
      title: "HSK 6 · Phần Viết (缩写 – tóm tắt)",
      items: [
        { name: "Nội dung", band7: "Giữ đủ các ý chính, nhân vật, diễn biến của bài gốc; không thêm bình luận cá nhân." },
        { name: "Bố cục", band7: "Có tiêu đề, mở – thân – kết rõ ràng, trình tự hợp lý, độ dài khoảng 400 chữ." },
        { name: "Ngôn ngữ", band7: "Câu đúng ngữ pháp, dùng từ chính xác, chữ Hán viết đúng; diễn đạt bằng lời của mình." },
      ],
    },
    {
      title: "HSKK Cao cấp · Nói",
      items: [
        { name: "Phát âm & thanh điệu", band7: "Thanh điệu chuẩn, biến điệu đúng, ngữ điệu tự nhiên, người nghe không phải đoán." },
        { name: "Độ trôi chảy", band7: "Nói liền mạch khoảng 2 phút mỗi câu, ít ngắt quãng vô nghĩa." },
        { name: "Nội dung & lập luận", band7: "Trả lời đúng trọng tâm, có quan điểm, luận điểm, ví dụ và kết luận." },
        { name: "Từ vựng & ngữ pháp", band7: "Dùng từ nối, cấu trúc phức (之所以…是因为…, 一方面…另一方面…) và thành ngữ phù hợp." },
      ],
    },
  ],
  roadmap: [
    { stage: "Giai đoạn 1 · Sơ cấp", target: "0 → HSK 3", focus: "Pinyin & thanh điệu chuẩn ngay từ đầu, 900 chữ / 2.245 từ, ngữ pháp 把/被/bổ ngữ. Học Zero → HSK 3 trong app, mỗi ngày viết 10 chữ." },
    { stage: "Giai đoạn 2 · Trung cấp", target: "HSK 3 → HSK 4–5", focus: "Đọc đoạn văn dài, luyện nghe tin tức chậm, viết đoạn văn 150–300 chữ; thi HSKK Trung cấp." },
    { stage: "Giai đoạn 3 · Trung cao cấp", target: "HSK 5 → HSK 6", focus: "Đọc báo, xem phim không phụ đề, luyện tóm tắt (缩写), học thành ngữ & văn viết; thi HSKK Cao cấp." },
    { stage: "Giai đoạn 4 · Cao cấp", target: "HSK 6 → HSK 7–9", focus: "Luyện dịch Trung – Việt, nghị luận, thuyết trình học thuật; đọc văn học, báo chí chuyên sâu." },
  ],
  tips: [
    "Âm Hán Việt là 'siêu năng lực' của người Việt — luôn tra âm Hán Việt khi học từ mới.",
    "Học chữ Hán theo bộ thủ và chữ hình thanh, không học vẹt từng nét.",
    "Luyện thanh điệu bằng cách ghi âm và so sánh với giọng chuẩn (nút 🔊 trong app).",
    "Mỗi ngày ôn thẻ SRS; thêm cả câu ví dụ để nhớ từ trong ngữ cảnh.",
    "Đọc to (shadowing) hội thoại/bài đọc 3 lần mỗi ngày giúp phản xạ và ngữ điệu tự nhiên.",
    "Từ HSK 4: tập viết tay hoặc gõ pinyin đều đặn; thi trên máy tính dùng bộ gõ pinyin.",
  ],
  writingPrompts: [
    { id: "zh-w-01", kind: "HSK 3–4 · Đoạn văn", minutes: 15, minWords: 80, text: "请用80字左右介绍一下你的家庭。", hint: "Giới thiệu gia đình khoảng 80 chữ: có mấy người, mỗi người làm gì, tính cách." },
    { id: "zh-w-02", kind: "HSK 4 · Đoạn văn", minutes: 20, minWords: 100, text: "请写一段话，介绍你最喜欢的一个城市，并说明原因。", hint: "Thành phố yêu thích và lý do (dùng 因为…所以…, 不但…而且…)." },
    { id: "zh-w-03", kind: "HSK 5 · Viết theo từ cho sẵn", minutes: 25, minWords: 80, text: "请用以下词语写一篇80字左右的短文：坚持、压力、放松、习惯、健康。", hint: "Dùng đủ 5 từ: 坚持 (kiên trì), 压力 (áp lực), 放松 (thư giãn), 习惯 (thói quen), 健康 (sức khoẻ)." },
    { id: "zh-w-04", kind: "HSK 5 · Viết theo tranh/chủ đề", minutes: 25, minWords: 80, text: "请以“我们的第一次约会”为题，写一篇80字左右的短文。", hint: "Kể buổi hẹn hò đầu tiên của hai bạn." },
    { id: "zh-w-05", kind: "HSK 6 · Nghị luận", minutes: 35, minWords: 400, text: "有人说“学历比能力更重要”，你同意吗？请写一篇400字左右的文章，谈谈你的看法。", hint: "Dùng 固然…但…, 一方面…另一方面…, 之所以…是因为…, 综上所述." },
    { id: "zh-w-06", kind: "HSK 6 · Nghị luận", minutes: 35, minWords: 400, text: "随着科技的发展，人们越来越依赖手机。请谈谈手机给我们的生活带来的影响。", hint: "Mở bài bằng 随着…; phân tích lợi – hại; kết luận và đề xuất." },
  ],
  speakingPrompts: [
    "HSKK Sơ cấp · 请介绍一下你自己。(Giới thiệu bản thân)",
    "HSKK Sơ cấp · 你周末一般做什么？(Cuối tuần bạn thường làm gì?)",
    "HSKK Trung cấp · 请说说你最难忘的一次旅行。(Chuyến du lịch khó quên nhất)",
    "HSKK Trung cấp · 你觉得学汉语最难的是什么？为什么？",
    "HSKK Cao cấp · 你认为幸福是什么？请谈谈你的看法。",
    "HSKK Cao cấp · 有人说“网络让人与人之间的距离更远了”，你怎么看？",
    "HSKK Cao cấp · 如果你有一个月的假期，你会怎么安排？为什么？",
  ],
  checklist: [
    "Đúng số chữ yêu cầu (đếm chữ Hán, không đếm dấu câu)",
    "Có câu mở đầu nêu chủ đề / quan điểm",
    "Dùng ít nhất 2 cặp liên từ (因为…所以…, 虽然…但是…, 不但…而且…)",
    "Không viết sai chữ đồng âm (的/得/地, 在/再, 做/作)",
    "Dùng từ vựng đúng cấp độ mục tiêu",
    "Có câu kết thúc / kết luận",
    "Dấu câu tiếng Trung đúng (，。、！？“”)",
  ],
  resources: [
    "chinesetest.cn — trang chính thức: lịch thi, định dạng, đề mẫu",
    "HSK Standard Course (HSK标准教程) 1–6 — BLCUP, bám sát đề thi",
    "Pleco — từ điển tiếng Trung tốt nhất trên điện thoại (có nét viết, ví dụ)",
    "Du Chinese, The Chairman's Bao — bài đọc theo cấp độ HSK có pinyin",
    "Bilibili, Youku, kênh YouTube Mandarin Corner — luyện nghe tự nhiên",
  ],
};

export const exams: Record<Lang, ExamGuide> = { en: ielts, zh: hsk };
