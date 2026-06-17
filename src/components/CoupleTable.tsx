import React from 'react';
import { motion } from 'framer-motion';
import type { TableData } from '@/lib/seating-data';

interface CoupleTableProps {
  table: TableData;
  onSeatClick: (tableId: number, seatId: number) => void;
  readOnly?: boolean;
}

const CoupleTable: React.FC<CoupleTableProps> = ({ table, onSeatClick, readOnly }) => {
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
       Partneri1 & Partneri2 ❤️
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
            return (
              <div
                key={seat.id}
                className="rounded-xl flex items-center justify-center gold-gradient text-primary-foreground shadow-md"
                style={{ width: 100, height: 40 }}
              >
                <span className="text-xs font-semibold truncate px-2">
                  {seat.id === 1 ? 'Partneri1' : 'Partneri2'}
                </span>
              </div>
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
