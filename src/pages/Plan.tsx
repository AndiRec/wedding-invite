import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { List, RotateCcw, Download, Printer, LogOut, Menu, X, ChevronDown, ChevronRight, UserPlus, Trash2, Users, Map, LayoutList, Plus, Minus, Home, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import RoundTable from '@/components/RoundTable';
import CoupleTable from '@/components/CoupleTable';
import DanceFloor from '@/components/DanceFloor';
import GuestModal from '@/components/GuestModal';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import GuestListPanel from '@/components/GuestListPanel';
import { supabase } from '@/integrations/supabase/client';
import { loadFromDB, seedInitialData, updateGuest, updateFamilyName, updateSeatCount, deleteTable, addTable, updateTableLabel } from '@/lib/supabase-data';
import type { TableData } from '@/lib/seating-data';
import { getStats, createEmptyTable } from '@/lib/seating-data';
import { COUPLE, t } from '@/lib/i18n';

const CANVAS_W = 1300;
const CANVAS_H = 1800;

const getInitialScale = () => {
  if (typeof window === 'undefined') return 0.35;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const headerH = w < 768 ? 56 : 120;
  const availW = w;
  const availH = h - headerH;
  return Math.min(availW / CANVAS_W, availH / CANVAS_H, w < 768 ? 0.6 : 0.8);
};

// Floating zoom controls inside TransformWrapper context
const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-20 right-3 md:bottom-4 md:right-4 z-30 flex flex-col gap-1.5 print:hidden">
      <button onClick={() => zoomIn()} className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Plus className="w-4 h-4 text-foreground/70" />
      </button>
      <button onClick={() => zoomOut()} className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Minus className="w-4 h-4 text-foreground/70" />
      </button>
      <button onClick={() => resetTransform()} className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Home className="w-4 h-4 text-foreground/70" />
      </button>
    </div>
  );
};

