import React, { useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import InviteContent from "./InviteContent";
import { COUPLE, t } from "@/lib/i18n";
import "./Envelope.css";
import "./invitation.css";

/* The real wax-seal photo cutout (transparent PNG) lives in /public/seal.png */
const SEAL_SRC = "/seal.png";

/* ------------------------------------------------------------------ */
/*  Opening choreography — everything radiates from the wax seal       */
/*                                                                     */
/*  0.00s  tap the seal → the wax snaps off the paper in one piece,    */
/*         lifts with a growing shadow, then tumbles down past the     */
/*         envelope with gravity                                       */
/*  0.15s  flap "tugs" upward as the seal releases, then folds         */
/*         back 180° in 3D (passes 90° at ~0.80s)                      */
/*  1.10s  letter slides up out of the envelope                        */
/*  2.20s  scene zooms into the letter → InviteContent fades in        */
/* ------------------------------------------------------------------ */
const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
const EASE_FLAP = [0.65, 0, 0.3, 1] as const;
const EASE_FALL = [0.55, 0, 1, 0.45] as const; // gravity — accelerates downward

const SEAL_FALL = {
  y: [0, 3, -18, 280],
  x: [0, -1, 5, 42],
  rotate: [0, 3, -6, 78],
  rotateX: [0, -4, 16, 58],
  scale: [1, 0.97, 1.08, 0.95],
  opacity: [1, 1, 1, 0],
  filter: [
    "drop-shadow(0 6px 13px rgba(110,70,60,0.42))",
    "drop-shadow(0 4px 9px rgba(110,70,60,0.5))",
    "drop-shadow(0 16px 24px rgba(110,70,60,0.4))",
    "drop-shadow(0 30px 38px rgba(110,70,60,0))",
  ],
};
const SEAL_REST = {
  y: 0,
  x: 0,
  rotate: 0,
  rotateX: 0,
  scale: 1,
  opacity: 1,
  filter: "drop-shadow(0 6px 13px rgba(110,70,60,0.42))",
};
const SEAL_FALL_T = {
  duration: 1.05,
  times: [0, 0.08, 0.24, 1],
  ease: ["easeInOut", "easeOut", "easeIn"],
  opacity: { duration: 1.05, times: [0, 0.1, 0.82, 1], ease: "linear" },
};

/* Deterministic pseudo-random so details never reshuffle between renders */
const rnd = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* A few small wax crumbs that drop when the seal snaps off */
const SHARDS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: (rnd(i, 1) - 0.5) * 70,
  y: 60 + rnd(i, 2) * 70,
  rotate: (rnd(i, 3) - 0.5) * 240,
  size: 3 + rnd(i, 4) * 3,
  delay: 0.08 + rnd(i, 5) * 0.14,
}));

/* Sparse, slow petals drifting behind the envelope */
const DRIFT_PETALS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: 4 + rnd(i, 7) * 92,
  size: 8 + rnd(i, 8) * 7,
  duration: 16 + rnd(i, 9) * 10,
  delay: -rnd(i, 10) * 20, // negative delay → already mid-fall on load
  drift: (rnd(i, 11) - 0.5) * 110,
  hue: i % 3,
}));

