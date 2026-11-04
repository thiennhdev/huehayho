import type { Metadata } from "next";
import { courses } from "@/content";
import { CEFR_LEVEL, HSK_LEVEL } from "@/content/official";

export const metadata: Metadata = { title: "Nguồn giáo trình" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-lg font-extrabold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Src({ name, by, license, url, use }: { name: string; by: string; license: string; url: string; use: string }) {
  return (
    <div className="rounded-xl bg-bg p-3">
      <a href={url} target="_blank" rel="noreferrer" className="font-bold text-brand hover:underline">
        {name} ↗
      </a>
      <div className="text-xs text-muted">
        {by} · <b>{license}</b>
      </div>
      <div className="mt-1">{use}</div>
    </div>
  );
}

export default function SourcesPage() {
  const count = (lang: "en" | "zh") => courses[lang].levels.reduce((a, l) => a + l.units.reduce((b, u) => b + u.vocab.length, 0), 0);
  const enVocab = count("en");
  const zhVocab = count("zh");
  const enTagged = Object.keys(CEFR_LEVEL).length;
  const zhTagged = Object.keys(HSK_LEVEL).length;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold">📖 Nguồn giáo trình & phương pháp</h1>
        <p className="text-sm text-muted">Giáo án này dựa vào đâu, đã đối chiếu với gì, và nên học thêm ở đâu.</p>
      </div>

      <Section title="Tóm tắt minh bạch">
        <p>
          <b>Khung chương trình</b> theo chuẩn quốc tế chính thức: CEFR (Hội đồng châu Âu) ↔ thang điểm IELTS cho tiếng Anh, và Tiêu chuẩn HSK 3.0 (国际中文教育中文水平等级标准, 2021) cho tiếng Trung.
        </p>
        <p>
          <b>Nội dung từng bài</b> (giải thích ngữ pháp bằng tiếng Việt, câu ví dụ, hội thoại, bài đọc, bài tập) được biên soạn riêng cho app theo khung trên — <b>không sao chép</b> sách giáo khoa có bản quyền (English File, HSK Standard Course… chỉ được giới thiệu để học song song).
        </p>
        <p>
          <b>Từ vựng đã được đối chiếu tự động</b> với danh sách mở của trường đại học và danh sách chính thức: {enTagged}/{enVocab} từ tiếng Anh có cấp CEFR theo CEFR-J (ĐH Ngoại ngữ Tokyo) — phần còn lại chủ yếu là từ học thuật IELTS; {zhTagged}/{zhVocab} từ tiếng Trung có trong danh sách HSK chính thức. Mỗi từ trong bài học đều hiện nhãn cấp độ (vd. <span className="rounded bg-en/10 px-1 text-xs font-semibold text-en">CEFR A2</span>,{" "}
          <span className="rounded bg-zh/10 px-1 text-xs font-semibold text-zh">HSK3.0·3 | HSK2.0·2</span>) để bạn tự kiểm chứng. Pinyin từ vựng được so khớp với pinyin trong danh sách HSK (CC-CEDICT): 0 sai lệch.
        </p>
        <p className="text-muted">
          Giới hạn: mỗi bài có ~10 từ cốt lõi (tổng ~1.000 từ mỗi ngôn ngữ), trong khi IELTS 7.0 cần vốn ~6.000–8.000 từ và HSK 6 cần 5.456 từ. App là <b>lộ trình xương sống + ôn tập SRS + luyện kỹ năng</b>; hãy học kèm giáo trình/khoá học bên dưới để đủ khối lượng. Nội dung do AI biên soạn và chưa qua giáo viên bản ngữ duyệt — nếu thấy chỗ nào sai, hãy ghi chú lại để sửa.
        </p>
      </Section>

      <Section title="🌍 Khung chuẩn & tiêu chí chính thức">
        <Src name="CEFR — Common European Framework of Reference" by="Council of Europe (Hội đồng châu Âu)" license="Công khai" url="https://www.coe.int/en/web/common-european-framework-reference-languages" use="Cấp độ Pre-A1 → C1 và mô tả năng lực 'Can-do' của từng cấp tiếng Anh." />
        <Src name="IELTS Band Descriptors (Writing & Speaking)" by="British Council · IDP · Cambridge University Press & Assessment" license="Công khai (bản quyền IELTS)" url="https://ielts.org" use="Tiêu chí chấm band 7 được tóm lược bằng tiếng Việt trong trang Luyện thi; quy đổi CEFR ↔ IELTS." />
        <Src name="国际中文教育中文水平等级标准 (HSK 3.0, GF 0025-2021)" by="Bộ Giáo dục & Uỷ ban Ngôn ngữ Văn tự Nhà nước Trung Quốc · CLEC" license="Tiêu chuẩn quốc gia, công khai" url="https://www.chinesetest.cn" use="Số chữ / từ / điểm ngữ pháp từng cấp 1–9, thứ tự điểm ngữ pháp trong giáo án tiếng Trung." />
      </Section>

      <Section title="🎓 Dữ liệu mở dùng để đối chiếu (đại học & cộng đồng)">
        <Src name="CEFR-J Wordlist v1.5 & CEFR-J Grammar Profile" by="Tono Laboratory, Tokyo University of Foreign Studies (Yukio Tono)" license="Miễn phí cho nghiên cứu & thương mại, yêu cầu trích dẫn" url="https://github.com/openlanguageprofiles/olp-en-cefrj" use="Gắn nhãn cấp CEFR cho từng từ tiếng Anh. Trích dẫn: The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies." />
        <Src name="Octanove Vocabulary Profile C1/C2" by="Octanove Labs" license="CC BY-SA 4.0" url="https://github.com/openlanguageprofiles/olp-en-cefrj" use="Cấp C1/C2 cho từ vựng nâng cao." />
        <Src name="Complete HSK Vocabulary (HSK 2.0 + HSK 3.0)" by="Yanis Zafirópulos (tổng hợp từ danh sách chính thức; nghĩa từ CC-CEDICT)" license="MIT License" url="https://github.com/drkameleon/complete-hsk-vocabulary" use="Gắn nhãn cấp HSK 3.0 / 2.0 cho từng từ tiếng Trung và kiểm tra pinyin." />
        <Src name="Hanzi Writer" by="David Chanin (mã nguồn mở)" license="MIT License" url="https://github.com/chanind/hanzi-writer" use="Hoạt hình thứ tự nét và chấm từng nét khi tập viết chữ Hán (chuột, cảm ứng, Apple Pencil)." />
        <Src name="Make Me a Hanzi → hanzi-writer-data" by="Shaunak Kishore; dữ liệu nét dựa trên phông Arphic" license="Arphic Public License" url="https://github.com/skishore/makemeahanzi" use="Dữ liệu đường nét & thứ tự viết của 677 chữ trong giáo án (chữ giản thể, theo thứ tự bút thuận Trung Quốc đại lục; có thể sai ở một số ít chữ)." />
        <Src name="Make Me a Hanzi — dictionary.txt" by="Shaunak Kishore" license="GNU LGPL v3" url="https://github.com/skishore/makemeahanzi" use="Dữ liệu chiết tự (cách tách bộ phận, bộ chỉ nghĩa / phần gợi âm, loại chữ) cho phần 🧠 Mẹo nhớ. Tên bộ thủ Hán Việt và câu chuyện ghi nhớ do app biên soạn thêm." />
        <Src name="pinyin-pro" by="zh-lx (mã nguồn mở)" license="MIT License" url="https://github.com/zh-lx/pinyin-pro" use="Sinh pinyin cho câu ví dụ, hội thoại, bài đọc (đã nạp pinyin chuẩn từ điển của từ vựng để đúng thanh nhẹ)." />
      </Section>

      <Section title="🏛️ Khoá học mở của các trường danh tiếng (học song song, miễn phí)">
        <Src name="MIT 21G.223 — Listening, Speaking, and Pronunciation" by="MIT OpenCourseWare" license="CC BY-NC-SA" url="https://ocw.mit.edu/courses/21g-223-listening-speaking-and-pronunciation-fall-2004/" use="Phát âm tiếng Anh (hệ âm Bắc Mỹ, trọng âm, nhịp, ngữ điệu) cho người học trình độ trung cao cấp — có video bài giảng. Hợp với giai đoạn B1–C1." />
        <Src name="MIT 21G.222 — Expository Writing for Bilingual Students" by="MIT OpenCourseWare" license="CC BY-NC-SA" url="https://ocw.mit.edu/courses/21g-222-expository-writing-for-bilingual-students-fall-2002/" use="Viết luận học thuật cho người song ngữ (essay, position paper) — bổ trợ IELTS Writing Task 2." />
        <Src name="MIT 21G.101 — Chinese I (Regular)" by="MIT OpenCourseWare (Julian K. Wheatley)" license="CC BY-NC-SA" url="https://ocw.mit.edu/courses/21g-101-chinese-i-regular-fall-2014/" use="Khoá tiếng Trung nhập môn của MIT: phát âm, pinyin, hội thoại cơ bản — học song song HSK 0–2." />
        <Src name="Chinese for Beginners / More Chinese for Beginners" by="Peking University (Đại học Bắc Kinh) trên Coursera" license="Miễn phí học dự thính (không phải giấy phép mở)" url="https://www.coursera.org/learn/learn-chinese" use="Khoá tiếng Trung nhập môn rất nổi tiếng (giảng viên Liu Xiaoyu), mạnh về phát âm và pinyin." />
        <p className="text-xs text-muted">
          Lưu ý bản quyền: hầu hết khoá ngoại ngữ của các trường (Harvard, Stanford, Yale, Bắc Đại, Thanh Hoa…) cho xem miễn phí nhưng <b>không cho phép sao chép</b> nội dung vào ứng dụng khác; còn MIT OCW cho phép tái sử dụng phi thương mại (CC BY-NC-SA) nhưng các khoá ngôn ngữ của MIT phần lớn dựa trên sách giáo khoa có bản quyền. Vì vậy app liên kết tới các khoá này thay vì chép lại.
        </p>
      </Section>

      <Section title="🧠 Phương pháp học được áp dụng">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Lặp lại ngắt quãng (SRS, thuật toán SM-2)</b> — cơ chế của Anki/SuperMemo: ôn đúng lúc sắp quên để nhớ dài hạn.</li>
          <li><b>Luyện truy xuất (retrieval practice)</b> — bài tập kiểu Duolingo: ghép cặp, nghe – chọn, xếp câu, nghe – chép, nói theo.</li>
          <li><b>Shadowing</b> — nghe mẫu và nói đuổi theo để cải thiện phát âm, ngữ điệu (luyện phát âm kiểu ELSA dùng nhận diện giọng nói).</li>
          <li><b>Đầu vào có ngữ cảnh</b> — mỗi từ có câu ví dụ; mỗi bài có hội thoại/bài đọc; âm Hán Việt cho người Việt học tiếng Trung.</li>
          <li><b>Học cặp đôi</b> — chuỗi ngày học, bảng tiến độ chung, lời nhắn động viên: trách nhiệm xã hội giúp duy trì thói quen.</li>
        </ul>
      </Section>
    </div>
  );
}
