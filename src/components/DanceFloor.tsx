import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[220px] md:w-[500px] md:h-[280px] rounded-2xl flex flex-col items-center justify-center z-10"
      style={{
        background: 'linear-gradient(135deg, hsl(43 72% 52% / 0.08), hsl(43 72% 52% / 0.18), hsl(43 72% 52% / 0.08))',
        border: '2px solid hsl(43 72% 52% / 0.3)',
        boxShadow: 'inset 0 0 60px hsl(43 72% 52% / 0.06)',
      }}
    >
      {/* Decorative inner border */}
      <div
        className="absolute inset-3 rounded-xl border border-dashed"
        style={{ borderColor: 'hsl(43 72% 52% / 0.25)' }}
      />

      <div className="text-center px-4 relative z-10">
        <p className="font-display text-lg md:text-2xl font-semibold text-foreground/80">
          💃 Dance Floor
        </p>
        <p className="font-body text-base md:text-lg text-primary/80 mt-1 italic">
          Valle Shqiptare
        </p>
        <div className="mt-3 w-16 h-px bg-primary/30 mx-auto" />
        <p className="font-ui text-xs md:text-sm text-muted-foreground mt-3 tracking-widest uppercase">
          Edmond & Ajlin
        </p>
        <p className="font-ui text-xs text-muted-foreground">
          9 May
        </p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
