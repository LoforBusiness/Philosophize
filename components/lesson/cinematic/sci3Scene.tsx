import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import LessonPicture from './LessonPicture';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './sci3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, sun, promRailing, parasolPole, parasolFurled, parasolCanopy, iceKiosk, queueStand, flipChart, iceCornet,
  sunCream, fairCloud, KIOSK_SIGN, FLIP_PAPER,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-3, "Correlation Isn't Causation" — A SEASIDE PROMENADE AND BEACH.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The beach-goer (the bun) is in the queue at
// the ice cream kiosk and has read a chart; her friend (plain) comes down off the
// promenade with a strawberry cornet; the scientist (the top hat) walks in along the
// promenade and shows them what two rising lines can and cannot say.
//
//   b0   she points at the flipchart's two rising lines; her friend, up on the
//        promenade, listens with his cornet in his hand. The sun is behind a cloud.
//   b1   he walks down onto the sand, holding his cornet up and eyeing it.
//   b2   the scientist walks in along the promenade, tips his hat, and traces the
//        ice cream line and then the sunburn line with a finger; a dot runs up each.
//        Her friend turns to him.
//   b3   he sweeps a hand up both lines, then points up: the cloud drifts off the sun.
//   b4   Q1: the sun, the kiosk and the chart — tap one.
//   b5   she shades her eyes and looks up at the sun.
//   b6   he fetches the furled parasol off the railing, carries it past the chart,
//        plants it in the sand and pushes it open; its shade falls on the sand.
//   b7   he walks back; her friend steps under the parasol and sits down in its shade.
//   b8   he points at the shade, then at the open, sunny sand.
//   b9   Q2: the parasol's shade, the open sand and the kiosk's queue — tap one.
//   b10  she rubs sun cream on her arm, turns to the kiosk and takes a vanilla cornet
//        handed over the counter.
//   b11  the quotation; both of them lick their ice creams.
//
// COMPOSITION, in stage units. Sky to the horizon at 438, the sea 438–454, the beach's
// sand 106–400 from 454 to the ground at 500. The promenade's paving 0–106, its
// sea-green railing 0–106 × 422–454 with the furled parasol leaning on it (foot at 34).
// The flipchart on its tripod 100–180 × 382–500, its paper 105–175 × 393–443. The sun
// at (262, 338) and a fair-weather cloud that slides off it to 345. The kiosk 333–399 ×
// 376–500, its counter at 476 (the hip, AP10) and ICES on its sign board; the queue's
// stanchion at 300 with its rope hooked to the kiosk at 333. The parasol is planted at
// 222 (canopy 184–260 × 398–424). People: the scientist arrives at 84 (fetches the
// parasol from 44, plants it from 198); the friend starts at 60, stands at 264, then
// sits at 230 in the shade; the beach-goer stands in the queue at 322 and steps to 326
// to buy. Every hand-off is within the rig's safe reach (~23 units at K 0.76). Band
// [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-3), except where the action needs
 * longer and runs on after the line — b1 (the walk down onto the sand), b6 (the
 * parasol fetched, carried, planted and opened), b7 (the walk back and the sitting
 * down) and b10 (the sun cream and the cornet).
 */
const LINES = [5.49, 3.9, 5.71, 5.82, 0, 6.01, 6.13, 3.81, 6.58, 0, 4.21, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// and waiting — alive — while the reader answers or reads the quotation (N21).
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const WAIT = 161;
/** On the ground, legs out, one arm propping (moves.ts posture 3): sitting on the sand. */
const SAND_SEAT = 3;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CHART = is('chart');
const A_CORNET = is('cornet');
const A_ARRIVE = is('arrive');
const A_HIDDEN = is('hidden');
const A_SUNNY = is('sunny');
const A_CHANGE = is('change');
const A_SHADE = is('shade');
const A_TEST = is('test');
const A_CREAM = is('cream');
const A_REST = is('rest');
const SUN_V = BEATS.map((b) => b.sun ?? 1);
const OPEN_V = BEATS.map((b) => b.shade ?? 0);
const Q1 = BEATS.map((b) => (b.cause ? 1 : 0));
const Q2 = BEATS.map((b) => (b.trial ? 1 : 0));
/** The friend sits from b7 on. */
const SITS = BEATS.map((_, n) => (n >= 8 ? 1 : 0));
/** He nods along, seated, on every beat that is not his own line. */
const PL_NODS = BEATS.map((b) => (b.speaker === 'plain' ? 0 : 1));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and never before that. A turn is
// [fraction, facing]; it eases through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const PL_LEGS: Track[] = [
  [[0, 60]], [[0.04, 264]], [[0, 264]], [[0, 264]], [[0, 264]], [[0, 264]], [[0, 264]],
  [[0.1, 230]], [[0, 230]], [[0, 230]], [[0, 230]], [[0, 230]], [[0, 230]],
];
const PL_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0.4, -1]], [[0, -1]], [[0, -1]], [[0.04, 1]], [[0.1, -1]],
  [[0, -1], [0.36, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The scientist is off the stage, left, until he walks in on b2. */
const TH_LEGS: Track[] = [
  [[0, -40]], [[0, -40]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0.02, 44], [0.24, 198]],
  [[0.04, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]],
];
const TH_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, -1], [0.2, 1]],
  [[0, -1], [0.66, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The beach-goer stands in the queue, and steps up to the hatch to buy. */
const BN_LEGS: Track[] = [
  [[0, 322]], [[0, 322]], [[0, 322]], [[0, 322]], [[0, 322]], [[0, 322]], [[0, 322]],
  [[0, 322]], [[0, 322]], [[0, 322]], [[0.48, 326]], [[0, 326]], [[0, 326]],
];
const BN_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.46, 1], [0.84, -1]], [[0, -1]], [[0, -1]],
];
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PL_P = [NOD, TALK, NOD, NOD, WAIT, NOD, NOD, TALK, NOD, WAIT, NOD, WAIT, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, WAIT, LISTEN];
const BN_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, NOD, WAIT, TALK, WAIT, LISTEN];

