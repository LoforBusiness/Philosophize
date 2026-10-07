import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './hist3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  tint, wheel, footbridgeDeck, footbridgeRail, streamBed, cartHay, cartBody, brokenPlank, newPlank,
  reeds, weatherVane, CART_AXLE,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-3, "Why Did It Happen?" — A VILLAGE FOOTBRIDGE OVER A STREAM.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The carter (the cap) has driven his hay cart
// onto the old plank footbridge and one wheel has gone through; a villager (plain) has
// opinions about the timing; the historian (the top hat) walks along the bank, lifts
// the rotten plank out of the hole, and shows that the collapse had more than one cause.
//
//   b0   the carter, beside the shafts of his cart with its wheel down through the
//        bridge, spreads his hands at "honest" and again at "twenty years".
//   b1   the villager steps up to the end post of the handrail, leans on it and folds
//        his forearms along the top.
//   b2   the historian walks in along the bank from the left, onto the bridge, tips his
//        hat, and crouches at the edge of the hole.
//   b3   he takes hold of the broken plank, draws it up out of the hole, stands, and
//        turns to show the villager its dark, crumbling end, a finger on the rot; then
//        he walks it back to the bank, crouches and lays it down.
//   b4   Q1: the rotten plank on the bank, the hay cart and the stream — tap one.
//   b5   the carter bends, takes up the shafts, turns into them and hauls the cart out
//        of the hole onto the far bank, drops the shafts and wipes his brow.
//   b6   the historian walks out to the edge of the hole, points at the cart's wheel,
//        then turns and points back at the rotten plank.
//   b7   the villager straightens off the post, steps up to the plank, taps it twice
//        with his boot, and folds his arms at "Lovely".
//   b8   the historian holds his hands out like the pans of a scale; the near one sinks
//        at "mattered most", and they come back level.
//   b9   Q2: the hay cart, the rotten plank and the weather vane on the barn — tap one.
//   b10  the carter fetches a new plank from against the barn, carries it along the
//        bridge, crouches and lays it in the gap.
//   b11  the quotation; the carter walks back to his cart, and everyone is at ease.
//
// COMPOSITION, in stage units. The plank footbridge spans the stream from 100 to 280:
// stone abutments at each bank, the deck's top on the ground line (500), its planks
// butted at 146, 186 and 234 over trestle posts, and the rotten plank, 186–234, gone —
// the GAP, its neighbours ending in dark splinters. The stream shows in the shade under
// the deck, 104–276 × 500–518. The handrail runs along the far side, 80–300, its top
// rail at 456 and its end posts on the banks at 84 and 296. The hay cart stands on the
// bridge with its wheel (r 19) down in the gap — drawn BEHIND the deck, so it is in the
// bridge — the axle at (222, 494) and its shafts' tips on the far bank at 305; hauled
// out, the axle is at (270, 481), the wheel on the far plank and the abutment, the
// shafts' tips on the ground at 352. A red timber barn stands gable-on at the right
// edge, 330–422 × 360–500, with a weather vane on its ridge, 354–398 × 317–363, and two
// new planks leaning against its wall at 333–351. A broadleaf tree on the left bank,
// 0–58. The VILLAGER stands at 66, his forearms on the end post at 84, and steps to 78
// to tap the rotten plank, which the historian lays at 86–122. The HISTORIAN crouches at
// 166 to lift it, lays it from 136, and stands at the edge of the gap, 182, from b6.
// The CARTER stands at 314 by his shafts, hauls to 362, lays the new plank from 248 and
// goes back to 330. Everyone stands at least 60 apart once placed, and every hand-off
// is within the rig's safe reach (~23 units from the shoulder at K 0.76). Band
// [306, 518]: the floor shows 18 units, which is where the stream is.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners hold listening poses that are alive but still, and no arm
// moves but to hold, carry, point or lean (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const TR = 0.85;
/** 78 units of figure in a 212-unit band: 36.8%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, history-foundations-3), except where the action needs
 * longer than the line and runs on after it — b2 (the walk in and the crouch), b3 (the
 * plank shown, walked back and laid down), b5 (the haul), b6 (the walk out and two
 * points) and b10 (the new plank fetched and laid). 0 for a beat with no voice.
 */
