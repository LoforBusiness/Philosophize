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
}
