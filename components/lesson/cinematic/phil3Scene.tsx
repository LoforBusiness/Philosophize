import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './phil3Script';
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
  tint, note, noticeBoard, libDesk, libBookcase, foundSign, dateStamp, bookStack, novelOpen, novelLeaf,
  lostPoster, pushpin, flyer, boxBack, boxFront, FOUND_FACE, STAMP_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-3, "How Do We Decide What’s Right?" — A LIBRARY RETURNS DESK.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. A reader (the bun) finds a twenty-pound note
// in the novel she is returning; the librarian (the cap) worries for whoever lost it;
// the philosopher (the top hat) shows the two main ways of deciding what is right.
//
//   b0   the reader, at the desk, turns a leaf of the open novel in her hand; the
//        purple note slides out into her other hand and she holds it up to the light,
//        then lays the novel open on the desk. The librarian stamps the returned books.
//   b1   the librarian looks up, a hand to his chest; he sets his stamp on the books,
//        turns, takes a notice off the desk, walks to the noticeboard, pins it (LOST)
//        and walks back.
//   b2   the philosopher walks in from the left, stops by the lost property box and
//        tips his hat; the reader turns to him.
//   b3   he holds both hands out like a pair of scales — one up on "help", the other up
//        on "harm".
//   b4   Q1: the LOST poster, the novel and the stamp — tap one.
//   b5   the reader hugs the note to her chest and twirls round.
//   b6   the philosopher points up at the FOUND PROPERTY sign, then at her note.
//   b7   the librarian lifts his stamp, raises it to the sign, taps the desk with it on
//        "front desk" and sets it back on the books; the reader turns to him.
//   b8   the philosopher holds his hands out level and brings them together.
//   b9   Q2: the FOUND PROPERTY sign, the LOST poster and the box — tap one.
//   b10  the reader steps to the box, drops the note in with a sigh and waves it off.
//   b11  everyone at ease under the quotation.
//
// COMPOSITION, in stage units. The BOOKCASE stands at the left, 5–51 × 360–500; the
// PHILOSOPHER stops at 84, clear of it, beside the LOST PROPERTY BOX on the floor,
// 108–172 × 462–500 (front 110–164, its label plate 112–162 × 476–498, mouth at 474).
// The READER stands at 186, the RETURNS DESK runs 196–320 × 476–500 (its top at her hip,
// AP10), the LIBRARIAN behind it at 296. On the desk: the novel laid open at 212, the
// stack of returned books 253–283 (top at 462) with the date stamp standing on it at
// 273, the notice at 312. The FOUND PROPERTY sign hangs over the desk on two chains,
// 210–270 × 376–406 (its face 214–266). The NOTICEBOARD is on the wall at the right,
// 330–390 × 396–456; the LOST poster is pinned at 336–364 × 415–449, the librarian
// pinning it from 324. Every hand that takes or lays a thing is within the rig's safe
// reach (~23 units from the shoulder at K 0.76). Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners nod along with still hands (AP18), and every hand that moves
// is reaching, holding, carrying, pointing or stamping.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, philosophy-foundations-3); 0 for a beat with no voice.
 */
const LINES = [4.84, 4.79, 4.7, 5.18, 0, 4.28, 5.98, 3.73, 6.85, 0, 5.13, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// waiting; and one PLAYED action (299 + act 56, the sigh) for the reader's goodbye.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const WAIT = 161;
const SIGH = 355;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_FIND = is('find');
const A_WORRY = is('worry');
const A_ARRIVE = is('arrive');
const A_WEIGH = is('weigh');
const A_HAPPY = is('happy');
const A_RULE = is('rule');
const A_SIGN = is('sign');
const A_AGREE = is('agree');
const A_HAND = is('hand');
const Q1 = BEATS.map((b) => (b.harm ? 1 : 0));
const Q2 = BEATS.map((b) => (b.duty ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and never before that. A turn is
// [fraction, facing]; it eases through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const BN_LEGS: Track[] = [
  [[0, 186]], [[0, 186]], [[0, 186]], [[0, 186]], [[0, 186]], [[0, 186]], [[0, 186]],
  [[0, 186]], [[0, 186]], [[0, 186]], [[0.04, 180]], [[0, 180]], [[0, 180]],
];
/** The reader faces the librarian, then the philosopher once he is in; b5 is the twirl. */
const BN_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0.3, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.3, 1], [0.44, -1]], [[0, -1]],
  [[0.04, 1]], [[0.04, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The librarian steps out to the noticeboard and back on b1, and stays behind his desk. */
const CP_LEGS: Track[] = [
  [[0, 296]], [[0.48, 324], [0.82, 296]], [[0, 296]], [[0, 296]], [[0, 296]], [[0, 296]], [[0, 296]],
  [[0, 296]], [[0, 296]], [[0, 296]], [[0, 296]], [[0, 296]], [[0, 296]],
];
const CP_TURN: Track[] = [
  [[0, -1]], [[0, -1], [0.36, 1], [0.8, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The philosopher is off the stage, left, until he walks in on b2. */
const TH_LEGS: Track[] = [
  [[0, -60]], [[0, -60]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]],
  [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]], [[0, 84]],
];
const TH_TURN: Track[] = BEATS.map(() => [[0, 1]]);
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const BN_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, SIGH, WAIT, NOD];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, WAIT, NOD];
const CP_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, WAIT, NOD];