const LINES = [4.22, 4.16, 5.96, 6.6, 0, 5.4, 6.3, 3.51, 6.25, 0, 6.6, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, waiting for
// an answer; and, at the hole, a crouch.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const WAIT = 161;
/** Posture 13: down on the haunches, peering at the floor. */
const CROUCH = 13;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_STUCK = is('stuck');
const A_TIMING = is('timing');
const A_ARRIVE = is('arrive');
const A_ROT = is('rot');
const A_RELIEF = is('relief');
const A_TRIGGER = is('trigger');
const A_YEAR = is('year');
const A_WEIGH = is('weigh');
const A_MEND = is('mend');
const Q1 = BEATS.map((b) => (b.slow ? 1 : 0));
const Q2 = BEATS.map((b) => (b.spark ? 1 : 0));
const ROT_N = A_ROT.indexOf(1);
const RELIEF_N = A_RELIEF.indexOf(1);
const YEAR_N = A_YEAR.indexOf(1);
const MEND_N = A_MEND.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const V_X = 66;
const V_TAP = 78;
const H_X0 = -30;
const H_HOLE = 166;
const H_LAY = 136;
const H_EDGE = 182;
const C_X = 314;
const C_OUT = 362;
const C_FETCH = 362;
const C_LAY = 248;
/** Where the carter goes back to under the quotation, clear of the gap, by his cart's shafts. */
const C_EASE = 330;
const V_LEGS: Track[] = BEATS.map((_, n) => (n < YEAR_N ? [[0, V_X]] : n === YEAR_N ? [[0.04, V_TAP]] : [[0, V_TAP]]));
const V_TURN: Track[] = BEATS.map(() => [[0, 1]]);
const H_LEGS: Track[] = BEATS.map((b, n) => (!b.th ? [[0, H_X0]]
  : A_ARRIVE[n] ? [[0.02, H_HOLE]]
    : n === ROT_N ? [[0, H_HOLE], [0.56, H_LAY]]
      : n < ROT_N + 3 ? [[0, H_LAY]]
        : A_TRIGGER[n] ? [[0.02, H_EDGE]] : [[0, H_EDGE]]));
const H_TURN: Track[] = BEATS.map((_, n) => (n <= 2 ? [[0, 1]]
  : n === ROT_N ? [[0, 1], [0.18, -1]]
    : n === ROT_N + 1 ? [[0, -1]]
      : A_RELIEF[n] ? [[0.02, 1]]
        : A_TRIGGER[n] ? [[0, 1], [0.56, -1]]
          : n < MEND_N ? [[0, -1]]
            : n === MEND_N ? [[0.04, 1]] : [[0, 1]]));
const C_LEGS: Track[] = BEATS.map((_, n) => (n < RELIEF_N ? [[0, C_X]]
  : n === RELIEF_N ? [[0.18, C_OUT]]
    : n < MEND_N ? [[0, C_OUT]]
      : n === MEND_N ? [[0.02, C_FETCH], [0.3, C_LAY]] : n === MEND_N + 1 ? [[0.05, C_EASE]] : [[0, C_EASE]]));
const C_TURN: Track[] = BEATS.map((_, n) => (n === RELIEF_N ? [[0, -1], [0.11, 1], [0.66, -1]]
  : n === MEND_N + 1 ? [[0, -1], [0.02, 1], [0.5, -1]] : [[0, -1]]));
/**
 * What each is doing with his body: talking while he speaks, nodding along while
 * somebody else does (N21), and waiting while the reader answers.
 */
const V_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, WAIT, WAIT];
const H_P = [NOD, NOD, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, WAIT, WAIT];
const C_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, NOD, WAIT, TALK, WAIT, WAIT];

