import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  purchases,
  PurchasesCancelledError,
  PurchasesUnavailableError,
  type SubPackage,
} from '@/lib/purchases';
import { isReviewerAccount } from '@/constants/subscription';
import { track } from '@/lib/posthog';

export type PurchaseOutcome = 'success' | 'cancelled' | 'unavailable' | 'error';
export type RestoreOutcome = 'restored' | 'none' | 'unavailable' | 'error';

interface SubscriptionState {
  // Cached entitlement (persisted) so a returning subscriber isn't gated on the
  // first frame before RevenueCat responds. Reconciled by init()/refresh().
  isPro: boolean;
  // True when the signed-in account is on the reviewer/tester allow-list. Forces
  // isPro on without a purchase so app-store reviewers can clear the paywall.
  // Re-derived from the auth email on every sign-in; never persisted.
  isReviewer: boolean;
  // RevenueCat configured + first CustomerInfo loaded.
  ready: boolean;
  // Whether real IAP can run on this build (false on web / Expo Go).
  available: boolean;
  // Monthly package from the current offering (null until loaded / unavailable).
  monthly: SubPackage | null;

  init: (appUserId: string | null, email?: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (appUserId: string | null, email?: string | null) => Promise<void>;
  purchaseMonthly: () => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
}

let initStarted = false;

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      isReviewer: false,
      ready: false,
      available: purchases.available,
      monthly: null,

      init: async (appUserId, email) => {
        if (initStarted) return;
        initStarted = true;
        // Reviewer accounts are Pro from the first frame, regardless of billing.
        const isReviewer = isReviewerAccount(email);
        if (isReviewer) set({ isReviewer: true, isPro: true });
        try {
          await purchases.configure(appUserId);
          const [pro, monthly] = await Promise.all([
            purchases.isPro(),
            purchases.getMonthlyPackage(),
          ]);
          set({ isPro: pro || get().isReviewer, monthly, ready: true, available: purchases.available });
          // Keep isPro live: the store pushes entitlement changes (renewals,
          // expirations, Ask-to-Buy, purchases/restores on another device).
          // Registered once for the app's lifetime, so no unsubscribe is needed.
          purchases.addCustomerInfoListener((pro2) => set({ isPro: pro2 || get().isReviewer }));
        } catch {
          // Degrade gracefully: keep the cached isPro, just mark ready so the UI
          // stops waiting. Never block the app on a billing failure.
          set({ ready: true, available: purchases.available });
        }
      },

      refresh: async () => {
        try {
          const [pro, monthly] = await Promise.all([
            purchases.isPro(),
            purchases.getMonthlyPackage(),
          ]);
          set({ isPro: pro || get().isReviewer, monthly });
        } catch {
          /* keep cached state */
        }
      },

      // Re-associate RevenueCat with the signed-in user (or clear on sign-out),
      // refresh the reviewer flag from the new account, then re-read entitlement.
      setUser: async (appUserId, email) => {
        set({ isReviewer: isReviewerAccount(email) });
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
          set({ isPro: isPro || get().isReviewer });
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
          set({ isPro: isPro || get().isReviewer });
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
