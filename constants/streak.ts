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

// ═════════════════════════════════════════════════════════════════════════════
// THE EMBER — the one colour in a black-and-white app, and where it may go.
//
// §19 bends the strict B&W identity exactly once, for desaturated photographs,
// and says why: nothing may take its contrast from artwork. This is the second
// bend, and it is deliberate rather than a drift.
//
// WHY A STREAK EARNS ONE. A streak's entire job is to say ALIVE or ABOUT TO DIE,
// at a glance, from across a room, before the reader has decided whether to open
// the app. In ink that distinction can only be carried by tone — a fuller disc, a
// heavier ring — and tone reads as "more of the same thing", not as a state
// change. Duolingo's streak works substantially because the flame is orange and
// a dead one is grey, and that is the specific mechanism being borrowed.
//
// WHERE IT MAY APPEAR, and nowhere else:
//   · the streak flame, when the streak is alive
//   · a completed day in the streak calendar
//   · the count-up and ignite on the reward screen
//
// It may NOT appear on: lesson art, badges, ranks, buttons, the paywall, or any
// other counter. One colour used in one place is a signal. The same colour used
// in six places is a theme, and then it signals nothing.
//
// THE VALUES ARE MEASURED, not picked, and `npm run check:streak` re-derives
// every one of them so this comment cannot drift into fiction.
export const EMBER = '#B4541E';       // 4.75:1 on paper — safe for the number
export const EMBER_DEEP = '#8A3F16';  // 7.16:1 on paper, carries cream at 6.64:1
export const EMBER_SOFT = '#F0DCCB';  // wash only; ink on it is 13.10:1

/**
 * A lapsed streak is not a dimmer ember, it is ash — cool, flat, obviously off.
 *
 * #B8B5AC was the first choice and it FAILED at 1.96:1. The mistake is worth
 * keeping written down because it is the natural one: ash is a pale, dead thing,
 * so a pale grey feels right, and a pale grey cannot carry the number it is
 * supposed to be colouring. A lapsed streak still has to say what it lapsed
 * FROM; that is the number the reader needs most. Cool and DARK is the honest
 * reading of "burnt out" anyway.
 */
export const ASH = '#6E6C64';         // 5.03:1 on paper

/**
 * Milestones the calendar marks and the reward screen celebrates.
 *
 * Kept short on purpose. A landmark every week stops being a landmark; these are
 * the four a reader actually says out loud.
 */
export const STREAK_MILESTONES = [7, 30, 100, 365] as const;

/** The next milestone above `n`, or null once they are all behind you. */
export function nextMilestone(n: number): number | null {
  return STREAK_MILESTONES.find((m) => m > n) ?? null;
}
