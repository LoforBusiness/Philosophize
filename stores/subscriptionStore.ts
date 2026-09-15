import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Linking, Platform } from 'react-native';
import {
  purchases,
  PurchasesCancelledError,
  PurchasesUnavailableError,
  NO_SUB,
  type SubPackage,
  type SubStatus,
} from '@/lib/purchases';
import { isReviewerAccount, TRIAL_DAYS } from '@/constants/subscription';
import {
  trialActive, trialDays, passState, playSubscriptionUrl, type PassState,
} from '@/lib/utils/trial';
import { useUIStore } from '@/stores/uiStore';
import { track } from '@/lib/posthog';

export type PurchaseOutcome = 'success' | 'cancelled' | 'unavailable' | 'error';
export type RestoreOutcome = 'restored' | 'none' | 'unavailable' | 'error';

// -----------------------------------------------------------------------------
// `isPro` IS DERIVED, AND THE FREE TRIAL IS GOOGLE PLAY'S.
//
// Roughly forty places read `useSubscriptionStore((s) => s.isPro)`: the lesson
// gate, the ad, the daily limit, the rest-day caps, the replay rule, six screens
// and the reward. It keeps its one meaning, "may this reader do Pro things right
// now", and three things can make it true:
//
//   - `entitled`. The store's answer, plus the reviewer allow-list. Google Play's
//     free trial is an active entitlement exactly like a paid one, so a reader on
//     the trial is entitled. `sub` carries what sets a trial apart: that it is one,
//     when it ends, and whether it is going to convert.
//   - `trialEndsAt`. THE RETIRED ON-DEVICE TRIAL. Until 2026-09-15 the app granted
//     three days itself, with no card. It starts none now (see the long note in
//     constants/subscription.ts), but a reader who took one before this update
//     keeps it until it ends, and the clock below closes it.
//
// EVERY WRITE GOES THROUGH `derive`, so the three can never disagree. A bare
// `set({ isPro })` anywhere else in this file would be the bug this note exists to
// make impossible; there is not one, and check-pass asserts it.
// -----------------------------------------------------------------------------

interface SubscriptionState {
  // MAY THIS READER DO PRO THINGS RIGHT NOW: entitled (paid or on Google's trial),
  // a reviewer, or inside the retired on-device trial. Derived from the fields
  // below and never set directly; see the note above. Persisted so a returning
  // subscriber isn't gated on the first frame before RevenueCat responds.
  isPro: boolean;
  // The store's answer (plus the reviewer allow-list). True on Google's free
  // trial as well as on a paid Pass. Reconciled by init()/refresh().
  entitled: boolean;
  // What the store says about the entitlement: trial or not, when it ends,
  // whether it renews. Persisted, so the first frame of a launch already knows a
  // reader is on a trial and when it ends.
  sub: SubStatus;
  // THE RETIRED ON-DEVICE TRIAL: when it runs out, in epoch ms, or null for every
  // reader who never took one. Nothing writes it any more. Persisted, and the
  // clock below re-derives `isPro` when it passes.
  trialEndsAt: number | null;
  // True when the signed-in account is on the reviewer/tester allow-list. Forces
  // isPro on without a purchase so app-store reviewers can clear the paywall.
  // Re-derived from the auth email on every sign-in; never persisted.
  isReviewer: boolean;
  // The signed-in account's email, so the trial's screens can say where the
  // reminder email goes. Never persisted.
  email: string | null;
  // RevenueCat configured + first CustomerInfo loaded.
  ready: boolean;
  // Whether real IAP can run on this build (false on web / Expo Go).
  available: boolean;
  // Monthly package from the current offering (null until loaded / unavailable).
  monthly: SubPackage | null;

  /**
   * May the free trial be offered? Only to a reader without the Pass, and only
   * while Google Play is actually offering THIS reader one.
   */
  canStartTrial: () => boolean;
  /**
   * Start Google Play's free trial: the payment sheet, then the ceremony.
   *
   * It REFUSES rather than buying when the store has stopped offering a trial
   * since the button was drawn. A button that said "free" must never open a sheet
   * that charges today.
   */
  startTrial: (source: string) => Promise<PurchaseOutcome>;
  /** Close the retired on-device trial when its clock runs out. Cheap, and a no-op unless the answer moved. */
  syncTrial: () => void;
  /** Open Google Play on this subscription, where it is cancelled or restarted. */
  openManage: (source: string) => Promise<void>;

  init: (appUserId: string | null, email?: string | null) => Promise<void>;
  /** Re-read the store. `fresh` skips RevenueCat's cached copy. */
  refresh: (fresh?: boolean) => Promise<void>;
  setUser: (appUserId: string | null, email?: string | null) => Promise<void>;
  purchaseMonthly: (source?: string) => Promise<PurchaseOutcome>;
  restore: () => Promise<RestoreOutcome>;
}

let initStarted = false;

type Setter = (patch: Partial<SubscriptionState>) => void;
type Getter = () => SubscriptionState;

