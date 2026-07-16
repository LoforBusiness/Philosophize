// Platform-agnostic contract for ads. The real implementation (lib/ads/real.ts)
// wraps `react-native-google-mobile-ads`; the stub (lib/ads/stub.ts) is used on
// web and inside Expo Go, where the native AdMob module isn't available.
// `lib/ads/index*.ts` picks one.
//
// Scope is intentionally tiny: a single interstitial shown after a lesson. No
// rewarded/native/banner formats.
export interface AdsProvider {
  // True only in a real native build where AdMob can run. Web/Expo Go = false.
  readonly available: boolean;

  // Gather consent (UMP/ATT), initialize the SDK, and preload an interstitial.
  // Safe to call repeatedly — internally guarded. Never throws.
  initialize(): Promise<void>;

  // Show the preloaded interstitial, resolving when it closes. Resolves
  // immediately (and silently) if no ad is ready or ads are unavailable, so it
  // NEVER blocks navigation. Never throws.
  showInterstitial(): Promise<void>;

  // Whether this user must be offered a standing way to change their ad consent
  // — true only where UMP says so (EEA/UK/Switzerland). Withdrawing consent has
  // to be as easy as giving it, so Settings shows an entry point when this is
  // true and hides it everywhere else rather than asking a US user about a
  // choice they were never offered.
  //
  // Only meaningful after initialize() has resolved; false until then, and
  // false for subscribers (who never initialize ads at all).
  privacyOptionsRequired(): boolean;

  // Reopen the UMP consent form so the user can change or withdraw consent.
  // Resolves silently if the form can't be shown. Never throws.
  showPrivacyOptions(): Promise<void>;
}
