import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './econ7Script';
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
// economics-foundations-7, "Economics Recap: Dawn at the Exchange" — AN OLD TRADING
// EXCHANGE AT DAWN, THEN A HARBOUR MARKET IN THE MORNING. The recap of the road's six
// lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// economist (the top hat) chalks the morning's prices; the woman with the bun wanders in
// with a crate of tomatoes, cheerful and one step behind, and he sets her straight.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// econ7.mjs) laid in ONE WORLD that is 800 wide: the exchange at x 0–400, the harbour at
// x 400–800. The scene's own camera is the world's translation, `cam`: 0 in the exchange,
// −400 at the harbour, cut under a fade on the walk down (b13). Figures are posed in
// SCREEN space (world x + cam).
//
//   EXCHANGE, far → near: the glazed vault going lilac at dawn, the cornice (THE
//   EXCHANGE), the gallery's arches and its iron railing, the great clock (246, 304), the
//   street doors 4–44, two windows on the dawn 58–92 and 100–134, a third 362–396, the
//   panelled dado and a honey herringbone floor (454–514). MID: the URN on its table
//   38–86 (tap spout 76, 444; a cup waits under it), the TICKER on its pedestal (works
//   112, dome 101–123 × 404–437, its tape slot 97, 445), the PRICE BOARD 140–352 × 340–496
//   (TODAY'S PRICES; four slates — WHEAT 148–244 × 398–436 marked at 226, WOOL 248–344
//   marked at 266, COAL below with yesterday’s level line at 226, UMBRELLAS below with
//   its chip landing at 330, 465 and the van chalked at 256–270; the ledge 476–481), and
//   the CLERK'S DESK 356–400 with the brass balance (left pan 358, 436).
//   HARBOUR (its own x 0–400): the morning sky, warehouses and a church tower across the
//   water, the headland and its lighthouse, the sea (376–452); the BRIG riding at her
//   mooring 190–404; the quay (446–514) with bollards, cargo, the HARBOURMASTER'S HUT
//   108–216 (him in his door at 132; his NOTICE BOARD 156–208 × 356–404, a gap at 196,
//   384), the line strung from its eave to the lamp post at 389, and the FISH STALL 0–98
//   (counter top 456, the fish for her at 97, 453).
//
//   b0   alone at the board: chalks WHEAT up (chalk 1.1s), taps it (2.4s), takes out his
//        pocket ledger and turns a page (paper 3.8s), turns and chalks WOOL down (5.0s),
//        taps his chin, looks round at the empty hall and says his line.
//   b1   she comes in through the doors with her crate and sets it down, delighted.
//   b2   he taps the board (1.2s).    b3   she points at the urn.
//   b4   he taps the UMBRELLAS slate (0.8s).   b5   she pulls up the ticker's tape (0.4s).
//   b6   Q1 CHALK THE BOARD: an UP, a DOWN or a LEVEL chip onto the umbrella slate.
//   b7   her hands over her head.     b8   he chalks a van under it (1.0s); she turns to the urn.
//   b9   coffee pours into her cup (0.2s); she lifts it (2.0s) and sips.
//   b10  he points at her cup, then up at the dawn in the window.
//   b11  she reads the tape again (0.3s), sets her cup down (2.2s), throws her arms up;
//        he lays his chalk on the ledge and goes to the clerk's desk.
//   b12  he takes a coin off the balance (0.6s) and holds it up.
//   b13  both walk out to the right with her crate; a fade; the harbour.
//   b14  he points at her crate, then at the fish stall; she sets the crate down.
//   b15  Q2 SWAP AT THE QUAY: her crate, a borrowed rod or an empty basket.
//   b16  she takes her crate to the stall, sets it on the counter and takes a fish.
//   b17  he folds his arms and sighs.
//   b18  she lays the fish on her crate and drags three sacks of litter to the board.
//   b19  he looks from the sacks to the board and back.
//   b20  Q3 PIN THE NOTICE: three notices on the line.   b21, b22  at ease.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), everyone faces whom she
// or he talks to and walks the way they face (C18), and every hand that moves chalks,
// taps, holds, pours, points, carries or drags.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.9;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [9.78, 3.53, 5.73, 3.35, 5.55, 6.5, 0, 4.49, 5.36, 3.27, 5.3, 5.15, 6.52, 5.22, 5.97, 0, 4.88, 4.41, 5.62, 6.48, 0, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const SCARCE = at('scarce');
const COFFEE = at('coffee');
const DEMAND = at('demand');
const TICKER = at('ticker');
const UMBRELLA = at('umbrella');
const SUPPLY = at('supply');
const FREECUP = at('freecup');
const COST = at('cost');
const MINT = at('mint');
const INFLATE = at('inflate');
const HARBOUR = at('harbour');
const SPECIAL = at('special');
const SWAP = at('swap');
const FAIR = at('fair');
const SACKS = at('sacks');
const INCENTIVE = at('incentive');
const Q1 = BEATS.map((b) => (b.board ? 1 : 0));
const Q2 = BEATS.map((b) => (b.swap ? 1 : 0));
const Q3 = BEATS.map((b) => (b.notice ? 1 : 0));
const Q1_AT = Q1.indexOf(1);
const Q2_AT = Q2.indexOf(1);
const Q3_AT = Q3.indexOf(1);
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 9.78;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of the figure (its own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the harbour is x + 400) ──────────────────
const HX = 400;
const TH_HOME = 246;
const TH_DESK = 344;
const TH_EXIT = 446;
const TH_Q = HX + 330;
const BU_OFF = -30;
const BU_HOME = 84;
const BU_EXIT = 206;
const BU_Q = HX + 196;
const BU_STALL = HX + 98;
/** The cut to the harbour, seconds into b13, under the fade. */
const CUT = 2.6;

/** Each figure's walks on a beat: [share of the line it starts at, where to]; several legs run in turn. */
const TH_LEGS: Track[] = per((n) => (n < MINT ? [[0, TH_HOME]] : n === MINT ? [[0.13, TH_DESK]]
  : n === INFLATE ? [[0, TH_DESK]] : n === HARBOUR ? [[0.04, TH_EXIT]] : [[0, TH_Q]]));
const BU_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, BU_OFF]] : n === ARRIVE ? [[0.02, BU_HOME]]
  : n < HARBOUR ? [[0, BU_HOME]] : n === HARBOUR ? [[0.14, BU_EXIT]]
    : n < SWAP ? [[0, BU_Q]] : n === SWAP ? [[0.08, BU_STALL]] : n === FAIR ? [[0, BU_STALL]]
      : n === SACKS ? [[0.24, BU_Q]] : [[0, BU_Q]]));
/** Scripted turns: [share, facing]. A walk turns the figure first by itself. */
const TH_TURN: Track[] = per((n) => (n === WORK ? [[0, -1], [S0(4.42), 1], [S0(7.7), -1]]
  : n === DEMAND ? [[0, 1], [0.4, -1]]
    : n === SUPPLY ? [[0, 1], [0.6, -1]]
      : n === MINT ? [[0, -1], [0.6, -1]]
        : n === INFLATE ? [[0, 1], [0.34, -1]]
          : n === HARBOUR ? []
            : [[0, -1]]));
const BU_TURN: Track[] = per((n) => (n === COFFEE ? [[0, 1], [0.04, -1], [0.72, 1]]
  : n === FREECUP ? [[0, -1], [0.64, 1]]
      : n === MINT ? [[0, 1], [0.28, -1], [0.5, 1]]
        : n === SWAP ? [[0, 1], [0.86, 1]]
          : n === SACKS ? [[0, 1], [0.01, -1]]
            : [[0, 1]]));
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const BU_P = per((n) => (BEATS[n].speaker === 'bun' ? TALK : NOD));

