import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './sci1Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { LADDER_TREADS, SLATE_FACE } from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-1, "What Is Science?" — A BACK YARD, A STEPLADDER, TWO BALLS.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The sceptic (plain) knows the heavy ball
// lands first; the helper (the cap, kind) is up the stepladder with one ball in each
// hand; the scientist (the top hat) walks in and asks the reader to guess first.
//
//   b0   the helper stands one tread down the ladder, the two balls held at his chest;
//        the sceptic points up at the heavy one.
//   b1   the helper steps up to the top tread and holds the balls out level IN FRONT of
//        him, toward the sceptic he is talking to: the iron ball in his near hand and the
//        tennis ball in his far one (AR4 — no hand is thrown back behind him to show it).
//   b2   the scientist walks in from the left, tips his hat and raises a finger: wait.
//   b3   Q1: the heavy ball, the light ball, and the chalk line between the two marked
//        landing spots on the paving (BOTH TOGETHER) — tap one. Nothing has fallen.
//   b4   he lets go of both at the same instant: they fall side by side, faster and
//        faster, and land on their chalk marks together; the tennis ball bounces twice
//        and settles, the iron ball stays where it hit.
//   b5   the sceptic walks over and prods the tennis ball with his foot; it rolls a
//        little way toward the ladder.
//   b6   the scientist steps closer and opens a hand to the two balls on the ground,
//        then raises a finger as he names the rule; the sceptic folds his arms.
//   b7   the scientist crosses in front of the ladder to the far side of the balls, turns
//        back to them, crouches, picks the iron ball up in his front hand, stands and
//        weighs it in his palm — from there, clear of the man on the ladder.
//   b8   Q2: the slate leaning on the wall is wiped to three chalk rows — tap one.
//   b9   the scientist lays his free hand on the ladder; after "tested knowledge put to
//        work" he steps back and the helper starts down it, and he is on the bottom tread
//        for "the ladder he's standing on", then steps off onto the paving. The iron ball
//        stays in his hand, in front of him, whichever way he walks.
//   b10  at ease under the quotation.
//
// COMPOSITION, in stage units. A brick yard wall runs the width of the stage, 0–400 ×
// 396–500: coping at 404–413, a pier 330–374 standing proud under its cap. Grey paving
// 0–400 × 500–516 in front of it. The wooden stepladder stands at 229–271 × 424–500,
// its top cap at 424 (the helper's HIP when he stands on the top tread) and its treads
// at 448, 466 and 484. The helper (255) stands on the 448 tread facing right, both hands
// held out level IN FRONT of him at 262 and 279 — within the rig's safe reach (~23 units
// from the shoulder at this scale) — so the iron ball falls past the front of the
// ladder's right stile and the tennis ball just clear of it, onto two chalk crosses on
// the paving at 262 and 279. The sceptic stands at 332 facing left, in front of the
// pier, and steps to 294 to prod the tennis ball, which rolls up against the iron one.
// A slate 4–132 × 420–500 leans on the wall at the left, its face 12–120 × 427–493. The
// scientist walks in to 150 and steps to 214; on b7 he crosses to 284 and faces back
// left (his front hand in reach of the iron ball at 262 once he is down on his heels,
// and his head clear of the helper's legs on the top tread); on b9 he lays his free hand
// on the ladder's right stile under the top tread, and steps back to 304 as the helper
// comes down. The sceptic, having prodded the ball, steps back to 340 by the pier.
// Band [312, 520].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const { RULE, STONE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-1). b4's line is 2.48s and its
 * landing and bounces run to 2.6; b9's is 7.67s and the helper steps off the ladder
 * a little after it ends.
 */
const LINES = [4.13, 4.45, 5.5, 0, 3.48, 4.68, 5.45, 5.28, 0, 8.35, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in to listen, arms folded.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;
const FOLD = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CLAIM = is('claim');
const A_CLIMB = is('climb');
const A_ARRIVE = is('arrive');
const A_DROP = is('drop');
const A_EXCUSE = is('excuse');
const A_SETTLE = is('settle');
const A_RISK = is('risk');
const A_BUILD = is('build');
const FELL = BEATS.map((b) => (b.fell ? 1 : 0));
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));
const DROP_N = A_DROP.indexOf(1);
const RISK_N = A_RISK.indexOf(1);
const EXCUSE_N = A_EXCUSE.indexOf(1);
const BUILD_N = A_BUILD.indexOf(1);

/** Where each of them stands, beat by beat. The scientist is off the stage until b2. */
/** The sceptic prods the tennis ball from 294, then steps back to the pier and folds his arms. */
const SK_X = BEATS.map((_, n) => (n > EXCUSE_N ? 340 : n === EXCUSE_N ? 294 : 332));
const SC_X = [-40, -40, 150, 150, 150, 150, 214, 284, 284, 284, 304, 304];
/**
 * The scientist's walk WITHIN a beat, after any walk at its start: [from, to, start s,
 * end s, facing after]. On b7 he steps back clear of the ladder once he has the ball;
 * on b9 he lets go of the ladder and steps back out of the helper's way as the helper
 * comes down it.
 */
