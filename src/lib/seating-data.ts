export interface Guest {
  name: string;
}

export interface Seat {
  id: number;
  guest: Guest | null;
}

export interface TableData {
  id: number;
  label: string;
  familyName: string;
  seats: Seat[];
  x: number;
  y: number;
  isCouple?: boolean;
}

export const createEmptyTable = (id: number, x: number, y: number, seatCount = 10): TableData => ({
  id,
  label: id === 0 ? 'Couple' : `Table ${id}`,
  familyName: '',
  seats: Array.from({ length: seatCount }, (_, i) => ({
    id: i + 1,
    guest: null,
  })),
  x,
  y,
  isCouple: id === 0,
});

export const generateInitialLayout = (): TableData[] => {
  const tables: TableData[] = [];
  let id = 1;

  // Couple table at top center (inline with dance floor)
  tables.push({ ...createEmptyTable(0, 0, -550, 2), label: 'Couple', isCouple: true });

  const rowSpacing = 155;
  const zigOffset = 60;

  // LEFT SIDE - zig-zag: odd rows shift right (9 rows)
  for (let row = 0; row < 9; row++) {
    const shift = row % 2 === 1 ? zigOffset : 0;
    tables.push(createEmptyTable(id++, -460 + shift, -280 + row * rowSpacing));
    tables.push(createEmptyTable(id++, -290 + shift, -280 + row * rowSpacing));
  }

  // RIGHT SIDE - zig-zag: odd rows shift left (mirror, 9 rows)
  for (let row = 0; row < 9; row++) {
    const shift = row % 2 === 1 ? -zigOffset : 0;
    tables.push(createEmptyTable(id++, 290 + shift, -280 + row * rowSpacing));
    tables.push(createEmptyTable(id++, 460 + shift, -280 + row * rowSpacing));
  }

  return tables;
};

export const getStats = (tables: TableData[]) => {
  let totalSeats = 0;
  let filledSeats = 0;
  tables.forEach(t => {
    totalSeats += t.seats.length;
    filledSeats += t.seats.filter(s => s.guest !== null).length;
  });
  return { totalSeats, filledSeats, emptySeats: totalSeats - filledSeats };
};
