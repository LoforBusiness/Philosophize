import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { RANKS } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { hasQuiz } from '@/data/philosopherQuizzes';

// COUNTED ONCE AT MODULE LOAD, not per render. These are the biggest arrays in
// the app, and a certificate that recounted them on every frame would be doing
// the most expensive thing on the screen for a figure that cannot change.
const PHILOSOPHER_COUNT = ALL_PHILOSOPHERS.length;
const QUOTATION_COUNT = ALL_PHILOSOPHERS.reduce((n, p) => n + (p.quotes?.length ?? 0), 0);
const QUIZ_COUNT = ALL_PHILOSOPHERS.filter((p) => hasQuiz(p.id)).length;
const RANK_COUNT = RANKS.length;
const BADGE_COUNT = BADGES.length;

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE PASS IS ACTUALLY WORTH, DERIVED RATHER THAN TYPED.
//
// A HARD PAYWALL SINCE 2026-09-25. The owner's research found it converts better
// than freemium, so the model is now: EVERY LESSON NEEDS THE SCHOLAR'S PASS OR ITS
// THREE-DAY TRIAL, AND EVERYTHING ELSE IN THE APP IS FREE. The five rows this file
// used to hold — a free lesson a day, the advertisement after it, replay, units in
// order, and rest days — were all ways of RATIONING lessons, and there is no free
// lesson left to ration.
//
// So the table is now what the Pass opens and nothing else, and every row is a
// fact `scripts/check-pass.mjs` re-derives from the code that enforces it:
// `lessonAccess` for the lessons and the units, the review route's gate for the
// reviews, and the narration manifest for the voice. A claim that stops being
// true fails the build instead of quietly becoming a lie. NO REACT IN THIS FILE,
// for exactly that reason — the checker imports it in plain Node.
//
// The OTHER half, what a free reader keeps, is `freeThings()` below, and it is
// the half that has to be loud now: a hard paywall that does not say what is
// still free reads as an app that has locked everything.
// ─────────────────────────────────────────────────────────────────────────────

export interface PassLine {
  /** Stable id — `check-pass` names its assertions by these. */
  id: 'lessons' | 'narrated' | 'reviews' | 'units';
  /** What the row is about. Short: it sits beside two narrow columns. */
  label: string;
  /** What a free account gets. Always `null` now: not at all. */
  free: string | null;
  /** What the Pass gets, said as a phrase for the certificate. */
  pass: string;
}

/** Every lesson, unit and branch in the app, counted rather than remembered. */
export function libraryShape(): { branches: number; units: number; lessons: number } {
  let units = 0;
  let lessons = 0;
  for (const b of ALL_BRANCHES) {
    units += b.paths.length;
    for (const u of b.paths) lessons += u.lessons.length;
  }
  return { branches: ALL_BRANCHES.length, units, lessons };
}

/** Total lessons in the app, counted out of the tree rather than remembered. */
export function libraryTotal(): number {
  return libraryShape().lessons;
}

const SHAPE = libraryShape();

/**
 * What the Pass opens, in the order a reader meets it. Every value that is a
 * number is counted out of the tree, so adding lessons moves the paywall in the
 * same commit and cannot be forgotten.
 */
export const PASS_LINES: readonly PassLine[] = [
  {
    id: 'lessons',
    label: `All ${SHAPE.lessons} lessons`,
    free: null,
    pass: `All ${SHAPE.lessons}, across ${SHAPE.branches} branches`,
  },
  {
    id: 'narrated',
    label: 'Narrated and animated',
    free: null,
    pass: 'Every lesson read aloud, on its own stage',
  },
  {
    id: 'reviews',
    label: 'Unit reviews',
    free: null,
    pass: `All ${SHAPE.units}, each with its stamp`,
  },
  {
    id: 'units',
    label: 'Start any unit',
    free: null,
    pass: 'Any branch, any unit, any time',
  },
] as const;

/** The Pass side of a row, as the certificate prints it. */
export function longPass(line: PassLine): string {
  return line.pass;
}

// ── WHAT EVERY READER HAS, FREE ──────────────────────────────────────────────

/**
 * THE FREE HALF, and on a hard paywall it is the half that sells the trial as
 * much as the Pass half does: it is proof the app is not a locked door.
 *
 * Every figure is COUNTED OUT OF THE TREE. The quotations are the THINKERS'
 * quotations, because those are the ones a free reader can save — the lesson
 * quote cards are behind the Pass with the lessons.
 */
export interface FreeThing {
  /** Stable id — `check-pass` names its assertions by these. */
  id: 'thinkers' | 'quotations' | 'quizzes' | 'ranks' | 'badges' | 'streak';
  /** The big figure on the tile. Counted, never typed. */
  figure: string;
  /** What the figure counts. One word where it can be: a tile is 85pt at 320dp. */
  noun: string;
}

export function freeThings(): readonly FreeThing[] {
  return [
    { id: 'thinkers', figure: `${PHILOSOPHER_COUNT}`, noun: 'thinkers' },
    { id: 'quotations', figure: QUOTATION_COUNT.toLocaleString('en-US'), noun: 'quotes' },
    { id: 'quizzes', figure: `${QUIZ_COUNT}`, noun: 'quizzes' },
    { id: 'ranks', figure: `${RANK_COUNT}`, noun: 'ranks' },
    { id: 'badges', figure: `${BADGE_COUNT}`, noun: 'badges' },
    { id: 'streak', figure: 'XP', noun: '& streaks' },
  ];
}
