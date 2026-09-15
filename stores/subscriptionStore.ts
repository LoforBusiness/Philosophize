import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  purchases,
  PurchasesCancelledError,
  PurchasesUnavailableError,
  type SubPackage,
} from '@/lib/purchases';
import { AppState } from 'react-native';
import { isReviewerAccount, TRIAL_DAYS } from '@/constants/subscription';
import { trialActive, trialEndFrom } from '@/lib/utils/trial';
import { useUIStore } from '@/stores/uiStore';
import { track } from '@/lib/posthog';

export type PurchaseOutcome = 'success' | 'cancelled' | 'unavailable' | 'error';
export type RestoreOutcome = 'restored' | 'none' | 'unavailable' | 'error';
/** Where a trial was taken: after a lesson, on the Pass tab, or in Settings. */
export type TrialSource = 'post_lesson' | 'pass_tab' | 'settings';

// -----------------------------------------------------------------------------
// `isPro` IS DERIVED NOW, AND THAT IS THE WHOLE DESIGN OF THE TRIAL.
//
// Roughly forty places in the app read `useSubscriptionStore((s) => s.isPro)` --
// the lesson gate, the ad, the daily limit, the rest-day caps, the replay rule,
// six screens and the reward. A trial that added a second flag beside it would
// have meant finding all forty and writing `isPro || onTrial` at each, and the
// one that got missed would be a reader who paid nothing, was told they had the
// Pass, and then hit a wall it does not mention.
//
// So nothing new is read anywhere. `isPro` keeps its name and its meaning --
// "may this reader do Pro things right now" -- and gains a second way of being
// true. What splits in two is what feeds it:
//
//   - `entitled` -- the store's answer, plus the reviewer allow-list. This is
//     what `isPro` used to hold, under its old name.
//   - `trialEndsAt` -- the local grant, which expires by the clock.
//
// EVERY WRITE GOES THROUGH `derive`, so the two can never disagree. A bare
// `set({ isPro })` anywhere in this file would be the bug this note exists to
// make impossible; there is not one, and check-pass asserts it.
// -----------------------------------------------------------------------------

interface SubscriptionState {
  // MAY THIS READER DO PRO THINGS RIGHT NOW -- entitled, or inside the trial.
  // Derived from the two fields below and never set directly; see the note above.
  // Persisted so a returning subscriber isn't gated on the first frame before
  // RevenueCat responds.
  isPro: boolean;
  // The store's answer (plus the reviewer allow-list): somebody is PAYING. This
  // is what `isPro` alone used to mean. Reconciled by init()/refresh().
  entitled: boolean;
  // When the granted trial runs out, in epoch ms -- null if one was never taken.
  // Persisted; the clock below re-derives `isPro` when it passes.
  trialEndsAt: number | null;
  // Whether this device has ever taken the trial. Separate from `trialEndsAt`
  // because that one goes stale rather than false, and "has run out" and "was
  // never offered" must not look the same: the offer screen would come back
  // after every lesson forever, promising three days it cannot give.
  trialUsed: boolean;
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

  /** Is there a trial to offer this reader? False while paying, and after one. */
  canStartTrial: () => boolean;
  /**
   * Grant the trial and raise the ceremony.
   *
   * THE SEAM. Everything about the trial that could ever become a store
   * introductory offer is behind this one call -- see the long note in
   * constants/subscription.ts. Swapping mechanisms is: await purchaseMonthly()
   * here instead of writing a local end date, and leave every screen alone.
   */
  startTrial: (source?: TrialSource) => void;
  /** Re-derive against the clock. Cheap, and a no-op unless the answer moved. */
  syncTrial: () => void;

