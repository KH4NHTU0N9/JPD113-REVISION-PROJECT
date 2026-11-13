# JPD113 · Bài 1 — Cheat Sheet Tương Tác, Quiz 20 Câu & Live Scoreboard

Ứng dụng web phục vụ buổi sinh hoạt ôn tập **JPD113 (Ngữ pháp sơ cấp – Bài 1)** trong **15 phút** theo mô hình 2 Phase tự vận hành:
- **Phase 1 (7 phút):** Tự ôn toàn bộ kiến thức Part 1, Part 2, Part 3 kèm bộ lọc bẫy biến âm, bài tập điền trợ từ, ghép cặp giao tiếp, "Soi Bug" *Jikoshoukai* và xưởng tự ghép câu tự động xử lý ngoại lệ.
- **Phase 2 (8 phút):** Làm đủ **20 câu Workbook** trong PDF, chấm điểm + tính thời gian thực phía máy chủ (Postgres RPC `SECURITY DEFINER`), và hiển thị **Live Scoreboard** sắp xếp theo `Điểm cao nhất → Thời gian nhanh nhất` để trao thưởng trực tiếp trên lớp.

---

## 1. Quản Trị Dự Án Theo Chuẩn 5 Phase

### Phase 1: Initiation (Khởi tạo)
- **Mục tiêu:** Chuyển đổi tài liệu PDF *JPD113 Bài 1 Cheat Sheet & Workbook* (20 trang) thành web tương tác tối ưu cho điện thoại và màn chiếu lớp học (≤ 30–200 người).
- **In-scope:**
  - Toàn bộ kiến thức Part 1 (Từ vựng, 18 quốc gia, ngoại lệ ngôn ngữ, cặp `きょうし/せんせい`, `かいしゃいん/[Công ty] の しゃいん`, 5 mẫu câu), Part 2 (Tuổi, Ngày 1–31, 12 Tháng), Part 3 (14 từ Sở thích & *Jikoshoukai*).
  - Toàn bộ 20 câu Workbook + giải thích chi tiết từng câu.
  - Scoreboard trực tiếp ưu tiên lượt thi đầu tiên (`Lượt 1`), hỗ trợ chiếu QR ngay trên web và xuất CSV.
- **Out-of-scope:** Đăng nhập tài khoản phức tạp, âm thanh TTS tự động trên lớp (tránh gây ồn và lỗi giọng `ja-JP` trên thiết bị di động).

### Phase 2: Planning (Lập kế hoạch & Sửa lỗi PDF gốc)
Các lỗi/bất nhất trong tài liệu PDF gốc đã được chuẩn hóa trước khi đưa vào dữ liệu ứng dụng:
1. **Lỗi công thức ngày sinh nhật (Trang 8, 10, 15):** PDF ghi cứng `[Tháng] がつ [Ngày] にち です` dễ khiến người học ghép sai thành `ようかにち` (trái với Câu 18 ở Trang 18). Web đã sửa thành `[Tháng] + [Ngày]` (không gắn `にち` cho ngày 1–10, 14, 20, 24).
2. **Lỗi khung tuổi *Jikoshoukai* (Trang 13, 15):** PDF ghi cứng `____ さいです` dễ gây nhầm `はたちさい`. Web tự động xử lý riêng `20 tuổi → はたちです`.
3. **Thiếu dữ liệu bảng ngày (Trang 9 vs Trang 2, 8):** PDF Trang 9 bỏ sót các ngày **17, 19, 27, 29** (`しち` / `く`). Web đã bổ sung đủ 31 ngày trong tháng.
4. **Thiếu kiến thức ở Câu 10 (Trang 16 vs Trang 3–15):** Đã bổ sung cặp `ありがとうございます → どういたしまして` vào Part 1.
5. **Thiếu bảng tổng kết cuối tài liệu (Trang 2 vs Trang 19):** Đã bổ sung bảng tổng kết *6 quy tắc vàng* ở cuối Phase 1.

