import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './biz1Script';
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
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, coin, lemonStand, standCounter, lemon, lemonadeJug, reamer, paperCup, cupStack, cashTin, tinLid,
  lemonCrateBack, lemonCrateFront, queueSign, cupBin, STAND_SLATE,
} from './objects';
import { BY_ID } from './wardrobe';
import { DEEP, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-1, "What Is a Business?" — A PAVEMENT LEMONADE STAND.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The maker (the cap, kind to a fault) squeezes
// the lemons; his partner (the bun, cheerful and a step behind) has been giving the
// lemonade away; the adviser (the top hat) walks in, finds the tin empty, and names
// what a business is.
//
//   b0   the maker squeezes his last lemon over the jug with the wooden reamer, drops
//        the rind behind the counter, sets the reamer down and calls his price.
//   b1   the partner lifts a full cup and holds it out over the counter to the queue,
//        beaming, then points off down the pavement at it.
//   b2   she sets the cup down; the maker tips the empty lemon crate up to show it and
//        pats his pocket, palm out.
//   b3   the adviser walks in from the left, tips his hat, and lifts the lid of the
//        cash tin: empty.
//   b4   he hands over a pound (two fifty-pence pieces) and takes the full cup; she
//        drops one coin in the tin and slides the other along to the maker, who drops
//        it in the lemon crate.
//   b5   Q1: three tags hang from the counter, PAID IN · LEMONS & SUGAR · LEFT OVER,
//        each with its coins on it — tap one.
//   b6   the adviser takes the coin out of the tin and holds it up, then puts it back;
//        the maker restocks the crate with lemons from behind the counter.
//   b7   the partner comes along to the squeezer and both of them grab it at once and
//        tug; the cups stand unserved; "my job, or yours?"
//   b8   the reamer goes back down; the adviser points to the squeezer, then to the
//        front of the stand where the cups are.
//   b9   Q2: the stand's chalk sign is wiped to three rows — tap one.
//   b10  the maker squeezes a fresh lemon; she goes back to the front and pours from the
//        jug into the adviser's held-out cup; he drops a pound in the tin. The sign
//        chalks ONE SQUEEZES, ONE SERVES under the price.
//   b11  at ease under the quotation; the adviser raises his cup.
//
// COMPOSITION, in stage units. The stand's two uprights stand at 190 and 362 and carry
// its name board, 190–362 × 316–382, with the chalk slate let into it at 196–356 ×
// 323–379. The counter, 192–360 × 476–500, is at the HIP of the two people behind it
// (AP10): the partner at 246 and the maker at 298. On its top: the cash tin 212–236,
// a full cup at 242, the nested cups at 254, the jug 267–285 (handle to the maker),
// the reamer resting 278–300, and the lemon crate 313–347. The adviser comes in to
// 200, at the counter's left end, which puts the tin, the pass-point over it (224,
// 450) and the refill point all inside his arm's reach (~23 units from the shoulder
// at this scale) and inside the partner's. On the pavement to the left, a hand-lettered
// QUEUE HERE card on its stake at 48–108 and a bin full of used cups at 119–149 say
// where the queue is without putting a silent figure on the stage (AP13).
// Band [306, 514].
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
 * (lib/narration/manifest.ts, business-foundations-1), except b4, whose hand-offs run
 * on about a second after its 4.36s line. 0 for a beat with no voice.
 */
const LINES = [4.56, 4.7, 3.83, 6.32, 6.66, 0, 4.81, 4.95, 5.72, 0, 3.76, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in to listen.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CRY = is('cry');
const A_FREE = is('free');
const A_LEMONS = is('lemons');
const A_ARRIVE = is('arrive');
const A_SALE = is('sale');
const A_PROOF = is('proof');
const A_MUDDLE = is('muddle');
const A_LEAD = is('lead');
const A_SPLIT = is('split');
const A_REST = is('rest');
const TIN = BEATS.map((b) => b.tin ?? 0);
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));
/** The sign: 0 the name and the price · 1 the three rows (Q2) · 2 the price and the rule they settled on. */
const BOARD_V = BEATS.map((b, n) => (b.q2 ? 1 : n > Q2.indexOf(1) ? 2 : 0));
const SALE_N = A_SALE.indexOf(1);
const PROOF_N = A_PROOF.indexOf(1);
const SPLIT_N = A_SPLIT.indexOf(1);

/** Where each of them stands, beat by beat. The adviser is off the stage until b3. */
const PT_X = [246, 246, 246, 246, 246, 246, 246, 258, 258, 258, 246, 246, 246];
const AD_X = BEATS.map((b) => (b.th ? 200 : -30));
const MK_X = BEATS.map(() => 298);
/** Which way each faces: the partner turns between the maker and the pavement. */
const PT_D = [1, 1, 1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1];
const AD_D = BEATS.map(() => 1);
const MK_D = BEATS.map(() => -1);
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PT_P = [LISTEN, TALK, NOD, LISTEN, TALK, LISTEN, NOD, TALK, LISTEN, NOD, NOD, WAIT, LISTEN];
const MK_P = [TALK, NOD, TALK, LISTEN, LISTEN, LEAN, NOD, LISTEN, NOD, LISTEN, TALK, NOD, LISTEN];
const AD_P = [LISTEN, LISTEN, LISTEN, EXPLAIN, LISTEN, NOD, EXPLAIN, LISTEN, EXPLAIN, LISTEN, NOD, LISTEN, LISTEN];

