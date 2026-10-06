import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './growth1Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, mug, flowerpot, puddle, sunflowerStem, sunflowerHead, gardenWall, CAN_GRIP, CAN_ROSE, SHED_DOORWAY,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-1, "How Do People Change?" — A FRONT GARDEN PATH.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The beginner (the bun) floods her pot with a month of water at once; her neighbour
// (plain, dry) gives his a cupful from his mug; the teacher (the top hat) walks in and
// says which of them is doing what the subject recommends.
//
//   b0   she carries her pot out of her front door, kneels, sets it down and presses
//        a seed into it; then turns to him.
//   b1   he leans in over his own pot, his mug in hand.
//   b2   she kneels for the watering can, lifts it and tips the whole thing in: the
//        pot fills, overflows down both flanks and stands in a puddle. She puts the
//        can back where it was.
//   b3   he tips one cupful from his mug onto his pot, then waves a hand at hers.
//   b4   the teacher walks in from the right and tips his hat; an open hand to her
//        pot, then to his.
//   b5   Q1: the flooded pot, his pot and the spare pot left dry on the wall — tap one.
//   b6   a month on: a sunflower grows up out of HIS pot; the can has been put away.
//   b7   she points across at the shed; the teacher walks to it, opens its door (the
//        can hangs inside on a hook beside a bicycle) and turns back to her.
//   b8   he lifts the can off its hook and carries it across the garden to her — he
//        does not point at her door, which is the next answer (group O).
//   b9   Q2: the shed, the top of the wall, and beside her front door, each named on a
//        plate lying on the path — tap one.
//   b10  she gives her pot one cupful, walks to her door and sets the can down by it;
//        he raises his mug.
//
// COMPOSITION, in stage units: her house front 0–60 × 314–500 with its blue front
// door 11–49 × 404–500; the spot by the door where the can ends up at 62; her pot
// 93–115 × 478–500, and her at 122 (80 once the can is by the door); the can's first
// home at 142; the low brick garden wall 174–218 × 462–500 with the spare dry pot on
// its coping 198–214 × 446–462; his pot 227–249 and him at 272; a tree at the back of
// the garden 243–393 × 346–506 in the stage's own tone; the teacher arrives at 310,
// fetches the can from 340 and ends at 164, handing it over at 143; the shed
// 332–398 × 400–500 with its doorway 350–380 × 434–498.
// Everything a hand takes is within the rig's safe reach (~23 units from the
// shoulder at K 0.76); a thing on the ground is taken KNEELING, because a standing
// stickman's hand stops at his hip. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-1), except where the action
 * needs longer than the line and runs on after it — b2 (the pour and putting the can
 * back), b8 (fetching the can across the garden) and b10 (the cupful and the door).
 */
