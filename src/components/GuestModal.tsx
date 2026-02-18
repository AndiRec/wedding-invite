import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, UserPlus } from 'lucide-react';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onDelete: () => void;
  currentName: string | null;
  tableLabel: string;
  seatId: number;
}

const GuestModal: React.FC<GuestModalProps> = ({ isOpen, onClose, onSave, onDelete, currentName, tableLabel, seatId }) => {
  const [name, setName] = useState(currentName || '');

  React.useEffect(() => {
    setName(currentName || '');
  }, [currentName, isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {currentName ? 'Ndrysho Mysafirin' : 'Shto Mysafir'}
                </h3>
                <p className="font-ui text-xs text-muted-foreground mt-0.5">
                  {tableLabel} · Ulëse {seatId}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="relative mb-5">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Emri i mysafirit..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/60 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none font-body text-base text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>

            <div className="flex gap-2">
              {currentName && (
                <button
                  onClick={() => { onDelete(); onClose(); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-ui text-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hiq
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl gold-gradient text-primary-foreground font-ui text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
              >
                {currentName ? 'Përditëso' : 'Shto Mysafir'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuestModal;
