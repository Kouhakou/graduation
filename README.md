# 🎓 Thiệp mời lễ tốt nghiệp

Trang web mời bạn bè đến dự lễ tốt nghiệp, có hiệu ứng 3D và form lưu bút gửi thẳng
về email của bạn.

**Công nghệ:** Next.js 15 · TypeScript · Resend · không cần cơ sở dữ liệu.

---

## 1. Chạy thử trên máy

```bash
npm install
```

Tạo file `.env.local` bằng cách chép từ mẫu:

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền:

| Biến | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `RESEND_API_KEY` | ✅ | API key lấy tại [resend.com/api-keys](https://resend.com/api-keys) (miễn phí 3.000 email/tháng) |
| `OWNER_EMAIL` | ✅ | Email của bạn — nơi nhận lời lưu bút |
| `MAIL_FROM` | — | Địa chỉ gửi đi. Để nguyên mặc định nếu chưa có tên miền riêng |

Rồi chạy:

```bash
npm run dev
```

Mở http://localhost:3000

> Nếu chưa điền `RESEND_API_KEY`, trang vẫn hiển thị bình thường — chỉ nút gửi lưu bút
> báo lỗi. Tất cả phần còn lại xem thử được ngay.

---

## 2. Sửa nội dung của bạn

Mở **`lib/config.ts`** — toàn bộ thông tin cá nhân nằm gọn trong một file:

- `name` — tên bạn (chữ lớn ở màn hình đầu)
- `degree`, `school`, `classOf` — bằng cấp, trường, khoá
- `eventISO` — thời điểm làm lễ, **dùng cho đồng hồ đếm ngược**
- `event` — ngày/giờ/địa điểm/trang phục hiển thị trong phần chi tiết
- `message` — lời nhắn cá nhân (mỗi phần tử là một dòng)
- `milestones` — các mốc trong phần "Chặng đường đã qua"
- `contact` — số điện thoại, email ở cuối trang

### Lưu ý về `eventISO`

Đây là chuỗi ngày giờ chuẩn ISO kèm múi giờ Việt Nam:

```ts
eventISO: "2026-11-20T08:30:00+07:00"
//         năm-tháng-ngày  giờ:phút:giây  múi giờ VN
```

Đếm ngược sẽ tự tính từ thời điểm này. Khi tới ngày, trang tự đổi sang lời chúc mừng.

`event.dateText` và `event.timeText` là phần chữ hiển thị — bạn viết tự do, nhưng nhớ
sửa cho khớp với `eventISO`.

---

## 3. Deploy lên Vercel (miễn phí)

**Bước 1 — Lấy Resend API key**

1. Đăng ký tại [resend.com](https://resend.com) (miễn phí, không cần thẻ)
2. Vào **API Keys** → **Create API Key** → chép chuỗi bắt đầu bằng `re_`

**Bước 2 — Đưa code lên GitHub**

```bash
git init
git add .
git commit -m "Trang mời lễ tốt nghiệp"
```

Tạo một repository mới trên GitHub rồi:

```bash
git remote add origin https://github.com/<tên-github>/<tên-repo>.git
git branch -M main
git push -u origin main
```

**Bước 3 — Deploy**

1. Vào [vercel.com/new](https://vercel.com/new), đăng nhập bằng GitHub
2. Chọn repository vừa tạo → **Import**
3. Mở mục **Environment Variables**, thêm:
   - `RESEND_API_KEY` = key vừa lấy ở bước 1
   - `OWNER_EMAIL` = email nhận lưu bút của bạn
4. Bấm **Deploy**

Khoảng một phút sau bạn sẽ có link dạng `ten-repo.vercel.app` — gửi cho bạn bè là xong.

> **Quan trọng:** phải thêm biến môi trường *trước* khi deploy. Nếu quên, vào
> **Settings → Environment Variables** thêm vào rồi **Deployments → Redeploy**.

---

## 4. Gửi email từ tên miền riêng (tuỳ chọn)

Mặc định email gửi từ `onboarding@resend.dev` — dùng được ngay nhưng dễ rơi vào hộp
thư rác, và chỉ gửi được tới chính email bạn đã đăng ký Resend.

Nếu bạn có tên miền riêng:

1. Resend → **Domains** → **Add Domain**
2. Thêm các bản ghi DNS mà Resend đưa ra vào nhà cung cấp tên miền
3. Chờ verify xong, đặt thêm biến `MAIL_FROM`:

```
MAIL_FROM=Lưu bút <luubut@tenmiencuaban.com>
```

---

## 5. Cấu trúc thư mục

```
app/
  layout.tsx              Font chữ, metadata, thẻ <html>
  page.tsx                Ghép các phần của trang
  globals.css             Toàn bộ hiệu ứng và giao diện
  icon.svg                Favicon
  api/guestbook/route.ts  Nhận lưu bút và gửi email
components/
  Starfield.tsx           Nền sao có parallax theo chuột và cuộn trang
  Hero.tsx                Thẻ mời nghiêng 3D theo con trỏ
  Countdown.tsx           Đồng hồ đếm ngược
  Guestbook.tsx           Form lưu bút
  Confetti.tsx            Pháo giấy
  Reveal.tsx              Hiệu ứng hiện dần khi cuộn tới
lib/
  config.ts               ⭐ Thông tin cá nhân của bạn
public/                   Nơi để ảnh nếu bạn muốn thêm
```

---

## 6. Các hiệu ứng có sẵn

| Hiệu ứng | Nơi xuất hiện |
| --- | --- |
| Nền sao parallax theo chuột và cuộn trang | Toàn trang |
| Thẻ mời nghiêng 3D, vệt sáng chạy theo con trỏ | Màn đầu |
| Chữ tên ánh kim chuyển màu | Màn đầu |
| Vòng ánh sáng xoay | Màn đầu |
| Mũ tốt nghiệp bồng bềnh | Màn đầu |
| Pháo giấy | Khi bấm "Viết lưu bút" và khi gửi thành công |
| Hiện dần khi cuộn tới, có độ trễ xếp lớp | Mọi phần |
| Ô đếm ngược lật 3D khi rê chuột, nhịp đập mỗi giây | Phần đếm ngược |
| Thẻ kính mờ nổi lên khi rê chuột | Phần chi tiết |
| Đường thời gian phát sáng | Phần hành trình |

Trang tự tắt hiệu ứng chuyển động nếu máy người xem bật chế độ
*giảm chuyển động* (`prefers-reduced-motion`).

---

## 7. Chống spam

Form đã có sẵn ba lớp bảo vệ, không cần cấu hình gì thêm:

- **Trường bẫy bot** ẩn — bot điền vào thì bị bỏ qua lặng lẽ
- **Giới hạn tần suất** — mỗi IP tối đa 5 lượt / 10 phút
- **Lọc nội dung** — mọi ký tự HTML trong lưu bút được vô hiệu hoá trước khi vào email

---

## 8. Câu hỏi thường gặp

**Không nhận được email?**
Kiểm tra hộp thư rác. Nếu dùng `onboarding@resend.dev`, Resend chỉ cho gửi tới chính
email bạn đã đăng ký tài khoản — muốn gửi tới địa chỉ khác thì phải thêm tên miền riêng
(mục 4).

**Muốn xem lại những lưu bút đã nhận?**
Tất cả nằm trong hộp thư của bạn, tiêu đề dạng `💌 Lưu bút từ [tên]`. Tạo một nhãn/bộ lọc
trong Gmail để gom lại một chỗ.

**Muốn trả lời người gửi?**
Bấm **Reply** ngay trong email — nếu khách có điền email, thư trả lời sẽ tự gửi đúng địa chỉ họ.

**Muốn đổi màu chủ đạo?**
Mở `app/globals.css`, sửa các biến ở đầu file (`--gold`, `--violet`, `--cyan`, `--bg`).
