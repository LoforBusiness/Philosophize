import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, type SharedValue } from 'react-native-reanimated';
import LessonPicture from './LessonPicture';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './biz3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
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
import {
  NATURAL, tint, crate, priceTag, TAG_FACE, fairGazebo, fairCloth, candleJar, emptyJar, waxBlock, ribbonSpool,
  ribbonLength, ribbonBow, toteBag, tentSlate, pennant, TENT_FACE, GAZEBO_VALANCE, type NaturalKey,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-3, "How Do You Set a Price?" — A CRAFT FAIR STALL.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The candle maker (the cap, kind to a fault)
// sells his candles for fifty pence; the customer (the bun) would happily pay far
// more; the adviser (the top hat) shows where a price comes from.
//
//   b0   the maker sets a cranberry candle at the front of his stall, turns to his tag,
//        takes the chalk off its ledge and chalks 50p on it, and turns back; the
//        customer walks up.
//   b1   she picks the candle up, sniffs it — its scent rises — and holds it to her chest.
//   b2   the adviser walks in, tips his hat, opens a hand to the maker on "an hour of
//        work", then passes it over the wax and the jars; the maker turns to him.
//   b3   the adviser lifts the block of wax and an empty jar off the stall, one in each
//        hand, holds them up in front of him, and sets them back down.
//   b4   Q1: the empty jars, her shopping bag and the bunting — tap one.
//   b5   the maker covers his mouth with his hand, then turns and opens it to her.
//   b6   the adviser points to the candle in her hands, then to her face.
//   b7   she pulls a length of ribbon off the spool at the table's end, holds it up,
//        and brings it in close to keep.
//   b8   the adviser holds one hand low and one high, and brings them together.
//   b9   Q2: three chalk tags hang on the cloth, 50p, £4 and £20 — tap one.
//   b10  the maker steps along, turns to the tag, wipes it, chalks £4, turns back and
//        ties her ribbon on the candle she holds out to him. (A person turns to what
//        he works at, and every hand works IN FRONT of the body — LESSON_RULES AR4.)
//   b11  at ease under the quotation; b12 the summary.
//
// COMPOSITION, in stage units. A navy pop-up gazebo, 94–302 × 318–500, its legs at 100
// and 296, its valance 344–358 printed HANDMADE CANDLES, and bunting hung under it
// from 102 to 294, 360–374. The trestle under its cream cloth runs 100–296 × 477–501,
// its top at the people's HIP (AP10). On it, left to right: the block of soy wax 101–115,
// the two empty jars 115–140, a wooden riser crate 150–192 with three candles on it,
// two more candles at 206 and 219, the chalk tent tag 241–269 (the chalk on its foot,
// in his reach), the cranberry candle for sale at 273–285 and the spool of ribbon 284–296, its
// tail hanging over the table's end. The adviser stands at the table's left end at
// 98, the maker behind it at 238 (262 when he works the tag), the customer at
// its right end at 306, her canvas tote on the ground behind her at 321–343. The next
// stall's sage gazebo shows its leg at 380. Every hand meets what it holds inside the
// rig's safe reach (~23 units from the shoulder at K 0.76). Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners nod along with their hands still (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, business-foundations-3). 0 for a beat with no voice.
 */
const LINES = [3.84, 4.5, 6.95, 6.16, 0, 4.21, 5.94, 2.63, 5.86, 0, 4.41, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CHEAP = is('cheap');
const A_SNIFF = is('sniff');
const A_ARRIVE = is('arrive');
const A_COST = is('cost');
const A_DEAR = is('dear');
const A_VALUE = is('value');
const A_RIBBON = is('ribbon');
const A_BETWEEN = is('between');
const A_TAG = is('tag');
const Q1 = BEATS.map((b) => (b.costs ? 1 : 0));
const Q2 = BEATS.map((b) => (b.pick ? 1 : 0));
const RIBBON_N = A_RIBBON.indexOf(1);
const TAG_N = A_TAG.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; a turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const CP_LEGS: Track[] = [
  [[0, 262]], [[0, 262]], [[0.02, 238]], [[0, 238]], [[0, 238]], [[0, 238]], [[0, 238]],
  [[0, 238]], [[0, 238]], [[0, 238]], [[0.01, 262]], [[0, 262]], [[0, 262]],
];
// The maker TURNS to his chalk tag to write on it (AR4) — it stands on his left, and
// the customer is on his right — and turns back to her when he has done.
const CP_TURN: Track[] = [
  [[0, 1], [0.3, -1], [0.84, 1]], [[0, 1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.55, 1]], [[0, 1]],
  [[0, 1]], [[0.04, -1]], [[0, -1]], [[0, 1], [0.24, -1], [0.72, 1]], [[0, 1]], [[0, 1]],
];
/** The customer walks up from off the stage, right, on b0. */
const PL_LEGS: Track[] = BEATS.map(() => [[0, 306]]);
const PL_TURN: Track[] = BEATS.map(() => [[0, -1]]);
/** The adviser is off the stage, left, until he walks in on b2. */
const TH_LEGS: Track[] = BEATS.map((b) => [[0, b.th ? 98 : -30]]);
const TH_TURN: Track[] = BEATS.map(() => [[0, 1]]);
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const CP_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, TALK, NOD, LISTEN];
const PL_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the stall ────────────────────────────────────────────────────────────────
const TOP = 477;                                      // the table's top, at their hip
const GAZ = { x: 198, y: 409, w: 208, h: 182 };
const VALANCE = { left: 108, top: GAZ.y - GAZ.h / 2 + (GAZ.h * GAZEBO_VALANCE.y) / 100 - (GAZ.h * GAZEBO_VALANCE.h) / 200, w: 180, h: (GAZ.h * GAZEBO_VALANCE.h) / 100 };
/** The bunting: a string sagging from leg to leg, pennants hung along it. */
const BUNT = { x0: 102, x1: 294, y: 360, sag: 6 };
const PENNANTS = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => {
  const x = 110 + k * 22;
  const y = BUNT.y + BUNT.sag * (1 - Math.abs(x - 198) / 96);
  return { x, y, key: (['pennantRed', 'pennantMustard', 'pennantTeal'] as NaturalKey[])[k % 3] };
});
const WAX_AT = { x: 108, y: 472.5 };
const JAR_AT = { x: 121, y: 470.5 };
const JAR2_AT = { x: 134, y: 470.5 };
const CANDLE_W = 11;
const CANDLE_H = 12;
/** The candle for sale, at the front of the stall (its right end). */
const FRONT = { x: 279, y: 470.5 };
/** Where a hand takes a jar: a little below its rim. */
const GRIP = 4.5;
const TAG = { x: 255, y: 466, w: 28, h: 22 };
const SLATE = {
  left: TAG.x - TAG.w / 2 + TAG.w * (TENT_FACE.x - TENT_FACE.w / 2),
  top: TAG.y - TAG.h / 2 + TAG.h * (TENT_FACE.y - TENT_FACE.h / 2),
  w: TAG.w * TENT_FACE.w,
  h: TAG.h * TENT_FACE.h,
};
/** The chalk, lying on the tag's foot — its chalk ledge — within his reach. */
const CHALK_AT = { x: 257, y: 475.2 };
const SPOOL = { x: 290, y: 473, w: 12, h: 16 };
/** The spool's tail, hanging over the table's edge, where her hand takes the ribbon. */
const TAIL = { x: 295, y: 474 };
/** Her chest, where she holds the candle from b1 on. */
const HOLD = { x: 299, y: 459 };
const BAG = { x: 332, y: 486, w: 22, h: 29 };