// ── the bridge, the cart and the planks ─────────────────────────────────────
/** The top of the handrail's end post on the left bank, where the villager leans. */
const POST = { x: 84, y: 454 };
/** The gap the rotten plank left, and the post it was hinged at. */
const GAP = { x0: 186, x1: 234, mid: 210 };
/** The broken plank hanging into the gap from the left post, about its grip there. */
const HANG = { x: 186, y: 501, rot: 28 };
/** Where the historian lays it, on the bank by the end post: its centre. */
const LAID = { x: 104, y: 496.5, rot: -180 };
/** Half the broken plank's length: its centre from the end it is held by. */
const BROKEN_HALF = 18;
/** The new plank: leaning against the barn, and laid in the gap. Held 16 from its middle. */
const NEW_LEAN = { x: 345, y: 476.5, rot: -75.7 };
const NEW_LAID = { x: GAP.mid, y: 502, rot: 0 };
const NEW_GRIP = 16;
/** Its tilt while carried, the far end low ahead of him. */
const NEW_CARRY_ROT = -20;
/** The other new plank, left leaning against the barn. */
const SPARE = { x: 339, y: 476.5, rot: -79 };
/** The cart: its axle stuck in the gap, and hauled out on the far bank. */
const AXLE_IN = { x: 222, y: 494 };
const AXLE_OUT = { x: 270, y: 481 };
const WHEEL_R = 19;
/** The shafts' tip from the axle, in the cart's own frame. */
const TIP = { x: 83, y: 4.5 };
/** The tips' height lying on the ground, and held at the carter's hips. */
const TIP_REST = 498.5;
const TIP_HELD = 476;
/** How far behind the carter's hands the tips are when he hauls. */
const HAUL_BACK = 12;

const VANE_ART = weatherVane(376, 340, 44, 46);
const RAIL_ART = footbridgeRail(190, 476, 220, 48);
const DECK_ART = footbridgeDeck(190, 509, 180, 18);
const STREAM_ART = streamBed(190, 509, 172, 18);
const REEDS_ART = reeds(290, 489, 18, 24);
// The things that move are drawn about the point they are moved by.
const AX = CART_AXLE.w / 2 - CART_AXLE.x;
const AY = CART_AXLE.h / 2 - CART_AXLE.y;
const HAY_ART = cartHay(AX, AY, CART_AXLE.w, CART_AXLE.h);
const BODY_ART = cartBody(AX, AY, CART_AXLE.w, CART_AXLE.h);
const WHEEL_ART = tint(wheel(0, 0, WHEEL_R * 2, WHEEL_R * 2), 'wood');
const BROKEN_ART = brokenPlank(0, 0, 36, 7);
const NEW_ART = newPlank(0, 0, 48, 4.5);

function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A point an arm's length from the shoulder toward a far target: where a point lands. */
function toward(x: number, tx: number, ty: number, r: number) {
  'worklet';
  const sy = 456;
  const dx = tx - x;
  const dy = ty - sy;
  const d = Math.max(1, Math.hypot(dx, dy));
  return { x: x + (dx / d) * r, y: sy + (dy / d) * r };
}
/** A point `d` along a plank turned `deg`, from (x, y). */
function along(x: number, y: number, deg: number, d: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk or a step back cannot put him anywhere in one frame
 * (group L). A leg starts at its time or when the leg before it has finished.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  let arrive = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    arrive = start + dur;
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, arrive };
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
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
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

/** The cart's axle, from where the carter has hauled it to (`x`), climbing out of the gap. */
function axleAt(x: number) {
  'worklet';
  const u = clamp01((x - AXLE_IN.x) / 26);
  return { x, y: lerp(AXLE_IN.y, AXLE_OUT.y, u * u * (3 - 2 * u)) };
}
/** The cart's tilt, in degrees, with its shafts' tips at height `tipY`. */
function tiltFor(ay: number, tipY: number) {
  'worklet';
  const s = (tipY - ay - TIP.y) / TIP.x;
  return (Math.asin(s < -1 ? -1 : s > 1 ? 1 : s) * 180) / Math.PI;
}
/** The shafts' tips on the stage, for a cart at axle (x, y) tilted `deg`. */
function tipAt(x: number, y: number, deg: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: x + TIP.x * Math.cos(a) - TIP.y * Math.sin(a), y: y + TIP.x * Math.sin(a) + TIP.y * Math.cos(a) };
}

const CAM = followMoves(H_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('history'));

