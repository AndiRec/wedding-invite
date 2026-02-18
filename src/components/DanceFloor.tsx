import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full flex flex-col items-center justify-center z-10"
      style={{
        background: 'radial-gradient(circle, hsl(43 72% 52% / 0.15), hsl(43 72% 52% / 0.05))',
        border: '2px dashed hsl(43 72% 52% / 0.4)',
      }}
    >
      <div className="text-center px-4">
        <p className="font-display text-base md:text-lg font-semibold text-foreground/80">
          💃 Dance Floor
        </p>
        <p className="font-body text-sm md:text-base text-primary/80 mt-1 italic">
          Valle Shqiptare
        </p>
        <div className="mt-2 w-12 h-px bg-primary/30 mx-auto" />
        <p className="font-ui text-[10px] md:text-xs text-muted-foreground mt-2 tracking-wide uppercase">
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