/**
 * Recompute `isPro` from the things that can make it true.
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

function sameStatus(a: SubStatus, b: SubStatus): boolean {
  return a.active === b.active && a.onTrial === b.onTrial && a.expiresAt === b.expiresAt
    && a.willRenew === b.willRenew && a.productId === b.productId;
}

/**
 * Take the store's answer. Written only where it changed, for the same reason
 * `derive` is: a status re-read on every foreground that set a fresh object each
 * time would re-render every screen subscribed to it for nothing.
 */
function applyStatus(set: Setter, get: Getter, st: SubStatus) {
  const s = get();
  const entitled = st.active || s.isReviewer;
  const patch: Partial<SubscriptionState> = {};
  if (!sameStatus(s.sub, st)) patch.sub = st;
  if (entitled !== s.entitled) patch.entitled = entitled;
  if (patch.sub || patch.entitled !== undefined) set(patch);
  derive(set, get);
}

/**
 * THE RETIRED TRIAL ENDS ON A CLOCK, AND NOTHING ELSE IN THIS APP DOES.
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
 * customer-info listener carries -- so there is nothing to tear down.
 */
let trialTimer: ReturnType<typeof setTimeout> | null = null;
let foregroundBound = false;
/** When Google Play was last opened to manage the Pass, so the way back can re-read it. */
let manageOpenedAt = 0;

function bindForeground() {
  if (foregroundBound) return;
  foregroundBound = true;
  AppState.addEventListener('change', (st) => {
    if (st !== 'active') return;
    const store = useSubscriptionStore.getState();
    store.syncTrial();
    // BACK FROM GOOGLE PLAY. RevenueCat keeps a cached customer for several
    // minutes, so a reader who has just cancelled would come back to a screen
    // still telling them their trial will convert, which is the one thing this
    // return must not say. So it is read fresh, twice: once at once, and once a
    // few seconds later, because Google tells RevenueCat about a cancellation on
    // its own schedule, not the instant the reader taps it.
    if (manageOpenedAt && Date.now() - manageOpenedAt < 30 * 60_000) {
      manageOpenedAt = 0;
      void store.refresh(true);
      setTimeout(() => void useSubscriptionStore.getState().refresh(true), 8_000);
    }
  });
}

