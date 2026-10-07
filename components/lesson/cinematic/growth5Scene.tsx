import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import SetArt, { type SetPart } from './SetArt';
import { oPoly } from './setShapes';
import { BEATS } from './growth5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, mixKeepLegs, moveTr, pose, travelStance, climb,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo, lipsAt } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, g5RingCurb, g5Mast, g5Ladder, g5Stand, g5Block, g5Trunk, g5LidOpen, g5LidShut, g5PosterRoll, g5PosterBill,
  g5Shoes, g5Whistle, g5Cane, g5Coil, g5Lamp, G5_WHISTLE_GRIP, G5_CANE_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-5, "Practise at the Edge" — INSIDE A CIRCUS BIG TOP:
// THREE ROPES AT THREE HEIGHTS, A SAFETY NET, AND A PROP TRUNK.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The old hand (the newsboy cap) walks the rope lying on the ring floor; the recruit
// (the bun) goes straight up the ladder to the high wire; the ringmaster (the top hat,
// with his cane) sends them both to the middle rope, over the net.
//
//   b0   the old hand walks the floor rope, arms out, perfectly, and lowers his arms.
//   b1   the ringmaster steps in, taps the floor rope twice with his cane, then points
//        the cane at the old hand.
//   b2   the recruit climbs the ladder, halfway up toward the high wire.
//   b3   "Down." — the cane jabs at the floor, then points up at the wire; she climbs down.
//   b4   the ringmaster strides to the middle rope and pats it twice near its end; the
//        recruit walks over and climbs the mounting block's two treads.
//   b5   PICK THE ROPE: the floor rope, the middle rope or the high wire.
//   b6   she steps out on the middle rope, wobbles, drops into the net, which gives and
//        throws her back up onto the rope further along; then she leans to the left.
//   b7   the cane points at her lean; he turns, lifts the prop trunk's lid, and a rolled
//        poster and a pair of slippers come up out of it, beside the whistle on its corner.
//   b8   the old hand walks over, climbs the block and steps out on the rope behind her,
//        wobbles once, and steadies.
//   b9   RUMMAGE THE PROP TRUNK: the whistle, the poster or the sparkly shoes.
//   b10  he takes the whistle off the trunk; she walks on along the rope, leans twice,
//        and each time he blows it and she straightens.
//   b11  the quotation; all three at ease, the two walkers still up on the rope.
//
// COMPOSITION, in stage units. The band is [200, 514], 314 tall, the tallest a band can
// be before it shrinks a label (check:legible); the figure is 78 tall in it. Far to
// near: the roof's red and cream panels converging above the band (y 200–352), a
// scalloped valance at 340–358 with a string of bulbs at 362, the lit side wall at
// 352–412, empty tiered seats at 404–450, the ring's red curb with its gold cap at
// 446–468, and the sawdust ring to the floor at 500. A followspot hangs at x 204 over
// the ring. Three ropes at three heights: the HIGH WIRE at y 258 from the left mast's
// pedestal (pole x 54, board 30–78) to the right mast's (pole x 384), with a ladder up
// the left mast (rails x 31 and 43); the MIDDLE ROPE at y 459, set back in the ring
// (its feet on y 488), from the mounting block (140–172, treads at 474 and 460) to a
// chrome stand at x 268, over a net slung at 474 between them; the FLOOR ROPE lying on
// the floor at the front, x 68–126, its end flaked into a coil. The prop trunk stands at
// the front right, 300–380 × 456–500, its whistle hanging off its left corner. The
// recruit climbs at x 22 and waits on the block at 162; the old hand walks 72 → 100; the
// ringmaster stands at 160, then 146, then 286 for the rest of the lesson, within reach
// of the rope's end and of the trunk. The recruit is on the rope at 234, then 254; the
// old hand at 178, behind her.
//
// ALIVE BUT NOT A PERSON: the bulbs twinkle, the followspot's beam sways and the high
// wire hums, all on the monotonic clock (L1). Each walker's PATH is one carried number
// along a route of way-points (walk, step, climb, fall), so a tap mid-path never moves
// anybody in one frame (group L), and two figures at most move at once (AP7).
//
// 476 Views on the stage (measured in the page), about 495 with a question's targets;
// nothing under a moving camera.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const TR = 0.85;
/** 78 units of figure in a 314-unit band. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-5), except b6, whose
 * wobble, fall and bounce run on a little after "Whoa!".
 */
