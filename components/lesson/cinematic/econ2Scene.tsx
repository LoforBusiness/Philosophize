import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './econ2Script';
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
import { emoteStill, emoteStillLive, RUN } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, type NaturalKey, furledUmbrella, umbrellaRack, priceTag, hangingSign, shopAwning, cornerShop,
  rainCloud, sun, panelVan, vanDoor, carton, UMB_HOOK, RACK_RAIL, RACK_TAG_HOOK, TAG_FACE, SIGN_FACE,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-2, "Supply and Demand" — AN UMBRELLA RACK ON A STREET CORNER.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The street seller (the cap, kind) cannot sell
// an umbrella in the sunshine; the passer-by (the bun, oblivious) takes five the moment
// it pours, for everybody behind her; the economist (the top hat) names the two forces.
//
//   b0   the seller lifts an umbrella off his rack and waves it at the empty street,
//        hangs it back, and opens a palm to the sun.
//   b1   the rain cloud slides over the sun and it pours; the passer-by runs in from
//        the street and takes five umbrellas off the rack into her arms.
//   b2   the economist walks in under the awning from the left, tips his hat (the rain
//        flies off it), brushes his shoulder, and opens a hand to her armful.
//   b3   he raises a hand a step at a time — demand at each price — and as the rain
//        thickens it jumps.
//   b4   Q1: the rain cloud, the umbrellas and the price tag — tap one.
//   b5   the seller points at the three left, out at the queue, rubs the back of his
//        neck, wipes his tag and chalks £12 on it.
//   b6   the economist points at the three on the rack, at her armful, then at the tag.
//   b7   a white van pulls in from the right and its side door slides open on a load of
//        umbrellas; she turns and points at it, then back to the seller.
//   b8   Q2: the hanging sign is wiped to three arrows — tap one.
//   b9   the seller wipes the tag and chalks £6, lifts an umbrella off the rack and
//        hands it to the economist.
//   b10  at ease under the quotation, in the rain.
//
// COMPOSITION, in stage units. The CORNER SHOP fills the left, 0–212 × 306–500, its pale
// quoins down the corner at 212; its AWNING runs 20–208 × 356–398 and a HANGING SIGN
// hangs on two chains under it, 82–170 × 386–416. Under the awning, left to right: the
// ECONOMIST at 30 by the door; the SELLER at 66, LEFT of his rack; the PRICE TAG on the
// rack's arm at 74–91 × 455–479, chest-high to him so he can chalk it (safe reach ~23
// units from a shoulder at y 454); the RACK 88–128 (rail at 455, eight crooks 94–123).
// Nobody stands over the rack or the tag. The PASSER-BY runs in to 132 on b1, at the
// rack's right end, to take the five crooks nearest her, and steps out on b2 to 236 —
// on the pavement, in the rain, facing the seller across his rack. The rain falls over
// x 216–398 and is drawn IN FRONT of her. The street: the sun at 320, 340, the cloud
// that covers it (278–362 × 322–366), and from b7 the VAN, whole and on the stage at
// 250–398 × 435–500, behind her; its doorway 308–346 shows the load. The umbrella the
// seller hands the economist on b9 passes at x 48, inside both their reaches.
// Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-2). 0 for a beat with no voice.
 */
