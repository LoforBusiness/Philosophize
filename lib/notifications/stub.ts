import type { NotificationsProvider } from './types';

// Web, Expo Go, and every APK that predates the expo-notifications dependency.
// `isSupported()` returning false is what makes the Settings section disappear
// rather than sit there doing nothing.
export const stubNotifications: NotificationsProvider = {
  isSupported: () => false,
  hasPermission: async () => false,
  requestPermission: async () => false,
  sync: async () => {},
};
