import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './phil1Script';
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
  tint, bicycleWheel, bicycleFrame, repairStand, partsCrateBack, partsCrateFront, repairBill, wallBoard,
  workbench, pegboard, BIKE_AT, STAND_JAWS, WALL_SLATE, BENCH_SPIKE,
} from './objects';
import { BY_ID } from './wardrobe';
import { DEEP, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-1, "What Is Philosophy?" — A BICYCLE WORKSHOP.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The owner (plain) brought in one squeaky
// wheel; the mechanic (the cap, kind) has replaced every part for nothing; the
// philosopher (the top hat) names the question they have walked into.
//
//   b0   the owner walks up to his bicycle, mended on its stand, a hand out at it.
//   b1   the mechanic lays a hand on the new frame, points to the crate of old parts,
//        pats the new saddle and taps the bill on its spike ("No charge"); the job
//        board chalks NEW FRAME and NEW SADDLE under SQUEAKY WHEEL as he names them.
//   b2   the owner gestures from the bicycle to the crate and back.
//   b3   the philosopher walks in from the left and tips his hat; the owner turns.
//   b4   the philosopher points from the bicycle to the crate as he defines it.
//   b5   Q1: the crate, the bike and the bill each wear a question tag — tap one.
//   b6   the mechanic lays his hand on the saddle: "I'd call the bicycle yours."
//   b7   the owner steps to the crate and lifts the old wheel out of it.
//   b8   the philosopher turns a hand to each of them in turn; the wheel held up.
//   b9   Q2: the board is wiped to three rows — tap one.
//   b10  the owner puts the old wheel back and takes his bicycle by the bars; the
//        mechanic pulls the bill off the spike and hands it across the bars; the
//        board chalks WHAT'S FAIR? · WHAT'S REAL? · WHAT DO I OWE? as they are said.
//   b11  at ease under the quotation: the mechanic steps back to his stand, the owner
//        holds his bicycle and reads his bill.
//
// COMPOSITION, in stage units. The bicycle hangs in its repair stand, front to the
// LEFT, its frame laid in a 70-unit square at (248, 458): wheels 214–240 and 256–282,
// hanging 7 units clear of the floor; the bars at (242, 454), the saddle at (261, 455).
// The stand's post rises at 272, its jaws on the seat post. The MECHANIC works from
// behind the bicycle at 278 (drawn before the stand and the frame, so they cross his
// legs); the workbench, at his HIP (top 476), runs 298–394 with the bill on its spike
// at 305; the pegboard of tyres and spanners hangs above it, 298–390 × 350–434. The
// OWNER stands at 134, the open crate of old parts at 156–204 × 468–500 between him and
// the bicycle, the old wheel standing in it at (174, 474). The PHILOSOPHER comes in to
// 64, under the job board hung on its nail, 27–169 × 307–395 (slate 36–160 × 327–388).
// Every hand-off is within the rig's safe reach (~23 units from the shoulder at this
// scale), which is why the mechanic steps round to 252 to pass the bill over the bars.
// Band [302, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 212-unit band: 37%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, philosophy-foundations-1). 0 for a beat with no voice.
 */
const LINES = [2.99, 4.45, 3.82, 6.2, 4.28, 0, 4.71, 3.38, 5.57, 0, 5.95, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in to listen.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ENTER = is('enter');
const A_PARTS = is('parts');
const A_DOUBT = is('doubt');
const A_ARRIVE = is('arrive');
const A_NAME = is('name');
const A_REASON_A = is('reasonA');
const A_REASON_B = is('reasonB');
const A_WEIGH = is('weigh');
const A_LIVE = is('live');
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));
/** The board: 0 the job · 1 the job with the new parts · 2 the three rows (Q2) · 3 the questions we live by. */
const BOARD_V = [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3];
const LIVE_N = A_LIVE.indexOf(1);
const PARTS_N = A_PARTS.indexOf(1);

