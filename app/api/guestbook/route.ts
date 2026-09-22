import { NextResponse } from "next/server";
import { Resend } from "resend";
import { config } from "@/lib/config";

export const runtime = "nodejs";

const MAX_MESSAGE = 1500;

/**
 * Giới hạn tần suất đơn giản trong bộ nhớ: mỗi IP tối đa 5 lượt / 10 phút.
 * Đủ chặn spam vặt cho một trang mời cá nhân. Bộ nhớ này reset khi
 * serverless function được khởi tạo lại — chấp nhận được với quy mô này.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Dọn các IP đã hết hạn để Map không phình mãi
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

/** Chặn HTML injection khi nhúng nội dung người dùng vào email. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const owner = process.env.OWNER_EMAIL;

  if (!apiKey || !owner) {
    console.error("Thiếu biến môi trường RESEND_API_KEY hoặc OWNER_EMAIL");
    return NextResponse.json(
      { error: "Máy chủ chưa được cấu hình gửi email. Bạn báo giúp chủ nhân trang nhé." },
      { status: 500 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Bạn đã gửi khá nhiều lời nhắn rồi. Thử lại sau ít phút nhé!" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  // Bẫy bot: trường ẩn có nội dung nghĩa là bot điền tự động.
  // Trả về 200 để bot tưởng thành công và không thử lại.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().slice(0, 120);
  const relation = String(body.relation ?? "").trim().slice(0, 60);
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);

  if (!name || !message) {
    return NextResponse.json(
      { error: "Bạn vui lòng điền tên và lời nhắn nhé." },
      { status: 400 },
    );
  }

  if (email && !isEmail(email)) {
    return NextResponse.json({ error: "Địa chỉ email chưa đúng định dạng." }, { status: 400 });
  }

  const sentAt = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());

  // Email dùng màu đặc và inline style: nhiều ứng dụng mail (nhất là Outlook)
  // bỏ qua màu có kênh alpha, gradient và thẻ <style>.
  const html = `
<div style="margin:0;padding:32px 16px;background:#0b0d18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#141726;border:1px solid #2a2e42;border-radius:20px;overflow:hidden;">
    <div style="padding:28px 32px;background:#e9c46a;background:linear-gradient(135deg,#e9c46a,#8b7cf6);">
      <div style="font-size:28px;line-height:1;">🎓</div>
      <div style="margin-top:10px;font-size:19px;font-weight:700;color:#1a1305;">
        Một lời lưu bút mới
      </div>
      <div style="margin-top:4px;font-size:13px;color:#3a2c0c;">${escapeHtml(sentAt)}</div>
    </div>

    <div style="padding:30px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#9aa2bd;width:120px;">Người gửi</td>
          <td style="padding:8px 0;font-weight:600;color:#ffd98a;">${escapeHtml(name)}</td>
        </tr>
        ${
          relation
            ? `<tr>
          <td style="padding:8px 0;color:#9aa2bd;">Quan hệ</td>
          <td style="padding:8px 0;color:#e8eaf4;">${escapeHtml(relation)}</td>
        </tr>`
            : ""
        }
        ${
          email
            ? `<tr>
          <td style="padding:8px 0;color:#9aa2bd;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#56cfe1;text-decoration:none;">${escapeHtml(email)}</a></td>
        </tr>`
            : ""
        }
      </table>

      <div style="margin:26px 0 0;padding:22px 24px;background:#1b1f31;border-left:3px solid #e9c46a;border-radius:0 14px 14px 0;">
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#e9c46a;margin-bottom:12px;">
          Lời nhắn
        </div>
        <div style="font-size:16px;line-height:1.75;color:#eef0f8;white-space:pre-wrap;">${escapeHtml(message)}</div>
      </div>

      ${
        email
          ? `<div style="margin-top:26px;text-align:center;">
        <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent("Cảm ơn bạn đã gửi lưu bút")}"
           style="display:inline-block;padding:13px 28px;background:#e9c46a;color:#241a05;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">
          Trả lời ${escapeHtml(name)}
        </a>
      </div>`
          : ""
      }
    </div>

    <div style="padding:18px 32px;border-top:1px solid #2a2e42;font-size:12px;color:#6b7392;text-align:center;">
      Gửi từ trang mời lễ tốt nghiệp của ${escapeHtml(config.name)}
    </div>
  </div>
</div>`.trim();

  const text = [
    `LỜI LƯU BÚT MỚI — ${sentAt}`,
    "",
    `Người gửi: ${name}`,
    relation ? `Quan hệ: ${relation}` : null,
    email ? `Email: ${email}` : null,
    "",
    "Lời nhắn:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: process.env.MAIL_FROM ?? "Luu But Tot Nghiep <onboarding@resend.dev>",
      to: [owner],
      subject: `💌 Lưu bút từ ${name}`,
      html,
      text,
      // Bấm "Trả lời" trong hộp thư sẽ gửi thẳng tới khách
      ...(email ? { replyTo: email } : {}),
    });

    if (error) {
      console.error("Resend trả về lỗi:", error);
      return NextResponse.json(
        { error: "Không gửi được email lúc này. Bạn thử lại sau ít phút nhé." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lỗi khi gọi Resend:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía máy chủ. Bạn thử lại sau nhé." },
      { status: 500 },
    );
  }
}