// ── the library ─────────────────────────────────────────────────────────────
const DESK = { x: 258, w: 124 };
/** The stack of returned books, and the stamp standing on it (held by its handle). */
const STACK = { x: 268, y: 469 };
const STAMP_W = 8;
const STAMP_H = 16;
const STAMP_DROP = ((10 - STAMP_GRIP.y) * STAMP_H) / 20;        // grip → the stamp's middle
const STAMP_FOOT = ((20 - STAMP_GRIP.y) * STAMP_H) / 20;        // grip → its rubber foot
const STAMP_ON = { x: 273, y: 462.2 - STAMP_FOOT };             // the grip, stood on the books
/** The novel: in her hand it is held by its near edge; on the desk it lies open. */
const NOVEL_W = 24;
const NOVEL_H = 14.8;
const NOVEL_DESK = { x: 212, y: 472.4 };
const NOVEL_LIE = 0.45;                                          // how flat it lies on the desk
const LEAF_DX = (6 * NOVEL_W) / 26;                              // gutter → the leaf's middle
/** The LOST notice: on the desk, in his hand, then pinned to the board. */
const POSTER_W = 28;
const POSTER_H = 34;
const POSTER_DESK = { x: 312, y: 472.6 };
const POSTER_BOARD = { x: 350, y: 432 };
const PIN_BOARD = { x: 350, y: 417.4 };
/** Where the note lands in the lost property box, behind its front. */
const BOX = { x: 140, y: 481, w: 64, h: 38 };
const IN_BOX = { x: 150, y: 482 };
/** The sign over the desk, and the face its words are on. */
const SIGN = { x: 240, y: 356, w: 60, h: 100 };
const FACE = {
  left: SIGN.x + ((FOUND_FACE.x - FOUND_FACE.w / 2 - 50) * SIGN.w) / 100 + 0.6,
  top: SIGN.y + ((FOUND_FACE.y - FOUND_FACE.h / 2 - 50) * SIGN.h) / 100,
  w: FOUND_FACE.w - 1.2,
  h: (FOUND_FACE.h * SIGN.h) / 100,
};
const SIGN_AT = { x: SIGN.x, y: FACE.top + FACE.h / 2 };

const DESK_ART = libDesk(DESK.x, 488, DESK.w, 24);
const CASE_ART = libBookcase(28, 430, 46, 140);
const SIGN_ART = foundSign(SIGN.x, SIGN.y, SIGN.w, SIGN.h);
const BOARD_ART = noticeBoard(360, 426, 60, 60);
const FLYER_A = flyer(356, 406.5, 14, 16);
const FLYER_B = flyer(377, 428, 14, 18);
const PIN_A = pushpin(356, 399.6, 4, 4);
const PIN_B = pushpin(377, 420, 4, 4);
const STACK_ART = bookStack(STACK.x, STACK.y, 30, 14);
const BOX_BACK_ART = boxBack(BOX.x, BOX.y, BOX.w, BOX.h);
const BOX_FRONT_ART = boxFront(BOX.x, BOX.y, BOX.w, BOX.h);
// The things that move are drawn about the point they are held or turned by.
const STAMP_ART = dateStamp(0, STAMP_DROP, STAMP_W, STAMP_H);
const NOVEL_ART = novelOpen(0, 0, NOVEL_W, NOVEL_H);
const LEAF_ART = novelLeaf(LEAF_DX, 0, (12 * NOVEL_W) / 26, (12.4 * NOVEL_H) / 16);
const POSTER_ART = lostPoster(0, 0, POSTER_W, POSTER_H);
const PIN_ART = pushpin(0, 0, 5, 5);
const NOTE_ART = tint(note(0, 0, 18, 10), 'twenty');

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
 * left him, so a tap mid-walk cannot put him anywhere in one frame (group L). A leg
 * starts at its time or when the leg before it has finished, whichever is later.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  let first = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (k === 0) first = start + dur;
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, first };
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

