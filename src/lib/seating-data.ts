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

  // Inner ring - 8 tables close to dance floor
  const innerRadius = 220;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    tables.push(createEmptyTable(id++, 
      Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius
    ));
  }

  // Outer ring - 16 tables
  const outerRadius = 400;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 - Math.PI / 2 + Math.PI / 16;
    tables.push(createEmptyTable(id++,
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * outerRadius
    ));
  }

  return tables;
};

export const STORAGE_KEY = 'wedding-seating-edmond-ajlin';

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
