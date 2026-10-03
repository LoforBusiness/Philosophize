import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './growth4Script';
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
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, potWheel, wheelHead, potLow, potTop, clayLump, clayBall, waterBucket, tallStool, potRack,
  glazedVase, glazedBowl, glazedJug, glazedJar, sideTable, wareBoard, topKiln, studioWindow,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-4, "How to Learn From a Mistake" — A POTTERY STUDIO,
// A POTTER'S WHEEL, AND A BUCKET OF WATER.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The beginner (plain) throws his first pot with soaking hands and it slumps; the
// studio's potter (the newsboy cap) helps him look at why; the coach (the top hat)
// walks in and turns the mistake into the next try.
//
//   b0   at the wheel, he turns to the bucket on the stool behind him, scoops a handful
//        of water, turns back and slops it on the clay; the wheel spins, his hands cup
//        the clay and it rises into a tall pot; the wheel stops and he presents it.
//   b1   the pot's upper wall sags and folds over the side; he starts back, then
//        points down at the wheel.
//   b2   the potter presses a finger into the soft fallen wall, which dents, and holds
//        the wet finger up, dripping.
//   b3   the coach walks in from the left past the rack, tips his hat, and points at
//        the slumped pot; the beginner turns to him.
//   b4   Q1: the bucket on its stool, the wheel and the rack of pots — tap one.
//   b5   while the beginner talks, the potter lifts the slumped pot off the wheel,
//        carries it to his side table, takes a fresh ball of clay off the ware board
//        over it, comes back and sets the ball on the wheel head.
//   b6   the coach raises one finger, walks to the stool, takes the bucket by its
//        bail, carries it back and sets it on the bottom of the rack, then turns and
//        holds a flat hand out to the beginner.
//   b7   the beginner turns back to the wheel and throws again with dry hands; the
//        pot rises and stands, and he spreads both hands.
//   b8   the potter points along the rack of finished pots, then lays a hand on his
//        own chest.
//   b9   the coach points at the fallen pot on the side table, then at the standing
//        one, then lifts an open hand a step higher.
//   b10  Q2: the fallen pot, the standing pot and a jar on the rack — tap one.
//   b11  the quotation; all three at ease round the standing pot.
//
// COMPOSITION, in stage units: the rack of finished pots 20–90 × 404–500, its boards'
// tops at 420, 446 and 472, glazed pots on them and the right-hand end of the bottom
// board left free (72–88) for the bucket. The coach stands at 112 (98 when he sets the
// bucket on the rack). The tall stool 147–169, its seat at 474 (the hip), the bucket on
// it 150–166 with its bail's crown at 452. The beginner stands at 174 facing the wheel:
// its splash pan 176–216 × 468–482 on steel legs, the wheel head's top at 469 (just
// over his hip) centred on 196, where the pot stands — a lump 17 × 11, a pot 16 × 25.
// The potter stands across the wheel at 228 (stepping in to 216 to lift the fallen
// pot, and to 236 after). His side table 262–314 with its canvas top at 474, the ware
// board on the wall over it 258–314 at 446 with three balls of clay on it; the fallen
// pot is set down at 278. The kiln 330–384 × 458–500 under the studio window 329–385 ×
// 362–410. Everything a hand takes is within the rig's safe reach (~23 units from the
// shoulder at K 0.76) of where its figure stands when he takes it — which is why the
// coach steps in to the stool for the bucket, and the potter walks to his table. Band
// [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still (AP18,
// N21). The wheel turns only while a pot is thrown on it, and stops (AR5).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-4), except where the action
 * needs longer than the line and runs on after it — b0 (water, throw, present), b3
 * (the walk in), b5 (the pot cleared and a fresh ball set), b6 (the bucket carried
 * away) and b7 (the second throw).
 */
