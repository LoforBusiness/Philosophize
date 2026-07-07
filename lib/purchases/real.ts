import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import type { PurchasesProvider, SubPackage } from './types';
import { PurchasesCancelledError } from './types';
import { ENTITLEMENT_ID, OFFERING_ID } from '@/constants/subscription';

// Real RevenueCat-backed provider. Only ever loaded in a native build that has
// the compiled module (dev client / TestFlight / store build) — never on web or
// in Expo Go (see ./index.ts), so it's safe to import the SDK at module scope.

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

function apiKey(): string | undefined {
  return Platform.select({ ios: IOS_KEY, android: ANDROID_KEY, default: undefined });
}

function periodOf(pkg: PurchasesPackage): SubPackage['period'] {
  if (pkg.packageType === PACKAGE_TYPE.MONTHLY) return 'month';
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return 'year';
  return 'unknown';
}

function normalize(pkg: PurchasesPackage): SubPackage {
  return {
    identifier: pkg.identifier,
    productId: pkg.product.identifier,
    priceString: pkg.product.priceString,
    period: periodOf(pkg),
    raw: pkg,
  };
}

let configured = false;

export const realProvider: PurchasesProvider = {
  available: true,

  async configure(appUserId) {
    if (configured) return;
    const key = apiKey();
    if (!key) throw new Error('Missing RevenueCat API key for this platform.');
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: key, appUserID: appUserId ?? undefined });
    configured = true;
  },

  async isPro() {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] != null;
  },

  async getMonthlyPackage() {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.current ?? offerings.all[OFFERING_ID] ?? null;
    if (!offering) return null;
    const pkg = offering.monthly ?? offering.availablePackages[0] ?? null;
    return pkg ? normalize(pkg) : null;
  },

  async purchase(pkg) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg.raw as PurchasesPackage);
      return customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    } catch (e) {
      if (e && typeof e === 'object' && (e as { userCancelled?: boolean }).userCancelled) {
        throw new PurchasesCancelledError();
      }
      throw e;
    }
  },

  async restore() {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] != null;
  },

  async getManagementURL() {
    try {
      const info = await Purchases.getCustomerInfo();
      return info.managementURL ?? null;
    } catch {
      return null;
    }
  },

  async logIn(appUserId) {
    await Purchases.logIn(appUserId);
  },

  async logOut() {
    // logOut throws if the current user is already anonymous — harmless here.
    try {
      await Purchases.logOut();
    } catch {}
  },

  addCustomerInfoListener(cb) {
    const listener = (info: CustomerInfo) =>
      cb(info.entitlements.active[ENTITLEMENT_ID] != null);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  },
};
