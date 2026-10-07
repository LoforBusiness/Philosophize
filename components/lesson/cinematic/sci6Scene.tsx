import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, interpolateColor, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './sci6Script';
import {
  WALK, U, clamp01, ease01, lerp, mixStance, moveTr, pose, seated, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo, headStage } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, sc6Cot, sc6Blanket, sc6Lantern, 
  sc6Tonic, sc6OnionBrown, sc6CaseBottle, sc6Vinegar, sc6Phial, sc6Basket, sc6Orange, sc6LedgerShut,
  sc6LedgerOpen, SC6_TONIC_GRIP, SC6_BASKET_GRIP, SC6_COT_AT,
} from './objects';
import { BY_ID } from './wardrobe';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-6, "Did the Cure Work?" — BELOW DECKS ON A SAILING SHIP, 1747.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The sick bay of a man-of-war, after James
// Lind's trial on HMS Salisbury: whitewashed planking between dark frames, hammocks
// slung from the beams, a tin lantern swinging as the ship rolls, a gun port with the
// sea tilting past it. The sailor (the cap) lies sick in a hammock slung low; the
// captain (the plain one) swears by his seawater tonic; the surgeon (the top hat) runs
// the test.
//
//   b0   the sailor, propped in his hammock: a hand to his sore gums, a forearm held
//        up to look at it, then a hand out at the hammocks across the bay.
//   b1   the captain lifts his bottle of seawater tonic and swirls it twice; smug.
//   b2   the surgeon points to the hammocks two at a time: the sailor's pair, then he
//        walks along under the next pair, and points up at the last.
//   b3   from the basket on his arm he sets the seawater down by the first pair and
//        the vinegar by the second, and hangs the basket of oranges and lemons on the
//        sailor's hammock.
//   b4   Q1, PULL THE RIGHT NOTE: three notes pinned to the mast. The right one comes
//        off its nail into the light; a wrong one swings round on its nail and tears.
//   b5   SIX DAYS LATER (morning light through the port, six chalk strokes on the
//        chest): the sailor throws off his blanket, gets out of his hammock, takes an
//        orange from the basket and dances a jig with it held high. His messmate's
//        hammock above is empty: he is up on deck.
//   b6   the captain sniffs his bottle and frowns up at his seawater men, still in
//        their hammocks (one of them stirs); a flick of the hand at them.
//   b7   the surgeon takes his ledger off the shelf, opens it and runs a finger down
//        its two columns: ticks under the orange, crosses under the seawater.
//   b8   he puts it back, taps his chest twice, and lifts the two bottles off the
//        shelf — a blue one and a brown one, nothing alike — and holds them up.
//   b9   Q2, LABEL THE BOTTLES: three pairs on the surgeon's chest. The right pair
//        (the same bottle twice, no labels) shuffles round like a shell game; a wrong
//        pair rattles and its tag drops off.
//   b10  the captain takes a stick of chalk from his pocket and writes MIRACLE CURE on
//        the slate that hangs from his bottle, and holds it up.
//   b11  at ease under the quotation, the sun on the sea through the port.
//
// COMPOSITION, in stage units. The deckhead (the deck above, seen from under it)
// 270–296, its beams' ends hanging under it at the frames. The planking 280–476, the
// frames at 64, 152, 244 and 330. The deck 476–506, the floor's lit edge at 506. The
// mast at 40 (30–50), 278–508; Q1's notes, 56 × 44, are pinned on it at 12–68, their
// middles at 330, 380 and 430. The captain stands at 92, facing in. The surgeon's sea
// chest is 120–264 × 452–480 against the planking; Q2's pairs stand on it, 44 wide,
// their middles at 144, 192 and 240. The hammocks hang from hooks at 299: the seawater
// pair at 80 and 116, the vinegar pair at 182 and 218, the sailor's messmate at 350
// (each 36 × 49). The sailor's own hammock is slung low, 300–398, its bed at 469, his
// pelvis at 344 and his head on the pillow at the right. The lantern hangs from 299 at
// 148; the gun port is 248–276 × 368–396 with a shelf under it at 230–278 × 436 holding
// the ledger and two bottles. The surgeon's home is 270; the seawater is set down at
// 108 and the vinegar at 192, on the deck in front of the chest; the basket hangs on
// the sailor's hammock at (304, 440). Band [282, 514].
//
// SIMPLE ON PURPOSE (AP7): never more than two people moving at once. A listener's life
// is his head (N21); a hand moves only to reach, hold, set down, point, tap or write
// (AP18), and every stroke plays at most twice (AR5). THE SHIP'S ROLL IS THE LIFE OF
// THE PLACE and it never touches a person: the lantern swings, the far hammocks sway on
// their hooks, the horizon tilts in the port and the sunlight slides on the deck — all
// on the clock, all gentle.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const TR = 0.85;
/** 76 units of figure in a 232-unit band: a third. */
const K = K_FIG * 0.74;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-6), except b3 (two things set down,
 * a basket hung up and a walk the length of the bay), b5 (out of the hammock, the
 * orange and the jig), b8 (the ledger put back, the bottles lifted and put back) and
 * b10 (the chalk), which run on a little after their lines.
 */
const LINES = [4.89, 4.93, 6.52, 5.8, 0, 5.4, 4.49, 4.7, 6.6, 0, 3.7, 0, 0];

// The held poses (moves.ts act + 99), with still hands (AP18).
const TALK = 167;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_SICK = is('sick');
const A_TONIC = is('tonic');
const A_PAIRS = is('pairs');
const A_REMEDY = is('remedies');
const A_DANCE = is('dance');
const A_LUCKY = is('lucky');
const A_COMPARE = is('compare');
const A_HOPE = is('hope');
const A_MIRACLE = is('miracle');
const A_REST = is('rest');
const LATER = BEATS.map((b) => b.later ?? 0);
const Q1 = BEATS.map((b) => (b.same ? 1 : 0));
const Q2 = BEATS.map((b) => (b.bottles ? 1 : 0));
const PAIRS_N = A_PAIRS.indexOf(1);
const REMEDY_N = A_REMEDY.indexOf(1);
const DANCE_N = A_DANCE.indexOf(1);
const COMPARE_N = A_COMPARE.indexOf(1);
const Q2_N = Q2.indexOf(1);
/** The three pairs stand on the chest from the second question on. */
const PAIRS_ON = BEATS.map((_, k) => (k >= Q2_N ? 1 : 0));

type Track = readonly (readonly number[])[];

// ── the place ────────────────────────────────────────────────────────────────
const FLOOR = 500;
const DECK_TOP = 476;
const HOOK_Y = 299;
const FRAMES = [64, 150, 296, 372];

// ── the people ───────────────────────────────────────────────────────────────
const CAPT_X = 92;
const SUR_HOME = 270;
/** The sailor's hammock, and the bed in it he lies on. */
const COT_X = 349;
const COT_W = 98;
const COT_H = 172;
const BED = HOOK_Y + (SC6_COT_AT.bed / SC6_COT_AT.of.h) * COT_H;
const CAP_BED_X = 344;
/** Where he stands to dance, having stepped to the basket. */
const CAP_STAND = 332;

// ── the things, and where they are put ──────────────────────────────────────
const SEA_SPOT = 134;
const VIN_SPOT = 192;
/** The basket's hook on the sailor's hammock clew. */
const HOOK = { x: 311, y: 440 };
const SHELF = { x: 240, y: 436 };
const LEDGER_HOME = { x: 252, y: 433.3 };
const BLUE_HOME = { x: 233, y: 436 };
const BROWN_HOME = { x: 222, y: 436 };

// sizes, as drawn, and the grip each is drawn about
const BOT = { w: 8, h: 19, grip: 5 };
const BASKET = { w: 24, h: 21 };
const BASKET_GRIP_Y = (SC6_BASKET_GRIP.y / SC6_BASKET_GRIP.of.h) * BASKET.h;
const TONIC = { w: 15, h: 23 };
const TONIC_GRIP_Y = (SC6_TONIC_GRIP.y / SC6_TONIC_GRIP.of.h) * TONIC.h;
const BLUE = { w: 8, h: 20, grip: 5 };
const BROWN = { w: 11, h: 17, grip: 5.6 };

