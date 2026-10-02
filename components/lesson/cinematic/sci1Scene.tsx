import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
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
import {
  NATURAL, stepLadder, ironBall, tennisBall, yardWall, schoolSlate, patio, LADDER_TREADS, SLATE_FACE,
} from './objects';
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
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-1). b4's line is 2.48s and its
 * landing and bounces run to 2.6; b9's is 7.67s and the helper steps off the ladder
 * a little after it ends.
 */
const LINES = [3.11, 4.53, 4.62, 0, 2.69, 4.5, 4.62, 4.58, 0, 8.35, 0, 0];

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

const WALL_ART = yardWall(200, 448, 400, 104);
const PATIO_ART = patio(200, 508, 400, 16);
const SLATE_ART = schoolSlate(SL.x, SL.y, SL.w, SL.h);
const LADDER_ART = stepLadder(LAD.x, LAD.y, LAD.w, LAD.h);
// The things that move are drawn about their own centre and carried by a rider.
const HEAVY_ART = ironBall(0, 0, HEAVY_D, HEAVY_D);
const LIGHT_ART = tennisBall(0, 0, LIGHT_D, LIGHT_D);

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
    if (A_DROP[n]) {
      fallU = clamp01((b - REL) / FALL);
      const land = REL + FALL;
      const b1 = clamp01((b - land) / 0.34);
      const b2 = clamp01((b - land - 0.34) / 0.2);
      bounce = 11 * 4 * b1 * (1 - b1) + 3.5 * 4 * b2 * (1 - b2);
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
      <ObjectArt parts={WALL_ART} tone={TONE} />
      <ObjectArt parts={PATIO_ART} tone={TONE} />
      <ChalkMarks S={SCENE} />
      <ObjectArt parts={SLATE_ART} tone={TONE} />
      <Slate S={SCENE} />
      <ObjectArt parts={LADDER_ART} tone={TONE} />
      {on(Q1) ? <DropLeader S={SCENE} /> : null}
      {/* cast: cap */}
      <Stickman D={DH} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DS} k={K} role="lead" wear={[]} />
      <Balls S={SCENE} DH={DH} DT={DT} />
      {on(Q1) ? <DropTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <MethodTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the balls, in hands and out of them ──────────────────────────────────────

type Place = SharedValue<{ x: number; y: number; r: number }>;
function Rider({ at, art }: { at: Place; art: ReturnType<typeof ironBall> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r}rad` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function wristOf(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

function Balls({ S, DH, DT }: { S: SharedValue<any>; DH: SharedValue<Bundle>; DT: SharedValue<Bundle> }) {
  const heavy = useDerivedValue(() => {
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
    };
  });
  const light = useDerivedValue(() => {
    const v = S.value;
    const inH = wristOf(DH, 'wrR');
    const h = v.holdHL;
    // a ball that rolls turns: the distance rolled over its radius
    return {
      x: lerp(v.lightX, inH.x, h),
      y: lerp(v.lightY, inH.y + HOLD_OFF, h),
      r: (-v.lightRot * (LIGHT_X - ROLLED_X)) / (LIGHT_D / 2),
    };
  });
  return (
    <>
      <Rider at={heavy} art={HEAVY_ART} />
      <Rider at={light} art={LIGHT_ART} />
    </>
  );
}

// ── the chalk crosses on the paving where each ball will land ────────────────

function ChalkMarks({ S }: { S: SharedValue<any> }) {
  const line = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[HEAVY_X, LIGHT_X].map((x) => (
        <View key={x}>
          <View style={[styles.chalkStroke, { left: x - 4.5, top: LAND_Y + 0.3, transform: [{ rotate: '35deg' }] }]} />
          <View style={[styles.chalkStroke, { left: x - 4.5, top: LAND_Y + 0.3, transform: [{ rotate: '-35deg' }] }]} />
        </View>
      ))}
      {/* Q1's third choice: a chalk line joining the two marks — both together */}
      <Animated.View style={[styles.chalkJoin, line]} />
    </View>
  );
}

// ── the slate: the test chalked up, and the three rows for Q2 ────────────────

function Slate({ S }: { S: SharedValue<any> }) {
  const sketch = useAnimatedStyle(() => ({ opacity: 1 - S.value.q2 }));
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
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Q1: the iron ball, the tennis ball, and the chalk line between their marks. Both balls
 * are held out in FRONT of him now, side by side, so the iron ball's name sits on a plate
 * behind him with a hairline to the ball (`DropLeader`, drawn under him); the tennis ball's
 * plate sits just past it, inside its own target. No two targets touch.
 */
const DROP_Q = [
  { id: 'heavy', label: 'HEAVY', left: 192, top: 402, w: 47, h: 16, labelLeft: 2, labelW: 42, correct: false },
  { id: 'light', label: 'LIGHT', left: 272, top: 401, w: 56, h: 18, labelLeft: 15, labelW: 38, correct: false },
  { id: 'both', label: 'BOTH TOGETHER', left: (HEAVY_X + LIGHT_X) / 2 - 48, top: 507, w: 96, h: 12, labelLeft: 2, labelW: 92, correct: true },
];
/** The hairline from the HEAVY plate to the iron ball, behind the helper who holds it. */
function DropLeader({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return <Animated.View style={[styles.leader, fade]} pointerEvents="none" />;
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
          <View style={styles.clear}>
            <View style={[styles.tag, { left: q.labelLeft, width: q.labelW, top: (q.h - 12) / 2 }]}>
              <Text style={styles.tagText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the slate's three chalk rows. Testing it and looking is how science settles it. */
const METHOD_Q = [
  { id: 'argue', label: 'ARGUE LOUDER', correct: false },
  { id: 'test', label: 'TEST IT AND LOOK', correct: true },
  { id: 'ask', label: 'ASK THE OLDEST', correct: false },
];
const ROW_H = SLATE.h / 3;
function MethodTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {METHOD_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 3, top: SLATE.top + k * ROW_H + 2, width: SLATE.w - 6, height: ROW_H - 4 }}
        >
          <View style={styles.choice}>
            <Text style={styles.choiceText}>{q.label}</Text>
          </View>
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
    backgroundColor: NATURAL.slate.shade, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  sketch: { alignItems: 'center', gap: 4 },
  sketchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chalkHead: {
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkVs: {
    fontFamily: 'Caveat_700Bold', fontSize: 14, lineHeight: 16, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkBall: { borderWidth: 1.6, borderColor: PAPER_LIT },
  chalkBallBig: { width: 18, height: 18, borderRadius: 9 },
  chalkBallSmall: { width: 11, height: 11, borderRadius: 5.5 },
  clear: { flexGrow: 1 },
  leader: {
    position: 'absolute', left: 239, top: HELD_Y - 0.5, width: HEAVY_X - HEAVY_D / 2 - 239, height: 1, backgroundColor: INK,
  },
  tag: {
    position: 'absolute', height: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  choice: {
    flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Sci1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci1Scene} band={[312, 520]} camera={CAM} />;
}
