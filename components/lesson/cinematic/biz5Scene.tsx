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
import { BEATS } from './biz5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf, pillStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, coin, b4Note, b5Trolley, b5Tin,
  b5TinLid, b5Canopy, b5UmbShaft, b5Button, B5_AXLE, B5_GRIP, B5_UMB_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-5, "Profit Isn't Cash" — A BALLOON FIELD AT DAWN.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The owner of a balloon company (plain, vain)
// has twelve flights booked and an empty cash tin; the gas man (the cap, kind) wheels in
// the week's cylinders, cash on delivery; the accountant (the top hat) walks in under
// an umbrella and explains why profit on paper does not pay a bill.
//
//   b0   the owner, his cash tin in his left hand, steps up to the booking board, takes
//        the chalk off its tray, chalks a big tick beside the twelve bookings, puts it
//        back, steps away and throws a hand up at the sky. Behind him the balloon lies
//        half-filled on the field, billowing as it fills.
//   b1   the gas man wheels his sack truck in from the right, two red cylinders on its
//        nose, stands it upright by the basket and holds out his hand.
//   b2   the owner raises the tin, lifts its lid, takes out two notes and a button and
//        holds them up, looking down at them.
//   b3   the accountant walks in from the left under his open umbrella; the owner puts
//        the money back and shuts the tin; the accountant furls the umbrella, swings it
//        down and leans on it like a cane, then raises it and taps PAY AFTER YOUR FLIGHT
//        with its tip, twice.
//   b4   Q1 FOLLOW THE MONEY: the booking board, the balloon and the gas cylinders.
//   b5   the gas man lifts the two cylinders off the truck by their collars, one at a
//        time, stands them on the grass by the basket and pats one.
//   b6   the gas man goes back round behind his truck; the accountant taps the board
//        again with the umbrella's tip.
//   b7   the owner takes the chalk, steps up to the board, rubs the old terms out with
//        one stroke down across them, chalks PAY HALF / WHEN YOU BOOK row by row, puts
//        the chalk down on the tray and steps back.
//   b8   the owner steps over and holds the tin out, its lid up; the accountant takes a
//        coin from his waistcoat, steps over and drops it in; both step back.
//   b9   Q2 PICK THE BOOKING: three booking cards clipped upright to the basket's rim.
//   b10  the owner walks to the basket and climbs over the rim, pulls the burner's lever;
//        the burner roars, the balloon swings up and fills, the basket lifts off the
//        grass; the gas man throws a hand up at "Mostly".
//   b11  the balloon rises into the sky, drifting, the owner waving down; b12 summary.
//
// COMPOSITION, in stage units. A dawn sky 222–432 (lilac high, peach, a glow at the
// horizon), the sun rising behind the far hills at x 58, two far balloons drifting. The
// field runs from the hills at 428 down to the ground line at 500; mist drifts over it.
// The booking board stands on its easel at 42–130 × 404–500, its slate 49–123 × 414–468
// at the owner's chest, its tray at 471 (the hip, AP10). The owner stands at 128, the
// accountant at 32. The basket is 176–326 × 468–500, its burner frame 392–468 over it;
// the balloon lies on the field behind the board and the owner from 54 to 192 (364–424),
// its mouth on cables to the frame, billowing; standing, it is 141 × 126 over the basket,
// its crown at the band's top, 222. The basket carries its own two steel cylinders in its corners. The
// gas man's truck parks at 324–350 with its cylinders on its nose, the gas man at 366,
// and on b5 the cylinders go down on the grass at 303–328. Band [222, 514]. Lifted off
// on the last beats, the balloon's crown rises out of the top of the band on purpose: a
// balloon in the sky.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners nod along with their hands still (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 292-unit band: 27%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, business-foundations-5). 0 for a beat with no voice.
 */
const LINES = [5.57, 4.24, 3.32, 7.12, 0, 4.12, 6.8, 3.32, 3.67, 0, 3.86, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOARD = is('board');
const A_DELIVER = is('deliver');
const A_TIN = is('tin');
const A_EXPLAIN = is('explain');
const A_TRUST = is('trust');
const A_DEPOSIT = is('deposit');
const A_REWRITE = is('rewrite');
const A_CUSHION = is('cushion');
const A_LIFTOFF = is('liftoff');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.money ? 1 : 0));
const Q2 = BEATS.map((b) => (b.booking ? 1 : 0));
const TERMS = BEATS.map((b) => b.terms ?? 0);
const DELIVER_N = A_DELIVER.indexOf(1);
const EXPLAIN_N = A_EXPLAIN.indexOf(1);
const TRUST_N = A_TRUST.indexOf(1);
const CUSHION_N = A_CUSHION.indexOf(1);
const REWRITE_N = A_REWRITE.indexOf(1);
const LIFT_N = A_LIFTOFF.indexOf(1);
const REST_N = A_REST.indexOf(1);

