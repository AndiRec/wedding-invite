import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { Plus, Minus, Home } from 'lucide-react';
import RoundTable from '@/components/RoundTable';
import CoupleTable from '@/components/CoupleTable';
import DanceFloor from '@/components/DanceFloor';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import { supabase } from '@/integrations/supabase/client';
import { loadFromDB } from '@/lib/supabase-data';
import type { TableData } from '@/lib/seating-data';
import { getStats } from '@/lib/seating-data';
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

const ViewZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 right-3 z-30 flex flex-col gap-1.5">
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

const ViewOnly = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const transformRef = useRef<any>(null);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      const data = await loadFromDB();
      setTables(data);
      setLoading(false);
    };
    load();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('view-only-changes')
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
  }, []);

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

  const handleNavigateToTable = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !transformRef.current) return;
    const centerX = (CANVAS_W / 2 + table.x);
    const centerY = (CANVAS_H / 2 + table.y);
    transformRef.current.setTransform(
      -(centerX * 1.2) + window.innerWidth / 2,
      -(centerY * 1.2) + window.innerHeight / 2.5,
      1.2,
      300,
      'easeOut'
    );
  };

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
      <header className="sticky top-0 z-30 px-3 py-2 md:px-6 md:py-3 border-b border-border bg-card/80 backdrop-blur-md flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <h1 className="font-display text-base md:text-xl font-bold gold-text leading-tight">
              {COUPLE.partner1} & {COUPLE.partner2}
            </h1>
            <p className="font-ui text-[8px] md:text-[10px] text-muted-foreground tracking-widest uppercase">
              {t.admin.subtitle} · <span className="text-red-500">●</span> {t.admin.live}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-4">
            <StatsBar total={stats.totalSeats} filled={stats.filledSeats} empty={stats.emptySeats} />
          </div>
          <div className="flex md:hidden items-center gap-1.5 ml-auto mr-2">
            <span className="font-ui text-[10px] text-primary font-semibold">{stats.filledSeats}</span>
            <span className="font-ui text-[10px] text-muted-foreground">/</span>
            <span className="font-ui text-[10px] text-muted-foreground">{stats.totalSeats}</span>
          </div>
          <div className="flex-1 max-w-xs hidden md:block">
            <SearchBar value={search} onChange={setSearch} tables={tables} onNavigateToTable={handleNavigateToTable} />
          </div>
        </div>
        <div className="mt-2 md:hidden">
          <SearchBar value={search} onChange={setSearch} tables={tables} onNavigateToTable={handleNavigateToTable} />
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
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
              <div className="absolute inset-0 rounded-2xl border border-border/10" />
              <DanceFloor />
              {tables.map(table => (
                table.isCouple ? (
                  <CoupleTable key={table.id} table={table} onSeatClick={() => {}} readOnly />
                ) : (
                  <RoundTable
                    key={table.id}
                    table={table}
                    onSeatClick={() => {}}
                    onFamilyNameChange={() => {}}
                    onSaveTable={() => {}}
                    highlighted={highlighted}
                    scale={1}
                    readOnly
                  />
                )
              ))}
            </div>
          </TransformComponent>
          <ViewZoomControls />
        </TransformWrapper>
      </div>

    </div>
  );
};

export default ViewOnly;
