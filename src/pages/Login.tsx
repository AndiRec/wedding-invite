import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { COUPLE, t } from '@/lib/i18n';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Where to return after login: the page that bounced us here, else the editor.
  const from = (location.state as { from?: string } | null)?.from ?? '/plan/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Allow login with just "admin" as shortcut
    const loginEmail = email.includes('@') ? email : `${email}@dasma.com`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      // Show the real reason (helps diagnose 400s) while staying friendly.
      const msg = authError.message?.toLowerCase() ?? '';
      if (msg.includes('email not confirmed')) {
        setError(t.admin.notConfirmed);
      } else if (msg.includes('invalid login credentials')) {
        setError(t.admin.wrongCredentials);
      } else {
        setError(authError.message); // surface anything unexpected verbatim
      }
    } else {
      navigate(from, { replace: true });
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
            {COUPLE.partner1} & {COUPLE.partner2}
          </h1>
          <p className="font-ui text-sm text-muted-foreground tracking-widest uppercase">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
            {t.admin.adminLogin}
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-ui text-xs text-muted-foreground block mb-1">{t.admin.name}</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 font-body text-sm outline-none focus:border-primary/60 transition-colors"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="font-ui text-xs text-muted-foreground block mb-1">{t.admin.password}</label>
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
              {loading ? t.admin.loggingIn : t.admin.login}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a
              href="/plan/view"
              className="font-ui text-xs text-primary/70 hover:text-primary transition-colors"
            >
              {t.admin.viewPlanLink}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