/** Where each of them stands, beat by beat. The philosopher is off the stage until b3. */
const OW_X = [134, 134, 134, 134, 134, 134, 134, 150, 150, 150, 220, 220, 220];
const PH_X = BEATS.map((b) => (b.th ? 64 : -40));
const ME_X = [278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 252, 278, 278];
/** Seconds into the beat before he sets off: the wheel goes back, the bill comes off the spike. */
const OW_DELAY = BEATS.map((_, n) => (A_LIVE[n] ? 1.3 : 0));
const ME_DELAY = BEATS.map((_, n) => (A_LIVE[n] ? 1.5 : 0));
/** Which way each faces: the owner turns to the philosopher while he first speaks. */
const OW_D = [1, 1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1];
const PH_D = BEATS.map(() => 1);
const ME_D = BEATS.map(() => -1);
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const OW_P = [TALK, LISTEN, TALK, LISTEN, NOD, LISTEN, LEAN, TALK, LISTEN, NOD, LISTEN, NOD, LISTEN];
const ME_P = [LISTEN, TALK, LISTEN, NOD, NOD, LEAN, TALK, LISTEN, NOD, LEAN, LISTEN, NOD, LISTEN];
const PH_P = [LISTEN, LISTEN, LISTEN, EXPLAIN, EXPLAIN, LISTEN, NOD, LEAN, EXPLAIN, LISTEN, EXPLAIN, NOD, LISTEN];

// ── the bicycle on its stand ─────────────────────────────────────────────────
const BIKE = { x: 248, y: 458.4, s: 70 };
/** A point on the frame, from its own 100-unit square to the stage. */
const onBike = (p: { x: number; y: number }) => ({ x: BIKE.x + (p.x - 50) * (BIKE.s / 100), y: BIKE.y + (p.y - 50) * (BIKE.s / 100) });
const FRONT = onBike(BIKE_AT.frontAxle);
const REAR = onBike(BIKE_AT.rearAxle);
const GRIP = onBike(BIKE_AT.grip);
const SADDLE = onBike(BIKE_AT.saddle);
const SEAT = onBike(BIKE_AT.seatPost);
const TUBE = onBike({ x: 60, y: 60.8 });
/** The wheel box: its tyre's centre-line (44 of 100) meets the frame's axle radius. */
const WHEEL_D = (BIKE_AT.wheelR * (BIKE.s / 100)) / 0.44;
/** The stand, square, sized so its jaws close on the seat post and its feet stand on the floor. */
const STAND_S = (GROUND - SEAT.y) / ((98 - STAND_JAWS.y) / 100);
const STAND = { x: SEAT.x - (STAND_JAWS.x - 50) * (STAND_S / 100), y: SEAT.y - (STAND_JAWS.y - 50) * (STAND_S / 100) };

// ── the crate of old parts ───────────────────────────────────────────────────
const CRATE = { x: 180, y: 476, s: 48 };
/** The old wheel standing in it, and the point on its tyre a hand takes. */
const OLD_IN = { x: 174, y: 468 };
const WHEEL_R = WHEEL_D * 0.44;
const OLD_GRAB = { x: OLD_IN.x, y: OLD_IN.y - WHEEL_R };
/** Where the owner holds it up, out at his side. */
const OLD_HOLD = { x: 170, y: 446 };

// ── the workbench, the bill on its spike, the pegboard ───────────────────────
const BENCH = { x: 346, y: 476, w: 96, h: 48 };
const SPIKE = { x: BENCH.x + (BENCH_SPIKE.x - 50) * (BENCH.w / 100), y: BENCH.y + (BENCH_SPIKE.y - 50) * (BENCH.h / 100) };
/** The bill hangs from its top: a hand holds it there, and the spike goes through its middle. */
const BILL_W = 14;
const BILL_H = 20;
const BILL_ON = { x: SPIKE.x, y: SPIKE.y - 5 };
const BILL_TAKE = { x: SPIKE.x - 6, y: BILL_ON.y + 2 };
/** Where the bill crosses the bars from the mechanic's hand to the owner's. */
const PASS = { x: 234, y: 446 };
const BILL_LOW = { x: 228, y: 447 };