// ── the people's poses, beat by beat ────────────────────────────────────────
//              b0    b1    b2    b3    q1    b5    b6    b7    b8    q2    b10   b11   b12
const SUR_P = [NOD, NOD, TALK, TALK, WAIT, NOD, NOD, TALK, TALK, WAIT, NOD, NOD, NOD];
const CAPT_P = [NOD, TALK, NOD, NOD, WAIT, NOD, TALK, NOD, NOD, WAIT, TALK, NOD, NOD];
const CAP_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, NOD, WAIT, NOD, NOD, NOD];
/** Listeners nod along (N21): 1 nods, 0 is busy or talking. */
const SUR_NOD = [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1];
const CAPT_NOD = [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];
const CAP_NOD = [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1];

/** The surgeon's walks: [share of line, x]. */
const SUR_LEGS: Track[] = BEATS.map((_, n) => {
  if (A_PAIRS[n]) return [[0.3, 216], [0.58, 140]];
  if (A_REMEDY[n]) return [[0.02, 152], [0.25, 206], [0.44, 290], [0.84, SUR_HOME]];
  if (A_HOPE[n]) return [[0.33, 246], [0.9, SUR_HOME]];
  // every other beat he is at home — and a reader who tapped through a walk sees him
  // finish it from where he was, rather than stop there for the rest of the lesson
  return [[0, SUR_HOME]];
});
/** And his turns: [share of line, facing]. */
const SUR_TURN: Track[] = BEATS.map((_, n) => {
  if (n < PAIRS_N) return [[0, 1]];
  if (A_PAIRS[n]) return [[0, 1], [0.27, -1]];
  if (A_REMEDY[n]) return [[0, -1], [0.22, 1], [0.8, -1], [0.95, 1]];
  if (n < COMPARE_N) return [[0, 1]];
  if (A_HOPE[n]) return [[0, -1], [0.88, 1], [0.97, -1]];
  return [[0, -1]];
});

// ── the objects, drawn about the point they are held or hung by ─────────────
const COT_ART = sc6Cot(0, 0, COT_W, COT_H);
const BLANKET_ART = sc6Blanket(0, 0, 44, 10);
const LANTERN_ART = sc6Lantern(0, 30 / 2 - 1.6, 16, 30);
const TONIC_ART = sc6Tonic(0, TONIC.h / 2 - TONIC_GRIP_Y, TONIC.w, TONIC.h);
const SEA_ART = sc6CaseBottle(0, BOT.h / 2 - BOT.grip, BOT.w, BOT.h);
const VIN_ART = sc6Vinegar(0, BOT.h / 2 - BOT.grip, BOT.w, BOT.h);
const BASKET_ART = sc6Basket(0, BASKET.h / 2 - BASKET_GRIP_Y, BASKET.w, BASKET.h);
const ORANGE_ART = sc6Orange(0, 0, 7, 7);
const SHUT_ART = sc6LedgerShut(0, 0, 18, 5.4);
const OPEN_ART = sc6LedgerOpen(0, 0, 38, 25);
const BLUE_ART = sc6Phial(0, BLUE.h / 2 - BLUE.grip, BLUE.w, BLUE.h, 'blue');
const BROWN_ART = sc6OnionBrown(0, BROWN.h / 2 - BROWN.grip, BROWN.w, BROWN.h);
/** The hammocks across the bay: [x, which pair]. The messmate's (pair 2) empties on b5. */
const FAR: [number, number][] = [[76, 0], [118, 0], [178, 1], [222, 1], [350, 2]];

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, gy: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A body leant (+ forward) and a head tipped (+ down); the hands go with the chest (AR8). */
function leanOf(s: Stance, tilt: number, neck: number): Stance {
  'worklet';
  const t0 = s.tilt;
  const t1 = s.tilt - tilt;
  const dx = -U.spine * (Math.sin(t1) - Math.sin(t0));
  const dy = -U.spine * (Math.cos(t1) - Math.cos(t0));
  return {
    ...s, tilt: t1, neck: s.neck - neck,
    fistL: { x: s.fistL.x + dx, y: s.fistL.y + dy },
    fistR: { x: s.fistR.x + dx, y: s.fistR.y + dy },
  };
}
/** Knees bent by `c` (0 → 1) to put a thing down: the pelvis comes down, the feet stay. */
function crouch(s: Stance, c: number): Stance {
  'worklet';
  return c <= 0 ? s : { ...s, bob: s.bob - 5 * c };
}
/** Eased 0 → 1 over [a, z] SECONDS of the beat. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A listener's nod: the head dips and comes back, out of step with the others. */
function nodOf(t: number, ph: number): number {
  'worklet';
  return Math.max(0, Math.sin(t * 1.3 + ph));
}
function lerpP(p: { x: number; y: number }, q: { x: number; y: number }, w: number) {
  'worklet';
  return { x: p.x + (q.x - p.x) * w, y: p.y + (q.y - p.y) * w };
}
/**
 * Where a figure stands at time `b` of a beat (seconds), walking its legs in turn. He
 * starts from WHERE HE IS ON SCREEN (`src`), so a tap mid-walk never jumps (group L).
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
  return { x, x0, x1, u: ease01(u), walking, arrive: free };
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
/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

// ── in his hammock: the pelvis stays at CAP_BED_X throughout (AR8) ──────────
/** Sitting up in the hammock, legs out along it under the blanket, hands in his lap. */
const BED_SIT: Stance = {
  tilt: 0.06, neck: -0.04, bob: 3 - U.standH,
  footL: { x: 33, y: 0 }, footR: { x: 35, y: 0 },
  fistL: { x: 12, y: -3 }, fistR: { x: 15, y: -2 }, adv: 0,
};
/** Lying back, his head on the pillow, his hands on his chest. */
const BED_LIE: Stance = {
  ...BED_SIT, tilt: 1.42, neck: -0.5,
  fistL: { x: -9, y: -6 }, fistR: { x: -5, y: -5 },
};
const PUSH_L = { x: -7, y: 2 };
const PUSH_R = { x: -3, y: 3 };
const KNEES_L = { x: 13, y: 3 };
const KNEES_R = { x: 16, y: 4 };
/** How far he lies back, per beat: propped up to talk, lying back to listen. */
const LIE = [0.42, 0.72, 0.72, 0.72, 0.72, 0, 0, 0, 0, 0, 0, 0, 0];