const LINES = [3.52, 5.15, 5.33, 4.02, 4.64, 0, 5, 5.83, 4.57, 0, 5.43, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, waiting.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_SCOFF = is('scoff');
const A_DOWN = is('down');
const A_EDGE = is('edge');
const A_WOBBLE = is('wobble');
const A_WHISTLE = is('whistle');
const A_JOIN = is('join');
const A_CROSS = is('cross');
const Q1 = BEATS.map((b) => (b.rope ? 1 : 0));
const Q2 = BEATS.map((b) => (b.trunk ? 1 : 0));
const Q1_AT = Q1.indexOf(1);
const Q2_AT = Q2.indexOf(1);

// ── the big top ──────────────────────────────────────────────────────────────
const WIRE_Y = 258;
/** The middle rope's line, and where a walker's feet are on it; the floor under the net. */
const ROPE_Y = 459.5;
const ROPE_G = 458.5;
const RIG_G = 488;
/** The net's anchors, and how far down a body goes into it before it throws it back. */
const NET_Y = 474;
const NET_X0 = 176;
const NET_X1 = 264;
/** The middle rope runs from the mounting block's post to the stand. */
const ROPE_X0 = 170;
const NET_LOW = 481;
const STAND_X = 268;
/** How far she rises on one pull up the ladder: two of its rungs. */
const RUNG_PULL = 32;
const FLOOR_X0 = 68;
const FLOOR_X1 = 126;
/** The trunk, its lid's hinge line, and where the whistle hangs off its left corner. */
const TRUNK_X = 340;
const LID_Y = 456;
const WH_REST = { x: 306, y: 468 };
const WH_LIFT = { x: 320, y: 426 };

// ── who goes where: each walker is one number along a route of way-points ────
// A way-point is [how you get there, x, ground]: 0 walk, 1 step, 2 climb, 3 fall.
const WALK_S = 0;
const STEP_S = 1;
const CLIMB_S = 2;
const FALL_S = 3;
type Way = readonly number[];
type Keys = readonly (readonly number[])[];
/** The recruit: up the ladder and down, across to the block, up it, out on the rope, into the net and back, along. */
const B_ROUTE: Way[] = [
  [-1, 22, GROUND], [CLIMB_S, 22, 382], [CLIMB_S, 22, GROUND], [WALK_S, 144, RIG_G], [STEP_S, 150, 474],
  [STEP_S, 162, 460], [WALK_S, 184, ROPE_G], [FALL_S, 234, ROPE_G], [WALK_S, 254, ROPE_G],
];
/** [share of the line, way-point] — where along the route the recruit is, through each beat. */
const B_KEYS: Keys[] = [
  [[0, 0]], [[0, 0]], [[0.1, 0], [0.92, 1]], [[0.15, 1], [0.85, 2]], [[0.18, 2], [0.62, 3], [0.74, 4], [0.86, 5]],
  [[0, 5]], [[0, 5], [0.07, 6], [0.5, 7]], [[0, 7]], [[0, 7]], [[0, 7]], [[0.04, 7], [0.94, 8]], [[0, 8]], [[0, 8]],
];
/** The old hand: along the floor rope, then over to the block, up it and out on the middle rope. */
const C_ROUTE: Way[] = [
  [-1, 72, GROUND], [WALK_S, 100, GROUND], [WALK_S, 144, RIG_G], [STEP_S, 150, 474], [STEP_S, 162, 460], [WALK_S, 178, ROPE_G],
];
const C_KEYS: Keys[] = [
  [[0.06, 0], [0.82, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
  [[0.02, 1], [0.24, 2], [0.31, 3], [0.38, 4], [0.47, 5]], [[0, 5]], [[0, 5]], [[0, 5]], [[0, 5]],
];
/** Which way the old hand faces: toward the ringmaster, round to watch her climb, back. */
type Track = readonly (readonly number[])[];
const C_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1], [0.08, -1]], [[0, -1]], [[0, -1], [0.06, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The ringmaster walks on the ring floor, leg by leg: [share of the line, x]. */
const T_LEGS: Track[] = [
  [[0, 160]], [[0.02, 146]], [[0, 146]], [[0, 146]], [[0.04, 286]], [[0, 286]], [[0, 286]], [[0, 286]],
  [[0, 286]], [[0, 286]], [[0, 286]], [[0, 286]], [[0, 286]],
];
const T_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.01, 1], [0.52, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.44, 1], [0.74, -1]], [[0, -1]], [[0, -1]], [[0, 1], [0.13, -1]], [[0, -1]], [[0, -1]],
];
/** What each is doing with the body: talking while he speaks, nodding along while he does not. */
const B_P = [NOD, NOD, TALK, NOD, NOD, WAIT, TALK, NOD, NOD, WAIT, TALK, NOD, NOD];
const C_P = [TALK, NOD, NOD, NOD, NOD, WAIT, NOD, NOD, TALK, WAIT, NOD, NOD, NOD];
const T_P = [NOD, TALK, NOD, TALK, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, WAIT, NOD, NOD, NOD];

/** In the net: sat back, legs up, arms flung forward (both in front of her, AR4). */
const FLOP: Stance = {
  tilt: 0.5, neck: 0.22, bob: -6, adv: 0,
  footL: { x: 12, y: -10 }, footR: { x: 17, y: -14 },
  fistL: { x: 9, y: -27 }, fistR: { x: 21, y: -23 },
};

// ── the cane and the whistle, drawn about the point the hand holds ──────────
const CANE_W = 26;
const CANE_H = 26;
const CANE_REACH = CANE_H * (1 - G5_CANE_GRIP.y / G5_CANE_GRIP.h);
const CANE_ART = g5Cane(0, -(G5_CANE_GRIP.y / G5_CANE_GRIP.h - 0.5) * CANE_H, CANE_W, CANE_H);
const WH_W = 13;
const WH_H = 7.3;
const WH_ART = g5Whistle(
  -(G5_WHISTLE_GRIP.x / G5_WHISTLE_GRIP.w - 0.5) * WH_W, -(G5_WHISTLE_GRIP.y / G5_WHISTLE_GRIP.h - 0.5) * WH_H, WH_W, WH_H,
);
/** The slippers hang from their ribbons' knot, at (13, 1.5) of their 26 × 32. */
const SHOE_ART = g5Shoes(0, -(1.5 / 32 - 0.5) * 28, 22, 28);

// ── the still set ────────────────────────────────────────────────────────────
const ROOF_APEX = { x: 200, y: 40 };
const ROOF_BASE = 352;
const ROOF: SetPart[] = Array.from({ length: 21 }, (_, k) => {
  const xa = -253.6 + k * 43.4;
  const xb = xa + 43.4;
  return { ...oPoly('dark', [ROOF_APEX.x, ROOF_APEX.y, xb, ROOF_BASE, xa, ROOF_BASE]), nat: k % 2 ? 'g5TentCream' : 'g5TentRed' } as unknown as SetPart;
});
const CURB_ART = g5RingCurb(200, 457, 404, 22);
const MAST_L = g5Mast(54, 378, 48, 244);
const MAST_R = g5Mast(384, 378, 48, 244);
const LADDER_ART = g5Ladder(37, 381, 238, 238);
const BLOCK_ART = g5Block(156, 472, 32, 32);
const STAND_ART = g5Stand(STAND_X, 473, 14, 30);
const COIL_ART = g5Coil(FLOOR_X1 + 8, 497, 17, 7);
const LAMP_ART = g5Lamp(204, 212, 16, 14);
const TRUNK_ART = g5Trunk(TRUNK_X, 478, 80, 44);
const LID_OPEN_ART = g5LidOpen(TRUNK_X, LID_Y - 20, 80, 40);
const LID_SHUT_ART = g5LidShut(TRUNK_X, LID_Y - 3.5, 84, 9);
const POSTER_ART = g5PosterRoll(330, 362 + 46, 9, 92);
const BILL_ART = g5PosterBill(345, 378, 22, 28);
const BILL_PIVOT = { x: 334, y: 364 };
const BEAM: SetPart[] = [{ ...oPoly('dark', [199, 219, 209, 219, 268, 492, 140, 492]), nat: 'bulbLit' } as unknown as SetPart];
const BULBS = Array.from({ length: 13 }, (_, k) => 14 + k * 31);
const STRIPES = Array.from({ length: 7 }, (_, k) => 14 + k * 57);
const SCALLOPS = Array.from({ length: 14 }, (_, k) => -13 + k * 30);
const SEATS = [413, 424, 435];
/** The net: strands hanging from its top cord to the bottom of its curve. */
const NET_STRANDS = Array.from({ length: 10 }, (_, k) => NET_X0 + ((k + 1) * (NET_X1 - NET_X0)) / 11);

// ── how a figure moves ───────────────────────────────────────────────────────