const LINES = [4.58, 3.28, 6.61, 5.9, 6.19, 0, 6.65, 4.57, 5.98, 0, 5.4, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// kneeling beside a thing.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
/** Waiting, alive: a listener on the quote beat, where 159 is nearly still (N21). */
const WAIT = 161;
const NOD = 263;
const KNEEL = 280;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_PLANT = is('plant');
const A_ASK = is('ask');
const A_FLOOD = is('flood');
const A_CUPFUL = is('cupful');
const A_ARRIVE = is('arrive');
const A_GROWN = is('grown');
const A_FORGET = is('forget');
const A_EASY = is('easy');
const A_DAILY = is('daily');
const MONTH = BEATS.map((b) => (b.month ? 1 : 0));
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and never before that. A turn is
// [fraction, facing]; it eases through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const BUN_LEGS: Track[] = [
  [[0, 122]], [[0, 122]], [[0, 122]], [[0, 122]], [[0, 122]], [[0, 122]], [[0, 122]],
  [[0, 122]], [[0, 122]], [[0, 122]], [[0.38, 80]], [[0, 80]], [[0, 80]],
];
const BUN_TURN: Track[] = [
  [[0, 1], [0.35, -1], [0.86, 1]], [[0, 1]], [[0, 1], [0.24, -1], [0.76, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, -1], [0.8, 1]], [[0, 1]], [[0, 1]],
];
const PL_LEGS: Track[] = BEATS.map(() => [[0, 272]]);
const PL_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0.06, 1]], [[0, 1]], [[0.3, -1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The teacher is off the stage, right, until he walks in on b4. */
const TH_LEGS: Track[] = [
  [[0, 440]], [[0, 440]], [[0, 440]], [[0, 440]], [[0, 310]], [[0, 310]], [[0, 310]],
  [[0.3, 340]], [[0, 340], [0.2, 164]], [[0, 164]], [[0, 164]], [[0, 164]], [[0, 164]],
];
const TH_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0.3, 1], [0.62, -1]], [[0, 1], [0.14, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const BUN_P = [TALK, LISTEN, TALK, LISTEN, NOD, NOD, NOD, TALK, LISTEN, NOD, LISTEN, NOD, LISTEN];
const PL_P = [LISTEN, TALK, LISTEN, TALK, NOD, NOD, NOD, NOD, NOD, NOD, TALK, LISTEN, NOD];
const TH_P = [LISTEN, LISTEN, LISTEN, LISTEN, EXPLAIN, LISTEN, EXPLAIN, LISTEN, EXPLAIN, LISTEN, NOD, WAIT, LISTEN];

// ── the garden ───────────────────────────────────────────────────────────────
const TOP_RIM = 481;                                  // the mouth of a pot on the ground
const HER_POT = 104;
const HIS_POT = 238;
const SPARE = { x: 206, y: 454, s: 16 };              // on the wall's coping, left dry
const WALL = { x: 196, w: 44, h: 38 };
const SHED = { x: 365, y: 450, w: 66, h: 100 };
const DOORWAY = {
  left: SHED.x + ((SHED_DOORWAY.x - SHED_DOORWAY.w / 2 - 50) * SHED.w) / 100,
  top: SHED.y + ((SHED_DOORWAY.y - 50) * SHED.h) / 100,
  w: (SHED_DOORWAY.w * SHED.w) / 100,
  h: (SHED_DOORWAY.h * SHED.h) / 100,
};
/** Where the can's handle is, wherever the can stands. The can stands on its foot. */
const CAN_W = 28;
const CAN_H = 24;
const CAN_REST_Y = GROUND - (0.87 - CAN_GRIP.y / 100) * CAN_H;   // its foot on the ground
const CAN_START = { x: 142, y: CAN_REST_Y };
const CAN_DOOR = { x: 62, y: CAN_REST_Y };
const CAN_HOOK = { x: 360, y: 446 };
/** The rose, relative to the handle, before the can is turned or tipped. */
const ROSE = { x: ((CAN_ROSE.x - CAN_GRIP.x) * CAN_W) / 100, y: ((CAN_ROSE.y - CAN_GRIP.y) * CAN_H) / 100 };
/** Where the teacher hands the can across to her, between the two of them. */
const PASS = { x: 143, y: 454 };
/**
 * The mug, a blue-glazed one with tea-coloured water in it (growth2's `mug`): about
 * half a head wide (AR2), its handle the grip, and its far lip where the water leaves it.
 */
const MUG_W = 11;
const MUG_H = 12;
const MUG_LIP = { x: -0.8 * MUG_W, y: -0.33 * MUG_H };

// The house front with its door, the tree, the shed, its door leaf, the bicycle inside it
// and the watering can are DRAWN pictures (AM13: scripts/lib/lessonart/lessons/growth1.mjs),
// each in the box the shape-built object had, so nothing on the stage moved.
const WALL_ART = gardenWall(WALL.x, GROUND - WALL.h / 2, WALL.w, WALL.h);
// The two pots that answer back on Q1 are drawn about the middle of their feet, so a
// wobble rocks them on the ground (or the coping) rather than about their middles.
const SPARE_ART = flowerpot(0, -SPARE.s / 2, SPARE.s, SPARE.s, 'drySoil');
const HIS_POT_ART = flowerpot(0, -11, 22, 22);
// The things that move are drawn about the point they are held by, and carried by a rider.
const POT_ART = flowerpot(0, 0, 22, 22);
const MUG_ART = mug(-0.4 * MUG_W, -0.03 * MUG_H, MUG_W, MUG_H);
const PUDDLE_ART = puddle(0, 0, 58, 9);
/** The sunflower: the stalk about its base, the head about its own centre. */
const FLOWER = 92;
const STEM_ART = sunflowerStem(0, -FLOWER / 2, FLOWER, FLOWER);
const HEAD_ART = sunflowerHead(((50 - 48) * FLOWER) / 100, ((50 - 18) * FLOWER) / 100, FLOWER, FLOWER);
const HEAD_AT = { x: ((48 - 50) * FLOWER) / 100, y: -((100 - 18) * FLOWER) / 100 };
const FLOWER_BASE = { x: HIS_POT, y: 484 };

const WATER = NATURAL.water.base;
const WATER_DEEP = NATURAL.water.shade;
const SEED = NATURAL.seedhead.base;

/**
 * AR4: the explaining pose (259) rests its FAR hand raised and 13 units behind the
 * spine, which side-on is an arm thrown back. A person explaining holds both hands in
 * front of him, so the far one comes forward to sit beside the near one.
 */
function inFront(code: number, s: Stance): Stance {
  'worklet';
  return code === EXPLAIN ? { ...s, fistL: { x: 8, y: -3 } } : s;
}
function hHold(code: number, t: number): Stance {
  'worklet';
  return inFront(code, emoteStill(code, t));
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return inFront(code, emoteStillLive(code, t, bt));
}
/**
 * A hand holding something against the body, in the figure's own frame (pelvis-local
 * units, +x forward, −y up): the thing rides WITH him as he walks and breathes rather
 * than hanging at a fixed point on the stage while his body moves under it (AR6).
 */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk or a step back cannot put him anywhere in one frame
 * (group L). A leg starts at its time or when the leg before it has finished,
 * whichever is later, so a longer first leg can never make the second one jump.
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

/** One figure's body for a beat: walking its legs, or holding its pose live. */
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0)
    : hLive(codes[n], t, b);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle) {
  'worklet';
  const v = w.wrR;
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** Where the can is and which way it faces, from its state and whoever holds it. */
function canAt(s: number, bun: { x: number; y: number }, th: { x: number; y: number }, dB: number, dT: number) {
  'worklet';
  if (s <= 1) return { x: lerp(CAN_START.x, bun.x, s), y: lerp(CAN_START.y, bun.y, s), d: lerp(1, dB, s) };
  if (s <= 2) return { x: lerp(bun.x, CAN_START.x, s - 1), y: lerp(bun.y, CAN_START.y, s - 1), d: lerp(dB, 1, s - 1) };
  if (s <= 3) return { x: CAN_START.x, y: CAN_START.y, d: 1 };
  if (s <= 4) return { x: lerp(CAN_HOOK.x, th.x, s - 3), y: lerp(CAN_HOOK.y, th.y, s - 3), d: lerp(1, dT, s - 3) };
  if (s <= 5) return { x: lerp(th.x, bun.x, s - 4), y: lerp(th.y, bun.y, s - 4), d: lerp(dT, dB, s - 4) };
  const u = clamp01(s - 5);
  return { x: lerp(bun.x, CAN_DOOR.x, u), y: lerp(bun.y, CAN_DOOR.y, u), d: lerp(dB, -1, u) };
}

/** The rose's place on the stage, for a can held at `g`, facing `d`, tipped `deg`. */
function roseAt(g: { x: number; y: number }, d: number, deg: number) {
  'worklet';
  const a = (deg * d * Math.PI) / 180;
  const ox = ROSE.x * d;
  const oy = ROSE.y;
  return { x: g.x + ox * Math.cos(a) - oy * Math.sin(a), y: g.y + ox * Math.sin(a) + oy * Math.cos(a) };
}

const CAM = followMoves(BUN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('personal-growth'));

export default function Growth1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldP = useHeld();
  const heldT = useHeld();
  const cv = useCarry(23);
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

    // ── the beginner ────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, 30), BUN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), BUN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BUN_P, n, t, b);
    // b0: kneeling to set the pot down and press the seed in; b2: kneeling for the can,
    // and again to put it back; b10: kneeling to set it by the door.
    const kneelB = A_PLANT[n] ? bp(0.42, 0.5, 0.84)
      : A_FLOOD[n] ? bp(0.03, 0.1, 0.22) + bp(0.8, 0.87, 0.98)
        : A_DAILY[n] ? bp(0.52, 0.6, 0.8) : 0;
    if (kneelB > 0) sb = mixStance(sb, hHold(KNEEL, t), kneelB);
    if (A_PLANT[n]) {
      // the pot carried out in both hands, set down at the rim, then the seed pressed in
      const carryW = 1 - st(0.54, 0.6);
      sb = holdAt(sb, 1, 13, -16, carryW);
      sb = holdAt(sb, -1, 10.5, -13.5, carryW);
      // ONE reach down to the rim (AR5): she sets the pot down, and with the hand still
      // there presses the seed in — a small push down — then the hand comes away.
      sb = hand(sb, xB, dB, 1, HER_POT, TOP_RIM - 1 + 1.5 * bp(0.6, 0.65, 0.72), st(0.44, 0.52) * (1 - st(0.72, 0.8)));
    }
    if (A_FLOOD[n]) {
      // down for the can, up with it, over the pot and tip it, then back down with it
      sb = hand(sb, xB, dB, 1, CAN_START.x, CAN_START.y, bp(0.06, 0.13, 0.2));
      sb = hand(sb, xB, dB, 1, xB + 8 * dB, 462, st(0.13, 0.2) * (1 - st(0.8, 0.87)));
      sb = hand(sb, xB, dB, 1, 110, 454, st(0.28, 0.36) * (1 - st(0.72, 0.8)));
      sb = hand(sb, xB, dB, 1, CAN_START.x, CAN_START.y, bp(0.8, 0.87, 0.97));
    }
    // b8–b10: the can she took from the teacher, and what she does with it
    if (A_EASY[n]) sb = hand(sb, xB, dB, 1, PASS.x, PASS.y, st(0.85, 0.92));
    // the can carried as a person carries one: by its handle, the arm down at her side
    if (Q2[n]) sb = holdAt(sb, 1, 8, 1, 1);
    if (A_DAILY[n]) {
      sb = holdAt(sb, 1, 8, 1, 1 - st(0.54, 0.64));
      sb = hand(sb, xB, dB, 1, 114, 462, st(0.04, 0.14) * (1 - st(0.36, 0.42)));
      sb = hand(sb, xB, dB, 1, CAN_DOOR.x, CAN_DOOR.y, bp(0.54, 0.64, 0.76));
    }
    // b7: she points away across the garden at the shed
    if (A_FORGET[n]) sb = hand(sb, xB, dB, 1, 380, 440, bp(0.34, 0.44, 0.9));
    const prevB = carryFrom(heldB, n, hHold(BUN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── her neighbour, with his mug ─────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 2, n, PL_LEGS[0][0][1]), PL_LEGS[n], b, L);
    const xP = carry(cv, 2, n, wp.x, wp.x, 1);
    const dP = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), PL_TURN[n], b, L), 1);
    let spn = bodyOf(wp, PL_P, n, t, b);
    // the mug, held low in front of him; up over his pot to pour; raised on b10
    const pourP = A_CUPFUL[n] ? bp(0.08, 0.2, 0.62) : 0;
    const toast = A_DAILY[n] ? bp(0.7, 0.8, 0.98) : 0;
    spn = hand(spn, xP, dP, 1, xP + 9 * dP, 468, 0.55);
    if (pourP > 0) spn = hand(spn, xP, dP, 1, 250, 462, pourP);
    if (toast > 0) spn = hand(spn, xP, dP, 1, xP + 12 * dP, 440, toast);
    // b1: an open hand toward her pot as he asks; b3: a wave at hers — "yours knows best"
    if (A_ASK[n]) spn = hand(spn, xP, dP, -1, 196, 458, bp(0.3, 0.45, 0.9));
    if (A_CUPFUL[n]) spn = hand(spn, xP, dP, -1, 196, 456, bp(0.72, 0.82, 0.98));
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, spn, tr) : mixStance(prevP, spn, tr));

    // ── the teacher ─────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 4, n, 440), TH_LEGS[n], b, L);
    const xT = carry(cv, 4, n, wt.x, wt.x, 1);
    const dT = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived, then a hand to her pot and to his
      const after = moveTr(440, 310, TR) / L;
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.03, after + 0.1, after + 0.2));
      // the pots wait for the hat to be done, and the hand goes from hers straight to
      // his rather than dropping between them (AR5)
      const p0 = Math.max(0.4, after + 0.22);
      const across = st(p0 + 0.1, p0 + 0.18);
      stt = hand(stt, xT, dT, 1, lerp(HER_POT, HIS_POT, across), lerp(470, 468, across), st(p0, p0 + 0.06) * (1 - st(p0 + 0.24, p0 + 0.32)));
    }
    // b6: an open hand up to the sunflower
    if (A_GROWN[n]) stt = hand(stt, xT, dT, 1, HIS_POT, 408, bp(0.44, 0.54, 0.95));
    // b8: the shed door, the can off its hook, carried across and handed to her
    // b7: as she names the shed he goes over and opens its door, then turns back to her
    if (A_FORGET[n]) {
      const open = st(0.48, 0.58);
      stt = hand(stt, xT, dT, 1, lerp(DOORWAY.left + 2, DOORWAY.left + 0.85 * DOORWAY.w, open), 466, bp(0.44, 0.5, 0.6));
    }
    // b8: the can off its hook, carried across the garden and handed to her
    if (A_EASY[n]) {
      stt = hand(stt, xT, dT, 1, CAN_HOOK.x, CAN_HOOK.y, bp(0.04, 0.1, 0.16));
      stt = holdAt(stt, 1, 8, 1, st(0.1, 0.17) * (1 - st(0.87, 0.92)));
      stt = hand(stt, xT, dT, 1, PASS.x, PASS.y, bp(0.87, 0.92, 1.0));
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    // canS  0→1 off the ground into her hand · 1→2 back onto the ground (b2) ·
    //       2→3 put away, a month on (b6) · 3 on its hook in the shed ·
    //       3→4 off the hook into the teacher's hand · 4→5 his hand to hers (b8) ·
    //       5→6 her hand to the step by her door (b10)
    const canNow = A_FLOOD[n] ? st(0.12, 0.15) + st(0.88, 0.92)
      : A_GROWN[n] ? 2 + st(0, 0.2)
        : A_EASY[n] ? 3 + st(0.08, 0.11) + st(0.92, 0.96)
          : A_DAILY[n] ? 5 + st(0.63, 0.67)
            : n > 10 ? 6 : n > 8 ? 5 : n > 6 ? 3 : n > 2 ? 2 : 0;
    const tiltNow = A_FLOOD[n] ? 58 * st(0.36, 0.44) * (1 - st(0.68, 0.74))
      : A_DAILY[n] ? 34 * st(0.12, 0.18) * (1 - st(0.3, 0.36)) : 0;
    const mugNow = A_CUPFUL[n] ? 72 * st(0.2, 0.28) * (1 - st(0.46, 0.52)) : 0;
    const streamNow = A_FLOOD[n] ? st(0.42, 0.46) * (1 - st(0.66, 0.7)) : 0;
    const mugDrops = A_CUPFUL[n] ? st(0.24, 0.28) * (1 - st(0.44, 0.48)) : 0;
    const canDrops = A_DAILY[n] ? st(0.16, 0.19) * (1 - st(0.28, 0.31)) : 0;
    const fillNow = A_FLOOD[n] ? st(0.44, 0.54) : n > 2 ? 1 : 0;
    const overNow = A_FLOOD[n] ? st(0.52, 0.64) * (1 - st(0.7, 0.9) * 0.6) : n > 2 ? 0.4 : 0;
    const puddleNow = A_FLOOD[n] ? st(0.55, 0.78) : n > 2 ? 1 : 0;
    const potNow = A_PLANT[n] ? st(0.53, 0.56) : 1;
    const seedNow = A_PLANT[n] ? st(0.56, 0.6) + st(0.62, 0.66) + st(0.68, 0.76) : 3;
    const growNow = A_GROWN[n] ? st(0.02, 0.4) : MONTH[n];
    const headNow = A_GROWN[n] ? st(0.26, 0.46) : MONTH[n];
    const sproutNow = A_PLANT[n] ? st(0.76, 0.92) : n > 0 && n < 6 ? 1 : 0;
    const doorNow = A_FORGET[n] ? st(0.48, 0.58) : n > 7 ? 1 : 0;

    const bun = pose(figB, xB, GROUND, K, dB, 1);
    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const canS = carry(cv, 6, n, canNow, canNow, tr);
    const tilt = carry(cv, 7, n, tiltNow, tiltNow, tr);
    const mug = carry(cv, 8, n, mugNow, mugNow, tr);
    // where the can is, which way it faces and how far it is tipped; where its rose is
    const wB = wristOf(bun);
    const can = canAt(canS, wB, wristOf(th), dB, dT);
    const canO = canS <= 2 ? 1 : canS <= 3 ? 1 - (canS - 2) : canS < 3.3 ? 0 : 1;
    const rose = roseAt(can, can.d, tilt);
    // the mug in his front hand, its handle toward him; its lip, where a cupful leaves it
    const wP = wristOf(pl);
    const ma = (mug * dP * Math.PI) / 180;
    const lx = MUG_LIP.x * -dP;
    const lip = { x: wP.x + lx * Math.cos(ma) - MUG_LIP.y * Math.sin(ma), y: wP.y + lx * Math.sin(ma) + MUG_LIP.y * Math.cos(ma) };

    return {
      bun, pl, th, t, wB,
      can: { x: can.x, y: can.y, o: canO, r: tilt * can.d, sx: can.d },
      shedCan: canS >= 2 && canS < 3.3 ? 1 : 0,
      mugAt: { x: wP.x, y: wP.y, o: 1, r: mug * dP, sx: -dP },
      rose, lip,
      stream: carry(cv, 9, n, streamNow, streamNow, tr),
      mugDrops: carry(cv, 10, n, mugDrops, mugDrops, tr),
      canDrops: carry(cv, 11, n, canDrops, canDrops, tr),
      fill: carry(cv, 12, n, fillNow, fillNow, tr),
      over: carry(cv, 13, n, overNow, overNow, tr),
      puddle: carry(cv, 14, n, puddleNow, puddleNow, tr),
      potT: carry(cv, 15, n, potNow, potNow, tr),
      seedT: carry(cv, 16, n, seedNow, seedNow, tr),
      grow: carry(cv, 17, n, growNow, growNow, tr),
      head: carry(cv, 18, n, headNow, headNow, tr),
      sprout: carry(cv, 22, n, sproutNow, sproutNow, tr),
      door: carry(cv, 19, n, doorNow, doorNow, tr),
      q1: carry(cv, 20, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 21, n, Q2[p], Q2[n], tr),
    };
  });

  // Q1's answer as a physical reaction (a hop and squash, or a damped shake): 0 -> 1 over
  // 900ms and back to rest at both ends, so nothing jumps when it starts or is reset.
  const pickT = useSharedValue(0);
  const pickK = useSharedValue(0);
  useEffect(() => {
    const k = picked === 'flooded' ? 1 : picked === 'cupful' ? 2 : picked === 'dry' ? 3 : 0;
    pickK.value = k;
    pickT.value = 0;
    if (k) pickT.value = withTiming(1, { duration: 900, easing: Easing.linear });
  }, [picked, pickK, pickT]);
  const hisPot = useDerivedValue<At>(() => potReact(pickK.value === 2, pickT.value, 'hop', HIS_POT, 500));
  const sparePot = useDerivedValue<At>(() => potReact(pickK.value === 3, pickT.value, 'shake', SPARE.x, SPARE.y + SPARE.s / 2));

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="growth1-tree" />
      <LessonPicture name="growth1-house" />
      <LessonPicture name="growth1-shed" />
      <ShedInside S={SCENE} />
      <ShedLeaf S={SCENE} />
      <ObjectArt parts={WALL_ART} tone={TONE} />
      <Rider at={sparePot} art={SPARE_ART} />
      <View style={styles.ground} pointerEvents="none" />
      <Puddle S={SCENE} />
      <Sunflower S={SCENE} />
      <Rider at={hisPot} art={HIS_POT_ART} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Held S={SCENE} pickT={pickT} pickK={pickK} />
      {on(Q1) ? <PotTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <PlaceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number; sx?: number; s?: number; q?: number; v?: number };

