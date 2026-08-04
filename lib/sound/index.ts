import type { SoundProvider } from './types';
import { stubSound } from './stub';

// Native resolver, the same shape as lib/ads, lib/purchases and lib/notifications.
// Metro picks index.web.ts on web; this file runs on iOS/Android.
//
// THE `try` IS LOad-BEARING. This JS ships over the air to binaries built before
// expo-audio was a dependency — which is every binary currently on Play — and
// `./real` imports the native module at module scope, so it throws on the way in
// there. Catching it is what makes the update safe to publish today: those
// readers get silence and everything else, instead of a crash on launch.
//
// UNLIKE NOTIFICATIONS, EXPO GO IS NOT EXCLUDED. That exclusion exists because
// expo-notifications is genuinely crippled in Expo Go; expo-audio is not, it is
// bundled in the Expo Go client and works fully. Expo Go is therefore the only
// way to HEAR any of this before a new binary exists, which is the whole reason
// the sounds can be tested at all right now.
let provider: SoundProvider = stubSound;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  provider = require('./real').realSound as SoundProvider;
} catch {
  provider = stubSound;
}

export const sound = provider;
export * from './types';
