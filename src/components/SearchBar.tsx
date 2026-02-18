import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search guest..."
        className="w-full pl-9 pr-8 py-2 rounded-xl bg-card/80 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none font-ui text-sm text-foreground placeholder:text-muted-foreground transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