// ── where each of them stands, and which way each faces, beat by beat ────────
// A leg is [fraction of the line it starts at, x]; a turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const HOME = 128;
/** Beside the basket, where he climbs in from on b10, and inside it. */
const BY_BASKET = 166;
const IN_BASKET = 226;
const PL_LEGS: Track[] = BEATS.map((_, n) => {
  if (A_BOARD[n]) return [[0, HOME], [0.03, 116], [0.52, HOME]];
  if (A_REWRITE[n]) return [[0, HOME], [0.1, 90], [0.88, HOME]];
  if (A_CUSHION[n]) return [[0, HOME], [0.04, 100], [0.8, HOME]];
  if (A_LIFTOFF[n]) return [[0, HOME], [0.02, BY_BASKET]];
  if (n > LIFT_N) return [[0, IN_BASKET]];
  return [[0, HOME]];
});
const PL_TURN: Track[] = BEATS.map((_, n) => {
  if (A_BOARD[n]) return [[0, -1], [0.49, 1]];
  if (A_DELIVER[n] || A_TIN[n] || A_TRUST[n]) return [[0, 1]];
  if (A_EXPLAIN[n]) return [[0, 1], [0.05, -1]];
  if (A_REWRITE[n]) return [[0, -1], [0.85, 1]];
  if (A_CUSHION[n]) return [[0, -1], [0.77, 1]];
  if (Q2[n]) return [[0, 1]];
  if (A_LIFTOFF[n]) return [[0, 1], [0.95, -1]];
  return [[0, -1]];
});
/** The gas man is off the stage, right, until he wheels in on b1; b5 he unloads. */
const CP_LEGS: Track[] = BEATS.map((_, n) => {
  if (n < DELIVER_N) return [[0, 446]];
  if (A_TRUST[n]) return [[0, 366], [0.02, 344], [0.31, 334]];
  // b6: having stood his cylinders down, he goes back round behind his truck
  if (A_DEPOSIT[n]) return [[0, 334], [0.1, 364]];
  return [[0, n > TRUST_N ? 364 : 366]];
});
const CP_TURN: Track[] = BEATS.map((_, n) => (A_DEPOSIT[n] ? [[0, -1], [0.04, 1], [0.22, -1]] : [[0, -1]]));
/** The accountant is off the stage, left, until he walks in on b3. */
const TH_LEGS: Track[] = BEATS.map((_, n) => {
  if (n < EXPLAIN_N) return [[0, -34]];
  if (A_CUSHION[n]) return [[0, 32], [0.03, 62], [0.8, 32]];
  return [[0, 32]];
});
const TH_TURN: Track[] = BEATS.map((_, n) => (A_CUSHION[n] ? [[0, 1], [0.76, -1], [0.97, 1]] : [[0, 1]]));
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const PL_P = [TALK, NOD, TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, TALK, NOD, LISTEN];
const CP_P = [LISTEN, TALK, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, NOD, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, LISTEN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the board on its easel ──────────────────────────────────────────────────
const SLATE = { left: 49, top: 414, w: 74, h: 54 };
/** The chalk lies on the tray at the board's right-hand end. */
const CHALK_AT = { x: 118, y: 470 };
/** Where b7 puts it down, in front of him at the board, before he turns away. */
const CHALK_LEFT = { x: 95, y: 470 };
/** The tally of twelve bookings: two five-bar gates and two more. */
const TALLY_Y = 425;
const TALLY_H = 9;
const TALLY_X = [56, 59, 62, 65, 72, 75, 78, 81, 87, 90, 93, 96];
const GATES = [{ x0: 54.5, x1: 66.5 }, { x0: 70.5, x1: 82.5 }];
/** The big tick, chalked on b0 beside the tally: down to its foot, then up. */
const TICK = [{ x: 104, y: 434 }, { x: 108, y: 441 }, { x: 115, y: 429 }];
const TICK1 = { len: Math.hypot(4, 7), deg: (Math.atan2(7, 4) * 180) / Math.PI };
const TICK2 = { len: Math.hypot(7, 12), deg: (Math.atan2(-12, 7) * 180) / Math.PI };
/** The terms, in two chalked rows under the tally, left of the tick. */
const ROWS = { left: 50, w: 56, h: 11, tops: [444, 456] };
const OLD = ['pay after', 'your flight'];
const NEW = ['pay half', 'when you book'];
/**
 * Where the chalk travels: ONE stroke down across the old terms to rub them out, then
 * each new row left to right — three turns of the hand in all (AR5).
 */
const WIPE = [{ x: 94, y: 448 }, { x: 60, y: 463 }];
const WRITE = [
  [{ x: 60, y: 452 }, { x: 94, y: 452 }],
  [{ x: 64, y: 463 }, { x: 94, y: 463 }],
];
const MASK_PAD = 3;

// ── the balloon ─────────────────────────────────────────────────────────────
/** Lying (half-filled, on the field behind the owner) and standing over the basket. */
const LIE = { x: 192, y: 394, rot: -90, s: 0.42 };
const STAND = { x: 251, y: 360 };

// ── the basket and its burner, drawn from the middle of the basket's foot ───
const BASKET_X = 251;
/** The burner's drum top (the flame's foot) and the lever's grip. */
const FLAME_FOOT = { x: 0, y: -107 };
const LEVER = { x: -12, y: -68 };
const RIM_Y = 468;

// ── the gas man's truck and the cylinders ───────────────────────────────────
/** The truck drawn about its axle. */
const TRUCK_ART = b5Trolley(13 - B5_AXLE.x, 26 - B5_AXLE.y, 26, 52);
const PARK_AXLE = 344;
const AXLE_Y = GROUND - (52 - B5_AXLE.y);
const GRIP_REL = { x: B5_GRIP.x - B5_AXLE.x, y: B5_GRIP.y - B5_AXLE.y };
/** On the truck's nose, relative to the axle (B a little behind A), and stood on the grass. */
const ON_TRUCK = [{ x: -12, y: -32.2 }, { x: -16, y: -33.2 }];
const ON_GRASS = [{ x: 322, y: GROUND - 37 }, { x: 309, y: GROUND - 37 }];

// ── the things in the hands ─────────────────────────────────────────────────
/** The tin, cradled on the owner's left hand: drawn about the middle of its foot. */
const TIN_ART = b5Tin(0, -7, 24, 14);
const LID_ART = b5TinLid(0, -6, 24, 12);
const NOTE_ART = b4Note(0, -9, 10, 18, 'note20');
const BUTTON_ART = b5Button(0, 0, 6, 6);
const COIN_ART = tint(coin(0, 0, 6, 6), 'brass');
/** The umbrella, drawn about where the hand holds it: shaft and crook, and the canopy. */
const SHAFT_ART = b5UmbShaft(0, 25 - B5_UMB_GRIP.y, 50, 50);
const CANOPY_ART = b5Canopy(0, 9, 46, 18);
const UMB_APEX = -B5_UMB_GRIP.y;

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
/** A point moved along a chain of stops by the stage values that carry it between them. */
function via(pts: readonly { x: number; y: number }[], us: readonly number[]) {
  'worklet';
  let x = pts[0].x;
  let y = pts[0].y;
  for (let k = 0; k < us.length; k++) {
    x = lerp(x, pts[k + 1].x, us[k]);
    y = lerp(y, pts[k + 1].y, us[k]);
  }
  return { x, y };
}
/** Looking up: the head lifted on the neck, the chest a touch back. */
function lookUp(s: Stance, u: number): Stance {
  'worklet';
  return { ...s, neck: s.neck + 0.34 * u, tilt: s.tilt + 0.05 * u };
}
/** Looking down at what is in his hands. */
function lookDown(s: Stance, u: number): Stance {
  'worklet';
  return { ...s, neck: s.neck - 0.18 * u };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk cannot put him anywhere in one frame (group L).
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
  return { x, x0, x1, u: ease01(u), walking, end: free };
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
function bodyOf(w: { walking: boolean; x0: number; x1: number; u: number }, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
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

/** A point turned about the origin, clockwise on screen by `deg`. */
function turnAbout(px: number, py: number, deg: number) {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: px * c - py * s, y: px * s + py * c };
}

const CAM = followMoves(PL_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('business'));

/** Q1 FOLLOW THE MONEY — the board is right: the twelve customers owe him. */
const MONEY_Q = [
  { id: 'booking-board', correct: true },
  { id: 'the-balloon', correct: false },
  { id: 'gas-cylinders', correct: false },
];
/** Q2 PICK THE BOOKING — £200 today is right: the only one that pays before Friday. */
const BOOK_Q = [
  { id: 'six-hundred-in-two-months', amount: '£600', when: ['in 2', 'months'], x: 195, correct: false },
  { id: 'nine-hundred-next-year', amount: '£900', when: ['next', 'year'], x: 251, correct: false },
  { id: 'two-hundred-today', amount: '£200', when: ['today'], x: 307, correct: true },
];

export default function Biz5Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(29);
  const on = useLinger(i);
  // Which thing was tapped on Q1, and how far its reaction has run: the scene answers
  // in the game's own way (a wrong balloon sags, wrong cylinders rattle).
  const pk = useSharedValue(-1);
  const pu = useSharedValue(0);
  useEffect(() => {
    if (!Q1[i] || picked === null) return;
    pk.value = MONEY_Q.findIndex((q) => q.id === picked);
    pu.value = 0;
    pu.value = withTiming(1, { duration: 1100, easing: Easing.linear });
  }, [picked, i, pk, pu]);

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

    // ── the balloon: lying half-filled, then standing, then lifting ─────────
    const standNow = A_LIFTOFF[n] ? st(0.5, 0.85) : n > LIFT_N ? 1 : 0;
    const stand = carry(cv, 0, n, standNow, standNow, tr);
    const liftNow = A_LIFTOFF[n] ? 26 * st(0.8, 1.35) : A_REST[n] ? lerp(26, 78, st(0.02, 0.85)) : n > REST_N ? 78 : 0;
    const lift = carry(cv, 1, n, liftNow, liftNow, tr);
    const driftNow = A_REST[n] ? 14 * st(0.1, 0.9) : n > REST_N ? 14 : 0;
    const drift = carry(cv, 2, n, driftNow, driftNow, tr);
    // Q1, the balloon tapped (a wrong answer): it sighs and sags flatter on the grass
    const sagNow = Q1[n] && pk.value === 1 ? clamp01(pu.value * 2.2) : 0;
    const sag = carry(cv, 3, n, sagNow, sagNow, tr);
    // Q1, the cylinders tapped (a wrong answer): they rattle, twice, and settle
    const rattleNow = Q1[n] && pk.value === 2 ? Math.sin(pu.value * Math.PI * 4) * (1 - pu.value) : 0;
    const rattle = carry(cv, 4, n, rattleNow, rattleNow, tr);
    // a cold-inflating envelope billows as the fan blows into it (on the clock, L1)
    const billow = (1 - stand) * 0.035 * Math.sin(t * 1.9);
    const env = {
      x: lerp(LIE.x, STAND.x, stand) + drift,
      y: lerp(LIE.y, STAND.y, stand) - lift,
      rot: LIE.rot * (1 - stand),
      s: lerp(LIE.s, 1, stand) * (1 - 0.32 * sag) + billow,
    };
    // the burner: a pilot light always, a roar on lift-off
    const roarNow = A_LIFTOFF[n] ? st(0.48, 0.54) * (1 - st(1.05, 1.3)) : 0;
    const roar = carry(cv, 5, n, roarNow, roarNow, tr);
    const flick = 1 + 0.16 * Math.sin(t * 13.1) + 0.1 * Math.sin(t * 7.3 + 1.1);
    const flameH = lerp(6, 34, roar) * flick;
    const flameW = lerp(4.5, 13, roar) * (1 + 0.06 * Math.sin(t * 9.7));

    // ── the owner ───────────────────────────────────────────────────────────
    // b10: after his walk to the basket's side he climbs over the rim and in; from then
    // on he is in the basket and goes where it goes
    const hopU = A_LIFTOFF[n] ? st(0.25, 0.45) : 0;
    const srcP = carrySource(cv, 6, n, PL_LEGS[0][0][1]);
    const wp = n > LIFT_N
      ? { x: IN_BASKET + drift, x0: IN_BASKET, x1: IN_BASKET, u: 1, walking: false, end: 0 }
      : legsOf(srcP, PL_LEGS[n], b, L);
    const xNow = A_LIFTOFF[n] && hopU > 0 ? lerp(BY_BASKET, IN_BASKET, hopU) : wp.x;
    const xP = carry(cv, 6, n, xNow, xNow, 1);
    const hop = A_LIFTOFF[n] ? 40 * Math.sin(Math.PI * hopU) : 0;
    const inBasket = n > LIFT_N || (A_LIFTOFF[n] && hopU > 0.5) ? 1 : 0;
    const gP = GROUND - hop - lift * inBasket;
    const dP = carry(cv, 7, n, 0, faceOf(carrySource(cv, 7, n, -1), PL_TURN[n], b, L), 1);
    const hopping = hopU > 0 && hopU < 1;
    const pWalk = hopping
      ? { walking: true, x0: BY_BASKET, x1: IN_BASKET, u: hopU }
      : wp;
    let sp = bodyOf(pWalk, PL_P, n, t, b, 0);
    // the tin rides his LEFT hand all lesson, cradled in front of him at the waist —
    // raised to his chest to be opened on b2, held out to the accountant on b8
    const tinUp = A_TIN[n] ? st(0.02, 0.12) : A_EXPLAIN[n] ? 1 - st(0.2, 0.3) : 0;
    const tinOut = A_CUSHION[n] ? st(0.12, 0.2) * (1 - st(0.66, 0.78)) : 0;
    const tinTy = lerp(lerp(466, 458, tinUp), 456, tinOut);
    const tinTx = xP + dP * lerp(lerp(9, 11, tinUp), 17, tinOut);
    sp = hand(sp, xP, gP, dP, -1, tinTx, tinTy, 1);
    // b0: the chalk off the tray, the tick — down, then up — and the chalk put back;
    // then, turned to the reader, a hand thrown up at the sky on "genius of the skies"
    if (A_BOARD[n]) {
      const k = via([CHALK_AT, TICK[0], TICK[1], TICK[2], CHALK_AT],
        [st(0.11, 0.17), st(0.18, 0.24), st(0.25, 0.34), st(0.38, 0.46)]);
      sp = hand(sp, xP, gP, dP, 1, k.x, k.y, st(0.06, 0.11) * (1 - st(0.46, 0.5)));
      sp = hand(sp, xP, gP, dP, 1, xP + dP * 13, 433, bp(0.76, 0.84, 0.98));
    }
    // b2: the lid lifted by its edge, a hand into the tin, the notes and the button
    // brought up in front of him; he looks down at them
    if (A_TIN[n]) {
      const k = via([
        { x: tinTx, y: tinTy - 15 }, { x: tinTx, y: tinTy - 10 }, { x: xP + dP * 15, y: 436 },
      ], [st(0.24, 0.32), st(0.38, 0.5)]);
      sp = hand(sp, xP, gP, dP, 1, k.x, k.y, st(0.1, 0.18));
      sp = lookDown(sp, st(0.48, 0.6));
    }
    // b3: the money put back, the lid shut, and the hand back to rest
    if (A_EXPLAIN[n]) {
      const k = via([{ x: xP + dP * 15, y: 436 }, { x: tinTx, y: tinTy - 10 }, { x: tinTx, y: tinTy - 16 }],
        [st(0.0, 0.08), st(0.1, 0.16)]);
      sp = hand(sp, xP, gP, dP, 1, k.x, k.y, 1 - st(0.17, 0.24));
      sp = lookDown(sp, 1 - st(0.04, 0.14));
    }
    // b7: the chalk off the tray; at the board, the old terms rubbed out with one stroke
    // down across them (AR5), the new ones chalked row by row (a path, AR7.5); the chalk back
    if (A_REWRITE[n]) {
      const k = via([
        CHALK_AT, WIPE[0], WIPE[1], WRITE[0][0], WRITE[0][1], WRITE[1][0], WRITE[1][1], CHALK_LEFT,
      ], [st(0.25, 0.28), st(0.28, 0.36), st(0.36, 0.4), st(0.46, 0.56), st(0.56, 0.6), st(0.6, 0.76),
        st(0.77, 0.8)]);
      sp = hand(sp, xP, gP, dP, 1, k.x, k.y, st(0.02, 0.06) * (1 - st(0.9, 0.97)));
    }
    // b8: the lid lifted for the coin, and shut again
    if (A_CUSHION[n]) {
      sp = hand(sp, xP, gP, dP, 1, tinTx, tinTy - 15, bp(0.12, 0.2, 0.74));
    }
    // b10: the burner's lever, pulled — the roar — and let go; then turned to the others
    if (A_LIFTOFF[n]) {
      sp = hand(sp, xP, gP, dP, 1, BASKET_X + drift + LEVER.x, GROUND - lift + LEVER.y + 4 * st(0.52, 0.56),
        st(0.46, 0.52) * (1 - st(0.92, 1)));
    }
    // b11: he waves down to them, twice (AR5), and rests
    if (A_REST[n]) {
      const wv = bp(0.2, 0.3, 0.7);
      sp = hand(sp, xP, gP, dP, 1, xP + dP * (12 + 4 * Math.sin(st(0.3, 0.6) * Math.PI * 4)), 431 - lift, wv);
    }
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t, 0));
    const figP = keepHeld(heldP, pWalk.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the gas man ─────────────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 8, n, CP_LEGS[0][0][1]), CP_LEGS[n], b, L);
    const xC = carry(cv, 8, n, wc.x, wc.x, 1);
    const dC = carry(cv, 9, n, 0, faceOf(carrySource(cv, 9, n, -1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b, 1);
    // the truck: wheeled in tilted back on its wheels, then stood upright
    const axleX = Math.max(PARK_AXLE, xC - 22);
    const arrived = A_DELIVER[n] ? wc.end / L : 0;
    const tiltNow = n < DELIVER_N ? 22 : A_DELIVER[n] ? 22 * (1 - st(arrived + 0.01, arrived + 0.09)) : 0;
    const tilt = carry(cv, 10, n, tiltNow, tiltNow, tr);
    const grip = turnAbout(GRIP_REL.x, GRIP_REL.y, tilt);
    const gripX = axleX + grip.x;
    const gripY = AXLE_Y + grip.y;
    // b1: both hands on the grip while he wheels it, then his hand held out for the cash
    if (n < DELIVER_N || A_DELIVER[n]) {
      const off = A_DELIVER[n] ? st(arrived + 0.1, arrived + 0.16) : 0;
      sc = hand(sc, xC, GROUND, dC, 1, gripX, gripY, 1 - off);
      sc = hand(sc, xC, GROUND, dC, -1, gripX + 1, gripY + 1, 1 - off);
      sc = hand(sc, xC, GROUND, dC, 1, xC + dC * 19, 452, st(0.66, 0.74));
    }
    // b2: the hand still out, then lowered
    if (A_TIN[n]) sc = hand(sc, xC, GROUND, dC, 1, xC + dC * 19, 452, 1 - st(0.3, 0.42));
    // b5: each cylinder lifted by its collar off the truck's nose and stood on the grass,
    // one after the other (a path the hand travels once each), then a pat, twice
    const cylAt = (k: number, tl: number) => {
      'worklet';
      const r = turnAbout(ON_TRUCK[k].x, ON_TRUCK[k].y, tl);
      return { x: axleX + r.x, y: AXLE_Y + r.y };
    };
    if (A_TRUST[n]) {
      const a0 = cylAt(0, 0);
      const b0 = cylAt(1, 0);
      const k = via([
        a0, { x: a0.x, y: a0.y - 7 }, { x: ON_GRASS[0].x, y: ON_GRASS[0].y - 7 }, ON_GRASS[0],
        b0, { x: b0.x, y: b0.y - 7 }, { x: ON_GRASS[1].x, y: ON_GRASS[1].y - 7 }, ON_GRASS[1],
        { x: ON_GRASS[0].x, y: ON_GRASS[0].y - 1 },
      ], [st(0.1, 0.14), st(0.14, 0.22), st(0.22, 0.26), st(0.3, 0.34), st(0.37, 0.41), st(0.41, 0.5),
        st(0.5, 0.54), st(0.62, 0.68)]);
      const pat = 2.5 * Math.abs(Math.sin(st(0.7, 0.86) * Math.PI * 2));
      sc = hand(sc, xC, GROUND, dC, 1, k.x, k.y - pat, st(0.04, 0.1) * (1 - st(0.88, 0.96)));
    }
    // b10: a hand up as his unpaid gas flies away — "Mostly."
    if (A_LIFTOFF[n]) sc = hand(sc, xC, GROUND, dC, 1, xC + dC * 11, 433, bp(0.74, 0.84, 1.1));
    if (A_LIFTOFF[n] || A_REST[n]) sc = lookUp(sc, A_LIFTOFF[n] ? st(0.6, 0.9) : 1);
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t, 1));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the accountant ──────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 11, n, -34), TH_LEGS[n], b, L);
    const xT = carry(cv, 11, n, wt.x, wt.x, 1);
    const dT = carry(cv, 12, n, 0, faceOf(carrySource(cv, 12, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b, 2);
    // the umbrella, in his RIGHT hand: open overhead as he comes in on b3; then furled,
    // swung down and leant on like a cane; raised to point its tip at the board
    const furlNow = n < EXPLAIN_N ? 0 : A_EXPLAIN[n] ? st(0.2, 0.3) : 1;
    const furl = carry(cv, 13, n, furlNow, furlNow, tr);
    const swingNow = n < EXPLAIN_N ? 0 : A_EXPLAIN[n] ? st(0.3, 0.42) : 1;
    const swing = carry(cv, 14, n, swingNow, swingNow, tr);
    const pointNow = A_EXPLAIN[n] ? st(0.7, 0.77) * (1 - st(0.93, 0.98))
      : A_DEPOSIT[n] ? st(0.36, 0.42) * (1 - st(0.66, 0.72)) : 0;
    const point = carry(cv, 15, n, pointNow, pointNow, tr);
    // two small jabs of the tip at the line he means (AR5: twice, then still)
    const jab = A_EXPLAIN[n] ? Math.sin(st(0.78, 0.9) * Math.PI * 2) : A_DEPOSIT[n] ? Math.sin(st(0.44, 0.58) * Math.PI * 2) : 0;
    const uHx = lerp(lerp(5, 8, swing), 10 + 2.2 * Math.abs(jab), point);
    const uHy = lerp(lerp(432, 467, swing), 450, point);
    stt = hand(stt, xT, GROUND, dT, 1, xT + dT * uHx, uHy, 1);
    // b8: a coin from his waistcoat pocket, held over the tin and dropped in
    if (A_CUSHION[n]) {
      const k = via([{ x: xT + dT * 4, y: 446 }, { x: tinTx, y: tinTy - 20 }], [st(0.26, 0.38)]);
      stt = hand(stt, xT, GROUND, dT, -1, k.x, k.y, st(0.12, 0.2) * (1 - st(0.5, 0.6)));
    }
    if (A_LIFTOFF[n] || A_REST[n]) stt = lookUp(stt, A_LIFTOFF[n] ? st(0.62, 0.92) : 1);
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 2));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── posed, and what rides the hands ────────────────────────────────────
    const pl = pose(figP, xP, gP, K, dP, 1);
    const cp = pose(figC, xC, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wPL = wristOf(pl, 'wrL');
    const wPR = wristOf(pl, 'wrR');
    const wTR = wristOf(th, 'wrR');
    const wTL = wristOf(th, 'wrL');

    // the tin's lid: shut · open on b2 and b8
    const lidNow = A_TIN[n] ? st(0.16, 0.24) : A_EXPLAIN[n] ? 1 - st(0.13, 0.2) : A_CUSHION[n] ? st(0.16, 0.24) * (1 - st(0.66, 0.74)) : 0;
    const lid = carry(cv, 16, n, lidNow, lidNow, tr);
    // the notes and the button: in the tin (hidden) · in his right hand
    const cashNow = A_TIN[n] ? st(0.33, 0.36) : A_EXPLAIN[n] ? 1 - st(0.07, 0.1) : 0;
    const cash = carry(cv, 17, n, cashNow, cashNow, tr);
    // the chalk: 0 on the tray · 1 in his hand
    const chalkNow = A_BOARD[n] ? st(0.1, 0.11) * (1 - st(0.46, 0.47))
      : A_REWRITE[n] ? st(0.05, 0.06) * (1 - st(0.8, 0.805)) : 0;
    // where it lies on the tray: the right-hand end, until b7 leaves it nearer the middle
    const restX = A_REWRITE[n] ? lerp(CHALK_AT.x, CHALK_LEFT.x, st(0.795, 0.805)) : n > REWRITE_N ? CHALK_LEFT.x : CHALK_AT.x;
    const chalk = carry(cv, 18, n, chalkNow, chalkNow, tr);
    // the tick, stroke by stroke
    const t1Now = A_BOARD[n] ? st(0.18, 0.24) : 1;
    const t2Now = A_BOARD[n] ? st(0.25, 0.34) : 1;
    // the terms: the old ones rubbed out, the new ones written in
    const oldNow = A_REWRITE[n] ? 1 - st(0.28, 0.36) : TERMS[n] ? 0 : 1;
    const rowNow = (a: number, z: number) => {
      'worklet';
      return A_REWRITE[n] ? st(a, z) : TERMS[n] ? 1 : 0;
    };
    // the cylinders: 0 on the truck · 1 stood on the grass
    const c0Now = A_TRUST[n] ? st(0.13, 0.27) : n > TRUST_N ? 1 : 0;
    const c1Now = A_TRUST[n] ? st(0.4, 0.55) : n > TRUST_N ? 1 : 0;
    const c0 = carry(cv, 19, n, c0Now, c0Now, tr);
    const c1 = carry(cv, 20, n, c1Now, c1Now, tr);
    const cylPos = (k: number, u: number) => {
      'worklet';
      const a = cylAt(k, tilt);
      const g = ON_GRASS[k];
      // lifted clear of the nose on the way, set down on the grass
      const up = 7 * Math.sin(Math.PI * clamp01(u));
      return { x: lerp(a.x, g.x, u) + 3 * rattle, y: lerp(a.y, g.y, u) - up, r: tilt * (1 - u) + 6 * rattle };
    };
    // the coin: 0 in his pocket · 1 in his hand · 2 dropped into the tin
    const coinNow = A_CUSHION[n] ? st(0.2, 0.22) + st(0.42, 0.5) : n > CUSHION_N ? 2 : 0;
    const coinV = carry(cv, 21, n, coinNow, coinNow, tr);
    const tinX = wPL.x;
    const tinY = wPL.y + 1;

    return {
      pl, cp, th,
      env, flameH, flameW,
      basket: { x: BASKET_X + drift, y: GROUND - lift },
      shadow: 1 - clamp01(lift / 90),
      tin: { x: tinX, y: tinY },
      lid,
      cash: { x: wPR.x, y: wPR.y, o: clamp01(cash * 3 - 1.4) },
      chalk: { x: lerp(restX, wPR.x - dP * 2, chalk), y: lerp(CHALK_AT.y, wPR.y + 0.5, chalk), r: lerp(0, -dP * 24, chalk) },
      t1: carry(cv, 22, n, t1Now, t1Now, tr),
      t2: carry(cv, 23, n, t2Now, t2Now, tr),
      old: carry(cv, 24, n, oldNow, oldNow, tr),
      row0: carry(cv, 25, n, rowNow(0.46, 0.56), rowNow(0.46, 0.56), tr),
      row1: carry(cv, 26, n, rowNow(0.6, 0.76), rowNow(0.6, 0.76), tr),
      truck: { x: axleX, y: AXLE_Y, r: tilt },
      cyl0: cylPos(0, c0),
      cyl1: cylPos(1, c1),
      umb: { x: wTR.x, y: wTR.y, r: lerp(lerp(0, 128, swing), 96, point) * dT, furl },
      coinP: {
        x: coinV <= 1 ? lerp(xT + dT * 4, wTL.x, coinV) : lerp(wTL.x, tinX, coinV - 1),
        y: coinV <= 1 ? lerp(446, wTL.y - 2, coinV) : lerp(wTL.y - 2, tinY - 9, coinV - 1),
        o: coinV <= 0.02 || coinV >= 1.98 ? 0 : 1,
      },
      q1: carry(cv, 27, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 28, n, Q2[p], Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <Sky clock={clock} />
      <View style={styles.floor} pointerEvents="none" />
      <Flame S={SCENE} />
      <Envelope S={SCENE} />
      <BasketFrame S={SCENE} />
      <LessonPicture name="biz5-easel" />
      <Slate S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Basket S={SCENE} />
      <Truck S={SCENE} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="second" wear={BY_ID.stroller.pieces} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Hands S={SCENE} />
      {on(Q1) ? <MoneyTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <BookTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the sky, the far field, and what is alive in it ─────────────────────────

type Hue = 'b5Gold' | 'b5Blue' | 'b5Red';
/** A far balloon: a striped envelope and a basket, a few units tall, drifting. */
function FarBalloon({ clock, x, y, s, k1, k2, ph }: {
  clock: SharedValue<number>; x: number; y: number; s: number; k1: Hue; k2: Hue; ph: number;
}) {
  const st = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + 9 * Math.sin(clock.value * 0.045 + ph) },
      { translateY: y + 3 * Math.sin(clock.value * 0.11 + ph * 2) },
      { scale: s },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.farCone, { borderTopColor: NATURAL[k1].base }]} />
      <View style={[styles.farEnv, { backgroundColor: NATURAL[k1].base }]} />
      <View style={[styles.farStripe, { backgroundColor: NATURAL[k2].base }]} />
      <View style={styles.farLine} />
      <View style={[styles.farBasket, { backgroundColor: NATURAL.wicker.base }]} />
    </Animated.View>
  );
}

