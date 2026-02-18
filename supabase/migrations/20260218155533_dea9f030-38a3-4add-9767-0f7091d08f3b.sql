
-- Tables data
CREATE TABLE public.tables (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL DEFAULT '',
  family_name TEXT NOT NULL DEFAULT '',
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  is_couple BOOLEAN NOT NULL DEFAULT false,
  seat_count INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seats/guests data
CREATE TABLE public.seats (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  guest_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(table_id, seat_number)
);

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- Public read access (for view-only page)
CREATE POLICY "Anyone can view tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT USING (true);

-- Only authenticated users can modify
CREATE POLICY "Auth users can insert tables" ON public.tables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update tables" ON public.tables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete tables" ON public.tables FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can insert seats" ON public.seats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update seats" ON public.seats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete seats" ON public.seats FOR DELETE TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
