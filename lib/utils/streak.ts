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

// A streak is alive if the last completed lesson was today or yesterday — you
// still have all of "today" to keep a streak you last fed yesterday. Once a full
// calendar day passes with no lesson, the streak has lapsed.
export function streakIsAlive(lastLessonDate: string | null): boolean {
  if (!lastLessonDate) return false;
  const last = parseDayKey(lastLessonDate);
  if (!last) return false;
  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(last));
  return diff >= 0 && diff <= 1;
}

// The streak to DISPLAY. The stored `streak` only changes when a lesson is
// completed, so after a missed day it lingers at its old value; this derives the
// honest current streak (0 once it has lapsed) from lastLessonDate — without
// mutating the store, which keeps it safe from cloud sync's max-merge on streak.
export function effectiveStreak(streak: number, lastLessonDate: string | null): number {
  return streakIsAlive(lastLessonDate) ? streak : 0;
}