// ── the seaside ──────────────────────────────────────────────────────────────
const HORIZON = 438;
const SAND_TOP = 454;
const PROM_W = 106;
const SUN_AT = { x: 262, y: 338, d: 36 };
const CLOUD_IN = 262;
const CLOUD_OUT = 345;
const CLOUD_Y = 340;
/** The kiosk: its box, and its counter ledge at the hip. */
const KIOSK = { x: 366, w: 66, h: 124 };
const KIOSK_TOP = GROUND - KIOSK.h;
const COUNTER_Y = 476;
/** Where the vanilla cornet is handed out, over the counter. */
const HATCH_HAND = { x: 348, y: 466 };
/** The flipchart, and the paper on its board. */
const FLIP = { x: 140, w: 80, h: 118 };
const PAPER = {
  x0: FLIP.x - FLIP.w / 2 + FLIP_PAPER.x - FLIP_PAPER.w / 2,
  y0: GROUND - FLIP.h + FLIP_PAPER.y - FLIP_PAPER.h / 2,
  w: FLIP_PAPER.w,
  h: FLIP_PAPER.h,
};
/** The two lines on the chart, in the paper's own units: both rise left to right. */
const ICE_PTS = [[5, 40], [20, 36], [35, 31], [50, 27], [66, 21]] as const;
const BURN_PTS = [[5, 45], [20, 42], [35, 38], [50, 33], [66, 28]] as const;
/** The parasol: its pole's length, where it is gripped, and its three places. */
const POLE_L = 104;
const GRIP = 52;
/** Leaning on the railing: the pole's top, and its angle (top to the left). */
const LEAN = { x: 23.1, y: 398.6, r: -6 };
/** Planted in the sand, upright, its spike buried 3 units. */
const PLANT = { x: 222, y: GROUND + 3 - POLE_L, r: 0 };
/** Carried in one hand, tipped forward 50 degrees. */
const CARRY_R = 50;

const RAIL_ART = promRailing(PROM_W / 2, 438, PROM_W, 32);
const KIOSK_ART = iceKiosk(KIOSK.x, GROUND - KIOSK.h / 2, KIOSK.w, KIOSK.h);
const QUEUE_ART = queueStand(316, GROUND - 22, 36, 44);
const FLIP_ART = flipChart(FLIP.x, GROUND - FLIP.h / 2, FLIP.w, FLIP.h);
const SUN_ART = sun(0, 0, SUN_AT.d, SUN_AT.d);
const CLOUD_ART = fairCloud(0, 0, 60, 22);
// The things that move are drawn about the point they are held or turned by.
const POLE_ART = parasolPole(0, POLE_L / 2, POLE_L, POLE_L);
const FURLED_ART = parasolFurled(0, 27, 7, 46);
const CANOPY_ART = parasolCanopy(0, 37, 76, 76);
const PINK_ART = iceCornet(0, -3, 9, 17, 'scoopPink');
const VANILLA_ART = iceCornet(0, -3, 9, 17, 'vanilla');
const CREAM_ART = sunCream(0, -2, 5, 11);

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
/** Sitting on the sand, legs out, propped on one arm. Still (AL1). */
function onSand(t: number): Stance {
  'worklet';
  return postureStill(SAND_SEAT, t);
}
/** A point `u` of the way along one of the chart's lines, on the stage. */
function along(pts: readonly (readonly number[])[], u: number) {
  'worklet';
  const n = pts.length - 1;
  const f = clamp01(u) * n;
  const k = Math.min(n - 1, Math.floor(f));
  const r = f - k;
  return {
    x: PAPER.x0 + lerp(pts[k][0], pts[k + 1][0], r),
    y: PAPER.y0 + lerp(pts[k][1], pts[k + 1][1], r),
  };
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
  let end = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    end = start + dur;
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, end };
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
/** The parasol's top, given where it is gripped and its angle. */
function topFromGrip(gx: number, gy: number, r: number) {
  'worklet';
  const a = (r * Math.PI) / 180;
  return { x: gx + GRIP * Math.sin(a), y: gy - GRIP * Math.cos(a) };
}
function gripOf(top: { x: number; y: number; r: number }) {
  'worklet';
  const a = (top.r * Math.PI) / 180;
  return { x: top.x - GRIP * Math.sin(a), y: top.y + GRIP * Math.cos(a) };
}

