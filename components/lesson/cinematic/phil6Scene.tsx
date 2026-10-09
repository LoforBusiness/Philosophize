import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './phil6Script';
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
import { lineOf, stage, stageLin } from './pace';
import {
  NATURAL, ph6Cabinet, ph6Oracle, ph6OracleHead, ph6Ball, ph6Tray, ph6CardFace, ph6CardBack,
  ph6FortuneLoves, ph6FortuneSneeze, ph6FortuneBully, ph6BrassHand, ph6Counter, ph6Awning, ph6JarFudge,
  ph6JarMint, ph6JarToffee, ph6FudgeBit, ph6MintBit, ph6DieFive, ph6DieTwo,
  ph6Rail, PH6_CAB,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-6, "Could You Have Chosen Otherwise?" — A VICTORIAN FAIRGROUND
// AT NIGHT, AND THE MECHANICAL ORACLE.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The attendant (the bun) cranks a brass-and-
// lacquer fortune machine that prints your choice before you make it; a customer (the
// plain one) swears nothing can predict him; the philosopher (the top hat) walks in
// along the carousel rail to ask what that means for free will.
//
//   b0   the attendant beckons him up ("Step up!"), turns, and cranks the machine: the
//        crest's bulbs chase, the Oracle nods over his glowing crystal ball, and a card
//        drops face down out of the slot into the brass tray.
//   b1   the customer strides up to the sweet stall, a hand on his chest ("a mystery
//        even to myself"), looks the jars over, hovers, and snatches a square of fudge.
//   b2   she takes the card from the tray, turns, flips it and holds it up: FUDGE. He
//        rears back; the philosopher walks in along the carousel rail.
//   b3   the philosopher counts the causes on his fingers, one, two, three; she stands
//        the card back up in the tray.
//   b4   the customer turns to him; a finger up ("if every choice …"), a hand toward
//        the customer ("… picked differently?"), then both palms up ("the puzzle").
//   b5   Q1, TRACE THE CAUSE: the card in the tray, the dice on the counter, the customer.
//   b6   he puts the fudge back, steps along to the mint jar, grabs a humbug and holds it
//        up at the machine, glaring. The machine whirs by itself and drops a second card.
//   b7   she takes the second card, flips it, reads it, and holds it up: MINT TO SPITE.
//        He recoils, the mint pulled back to his chest.
//   b8   she stands that card in the tray; the philosopher points at the customer, then
//        at the jars; the customer turns to him. The machine's brass hand rises out of
//        its crest holding three fortune cards in a fan.
//   b9   Q2, PICK A FORTUNE CARD: ACHOO! · PAID A BULLY · LOVES FUDGE.
//   b10  the fan sinks back; she walks to the stall and takes the toffee jar in her arms.
//   b11  everyone at ease under the quotation, the carousel turning behind them.
//
// COMPOSITION, in stage units. The night SKY 160–404 (navy, then indigo), the fair's
// pink HAZE 404–456 and lamplit TURF 456–500 behind the people, so three ink figures
// read against light; twelve stars, BUNTING across the top (248–270). Right, the
// CAROUSEL 226–410 × 244–460, lit warm inside (325–445), its rounding boards ringed with
// bulbs (y 302) and three galloping horses going round on brass poles (380–412). Left,
// the MECHANICAL ORACLE 28–116 × 340–500: crest and name plate 362–375, the glass case
// 380–436 with the turbaned Oracle and his crystal ball, the crank on its right side at
// 114, 450, the card slot at 90, 461 and the brass tray 73–103 × 465–473; a card stands
// in it at 62–114 × 437–467. The attendant stands at 134 (shoulder 132, 454: crank, tray
// and card all inside her 23-unit reach). The SWEET STALL 166–328 × 460–500 under a
// striped AWNING (valance 356–374, poles at 164 and 332); jars of toffee, mint and fudge
// at 226, 266, 306 (434–460) with price tags hanging from the valance (384–398), a pair
// of dice at 182 and 194. The customer stands in front of it beside the jar he takes
// (322 at the fudge, 282 at the mint). The philosopher at 382, in front of the brass
// RAIL 340–404 × 470–500. The fan of fortune cards rises to 273–331 over the machine
// (cards at 25, 74, 123). Band [240, 514]: 78 units of figure in 274, 28%.
//
// SIMPLE ON PURPOSE (AP7): never more than two figures moving, everyone faces whom he
// talks to, listeners nod along with still hands (AP18), and every hand that moves is
// beckoning, cranking, taking, showing, counting, pointing or holding a sweet.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.76;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts, philosophy-foundations-6). */
const LINES = [3.79, 3.95, 2.96, 5.56, 5.63, 0, 2.78, 4.47, 7.43, 0, 3.63, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const CRANK_AT = at('crank');
const PICK_AT = at('pick');
const FLIP_AT = at('flip');
const CAUSES_AT = at('causes');
const PUZZLE_AT = at('puzzle');
const SPITE_AT = at('spite');
const SECOND_AT = at('second');
const FREE_AT = at('free');
const TOFFEE_AT = at('toffee');
const Q1 = BEATS.map((b) => (b.cause ? 1 : 0));
const Q2 = BEATS.map((b) => (b.fortune ? 1 : 0));
const Q1_AT = Q1.indexOf(1);
const Q2_AT = Q2.indexOf(1);

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of him (his own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── the customer: up to the fudge jar, along to the mint ─────────────────────
const CU_START = 356;
const CU_FUDGE = 322;
const CU_MINT = 282;
const CU_LEGS: Track[] = per((n) => (n < PICK_AT ? [[0, CU_START]] : n === PICK_AT ? [[0.02, CU_FUDGE]]
  : n < SPITE_AT ? [[0, CU_FUDGE]] : n === SPITE_AT ? [[0.27, CU_MINT]] : [[0, CU_MINT]]));
const CU_TURN: Track[] = per((n) => (n === PUZZLE_AT ? [[0, -1], [0.04, 1]]
  : n === Q1_AT ? [[0, 1]]
    : n === FREE_AT ? [[0, -1], [0.38, 1]]
      : n === Q2_AT ? [[0, 1]]
        : n === TOFFEE_AT ? [[0, 1], [0.22, -1]] : [[0, -1]]));
const CU_P = per((n) => (n === PICK_AT || n === SPITE_AT ? TALK : NOD));
/** His right hand: chest, hover, into the jar, the sweet held up; put back, along, the mint at the machine. */
const CU_KEYS: (readonly Key[])[] = per((n) => {
  if (n === PICK_AT) {
    return [[0.34, 4, 450, 0], [0.42, 4, 450, 1], [0.56, 4, 450, 1], [0.64, 12, 432, 1], [0.71, 12, 431, 1],
      [0.76, 14, 441, 1], [0.8, 14, 441, 1], [0.88, 14, 434, 1], [1, 14, 434, 1]];
  }
  if (n === FLIP_AT) return [[0, 14, 434, 1], [0.14, 8, 455, 1], [1, 8, 455, 1]];
  if (n > FLIP_AT && n < SPITE_AT) return [[0, 8, 455, 1]];
  if (n === SPITE_AT) {
    return [[0, 8, 455, 1], [0.1, 14, 441, 1], [0.2, 14, 441, 1], [0.27, 7, 456, 1], [0.58, 7, 456, 1],
      [0.66, 14, 441, 1], [0.72, 14, 441, 1], [0.82, 17, 436, 1], [1, 17, 436, 1]];
  }
  if (n === SECOND_AT) return [[0, 17, 436, 1], [0.58, 17, 436, 1], [0.7, 8, 455, 1], [1, 8, 455, 1]];
  if (n > SECOND_AT) return [[0, 8, 455, 1]];
  return NONE;
});

// ── the attendant: by the crank and the tray, then to the toffee ─────────────
const AT_X = 134;
const AT_JAR = 210;
const AT_LEGS: Track[] = per((n) => (n < TOFFEE_AT ? [[0, AT_X]] : n === TOFFEE_AT ? [[0.04, AT_JAR]] : [[0, AT_JAR]]));
const AT_TURN: Track[] = per((n) => (n === CRANK_AT ? [[0, 1], [0.24, -1], [0.93, 1]]
  : n === PICK_AT ? [[0, 1]]
    : n === FLIP_AT ? [[0, 1], [0.02, -1], [0.28, 1]]
      : n === CAUSES_AT ? [[0, 1], [0.02, -1], [0.32, 1]]
        : n === SECOND_AT ? [[0, 1], [0.02, -1], [0.26, 1]]
          : n === FREE_AT ? [[0, 1], [0.02, -1], [0.3, 1]] : [[0, 1]]));
const AT_P = per((n) => (n === CRANK_AT || n === FLIP_AT || n === SECOND_AT || n === TOFFEE_AT ? TALK : NOD));
/** Her right hand: beckon, crank, take the card, flip it, show it, stand it in the tray; the jar. */
const AT_KEYS: (readonly Key[])[] = per((n) => {
  if (n === CRANK_AT) return [[0, 10, 452, 0], [0.04, 16, 434, 1], [0.14, 16, 434, 1], [0.22, 8, 455, 1], [1, 8, 455, 1]];
  if (n === PICK_AT) return [[0, 8, 455, 1], [0.25, 8, 455, 0]];
  if (n === FLIP_AT) {
    return [[0, 8, 455, 0], [0.12, 22, 466, 1], [0.17, 22, 466, 1], [0.27, 10, 452, 1], [0.48, 10, 452, 1],
      [0.58, 13, 434, 1], [1, 13, 434, 1]];
  }
  if (n === CAUSES_AT || n === FREE_AT) {
    return [[0, 13, 434, 1], [0.08, 14, 444, 1], [0.15, 20, 452, 1], [0.24, 20, 452, 1], [0.3, 8, 455, 1], [0.4, 8, 455, 0]];
  }
  if (n === SECOND_AT) {
    return [[0, 8, 455, 0], [0.1, 22, 467, 1], [0.15, 22, 467, 1], [0.25, 10, 452, 1], [0.4, 10, 447, 1],
      [0.52, 10, 447, 1], [0.6, 13, 434, 1], [1, 13, 434, 1]];
  }
  if (n === TOFFEE_AT) return [[0.42, 16, 444, 0], [0.52, 20, 447, 1], [0.6, 20, 447, 1], [0.76, 16, 441, 1], [1, 16, 441, 1]];
  if (n > TOFFEE_AT) return [[0, 16, 441, 1]];
  return NONE;
});
/** Her left hand: only for the jar, under its near side. */
const AT_KEYS_L: (readonly Key[])[] = per((n) => (n === TOFFEE_AT ? [[0.46, 6, 456, 0], [0.56, 7, 457, 1], [0.76, 5, 455, 1], [1, 5, 455, 1]]
  : n > TOFFEE_AT ? [[0, 5, 455, 1]] : NONE));

// ── the philosopher: in along the rail, then counting, pointing, palms up ────
const PH_OFF = 440;
const PH_X = 378;
const PH_LEGS: Track[] = per((n) => (n < FLIP_AT ? [[0, PH_OFF]] : n === FLIP_AT ? [[0.08, PH_X]] : [[0, PH_X]]));
const PH_TURN: Track[] = per(() => [[0, -1]]);
const PH_P = per((n) => (n === CAUSES_AT ? TALK : n === PUZZLE_AT || n === FREE_AT ? EXPLAIN : NOD));
const PH_KEYS: (readonly Key[])[] = per((n) => {
  if (n === CAUSES_AT) {
    // one, two, three: the index finger down his other hand, a finger at a time
    return [[0.16, 13, 446, 0], [0.24, 13, 441, 1], [0.36, 13, 441, 1], [0.44, 13, 445.5, 1], [0.6, 13, 445.5, 1],
      [0.68, 13, 450, 1], [0.86, 13, 450, 1], [0.95, 10, 455, 0]];
  }
  if (n === PUZZLE_AT) {
    return [[0, 8, 452, 0], [0.06, 10, 438, 1], [0.28, 10, 438, 1], [0.38, 22, 452, 1], [0.58, 22, 452, 1],
      [0.68, 17, 457, 1], [1, 17, 457, 1]];
  }
  if (n === Q1_AT) return [[0, 17, 457, 1], [0.3, 17, 457, 0]];
  if (n === FREE_AT) {
    return [[0, 8, 452, 0], [0.12, 22, 447, 1], [0.42, 22, 447, 1], [0.52, 20, 460, 1], [0.76, 20, 460, 1], [0.86, 10, 456, 0]];
  }
  return NONE;
});
const PH_KEYS_L: (readonly Key[])[] = per((n) => (n === CAUSES_AT ? [[0.08, 16, 446, 0], [0.16, 16, 445, 1], [0.88, 16, 445, 1], [0.96, 16, 446, 0]]
  : n === PUZZLE_AT ? [[0.62, 11, 458, 0], [0.7, 12, 458, 1], [1, 12, 458, 1]]
    : n === Q1_AT ? [[0, 12, 458, 1], [0.3, 12, 458, 0]] : NONE));

// ── the machine ───────────────────────────────────────────────────────────────
const MACH = { x: 72, y: 420, w: 88, h: 160 };
const cabX = (lx: number) => MACH.x - MACH.w / 2 + lx;
const cabY = (ly: number) => MACH.y - MACH.h / 2 + ly;
const CREST = { left: cabX(PH6_CAB.crest.x - PH6_CAB.crest.w / 2), top: cabY(PH6_CAB.crest.y - PH6_CAB.crest.h / 2), w: PH6_CAB.crest.w, h: PH6_CAB.crest.h };
const BOSS = { x: cabX(PH6_CAB.boss.x), y: cabY(PH6_CAB.boss.y) };
const KNOB_X = BOSS.x + 8.5;
const CRANK_R = 8;
const NECK = { x: 72, y: 417 };
const BALL = { x: 72, y: 423 };
const BALL_C = { x: 72, y: 419.5 };
/** The card in the tray: lying face down, or stood up facing out. */
const CARD = { x: 88, w: 52, h: 30, lieSy: 0.18 };
const TRAY_FLOOR = 467;
function trayY(sy: number): number {
  'worklet';
  return TRAY_FLOOR - (CARD.h / 2) * sy;
}
const STAND_Y = trayY(1);
const LIE_Y = trayY(CARD.lieSy);
/** A held card hangs off her hand by its near edge. */
const HOLD = 26;
/** The fan of fortune cards, at the top of its rise. */
const FAN = { x: 74, rise: 60, hand: 340 };
const FAN_CARDS = [
  { id: 'sneeze', x: 25, y: 304, deg: -6 },
  { id: 'bully', x: 74, y: 302, deg: 0 },
  { id: 'loves', x: 123, y: 304, deg: 6 },
] as const;
const FC = { w: 47, h: 58 };

// ── the stall ────────────────────────────────────────────────────────────────
const JAR = { y: 447, w: 24, h: 26 };
const JAR_TOFFEE = 226;
const JAR_MINT = 266;
const JAR_FUDGE = 306;
const JAR_MOUTH = 436;
const DICE = { a: 182, b: 194, y: 455.5, s: 9 };
const TAG = { top: 384, w: 39, h: 14 };

// ── the art, placed ──────────────────────────────────────────────────────────
const CAB_ART = ph6Cabinet(MACH.x, MACH.y, MACH.w, MACH.h);
const ORACLE_ART = ph6Oracle(72, 425, 56, 24);
const HEAD_ART = ph6OracleHead(0, -14, 22, 28);
const BALL_ART = ph6Ball(BALL.x, BALL.y, 20, 26);
const TRAY_ART = ph6Tray(CARD.x, 469, 30, 8);
const CARD_FACE = ph6CardFace(0, 0, CARD.w, CARD.h);
const CARD_BACK = ph6CardBack(0, 0, CARD.w, CARD.h);
const FORT_ART = {
  sneeze: ph6FortuneSneeze(0, 0, FC.w, FC.h),
  bully: ph6FortuneBully(0, 0, FC.w, FC.h),
  loves: ph6FortuneLoves(0, 0, FC.w, FC.h),
};
const HAND_ART = ph6BrassHand(0, -8, 22, 16);
const COUNTER_ART = ph6Counter(247, 480, 162, 40);
const AWNING_ART = ph6Awning(248, 411, 176, 110);
const JAR_TOFFEE_ART = ph6JarToffee(0, 0, JAR.w, JAR.h);
const JAR_MINT_ART = ph6JarMint(JAR_MINT, JAR.y, JAR.w, JAR.h);
const JAR_FUDGE_ART = ph6JarFudge(JAR_FUDGE, JAR.y, JAR.w, JAR.h);
const FUDGE_ART = ph6FudgeBit(0, 0, 7, 6);
const MINT_ART = ph6MintBit(0, 0, 7, 6);
const DIE_A = ph6DieFive(0, 0, DICE.s, DICE.s);
const DIE_B = ph6DieTwo(0, 0, DICE.s, DICE.s);
const RAIL_ART = ph6Rail(372, 485, 64, 30);

/** The price tags hanging over the three jars. */
const TAGS = [
  { x: JAR_TOFFEE, word: 'TOFFEE' },
  { x: JAR_MINT, word: 'MINT' },
  { x: JAR_FUDGE, word: 'FUDGE' },
] as const;

function smooth01(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A hand path read at share `u` of its line. */
function keyAt(keys: readonly Key[], u: number) {
  'worklet';
  const first = keys[0];
  if (u <= first[0]) return { lx: first[1], y: first[2], w: first[3] };
  for (let k = 1; k < keys.length; k += 1) {
    const z = keys[k];
    if (u <= z[0]) {
      const a = keys[k - 1];
      const s = smooth01((u - a[0]) / Math.max(1e-6, z[0] - a[0]));
      return { lx: lerp(a[1], z[1], s), y: lerp(a[2], z[2], s), w: lerp(a[3], z[3], s) };
    }
  }
  const e = keys[keys.length - 1];
  return { lx: e[1], y: e[2], w: e[3] };
}
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
/** A hand on its path for this beat, in the figure's own frame (AR7.2). */
function keyed(s: Stance, keys: readonly Key[], u: number, x: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, GROUND, d, which, x + k.lx * d, k.y, k.w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** Where a walking figure stands at time `b` of a beat (from where he is on screen). */
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
    const at0 = turns[k][0] * L;
    if (b < at0) break;
    d = facing(from, turns[k][1], b - at0);
    from = turns[k][1];
  }
  return d;
}
/** One figure's body: walking its legs, or holding its pose live. */
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
type CardAt = { x: number; y: number; sx: number; sy: number; face: number; o: number };
/** A card being taken from the tray, turned round with her, and flipped to show its face. */
function takenCard(wx: number, wy: number, d: number, take: number, lift: number, flip: number): CardAt {
  'worklet';
  const hx = wx + HOLD * d;
  const ad = Math.abs(d);
  return {
    x: lerp(CARD.x, hx, take),
    y: lerp(LIE_Y, wy, take),
    sx: lerp(1, ad, take) * Math.abs(1 - 2 * flip),
    sy: lerp(CARD.lieSy, 1, lift),
    face: clamp01((flip - 0.45) / 0.1),
    o: 1,
  };
}
/** A card being stood back up in the tray, let go of over `rel`. */
function placedCard(wx: number, wy: number, d: number, rel: number): CardAt {
  'worklet';
  return { x: lerp(wx + HOLD * d, CARD.x, rel), y: lerp(wy, STAND_Y, rel), sx: lerp(Math.abs(d), 1, rel), sy: 1, face: 1, o: 1 };
}
const LYING: CardAt = { x: CARD.x, y: LIE_Y, sx: 1, sy: CARD.lieSy, face: 0, o: 1 };
const STANDING: CardAt = { x: CARD.x, y: STAND_Y, sx: 1, sy: 1, face: 1, o: 1 };
const GONE: CardAt = { x: CARD.x, y: LIE_Y, sx: 1, sy: CARD.lieSy, face: 0, o: 0 };

const CAM = followMoves(CU_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('philosophy'));

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { card: 1, dice: 2, him: 3, sneeze: 4, bully: 5, loves: 6 };

export default function Phil6Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldA = useHeld();
  const heldP = useHeld();
  const cv = useCarry(22);
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
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    /** Up over [a, m], held, and back down over [z0, z1]. */
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };
    // ── the reader's answer, on a graded beat (0 elsewhere), carried off after ──
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };
    const rCard = carry(cv, 11, n, 0, ans(1, Q1), tr);
    const rDice = carry(cv, 12, n, 0, ans(2, Q1), tr);
    const rHim = carry(cv, 13, n, 0, ans(3, Q1), tr);
    const rSneeze = carry(cv, 14, n, 0, ans(4, Q2), tr);
    const rBully = carry(cv, 15, n, 0, ans(5, Q2), tr);
    const rLoves = carry(cv, 16, n, 0, ans(6, Q2), tr);

    // ── the customer ────────────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 0, n, CU_START), CU_LEGS[n], b, L);
    const xC = carry(cv, 0, n, wc.x, wc.x, 1);
    const dC = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), CU_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CU_P, n, t, b, 0);
    sc = keyed(sc, CU_KEYS[n], u, xC, dC, 1);
    if (n === PICK_AT) sc = look(sc, 0.14 * hd(0.58, 0.64, 0.84, 0.92));            // looking the jars over
    if (n === FLIP_AT) sc = look(sc, -0.16 * hd(0.5, 0.58, 0.86, 0.96));            // rearing back at the card
    if (n === SPITE_AT) sc = look(sc, 0.1 * st(0.8, 0.88));                          // glaring at the machine
    if (n === SECOND_AT) sc = look(sc, 0.1 * (1 - st(0, 0.1)) - 0.16 * hd(0.56, 0.64, 0.8, 0.9)); // recoiling
    const prevC = carryFrom(heldC, n, hHold(CU_P[p], t, 0));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the attendant ───────────────────────────────────────────────────────
    const wa = legsOf(carrySource(cv, 2, n, AT_X), AT_LEGS[n], b, L);
    const xA = carry(cv, 2, n, wa.x, wa.x, 1);
    const dA = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), AT_TURN[n], b, L), 1);
    let sa = bodyOf(wa, AT_P, n, t, b, 1);
    sa = keyed(sa, AT_KEYS[n], u, xA, dA, 1);
    sa = keyed(sa, AT_KEYS_L[n], u, xA, dA, -1);
    // the crank: one full turn, her hand on the knob all the way round
    const turn = n === CRANK_AT ? 2 * Math.PI * stageLin(b, L, 0.36, 0.84) : 0;
    const knobY = carry(cv, 7, n, BOSS.y, BOSS.y - CRANK_R * Math.sin(turn), tr);
    if (n === CRANK_AT) sa = hand(sa, xA, GROUND, dA, 1, KNOB_X, knobY, hd(0.28, 0.34, 0.86, 0.92));
    if (n === SECOND_AT) sa = look(sa, 0.14 * hd(0.36, 0.42, 0.54, 0.6));              // reading the card
    const prevA = carryFrom(heldA, n, hHold(AT_P[p], t, 1));
    const figA = keepHeld(heldA, wa.walking ? mixKeepLegs(prevA, sa, tr) : mixStance(prevA, sa, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 4, n, PH_OFF), PH_LEGS[n], b, L);
    const xP = carry(cv, 4, n, wp.x, wp.x, 1);
    const dP = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), PH_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PH_P, n, t, b, 2);
    sp = keyed(sp, PH_KEYS[n], u, xP, dP, 1);
    sp = keyed(sp, PH_KEYS_L[n], u, xP, dP, -1);
    if (n === PUZZLE_AT) sp = look(sp, -0.1 * hd(0.7, 0.78, 0.94, 1));                // the puzzle, chin up
    const prevP = carryFrom(heldP, n, hHold(PH_P[p], t, 2));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    const cu = pose(figC, xC, GROUND, K, dC, 1);
    const atd = pose(figA, xA, GROUND, K, dA, 1);
    const ph = pose(figP, xP, GROUND, K, dP, 1);
    const wC = wristOf(cu, 'wrR');
    const wA = wristOf(atd, 'wrR');

    // ── the cards ───────────────────────────────────────────────────────────
    let c1: CardAt = GONE;
    if (n === CRANK_AT) c1 = { ...LYING, y: lerp(459, LIE_Y, st(0.84, 0.92)), o: st(0.82, 0.86) };
    else if (n === PICK_AT) c1 = LYING;
    else if (n === FLIP_AT) c1 = takenCard(wA.x, wA.y, dA, st(0.15, 0.19), st(0.17, 0.28), st(0.38, 0.5));
    else if (n === CAUSES_AT) c1 = placedCard(wA.x, wA.y, dA, st(0.2, 0.26));
    else if (n > CAUSES_AT) {
      const sy = 1 - (1 - CARD.lieSy) * rCard;                                     // Q1: it topples flat, face down
      c1 = { ...STANDING, sy, y: trayY(sy), face: 1 - clamp01(rCard * 2.5) };
    }
    let c2: CardAt = GONE;
    if (n === SPITE_AT) c2 = { ...LYING, y: lerp(460, LIE_Y, st(0.86, 0.94)), o: st(0.86, 0.9) };
    else if (n === SECOND_AT) c2 = takenCard(wA.x, wA.y, dA, st(0.12, 0.16), st(0.15, 0.25), st(0.33, 0.45));
    else if (n === FREE_AT) c2 = placedCard(wA.x, wA.y, dA, st(0.17, 0.22));
    else if (n > FREE_AT) c2 = STANDING;
    c1 = { ...c1, o: carry(cv, 19, n, c1.o, c1.o, tr) };
    c2 = { ...c2, o: carry(cv, 20, n, c2.o, c2.o, tr) };

    // ── the sweets ──────────────────────────────────────────────────────────
    const sC = dC < 0 ? -1 : 1;
    const fudgeNow = n === PICK_AT ? st(0.77, 0.8) : n > PICK_AT && n < SPITE_AT ? 1 : n === SPITE_AT ? 1 - st(0.17, 0.21) : 0;
    const fudgeO = carry(cv, 17, n, fudgeNow, fudgeNow, tr);
    const intoJar = n === SPITE_AT ? st(0.14, 0.2) : 0;
    const mintNow = n === SPITE_AT ? st(0.7, 0.73) : n > SPITE_AT ? 1 : 0;
    const mintO = carry(cv, 18, n, mintNow, mintNow, tr);
    const takeNow = n === TOFFEE_AT ? st(0.6, 0.76) : n > TOFFEE_AT ? 1 : 0;
    const take = carry(cv, 21, n, takeNow, takeNow, tr);
    const jarX = lerp(JAR_TOFFEE, xA + 11 * dA, take);
    const jarY = lerp(JAR.y, 441, take);

    // ── the machine ─────────────────────────────────────────────────────────
    const humNow = n === CRANK_AT ? hd(0.3, 0.38, 0.86, 0.96) : n === SPITE_AT ? hd(0.66, 0.72, 0.92, 1) : 0;
    const hum = carry(cv, 6, n, humNow, humNow, tr);
    const fanNow = n === FREE_AT ? st(0.8, 0.97) : n === Q2_AT ? 1 : n === TOFFEE_AT ? 1 - st(0.02, 0.26) : 0;
    const fan = carry(cv, 8, n, fanNow, fanNow, tr);

    return {
      cu, atd, ph,
      c1, c2,
      fudge: { x: lerp(wC.x + 2 * sC, JAR_FUDGE, intoJar), y: lerp(wC.y - 1, JAR_MOUTH + 4, intoJar), o: fudgeO },
      mint: { x: wC.x + 2 * sC, y: wC.y - 1, o: mintO },
      jar: { x: jarX, y: jarY },
      cuX: xC,
      knobY, hum, fan,
      rCard, rDice, rHim, rSneeze, rBully, rLoves,
      q1: carry(cv, 9, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 10, n, Q2[p], Q2[n], tr),
      t,
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cu);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.atd);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const fanOn = i >= FREE_AT - 1 && i <= TOFFEE_AT + 1;

  return (
    <View style={styles.scene}>
      {/* the night, and the fair's glow on it */}
      <View style={styles.night} pointerEvents="none" />
      <View style={styles.dusk} pointerEvents="none" />
      <View style={styles.haze} pointerEvents="none" />
      <View style={styles.turf} pointerEvents="none" />
      <Stars S={SCENE} />
      <Bunting S={SCENE} />
      <LessonPicture name="phil6-carousel" />
      <CarouselBulbs S={SCENE} />
      <Galloper S={SCENE} k={0} />
      <Galloper S={SCENE} k={1} />
      <ObjectArt parts={AWNING_ART} tone={TONE} />
      <PriceTags />
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={RAIL_ART} tone={TONE} />
      {/* the machine: the fan rises from behind its crest */}
      {fanOn ? <Fan S={SCENE} /> : null}
      <ObjectArt parts={CAB_ART} tone={TONE} />
      <View style={styles.crest} pointerEvents="none">
        <Text style={styles.crestText}>THE ORACLE</Text>
      </View>
      <CrestBulbs S={SCENE} />
      <ObjectArt parts={ORACLE_ART} tone={TONE} />
      <BallGlow S={SCENE} />
      <ObjectArt parts={BALL_ART} tone={TONE} />
      <OracleHead S={SCENE} />
      <View style={[styles.glint, { left: 40, top: 392, width: 19, transform: [{ rotate: '-55deg' }] }]} pointerEvents="none" />
      <View style={[styles.glint, { left: 42, top: 401, width: 22, transform: [{ rotate: '-55deg' }] }]} pointerEvents="none" />
      <View style={[styles.glint, { left: 96, top: 427, width: 12, transform: [{ rotate: '-55deg' }] }]} pointerEvents="none" />
      <Crank S={SCENE} />
      <ObjectArt parts={TRAY_ART} tone={TONE} />
      <FirstCard S={SCENE} />
      {i >= SPITE_AT - 1 ? <SecondCard S={SCENE} /> : null}
      {/* the stall */}
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <ObjectArt parts={JAR_MINT_ART} tone={TONE} />
      <ObjectArt parts={JAR_FUDGE_ART} tone={TONE} />
      <Dice S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: plain */}
      <Stickman D={DC} k={K} role="lead" wear={[]} />
      <Sweet S={SCENE} k="fudge" art={FUDGE_ART} />
      <Sweet S={SCENE} k="mint" art={MINT_ART} />
      {/* cast: bun */}
      <Stickman D={DA} k={K} role="second" wear={BY_ID.bun.pieces} />
      <ToffeeJar S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      {on(Q1) ? <Heart S={SCENE} /> : null}
      {on(Q1) ? <CauseTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <FortuneTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the far layer: stars, bunting, the carousel going round ──────────────────

const STARS = [[18, 262], [52, 286], [130, 290], [160, 268], [196, 296], [36, 318], [118, 322], [204, 262]];
function Stars({ S }: { S: SharedValue<any> }) {
  const tw = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(S.value.t * 1.3)) }));
  return (
    <>
      {STARS.map(([x, y], k) => (
        <Animated.View key={k} pointerEvents="none" style={[styles.star, { left: x - 1, top: y - 1 }, k % 3 === 0 ? tw : null]} />
      ))}
    </>
  );
}
/** A run of bunting on its sagging string, drawn about its middle: red, yellow, blue, green. */
const FLAG_COLOURS = [W.ph6FlagRed.base, W.ph6FlagYellow.base, W.ph6FlagBlue.base, W.ph6FlagGreen.base];
const sag = (x: number) => 8 * (1 - (x / 100) ** 2);
const STRING = [0, 1, 2, 3, 4].map((k) => {
  const x0 = -100 + k * 40;
  const x1 = x0 + 40;
  const y0 = sag(x0);
  const y1 = sag(x1);
  return { left: (x0 + x1) / 2 - 20.4, top: (y0 + y1) / 2 - 0.4, deg: (Math.atan2(y1 - y0, 40) * 180) / Math.PI };
});
const FLAGS = Array.from({ length: 10 }, (_, k) => ({ x: -90 + k * 20, y: sag(-90 + k * 20), c: FLAG_COLOURS[k % 4] }));
function BuntingRun() {
  return (
    <>
      {STRING.map((g, k) => (
        <View key={k} style={[styles.string, { left: g.left, top: g.top, transform: [{ rotate: `${g.deg}deg` }] }]} />
      ))}
      {FLAGS.map((g, k) => (
        <View key={k} style={[styles.flag, { left: g.x - 5, top: g.y, borderTopColor: g.c }]} />
      ))}
    </>
  );
}
function Bunting({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: 100 }, { translateY: 250 }, { rotate: `${0.9 * Math.sin(S.value.t * 0.7)}deg` }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ translateX: 300 }, { translateY: 248 }, { rotate: `${0.9 * Math.sin(S.value.t * 0.7 + 1.7)}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.rider, a]} pointerEvents="none"><BuntingRun /></Animated.View>
      <Animated.View style={[styles.rider, b]} pointerEvents="none"><BuntingRun /></Animated.View>
    </>
  );
}
const C_BULBS = Array.from({ length: 8 }, (_, k) => 236 + k * 23.6);
function CarouselBulbs({ S }: { S: SharedValue<any> }) {
  const even = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.max(0, Math.sin(S.value.t * 2.2)) }));
  const odd = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.max(0, Math.sin(S.value.t * 2.2 + Math.PI)) }));
  return (
    <>
      {C_BULBS.map((x, k) => (
        <Animated.View key={k} pointerEvents="none" style={[styles.bulb, { left: x - 2.2, top: 300 }, k % 2 ? odd : even]} />
      ))}
    </>
  );
}
/** A horse going round: across the front of the carousel, rising and falling on its pole. */
function Galloper({ S, k }: { S: SharedValue<any>; k: number }) {
  const along = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.045 + k / 2) % 1;
    return { opacity: clamp01(Math.min(ph, 1 - ph) * 9), transform: [{ translateX: 244 + 150 * ph }] };
  });
  const up = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.045 + k / 2) % 1;
    return { transform: [{ translateY: 396 + 4 * Math.sin(ph * Math.PI * 8 + k * 2) }] };
  });
  return (
    <Animated.View style={[styles.rider, along]} pointerEvents="none">
      <View style={styles.pole} />
      <Animated.View style={[styles.rider, up]}><LessonPicture name="phil6-horse" /></Animated.View>
    </Animated.View>
  );
}
function PriceTags() {
  return (
    <>
      {TAGS.map((g) => (
        <View key={g.word} style={styles.rider} pointerEvents="none">
          <View style={[styles.tagString, { left: g.x - 0.6 }]} />
          <View style={[styles.tag, { left: g.x - TAG.w / 2 }]}>
            <Text style={styles.tagText}>{g.word}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

// ── the machine's moving parts ──────────────────────────────────────────────

const CREST_BULBS = [1, 2, 3, 4, 5].map((k) => {
  const a = Math.PI + (k / 6) * Math.PI;
  return { x: 72 + 31 * Math.cos(a), y: 361 + 13 * Math.sin(a) };
});
function CrestBulbs({ S }: { S: SharedValue<any> }) {
  return <>{CREST_BULBS.map((c, k) => <CrestBulb key={k} S={S} k={k} x={c.x} y={c.y} />)}</>;
}
function CrestBulb({ S, k, x, y }: { S: SharedValue<any>; k: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => {
    const h = S.value.hum;
    const chase = 0.5 + 0.5 * Math.sin(S.value.t * (1.6 + 7 * h) - k * 1.1);
    return { opacity: 0.45 + 0.3 * chase + 0.25 * h };
  });
  return <Animated.View pointerEvents="none" style={[styles.bulb, { left: x - 2.2, top: y - 2.2 }, st]} />;
}
function BallGlow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.22 + 0.14 * Math.sin(S.value.t * 1.7) + 0.45 * S.value.hum,
    transform: [{ scale: 1 + 0.18 * S.value.hum }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.ballGlow, st]} />;
}
/** The Oracle's head: a slow turn while idle, nodding along as the machine works. */
function OracleHead({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const h = S.value.hum;
    const deg = 3 * Math.sin(S.value.t * 0.6) + h * 8 * Math.sin(S.value.t * 5.2);
    return { transform: [{ translateX: NECK.x }, { translateY: NECK.y }, { rotate: `${deg}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><ObjectArt parts={HEAD_ART} tone={TONE} /></Animated.View>;
}
/** The crank on the cabinet's side: its arm, seen edge on, swings up and down; the knob sticks out. */
function Crank({ S }: { S: SharedValue<any> }) {
  const arm = useAnimatedStyle(() => ({ transform: [{ scaleY: (BOSS.y - S.value.knobY) / CRANK_R }] }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateY: S.value.knobY }] }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.crankArm, arm]} />
      <Animated.View pointerEvents="none" style={[styles.rider, knob]}>
        <View style={styles.crankPeg} />
        <View style={styles.crankKnob} />
      </Animated.View>
    </>
  );
}
/** A printed card: lying in the tray face down, in her hand, flipped, stood up facing out. */
function useCardStyles(S: SharedValue<any>, k: 'c1' | 'c2') {
  const st = useAnimatedStyle(() => {
    const c = S.value[k];
    return {
      opacity: c.o,
      transform: [{ translateX: c.x }, { translateY: c.y }, { scaleX: Math.max(0.001, c.sx) }, { scaleY: Math.max(0.001, c.sy) }],
    };
  });
  const front = useAnimatedStyle(() => ({ opacity: S.value[k].face }));
  const back = useAnimatedStyle(() => ({ opacity: 1 - S.value[k].face }));
  return { st, front, back };
}
function FirstCard({ S }: { S: SharedValue<any> }) {
  const { st, front, back } = useCardStyles(S, 'c1');
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, back]}><ObjectArt parts={CARD_BACK} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, front]}>
        <ObjectArt parts={CARD_FACE} tone={TONE} />
        <View style={styles.cardWords}>
          <Text style={styles.cardText}>FUDGE</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
