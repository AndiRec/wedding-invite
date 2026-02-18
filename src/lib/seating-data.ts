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
}

export interface SeatingData {
  tables: TableData[];
  lastUpdated: string;
}

export const createEmptyTable = (id: number, x: number, y: number): TableData => ({
  id,
  label: `Table ${id}`,
  familyName: '',
  seats: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    guest: null,
  })),
  x,
  y,
});

export const generateInitialLayout = (): TableData[] => {
  const tables: TableData[] = [];
  let id = 1;

  // Dance floor is ~500x280 rectangle at center (0,0)
  // Tables arranged in a rectangular pattern around it
  // Each table is ~140px wide (80 center + 58 chair offset)

  // Top row - 7 tables
  for (let i = 0; i < 7; i++) {
    tables.push(createEmptyTable(id++, -480 + i * 160, -280));
  }

  // Bottom row - 7 tables
  for (let i = 0; i < 7; i++) {
    tables.push(createEmptyTable(id++, -480 + i * 160, 310));
  }

  // Left column - 3 tables (between top and bottom rows)
  for (let i = 0; i < 3; i++) {
    tables.push(createEmptyTable(id++, -480, -110 + i * 150));
  }

  // Right column - 3 tables
  for (let i = 0; i < 3; i++) {
    tables.push(createEmptyTable(id++, 480, -110 + i * 150));
  }

  // Far left extras - 2 tables
  for (let i = 0; i < 2; i++) {
    tables.push(createEmptyTable(id++, -640, -40 + i * 150));
  }

  // Far right extras - 2 tables  
  for (let i = 0; i < 2; i++) {
    tables.push(createEmptyTable(id++, 640, -40 + i * 150));
  }

  return tables;
};

export const STORAGE_KEY = 'wedding-seating-edmond-ajlin-v4';

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
