"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "@/lib/config";
import { fireConfetti } from "./Confetti";

/**
 * Màn mở đầu: thẻ mời nghiêng theo con trỏ trong không gian 3D,
 * các lớp chữ nổi lên ở độ sâu khác nhau.
 */
export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Tạm dừng nhạc nếu người dùng rời khỏi trang khi đang phát
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    // play() trả về Promise — trình duyệt có thể chặn nếu không phải do
    // thao tác trực tiếp của người dùng, nhưng đây là click nên luôn được phép
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Thiết bị cảm ứng không có con trỏ -> bỏ qua hiệu ứng nghiêng
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;

    function onMove(e: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card!.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        // Giới hạn góc nghiêng để chữ không bị méo khó đọc
        const rx = (0.5 - py) * 13;
        const ry = (px - 0.5) * 15;

        card!.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
        card!.style.setProperty("--mx", `${px * 100}%`);
        card!.style.setProperty("--my", `${py * 100}%`);
      });
    }

    function onLeave() {
      cancelAnimationFrame(raf);
      card!.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="hero" id="top">
      <div className="hero-halo" aria-hidden="true" />

      <div className="card3d" ref={cardRef}>
        <button
          type="button"
          className={`sound-toggle layer-2 ${playing ? "is-playing" : ""}`}
          onClick={toggleSound}
          aria-pressed={playing}
          aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 5V4L8 9H4z" />
              <path d="M16.2 8.8a5 5 0 0 1 0 6.4" />
              <path d="M19 6.2a8.8 8.8 0 0 1 0 11.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 5V4L8 9H4z" />
              <line x1="16.5" y1="9" x2="21.5" y2="14" />
              <line x1="21.5" y1="9" x2="16.5" y2="14" />
            </svg>
          )}
        </button>

        {/* Nhạc nền tuỳ chọn — chỉ phát khi người xem tự bấm nút */}
        <audio ref={audioRef} src="/sound.mp3" loop preload="none" />

        <div className="layer-2">
          <span className="cap" aria-hidden="true">
            🎓
          </span>
        </div>

        <div className="layer-1">
          <span className="eyebrow">{config.kicker}</span>
        </div>

        <div className="layer-3">
          {/* Truyền độ dài tên để CSS tự co chữ cho vừa thẻ */}
          <h1
            className="hero-name"
            style={{ "--name-len": config.name.length } as React.CSSProperties}
          >
            {config.name}
          </h1>
        </div>

        <div className="layer-2">
          <p className="hero-degree">{config.degree}</p>
          {config.school && <p className="hero-school">{config.school}</p>}
        </div>

        <div className="rule layer-1" aria-hidden="true" />

        {config.classOf && (
          <div className="layer-1">
            <p className="hero-class">{config.classOf}</p>
          </div>
        )}

        <div className="btn-row layer-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              fireConfetti({ count: 150, originY: 0.85 });
              scrollTo("luu-but");
            }}
          >
            ✍️ Viết lưu bút
          </button>
          <button type="button" className="btn" onClick={() => scrollTo("chi-tiet")}>
            Xem chi tiết buổi lễ
          </button>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span>Cuộn xuống</span>
        <span className="line" />
      </div>
    </section>
  );
}