// ── the job board on the wall ────────────────────────────────────────────────
const BOARD = { x: 98, y: 351, w: 142, h: 88 };
const SLATE = {
  left: BOARD.x + (WALL_SLATE.x - WALL_SLATE.w / 2 - 50) * (BOARD.w / 100),
  top: BOARD.y + (WALL_SLATE.y - WALL_SLATE.h / 2 - 50) * (BOARD.h / 100),
  w: WALL_SLATE.w * (BOARD.w / 100),
  h: WALL_SLATE.h * (BOARD.h / 100),
};

const BOARD_ART = wallBoard(BOARD.x, BOARD.y, BOARD.w, BOARD.h);
const PEG_ART = pegboard(344, 392, 92, 84);
const BENCH_ART = tint(workbench(BENCH.x, BENCH.y, BENCH.w, BENCH.h), 'wood');
const STAND_ART = tint(repairStand(STAND.x, STAND.y, STAND_S, STAND_S), 'silver');
const FRONT_WHEEL_ART = bicycleWheel(FRONT.x, FRONT.y, WHEEL_D, WHEEL_D);
const REAR_WHEEL_ART = bicycleWheel(REAR.x, REAR.y, WHEEL_D, WHEEL_D);
const FRAME_ART = tint(bicycleFrame(BIKE.x, BIKE.y, BIKE.s, BIKE.s), 'enamel');
const CRATE_BACK_ART = partsCrateBack(CRATE.x, CRATE.y, CRATE.s, CRATE.s);
const CRATE_FRONT_ART = partsCrateFront(CRATE.x, CRATE.y, CRATE.s, CRATE.s);
// The things that move are drawn about their own centre and carried by a rider.
const OLD_WHEEL_ART = tint(bicycleWheel(0, 0, WHEEL_D, WHEEL_D), 'rust');
const BILL_ART = repairBill(0, BILL_H / 2, BILL_W, BILL_H);

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
 * read out of the carry — not from where the script says the last beat left him, so a
 * tap mid-walk never puts him anywhere in one frame (group L). He may wait `delay`
 * seconds before he sets off; he faces the way he goes (C18), then turns to whom the
 * beat has him face.
 */
function walkOf(src: number, xs: readonly number[], ds: readonly number[], codes: readonly number[], n: number, t: number, b: number, delay: number) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const bw = b - delay;
  const walkU = walking ? ease01(clamp01(bw / walkDur)) : 1;
  const dp = n > 0 ? ds[p] : ds[n];
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? (bw < 0 ? dp : lerp(facing(dp, way, bw), ds[n], clamp01((bw - walkDur) / 0.3)))
    : facing(dp, ds[n], b);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}

const CAM = followMoves(OW_X, BEATS.map(kindOf), seedOf('philosophy'));

