import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './econ3Script';
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
  tint, posterWall, gigPoster, matchPoster, ticketKiosk, kioskFront, ticketRoll, ticket, note20, tinTakings,
  cashTin, wallClock,
} from './objects';
import { BY_ID } from './wardrobe';
import { EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-3, "What Does It Really Cost?" — A TICKET KIOSK ON A SATURDAY.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. A music lover (plain) can go to a concert or a
// free football match on Saturday afternoon, not both; the kiosk seller (the cap, kind)
// is sure free is always best; the economist (the top hat) shows what a choice costs.
//
//   b0   the music lover points at the concert bill, then the football bill, then the
//        concert again, and turns to the kiosk with an open hand.
//   b1   the seller tears a green football ticket off its roll, leans out of his window
//        and waves it, then lays it on the shelf.
//   b2   the economist walks in from the left to stand between the two bills, tips his
//        hat and opens a hand to the music lover, who turns to him.
//   b3   he lays a hand on each bill, then lifts one away — off the football bill.
//   b4   Q1: the concert bill, the football bill and the kiosk clock — tap one.
//   b5   the music lover folds his arms and looks at the concert bill.
//   b6   the economist points at the kiosk clock, whose minute hand runs on to a
//        quarter past, then opens a hand to the music lover.
//   b7   the seller tears a pink concert ticket off its roll and lifts a twenty-pound
//        note out of his cash tin, holds both up, puts the note back and keeps the
//        ticket in his hand; the music lover unfolds his arms and turns to him.
//   b8   the economist holds his hands out like a pair of scales, tips them one way and
//        the other, and levels them.
//   b9   Q2: the concert bill, the football bill and the cash tin — tap one.
//   b10  the music lover walks to the window, takes a twenty out of his pocket and hands
//        it over; the seller steps to meet him, drops it in the tin and hands over the
//        pink ticket, which the music lover holds up to look at.
//   b11  at ease under the quotation.
//
// COMPOSITION, in stage units. A BRICK WALL under a stone coping fills the left, 0–196 ×
// 382–500, with two bills pasted on it at hip-to-head height: the CONCERT bill 18–78 and
// the FOOTBALL bill 116–176, both 396–468. The ECONOMIST stands between them at 97, a
// hand's reach (~19) from each. The MUSIC LOVER stands at 214, clear of the wall's end,
// and walks to 246 to buy. The TICKET KIOSK fills the right, 244–396 × 316–500: its
// gable 322–364 with the CLOCK at 320, 344; the sign board 252–388 × 365–381; the
// service window 256–384 × 388–468 with its shelf at 468 (the seller's hip, AP10). The
// SELLER stands inside at 290 (280 to trade); the football roll hangs at 266 and the
// concert roll at 314 on short rails at 428, each next ticket within ~22 of a shoulder;
// the open CASH TIN stands on the shelf at 286–306. The note and the ticket pass at
// 262, 461, inside both their arms' reach (~23 units from a shoulder at K 0.76).
// Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners keep their hands still (AP18) and their heads alive (N21).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-3), except where the action needs
 * longer than the line and runs on after it — b1 (the ticket laid down), b7 (the note
 * put back) and b10 (the walk, the money and the ticket).
 */
const LINES = [3.98, 3.2, 5.23, 5.57, 0, 3.86, 6.34, 4, 4.76, 0, 5.4, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, waiting.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_TORN = is('torn');
const A_FREE = is('free');
const A_ARRIVE = is('arrive');
const A_GIVEUP = is('giveup');
const A_COST = is('cost');
const A_TIME = is('time');
const A_TWENTY = is('twenty');
const A_WEIGH = is('weigh');
const A_BUY = is('buy');
const FREE_N = A_FREE.indexOf(1);
const TWENTY_N = A_TWENTY.indexOf(1);
const BUY_N = A_BUY.indexOf(1);
const LOSE = BEATS.map((b) => (b.lose ? 1 : 0));
const BETTER = BEATS.map((b) => (b.better ? 1 : 0));
const CLOCK_V = BEATS.map((b) => b.clock ?? 0);
const TIME_N = A_TIME.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing]; it eases
// through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const PL_HOME = 214;
const PL_BUY = 246;
const TH_HOME = 97;
const CP_HOME = 290;
const CP_TRADE = 280;
const PL_LEGS: Track[] = BEATS.map((_, n) => (n < BUY_N ? [[0, PL_HOME]] : n === BUY_N ? [[0.02, PL_BUY]] : [[0, PL_BUY]]));
const PL_TURN: Track[] = [
  [[0, -1], [0.6, 1]], [[0, 1]], [[0, 1], [0.1, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.02, 1]], [[0, 1], [0.02, -1]], [[0, -1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The economist is off the stage, left, until he walks in on b2. */
const TH_LEGS: Track[] = BEATS.map((b) => (b.th ? [[0, TH_HOME]] : [[0, -40]]));
const TH_TURN: Track[] = BEATS.map(() => [[0, 1]]);
const CP_LEGS: Track[] = BEATS.map((_, n) => (n < BUY_N ? [[0, CP_HOME]] : n === BUY_N ? [[0.04, CP_TRADE]] : [[0, CP_TRADE]]));
const CP_TURN: Track[] = BEATS.map(() => [[0, -1]]);
/** What each is doing with his body: talking while he speaks, alive while he listens (N21). */
const PL_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, NOD, WAIT, TALK, NOD, WAIT];
const TH_P = [WAIT, WAIT, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, NOD, WAIT];
const CP_P = [NOD, TALK, NOD, NOD, WAIT, NOD, NOD, TALK, NOD, WAIT, NOD, NOD, WAIT];

// ── the wall and its two bills ───────────────────────────────────────────────
const WALL = { x: 98, y: 441, w: 196, h: 118 };
const GIG = { x: 48, y: 432, w: 60, h: 72 };
const MATCH = { x: 146, y: 432, w: 60, h: 72 };
/** Where the economist's hands lie on the bills: just inside each one's near edge. */
const ON_GIG = { x: 76, y: 447 };
const ON_MATCH = { x: 118, y: 447 };
/** Each bill's headline band, and the football bill's flash, in stage units. */
const band = (p: { x: number; w: number; y: number; h: number }) => ({
  left: p.x - p.w / 2 + 0.05 * p.w, top: p.y - p.h / 2 + 0.04 * p.h, w: 0.9 * p.w, h: 0.2 * p.h,
});
const GIG_BAND = band(GIG);
const MATCH_BAND = band(MATCH);
const FLASH = { left: MATCH.x - 30 + 0.54 * 60, top: MATCH.y - 36 + 0.63 * 72, w: 0.42 * 60, h: 0.16 * 72 };

// ── the kiosk ────────────────────────────────────────────────────────────────
const KIOSK = { x: 320, y: 408, w: 152, h: 184 };
const FRONT = { x: 320, y: 484, w: 152, h: 32 };
const TOP = 468;                                      // the shelf, at his hip
const CLOCK = { x: 320, y: 344, d: 20 };
const SIGN = { left: 252, top: 365, w: 136, h: 16 };
/** The two ticket rolls on their rails, and the next ticket hanging off each strip. */
const ROLL = { w: 12, h: 26, y: 435 };
const ROLL_G = 266;
const ROLL_P = 314;
const TIP_Y = ROLL.y + ROLL.h / 2 + 7;
/** A ticket, drawn about its middle: 14 × 7. */
const TK = { w: 14, h: 7 };
/** The cash tin, open on the shelf, and the takings standing in it. */
const TIN = { x: 296, y: TOP - 6, w: 20, h: 12 };
const TIN_MOUTH = { x: 295, y: TOP - 11 };
/** Where the football ticket is laid down on the shelf. */
const SHELF_G = { x: 270, y: TOP - 1.6 };
/** Where things pass across the shelf, from one hand to the other. */
const PASS = { x: 262, y: 461 };

const WALL_ART = posterWall(WALL.x, WALL.y, WALL.w, WALL.h);
const GIG_ART = gigPoster(GIG.x, GIG.y, GIG.w, GIG.h);
const MATCH_ART = matchPoster(MATCH.x, MATCH.y, MATCH.w, MATCH.h);
const KIOSK_ART = ticketKiosk(KIOSK.x, KIOSK.y, KIOSK.w, KIOSK.h);
const FRONT_ART = kioskFront(FRONT.x, FRONT.y, FRONT.w, FRONT.h);
const CLOCK_ART = wallClock(CLOCK.x, CLOCK.y, CLOCK.d, CLOCK.d);
const ROLL_G_ART = tint(ticketRoll(ROLL_G, ROLL.y, ROLL.w, ROLL.h), 'ticketGreen');
const ROLL_P_ART = ticketRoll(ROLL_P, ROLL.y, ROLL.w, ROLL.h);
const TAKINGS_ART = tinTakings(TIN.x, TIN.y - 7, 16, 9);
const TIN_ART = cashTin(TIN.x, TIN.y, TIN.w, TIN.h);
// The things that move are drawn about their own middle and carried by a rider.
const PINK_ART = ticket(0, 0, TK.w, TK.h);
const GREEN_ART = tint(ticket(0, 0, TK.w, TK.h), 'ticketGreen');
const NOTE_ART = note20(0, 0, 18, 10);

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

const CAM = followMoves(PL_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('economics'));

export default function Econ3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldT = useHeld();
  const heldC = useHeld();
  const cv = useCarry(15);
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

    // ── the music lover ─────────────────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 0, n, PL_HOME), PL_LEGS[n], b, L);
    const xP = carry(cv, 0, n, wp.x, wp.x, 1);
    const dP = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), PL_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PL_P, n, t, b);
    // b0: a finger at the concert bill, across to the football bill, and back
    if (A_TORN[n]) {
      const tx = GIG.x + (MATCH.x - GIG.x) * (st(0.22, 0.3) - st(0.38, 0.46));
      sp = hand(sp, xP, dP, 1, tx, 428, st(0.04, 0.12) * (1 - st(0.5, 0.58)));
      sp = hand(sp, xP, dP, 1, xP + 18 * dP, 452, bp(0.7, 0.8, 0.97));
    }
    // b5–b7: his arms folded, and unfolded as he turns to the seller
    const foldNow = A_COST[n] ? st(0.08, 0.22) : A_TIME[n] ? 1 : A_TWENTY[n] ? 1 - st(0.02, 0.14) : 0;
    const fold = carry(cv, 2, n, foldNow, foldNow, tr);
    if (fold > 0) {
      sp = hand(sp, xP, dP, 1, xP + 5 * dP, 458, fold);
      sp = hand(sp, xP, dP, -1, xP + 3 * dP, 455, fold);
    }
    // b10: a twenty out of his pocket, across the shelf; then the ticket, held up to look at
    const lookNow = A_BUY[n] ? st(0.74, 0.84) : n > BUY_N ? 1 : 0;
    if (A_BUY[n]) {
      sp = hand(sp, xP, dP, 1, xP - 3 * dP, 471, bp(0.19, 0.24, 0.31));
      sp = hand(sp, xP, dP, 1, PASS.x, PASS.y, st(0.29, 0.37) * (1 - st(0.47, 0.53)));
      sp = hand(sp, xP, dP, 1, PASS.x + 2, PASS.y - 2, st(0.58, 0.65) * (1 - st(0.72, 0.78)));
    }
    if (lookNow > 0) sp = hand(sp, xP, dP, 1, xP + 13 * dP, 451, lookNow);
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the economist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 3, n, -40), TH_LEGS[n], b, L);
    const xT = carry(cv, 3, n, wt.x, wt.x, 1);
    const dT = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // b2: he tips his hat once he has arrived, and opens a hand to the music lover
    if (A_ARRIVE[n]) {
      const after = moveTr(-40, TH_HOME, TR) / L;
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.18));
      stt = hand(stt, xT, dT, 1, xT + 20 * dT, 450, bp(after + 0.22, after + 0.3, 0.97));
    }
    // b3: a hand on each bill — then the one on the football bill lifted away
    if (A_GIVEUP[n]) {
      stt = hand(stt, xT, dT, -1, ON_GIG.x, ON_GIG.y, st(0.04, 0.14) * (1 - st(0.9, 0.98)));
      stt = hand(stt, xT, dT, 1, ON_MATCH.x, ON_MATCH.y, st(0.08, 0.18) * (1 - st(0.36, 0.44)));
      stt = hand(stt, xT, dT, 1, ON_MATCH.x - 3, 432, bp(0.36, 0.46, 0.9));
    }
    // b6: a finger at the kiosk clock while its hand runs on; then a hand to the music lover
    if (A_TIME[n]) {
      stt = hand(stt, xT, dT, 1, CLOCK.x, CLOCK.y, bp(0.03, 0.12, 0.6));
      stt = hand(stt, xT, dT, 1, xT + 20 * dT, 452, bp(0.66, 0.76, 0.97));
    }
    // b8: his hands out like the pans of a pair of scales, tipped one way, the other,
    // and level
    if (A_WEIGH[n]) {
      const out = st(0.04, 0.16) * (1 - st(0.9, 0.98));
      const tip = 7 * (bp(0.26, 0.36, 0.46) - bp(0.46, 0.56, 0.66));
      stt = hand(stt, xT, dT, 1, xT + 17 * dT, 458 + tip, out);
      stt = hand(stt, xT, dT, -1, xT - 17 * dT, 458 - tip, out);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the seller, inside his kiosk ────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 5, n, CP_HOME), CP_LEGS[n], b, L);
    const xC = carry(cv, 5, n, wc.x, wc.x, 1);
    const dC = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, -1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b);
    // leaning out of the window: to wave the free ticket (b1), and to trade (b10)
    const leanNow = A_FREE[n] ? bp(0.12, 0.24, 0.86) : A_BUY[n] ? 0.4 * bp(0.34, 0.44, 0.76) : 0;
    const lean = carry(cv, 7, n, leanNow, leanNow, tr);
    sc = { ...sc, tilt: sc.tilt - 0.24 * lean };
    // b1: a football ticket torn off its roll, waved out of the window, laid on the shelf
    if (A_FREE[n]) {
      const env = st(0.2, 0.26) * (1 - st(0.6, 0.68));
      // AP18: waving the free ticket at him is the action the line describes
      const wave = 3 * Math.sin(b * 9) * env;
      let tx = lerp(ROLL_G, 250 + wave, st(0.13, 0.22));
      let ty = lerp(TIP_Y, 438, st(0.13, 0.22));
      tx = lerp(tx, SHELF_G.x, st(0.7, 0.8));
      ty = lerp(ty, SHELF_G.y - 2, st(0.7, 0.8));
      sc = hand(sc, xC, dC, 1, tx, ty, st(0.03, 0.1) * (1 - st(0.86, 0.95)));
    }
    // b7: a concert ticket torn off its roll in one hand, a twenty lifted out of the tin
    // in the other, both held up; the note back in the tin, the ticket kept
    if (A_TWENTY[n]) {
      let lx = lerp(ROLL_P, 302, st(0.2, 0.3));
      let ly = lerp(TIP_Y, 430, st(0.2, 0.3));
      lx = lerp(lx, xC + 22, st(0.78, 0.88));
      ly = lerp(ly, 463, st(0.78, 0.88));
      sc = hand(sc, xC, dC, -1, lx, ly, st(0.04, 0.12));
      const rx = lerp(TIN_MOUTH.x, 276, st(0.24, 0.34) * (1 - st(0.72, 0.8)));
      const ry = lerp(TIN_MOUTH.y, 430, st(0.24, 0.34) * (1 - st(0.72, 0.8)));
      sc = hand(sc, xC, dC, 1, rx, ry, st(0.12, 0.2) * (1 - st(0.86, 0.95)));
    }
    // b8–b10: the ticket held still at the shelf, until it is handed over
    const keepNow = n > TWENTY_N && n < BUY_N ? 1 : A_BUY[n] ? 1 - st(0.7, 0.78) : 0;
    if (keepNow > 0) sc = hand(sc, xC, dC, -1, xC + 22, 463, keepNow);
    // b10: his note taken across the shelf and dropped in the tin; the ticket handed over
    if (A_BUY[n]) {
      sc = hand(sc, xC, dC, 1, PASS.x, PASS.y, st(0.36, 0.43) * (1 - st(0.5, 0.56)));
      sc = hand(sc, xC, dC, 1, TIN_MOUTH.x, TIN_MOUTH.y, st(0.5, 0.56) * (1 - st(0.62, 0.7)));
      sc = hand(sc, xC, dC, -1, PASS.x + 2, PASS.y - 2, st(0.56, 0.63) * (1 - st(0.7, 0.78)));
    }
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the three people, posed ─────────────────────────────────────────────
    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const cp = pose(figC, xC, GROUND, K, dC, 1);

    // ── the things that change hands ────────────────────────────────────────
    // greenT 0 on its roll · 1 the seller's hand · 2 laid on the shelf
    // pinkT  0 on its roll · 1 the seller's hand · 2 the music lover's
    // noteS  the seller's twenty: 0 in the tin · 1 held up
    // noteL  the music lover's twenty: 0 his pocket · 1 his hand · 2 the seller's · 3 the tin
    const greenNow = A_FREE[n] ? st(0.1, 0.13) + st(0.8, 0.84) : n > FREE_N ? 2 : 0;
    const pinkNow = A_TWENTY[n] ? st(0.11, 0.14) : A_BUY[n] ? 1 + st(0.64, 0.68) : n > TWENTY_N ? (n > BUY_N ? 2 : 1) : 0;
    const noteSNow = A_TWENTY[n] ? st(0.18, 0.22) * (1 - st(0.79, 0.83)) : 0;
    const noteLNow = A_BUY[n] ? st(0.22, 0.26) + st(0.43, 0.47) + st(0.54, 0.6) : n > BUY_N ? 3 : 0;
    const gT = carry(cv, 8, n, greenNow, greenNow, tr);
    const pT = carry(cv, 9, n, pinkNow, pinkNow, tr);
    const sN = carry(cv, 10, n, noteSNow, noteSNow, tr);
    const lN = carry(cv, 11, n, noteLNow, noteLNow, tr);
    const cR = wristOf(cp, 'wrR');
    const cL = wristOf(cp, 'wrL');
    const pR = wristOf(pl, 'wrR');
    const held = (w: { x: number; y: number }) => {
      'worklet';
      return { x: w.x, y: w.y - 2 };
    };
    let green: { x: number; y: number; o: number; r: number; sy: number };
    if (gT <= 1) {
      const h = held(cR);
      green = { x: lerp(ROLL_G, h.x, gT), y: lerp(TIP_Y, h.y, gT), o: 1, r: lerp(90, 0, gT), sy: 1 };
    } else {
      const h = held(cR);
      green = { x: lerp(h.x, SHELF_G.x, gT - 1), y: lerp(h.y, SHELF_G.y, gT - 1), o: 1, r: 0, sy: lerp(1, 0.4, gT - 1) };
    }
    let pink: { x: number; y: number; o: number; r: number; sy: number };
    if (pT <= 1) {
      const h = held(cL);
      pink = { x: lerp(ROLL_P, h.x, pT), y: lerp(TIP_Y, h.y, pT), o: 1, r: lerp(90, 0, pT), sy: 1 };
    } else {
      const a = held(cL);
      const z = held(pR);
      pink = { x: lerp(a.x, z.x, pT - 1), y: lerp(a.y, z.y, pT - 1), o: 1, r: 0, sy: 1 };
    }
    const noteS = { x: lerp(TIN_MOUTH.x, cR.x, sN), y: lerp(TIN_MOUTH.y + 3, cR.y - 3, sN), o: clamp01(sN * 3), r: -8 * sN, sy: 1 };
    let noteL: { x: number; y: number; o: number; r: number; sy: number };
    if (lN <= 1) noteL = { x: pR.x, y: pR.y - 3, o: clamp01(lN * 2), r: 0, sy: 1 };
    else if (lN <= 2) noteL = { x: lerp(pR.x, cR.x, lN - 1), y: lerp(pR.y, cR.y, lN - 1) - 3, o: 1, r: 0, sy: 1 };
    else noteL = { x: lerp(cR.x, TIN_MOUTH.x, lN - 2), y: lerp(cR.y - 3, TIN_MOUTH.y + 4, lN - 2), o: 1 - clamp01(lN - 2), r: 0, sy: 1 };

    const minNow = n < TIME_N ? 0 : A_TIME[n] ? st(0.18, 0.58) : CLOCK_V[n];

    return {
      pl, th, cp, t,
      minute: carry(cv, 12, n, minNow, minNow, tr),
      green, pink, noteS, noteL,
      q1: carry(cv, 13, n, LOSE[p], LOSE[n], tr),
      q2: carry(cv, 14, n, BETTER[p], BETTER[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WALL_ART} tone={TONE} />
      <ObjectArt parts={GIG_ART} tone={TONE} />
      <ObjectArt parts={MATCH_ART} tone={TONE} />
      <Bills />
      <ObjectArt parts={KIOSK_ART} tone={TONE} />
      <ObjectArt parts={CLOCK_ART} tone={TONE} />
      <ClockHands S={SCENE} />
      <View style={styles.sign} pointerEvents="none">
        <Text style={styles.signWord}>TICKETS</Text>
      </View>
      <ObjectArt parts={ROLL_G_ART} tone={TONE} />
      <ObjectArt parts={ROLL_P_ART} tone={TONE} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <ObjectArt parts={FRONT_ART} tone={TONE} />
      <ObjectArt parts={TAKINGS_ART} tone={TONE} />
      <ObjectArt parts={TIN_ART} tone={TONE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Moving S={SCENE} />
      {on(LOSE) ? <LoseTargets picked={picked} onPick={onPick} live={LOSE[i] === 1} S={SCENE} /> : null}
      {on(BETTER) ? <BetterTargets picked={picked} onPick={onPick} live={BETTER[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the bills' printed words ─────────────────────────────────────────────────

function Bills() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.band, { left: GIG_BAND.left, top: GIG_BAND.top, width: GIG_BAND.w, height: GIG_BAND.h }]}>
        <Text style={styles.bandWord}>CONCERT</Text>
      </View>
      <View style={[styles.band, { left: MATCH_BAND.left, top: MATCH_BAND.top, width: MATCH_BAND.w, height: MATCH_BAND.h }]}>
        <Text style={styles.bandWord}>FOOTBALL</Text>
      </View>
      <View style={[styles.band, { left: FLASH.left, top: FLASH.top, width: FLASH.w, height: FLASH.h }]}>
        <Text style={styles.flashWord}>FREE</Text>
      </View>
    </View>
  );
}

// ── the kiosk clock: noon, running on to a quarter past on b6 ────────────────
function ClockHands({ S }: { S: SharedValue<any> }) {
  const minute = useAnimatedStyle(() => ({ transform: [{ rotate: `${90 * S.value.minute}deg` }] }));
  const hourH = useAnimatedStyle(() => ({ transform: [{ rotate: `${7.5 * S.value.minute}deg` }] }));
  const second = useAnimatedStyle(() => ({ transform: [{ rotate: `${(S.value.t * 6) % 360}deg` }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.handHour, hourH]} />
      <Animated.View style={[styles.handMinute, minute]} />
      <Animated.View style={[styles.handSecond, second]} />
      <View style={styles.boss} />
    </View>
  );
}

// ── the tickets and the notes, wherever they are ────────────────────────────

type At = { x: number; y: number; o: number; r: number; sy: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof ticket> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r}deg` }, { scaleY: at.value.sy },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function Moving({ S }: { S: SharedValue<any> }) {
  const greenP = useDerivedValue<At>(() => S.value.green);
  const pinkP = useDerivedValue<At>(() => S.value.pink);
  const noteSP = useDerivedValue<At>(() => S.value.noteS);
  const noteLP = useDerivedValue<At>(() => S.value.noteL);
  return (
    <>
      <Rider at={noteSP} art={NOTE_ART} />
      <Rider at={noteLP} art={NOTE_ART} />
      <Rider at={greenP} art={GREEN_ART} />
      <Rider at={pinkP} art={PINK_ART} />
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6): the two bills, named by their own headline, and a
 * third thing at the kiosk. No two live targets touch (AN4).
 */
type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
const BILL_GIG = { left: GIG.x - 32, top: GIG.y - 38, w: 64, h: 76, r: 3 };
const BILL_MATCH = { left: MATCH.x - 32, top: MATCH.y - 38, w: 64, h: 76, r: 3 };
/** Q1: if he picks the free football, what he gives up is the concert. */
const LOSE_Q: Q[] = [
  { id: 'concert', ...BILL_GIG, correct: true },
  { id: 'football', ...BILL_MATCH, correct: false },
  { id: 'clock', left: CLOCK.x - 14, top: CLOCK.y - 14, w: 28, h: 28, r: 14, correct: false },
];
/** Q2: for a man who loves music, the concert gives up less. */
const BETTER_Q: Q[] = [
  { id: 'concert', ...BILL_GIG, correct: true },
  { id: 'football', ...BILL_MATCH, correct: false },
  { id: 'tin', left: TIN.x - 14, top: TIN.y - 12, w: 28, h: 22, r: 4, correct: false },
];
function LoseTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={LOSE_Q} k="q1" />;
}
function BetterTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={BETTER_Q} k="q2" />;
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

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  band: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  bandWord: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.3, color: PAPER_LIT, includeFontPadding: false,
  },
  flashWord: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  sign: {
    position: 'absolute', left: SIGN.left, top: SIGN.top, width: SIGN.w, height: SIGN.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signWord: {
    fontFamily: 'Inter_700Bold', fontSize: 9.6, lineHeight: 12, letterSpacing: 2.4, color: PAPER_LIT, includeFontPadding: false,
  },
  handHour: {
    position: 'absolute', left: CLOCK.x - 1, top: CLOCK.y - 4.6, width: 2, height: 4.6, borderRadius: 1,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  handMinute: {
    position: 'absolute', left: CLOCK.x - 0.75, top: CLOCK.y - 6.8, width: 1.5, height: 6.8, borderRadius: 0.75,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  handSecond: {
    position: 'absolute', left: CLOCK.x - 0.35, top: CLOCK.y - 7.2, width: 0.7, height: 7.2,
    backgroundColor: EMBER, transformOrigin: '50% 100%',
  },
  boss: {
    position: 'absolute', left: CLOCK.x - 1.4, top: CLOCK.y - 1.4, width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: INK,
  },
  clear: { flexGrow: 1 },
});

export function Econ3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ3Scene} band={[306, 514]} camera={CAM} />;
}