// ── the board's chalk marks (world = screen in the exchange) ─────────────────
const WHEAT = { x: 226, top: 418, bot: 430 };
const WOOL = { x: 266, top: 418, bot: 430 };
const VAN = { x: 256, y: 459 };
const CHIP_LAND = { x: 330, y: 465 };
const CHIPS = [
  { id: 'level', x: 270, label: 'LEVEL', correct: false },
  { id: 'up', x: 306, label: 'UP', correct: true },
  { id: 'down', x: 342, label: 'DOWN', correct: false },
] as const;
const CHIP_Y = 489;
const LEDGE_CHALK = { x: 234, y: 475 };
// ── the urn, the cup, the ticker, the balance ────────────────────────────────
const SPOUT = { x: 76, y: 444 };
const CUP_T = { x: 76, y: 455 };
const SLOT = { x: 97, y: 445 };
const TAPE_REST = { x: 92, y: 494 };
const WHEEL = { x: 112, y: 420 };
const PAN = { x: 358, y: 435.6 };
// ── her crate (its handle's top), the fish, the sacks (harbour = x + 400) ────
const CRATE_EX = { x: 90, y: 478 };
const CRATE_Q = { x: BU_Q + 6, y: 478 };
const CRATE_C = { x: HX + 74, y: 434 };
const FISH_C = { x: HX + 97, y: 453 };
const FISH_ON_CRATE = { x: HX + 82, y: 440 };
const SACK_X = [HX + 44, HX + 62, HX + 80];
// ── Q2: the things at her feet; Q3: the notices on the line ──────────────────
const ROD = { x: HX + 226, y: 498 };
const BASKET = { x: HX + 292, y: 500 };
const NOTICES = [
  { id: 'litter', x: HX + 246, lines: ['A COIN PER', 'SACK OF', 'LITTER'], correct: false },
  { id: 'berth', x: HX + 304, lines: ['A COIN PER', 'CLEAN', 'BERTH'], correct: true },
  { id: 'broom', x: HX + 362, lines: ['A COIN PER', 'BROOM', 'BOUGHT'], correct: false },
] as const;
const NOTE = { y: 349, w: 56, h: 35 };
const BOARD_GAP = { x: HX + 196, y: 384 };

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { up: 1, down: 2, level: 3, crate: 4, rod: 5, basket: 6, litter: 7, berth: 8, broom: 9 };

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
/** How long a figure takes to turn round through a profile before it sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if the figure
 * faces the wrong way and must turn first (C18: always forwards). Eased in and out, and the
 * gait is driven by the same eased distance, so the feet stay planted.
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
/** The beat's walks, one leg after another, from where the figure is; and which way it faced as this leg began. */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number) {
  'worklet';
  let x = src;
  let f = faceSrc;
  for (let k = 0; k < legs.length; k += 1) {
    const w = walkOf(x, legs[k][1], legs[k][0] * L, f, b);
    if (k === legs.length - 1 || b < w.we) return { w, f };
    if (w.wd !== 0) f = w.wd;
    x = legs[k][1];
  }
  return { w: walkOf(x, x, 0, f, b), f };
}
/**
 * Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a
 * walk wins: it turns to face where it is going just before it sets off, and a scripted turn
 * the other way waits until it has arrived.
 */
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
/** A damped shake: a jolt that dies away over the reaction. */
function shake(r: number, amp: number): number {
  'worklet';
  return r > 0 && r < 1 ? Math.sin(r * 46) * amp * (1 - r) : 0;
}
/** Pop and settle: up past the mark and home again. */
function popOf(r: number): number {
  'worklet';
  return r <= 0 ? 0 : Math.sin(Math.min(1, r * 1.6) * Math.PI) * (1 - 0.4 * r);
}

