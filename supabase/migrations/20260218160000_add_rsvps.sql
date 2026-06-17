-- RSVP submissions from the public invitation page (/)
CREATE TABLE public.rsvps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  attending   BOOLEAN NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  message     TEXT,
  -- optional bridge to seating: the admin can attach an RSVP to a specific seat
  seat_id     INTEGER REFERENCES public.seats(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | seated | declined
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Public guests may submit an RSVP, but cannot read or modify others'
CREATE POLICY "Anyone can submit rsvp" ON public.rsvps FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read / manage RSVPs
CREATE POLICY "Auth users can view rsvps"   ON public.rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can update rsvps" ON public.rsvps FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete rsvps" ON public.rsvps FOR DELETE TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;

-- Reuse the shared updated_at trigger function (created in the init migration)
CREATE TRIGGER update_rsvps_updated_at BEFORE UPDATE ON public.rsvps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
