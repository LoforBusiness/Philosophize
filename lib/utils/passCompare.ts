import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { RANKS } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { FREE_DAILY_LESSON_LIMIT } from '@/constants/subscription';
import { REST_CAP_FREE, REST_CAP_PRO } from '@/constants/streak';
import {
  PASS_LINES, libraryShape, saveableQuotes, type PassLine, type IncludedLine,
} from '@/lib/utils/passValue';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB'S COMPARISON, SAID SHORT.
//
// `PASS_LINES` holds the five differences as sentences written for a ruled
// certificate: "As many as you like", "After every lesson", "2 held · 1 per 10".
// The tab is a two-column chart now, and a column is about sixty points wide, so
// each row is re-said as a CELL: a tick, a lock, or a value short enough to sit
// in one. The reader was clear about why: the certificates were "too confusing
// because a lot of information", and the chart is how Brilliant, Duolingo and
// every other learning app answer "what do I get".
//
// NOTHING HERE IS A SECOND SOURCE. Every row is made FROM a `PASS_LINES` entry,
// every figure is interpolated from the constant its gate reads, and
// `check:pass` re-derives both, so the short form cannot drift away from the
// long one or from the code that enforces it. NO REACT IN THIS FILE, for the
// same reason passValue has none: the checker imports it in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** One side of one row. */
export type Cell =
  /** The tier has this in full. Drawn as a struck tick. */
  | { kind: 'yes' }
  /** The tier does not have it at all. Drawn as a lock: the Pass opens it. */
  | { kind: 'no' }
  /** A bounded amount, said in a few characters. */
  | { kind: 'value'; text: string };

export interface CompareRow {
  /** The `PASS_LINES` id this row was made from. */
  id: PassLine['id'];
  /**
   * Phrased so that a TICK means something good. "Advertisements" with a tick
   * beside it reads as "has advertisements", which is backwards on the Pass side,
   * so that row is "No ads" here.
   */
  label: string;
  free: Cell;
  pass: Cell;
}

const YES: Cell = { kind: 'yes' };
const NO: Cell = { kind: 'no' };
const value = (text: string): Cell => ({ kind: 'value', text });

function rowFor(line: PassLine): CompareRow {
  switch (line.id) {
    case 'lessons':
      return {
        id: line.id,
        label: 'Lessons a day',
        free: value(`${FREE_DAILY_LESSON_LIMIT}`),
        pass: value('Unlimited'),
      };
    case 'ads':
      // A free reader sees an advertisement after every lesson, so "No ads" is
      // exactly the thing the free column does not have.
      return { id: line.id, label: 'No ads', free: NO, pass: YES };
    case 'replay':
      return {
        id: line.id,
        label: 'Replay lessons',
        free: line.free === null ? NO : value(line.free),
        pass: YES,
      };
    case 'units':
      // NOT a lock. A free reader CAN start units, one after another, and a lock
      // beside "Start any unit" would say they cannot start one at all.
      return { id: line.id, label: 'Start any unit', free: value('In order'), pass: YES };
    case 'rest':
      return {
        id: line.id,
        label: 'Streak rest days',
        free: value(`${REST_CAP_FREE} held`),
        pass: value(`${REST_CAP_PRO} held`),
      };
  }
}

/** The five differences, in `PASS_LINES` order, one row each. */
export function compareRows(): readonly CompareRow[] {
  return PASS_LINES.map(rowFor);
}

// ── WHAT EVERY PLAN INCLUDES ─────────────────────────────────────────────────

export interface IncludedTile {
  /** The `includedLines()` id this tile stands for. */
  id: IncludedLine['id'];
  /** The big figure on the tile. Counted, never typed. */
  figure: string;
  /** What the figure counts, in a couple of words. */
  noun: string;
}

/**
 * The six things both tiers get, as tiles: a figure and a noun.
 *
 * The same six ids as `includedLines()` and the same counts, taken out of the
 * tree. The sentence form is still what the trial offer and the conferral print;
 * a tile has room for "246 lessons" and nothing else, which is the point.
 *
 * ONE WORD A NOUN. At 320dp a tile is 85pt wide, and "quotes to keep" wrapped
 * to two lines there, which made its tile taller than the two beside it.
 */
export function includedTiles(): readonly IncludedTile[] {
  const lib = libraryShape();
  return [
    { id: 'library', figure: `${lib.lessons}`, noun: 'lessons' },
    { id: 'thinkers', figure: `${ALL_PHILOSOPHERS.length}`, noun: 'thinkers' },
    { id: 'quotes', figure: `${saveableQuotes()}`, noun: 'quotes' },
    { id: 'ranks', figure: `${RANKS.length}`, noun: 'ranks' },
    { id: 'badges', figure: `${BADGES.length}`, noun: 'badges' },
    { id: 'streak', figure: 'XP', noun: '& streaks' },
  ];
}
