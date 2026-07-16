import type { AdsProvider } from './types';

// No-op provider for environments without the native AdMob module: the web
// preview and Expo Go. initialize() does nothing and showInterstitial() resolves
// immediately, so lesson completion flows through with no ad — keeping `npm
// start` (web) and Expo Go fully functional during development.
export const stubAds: AdsProvider = {
  available: false,
  async initialize() {},
  async showInterstitial() {},
  // No ads here, so no consent was ever gathered and there is nothing to revoke.
  privacyOptionsRequired: () => false,
  async showPrivacyOptions() {},
};
