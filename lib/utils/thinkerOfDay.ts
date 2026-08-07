import { ALL_PHILOSOPHERS, type Philosopher } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';

// ─────────────────────────────────────────────────────────────────────────────
// ONE THINKER OF THE DAY, FOR EVERY SCREEN THAT SHOWS ONE.
//
// There were two. The Thinkers tab has had a featured thinker for a long time,
// picked as `ALL_PHILOSOPHERS[day % N]`; Home then grew its own card with a
// different rule and picked a different person — so the app showed two people
// under the same heading on the same day, and whichever you saw depended on
// which tab you were standing in.
//
// This is the same class of bug the profile hit when it scored philosophers with
// a formula that disagreed with the Insights screen. The fix is the same: one
// function, and every screen calls it. Do NOT inline a `% ALL_PHILOSOPHERS.length`
// anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

const N = ALL_PHILOSOPHERS.length;

/**
 * A stride coprime with the roster, so consecutive days land far apart and every
 * thinker comes up exactly once before any comes up twice.
 *
 * Plain `day % N` — what the Thinkers tab used to do — walks the array in order,
 * and the array is grouped by era: that gives a fortnight of ancient Greeks
 * followed by a fortnight of Germans. Random would repeat within weeks and would
 * not survive a reinstall.
 *
 * CHOSEN rather than hardcoded, because the roster grows: a stride that happened
 * to share a factor with the new length would cycle through a handful of the same
 * thinkers forever, and nothing would report it.
 */
const STRIDE = (() => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  for (const p of [97, 89, 83, 79, 73, 71, 67, 61, 59, 53, 47, 43, 41, 37, 31, 29, 23, 19, 13, 11, 7]) {
    if (p < N && gcd(p, N) === 1) return p;
  }
  return 1;
})();

/** Days since the epoch — the unit both screens key on. */
export function dayNumber(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 86_400_000);
}

/** Today's thinker. Same person on Home and in the Thinkers tab, by construction. */
export function thinkerOfTheDay(day: number = dayNumber()): Philosopher {
  return ALL_PHILOSOPHERS[((day * STRIDE) % N + N) % N];
}

/**
 * One of their three facts, or their one-liner if none is registered.
 *
 * The fact only advances once the WHOLE roster has been round, so the first ~223
 * days are all first impressions rather than a thinker's third-best fact showing
 * up before half of them have been met.
 */
export function factOfTheDay(day: number = dayNumber()): string {
  const who = thinkerOfTheDay(day);
  const facts = PHILOSOPHER_FACTS[who.id] ?? [];
  if (!facts.length) return who.oneLiner;
  return facts[Math.floor((day * STRIDE) / N) % facts.length];
}