/** What was tapped, as a number a worklet can read. */
const PK: Record<string, number> = { sun: 1, kiosk: 2, chart: 3, shade: 4, sand: 5, queue: 6 };
function shakeOf(rx: number) {
  'worklet';
  return Math.sin(rx * 30) * (1 - rx) * (1 - rx) * 7;
}
function popOf(rx: number) {
  'worklet';
  return Math.exp(-5 * rx) * Math.sin(rx * 15) * 0.3;
}

const CAM = followMoves(PL_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('science'));

export default function Sci3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(14);
  const on = useLinger(i);
  // the physical reaction to a tap: which thing, and how far through (a pop-and-settle for
  // the right answer, a shake for the wrong one)
  const pk = useSharedValue(0);
  const rx = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? PK[picked] ?? 0 : 0;
    rx.value = 0;
    if (picked) rx.value = withTiming(1, { duration: 900, easing: Easing.linear });
  }, [picked, pk, rx]);
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

    // ── the weather and the parasol, whose state the hands follow ──────────
    const sunNow = A_HIDDEN[n] ? st(0.55, 0.85) : SUN_V[n];
    const sunV = carry(cv, 0, n, sunNow, sunNow, tr);
    // umbT 0 leaning on the railing · 1 in his hand · 2 planted in the sand
    const umbNow = A_CHANGE[n] ? st(0.15, 0.2) + st(0.72, 0.78) : n > 6 ? 2 : 0;
    const umbT = carry(cv, 1, n, umbNow, umbNow, tr);
    const openNow = A_CHANGE[n] ? st(0.79, 0.93) : OPEN_V[n];
    const open = carry(cv, 2, n, openNow, openNow, tr);

    // ── the scientist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 3, n, -40), TH_LEGS[n], b, L);
    const xT = carry(cv, 3, n, wt.x, wt.x, 1);
    const dT = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; then a finger up each line in turn
      const after = moveTr(-40, 84, TR) / L;
      // the hand goes from the brim of his hat straight out to the chart, never back to
      // his side in between (AR5)
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, st(after + 0.01, after + 0.06));
      // then ONE pointing hand follows the dot up the ice cream line, crosses to the
      // sunburn line's foot and follows it up, and stays on its top as he finishes — the
      // chart is past his reach, so the arm points along the line the dot is drawing
      // rather than dropping back to his side between the two (AR5)
      const ice = along(ICE_PTS, st(0.6, 0.76));
      const burn = along(BURN_PTS, st(0.79, 0.95));
      const cross = st(0.76, 0.79);
      stt = hand(stt, xT, dT, 1, lerp(ice.x, burn.x, cross), lerp(ice.y, burn.y, cross), st(after + 0.1, after + 0.17));
    }
    if (A_HIDDEN[n]) {
      // up both lines together; then up at the sun, held as the cloud drifts off it
      const sweep = along(ICE_PTS, st(0.06, 0.34));
      stt = hand(stt, xT, dT, 1, sweep.x, sweep.y + 3, bp(0.02, 0.08, 0.42));
      stt = hand(stt, xT, dT, 1, SUN_AT.x, SUN_AT.y, st(0.48, 0.56) * (1 - st(0.93, 1)));
    }
    // b6: the parasol fetched off the railing, carried, planted and pushed open
    if (A_CHANGE[n]) {
      const lean = gripOf(LEAN);
      stt = hand(stt, xT, dT, 1, lean.x, lean.y, st(0.1, 0.16));
      stt = hand(stt, xT, dT, 1, xT + 10 * dT, 452, st(0.17, 0.22));
      const plant = gripOf(PLANT);
      stt = hand(stt, xT, dT, 1, plant.x, plant.y, st(0.68, 0.74));
      // pushing the runner up the pole as it opens, then letting go
      stt = hand(stt, xT, dT, 1, PLANT.x, lerp(plant.y, PLANT.y + 30, st(0.79, 0.93)), st(0.76, 0.8) * (1 - st(0.94, 1)));
    }
    // b8: the shade, then the open sand in the sun
    if (A_TEST[n]) {
      stt = hand(stt, xT, dT, 1, PLANT.x, 486, bp(0.04, 0.12, 0.5));
      stt = hand(stt, xT, dT, 1, 280, 492, st(0.55, 0.63) * (1 - st(0.93, 1)));
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));
    const th = pose(figT, xT, GROUND, K, dT, 1);

    // ── her friend, with his strawberry cornet ──────────────────────────────
    const wp = legsOf(carrySource(cv, 5, n, PL_LEGS[0][0][1]), PL_LEGS[n], b, L);
    const xP = carry(cv, 5, n, wp.x, wp.x, 1);
    const dP = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, 1), PL_TURN[n], b, L), 1);
    const seatNow = A_SHADE[n] ? st(0.48, 0.66) : SITS[n];
    const seat = carry(cv, 7, n, seatNow, seatNow, tr);
    let sp = bodyOf(wp, PL_P, n, t, b);
    if (seat > 0) sp = mixStance(sp, onSand(t), seat);
    // seated, he nods along to whoever is talking (N21); his hands stay put (AP18)
    const nodP = carry(cv, 8, n, PL_NODS[n], PL_NODS[n], tr) * seat * Math.max(0, Math.sin(t * 1.45));
    sp = { ...sp, neck: sp.neck + 0.2 * nodP, tilt: sp.tilt + 0.03 * nodP };
    // b1 he eyes the cornet, his head bent to it; b3 he looks up at the sun as it comes out
    const eye = A_CORNET[n] ? bp(0.3, 0.45, 0.95) : 0;
    const lookUpP = A_HIDDEN[n] ? bp(0.7, 0.8, 1) : 0;
    sp = { ...sp, neck: sp.neck - 0.22 * eye + 0.32 * lookUpP };
    // his right hand holds the cornet: in front of him, up to his eyes on b1, and to
    // his mouth for a lick on the quotation
    const lick = A_REST[n] ? bp(0.1, 0.24, 0.38) + bp(0.55, 0.69, 0.83) : 0;
    const standCone = { x: xP + 9 * dP, y: 462 - 15 * eye };
    const sitCone = { x: xP + 12 * dP, y: 478 - 14 * lick };
    // and his head dips to meet the scoop as it comes up (AR3: the mouth meets the food)
    sp = { ...sp, neck: sp.neck - 0.12 * lick };
    sp = hand(sp, xP, dP, 1, lerp(standCone.x, sitCone.x, seat), lerp(standCone.y, sitCone.y, seat), 1);
    const prevP = carryFrom(heldP, n, SITS[p] ? onSand(t) : hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));
    const pl = pose(figP, xP, GROUND, K, dP, 1);

    // ── the beach-goer, in the queue ────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 9, n, BN_LEGS[0][0][1]), BN_LEGS[n], b, L);
    const xB = carry(cv, 9, n, wb.x, wb.x, 1);
    const dB = carry(cv, 10, n, 0, faceOf(carrySource(cv, 10, n, -1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P, n, t, b);
    // b0: "Look at the chart!" — her arm out at it
    if (A_CHART[n]) sb = hand(sb, xB, dB, 1, PAPER.x0 + 40, PAPER.y0 + 22, bp(0.02, 0.1, 0.62));
    // b5: a hand up to shade her eyes, and her head back to look at the sun
    const shadeEyes = A_SUNNY[n] ? bp(0.02, 0.12, 0.92) : 0;
    if (shadeEyes > 0) sb = hand(sb, xB, dB, 1, xB + 7 * dB, 430, shadeEyes);
    sb = { ...sb, neck: sb.neck + 0.34 * shadeEyes, tilt: sb.tilt + 0.05 * shadeEyes };
    // b10: the sun cream — the bottle in her left hand, her right rubbing her arm — then
    // the cornet handed over the counter, and held up
    const creamOn = A_CREAM[n] ? st(0.03, 0.08) * (1 - st(0.4, 0.46)) : 0;
    if (A_CREAM[n]) {
      sb = hand(sb, xB, dB, -1, xB + 8 * dB, 470, creamOn);
      // one slow stroke down the forearm, and the hand rests where it ended (AR5)
      const rub = st(0.14, 0.34);
      sb = hand(sb, xB, dB, 1, xB + lerp(3, 12, rub) * dB, lerp(462, 470, rub), st(0.08, 0.12) * (1 - st(0.42, 0.48)));
      // out to the hatch for the cornet; the hand that takes it brings it straight up in
      // front of her (holdCone, below), never back to her side first
      sb = hand(sb, xB, dB, 1, HATCH_HAND.x - 3, HATCH_HAND.y + 3, st(0.6, 0.68));
    }
    const coneNow = A_CREAM[n] ? st(0.5, 0.58) + st(0.67, 0.71) : n > 10 ? 2 : 0;
    const coneT = carry(cv, 11, n, coneNow, coneNow, tr);
    const lickB = A_REST[n] ? bp(0.3, 0.44, 0.58) : 0;
    const holdCone = A_CREAM[n] ? st(0.78, 0.86) : n > 10 ? 1 : 0;
    if (holdCone > 0) sb = hand(sb, xB, dB, 1, xB + 9 * dB, 462 - 12 * lickB, holdCone);
    // her head dips to meet the scoop as it comes up (AR3)
    sb = { ...sb, neck: sb.neck - 0.12 * lickB };
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));
    const bn = pose(figB, xB, GROUND, K, dB, 1);

    // ── the things that move ───────────────────────────────────────────────
    const wTR = wristOf(th, 'wrR');
    const wPR = wristOf(pl, 'wrR');
    const wBR = wristOf(bn, 'wrR');
    const wBL = wristOf(bn, 'wrL');
    // the parasol: by its top and its angle
    // tipped forward the way he faces, and through upright as he turns, so it never flips
    const carried = { ...topFromGrip(wTR.x, wTR.y, CARRY_R * dT), r: CARRY_R * dT };
    let top: { x: number; y: number; r: number };
    if (umbT <= 1) {
      const lifted = { ...topFromGrip(wTR.x, wTR.y, LEAN.r), r: LEAN.r };
      const held = { x: lerp(lifted.x, carried.x, clamp01(umbT * 3 - 2)), y: lerp(lifted.y, carried.y, clamp01(umbT * 3 - 2)), r: lerp(lifted.r, carried.r, clamp01(umbT * 3 - 2)) };
      top = { x: lerp(LEAN.x, held.x, umbT), y: lerp(LEAN.y, held.y, umbT), r: lerp(LEAN.r, held.r, umbT) };
    } else {
      const u = umbT - 1;
      top = { x: lerp(carried.x, PLANT.x, u), y: lerp(carried.y, PLANT.y, u), r: lerp(carried.r, PLANT.r, u) };
    }
    const iceTrace = A_ARRIVE[n] ? along(ICE_PTS, st(0.6, 0.76)) : along(ICE_PTS, 1);
    const burnTrace = A_ARRIVE[n] ? along(BURN_PTS, st(0.79, 0.95)) : along(BURN_PTS, 1);
    const coneAt = coneT <= 1
      ? { x: HATCH_HAND.x, y: HATCH_HAND.y, o: clamp01(coneT * 3) }
      : { x: lerp(HATCH_HAND.x, wBR.x, coneT - 1), y: lerp(HATCH_HAND.y, wBR.y, coneT - 1), o: 1 };

    return {
      th, pl, bn, t,
      sun: sunV,
      umb: { x: top.x, y: top.y, r: top.r, o: 1 },
      open,
      pink: { x: wPR.x, y: wPR.y, o: 1 },
      vanilla: { x: coneAt.x, y: coneAt.y, o: coneAt.o },
      cream: { x: wBL.x, y: wBL.y, o: clamp01(creamOn * 2) },
      ice: { x: iceTrace.x, y: iceTrace.y, o: A_ARRIVE[n] ? bp(0.58, 0.62, 0.8) : 0 },
      burn: { x: burnTrace.x, y: burnTrace.y, o: A_ARRIVE[n] ? bp(0.77, 0.81, 0.99) : 0 },
      q1: carry(cv, 12, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 13, n, Q2[p], Q2[n], tr),
    };
  });

  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);

  return (
    <View style={styles.scene}>
      <View style={styles.sky} pointerEvents="none" />
      <Sky S={SCENE} pk={pk} rx={rx} />
      <Boat S={SCENE} />
      <Sea S={SCENE} />
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.sand} pointerEvents="none" />
      <View style={styles.paving} pointerEvents="none" />
      <View style={styles.kerb} pointerEvents="none" />
      <ObjectArt parts={RAIL_ART} tone={TONE} />
      <Shaker pk={pk} rx={rx} ids={[2, 6]}>
        <ObjectArt parts={KIOSK_ART} tone={TONE} />
        <View style={styles.sign} pointerEvents="none">
          <Text style={styles.signText}>ICES</Text>
        </View>
        <ObjectArt parts={QUEUE_ART} tone={TONE} />
      </Shaker>
      <Tipper pk={pk} rx={rx}>
        <ObjectArt parts={FLIP_ART} tone={TONE} />
        <Chart S={SCENE} />
      </Tipper>
      <Shade S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <Parasol S={SCENE} pk={pk} rx={rx} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Held S={SCENE} />
      {on(Q1) ? <CauseTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <TrialTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} pk={pk} rx={rx} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or turned by ────────────

