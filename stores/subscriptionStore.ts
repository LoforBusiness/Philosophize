import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  purchases,
  PurchasesCancelledError,
  PurchasesUnavailableError,
  type SubPackage,
} from '@/lib/purchases';
import { track } from '@/lib/posthog';

export type PurchaseOutcome = 'success' | 'cancelled' | 'unavailable' | 'error';
export type RestoreOutcome = 'restored' | 'none' | 'unavailable' | 'error';

interface SubscriptionState {
  // Cached entitlement (persisted) so a returning subscriber isn't gated on the
  // first frame before RevenueCat responds. Reconciled by init()/refresh().
  isPro: boolean;
  // RevenueCat configured + first CustomerInfo loaded.
  ready: boolean;
  // Whether real IAP can run on this build (false on web / Expo Go).
  available: boolean;
  // Monthly package from the current offering (null until loaded / unavailable).
  monthly: SubPackage | null;

  init: (appUserId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (appUserId: string | null) => Promise<void>;
  purchaseMonthly: () => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
}

let initStarted = false;

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      ready: false,
      available: purchases.available,
      monthly: null,

      init: async (appUserId) => {
        if (initStarted) return;
        initStarted = true;
        try {
          await purchases.configure(appUserId);
          const [isPro, monthly] = await Promise.all([
            purchases.isPro(),
            purchases.getMonthlyPackage(),
          ]);
          set({ isPro, monthly, ready: true, available: purchases.available });
        } catch {
          // Degrade gracefully: keep the cached isPro, just mark ready so the UI
          // stops waiting. Never block the app on a billing failure.
          set({ ready: true, available: purchases.available });
        }
      },

      refresh: async () => {
        try {
          const [isPro, monthly] = await Promise.all([
            purchases.isPro(),
            purchases.getMonthlyPackage(),
          ]);
          set({ isPro, monthly });
        } catch {
          /* keep cached state */
        }
      },

      // Re-associate RevenueCat with the signed-in user (or clear on sign-out),
      // then re-read entitlement state.
      setUser: async (appUserId) => {
        try {
          if (appUserId) await purchases.logIn(appUserId);
          else await purchases.logOut();
        } catch {
          /* ignore identity errors */
        }
        await get().refresh();
      },

      purchaseMonthly: async () => {
        const pkg = get().monthly;
        if (!pkg) {
          // Try a late fetch in case the offering loaded after init.
          try {
            const fresh = await purchases.getMonthlyPackage();
            if (fresh) set({ monthly: fresh });
            if (!fresh) return purchases.available ? 'error' : 'unavailable';
          } catch {
            return purchases.available ? 'error' : 'unavailable';
          }
        }
        const target = get().monthly;
        if (!target) return purchases.available ? 'error' : 'unavailable';
        try {
          const isPro = await purchases.purchase(target);
          set({ isPro });
          if (isPro) track('subscribe_succeeded', { plan: 'scholars_pass', product_id: target.productId });
          return isPro ? 'success' : 'error';
        } catch (e) {
          if (e instanceof PurchasesCancelledError) return 'cancelled';
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },

      restore: async () => {
        try {
          const isPro = await purchases.restore();
          set({ isPro });
          return isPro ? 'restored' : 'none';
        } catch (e) {
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },
    }),
    {
      name: 'philosophize-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the cached entitlement is worth persisting; everything else is
      // re-derived from RevenueCat at launch.
      partialize: (s) => ({ isPro: s.isPro }),
    }
  )
);
