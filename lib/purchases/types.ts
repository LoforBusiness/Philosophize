// Platform-agnostic contract for in-app purchases. The real implementation
// (lib/purchases/real.ts) wraps `react-native-purchases`; the stub
// (lib/purchases/stub.ts) is used on web and inside Expo Go, where the native
// RevenueCat module isn't available. `lib/purchases/index*.ts` picks one.

// A normalized subscription package — the bits the UI needs, decoupled from the
// RevenueCat SDK types. `raw` carries the underlying PurchasesPackage on native.
export interface SubPackage {
  identifier: string; // RevenueCat package identifier
  productId: string; // store product id
  priceString: string; // localized, e.g. "$6.99"
  period: 'month' | 'year' | 'unknown';
  raw?: unknown; // underlying PurchasesPackage (native only)
}

export interface PurchasesProvider {
  // True only in a real native build where IAP can actually run. Web/Expo Go
  // report false so the UI can explain why a purchase can't complete.
  readonly available: boolean;

  // Configure the SDK. Safe to call once on launch. `appUserId` ties purchases
  // to the signed-in user (null = anonymous RevenueCat id).
  configure(appUserId: string | null): Promise<void>;

  // Whether the Scholar's Pass entitlement is currently active.
  isPro(): Promise<boolean>;

  // The monthly package from the current offering, or null if none/unavailable.
  getMonthlyPackage(): Promise<SubPackage | null>;

  // Buy a package. Resolves to the resulting entitlement state. Throws
  // PurchasesCancelledError if the user backs out, PurchasesUnavailableError on
  // web/Expo Go.
  purchase(pkg: SubPackage): Promise<boolean>;

  // Restore prior purchases (App Store requirement). Resolves to entitlement state.
  restore(): Promise<boolean>;

  // The store's "manage subscription" deep link for the current customer (Google
  // Play / App Store), where the user actually cancels. null if there's no active
  // store subscription (e.g. reviewer grant) or it can't be read. Cancellation
  // must happen in the store — apps can't cancel a subscription themselves.
  getManagementURL(): Promise<string | null>;

  // Identity: associate / clear the current user with RevenueCat.
  logIn(appUserId: string): Promise<void>;
  logOut(): Promise<void>;

  // Subscribe to entitlement changes pushed by the store/RevenueCat — renewals,
  // expirations, Ask-to-Buy approvals, and purchases or restores made on another
  // device. The callback fires with the current Scholar's Pass active state.
  // Returns an unsubscribe function. No-op on web/Expo Go.
  addCustomerInfoListener(cb: (isPro: boolean) => void): () => void;
}

// IAP isn't available in this environment (web preview or Expo Go).
export class PurchasesUnavailableError extends Error {
  constructor() {
    super('In-app purchases are only available in the installed app.');
    this.name = 'PurchasesUnavailableError';
  }
}

// The user cancelled the native purchase sheet — not a real error.
export class PurchasesCancelledError extends Error {
  constructor() {
    super('Purchase cancelled.');
    this.name = 'PurchasesCancelledError';
  }
}
