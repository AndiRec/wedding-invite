import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus } from 'lucide-react';
import type { TableData, Seat } from '@/lib/seating-data';

interface RoundTableProps {
  table: TableData;
  onSeatClick: (tableId: number, seatId: number) => void;
  onFamilyNameChange: (tableId: number, name: string) => void;
  onSaveTable: (tableId: number, seatCount: number) => void;
  highlighted: Set<string>;
  scale: number;
}

const RoundTable: React.FC<RoundTableProps> = ({ table, onSeatClick, onFamilyNameChange, onSaveTable, highlighted }) => {
  const [editingFamily, setEditingFamily] = useState(false);
  const [familyInput, setFamilyInput] = useState(table.familyName);
  const [showSeatEditor, setShowSeatEditor] = useState(false);

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

  const occupiedCount = table.seats.filter(s => s.guest).length;
  const currentCount = table.seats.length;

  const handleAddSeat = () => {
    if (currentCount < 12) {
      onSaveTable(table.id, currentCount + 1);
    }
  };

  const handleRemoveSeat = () => {
    // Don't go below occupied count
    const minSeats = Math.max(1, occupiedCount);
    if (currentCount > minSeats) {
      onSaveTable(table.id, currentCount - 1);
    }
  };

  const handleTrimEmpty = () => {
    if (occupiedCount > 0) {
      onSaveTable(table.id, occupiedCount);
    }
    setShowSeatEditor(false);
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
          <motion.button
            key={seat.id}
            layout
            onClick={() => onSeatClick(table.id, seat.id)}
            className={`absolute rounded-full flex items-center justify-center transition-colors duration-200 font-ui
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
          </motion.button>
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
        onClick={() => setShowSeatEditor(prev => !prev)}
      >
        <span className="font-ui text-[8px] font-semibold text-foreground/70 tracking-wide uppercase">
          {table.label}
        </span>
        {table.familyName && (
          <span className="font-body text-[7px] text-primary/80 italic mt-0.5 truncate max-w-[55px]">
            {table.familyName}
          </span>
        )}
        <span className="text-[7px] text-muted-foreground mt-0.5 font-ui">
          {occupiedCount}/{currentCount}
        </span>
      </div>

      {/* Seat editor popover */}
      <AnimatePresence>
        {showSeatEditor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bg-card border-2 border-primary/30 rounded-xl shadow-xl p-2 flex flex-col gap-1.5 items-center"
            style={{
              left: `calc(50% - 55px)`,
              top: `calc(50% + ${tableSize / 2 + 8}px)`,
              width: 110,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Family name input */}
            <input
              autoFocus
              value={familyInput}
              onChange={e => setFamilyInput(e.target.value)}
              onBlur={() => onFamilyNameChange(table.id, familyInput)}
              onKeyDown={e => e.key === 'Enter' && onFamilyNameChange(table.id, familyInput)}
              className="w-full text-[9px] text-center bg-secondary/50 border border-border rounded-md px-1 py-1 outline-none font-body"
              placeholder="Family name"
            />

            {/* Seat count controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRemoveSeat}
                disabled={currentCount <= Math.max(1, occupiedCount)}
                className="w-5 h-5 rounded-full bg-secondary hover:bg-destructive/20 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-ui text-[10px] font-semibold min-w-[24px] text-center">
                {currentCount}
              </span>
              <button
                onClick={handleAddSeat}
                disabled={currentCount >= 12}
                className="w-5 h-5 rounded-full bg-secondary hover:bg-primary/20 flex items-center justify-center disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[7px] text-muted-foreground">seats</p>

            {/* Trim & Save */}
            {occupiedCount > 0 && occupiedCount < currentCount && (
              <button
                onClick={handleTrimEmpty}
                className="w-full flex items-center justify-center gap-1 text-[8px] font-ui bg-primary/10 hover:bg-primary/20 text-primary rounded-md py-1 transition-colors"
              >
                <Check className="w-3 h-3" />
                Save ({occupiedCount} seats)
              </button>
            )}

            <button
              onClick={() => setShowSeatEditor(false)}
              className="text-[7px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoundTable;
