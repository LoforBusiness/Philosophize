import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './psych2Script';
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
import { emoteAny, emoteAnyLive, postureHold } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, tint, loaf, trolley, jamJar, jamSplat, jamLid, aisleSign, cctvMount, cctvCamera, cctvScreen,
  shelfEnd, shoppingList, type NaturalKey, type ObjPart,
} from './objects';
import { BY_ID } from './wardrobe';
import { EMBER } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-2, "Why Memory Gets Things Wrong" — A SUPERMARKET AISLE,
// TWO TROLLEYS, AND A JAR OF JAM ON THE FLOOR.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The shopper with the bun (cheerful, one step
// behind) and the shopper in the cap (kind, sorry for everything) bump trolleys at the
// end of the jam aisle and her jar breaks; each remembers a different bump. The
// psychologist (the top hat) walks in under the shop's ceiling camera and explains.
//
//   b0   both push their trolleys in, his from round the end of the shelving; the noses
//        meet with a clunk, the trolleys jolt and her jar rocks; she waves.
//   b1   he lets go and steps round to the front of his trolley, a hand to his chest,
//        hands spread low ("barely moving"); her jar tips over the nose and smashes on
//        the floor, she puts her hands to her face, and he crouches to it.
//   b2   she turns her back on him and acts out a trolley flying round the corner, a
//        hand to her chest, a hand to her ear, a hand to her eyes; behind her he picks
//        up the jar's lid and holds it out to her. She does not see, and turns back.
//   b3   the psychologist walks in from the left under the ceiling camera, which turns
//        to watch him; he tips his hat and opens a hand to her, then to him, then both.
//        The cap stands up and drops the lid in his own basket.
//   b4   he points up at the camera ("a memory isn't a recording") and it turns back to
//        the trolleys; his hands build something twice. The cap takes a jar of
//        marmalade out of his basket, carries it to the jam shelf and puts it in the
//        gap her jar left: it fits, and it is not what was there.
//   b5   Q1: the aisle sign's three slats turn over to HIT · BUMPED · SMASHED — tap one.
//   b6   he points down the slats; they turn over to one plain question, WHAT
//        HAPPENED?, and he opens a hand to her.
//   b7   the cap walks back to his trolley, taps his chest, rolls it back and forward at
//        a crawl, and opens a hand to her; she puts her hands on her hips.
//   b8   one finger up, then down; her shopping list slips off her trolley's handle and
//        drifts to the floor.
//   b9   Q2: the camera, the jam on the floor and her shopping list — tap one.
//   b10  the monitor under the ceiling lights and plays the bump back, slowly; she steps
//        under it, leans in, points up at it, then turns to him, hands spread.
//
// COMPOSITION, in stage units. The end of a shelving run 312–396 × 372–500 on the right,
// four shelves of jam jars on it (the gap at 327 on the third shelf, 444). Hung from the
// ceiling (306): the camera on its pole at 36 (joint 36, 319), the monitor 72–136 ×
// 306–352, and the aisle sign 150–310 × 306–362 — its red number panel 150–179, its three
// slats 182–309 × 314–330 · 330–346 · 346–362. The trolleys are 54 × 44 with their noses
// meeting at 200: hers 149–200 (grip 149), his 200–251 (grip 251). She pushes from 131,
// he from 269; he steps round to 226 to crouch over the jam, to 305 to fill the shelf
// gap and back to 288 so the jar he put there shows. The psychologist stands at 52 under the camera. On the floor: the jam 182–226,
// the fallen list at 96. Every hand meets what it holds within the rig's safe reach
// (~23 units from the shoulder at K 0.76): the grip is 18 in front of the pusher and the
// shelf gap 22 from the cap's shoulder at 305. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, psychology-foundations-2). 0 for a beat with no voice.
 */
