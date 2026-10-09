import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './phil2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import LessonPicture from './LessonPicture';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo, lipsAt, sipHandAt, sipTilt, sipHead } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, fork, teaspoon, cafeCup, saucer, specialsEasel, 
  EASEL_SLATE, CAFE_SIGN, CAFE_LEDGE, CAFE_CUP_GRIP, SAUCER_SIZE,
} from './objects';
import { BY_ID } from './wardrobe';
import { EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-2, "What Makes an Argument Good?" — A PAVEMENT CAFÉ.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The customer (the bun, oblivious) buys carrot
// cake as a health food; the man at the next table (plain, passive-aggressive) has views
// about the icing; the philosopher (the top hat) puts her argument up on the café's
// specials board and shows what makes one good.
//
//   b0   the customer, at the café's serving hatch, takes her slice from the ledge,
//        carries it to her table and sets it down; the man gives his coffee two turns
//        of the spoon, lifts it out and holds it, bowl forward, by its handle.
//   b1   the man counts the layers of icing at her with his teaspoon, then raises it.
//   b2   the philosopher walks in from the left, tips his hat, a hand out to her; the
//        man turns to him.
//   b3   he wipes the specials off the board and chalks her three lines on it, each as
//        it is said.
//   b4   Q1: the three lines are the things to tap.
//   b5   he ticks her two reasons as "true reasons" is said, rules the line under them,
//        and crosses the step down to her conclusion.
//   b6   she eats two forkfuls, tines down into the cake and up to her lips (half the
//        slice goes); the man gives his spoon two shakes at it.
//   b7   the philosopher holds a palm up to the man, then runs a finger down the two
//        reasons.
//   b8   Q2: he wipes the board and chalks three replies — tap one.
//   b9   she points at the board, shrugs with her free hand, and finishes the cake in
//        two forkfuls.
//   b10  at ease under the quotation: the man lays his spoon on the saucer, lifts
//        saucer and cup to his chest, drinks off the saucer (AR3) and holds them there.
//
// COMPOSITION, in stage units. The PHILOSOPHER stands at 40, at the LEFT end of the
// specials EASEL (42–166 × 400–500, slate 49–158 × 421–479), so he faces the board and
// the other two at once (N21) and writes from the end each line starts at: three chalk
// rows at y 431 · 449 · 467, centred on 108, ticks in the gutter left of them (the
// rig's safe reach is ~23 units from a shoulder at y 454 at this scale). The MAN stands
// at 209 at his standing café table (hip height, top at 476), 214–250, his cup on its
// saucer at 219; hers is beside it, 254–290, her plate at 277. The CUSTOMER stands at
// 296, near enough to reach the slice's far end with her fork; the
// CAFÉ FRONT fills the right, 296–400, its awning across the top (312–348), the
// serving hatch 327–392 × 407–465 and its ledge at 464, where her slice waits at 364
// until she takes it. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, philosophy-foundations-2). 0 for a beat with no voice.
 */
const LINES = [5.59, 4.78, 5.3, 7, 0, 4.91, 3.49, 6.45, 0, 5.99, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in, and waiting for an answer.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ORDER = is('order');
const A_SCOFF = is('scoff');
const A_ARRIVE = is('arrive');
const A_CHALK = is('chalk');
const A_FOLLOW = is('follow');
const A_JAB = is('jab');
const A_PERSON = is('person');
const A_CONCEDE = is('concede');
const A_REST = is('rest');
const BOARD_V = BEATS.map((b) => b.board ?? 0);
const LINK = BEATS.map((b) => (b.link ? 1 : 0));
const REPLY = BEATS.map((b) => (b.reply ? 1 : 0));
const LINK_N = LINK.indexOf(1);
const REPLY_N = REPLY.indexOf(1);
const FOLLOW_N = A_FOLLOW.indexOf(1);
const CHALK_N = A_CHALK.indexOf(1);

/** Where each of them stands, beat by beat. The philosopher is off the stage until b2. */
const WO_X = BEATS.map(() => 296);
const WO_START = 340;                       // at the serving hatch when the lesson opens
const MA_X = BEATS.map(() => 209);
const TH_X = BEATS.map((b) => (b.th ? 40 : -40));
/** Seconds into b0 before she sets off from the hatch with her plate. */
const WO_DELAY = BEATS.map((_, n) => (A_ORDER[n] ? 0.34 * LINES[n] : 0));
/**
 * Which way each faces at the end of a beat, and the fraction of the line at which he
 * turns to it. Everyone faces somebody (N21): the customer faces the hatch at the start,
 * then her table, the man, the board and the philosopher, all of which are to her left.
 * The man faces his own cup and her, and turns to the philosopher when he speaks. The
 * philosopher stands at the board's LEFT end, so he faces it and the others at once.
 */
const WO_D0 = 1;
const WO_DE = BEATS.map(() => -1);
const WO_DA = BEATS.map(() => 0);
const MA_D0 = 1;
const MA_DE = [1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, 1];
const MA_DA = [0, 0, 0.05, 0, 0, 0, 0.02, 0.06, 0, 0.04, 0, 0];
const TH_D0 = 1;
const TH_DE = BEATS.map(() => 1);
const TH_DA = BEATS.map(() => 0);
/**
 * What each is doing with his body: talking while he speaks, listening — alive, nodding
 * or leaning in — while he does not (N21), and waiting while the reader answers.
 */
const WO_P = [TALK, NOD, NOD, LEAN, WAIT, NOD, LISTEN, NOD, WAIT, TALK, NOD, WAIT];
const MA_P = [LISTEN, TALK, LEAN, NOD, WAIT, LEAN, TALK, LEAN, WAIT, NOD, NOD, WAIT];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, WAIT, EXPLAIN, NOD, EXPLAIN, WAIT, NOD, NOD, WAIT];

// ── the easel and its slate ──────────────────────────────────────────────────
const EASEL = { x: 104, y: 450, w: 124, h: 100 };
const SL = {
  left: EASEL.x + (EASEL_SLATE.x - EASEL_SLATE.w / 2 - 50) * (EASEL.w / 100),
  top: EASEL.y + (EASEL_SLATE.y - EASEL_SLATE.h / 2 - 50) * (EASEL.h / 100),
  w: EASEL_SLATE.w * (EASEL.w / 100),
  h: EASEL_SLATE.h * (EASEL.h / 100),
};
/**
 * The three chalk rows' centres, and where each line STARTS — the end the philosopher
 * stands at. The rows are centred 4 units right of the slate's middle, which leaves a
 * gutter on the left for the ticks (Caveat 12, measured against the real .ttf).
 */
const ROWS = [431, 449, 467];
const TX = EASEL.x + 4;
const ARG = ['Carrots are healthy.', 'This cake has carrots.', 'So this cake is healthy.'];
const ARG_START = [TX - 85 / 2, TX - 93.1 / 2, TX - 96.2 / 2];
const REPLIES = ['Cake for breakfast?', 'It’s mostly sugar.', 'Everyone orders it.'];
const REPLY_START = [TX - 82.8 / 2, TX - 70.9 / 2, TX - 77.2 / 2];
/** The rule drawn under her two reasons, between the second row and the third. */
const RULE_Y = 458;

// ── the café front, the tables and what is on them ───────────────────────────
const CAFE = { x: 348, y: 403, w: 104, h: 194 };
const SIGN = {
  left: CAFE.x + (CAFE_SIGN.x - CAFE_SIGN.w / 2 - 50) * (CAFE.w / 100),
  top: CAFE.y + (CAFE_SIGN.y - CAFE_SIGN.h / 2 - 50) * (CAFE.h / 100),
  w: CAFE_SIGN.w * (CAFE.w / 100),
  h: CAFE_SIGN.h * (CAFE.h / 100),
};
const LEDGE_TOP = CAFE.y + (CAFE_LEDGE.y - CAFE_LEDGE.h / 2 - 50) * (CAFE.h / 100);
const TABLE_M = 232;                        // the man's table
const TABLE_W = 272;                        // hers, beside it
const TABLE_TOP = 476;
/** The plate: on the hatch's ledge, then on her table. Held by its near rim. */
const PL_LEDGE = { x: 364, y: LEDGE_TOP - 2.7 };
const PL_TABLE = { x: 277, y: TABLE_TOP - 2.7 };
const RIM = 11;
/**
 * His coffee is TWO things (AR3): a china cup on its saucer, so he can lift the two
 * together and drink off the saucer. Both are psych1's cafe drawings at 0.8 of their
 * size, so the cup is about half a head wide. The saucer stands on his table at 219;
 * the cup is drawn about its HANDLE (AR2), which sits CUP_DX right of its body and
 * CUP_DY above its foot.
 */
const CS = 0.8;
const SAU_W = SAUCER_SIZE.w * CS;
const SAU_H = SAUCER_SIZE.h * CS;
const SAU_TOP = SAUCER_SIZE.top * CS - SAU_H / 2;                 // centre to where a cup's foot sits
const SAUCER_ON = { x: 219, y: TABLE_TOP - SAU_H / 2 };
const CUP_W = CAFE_CUP_GRIP.w * CS;
const CUP_H = CAFE_CUP_GRIP.h * CS;
const CUP_DX = (CAFE_CUP_GRIP.x - CAFE_CUP_GRIP.body) * CS;      // body to handle
const CUP_DY = (CAFE_CUP_GRIP.foot - CAFE_CUP_GRIP.y) * CS;      // handle to foot
/** The handle of a cup standing on a saucer whose centre is at (x, y). */
const cupOn = (x: number, y: number) => {
  'worklet';
  return { x: x + CUP_DX, y: y + SAU_TOP - CUP_DY };
};
/** The cup's body on his table: where the spoon goes in to stir. */
const CUP_ON = { x: SAUCER_ON.x, y: TABLE_TOP - 5.6 };
/** The saucer held on his palm at his chest, below the shoulder (AR6), while he drinks and after. */
const SAUCER_HOLD_DX = 13;
const SAUCER_HOLD_Y = 461;
/** The palm under the saucer: the saucer's centre is this far from the wrist. */
const PALM = { dx: 2.5, dy: -2.4 };
/** Where the spoon is laid: on the saucer, beside the cup. */
const SPOON_ON_SAUCER = { dx: -4.6, dy: -1.6, r: 1.45 };
/** How the spoon is held when he is not stirring: by its handle, the bowl forward. */
const SP_REST = 1.25;
/**
 * Her fork: held by the end of its handle, its tines FORK_TIP from her wrist. Upright
 * in her hand at rest, tipped DOWN into the cake, nearly upright at her lips. The
 * windows of a beat's two forkfuls, as fractions of its line: [reach the plate],
 * [up to her lips], [down for the second], [up again], [hand back to rest].
 */
const FORK_TIP = 12.5;
const FORK_UP = 0.5;
const FORK_DOWN = 2.3;
const FORK_LIPS = 0.25;
const CAKE_TOP = 466;
const JAB_W = [0.05, 0.14, 0.16, 0.25, 0.36, 0.48, 0.58, 0.67, 0.76, 0.86];
const CONCEDE_W = [0.52, 0.58, 0.6, 0.68, 0.72, 0.8, 0.86, 0.94, 2, 3];
/** The slice's tip (its cut end, toward her) at a given amount of cake left. */
const tipAt = (c: number) => {
  'worklet';
  return PL_TABLE.x - 11 + 20 * c;
};

const EASEL_ART = specialsEasel(EASEL.x, EASEL.y, EASEL.w, EASEL.h);
// The things that move are drawn about their own centre and carried by a rider.
const CW = 20;
const CH = 13;
const FORK_ART = fork(0, 0, 5, 14);
const SPOON_ART = teaspoon(0, 0, 5, 12);
// drawn about its handle: cafeCup centres on its box, so shift the box by the grip
const CUP_ART = cafeCup((CAFE_CUP_GRIP.w / 2 - CAFE_CUP_GRIP.x) * CS, (CAFE_CUP_GRIP.h / 2 - CAFE_CUP_GRIP.y) * CS, CUP_W, CUP_H);
const SAUCER_ART = saucer(0, 0, SAU_W, SAU_H);

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

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
 * seconds into the beat.
 */
function walkOf(
  src: number, xs: readonly number[], codes: readonly number[], n: number, t: number, b: number,
  delay: number, dStart: number, dEnd: number, turnAt: number,
) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const bw = b - delay;
  const walkU = walking ? ease01(clamp01(bw / walkDur)) : 1;
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? (bw < 0 ? dStart : lerp(facing(dStart, way, bw), dEnd, clamp01((bw - walkDur) / 0.3)))
    : facing(dStart, dEnd, b - turnAt);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}