// ── the stand and what is on its counter ─────────────────────────────────────
const STAND = { x: 276, y: 408, w: 172, h: 184 };
const SLATE = {
  left: STAND.x + (STAND_SLATE.x - STAND_SLATE.w / 2 - 50) * (STAND.w / 100),
  top: STAND.y + (STAND_SLATE.y - STAND_SLATE.h / 2 - 50) * (STAND.h / 100),
  w: STAND_SLATE.w * (STAND.w / 100),
  h: STAND_SLATE.h * (STAND.h / 100),
};
const TOP = 477;                                        // the counter's top, at their hip
const FULL_AT = { x: 242, y: TOP - 6.5 };
const JUG_REST = { x: 276, y: TOP - 11.5 };
/** The jug is held by the left side of its glass, 9 units from its middle. */
const JUG_GRAB = { x: JUG_REST.x - 9, y: JUG_REST.y - 1 };
/** The reamer is held by the end of its handle; at rest it lies tip-left on the counter. */
const SQZ_REST = { x: 300, y: TOP - 4 };
/** Squeezing: the lemon held over the jug's mouth, the reamer's point in it. */
const SQ_LEMON = { x: 278, y: 450 };
const SQ_GRIP = { x: 298, y: 450 };
const BEHIND = { x: 288, y: 488 };                      // where a spent rind goes, behind the counter
const TIN_AT = { x: 224, y: 470 };
const TIN_MOUTH = { x: 224, y: 461 };
const CRATE = { left: 313, top: 440, w: 34, h: 37 };    // the crate's box, lemons included
const CRATE_MOUTH = { x: 322, y: 459 };
/** Lemons in the crate, in the crate box's own coordinates. */
const CRATE_LEMONS = [{ x: 9, y: 17 }, { x: 18, y: 15 }, { x: 27, y: 17 }];
/** Where things cross the counter between the adviser's hand and the partner's. */
const PASS = { x: 224, y: 450 };
const CUP_HOLD = { x: 210, y: 448 };
const CUP_UP = { x: 212, y: 438 };
const REFILL = { x: 214, y: 456 };
const POUR_HAND = { x: 226, y: 446 };
const HOLD_OUT = { x: 226, y: 444 };
const HOLD_UP = { x: 218, y: 436 };
const SLIDE_A = { x: 244, y: TOP - 3 };
const SLIDE_B = { x: 290, y: TOP - 3 };
const SLIDE_PUSH = { x: 262, y: TOP - 3 };
const QUEUE_PT = { x: 120, y: 428 };
/** The pour: how far the jug tips (degrees), and where its lip is from the hand, before tipping. */
const TIP_DEG = -70;
const LIP_OFF = { x: 1.6, y: -5.6 };

const STAND_ART = lemonStand(STAND.x, STAND.y, STAND.w, STAND.h);
const COUNTER_ART = standCounter(276, 488, 168, 24);
const TIN_ART = cashTin(TIN_AT.x, TIN_AT.y, 24, 14);
const STACK_ART = cupStack(254, TOP - 10, 9, 20);
const SIGN_ART = queueSign(78, 458, 60, 84);
const BIN_ART = cupBin(134, 483, 30, 34);
// In the crate's own box, so the whole crate can tip about its corner.
const CRATE_BACK_ART = lemonCrateBack(17, 26, 34, 22);
const CRATE_FRONT_ART = lemonCrateFront(17, 26, 34, 22);
const LID_ART = tinLid(13, 8, 26, 16);
// The things that move are drawn about the point a hand holds them by.
const JUG_ART = lemonadeJug(9, 1, 18, 23);
const REAMER_ART = reamer(9, 0, 22, 8);
const LEMON_ART = lemon(0, 0, 11, 8);
const CUP_ART = paperCup(0, 0, 10, 13);
const COIN_ART = tint(coin(0, 0, 8, 8), 'silver');

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
/** Where the crate's rim is when it is tipped by `tip`, about its bottom-right corner. */
function rimAt(tip: number) {
  'worklet';
  const a = (-26 * tip * Math.PI) / 180;
  const rx = 3 - CRATE.w;
  const ry = 16 - CRATE.h;
  return {
    x: CRATE.left + CRATE.w + rx * Math.cos(a) - ry * Math.sin(a),
    y: CRATE.top + CRATE.h + rx * Math.sin(a) + ry * Math.cos(a),
  };
}
/**
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — not from where the script says the last beat left him, so a
 * tap mid-walk never puts him anywhere in one frame (group L). He faces the way he
 * goes (C18), then turns to whom the beat has him face.
 */
function walkOf(src: number, xs: readonly number[], ds: readonly number[], codes: readonly number[], n: number, t: number, b: number) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const walkU = walking ? ease01(clamp01(b / walkDur)) : 1;
  const dp = n > 0 ? ds[p] : ds[n];
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? lerp(facing(dp, way, b), ds[n], clamp01((b - walkDur) / 0.3))
    : facing(dp, ds[n], b);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}

const CAM = followMoves(PT_X, BEATS.map(kindOf), seedOf('business'));

