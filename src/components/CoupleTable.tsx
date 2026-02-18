import React from 'react';
import { motion } from 'framer-motion';
import type { TableData } from '@/lib/seating-data';

interface CoupleTableProps {
  table: TableData;
  onSeatClick: (tableId: number, seatId: number) => void;
}

const CoupleTable: React.FC<CoupleTableProps> = ({ table, onSeatClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="absolute flex flex-col items-center"
      style={{
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 'fit-content',
        top: `calc(50% + ${table.y}px)`,
        zIndex: 20,
      }}
    >
      {/* Label */}
      <p className="font-display text-sm font-bold gold-text tracking-wide mb-2">
        ✨ Edmond & Ajlin ✨
      </p>

      {/* Table visual */}
      <div className="relative">
        {/* Table surface */}
        <div
          className="rounded-2xl border-2 border-primary/40 shadow-lg flex items-center justify-center gap-4 px-6 py-3"
          style={{
            width: 260,
            height: 60,
            background: 'linear-gradient(135deg, hsl(40 40% 98%), hsl(43 60% 92%))',
            boxShadow: '0 4px 20px hsl(43 72% 52% / 0.15)',
          }}
        >
          {table.seats.map((seat) => {
            const occupied = seat.guest !== null;
            return (
              <button
                key={seat.id}
                onClick={() => onSeatClick(table.id, seat.id)}
                className={`rounded-xl flex items-center justify-center transition-all duration-200 font-ui
                  ${occupied
                    ? 'gold-gradient text-primary-foreground shadow-md'
                    : 'bg-card border-2 border-primary/30 hover:border-primary/60'
                  }`}
                style={{ width: 100, height: 40 }}
                title={seat.guest?.name || (seat.id === 1 ? 'Edmond' : 'Ajlin')}
              >
                {occupied ? (
                  <span className="text-xs font-semibold truncate px-2">
                    {seat.guest!.name}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {seat.id === 1 ? 'Edmond' : 'Ajlin'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table legs decoration */}
        <div className="flex justify-center mt-1">
          <div className="w-[200px] h-2 rounded-b-xl" style={{ background: 'hsl(43 60% 85%)' }} />
        </div>
      </div>

      <p className="font-ui text-[9px] text-muted-foreground mt-2 tracking-widest uppercase">
        Couple Table
      </p>
    </motion.div>
  );
};

export default CoupleTable;
