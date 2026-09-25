import { PASS_LINES, freeThings, type PassLine, type FreeThing } from '@/lib/utils/passValue';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB'S COMPARISON, SAID SHORT.
//
// `PASS_LINES` holds what the Pass opens as phrases written for a certificate.
// The chart is two narrow columns, so each row is re-said as a CELL: a tick, a
// cross, or a value short enough to sit in one. Since the hard paywall
// (2026-09-25) every row is a cross on Free and a tick on the Pass — the Pass
// opens the lessons and everything about them, and nothing else differs — and
// what a free reader keeps is said once, underneath, as `freeTiles()`.
//
// NOTHING HERE IS A SECOND SOURCE. Every row is made FROM a `PASS_LINES` entry
// and every tile from `freeThings()`, and `check:pass` re-derives both. NO REACT
// IN THIS FILE, for the same reason passValue has none.
// ─────────────────────────────────────────────────────────────────────────────

/** One side of one row. */
export type Cell =
  /** The tier has this in full. Drawn as a struck tick. */
  | { kind: 'yes' }
  /** The tier does not have it at all. Drawn as a cross: the Pass opens it. */
  | { kind: 'no' }
  /** A bounded amount, said in a few characters. */
  | { kind: 'value'; text: string };

export interface CompareRow {
  /** The `PASS_LINES` id this row was made from. */
  id: PassLine['id'];
  /** Phrased so that a TICK means something good. */
  label: string;
  free: Cell;
  pass: Cell;
}

const YES: Cell = { kind: 'yes' };
const NO: Cell = { kind: 'no' };
const value = (text: string): Cell => ({ kind: 'value', text });

function rowFor(line: PassLine): CompareRow {
  return {
    id: line.id,
    label: line.label,
    free: line.free === null ? NO : value(line.free),
    pass: YES,
  };
}

/** What the Pass opens, in `PASS_LINES` order, one row each. */
export function compareRows(): readonly CompareRow[] {
  return PASS_LINES.map(rowFor);
}

// ── WHAT EVERY READER KEEPS, FREE ────────────────────────────────────────────

export type FreeTile = FreeThing;

/**
 * The things every reader has without the Pass, as tiles: a figure and a noun.
 * Printed ONCE, under the chart, under the heading FREE FOR EVERYONE.
 */
export function freeTiles(): readonly FreeTile[] {
  return freeThings();
}
