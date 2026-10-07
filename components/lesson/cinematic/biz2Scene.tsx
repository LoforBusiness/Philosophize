import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, Easing, type SharedValue,
} from 'react-native-reanimated';
import LessonPicture from './LessonPicture';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './biz2Script';
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
  NATURAL, notepad, mug, deckOven, ovenDoor, macaron, rollTray, rollTrayRaw, sausageRoll,
  teapot, teacup, recipeBook, crystalBall, wallShelf, dawnWindow, bakeryCounter, OVEN_MOUTH, MACARON_GAP,
  TEAPOT_GRIP, TEAPOT_SPOUT, type NaturalKey,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-2, "Who Is Your Customer?" — A BAKERY COUNTER AT DAWN.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The baker (the bun, cheerful and a step
// behind) has filled her counter with pastel-pink macarons for the building site next
// door; the builder (plain, polite with a needle in it) wants breakfast; the adviser
// (the top hat) shows her who her customer is, and how to find out what he wants.
//
//   b0   the baker sets the last pink macaron in the gap on its plate, admires the
//        row, and points out of the window at the crane next door.
//   b1   the builder walks in from the cold with his hands together, rubs them once as
//        he arrives, and shades his eyes to peer at the plate.
//   b2   the adviser walks in, tips his hat, points at the macarons, then opens a hand
//        to the builder; the builder turns to him.
//   b3   the adviser opens a hand to the builder, then hugs his arms across his chest
//        against the cold; the baker walks along, TURNS to the cake under the counter,
//        lifts the pink-iced sponge on its stand up onto it, and turns back.
//   b4   Q1: the macarons, the cake, and the sausage rolls baking in the lit oven —
//        tap one.
//   b5   the baker steps to the oven, drops its door by the handle with one hand,
//        slides the hot tray out by its near end with the other and sets it at the
//        front of the counter, steaming; the door shut again.
//   b6   the adviser taps his head twice, then points at the rolls; the baker lifts a
//        small cup and saucer up from under the counter and pours the builder a little
//        tea from the teapot, held by its handle.
//   b7   the builder lifts the small cup by its saucer and holds it out, raises his
//        other hand above it — a cup this tall — and puts it back down.
//   b8   Q2: her notepad on the counter, the recipe book and the crystal ball on the
//        shelf — tap one.
//   b9   the baker hands over a roll, then a big mug of tea by its handle from under
//        the counter, which he takes round its body; she turns to her notepad, picks
//        it up by its bottom edge, turns back and holds it up.
//   b10  at ease under the quotation, the notepad held close; b11 the summary.
//
// (A person TURNS to what he reaches for or offers, and every hand shows, holds and
// gives IN FRONT of the body — LESSON_RULES AR4. A turn is eased through a profile.)
//
// COMPOSITION, in stage units. The shop window (dawn, and the site's tower crane) is on
// the left wall, 14–100 × 308–386, over the adviser's spot at 66; the painted BAKERY
// sign hangs 150–250 × 344–368. The deck oven stands behind the counter, 212–274 ×
// 418–500, its upper deck's mouth 228–270 × 434–462. The counter, duck-egg blue under a
// marble top, runs 150–380 × 477–501, at the HIP (AP10). On it: the little teacup's
// place 166, the teapot 169–187, the notepad 204, the hot rolls 247–277 once they are
// out, the cake 289–315 and the macarons 324–364. The shelf 265–375 × 400–412 carries
// the recipe book (288) and the crystal ball (352), above every head (422). The builder
// stands at the counter's end, 146; the baker behind it, at 366 by the macarons, 286 by
// the cake, 274 at the oven, 184 at the teapot and 186 at the pass. Every hand-off
// happens over the counter's end at (166, 455), 20 units from both of them, inside the
// rig's ~23-unit safe reach. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, business-foundations-2). 0 for a beat with no voice.
 */
const LINES = [6.76, 4.46, 5.54, 5.84, 0, 5.18, 4.97, 5.07, 0, 4.41, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in to listen, waiting for the answer.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_DISPLAY = is('display');
const A_BUILDER = is('builder');
const A_ARRIVE = is('arrive');
const A_DEFINE = is('define');
const A_BAKE = is('bake');
const A_GUESS = is('guess');
const A_QUIET = is('quiet');
const A_SERVE = is('serve');
const TRAY = BEATS.map((b) => b.tray ?? 0);
const Q1 = BEATS.map((b) => (b.fit ? 1 : 0));
const Q2 = BEATS.map((b) => (b.learn ? 1 : 0));
const DEFINE_N = A_DEFINE.indexOf(1);
const BAKE_N = A_BAKE.indexOf(1);
const GUESS_N = A_GUESS.indexOf(1);
const QUIET_N = A_QUIET.indexOf(1);
const SERVE_N = A_SERVE.indexOf(1);

/** Where each of them stands, beat by beat. The builder comes in on b1, the adviser on b2. */
const PL_X = BEATS.map((_, n) => (n === 0 ? -30 : 146));
const TH_X = BEATS.map((b) => (b.th ? 66 : -40));
const BK_X = [366, 366, 366, 286, 286, 274, 184, 280, 280, 186, 186, 186];
/**
 * Which way each faces, and when he turns: per beat, [share of the line, facing]. The
 * builder turns to the adviser while he first speaks; the baker TURNS to what she
 * reaches for (AR4) — the cake under the counter, her notepad — and back to him.
 */
type Track = readonly (readonly number[])[];
const PL_TURN: Track[] = [[1], [1], [-1], [-1], [-1], [1], [-1], [1], [1], [1], [1], [1]].map((d) => [[0, d[0]]]);
const TH_TURN: Track[] = BEATS.map(() => [[0, 1]]);
const BK_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.28, 1], [0.6, -1]],                // b3 the cake up from under the counter
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.78, 1], [0.88, -1]],               // b9 her notepad off the counter
  [[0, -1]], [[0, -1]],
];
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PL_P = [LISTEN, TALK, LISTEN, NOD, WAIT, LISTEN, NOD, TALK, WAIT, NOD, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, WAIT, LISTEN, EXPLAIN, LISTEN, WAIT, NOD, NOD, LISTEN];
const BK_P = [TALK, LISTEN, LISTEN, NOD, WAIT, TALK, LISTEN, LEAN, WAIT, TALK, NOD, LISTEN];
/** b9: she takes a roll off the tray first, then walks it along to him, at this share of the line. */
const SERVE_STEP = 0.1;