// ── the hands, beat by beat ──────────────────────────────────────────────────
/** His right hand: the chalk; then the coin; pointing at the harbour; his arms folded. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(0.7), 8, 462, 0], [S0(0.98), 20, 431, 1], [S0(1.1), 20, 430, 1], [S0(1.75), 20, 418, 1],
      [S0(1.95), 20, 419, 1], [S0(2.25), 18, 427, 1], [S0(2.4), 20.5, 428, 1], [S0(2.55), 18, 428, 1], [S0(2.8), 8, 462, 0],
      [S0(4.7), 8, 462, 0], [S0(4.95), 20, 417, 1], [S0(5.0), 20, 418, 1], [S0(5.7), 20, 430, 1],
      [S0(5.9), 18, 432, 1], [S0(6.15), 12, 436, 1], [S0(6.4), 8, 462, 0],
      [S0(6.9), 8, 462, 0], [S0(7.1), 7, 434, 1], [S0(7.4), 7, 435, 1], [S0(7.6), 8, 462, 0]];
  }
  if (n === SCARCE) return [[0.08, 8, 462, 0], [0.17, 19, 426, 1], [0.2, 20, 424.5, 1], [0.21, 20.8, 426, 1], [0.23, 19, 427, 1], [0.34, 20, 446, 1], [0.44, 20, 464, 1], [0.54, 8, 462, 0]];
  if (n === DEMAND) return [[0.04, 8, 462, 0], [0.11, 11, 459, 1], [0.136, 11, 459, 1], [0.144, 12.4, 462, 1], [0.17, 11, 459, 1], [0.3, 8, 462, 0]];
  if (n === SUPPLY) {
    return [[0.08, 8, 462, 0], [0.16, 10, 459, 1], [0.187, 10, 459, 1], [0.29, 19, 459, 1],
      [0.38, 19, 467, 1], [0.48, 19, 467, 1], [0.56, 8, 462, 0]];
  }
  if (n === COST) return [[0.1, 8, 462, 0], [0.2, 24, 447, 1], [0.42, 24, 447, 1], [0.52, 22, 424, 1], [0.8, 22, 424, 1], [0.9, 8, 462, 0]];
  if (n === MINT) return [[0, 8, 462, 0], [0.04, 12, 474, 1], [0.08, 12, 474, 1], [0.11, 8, 462, 0]];
  if (n === INFLATE) {
    return [[0, 8, 462, 0], [0.065, 14, 436, 1], [0.092, 14, 436, 1], [0.16, 12, 422, 1], [0.84, 12, 422, 1], [0.91, 4, 447, 1], [0.97, 8, 462, 0]];
  }
  if (n === SPECIAL) return [[0.06, 8, 462, 0], [0.15, 24, 454, 1], [0.38, 24, 454, 1], [0.46, 26, 432, 1], [0.72, 26, 432, 1], [0.82, 8, 462, 0]];
  if (n === FAIR) return [[0.04, 8, 462, 0], [0.14, 5, 449, 1], [0.86, 5, 449, 1], [0.96, 8, 462, 0]];
  return NONE;
});
/** His left hand: the pocket ledger in b0; folded arms. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) return [[S0(2.75), 8, 462, 0], [S0(2.95), 4, 447, 1], [S0(3.2), 12, 440, 1], [S0(4.05), 12, 440, 1], [S0(4.25), 4, 447, 1], [S0(4.4), 8, 462, 0]];
  if (n === FAIR) return [[0.06, 8, 462, 0], [0.16, 6, 452, 1], [0.86, 6, 452, 1], [0.97, 8, 462, 0]];
  return NONE;
});
/** Her right hand: the crate, pointing at the urn, the tape, the umbrella, the cup, the coins, the fish, the rope. */
const BU_R: (readonly Key[])[] = per((n) => {
  if (n === ARRIVE) return [[0, 6, 472, 1], [0.72, 6, 472, 1], [0.8, 6, 478, 1], [0.86, 6, 478, 1], [0.93, 8, 462, 0]];
  if (n === COFFEE) return [[0.18, 8, 462, 0], [0.28, 22, 430, 1], [0.56, 22, 430, 1], [0.66, 8, 462, 0]];
  if (n === TICKER) return [[0, 8, 462, 0], [0.05, 13, 446, 1], [0.065, 13, 446, 1], [0.12, 10, 428, 1], [0.72, 10, 428, 1], [0.82, 8, 462, 0]];
  if (n === UMBRELLA) return [[0.06, 8, 462, 0], [0.16, 4, 410, 1], [0.7, 4, 410, 1], [0.8, 8, 462, 0]];
  if (n === FREECUP) return [[0, 8, 462, 0], [0.14, 8, 452, 1], [0.6, 8, 452, 1], [0.66, 8, 447, 1], [0.8, 9, 447, 1], [0.86, 6, 433, 1], [0.94, 6, 433, 1], [1, 9, 447, 1]];
  if (n === COST) return [[0, 9, 447, 1], [0.66, 9, 447, 1], [0.72, 6, 433, 1], [0.8, 6, 433, 1], [0.86, 9, 447, 1]];
  if (n === MINT) return [[0, 9, 447, 1], [0.36, 9, 447, 1], [0.42, 8, 452, 1], [0.44, 8, 452, 1], [0.48, 8, 462, 0], [0.56, 8, 462, 0], [0.64, 4, 412, 1], [0.84, 4, 412, 1], [0.92, 8, 462, 0]];
  if (n === HARBOUR) return [[0, 8, 462, 0], [0.06, 6, 478, 1], [0.1, 6, 478, 1], [0.14, 6, 472, 1]];
  if (n === SPECIAL) return [[0, 6, 472, 1], [0.86, 6, 472, 1], [0.92, 6, 478, 1], [0.95, 6, 478, 1], [0.99, 8, 462, 0]];
  if (n === SWAP) {
    return [[0, 8, 462, 0], [0.03, 6, 478, 1], [0.06, 6, 472, 1], [0.46, 6, 472, 1], [0.54, 24, 436, 1], [0.58, 24, 436, 1],
      [0.62, 14, 452, 1], [0.66, 9, 453, 1], [0.7, 9, 453, 1], [0.78, 8, 452, 1]];
  }
  if (n === FAIR) return [[0, 8, 452, 1]];
  if (n === SACKS) {
    return [[0, 8, 452, 1], [0.08, 18, 441, 1], [0.12, 18, 441, 1], [0.16, 16, 470, 1], [0.19, 16, 470, 1], [0.24, 4, 450, 1],
      [0.84, 4, 450, 1], [0.9, 8, 462, 0]];
  }
  return NONE;
});
/** Her left hand: the umbrella, the tape again, both arms up. */
const BU_L: (readonly Key[])[] = per((n) => {
  if (n === UMBRELLA) return [[0.08, 8, 462, 0], [0.18, 9, 411, 1], [0.7, 9, 411, 1], [0.8, 8, 462, 0]];
  if (n === MINT) return [[0, 8, 462, 0], [0.045, 13, 446, 1], [0.058, 13, 446, 1], [0.1, 10, 430, 1], [0.24, 10, 430, 1], [0.28, 8, 462, 0], [0.56, 8, 462, 0], [0.64, 9, 412, 1], [0.84, 9, 412, 1], [0.92, 8, 462, 0]];
  return NONE;
});

