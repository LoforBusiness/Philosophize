import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './biz7Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { PLATE_FACE, lipOf } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-7, "Business Recap: After Closing Time" — AN OLD GENERAL STORE ON A
// WET EVENING, THEN A COBBLED MARKET STREET THE NEXT MORNING. The recap of the road's six
// lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// accountant (the top hat) does the books behind the counter after closing; the owner
// (the plain one) comes in out of the rain sure he is a business genius.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// biz7.mjs) laid in ONE WORLD that is 800 wide: the store at x 0–400, the street at
// x 400–800. The scene's own camera is the world's translation, `cam`: 0 in the store,
// −400 on the street; the night passes under a fade at the start of b13. Figures are
// posed in SCREEN space (world x + cam).
//
//   STORE, far → near: the plank ceiling and beam (214–242); the door 12–54 × 344–448 with
//   its bell (33, 322); the window 66–176 × 268–420, rain on it, the shop's name painted
//   backwards; the wall clock (42, 286); the SHELVES 184–404 × 246–450, floor to ceiling,
//   tins, sweet jars, bottles, sacks of flour, the ladder on its rail; the floorboards
//   446–514; the pendant lamp over the counter (300, 242). The COUNTER 186–404, its top
//   at 474 — his HIP, so it hides his legs and nothing above them — drawn over the
//   accountant's legs; on it the ABACUS (234, rods at 432/447/462),
//   the teacup (272), the LEDGER (306), the receipt SPIKE (358) and the TILL (378). The
//   accountant stands at 330 (the books) and 352 (the till); the owner at 172 (the counter's
//   end, the biscuit tin at 192) and 250 (leaning over the ledger).
//   STREET (its own x 0–400): the morning sky; across the road a brick house under
//   SCAFFOLDING with two builders on it (0–140), the BANK with its clock (140–262, the clock
//   at 201, 287), the bakery and the ironmonger with their market stalls (262–400); the
//   cobbled road 452–480, the kerb and the near pavement. The CHESTNUT CART 164–250 (top
//   474, his hip); its brazier 222–246 at the seller's end with its tray, the PRICE SLATE
//   hung from the canopy on its pole (186, 424–446), the rent notice on its side (188, 481–495). The
//   accountant at 140 beside its left end (156 for the tally, still clear of it);
//   the owner at 268, BESIDE its right end at the brazier, so nothing covers him.
//
//   b0   alone: writes in the ledger (pencil 1.0s), turns and walks to the till, rings it
//        open and counts the coins (coin 2.4s), shuts the drawer (cashbox 3.6s), tears off
//        a receipt (paper 4.8s), writes on it (pencil 5.6s), spikes it, walks back to the
//        books and looks up as he speaks.
//   b1   the door swings, the bell rings on its spring, the owner comes in and leans on the counter.
//   b2   the accountant shuts the ledger on his pencil (book 0.3s).   b3  the owner spreads his hands.
//   b4   the accountant walks to the till, rings it open, pats the spike of receipts (pin 1.4s), walks back.
//   b5   Q1 SLIDE THE ABACUS.   b6  the owner leans over and reads the ledger upside down.
//   b7   the accountant taps the profit line, draws the hotel's note out of the ledger (paper
//        1.2s) and holds it up; the owner strolls back to his end.   b8  Q2 EMPTY THE TILL.
//   b9   the owner picks up the empty biscuit tin (lid 0.4s) and shakes it.   b10 sets it down.
//   b11  he strikes a pose.   b12 the accountant counts three jobs on his fingers.
//   b13  the fade, and morning: the owner at his cart scoops chestnuts into a bag (paper
//        1.0s); the accountant walks in.   b14 he weighs a bag in his hand.
//   b15  the owner points at the builders.   b16 the accountant looks up at them, then at the slate.
//   b17  Q3 CHALK THE PRICE.   b18  a builder comes over, takes a bag, pays (coin 1.3s).
//   b19  the accountant points at the rent notice.   b20 a bag held up in each hand.
//   b21  the accountant steps up, turns the slate over to its tally and chalks the line (chalk 1.6s).
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), everyone faces whom he
// talks to, and every hand that moves writes, counts, holds, points or taps.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.78;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [8.83, 4.8, 5.38, 4.72, 5.53, 0, 4.29, 6.65, 0, 4.65, 3.15, 4.87, 5.62, 4.53, 4.77, 5.33, 7.48, 0, 3.61, 5.45, 5.12, 7.97, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const BUSINESS = at('business');
const BOAST = at('boast');
const REVENUE = at('revenue');
const PEEK = at('peek');
const PAPER = at('paper');
const TIN = at('tin');
const STAFF = at('staff');
const APRON = at('apron');
const JOBS = at('jobs');
const STREET = at('street');
const PRICE = at('price');
const BUILDERS = at('builders');
const VALUE = at('value');
const SELL = at('sell');
const RENT = at('rent');
const BAGS = at('bags');
const EVEN = at('even');
const Q1 = BEATS.map((b) => (b.abacus ? 1 : 0));
const Q2 = BEATS.map((b) => (b.till ? 1 : 0));
const Q3 = BEATS.map((b) => (b.slate ? 1 : 0));
const Q1_AT = Q1.indexOf(1);
const Q2_AT = Q2.indexOf(1);
const Q3_AT = Q3.indexOf(1);
/** Seconds into beat 0 as a share of its span. */
const S0 = (s: number) => {
  'worklet';
  return s / LINES[0];
};

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of him (his own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
/** The same path written in seconds. */
const secs = (L: number, ks: readonly (readonly [number, number, number, number])[]): Key[] => ks.map(([s, a, b, c]) => [s / L, a, b, c] as Key);

// ── where everybody stands (WORLD x; the street is x + 400) ───────────────────
const HX = 400;
const TH_HOME = 330;
const TH_TILL = 352;
const TH_ST = HX + 140;
/** Beside the cart's left end (164) and the hung slate (173), so nothing covers him. */
const TH_TALLY = HX + 156;
const TH_ST_OFF = HX - 30;
const PL_OFF = -24;
const PL_HOME = 172;
const PL_PEEK = 250;
const PL_ST = HX + 268;
/** The night passes under a fade this far into b13. */
const CUT = 0.45;

const TH_LEGS: Track[] = per((n) => (n === WORK ? [[S0(1.5), TH_TILL], [S0(6.5), TH_HOME]]
  : n === REVENUE ? [[0.07, TH_TILL], [0.66, TH_HOME]]
    : n < STREET ? [[0, TH_HOME]] : n < EVEN ? [[0, TH_ST]] : [[0, TH_TALLY]]));
const PL_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, PL_OFF]] : n === ARRIVE ? [[0.04, PL_HOME]]
  : n < PEEK ? [[0, PL_HOME]] : n === PEEK ? [[0.03, PL_PEEK]]
    : n < PAPER ? [[0, PL_PEEK]] : n === PAPER ? [[0.5, PL_HOME]]
      : n < STREET ? [[0, PL_HOME]] : [[0, PL_ST]]));
const TH_TURN: Track[] = per((n) => (n === REVENUE ? [[0, -1], [0.36, -1]]
  : n < STREET ? [[0, -1]] : n === VALUE ? [[0, 1], [0.05, -1], [0.5, 1]] : [[0, 1]]));
const PL_TURN: Track[] = per((n) => (n === PAPER ? [[0, 1], [0.75, 1]]
  : n < STREET ? [[0, 1]] : n === SELL ? [[0, -1], [0.02, 1], [0.78, -1]] : [[0, -1]]));
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const PL_P = per((n) => (BEATS[n].speaker === 'plain' ? TALK : NOD));

// ── the counter's things ────────────────────────────────────────────────────
const ABACUS = { x: 234, y: 448 };
const RODS = [432, 447, 462];
/** Beads a row, and how many are pushed across to the right: 300, 220 and 80. */
const BEADS = 6;
const PUSHED = [4, 3, 1];
const BEAD_D = 4.4;
const LEDGER = { x: 306, y: 473 };
const TILL = { x: 378, y: 456 };
const DRAWER = { x: 378, y: 477 };
const SPIKE = { x: 358, top: 454 };
const TIN_REST = { x: 192, y: 469 };
const NOTE_IN = { x: 300, y: 472 };
const RECEIPT_SLOT = { x: 372, y: 438 };
const RECEIPT_DESK = { x: 364, y: 472.5 };
// ── the cart's things (world) ───────────────────────────────────────────────
const SLATE = { x: HX + 186, y: 435 };
const TRAY = { x: HX + 234, y: 448 };
const PILE_T = { x: HX + 169, y: 459 };
const BUILDER_IN = HX + 318;
const BUILDER_OFF = HX + 440;
const LEAN = [HX + 182, HX + 206, HX + 230];
const LEAN_Y = 483;

