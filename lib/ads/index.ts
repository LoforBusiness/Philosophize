import Constants from 'expo-constants';
import type { AdsProvider } from './types';
import { stubAds } from './stub';

// Native resolver. Metro picks index.web.ts for web automatically; this file is
// used on iOS/Android. Inside Expo Go the native AdMob module isn't present, so
// we fall back to the stub (loading real.ts would crash on the missing module).
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let provider: AdsProvider = stubAds;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    provider = require('./real').realAds as AdsProvider;
  } catch {
    provider = stubAds;
  }
}

export const ads = provider;
export * from './types';
