import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import LessonPicture from './LessonPicture';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './hist1Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, pencil, shopFront, shopDoor, glassShards, noticeBoard, BOARD_CORK,
} from './objects';
import { BY_ID } from './wardrobe';
import { EMBER } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-1, "What Is History?" — A BAKERY'S BROKEN WINDOW, IN THE MORNING.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The shopkeeper (the cap, who thinks the best
// of everyone) finds his window smashed and blames the wind; the neighbour (the bun,
// cheerful and a step behind) is only pleased to see her football lying in it; the
// historian (the top hat) shows how the past is worked out, and where politics begins.
//
//   b0   the shopkeeper walks in from the right, throws up his hands at the window,
//        then points down at the twig on the pavement — the wind.
//   b1   the neighbour walks in from the left pointing, delighted, at her ball.
//   b2   the historian walks in from the left (behind her), tips his hat, and
//        crouches over the glass on the pavement.
//   b3   the neighbour lays a hand on her chest, mimes one small kick, and points at
//        the window; the historian rises and turns to her.
//   b4   Q1: the ball in the window, the twig on the pavement, the shut door — tap one.
//   b5   the historian opens a hand to her, turns, and opens it to him.
//   b6   the shopkeeper turns out an empty pocket, spreads his hands, and looks up at
//        the hole.
//   b7   the historian steps from the window to the notice board and raises a hand
//        to it.
//   b8   Q2: three questions are pinned over the board's opening hours — tap one.
//   b9   she steps to the board and pins up a card, writes the rule on it, then looks
//        down at her own kicking foot, hands to her face.
//
// COMPOSITION, in stage units. One street front 0–400 × 318–500: the neighbour's brick
// wall 0–97, then the bakery painted green — cornice and fascia (BAKERY in its gilt
// moulding, 106–390 × 331–352), the notice board on its left pier 100–192 × 380–470
// (cork 105–187 × 387–465), the shut door 196–234 × 400–500 in its reveal, and the
// display window 246–390 × 374–456 over a panelled stallriser, its sill at 456. The
// break is at (304, 402); two loaves and the football (326, 444) sit on the display
// bed among fallen glass; more glass lies on the pavement at 278–322, and a twig at
// 328–364. The NEIGHBOUR stands at 80 in front of the brick (92 when she pins her
// card), the HISTORIAN comes in to 262 by the glass and later to 206 beside the board,
// and the SHOPKEEPER stands at 372. Hands meet what they touch within the rig's safe
// reach (~23 units from the shoulder at K 0.76): the board is at eye height for that
// reason, and a thing on the pavement is looked at crouching. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, history-foundations-1). 0 for a beat with no voice.
 */
