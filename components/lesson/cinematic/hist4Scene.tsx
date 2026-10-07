import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './hist4Script';
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
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, bicycleWheel, bicycleFrame, BIKE_AT, clockTower, towerBell, phoneShop, cycleRack,
  oldPhoto, TOWER_BELL_AT, SHOP_FASCIA,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-4, "What Changed, and What Stayed?" — A TOWN SQUARE.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. A visitor (the bun, oblivious) has a sepia
// photograph of the square from a hundred years ago and decides everything has changed;
// a local (plain, vain) has opinions about the improvements; the historian (the top
// hat) walks in and shows what changed, what stayed, and how fast.
//
//   b0   the visitor holds the old photograph by its bottom edge at her chest, looks
//        down at it, then lifts it a little and looks up at the square at
//        "Everything's different!".
//   b1   the local looks down at the photograph, then up at the square, chin up, and
//        folds his arms.
//   b2   the historian walks in from the left, past the clock tower, tips his hat,
//        turns back to the tower and points up at its clock: "still standing".
//   b3   at "change" he turns and points to the phone shop; at "continuity" he turns
//        and points up at the clock tower; then turns back to the others.
//   b4   Q1: the clock tower, the phone shop and the bike rack — tap one.
//   b5   the visitor steps to the horse trough, bends over it and touches a flower,
//        straightens and turns to the historian: "Did the horses just leave?"
//   b6   the historian points down at the trough and sweeps his hand slowly along the
//        street, out to the bike rack, "bit by bit, over about thirty years".
//   b7   the local turns to the phone shop and thumbs at its window, then turns back,
//        chin up, and folds his arms again: "I fully approve of."
//   b8   the historian steps to the visitor, who hands him the photograph; he turns,
//        walks back to the tower and holds the photograph up beside it, so both clocks
//        show; then lowers it and turns back.
//   b9   Q2: the horse trough, the phone shop and the clock tower — tap one.
//   b10  the quotation; the bell in the tower swings and strikes, everyone at ease.
//
// COMPOSITION, in stage units. The CLOCK TOWER stands at the back of the square on the
// left, 46–94 × 300–500: a plinth with an arched niche, a coursed sandstone shaft
// 52–88, the clock stage with its dial (r 11) at (70, 372), and the belfry, its bell
// hung at (70, 330). The old brick building on the right, 300–400 × 306–500, has two
// sash windows upstairs and a new shop front below: the blue fascia lettered PHONES at
// 302–398 × 405–419, a glass door and a window of phones. In front of its window a rack
// of two Sheffield stands, 335–399 × 466–500, with a red bicycle locked to the first
// (330–382). The granite HORSE TROUGH, planted with flowers, 208–264 × 452–500, stands in
// the square between them. The HISTORIAN comes in from x −30 to 116, beside the tower;
// the VISITOR stands at 180, and at 192 once she has been to the trough; the LOCAL at
// 288, by the shop. Every figure is at least 60 from the next once placed, and the
// photograph passes between visitor and historian at (171, 458), inside both arms'
// reach (~23 units from the shoulder at K 0.76). Band [300, 514]: the tower's finial is
// at 300, the floor shows 14.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners hold listening poses that are alive but still, and no arm
// moves but to hold, hand over, point, tip a hat, fold or touch (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const TR = 0.85;
/** 78 units of figure in a 214-unit band: 36.4%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, history-foundations-4), except where the action needs
 * longer than the line and runs on after it — b2 (the walk in, the hat and the point)
 * and b8 (the photograph handed over, walked back and held up). 0 for a beat with no
 * voice.
 */