export default function Econ7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(23);
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
    const trAt = (ph: number) => {
      'worklet';
      return ease01(Math.max(0, b - ph * 0.2) / TR);
    };
    const tr = ease01(b / TR);
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

    // ── the camera: the exchange, then (cut under the fade) the harbour ──────
    const late = n > HARBOUR && carrySource(cv, 0, n, 0) > -HX + 1;
    const camNow = n < HARBOUR ? 0 : n === HARBOUR ? (b < CUT ? 0 : -HX) : -HX;
    const cam = carry(cv, 0, n, 0, camNow, 1);
    const fade = n === HARBOUR ? stage(b, 1, CUT - 0.55, CUT) * (1 - stage(b, 1, CUT, CUT + 0.45)) : late ? 1 - stage(b, 1, 0, 0.45) : 0;
    const cutDone = n === HARBOUR && b >= CUT;

    // ── her ─────────────────────────────────────────────────────────────────
    let srcB = carrySource(cv, 1, n, BU_OFF);
    if (late || cutDone) srcB = BU_Q;
    const fB = carrySource(cv, 2, n, 1);
    const lb = cutDone ? { w: walkOf(BU_Q, BU_Q, 0, 1, b), f: 1 } : legsOf(srcB, BU_LEGS[n], b, L, fB);
    const wB = lb.w;
    const xBw = carry(cv, 1, n, wB.x, wB.x, 1);
    const xB = xBw + cam;
    const dB = carry(cv, 2, n, 0, cutDone ? 1 : faceOf(lb.f, BU_TURN[n], b, L, wB), 1);
    let sb = bodyOf(wB, BU_P, n, t, b, 1);
    sb = keyed(sb, BU_R[n], u, xB, dB, 1);
    sb = keyed(sb, BU_L[n], u, xB, dB, -1);
    if (n === ARRIVE) sb = look(sb, -0.12 * hd(0.82, 0.88, 0.96, 1));
    if (n === TICKER) sb = look(sb, 0.12 * hd(0.12, 0.18, 0.66, 0.74));
    if (n === MINT) sb = look(sb, 0.1 * hd(0.06, 0.1, 0.22, 0.26) - 0.12 * hd(0.62, 0.68, 0.84, 0.9));
    if (n === FREECUP) sb = look(sb, 0.1 * hd(0.05, 0.1, 0.56, 0.62));
    if (n === SACKS) sb = look(sb, 0.08 * hd(0.06, 0.1, 0.2, 0.24));
    const prevB = carryFrom(heldB, n, hHold(BU_P[p], t, 1));
    const figB = keepHeld(heldB, wB.walking ? mixKeepLegs(prevB, sb, trAt(1)) : mixStance(prevB, sb, trAt(1)));

    // ── the economist ───────────────────────────────────────────────────────
    let srcT = carrySource(cv, 3, n, TH_HOME);
    if (late || cutDone) srcT = TH_Q;
    const fT = carrySource(cv, 4, n, -1);
    const lt = cutDone ? { w: walkOf(TH_Q, TH_Q, 0, -1, b), f: -1 } : legsOf(srcT, TH_LEGS[n], b, L, fT);
    const wT = lt.w;
    const xTw = carry(cv, 3, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const dT = carry(cv, 4, n, 0, cutDone ? -1 : faceOf(lt.f, TH_TURN[n], b, L, wT), 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1);
    if (n === WORK) {
      const reading = 0.14 * hd(S0(3.15), S0(3.3), S0(4.05), S0(4.2));
      const chin = -0.1 * hd(S0(6.9), S0(7.05), S0(7.4), S0(7.55));
      sh = look(sh, reading + chin - 0.1 * hd(S0(7.7), S0(8.0), S0(9.2), S0(9.6)));
    }
    if (n === FAIR) sh = look(sh, 0.16 * hd(0.2, 0.3, 0.46, 0.56));
    if (n === INCENTIVE) sh = look(sh, 0.12 * hd(0.04, 0.12, 0.26, 0.32) - 0.12 * hd(0.36, 0.44, 0.6, 0.68));
    if (n === COST) sh = look(sh, -0.1 * hd(0.52, 0.58, 0.78, 0.84));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(0)) : mixStance(prevT, sh, trAt(0)));

    const bu = pose(figB, xB, GROUND, K, dB, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(th, 'wrR');
    const tL = wristOf(th, 'wrL');
    const bR = wristOf(bu, 'wrR');
    const bL = wristOf(bu, 'wrL');
    const sT = dT < 0 ? -1 : 1;

    // ── the board: his chalk marks, his taps, his pocket ledger ─────────────
    const w0 = n === WORK;
    const mWheat = n > WORK ? 1 : w0 ? stage(b, L, S0(1.1), S0(2.0)) : 0;
    const mWool = n > WORK ? 1 : w0 ? stage(b, L, S0(5.0), S0(5.95)) : 0;
    const ledger = w0 ? hd(S0(2.9), S0(3.05), S0(4.2), S0(4.32)) : 0;
    const page = w0 ? stage(b, L, S0(3.72), S0(3.98)) : 0;
    const tap = w0 ? hd(S0(2.36), S0(2.4), S0(2.42), S0(2.5)) : n === SCARCE ? hd(0.2, 0.209, 0.215, 0.24) : n === DEMAND ? hd(0.136, 0.144, 0.15, 0.17) : 0;
    const tapAt = n === DEMAND ? { x: 258, y: 462 } : { x: 227, y: 428 };
    // the van, chalked in b8: the box, the cab, the wheels
    const van = n > SUPPLY ? 1 : n === SUPPLY ? clamp01((u - 0.187) / (0.45 - 0.187)) : 0;
    // the chalk: in his hand until he lays it on the ledge in b11
    const chalkDown = n > MINT ? 1 : n === MINT ? st(0.06, 0.08) : 0;
    const chalk = {
      x: lerp(tR.x, LEDGE_CHALK.x + cam, chalkDown),
      y: lerp(tR.y, LEDGE_CHALK.y, chalkDown),
      rot: lerp(sT * 34, 0, chalkDown),
    };

    // ── the cup: under the tap, in her hand, back on the table ──────────────
    const cupHeld = n === FREECUP ? st(0.6, 0.62) : n === COST ? 1 : n === MINT ? 1 - st(0.43, 0.45) : 0;
    const cup = { x: lerp(CUP_T.x + cam, bR.x, cupHeld), y: lerp(CUP_T.y, bR.y + 7, cupHeld) };
    const pour = n === FREECUP ? hd(0.05, 0.08, 0.58, 0.61) : 0;
    const fill = n > FREECUP ? 1 : n === FREECUP ? st(0.06, 0.6) : 0;
    // ── the tape: hanging from the slot, or up in her hand ──────────────────
    const tapeHeldR = n === TICKER ? hd(0.05, 0.065, 0.72, 0.8) : 0;
    const tapeHeldL = n === MINT ? hd(0.045, 0.058, 0.24, 0.28) : 0;
    const tapeHeld = Math.max(tapeHeldR, tapeHeldL);
    const tapeHand = tapeHeldR >= tapeHeldL ? bR : bL;
    const tapeEnd = { x: lerp(TAPE_REST.x + cam, tapeHand.x, tapeHeld), y: lerp(TAPE_REST.y, tapeHand.y + 2, tapeHeld) };
    const printing = carry(cv, 22, n, 0, n === TICKER || n === MINT ? 1 : 0, tr);
    // ── the coin: on the pan, held up, pocketed ─────────────────────────────
    const coinHeld = n === INFLATE ? hd(0.088, 0.094, 0.9, 0.92) : 0;
    const coinGone = n > INFLATE || (n === INFLATE && u > 0.91) ? 1 : 0;
    const coin = { x: lerp(PAN.x + cam, tR.x, coinHeld), y: lerp(PAN.y, tR.y - 3, coinHeld), o: 1 - coinGone };

    // ── her crate: carried in, set down, carried down, set down, onto the counter ─
    let crateHeld = 0;
    let crateRest = CRATE_EX;
    if (n === ARRIVE) crateHeld = 1 - st(0.84, 0.86);
    if (n === HARBOUR) crateHeld = cutDone ? 1 : st(0.08, 0.1);
    if (n === SPECIAL) crateHeld = 1 - st(0.93, 0.95);
    if (n >= SPECIAL) crateRest = CRATE_Q;
    if (n === SWAP) crateHeld = st(0.03, 0.05) * (1 - st(0.57, 0.59));
    if (n > SWAP || (n === SWAP && u > 0.3)) crateRest = CRATE_C;
    const rCrate = carry(cv, 5, n, 0, ans(4, Q2), tr);
    const crate = {
      x: lerp(crateRest.x + cam, bR.x, crateHeld),
      y: lerp(crateRest.y, bR.y + 1, crateHeld) - 10 * popOf(rCrate),
      sq: 1 + 0.08 * Math.sin(rCrate * Math.PI * 2) * (1 - rCrate),
      o: n < ARRIVE ? 0 : 1,
    };
    // ── the fish: on the counter, in her hand, on the crate ─────────────────
    const fishHeld = n === SWAP ? st(0.68, 0.7) : n === FAIR ? 1 : n === SACKS ? 1 - st(0.11, 0.13) : 0;
    const fishRest = n >= SACKS ? FISH_ON_CRATE : FISH_C;
    const fish = {
      x: lerp(fishRest.x + cam, bR.x, fishHeld),
      y: lerp(fishRest.y, bR.y + 1, fishHeld),
      rot: -90 * fishHeld,
    };
    // ── the sacks of litter, dragged on a rope to the board ─────────────────
    const dragged = n > SACKS ? BU_Q - BU_STALL : n === SACKS ? xBw - BU_STALL : 0;
    const rope = n === SACKS ? hd(0.16, 0.19, 0.86, 0.9) : 0;

    // ── the three games ─────────────────────────────────────────────────────
    const rUp = carry(cv, 6, n, 0, n > Q1_AT ? 1 : ans(1, Q1), tr);
    const rDown = carry(cv, 7, n, 0, ans(2, Q1), tr);
    const rLevel = carry(cv, 8, n, 0, ans(3, Q1), tr);
    const rRod = carry(cv, 9, n, 0, ans(5, Q2), tr);
    const rBasket = carry(cv, 10, n, 0, ans(6, Q2), tr);
    const rLitter = carry(cv, 11, n, 0, ans(7, Q3), tr);
    const rBerth = carry(cv, 12, n, 0, n > Q3_AT ? 1 : ans(8, Q3), tr);
    const rBroom = carry(cv, 13, n, 0, ans(9, Q3), tr);

    return {
      bu, th, cam, t, fade,
      marks: { wheat: carry(cv, 14, n, 0, mWheat, 1), wool: carry(cv, 15, n, 0, mWool, 1), van: carry(cv, 16, n, 0, van, 1) },
      tap, tapAt, ledger, page, tL, chalk, cup, pour, fill, tapeEnd, printing, coin, crate, fish, dragged, rope, bR,
      rUp, rDown, rLevel, rCrate, rRod, rBasket, rLitter, rBerth, rBroom,
      q1: carry(cv, 17, n, 0, Q1[n], tr),
      q2: carry(cv, 18, n, 0, Q2[n], tr),
      q3: carry(cv, 19, n, 0, Q3[n], tr),
      items: carry(cv, 20, n, 0, n === Q2_AT || n === Q2_AT + 1 ? 1 : 0, tr),
      notes: carry(cv, 21, n, 0, n >= Q3_AT - 2 ? 1 : 0, tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bu);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the exchange (x 0–400) and the harbour (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="econ7-hall-far" />
        <Motes S={SCENE} />
        <ClockHands S={SCENE} />
        <LessonPicture name="econ7-hall-mid" />
        <Steam S={SCENE} />
        <Wheel S={SCENE} />
        <LessonPicture name="econ7-dome" />
        <Marks S={SCENE} />
        <View style={styles.boardShadow} />
        <View style={styles.tableShadow} />
        <View style={styles.deskShadow} />
        <LessonPicture name="econ7-harbour-far" />
        <Cloud S={SCENE} x={HX + 70} y={246} s={1} k={0} />
        <Cloud S={SCENE} x={HX + 230} y={232} s={0.85} k={1} />
        <Cloud S={SCENE} x={HX + 350} y={262} s={0.7} k={2} />
        <Sparkles S={SCENE} />
        <Brig S={SCENE} />
        <Gull S={SCENE} k={0} />
        <Gull S={SCENE} k={1} />
        <LessonPicture name="econ7-harbour-mid" />
        <View style={styles.stallShadow} />
        <View style={styles.hutShadow} />
        <Pinned S={SCENE} />
      </Animated.View>
      <Tape S={SCENE} />
      <Cup S={SCENE} />
      <Coin S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      <Chalk S={SCENE} />
      <Ledger S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="second" wear={BY_ID.bun.pieces} />
      <Crate S={SCENE} />
      <Fish S={SCENE} />
      <Sacks S={SCENE} />
      {on(Q1) ? <Chips S={SCENE} /> : <LandedChip S={SCENE} />}
      {on(Q2) ? <Items S={SCENE} /> : null}
      <Notices S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
      {on(Q2) ? <Plates S={SCENE} k="q2" items={Q2_PLATES} /> : null}
      <Fade S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={BOARD_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={SWAP_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={NOTICE_Q} k="q3" /> : null}
    </View>
  );
}

// ── the living world ─────────────────────────────────────────────────────────

/** Dust turning slowly in the light from the two windows. */
const MOTES = [[72, 430, 0], [88, 452, 1.4], [116, 440, 2.6], [128, 470, 0.8], [104, 486, 3.4]];
function Motes({ S }: { S: SharedValue<any> }) {
  return <>{MOTES.map(([x, y, ph], k) => <Mote key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Mote({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * 0.35 + ph;
    return { opacity: 0.4 + 0.4 * Math.sin(a * 1.7), transform: [{ translateX: x + 5 * Math.sin(a) }, { translateY: y - 6 * Math.sin(a * 0.6) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.mote} /></Animated.View>;
}
/** The great clock's hands, the minute hand creeping round. */
function ClockHands({ S }: { S: SharedValue<any> }) {
  const mn = useAnimatedStyle(() => ({ transform: [{ rotate: `${42 + S.value.t * 0.8}deg` }] }));
  const hr = useAnimatedStyle(() => ({ transform: [{ rotate: `${-150 + S.value.t * 0.067}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.handHr, hr]} pointerEvents="none" />
      <Animated.View style={[styles.handMn, mn]} pointerEvents="none" />
      <View style={styles.handPin} pointerEvents="none" />
    </>
  );
}
/** Steam curling up off the urn's lid. */
function Steam({ S }: { S: SharedValue<any> }) {
  return <>{[0, 0.33, 0.66].map((ph, k) => <Puff key={k} S={S} ph={ph} />)}</>;
}
function Puff({ S, ph }: { S: SharedValue<any>; ph: number }) {
  const st = useAnimatedStyle(() => {
    const c = (S.value.t * 0.32 + ph) % 1;
    return { opacity: Math.sin(Math.PI * c) * 0.85, transform: [{ translateX: 58 + 3 * Math.sin(c * 7 + ph * 9) }, { translateY: 390 - 22 * c }, { scale: 0.6 + 0.8 * c }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.puff} /></Animated.View>;
}
/** The ticker's brass type-wheel, turning as it prints. */
function Wheel({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.t * 40 + 25 * S.value.printing * Math.sin(S.value.t * 9)}deg` }] }));
  return (
    <Animated.View style={[styles.wheel, st]} pointerEvents="none">
      <View style={styles.wheelRim} />
      <View style={styles.spokeH} />
      <View style={styles.spokeV} />
    </Animated.View>
  );
}
/** The tape: a strip of paper from the ticker's slot to where its end is (the floor, or her hand). */
function Tape({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const sx = SLOT.x + v.cam;
    const dx = v.tapeEnd.x - sx;
    const dy = v.tapeEnd.y - SLOT.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { width: len, transform: [{ translateX: sx }, { translateY: SLOT.y }, { rotate: `${deg}deg` }] };
  });
  return <Animated.View style={[styles.tape, st]} pointerEvents="none" />;
}
/** A fair-weather cloud over the harbour, drifting a little and back. */
function Cloud({ S, x, y, s, k }: { S: SharedValue<any>; x: number; y: number; s: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x + 9 * Math.sin(S.value.t * 0.05 + k * 1.7) }, { translateY: y }, { scale: s }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.cloud, { left: -26, top: -6, width: 52, height: 12, borderRadius: 6 }]} />
      <View style={[styles.cloud, { left: -16, top: -13, width: 20, height: 16, borderRadius: 8 }]} />
      <View style={[styles.cloud, { left: -2, top: -16, width: 22, height: 18, borderRadius: 9 }]} />
      <View style={[styles.cloudFoot, { left: -24, top: 3, width: 48, height: 3, borderRadius: 1.5 }]} />
    </Animated.View>
  );
}
/** The sun on the water: short glints that come and go. */
const GLINTS = [[HX + 30, 388, 0], [HX + 150, 392, 1.3], [HX + 232, 386, 2.1], [HX + 300, 394, 0.7], [HX + 360, 390, 2.8], [HX + 196, 398, 1.9]];
function Sparkles({ S }: { S: SharedValue<any> }) {
  return <>{GLINTS.map(([x, y, ph], k) => <Glint key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Glint({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const v = Math.sin(S.value.t * 0.9 + ph);
    return { opacity: Math.max(0, v), transform: [{ translateX: x + 4 * Math.sin(S.value.t * 0.3 + ph) }, { translateY: y }, { scaleX: 0.6 + 0.4 * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.glint} /></Animated.View>;
}
/** The brig riding at her mooring. */
function Brig({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: HX }, { translateY: 0.9 * Math.sin(S.value.t * 0.7) }, { rotate: `${0.22 * Math.sin(S.value.t * 0.7 + 0.6)}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="econ7-brig" /></Animated.View>;
}
/** A gull wheeling over the harbour. */
function Gull({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * (k ? 0.21 : 0.26) + k * 2.2;
    const x = HX + (k ? 270 : 90) + (k ? 60 : 70) * Math.cos(a);
    const y = (k ? 270 : 250) + 10 * Math.sin(a * 2);
    const flap = 0.75 + 0.25 * Math.sin(S.value.t * (k ? 5 : 6));
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: Math.sin(a) > 0 ? -0.85 : 0.85 }, { scaleY: 0.85 * flap }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="econ7-gull" /></Animated.View>;
}

// ── the board ────────────────────────────────────────────────────────────────

/** A chalk arrow drawn on a slate: the shaft as the chalk moves, then its head. */
function Arrow({ S, k, x, top, bot, up }: { S: SharedValue<any>; k: 'wheat' | 'wool'; x: number; top: number; bot: number; up: boolean }) {
  const shaft = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.001, clamp01(S.value.marks[k] / 0.72)) }] }));
  const head = useAnimatedStyle(() => ({ opacity: clamp01((S.value.marks[k] - 0.72) / 0.28) }));
  const tip = up ? top : bot;
  const s = up ? 1 : -1;
  return (
    <>
      <Animated.View style={[styles.chalkLine, { left: x - 0.8, top, height: bot - top, transformOrigin: up ? '50% 100%' : '50% 0%' }, shaft]} />
      <Animated.View style={[styles.rider, head]}>
        <View style={[styles.chalkLine, { left: x - 0.8 - 2.2, top: tip + s * 1.4 - 2.5, height: 5, transform: [{ rotate: `${s * 40}deg` }] }]} />
        <View style={[styles.chalkLine, { left: x - 0.8 + 2.2, top: tip + s * 1.4 - 2.5, height: 5, transform: [{ rotate: `${s * -40}deg` }] }]} />
      </Animated.View>
    </>
  );
}
/** WHEAT up and WOOL down, chalked in b0; the van under the umbrellas, chalked in b8; a puff of chalk at each tap. */
function Marks({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => ({ opacity: clamp01(S.value.marks.van / 0.45) }));
  const cab = useAnimatedStyle(() => ({ opacity: clamp01((S.value.marks.van - 0.45) / 0.2) }));
  const wheels = useAnimatedStyle(() => ({ opacity: clamp01((S.value.marks.van - 0.7) / 0.3) }));
  const dust = useAnimatedStyle(() => ({
    opacity: 0.8 * S.value.tap,
    transform: [{ translateX: S.value.tapAt.x }, { translateY: S.value.tapAt.y }, { scale: 0.6 + 0.8 * S.value.tap }],
  }));
  return (
    <>
      <Arrow S={S} k="wheat" x={WHEAT.x} top={WHEAT.top} bot={WHEAT.bot} up />
      <Arrow S={S} k="wool" x={WOOL.x} top={WOOL.top} bot={WOOL.bot} up={false} />
      <Animated.View style={[styles.vanBody, body]} />
      <Animated.View style={[styles.vanCab, cab]} />
      <Animated.View style={[styles.rider, wheels]}>
        <View style={[styles.vanWheel, { left: VAN.x + 1.4, top: VAN.y + 7.2 }]} />
        <View style={[styles.vanWheel, { left: VAN.x + 9.6, top: VAN.y + 7.2 }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, dust]}><View style={styles.dust} /></Animated.View>
    </>
  );
}
/** The chalk in his hand, and then on the ledge. */
function Chalk({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.chalk;
    return { transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: `${c.rot}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.chalk} /></Animated.View>;
}
/** His pocket ledger, opened to read; a page turns. */
function Ledger({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.ledger, transform: [{ translateX: S.value.tL.x }, { translateY: S.value.tL.y - 4 }] }));
  const leaf = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.cos(Math.PI * S.value.page) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.ledgerCover} />
      <View style={[styles.ledgerPage, { left: -6.2 }]} />
      <View style={[styles.ledgerPage, { left: 0.2 }]} />
      <View style={[styles.ledgerLine, { left: -5, top: -2.4 }]} />
      <View style={[styles.ledgerLine, { left: -5, top: 0 }]} />
      <Animated.View style={[styles.ledgerLeaf, leaf]} />
    </Animated.View>
  );
}

// ── the urn, the cup, the coin ───────────────────────────────────────────────

/** Her cup: under the tap, the coffee pouring in, then in her hand. */
function Cup({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.cup.x }, { translateY: S.value.cup.y }] }));
  const coffee = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.001, S.value.fill) }] }));
  const stream = useAnimatedStyle(() => ({ opacity: S.value.pour, transform: [{ translateX: SPOUT.x + 0.4 + S.value.cam }, { translateY: SPOUT.y }, { scaleX: 1 + 0.2 * Math.sin(S.value.t * 14) }] }));
  return (
    <>
      <Animated.View style={[styles.rider, stream]} pointerEvents="none"><View style={styles.stream} /></Animated.View>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.cupHandle} />
        <View style={styles.cupBody} />
        <Animated.View style={[styles.cupCoffee, coffee]} />
        <View style={styles.saucer} />
      </Animated.View>
    </>
  );
}
/** A brass coin off the balance's pan. */
function Coin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.coin.o, transform: [{ translateX: S.value.coin.x }, { translateY: S.value.coin.y }, { scaleX: 0.7 + 0.3 * Math.cos(S.value.t * 3) }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.coin} /></Animated.View>;
}

