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
// THE FREE TRIAL IS GOOGLE PLAY'S.
//
// For its first life the trial was granted BY THE APP: three days written onto
// this phone, no card, nothing to cancel, closing by itself. That was true as
// far as it went, and it sat beside a second trial no screen mentioned. The
// monthly subscription carries a free-trial offer in Play Console, so the
// Subscribe button was starting GOOGLE'S trial, which converts into a charge.
// Two trials, and the one that charges was the one saying nothing about it.
//
// There is one trial now, and it is the store's. That was the reader's choice
// (2026-09-15), and this is what it means:
//
//   · STARTING IT opens Google's payment sheet. Google shows its own terms, the
//     reader confirms with a payment method, and nothing is charged today.
//   · WHEN IT ENDS it automatically becomes a Scholar's Pass at the monthly
//     price, unless the reader cancelled first. Google Play does that and
//     charges it. The app cannot, and cannot stop it either.
//   · ITS LENGTH IS WHATEVER THE OFFER SAYS. It is read off the exact option a
//     purchase buys (`SubPackage.trial`), and Google lists only the offers a
//     reader is still eligible for, so no screen can promise free days the button
//     would not give. `TRIAL_DAYS` below is what Play Console is set to, for the
//     web preview and the checks. No screen reads it.
//
// Google Play's policy asks every app with a trial to say, before it starts, how
// long it lasts, what it costs afterwards, when it converts and how to cancel,
// and to give an easy way to cancel inside the app. Those sentences live once, in
// `lib/utils/trialTerms.ts`, and `check:pass` §9 holds every door to them.
//
// A READER WHO TOOK THE OLD ON-DEVICE TRIAL keeps it until it ends. See
// `trialEndsAt` in stores/subscriptionStore.ts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What Play Console's free-trial offer is set to. Screens read the offer itself.
 *
 * ANNOTATED `number` rather than left to infer, which is not a style choice:
 * inferred it is the literal type `3`, and TypeScript then calls every
 * `TRIAL_DAYS === 1` singular/plural test an error because the two "have no
 * overlap". A constant meant to be retuned must not narrow to the value it
 * happens to hold today.
 */
export const TRIAL_DAYS: number = 3;

/**
 * "A day before it ends." The reminder notification is laid down this long
 * before the trial's end, and the reminder email goes out in the same window.
 * The email is sent by a server that cannot import this file, so
 * `supabase/functions/_shared/trialReminder.ts` states the figure again, and
 * `check:pass` fails if the two ever disagree.
 */
export const TRIAL_REMINDER_BEFORE_MS = 24 * 60 * 60 * 1000;

/** The Play package, for the link that opens THIS subscription in Google Play. */
export const ANDROID_PACKAGE = 'com.philosophize.app';

/**
 * Whether the reminder EMAIL is actually being sent.
 *
 * False until the two functions in supabase/functions are deployed and
 * RevenueCat's webhook points at them. Until then no screen may mention an
 * email, because a promised email that never arrives is exactly the complaint
 * this whole flow exists to prevent.
 */
export const TRIAL_EMAIL_REMINDERS: boolean = false;
