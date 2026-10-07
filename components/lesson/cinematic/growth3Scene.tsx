import type { ReactNode } from 'react';
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
import { BEATS } from './growth3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, seated, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, strideMode } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, runningTrack, trackVerge, goalCard, wallCalendar, stopwatch, sportsBottle,
  litterBin, newspaper, ballpoint, floodlight, parkTree, CAL_TUESDAY, WATCH_DIAL,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-3, "How to Set a Goal That Works" — A PARK RUNNING
// TRACK, A NOTICE BOARD OF NEW YEAR GOALS, AND A STOPWATCH ON A CORD.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The woman with the bun pins up the same goal she pinned last year; her friend (plain)
// watches over his newspaper from the bench; the coach (the top hat) jogs in along the
// track with a stopwatch and shows her the goal that can actually be done.
//
//   b0   at the board's right-hand end she pins her card GET FIT! up beside last year's
//        cards, walks along the front of the board to her friend's end, and stretches.
//   b1   her friend lowers his newspaper and looks up at her.
//   b2   the coach jogs in from the right along the track, stopwatch swinging from his
//        hand on its cord, tips his hat and lays a finger on her GET FIT! card.
//   b3   he turns to point away down the track, turns back and holds the stopwatch up.
//   b4   Q1: the three goal cards on the board — tap one.
//   b5   she turns to look down the track, hands on her hips, and back to the coach.
//   b6   the coach unpins RUN ONE LAP and pins it over GET FIT!, then steps a hand up,
//        a stair at a time — a little bigger each week.
//   b7   her friend folds his newspaper, lays it on his lap and taps his wrist.
//   b8   the coach points across the board at the calendar, then holds a hand out to
//        her; she turns to the board.
//   b9   Q2: the calendar on the board, her water bottle and the bin — tap one.
//   b10  she takes the pen hanging on its string at the board's corner, rings Tuesday
//        on the calendar, lets the pen drop back, turns and jogs off along the track;
//        the coach starts the stopwatch as she goes.
//   b11  the quotation; she is off on her lap and the stopwatch runs in his raised hand.
//
// COMPOSITION, in stage units: the running track is the floor, 400 × 500–516, red with
// its kerb line at 501 and a lane line at 508; a strip of mown verge behind it at
// 490–500. The notice board 136–252 × 412–500 — its gabled cap 412–429, its frame
// 140–248 × 428–482 at a person's chest, the cork 143–245 × 431–479 — on two posts at
// 146 and 242. On the cork: last year's BE HEALTHIER card 145–189 × 434–450 and the
// calendar 144–186 × 455–477 at the left-hand end, her GET FIT! card 199–243 × 434–450
// and RUN ONE LAP 199–243 × 457–473 at the right; the pen hangs on its string from
// (139, 457) at the left-hand frame. The bench 10–82 × 460–500 with her friend sitting at
// 36; her water bottle stands on the grass at 92. She stands at the board's left end at
// 128, the coach at its right end at 262; the bin is at 384 and the floodlight mast at
// 300 rises to 318. Every card a hand moves is within the rig's safe reach (~23 units
// from the shoulder at K 0.76) of the end it is worked from — which is why she pins at
// the right end before the coach arrives there, and writes at the left. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still (AP18, N21).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-3), except where the action
 * needs longer than the line and runs on after it — b0 (pin, walk and stretch) and b10
 * (the pen, the ring, and off along the track).
 */
const LINES = [5.4, 2.92, 5.78, 6.31, 0, 4.16, 4.68, 3.37, 6.43, 0, 6, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, hands on hips.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const HIPS = 163;
/** The bench's seat, as the rig's pelvis height. */
const SEAT_H = 24;
/** The jog (moves.ts travel mode 12) and how fast it goes, in stage units a second. */
const JOG = 12;
const JOG_SPEED = 110;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_WISH = is('wish');
const A_AGAIN = is('again');
const A_ARRIVE = is('arrive');
const A_LAP = is('lap');
const A_STEP = is('step');
const A_WHEN = is('when');
const A_WRITE = is('write');
const A_PLAN = is('plan');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.check ? 1 : 0));
const Q2 = BEATS.map((b) => (b.place ? 1 : 0));
/** Her friend nods along on every beat that is not his own line. */
const PL_NODS = BEATS.map((b) => (b.speaker === 'plain' ? 0 : 1));

