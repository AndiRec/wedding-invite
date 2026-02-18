import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';

interface StatsBarProps {
  total: number;
  filled: number;
  empty: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ total, filled, empty }) => {
  const pct = total > 0 ? (filled / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 md:gap-5 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span className="font-ui text-xs text-foreground/80">
          <span className="font-semibold">{total}</span> seats
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-primary" />
        <span className="font-ui text-xs text-foreground/80">
          <span className="font-semibold">{filled}</span> seated
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <UserX className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-ui text-xs text-muted-foreground">
          <span className="font-semibold">{empty}</span> free
        </span>
      </div>
      <div className="hidden md:block flex-1 max-w-[120px]">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gold-gradient rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