const LINES = [3.54, 5.2, 6.42, 5.62, 9.17, 0, 9.31, 5.55, 7.72, 0, 4.51, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// hands on the hips, waiting for the answer, leaning in; and a posture for the crouch.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const HIPS = 163;
const WAIT = 260;
const LEAN = 177;
/** Posture 13: down on the haunches, peering at the floor. */
const CROUCH = 13;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BUMP = is('bump');
const A_JAM = is('jam');
const A_RETELL = is('retell');
const A_ARRIVE = is('arrive');
const A_REBUILD = is('rebuild');
const A_WORD = is('word');
const A_SURE = is('sure');
const A_CONFIDENT = is('confident');
const A_REPLAY = is('replay');
const N_JAM = A_JAM.indexOf(1);
const N_RETELL = A_RETELL.indexOf(1);
const N_ARRIVE = A_ARRIVE.indexOf(1);
const N_REBUILD = A_REBUILD.indexOf(1);
const N_CONFIDENT = A_CONFIDENT.indexOf(1);
const N_REPLAY = A_REPLAY.indexOf(1);
const SIGN_V = BEATS.map((b) => b.sign ?? 0);
const SCREEN_V = BEATS.map((b) => b.screen ?? 0);
const Q1 = BEATS.map((b) => (b.wording ? 1 : 0));
const Q2 = BEATS.map((b) => (b.witness ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const B_X0 = 77;
const C_X0 = 323;
const H_X0 = -30;
const B_HOME = 131;
const C_HOME = 269;
const B_LEGS: Track[] = BEATS.map((_, n) => (n < N_REPLAY ? [[0, B_HOME]] : [[0.04, 114]]));
const B_TURN: Track[] = BEATS.map((_, n) => (
  n < N_RETELL ? [[0, 1]] : n === N_RETELL ? [[0, 1], [0.04, -1], [0.9, 1]]
    : n < N_REPLAY ? [[0, -1]] : n === N_REPLAY ? [[0, -1], [0.6, 1]] : [[0, 1]]
));
const C_LEGS: Track[] = [
  [[0, C_HOME]], [[0.06, 226]], [[0, 226]], [[0, 226]], [[0.6, 305]], [[0, 288]], [[0, 288]],
  [[0, C_HOME]], [[0, C_HOME]], [[0, C_HOME]], [[0, C_HOME]], [[0, C_HOME]], [[0, C_HOME]],
];
const C_TURN: Track[] = BEATS.map((_, n) => (n === N_REBUILD ? [[0, -1], [0.46, 1], [0.9, -1]] : [[0, -1]]));
const H_LEGS: Track[] = BEATS.map((b) => (b.th ? [[0, 52]] : [[0, H_X0]]));
const H_TURN: Track[] = BEATS.map(() => [[0, 1]]);
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const B_P = [TALK, LISTEN, TALK, NOD, LISTEN, WAIT, NOD, HIPS, LISTEN, WAIT, LEAN, NOD, LISTEN];
const C_P = [LISTEN, TALK, LISTEN, LISTEN, LISTEN, WAIT, NOD, TALK, NOD, WAIT, LISTEN, WAIT, LISTEN];
const H_P = [LISTEN, LISTEN, LISTEN, EXPLAIN, EXPLAIN, WAIT, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, LEAN, LISTEN];

// ── the two trolleys ─────────────────────────────────────────────────────────
const TROLLEY_W = 54;
const TROLLEY_H = 44;
const TROLLEY_Y = GROUND - TROLLEY_H / 2;
/** From the grip to the trolley's centre: (50 − 6) of its square, and down to its middle. */
const GRIP_TO_MID = (50 - 6) * (TROLLEY_W / 100);
const GRIP_Y = TROLLEY_Y + (13 - 50) * (TROLLEY_H / 100);
/** A hand pushing a trolley stands this far behind its grip. */
const PUSH = 18;
const TB_GRIP = B_HOME + PUSH;            // 149: her nose at 200
const TC_GRIP = C_HOME - PUSH;            // 251: his nose at 200
const TROLLEY_ART = trolley(0, 0, TROLLEY_W, TROLLEY_H);
/** Where her basket's jar sits, and where it smashes. */
const JAR_AT = { x: 190, y: 458 };
const JAR_DOWN = { x: 205, y: 494 };
const SPLAT = { x: 204, y: 500, w: 46, h: 28 };
const SPLAT_ART = jamSplat(SPLAT.x, SPLAT.y, SPLAT.w, SPLAT.h);
const LOAF_ART = tint(loaf(173, 463, 24, 12), 'crust');
const JAR_ART = jamJar(0, 0, 11, 12);
const LID_ART = jamLid(0, 0, 9, 9);
/** The lid lying on the floor by the jam, held out in his hand, and dropped in his basket. */
const LID_REST = { x: 222, y: 505 };
const LID_BASKET = { x: 214, y: 462 };
/** The marmalade in his basket, and the gap on the jam shelf it ends up in. */
const OJ_BASKET = { x: 237, y: 458 };
const OJ_ART = jamJar(0, 0, 11, 12, 'marmalade');
const GAP = { x: 327, y: 444.5 };
/** Her shopping list, clipped above her grip; and where it lands on the floor. */
const LIST_ON = { dx: 0, y: 451 };
const LIST_DOWN = { x: 96, y: 505 };
const LIST_ART = shoppingList(0, 0, 12, 14);

// ── the shelving at the end of the aisle, and its jam ────────────────────────
const SHELF_ART = shelfEnd(354, 436, 84, 128);
const JAR_XS = [327, 341, 355, 369, 383];
const ROWS: { y: number; fills: NaturalKey[] }[] = [
  { y: 390.5, fills: ['marmalade', 'marmalade', 'marmalade', 'marmalade', 'marmalade'] },
  { y: 418.5, fills: ['blackcurrant', 'blackcurrant', 'blackcurrant', 'blackcurrant', 'blackcurrant'] },
  { y: GAP.y, fills: ['jam', 'jam', 'jam', 'jam', 'jam'] },
  { y: 470.5, fills: ['jam', 'marmalade', 'jam', 'marmalade', 'jam'] },
];
/** Every jar on the shelves but the one she took: the first on the third shelf. */
const SHELF_JARS: ObjPart[] = ROWS.flatMap((r, k) => JAR_XS.flatMap((x, j) => (
  k === 2 && j === 0 ? [] : jamJar(x, r.y, 11, 12, r.fills[j])
)));

// ── hung from the ceiling ────────────────────────────────────────────────────
const SIGN = { x: 150, y: 306, w: 160, h: 56 };
const SIGN_ART = aisleSign(SIGN.x + SIGN.w / 2, SIGN.y + SIGN.h / 2, SIGN.w, SIGN.h);
/** The slats' writing area: the square's x 21–99, and three rows from y 14 to 100. */
const SLAT_L = SIGN.x + 21 * (SIGN.w / 100) + 1;
const SLAT_W = SIGN.x + 99 * (SIGN.w / 100) - SLAT_L;
const SLAT_TOP = SIGN.y + 14 * (SIGN.h / 100);
const SLAT_H = (SIGN.h - 14 * (SIGN.h / 100)) / 3;
const SLAT_WORDS = [
  ['JAMS', 'HONEY', 'SPREADS'],
  ['HIT', 'BUMPED', 'SMASHED'],
  ['', 'WHAT HAPPENED?', ''],
];
const PANEL = { left: SIGN.x, top: SLAT_TOP, w: 18 * (SIGN.w / 100), h: SIGN.h - 14 * (SIGN.h / 100) };
const MOUNT_ART = cctvMount(36, 314, 16, 16);
/** The camera's joint, which it turns on. */
const PIVOT = { x: 36, y: 319 };
const CAM_ART = cctvCamera(19, 0, 38, 16);
/** The angle it watches the trolleys at, in degrees below the horizontal. */
const AIM_TROLLEYS = (Math.atan2(470 - PIVOT.y, 200 - PIVOT.x) * 180) / Math.PI;
const SCREEN = { x: 104, y: 329, w: 64, h: 46 };
const SCREEN_ART = cctvScreen(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
/** The screen inside its bezel (`SCREEN_FACE` 50, 62, 86 × 56 of the square). */
const FACE = {
  left: SCREEN.x - 43 * (SCREEN.w / 100), top: SCREEN.y + (34 - 50) * (SCREEN.h / 100),
  w: 86 * (SCREEN.w / 100), h: 56 * (SCREEN.h / 100),
};
const MINI_ART = trolley(0, 0, 18, 14);

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteAny(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteAnyLive(code, t, bt);
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
/** Eased 0 → 1 over [a, z] SECONDS of the beat — for what is timed by the clock. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** The angle from the camera's joint to a figure's head at x, kept between 40° and 90°. */
function aimAt(x: number): number {
  'worklet';
  const a = (Math.atan2(430 - PIVOT.y, x - PIVOT.x) * 180) / Math.PI;
  return a < 40 ? 40 : a > 90 ? 90 : a;
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

const CAM = followMoves(B_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('psychology'));

export default function Psych2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldH = useHeld();
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

    // ── the shopper with the bun ────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, B_X0), B_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), B_TURN[n], b, L), 1);
    // the clunk: both trolleys jolt back a little the moment the noses meet
    const clunkAt = A_BUMP[n] ? wb.arrive : -1;
    const jolt = A_BUMP[n] ? sm(b, clunkAt - 0.02, clunkAt + 0.06) * (1 - sm(b, clunkAt + 0.06, clunkAt + 0.45)) : 0;
    // her trolley's grip: pushed in front of her, then left where it stopped
    const tbNow = n <= N_JAM ? xB + PUSH - 3 * jolt : TB_GRIP;
    const tb = carry(cv, 2, n, tbNow, tbNow, n <= N_JAM ? 1 : tr);
    let sb = bodyOf(wb, B_P, n, t, b);
    if (A_BUMP[n]) {
      // both hands on the grip as she pushes; the jolt rocks her back; then a wave
      sb = hand(sb, xB, dB, 1, tb, GRIP_Y, 1 - bp(0.55, 0.66, 0.9));
      sb = hand(sb, xB, dB, -1, tb - 1, GRIP_Y + 1, 1);
      sb = { ...sb, tilt: sb.tilt - 0.08 * jolt };
      sb = hand(sb, xB, dB, 1, xB + 14, 428, bp(0.55, 0.66, 0.9));
    }
    if (A_JAM[n]) {
      // holding on as he apologises; at "there goes your jam", hands to her face
      const grip = 1 - st(0.72, 0.8);
      sb = hand(sb, xB, dB, 1, tb, GRIP_Y, grip);
      sb = hand(sb, xB, dB, -1, tb - 1, GRIP_Y + 1, grip);
      const face = st(0.78, 0.86);
      sb = hand(sb, xB, dB, 1, xB + 9, 433, face);
      sb = hand(sb, xB, dB, -1, xB + 6, 436, face);
    }
    if (A_RETELL[n]) {
      // her back to him: "flying round that corner" — an arm swept round from behind
      // her and out in front, fast; "I promise you" — a hand to her chest; "I heard the
      // glass break" — a hand to her ear; "before I even saw him" — a hand to her eyes
      const sweep = st(0.12, 0.3);
      sb = hand(sb, xB, dB, 1, lerp(xB + 14, xB - 22, sweep), lerp(428, 456, sweep), bp(0.08, 0.14, 0.36));
      sb = hand(sb, xB, dB, 1, xB - 3, 452, bp(0.36, 0.41, 0.52));
      sb = hand(sb, xB, dB, 1, xB + 2, 431, bp(0.55, 0.6, 0.76));
      sb = lookOf(sb, 0.12, bp(0.55, 0.6, 0.76));
      sb = hand(sb, xB, dB, 1, xB - 8, 427, bp(0.78, 0.84, 0.98));
    }
    if (A_SURE[n]) {
      // hands on her hips already (the pose); her chin up at "just as certain"
      sb = lookOf(sb, -0.16, bp(0.6, 0.7, 0.98));
    }
    if (A_REPLAY[n]) {
      // under the monitor: leaning in, looking up, pointing at it — then turned to him,
      // hands spread, "so who broke my jam?"
      const up = bp(0.12, 0.2, 0.6);
      sb = lookOf(sb, -0.34, up);
      sb = hand(sb, xB, dB, 1, xB + 6, 417, bp(0.18, 0.26, 0.54));
      const spread = bp(0.66, 0.74, 0.98);
      sb = hand(sb, xB, dB, 1, xB + 16 * dB, 456, spread);
      sb = hand(sb, xB, dB, -1, xB - 12 * dB, 456, spread);
    }
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the shopper in the cap ──────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 3, n, C_X0), C_LEGS[n], b, L);
    const xC = carry(cv, 3, n, wc.x, wc.x, 1);
    const dC = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, -1), C_TURN[n], b, L), 1);
    // b7: his trolley rolled back towards him and forward again, at a crawl
    const creep = A_SURE[n] ? 5 * bp(0.32, 0.4, 0.5) : 0;
    const tcNow = A_BUMP[n] ? xC - PUSH + 3 * jolt : TC_GRIP + creep;
    const tc = carry(cv, 5, n, tcNow, tcNow, A_BUMP[n] || A_SURE[n] ? 1 : tr);
    let sc = bodyOf(wc, C_P, n, t, b);
    if (A_BUMP[n]) {
      sc = hand(sc, xC, dC, 1, tc, GRIP_Y, 1);
      sc = hand(sc, xC, dC, -1, tc + 1, GRIP_Y + 1, 1);
      sc = { ...sc, tilt: sc.tilt - 0.08 * jolt };
    }
    let lidT = n <= N_JAM ? 0 : n === N_RETELL ? 1 : 3;
    let ojT = n < N_REBUILD ? 0 : 2;
    if (A_JAM[n]) {
      // "sorry" — a hand to his chest as he comes round; "barely moving" — hands low and
      // spread; then down on his haunches over the broken jar
      sc = hand(sc, xC, dC, 1, xC - 3, 452, bp(0.02, 0.1, 0.24));
      const spread = bp(0.4, 0.48, 0.64);
      sc = hand(sc, xC, dC, 1, xC - 13, 466, spread);
      sc = hand(sc, xC, dC, -1, xC + 11, 466, spread);
      sc = mixStance(sc, postureHold(CROUCH, t), st(0.8, 0.92));
      lidT = st(0.76, 0.84);
    }
    if (A_RETELL[n]) {
      // still down by the jam: he picks up the lid, and holds it out to her back
      sc = mixStance(sc, postureHold(CROUCH, t), 1);
      const out = st(0.26, 0.36);
      sc = hand(sc, xC, dC, 1, lerp(LID_REST.x, xC - 15, out), lerp(LID_REST.y - 1, 470, out), st(0.12, 0.2));
      lidT = 1 + st(0.21, 0.25);
    }
    if (A_ARRIVE[n]) {
      // standing again, the lid goes into his own basket
      sc = hand(sc, xC, dC, 1, lerp(xC - 15, LID_BASKET.x, st(0.06, 0.18)), lerp(468, LID_BASKET.y, st(0.06, 0.18)),
        1 - st(0.24, 0.34));
      lidT = 2 + st(0.17, 0.21);
    }
    if (A_REBUILD[n]) {
      // the marmalade out of his basket, carried to the shelf, put in the gap
      const take = st(0.48, 0.54) * (1 - st(0.86, 0.92));
      const lift = st(0.54, 0.6);
      const place = st(0.77, 0.84);
      const cx = lerp(OJ_BASKET.x, xC + 9 * dC, lift);
      const cy = lerp(OJ_BASKET.y, 452, lift);
      sc = hand(sc, xC, dC, 1, lerp(cx, GAP.x, place), lerp(cy, GAP.y, place), take);
      ojT = st(0.53, 0.56) + st(0.84, 0.87);
    }
    if (A_SURE[n]) {
      // "I'm certain" — a tap on his chest; hands to the grip, the crawl; then a hand
      // open to her, "she's just as certain"
      sc = hand(sc, xC, dC, 1, xC - 3, 451, bp(0.12, 0.18, 0.28));
      const grip = st(0.26, 0.32) * (1 - st(0.5, 0.56));
      sc = hand(sc, xC, dC, 1, tc, GRIP_Y, grip);
      sc = hand(sc, xC, dC, -1, tc + 1, GRIP_Y + 1, grip);
      sc = hand(sc, xC, dC, 1, xC - 22, 454, bp(0.58, 0.68, 0.96));
    }
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the psychologist ────────────────────────────────────────────────────
    const wh = legsOf(carrySource(cv, 6, n, H_X0), H_LEGS[n], b, L);
    const xH = carry(cv, 6, n, wh.x, wh.x, 1);
    const dH = carry(cv, 7, n, 0, faceOf(carrySource(cv, 7, n, 1), H_TURN[n], b, L), 1);
    let sh = bodyOf(wh, H_P, n, t, b);
    let aimNow = AIM_TROLLEYS;
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; "two people" — a hand to her, then to him;
      // "neither of them is lying" — both hands open
      const after = wh.arrive / L;
      sh = hand(sh, xH, dH, 1, xH + 5 * dH, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.13));
      sh = hand(sh, xH, dH, 1, xH + 22, 452, bp(0.4, 0.46, 0.55));
      sh = hand(sh, xH, dH, 1, xH + 24, 444, bp(0.55, 0.61, 0.69));
      const open = bp(0.72, 0.8, 0.98);
      sh = hand(sh, xH, dH, 1, xH + 18, 457, open);
      sh = hand(sh, xH, dH, -1, xH - 14, 457, open);
      // the ceiling camera turns to watch him walk in
      aimNow = lerp(AIM_TROLLEYS, aimAt(xH), st(0.02, 0.16));
    }
    if (A_REBUILD[n]) {
      // "a memory isn't a recording" — a finger up at the camera, which turns back to
      // the trolleys; "builds it again" — hands apart and together, twice; "fills the
      // gaps" — one hand pressed into the space between them
      const up = bp(0.01, 0.06, 0.2);
      sh = hand(sh, xH, dH, 1, xH + 4, 418, up);
      sh = lookOf(sh, -0.3, up);
      aimNow = lerp(aimAt(xH), AIM_TROLLEYS, st(0.24, 0.36));
      const build = bp(0.3, 0.34, 0.62);
      const gap = 8 + 8 * Math.cos(2 * Math.PI * 2 * stageLin(b, L, 0.32, 0.6));
      sh = hand(sh, xH, dH, 1, xH + 12 + gap, 449, build);
      sh = hand(sh, xH, dH, -1, xH + 12 - gap, 449, build);
      sh = hand(sh, xH, dH, 1, xH + 18, 458, bp(0.7, 0.77, 0.94));
    }
    if (A_WORD[n]) {
      // pointing down the three slats as he names the words; then a hand open to her
      const point = bp(0.02, 0.08, 0.44);
      sh = hand(sh, xH, dH, 1, 236, lerp(SLAT_TOP + 8, SLAT_TOP + 2.5 * SLAT_H, stageLin(b, L, 0.08, 0.4)), point);
      sh = lookOf(sh, -0.24, point);
      sh = hand(sh, xH, dH, 1, xH + 22, 452, bp(0.62, 0.7, 0.97));
    }
    if (A_CONFIDENT[n]) {
      // one finger up, and down; then a hand turned over as the story is retold
      sh = hand(sh, xH, dH, 1, xH + 9, 420, bp(0.03, 0.09, 0.32));
      sh = hand(sh, xH, dH, 1, xH + 20, 452, bp(0.4, 0.5, 0.72));
    }
    const prevH = carryFrom(heldH, n, hHold(H_P[p], t));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the things that change ──────────────────────────────────────────────
    // her jar: rocked by the clunk, then over the nose and onto the floor
    const rock = A_BUMP[n] && b > clunkAt
      ? 14 * Math.sin((b - clunkAt) * 13) * Math.exp(-(b - clunkAt) * 2.6) * sm(b, clunkAt, clunkAt + 0.05)
      : 0;
    const fallNow = A_JAM[n] ? st(0.68, 0.78) : n > N_JAM ? 1 : 0;
    const signNow = A_WORD[n] ? 1 + st(0.44, 0.56) : SIGN_V[n];
    const listNow = A_CONFIDENT[n] ? stageLin(b, L, 0.74, 0.98) : n > N_CONFIDENT ? 1 : 0;
    const replayNow = A_REPLAY[n] ? stageLin(b, L, 0.1, 0.8) : n > N_REPLAY ? 1 : 0;

    return {
      b: pose(figB, xB, GROUND, K, dB, 1),
      c: pose(figC, xC, GROUND, K, dC, 1),
      h: pose(figH, xH, GROUND, K, dH, 1),
      tb,
      tc,
      rock: carry(cv, 8, n, rock, rock, 1),
      fall: carry(cv, 9, n, fallNow, fallNow, A_JAM[n] ? 1 : tr),
      lid: carry(cv, 10, n, lidT, lidT, tr),
      oj: carry(cv, 11, n, ojT, ojT, tr),
      sign: carry(cv, 12, n, signNow, signNow, A_WORD[n] ? 1 : tr),
      aim: carry(cv, 13, n, aimNow, aimNow, tr),
      list: carry(cv, 14, n, listNow, listNow, A_CONFIDENT[n] ? 1 : tr),
      screen: carry(cv, 15, n, SCREEN_V[p], SCREEN_V[n], A_REPLAY[n] ? st(0, 0.08) : tr),
      replay: carry(cv, 16, n, replayNow, replayNow, A_REPLAY[n] ? 1 : tr),
      q1: carry(cv, 17, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 18, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.b);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.c);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.h);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={SHELF_ART} tone={TONE} line={1.6} />
      <ObjectArt parts={SHELF_JARS} tone={TONE} line={0.8} />
      <ObjectArt parts={SIGN_ART} tone={TONE} line={1.4} />
      <Sign S={SCENE} />
      <ObjectArt parts={MOUNT_ART} tone={TONE} line={1} />
      <Camera S={SCENE} clock={clock} />
      <ObjectArt parts={SCREEN_ART} tone={TONE} line={1.2} />
      <Monitor S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <BasketBits S={SCENE} />
      <Trolley S={SCENE} k="tb" dir={1} />
      <Trolley S={SCENE} k="tc" dir={-1} />
      <Spill S={SCENE} />
      <List S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <InHand S={SCENE} DC={DC} />
      {on(Q1) ? <WordTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <WitnessTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── things that ride: drawn about their own centre, moved by a transform ─────

type Place = { readonly value: { x: number; y: number; o: number; r?: number; sy?: number } };
function Rider({ at, art, line }: { at: Place; art: readonly ObjPart[]; line?: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} line={line} />
    </Animated.View>
  );
}

