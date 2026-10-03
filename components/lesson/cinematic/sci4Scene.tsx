import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './sci4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, swingFrameBack, swingFrameFront, swingSeat, clipboard, stopwatch, pencil,
  SWING_PIVOTS, CLIPBOARD_SHEET, WATCH_DIAL,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-4, "Why Measure More Than Once?" — A PLAYGROUND SWING.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// TWO people talk and nobody narrates (AP13). The student (the bun) times the empty swing
// with a stopwatch and writes each time on her clipboard; the scientist (the top hat),
// standing at the swing, makes her time it again, and again.
//
//   b0   the swing is swinging; she stops her stopwatch as it comes back (3.0 on the
//        dial), reads it, lets the watch drop onto its wrist cord, takes the pencil
//        from the clip and writes 3.0 at the top of the sheet. He listens, nodding.
//   b1   he turns to the swing and steps in to it, catches the chain as it swings back
//        to him, holds it still, draws it back and lets it go; she lifts her stopwatch
//        and starts it as he lets go. He turns back to her.
//   b2   she stops it at 2.8, writes it, starts it again, stops at 3.1, writes that.
//   b3   he walks over to her; she holds the stopwatch out to him over the clipboard,
//        and he points at it on "your thumb on the button". The swing swings on, smaller.
//   b4   Q1: the swing, her stopwatch and the clipboard — tap one.
//   b5   she lowers the stopwatch; he points along her three times, one by one.
//   b6   she lifts the clipboard, writes 2.0 as the fourth time and holds the pencil's
//        point on it ("rub that one out?"), then puts the pencil back, still holding it up.
//   b7   he nods at the swing, walks back to it, takes the chain, draws it back and lets
//        it go; she starts the stopwatch as he lets go, and stops it after one swing.
//   b8   Q2: three of the times on her clipboard — 3.0, 2.8 and 2.0 — tap one.
//   b9   she lifts the clipboard, writes ≈3.0 at its foot and holds it up, pencil on it.
//   b10  … and at ease she puts the pencil back in the clip and lowers it.
//        The quotation; the swing slowing.
//
// COMPOSITION, in stage units. Sky to a hedge on the horizon at 446, mown grass 446–500
// and the dark rubber safety surface under the swing 58–206 × 486–500. The swing frame
// 57–199 × 362–500: the near A from its apex at (113, 378) to feet at 57 and 169, the far
// A behind it up to the apex at (143, 364), the top bar between them. The chains hang
// from (123.5, 373.6) and (132.5, 369.4), 104 long, so the seat rests at (128, 476), 24
// above the ground; it swings to ±0.28 rad (±29 units) and settles on its own clock
// (TAU). The scientist stands at 182, steps in to 170 to hold the chain (a hand at
// shoulder height on it, within the rig's ~23-unit reach at K 0.76), and walks to 264 —
// his head clear of her clipboard — to point at her stopwatch and along her times. The
// student stands at 318 facing left. Her clipboard, 280–312 × 433–499, is held out in
// front of her by its right edge in her back hand; the stopwatch and the pencil are in
// her front hand. She writes the four times one under another and the average at the
// foot (Caveat 11, 10.3pt as drawn); the first two lines stand 13.5 apart and the rest
// 11, so each of the three Q2 times carries a tap box 26 × 11 with 2.5 or more clear
// round it (AN4). To write she draws the board 2 in toward her and lifts it to the line
// (0, 0, 6, 14, 24), which keeps every pencil stroke inside her arm's reach. Band
// [306, 514].
//
// SIMPLE ON PURPOSE (AP7): two figures, never both walking, facing each other when they
// talk; the listener nods (N21) and the hands move only to hold, write, tap or point
// (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-4), except where the timing needs
 * longer and runs on after the line — b1 (the catch waits for the swing to come back),
 * b2 (two timings and two writings) and b7 (the walk, the push and one whole swing).
 */
const LINES = [3.6, 5.0, 7.6, 5.86, 0, 5.33, 4.57, 8.4, 0, 4.88, 0, 0];

// The held poses (moves.ts act + 99), with still hands (AP18).
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_TIME = is('time');
const A_SIGH = is('sigh');
const A_AGAIN = is('again');
const A_ERROR = is('error');
const A_AVERAGE = is('average');
const A_ODD = is('odd');
const A_CHECK = is('check');
const A_DONE = is('done');
const ROWS = BEATS.map((b) => b.rows ?? 0);
const Q1 = BEATS.map((b) => (b.spread ? 1 : 0));
const Q2 = BEATS.map((b) => (b.outlier ? 1 : 0));
const AGAIN_N = A_AGAIN.indexOf(1);
const ERROR_N = A_ERROR.indexOf(1);
const CHECK_N = A_CHECK.indexOf(1);
const DONE_N = A_DONE.indexOf(1);

