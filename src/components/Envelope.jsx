import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InviteContent from "./InviteContent";

export default function Envelope() {
  const [isOpening, setIsOpening] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleOpen = async () => {
    if (isOpening) return;

    setIsOpening(true);

    try {
      await audioRef.current.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }

    setTimeout(() => setShowInvite(true), 600);
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
          <motion.section
            key="opening"
            className="opening-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="floral-corner floral-top-left">✿</div>
            <div className="floral-corner floral-bottom-right">✿</div>

            <motion.div
              className="opening-card"
              onClick={handleOpen}
              animate={
                isOpening
                  ? { scale: 1.08, opacity: 0, y: -80, filter: "blur(8px)" }
                  : { scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }
              }
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="opening-small">Wedding Invitation</p>

              <div className="opening-names">
                <h1>Arthur</h1>
                <span>&</span>
                <h1>Aurelia</h1>
              </div>

              <div className="opening-divider" />

              <p className="opening-date">12 July 2026</p>

              <p className="opening-tap">Tap to open</p>
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="invite-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <button className="music-button" onClick={toggleMusic}>
              {musicPlaying ? "Pause Music" : "Play Music"}
            </button>

            <InviteContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}