export default function Phil1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldOw = useHeld();
  const heldPh = useHeld();
  const heldMe = useHeld();
  const cv = useCarry(13);
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

    // ── the owner ───────────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, -24);
    const wo = walkOf(src0, OW_X, OW_D, OW_P, n, t, b, OW_DELAY[n]);
    const xOw = carry(cv, 0, n, wo.xp, wo.xn, wo.walking ? wo.walkU : tr);
    let so = wo.s;
    // b0: a hand out at the bicycle as he arrives — one wheel, that is all
    if (A_ENTER[n]) so = hand(so, xOw, wo.dirV, 1, xOw + 16, GROUND - 58, st(0.72, 0.9));
    // b2: a hand to the bicycle, then to the crate of what used to be it
    if (A_DOUBT[n]) {
      so = hand(so, xOw, wo.dirV, 1, GRIP.x, GRIP.y, bp(0.1, 0.25, 0.55));
      so = hand(so, xOw, wo.dirV, 1, OLD_GRAB.x, OLD_GRAB.y, bp(0.58, 0.72, 0.96));
    }
    // b7: he takes the old wheel by its tyre and lifts it out; b8–b9 he holds it up
    const lift = A_REASON_B[n] ? st(0.3, 0.55) : 1;
    if (A_REASON_B[n]) {
      so = hand(so, xOw, wo.dirV, 1, lerp(OLD_GRAB.x, OLD_HOLD.x, lift), lerp(OLD_GRAB.y, OLD_HOLD.y, lift), st(0.1, 0.26));
    }
    if (n === LIVE_N - 2 || n === LIVE_N - 1) so = hand(so, xOw, wo.dirV, 1, OLD_HOLD.x, OLD_HOLD.y, 1);
    // b10: the wheel back in the crate, then his bicycle by the bars and the bill in
    // his other hand
    if (A_LIVE[n]) {
      const back = st(0.02, 0.12);
      so = hand(so, xOw, wo.dirV, 1, lerp(OLD_HOLD.x, OLD_GRAB.x, back), lerp(OLD_HOLD.y, OLD_GRAB.y, back), 1 - st(0.14, 0.19));
      so = hand(so, xOw, wo.dirV, 1, GRIP.x, GRIP.y, st(0.4, 0.48));
      const low = st(0.68, 0.8);
      so = hand(so, xOw, wo.dirV, -1, lerp(PASS.x, BILL_LOW.x, low), lerp(PASS.y, BILL_LOW.y, low), st(0.55, 0.62));
    }
    if (n > LIVE_N) {
      so = hand(so, xOw, wo.dirV, 1, GRIP.x, GRIP.y, 1);
      so = hand(so, xOw, wo.dirV, -1, BILL_LOW.x, BILL_LOW.y, 1);
    }
    const prevOw = carryFrom(heldOw, n, hHold(OW_P[p], t));
    const figOw = keepHeld(heldOw, wo.walking ? mixKeepLegs(prevOw, so, tr) : mixStance(prevOw, so, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const wp = walkOf(src1, PH_X, PH_D, PH_P, n, t, b, 0);
    const xPh = carry(cv, 1, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    let sp = wp.s;
    // b3: he tips his hat once he has arrived
    if (A_ARRIVE[n]) {
      const after = wp.walkDur / L;
      sp = hand(sp, xPh, wp.dirV, 1, xPh + 5, GROUND - 76, bp(after + 0.04, after + 0.12, after + 0.24));
    }
    // b4: from the bicycle to the crate as he defines it
    if (A_NAME[n]) {
      sp = hand(sp, xPh, wp.dirV, 1, BIKE.x, BIKE.y, bp(0.12, 0.24, 0.5));
      sp = hand(sp, xPh, wp.dirV, 1, CRATE.x, CRATE.y - 8, bp(0.54, 0.66, 0.94));
    }
    // b8: a hand to each of them — the mechanic, then the owner
    if (A_WEIGH[n]) {
      sp = hand(sp, xPh, wp.dirV, 1, 278, GROUND - 60, bp(0.44, 0.54, 0.7));
      sp = hand(sp, xPh, wp.dirV, -1, 150, GROUND - 52, bp(0.58, 0.68, 0.92));
    }
    // b10: up at the board as the questions go on it
    if (A_LIVE[n]) sp = hand(sp, xPh, wp.dirV, 1, SLATE.left + SLATE.w / 2, SLATE.top + SLATE.h / 2, bp(0.32, 0.42, 0.78));
    const prevPh = carryFrom(heldPh, n, hHold(PH_P[p], t));
    const figPh = keepHeld(heldPh, wp.walking ? mixKeepLegs(prevPh, sp, tr) : mixStance(prevPh, sp, tr));

    // ── the mechanic, behind the bicycle ────────────────────────────────────
    const src2 = carrySource(cv, 2, n, ME_X[0]);
    const wm = walkOf(src2, ME_X, ME_D, ME_P, n, t, b, ME_DELAY[n]);
    const xMe = carry(cv, 2, n, wm.xp, wm.xn, wm.walking ? wm.walkU : tr);
    let sm = wm.s;
    // b0: a hand resting on the saddle of the bicycle he has just finished
    if (A_ENTER[n]) sm = hand(sm, xMe, wm.dirV, 1, SADDLE.x, SADDLE.y, 0.75);
    // b1: the new frame, the crate of the old parts, the new saddle, the bill
    if (A_PARTS[n]) {
      sm = hand(sm, xMe, wm.dirV, 1, TUBE.x, TUBE.y, bp(0.1, 0.18, 0.32));
      sm = hand(sm, xMe, wm.dirV, 1, CRATE.x, CRATE.y - 6, bp(0.3, 0.38, 0.5));
      sm = hand(sm, xMe, wm.dirV, 1, SADDLE.x, SADDLE.y, bp(0.5, 0.58, 0.74));
      sm = hand(sm, xMe, wm.dirV, -1, BILL_TAKE.x, BILL_TAKE.y, bp(0.8, 0.88, 0.99));
    }
    // b6: his hand on the saddle — the bicycle is yours
    if (A_REASON_A[n]) sm = hand(sm, xMe, wm.dirV, 1, SADDLE.x, SADDLE.y, st(0.06, 0.18));
    // b10: the bill off the spike, round to the front, across the bars
    if (A_LIVE[n]) {
      const carryIt = st(0.18, 0.24);
      sm = hand(sm, xMe, wm.dirV, -1,
        lerp(BILL_TAKE.x, xMe - 6, carryIt), lerp(BILL_TAKE.y, GROUND - 50, carryIt),
        st(0.04, 0.14) * (1 - st(0.5, 0.56)));
      sm = hand(sm, xMe, wm.dirV, -1, PASS.x, PASS.y, bp(0.5, 0.58, 0.74));
    }
    const prevMe = carryFrom(heldMe, n, hHold(ME_P[p], t));
    const figMe = keepHeld(heldMe, wm.walking ? mixKeepLegs(prevMe, sm, tr) : mixStance(prevMe, sm, tr));

    // ── the things that change hands ────────────────────────────────────────
    // wheelT 0 in the crate · 1 in the owner's hand · 2 back in the crate
    // billT  0 on the spike · 1 in the mechanic's hand · 2 in the owner's
    const wheelNow = A_REASON_B[n] ? st(0.24, 0.28)
      : A_LIVE[n] ? 1 + st(0.11, 0.14)
        : n > LIVE_N ? 2 : n > LIVE_N - 4 ? 1 : 0;
    const billNow = A_LIVE[n] ? st(0.13, 0.16) + st(0.57, 0.61) : n > LIVE_N ? 2 : 0;
    // the job board: the new parts chalked on as the mechanic names them, and the
    // three questions as the philosopher names them
    const frameNow = A_PARTS[n] ? st(0.26, 0.36) : n > PARTS_N ? 1 : 0;
    const saddleNow = A_PARTS[n] ? st(0.56, 0.66) : n > PARTS_N ? 1 : 0;
    const r1 = A_LIVE[n] ? st(0.36, 0.42) : n > LIVE_N ? 1 : 0;
    const r2 = A_LIVE[n] ? st(0.53, 0.59) : n > LIVE_N ? 1 : 0;
    const r3 = A_LIVE[n] ? st(0.65, 0.71) : n > LIVE_N ? 1 : 0;

    return {
      ow: pose(figOw, xOw, GROUND, K, wo.dirV, 1),
      ph: pose(figPh, xPh, GROUND, K, wp.dirV, 1),
      me: pose(figMe, xMe, GROUND, K, wm.dirV, 1),
      wheelT: carry(cv, 3, n, wheelNow, wheelNow, tr),
      billT: carry(cv, 4, n, billNow, billNow, tr),
      frameLine: carry(cv, 5, n, frameNow, frameNow, tr),
      saddleLine: carry(cv, 6, n, saddleNow, saddleNow, tr),
      board: carry(cv, 7, n, BOARD_V[p], BOARD_V[n], tr),
      q1: carry(cv, 8, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 9, n, Q2[p], Q2[n], tr),
      r1: carry(cv, 10, n, r1, r1, tr),
      r2: carry(cv, 11, n, r2, r2, tr),
      r3: carry(cv, 12, n, r3, r3, tr),
    };
  });

  const DO = useDerivedValue<Bundle>(() => SCENE.value.ow);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.me);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={PEG_ART} tone={TONE} />
      <ObjectArt parts={BOARD_ART} tone={TONE} />
      <Board S={SCENE} />
      <ObjectArt parts={BENCH_ART} tone={TONE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: cap */}
      <Stickman D={DM} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <ObjectArt parts={STAND_ART} tone={TONE} />
      <ObjectArt parts={REAR_WHEEL_ART} tone={TONE} line={1.6} />
      <ObjectArt parts={FRONT_WHEEL_ART} tone={TONE} line={1.6} />
      <ObjectArt parts={FRAME_ART} tone={TONE} line={1.8} />
      {/* cast: plain */}
      <Stickman D={DO} k={K} role="lead" wear={[]} />
      <ObjectArt parts={CRATE_BACK_ART} tone={TONE} line={1.8} />
      <OldParts S={SCENE} DO={DO} DM={DM} />
      {on(Q1) ? <AskTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SettleTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the things that are carried: the old wheel and the bill ──────────────────

function Rider({ at, art, tone, line, lift }: {
  at: SharedValue<{ x: number; y: number; o: number }>; art: ReturnType<typeof repairBill>;
  tone: ReturnType<typeof stageTone>; line?: number; lift?: boolean;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={tone} line={line} />
    </Animated.View>
  );
}

function OldParts({ S, DO, DM }: { S: SharedValue<any>; DO: SharedValue<Bundle>; DM: SharedValue<Bundle> }) {
  const at = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
    'worklet';
    const v = w.value[k];
    return { x: v[0].translateX as number, y: v[1].translateY as number };
  };
  // The wheel hangs from the hand that has it by its tyre, so its centre is a
  // radius below the hand.
  const wheelP = useDerivedValue(() => {
    const u = S.value.wheelT;
    const h = at(DO, 'wrR');
    const held = { x: h.x, y: h.y + WHEEL_R };
    if (u <= 1) return { x: lerp(OLD_IN.x, held.x, u), y: lerp(OLD_IN.y, held.y, u), o: 1 };
    return { x: lerp(held.x, OLD_IN.x, u - 1), y: lerp(held.y, OLD_IN.y, u - 1), o: 1 };
  });
  // The bill is held by its top edge.
  const billP = useDerivedValue(() => {
    const u = S.value.billT;
    const me = at(DM, 'wrL');
    const ow = at(DO, 'wrL');
    if (u <= 1) return { x: lerp(BILL_ON.x, me.x, u), y: lerp(BILL_ON.y, me.y, u), o: 1 };
    return { x: lerp(me.x, ow.x, u - 1), y: lerp(me.y, ow.y, u - 1), o: 1 };
  });
  return (
    <>
      <Rider at={wheelP} art={OLD_WHEEL_ART} tone={TONE} line={1.6} />
      <ObjectArt parts={CRATE_FRONT_ART} tone={TONE} line={1.8} />
      <Rider at={billP} art={BILL_ART} tone={TONE} line={1.4} lift />
    </>
  );
}

