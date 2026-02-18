import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import RoundTable from '@/components/RoundTable';
import CoupleTable from '@/components/CoupleTable';
import DanceFloor from '@/components/DanceFloor';
import SearchBar from '@/components/SearchBar';
import StatsBar from '@/components/StatsBar';
import { supabase } from '@/integrations/supabase/client';
import { loadFromDB, dbToTableData } from '@/lib/supabase-data';
import type { TableData } from '@/lib/seating-data';
import { getStats } from '@/lib/seating-data';

const ViewOnly = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.3 : 0.45);
  const [loading, setLoading] = useState(true);

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
      <header className="relative z-30 px-4 py-3 md:px-6 md:py-4 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold gold-text leading-tight">
              Edmond & Ajlin
            </h1>
            <p className="font-ui text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase">
              Plani i Ulëseve · 9 Maj · 🔴 Live
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatsBar total={stats.totalSeats} filled={stats.filledSeats} empty={stats.emptySeats} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 md:w-48">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-auto" onWheel={onWheel}>
        <div className="mx-auto" style={{ width: 1300 * zoom, height: 1500 * zoom }}>
          <div className="relative" style={{ width: 1300, height: 1500, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <div className="absolute inset-0 rounded-2xl border border-border/15" />
            <DanceFloor />
            {tables.map(table => (
              table.isCouple ? (
                <CoupleTable key={table.id} table={table} onSeatClick={() => {}} />
              ) : (
                <RoundTable
                  key={table.id}
                  table={table}
                  onSeatClick={() => {}}
                  onFamilyNameChange={() => {}}
                  onSaveTable={() => {}}
                  highlighted={highlighted}
                  scale={zoom}
                />
              )
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <a
          href="/login"
          className="font-ui text-[10px] text-primary/60 hover:text-primary bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm transition-colors"
        >
          Hyrja e Administratorit
        </a>
      </div>
    </div>
  );
};

export default ViewOnly;