const LINES = [4.6, 3.01, 3.2, 5.64, 0, 7.2, 5.6, 3.8, 4.58, 5.41, 0, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, waiting.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_THROW = is('throw');
const A_SLUMP = is('slump');
const A_HELP = is('help');
const A_INFO = is('info');
const A_BLAME = is('blame');
const A_ONE = is('one');
const A_AGAIN = is('again');
const A_SHELF = is('shelf');
const A_GROW = is('grow');
const Q1 = BEATS.map((b) => (b.wet ? 1 : 0));
const Q2 = BEATS.map((b) => (b.learned ? 1 : 0));

// ── where each walks, and which way each faces, beat by beat ─────────────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// from wherever the last one ended. A turn is [fraction, facing]; it eases through a
// profile (cinematicKit.facing), from the facing on screen.
type Track = readonly (readonly number[])[];
/** The beginner never leaves the wheel; he turns to the bucket, and to the coach. */
const B_X = 174;
const B_TURN: Track[] = [
  [[0, 1], [0.02, -1], [0.22, 1]], [[0, 1]], [[0, 1]], [[0, 1], [0.3, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, 1], [0.52, -1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The potter: across the wheel at 228; he steps in to 216 to lift a pot, and his table is at 254. */
const C_START = 228;
const C_WHEEL = 216;
const C_TABLE = 254;
const C_AT = 236;
const C_LEGS: Track[] = [
  [[0, C_START]], [[0, C_START]], [[0, C_START]], [[0, C_START]], [[0, C_START]],
  [[0, C_WHEEL], [0.23, C_TABLE], [0.6, C_WHEEL], [0.9, C_AT]], [[0, C_AT]],
  [[0, C_AT]], [[0, C_AT]], [[0, C_AT]], [[0, C_AT]], [[0, C_AT]], [[0, C_AT]],
];
const C_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.18, 1], [0.56, -1], [0.86, 1], [1.04, -1]], [[0, -1]],
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
const T_OFF = -60;
const T_AT = 112;
const T_RACK = 98;
const T_STOOL = 138;
const T_LEGS: Track[] = [
  [[0, T_OFF]], [[0, T_OFF]], [[0, T_OFF]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0.27, T_STOOL], [0.53, T_RACK], [0.86, T_AT]],
  [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]], [[0, T_AT]],
];
const T_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1], [0.48, -1], [0.84, 1]],
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** What each is doing with the body: talking while he speaks, nodding along while he does not. */
const B_P = [TALK, TALK, NOD, NOD, NOD, TALK, NOD, TALK, NOD, NOD, NOD, WAIT, NOD];
const C_P = [NOD, NOD, EXPLAIN, NOD, NOD, NOD, NOD, NOD, EXPLAIN, NOD, NOD, WAIT, NOD];
const T_P = [NOD, NOD, NOD, EXPLAIN, NOD, NOD, EXPLAIN, NOD, NOD, EXPLAIN, NOD, WAIT, NOD];

// ── the studio ───────────────────────────────────────────────────────────────
/** The wheel, its head, and where a pot stands on it. */
const W = 196;
const HEAD_Y = 469;
/** The pot's lower wall is 13 × 11 and its top 14 × 10, hinged at the lower wall's top right corner. */
const LOW_H = 11;
const LOW_HALF = 6.2;
/** Both pots are drawn 1.2× their 13 × 21 drawing: a pot 16 wide and 25 tall on the wheel. */
const PS = 1.2;
/** The stool, the bucket on it and where it ends up on the rack, as the crown of its bail. */
const STOOL_X = 158;
const BUCKET_STOOL = { x: STOOL_X, y: 451.9 };
const BUCKET_RACK = { x: 80, y: 449.9 };
/** The water in the bucket, where a hand scoops it. */
const WATER = { x: STOOL_X, y: 461 };
/** The side table and the ware board over it. */
const POT1_TABLE = { x: 278, y: 474 };
const BALL = { w: 10, h: 9 };
const BALL_BOARD = { x: 266, y: 446 - BALL.h / 2 };
const BALL_HEAD = { x: W, y: HEAD_Y - BALL.h / 2 };
/** How far in front of a carrying hand the pot's foot sits, and below it. */
const POT_REACH = 9;
const POT_DROP = 6;
/** The fresh ball rides just under the fingers. */
const BALL_REACH = 2.5;
const BALL_DROP = 2.5;

