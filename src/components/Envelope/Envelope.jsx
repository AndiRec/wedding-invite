import { useRef, useState } from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import InviteContent from "../InviteContent";
import "./Envelope.css";

/* The real wax-seal photo cutout (transparent PNG).
   Put seal.png in your project's /public folder — or, if you prefer
   bundling it, move it next to this file and use:
   import SEAL_SRC from "./seal.png"; */
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
const EASE_SOFT = [0.22, 1, 0.36, 1];
const EASE_FLAP = [0.65, 0, 0.3, 1];
const EASE_FALL = [0.55, 0, 1, 0.45]; // gravity — accelerates downward

/* The seal's snap-and-tumble: lift off (0–20%), then fall & spin */
const SEAL_FALL = {
  y: [0, -10, 175],
  x: [0, 2, 26],
  rotate: [0, -5, 72],
  rotateX: [0, 14, 55],
  scale: [1, 1.07, 0.96],
  opacity: [1, 1, 0],
  filter: [
    "drop-shadow(0 3px 6px rgba(80,60,28,0.32))",
    "drop-shadow(0 10px 14px rgba(80,60,28,0.30))",
    "drop-shadow(0 18px 22px rgba(80,60,28,0))",
  ],
};
const SEAL_REST = {
  y: 0,
  x: 0,
  rotate: 0,
  rotateX: 0,
  scale: 1,
  opacity: 1,
  filter: "drop-shadow(0 3px 6px rgba(80,60,28,0.32))",
};
const SEAL_FALL_T = {
  duration: 0.95,
  times: [0, 0.2, 1],
  ease: ["easeOut", "easeIn"],
  opacity: { duration: 0.95, times: [0, 0.78, 1], ease: ["linear", "easeIn"] },
};

/* Deterministic pseudo-random so details never reshuffle between renders */
const rnd = (i, salt) => {
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

/* The envelope's geometry as SVG paths (0–1 objectBoundingBox units, so
   they scale with the envelope). Edit these to reshape the flap or
   pockets — e.g. the flap's rounded tip is the Q curve. */
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
  const [showInvite, setShowInvite] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);
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

    setTimeout(() => setFlapBehind(true), 800); // flap passes 90° → tuck behind letter
    setTimeout(() => setShowInvite(true), 2200); // letter is out → zoom into invite
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
            style={{ transformOrigin: "50% 40%" }} /* zoom toward the risen letter */
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.45, filter: "blur(8px)" }
            }
            transition={{ duration: 0.8, ease: EASE_SOFT }}
          >
            <EnvelopeClipDefs />

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
                  }}
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
                    className="letter"
                    initial={false}
                    animate={isOpening ? { y: "-116%" } : { y: "0%" }}
                    transition={{ delay: 1.1, duration: 1.0, ease: EASE_SOFT }}
                  >
                    <p className="letter-kicker">Wedding Invitation</p>
                    <h2 className="letter-names">
                      Arthur <em>&amp;</em> Aurelia
                    </h2>
                    <Ornament />
                    <p className="letter-date">12 July 2026</p>
                  </Motion.div>

                  {/* Front pocket: three folded paper panels */}
                  <div className="env-pocket" aria-hidden="true">
                    <div className="pocket-left" />
                    <div className="pocket-right" />
                    <div className="pocket-bottom" />
                    <p className="env-address">for our beloved guest</p>
                  </div>

                  {/* Resting shadow the flap casts on the paper below —
                      dissolves as the flap lifts */}
                  <Motion.div
                    className="flap-shade"
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: isOpening ? 0 : 0.16 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />

                  {/* Top flap — tugs as the seal releases, then folds back
                      180° in 3D. If it ever opens "into" the page, flip
                      the 180s to -180. */}
                  <Motion.div
                    className={`flap ${flapBehind ? "flap--behind" : ""}`}
                    initial={false}
                    animate={{ rotateX: isOpening ? [0, 8, 180] : 0 }}
                    transition={
                      isOpening
                        ? {
                            delay: 0.15,
                            duration: 1.05,
                            times: [0, 0.18, 1],
                            ease: ["easeOut", EASE_FLAP],
                          }
                        : { duration: 0.4 }
                    }
                    aria-hidden="true"
                  >
                    <div className="flap-face flap-front" />
                    <div className="flap-face flap-liner" />
                  </Motion.div>

                  {/* The real wax seal IS the button: it snaps off whole
                      and tumbles down */}
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
                        animate={
                          isOpening && !reduceMotion ? SEAL_FALL : SEAL_REST
                        }
                        transition={
                          isOpening && !reduceMotion
                            ? SEAL_FALL_T
                            : { duration: 0.2 }
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
                          animate={{
                            x: s.x,
                            y: s.y,
                            rotate: s.rotate,
                            opacity: 0,
                          }}
                          transition={{
                            delay: s.delay,
                            duration: 0.7,
                            ease: EASE_FALL,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Motion.div>

              <Motion.p
                className="env-hint"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={
                  isOpening ? { opacity: 0 } : { opacity: [0.55, 0.95, 0.55] }
                }
                transition={
                  isOpening
                    ? { duration: 0.25 }
                    : {
                        delay: 1.2,
                        duration: 3.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                Tap the seal to open
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
              {musicPlaying ? "Pause Music" : "Play Music"}
            </button>

            <InviteContent />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