function armTrialClock(set: Setter, get: Getter) {
  bindForeground();
  if (trialTimer) { clearTimeout(trialTimer); trialTimer = null; }
  const endsAt = get().trialEndsAt;
  if (endsAt == null) return;
  const ms = endsAt - Date.now();
  if (ms <= 0) { derive(set, get); return; }
  // Capped because setTimeout is a signed 32-bit millisecond count: anything
  // past ~24.8 days overflows and fires IMMEDIATELY.
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
      sub: NO_SUB,
      trialEndsAt: null,
      isReviewer: false,
      email: null,
      ready: false,
      available: purchases.available,
      monthly: null,

      canStartTrial: () => {
        const s = get();
        return !s.isPro && s.monthly?.trial != null;
      },

      startTrial: async (source) => {
        if (!get().canStartTrial()) return 'error';
        return get().purchaseMonthly(source);
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

      openManage: async (source) => {
        track('subscription_manage_opened', { source });
        bindForeground();
        manageOpenedAt = Date.now();
        let url: string;
        if (Platform.OS === 'android') {
          url = playSubscriptionUrl(get().sub.productId);
        } else {
          let managed: string | null = null;
          try {
            managed = await purchases.getManagementURL();
          } catch {}
          url = managed ?? 'https://apps.apple.com/account/subscriptions';
        }
        Linking.openURL(url).catch(() => {});
      },

      init: async (appUserId, email) => {
        if (initStarted) return;
        initStarted = true;
        set({ email: email ?? null });
        // Reviewer accounts are Pro from the first frame, regardless of billing.
        const isReviewer = isReviewerAccount(email);
        if (isReviewer) { set({ isReviewer: true }); derive(set, get); }
        // The clock has to be armed for a retired trial that was already running
        // when the app was killed -- otherwise it expires only on the next
        // foreground, and a reader sitting in the app watches it run past its end.
        armTrialClock(set, get);
        try {
          await purchases.configure(appUserId);
          applyStatus(set, get, await purchases.getStatus());
          // Keep it live: the store pushes entitlement changes (renewals,
          // expirations, a trial cancelled in Google Play, purchases/restores on
          // another device). Registered once for the app's lifetime, so no
          // unsubscribe is needed.
          purchases.addCustomerInfoListener((st) => applyStatus(set, get, st));
          // Read INDEPENDENTLY of the status: a store with no offering configured
          // yet makes this throw, and that must not undo the entitlement above.
          let monthly: SubPackage | null = null;
          try {
            monthly = await purchases.getMonthlyPackage();
          } catch {}
          set({ monthly, ready: true, available: purchases.available });
        } catch {
          // Degrade gracefully: keep the cached isPro, just mark ready so the UI
          // stops waiting. Never block the app on a billing failure.
          set({ ready: true, available: purchases.available });
        }
      },

      refresh: async (fresh = false) => {
        // Read entitlement and offering INDEPENDENTLY: a store with no offering
        // configured yet (common before launch) makes getMonthlyPackage throw,
        // and we must not let that clobber the entitlement — or, worse, drop a
        // reviewer back behind the paywall.
        try {
          applyStatus(set, get, await purchases.getStatus(fresh));
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
        set(isReviewer
          ? { isReviewer: true, entitled: true, email: email ?? null }
          : { isReviewer: false, email: email ?? null });
        derive(set, get);
        try {
          if (appUserId) await purchases.logIn(appUserId);
          else await purchases.logOut();
        } catch {
          /* ignore identity errors */
        }
        await get().refresh();
      },

      purchaseMonthly: async (source) => {
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
          // THE PRICE THE TRIAL WILL BECOME, handed to RevenueCat before the sheet
          // opens, so the reminder email -- sent by a server that never sees this
          // screen -- can say it in the reader's own currency. Best effort: an
          // email without the number is still true, and a purchase must never wait
          // on it.
          try {
            await purchases.setAttributes({ pass_price: target.priceString });
          } catch {}
          const st = await purchases.purchase(target);
          applyStatus(set, get, st);
          if (!st.active) return 'error';
          // THE CEREMONY, RAISED HERE AND NOWHERE ELSE. Four screens can start a
          // purchase and three of them close themselves the instant `isPro`
          // flips, so a conferral owned by the caller would be unmounted by its
          // own success. See the note in uiStore.
          if (st.onTrial) {
            // A TRIAL START IS NOT REVENUE. Nobody has been charged, and a
            // `$revenue` here would count every trial as a sale whether or not it
            // ever converts, which is most of the number being wrong.
            track('trial_started', {
              days: target.trial ? trialDays(target.trial) : null,
              source,
            });
            useUIStore.getState().showConferral('trial');
          } else {
            // `$revenue` is the property PostHog's revenue views read; the rest is
            // there so a purchase can be broken down by price point and currency.
            track('subscribe_succeeded', {
              plan: 'scholars_pass',
              product_id: target.productId,
              $revenue: target.price,
              revenue: target.price,
              currency: target.currency,
              price_string: target.priceString,
              period: target.period,
            });
            useUIStore.getState().showConferral('purchase');
          }
          return 'success';
        } catch (e) {
          if (e instanceof PurchasesCancelledError) return 'cancelled';
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },

      restore: async () => {
        try {
          const st = await purchases.restore();
          applyStatus(set, get, st);
          // NO CEREMONY ON A RESTORE. It is the same Pass they already had, on a
          // new phone -- a conferral there would be congratulating somebody on
          // something that happened months ago, which is the rule section 19
          // states for the streak celebration and for Insights' arrival.
          return st.active ? 'restored' : 'none';
        } catch (e) {
          if (e instanceof PurchasesUnavailableError) return 'unavailable';
          return 'error';
        }
      },
    }),
    {
      name: 'philosophize-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      // The cached entitlement, the store's detail about it, and the retired
      // trial. Everything else is re-derived from RevenueCat at launch -- but
      // the retired trial has no server behind it at all, so that field IS it.
      partialize: (s) => ({
        isPro: s.isPro, entitled: s.entitled, sub: s.sub, trialEndsAt: s.trialEndsAt,
      }),
      // Old shapes in, new shape out.
      //  · v0 had `isPro` and none of the rest. Without the step below `entitled`
      //    rehydrates as its initial `false` while `isPro` rehydrates as `true`,
      //    and the first `derive` silently downgrades a paying subscriber.
      //  · v1 carried `trialUsed`, which fed an offer the store now decides.
      version: 2,
      migrate: (persisted, version) => {
        const prev = { ...((persisted ?? {}) as Record<string, unknown>) };
        if (version < 1 && prev.entitled === undefined) {
          prev.entitled = !!prev.isPro;
          prev.trialEndsAt = null;
        }
        if (version < 2) {
          delete prev.trialUsed;
          if (!prev.sub) prev.sub = NO_SUB;
        }
        return prev as unknown as SubscriptionState;
      },
    }
  )
);

/**
 * Which of the five states the reader is in, for a screen: the free trial, a
 * paid Pass, the reviewer grant, the retired on-device trial, or free. Decided
 * once, in `passState`, so no two screens can disagree about it.
 */
export function usePassState(): PassState {
  const entitled = useSubscriptionStore((s) => s.entitled);
  const isReviewer = useSubscriptionStore((s) => s.isReviewer);
  const sub = useSubscriptionStore((s) => s.sub);
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);
  const offer = useSubscriptionStore((s) => s.monthly?.trial ?? null);
  return passState({ entitled, isReviewer, sub, trialEndsAt, offer }, Date.now());
}
