import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
      style={{
        width: 220,
        height: 900,
        background: 'linear-gradient(180deg, hsl(43 72% 52% / 0.06), hsl(43 72% 52% / 0.12), hsl(43 72% 52% / 0.06))',
        border: '2px solid hsl(43 72% 52% / 0.25)',
        borderRadius: 20,
        boxShadow: 'inset 0 0 80px hsl(43 72% 52% / 0.04)',
      }}
    >
      <div
        className="absolute inset-3 border border-dashed rounded-2xl"
        style={{ borderColor: 'hsl(43 72% 52% / 0.18)' }}
      />
      <div className="text-center relative z-10">
        <p className="text-2xl mb-2">💃</p>
        <p className="font-display text-sm font-semibold text-foreground/70">
          Dance Floor
        </p>
        <p className="font-body text-xs text-primary/70 italic mt-1">
          Valle Shqiptare
        </p>
        <div className="mt-3 w-10 h-px bg-primary/25 mx-auto" />
        <p className="font-ui text-[9px] text-muted-foreground mt-3 tracking-widest uppercase">
          Edmond & Ajlin
        </p>
        <p className="font-ui text-[9px] text-muted-foreground">9 May</p>
        <p className="text-2xl mt-2">🕺</p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
