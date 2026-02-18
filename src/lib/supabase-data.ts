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
