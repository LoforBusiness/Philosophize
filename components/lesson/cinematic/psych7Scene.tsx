import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './psych7Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { PLATE_FACE, lipOf } from './stageSkin';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-7, "Psychology Recap: The Old Laboratory" — AN EDWARDIAN
// PSYCHOLOGY LABORATORY IN THE MORNING, THEN A BUSY RAILWAY CONCOURSE. The recap of the
// road's six lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// psychologist (the top hat) works at his oak bench at dawn; the plain one, the subject of
// most of the findings, arrives sure he was the star.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// psych7.mjs) laid in ONE WORLD that is 800 wide: the laboratory at x 0–400, the concourse
// at x 400–800. The scene's own camera is the world's translation, `cam`: 0 in the
// laboratory, −400 on the concourse, cut under a fade through on the walk out (b13).
// Figures are posed in SCREEN space (world x + cam), so their feet stay on the floor.
//
//   LABORATORY, far → near: the ceiling and two green pendant lamps, the plaster wall with
//   the ARCHED WINDOW 46–104 × 254–404 (the town's roofs outside), the wall clock (143,
//   284), the EYE CHART 178–218 × 292–354, the BLACKBOARD 232–388 × 288–372 with its chalk
//   curve of reaction times, oak panelling 410–488 and a parquet floor; then the DOORWAY
//   2–46 × 364–490 (its oak leaf swings), the coat stand (64), a bentwood chair (96), the
//   glass CABINET 112–174 × 318–488; then the OAK BENCH 203–401 (top 461–470) drawn over
//   the psychologist's legs: on it the bean JAR (212), the CHRONOSCOPE (238) and the card
//   PRICELESS, his NOTEBOOK (264), the tray with two white CUPS (289, 307) and the pot
//   (300), his own cup (328), the LOGBOOK (328), the telegraph KEY (340), the METRONOME
//   (362), notebooks and a green lamp.
//   CONCOURSE (its own x 0–400): the iron-and-glass shed roof, the far end screen, the
//   platforms and the train at gate 2; the train at gate 5 (it pulls out); the brick screen
//   wall with GATE 2 52–150 and GATE 5 262–360, their enamel numbers, the stone floor, the
//   porter's trolley, the slatted BENCH 270–334 and the red CHOCOLATE MACHINE 360–394; the
//   three knots of the CROWD at gate 2, the DEPARTURES BOARD 158–254 × 290–336 and the
//   STATION CLOCK at (316, 300).
//
//   b0   alone at dawn: presses the key and reads the dial (stopwatch 1.1s), writes in the
//        logbook (pencil 2.4s), presses again (stopwatch 3.8s), sips his coffee and sets
//        the cup down (cup 5.1s), turns and sets the metronome going, looks up, murmurs.
//   b1   the door swings; the plain one strolls in, chin up, and leans on the cabinet.
//   b2   the psychologist steps to the tray and lifts the two cups (cup 1.2s), the gold one.
//   b3   the plain one spreads his hands.        b4   the psychologist taps the one pot.
//   b5   the plain one taps his chest, his temple.
//   b6   the psychologist swaps the gold label to the other cup and writes a tally card
//        (pencil 1.3s).                          b7   Q1 RUN THE TEST.
//   b8   the plain one strolls to the bench and bends over the chronoscope and its card.
//   b9   the psychologist lifts the card (paper 0.8s) and lays it face down.
//   b10  the plain one tips the timer, reads KITCHEN TIMER underneath, waves at the floor.
//   b11  the psychologist opens the logbook (book 0.5s) and taps the line.
//   b12  Q2 FIND THE RECORD.
//   b13  both walk out; a fade through; the concourse; he joins the crowd at gate 2.
//   b14  the psychologist points at the crowd, all looking at each other.
//   b15  Q3 FIND YOUR PLATFORM.
//   b16  he hurries to gate 5 as the train pulls out, and turns back.
//   b17  the psychologist takes the ticket and holds it up: FIRST CLASS.
//   b18  a coin in the chocolate machine (coin 0.6s); one bar drops.
//   b19  the psychologist folds his arms; the plain one feels for another coin.
//   b20  both on the bench.                      b21  at ease.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), everyone faces whom he
// talks to, and every hand that moves presses, writes, sips, lifts, taps, tips, points or
// pays.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.78;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [9.78, 3.17, 4.72, 4.33, 6.95, 3.7, 5.48, 0, 4.78, 7.05, 6.43, 7.45, 0, 4.03, 6.86, 0, 6.32, 8.12, 5.22, 5.87, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const FOLD = 62;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const CUPS = at('cups');
const BOAST = at('boast');
const POT = at('pot');
const INSIST = at('insist');
const TALLY = at('tally');
const ADMIRE = at('admire');
const CARD = at('card');
const STICKER = at('sticker');
const REBUILD = at('rebuild');
const CONCOURSE = at('concourse');
const COPY = at('copy');
const MISSED = at('missed');
const STORY = at('story');
const MACHINE = at('machine');
const REWARD = at('reward');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.test ? 1 : 0));
const Q2 = BEATS.map((b) => (b.record ? 1 : 0));
const Q3 = BEATS.map((b) => (b.platform ? 1 : 0));
const Q2_AT = Q2.indexOf(1);
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 9.78;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of him (his own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the concourse is x + 400) ────────────────
const HX = 400;
const TH_DESK = 350;
const TH_TRAY = 310;
const TH_TIMER = 290;
const TH_HALL = HX + 236;
const TH_TICKET = HX + 294;
const TH_SEAT = HX + 294;
/** The walk out (b13): out of the laboratory to the right, a fade through at CUT, in from the concourse's left. */
const CUT = 1.5;
const TH_EXIT = 404;
const TH_ENTER = HX + 70;
const PL_EXIT = 360;
const PL_ENTER = HX + 30;
const PL_OFF = -40;
const PL_LEAN = 186;
const PL_TIMER = 214;
const PL_GATE2 = HX + 160;
const PL_GATE5 = HX + 332;
const PL_MACHINE = HX + 356;
const PL_SEAT = HX + 324;

const TH_LEGS: Track[] = per((n) => (n < CUPS ? [[0, TH_DESK]] : n < ADMIRE ? [[0, TH_TRAY]]
  : n === ADMIRE ? [[0.3, TH_TIMER]] : n === CARD ? [[0, TH_TIMER]] : n === STICKER ? [[0.12, TH_DESK]]
    : n < CONCOURSE ? [[0, TH_DESK]] : n < STORY ? [[0, TH_HALL]] : n === STORY ? [[0.04, TH_TICKET]]
      : n < REST ? [[0, TH_TICKET]] : [[0, TH_SEAT]]));
const PL_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, PL_OFF]] : n === ARRIVE ? [[0.02, PL_LEAN]]
  : n < ADMIRE ? [[0, PL_LEAN]] : n === ADMIRE ? [[0.05, PL_TIMER]] : n < CONCOURSE ? [[0, PL_TIMER]]
    : n < MISSED ? [[0, PL_GATE2]] : n === MISSED ? [[0.05, PL_GATE5]] : n === STORY ? [[0, PL_GATE5]] : n === MACHINE ? [[0, PL_MACHINE]]
      : n < REST ? [[0, PL_MACHINE]] : [[0, PL_SEAT]]));