function wristOf(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** A trolley, carried by its grip; his is the same drawing turned to face left. */
function Trolley({ S, k, dir }: { S: SharedValue<any>; k: 'tb' | 'tc'; dir: 1 | -1 }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value[k] + dir * GRIP_TO_MID }, { translateY: TROLLEY_Y }, { scaleX: dir }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={TROLLEY_ART} tone={TONE} line={0.8} />
    </Animated.View>
  );
}

/** What is in the baskets, behind the wires: her loaf and jar; his marmalade and the lid. */
function BasketBits({ S }: { S: SharedValue<any> }) {
  const jar = useDerivedValue(() => {
    const u = S.value.fall;
    const slide = S.value.tb - TB_GRIP;
    return {
      x: lerp(JAR_AT.x + slide, JAR_DOWN.x, u),
      y: lerp(JAR_AT.y, JAR_DOWN.y, u * u) - 8 * Math.sin(Math.PI * u),
      o: 1 - clamp01((u - 0.93) / 0.05),
      r: S.value.rock + 120 * u,
    };
  });
  const loafSt = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.tb - TB_GRIP }] }));
  const oj = useDerivedValue(() => ({ x: OJ_BASKET.x + S.value.tc - TC_GRIP, y: OJ_BASKET.y, o: 1 - clamp01(S.value.oj * 4) }));
  const lid = useDerivedValue(() => ({ x: LID_BASKET.x + S.value.tc - TC_GRIP, y: LID_BASKET.y, o: clamp01((S.value.lid - 2.8) * 5), sy: 0.45 }));
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, loafSt]} pointerEvents="none">
        <ObjectArt parts={LOAF_ART} tone={TONE} line={1} />
      </Animated.View>
      <Rider at={jar} art={JAR_ART} line={0.8} />
      <Rider at={oj} art={OJ_ART} line={0.8} />
      <Rider at={lid} art={LID_ART} line={0.7} />
    </>
  );
}

