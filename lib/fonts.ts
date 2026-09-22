import localFont from "next/font/local";

/**
 * Font được tự lưu trong repo (không tải từ Google lúc build) để tránh
 * lỗi build khi Vercel không kết nối được fonts.googleapis.com — từng
 * xảy ra và làm build thất bại giữa chừng.
 *
 * Mỗi file .woff2 đã được subset sẵn (qua tham số text= của Google Fonts)
 * để chứa toàn bộ chữ cái tiếng Việt có dấu (hoa + thường) và Latin cơ
 * bản — đủ dùng cho mọi nội dung tiếng Việt, không chỉ text hiện tại
 * trong lib/config.ts. Nhờ vậy chỉ cần 1 file/weight, không cần
 * unicode-range (next/font/local trong bản Next.js này chưa hỗ trợ).
 */

export const serif = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    { path: "../app/fonts/playfair-display/400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/playfair-display/500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/playfair-display/600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const sans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "../app/fonts/be-vietnam-pro/300-normal.woff2", weight: "300", style: "normal" },
    { path: "../app/fonts/be-vietnam-pro/400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/be-vietnam-pro/500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/be-vietnam-pro/600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/be-vietnam-pro/700-normal.woff2", weight: "700", style: "normal" },
  ],
});
