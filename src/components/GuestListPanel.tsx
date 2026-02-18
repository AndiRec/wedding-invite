import React from 'react';
import { TableData } from '@/lib/seating-data';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';

interface GuestListPanelProps {
  tables: TableData[];
  isOpen: boolean;
  onClose: () => void;
  onSeatClick: (tableId: number, seatId: number) => void;
  searchQuery: string;
}

const GuestListPanel: React.FC<GuestListPanelProps> = ({ tables, isOpen, onClose, onSeatClick, searchQuery }) => {
  const allGuests = tables.flatMap(t =>
    t.seats
      .filter(s => s.guest)
      .map(s => ({ tableName: t.label, familyName: t.familyName, seatId: s.id, tableId: t.id, name: s.guest!.name }))
  );

  const filtered = searchQuery
    ? allGuests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allGuests;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 max-w-full glass-card shadow-2xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">Guest List</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground text-center mt-8">
                {searchQuery ? 'No guests found' : 'No guests added yet'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {filtered.map((g, i) => (
                  <button
                    key={`${g.tableId}-${g.seatId}`}
                    onClick={() => { onSeatClick(g.tableId, g.seatId); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors group"
                  >
                    <p className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {g.name}
                    </p>
                    <p className="font-ui text-[10px] text-muted-foreground">
                      {g.tableName}{g.familyName ? ` · ${g.familyName}` : ''} · Seat {g.seatId}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <p className="font-ui text-xs text-muted-foreground text-center">
              {filtered.length} guest{filtered.length !== 1 ? 's' : ''} {searchQuery ? 'found' : 'total'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuestListPanel;
