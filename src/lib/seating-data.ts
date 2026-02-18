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

export interface SeatingData {
  tables: TableData[];
  lastUpdated: string;
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

  // Couple table at top center
  tables.push({ ...createEmptyTable(0, 0, -420, 2), label: 'Couple', isCouple: true });

  const colSpacing = 170;
  const rowSpacing = 160;

  // LEFT SIDE - 2 columns x 6 rows (12 tables)
  // Far left column
  for (let row = 0; row < 6; row++) {
    tables.push(createEmptyTable(id++, -480, -280 + row * rowSpacing));
  }
  // Inner left column
  for (let row = 0; row < 6; row++) {
    tables.push(createEmptyTable(id++, -480 + colSpacing, -280 + row * rowSpacing));
  }

  // RIGHT SIDE - 2 columns x 6 rows (12 tables)
  // Inner right column
  for (let row = 0; row < 6; row++) {
    tables.push(createEmptyTable(id++, 480 - colSpacing, -280 + row * rowSpacing));
  }
  // Far right column
  for (let row = 0; row < 6; row++) {
    tables.push(createEmptyTable(id++, 480, -280 + row * rowSpacing));
  }

  return tables;
};

export const STORAGE_KEY = 'wedding-seating-edmond-ajlin-v7';

export const loadSeatingData = (): TableData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: SeatingData = JSON.parse(saved);
      return data.tables;
    }
  } catch (e) {
    console.error('Failed to load seating data', e);
  }
  return generateInitialLayout();
};

export const saveSeatingData = (tables: TableData[]) => {
  try {
    const data: SeatingData = { tables, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save seating data', e);
  }
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
