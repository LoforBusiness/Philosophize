import { ALL_BRANCHES } from '@/data';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';
import {
  REST_CAP_FREE, REST_CAP_PRO, REST_EARN_EVERY_FREE, REST_EARN_EVERY_PRO,
} from '@/constants/streak';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE PASS IS ACTUALLY WORTH, DERIVED RATHER THAN TYPED.
//
// The paywall used to carry three hand-written benefit lines and a comment
// explaining why the list was kept short: "a paywall that promises one before it
// exists is the fastest way to make every other line on it untrustworthy." That
// instinct was right and the mechanism was wrong — a hand-written line is
// untrustworthy in BOTH directions, and this one had drifted the honest way.
// Two of the five things the Pass really buys were not mentioned at all:
//
//   · REPLAY. `lessonAccess(li < unitDone)` returns `open: isPro`. A free reader
//     cannot re-open a lesson they have finished. That is the single most asked
//     for thing in a learning app and the paywall did not say it.
//   · JUMPING AHEAD. `startable = isPro || allPrevComplete`. The Pass lets you
//     begin any unit in any branch on day one.
//
// So the table below is the source, `scripts/check-pass.mjs` re-derives every
// row from the function that actually enforces it, and a claim that stops being
// true fails the build instead of quietly becoming a lie. NO REACT IN THIS FILE
// for exactly that reason — the checker imports it in plain Node.
//
// A LINE EARNS ITS PLACE BY BEING ENFORCED SOMEWHERE ELSE. That is the same rule
// §22 applies to a settings key, and for the same reason: this is the one screen
// in the app where somebody is about to be charged.
// ─────────────────────────────────────────────────────────────────────────────

export interface PassLine {
  /** Stable id — `check-pass` names its assertions by these. */
  id: 'lessons' | 'ads' | 'replay' | 'units' | 'rest';
  /** What the row is about. Set SHORT — it sits in a three-column rule. */
  label: string;
  /** What a free account gets. `null` draws the em-rule: not at all. */
  free: string | null;
  /** What the Pass gets. */
  pass: string;
}

/**
 * The five differences, in the order they matter to someone who has just been
 * stopped. Lessons first because that is the wall they walked into.
 *
 * Every value is interpolated from the constant the gate reads, so retuning
 * `FREE_DAILY_LESSON_LIMIT` or a rest-day cap moves the paywall in the same
 * commit and cannot be forgotten.
 */
export const PASS_LINES: readonly PassLine[] = [
  {
    id: 'lessons',
    label: 'Lessons a day',
    free: `${FREE_DAILY_LESSON_LIMIT}`,
    pass: 'As many as you like',
  },
  {
    id: 'ads',
    label: 'Advertisements',
    free: 'After every lesson',
    pass: 'None, ever',
  },
  {
    id: 'replay',
    label: 'Replay what you finished',
    free: null,
    pass: 'Any lesson, any time',
  },
  {
    id: 'units',
    label: 'Start a new unit',
    free: 'In order only',
    pass: 'Any unit, any time',
  },
  {
    id: 'rest',
    label: 'Rest days for your streak',
    free: `${REST_CAP_FREE} held · 1 per ${REST_EARN_EVERY_FREE}`,
    pass: `${REST_CAP_PRO} held · 1 per ${REST_EARN_EVERY_PRO}`,
  },
] as const;

// ── the library, and how long it takes at one a day ──────────────────────────

export interface Library {
  /** Every lesson in the app. */
  total: number;
  /** How many this reader has finished. */
  done: number;
  /** Still to open. */
  left: number;
  /** 0…1 of the whole library. */
  pct: number;
}

/** Total lessons in the app, counted out of the tree rather than remembered. */
export function libraryTotal(): number {
  let n = 0;
  for (const b of ALL_BRANCHES) for (const u of b.paths) n += u.lessons.length;
  return n;
}

/**
 * Where the reader stands against the whole library.
 *
 * `lessonsByBranch` is the derived mirror (§4) and is what every other screen
 * reads for this, so it is what this reads too — a second way of counting the
 * same thing is how two screens come to disagree.
 */
export function libraryStanding(lessonsByBranch: Record<string, number>): Library {
  const total = libraryTotal();
  let done = 0;
  for (const b of ALL_BRANCHES) {
    const cap = b.paths.reduce((n, u) => n + u.lessons.length, 0);
    done += Math.max(0, Math.min(cap, lessonsByBranch[b.slug] ?? 0));
  }
  const left = Math.max(0, total - done);
  return { total, done, left, pct: total > 0 ? done / total : 0 };
}

/**
 * THE WALL, IN DAYS.
 *
 * At the free allowance, finishing what is left takes `left / perDay` days, and
 * that number — not a feature list — is the honest argument for the Pass. It is
 * also the number most likely to be quietly wrong, because it is the one nobody
 * would notice: 208 and 219 look equally plausible on a screen.
 *
 * Ceil, not round. 208 lessons at one a day is 208 days, and 209 lessons is 209
 * — a reader finishing the last one on the 209th morning has waited 209 times.
 * Floored at 0 so a completed library cannot promise a negative wait.
 */
export function daysAtFreePace(left: number, perDay = FREE_DAILY_LESSON_LIMIT): number {
  if (perDay <= 0) return 0;
  return Math.max(0, Math.ceil(left / perDay));
}

/**
 * "208 days" · "1 year, 2 months" — whichever a person would actually say.
 *
 * Past a year the day count stops meaning anything: nobody hears "437 days" as a
 * length of time, they hear it as a big number. The switch is at 365 because
 * that is where the reading changes, not because of any rounding convenience.
 */
export function paceLabel(days: number): string {
  if (days <= 0) return 'nothing left to wait for';
  if (days === 1) return '1 more day';
  if (days < 365) return `${days} more days`;
  const years = Math.floor(days / 365);
  const months = Math.round((days % 365) / 30.4);
  if (months === 0) return years === 1 ? 'over a year' : `over ${years} years`;
  const y = years === 1 ? '1 year' : `${years} years`;
  const m = months === 1 ? '1 month' : `${months} months`;
  return `${y}, ${m}`;
}

// ── the clock to the next free lesson ────────────────────────────────────────

/**
 * Milliseconds until the daily allowance renews.
 *
 * The allowance is keyed on a LOCAL calendar date (`dailyLessonDate`, written by
 * `bumpDailyLessons` as a local `YYYY-MM-DD`), so the thing being counted down
 * to is local midnight — not UTC, and not 24 hours from now. Building the next
 * midnight with the Date constructor rather than adding 86_400_000 is what makes
 * it survive the two days a year that are not 24 hours long.
 */
export function msToRenewal(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

/**
 * "6h 12m" · "48m" · "under a minute".
 *
 * Minutes are dropped once there are hours in it and shown alone under one hour,
 * which is how a person reads a wait. Seconds never appear: this ticks once a
 * minute, and a seconds field that updates every sixty seconds is worse than no
 * seconds field.
 */
export function renewalLabel(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'under a minute';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** "1 lesson a day" / "3 lessons a day" — the free allowance, said in words. */
export function allowanceLabel(): string {
  return `${FREE_DAILY_LESSON_LIMIT} ${lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day`;
}
