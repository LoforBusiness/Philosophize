import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { notifications } from '.';

/**
 * A tap on one of this app's notifications, handed to the tab shell.
 *
 * Mounted once, in the root layout. Only the free trial's reminder asks to open
 * anything today: it lands on the Pass tab, where the trial's end date and its
 * Cancel button sit at the top, so "tap to cancel" is one tap away from true.
 *
 * It PARKS the request in uiStore instead of navigating. A tap can start the app
 * from cold, and the router, the auth redirect and the launch screen all run after
 * this does; `app/(app)/_layout.tsx` acts on it once the shell is actually showing.
 */
export function useNotificationOpens() {
  useEffect(() => {
    if (!notifications.isSupported()) return;
    let alive = true;
    void notifications.takeLaunchOpen().then((open) => {
      if (alive && open) useUIStore.getState().setPendingOpen(open);
    });
    const off = notifications.onOpen((open) => useUIStore.getState().setPendingOpen(open));
    return () => {
      alive = false;
      off();
    };
  }, []);
}