const NO_LEGS: number[][] = [];
const SC_LEGS: number[][][] = BEATS.map((_, n) => (n === BUILD_N ? [[284, 304, 5.95, 6.8, -1]] : NO_LEGS));
const HX = 255;
/** Which way each faces: the sceptic and the helper talk to each other across the ladder. */
const SK_D = BEATS.map(() => -1);
/** The scientist faces right until he crosses past the ladder for the iron ball (b7); from
 * there he faces back left, to the ladder, the helper on it and the ball in his hand. */
const SC_D = BEATS.map((_, n) => (n >= RISK_N ? -1 : 1));
const HP_D = BEATS.map(() => 1);
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const SK_P = [TALK, LISTEN, NOD, LEAN, LISTEN, TALK, FOLD, LISTEN, FOLD, NOD, NOD, LISTEN];
const SC_P = [LISTEN, LISTEN, EXPLAIN, LISTEN, LEAN, NOD, EXPLAIN, EXPLAIN, FOLD, EXPLAIN, NOD, LISTEN];
const HP_P = [LISTEN, TALK, LISTEN, NOD, TALK, LISTEN, NOD, FOLD, NOD, LEAN, NOD, LISTEN];

// ── the ladder, and where a foot stands on it ────────────────────────────────
const LAD = { x: 250, y: 462, w: 42, h: 76 };
/** The tops of the three treads, and the paving: 448, 466, 484, 500. */
const TREAD = LADDER_TREADS.map((t) => LAD.y - LAD.h / 2 + (t * LAD.h) / 100);
const TOP_TREAD = TREAD[0];
/** The ladder's right stile, just under the top tread, where a hand steadies it. */
const STILE = { x: 261, y: 452 };

// ── the two balls ────────────────────────────────────────────────────────────
const HEAVY_D = 15;
const LIGHT_D = 10;
/** Held out level in front of him, a little under the shoulders of a man on the top tread. */
const HELD_Y = 410;
const HEAVY_X = 262;
const LIGHT_X = 279;
/** Where each rests on the paving: its foot on the chalk cross at y 504. */
const LAND_Y = 504;
const HEAVY_REST = LAND_Y - HEAVY_D / 2;
const LIGHT_REST = LAND_Y - LIGHT_D / 2;
/** Where the tennis ball stops after the prod: up against the iron ball. */
const ROLLED_X = HEAVY_X + HEAVY_D / 2 + LIGHT_D / 2;
/** A held ball sits a little under the fist that holds it. */
const HOLD_OFF = 1.5;
/** The drop: let go at REL seconds, and both fall 88 units in FALL seconds, as a stone does. */
const REL = 0.3;
const FALL = 0.6;

// ── the slate leaning on the wall ────────────────────────────────────────────
const SL = { x: 68, y: 460, w: 128, h: 80 };
const SLATE = {
  left: SL.x + ((SLATE_FACE.x - SLATE_FACE.w / 2 - 50) * SL.w) / 100,
  top: SL.y + ((SLATE_FACE.y - SLATE_FACE.h / 2 - 50) * SL.h) / 100,
  w: (SLATE_FACE.w * SL.w) / 100,
  h: (SLATE_FACE.h * SL.h) / 100,
};

// The yard, the ladder and the slate's frame are DRAWN (LESSON_RULES AM13): pictures baked
// from scripts/lib/lessonart/lessons/sci1.mjs in the boxes their shape-built objects had,
// so nothing on the stage moved. The two balls are pictures too, drawn about their own
// centre and carried by a rider.

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/**
 * A hand to a stage point, measured from where the shoulder REALLY is. `reachHandTo`
 * clamps from an upright shoulder, which is right standing and short by a hand's width
 * when he leans in over the ball: the rig itself clamps the fist to the arm's length
 * from the leaning shoulder, so the hand meets the ball rather than stopping above it.
 * `dir` may be mid-turn: a target written as `x + d * dir` is then still in front.
 */
function handFree(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const d = Math.abs(dir) < 0.05 ? (dir < 0 ? -0.05 : 0.05) : dir;
  const pelY = g - (34 + s.bob) * K;
  const tgt = { x: (tx - x) / (K * d), y: (ty - pelY) / K };
  const cur = which > 0 ? s.fistR : s.fistL;
  const f = { x: lerp(cur.x, tgt.x, w), y: lerp(cur.y, tgt.y, w) };
  return which > 0 ? { ...s, fistR: f } : { ...s, fistL: f };
}
/** Eased 0 → 1 over [a, z] SECONDS of the beat — for handling timed by the clock. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A landing's squash: 0 → 1 → 0 over `len` seconds from `at`, sharp in and quick out. */
function hitOf(b: number, at: number, len: number): number {
  'worklet';
  const u = (b - at) / len;
  return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) * (1 - u * 0.4);
}
/**
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — and turns from the way he was facing ON SCREEN, `dSrc`: a tap
 * mid-walk or mid-turn would otherwise put him somewhere else in one frame (group L).
 * He faces the way he goes (C18), then turns to whom the beat has him face.
 */