const LINES = [3.96, 4.09, 6.43, 4.85, 0, 7.11, 6, 5.32, 0, 6.29, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// hands on the hips, arms folded, leaning in; and, for looking at the glass, a posture.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
/** Posture 13: down on the haunches, peering at the floor. */
const CROUCH = 13;
const HIPS = 163;
const FOLD = 161;
const LEAN = 177;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_FIND = is('find');
const A_BALL = is('ball');
const A_ARRIVE = is('arrive');
const A_ALIBI = is('alibi');
const A_SOURCE = is('source');
const A_PAY = is('pay');
const A_TURN = is('turn');
const A_RULE = is('rule');
const RULE_N = A_RULE.indexOf(1);
const BOARD_V = BEATS.map((b) => b.board ?? 0);
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const S_X0 = 430;
const N_X0 = -30;
const H_X0 = -24;
const S_LEGS: Track[] = BEATS.map(() => [[0, 372]]);
const S_TURN: Track[] = BEATS.map(() => [[0, -1]]);
const N_LEGS: Track[] = BEATS.map((_, n) => (n === 0 ? [[0, N_X0]] : n < RULE_N ? [[0, 80]] : [[0.02, 92]]));
const N_TURN: Track[] = BEATS.map(() => [[0, 1]]);
const H_LEGS: Track[] = [
  [[0, H_X0]], [[0, H_X0]], [[0, 262]], [[0, 262]], [[0, 262]], [[0, 262]], [[0, 262]],
  [[0.08, 206]], [[0, 206]], [[0, 206]], [[0, 206]], [[0, 206]],
];
const H_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1]], [[0.04, -1]], [[0, -1]], [[0, -1], [0.48, 1]], [[0, 1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const S_P = [TALK, LISTEN, NOD, HIPS, FOLD, NOD, TALK, LISTEN, NOD, NOD, NOD, LISTEN];
const N_P = [LISTEN, TALK, LEAN, TALK, LISTEN, NOD, NOD, NOD, HIPS, TALK, LISTEN, LISTEN];
const H_P = [LISTEN, LISTEN, EXPLAIN, LISTEN, NOD, EXPLAIN, NOD, EXPLAIN, LISTEN, NOD, NOD, LISTEN];

// ── the street front and what is in it ───────────────────────────────────────
const FRONT_ART = shopFront(200, 409, 400, 182);
const DOOR = { left: 196, top: 400, w: 38, h: 100 };
const DOOR_ART = shopDoor(DOOR.left + DOOR.w / 2, DOOR.top + DOOR.h / 2, DOOR.w, DOOR.h);
const BREAK = { x: 304, y: 402 };
const BALL = { x: 326, y: 444, d: 16 };
const INNER_GLASS_ART = glassShards(330, 430, 40, 40);
const TWIG = { x: 346, y: 493 };
/** The pencil she writes the rule with (AR2): lying point-left, held a third from its end. */
const PENCIL_ART = pencil(0, 0, 13, 3);

// ── the notice board on the pier by the door ────────────────────────────────
const BOARD = { x: 146, y: 425, w: 92, h: 90 };
const BOARD_ART = noticeBoard(BOARD.x, BOARD.y, BOARD.w, BOARD.h);
const CORK = {
  left: BOARD.x + (BOARD_CORK.x - BOARD_CORK.w / 2 - 50) * (BOARD.w / 100),
  top: BOARD.y + (BOARD_CORK.y - BOARD_CORK.h / 2 - 50) * (BOARD.h / 100),
};
/** The three question slips, and the rule card she pins over them. */
const SLIP_L = 103;
const SLIP_W = 86;
const SLIPS = [
  { top: 390, h: 18 },
  { top: 411, h: 24 },
  { top: 438, h: 24 },
];
const CARD = { left: 112, top: 406, w: 66, h: 46 };
/** Where her hand presses the card to the board and writes on it: its near edge. */
const CARD_HAND = { x: 114, y: 428 };
/**
 * The three lines of the rule, as fractions of her line: WHOEVER, KICKS IT, and — after
 * a pause to think, longer than a breath — PAYS. Her hand runs R_REACH along each.
 */
const R_ROWS = [[0.28, 0.4], [0.44, 0.55], [0.74, 0.8]] as const;
const R_REACH = 8;
/** The card's grip: the middle of its near edge, where her fingers hold it. */
const CARD_GRIP = { x: CARD.left + 2, y: CARD.top + CARD.h / 2 };

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
/**
 * One small kick, forward: the front foot swung out and up, the body leaning back
 * over the planted foot and the back arm thrown out for balance. `w` is the kick's
 * own bump, so it happens once and is caused (AL: nothing rises on a clock).
 */
function kickOf(s: Stance, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return {
    ...s,
    tilt: s.tilt - 0.12 * w,
    footR: { x: lerp(s.footR.x, 19, w), y: lerp(s.footR.y, -11, w) },
    footL: { x: lerp(s.footL.x, -4, w), y: s.footL.y },
    fistL: { x: lerp(s.fistL.x, -13, w), y: lerp(s.fistL.y, 2, w) },
  };
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

const CAM = followMoves(N_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('history'));

export default function Hist1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const heldN = useHeld();
  const heldH = useHeld();
  const cv = useCarry(16);
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

    // ── the shopkeeper ──────────────────────────────────────────────────────
    const ws = legsOf(carrySource(cv, 0, n, S_X0), S_LEGS[n], b, L);
    const xS = carry(cv, 0, n, ws.x, ws.x, 1);
    const dS = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), S_TURN[n], b, L), 1);
    let ss = bodyOf(ws, S_P, n, t, b);
    if (A_FIND[n]) {
      // "My window!" — both hands thrown up IN FRONT of him, at the window he faces
      // (AR4); then, "it must have been the wind", a hand out and down at the twig
      const up = bp(0.2, 0.3, 0.6);
      ss = hand(ss, xS, dS, 1, xS + 22 * dS, 432, up);
      ss = hand(ss, xS, dS, -1, xS + 9 * dS, 428, up);
      ss = hand(ss, xS, dS, 1, TWIG.x, TWIG.y, bp(0.66, 0.78, 0.98));
      ss = lookOf(ss, -0.26, bp(0.18, 0.28, 0.62));
    }
    if (A_PAY[n]) {
      // the pocket turned out, empty; hands spread at "somebody ought to pay"; and then
      // he looks up at the hole
      ss = hand(ss, xS, dS, 1, xS + 3 * dS, 472, bp(0.05, 0.13, 0.3));
      // both palms open in front of him, never one thrown back behind (AR4)
      const spread = bp(0.4, 0.5, 0.68);
      ss = hand(ss, xS, dS, 1, xS + 17 * dS, 458, spread);
      ss = hand(ss, xS, dS, -1, xS + 5 * dS, 460, spread);
      ss = lookOf(ss, -0.32, st(0.66, 0.78));
    }
    const prevS = carryFrom(heldS, n, hHold(S_P[p], t));
    const figS = keepHeld(heldS, ws.walking ? mixKeepLegs(prevS, ss, tr) : mixStance(prevS, ss, tr));

    // ── the neighbour ───────────────────────────────────────────────────────
    const wn = legsOf(carrySource(cv, 2, n, N_X0), N_LEGS[n], b, L);
    const xN = carry(cv, 2, n, wn.x, wn.x, 1);
    const dN = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), N_TURN[n], b, L), 1);
    let sn = bodyOf(wn, N_P, n, t, b);
    // b1: pointing at her ball as she comes, all the way along
    if (A_BALL[n]) sn = hand(sn, xN, dN, 1, BALL.x, BALL.y, st(0.16, 0.28) * (1 - st(0.86, 0.98)));
    if (A_ALIBI[n]) {
      // "It can't have been me" — a hand to her chest; one small kick; "towards the
      // shop" — a hand out at the window it went through
      sn = hand(sn, xN, dN, 1, xN + 4 * dN, 452, bp(0.02, 0.1, 0.22));
      sn = kickOf(sn, bp(0.28, 0.37, 0.5));
      sn = hand(sn, xN, dN, 1, BREAK.x, BREAK.y, bp(0.7, 0.8, 0.98));
    }
    if (A_RULE[n]) {
      // a card out of her pocket, pressed onto the board, the rule written on it — and
      // then she sees who it is about: her own foot, hands to her face
      sn = hand(sn, xN, dN, 1, xN + 3 * dN, 472, bp(0.04, 0.1, 0.16));
      // the rule is WRITTEN, a line at a time (AR5): the hand runs along a line, back to
      // the start of the next, and after the second line she stops to think before the
      // last word — so no stroke repeats more than twice in a row
      const r1 = st(R_ROWS[0][0], R_ROWS[0][1]);
      const r2 = st(R_ROWS[1][0], R_ROWS[1][1]);
      const r3 = st(R_ROWS[2][0], R_ROWS[2][1]);
      const back1 = st(R_ROWS[0][1], R_ROWS[1][0]);
      const back2 = st(R_ROWS[2][0] - 0.03, R_ROWS[2][0]);
      // the windows never overlap, so each line's run and each return simply add up
      const along = r1 * (1 - back1) + r2 * (1 - back2) + r3;
      const rowY = 12 * (back1 + back2);
      sn = hand(sn, xN, dN, 1, CARD_HAND.x + R_REACH * along, CARD_HAND.y - 12 + rowY,
        st(0.14, 0.22) * (1 - st(R_ROWS[2][1] + 0.02, R_ROWS[2][1] + 0.07)));
      // the pencil back into her pocket before she sees whom the rule is about
      sn = hand(sn, xN, dN, 1, xN + 3 * dN, 472, bp(0.81, 0.835, 0.86));
      const face = st(0.86, 0.93);
      sn = hand(sn, xN, dN, 1, xN + 9 * dN, 434, face);
      sn = hand(sn, xN, dN, -1, xN + 6 * dN, 440, face);
      sn = lookOf(sn, 0.32, face);
    }
    const prevN = carryFrom(heldN, n, hHold(N_P[p], t));
    const figN = keepHeld(heldN, wn.walking ? mixKeepLegs(prevN, sn, tr) : mixStance(prevN, sn, tr));

    // ── the historian ───────────────────────────────────────────────────────
    const wh = legsOf(carrySource(cv, 4, n, H_X0), H_LEGS[n], b, L);
    const xH = carry(cv, 4, n, wh.x, wh.x, 1);
    const dH = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), H_TURN[n], b, L), 1);
    let sh = bodyOf(wh, H_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived, then down on his heels over the glass
      const after = wh.arrive / L;
      sh = hand(sh, xH, dH, 1, xH + 5 * dH, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.12));
      sh = mixStance(sh, postureStill(CROUCH, t), st(after + 0.12, after + 0.2));
    }
    // b5: an open hand to her, then — turned — to him
    if (A_SOURCE[n]) {
      sh = hand(sh, xH, dH, 1, xH + 22 * dH, 452, bp(0.08, 0.18, 0.44));
      sh = hand(sh, xH, dH, 1, xH + 22 * dH, 452, bp(0.54, 0.64, 0.92));
    }
    // b7: a hand up to the board as he names who decides
    if (A_TURN[n]) sh = hand(sh, xH, dH, 1, BOARD.x, BOARD.y, bp(0.4, 0.5, 0.92));
    const prevH = carryFrom(heldH, n, hHold(H_P[p], t));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the things that change ──────────────────────────────────────────────
    const liningNow = A_PAY[n] ? st(0.12, 0.18) : 0;
    // the card: drawn out of her pocket in her hand (AR6 — it goes where the hand goes),
    // carried up by its near edge and pressed onto the board, where it stays
    const cardNow = A_RULE[n] ? st(0.08, 0.11) : n > RULE_N ? 1 : 0;
    const pinNow = A_RULE[n] ? st(0.21, 0.24) : n > RULE_N ? 1 : 0;
    const nbP = pose(figN, xN, GROUND, K, dN, 1);
    const wrN = { x: nbP.wrR[0].translateX as number, y: nbP.wrR[1].translateY as number };
    // only on its own beat: before it comes out it waits on the board, not off the edge
    // of the stage with her (check:space reads a word at any opacity)
    const offX = A_RULE[n] ? (1 - pinNow) * (wrN.x - CARD_GRIP.x) : 0;
    const offY = A_RULE[n] ? (1 - pinNow) * (wrN.y - CARD_GRIP.y) : 0;
    const writeNow = A_RULE[n]
      ? (st(R_ROWS[0][0], R_ROWS[0][1]) + st(R_ROWS[1][0], R_ROWS[1][1]) + st(R_ROWS[2][0], R_ROWS[2][1])) / 3
      : n > RULE_N ? 1 : 0;

    return {
      s: pose(figS, xS, GROUND, K, dS, 1),
      nb: nbP,
      h: pose(figH, xH, GROUND, K, dH, 1),
      hip: { x: xS + 3 * dS, d: dS },
      lining: carry(cv, 6, n, liningNow, liningNow, tr),
      board: carry(cv, 7, n, BOARD_V[p], BOARD_V[n], tr),
      card: carry(cv, 8, n, cardNow, cardNow, tr),
      pin: carry(cv, 12, n, pinNow, pinNow, tr),
      cardX: carry(cv, 13, n, offX, offX, tr),
      cardY: carry(cv, 14, n, offY, offY, tr),
      write: carry(cv, 9, n, writeNow, writeNow, tr),
      // the pencil comes out of her pocket with the card and goes back after the rule
      pencil: carry(cv, 15, n, A_RULE[n] ? st(0.08, 0.11) * (1 - st(0.83, 0.845)) : 0, A_RULE[n] ? st(0.08, 0.11) * (1 - st(0.83, 0.845)) : 0, tr),
      q1: carry(cv, 10, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 11, n, Q2[p], Q2[n], tr),
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.s);
  const DN = useDerivedValue<Bundle>(() => SCENE.value.nb);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.h);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={FRONT_ART} tone={TONE} />
      <View style={styles.fascia} pointerEvents="none">
        <Text style={styles.fasciaText}>BAKERY</Text>
      </View>
      {/* drawn against references in lessonart/lessons/hist1.mjs */}
      <LessonPicture name="hist1-break" />
      <LessonPicture name="hist1-loaves" />
      <Hop kind="hop" on={picked === 'ball'} style={{ left: BALL.x, top: BALL.y }}>
        <LessonPicture name="hist1-ball" />
      </Hop>
      <ObjectArt parts={INNER_GLASS_ART} tone={TONE} line={1} />
      <Hop kind="shake" on={picked === 'door'} style={{ left: 0, top: 0 }}>
        <ObjectArt parts={DOOR_ART} tone={TONE} />
      </Hop>
      <ObjectArt parts={BOARD_ART} tone={TONE} />
      <Board S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <LessonPicture name="hist1-shards" />
      <Hop kind="skitter" on={picked === 'twig'} style={{ left: 346, top: 492 }}>
        <LessonPicture name="hist1-twig" />
      </Hop>
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DN} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: cap */}
      <Stickman D={DS} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <Lining S={SCENE} />
      <Pencil S={SCENE} DN={DN} />
      {on(Q1) ? <EvidenceTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <QuestionTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}


