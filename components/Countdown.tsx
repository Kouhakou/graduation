"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";

type Parts = { d: number; h: number; m: number; s: number };

const TARGET = new Date(config.eventISO).getTime();

function remaining(): Parts | null {
  const diff = TARGET - Date.now();
  if (Number.isNaN(TARGET)) return null;
  if (diff <= 0) return null;

  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Đồng hồ đếm ngược tới giờ làm lễ.
 * Chỉ tính giờ sau khi component gắn vào DOM để server và client
 * không render ra hai con số khác nhau.
 */
export default function Countdown() {
  const [parts, setParts] = useState<Parts | null>(null);
  const [mounted, setMounted] = useState(false);
  const secondRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    setParts(remaining());

    const id = window.setInterval(() => {
      setParts(remaining());

      // Kích lại hiệu ứng nhịp đập ở ô giây
      const el = secondRef.current;
      if (el) {
        el.classList.remove("cd-tick");
        void el.offsetWidth; // ép trình duyệt tính lại layout để animation chạy lại
        el.classList.add("cd-tick");
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  if (mounted && parts === null) {
    return (
      <p className="countdown-done">
        🎉 Hôm nay là ngày đặc biệt ấy — hẹn gặp bạn tại buổi lễ!
      </p>
    );
  }

  const cells: Array<{ key: keyof Parts; value: string; label: string }> = [
    { key: "d", value: parts ? String(parts.d) : "—", label: "Ngày" },
    { key: "h", value: parts ? pad(parts.h) : "—", label: "Giờ" },
    { key: "m", value: parts ? pad(parts.m) : "—", label: "Phút" },
    { key: "s", value: parts ? pad(parts.s) : "—", label: "Giây" },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Đếm ngược tới lễ tốt nghiệp">
      {cells.map((c) => (
        <div className="cd-cell" key={c.key}>
          <span className="cd-num" ref={c.key === "s" ? secondRef : undefined}>
            {c.value}
          </span>
          <span className="cd-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
