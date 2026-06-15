import { stubProvider } from './stub';

// Web never has the native RevenueCat module. Metro resolves this file for the
// web bundle, so `react-native-purchases` is never imported there and the web
// preview keeps working.
export const purchases = stubProvider;
export * from './types';
