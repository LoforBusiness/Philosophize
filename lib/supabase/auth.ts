import { supabase } from './client';
import { identifyUser, resetUser } from '@/lib/posthog';
import { useUserDataStore } from '@/stores/userDataStore';
import { deleteCloudState } from './sync';

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

// Erase the signed-in user's data from the cloud before a local wipe + sign-out.
// Deletes the user_state row directly via the RLS "delete own" policy (migration
// 0002), and also invokes the optional `delete-account` Edge Function to remove
// the auth.users record entirely. Both are best-effort so a not-yet-deployed
// backend never blocks the user from deleting locally.
export async function deleteAccountCloud(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return;
  await deleteCloudState(uid);
  try {
    await supabase.functions.invoke('delete-account');
  } catch {
    /* function not deployed / offline — the row delete above still ran */
  }
}