/** The jam on the floor: the pool spreads out from under the broken base. */
function Spill({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01((S.value.fall - 0.94) / 0.06);
    return {
      opacity: u,
      transform: [{ scaleX: 0.55 + 0.45 * u }],
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.spillAt, st]} pointerEvents="none">
      <ObjectArt parts={SPLAT_ART} tone={TONE} line={1} />
    </Animated.View>
  );
}

/** Her shopping list: clipped above her grip, then drifting down to the floor. */
function List({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue(() => {
    const u = S.value.list;
    const x0 = S.value.tb + LIST_ON.dx;
    const sway = 7 * Math.sin(u * Math.PI * 3) * (1 - u);
    return {
      x: lerp(x0, LIST_DOWN.x, u) + sway,
      y: lerp(LIST_ON.y, LIST_DOWN.y, u * u),
      o: 1,
      r: 30 * Math.sin(u * Math.PI * 3) * (1 - u) - 14 * u,
      sy: 1 - 0.3 * u,
    };
  });
  return <Rider at={at} art={LIST_ART} line={0.7} />;
}

/** The lid and the marmalade while they are in the cap's hand, in front of him. */
function InHand({ S, DC }: { S: SharedValue<any>; DC: SharedValue<Bundle> }) {
  const lid = useDerivedValue(() => {
    const u = S.value.lid;
    const h = wristOf(DC, 'wrR');
    if (u <= 1) {
      const down = { x: lerp(JAR_DOWN.x, LID_REST.x, u), y: lerp(JAR_DOWN.y - 4, LID_REST.y, u) - 5 * Math.sin(Math.PI * u) };
      return { ...down, o: clamp01((u - 0.02) * 20), r: 360 * u, sy: lerp(1, 0.45, u) };
    }
    if (u <= 2) {
      const v = u - 1;
      return { x: lerp(LID_REST.x, h.x, v), y: lerp(LID_REST.y, h.y + 2, v), o: 1, r: 0, sy: lerp(0.45, 1, v) };
    }
    const v = u - 2;
    return { x: lerp(h.x, LID_BASKET.x, v), y: lerp(h.y + 2, LID_BASKET.y, v), o: 1 - clamp01((v - 0.8) * 5), r: 0, sy: lerp(1, 0.45, v) };
  });
  const oj = useDerivedValue(() => {
    const u = S.value.oj;
    const h = wristOf(DC, 'wrR');
    if (u <= 1) return { x: lerp(OJ_BASKET.x + S.value.tc - TC_GRIP, h.x, u), y: lerp(OJ_BASKET.y, h.y - 3, u), o: clamp01(u * 4) };
    return { x: lerp(h.x, GAP.x, u - 1), y: lerp(h.y - 3, GAP.y, u - 1), o: 1 };
  });
  return (
    <>
      <Rider at={lid} art={LID_ART} line={0.7} />
      <Rider at={oj} art={OJ_ART} line={0.8} />
    </>
  );
}

// ── the aisle sign: its slats turn over, one after another ───────────────────

function Slat({ S, k }: { S: SharedValue<any>; k: number }) {
  // which pair of states the sign is between, and how far this slat has turned
  const turn = useDerivedValue(() => {
    const v = S.value.sign;
    const s = v < 1 ? 0 : 1;
    const f = v - s;
    const u = clamp01(f * 1.6 - k * 0.3);
    return { s, u };
  });
  const box = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.abs(1 - 2 * turn.value.u) }] }));
  const w0 = useAnimatedStyle(() => ({ opacity: (turn.value.s === 0 && turn.value.u < 0.5) ? 1 : 0 }));
  // while the first question is asked its three words are the targets' own (S14)
  const w1 = useAnimatedStyle(() => ({
    opacity: ((turn.value.s === 0 && turn.value.u >= 0.5) || (turn.value.s === 1 && turn.value.u < 0.5) ? 1 : 0) * (1 - S.value.q1),
  }));
  const w2 = useAnimatedStyle(() => ({ opacity: (turn.value.s === 1 && turn.value.u >= 0.5) ? 1 : 0 }));
  return (
    <Animated.View style={[styles.slat, { top: SLAT_TOP + k * SLAT_H }, box]} pointerEvents="none">
      <Animated.Text style={[styles.slatWord, w0]}>{SLAT_WORDS[0][k]}</Animated.Text>
      <Animated.Text style={[styles.slatWord, w1]}>{SLAT_WORDS[1][k]}</Animated.Text>
      <Animated.Text style={[styles.slatWord, w2]}>{SLAT_WORDS[2][k]}</Animated.Text>
    </Animated.View>
  );
}

