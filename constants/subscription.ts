// Single source of truth for the Scholar's Pass subscription.
//
// These identifiers must match what you configure in the RevenueCat dashboard
// and the App Store / Play Console. See docs/REVENUECAT_SETUP.md.

// RevenueCat *entitlement* identifier. A customer "has Scholar's Pass" when this
// entitlement is active in their CustomerInfo. (Dashboard → Entitlements.)
export const ENTITLEMENT_ID = 'scholars_pass';

// RevenueCat *offering* to read packages from. 'default' is RevenueCat's
// conventional current-offering id; we fall back to whatever is current.
export const OFFERING_ID = 'default';

// Store product identifiers (for reference + the setup docs). RevenueCat maps
// these to the offering/entitlement; the app never reads them directly — it
// reads the offering's packages — but they're documented here so the dashboard,
// App Store Connect, and Play Console stay in sync.
export const MONTHLY_PRODUCT_ID = {
  ios: 'philosophize_scholars_pass_monthly',
  android: 'philosophize_scholars_pass_monthly',
} as const;

// Reviewer / tester allow-list. Accounts listed here are granted Scholar's Pass
// WITHOUT a purchase, so app-store reviewers and internal testers can get past
// the paywall (and the daily-lesson limit + ads) by simply signing in with one
// of these accounts. Matching is case-insensitive on the account's email.
//
// Read from the environment (comma-separated) rather than hardcoded, because
// this repo is PUBLIC — a committed address is an open invitation to anyone who
// can register it. Set EXPO_PUBLIC_REVIEWER_EMAILS in .env.local for local work
// and in the EAS "production" environment for builds. Unset = nobody is a
// reviewer, which is the safe default. Keep the list tiny and rotate it once a
// review is done.
//
// Note: EXPO_PUBLIC_ values are inlined into the JS bundle, so this hides the
// address from the repo, not from someone determined to unpack the APK. It is a
// convenience bypass, not a security boundary — never let it gate anything but
// the paywall.
export const REVIEWER_EMAILS: readonly string[] = (
  process.env.EXPO_PUBLIC_REVIEWER_EMAILS ?? ''
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isReviewerAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return REVIEWER_EMAILS.includes(e);
}

// Free tier: how many lessons a non-subscriber may complete per calendar day.
// Tunable — the Settings copy, paywall, and lesson gate all read this number.
export const FREE_DAILY_LESSON_LIMIT = 1;

// Grammar helper so copy reads "1 lesson" / "3 lessons" automatically.
export const lessonsWord = (n: number) => (n === 1 ? 'lesson' : 'lessons');

// Fallback price shown before RevenueCat returns a localized price (and on
// web/Expo Go, where the store isn't available). The real price always comes
// from the offering when available.
export const FALLBACK_PRICE = '$6.99';
export const BILLING_PERIOD_LABEL = 'month';

// ─────────────────────────────────────────────────────────────────────────────
// THE FREE TRIAL.
//
// Three days of the whole Pass, granted by the app, with no card and no charge.
// It is deliberately NOT a store introductory offer, and the difference is worth
// stating because the two look identical on screen and are nothing alike:
//
//   · A STORE TRIAL is configured in Play Console and RevenueCat. Tapping it
//     opens the billing sheet, the reader confirms with a real payment method,
//     the entitlement goes active with `periodType: TRIAL`, and on day four it
//     CONVERTS — they are charged unless they cancelled. It monetizes better and
//     it cannot be reset by reinstalling.
//   · THIS one is granted locally. Nobody is asked for a card, nothing converts,
//     and on day four the Pass simply closes again.
//
// The local one is what ships because it is the one that can be true today: a
// store trial needs dashboard configuration this repo cannot do, and a button
// that says "3 days free" while opening a sheet that charges immediately is the
// exact class of lie §14 exists to prevent.
//
// SWAPPING TO THE STORE VERSION LATER IS ONE FUNCTION. `startTrial()` in
// stores/subscriptionStore.ts is the seam: point it at `purchaseMonthly()` once
// the intro offer exists, keep `TRIAL_DAYS` in step with what the store is
// configured for, and every screen, every string and the whole conferral
// animation carry over untouched.
//
// KNOWN LIMIT, stated rather than discovered: the flag lives in this device's
// subscription store, which is persisted but NOT part of the cloud snapshot. A
// reader who deletes and reinstalls the app gets another three days. That is a
// lot of friction for the price of a month, and the alternative — putting an
// entitlement fact into `userDataStore` — would give the app two sources of
// truth about who has paid, which is a worse problem than a rare free week.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How long the trial runs. Every string that names it interpolates this.
 *
 * ANNOTATED `number` rather than left to infer, which is not a style choice:
 * inferred it is the literal type `3`, and TypeScript then calls every
 * `TRIAL_DAYS === 1` singular/plural test an error because the two "have no
 * overlap". A constant meant to be retuned must not narrow to the value it
 * happens to hold today.
 */
export const TRIAL_DAYS: number = 3;

/** The same figure in milliseconds, which is what the clock is compared against. */
export const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;