const LINES = [4.41, 4.09, 5.28, 4.62, 0, 4.85, 6.4, 4.58, 0, 4.1, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, nodding along, leaning in,
// and waiting for an answer.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_SUNNY = is('sunny');
const A_POUR = is('pour');
const A_ARRIVE = is('arrive');
const A_DEMAND = is('demand');
const A_RAISE = is('raise');
const A_SUPPLY = is('supply');
const A_VAN = is('van');
const A_SETTLE = is('settle');
const CAUSE = BEATS.map((b) => (b.cause ? 1 : 0));
const ARROW = BEATS.map((b) => (b.arrow ? 1 : 0));
const POUR_N = A_POUR.indexOf(1);
const DEMAND_N = A_DEMAND.indexOf(1);
const RAISE_N = A_RAISE.indexOf(1);
const VAN_N = A_VAN.indexOf(1);
const SETTLE_N = A_SETTLE.indexOf(1);

/** Where each of them stands, beat by beat. She runs in on b1, he walks in on b2. */
const BN_X = BEATS.map((_, n) => (n < POUR_N ? 440 : n === POUR_N ? 132 : 236));
const TH_X = BEATS.map((b) => (b.th ? 30 : -40));
const CP_X = BEATS.map(() => 66);
/**
 * Which way each faces at the end of a beat, and the fraction of the line at which he
 * turns to it. The seller faces the street and the passer-by, and turns to the
 * economist when the economist speaks to him (and to hand him his umbrella). The
 * economist faces them both from the left; the passer-by faces the seller — except on
 * b7, when she turns to the van and back.
 */
const CP_DE = [1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1];
const CP_DA = [0, 0, 0.3, 0, 0, 0, 0.04, 0.04, 0, 0.42, 0, 0];
const TH_DE = BEATS.map(() => 1);
const BN_DE = BEATS.map(() => -1);
/** What each is doing with his body: talking while he speaks, alive while he listens (N21). */
const CP_P = [TALK, NOD, NOD, LEAN, WAIT, TALK, LEAN, LEAN, WAIT, TALK, NOD, WAIT];
const BN_P = [WAIT, TALK, NOD, LEAN, WAIT, NOD, LEAN, TALK, WAIT, NOD, NOD, WAIT];
const TH_P = [WAIT, WAIT, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, NOD, WAIT, NOD, NOD, WAIT];

// ── the shop, the rack and its umbrellas ─────────────────────────────────────
const SHOP_ART = cornerShop(106, 403, 212, 194);
const AWNING_ART = shopAwning(114, 377, 188, 42);
const SIGN = { x: 126, y: 401, w: 88, h: 30 };
const SIGN_ART = hangingSign(SIGN.x, SIGN.y, SIGN.w, SIGN.h);
const SLATE = {
  left: SIGN.x + (SIGN_FACE.x - SIGN_FACE.w / 2 - 50) * (SIGN.w / 100),
  top: SIGN.y + (SIGN_FACE.y - SIGN_FACE.h / 2 - 50) * (SIGN.h / 100),
  w: SIGN_FACE.w * (SIGN.w / 100),
  h: SIGN_FACE.h * (SIGN.h / 100),
};
const RACK = { x: 108, y: 465, s: 70 };
const RACK_ART = umbrellaRack(RACK.x, RACK.y, RACK.s, RACK.s);
const RAIL_Y = RACK.y + (RACK_RAIL.y - 50) * (RACK.s / 100);
const HOOK = { x: RACK.x + (RACK_TAG_HOOK.x - 50) * (RACK.s / 100), y: RACK.y + (RACK_TAG_HOOK.y - 50) * (RACK.s / 100) };
/** The price tag hangs off the rack's arm by its string: the string's apex is at the hook. */
const TAG = { w: 20, h: 24 };
const TAG_X = HOOK.x;
const TAG_Y = HOOK.y + (50 - 2) * (TAG.h / 100);
const TAG_ART = priceTag(TAG_X, TAG_Y, TAG.w, TAG.h);
const FACE = {
  left: TAG_X + (TAG_FACE.x - TAG_FACE.w / 2 - 50) * (TAG.w / 100),
  top: TAG_Y + (TAG_FACE.y - TAG_FACE.h / 2 - 50) * (TAG.h / 100),
  w: TAG_FACE.w * (TAG.w / 100),
  h: TAG_FACE.h * (TAG.h / 100),
};
const TAG_MID = { x: FACE.left + FACE.w / 2, y: FACE.top + FACE.h / 2 };
/** The eight crooks on the rail, left to right; the passer-by takes the five nearest her. */
const RX = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => 94 + 4.2 * k);
const UMB_FILL: NaturalKey[] = ['umbNavy', 'umbRed', 'umbBlack', 'umbYellow', 'umbGreen', 'umbRed', 'umbNavy', 'umbYellow'];
/** An umbrella drawn about its crook, so a rider at the crook hangs it from a rail or a hand. */
const UMB = 40;
const umbArt = (fill: NaturalKey) =>
  furledUmbrella(-(UMB_HOOK.x - 50) * (UMB / 100), -(UMB_HOOK.y - 50) * (UMB / 100), UMB, UMB, fill);
