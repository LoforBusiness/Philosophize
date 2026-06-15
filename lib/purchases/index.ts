import Constants from 'expo-constants';
import type { PurchasesProvider } from './types';
import { stubProvider } from './stub';

// Native resolver. Metro picks index.web.ts for web automatically; this file is
// used on iOS/Android.
//
// Inside Expo Go the native RevenueCat module isn't present, so we must NOT load
// real.ts (it would crash when the SDK touches the missing native module). We
// detect Expo Go via the execution environment and fall back to the stub, so the
// app runs in Expo Go and only does real IAP in a dev/standalone build.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let provider: PurchasesProvider = stubProvider;
if (!isExpoGo) {
  try {
    // Lazy require so the SDK is only evaluated when the native module exists.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    provider = require('./real').realProvider as PurchasesProvider;
  } catch {
    provider = stubProvider;
  }
}

export const purchases = provider;
export * from './types';