function walkOf(src: number, dSrc: number, xs: readonly number[], ds: readonly number[], codes: readonly number[], n: number, t: number, b: number) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const walkU = walking ? ease01(clamp01(b / walkDur)) : 1;
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? lerp(facing(dSrc, way, b), ds[n], clamp01((b - walkDur) / 0.3))
    : facing(dSrc, ds[n], b);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}
/**
 * One step on the ladder, up or down, `u` 0 → 1. The FRONT foot goes first and the back
 * foot follows it onto the same tread; each clears the tread's edge on an arc; and the
 * standing knee bends through the middle of the step (`bob`, a cause, not a clock:
 * AL1), because a leg cannot reach a tread a whole step away from a straight one.
 * Returns the ground the body stands on and the two feet relative to it, in rig units.
 */
function ladderStep(from: number, to: number, u: number) {
  'worklet';
  const uL = ease01(u / 0.55);
  const uT = ease01((u - 0.45) / 0.55);
  const wL = lerp(from, to, uL) - 5 * Math.sin(Math.PI * uL);
  const wT = lerp(from, to, uT) - 5 * Math.sin(Math.PI * uT);
  const g = lerp(from, to, ease01(u));
  return { g, fr: (wL - g) / K, fl: (wT - g) / K, bob: -9 * Math.sin(Math.PI * clamp01(u)) };
}
/**
 * A figure's walks inside a beat, after the walk at its start. Returns where he is,
 * which way he faces and his stance, all continuous across the leg's ends.
 */
function legsOf(legs: readonly number[][], x0: number, d0: number, s0: Stance, live: Stance, b: number) {
  'worklet';
  let x = x0;
  let d = d0;
  let s = s0;
  for (let j = 0; j < legs.length; j++) {
    const g = legs[j];
    if (b < g[2]) break;
    const way = g[1] > g[0] ? 1 : -1;
    const u = ease01(clamp01((b - g[2]) / (g[3] - g[2])));
    x = lerp(g[0], g[1], u);
    d = b < g[3] ? facing(d, way, b - g[2], 0.3) : facing(way, g[4], b - g[3]);
    s = travelStance(g[0], g[1], live, live, live, u, WALK, 0);
  }
  return { x, d, s };
}
/** Where the helper's feet are, beat by beat: [start, end] of each step as FRACTIONS of the line. */
function helperFeet(n: number, b: number, L: number) {
  'worklet';
  if (n === 0) return { g: TREAD[1], fr: 0, fl: 0, bob: 0 };
  if (A_CLIMB[n]) return ladderStep(TREAD[1], TOP_TREAD, clamp01((b / L - 0.05) / 0.4));
  if (A_BUILD[n]) {
    const f = b / L;
    if (f < 0.68) return { g: TOP_TREAD, fr: 0, fl: 0, bob: 0 };
    if (f < 0.78) return ladderStep(TREAD[0], TREAD[1], (f - 0.68) / 0.1);
    if (f < 0.88) return ladderStep(TREAD[1], TREAD[2], (f - 0.78) / 0.1);
    return ladderStep(TREAD[2], GROUND, clamp01((f - 0.88) / 0.1));
  }
  if (n > BUILD_N) return { g: GROUND, fr: 0, fl: 0, bob: 0 };
  return { g: TOP_TREAD, fr: 0, fl: 0, bob: 0 };
}

const CAM = followMoves(SK_X, BEATS.map(kindOf), seedOf('science'));