const UMB_ARTS = UMB_FILL.map(umbArt);
/** The moment (fraction of b1's line) she takes each of k = 7 … 3. */
const GRAB_M = [0.44, 0.6, 0.7, 0.8, 0.9];
/** Where the seller hands the economist his umbrella: inside both arms' reach. */
const PASS = { x: 48, y: 452 };

// ── the street ───────────────────────────────────────────────────────────────
const SUN_ART = sun(320, 340, 40, 40);
const CLOUD_ART = rainCloud(0, 0, 110, 110);
const CLOUD_AT = { x: 318, y: 342 };
const VAN = { x: 324, y: 467.5, w: 148, h: 65 };
const VAN_ART = panelVan(VAN.x, VAN.y, VAN.w, VAN.h);
const DOOR_ART = vanDoor(VAN.x, VAN.y, VAN.w, VAN.h);
const DOOR_SLIDE = 26 * (VAN.w / 100);
const LOAD_ARTS = [0, 1, 2, 3, 4, 5, 6, 7].map((j) =>
  furledUmbrella(312 + 4.4 * j - (UMB_HOOK.x - 50) * 0.3, 448 - (UMB_HOOK.y - 50) * 0.3, 30, 30,
    (['umbRed', 'umbYellow', 'umbNavy', 'umbGreen', 'umbBlack'] as NaturalKey[])[j % 5]));
const LOAD_BOX = carton(327, 479, 34, 16);
/** The rain: columns over the street, and a strip at the far left past the awning. */
const RAIN_X = [218, 227, 236, 245, 254, 263, 272, 281, 290, 299, 308, 317, 326, 335, 344, 353, 362, 371, 380, 389, 397];
const HEAVY_X = [222, 240, 258, 276, 294, 312, 330, 348, 366, 384, 231, 285, 339, 393];
const LEFT_X = [5, 13];

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
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — so a tap mid-walk never puts him anywhere in one frame (group
 * L). He may wait `delay` seconds before he sets off; he faces the way he goes (C18),
 * then turns to whom the beat has him face. A figure who stays put turns `turnAt`
 * seconds into the beat. `run` is the passer-by running in out of the rain.
 */
function walkOf(
  src: number, xs: readonly number[], codes: readonly number[], n: number, t: number, b: number,
  delay: number, dStart: number, dEnd: number, turnAt: number, run: boolean,
) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const dist = Math.abs(xn - xp);
  const walkDur = walking ? (run ? Math.max(dist / 170, 0.85) : moveTr(xp, xn, TR)) : 0;
  const bw = b - delay;
  const walkU = walking ? ease01(clamp01(bw / walkDur)) : 1;
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? (bw < 0 ? dStart : lerp(facing(dStart, way, bw), dEnd, clamp01((bw - walkDur) / 0.3)))
    : facing(dStart, dEnd, b - turnAt);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, run ? RUN : WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}

const CAM = followMoves(CP_X, BEATS.map(kindOf), seedOf('economics'));

