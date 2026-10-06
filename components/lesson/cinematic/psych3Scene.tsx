import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './psych3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, seated, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { NATURAL, MUG3_GRIP } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-3, "Why We See What We Expect" — A MUSEUM GALLERY, A CHIPPED
// MUG UNDER GLASS, AND A GRAND LABEL.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates. The
// visitor in the cap admires a "royal cup" in a showcase; the gallery attendant (plain)
// knows it is his own tea mug; the psychologist (the top hat) walks in and shows how a
// label sets what you see before you look.
//
//   b0   the visitor leans in to the showcase, hands clasped at his waist, and peers; the
//        attendant sits on his stool under the window and nods along.
//   b1   the attendant gets up, points at his mug, and walks round behind the plinth.
//   b2   the psychologist walks in from the right, tips his hat, and taps his temple
//        on "what you expect"; the attendant turns to him.
//   b3   he points at the grand label on "a label", and again on "this label said royal".
//   b4   Q1: the label, the mug and the window — tap one.
//   b5   he takes a card out of his coat and lays it over the label; the visitor
//        straightens up, points at the mug and tilts his head.
//   b6   he points at the covered label, then opens a hand to the visitor; the visitor
//        leans in to look again.
//   b7   the attendant reaches into the showcase from behind, lifts the mug out and turns
//        it over: the sticker on its foot, held out to the visitor.
//   b8   the psychologist points at the sticker, then at the covered label.
//   b9   Q2: the sticker, the label and the glass case — tap one.
//   b10  the visitor leans in for a last look, turns and strolls off, then looks back;
//        the attendant turns the mug the right way up and sets it back in the case.
//   b11  the quotation; everyone at ease.
//
// COMPOSITION, in stage units. The back wall: a painting in a gilt frame 32–96 × 347–397
// on the left, a round-headed window 299–363 × 328–416 on the right, a skirting board
// along its foot. Under the window the attendant's stool 323–349 × 486–500 (he sits at
// 336). Centre stage the white plinth 150–250 × 474–500 — its top at a figure's HIP,
// which is where a counter goes in this app (econ1) — carrying the showcase 154–196 ×
// 446–474 with the mug inside it (18 × 16, body at 173, handle 182.4), and beside it the brass
// label 203–249 × 448–472 on its stand. The visitor stands at 104, the attendant BEHIND
// the plinth at 168 (it hides him below the hip, as the stall hides econ1's
// stall-holder), and the psychologist at 272. Every hand meets what it handles within
// the rig's safe reach (~23 units from the shoulder at K 0.76): the mug's handle is 21
// from the attendant's shoulder, the label's near end 21 from the psychologist's.
// Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he talks
// to, the listeners nod along (N21), and no hand moves unless the scene moves it (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, psychology-foundations-3), except where the action needs
 * longer and runs on after it — b1 (the walk round behind the plinth), b5 (the card),
 * b7 (the mug out of the case) and b10 (the stroll away).
 */
const LINES = [6.17, 4.8, 6.36, 6.77, 0, 4.4, 6.08, 4.2, 5.52, 0, 5.2, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// waiting.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const WAIT = 161;
/** The stool's seat, as the rig's pelvis height. */
const SEAT_H = 24;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ADMIRE = is('admire');
const A_MINE = is('mine');
const A_ARRIVE = is('arrive');
const A_LABEL = is('label');
const A_PLAIN = is('plain');
const A_AGAIN = is('again');
const A_STICKER = is('sticker');
const A_CHECK = is('check');
const A_LEAVE = is('leave');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.told ? 1 : 0));
const Q2 = BEATS.map((b) => (b.look ? 1 : 0));
const COVER = BEATS.map((b) => b.cover ?? 0);
const MUG = BEATS.map((b) => b.mug ?? 0);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const V_X = 104;
const V_OUT = 70;
const A_X0 = 336;
const A_X = 168;
const P_X0 = 440;
const P_X = 272;
const VIS_LEGS: Track[] = BEATS.map((_, n) => (
  n < 10 ? [[0, V_X]] : n === 10 ? [[0.38, V_OUT]] : [[0, V_OUT]]
));
const VIS_TURN: Track[] = BEATS.map((_, n) => (n === 10 ? [[0, 1], [0.32, -1], [0.62, 1]] : [[0, 1]]));
const ATT_LEGS: Track[] = BEATS.map((_, n) => (n === 0 ? [[0, A_X0]] : n === 1 ? [[0.36, A_X]] : [[0, A_X]]));
/**
 * He faces the visitor, turns to the psychologist when he walks in, and back for the mug.
 * The mug stands in the case to his RIGHT, so he turns to it to lift it out (b7) and to
 * put it back (b10), and turns back to the visitor with it: a thing is taken and set down
 * in front of him, never reached for behind his back (AR4).
 */