export default function Biz1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldPt = useHeld();
  const heldAd = useHeld();
  const heldMk = useHeld();
  const cv = useCarry(24);
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

    // ── the squeezing, the tug and the tipping, which hands follow ──────────
    const squeeze = A_CRY[n] ? st(0.06, 0.12) * (1 - st(0.56, 0.62))
      : A_SPLIT[n] ? st(0.22, 0.25) * (1 - st(0.33, 0.36)) : 0;
    const twistNow = Math.sin(b * 10) * 14 * squeeze;
    const tugNow = Math.sin(b * 7) * 3 * (A_MUDDLE[n] ? bp(0.5, 0.6, 0.74) : 0);
    const tipNow = A_LEMONS[n] ? bp(0.14, 0.32, 0.56) : 0;
    const tugHold = A_MUDDLE[n] ? st(0.42, 0.5) : A_LEAD[n] ? 1 - st(0.02, 0.14) : 0;

    // ── the partner, behind the counter ─────────────────────────────────────
    // where she stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src0 = carrySource(cv, 0, n, PT_X[0]);
    const wp = walkOf(src0, PT_X, PT_D, PT_P, n, t, b);
    const xPt = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    let sp = wp.s;
    // b1: a full cup lifted and held out to the queue, then a hand out down the pavement at it
    if (A_FREE[n]) {
      const c = via([FULL_AT, HOLD_OUT, QUEUE_PT, HOLD_OUT], [st(0.2, 0.4), st(0.62, 0.72), st(0.86, 0.96)]);
      sp = hand(sp, xPt, wp.dirV, -1, c.x, c.y, st(0.04, 0.16));
    }
    // b2: and set back down on the counter
    if (A_LEMONS[n]) {
      const down = st(0.02, 0.2);
      sp = hand(sp, xPt, wp.dirV, -1, lerp(HOLD_OUT.x, FULL_AT.x, down), lerp(HOLD_OUT.y, FULL_AT.y, down), 1 - st(0.26, 0.4));
    }
    // b4: the cup to the pass-point; the coins taken, one into the tin, one slid along
    if (A_SALE[n]) {
      const c = via([FULL_AT, PASS], [st(0.34, 0.46)]);
      sp = hand(sp, xPt, wp.dirV, -1, c.x, c.y, st(0.04, 0.14) * (1 - st(0.52, 0.62)));
      const k = via([PASS, TIN_MOUTH, SLIDE_A, SLIDE_PUSH], [st(0.58, 0.66), st(0.7, 0.75), st(0.76, 0.8)]);
      sp = hand(sp, xPt, wp.dirV, 1, k.x, k.y, st(0.18, 0.28) * (1 - st(0.82, 0.92)));
    }
    // b7: along to the squeezer, and a hand on its point; then "my job, or yours?"
    if (A_MUDDLE[n]) {
      sp = hand(sp, xPt, wp.dirV, 1, lerp(SQZ_REST.x - 19, 280, tugHold) + tugNow, lerp(SQZ_REST.y, 458, tugHold), st(0.3, 0.4));
      sp = hand(sp, xPt, wp.dirV, -1, xPt + 3, GROUND - 50, bp(0.76, 0.82, 0.88));
      sp = hand(sp, xPt, wp.dirV, -1, xPt + 22, GROUND - 48, bp(0.86, 0.92, 0.99));
    }
    // b8: and lets go of it
    if (A_LEAD[n]) sp = hand(sp, xPt, wp.dirV, 1, lerp(SQZ_REST.x - 19, 280, tugHold), lerp(SQZ_REST.y, 458, tugHold), 1 - st(0.02, 0.1));
    // b10: back at the front, the jug lifted by its side and poured into the held-out cup
    if (A_SPLIT[n]) {
      const j = via([JUG_GRAB, POUR_HAND, JUG_GRAB], [st(0.48, 0.56), st(0.72, 0.8)]);
      sp = hand(sp, xPt, wp.dirV, 1, j.x, j.y, st(0.38, 0.46) * (1 - st(0.84, 0.92)));
    }
    const prevPt = carryFrom(heldPt, n, hHold(PT_P[p], t));
    const figPt = keepHeld(heldPt, wp.walking ? mixKeepLegs(prevPt, sp, tr) : mixStance(prevPt, sp, tr));

    // ── the adviser ─────────────────────────────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src1 = carrySource(cv, 1, n, -30);
    const wa = walkOf(src1, AD_X, AD_D, AD_P, n, t, b);
    const xAd = carry(cv, 1, n, wa.xp, wa.xn, wa.walking ? wa.walkU : tr);
    const pocket = { x: xAd + 3, y: GROUND - 30 };
    let sa = wa.s;
    // b3: he tips his hat once he has arrived, then lifts the lid of the tin
    if (A_ARRIVE[n]) {
      const after = wa.walkDur / L;
      sa = hand(sa, xAd, wa.dirV, 1, xAd + 5, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.14));
      sa = hand(sa, xAd, wa.dirV, 1, TIN_MOUTH.x, lerp(TIN_MOUTH.y, 446, st(after + 0.18, after + 0.26)),
        st(after + 0.13, after + 0.19) * (1 - st(after + 0.28, after + 0.34)));
    }
    // b4: a pound from his pocket across the tin, and the cup taken in his other hand
    if (A_SALE[n]) {
      const c = via([pocket, PASS], [st(0.1, 0.24)]);
      sa = hand(sa, xAd, wa.dirV, 1, c.x, c.y, st(0, 0.08) * (1 - st(0.36, 0.46)));
      const h = via([PASS, CUP_HOLD], [st(0.52, 0.62)]);
      sa = hand(sa, xAd, wa.dirV, -1, h.x, h.y, st(0.4, 0.48));
    }
    // after the sale he holds his cup in front of him
    if (n > SALE_N && !A_SPLIT[n]) {
      const up = A_REST[n] ? st(0.1, 0.3) : n > SPLIT_N + 1 ? 1 : 0;
      sa = hand(sa, xAd, wa.dirV, -1, lerp(CUP_HOLD.x, CUP_UP.x, up), lerp(CUP_HOLD.y, CUP_UP.y, up), 1);
    }
    // b6: the coin out of the tin and held up, then put back
    if (A_PROOF[n]) {
      const k = via([TIN_MOUTH, HOLD_UP, TIN_MOUTH], [st(0.22, 0.34), st(0.76, 0.84)]);
      sa = hand(sa, xAd, wa.dirV, 1, k.x, k.y, st(0.08, 0.18) * (1 - st(0.86, 0.94)));
    }
    // b8: a hand to the squeezer — one owner — then to the front, where the cups are served
    if (A_LEAD[n]) {
      sa = hand(sa, xAd, wa.dirV, 1, 300, 446, bp(0.14, 0.24, 0.46));
      sa = hand(sa, xAd, wa.dirV, 1, 238, 470, st(0.52, 0.62) * (1 - st(0.9, 0.98)));
    }
    // b10: his cup held out to be filled, then a pound from his pocket into the tin
    if (A_SPLIT[n]) {
      const h = via([CUP_HOLD, REFILL, CUP_HOLD], [st(0.46, 0.54), st(0.72, 0.8)]);
      sa = hand(sa, xAd, wa.dirV, -1, h.x, h.y, 1);
      const c = via([pocket, TIN_MOUTH], [st(0.8, 0.88)]);
      sa = hand(sa, xAd, wa.dirV, 1, c.x, c.y, st(0.7, 0.76) * (1 - st(0.9, 0.97)));
    }
    const prevAd = carryFrom(heldAd, n, hHold(AD_P[p], t));
    const figAd = keepHeld(heldAd, wa.walking ? mixKeepLegs(prevAd, sa, tr) : mixStance(prevAd, sa, tr));

    // ── the maker, behind the counter ───────────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src2 = carrySource(cv, 2, n, MK_X[0]);
    const wm = walkOf(src2, MK_X, MK_D, MK_P, n, t, b);
    const xMk = carry(cv, 2, n, wm.xp, wm.xn, wm.walking ? wm.walkU : tr);
    let sm = wm.s;
    const jig = Math.sin(b * 10) * 2 * squeeze;
    // b0: the last lemon squeezed over the jug, the rind behind the counter, the reamer
    // down, and a hand to his mouth to call the price
    if (A_CRY[n]) {
      const l = via([SQ_LEMON, BEHIND], [st(0.62, 0.7)]);
      sm = hand(sm, xMk, wm.dirV, 1, l.x, l.y, 1 - st(0.7, 0.76));
      const r = via([SQ_GRIP, SQZ_REST], [st(0.6, 0.7)]);
      sm = hand(sm, xMk, wm.dirV, -1, r.x + jig, r.y - jig * 0.5, 1 - st(0.74, 0.82));
      sm = hand(sm, xMk, wm.dirV, 1, xMk - 7, GROUND - 67, bp(0.78, 0.86, 0.99));
    }
    // b2: the empty crate tipped up to show it, then his pocket, and a palm out
    if (A_LEMONS[n]) {
      const rim = rimAt(tipNow);
      sm = hand(sm, xMk, wm.dirV, -1, rim.x, rim.y, bp(0.06, 0.16, 0.64));
      sm = hand(sm, xMk, wm.dirV, 1, xMk + 2, GROUND - 30, bp(0.62, 0.72, 0.84));
      sm = hand(sm, xMk, wm.dirV, 1, xMk - 16, GROUND - 46, st(0.84, 0.94));
    }
    // b4: the coin slid to him, dropped in the lemon crate
    if (A_SALE[n]) {
      const k = via([SLIDE_B, CRATE_MOUTH], [st(0.89, 0.95)]);
      sm = hand(sm, xMk, wm.dirV, -1, k.x, k.y, st(0.82, 0.87) * (1 - st(0.95, 1)));
    }
    // b6: lemons up from behind the counter into the crate
    if (A_PROOF[n]) {
      const k = via([{ x: 312, y: 488 }, CRATE_MOUTH], [st(0.34, 0.46)]);
      sm = hand(sm, xMk, wm.dirV, -1, k.x, k.y, st(0.2, 0.3) * (1 - st(0.6, 0.7)));
    }
    // b7: his hand on the squeezer's handle, and the tug
    if (A_MUDDLE[n]) sm = hand(sm, xMk, wm.dirV, 1, lerp(SQZ_REST.x, 298, tugHold) + tugNow, lerp(SQZ_REST.y, 458, tugHold), st(0.28, 0.38));
    // b8: he puts it back down and lets go
    if (A_LEAD[n]) sm = hand(sm, xMk, wm.dirV, 1, lerp(SQZ_REST.x, 298, tugHold), lerp(SQZ_REST.y, 458, tugHold), 1 - st(0.14, 0.24));
    // b10: a fresh lemon from the crate, the reamer, one squeeze, the rind away
    if (A_SPLIT[n]) {
      const slot = { x: CRATE.left + CRATE_LEMONS[0].x, y: CRATE.top + CRATE_LEMONS[0].y };
      const k = via([slot, SQ_LEMON, SQZ_REST, SQ_GRIP, SQZ_REST], [st(0.05, 0.11), st(0.14, 0.18), st(0.18, 0.22), st(0.36, 0.4)]);
      sm = hand(sm, xMk, wm.dirV, -1, k.x + jig, k.y - jig * 0.5, st(0, 0.04) * (1 - st(0.4, 0.46)));
      const l = via([SQ_LEMON, BEHIND], [st(0.37, 0.43)]);
      sm = hand(sm, xMk, wm.dirV, 1, l.x, l.y, st(0.07, 0.11) * (1 - st(0.43, 0.5)));
    }
    const prevMk = carryFrom(heldMk, n, hHold(MK_P[p], t));
    const figMk = keepHeld(heldMk, wm.walking ? mixKeepLegs(prevMk, sm, tr) : mixStance(prevMk, sm, tr));

    // ── the things that change hands ────────────────────────────────────────
    // cup     0 on the counter · 1 the partner's hand · 2 the adviser's
    const cupNow = A_FREE[n] ? st(0.12, 0.17)
      : A_LEMONS[n] ? 1 - st(0.18, 0.24)
        : A_SALE[n] ? st(0.12, 0.16) + st(0.48, 0.52)
          : n > SALE_N ? 2 : 0;
    // ca, cb  the pound's two coins: 0 in his pocket · 1 his hand · 2 hers; then
    //         ca 3 into the tin, and cb 3 laid down · 4 slid along · 5 the maker's hand · 6 the crate
    const early = A_SALE[n] ? st(0.02, 0.08) + st(0.3, 0.34) : n > SALE_N ? 2 : 0;
    const caNow = A_SALE[n] ? early + st(0.62, 0.68) : n > SALE_N ? 3 : 0;
    const cbNow = A_SALE[n] ? early + st(0.72, 0.76) + st(0.77, 0.84) + st(0.86, 0.88) + st(0.89, 0.95) : n > SALE_N ? 6 : 0;
    // cc      the second pound: 0 not yet · 1 his hand · 2 into the tin
    const ccNow = A_SPLIT[n] ? st(0.72, 0.76) + st(0.8, 0.88) : n > SPLIT_N ? 2 : 0;
    // the coins seen inside the open tin, and the one held up out of it
    const tinNow = A_SALE[n] ? st(0.67, 0.7) : A_SPLIT[n] ? 1 + st(0.87, 0.89) : TIN[n];
    const proofNow = A_PROOF[n] ? st(0.18, 0.22) * (1 - st(0.84, 0.86)) : 0;
    // lemon0  the last lemon: 0 in his hand · 1 behind the counter
    const lemon0Now = A_CRY[n] ? st(0.62, 0.7) : 1;
    // lemon1  the fresh one: 0 in the crate · 1 his back hand · 2 his front hand · 3 behind the counter
    const lemon1Now = A_SPLIT[n] ? st(0.03, 0.07) + st(0.1, 0.13) + st(0.37, 0.43) : n > SPLIT_N ? 3 : 0;
    // the reamer: in his hand, and held between the two of them
    const sqzNow = A_CRY[n] ? 1 - st(0.7, 0.74) : A_SPLIT[n] ? st(0.18, 0.21) * (1 - st(0.38, 0.4)) : 0;
    // the jug: lifted by her, and tipped
    const jugNow = A_SPLIT[n] ? st(0.44, 0.48) * (1 - st(0.8, 0.84)) : 0;
    const tiltNow = A_SPLIT[n] ? st(0.54, 0.6) * (1 - st(0.66, 0.72)) : 0;
    const pourNow = A_SPLIT[n] ? bp(0.57, 0.61, 0.68) : 0;
    // the tin's lid, lifted when the adviser arrives and left open
    const lidNow = A_ARRIVE[n] ? st(wa.walkDur / L + 0.18, wa.walkDur / L + 0.26) : n > A_ARRIVE.indexOf(1) ? 1 : 0;
    // the crate restocked with lemons as the maker lifts them in
    const lemonsNow = A_PROOF[n] ? st(0.42, 0.5) : n > PROOF_N ? 1 : 0;

    return {
      pt: pose(figPt, xPt, GROUND, K, wp.dirV, 1),
      ad: pose(figAd, xAd, GROUND, K, wa.dirV, 1),
      mk: pose(figMk, xMk, GROUND, K, wm.dirV, 1),
      cupT: carry(cv, 3, n, cupNow, cupNow, tr),
      ca: carry(cv, 4, n, caNow, caNow, tr),
      cb: carry(cv, 5, n, cbNow, cbNow, tr),
      cc: carry(cv, 6, n, ccNow, ccNow, tr),
      lemon0: carry(cv, 7, n, lemon0Now, lemon0Now, tr),
      lemon1: carry(cv, 8, n, lemon1Now, lemon1Now, tr),
      sqz: carry(cv, 9, n, sqzNow, sqzNow, tr),
      tug: carry(cv, 10, n, tugHold, tugHold, tr),
      tip: carry(cv, 11, n, tipNow, tipNow, tr),
      lemons: carry(cv, 12, n, lemonsNow, lemonsNow, tr),
      lid: carry(cv, 13, n, lidNow, lidNow, tr),
      tin: carry(cv, 14, n, tinNow, tinNow, tr),
      proof: carry(cv, 15, n, proofNow, proofNow, tr),
      jug: carry(cv, 16, n, jugNow, jugNow, tr),
      tilt: carry(cv, 17, n, tiltNow, tiltNow, tr),
      pour: carry(cv, 18, n, pourNow, pourNow, tr),
      board: carry(cv, 19, n, BOARD_V[p], BOARD_V[n], tr),
      q1: carry(cv, 20, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 21, n, Q2[p], Q2[n], tr),
      twist: carry(cv, 22, n, twistNow, twistNow, tr),
      tugX: carry(cv, 23, n, tugNow, tugNow, tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pt);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.ad);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.mk);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={BIN_ART} tone={TONE} line={1.8} />
      <ObjectArt parts={SIGN_ART} tone={TONE} line={1.8} />
      <QueueCard />
      <ObjectArt parts={STAND_ART} tone={TONE} />
      <Board S={SCENE} />
      {/* cast: cap */}
      <Stickman D={DM} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: bun */}
      <Stickman D={DP} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <ObjectArt parts={TIN_ART} tone={TONE} line={1.6} />
      <TinInside S={SCENE} />
      <ObjectArt parts={STACK_ART} tone={TONE} line={1.4} />
      <Crate S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DA} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Goods S={SCENE} DP={DP} DA={DA} DM={DM} />
      {on(Q1) ? <TallyTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SplitTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the queue card on its stake ──────────────────────────────────────────────

function QueueCard() {
  return (
    <View style={styles.queueCard} pointerEvents="none">
      <Text style={styles.queueText}>QUEUE</Text>
      <Text style={styles.queueText}>HERE →</Text>
    </View>
  );
}

// ── the tin's lid and what is in it ──────────────────────────────────────────

function TinInside({ S }: { S: SharedValue<any> }) {
  const one = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tin) * (1 - clamp01(S.value.proof * 3)) }));
  const two = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tin - 1) }));
  const lid = useAnimatedStyle(() => ({ transform: [{ scaleY: lerp(0.3, 1, S.value.lid) }] }));
  return (
    <>
      <Animated.View style={[styles.inCoin, { left: TIN_AT.x - 8 }, one]} pointerEvents="none" />
      <Animated.View style={[styles.inCoin, { left: TIN_AT.x + 1 }, two]} pointerEvents="none" />
      <Animated.View style={[styles.lid, lid]} pointerEvents="none">
        <ObjectArt parts={LID_ART} tone={TONE} line={1.4} />
      </Animated.View>
    </>
  );
}

