import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './psych1Script';
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
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { carafe, coffeeCup, tentCard, menuBoard, cafeCounter, tint, window as windowArt } from './objects';
import { BY_ID } from './wardrobe';
import { DEEP, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-1, "What Is Psychology?" — A CAFÉ COUNTER, A TASTE TEST.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The taster (plain) is sure he can tell cheap coffee from good; the server (the
// bun) stands a label by each of two cups poured from ONE pot; the psychologist (the
// top hat) walks in and turns the mistake into the subject.
//
//   b0   the taster walks up to the end of the counter and lays a hand on it; the
//        server comes along behind the counter to serve him.
//   b1   she lifts two table tents from under the counter, stands BARGAIN by the
//        left cup, walks along and stands GOLD by the right one.
//   b2   he steps in between the cups, sips the gold one, sips the other, and pushes
//        the bargain cup away; she goes back to her pot.
//   b3   she lifts the one coffee pot to show it, and sets it down.
//   b4   the psychologist walks in from the left, tips his hat and points at the
//        taster's head; the taster turns to him.
//   b5   Q1: the pot, the gold cup and the GOLD tent — tap one.
//   b6   the psychologist taps his own head, then opens a hand to the taster.
//   b7   the taster walks away from the counter and folds his arms, his back to it.
//   b8   behind his back the server swaps the two tents: GOLD to the left cup,
//        BARGAIN to the right.
//   b9   Q2: the menu board is wiped to three chalk choices — tap one. The taster
//        walks back to the cups; the server goes back to her pot.
//   b10  he sips both again and keeps the cup now labelled GOLD.
//   b11  he sips it contentedly under the quotation.
//
// COMPOSITION, in stage units: the café counter 150–392 × 477–500, its wooden top
// at his HIP (AP10), with the server BEHIND it (home 350) and her pot at its right
// end (376). On its top, left to right: the left tent 156–212, the left cup 228, the
// right cup 264, the right tent 280–336. The taster tastes standing IN FRONT of the
// counter at 246, exactly between the cups, so each hand reaches one (the rig's safe
// reach at this scale is ~23 units from the shoulder: 18 to each cup). The tents
// stand OUTSIDE the cups so nothing crosses a word. The hung chalk menu 238–388 ×
// 316–396 is on the wall above her. The psychologist stands at 64 and the taster
// waits at 138 (b0–b1) and 124 (b7–b8), off the counter's end. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, psychology-foundations-1), longer where the walking and
 * the handling need it — b1 (5.36s line), b2 (3.84), b7 (4.00), b8 (6.65) and b10
 * (5.08) run a little past their lines.
 */
const LINES = [4.79, 6, 5.2, 5.2, 7.04, 0, 8.27, 4.86, 9.2, 0, 5.4, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// hands on the hips, arms folded, counting the points.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const HIPS = 163;
const FOLD = 161;
const COUNT = 168;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOAST = is('boast');
const A_POUR = is('pour');
const A_TASTE = is('taste');
const A_REVEAL = is('reveal');
const A_ARRIVE = is('arrive');
const A_DEFINE = is('define');
const A_METHOD = is('method');
const A_AGAIN = is('again');
const A_REST = is('rest');
const SWAP = BEATS.map((b) => (b.swap ? 1 : 0));
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));

/** Where each of them stands, beat by beat. The psychologist is off the stage until b4. */
const PL_X = [138, 138, 246, 246, 246, 246, 246, 124, 124, 246, 246, 246, 246];
const TH_X = BEATS.map((b) => (b.th ? 64 : -40));
/** The server: where she walks to at a beat's start (b1 and b8 walk on within the beat, LEGS). */
const CP_X = [206, 206, 350, 350, 350, 350, 350, 350, 324, 350, 350, 350, 350];
/** Which way each faces once there. The taster turns to the psychologist from b4. */
const PL_D = [1, 1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1, 1];
const TH_D = BEATS.map(() => 1);
const CP_D = BEATS.map(() => -1);
/**
 * The server's walks WITHIN a beat, after any walk at its start: [from, to, start s,
 * end s, facing after]. Each lasts at least its distance at WALK_SPEED (56 u/s).
 */
const NO_LEGS: number[][] = [];
const LEGS: number[][][] = BEATS.map((_, n) => (
  n === 1 ? [[206, 290, 3.0, 4.55, -1]]
    : n === 8 ? [[324, 206, 1.7, 3.85, -1], [206, 290, 5.2, 6.75, -1]]
      : NO_LEGS
));
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PL_P = [TALK, HIPS, TALK, LISTEN, LISTEN, FOLD, NOD, FOLD, LISTEN, LISTEN, LISTEN, LISTEN, LISTEN];
const TH_P = [LISTEN, LISTEN, LISTEN, LISTEN, EXPLAIN, LISTEN, EXPLAIN, LISTEN, COUNT, LISTEN, NOD, LISTEN, LISTEN];
const CP_P = [LISTEN, TALK, LISTEN, TALK, LISTEN, FOLD, NOD, LISTEN, LISTEN, LISTEN, TALK, LISTEN, LISTEN];

// ── the counter and what is on it ────────────────────────────────────────────
const TOP = 477;                                   // the counter's top, at his hip
const CUP_L = 228;
const CUP_R = 264;
const CUP_Y = TOP - 8.5;
/** Where the left cup ends up after he pushes it away on b2. */
const PUSHED = 224;
const TENT_W = 56;
const TENT_H = 24;
const TENT_Y = TOP - TENT_H / 2;
const SPOT_L = 184;
const SPOT_R = 308;
const POT_AT = { x: 376, y: TOP - 15 };
/** The pot's handle, and where the pot's centre sits from a hand holding it. */
const POT_GRIP = { x: 366, y: 460 };
const POT_OFF = { x: POT_AT.x - POT_GRIP.x, y: POT_AT.y - POT_GRIP.y };
/** A hand holding a tent holds it by its ridge. */
const TENT_OFF = 9;
const CUP_OFF = 3;
/** The hung menu, and the slate inside its frame. */
const SLATE = { left: 248, top: 330, w: 130, h: 55 };

// Deep enough to run a little below the ground line, so her feet never show under it.
const COUNTER_ART = cafeCounter(271, TOP + 13, 242, 26);
/** The café's window on the left-hand wall. */
const WINDOW_ART = windowArt(92, 354, 72, 68);
const MENU_ART = menuBoard(313, 356, 150, 80);
// The things that move are drawn about their own centre and carried by a rider.
const POT_ART = carafe(0, 0, 26, 30);
const CUP_ART = coffeeCup(0, 0, 22, 17);
const GOLD_ART = tint(tentCard(0, 0, TENT_W, TENT_H), 'brass');
const BARGAIN_ART = tint(tentCard(0, 0, TENT_W, TENT_H), 'apple');

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteAny(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteAnyLive(code, t, bt);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
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
 * A sip: the hand goes to the cup, takes it, lifts it to the mouth, holds it there,
 * and puts it back where it was — or, with `keep`, brings it to the chest and keeps
 * it. Returns the pose and how much of the cup is in the hand (0 on the counter).
 * Timed in seconds from `a`: it takes 1.5s, or 1.2s to the chest.
 */
function sip(s: Stance, x: number, dir: number, which: 1 | -1, cx: number, a: number, b: number, keep: boolean) {
  'worklet';
  const reach = sm(b, a, a + 0.25);
  const w = sm(b, a + 0.25, a + 0.35) * (keep ? 1 : 1 - sm(b, a + 1.2, a + 1.3));
  const up = sm(b, a + 0.35, a + 0.65) * (1 - sm(b, a + 0.9, a + 1.2));
  const chest = keep ? sm(b, a + 0.9, a + 1.2) : 0;
  const away = keep ? 0 : sm(b, a + 1.3, a + 1.5);
  const gx = cx;
  const gy = CUP_Y - CUP_OFF;
  const mx = x + 9 * dir;
  const my = 441;
  const hx = lerp(lerp(gx, mx, up), x + 8 * dir, chest);
  const hy = lerp(lerp(gy, my, up), 454, chest);
  return { s: hand(s, x, dir, which, hx, hy, reach * (1 - away)), w };
}
/**
 * The server's walks inside a beat, after the walk at its start. Returns where she is,
 * which way she faces and her stance, all continuous across the leg's ends.
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

const CAM = followMoves(PL_X, BEATS.map(kindOf), seedOf('psychology'));

export default function Psych1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldPl = useHeld();
  const heldTh = useHeld();
  const heldCp = useHeld();
  const cv = useCarry(16);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the taster ──────────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, -30);
    const dSrc0 = carrySource(cv, 11, n, PL_D[0]);
    const wp = walkOf(src0, dSrc0, PL_X, PL_D, PL_P, n, t, b);
    const xPl = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    const dPl = carry(cv, 11, n, wp.dirV, wp.dirV, 1);
    let sp = wp.s;
    let cupRW = 0;
    let cupLW = 0;
    // b0: a hand laid on the end of the counter once he is there
    if (A_BOAST[n]) sp = hand(sp, xPl, dPl, 1, 152, 471, sm(b, wp.walkDur + 0.05, wp.walkDur + 0.4));
    // b2: the gold cup first, then the other, then the bargain cup pushed away
    let pushL = 0;
    if (A_TASTE[n]) {
      const a = wp.walkDur + 0.05;
      const r = sip(sp, xPl, dPl, 1, CUP_R, a, b, false);
      sp = r.s;
      cupRW = r.w;
      const l = sip(sp, xPl, dPl, -1, CUP_L, a + 1.2, b, false);
      sp = l.s;
      cupLW = l.w;
      pushL = sm(b, a + 2.75, a + 3.05);
      sp = hand(sp, xPl, dPl, -1, CUP_L + 6 - 4 * pushL, CUP_Y - 2, sm(b, a + 2.6, a + 2.75) * (1 - sm(b, a + 3.1, a + 3.4)));
    }
    // b10: both again — and the one labelled GOLD, now the left, is kept
    if (A_AGAIN[n]) {
      const r = sip(sp, xPl, dPl, 1, CUP_R, 0.6, b, false);
      sp = r.s;
      cupRW = r.w;
      const l = sip(sp, xPl, dPl, -1, PUSHED, 1.9, b, true);
      sp = l.s;
      cupLW = l.w;
    }
    // b11, b12: he keeps it at his chest, and sips it once more under the quotation
    if (n > 10) {
      const up = A_REST[n] ? bp(0.25, 0.45, 0.7) : 0;
      sp = hand(sp, xPl, dPl, -1, lerp(xPl + 8 * dPl, xPl + 9 * dPl, up), lerp(454, 441, up), 1);
      cupLW = 1;
    }
    const prevPl = carryFrom(heldPl, n, hHold(PL_P[p], t));
    const figPl = keepHeld(heldPl, wp.walking ? mixKeepLegs(prevPl, sp, tr) : mixStance(prevPl, sp, tr));

    // ── the psychologist ────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const dSrc1 = carrySource(cv, 12, n, 1);
    const wt = walkOf(src1, dSrc1, TH_X, TH_D, TH_P, n, t, b);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    const dTh = carry(cv, 12, n, wt.dirV, wt.dirV, 1);
    let stp = wt.s;
    // b4: he tips his hat once he has arrived, then points at the taster's head
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      stp = hand(stp, xTh, dTh, 1, xTh + 5, GROUND - 76, bp(after + 0.03, after + 0.1, after + 0.2));
      stp = hand(stp, xTh, dTh, 1, xTh + 40, GROUND - 66, bp(0.58, 0.64, 0.84));
    }
    // b6: a tap on his own head, then an open hand out to the taster
    if (A_DEFINE[n]) {
      stp = hand(stp, xTh, dTh, 1, xTh + 4, GROUND - 68, bp(0.04, 0.12, 0.3));
      stp = hand(stp, xTh, dTh, 1, xTh + 40, GROUND - 48, bp(0.56, 0.66, 0.96));
    }
    // b8: a hand out toward the counter as he describes the swap
    if (A_METHOD[n]) stp = hand(stp, xTh, dTh, -1, xTh + 40, GROUND - 50, bp(0.36, 0.46, 0.66));
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, stp, tr) : mixStance(prevTh, stp, tr));

    // ── the server, behind her counter ──────────────────────────────────────
    const src2 = carrySource(cv, 2, n, 350);
    const dSrc2 = carrySource(cv, 13, n, -1);
    const wc = walkOf(src2, dSrc2, CP_X, CP_D, CP_P, n, t, b);
    // her walk starts from where she is on screen (src2), so it needs no carry of its own
    const xWalk = lerp(wc.xp, wc.xn, wc.walking ? wc.walkU : 1);
    const lg = legsOf(LEGS[n], xWalk, wc.dirV, wc.s, hLive(CP_P[n], t, b), b);
    const xCp = carry(cv, 2, n, lg.x, lg.x, 1);
    const dCp = carry(cv, 13, n, lg.d, lg.d, 1);
    let sc = lg.s;
    // the tents: 0 in her hand · 1 on the counter · 2 in her other hand · 3 on the
    // counter again. BARGAIN: right hand → the left spot → left hand → the right spot.
    // GOLD: left hand → the right spot → right hand → the left spot.
    let tentB = SWAP[n] ? 3 : n >= 2 ? 1 : 0;
    let tentG = SWAP[n] ? 3 : n >= 2 ? 1 : 0;
    let tentO = n >= 2 ? 1 : 0;
    let tentOG = n >= 2 ? 1 : 0;
    // chest: where a carried thing is held, in front of her
    const cx = xCp + 7 * dCp;
    if (A_POUR[n]) {
      // BARGAIN: her right hand dips under the counter, comes up with it and stands it
      // by the left cup; then she walks along (LEGS) and her left hand does the same
      // with GOLD by the right cup. Nothing is carried, so nothing crosses her body.
      const relB = sm(b, 2.65, 2.95);
      sc = hand(sc, xCp, dCp, 1, xCp + 8 * dCp, 488, sm(b, 1.5, 1.9) * (1 - relB));
      sc = hand(sc, xCp, dCp, 1, xCp + 10 * dCp, 452, sm(b, 1.9, 2.15) * (1 - relB));
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 2.2, 2.5) * (1 - relB));
      const relG = sm(b, 5.6, 5.9);
      sc = hand(sc, xCp, dCp, -1, xCp - 6 * dCp, 488, sm(b, 4.6, 4.9) * (1 - relG));
      sc = hand(sc, xCp, dCp, -1, xCp - 8 * dCp, 452, sm(b, 4.9, 5.15) * (1 - relG));
      sc = hand(sc, xCp, dCp, -1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 5.2, 5.45) * (1 - relG));
      tentB = sm(b, 2.5, 2.65);
      tentG = sm(b, 5.45, 5.6);
      tentO = sm(b, 2.14, 2.24);
      tentOG = sm(b, 5.14, 5.24);
    }
    // b3: the one pot, lifted by its handle to show it, and set down again
    let potW = 0;
    let potUp = 0;
    if (A_REVEAL[n]) {
      // (taken only once the beat's blend from the last pose is done, at TR, so the
      // hand really is on the handle when the pot starts to follow it)
      sc = hand(sc, xCp, dCp, -1, POT_GRIP.x, POT_GRIP.y, sm(b, 0.2, 0.8) * (1 - sm(b, 3.8, 4.1)));
      potW = sm(b, 0.88, 0.98) * (1 - sm(b, 3.7, 3.8));
      potUp = sm(b, 1.0, 1.5) * (1 - sm(b, 3.2, 3.7));
      sc = hand(sc, xCp, dCp, -1, POT_GRIP.x - 2 * potUp, POT_GRIP.y - 24 * potUp, potW);
    }
    // b8: the swap — GOLD taken from the right, carried along, BARGAIN lifted from the
    // left, GOLD set down in its place, BARGAIN carried back and set down on the right
    if (A_METHOD[n]) {
      sc = hand(sc, xCp, dCp, 1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 0.85, 1.25) * (1 - sm(b, 1.4, 1.7)));
      sc = hand(sc, xCp, dCp, 1, xCp + 14 * dCp, 458, sm(b, 1.4, 1.7) * (1 - sm(b, 4.5, 4.85)));
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 4.5, 4.85) * (1 - sm(b, 5.0, 5.3)));
      sc = hand(sc, xCp, dCp, -1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 3.85, 4.2) * (1 - sm(b, 4.35, 4.6)));
      sc = hand(sc, xCp, dCp, -1, xCp - 16 * dCp, 448, sm(b, 4.35, 4.6) * (1 - sm(b, 6.75, 7.05)));
      sc = hand(sc, xCp, dCp, -1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 6.75, 7.05) * (1 - sm(b, 7.2, 7.5)));
      tentG = 1 + sm(b, 1.25, 1.4) + sm(b, 4.85, 5.0);
      tentB = 1 + sm(b, 4.2, 4.35) + sm(b, 7.05, 7.2);
    }
    // b10: she points along the counter at the GOLD tent, then a hand to her chin
    if (A_AGAIN[n]) {
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - 12, bp(0.12, 0.22, 0.5));
      sc = hand(sc, xCp, dCp, 1, xCp - 5 * dCp, GROUND - 52, st(0.74, 0.84));
    }
    const prevCp = carryFrom(heldCp, n, hHold(CP_P[p], t));
    const moving = wc.walking || LEGS[n].length > 0;
    const figCp = keepHeld(heldCp, moving ? mixKeepLegs(prevCp, sc, tr) : mixStance(prevCp, sc, tr));

    // the cups: how far each is in the taster's hand, and where the left one rests
    const restL = n > 2 ? PUSHED : lerp(CUP_L, PUSHED, pushL);

    return {
      pl: pose(figPl, xPl, GROUND, K, dPl, 1),
      th: pose(figTh, xTh, GROUND, K, dTh, 1),
      cp: pose(figCp, xCp, GROUND, K, dCp, 1),
      tentB: carry(cv, 3, n, tentB, tentB, tr),
      tentG: carry(cv, 4, n, tentG, tentG, tr),
      tentO: carry(cv, 5, n, tentO, tentO, tr),
      tentOG: carry(cv, 15, n, tentOG, tentOG, tr),
      cupR: carry(cv, 6, n, cupRW, cupRW, tr),
      cupL: carry(cv, 7, n, cupLW, cupLW, tr),
      restL: carry(cv, 8, n, restL, restL, tr),
      potW: carry(cv, 9, n, potW, potW, tr),
      q1: carry(cv, 10, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 14, n, Q2[p], Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ObjectArt parts={MENU_ART} tone={TONE} />
      <Menu S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.bun.pieces} />
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <Tents S={SCENE} DC={DC} />
      <Pot S={SCENE} DC={DC} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Cups S={SCENE} DP={DP} />
      {on(Q1) ? <TasteTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <MethodTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the things on the counter, and the ones in people's hands ────────────────

type Place = SharedValue<{ x: number; y: number; o: number }>;
function Rider({ at, art, lift, children }: {
  at: Place; art: ReturnType<typeof carafe>; lift?: boolean; children?: React.ReactNode;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
      {children}
    </Animated.View>
  );
}

function wristOf(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** A tent's place for its track value: hand A · spot 1 · hand B · spot 2. */
function tentAt(u: number, a: { x: number; y: number }, s1: number, bh: { x: number; y: number }, s2: number) {
  'worklet';
  if (u <= 1) return { x: lerp(a.x, s1, u), y: lerp(a.y + TENT_OFF, TENT_Y, u) };
  if (u <= 2) return { x: lerp(s1, bh.x, u - 1), y: lerp(TENT_Y, bh.y + TENT_OFF, u - 1) };
  return { x: lerp(bh.x, s2, u - 2), y: lerp(bh.y + TENT_OFF, TENT_Y, u - 2) };
}

function Tents({ S, DC }: { S: SharedValue<any>; DC: SharedValue<Bundle> }) {
  const bargain = useDerivedValue(() => {
    const at = tentAt(S.value.tentB, wristOf(DC, 'wrR'), SPOT_L, wristOf(DC, 'wrL'), SPOT_R);
    return { ...at, o: S.value.tentO };
  });
  const gold = useDerivedValue(() => {
    const at = tentAt(S.value.tentG, wristOf(DC, 'wrL'), SPOT_R, wristOf(DC, 'wrR'), SPOT_L);
    return { ...at, o: S.value.tentOG };
  });
  return (
    <>
      <Rider at={bargain} art={BARGAIN_ART}>
        <Text style={styles.tentWord}>BARGAIN</Text>
      </Rider>
      <Rider at={gold} art={GOLD_ART}>
        <Text style={styles.tentWord}>GOLD</Text>
      </Rider>
    </>
  );
}

function Pot({ S, DC }: { S: SharedValue<any>; DC: SharedValue<Bundle> }) {
  const at = useDerivedValue(() => {
    const w = S.value.potW;
    const h = wristOf(DC, 'wrL');
    return { x: lerp(POT_AT.x, h.x + POT_OFF.x, w), y: lerp(POT_AT.y, h.y + POT_OFF.y, w), o: 1 };
  });
  return <Rider at={at} art={POT_ART} />;
}

function Cups({ S, DP }: { S: SharedValue<any>; DP: SharedValue<Bundle> }) {
  const right = useDerivedValue(() => {
    const w = S.value.cupR;
    const h = wristOf(DP, 'wrR');
    return { x: lerp(CUP_R, h.x, w), y: lerp(CUP_Y, h.y + CUP_OFF, w), o: 1 };
  });
  const left = useDerivedValue(() => {
    const w = S.value.cupL;
    const h = wristOf(DP, 'wrL');
    return { x: lerp(S.value.restL, h.x, w), y: lerp(CUP_Y, h.y + CUP_OFF, w), o: 1 };
  });
  return (
    <>
      <Rider at={left} art={CUP_ART} lift />
      <Rider at={right} art={CUP_ART} lift />
    </>
  );
}

// ── the hung menu: the coffees and their prices, and the three choices (Q2) ──

function Menu({ S }: { S: SharedValue<any> }) {
  const menu = useAnimatedStyle(() => ({ opacity: 1 - S.value.q2 }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.menuBlock, menu]}>
        <Text style={styles.chalkHead}>COFFEE</Text>
        <Text style={styles.chalkRow}>GOLD  £4</Text>
        <Text style={styles.chalkRow}>BARGAIN  £1</Text>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the pot, the gold cup and the GOLD tent. The label is what changed the taste. */
const TASTE_Q = [
  { id: 'pot', left: POT_AT.x - 14, top: POT_AT.y - 16, w: 28, h: 31, r: 8, correct: false },
  { id: 'cup', left: CUP_R - 11, top: TOP - 17, w: 22, h: 17, r: 6, correct: false },
  { id: 'label', left: SPOT_R - TENT_W / 2 + 2, top: TENT_Y - TENT_H / 2 - 1, w: TENT_W - 4, h: TENT_H + 1, r: 4, correct: true },
];
function TasteTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TASTE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the menu's three chalk choices. Swapping the labels is the test. */
const METHOD_Q = [
  { id: 'ask', label: 'ASK HIM', correct: false },
  { id: 'swap', label: 'SWAP THE LABELS', correct: true },
  { id: 'trust', label: 'TRUST HIS TASTE', correct: false },
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
          style={{ position: 'absolute', left: SLATE.left + 3, top: SLATE.top + k * ROW_H + 1, width: SLATE.w - 6, height: ROW_H - 2 }}
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
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  tentWord: {
    position: 'absolute', left: -24.9, top: -3.6, width: 43, height: 11, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, color: INK, includeFontPadding: false,
  },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  menuBlock: { alignItems: 'center' },
  chalkHead: {
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkRow: {
    fontFamily: 'Caveat_700Bold', fontSize: 13, lineHeight: 15, color: PAPER_LIT, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
  choice: {
    flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Psych1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych1Scene} band={[306, 514]} camera={CAM} />;
}