/**
 * AR4: the explaining pose (259) rests its FAR hand raised and behind the spine. A person
 * explaining holds both hands in front of him, so the far one comes forward.
 */
function inFront(code: number, s: Stance): Stance {
  'worklet';
  return code === EXPLAIN ? { ...s, fistL: { x: 8, y: -3 } } : s;
}
function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return inFront(code, emoteStill(code, t, phase));
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return inFront(code, emoteStillLive(code, t, bt, phase));
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A hand held in the figure's own frame (pelvis-local, +x forward), so it rides with him (AR6, AR7.2). */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}
/**
 * Arms out for balance on a rope. Side-on, the near arm goes well out in front and the
 * far one only a little behind and low, so no raised hand is thrown back (AR4).
 */
function balance(s: Stance, w: number, wob: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return {
    ...s,
    fistR: { x: lerp(s.fistR.x, 23, w), y: lerp(s.fistR.y, -19 - 7 * wob, w) },
    fistL: { x: lerp(s.fistL.x, -5, w), y: lerp(s.fistL.y, -14 + 5 * wob, w) },
  };
}
/** A smoothstep between key frames: where along the route a walker is at share `u` of the line. */
function keyAt(keys: Keys, u: number): number {
  'worklet';
  if (u <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k += 1) {
    if (u < keys[k][0]) {
      const a = keys[k - 1];
      const z = keys[k];
      return lerp(a[1], z[1], ease01((u - a[0]) / (z[0] - a[0])));
    }
  }
  return keys[keys.length - 1][1];
}
/** One step up: the lead foot onto the next tread, then the body, then the trailing foot. */
function stepPose(base: Stance, u: number, x0: number, g0: number, x1: number, g1: number, dir: number) {
  'worklet';
  const la = ease01(clamp01(u / 0.45));
  const r = ease01(clamp01((u - 0.25) / 0.5));
  const ta = ease01(clamp01((u - 0.55) / 0.45));
  const x = lerp(x0, x1, r);
  const g = lerp(g0, g1, r);
  const lx = lerp(x0, x1, la) + dir * 3;
  const ly = lerp(g0, g1, la) - Math.sin(Math.PI * la) * 5;
  const tx = lerp(x0, x1, ta) - dir * 3;
  const ty = lerp(g0, g1, ta) - Math.sin(Math.PI * ta) * 5;
  const kd = K * (dir < 0 ? -1 : 1);
  const s: Stance = {
    ...base,
    footR: { x: (lx - x) / kd, y: (ly - g) / K },
    footL: { x: (tx - x) / kd, y: (ty - g) / K },
  };
  return { s, x, g };
}
/**
 * Off the rope and back: a wobble of one and a half swings, the drop into the net
 * (accelerating), the net giving under her, and the throw back up in an arc that lands
 * her on the rope further along. One local `u`, so a tap anywhere in it is continuous.
 */
function fallPose(live: Stance, u: number, x0: number, g0: number, x1: number, g1: number) {
  'worklet';
  let x = x0;
  let g = g0;
  if (u >= 0.25 && u < 0.45) {
    const f = (u - 0.25) / 0.2;
    g = g0 + (NET_LOW - g0) * f * f;
    x = x0 + 6 * f;
  } else if (u >= 0.45 && u < 0.55) {
    g = NET_LOW + 3 * Math.sin(((u - 0.45) / 0.1) * Math.PI * 0.5);
    x = x0 + 6;
  } else if (u >= 0.55) {
    const r = (u - 0.55) / 0.45;
    x = lerp(x0 + 6, x1, r);
    g = lerp(NET_LOW + 3, g1, r) - 168 * r * (1 - r);
  }
  const wob = u < 0.25 ? Math.sin((u / 0.25) * Math.PI * 3) * (1 - u) : 0;
  const fw = clamp01((u - 0.24) / 0.08) * (1 - clamp01((u - 0.72) / 0.2));
  const s0: Stance = { ...live, tilt: live.tilt + 0.15 * wob };
  return { s: mixStance(s0, FLOP, fw), x, g, wob, flop: fw };
}
/** A walker's body at route position `p`: where he is, on what ground, and how. */
function routeAt(R: Way[], p: number, hold: Stance, live: Stance, dir: number) {
  'worklet';
  const n = R.length - 1;
  const k = Math.min(n - 1, Math.max(0, Math.floor(p)));
  const u = clamp01(p - k);
  const a = R[k];
  const z = R[k + 1];
  const kind = z[0];
  if (kind === STEP_S && u > 0 && u < 1) {
    const sp = stepPose(live, u, a[1], a[2], z[1], z[2], dir);
    return { s: sp.s, x: sp.x, g: sp.g, moving: true, wob: 0, flop: 0 };
  }
  if (kind === CLIMB_S) {
    const g = lerp(a[2], z[2], u);
    const up = clamp01((GROUND - g) / 8);
    // two rungs a half cycle: long, steady pulls as the body rises (rig.climb), so a hand
    // changes direction under four times on the way up or down (AR5)
    const s = mixStance(live, climb(((GROUND - g) / RUNG_PULL) * Math.PI), up);
    return { s, x: a[1], g, moving: u > 0 && u < 1, wob: 0, flop: 0 };
  }
  if (kind === FALL_S) {
    const f = fallPose(live, u, a[1], a[2], z[1], z[2]);
    return { s: f.s, x: f.x, g: f.g, moving: u > 0 && u < 1, wob: f.wob, flop: f.flop };
  }
  if (u > 0 && u < 1 && Math.abs(z[1] - a[1]) > 0.5) {
    const s = travelStance(a[1], z[1], hold, hold, live, u, WALK, 0);
    return { s, x: lerp(a[1], z[1], u), g: lerp(a[2], z[2], u), moving: true, wob: 0, flop: 0 };
  }
  const end = u >= 1 ? z : a;
  return { s: live, x: end[1], g: end[2], moving: false, wob: 0, flop: 0 };
}