/** What each is doing with the body: talking while he speaks, nodding while the other does. */
const TH_P = [NOD, EXPLAIN, NOD, EXPLAIN, WAIT, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, WAIT, LISTEN];
const BN_P = [TALK, NOD, TALK, NOD, WAIT, NOD, TALK, NOD, WAIT, TALK, WAIT, LISTEN];

// ── the swing ────────────────────────────────────────────────────────────────
const FRAME = { x0: 57, y0: 362, w: 142, h: 138 };
const PN = { x: FRAME.x0 + SWING_PIVOTS.near.x, y: FRAME.y0 + SWING_PIVOTS.near.y };
const PF = { x: FRAME.x0 + SWING_PIVOTS.far.x, y: FRAME.y0 + SWING_PIVOTS.far.y };
/** The chains' length: a seat 24 above the ground. A 2.2 m chain swings in 3 s. */
const CH = 104;
/** One whole swing, there and back, in seconds — what she is timing. */
const PERIOD = 3.0;
const OMEGA = (2 * Math.PI) / PERIOD;
/** How far he draws it back before letting go, in radians, and how fast it settles. */
const A0 = 0.28;
const TAU = 14;
/** Where his hand takes the chain: this far down it, about his shoulder's height. */
const GRAB = 84;
/** Where the scientist stands: at home, in at the chain, and by her. */
const TH_HOME = 182;
const TH_IN = 170;
const TH_HER = 264;

// ── the student, her clipboard, stopwatch and pencil ────────────────────────
const BN_X = 318;
const BN_D = -1;
/** The clipboard's left edge and top when she holds it at rest, and its size. */
const BX = BN_X + 38 * BN_D;
const BY0 = 433;
const BOARD = { w: CLIPBOARD_SHEET.of.w, h: CLIPBOARD_SHEET.of.h };
const GRIP = CLIPBOARD_SHEET.grip;
/**
 * Where she writes the four times on the sheet, one under another in the order she takes
 * them, and the average at the foot: the top of each line (11 tall, its figures about 7
 * tall, Caveat 11). The first two lines stand 13.5 apart so that the tap boxes round 3.0
 * and 2.8 — the line itself, 26 × 11 — keep 2.5 between them (AN4); the rest are 11 apart.
 */
const LINES_Y = [9.6, 23.1, 34.1, 45.1, 56.2];
const LINE_H = 11;
const LINE_X = 2.4;
const LINE_W = 26;
/** The figures are written from the line's left, as a list is: away from her forearm. */
const TEXT_PAD = 0.6;
const TIMES = ['3.0 s', '2.8 s', '3.1 s', '2.0 s'];
/** The width each line's figures set at, Caveat 11: a time, and the average. */
const GLYPH_W = 18.6;
const AVG_W = 17;
/**
 * How far she lifts the clipboard to bring each line to her pencil (her arm is short and
 * the board is long), and how far she draws it in toward her to write on it.
 */
const RISE = [0, 0, -6, -14, -24];
const PULL = 2;
/** Where her front hand holds the stopwatch: up to time with, out to show, and at rest. */
const UP = { x: BN_X + 10 * BN_D, y: 442 };
// Held out at the top of the board and no lower, so the forearm stays clear of the
// first line of times written just under it (check:readable STRIKE on "3.0 s").
const SHOW = { x: BN_X + 16 * BN_D, y: 427 };
const REST = { x: BN_X, y: 476 };
/** The stopwatch, drawn hanging from the top of its cord; its dial's centre below that. */
const WATCH = { w: 9, h: 16.7 };
const DIAL = { y: (WATCH_DIAL.y * WATCH.h) / WATCH_DIAL.of.h, r: (WATCH_DIAL.r * WATCH.w) / WATCH_DIAL.of.w };
/** Held in the palm, the case sits just above the wrist; hanging, the cord's top is at it. */
const PALM_DY = -3 - DIAL.y;
const HANG_DY = 1;
/** The pencil, drawn about where it is held — 10 from its point, 4 from its end. */
const PEN = { l: 14, t: 2.6, grip: 10 };
/** Held to write, it slants 45° down toward the paper: the hand is up and back from the point. */
const PEN_OFF = { x: -0.7071 * PEN.grip * BN_D, y: -0.7071 * PEN.grip };
const PEN_SLANT = 45 * BN_D;
/** Lying in the clip, its grip point, from the board's left and top. */
const PEN_CLIP = { x: 19, y: 7.6 };

