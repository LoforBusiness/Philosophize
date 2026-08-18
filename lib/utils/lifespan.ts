// ─────────────────────────────────────────────────────────────────────────────
// WHEN A THINKER LIVED, AS NUMBERS.
//
// `Philosopher.lifespan` is a human string — "470–399 BCE", "c. 4 BCE–65 CE",
// "1957–present", "c. 6th century BCE" — written for a reader, not a parser.
// Twenty-six distinct shapes across the 322, counted out of the data rather than
// guessed at. Anything that wants to place a thinker on a timeline, work out how
// old they were, or find who else was alive at the time has to get real years
// out of that string first.
//
// ZERO IMPORTS, for the same reason rig.ts and worldPath.ts have none: the whole
// thing can then be run over all 322 records in plain Node, and
// `npm run check:thinkers` does exactly that. A parser that is only exercised by
// scrolling a list on a phone is a parser nobody checks.
//
// THE ONE GUARANTEE: `at` is a real number for EVERY thinker, including the ones
// whose dates are a century or a death year. A timeline with holes in it is worse
// than no timeline, because the holes look like bugs rather than like uncertainty.
// `from`, `to` and `age` are honestly null when the string does not support them.
// ─────────────────────────────────────────────────────────────────────────────

export interface Lifespan {
  /** Birth year. Negative is BCE. Null when the string only gives a death or a century. */
  from: number | null;
  /** Death year, or the current year for someone still living. Null if unknown. */
  to: number | null;
  /** Years lived. Null unless both ends are real years — never inferred from a century. */
  age: number | null;
  /** "1957–present", or an open "1937–". */
  living: boolean;
  /** The source said "c.", "after", or gave only a century. Show a "c." in the UI. */
  approx: boolean;
  /**
   * One year to place them at on a timeline. ALWAYS a number.
   *
   * Midpoint of the life where there is one, the death year where that is all we
   * have, the middle of the century where it is a century. This is the only field
   * a caller may rely on unconditionally.
   */
  at: number;
}

/** The whole span of thinkers in the app, from `check:thinkers`. Used to scale timelines. */
export const FIRST_YEAR = -624;
export const LAST_YEAR = 2026;

/**
 * A century word to its midpoint. "6th century BCE" is 600–501 BCE, whose middle
 * is −550; the CE side of the same arithmetic puts the 4th century at 350.
 *
 * Midpoint rather than start, because a century-dated thinker is being placed on
 * a 2,650-year strip where a fifty-year error is a pixel, and "somewhere in this
 * century" is exactly what the midpoint means.
 */
function centuryMid(n: number, bce: boolean): number {
  return bce ? -(n * 100 - 50) : n * 100 - 50;
}

/**
 * Parse a `Philosopher.lifespan` string.
 *
 * Never throws and never returns null: an unrecognised string still yields a
 * Lifespan, with `at` at year 0 and everything else null. `check:thinkers` is what
 * stops that fallback ever being reached in practice — it fails the build if any
 * of the 322 lands on it.
 */
export function parseLifespan(raw: string): Lifespan {
  const dead: Lifespan = { from: null, to: null, age: null, living: false, approx: true, at: 0 };
  if (!raw) return dead;

  // Normalise the punctuation the strings disagree on, and nothing else. En and
  // em dashes both mean "to"; so does a hyphen with spaces around it.
  const s = raw
    .replace(/[‒-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const approx = /\bc\.|\bafter\b|\bbefore\b|century/i.test(s);
  const living = /present/i.test(s) || /-\s*$/.test(s);

  // ── century forms, which give a position but never an age ──────────────────
  // "c. 6th century BCE", "c. 4th-5th century CE". The range form takes the two
  // centuries' outer midpoints and sits between them.
  const cent = s.match(/(\d+)(?:st|nd|rd|th)(?:\s*-\s*(\d+)(?:st|nd|rd|th))?\s*century\s*(BCE|BC|CE|AD)?/i);
  if (cent) {
    const bce = /^(BCE|BC)$/i.test(cent[3] || '');
    const a = centuryMid(Number(cent[1]), bce);
    const b = cent[2] ? centuryMid(Number(cent[2]), bce) : a;
    return { from: null, to: null, age: null, living: false, approx: true, at: Math.round((a + b) / 2) };
  }

  // ── "died 866 CE" — a death and nothing else ───────────────────────────────
  const died = s.match(/^died\s+(\d+)\s*(BCE|BC|CE|AD)?$/i);
  if (died) {
    const y = /^(BCE|BC)$/i.test(died[2] || '') ? -Number(died[1]) : Number(died[1]);
    return { from: null, to: y, age: null, living: false, approx: true, at: y };
  }

  // ── the ordinary two-ended forms ───────────────────────────────────────────
  //
  // The era marker is the subtle part. A trailing "BCE" governs BOTH years —
  // "470-399 BCE" is two BCE years — but a marker attached to the FIRST year
  // means the string crosses the boundary and each end carries its own era:
  // "c. 4 BCE-65 CE". Reading only the trailing marker turns that life into a
  // 61-year span ending before it began.
  const m = s.match(
    /(\d+)\s*(BCE|BC|CE|AD)?\s*-\s*(?:c\.\s*)?(?:after\s+|before\s+)?(\d+|present)?\s*(BCE|BC|CE|AD)?/i,
  );
  if (!m) {
    // A lone year with no range at all.
    const only = s.match(/(\d+)\s*(BCE|BC|CE|AD)?/i);
    if (!only) return dead;
    const y = /^(BCE|BC)$/i.test(only[2] || '') ? -Number(only[1]) : Number(only[1]);
    return { from: y, to: null, age: null, living: false, approx, at: y };
  }

  const headEra = m[2];
  const tailEra = m[4];
  const bceTail = /^(BCE|BC)$/i.test(tailEra || '');
  // No marker on the head means it shares the tail's era — the common case.
  const bceHead = headEra ? /^(BCE|BC)$/i.test(headEra) : bceTail;

  const from = bceHead ? -Number(m[1]) : Number(m[1]);

  let to: number | null;
  if (!m[3] || /present/i.test(m[3])) {
    to = living ? new Date().getFullYear() : null;
  } else {
    to = bceTail ? -Number(m[3]) : Number(m[3]);
  }

  // An age only where both ends are real. A living thinker's "age" is their age
  // now, which is true and useful; a century midpoint's is not, and stays null.
  const age = to !== null && to >= from ? to - from : null;
  const at = to !== null ? Math.round((from + to) / 2) : from;
  return { from, to, age, living, approx, at };
}

/**
 * Where a thinker sits across the whole span of the app's philosophy, 0→1.
 *
 * Clamped, so a record added outside the current bounds lands at an edge rather
 * than off the end of the strip that draws it.
 */
export function timelinePos(at: number): number {
  const t = (at - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** "470 BCE – 399 BCE" as the compact "470–399 BCE" a reader expects. */
export function yearLabel(y: number): string {
  return y < 0 ? `${-y} BCE` : `${y}`;
}

/**
 * Do two lives overlap? The basis of the "who else was alive" stat.
 *
 * Both ends must be known: a thinker dated only to a century has no span to
 * overlap with, and guessing one would invent contemporaries.
 */
export function overlaps(a: Lifespan, b: Lifespan): boolean {
  if (a.from === null || a.to === null || b.from === null || b.to === null) return false;
  return a.from <= b.to && b.from <= a.to;
}
