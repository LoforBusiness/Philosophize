import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './client';

// Reactive Supabase auth session: null when signed out (a local-only "guest"),
// a Session when signed in. Mirrors the listener in app/_layout.tsx but scoped
// to components that need to branch on signed-in vs guest (e.g. the Profile CTA
// that shows "Sign out" for members and "Sign in" for guests).
export function useAuthSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return session;
}
