import type { BasePlanPrice } from './basePlan';

export type { BasePlanPrice };

// Platform-agnostic contract for in-app purchases. The real implementation
// (lib/purchases/real.ts) wraps `react-native-purchases`; the stub
// (lib/purchases/stub.ts) is used on web and inside Expo Go, where the native
// RevenueCat module isn't available. `lib/purchases/index*.ts` picks one.

/** A length of time as the store states it: `3 day`, `1 week`. */
export interface TrialPeriod {
  value: number;
  unit: 'day' | 'week' | 'month' | 'year';
}

// A normalized subscription package — the bits the UI needs, decoupled from the
// RevenueCat SDK types. `raw` carries the underlying PurchasesPackage on native.
export interface SubPackage {
  identifier: string; // RevenueCat package identifier
  productId: string; // store product id
  priceString: string; // localized, e.g. "$6.99"
  /**
   * The numeric price and its ISO currency, carried ALONGSIDE `priceString`
   * rather than instead of it. The UI wants the localized string and must keep
   * using it — but "$6.99" is a label, not a number, and analytics cannot add
   * labels up. Without these two, `subscribe_succeeded` could say that somebody
   * subscribed and never how much for, so revenue, ARPU and LTV were all
   * unanswerable no matter how well the funnel was instrumented.
   */
  price: number;
  currency: string;
  period: 'month' | 'year' | 'unknown';
  /**
   * THE FREE TRIAL A PURCHASE OF THIS PACKAGE WILL START, or null if it charges.
   *
   * Read off RevenueCat's `defaultOption`, which is the exact subscription option
   * `purchasePackage` buys, and Google Play lists only the offers THIS reader is
   * still eligible for. So a trial here is one the button really gives, and null
   * means the button charges today. A screen may promise free days only while
   * this is set: "3 days free" over a sheet that charges at once is the lie §14
   * exists to prevent.
   */
  trial: TrialPeriod | null;
  /**
   * THE SAME PASS, BOUGHT WITHOUT THE FREE DAYS, or null if the store does not
   * offer that.
   *
   * The mirror of `trial` above, and it exists for the same reason: a reader who
   * wants the Pass now rather than three days from now cannot get it through
   * `purchase()`, because that buys `defaultOption` and Google hands a trial
   * offer to everyone still eligible for one. This is the base plan — the
   * subscription with no introductory phase — and `purchaseWithoutTrial()` is
   * the only way to it.
   *
   * NULL MEANS DO NOT OFFER IT. `pickBasePlan` declines whenever there is not
   * exactly one obvious answer, and a screen may not show a charge-now button on
   * a guess: §14's rule is that a screen may never promise what the store will
   * not give, and a price is the most expensive kind of promise to get wrong.
   */
  basePlan: BasePlanPrice | null;
  raw?: unknown; // underlying PurchasesPackage (native only)
}

/**
 * WHAT THE STORE SAYS ABOUT THE PASS RIGHT NOW.
 *
 * More than a yes or no, because in RevenueCat a free trial is an entitlement
 * like any other: active, and unlocking everything. What sets it apart is exactly
 * what a reader on one has to be told: that it IS a trial, when it ends, and
 * whether it is about to turn into a charge.
 */
export interface SubStatus {
  /** The Scholar's Pass entitlement is active: paid for, or inside the free trial. */
  active: boolean;
  /** Inside Google Play's free trial (RevenueCat's `periodType` TRIAL). */
  onTrial: boolean;
  /** When the current period ends, in epoch ms. While `onTrial`, the trial's end. */
  expiresAt: number | null;
  /** Whether it renews at `expiresAt`. False once the reader has cancelled. */
  willRenew: boolean;
  /** The store product that unlocked it, for the link that manages it. */
  productId: string | null;
}

/** Nothing held. */
export const NO_SUB: SubStatus = {
  active: false, onTrial: false, expiresAt: null, willRenew: false, productId: null,
};

export interface PurchasesProvider {
  // True only in a real native build where IAP can actually run. Web/Expo Go
  // report false so the UI can explain why a purchase can't complete.
  readonly available: boolean;

  // Configure the SDK. Safe to call once on launch. `appUserId` ties purchases
  // to the signed-in user (null = anonymous RevenueCat id).
  configure(appUserId: string | null): Promise<void>;

  /**
   * The Scholar's Pass as the store sees it.
   *
   * `fresh` drops RevenueCat's cached customer first. It keeps one for several
   * minutes, and a reader coming back from cancelling in Google Play must not be
   * told their trial is still going to convert.
   */
  getStatus(fresh?: boolean): Promise<SubStatus>;

  // The monthly package from the current offering, or null if none/unavailable.
  getMonthlyPackage(): Promise<SubPackage | null>;

  // Buy a package. Resolves to the resulting status. Throws
  // PurchasesCancelledError if the user backs out, PurchasesUnavailableError on
  // web/Expo Go.
  //
  // THIS BUYS WHATEVER THE STORE OFFERS, which for a trial-eligible reader is
  // the trial. That is correct for the main button and wrong for the one below
  // it — see `purchaseWithoutTrial`.
  purchase(pkg: SubPackage): Promise<SubStatus>;

  /**
   * Buy the same Pass, charging today, with no free trial.
   *
   * Only callable when `pkg.basePlan` is set — the store has to have told us
   * which option charges immediately. Same errors as `purchase`, plus a plain
   * Error when no base plan was found, because reaching here without one is a
   * bug in the caller rather than a condition a reader can be in.
   */
  purchaseWithoutTrial(pkg: SubPackage): Promise<SubStatus>;

  // Restore prior purchases (App Store requirement). Resolves to the status.
  restore(): Promise<SubStatus>;

  // The store's "manage subscription" deep link for the current customer (Google
  // Play / App Store), where the user actually cancels. null if there's no active
  // store subscription (e.g. reviewer grant) or it can't be read. Cancellation
  // must happen in the store — apps can't cancel a subscription themselves.
  getManagementURL(): Promise<string | null>;

  /**
   * RevenueCat subscriber attributes.
   *
   * The monthly price is written here before a trial starts, so the reminder
   * email a server sends a day before the trial ends can state the price in the
   * reader's own currency. Best effort: it never blocks a purchase.
   */
  setAttributes(attributes: Record<string, string | null>): Promise<void>;

  // Identity: associate / clear the current user with RevenueCat.
  logIn(appUserId: string): Promise<void>;
  logOut(): Promise<void>;

  // Subscribe to entitlement changes pushed by the store/RevenueCat — renewals,
  // expirations, a trial cancelled in Google Play, and purchases or restores made
  // on another device. The callback fires with the current status. Returns an
  // unsubscribe function. No-op on web/Expo Go.
  addCustomerInfoListener(cb: (status: SubStatus) => void): () => void;
}

// IAP isn't available in this environment (web preview or Expo Go).
export class PurchasesUnavailableError extends Error {
  constructor() {
    super('In-app purchases are only available in the installed app.');
    this.name = 'PurchasesUnavailableError';
  }
}

// The user cancelled the native purchase sheet — not a real error.
export class PurchasesCancelledError extends Error {
  constructor() {
    super('Purchase cancelled.');
    this.name = 'PurchasesCancelledError';
  }
}