const LINES = [3.77, 3.15, 5.9, 5.78, 0, 4.71, 6.03, 4.77, 5.6, 0, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, waiting.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_PHOTO = is('photo');
const A_IMPROVE = is('improve');
const A_ARRIVE = is('arrive');
const A_NAMES = is('names');
const A_TROUGH = is('trough');
const A_SLOW = is('slow');
const A_SHOP = is('shop');
const A_PACE = is('pace');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.stayed ? 1 : 0));
const Q2 = BEATS.map((b) => (b.slowly ? 1 : 0));
const IMPROVE_N = A_IMPROVE.indexOf(1);
const TROUGH_N = A_TROUGH.indexOf(1);
const SHOP_N = A_SHOP.indexOf(1);
const PACE_N = A_PACE.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const B_X = 180;
const B_TROUGH = 192;
const P_X = 288;
const H_X0 = -30;
const H_X = 116;
/** Where the historian steps in to take the photograph, and where he holds it up. */
const H_TAKE = 150;
const H_TOWER = 112;
const B_LEGS: Track[] = BEATS.map((_, n) => (n < TROUGH_N ? [[0, B_X]] : n === TROUGH_N ? [[0.05, B_TROUGH]] : [[0, B_TROUGH]]));
const B_TURN: Track[] = BEATS.map((_, n) => (n < 2 ? [[0, 1]]
  : n === 2 ? [[0, 1], [0.25, -1]]
    : n === TROUGH_N ? [[0, -1], [0.03, 1], [0.62, -1]] : [[0, -1]]));
const P_LEGS: Track[] = BEATS.map(() => [[0, P_X]]);
const P_TURN: Track[] = BEATS.map((_, n) => (n === SHOP_N ? [[0, -1], [0.05, 1], [0.55, -1]] : [[0, -1]]));
const H_LEGS: Track[] = BEATS.map((b, n) => (!b.hist ? [[0, H_X0]]
  : n < PACE_N ? [[0, H_X]]
    : n === PACE_N ? [[0.02, H_TAKE], [0.32, H_TOWER]] : [[0, H_TOWER]]));
const H_TURN: Track[] = BEATS.map((_, n) => (A_ARRIVE[n] ? [[0, 1], [0.5, -1], [0.9, 1]]
  : A_NAMES[n] ? [[0, -1], [0.04, 1], [0.44, -1], [0.88, 1]]
    : n === PACE_N ? [[0, 1], [0.3, -1], [0.92, 1]] : [[0, 1]]));
/**
 * What each is doing with his body: talking while he speaks, nodding along while
 * somebody else does (N21), and waiting while the reader answers.
 */
const B_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, NOD, WAIT, NOD, WAIT];
const P_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD];
const H_P = [NOD, NOD, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, WAIT];

// ── the square ───────────────────────────────────────────────────────────────
const TOWER = { x: 70, y: 400, w: 48, h: 200 };
const TOWER_ART = clockTower(TOWER.x, TOWER.y, TOWER.w, TOWER.h);
/** The tower's clock, which a hand points up at. */
const CLOCK = { x: 70, y: 372 };
/** The bell's hanging point in the belfry, from the drawing. */
const BELL = {
  x: TOWER.x - TOWER.w / 2 + TOWER_BELL_AT.x * (TOWER.w / TOWER_BELL_AT.w),
  y: TOWER.y - TOWER.h / 2 + TOWER_BELL_AT.y * (TOWER.h / TOWER_BELL_AT.h),
};
const BELL_ART = towerBell(0, 5, 10, 10);
const SHOP = { x: 350, y: 403, w: 100, h: 194 };
const SHOP_ART = phoneShop(SHOP.x, SHOP.y, SHOP.w, SHOP.h);
/** The fascia, on the stage, where PHONES is lettered. */
const FASCIA = {
  left: SHOP.x - SHOP.w / 2 + SHOP_FASCIA.x,
  top: SHOP.y - SHOP.h / 2 + SHOP_FASCIA.y,
  w: SHOP_FASCIA.w,
  h: SHOP_FASCIA.h,
};
/** The shop's window, which a thumb points at. */
const WINDOW = { x: 350, y: 440 };
const TROUGH = { x: 236, y: 476, w: 56, h: 48 };
/** A geranium on the trough's near end, which she touches. */
const FLOWER = { x: 213, y: 461 };
const RACK = { x: 367, y: 483, w: 64, h: 34 };
const RACK_ART = cycleRack(RACK.x, RACK.y, RACK.w, RACK.h);
/** The red bicycle locked to the first stand, front to the left, wheels on the ground. */
const BIKE_S = 54;
const BIKE_WHEEL_D = (BIKE_AT.wheelR * (BIKE_S / 100)) / 0.44;
const BIKE_AXLE_Y = GROUND - BIKE_WHEEL_D * 0.485;
const BIKE = { x: 356, y: BIKE_AXLE_Y - BIKE_S * (BIKE_AT.frontAxle.y / 100) + BIKE_S / 2 };
const onBike = (p: { x: number; y: number }) => ({ x: BIKE.x + (p.x - 50) * (BIKE_S / 100), y: BIKE.y + (p.y - 50) * (BIKE_S / 100) });
const FRONT = onBike(BIKE_AT.frontAxle);
const REAR = onBike(BIKE_AT.rearAxle);
const WHEEL_F_ART = bicycleWheel(FRONT.x, FRONT.y, BIKE_WHEEL_D, BIKE_WHEEL_D);
const WHEEL_R_ART = bicycleWheel(REAR.x, REAR.y, BIKE_WHEEL_D, BIKE_WHEEL_D);
const FRAME_ART = tint(bicycleFrame(BIKE.x, BIKE.y, BIKE_S, BIKE_S), 'enamel');
/** The photograph, drawn about the middle of its bottom edge, where it is held. */
const PH = { w: 20, h: 14 };
const PHOTO_ART = oldPhoto(0, -PH.h / 2, PH.w, PH.h);
/** Where the photograph passes from her hand to his. */
const PASS = { x: 171, y: 458 };

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
/** A head turned up (negative) or down (positive), the spine going with it (N12). */
function lookOf(s: Stance, neck: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return { ...s, neck: lerp(s.neck, neck, w), tilt: s.tilt + (neck < 0 ? -0.06 : 0.08) * w };
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
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0)
    : hLive(codes[n], t, b);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