type At = { x: number; y: number; o: number; r?: number; sx?: number; sy?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof sun> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` },
      { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function Held({ S }: { S: SharedValue<any> }) {
  const pinkP = useDerivedValue<At>(() => S.value.pink);
  const vanillaP = useDerivedValue<At>(() => S.value.vanilla);
  const creamP = useDerivedValue<At>(() => S.value.cream);
  return (
    <>
      <Rider at={pinkP} art={PINK_ART} />
      <Rider at={vanillaP} art={VANILLA_ART} />
      <Rider at={creamP} art={CREAM_ART} />
    </>
  );
}

// ── the sun, and the cloud that drifts off it ───────────────────────────────
// Pictures (sci3-sun, sci3-cloud, sci3-boat) drawn against references; each rides a point.
function PicRider({ at, name }: { at: SharedValue<At>; name: string }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` },
      { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name={name} />
    </Animated.View>
  );
}
function Sky({ S, pk, rx }: { S: SharedValue<any>; pk: SharedValue<number>; rx: SharedValue<number> }) {
  // the sun breathes a little, swells as the cloud clears it, and when it is tapped (the
  // right answer) it squashes and springs back like a struck bell
  const sunP = useDerivedValue<At>(() => {
    const s = (0.9 + 0.1 * S.value.sun) * (1 + 0.02 * Math.sin(S.value.t * 1.3));
    const pop = pk.value === 1 ? popOf(rx.value) : 0;
    return { x: SUN_AT.x, y: SUN_AT.y, o: 1, r: 0, sx: s * (1 + pop), sy: s * (1 - pop * 0.6) };
  });
  const cloudP = useDerivedValue<At>(() => ({ x: lerp(CLOUD_IN, CLOUD_OUT, S.value.sun), y: CLOUD_Y, o: 1 }));
  return (
    <>
      <PicRider at={sunP} name="sci3-sun" />
      <PicRider at={cloudP} name="sci3-cloud" />
    </>
  );
}
/** A far boat drifting along the horizon. */
function Boat({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => ({
    x: 292 + Math.sin(S.value.t * 0.12) * 9, y: HORIZON - 1 + Math.sin(S.value.t * 0.9) * 0.6, o: 1,
    r: Math.sin(S.value.t * 0.9 + 1) * 1.6,
  }));
  return <PicRider at={at} name="sci3-boat" />;
}
/** Shakes what it holds sideways while one of `ids` is the thing that was tapped (a refusal). */
function Shaker({ pk, rx, ids, children }: { pk: SharedValue<number>; rx: SharedValue<number>; ids: number[]; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: ids.includes(pk.value) ? shakeOf(rx.value) : 0 }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">{children}</Animated.View>;
}
/** The flipchart rocks on its feet when it is tapped (wrong): it is not the cause. */
function Tipper({ pk, rx, children }: { pk: SharedValue<number>; rx: SharedValue<number>; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${pk.value === 3 ? shakeOf(rx.value) * 0.5 : 0}deg` }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, st, { transformOrigin: `${FLIP.x}px ${GROUND}px` }]} pointerEvents="none">{children}</Animated.View>;
}

// ── the sea, with its swell breaking along the shore ────────────────────────
const WAVES = [0, 1, 2, 3, 4, 5];
function Sea({ S }: { S: SharedValue<any> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.sea} />
      {WAVES.map((k) => <Wave key={k} k={k} S={S} />)}
    </View>
  );
}
function Wave({ k, S }: { k: number; S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 0.12 + k / WAVES.length) % 1;
    return { opacity: Math.sin(f * Math.PI) * 0.9, transform: [{ translateX: -40 + f * 480 }] };
  });
  return <Animated.View style={[styles.wave, { top: HORIZON + 4 + (k % 3) * 4 }, st]} />;
}

// ── the chart on the flipchart's paper ──────────────────────────────────────
type Seg = { left: number; top: number; width: number; rot: string };
function segsOf(pts: readonly (readonly number[])[]): Seg[] {
  const out: Seg[] = [];
  for (let k = 0; k + 1 < pts.length; k += 1) {
    const x1 = PAPER.x0 + pts[k][0];
    const y1 = PAPER.y0 + pts[k][1];
    const x2 = PAPER.x0 + pts[k + 1][0];
    const y2 = PAPER.y0 + pts[k + 1][1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    out.push({
      left: (x1 + x2) / 2 - len / 2 - 0.8, top: (y1 + y2) / 2 - 1.1, width: len + 1.6,
      rot: `${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI}deg`,
    });
  }
  return out;
}
const ICE_SEGS = segsOf(ICE_PTS);
const BURN_SEGS = segsOf(BURN_PTS);
function Chart({ S }: { S: SharedValue<any> }) {
  const iceDot = useAnimatedStyle(() => ({
    opacity: S.value.ice.o, transform: [{ translateX: S.value.ice.x - 3 }, { translateY: S.value.ice.y - 3 }],
  }));
  const burnDot = useAnimatedStyle(() => ({
    opacity: S.value.burn.o, transform: [{ translateX: S.value.burn.x - 3 }, { translateY: S.value.burn.y - 3 }],
  }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.axisY} />
      <View style={styles.axisX} />
      {ICE_SEGS.map((g, k) => (
        <View key={`i${k}`} style={[styles.line, styles.iceLine, { left: g.left, top: g.top, width: g.width, transform: [{ rotate: g.rot }] }]} />
      ))}
      {BURN_SEGS.map((g, k) => (
        <View key={`b${k}`} style={[styles.line, styles.burnLine, { left: g.left, top: g.top, width: g.width, transform: [{ rotate: g.rot }] }]} />
      ))}
      <View style={[styles.key, { top: PAPER.y0 + 2 }]}>
        <View style={[styles.swatch, styles.iceLine]} />
        <Text style={styles.keyText}>ICE CREAM</Text>
      </View>
      <View style={[styles.key, { top: PAPER.y0 + 11 }]}>
        <View style={[styles.swatch, styles.burnLine]} />
        <Text style={styles.keyText}>SUNBURN</Text>
      </View>
      <Animated.View style={[styles.dot, styles.iceDot, iceDot]} />
      <Animated.View style={[styles.dot, styles.burnDot, burnDot]} />
    </View>
  );
}

// ── the parasol: pole, furled canopy and open canopy, and its shade ─────────
function Parasol({ S, pk, rx }: { S: SharedValue<any>; pk: SharedValue<number>; rx: SharedValue<number> }) {
  const poleP = useDerivedValue<At>(() => S.value.umb);
  const furledP = useDerivedValue<At>(() => ({ ...S.value.umb, o: 1 - clamp01((S.value.open - 0.1) * 4) }));
  const canopyP = useDerivedValue<At>(() => {
    const u = S.value.open;
    // tapped as the right answer, the canopy squashes down and springs back
    const pop = pk.value === 4 ? popOf(rx.value) : 0;
    return { x: PLANT.x, y: PLANT.y, o: clamp01(u * 5), sx: lerp(0.12, 1, u) * (1 + pop * 0.5), sy: lerp(0.65, 1, u) * (1 - pop) };
  });
  return (
    <>
      <Rider at={poleP} art={POLE_ART} />
      <Rider at={furledP} art={FURLED_ART} />
      <Rider at={canopyP} art={CANOPY_ART} />
    </>
  );
}
function Shade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.open, transform: [{ scaleX: lerp(0.2, 1, S.value.open) }] }));
  return <Animated.View style={[styles.shade, st]} pointerEvents="none" />;
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the sun, the kiosk and the chart, each drawn and named on the stage already. */
const CAUSE_Q = [
  { id: 'sun', left: SUN_AT.x - 24, top: SUN_AT.y - 24, w: 48, h: 48, r: 24, correct: true },
  { id: 'kiosk', left: KIOSK.x - KIOSK.w / 2 - 1, top: KIOSK_TOP - 2, w: KIOSK.w + 2, h: KIOSK.h + 2, r: 4, correct: false },
  { id: 'chart', left: FLIP.x - FLIP.w / 2 - 1, top: GROUND - FLIP.h - 2, w: FLIP.w + 2, h: FLIP.h + 2, r: 4, correct: false },
];
function CauseTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {CAUSE_Q.map((q) => (
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
 * Q2: three places he could eat his ice cream — the parasol's shade, the open sand and
 * the kiosk's queue — each named on a small plate at its foot, inside its target (AN1).
 * No two live targets touch (AN4).
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean };
const TRIAL_Q: Q[] = [
  { id: 'shade', label: 'SHADE', pw: 44, left: 186, top: 454, w: 70, h: 50, correct: true },
  { id: 'sand', label: 'SAND', pw: 37, left: 260, top: 462, w: 39, h: 42, correct: false },
  { id: 'queue', label: 'QUEUE', pw: 44, left: 302, top: 448, w: 46, h: 56, correct: false },
];
function TrialTargets({ picked, onPick, live, S, pk, rx }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; pk: SharedValue<number>; rx: SharedValue<number> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TRIAL_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <NamePlate q={q} pk={pk} rx={rx} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** A struck plate on a hard ledge: the right one hops, a wrong one shakes. */
function NamePlate({ q, pk, rx }: { q: Q; pk: SharedValue<number>; rx: SharedValue<number> }) {
  const me = PK[q.id];
  const st = useAnimatedStyle(() => {
    if (pk.value !== me) return { transform: [{ translateY: 0 }] };
    return q.correct
      ? { transform: [{ translateY: -Math.abs(Math.sin(rx.value * 9)) * (1 - rx.value) * 9 }] }
      : { transform: [{ translateX: shakeOf(rx.value) * 0.8 }] };
  });
  return (
    <Animated.View style={[styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw }, st]}>
      <Text style={styles.nameText}>{q.label}</Text>
    </Animated.View>
  );
}

const SIGN = {
  left: KIOSK.x - KIOSK.w / 2 + KIOSK_SIGN.x - KIOSK_SIGN.w / 2,
  top: KIOSK_TOP + KIOSK_SIGN.y - KIOSK_SIGN.h / 2,
};

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  sky: { position: 'absolute', left: 0, right: 0, top: 250, height: HORIZON - 250, backgroundColor: NATURAL.clearSky.base },
  sea: { position: 'absolute', left: 0, right: 0, top: HORIZON, height: SAND_TOP - HORIZON, backgroundColor: NATURAL.water.base },
  wave: { position: 'absolute', left: 0, width: 26, height: 1.6, borderRadius: 0.8, backgroundColor: NATURAL.clearSky.base },
  floor: floorStyle(TONE, GROUND),
  sand: {
    position: 'absolute', left: PROM_W, right: 0, top: SAND_TOP, height: GROUND - SAND_TOP, backgroundColor: NATURAL.sand.base,
  },
  paving: {
    position: 'absolute', left: 0, width: PROM_W, top: SAND_TOP, height: GROUND - SAND_TOP, backgroundColor: NATURAL.flagstone.base,
  },
  kerb: {
    position: 'absolute', left: PROM_W - 1.5, width: 3, top: SAND_TOP, height: GROUND - SAND_TOP, backgroundColor: NATURAL.flagstone.shade,
  },
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  shade: {
    position: 'absolute', left: PLANT.x - 36, width: 72, top: GROUND - 5, height: 10, borderRadius: 5,
    backgroundColor: NATURAL.sand.shade,
  },
  sign: {
    position: 'absolute', left: SIGN.left, top: SIGN.top, width: KIOSK_SIGN.w, height: KIOSK_SIGN.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.4, lineHeight: 11, letterSpacing: 1.2, color: NATURAL.stripeRed.base,
    includeFontPadding: false,
  },
  axisY: { position: 'absolute', left: PAPER.x0 + 3, top: PAPER.y0 + 21, width: 1.2, height: 26, backgroundColor: INK },
  axisX: { position: 'absolute', left: PAPER.x0 + 3, top: PAPER.y0 + 46.6, width: 64, height: 1.2, backgroundColor: INK },
  line: { position: 'absolute', height: 2.2, borderRadius: 1.1 },
  iceLine: { backgroundColor: NATURAL.scoopPink.shade },
  burnLine: { backgroundColor: NATURAL.stripeRed.base },
  key: { position: 'absolute', left: PAPER.x0 + 3, flexDirection: 'row', alignItems: 'center', height: 9 },
  swatch: { width: 7, height: 2.2, borderRadius: 1.1, marginRight: 2 },
  keyText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  dot: { position: 'absolute', left: 0, top: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: INK },
  iceDot: { backgroundColor: NATURAL.scoopPink.base },
  burnDot: { backgroundColor: NATURAL.stripeRed.base },
  clear: { flexGrow: 1 },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 1, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: PLATE_RADIUS / 2, borderWidth: 1,
    borderColor: INK, paddingHorizontal: 3, boxShadow: `0 2.5px 0 ${lipOf(TONE)}`,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
    alignSelf: 'stretch', textAlign: 'center',
  },
});

export function Sci3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci3Scene} band={[306, 514]} camera={CAM} />;
}