// ── the lemon crate, which tips about its bottom-right corner ────────────────

function Crate({ S }: { S: SharedValue<any> }) {
  const tip = useAnimatedStyle(() => ({ transform: [{ rotate: `${-26 * S.value.tip}deg` }] }));
  const l0 = useAnimatedStyle(() => ({ opacity: S.value.lemons * (S.value.lemon1 > 0.05 ? 0 : 1) }));
  const l1 = useAnimatedStyle(() => ({ opacity: S.value.lemons }));
  return (
    <Animated.View style={[styles.crate, tip]} pointerEvents="none">
      <ObjectArt parts={CRATE_BACK_ART} tone={TONE} line={1.6} />
      {CRATE_LEMONS.map((c, k) => (
        <Animated.View key={k} style={[styles.rider, { transform: [{ translateX: c.x }, { translateY: c.y }] }, k === 0 ? l0 : l1]}>
          <ObjectArt parts={LEMON_ART} tone={TONE} line={1.2} />
        </Animated.View>
      ))}
      <ObjectArt parts={CRATE_FRONT_ART} tone={TONE} line={1.6} />
    </Animated.View>
  );
}

// ── the things on the counter, and the ones in people's hands ────────────────

function Rider({ at, art, line, lift }: {
  at: { readonly value: { x: number; y: number; o: number; r?: number } }; art: ReturnType<typeof coin>;
  line?: number; lift?: boolean;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} line={line} />
    </Animated.View>
  );
}