export default function Sci1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldSk = useHeld();
  const heldSc = useHeld();
  const heldHp = useHeld();
  const cv = useCarry(15);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    /** A quicker blend, for what moves by the clock inside the beat's first second. */
    const trq = ease01(b / 0.25);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the helper, on the ladder ────────────────────────────────────────────
    const hf = helperFeet(n, b, L);
    const gH = carry(cv, 2, n, hf.g, hf.g, ease01(b / 0.3));
    let sh = hLive(HP_P[n], t, b);
    sh = {
      ...sh,
      bob: sh.bob + hf.bob,
      footL: { x: -4, y: hf.fl },
      footR: { x: 4, y: hf.fr },
    };
    // Where the balls are in his hands: at his chest on b0, then out level from the
    // climb until he lets go. The hands are PINNED, so the balls and the targets on
    // them sit exactly where the question says.
    const out = n === 0 ? 0 : A_CLIMB[n] ? st(0.5, 0.8) : 1;
    const holding = n < DROP_N || (A_DROP[n] && b < REL);
    const chestH = { x: HX + 6, y: gH - 30 };
    const chestL = { x: HX + 13, y: gH - 44 };
    const hxH = lerp(chestH.x, HEAVY_X, out);
    const hyH = lerp(chestH.y, HELD_Y - HOLD_OFF, out);
    const hxL = lerp(chestL.x, LIGHT_X, out);
    const hyL = lerp(chestL.y, HELD_Y - HOLD_OFF, out);
    // after the drop the empty hands stay out a moment, then come down
    const handsW = n < DROP_N ? 1 : A_DROP[n] ? 1 - st(0.34, 0.62) : 0;
    sh = hand(sh, HX, gH, HP_D[n], -1, hxH, hyH, handsW);
    sh = hand(sh, HX, gH, HP_D[n], 1, hxL, hyL, handsW);
    const prevHp = carryFrom(heldHp, n, hHold(HP_P[p], t));
    const figHp = keepHeld(heldHp, mixKeepLegs(prevHp, sh, tr));

    // ── the sceptic ──────────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, SK_X[0]);
    const dSrc0 = carrySource(cv, 3, n, SK_D[0]);
    const wk = walkOf(src0, dSrc0, SK_X, SK_D, SK_P, n, t, b);
    const xSk = carry(cv, 0, n, wk.xp, wk.xn, wk.walking ? wk.walkU : tr);
    const dSk = carry(cv, 3, n, wk.dirV, wk.dirV, 1);
    let sk = wk.s;
    // b0: he points up at the heavy ball in the helper's hands
    if (A_CLAIM[n]) sk = hand(sk, xSk, GROUND, dSk, 1, chestH.x, chestH.y, bp(0.08, 0.22, 0.8));
    // b5: his front foot goes out and prods the tennis ball
    let prod = 0;
    if (A_EXCUSE[n]) {
      prod = sm(b, wk.walkDur + 0.15, wk.walkDur + 0.4) * (1 - sm(b, wk.walkDur + 0.75, wk.walkDur + 1.05));
      const tap = sm(b, wk.walkDur + 0.4, wk.walkDur + 0.55) * (1 - sm(b, wk.walkDur + 0.55, wk.walkDur + 0.75));
      sk = {
        ...sk,
        footR: { x: lerp(sk.footR.x, 13 + 2 * tap, prod), y: lerp(sk.footR.y, -2.5 + 2.5 * tap, prod) },
        tilt: sk.tilt + 0.06 * prod,
      };
    }
    const prevSk = carryFrom(heldSk, n, hHold(SK_P[p], t));
    const figSk = keepHeld(heldSk, wk.walking ? mixKeepLegs(prevSk, sk, tr) : mixStance(prevSk, sk, tr));

    // ── the scientist ────────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const dSrc1 = carrySource(cv, 4, n, 1);
    const wt = walkOf(src1, dSrc1, SC_X, SC_D, SC_P, n, t, b);
    // his walk starts from where he is on screen (src1), so it needs no carry of its own
    const xWalk = lerp(wt.xp, wt.xn, wt.walking ? wt.walkU : 1);
    const lg = legsOf(SC_LEGS[n], xWalk, wt.dirV, wt.s, hLive(SC_P[n], t, b), b);
    const xSc = carry(cv, 1, n, lg.x, lg.x, 1);
    const dSc = carry(cv, 4, n, lg.d, lg.d, 1);
    let sc = lg.s;
    // b2: he tips his hat once he has arrived, then raises a finger — wait
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      sc = hand(sc, xSc, GROUND, dSc, 1, xSc + 5, GROUND - 76, bp(after + 0.03, after + 0.09, after + 0.18));
      sc = hand(sc, xSc, GROUND, dSc, 1, xSc + 12, GROUND - 64, bp(after + 0.2, after + 0.28, 0.99));
    }
    // b6: an open hand out to the two balls on the ground, then a finger raised
    if (A_SETTLE[n]) {
      sc = hand(sc, xSc, GROUND, dSc, 1, xSc + 22, GROUND - 32, bp(0.16, 0.26, 0.58));
      sc = hand(sc, xSc, GROUND, dSc, 1, xSc + 12, GROUND - 64, bp(0.62, 0.7, 0.97));
    }
    // b7: down on his heels to the iron ball — leaning in over it, his FRONT hand closing
    // on it — up with it held at his chest, and one heft of it in his palm
    let holdSc = n > RISK_N ? 1 : 0;
    if (A_RISK[n]) {
      const a = wt.walkDur + 0.1;
      const sq = sm(b, a, a + 0.55) * (1 - sm(b, a + 1.0, a + 1.6));
      sc = {
        ...sc,
        bob: sc.bob - 24 * sq,
        tilt: sc.tilt - 0.5 * sq,
        neck: sc.neck + 0.3 * sq,
        footL: { x: lerp(sc.footL.x, -7, sq), y: sc.footL.y * (1 - sq) },
        footR: { x: lerp(sc.footR.x, 9, sq), y: sc.footR.y * (1 - sq) },
      };
      // the free hand steadies him on his front knee while he is down (AR4: never left
      // hanging behind a body that leans forward over the ball)
      sc = handFree(sc, xSc, GROUND, dSc, -1, xSc + 8 * dSc, GROUND - 15, sq);
      holdSc = sm(b, a + 0.55, a + 0.7);
      // one heft: the palm gives under the weight and comes back up (AR5: once, not a loop)
      const heft = Math.sin(Math.PI * 2 * clamp01((b - (a + 1.95)) / 0.9));
      const toChest = sm(b, a + 0.9, a + 1.7);
      const hx = lerp(HEAVY_X, xSc + 13 * dSc, toChest);
      const hy = lerp(HEAVY_REST - HOLD_OFF, GROUND - 40 + 3 * heft, toChest);
      sc = handFree(sc, xSc, GROUND, dSc, 1, hx, hy, sm(b, a + 0.1, a + 0.55));
    } else if (n > RISK_N) {
      // the iron ball held at his chest, in front of him whichever way he faces
      sc = handFree(sc, xSc, GROUND, dSc, 1, xSc + 13 * dSc, GROUND - 40, 1);
    }
    // b9: his free hand on the ladder's stile as he names it, until the helper starts
    // down; then he steps back out of the way (SC_LEGS)
    if (A_BUILD[n]) sc = handFree(sc, xSc, GROUND, dSc, -1, STILE.x, STILE.y, st(0.2, 0.3) * (1 - st(0.68, 0.72)));
    const prevSc = carryFrom(heldSc, n, hHold(SC_P[p], t));
    const scMoving = wt.walking || SC_LEGS[n].length > 0;
    const figSc = keepHeld(heldSc, scMoving ? mixKeepLegs(prevSc, sc, tr) : mixStance(prevSc, sc, tr));

    // ── the balls ────────────────────────────────────────────────────────────
    // Free of any hand, each ball is where gravity has it: in the air under the hand
    // that let go, falling as u² (from rest, accelerating), and on its chalk mark. The
    // tennis ball bounces twice; the iron one stays where it hit.
    let fallU = FELL[n] ? 1 : 0;
    let bounce = 0;
    // the weight of the landing: each ball squashes on the paving the instant it hits and
    // springs back — the iron one hard and once, the tennis ball at every contact
    let sqH = 0;
    let sqL = 0;
    if (A_DROP[n]) {
      fallU = clamp01((b - REL) / FALL);
      const land = REL + FALL;
      const b1 = clamp01((b - land) / 0.34);
      const b2 = clamp01((b - land - 0.34) / 0.2);
      bounce = 11 * 4 * b1 * (1 - b1) + 3.5 * 4 * b2 * (1 - b2);
      sqH = hitOf(b, land, 0.2);
      sqL = hitOf(b, land, 0.1) + 0.7 * hitOf(b, land + 0.34, 0.08) + 0.4 * hitOf(b, land + 0.54, 0.07);
    }
    const u2 = fallU * fallU;
    const heavyY = lerp(HELD_Y, HEAVY_REST, u2);
    const lightY = lerp(HELD_Y, LIGHT_REST, u2) - bounce;
    const rolled = n > EXCUSE_N ? 1 : A_EXCUSE[n] ? sm(b, wk.walkDur + 0.45, wk.walkDur + 0.95) : 0;
    const lightX = lerp(LIGHT_X, ROLLED_X, rolled);
    const holdHp = holding ? 1 : 0;

    return {
      sk: pose(figSk, xSk, GROUND, K, dSk, 1),
      sc: pose(figSc, xSc, GROUND, K, dSc, 1),
      hp: pose(figHp, HX, gH, K, HP_D[n], 1),
      heavyX: carry(cv, 5, n, HEAVY_X, HEAVY_X, trq),
      heavyY: carry(cv, 6, n, heavyY, heavyY, trq),
      lightX: carry(cv, 7, n, lightX, lightX, trq),
      lightY: carry(cv, 8, n, lightY, lightY, trq),
      lightRot: carry(cv, 9, n, rolled, rolled, trq),
      holdHH: carry(cv, 10, n, holdHp, holdHp, trq),
      holdHL: carry(cv, 11, n, holdHp, holdHp, trq),
      holdSc: carry(cv, 12, n, holdSc, holdSc, trq),
      sqH,
      sqL,
      q1: carry(cv, 13, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 14, n, Q2[p], Q2[n], tr),
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.sk);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.sc);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.hp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="sci1-yard" />
      <ChalkMarks S={SCENE} picked={picked} live={Q1[i] === 1} />
      <BallShadows S={SCENE} DH={DH} DT={DT} />
      <LessonPicture name="sci1-slate" />
      <Slate S={SCENE} picked={picked} live={Q2[i] === 1} />
      <LessonPicture name="sci1-ladder" />
      {on(Q1) ? <DropLeader S={SCENE} /> : null}
      {/* cast: cap */}
      <Stickman D={DH} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DS} k={K} role="lead" wear={[]} />
      <Balls S={SCENE} DH={DH} DT={DT} />
      {on(Q1) ? <DropTags picked={picked} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q1) ? <DropTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <MethodTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the balls, in hands and out of them ──────────────────────────────────────