function Sky({ clock }: { clock: SharedValue<number> }) {
  // the sun climbs a few units over the lesson, and never comes back down (on the clock)
  const sun = useAnimatedStyle(() => ({ transform: [{ translateY: -Math.min(clock.value * 0.06, 9) }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.band, { top: 0, height: 286, backgroundColor: NATURAL.b5High.base }]} />
      <View style={[styles.band, { top: 286, height: 46, backgroundColor: NATURAL.b5Rose.base }]} />
      <View style={[styles.band, { top: 332, height: 44, backgroundColor: NATURAL.dawnSky.base }]} />
      <View style={[styles.band, { top: 376, height: 56, backgroundColor: NATURAL.dawnGlow.base }]} />
      <View style={[styles.cloud, { left: 196, top: 276, width: 128, backgroundColor: NATURAL.b5Rose.base }]} />
      <View style={[styles.cloud, { left: 236, top: 284, width: 70, backgroundColor: NATURAL.b5Rose.base }]} />
      <View style={[styles.cloud, { left: 26, top: 322, width: 96, backgroundColor: NATURAL.dawnSky.base }]} />
      <View style={[styles.cloud, { left: 290, top: 352, width: 84, backgroundColor: NATURAL.dawnGlow.base }]} />
      <Animated.View style={[styles.sunGlow, sun]} />
      <Animated.View style={[styles.sun, sun]} />
      <FarBalloon clock={clock} x={346} y={258} s={1.15} k1="b5Gold" k2="b5Blue" ph={0} />
      <FarBalloon clock={clock} x={300} y={316} s={0.7} k1="b5Red" k2="b5Gold" ph={1.2} />
      <FarBalloon clock={clock} x={128} y={290} s={0.62} k1="b5Blue" k2="b5Red" ph={2.3} />
      <FarBalloon clock={clock} x={210} y={248} s={0.48} k1="b5Gold" k2="b5Red" ph={4.1} />
      <View style={[styles.hill, { left: -60, top: 400, width: 280, height: 70, backgroundColor: NATURAL.b5Haze.base }]} />
      <View style={[styles.hill, { left: 170, top: 394, width: 300, height: 76, backgroundColor: NATURAL.b5Haze.shade }]} />
      <View style={[styles.hill, { left: -20, top: 416, width: 440, height: 60, backgroundColor: NATURAL.hedge.shade }]} />
      <View style={[styles.field, { backgroundColor: NATURAL.meadow.base }]} />
      <View style={[styles.mow, { top: 446 }]} />
      <View style={[styles.mow, { top: 470, height: 8 }]} />
      <View style={[pillStyle(3.4), { transform: [{ translateX: 146 }, { translateY: 438 }] }]} pointerEvents="none" />
    </View>
  );
}

// ── the balloon ─────────────────────────────────────────────────────────────

function Envelope({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [
      { translateX: S.value.env.x }, { translateY: S.value.env.y },
      { rotate: `${S.value.env.rot}deg` }, { scaleX: S.value.env.s },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="biz5-skirt" />
      <LessonPicture name="biz5-envelope" />
    </Animated.View>
  );
}

function Flame({ S }: { S: SharedValue<any> }) {
  const outer = useAnimatedStyle(() => ({
    left: S.value.basket.x + FLAME_FOOT.x - S.value.flameW / 2,
    top: S.value.basket.y + FLAME_FOOT.y - S.value.flameH,
    width: S.value.flameW,
    height: S.value.flameH,
  }));
  const core = useAnimatedStyle(() => ({
    left: S.value.basket.x + FLAME_FOOT.x - S.value.flameW * 0.27,
    top: S.value.basket.y + FLAME_FOOT.y - S.value.flameH * 0.62,
    width: S.value.flameW * 0.54,
    height: S.value.flameH * 0.62,
  }));
  return (
    <>
      <Animated.View style={[styles.flame, outer]} pointerEvents="none" />
      <Animated.View style={[styles.flameCore, core]} pointerEvents="none" />
    </>
  );
}

function BasketFrame({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.basket.x }, { translateY: S.value.basket.y }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="biz5-basket-back" />
      <LessonPicture name="biz5-frame" />
      <LessonPicture name="biz5-cyl-steel-l" />
      <LessonPicture name="biz5-cyl-steel-r" />
    </Animated.View>
  );
}

function Basket({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.basket.x }, { translateY: S.value.basket.y }] }));
  const sh = useAnimatedStyle(() => ({
    opacity: 0.28 * S.value.shadow,
    transform: [{ translateX: S.value.basket.x }, { scaleX: 0.55 + 0.45 * S.value.shadow }],
  }));
  return (
    <>
      <Animated.View style={[styles.basketShadow, sh]} pointerEvents="none" />
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <LessonPicture name="biz5-basket" />
      </Animated.View>
    </>
  );
}

