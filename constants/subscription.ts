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