const WINDOW_ART = studioWindow(357, 386, 56, 48);
const KILN_ART = topKiln(357, 479, 54, 42);
const RACK_ART = potRack(55, 452, 70, 96);
const RACK_POTS = [
  glazedVase(33, 411, 12, 18, 'celadon'),
  glazedJar(54, 412.5, 11, 15, 'tenmoku'),
  glazedBowl(76, 416, 16, 8, 'cobaltGlaze'),
  glazedJug(32, 438, 14, 16, 'oatmeal'),
  glazedVase(54, 437, 12, 18, 'cobaltGlaze'),
  glazedBowl(76, 442, 16, 8, 'celadon'),
  glazedJar(32, 464.5, 11, 15, 'celadon'),
  glazedBowl(52, 468, 16, 8, 'tenmoku'),
];
/** The celadon jar on the bottom board that the second question asks about. */
const SHELF_JAR = { x: 32, top: 457 };
const TABLE_ART = sideTable(288, 487, 52, 26);
const BOARD_ART = wareBoard(286, 450.5, 56, 9);
const BOARD_BALLS = [clayBall(280, BALL_BOARD.y, BALL.w, BALL.h), clayBall(294, BALL_BOARD.y, BALL.w, BALL.h)];
const STOOL_ART = tallStool(STOOL_X, 487, 22, 26);
const WHEEL_ART = potWheel(W, 484, 40, 32);
const HEAD_ART = wheelHead(W, 470.4, 26, 4);
// The things that move are drawn about the point they stand on or are held by.
const LUMP_ART = clayLump(0, -5.5, 17, 11);
const LOW_ART = potLow(0, -LOW_H / 2, 13, 11);
const TOP_ART = potTop(-LOW_HALF, -5, 14, 10);
const BALL_ART = clayBall(0, 0, BALL.w, BALL.h);
const BUCKET_ART = waterBucket(0, 10.6, 16, 23);

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
/**
 * A hand holding something against the body, in the figure's own frame (pelvis-local
 * units, +x forward, -y up), so the thing rides WITH him as he walks and turns (AR6, AR7.2).
 */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}

/**
 * Where a figure stands at time `b` of a beat, taking its legs in turn. He starts from
 * WHERE HE IS ON SCREEN (`src`, out of the carry), so a tap mid-walk cannot put him
 * anywhere in one frame (group L). A leg starts at its time or when the leg before it
 * has finished, whichever is later.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  let dur0 = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (b < start) break;
    x0 = from;
    x1 = to;
    dur0 = dur;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, dur: dur0 };
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

/**
 * A pot on the wheel, as the scene draws it: growth `g` (0 a lump, 1 a tall pot) and
 * slump `f` (0 standing, 1 its top folded over the side, its lower wall sagged).
 */
function potShape(g: number, f: number) {
  'worklet';
  return {
    sxG: lerp(1.3, 1, g), syG: lerp(0.35, 1, g),
    sxS: lerp(1, 1.2, f), syS: lerp(1, 0.75, f),
    // a wall hinged at its outer corner hangs down outside the pot at about 160°
    fold: 160 * f,
  };
}

const CAM = followMoves(BEATS.map(() => B_X), BEATS.map(kindOf), seedOf('personal-growth'));