// ── a thing that answers PHYSICALLY when it is picked: the ball hops and lands, the
// door and twig shudder, a wrong slip swings on its pin, the right one pops and settles ──
function Hop({ kind, on, style, children }: {
  kind: 'hop' | 'shake' | 'skitter' | 'swing' | 'pop'; on: boolean; style: any; children: React.ReactNode;
}) {
  const u = useSharedValue(0);
  useEffect(() => {
    u.value = 0;
    if (on) u.value = withTiming(1, { duration: kind === 'hop' ? 900 : 650, easing: Easing.linear });
  }, [on, kind, u]);
  const st = useAnimatedStyle(() => {
    const v = u.value;
    const k = 1 - v;
    if (v <= 0 || v >= 1) return { transform: [{ translateX: 0 }] };
    if (kind === 'hop') {
      // two bounces, each lower than the last, a squash on every landing
      const h = Math.abs(Math.sin(v * Math.PI * 2)) * 15 * k * k;
      const sq = 1 - 0.22 * Math.max(0, 1 - h / 2) * k;
      return { transform: [{ translateY: -h }, { scaleY: sq }, { scaleX: 2 - sq }] };
    }
    if (kind === 'shake') return { transform: [{ translateX: 4 * Math.sin(v * Math.PI * 7) * k }] };
    if (kind === 'skitter') return { transform: [{ translateX: -9 * Math.sin(v * Math.PI * 0.9) }, { rotate: `${-16 * Math.sin(v * Math.PI * 3) * k}deg` }] };
    if (kind === 'swing') return { transform: [{ rotate: `${11 * Math.sin(v * Math.PI * 5) * k}deg` }, { translateY: 2 * Math.sin(v * Math.PI) }] };
    // pop: toward the reader, then settles flat
    return { transform: [{ scale: 1 + 0.16 * Math.sin(v * Math.PI) }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', width: 0, height: 0 }, style, st]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

// ── his pocket, turned out: the white lining hanging at his hip ─────────────

function Lining({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.lining,
    transform: [{ translateX: S.value.hip.x - 3 }, { translateY: 474 }, { rotate: `${8 * S.value.hip.d}deg` }],
  }));
  return <Animated.View style={[styles.lining, st]} pointerEvents="none" />;
}

// ── her pencil: held by its back third, the point forward and down to the card (AR2) ─

function Pencil({ S, DN }: { S: SharedValue<any>; DN: SharedValue<Bundle> }) {
  const st = useAnimatedStyle(() => {
    const w = DN.value.wrR;
    const d = DN.value.dir < 0 ? -1 : 1;
    return {
      opacity: S.value.pencil,
      transform: [
        { translateX: (w[0].translateX as number) + 3 * d }, { translateY: (w[1].translateY as number) + 1.5 },
        { scaleX: -d }, { rotate: '-35deg' },
      ],
    };
  });
  return (
    <Animated.View style={[styles.pencil, st]} pointerEvents="none">
      <ObjectArt parts={PENCIL_ART} tone={TONE} line={0.8} />
    </Animated.View>
  );
}

// ── the notice board: the hours, and the rule she pins over them ────────────

function Board({ S }: { S: SharedValue<any> }) {
  const hours = useAnimatedStyle(() => ({ opacity: clamp01(1 - S.value.board) * (1 - S.value.pin) }));
  const card = useAnimatedStyle(() => ({
    opacity: S.value.card,
    transform: [{ translateX: S.value.cardX }, { translateY: S.value.cardY }],
  }));
  const l1 = useAnimatedStyle(() => ({ width: `${100 * clamp01(S.value.write * 3)}%` }));
  const l2 = useAnimatedStyle(() => ({ width: `${100 * clamp01(S.value.write * 3 - 1)}%` }));
  const l3 = useAnimatedStyle(() => ({ width: `${100 * clamp01(S.value.write * 3 - 2)}%` }));
  return (
    <>
      <View style={[styles.scrap, { left: CORK.left + 4, top: CORK.top + 5, transform: [{ rotate: '-5deg' }] }]} pointerEvents="none">
        <View style={styles.scrapLine} /><View style={styles.scrapLine} /><View style={[styles.scrapLine, styles.scrapShort]} />
      </View>
      <View style={[styles.pin, { left: CORK.left + 11, top: CORK.top + 3 }]} pointerEvents="none" />
      <View style={[styles.scrap, { left: CORK.left + 62, top: CORK.top + 58, transform: [{ rotate: '6deg' }] }]} pointerEvents="none">
        <View style={styles.scrapLine} /><View style={[styles.scrapLine, styles.scrapShort]} />
      </View>
      <View style={[styles.pin, { left: CORK.left + 69, top: CORK.top + 56 }]} pointerEvents="none" />
      <Animated.View style={[styles.hours, hours]} pointerEvents="none">
        <Text style={styles.cardText}>OPEN</Text>
        <Text style={styles.cardText}>8 – 6</Text>
        <View style={[styles.pin, styles.pinTop]} />
      </Animated.View>
      <Animated.View style={[styles.card, card]} pointerEvents="none">
        <Animated.View style={[styles.reveal, l1]}>
          <Text style={styles.ruleText}>WHOEVER</Text>
        </Animated.View>
        <Animated.View style={[styles.reveal, l2]}>
          <Text style={styles.ruleText}>KICKS IT,</Text>
        </Animated.View>
        <Animated.View style={[styles.reveal, l3]}>
          <Text style={styles.ruleText}>PAYS</Text>
        </Animated.View>
        <View style={[styles.pin, styles.pinTop]} />
      </Animated.View>
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three things. The ball lying in the glass is what the breaking left behind. */
const EVIDENCE_Q = [
  { id: 'ball', left: BALL.x - 12, top: BALL.y - 12, w: 24, h: 24, r: 12, correct: true },
  { id: 'twig', left: 326, top: 485, w: 40, h: 16, r: 5, correct: false },
  { id: 'door', left: DOOR.left, top: DOOR.top, w: DOOR.w, h: DOOR.h, r: 3, correct: false },
];
function EvidenceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {EVIDENCE_Q.map((q) => (
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

/** Q2: three slips pinned to the board. Who decides who pays is the question of politics. */
const QUESTION_Q = [
  { id: 'broke', lines: ['WHO BROKE IT?'], correct: false },
  { id: 'cost', lines: ['WHAT DOES', 'GLASS COST?'], correct: false },
  { id: 'decides', lines: ['WHO DECIDES', 'WHO PAYS?'], correct: true },
];
function QuestionTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {QUESTION_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={2}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLIP_L, top: SLIPS[k].top, width: SLIP_W, height: SLIPS[k].h }}
        >
          <View style={styles.slipBox}>
            <Hop kind={q.correct ? 'pop' : 'swing'} on={picked === q.id} style={{ left: 0, top: 0 }}>
              <View style={[styles.slip, { width: SLIP_W, height: SLIPS[k].h }]}>
                {q.lines.map((l) => <Text key={l} style={styles.slipText}>{l}</Text>)}
                <View style={[styles.pin, styles.pinSlip]} />
              </View>
            </Hop>
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
  fascia: {
    position: 'absolute', left: 108, top: 333, width: 280, height: 17, alignItems: 'center', justifyContent: 'center',
  },
  fasciaText: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, lineHeight: 15, letterSpacing: 4,
    color: NATURAL.shopPaint.label, includeFontPadding: false,
  },
  pencil: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, zIndex: 3 },
  lining: {
    position: 'absolute', left: 0, top: 0, width: 6, height: 8, borderRadius: 1.5,
    backgroundColor: PLATE_FACE, borderWidth: 1, borderColor: INK, transformOrigin: '50% 0%',
  },
  scrap: {
    position: 'absolute', width: 16, height: 13, paddingTop: 3, paddingHorizontal: 2.5, gap: 2,
    backgroundColor: NATURAL.paper.base, borderWidth: 0.8, borderColor: INK,
  },
  scrapLine: { height: 1, backgroundColor: INK, opacity: 0.6 },
  scrapShort: { width: '60%' },
  pin: {
    position: 'absolute', width: 3.4, height: 3.4, borderRadius: 1.7, backgroundColor: EMBER,
    borderWidth: 0.6, borderColor: INK,
  },
  pinTop: { left: '50%', marginLeft: -1.7, top: -1 },
  pinSlip: { left: 1.5, top: -2 },
  hours: {
    position: 'absolute', left: BOARD.x - 24, top: BOARD.y - 15, width: 48, height: 30,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2, borderColor: INK, boxShadow: `0px 2px 0px ${TONE.SHADE}`,
  },
  card: {
    position: 'absolute', left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h,
    justifyContent: 'center', paddingLeft: 5,
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2, borderColor: INK, boxShadow: `0px 2px 0px ${TONE.SHADE}`,
  },
  reveal: { overflow: 'hidden', height: 13 },
  ruleText: {
    fontFamily: 'Caveat_700Bold', fontSize: 13, lineHeight: 13, color: INK, includeFontPadding: false, width: 56,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  slipText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
  slipBox: { flexGrow: 1 },
  slip: {
    alignItems: 'center', justifyContent: 'center', paddingLeft: 1, paddingRight: 10,
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2, borderColor: INK, boxShadow: `0px 2px 0px ${TONE.SHADE}`,
  },
});

export function Hist1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist1Scene} band={[306, 514]} camera={CAM} />;
}