type Ball = { x: number; y: number; r: number; sq: number; d: number; free: number };
/**
 * A ball, drawn about its centre and carried by a rider. On a landing it SQUASHES — wider
 * and shorter, its foot kept on the paving — and springs back, which is what says it hit
 * something hard rather than stopped in the air.
 */
function Rider({ at, name }: { at: SharedValue<Ball>; name: string }) {
  const st = useAnimatedStyle(() => {
    const q = at.value.sq;
    const sy = 1 - 0.22 * q;
    return {
      transform: [
        { translateX: at.value.x },
        { translateY: at.value.y + (at.value.d / 2) * (1 - sy) },
        { rotate: `${at.value.r}rad` },
        { scaleX: 1 + 0.16 * q },
        { scaleY: sy },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name={name} />
    </Animated.View>
  );
}

function wristOf(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

function heavyAt(S: SharedValue<any>, DH: SharedValue<Bundle>, DT: SharedValue<Bundle>): Ball {
  'worklet';
  const v = S.value;
  const inH = wristOf(DH, 'wrL');
  const inS = wristOf(DT, 'wrR');
  const hh = v.holdHH;
  const hs = v.holdSc;
  const free = 1 - hh - hs < 0 ? 0 : 1 - hh - hs;
  return {
    x: v.heavyX * free + inH.x * hh + inS.x * hs,
    y: v.heavyY * free + (inH.y + HOLD_OFF) * hh + (inS.y + HOLD_OFF) * hs,
    r: 0,
    sq: v.sqH * free,
    d: HEAVY_D,
    free,
  };
}
function lightAt(S: SharedValue<any>, DH: SharedValue<Bundle>): Ball {
  'worklet';
  const v = S.value;
  const inH = wristOf(DH, 'wrR');
  const h = v.holdHL;
  // a ball that rolls turns: the distance rolled over its radius
  return {
    x: lerp(v.lightX, inH.x, h),
    y: lerp(v.lightY, inH.y + HOLD_OFF, h),
    r: (-v.lightRot * (LIGHT_X - ROLLED_X)) / (LIGHT_D / 2),
    sq: v.sqL * (1 - h),
    d: LIGHT_D,
    free: 1 - h,
  };
}

function Balls({ S, DH, DT }: { S: SharedValue<any>; DH: SharedValue<Bundle>; DT: SharedValue<Bundle> }) {
  const heavy = useDerivedValue(() => heavyAt(S, DH, DT));
  const light = useDerivedValue(() => lightAt(S, DH));
  return (
    <>
      <Rider at={heavy} name="sci1-iron" />
      <Rider at={light} name="sci1-tennis" />
    </>
  );
}

/**
 * The pill of shade each ball casts on the paving (group AG5): faint and wide while the
 * ball is high, dark and tight as it comes down onto it, so the fall reads as a fall TO
 * the ground. Gone while a ball is in a hand.
 */
function Shadow({ at, d }: { at: SharedValue<Ball>; d: number }) {
  const st = useAnimatedStyle(() => {
    const v = at.value;
    const gap = LAND_Y - (v.y + v.d / 2);
    const near = clamp01(1 - gap / 90);
    const w = d * (1.5 - 0.5 * near);
    return {
      opacity: v.free * (0.05 + 0.25 * near * near),
      width: w,
      transform: [{ translateX: v.x - w / 2 }],
    };
  });
  return <Animated.View style={[styles.ballShadow, st]} pointerEvents="none" />;
}
function BallShadows({ S, DH, DT }: { S: SharedValue<any>; DH: SharedValue<Bundle>; DT: SharedValue<Bundle> }) {
  const heavy = useDerivedValue(() => heavyAt(S, DH, DT));
  const light = useDerivedValue(() => lightAt(S, DH));
  return (
    <>
      <Shadow at={heavy} d={HEAVY_D} />
      <Shadow at={light} d={LIGHT_D} />
    </>
  );
}

// ── the answer, as the scene reads it ────────────────────────────────────────

/** How far along its reply a thing is: the one picked replies first, the right one after. */
function phaseOf(ans: number, who: number, k: number): number {
  'worklet';
  if (who < 0) return 0;
  const start = who === k ? 0 : 0.45;
  const u = (ans * 1.6 - start) / 0.85;
  return u < 0 ? 0 : u > 1 ? 1 : u;
}
/** A pop that overshoots and settles: 0 → 1.18 → 0.94 → 1 over u. */
function popOf(u: number): number {
  'worklet';
  if (u <= 0) return 0;
  if (u < 0.35) {
    const a = u / 0.35;
    return 1.18 * a * a * (3 - 2 * a);
  }
  const a = u >= 1 ? 1 : (u - 0.35) / 0.65;
  return 1 + 0.18 * (1 - a) * Math.cos(Math.PI * a * 1.5);
}
/** A shake that dies away — a head-shake, side to side, over u. */
function shakeOf(u: number): number {
  'worklet';
  return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI * 7) * (1 - u) * (1 - u);
}
/** The answer, latched: once a thing is picked, the scene keeps what it did. */
function useAnswer(picked: string | null, live: boolean, ids: string[]) {
  const first = live && picked !== null ? ids.indexOf(picked) : -1;
  const ans = useSharedValue(first >= 0 ? 1 : 0);
  const who = useSharedValue(first);
  useEffect(() => {
    if (!live || picked === null) return;
    const k = ids.indexOf(picked);
    if (k < 0 || who.value >= 0) return;
    who.value = k;
    ans.value = withTiming(1, { duration: 1500, easing: Easing.linear });
  }, [picked, live]);
  return { ans, who };
}

// ── the chalk crosses on the paving where each ball will land ────────────────

/**
 * Two chalk crosses, one under each ball. Once the question is answered, the line that
 * joins them is CHALKED IN from the middle out — the right answer, both together, drawn
 * where the two balls are about to land.
 */
function ChalkMarks({ S, picked, live }: { S: SharedValue<any>; picked: string | null; live: boolean }) {
  const { ans, who } = useAnswer(picked, live, DROP_Q.map((q) => q.id));
  const line = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, 2);
    const a = clamp01(u / 0.6);
    return { opacity: S.value.q1 * (u > 0 ? 1 : 0), transform: [{ scaleX: a * a * (3 - 2 * a) }] };
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[HEAVY_X, LIGHT_X].map((x) => (
        <View key={x}>
          <View style={[styles.chalkStroke, { left: x - 4.5, top: LAND_Y + 0.3, transform: [{ rotate: '35deg' }] }]} />
          <View style={[styles.chalkStroke, { left: x - 4.5, top: LAND_Y + 0.3, transform: [{ rotate: '-35deg' }] }]} />
        </View>
      ))}
      <Animated.View style={[styles.chalkJoin, line]} />
    </View>
  );
}