const TH_TURN: Track[] = per((n) => (n === WORK ? [[0, -1], [S0(5.2), 1], [S0(6.0), -1]]
  : n === STICKER ? [[0, -1], [0.4, -1]] : n === CONCOURSE ? [[0, 1], [0.9, -1]] : n === MISSED ? [[0, -1], [0.3, 1]]
    : n > MISSED ? [[0, 1]] : [[0, -1]]));
const PL_TURN: Track[] = per((n) => (n === MISSED ? [[0, 1], [0.62, -1]] : n === MACHINE ? [[0, 1], [0.6, -1]]
  : n > MISSED ? [[0, -1]] : [[0, 1]]));
const TH_P = per((n) => (n === REWARD ? FOLD : BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const PL_P = per((n) => (BEATS[n].speaker === 'plain' ? TALK : NOD));

// ── the bench (world = screen in the laboratory) ──────────────────────────────
const JAR = { x: 212, y: 466 };
const TIMER = { x: 238, y: 463 };
const BOOK = { x: 264, y: 466 };
const CUP_A = { x: 286.5, y: 462.7 };
const CUP_B = { x: 307, y: 462.7 };
const MYCUP = { x: 328, y: 460.4 };
const LOG = { x: 328, y: 466 };
const KEY = { x: 340, y: 466 };
const METRO = { x: 358, y: 461 };
const PENCIL = { x: 336, y: 465.6 };
const TALLY_C = { x: 298, y: 466 };
const PRICE = { x: 268, y: 451.5, w: 54 };
// ── the concourse (own x; screen = own x once there) ─────────────────────────
const TRAIN = { x: 250, y: 466 };
const BOARD = { x: 206, y: 290 };
const CLOCK = { x: 316, y: 300 };
const SLOT = { x: 377, y: 459 };
const DRAWER = { x: 377, y: 474 };
/** Small props are drawn a touch larger than life so they read beside the figures. */
const SC = 1.3;
const KNOTS = [{ x: 78, y: 476, k: 'c' }, { x: 104, y: 478, k: 'a' }, { x: 136, y: 480, k: 'b' }] as const;

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { opinion: 1, cups: 2, beans: 3, memory: 4, logbook: 5, metronome: 6, crowd: 7, board: 8, clock: 9 };

// ── the hands ────────────────────────────────────────────────────────────────
/** His right hand: the key, the pencil, the metronome, the cups, the pot, the card, the logbook, the crowd, the ticket. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(0.35), 9, 468, 0], [S0(0.7), 10, 459, 1], [S0(1.1), 10, 464.4, 1], [S0(1.35), 12, 462, 1],
      [S0(2.2), 22, 463, 1], [S0(2.4), 22, 465, 1], [S0(3.2), 13, 465.3, 1], [S0(3.55), 10, 459, 1], [S0(3.8), 10, 464.4, 1], [S0(4.1), 9, 468, 0],
      [S0(5.45), 9, 468, 0], [S0(5.62), 12, 444, 1], [S0(5.8), 14, 447, 1], [S0(6.05), 9, 468, 0]];
  }
  if (n === ARRIVE) return [[0.04, 9, 468, 0], [0.12, 16, 461, 1], [0.22, 12, 465, 1], [0.32, 9, 468, 0]];
  if (n === CUPS) return [[0.18, 8, 468, 0], [0.24, 6, 461, 1], [0.27, 6, 461, 1], [0.36, 5, 446, 1], [0.78, 5, 446, 1], [0.86, 6, 461, 1], [0.92, 8, 468, 0]];
  if (n === POT) return [[0.04, 9, 468, 0], [0.13, 12, 440, 1], [0.18, 12, 443, 1], [0.23, 12, 440, 1], [0.28, 12, 443, 1], [0.38, 9, 468, 0]];
  if (n === TALLY) return [[0.13, 9, 468, 0], [0.19, 14, 463, 1], [0.24, 13, 461, 1], [0.28, 15, 461, 1], [0.32, 13, 461, 1], [0.36, 15, 461, 1], [0.4, 12, 459, 1], [0.46, 9, 468, 0]];
  if (n === CARD) return [[0.02, 9, 468, 0], [0.1, 22, 452, 1], [0.13, 22, 452, 1], [0.22, 16, 438, 1], [0.3, 16, 438, 1], [0.38, 14, 464, 1], [0.44, 9, 468, 0]];
  if (n === REBUILD) {
    return [[0, 9, 468, 0], [0.04, 18, 462, 1], [0.08, 14, 464, 1], [0.13, 9, 468, 0],
      [0.5, 9, 468, 0], [0.56, 20, 462, 1], [0.6, 20, 465, 1], [0.64, 20, 462, 1], [0.68, 20, 465, 1], [0.76, 9, 468, 0]];
  }
  if (n === COPY) return [[0.08, 8, 452, 0], [0.18, 22, 432, 1], [0.7, 22, 432, 1], [0.8, 8, 452, 0]];
  if (n === STORY) return [[0.18, 8, 452, 0], [0.27, 20, 448, 1], [0.32, 20, 448, 1], [0.42, 12, 412, 1], [0.8, 12, 412, 1], [0.9, 7, 452, 1]];
  if (n === MACHINE) return [[0, 7, 452, 1], [0.12, 3, 462, 1], [0.2, 8, 452, 0]];
  if (n < CONCOURSE) return [[0, 9, 468, 0]];
  return NONE;
});
/** His left hand: his coffee cup, the gold cup, the gold label. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(4.15), 8, 468, 0], [S0(4.35), 22, 459, 1], [S0(4.65), 11, 433, 1], [S0(4.92), 11, 434, 1], [S0(5.08), 22, 459.4, 1], [S0(5.25), 8, 468, 0]];
  }
  if (n === CUPS) return [[0.18, 8, 468, 0], [0.24, 23, 461, 1], [0.27, 23, 461, 1], [0.36, 18, 444, 1], [0.78, 18, 444, 1], [0.86, 23, 461, 1], [0.92, 8, 468, 0]];
  if (n === TALLY) return [[0.02, 8, 468, 0], [0.07, 23, 459, 1], [0.1, 23, 459, 1], [0.15, 5, 459, 1], [0.18, 5, 459, 1], [0.22, 8, 468, 0]];
  return NONE;
});
/** The plain one's right hand: his boast, his chest and temple, the timer, the floor, his forehead, the ticket, the coins. */
const PL_R: (readonly Key[])[] = per((n) => {
  if (n === BOAST) return [[0.08, 8, 452, 0], [0.16, 18, 440, 1], [0.84, 18, 440, 1], [0.94, 8, 452, 0]];
  if (n === INSIST) {
    return [[0.06, 8, 452, 0], [0.16, 5, 456, 1], [0.3, 5, 456, 1], [0.48, 9, 428, 1], [0.64, 9, 428, 1], [0.8, 8, 452, 0]];
  }
  if (n === ADMIRE) return [[0.6, 8, 452, 0], [0.7, 15, 444, 1], [0.9, 15, 444, 1], [1, 8, 452, 0]];
  if (n === STICKER) {
    return [[0.03, 8, 452, 0], [0.1, 17, 434, 1], [0.16, 20, 438, 1], [0.4, 20, 438, 1], [0.48, 17, 434, 1], [0.54, 8, 452, 0],
      [0.6, 8, 452, 0], [0.68, 14, 478, 1], [0.74, 18, 480, 1], [0.8, 12, 478, 1], [0.86, 18, 480, 1], [0.94, 8, 452, 0]];
  }
  if (n === Q2_AT) return [[0.02, 8, 452, 0], [0.12, 10, 425, 1]];
  if (n === STORY) return [[0.1, 8, 452, 0], [0.2, 18, 448, 1], [0.32, 18, 448, 1], [0.38, 8, 452, 0]];
  if (n === MACHINE) return [[0, 8, 452, 0], [0.04, 4, 462, 1], [0.1, 21, SLOT.y, 1], [0.16, 21, SLOT.y, 1], [0.22, 8, 452, 0]];
  if (n === REWARD) return [[0.3, 8, 452, 0], [0.38, 4, 462, 1], [0.5, 4, 462, 1], [0.62, 13, 444, 1], [0.92, 13, 444, 1]];
  return NONE;
});
/** His left hand: the boast, and the chocolate bar out of the drawer. */
const PL_L: (readonly Key[])[] = per((n) => {
  if (n === BOAST) return [[0.08, 8, 452, 0], [0.16, 14, 446, 1], [0.84, 14, 446, 1], [0.94, 8, 452, 0]];
  if (n === MACHINE) return [[0.3, 8, 452, 0], [0.38, 21, DRAWER.y, 1], [0.44, 21, DRAWER.y, 1], [0.52, 12, 440, 1], [0.72, 12, 440, 1], [0.82, 7, 454, 1]];
  if (n === REWARD) return [[0, 7, 454, 1]];
  return NONE;
});

function smooth01(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
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
/** A walk from `src` to `to` that starts `start` seconds in — later if he must turn first (C18). */
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
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number): Walk {
  'worklet';
  const leg = legs[legs.length - 1];
  return walkOf(src, leg[1], legs[0][0] * L, faceSrc, b);
}
function shifted(w: Walk, off: number): Walk {
  'worklet';
  return { ...w, ws: w.ws + off, we: w.we + off };
}
/** Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a walk wins. */
function faceOf(src: number, turns: Track, b: number, L: number, w: Walk) {
  'worklet';
  const ts: number[] = [];
  const ds: number[] = [];
  for (let k = 0; k < turns.length; k += 1) {
    let tt = turns[k][0] * L;
    const dd = turns[k][1];
    if (w.wd !== 0 && dd !== w.wd && tt >= w.ws - TURN_S - 0.05 && tt < w.we) tt = w.we;
    ts.push(tt);
    ds.push(dd);
  }
  if (w.wd !== 0) {
    ts.push(Math.max(0, w.ws - TURN_S));
    ds.push(w.wd);
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
function bodyOf(w: Walk, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t, phase), hHold(codes[n], t, phase), hLive(codes[n], t, b, phase), w.u, WALK, 0)
    : hLive(codes[n], t, b, phase);
}
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** A one-shot shake: a few swings that die away over r 0 → 1. */
function shake(r: number, amp: number): number {
  'worklet';
  return r > 0 && r < 1 ? amp * Math.sin(r * 36) * (1 - r) : 0;
}
/** A hop: up and back down. */
function hop(r: number): number {
  'worklet';
  return Math.sin(Math.PI * Math.min(1, r * 1.4));
}

export default function Psych7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldP = useHeld();
  const cv = useCarry(32);
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
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
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

    // ── the plain one ───────────────────────────────────────────────────────
    const late = n > CONCOURSE && carrySource(cv, 1, n, 0) > -HX + 1;
    const legsP = PL_LEGS[n];
    let srcP = carrySource(cv, 0, n, PL_OFF);
    if (late) srcP = legsP[legsP.length - 1][1];
    const fP = carrySource(cv, 2, n, 1);
    let wP = legsOf(srcP, legsP, b, L, fP);
    if (n === CONCOURSE) wP = b < CUT ? walkOf(srcP, PL_EXIT, 0, fP, b) : shifted(walkOf(PL_ENTER, PL_GATE2, 0, 1, b - CUT), CUT);
    const xPw = carry(cv, 0, n, wP.x, wP.x, 1);
    // ── the camera: the laboratory, then (cut under the fade) the concourse ─
    const camNow = n < CONCOURSE ? 0 : n === CONCOURSE ? (b < CUT ? 0 : -HX) : -HX;
    const cam = carry(cv, 1, n, 0, camNow, 1);
    const fade = n === CONCOURSE ? stage(b, 1, CUT - 0.35, CUT) * (1 - stage(b, 1, CUT, CUT + 0.45)) : late ? 1 - stage(b, 1, 0, 0.45) : 0;
    const xP = xPw + cam;
    const dP = carry(cv, 2, n, 0, faceOf(fP, PL_TURN[n], b, L, wP), 1);
    let sp = bodyOf(wP, PL_P, n, t, b, 1);
    // leaning back on the cabinet while he listens in the laboratory
    let lean = 0;
    if (n === ARRIVE) lean = st(0.86, 1);
    else if (n > ARRIVE && n < ADMIRE) lean = n === BOAST ? 1 - hd(0.04, 0.12, 0.88, 0.98) : n === INSIST ? 1 - hd(0.02, 0.1, 0.84, 0.96) : 1;
    else if (n === ADMIRE) lean = 1 - st(0, 0.06);
    const leanC = carry(cv, 3, n, 0, lean, tr);
    if (leanC > 0) sp = { ...sp, tilt: sp.tilt + 0.15 * leanC, bob: sp.bob - 1.6 * leanC };
    // bent over the chronoscope
    let bend = 0;
    if (n === ADMIRE) bend = st(0.45, 0.62);
    else if (n === CARD) bend = 1 - st(0.05, 0.2);
    else if (n === STICKER) bend = hd(0.04, 0.12, 0.5, 0.58);
    const bendC = carry(cv, 4, n, 0, bend, tr);
    if (bendC > 0) sp = mixStance(sp, postureStill(18, t, 1), bendC);
    // sitting on the concourse bench
    const sitP = carry(cv, 5, n, 0, n >= REST ? (n === REST ? st(0.4, 0.75) : 1) : 0, tr);
    if (sitP > 0) sp = mixStance(sp, postureStill(4, t, 1), sitP);
    sp = keyed(sp, PL_R[n], u, xP, dP, 1);
    sp = keyed(sp, PL_L[n], u, xP, dP, -1);
    if (n === ARRIVE) sp = look(sp, -0.1);
    if (n === BOAST) sp = look(sp, -0.13 * hd(0.04, 0.14, 0.86, 0.96));
    if (n === ADMIRE) sp = look(sp, 0.18 * st(0.5, 0.65));
    if (n === STICKER) sp = look(sp, 0.16 * hd(0.14, 0.2, 0.42, 0.5) + 0.2 * hd(0.62, 0.7, 0.88, 0.96));
    if (n === CONCOURSE) sp = look(sp, -0.12 * hd(0.6, 0.7, 0.88, 0.98));
    if (n === MISSED) sp = look(sp, -0.06 * hd(0.2, 0.3, 0.55, 0.62));
    if (n === MACHINE) sp = look(sp, 0.1 * hd(0.24, 0.3, 0.44, 0.5));
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t, 1));
    const figP = keepHeld(heldP, wP.walking ? mixKeepLegs(prevP, sp, trAt(0)) : mixStance(prevP, sp, trAt(0)));

    // ── the psychologist ────────────────────────────────────────────────────
    const legsT = TH_LEGS[n];
    let srcT = carrySource(cv, 6, n, TH_DESK);
    if (late) srcT = legsT[legsT.length - 1][1];
    const fT = carrySource(cv, 7, n, -1);
    let wT = legsOf(srcT, legsT, b, L, fT);
    if (n === CONCOURSE) wT = b < CUT ? walkOf(srcT, TH_EXIT, 0, fT, b) : shifted(walkOf(TH_ENTER, TH_HALL, 0.1, 1, b - CUT), CUT);
    const xTw = carry(cv, 6, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const dT = carry(cv, 7, n, 0, faceOf(fT, TH_TURN[n], b, L, wT), 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    const sitT = carry(cv, 8, n, 0, n >= REST ? (n === REST ? st(0.3, 0.65) : 1) : 0, tr);
    if (sitT > 0) sh = mixStance(sh, postureStill(4, t, 0), sitT);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1);
    if (n === WORK) {
      const dial = 0.1 * (hd(S0(1.2), S0(1.4), S0(1.6), S0(1.8)) + hd(S0(3.9), S0(4.0), S0(4.1), S0(4.2)));
      const writing = 0.12 * hd(S0(2.1), S0(2.3), S0(3.2), S0(3.4));
      const upward = -0.2 * hd(S0(6.15), S0(6.5), S0(7.6), S0(8.2));
      sh = look(sh, dial + writing + upward);
    }
    if (n === ARRIVE) sh = look(sh, -0.06);
    if (n === TALLY) sh = look(sh, 0.12 * hd(0.2, 0.24, 0.38, 0.44));
    if (n === CARD) sh = look(sh, 0.1 * hd(0.02, 0.08, 0.36, 0.44));
    if (n === REBUILD) sh = look(sh, 0.12 * (hd(0.02, 0.06, 0.12, 0.16) + hd(0.5, 0.55, 0.7, 0.76)));
    if (n === STORY) sh = look(sh, -0.12 * hd(0.4, 0.46, 0.78, 0.84));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(1)) : mixStance(prevT, sh, trAt(1)));

    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const ph = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(ph, 'wrR');
    const tL = wristOf(ph, 'wrL');
    const pR = wristOf(pl, 'wrR');
    const pL = wristOf(pl, 'wrL');

    // ── the laboratory's things ─────────────────────────────────────────────
    // the door swings open as he comes through, and shut behind him
    const door = n === ARRIVE ? hd(0, 0.12, 0.5, 0.66) : 0;
    // the logbook: open at dawn, shut as the visitor comes in, opened again on b11
    const logOpen = carry(cv, 9, n, 1, n === WORK ? 1 : n === ARRIVE ? 1 - st(0.17, 0.24) : n < REBUILD ? 0 : n === REBUILD ? st(0.06, 0.1) : 1, tr);
    // the pencil: on the bench, then in his right hand while he writes
    const penHeld = n === WORK ? hd(S0(1.72), S0(1.82), S0(3.3), S0(3.4)) : n === TALLY ? hd(0.16, 0.2, 0.42, 0.46) : 0;
    const pencil = { x: lerp(PENCIL.x + cam, tR.x, penHeld), y: lerp(PENCIL.y, tR.y - 1, penHeld), rot: lerp(0, -55, penHeld) };
    // the needle on the chronoscope's dial: it runs while the key is down
    const run = n === WORK ? clamp01((u - S0(1.1)) / S0(0.6)) + clamp01((u - S0(3.8)) / S0(0.6)) : 0;
    const needle = carry(cv, 10, n, 0, run * 330 + (n > WORK ? 660 : 0), tr);
    const keyDown = n === WORK ? hd(S0(1.06), S0(1.1), S0(1.22), S0(1.3)) + hd(S0(3.76), S0(3.8), S0(3.92), S0(4.0)) : 0;
    // his own cup: on its saucer, up to his lips, back down at 5.1s (the clink)
    const mine = n === WORK ? hd(S0(4.33), S0(4.37), S0(5.06), S0(5.1)) : 0;
    const myCup = { x: lerp(MYCUP.x, tL.x - 1, mine), y: lerp(MYCUP.y, tL.y + 3.4, mine), rot: -26 * hd(S0(4.6), S0(4.7), S0(4.9), S0(4.98)) };
    // the metronome: set going at 5.7s, and ticking from then on
    const metroOn = carry(cv, 11, n, 0, n === WORK ? st(S0(5.62), S0(5.9)) : n < CONCOURSE ? 1 : 0, tr);
    // the two cups: lifted on b2 (the clink at 1.2s), swapped by Q1
    const lift = n === CUPS ? hd(0.254, 0.3, 0.8, 0.88) : 0;
    const rCups = carry(cv, 12, n, 0, ans(2, Q1), tr);
    const swapX = (CUP_B.x - CUP_A.x) * smooth01((rCups - 0.15) / 0.6);
    const cupA = { x: lerp(CUP_A.x + swapX, tL.x - 1, lift), y: lerp(CUP_A.y, tL.y + 3.4, lift) - 9 * hop(rCups) };
    const cupB = { x: lerp(CUP_B.x - swapX, tR.x + 1, lift), y: lerp(CUP_B.y, tR.y + 3.4, lift) - 6 * hop(rCups) };
    // the gold label: on cup A, carried across on b6, on cup B after
    const moved = n === TALLY ? st(0.1, 0.15) : n > TALLY ? 1 : 0;
    const onHand = n === TALLY ? hd(0.09, 0.1, 0.15, 0.16) : 0;
    const label = {
      x: lerp(lerp(cupA.x, cupB.x, moved), tL.x, onHand),
      y: lerp(lerp(cupA.y, cupB.y, moved), tL.y + 3, onHand),
    };
    // the tally card: set down on b6, its marks written as the pencil crosses it
    const cardIn = carry(cv, 13, n, 0, n === TALLY ? st(0.17, 0.21) : n > TALLY && n < CONCOURSE ? 1 : 0, tr);
    const marks = carry(cv, 14, n, 0, n === TALLY ? clamp01((u - 0.237) / 0.17) * 4 : n > TALLY ? 4 : 0, tr) + rCups;
    // the PRICELESS card: leaning on the timer, lifted on b9 (paper 0.8s), laid face down
    const cardUp = n === CARD ? hd(0.11, 0.13, 0.36, 0.38) : 0;
    const cardDown = n === CARD ? st(0.37, 0.39) : n > CARD ? 1 : 0;
    const flip = n === CARD ? st(0.24, 0.32) : n > CARD ? 1 : 0;
    const price = {
      x: lerp(lerp(PRICE.x + cam, 280 + cam, cardDown), tR.x, cardUp),
      y: lerp(lerp(PRICE.y, 465, cardDown), tR.y + 2, cardUp),
      sy: lerp(1, 0.26, cardDown),
      flip,
    };
    // the timer tipped on b10, and the sticker underneath
    const tip = n === STICKER ? -22 * hd(0.12, 0.17, 0.4, 0.47) : 0;
    const sticker = carry(cv, 15, n, 0, n === STICKER ? hd(0.16, 0.2, 0.44, 0.5) : 0, tr);
    const priceO = carry(cv, 16, n, 1, n < CONCOURSE ? 1 : 0, tr);
    // ── Q1: his notebook, the cups and tally, the beans ─────────────────────
    const rBook = carry(cv, 17, n, 0, ans(1, Q1), tr);
    const rJar = carry(cv, 18, n, 0, ans(3, Q1), tr);
    // ── Q2: his memory, the logbook, the metronome ──────────────────────────
    const rMem = carry(cv, 19, n, 0, ans(4, Q2), tr);
    const rLog = carry(cv, 20, n, 0, ans(5, Q2), tr);
    const rMetro = carry(cv, 21, n, 0, ans(6, Q2), tr);
    const bubble = carry(cv, 22, n, 0, Q2[n] ? st(0.05, 0.25) : 0, tr);
    // ── the concourse ────────────────────────────────────────────────────────
    const trainX = carry(cv, 23, n, 0, n < MISSED ? 0 : n === MISSED ? 260 * ease01(clamp01((u - 0.2) / 0.55)) : 260, tr);
    const rCrowd = carry(cv, 24, n, 0, ans(7, Q3), tr);
    const rBoard = carry(cv, 25, n, 0, ans(8, Q3), tr);
    const rClock = carry(cv, 26, n, 0, ans(9, Q3), tr);
    // the crowd looking at each other while he talks of copying
    const glance = n === COPY ? hd(0.1, 0.16, 0.8, 0.88) : 0;
    // the ticket: in his hand from the concourse, handed over on b17, pocketed on b18
    const tHeld = n === STORY ? st(0.31, 0.33) : n === MACHINE ? 1 : 0;
    const ticket = {
      x: lerp(pR.x, tR.x, tHeld), y: lerp(pR.y, tR.y, tHeld) - 1,
      o: carry(cv, 27, n, 0, n >= CONCOURSE && n < MACHINE ? 1 : n === MACHINE ? 1 - st(0.16, 0.2) : 0, tr),
    };
    const first = n === STORY ? hd(0.42, 0.48, 0.82, 0.88) : 0;
    // the coin, the bar that drops into the drawer, the bar in his hand
    const coinO = carry(cv, 31, n, 0, n === MACHINE ? hd(0.04, 0.06, 0.15, 0.17) : n === REWARD ? st(0.44, 0.48) : 0, tr);
    const drop = n === MACHINE ? clamp01((u - 0.2) / 0.08) : 0;
    const barHeld = n === MACHINE ? st(0.43, 0.45) : n > MACHINE ? 1 : 0;
    const barO = n === MACHINE ? st(0.19, 0.2) : n > MACHINE ? 1 : 0;
    const settle = n === MACHINE ? Math.sin(Math.PI * clamp01((u - 0.28) / 0.08)) : 0;
    const bar = {
      x: lerp(HX + DRAWER.x + cam, pL.x - 1, barHeld),
      y: lerp(lerp(SLOT.y + 6, DRAWER.y, drop * drop), pL.y, barHeld) - 2.5 * settle,
      rot: lerp(0, -60, barHeld),
    };

    return {
      pl, ph, cam, t, fade, door, logOpen, pencil, needle, keyDown, myCup, metroOn,
      cupA, cupB, label, cardIn, marks, price, priceO, tip, sticker,
      rCups, rBook, rJar, rMem, rLog, rMetro, bubble,
      trainX, rCrowd, rBoard, rClock, glance, ticket, first, coinO, bar, barO,
      coin: { x: pR.x, y: pR.y - 1 },
      q1: carry(cv, 28, n, 0, Q1[n], tr),
      q2: carry(cv, 29, n, 0, Q2[n], tr),
      q3: carry(cv, 30, n, 0, Q3[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world2 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the laboratory (x 0–400) and the concourse (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="psych7-lab-far" />
        <WallClock />
        <LessonPicture name="psych7-lab-mid" />
        <Door S={SCENE} />
        <View style={styles.benchShadow} />
        <LessonPicture name="psych7-hall-far" />
        <Steam S={SCENE} />
        <Train S={SCENE} />
        <LessonPicture name="psych7-hall-mid" />
        <View style={styles.crowdShadow} />
        <View style={styles.machineShadow} />
        <Crowd S={SCENE} />
        <Board S={SCENE} />
        <StationClock S={SCENE} />
      </Animated.View>
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      {/* the oak bench, over his legs, and what is on it */}
      <Animated.View style={[styles.world, world2]} pointerEvents="none">
        <LessonPicture name="psych7-lab-bench" />
        <Jar S={SCENE} />
        <Timer S={SCENE} />
        <Book S={SCENE} />
        <MyCup S={SCENE} />
        <Metronome S={SCENE} />
        <Logbook S={SCENE} />
        <TallyCard S={SCENE} />
        <Cup S={SCENE} k="cupA" />
        <Cup S={SCENE} k="cupB" />
        <Label S={SCENE} />
        <TelegraphKey S={SCENE} />
      </Animated.View>
      <Pencil S={SCENE} />
      <PriceCard S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="second" wear={[]} />
      <Ticket S={SCENE} />
      <Coin S={SCENE} />
      <Bar S={SCENE} />
      {on(Q2) ? <Bubble S={SCENE} /> : null}
      {/* the labels and the things to tap */}
      <StickerPlate S={SCENE} />
      <FirstClass S={SCENE} />
      {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
      {on(Q2) ? <Plates S={SCENE} k="q2" items={Q2_PLATES} /> : null}
      {on(Q3) ? <Plates S={SCENE} k="q3" items={Q3_PLATES} /> : null}
      <Fade S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={TEST_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={RECORD_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={PLATFORM_Q} k="q3" /> : null}
    </View>
  );
}

// ── the laboratory ───────────────────────────────────────────────────────────

/** The wall clock's hands: a few minutes past seven in the morning. */
function WallClock() {
  return (
    <>
      <View style={[styles.hand, { left: 142.4, top: 275.4, height: 8.6, transform: [{ rotate: '-150deg' }] }]} />
      <View style={[styles.hand, { left: 142.5, top: 272.4, height: 11.6, width: 1, transform: [{ rotate: '24deg' }] }]} />
      <View style={styles.wallClockPin} />
    </>
  );
}
/** The door's oak leaf, hinged at its left edge; it swings open into the hall and back. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 7 }, { translateY: 488 }, { scaleX: 1 - 0.78 * S.value.door }] }));
  return <Animated.View style={[styles.hinge, st]} pointerEvents="none"><LessonPicture name="psych7-door" /></Animated.View>;
}
/** The bean jar: a wrong pick wobbles it on the bench. */
function Jar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rJar;
    return { transform: [{ translateX: JAR.x }, { translateY: JAR.y - 4 * hop(r) }, { rotate: `${shake(r, 14)}deg` }, { scale: SC }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="psych7-jar" /></Animated.View>;
}
/** The chronoscope: tipped on b10 to show its underside; its needle runs while the key is down. */
function Timer({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: TIMER.x }, { translateY: TIMER.y }, { rotate: `${S.value.tip}deg` }, { scale: 1.25 }] }));
  const needle = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.needle}deg` }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="psych7-timer" />
      <Animated.View style={[styles.needlePivot, needle]}><View style={styles.needle} /></Animated.View>
    </Animated.View>
  );
}
/** His notebook, MY HONEST OPINION: a wrong pick makes it hop and shudder. */
function Book({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rBook;
    return { transform: [{ translateX: BOOK.x + shake(r, 2.4) }, { translateY: BOOK.y - 5 * hop(r) }, { scale: SC }, { scaleY: 1 + 0.25 * Math.sin(r * Math.PI * 4) * (1 - r) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="psych7-opinion" /></Animated.View>;
}
function MyCup({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.myCup.x }, { translateY: S.value.myCup.y }, { rotate: `${S.value.myCup.rot}deg` }, { scale: SC }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="psych7-cup" /></Animated.View>;
}
/** The metronome: its rod swings once it is set going; a wrong pick sends it wild and makes it hop. */
function Metronome({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => {
    const r = S.value.rMetro;
    return { transform: [{ translateX: METRO.x + shake(r, 1.6) }, { translateY: METRO.y - 4 * hop(r) }, { scale: SC }] };
  });
  const rod = useAnimatedStyle(() => {
    const v = S.value;
    const wild = Math.sin(Math.PI * Math.min(1, v.rMetro));
    return { transform: [{ rotate: `${(20 + 14 * wild) * v.metroOn * Math.sin(v.t * (3.4 + 6 * wild))}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, body]} pointerEvents="none">
      <LessonPicture name="psych7-metronome" />
      <Animated.View style={[styles.rodPivot, rod]}>
        <View style={styles.rod} />
        <View style={styles.rodWeight} />
      </Animated.View>
    </Animated.View>
  );
}
/** The logbook: shut or open; the right pick bounces it, marks the line and lifts the spoon out of the page. */
function Logbook({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rLog;
    return { transform: [{ translateX: LOG.x }, { translateY: LOG.y - 4 * hop(r) }, { scale: 1.2 * (1 + 0.18 * hop(r)) }] };
  });
  const open = useAnimatedStyle(() => ({ opacity: S.value.logOpen, transform: [{ scaleY: 0.4 + 0.6 * S.value.logOpen }] }));
  const shut = useAnimatedStyle(() => ({ opacity: 1 - S.value.logOpen }));
  const line = useAnimatedStyle(() => ({ opacity: Math.min(1, S.value.rLog * 2), transform: [{ scaleX: Math.max(0.01, Math.min(1, S.value.rLog * 1.6)) }] }));
  const spoon = useAnimatedStyle(() => {
    const r = S.value.rLog;
    const up = Math.sin(Math.PI * Math.min(1, r * 1.2));
    return { opacity: Math.min(1, r * 3), transform: [{ translateX: -16 * clamp01(r * 1.3 - 0.2) }, { translateY: -4 - 12 * up + 6 * clamp01(r * 1.3 - 0.3) }, { rotate: `${-200 * clamp01(r * 1.2)}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, shut]}><LessonPicture name="psych7-log-shut" /></Animated.View>
      <Animated.View style={[styles.rider, open]}><LessonPicture name="psych7-log-open" /></Animated.View>
      <Animated.View style={[styles.logLine, line]} />
      <Animated.View style={[styles.rider, spoon]}>
        <View style={styles.spoonBowl} />
        <View style={styles.spoonHandle} />
      </Animated.View>
    </Animated.View>
  );
}
/** The tally card propped against the pot: its marks written in, the fifth struck by the right pick. */
function TallyCard({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rCups;
    return { opacity: S.value.cardIn, transform: [{ translateX: TALLY_C.x }, { translateY: TALLY_C.y - 3 * hop(r) }, { scale: SC * (0.7 + 0.3 * S.value.cardIn + 0.15 * hop(r)) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.tally} />
      {[0, 1, 2, 3].map((k) => <Mark key={k} S={S} k={k} />)}
      <Slash S={S} />
    </Animated.View>
  );
}
function Mark({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.01, clamp01(S.value.marks - k)) }] }));
  return <Animated.View style={[styles.mark, { left: -3.4 + k * 1.8 }, st]} />;
}
function Slash({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01((S.value.marks - 4) * 3), transform: [{ rotate: '-58deg' }, { scaleX: Math.max(0.01, clamp01((S.value.marks - 4) * 2)) }] }));
  return <Animated.View style={[styles.slash, st]} />;
}
function Cup({ S, k }: { S: SharedValue<any>; k: 'cupA' | 'cupB' }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value[k].x }, { translateY: S.value[k].y }, { scale: SC }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="psych7-cup" /></Animated.View>;
}
/** The gold label, a band round the cup that carries it. */
function Label({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.label.x }, { translateY: S.value.label.y }, { scale: SC }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.gold} /></Animated.View>;
}
/** The brass telegraph key: its lever goes down when pressed. */
function TelegraphKey({ S }: { S: SharedValue<any> }) {
  const lever = useAnimatedStyle(() => ({ transform: [{ rotate: `${8 * S.value.keyDown}deg` }] }));
  return (
    <>
      <View style={styles.keyBase} />
      <Animated.View style={[styles.keyLever, lever]} />
      <View style={styles.keyKnob} />
    </>
  );
}
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.pencil.x }, { translateY: S.value.pencil.y }, { rotate: `${S.value.pencil.rot}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pencil} /><View style={styles.pencilTip} /></Animated.View>;
}
/** The card the psychologist wrote to catch him: PRICELESS, then face down on the bench. */
function PriceCard({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    return {
      opacity: v.priceO,
      transform: [{ translateX: v.price.x }, { translateY: v.price.y }, { scaleY: v.price.sy }, { scaleX: Math.max(0.04, Math.abs(1 - 2 * v.price.flip)) }],
    };
  });
  const words = useAnimatedStyle(() => ({ opacity: S.value.price.flip < 0.5 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.card, { left: -PRICE.w / 2, top: -6.5, width: PRICE.w, height: 13 }]}>
        <Animated.View style={words}>
          <Text style={[styles.plateText, { width: PRICE.w - 2 }]}>PRICELESS</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
/** What he is sure he remembers: a tray of glasses in a thought bubble; a wrong pick rebuilds it. */
function Bubble({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const r = v.rMem;
    return { opacity: v.bubble, transform: [{ translateX: 240 + shake(r, 3) }, { translateY: 392 }, { scale: 0.6 + 0.4 * v.bubble + 0.12 * Math.sin(Math.PI * Math.min(1, r)) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.trail, { left: -17, top: 17, width: 5, height: 5, borderRadius: 2.5 }]} />
      <View style={[styles.trail, { left: -13, top: 11, width: 7, height: 7, borderRadius: 3.5 }]} />
      <View style={styles.bubble} />
      <View style={styles.memTray} />
      {[0, 1, 2].map((k) => <Glass key={k} S={S} k={k} />)}
    </Animated.View>
  );
}
function Glass({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rMem;
    const f = Math.sin(Math.PI * Math.min(1, r * 1.2));
    return {
      transform: [
        { translateX: -9 + k * 9 + f * (k - 1) * 5 },
        { translateY: 2 - f * (k === 1 ? 7 : 3) },
        { rotate: `${f * (k - 1) * 40}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.glass} /></Animated.View>;
}

// ── the concourse ────────────────────────────────────────────────────────────

/** Steam from the engines beyond the screen wall, rising and thinning under the glass. */
const PUFFS = [[HX + 330, 0], [HX + 352, 1.1], [HX + 80, 2.2], [HX + 312, 3.0], [HX + 120, 0.6]] as const;
function Steam({ S }: { S: SharedValue<any> }) {
  return <>{PUFFS.map(([x, ph], k) => <Puff key={k} S={S} x={x} ph={ph} />)}</>;
}
function Puff({ S, x, ph }: { S: SharedValue<any>; x: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const c = (S.value.t * 0.18 + ph * 0.27) % 1;
    return { opacity: 0.85 * (1 - c), transform: [{ translateX: x + 10 * c + 4 * Math.sin(S.value.t * 0.6 + ph) }, { translateY: 392 - 80 * c }, { scale: 0.6 + 1.2 * c }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.puff} /><View style={styles.puff2} /></Animated.View>;
}
/** The train at gate 5: it pulls out on b16. */
function Train({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: HX + TRAIN.x + S.value.trainX }, { translateY: TRAIN.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="psych7-train" /></Animated.View>;
}
/** The crowd at gate 2, three knots of travellers: they glance at each other; a wrong pick sends a shrug through them. */
function Crowd({ S }: { S: SharedValue<any> }) {
  return <>{KNOTS.map((g, k) => <Knot key={g.k} S={S} k={k} x={g.x} y={g.y} name={`psych7-crowd-${g.k}`} />)}</>;
}
function Knot({ S, k, x, y, name }: { S: SharedValue<any>; k: number; x: number; y: number; name: string }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const r = v.rCrowd;
    const shrug = Math.sin(Math.PI * Math.min(1, Math.max(0, r * 1.5 - k * 0.12)));
    const turn = k === 1 ? 1 - 2 * v.glance : 1;
    return { transform: [{ translateX: HX + x }, { translateY: y - 5 * shrug }, { scaleX: Math.abs(turn) < 0.06 ? 0.06 : turn }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name={name} /></Animated.View>;
}
/** The departures board: the right pick flips the five past ten's row and lights it. */
const ROWS = [['9:50', 'LEEDS', '2'], ['10:05', 'YORK', '5'], ['10:20', 'BATH', '3']] as const;
function Board({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rBoard;
    return { transform: [{ translateX: HX + BOARD.x }, { translateY: BOARD.y - 3 * hop(r) }, { scale: 1 + 0.08 * hop(r) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="psych7-board" />
      <Lit S={S} />
      {ROWS.map((row, r) => <Row key={row[0]} S={S} r={r} row={row} />)}
    </Animated.View>
  );
}
function Lit({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.rBoard * 2 - 0.6), transform: [{ scaleX: Math.max(0.01, clamp01(S.value.rBoard * 1.6 - 0.3)) }] }));
  return <Animated.View style={[styles.boardLit, st]} />;
}
function Row({ S, r, row }: { S: SharedValue<any>; r: number; row: readonly string[] }) {
  const st = useAnimatedStyle(() => {
    const f = r === 1 ? clamp01(S.value.rBoard * 2.4) : 1;
    return { transform: [{ scaleY: Math.max(0.08, Math.abs(Math.cos(f * Math.PI * 2))) }] };
  });
  return (
    <Animated.View style={[styles.boardRow, { top: 13 + r * 10.6 }, st]}>
      <Text style={[styles.boardText, { left: 1, width: 28 }]}>{row[0]}</Text>
      <Text style={[styles.boardText, { left: 31, width: 40 }]}>{row[1]}</Text>
      <Text style={[styles.boardText, { left: 74, width: 15, textAlign: 'center' }]}>{row[2]}</Text>
    </Animated.View>
  );
}
/** The station clock: a couple of minutes to the train; a wrong pick spins its hands and swings it. */
function StationClock({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => {
    const r = S.value.rClock;
    return { transform: [{ translateX: HX + CLOCK.x }, { translateY: CLOCK.y }, { rotate: `${shake(r, 9)}deg` }] };
  });
  const minute = useAnimatedStyle(() => ({ transform: [{ rotate: `${12 + 720 * S.value.rClock}deg` }] }));
  const hour = useAnimatedStyle(() => ({ transform: [{ rotate: `${301 + 60 * S.value.rClock}deg` }] }));
  return (
    <Animated.View style={[styles.rider, body]} pointerEvents="none">
      <LessonPicture name="psych7-clock" />
      <Animated.View style={[styles.clockPivot, hour]}><View style={[styles.clockHand, { top: -6, height: 6, width: 1.6, left: -0.8 }]} /></Animated.View>
      <Animated.View style={[styles.clockPivot, minute]}><View style={[styles.clockHand, { top: -9, height: 9, width: 1, left: -0.5 }]} /></Animated.View>
      <View style={styles.clockPin} />
    </Animated.View>
  );
}
/** The chocolate bar: it drops into the drawer, then rides in his hand. */
function Bar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.barO,
    transform: [{ translateX: S.value.bar.x }, { translateY: S.value.bar.y }, { rotate: `${S.value.bar.rot}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.bar} /><View style={styles.foil} /></Animated.View>;
}
function Ticket({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.ticket.o, transform: [{ translateX: S.value.ticket.x }, { translateY: S.value.ticket.y }, { rotate: '-12deg' }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.ticket} /><View style={styles.ticketStripe} /></Animated.View>;
}
function Coin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.coinO, transform: [{ translateX: S.value.coin.x }, { translateY: S.value.coin.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.coin} /></Animated.View>;
}
/** KITCHEN TIMER: the sticker under the chronoscope, read out on b10. */
function StickerPlate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.sticker, transform: [{ scale: 0.8 + 0.2 * S.value.sticker }] }));
  return (
    <Animated.View style={[styles.plate, { left: 216, top: 472, width: 82, height: 14 }, st]} pointerEvents="none">
      <Text style={[styles.plateText, { width: 80 }]}>KITCHEN TIMER</Text>
    </Animated.View>
  );
}
/** FIRST CLASS, held up with the ticket on b17. */
function FirstClass({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.first,
    transform: [{ translateX: S.value.ticket.x }, { translateY: S.value.ticket.y - 16 }, { scale: 0.8 + 0.2 * S.value.first }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.plate, { left: -36, top: -7, width: 72, height: 14 }]}>
        <Text style={[styles.plateText, { width: 70 }]}>FIRST CLASS</Text>
      </View>
    </Animated.View>
  );
}
/** The fade through on the walk out of the laboratory. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  { x: JAR.x, y: 490, w: 40, lines: ['BEANS'] },
  { x: BOOK.x, y: 474, w: 50, lines: ['HIS', 'OPINION'] },
  { x: 314, y: 490, w: 80, lines: ['SWAPPED CUPS'] },
];
const Q2_PLATES: Plate[] = [
  { x: 240, y: 360, w: 68, lines: ['HIS MEMORY'] },
  { x: 320, y: 474, w: 52, lines: ['LOGBOOK'] },
  { x: 368, y: 490, w: 62, lines: ['METRONOME'] },
];
const Q3_PLATES: Plate[] = [
  { x: 104, y: 402, w: 64, lines: ['THE CROWD'] },
  { x: BOARD.x, y: 340, w: 60, lines: ['THE BOARD'] },
  { x: 362, y: 293, w: 58, lines: ['THE CLOCK'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q2' | 'q3'; items: Plate[] }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {items.map((g) => (
        <View key={g.lines.join(' ')} style={[styles.plate, { left: g.x - g.w / 2, top: g.y, width: g.w, height: 4 + 10 * g.lines.length }]}>
          {g.lines.map((l) => <Text key={l} style={[styles.plateText, { width: g.w - 2 }]}>{l}</Text>)}
        </View>
      ))}
    </Animated.View>
  );
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean; seal?: 'br' | 'tr' };
/** RUN THE TEST: which would show whether the gold label changed the taste? */
const TEST_Q: Q[] = [
  { id: 'beans', left: 190, top: 432, w: 44, h: 74, r: 5, correct: false },
  { id: 'opinion', left: 238, top: 452, w: 50, h: 46, r: 5, correct: false },
  { id: 'cups', left: 276, top: 438, w: 78, h: 68, r: 5, correct: true },
];
/** FIND THE RECORD: which could settle what was dropped that day? */
const RECORD_Q: Q[] = [
  { id: 'memory', left: 204, top: 378, w: 64, h: 64, r: 8, correct: false, seal: 'br' },
  { id: 'logbook', left: 293, top: 452, w: 52, h: 38, r: 5, correct: true },
  { id: 'metronome', left: 345, top: 434, w: 54, h: 72, r: 5, correct: false },
];
/** FIND YOUR PLATFORM: where should he look to find the five past ten? (the concourse, on screen) */
const PLATFORM_Q: Q[] = [
  { id: 'crowd', left: 50, top: 400, w: 100, h: 84, r: 6, correct: false },
  { id: 'board', left: 154, top: 276, w: 104, h: 80, r: 6, correct: true },
  { id: 'clock', left: 298, top: 266, w: 96, h: 52, r: 6, correct: false },
];
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2' | 'q3';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt={q.seal ?? 'tr'}
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
  hinge: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformOrigin: '0% 0%' },
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.cloudWhite.base },
  hand: { position: 'absolute', width: 1.2, borderRadius: 0.6, backgroundColor: W.ps7Ink.base, transformOrigin: '50% 100%' },
  wallClockPin: { position: 'absolute', left: 141.8, top: 282.8, width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.ps7Ink.base },
  needlePivot: { position: 'absolute', left: -0.4, top: -25.4, width: 0, height: 0 },
  needle: { position: 'absolute', left: -0.4, top: -2.6, width: 0.8, height: 2.6, backgroundColor: W.ps7Red.base },
  rodPivot: { position: 'absolute', left: 0, top: -6, width: 0, height: 0 },
  rod: { position: 'absolute', left: -0.45, top: -16, width: 0.9, height: 16, backgroundColor: W.ps7Steel.base },
  rodWeight: { position: 'absolute', left: -2, top: -12, width: 4, height: 2.6, borderRadius: 0.6, backgroundColor: W.ps7Steel.shade, borderWidth: 0.4, borderColor: INK },
  logLine: { position: 'absolute', left: 1.6, top: -4.4, width: 7.4, height: 1.3, backgroundColor: W.ps7Gold.base, transformOrigin: '0% 50%' },
  spoonBowl: { position: 'absolute', left: -2.2, top: -1.4, width: 4.4, height: 2.8, borderRadius: 1.4, backgroundColor: W.ps7Foil.base, borderWidth: 0.4, borderColor: INK },
  spoonHandle: { position: 'absolute', left: 2, top: -0.4, width: 6, height: 0.8, borderRadius: 0.4, backgroundColor: W.ps7Foil.shade },
  tally: { position: 'absolute', left: -5, top: -10, width: 10, height: 10, borderRadius: 0.6, backgroundColor: W.ps7Card.base, borderWidth: 0.5, borderColor: INK },
  mark: { position: 'absolute', top: -8.4, width: 0.7, height: 6.6, backgroundColor: W.ps7Ink.base, transformOrigin: '50% 100%' },
  slash: { position: 'absolute', left: -4.6, top: -5.4, width: 9, height: 0.7, backgroundColor: W.ps7Ink.base },
  gold: { position: 'absolute', left: -3.3, top: -4.6, width: 6.4, height: 2, backgroundColor: W.ps7Gold.base, borderWidth: 0.3, borderColor: INK },
  keyBase: { position: 'absolute', left: KEY.x - 5, top: KEY.y - 2.2, width: 10, height: 2.2, borderRadius: 0.6, backgroundColor: W.ps7Walnut.base, borderWidth: 0.5, borderColor: INK },
  keyLever: { position: 'absolute', left: KEY.x - 4, top: KEY.y - 4, width: 9, height: 1.2, borderRadius: 0.6, backgroundColor: W.ps7Brass.base, borderWidth: 0.3, borderColor: INK, transformOrigin: '0% 50%' },
  keyKnob: { position: 'absolute', left: KEY.x + 3.6, top: KEY.y - 6.4, width: 3, height: 2.6, borderRadius: 1.3, backgroundColor: W.ps7Ink.base },
  pencil: { position: 'absolute', left: -6, top: -0.6, width: 10, height: 1.2, borderRadius: 0.4, backgroundColor: W.ps7Pencil.base, borderWidth: 0.3, borderColor: INK },
  pencilTip: { position: 'absolute', left: -7.6, top: -0.3, width: 2, height: 0.6, backgroundColor: W.ps7Ink.base },
  card: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 2,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  trail: { position: 'absolute', backgroundColor: W.ps7Card.base, borderWidth: 0.8, borderColor: INK },
  bubble: { position: 'absolute', left: -20, top: -14, width: 40, height: 26, borderRadius: 13, backgroundColor: W.ps7Card.base, borderWidth: 1, borderColor: INK },
  memTray: { position: 'absolute', left: -14, top: 3, width: 28, height: 1.8, borderRadius: 0.9, backgroundColor: W.ps7Foil.base, borderWidth: 0.4, borderColor: INK },
  glass: { position: 'absolute', left: -2.4, top: -9, width: 4.8, height: 10, borderBottomLeftRadius: 1.2, borderBottomRightRadius: 1.2, backgroundColor: W.ps7Glass.base, borderWidth: 0.6, borderColor: INK },
  puff: { position: 'absolute', left: -9, top: -6, width: 18, height: 12, borderRadius: 6, backgroundColor: W.ps7Steam.base },
  puff2: { position: 'absolute', left: -2, top: -10, width: 12, height: 10, borderRadius: 5, backgroundColor: W.ps7Steam.base },
  boardRow: { position: 'absolute', left: -45, width: 90, height: 10 },
  boardText: { position: 'absolute', top: -0.4, height: 10, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: W.ps7Amber.base, includeFontPadding: false },
  boardLit: { position: 'absolute', left: -45.5, top: 23.1, width: 91, height: 10, borderRadius: 1, borderWidth: 1, borderColor: W.ps7Amber.base, backgroundColor: W.ps7Walnut.shade, transformOrigin: '0% 50%' },
  clockPivot: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  clockHand: { position: 'absolute', backgroundColor: W.ps7Ink.base, borderRadius: 0.5 },
  clockPin: { position: 'absolute', left: -1.2, top: -1.2, width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.ps7Red.base },
  bar: { position: 'absolute', left: -4, top: -1.6, width: 8, height: 3.2, borderRadius: 0.5, backgroundColor: W.ps7Choc.base, borderWidth: 0.4, borderColor: INK },
  foil: { position: 'absolute', left: 2.6, top: -1.6, width: 1.6, height: 3.2, backgroundColor: W.ps7Foil.base },
  ticket: { position: 'absolute', left: -4, top: -2.6, width: 8, height: 5.2, borderRadius: 0.5, backgroundColor: W.ps7Card.base, borderWidth: 0.5, borderColor: INK },
  ticketStripe: { position: 'absolute', left: -4, top: -1.6, width: 8, height: 1.2, backgroundColor: W.ps7Gold.base },
  coin: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.ps7Brass.base, borderWidth: 0.4, borderColor: INK },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  benchShadow: { position: 'absolute', left: 206, top: 499, width: 194, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  crowdShadow: { position: 'absolute', left: HX + 52, top: 476, width: 106, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.35 },
  machineShadow: { position: 'absolute', left: HX + 356, top: 499, width: 42, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (BEANS/HIS OPINION/SWAPPED CUPS,
// HIS MEMORY/LOGBOOK/METRONOME, THE CROWD/THE BOARD/THE CLOCK) read whole on the psych7-right and psych7-wrong sheets.
export function Psych7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych7Scene} band={[214, 514]} />;
}
