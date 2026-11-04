# 💜 Học Cùng Nhau

Web app học ngoại ngữ cho **hai người**: một người học **Tiếng Anh (CEFR Pre-A1 → C1 · IELTS 7.0+)**, một người học **Tiếng Trung (HSK 0 → HSK 6, hướng tới HSK 7–9)**. Có mật khẩu riêng cho từng người, tiến độ lưu trên database (Postgres, MongoDB hoặc Redis) và hai người xem được tiến độ của nhau.

## ✨ Tính năng

| | |
|---|---|
| 📚 **Giáo trình theo khung chuẩn** | 46 bài tiếng Anh (6 cấp CEFR) + 54 bài tiếng Trung (Nhập môn + HSK 1–6). Mỗi bài: mục tiêu Can-do, ~10 từ vựng (IPA / pinyin + **âm Hán Việt**), ngữ pháp giải thích bằng tiếng Việt, hội thoại hoặc bài đọc, luyện tập, nói & viết |
| 🏷️ **Nhãn cấp độ chính thức** | Mỗi từ hiện cấp CEFR (theo CEFR-J, ĐH Ngoại ngữ Tokyo) hoặc cấp HSK 3.0 / 2.0 (theo danh sách chính thức) |
| 🦉 **Bài tập kiểu Duolingo** | Ghép cặp, chọn nghĩa, nghe – chọn, xếp câu (word bank), nghe – chép, nói theo; 5 ❤️, chuỗi đúng liên tiếp, âm thanh đúng/sai |
| 🎤 **Luyện phát âm kiểu ELSA** | Nghe mẫu / nghe chậm 🐢 → ghi âm → tô màu từng từ (xanh = chuẩn, đỏ = cần sửa) + điểm %. Cặp âm dễ nhầm của người Việt (ship/sheep, th, l/r, âm cuối…) và thanh điệu, zh/z, j/q/x tiếng Trung |
| 🃏 **Ôn tập SRS** | Thẻ từ vựng lặp lại ngắt quãng (thuật toán SM-2 như Anki), chiều xuôi/ngược, phím tắt |
| ⚡ **Luyện nhanh 5 phút** | Phiên bài tập trộn từ & câu đã học, ưu tiên từ hay quên |
| 🎯 **Luyện thi** | Cẩm nang IELTS (định dạng, tiêu chí band 7, lộ trình) & HSK/HSKK (bảng chuẩn HSK 3.0), phòng viết bấm giờ + checklist tự chấm, phòng luyện nói |
| 💞 **Học cặp đôi** | Bảng tiến độ hai người, biểu đồ XP 7 ngày, chuỗi ngày học 🔥, lời nhắn động viên |
| 📱 **Dùng trên điện thoại** | Giao diện mobile, chế độ tối, thêm vào màn hình chính như app (PWA) |

Phát âm và nhận diện giọng nói dùng Web Speech API có sẵn trong trình duyệt (Chrome / Edge / Safari) — **miễn phí, không cần API key**.

## 📖 Giáo trình dựa vào đâu?