const GAZEBO_ART = fairGazebo(GAZ.x, GAZ.y, GAZ.w, GAZ.h);
const NEXT_ART = fairGazebo(478, GAZ.y, GAZ.w, GAZ.h, 'gazeboSage');
const CLOTH_ART = fairCloth(198, 489, 196, 24);
const WAX_STILL = waxBlock(0, 0, 14, 8);
const JAR_ART = emptyJar(0, 0, CANDLE_W, CANDLE_H);
const RISER_ART = tint(crate(171, 470, 42, 14), 'wood');
const SHELF_CANDLES = [
  candleJar(157, 457, CANDLE_W, CANDLE_H, 'waxLavender'),
  candleJar(171, 457, CANDLE_W, CANDLE_H, 'waxRose'),
  candleJar(185, 457, CANDLE_W, CANDLE_H, 'waxSage'),
  candleJar(206, 471, CANDLE_W, CANDLE_H, 'waxRose'),
  candleJar(219, 471, CANDLE_W, CANDLE_H, 'waxLavender'),
];
const TAG_ART = tentSlate(TAG.x, TAG.y, TAG.w, TAG.h);
/** How far the price's reveal mask reaches past the slate, above and below. */
const MASK_PAD = 3;
const SPOOL_ART = ribbonSpool(SPOOL.x, SPOOL.y, SPOOL.w, SPOOL.h);
const BAG_ART = toteBag(BAG.x, BAG.y, BAG.w, BAG.h);
// The things that move are drawn about the point they are held by.
const CANDLE_ART = candleJar(0, 0, 12, 13, 'waxCranberry');
const BOW_ART = ribbonBow(0, 1, 11, 11);
const LENGTH_ART = ribbonLength(0, 9, 18, 18);
const PENNANT_ART = PENNANTS.map((p) => pennant(p.x, p.y + 5.6, 12, 12, p.key));

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
  return { x, x0, x1, u: ease01(u), walking, end: free };
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