function Goods({ S, DP, DA, DM }: {
  S: SharedValue<any>; DP: SharedValue<Bundle>; DA: SharedValue<Bundle>; DM: SharedValue<Bundle>;
}) {
  const at = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
    'worklet';
    const v = w.value[k];
    return { x: v[0].translateX as number, y: v[1].translateY as number };
  };
  const cupP = useDerivedValue(() => {
    const u = S.value.cupT;
    const pt = at(DP, 'wrL');
    const ad = at(DA, 'wrL');
    if (u <= 1) return { x: lerp(FULL_AT.x, pt.x, u), y: lerp(FULL_AT.y, pt.y, u), o: 1 };
    return { x: lerp(pt.x, ad.x, u - 1), y: lerp(pt.y, ad.y, u - 1), o: 1 };
  });
  // The pound: two coins together until the partner parts them.
  const poundAt = (u: number) => {
    'worklet';
    const ad = at(DA, 'wrR');
    const pt = at(DP, 'wrR');
    if (u <= 1) return { x: ad.x, y: ad.y, o: clamp01(u) };
    return { x: lerp(ad.x, pt.x, u - 1), y: lerp(ad.y, pt.y, u - 1), o: 1 };
  };
  const caP = useDerivedValue(() => {
    const u = S.value.ca;
    if (u <= 2) return poundAt(u);
    const pt = at(DP, 'wrR');
    const v = u - 2;
    return { x: lerp(pt.x, TIN_MOUTH.x - 3, v), y: lerp(pt.y, TIN_MOUTH.y + 4, v), o: 1 - clamp01((v - 0.6) / 0.4) };
  });
  const cbP = useDerivedValue(() => {
    const u = S.value.cb;
    if (u <= 2) {
      const q = poundAt(u);
      return { x: q.x + 1.5, y: q.y - 1.5, o: q.o };
    }
    const pt = at(DP, 'wrR');
    const mk = at(DM, 'wrL');
    if (u <= 3) return { x: lerp(pt.x, SLIDE_A.x, u - 2), y: lerp(pt.y, SLIDE_A.y, u - 2), o: 1 };
    if (u <= 4) return { x: lerp(SLIDE_A.x, SLIDE_B.x, u - 3), y: SLIDE_A.y, o: 1 };
    if (u <= 5) return { x: lerp(SLIDE_B.x, mk.x, u - 4), y: lerp(SLIDE_B.y, mk.y, u - 4), o: 1 };
    const v = u - 5;
    return { x: lerp(mk.x, CRATE_MOUTH.x, v), y: lerp(mk.y, CRATE_MOUTH.y + 4, v), o: 1 - clamp01((v - 0.6) / 0.4) };
  });
  const ccP = useDerivedValue(() => {
    const u = S.value.cc;
    const ad = at(DA, 'wrR');
    if (u <= 1) return { x: ad.x, y: ad.y, o: clamp01(u) };
    const v = u - 1;
    return { x: lerp(ad.x, TIN_MOUTH.x + 3, v), y: lerp(ad.y, TIN_MOUTH.y + 4, v), o: 1 - clamp01((v - 0.6) / 0.4) };
  });
  const proofP = useDerivedValue(() => {
    const ad = at(DA, 'wrR');
    return { x: ad.x, y: ad.y, o: clamp01(S.value.proof * 3) };
  });
  const lemon0P = useDerivedValue(() => {
    const u = S.value.lemon0;
    const mk = at(DM, 'wrR');
    return { x: lerp(mk.x, BEHIND.x, u), y: lerp(mk.y, BEHIND.y, u), o: 1 - u };
  });
  const lemon1P = useDerivedValue(() => {
    const u = S.value.lemon1;
    const slot = { x: CRATE.left + CRATE_LEMONS[0].x, y: CRATE.top + CRATE_LEMONS[0].y };
    const back = at(DM, 'wrL');
    const front = at(DM, 'wrR');
    if (u <= 1) return { x: lerp(slot.x, back.x, u), y: lerp(slot.y, back.y, u), o: clamp01(u * 20) };
    if (u <= 2) return { x: lerp(back.x, front.x, u - 1), y: lerp(back.y, front.y, u - 1), o: 1 };
    return { x: lerp(front.x, BEHIND.x, u - 2), y: lerp(front.y, BEHIND.y, u - 2), o: 1 - (u - 2) };
  });
  // The reamer: resting tip-left on the counter, in the maker's back hand, or held
  // between the two of them by its handle.
  const sqzP = useDerivedValue(() => {
    const u = S.value.sqz;
    const g = S.value.tug;
    const back = at(DM, 'wrL');
    const front = at(DM, 'wrR');
    let x = lerp(SQZ_REST.x, back.x, u);
    let y = lerp(SQZ_REST.y, back.y, u);
    x = lerp(x, front.x, g);
    y = lerp(y, front.y, g);
    return { x, y, o: 1, r: 180 + S.value.twist - 14 * g };
  });
  // The jug is held by the left side of its glass, and tips about the hand.
  const jugP = useDerivedValue(() => {
    const u = S.value.jug;
    const h = at(DP, 'wrR');
    return {
      x: lerp(JUG_GRAB.x, h.x, u), y: lerp(JUG_GRAB.y, h.y, u), o: 1, r: TIP_DEG * S.value.tilt,
    };
  });
  const pourSt = useAnimatedStyle(() => {
    const j = jugP.value;
    const a = ((j.r ?? 0) * Math.PI) / 180;
    const lx = j.x + LIP_OFF.x * Math.cos(a) - LIP_OFF.y * Math.sin(a);
    const ly = j.y + LIP_OFF.x * Math.sin(a) + LIP_OFF.y * Math.cos(a);
    const c = cupP.value;
    const bottom = c.y - 4;
    return { opacity: S.value.pour, left: lx - 1, top: ly, height: Math.max(0, bottom - ly) };
  });
  return (
    <>
      <Rider at={jugP} art={JUG_ART} line={1.6} />
      <Animated.View style={[styles.pour, pourSt]} pointerEvents="none" />
      <Rider at={cupP} art={CUP_ART} line={1.3} />
      <Rider at={sqzP} art={REAMER_ART} line={1.3} />
      <Rider at={lemon0P} art={LEMON_ART} line={1.2} />
      <Rider at={lemon1P} art={LEMON_ART} line={1.2} />
      <Rider at={caP} art={COIN_ART} line={1.1} lift />
      <Rider at={cbP} art={COIN_ART} line={1.1} lift />
      <Rider at={ccP} art={COIN_ART} line={1.1} lift />
      <Rider at={proofP} art={COIN_ART} line={1.1} lift />
    </>
  );
}

