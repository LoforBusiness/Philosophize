import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';
import type { AdsProvider } from './types';
import { interstitialUnitId } from '@/constants/ads';

// Real AdMob-backed provider. Only ever loaded in a native build that has the
// compiled module (dev client / TestFlight / store) — never on web or in Expo
// Go (see ./index.ts), so it's safe to import the SDK at module scope.

let started = false;
let canRequestAds = false;
let interstitial: InterstitialAd | null = null;
let loaded = false;

function unitId(): string {
  // Always use Google's reserved test unit in development to avoid policy
  // strikes against real units; production reads the configured env unit.
  if (__DEV__) return TestIds.INTERSTITIAL;
  return interstitialUnitId() ?? TestIds.INTERSTITIAL;
}

// Build + load the next interstitial so it's ready by the next lesson end.
function preload() {
  if (!canRequestAds) return;
  const ad = InterstitialAd.createForAdRequest(unitId(), {
    requestNonPersonalizedAdsOnly: false, // UMP/consent governs personalization
  });
  loaded = false;
  ad.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    // Recycle: a one-shot ad can't be reshown — drop it and queue the next one.
    loaded = false;
    interstitial = null;
    preload();
  });
  interstitial = ad;
  ad.load();
}

export const realAds: AdsProvider = {
  available: true,

  async initialize() {
    if (started) return;
    started = true;
    try {
      // UMP consent (GDPR) + ATT on iOS; shows a form only if required.
      const info = await AdsConsent.gatherConsent();
      canRequestAds = info.canRequestAds;
    } catch {
      // Fail open — serve ads (the SDK still respects any stored consent).
      canRequestAds = true;
    }
    try {
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
      await mobileAds().initialize();
    } catch {
      /* SDK init failed — showInterstitial will simply no-op */
    }
    preload();
  },

  async showInterstitial() {
    const ad = interstitial;
    if (!ad || !loaded) {
      // Nothing ready — make sure one is queued for next time, then proceed.
      if (canRequestAds && !ad) preload();
      return;
    }
    await new Promise<void>((resolve) => {
      let done = false;
      let offClosed: () => void = () => {};
      let offError: () => void = () => {};
      let timer: ReturnType<typeof setTimeout>;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        offClosed();
        offError();
        resolve();
      };
      offClosed = ad.addAdEventListener(AdEventType.CLOSED, finish);
      offError = ad.addAdEventListener(AdEventType.ERROR, finish);
      // Safety net: never let a stuck ad block the user's navigation.
      timer = setTimeout(finish, 15000);
      ad.show().catch(finish);
    });
  },
};