const FRONT_ART = swingFrameFront(FRAME.x0 + FRAME.w / 2, FRAME.y0 + FRAME.h / 2, FRAME.w, FRAME.h);
const BACK_ART = swingFrameBack(FRAME.x0 + FRAME.w / 2, FRAME.y0 + FRAME.h / 2, FRAME.w, FRAME.h);
// The things that move are drawn about the point they are held or hung by.
const SEAT_ART = swingSeat(0, 0, 16, 16);
const BOARD_ART = clipboard(BOARD.w / 2 - GRIP.x, BOARD.h / 2 - GRIP.y, BOARD.w, BOARD.h);
const WATCH_ART = stopwatch(0, WATCH.h / 2, WATCH.w, WATCH.h);
const PEN_ART = pencil(PEN.l / 2 - PEN.grip, 0, PEN.l, PEN.t);

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Eased 0 → 1 over [a, z] SECONDS of the beat — for what is timed by the swing. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** The same, unswept: one speed, for a pencil going along a row. */
function lin(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  return u < 0 ? 0 : u > 1 ? 1 : u;
}
/** How far the swing still swings, `since` seconds after it was let go. */
function ampAfter(since: number): number {
  'worklet';
  const a = since < 0 ? A0 : A0 * Math.exp(-since / TAU);
  return a < 0.004 ? 0 : a;
}
/** A point `g` down the near chain when the swing hangs at angle `th`. */
function chainAt(th: number, g: number) {
  'worklet';
  return { x: PN.x + g * Math.sin(th), y: PN.y + g * Math.cos(th) };
}
/** Where the pencil's point starts on time `r` (4: the average) of a board whose top is at `by`. */
function rowTip(r: number, by: number, bx: number) {
  'worklet';
  return { x: bx + LINE_X + TEXT_PAD, y: by + LINES_Y[r] + 7 };
}

/**
 * ONE WRITING, from the hand's place `from` to `to`: the stopwatch is let drop onto its
 * cord, the pencil is taken out of the clip, the time is written along ONCE (AR5, a path,
 * never a scribble), the pencil goes back in the clip and the hand goes on. Her other hand
 * draws the clipboard in toward her and up while she writes (PULL, RISE), so the line is
 * inside her reach, and lets it back down after unless she is to hold it `up`. `keep`
 * holds the pencil's point just off the line's end that long before it goes back
 * (pointing at it). Times in seconds from `t0`.
 */
function writing(
  b: number, t0: number, r: number, from: { x: number; y: number }, to: { x: number; y: number },
  hang0: number, hang1: number, keep: number, up: boolean,
) {
  'worklet';
  const s = b - t0;
  const back = 1.35 + keep;
  const into = sm(s, 0, 0.35);
  const out = sm(s, back + 0.4, back + 0.7);
  const pullV = PULL * into * (1 - out);
  const liftV = RISE[r] * into * (up ? 1 : 1 - out);
  const bx = BX - pullV * BN_D;
  const by = BY0 + liftV;
  const len = r > 3 ? AVG_W : GLYPH_W;
  const clip = { x: bx + PEN_CLIP.x, y: by + PEN_CLIP.y };
  const tip0 = rowTip(r, by, bx);
  const g0 = { x: tip0.x + PEN_OFF.x, y: tip0.y + PEN_OFF.y };
  const g1 = { x: g0.x + len, y: g0.y };
  const u1 = sm(s, 0, 0.35);
  const u2 = sm(s, 0.45, 0.75);
  const u3 = lin(s, 0.75, 1.35);
  const u4 = sm(s, back, back + 0.3);
  const u5 = sm(s, back + 0.4, back + 0.7);
  // the hand's path: to the clip, to the row's start, along it, back to the clip, on
  let x = lerp(from.x, clip.x, u1);
  let y = lerp(from.y, clip.y, u1);
  x = lerp(x, g0.x, u2);
  y = lerp(y, g0.y, u2);
  x = lerp(x, g1.x, u3);
  // pointing: the point lifts just off the row's end and rests there
  const pt = keep > 0 ? sm(s, 1.35, 1.55) * (1 - sm(s, back - 0.1, back)) : 0;
  y -= 2 * pt;
  x = lerp(x, clip.x, u4);
  y = lerp(y, clip.y, u4);
  x = lerp(x, to.x, u5);
  y = lerp(y, to.y, u5);
  const pen = sm(s, 0.33, 0.45) * (1 - sm(s, back + 0.28, back + 0.4));
  const rot = PEN_SLANT * (u2 * (1 - u4));
  const hang = s < 0.4 ? lerp(hang0, 1, sm(s, 0, 0.25)) : lerp(1, hang1, sm(s, back + 0.5, back + 0.7));
  return { x, y, hang, pen, rot, rev: u3, pull: pullV, lift: liftV, end: t0 + back + 0.7 };
}

