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

  // Hall layout: long rectangle with wide central aisle
  // Tables on LEFT side - 3 columns x 4 rows
  const leftStartX = -680;
  const colSpacing = 180;
  const rowSpacing = 180;
  const topY = -300;

  // Left side - 12 tables (3 cols x 4 rows)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      tables.push(createEmptyTable(id++, leftStartX + col * colSpacing, topY + row * rowSpacing));
    }
  }

  // Right side - 12 tables (3 cols x 4 rows)
  const rightStartX = 320;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      tables.push(createEmptyTable(id++, rightStartX + col * colSpacing, topY + row * rowSpacing));
    }
  }

  return tables;
};

export const STORAGE_KEY = 'wedding-seating-edmond-ajlin-v5';

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
