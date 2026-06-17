import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { TableData, Seat } from '@/lib/seating-data';

interface RoundTableProps {
  table: TableData;
  onSeatClick: (tableId: number, seatId: number) => void;
  onFamilyNameChange: (tableId: number, name: string) => void;
  onSaveTable: (tableId: number, seatCount: number) => void;
  onTableLabelChange?: (tableId: number, label: string) => void;
  highlighted: Set<string>;
  scale: number;
  isHighlighted?: boolean;
  readOnly?: boolean;
}

const RoundTable: React.FC<RoundTableProps> = ({ table, onSeatClick, onFamilyNameChange, onSaveTable, onTableLabelChange, highlighted, isHighlighted, readOnly }) => {
  const [familyInput, setFamilyInput] = useState(table.familyName);
  const [labelInput, setLabelInput] = useState(table.label);
  const [showSeatEditor, setShowSeatEditor] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFamilyInput(table.familyName);
  }, [table.familyName]);

  useEffect(() => {
    setLabelInput(table.label);
  }, [table.label]);

  // Close editor when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowSeatEditor(false);
      }
    };

    if (showSeatEditor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSeatEditor]);

  const tableSize = 78;
  const chairDistance = 62;
  const chairSize = 36;

  const isHighlightedSeat = (seat: Seat) => {
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
    const minSeats = Math.max(1, occupiedCount);
    if (currentCount > minSeats) {
      onSaveTable(table.id, currentCount - 1);
    }
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
      {/* Highlight ring when navigated to from search */}
      {isHighlighted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.3, opacity: [0, 1, 0.5, 1, 0] }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute rounded-full border-3 border-primary"
          style={{
            width: chairDistance * 2 + chairSize + 20,
            height: chairDistance * 2 + chairSize + 20,
            left: `calc(50% - ${(chairDistance * 2 + chairSize + 20) / 2}px)`,
            top: `calc(50% - ${(chairDistance * 2 + chairSize + 20) / 2}px)`,
            boxShadow: '0 0 30px hsl(43 72% 52% / 0.4)',
          }}
        />
      )}

      {/* Seats around table */}
      {table.seats.map((seat, i) => {
        const angle = (i / table.seats.length) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(angle) * chairDistance;
        const cy = Math.sin(angle) * chairDistance;
        const occupied = seat.guest !== null;
        const hl = isHighlightedSeat(seat);

        return (
          <motion.button
            key={seat.id}
            layout
            onClick={() => !readOnly && onSeatClick(table.id, seat.id)}
            className={`absolute rounded-full flex items-center justify-center transition-colors duration-200 font-ui touch-manipulation
              ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              ${occupied
                ? hl
                  ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] ring-4 ring-red-400 animate-pulse-gold scale-125 z-50'
                  : readOnly
                    ? 'bg-primary/80 text-primary-foreground shadow-md'
                    : 'bg-primary/80 text-primary-foreground shadow-md hover:bg-primary active:bg-primary'
                : readOnly
                  ? 'bg-secondary border border-border'
                  : 'bg-secondary hover:bg-champagne active:bg-champagne border border-border hover:border-primary/40'
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
                className="truncate max-w-[32px] text-center leading-tight px-0.5"
                style={{ fontSize: '9px', fontWeight: 600 }}
              >
                {seat.guest!.name}
              </span>
            ) : (
              <span className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 600 }}>{seat.id}</span>
            )}
          </motion.button>
        );
      })}

      {/* Table center */}
      <div
        className={`absolute rounded-full bg-card border-2 shadow-md flex flex-col items-center justify-center transition-colors touch-manipulation ${
          readOnly ? 'cursor-default' : 'cursor-pointer'
        } ${
          isHighlighted ? 'border-primary shadow-lg' : readOnly ? 'border-primary/30' : 'border-primary/30 hover:border-primary/60'
        }`}
        style={{
          width: tableSize,
          height: tableSize,
          left: `calc(50% - ${tableSize / 2}px)`,
          top: `calc(50% - ${tableSize / 2}px)`,
        }}
        onClick={() => !readOnly && setShowSeatEditor(prev => !prev)}
      >
        {table.familyName ? (
          <>
            <span className="font-body text-[9px] text-primary/90 font-semibold truncate max-w-[65px] text-center leading-tight">
              {table.familyName}
            </span>
            <span className="font-ui text-[7px] text-foreground/60 tracking-wide uppercase">
              {table.label}
            </span>
          </>
        ) : (
          <span className="font-ui text-[11px] font-semibold text-foreground/70 tracking-wide uppercase">
            {table.label}
          </span>
        )}
        <span className="text-[8px] text-muted-foreground mt-0.5 font-ui">
          {occupiedCount}/{currentCount}
        </span>
      </div>

      {/* Seat editor popover */}
      <AnimatePresence>
        {showSeatEditor && !readOnly && (
          <motion.div
            ref={editorRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bg-card border-2 border-primary/30 rounded-xl shadow-xl p-2.5 flex flex-col gap-2 items-center"
            style={{
              left: `calc(50% - 60px)`,
              top: `calc(50% + ${tableSize / 2 + 10}px)`,
              width: 120,
            }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            {/* Table label input */}
            <input
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onBlur={() => onTableLabelChange?.(table.id, labelInput)}
              onKeyDown={e => e.key === 'Enter' && onTableLabelChange?.(table.id, labelInput)}
              className="w-full text-[10px] text-center bg-secondary/50 border border-border rounded-md px-1.5 py-1.5 outline-none font-ui font-semibold touch-manipulation"
              placeholder="Nr. tavolinës"
            />

            {/* Family name input */}
            <input
              value={familyInput}
              onChange={e => setFamilyInput(e.target.value)}
              onBlur={() => onFamilyNameChange(table.id, familyInput)}
              onKeyDown={e => e.key === 'Enter' && onFamilyNameChange(table.id, familyInput)}
              className="w-full text-[10px] text-center bg-secondary/50 border border-border rounded-md px-1.5 py-1.5 outline-none font-body touch-manipulation"
              placeholder="Emri familjes"
            />

            {/* Seat count controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRemoveSeat}
                disabled={currentCount <= Math.max(1, occupiedCount)}
                className="w-7 h-7 rounded-full bg-secondary hover:bg-destructive/20 active:bg-destructive/30 flex items-center justify-center disabled:opacity-30 transition-colors touch-manipulation"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-ui text-xs font-semibold min-w-[24px] text-center">
                {currentCount}
              </span>
              <button
                onClick={handleAddSeat}
                disabled={currentCount >= 12}
                className="w-7 h-7 rounded-full bg-secondary hover:bg-primary/20 active:bg-primary/30 flex items-center justify-center disabled:opacity-30 transition-colors touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[8px] text-muted-foreground font-ui">ulëse</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoundTable;