// ── the harbour's things ─────────────────────────────────────────────────────

function Crate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.crate;
    return { opacity: c.o, transform: [{ translateX: c.x }, { translateY: c.y }, { scaleY: c.sq }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="econ7-crate" /></Animated.View>;
}
function Fish({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const f = S.value.fish;
    return { transform: [{ translateX: f.x }, { translateY: f.y }, { rotate: `${f.rot}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="econ7-fish" /></Animated.View>;
}
/** Three sacks of litter, and the rope she drags them by. */
function Sacks({ S }: { S: SharedValue<any> }) {
  const rope = useAnimatedStyle(() => {
    const v = S.value;
    const ax = SACK_X[2] + v.dragged + v.cam;
    const ay = 474;
    const ex = lerp(ax + 7, v.bR.x, v.rope);
    const ey = lerp(486, v.bR.y, v.rope);
    const dx = ex - ax;
    const dy = ey - ay;
    return { width: Math.max(1, Math.hypot(dx, dy)), transform: [{ translateX: ax }, { translateY: ay }, { rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }] };
  });
  return (
    <>
      {SACK_X.map((x, k) => <Sack key={k} S={S} x={x} k={k} />)}
      <Animated.View style={[styles.rope, rope]} pointerEvents="none" />
    </>
  );
}
function Sack({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    return { transform: [{ translateX: x + v.dragged + v.cam }, { translateY: 500 }, { rotate: `${v.rope * 4 * Math.sin(v.t * 9 + k)}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="econ7-sack" /></Animated.View>;
}

// ── Q1: the three chips on the ledge ─────────────────────────────────────────

/** A chip's chalk mark: an up arrow, a down arrow or a level line. */
function ChipMark({ id }: { id: string }) {
  if (id === 'level') return <View style={[styles.chipChalk, { left: -6, top: -0.8, width: 12, height: 1.6 }]} />;
  const s = id === 'up' ? 1 : -1;
  return (
    <>
      <View style={[styles.chipChalk, { left: -0.8, top: -5, width: 1.6, height: 10 }]} />
      <View style={[styles.chipChalk, { left: -3.2, top: s * -3.6 - 2.2, width: 1.6, height: 4.6, transform: [{ rotate: `${s * 40}deg` }] }]} />
      <View style={[styles.chipChalk, { left: 1.6, top: s * -3.6 - 2.2, width: 1.6, height: 4.6, transform: [{ rotate: `${s * -40}deg` }] }]} />
    </>
  );
}
function ChipBody({ id }: { id: string }) {
  return (
    <>
      <View style={styles.chipFrame} />
      <View style={styles.chipSlate} />
      <ChipMark id={id} />
    </>
  );
}
function Chips({ S }: { S: SharedValue<any> }) {
  return <>{CHIPS.map((c) => <Chip key={c.id} S={S} id={c.id} x={c.x} />)}</>;
}
function Chip({ S, id, x }: { S: SharedValue<any>; id: string; x: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    let tx = x;
    let ty = CHIP_Y;
    let deg = 0;
    let sc = 1;
    if (id === 'up') {
      const f = smooth01(v.rUp / 0.7);
      const land = clamp01((v.rUp - 0.7) / 0.3);
      tx = lerp(x, CHIP_LAND.x, f);
      ty = lerp(CHIP_Y, CHIP_LAND.y, f) - 26 * Math.sin(Math.PI * f);
      deg = -20 * Math.sin(Math.PI * f);
      sc = lerp(1, 0.86, f) * (1 + 0.12 * Math.sin(Math.PI * land) * (1 - land));
    } else if (id === 'down') {
      const r = v.rDown;
      ty = CHIP_Y - 9 * popOf(r);
      tx = x + shake(r, 3.4);
    } else {
      const r = v.rLevel;
      ty = CHIP_Y - 6 * popOf(r);
      deg = 18 * Math.sin(r * Math.PI * 4) * (1 - r);
    }
    return { transform: [{ translateX: tx + v.cam }, { translateY: ty }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><ChipBody id={id} /></Animated.View>;
}
/** After Q1, the UP chip stays where it landed on the umbrella slate. */
function LandedChip({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.rUp, transform: [{ translateX: CHIP_LAND.x + S.value.cam }, { translateY: CHIP_LAND.y }, { scale: 0.86 }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><ChipBody id="up" /></Animated.View>;
}

// ── Q2: the rod and the basket at her feet ───────────────────────────────────

function Items({ S }: { S: SharedValue<any> }) {
  const rod = useAnimatedStyle(() => {
    const v = S.value;
    const r = v.rRod;
    return {
      opacity: v.items,
      transform: [{ translateX: ROD.x + v.cam }, { translateY: ROD.y - 8 * popOf(r) }, { rotate: `${-14 * Math.sin(r * Math.PI * 3) * (1 - r)}deg` }],
    };
  });
  const basket = useAnimatedStyle(() => {
    const v = S.value;
    const r = v.rBasket;
    const tip = smooth01(r / 0.5);
    return {
      opacity: v.items,
      transform: [{ translateX: BASKET.x + v.cam + 3 * tip }, { translateY: BASKET.y }, { rotate: `${-78 * tip + 8 * Math.sin(r * 18) * (1 - r)}deg` }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.rider, rod]} pointerEvents="none"><LessonPicture name="econ7-rod" /></Animated.View>
      <Animated.View style={[styles.rider, basket]} pointerEvents="none"><LessonPicture name="econ7-basket" /></Animated.View>
    </>
  );
}

// ── Q3: the notices on the line ──────────────────────────────────────────────

function Notices({ S }: { S: SharedValue<any> }) {
  return <>{NOTICES.map((g) => <Notice key={g.id} S={S} id={g.id} x={g.x} lines={g.lines} />)}</>;
}
function Notice({ S, id, x, lines }: { S: SharedValue<any>; id: string; x: number; lines: readonly string[] }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const cy = NOTE.y + NOTE.h / 2;
    let tx = x;
    let ty = cy + 0.8 * Math.sin(v.t * 1.3 + x);
    let deg = 1.6 * Math.sin(v.t * 1.1 + x * 0.1);
    let sc = 1;
    if (id === 'berth') {
      const f = smooth01(v.rBerth / 0.75);
      const land = clamp01((v.rBerth - 0.75) / 0.25);
      tx = lerp(x, BOARD_GAP.x, f);
      ty = lerp(ty, BOARD_GAP.y, f) - 30 * Math.sin(Math.PI * f);
      deg = lerp(deg, -4, f);
      sc = lerp(1, 0.34, f) * (1 + 0.15 * Math.sin(Math.PI * land) * (1 - land));
    } else {
      const r = id === 'litter' ? v.rLitter : v.rBroom;
      const crumple = smooth01(r / 0.35);
      const fall = clamp01((r - 0.3) / 0.55);
      const bounce = clamp01((r - 0.85) / 0.15);
      ty = lerp(ty, 496, fall * fall) - 6 * Math.sin(Math.PI * bounce);
      sc = lerp(1, 0.28, crumple);
      deg = deg + 220 * fall + shake(crumple, 12);
    }
    return { opacity: v.notes, transform: [{ translateX: tx + v.cam }, { translateY: ty }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  // a notice shrunk onto the board, or crumpled, keeps its look but not words too small to read
  const gone = useDerivedValue(() => {
    const v = S.value;
    return id === 'berth' ? smooth01((v.rBerth - 0.25) / 0.3) : smooth01((id === 'litter' ? v.rLitter : v.rBroom) / 0.2);
  });
  const words = useAnimatedStyle(() => ({ opacity: 1 - gone.value }));
  const scrawl = useAnimatedStyle(() => ({ opacity: id === 'berth' ? gone.value : 0 }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.note, { left: -NOTE.w / 2, top: -NOTE.h / 2, width: NOTE.w, height: NOTE.h }]}>
        <Animated.View style={[styles.noteWords, words]}>
          {lines.map((l) => <Text key={l} style={[styles.plateText, { width: NOTE.w - 2 }]}>{l}</Text>)}
        </Animated.View>
        <Animated.View style={[styles.noteScrawl, scrawl]}>
          {[0, 1, 2].map((k) => <View key={k} style={[styles.scrawlLine, { width: k === 1 ? 30 : 40 }]} />)}
        </Animated.View>
      </View>
      <View style={[styles.peg, { left: -NOTE.w / 2 + 6, top: -NOTE.h / 2 - 3 }]} />
      <View style={[styles.peg, { left: NOTE.w / 2 - 8, top: -NOTE.h / 2 - 3 }]} />
    </Animated.View>
  );
}
/** The red pin that strikes the notice home on the board. */
function Pinned({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const land = clamp01((S.value.rBerth - 0.78) / 0.22);
    return { opacity: land > 0 ? 1 : 0, transform: [{ translateX: BOARD_GAP.x }, { translateY: BOARD_GAP.y - 5 - 6 * (1 - land) }, { scale: 1 + 0.6 * Math.sin(Math.PI * land) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pin} /></Animated.View>;
}

/** The fade through on the walk down to the harbour. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = CHIPS.map((c) => ({ x: c.x, y: 499, w: 34, lines: [c.label] }));
const Q2_PLATES: Plate[] = [
  { x: CRATE_Q.x - HX, y: 499, w: 56, lines: ['TOMATOES'] },
  { x: ROD.x - HX + 20, y: 499, w: 34, lines: ['A ROD'] },
  { x: BASKET.x - HX, y: 499, w: 50, lines: ['A BASKET'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q2'; items: Plate[] }) {
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

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** CHALK THE BOARD: which mark goes on the umbrella slate? */
const BOARD_Q: Q[] = CHIPS.map((c) => ({ id: c.id, left: c.x - 17, top: 479, w: 34, h: 35, r: 4, correct: c.correct }));
/** SWAP AT THE QUAY: what does she take to the fish stall? (the harbour, on screen) */
const SWAP_Q: Q[] = [
  { id: 'crate', left: CRATE_Q.x - HX - 28, top: 474, w: 56, h: 40, r: 5, correct: true },
  { id: 'rod', left: ROD.x - HX + 3, top: 474, w: 34, h: 40, r: 5, correct: false },
  { id: 'basket', left: BASKET.x - HX - 25, top: 474, w: 50, h: 40, r: 5, correct: false },
];
/** PIN THE NOTICE: which notice does the harbourmaster pin up? (the harbour, on screen) */
const NOTICE_Q: Q[] = NOTICES.map((g) => ({ id: g.id, left: g.x - HX - NOTE.w / 2 - 1, top: NOTE.y - 4, w: NOTE.w + 2, h: NOTE.h + 7, r: 4, correct: g.correct }));
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
          disabled={answered} sealAt="tr"
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
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.ec7Cloud.base },
  boardShadow: { position: 'absolute', left: 140, top: 495, width: 214, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  tableShadow: { position: 'absolute', left: 36, top: 495, width: 54, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.38 },
  deskShadow: { position: 'absolute', left: 354, top: 495, width: 48, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.38 },
  stallShadow: { position: 'absolute', left: HX - 2, top: 496, width: 104, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.38 },
  hutShadow: { position: 'absolute', left: HX + 106, top: 451, width: 114, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.32 },
  mote: { position: 'absolute', left: -0.8, top: -0.8, width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: W.ec7Steam.base },
  handHr: { position: 'absolute', left: 245.2, top: 295, width: 1.6, height: 9, borderRadius: 0.8, backgroundColor: W.ec7Clock.base, transformOrigin: '50% 100%' },
  handMn: { position: 'absolute', left: 245.4, top: 290, width: 1.2, height: 14, borderRadius: 0.6, backgroundColor: W.ec7Clock.base, transformOrigin: '50% 100%' },
  handPin: { position: 'absolute', left: 244.4, top: 302.4, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.ec7Brass.base },
  puff: { position: 'absolute', left: -2.5, top: -2.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: W.ec7Steam.base },
  wheel: { position: 'absolute', left: WHEEL.x - 6, top: WHEEL.y - 6, width: 12, height: 12 },
  wheelRim: { position: 'absolute', left: 0, top: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 1.4, borderColor: W.ec7Brass.base },
  spokeH: { position: 'absolute', left: 1, top: 5.4, width: 10, height: 1.2, backgroundColor: W.ec7Brass.shade },
  spokeV: { position: 'absolute', left: 5.4, top: 1, width: 1.2, height: 10, backgroundColor: W.ec7Brass.shade },
  tape: { position: 'absolute', left: 0, top: -1.1, height: 2.2, backgroundColor: W.ec7Tape.base, borderWidth: 0.3, borderColor: W.ec7Tape.shade, transformOrigin: '0% 50%' },
  cloud: { position: 'absolute', backgroundColor: W.ec7Cloud.base },
  cloudFoot: { position: 'absolute', backgroundColor: W.ec7Cloud.shade },
  glint: { position: 'absolute', left: -6, top: -0.6, width: 12, height: 1.2, borderRadius: 0.6, backgroundColor: W.ec7Glint.base },
  chalkLine: { position: 'absolute', width: 1.6, borderRadius: 0.8, backgroundColor: W.ec7Chalk.base },
  vanBody: { position: 'absolute', left: VAN.x, top: VAN.y, width: 8.6, height: 6.6, borderWidth: 1.1, borderColor: W.ec7Chalk.base, borderRadius: 0.6 },
  vanCab: { position: 'absolute', left: VAN.x + 8, top: VAN.y + 2, width: 4.6, height: 4.6, borderWidth: 1.1, borderColor: W.ec7Chalk.base, borderTopRightRadius: 2 },
  vanWheel: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, borderWidth: 1, borderColor: W.ec7Chalk.base },
  dust: { position: 'absolute', left: -3, top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: W.ec7Chalk.shade },
  chalk: { position: 'absolute', left: -1, top: -0.8, width: 5, height: 1.6, borderRadius: 0.6, backgroundColor: W.ec7Chalk.base, borderWidth: 0.3, borderColor: INK },
  ledgerCover: { position: 'absolute', left: -7, top: -4.6, width: 14, height: 9.2, borderRadius: 1, backgroundColor: W.ec7Ledger.base, borderWidth: 0.6, borderColor: INK },
  ledgerPage: { position: 'absolute', top: -3.8, width: 6, height: 7.6, backgroundColor: W.ec7Page.base },
  ledgerLine: { position: 'absolute', width: 4, height: 0.5, backgroundColor: W.ec7Page.shade },
  ledgerLeaf: { position: 'absolute', left: 0, top: -3.8, width: 6, height: 7.6, backgroundColor: W.ec7Page.shade, transformOrigin: '0% 50%' },
  stream: { position: 'absolute', left: -0.6, top: 0, width: 1.2, height: 8, borderRadius: 0.6, backgroundColor: W.ec7Coffee.base },
  cupBody: { position: 'absolute', left: -2.8, top: -5, width: 5.6, height: 4.8, borderBottomLeftRadius: 2.2, borderBottomRightRadius: 2.2, backgroundColor: W.ec7China.base, borderWidth: 0.5, borderColor: INK },
  cupCoffee: { position: 'absolute', left: -2.2, top: -4.6, width: 4.4, height: 1.4, backgroundColor: W.ec7Coffee.base, transformOrigin: '50% 100%' },
  cupHandle: { position: 'absolute', left: 1.8, top: -4.2, width: 2.6, height: 2.8, borderRadius: 1.4, borderWidth: 0.7, borderColor: W.ec7China.shade },
  saucer: { position: 'absolute', left: -4, top: -0.6, width: 8, height: 1.2, borderRadius: 0.6, backgroundColor: W.ec7China.base, borderWidth: 0.4, borderColor: INK },
  coin: { position: 'absolute', left: -2.4, top: -2.4, width: 4.8, height: 4.8, borderRadius: 2.4, backgroundColor: W.ec7Brass.base, borderWidth: 0.5, borderColor: INK },
  rope: { position: 'absolute', left: 0, top: -0.6, height: 1.2, backgroundColor: W.ec7Rope.base, transformOrigin: '0% 50%' },
  chipFrame: { position: 'absolute', left: -12, top: -8, width: 24, height: 16, borderRadius: 1.6, backgroundColor: W.ec7Frame.base, borderWidth: 0.8, borderColor: INK },
  chipSlate: { position: 'absolute', left: -10, top: -6, width: 20, height: 12, backgroundColor: W.ec7Slate.base },
  chipChalk: { position: 'absolute', borderRadius: 0.8, backgroundColor: W.ec7Chalk.base },
  note: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 2,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  noteWords: { alignItems: 'center' },
  noteScrawl: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  scrawlLine: { height: 3, borderRadius: 1.5, marginVertical: 2.4, backgroundColor: W.ec7Page.shade },
  peg: { position: 'absolute', width: 2.4, height: 6, borderRadius: 0.8, backgroundColor: W.ec7Peg.base, borderWidth: 0.4, borderColor: INK },
  pin: { position: 'absolute', left: -2.2, top: -2.2, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: W.ec7Pin.base, borderWidth: 0.5, borderColor: INK },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (LEVEL/UP/DOWN on the ledge,
// TOMATOES/A ROD/A BASKET at her feet, the three notices on the line) read whole, right and wrong, on the econ7 sheets.
export function Econ7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ7Scene} band={[214, 514]} />;
}