// ── where each walks, and which way each faces, beat by beat ─────────────────
// A leg is [fraction of the line it starts at, x, travel mode (0 walk, 12 jog)]; it
// runs at its own speed from wherever the last one ended. A turn is [fraction, facing];
// it eases through a profile (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const R_START = 266;
const R_AT = 122;
const R_LEGS: Track[] = [
  [[0.3, R_AT]], [[0, R_AT]], [[0, R_AT]], [[0, R_AT]], [[0, R_AT]], [[0, R_AT]], [[0, R_AT]],
  [[0, R_AT]], [[0, R_AT]], [[0, R_AT]], [[0.56, -80, JOG]], [[0, -80]], [[0, -80]],
];
const R_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1], [0.1, 1]], [[0, 1]], [[0, 1]], [[0, 1], [0.08, -1], [0.62, 1]], [[0, 1]],
  [[0, 1], [0.04, -1]], [[0, -1], [0.04, 1]], [[0, 1]], [[0, 1], [0.5, -1]], [[0, -1]], [[0, -1]],
];
const T_OFF = 440;
const T_AT = 266;
const T_LEGS: Track[] = [
  [[0, T_OFF]], [[0, T_OFF]], [[0.02, T_AT, JOG]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]],
  [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]],
];
const T_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.02, 1], [0.42, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** Her friend stays on the bench, facing her. */
const PL_X = 36;
/** What each is doing with the body: talking while he speaks, nodding along while he does not. */
const R_P = [TALK, NOD, NOD, NOD, NOD, HIPS, NOD, NOD, NOD, NOD, TALK, NOD, NOD];
const T_P = [NOD, NOD, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, NOD];

// ── the track, the board and what is pinned to it ────────────────────────────
const BOARD = { x: 194, y: 456, w: 116, h: 88 };
const CARD = { w: 44, h: 16 };
const HEALTHIER_AT = { x: 167, y: 442 };
const GETFIT_AT = { x: 221, y: 442.5 };
const RUNLAP_AT = { x: 221, y: 465 };
/** Where a hand holds a card worked from the board's right-hand end: its right end. */
const GRIP = 21;
const CAL = { x: 165, y: 466, w: 42, h: 22 };
const TUE = {
  x: CAL.x - CAL.w / 2 + (CAL_TUESDAY.x * CAL.w) / CAL_TUESDAY.of.w,
  y: CAL.y - CAL.h / 2 + (CAL_TUESDAY.y * CAL.h) / CAL_TUESDAY.of.h,
};
/** The pen's string, tied at the board's left-hand frame, and where the pen hangs on it. */
const HOOK = { x: 139, y: 457 };
const PEN = { w: 3, h: 14 };
const PEN_HANG = { x: HOOK.x, y: HOOK.y + 7 };
/** Held to write, the pen slants 45° forward from a point just above and behind the hand. */
const PEN_SLANT = 45;
const PEN_GRIP = { x: -3, y: -4 };
const PEN_TIP = {
  x: PEN_GRIP.x + PEN.h * Math.sin((PEN_SLANT * Math.PI) / 180),
  y: PEN_GRIP.y + PEN.h * Math.cos((PEN_SLANT * Math.PI) / 180),
};
/** The stopwatch, drawn hanging from the top of its cord. */
const WATCH = { w: 10.5, h: 19.5 };
const DIAL = { y: (WATCH_DIAL.y * WATCH.h) / WATCH_DIAL.of.h, r: (WATCH_DIAL.r * WATCH.w) / WATCH_DIAL.of.w };
/** Her friend's newspaper: open, and where his hands hold it. */
const PAPER = { w: 24, h: 17 };
const PAPER_UP = { x: PL_X + 14, y: 447 };
const PAPER_DOWN = { x: PL_X + 10, y: 464 };
const PAPER_LAP = { x: PL_X + 12, y: 474 };
const BOTTLE = { x: 88, y: 489, w: 8.5, h: 22 };
const BIN = { x: 384, y: 484, w: 20, h: 32 };

const TRACK_ART = runningTrack(200, 508, 400, 16);
const VERGE_ART = trackVerge(200, 495, 400, 10);
const MAST_ART = floodlight(300, 409, 40, 182);
const TREE_ART = parkTree(352, 425, 72, 150);
const HEALTHIER_ART = goalCard(HEALTHIER_AT.x, HEALTHIER_AT.y, CARD.w, CARD.h, 'yellowed', 'tinPaint');
const CAL_ART = wallCalendar(CAL.x, CAL.y, CAL.w, CAL.h);
const BOTTLE_ART = sportsBottle(BOTTLE.x, BOTTLE.y, BOTTLE.w, BOTTLE.h);
const BIN_ART = litterBin(BIN.x, BIN.y, BIN.w, BIN.h);
// The things that move are drawn about the point they are held or hung by.
const GETFIT_ART = goalCard(0, 0, CARD.w, CARD.h, 'paper', 'enamel');
const RUNLAP_ART = goalCard(0, 0, CARD.w, CARD.h, 'paper', 'tapeCase');
const WATCH_ART = stopwatch(0, WATCH.h / 2, WATCH.w, WATCH.h);
const PEN_ART = ballpoint(0, PEN.h / 2, PEN.w, PEN.h);
const PAPER_ART = newspaper(0, 0, PAPER.w, PAPER.h);

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
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Her friend, sitting on the bench. Still (AL1): his life is his head and his hands. */
function sitting(t: number): Stance {
  'worklet';
  return seated(SEAT_H, t, 18);
}

/**
 * Where a figure stands at time `b` of a beat, taking its legs in turn. He starts from
 * WHERE HE IS ON SCREEN (`src`, out of the carry), so a tap mid-walk cannot put him
 * anywhere in one frame (group L). A leg starts at its time or when the leg before it
 * has finished, whichever is later. A jog runs at JOG_SPEED; a walk at the rig's.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  let mode = 0;
  let dur0 = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const m = legs[k].length > 2 ? legs[k][2] : 0;
    const d = Math.abs(to - from);
    const dur = d > 1 ? (m === JOG ? Math.max(TR, d / JOG_SPEED) : moveTr(from, to, TR)) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (b < start) break;
    x0 = from;
    x1 = to;
    mode = m;
    dur0 = dur;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, mode, dur: dur0 };
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

/** One figure's body for a beat: walking or jogging its legs, or holding its pose live. */
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  if (!w.walking) return hLive(codes[n], t, b);
  if (w.mode === JOG) return strideMode(w.x0, w.x1, hHold(codes[n], t), w.u, JOG);
  return travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

const CAM = followMoves(R_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('personal-growth'));

export default function Growth3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldR = useHeld();
  const heldP = useHeld();
  const heldT = useHeld();
  const cv = useCarry(14);
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

    // ── the runner ──────────────────────────────────────────────────────────
    const wr = legsOf(carrySource(cv, 0, n, R_START), R_LEGS[n], b, L);
    const xR = carry(cv, 0, n, wr.x, wr.x, 1);
    const dR = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), R_TURN[n], b, L), 1);
    let sr = bodyOf(wr, R_P, n, t, b);
    // b0: her card held out, pinned at the board's right-hand end, and the stretch once
    // she has walked along to her friend's end
    if (A_WISH[n]) {
      // the stretch, once: both arms straight up over her head and a lean back, looking
      // up, then down again. Side-on a person stretches UP, not fore and aft: the far arm
      // flung back behind her is an arm thrown back (AR4).
      const e = wr.walking ? 0 : Math.sin(Math.PI * ease01(st(0.8, 1)));
      if (e > 0) {
        sr = {
          ...sr, tilt: sr.tilt + e * 0.12, neck: sr.neck - e * 0.2,
          fistL: { x: lerp(sr.fistL.x, -1, e), y: lerp(sr.fistL.y, -54, e) },
          fistR: { x: lerp(sr.fistR.x, 5, e), y: lerp(sr.fistR.y, -56, e) },
        };
      }
      sr = hand(sr, xR, dR, 1, xR + 12 * dR, GETFIT_AT.y, 1 - st(0.24, 0.3));
      sr = hand(sr, xR, dR, 1, GETFIT_AT.x + GRIP, GETFIT_AT.y, st(0.03, 0.12) * (1 - st(0.22, 0.29)));
    }
    // b10: the pen off its string, Tuesday ringed, the pen let go
    const ringU = A_PLAN[n] ? st(0.17, 0.4) : n > 10 ? 1 : 0;
    if (A_PLAN[n]) {
      sr = hand(sr, xR, dR, 1, PEN_HANG.x, PEN_HANG.y + 4, st(0.02, 0.1) * (1 - st(0.1, 0.15)));
      const a = ringU * Math.PI * 2 - Math.PI / 2;
      // AP18: the pen going round Tuesday — the writing itself, paced by the line, not the clock.
      // The hand sits back from the pen's tip by the slant it is held at (PEN_TIP).
      const tip = { x: TUE.x + 3.6 * Math.cos(a) - PEN_TIP.x, y: TUE.y + 2.2 * Math.sin(a) - PEN_TIP.y };
      sr = hand(sr, xR, dR, 1, tip.x, tip.y, st(0.1, 0.16) * (1 - st(0.42, 0.47)));
      // and she lets go where she is: the pen swings back to hang on its string by
      // itself (no second stroke of the hand back to the hook, AR5)
    }
    const prevR = carryFrom(heldR, n, hHold(R_P[p], t));
    const figR = keepHeld(heldR, wr.walking ? mixKeepLegs(prevR, sr, tr) : mixStance(prevR, sr, tr));

    // ── her friend, on the bench with his newspaper ─────────────────────────
    const dP = 1;
    let sp = sitting(t);
    const nodP = carry(cv, 2, n, PL_NODS[n], PL_NODS[n], tr) * Math.max(0, Math.sin(t * 1.45));
    sp = { ...sp, neck: sp.neck + 0.2 * nodP, tilt: sp.tilt + 0.03 * nodP };
    // the paper: 0 up before his face · 1 lowered to his chest · 2 folded on his lap
    const paperNow = A_WISH[n] ? 0 : A_AGAIN[n] ? st(0.04, 0.3) : A_WHEN[n] ? 1 + st(0.18, 0.32) : n > 7 ? 2 : 1;
    const paperT = carry(cv, 3, n, paperNow, paperNow, tr);
    const foldNow = A_WHEN[n] ? st(0.04, 0.18) : n > 7 ? 1 : 0;
    const fold = carry(cv, 4, n, foldNow, foldNow, tr);
    const pc = paperT <= 1
      ? { x: lerp(PAPER_UP.x, PAPER_DOWN.x, paperT), y: lerp(PAPER_UP.y, PAPER_DOWN.y, paperT) }
      : { x: lerp(PAPER_DOWN.x, PAPER_LAP.x, paperT - 1), y: lerp(PAPER_DOWN.y, PAPER_LAP.y, paperT - 1) };
    const half = (PAPER.w / 2) * lerp(1, 0.5, fold) - 2;
    // his hands hold the paper's sides until he lets it rest on his lap (b7)
    const letGo = A_WHEN[n] ? st(0.3, 0.36) : n > 7 ? 1 : 0;
    sp = hand(sp, PL_X, dP, -1, pc.x - half, pc.y + 4, 1 - letGo);
    sp = hand(sp, PL_X, dP, 1, pc.x + half, pc.y + 4, 1 - letGo);
    // b7: the left wrist shown, and two taps on it
    if (A_WHEN[n]) {
      const show = st(0.34, 0.42);
      const tap = bp(0.46, 0.5, 0.56) + bp(0.6, 0.64, 0.7);
      sp = hand(sp, PL_X, dP, -1, PL_X + 15, 462, show);
      sp = hand(sp, PL_X, dP, 1, PL_X + 15, 457 - 3 * tap, st(0.38, 0.46));
    }
    const prevP = carryFrom(heldP, n, sitting(t));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));

    // ── the coach ───────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 5, n, T_OFF), T_LEGS[n], b, L);
    const xT = carry(cv, 5, n, wt.x, wt.x, 1);
    const dT = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, -1), T_TURN[n], b, L), 1);
    let stt = bodyOf(wt, T_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived, then a finger on her GET FIT! card
      const after = (0.02 * L + wt.dur) / L;
      stt = hand(stt, xT, dT, -1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.18));
      stt = hand(stt, xT, dT, -1, GETFIT_AT.x + GRIP, GETFIT_AT.y + 2, bp(0.52, 0.6, 0.86));
    }
    // b3: away down the track, then the stopwatch held up
    if (A_LAP[n]) {
      stt = hand(stt, xT, dT, -1, xT + 60 * dT, 478, bp(0.08, 0.16, 0.4));
      stt = hand(stt, xT, dT, 1, xT + 9 * dT, 440, bp(0.5, 0.6, 0.95));
    }
    // b6: RUN ONE LAP lifted off and pinned over GET FIT!, then a hand up a stair at a time
    const liftNow = A_STEP[n] ? st(0.18, 0.32) : n > 6 ? 1 : 0;
    const lift = carry(cv, 7, n, liftNow, liftNow, tr);
    if (A_STEP[n]) {
      stt = hand(stt, xT, dT, -1, RUNLAP_AT.x + GRIP, lerp(RUNLAP_AT.y, GETFIT_AT.y, lift), st(0.04, 0.14) * (1 - st(0.4, 0.5)));
      const stairs = st(0.6, 0.66) + st(0.72, 0.78) + st(0.84, 0.9);
      stt = hand(stt, xT, dT, -1, xT + 13 * dT, 474 - 8 * stairs, st(0.54, 0.6) * (1 - st(0.95, 1)));
    }
    // b8: across the board at the calendar, then an open hand to her
    if (A_WRITE[n]) {
      stt = hand(stt, xT, dT, -1, CAL.x, CAL.y, bp(0.08, 0.18, 0.52));
      stt = hand(stt, xT, dT, -1, xT + 18 * dT, 450, bp(0.55, 0.64, 0.9));
    }
    // b10–b11: the stopwatch raised and started as she sets off; up where he can watch it
    const watchUp = A_PLAN[n] ? st(0.4, 0.5) : n > 10 ? 1 : 0;
    if (watchUp > 0) stt = hand(stt, xT, dT, 1, xT + 9 * dT, 457 - 2 * (A_PLAN[n] ? bp(0.5, 0.53, 0.58) : 0), watchUp);
    const prevT = carryFrom(heldT, n, hHold(T_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const run = pose(figR, xR, GROUND, K, dR, 1);
    const pl = pose(figP, PL_X, GROUND, K, dP, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    // her card: 0 in her hand · 1 pinned
    const getNow = A_WISH[n] ? st(0.13, 0.17) : 1;
    const getT = carry(cv, 8, n, getNow, getNow, tr);
    const wR = wristOf(run, 'wrR');
    const getHeld = { x: wR.x + GRIP * dR, y: wR.y };
    // the pen: 0 hanging on its string · 1 in her hand
    const penNow = A_PLAN[n] ? st(0.08, 0.11) * (1 - st(0.41, 0.46)) : 0;
    const penT = carry(cv, 9, n, penNow, penNow, tr);
    const penAt = { x: lerp(PEN_HANG.x, wR.x + PEN_GRIP.x * dR, penT), y: lerp(PEN_HANG.y, wR.y + PEN_GRIP.y, penT) };
    // the stopwatch's hand: seconds since she set off
    const go = 0.56 * LINES[10];
    const sweepNow = A_PLAN[n] ? Math.max(0, b - go) : n > 10 ? LINES[10] - go + b : 0;
    const wT = wristOf(th, 'wrR');

    return {
      run, pl, th,
      getCard: { x: lerp(getHeld.x, GETFIT_AT.x, getT), y: lerp(getHeld.y, GETFIT_AT.y, getT), o: 1 },
      runCard: { x: RUNLAP_AT.x, y: lerp(RUNLAP_AT.y, GETFIT_AT.y, lift), o: 1 },
      pen: { x: penAt.x, y: penAt.y, o: 1, r: -PEN_SLANT * dR * penT },
      string: { x0: HOOK.x, y0: HOOK.y, x1: penAt.x, y1: penAt.y },
      ring: carry(cv, 10, n, ringU, ringU, tr),
      paper: { x: pc.x, y: pc.y, o: 1, sx: lerp(1, 0.5, fold), sy: lerp(1, 0.7, fold) },
      watch: { x: wT.x, y: wT.y, o: 1 },
      sweep: carry(cv, 11, n, sweepNow * 90, sweepNow * 90, tr),
      q1: carry(cv, 12, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 13, n, Q2[p], Q2[n], tr),
      rest: A_REST[n],
    };
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.run);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={TREE_ART} tone={TONE} />
      <ObjectArt parts={MAST_ART} tone={TONE} />
      <ObjectArt parts={VERGE_ART} tone={TONE} />
      <ObjectArt parts={TRACK_ART} tone={TONE} />
      {/* the board: a gabled cork board on two posts (growth3-board, drawn from references) */}
      <LessonPicture name="growth3-board" />
      <Healthier picked={picked} />
      <CalendarArt picked={picked} />
      <Ring S={SCENE} />
      <Cards S={SCENE} picked={picked} />
      <Pen S={SCENE} />
      <LessonPicture name="growth3-bench" />
      <Fx picked={picked} id="bottle" correct={false} at={BOTTLE}><ObjectArt parts={BOTTLE_ART} tone={TONE} /></Fx>
      <Fx picked={picked} id="bin" correct={false} at={BIN}><ObjectArt parts={BIN_ART} tone={TONE} /></Fx>
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {/* cast: bun */}
      <Stickman D={DR} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Paper S={SCENE} />
      <Watch S={SCENE} />
      {on(Q1) ? <GoalTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <PlaceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number; sx?: number; sy?: number };
// ── a tapped answer reacts on the stage, in the body of the thing tapped ─────
// RIGHT: it pops up off the board and lands with a small squash. WRONG: it shakes side to
// side and loses its swing, like something that was never going to fit (no glows, no colour).
function useFx(picked: string | null, id: string, correct: boolean) {
  const u = useSharedValue(0);
  useEffect(() => {
    u.value = 0;
    if (picked === id) u.value = withTiming(1, { duration: 900, easing: Easing.linear });
  }, [picked, id, u]);
  return useAnimatedStyle(() => {
    const v = u.value;
    if (v <= 0 || v >= 1) return { transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }, { scale: 1 }] };
    if (correct) {
      const up = v < 0.62 ? Math.sin((Math.PI * v) / 0.62) : 0;
      const squash = v >= 0.62 ? Math.sin((Math.PI * (v - 0.62)) / 0.38) : 0;
      return { transform: [{ translateX: 0 }, { translateY: -5 * up + 1.2 * squash }, { rotate: '0deg' }, { scale: 1 + 0.2 * up - 0.06 * squash }] };
    }
    const w = Math.sin(v * Math.PI * 7) * (1 - v);
    return { transform: [{ translateX: 3.4 * w }, { translateY: 0 }, { rotate: `${4 * w}deg` }, { scale: 1 }] };
  });
}
/** Wraps a thing drawn in stage coordinates so its reaction turns about its own middle. */
function Fx({ picked, id, correct, at, children }: {
  picked: string | null; id: string; correct: boolean; at: { x: number; y: number }; children: ReactNode;
}) {
  const st = useFx(picked, id, correct);
  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: `${at.x}px ${at.y}px` }, st]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
}
function Healthier({ picked }: { picked: string | null }) {
  return (
    <Fx picked={picked} id="healthier" correct={false} at={HEALTHIER_AT}>
      <ObjectArt parts={HEALTHIER_ART} tone={TONE} />
      <View style={[styles.cardPlate, { left: HEALTHIER_AT.x - CARD.w / 2, top: HEALTHIER_AT.y - CARD.h / 2 }]} pointerEvents="none">
        <Text style={styles.cardText}>Be healthier</Text>
      </View>
    </Fx>
  );
}
function CalendarArt({ picked }: { picked: string | null }) {
  return (
    <Fx picked={picked} id="calendar" correct at={CAL}>
      <ObjectArt parts={CAL_ART} tone={TONE} />
    </Fx>
  );
}

