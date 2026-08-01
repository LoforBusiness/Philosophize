import Constants from 'expo-constants';
import type { NotificationsProvider } from './types';
import { stubNotifications } from './stub';

// Native resolver, same shape as lib/ads and lib/purchases. Metro picks
// index.web.ts on web; this file runs on iOS/Android.
//
// THE `try` IS THE WHOLE POINT, NOT A FORMALITY. This JS ships over the air to
// binaries that were built before expo-notifications existed as a dependency, so
// the native module is genuinely absent there — real.ts imports it at module
// scope and throws on the way in. Catching that is what turns "the app crashes on
// launch for everyone still on the old build" into "the reminders section is
// hidden until they update". Expo Go is excluded up front for the same reason.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let provider: NotificationsProvider = stubNotifications;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    provider = require('./real').realNotifications as NotificationsProvider;
  } catch {
    provider = stubNotifications;
  }
}

export const notifications = provider;
export * from './types';