export default function Econ2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldBn = useHeld();
  const heldTh = useHeld();
  const heldCp = useHeld();
  const cv = useCarry(26);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const trD = ease01(b / 0.3);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the passer-by ───────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, BN_X[0]);
    const wb = walkOf(src0, BN_X, BN_P, n, t, b, 0, n > 0 ? BN_DE[p] : -1, BN_DE[n], 0, A_POUR[n] === 1);
    const xBn = carry(cv, 0, n, wb.xp, wb.xn, wb.walking ? wb.walkU : tr);
    // b7: she turns to the van as it pulls in, and back to the seller
    const dBnNow = A_VAN[n]
      ? (b < 0.62 * L ? facing(-1, 1, b - 0.04 * L) : facing(1, -1, b - 0.62 * L))
      : wb.dirV;
    const dBn = carry(cv, 3, n, dBnNow, dBnNow, trD);
    let sb = wb.s;
    // her armful: from her first grab on, the far hand holds the bundle at her waist
    const keep = n > POUR_N ? 1 : n === POUR_N ? st(0.3, 0.4) : 0;
    sb = hand(sb, xBn, dBn, -1, xBn + 5 * dBn, 457, keep);
    // b1: five umbrellas off the rack, the nearest first
    if (A_POUR[n]) {
      for (let j = 0; j < 5; j++) {
        const m = GRAB_M[j];
        sb = hand(sb, xBn, dBn, 1, RX[7 - j] + 1, RAIL_Y + 2, bp(m - 0.06, m, m + 0.06));
      }
    }
    // b7: she points at the van, then turns back and waves a hand at the seller
    if (A_VAN[n]) {
      sb = hand(sb, xBn, dBn, 1, 320, 446, st(0.12, 0.2) * (1 - st(0.56, 0.64)));
      sb = hand(sb, xBn, dBn, 1, xBn - 22, 448, bp(0.72, 0.8, 0.95));
    }
    const prevBn = carryFrom(heldBn, n, hHold(BN_P[p], t));
    const figBn = keepHeld(heldBn, wb.walking ? mixKeepLegs(prevBn, sb, tr) : mixStance(prevBn, sb, tr));

    // ── the economist ───────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const wt = walkOf(src1, TH_X, TH_P, n, t, b, 0, 1, TH_DE[n], 0, false);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    const dTh = carry(cv, 4, n, wt.dirV, wt.dirV, trD);
    let sp = wt.s;
    let spray = 0;
    // b2: tips his hat (the rain flies off it), brushes his shoulder twice, then opens
    // a hand to her armful — "how many people want one"
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      sp = hand(sp, xTh, dTh, 1, xTh + 5 * dTh, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.16));
      spray = st(after + 0.06, after + 0.2);
      sp = hand(sp, xTh, dTh, 1, xTh - 1 * dTh, 452, bp(after + 0.16, after + 0.19, after + 0.22));
      sp = hand(sp, xTh, dTh, 1, xTh - 1 * dTh, 452, bp(after + 0.22, after + 0.25, after + 0.28));
      sp = hand(sp, xTh, dTh, 1, xTh + 22, 450, bp(0.56, 0.66, 0.84));
    }
    // b3: a hand raised a step at a time — at each price — and then it jumps
    if (A_DEMAND[n]) {
      const yR = 472 - 10 * (st(0.12, 0.17) + st(0.25, 0.3) + st(0.38, 0.43)) - 18 * st(0.82, 0.87);
      sp = hand(sp, xTh, dTh, 1, xTh + 16, yR, st(0.05, 0.12) * (1 - st(0.95, 0.99)));
    }
    // b6: points at the three on the rack, at her armful, then at the price on the tag
    if (A_SUPPLY[n]) {
      const tx = lerp(lerp(RX[1], 236, st(0.66, 0.71)), TAG_MID.x, st(0.8, 0.85));
      const ty = lerp(lerp(474, 456, st(0.66, 0.71)), TAG_MID.y, st(0.8, 0.85));
      sp = hand(sp, xTh, dTh, 1, tx, ty, st(0.28, 0.35) * (1 - st(0.95, 0.99)));
    }
    // b9 on: he takes the umbrella from the seller and holds it by the crook at his side
    const holdTh = n > SETTLE_N ? 1 : n === SETTLE_N ? st(0.48, 0.56) : 0;
    if (holdTh > 0) {
      const k = n === SETTLE_N ? st(0.6, 0.7) : 1;
      sp = hand(sp, xTh, dTh, 1, lerp(PASS.x, xTh + 8 * dTh, k), lerp(PASS.y, 458, k), holdTh);
    }
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, sp, tr) : mixStance(prevTh, sp, tr));

    // ── the seller ──────────────────────────────────────────────────────────
    const src2 = carrySource(cv, 2, n, CP_X[0]);
    const wc = walkOf(src2, CP_X, CP_P, n, t, b, 0, n > 0 ? CP_DE[p] : 1, CP_DE[n], CP_DA[n] * L, false);
    const xCp = carry(cv, 2, n, wc.xp, wc.xn, wc.walking ? wc.walkU : tr);
    const dCp = carry(cv, 5, n, wc.dirV, wc.dirV, trD);
    let sc = wc.s;
    let swing = 0;
    // b0: an umbrella off the rail, waved at the empty street, hung back; a palm to the sun
    if (A_SUNNY[n]) {
      const lift = st(0.12, 0.2) * (1 - st(0.5, 0.58));
      const waveE = st(0.18, 0.24) * (1 - st(0.44, 0.5));
      swing = 0.28 * Math.sin(b * 8) * waveE;
      sc = hand(sc, xCp, dCp, 1, lerp(RX[0] - 1, xCp + 14 + 4 * Math.sin(b * 8) * waveE, lift), lerp(RAIL_Y + 1, 436, lift),
        st(0.02, 0.1) * (1 - st(0.64, 0.72)));
      sc = hand(sc, xCp, dCp, 1, xCp + 18, 430, bp(0.72, 0.8, 0.97));
    }
    // b5 and b9: the old price wiped off the tag and the new one chalked on
    const chalk = (s: Stance, a: number): Stance => {
      'worklet';
      const wipe = bump(b, L, a, a + 0.03, a + 0.1);
      const write = bump(b, L, a + 0.09, a + 0.12, a + 0.27);
      const wx = TAG_MID.x + 3 * Math.sin(b * 14);
      const cx = lerp(TAG_MID.x - 6, TAG_MID.x + 5, stage(b, L, a + 0.12, a + 0.25)) + Math.sin(b * 21);
      const cy = TAG_MID.y + 1.5 * Math.sin(b * 17);
      return hand(hand(s, xCp, dCp, 1, wx, TAG_MID.y, wipe), xCp, dCp, 1, cx, cy, write);
    };
    if (A_RAISE[n]) {
      // "Three left" — at the rack; "a queue round the corner" — out at the street;
      // "I hate to do it" — a hand to the back of his neck
      sc = hand(sc, xCp, dCp, 1, RX[1], 474, bp(0.02, 0.08, 0.17));
      sc = hand(sc, xCp, dCp, 1, xCp + 30, 440, bp(0.19, 0.27, 0.45));
      sc = hand(sc, xCp, dCp, 1, xCp - 4 * dCp, 440, bp(0.5, 0.56, 0.66));
      sc = chalk(sc, 0.67);
    }
    // b9: chalked down to six; an umbrella off the rail and across to the economist
    let k0a = n > SETTLE_N ? 1 : 0;
    let k0b = n > SETTLE_N ? 1 : 0;
    if (A_SETTLE[n]) {
      sc = chalk(sc, 0.02);
      const k = st(0.42, 0.52);
      sc = hand(sc, xCp, dCp, 1, lerp(RX[0] - 1, PASS.x, k), lerp(RAIL_Y + 1, PASS.y, k), st(0.3, 0.36) * (1 - st(0.6, 0.68)));
      k0a = st(0.35, 0.38);
      k0b = st(0.55, 0.58);
    }
    if (A_SUNNY[n]) k0a = st(0.1, 0.14) * (1 - st(0.56, 0.6));
    const prevCp = carryFrom(heldCp, n, hHold(CP_P[p], t));
    const figCp = keepHeld(heldCp, wc.walking ? mixKeepLegs(prevCp, sc, tr) : mixStance(prevCp, sc, tr));

    // ── the umbrellas she takes: 0 on the rail · 1 her hand · 2 her armful ──
    const took = (j: number) => {
      'worklet';
      const m = GRAB_M[j];
      return n > POUR_N ? 2 : n === POUR_N ? st(m - 0.01, m + 0.01) + st(m + 0.01, m + 0.06) : 0;
    };

    // ── the sky, the street and the two boards ──────────────────────────────
    const cloudNow = n > POUR_N ? 1 : n === POUR_N ? st(0, 0.22) : 0;
    const rainNow = n > POUR_N ? 1 : n === POUR_N ? st(0.1, 0.3) : 0;
    const heavyNow = n > DEMAND_N ? 1 : n === DEMAND_N ? st(0.6, 0.8) : 0;
    const vanNow = n > VAN_N ? 1 : n === VAN_N ? st(0, 0.36) : 0;
    const doorNow = n > VAN_N ? 1 : n === VAN_N ? st(0.4, 0.54) : 0;
    const p5 = n < RAISE_N ? 1 : n === RAISE_N ? 1 - st(0.68, 0.75) : 0;
    const p12 = n < RAISE_N ? 0 : n === RAISE_N ? st(0.8, 0.93) : n < SETTLE_N ? 1 : n === SETTLE_N ? 1 - st(0.03, 0.1) : 0;
    const p6 = n < SETTLE_N ? 0 : n === SETTLE_N ? st(0.15, 0.28) : 1;

    return {
      bn: pose(figBn, xBn, GROUND, K, dBn, 1),
      th: pose(figTh, xTh, GROUND, K, dTh, 1),
      cp: pose(figCp, xCp, GROUND, K, dCp, 1),
      dBn,
      xTh,
      k0a: carry(cv, 6, n, k0a, k0a, tr),
      k0b: carry(cv, 7, n, k0b, k0b, tr),
      swing: carry(cv, 8, n, swing, swing, tr),
      u3: carry(cv, 13, n, took(4), took(4), tr),
      u4: carry(cv, 12, n, took(3), took(3), tr),
      u5: carry(cv, 11, n, took(2), took(2), tr),
      u6: carry(cv, 10, n, took(1), took(1), tr),
      u7: carry(cv, 9, n, took(0), took(0), tr),
      cloud: carry(cv, 14, n, cloudNow, cloudNow, tr),
      rain: carry(cv, 15, n, rainNow, rainNow, tr),
      heavy: carry(cv, 16, n, heavyNow, heavyNow, tr),
      van: carry(cv, 17, n, vanNow, vanNow, tr),
      door: carry(cv, 18, n, doorNow, doorNow, tr),
      p5: carry(cv, 19, n, p5, p5, tr),
      p12: carry(cv, 20, n, p12, p12, tr),
      p6: carry(cv, 21, n, p6, p6, tr),
      arrows: carry(cv, 22, n, ARROW[p], ARROW[n], tr),
      q1: carry(cv, 23, n, CAUSE[p], CAUSE[n], tr),
      q2: carry(cv, 24, n, ARROW[p], ARROW[n], tr),
      spray: carry(cv, 25, n, spray, spray, tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Heavens S={SCENE} />
      <ObjectArt parts={SUN_ART} tone={TONE} />
      <Cloud S={SCENE} />
      <Van S={SCENE} />
      <ObjectArt parts={SHOP_ART} tone={TONE} />
      <ObjectArt parts={AWNING_ART} tone={TONE} />
      <ObjectArt parts={SIGN_ART} tone={TONE} />
      <Sign S={SCENE} />
      <ObjectArt parts={RACK_ART} tone={TONE} />
      <ObjectArt parts={TAG_ART} tone={TONE} />
      <Tag S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Umbrellas S={SCENE} DB={DB} DC={DC} DT={DT} />
      <HatDrops S={SCENE} />
      {/* the rain falls IN FRONT of whoever is out in it: she stands on the pavement */}
      <Rain S={SCENE} clock={clock} />
      {on(CAUSE) ? <CauseTargets picked={picked} onPick={onPick} live={CAUSE[i] === 1} S={SCENE} /> : null}
      {on(ARROW) ? <ArrowTargets picked={picked} onPick={onPick} live={ARROW[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the sky over the street, clear and then overcast ─────────────────────────

function Heavens({ S }: { S: SharedValue<any> }) {
  const grey = useAnimatedStyle(() => ({ opacity: S.value.rain }));
  return (
    <View style={styles.heavens} pointerEvents="none">
      <Animated.View style={[styles.heavensGrey, grey]} />
    </View>
  );
}

function Cloud({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: CLOUD_AT.x + (1 - S.value.cloud) * 170 }, { translateY: CLOUD_AT.y }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={CLOUD_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── the van: it pulls in from the right and its side door slides back ────────

function Van({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - S.value.van) * 180 }] }));
  const door = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.door * DOOR_SLIDE }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <ObjectArt parts={VAN_ART} tone={TONE} />
      {LOAD_ARTS.map((a, j) => <ObjectArt key={j} parts={a} tone={TONE} />)}
      <ObjectArt parts={LOAD_BOX} tone={TONE} />
      <Animated.View style={[StyleSheet.absoluteFill, door]}>
        <ObjectArt parts={DOOR_ART} tone={TONE} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the rain: it falls on the monotonic clock, never on the beat's (L1, AL) ──

function Drop({ S, clock, x, k, top, fall, heavy }: {
  S: SharedValue<any>; clock: SharedValue<number>; x: number; k: number; top: number; fall: number; heavy?: boolean;
}) {
  const st = useAnimatedStyle(() => {
    const f = ((clock.value * 1.35 + k * 0.618) % 1 + 1) % 1;
    const env = clamp01(f * 8) * clamp01((1 - f) * 8);
    const lv = heavy ? S.value.heavy * S.value.rain : S.value.rain;
    return { opacity: lv * env, transform: [{ translateX: -fall * 0.18 * f }, { translateY: fall * f }, { rotate: '10deg' }] };
  });
  return <Animated.View style={[styles.drop, { left: x, top }, st]} pointerEvents="none" />;
}

function Rain({ S, clock }: { S: SharedValue<any>; clock: SharedValue<number> }) {
  return (
    <>
      {RAIN_X.map((x, k) => <Drop key={`r${x}`} S={S} clock={clock} x={x} k={k} top={368} fall={124} />)}
      {HEAVY_X.map((x, k) => <Drop key={`h${x}`} S={S} clock={clock} x={x} k={k + 0.5} top={368} fall={124} heavy />)}
      {LEFT_X.map((x, k) => <Drop key={`l${x}`} S={S} clock={clock} x={x} k={k * 2.3} top={318} fall={174} />)}
    </>
  );
}

// ── the hanging sign: UMBRELLAS, wiped to three arrows for the second question ─

function Sign({ S }: { S: SharedValue<any> }) {
  const word = useAnimatedStyle(() => ({ opacity: 1 - S.value.arrows }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.Text style={[styles.signWord, word]}>UMBRELLAS</Animated.Text>
    </View>
  );
}

// ── the price tag ────────────────────────────────────────────────────────────

function Tag({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({ opacity: S.value.p5 }));
  const c = useAnimatedStyle(() => ({ opacity: S.value.p12 }));
  const d = useAnimatedStyle(() => ({ opacity: S.value.p6 }));
  return (
    <View style={styles.tagFace} pointerEvents="none">
      <Animated.Text style={[styles.price, a]}>£5</Animated.Text>
      <Animated.Text style={[styles.price, c]}>£12</Animated.Text>
      <Animated.Text style={[styles.price, d]}>£6</Animated.Text>
    </View>
  );
}

// ── the umbrellas: on the rail, in a hand, in her armful ─────────────────────

type Pt = { x: number; y: number; r: number };
const wrist = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: (v[1].translateY as number) - 1 };
};

function Rider({ at, art }: { at: SharedValue<Pt>; art: ReturnType<typeof furledUmbrella> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r}rad` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function Taken({ S, DB, k }: { S: SharedValue<any>; DB: SharedValue<Bundle>; k: 3 | 4 | 5 | 6 | 7 }) {
  const at = useDerivedValue<Pt>(() => {
    const u = S.value[`u${k}`] as number;
    const j = 7 - k;
    const d = S.value.dBn as number;
    const hand = wrist(DB, 'wrR');
    const arm = wrist(DB, 'wrL');
    const slot = { x: arm.x + (j - 2) * 2.4 * d, y: arm.y + Math.abs(j - 2) * 0.6, r: 0.32 * d + (j - 2) * 0.12 * d };
    if (u <= 1) return { x: lerp(RX[k], hand.x, u), y: lerp(RAIL_Y, hand.y, u), r: 0 };
    const v = u - 1;
    return { x: lerp(hand.x, slot.x, v), y: lerp(hand.y, slot.y, v), r: lerp(0, slot.r, v) };
  });
  return <Rider at={at} art={UMB_ARTS[k]} />;
}

function Umbrellas({ S, DB, DC, DT }: {
  S: SharedValue<any>; DB: SharedValue<Bundle>; DC: SharedValue<Bundle>; DT: SharedValue<Bundle>;
}) {
  // the first umbrella: waved at the street on b0, handed to the economist on b9
  const first = useDerivedValue<Pt>(() => {
    const a = S.value.k0a as number;
    const c = S.value.k0b as number;
    const cp = wrist(DC, 'wrR');
    const th = wrist(DT, 'wrR');
    if (c <= 0) return { x: lerp(RX[0], cp.x, a), y: lerp(RAIL_Y, cp.y, a), r: S.value.swing };
    return { x: lerp(cp.x, th.x, c), y: lerp(cp.y, th.y, c), r: 0 };
  });
  const one = useDerivedValue<Pt>(() => ({ x: RX[1], y: RAIL_Y, r: 0 }));
  const two = useDerivedValue<Pt>(() => ({ x: RX[2], y: RAIL_Y, r: 0 }));
  return (
    <>
      <Rider at={two} art={UMB_ARTS[2]} />
      <Rider at={one} art={UMB_ARTS[1]} />
      <Taken S={S} DB={DB} k={3} />
      <Taken S={S} DB={DB} k={4} />
      <Taken S={S} DB={DB} k={5} />
      <Taken S={S} DB={DB} k={6} />
      <Taken S={S} DB={DB} k={7} />
      <Rider at={first} art={UMB_ARTS[0]} />
    </>
  );
}

// ── the rain flying off his hat as he tips it ────────────────────────────────

const SPRAY = [{ dx: -13, up: 5 }, { dx: 3, up: 8 }, { dx: 15, up: 4 }];
function HatDrop({ S, s }: { S: SharedValue<any>; s: { dx: number; up: number } }) {
  const st = useAnimatedStyle(() => {
    const f = S.value.spray as number;
    const x = S.value.xTh + 2 + s.dx * f;
    const y = 410 - s.up * Math.sin(Math.PI * f) + 26 * f * f;
    return { opacity: Math.sin(Math.PI * f), transform: [{ translateX: x }, { translateY: y }] };
  });
  return <Animated.View style={[styles.hatDrop, st]} pointerEvents="none" />;
}
function HatDrops({ S }: { S: SharedValue<any> }) {
  return <>{SPRAY.map((s, k) => <HatDrop key={k} S={S} s={s} />)}</>;
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the rain cloud, the umbrellas left on the rail, and the price tag. The rain is the cause. */
const CAUSE_Q = [
  { id: 'rain', left: 274, top: 318, w: 92, h: 52, r: 22, correct: true },
  { id: 'umbrellas', left: 91.5, top: 452, w: 23, h: 44, r: 4, correct: false },
  { id: 'tag', left: FACE.left - 3, top: FACE.top - 3, w: 91 - FACE.left, h: FACE.h + 6, r: 3, correct: false },
];
function CauseTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {CAUSE_Q.map((q) => (
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

/** Q2: the sign's three chalk arrows. More supply, the same demand: the price comes down. */
const ARROW_Q = [
  { id: 'up', arrow: '↑', correct: false },
  { id: 'level', arrow: '→', correct: false },
  { id: 'down', arrow: '↓', correct: true },
];
const CELL_W = SLATE.w / 3;
function ArrowTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {ARROW_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + k * CELL_W + 1, top: SLATE.top - 1, width: CELL_W - 2, height: SLATE.h + 2 }}
        >
          <View style={styles.choice}>
            <Text style={styles.choiceArrow}>{q.arrow}</Text>
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
  heavens: {
    position: 'absolute', left: 206, right: 0, top: 300, height: GROUND - 300, backgroundColor: NATURAL.clearSky.base,
  },
  heavensGrey: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: NATURAL.greySky.base },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  drop: { position: 'absolute', width: 1.4, height: 8, borderRadius: 0.7, backgroundColor: NATURAL.water.shade },
  hatDrop: {
    position: 'absolute', left: -1.2, top: -1.6, width: 2.4, height: 3.2, borderRadius: 1.2, backgroundColor: NATURAL.water.base,
  },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signWord: {
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, letterSpacing: 1, color: PAPER_LIT, includeFontPadding: false,
  },
  tagFace: { position: 'absolute', left: FACE.left, top: FACE.top, width: FACE.w, height: FACE.h },
  price: {
    position: 'absolute', left: 0, right: 0, top: (FACE.h - 13) / 2, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: PAPER_LIT, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
  choice: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceArrow: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, color: INK, includeFontPadding: false,
  },
});

export function Econ2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ2Scene} band={[306, 514]} camera={CAM} />;
}