### Phase 3: Execution (Thực thi)
- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`).
- **Backend & Anti-cheat:** Supabase Postgres + Row Level Security (RLS) + `SECURITY DEFINER` RPC (`start_quiz_attempt`, `submit_quiz_attempt`) + Supabase Realtime `postgres_changes`.
- **Fallback Mode:** Tự động chạy ở *Demo Local Mode* (`localStorage`) nếu chưa cấu hình biến môi trường Supabase.

### Phase 4: Monitoring & Verification (Kiểm thử)
- Bộ kiểm thử đơn vị bằng **Vitest** kiểm tra đồng bộ đáp án giữa Client Demo và `supabase/schema.sql`, kiểm tra quy tắc tiếng Nhật (`はたち`, ngày không kèm `にち`), logic phân hạng hòa điểm và chống CSV Formula Injection.
- Kiểm tra kiểu tĩnh `tsc --noEmit` và build đóng gói `vite build`.

### Phase 5: Closure (Triển khai)
- Đóng gói cấu hình `vercel.json` cho SPA routing (`/scoreboard`, `/quiz`) trên **Vercel Hobby (Free)**.

---

## 2. Hướng dẫn Cài đặt & Triển khai (Vercel Free + Supabase Free)

### Bước 1: Chạy thử ở máy cá nhân (Local)
```bash
npm install
npm run dev
```
Nếu chưa tạo file `.env.local`, web sẽ tự chạy ở chế độ **Demo Local** (lưu Scoreboard tạm trong trình duyệt).

### Bước 2: Thiết lập Supabase (Để 30 điện thoại gom điểm lên 1 Scoreboard chung)
1. Đăng nhập [Supabase](https://supabase.com/) và tạo 1 project gói **Free** (lưu ý: dự án Free tự tạm dừng sau 7 ngày không có traffic — nhớ kiểm tra lại sáng hôm lên lớp).
2. Mở **SQL Editor** trong Supabase Dashboard, dán toàn bộ nội dung file [`supabase/schema.sql`](./supabase/schema.sql) và bấm **Run**.
3. Vào **Project Settings → API** lấy `Project URL` (`VITE_SUPABASE_URL`) và `anon public key` (`VITE_SUPABASE_ANON_KEY`).
   > **Bảo mật:** Tuyệt đối chỉ dùng `anon` key ở Frontend, không dùng `service_role` key. Bảng đáp án `quiz_answer_key` đã được khóa hoàn toàn bằng RLS; mọi thao tác chấm điểm chạy qua hàm `SECURITY DEFINER` trên Postgres.

*(Nếu muốn xóa dữ liệu test trước khi vào lớp, chạy lệnh sau trong SQL Editor:)*
```sql
truncate table public.scoreboard_entries, public.quiz_attempts restart identity cascade;
```

### Bước 3: Deploy lên Vercel Free (Hobby Plan)
1. Đảm bảo repository nằm trong **tài khoản GitHub cá nhân** (Vercel Hobby không hỗ trợ import trực tiếp repo từ GitHub Organization).
2. Vào [Vercel](https://vercel.com/) → **Add New Project** → chọn repo `JPD113-REVISION-PROJECT`.
3. Tại mục **Environment Variables**, thêm 2 biến:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. File `vercel.json` đã cấu hình sẵn SPA rewrite để tải trực tiếp `/scoreboard` hoặc `/quiz` trên máy chiếu không bị lỗi 404.

---

## 3. Lệnh Kiểm Thử (Testing)

```bash
npm test
npm run typecheck
npm run build
```

---

## 4. Nguồn Tham Chiếu Kỹ Thuật
- Vite Getting Started: https://vite.dev/guide/
- Vercel Hobby Plan & Limits: https://vercel.com/docs/accounts/plans/hobby
- Vercel Vite SPA Rewrites: https://vercel.com/docs/frameworks/vite#using-vite-to-make-spas
- Supabase Database Functions (`SECURITY DEFINER` & RPC): https://supabase.com/docs/guides/database/functions
- Supabase Row Level Security (RLS): https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Tofugu — Counting Age (`歳`) & Days (`日`): https://www.tofugu.com/japanese/japanese-counter-sai/ | https://www.tofugu.com/japanese/japanese-counter-ka-nichi/