function Rider({ at, art, fx, children }: { at: SharedValue<At>; art: ReturnType<typeof goalCard>; fx?: any; children?: ReactNode }) {
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
      <Animated.View style={[styles.rider, fx]} pointerEvents="none">
        <ObjectArt parts={art} tone={TONE} />
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// ── the two cards that move: hers, and RUN ONE LAP lifted over it ───────────
function Cards({ S, picked }: { S: SharedValue<any>; picked: string | null }) {
  const fxGet = useFx(picked, 'getfit', false);
  const fxRun = useFx(picked, 'runlap', true);
  const getP = useDerivedValue<At>(() => S.value.getCard);
  const runP = useDerivedValue<At>(() => S.value.runCard);
  return (
    <>
      <Rider at={getP} art={GETFIT_ART} fx={fxGet}>
        <View style={[styles.cardPlate, styles.riderPlate]}><Text style={styles.cardText}>Get fit!</Text></View>
      </Rider>
      <Rider at={runP} art={RUNLAP_ART} fx={fxRun}>
        <View style={[styles.cardPlate, styles.riderPlate]}><Text style={styles.cardText}>Run one lap</Text></View>
      </Rider>
    </>
  );
}

// ── the pen on its string at the board's corner ─────────────────────────────
function Pen({ S }: { S: SharedValue<any> }) {
  const penP = useDerivedValue<At>(() => S.value.pen);
  const string = useAnimatedStyle(() => {
    const v = S.value.string;
    const dx = v.x1 - v.x0;
    const dy = v.y1 - v.y0;
    const len = Math.max(0.5, Math.hypot(dx, dy));
    return {
      width: len,
      transform: [{ translateX: v.x0 }, { translateY: v.y0 }, { rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.string, string]} pointerEvents="none" />
      <View style={styles.hook} pointerEvents="none" />
      <Rider at={penP} art={PEN_ART} />
    </>
  );
}

// ── Tuesday, ringed on the calendar ─────────────────────────────────────────
function Ring({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.ring;
    return { opacity: clamp01(u * 3), transform: [{ scale: lerp(0.4, 1, u) }, { rotate: `${-14 * (1 - u)}deg` }] };
  });
  return <Animated.View style={[styles.ring, st]} pointerEvents="none" />;
}

// ── her friend's newspaper ──────────────────────────────────────────────────
function Paper({ S }: { S: SharedValue<any> }) {
  const p = useDerivedValue<At>(() => S.value.paper);
  return <Rider at={p} art={PAPER_ART} />;
}

// ── the stopwatch on its cord, and its running hand ─────────────────────────
function Watch({ S }: { S: SharedValue<any> }) {
  const p = useDerivedValue<At>(() => S.value.watch);
  const handSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.sweep % 360}deg` }] }));
  return (
    <Rider at={p} art={WATCH_ART}>
      <Animated.View style={[styles.watchHand, handSt]} />
    </Rider>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three goal cards on the board. Their words are on them. RUN ONE LAP is the one. */
const GOAL_Q = [
  { id: 'healthier', at: HEALTHIER_AT, correct: false },
  { id: 'getfit', at: GETFIT_AT, correct: false },
  { id: 'runlap', at: RUNLAP_AT, correct: true },
];
function GoalTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {GOAL_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={2}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.at.x - CARD.w / 2, top: q.at.y - CARD.h / 2, width: CARD.w, height: CARD.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

/**
 * Q2: the calendar on the board, her water bottle and the bin, each carrying its name on
 * a plate at its foot, inside its target (AN1). The calendar is the one.
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean };
const PLACE_Q: Q[] = [
  { id: 'calendar', label: 'CALENDAR', pw: 56, left: 140, top: 453, w: 58, h: 41, correct: true },
  { id: 'bottle', label: 'BOTTLE', pw: 42, left: BOTTLE.x - 22, top: 474, w: 44, h: 38, correct: false },
  { id: 'bin', label: 'BIN', pw: 24, left: BIN.x - 13, top: 465, w: 26, h: 47, correct: false },
];
function PlaceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PLACE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <View style={[styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw }]}>
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
  cardPlate: {
    position: 'absolute', width: CARD.w, height: CARD.h, paddingTop: 4, alignItems: 'center',
  },
  riderPlate: { left: -CARD.w / 2, top: -CARD.h / 2 },
  cardText: {
    fontFamily: 'Caveat_700Bold', fontSize: 9.6, lineHeight: 11, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center',
  },
  string: {
    position: 'absolute', left: 0, top: 0, height: 0.7, borderRadius: 0.35, backgroundColor: INK, transformOrigin: '0% 50%',
  },
  hook: {
    position: 'absolute', left: HOOK.x - 1.2, top: HOOK.y - 1.2, width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: INK,
  },
  ring: {
    position: 'absolute', left: TUE.x - 6, top: TUE.y - 4, width: 12, height: 8, borderRadius: 4,
    borderWidth: 1.2, borderColor: NATURAL.penBlue.base,
  },
  watchHand: {
    position: 'absolute', left: -0.35, top: DIAL.y - DIAL.r * 0.75, width: 0.7, height: DIAL.r * 0.75, borderRadius: 0.35,
    backgroundColor: NATURAL.clockRed.base, transformOrigin: '50% 100%',
  },
  clear: { flexGrow: 1 },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 1, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1,
    borderColor: INK, paddingHorizontal: 2,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false,
  },
});

export function Growth3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth3Scene} band={[306, 514]} camera={CAM} />;
}
