import type { GlyphName } from '@/components/shared/Glyph';

export interface RankDef {
  id: number; // 1-based rank number
  name: string;
  xp: number; // XP required to reach this rank
  glyph: GlyphName;
}

// The 25-rank ladder, shared by the profile rank chip and the Ranks sheet.
export const RANKS: RankDef[] = [
  { id: 1, name: 'Novice', xp: 0, glyph: 'candle' },
  { id: 2, name: 'Seeker', xp: 100, glyph: 'book' },
  { id: 3, name: 'Apprentice', xp: 250, glyph: 'quill' },
  { id: 4, name: 'Student', xp: 450, glyph: 'scroll' },
  { id: 5, name: 'Scholar', xp: 700, glyph: 'cap' },
  { id: 6, name: 'Thinker', xp: 1000, glyph: 'eye' },
  { id: 7, name: 'Inquirer', xp: 1400, glyph: 'question' },
  { id: 8, name: 'Reasoner', xp: 1900, glyph: 'scales' },
  { id: 9, name: 'Analyst', xp: 2500, glyph: 'magnifier' },
  { id: 10, name: 'Philosopher', xp: 3000, glyph: 'bust' },
  { id: 11, name: 'Dialectician', xp: 4000, glyph: 'cycle' },
  { id: 12, name: 'Logician', xp: 5000, glyph: 'infinity' },
  { id: 13, name: 'Ethicist', xp: 6200, glyph: 'heart' },
  { id: 14, name: 'Metaphysician', xp: 7600, glyph: 'pyramid' },
  { id: 15, name: 'Epistemologist', xp: 9300, glyph: 'target' },
  { id: 16, name: 'Stoic', xp: 11000, glyph: 'column' },
  { id: 17, name: 'Sage', xp: 13000, glyph: 'mountain' },
  { id: 18, name: 'Illuminate', xp: 15500, glyph: 'torch' },
  { id: 19, name: 'Wanderer', xp: 18500, glyph: 'signpost' },
  { id: 20, name: 'Archon', xp: 22000, glyph: 'crown' },
  { id: 21, name: 'Elder', xp: 26000, glyph: 'tree' },
  { id: 22, name: 'Luminary', xp: 31000, glyph: 'sunface' },
  { id: 23, name: 'Archetype', xp: 37000, glyph: 'ring' },
  { id: 24, name: 'Transcendent', xp: 44000, glyph: 'lotus' },
  { id: 25, name: 'Grand Philosopher', xp: 52000, glyph: 'bookrays' },
];

/**
 * The rank a given amount of XP has EARNED. Not necessarily the rank the user
 * holds — see `awardedRank`.
 */
export function rankForXP(xp: number): {
  current: RankDef;
  next: RankDef | null;
  index: number;
} {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].xp) index = i;
  }
  return { current: RANKS[index], next: RANKS[index + 1] ?? null, index };
}

/**
 * THE RANK THE USER ACTUALLY HOLDS, which is not the same thing.
 *
 * XP comes from several places — lessons, saved quotes, thinkers met, quizzes —
 * but a promotion is meant to be earned by WORK, so `rankIndex` (in userDataStore)
 * only ever advances inside `recordLessonComplete`, and by one step at a time. A
 * reader who bookmarks their way past a threshold keeps the XP and keeps the rank
 * they had, and collects the promotion the next time they finish a lesson.
 *
 * `pending` says exactly that has happened, so the UI can promise it rather than
 * leaving a full progress bar looking broken.
 */
export function awardedRank(rankIndex: number, totalXP: number): {
  current: RankDef;
  next: RankDef | null;
  index: number;
  pending: boolean;
} {
  const i = Math.max(0, Math.min(RANKS.length - 1, Math.floor(rankIndex) || 0));
  return {
    current: RANKS[i],
    next: RANKS[i + 1] ?? null,
    index: i,
    pending: rankForXP(totalXP).index > i,
  };
}

/**
 * ONE ANSWER FOR "HOW FAR THROUGH THIS RANK AM I", because three screens each
 * worked it out and got three different numbers.
 *
 * Profile measured `totalXP / next.xp` — total XP against the next threshold
 * counted from ZERO, not progress across the current band. It agrees with the
 * band only at rank 1, where the band happens to start at 0, and over-reports
 * everywhere above: at 8,905 XP a Metaphysician (7,600 → 9,300) read 96% on
 * Profile and 77% in the Ranks sheet, on the same data at the same moment.
 *
 * Profile also printed the raw pair "10,605 / 9,300 XP", which is what a pending
 * promotion looks like when nothing clamps it — more XP than the target. The band
 * figures below are capped, so a full band reads as full instead of as absurd.
 */
export function rankProgress(rankIndex: number, totalXP: number): {
  current: RankDef;
  next: RankDef | null;
  index: number;
  pending: boolean;
  /** 0..1 across the CURRENT band — the only progress figure any screen should draw. */
  pct: number;
  /** XP still needed for the next rank's threshold, floored at 0. */
  toNext: number;
  /** XP earned inside this band, and the band's size — for an "x / y" label. */
  inBand: number;
  bandSize: number;
} {
  const a = awardedRank(rankIndex, totalXP);
  const span = a.next ? a.next.xp - a.current.xp : 0;
  const raw = totalXP - a.current.xp;
  return {
    ...a,
    pct: a.next ? Math.max(0, Math.min(1, raw / span)) : 1,
    toNext: a.next ? Math.max(0, a.next.xp - totalXP) : 0,
    inBand: span > 0 ? Math.max(0, Math.min(span, raw)) : 0,
    bandSize: span,
  };
}

/**
 * What a given rank still costs — in XP *and* in finished lessons.
 *
 * The Ranks sheet used to answer this in XP alone, which contradicted its own
 * header: with a promotion pending it told you "Finish a lesson to reach
 * Epistemologist" at the top and "0 XP to unlock" on Epistemologist's own page.
 * Both were true and together they were nonsense, because a rank costs BOTH —
 * `rankIndex` only ever advances one step per finished lesson (see `awardedRank`),
 * so a rank three tiers up needs three lessons no matter how much XP is banked.
 */
export function rankRequirement(targetIndex: number, rankIndex: number, totalXP: number): {
  xpShort: number;
  lessonsShort: number;
} {
  const i = Math.max(0, Math.min(RANKS.length - 1, Math.floor(rankIndex) || 0));
  return {
    xpShort: Math.max(0, RANKS[targetIndex].xp - totalXP),
    lessonsShort: Math.max(0, targetIndex - i),
  };
}

/**
 * WHICH METAL A RANK IS STRUCK IN — 0 bronze, 1 silver, 2 gold.
 *
 * Twenty-five ranks is a long ladder and every rung of it looked identical: the
 * mark inside the pin changed and nothing else did, so a Grand Philosopher's pin
 * and a Seeker's were the same object with a different doodle in it. Three bands
 * of metal give the ladder a shape you can see from the bottom of it — and, more
 * to the point, give the twenty-four promotions in between something to be.
 *
 * The thresholds are the ladder's own thirds (ranks 1–8, 9–16, 17–25) rather
 * than XP figures, so this stays correct if the XP curve is ever retuned. There
 * is deliberately no fourth band: `TIER_METAL` has three entries and badges use
 * the same three, so a rank band and a badge tier mean the same thing wherever
 * they appear together.
 */
export function rankBand(index: number): number {
  const i = Math.max(0, Math.min(RANKS.length - 1, Math.floor(index) || 0));
  return i < 8 ? 0 : i < 16 ? 1 : 2;
}
