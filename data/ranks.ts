import type { GlyphName } from '@/components/shared/Glyph';
import { ORDER, orderOf, degreeOf, type OrderName, type Insignia } from '@/constants/insignia';

export interface RankDef {
  id: number; // 1-based rank number
  name: string;
  xp: number; // XP required to reach this rank
  glyph: GlyphName;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FORTY-RANK LADDER — eight orders of five (constants/insignia.ts).
//
// ── THE OLD LADDER TOPPED OUT ABOVE WHAT THE APP CONTAINS ──────────────────
//
// This was twenty-five ranks ending at 52,000 XP, and that number was never
// reachable. Counted out of the tree rather than remembered: 222 lessons at a
// perfect 60 each is 13,320; every unit mastered is 600 more; all 132 saveable
// quotes 396; all 322 thinkers met 644; and every one of their quizzes aced
// 6,440. Everything, done perfectly, once — 21,400 XP.
//
// So ranks 20 through 25 (22,000 → 52,000) could not be earned by finishing the
// entire app. Archon and everything above it were decoration on a wall nobody
// could reach, and the top four rungs of a reward ladder being unreachable is
// the opposite of what a reward ladder is for.
//
// ── WHAT THIS ONE IS FITTED TO ─────────────────────────────────────────────
//
// Forty ranks, topping out at 16,000. That is inside the 21,400 ceiling with
// room to spare, so a reader who finishes the app and takes some quizzes arrives
// at Grand Philosopher rather than stalling four rungs short of it.
//
// The bands grow linearly, 80 XP to 750, which is roughly two lessons for the
// first promotion and seventeen for the last. That shape is the answer to two
// requests that pull against each other — "I want it to take a long time" and "I
// don't want a user to be on a rank for a long time and never get satisfaction".
// A long climb made of short steps: forty promotions across 222 lessons is one
// about every five or six.
//
// `rankIndex` still advances at most ONE rung per finished lesson (see
// `awardedRank`), so forty ranks also means forty lessons at an absolute
// minimum, whatever the XP says.
//
// ── IDS ARE POSITIONS, AND THE OLD ONES MOVED ──────────────────────────────
//
// `userDataStore.rankIndex` is an INDEX into this array, so extending the ladder
// re-bases every held rank: someone at index 12 of the old twenty-five is at
// index 12 of the new forty, which is a lower place on a longer ladder but the
// same distance from the bottom. Nobody loses a rank they hold and nobody is
// demoted; the ladder simply got longer above them. `rankForXP` then reports a
// higher earned rank than they hold, which `pending` already exists to describe
// and which they collect one lesson at a time.
// ─────────────────────────────────────────────────────────────────────────────
export const RANKS: RankDef[] = [
  // ── CLAY ──────────────────────────────────────────────────────────
  { id: 1, name: 'Novice', xp: 0, glyph: 'candle' },
  { id: 2, name: 'Seeker', xp: 80, glyph: 'book' },
  { id: 3, name: 'Apprentice', xp: 175, glyph: 'quill' },
  { id: 4, name: 'Student', xp: 285, glyph: 'scroll' },
  { id: 5, name: 'Reader', xp: 415, glyph: 'page' },
  // ── IRON ──────────────────────────────────────────────────────────
  { id: 6, name: 'Questioner', xp: 565, glyph: 'question' },
  { id: 7, name: 'Doubter', xp: 725, glyph: 'magnifier' },
  { id: 8, name: 'Inquirer', xp: 900, glyph: 'eye' },
  { id: 9, name: 'Examiner', xp: 1100, glyph: 'xcross' },
  { id: 10, name: 'Sceptic', xp: 1325, glyph: 'chain' },
  // ── BRONZE ────────────────────────────────────────────────────────
  { id: 11, name: 'Reasoner', xp: 1575, glyph: 'scales' },
  { id: 12, name: 'Logician', xp: 1825, glyph: 'grid' },
  { id: 13, name: 'Dialectician', xp: 2075, glyph: 'cycle' },
  { id: 14, name: 'Analyst', xp: 2375, glyph: 'dottarget' },
  { id: 15, name: 'Rhetorician', xp: 2675, glyph: 'wheel' },
  // ── JADE ──────────────────────────────────────────────────────────
  { id: 16, name: 'Naturalist', xp: 3000, glyph: 'tree' },
  { id: 17, name: 'Ethicist', xp: 3350, glyph: 'heart' },
  { id: 18, name: 'Moralist', xp: 3700, glyph: 'willow' },
  { id: 19, name: 'Stoic', xp: 4050, glyph: 'flower' },
  { id: 20, name: 'Peripatetic', xp: 4450, glyph: 'lotus' },
  // ── LAPIS ─────────────────────────────────────────────────────────
  { id: 21, name: 'Metaphysician', xp: 4900, glyph: 'pyramid' },
  { id: 22, name: 'Epistemologist', xp: 5300, glyph: 'target' },
  { id: 23, name: 'Ontologist', xp: 5750, glyph: 'dome' },
  { id: 24, name: 'Idealist', xp: 6200, glyph: 'ripple' },
  { id: 25, name: 'Rationalist', xp: 6700, glyph: 'infinity' },
  // ── CRIMSON ───────────────────────────────────────────────────────
  { id: 26, name: 'Aesthete', xp: 7200, glyph: 'torch' },
  { id: 27, name: 'Polemicist', xp: 7700, glyph: 'lamp' },
  { id: 28, name: 'Iconoclast', xp: 8250, glyph: 'shieldcross' },
  { id: 29, name: 'Heretic', xp: 8800, glyph: 'gate' },
  { id: 30, name: 'Revolutionary', xp: 9350, glyph: 'ship' },
  // ── AMETHYST ──────────────────────────────────────────────────────
  { id: 31, name: 'Sage', xp: 9950, glyph: 'crescent' },
  { id: 32, name: 'Mystic', xp: 10550, glyph: 'hexagram' },
  { id: 33, name: 'Illuminate', xp: 11150, glyph: 'ring' },
  { id: 34, name: 'Oracle', xp: 11800, glyph: 'owl' },
  { id: 35, name: 'Visionary', xp: 12450, glyph: 'gem' },
  // ── AURUM ─────────────────────────────────────────────────────────
  { id: 36, name: 'Archon', xp: 13150, glyph: 'crown' },
  { id: 37, name: 'Luminary', xp: 13800, glyph: 'star' },
  { id: 38, name: 'Immortal', xp: 14550, glyph: 'sunface' },
  { id: 39, name: 'Transcendent', xp: 15250, glyph: 'starcompass' },
  { id: 40, name: 'Grand Philosopher', xp: 16000, glyph: 'bookrays' },
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
 * WHAT A RANK IS STRUCK IN, and how finished that striking is.
 *
 * This used to be `rankBand`, which returned 0/1/2 — bronze, silver, gold, in
 * blocks of eight. Its own comment argued that "three bands of metal give the
 * ladder a shape you can see from the bottom of it", and that was right as far
 * as it went; what it could not give was a shape you can see from ONE RUNG TO
 * THE NEXT. Eight consecutive promotions returned the same number, so eight
 * consecutive pins were the same object with a different mark in it. A reader
 * put it plainly: "it is not very different between rank icons".
 *
 * Two values now, and between them they change on EVERY promotion:
 *
 *   the ORDER   changes every five ranks — the material, and the colour with it
 *   the DEGREE  changes every rank inside an order — how ornamented it is
 *
 * See constants/insignia.ts for both, and for why colour is licensed here at
 * all when §19 keeps the rest of the app in ink.
 */
export function rankOrder(index: number): OrderName {
  return orderOf(clampIndex(index));
}

/** How far through its order a rank is, 0–4. The fifth is the order's capstone. */
export function rankDegree(index: number): number {
  return degreeOf(clampIndex(index));
}

/** The material itself, ready to hand to a renderer. */
export function rankInsignia(index: number): Insignia {
  return ORDER[rankOrder(index)];
}

function clampIndex(index: number): number {
  return Math.max(0, Math.min(RANKS.length - 1, Math.floor(index) || 0));
}