function SecondCard({ S }: { S: SharedValue<any> }) {
  const { st, front, back } = useCardStyles(S, 'c2');
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, back]}><ObjectArt parts={CARD_BACK} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, front]}>
        <ObjectArt parts={CARD_FACE} tone={TONE} />
        <View style={styles.cardWords}>
          <Text style={styles.cardText}>MINT</Text>
          <Text style={styles.cardText}>TO SPITE</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
/** The fan of fortune cards in the machine's brass hand, rising out of the crest. */
function Fan({ S }: { S: SharedValue<any> }) {
  const rise = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.fan * 3),
    transform: [{ translateY: FAN.rise * (1 - S.value.fan) }],
  }));
  return (
    <Animated.View style={[styles.fanLayer, rise]} pointerEvents="none">
      <View style={styles.fanRod} />
      {FAN_CARDS.map((c) => (
        <View key={c.id} style={[styles.fanRodArm, rodStyle(c.x, c.y + FC.h / 2 - 3)]} />
      ))}
      <FanCard S={S} k={0} />
      <FanCard S={S} k={1} />
      <FanCard S={S} k={2} />
      <View style={[styles.rider, { transform: [{ translateX: FAN.x }, { translateY: FAN.hand + 8 }] }]}>
        <ObjectArt parts={HAND_ART} tone={TONE} />
      </View>
      <Puff S={S} />
    </Animated.View>
  );
}
/** A brass rod from the hand to a card's foot. */
function rodStyle(x: number, y: number) {
  const dx = x - FAN.x;
  const dy = y - FAN.hand;
  const len = Math.max(1, Math.hypot(dx, dy));
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { left: FAN.x, top: FAN.hand - 1, width: len, transform: [{ rotate: `${deg}deg` }] };
}
function FanCard({ S, k }: { S: SharedValue<any>; k: 0 | 1 | 2 }) {
  const c = FAN_CARDS[k];
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const sway = 1.5 * Math.sin(v.t * 1.4 + k * 2.1);
    let dx = 0;
    let dy = sway;
    let deg: number = c.deg;
    let sc = 1;
    if (c.id === 'loves') {
      dy -= 8 * v.rLoves + 5 * Math.sin(Math.PI * Math.min(1, v.rLoves * 1.5));
      sc = 1 + 0.12 * Math.sin(Math.PI * Math.min(1, v.rLoves * 1.6)) + 0.04 * v.rLoves;
    }
    if (c.id === 'sneeze') {
      dx = 3 * Math.sin(v.rSneeze * Math.PI * 6) * (1 - v.rSneeze);
      deg += 16 * v.rSneeze;
      dy += 6 * v.rSneeze;
    }
    if (c.id === 'bully') dy += 34 * v.rBully;
    return { transform: [{ translateX: c.x + dx }, { translateY: c.y + dy }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <ObjectArt parts={FORT_ART[c.id]} tone={TONE} />
      {c.id === 'loves' ? (
        <View style={styles.fortWords}>
          <Text style={styles.cardText}>LOVES</Text>
          <Text style={styles.cardText}>FUDGE</Text>
        </View>
      ) : c.id === 'sneeze' ? (
        <View style={styles.fortWords}>
          <Text style={styles.cardText}>ACHOO!</Text>
        </View>
      ) : (
        <View style={styles.fortWords}>
          <Text style={styles.cardText}>PAID A</Text>
          <Text style={styles.cardText}>BULLY</Text>
        </View>
      )}
    </Animated.View>
  );
}
/** A sneeze bursts out of the ACHOO! card when it is picked. */
function Puff({ S }: { S: SharedValue<any> }) {
  const c = FAN_CARDS[0];
  const st = useAnimatedStyle(() => {
    const r = S.value.rSneeze;
    const burst = Math.sin(Math.PI * Math.min(1, r * 1.4));
    return { opacity: 0.95 * burst, transform: [{ translateX: c.x + 4 }, { translateY: c.y - 34 - 8 * r }, { scale: 0.4 + 0.8 * r }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={[styles.puff, { left: -12, top: -6, width: 16, height: 12 }]} />
      <View style={[styles.puff, { left: -3, top: -9, width: 16, height: 14 }]} />
      <View style={[styles.puff, { left: 6, top: -4, width: 12, height: 10 }]} />
    </Animated.View>
  );
}

// ── the stall's moving parts ─────────────────────────────────────────────────

function Dice({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => {
    const r = S.value.rDice;
    return { transform: [{ translateX: DICE.a - 5 * r }, { translateY: DICE.y - 9 * Math.sin(Math.PI * r) }, { rotate: `${-8 - 450 * r}deg` }] };
  });
  const b = useAnimatedStyle(() => {
    const r = S.value.rDice;
    return { transform: [{ translateX: DICE.b + 7 * r }, { translateY: DICE.y - 6 * Math.sin(Math.PI * r) }, { rotate: `${10 + 380 * r}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, a]} pointerEvents="none"><ObjectArt parts={DIE_A} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, b]} pointerEvents="none"><ObjectArt parts={DIE_B} tone={TONE} /></Animated.View>
    </>
  );
}
type At = { x: number; y: number; o: number };
function Sweet({ S, k, art }: { S: SharedValue<any>; k: 'fudge' | 'mint'; art: ReturnType<typeof ph6FudgeBit> }) {
  const at0 = useDerivedValue<At>(() => S.value[k]);
  const st = useAnimatedStyle(() => ({ opacity: at0.value.o, transform: [{ translateX: at0.value.x }, { translateY: at0.value.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><ObjectArt parts={art} tone={TONE} /></Animated.View>;
}
function ToffeeJar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.jar.x }, { translateY: S.value.jar.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><ObjectArt parts={JAR_TOFFEE_ART} tone={TONE} /></Animated.View>;
}
/** Q1's right answer: a heart over his head, and a line of dots from it down to the fudge. */
function Heart({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rHim;
    return { opacity: r, transform: [{ translateX: S.value.cuX + 17 }, { translateY: 418 - 8 * r }, { scale: 0.5 + 1.1 * r }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={[styles.heartLobe, { left: -6.5 }]} />
        <View style={[styles.heartLobe, { left: -0.5 }]} />
        <View style={styles.heartPoint} />
      </Animated.View>
      <HeartDot S={S} k={0} />
      <HeartDot S={S} k={1} />
      <HeartDot S={S} k={2} />
    </>
  );
}
function HeartDot({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rHim;
    const f = (k + 1) / 4;
    const hx = S.value.cuX + 17;
    const hy = 422 - 8 * r;
    return {
      opacity: clamp01(r * 3 - k * 0.5),
      transform: [{ translateX: lerp(hx, S.value.fudge.x, f) }, { translateY: lerp(hy, S.value.fudge.y, f) }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.heartDot} /></Animated.View>;
}

// ── the two questions ────────────────────────────────────────────────────────

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** TRACE THE CAUSE: what decided his pick? He did. */
const CAUSE_Q: Q[] = [
  { id: 'card', left: 64, top: 432, w: 48, h: 40, r: 3, correct: false },
  { id: 'dice', left: 166, top: 432, w: 44, h: 40, r: 4, correct: false },
  { id: 'him', left: 300, top: 408, w: 46, h: 58, r: 6, correct: true },
];
/** PICK A FORTUNE CARD: which choice came from his own wants? */
const FORTUNE_Q: Q[] = FAN_CARDS.map((c) => ({
  id: c.id, left: c.x - FC.w / 2, top: 302 - FC.h / 2, w: FC.w, h: FC.h, r: 3, correct: c.id === 'loves',
}));
function CauseTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={CAUSE_Q} k="q1" />;
}
function FortuneTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={FORTUNE_Q} k="q2" />;
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
  night: { position: 'absolute', left: 0, right: 0, top: 160, height: 182, backgroundColor: W.ph6Night.base },
  dusk: { position: 'absolute', left: 0, right: 0, top: 342, height: 62, backgroundColor: W.ph6Dusk.base },
  haze: { position: 'absolute', left: 0, right: 0, top: 404, height: 52, backgroundColor: W.ph6Haze.base },
  turf: { position: 'absolute', left: 0, right: 0, top: 456, height: GROUND - 456, backgroundColor: W.ph6Turf.base },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: W.ph6Bulb.base },
  bulb: { position: 'absolute', width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: W.ph6Bulb.base },
  pole: { position: 'absolute', left: -1.2, top: 326, width: 2.4, height: 117, backgroundColor: W.brass.base },
  tagString: { position: 'absolute', top: 373, width: 1.2, height: TAG.top - 373, backgroundColor: W.brass.shade },
  tag: {
    position: 'absolute', top: TAG.top, width: TAG.w, height: TAG.h, borderRadius: 2,
    backgroundColor: W.ph6Cream.base, borderWidth: 1, borderColor: W.ph6Canopy.base,
    alignItems: 'center', justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Cinzel_700Bold', fontSize: 8.6, lineHeight: 10, color: W.ph6Cream.label, includeFontPadding: false,
  },
  crest: {
    position: 'absolute', left: CREST.left, top: CREST.top, width: CREST.w, height: CREST.h, borderRadius: 1.5,
    backgroundColor: W.ph6Cream.base, alignItems: 'center', justifyContent: 'center',
  },
  crestText: {
    fontFamily: 'Cinzel_700Bold', fontSize: 8.6, lineHeight: 10, color: W.ph6CardRed.base, includeFontPadding: false,
  },
  ballGlow: {
    position: 'absolute', left: BALL_C.x - 14, top: BALL_C.y - 14, width: 28, height: 28, borderRadius: 14,
    backgroundColor: W.ph6Ball.base,
  },
  crankArm: {
    position: 'absolute', left: BOSS.x + 0.6, top: BOSS.y - CRANK_R, width: 2.4, height: CRANK_R,
    backgroundColor: W.brass.shade, transformOrigin: '50% 100%',
  },
  crankPeg: { position: 'absolute', left: BOSS.x + 1, top: -1.1, width: KNOB_X - BOSS.x - 1, height: 2.2, backgroundColor: W.brass.base },
  crankKnob: {
    position: 'absolute', left: KNOB_X - 2.6, top: -2.6, width: 5.2, height: 5.2, borderRadius: 2.6,
    backgroundColor: W.ph6Walnut.base, borderWidth: 0.8, borderColor: W.ph6Beard.base,
  },
  cardWords: {
    position: 'absolute', left: -23.5, top: -12.5, width: 47, height: 25, alignItems: 'center', justifyContent: 'center',
  },
  fortWords: {
    position: 'absolute', left: -21, top: 5, width: 42, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  cardText: {
    fontFamily: 'Cinzel_700Bold', fontSize: 8.6, lineHeight: 10, color: W.ph6CardRed.base, includeFontPadding: false,
  },
  fanLayer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  fanRod: { position: 'absolute', left: FAN.x - 1.2, top: FAN.hand, width: 2.4, height: 30, backgroundColor: W.brass.shade },
  fanRodArm: { position: 'absolute', height: 2, backgroundColor: W.brass.base, transformOrigin: '0% 50%' },
  puff: { position: 'absolute', borderRadius: 8, backgroundColor: W.ph6Puff.base, borderWidth: 1, borderColor: W.ph6Puff.shade },
  heartLobe: { position: 'absolute', top: -5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: W.ph6Heart.base },
  heartPoint: {
    position: 'absolute', left: -3.6, top: -3.2, width: 7.2, height: 7.2, backgroundColor: W.ph6Heart.base,
    transform: [{ rotate: '45deg' }],
  },
  heartDot: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.ph6Heart.base },
  string: { position: 'absolute', width: 40.8, height: 0.8, backgroundColor: W.ph6Beard.base },
  flag: {
    position: 'absolute', width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  glint: { position: 'absolute', height: 1.4, borderRadius: 0.7, backgroundColor: W.cloudWhite.base, opacity: 0.55 },
  clear: { flexGrow: 1 },
});

export function Phil6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil6Scene} band={[240, 514]} camera={CAM} />;
}
