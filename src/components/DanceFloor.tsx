import React from 'react';
import { motion } from 'framer-motion';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-10"
      style={{
        width: 200,
        height: 850,
        top: 'calc(50% + 30px)',
        background: 'linear-gradient(180deg, hsl(43 72% 52% / 0.08), hsl(43 72% 52% / 0.15), hsl(43 72% 52% / 0.08))',
        border: '2px solid hsl(43 72% 52% / 0.3)',
        borderRadius: 16,
        boxShadow: 'inset 0 0 60px hsl(43 72% 52% / 0.06), 0 0 40px hsl(43 72% 52% / 0.05)',
      }}
    >
      <div
        className="absolute inset-3 border border-dashed rounded-xl"
        style={{ borderColor: 'hsl(43 72% 52% / 0.2)' }}
      />
      <div className="text-center relative z-10">
        <p className="text-3xl mb-3">💃</p>
        <p className="font-display text-sm font-bold text-foreground/80 tracking-wide">
          Dance Floor
        </p>
        <p className="font-body text-sm text-primary/80 italic mt-1">
          Valle Shqiptare
        </p>
        <div className="mt-4 w-12 h-px bg-primary/30 mx-auto" />
        <p className="font-ui text-[10px] text-muted-foreground mt-4 tracking-[0.2em] uppercase">
          Edmond & Ajlin
        </p>
        <p className="font-ui text-[10px] text-muted-foreground mt-0.5">9 May</p>
        <p className="text-3xl mt-3">🕺</p>
      </div>
    </motion.div>
  );
};

export default DanceFloor;
