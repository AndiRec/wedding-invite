import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0 },
};

export default function InviteContent() {
  return (
    <motion.div
      className="invite-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="hero">
        <img src="/wedding3.jpg" alt="Couple" className="hero-image" />

        <div className="hero-overlay">
          <motion.div
            className="hero-content"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 1, delay: 0.15 }}
          >
            <p className="eyebrow">Together with their families</p>

            <h1 className="couple-names">
              Elena <span>&</span> Marko
            </h1>

            <p className="hero-subtitle">
              Request the honor of your presence
            </p>

            <div className="hero-date">12 July 2026 • Skopje</div>
          </motion.div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="section-inner narrow">
          <span className="section-kicker">A Special Invitation</span>

          <h2>Join us for our wedding celebration</h2>

          <p>
            With joyful hearts, we invite you to share in a day filled with
            love, laughter, and unforgettable memories as we begin our new
            journey together.
          </p>
        </div>
      </section>

      <section className="section details-section">
        <div className="section-inner">
          <div className="center-heading">
            <span className="section-kicker">Wedding Details</span>

            <h2>The Celebration</h2>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-label">Date</div>
              <div className="detail-value">12 July 2026</div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Time</div>
              <div className="detail-value">18:00</div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Venue</div>
              <div className="detail-value">
                Hotel Aleksandar Palace
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Location</div>
              <div className="detail-value">
                Skopje, North Macedonia
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section story-section">
        <div className="section-inner split-layout">
          <div className="story-text">
            <span className="section-kicker">Our Story</span>

            <h2>A day to remember</h2>

            <p>
              Surrounded by the people who mean the most to us, we would be
              honored to celebrate this beautiful moment together. Your presence
              will make our day even more meaningful.
            </p>
          </div>

          <div className="story-image-wrap">
            <img
              src="/images/photo1.jpg"
              alt="Couple portrait"
              className="story-image"
            />
          </div>
        </div>
      </section>

      <section className="section gallery-section">
  <div className="section-inner">
    <div className="center-heading">
      <span className="section-kicker">Gallery</span>
      <h2>Moments of Us</h2>
    </div>

    <div className="gallery-slider">
      <div className="gallery-track">
        <div className="gallery-slide">
          <img src="/Foto1.jpg" alt="Gallery 1" />
        </div>

        <div className="gallery-slide">
          <img src="/Foto2.jpg" alt="Gallery 2" />
        </div>

        <div className="gallery-slide">
          <img src="/wedding2.jpg" alt="Gallery 3" />
        </div>
      </div>
    </div>
  </div>
</section>

      <section className="section timeline-section">
        <div className="section-inner narrow">
          <span className="section-kicker">Schedule</span>

          <h2>Wedding Day Timeline</h2>

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-time">17:30</div>

              <div>
                <div className="timeline-event">Guest Arrival</div>

                <p>Welcome drinks and greetings.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-time">18:00</div>

              <div>
                <div className="timeline-event">
                  Ceremony Begins
                </div>

                <p>The official wedding ceremony.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-time">19:00</div>

              <div>
                <div className="timeline-event">
                  Dinner & Celebration
                </div>

                <p>
                  Music, dinner, dancing and celebration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section rsvp-section">
        <div className="section-inner narrow">
          <div className="rsvp-box">
            <span className="section-kicker">RSVP</span>

            <h2>Kindly confirm your attendance</h2>

            <p>
              Please let us know if you will be joining us by
              1 June 2026.
            </p>

            <div className="rsvp-actions">
              <a
                href="https://forms.gle/your-form-link"
                target="_blank"
                rel="noreferrer"
                className="rsvp-button"
              >
                Confirm Attendance
              </a>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="map-button"
              >
                View Location
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section footer-section">
        <div className="section-inner narrow">
          <p className="footer-message">
            We can’t wait to celebrate with you ✨
          </p>
        </div>
      </section>
    </motion.div>
  );
}