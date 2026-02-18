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

  // Horizontal rectangle hall layout (wide)
  // Dance floor is a wide horizontal strip in the middle
  // Tables on TOP and BOTTOM of the dance floor
  // Like looking at the venue from above (bird's eye)

  const colSpacing = 175;
  const rowSpacing = 175;

  // TOP section - 2 rows x 6 columns (12 tables)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      tables.push(createEmptyTable(id++, -440 + col * colSpacing, -360 + row * rowSpacing));
    }
  }

  // BOTTOM section - 2 rows x 6 columns (12 tables)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      tables.push(createEmptyTable(id++, -440 + col * colSpacing, 185 + row * rowSpacing));
    }
  }

  return tables;
};

export const STORAGE_KEY = 'wedding-seating-edmond-ajlin-v6';

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