const CAM = followMoves(WO_X, BEATS.map(kindOf), seedOf('philosophy'));

export default function Phil2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldWo = useHeld();
  const heldTh = useHeld();
  const heldMa = useHeld();
  const cv = useCarry(27);
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

    // ── what is on the board, and on the plate ──────────────────────────────
    const spec = n < CHALK_N ? 1 : n === CHALK_N ? 1 - st(0.13, 0.25) : 0;
    const wipe = n === REPLY_N ? 1 - st(0.03, 0.13) : n > REPLY_N ? 0 : 1;
    const row = (a: number, z: number) => {
      'worklet';
      return n < CHALK_N ? 0 : n === CHALK_N ? st(a, z) : wipe;
    };
    const r1 = row(0.35, 0.5);
    const r2 = row(0.58, 0.71);
    const r3 = row(0.79, 0.93);
    const mark = (a: number, z: number) => {
      'worklet';
      return n < FOLLOW_N ? 0 : n === FOLLOW_N ? st(a, z) : wipe;
    };
    const t1 = mark(0.38, 0.44);
    const t2 = mark(0.48, 0.53);
    const ruleNow = mark(0.62, 0.8);
    const crossNow = mark(0.85, 0.92);
    const reply = (a: number, z: number) => {
      'worklet';
      return n < REPLY_N ? 0 : n === REPLY_N ? st(a, z) : 1;
    };
    const p1 = reply(0.14, 0.2);
    const p2 = reply(0.2, 0.26);
    const p3 = reply(0.26, 0.32);
    // the slice: two forkfuls on b6 and two more on b9
    const cakeNow = n < 6 ? 1
      : A_JAB[n] ? 1 - 0.25 * st(0.12, 0.15) - 0.25 * st(0.46, 0.49)
        : A_CONCEDE[n] ? 0.5 - 0.25 * st(0.57, 0.6) - 0.25 * st(0.79, 0.82)
          : n > 9 ? 0 : 0.5;
    const morselNow = A_JAB[n] ? bp(0.12, 0.15, 0.26) + bp(0.46, 0.49, 0.68)
      : A_CONCEDE[n] ? bp(0.57, 0.6, 0.68) + bp(0.79, 0.82, 0.94) : 0;

    // ── the customer ────────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, WO_START);
    const ww = walkOf(src0, WO_X, WO_P, n, t, b, WO_DELAY[n], n > 0 ? WO_DE[p] : WO_D0, WO_DE[n], WO_DA[n] * L);
    const xWo = carry(cv, 0, n, ww.xp, ww.xn, ww.walking ? ww.walkU : tr);
    const dWo = carry(cv, 3, n, ww.dirV, ww.dirV, trD);
    let sw = ww.s;
    // b0: the plate off the ledge, carried in front of her, set down on her table
    if (A_ORDER[n]) {
      const carryX = xWo + 12 * dWo;
      const tx = lerp(lerp(PL_LEDGE.x - RIM, carryX, st(0.27, 0.34)), PL_TABLE.x + RIM, st(0.62, 0.7));
      const ty = lerp(lerp(PL_LEDGE.y - 1, 461, st(0.27, 0.34)), PL_TABLE.y - 1, st(0.62, 0.7));
      sw = hand(sw, xWo, dWo, 1, tx, ty, st(0.14, 0.23) * (1 - st(0.74, 0.82)));
    }
    // b6, b9: forkfuls of cake (AR5: one path a forkful, never bumps on bumps). The
    // fork is held by the end of its handle: it tips its tines DOWN into the cake at
    // the slice's cut end, and comes up nearly upright to her lips, where her head dips
    // to meet it.
    let forkR = FORK_UP * dWo;
    if (A_JAB[n] || A_CONCEDE[n]) {
      const w = A_JAB[n] ? JAB_W : CONCEDE_W;
      let d = 1 - st(w[2], w[3]);
      d = lerp(d, 1, st(w[4], w[5]));
      d = lerp(d, 0, st(w[6], w[7]));
      const env = st(w[0], w[1]) * (1 - st(w[8], w[9]));
      const c = A_JAB[n] ? lerp(1, 0.75, st(w[3], w[4])) : lerp(0.5, 0.25, st(w[3], w[4]));
      const ds = dWo < 0 ? -1 : 1;
      const rP = FORK_DOWN * ds;
      const rM = FORK_LIPS * ds;
      const lips = lipsAt(sw, { x: xWo, groundY: GROUND, k: K, dir: ds });
      const wPx = tipAt(c) - 2 - FORK_TIP * Math.sin(rP);
      const wPy = CAKE_TOP + FORK_TIP * Math.cos(rP);
      const wMx = lips.x - FORK_TIP * Math.sin(rM);
      const wMy = lips.y + FORK_TIP * Math.cos(rM);
      sw = hand(sw, xWo, dWo, -1, lerp(wMx, wPx, d), lerp(wMy, wPy, d), env);
      sw = sipHead(sw, 0.7 * (1 - d) * env);
      forkR = lerp(FORK_UP * dWo, lerp(rM, rP, d), env);
    }
    if (A_CONCEDE[n]) {
      // a hand to the board (my reasons were fine), a shrug (my conclusion wasn't):
      // her free hand's, palm up IN FRONT of her (she faces left, so in front is -x);
      // the fork hand stays with the cake (AR4, AR5)
      sw = hand(sw, xWo, dWo, 1, xWo - 24, 446, bp(0.1, 0.18, 0.32));
      sw = hand(sw, xWo, dWo, 1, xWo - 14, 444, bp(0.34, 0.41, 0.5));
    }
    const prevWo = carryFrom(heldWo, n, hHold(WO_P[p], t));
    const figWo = keepHeld(heldWo, ww.walking ? mixKeepLegs(prevWo, sw, tr) : mixStance(prevWo, sw, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const wt = walkOf(src1, TH_X, TH_P, n, t, b, 0, n > 0 ? TH_DE[p] : TH_D0, TH_DE[n], TH_DA[n] * L);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    const dTh = carry(cv, 4, n, wt.dirV, wt.dirV, trD);
    let sp = wt.s;
    // b2: he tips his hat once he has arrived, then a hand out to her
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      sp = hand(sp, xTh, dTh, 1, xTh + 5 * dTh, GROUND - 76, bp(after + 0.04, after + 0.12, after + 0.24));
      sp = hand(sp, xTh, dTh, 1, xTh + 22, 452, bp(Math.max(after + 0.26, 0.62), 0.74, 0.96));
    }
    // b3: the specials wiped, then her three lines chalked, from the end he stands at
    if (A_CHALK[n]) {
      // the wipe is one stroke across and back as it goes down the slate (AR5);
      // each line is chalked as a path that travels along it, not a scribble on the clock
      const yW = lerp(ROWS[0], ROWS[2], st(0.12, 0.26));
      const xW = SL.left + 14 + 6 * Math.sin(Math.PI * 2 * stageLin(b, L, 0.12, 0.26));
      const yR = ROWS[0] + (ROWS[1] - ROWS[0]) * st(0.52, 0.58) + (ROWS[2] - ROWS[1]) * st(0.73, 0.79);
      const xR = lerp(lerp(ARG_START[0], ARG_START[1], st(0.52, 0.58)), ARG_START[2], st(0.73, 0.79)) + 3
        + 12 * (stageLin(b, L, 0.35, 0.5) * (1 - st(0.52, 0.58)) + stageLin(b, L, 0.58, 0.71) * (1 - st(0.73, 0.79)) + stageLin(b, L, 0.79, 0.93));
      const k = st(0.27, 0.34);
      sp = hand(sp, xTh, dTh, 1, lerp(xW, xR, k), lerp(yW, yR + 1, k), st(0.1, 0.16) * (1 - st(0.94, 0.99)));
    }
    // b5: a tick by each reason, the rule under them, a cross on the step down
    if (A_FOLLOW[n]) {
      const yF = ROWS[0] + (ROWS[1] - ROWS[0]) * st(0.44, 0.48) + (RULE_Y - ROWS[1]) * st(0.54, 0.6) + (ROWS[2] - RULE_Y) * st(0.8, 0.84);
      const xF = lerp(lerp(lerp(ARG_START[0] - 5, ARG_START[1] - 5, st(0.44, 0.48)), SL.left + 12, st(0.54, 0.6)), ARG_START[2] - 5, st(0.8, 0.84));
      sp = hand(sp, xTh, dTh, 1, xF, yF, st(0.26, 0.33) * (1 - st(0.95, 0.99)));
    }
    // b7: a palm up to the man (the attack is on her), then a tap on each reason
    if (A_PERSON[n]) {
      // one path, not a string of bumps: to the first reason, down to the second, and
      // home again (AR5)
      sp = hand(sp, xTh, dTh, 1, xTh + 20, 444, bp(0.06, 0.14, 0.42));
      const tx = lerp(ARG_START[0] + 3, ARG_START[1] + 3, st(0.67, 0.73));
      const ty = lerp(ROWS[0], ROWS[1], st(0.67, 0.73));
      sp = hand(sp, xTh, dTh, 1, tx, ty, st(0.54, 0.62) * (1 - st(0.84, 0.96)));
    }
    // b8: the board wiped, and three replies chalked
    if (n === REPLY_N) {
      const yW = lerp(ROWS[0], ROWS[2], st(0.02, 0.13));
      const xW = SL.left + 14 + 6 * Math.sin(Math.PI * 2 * stageLin(b, L, 0.02, 0.13));
      const yR = ROWS[0] + (ROWS[1] - ROWS[0]) * st(0.19, 0.21) + (ROWS[2] - ROWS[1]) * st(0.25, 0.27);
      const xR = lerp(lerp(REPLY_START[0], REPLY_START[1], st(0.19, 0.21)), REPLY_START[2], st(0.25, 0.27)) + 3
        + 8 * (stageLin(b, L, 0.15, 0.19) * (1 - st(0.19, 0.21)) + stageLin(b, L, 0.21, 0.25) * (1 - st(0.25, 0.27)) + stageLin(b, L, 0.27, 0.31));
      const k = st(0.13, 0.15);
      sp = hand(sp, xTh, dTh, 1, lerp(xW, xR, k), lerp(yW, yR + 1, k), st(0, 0.03) * (1 - st(0.42, 0.52)));
    }
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, sp, tr) : mixStance(prevTh, sp, tr));

    // ── the man at the next table ───────────────────────────────────────────
    const src2 = carrySource(cv, 2, n, MA_X[0]);
    const wm = walkOf(src2, MA_X, MA_P, n, t, b, 0, n > 0 ? MA_DE[p] : MA_D0, MA_DE[n], MA_DA[n] * L);
    const xMa = carry(cv, 2, n, wm.xp, wm.xn, wm.walking ? wm.walkU : tr);
    const dMa = carry(cv, 5, n, wm.dirV, wm.dirV, trD);
    let sm = wm.s;
    // whenever his spoon is not at work it rests in his hand at his waist, bowl
    // forward, close in front of him: never up by his face while he listens (AR6)
    sm = hand(sm, xMa, dMa, 1, xMa + 7 * dMa, 464, 1);
    // b0: he stirs his coffee — two turns of the spoon round the cup, then he lifts it
    // out and his hand rests (AR5). AP18: the spoon going round IS the action, and it ends.
    if (A_ORDER[n]) {
      const stir = 1.4 * Math.sin(Math.PI * 4 * stageLin(b, L, 0.06, 0.38));
      sm = hand(sm, xMa, dMa, 1, CUP_ON.x + stir, 463, 1 - st(0.42, 0.52));
    }
    // b10: he drinks his coffee the way a person does (AR3). The spoon is laid on the
    // saucer; his left hand lifts the saucer, cup and all, to his chest, his right
    // steadying the cup by its handle; the cup alone goes up to his lips, tips to his
    // face as his head dips to meet it, and comes back down onto the saucer, which he
    // goes on holding, still and close, while the quotation is read (AR6).
    const sipU = A_REST[n] ? st(0.48, 0.54) * (1 - st(0.64, 0.7)) : 0;
    if (A_REST[n]) {
      sm = sipHead(sm, sipU);
      const lift = st(0.22, 0.34);
      const held = { x: xMa + SAUCER_HOLD_DX * dMa + PALM.dx, y: SAUCER_HOLD_Y + PALM.dy };
      const sau = { x: lerp(SAUCER_ON.x, held.x, lift), y: lerp(SAUCER_ON.y, held.y, lift) };
      const grip = cupOn(sau.x, sau.y);
      const spoonAt = {
        x: SAUCER_ON.x + SPOON_ON_SAUCER.dx - 5 * Math.sin(SPOON_ON_SAUCER.r),
        y: SAUCER_ON.y + SPOON_ON_SAUCER.dy + 5 * Math.cos(SPOON_ON_SAUCER.r),
      };
      const lips = sipHandAt(sm, { x: xMa, groundY: GROUND, k: K, dir: dMa < 0 ? -1 : 1 });
      let rx = lerp(spoonAt.x, grip.x, st(0.14, 0.22));
      let ry = lerp(spoonAt.y, grip.y, st(0.14, 0.22));
      const up = st(0.42, 0.5) * (1 - st(0.68, 0.78));
      rx = lerp(rx, lips.x, up);
      ry = lerp(ry, lips.y, up);
      sm = hand(sm, xMa, dMa, 1, rx, ry, st(0, 0.1));
      sm = hand(sm, xMa, dMa, -1, sau.x - PALM.dx, sau.y - PALM.dy, st(0.1, 0.2));
    }
    // b1: the spoon counts the layers — butter, sugar, icing — then a little salute
    if (A_SCOFF[n]) {
      sm = hand(sm, xMa, dMa, 1, 262, 470, bp(0.02, 0.07, 0.13));
      sm = hand(sm, xMa, dMa, 1, 262, 465, bp(0.16, 0.21, 0.27));
      sm = hand(sm, xMa, dMa, 1, 262, 459, bp(0.44, 0.5, 0.58));
      sm = hand(sm, xMa, dMa, 1, xMa + 8 * dMa, 438, bp(0.66, 0.74, 0.94));
    }
    // b6: the spoon waggled at her plate
    // (two shakes of it, then it is held there: AR5)
    if (A_JAB[n]) sm = hand(sm, xMa, dMa, 1, 264 + 4 * Math.sin(Math.PI * 4 * stageLin(b, L, 0.16, 0.5)), 458, bp(0.06, 0.16, 0.92));
    const prevMa = carryFrom(heldMa, n, hHold(MA_P[p], t));
    const figMa = keepHeld(heldMa, wm.walking ? mixKeepLegs(prevMa, sm, tr) : mixStance(prevMa, sm, tr));

    // ── the things that are carried ─────────────────────────────────────────
    // plateT 0 on the ledge · 1 in her hand · 2 on her table
    const plateNow = A_ORDER[n] ? st(0.22, 0.26) + st(0.69, 0.73) : 2;
    // the spoon: bowl down in the cup while he stirs, then held by its handle with the
    // bowl forward; on b10 it is laid on the saucer
    const spRotNow = A_ORDER[n] ? lerp(lerp(SP_REST * dMa, Math.PI, st(0.02, 0.08)), SP_REST * dMa, st(0.42, 0.52)) : SP_REST * dMa;
    const spoonNow = A_REST[n] ? st(0.09, 0.12) : n > 10 ? 1 : 0;
    const saucerNow = A_REST[n] ? st(0.19, 0.22) : n > 10 ? 1 : 0;
    const cupNow = A_REST[n] ? st(0.4, 0.43) * (1 - st(0.76, 0.79)) : 0;
    const ma = pose(figMa, xMa, GROUND, K, dMa, 1);
    const spoonT = carry(cv, 23, n, spoonNow, spoonNow, tr);
    const saucerT = carry(cv, 24, n, saucerNow, saucerNow, tr);
    const cupT = carry(cv, 25, n, cupNow, cupNow, tr);
    const wR = wristOf(ma, 'wrR');
    const wL = wristOf(ma, 'wrL');
    const sau = { x: lerp(SAUCER_ON.x, wL.x + PALM.dx, saucerT), y: lerp(SAUCER_ON.y, wL.y + PALM.dy, saucerT) };
    const sitting = cupOn(sau.x, sau.y);
    const tilt = (sipTilt(sipU, dMa) * Math.PI) / 180;
    const cup = { x: lerp(sitting.x, wR.x, cupT), y: lerp(sitting.y, wR.y, cupT), o: 1, r: tilt };

    return {
      wo: pose(figWo, xWo, GROUND, K, dWo, 1),
      th: pose(figTh, xTh, GROUND, K, dTh, 1),
      ma,
      sau: { x: sau.x, y: sau.y, o: 1, r: 0 },
      cup,
      spoonT,
      dWo,
      forkR: carry(cv, 26, n, forkR, forkR, trD),
      plateT: carry(cv, 6, n, plateNow, plateNow, tr),
      cake: carry(cv, 7, n, cakeNow, cakeNow, tr),
      spec: carry(cv, 8, n, spec, spec, tr),
      r1: carry(cv, 9, n, r1, r1, tr),
      r2: carry(cv, 10, n, r2, r2, tr),
      r3: carry(cv, 11, n, r3, r3, tr),
      t1: carry(cv, 12, n, t1, t1, tr),
      t2: carry(cv, 13, n, t2, t2, tr),
      rule: carry(cv, 14, n, ruleNow, ruleNow, tr),
      cross: carry(cv, 15, n, crossNow, crossNow, tr),
      p1: carry(cv, 16, n, p1, p1, tr),
      p2: carry(cv, 17, n, p2, p2, tr),
      p3: carry(cv, 18, n, p3, p3, tr),
      q1: carry(cv, 19, n, LINK[p], LINK[n], tr),
      q2: carry(cv, 20, n, REPLY[p], REPLY[n], tr) * p3,
      morsel: carry(cv, 21, n, morselNow, morselNow, tr),
      spRot: carry(cv, 22, n, spRotNow, spRotNow, ease01(b / 0.5)),
      board: BOARD_V[n],
    };
  });

  const DW = useDerivedValue<Bundle>(() => SCENE.value.wo);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.ma);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="phil2-cafe" />
      <View style={styles.signBox} pointerEvents="none">
        <Text style={styles.signText}>CAFÉ</Text>
      </View>
      <ObjectArt parts={EASEL_ART} tone={TONE} />
      <Board S={SCENE} />
      <LessonPicture name="phil2-table" />
      <LessonPicture name="phil2-table-w" />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DM} k={K} role="crowd" wear={[]} />
      {/* cast: bun */}
      <Stickman D={DW} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Goods S={SCENE} DW={DW} DM={DM} />
      {on(LINK) ? <RowTargets rows={ARG} correct={2} ids={['carrots', 'hascarrots', 'healthy']} picked={picked} onPick={onPick} live={LINK[i] === 1} S={SCENE} k="q1" /> : null}
      {on(REPLY) ? <RowTargets rows={REPLIES} correct={1} ids={['breakfast', 'sugar', 'everyone']} picked={picked} onPick={onPick} live={REPLY[i] === 1} S={SCENE} k="q2" /> : null}
    </View>
  );
}

