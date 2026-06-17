import React from 'react';
import { motion } from 'framer-motion';
import { COUPLE } from '@/lib/i18n';

const DanceFloor: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute flex flex-col items-center justify-center z-10 rounded-2xl"
      style={{
        width: 220,
        height: 950,
        left: '50%',
        top: 'calc(50% - 240px)',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(180deg, hsl(43 72% 52% / 0.06), hsl(43 72% 52% / 0.12), hsl(43 72% 52% / 0.06))',
        border: '2px dashed hsl(43 72% 52% / 0.25)',
        boxShadow: 'inset 0 0 80px hsl(43 72% 52% / 0.04)',
      }}
    >
      {/* Top decoration */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="w-12 h-px bg-primary/20" />
      </div>

      <div className="text-center relative z-10 space-y-3">
        <p className="text-3xl">💃🕺</p>
        <div>
          <p className="font-display text-sm font-bold text-foreground/80 tracking-wide">
            Pista e Vallëzimit
          </p>
          <p className="font-body text-xs text-primary/70 italic mt-1">
            Valle Shqiptare
          </p>
        </div>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto" />
        <div>
          <p className="font-display text-sm font-semibold gold-text tracking-wide">
            {COUPLE.partner1} & {COUPLE.partner2}
          </p>
          <p className="font-ui text-[10px] text-muted-foreground mt-0.5 tracking-[0.2em] uppercase">
            {COUPLE.dateLabel}
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="w-12 h-px bg-primary/20" />
      </div>
    </motion.div>
  );
};

export default DanceFloor;
