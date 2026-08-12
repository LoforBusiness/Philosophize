// The streak month grid, as pure arithmetic.
//
// ZERO IMPORTS, the same rule rig.ts, tone.ts and quickStartArt.ts carry: this
// can be transpiled and run in plain Node, so `npm run check:streak` can walk a
// year of synthetic histories and assert the grid says what the streak says. A
// calendar that disagrees with the counter above it is worse than no calendar,
// and that disagreement is exactly the kind of bug that hides until December.
//
// ── WHY A HISTORY HAD TO BE RECORDED AT ALL ─────────────────────────────────
//
// lib/utils/week.ts says it plainly: the app persisted only the streak LENGTH
// and the last lesson date, and inferred the current week by counting back. That
// is exact for the run you are on and wrong for everything before it — a day you
// studied in June, then missed a day, is indistinguishable from a day you never
// opened the app. Fine for a seven-day strip that only ever shows the current
// run. Not fine for a month grid, which is mostly history.
//
// So `activeDays` is recorded from now on, and the run in progress is back-filled
// at migration, which is the most that can honestly be reconstructed.
//
// ── THE FOUR STATES, AND WHY 'rest' IS ONE OF THEM ──────────────────────────
//
// The app already has rest days (streak freezes, constants/streak.ts). A grid
// that drew a spent rest day as a MISS would show a broken-looking month beside
// an unbroken counter, and the reader would think the counter was lying. A grid
// that drew it as DONE would be taking credit for a day nobody studied. It gets
// its own mark: the streak survived here, and you did not study.

export type DayState =
  /** A lesson was finished on this day. */
  | 'done'
  /** No lesson, but a rest day covered it and the streak lived. */
  | 'rest'
  /** In the past, inside the reader's history, and nothing happened. */
  | 'missed'
  /** Today, not yet fed. The one cell that is an invitation. */
  | 'today'
  /** Later this month — not a failure, just unwritten. */
  | 'future'
  /** Before this reader joined, or before recording began. Draws as nothing. */
  | 'blank';

export interface CalendarDay {
  /** YYYY-MM-DD, or null for the leading/trailing pad cells of the grid. */
  key: string | null;
  /** Day of month, or 0 for a pad cell. */
  day: number;
  state: DayState;
  /** True when this day is part of the CURRENT unbroken run, so it can be joined
   *  to its neighbours with a connecting bar the way Duolingo's calendar does. */
  inRun: boolean;
}

export interface CalendarMonth {
  year: number;
  /** 0-11. */
  month: number;
  label: string;
  /** Six rows of seven, Monday first. Always 42 cells so the grid never reflows
   *  as the reader pages between months — a calendar that changes height while
   *  you swipe it feels broken. */
  cells: CalendarDay[];
  /** Days finished this month, and days in the month that are already past. */
  doneThisMonth: number;
  elapsedThisMonth: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const pad = (n: number) => String(n).padStart(2, '0');

/** The local YYYY-MM-DD key for a y/m/d, matching what the store writes. */
export function dayKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

/** Days in a month, handling February without a Date allocation per call. */
export function daysInMonth(y: number, m: number): number {
  return [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
}

/** Monday-first weekday index (0-6) for the 1st of a month. Zeller-free: Date is
 *  used once per month rather than once per cell. */
function firstWeekdayMondayFirst(y: number, m: number): number {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

export interface CalendarInput {
  year: number;
  month: number;
  /** Days a lesson was completed. */
  active: ReadonlySet<string>;
  /** Days a rest day was spent to bridge a gap. */
  rest: ReadonlySet<string>;
  /** Today's key, passed in rather than read from the clock so the grid is pure
   *  and a test can sit on any date it likes. */
  today: string;
  /** The reader's first day. Anything before it is 'blank', not 'missed' —
   *  showing someone a wall of misses from before they installed the app is a
   *  punishment for having joined. */
  since: string | null;
}

export function buildMonth(input: CalendarInput): CalendarMonth {
  const { year, month, active, rest, today, since } = input;
  const lead = firstWeekdayMondayFirst(year, month);
  const total = daysInMonth(year, month);
  const cells: CalendarDay[] = [];

  // The current run: walk back from today (or the last active day) while each
  // previous day is either active or rested. This is what gets the connecting
  // bars right across a month boundary without needing the whole history in view.
  const run = new Set<string>();
  {
    const [ty, tm, td] = today.split('-').map(Number);
    const cur = new Date(ty, tm - 1, td);
    // Today counts only if it was actually fed; otherwise start from yesterday,
    // because a streak stays alive all of today before it lapses.
    if (!active.has(today)) cur.setDate(cur.getDate() - 1);
    for (let guard = 0; guard < 4000; guard++) {
      const k = dayKey(cur.getFullYear(), cur.getMonth(), cur.getDate());
      if (!active.has(k) && !rest.has(k)) break;
      run.add(k);
      cur.setDate(cur.getDate() - 1);
    }
  }

  let doneThisMonth = 0;
  let elapsedThisMonth = 0;

  for (let i = 0; i < 42; i++) {
    const d = i - lead + 1;
    if (d < 1 || d > total) {
      cells.push({ key: null, day: 0, state: 'blank', inRun: false });
      continue;
    }
    const key = dayKey(year, month, d);
    let state: DayState;
    if (active.has(key)) state = 'done';
    else if (rest.has(key)) state = 'rest';
    else if (key === today) state = 'today';
    else if (key > today) state = 'future';
    else if (since && key < since) state = 'blank';
    else state = 'missed';

    if (state === 'done') doneThisMonth++;
    if (key <= today) elapsedThisMonth++;
    cells.push({ key, day: d, state, inRun: run.has(key) });
  }

  return {
    year,
    month,
    label: `${MONTHS[month]} ${year}`,
    cells,
    doneThisMonth,
    elapsedThisMonth,
  };
}

/**
 * The current calendar week, Monday first, from the real history.
 *
 * lib/utils/week.ts does this by counting back `streak` days from the last
 * lesson, which is exact for the run in progress and cannot see a day earlier in
 * the week that fell outside it. Now that the days are recorded, this reads them
 * — so a reader who studied Monday, missed Tuesday and came back Wednesday sees
 * Monday lit, which the old inference drew as dark.
 */
export function buildWeek(input: Omit<CalendarInput, 'year' | 'month'>): CalendarDay[] {
  const { active, rest, today, since } = input;
  const [ty, tm, td] = today.split('-').map(Number);
  const t = new Date(ty, tm - 1, td);
  const monday = new Date(t);
  monday.setDate(t.getDate() - ((t.getDay() + 6) % 7));

  const out: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
    let state: DayState;
    if (active.has(key)) state = 'done';
    else if (rest.has(key)) state = 'rest';
    else if (key === today) state = 'today';
    else if (key > today) state = 'future';
    else if (since && key < since) state = 'blank';
    else state = 'missed';
    out.push({ key, day: d.getDate(), state, inRun: false });
  }
  return out;
}

/** Step a year/month pair by ±1 without tripping over December. */
export function shiftMonth(year: number, month: number, by: number): { year: number; month: number } {
  const t = year * 12 + month + by;
  return { year: Math.floor(t / 12), month: ((t % 12) + 12) % 12 };
}
