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