// ── the stand's chalk sign: the price, the three rows, the price and the rule ─

function Board({ S }: { S: SharedValue<any> }) {
  const price = useAnimatedStyle(() => ({ opacity: clamp01(1 - S.value.board) }));
  const rule = useAnimatedStyle(() => ({ opacity: clamp01(S.value.board - 1) }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.chalkBlock, price]}>
        <Text style={styles.chalkHead}>LEMONADE</Text>
        <Text style={styles.chalkPrice}>£1 A CUP</Text>
      </Animated.View>
      <Animated.View style={[styles.chalkBlock, styles.overlay, rule]}>
        <Text style={styles.chalkHeadSmall}>LEMONADE £1</Text>
        <Text style={styles.chalkRule}>ONE SQUEEZES, ONE SERVES</Text>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: three tags hung from the counter, each with its coins. The profit is what is left. */
const TAG_W = 48;
const TAG_H = 32;
const TALLY_Q = [
  { id: 'paid', l1: 'PAID', l2: 'IN', coins: 2, x: 234, correct: false },
  { id: 'costs', l1: 'LEMONS &', l2: 'SUGAR', coins: 1, x: 283, correct: false },
  { id: 'left', l1: 'LEFT', l2: 'OVER', coins: 1, x: 332, correct: true },
];
const TAG_COIN = tint(coin(4.5, 4.5, 8, 8), 'silver');
function TallyTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TALLY_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.x - TAG_W / 2, top: TOP + 2, width: TAG_W, height: TAG_H }}
        >
          <View style={styles.tag}>
            <View style={styles.tagCoins}>
              {Array.from({ length: q.coins }, (_, k) => (
                <View key={k} style={styles.tagCoin}>
                  <ObjectArt parts={TAG_COIN} tone={TONE} line={1} />
                </View>
              ))}
            </View>
            <Text style={styles.tagText}>{q.l1}</Text>
            <Text style={styles.tagText}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the sign's three rows. One squeezes and one serves: every job has one owner. */
