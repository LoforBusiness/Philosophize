// Which days of the current calendar week (Mon–Sun) fall inside the user's
// active streak. Shared by the profile streak panel, the lesson-complete
// celebration, and the home flame so they all read from one source of truth.
//
// We only persist the streak length + the last lesson date, so a day counts as
// "done" when it is one of the last `streak` days counting back from the last
// lesson. Today, if not yet part of the streak, is highlighted as "today".

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export type WeekDayState = 'done' | 'today' | 'future';

export interface WeekDay {
  label: string;        // 'Mo', 'Tu', …
  state: WeekDayState;
}

export function weekDays(streak: number, lastLessonDate: string | null): WeekDay[] {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  const todayKey = dayKey(today);

  // The most recent day with activity (defaults to today).
  let last = today;
  if (lastLessonDate) {
    const [y, m, d] = lastLessonDate.split('-').map(Number);
    if (y && m && d) {
      const ld = new Date(y, m - 1, d);
      ld.setHours(0, 0, 0, 0);
      if (!isNaN(ld.getTime())) last = ld;
    }
  }

  // The last `streak` days, counting back from the most recent activity.
  const active = new Set<string>();
  for (let k = 0; k < streak; k++) {
    const d = new Date(last);
    d.setDate(last.getDate() - k);
    active.add(dayKey(d));
  }

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    const state: WeekDayState = active.has(key) ? 'done' : key === todayKey ? 'today' : 'future';
    return { label, state };
  });
}
