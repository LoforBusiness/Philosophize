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

// Erase the signed-in user's data from the cloud. Deletes the user_state row via
// the RLS "delete own" policy (migration 0002) and invokes the optional
// `delete-account` Edge Function to remove the auth.users record too.
//
// Returns { ok, userId } where ok === true means the cloud row is confirmed gone
// (so the user's data CANNOT be resurrected on next login). The caller uses a
// false `ok` to drop a deletion tombstone, so erasure is retried next login
// rather than silently leaving the data behind.
export async function deleteAccountCloud(): Promise<{ ok: boolean; userId: string | null }> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id ?? null;
  if (!uid) return { ok: true, userId: null }; // anonymous/local-only user: nothing in the cloud
  const rowDeleted = await deleteCloudState(uid);
  // Best-effort: also delete the auth.users record (no-op if the function isn't
  // deployed). Erasure of the data row is what `ok` tracks.
  try {
    await supabase.functions.invoke('delete-account');
  } catch {
    /* function not deployed / offline */
  }
  return { ok: rowDeleted, userId: uid };
}
