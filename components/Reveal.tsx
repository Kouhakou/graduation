"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Độ trễ (ms) trước khi phần tử hiện ra — dùng để xếp lớp hiệu ứng. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Bọc quanh nội dung để nó mờ dần hiện lên khi cuộn tới.
 * Chỉ chạy một lần cho mỗi phần tử.
 */
export default function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const timer = window.setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
          // Dọn timer nếu component bị gỡ trước khi hiệu ứng chạy
          el.dataset.revealTimer = String(timer);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    io.observe(el);

    return () => {
      io.disconnect();
      const timer = el.dataset.revealTimer;
      if (timer) window.clearTimeout(Number(timer));
    };
  }, [delay]);

  const Tag = as as "div";

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