const CAM = followMoves(CP_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('business'));

export default function Biz3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldP = useHeld();
  const heldT = useHeld();
  const cv = useCarry(18);
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

    // ── the candle maker, behind his table ──────────────────────────────────
    const wc = legsOf(carrySource(cv, 0, n, CP_LEGS[0][0][1]), CP_LEGS[n], b, L);
    const xC = carry(cv, 0, n, wc.x, wc.x, 1);
    const dC = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b);
    // b0: the candle in his right hand set at the front; the chalk off the tag's top
    // edge into his left, 50p chalked on the slate, and the chalk put back
    if (A_CHEAP[n]) {
      const set = st(0.06, 0.22);
      sc = hand(sc, xC, dC, 1, lerp(xC + 7, FRONT.x, set), lerp(452, FRONT.y - GRIP, set), 1 - st(0.26, 0.34));
      // turned to the tag: the chalk off its top edge; the price written as a PATH that
      // travels along the slate (AR5), not a stroke on the clock; the chalk back
      // The hand goes for the chalk AS he turns, held in front of his body (xC + dC·lx),
      // so it travels one way to it rather than swinging round and coming back.
      // he looks over the price before he puts the chalk back: a held beat, so reach,
      // write and put back read as three movements and not one hand sawing (AR5)
      const write = st(0.5, 0.66);
      const grab = { x: xC + dC * (xC - CHALK_AT.x), y: CHALK_AT.y };
      const k = via([grab, { x: SLATE.left + 5, y: SLATE.top + SLATE.h / 2 + 1 }, { x: SLATE.left + SLATE.w - 5, y: SLATE.top + SLATE.h / 2 - 1 }, CHALK_AT],
        [st(0.46, 0.5), write, st(0.86, 0.9)]);
      sc = hand(sc, xC, dC, -1, k.x, k.y, st(0.32, 0.42) * (1 - st(0.9, 0.96)));
    }
    // b5: a hand over his mouth on "Oh dear"; then, turned to her, a hand opened to her
    if (A_DEAR[n]) {
      sc = hand(sc, xC, dC, 1, xC + 6 * dC, GROUND - 60, bp(0.04, 0.12, 0.44));
      sc = hand(sc, xC, dC, 1, HOLD.x - 8, 452, bp(0.7, 0.78, 0.98));
    }
    // b10: the old price wiped off, the chalk from the tag's edge, £4 chalked, the chalk
    // back; then his right hand ties her ribbon on the candle she holds out
    if (A_TAG[n]) {
      // turned to the tag (AR4): the old price wiped off — AP18: one wipe across and
      // back, then the hand rests (AR5)
      // (his right hand wipes, then ties; his left takes the chalk from the ledge)
      const wu = clamp01((b / L - 0.34) / 0.08);
      const wipe = Math.sin(wu * Math.PI * 2) * 5;
      sc = hand(sc, xC, dC, 1, TAG.x + wipe, SLATE.top + SLATE.h / 2, bp(0.3, 0.34, 0.44));
      // the new price written as a path that travels along the slate, the chalk back on its ledge
      const write = st(0.52, 0.64);
      const grab = { x: xC + dC * (xC - CHALK_AT.x), y: CHALK_AT.y };
      const k = via([grab, { x: SLATE.left + 6, y: SLATE.top + SLATE.h / 2 + 1 }, { x: SLATE.left + SLATE.w - 7, y: SLATE.top + SLATE.h / 2 - 1 }, CHALK_AT],
        [st(0.48, 0.52), write, st(0.64, 0.68)]);
      sc = hand(sc, xC, dC, -1, k.x, k.y, st(0.22, 0.28) * (1 - st(0.68, 0.74)));
      // turned back to her: AP18: tying the bow — the knot pulled tight once (AR5)
      const tu = clamp01((b / L - 0.86) / 0.05);
      const tie = Math.sin(tu * Math.PI) * 1.5;
      sc = hand(sc, xC, dC, 1, 281, 456 - tie, st(0.81, 0.85) * (1 - st(0.94, 0.99)));
    }
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the customer, at the stall's right end ──────────────────────────────
    const wp = legsOf(carrySource(cv, 2, n, 430), PL_LEGS[n], b, L);
    const xP = carry(cv, 2, n, wp.x, wp.x, 1);
    const dP = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), PL_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PL_P, n, t, b);
    // b1: the candle picked up, lifted to her nose for a sniff, and held to her chest
    if (A_SNIFF[n]) {
      sp = hand(sp, xP, dP, 1, FRONT.x, FRONT.y - GRIP, st(0.06, 0.18));
      sp = hand(sp, xP, dP, 1, xP - 7, GROUND - 62, st(0.24, 0.4) * (1 - st(0.64, 0.8)));
      sp = hand(sp, xP, dP, 1, HOLD.x, HOLD.y, st(0.64, 0.8));
    }
    // from b2 on, the candle held to her chest; b10 holds it out to him to be tied
    if (n > 1) {
      const out = A_TAG[n] ? st(0.66, 0.74) * (1 - st(0.94, 0.99)) : 0;
      sp = hand(sp, xP, dP, 1, lerp(HOLD.x, 283, out), lerp(HOLD.y, 459, out), 1);
    }
    // b7: a length of ribbon pulled off the spool and held up to show; held close after,
    // in front of her and below her shoulder (AR6), until it is tied
    if (A_RIBBON[n]) {
      sp = lift(sp, xP, dP, -1, TAIL.x, TAIL.y, st(0.04, 0.2));
      sp = hand(sp, xP, dP, -1, xP - 12, 428, st(0.3, 0.55) * (1 - st(0.82, 0.98)));
    }
    if (n > RIBBON_N || A_RIBBON[n]) {
      const rest = A_RIBBON[n] ? st(0.82, 0.98) : 1;
      const give = A_TAG[n] ? st(0.66, 0.74) : 0;
      const back = A_TAG[n] ? st(0.88, 0.96) : 0;
      sp = hand(sp, xP, dP, -1, lerp(xP - 8, 285, give), lerp(462, 454, give), (n > TAG_N ? 0 : 1 - back) * rest);
    }
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the adviser ─────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 4, n, -30), TH_LEGS[n], b, L);
    const xT = carry(cv, 4, n, wt.x, wt.x, 1);
    const dT = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // b2: the hat tipped once he has arrived, a hand opened to the maker on "an hour of
    // work", then passed over the wax and the jars on "all of that"
    if (A_ARRIVE[n]) {
      const after = wt.end / L;
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.12));
      // one open hand that travels from the maker over the jars to the wax (AR5)
      const k = { x: lerp(lerp(150, JAR_AT.x + 6, st(0.66, 0.74)), WAX_AT.x, st(0.76, 0.84)),
        y: lerp(lerp(446, JAR_AT.y - 14, st(0.66, 0.74)), WAX_AT.y - 12, st(0.76, 0.84)) };
      stt = hand(stt, xT, dT, 1, k.x, k.y, st(0.53, 0.6) * (1 - st(0.9, 0.98)));
    }
    // b3: the wax in his left hand and an empty jar in his right, held up, set back down
    const waxUp = A_COST[n] ? st(0.12, 0.22) * (1 - st(0.78, 0.86)) : 0;
    const jarUp = A_COST[n] ? st(0.24, 0.34) * (1 - st(0.78, 0.86)) : 0;
    if (A_COST[n]) {
      // both held up IN FRONT of him to show them (AR4), the wax by its near end
      stt = lift(stt, xT, dT, -1, lerp(WAX_AT.x - 5, 104, waxUp), lerp(WAX_AT.y - 1.5, 446, waxUp), st(0.02, 0.1) * (1 - st(0.88, 0.95)));
      stt = hand(stt, xT, dT, 1, lerp(JAR_AT.x - 1, 117, jarUp), lerp(JAR_AT.y - GRIP, 442, jarUp), st(0.14, 0.22) * (1 - st(0.88, 0.95)));
    }
    // b6: a hand to the candle in her hands, then up to her face
    if (A_VALUE[n]) {
      stt = hand(stt, xT, dT, 1, HOLD.x, HOLD.y, bp(0.24, 0.32, 0.56));
      stt = hand(stt, xT, dT, 1, xP - 6, GROUND - 66, bp(0.58, 0.66, 0.96));
    }
    // b8: one hand low (what it costs to make), one high (what people will pay), and
    // the two brought together on the price between them
    if (A_BETWEEN[n]) {
      const apart = st(0.08, 0.22);
      const meet = st(0.88, 0.98);
      const low = 3 * bp(0.36, 0.44, 0.58);
      const high = 3 * bp(0.7, 0.78, 0.88);
      stt = hand(stt, xT, dT, 1, lerp(114, 110, meet), lerp(464 - low, 447, meet), apart);
      stt = lift(stt, xT, dT, -1, lerp(106, 108, meet), lerp(428 + high, 445, meet), apart);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const cap = pose(figC, xC, GROUND, K, dC, 1);
    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    // cand   0 the maker's hand · 1 at the front of the stall · 2 the customer's hand
    const candNow = A_CHEAP[n] ? st(0.2, 0.25) : A_SNIFF[n] ? 1 + st(0.16, 0.2) : n > 1 ? 2 : 0;
    const cand = carry(cv, 6, n, candNow, candNow, tr);
    const bowNow = A_TAG[n] ? st(0.86, 0.92) : n > TAG_N ? 1 : 0;
    // rib    0 on the spool · 1 in her left hand · 2 tied on the candle
    const ribNow = A_RIBBON[n] ? st(0.18, 0.22) : A_TAG[n] ? 1 + st(0.82, 0.88) : n > TAG_N ? 2 : n > RIBBON_N ? 1 : 0;
    const rib = carry(cv, 7, n, ribNow, ribNow, tr);
    // chalk  0 on the tag's edge · 1 in the maker's left hand
    const chalkNow = A_CHEAP[n] ? st(0.41, 0.43) * (1 - st(0.89, 0.91))
      : A_TAG[n] ? st(0.34, 0.36) * (1 - st(0.67, 0.69)) : 0;
    const chalk = carry(cv, 8, n, chalkNow, chalkNow, tr);
    // the price on the tag: 50p chalked on b0, wiped on b10, then £4
    const oldWNow = A_CHEAP[n] ? st(0.5, 0.66) : 1;
    const oldONow = A_TAG[n] ? 1 - st(0.32, 0.42) : n > TAG_N ? 0 : 1;
    const freshNow = A_TAG[n] ? st(0.52, 0.64) : n > TAG_N ? 1 : 0;
    const sniffNow = A_SNIFF[n] ? bp(0.34, 0.44, 0.7) : 0;

    const wCR = wristOf(cap, 'wrR');
    const wCL = wristOf(cap, 'wrL');
    const wPR = wristOf(pl, 'wrR');
    const wPL = wristOf(pl, 'wrL');
    const wTR = wristOf(th, 'wrR');
    const wTL = wristOf(th, 'wrL');
    const candAt = cand <= 1
      ? { x: lerp(wCR.x, FRONT.x, cand), y: lerp(wCR.y + GRIP, FRONT.y, cand) }
      : { x: lerp(FRONT.x, wPR.x, cand - 1), y: lerp(FRONT.y, wPR.y + GRIP, cand - 1) };
    const wax = carry(cv, 9, n, A_COST[n] ? st(0.09, 0.12) * (1 - st(0.87, 0.89)) : 0, A_COST[n] ? st(0.09, 0.12) * (1 - st(0.87, 0.89)) : 0, tr);
    const jar = carry(cv, 10, n, A_COST[n] ? st(0.21, 0.24) * (1 - st(0.87, 0.89)) : 0, A_COST[n] ? st(0.21, 0.24) * (1 - st(0.87, 0.89)) : 0, tr);
    const ribAt = rib <= 1
      ? { x: wPL.x, y: wPL.y }
      : { x: lerp(wPL.x, candAt.x, rib - 1), y: lerp(wPL.y, candAt.y - 4, rib - 1) };

    return {
      cap, pl, th, t,
      candle: { x: candAt.x, y: candAt.y, o: 1 },
      bow: { x: candAt.x, y: candAt.y + 0.5, o: carry(cv, 11, n, bowNow, bowNow, tr) },
      ribbon: { x: ribAt.x, y: ribAt.y, o: clamp01(rib * 6) * (rib > 1 ? 1 - (rib - 1) : 1) },
      wax: { x: lerp(WAX_AT.x, wTL.x + 5 * dT, wax), y: lerp(WAX_AT.y, wTL.y + 1.5, wax), o: 1 },
      jar: { x: lerp(JAR_AT.x, wTR.x + 1, jar), y: lerp(JAR_AT.y, wTR.y + GRIP, jar), o: 1 },
      // the chalk held by one end, its point forward and down to the slate (AR2)
      chalk: { x: lerp(CHALK_AT.x, wCL.x + 2.2 * dC, chalk), y: lerp(CHALK_AT.y, wCL.y + 0.5, chalk), o: 1, r: -14 * chalk },
      oldW: carry(cv, 12, n, oldWNow, oldWNow, tr),
      oldO: carry(cv, 13, n, oldONow, oldONow, tr),
      fresh: carry(cv, 14, n, freshNow, freshNow, tr),
      sniff: carry(cv, 15, n, sniffNow, sniffNow, tr),
      q1: carry(cv, 16, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 17, n, Q2[p], Q2[n], tr),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={NEXT_ART} tone={TONE} />
      <ObjectArt parts={GAZEBO_ART} tone={TONE} />
      <View style={styles.valance} pointerEvents="none">
        <Text style={styles.valanceText}>HANDMADE CANDLES</Text>
      </View>
      <Bunting />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="lead" wear={BY_ID.stroller.pieces} />
      <LessonPicture name="biz3-cloth" />
      <LessonPicture name="biz3-shelf" />
      <View style={styles.rider} pointerEvents="none"><LessonPicture name="biz3-jar" /></View>
      <ObjectArt parts={TAG_ART} tone={TONE} />
      <ObjectArt parts={SPOOL_ART} tone={TONE} />
      <Price S={SCENE} />
      <ObjectArt parts={BAG_ART} tone={TONE} />
      <View style={styles.ground} pointerEvents="none" />
      <Wares S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DP} k={K} role="crowd" wear={BY_ID.bun.pieces} />
      <Held S={SCENE} clock={clock} />
      {on(Q1) ? <CostTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <PriceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the bunting under the valance: a string sagging from leg to leg ─────────

const SAG_DEG = (Math.atan2(BUNT.sag, 96) * 180) / Math.PI;
const SAG_LEN = Math.hypot(96, BUNT.sag);
function Bunting() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PENNANT_ART.map((art, k) => <ObjectArt key={k} parts={art} tone={TONE} />)}
      <View style={[styles.string, { left: BUNT.x0 + 48 - SAG_LEN / 2, top: BUNT.y + BUNT.sag / 2, transform: [{ rotate: `${SAG_DEG}deg` }] }]} />
      <View style={[styles.string, { left: BUNT.x0 + 144 - SAG_LEN / 2, top: BUNT.y + BUNT.sag / 2, transform: [{ rotate: `${-SAG_DEG}deg` }] }]} />
    </View>
  );
}

