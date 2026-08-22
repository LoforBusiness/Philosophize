import type { GlyphName } from '@/components/shared/Glyph';
import { ORDER, orderOf, degreeOf, type OrderName, type Insignia } from '@/constants/insignia';

export interface RankDef {
  id: number; // 1-based rank number
  name: string;
  xp: number; // XP required to reach this rank
  glyph: GlyphName;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FORTY-EIGHT-RANK LADDER — eight orders of six (constants/insignia.ts),
// topping out at exactly 50,000 XP.
//
// ── WHERE 50,000 CAME FROM, AND WHY IT IS NOT WHERE IT WAS BEFORE ──────────
//
// A reader: "I want the total of 50,000 XP to be the top rank, but I want to
// have plenty of ranks in between so the user can still get the gratification of
// ranking up."
//
// This file previously topped out at 16,000 and its own comment argued the case
// against 50,000 — the app contains 21,400 XP if you do everything in it
// perfectly ONCE (222 lessons at a perfect 60, every unit mastered, all 132
// saveable quotes, all 322 thinkers met, every quiz aced), so a 52,000 ceiling
// left the top rungs on a wall nobody could reach.
//
// THAT ARGUMENT WAS WRONG, AND THE THING THAT MAKES IT WRONG IS ONE LINE IN
// `recordLessonComplete`: "XP is still awarded on every completion". The unit
// pointer uses max() so re-reading a lesson cannot skip anyone forward, but the
// XP is paid every time. 21,400 is not a ceiling, it is a FIRST PASS. So 50,000
// is roughly the app read through once and then some — which is exactly what the
// top of a ladder called Grand Philosopher ought to cost.
//
// The worked figures, because "roughly" is not good enough for a top rank:
//
//   rank  2      60 XP  — one perfect lesson. The first promotion is immediate.
//   rank  6     740     — the Clay order takes about a fortnight of one a day
//   rank 24  12,400     — halfway up, and about halfway through the content
//   rank 31  20,800     — where a perfect single pass through the whole app lands
//   rank 48  50,000     — the top
//
// So finishing everything the app contains, perfectly, leaves a reader 31 rungs
// up a 48-rung ladder: a real achievement with a visible seventeen rungs above
// it. That is the shape a ladder is supposed to have. It is also why the ORDERS
// were re-cut at six ranks each rather than the ladder being stretched over the
// old forty — see ORDER_SIZE in constants/insignia.ts for the measurement that
// ruled out simply adding two more colours.
//
// ── THE BANDS GROW, AND THAT IS THE OTHER HALF OF THE REQUEST ──────────────
//
// 60 XP for the first promotion, 2,100 for the last, rising smoothly — about one
// lesson, then about thirty-eight. Two requests pull against each other here,
// "I want it to take a really long time" and "I don't want a user to be on a
// rank for a long time and never get satisfaction", and a long climb made of
// steps that start tiny is the only shape that answers both.
//
// `rankIndex` still advances at most ONE rung per finished lesson (see
// `awardedRank`), so forty-eight ranks also means forty-eight lessons at an
// absolute minimum, whatever the XP says.
//
// ── IDS ARE POSITIONS, AND THE OLD ONES MOVED — AGAIN ──────────────────────
//
// `userDataStore.rankIndex` is an INDEX into this array, so lengthening the
// ladder re-bases every held rank: someone at index 12 of the old forty is at
// index 12 of the new forty-eight. Nobody is demoted and nobody loses a rung.
// What DOES change is that index 12's threshold moved from 2,075 XP to 3,600 —
// so an existing reader can now hold a rank their XP has not reached.
//
// That is a state this file has never had to describe before, and it is why
// `rankProgress` measures the band from `min(current.xp, totalXP)` rather than
// from the threshold. Measuring from the threshold made the two halves of the
// same sentence disagree: "0 / 600 XP" beside "2,100 XP to Logician".
// ─────────────────────────────────────────────────────────────────────────────
export const RANKS: RankDef[] = [
  // ── CLAY · the disc ──────────────────────────────────────────────────
  { id: 1, name: 'Novice', xp: 0, glyph: 'candle' },
  { id: 2, name: 'Seeker', xp: 60, glyph: 'book' },
  { id: 3, name: 'Apprentice', xp: 160, glyph: 'quill' },
  { id: 4, name: 'Student', xp: 310, glyph: 'scroll' },
  { id: 5, name: 'Reader', xp: 500, glyph: 'page' },
  { id: 6, name: 'Scribe', xp: 740, glyph: 'feather' },
  // ── IRON · the cut plate ─────────────────────────────────────────────
  { id: 7, name: 'Questioner', xp: 1000, glyph: 'question' },
  { id: 8, name: 'Doubter', xp: 1350, glyph: 'magnifier' },
  { id: 9, name: 'Inquirer', xp: 1700, glyph: 'eye' },
  { id: 10, name: 'Examiner', xp: 2100, glyph: 'xcross' },
  { id: 11, name: 'Sceptic', xp: 2550, glyph: 'chain' },
  { id: 12, name: 'Cynic', xp: 3050, glyph: 'mask' },
  // ── BRONZE · the hexagon ─────────────────────────────────────────────
  { id: 13, name: 'Reasoner', xp: 3600, glyph: 'scales' },
  { id: 14, name: 'Logician', xp: 4200, glyph: 'grid' },
  { id: 15, name: 'Dialectician', xp: 4800, glyph: 'cycle' },
  { id: 16, name: 'Analyst', xp: 5500, glyph: 'dottarget' },
  { id: 17, name: 'Rhetorician', xp: 6200, glyph: 'wheel' },
  { id: 18, name: 'Disputant', xp: 6950, glyph: 'anvil' },
  // ── JADE · the notched gem ───────────────────────────────────────────
  { id: 19, name: 'Naturalist', xp: 7750, glyph: 'tree' },
  { id: 20, name: 'Ethicist', xp: 8600, glyph: 'heart' },
  { id: 21, name: 'Moralist', xp: 9500, glyph: 'willow' },
  { id: 22, name: 'Stoic', xp: 10400, glyph: 'flower' },
  { id: 23, name: 'Peripatetic', xp: 11400, glyph: 'lotus' },
  { id: 24, name: 'Cosmopolite', xp: 12400, glyph: 'bridge' },
  // ── LAPIS · the shield ───────────────────────────────────────────────
  { id: 25, name: 'Metaphysician', xp: 13500, glyph: 'pyramid' },
  { id: 26, name: 'Epistemologist', xp: 14600, glyph: 'target' },
  { id: 27, name: 'Ontologist', xp: 15700, glyph: 'dome' },
  { id: 28, name: 'Idealist', xp: 16900, glyph: 'ripple' },
  { id: 29, name: 'Rationalist', xp: 18200, glyph: 'infinity' },
  { id: 30, name: 'Empiricist', xp: 19500, glyph: 'prism' },
  // ── CRIMSON · the crested shield ─────────────────────────────────────
  { id: 31, name: 'Aesthete', xp: 20800, glyph: 'torch' },
  { id: 32, name: 'Polemicist', xp: 22200, glyph: 'lamp' },
  { id: 33, name: 'Iconoclast', xp: 23600, glyph: 'shieldcross' },
  { id: 34, name: 'Heretic', xp: 25000, glyph: 'gate' },
  { id: 35, name: 'Revolutionary', xp: 26500, glyph: 'ship' },
  { id: 36, name: 'Firebrand', xp: 28100, glyph: 'beacon' },
  // ── AMETHYST · the winged ────────────────────────────────────────────
  { id: 37, name: 'Sage', xp: 29700, glyph: 'crescent' },
  { id: 38, name: 'Mystic', xp: 31300, glyph: 'hexagram' },
  { id: 39, name: 'Illuminate', xp: 33000, glyph: 'ring' },
  { id: 40, name: 'Oracle', xp: 34700, glyph: 'owl' },
  { id: 41, name: 'Visionary', xp: 36400, glyph: 'gem' },
  { id: 42, name: 'Hierophant', xp: 38200, glyph: 'key' },
  // ── AURUM · the crowned ──────────────────────────────────────────────
  { id: 43, name: 'Archon', xp: 40100, glyph: 'crown' },
  { id: 44, name: 'Luminary', xp: 42000, glyph: 'star' },
  { id: 45, name: 'Magus', xp: 43900, glyph: 'orbit' },
  { id: 46, name: 'Immortal', xp: 45900, glyph: 'sunface' },
  { id: 47, name: 'Transcendent', xp: 47900, glyph: 'starcompass' },
  { id: 48, name: 'Grand Philosopher', xp: 50000, glyph: 'bookrays' },
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
  // THE BAND STARTS WHEREVER THEY ACTUALLY WERE. Normally that is the current
  // rank's threshold; for a reader holding a rank above their XP — which the
  // ladder's own lengthening can produce, see the header — it is their XP, so
  // the band and the "x XP to go" figure below describe the same distance.
  const base = a.next ? Math.min(a.current.xp, totalXP) : a.current.xp;
  const span = a.next ? a.next.xp - base : 0;
  const raw = totalXP - base;
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