export default function Hist3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldV = useHeld();
  const heldH = useHeld();
  const heldC = useHeld();
  const cv = useCarry(17);
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

    // ── the villager, at the end post of the handrail ───────────────────────
    const wv = legsOf(carrySource(cv, 0, n, V_X), V_LEGS[n], b, L);
    const xV = carry(cv, 0, n, wv.x, wv.x, 1);
    const dV = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), V_TURN[n], b, L), 1);
    let sv = bodyOf(wv, V_P, n, t, b, 0);
    // leaning on the post, forearms folded along its top: from b1 until b7
    const leanNow = A_TIMING[n] ? st(0.05, 0.3) : n > 1 && n < YEAR_N ? 1 : A_YEAR[n] ? 1 - st(0, 0.12) : 0;
    const lean = carry(cv, 2, n, leanNow, leanNow, tr);
    if (lean > 0) {
      sv = { ...sv, tilt: sv.tilt + 0.18 * lean };
      sv = hand(sv, xV, dV, 1, POST.x + 1, POST.y - 2, lean);
      sv = hand(sv, xV, dV, -1, POST.x - 6, POST.y + 1, lean);
    }
    // b7: two taps of the boot on the plank, and the arms folded at "Lovely"
    const foldNow = A_YEAR[n] ? st(0.74, 0.86) : n > YEAR_N ? 1 : 0;
    const fold = carry(cv, 3, n, foldNow, foldNow, tr);
    if (fold > 0) {
      sv = hand(sv, xV, dV, 1, xV + 9 * dV, 463, fold);
      sv = hand(sv, xV, dV, -1, xV + 6 * dV, 467, fold);
    }
    if (A_YEAR[n]) {
      const ext = st(0.28, 0.34) * (1 - st(0.62, 0.7));
      const lift = bp(0.34, 0.39, 0.44) + bp(0.46, 0.51, 0.56);
      sv = {
        ...sv,
        tilt: sv.tilt - 0.05 * ext,
        footR: { x: lerp(sv.footR.x, 21, ext), y: lerp(sv.footR.y, -4, ext) - 6 * lift },
      };
    }
    const prevV = carryFrom(heldV, n, hHold(V_P[p], t, 0));
    const figV = keepHeld(heldV, wv.walking ? mixKeepLegs(prevV, sv, tr) : mixStance(prevV, sv, tr));

    // ── the historian ───────────────────────────────────────────────────────
    const wh = legsOf(carrySource(cv, 4, n, H_X0), H_LEGS[n], b, L);
    const xH = carry(cv, 4, n, wh.x, wh.x, 1);
    const dH = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), H_TURN[n], b, L), 1);
    let sh = bodyOf(wh, H_P, n, t, b, 1);
    // down on his haunches at the gap (b2's end, b3's start), and again to lay it down
    const crHNow = A_ARRIVE[n] ? st(0.82, 0.92)
      : A_ROT[n] ? (1 - st(0.08, 0.18)) + st(0.7, 0.78) * (1 - st(0.88, 0.96)) : 0;
    const crH = carry(cv, 6, n, crHNow, crHNow, tr);
    if (crH > 0) sh = mixStance(sh, postureStill(CROUCH, t, 1), crH);
    if (A_ARRIVE[n]) {
      // the hat tipped once he is on the bridge, and a hand down to the broken plank
      const after = wh.arrive / L;
      sh = hand(sh, xH, dH, 1, xH + 5 * dH, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.13));
    }
    // the broken plank: in the hole, in his hand, and laid on the bank
    const pNow = A_ROT[n] ? st(0.03, 0.07) + st(0.8, 0.84) : n > ROT_N ? 2 : 0;
    const pT = carry(cv, 7, n, pNow, pNow, tr);
    const rotNow = A_ROT[n] ? lerp(lerp(HANG.rot, -90, st(0.1, 0.22)), LAID.rot, st(0.72, 0.8)) : n > ROT_N ? LAID.rot : HANG.rot;
    const pRot = carry(cv, 8, n, rotNow, rotNow, tr);
    if (A_ROT[n]) {
      // where his hand is: on the plank's end in the hole, lifting it, holding it up to
      // show the rot, carrying it back along the bridge, and laying it on the bank
      const up = st(0.1, 0.22);
      const lay = st(0.72, 0.8);
      const hx = lerp(lerp(HANG.x + 1, xH + 10 * dH, st(0.08, 0.16)), xH + 13 * dH, up);
      const hy = lerp(lerp(HANG.y + 1, 474, st(0.08, 0.16)), 462, up);
      const tx = lerp(hx, LAID.x + BROKEN_HALF, lay);
      const ty = lerp(hy, LAID.y, lay);
      sh = hand(sh, xH, dH, 1, tx, ty, st(0, 0.05) * (1 - st(0.84, 0.9)));
      // a finger on the rot, at "long-term cause"
      sh = hand(sh, xH, dH, -1, xH + 12 * dH, 440, bp(0.34, 0.42, 0.54));
    }
    // b6: the cart's wheel — the trigger — and, turned, the rotten plank behind him
    if (A_TRIGGER[n]) {
      const w = toward(xH, AXLE_OUT.x, AXLE_OUT.y, 24);
      sh = hand(sh, xH, dH, 1, w.x, w.y, bp(0.2, 0.28, 0.52));
      const pl = toward(xH, LAID.x, LAID.y, 24);
      sh = hand(sh, xH, dH, 1, pl.x, pl.y, bp(0.62, 0.7, 0.94));
    }
    // b8: his hands out like the two pans of a scale; the near one sinks, and they level
    if (A_WEIGH[n]) {
      const out = st(0.04, 0.14) * (1 - st(0.9, 0.99));
      const tip = 6 * st(0.36, 0.5) - 6 * st(0.66, 0.8);
      sh = hand(sh, xH, dH, 1, xH + 20 * dH, 462 + tip, out);
      sh = hand(sh, xH, dH, -1, xH + 8 * dH, 462 - tip, out);
    }
    const prevH = carryFrom(heldH, n, hHold(H_P[p], t, 1));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the carter ──────────────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 9, n, C_X), C_LEGS[n], b, L);
    const xC = carry(cv, 9, n, wc.x, wc.x, 1);
    const dC = carry(cv, 10, n, 0, faceOf(carrySource(cv, 10, n, -1), C_TURN[n], b, L), 1);
    let sc = bodyOf(wc, C_P, n, t, b, 2);
    // the cart, which follows his haul: 0 the shafts lying on the ground · 1 at his hips
    const liftNow = A_RELIEF[n] ? st(0.07, 0.14) * (1 - st(0.42, 0.46)) : 0;
    const lift = carry(cv, 11, n, liftNow, liftNow, tr);
    const axX = n < RELIEF_N ? AXLE_IN.x
      : n < MEND_N ? AXLE_IN.x + Math.max(0, Math.min(AXLE_OUT.x - AXLE_IN.x, xC - C_X)) : AXLE_OUT.x;
    const ax = axleAt(axX);
    const tilt = tiltFor(ax.y, lerp(TIP_REST, TIP_HELD, lift));
    const tip = tipAt(ax.x, ax.y, tilt);
    // b0: his hands spread open in front of him, at "honest" and again at "twenty
    // years" — the far hand stays forward of his body, never thrown back (AR4)
    if (A_STUCK[n]) {
      const spread = bp(0.12, 0.26, 0.5) + bp(0.62, 0.78, 0.98);
      sc = hand(sc, xC, dC, 1, xC + 17 * dC, 462, spread);
      sc = hand(sc, xC, dC, -1, xC + 5 * dC, 465, spread);
    }
    let crC = 0;
    if (A_RELIEF[n]) {
      // bent to the shafts, up with them, turned into them and away; dropped; a wipe
      crC = 0.55 * st(0, 0.06) * (1 - st(0.08, 0.14));
      const grip = st(0.0, 0.07) * (1 - st(0.42, 0.44));
      sc = hand(sc, xC, dC, 1, tip.x, tip.y - 1, grip);
      sc = hand(sc, xC, dC, -1, tip.x + 1, tip.y, grip);
      const across = st(0.54, 0.64);
      sc = hand(sc, xC, dC, 1, xC + lerp(9, -1, across) * dC, 428, bp(0.48, 0.54, 0.7));
    }
    // b10: the new plank, from against the barn to the gap
    const nNow = A_MEND[n] ? st(0.2, 0.24) + st(0.7, 0.76) : n > MEND_N ? 2 : 0;
    const nT = carry(cv, 12, n, nNow, nNow, tr);
    // carried one-handed near its end, its far end hangs low ahead of him the way a
    // board carried that way does (AR2), and comes level only as he lays it in the gap
    const nRotNow = A_MEND[n]
      ? lerp(lerp(NEW_LEAN.rot, NEW_CARRY_ROT, st(0.24, 0.3)), NEW_LAID.rot, st(0.6, 0.7))
      : n > MEND_N ? NEW_LAID.rot : NEW_LEAN.rot;
    const nRot = carry(cv, 13, n, nRotNow, nRotNow, tr);
    if (A_MEND[n]) {
      crC = st(0.6, 0.68) * (1 - st(0.8, 0.9));
      const grip0 = along(NEW_LEAN.x, NEW_LEAN.y, NEW_LEAN.rot, NEW_GRIP);
      const carryX = lerp(grip0.x, xC + 10 * dC, st(0.24, 0.3));
      const carryY = lerp(grip0.y, 472, st(0.24, 0.3));
      const layAt = along(NEW_LAID.x, NEW_LAID.y, NEW_LAID.rot, NEW_GRIP);
      const lay = st(0.62, 0.72);
      sc = hand(sc, xC, dC, 1, lerp(carryX, layAt.x, lay), lerp(carryY, layAt.y, lay), st(0.13, 0.2) * (1 - st(0.76, 0.8)));
    }
    const crCar = carry(cv, 14, n, crC, crC, tr);
    if (crCar > 0) sc = mixStance(sc, postureStill(CROUCH, t, 2), crCar);
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t, 2));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the things that move ───────────────────────────────────────────────
    const vil = pose(figV, xV, GROUND, K, dV, 1);
    const his = pose(figH, xH, GROUND, K, dH, 1);
    const car = pose(figC, xC, GROUND, K, dC, 1);
    // the broken plank, about its centre: its held end is 12 back from it
    const wH = wristOf(his, 'wrR');
    const hangC = along(HANG.x, HANG.y, HANG.rot, BROKEN_HALF);
    const heldC2 = along(wH.x, wH.y, pRot, BROKEN_HALF);
    const plankAt = pT <= 1
      ? { x: lerp(hangC.x, heldC2.x, pT), y: lerp(hangC.y, heldC2.y, pT) }
      : { x: lerp(heldC2.x, LAID.x, pT - 1), y: lerp(heldC2.y, LAID.y, pT - 1) };
    // the new plank, about its centre, held 16 from it
    const wC = wristOf(car, 'wrR');
    const nHeld = along(wC.x, wC.y, nRot, -NEW_GRIP);
    const newAt = nT <= 1
      ? { x: lerp(NEW_LEAN.x, nHeld.x, nT), y: lerp(NEW_LEAN.y, nHeld.y, nT) }
      : { x: lerp(nHeld.x, NEW_LAID.x, nT - 1), y: lerp(nHeld.y, NEW_LAID.y, nT - 1) };

    return {
      vil, his, car, t,
      cart: { x: ax.x, y: ax.y, o: 1, r: tilt },
      wheel: { x: ax.x, y: ax.y, o: 1, r: ((ax.x - AXLE_IN.x) / WHEEL_R) * (180 / Math.PI) },
      broken: { x: plankAt.x, y: plankAt.y, o: 1, r: pRot },
      fresh: { x: newAt.x, y: newAt.y, o: 1, r: nRot },
      q1: carry(cv, 15, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 16, n, Q2[p], Q2[n], tr),
    };
  });

  const DV = useDerivedValue<Bundle>(() => SCENE.value.vil);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.his);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.car);
  const cartP = useDerivedValue<At>(() => SCENE.value.cart);
  const wheelP = useDerivedValue<At>(() => SCENE.value.wheel);
  const brokenP = useDerivedValue<At>(() => SCENE.value.broken);
  const freshP = useDerivedValue<At>(() => SCENE.value.fresh);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="hist3-tree" />
      <LessonPicture name="hist3-barn" />
      <ObjectArt parts={VANE_ART} tone={TONE} />
      <View style={styles.spare} pointerEvents="none"><ObjectArt parts={NEW_ART} tone={TONE} /></View>
      <ObjectArt parts={STREAM_ART} tone={TONE} />
      <Ripples S={SCENE} />
      <ObjectArt parts={RAIL_ART} tone={TONE} />
      <Rider at={cartP} art={HAY_ART} />
      <Rider at={cartP} art={BODY_ART} />
      <Rider at={wheelP} art={WHEEL_ART} />
      {/* the deck in front of the wheel, so a wheel down in the gap is IN the bridge */}
      <ObjectArt parts={DECK_ART} tone={TONE} />
      <ObjectArt parts={REEDS_ART} tone={TONE} />
      <Rider at={freshP} art={NEW_ART} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DV} k={K} role="crowd" wear={[]} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="lead" wear={BY_ID.stroller.pieces} />
      <Rider at={brokenP} art={BROKEN_ART} />
      {on(Q1) ? <CauseTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SparkTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or turned by ────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof newPlank> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

// ── the stream running under the bridge: light on the water, going downstream ─
const RIPPLES = [0, 1, 2, 3];
function Ripples({ S }: { S: SharedValue<any> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {RIPPLES.map((k) => <Ripple key={k} k={k} S={S} />)}
    </View>
  );
}
function Ripple({ k, S }: { k: number; S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 0.06 + k / RIPPLES.length) % 1;
    return {
      opacity: Math.min(1, f * 6, (1 - f) * 6) * 0.85,
      transform: [{ translateX: 116 + 146 * f }, { translateY: 508 + (k % 2) * 3.5 }],
    };
  });
  return <Animated.View style={[styles.ripple, st]} />;
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * The two questions are tapped ON THE STAGE (AP6), and each choice carries its name on
 * a small plate at its foot, inside its target (AN1), so the thing and the word for it
 * are one choice. No two live targets touch (AN4).
 */