/**
 * The counter top is 28 below where most store hand paths were first laid (and 6 below where
 * b0's and b4's were written — it was brought down to his hip): a store key at or below the
 * counter's lip is lowered with it. On the street the cart was brought down 8 to his hip, and
 * the keys that touch its top or its side come down with it.
 */
const COUNTER_DROP = 28;
const REAL_DROP = 6;
const CART_DROP = 8;
const lowered = (arr: (readonly Key[])[]) => arr.map((ks, n) => (n < STREET
  ? ks.map((k) => (n === WORK || n === REVENUE
    ? (k[2] >= 430 ? [k[0], k[1], k[2] + REAL_DROP, k[3]] as Key : k)
    : (k[2] >= 436 ? [k[0], k[1], k[2] + COUNTER_DROP, k[3]] as Key : k)))
  : ks));

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { r300: 1, r220: 2, r80: 3, profit: 4, note: 5, cash: 6, p20: 7, p2: 8, p2000: 9 };

// ── hands ───────────────────────────────────────────────────────────────────
/** The accountant's right hand: the pencil, the till, the fingers, a bag, the chalk. */
const TH_R: (readonly Key[])[] = lowered(per((n) => {
  if (n === WORK) {
    // written at the counter's real height (this beat is not lowered)
    return secs(LINES[0], [
      [0, 12, 474, 1], [0.45, 12, 469, 1], [1.3, 20, 469, 1], [1.42, 10, 478, 0],
      [2.15, 10, 478, 0], [2.3, 18, 446, 1], [2.45, 18, 449, 1], [2.75, 22, 475, 1], [3.6, 15, 476, 1],
      [4.6, 20, 433, 1], [4.85, 16, 440, 1], [5.2, 12, 470, 1], [5.3, 11, 470.5, 1], [5.9, 17, 470.5, 1], [6.05, 6, 452, 1], [6.15, 6, 460, 1], [6.3, 8, 474, 0],
      [7.5, 8, 474, 0], [7.7, 12, 474, 1],
    ]);
  }
  if (n === BUSINESS) return [[0, 12, 452, 1], [0.03, 14, 446, 1], [0.056, 14, 449, 1], [0.86, 14, 449, 1], [0.95, 12, 452, 1]];
  if (n === REVENUE) {
    // written at the counter's real height (this beat is not lowered)
    return secs(LINES[REVENUE], [
      [0, 12, 474, 1], [0.2, 10, 478, 0], [0.95, 12, 468, 0], [1.1, 18, 446, 1], [1.2, 18, 449, 1], [1.32, 8, 448, 1], [1.42, 8, 453, 1],
      [1.6, 10, 478, 0], [4.5, 10, 478, 0], [4.65, 16, 468, 1], [4.85, 16, 471, 1], [5.1, 12, 474, 1],
    ]);
  }
  if (n === PAPER) return [[0, 12, 452, 1], [0.05, 16, 446, 1], [0.08, 16, 449, 1], [0.11, 16, 446, 1], [0.14, 16, 449, 1], [0.18, 12, 452, 1]];
  if (n === JOBS) return [[0.04, 12, 452, 1], [0.12, 14, 426, 1], [0.86, 14, 426, 1], [0.96, 12, 452, 1]];
  if (n < STREET) return [[0, 12, 452, 1]];
  if (n === PRICE) {
    return [[0.06, 10, 462, 0], [0.14, 27, 455 + CART_DROP, 1], [0.24, 16, 440, 1], [0.32, 16, 444, 1], [0.4, 16, 439, 1], [0.48, 16, 443, 1],
      [0.7, 16, 441, 1], [0.82, 27, 455 + CART_DROP, 1], [0.9, 10, 462, 0]];
  }
  if (n === RENT) return [[0.1, 10, 462, 0], [0.2, 34, 474 + CART_DROP, 1], [0.75, 34, 474 + CART_DROP, 1], [0.85, 10, 462, 0]];
  if (n === EVEN) {
    return secs(LINES[EVEN], [[0.9, 10, 462, 0], [1.1, 22, 442, 1], [1.45, 22, 442, 1], [1.8, 33, 442, 1], [2.4, 14, 462, 0]]);
  }
  return NONE;
}));
/** The accountant's left hand: the receipt held down to write on, and the hotel's note. */
const TH_L: (readonly Key[])[] = lowered(per((n) => {
  if (n === WORK) return secs(LINES[0], [[5.1, 8, 478, 0], [5.25, 16, 468, 1], [5.9, 16, 468, 1], [6.0, 8, 478, 0]]);
  if (n === PAPER) return [[0.12, 6, 456, 0], [0.16, 16, 447, 1], [0.2, 16, 443, 1], [0.28, 20, 424, 1]];
  if (n === Q2_AT) return [[0, 20, 424, 1]];
  if (n === TIN) return [[0, 20, 424, 1], [0.06, 16, 446, 1], [0.14, 8, 454, 1], [0.3, 6, 458, 0]];
  return NONE;
}));
/** The owner's right hand: the counter, the boast, the tin, the pose; a bag on the street. */
const PL_R: (readonly Key[])[] = lowered(per((n) => {
  if (n === ARRIVE) return [[0.8, 8, 456, 0], [0.9, 18, 447, 1]];
  if (n === BUSINESS || n === REVENUE || n === Q1_AT || n === Q2_AT) return [[0, 18, 447, 1]];
  if (n === BOAST) return [[0, 18, 447, 1], [0.08, 20, 436, 1], [0.86, 20, 436, 1], [0.95, 18, 447, 1]];
  if (n === PEEK) return [[0, 18, 447, 0], [0.62, 8, 456, 0], [0.72, 16, 447, 1]];
  if (n === PAPER) return [[0, 16, 447, 1], [0.4, 8, 456, 0], [0.84, 8, 456, 0], [0.92, 18, 447, 1]];
  if (n === TIN) {
    return [[0, 18, 447, 0], [0.04, 18, 443, 1], [0.086, 20, 441, 1], [0.16, 16, 432, 1], [0.21, 19, 429, 1], [0.26, 14, 433, 1],
      [0.31, 19, 429, 1], [0.36, 14, 433, 1], [0.42, 16, 432, 1]];
  }
  if (n === STAFF) return [[0, 16, 432, 1], [0.7, 16, 432, 1], [0.85, 20, 441, 1], [0.95, 8, 456, 0]];
  if (n === APRON) return [[0.06, 8, 456, 0], [0.16, 18, 424, 1], [0.84, 18, 424, 1], [0.95, 8, 456, 0]];
  if (n === JOBS) return [[0, 18, 447, 0], [0.2, 18, 447, 1]];
  if (n < STREET) return NONE;
  if (n === SELL) return [[0.1, 8, 458, 1], [0.25, 24, 446, 1], [0.44, 24, 446, 1], [0.55, 4, 456, 1], [0.65, 8, 458, 1]];
  if (n === BAGS) return [[0, 8, 458, 1], [0.2, 16, 434, 1], [0.85, 16, 434, 1], [0.95, 8, 458, 1]];
  return [[0, 8, 458, 1]];
}));
/** His left hand: spread for the boast and the pose; the chestnut scoop; pointing; the second bag. */
const PL_L: (readonly Key[])[] = lowered(per((n) => {
  if (n === BOAST) return [[0.1, 8, 456, 0], [0.18, 12, 440, 1], [0.84, 12, 440, 1], [0.94, 8, 456, 0]];
  if (n === APRON) return [[0.1, 8, 456, 0], [0.2, 6, 430, 1], [0.84, 6, 430, 1], [0.94, 8, 456, 0]];
  if (n === STREET) return [[0.14, 6, 458, 0], [0.18, 22, 441 + CART_DROP, 1], [0.21, 20, 438 + CART_DROP, 1], [0.25, 10, 452, 1], [0.33, 6, 458, 0]];
  if (n === BUILDERS) return [[0.08, 6, 458, 0], [0.18, 26, 410, 1], [0.7, 26, 410, 1], [0.8, 6, 458, 0]];
  if (n === BAGS) return [[0.04, 4, 458, 0], [0.12, 2, 458, 1], [0.2, 10, 438, 1], [0.85, 10, 438, 1], [0.95, 4, 460, 1]];
  if (n > BAGS) return [[0, 4, 460, 1]];
  return NONE;
}));

