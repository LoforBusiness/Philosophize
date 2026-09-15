import { TRIAL_REMINDER_BEFORE_MS, ANDROID_PACKAGE } from '@/constants/subscription';
import type { SubStatus, TrialPeriod } from '@/lib/purchases/types';

// ─────────────────────────────────────────────────────────────────────────────
// THE TRIAL'S ARITHMETIC, AND NOTHING ELSE.
//
// NO REACT AND NO STORE IN THIS FILE, the same rule `passValue.ts` states and for
// the same reason: `check-pass` imports it in plain Node and re-derives every
// claim the trial screens make. A countdown that is drawn from one calculation
// and checked against another is a countdown nobody has actually checked.
//
// `now` is always passed in rather than read from the clock, which is what makes
// every one of these testable at a stated instant — and, incidentally, what stops
// them being called during a render on a value that changes underneath them.
// ─────────────────────────────────────────────────────────────────────────────

/** Is the trial running at this instant? A null end is "never started". */
export function trialActive(endsAt: number | null, now: number): boolean {
  return endsAt != null && endsAt > now;
}

/** Milliseconds left, floored at zero so no caller ever renders a negative. */
export function trialLeft(endsAt: number | null, now: number): number {
  if (endsAt == null) return 0;
  return Math.max(0, endsAt - now);
}

/**
 * WHAT THE READER IS TOLD IS LEFT, and it rounds UP on purpose.
 *
 * A trial started at 9am on Monday ends at 9am on Thursday. At 10am on Monday it
 * has 71 hours to run — which is "2 days" if you floor it, and a reader who was
 * promised three and is told two an hour later has been short-changed by a
 * rounding rule. Ceiling means the figure only ever falls when a whole day of
 * the promise has actually gone, and the last day reads in hours instead.
 *
 * The final hour is deliberately not counted down to the minute. A clock ticking
 * toward the end of something free is a pressure tactic, and this app does not
 * have one anywhere else — the streak says "today", the renewal says "in 12
 * days". `Ends within the hour` is the last thing it says.
 */
export function trialLabel(msLeft: number): string {
  if (msLeft <= 0) return 'Ended';
  const hours = msLeft / 3_600_000;
  if (hours <= 1) return 'Ends within the hour';
  if (hours < 24) {
    const h = Math.ceil(hours);
    return `${h} ${h === 1 ? 'hour' : 'hours'} left`;
  }
  const days = Math.ceil(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

/** `3 days`, `1 week`: the offer's length, for running text. */
export function trialLengthPhrase(t: TrialPeriod): string {
  return `${t.value} ${t.value === 1 ? t.unit : `${t.unit}s`}`;
}

/** `3-day`, `1-week`: the same length as the adjective in "a 3-day free trial". */
export function trialAdjective(t: TrialPeriod): string {
  return `${t.value}-${t.unit}`;
}

/** The offer's length in days, for analytics. A month counts as thirty. */
export function trialDays(t: TrialPeriod): number {
  const per = { day: 1, week: 7, month: 30, year: 365 }[t.unit];
  return t.value * per;
}

/** When the reminder is due: a day before the trial ends. */
export function reminderAt(endsAt: number): number {
  return endsAt - TRIAL_REMINDER_BEFORE_MS;
}

/**
 * The page in Google Play that manages THIS subscription, where it is cancelled.
 *
 * Google's documented deep link. With `sku` and `package` it opens on the
 * subscription itself instead of on a list the reader has to search, which is
 * the difference between an easy cancel and one somebody can complain about.
 * RevenueCat names a Google product `subscription:basePlan`, and Play wants only
 * the first half.
 */
export function playSubscriptionUrl(productId: string | null): string {
  const base = 'https://play.google.com/store/account/subscriptions';
  if (!productId) return base;
  const sku = productId.split(':')[0];
  return `${base}?sku=${encodeURIComponent(sku)}&package=${ANDROID_PACKAGE}`;
}

/**
 * `Thursday, September 18 at 9:41 AM`, in the reader's own locale and time zone.
 *
 * The day AND the time, because "ends Thursday" leaves a reader guessing whether
 * cancelling on Thursday afternoon is still in time.
 */
export function whenLabel(ms: number): string {
  const d = new Date(ms);
  const day = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  // The time is held together with no-break spaces: in Settings' narrow card
  // "9:43 PM" broke with "PM" alone on its own line.
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .replace(/\s/g, ' ');
  return `${day} at ${time}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// WHICH OF FIVE STATES THE READER IS IN.
//
// Every screen in the Pass family used to work this out for itself from
// `isPro`, `entitled` and a date, and they did not all agree. `isPro` is true in
// four of the five, so it cannot tell a trial from a paid Pass. Those two need
// opposite things on screen: a reader on the trial has to be told it will charge
// and shown how to stop it, and a paying reader has to be left alone. So it is
// decided once, here, in the order that matters:
//
//   trial        Google Play's free trial. Converts unless `willRenew` is false.
//   paid         An active subscription that is not a trial.
//   reviewer     The allow-list; nothing to cancel, nothing to buy.
//   deviceTrial  The RETIRED on-device trial, still running for a reader who
//                took it before it was retired. Ends by itself; nothing converts.
//   free         Everybody else. `offer` is the trial Google would give, if any.
// ─────────────────────────────────────────────────────────────────────────────

export interface PassInput {
  /** The store's answer (plus the reviewer allow-list), as the store holds it. */
  entitled: boolean;
  isReviewer: boolean;
  sub: SubStatus;
  /** The retired on-device trial's end, or null. */
  trialEndsAt: number | null;
  /** The trial the Subscribe button would start for this reader, or null. */
  offer: TrialPeriod | null;
}

export type PassState =
  | { kind: 'trial'; endsAt: number | null; willRenew: boolean }
  | { kind: 'paid'; willRenew: boolean; expiresAt: number | null }
  | { kind: 'reviewer' }
  | { kind: 'deviceTrial'; endsAt: number }
  | { kind: 'free'; offer: TrialPeriod | null };

export function passState(s: PassInput, now: number): PassState {
  if (s.sub.active && s.sub.onTrial) {
    return { kind: 'trial', endsAt: s.sub.expiresAt, willRenew: s.sub.willRenew };
  }
  if (s.sub.active) return { kind: 'paid', willRenew: s.sub.willRenew, expiresAt: s.sub.expiresAt };
  if (s.isReviewer) return { kind: 'reviewer' };
  // Entitled with no status behind it: a subscriber persisted before `sub`
  // existed, on the first frame before the store answers. Paid, until told
  // otherwise, which is what they were before this update too.
  if (s.entitled) return { kind: 'paid', willRenew: true, expiresAt: null };
  if (s.trialEndsAt != null && trialActive(s.trialEndsAt, now)) {
    return { kind: 'deviceTrial', endsAt: s.trialEndsAt };
  }
  return { kind: 'free', offer: s.offer };
}
