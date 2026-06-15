import type { PurchasesProvider } from './types';
import { PurchasesUnavailableError } from './types';

// No-op provider for environments without the native RevenueCat module: the web
// preview and Expo Go. Everything resolves to "not subscribed", and attempting
// to buy/restore throws PurchasesUnavailableError so the paywall can explain
// that purchases require the installed app. This keeps `npm start` (web) and
// Expo Go fully functional during development.
export const stubProvider: PurchasesProvider = {
  available: false,
  async configure() {},
  async isPro() {
    return false;
  },
  async getMonthlyPackage() {
    return null;
  },
  async purchase() {
    throw new PurchasesUnavailableError();
  },
  async restore() {
    throw new PurchasesUnavailableError();
  },
  async logIn() {},
  async logOut() {},
};
