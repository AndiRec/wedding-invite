import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Trash2, Users, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { listRsvps, updateRsvpStatus, deleteRsvp, type Rsvp } from '@/lib/rsvp-data';

const AdminRsvps = () => {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      setRsvps(await listRsvps());
    } catch {
      /* RLS / network — leave list as-is */
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const channel = supabase
      .channel('rsvp-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, refresh)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = useMemo(() => {
    const attending = rsvps.filter(r => r.attending);
    const heads = attending.reduce((sum, r) => sum + (r.guest_count || 0), 0);
    return {
      total: rsvps.length,
      attending: attending.length,
      declined: rsvps.length - attending.length,
      heads,
    };
  }, [rsvps]);

  const handleStatus = async (r: Rsvp, status: 'pending' | 'seated' | 'declined') => {
    setRsvps(prev => prev.map(x => x.id === r.id ? { ...x, status } : x));
    await updateRsvpStatus(r.id, status, r.seat_id);
  };

  const handleDelete = async (r: Rsvp) => {
    if (!window.confirm(`Delete RSVP from ${r.name}?`)) return;
    setRsvps(prev => prev.filter(x => x.id !== r.id));
    await deleteRsvp(r.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md flex items-center gap-3">
        <button
          onClick={() => navigate('/plan/admin')}
          className="h-9 w-9 rounded-xl bg-secondary hover:bg-champagne border border-border flex items-center justify-center"
          title="Back to seating plan"
        >
          <ArrowLeft className="w-4 h-4 text-foreground/70" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold gold-text leading-tight">RSVPs</h1>
          <p className="font-ui text-[10px] text-muted-foreground tracking-widest uppercase">
            Guest Responses
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-4 gap-2 max-w-3xl mx-auto">
        <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
          <p className="font-ui text-xl font-bold text-foreground">{stats.total}</p>
          <p className="font-ui text-[10px] text-muted-foreground">Responses</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="font-ui text-xl font-bold text-primary">{stats.attending}</p>
          <p className="font-ui text-[10px] text-muted-foreground">Attending</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
          <p className="font-ui text-xl font-bold text-muted-foreground">{stats.declined}</p>
          <p className="font-ui text-[10px] text-muted-foreground">Declined</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/50 border border-border/50">
          <p className="font-ui text-xl font-bold text-foreground">{stats.heads}</p>
          <p className="font-ui text-[10px] text-muted-foreground">Total Heads</p>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-12 space-y-2 max-w-3xl mx-auto">
        {rsvps.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-ui text-sm">No RSVPs yet.</p>
          </div>
        )}

        {rsvps.map(r => (
          <div
            key={r.id}
            className="border border-border rounded-xl bg-card shadow-sm p-3.5 flex items-start gap-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${r.attending ? 'bg-primary/10' : 'bg-secondary'}`}>
              <Users className={`w-4 h-4 ${r.attending ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-ui text-sm font-semibold text-foreground truncate">{r.name}</p>
                <span className={`font-ui text-[10px] px-1.5 py-0.5 rounded-full ${
                  r.status === 'seated' ? 'bg-primary/20 text-primary'
                  : r.status === 'declined' ? 'bg-secondary text-muted-foreground'
                  : 'bg-champagne/40 text-foreground/70'
                }`}>
                  {r.status}
                </span>
              </div>
              <p className="font-ui text-xs text-muted-foreground mt-0.5">
                {r.attending ? `Attending · ${r.guest_count} guest${r.guest_count > 1 ? 's' : ''}` : 'Not attending'}
              </p>
              {r.message && (
                <p className="font-body text-sm text-foreground/80 mt-1.5 italic">"{r.message}"</p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {r.attending && r.status !== 'seated' && (
                <button
                  onClick={() => handleStatus(r, 'seated')}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  title="Mark as seated"
                >
                  <Check className="w-4 h-4 text-primary" />
                </button>
              )}
              {r.status === 'seated' && (
                <button
                  onClick={() => handleStatus(r, 'pending')}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  title="Mark as pending"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={() => handleDelete(r)}
                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-destructive/70" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRsvps;
