import { useEffect, useRef } from 'react';
import { supabase } from './client';
import { useUserDataStore } from '@/stores/userDataStore';
import {
  pullCloudState,
  pushCloudState,
  mergeStates,
  snapshotLocal,
  resetAccountDeletion,
  deleteCloudState,
} from './sync';
import { hasTombstone, removeTombstone } from './tombstone';

// Local-first cloud sync. When a user is signed in and the local store has
// hydrated, it pulls the cloud snapshot, merges it in (never losing progress),
// pushes the merged result back, then keeps pushing a debounced snapshot on
// every store change. Stops cleanly on sign-out. All network work is
// best-effort — failures never disrupt offline play.
export function useCloudSync() {
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  const userIdRef = useRef<string | null>(null);
  const syncedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    let cancelled = false;
    let unsubStore: (() => void) | null = null;

    // Push the latest snapshot ~3s after the last change (coalesces bursts).
    const flushSoon = () => {
      if (!syncedRef.current || !userIdRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const uid = userIdRef.current;
        if (uid) void pushCloudState(uid, snapshotLocal());
      }, 3000);
    };

    const start = async (userId: string) => {
      resetAccountDeletion(); // a real session is active again — allow pushes
      userIdRef.current = userId;
      syncedRef.current = false;

      // If this account has a pending deletion tombstone, do NOT adopt its
      // surviving cloud snapshot (that would resurrect "deleted" data). Finish
      // the erasure instead: only resume normal sync once the row is confirmed
      // gone, so we never push it back while a deletion is still pending.
      if (await hasTombstone(userId)) {
        const removed = await deleteCloudState(userId);
        if (cancelled || userIdRef.current !== userId) return;
        if (removed) {
          await removeTombstone(userId);
          syncedRef.current = true;
          if (!unsubStore) unsubStore = useUserDataStore.subscribe(flushSoon);
        }
        // If the row couldn't be removed (offline / RLS delete policy not yet
        // deployed), keep the tombstone and stay un-synced so nothing is pushed.
        return;
      }

      const remote = await pullCloudState(userId);
      if (cancelled || userIdRef.current !== userId) return;

      // Shared-device guard. If this account already has a cloud snapshot AND the
      // local store doesn't belong to this user (a guest session, or a different
      // user who used this device), adopt the cloud snapshot wholesale instead of
      // union-merging — otherwise the previous person's progress and saved quotes
      // would be fused into, and then uploaded to, this account. A brand-new
      // account (empty cloud) still adopts the local guest progress, preserving
      // the play-then-sign-up flow; the same user's own device still merges, so
      // offline progress is never lost.
      const remoteHasData = !!remote && Object.keys(remote).length > 0;
      const localBelongsToUser = useUserDataStore.getState()._syncOwnerId === userId;
      if (remoteHasData && !localBelongsToUser) {
        useUserDataStore.getState().resetForSignOut();
        if (cancelled || userIdRef.current !== userId) return;
      }

      // Merge cloud into local, tag the store's owner, then push the result up.
      useUserDataStore.setState({
        ...(mergeStates(snapshotLocal(), remote ?? {}) as any),
        _syncOwnerId: userId,
      });
      await pushCloudState(userId, snapshotLocal());
      if (cancelled || userIdRef.current !== userId) return;
      syncedRef.current = true;
      if (!unsubStore) unsubStore = useUserDataStore.subscribe(flushSoon);
    };

    const stop = () => {
      userIdRef.current = null;
      syncedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (unsubStore) {
        unsubStore();
        unsubStore = null;
      }
    };

    // Sync the current session, then react to future auth changes.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const uid = data.session?.user?.id;
      if (uid) void start(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      if (uid && uid !== userIdRef.current) {
        stop();
        void start(uid);
      } else if (!uid && userIdRef.current) {
        stop();
        // A signed-in user just signed out: wipe their data from this device so
        // the next guest/user can't read or inherit it, and the next sign-in
        // adopts that account's own cloud snapshot from a clean baseline.
        if (event === 'SIGNED_OUT') useUserDataStore.getState().resetForSignOut();
      }
    });

    return () => {
      cancelled = true;
      stop();
      listener.subscription.unsubscribe();
    };
  }, [hasHydrated]);
}