const ATT_TURN: Track[] = BEATS.map((_, n) => (
  n < 2 ? [[0, -1]] : n === 2 ? [[0, -1], [0.5, 1]] : n < 7 ? [[0, 1]]
    : n === 7 ? [[0, 1], [0.4, -1]] : n === 10 ? [[0, -1], [0.08, 1], [0.6, -1]] : [[0, -1]]
));
/** The psychologist is off the stage, right, until he walks in on b2. */
const PSY_LEGS: Track[] = BEATS.map((_, n) => (n < 2 ? [[0, P_X0]] : [[0, P_X]]));
/** What each is doing with his body: talking while he speaks, nodding while he listens. */
const VIS_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, TALK, WAIT, LISTEN];
const ATT_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, WAIT, LISTEN];
const PSY_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, WAIT, LISTEN];

// ── the gallery ──────────────────────────────────────────────────────────────
const PLINTH = { x: 200, y: 487, w: 100, h: 26 };
const CASE = { x: 175, y: 460, w: 42, h: 28 };
/** The mug, 18 × 16 (its drawing is authored 16 × 14), body at 173 on the plinth's top. */
const MUG_W = 18;
const MUG_H = 16;
const MUG_BOX = { left: 166, top: 458 };
/** Its handle, where the attendant's hand takes it, and the point the mug is drawn about. */
const GRIP = { x: (MUG3_GRIP.x * MUG_W) / 16, y: (MUG3_GRIP.y * MUG_H) / 14 };
const MUG_REST = { x: MUG_BOX.left + GRIP.x, y: MUG_BOX.top + GRIP.y };
const MUG_BODY = { x: 173, y: 466 };
/** Out of the case: up over its top, then held out to the visitor. */
const MUG_UP = { x: 172, y: 440 };
const MUG_SHOW = { x: 150, y: 438 };
/** The underside's art, 22 × 17 (authored 18 × 14), drawn about the handle's end. */
const BASE_W = 22;
const BASE_H = 17;
const BASE_END = (17 * BASE_W) / 18;
/** The sticker on the mug's foot, held out (the disc's centre). */
const STICK = { x: MUG_SHOW.x - BASE_END + (7 * BASE_W) / 18, y: 438 };
/** The label: its brass plate and its foot. */
const LABEL = { left: 203, top: 448, w: 46, h: 24 };
const LABEL_C = { x: LABEL.left + LABEL.w / 2, y: LABEL.top + LABEL.h / 2 };
/** The card, laid over the label, held by its right-hand end. */
const CARD_W = 48;
const CARD_H = 26;
const LAY = { x: 250, y: 460 };


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
/** The attendant on his stool. Still (AL1): his life is in his head. */
function sitting(t: number): Stance {
  'worklet';
  return seated(SEAT_H, t, 18);
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn, from WHERE HE
 * IS ON SCREEN (`src`, out of the carry), so a tap mid-walk cannot put him anywhere in
 * one frame (group L).
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

const CAM = followMoves(VIS_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('psychology'));

export default function Psych3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldV = useHeld();
  const heldA = useHeld();
  const heldP = useHeld();
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

    // ── the visitor in the cap ──────────────────────────────────────────────
    const wv = legsOf(carrySource(cv, 0, n, V_X), VIS_LEGS[n], b, L);
    const xV = carry(cv, 0, n, wv.x, wv.x, 1);
    const dV = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), VIS_TURN[n], b, L), 1);
    // how far he leans in to the glass: in on b0, up on b5, in again to look again on
    // b6, half up as the mug comes out on b7, one last look on b10
    const leanNow = A_ADMIRE[n] ? st(0.04, 0.28)
      : n < 5 ? 1
        : A_PLAIN[n] ? 1 - st(0.06, 0.26)
          : A_AGAIN[n] ? 0.7 * st(0.36, 0.56)
            : A_STICKER[n] ? 0.7 - 0.4 * st(0.46, 0.66)
              : n < 10 ? 0.3
                : A_LEAVE[n] ? (0.3 + 0.5 * bp(0.02, 0.14, 0.3)) * (1 - st(0.26, 0.36)) : 0;
    const lean = carry(cv, 2, n, leanNow, leanNow, tr);
    // his hands come together in front of him on b0, clasped at his waist as he peers,
    // and stay there but for the point on b5 (never behind his back: AR4)
    const backNow = A_ADMIRE[n] ? st(0.02, 0.2) : 1;
    const back = carry(cv, 3, n, backNow, backNow, tr);
    let sv = bodyOf(wv, VIS_P, n, t, b);
    const cock = A_PLAIN[n] ? bp(0.64, 0.72, 0.94) : 0;
    // on the quote, by the door: one more look back over at the cup, as he said he would
    const fond = A_REST[n] ? bp(0.1, 0.3, 0.75) : 0;
    sv = { ...sv, tilt: sv.tilt - 0.34 * lean - 0.12 * fond, neck: sv.neck - 0.2 * lean + 0.26 * cock - 0.3 * fond };
    const pointV = A_PLAIN[n] ? bp(0.28, 0.36, 0.62) : 0;
    sv = hand(sv, xV, dV, 1, xV + 7 * dV, 470, back * (1 - pointV));
    sv = hand(sv, xV, dV, -1, xV + 5 * dV, 472, back);
    if (pointV > 0) sv = hand(sv, xV, dV, 1, MUG_BODY.x, MUG_BODY.y, pointV);
    const prevV = carryFrom(heldV, n, hHold(VIS_P[p], t));
    const figV = keepHeld(heldV, wv.walking ? mixKeepLegs(prevV, sv, tr) : mixStance(prevV, sv, tr));

    // ── the attendant ───────────────────────────────────────────────────────
    const seatNow = n === 0 ? 1 : A_MINE[n] ? 1 - st(0.02, 0.14) : 0;
    const seat = carry(cv, 4, n, seatNow, seatNow, tr);
    const wa = legsOf(carrySource(cv, 5, n, A_X0), ATT_LEGS[n], b, L);
    const xA = carry(cv, 5, n, wa.x, wa.x, 1);
    const dA = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, -1), ATT_TURN[n], b, L), 1);
    let sa = bodyOf(wa, ATT_P, n, t, b);
    if (seat > 0) {
      // on his stool he nods along while the visitor admires (N21); hands on his knees
      const nod = n === 0 ? Math.max(0, Math.sin(t * 1.45)) : 0;
      const sit = sitting(t);
      sa = mixStance(sa, { ...sit, neck: sit.neck + 0.2 * nod, tilt: sit.tilt + 0.03 * nod }, seat);
    }
    // b1: up off the stool, a point at his mug, then round behind the plinth
    if (A_MINE[n]) sa = hand(sa, xA, dA, 1, MUG_BODY.x, MUG_BODY.y, bp(0.16, 0.22, 0.34));
    // b7: into the case from behind, the mug lifted out over its top and held out
    // held out to the visitor: in front of him whichever way he faces, so as he turns
    // the mug comes round with him (AR4) — at MUG_SHOW once he faces the visitor
    const showX = xA + (A_X - MUG_SHOW.x) * dA;
    if (A_STICKER[n]) {
      const up = st(0.22, 0.38);
      const out = st(0.42, 0.56);
      const hx = lerp(lerp(MUG_REST.x, MUG_UP.x, up), showX, out);
      const hy = lerp(lerp(MUG_REST.y, MUG_UP.y, up), MUG_SHOW.y, out);
      sa = hand(sa, xA, dA, 1, hx, hy, st(0.06, 0.18));
    } else if (A_CHECK[n] || Q2[n]) {
      sa = hand(sa, xA, dA, 1, showX, MUG_SHOW.y, 1);
    } else if (A_LEAVE[n]) {
      // b10: turned back to the case with it, over it, down into it, and the hand away
      const up = st(0.12, 0.26);
      const down = st(0.28, 0.42);
      const hx = lerp(lerp(showX, MUG_UP.x, up), MUG_REST.x, down);
      const hy = lerp(lerp(MUG_SHOW.y, MUG_UP.y, up), MUG_REST.y, down);
      sa = hand(sa, xA, dA, 1, hx, hy, 1 - st(0.48, 0.6));
    }
    const prevA = carryFrom(heldA, n, n === 0 ? sitting(t) : hHold(ATT_P[p], t));
    const figA = keepHeld(heldA, wa.walking ? mixKeepLegs(prevA, sa, tr) : mixStance(prevA, sa, tr));

    // ── the psychologist ────────────────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 7, n, P_X0), PSY_LEGS[n], b, L);
    const xP = carry(cv, 7, n, wp.x, wp.x, 1);
    const dP = -1;
    let sp = bodyOf(wp, PSY_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; then a finger to his temple, tapped twice
      const after = moveTr(P_X0, P_X, TR) / L;
      sp = hand(sp, xP, dP, 1, xP + 5 * dP, GROUND - 76, bp(after + 0.02, after + 0.06, after + 0.15));
      const tap = bp(0.79, 0.81, 0.84) + bp(0.85, 0.87, 0.9);
      sp = hand(sp, xP, dP, 1, xP + 3 * dP, 428 - 2.5 * tap, st(0.71, 0.77) * (1 - st(0.92, 0.98)));
    }
    // b3: the label, on "a label" and on "this label said royal"
    if (A_LABEL[n]) sp = hand(sp, xP, dP, 1, LABEL_C.x, LABEL_C.y, bp(0, 0.06, 0.22) + bp(0.76, 0.82, 0.97));
    // b5: a card out of his coat, laid over the label, and the hand away
    if (A_PLAIN[n]) {
      const lay = st(0.06, 0.16);
      // (his coat's front is IN FRONT of him: the hand goes there forward, never up behind him, AR4)
      sp = hand(sp, xP, dP, -1, lerp(xP + 13 * dP, LAY.x, lay), lerp(450, LAY.y, lay), st(0, 0.05) * (1 - st(0.22, 0.32)));
    }
    // b6: the covered label, then an open hand to the visitor
    if (A_AGAIN[n]) {
      sp = hand(sp, xP, dP, 1, LABEL_C.x, LABEL_C.y, bp(0.3, 0.36, 0.5));
      sp = hand(sp, xP, dP, 1, xP + 22 * dP, 450, bp(0.55, 0.62, 0.86));
    }
    // b8: the sticker, then the covered label
    if (A_CHECK[n]) {
      sp = hand(sp, xP, dP, 1, STICK.x, STICK.y, bp(0.2, 0.28, 0.5));
      sp = hand(sp, xP, dP, 1, LABEL_C.x, LABEL_C.y, bp(0.66, 0.72, 0.95));
    }
    const prevP = carryFrom(heldP, n, hHold(PSY_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the things that move ───────────────────────────────────────────────
    const vis = pose(figV, xV, GROUND, K, dV, 1);
    const att = pose(figA, xA, GROUND, K, dA, 1);
    const psy = pose(figP, xP, GROUND, K, dP, 1);
    // the mug: 0 in the case · 1 in the attendant's hand; and turned over, 0 → 1
    const heldNow = A_STICKER[n] ? st(0.16, 0.19) : MUG[n] === 1 ? 1 : A_LEAVE[n] ? 1 - st(0.43, 0.46) : 0;
    const held = carry(cv, 8, n, heldNow, heldNow, tr);
    const flipNow = A_STICKER[n] ? st(0.58, 0.72) : MUG[n] === 1 ? 1 : A_LEAVE[n] ? 1 - st(0.02, 0.12) : 0;
    const flip = carry(cv, 9, n, flipNow, flipNow, tr);
    // the card: out of his coat on b5, and laid over the label
    const cardNow = A_PLAIN[n] ? st(0.03, 0.07) : COVER[n] > 0 ? 1 : 0;
    const cardIn = carry(cv, 10, n, cardNow, cardNow, tr);
    const laidNow = A_PLAIN[n] ? st(0.19, 0.22) : COVER[n] > 0 ? 1 : 0;
    const laid = carry(cv, 11, n, laidNow, laidNow, tr);
    const grow = A_PLAIN[n] ? st(0.04, 0.12) : COVER[n] > 0 ? 1 : 0;

    const wA = wristOf(att, 'wrR');
    const wP = wristOf(psy, 'wrL');
    const mugAt = { x: lerp(MUG_REST.x, wA.x, held), y: lerp(MUG_REST.y, wA.y, held) };
    const cardAt = { x: lerp(wP.x, LAY.x, laid), y: lerp(wP.y, LAY.y, laid) };
    const side = clamp01(1 - flip * 2);
    const under = clamp01(flip * 2 - 1);

    return {
      vis, att, psy,
      // in his hand the mug turns with him (its handle stays in his hand): mirrored as he faces left
      mug: { x: mugAt.x, y: mugAt.y, o: side > 0.001 ? 1 : 0, sy: side, sx: lerp(1, dA, held), r: -18 * clamp01(flip * 2) * lerp(1, dA, held) },
      base: { x: mugAt.x, y: mugAt.y, o: under > 0.001 ? 1 : 0, sy: under, sx: lerp(1, dA, held) },
      card: { x: cardAt.x, y: cardAt.y, o: cardIn, r: -24 * (1 - laid) * (1 - st(0.06, 0.16)), s: 0.4 + 0.6 * grow },
      q1: carry(cv, 12, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 13, n, Q2[p], Q2[n], tr),
    };
  });

  const DV = useDerivedValue<Bundle>(() => SCENE.value.vis);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.att);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.psy);
  const mugP = useDerivedValue<At>(() => SCENE.value.mug);
  const baseP = useDerivedValue<At>(() => SCENE.value.base);
  const cardP = useDerivedValue<At>(() => SCENE.value.card);

  // the two answers' PHYSICAL reaction (right: the thing pops and settles; wrong: it shakes)
  const labelKind: Kick = i === 4 && picked === 'label' ? 'pop' : i === 9 && picked === 'label' ? 'shake' : null;
  const kLabel = useKick(labelKind);
  const kMug = useKick(i === 4 && picked === 'mug' ? 'shake' : null);
  const kWindow = useKick(i === 4 && picked === 'window' ? 'shake' : null);
  const kCase = useKick(i === 9 && picked === 'case' ? 'shake' : null);
  const kSticker = useKick(i === 9 && picked === 'sticker' ? 'pop' : null);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.skirting} pointerEvents="none" />
      <LessonPicture name="psych3-painting" />
      <Animated.View style={[styles.whole, { transformOrigin: '331px 372px' }, kWindow]} pointerEvents="none">
        <LessonPicture name="psych3-window" />
      </Animated.View>
      <LessonPicture name="psych3-stool" />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: plain */}
      <Stickman D={DA} k={K} role="crowd" wear={[]} />
      <LessonPicture name="psych3-plinth" />
      <Animated.View style={[styles.whole, { transformOrigin: '175px 460px' }, kCase]} pointerEvents="none">
        <LessonPicture name="psych3-glass" />
      </Animated.View>
      <Rider at={mugP} name="psych3-mug" kick={kMug} />
      <Rider at={baseP} name="psych3-mugbase" kick={kSticker} origin="-12.2px 0px" />
      <Animated.View style={[styles.whole, { transformOrigin: '175px 460px' }, kCase]} pointerEvents="none">
        <LessonPicture name="psych3-frame" />
      </Animated.View>
      <Animated.View style={[styles.label, kLabel]} pointerEvents="none">
        <Text style={styles.labelText}>ROYAL CUP</Text>
      </Animated.View>
      <Rider at={cardP} name="psych3-card" />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={DV} k={K} role="lead" wear={BY_ID.stroller.pieces} />
      {on(Q1) ? <ToldTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <LookTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── a right answer pops and settles; a wrong one shakes ──────────────────────

type Kick = 'pop' | 'shake' | null;
function useKick(kind: Kick) {
  const s = useSharedValue(1);
  const dx = useSharedValue(0);
  useEffect(() => {
    if (kind === 'pop') {
      s.value = withSequence(withTiming(1.2, { duration: 110, easing: Easing.out(Easing.quad) }), withSpring(1, { damping: 6, stiffness: 240 }));
    } else if (kind === 'shake') {
      dx.value = withSequence(
        withTiming(-4, { duration: 55 }), withTiming(4, { duration: 85 }), withTiming(-3, { duration: 75 }),
        withTiming(2, { duration: 65 }), withTiming(0, { duration: 70 }),
      );
    }
  }, [kind, s, dx]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: dx.value }, { scale: s.value }] }));
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number; sx?: number; sy?: number; s?: number };
function Rider({ at, name, kick, origin }: { at: SharedValue<At>; name: string; kick?: ReturnType<typeof useKick>; origin?: string }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` },
      { scaleX: (at.value.sx ?? 1) * (at.value.s ?? 1) }, { scaleY: (at.value.sy ?? 1) * (at.value.s ?? 1) },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, origin ? { transformOrigin: origin } : null, kick]}>
        <LessonPicture name={name} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6), and each choice carries its name on a
 * small plate inside its target (AN1). No two live targets touch (AN4). The sticker's
 * plate sits at the TOP of its target (under the pip), because its foot is the sticker itself.
 */
type Q = {
  id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean; head?: boolean;
};
/** Q1: the label, the mug and the window. The label set what he expected to see. */
const TOLD_Q: Q[] = [
  { id: 'label', label: 'LABEL', pw: 40, left: 201, top: 444, w: 50, h: 54, correct: true },
  { id: 'mug', label: 'MUG', pw: 34, left: 150, top: 446, w: 46, h: 52, correct: false },
  { id: 'window', label: 'WINDOW', pw: 54, left: 298, top: 326, w: 68, h: 98, correct: false },
];
/** Q2: the sticker, the label and the glass case. The sticker is the thing's own evidence. */
const LOOK_Q: Q[] = [
  { id: 'sticker', label: 'STICKER', pw: 50, left: 120, top: 396, w: 52, h: 52, correct: true, head: true },
  { id: 'label', label: 'LABEL', pw: 40, left: 201, top: 446, w: 50, h: 52, correct: false },
  { id: 'case', label: 'CASE', pw: 36, left: 150, top: 452, w: 46, h: 46, correct: false },
];
function ToldTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={TOLD_Q} k="q1" />;
}
function LookTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={LOOK_Q} k="q2" />;
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
            <View style={[q.head ? styles.namePlateTop : styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw }]}>
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
  // the skirting board: light oak, its top edge in the oak's shade (AR1)
  skirting: {
    position: 'absolute', left: 0, right: 0, top: GROUND - 7, height: 7, backgroundColor: NATURAL.oak.base,
    borderTopWidth: 1.2, borderTopColor: NATURAL.oak.shade,
  },
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  whole: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  label: {
    position: 'absolute', left: LABEL.left, top: LABEL.top, width: LABEL.w, height: LABEL.h,
    backgroundColor: NATURAL.brass.base, borderRadius: 3, borderWidth: 1.2, borderColor: INK, boxShadow: `0px 2px 0px ${NATURAL.brass.shade}`,
    paddingHorizontal: 1.5, alignItems: 'stretch', justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Cinzel_700Bold', fontSize: 9, lineHeight: 9.6, letterSpacing: 0.4, color: NATURAL.brass.label,
    textAlign: 'center', includeFontPadding: false,
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 3, alignItems: 'stretch', backgroundColor: PLATE_FACE, borderRadius: 5, borderWidth: 0.8, boxShadow: `0px 2.2px 0px ${TONE.SHADE}`,
    borderColor: TONE.RULE, paddingHorizontal: 3,
  },
  namePlateTop: {
    position: 'absolute', top: 9, alignItems: 'stretch', backgroundColor: PLATE_FACE, borderRadius: 5, borderWidth: 0.8, boxShadow: `0px 2.2px 0px ${TONE.SHADE}`,
    borderColor: TONE.RULE, paddingHorizontal: 3,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false, textAlign: 'center',
  },
});

export function Psych3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych3Scene} band={[306, 514]} camera={CAM} />;
}