// ── the things that are carried: her plate and fork, his spoon ───────

type Pt = { x: number; y: number; o: number; r: number };
function Rider({ at, art, pic, line, lift }: {
  at: SharedValue<Pt>; art?: ReturnType<typeof fork>; pic?: string; line?: number; lift?: boolean;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r}rad` }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      {pic ? <LessonPicture name={pic} /> : <ObjectArt parts={art!} tone={TONE} line={line} />}
    </Animated.View>
  );
}

const wrist = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
};

function Goods({ S, DW, DM }: { S: SharedValue<any>; DW: SharedValue<Bundle>; DM: SharedValue<Bundle> }) {
  // The plate is held by its near rim, so its centre is a rim's width in front of her hand.
  const plateP = useDerivedValue<Pt>(() => {
    const u = S.value.plateT;
    const h = wrist(DW, 'wrR');
    const held = { x: h.x + RIM * S.value.dWo, y: h.y + 1 };
    if (u <= 1) return { x: lerp(PL_LEDGE.x, held.x, u), y: lerp(PL_LEDGE.y, held.y, u), o: 1, r: 0 };
    return { x: lerp(held.x, PL_TABLE.x, u - 1), y: lerp(held.y, PL_TABLE.y, u - 1), o: 1, r: 0 };
  });
  // The fork is in her other hand all lesson, its tines leaning the way she faces.
  const forkP = useDerivedValue<Pt>(() => {
    const h = wrist(DW, 'wrL');
    const r = S.value.forkR;
    return { x: h.x + 6 * Math.sin(r), y: h.y - 6 * Math.cos(r), o: 1, r };
  });
  const morselP = useDerivedValue<Pt>(() => {
    const h = wrist(DW, 'wrL');
    const r = S.value.forkR;
    return { x: h.x + FORK_TIP * Math.sin(r), y: h.y - FORK_TIP * Math.cos(r), o: clamp01(S.value.morsel), r: 0 };
  });
  // The spoon is held by the end of its handle (AR2), its middle 5 along it; on b10
  // it is laid on the saucer and rides there.
  const spoonP = useDerivedValue<Pt>(() => {
    const h = wrist(DM, 'wrR');
    const r = S.value.spRot;
    const u = S.value.spoonT;
    const sa = S.value.sau;
    const hx = h.x + 5 * Math.sin(r);
    const hy = h.y - 5 * Math.cos(r);
    return {
      x: lerp(hx, sa.x + SPOON_ON_SAUCER.dx, u), y: lerp(hy, sa.y + SPOON_ON_SAUCER.dy, u), o: 1,
      r: lerp(r, SPOON_ON_SAUCER.r, u),
    };
  });
  const sauP = useDerivedValue<Pt>(() => S.value.sau);
  const cupP = useDerivedValue<Pt>(() => S.value.cup);
  const cake = useAnimatedStyle(() => ({
    transform: [{ translateX: plateP.value.x - 1 }, { translateY: plateP.value.y - 7.6 }],
  }));
  const clip = useAnimatedStyle(() => ({ width: (CW + 3) * clamp01(S.value.cake) }));
  const cut = useAnimatedStyle(() => ({ opacity: S.value.cake > 0.03 && S.value.cake < 0.97 ? 1 : 0 }));
  const crumbs = useAnimatedStyle(() => ({
    opacity: clamp01((0.3 - S.value.cake) * 5),
    transform: [{ translateX: plateP.value.x }, { translateY: plateP.value.y }],
  }));
  const morsel = useAnimatedStyle(() => ({
    opacity: morselP.value.o,
    transform: [{ translateX: morselP.value.x }, { translateY: morselP.value.y }],
  }));
  return (
    <>
      <Rider at={plateP} pic="phil2-plate" />
      <Animated.View style={[styles.rider, crumbs]} pointerEvents="none">
        <View style={[styles.crumb, { left: -4, top: -3.4 }]} />
        <View style={[styles.crumb, { left: 1, top: -3 }]} />
        <View style={[styles.crumb, { left: 5, top: -3.6 }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, cake]} pointerEvents="none">
        <Animated.View style={[styles.eatenClip, clip]}>
          <View style={styles.eatenOrigin}>
            <LessonPicture name="phil2-cake" />
          </View>
          <Animated.View style={[styles.eatenEdge, cut]} />
        </Animated.View>
      </Animated.View>
      <Rider at={forkP} art={FORK_ART} lift />
      <Animated.View style={[styles.rider, styles.onTop, morsel]} pointerEvents="none">
        <View style={styles.morsel} />
      </Animated.View>
      <Rider at={sauP} art={SAUCER_ART} />
      <Rider at={cupP} art={CUP_ART} />
      <Rider at={spoonP} art={SPOON_ART} lift />
    </>
  );
}

// ── the specials board ───────────────────────────────────────────────────────

function Board({ S }: { S: SharedValue<any> }) {
  const spec = useAnimatedStyle(() => ({ opacity: S.value.spec }));
  const a1 = useAnimatedStyle(() => ({ opacity: S.value.r1 * (1 - S.value.q1) }));
  const a2 = useAnimatedStyle(() => ({ opacity: S.value.r2 * (1 - S.value.q1) }));
  const a3 = useAnimatedStyle(() => ({ opacity: S.value.r3 * (1 - S.value.q1) }));
  const k1 = useAnimatedStyle(() => ({ opacity: S.value.t1, transform: [{ scale: 0.6 + 0.4 * S.value.t1 }] }));
  const k2 = useAnimatedStyle(() => ({ opacity: S.value.t2, transform: [{ scale: 0.6 + 0.4 * S.value.t2 }] }));
  const rule = useAnimatedStyle(() => ({ opacity: S.value.rule > 0.01 ? 1 : 0, transform: [{ scaleX: S.value.rule }] }));
  const cross = useAnimatedStyle(() => ({ opacity: S.value.cross, transform: [{ scale: 0.5 + 0.5 * S.value.cross }] }));
  const b1 = useAnimatedStyle(() => ({ opacity: S.value.p1 * (1 - S.value.q2) }));
  const b2 = useAnimatedStyle(() => ({ opacity: S.value.p2 * (1 - S.value.q2) }));
  const b3 = useAnimatedStyle(() => ({ opacity: S.value.p3 * (1 - S.value.q2) }));
  const arg = [a1, a2, a3];
  const rep = [b1, b2, b3];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, spec]}>
        <Text style={[styles.chalk, { top: ROWS[0] - 7 }]}>Today’s specials</Text>
        <View style={styles.underline} />
        <Text style={[styles.chalk, { top: ROWS[1] - 7 }]}>Carrot cake</Text>
        <Text style={[styles.chalk, { top: ROWS[2] - 7 }]}>Lemon tart</Text>
      </Animated.View>
      {ARG.map((s, k) => (
        <Animated.Text key={s} style={[styles.chalk, { top: ROWS[k] - 7 }, arg[k]]}>{s}</Animated.Text>
      ))}
      <Animated.View style={[styles.tick, { left: ARG_START[0] - 9, top: ROWS[0] - 5 }, k1]}>
        <View style={styles.tickShort} />
        <View style={styles.tickLong} />
      </Animated.View>
      <Animated.View style={[styles.tick, { left: ARG_START[1] - 9, top: ROWS[1] - 5 }, k2]}>
        <View style={styles.tickShort} />
        <View style={styles.tickLong} />
      </Animated.View>
      <Animated.View style={[styles.chalkRule, rule]} />
      <Animated.View style={[styles.cross, { left: ARG_START[2] - 9, top: ROWS[2] - 4.5 }, cross]}>
        <View style={[styles.crossBar, styles.crossA]} />
        <View style={[styles.crossBar, styles.crossB]} />
      </Animated.View>
      {REPLIES.map((s, k) => (
        <Animated.Text key={s} style={[styles.chalk, { top: ROWS[k] - 7 }, rep[k]]}>{s}</Animated.Text>
      ))}
    </View>
  );
}

// ── the two questions: the board's three rows, each on its own card ──────────

const ROW_W = 104;
const ROW_H = 15;
function RowTargets({ rows, ids, correct, picked, onPick, live, S, k }: {
  rows: readonly string[]; ids: readonly string[]; correct: number; picked: string | null;
  onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {rows.map((s, j) => (
        <Target
          key={ids[j]} id={ids[j]} correct={j === correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: EASEL.x - ROW_W / 2, top: ROWS[j] - ROW_H / 2, width: ROW_W, height: ROW_H }}
        >
          <ReplyCard text={s} chosen={picked === ids[j]} right={j === correct} />
        </Target>
      ))}
    </Animated.View>
  );
}

/**
 * A tappable row: a white plate on a hard ledge. Chosen, it reacts with weight: a right
 * answer pops up, squashes and settles (a stamp coming down); a wrong one is knocked
 * sideways twice and sags onto its ledge.
 */
function ReplyCard({ text, chosen, right }: { text: string; chosen: boolean; right: boolean }) {
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  useEffect(() => {
    if (!chosen) return;
    const e = Easing.out(Easing.quad);
    if (right) {
      sx.value = withSequence(withTiming(1.1, { duration: 110, easing: e }), withTiming(0.96, { duration: 110 }), withTiming(1, { duration: 140 }));
      sy.value = withSequence(withTiming(1.18, { duration: 110, easing: e }), withTiming(0.88, { duration: 110 }), withTiming(1, { duration: 140 }));
      dy.value = withSequence(withTiming(-3, { duration: 110, easing: e }), withTiming(1, { duration: 110 }), withTiming(0, { duration: 140 }));
    } else {
      dx.value = withSequence(withTiming(-3, { duration: 60 }), withTiming(3, { duration: 90 }), withTiming(-2, { duration: 80 }), withTiming(1, { duration: 70 }), withTiming(0, { duration: 60 }));
      dy.value = withTiming(1.5, { duration: 200 });
      sy.value = withSequence(withTiming(0.9, { duration: 120 }), withTiming(0.97, { duration: 200 }));
    }
  }, [chosen]);
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }, { scaleX: sx.value }, { scaleY: sy.value }],
  }));
  return (
    <Animated.View style={[styles.card, st]}>
      <Text style={styles.cardText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  signBox: {
    position: 'absolute', left: SIGN.left, top: SIGN.top, width: SIGN.w, height: SIGN.h,
    alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 2, color: INK, includeFontPadding: false,
  },
  chalk: {
    position: 'absolute', left: SL.left + 8, width: SL.w - 8, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 14, color: PAPER_LIT, includeFontPadding: false,
  },
  underline: { position: 'absolute', left: TX - 30, width: 60, top: ROWS[0] + 6.5, height: 1.1, backgroundColor: PAPER_LIT },
  tick: { position: 'absolute', width: 7, height: 7 },
  tickShort: {
    position: 'absolute', left: -0.4, top: 3.6, width: 3.6, height: 1.5, borderRadius: 1, backgroundColor: PAPER_LIT,
    transform: [{ rotate: '45deg' }],
  },
  tickLong: {
    position: 'absolute', left: 1.4, top: 2.2, width: 6.4, height: 1.5, borderRadius: 1, backgroundColor: PAPER_LIT,
    transform: [{ rotate: '-58deg' }],
  },
  chalkRule: {
    position: 'absolute', left: SL.left + 10, width: SL.w - 20, top: RULE_Y - 0.8, height: 1.5, borderRadius: 1,
    backgroundColor: PAPER_LIT, transformOrigin: '0% 50%',
  },
  cross: { position: 'absolute', width: 7, height: 9 },
  crossBar: { position: 'absolute', left: -1, top: 3.8, width: 9, height: 1.7, borderRadius: 1, backgroundColor: EMBER },
  crossA: { transform: [{ rotate: '50deg' }] },
  crossB: { transform: [{ rotate: '-50deg' }] },
  eatenClip: { position: 'absolute', left: -CW / 2 - 1.5, top: -CH / 2 - 2, height: CH + 4, overflow: 'hidden' },
  eatenOrigin: { position: 'absolute', left: CW / 2 + 1.5, top: CH / 2 + 2, width: 0, height: 0 },
  eatenEdge: { position: 'absolute', right: 0, top: 2 + 0.19 * CH, width: 1.1, height: 0.8 * CH, backgroundColor: INK },
  crumb: { position: 'absolute', width: 1.8, height: 1.4, borderRadius: 0.8, backgroundColor: NATURAL.sponge.base },
  morsel: {
    position: 'absolute', left: -1.6, top: -1.4, width: 3.2, height: 2.6, borderRadius: 1.3,
    backgroundColor: NATURAL.sponge.base,
  },
  card: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: Math.min(PLATE_RADIUS, 5), borderWidth: 1.2, borderColor: INK,
    boxShadow: `0 2px 0 ${lipOf(TONE)}`,
  },
  cardText: {
    width: ROW_W - 4, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 14, color: INK, includeFontPadding: false,
  },
});

export function Phil2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil2Scene} band={[306, 514]} camera={CAM} />;
}