function smooth01(v: number): number {
  'worklet';
  const c = v < 0 ? 0 : v > 1 ? 1 : v;
  return c * c * (3 - 2 * c);
}
/** A hand path read at share `u` of its line. */
function keyAt(keys: readonly Key[], u: number) {
  'worklet';
  const first = keys[0];
  if (u <= first[0]) return { lx: first[1], y: first[2], w: first[3] };
  for (let k = 1; k < keys.length; k += 1) {
    const z = keys[k];
    if (u <= z[0]) {
      const a = keys[k - 1];
      const s = smooth01((u - a[0]) / Math.max(1e-6, z[0] - a[0]));
      return { lx: lerp(a[1], z[1], s), y: lerp(a[2], z[2], s), w: lerp(a[3], z[3], s) };
    }
  }
  const e = keys[keys.length - 1];
  return { lx: e[1], y: e[2], w: e[3] };
}
function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A hand on its path for this beat, in the figure's own frame (AR7.2). */
function keyed(s: Stance, keys: readonly Key[], u: number, x: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, GROUND, d, which, x + k.lx * (d < 0 ? -1 : 1), k.y, k.w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** How long a figure takes to turn round through a profile before he sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if he is
 * facing the wrong way and must turn first (C18: he always walks forwards). Eased in and
 * out, and the gait is driven by the same eased distance, so the feet stay planted.
 */
function walkOf(src: number, to: number, start: number, faceSrc: number, b: number) {
  'worklet';
  const d = Math.abs(to - src);
  if (d <= 1) return { x: to, x0: to, x1: to, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
  const wd = to > src ? 1 : -1;
  const ws = (faceSrc < 0 ? -1 : 1) !== wd && start < TURN_S - 0.04 ? TURN_S - 0.04 : start;
  const we = ws + moveTr(src, to, TR);
  const lin = clamp01((b - ws) / (we - ws));
  const e = ease01(lin);
  return { x: lerp(src, to, e), x0: src, x1: to, u: e, walking: b >= ws && lin < 1, ws, we, wd };
}
type Walk = ReturnType<typeof walkOf>;
type Legs = { w: Walk; ws: number[]; we: number[]; wd: number[] };
/** The beat's walks, leg after leg, from where he is: the one under way now, and every leg's span. */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number): Legs {
  'worklet';
  let cur = src;
  let face = faceSrc;
  let active: Walk = walkOf(src, src, 0, face, b);
  const ws: number[] = [];
  const we: number[] = [];
  const wd: number[] = [];
  for (let k = 0; k < legs.length; k += 1) {
    const w = walkOf(cur, legs[k][1], legs[k][0] * L, face, b);
    if (k === 0 || (w.wd !== 0 && b >= w.ws)) active = w;
    if (w.wd !== 0) {
      ws.push(w.ws);
      we.push(w.we);
      wd.push(w.wd);
      face = w.wd;
    }
    cur = legs[k][1];
  }
  return { w: active, ws, we, wd };
}
/** A figure standing still at x. */
function still(x: number): Legs {
  'worklet';
  return { w: walkOf(x, x, 0, 1, 0), ws: [], we: [], wd: [] };
}
/** The same legs, begun `off` seconds into the beat. */
function shifted(l: Legs, off: number): Legs {
  'worklet';
  return {
    w: { ...l.w, ws: l.w.ws + off, we: l.w.we + off },
    ws: l.ws.map((v) => v + off), we: l.we.map((v) => v + off), wd: l.wd,
  };
}
/**
 * Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a
 * walk wins. He turns to face where he is going just before he sets off, and a scripted turn
 * the other way waits until he has arrived.
 */
function faceOf(src: number, turns: Track, b: number, L: number, l: Legs) {
  'worklet';
  const ts: number[] = [];
  const ds: number[] = [];
  for (let k = 0; k < turns.length; k += 1) {
    let tt = turns[k][0] * L;
    const dd = turns[k][1];
    for (let j = 0; j < l.ws.length; j += 1) {
      if (dd !== l.wd[j] && tt >= l.ws[j] - TURN_S - 0.05 && tt < l.we[j]) tt = l.we[j];
    }
    ts.push(tt);
    ds.push(dd);
  }
  for (let j = 0; j < l.ws.length; j += 1) {
    ts.push(Math.max(0, l.ws[j] - TURN_S));
    ds.push(l.wd[j]);
  }
  for (let i = 1; i < ts.length; i += 1) {
    for (let j = i; j > 0 && ts[j] < ts[j - 1]; j -= 1) {
      const t0 = ts[j]; ts[j] = ts[j - 1]; ts[j - 1] = t0;
      const d0 = ds[j]; ds[j] = ds[j - 1]; ds[j - 1] = d0;
    }
  }
  let from = src;
  let d = src;
  for (let k = 0; k < ts.length; k += 1) {
    if (b < ts[k]) break;
    d = facing(from, ds[k], b - ts[k], TURN_S);
    from = ds[k];
  }
  return d;
}
/** One figure's body: walking its legs, or holding its pose live. */
function bodyOf(w: Walk, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t, phase), hHold(codes[n], t, phase), hLive(codes[n], t, b, phase), w.u, WALK, 0)
    : hLive(codes[n], t, b, phase);
}
/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** Eased 0 → 1 between two moments, in seconds. */
function sec(b: number, a: number, z: number): number {
  'worklet';
  return stage(b, 1, a, z);
}