const Plan = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [search, setSearch] = useState('');
  const [showGuestList, setShowGuestList] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{ tableId: number; seatId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [highlightedTableId, setHighlightedTableId] = useState<number | null>(null);
  const transformRef = useRef<any>(null);
  const navigate = useNavigate();

  // Auth/redirect is owned by <ProtectedRoute>, so by the time this page
  // mounts we already have a session. Just load (and seed) the data.
  useEffect(() => {
    const load = async () => {
      let data = await loadFromDB();
      if (data.length === 0) {
        await seedInitialData();
        data = await loadFromDB();
      }
      setTables(data);
      setIsAuth(true);
      setLoading(false);
    };
    load();
  }, []);

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

  // Clear table highlight after 3 seconds
  useEffect(() => {
    if (highlightedTableId !== null) {
      const timer = setTimeout(() => setHighlightedTableId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedTableId]);

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

  const handleTableLabelChange = useCallback(async (tableId: number, label: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, label } : t));
    await updateTableLabel(tableId, label);
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
    a.download = 'uleset.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tables]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleDeleteTable = useCallback(async (tableId: number) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    await deleteTable(tableId);
  }, []);

  const handleAddTable = useCallback(async () => {
    // Find the next available ID (max non-couple ID + 1)
    const maxId = tables.filter(t => !t.isCouple).reduce((max, t) => Math.max(max, t.id), 0);
    const newId = maxId + 1;

    // Place new table below existing ones
    const lastTable = tables.filter(t => !t.isCouple).sort((a, b) => b.y - a.y)[0];
    const newY = lastTable ? lastTable.y + 170 : 0;
    const newX = lastTable ? lastTable.x : 0;

    const newTable = createEmptyTable(newId, newX, newY, 10);
    setTables(prev => [...prev, newTable]);
    await addTable(newTable);
  }, [tables]);

  const handleAddGuestToTable = useCallback(async (tableId: number, seatId: number, name: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === seatId ? { ...s, guest: { name } } : s),
      };
    }));
    await updateGuest(tableId, seatId, name);
  }, []);

  const handleRemoveGuest = useCallback(async (tableId: number, seatId: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        seats: t.seats.map(s => s.id === seatId ? { ...s, guest: null } : s),
      };
    }));
    await updateGuest(tableId, seatId, null);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Navigate to a specific table on the map (zoom + pan to it)
  const handleNavigateToTable = useCallback((tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Switch to map view on mobile
    setMobileView('map');
    setHighlightedTableId(tableId);

    // Use transformRef to zoom into the table
    setTimeout(() => {
      if (transformRef.current) {
        const centerX = (CANVAS_W / 2 + table.x);
        const centerY = (CANVAS_H / 2 + table.y);
        transformRef.current.setTransform(
          -(centerX * 1.2) + window.innerWidth / 2,
          -(centerY * 1.2) + window.innerHeight / 2.5,
          1.2,
          300,
          'easeOut'
        );
      }
    }, 100);
  }, [tables]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-ui text-sm text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 px-3 py-2 md:px-6 md:py-3 border-b border-border bg-card/80 backdrop-blur-md print:hidden flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          {/* Logo / Title */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-base md:text-xl font-bold gold-text leading-tight">
              {COUPLE.partner1} & {COUPLE.partner2}
            </h1>
            <p className="font-ui text-[8px] md:text-[10px] text-muted-foreground tracking-widest uppercase">
              {t.admin.subtitle}
            </p>
          </div>

          {/* Stats - desktop */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <StatsBar total={stats.totalSeats} filled={stats.filledSeats} empty={stats.emptySeats} />
          </div>

          {/* Stats - mobile compact */}
          <div className="flex md:hidden items-center gap-1.5 ml-auto mr-2">
            <span className="font-ui text-[10px] text-primary font-semibold">{stats.filledSeats}</span>
            <span className="font-ui text-[10px] text-muted-foreground">/</span>
            <span className="font-ui text-[10px] text-muted-foreground">{stats.totalSeats}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden md:block">
            <SearchBar value={search} onChange={setSearch} tables={tables} onNavigateToTable={handleNavigateToTable} />
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={handleAddTable} className="h-9 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors flex items-center justify-center gap-1.5" title="Shto Tavolinë">
              <Plus className="w-4 h-4 text-primary" />
              <span className="font-ui text-xs font-medium text-primary">Tavolinë</span>
            </button>
            <button onClick={() => setShowGuestList(true)} className="h-9 w-9 rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors flex items-center justify-center" title="Lista e Mysafirëve">
              <List className="w-4 h-4 text-foreground/70" />
            </button>
            <button onClick={() => navigate('/plan/rsvps')} className="h-9 w-9 rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors flex items-center justify-center" title="RSVP-të">
              <Mail className="w-4 h-4 text-foreground/70" />
            </button>
            <button onClick={handlePrint} className="h-9 w-9 rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors flex items-center justify-center" title="Printo">
              <Printer className="w-4 h-4 text-foreground/60" />
            </button>
            <button onClick={handleExportJSON} className="h-9 w-9 rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors flex items-center justify-center" title="Eksporto JSON">
              <Download className="w-4 h-4 text-foreground/60" />
            </button>
            <button onClick={handleReset} className="h-9 w-9 rounded-xl bg-secondary hover:bg-destructive/10 border border-border transition-colors flex items-center justify-center" title="Rivendos">
              <RotateCcw className="w-4 h-4 text-destructive/70" />
            </button>
            <button onClick={handleLogout} className="h-9 w-9 rounded-xl bg-secondary hover:bg-destructive/20 border border-border transition-colors flex items-center justify-center" title="Dil">
              <LogOut className="w-4 h-4 text-foreground/70" />
            </button>
          </div>

          {/* Mobile actions button */}
          <button
            onClick={() => setShowMobileActions(prev => !prev)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-champagne border border-border transition-colors"
          >
            <Menu className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Mobile search bar - always visible */}
        <div className="mt-2 md:hidden">
          <SearchBar value={search} onChange={setSearch} tables={tables} onNavigateToTable={handleNavigateToTable} />
        </div>
      </header>

      {/* Mobile quick actions dropdown */}
      {showMobileActions && (
        <div className="md:hidden relative z-20 border-b border-border bg-card/95 backdrop-blur-sm px-3 py-2 flex flex-wrap gap-2 print:hidden">
          <button onClick={() => { handleAddTable(); setShowMobileActions(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary font-ui text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> Tavolinë
          </button>
          <button onClick={() => { setShowGuestList(true); setShowMobileActions(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary font-ui text-xs font-medium">
            <List className="w-3.5 h-3.5" /> Lista
          </button>
          <button onClick={() => { navigate('/plan/rsvps'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary font-ui text-xs font-medium">
            <Mail className="w-3.5 h-3.5" /> RSVP
          </button>
          <button onClick={() => { handlePrint(); setShowMobileActions(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground/80 font-ui text-xs">
            <Printer className="w-3.5 h-3.5" /> Printo
          </button>
          <button onClick={() => { handleExportJSON(); setShowMobileActions(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground/80 font-ui text-xs">
            <Download className="w-3.5 h-3.5" /> Eksporto
          </button>
          <button onClick={() => { handleReset(); setShowMobileActions(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive font-ui text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Rivendos
          </button>
          <button onClick={() => { handleLogout(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground/80 font-ui text-xs">
            <LogOut className="w-3.5 h-3.5" /> Dil
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* MAP VIEW */}
        {(mobileView === 'map' || window.innerWidth >= 768) && (
          <TransformWrapper
            ref={transformRef}
            initialScale={getInitialScale()}
            minScale={0.15}
            maxScale={2.5}
            centerOnInit
            limitToBounds={false}
            doubleClick={{ disabled: false, step: 0.5 }}
            pinch={{ step: 5 }}
            wheel={{ step: 0.08 }}
            panning={{ velocityDisabled: false }}
          >
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: CANVAS_W, height: CANVAS_H }}
            >
              <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
                {/* Background pattern */}
                <div className="absolute inset-0 rounded-2xl border border-border/10" />

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
                      onTableLabelChange={handleTableLabelChange}
                      highlighted={highlighted}
                      scale={1}
                      isHighlighted={highlightedTableId === table.id}
                    />
                  )
                ))}
              </div>
            </TransformComponent>

            <ZoomControls />
          </TransformWrapper>
        )}

        {/* LIST VIEW - mobile only */}
        {mobileView === 'list' && window.innerWidth < 768 && (
          <div className="h-full overflow-y-auto pb-20 bg-background">
            {/* Stats cards */}
            <div className="px-3 py-3 grid grid-cols-3 gap-2">
              <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="font-ui text-xl font-bold text-foreground">{stats.totalSeats}</p>
                <p className="font-ui text-[10px] text-muted-foreground">Ulëse</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="font-ui text-xl font-bold text-primary">{stats.filledSeats}</p>
                <p className="font-ui text-[10px] text-muted-foreground">Të ulur</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="font-ui text-xl font-bold text-muted-foreground">{stats.emptySeats}</p>
                <p className="font-ui text-[10px] text-muted-foreground">Lirë</p>
              </div>
            </div>

            {/* Table list */}
            <div className="px-3 space-y-2">
              {tables.filter(t => !t.isCouple).map(table => {
                const isExpanded = expandedTables.has(table.id);
                const guests = table.seats.filter(s => s.guest);
                const emptySeats = table.seats.filter(s => !s.guest);
                const fillPct = table.seats.length > 0 ? (guests.length / table.seats.length) * 100 : 0;

                // If searching, filter tables that have matching guests
                if (search.trim()) {
                  const q = search.toLowerCase();
                  const hasMatch = table.seats.some(s => s.guest && s.guest.name.toLowerCase().includes(q));
                  if (!hasMatch) return null;
                }

                return (
                  <div key={table.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                    <button
                      onClick={() => {
                        const newExp = new Set(expandedTables);
                        isExpanded ? newExp.delete(table.id) : newExp.add(table.id);
                        setExpandedTables(newExp);
                      }}
                      className="w-full flex items-center gap-3 p-3.5 transition-colors active:bg-secondary/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-ui text-xs font-bold text-primary">{table.id}</span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-ui text-sm font-semibold text-foreground truncate">
                          {table.familyName || `Tavolina ${table.id}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                            <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                          </div>
                          <span className="font-ui text-[10px] text-muted-foreground">
                            {guests.length}/{table.seats.length}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 space-y-2 border-t border-border/50 pt-2">
                        {/* Guests */}
                        {guests.map(seat => (
                          <div key={seat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="font-ui text-[9px] font-bold text-primary">{seat.id}</span>
                              </div>
                              <p className="font-body text-sm font-medium truncate">{seat.guest!.name}</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Hiq ${seat.guest!.name}?`)) {
                                  setTables(prev => prev.map(t => {
                                    if (t.id !== table.id) return t;
                                    return { ...t, seats: t.seats.map(s => s.id === seat.id ? { ...s, guest: null } : s) };
                                  }));
                                  await updateGuest(table.id, seat.id, null);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-destructive/10 active:bg-destructive/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                            </button>
                          </div>
                        ))}
                        {guests.length === 0 && (
                          <p className="text-xs text-muted-foreground italic text-center py-2">Asnjë mysafir</p>
                        )}

                        {/* Empty seats - tap to add */}
                        {emptySeats.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {emptySeats.map(seat => (
                              <button
                                key={seat.id}
                                onClick={() => setModal({ tableId: table.id, seatId: seat.id })}
                                className="w-9 h-9 rounded-full bg-secondary/60 border border-dashed border-border hover:border-primary/40 hover:bg-primary/10 flex items-center justify-center transition-colors active:scale-95"
                              >
                                <UserPlus className="w-3 h-3 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Quick add button */}
                        {emptySeats.length > 0 && (
                          <button
                            onClick={() => setModal({ tableId: table.id, seatId: emptySeats[0].id })}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
                          >
                            <UserPlus className="w-4 h-4 text-primary" />
                            <span className="font-ui text-sm font-medium text-primary">Shto Mysafir</span>
                          </button>
                        )}

                        {/* Navigate to map */}
                        <button
                          onClick={() => handleNavigateToTable(table.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <Map className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-ui text-xs text-muted-foreground">Shiko në hartë</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border print:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          <button
            onClick={() => setMobileView('map')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
              mobileView === 'map' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="font-ui text-[10px] font-medium">Harta</span>
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
              mobileView === 'list' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
          >
            <LayoutList className="w-5 h-5" />
            <span className="font-ui text-[10px] font-medium">Lista</span>
          </button>
          <button
            onClick={() => setShowGuestList(true)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-ui text-[10px] font-medium">Mysafirë</span>
          </button>
        </div>
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
        onDeleteTable={handleDeleteTable}
        onAddGuestToTable={handleAddGuestToTable}
        onRemoveGuest={handleRemoveGuest}
      />
    </div>
  );
};

export default Plan;