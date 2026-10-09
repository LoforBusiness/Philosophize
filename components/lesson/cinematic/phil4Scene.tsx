import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './phil4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, tint, coin, departureScreen, railTicket,
  CLOCK_DIAL, DEP_SCREEN, PLATFORM_FACE, TUNNEL_MOUTH, TICKET_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-4, "How Do You Know?" — A RAILWAY PLATFORM.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// two people talk and nobody narrates (AP13). A traveller (the plain one, vain) reads
// the time off the station's pillar clock — which stopped at a quarter past nine last
// night — and is right by luck; the philosopher (the top hat), waiting by the bench for
// the same train, shows why being right is not the same as knowing.
//
//   b0   the traveller walks onto the platform from the right, his ticket in his
//        hand; he glances up at the clock as he says the time, stops, and taps the
//        ticket twice.
//   b1   the philosopher points up at the clock; on "its hands" the traveller looks
//        up at it again.
//   b2   the traveller spreads both hands toward the clock, chin up.
//   b3   the philosopher holds up a palm, then raises his left hand and counts on it
//        with his right: one on "your belief must be true", two on "a good reason".
//   b4   Q1: the stopped clock, the departure screen and the ticket — tap one.
//   b5   the philosopher takes a coin from his pocket, flips it and catches it, holds
//        it out, then opens his other hand to the clock with a nod, and pockets it.
//   b6   the traveller folds his arms, turns his back on him with his nose in the air,
//        and, his line said, turns round again to hear the answer.
//   b7   the philosopher points down the platform to the departure screen; the
//        traveller, arms still folded, sniffs at "while I'm still young".
//   b8   the traveller walks to the screen and reads it, holds his ticket up beside
//        it, lowers it and turns back to the philosopher.
//   b9   Q2: the departure screen, the stopped clock and the platform sign — tap one.
//   b10  at ease under the quotation, facing each other, as the train's lamp comes
//        into view in the tunnel's dark and grows.
//
// COMPOSITION, in stage units. At the LEFT, the end of the line: the TUNNEL portal,
// 0–64 × 428–500, its dark mouth 16–44 × 469–499, where the lamp lights at (30, 482).
// The PLATFORM SIGN, 61–137 × 396–500 (its blue board 61–137 × 396–419, face 65–133),
// and in front of its two posts (71, 127) the BENCH, 71–127 × 472–500. The PHILOSOPHER
// waits at 154, by the bench's end. The station's PILLAR CLOCK stands between the two
// of them, 180–220 × 350–500, its case centred at (200, 379), r 19 — above both their
// heads (422), so they look UP at it. The TRAVELLER stops at 262, then walks to 300.
// The DEPARTURE SCREEN stands at the right on its post, 314–398 × 376–500, its display
// 317–393 × 380–410; the traveller holds his ticket up toward its lower left corner
// (~320, 437), within the rig's safe reach (~23 units from the shoulder at K 0.76).
// The yellow safety line runs along the platform's edge at 503. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): never more than one figure moving his legs, both face each
// other while they talk, the listener nods along with still hands (AP18), and every
// hand that moves is holding, tapping, pointing, counting, flipping or showing.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, philosophy-foundations-4); 0 for a beat with no voice.
 */