export default function Biz7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldP = useHeld();
  const cv = useCarry(20);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const trAt = (ph: number) => {
      'worklet';
      return ease01(Math.max(0, b - ph * 0.2) / TR);
    };
    const L = lineOf(LINES, n);
    const u = b / L;
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };

    // ── the camera, and a tap that skipped the fade either way ──────────────
    const camSrc = carrySource(cv, 1, n, 0);
    const late = n > STREET && camSrc > -HX + 1;
    const early = n < STREET && camSrc < -1;
    const camNow = n < STREET ? 0 : n === STREET ? (b < CUT ? 0 : -HX) : -HX;
    const cam = carry(cv, 1, n, 0, camNow, 1);
    const fade = n === STREET ? sec(b, 0, CUT) * (1 - sec(b, CUT, CUT + 0.55)) : late || early ? 1 - sec(b, 0, 0.45) : 0;

    // ── the owner ───────────────────────────────────────────────────────────
    const legsP = PL_LEGS[n];
    let srcP = carrySource(cv, 0, n, PL_OFF);
    if (late || early) srcP = legsP[legsP.length - 1][1];
    const fP = late ? -1 : early ? 1 : carrySource(cv, 2, n, 1);
    let lP = legsOf(srcP, legsP, b, L, fP);
    if (n === STREET) lP = b < CUT ? still(srcP) : still(PL_ST);
    const wP = lP.w;
    const xPw = carry(cv, 0, n, wP.x, wP.x, 1);
    const xP = xPw + cam;
    const faceP = n === STREET ? (b < CUT ? fP : -1) : faceOf(fP, PL_TURN[n], b, L, lP);
    const dP = carry(cv, 2, n, 0, faceP, 1);
    let sp = bodyOf(wP, PL_P, n, t, b, 1);
    sp = keyed(sp, PL_R[n], u, xP, dP, 1);
    sp = keyed(sp, PL_L[n], u, xP, dP, -1);
    if (n === ARRIVE) sp = look(sp, -0.1);
    if (n === BOAST) sp = look(sp, -0.13 * hd(0.04, 0.14, 0.86, 0.96));
    if (n === PEEK) sp = look(sp, 0.18 * hd(0.62, 0.72, 0.95, 1));
    if (n === APRON) sp = look(sp, -0.15 * hd(0.1, 0.2, 0.84, 0.94));
    if (n === BUILDERS) sp = look(sp, -0.14 * hd(0.1, 0.2, 0.7, 0.8));
    if (n === BAGS) sp = look(sp, -0.1 * hd(0.2, 0.3, 0.84, 0.94));
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t, 1));
    const figP = keepHeld(heldP, wP.walking ? mixKeepLegs(prevP, sp, trAt(0)) : mixStance(prevP, sp, trAt(0)));

    // ── the accountant ──────────────────────────────────────────────────────
    const legsT = TH_LEGS[n];
    let srcT = carrySource(cv, 3, n, TH_HOME);
    if (late || early) srcT = legsT[legsT.length - 1][1];
    const fT = late ? 1 : early ? -1 : carrySource(cv, 4, n, -1);
    let lT = legsOf(srcT, legsT, b, L, fT);
    if (n === STREET) lT = b < CUT ? still(srcT) : shifted(legsOf(TH_ST_OFF, [[0, TH_ST]], b - CUT - 0.5, L, 1), CUT + 0.5);
    const wT = lT.w;
    const xTw = carry(cv, 3, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const faceT = n === STREET ? (b < CUT ? fT : 1) : faceOf(fT, TH_TURN[n], b, L, lT);
    const dT = carry(cv, 4, n, 0, faceT, 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1);
    if (n === WORK) {
      const writing = 0.12 * (hd(S0(0.45), S0(0.55), S0(1.25), S0(1.4)) + hd(S0(5.2), S0(5.3), S0(5.9), S0(6.0)));
      const chin = 0.08 * hd(S0(2.5), S0(2.7), S0(3.2), S0(3.35));
      sh = look(sh, writing + chin - 0.18 * hd(S0(7.4), S0(7.7), S0(8.4), S0(8.7)));
    }
    if (n === BUSINESS) sh = look(sh, -0.05 * hd(0.1, 0.2, 0.8, 0.9));
    if (n === PAPER) sh = look(sh, 0.1 * hd(0.03, 0.06, 0.14, 0.18));
    if (n === VALUE) sh = look(sh, -0.18 * hd(0.1, 0.18, 0.38, 0.46) + 0.06 * hd(0.56, 0.62, 0.86, 0.94));
    if (n === PRICE) sh = look(sh, 0.06 * hd(0.24, 0.3, 0.7, 0.78));
    if (n === EVEN) sh = look(sh, 0.05 * hd(0.12, 0.16, 0.26, 0.3));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(1)) : mixStance(prevT, sh, trAt(1)));

    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const ph = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(ph, 'wrR');
    const tL = wristOf(ph, 'wrL');
    const pR = wristOf(pl, 'wrR');
    const pL = wristOf(pl, 'wrL');
    const sT = dT < 0 ? -1 : 1;
    const sP = dP < 0 ? -1 : 1;

    // ── the door and its bell (b1) ──────────────────────────────────────────
    const doorOpen = n === ARRIVE ? hd(0.0, 0.08, 0.42, 0.56) : 0;
    const bellK = n === ARRIVE ? sec(b, 0.25, 2.6) : 1;
    const bellSwing = n === ARRIVE ? 22 * Math.sin(bellK * Math.PI * 7) * (1 - bellK) : 0;

    // ── the till's drawer: rung open, counted, shut; rung open again in b4 ─
    let drawer = 0;
    if (n === WORK) drawer = sec(b, 2.4, 2.5) * (1 - sec(b, 3.48, 3.62));
    else if (n === REVENUE) drawer = sec(b, 1.15, 1.25);
    else if (n > REVENUE && n < STREET) drawer = 1;
    const drawerOut = carry(cv, 5, n, 0, drawer, n === WORK || n === REVENUE ? 1 : tr);
    const flagUp = n === WORK ? sec(b, 2.4, 2.48) * (1 - sec(b, 3.5, 3.62)) : n === REVENUE ? sec(b, 1.15, 1.25) : n > REVENUE && n < STREET ? 1 : 0;

    // ── the ledger: open, shut on the pencil (b2), opened again (b4) ───────
    const shut = n === BUSINESS ? sec(b, 0.24, 0.3) : n === BOAST ? 1 : n === REVENUE ? 1 - sec(b, 4.75, 4.85) : 0;
    const ledgerShut = carry(cv, 6, n, 0, shut, n === BUSINESS || n === REVENUE ? 1 : tr);

    // ── the receipt torn off the till in b0 and spiked ─────────────────────
    let rcState = n > WORK ? 3 : 0;
    if (n === WORK) rcState = b < 4.75 ? 0 : b < 5.2 ? 1 : b < 5.95 ? 2 : b < 6.15 ? 1 : 3;
    const rcX = rcState === 1 ? tR.x + 2 * sT - cam : rcState === 2 ? RECEIPT_DESK.x : rcState === 3 ? SPIKE.x : RECEIPT_SLOT.x;
    const rcY = rcState === 1 ? tR.y - 2 : rcState === 2 ? RECEIPT_DESK.y : rcState === 3 ? SPIKE.top + 6 : RECEIPT_SLOT.y;
    const receipt = { x: rcX, y: rcY, o: n === WORK ? sec(b, 4.6, 4.75) : 1, flat: rcState === 2 ? 1 : 0 };

    // ── the hotel's note, out of the ledger (b7) and back in (b9) ──────────
    const noteUp = n === PAPER ? stage(b, L, 0.17, 0.2) : n === Q2_AT ? 1 : n === TIN ? 1 - stage(b, L, 0.06, 0.09) : 0;
    const note = { x: lerp(NOTE_IN.x, tL.x + 3 * sT, noteUp), y: lerp(NOTE_IN.y, tL.y - 5, noteUp), o: noteUp };

    // ── the biscuit tin (b9–b10) ────────────────────────────────────────────
    const tinHeld = n === TIN ? stage(b, L, 0.08, 0.09) : n === STAFF ? 1 - stage(b, L, 0.84, 0.86) : 0;
    const tin = {
      x: lerp(TIN_REST.x + cam, pR.x + 2 * sP, tinHeld),
      y: lerp(TIN_REST.y, pR.y - 3, tinHeld),
      rot: n === TIN ? 8 * hd(0.16, 0.2, 0.36, 0.42) * Math.sin(t * 30) : 0,
    };
    // ── the pencil and the fingers ──────────────────────────────────────────
    const fingers = n === JOBS ? hd(0.12, 0.18, 0.86, 0.94) : 0;
    const nFing = n === JOBS ? (u < 0.36 ? 1 : u < 0.52 ? 2 : 3) : 0;
    const pencilO = carry(cv, 7, n, 1, n < STREET ? 1 - fingers : 0, tr);

    // ── the street: the bag he weighs, the builder, the coin, the bags ─────
    const bagT = n === PRICE ? stage(b, L, 0.13, 0.15) * (1 - stage(b, L, 0.81, 0.83)) : 0;
    const bagTp = { x: lerp(PILE_T.x + cam, tR.x + 1.5 * sT, bagT), y: lerp(PILE_T.y, tR.y + 3, bagT) };
    const handOver = n === SELL ? stage(b, L, 0.27, 0.29) : n > SELL ? 1 : 0;
    const newBag = n === SELL ? stage(b, L, 0.55, 0.57) : n > SELL ? 1 : 0;
    const bldIn = n === SELL ? hd(0.0, 0.26, 0.62, 0.95) : 0;
    const bx = lerp(BUILDER_OFF, BUILDER_IN, bldIn) + cam;
    const bldDir = n > SELL || (n === SELL && u > 0.62) ? 1 : -1;
    const bldWalk = n === SELL && ((u > 0 && u < 0.26) || (u > 0.62 && u < 0.95)) ? 1 : 0;
    const reach = n === SELL ? hd(0.16, 0.26, 0.42, 0.52) : 0;
    const shoulder = { x: bx - 4, y: 433 };
    const bh = { x: lerp(bx - 5, pR.x + 4, reach), y: lerp(458, pR.y, reach) };
    const coin = n === SELL ? { o: hd(0.28, 0.3, 0.6, 0.66), k: stage(b, L, 0.3, 0.36) } : { o: 0, k: 0 };
    const showBagR = n < STREET ? 0 : n === STREET ? (b < CUT ? 0 : 1) : n === SELL ? 1 - handOver + newBag : 1;
    const showBagL = n === BAGS ? stage(b, L, 0.11, 0.13) : n > BAGS ? 1 : 0;
    const bagFill = n === STREET ? stage(b, L, 0.21, 0.23) : 1;
    const scoop = n === STREET ? hd(0.18, 0.19, 0.22, 0.24) : 0;

    // ── Q1: the abacus rows ─────────────────────────────────────────────────
    const r300 = carry(cv, 8, n, 0, ans(1, Q1), tr);
    const r220 = carry(cv, 9, n, 0, ans(2, Q1), tr);
    const r80 = carry(cv, 10, n, 0, ans(3, Q1), tr);
    // ── Q2: the ledger, the note, the drawer ────────────────────────────────
    const rProfit = carry(cv, 11, n, 0, ans(4, Q2), tr);
    const rNote = carry(cv, 12, n, 0, ans(5, Q2), tr);
    const rCash = carry(cv, 13, n, 0, ans(6, Q2), tr);
    // ── Q3: the three slates ────────────────────────────────────────────────
    const rP20 = carry(cv, 14, n, 0, ans(7, Q3), tr);
    const rP2 = carry(cv, 15, n, 0, ans(8, Q3), tr);
    const rP2000 = carry(cv, 16, n, 0, ans(9, Q3), tr);
    const priced = Math.max(clamp01(rP2 * 2 - 0.6), n > Q3_AT ? 1 : 0);
    // ── the slate turned over to its tally (b21) ────────────────────────────
    const flip = n === EVEN ? sec(b, 1.0, 1.3) : n > EVEN ? 1 : 0;
    const underline = n === EVEN ? sec(b, 1.45, 1.8) : n > EVEN ? 1 : 0;
    const chalkO = n === EVEN ? hd(0.1, 0.12, 0.26, 0.29) : 0;

    return {
      pl, ph, cam, t, sT, sP, fade, tR, tL, pR, pL,
      doorOpen, bellSwing, drawerOut, flagUp, ledgerShut, receipt, note, tin, pencilO, fingers, nFing,
      bagTp, bagT, bx, bldDir, bldWalk, shoulder, bh, coin, showBagR, showBagL, bagFill, scoop,
      r300, r220, r80, rProfit, rNote, rCash, rP20, rP2, rP2000, priced, flip, underline, chalkO,
      q1: carry(cv, 17, n, 0, Q1[n], tr),
      q2: carry(cv, 18, n, 0, Q2[n], tr),
      q3: carry(cv, 19, n, 0, Q3[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world2 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world3 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the store (x 0–400) and the street (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="biz7-store-far" />
        <Rain S={SCENE} />
        <Door S={SCENE} />
        <Bell S={SCENE} />
        <Lamp S={SCENE} />
        <View style={styles.shopShadow} />
        <LessonPicture name="biz7-street-far" />
        <ClockHands S={SCENE} />
        <View style={styles.cartShadow} />
      </Animated.View>
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      <Pencil S={SCENE} />
      <Fingers S={SCENE} />
      <Chalk S={SCENE} />
      {/* the counter over his legs, and what is on it; the cart on the street */}
      <Animated.View style={[styles.world, world2]} pointerEvents="none">
        <View style={styles.counterShadow} />
        <LessonPicture name="biz7-store-counter" />
        <Abacus S={SCENE} />
        <Ledger S={SCENE} />
        <Drawer S={SCENE} />
        <Till S={SCENE} />
      </Animated.View>
      <Receipt S={SCENE} />
      <Note S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="second" wear={[]} />
      <Tin S={SCENE} />
      <Bags S={SCENE} />
      {/* the chestnut cart over his legs on the street */}
      <Animated.View style={[styles.world, world3]} pointerEvents="none">
        <LessonPicture name="biz7-cart" />
        <Fire S={SCENE} />
        <PriceSlate S={SCENE} />
        <LeanSlates S={SCENE} />
      </Animated.View>
      <BagT S={SCENE} />
      <Builder S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
      {on(Q2) ? <Plates S={SCENE} k="q2" items={Q2_PLATES} /> : null}
      <Fade S={SCENE} />
      {/* the verdict seal goes under the abacus row and the slate picked, never over their beads or the hung price slate */}
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={ABACUS_Q} k="q1" seal="br" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={TILL_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={SLATE_Q} k="q3" /> : null}
    </View>
  );
}

// ── the living store ─────────────────────────────────────────────────────────

/** Rain running down the window, inside its frame. */
const STREAKS = [[72, 0.0, 0.9], [84, 0.37, 1.1], [97, 0.71, 0.8], [109, 0.18, 1.0], [123, 0.55, 1.2], [136, 0.86, 0.9], [148, 0.29, 1.05], [161, 0.63, 0.95], [171, 0.08, 1.15], [90, 0.92, 1.0], [117, 0.44, 0.85], [154, 0.79, 1.1]];
function Rain({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.window}>
      {STREAKS.map(([x, ph, sp], k) => <Streak key={k} S={S} x={x - 66} ph={ph} sp={sp} />)}
    </View>
  );
}
function Streak({ S, x, ph, sp }: { S: SharedValue<any>; x: number; ph: number; sp: number }) {
  const st = useAnimatedStyle(() => {
    const v = (S.value.t * 0.55 * sp + ph) % 1;
    return { opacity: 0.85 * Math.sin(Math.PI * v), transform: [{ translateX: x - 2 * v }, { translateY: -14 + 166 * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.streak} /></Animated.View>;
}
/** The shop door, swung open on its left hinge as he comes in. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 12 }, { scaleX: 1 - 0.78 * S.value.doorOpen }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.hinge}><LessonPicture name="biz7-store-door" /></View>
    </Animated.View>
  );
}
function Bell({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 33 }, { translateY: 322 }, { rotate: `${S.value.bellSwing}deg` }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="biz7-bell" /></Animated.View>;
}
/** The pendant lamp, swaying a hair in the draught from the door. */
function Lamp({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: 300 }, { translateY: 242 }, { rotate: `${0.8 * Math.sin(S.value.t * 0.9) + 0.03 * S.value.bellSwing}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="biz7-lamp" /></Animated.View>;
}

/** The wooden abacus and its three rows of beads: 300, 220 and 80. */
function Abacus({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={[styles.rider, { transform: [{ translateX: ABACUS.x }, { translateY: ABACUS.y }] }]}>
        <LessonPicture name="biz7-abacus" />
      </View>
      {RODS.map((y, r) => <BeadRow key={r} S={S} r={r} y={y} />)}
    </>
  );
}
const BEAD_COLORS = [W.bz7BeadRed, W.bz7BeadOchre, W.bz7BeadGreen];
function BeadRow({ S, r, y }: { S: SharedValue<any>; r: number; y: number }) {
  return <>{Array.from({ length: BEADS }, (_, k) => <Bead key={k} S={S} r={r} k={k} y={y} />)}</>;
}
function Bead({ S, r, k, y }: { S: SharedValue<any>; r: number; k: number; y: number }) {
  const pushed = k >= BEADS - PUSHED[r];
  const left = ABACUS.x - 17 + BEAD_D / 2 + k * BEAD_D;
  const right = ABACUS.x + 17 - BEAD_D / 2 - (BEADS - 1 - k) * BEAD_D;
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const re = r === 0 ? v.r300 : r === 1 ? v.r220 : v.r80;
    let x = pushed ? right : left;
    let yy = y;
    if (r === 2) {
      // the profit row: its beads hop up and click back into place
      yy = y - 5 * Math.sin(Math.PI * Math.min(1, re * 1.6)) * (pushed ? 1 : 0.4);
    } else if (re > 0) {
      // a wrong row: the beads rattle and slide back home
      x += (pushed ? -1 : 0) * (right - left) * Math.sin(Math.PI * re) * 0.5 + 2.4 * Math.sin(re * Math.PI * 9) * (1 - re);
    }
    return { transform: [{ translateX: x }, { translateY: yy }] };
  });
  const c = BEAD_COLORS[r];
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.bead, { backgroundColor: c.base }]} />
      <View style={[styles.beadShade, { backgroundColor: c.shade }]} />
    </Animated.View>
  );
}
/** The ledger: open, or shut on the pencil. A wrong pick flaps its pages. */
function Ledger({ S }: { S: SharedValue<any> }) {
  const open = useAnimatedStyle(() => {
    const r = S.value.rProfit;
    return {
      opacity: 1 - S.value.ledgerShut,
      transform: [{ translateX: LEDGER.x + 2 * Math.sin(r * Math.PI * 8) * (1 - r) }, { translateY: LEDGER.y - 3 * Math.sin(Math.PI * r) }],
    };
  });
  const shut = useAnimatedStyle(() => ({ opacity: S.value.ledgerShut, transform: [{ translateX: LEDGER.x }, { translateY: LEDGER.y }] }));
  return (
    <>
      <Animated.View style={[styles.rider, open]} pointerEvents="none"><LessonPicture name="biz7-ledger-open" /></Animated.View>
      <Animated.View style={[styles.rider, shut]} pointerEvents="none"><LessonPicture name="biz7-ledger-shut" /></Animated.View>
    </>
  );
}
/** The cash drawer sliding out of the till's base, the coins in it. Picked right, the coins jump. */
const COINS = [[-8, 0, 0], [-4, -0.6, 1], [0, 0.2, 0], [4, -0.4, 1], [8, 0, 0], [-6, 1.6, 1], [2, 1.6, 0], [6, 1.4, 1]];
function Drawer({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.drawerOut;
    const r = S.value.rCash;
    return { transform: [{ translateX: DRAWER.x }, { translateY: DRAWER.y + 7 * d - 2 * Math.sin(Math.PI * Math.min(1, r * 2)) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.drawerTray} />
      {COINS.map(([x, y, c], k) => <Coin key={k} S={S} x={x} y={y} c={c} k={k} />)}
      <View style={styles.drawerFront} />
      <View style={styles.drawerKnob} />
    </Animated.View>
  );
}
function Coin({ S, x, y, c, k }: { S: SharedValue<any>; x: number; y: number; c: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rCash;
    const hop = Math.sin(Math.PI * Math.min(1, Math.max(0, r * 1.5 - k * 0.04)));
    return { opacity: Math.min(1, S.value.drawerOut * 3), transform: [{ translateX: x }, { translateY: y - 2.4 - 9 * hop * (0.7 + 0.3 * (k % 3)) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={[styles.coin, c ? styles.coinCopper : null]} /></Animated.View>;
}
/** The brass till: a picture; its flag pops up when it is rung. */
function Till({ S }: { S: SharedValue<any> }) {
  const flag = useAnimatedStyle(() => ({ opacity: S.value.flagUp, transform: [{ translateY: -3 * S.value.flagUp }] }));
  return (
    <View style={[styles.rider, { transform: [{ translateX: TILL.x }, { translateY: TILL.y }] }]} pointerEvents="none">
      <Animated.View style={[styles.flag, flag]}><View style={styles.flagFace} /></Animated.View>
      <LessonPicture name="biz7-till" />
    </View>
  );
}
function Receipt({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.receipt;
    return { opacity: v.o, transform: [{ translateX: v.x + S.value.cam }, { translateY: v.y }, { scaleY: v.flat ? 0.45 : 1 }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.receipt} /><View style={styles.receiptLine} /></Animated.View>;
}
function Note({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.note;
    const r = S.value.rNote;
    return {
      opacity: v.o,
      transform: [{ translateX: v.x }, { translateY: v.y + 4 * r }, { rotate: `${14 * Math.sin(r * Math.PI * 6) * (1 - r) + 10 * r}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.note} />
      <View style={[styles.noteLine, { top: -3 }]} />
      <View style={[styles.noteLine, { top: -0.6, width: 6 }]} />
      <View style={styles.noteStamp} />
    </Animated.View>
  );
}
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.pencilO,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleX: S.value.sT }, { rotate: `${S.value.sT * 31}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.pencil} />
      <View style={styles.pencilTip} />
    </Animated.View>
  );
}
function Chalk({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.chalkO,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleX: S.value.sT }, { rotate: `${S.value.sT * 24}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.chalk} /></Animated.View>;
}
/** One, two, three jobs counted off on the fingers. */
function Fingers({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.fingers,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleY: 0.4 + 0.6 * S.value.fingers }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {[0, 1, 2].map((k) => <Finger key={k} S={S} k={k} />)}
    </Animated.View>
  );
}
function Finger({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleY: S.value.nFing > k ? 1 : 0.35 }] }));
  return <Animated.View style={[styles.finger, { left: -3.6 + k * 2.6 }, st]} />;
}
/** The empty biscuit tin. */
function Tin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.tin.x }, { translateY: S.value.tin.y }, { rotate: `${S.value.tin.rot}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.tinBody} />
      <View style={styles.tinBand} />
      <View style={styles.tinLid} />
    </Animated.View>
  );
}

// ── the living street ────────────────────────────────────────────────────────

/** The bank clock's hands, creeping round. */
function ClockHands({ S }: { S: SharedValue<any> }) {
  const mn = useAnimatedStyle(() => ({ transform: [{ translateX: HX + 201 }, { translateY: 287 }, { rotate: `${(S.value.t * 6) % 360}deg` }] }));
  const hr = useAnimatedStyle(() => ({ transform: [{ translateX: HX + 201 }, { translateY: 287 }, { rotate: `${250 + ((S.value.t * 0.5) % 360)}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.rider, hr]} pointerEvents="none"><View style={styles.hourHand} /></Animated.View>
      <Animated.View style={[styles.rider, mn]} pointerEvents="none"><View style={styles.minuteHand} /></Animated.View>
    </>
  );
}
/** The coals through the brazier's door, and smoke off the tray. */
function Fire({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Ember key={k} S={S} k={k} />)}
      {[0, 1, 2].map((k) => <Smoke key={k} S={S} k={k} />)}
    </>
  );
}
function Ember({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(S.value.t * (3 + k) + k * 2) }));
  return <Animated.View style={[styles.ember, { left: HX + 228.5 + k * 2.6, top: 465 + (k % 2) * 1.6 }, st]} pointerEvents="none" />;
}
function Smoke({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = (S.value.t * 0.32 + k / 3) % 1;
    return {
      opacity: 0.75 * Math.sin(Math.PI * v),
      transform: [{ translateX: TRAY.x - 4 + k * 4 + 6 * Math.sin(v * 5 + k) }, { translateY: TRAY.y - 4 - 34 * v }, { scale: 0.6 + 1.1 * v }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.smoke} /></Animated.View>;
}
/** The price slate hung from the canopy: blank, then "£2"; turned over to its tally in b21. */
const GATES = [0, 1, 2, 3, 4, 5, 6, 7];
function PriceSlate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const sx = Math.abs(Math.cos(Math.PI * S.value.flip));
    return { transform: [{ translateX: SLATE.x }, { translateY: SLATE.y }, { scaleX: sx < 0.04 ? 0.04 : sx }] };
  });
  const front = useAnimatedStyle(() => ({ opacity: S.value.flip < 0.5 ? S.value.priced : 0 }));
  const back = useAnimatedStyle(() => ({ opacity: S.value.flip >= 0.5 ? 1 : 0 }));
  const line = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.underline) }] }));
  return (
    <>
      <View style={[styles.string, { left: SLATE.x - 8 }]} />
      <View style={[styles.string, { left: SLATE.x + 7.4 }]} />
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.slateFrame} />
        <View style={styles.slateFace} />
        <Animated.View style={[styles.slateWords, front]}>
          <Text style={styles.chalkText}>£2</Text>
        </Animated.View>
        <Animated.View style={[styles.slateWords, back]}>
          {GATES.map((g) => (
            <View key={g} style={[styles.gate, { left: 2 + (g % 4) * 4.8, top: 2.4 + Math.floor(g / 4) * 6 }]}>
              {[0, 1, 2, 3].map((s) => <View key={s} style={[styles.tally, { left: s * 0.9 }]} />)}
              <View style={styles.tallyCross} />
            </View>
          ))}
          <Animated.View style={[styles.underline, line]} />
        </Animated.View>
      </Animated.View>
    </>
  );
}
/** Q3's three slates leaning on the cart: 20p, £2, £20. */
const LEAN_TEXT = ['20p', '£2', '£20'];
function LeanSlates({ S }: { S: SharedValue<any> }) {
  return <>{LEAN.map((x, k) => <LeanSlate key={k} S={S} x={x} k={k} />)}</>;
}
function LeanSlate({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    let ty = LEAN_Y;
    let deg = -6;
    let tx = x;
    let sc = 1;
    if (k === 1) {
      const r = v.rP2;
      const pop = Math.sin(Math.PI * Math.min(1, r * 1.4));
      ty -= 14 * pop;
      sc = 1 + 0.16 * pop;
      deg = -6 * (1 - pop);
    } else if (k === 0) {
      const f = clamp01(v.rP20 * 1.3);
      deg = -6 - 84 * f;
      ty += 8 * f;
      tx += 6 * f;
    } else {
      const r = v.rP2000;
      tx += 3 * Math.sin(r * Math.PI * 10) * (1 - r);
      deg = -6 + 8 * Math.sin(r * Math.PI * 6) * (1 - r) - 14 * r;
      ty += 3 * r;
    }
    return { opacity: v.q3, transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.leanFrame} />
      <View style={styles.leanFace} />
      <View style={styles.leanWords}><Text style={styles.leanText}>{LEAN_TEXT[k]}</Text></View>
    </Animated.View>
  );
}
/** The paper bag the accountant picks off the pile and weighs. */
function BagT({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.bagT, transform: [{ translateX: S.value.bagTp.x }, { translateY: S.value.bagTp.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><BagBody /></Animated.View>;
}
function BagBody() {
  return (
    <>
      <View style={styles.bag} />
      <View style={styles.bagShade} />
      <View style={styles.bagFold} />
    </>
  );
}
/** The owner's bags: one in his right hand on the street (a scoop goes into it), a second in his left. */
function Bags({ S }: { S: SharedValue<any> }) {
  const r = useAnimatedStyle(() => ({ opacity: Math.min(1, S.value.showBagR), transform: [{ translateX: S.value.pR.x + 1.5 * S.value.sP }, { translateY: S.value.pR.y + 3.5 }] }));
  const l = useAnimatedStyle(() => ({ opacity: S.value.showBagL, transform: [{ translateX: S.value.pL.x + 1.5 * S.value.sP }, { translateY: S.value.pL.y + 3.5 }] }));
  const nuts = useAnimatedStyle(() => ({ opacity: S.value.bagFill }));
  const scoop = useAnimatedStyle(() => ({ opacity: S.value.scoop, transform: [{ translateX: S.value.pL.x }, { translateY: S.value.pL.y - 1.5 }] }));
  return (
    <>
      <Animated.View style={[styles.rider, r]} pointerEvents="none">
        <BagBody />
        <Animated.View style={[styles.nuts, nuts]} />
      </Animated.View>
      <Animated.View style={[styles.rider, l]} pointerEvents="none"><BagBody /></Animated.View>
      <Animated.View style={[styles.rider, scoop]} pointerEvents="none">
        <View style={[styles.nut, { left: -2.6 }]} />
        <View style={[styles.nut, { left: 0 }]} />
        <View style={[styles.nut, { left: -1.3, top: -3.6 }]} />
      </Animated.View>
    </>
  );
}
/** A builder from across the road, come for a bag: a drawn figure with a live reaching arm. */
function Builder({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => {
    const v = S.value;
    const bob = v.bldWalk ? -1.2 * Math.abs(Math.sin(v.t * 9)) : 0;
    return { transform: [{ translateX: v.bx }, { translateY: GROUND + bob }, { scaleX: -v.bldDir }] };
  });
  const arm = useAnimatedStyle(() => {
    const v = S.value;
    const dx = v.bh.x - v.shoulder.x;
    const dy = v.bh.y - v.shoulder.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      opacity: v.bx < STAGE_W + 20 ? 1 : 0,
      transform: [{ translateX: v.shoulder.x }, { translateY: v.shoulder.y }, { rotate: `${deg}deg` }, { scaleX: len / 26 }],
    };
  });
  const glove = useAnimatedStyle(() => ({ opacity: S.value.bx < STAGE_W + 20 ? 1 : 0, transform: [{ translateX: S.value.bh.x }, { translateY: S.value.bh.y }] }));
  const coin = useAnimatedStyle(() => {
    const v = S.value;
    const k = v.coin.k;
    return {
      opacity: v.coin.o,
      transform: [{ translateX: lerp(v.bh.x, v.pR.x, k) }, { translateY: lerp(v.bh.y, v.pR.y, k) - 6 * Math.sin(Math.PI * k) - 2 }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.rider, body]} pointerEvents="none"><LessonPicture name="biz7-builder" /></Animated.View>
      <Animated.View style={[styles.rider, arm]} pointerEvents="none"><View style={styles.sleeve} /></Animated.View>
      <Animated.View style={[styles.rider, glove]} pointerEvents="none"><View style={styles.glove} /></Animated.View>
      <Animated.View style={[styles.rider, coin]} pointerEvents="none"><View style={styles.coinBig} /></Animated.View>
    </>
  );
}

/** The fade through the night, between the store and the street. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  { x: 296, y: RODS[0] - 6, w: 32, lines: ['£300'] },
  { x: 296, y: RODS[1] - 6, w: 32, lines: ['£220'] },
  { x: 296, y: RODS[2] - 6, w: 32, lines: ['£80'] },
];
const Q2_PLATES: Plate[] = [
  { x: 282, y: 486, w: 64, lines: ['PROFIT LINE'] },
  { x: 266, y: 412, w: 62, lines: ['HOTEL NOTE'] },
  { x: 343, y: 490, w: 50, lines: ['THE CASH'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q2'; items: Plate[] }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {items.map((g) => (
        <View key={g.lines.join(' ')} style={[styles.plate, { left: g.x - g.w / 2, top: g.y, width: g.w, height: 2 + 10 * g.lines.length }]}>
          {g.lines.map((l) => <Text key={l} style={[styles.plateText, { width: g.w - 2 }]}>{l}</Text>)}
        </View>
      ))}
    </Animated.View>
  );
}

/** `seal`: which corner the verdict seal is struck on — chosen so it never lands on the thing picked. */
type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean; seal?: 'tr' | 'br' };
/** SLIDE THE ABACUS: which row shows what the shop kept? */
const ABACUS_Q: Q[] = [
  { id: 'r300', left: 210, top: RODS[0] - 7, w: 48, h: 14, r: 4, correct: false },
  { id: 'r220', left: 210, top: RODS[1] - 7, w: 48, h: 14, r: 4, correct: false },
  { id: 'r80', left: 210, top: RODS[2] - 7, w: 48, h: 14, r: 4, correct: true },
];
/** EMPTY THE TILL: which can pay the coal man tonight? */
const TILL_Q: Q[] = [
  // the seal goes above the ledger, under the held note, and under the drawer
  { id: 'profit', left: 270, top: 448, w: 62, h: 52, r: 4, correct: false, seal: 'tr' },
  { id: 'note', left: 233, top: 408, w: 89, h: 28, r: 4, correct: false, seal: 'br' },
  { id: 'cash', left: 340, top: 472, w: 52, h: 32, r: 4, correct: true, seal: 'br' },
];
/** CHALK THE PRICE: which slate goes on the cart? (the street, on screen) */
// The seal goes above the outer two (clear of the hung slate) and under the middle one (so it
// never lands on the hung slate the right answer chalks).
const SLATE_Q: Q[] = LEAN.map((x, k) => ({
  id: ['p20', 'p2', 'p2000'][k], left: x - HX - 14, top: LEAN_Y - 40, w: 28, h: 57, r: 4, correct: k === 1, seal: k === 1 ? 'br' : 'tr',
}));
function StageTargets({ picked, onPick, live, S, qs, k, seal = 'tr' }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2' | 'q3'; seal?: 'tr' | 'br';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt={q.seal ?? seal}
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  hinge: { position: 'absolute', left: -12, top: 0, width: 0, height: 0 },
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.cloudWhite.base },
  window: { position: 'absolute', left: 66, top: 268, width: 110, height: 152, overflow: 'hidden' },
  streak: { position: 'absolute', left: -0.4, top: 0, width: 0.8, height: 9, borderRadius: 0.4, backgroundColor: W.bz7Rain.base },
  shopShadow: { position: 'absolute', left: 6, top: 497, width: 56, height: 6, borderRadius: 3, backgroundColor: SHADE, opacity: 0.45 },
  counterShadow: { position: 'absolute', left: 184, top: 499, width: 216, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.5 },
  cartShadow: { position: 'absolute', left: HX + 160, top: 499, width: 96, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.45 },
  bead: { position: 'absolute', left: -BEAD_D / 2, top: -BEAD_D / 2, width: BEAD_D, height: BEAD_D, borderRadius: BEAD_D / 2, borderWidth: 0.5, borderColor: INK },
  beadShade: { position: 'absolute', left: 0, top: -1.2, width: 1.4, height: 2.6, borderRadius: 0.7 },
  drawerTray: { position: 'absolute', left: -12, top: -4.4, width: 24, height: 4.4, backgroundColor: W.bz7Drawer.shade, borderWidth: 0.5, borderColor: INK },
  drawerFront: { position: 'absolute', left: -13, top: 0, width: 26, height: 4.2, borderRadius: 0.8, backgroundColor: W.bz7Drawer.base, borderWidth: 0.7, borderColor: INK },
  drawerKnob: { position: 'absolute', left: -1.6, top: 1.2, width: 3.2, height: 1.8, borderRadius: 0.9, backgroundColor: W.bz7Brass.base },
  coin: { position: 'absolute', left: -1.4, top: -0.7, width: 2.8, height: 1.4, borderRadius: 0.7, backgroundColor: W.bz7Brass.base, borderWidth: 0.35, borderColor: INK },
  coinCopper: { backgroundColor: W.bz7Copper.base },
  coinBig: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.bz7Brass.base, borderWidth: 0.4, borderColor: INK },
  flag: { position: 'absolute', left: -4, top: -24, width: 8, height: 5 },
  flagFace: { position: 'absolute', left: 0, top: 0, width: 8, height: 5, borderRadius: 0.6, backgroundColor: W.bz7Paper.base, borderWidth: 0.5, borderColor: INK },
  receipt: { position: 'absolute', left: -3, top: -5, width: 6, height: 10, backgroundColor: W.bz7Paper.base, borderWidth: 0.4, borderColor: INK },
  receiptLine: { position: 'absolute', left: -1.8, top: -2, width: 3.6, height: 0.5, backgroundColor: W.hi7Pencil.base },
  note: { position: 'absolute', left: -6, top: -4.5, width: 12, height: 9, borderRadius: 0.6, backgroundColor: W.bz7Paper.base, borderWidth: 0.5, borderColor: INK },
  noteLine: { position: 'absolute', left: -4, width: 8, height: 0.6, backgroundColor: W.hi7Pencil.base },
  noteStamp: { position: 'absolute', left: 1.4, top: 1.2, width: 3, height: 2, borderRadius: 0.4, backgroundColor: W.hi7Ink.base },
  pencil: { position: 'absolute', left: -1, top: -0.6, width: 8, height: 1.2, borderRadius: 0.5, backgroundColor: W.bz7Pencil.base, borderWidth: 0.35, borderColor: INK },
  pencilTip: { position: 'absolute', left: 6.6, top: -0.35, width: 1.6, height: 0.7, borderRadius: 0.35, backgroundColor: W.sc7Cork.base },
  chalk: { position: 'absolute', left: -1, top: -0.7, width: 5, height: 1.4, borderRadius: 0.5, backgroundColor: W.bz7Chalk.base, borderWidth: 0.35, borderColor: INK },
  finger: { position: 'absolute', top: -9, width: 1.8, height: 8, borderRadius: 0.9, backgroundColor: INK, transformOrigin: '50% 100%' },
  tinBody: { position: 'absolute', left: -6.5, top: -4.5, width: 13, height: 9, borderRadius: 1, backgroundColor: W.bz7Tin.base, borderWidth: 0.6, borderColor: INK },
  tinBand: { position: 'absolute', left: -6, top: -1.4, width: 12, height: 2.8, backgroundColor: W.bz7Paper.base },
  tinLid: { position: 'absolute', left: -7.2, top: -5.6, width: 14.4, height: 2, borderRadius: 0.8, backgroundColor: W.bz7Tin.shade, borderWidth: 0.5, borderColor: INK },
  hourHand: { position: 'absolute', left: -0.5, top: -4.4, width: 1, height: 4.4, borderRadius: 0.5, backgroundColor: W.hi7Pencil.base, transformOrigin: '50% 100%' },
  minuteHand: { position: 'absolute', left: -0.35, top: -6.6, width: 0.7, height: 6.6, borderRadius: 0.35, backgroundColor: W.hi7Pencil.base, transformOrigin: '50% 100%' },
  ember: { position: 'absolute', width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.bz7Ember.base },
  smoke: { position: 'absolute', left: -2.5, top: -2.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: W.bz7Smoke.base },
  string: { position: 'absolute', top: 402, width: 0.6, height: 22, backgroundColor: W.hi7Rope.shade },
  slateFrame: { position: 'absolute', left: -13, top: -11, width: 26, height: 22, borderRadius: 1.2, backgroundColor: W.bz7SlateFrame.base, borderWidth: 0.7, borderColor: INK },
  slateFace: { position: 'absolute', left: -11, top: -9, width: 22, height: 18, backgroundColor: W.bz7Slate.base },
  slateWords: { position: 'absolute', left: -11, top: -9, width: 22, height: 18, alignItems: 'center', justifyContent: 'center' },
  chalkText: { width: 22, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, color: W.bz7Chalk.base, includeFontPadding: false },
  gate: { position: 'absolute', width: 4, height: 4.6 },
  tally: { position: 'absolute', top: 0, width: 0.5, height: 4.6, backgroundColor: W.bz7Chalk.base },
  tallyCross: { position: 'absolute', left: -0.6, top: 2, width: 4.4, height: 0.5, backgroundColor: W.bz7Chalk.base, transform: [{ rotate: '-30deg' }] },
  underline: { position: 'absolute', left: 1, top: 14.4, width: 20, height: 0.8, backgroundColor: W.bz7Chalk.base, transformOrigin: '0% 50%' },
  leanFrame: { position: 'absolute', left: -13, top: -15, width: 26, height: 30, borderRadius: 1.4, backgroundColor: W.bz7SlateFrame.base, borderWidth: 0.8, borderColor: INK, boxShadow: `0 3px 0 ${W.bz7SlateFrame.shade}` },
  leanFace: { position: 'absolute', left: -10.6, top: -12.6, width: 21.2, height: 25.2, backgroundColor: W.bz7Slate.base },
  leanWords: { position: 'absolute', left: -10.6, top: -12.6, width: 21.2, height: 25.2, alignItems: 'center', justifyContent: 'center' },
  leanText: { width: 21, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9.6, lineHeight: 12, color: W.bz7Chalk.base, includeFontPadding: false },
  bag: { position: 'absolute', left: -3.2, top: -1, width: 6.4, height: 8, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, backgroundColor: W.bz7Bag.base, borderWidth: 0.5, borderColor: INK },
  bagShade: { position: 'absolute', left: 0.8, top: -0.5, width: 2, height: 7, backgroundColor: W.bz7Bag.shade },
  bagFold: { position: 'absolute', left: -3.6, top: -2.2, width: 7.2, height: 1.6, borderRadius: 0.4, backgroundColor: W.bz7Bag.shade, borderWidth: 0.4, borderColor: INK },
  nuts: { position: 'absolute', left: -2.4, top: -3.2, width: 4.8, height: 2.2, borderRadius: 1.1, backgroundColor: W.bz7Drawer.base },
  nut: { position: 'absolute', top: -1.2, width: 2.6, height: 2.4, borderRadius: 1.2, backgroundColor: W.bz7Drawer.base, borderWidth: 0.35, borderColor: INK },
  sleeve: { position: 'absolute', left: 0, top: -2.6, width: 26, height: 5.2, borderRadius: 2.6, backgroundColor: W.bz7Sleeve.base, borderWidth: 0.7, borderColor: INK, transformOrigin: '0% 50%' },
  glove: { position: 'absolute', left: -3, top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: W.bz7Glove.base, borderWidth: 0.6, borderColor: INK },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (the abacus rows and £300/£220/£80,
// HOTEL NOTE/PROFIT LINE/THE CASH, the 20p/£2/£20 slates) read whole, answered right and wrong, on the biz7-wrongC sheet.
export function Biz7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz7Scene} band={[214, 514]} />;
}
