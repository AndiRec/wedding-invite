import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { List, RotateCcw, Download, ZoomIn, ZoomOut, Printer } from 'lucide-react';
import RoundTable from '@/components/RoundTable';
import DanceFloor from '@/components/DanceFloor';
import GuestModal from '@/components/GuestModal';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import GuestListPanel from '@/components/GuestListPanel';
import {
  TableData,
  loadSeatingData,
  saveSeatingData,
  getStats,
  generateInitialLayout,
  STORAGE_KEY,
} from '@/lib/seating-data';

const Index = () => {
  const [tables, setTables] = useState<TableData[]>(loadSeatingData);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(0.55);
  const [showGuestList, setShowGuestList] = useState(false);
  const [modal, setModal] = useState<{ tableId: number; seatId: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save
  useEffect(() => {
    saveSeatingData(tables);
  }, [tables]);

  // Highlighted guests from search
  const highlighted = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.toLowerCase();
    const names = new Set<string>();
    tables.forEach(t => t.seats.forEach(s => {
      if (s.guest && s.guest.name.toLowerCase().includes(q)) {
        names.add(s.guest.name.toLowerCase());
      }
    }));
    return names;
  }, [search, tables]);

  const stats = useMemo(() => getStats(tables), [tables]);

  const handleSeatClick = useCallback((tableId: number, seatId: number) => {
    setModal({ tableId, seatId });
  }, []);

  const handleFamilyNameChange = useCallback((tableId: number, name: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, familyName: name } : t));
  }, []);

  const currentSeat = useMemo(() => {
    if (!modal) return null;
    const table = tables.find(t => t.id === modal.tableId);
    if (!table) return null;
    const seat = table.seats.find(s => s.id === modal.seatId);
    return { table, seat: seat || null };
  }, [modal, tables]);

  const handleSaveGuest = useCallback((name: string) => {
    if (!modal) return;
    setTables(prev => prev.map(t => {
      if (t.id !== modal.tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === modal.seatId ? { ...s, guest: { name } } : s),
      };
    }));
  }, [modal]);

  const handleDeleteGuest = useCallback(() => {
    if (!modal) return;
    setTables(prev => prev.map(t => {
      if (t.id !== modal.tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === modal.seatId ? { ...s, guest: null } : s),
      };
    }));
  }, [modal]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all seating? This cannot be undone.')) {
      const fresh = generateInitialLayout();
      setTables(fresh);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify({ tables, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seating-edmond-ajlin.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tables]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Pan handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  };

  const onPointerUp = () => setIsPanning(false);

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(1.5, Math.max(0.25, z - e.deltaY * 0.001)));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-30 px-4 py-3 md:px-6 md:py-4 border-b border-border bg-card/80 backdrop-blur-md print:hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold gold-text leading-tight">
                Edmond & Ajlin
              </h1>
              <p className="font-ui text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase">
                Wedding Seating · 9 May
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatsBar total={stats.totalSeats} filled={stats.filledSeats} empty={stats.emptySeats} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 md:w-48">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button
              onClick={() => setShowGuestList(true)}
              className="p-2 rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors"
              title="Guest List"
            >
              <List className="w-4 h-4 text-foreground/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="relative z-20 flex items-center gap-1.5 px-4 py-2 bg-card/60 backdrop-blur-sm border-b border-border print:hidden">
        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4 text-foreground/60" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4 text-foreground/60" />
        </button>
        <span className="font-ui text-[10px] text-muted-foreground min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Print">
          <Printer className="w-4 h-4 text-foreground/60" />
        </button>
        <button onClick={handleExportJSON} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Export JSON">
          <Download className="w-4 h-4 text-foreground/60" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Reset All">
          <RotateCcw className="w-4 h-4 text-destructive/70" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => { setPan({ x: 0, y: 0 }); setZoom(0.55); }}
          className="font-ui text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
        >
          Center
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        {/* Subtle pattern bg */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(43 72% 52%) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {/* Floor area indicator - rectangular */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/20"
            style={{ width: 1200, height: 850 }}
          />

          <DanceFloor />

          {tables.map(table => (
            <RoundTable
              key={table.id}
              table={table}
              onSeatClick={handleSeatClick}
              onFamilyNameChange={handleFamilyNameChange}
              highlighted={highlighted}
              scale={zoom}
            />
          ))}
        </div>
      </div>

      {/* Mobile hint */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 print:hidden">
        <p className="font-ui text-[10px] text-muted-foreground bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
          Pinch to zoom · Drag to pan
        </p>
      </div>

      {/* Guest modal */}
      <GuestModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        onSave={handleSaveGuest}
        onDelete={handleDeleteGuest}
        currentName={currentSeat?.seat?.guest?.name || null}
        tableLabel={currentSeat?.table.label || ''}
        seatId={modal?.seatId || 0}
      />

      {/* Guest list panel */}
      <GuestListPanel
        tables={tables}
        isOpen={showGuestList}
        onClose={() => setShowGuestList(false)}
        onSeatClick={handleSeatClick}
        searchQuery={search}
      />
    </div>
  );
};

export default Index;