// ── the gas man's truck and the cylinders ───────────────────────────────────

function Cyl({ at }: { at: { readonly value: { x: number; y: number; r: number } } }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="biz5-cyl-red" />
    </Animated.View>
  );
}

function Truck({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.truck.x }, { translateY: S.value.truck.y }, { rotate: `${S.value.truck.r}deg` }],
  }));
  const a = useDerivedValue(() => S.value.cyl0);
  const b = useDerivedValue(() => S.value.cyl1);
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <ObjectArt parts={TRUCK_ART} tone={TONE} />
      </Animated.View>
      <Cyl at={b} />
      <Cyl at={a} />
    </>
  );
}

// ── the board: the tally, the tick and the terms ────────────────────────────

function Slate({ S }: { S: SharedValue<any> }) {
  const s1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${TICK1.deg}deg` }, { scaleX: S.value.t1 }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ rotate: `${TICK2.deg}deg` }, { scaleX: S.value.t2 }] }));
  const old = useAnimatedStyle(() => ({ opacity: S.value.old }));
  const r0 = useAnimatedStyle(() => ({ width: ROWS.w * S.value.row0 }));
  const r1 = useAnimatedStyle(() => ({ width: ROWS.w * S.value.row1 }));
  const masks = [r0, r1];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.header}>
        <Text style={styles.headerText}>BOOKINGS</Text>
      </View>
      {TALLY_X.map((x) => <View key={x} style={[styles.tally, { left: x - 0.6 }]} />)}
      {GATES.map((g) => (
        <View key={g.x0} style={[styles.gate, { left: (g.x0 + g.x1) / 2 - 7.5, transform: [{ rotate: '-38deg' }] }]} />
      ))}
      <Animated.View style={[styles.tickBar, { left: TICK[0].x, top: TICK[0].y - 0.9, width: TICK1.len }, s1]} />
      <Animated.View style={[styles.tickBar, { left: TICK[1].x, top: TICK[1].y - 0.9, width: TICK2.len }, s2]} />
      <Animated.View style={[StyleSheet.absoluteFill, old]}>
        {OLD.map((w, k) => (
          <View key={w} style={[styles.row, { top: ROWS.tops[k] }]}><Text style={styles.chalkText}>{w}</Text></View>
        ))}
      </Animated.View>
      {NEW.map((w, k) => (
        <Animated.View key={w} style={[styles.rowMask, { top: ROWS.tops[k] - MASK_PAD, height: ROWS.h + 2 * MASK_PAD }, masks[k]]}>
          <View style={styles.rowIn}><Text style={styles.chalkText}>{w}</Text></View>
        </Animated.View>
      ))}
    </View>
  );
}

// ── what rides the hands ─────────────────────────────────────────────────────

function Hands({ S }: { S: SharedValue<any> }) {
  const tin = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.tin.x }, { translateY: S.value.tin.y }] }));
  const lid = useAnimatedStyle(() => ({ transform: [{ scaleY: lerp(0.24, 1, S.value.lid) }] }));
  const cash = useAnimatedStyle(() => ({
    opacity: S.value.cash.o,
    transform: [{ translateX: S.value.cash.x }, { translateY: S.value.cash.y + 1 }],
  }));
  const chalk = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.chalk.x }, { translateY: S.value.chalk.y }, { rotate: `${S.value.chalk.r}deg` }],
  }));
  const umb = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.umb.x }, { translateY: S.value.umb.y }, { rotate: `${S.value.umb.r}deg` }],
  }));
  const canopy = useAnimatedStyle(() => ({
    transform: [{ scaleX: lerp(1, 0.17, S.value.umb.furl) }, { scaleY: lerp(1, 1.75, S.value.umb.furl) }],
  }));
  const coinSt = useAnimatedStyle(() => ({
    opacity: S.value.coinP.o,
    transform: [{ translateX: S.value.coinP.x }, { translateY: S.value.coinP.y }],
  }));
  return (
    <>
      <Animated.View style={[styles.rider, umb]} pointerEvents="none">
        <ObjectArt parts={SHAFT_ART} tone={TONE} />
        <View style={[styles.rider, { top: UMB_APEX }]}>
          <Animated.View style={[styles.canopy, canopy]}>
            <ObjectArt parts={CANOPY_ART} tone={TONE} style={{ left: 23, top: 0 }} />
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.rider, tin]} pointerEvents="none">
        <Animated.View style={[styles.lid, lid]}>
          <ObjectArt parts={LID_ART} tone={TONE} style={{ left: 12, top: 12 }} />
        </Animated.View>
        <ObjectArt parts={TIN_ART} tone={TONE} />
      </Animated.View>
      <Animated.View style={[styles.rider, cash]} pointerEvents="none">
        <View style={[styles.rider, { transform: [{ rotate: '-14deg' }] }]}><ObjectArt parts={NOTE_ART} tone={TONE} /></View>
        <View style={[styles.rider, { transform: [{ rotate: '12deg' }] }]}><ObjectArt parts={NOTE_ART} tone={TONE} /></View>
        <View style={[styles.rider, { left: 8, top: -6 }]}><ObjectArt parts={BUTTON_ART} tone={TONE} /></View>
      </Animated.View>
      <Animated.View style={[styles.rider, coinSt]} pointerEvents="none">
        <ObjectArt parts={COIN_ART} tone={TONE} />
      </Animated.View>
      <Animated.View style={[styles.chalk, chalk]} pointerEvents="none" />
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

type Pick = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> };

/**
 * Q1 FOLLOW THE MONEY: the board (named by its own BOOKINGS), the balloon lying on the
 * field and the cylinders on the truck, each a real thing on the stage.
 */
const MONEY_BOX = [
  { left: 44, top: 408, w: 84, h: 66, name: '', pw: 0, radius: 4 },
  { left: 136, top: 366, w: 58, h: 54, name: 'BALLOON', pw: 54, radius: 10 },
  { left: 308, top: 450, w: 50, h: 50, name: 'GAS', pw: 32, radius: 4 },
];
function MoneyTargets({ picked, onPick, live, S }: Pick) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  // the right answer: a coin pops up on every one of the twelve bookings — the money
  // he is owed, sitting on the board and not in his tin
  const won = useSharedValue(0);
  useEffect(() => {
    if (picked === 'booking-board') won.value = withTiming(1, { duration: 1300, easing: Easing.linear });
  }, [picked, won]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TALLY_X.map((x, k) => <OwedCoin key={x} x={x} k={k} won={won} />)}
      {MONEY_Q.map((q, k) => {
        const bx = MONEY_BOX[k];
        return (
          <Target
            key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={bx.radius}
            disabled={answered} sealAt="tr"
            style={{ position: 'absolute', left: bx.left, top: bx.top, width: bx.w, height: bx.h }}
          >
            <View style={styles.place}>
              {bx.name ? (
                <View style={[styles.namePlate, { left: (bx.w - bx.pw) / 2, bottom: 2, width: bx.pw }]}>
                  <Text style={styles.nameText}>{bx.name}</Text>
                </View>
              ) : null}
            </View>
          </Target>
        );
      })}
    </Animated.View>
  );
}
function OwedCoin({ x, k, won }: { x: number; k: number; won: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01((won.value - k * 0.055) / 0.22);
    const pop = u < 0.7 ? (u / 0.7) * 1.3 : lerp(1.3, 1, (u - 0.7) / 0.3);
    return { opacity: u > 0 ? 1 : 0, transform: [{ translateX: x - 4 }, { translateY: TALLY_Y - 1 - 3 * u }, { scale: pop }] };
  });
  return <Animated.View style={[styles.owed, st]} pointerEvents="none" />;
}

/** Q2 PICK THE BOOKING: three booking cards clipped upright to the basket's rim. */
function BookTargets({ picked, onPick, live, S }: Pick) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {BOOK_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.x - 24, top: RIM_Y - 44, width: 48, height: 48 }}
        >
          <View style={styles.place}>
            <BookingCard q={q} mine={picked === q.id} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}
function BookingCard({ q, mine }: { q: typeof BOOK_Q[number]; mine: boolean }) {
  // the right card FLIPS over to show it is PAID; a wrong one droops on its clip
  const u = useSharedValue(0);
  useEffect(() => {
    if (mine) u.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
  }, [mine, u]);
  const ok = q.correct;
  const card = useAnimatedStyle(() => (ok
    ? { transform: [{ scaleX: Math.max(0.04, Math.abs(Math.cos(Math.PI * u.value))) }] }
    : { opacity: 1 - 0.25 * u.value, transform: [{ translateX: 3 * Math.sin(u.value * 22) * (1 - u.value) }, { translateY: 3 * u.value }, { rotate: `${-22 * u.value}deg` }] }));
  const front = useAnimatedStyle(() => ({ opacity: ok && u.value > 0.5 ? 0 : 1 }));
  const back = useAnimatedStyle(() => ({ opacity: ok && u.value > 0.5 ? 1 : 0 }));
  return (
    <>
      <Animated.View style={[styles.card, card]}>
        <Animated.View style={[styles.cardFace, front]}>
          <Text style={styles.cardAmount}>{q.amount}</Text>
          {q.when.map((w) => <Text key={w} style={styles.cardWhen}>{w}</Text>)}
        </Animated.View>
        <Animated.View style={[styles.cardFace, styles.cardBack, back]}>
          <View style={styles.stamp}><Text style={styles.stampText}>PAID</Text></View>
        </Animated.View>
      </Animated.View>
      <View style={styles.clip} />
    </>
  );
}

const CARD_W = 38;
const CARD_H = 40;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  band: { position: 'absolute', left: 0, width: STAGE_W },
  cloud: { position: 'absolute', height: 7, borderRadius: 3.5, opacity: 0.85 },
  sun: {
    position: 'absolute', left: 42, top: 394, width: 32, height: 32, borderRadius: 16,
    backgroundColor: NATURAL.b5Sun.base,
  },
  sunGlow: {
    position: 'absolute', left: 30, top: 382, width: 56, height: 56, borderRadius: 28,
    backgroundColor: NATURAL.b5Sun.base, opacity: 0.28,
  },
  mow: { position: 'absolute', left: 0, width: STAGE_W, height: 6, backgroundColor: NATURAL.meadow.shade, opacity: 0.45 },
  hill: { position: 'absolute', borderTopLeftRadius: 200, borderTopRightRadius: 200 },
  field: { position: 'absolute', left: 0, top: 430, width: STAGE_W, height: GROUND - 430 },
  mist: { position: 'absolute', height: 9, borderRadius: 4.5, backgroundColor: NATURAL.cloudWhite.base, opacity: 0.5 },
  farEnv: { position: 'absolute', left: -8, top: -21, width: 16, height: 15, borderRadius: 8 },
  farStripe: { position: 'absolute', left: -2.5, top: -21, width: 5, height: 15, borderRadius: 2.5 },
  farCone: {
    position: 'absolute', left: -6.6, top: -10, width: 0, height: 0,
    borderLeftWidth: 6.6, borderRightWidth: 6.6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  farLine: { position: 'absolute', left: -0.4, top: -2, width: 0.8, height: 3.5, backgroundColor: INK },
  farBasket: { position: 'absolute', left: -2, top: 1.5, width: 4, height: 3.2, borderRadius: 0.6 },
  flame: { position: 'absolute', borderRadius: 40, backgroundColor: NATURAL.b5Flame.base },
  flameCore: { position: 'absolute', borderRadius: 40, backgroundColor: NATURAL.b5FlameCore.base },
  basketShadow: {
    position: 'absolute', left: -78, top: GROUND - 3, width: 156, height: 6, borderRadius: 3,
    backgroundColor: INK,
  },
  header: {
    position: 'absolute', left: SLATE.left, top: 414, width: SLATE.w, height: 11, alignItems: 'center', justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.8, color: PAPER_LIT, includeFontPadding: false,
  },
  tally: { position: 'absolute', top: TALLY_Y, width: 1.2, height: TALLY_H, borderRadius: 0.6, backgroundColor: PAPER_LIT },
  gate: { position: 'absolute', top: TALLY_Y + TALLY_H / 2 - 0.6, width: 15, height: 1.2, borderRadius: 0.6, backgroundColor: PAPER_LIT },
  tickBar: { position: 'absolute', height: 1.8, borderRadius: 0.9, backgroundColor: PAPER_LIT, transformOrigin: '0% 50%' },
  row: { position: 'absolute', left: ROWS.left, width: ROWS.w, height: ROWS.h, alignItems: 'center', justifyContent: 'center' },
  rowMask: { position: 'absolute', left: ROWS.left, overflow: 'hidden' },
  rowIn: {
    position: 'absolute', left: 0, top: MASK_PAD, width: ROWS.w, height: ROWS.h, alignItems: 'center', justifyContent: 'center',
  },
  chalkText: { alignSelf: 'stretch', textAlign: 'center', fontFamily: 'Caveat_700Bold', fontSize: 10.5, lineHeight: 11, color: PAPER_LIT, includeFontPadding: false },
  chalk: {
    position: 'absolute', left: -2.6, top: -0.9, width: 5.2, height: 1.8, borderRadius: 0.6,
    backgroundColor: PAPER_LIT, borderWidth: 0.5, borderColor: INK,
  },
  canopy: { position: 'absolute', left: -23, top: 0, width: 46, height: 18, transformOrigin: '50% 0%' },
  lid: { position: 'absolute', left: -12, top: -24.6, width: 24, height: 12, transformOrigin: '50% 100%' },
  owed: {
    position: 'absolute', left: 0, top: 0, width: 8, height: 8, borderRadius: 4, borderWidth: 1,
    borderColor: NATURAL.brass.shade, backgroundColor: NATURAL.brass.base,
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: PLATE_RADIUS / 2, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 3, boxShadow: lipOf(TONE),
  },
  nameText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false },
  card: {
    position: 'absolute', left: (48 - CARD_W) / 2, top: 4, width: CARD_W, height: CARD_H, transformOrigin: '50% 100%',
  },
  cardFace: {
    position: 'absolute', left: 0, top: 0, width: CARD_W, height: CARD_H, borderRadius: 5, borderWidth: 1,
    borderColor: INK, backgroundColor: PLATE_FACE, alignItems: 'center', paddingTop: 3, boxShadow: lipOf(TONE),
  },
  cardBack: { justifyContent: 'center', paddingTop: 0 },
  cardAmount: { fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 12, color: INK, includeFontPadding: false },
  cardWhen: { alignSelf: 'stretch', textAlign: 'center', fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 11, color: INK, includeFontPadding: false },
  stamp: {
    width: 32, height: 18, borderRadius: 4, borderWidth: 1.6, borderColor: NATURAL.b5Red.base,
    alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }],
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 11, letterSpacing: 0.6, color: NATURAL.b5Red.base, includeFontPadding: false,
  },
  clip: {
    position: 'absolute', left: 18, top: 43, width: 12, height: 5, borderRadius: 1.2, borderWidth: 1,
    borderColor: INK, backgroundColor: NATURAL.silver.base,
  },
});

export function Biz5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz5Scene} band={[222, 514]} camera={CAM} />;
}
