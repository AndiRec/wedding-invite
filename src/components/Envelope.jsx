import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InviteContent from "./InviteContent";

export default function Envelope() {
  const [isOpening, setIsOpening] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => setShowInvite(true), 1200);
  };

  return (
    <div className="page">
      <AnimatePresence mode="wait">
        {!showInvite ? (
          <motion.section
            key="opening"
            className="opening-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="opening-card"
              animate={
                isOpening
                  ? { scale: 1.15, opacity: 0, y: -80, filter: "blur(8px)" }
                  : { scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }
              }
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="opening-small">Wedding Invitation</p>
              <h1>Elena</h1>
              <span>&</span>
              <h1>Marko</h1>
              <p className="opening-date">12 July 2026</p>
            </motion.div>

            <motion.button
              className="open-button"
              onClick={handleOpen}
              animate={isOpening ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Open Invitation
            </motion.button>
          </motion.section>
        ) : (
          <InviteContent key="invite" />
        )}
      </AnimatePresence>
    </div>
  );
}