- **Khung chương trình**: CEFR (Council of Europe) ↔ IELTS band; Tiêu chuẩn HSK 3.0 *国际中文教育中文水平等级标准* (GF 0025-2021).
- **Nội dung bài** (giải thích, ví dụ, hội thoại, bài đọc, bài tập): biên soạn riêng theo khung trên, **không sao chép** sách có bản quyền.
- **Đối chiếu bằng dữ liệu mở**: [CEFR-J Wordlist](https://github.com/openlanguageprofiles/olp-en-cefrj) (Tono Lab, Tokyo University of Foreign Studies) · Octanove C1/C2 (CC BY-SA 4.0) · [Complete HSK Vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT, từ danh sách HSK chính thức + CC-CEDICT).
- **Khoá mở nên học song song**: MIT OCW 21G.223 (phát âm), 21G.222 (viết học thuật), 21G.101 (tiếng Trung) — CC BY-NC-SA; Peking University *Chinese for Beginners* (Coursera).
- Chi tiết + giới hạn: xem trang **/sources** trong app.

> Nội dung do AI biên soạn, chưa qua giáo viên bản ngữ duyệt. Mỗi bài có ~10 từ cốt lõi — hãy học kèm giáo trình gợi ý ở từng cấp độ để đủ vốn từ cho IELTS 7.0 / HSK 6.

## 🚀 Deploy lên Vercel

1. **Import repo**: Vercel → *Add New… → Project* → chọn repo này → Deploy (framework Next.js tự nhận).
2. **Biến môi trường** (*Settings → Environment Variables*):

   | Biến | Bắt buộc | Ý nghĩa |
   |---|---|---|
   | `USER1_PASSWORD` | ✅ | Mật khẩu người 1 (mặc định học tiếng Anh) |
   | `USER2_PASSWORD` | ✅ | Mật khẩu người 2 (mặc định học tiếng Trung) |
   | `AUTH_SECRET` | ✅ | Chuỗi ngẫu nhiên ≥ 32 ký tự để ký cookie |
   | `USER1_NAME`, `USER2_NAME` | | Tên hiển thị mặc định (đổi được trong app) |
   | `USER1_LANG`, `USER2_LANG` | | `en` hoặc `zh` |

3. **Database (miễn phí)** — chọn MỘT trong ba, app tự nhận (ưu tiên Postgres → MongoDB → Redis):
   - **Neon Postgres** (khuyên dùng): [vercel.com/marketplace/neon](https://vercel.com/marketplace/neon) → vùng Singapore → Connect project. Tự thêm `DATABASE_URL`; bảng `hcn_kv` được tạo tự động.
   - **MongoDB Atlas**: [vercel.com/marketplace/mongodbatlas](https://vercel.com/marketplace/mongodbatlas) → cluster miễn phí M0 → Connect project. Tự thêm `MONGODB_URI`.
   - **Upstash Redis**: [vercel.com/marketplace/upstash](https://vercel.com/marketplace/upstash) → Connect project. Tự thêm `KV_REST_API_URL`, `KV_REST_API_TOKEN`.
4. **Redeploy** (*Deployments → … → Redeploy*) để nhận biến mới.

Chưa có database thì app vẫn chạy, tiến độ tạm lưu trên trình duyệt (có cảnh báo vàng trên trang chủ).

## 💻 Chạy trên máy

```bash
npm install
cp .env.example .env.local   # sửa mật khẩu
npm run dev                  # http://localhost:3000
```

Không có Redis khi chạy local → dữ liệu lưu tạm trong bộ nhớ server.

## 🗂️ Cấu trúc

```
src/content/en/*.ts, zh/*.ts   Giáo án từng cấp độ (dễ thêm bài mới)
src/content/exams.ts           Cẩm nang IELTS / HSK
src/content/pronunciation.ts   Bài luyện phát âm
src/content/official.ts        Cấp CEFR/HSK chính thức của từng từ (sinh tự động)
src/components/practice/       Bài tập kiểu Duolingo + chấm phát âm
src/lib/srs.ts                 Thuật toán lặp lại ngắt quãng
src/lib/storage.ts             Lưu trữ: Postgres / MongoDB / Redis (tự nhận)
src/proxy.ts                   Chặn truy cập khi chưa đăng nhập
```

### Thêm bài học

Mỗi bài là một `unit(...)` trong file cấp độ, dùng cú pháp rút gọn:

```ts
V("hello|/həˈləʊ/|interj|xin chào|Hello, I'm Minh.|Xin chào, mình là Minh.")   // từ tiếng Anh
Z("朋友|péngyou|bằng hữu|bạn bè|他是我的好朋友。|Cậu ấy là bạn thân của tôi.") // từ tiếng Trung (pinyin câu tự sinh)
mcq("I ___ Minh.", ["am", "is", "are"], "Giải thích")                           // đáp án đúng đặt đầu tiên
```

Kiểm tra giáo án sau khi sửa:

```bash
npm run check:content
```

Cập nhật nhãn cấp độ chính thức:

```bash
npx tsx scripts/dump-vocab.ts /tmp/mine.json && python3 scripts/official-levels.py /tmp/mine.json
```