// ── the price chalked on the tent tag ────────────────────────────────────────

function Price({ S }: { S: SharedValue<any> }) {
  const oldMask = useAnimatedStyle(() => ({ width: SLATE.w * S.value.oldW, opacity: S.value.oldO }));
  const freshMask = useAnimatedStyle(() => ({ width: SLATE.w * S.value.fresh }));
  return (
    <>
      <Animated.View style={[styles.slateMask, oldMask]} pointerEvents="none">
        <View style={styles.slatePlate}>
          <Text style={styles.chalkText}>50p</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.slateMask, freshMask]} pointerEvents="none">
        <View style={styles.slatePlate}>
          <Text style={styles.chalkText}>£4</Text>
        </View>
      </Animated.View>
    </>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art, line, pic }: { at: { readonly value: At }; art?: ReturnType<typeof candleJar>; line?: number; pic?: string }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {pic ? <LessonPicture name={pic} /> : <ObjectArt parts={art!} tone={TONE} line={line} />}
    </Animated.View>
  );
}

/** What lies on the table and is lifted off it: the wax, the jar, the chalk. */
function Wares({ S }: { S: SharedValue<any> }) {
  const waxP = useDerivedValue<At>(() => S.value.wax);
  const jarP = useDerivedValue<At>(() => S.value.jar);
  const chalkSt = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.chalk.x }, { translateY: S.value.chalk.y }, { rotate: `${S.value.chalk.r}deg` }],
  }));
  return (
    <>
      <Rider at={waxP} art={WAX_STILL} />
      <Rider at={jarP} pic="biz3-jar" />
      <Animated.View style={[styles.chalk, chalkSt]} pointerEvents="none" />
    </>
  );
}

