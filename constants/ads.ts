import { Platform } from 'react-native';

// Single source of truth for Google AdMob.
//
// Monetization model: free users see ONE full-screen interstitial right after
// finishing a lesson (on "Continue", after the XP/streak screen). Subscribers
// (Scholar's Pass) never see ads. See docs/ADMOB_SETUP.md.

// AdMob *App IDs* — build-time, consumed by the config plugin in app.json.
// Android is the REAL id (live since the first public Play release). iOS is
// still Google's TEST id — replace it when the App Store pass happens.
// (Documented here for reference only; app.json is the source of truth.)
export const ADMOB_APP_ID = {
  android: 'ca-app-pub-8916255747221090~2303226096',
  ios: 'ca-app-pub-3940256099942544~1458002511', // TODO: real id before iOS ships
} as const;

// Interstitial ad *unit* id (runtime). In __DEV__ the provider always uses
// Google's reserved test unit (TestIds.INTERSTITIAL); in production it reads
// these from env. Returns undefined if unset (provider falls back to the test id).
export function interstitialUnitId(): string | undefined {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
    default: undefined,
  });
}