/**
 * Where the ringmaster stands at time `b` of a beat, leg by leg, starting from WHERE HE
 * IS ON SCREEN (`src`), so a tap mid-walk cannot put him anywhere in one frame (group L).
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
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
    const start = Math.max(legs[k][0] * L, free);
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
/** Which way a figure faces at time `b`, turning through a profile from its screen facing. */
function faceOf(src: number, turns: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let d = src;
  for (let k = 0; k < turns.length; k += 1) {
    const at = turns[k][0] * L;
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
/** The cane's swing from straight down toward where he faces, in radians, to aim its tip at a point. */
function aimOf(wx: number, wy: number, tx: number, ty: number, dir: number) {
  'worklet';
  return Math.atan2((tx - wx) * (dir < 0 ? -1 : 1), ty - wy);
}

const CAM = followMoves(BEATS.map(() => 200), BEATS.map(kindOf), seedOf('personal-growth'));
const ROPE_IDS = ['floor', 'middle', 'high'];
const TRUNK_IDS = ['whistle', 'poster', 'shoes'];

export default function Growth5Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(28);
  const on = useLinger(i);
  // Which thing the reader tapped on each question, for the stage's own answer to it.
  const pkA = useSharedValue(-1);
  const pkB = useSharedValue(-1);
  useEffect(() => {
    if (i === Q1_AT) pkA.value = picked ? ROPE_IDS.indexOf(picked) : -1;
    if (i === Q2_AT) pkB.value = picked ? TRUNK_IDS.indexOf(picked) : -1;
  }, [i, picked, pkA, pkB]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    // each figure settles into its new pose a moment after the one before it, never in step (N22)
    const trAt = (ph: number) => { 'worklet'; return ease01(Math.max(0, b - ph * 0.2) / TR); };
    const L = lineOf(LINES, n);
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };
    const q = qv.value;
    const qa = pkA.value;
    const qb = pkB.value;

    // ── the stage's answer to PICK THE ROPE (b5), carried off after ──────────
    // the middle rope lights and the net gives a welcoming bounce as she tries it with a
    // toe · the floor rope lights, then dulls to grey, and she sighs · the high wire
    // lights and shudders, and she flinches back
    const onQ1 = n === Q1_AT && qa >= 0;
    const ripe = ease01(clamp01(q / 0.3));
    const glowF = carry(cv, 15, n, 0, onQ1 && qa === 0 ? ripe : 0, tr);
    const greyF = carry(cv, 16, n, 0, onQ1 && qa === 0 ? ease01(clamp01((q - 0.4) / 0.5)) : 0, tr);
    const glowM = carry(cv, 17, n, 0, onQ1 && qa === 1 ? Math.sin(q * 30) * (1 - q) : 0, tr);
    const glowH = carry(cv, 18, n, 0, 0, tr);
    const shake = onQ1 && qa === 2 ? 4 * Math.sin(q * 38) * (1 - q) : 0;
    const boing = carry(cv, 19, n, 0, onQ1 && qa === 1 ? Math.sin(Math.PI * clamp01(q / 0.7)) : 0, tr);
    const rToe = carry(cv, 20, n, 0, onQ1 && qa === 1 ? ease01(clamp01((q - 0.15) / 0.45)) : 0, tr);
    const rSigh = carry(cv, 21, n, 0, onQ1 && qa === 0 ? ease01(clamp01((q - 0.3) / 0.5)) : 0, tr);
    // and the old hand, standing on the floor rope, gives it a long bored stretch
    const rYawn = carry(cv, 7, n, 0, onQ1 && qa === 0 ? Math.sin(Math.PI * clamp01(q / 0.95)) : 0, tr);
    const rFlinch = carry(cv, 22, n, 0,
      onQ1 && qa === 2 ? ease01(clamp01(q / 0.35)) * (1 - 0.6 * ease01(clamp01((q - 0.6) / 0.4))) : 0, tr);

    // ── the stage's answer to RUMMAGE THE PROP TRUNK (b9), left as it was after ─
    // the whistle rises out on its cord and shrills · the poster unrolls, then flops
    // over · the slippers glitter, then drop back into the trunk
    const onQ2 = n === Q2_AT && qb >= 0;
    // after the question each holds what is on screen (its own carry source)
    const after = n > Q2_AT;
    const liftNow = onQ2 && qb === 0 ? ease01(clamp01(q / 0.5)) : 0;
    const lift = carry(cv, 23, n, 0, after ? carrySource(cv, 23, n, 0) : liftNow, tr);
    const unrollNow = onQ2 && qb === 1 ? ease01(clamp01(q / 0.4)) : 0;
    const unroll = carry(cv, 24, n, 0, after ? carrySource(cv, 24, n, 0) : unrollNow, tr);
    const flopNow = onQ2 && qb === 1 ? ease01(clamp01((q - 0.5) / 0.45)) : 0;
    const flop = carry(cv, 25, n, 0, after ? carrySource(cv, 25, n, 0) : flopNow, tr);
    const dropU = clamp01((q - 0.45) / 0.4);
    const drop = carry(cv, 26, n, 0, after ? carrySource(cv, 26, n, 0) : onQ2 && qb === 2 ? dropU * dropU : 0, tr);
    const sparkle = carry(cv, 27, n, 0, onQ2 && qb === 2 ? Math.sin(Math.PI * clamp01(q / 0.5)) : 0, tr);
    const blastQ = onQ2 && qb === 0 ? Math.sin(Math.PI * clamp01((q - 0.35) / 0.55)) : 0;

    // ── the trunk's lid, lifted on b7, and what comes up out of it ──────────
    const lidNow = A_WHISTLE[n] ? st(0.54, 0.7) : n > 7 ? 1 : 0;
    const lid = carry(cv, 8, n, lidNow, lidNow, tr);
    const popNow = A_WHISTLE[n] ? st(0.6, 0.8) : n > 7 ? 1 : 0;
    const pop = carry(cv, 9, n, popNow, popNow, tr);

    // ── the recruit ──────────────────────────────────────────────────────────
    const pB = carry(cv, 0, n, keyAt(B_KEYS[p], 1), keyAt(B_KEYS[n], u), tr);
    const liveB = hLive(B_P[n], t, b, 0);
    const rb = routeAt(B_ROUTE, pB, hHold(B_P[n], t, 0), liveB, 1);
    const dB = 1;
    let sb = rb.s;
    // arms out from the moment she steps on the rope; easier once she has it (b11)
    const easy = carry(cv, 1, n, 0, n >= 11 ? 1 : 0, tr);
    sb = balance(sb, clamp01((pB - 5.2) / 0.5) * (1 - rb.flop), rb.wob);
    // at ease (b11): she has it now, and her arms come in, both in front of her
    sb = holdAt(holdAt(sb, 1, 15, -11, easy), -1, 3, -7, easy);
    // the lean: "I keep leaning to the left" (b6), and twice more as she crosses (b10)
    const leanNow = A_WOBBLE[n] ? st(0.62, 0.72) * 0.12
      : A_CROSS[n] ? (bp(0.14, 0.2, 0.32) + bp(0.46, 0.52, 0.64)) * 0.13 : 0;
    const lean = carry(cv, 2, n, 0, leanNow, tr);
    sb = { ...sb, tilt: sb.tilt + lean, fistR: { x: sb.fistR.x, y: sb.fistR.y - 18 * lean } };
    // the first question's answer, on her: a toe tried on the rope · a sigh · a flinch
    sb = { ...sb, neck: sb.neck - 0.22 * rSigh + 0.16 * rFlinch, tilt: sb.tilt - 0.08 * rSigh + 0.2 * rFlinch };
    if (rToe > 0) {
      // arms up ready to balance, and a foot tried out onto the rope
      sb = balance({ ...sb, tilt: sb.tilt - 0.06 * rToe }, rToe, 0);
      sb = { ...sb, footR: { x: lerp(sb.footR.x, 15, rToe), y: lerp(sb.footR.y, -2, rToe) } };
    }
    sb = holdAt(holdAt(sb, 1, 13, -29, rFlinch), -1, 8, -26, rFlinch);
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t, 0));
    const figB = keepHeld(heldB, rb.moving ? mixKeepLegs(prevB, sb, trAt(0)) : mixStance(prevB, sb, trAt(0)));

    // ── the old hand ─────────────────────────────────────────────────────────
    const pC = carry(cv, 3, n, keyAt(C_KEYS[p], 1), keyAt(C_KEYS[n], u), tr);
    const liveC = hLive(C_P[n], t, b, 1);
    const dC = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, 1), C_TURN[n], b, L), 1);
    const rc = routeAt(C_ROUTE, pC, hHold(C_P[n], t, 1), liveC, dC);
    // arms out along the floor rope, down as he steps off it; out again on the middle rope
    const armsC = pC < 1 ? clamp01(pC / 0.08) * clamp01((1 - pC) / 0.08) : clamp01((pC - 4.2) / 0.4);
    // "If I can still wobble": one swing as he steadies on the rope
    const wu = clamp01((u - 0.48) / 0.14);
    const wobC = A_JOIN[n] ? Math.sin(wu * Math.PI * 2) * (1 - wu) : 0;
    let sc = balance({ ...rc.s, tilt: rc.s.tilt + 0.1 * wobC }, armsC, wobC);
    // the bored stretch: head back, both arms up and out in front (AR4)
    sc = { ...sc, neck: sc.neck + 0.3 * rYawn, tilt: sc.tilt + 0.08 * rYawn };
    sc = holdAt(holdAt(sc, 1, 18, -34, rYawn), -1, 9, -31, rYawn);
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t, 1));
    const figC = keepHeld(heldC, rc.moving ? mixKeepLegs(prevC, sc, trAt(1)) : mixStance(prevC, sc, trAt(1)));

    // ── the ringmaster ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 5, n, 160), T_LEGS[n], b, L);
    const xT = carry(cv, 5, n, wt.x, wt.x, 1);
    const dT = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, -1), T_TURN[n], b, L), 1);
    const sgn = dT < 0 ? -1 : 1;
    const liveT = hLive(T_P[n], t, b, 2);
    let stt = wt.walking
      ? travelStance(wt.x0, wt.x1, hHold(T_P[n], t, 2), hHold(T_P[n], t, 2), liveT, wt.u, WALK, 0)
      : liveT;
    // the cane hangs from his far hand, at his hip, in front of him (AR2, AR6)
    stt = holdAt(stt, -1, 5, 5, 1);
    let caneAim = -1;
    let caneW = 0;
    let caneLift = 0;
    // b1: the cane down onto the floor rope, two taps; then pointed at the old hand
    if (A_SCOFF[n]) {
      const tap = st(0.22, 0.3) * (1 - st(0.52, 0.6));
      stt = hand(stt, xT, GROUND, dT, -1, FLOOR_X1 + 12, 479, tap);
      caneLift = 0.32 * (bp(0.3, 0.35, 0.4) + bp(0.4, 0.45, 0.5));
      const at = st(0.62, 0.7) * (1 - st(0.9, 0.98));
      stt = hand(stt, xT, GROUND, dT, -1, xT + sgn * 15, 454, at);
      caneW = Math.max(tap, at);
      caneAim = tap >= at ? 0 : 1;
    }
    // b3: "Down." — a jab at the floor; then up at the high wire
    if (A_DOWN[n]) {
      const jab = bp(0.0, 0.07, 0.22);
      stt = hand(stt, xT, GROUND, dT, -1, xT + sgn * 12, 470, jab);
      const up = st(0.26, 0.34) * (1 - st(0.74, 0.84));
      stt = hand(stt, xT, GROUND, dT, -1, xT + sgn * 13, 447, up);
      caneW = Math.max(jab, up);
      caneAim = jab >= up ? 2 : 3;
    }
    // b4: a flat hand on the middle rope near its end, two pats
    if (A_EDGE[n]) {
      const reach = st(0.55, 0.6) * (1 - st(0.78, 0.84));
      const pat = 5 * bp(0.62, 0.67, 0.72);
      stt = hand(stt, xT, GROUND, dT, 1, 264, ROPE_Y - 8 + pat, reach);
    }
    // b7: the cane at her lean; then the lid, lifted by its front edge
    if (A_WHISTLE[n]) {
      const at = st(0.06, 0.14) * (1 - st(0.34, 0.42));
      stt = hand(stt, xT, GROUND, dT, -1, xT + sgn * 15, 452, at);
      caneW = at;
      caneAim = 4;
      const grip = st(0.47, 0.53) * (1 - st(0.7, 0.76));
      stt = hand(stt, xT, GROUND, dT, 1, 306, lerp(452, 438, st(0.54, 0.66)), grip);
    }
    // b10: the whistle taken off the trunk's corner, and blown twice, at the lips
    const heldNow = A_CROSS[n] ? st(0.09, 0.12) : n > 10 ? 1 : 0;
    const held = carry(cv, 10, n, heldNow, heldNow, tr);
    const lipsW = A_CROSS[n] ? st(0.2, 0.26) * (1 - st(0.36, 0.42)) + st(0.5, 0.56) * (1 - st(0.66, 0.72)) : 0;
    if (A_CROSS[n]) stt = hand(stt, xT, GROUND, dT, 1, WH_REST.x, WH_REST.y, st(0.03, 0.09) * (1 - st(0.09, 0.14)));
    stt = holdAt(stt, 1, 10, -12, held * (1 - lipsW));
    if (lipsW > 0) {
      const lp = lipsAt(stt, { x: xT, groundY: GROUND, k: K, dir: sgn });
      stt = hand(stt, xT, GROUND, dT, 1, lp.x + sgn * 5, lp.y + 2, lipsW);
    }
    const blastT = A_CROSS[n] ? bp(0.27, 0.3, 0.36) + bp(0.57, 0.6, 0.66) : 0;
    const prevT = carryFrom(heldT, n, hHold(T_P[p], t, 2));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, trAt(2)) : mixStance(prevT, stt, trAt(2)));

    // ── the bodies, and what rides their hands ──────────────────────────────
    const bun = pose(figB, rb.x, rb.g, K, dB, 1);
    const cap = pose(figC, rc.x, rc.g, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wL = wristOf(th, 'wrL');
    const wR = wristOf(th, 'wrR');

    // the cane: resting, its tip finds the floor; in use, it is aimed
    const rest = Math.acos(clamp01((GROUND - 0.6 - wL.y) / CANE_REACH));
    const aims = [
      aimOf(wL.x, wL.y, FLOOR_X1 - 4, GROUND - 1, sgn) - caneLift,
      aimOf(wL.x, wL.y, rc.x, 452, sgn),
      aimOf(wL.x, wL.y, xT + sgn * 34, GROUND, sgn),
      aimOf(wL.x, wL.y, xT + sgn * 50, WIRE_Y, sgn),
      aimOf(wL.x, wL.y, rb.x, rb.g - 50, sgn),
    ];
    const phiNow = caneAim >= 0 ? lerp(rest, aims[caneAim], caneW) : rest;
    const phi = carry(cv, 11, n, phiNow, phiNow, tr);

    // the whistle: on its corner (lifted if the reader chose it), then in his hand
    const restX = lerp(WH_REST.x, WH_LIFT.x, lift);
    const restY = lerp(WH_REST.y, WH_LIFT.y, lift);
    const swing = n === Q2_AT ? lift * 22 * Math.sin(Math.PI * clamp01(q / 0.9)) : 0;
    const whX = lerp(restX, wR.x, held);
    const whY = lerp(restY, wR.y, held);
    const whRot = lerp(-90 + swing, 0, held);

    // the net gives under her as she lands in it (b6), and bounces when it is chosen (b5)
    const loadNow = A_WOBBLE[n] ? clamp01((rb.g - 470) / 14) : 0;
    const load = carry(cv, 12, n, 0, loadNow, tr);
    const lidTop = LID_Y - 38 * lid;

    return {
      bun, cap, th, t,
      cane: { x: wL.x, y: wL.y, rot: -sgn * phi * (180 / Math.PI), sx: 1, o: 1 },
      whistle: { x: whX, y: whY, rot: whRot, sx: lerp(1, dT, held), s: 1 + 0.5 * lift * (1 - held), o: 1 },
      shine: { x: restX, y: restY, o: lift * (1 - held) },
      cord: { x0: 302, y0: LID_Y + 1, x1: whX - 1.4, y1: whY - 2, o: 1 - held },
      blast: { x: whX, y: whY - 7, o: Math.max(blastQ, blastT) },
      lid, pop,
      shoes: { x: 368, y: lidTop + 3 + 32 * drop, rot: 0, sx: 1, o: 1 },
      sparkle,
      bill: { unroll, flop },
      net: 1 + 1.6 * load + 0.7 * boing,
      glow: { f: glowF, m: glowM, h: glowH, grey: greyF },
      shake,
      q1: carry(cv, 13, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 14, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      {/* the far tent: the roof's panels, the side wall, the empty seats */}
      <SetArt parts={ROOF} tone={TONE} />
      <View style={styles.roofShade} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none" />
      {STRIPES.map((x) => <View key={x} style={[styles.stripe, { left: x }]} pointerEvents="none" />)}
      <View style={styles.stands} pointerEvents="none" />
      {SEATS.map((y) => <View key={y} style={[styles.seats, { top: y }]} pointerEvents="none" />)}
      <View style={styles.valance} pointerEvents="none" />
      {SCALLOPS.map((x) => <View key={x} style={[styles.scallop, { left: x }]} pointerEvents="none" />)}
      <View style={styles.trim} pointerEvents="none" />
      <View style={styles.cord} pointerEvents="none" />
      {BULBS.map((x, k) => <Bulb key={x} x={x} k={k} clock={clock} />)}
      <View style={styles.lampRod} pointerEvents="none" />
      <ObjectArt parts={LAMP_ART} tone={TONE} />
      {/* the ring */}
      <ObjectArt parts={CURB_ART} tone={TONE} />
      <View style={styles.mat} pointerEvents="none" />
      <View style={styles.matShade} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none" />
      <Beam clock={clock} />
      {/* the high wire, its masts and the ladder */}
      <ObjectArt parts={MAST_L} tone={TONE} />
      <ObjectArt parts={MAST_R} tone={TONE} />
      <ObjectArt parts={LADDER_ART} tone={TONE} />
      <Wire S={SCENE} />
      {/* the middle rope, set back in the ring, and the floor rope at the front */}
      <ObjectArt parts={BLOCK_ART} tone={TONE} />
      <ObjectArt parts={STAND_ART} tone={TONE} />
      <MiddleRope S={SCENE} />
      <FloorRope S={SCENE} />
      <ObjectArt parts={COIL_ART} tone={TONE} />
      {/* the prop trunk: what is in it comes up from behind its front */}
      <Lid S={SCENE} />
      <Poster S={SCENE} />
      <Rider S={SCENE} k="shoes" art={SHOE_ART} />
      <Sparkle S={SCENE} />
      <ObjectArt parts={TRUNK_ART} tone={TONE} />
      <LidShut S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <Net S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Rider S={SCENE} k="cane" art={CANE_ART} />
      <Cord S={SCENE} />
      <Shine S={SCENE} />
      <Rider S={SCENE} k="whistle" art={WH_ART} />
      <Blast S={SCENE} />
      {on(Q1) ? <RopeTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <TrunkTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── alive, and not a person: the bulbs and the followspot ────────────────────

function Bulb({ x, k, clock }: { x: number; k: number; clock: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(clock.value * 1.7 + k * 1.3)) }));
  return (
    <>
      <Animated.View style={[styles.halo, { left: x - 4.5 }, st]} pointerEvents="none" />
      <View style={[styles.bulb, { left: x - 1.8 }]} pointerEvents="none" />
    </>
  );
}
function Beam({ clock }: { clock: SharedValue<number> }) {
  const sway = useAnimatedStyle(() => ({
    transform: [
      { translateX: 204 }, { translateY: 219 }, { rotate: `${2.2 * Math.sin(clock.value * 0.45)}deg` },
      { translateX: -204 }, { translateY: -219 },
    ],
  }));
  const pool = useAnimatedStyle(() => ({
    transform: [{ translateX: -273 * Math.sin((2.2 * Math.sin(clock.value * 0.45) * Math.PI) / 180) }],
  }));
  return (
    <>
      <Animated.View style={[styles.pool, pool]} pointerEvents="none" />
      <Animated.View style={[styles.rider, styles.beam, sway]} pointerEvents="none">
        <SetArt parts={BEAM} tone={TONE} />
      </Animated.View>
    </>
  );
}

// ── the ropes, each with the light it takes when it is chosen ────────────────

function Wire({ S }: { S: SharedValue<any> }) {
  const hum = useAnimatedStyle(() => ({ transform: [{ translateY: S.value.shake + 0.8 * Math.sin(S.value.t * 1.1) }] }));
  return (
    <Animated.View style={[styles.rider, hum]} pointerEvents="none">
      <View style={styles.wire} />
    </Animated.View>
  );
}
function MiddleRope({ S }: { S: SharedValue<any> }) {
  // chosen: the rope is plucked and hums, a damped spring (not a glow)
  const pluck = useAnimatedStyle(() => ({ transform: [{ translateY: 3.2 * S.value.glow.m }] }));
  return <Animated.View style={[styles.rope, pluck]} pointerEvents="none" />;
}
function FloorRope({ S }: { S: SharedValue<any> }) {
  // chosen: the rope goes limp, sags flat and greys
  const limp = useAnimatedStyle(() => ({ transform: [{ translateY: 0.8 * S.value.glow.f }, { scaleY: 1 - 0.3 * S.value.glow.f }] }));
  const grey = useAnimatedStyle(() => ({ opacity: 0.9 * S.value.glow.grey }));
  return (
    <>
      <Animated.View style={[styles.floorRope, limp]} pointerEvents="none" />
      <Animated.View style={[styles.floorRope, styles.floorGrey, grey]} pointerEvents="none" />
    </>
  );
}
/** The net: a curve of cord slung between the block and the stand, deeper as it takes a weight. */
function Net({ S }: { S: SharedValue<any> }) {
  const sag = useAnimatedStyle(() => ({
    transform: [{ translateY: NET_Y }, { scaleY: S.value.net }, { translateY: -NET_Y }],
  }));
  return (
    <Animated.View style={[styles.rider, sag]} pointerEvents="none">
      <LessonPicture name="growth5-net" />
    </Animated.View>
  );
}

// ── the trunk's lid and what comes up out of it ──────────────────────────────

function Lid({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.lid > 0.02 ? 1 : 0,
    transform: [{ translateY: LID_Y }, { scaleY: Math.max(0.001, S.value.lid) }, { translateY: -LID_Y }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={LID_OPEN_ART} tone={TONE} />
    </Animated.View>
  );
}
function LidShut({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 1 - clamp01(S.value.lid * 3) }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={LID_SHUT_ART} tone={TONE} />
    </Animated.View>
  );
}
function Poster({ S }: { S: SharedValue<any> }) {
  const up = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - S.value.pop) * 96 }] }));
  const bill = useAnimatedStyle(() => {
    const v = S.value.bill;
    return {
      transform: [
        { translateX: BILL_PIVOT.x }, { translateY: BILL_PIVOT.y }, { rotate: `${40 * v.flop}deg` },
        { scaleY: lerp(0.3, 1, v.unroll) }, { translateX: -BILL_PIVOT.x }, { translateY: -BILL_PIVOT.y },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, up]} pointerEvents="none">
      <ObjectArt parts={POSTER_ART} tone={TONE} />
      <Animated.View style={[styles.rider, bill]}>
        <ObjectArt parts={BILL_ART} tone={TONE} />
      </Animated.View>
    </Animated.View>
  );
}
const GLINTS = [{ x: 358, y: 428 }, { x: 382, y: 442 }];
function Sparkle({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.sparkle }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {GLINTS.map((g) => <View key={g.x} style={[styles.glint, { left: g.x - 3, top: g.y - 3 }]} />)}
    </Animated.View>
  );
}