/** The candle that is sold, its bow, the ribbon, and its scent. */
function Held({ S, clock }: { S: SharedValue<any>; clock: SharedValue<number> }) {
  const candleP = useDerivedValue<At>(() => S.value.candle);
  const bowP = useDerivedValue<At>(() => S.value.bow);
  const ribP = useDerivedValue<At>(() => S.value.ribbon);
  return (
    <>
      <Rider at={candleP} pic="biz3-candle" />
      <Rider at={bowP} art={BOW_ART} />
      <Rider at={ribP} art={LENGTH_ART} />
      {WISPS.map((dx, k) => <Wisp key={k} S={S} dx={dx} k={k} clock={clock} />)}
    </>
  );
}

// ── the scent, rising off the candle as she sniffs it ───────────────────────
// Secondary motion on the clock (never a figure, AL): three wisps rise, sway and thin.
const WISPS = [-3, 0, 3];
function Wisp({ S, dx, k, clock }: { S: SharedValue<any>; dx: number; k: number; clock: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.candle;
    const now = clock.value;
    const ph = (now * 0.6 + k / 3) % 1;
    return {
      opacity: S.value.sniff * Math.sin(ph * Math.PI) * 0.8,
      transform: [
        { translateX: c.x + dx + Math.sin(now * 2.4 + k * 2) * 1.4 },
        { translateY: c.y - 9 - ph * 12 },
      ],
    };
  });
  return <Animated.View style={[styles.wisp, st]} pointerEvents="none" />;
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6). Q1's three choices each carry their
 * name on a small plate inside the target (AN1); Q2's three are chalk tags whose
 * price is their name.
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean };
/**
 * A physical reply to a pick: the right one hops up, squashes and settles (a thing set
 * down with weight); a wrong one shakes sideways and sags. Nothing glows.
 */