const CAM = followMoves(H_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('history'));

export default function Hist4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldP = useHeld();
  const heldH = useHeld();
  const cv = useCarry(13);
  const on = useLinger(i);
  // THE SQUARE ANSWERS BACK: which thing was tapped on a graded beat, and how many seconds
  // ago. Each reply is physical and its own: the tower's bell swings out and rings (right)
  // or gives one dull knock (wrong); the trough's flowers bounce up and settle (right); the
  // shop shudders and the bike rocks on its stand (wrong, both new since the photograph).
  // Everything they move is carried, so the next beat takes it from where it is (AH4).
  const pick = useSharedValue(-1);
  const since = useSharedValue(0);
  useEffect(() => {
    const qs = Q1[i] ? STAYED_Q : Q2[i] ? SLOWLY_Q : null;
    if (!qs) return;
    const k = picked === null ? -1 : ANSWER_IDS.indexOf(picked);
    pick.value = k;
    since.value = 0;
    if (k >= 0) since.value = withTiming(6, { duration: 6000, easing: Easing.linear });
  }, [picked, i, pick, since]);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const pk = Q1[n] || Q2[n] ? pick.value : -1;
    const rs = since.value;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the visitor, with the photograph ───────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, B_X), B_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), B_TURN[n], b, L), 1);
    let sb = bodyOf(wb, B_P, n, t, b);
    // she holds it by its bottom edge at her chest, in front of her, until she hands
    // it over on b8 (AR2, AR6)
    const bHolds = n < PACE_N ? 1 : n === PACE_N ? 1 - st(0.3, 0.38) : 0;
    if (bHolds > 0) {
      let hx = xB + 11 * dB;
      let hy = 467;
      // b0: lifted a little at "Everything's different!", and held there
      if (A_PHOTO[n]) {
        const up = st(0.64, 0.74);
        hx = xB + lerp(11, 15, up) * dB;
        hy = lerp(467, 459, up);
      }
      // b1: lowered back to her chest as he looks at it
      if (A_IMPROVE[n]) hy = lerp(459, 467, st(0.0, 0.2));
      // b8: held out to him, and let go once he has it
      if (A_PACE[n]) {
        const out = st(0.08, 0.2);
        hx = lerp(hx, PASS.x, out);
        hy = lerp(hy, PASS.y, out);
      }
      sb = hand(sb, xB, dB, 1, hx, hy, bHolds);
    }
    if (A_PHOTO[n]) {
      // a look down at the photograph, and then up at the square
      sb = lookOf(sb, 0.16, bp(0.06, 0.2, 0.5));
      sb = lookOf(sb, -0.14, st(0.66, 0.78));
    }
    if (A_IMPROVE[n]) sb = lookOf(sb, -0.14, 1 - st(0.0, 0.3));
    // b5: bent over the trough, a finger to a geranium, and up again
    if (A_TROUGH[n]) {
      const bend = st(0.3, 0.42) * (1 - st(0.56, 0.66));
      sb = lookOf({ ...sb, tilt: sb.tilt + 0.2 * bend }, 0.24, bend);
      sb = hand(sb, xB, dB, -1, FLOWER.x, FLOWER.y, bp(0.34, 0.44, 0.58));
    }
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the local, by the shop ─────────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 2, n, P_X), P_LEGS[n], b, L);
    const xP = carry(cv, 2, n, wp.x, wp.x, 1);
    const dP = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), P_TURN[n], b, L), 1);
    let sp = bodyOf(wp, P_P, n, t, b);
    // b1: a look down at her photograph, then up at the square, chin up, arms folded
    if (A_IMPROVE[n]) {
      sp = lookOf(sp, 0.18, bp(0.04, 0.16, 0.36));
      sp = lookOf(sp, -0.22, st(0.42, 0.56));
    }
    // arms folded from b1 on; unfolded on b7 to thumb at the shop, folded again after
    const foldNow = n < IMPROVE_N ? 0 : A_IMPROVE[n] ? st(0.4, 0.54)
      : A_SHOP[n] ? 1 - bp(0.1, 0.16, 0.6) : 1;
    if (foldNow > 0) {
      sp = hand(sp, xP, dP, 1, xP + 9 * dP, 463, foldNow);
      sp = hand(sp, xP, dP, -1, xP + 6 * dP, 467, foldNow);
    }
    if (A_SHOP[n]) {
      // turned to the shop: a thumb at its window, at "phone shop"; turned back, chin up
      const w = toward(xP, WINDOW.x, WINDOW.y, 20);
      sp = hand(sp, xP, dP, 1, w.x, w.y, bp(0.14, 0.24, 0.5));
      sp = lookOf(sp, -0.22, st(0.62, 0.74));
    }
    const prevP = carryFrom(heldP, n, hHold(P_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the historian ──────────────────────────────────────────────────────
    const wh = legsOf(carrySource(cv, 4, n, H_X0), H_LEGS[n], b, L);
    const xH = carry(cv, 4, n, wh.x, wh.x, 1);
    const dH = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), H_TURN[n], b, L), 1);
    let sh = bodyOf(wh, H_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; then, turned back, a hand up at the clock
      const after = wh.arrive / L;
      sh = hand(sh, xH, dH, 1, xH + 5 * dH, GROUND - 76, bp(after + 0.01, after + 0.05, after + 0.1));
      const c = toward(xH, CLOCK.x, CLOCK.y, 23);
      sh = hand(sh, xH, dH, 1, c.x, c.y, bp(0.56, 0.64, 0.86));
      sh = lookOf(sh, -0.2, bp(0.56, 0.64, 0.86));
    }
    if (A_NAMES[n]) {
      // "change": the phone shop · "continuity": the clock tower, looked up at
      const s = toward(xH, WINDOW.x, 420, 23);
      sh = hand(sh, xH, dH, 1, s.x, s.y, bp(0.1, 0.18, 0.4));
      const c = toward(xH, CLOCK.x, CLOCK.y, 23);
      sh = hand(sh, xH, dH, 1, c.x, c.y, bp(0.5, 0.58, 0.86));
      sh = lookOf(sh, -0.2, bp(0.5, 0.58, 0.86));
    }
    if (A_SLOW[n]) {
      // down at the trough, then slowly along the street to the bike rack
      const u = st(0.22, 0.72);
      const w = toward(xH, lerp(TROUGH.x, RACK.x - 12, u), lerp(470, 482, u), 23);
      sh = hand(sh, xH, dH, 1, w.x, w.y, st(0.08, 0.2) * (1 - st(0.8, 0.94)));
    }
    // the photograph in his hand: taken on b8, walked back, held up beside the tower
    const hHolds = n < PACE_N ? 0 : n === PACE_N ? st(0.14, 0.24) : 1;
    if (hHolds > 0) {
      let hx = xH + 12 * dH;
      let hy = 466;
      if (A_PACE[n]) {
        const take = 1 - st(0.24, 0.32);
        hx = lerp(hx, PASS.x, take);
        hy = lerp(hy, PASS.y, take);
        const lift = st(0.5, 0.62) * (1 - st(0.88, 0.96));
        hx = lerp(hx, xH + 22 * dH, lift);
        hy = lerp(hy, 438, lift);
        sh = lookOf(sh, -0.12, lift);
      }
      sh = hand(sh, xH, dH, 1, hx, hy, hHolds);
    }
    const prevH = carryFrom(heldH, n, hHold(H_P[p], t));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the things that move ───────────────────────────────────────────────
    const vis = pose(figB, xB, GROUND, K, dB, 1);
    const loc = pose(figP, xP, GROUND, K, dP, 1);
    const his = pose(figH, xH, GROUND, K, dH, 1);
    // the photograph: in her hand, then in his — on the wrist every frame (AR7.4)
    const ownNow = n < PACE_N ? 0 : n === PACE_N ? st(0.24, 0.3) : 1;
    const own = carry(cv, 6, n, ownNow, ownNow, tr);
    const wB = wristOf(vis, 'wrR');
    const wH = wristOf(his, 'wrR');
    const photo = { x: lerp(wB.x, wH.x, own), y: lerp(wB.y, wH.y, own) - 1, o: 1, r: 0 };
    // b10: the bell swings and strikes, twice, and settles
    const bellRest = A_REST[n] ? 16 * Math.sin(b * 5.2) * Math.exp(-b * 0.9) * st(0.0, 0.08) : 0;
    // the answers: the bell rings out for the tower in Q1, and knocks once for it in Q2
    const swingIn = clamp01(rs / 0.12);
    const bellAns = pk === ID_TOWER
      ? (Q1[n] ? 24 * Math.sin(rs * 6.4) * Math.exp(-rs * 0.8) : 7 * Math.sin(rs * 9) * Math.exp(-rs * 3.2)) * swingIn
      : 0;
    const bellNow = bellRest + bellAns;
    const bell = carry(cv, 7, n, bellNow, bellNow, tr);
    // the shop shudders · the bike rocks on its stand · the flowers bounce and settle
    const shopNow = pk === ID_SHOP ? 2.4 * Math.sin(rs * 34) * Math.exp(-rs * 4.2) * swingIn : 0;
    const rackNow = pk === ID_RACK ? 6 * Math.sin(rs * 13) * Math.exp(-rs * 3) * swingIn : 0;
    const bloomNow = pk === ID_TROUGH ? 0.16 * Math.sin(rs * 11) * Math.exp(-rs * 3.4) * swingIn : 0;
    const shop = carry(cv, 10, n, shopNow, shopNow, tr);
    const rack = carry(cv, 11, n, rackNow, rackNow, tr);
    const bloom = carry(cv, 12, n, bloomNow, bloomNow, tr);

    return {
      vis, loc, his, t,
      photo,
      bell: { x: BELL.x, y: BELL.y, o: 1, r: bell },
      shop, rack, bloom,
      q1: carry(cv, 8, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 9, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.vis);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.loc);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.his);
  const photoP = useDerivedValue<At>(() => SCENE.value.photo);
  const bellP = useDerivedValue<At>(() => SCENE.value.bell);
  const shopShake = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.shop }] }));
  // the bike and its rack rock about the rack's foot
  const rackRock = useAnimatedStyle(() => ({
    transform: [
      { translateX: RACK.x }, { translateY: GROUND }, { rotate: `${SCENE.value.rack}deg` },
      { translateX: -RACK.x }, { translateY: -GROUND },
    ],
  }));
  // the trough's planting springs up and settles, about the trough's foot
  const troughBloom = useAnimatedStyle(() => {
    const u = SCENE.value.bloom;
    return {
      transform: [
        { translateX: TROUGH.x }, { translateY: GROUND }, { scaleX: 1 - u * 0.35 }, { scaleY: 1 + u },
        { translateX: -TROUGH.x }, { translateY: -GROUND },
      ],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* the far side of the square: houses, paving and sky, one picture behind it all */}
      <LessonPicture name="hist4-street" />
      <Animated.View style={[styles.rider, shopShake]} pointerEvents="none">
        <ObjectArt parts={SHOP_ART} tone={TONE} />
        <View style={styles.fascia} pointerEvents="none">
          <Text style={styles.fasciaText}>PHONES</Text>
        </View>
      </Animated.View>
      <ObjectArt parts={TOWER_ART} tone={TONE} />
      <Rider at={bellP} art={BELL_ART} />
      <Animated.View style={[styles.rider, rackRock]} pointerEvents="none">
        <ObjectArt parts={RACK_ART} tone={TONE} />
        <ObjectArt parts={WHEEL_F_ART} tone={TONE} />
        <ObjectArt parts={WHEEL_R_ART} tone={TONE} />
        <ObjectArt parts={FRAME_ART} tone={TONE} />
      </Animated.View>
      {/* the horse trough, planted with flowers: a drawing (lessonart/lessons/hist4.mjs) */}
      <Animated.View style={[styles.rider, troughBloom]} pointerEvents="none">
        <LessonPicture name="hist4-trough" />
      </Animated.View>
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Rider at={photoP} art={PHOTO_ART} />
      {on(Q1) ? <StayedTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SlowlyTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or hung by ──────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof oldPhoto> }) {
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

// ── the two questions ────────────────────────────────────────────────────────

/**
 * The two questions are tapped ON THE STAGE (AP6), and each choice carries its name on
 * a small plate at its foot, inside its target (AN1), so the thing and the word for it
 * are one choice. No two live targets touch (AN4).
 */
type Q = { id: string; label: string; pw: number; ph: number; left: number; top: number; w: number; h: number; correct: boolean };
const TOWER_Q = { id: 'tower', label: 'CLOCK TOWER', pw: 46, ph: 22.4, left: 38, top: 302, w: 64, h: 192 };
const SHOP_Q = { id: 'shop', label: 'PHONE SHOP', pw: 76, ph: 12.4, left: 300, top: 312, w: 100, h: 150 };
/** Every thing a reader can tap in either question, in the order the scene's replies read them. */
const ANSWER_IDS = ['tower', 'shop', 'rack', 'trough'];
const ID_TOWER = 0;
const ID_SHOP = 1;
const ID_RACK = 2;
const ID_TROUGH = 3;
/** Q1: the tower, the shop and the bike rack. The tower is in the old photograph and still stands. */
const STAYED_Q: Q[] = [
  { ...TOWER_Q, correct: true },
  { ...SHOP_Q, correct: false },
  { id: 'rack', label: 'BIKE RACK', pw: 64, ph: 12.4, left: 326, top: 466, w: 74, h: 34, correct: false },
];
/** Q2: the trough, the shop and the tower. The trough went out of use slowly, as cars came. */
const SLOWLY_Q: Q[] = [
  { id: 'trough', label: 'HORSE TROUGH', pw: 52, ph: 22.4, left: 204, top: 448, w: 64, h: 52, correct: true },
  { ...SHOP_Q, correct: false },
  { ...TOWER_Q, correct: false },
];
function StayedTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={STAYED_Q} k="q1" />;
}
function SlowlyTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={SLOWLY_Q} k="q2" />;
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
            <View style={[styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw, height: q.ph }]}>
              <Text style={styles.nameText}>{q.label}</Text>
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
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  fascia: {
    position: 'absolute', left: FASCIA.left, top: FASCIA.top, width: FASCIA.w, height: FASCIA.h,
    alignItems: 'center', justifyContent: 'center',
  },
  fasciaText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 1.6, color: NATURAL.fascia.label,
    includeFontPadding: false,
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE,
    borderRadius: 4, borderWidth: 1.2, borderColor: INK, boxShadow: lipOf(TONE),
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
    textAlign: 'center', alignSelf: 'stretch',
  },
});

export function Hist4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist4Scene} band={[300, 514]} camera={CAM} />;
}
