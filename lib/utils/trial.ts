import { TRIAL_DAYS, TRIAL_MS } from '@/constants/subscription';

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

/** 'THREE DAYS' — the trial's length, spelled, for inscriptional type. */
export function trialSpelled(): string {
  const WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
  return WORDS[TRIAL_DAYS] ?? String(TRIAL_DAYS);
}

/** When a trial started now would end. The one place the length is applied. */
export function trialEndFrom(now: number): number {
  return now + TRIAL_MS;
}

/** `3 days` / `1 day`, for running text. */
export function trialLengthPhrase(): string {
  return `${TRIAL_DAYS} ${TRIAL_DAYS === 1 ? 'day' : 'days'}`;
}
