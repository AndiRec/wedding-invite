import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TableData, Seat } from '@/lib/seating-data';

interface RoundTableProps {
  table: TableData;
  onSeatClick: (tableId: number, seatId: number) => void;
  onFamilyNameChange: (tableId: number, name: string) => void;
  highlighted: Set<string>;
  scale: number;
}

const RoundTable: React.FC<RoundTableProps> = ({ table, onSeatClick, onFamilyNameChange, highlighted }) => {
  const [editingFamily, setEditingFamily] = useState(false);
  const [familyInput, setFamilyInput] = useState(table.familyName);

  const tableSize = 72;
  const chairDistance = 58;
  const chairSize = 34;

  const handleFamilySubmit = () => {
    onFamilyNameChange(table.id, familyInput);
    setEditingFamily(false);
  };

  const isHighlighted = (seat: Seat) => {
    if (!seat.guest) return false;
    return highlighted.has(seat.guest.name.toLowerCase());
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: table.id * 0.02 }}
      className="absolute"
      style={{
        left: `calc(50% + ${table.x}px)`,
        top: `calc(50% + ${table.y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Seats around table */}
      {table.seats.map((seat, i) => {
        const angle = (i / table.seats.length) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(angle) * chairDistance;
        const cy = Math.sin(angle) * chairDistance;
        const occupied = seat.guest !== null;
        const hl = isHighlighted(seat);

        return (
          <button
            key={seat.id}
            onClick={() => onSeatClick(table.id, seat.id)}
            className={`absolute rounded-full flex items-center justify-center transition-all duration-200 font-ui
              ${occupied
                ? hl
                  ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary animate-pulse-gold'
                  : 'bg-primary/80 text-primary-foreground shadow-md hover:bg-primary'
                : 'bg-secondary hover:bg-champagne border border-border hover:border-primary/40'
              }`}
            style={{
              width: chairSize,
              height: chairSize,
              left: `calc(50% + ${cx}px - ${chairSize / 2}px)`,
              top: `calc(50% + ${cy}px - ${chairSize / 2}px)`,
            }}
            title={seat.guest?.name || `Seat ${seat.id} - Click to add guest`}
          >
            {occupied ? (
              <span
                className="truncate max-w-[30px] text-center leading-tight px-0.5"
                style={{ fontSize: '6px' }}
              >
                {seat.guest!.name}
              </span>
            ) : (
              <span className="text-muted-foreground" style={{ fontSize: '9px' }}>{seat.id}</span>
            )}
          </button>
        );
      })}

      {/* Table center */}
      <div
        className="absolute rounded-full bg-card border-2 border-primary/30 shadow-md flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 transition-colors"
        style={{
          width: tableSize,
          height: tableSize,
          left: `calc(50% - ${tableSize / 2}px)`,
          top: `calc(50% - ${tableSize / 2}px)`,
        }}
        onClick={() => setEditingFamily(true)}
      >
        <span className="font-ui text-[8px] font-semibold text-foreground/70 tracking-wide uppercase">
          {table.label}
        </span>
        {editingFamily ? (
          <input
            autoFocus
            value={familyInput}
            onChange={e => setFamilyInput(e.target.value)}
            onBlur={handleFamilySubmit}
            onKeyDown={e => e.key === 'Enter' && handleFamilySubmit()}
            className="w-[55px] text-[7px] text-center bg-transparent border-b border-primary/40 outline-none font-body mt-0.5"
            placeholder="Family"
          />
        ) : (
          table.familyName && (
            <span className="font-body text-[7px] text-primary/80 italic mt-0.5 truncate max-w-[55px]">
              {table.familyName}
            </span>
          )
        )}
        <span className="text-[7px] text-muted-foreground mt-0.5 font-ui">
          {table.seats.filter(s => s.guest).length}/{table.seats.length}
        </span>
      </div>
    </motion.div>
  );
};

export default RoundTable;