const LINES = [4.26, 4.58, 2.83, 6.28, 0, 4.87, 3.69, 3.86, 5.36, 0, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// and, for the sulk, the arms of act 62 folded in front (FOLD_L, FOLD_R).
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
/**
 * Arms folded, in the figure's frame: rig's arms-crossed targets (moves.ts act 62) with
 * the hands swapped, so the ticket hand is the LOWER, nearer one, tucked under the other
 * arm. The other way round, the ticket rode out in front and he read as offering it.
 */
const FOLD_L = { x: 11, y: -17 };
const FOLD_R = { x: 18, y: -22 };

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_GLANCE = is('glance');
const A_STOPPED = is('stopped');
const A_RIGHT = is('right');
const A_REASON = is('reason');
const A_LUCK = is('luck');
const A_SULK = is('sulk');
const A_CHECK = is('check');
const A_BOARD = is('board');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.lucky ? 1 : 0));
const Q2 = BEATS.map((b) => (b.source ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing]; it
// eases through a profile over 0.36s (cinematicKit.facing), from the facing on screen.
type Track = readonly (readonly number[])[];
/** The traveller walks on from the right on b0, and down to the screen on b8. */
const TV_START = 422;
const TV_LEGS: Track[] = [
  [[0, 262]], [[0, 262]], [[0, 262]], [[0, 262]], [[0, 262]], [[0, 262]],
  [[0, 262]], [[0, 262]], [[0.06, 300]], [[0, 300]], [[0, 300]], [[0, 300]],
];
/**
 * He faces the philosopher; turns his back to sulk and, his line said, turns round again
 * (a listener faces whom he listens to, N21); faces the screen to read it, and turns back.
 */
const TV_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.5, 1], [0.9, -1]], [[0, -1]], [[0, 1], [0.8, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The philosopher waits by the bench, facing the traveller throughout. */
const PH_X = 154;
const PH_LEGS: Track[] = BEATS.map(() => [[0, PH_X]]);
const PH_TURN: Track[] = BEATS.map(() => [[0, 1]]);
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const TV_P = [TALK, NOD, TALK, NOD, NOD, NOD, TALK, NOD, TALK, NOD, NOD, NOD];
const PH_P = [LISTEN, EXPLAIN, NOD, EXPLAIN, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, NOD];

// ── the platform ────────────────────────────────────────────────────────────
const CLOCK = { x: 200, y: 425, w: 40, h: 150 };
const DIAL = { x: CLOCK.x + CLOCK_DIAL.x - CLOCK.w / 2, y: CLOCK.y - CLOCK.h / 2 + CLOCK_DIAL.y, r: CLOCK_DIAL.r };
const SCREEN = { x: 356, y: 438, w: 84, h: 124 };
const DISPLAY = {
  left: SCREEN.x - SCREEN.w / 2 + DEP_SCREEN.x - DEP_SCREEN.w / 2,
  top: SCREEN.y - SCREEN.h / 2 + DEP_SCREEN.y - DEP_SCREEN.h / 2,
  w: DEP_SCREEN.w,
  h: DEP_SCREEN.h,
};
const SIGN = { x: 99, y: 448, w: 76, h: 104 };
const FACE = {
  left: SIGN.x - SIGN.w / 2 + PLATFORM_FACE.x - PLATFORM_FACE.w / 2,
  top: SIGN.y - SIGN.h / 2 + PLATFORM_FACE.y - PLATFORM_FACE.h / 2,
  w: PLATFORM_FACE.w,
  h: PLATFORM_FACE.h,
};
const TUNNEL = { x: 32, y: 464, w: 64, h: 72 };
const MOUTH = { x: TUNNEL.x - TUNNEL.w / 2 + TUNNEL_MOUTH.x, y: TUNNEL.y - TUNNEL.h / 2 + TUNNEL_MOUTH.y - 2 };
/** Where he points to read the screen, and where he holds his ticket up beside it. */
const SCREEN_AT = { x: DISPLAY.left + DISPLAY.w / 2, y: DISPLAY.top + DISPLAY.h / 2 };
const TICKET_UP_Y = 437;
/** The ticket is drawn bigger than life so it reads at lesson size; held by its near end. */
const TK_W = 14;
const TK_H = 8.75;
const TK_DX = ((8 - TICKET_GRIP.x) * TK_W) / 16;                 // grip → the ticket's middle

// The clock, the platform sign, the bench, the tunnel and the station behind them are
// DRAWN (LESSON_RULES AM13; scripts/lib/lessonart/lessons/phil4.mjs, against Commons
// photographs of Keighley, Halifax and Kemble stations and brick tunnel portals) and
// baked, each at the box the shape-built object it replaced stood in. The departure
// screen is a steel box in a steel case, so it stays parts.
const SCREEN_ART = departureScreen(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
// The things that move are drawn about the point they are held by.
const TICKET_ART = railTicket(TK_DX, 0, TK_W, TK_H);
const COIN_ART = tint(coin(0, 0, 8, 8), 'brass');

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
/** The arms folded in front of the chest, by `w` (the ticket stays in the left hand). */
function fold(s: Stance, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return {
    ...s,
    fistL: { x: lerp(s.fistL.x, FOLD_L.x, w), y: lerp(s.fistL.y, FOLD_L.y, w) },
    fistR: { x: lerp(s.fistR.x, FOLD_R.x, w), y: lerp(s.fistR.y, FOLD_R.y, w) },
  };
}
/** A look: the head up (negative) or down (positive), for a reason on the stage. */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
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

const CAM = followMoves(TV_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('philosophy'));

/** The reader's pick, as a number the worklet can read (an id means its question's thing). */
const PICK: Record<string, number> = { clock: 1, board: 2, ticket: 3, sign: 4 };

/**
 * THE ANSWER, ON THE THING CHOSEN (the brief of 2026-10-05: right and wrong each get their
 * own physical answer). `r` is the answer's progress (0 to 1 over the reply), 0 everywhere
 * but the graded beat, so both start and end at rest and nothing has to be carried away.
 * Right: the thing pops up and settles with a small undershoot, as if struck. Wrong: it
 * gives a knock of a shake that dies away.
 */
function popOf(r: number): number {
  'worklet';
  if (r <= 0) return 1;
  return 1 + 0.075 * Math.sin(Math.PI * clamp01(r / 0.3)) - 0.024 * Math.sin(Math.PI * clamp01((r - 0.3) / 0.3));
}
function shakeOf(r: number): number {
  'worklet';
  return r <= 0 ? 0 : 3.2 * Math.sin(r * Math.PI * 9) * (1 - r);
}

export default function Phil4Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldV = useHeld();
  const heldP = useHeld();
  const cv = useCarry(8);
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
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };
    /** Up over [a, m], held, and back down over [z0, z1]. */
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };

    // ── the traveller ───────────────────────────────────────────────────────
    const wv = legsOf(carrySource(cv, 0, n, TV_START), TV_LEGS[n], b, L);
    const xV = carry(cv, 0, n, wv.x, wv.x, 1);
    const dV = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), TV_TURN[n], b, L), 1);
    let sv = bodyOf(wv, TV_P, n, t, b, 0);
    // his ticket, held by its end in his left hand, in front of him at the waist
    // (AR2, AR6) — through the walk too, so that arm does not swing (a full hand)
    let tkX = xV + 8 * dV;
    let tkY = 462;
    if (A_BOARD[n]) {
      // up beside the screen while he reads it, then down again as he turns back
      const up = st(0.42, 0.52) * (1 - st(0.7, 0.8));
      tkX = lerp(tkX, xV + 22 * dV, up);
      tkY = lerp(tkY, TICKET_UP_Y, up);
    }
    if (!A_CHECK[n]) sv = hand(sv, xV, dV, -1, tkX, tkY, 1);
    if (A_GLANCE[n]) {
      // a glance up at the clock as he says the time, then two taps on his ticket
      sv = look(sv, -0.3 * hd(0.02, 0.1, 0.24, 0.34));
      // the second tap does not come back up: the hand goes on down from it (AR5)
      const tap = bp(0.82, 0.85, 0.88) + st(0.9, 0.93);
      const go = st(0.78, 0.82) * (1 - st(0.93, 0.99));
      sv = hand(sv, xV, dV, 1, tkX + 2 * dV, tkY - 6 + 5 * tap, go);
    }
    if (A_STOPPED[n]) sv = look(sv, -0.32 * hd(0.6, 0.68, 0.88, 0.98));        // up at "its hands"
    if (A_RIGHT[n]) {
      // his free hand thrown open up toward the clock, ta-da, chin up: pleased with
      // himself; the ticket stays at his waist (AR6). On "Again." it lifts a touch more.
      const out = hd(0.04, 0.16, 0.84, 0.95);
      const again = bp(0.74, 0.8, 0.9);
      sv = hand(sv, xV, dV, 1, xV + 34 * dV, 432 - 6 * again, out);
      sv = look(sv, -0.16 * out);
    }
    // the sulk: arms folded, his back turned with his nose in the air, then round again
    if (A_SULK[n]) sv = look(fold(sv, st(0.02, 0.2)), -0.12 * st(0.55, 0.68));
    // still folded and haughty while he is told, and a sniff on "while I'm still young"
    if (A_CHECK[n]) sv = look(fold(sv, 1), -0.12 - 0.12 * hd(0.72, 0.78, 0.88, 0.97));
    if (A_BOARD[n]) sv = look(sv, -0.3 * st(0.08, 0.22) * (1 - st(0.6, 0.72)));  // reading it
    const prevV = carryFrom(heldV, n, hHold(TV_P[p], t, 0));
    const figV = keepHeld(heldV, wv.walking ? mixKeepLegs(prevV, sv, tr) : mixStance(prevV, sv, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 2, n, PH_X), PH_LEGS[n], b, L);
    const xP = carry(cv, 2, n, wp.x, wp.x, 1);
    const dP = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), PH_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PH_P, n, t, b, 1);
    // up at the clock: the arm raised forward at about thirty degrees, so the hand clears
    // his head (aimed straight at the dial, it would rise past his face to scratch it)
    if (A_STOPPED[n]) sp = hand(sp, xP, dP, 1, xP + 40 * dP, 428, hd(0.05, 0.16, 0.82, 0.94));
    if (A_REASON[n]) {
      // a palm up to stop him; then the left hand raised, and counted on: one, two
      sp = hand(sp, xP, dP, 1, xP + 19 * dP, 446, hd(0.03, 0.11, 0.24, 0.32));
      sp = hand(sp, xP, dP, -1, xP + 20 * dP, 445, st(0.34, 0.44));
      sp = hand(sp, xP, dP, 1, xP + 17 * dP, 440, hd(0.48, 0.54, 0.6, 0.66));
      sp = hand(sp, xP, dP, 1, xP + 17 * dP, 446, hd(0.74, 0.8, 0.88, 0.94));
    }
    // the coin: out of his pocket, flipped and caught, held out, pocketed again
    let flipY = 0;
    let spin = 1;
    if (A_LUCK[n]) {
      const pocket = { x: xP + 5 * dP, y: 474 };
      const chest = { x: xP + 12 * dP, y: 456 };
      const offer = { x: xP + 18 * dP, y: 451 };
      let hx = lerp(pocket.x, chest.x, st(0.08, 0.15));
      let hy = lerp(pocket.y, chest.y, st(0.08, 0.15));
      hx = lerp(hx, offer.x, st(0.36, 0.44));
      hy = lerp(hy, offer.y, st(0.36, 0.44));
      hx = lerp(hx, chest.x, st(0.52, 0.58));
      hy = lerp(hy, chest.y, st(0.52, 0.58));
      hx = lerp(hx, pocket.x, st(0.86, 0.93));
      hy = lerp(hy, pocket.y, st(0.86, 0.93));
      hy += -4 * bp(0.15, 0.18, 0.22) + 2 * bp(0.31, 0.34, 0.38);     // the flick, and the catch
      sp = hand(sp, xP, dP, 1, hx, hy, st(0, 0.07) * (1 - st(0.94, 1)));
      const f = stageLin(b, L, 0.18, 0.32);
      flipY = -4 * 30 * f * (1 - f);
      spin = Math.cos(f * Math.PI * 6);
      // his other hand opened to the clock, and a nod at it
      sp = hand(sp, xP, dP, -1, xP + 17 * dP, 441, hd(0.56, 0.64, 0.84, 0.92));
      sp = look(sp, 0.14 * bp(0.64, 0.7, 0.78));
    }
    if (A_CHECK[n]) sp = hand(sp, xP, dP, 1, SCREEN_AT.x, SCREEN_AT.y - 60, hd(0.32, 0.42, 0.84, 0.94)); // up the platform, over his head
    const prevP = carryFrom(heldP, n, hHold(PH_P[p], t, 1));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));

    // ── the things that move ───────────────────────────────────────────────
    const tv = pose(figV, xV, GROUND, K, dV, 1);
    const ph = pose(figP, xP, GROUND, K, dP, 1);
    const wTV = wristOf(tv, 'wrL');
    const wPH = wristOf(ph, 'wrR');
    const coinNow = A_LUCK[n] ? st(0.06, 0.08) * (1 - st(0.93, 0.95)) : 0;
    const coinO = carry(cv, 4, n, coinNow, coinNow, tr);
    const dPs = dP < 0 ? -1 : 1;
    const lampNow = A_REST[n] ? st(0.08, 0.75) : n > 10 ? 1 : 0;
    const lamp = carry(cv, 5, n, lampNow, lampNow, tr);

    // the reply to a tap, on the thing tapped
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number) => {
      'worklet';
      return (Q1[n] || Q2[n]) && pc === code ? q : 0;
    };
    const rClock = ans(1);
    const rBoard = ans(2);
    const rTicket = ans(3);
    const rSign = ans(4);
    // the clock is right in Q1 and wrong in Q2; the board the other way round
    const clockOk = Q1[n] === 1;
    const boardOk = Q2[n] === 1;
    // chosen, the stopped second hand tries to tick on twice, and falls back each time
    const twitch = 6 * Math.sin(Math.PI * clamp01((rClock - 0.08) / 0.16)) + 6 * Math.sin(Math.PI * clamp01((rClock - 0.36) / 0.16));

    return {
      tv, ph,
      ticket: { x: wTV.x + 1.5 * dV + shakeOf(rTicket), y: wTV.y, o: 1, sx: dV },
      react: {
        clock: { s: clockOk ? popOf(rClock) : 1, dx: clockOk ? 0 : shakeOf(rClock) },
        board: { s: boardOk ? popOf(rBoard) : 1, dx: boardOk ? 0 : shakeOf(rBoard) },
        sign: { s: 1, dx: shakeOf(rSign) },
      },
      second: 240 + twitch,
      glow: boardOk ? Math.sin(Math.PI * rBoard) : 0,
      coin: { x: wPH.x + 2.5 * dPs, y: wPH.y - 3 + flipY, o: coinO, sx: 1, sy: spin },
      lamp,
      q1: carry(cv, 6, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 7, n, Q2[p], Q2[n], tr),
    };
  });

  const DV = useDerivedValue<Bundle>(() => SCENE.value.tv);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.ph);

  return (
    <View style={styles.scene}>
      <LessonPicture name="phil4-station" />
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.safetyStripe} pointerEvents="none" />
      <LessonPicture name="phil4-tunnel" />
      <Lamp S={SCENE} />
      <Reacts S={SCENE} k="sign" origin={SIGN_FOOT}>
        <LessonPicture name="phil4-sign" />
        <View style={styles.signFace} pointerEvents="none">
          <Text style={styles.signText}>PLATFORM 2</Text>
        </View>
      </Reacts>
      <LessonPicture name="phil4-bench" />
      <Reacts S={SCENE} k="clock" origin={CLOCK_FOOT}>
        <LessonPicture name="phil4-clock" />
        <SecondHand S={SCENE} />
      </Reacts>
      <Reacts S={SCENE} k="board" origin={SCREEN_FOOT}>
        <ObjectArt parts={SCREEN_ART} tone={TONE} />
        <View style={styles.display} pointerEvents="none">
          <Text style={styles.ledText}>09:30 LONDON</Text>
          <Text style={styles.ledText}>ON TIME</Text>
        </View>
      </Reacts>
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DV} k={K} role="lead" wear={[]} />
      <Held S={SCENE} k="ticket" art={TICKET_ART} />
      <Held S={SCENE} k="coin" art={COIN_ART} />
      {on(Q1) ? <LuckyTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SourceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; sx?: number; sy?: number };
