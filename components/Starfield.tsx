"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number; // độ sâu 0..1 — quyết định kích thước, độ sáng và biên độ trôi
  r: number;
  twinkle: number;
  hue: string;
};

const HUES = ["255, 255, 255", "233, 196, 106", "139, 124, 246", "86, 207, 225"];

/**
 * Nền sao trôi tự do kiểu vũ trụ: hoàn toàn tự động theo thời gian,
 * không phụ thuộc con trỏ chuột (hiệu ứng theo chuột nằm ở CursorStars).
 * Cuộn trang vẫn tạo chiều sâu — sao gần cuộn chậm hơn sao xa.
 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;
    let scrollY = 0;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Mật độ sao theo diện tích, có trần để máy yếu không bị đuối
      const count = Math.min(260, Math.round((width * height) / 7000));

      stars = Array.from({ length: count }, () => {
        const z = Math.random();
        return {
          x: Math.random() * width,
          // Trải sao rộng hơn khung nhìn để trôi không lộ mép trống
          y: Math.random() * height * 1.6 - height * 0.3,
          z,
          r: 0.5 + z * 1.5,
          twinkle: Math.random() * Math.PI * 2,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
        };
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      t += 0.016;

      // Trôi tự động kiểu vũ trụ: chồng hai sóng sin/cos chu kỳ lệch nhau
      // để quỹ đạo không lặp lại đơn điệu, tạo cảm giác trôi bồng bềnh.
      const driftX = reduced ? 0 : Math.sin(t * 0.055) * 46 + Math.cos(t * 0.021) * 18;
      const driftY = reduced ? 0 : Math.cos(t * 0.047) * 34 + Math.sin(t * 0.018) * 14;

      for (const s of stars) {
        const depth = 0.25 + s.z * 0.75;

        const x = s.x + driftX * depth;
        // Sao cuộn chậm hơn nội dung trang -> cảm giác chiều sâu
        const y = s.y + driftY * depth - scrollY * depth * 0.22;

        // Cuộn vòng theo chiều dọc để không bao giờ hết sao
        const span = height * 1.6;
        const wrapped = ((y % span) + span) % span - height * 0.3;

        if (wrapped < -20 || wrapped > height + 20) continue;

        const alpha = reduced
          ? 0.5 * depth
          : (0.35 + 0.45 * Math.sin(t * 1.1 + s.twinkle)) * depth;

        ctx!.beginPath();
        ctx!.arc(x, wrapped, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.hue}, ${Math.max(0.05, alpha)})`;
        ctx!.fill();

        // Quầng sáng cho những ngôi sao lớn nhất
        if (s.r > 1.6) {
          ctx!.beginPath();
          ctx!.arc(x, wrapped, s.r * 3.4, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${s.hue}, ${alpha * 0.1})`;
          ctx!.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onScroll() {
      scrollY = window.scrollY;
    }

    function onResize() {
      build();
    }

    build();
    onScroll();
    raf = requestAnimationFrame(draw);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