// ── the job board on the wall ────────────────────────────────────────────────

function Board({ S }: { S: SharedValue<any> }) {
  const job = useAnimatedStyle(() => ({ opacity: clamp01(2 - S.value.board) }));
  const frame = useAnimatedStyle(() => ({ opacity: S.value.frameLine }));
  const saddle = useAnimatedStyle(() => ({ opacity: S.value.saddleLine }));
  const asks = useAnimatedStyle(() => ({ opacity: clamp01(S.value.board - 2) }));
  const a1 = useAnimatedStyle(() => ({ opacity: S.value.r1 }));
  const a2 = useAnimatedStyle(() => ({ opacity: S.value.r2 }));
  const a3 = useAnimatedStyle(() => ({ opacity: S.value.r3 }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.chalkBlock, job]}>
        <Text style={styles.chalk}>SQUEAKY WHEEL</Text>
        <Animated.Text style={[styles.chalk, frame]}>+ NEW FRAME</Animated.Text>
        <Animated.Text style={[styles.chalk, saddle]}>+ NEW SADDLE</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.chalkBlock, styles.overlay, asks]}>
        <Animated.Text style={[styles.chalk, a1]}>WHAT’S FAIR?</Animated.Text>
        <Animated.Text style={[styles.chalk, a2]}>WHAT’S REAL?</Animated.Text>
        <Animated.Text style={[styles.chalk, a3]}>WHAT DO I OWE?</Animated.Text>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: a question tag on each of the three things. Only the bike's can't be settled by looking. */
