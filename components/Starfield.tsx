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

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  life: number; // 1 -> 0, dùng làm độ mờ dần
  hue: string;
};

const HUES = ["255, 255, 255", "233, 196, 106", "139, 124, 246", "86, 207, 225"];
const SHOOT_HUES = ["255, 255, 255", "233, 196, 106", "86, 207, 225"];

/**
 * Nền sao trôi tự do kiểu vũ trụ: hoàn toàn tự động theo thời gian,
 * không phụ thuộc con trỏ chuột (hiệu ứng theo chuột nằm ở CursorStars).
 * Cuộn trang vẫn tạo chiều sâu — sao gần cuộn chậm hơn sao xa.
 * Sao băng bay chéo qua màn hình liên tục theo chu kỳ ngắn, tối đa 5 vệt cùng lúc.
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
    let shootingStars: ShootingStar[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;
    let scrollY = 0;
    let nextShootAt = 0.6 + Math.random() * 1.2;

    function spawnShootingStar() {
      // Xuất phát rải khắp nửa trên màn hình; bay chéo xuống-trái như sao băng thật
      const speed = 11 + Math.random() * 7;
      shootingStars.push({
        x: width * (0.15 + Math.random() * 0.8),
        y: height * Math.random() * 0.4,
        vx: -speed * (0.78 + Math.random() * 0.22),
        vy: speed * (0.32 + Math.random() * 0.28),
        len: 90 + Math.random() * 70,
        life: 1,
        hue: SHOOT_HUES[Math.floor(Math.random() * SHOOT_HUES.length)],
      });
    }

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

      // Sao băng: bắn dày hơn, tối đa 5 vệt cùng lúc
      if (!reduced) {
        if (t >= nextShootAt && shootingStars.length < 5) {
          spawnShootingStar();
          nextShootAt = t + 0.9 + Math.random() * 1.8;
        }

        for (const s of shootingStars) {
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.012;
        }

        shootingStars = shootingStars.filter(
          (s) => s.life > 0 && s.x > -160 && s.y < height + 160,
        );

        for (const s of shootingStars) {
          const speedMag = Math.hypot(s.vx, s.vy) || 1;
          const dirX = s.vx / speedMag;
          const dirY = s.vy / speedMag;
          const tailX = s.x - dirX * s.len;
          const tailY = s.y - dirY * s.len;
          const alpha = Math.max(0, s.life);

          const grad = ctx!.createLinearGradient(s.x, s.y, tailX, tailY);
          grad.addColorStop(0, `rgba(${s.hue}, ${alpha})`);
          grad.addColorStop(1, `rgba(${s.hue}, 0)`);

          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 2;
          ctx!.lineCap = "round";
          ctx!.beginPath();
          ctx!.moveTo(s.x, s.y);
          ctx!.lineTo(tailX, tailY);
          ctx!.stroke();

          // Đầu sáng + quầng nhỏ
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${s.hue}, ${alpha})`;
          ctx!.fill();

          ctx!.beginPath();
          ctx!.arc(s.x, s.y, 5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${s.hue}, ${alpha * 0.25})`;
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