type Q = { id: string; label: string; pw: number; ph: number; left: number; top: number; w: number; h: number; correct: boolean };
/** The rotten plank, where it lies on the bank. */
const PLANK_Q = { id: 'plank', label: 'PLANK', pw: 42, ph: 12.4, left: 82, top: 482, w: 44, h: 36 };
/** Q1: the plank, the cart and the stream. The rot built up for years. */
const CAUSE_Q: Q[] = [
  { ...PLANK_Q, correct: true },
  { id: 'cart', label: 'HAY CART', pw: 60, ph: 12.4, left: 192, top: 438, w: 72, h: 52, correct: false },
  { id: 'stream', label: 'STREAM', pw: 50, ph: 12.4, left: 134, top: 504, w: 54, h: 14, correct: false },
];
/** Q2: the cart, the plank and the weather vane. The cart came on the day. */
const SPARK_Q: Q[] = [
  { id: 'cart', label: 'HAY CART', pw: 60, ph: 12.4, left: 230, top: 426, w: 80, h: 46, correct: true },
  { ...PLANK_Q, correct: false },
  { id: 'vane', label: 'WEATHER VANE', pw: 56, ph: 22.4, left: 342, top: 314, w: 58, h: 56, correct: false },
];
function CauseTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={CAUSE_Q} k="q1" />;
}
function SparkTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={SPARK_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
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
            <NamePlate q={q} picked={picked} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/**
 * A name plate struck white on a hard ledge. Answered, the plate itself reacts: the right
 * one hops and lands with a squash; a wrong one is knocked sideways three times and sags
 * onto its ledge.
 */
function NamePlate({ q, picked }: { q: Q; picked: string | null }) {
  const hop = useSharedValue(0);
  const sq = useSharedValue(1);
  const shake = useSharedValue(0);
  const sag = useSharedValue(0);
  useEffect(() => {
    if (picked !== q.id) return;
    if (q.correct) {
      hop.value = withSequence(withTiming(-7, { duration: 150, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 130, easing: Easing.in(Easing.quad) }));
      sq.value = withSequence(withTiming(1, { duration: 280 }), withTiming(0.85, { duration: 70 }), withSpring(1, { damping: 7, stiffness: 260 }));
    } else {
      shake.value = withSequence(withTiming(-4, { duration: 50 }), withTiming(4, { duration: 90 }), withTiming(-3, { duration: 90 }), withTiming(2, { duration: 80 }), withTiming(0, { duration: 70 }));
      sag.value = withTiming(2.5, { duration: 260, easing: Easing.out(Easing.quad) });
    }
  }, [picked]);
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { translateY: hop.value + sag.value }, { scaleY: sq.value }, { scaleX: 2 - sq.value }],
  }));
  const w = Math.max(q.pw, q.label.length * 5.4 + 12);
  return (
    <Animated.View style={[styles.namePlate, { left: (q.w - w) / 2, width: w, height: q.ph }, st]} pointerEvents="none">
      <Text style={styles.nameText}>{q.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  spare: {
    position: 'absolute', left: 0, top: 0, width: 0, height: 0,
    transform: [{ translateX: SPARE.x }, { translateY: SPARE.y }, { rotate: `${SPARE.rot}deg` }],
  },
  ripple: {
    position: 'absolute', left: 0, top: 0, width: 9, height: 1.2, borderRadius: 0.6, backgroundColor: PAPER_LIT,
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE,
    borderRadius: 4, borderWidth: 1.2, borderColor: INK, paddingHorizontal: 3,
    boxShadow: lipOf(TONE),
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
    textAlign: 'center', alignSelf: 'stretch',
  },
});

export function Hist3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist3Scene} band={[306, 518]} camera={CAM} />;
}