const TAG_W = 68;
const TAG_H = 26;
const ASK_Q = [
  { id: 'parts', l1: 'HOW MANY', l2: 'PARTS?', left: 141, top: 424, w: TAG_W, tie: { x: 158, y0: 450, y1: 469 }, correct: false },
  { id: 'bike', l1: 'SAME', l2: 'BIKE?', left: 219, top: 418, w: 50, tie: { x: 244, y0: 444, y1: 461 }, correct: true },
  { id: 'bill', l1: 'WHAT DID', l2: 'IT COST?', left: 300, top: 420, w: TAG_W, tie: { x: 306, y0: 446, y1: 452 }, correct: false },
];
function AskTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {ASK_Q.map((q) => (
        <View key={`${q.id}-tie`} pointerEvents="none" style={[styles.tie, { left: q.tie.x - 0.6, top: q.tie.y0, height: q.tie.y1 - q.tie.y0 }]} />
      ))}
      {ASK_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="br"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: TAG_H }}
        >
          <View style={styles.label}>
            <View style={styles.eyelet} />
            <Text style={styles.labelText}>{q.l1}</Text>
            <Text style={styles.labelText}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the board's three rows. The best reason is the one that settles it. */
const SETTLE_Q = [
  { id: 'loud', label: 'THE LOUDEST VOICE', correct: false },
  { id: 'vote', label: 'A SHOW OF HANDS', correct: false },
  { id: 'reason', label: 'THE BEST REASON', correct: true },
];
const ROW_H = SLATE.h / 3;
function SettleTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {SETTLE_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 3, top: SLATE.top + k * ROW_H + 1.5, width: SLATE.w - 6, height: ROW_H - 3 }}
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
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: DEEP, overflow: 'hidden',
  },
  chalkBlock: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  chalk: {
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 18, color: PAPER_LIT, includeFontPadding: false,
  },
  tie: { position: 'absolute', width: 1.2, backgroundColor: INK },
  label: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 6, paddingRight: 2,
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  eyelet: {
    position: 'absolute', left: 3, top: TAG_H / 2 - 3.5, width: 4, height: 4, borderRadius: 2,
    borderWidth: 1, borderColor: INK,
  },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  choice: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.1, color: INK, includeFontPadding: false,
  },
});

export function Phil1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil1Scene} band={[302, 514]} camera={CAM} />;
}
