import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { List, RotateCcw, Download, ZoomIn, ZoomOut, Printer, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoundTable from '@/components/RoundTable';
import CoupleTable from '@/components/CoupleTable';
import DanceFloor from '@/components/DanceFloor';
import GuestModal from '@/components/GuestModal';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import GuestListPanel from '@/components/GuestListPanel';
import { supabase } from '@/integrations/supabase/client';
import { loadFromDB, seedInitialData, updateGuest, updateFamilyName, updateSeatCount } from '@/lib/supabase-data';
import type { TableData } from '@/lib/seating-data';
import { getStats, generateInitialLayout } from '@/lib/seating-data';

const Index = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.3 : 0.45);
  const [showGuestList, setShowGuestList] = useState(false);
  const [modal, setModal] = useState<{ tableId: number; seatId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check auth & load data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setIsAuth(true);

      // Load data
      let data = await loadFromDB();
      if (data.length === 0) {
        await seedInitialData();
        data = await loadFromDB();
      }
      setTables(data);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!isAuth) return;
    const channel = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, async () => {
        const data = await loadFromDB();
        setTables(data);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, async () => {
        const data = await loadFromDB();
        setTables(data);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuth]);

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

  const handleFamilyNameChange = useCallback(async (tableId: number, name: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, familyName: name } : t));
    await updateFamilyName(tableId, name);
  }, []);

  const handleSaveTable = useCallback(async (tableId: number, seatCount: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const occupied = t.seats.filter(s => s.guest !== null);
      const empty = t.seats.filter(s => s.guest === null);
      let newSeats;
      if (seatCount <= occupied.length) {
        newSeats = occupied.slice(0, seatCount);
      } else {
        const emptyNeeded = seatCount - occupied.length;
        newSeats = [...occupied, ...empty.slice(0, emptyNeeded)];
        const maxId = Math.max(...t.seats.map(s => s.id), 0);
        for (let i = newSeats.length; i < seatCount; i++) {
          newSeats.push({ id: maxId + (i - newSeats.length) + 1, guest: null });
        }
      }
      newSeats = newSeats.map((s, idx) => ({ ...s, id: idx + 1 }));
      // Async DB update
      updateSeatCount(tableId, seatCount, newSeats);
      return { ...t, seats: newSeats };
    }));
  }, []);

  const currentSeat = useMemo(() => {
    if (!modal) return null;
    const table = tables.find(t => t.id === modal.tableId);
    if (!table) return null;
    const seat = table.seats.find(s => s.id === modal.seatId);
    return { table, seat: seat || null };
  }, [modal, tables]);

  const handleSaveGuest = useCallback(async (name: string) => {
    if (!modal) return;
    setTables(prev => prev.map(t => {
      if (t.id !== modal.tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === modal.seatId ? { ...s, guest: { name } } : s),
      };
    }));
    await updateGuest(modal.tableId, modal.seatId, name);
  }, [modal]);

  const handleDeleteGuest = useCallback(async () => {
    if (!modal) return;
    setTables(prev => prev.map(t => {
      if (t.id !== modal.tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === modal.seatId ? { ...s, guest: null } : s),
      };
    }));
    await updateGuest(modal.tableId, modal.seatId, null);
  }, [modal]);

  const handleReset = useCallback(async () => {
    if (window.confirm('Rivendos të gjitha ulëset? Ky veprim nuk mund të zhbëhet.')) {
      setLoading(true);
      // Delete all seats then tables, then re-seed
      await supabase.from('seats').delete().neq('id', 0);
      await supabase.from('tables').delete().neq('id', -999);
      await seedInitialData();
      const data = await loadFromDB();
      setTables(data);
      setLoading(false);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify({ tables, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uleset-edmond-ajlin.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tables]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(1.5, Math.max(0.25, z - e.deltaY * 0.001)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-ui text-muted-foreground">Duke ngarkuar...</p>
      </div>
    );
  }

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
                Plani i Ulëseve · 9 Maj
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
              title="Lista e Mysafirëve"
            >
              <List className="w-4 h-4 text-foreground/70" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-secondary hover:bg-destructive/20 border border-border transition-colors"
              title="Dil"
            >
              <LogOut className="w-4 h-4 text-foreground/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="relative z-20 flex items-center gap-1.5 px-4 py-2 bg-card/60 backdrop-blur-sm border-b border-border print:hidden">
        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Zmadho">
          <ZoomIn className="w-4 h-4 text-foreground/60" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Zvogëlo">
          <ZoomOut className="w-4 h-4 text-foreground/60" />
        </button>
        <span className="font-ui text-[10px] text-muted-foreground min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Printo">
          <Printer className="w-4 h-4 text-foreground/60" />
        </button>
        <button onClick={handleExportJSON} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Eksporto JSON">
          <Download className="w-4 h-4 text-foreground/60" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Rivendos">
          <RotateCcw className="w-4 h-4 text-destructive/70" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => { setZoom(window.innerWidth < 768 ? 0.3 : 0.45); }}
          className="font-ui text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
        >
          Qendro
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto"
        onWheel={onWheel}
      >
        <div className="mx-auto" style={{ width: 1300 * zoom, height: 1500 * zoom }}>
          <div className="relative" style={{ width: 1300, height: 1500, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <div className="absolute inset-0 rounded-2xl border border-border/15" />
            <DanceFloor />
            {tables.map(table => (
              table.isCouple ? (
                <CoupleTable key={table.id} table={table} onSeatClick={handleSeatClick} />
              ) : (
                <RoundTable
                  key={table.id}
                  table={table}
                  onSeatClick={handleSeatClick}
                  onFamilyNameChange={handleFamilyNameChange}
                  onSaveTable={handleSaveTable}
                  highlighted={highlighted}
                  scale={zoom}
                />
              )
            ))}
          </div>
        </div>
      </div>

      {/* Mobile hint */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-20 print:hidden">
        <p className="font-ui text-[10px] text-muted-foreground bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
          Zoom me gishta · Lëviz për të parë
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
