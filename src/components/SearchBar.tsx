import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import type { TableData } from '@/lib/seating-data';

interface SearchResult {
  name: string;
  tableId: number;
  tableLabel: string;
  familyName: string;
  seatId: number;
}

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  tables: TableData[];
  onNavigateToTable?: (tableId: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, tables, onNavigateToTable }) => {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results: SearchResult[] = React.useMemo(() => {
    if (!value.trim()) return [];
    const q = value.toLowerCase();
    const found: SearchResult[] = [];
    tables.forEach(t => {
      t.seats.forEach(s => {
        if (s.guest && s.guest.name.toLowerCase().includes(q)) {
          found.push({
            name: s.guest.name,
            tableId: t.id,
            tableLabel: t.label,
            familyName: t.familyName,
            seatId: s.id,
          });
        }
      });
    });
    return found;
  }, [value, tables]);

  const showDropdown = focused && value.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Kërko mysafir..."
        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-card/90 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none font-ui text-sm text-foreground placeholder:text-muted-foreground transition-all"
      />
      {value && (
        <button
          onClick={() => { onChange(''); setFocused(false); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-[100] max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <p className="font-ui text-sm text-muted-foreground">
                Nuk u gjet asnjë mysafir "{value}"
              </p>
            </div>
          ) : (
            <div className="py-1">
              <div className="px-3 py-1.5 border-b border-border">
                <p className="font-ui text-[10px] text-muted-foreground uppercase tracking-wider">
                  {results.length} rezultat{results.length !== 1 ? 'e' : ''}
                </p>
              </div>
              {results.map((r) => (
                <button
                  key={`${r.tableId}-${r.seatId}`}
                  onClick={() => {
                    if (onNavigateToTable) {
                      onNavigateToTable(r.tableId);
                    }
                    setFocused(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-foreground truncate">
                      {r.name}
                    </p>
                    <p className="font-ui text-[11px] text-muted-foreground">
                      Tavolina {r.tableId}
                      {r.familyName ? ` · ${r.familyName}` : ''}
                      {' · Ulëse '}{r.seatId}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-2 py-1 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="font-ui text-[10px] font-semibold text-primary">T{r.tableId}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