// ── the shop and what is in it ───────────────────────────────────────────────
const TOP = 477;                                   // the counter's top, at their hip
/** The deck oven, 62 × 82 here (its drawing is 62 × 88), standing behind the counter. */
const OVEN = { x: 243, y: 459, w: 62, h: 82 };
const OSY = OVEN.h / 88;
const MOUTH = {
  x: OVEN.x - OVEN.w / 2 + OVEN_MOUTH.x, y: OVEN.y - OVEN.h / 2 + OVEN_MOUTH.y * OSY, w: OVEN_MOUTH.w, h: OVEN_MOUTH.h * OSY,
};
const HANDLE = { x: MOUTH.x, y: MOUTH.y - MOUTH.h / 2 + 2 };
const HANDLE_DOWN = { x: MOUTH.x, y: MOUTH.y + MOUTH.h / 2 - 2 };
const DECK = { x: MOUTH.x, y: MOUTH.y + 7 };
const TRAY_W = 30;
const TRAY_H = TRAY_W * (10.5 / 38);
const HOT_AT = { x: 262, y: TOP - TRAY_H / 2 };
/** The roll she sells is taken off the tray's near end, the end nearest her. */
const TRAY_ROLL = { x: HOT_AT.x + 9, y: HOT_AT.y - 1 };
/** She holds the tray by its near end: her front hand this far along from its middle. */
const TRAY_GRIP = 9;
const CUP_AT = { x: 166, y: TOP - 4 };
/** A teacup is held by its SAUCER, flat on the palm (AR2): the cup's middle this far above the wrist. */
const SAUCER_UP = 5;
/** A mug in her hand is held by its handle; in his, round its body: the mug's middle from the wrist. */
const MUG_GRIP = { x: -5.7, y: -0.3 };
const MUG_BODY = { x: 1.2, y: -1 };
/** A notepad is held by its bottom edge: its middle this far above the wrist. */
const NOTE_UP = 6;
/** Where he puts the little cup back, at his own end, clear of the hand-offs. */
const CUP_BACK = { x: 157, y: TOP - 4 };
/** The door's bar handle, taken at its near end, beside the oven. */
const GRAB_X = MOUTH.x + MOUTH.w / 2 - 6;
const POT = { w: 18, h: 12.6 };
const POT_AT = { x: 178, y: TOP - POT.h / 2 - 0.4 };
const GRIP = { x: (TEAPOT_GRIP.x / 20 - 0.5) * POT.w, y: (TEAPOT_GRIP.y / 14 - 0.5) * POT.h };
const SPOUT = { x: (TEAPOT_SPOUT.x / 20 - 0.5) * POT.w, y: (TEAPOT_SPOUT.y / 14 - 0.5) * POT.h };
const NOTE_AT = { x: 204, y: TOP - 7 };
const CAKE_AT = { x: 302, y: TOP - 14 };
const MAC = { x: 344, y: TOP - 6.5, w: 40, h: 13 };
const GAP = { x: MAC.x - MAC.w / 2 + MACARON_GAP.x, y: MAC.y - MAC.h / 2 + MACARON_GAP.y };
const BOOK_AT = { x: 288, y: 388 };
const BALL_AT = { x: 352, y: 388 };
/** Where a thing passes over the counter's end from one hand to the other. */
const PASS = { x: 166, y: 455 };
/** Under the counter, where the cups and the cake are kept. */
const BELOW = 491;
/** Where the big mug is kept under the counter, in front of her at the pass. */
const MUG_UNDER = 180;
const POUR_HAND = { x: 181, y: 452 };
const TILT = -38;

const WINDOW_ART = dawnWindow(57, 347, 86, 78);
const OVEN_ART = deckOven(OVEN.x, OVEN.y, OVEN.w, OVEN.h);
const SHELF_ART = wallShelf(320, 406, 110, 12);
const BOOK_ART = recipeBook(BOOK_AT.x, BOOK_AT.y, 18, 24);
const BALL_ART = crystalBall(BALL_AT.x, BALL_AT.y, 18, 24);
const COUNTER_ART = bakeryCounter(265, 489, 230, 24);
// In the door's own box, so it can drop open about its foot.
const DOOR_ART = ovenDoor(MOUTH.w / 2, MOUTH.h / 2, MOUTH.w, MOUTH.h);
const WIN_ROLLS_ART = rollTrayRaw(MOUTH.w / 2, MOUTH.h / 2 + 4, TRAY_W, TRAY_H);
// The things that move are drawn about their own centre and carried by a rider.
const HOT_ART = rollTray(0, 0, TRAY_W, TRAY_H);
const ONE_MAC_ART = macaron(0, 0, 7, 6);
const ROLL_ART = sausageRoll(0, 0, 14, 7);
const POT_ART = teapot(0, 0, POT.w, POT.h);
const CUP_ART = teacup(0, 0, 12, 8);
const MUG_ART = mug(0, 0, 15, 15);
// The notepad's card back is grey board, its pages paper (AR1): the parts the drawing
// leaves in the stage's tone take board, the rest keep their own colours.
const NOTE_ART = notepad(0, 0, 12, 14).map((q) => (q.nat || q.role === 'line' || q.role === 'lit' ? q : { ...q, nat: 'cardboard' as NaturalKey }));

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
/**
 * A BACK hand brought up in front: it comes forward at the hip first and only then
 * rises, so on its way up it never passes behind his back (AR4).
 */
