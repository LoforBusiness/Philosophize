import { stubAds } from './stub';

// Web never has the native AdMob module. Metro resolves this file for the web
// bundle, so `react-native-google-mobile-ads` is never imported there and the
// web preview keeps working.
export const ads = stubAds;
export * from './types';