// ── the slate: the test chalked up, and the three rows for Q2 ────────────────

/** Q2: the slate's three chalk rows. Testing it and looking is how science settles it. */
const METHOD_Q = [
  { id: 'argue', label: 'ARGUE LOUDER', correct: false },
  { id: 'test', label: 'TEST IT AND LOOK', correct: true },
  { id: 'ask', label: 'ASK THE OLDEST', correct: false },
];
const ROW_H = SLATE.h / 3;
const ROW = { left: 3, w: SLATE.w - 6, h: ROW_H - 4 };

/**
 * One row chalked on the slate. Picked and wrong, it is STRUCK THROUGH with a chalk line
 * drawn across it, left to right, and it shakes its head; the right one is RINGED in chalk,
 * which springs round it, and its words pop and settle.
 */
function ChalkRow({ k, ans, who, S }: { k: number; ans: SharedValue<number>; who: SharedValue<number>; S: SharedValue<any> }) {
  const q = METHOD_Q[k];
  const row = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    if (q.correct) {
      const s = u > 0 ? popOf(Math.min(1, u * 1.4)) : 1;
      return { opacity: S.value.q2, transform: [{ scale: u > 0 ? 0.92 + 0.08 * s : 1 }] };
    }
    const w = who.value === k ? u : 0;
    return { opacity: S.value.q2 * (1 - 0.45 * w), transform: [{ translateX: 3.2 * shakeOf(w) }] };
  });
  const ring = useAnimatedStyle(() => {
    const u = q.correct ? phaseOf(ans.value, who.value, k) : 0;
    const a = clamp01(u / 0.5);
    const p = popOf(a);
    return { opacity: a > 0 ? 1 : 0, transform: [{ scaleX: 0.55 + 0.45 * p }, { scaleY: 0.4 + 0.6 * p }] };
  });
  const strike = useAnimatedStyle(() => {
    const u = !q.correct && who.value === k ? phaseOf(ans.value, who.value, k) : 0;
    const a = clamp01(u / 0.35);
    return { opacity: a > 0 ? 1 : 0, transform: [{ scaleX: a }] };
  });
  return (
    <Animated.View style={[styles.row, { top: k * ROW_H + 2 }, row]}>
      <View style={styles.rowRule} />
      <Text style={styles.rowText}>{q.label}</Text>
      <Animated.View style={[styles.rowRing, ring]} />
      <Animated.View style={[styles.rowStrike, strike]} />
    </Animated.View>
  );
}