function lift(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const s1 = hand(s, x, dir, which, x + (dir < 0 ? -10 : 10), GROUND - 26, clamp01(w * 2.5));
  return hand(s1, x, dir, which, tx, ty, clamp01((w - 0.4) / 0.6));
}
/** Which way a figure faces at time `b`, turning through a profile from its facing on screen. */
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
/**
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — not from where the script says the last beat left him, so a
 * tap mid-walk never puts him anywhere in one frame (group L); and he turns from the
 * facing on screen (`dsrc`), the same way. He faces the way he goes (C18), then turns
 * as the beat's track has him. `start` holds the walk back until that many seconds into
 * the beat (b9: she serves first, then steps along).
 */
function walkOf(
  src: number, dsrc: number, xs: readonly number[], turns: readonly Track[], codes: readonly number[],
  n: number, t: number, b: number, L: number, start: number,
) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const wd = walking ? moveTr(xp, xn, TR) : 0;
  const bw = b - start;
  const walkU = walking ? ease01(clamp01(bw / wd)) : 1;
  const tk = turns[n];
  let dirV = faceOf(dsrc, tk, b, L);
  if (walking && bw > 0 && bw < wd + 0.3) {
    const way = xn > xp ? 1 : -1;
    const d0 = faceOf(dsrc, tk, start, L);
    dirV = lerp(facing(d0, way, bw), faceOf(dsrc, tk, start + wd + 0.3, L), clamp01((bw - wd) / 0.3));
  }
  // A walk held back starts from the pose he is IN, not the one the last beat left.
  const from = start > 0 ? hLive(codes[n], t, b) : hHold(codes[p], t);
  const s = walking && bw > 0
    ? travelStance(xp, xn, from, hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur: wd + start, dirV, s };
}

const CAM = followMoves(BK_X, BEATS.map(kindOf), seedOf('business'));