function useReply(ok: boolean | null) {
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const sc = useSharedValue(1);
  const rot = useSharedValue(0);
  useEffect(() => {
    if (ok === true) {
      y.value = withSequence(withTiming(-7, { duration: 140 }), withTiming(0, { duration: 120 }), withSpring(0, { damping: 6, stiffness: 260 }));
      sc.value = withSequence(withTiming(1.12, { duration: 140 }), withTiming(0.9, { duration: 120 }), withSpring(1, { damping: 7, stiffness: 240 }));
    } else if (ok === false) {
      x.value = withSequence(withTiming(-3, { duration: 55 }), withTiming(3, { duration: 85 }), withTiming(-2.4, { duration: 80 }), withTiming(1.6, { duration: 70 }), withTiming(0, { duration: 60 }));
      rot.value = withSequence(withTiming(-5, { duration: 80 }), withTiming(4, { duration: 120 }), withSpring(0, { damping: 8, stiffness: 160 }));
      y.value = withSequence(withTiming(2, { duration: 160 }), withSpring(1, { damping: 10 }));
    }
  }, [ok, y, x, sc, rot]);
  return useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: sc.value }, { rotate: `${rot.value}deg` }],
  }));
}
function Reply({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  const st = useReply(ok);
  return <Animated.View style={[styles.place, st]}>{children}</Animated.View>;
}

/** Q1: the empty jar, her shopping bag and the bunting. The jar is part of the cost. */
const COST_Q: Q[] = [
  { id: 'jar', label: 'JAR', pw: 30, left: 112, top: 459, w: 32, h: 34, correct: true },
  { id: 'bag', label: 'BAG', pw: 30, left: 317, top: 466, w: 30, h: 34, correct: false },
  { id: 'bunting', label: 'BUNTING', pw: 54, left: 150, top: 356, w: 96, h: 30, correct: false },
];
function CostTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {COST_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <Reply ok={picked === q.id ? q.correct : null}>
            <View style={[styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw }]}>
              <Text style={styles.nameText}>{q.label}</Text>
            </View>
          </Reply>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: three chalk tags hung on the cloth's front. £4 covers the cost, and she would pay it. */
const TAG2 = { w: 30, h: 22, top: 478 };
const FACE2 = {
  left: TAG2.w * (TAG_FACE.x - TAG_FACE.w / 2) / 100,
  top: TAG2.h * (TAG_FACE.y - TAG_FACE.h / 2) / 100,
  w: (TAG2.w * TAG_FACE.w) / 100,
  h: (TAG2.h * TAG_FACE.h) / 100,
};
const PRICE_Q = [
  { id: 'fifty-pence', label: '50p', x: 150, correct: false },
  { id: 'four-pounds', label: '£4', x: 198, correct: true },
  { id: 'twenty-pounds', label: '£20', x: 246, correct: false },
];
const TAG_REL = priceTag(TAG2.w / 2, TAG2.h / 2, TAG2.w, TAG2.h);
function PriceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PRICE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.x - TAG2.w / 2, top: TAG2.top, width: TAG2.w, height: TAG2.h }}
        >
          <Reply ok={picked === q.id ? q.correct : null}>
            <ObjectArt parts={TAG_REL} tone={TONE} />
            <View style={styles.tagFace}>
              <Text style={styles.tagText}>{q.label}</Text>
            </View>
          </Reply>
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
  valance: {
    position: 'absolute', left: VALANCE.left, top: VALANCE.top, width: VALANCE.w, height: VALANCE.h,
    alignItems: 'center', justifyContent: 'center',
  },
  valanceText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 1.6, color: NATURAL.gazebo.label,
    includeFontPadding: false,
  },
  string: { position: 'absolute', width: SAG_LEN, height: 1, borderRadius: 0.5, backgroundColor: INK },
  // The mask reveals the price ACROSS as it is chalked; it reaches MASK_PAD above and
  // below the slate so it never clips the handwriting face's tall line box, which cut
  // "50p" to 77% of its height (check:readable CUT, 2026-10-02). The word stays centred
  // on the slate.
  slateMask: {
    position: 'absolute', left: SLATE.left, top: SLATE.top - MASK_PAD, height: SLATE.h + 2 * MASK_PAD, overflow: 'hidden',
  },
  slatePlate: {
    position: 'absolute', left: 0, top: MASK_PAD, width: SLATE.w, height: SLATE.h, alignItems: 'center', justifyContent: 'center',
  },
  chalkText: {
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: PAPER_LIT, includeFontPadding: false,
    width: SLATE.w, textAlign: 'center',
  },
  chalk: {
    position: 'absolute', left: -2.6, top: -0.9, width: 5.2, height: 1.8, borderRadius: 0.6,
    backgroundColor: PAPER_LIT, borderWidth: 0.5, borderColor: INK,
  },
  wisp: { position: 'absolute', left: -0.7, top: -4, width: 1.4, height: 7, borderRadius: 0.7, backgroundColor: RULE },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 1, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: Math.min(PLATE_RADIUS, 4), borderWidth: 1,
    borderColor: INK, paddingHorizontal: 3, boxShadow: lipOf(TONE),
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  tagFace: {
    position: 'absolute', left: FACE2.left, top: FACE2.top, width: FACE2.w, height: FACE2.h,
    alignItems: 'center', justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 12, color: PAPER_LIT, includeFontPadding: false,
    width: FACE2.w, textAlign: 'center',
  },
});

export function Biz3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz3Scene} band={[306, 514]} camera={CAM} />;
}
