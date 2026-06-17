import React, { useState } from 'react';
import { TableData } from '@/lib/seating-data';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';

interface GuestListPanelProps {
  tables: TableData[];
  isOpen: boolean;
  onClose: () => void;
  onSeatClick: (tableId: number, seatId: number) => void;
  searchQuery: string;
  onDeleteTable?: (tableId: number) => void;
  onAddGuestToTable?: (tableId: number, seatId: number, name: string) => void;
  onRemoveGuest?: (tableId: number, seatId: number) => void;
}

const GuestListPanel: React.FC<GuestListPanelProps> = ({
  tables,
  isOpen,
  onClose,
  onSeatClick,
  searchQuery,
  onDeleteTable,
  onAddGuestToTable,
  onRemoveGuest,
}) => {
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());
  const [addingToTable, setAddingToTable] = useState<number | null>(null);
  const [newGuestName, setNewGuestName] = useState('');

  const toggleTable = (tableId: number) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  };

  const handleAddGuest = (tableId: number) => {
    if (!newGuestName.trim()) return;
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    const emptySeat = table.seats.find(s => !s.guest);
    if (!emptySeat) return;
    onAddGuestToTable?.(tableId, emptySeat.id, newGuestName.trim());
    setNewGuestName('');
    setAddingToTable(null);
  };

  const handleDeleteTable = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    const label = table?.familyName || `Tavolina ${tableId}`;
    if (window.confirm(`Dëshironi të hiqni ${label}? Të gjithë mysafirët do të hiqen.`)) {
      onDeleteTable?.(tableId);
    }
  };

  // Extract numeric part from label for sorting (e.g. "Table 3" -> 3, "N.3" -> 3)
  const getLabelNumber = (label: string) => {
    const match = label.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  // Filter non-couple tables, optionally by search query
  const filteredTables = tables
    .filter(t => !t.isCouple)
    .sort((a, b) => getLabelNumber(a.label) - getLabelNumber(b.label))
    .filter(t => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = t.familyName?.toLowerCase().includes(q);
      const guestMatch = t.seats.some(s => s.guest && s.guest.name.toLowerCase().includes(q));
      const labelMatch = t.label.toLowerCase().includes(q);
      return nameMatch || guestMatch || labelMatch;
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-full sm:w-96 max-w-full glass-card shadow-2xl z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">Lista e Tavolinave</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredTables.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground text-center mt-8">
                {searchQuery ? 'Asnjë tavolinë e gjetur' : 'Asnjë tavolinë'}
              </p>
            ) : (
              filteredTables.map(table => {
                const isExpanded = expandedTables.has(table.id);
                const guests = table.seats.filter(s => s.guest);
                const emptySeats = table.seats.filter(s => !s.guest);
                const fillPct = table.seats.length > 0 ? (guests.length / table.seats.length) * 100 : 0;

                return (
                  <div key={table.id} className="border border-border rounded-xl overflow-hidden bg-card/60">
                    {/* Table header row */}
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTable(table.id)}
                        className="flex-1 flex items-center gap-3 p-3 transition-colors hover:bg-secondary/30 active:bg-secondary/50"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-ui text-xs font-bold text-primary">{getLabelNumber(table.label)}</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-ui text-sm font-semibold text-foreground truncate">
                            {table.label}
                            {table.familyName ? ` · ${table.familyName}` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[80px]">
                              <div
                                className="h-full bg-primary/60 rounded-full transition-all"
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                            <span className="font-ui text-[10px] text-muted-foreground">
                              {guests.length}/{table.seats.length}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {/* Remove table button */}
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="p-2.5 mr-1 rounded-lg hover:bg-destructive/10 active:bg-destructive/20 transition-colors"
                        title="Hiq Tavolinën"
                      >
                        <Trash2 className="w-4 h-4 text-destructive/70" />
                      </button>
                    </div>

                    {/* Expanded content: guests dropdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-1.5 border-t border-border/50 pt-2">
                            {/* Guests list */}
                            {guests.length > 0 ? (
                              guests.map(seat => (
                                <div
                                  key={seat.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 group"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                      <span className="font-ui text-[9px] font-bold text-primary">
                                        {seat.id}
                                      </span>
                                    </div>
                                    <p className="font-body text-sm font-medium truncate">
                                      {seat.guest!.name}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Hiq ${seat.guest!.name}?`)) {
                                        onRemoveGuest?.(table.id, seat.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                                  >
                                    <X className="w-3.5 h-3.5 text-destructive/70" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground italic text-center py-2">
                                Asnjë mysafir
                              </p>
                            )}

                            {/* Add guest inline form */}
                            {addingToTable === table.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  value={newGuestName}
                                  onChange={e => setNewGuestName(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleAddGuest(table.id);
                                    if (e.key === 'Escape') {
                                      setAddingToTable(null);
                                      setNewGuestName('');
                                    }
                                  }}
                                  placeholder="Emri i mysafirit..."
                                  autoFocus
                                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm font-body placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                />
                                <button
                                  onClick={() => handleAddGuest(table.id)}
                                  disabled={!newGuestName.trim() || emptySeats.length === 0}
                                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-ui text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                                >
                                  Shto
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingToTable(null);
                                    setNewGuestName('');
                                  }}
                                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                >
                                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                              </div>
                            ) : (
                              emptySeats.length > 0 && (
                                <button
                                  onClick={() => {
                                    setAddingToTable(table.id);
                                    setNewGuestName('');
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors mt-1"
                                >
                                  <Plus className="w-4 h-4 text-primary" />
                                  <span className="font-ui text-sm font-medium text-primary">
                                    Shto Mysafir ({emptySeats.length} ulëse lirë)
                                  </span>
                                </button>
                              )
                            )}

                            {emptySeats.length === 0 && addingToTable !== table.id && (
                              <p className="text-[10px] text-amber-600 text-center mt-1">
                                Tavolina është e plotë
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          <div className="p-4 border-t border-border">
            <p className="font-ui text-xs text-muted-foreground text-center">
              {filteredTables.length} tavolina · {filteredTables.reduce((acc, t) => acc + t.seats.filter(s => s.guest).length, 0)} mysafirë
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuestListPanel;