/**
 * Where a figure stands at time `b` of a beat (seconds), walking its legs in turn: a
 * leg is [start s, x]. He starts from WHERE HE IS ON SCREEN (`src`, out of the carry),
 * and a leg never starts before the one before it has finished (group L).
 */
function legsOf(src: number, legs: readonly (readonly number[])[], b: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0], free);
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking };
}
/** Which way a figure faces at time `b` (seconds), turning through a profile from its screen facing. */
function faceOf(src: number, turns: readonly (readonly number[])[], b: number) {
  'worklet';
  let from = src;
  let d = src;
  for (let k = 0; k < turns.length; k += 1) {
    const at = turns[k][0];
    if (b < at) break;
    d = facing(from, turns[k][1], b - at);
    from = turns[k][1];
  }
  return d;
}
/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

const CAM = followMoves(BEATS.map(() => TH_HOME), BEATS.map(kindOf), seedOf('science'));

export default function Sci4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(17);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    /** A quicker blend, for what moves on the swing's own clock. */
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
    /** The clock at the moment this beat began: what a release time is measured against. */
    const T0 = t - b;

    // ── when the swing was last let go, and what it does on this beat ───────
    // `rel` is the clock time of the last release: the swing hangs at A0 then and
    // swings on cos(ω(t − rel)), dying away over TAU. A beat that lets it go again
    // writes a new one, which the beats after read back from the carry.
    const relSrc = carrySource(cv, 1, n, 0);
    let catchAt = -1;
    let letGo = -1;
    let thCatch = 0;
    if (A_SIGH[n]) {
      // AP18: the catch waits for the swing to come back to him — the next time it is at
      // its far end, read off the clock it is swinging on — so his hand meets the chain
      // there instead of chasing it.
      const k = Math.ceil((T0 + 0.75 - relSrc) / PERIOD);
      catchAt = relSrc + k * PERIOD - T0;
      thCatch = ampAfter(T0 + catchAt - relSrc);
      letGo = catchAt + 1.1;
    }
    if (A_CHECK[n]) {
      catchAt = 0.6 + moveTr(TH_HER, TH_IN, TR) + 0.4;
      const since = T0 + catchAt - relSrc;
      thCatch = ampAfter(since) * Math.cos(OMEGA * since);
      letGo = catchAt + 1.2;
    }
    const relNow = letGo >= 0 ? T0 + letGo : relSrc;
    const rel = carry(cv, 1, n, relNow, relNow, 1);
    const sinceRel = t - rel;
    const thFree = ampAfter(sinceRel) * Math.cos(OMEGA * sinceRel);

    // ── the scientist ───────────────────────────────────────────────────────
    let legs: number[][] = [[0, TH_HOME]];
    let turns: number[][] = [[0, 1]];
    if (A_SIGH[n]) {
      legs = [[0, TH_IN], [letGo + 0.35, TH_HOME]];
      turns = [[0, -1], [letGo + 0.25, 1]];
    } else if (A_ERROR[n]) {
      legs = [[0.25, TH_HER]];
    } else if (A_CHECK[n]) {
      legs = [[0.6, TH_IN], [letGo + 0.35, TH_HOME]];
      turns = [[0.3, -1], [letGo + 0.25, 1]];
    } else if (n > ERROR_N && n < CHECK_N) {
      legs = [[0, TH_HER]];
    }
    const wt = legsOf(carrySource(cv, 2, n, TH_HOME), legs, b);
    const xT = carry(cv, 2, n, wt.x, wt.x, 1);
    const dT = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), turns, b), 1);
    let stt = wt.walking
      ? travelStance(wt.x0, wt.x1, hHold(TH_P[n], t), hHold(TH_P[n], t), hLive(TH_P[n], t, b), wt.u, WALK, 0)
      : hLive(TH_P[n], t, b);
    // b1, b7: his front hand goes out to where the chain will be, takes it, draws the
    // swing back to A0 and lets go; the swing follows his hand (below) until it does
    let hold = 0;
    if (catchAt >= 0) {
      const reach = sm(b, catchAt - 0.5, catchAt) * (1 - sm(b, letGo + 0.05, letGo + 0.5));
      const thHand = lerp(thCatch, A0, sm(b, catchAt + 0.1, catchAt + 0.75));
      const c = chainAt(thHand, GRAB);
      stt = hand(stt, xT, dT, 1, c.x, c.y, reach);
      hold = sm(b, catchAt - 0.06, catchAt + 0.06) * (1 - sm(b, letGo - 0.03, letGo + 0.07));
    }
    // b3: he points at the stopwatch she holds out, on "your thumb on the button" (it is
    // past his reach from where his head stays clear of her clipboard, so he points)
    if (A_ERROR[n]) stt = hand(stt, xT, dT, 1, SHOW.x - 2, SHOW.y + PALM_DY + DIAL.y - 1, bp(0.72, 0.8, 0.93));
    // b5: a pointing hand over her three times in the order she took them, and away (the
    // clipboard is past his reach, so the hand points along them rather than touching)
    if (A_AVERAGE[n]) {
      const a = rowTip(0, BY0, BX);
      const c = rowTip(1, BY0, BX);
      const e = rowTip(2, BY0, BX);
      const u1 = st(0.18, 0.36);
      const u2 = st(0.4, 0.58);
      const fx = lerp(lerp(a.x + 5, c.x + 5, u1), e.x + 5, u2);
      const fy = lerp(lerp(a.y - 2, c.y - 2, u1), e.y - 2, u2);
      stt = hand(stt, xT, dT, 1, fx, fy, st(0.08, 0.18) * (1 - st(0.64, 0.78)));
    }
    // b7: a nod at the swing as he turns to it
    if (A_CHECK[n]) stt = { ...stt, neck: stt.neck - 0.16 * bp(0.06, 0.12, 0.2) };
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));
    const th = pose(figT, xT, GROUND, K, dT, 1);

    // ── the swing: free, or in his hand ─────────────────────────────────────
    const wTR = wristOf(th, 'wrR');
    const thHeld = Math.atan2(wTR.x - PN.x, wTR.y - PN.y);
    const theta = carry(cv, 0, n, thFree, lerp(thFree, thHeld, hold), trq);

    // ── the student ─────────────────────────────────────────────────────────
    let sb = hLive(BN_P[n], t, b);
    // the hand that holds the stopwatch, and the stopwatch itself: 0 in her palm, 1
    // hanging from her wrist on its cord; the pencil: 0 in the clip, 1 in her hand
    let hx = REST.x;
    let hy = REST.y;
    let hang = 1;
    let pen = 0;
    let rot = 0;
    let pull = 0;
    let liftNow = 0;
    const rev = [ROWS[n] >= 1 ? 1 : 0, ROWS[n] >= 3 ? 1 : 0, ROWS[n] >= 3 ? 1 : 0, ROWS[n] >= 4 ? 1 : 0, n > DONE_N ? 1 : 0];
    // seconds on the stopwatch's dial, and how far her head bends to the watch or the paper
    let secs = n > CHECK_N ? 3.0 : n > AGAIN_N ? 3.1 : 3.0;
    let look = 0;
    if (A_TIME[n]) {
      // the stopwatch stopped as the swing comes back, read, and the time written down
      secs = Math.min(2.7 + b, 3.0);
      look = -0.2 * sm(b, 0.25, 0.4) * (1 - sm(b, 0.7, 0.85));
      const w = writing(b, 0.9, 0, UP, REST, 0, 1, 0, false);
      hx = w.x; hy = w.y; hang = w.hang; pen = w.pen; rot = w.rot; pull = w.pull; liftNow = w.lift; rev[0] = w.rev;
      look -= 0.26 * sm(b, 1.0, 1.3) * (1 - sm(b, 2.4, 2.7));
    } else if (A_SIGH[n]) {
      // up with the stopwatch as he takes the swing back, and started as he lets go
      const up = sm(b, letGo - 0.7, letGo - 0.15);
      hx = lerp(REST.x, UP.x, up); hy = lerp(REST.y, UP.y, up); hang = 1 - up;
      secs = b < letGo - 0.25 ? 3.0 : b < letGo ? lerp(3.0, 0, sm(b, letGo - 0.25, letGo)) : b - letGo;
    } else if (A_AGAIN[n]) {
      // stopped at 2.8, written; started again, stopped at 3.1, written
      const run1 = Math.max(0, T0 - relSrc);
      const s1 = 0.25;
      const w1 = writing(b, 0.6, 1, UP, UP, 0, 0, 0, false);
      const go2 = w1.end + 0.1;
      const stop2 = go2 + 3.1;
      const w2 = writing(b, stop2 + 0.45, 2, UP, REST, 0, 1, 0, false);
      const first = b < w1.end;
      hx = first ? w1.x : w2.x; hy = first ? w1.y : w2.y;
      hang = first ? w1.hang : w2.hang; pen = first ? w1.pen : w2.pen; rot = first ? w1.rot : w2.rot;
      pull = first ? w1.pull : w2.pull;
      liftNow = first ? w1.lift : w2.lift;
      rev[1] = w1.rev; rev[2] = w2.rev;
      secs = b < s1 ? lerp(Math.min(run1, 2.8), 2.8, sm(b, 0, s1))
        : b < go2 - 0.2 ? 2.8
          : b < go2 ? lerp(2.8, 0, sm(b, go2 - 0.2, go2))
            : Math.min(b - go2, 3.1);
      look = -0.2 * (sm(b, 0.2, 0.35) * (1 - sm(b, 0.5, 0.65)) + sm(b, stop2, stop2 + 0.15) * (1 - sm(b, stop2 + 0.3, stop2 + 0.45)));
      look -= 0.26 * (sm(b, 0.7, 1.0) * (1 - sm(b, 2.1, 2.4)) + sm(b, stop2 + 0.55, stop2 + 0.85) * (1 - sm(b, stop2 + 1.95, stop2 + 2.25)));
    } else if (A_ERROR[n]) {
      // the stopwatch held out to him
      const out = st(0.42, 0.58);
      hx = lerp(REST.x, SHOW.x, out); hy = lerp(REST.y, SHOW.y, out); hang = 1 - out;
      look = -0.14 * st(0.7, 0.8);
    } else if (n === ERROR_N + 1) {
      hx = SHOW.x; hy = SHOW.y; hang = 0;
    } else if (A_AVERAGE[n]) {
      const down = st(0, 0.14);
      hx = lerp(SHOW.x, REST.x, down); hy = lerp(SHOW.y, REST.y, down); hang = down;
      look = -0.22 * st(0.16, 0.26) * (1 - st(0.66, 0.78));
    } else if (A_ODD[n]) {
      // 2.0 written in the fourth row, and the pencil's point held on it as she asks
      const w = writing(b, 0.35, 3, REST, REST, 1, 1, 1.9, true);
      hx = w.x; hy = w.y; hang = w.hang; pen = w.pen; rot = w.rot; pull = w.pull; liftNow = w.lift; rev[3] = w.rev;
      look = -0.26 * sm(b, 0.45, 0.75) * (1 - sm(b, 3.4, 3.7));
    } else if (A_CHECK[n]) {
      // up with the stopwatch as he draws the swing back; started as he lets go, and
      // stopped after one whole swing
      const up = sm(b, letGo - 0.7, letGo - 0.15);
      hx = lerp(REST.x, UP.x, up); hy = lerp(REST.y, UP.y, up); hang = 1 - up;
      secs = b < letGo - 0.25 ? 3.1 : b < letGo ? lerp(3.1, 0, sm(b, letGo - 0.25, letGo)) : Math.min(b - letGo, 3.0);
      look = -0.2 * sm(b, letGo + 3.0, letGo + 3.2);
    } else if (n === CHECK_N + 1) {
      const down = sm(b, 0, 0.6);
      hx = lerp(UP.x, REST.x, down); hy = lerp(UP.y, REST.y, down); hang = down;
    } else if (A_DONE[n]) {
      // the average at the sheet's foot, and the board held up with the pencil still on it
      const w = writing(b, 0.45, 4, REST, REST, 1, 1, 9, true);
      hx = w.x; hy = w.y; hang = w.hang; pen = w.pen; rot = w.rot; pull = w.pull; liftNow = w.lift; rev[4] = w.rev;
      look = -0.26 * sm(b, 0.55, 0.85) * (1 - sm(b, 1.9, 2.2));
    } else if (n === DONE_N + 1) {
      // at ease: the pencil back in the clip, the hand down and the clipboard lowered
      const tip = rowTip(4, BY0 + RISE[4], BX - PULL * BN_D);
      const from = { x: tip.x + PEN_OFF.x + AVG_W, y: tip.y + PEN_OFF.y - 2 };
      const down = sm(b, 0.7, 1.3);
      pull = PULL * (1 - down);
      liftNow = RISE[4] * (1 - down);
      const clip = { x: BX - pull * BN_D + PEN_CLIP.x, y: BY0 + liftNow + PEN_CLIP.y };
      const u4 = sm(b, 0.2, 0.55);
      const u5 = sm(b, 0.75, 1.1);
      hx = lerp(lerp(from.x, clip.x, u4), REST.x, u5);
      hy = lerp(lerp(from.y, clip.y, u4), REST.y, u5);
      pen = 1 - sm(b, 0.55, 0.65);
      rot = PEN_SLANT * (1 - u4);
    }
    sb = hand(sb, BN_X, BN_D, 1, hx, hy, 1);
    // her back hand on the clipboard's right edge, in front of her
    const pulled = carry(cv, 16, n, pull, pull, trq);
    const lift = carry(cv, 4, n, liftNow, liftNow, tr);
    sb = hand(sb, BN_X, BN_D, -1, BX - pulled * BN_D + GRIP.x, BY0 + lift + GRIP.y, 1);
    // her head to the swing, to the stopwatch, to the paper
    sb = { ...sb, neck: sb.neck + look };
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, mixStance(prevB, sb, tr));
    const bn = pose(figB, BN_X, GROUND, K, BN_D, 1);

    // ── the things she holds, on her wrists every frame (AR7.4) ─────────────
    const wBR = wristOf(bn, 'wrR');
    const wBL = wristOf(bn, 'wrL');
    const hangV = carry(cv, 13, n, hang, hang, trq);
    const penV = carry(cv, 11, n, pen, pen, trq);
    const rotV = carry(cv, 12, n, rot, rot, trq);
    const clipAt = { x: wBL.x - GRIP.x + PEN_CLIP.x, y: wBL.y - GRIP.y + PEN_CLIP.y };

    return {
      th, bn, t,
      theta,
      board: { x: wBL.x, y: wBL.y, o: 1 },
      lift,
      watch: { x: wBR.x, y: wBR.y + lerp(PALM_DY, HANG_DY, hangV), o: 1 },
      sweep: carry(cv, 5, n, secs, secs, trq) * 12,
      pencil: { x: lerp(clipAt.x, wBR.x, penV), y: lerp(clipAt.y, wBR.y, penV), o: 1, r: rotV },
      rev0: carry(cv, 6, n, rev[0], rev[0], tr),
      rev1: carry(cv, 7, n, rev[1], rev[1], tr),
      rev2: carry(cv, 8, n, rev[2], rev[2], tr),
      rev3: carry(cv, 9, n, rev[3], rev[3], tr),
      rev4: carry(cv, 10, n, rev[4], rev[4], tr),
      q1: carry(cv, 14, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 15, n, Q2[p], Q2[n], tr),
    };
  });

  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);

  return (
    <View style={styles.scene}>
      <View style={styles.sky} pointerEvents="none" />
      <Hedge />
      <View style={styles.grass} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.mat} pointerEvents="none" />
      <View style={styles.ground} pointerEvents="none" />
      <ObjectArt parts={BACK_ART} tone={TONE} />
      <Swing S={SCENE} />
      <ObjectArt parts={FRONT_ART} tone={TONE} />
      <Board S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <InHand S={SCENE} />
      {on(Q1) ? <SpreadTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <OutlierTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or hung by ──────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art, children }: { at: SharedValue<At>; art: ReturnType<typeof clipboard>; children?: ReactNode }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
      {children}
    </Animated.View>
  );
}

