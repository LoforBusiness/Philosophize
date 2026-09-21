import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import type { PurchasesProvider, SubPackage, SubStatus, TrialPeriod } from './types';
import { NO_SUB, PurchasesCancelledError } from './types';
import { basePlanPrice, pickBasePlan } from './basePlan';
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

const UNIT: Record<string, TrialPeriod['unit']> = {
  DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year',
};

/**
 * The free trial a purchase of this package would start, read off the option it buys.
 *
 * GOOGLE ONLY. Google Play lists only the offers a reader is eligible for, so the
 * default option's free phase is a trial they will actually be given. The App
 * Store lists an introductory offer whether or not this reader may have it (that
 * takes a separate eligibility call), so iOS reports no trial rather than one it
 * might not honour. The app ships on Google Play.
 */
function trialOf(pkg: PurchasesPackage): TrialPeriod | null {
  if (Platform.OS !== 'android') return null;
  const p = pkg.product.defaultOption?.freePhase?.billingPeriod;
  const unit = p ? UNIT[p.unit] : undefined;
  return p && unit && p.value > 0 ? { value: p.value, unit } : null;
}

/**
 * The option that charges today, off the same product.
 *
 * GOOGLE ONLY, like `trialOf` and for the same reason — `subscriptionOptions` is
 * a Play concept and the App Store has no equivalent, so on iOS there is nothing
 * to offer and the button stays hidden. The app ships on Google Play.
 */
function basePlanOf(pkg: PurchasesPackage) {
  if (Platform.OS !== 'android') return null;
  return pickBasePlan(pkg.product.subscriptionOptions ?? null);
}

function normalize(pkg: PurchasesPackage): SubPackage {
  return {
    identifier: pkg.identifier,
    productId: pkg.product.identifier,
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currency: pkg.product.currencyCode,
    period: periodOf(pkg),
    trial: trialOf(pkg),
    basePlan: basePlanPrice(basePlanOf(pkg)),
    raw: pkg,
  };
}

/** The entitlement, as the facts the app shows about it. */
function statusOf(info: CustomerInfo): SubStatus {
  const e = info.entitlements.active[ENTITLEMENT_ID];
  if (!e) return NO_SUB;
  return {
    active: true,
    onTrial: e.periodType === 'TRIAL',
    expiresAt: e.expirationDateMillis ?? null,
    willRenew: e.willRenew,
    productId: e.productIdentifier ?? null,
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

  async getStatus(fresh) {
    if (fresh) {
      try {
        await Purchases.invalidateCustomerInfoCache();
      } catch {}
    }
    return statusOf(await Purchases.getCustomerInfo());
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
      return statusOf(customerInfo);
    } catch (e) {
      if (e && typeof e === 'object' && (e as { userCancelled?: boolean }).userCancelled) {
        throw new PurchasesCancelledError();
      }
      throw e;
    }
  },

  // THE SAME PASS, CHARGED TODAY. `purchasePackage` cannot do this: it buys
  // `defaultOption`, and Google gives a trial-eligible reader the trial offer as
  // their default, so the button above and this one would do the same thing.
  // Re-derived from `raw` rather than carried on the SubPackage, because the
  // option object has to be the live one the SDK handed us.
  async purchaseWithoutTrial(pkg) {
    const option = basePlanOf(pkg.raw as PurchasesPackage);
    if (!option) throw new Error('No base plan on this product to buy without a trial.');
    try {
      const { customerInfo } = await Purchases.purchaseSubscriptionOption(option);
      return statusOf(customerInfo);
    } catch (e) {
      if (e && typeof e === 'object' && (e as { userCancelled?: boolean }).userCancelled) {
        throw new PurchasesCancelledError();
      }
      throw e;
    }
  },

  async restore() {
    return statusOf(await Purchases.restorePurchases());
  },

  async getManagementURL() {
    try {
      const info = await Purchases.getCustomerInfo();
      return info.managementURL ?? null;
    } catch {
      return null;
    }
  },

  async setAttributes(attributes) {
    await Purchases.setAttributes(attributes);
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
    const listener = (info: CustomerInfo) => cb(statusOf(info));
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  },
};