const CAM = followMoves(BN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('philosophy'));

export default function Phil3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(13);
  const on = useLinger(i);
  const RX = { picked, qk: Q1[i] === 1 ? ('q1' as const) : Q2[i] === 1 ? ('q2' as const) : null };
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

    // ── the reader ──────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, BN_LEGS[0][0][1]), BN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P, n, t, b);
    if (A_FIND[n]) {
      // her right hand holds the novel open to read, then lays it on the desk
      const r = 1 - st(0.76, 0.9);
      sb = hand(sb, xB, dB, 1, xB + 12 * dB, 452, r);
      sb = hand(sb, xB, dB, 1, NOVEL_DESK.x - 9, NOVEL_DESK.y - 1.4, st(0.58, 0.7) * r);
      // her left hand catches the note under the book, then holds it up to the light
      sb = hand(sb, xB, dB, -1, xB + 14 * dB, 465, st(0.12, 0.22));
      sb = hand(sb, xB, dB, -1, xB + 9 * dB, 431, st(0.42, 0.56));
    } else if (n >= 1 && n <= 9) {
      // the note held in front of her at her waist, still and close (AP18, AR6)
      sb = hand(sb, xB, dB, -1, xB + 7 * dB, 462, 1);
      if (A_HAPPY[n]) {
        // hugged to her chest with both hands while she twirls round
        sb = hand(sb, xB, dB, -1, xB + 3 * dB, 456, st(0.04, 0.14));
        sb = hand(sb, xB, dB, 1, xB + 5 * dB, 459, bp(0.04, 0.14, 0.66));
      }
    } else if (A_HAND[n]) {
      // to the box, the note let go into it, and a little wave goodbye
      const r = 1 - st(0.88, 0.98);
      const wave = 3.5 * bp(0.68, 0.73, 0.8);                      // one small flick goodbye (AR5)
      sb = hand(sb, xB, dB, -1, xB + 7 * dB, 462, r);
      sb = hand(sb, xB, dB, -1, 160, 466, st(0.16, 0.34) * r);
      sb = hand(sb, xB, dB, -1, xB + 10 * dB + wave, 438, st(0.56, 0.66) * r);
    }
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the librarian, behind his desk ──────────────────────────────────────
    const wc = legsOf(carrySource(cv, 2, n, CP_LEGS[0][0][1]), CP_LEGS[n], b, L);
    const xC = carry(cv, 2, n, wc.x, wc.x, 1);
    const dC = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b);
    if (A_FIND[n]) {
      // stamping the returned books: the stamp comes down on the top one twice (AR5)
      const hit = bp(0.12, 0.18, 0.26) + bp(0.5, 0.56, 0.64);
      sc = hand(sc, xC, dC, 1, STAMP_ON.x, STAMP_ON.y - 8 * (1 - hit), 1);
    }
    if (A_WORRY[n]) {
      // the stamp set down on the books
      sc = hand(sc, xC, dC, 1, STAMP_ON.x, STAMP_ON.y - 8 + 8 * st(0.16, 0.24), 1 - st(0.28, 0.36));
      // a hand to his chest
      sc = hand(sc, xC, dC, -1, xC + 3 * dC, 450, bp(0.03, 0.12, 0.36));
      // turned to the board: the notice off the desk, carried, pinned up
      const r = 1 - st(0.78, 0.86);
      sc = hand(sc, xC, dC, 1, POSTER_DESK.x, POSTER_DESK.y - 1.6, st(0.4, 0.46) * r);
      sc = hand(sc, xC, dC, 1, xC + 9 * dC, 458, st(0.48, 0.54) * r);
      sc = hand(sc, xC, dC, 1, POSTER_BOARD.x - 8, POSTER_BOARD.y + 5, st(0.66, 0.74) * r);
    }
    if (A_SIGN[n]) {
      // the stamp lifted, raised to the sign, tapped on the desk, and set back
      const r = 1 - st(0.93, 1);
      const tap = bp(0.34, 0.38, 0.42) + bp(0.44, 0.48, 0.52);
      const desk = bp(0.68, 0.71, 0.74);
      sc = hand(sc, xC, dC, 1, STAMP_ON.x, STAMP_ON.y, st(0.02, 0.1) * r);
      sc = hand(sc, xC, dC, 1, SIGN_AT.x + 10, SIGN_AT.y + 16 + 5 * tap, st(0.16, 0.3) * r);
      sc = hand(sc, xC, dC, 1, 282, 476 - STAMP_FOOT - 6 * (1 - desk), st(0.58, 0.66) * r);
      sc = hand(sc, xC, dC, 1, STAMP_ON.x, STAMP_ON.y, st(0.82, 0.9) * r);
    }
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 4, n, -60), TH_LEGS[n], b, L);
    const xT = carry(cv, 4, n, wt.x, wt.x, 1);
    const dT = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived
      const after = wt.first / L;
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.2));
    }
    if (A_WEIGH[n]) {
      // both hands out IN FRONT of him like the two pans of a pair of scales, one
      // further out than the other (AR4: never one thrown behind his back): the far one
      // up on "help", then down on "harm"
      const out = st(0.08, 0.2);
      const tilt = st(0.45, 0.6) - 2 * st(0.74, 0.88);
      stt = hand(stt, xT, dT, 1, xT + 20 * dT, 447 - 6 * tilt, out);
      stt = hand(stt, xT, dT, -1, xT + 9 * dT, 447 + 6 * tilt, out);
    }
    if (A_RULE[n]) {
      // up at the sign over the desk, then at the note in her hand
      stt = hand(stt, xT, dT, 1, SIGN_AT.x, SIGN_AT.y, bp(0.06, 0.16, 0.5));
      stt = hand(stt, xT, dT, 1, xB - 6, 452, bp(0.58, 0.68, 0.95));
    }
    if (A_AGREE[n]) {
      // the two hands out level, and brought together
      const out = st(0.04, 0.16);
      const join = st(0.42, 0.6);
      stt = hand(stt, xT, dT, 1, xT + lerp(20, 14, join) * dT, 448, out);
      stt = hand(stt, xT, dT, -1, xT + lerp(8, 12, join) * dT, 448.6, out);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const bn = pose(figB, xB, GROUND, K, dB, 1);
    const cp = pose(figC, xC, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    // noteT  0 inside the novel · 1 in her left hand · 2 in the box
    const noteNow = A_FIND[n] ? st(0.2, 0.32) : A_HAND[n] ? 1 + st(0.38, 0.5) : n > 10 ? 2 : 1;
    const noteT = carry(cv, 6, n, noteNow, noteNow, tr);
    // novelT 0 in her right hand · 1 lying open on the desk; pageU the leaf she turns
    const novelNow = A_FIND[n] ? st(0.66, 0.72) : 1;
    const novelT = carry(cv, 7, n, novelNow, novelNow, tr);
    const pageNow = A_FIND[n] ? st(0.06, 0.2) : 1;
    const pageU = carry(cv, 8, n, pageNow, pageNow, tr);
    // stampT 0 in his hand · 1 standing on the books
    const stampNow = A_FIND[n] ? 0 : A_WORRY[n] ? st(0.24, 0.28) : A_SIGN[n] ? 1 - st(0.08, 0.12) + st(0.88, 0.92) : 1;
    const stampT = carry(cv, 9, n, stampNow, stampNow, tr);
    // posterT 0 on the desk · 1 in his hand · 2 pinned on the board
    const posterNow = A_FIND[n] ? 0 : A_WORRY[n] ? st(0.44, 0.48) + st(0.72, 0.76) : 2;
    const posterT = carry(cv, 10, n, posterNow, posterNow, tr);

    const wBR = wristOf(bn, 'wrR');
    const wBL = wristOf(bn, 'wrL');
    const wCR = wristOf(cp, 'wrR');
    const dBs = dB < 0 ? -1 : 1;
    const dCs = dC < 0 ? -1 : 1;

    const inHand = { x: wBR.x + 9 * dBs, y: wBR.y + 1 };
    const novel = {
      x: lerp(inHand.x, NOVEL_DESK.x, novelT), y: lerp(inHand.y, NOVEL_DESK.y, novelT),
      o: 1, sy: lerp(1, NOVEL_LIE, novelT),
    };
    const leaf = { x: novel.x, y: novel.y + 0.18 * novel.sy, o: 1, sx: 1 - 2 * pageU, sy: novel.sy };
    const held = { x: wBL.x + 4 * dBs, y: wBL.y - 1 };
    let noteAt: { x: number; y: number };
    if (noteT <= 1) noteAt = { x: lerp(novel.x + 2, held.x, noteT), y: lerp(novel.y, held.y, noteT) };
    else noteAt = { x: lerp(held.x, IN_BOX.x, noteT - 1), y: lerp(held.y, IN_BOX.y, noteT - 1) };
    const noteO = clamp01(noteT * 6) * (1 - clamp01((noteT - 1.8) / 0.2));
    const stampAt = {
      x: lerp(wCR.x, STAMP_ON.x, stampT), y: lerp(wCR.y, STAMP_ON.y, stampT), o: 1,
    };
    const carried = { x: wCR.x + 8 * dCs, y: wCR.y - 5 };
    let posterAt: { x: number; y: number };
    if (posterT <= 1) posterAt = { x: lerp(POSTER_DESK.x, carried.x, posterT), y: lerp(POSTER_DESK.y, carried.y, posterT) };
    else posterAt = { x: lerp(carried.x, POSTER_BOARD.x, posterT - 1), y: lerp(carried.y, POSTER_BOARD.y, posterT - 1) };
    const posterSy = lerp(0.2, 1, clamp01(posterT));

    return {
      bn, cp, th,
      novel, leaf,
      note: { x: noteAt.x, y: noteAt.y, o: noteO },
      stamp: stampAt,
      poster: { x: posterAt.x, y: posterAt.y, o: 1, sy: posterSy },
      posterWords: clamp01((posterSy - 0.7) / 0.25),
      pin: clamp01((posterT - 1.85) / 0.15),
      q1: carry(cv, 11, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 12, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={CASE_ART} tone={TONE} />
      <Reply id="sign" ox={240} oy={356} {...RX}>
        <ObjectArt parts={SIGN_ART} tone={TONE} />
        <View style={styles.signFace} pointerEvents="none">
          <Text style={styles.signText}>FOUND</Text>
          <Text style={styles.signText}>PROPERTY</Text>
        </View>
      </Reply>
      <ObjectArt parts={BOARD_ART} tone={TONE} />
      <ObjectArt parts={FLYER_A} tone={TONE} />
      <ObjectArt parts={FLYER_B} tone={TONE} />
      <ObjectArt parts={PIN_A} tone={TONE} />
      <ObjectArt parts={PIN_B} tone={TONE} />
      <Reply id="poster" ox={350} oy={449} {...RX}><Poster S={SCENE} /></Reply>
      <Reply id="box" ox={140} oy={500} {...RX}><ObjectArt parts={BOX_BACK_ART} tone={TONE} /></Reply>
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <ObjectArt parts={DESK_ART} tone={TONE} />
      <ObjectArt parts={STACK_ART} tone={TONE} />
      <Reply id="stamp" ox={273} oy={462} {...RX}><Stamp S={SCENE} /></Reply>
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Reply id="novel" ox={212} oy={480} {...RX}><Novel S={SCENE} /></Reply>
      <Note S={SCENE} />
      <Reply id="box" ox={140} oy={500} {...RX}>
        <ObjectArt parts={BOX_FRONT_ART} tone={TONE} />
        <View style={styles.boxLabel} pointerEvents="none">
          <Text style={styles.labelText}>LOST</Text>
          <Text style={styles.labelText}>PROPERTY</Text>
        </View>
      </Reply>
      {on(Q1) ? <HarmTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <DutyTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the answer lands on the object itself ────────────────────────────────────
/**
 * A tapped thing answers with its body. The right one hops twice and settles with a
 * squash on each landing; the wrong one is rattled side to side. After a wrong pick the
 * right one gives one small hop too, so the reader sees what it was.
 */
const RIGHT: Record<string, string> = { q1: 'poster', q2: 'sign' };
function Reply({ id, qk, picked, ox, oy, children }: {
  id: string; qk: 'q1' | 'q2' | null; picked: string | null; ox: number; oy: number; children: React.ReactNode;
}) {
  const t = useSharedValue(0);
  const mode = !qk || picked === null ? 0 : picked === id ? (RIGHT[qk] === id ? 1 : 2) : RIGHT[qk] === id ? 3 : 0;
  useEffect(() => {
    t.value = 0;
    if (mode) t.value = withDelay(mode === 3 ? 520 : 0, withTiming(1, { duration: mode === 3 ? 520 : 760, easing: Easing.linear }));
  }, [mode, t]);
  const st = useAnimatedStyle(() => {
    const u = t.value;
    if (mode === 1 || mode === 3) {
      const a = mode === 1 ? 2 : 1;
      const w = Math.abs(Math.sin(u * Math.PI * a));
      const sq = Math.sin(u * Math.PI);
      return { transform: [{ translateY: -6 * w * (1 - u) }, { scaleY: 1 - 0.07 * (1 - w) * sq }, { scaleX: 1 + 0.05 * (1 - w) * sq }] };
    }
    if (mode === 2) {
      const sh = Math.sin(u * Math.PI * 7) * (1 - u);
      return { transform: [{ translateX: 3.5 * sh }, { rotate: (0.05 * sh) + 'rad' }] };
    }
    return { transform: [{ translateX: 0 }] };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: ox + 'px ' + oy + 'px' }, st]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

// ── riders: a thing drawn about the point it is held or turned by ───────────

type At = { x: number; y: number; o: number; sx?: number; sy?: number };
function useRide(at: SharedValue<At>) {
  return useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
}
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof note> }) {
  const st = useRide(at);
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function Novel({ S }: { S: SharedValue<any> }) {
  const novelP = useDerivedValue<At>(() => S.value.novel);
  const leafP = useDerivedValue<At>(() => S.value.leaf);
  return (
    <>
      <Rider at={novelP} art={NOVEL_ART} />
      <Rider at={leafP} art={LEAF_ART} />
    </>
  );
}
function Note({ S }: { S: SharedValue<any> }) {
  const noteP = useDerivedValue<At>(() => S.value.note);
  return <Rider at={noteP} art={NOTE_ART} />;
}
function Stamp({ S }: { S: SharedValue<any> }) {
  const stampP = useDerivedValue<At>(() => S.value.stamp);
  return <Rider at={stampP} art={STAMP_ART} />;
}

// ── the LOST notice: on the desk, carried, pinned; its words and its pin ────
function Poster({ S }: { S: SharedValue<any> }) {
  const posterP = useDerivedValue<At>(() => S.value.poster);
  const st = useRide(posterP);
  const words = useAnimatedStyle(() => ({ opacity: S.value.posterWords }));
  const pinP = useDerivedValue<At>(() => ({ x: PIN_BOARD.x, y: PIN_BOARD.y, o: S.value.pin }));
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <ObjectArt parts={POSTER_ART} tone={TONE} />
        <Animated.View style={[styles.posterWords, words]}>
          <Text style={styles.posterHead}>LOST</Text>
          <Text style={styles.posterSum}>£20</Text>
        </Animated.View>
      </Animated.View>
      <Rider at={pinP} art={PIN_ART} />
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6). Every choice is a thing that carries
 * its own words or is plainly itself — the LOST poster, the novel, the stamp; the
 * FOUND PROPERTY sign, the poster, the LOST PROPERTY box — so a ring round it is the
 * whole choice. No two live targets touch (AN4).
 */
type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
const POSTER_Q = { left: 334, top: 413, w: 32, h: 38, r: 3 };
/** Q1: judged by consequences, the LOST poster — somebody is out twenty pounds. */
const HARM_Q: Q[] = [
  { id: 'poster', ...POSTER_Q, correct: true },
  { id: 'novel', left: 198, top: 463, w: 28, h: 16, r: 3, correct: false },
  { id: 'stamp', left: 263, top: 443, w: 20, h: 22, r: 4, correct: false },
];
/** Q2: the rule, whatever happens next, is the FOUND PROPERTY sign. */
const DUTY_Q: Q[] = [
  { id: 'sign', left: 208, top: 374, w: 64, h: 34, r: 4, correct: true },
  { id: 'poster', ...POSTER_Q, correct: false },
  { id: 'box', left: 106, top: 460, w: 68, h: 41, r: 4, correct: false },
];
function HarmTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={HARM_Q} k="q1" />;
}
function DutyTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={DUTY_Q} k="q2" />;
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
  signFace: {
    position: 'absolute', left: FACE.left, top: FACE.top, width: FACE.w, height: FACE.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.6, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  posterWords: {
    position: 'absolute', left: -POSTER_W / 2 + 1, top: -POSTER_H / 2 + 2, width: POSTER_W - 2, height: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  posterHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  posterSum: {
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: INK, includeFontPadding: false,
    alignSelf: 'stretch', textAlign: 'center',
  },
  boxLabel: {
    position: 'absolute', left: 111, top: 476, width: 52, height: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    boxShadow: '0 1.5px 0 ' + lipOf(TONE),
  },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.2, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
});

export function Phil3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil3Scene} band={[306, 514]} camera={CAM} />;
}