/** The stopwatch with its running hand, and the pencil. */
function InHand({ S }: { S: SharedValue<any> }) {
  const watchP = useDerivedValue<At>(() => S.value.watch);
  const penP = useDerivedValue<At>(() => S.value.pencil);
  const handSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.sweep}deg` }] }));
  return (
    <>
      <Rider at={watchP} art={WATCH_ART}>
        <Animated.View style={[styles.watchHand, handSt]} />
      </Rider>
      <Rider at={penP} art={PEN_ART} />
    </>
  );
}

// ── the clipboard and what she has written on it ────────────────────────────
// Each time appears left to right as the pencil goes along it: a clip that widens over
// a line of fixed width, so the figures never re-wrap as they appear.
function Written({ S, k, x, y, w, glyph, label }: { S: SharedValue<any>; k: string; x: number; y: number; w: number; glyph: number; label: string }) {
  const st = useAnimatedStyle(() => {
    const u = S.value[k];
    const side = TEXT_PAD;
    return { width: u > 0 ? Math.min(w, side + (glyph + 2) * u) : 0 };
  });
  return (
    <Animated.View style={[styles.cellClip, { left: -GRIP.x + x, top: -GRIP.y + y }, st]}>
      <View style={[styles.cellLine, { width: w }]}>
        <Text style={styles.cellText} numberOfLines={1}>{label}</Text>
      </View>
    </Animated.View>
  );
}
function Board({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.board);
  return (
    <Rider at={at} art={BOARD_ART}>
      {TIMES.map((label, r) => (
        <Written key={label} S={S} k={'rev' + r} x={LINE_X} y={LINES_Y[r]} w={LINE_W} glyph={GLYPH_W} label={label} />
      ))}
      <Written S={S} k="rev4" x={LINE_X} y={LINES_Y[4]} w={LINE_W} glyph={AVG_W} label="≈3.0" />
    </Rider>
  );
}

// ── the swing: two chains and the seat between them ────────────────────────
function Swing({ S }: { S: SharedValue<any> }) {
  const nearSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${-S.value.theta}rad` }] }));
  const farSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${-S.value.theta}rad` }] }));
  const seat = useDerivedValue<At>(() => {
    const th = S.value.theta;
    return {
      x: (PN.x + PF.x) / 2 + CH * Math.sin(th),
      y: (PN.y + PF.y) / 2 + CH * Math.cos(th),
      o: 1,
      r: (-th * 180) / Math.PI,
    };
  });
  return (
    <>
      <Animated.View style={[styles.chain, { left: PF.x - 0.9, top: PF.y }, farSt]} pointerEvents="none" />
      <Rider at={seat} art={SEAT_ART} />
      <Animated.View style={[styles.chain, { left: PN.x - 0.9, top: PN.y }, nearSt]} pointerEvents="none" />
    </>
  );
}

// ── the hedge along the far side of the park ────────────────────────────────
const HORIZON = 446;
const HEDGE_TOP = 430;
const BUSHES = [[-6, 34], [30, 30], [62, 36], [100, 28], [134, 34], [170, 30], [206, 36], [244, 30], [280, 34], [318, 28], [352, 36], [390, 32]];
function Hedge() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUSHES.map(([x, w]) => (
        <View key={x} style={[styles.bush, { left: x, width: w, top: HEDGE_TOP - (w - 26) / 2 }]} />
      ))}
      <View style={styles.hedge} />
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Q1: the swing, her stopwatch and the clipboard — each tapped where it is drawn. Her
 * stopwatch is held out above the lowered clipboard, so the three stand apart (AN4).
 */
const SHOW_CASE = { x: SHOW.x, y: SHOW.y + PALM_DY + DIAL.y };
const SPREAD_Q = [
  { id: 'swing', left: 96, top: 446, w: 64, h: 44, r: 8, correct: false },
  { id: 'watch', left: SHOW_CASE.x - 8, top: SHOW_CASE.y - 10, w: 16, h: 16, r: 8, correct: true },
  { id: 'board', left: BX + 1, top: BY0 + 20, w: BOARD.w - 2, h: BOARD.h - 22, r: 3, correct: false },
];
function SpreadTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {SPREAD_Q.map((q) => (
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

/**
 * Q2: three of the times on her clipboard — three seconds, two point eight, two seconds —
 * each a box 14.2 × 11 round its figures, 2.5 or 2.8 clear of the next so no two halos run
 * together (AN4). Two seconds is the one to check. The layer rides with the board, which
 * she holds still.
 */
const OUTLIER_Q = [
  { id: 'three', r: 0, correct: false },
  { id: 'twoeight', r: 1, correct: false },
  { id: 'two', r: 3, correct: true },
];
function OutlierTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const st = useAnimatedStyle(() => ({
    opacity: S.value.q2,
    transform: [{ translateX: S.value.board.x - (BX + GRIP.x) }, { translateY: S.value.board.y - (BY0 + GRIP.y) }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="box-none">
      {OUTLIER_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={2}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: BX + LINE_X, top: BY0 + LINES_Y[q.r], width: LINE_W, height: LINE_H }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  sky: { position: 'absolute', left: 0, right: 0, top: 250, height: HORIZON - 250, backgroundColor: NATURAL.clearSky.base },
  bush: { position: 'absolute', height: 26, borderRadius: 13, backgroundColor: NATURAL.leaf.base },
  hedge: { position: 'absolute', left: 0, right: 0, top: HEDGE_TOP + 10, height: HORIZON - HEDGE_TOP - 10, backgroundColor: NATURAL.leaf.shade },
  grass: { position: 'absolute', left: 0, right: 0, top: HORIZON, height: GROUND - HORIZON, backgroundColor: NATURAL.meadow.base },
  floor: floorStyle(TONE, GROUND),
  mat: {
    position: 'absolute', left: 58, width: 148, top: 486, height: GROUND - 486, borderTopLeftRadius: 4, borderTopRightRadius: 4,
    backgroundColor: NATURAL.rubberMat.base,
  },
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  chain: {
    position: 'absolute', width: 1.8, height: CH, borderRadius: 0.9, backgroundColor: NATURAL.swingChain.shade,
    transformOrigin: '50% 0%',
  },
  watchHand: {
    position: 'absolute', left: -0.35, top: DIAL.y - DIAL.r * 0.75, width: 0.7, height: DIAL.r * 0.75, borderRadius: 0.35,
    backgroundColor: NATURAL.clockRed.base, transformOrigin: '50% 100%',
  },
  cellClip: { position: 'absolute', height: LINE_H, overflow: 'hidden' },
  /** The line at its full width, so the reveal's clip never re-wraps the figures. */
  cellLine: { height: LINE_H, paddingLeft: TEXT_PAD, alignItems: 'flex-start' },
  cellText: {
    fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: LINE_H, color: INK, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
});

export function Sci4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci4Scene} band={[306, 514]} camera={CAM} />;
}