function Slate({ S, picked, live }: { S: SharedValue<any>; picked: string | null; live: boolean }) {
  const sketch = useAnimatedStyle(() => ({ opacity: 1 - S.value.q2 }));
  const { ans, who } = useAnswer(picked, live, METHOD_Q.map((q) => q.id));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.sketch, sketch]}>
        <Text style={styles.chalkHead}>WHICH FIRST?</Text>
        <View style={styles.sketchRow}>
          <View style={[styles.chalkBall, styles.chalkBallBig]} />
          <Text style={styles.chalkVs}>or</Text>
          <View style={[styles.chalkBall, styles.chalkBallSmall]} />
        </View>
      </Animated.View>
      {METHOD_Q.map((q, k) => <ChalkRow key={q.id} k={k} ans={ans} who={who} S={S} />)}
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Q1: the iron ball, the tennis ball, and the chalk line between their marks. Both balls
 * are held out in FRONT of him, side by side, so the iron ball's name sits on a plate
 * behind him with a hairline to the ball (`DropLeader`, drawn under him); the tennis ball's
 * plate sits just past it. No two targets touch. Each name is a struck plate on a ledge in
 * the lesson's colour; picked wrong, it shakes its head and tips off level; the right one
 * pops and settles, and the chalk line between the two marks is drawn in under it.
 */
