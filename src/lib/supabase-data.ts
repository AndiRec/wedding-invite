import { supabase } from '@/integrations/supabase/client';
import type { TableData, Seat } from './seating-data';
import { generateInitialLayout } from './seating-data';

// Convert DB rows to frontend TableData format
export const dbToTableData = (
  dbTables: Array<{ id: number; label: string; family_name: string; x: number; y: number; is_couple: boolean; seat_count: number }>,
  dbSeats: Array<{ table_id: number; seat_number: number; guest_name: string | null }>
): TableData[] => {
  return dbTables.map(t => {
    const tableSeats = dbSeats
      .filter(s => s.table_id === t.id)
      .sort((a, b) => a.seat_number - b.seat_number);
    
    // Build seats array based on seat_count
    const seats: Seat[] = [];
    for (let i = 1; i <= t.seat_count; i++) {
      const dbSeat = tableSeats.find(s => s.seat_number === i);
      seats.push({
        id: i,
        guest: dbSeat?.guest_name ? { name: dbSeat.guest_name } : null,
      });
    }

    return {
      id: t.id,
      label: t.label,
      familyName: t.family_name,
      seats,
      x: t.x,
      y: t.y,
      isCouple: t.is_couple,
    };
  });
};

// Load all seating data from DB
export const loadFromDB = async (): Promise<TableData[]> => {
  const { data: dbTables } = await supabase.from('tables').select('*').order('id');
  const { data: dbSeats } = await supabase.from('seats').select('*');

  if (!dbTables || dbTables.length === 0) {
    return [];
  }

  return dbToTableData(dbTables, dbSeats || []);
};

// Public guest lookup: find seats whose guest name matches a query.
// Returns the table label/family name + seat number for each match.
export interface SeatMatch {
  guestName: string;
  tableId: number;
  tableLabel: string;
  familyName: string;
  seatNumber: number;
}

export const findSeatsByGuestName = async (query: string): Promise<SeatMatch[]> => {
  const q = query.trim();
  if (!q) return [];

  // ilike '%q%' for a forgiving, case-insensitive contains match.
  const { data, error } = await supabase
    .from('seats')
    .select('seat_number, guest_name, table_id, tables(label, family_name)')
    .ilike('guest_name', `%${q}%`)
    .order('table_id');

  if (error || !data) return [];

  // PostgREST may return the embedded parent (`tables`) as either a single
  // object or a one-element array depending on how it infers the relationship.
  // Normalize both shapes so the table label never silently goes blank.
  type TableEmbed = { label: string; family_name: string };
  const embed = (tables: TableEmbed | TableEmbed[] | null): TableEmbed | null =>
    Array.isArray(tables) ? tables[0] ?? null : tables;

  return data.map((row: {
    seat_number: number;
    guest_name: string | null;
    table_id: number;
    tables: TableEmbed | TableEmbed[] | null;
  }) => {
    const tbl = embed(row.tables);
    return {
      guestName: row.guest_name ?? '',
      tableId: row.table_id,
      tableLabel: tbl?.label ?? '',
      familyName: tbl?.family_name ?? '',
      seatNumber: row.seat_number,
    };
  });
};

// Seed initial layout to DB
export const seedInitialData = async (): Promise<void> => {
  const layout = generateInitialLayout();

  // Insert tables
  const tableRows = layout.map(t => ({
    id: t.id,
    label: t.label,
    family_name: t.familyName,
    x: t.x,
    y: t.y,
    is_couple: t.isCouple || false,
    seat_count: t.seats.length,
  }));

  await supabase.from('tables').upsert(tableRows);

  // Insert seats
  const seatRows: Array<{ table_id: number; seat_number: number; guest_name: string | null }> = [];
  layout.forEach(t => {
    t.seats.forEach(s => {
      seatRows.push({
        table_id: t.id,
        seat_number: s.id,
        guest_name: s.guest?.name || null,
      });
    });
  });

  await supabase.from('seats').upsert(seatRows, { onConflict: 'table_id,seat_number' });
};

// Update a guest name
export const updateGuest = async (tableId: number, seatNumber: number, guestName: string | null) => {
  const { data: existing } = await supabase
    .from('seats')
    .select('id')
    .eq('table_id', tableId)
    .eq('seat_number', seatNumber)
    .single();

  if (existing) {
    await supabase.from('seats').update({ guest_name: guestName }).eq('id', existing.id);
  } else {
    await supabase.from('seats').insert({ table_id: tableId, seat_number: seatNumber, guest_name: guestName });
  }
};

// Update family name
export const updateFamilyName = async (tableId: number, familyName: string) => {
  await supabase.from('tables').update({ family_name: familyName }).eq('id', tableId);
};

// Update table label (the display number)
export const updateTableLabel = async (tableId: number, label: string) => {
  await supabase.from('tables').update({ label }).eq('id', tableId);
};

// Delete a table and all its seats
export const deleteTable = async (tableId: number) => {
  await supabase.from('seats').delete().eq('table_id', tableId);
  await supabase.from('tables').delete().eq('id', tableId);
};

// Add a new table to DB
export const addTable = async (table: TableData): Promise<void> => {
  await supabase.from('tables').insert({
    id: table.id,
    label: table.label,
    family_name: table.familyName,
    x: table.x,
    y: table.y,
    is_couple: table.isCouple || false,
    seat_count: table.seats.length,
  });

  const seatRows = table.seats.map(s => ({
    table_id: table.id,
    seat_number: s.id,
    guest_name: s.guest?.name || null,
  }));
  await supabase.from('seats').upsert(seatRows, { onConflict: 'table_id,seat_number' });
};

// Update seat count for a table
export const updateSeatCount = async (tableId: number, seatCount: number, occupiedSeats: Seat[]) => {
  // Update table seat_count
  await supabase.from('tables').update({ seat_count: seatCount }).eq('id', tableId);

  // Delete seats with seat_number > seatCount
  await supabase.from('seats').delete().eq('table_id', tableId).gt('seat_number', seatCount);

  // Upsert the occupied seats with new numbering
  for (let i = 0; i < occupiedSeats.length && i < seatCount; i++) {
    const seat = occupiedSeats[i];
    if (seat.guest) {
      await supabase.from('seats').upsert(
        { table_id: tableId, seat_number: i + 1, guest_name: seat.guest.name },
        { onConflict: 'table_id,seat_number' }
      );
    }
  }
};
