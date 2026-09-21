// ─────────────────────────────────────────────────────────────────────────────
// WHICH SUBSCRIPTION OPTION CHARGES TODAY.
//
// The Pass has one price and two ways to start paying it, and only one of them
// is reachable through `purchasePackage`:
//
//   · RevenueCat's `defaultOption` is what `purchasePackage` buys, and Google
//     Play lists only the offers a reader is still ELIGIBLE for — so for anyone
//     who has not had the trial, the default option IS the trial offer. That is
//     the right default and it is why `SubPackage.trial` can be trusted.
//   · The BASE PLAN is the same subscription with no introductory phase at all.
//     Buying it charges the full price immediately.
//
// A reader who wants the Pass now, without three days of free first, is asking
// for the second one — and there is no flag on `purchasePackage` that produces
// it. It is a different call (`Purchases.purchaseSubscriptionOption`) against a
// different option, which is why this file exists at all.
//
// ZERO IMPORTS, the same rule as `rig.ts`, `tone.ts`, `inViewMath.ts` and
// `dialHit.ts`, and here the reason is sharper than usual: **an in-app purchase
// cannot be exercised anywhere this project can look.** It does not run on the
// web and it does not run in Expo Go, so §21's browser — the instrument behind
// almost every other check in this repo — is structurally blind to it, and the
// only other way to see it is a real store account on a real device. Picking the
// wrong option here does not draw a box in the wrong place; it charges somebody
// the wrong amount. So the choice is arithmetic over plain data, and
// `check:pass` runs it against real option shapes in plain Node.
//
// STRICT ON PURPOSE. Anything it is not certain about, it declines — and the
// caller hides the button rather than showing one that might do the wrong thing.
// §14's rule is that a screen may never promise what the store will not give;
// this is the same rule one layer down, where the promise is a price.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The shape this needs off RevenueCat's `SubscriptionOption`, and nothing more.
 *
 * Declared structurally rather than imported so the module stays dependency-free
 * and the checker can hand it literals. Every field is optional because an older
 * SDK, or the App Store, may not populate it — and a missing field must read as
 * "I do not know", never as "no".
 */
export interface OptionLike {
  isBasePlan?: boolean;
  /** A free phase — the trial. Its presence is what disqualifies an option. */
  freePhase?: unknown | null;
  /** A discounted-but-not-free phase. Also not the full price. */
  introPhase?: unknown | null;
  fullPricePhase?: {
    price?: { formatted?: string; amountMicros?: number; currencyCode?: string } | null;
  } | null;
}

/** What the caller needs to say, and charge, for the no-trial purchase. */
export interface BasePlanPrice {
  priceString: string;
  price: number;
  currency: string;
}

/** An option charges today only if nothing comes before the full price. */
function chargesNow(o: OptionLike): boolean {
  return o.freePhase == null && o.introPhase == null;
}

/**
 * The option that charges the full price immediately, or null if there is not
 * exactly one obvious answer.
 *
 * Three tiers, narrowest first, and the ORDER is the safety:
 *
 *   1. an option that says it is the base plan AND has no free or intro phase —
 *      the unambiguous case, and what Google returns for a normal subscription;
 *   2. otherwise, exactly ONE option with no free or intro phase — the base plan
 *      under an SDK that did not set the flag;
 *   3. otherwise NULL. Several options charge immediately at different prices
 *      (different billing periods, a prepaid plan), and guessing between them is
 *      guessing at what somebody is about to be charged.
 *
 * `isBasePlan` alone is deliberately NOT enough: Google attaches offers to a base
 * plan, and a reader's eligible offer can carry the base plan's own flag in some
 * shapes. The free phase is the thing being avoided, so the free phase is what
 * is tested.
 */
export function pickBasePlan<T extends OptionLike>(
  options: readonly T[] | null | undefined,
): T | null {
  if (!options || options.length === 0) return null;
  const paying = options.filter(chargesNow);
  if (paying.length === 0) return null;
  const flagged = paying.filter((o) => o.isBasePlan === true);
  if (flagged.length === 1) return flagged[0];
  if (flagged.length > 1) return null;
  return paying.length === 1 ? paying[0] : null;
}

/**
 * What that option costs, as the store words it.
 *
 * Null unless all three are present. A button that charges must be able to SAY
 * what it charges, in the reader's own currency, and §14 is the record of what
 * happens when a screen carries a price it did not get from the store: "All 50
 * badges" against a roll of seventy, and a price typed twice in dollars on a
 * screen that ships everywhere Play sells.
 */
export function basePlanPrice(option: OptionLike | null): BasePlanPrice | null {
  const p = option?.fullPricePhase?.price;
  if (!p || typeof p.formatted !== 'string' || !p.formatted) return null;
  if (typeof p.amountMicros !== 'number' || !p.currencyCode) return null;
  return {
    priceString: p.formatted,
    price: p.amountMicros / 1_000_000,
    currency: p.currencyCode,
  };
}