const SPLIT_Q = [
  { id: 'both-squeeze', label: 'BOTH SQUEEZE', correct: false },
  { id: 'one-each', label: 'ONE SQUEEZES, ONE SERVES', correct: true },
  { id: 'both-serve', label: 'BOTH SERVE', correct: false },
];
const ROW_H = SLATE.h / 3;
function SplitTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {SPLIT_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 4, top: SLATE.top + k * ROW_H + 1.5, width: SLATE.w - 8, height: ROW_H - 3 }}
        >
          <View style={styles.choice}>
            <Text style={styles.choiceText}>{q.label}</Text>
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
  onTop: { zIndex: 2 },
  queueCard: {
    position: 'absolute', left: 50, top: 419, width: 56, height: 31,
    alignItems: 'center', justifyContent: 'center',
  },
  queueText: {
    fontFamily: 'Caveat_700Bold', fontSize: 13, lineHeight: 13.5, color: INK, includeFontPadding: false,
  },
  inCoin: {
    position: 'absolute', top: TIN_AT.y - 5, width: 7, height: 3, borderRadius: 1.5,
    backgroundColor: NATURAL.silver.base, borderWidth: 0.8, borderColor: INK,
  },
  lid: {
    position: 'absolute', left: TIN_AT.x - 13, top: TIN_AT.y - 19, width: 26, height: 16, transformOrigin: '50% 100%',
  },
  crate: {
    position: 'absolute', left: CRATE.left, top: CRATE.top, width: CRATE.w, height: CRATE.h, transformOrigin: '100% 100%',
  },
  pour: { position: 'absolute', width: 2, borderRadius: 1, backgroundColor: NATURAL.lemonade.shade },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: DEEP, overflow: 'hidden',
  },
  chalkBlock: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  chalkHead: {
    fontFamily: 'Caveat_700Bold', fontSize: 22, lineHeight: 24, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkPrice: {
    fontFamily: 'Caveat_700Bold', fontSize: 16, lineHeight: 18, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkHeadSmall: {
    fontFamily: 'Caveat_700Bold', fontSize: 18, lineHeight: 20, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkRule: {
    fontFamily: 'Caveat_700Bold', fontSize: 14, lineHeight: 16, color: PAPER_LIT, includeFontPadding: false,
  },
  tag: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 1,
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  tagCoins: { flexDirection: 'row', gap: 1, height: 9, marginBottom: 1 },
  tagCoin: { width: 9, height: 9 },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.6, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  choice: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.1, color: INK, includeFontPadding: false,
  },
});

export function Biz1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz1Scene} band={[306, 514]} camera={CAM} />;
}
