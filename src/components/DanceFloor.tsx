import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
      style={{
        width: 1000,
        height: 130,
        background: 'linear-gradient(90deg, hsl(43 72% 52% / 0.06), hsl(43 72% 52% / 0.14), hsl(43 72% 52% / 0.06))',
        border: '2px solid hsl(43 72% 52% / 0.25)',
        borderRadius: 16,
        boxShadow: 'inset 0 0 60px hsl(43 72% 52% / 0.05)',
      }}
    >
      <div
        className="absolute inset-2 border border-dashed rounded-xl"
        style={{ borderColor: 'hsl(43 72% 52% / 0.2)' }}
      />
      <div className="text-center relative z-10 flex items-center gap-5">
        <p className="text-lg">💃</p>
        <div>
          <p className="font-display text-base font-semibold text-foreground/80">
            Dance Floor · Valle Shqiptare
          </p>
          <p className="font-ui text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
            Edmond & Ajlin · 9 May
          </p>
        </div>
        <p className="text-lg">🕺</p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
