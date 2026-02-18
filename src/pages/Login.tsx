import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Allow login with just "ajlin" as shortcut
    const loginEmail = email.includes('@') ? email : `${email}@wedding.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError('Emri ose fjalëkalimi nuk është i saktë');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold gold-text mb-2">
            Edmond & Ajlin
          </h1>
          <p className="font-ui text-sm text-muted-foreground tracking-widest uppercase">
            Plani i Ulëseve · 9 Maj
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
            Hyrja e Administratorit
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-ui text-xs text-muted-foreground block mb-1">Emri</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 font-body text-sm outline-none focus:border-primary/60 transition-colors"
                placeholder="ajlin"
                required
              />
            </div>
            <div>
              <label className="font-ui text-xs text-muted-foreground block mb-1">Fjalëkalimi</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 font-body text-sm outline-none focus:border-primary/60 transition-colors"
                placeholder="••••"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl gold-gradient text-primary-foreground font-ui text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Duke hyrë...' : 'Hyr'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/pamje"
              className="font-ui text-xs text-primary/70 hover:text-primary transition-colors"
            >
              Shiko planin e ulëseve →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