function Sign({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.panel} pointerEvents="none">
        <Text style={styles.aisleNo}>4</Text>
      </View>
      <Slat S={S} k={0} />
      <Slat S={S} k={1} />
      <Slat S={S} k={2} />
    </>
  );
}

// ── the ceiling camera, turning on its joint, its light blinking ─────────────

function Camera({ S, clock }: { S: SharedValue<any>; clock: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: PIVOT.x }, { translateY: PIVOT.y }, { rotate: `${S.value.aim}deg` }],
  }));
  const rec = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(clock.value * 3.1)) }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={CAM_ART} tone={TONE} line={1} />
      <Animated.View style={[styles.recLight, rec]} />
    </Animated.View>
  );
}

// ── the monitor: dark, then the bump played back, slowly ─────────────────────

function Monitor({ S }: { S: SharedValue<any> }) {
  const lit = useAnimatedStyle(() => ({ opacity: S.value.screen }));
  const left = useAnimatedStyle(() => {
    const u = clamp01(S.value.replay / 0.7);
    return { transform: [{ translateX: lerp(FACE.left + 11, FACE.left + FACE.w / 2 - 8.8, u) }, { translateY: FACE.top + FACE.h - 9.5 }] };
  });
  const right = useAnimatedStyle(() => {
    const u = clamp01(S.value.replay / 0.7);
    return {
      transform: [
        { translateX: lerp(FACE.left + FACE.w - 11, FACE.left + FACE.w / 2 + 8.8, u) }, { translateY: FACE.top + FACE.h - 9.5 },
        { scaleX: -1 },
      ],
    };
  });
  const drop = useAnimatedStyle(() => {
    const u = clamp01((S.value.replay - 0.72) / 0.2);
    return {
      opacity: S.value.replay > 0.7 ? 1 : 0,
      transform: [{ translateX: FACE.left + FACE.w / 2 + 2 * u }, { translateY: FACE.top + FACE.h - 17 + 13 * u * u }],
    };
  });
  return (
    <Animated.View style={[styles.face, lit]} pointerEvents="none">
      <View style={styles.faceInner}>
        <View style={styles.scanFloor} />
        <Animated.View style={[styles.rider, left]}>
          <ObjectArt parts={MINI_ART} tone={TONE} line={0.5} />
        </Animated.View>
        <Animated.View style={[styles.rider, right]}>
          <ObjectArt parts={MINI_ART} tone={TONE} line={0.5} />
        </Animated.View>
        <Animated.View style={[styles.rider, drop]}>
          <View style={styles.miniJar} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three slats. SMASHED is the word that makes the bump faster in memory. */
const WORD_Q = [
  { id: 'hit', correct: false },
  { id: 'bumped', correct: false },
  { id: 'smashed', correct: true },
];
function WordTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {WORD_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={2}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLAT_L + 1, top: SLAT_TOP + k * SLAT_H + 1, width: SLAT_W - 2, height: SLAT_H - 2 }}
        >
          <View style={styles.slatIn}>
            <Text style={styles.slatWordIn}>{SLAT_WORDS[1][k]}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the camera, the jam on the floor and her shopping list. The camera recorded it once. */
const WITNESS_Q = [
  { id: 'camera', left: 22, top: 307, w: 46, h: 44, r: 6, correct: true },
  { id: 'jam', left: SPLAT.x - 23, top: 489, w: 46, h: 22, r: 8, correct: false },
  { id: 'list', left: LIST_DOWN.x - 13, top: 496, w: 26, h: 16, r: 4, correct: false },
];
function WitnessTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {WITNESS_Q.map((q) => (
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
  panel: {
    position: 'absolute', left: PANEL.left, top: PANEL.top, width: PANEL.w, height: PANEL.h,
    alignItems: 'center', justifyContent: 'center',
  },
  aisleNo: {
    fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 18, color: NATURAL.signRed.label, includeFontPadding: false,
  },
  slat: {
    position: 'absolute', left: SLAT_L, width: SLAT_W, height: SLAT_H, justifyContent: 'center',
  },
  slatWord: {
    position: 'absolute', left: 6, right: 4, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11,
    letterSpacing: 0.6, color: NATURAL.signBoard.label, includeFontPadding: false,
  },
  recLight: {
    position: 'absolute', left: 11, top: -4.2, width: 3.2, height: 3.2, borderRadius: 1.6,
    backgroundColor: EMBER,
  },
  face: {
    position: 'absolute', left: FACE.left, top: FACE.top, width: FACE.w, height: FACE.h, borderRadius: 1,
    backgroundColor: NATURAL.screenOn.base, overflow: 'hidden',
  },
  faceInner: { position: 'absolute', left: -FACE.left, top: -FACE.top, width: STAGE_W, height: STAGE_H },
  scanFloor: {
    position: 'absolute', left: FACE.left, top: FACE.top + FACE.h - 2.2, width: FACE.w, height: 2.2, borderRadius: 0.5,
    backgroundColor: NATURAL.screenOn.shade,
  },
  miniJar: {
    position: 'absolute', left: -2, top: -2.3, width: 4, height: 4.6, borderRadius: 1.1,
    backgroundColor: NATURAL.jam.base,
  },
  clear: { flexGrow: 1 },
  slatIn: { flexGrow: 1, justifyContent: 'center', paddingLeft: 5 },
  slatWordIn: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.6,
    color: NATURAL.signBoard.label, includeFontPadding: false,
  },
  spillAt: { transformOrigin: `${SPLAT.x}px ${SPLAT.y}px` },
});


export function Psych2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych2Scene} band={[306, 514]} camera={CAM} />;
}
