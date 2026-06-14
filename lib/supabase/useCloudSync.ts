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
      // Merge cloud into local, apply, then push the merged result up.
      useUserDataStore.setState(mergeStates(snapshotLocal(), remote ?? {}) as any);
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      if (uid && uid !== userIdRef.current) {
        stop();
        void start(uid);
      } else if (!uid && userIdRef.current) {
        stop();
      }
    });

    return () => {
      cancelled = true;
      stop();
      listener.subscription.unsubscribe();
    };
  }, [hasHydrated]);
}
