import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 rounded-2xl"
      style={{
        width: 180,
        height: 820,
        marginTop: 40,
        background: 'linear-gradient(180deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.15))',
        border: '2px solid hsl(var(--primary) / 0.35)',
        boxShadow: 'inset 0 0 80px hsl(var(--primary) / 0.08)',
      }}
    >
      <div className="text-center relative z-10">
        <p className="text-2xl mb-2">💃</p>
        <p className="font-display text-sm font-bold text-foreground/80 tracking-wide">
          Dance Floor
        </p>
        <p className="font-body text-xs text-primary/80 italic mt-1">
          Valle Shqiptare
        </p>
        <div className="mt-3 w-10 h-px bg-primary/30 mx-auto" />
        <p className="font-ui text-[10px] text-muted-foreground mt-3 tracking-[0.15em] uppercase">
          Edmond & Ajlin
        </p>
        <p className="font-ui text-[10px] text-muted-foreground mt-0.5">9 May</p>
        <p className="text-2xl mt-2">🕺</p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
