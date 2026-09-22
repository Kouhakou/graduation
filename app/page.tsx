import Starfield from "@/components/Starfield";
import CursorStars from "@/components/CursorStars";
import Confetti from "@/components/Confetti";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Guestbook from "@/components/Guestbook";
import Reveal from "@/components/Reveal";
import { config } from "@/lib/config";

export default function Page() {
  const { event, contact } = config;

  return (
    <>
      <Starfield />
      <CursorStars />
      <Confetti />

      <main className="shell">
        <Hero />

        {/* ---------- Đếm ngược ---------- */}
        <section id="dem-nguoc">
          <div className="wrap narrow" style={{ textAlign: "center" }}>
            <Reveal>
              <span className="eyebrow">Còn bao lâu nữa</span>
              <h2 className="section-title">Ngày ấy đang tới rất gần</h2>
            </Reveal>

            <Reveal delay={120}>
              <Countdown />
            </Reveal>
          </div>
        </section>

        {/* ---------- Chi tiết buổi lễ ---------- */}
        <section id="chi-tiet">
          <div className="wrap">
            <div style={{ textAlign: "center" }}>
              <Reveal>
                <span className="eyebrow">Thông tin</span>
                <h2 className="section-title">Chi tiết buổi lễ</h2>
              </Reveal>
            </div>

            <div className="detail-grid">
              <Reveal delay={0}>
                <div className="tile">
                  <span className="tile-icon" aria-hidden="true">
                    📅
                  </span>
                  <div className="tile-label">Ngày</div>
                  <div className="tile-value">{event.dateText}</div>
                </div>
              </Reveal>

              <Reveal delay={90}>
                <div className="tile">
                  <span className="tile-icon" aria-hidden="true">
                    🕗
                  </span>
                  <div className="tile-label">Thời gian</div>
                  <div className="tile-value">{event.timeText}</div>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="tile">
                  <span className="tile-icon" aria-hidden="true">
                    📍
                  </span>
                  <div className="tile-label">Địa điểm</div>
                  <div className="tile-value">{event.venue}</div>
                  <div className="tile-sub">{event.address}</div>
                </div>
              </Reveal>

              <Reveal delay={270}>
                <div className="tile">
                  <span className="tile-icon" aria-hidden="true">
                    👔
                  </span>
                  <div className="tile-label">Trang phục</div>
                  <div className="tile-value">{event.dressCode}</div>
                </div>
              </Reveal>
            </div>

            {event.mapsUrl && (
              <Reveal delay={340}>
                <div className="btn-row">
                  <a
                    className="btn"
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🗺️ Xem đường đi
                  </a>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ---------- Lời nhắn ---------- */}
        <section id="loi-nhan">
          <div className="wrap wide" style={{ textAlign: "center" }}>
            <Reveal>
              <div className="quote-mark" aria-hidden="true">
                &ldquo;
              </div>
            </Reveal>

            <div className="message-block">
              {config.message.map((line, i) => (
                <Reveal key={i} delay={i * 160}>
                  <p>{line}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Hành trình ---------- */}
        <section id="hanh-trinh">
          <div className="wrap narrow">
            <div style={{ textAlign: "center" }}>
              <Reveal>
                <span className="eyebrow">Nhìn lại</span>
                <h2 className="section-title">Chặng đường đã qua của mình</h2>
              </Reveal>
            </div>

            <ol className="timeline">
              {config.milestones.map((m, i) => (
                <Reveal as="li" key={m.year} delay={i * 110} className="tl-item">
                  <div className="tl-year">{m.year}</div>
                  <h3 className="tl-title">{m.title}</h3>
                  <p className="tl-desc">{m.desc}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Lưu bút ---------- */}
        <section id="luu-but">
          <div className="wrap wide">
            <div style={{ textAlign: "center" }}>
              <Reveal>
                <span className="eyebrow">Lưu bút</span>
                <h2 className="section-title prose">Nếu ví thời đại học như một cuốn sách, bạn sẽ viết gì ở những trang cuối cùng?</h2>
                <p className="lead" style={{ marginTop: 18 }}>
                  Với mình, đó là những kỉ niệm, dù chỉ là một lời chúc, hay chỉ là một câu đùa bâng quơ — những điều khiến mình cảm thấy hạnh phúc và trân trọng mãi mãi. Vậy nên, hãy để lại đây đôi dòng tâm sự mà bạn muốn chúng ta cùng nhau ôn lại và lưu giữ như một phần của thanh xuân nha.
                </p>
              </Reveal>
            </div>

            <Reveal delay={140}>
              <Guestbook />
            </Reveal>
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="footer">
          <div className="wrap narrow">
            <p className="lead" style={{ fontSize: 15 }}>
              Thông tin liên hệ
            </p>

            <div className="footer-contact">
              {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>📞 {contact.phone}</a>}
              {contact.email && <a href={`mailto:${contact.email}`}>✉️ {contact.email}</a>}
            </div>

            <p className="footer-fine">
              Cảm ơn bạn đã dành thời gian ghé qua trang này. 🎓
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