const DROP_Q = [
  { id: 'heavy', label: 'HEAVY', left: 192, top: 402, w: 47, h: 16, labelLeft: 2, labelW: 39, correct: false },
  { id: 'light', label: 'LIGHT', left: 272, top: 401, w: 56, h: 18, labelLeft: 15, labelW: 38, correct: false },
  { id: 'both', label: 'BOTH TOGETHER', left: (HEAVY_X + LIGHT_X) / 2 - 48, top: 507, w: 96, h: 12, labelLeft: 2, labelW: 92, correct: true },
];
/** The hairline from the HEAVY plate to the iron ball, behind the helper who holds it. */
function DropLeader({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return <Animated.View style={[styles.leader, fade]} pointerEvents="none" />;
}
function DropTag({ k, ans, who, S }: { k: number; ans: SharedValue<number>; who: SharedValue<number>; S: SharedValue<any> }) {
  const q = DROP_Q[k];
  const st = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    if (q.correct) {
      const s = u > 0 ? popOf(Math.min(1, u * 1.4)) : 1;
      return { opacity: S.value.q1, transform: [{ translateY: -2.5 * clamp01(u * 3) }, { scale: u > 0 ? 0.85 + 0.15 * s : 1 }] };
    }
    const w = who.value === k ? u : 0;
    return {
      opacity: S.value.q1 * (1 - 0.35 * w),
      transform: [{ translateX: 3 * shakeOf(w) }, { translateY: 2.5 * w }, { rotate: `${(k === 0 ? -9 : 9) * w}deg` }],
    };
  });
  return (
    <Animated.View
      style={[styles.tag, { left: q.left + q.labelLeft, top: q.top + (q.h - 12) / 2, width: q.labelW }, st]}
      pointerEvents="none"
    >
      <Text style={styles.tagText}>{q.label}</Text>
    </Animated.View>
  );
}
function DropTags({ picked, live, S }: { picked: string | null; live: boolean; S: SharedValue<any> }) {
  const { ans, who } = useAnswer(picked, live, DROP_Q.map((q) => q.id));
  return <>{DROP_Q.map((q, k) => <DropTag key={q.id} k={k} ans={ans} who={who} S={S} />)}</>;
}
function DropTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {DROP_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

function MethodTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {METHOD_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + ROW.left, top: SLATE.top + k * ROW_H + 2, width: ROW.w, height: ROW.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  chalkStroke: {
    position: 'absolute', width: 9, height: 1.4, borderRadius: 0.7, backgroundColor: PAPER_LIT,
  },
  chalkJoin: {
    position: 'absolute', left: HEAVY_X + 5, top: LAND_Y + 0.3, width: LIGHT_X - HEAVY_X - 10, height: 1.4,
    borderRadius: 0.7, backgroundColor: PAPER_LIT,
  },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 1,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  sketch: { alignItems: 'center', gap: 4 },
  sketchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // AQ2: Caveat's letters draw up to 0.23 em past their advance, so each chalk word is
  // given a content box wider than its ink, the words centred in it.
  chalkHead: {
    width: 100, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkVs: {
    width: 18, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 14, lineHeight: 16, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkBall: { borderWidth: 1.6, borderColor: PAPER_LIT },
  chalkBallBig: { width: 18, height: 18, borderRadius: 9 },
  chalkBallSmall: { width: 11, height: 11, borderRadius: 5.5 },
  clear: { flexGrow: 1 },
  ballShadow: {
    position: 'absolute', left: 0, top: LAND_Y - 1.6, height: 3.2, borderRadius: 1.6, backgroundColor: STONE, borderWidth: 0.8, borderColor: INK,
  },
  leader: {
    position: 'absolute', left: 239, top: HELD_Y - 0.5, width: HEAVY_X - HEAVY_D / 2 - 239, height: 1, backgroundColor: INK,
  },
  // A name plate is STRUCK (group AG): a white face with a lit top edge, standing on a hard
  // ledge in the lesson's own colour, with a rounded corner a third of its height.
  tag: {
    position: 'absolute', height: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2, borderColor: INK,
    boxShadow: `inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 2.5px 0px ${TONE.SHADE}, 0px 3.5px 0px rgba(26, 26, 26, 0.14)`,
  },
  tagText: {
    alignSelf: 'stretch', textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  // A chalk row on the slate: its words, a faint chalk rule round it, and the two marks the
  // answer chalks over it — a ring for the right one, a stroke through a wrong one.
  row: { position: 'absolute', left: ROW.left, width: ROW.w, height: ROW.h, justifyContent: 'center' },
  rowRule: {
    ...StyleSheet.absoluteFill, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  rowText: {
    alignSelf: 'stretch', textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 12.5, lineHeight: 14, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  rowRing: {
    position: 'absolute', left: -1.5, top: -2, right: -1.5, bottom: -2, borderRadius: 11,
    borderWidth: 1.8, borderColor: PAPER_LIT,
  },
  rowStrike: {
    position: 'absolute', left: 8, right: 8, top: ROW.h / 2 - 0.9, height: 1.8, borderRadius: 0.9,
    backgroundColor: PAPER_LIT, transformOrigin: '0% 50%',
  },
});

export function Sci1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci1Scene} band={[312, 520]} camera={CAM} />;
}