export default function Growth4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
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

    // ── the things whose state the hands follow ─────────────────────────────
    // the first pot: 0 a lump · 1 thrown tall (b0); slump 0 → 1 (b1)
    const g1Now = A_THROW[n] ? st(0.48, 0.84) : 1;
    const g1 = carry(cv, 5, n, g1Now, g1Now, tr);
    const f1Now = A_SLUMP[n] ? st(0.06, 0.42) : n > 1 ? 1 : 0;
    const f1 = carry(cv, 6, n, f1Now, f1Now, tr);
    // where it is: 0 on the wheel · 1 in the potter's hands · 2 on his side table (b5)
    const pot1Now = A_BLAME[n] ? st(0.15, 0.18) + st(0.41, 0.44) : n > 5 ? 2 : 0;
    const pot1T = carry(cv, 7, n, pot1Now, pot1Now, tr);
    // the fresh ball: 0 on the ware board · 1 in his hand · 2 on the wheel head (b5)
    const ballNow = A_BLAME[n] ? st(0.51, 0.54) + st(0.78, 0.81) : n > 5 ? 2 : 0;
    const ballT = carry(cv, 8, n, ballNow, ballNow, tr);
    // the second pot: thrown up out of the ball (b7)
    const g2Now = A_AGAIN[n] ? st(0.12, 0.42) : n > 7 ? 1 : 0;
    const g2 = carry(cv, 9, n, g2Now, g2Now, tr);
    // the bucket: 0 on the stool · 1 in the coach's hand · 2 on the rack (b6)
    const buckNow = A_ONE[n] ? st(0.44, 0.48) + st(0.78, 0.82) : n > 6 ? 2 : 0;
    const buckT = carry(cv, 10, n, buckNow, buckNow, tr);
    // the wheel turns only while a pot is thrown on it (AR5), then stops
    const spinNow = A_THROW[n] ? st(0.36, 0.42) * (1 - st(0.86, 0.96))
      : A_AGAIN[n] ? st(0.04, 0.1) * (1 - st(0.46, 0.56)) : 0;
    const spin = carry(cv, 11, n, spinNow, spinNow, tr);
    // the potter's finger in the fallen wall (b2), and the dent it leaves
    const dentNow = A_HELP[n] ? st(0.14, 0.2) : n > 2 ? 1 : 0;
    const dent = carry(cv, 12, n, dentNow, dentNow, tr);

    // ── the beginner, at the wheel ──────────────────────────────────────────
    const xB = B_X;
    const dB = carry(cv, 0, n, 0, faceOf(carrySource(cv, 0, n, 1), B_TURN[n], b, L), 1);
    let sb = hLive(B_P[n], t, b);
    // b0: a hand into the bucket, the water slopped on the clay, then both hands round
    // it as it rises, and his hand held out to it
    if (A_THROW[n]) {
      sb = hand(sb, xB, dB, 1, WATER.x, WATER.y, st(0.06, 0.13) * (1 - st(0.18, 0.24)));
      sb = hand(sb, xB, dB, 1, W - 2, 451, st(0.26, 0.32) * (1 - st(0.38, 0.42)));
      const cup = st(0.4, 0.47) * (1 - st(0.84, 0.9));
      sb = hand(sb, xB, dB, 1, W - 8, lerp(464, 456, g1), cup);
      sb = hand(sb, xB, dB, -1, W, lerp(459, 446, g1), cup);
      sb = hand(sb, xB, dB, 1, W - 6, 452, st(0.88, 0.96));
    }
    // b1: he starts back as it falls, then points down at the wheel
    if (A_SLUMP[n]) {
      const jolt = bp(0.08, 0.16, 0.42);
      sb = { ...sb, tilt: sb.tilt - 0.09 * jolt, neck: sb.neck - 0.12 * jolt };
      sb = hand(sb, xB, dB, 1, W, 490, st(0.4, 0.48) * (1 - st(0.86, 0.96)));
    }
    // b5: "I'd have spotted that myself": a hand to his own chest
    if (A_BLAME[n]) sb = holdAt(sb, 1, 5, -17, st(0.24, 0.3) * (1 - st(0.46, 0.54)));
    // b7: the second throw with dry hands, then he turns to the coach and spreads both
    // hands to him (forward of him, where the pot is not)
    if (A_AGAIN[n]) {
      const cup = st(0.08, 0.14) * (1 - st(0.44, 0.5));
      sb = hand(sb, xB, dB, 1, W - 8, lerp(464, 456, g2), cup);
      sb = hand(sb, xB, dB, -1, W, lerp(459, 446, g2), cup);
      const spread = st(0.58, 0.68);
      sb = holdAt(sb, 1, 26, -30, spread);
      sb = holdAt(sb, -1, 22, -22, spread);
    }
    if (n === 8) {
      // the spread hands come down to rest as the others talk
      const down = 1 - st(0, 0.2);
      sb = holdAt(sb, 1, 26, -30, down);
      sb = holdAt(sb, -1, 22, -22, down);
    }
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t));
    const figB = keepHeld(heldB, mixStance(prevB, sb, tr));

    // ── the potter ──────────────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 1, n, C_AT), C_LEGS[n], b, L);
    const xC = carry(cv, 1, n, wc.x, wc.x, 1);
    const dC = carry(cv, 2, n, 0, faceOf(carrySource(cv, 2, n, -1), C_TURN[n], b, L), 1);
    let sc = bodyOf(wc, C_P, n, t, b);
    // the fallen collar of the first pot, where a finger goes into it
    const sh1 = potShape(1, f1);
    const hinge = { x: W + LOW_HALF * sh1.sxS * PS, y: HEAD_Y - LOW_H * sh1.syS * PS };
    // b2: a finger into the soft wall, then held up wet
    if (A_HELP[n]) {
      sc = hand(sc, xC, dC, 1, hinge.x + 8, hinge.y + 1, st(0.06, 0.18) * (1 - st(0.3, 0.36)));
      sc = hand(sc, xC, dC, 1, xC - 9, 437, st(0.36, 0.44) * (1 - st(0.86, 0.96)));
    }
    // b5: the fallen pot lifted off, carried to the table and set down; a fresh ball
    // taken off the ware board, carried back and set on the wheel head
    if (A_BLAME[n]) {
      // stepped in to the wheel (arrives at 0.12): both hands round the fallen pot
      sc = hand(sc, xC, dC, 1, W + POT_REACH, HEAD_Y - POT_DROP, st(0.1, 0.15) * (1 - st(0.17, 0.21)));
      sc = hand(sc, xC, dC, -1, W + 2, HEAD_Y - 10, st(0.11, 0.16) * (1 - st(0.17, 0.21)));
      // carried at his chest, in front of him through the turn (0.18) and the walk (0.23–0.35)
      const carryW = st(0.17, 0.21) * (1 - st(0.35, 0.41));
      sc = holdAt(sc, 1, 11, -11, carryW);
      sc = holdAt(sc, -1, 13, -17, carryW);
      sc = hand(sc, xC, dC, 1, POT1_TABLE.x - POT_REACH, POT1_TABLE.y - POT_DROP, st(0.35, 0.41) * (1 - st(0.44, 0.48)));
      sc = hand(sc, xC, dC, -1, POT1_TABLE.x, POT1_TABLE.y - 11, st(0.35, 0.41) * (1 - st(0.43, 0.47)));
      // the ball off the board above the table, held at his chest through the turn (0.56)
      // and the walk back (0.6–0.72), and set on the wheel head
      sc = hand(sc, xC, dC, 1, BALL_BOARD.x - BALL_REACH, BALL_BOARD.y - BALL_DROP, st(0.46, 0.51) * (1 - st(0.53, 0.57)));
      sc = holdAt(sc, 1, 11, -14, st(0.53, 0.57) * (1 - st(0.71, 0.75)));
      sc = hand(sc, xC, dC, 1, BALL_HEAD.x + BALL_REACH, BALL_HEAD.y - BALL_DROP, st(0.71, 0.77) * (1 - st(0.82, 0.87)));
    }
    // b8: a hand along the rack of finished pots, then on his own chest
    if (A_SHELF[n]) {
      const along = st(0.14, 0.5);
      sc = hand(sc, xC, dC, 1, lerp(80, 18, along), 430, st(0.06, 0.14) * (1 - st(0.56, 0.64)));
      sc = holdAt(sc, 1, 4, -17, st(0.66, 0.74) * (1 - st(0.92, 1)));
    }
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the coach ───────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 3, n, T_OFF), T_LEGS[n], b, L);
    const xT = carry(cv, 3, n, wt.x, wt.x, 1);
    const dT = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, 1), T_TURN[n], b, L), 1);
    let stt = bodyOf(wt, T_P, n, t, b);
    if (A_INFO[n]) {
      // the hat tipped once he has arrived, then a hand at the fallen pot
      const after = wt.dur / L;
      stt = hand(stt, xT, dT, -1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.18));
      stt = hand(stt, xT, dT, 1, hinge.x, hinge.y, st(0.76, 0.84) * (1 - st(0.96, 1)));
    }
    // b6: one finger up; the bucket taken by its bail, carried off and set on the rack;
    // and a flat hand held out to the beginner
    if (A_ONE[n]) {
      stt = hand(stt, xT, dT, 1, xT + 10 * dT, 432, st(0.02, 0.08) * (1 - st(0.2, 0.27)));
      stt = hand(stt, xT, dT, 1, BUCKET_STOOL.x, BUCKET_STOOL.y, st(0.38, 0.44) * (1 - st(0.46, 0.5)));
      stt = holdAt(stt, 1, 10, -6, st(0.46, 0.5) * (1 - st(0.7, 0.76)));
      stt = hand(stt, xT, dT, 1, BUCKET_RACK.x, BUCKET_RACK.y, st(0.7, 0.76) * (1 - st(0.8, 0.86)));
      stt = hand(stt, xT, dT, -1, xT + 18 * dT, 452, st(0.88, 0.95));
    }
    // b9: the fallen pot on the table, the standing pot, and an open hand a step higher
    if (A_GROW[n]) {
      stt = hand(stt, xT, dT, 1, POT1_TABLE.x, POT1_TABLE.y - 8, st(0.04, 0.1) * (1 - st(0.26, 0.32)));
      stt = hand(stt, xT, dT, 1, W, HEAD_Y - 12, st(0.3, 0.36) * (1 - st(0.52, 0.58)));
      stt = hand(stt, xT, dT, 1, xT + 14 * dT, lerp(462, 442, st(0.64, 0.9)), st(0.58, 0.64) * (1 - st(0.94, 1)));
    }
    const prevT = carryFrom(heldT, n, hHold(T_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const beg = pose(figB, xB, GROUND, K, dB, 1);
    const cap = pose(figC, xC, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wC = wristOf(cap, 'wrR');
    const wT = wristOf(th, 'wrR');

    // the first pot: on the wheel, in the potter's hands, on the table
    const potHeld = { x: wC.x + POT_REACH * dC, y: wC.y + POT_DROP };
    const pot1At = pot1T <= 1
      ? { x: lerp(W, potHeld.x, pot1T), y: lerp(HEAD_Y, potHeld.y, pot1T) }
      : { x: lerp(potHeld.x, POT1_TABLE.x, pot1T - 1), y: lerp(potHeld.y, POT1_TABLE.y, pot1T - 1) };
    const s1 = potShape(g1, f1);
    // the ball: on the board, in his hand, on the head
    const ballHeld = { x: wC.x + BALL_REACH * dC, y: wC.y + BALL_DROP };
    const ballAt = ballT <= 1
      ? { x: lerp(BALL_BOARD.x, ballHeld.x, ballT), y: lerp(BALL_BOARD.y, ballHeld.y, ballT) }
      : { x: lerp(ballHeld.x, BALL_HEAD.x, ballT - 1), y: lerp(ballHeld.y, BALL_HEAD.y, ballT - 1) };
    const s2 = potShape(g2, 0);
    // the bucket: on the stool, in the coach's hand, on the rack
    const buckAt = buckT <= 1
      ? { x: lerp(BUCKET_STOOL.x, wT.x, buckT), y: lerp(BUCKET_STOOL.y, wT.y, buckT) }
      : { x: lerp(wT.x, BUCKET_RACK.x, buckT - 1), y: lerp(wT.y, BUCKET_RACK.y, buckT - 1) };
    // water dripping: off his hand onto the clay (b0), off the potter's finger (b2)
    const dripB = A_THROW[n];
    const dripC = A_HELP[n];
    const fromX = dripB ? W - 1 : wC.x - 2;
    const fromY = dripB ? 455 : wC.y + 2;
    const fall = dripB ? 10 : 14;
    const dropU = [0, 1, 2].map((k) => (dripB ? stageLin(b, L, 0.3 + k * 0.035, 0.38 + k * 0.035)
      : dripC ? stageLin(b, L, 0.46 + k * 0.09, 0.56 + k * 0.09) : 0));

    return {
      beg, cap, th, t,
      spin,
      lump1: { x: W, y: HEAD_Y, o: 1 - clamp01(g1 * 2.5) },
      pot1: {
        x: pot1At.x, y: pot1At.y, o: clamp01(g1 * 4), ...s1, dent,
        spin: spin * (1 - clamp01(pot1T)),
      },
      ball: { x: ballAt.x, y: ballAt.y, o: 1 - clamp01(g2 * 2.5) },
      pot2: { x: W, y: HEAD_Y, o: clamp01(g2 * 4), ...s2, dent: 0, spin },
      bucket: { x: buckAt.x, y: buckAt.y, o: 1 },
      drops: dropU.map((u, k) => ({ x: fromX + (k - 1) * 1.6, y: fromY + fall * u * u, o: Math.sin(Math.PI * u) })),
      q1: carry(cv, 13, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 14, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.beg);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ObjectArt parts={KILN_ART} tone={TONE} />
      <ObjectArt parts={RACK_ART} tone={TONE} />
      {RACK_POTS.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} />)}
      <ObjectArt parts={BOARD_ART} tone={TONE} />
      {BOARD_BALLS.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} />)}
      <ObjectArt parts={TABLE_ART} tone={TONE} />
      <ObjectArt parts={STOOL_ART} tone={TONE} />
      <ObjectArt parts={WHEEL_ART} tone={TONE} />
      <ObjectArt parts={HEAD_ART} tone={TONE} />
      <Spin S={SCENE} />
      <Lump S={SCENE} />
      <Pot S={SCENE} k="pot1" />
      <Ball S={SCENE} />
      <Pot S={SCENE} k="pot2" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: plain */}
      <Stickman D={DB} k={K} role="lead" wear={[]} />
      <Bucket S={SCENE} />
      <Drops S={SCENE} />
      {on(Q1) ? <WetTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <LearnedTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it stands on or is held by ─────────

type At = { x: number; y: number; o: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof clayBall> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}
function Lump({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.lump1);
  return <Rider at={at} art={LUMP_ART} />;
}
function Ball({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.ball);
  return <Rider at={at} art={BALL_ART} />;
}
function Bucket({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.bucket);
  return <Rider at={at} art={BUCKET_ART} />;
}

// ── a pot on the wheel: its lower wall, and its top hinged on it ─────────────
function Pot({ S, k }: { S: SharedValue<any>; k: 'pot1' | 'pot2' }) {
  const outer = useAnimatedStyle(() => {
    const v = S.value[k];
    return {
      opacity: v.o,
      transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: v.sxG * PS }, { scaleY: v.syG * PS }],
    };
  });
  const low = useAnimatedStyle(() => {
    const v = S.value[k];
    return { transform: [{ scaleX: v.sxS }, { scaleY: v.syS }] };
  });
  const top = useAnimatedStyle(() => {
    const v = S.value[k];
    return {
      transform: [
        { translateX: LOW_HALF * v.sxS }, { translateY: -LOW_H * v.syS }, { rotate: `${v.fold}deg` },
      ],
    };
  });
  // the throwing rings sliding round as the wheel turns: a streak of light across the wall
  const streak = useAnimatedStyle(() => {
    const v = S.value[k];
    const f = (S.value.t * 1.7) % 1;
    return { opacity: v.spin * Math.sin(Math.PI * f) * 0.85, transform: [{ translateX: (f - 0.5) * 10 }] };
  });
  const dentSt = useAnimatedStyle(() => ({ opacity: S.value[k].dent }));
  return (
    <Animated.View style={[styles.rider, outer]} pointerEvents="none">
      <Animated.View style={[styles.rider, low]}>
        <ObjectArt parts={LOW_ART} tone={TONE} />
        <Animated.View style={[styles.streak, streak]} />
      </Animated.View>
      <Animated.View style={[styles.rider, top]}>
        <ObjectArt parts={TOP_ART} tone={TONE} />
        <Animated.View style={[styles.dent, dentSt]} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the wheel head turning: flecks of slip carried round its rim ─────────────
const FLECKS = [0, 1, 2];
function Spin({ S }: { S: SharedValue<any> }) {
  return <>{FLECKS.map((k) => <Fleck key={k} k={k} S={S} />)}</>;
}
function Fleck({ k, S }: { k: number; S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 1.7 + k / FLECKS.length) % 1;
    return { opacity: S.value.spin * Math.sin(Math.PI * f), transform: [{ translateX: W + (f - 0.5) * 22 }] };
  });
  return <Animated.View style={[styles.fleck, st]} pointerEvents="none" />;
}

