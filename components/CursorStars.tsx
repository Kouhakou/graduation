"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  life: number; // 1 -> 0, dùng luôn làm hệ số mờ dần và co nhỏ
  color: string;
};

const COLORS = ["#e9c46a", "#ffd98a", "#8b7cf6", "#56cfe1", "#ffffff"];

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number,
  alpha: number,
  color: string,
) {
  // Ngôi sao 4 cánh kiểu lấp lánh (✦), không phải sao tròn như nền
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  const outer = size;
  const inner = size * 0.38;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 4) * i;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Vệt sao lấp lánh chạy theo con trỏ chuột — tách biệt hoàn toàn khỏi
 * nền sao (Starfield), vốn luôn trôi tự động theo kiểu vũ trụ.
 * Chỉ bật trên thiết bị có chuột thật; tự tắt nếu người dùng yêu cầu
 * giảm chuyển động.
 */
export default function CursorStars() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let sparks: Spark[] = [];
    let raf = 0;
    let running = false;

    let lastSpawnAt = 0;
    let lastX = -1;
    let lastY = -1;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x: number, y: number) {
      const count = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < count; i++) {
        sparks.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -0.35 - Math.random() * 0.55,
          size: 2.5 + Math.random() * 3.5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.12,
          life: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }

      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    function tick() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      sparks = sparks.filter((s) => s.life > 0);

      for (const s of sparks) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.006; // trôi nhẹ lên trên, chậm dần
        s.vx *= 0.985;
        s.rot += s.vr;
        s.life -= 0.022;

        const alpha = Math.max(0, s.life);
        const scale = 0.55 + s.life * 0.45;

        // Quầng sáng mờ phía sau ngôi sao
        ctx!.save();
        ctx!.globalAlpha = alpha * 0.22;
        ctx!.fillStyle = s.color;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.size * 2.4 * scale, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();

        drawStar(ctx!, s.x, s.y, s.size * scale, s.rot, alpha, s.color);
      }

      if (sparks.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    function onMove(e: MouseEvent) {
      const now = performance.now();
      const dist = lastX < 0 ? 999 : Math.hypot(e.clientX - lastX, e.clientY - lastY);

      // Chỉ sinh sao khi chuột đã di đủ xa và đủ lâu kể từ lần trước,
      // tránh spawn dày đặc khi rê chuột chậm hoặc đứng yên
      if (dist > 4 && now - lastSpawnAt > 24) {
        spawn(e.clientX, e.clientY);
        lastSpawnAt = now;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="cursor-stars" aria-hidden="true" />;
}
