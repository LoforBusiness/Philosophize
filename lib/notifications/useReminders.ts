import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useUserDataStore } from '@/stores/userDataStore';
import { effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { notifications } from '.';

function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Keeps the scheduled reminders in step with the settings and with the streak.
 *
 * Mounted once, in the root layout. It re-syncs whenever a preference changes,
 * whenever a lesson is finished (`lastLessonDate` / `streak` move), and on every
 * return to the foreground — that last one is what makes the streak warning
 * honest, since it is the moment we learn the day has rolled over and tonight's
 * warning needs re-deciding.
 */
export function useReminders() {
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  const dailyReminder = useUserDataStore((s) => s.settings.dailyReminder);
  const reminderTime = useUserDataStore((s) => s.settings.reminderTime);
  const streakAlerts = useUserDataStore((s) => s.settings.streakAlerts);
  const quoteOfDay = useUserDataStore((s) => s.settings.quoteOfDay);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);

  // Read through a ref inside the AppState listener so the listener is attached
  // once rather than torn down and re-attached on every settings change.
  const latest = useRef({ dailyReminder, reminderTime, streakAlerts, quoteOfDay, streakRaw, lastLessonDate, restDaysEarned, restDaysUsed });
  latest.current = { dailyReminder, reminderTime, streakAlerts, quoteOfDay, streakRaw, lastLessonDate, restDaysEarned, restDaysUsed };

  const run = () => {
    if (!hasHydrated || !notifications.isSupported()) return;
    const s = latest.current;
    void notifications.sync(
      {
        dailyReminder: s.dailyReminder,
        reminderTime: s.reminderTime,
        streakAlerts: s.streakAlerts,
        quoteOfDay: s.quoteOfDay,
      },
      {
        // The DISPLAYED streak, not the stored one — a stored streak lingers at
        // its old value after a missed day, and a notification announcing a
        // streak that has already lapsed is exactly the kind of thing that
        // teaches people to ignore notifications.
        streak: effectiveStreak(s.streakRaw, s.lastLessonDate, restDaysHeld(s.restDaysEarned, s.restDaysUsed)),
        doneToday: s.lastLessonDate === todayKey(),
      }
    );
  };

  useEffect(run, [hasHydrated, dailyReminder, reminderTime, streakAlerts, quoteOfDay, streakRaw, lastLessonDate]);

  useEffect(() => {
    if (!notifications.isSupported()) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, [hasHydrated]);
}
