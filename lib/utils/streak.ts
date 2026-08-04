import { differenceInCalendarDays, startOfDay } from 'date-fns';

export function isStreakAlive(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;
  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(lastActivityDate));
  return diff <= 1;
}

export function calculateNewStreak(currentStreak: number, lastActivityDate: Date | null): number {
  if (!lastActivityDate) return 1;
  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(lastActivityDate));
  if (diff === 0) return currentStreak; // already counted today
  if (diff === 1) return currentStreak + 1; // continuing streak
  return 1; // streak broken, restart
}

// Parse a local 'YYYY-MM-DD' key (the format the lesson runner writes to
// lastLessonDate) into a local Date.
function parseDayKey(key: string): Date | null {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Whole calendar days that went by with nothing completed, between two day keys.
 *
 * PURE OVER ITS ARGUMENTS — it never reads the clock. The streak is computed in
 * two places that must agree exactly (previewDailyActivity, which decides what
 * the reward screen promises, and registerDailyActivity, which commits it), and
 * a helper that consulted `new Date()` on its own could return different answers
 * to the two calls either side of midnight.
 *
 * Fed yesterday → 0 missed, because all of today is still available to feed it.
 * Fed the day before → 1 missed. A negative gap (clock moved back, or a key
 * written by a device in a later timezone) counts as 0 rather than going
 * negative, so it can never manufacture rest days.
 */
export function missedBetween(lastLessonDate: string | null, today: string): number {
  if (!lastLessonDate) return 0;
  const a = parseDayKey(lastLessonDate);
  const b = parseDayKey(today);
  if (!a || !b) return 0;
  return Math.max(0, differenceInCalendarDays(startOfDay(b), startOfDay(a)) - 1);
}

/** Days missed as of right now. The display-side wrapper around missedBetween. */
export function daysMissed(lastLessonDate: string | null): number {
  return missedBetween(lastLessonDate, todayKey());
}

/**
 * How many rest days it would cost to keep the streak alive — 0 if nothing was
 * missed, and 0 if the gap is wider than the rest days held, at which point the
 * streak is simply gone and nothing should be spent trying to save it.
 *
 * Nothing is deducted until the reader actually finishes something, so a rest
 * day is never quietly burned by someone who opens the app and puts it down.
 */
export function restDaysToSpend(
  lastLessonDate: string | null,
  today: string,
  restHeld: number,
): number {
  const missed = missedBetween(lastLessonDate, today);
  return missed > 0 && missed <= restHeld ? missed : 0;
}

// A streak is alive if the last completed lesson was today or yesterday — you
// still have all of "today" to keep a streak you last fed yesterday. Once a full
// calendar day passes with no lesson the streak has lapsed, UNLESS rest days are
// held to cover the gap: then it is still alive, and finishing anything today
// spends them (see restDaysToSpend).
export function streakIsAlive(lastLessonDate: string | null, restHeld = 0): boolean {
  if (!lastLessonDate) return false;
  const last = parseDayKey(lastLessonDate);
  if (!last) return false;
  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(last));
  if (diff < 0) return false;
  return diff - 1 <= restHeld;
}

// The streak to DISPLAY. The stored `streak` only changes when a lesson is
// completed, so after a missed day it lingers at its old value; this derives the
// honest current streak (0 once it has lapsed) from lastLessonDate — without
// mutating the store, which keeps it safe from cloud sync's max-merge on streak.
export function effectiveStreak(
  streak: number,
  lastLessonDate: string | null,
  restHeld = 0,
): number {
  return streakIsAlive(lastLessonDate, restHeld) ? streak : 0;
}