export default function Sci6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const heldP = useHeld();
  const heldC = useHeld();
  const cv = useCarry(32);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const trq = ease01(b / 0.3);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── time on the voyage ─────────────────────────────────────────────────
    const later = carry(cv, 0, n, LATER[p], LATER[n], ease01(b / 2.2));
    // six chalk strokes on the chest, one a day, as the six days pass on b5
    const tallyNow = A_DANCE[n] ? clamp01(b / 1.4) : n > DANCE_N ? 1 : 0;
    const tally = carry(cv, 1, n, tallyNow, tallyNow, A_DANCE[n] ? 1 : tr);

    // ── the surgeon ─────────────────────────────────────────────────────────
    const ws = legsOf(carrySource(cv, 2, n, SUR_HOME), SUR_LEGS[n], b, L);
    const xS = carry(cv, 2, n, ws.x, ws.x, 1);
    const dS = carry(cv, 3, n, 1, faceOf(carrySource(cv, 3, n, 1), SUR_TURN[n], b, L), 1);
    const code = SUR_P[n];
    let ss = ws.walking
      ? travelStance(ws.x0, ws.x1, hHold(code, t), hHold(code, t), hLive(code, t, b), ws.u, WALK, 0)
      : hLive(code, t, b);
    const fS = (lx: number) => {
      'worklet';
      return xS + dS * lx;
    };
    // the basket on his arm, at his hip in front of him, until it is hung up on b3
    let basketHeld = n < REMEDY_N ? 1 : 0;
    let seaHeld = 0;
    let seaPlaced = n > REMEDY_N ? 1 : 0;
    let vinHeld = 0;
    let vinPlaced = n > REMEDY_N ? 1 : 0;
    let lean = 0;
    let dip = 0;
    if (basketHeld > 0 || A_REMEDY[n]) {
      ss = hand(ss, xS, FLOOR, dS, -1, fS(9), 466, 1);
    }
    if (A_PAIRS[n]) {
      // the sailor's pair (up and to the right), then the next pair as he passes
      // under it, then the first pair, up ahead of where he stops
      const a = bp(0.04, 0.12, 0.25);
      ss = hand(ss, xS, FLOOR, dS, 1, fS(22), 420, a);
      const b2 = bp(0.42, 0.48, 0.58);
      ss = hand(ss, xS, FLOOR, dS, 1, fS(14), 418, b2);
      const c = bp(0.74, 0.82, 0.96);
      ss = hand(ss, xS, FLOOR, dS, 1, fS(22), 420, c);
      lean = -0.06 * (a + b2 + c);
    }
    if (A_REMEDY[n]) {
      // the seawater, out of the basket and down on the deck by the first pair
      const s1 = sm(b, 0.05 * L, 0.11 * L);
      const s2 = sm(b, 0.11 * L, 0.18 * L);
      const s3 = sm(b, 0.19 * L, 0.23 * L);
      seaHeld = s1;
      seaPlaced = sm(b, 0.18 * L, 0.19 * L);
      const ht = lerpP(lerpP({ x: fS(9), y: 462 }, { x: fS(16), y: 452 }, s1), { x: SEA_SPOT, y: 472 }, s2);
      ss = hand(ss, xS, FLOOR, dS, 1, ht.x, ht.y, s1 * (1 - s3));
      dip += s2 * (1 - s3);
      // the vinegar, the same, by the second pair
      const v0 = sm(b, 0.32 * L, 0.37 * L);
      const v1 = sm(b, 0.37 * L, 0.42 * L);
      const v2 = sm(b, 0.43 * L, 0.46 * L);
      vinHeld = v0;
      vinPlaced = sm(b, 0.42 * L, 0.43 * L);
      const hv = lerpP(lerpP({ x: fS(9), y: 462 }, { x: fS(16), y: 452 }, v0), { x: VIN_SPOT, y: 472 }, v1);
      ss = hand(ss, xS, FLOOR, dS, 1, hv.x, hv.y, v0 * (1 - v2));
      dip += v1 * (1 - v2);
      // the basket, lifted and hung on the sailor's hammock
      const h0 = sm(b, 0.66 * L, 0.74 * L);
      const h1 = sm(b, 0.74 * L, 0.78 * L);
      basketHeld = 1 - h1;
      const hb = lerpP({ x: fS(9), y: 466 }, HOOK, h0);
      ss = hand(ss, xS, FLOOR, dS, -1, hb.x, hb.y, 1 - h1);
    }
    ss = crouch(leanOf(ss, 0.32 * dip, 0.2 * dip), dip);
    // the ledger (b7): off the shelf, opened at his chest, a finger down two columns
    let ledgerHeld = 0;
    let ledgerOpen = 0;
    let finger = { x: 0, y: 0 };
    let fingerOn = 0;
    let ticks = n > COMPARE_N ? 1 : 0;
    const BOOK_AT = { x: fS(14), y: 446 };
    if (A_COMPARE[n]) {
      const get = sm(b, 0.02 * L, 0.12 * L);
      const up = sm(b, 0.12 * L, 0.2 * L);
      ledgerHeld = up;
      ledgerOpen = sm(b, 0.2 * L, 0.26 * L);
      const book = lerpP(LEDGER_HOME, BOOK_AT, up);
      ss = hand(ss, xS, FLOOR, dS, -1, book.x - 8, book.y + 6, get);
      // the finger: down the near column, then down the far one (one path, AR5)
      const down1 = sm(b, 0.3 * L, 0.5 * L);
      const across = sm(b, 0.52 * L, 0.58 * L);
      const down2 = sm(b, 0.6 * L, 0.8 * L);
      finger = { x: BOOK_AT.x + lerp(-9, 8, across) * dS, y: BOOK_AT.y - 2 + 7 * (across < 0.5 ? down1 : down2) };
      fingerOn = sm(b, 0.24 * L, 0.3 * L) * (1 - sm(b, 0.84 * L, 0.92 * L));
      ss = hand(ss, xS, FLOOR, dS, 1, lerp(book.x + 8, finger.x, fingerOn), lerp(book.y + 6, finger.y, fingerOn), get);
      ticks = 0.5 * down1 + 0.5 * down2;
    }
    // b8: the ledger back on the shelf, two taps on his chest, the two bottles lifted
    let ledgerBack = 0;
    let liftU = 0;
    let reachB = 0;
    let tap = 0;
    if (A_HOPE[n]) {
      const put = sm(b, 0, 0.1 * L);
      ledgerHeld = 1 - sm(b, 0.1 * L, 0.11 * L);
      ledgerOpen = 1 - sm(b, 0, 0.05 * L);
      ledgerBack = put;
      const book = lerpP(BOOK_AT, LEDGER_HOME, put);
      const off = 1 - sm(b, 0.1 * L, 0.14 * L);
      ss = hand(ss, xS, FLOOR, dS, -1, book.x - 8 * (1 - put), book.y + 6 * (1 - put) + 2 * put, off);
      ss = hand(ss, xS, FLOOR, dS, 1, book.x + 8 * (1 - put), book.y + 6 * (1 - put) + 2 * put, off);
      // a hand flat on his chest, "a man who's sure", and down again
      tap = bp(0.14, 0.2, 0.32);
      ss = hand(ss, xS, FLOOR, dS, 1, fS(5), 452, tap);
      // the bottles: reached for, lifted, held up apart, and put back
      const reach = sm(b, 0.36 * L, 0.44 * L) * (1 - sm(b, 0.95 * L, 0.99 * L));
      reachB = sm(b, 0.43 * L, 0.45 * L) * (1 - sm(b, 0.93 * L, 0.95 * L));
      liftU = sm(b, 0.46 * L, 0.56 * L) * (1 - sm(b, 0.84 * L, 0.93 * L));
      const bl = lerpP({ x: BLUE_HOME.x, y: BLUE_HOME.y - BLUE.h + BLUE.grip }, { x: fS(18), y: 424 }, liftU);
      const br = lerpP({ x: BROWN_HOME.x, y: BROWN_HOME.y - BROWN.h + BROWN.grip }, { x: fS(27), y: 432 }, liftU);
      ss = hand(ss, xS, FLOOR, dS, 1, bl.x, bl.y, reach);
      ss = hand(ss, xS, FLOOR, dS, -1, br.x, br.y, reach);
      lean += 0.1 * reach * (1 - liftU);
    }
    ss = leanOf(ss, lean, 0);
    const nodS = carry(cv, 4, n, SUR_NOD[n], SUR_NOD[n], tr) * nodOf(t, 0.4);
    ss = { ...ss, neck: ss.neck + 0.18 * nodS + 0.1 * tap };
    const prevS = carryFrom(heldS, n, hHold(SUR_P[p], t));
    const figS = keepHeld(heldS, ws.walking ? mixKeepLegs(prevS, ss, tr) : mixStance(prevS, ss, tr));
    const sur = pose(figS, xS, FLOOR, K, dS, 1);

    // ── the captain ─────────────────────────────────────────────────────────
    const fP = (lx: number) => {
      'worklet';
      return CAPT_X + lx;
    };
    let sp = hLive(CAPT_P[n], t, b);
    // his bottle, held by the neck at his chest; up to show it off on b1
    let bx = fP(13);
    let by = 452;
    let swirl = 0;
    let look = 0;
    if (A_TONIC[n]) {
      const up = st(0.05, 0.15) * (1 - st(0.56, 0.66));
      bx = lerp(bx, fP(18), up);
      by = lerp(by, 418, up);
      // two swirls, then it rests (AR5)
      const sw = clamp01((b / L - 0.18) / 0.3);
      swirl = 16 * Math.sin(Math.PI * 4 * sw);
      const smug = st(0.7, 0.85);
      sp = leanOf(sp, -0.08 * smug, -0.1 * smug);
    }
    if (A_LUCKY[n]) {
      // a sniff at the bottle's mouth, then up at the hammocks over him, and a flick
      const sniff = bp(0.04, 0.12, 0.24);
      const h = headStage(hHold(CAPT_P[n], t), { x: CAPT_X, groundY: FLOOR, k: K, dir: 1 });
      bx = lerp(bx, h.x + 11, sniff);
      by = lerp(by, h.y + 9, sniff);
      sp = { ...sp, neck: sp.neck - 0.1 * sniff };
      look = 0.32 * st(0.32, 0.42) * (1 - st(0.88, 0.98));
      const flick = bp(0.7, 0.8, 0.92);
      sp = hand(sp, CAPT_X, FLOOR, 1, -1, lerp(fP(9), fP(15), flick), lerp(460, 444, flick), st(0.6, 0.7) * (1 - st(0.93, 1)));
    }
    let chalkOn = 0;
    let write = 0;
    if (A_MIRACLE[n]) {
      // the bottle up at his chest, so its tag hangs where he can write on it; the
      // pencil out of his pocket and ONE stroke along the tag (AR5); then held up
      const up = st(0.02, 0.16);
      bx = lerp(bx, fP(16), up);
      by = lerp(by, 420, up);
      chalkOn = st(0.1, 0.13) * (1 - st(0.96, 1));
      write = clamp01((b / L - 0.22) / 0.5);
      const tagMid = by + TONIC.h - TONIC_GRIP_Y + 4 + 11;
      const pen = st(0.06, 0.2);
      const hx = lerp(fP(4), lerp(bx - 17, bx + 16, write), pen);
      const hy = lerp(472, tagMid + 1, pen);
      sp = hand(sp, CAPT_X, FLOOR, 1, -1, hx, hy, pen * (1 - st(0.95, 1)));
      const show = st(0.78, 0.9);
      bx = lerp(bx, fP(19), show);
      by = lerp(by, 412, show);
    }
    sp = hand(sp, CAPT_X, FLOOR, 1, 1, bx, by, 1);
    const nodP = carry(cv, 5, n, CAPT_NOD[n], CAPT_NOD[n], tr) * nodOf(t, 2.1);
    const lookV = carry(cv, 6, n, look, look, trq);
    sp = { ...sp, neck: sp.neck + 0.18 * nodP + lookV };
    const prevP = carryFrom(heldP, n, hHold(CAPT_P[p], t));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));
    const capt = pose(figP, CAPT_X, FLOOR, K, 1, 1);

    // ── the sailor ──────────────────────────────────────────────────────────
    // edgeW 0 standing → 1 on the hammock's edge; inW 0 legs over the edge → 1 legs in
    // it; lie 0 sitting up → 1 lying back. All of the getting up lives on b5 (AR8.6).
    const inNow = n < DANCE_N ? 1 : A_DANCE[n] ? 1 - sm(b, 0.45, 1.0) : 0;
    const edgeNow = n < DANCE_N ? 1 : A_DANCE[n] ? 1 - sm(b, 1.05, 1.6) : 0;
    const lieNow = A_DANCE[n] ? (1 - sm(b, 0, 0.45)) * LIE[p] : LIE[n];
    const inW = carry(cv, 7, n, inNow, inNow, A_DANCE[n] ? 1 : tr);
    const edgeW = carry(cv, 8, n, edgeNow, edgeNow, A_DANCE[n] ? 1 : tr);
    const lie = carry(cv, 9, n, lieNow, lieNow, A_DANCE[n] ? 1 : tr);
    const stepNow = A_DANCE[n] ? sm(b, 1.65, 2.15) : n > DANCE_N ? 1 : 0;
    const step = carry(cv, 10, n, stepNow, stepNow, A_DANCE[n] ? 1 : tr);
    const xC = lerp(CAP_BED_X, CAP_STAND, step);
    const dC = -1;
    const fC = (lx: number) => {
      'worklet';
      return xC - lx;
    };
    let sc = hLive(CAP_P[n], t, b);
    let orangeHeld = n > DANCE_N ? 1 : 0;
    let jig = 0;
    if (A_DANCE[n]) {
      // a step to the basket, an orange out of it, held up high, and a jig
      const reach = sm(b, 2.05, 2.35);
      orangeHeld = sm(b, 2.33, 2.36);
      const orangeUp = sm(b, 2.55, 2.95) * (1 - sm(b, 5.0, 5.35));
      const ox = lerp(fC(10), fC(15), orangeUp);
      const oy = lerp(458, 434, orangeUp);
      const toHook = reach * (1 - sm(b, 2.4, 2.75));
      sc = hand(sc, xC, FLOOR, dC, 1, lerp(ox, HOOK.x + 2, toHook), lerp(oy, HOOK.y + 12, toHook), reach);
      // the other hand on his hip while he dances
      sc = hand(sc, xC, FLOOR, dC, -1, fC(1), 472, sm(b, 2.7, 3.0) * (1 - sm(b, 5.0, 5.3)));
      jig = sm(b, 2.75, 2.95) * (1 - sm(b, 4.9, 5.1));
      if (jig > 0) {
        // four kicks, a foot at a time, the weight onto the other foot each time
        const ph = (b - 2.75) * Math.PI * 2 * 1.5;
        const kL = Math.pow(Math.max(0, Math.sin(ph)), 1.4) * jig;
        const kR = Math.pow(Math.max(0, -Math.sin(ph)), 1.4) * jig;
        sc = {
          ...sc,
          bob: sc.bob + 2.6 * (kL + kR),
          footL: { x: sc.footL.x + 13 * kL, y: sc.footL.y - 13 * kL },
          footR: { x: sc.footR.x + 13 * kR, y: sc.footR.y - 13 * kR },
        };
      }
    } else if (orangeHeld > 0) {
      sc = hand(sc, xC, FLOOR, dC, 1, fC(10), 458, 1);
    }
    // in the hammock on b0: a hand to his gums, a forearm held up, then the others
    let sb: Stance = BED_SIT;
    let sl: Stance = BED_LIE;
    if (A_SICK[n]) {
      const bedP = { x: CAP_BED_X, groundY: BED, k: K, dir: dC };
      const h = headStage(mixStance(sb, sl, LIE[n]), bedP);
      const jaw = bp(0.06, 0.14, 0.32);
      const arm = bp(0.36, 0.44, 0.62);
      const crew = bp(0.68, 0.76, 0.94);
      sb = reachHandTo(sb, bedP, 1, h.x - 9, h.y + 10, jaw);
      sl = reachHandTo(sl, bedP, 1, h.x - 9, h.y + 10, jaw);
      sb = reachHandTo(sb, bedP, -1, h.x - 18, h.y + 3, arm);
      sl = reachHandTo(sl, bedP, -1, h.x - 18, h.y + 3, arm);
      sb = reachHandTo(sb, bedP, 1, h.x - 26, h.y - 10, crew);
      sl = reachHandTo(sl, bedP, 1, h.x - 26, h.y - 10, crew);
    }
    // sitting up ↔ lying back: the torso rises, the hands push on the canvas
    // ONE placing of the hands for the whole of getting up (AR5): on the canvas beside
    // his hips as he sits up and swings his legs over, then on his knees to push up
    const pushW = A_DANCE[n] ? sm(b, 0.05, 0.3) * (1 - sm(b, 0.95, 1.15)) : 0;
    const kneeW = A_DANCE[n] ? sm(b, 0.95, 1.15) * (1 - sm(b, 1.55, 1.8)) : 0;
    let sBed = mixStance(sb, sl, lie);
    if (pushW > 0.001) sBed = { ...sBed, fistL: lerpP(sBed.fistL, PUSH_L, pushW), fistR: lerpP(sBed.fistR, PUSH_R, pushW) };
    // on the edge: seated at the hammock's own height, feet under the knees
    const se: Stance = { ...seated((FLOOR - BED) / K, t, 12), footL: { x: 8, y: 0 }, footR: { x: 12, y: 0 } };
    const swing = Math.sin(Math.PI * inW);
    let sEB = mixStance(se, sBed, inW);
    if (swing > 0.001) {
      sEB = leanOf(sEB, -0.12 * swing, 0);
    }
    // off the edge and up: a lean forward over the feet, hands on the knees, push up
    const rise = Math.sin(Math.PI * edgeW);
    let sAll = leanOf(mixStance(sc, sEB, edgeW), 0.45 * rise, 0.15 * rise);
    if (pushW > 0.001) sAll = { ...sAll, fistL: lerpP(sAll.fistL, PUSH_L, pushW), fistR: lerpP(sAll.fistR, PUSH_R, pushW) };
    if (kneeW > 0.001) sAll = { ...sAll, fistL: lerpP(sAll.fistL, KNEES_L, kneeW), fistR: lerpP(sAll.fistR, KNEES_R, kneeW) };
    const nodC = carry(cv, 11, n, CAP_NOD[n], CAP_NOD[n], tr) * nodOf(t, 1.3);
    sAll = { ...sAll, neck: sAll.neck + (0.16 + 0.22 * lie) * nodC };
    const prevC = carryFrom(heldC, n, sAll);
    const figC = keepHeld(heldC, mixStance(prevC, sAll, A_DANCE[n] ? 1 : tr));
    const cg = FLOOR + (BED - FLOOR) * inW * edgeW;
    const cap = pose(figC, lerp(xC, CAP_BED_X, edgeW), cg, K, dC, 1);

    // ── the things in hands, on the wrists every frame (AR7.4) ──────────────
    const wSR = wristOf(sur, 'wrR');
    const wSL = wristOf(sur, 'wrL');
    const wPR = wristOf(capt, 'wrR');
    const wPL = wristOf(capt, 'wrL');
    const wCR = wristOf(cap, 'wrR');

    // the basket: on his arm, then on its hook
    const bHeld = carry(cv, 12, n, basketHeld, basketHeld, A_REMEDY[n] ? 1 : trq);
    const basket = { x: lerp(HOOK.x, wSL.x, bHeld), y: lerp(HOOK.y, wSL.y, bHeld), o: 1, r: 0, s: 1 };
    // the two bottles: standing in the basket, in his hand, or on the deck by their pair
    const seaH = carry(cv, 13, n, seaHeld, seaHeld, A_REMEDY[n] ? 1 : trq);
    const seaP = carry(cv, 14, n, seaPlaced, seaPlaced, A_REMEDY[n] ? 1 : trq);
    const vinH = carry(cv, 15, n, vinHeld, vinHeld, A_REMEDY[n] ? 1 : trq);
    const vinP = carry(cv, 16, n, vinPlaced, vinPlaced, A_REMEDY[n] ? 1 : trq);
    const downY = DECK_TOP + 10 - (BOT.h - BOT.grip);
    const seaA = lerpP({ x: basket.x - 5, y: basket.y + 7 }, wSR, seaH);
    const vinA = lerpP({ x: basket.x + 5, y: basket.y + 7 }, wSR, vinH);
    const sea = { x: lerp(seaA.x, SEA_SPOT, seaP), y: lerp(seaA.y, downY, seaP), o: 1, r: 0, s: 1 };
    const vin = { x: lerp(vinA.x, VIN_SPOT, vinP), y: lerp(vinA.y, downY, vinP), o: 1, r: 0, s: 1 };

    // the orange: out of the basket into his hand
    const orH = carry(cv, 17, n, orangeHeld, orangeHeld, A_DANCE[n] ? 1 : trq);
    const orange = { x: lerp(HOOK.x + 2, wCR.x, orH), y: lerp(HOOK.y + 12, wCR.y - 2, orH), o: orH > 0.02 ? 1 : 0, r: 0, s: 1 };

    // the ledger: shut on the shelf, open in his hands
    const lH = carry(cv, 18, n, ledgerHeld, ledgerHeld, A_COMPARE[n] || A_HOPE[n] ? 1 : trq);
    const lO = carry(cv, 19, n, ledgerOpen, ledgerOpen, A_COMPARE[n] || A_HOPE[n] ? 1 : trq);
    const lB = carry(cv, 20, n, ledgerBack, ledgerBack, A_HOPE[n] ? 1 : trq);
    const inHands = { x: (wSL.x + wSR.x) / 2, y: Math.min(wSL.y, wSR.y) - 4 };
    const bookAt = lerpP(LEDGER_HOME, lerpP(inHands, LEDGER_HOME, lB), lH > 0 ? 1 : 0);
    const ledger = { x: bookAt.x, y: bookAt.y, o: 1, r: 0, s: 1 };
    const tk = carry(cv, 21, n, ticks, ticks, A_COMPARE[n] ? 1 : tr);

    // the two bottles on the shelf (b8)
    const rB = carry(cv, 22, n, reachB, reachB, A_HOPE[n] ? 1 : trq);
    const blue = {
      x: lerp(BLUE_HOME.x, wSR.x, rB), y: lerp(BLUE_HOME.y - BLUE.h + BLUE.grip, wSR.y, rB), o: 1, r: 0, s: 1,
    };
    const brown = {
      x: lerp(BROWN_HOME.x, wSL.x, rB), y: lerp(BROWN_HOME.y - BROWN.h + BROWN.grip, wSL.y, rB), o: 1, r: 0, s: 1,
    };

    // the captain's tonic, by the neck in his hand, swirled; the slate hangs from it
    const swirlV = carry(cv, 23, n, swirl, swirl, 1);
    const tonic = { x: wPR.x, y: wPR.y, o: 1, r: swirlV, s: 1 };
    const writeV = carry(cv, 24, n, write, write, A_MIRACLE[n] ? 1 : tr);
    const chalk = { x: wPL.x, y: wPL.y, o: carry(cv, 25, n, chalkOn, chalkOn, A_MIRACLE[n] ? 1 : trq), r: -30, s: 1 };

    // the blanket over his legs, thrown off to the foot of the hammock on b5
    const throwNow = A_DANCE[n] ? sm(b, 0.05, 0.4) : n > DANCE_N ? 1 : 0;
    const thrown = carry(cv, 26, n, throwNow, throwNow, A_DANCE[n] ? 1 : tr);
    const blanket = {
      x: lerp(CAP_BED_X - 17, COT_X - 38, thrown), y: lerp(BED - 3, BED + 2, thrown), o: 1,
      r: lerp(0, -6, thrown), s: lerp(1, 0.62, thrown),
    };

    return {
      t, sur, capt, cap,
      later, tally,
      basket, sea, vin, orange, ledger, ledgerOpen: lO, ticks: tk, blue, brown,
      tonic, write: writeV, chalk, blanket,
      finger, fingerOn: carry(cv, 27, n, fingerOn, fingerOn, A_COMPARE[n] ? 1 : trq),
      q1: carry(cv, 28, n, Q1[p], Q1[n], ease01(b / 0.45)),
      pairsOn: carry(cv, 29, n, PAIRS_ON[p], PAIRS_ON[n], ease01(b / 0.9)),
      stir: carry(cv, 30, n, A_LUCKY[n] ? bp(0.3, 0.42, 0.7) : 0, A_LUCKY[n] ? bp(0.3, 0.42, 0.7) : 0, A_LUCKY[n] ? 1 : tr),
      rest: carry(cv, 31, n, A_REST[n], A_REST[n], tr),
      jig,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.sur);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.capt);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);

  return (
    <View style={styles.scene}>
      <Room S={SCENE} />
      <Port S={SCENE} />
      <Hammocks S={SCENE} />
      <LessonPicture name="sci6-shelf" />
      <LessonPicture name="sci6-chest" />
      <Tally S={SCENE} />
      <Cot />
      <Things S={SCENE} />
      {on(PAIRS_ON) ? <Pairs S={SCENE} picked={picked} live={Q2[i] === 1} /> : null}
      <LessonPicture name="sci6-mast" />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="second" wear={[]} />
      {/* cast: tophat */}
      <Stickman D={DS} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <Blanket S={SCENE} />
      <InHands S={SCENE} />
      <Lantern S={SCENE} />
      <View style={styles.floor} pointerEvents="none" />
      {on(Q1) ? <Notes S={SCENE} picked={picked} onPick={onPick} live={Q1[i] === 1} /> : null}
      {on(Q2) ? <PairTargets S={SCENE} picked={picked} onPick={onPick} live={Q2[i] === 1} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or hung by ──────────────

type At = { x: number; y: number; o: number; r?: number; s?: number };
function Rider({ at, art, children, behind }: {
  at: SharedValue<At>; art: ReturnType<typeof sc6Orange>; children?: ReactNode; behind?: ReactNode;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` }, { scale: at.value.s ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {behind}
      <ObjectArt parts={art} tone={TONE} />
      {children}
    </Animated.View>
  );
}

/** The ship's roll, −1 → 1, on the clock: everything that swings reads it. */
function rollOf(t: number): number {
  'worklet';
  return Math.sin(t * 0.85);
}

// ── the room: the deckhead, the planking, the frames, the deck ──────────────
const SEAMS = [316, 334, 352, 370, 388, 406, 424, 442, 460];
function Room({ S }: { S: SharedValue<any> }) {
  const glow = useAnimatedStyle(() => ({ opacity: 0.2 * (1 - 0.6 * S.value.later) }));
  return (
    <>
      <View style={styles.planking} pointerEvents="none" />
      {SEAMS.map((y) => <View key={y} style={[styles.seam, { top: y }]} pointerEvents="none" />)}
      <Animated.View style={[styles.lampWash, glow]} pointerEvents="none" />
      {FRAMES.map((x) => (
        <View key={x} style={styles.rider} pointerEvents="none">
          <View style={[styles.rib, { left: x - 4.5 }]} />
          <View style={[styles.knee, { left: x - 15 }]} />
        </View>
      ))}
      <View style={styles.deckhead} pointerEvents="none" />
      {FRAMES.map((x) => <View key={x} style={[styles.beamEnd, { left: x - 8 }]} pointerEvents="none" />)}
      <View style={styles.deck} pointerEvents="none" />
      <View style={[styles.deckSeam, { top: 486 }]} pointerEvents="none" />
      <View style={[styles.deckSeam, { top: 496 }]} pointerEvents="none" />
      <View style={styles.wallFoot} pointerEvents="none" />
    </>
  );
}

// ── the gun port: the sea and the sky tilting past as the ship rolls ────────
function Port({ S }: { S: SharedValue<any> }) {
  const view = useAnimatedStyle(() => {
    const r = rollOf(S.value.t);
    return { transform: [{ translateY: 4 * r }, { rotate: `${-5 * r}deg` }] };
  });
  const sky = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(S.value.later, [0, 1], [NATURAL.sc6SkyDusk.base, NATURAL.sc6SkyDay.base]),
  }));
  const sea = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(S.value.later, [0, 1], [NATURAL.sc6SeaDusk.base, NATURAL.sc6SeaDay.base]),
  }));
  const glint = useAnimatedStyle(() => {
    const t = S.value.t;
    return { opacity: 0.25 + 0.6 * S.value.later * (0.5 + 0.5 * Math.sin(t * 2.3)), transform: [{ translateX: 4 * Math.sin(t * 0.7) }] };
  });
  const beam = useAnimatedStyle(() => {
    const r = rollOf(S.value.t - 0.4);
    return { opacity: 0.38 * S.value.later, transform: [{ translateX: 8 * r }, { skewX: '-22deg' }] };
  });
  return (
    <>
      <Animated.View style={[styles.sunbeam, beam]} pointerEvents="none" />
      <View style={styles.portHole} pointerEvents="none">
        <Animated.View style={[styles.portView, view]}>
          <Animated.View style={[styles.portSky, sky]} />
          <Animated.View style={[styles.portSea, sea]} />
          <Animated.View style={[styles.portGlint, glint]} />
        </Animated.View>
      </View>
      <LessonPicture name="sci6-port" />
      <View style={styles.portLid} pointerEvents="none" />
      <View style={styles.portLidRope} pointerEvents="none" />
    </>
  );
}

// ── the hammocks across the bay, swaying on their hooks ─────────────────────
function Sling({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const full = FAR[k][1] < 2;
  const first = FAR[k][1] === 0;
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const r = rollOf(t - 0.5 - 0.15 * k);
    // one of the captain's seawater men turns over in his hammock on b6
    const stir = first ? S.value.stir * Math.sin(t * 5) : 0;
    return { transform: [{ translateX: x }, { translateY: HOOK_Y }, { rotate: `${1.6 * r + 3 * stir}deg` }] };
  });
  // the messmate's hammock: full until six days later, empty after (he is well)
  const fullO = useAnimatedStyle(() => ({ opacity: full ? 1 : 1 - S.value.later }));
  const emptyO = useAnimatedStyle(() => ({ opacity: full ? 0 : S.value.later }));
  return (
    <Animated.View style={[styles.rider, styles.slingPivot, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, fullO]}>
        <LessonPicture name="sci6-hammock-full" />
      </Animated.View>
      {full ? null : (
        <Animated.View style={[styles.rider, emptyO]}>
          <LessonPicture name="sci6-hammock-empty" />
        </Animated.View>
      )}
    </Animated.View>
  );
}
function Hammocks({ S }: { S: SharedValue<any> }) {
  return <>{FAR.map(([x], k) => <Sling key={x} S={S} x={x} k={k} />)}</>;
}

/** The sailor's own hammock, slung low. It hangs still: a man's weight is in it. */
function Cot() {
  return (
    <View style={[styles.rider, { transform: [{ translateX: COT_X }, { translateY: HOOK_Y + COT_H / 2 }] }]} pointerEvents="none">
      <ObjectArt parts={COT_ART} tone={TONE} />
    </View>
  );
}
function Blanket({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.blanket);
  return <Rider at={at} art={BLANKET_ART} />;
}

/** Six chalk strokes on the chest's middle panel, one a day: the fifth across the four. */
function Stroke({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tally * 6 - k) }));
  if (k === 4) return <Animated.View style={[styles.tallyCross, st]} pointerEvents="none" />;
  return <Animated.View style={[styles.tally, { left: k === 5 ? 192 : 176 + k * 3 }, st]} pointerEvents="none" />;
}
function Tally({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2, 3, 4, 5].map((k) => <Stroke key={k} S={S} k={k} />)}</>;
}

// ── the things on the deck and the shelf ────────────────────────────────────
function Things({ S }: { S: SharedValue<any> }) {
  const basket = useDerivedValue<At>(() => S.value.basket);
  const sea = useDerivedValue<At>(() => S.value.sea);
  const vin = useDerivedValue<At>(() => S.value.vin);
  const blue = useDerivedValue<At>(() => S.value.blue);
  const brown = useDerivedValue<At>(() => S.value.brown);
  const shut = useDerivedValue<At>(() => ({ ...S.value.ledger, o: 1 - S.value.ledgerOpen }));
  return (
    <>
      <Rider at={brown} art={BROWN_ART} />
      <Rider at={blue} art={BLUE_ART} />
      <Rider at={shut} art={SHUT_ART} />
      <Rider at={sea} art={SEA_ART} />
      <Rider at={vin} art={VIN_ART} />
      <Rider at={basket} art={BASKET_ART} />
    </>
  );
}

// ── the things in hands, drawn in front of the people who hold them ─────────
function InHands({ S }: { S: SharedValue<any> }) {
  const orange = useDerivedValue<At>(() => S.value.orange);
  const open = useDerivedValue<At>(() => ({ ...S.value.ledger, o: S.value.ledgerOpen }));
  const tonic = useDerivedValue<At>(() => S.value.tonic);
  const chalk = useAnimatedStyle(() => {
    const c = S.value.chalk;
    return { opacity: c.o, transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: '-30deg' }] };
  });
  // the slate hangs straight down from the bottle's neck, whatever the bottle does
  const slate = useAnimatedStyle(() => {
    const b = S.value.tonic;
    // and swings a degree or two from its string as she rolls
    return {
      transform: [
        { translateX: b.x - 22 }, { translateY: b.y + TONIC.h - TONIC_GRIP_Y + 4 },
        { rotate: `${4 + 2.5 * rollOf(S.value.t - 1.2)}deg` },
      ],
    };
  });
  // one stroke along the tag writes both words: the pencil's path is the reveal
  // legible or absent (D35): each word comes up as the pencil passes over it, never
  // clipped part-way
  const row1 = useAnimatedStyle(() => ({ opacity: clamp01((S.value.write - 0.05) / 0.25) }));
  const row2 = useAnimatedStyle(() => ({ opacity: clamp01((S.value.write - 0.55) / 0.25) }));
  const t0 = useAnimatedStyle(() => ({ opacity: clamp01(S.value.ticks * 4) }));
  const t1 = useAnimatedStyle(() => ({ opacity: clamp01(S.value.ticks * 4 - 1) }));
  const t2 = useAnimatedStyle(() => ({ opacity: clamp01(S.value.ticks * 4 - 2) }));
  const t3 = useAnimatedStyle(() => ({ opacity: clamp01(S.value.ticks * 4 - 3) }));
  const finger = useAnimatedStyle(() => ({
    opacity: S.value.fingerOn,
    transform: [{ translateX: S.value.finger.x }, { translateY: S.value.finger.y }],
  }));
  return (
    <>
      <Animated.View style={[styles.slateAt, slate]} pointerEvents="none">
        <View style={styles.slateString} />
        <View style={styles.slate}>
          <Animated.View style={[styles.slateMask, row1]}>
            <Text style={styles.chalkText} numberOfLines={1}>MIRACLE</Text>
          </Animated.View>
          <Animated.View style={[styles.slateMask, row2]}>
            <Text style={styles.chalkText} numberOfLines={1}>CURE</Text>
          </Animated.View>
        </View>
      </Animated.View>
      <Rider at={tonic} art={TONIC_ART} />
      <Animated.View style={[styles.chalk, chalk]} pointerEvents="none" />
      <Rider at={open} art={OPEN_ART}>
        <View style={[styles.colHead, styles.colOrange]} />
        <View style={[styles.colHead, styles.colBottle]} />
        <Animated.View style={[styles.tickMark, { left: -12, top: -3 }, t0]} />
        <Animated.View style={[styles.tickMark, { left: -12, top: 2 }, t1]} />
        <Animated.View style={[styles.crossMark, { left: 6, top: -2 }, t2]} />
        <Animated.View style={[styles.crossMark, { left: 6, top: 3 }, t3]} />
      </Rider>
      <Animated.View style={[styles.fingerTip, finger]} pointerEvents="none" />
      <Rider at={orange} art={ORANGE_ART} />
    </>
  );
}

// ── the lantern on its hook, swinging as she rolls ──────────────────────────
function Lantern({ S }: { S: SharedValue<any> }) {
  const swing = useAnimatedStyle(() => ({ transform: [{ rotate: `${7 * rollOf(S.value.t - 0.9)}deg` }] }));
  const glow = useAnimatedStyle(() => ({ opacity: (1 - 0.65 * S.value.later) * (0.3 + 0.05 * Math.sin(S.value.t * 9.1)) }));
  const flame = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + 0.2 * Math.sin(S.value.t * 11.3) }] }));
  return (
    <Animated.View style={[styles.lanternHook, swing]} pointerEvents="none">
      <Animated.View style={[styles.lanternGlow, glow]} />
      <View style={styles.lanternRope} />
      <View style={styles.lanternAt}>
        <ObjectArt parts={LANTERN_ART} tone={TONE} />
        <Animated.View style={[styles.flame, flame]} />
      </View>
    </Animated.View>
  );
}

// ── answers: the picked thing reacts first, the rest half a second after ─────

/** How far one thing's answer reaction has gone, 0 → 1. */
function phaseOf(ans: number, who: number, k: number): number {
  'worklet';
  if (who < 0) return 0;
  const start = who === k ? 0 : 0.5;
  const u = (ans * 1.8 - start) / 0.9;
  return u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
}
/** The answer, latched: once a thing is picked, the scene keeps what it did. */
function useAnswer(picked: string | null, live: boolean, ids: string[]) {
  const first = live && picked !== null ? ids.indexOf(picked) : -1;
  const ans = useSharedValue(first >= 0 ? 1 : 0);
  const who = useSharedValue(first);
  useEffect(() => {
    if (!live || picked === null) return;
    const k = ids.indexOf(picked);
    if (k < 0 || who.value >= 0) return;
    who.value = k;
    ans.value = withTiming(1, { duration: 1800, easing: Easing.linear });
  }, [picked, live]);
  return { ans, who };
}

// ── the first question: PULL THE RIGHT NOTE ──────────────────────────────────

const NOTE = { w: 56, h: 44, x: 40 };
const NOTES: { id: string; y: number; rows: string[]; correct: boolean }[] = [
  { id: 'onlyRemedy', y: 330, rows: ['so only the', 'remedy', 'differs'], correct: true },
  { id: 'saveMoney', y: 380, rows: ['to save', 'money'], correct: false },
  { id: 'captainSaid', y: 430, rows: ['because the', 'captain', 'said so'], correct: false },
];
function Note({ S, k, ans, who }: { S: SharedValue<any>; k: number; ans: SharedValue<number>; who: SharedValue<number> }) {
  const q = NOTES[k];
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const u = phaseOf(ans.value, who.value, k);
    // a flutter in the draught of the roll, a degree at most, while it can be picked
    const flut = 1.2 * Math.sin(t * 1.3 + k * 1.7) * (1 - u);
    if (q.correct) {
      // pulled off its nail: it comes away toward you, straightens and lifts
      return {
        opacity: S.value.q1,
        transform: [{ translateY: -5 * u }, { rotate: `${flut}deg` }, { scale: 1 + 0.12 * u }],
      };
    }
    // a wrong one: the nail holds, it swings round on it and a corner tears off
    const sw = 18 * u + 7 * Math.sin(u * Math.PI * 3) * (1 - u);
    return {
      opacity: S.value.q1 * (1 - 0.3 * u),
      transform: [{ rotate: `${flut + (k === 1 ? sw : -sw)}deg` }],
    };
  });
  const nail = useAnimatedStyle(() => {
    const u = q.correct ? phaseOf(ans.value, who.value, k) : 0;
    return { opacity: 1 - u, transform: [{ translateX: -10 * u }, { translateY: -8 * u + 18 * u * u }] };
  });
  const tear = useAnimatedStyle(() => ({ opacity: q.correct ? 0 : phaseOf(ans.value, who.value, k) }));
  return (
    <Animated.View style={[styles.note, { left: NOTE.x - NOTE.w / 2, top: q.y - NOTE.h / 2 }, st]}>
      {q.rows.map((r) => <Text key={r} style={styles.noteText} numberOfLines={1}>{r}</Text>)}
      <Animated.View style={[styles.nail, nail]} />
      <Animated.View style={[styles.tearOff, tear]} />
    </Animated.View>
  );
}
function Notes({ S, picked, onPick, live }: { S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean }) {
  const answered = picked !== null || !live;
  const { ans, who } = useAnswer(picked, live, NOTES.map((q) => q.id));
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <>
      {NOTES.map((q, k) => <Note key={q.id} S={S} k={k} ans={ans} who={who} />)}
      <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
        {NOTES.map((q) => (
          <Target
            key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
            disabled={answered} sealAt="br"
            style={{ position: 'absolute', left: NOTE.x - NOTE.w / 2, top: q.y - NOTE.h / 2, width: NOTE.w, height: NOTE.h }}
          >
            <View style={styles.clear} />
          </Target>
        ))}
      </Animated.View>
    </>
  );
}

// ── the second question: LABEL THE BOTTLES ───────────────────────────────────

const PAIR = { w: 44, h: 48, top: 406, bottle: { w: 15, h: 36 } };
const PAIRS: { id: string; x: number; glass: 'blue' | 'clear' | 'brown'; tag: string[] | null; correct: boolean }[] = [
  { id: 'miracle', x: 144, glass: 'blue', tag: ['MIRACLE', 'CURE'], correct: false },
  { id: 'identical', x: 192, glass: 'clear', tag: null, correct: true },
  { id: 'poison', x: 240, glass: 'brown', tag: ['POISON'], correct: false },
];
const PAIR_ART = PAIRS.map((q) => sc6Phial(0, 0, PAIR.bottle.w, PAIR.bottle.h, q.glass));
function Pair({ S, k, ans, who }: { S: SharedValue<any>; k: number; ans: SharedValue<number>; who: SharedValue<number> }) {
  const q = PAIRS[k];
  const cy = 452 - PAIR.bottle.h / 2;
  // the pair is set up on the chest as the question arrives
  const at = useAnimatedStyle(() => ({
    opacity: S.value.pairsOn,
    transform: [{ translateX: q.x }, { translateY: cy + 6 * (1 - S.value.pairsOn) }],
  }));
  // the right pair shuffles round each other like a shell game, twice, and lands where
  // nobody could say which is which; a wrong pair rattles where it stands
  const left = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    if (q.correct) {
      const ph = Math.PI * 2 * u;
      return { transform: [{ translateX: -9 * Math.cos(ph) }, { translateY: -5 * Math.sin(ph) }] };
    }
    const rat = 1.6 * Math.sin(u * 40) * (1 - u);
    return { transform: [{ translateX: -9 + rat }, { translateY: 2 * u }] };
  });
  const right = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    if (q.correct) {
      const ph = Math.PI * 2 * u;
      return { transform: [{ translateX: 9 * Math.cos(ph) }, { translateY: 5 * Math.sin(ph) }] };
    }
    const rat = 1.6 * Math.sin(u * 40 + 1) * (1 - u);
    return { transform: [{ translateX: 9 + rat }, { translateY: 2 * u }] };
  });
  const tag = useAnimatedStyle(() => {
    const u = q.correct ? 0 : phaseOf(ans.value, who.value, k);
    return { opacity: 1 - 0.85 * u, transform: [{ translateY: 9 * u }, { rotate: `${22 * u}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, at]} pointerEvents="none">
      <Animated.View style={[styles.rider, left]}>
        <ObjectArt parts={PAIR_ART[k]} tone={TONE} />
      </Animated.View>
      <Animated.View style={[styles.rider, right]}>
        <ObjectArt parts={PAIR_ART[k]} tone={TONE} />
      </Animated.View>
      {q.tag ? (
        <Animated.View style={[styles.pairTag, q.tag.length === 1 ? styles.poisonTag : null, tag]}>
          <View style={styles.tagString} />
          {q.tag.map((r) => (
            <Text key={r} style={[styles.tagText, q.tag && q.tag.length === 1 ? styles.poisonText : null]} numberOfLines={1}>{r}</Text>
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
function Pairs({ S, picked, live }: { S: SharedValue<any>; picked: string | null; live: boolean }) {
  const { ans, who } = useAnswer(picked, live, PAIRS.map((q) => q.id));
  return <>{PAIRS.map((q, k) => <Pair key={q.id} S={S} k={k} ans={ans} who={who} />)}</>;
}
function PairTargets({ S, picked, onPick, live }: { S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.pairsOn }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PAIRS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.x - PAIR.w / 2, top: PAIR.top, width: PAIR.w, height: PAIR.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const C = NATURAL;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  slingPivot: { transformOrigin: '0% 0%' },
  planking: { position: 'absolute', left: 0, right: 0, top: 280, height: DECK_TOP - 280, backgroundColor: C.sc6Lime.base },
  seam: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.sc6Lime.shade },
  lampWash: {
    position: 'absolute', left: 58, top: 300, width: 180, height: 170, borderRadius: 90,
    backgroundColor: C.sc6Glow.base,
  },
  rib: {
    position: 'absolute', top: 290, width: 9, height: DECK_TOP - 290, borderRadius: 1.5,
    backgroundColor: C.sc6Timber.base, borderRightWidth: 2.4, borderRightColor: C.sc6Timber.shade,
  },
  knee: {
    position: 'absolute', top: 302, width: 30, height: 5, borderRadius: 2, backgroundColor: C.sc6Timber.base,
    transform: [{ rotate: '-28deg' }],
  },
  beamEnd: {
    position: 'absolute', top: 290, width: 16, height: 10, borderRadius: 1.5,
    backgroundColor: C.sc6Timber.shade,
  },
  deckhead: {
    position: 'absolute', left: 0, right: 0, top: 266, height: 30, backgroundColor: C.sc6Timber.base,
    borderBottomWidth: 3, borderBottomColor: C.sc6Timber.shade, borderRadius: 1,
  },
  deck: {
    position: 'absolute', left: 0, right: 0, top: DECK_TOP, height: 40, backgroundColor: C.sc6Deck.base, borderRadius: 1,
  },
  deckSeam: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.sc6Deck.shade },
  wallFoot: {
    position: 'absolute', left: 0, right: 0, top: DECK_TOP - 2, height: 3, backgroundColor: C.sc6Timber.shade, borderRadius: 1,
  },
  floor: floorStyle(TONE, 506),
  portHole: {
    position: 'absolute', left: 226, top: 368, width: 28, height: 28, borderRadius: 14, overflow: 'hidden',
  },
  portView: { position: 'absolute', left: -14, top: -10, width: 52, height: 44 },
  portSky: { position: 'absolute', left: 0, right: 0, top: 0, height: 24 },
  portSea: { position: 'absolute', left: 0, right: 0, top: 24, height: 20 },
  portGlint: { position: 'absolute', left: 20, top: 27, width: 10, height: 1.4, borderRadius: 0.7, backgroundColor: C.sc6Sun.base },
  portLid: {
    position: 'absolute', left: 224, top: 352, width: 32, height: 14, borderRadius: 2,
    backgroundColor: C.sc6Timber.base, borderBottomWidth: 2, borderBottomColor: C.sc6Timber.shade,
  },
  portLidRope: { position: 'absolute', left: 239.5, top: 298, width: 1, height: 54, backgroundColor: C.s5Rope.shade },
  sunbeam: {
    position: 'absolute', left: 232, top: 396, width: 24, height: 80, borderRadius: 4,
    backgroundColor: C.sc6Sun.base, transformOrigin: '50% 0%',
  },
  tally: { position: 'absolute', top: 459, width: 1.4, height: 10, borderRadius: 0.7, backgroundColor: C.paper.base },
  tallyCross: {
    position: 'absolute', left: 174, top: 463.5, width: 14, height: 1.4, borderRadius: 0.7, backgroundColor: C.paper.base,
    transform: [{ rotate: '-24deg' }],
  },
  lanternHook: { position: 'absolute', left: 148, top: HOOK_Y, width: 0, height: 0 },
  lanternRope: { position: 'absolute', left: -0.6, top: 0, width: 1.2, height: 14, backgroundColor: INK },
  lanternAt: { position: 'absolute', left: 0, top: 14, width: 0, height: 0 },
  lanternGlow: {
    position: 'absolute', left: -26, top: 4, width: 52, height: 52, borderRadius: 26, backgroundColor: C.sc6Glow.base,
  },
  flame: {
    position: 'absolute', left: -1.3, top: 15, width: 2.6, height: 5, borderRadius: 1.3,
    backgroundColor: C.sc6Glow.base, transformOrigin: '50% 100%',
  },
  slateAt: { position: 'absolute', left: 0, top: 0, width: 44, height: 24, transformOrigin: '50% 0%' },
  slateString: { position: 'absolute', left: 21.5, top: -6, width: 1, height: 6, backgroundColor: C.s5Rope.shade },
  slate: {
    position: 'absolute', left: 0, top: 0, width: 44, height: 23, borderRadius: 2.5,
    backgroundColor: C.ps5Manila.base, borderWidth: 1, borderColor: C.ps5Manila.shade, paddingTop: 1.4, paddingLeft: 2.4,
  },
  slateEye: {
    position: 'absolute', left: 19.5, top: 1.5, width: 5, height: 5, borderRadius: 2.5,
    borderWidth: 1, borderColor: C.ps5Manila.shade, backgroundColor: C.paper.base,
  },
  slateMask: { height: 10, width: 39 },
  chalkText: {
    fontFamily: 'Caveat_700Bold', fontSize: 9.6, lineHeight: 10, color: INK, includeFontPadding: false, width: 39,
  },
  chalk: { position: 'absolute', left: -0.8, top: -6, width: 1.6, height: 9, borderRadius: 0.8, backgroundColor: C.wood.base },
  colHead: { position: 'absolute', top: -9.6, width: 4, height: 4, borderRadius: 2 },
  colOrange: { left: -11, backgroundColor: C.orange.base },
  colBottle: { left: 7, backgroundColor: C.sc6Bottle.base, borderRadius: 1, width: 3, height: 5 },
  tickMark: {
    position: 'absolute', width: 4, height: 2, borderLeftWidth: 1.2, borderBottomWidth: 1.2, borderColor: C.leaf.base,
    transform: [{ rotate: '-45deg' }],
  },
  crossMark: { position: 'absolute', width: 4, height: 1.2, backgroundColor: C.apple.base, transform: [{ rotate: '45deg' }] },
  fingerTip: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: INK },
  note: {
    position: 'absolute', width: NOTE.w, height: NOTE.h, borderRadius: 2, backgroundColor: C.paper.base,
    borderWidth: 1, borderColor: C.paper.shade, alignItems: 'center', justifyContent: 'center', paddingTop: 3,
    transformOrigin: '50% 8%', boxShadow: `0 3px 0 ${NATURAL.paper.shade}`,
  },
  noteText: { fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 11.6, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center' },
  nail: {
    position: 'absolute', left: NOTE.w / 2 - 2, top: 1.4, width: 4, height: 4, borderRadius: 2, backgroundColor: C.iron.base,
  },
  tearOff: {
    position: 'absolute', right: -1, bottom: -1, width: 0, height: 0, borderLeftWidth: 9, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderTopColor: C.sc6Lime.shade,
  },
  pairTag: {
    position: 'absolute', left: -21, top: 0, width: 42, height: 20, borderRadius: 2.5,
    backgroundColor: C.paper.base, borderWidth: 1, borderColor: C.paper.shade, alignItems: 'center', justifyContent: 'center',
  },
  poisonTag: { height: 13, top: 4, backgroundColor: C.apple.base, borderColor: C.apple.shade },
  tagString: { position: 'absolute', left: 20, top: -8, width: 1, height: 8, backgroundColor: C.s5Rope.shade },
  tagText: { fontFamily: 'Caveat_700Bold', fontSize: 10, lineHeight: 9.4, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center' },
  poisonText: { color: C.paper.base },
  clear: { flexGrow: 1 },
});

// The camera: the house follow. Every beat holds and a question pulls back to the whole
// stage, which is also what lets measure-must read it (#stage-cam).
const FOLLOW = followMoves(BEATS.map(() => 200), BEATS.map(kindOf), seedOf('science'));

export function Sci6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci6Scene} band={[282, 514]} camera={FOLLOW} />;
}