// ── drops of water ──────────────────────────────────────────────────────────
function Drops({ S }: { S: SharedValue<any> }) {
  return <>{FLECKS.map((k) => <Drop key={k} k={k} S={S} />)}</>;
}
function Drop({ k, S }: { k: number; S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.drops[k];
    return { opacity: d.o, transform: [{ translateX: d.x }, { translateY: d.y }] };
  });
  return <Animated.View style={[styles.drop, st]} pointerEvents="none" />;
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * The two questions are tapped ON THE STAGE (AP6), and each choice carries its name on
 * a small plate at its foot, inside its target (AN1). No two live targets touch (AN4).
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean };
/** Q1: the bucket, the wheel and the rack of pots. The bucket's water is what did it. */
const WET_Q: Q[] = [
  { id: 'bucket', label: 'BUCKET', pw: 49, left: 128, top: 446, w: 50, h: 54, correct: true },
  { id: 'wheel', label: 'WHEEL', pw: 44, left: 180, top: 466, w: 44, h: 34, correct: false },
  { id: 'shelf', label: 'SHELF', pw: 40, left: 20, top: 404, w: 70, h: 96, correct: false },
];
/** Q2: the fallen pot, the standing pot and a vase on the rack. The standing pot is the one. */
const LEARNED_Q: Q[] = [
  { id: 'first', label: 'FIRST POT', pw: 58, left: 248, top: 450, w: 60, h: 46, correct: false },
  { id: 'new', label: 'NEW POT', pw: 54, left: 166, top: 440, w: 60, h: 54, correct: true },
  { id: 'shelf', label: 'SHELF POT', pw: 60, left: SHELF_JAR.x - 31, top: SHELF_JAR.top - 3, w: 62, h: 46, correct: false },
];
function WetTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={WET_Q} k="q1" />;
}
function LearnedTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={LEARNED_Q} k="q2" />;
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
  streak: {
    position: 'absolute', left: -0.6, top: -9.5, width: 1.2, height: 7.5, borderRadius: 0.6, backgroundColor: PAPER_LIT,
  },
  dent: {
    position: 'absolute', left: -2.6, top: -6, width: 3.4, height: 2.2, borderRadius: 1.1,
    backgroundColor: NATURAL.wetClay.shade,
  },
  fleck: {
    position: 'absolute', left: -0.8, top: HEAD_Y + 1, width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: INK,
  },
  drop: {
    position: 'absolute', left: -0.8, top: -1, width: 1.6, height: 2.2, borderRadius: 0.8,
    backgroundColor: NATURAL.water.base,
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 1, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 3,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
});

export function Growth4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth4Scene} band={[306, 514]} camera={CAM} />;
}
