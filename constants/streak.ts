// Single source of truth for rest days ("streak freezes").
//
// A rest day is spent automatically to cover a missed calendar day, so a streak
// survives one ordinary bad day instead of resetting to 1. It is the moment
// readers quit, and the cheapest place to stop them quitting.
//
// WHY TWO MONOTONIC COUNTERS AND NOT A "REMAINING" ONE. The cloud snapshot
// merges by taking the larger of two numbers wherever progress is involved
// (lib/supabase/sync.ts), because that is the only merge that can never lose
// progress. A single `restDaysRemaining` field would therefore REFILL itself:
// spend your last rest day on the phone, open the tablet that still says 2, and
// max(0, 2) hands it back. Storing `earned` and `used` separately makes max the
// correct merge in BOTH directions — the higher earn count is the true one, and
// so is the higher spend count — and `held` is derived, never stored.
export const REST_EARN_EVERY_FREE = 10; // one rest day per N-day streak
export const REST_EARN_EVERY_PRO = 5;

export const REST_CAP_FREE = 2; // most rest days that can be held at once
export const REST_CAP_PRO = 5;

export function restEarnEvery(isPro: boolean): number {
  return isPro ? REST_EARN_EVERY_PRO : REST_EARN_EVERY_FREE;
}

export function restCap(isPro: boolean): number {
  return isPro ? REST_CAP_PRO : REST_CAP_FREE;
}

/**
 * Rest days available to spend right now.
 *
 * Derived rather than stored, and clamped at 0 because a merge can legitimately
 * produce a `used` higher than this device's `earned` (the other device both
 * earned and spent one before syncing).
 */
export function restDaysHeld(earned: number, used: number): number {
  return Math.max(0, earned - used);
}
