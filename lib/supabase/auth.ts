import { supabase } from './client';
import { identifyUser, resetUser } from '@/lib/posthog';
import { useUserDataStore } from '@/stores/userDataStore';

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    // Identify by the Supabase UUID only — no email/name (kept off the wire).
    identifyUser(data.user.id, { signup_method: 'email' });
    // Keep the chosen username locally; it syncs to the cloud via user_state.
    useUserDataStore.getState().setProfile({ displayName: username, email });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.session?.user) identifyUser(data.session.user.id);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  resetUser();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