  init: (appUserId: string | null, email?: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (appUserId: string | null, email?: string | null) => Promise<void>;
  purchaseMonthly: () => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
}

let initStarted = false;

type Setter = (patch: Partial<SubscriptionState>) => void;
type Getter = () => SubscriptionState;

/**
 * Recompute `isPro` from the two things that can make it true.
 *
 * Called after every write to `entitled`, `isReviewer` or `trialEndsAt`, and
 * never anywhere else. It writes only when the answer has actually moved: this
 * store is subscribed to by every mounted tab, and a `set` with an unchanged
 * value still costs a render of all of them (section 19).
 */
function derive(set: Setter, get: Getter) {
  const s = get();
  const next = s.entitled || s.isReviewer || trialActive(s.trialEndsAt, Date.now());
  if (next !== s.isPro) set({ isPro: next });
}

/**
 * THE TRIAL ENDS ON A CLOCK, AND NOTHING ELSE IN THIS APP DOES.
 *
 * Every other thing `isPro` depends on changes because somebody did something --
 * a purchase, a sign-in, a push from the store. This one changes because time
 * passed, and no render, tap or store write is going to notice that by itself.
 *
 * Two mechanisms, because neither is sufficient alone. A `setTimeout` aimed at
 * the exact instant covers a reader who has the app open when it runs out. It is
 * not enough on its own: a phone that sleeps or backgrounds the app suspends or
 * throttles JS timers indefinitely, so the fire can arrive late or not at all.
 * Hence the AppState pass, which re-derives on every return to the foreground
 * whatever the timer did.
 *
 * Both are registered once for the app's lifetime -- the same reasoning the
 * customer-info listener above carries -- so there is nothing to tear down.
 */
let trialTimer: ReturnType<typeof setTimeout> | null = null;
let appStateBound = false;

function armTrialClock(set: Setter, get: Getter) {
  if (!appStateBound) {
    appStateBound = true;
    AppState.addEventListener('change', (st) => {
      if (st === 'active') useSubscriptionStore.getState().syncTrial();
    });
  }
  if (trialTimer) { clearTimeout(trialTimer); trialTimer = null; }
  const endsAt = get().trialEndsAt;
  if (endsAt == null) return;
  const ms = endsAt - Date.now();
  if (ms <= 0) { derive(set, get); return; }
  // Capped because setTimeout is a signed 32-bit millisecond count: anything
  // past ~24.8 days overflows and fires IMMEDIATELY, which would end a trial the
  // moment it started. Three days is well inside that, but the cap costs nothing
  // and survives somebody retuning TRIAL_DAYS to thirty.
  trialTimer = setTimeout(
    () => useSubscriptionStore.getState().syncTrial(),
    Math.min(ms, 2_000_000_000),
  );
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      entitled: false,
      trialEndsAt: null,
      trialUsed: false,
      isReviewer: false,
      ready: false,
      available: purchases.available,
      monthly: null,

      canStartTrial: () => {
        const s = get();
        return !s.entitled && !s.trialUsed;
      },

      startTrial: (source = 'post_lesson') => {
        if (!get().canStartTrial()) return;
        const endsAt = trialEndFrom(Date.now());
        set({ trialEndsAt: endsAt, trialUsed: true });
        derive(set, get);
        track('trial_started', { days: TRIAL_DAYS, source });
        useUIStore.getState().showConferral('trial');
        armTrialClock(set, get);
      },

      syncTrial: () => {
        const s = get();
        // Nothing to do unless a live trial has just stopped being live. Guarded
        // rather than derived unconditionally because this runs on every
        // foreground, and a `set` whose value has not changed still re-renders
        // every screen subscribed to this store (section 19).
        if (s.trialEndsAt == null) return;
        const nowPro = s.entitled || s.isReviewer || trialActive(s.trialEndsAt, Date.now());
        if (nowPro === s.isPro) return;
        derive(set, get);
        if (!nowPro) track('trial_ended', { days: TRIAL_DAYS });
      },

      init: async (appUserId, email) => {
        if (initStarted) return;
        initStarted = true;
        // Reviewer accounts are Pro from the first frame, regardless of billing.
        const isReviewer = isReviewerAccount(email);
        if (isReviewer) { set({ isReviewer: true }); derive(set, get); }
        // The clock has to be armed for a trial that was already running when the
        // app was killed -- otherwise it expires only on the next foreground, and
        // a reader sitting in the app watches it run past its end.
        armTrialClock(set, get);
        try {
          await purchases.configure(appUserId);
          const [pro, monthly] = await Promise.all([
            purchases.isPro(),
            purchases.getMonthlyPackage(),
          ]);
          set({ entitled: pro || get().isReviewer, monthly, ready: true, available: purchases.available });
          derive(set, get);
          // Keep isPro live: the store pushes entitlement changes (renewals,
          // expirations, Ask-to-Buy, purchases/restores on another device).
          // Registered once for the app's lifetime, so no unsubscribe is needed.
          purchases.addCustomerInfoListener((pro2) => {
            set({ entitled: pro2 || get().isReviewer });
            derive(set, get);
          });
        } catch {
          // Degrade gracefully: keep the cached isPro, just mark ready so the UI
          // stops waiting. Never block the app on a billing failure.
          set({ ready: true, available: purchases.available });
        }
      },

      refresh: async () => {
        // Read entitlement and offering INDEPENDENTLY: a store with no offering
        // configured yet (common before launch) makes getMonthlyPackage throw,
        // and we must not let that clobber the entitlement — or, worse, drop a
        // reviewer back behind the paywall.
        try {
          const pro = await purchases.isPro();
          set({ entitled: pro || get().isReviewer });
          derive(set, get);
        } catch {
          // Couldn't read entitlement; keep the cached value but never downgrade
          // a reviewer (they're Pro regardless of billing).
          if (get().isReviewer) { set({ entitled: true }); derive(set, get); }
        }
        try {
          set({ monthly: await purchases.getMonthlyPackage() });
        } catch {
          /* offering not ready; keep cached package */
        }
      },

      // Re-associate RevenueCat with the signed-in user (or clear on sign-out),
      // refresh the reviewer flag from the new account, then re-read entitlement.
      setUser: async (appUserId, email) => {
        // Reviewer accounts are Pro from the first frame, regardless of billing —
        // force it on immediately (mirroring init) so a fresh sign-in clears the
        // paywall even if RevenueCat can't be reached. The refresh() below can
        // only ever keep it true for a reviewer, never turn it back off.
        const isReviewer = isReviewerAccount(email);
        set(isReviewer ? { isReviewer: true, entitled: true } : { isReviewer: false });
        derive(set, get);
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
          // NAMED `bought`, NOT `isPro`. A local called `isPro` inside the one
          // store where `isPro` is a DERIVED field reads as an assignment to it
          // and is not one -- what the store gains here is `entitled`. It also
          // made check-pass's "isPro is written in exactly one place" rule report
          // three writes where there is one.
          const bought = await purchases.purchase(target);
          set({ entitled: bought || get().isReviewer });
          derive(set, get);
          // `$revenue` is the property PostHog's revenue views read; the rest is
          // there so a purchase can be broken down by price point and currency.
          if (bought)
            track('subscribe_succeeded', {
              plan: 'scholars_pass',
              product_id: target.productId,
              $revenue: target.price,
              revenue: target.price,
              currency: target.currency,
              price_string: target.priceString,
              period: target.period,
            });
          // THE CEREMONY, RAISED HERE AND NOWHERE ELSE. Four screens can start a
          // purchase and three of them close themselves the instant `isPro`
          // flips, so a conferral owned by the caller would be unmounted by its
          // own success. See the note in uiStore.
          if (bought) useUIStore.getState().showConferral('purchase');
          return bought ? 'success' : 'error';
        } catch (e) {
          if (e instanceof PurchasesCancelledError) return 'cancelled';
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },

      restore: async () => {
        try {
          const restored = await purchases.restore();
          set({ entitled: restored || get().isReviewer });
          derive(set, get);
          // NO CEREMONY ON A RESTORE. It is the same Pass they already had, on a
          // new phone -- a conferral there would be congratulating somebody on
          // something that happened months ago, which is the rule section 19
          // states for the streak celebration and for Insights' arrival.
          return restored ? 'restored' : 'none';
        } catch (e) {
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },
    }),
    {
      name: 'philosophize-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      // The cached entitlement and the trial. Everything else is re-derived from
      // RevenueCat at launch -- but the trial has no server behind it at all, so
      // these fields ARE the trial: lose them and a reader who took it three
      // hours ago is back behind the wall with a fresh offer waiting.
      partialize: (s) => ({
        isPro: s.isPro, entitled: s.entitled,
        trialEndsAt: s.trialEndsAt, trialUsed: s.trialUsed,
      }),
      // A store persisted before the trial existed has `isPro` and none of the
      // rest. Without this, `entitled` rehydrates as its initial `false` while
      // `isPro` rehydrates as `true`, and the first `derive` of the session
      // silently downgrades a paying subscriber. Old shape in, new shape out.
      version: 1,
      migrate: (persisted, version) => {
        const prev = (persisted ?? {}) as Partial<SubscriptionState>;
        if (version < 1 && prev.entitled === undefined) {
          return { ...prev, entitled: !!prev.isPro, trialEndsAt: null, trialUsed: false };
        }
        return prev;
      },
    }
  )
);