export default function Biz2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldPl = useHeld();
  const heldTh = useHeld();
  const heldBk = useHeld();
  const cv = useCarry(19);
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

    // ── the builder ─────────────────────────────────────────────────────────
    // where he stands and faces on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src0 = carrySource(cv, 0, n, PL_X[0]);
    const dsrc0 = carrySource(cv, 16, n, PL_TURN[0][0][1]);
    const wp = walkOf(src0, dsrc0, PL_X, PL_TURN, PL_P, n, t, b, L, 0);
    const xPl = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    const dPl = carry(cv, 16, n, 0, wp.dirV, 1);
    let sp = wp.s;
    // b1: in from the cold with his hands together, a rub of them as he arrives (once
    // back and forth, AR5), then a hand to his brow to peer at the plate
    if (A_BUILDER[n]) {
      const ru = clamp01((b / L - 0.48) / 0.14);
      const jig = Math.sin(ru * Math.PI * 2) * 1.6;
      const rub = st(0, 0.06) * (1 - st(0.62, 0.68));
      sp = hand(sp, xPl, dPl, 1, xPl + 6 * dPl, 452 + jig, rub);
      sp = lift(sp, xPl, dPl, -1, xPl + 4 * dPl, 453 - jig, rub);
      sp = hand(sp, xPl, dPl, 1, xPl + 8, GROUND - 71, st(0.7, 0.78) * (1 - st(0.93, 1)));
    }
    // b7: the little cup lifted by its saucer and held out in front of him; then his
    // other hand up above it — "a cup this tall" — both in front of him; the cup down
    if (A_QUIET[n]) {
      const c = via([{ x: CUP_AT.x, y: CUP_AT.y + SAUCER_UP }, { x: 164, y: 454 }, { x: 164, y: 463 }, { x: 164, y: 454 },
        { x: CUP_BACK.x, y: CUP_BACK.y + SAUCER_UP }],
      [st(0.14, 0.26), st(0.32, 0.42), st(0.6, 0.68), st(0.72, 0.8)]);
      sp = hand(sp, xPl, dPl, 1, c.x, c.y, st(0.02, 0.1) * (1 - st(0.84, 0.92)));
      sp = lift(sp, xPl, dPl, -1, 157, 437, st(0.3, 0.42) * (1 - st(0.6, 0.7)));
    }
    // b9: the roll into his left hand, the mug into his right — and he keeps them after,
    // close in front of him
    if (A_SERVE[n]) {
      sp = lift(sp, xPl, dPl, -1, lerp(PASS.x - 2, 150, st(0.52, 0.6)), lerp(PASS.y + 1, 461, st(0.52, 0.6)), st(0.36, 0.44));
      sp = hand(sp, xPl, dPl, 1, lerp(PASS.x - 1, 158, st(0.76, 0.84)), lerp(PASS.y - 2, 462, st(0.76, 0.84)), st(0.62, 0.68));
    }
    if (n > SERVE_N) {
      sp = lift(sp, xPl, dPl, -1, 150, 461, 1);
      sp = hand(sp, xPl, dPl, 1, 158, 462, 1);
    }
    const prevPl = carryFrom(heldPl, n, hHold(PL_P[p], t));
    const figPl = keepHeld(heldPl, wp.walking ? mixKeepLegs(prevPl, sp, tr) : mixStance(prevPl, sp, tr));

    // ── the adviser ─────────────────────────────────────────────────────────
    // where he stands and faces on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src1 = carrySource(cv, 1, n, TH_X[0]);
    const dsrc1 = carrySource(cv, 17, n, 1);
    const wt = walkOf(src1, dsrc1, TH_X, TH_TURN, TH_P, n, t, b, L, 0);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    const dTh = carry(cv, 17, n, 0, wt.dirV, 1);
    let stp = wt.s;
    // b2: he tips his hat once he has arrived, points at the macarons, then opens a
    // hand to the builder at the counter
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      stp = hand(stp, xTh, dTh, 1, xTh + 5, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.15));
      stp = hand(stp, xTh, dTh, 1, MAC.x, MAC.y - 6, bp(0.42, 0.5, 0.62));
      stp = hand(stp, xTh, dTh, 1, xTh + 22, 452, bp(0.66, 0.74, 0.97));
    }
    // b3: a hand open to the builder; then his arms hugged across his chest against the
    // cold, a rub up and down them once (AR5), both hands in front of him
    if (A_DEFINE[n]) {
      stp = hand(stp, xTh, dTh, 1, xTh + 22, 450, bp(0.04, 0.12, 0.44));
      const ru = clamp01((b / L - 0.6) / 0.2);
      const jig = Math.sin(ru * Math.PI * 2) * 1.5;
      const rub = st(0.5, 0.58) * (1 - st(0.88, 0.96));
      stp = hand(stp, xTh, dTh, 1, xTh + 5, 453 + jig, rub);
      stp = lift(stp, xTh, dTh, -1, xTh + 8, 452 - jig, rub);
    }
    // b6: two taps on the side of his head — a guess — then a hand out to what is selling
    if (A_GUESS[n]) {
      const tu = clamp01((b / L - 0.1) / 0.2);
      const tap = Math.abs(Math.sin(tu * Math.PI * 2)) * 2;
      stp = hand(stp, xTh, dTh, 1, xTh + 6, GROUND - 72 + tap, bp(0.02, 0.08, 0.38));
      stp = hand(stp, xTh, dTh, 1, HOT_AT.x, HOT_AT.y - 6, st(0.46, 0.54) * (1 - st(0.92, 1)));
    }
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, stp, tr) : mixStance(prevTh, stp, tr));

    // ── the baker, behind her counter ───────────────────────────────────────
    // where she stands and faces on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src2 = carrySource(cv, 2, n, BK_X[0]);
    const dsrc2 = carrySource(cv, 18, n, -1);
    const wk = walkOf(src2, dsrc2, BK_X, BK_TURN, BK_P, n, t, b, L, A_SERVE[n] ? SERVE_STEP * L : 0);
    const xBk = carry(cv, 2, n, wk.xp, wk.xn, wk.walking ? wk.walkU : tr);
    const dBk = carry(cv, 18, n, 0, wk.dirV, 1);
    let sk = wk.s;
    // b0: the last macaron into its gap, her hands clasped at the row, then a hand out
    // of the window to the site next door
    if (A_DISPLAY[n]) {
      const m = via([{ x: xBk - 6, y: 452 }, { x: GAP.x, y: GAP.y - 2 }], [st(0.1, 0.3)]);
      sk = hand(sk, xBk, dBk, 1, m.x, m.y, 1 - st(0.36, 0.44));
      sk = hand(sk, xBk, dBk, 1, xBk - 6, 449, bp(0.38, 0.48, 0.6));
      sk = lift(sk, xBk, dBk, -1, xBk - 4, 450, bp(0.38, 0.48, 0.6));
      sk = hand(sk, xBk, dBk, 1, 60, 396, st(0.6, 0.7) * (1 - st(0.92, 1)));
    }
    // b3: turned to it, the cake up from under the counter and set beside the macarons;
    // then she turns back to them
    const cakeNow = A_DEFINE[n] ? st(0.36, 0.5) : n > DEFINE_N ? 1 : 0;
    if (A_DEFINE[n]) {
      const cy = lerp(BELOW, CAKE_AT.y, cakeNow);
      sk = hand(sk, xBk, dBk, 1, CAKE_AT.x + 4, cy + 4, st(0.32, 0.38) * (1 - st(0.52, 0.58)));
    }
    // b5: the oven door dropped by its handle, the hot tray slid out by its near end and
    // set at the front, the door shut. One hand works the door, the other the tray, so
    // neither goes up and down over and over (AR5).
    const doorNow = A_BAKE[n] ? st(0.27, 0.33) * (1 - st(0.78, 0.86)) : 0;
    if (A_BAKE[n]) {
      const hy = lerp(HANDLE.y, HANDLE_DOWN.y, doorNow);
      sk = lift(sk, xBk, dBk, -1, GRAB_X, hy, st(0.2, 0.27) * (1 - st(0.33, 0.37)));
      const tray = via([DECK, { x: DECK.x + 16, y: DECK.y + 3 }, { x: HOT_AT.x, y: HOT_AT.y - 3 }], [st(0.46, 0.56), st(0.6, 0.68)]);
      sk = hand(sk, xBk, dBk, 1, tray.x + TRAY_GRIP, tray.y, st(0.36, 0.42) * (1 - st(0.7, 0.74)));
      sk = lift(sk, xBk, dBk, -1, GRAB_X, hy, st(0.72, 0.78) * (1 - st(0.86, 0.9)));
    }
    // b6: a little cup and saucer up from under the counter and set down for him; the
    // teapot lifted by its handle, tipped over the cup, and put back
    const cupLift = A_GUESS[n] ? st(0.33, 0.42) : 0;
    const potHold = A_GUESS[n] ? st(0.56, 0.58) * (1 - st(0.86, 0.88)) : 0;
    const tiltNow = A_GUESS[n] ? st(0.63, 0.67) * (1 - st(0.74, 0.78)) : 0;
    const pourNow = A_GUESS[n] ? bp(0.66, 0.7, 0.77) : 0;
    if (A_GUESS[n]) {
      const c = via([{ x: 176, y: 482 }, { x: 176, y: 460 }, { x: CUP_AT.x + 2, y: CUP_AT.y + SAUCER_UP }], [st(0.35, 0.42), st(0.44, 0.5)]);
      sk = hand(sk, xBk, dBk, 1, c.x, c.y, st(0.31, 0.35) * (1 - st(0.52, 0.56)));
      const g = { x: POT_AT.x + GRIP.x, y: POT_AT.y + GRIP.y };
      const h = via([g, POUR_HAND, g], [st(0.57, 0.63), st(0.79, 0.86)]);
      sk = lift(sk, xBk, dBk, -1, h.x, h.y, st(0.52, 0.56) * (1 - st(0.88, 0.93)));
    }
    // b9: a roll from the tray over the counter, a big mug of tea up from under it by its
    // handle and over; then turned to it, her notepad off the counter, and turned back
    // to him she holds it up. While she turns it is held in front of her (xBk + dBk·lx).
    if (A_SERVE[n]) {
      const r = via([TRAY_ROLL, { x: xBk - 9, y: 456 }, PASS], [st(0.07, 0.12), st(0.4, 0.47)]);
      sk = hand(sk, xBk, dBk, 1, r.x, r.y, st(0, 0.05) * (1 - st(0.5, 0.56)));
      // the mug hand goes down for it and, once it is handed over, down to her hip and away
      const m = via([{ x: MUG_UNDER, y: 482 }, { x: MUG_UNDER - 2, y: 456 }, { x: PASS.x + 1, y: PASS.y - 2 },
        { x: xBk + dBk * 8, y: 474 }], [st(0.56, 0.62), st(0.62, 0.7), st(0.74, 0.8)]);
      sk = hand(sk, xBk, dBk, -1, m.x, m.y, st(0.5, 0.56) * (1 - st(0.8, 0.86)));
      const lx = lerp(lerp(NOTE_AT.x - xBk, 14, st(0.86, 0.9)), 15, st(0.94, 1.02));
      const ly = lerp(NOTE_AT.y + NOTE_UP, 440, st(0.94, 1.02));
      sk = hand(sk, xBk, dBk, 1, xBk + dBk * lx, ly, st(0.8, 0.86));
    }
    // after, she holds the notepad close in front of her while she listens
    if (n > SERVE_N) {
      const down = st(0.04, 0.24);
      sk = hand(sk, xBk, dBk, 1, xBk + dBk * lerp(15, 12, down), lerp(440, 461, down), 1);
    }
    const prevBk = carryFrom(heldBk, n, hHold(BK_P[p], t));
    const figBk = keepHeld(heldBk, wk.walking ? mixKeepLegs(prevBk, sk, tr) : mixStance(prevBk, sk, tr));

    // ── the things that change hands ────────────────────────────────────────
    // mac    the last macaron: 0 in her hand · 1 in its gap
    const macNow = A_DISPLAY[n] ? st(0.32, 0.36) : 1;
    // rolls  0 baking in the oven · 1 in her hands · 2 at the front of the counter
    const rollsNow = A_BAKE[n] ? st(0.42, 0.46) + st(0.68, 0.7) : n > BAKE_N ? 2 : 0;
    // cup    0 under the counter · 1 her hand · 2 the counter · 3 his hand · 4 the counter
    const cupNow = A_GUESS[n] ? cupLift + st(0.48, 0.52)
      : A_QUIET[n] ? 2 + st(0.08, 0.12) + st(0.8, 0.84) : n > QUIET_N ? 4 : n > GUESS_N ? 2 : 0;
    // roll   the one he buys: 0 on the tray · 1 her hand · 2 his
    const rollNow = A_SERVE[n] ? st(0.03, 0.07) + st(0.47, 0.5) : n > SERVE_N ? 2 : 0;
    // mugT   0 under the counter · 1 her hand · 2 his
    const mugNow = A_SERVE[n] ? st(0.54, 0.62) + st(0.7, 0.74) : n > SERVE_N ? 2 : 0;
    // note   0 on the counter · 1 in her hand
    const noteNow = A_SERVE[n] ? st(0.85, 0.87) : n > SERVE_N ? 1 : 0;
    // steam over the rolls and the tea, once there is something hot
    const steamNow = A_BAKE[n] ? st(0.6, 0.72) : n > BAKE_N ? 1 : 0;

    return {
      pl: pose(figPl, xPl, GROUND, K, dPl, 1),
      th: pose(figTh, xTh, GROUND, K, dTh, 1),
      bk: pose(figBk, xBk, GROUND, K, dBk, 1),
      mac: carry(cv, 3, n, macNow, macNow, tr),
      cake: carry(cv, 4, n, cakeNow, cakeNow, tr),
      door: carry(cv, 5, n, doorNow, doorNow, tr),
      rolls: carry(cv, 6, n, rollsNow, rollsNow, tr),
      cup: carry(cv, 7, n, cupNow, cupNow, tr),
      pot: carry(cv, 8, n, potHold, potHold, tr),
      tilt: carry(cv, 9, n, tiltNow, tiltNow, tr),
      pour: carry(cv, 10, n, pourNow, pourNow, tr),
      roll: carry(cv, 11, n, rollNow, rollNow, tr),
      mugT: carry(cv, 12, n, mugNow, mugNow, tr),
      note: carry(cv, 13, n, noteNow, noteNow, tr),
      steam: carry(cv, 14, n, steamNow, steamNow, tr),
      q: carry(cv, 15, n, Q1[n] + 2 * Q2[n], Q1[n] + 2 * Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DK = useDerivedValue<Bundle>(() => SCENE.value.bk);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ShopBoard />
      <ObjectArt parts={SHELF_ART} tone={TONE} />
      <Reactor id="recipe-book" correct={false} picked={picked}><ObjectArt parts={BOOK_ART} tone={TONE} /></Reactor>
      <Reactor id="crystal-ball" correct={false} picked={picked}><ObjectArt parts={BALL_ART} tone={TONE} /></Reactor>
      <Reactor id="rolls" correct picked={picked}>
        <ObjectArt parts={OVEN_ART} tone={TONE} />
        <Oven S={SCENE} DK={DK} />
      </Reactor>
      {/* cast: bun */}
      <Stickman D={DK} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <UnderCounter S={SCENE} DK={DK} DP={DP} clock={clock} picked={picked} />
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <OnCounter S={SCENE} DK={DK} DP={DP} clock={clock} picked={picked} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {on(Q1) ? <FitTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <LearnTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── a physical answer: the thing tapped reacts on the stage ──────────────────
// The RIGHT thing hops and settles (a pop on a spring); a WRONG pick shakes its head from
// side to side, and the right one still hops, so the reader sees which it was. Pure
// transform on a wrapper: nothing is re-measured.
function Reactor({ id, correct, picked, children }: { id: string; correct: boolean; picked: string | null; children: ReactNode }) {
  const hop = useSharedValue(0);
  const shake = useSharedValue(0);
  useEffect(() => {
    if (picked === null) return;
    if (correct) {
      hop.value = withSequence(withTiming(-6, { duration: 130, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 260, mass: 0.7 }));
    } else if (picked === id) {
      shake.value = withSequence(
        withTiming(-3.2, { duration: 55 }), withTiming(3.2, { duration: 90 }), withTiming(-2.4, { duration: 90 }),
        withTiming(1.6, { duration: 80 }), withTiming(0, { duration: 70 }),
      );
    }
  }, [picked]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }, { translateY: hop.value }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">{children}</Animated.View>;
}

// ── the shop's name, painted on a board over the counter ─────────────────────

function ShopBoard() {
  return (
    <View style={styles.board} pointerEvents="none">
      <Text style={styles.boardText}>BAKERY</Text>
    </View>
  );
}

// ── where a hand is, for the things it carries ───────────────────────────────

type Pt = { x: number; y: number; o: number; r?: number };
function wrist(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

function Rider({ at, art, line }: { at: { readonly value: Pt }; art: ReturnType<typeof notepad>; line?: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} line={line} />
    </Animated.View>
  );
}

// ── the deck oven: the glow, the rolls baking, and the door that drops ───────

function Oven({ S, DK }: { S: SharedValue<any>; DK: SharedValue<Bundle> }) {
  // The hot tray inside the deck until she takes it; once in her hands it is drawn in
  // front of her by `OnCounter`, so this copy goes the moment it leaves the deck.
  const inside = useDerivedValue<Pt>(() => {
    const u = S.value.rolls;
    const a = wrist(DK, 'wrR');
    const k = clamp01(u);
    return { x: lerp(DECK.x, a.x - TRAY_GRIP, k), y: lerp(DECK.y, a.y, k), o: u < 0.5 ? 1 : 0 };
  });
  const door = useAnimatedStyle(() => ({ transform: [{ scaleY: lerp(1, 0.16, S.value.door) }] }));
  const glass = useAnimatedStyle(() => ({ opacity: (1 - S.value.door) * (S.value.rolls < 0.5 ? 1 : 0) }));
  const lit = useAnimatedStyle(() => ({ opacity: 0.82 * (1 - S.value.door) }));
  return (
    <>
      <View style={styles.mouthGlow} pointerEvents="none" />
      <Rider at={inside} art={HOT_ART} line={1} />
      <Animated.View style={[styles.door, door]} pointerEvents="none">
        <ObjectArt parts={DOOR_ART} tone={TONE} />
        <Animated.View style={[styles.doorGlass, lit]} />
        <Animated.View style={[StyleSheet.absoluteFill, glass]}>
          <ObjectArt parts={WIN_ROLLS_ART} tone={TONE} line={1} />
        </Animated.View>
      </Animated.View>
    </>
  );
}

// ── what comes up from under the counter (drawn behind its front) ───────────

function UnderCounter({ S, DK, DP, clock, picked }: {
  S: SharedValue<any>; DK: SharedValue<Bundle>; DP: SharedValue<Bundle>; clock: SharedValue<number>; picked: string | null;
}) {
  const cakeSt = useAnimatedStyle(() => ({
    opacity: S.value.cake > 0.01 ? 1 : 0,
    transform: [{ translateX: CAKE_AT.x }, { translateY: lerp(BELOW, CAKE_AT.y, S.value.cake) }],
  }));
  // The cup and saucer ride on a flat palm, the saucer on the hand (AR2), level.
  const cupP = useDerivedValue<Pt>(() => {
    const u = S.value.cup;
    const bk = wrist(DK, 'wrR');
    const pl = wrist(DP, 'wrR');
    if (u <= 0.01) return { x: 176, y: BELOW, o: 0 };
    if (u <= 1) return { x: lerp(176, bk.x, u), y: lerp(BELOW, bk.y - SAUCER_UP, u), o: 1 };
    if (u <= 2) return { x: lerp(bk.x, CUP_AT.x, u - 1), y: lerp(bk.y - SAUCER_UP, CUP_AT.y, u - 1), o: 1 };
    if (u <= 3) return { x: lerp(CUP_AT.x, pl.x, u - 2), y: lerp(CUP_AT.y, pl.y - SAUCER_UP, u - 2), o: 1 };
    return { x: lerp(pl.x, CUP_BACK.x, u - 3), y: lerp(pl.y - SAUCER_UP, CUP_BACK.y, u - 3), o: 1 };
  });
  // The mug: up from under the counter by its handle in her hand, and taken round its
  // body in his, its handle still toward her (AR2).
  const mugP = useDerivedValue<Pt>(() => {
    const u = S.value.mugT;
    const bk = wrist(DK, 'wrL');
    const pl = wrist(DP, 'wrR');
    const hx = bk.x + MUG_GRIP.x;
    const hy = bk.y + MUG_GRIP.y;
    if (u <= 0.01) return { x: MUG_UNDER, y: BELOW, o: 0 };
    if (u <= 1) return { x: lerp(MUG_UNDER, hx, u), y: lerp(BELOW, hy, u), o: 1 };
    return { x: lerp(hx, pl.x + MUG_BODY.x, u - 1), y: lerp(hy, pl.y + MUG_BODY.y, u - 1), o: 1 };
  });
  const cupSteam = useDerivedValue<Pt>(() => {
    const c = cupP.value;
    return { x: c.x - 0.6, y: c.y - 5, o: c.o * clamp01(S.value.cup - 1.6) };
  });
  const mugSteam = useDerivedValue<Pt>(() => {
    const m = mugP.value;
    return { x: m.x - 1, y: m.y - 7.5, o: m.o * clamp01(S.value.mugT - 0.6) };
  });
  return (
    <View style={styles.under} pointerEvents="none">
      <Reactor id="cake" correct={false} picked={picked}>
        <Animated.View style={[styles.rider, cakeSt]} pointerEvents="none"><LessonPicture name="biz2-cake" /></Animated.View>
      </Reactor>
      <Rider at={cupP} art={CUP_ART} line={1} />
      <Rider at={mugP} art={MUG_ART} line={1.2} />
      <SteamFrom at={cupSteam} clock={clock} />
      <SteamFrom at={mugSteam} clock={clock} />
    </View>
  );
}

// ── what stands on the counter, and the things in people's hands ─────────────

function OnCounter({ S, DK, DP, clock, picked }: {
  S: SharedValue<any>; DK: SharedValue<Bundle>; DP: SharedValue<Bundle>; clock: SharedValue<number>; picked: string | null;
}) {
  const macP = useDerivedValue<Pt>(() => {
    const u = S.value.mac;
    const a = wrist(DK, 'wrR');
    return { x: lerp(a.x, GAP.x, u), y: lerp(a.y + 1, GAP.y, u), o: 1 };
  });
  // The hot tray once it is out: her two hands, then the front of the counter.
  const hotP = useDerivedValue<Pt>(() => {
    const u = S.value.rolls;
    const a = wrist(DK, 'wrR');
    if (u <= 1) return { x: a.x - TRAY_GRIP, y: a.y, o: u >= 0.5 ? 1 : 0 };
    return { x: lerp(a.x - TRAY_GRIP, HOT_AT.x, u - 1), y: lerp(a.y, HOT_AT.y, u - 1), o: 1 };
  });
  const potP = useDerivedValue<Pt>(() => {
    const u = S.value.pot;
    const h = wrist(DK, 'wrL');
    const th = (TILT * S.value.tilt * Math.PI) / 180;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const hx = h.x - (GRIP.x * c - GRIP.y * s);
    const hy = h.y - (GRIP.x * s + GRIP.y * c);
    return { x: lerp(POT_AT.x, hx, u), y: lerp(POT_AT.y, hy, u), o: 1, r: TILT * S.value.tilt * u };
  });
  const streamSt = useAnimatedStyle(() => {
    const pt = potP.value;
    const th = ((pt.r ?? 0) * Math.PI) / 180;
    const sx = pt.x + SPOUT.x * Math.cos(th) - SPOUT.y * Math.sin(th);
    const sy = pt.y + SPOUT.x * Math.sin(th) + SPOUT.y * Math.cos(th);
    const bottom = CUP_AT.y - 2;
    return { opacity: S.value.pour, left: sx - 0.8, top: sy, height: Math.max(0, bottom - sy) };
  });
  const rollP = useDerivedValue<Pt>(() => {
    const u = S.value.roll;
    const bk = wrist(DK, 'wrR');
    const pl = wrist(DP, 'wrL');
    if (u <= 1) return { x: lerp(TRAY_ROLL.x, bk.x, u), y: lerp(TRAY_ROLL.y, bk.y + 1, u), o: clamp01(u * 8) };
    return { x: lerp(bk.x, pl.x, u - 1), y: lerp(bk.y + 1, pl.y + 1, u - 1), o: 1 };
  });
  // The notepad is held by its bottom edge, upright.
  const noteP = useDerivedValue<Pt>(() => {
    const u = S.value.note;
    const a = wrist(DK, 'wrR');
    return { x: lerp(NOTE_AT.x, a.x, u), y: lerp(NOTE_AT.y, a.y - NOTE_UP, u), o: 1 };
  });
  const hotSteam = useDerivedValue<Pt>(() => {
    const h = hotP.value;
    return { x: h.x, y: h.y - 6, o: h.o * S.value.steam };
  });
  return (
    <>
      <Reactor id="macarons" correct={false} picked={picked}>
        <LessonPicture name="biz2-macarons" />
        <Rider at={macP} art={ONE_MAC_ART} line={0.9} />
      </Reactor>
      <Reactor id="notepad" correct picked={picked}><Rider at={noteP} art={NOTE_ART} line={1} /></Reactor>
      <Rider at={potP} art={POT_ART} line={1.1} />
      <Animated.View style={[styles.stream, streamSt]} pointerEvents="none" />
      <Rider at={hotP} art={HOT_ART} line={1} />
      <SteamFrom at={hotSteam} clock={clock} />
      <Rider at={rollP} art={ROLL_ART} line={0.9} />
    </>
  );
}

// ── steam, rising off whatever is hot: three wisps that rise, sway and thin ──
// Secondary motion on the clock (never the figure, AL): the world is running.

const WISPS = [-4, 0, 4];
function SteamFrom({ at, clock }: { at: { readonly value: Pt }; clock: SharedValue<number> }) {
  return (
    <>
      {WISPS.map((dx, k) => <Wisp key={k} at={at} dx={dx} k={k} clock={clock} />)}
    </>
  );
}
function Wisp({ at, dx, k, clock }: { at: { readonly value: Pt }; dx: number; k: number; clock: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const a = at.value;
    const now = clock.value;
    const ph = (now * 0.55 + k / 3) % 1;
    return {
      opacity: a.o * Math.sin(ph * Math.PI) * 0.75,
      transform: [
        { translateX: a.x + dx + Math.sin(now * 2.2 + k * 2) * 1.6 },
        { translateY: a.y - 3 - ph * 13 },
      ],
    };
  });
  return <Animated.View style={[styles.wisp, st]} pointerEvents="none" />;
}

// ── the two questions ────────────────────────────────────────────────────────

/** A choice is named on a tag: on the counter's front for what is on or behind it, under the shelf for what is on it. */
const TAG_LOW = 492;
const TAG_HIGH = 427;
const TAG_H = 13;

/** Q1: what she could bake — the macarons, the cake, or the sausage rolls in the oven. */
const FIT_Q = [
  { id: 'rolls', label: 'ROLLS', left: MOUTH.x - 19, top: MOUTH.y - 16, w: 34, bottom: TAG_LOW, correct: true },
  { id: 'cake', label: 'CAKE', left: CAKE_AT.x - 16, top: CAKE_AT.y - 16, w: 30, bottom: TAG_LOW, correct: false },
  { id: 'macarons', label: 'MACARONS', left: MAC.x - 29, top: MAC.y - 9, w: 60, bottom: TAG_LOW, correct: false },
];
function FitTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: clamp01(1 - Math.abs(S.value.q - 1)) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {FIT_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.bottom - q.top }}
        >
          <View style={styles.hang}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: how she finds out — her notepad, the recipe book, or the crystal ball. */
const LEARN_Q = [
  { id: 'notepad', label: 'NOTEPAD', left: NOTE_AT.x - 28, top: NOTE_AT.y - 10, w: 56, bottom: TAG_LOW, correct: true },
  { id: 'recipe-book', label: 'RECIPES', left: BOOK_AT.x - 21, top: BOOK_AT.y - 15, w: 42, bottom: TAG_HIGH, correct: false },
  { id: 'crystal-ball', label: 'CRYSTAL BALL', left: BALL_AT.x - 36, top: BALL_AT.y - 15, w: 72, bottom: TAG_HIGH, correct: false },
];
function LearnTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: clamp01(S.value.q - 1) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {LEARN_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.bottom - q.top }}
        >
          <View style={styles.hang}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{q.label}</Text>
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
  under: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: TOP + 24, overflow: 'hidden' },
  board: {
    position: 'absolute', left: 150, top: 344, width: 100, height: 24, borderRadius: 3,
    // the shop's painted sign, in the same duck-egg as its counter and window frame (AR1)
    backgroundColor: NATURAL.duckEgg.base, borderWidth: 1.4, borderColor: INK, alignItems: 'center', justifyContent: 'center',
    boxShadow: lipOf(TONE),
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 16, letterSpacing: 2.4, color: NATURAL.duckEgg.label,
    includeFontPadding: false,
  },
  mouthGlow: {
    position: 'absolute', left: MOUTH.x - MOUTH.w / 2 + 1, top: MOUTH.y - MOUTH.h / 2 + 1, width: MOUTH.w - 2, height: MOUTH.h - 2,
    borderRadius: 1, backgroundColor: NATURAL.ovenGlow.base,
  },
  door: {
    position: 'absolute', left: MOUTH.x - MOUTH.w / 2, top: MOUTH.y - MOUTH.h / 2, width: MOUTH.w, height: MOUTH.h,
    transformOrigin: '50% 100%',
  },
  doorGlass: {
    position: 'absolute', left: MOUTH.w / 2 - 16, top: MOUTH.h * (17.5 / 30) - 8 * OSY, width: 32, height: 16 * OSY,
    borderRadius: 1, backgroundColor: NATURAL.ovenGlow.base,
  },
  stream: { position: 'absolute', width: 1.6, borderRadius: 0.8, backgroundColor: NATURAL.tea.base },
  wisp: { position: 'absolute', left: -0.7, top: -4, width: 1.4, height: 8, borderRadius: 0.7, backgroundColor: RULE },
  hang: { flexGrow: 1, justifyContent: 'flex-end' },
  tag: {
    height: TAG_H, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2, borderColor: INK, boxShadow: lipOf(TONE),
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
    alignSelf: 'stretch', textAlign: 'center',
  },
});

export function Biz2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz2Scene} band={[306, 514]} camera={CAM} />;
}