/** A pot's answer to Q1 about its feet: the right one hops and squashes as it lands, a wrong one shakes and dies down. */
function potReact(on: boolean, t: number, kind: 'hop' | 'shake', x: number, y: number): At {
  'worklet';
  if (!on) return { x, y, o: 1 };
  if (kind === 'hop') {
    const up = Math.sin(Math.PI * Math.min(1, t / 0.42));
    const sq = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.42) / 0.3)));
    return { x, y: y - 9 * up, o: 1, q: 1 + 0.1 * sq, v: 1 - 0.14 * sq };
  }
  const d = Math.exp(-4 * t) * Math.sin(t * 34);
  return { x: x + 2.4 * d, y, o: 1, r: 7 * d };
}
function Rider({ at, art, pic, lift }: { at: SharedValue<At>; art?: ReturnType<typeof flowerpot>; pic?: string; lift?: boolean }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` }, { scaleX: (at.value.sx ?? 1) * (at.value.s ?? 1) * (at.value.q ?? 1) }, { scaleY: (at.value.s ?? 1) * (at.value.v ?? 1) },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      {pic ? <LessonPicture name={pic} /> : art ? <ObjectArt parts={art} tone={TONE} /> : null}
    </Animated.View>
  );
}

function Held({ S, pickT, pickK }: { S: SharedValue<any>; pickT: SharedValue<number>; pickK: SharedValue<number> }) {
  const canP = useDerivedValue<At>(() => S.value.can);
  const mugP = useDerivedValue<At>(() => S.value.mugAt);
  const potP = useDerivedValue<At>(() => {
    const u = S.value.potT;
    const w = S.value.wB;
    const a = potReact(pickK.value === 1, pickT.value, 'shake', 0, 0);
    return { x: lerp(w.x, HER_POT, u) + a.x, y: lerp(w.y + 9, 489, u), o: 1, r: a.r };
  });
  const sproutP = useDerivedValue<At>(() => {
    const g = S.value.sprout;
    const a = potReact(pickK.value === 1, pickT.value, 'shake', 0, 0);
    return { x: HER_POT + a.x, y: TOP_RIM + 1.5, o: g > 0.01 ? 1 : 0, s: 0.15 + 0.85 * g };
  });
  // the heavy pour: one unbroken stream from the rose down into her pot
  const stream = useAnimatedStyle(() => {
    const r = S.value.rose;
    const vx = HER_POT - r.x;
    const vy = TOP_RIM - r.y;
    const len = Math.max(0, Math.hypot(vx, vy));
    return {
      opacity: S.value.stream > 0.02 ? 1 : 0,
      height: len * S.value.stream,
      transform: [{ translateX: r.x - 2.2 }, { translateY: r.y }, { rotate: `${Math.atan2(-vx, vy)}rad` }],
    };
  });
  const seed = useAnimatedStyle(() => {
    const u = S.value.seedT;
    const w = S.value.wB;
    const f = clamp01(u - 1);
    return {
      opacity: clamp01(u) * (1 - clamp01(u - 2)),
      transform: [{ translateX: lerp(w.x, HER_POT, f) - 2 }, { translateY: lerp(w.y, TOP_RIM, f) - 1.5 }],
    };
  });
  return (
    <>
      <Rider at={potP} art={POT_ART} />
      <PotWater S={S} />
      <Rider at={sproutP} pic="growth1-sprout" />
      <Animated.View style={[styles.seed, seed]} pointerEvents="none" />
      <Rider at={mugP} art={MUG_ART} />
      <Animated.View style={[styles.stream, stream]} pointerEvents="none" />
      {DROPS.map((k) => <Drop key={`c${k}`} k={k} S={S} src="rose" to={HER_POT} amt="canDrops" />)}
      {DROPS.map((k) => <Drop key={`m${k}`} k={k} S={S} src="lip" to={HIS_POT} amt="mugDrops" />)}
      <Rider at={canP} pic="growth1-can" lift />
    </>
  );
}

// ── water falling a drop at a time, for a cupful ────────────────────────────
const DROPS = [0, 1, 2, 3];
function Drop({ k, S, src, to, amt }: {
  k: number; S: SharedValue<any>; src: 'rose' | 'lip'; to: number; amt: 'canDrops' | 'mugDrops';
}) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const a = v[amt] as number;
    const o = v[src] as { x: number; y: number };
    const f = (v.t * 2.4 + k / DROPS.length) % 1;
    return {
      opacity: a > 0.02 ? a : 0,
      transform: [{ translateX: lerp(o.x, to, f) - 1.5 }, { translateY: lerp(o.y, TOP_RIM, f * f) - 2 }],
    };
  });
  return <Animated.View style={[styles.drop, st]} pointerEvents="none" />;
}

// ── her pot: the water rising in it, running over, and the puddle it stands in ─
function Puddle({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => ({ x: HER_POT, y: GROUND, o: S.value.puddle > 0.02 ? 1 : 0, s: 0.2 + 0.8 * S.value.puddle }));
  return <Rider at={at} art={PUDDLE_ART} />;
}
function PotWater({ S }: { S: SharedValue<any> }) {
  const surface = useAnimatedStyle(() => ({ opacity: S.value.fill }));
  const runL = useAnimatedStyle(() => ({ opacity: S.value.over > 0.02 ? 1 : 0, transform: [{ rotate: '-8deg' }, { scaleY: S.value.over }] }));
  const runR = useAnimatedStyle(() => ({ opacity: S.value.over > 0.02 ? 1 : 0, transform: [{ rotate: '8deg' }, { scaleY: S.value.over }] }));
  return (
    <>
      <Animated.View style={[styles.surface, surface]} pointerEvents="none" />
      <Animated.View style={[styles.runL, runL]} pointerEvents="none" />
      <Animated.View style={[styles.runR, runR]} pointerEvents="none" />
    </>
  );
}

// ── the sunflower, growing up out of his pot a month on ──────────────────────
function Sunflower({ S }: { S: SharedValue<any> }) {
  const stem = useDerivedValue<At>(() => {
    const g = S.value.grow;
    return { x: FLOWER_BASE.x, y: FLOWER_BASE.y, o: g > 0.01 ? 1 : 0, s: 0.05 + 0.95 * g };
  });
  const head = useDerivedValue<At>(() => {
    const g = 0.05 + 0.95 * S.value.grow;
    const h = S.value.head;
    return { x: FLOWER_BASE.x + HEAD_AT.x * g, y: FLOWER_BASE.y + HEAD_AT.y * g, o: h > 0.01 ? 1 : 0, s: 0.1 + 0.9 * h };
  });
  return (
    <>
      <Rider at={stem} art={STEM_ART} />
      <Rider at={head} art={HEAD_ART} />
    </>
  );
}

// ── the shed: what is inside the doorway, and the door that swings open ──────
function ShedInside({ S }: { S: SharedValue<any> }) {
  // The can hangs here from a month on until the teacher lifts it off its hook.
  const can = useDerivedValue<At>(() => ({ x: CAN_HOOK.x - DOORWAY.left, y: CAN_HOOK.y - DOORWAY.top, o: S.value.shedCan }));
  return (
    <View style={styles.inside} pointerEvents="none">
      <LessonPicture name="growth1-bike" />
      <View style={styles.hook} />
      <Rider at={can} pic="growth1-can" />
    </View>
  );
}
function ShedLeaf({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => ({
    x: DOORWAY.left + DOORWAY.w, y: DOORWAY.top, o: 1, sx: 1 - 0.85 * S.value.door,
  }));
  return <Rider at={at} pic="growth1-shedleaf" />;
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three pots. The one given a cupful each morning is the one that grows. */
const POT_Q = [
  { id: 'flooded', left: HER_POT - 13, top: TOP_RIM - 6, w: 26, h: GROUND - TOP_RIM + 7, correct: false },
  { id: 'cupful', left: HIS_POT - 13, top: TOP_RIM - 6, w: 26, h: GROUND - TOP_RIM + 7, correct: true },
  { id: 'dry', left: SPARE.x - 11, top: SPARE.y - SPARE.s / 2 - 3, w: 22, h: SPARE.s + 4, correct: false },
];
function PotTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {POT_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
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
 * Q2: three places the can could live. By the door she walks through is the right one.
 * Each is named on a small plate lying on the path under it (AN1), inside its target, so
 * the thing and the word for it are one choice.
 */
const FOOT = 513;
const PLACE_Q = [
  { id: 'shed', label: 'THE SHED', pw: 56, left: SHED.x - SHED.w / 2, top: SHED.y - SHED.h / 2, w: SHED.w, correct: false },
  { id: 'wall', label: 'THE WALL', pw: 56, left: WALL.x - WALL.w / 2 + 6, top: SPARE.y - SPARE.s / 2 - 2, w: WALL.w - 4, correct: false },
  { id: 'door', label: 'BY THE DOOR', pw: 76, left: 4, top: 400, w: 80, correct: true },
];
function PlaceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PLACE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: FOOT - q.top }}
        >
          <View style={styles.place}>
            <View style={[styles.placePlate, { left: (q.w - q.pw) / 2, width: q.pw }]}>
              <Text style={styles.placeText}>{q.label}</Text>
            </View>
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
  inside: {
    position: 'absolute', left: DOORWAY.left, top: DOORWAY.top, width: DOORWAY.w, height: DOORWAY.h, overflow: 'hidden',
  },
  hook: {
    position: 'absolute', left: CAN_HOOK.x - DOORWAY.left - 1, top: 0, width: 2, height: CAN_HOOK.y - DOORWAY.top - 2,
    backgroundColor: NATURAL.iron.base,
  },
  stream: {
    position: 'absolute', left: 0, top: 0, width: 4.4, borderRadius: 2.2, backgroundColor: WATER,
    borderLeftWidth: 0.8, borderRightWidth: 0.8, borderColor: WATER_DEEP, transformOrigin: '50% 0%', zIndex: 1,
  },
  drop: {
    position: 'absolute', left: 0, top: 0, width: 3, height: 4, borderRadius: 1.5, backgroundColor: WATER,
    borderWidth: 0.6, borderColor: WATER_DEEP,
  },
  seed: {
    position: 'absolute', left: 0, top: 0, width: 4, height: 3, borderRadius: 1.5, backgroundColor: SEED,
  },
  surface: {
    position: 'absolute', left: HER_POT - 8.5, top: TOP_RIM - 1.8, width: 17, height: 3.6, borderRadius: 1.8,
    backgroundColor: WATER, borderWidth: 0.6, borderColor: WATER_DEEP,
  },
  runL: {
    position: 'absolute', left: HER_POT - 11, top: TOP_RIM, width: 2.2, height: GROUND - TOP_RIM, borderRadius: 1.1,
    backgroundColor: WATER, transformOrigin: '50% 0%', transform: [{ rotate: '-8deg' }],
  },
  runR: {
    position: 'absolute', left: HER_POT + 8.8, top: TOP_RIM, width: 2.2, height: GROUND - TOP_RIM, borderRadius: 1.1,
    backgroundColor: WATER, transformOrigin: '50% 0%', transform: [{ rotate: '8deg' }],
  },
  clear: { flexGrow: 1 },
  place: { flexGrow: 1 },
  placePlate: {
    position: 'absolute', bottom: 4, alignItems: 'stretch', backgroundColor: PLATE_FACE, borderRadius: 5, borderWidth: 1.2, borderColor: INK, paddingHorizontal: 3,
    boxShadow: `0 3px 0 ${lipOf(TONE)}`,
  },
  placeText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false, textAlign: 'center', alignSelf: 'stretch',
  },
});

export function Growth1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth1Scene} band={[306, 514]} camera={CAM} />;
}
