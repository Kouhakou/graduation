"use client";

import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  shape: "rect" | "circle" | "ribbon";
  life: number;
};

const COLORS = ["#e9c46a", "#ffd98a", "#8b7cf6", "#56cfe1", "#f7799f", "#ffffff"];

/** Hàm bắn pháo giấy toàn cục — component nào cũng gọi được. */
let fire: ((opts?: { count?: number; originY?: number }) => void) | null = null;

export function fireConfetti(opts?: { count?: number; originY?: number }) {
  fire?.(opts);
}

export default function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fire = () => {};
      return () => {
        fire = null;
      };
    }

    let pieces: Piece[] = [];
    let raf = 0;
    let running = false;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(count: number, originY: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Hai nguồn bắn ở hai bên, chụm vào giữa
      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const angle = fromLeft
          ? -Math.PI / 2 + (Math.random() * 0.75 - 0.1)
          : -Math.PI / 2 - (Math.random() * 0.75 - 0.1);
        const speed = 11 + Math.random() * 13;

        pieces.push({
          x: fromLeft ? w * 0.12 : w * 0.88,
          y: h * originY,
          vx: Math.cos(angle) * speed * (fromLeft ? 1 : 1),
          vy: Math.sin(angle) * speed,
          w: 6 + Math.random() * 7,
          h: 8 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: (["rect", "circle", "ribbon"] as const)[Math.floor(Math.random() * 3)],
          life: 1,
        });
      }

      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    function tick() {
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, window.innerWidth, h);

      pieces = pieces.filter((p) => p.life > 0 && p.y < h + 60);

      for (const p of pieces) {
        p.vy += 0.42; // trọng lực
        p.vx *= 0.992; // lực cản không khí
        p.vy *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        // Bắt đầu mờ dần khi đã rơi quá nửa màn hình
        if (p.y > h * 0.55) p.life -= 0.012;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.shape === "ribbon") {
          // Dải giấy xoắn: bề ngang co giãn theo góc xoay
          ctx!.fillRect(-p.w / 2, -p.h / 2, p.w * Math.abs(Math.cos(p.rot)), p.h);
        } else {
          ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx!.restore();
      }

      if (pieces.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        ctx!.clearRect(0, 0, window.innerWidth, h);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    fire = (opts) => spawn(opts?.count ?? 120, opts?.originY ?? 0.72);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      fire = null;
    };
  }, []);

  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />;
}