// ── riders: a thing drawn about the point it is held or hung by ──────────────
type At = { x: number; y: number; rot: number; sx: number; s?: number; o: number };
function Rider({ S, k, art }: { S: SharedValue<any>; k: 'cane' | 'whistle' | 'shoes'; art: ReturnType<typeof g5Cane> }) {
  const st = useAnimatedStyle(() => {
    const v: At = S.value[k];
    const s = v.s ?? 1;
    return {
      opacity: v.o,
      transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }, { scaleX: v.sx * s }, { scaleY: s }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}
/** The whistle's lanyard, from the trunk's corner to its ring, until he takes it. */
function Cord({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.cord;
    const len = Math.hypot(c.x1 - c.x0, c.y1 - c.y0);
    const rot = (Math.atan2(c.y1 - c.y0, c.x1 - c.x0) * 180) / Math.PI;
    return {
      opacity: c.o,
      width: len,
      transform: [{ translateX: c.x0 }, { translateY: c.y0 }, { rotate: `${rot}deg` }],
    };
  });
  return <Animated.View style={[styles.lanyard, st]} pointerEvents="none" />;
}
/** The light the whistle is lifted into when the reader picks it. */
function Shine({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.shine;
    return { opacity: 0.9 * v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scale: 0.4 + 0.6 * v.o }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.shine} /></Animated.View>;
}
/** The blast: three short strokes off the whistle's slot. */
const BLASTS = [-34, 0, 34];
function Blast({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.blast;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {BLASTS.map((a) => (
        <View key={a} style={[styles.blastLine, { transform: [{ rotate: `${a}deg` }, { translateY: -7 }] }]} />
      ))}
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6): each choice is a real thing in the
 * scene, with its name on a plate inside its target (AN1). No two live targets touch (AN4).
 */
type Q = {
  id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean;
  at: 'top' | 'bottom'; px?: number;
};
/** PICK THE ROPE. The middle rope, over the net, is the one. */
const ROPE_Q: Q[] = [
  { id: 'floor', label: 'FLOOR ROPE', pw: 64, left: 58, top: 462, w: 90, h: 52, correct: false, at: 'bottom', px: 8 },
  { id: 'middle', label: 'MIDDLE ROPE', pw: 70, left: 180, top: 426, w: 86, h: 62, correct: true, at: 'top' },
  { id: 'high', label: 'HIGH WIRE', pw: 56, left: 92, top: 232, w: 264, h: 50, correct: false, at: 'bottom' },
];
/** RUMMAGE THE PROP TRUNK. The whistle is the one. */
const TRUNK_Q: Q[] = [
  { id: 'whistle', label: 'WHISTLE', pw: 48, left: 296, top: 452, w: 48, h: 48, correct: true, at: 'bottom' },
  { id: 'poster', label: 'POSTER', pw: 44, left: 312, top: 354, w: 48, h: 48, correct: false, at: 'bottom' },
  { id: 'shoes', label: 'SHOES', pw: 40, left: 348, top: 408, w: 48, h: 48, correct: false, at: 'top' },
];
type TP = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> };
function RopeTargets(p: TP) {
  return <StageTargets {...p} qs={ROPE_Q} k="q1" />;
}
function TrunkTargets(p: TP) {
  return <StageTargets {...p} qs={TRUNK_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: TP & { qs: Q[]; k: 'q1' | 'q2' }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <View
              style={[styles.namePlate, q.at === 'top' ? styles.plateTop : styles.plateBottom, { left: q.px ?? (q.w - q.pw) / 2, width: q.pw }]}
            >
              <Text style={styles.nameText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const N = NATURAL;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  /** The canvas overhead is in shadow; the ring is where the light is. */
  roofShade: { position: 'absolute', left: 0, top: 150, width: STAGE_W, height: 190, backgroundColor: INK, opacity: 0.3 },
  wall: { position: 'absolute', left: 0, top: 352, width: STAGE_W, height: 60, backgroundColor: N.g5TentCream.base },
  stripe: { position: 'absolute', top: 352, width: 28, height: 60, backgroundColor: N.g5TentRed.base },
  stands: { position: 'absolute', left: 0, top: 404, width: STAGE_W, height: 46, backgroundColor: N.g5Stands.base },
  seats: { position: 'absolute', left: 0, width: STAGE_W, height: 3.4, backgroundColor: N.g5TentRed.shade },
  valance: { position: 'absolute', left: 0, top: 340, width: STAGE_W, height: 12, backgroundColor: N.g5TentRed.base },
  scallop: {
    position: 'absolute', top: 337, width: 30, height: 30, borderRadius: 15, backgroundColor: N.g5TentRed.base,
    transform: [{ scaleY: 0.45 }],
  },
  trim: { position: 'absolute', left: 0, top: 339, width: STAGE_W, height: 2, backgroundColor: N.g5Gold.base },
  cord: { position: 'absolute', left: 0, top: 361.5, width: STAGE_W, height: 1, backgroundColor: INK },
  halo: { position: 'absolute', top: 361, width: 9, height: 9, borderRadius: 4.5, backgroundColor: N.bulbLit.base },
  bulb: {
    position: 'absolute', top: 362, width: 3.6, height: 4.6, borderRadius: 1.8, backgroundColor: N.bulbLit.base,
    borderWidth: 0.5, borderColor: INK,
  },
  lampRod: { position: 'absolute', left: 203.2, top: 190, width: 1.6, height: 17, backgroundColor: N.iron.base },
  mat: { position: 'absolute', left: 0, top: 466, width: STAGE_W, height: 34, backgroundColor: N.g5Sawdust.base },
  matShade: { position: 'absolute', left: 0, top: 466, width: STAGE_W, height: 5, backgroundColor: N.g5Sawdust.shade },
  floor: floorStyle(TONE, GROUND),
  beam: { opacity: 0.16 },
  pool: {
    position: 'absolute', left: 154, top: 486, width: 120, height: 12, borderRadius: 6,
    backgroundColor: N.bulbLit.base, opacity: 0.32,
  },
  wire: {
    position: 'absolute', left: 78, top: WIRE_Y - 1, width: 282, height: 2, borderRadius: 1,
    backgroundColor: N.silver.shade, borderWidth: 0.5, borderColor: INK,
  },
  wireGlow: {
    position: 'absolute', left: 78, top: WIRE_Y - 5, width: 282, height: 10, borderRadius: 5,
    backgroundColor: N.bulbLit.base,
  },
  rope: {
    position: 'absolute', left: ROPE_X0, top: ROPE_Y - 1.5, width: STAND_X - ROPE_X0, height: 3, borderRadius: 1.5,
    backgroundColor: N.g5Hemp.base, borderWidth: 0.7, borderColor: INK,
  },
  ropeGlow: {
    position: 'absolute', left: ROPE_X0 - 2, top: ROPE_Y - 5.5, width: STAND_X - ROPE_X0 + 4, height: 11, borderRadius: 5.5,
    backgroundColor: N.bulbLit.base,
  },
  floorRope: {
    position: 'absolute', left: FLOOR_X0, top: GROUND - 3.8, width: FLOOR_X1 - FLOOR_X0 + 2, height: 3.4,
    borderRadius: 1.7, backgroundColor: N.g5Hemp.base, borderWidth: 0.7, borderColor: INK,
  },
  floorGrey: { backgroundColor: N.bulbOff.shade },
  floorGlow: {
    position: 'absolute', left: FLOOR_X0 - 3, top: GROUND - 7.5, width: FLOOR_X1 - FLOOR_X0 + 22, height: 11,
    borderRadius: 5.5, backgroundColor: N.bulbLit.base,
  },
  netClip: {
    position: 'absolute', left: NET_X0, top: NET_Y, width: NET_X1 - NET_X0, height: 9, overflow: 'hidden',
  },
  netBowl: {
    position: 'absolute', left: 0, top: -9, width: NET_X1 - NET_X0, height: 18, borderRadius: 9,
    borderWidth: 1.2, borderColor: N.g5Net.base, backgroundColor: 'rgba(59, 70, 86, 0.32)',
  },
  netInner: {
    position: 'absolute', left: 10, top: -5, width: NET_X1 - NET_X0 - 20, height: 10, borderRadius: 5,
    borderWidth: 0.8, borderColor: N.g5Net.base,
  },
  strand: { position: 'absolute', top: 0, width: 0.8, backgroundColor: N.g5Net.base },
  netCord: {
    position: 'absolute', left: NET_X0, top: NET_Y - 0.6, width: NET_X1 - NET_X0, height: 1.2, backgroundColor: N.g5Net.base,
  },
  glint: {
    position: 'absolute', width: 6, height: 6, backgroundColor: N.porcelain.base, borderWidth: 0.6, borderColor: N.g5Sequin.shade,
    transform: [{ rotate: '45deg' }],
  },
  lanyard: {
    position: 'absolute', left: 0, top: -0.5, height: 1, backgroundColor: N.g5Lining.base, transformOrigin: '0% 50%',
  },
  blastLine: { position: 'absolute', left: -0.9, top: -4, width: 1.8, height: 8, borderRadius: 0.9, backgroundColor: INK },
  shine: { position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: N.bulbLit.base },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: Math.min(PLATE_RADIUS, 4), borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 2, boxShadow: `0 2px 0 ${lipOf(TONE)}`,
  },
  plateTop: { top: 3 },
  plateBottom: { bottom: 1 },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
});

export function Growth5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth5Scene} band={[200, 514]} camera={CAM} />;
}
