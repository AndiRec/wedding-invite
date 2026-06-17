import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Rsvp = Tables<'rsvps'>;
export type RsvpStatus = 'pending' | 'seated' | 'declined';

export interface RsvpInput {
  name: string;
  attending: boolean;
  guestCount: number;
  message?: string;
}

// Public: submit an RSVP from the invitation page
export const createRsvp = async (input: RsvpInput): Promise<void> => {
  const row: TablesInsert<'rsvps'> = {
    name: input.name.trim(),
    attending: input.attending,
    guest_count: input.guestCount,
    message: input.message?.trim() || null,
    status: input.attending ? 'pending' : 'declined',
  };
  const { error } = await supabase.from('rsvps').insert(row);
  if (error) throw error;
};

// Admin: list all RSVPs (newest first)
export const listRsvps = async (): Promise<Rsvp[]> => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

// Admin: update an RSVP's status (and optionally link it to a seat)
export const updateRsvpStatus = async (
  id: string,
  status: RsvpStatus,
  seatId: number | null = null
): Promise<void> => {
  const { error } = await supabase
    .from('rsvps')
    .update({ status, seat_id: seatId })
    .eq('id', id);
  if (error) throw error;
};

// Admin: delete an RSVP
export const deleteRsvp = async (id: string): Promise<void> => {
  const { error } = await supabase.from('rsvps').delete().eq('id', id);
  if (error) throw error;
};
