import { useState, useEffect, useCallback } from "react";
import { findSeatsByGuestName, type SeatMatch } from "@/lib/supabase-data";
import { t } from "@/lib/i18n";

type State = "idle" | "searching" | "found" | "empty";

export default function SeatLookup({ initialName = "" }: { initialName?: string }) {
  const [query, setQuery] = useState(initialName);
  const [state, setState] = useState<State>("idle");
  const [matches, setMatches] = useState<SeatMatch[]>([]);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setState("searching");
    const results = await findSeatsByGuestName(term);
    setMatches(results);
    setState(results.length > 0 ? "found" : "empty");
  }, []);

  // If a personalized name came from the URL, look it up automatically.
  useEffect(() => {
    if (initialName.trim()) runSearch(initialName);
  }, [initialName, runSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="seat-lookup">
      <form className="seat-lookup-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="seat-lookup-input"
          placeholder={t.seat.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="seat-lookup-button" disabled={state === "searching"}>
          {t.seat.search}
        </button>
      </form>

      {state === "found" && (
        <div className="seat-results">
          {matches.length > 1 && <p className="seat-results-note">{t.seat.multiple}</p>}
          {matches.map((m, i) => (
            <div className="seat-result-card" key={`${m.tableId}-${m.seatNumber}-${i}`}>
              <p className="seat-result-name">{m.guestName}</p>
              <p className="seat-result-table">
                {t.seat.youAreAt}{" "}
                <strong>
                  {m.familyName ? m.familyName : `${t.seat.table} ${m.tableLabel || m.tableId}`}
                </strong>
              </p>
              <p className="seat-result-seat">
                {t.seat.table} {m.tableLabel || m.tableId} · {t.seat.seatNo} {m.seatNumber}
              </p>
            </div>
          ))}
        </div>
      )}

      {state === "empty" && <p className="seat-empty">{t.seat.notFound}</p>}
    </div>
  );
}