function Held({ S, k, art }: { S: SharedValue<any>; k: 'ticket' | 'coin'; art: ReturnType<typeof coin> }) {
  const at = useDerivedValue<At>(() => S.value[k]);
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

/** Where each answerable thing stands, which it pops up from and shakes about. */
const CLOCK_FOOT = `${CLOCK.x}px ${GROUND}px`;
const SCREEN_FOOT = `${SCREEN.x}px ${GROUND}px`;
const SIGN_FOOT = `${SIGN.x}px 419px`;
/** A thing that answers a tap: popped (right) or knocked (wrong) about its own foot. */
function Reacts({ S, k, origin, children }: { S: SharedValue<any>; k: 'clock' | 'board' | 'sign'; origin: string; children: ReactNode }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.react[k];
    return { transform: [{ translateX: r.dx }, { scale: r.s }] };
  });
  return <Animated.View style={[styles.layer, { transformOrigin: origin }, st]} pointerEvents="none">{children}</Animated.View>;
}
/** The clock's red second hand, stopped on forty: it only moves when the clock is chosen. */
function SecondHand({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: DIAL.x }, { translateY: DIAL.y }, { rotate: `${S.value.second}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.secondHand} />
      <View style={styles.secondHub} />
    </Animated.View>
  );
}
/** The departure screen's amber light, brightening round it when it is the right answer. */
function BoardGlow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.85 * S.value.glow }));
  return <Animated.View style={[styles.boardGlow, st]} pointerEvents="none" />;
}

/** The train's headlamp, coming out of the dark of the tunnel: a light, so no outline. */
function Lamp({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.lamp,
    transform: [{ translateX: MOUTH.x }, { translateY: MOUTH.y }, { scale: 0.35 + 0.65 * S.value.lamp }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.lampHalo} />
      <View style={styles.lampCore} />
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6). Every choice is plainly itself — the
 * clock, the departure screen with its words, the ticket in his hand, the PLATFORM 2
 * sign — so a ring round it is the whole choice. No two live targets touch (AN4).
 */
type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
const CLOCK_Q = { left: DIAL.x - DIAL.r - 3, top: DIAL.y - DIAL.r - 3, w: 2 * DIAL.r + 6, h: 2 * DIAL.r + 6, r: DIAL.r + 3 };
// its right edge stops short of the stage's, so the seal struck on its corner is not cut off
const SCREEN_Q = { left: DISPLAY.left - 5, top: DISPLAY.top - 6, w: DISPLAY.w + 4, h: DISPLAY.h + 12, r: 4 };
/** Q1: what made it a lucky guess — the stopped clock gave him no real reason. */
const LUCKY_Q: Q[] = [
  { id: 'clock', ...CLOCK_Q, correct: true },
  { id: 'board', ...SCREEN_Q, correct: false },
  { id: 'ticket', left: 229, top: 449, w: 32, h: 26, r: 4, correct: false },
];
/** Q2: a good reason his train is on time — the departure screen. */
const SOURCE_Q: Q[] = [
  { id: 'board', ...SCREEN_Q, correct: true },
  { id: 'clock', ...CLOCK_Q, correct: false },
  { id: 'sign', left: FACE.left - 6, top: FACE.top - 6, w: FACE.w + 12, h: FACE.h + 12, r: 3, correct: false },
];
function LuckyTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={LUCKY_Q} k="q1" />;
}
function SourceTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={SOURCE_Q} k="q2" />;
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

const LAMP_HALO = 20;
const LAMP_CORE = 10;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  safetyStripe: { position: 'absolute', left: 0, right: 0, top: GROUND + 3.5, height: 2.6, backgroundColor: NATURAL.safetyLine.base },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  secondHand: { position: 'absolute', left: -0.35, top: -12.6, width: 0.7, height: 15.6, borderRadius: 0.35, backgroundColor: NATURAL.clockRed.base },
  secondHub: { position: 'absolute', left: -0.8, top: -0.8, width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: NATURAL.clockRed.base },
  boardGlow: {
    position: 'absolute', left: DISPLAY.left - 6, top: DISPLAY.top - 6, width: DISPLAY.w + 12, height: DISPLAY.h + 12,
    borderRadius: 8, backgroundColor: NATURAL.lampGlow.shade,
  },
  lampHalo: {
    position: 'absolute', left: -LAMP_HALO / 2, top: -LAMP_HALO / 2, width: LAMP_HALO, height: LAMP_HALO,
    borderRadius: LAMP_HALO / 2, backgroundColor: NATURAL.lampGlow.shade, opacity: 0.55,
  },
  lampCore: {
    position: 'absolute', left: -LAMP_CORE / 2, top: -LAMP_CORE / 2, width: LAMP_CORE, height: LAMP_CORE,
    borderRadius: LAMP_CORE / 2, backgroundColor: NATURAL.lampGlow.base,
  },
  signFace: {
    position: 'absolute', left: FACE.left, top: FACE.top, width: FACE.w, height: FACE.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: NATURAL.railBlue.label, includeFontPadding: false,
  },
  display: {
    position: 'absolute', left: DISPLAY.left, top: DISPLAY.top, width: DISPLAY.w, height: DISPLAY.h,
    alignItems: 'center', justifyContent: 'center',
  },
  ledText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10.4, letterSpacing: 0.3, color: NATURAL.ledAmber.base, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
});

export function Phil4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil4Scene} band={[306, 514]} camera={CAM} />;
}
