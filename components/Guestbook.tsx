"use client";

import { useState, type FormEvent } from "react";
import { fireConfetti } from "./Confetti";

const MAX_MESSAGE = 1500;

const RELATIONS = [
  "Một ngày bình thường có nắng và gió, trăng và sao",
  "Bình nguyên vô tận/ Summoner's Rift",
  "Ngôi nhà thứ hai, thứ ba, thứ n....",
  "Học sinh (cưng)",
  "Gia đình",
  "Nhớ thế nào được chời",
];

type Status = { kind: "idle" | "sending" | "error"; text?: string } | { kind: "sent" };

export default function Guestbook() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      relation: String(data.get("relation") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      // Trường bẫy bot: người thật không nhìn thấy nên luôn để trống
      website: String(data.get("website") ?? ""),
    };

    if (!payload.name || !payload.message) {
      setStatus({ kind: "error", text: "Bạn vui lòng điền tên và lời nhắn nhé." });
      return;
    }

    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({
          kind: "error",
          text: body?.error ?? "Gửi không thành công. Bạn thử lại sau ít phút nhé.",
        });
        return;
      }

      setStatus({ kind: "sent" });
      fireConfetti({ count: 190, originY: 0.8 });
    } catch {
      setStatus({
        kind: "error",
        text: "Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại giúp mình nhé.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="guestbook">
        <div className="thanks">
          <span className="thanks-icon" aria-hidden="true">
            💌
          </span>
          <h3>Lời nhờ vả cuối cùng</h3>
          <p>
            Do người thân không được vào hội trường nên mình không nắm được cụ thể khi nào bạn đến. Vậy nên hãy liên lạc với mình khi tới nơi để mình có thể tiếp đón nhaa.
          </p>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMessage("");
              setStatus({ kind: "idle" });
            }}
          >
            Viết thêm một lời nữa
          </button>
        </div>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const nearLimit = message.length > MAX_MESSAGE * 0.9;

  return (
    <form className="guestbook" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor="gb-name">
            Tên của bạn <span className="req">*</span>
          </label>
          <input
            id="gb-name"
            name="name"
            className="input"
            placeholder="<3"
            maxLength={80}
            required
            autoComplete="name"
            disabled={sending}
          />
        </div>

        <div className="field">
          <label htmlFor="gb-email">Email của bạn</label>
          <input
            id="gb-email"
            name="email"
            type="email"
            className="input"
            placeholder="..."
            maxLength={120}
            autoComplete="email"
            disabled={sending}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="gb-relation">Bạn và mình quen nhau thế nào?</label>
        <select id="gb-relation" name="relation" className="select" defaultValue="" disabled={sending}>
          <option value="">—</option>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="gb-message">
          Lời lưu bút <span className="req">*</span>
        </label>
        <textarea
          id="gb-message"
          name="message"
          className="textarea"
          placeholder="Khi không có thì cứ muốn nhiều, khi có nhiều thì lại lo mất, chúng ta cứ chạy theo vật chất mà vẫn muốn được sống tự do nhất..."
          maxLength={MAX_MESSAGE}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
        <div className={`counter ${nearLimit ? "warn" : ""}`}>
          {message.length} / {MAX_MESSAGE}
        </div>
      </div>

      {/* Bẫy bot — trình duyệt của người thật không hiển thị trường này */}
      <input
        className="hp"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="btn-row">
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Đang gửi..." : "Gửi lời lưu bút 💌"}
        </button>
      </div>

      {status.kind === "error" && (
        <p className="form-status err" role="alert">
          {status.text}
        </p>
      )}
    </form>
  );
}
