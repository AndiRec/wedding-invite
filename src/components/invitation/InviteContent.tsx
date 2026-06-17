import { motion as Motion } from "framer-motion";
import RsvpForm from "./RsvpForm";
import Countdown from "./Countdown";
import SeatLookup from "./SeatLookup";
import Reveal from "./Reveal";
import { COUPLE, t } from "@/lib/i18n";
import { googleCalendarUrl } from "@/lib/calendar";
import { useGuestName } from "@/lib/useGuestParam";

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0 },
};

export default function InviteContent() {
  const guestName = useGuestName();

  return (
    <Motion.div
      className="invite-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="hero">
        <img src="/wedding3.jpg" alt="Çifti" className="hero-image" />

        <div className="hero-overlay">
          <Motion.div
            className="hero-content"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 1, delay: 0.15 }}
          >
            {guestName && (
              <p className="hero-greeting">
                {t.invite.greetingHi}, {guestName} ✦
              </p>
            )}

            <p className="eyebrow">{t.invite.eyebrow}</p>

            <h1 className="couple-names">
              {COUPLE.partner1} <span>&</span> {COUPLE.partner2}
            </h1>

            <p className="hero-subtitle">{t.invite.presence}</p>

            <div className="hero-date">
              {COUPLE.dateLabel} • {COUPLE.city}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="section intro-section">
        <Reveal>
          <div className="section-inner narrow">
            <span className="section-kicker">{t.invite.introKicker}</span>
            <h2>{t.invite.introTitle}</h2>
            <p>{t.invite.introBody}</p>
          </div>
        </Reveal>
      </section>

      {/* Live countdown */}
      <section className="section countdown-section">
        <Reveal>
          <div className="section-inner narrow">
            <span className="section-kicker">{t.invite.countdownKicker}</span>
            <h2>{t.invite.countdownTitle}</h2>
            <Countdown />
          </div>
        </Reveal>
      </section>

      <section className="section details-section">
        <Reveal>
        <div className="section-inner">
          <div className="center-heading">
            <span className="section-kicker">{t.invite.detailsKicker}</span>
            <h2>{t.invite.detailsTitle}</h2>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-label">{t.invite.labelDate}</div>
              <div className="detail-value">{COUPLE.dateLabel}</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">{t.invite.labelTime}</div>
              <div className="detail-value">{COUPLE.timeLabel}</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">{t.invite.labelVenue}</div>
              <div className="detail-value">{COUPLE.venue}</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">{t.invite.labelCity}</div>
              <div className="detail-value">{COUPLE.city}</div>
            </div>
          </div>

          <div className="details-cta">
            <a
              href={googleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              className="plan-cta-button plan-cta-button--ghost"
            >
              {t.invite.addToCalendar}
            </a>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Seating: guest seat lookup + links to map / admin */}
      <section className="section plan-cta-section">
        <Reveal>
        <div className="section-inner narrow">
          <span className="section-kicker">{t.invite.planKicker}</span>
          <h2>{t.invite.planTitle}</h2>
          <p>{t.invite.planBody}</p>

          <SeatLookup initialName={guestName} />

          <div className="plan-cta-actions">
            <a href="/plan/view" className="plan-cta-button plan-cta-button--ghost">
              {t.invite.viewMap}
            </a>
            <a href="/plan/admin" className="plan-cta-button">
              {t.invite.createPlan}
            </a>
          </div>
        </div>
        </Reveal>
      </section>

      <section className="section story-section">
        <Reveal>
        <div className="section-inner split-layout">
          <div className="story-text">
            <span className="section-kicker">{t.invite.storyKicker}</span>
            <h2>{t.invite.storyTitle}</h2>
            <p>{t.invite.storyBody}</p>
          </div>

          <div className="story-image-wrap">
            <img src="/wedding2.jpg" alt="Portret i çiftit" className="story-image" />
          </div>
        </div>
        </Reveal>
      </section>

      <section className="section gallery-section">
        <Reveal>
        <div className="section-inner">
          <div className="center-heading">
            <span className="section-kicker">{t.invite.galleryKicker}</span>
            <h2>{t.invite.galleryTitle}</h2>
          </div>

          <div className="gallery-slider">
            <div className="gallery-track">
              <div className="gallery-slide">
                <img src="/Foto1.jpg" alt="Galeria 1" />
              </div>
              <div className="gallery-slide">
                <img src="/Foto2.jpg" alt="Galeria 2" />
              </div>
              <div className="gallery-slide">
                <img src="/wedding2.jpg" alt="Galeria 3" />
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      <section className="section timeline-section">
        <Reveal>
        <div className="section-inner narrow">
          <span className="section-kicker">{t.invite.scheduleKicker}</span>
          <h2>{t.invite.scheduleTitle}</h2>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-time">17:30</div>
              <div>
                <div className="timeline-event">{t.invite.arrival}</div>
                <p>{t.invite.arrivalDesc}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-time">18:00</div>
              <div>
                <div className="timeline-event">{t.invite.ceremony}</div>
                <p>{t.invite.ceremonyDesc}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-time">19:00</div>
              <div>
                <div className="timeline-event">{t.invite.dinner}</div>
                <p>{t.invite.dinnerDesc}</p>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      <section className="section location-section">
        <Reveal>
        <div className="section-inner location-card">
          <div>
            <span className="section-kicker">{t.invite.locationKicker}</span>
            <h2>{COUPLE.venue}</h2>
            <p>{t.invite.locationBody}</p>
          </div>

          <a
            href={COUPLE.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="location-button"
          >
            {t.invite.viewLocation}
          </a>
        </div>
        </Reveal>
      </section>

      <section className="section rsvp-section">
        <Reveal>
        <div className="section-inner narrow">
          <div className="rsvp-box">
            <span className="section-kicker">{t.invite.rsvpKicker}</span>
            <h2>{t.invite.rsvpTitle}</h2>
            <p>{t.invite.rsvpBody}</p>

            <RsvpForm initialName={guestName} />
          </div>
        </div>
        </Reveal>
      </section>

      <section className="section footer-section">
        <div className="section-inner narrow">
          <p className="footer-message">
            {t.invite.footer} {COUPLE.partner1} & {COUPLE.partner2}
          </p>
        </div>
      </section>
    </Motion.div>
  );
}
