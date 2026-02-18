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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute flex flex-col items-center gap-2"
      style={{
        left: `calc(50% + ${table.x}px)`,
        top: `calc(50% + ${table.y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Couple label */}
      <p className="font-display text-xs font-semibold text-foreground/70 tracking-wide uppercase mb-1">
        ✨ Couple Table ✨
      </p>

      <div className="flex items-center gap-3">
        {table.seats.map((seat) => {
          const occupied = seat.guest !== null;
          return (
            <button
              key={seat.id}
              onClick={() => onSeatClick(table.id, seat.id)}
              className={`rounded-xl flex items-center justify-center transition-all duration-200 font-ui shadow-md
                ${occupied
                  ? 'gold-gradient text-primary-foreground'
                  : 'bg-card border-2 border-primary/40 hover:border-primary/70'
                }`}
              style={{ width: 100, height: 44 }}
              title={seat.guest?.name || `Seat ${seat.id}`}
            >
              {occupied ? (
                <span className="text-xs font-medium truncate px-2">
                  {seat.guest!.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {seat.id === 1 ? 'Edmond' : 'Ajlin'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Decorative table surface */}
      <div
        className="w-[220px] h-3 rounded-b-xl bg-card border-x-2 border-b-2 border-primary/20"
      />
    </motion.div>
  );
};

export default CoupleTable;