/* The envelope's geometry as SVG paths (0–1 objectBoundingBox units). */
function EnvelopeClipDefs() {
  return (
    <svg className="env-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="env-clip-flap" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H1 L0.527,0.9 Q0.5,0.97 0.473,0.9 Z" />
        </clipPath>
        <clipPath id="env-clip-pocket-left" clipPathUnits="objectBoundingBox">
          <path d="M0,0 L0.54,0.5 L0,1 Z" />
        </clipPath>
        <clipPath id="env-clip-pocket-right" clipPathUnits="objectBoundingBox">
          <path d="M1,0 L0.46,0.5 L1,1 Z" />
        </clipPath>
        <clipPath id="env-clip-pocket-bottom" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0.477,0.41 Q0.5,0.372 0.523,0.41 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* Thin stationery ornament: hairline — lozenge — hairline */
function Ornament() {
  return (
    <svg className="letter-ornament" viewBox="0 0 64 8" aria-hidden="true">
      <line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="0.6" />
      <rect
        x="29.5"
        y="1.5"
        width="5"
        height="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        transform="rotate(45 32 4)"
      />
      <line x1="38" y1="4" x2="64" y2="4" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

export default function Envelope() {
  const [isOpening, setIsOpening] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false); // z-index flip mid-rotation
  const [letterOut, setLetterOut] = useState(false); // letter lifts above the flap
  const [showInvite, setShowInvite] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduceMotion = useReducedMotion();

  const handleOpen = async () => {
    if (isOpening) return;
    setIsOpening(true);

    try {
      await audioRef.current?.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }

    if (reduceMotion) {
      setShowInvite(true);
      return;
    }

    setTimeout(() => setFlapBehind(true), 860); // flap passes 90° → tuck behind letter
    setTimeout(() => setLetterOut(true), 1050); // letter starts rising → lift above flap
    setTimeout(() => setShowInvite(true), 2350); // letter is out → zoom into invite
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };

  return (
    <div className="page">
      <audio ref={audioRef} src="/music.mp3" loop />

      <AnimatePresence mode="wait">
        {!showInvite ? (
          <Motion.section
            key="envelope"
            className={`env-screen ${isOpening ? "is-opening" : ""}`}
            style={{ transformOrigin: "50% 38%" }} /* zoom toward the risen letter */
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.55, filter: "blur(10px)" }
            }
            transition={{ duration: 0.9, ease: EASE_SOFT }}
          >
            <EnvelopeClipDefs />

            {/* Large couple line-art watermark, sitting behind the envelope. */}
            <Motion.div
              className="couple-bg"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1.6, ease: EASE_SOFT, delay: 0.2 }}
            />

            {/* Sparse drifting petals */}
            <div className="env-ambient" aria-hidden="true">
              {DRIFT_PETALS.map((p) => (
                <span
                  key={p.id}
                  className={`drift-petal hue-${p.hue}`}
                  style={{
                    left: `${p.left}%`,
                    width: p.size,
                    height: p.size * 1.3,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    "--drift": `${p.drift}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            <div className="env-stage">
              <Motion.div
                className="env-wrap"
                onClick={handleOpen} /* forgiving target — whole envelope works too */
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={
                  isOpening
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, y: [0, -6, 0] }
                }
                transition={
                  isOpening
                    ? { duration: 0.3 }
                    : {
                        opacity: { duration: 0.9, ease: EASE_SOFT },
                        y: {
                          delay: 0.9,
                          duration: 5.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }
                }
              >
                <div className="env-shadow" aria-hidden="true" />

                <div className="envelope">
                  {/* Back panel with patterned liner */}
                  <div className="env-back" />

                  {/* The letter — slides out, then the screen zooms into it */}
                  <Motion.div
                    className={`letter ${letterOut ? "letter--rising" : ""}`}
                    initial={false}
                    animate={isOpening ? { y: ["0%", "-96%", "-90%"] } : { y: "0%" }}
                    transition={{
                      delay: 1.05,
                      duration: 1.15,
                      times: [0, 0.82, 1],
                      ease: [EASE_SOFT, "easeInOut"],
                    }}
                  >
                    <p className="letter-kicker">{t.invite.inviteLetter}</p>
                    <h2 className="letter-names">
                      {COUPLE.partner1} <em>&amp;</em> {COUPLE.partner2}
                    </h2>
                    <Ornament />
                    <p className="letter-date">{COUPLE.dateLabel}</p>
                  </Motion.div>

                  {/* Front pocket: three folded paper panels */}
                  <div className="env-pocket" aria-hidden="true">
                    <div className="pocket-left" />
                    <div className="pocket-right" />
                    <div className="pocket-bottom" />
                    <p className="env-address">{t.invite.forGuest}</p>
                  </div>

                  {/* Resting shadow the flap casts — dissolves as the flap lifts */}
                  <Motion.div
                    className="flap-shade"
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: isOpening ? 0 : 0.16 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />

                  {/* Top flap — resists for a beat, tugs upward, folds back 180° in 3D */}
                  <Motion.div
                    className={`flap ${flapBehind ? "flap--behind" : ""}`}
                    initial={false}
                    animate={{ rotateX: isOpening ? [0, -3, 10, 176, 180] : 0 }}
                    transition={
                      isOpening
                        ? {
                            delay: 0.22,
                            duration: 1.15,
                            times: [0, 0.1, 0.22, 0.9, 1],
                            ease: ["easeInOut", "easeOut", EASE_FLAP, "easeOut"],
                          }
                        : { duration: 0.4 }
                    }
                    aria-hidden="true"
                  >
                    <div className="flap-face flap-front" />
                    <div className="flap-face flap-liner" />
                  </Motion.div>

                  {/* The real wax seal IS the button: it snaps off whole and tumbles down */}
                  <div className="seal-anchor">
                    <Motion.button
                      type="button"
                      className="seal-button"
                      aria-label="Break the seal and open the invitation"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                      }}
                      whileHover={isOpening ? undefined : { scale: 1.05 }}
                      whileTap={isOpening ? undefined : { scale: 0.93 }}
                    >
                      <Motion.img
                        className="seal-img"
                        src={SEAL_SRC}
                        alt=""
                        draggable={false}
                        initial={false}
                        animate={isOpening && !reduceMotion ? SEAL_FALL : SEAL_REST}
                        transition={
                          isOpening && !reduceMotion ? SEAL_FALL_T : { duration: 0.2 }
                        }
                      />
                    </Motion.button>
                  </div>

                  {/* Tiny wax crumbs left behind by the snap */}
                  {isOpening && !reduceMotion && (
                    <div className="shards" aria-hidden="true">
                      {SHARDS.map((s) => (
                        <Motion.span
                          key={s.id}
                          className="shard"
                          style={{ width: s.size, height: s.size }}
                          initial={{ x: 0, y: 0, rotate: 0, opacity: 0.9 }}
                          animate={{ x: s.x, y: s.y, rotate: s.rotate, opacity: 0 }}
                          transition={{ delay: s.delay, duration: 0.7, ease: EASE_FALL }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Motion.div>

              <Motion.p
                className="env-hint"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={isOpening ? { opacity: 0 } : { opacity: [0.55, 0.95, 0.55] }}
                transition={
                  isOpening
                    ? { duration: 0.25 }
                    : { delay: 1.2, duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                {t.invite.tapToOpen}
              </Motion.p>
            </div>
          </Motion.section>
        ) : (
          <Motion.div
            key="invite-wrapper"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_SOFT, delay: 0.1 }}
          >
            <button className="music-button" onClick={toggleMusic}>
              {musicPlaying ? t.invite.pauseMusic : t.invite.playMusic}
            </button>

            <InviteContent />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
