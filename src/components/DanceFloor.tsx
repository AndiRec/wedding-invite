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
        width: 240,
        height: 700,
        background: 'linear-gradient(180deg, hsl(43 72% 52% / 0.06), hsl(43 72% 52% / 0.14), hsl(43 72% 52% / 0.06))',
        border: '2px solid hsl(43 72% 52% / 0.25)',
        borderRadius: 24,
        boxShadow: 'inset 0 0 80px hsl(43 72% 52% / 0.05)',
      }}
    >
      {/* Decorative inner border */}
      <div
        className="absolute inset-3 border border-dashed rounded-2xl"
        style={{ borderColor: 'hsl(43 72% 52% / 0.2)' }}
      />

      <div className="text-center px-4 relative z-10">
        <p className="font-display text-lg font-semibold text-foreground/70">
          💃
        </p>
        <p className="font-display text-base font-semibold text-foreground/80 mt-1">
          Dance Floor
        </p>
        <p className="font-body text-sm text-primary/70 mt-1 italic">
          Valle Shqiptare
        </p>
        <div className="mt-3 w-12 h-px bg-primary/25 mx-auto" />
        <p className="font-ui text-[10px] text-muted-foreground mt-3 tracking-widest uppercase">
          Edmond & Ajlin
        </p>
        <p className="font-ui text-[10px] text-muted-foreground">
          9 May
        </p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
