import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './ethics3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, pose, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing, pickAt,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { attendAt } from './attend';
import {
  leverFrame, balanceStand, table, weightBox, lectern, ruleBook, mirror, lamps, handleAt,
  BOARD, LINE_Y, LINE_X0, POINTS_X, MAIN_X1, BRANCH_Y, BRANCH_UP, FIVE_X, ONE_X, TRAIN_STOP,
  LEVER_X, LEVER_LEN, LEVER_REST, LEVER_PULLED, LEVER_STAND, TABLE, BALANCE, WEIGHT_BOX, LECTERN, BOOK, MIRROR, MIRROR_PLATE,
  LAMPS, LAMP_R,
} from './ethics3Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-3, "What Makes an Action Good?" — A SIGNAL BOX.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest).
// A grave lesson (N11): nothing in it is a gag, and the runaway's lamp on the diagram
// stops short of the points, so it never reaches the five or the one.
//
//   b0   the track diagram lights, and he looks up at it — in front of him.
//   b1   the three plates take their names: MILL, KANT, ARISTOTLE.
//   b2   the runaway's lamp comes down the line and holds short of the points; he puts
//        a hand on the points lever.
//   b3   the branch to the one is marked on the diagram.
//   b4   he lets go; the three plates light one after another.
//   b5   Mill: he takes the lever in both hands and pulls it over, leaning back; the
//        points swing to the branch.
//   b6   one weight sits on the far pan. He goes behind the table to the weight box,
//        lifts out five, carries them back to the near end and sets them on the near
//        pan; the beam swings over and goes down on the side of the five.
//   b7   Kant: he walks back and pushes the lever home, then goes to the lectern.
//   b8   he opens the rule book, and a page turns under his hand. DIGNITY.
//   b9   Aristotle: he walks to the mirror, and there he is in it.   b10  PHRONESIS.
//   b12  Q1: odd one out, ringed where it is in the room.   b13  Q2: TRUE or FALSE lamp.
//
// COMPOSITION, in stage units: the diagram 100–300 × 300–360 on the wall; the lamps at
// 30 and 72, y 318; the points lever in its ground frame at 70; the table 100–180 at
// 470 with the balance at 122 and the weight box at 164; the lectern 244–290 at 458;
// the mirror 336–392 × 380–456. He stands at 52 by the lever, 158 behind the table at
// the box, 84 by the balance, 226 at the lectern, 318 at the mirror, and 292 facing
// back into the room for the two questions. Band [288, 514].
//
// RESTAGED 2026-09-28 so that everything is IN FRONT of him. At the lever he used to
// face left, at a frame by the wall, with the diagram, all three plates and the
// runaway coming down the line behind him; he stands to the left of the lever now and
// faces right into the room. For the questions he turns from the mirror to face the
// things they ask about. The lever is a real railway points lever in a toothed
// quadrant; the weights are knob weights, three with two stacked on them; and the
// mirror shows HIM — the same figure, in the same pose, turned to face him — where it
// showed an ink disc over an ink block. He is in it only while he stands before it.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const IRON = stageToneOf(DEEP);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, ethics-ethics-3. */
const LINES = [3.44, 3.0, 5.32, 5.32, 6.04, 8.0, 7.68, 6.08, 7.6, 5.16, 6.52, 0, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? 318);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_POWER = is('power');
const A_NAMES = is('names');
const A_RUN = is('run');
const A_ROUTE = is('route');
const A_ASK = is('ask');
const A_PULL = is('pull');
const A_WEIGH = is('weigh');
const A_RESET = is('reset');
const A_READ = is('read');
const A_MIRROR = is('mirror');
const A_WISE = is('wise');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const LIT = flag((b) => b.board);
const NAMES = flag((b) => b.names);
const RUNAWAY = flag((b) => b.runaway);
const ROUTE = flag((b) => b.route);
const PULLED = flag((b) => b.pulled);
const WEIGHTS = flag((b) => b.weights);
const OPEN = flag((b) => b.open);
const REFLECT = flag((b) => b.reflect);
const LAMPS_ON = flag((b) => b.lamps);
const GLOSS = BEATS.map((b) => b.gloss ?? 0);
/** The odd-one-out is being answered: a ring finds each thing in the room as it is picked (R7c). */
const ODD = flag((b) => b.interact?.odd);
/** Where each tile's thing is, in the tiles' own order: good, harm, how many, the rule. */
const PICK_X = [BALANCE.x - BALANCE.arm, BALANCE.x + BALANCE.arm, 258, BOOK.x];
const PICK_Y = [456, 450, LINE_Y - 12, BOOK.y];
const PICK_R = [14, 14, 30, 20];
/** Which way he faces once each beat settles: into the room, and back from the mirror for the two questions. */
const DIR = BEATS.map((b) => (b.interact ? -1 : 1));
/** The mirror: where he stands before it, and its middle, which his reflection is placed about. */
const AT_MIRROR = 318;
const MIRROR_CX = (MIRROR.x0 + MIRROR.x1) / 2;

/** b6: to the weight box behind the table, then back to the near end of the balance. */
const BOX_AT = 0.4 + moveTr(LEVER_STAND, 158, TR);
const BACK = BOX_AT + 1.1;
const A6 = BACK + moveTr(158, 84, TR);
const WEIGH_LEGS = [[158, 0.4], [84, BACK]];
const A7 = 0.3 + moveTr(84, LEVER_STAND, TR);
const W7 = A7 + 1.6;
/** b7: the step back to the lever, then along behind the table to the lectern. */
const RESET_LEGS = [[LEVER_STAND, 0.3], [226, W7]];

const TF_Q = [
  { id: 'true', label: 'TRUE', x: LAMPS[0].x, correct: false },
  { id: 'false', label: 'FALSE', x: LAMPS[1].x, correct: true },
];

function hHold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}
function handOn(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
function legAt(b: number, x0: number, legs: readonly (readonly number[])[]): { x: number; from: number; to: number; u: number } {
  'worklet';
  let from = x0;
  for (let k = 0; k < legs.length; k++) {
    const to = legs[k][0];
    const start = legs[k][1];
    const dur = moveTr(from, to, TR);
    if (b < start) return { x: from, from, to: from, u: 1 };
    if (b < start + dur) {
      const u = ease01((b - start) / dur);
      return { x: lerp(from, to, u), from, to, u };
    }
    from = to;
  }
  return { x: from, from, to: from, u: 1 };
}
/** A facing that turns at each key, through a profile, over 0.3 seconds. */
function turnAt(b: number, d0: number, keys: readonly (readonly number[])[]): number {
  'worklet';
  let d = d0;
  for (let k = 0; k < keys.length; k++) d = lerp(d, keys[k][1], ease01(clamp01((b - keys[k][0]) / 0.3)));
  return d;
}
/** The two pans' hanging points, off a beam turned by `deg` (negative: the left end down). */
function panAt(deg: number, side: -1 | 1): { x: number; y: number } {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: BALANCE.x + side * BALANCE.arm * Math.cos(a), y: BALANCE.beamY + side * BALANCE.arm * Math.sin(a) };
}
/** The beam's angle: the one on the far pan from the start, then the five on the near pan (wv 0→1). */
function beamDeg(wv: number): number {
  'worklet';
  return -14 * ((5 * clamp01(wv) - 1) / 5);
}

/** b6: turn to walk to the box, round to carry the weights back, round again to the pan. */
const WEIGH_KEYS = [[0.1, 1], [BOX_AT + 0.8, -1], [A6 - 0.05, 1]];
/** b7: turn to walk back to the lever, and round again to face it — and the lectern beyond — as he arrives. */
const RESET_KEYS = [[0, -1], [A7 - 0.1, 1]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function Ethics3Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(29);
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
    const sec = (a: number, z: number) => {
      'worklet';
      return ease01(clamp01((b - a) / (z - a)));
    };
    const pulse = (a: number, m: number, z: number) => {
      'worklet';
      return sec(a, m) * (1 - sec(m, z));
    };

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const legs = A_WEIGH[n] ? WEIGH_LEGS : A_RESET[n] ? RESET_LEGS : null;
    const leg = legs ? legAt(b, xp, legs) : null;
    const walking = !leg && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const tx = leg ? leg.x : xn;
    const x = n === 0 ? tx : carry(cv, 0, n, xp, tx, walking ? walkU : leg ? 1 : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (leg && leg.u < 1 && leg.to !== leg.from) {
      s = travelStance(leg.from, leg.to, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), leg.u, WALK, 0);
    }
    const was = facing(DIR[p], DIR[p], b);
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    if (A_WEIGH[n]) dirV = turnAt(b, was, WEIGH_KEYS);
    if (A_RESET[n]) dirV = turnAt(b, was, RESET_KEYS);
    const dir = dirV < 0 ? -1 : 1;

    // ── the points lever: a hand on it (b2–b4), pulled (b5), pushed home (b7) ──
    const lever = A_PULL[n] ? sec(1.2, 2.6) : A_RESET[n] ? 1 - sec(A7 + 0.4, A7 + 1.2) : PULLED[n];
    const handle = handleAt(lerp(LEVER_REST, LEVER_PULLED, lever));
    const rest = A_RUN[n] ? sec(1.0, 1.6) : A_ROUTE[n] ? 1 : A_ASK[n] ? 1 - sec(0.2, 0.6) : 0;
    s = handOn(s, x, dir, 1, handle.x, handle.y, rest);
    const grip = A_PULL[n] ? sec(0.3, 0.8) : A_WEIGH[n] ? 1 - sec(0.1, 0.35) : A_RESET[n] ? pulse(A7 + 0.05, A7 + 0.35, A7 + 1.55) : 0;
    s = handOn(s, x, dir, 1, handle.x, handle.y - 1, grip);
    s = handOn(s, x, dir, -1, handle.x + 3, handle.y + 3, grip);
    // leaning back into the pull, forward into the push
    const lean = (A_PULL[n] ? pulse(1.2, 2.2, 4.2) : 0) - (A_RESET[n] ? pulse(A7 + 0.4, A7 + 0.9, A7 + 1.4) : 0);
    s = { ...s, tilt: s.tilt + 0.1 * lean };
    // looking up at the diagram as it lights (b0)
    s = { ...s, neck: s.neck + 0.22 * (A_POWER[n] ? pulse(0.3, 1.0, 3.2) : 0) };

    // ── the weights (b6): five out of the box, carried back and set on the near pan ──
    const wv = A_WEIGH[n] ? sec(A6 + 0.5, A6 + 0.65) : WEIGHTS[n];
    const left = panAt(beamDeg(wv), -1);
    const box = { x: WEIGHT_BOX.x, y: WEIGHT_BOX.top + 2 };
    const take = A_WEIGH[n] ? sec(BOX_AT + 0.05, BOX_AT + 0.3) * (1 - sec(BOX_AT + 0.55, BOX_AT + 0.8)) : 0;
    s = handOn(s, x, dir, 1, box.x, box.y - 6 * sec(BOX_AT + 0.35, BOX_AT + 0.6), take);
    const set = A_WEIGH[n] ? sec(A6 + 0.1, A6 + 0.35) * (1 - sec(A6 + 0.7, A6 + 1.0)) : 0;
    s = handOn(s, x, dir, 1, left.x, left.y + BALANCE.string - 4, set);
    const h5 = A_WEIGH[n] ? sec(BOX_AT + 0.3, BOX_AT + 0.4) * (1 - sec(A6 + 0.5, A6 + 0.55)) : 0;

    // ── the rule book (b8): the cover lifted, then a hand on the page ────────
    const lift = A_READ[n] ? pulse(0.5, 0.9, 1.4) : 0;
    s = handOn(s, x, dir, 1, lerp(BOOK.x - 12, BOOK.x - 4, sec(0.8, 1.3)), BOOK.y - 4 - 6 * sec(0.8, 1.05), lift);
    const onPage = A_READ[n] ? sec(1.4, 1.8) * (1 - sec(6.4, 6.9)) : 0;
    s = handOn(s, x, dir, 1, BOOK.x - 6 + 4 * pulse(3.2, 3.6, 4.0), BOOK.y - 3, onPage);
    // ── a hand to his chest before the mirror (b10) ─────────────────────────
    const heart = A_WISE[n] ? pulse(2.0, 2.6, 5.4) : 0;
    s = mixStance(s, { ...s, fistR: { x: 5, y: -30 } }, heart);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the diagram ──────────────────────────────────────────────────────────
    const lit = A_POWER[n] ? sec(0.3, 1.2) : LIT[n];
    const run = A_RUN[n] ? sec(0.8, 3.4) : RUNAWAY[n];
    const runShow = A_RUN[n] ? sec(0.3, 0.7) : RUNAWAY[n];
    const route = A_ROUTE[n] ? st(0.1, 0.35) : ROUTE[n];
    const blade = A_PULL[n] ? sec(2.0, 2.5) : A_RESET[n] ? 1 - sec(A7 + 0.8, A7 + 1.2) : PULLED[n];
    const one = A_ROUTE[n] ? pulse(1.6, 2.2, 3.6) : 0;

    // ── the plates ───────────────────────────────────────────────────────────
    const n0 = A_NAMES[n] ? sec(0.2, 0.8) : NAMES[n];
    const n1 = A_NAMES[n] ? sec(0.9, 1.5) : NAMES[n];
    const n2 = A_NAMES[n] ? sec(1.6, 2.2) : NAMES[n];
    const g0 = A_WEIGH[n] ? sec(A6 + 1.1, A6 + 1.6) : GLOSS[n] >= 1 ? 1 : 0;
    const g1 = A_READ[n] ? sec(2.4, 2.9) : GLOSS[n] >= 2 ? 1 : 0;
    const g2 = A_WISE[n] ? sec(1.0, 1.5) : GLOSS[n] >= 3 ? 1 : 0;
    const glow0 = A_ASK[n] ? pulse(0.8, 1.3, 2.1) : A_PULL[n] ? pulse(3.0, 3.6, 5.0) : 0;
    const glow1 = A_ASK[n] ? pulse(2.3, 2.8, 3.6) : A_RESET[n] ? pulse(W7 + 0.5, W7 + 1.0, W7 + 1.6) : 0;
    const glow2 = A_ASK[n] ? pulse(3.8, 4.3, 5.1) : A_MIRROR[n] ? pulse(2.4, 3.0, 3.8) : 0;

    // ── the book, the mirror ────────────────────────────────────────────────
    const open = A_READ[n] ? sec(0.85, 1.3) : OPEN[n];
    const page = A_READ[n] ? sec(3.2, 4.0) : 0;
    const reflect = A_MIRROR[n] ? sec(1.4, 2.3) : REFLECT[n];
    const glint = A_WISE[n] ? sec(3.0, 4.4) : 0;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening in the signal box, when it happens — keyed on the same
    // seconds and stages the scene already acts on — and at nothing (weight 0, his
    // pose's own head) once it is done. A grave lesson (N11): each person on the
    // diagram is looked at once, softly, and not dwelt on; when the one is named he
    // looks down at the lever under his hand.
    // Since the restaging he faces right at the lever, so the diagram and the three
    // plates are in front of him there.
    const boardX = (BOARD.x0 + BOARD.x1) / 2;
    const boardY = (BOARD.top + BOARD.bottom) / 2;
    const millY = 383;                                           // styles.millPlate top 370 + half its 26
    const kantX = (LECTERN.x0 + LECTERN.x1) / 2;
    const kantY = 481;                                           // styles.kantPlate top 468 + half its 26
    const arisX = (MIRROR_PLATE.x0 + MIRROR_PLATE.x1) / 2;
    const arisY = (MIRROR_PLATE.top + MIRROR_PLATE.bottom) / 2;
    const mirX = (MIRROR.x0 + MIRROR.x1) / 2;
    const mirY = (MIRROR.top + MIRROR.bottom) / 2;
    const LK = A_POWER[n] ? [0.3, boardX, boardY, 1, 3.2, 0, 0, 0]
      : A_NAMES[n] ? [0.2, BALANCE.x, millY, 1, 0.9, kantX, kantY, 1, 1.6, arisX, arisY, 1, 3.2, 0, 0, 0]
      : A_RUN[n] ? [0.3, LINE_X0, LINE_Y, 1, 0.8, lerp(LINE_X0, TRAIN_STOP, run), LINE_Y, 1, 2.0, FIVE_X[2], LINE_Y, 0.85, 3.9, handle.x, handle.y, 1, L + 0.5, 0, 0, 0]
      : A_ROUTE[n] ? [L * 0.1, (BRANCH_UP.x1 + MAIN_X1) / 2, BRANCH_Y, 1, 1.6, ONE_X, BRANCH_Y, 0.85, 3.9, handle.x, handle.y, 0.8, L + 0.5, 0, 0, 0]
      : A_ASK[n] ? [0.8, BALANCE.x, millY, 1, 2.3, kantX, kantY, 1, 3.8, arisX, arisY, 1, 5.4, 0, 0, 0]
      : A_PULL[n] ? [0.2, handle.x, handle.y, 1, 2.0, POINTS_X, LINE_Y, 1, 3.0, BALANCE.x, millY, 0.9, 5.2, 0, 0, 0]
      : A_WEIGH[n] ? [0.3, WEIGHT_BOX.x, WEIGHT_BOX.top, 1, BOX_AT + 0.8, left.x, left.y + BALANCE.string, 1, A6 + 0.6, BALANCE.x, BALANCE.beamY, 1, A6 + 1.1, BALANCE.x, millY, 1, A6 + 2.6, 0, 0, 0]
      : A_RESET[n] ? [0.2, handle.x, handle.y, 1, A7 + 0.8, POINTS_X, LINE_Y, 0.8, W7 - 0.2, kantX, LECTERN.top, 0.9, W7 + 0.5, kantX, kantY, 1, W7 + 1.8, BOOK.x, BOOK.y, 0.8, L + 0.4, 0, 0, 0]
      : A_READ[n] ? [0.3, BOOK.x - 8, BOOK.y - 4, 1, 2.4, kantX, kantY, 0.9, 3.1, BOOK.x, BOOK.y - 3, 1, 6.9, 0, 0, 0]
      : A_MIRROR[n] ? [0.2, mirX, mirY, 0.8, 2.4, arisX, arisY, 1, 3.8, mirX, mirY, 1, L + 0.6, 0, 0, 0]
      : A_WISE[n] ? [1.0, arisX, arisY, 1, 2.0, x + 4 * dir, GROUND - 58, 0.6, 3.0, mirX, mirY, 1, 5.6, arisX, arisY, 0.9, L + 0.5, 0, 0, 0]
      : ODD[n] ? [0.3, pickAt(PICK_X, pickPos.value), pickAt(PICK_Y, pickPos.value), 0.6]
      : LAMPS_ON[n] ? [0.3, (LAMPS[0].x + LAMPS[1].x) / 2, LAMPS[0].y, 0.6]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    // HIS REFLECTION: the same figure in the same pose, turned to face him, placed
    // about the mirror's middle; it slides out of the glass and is gone as he walks
    // away from the mirror, and is there only while he stands before it.
    const near = clamp01(1 - Math.abs(x - AT_MIRROR) / 22);
    const refX = MIRROR_CX + (AT_MIRROR - x) * 1.4;
    return {
      mirrorFig: pose(fig, refX, GROUND, K_M, -dirV, reflect * near),
      fig: lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 26, n, lk.x, lk.x, tr), carry(cv, 27, n, lk.y, lk.y, tr), carry(cv, 28, n, 0, lk.w, tr)),
      lit: carry(cv, 1, n, LIT[p], lit, tr),
      n0: carry(cv, 2, n, NAMES[p], n0, tr),
      n1: carry(cv, 3, n, NAMES[p], n1, tr),
      n2: carry(cv, 4, n, NAMES[p], n2, tr),
      run: carry(cv, 5, n, RUNAWAY[p], run, tr),
      runShow: carry(cv, 6, n, RUNAWAY[p], runShow, tr),
      route: carry(cv, 7, n, ROUTE[p], route, tr),
      lever: carry(cv, 8, n, PULLED[p], lever, tr),
      blade: carry(cv, 9, n, PULLED[p], blade, tr),
      blink: carry(cv, 10, n, A_ROUTE[p] || A_ASK[p] ? 1 : 0, A_ROUTE[n] || A_ASK[n] ? 1 : 0, tr),
      wv: carry(cv, 11, n, WEIGHTS[p], wv, tr),
      h5: carry(cv, 12, n, 0, h5, tr),
      open: carry(cv, 14, n, OPEN[p], open, tr),
      page: carry(cv, 15, n, 0, page, tr),
      reflect: carry(cv, 16, n, REFLECT[p], reflect, tr),
      g0: carry(cv, 17, n, GLOSS[p] >= 1 ? 1 : 0, g0, tr),
      g1: carry(cv, 18, n, GLOSS[p] >= 2 ? 1 : 0, g1, tr),
      g2: carry(cv, 19, n, GLOSS[p] >= 3 ? 1 : 0, g2, tr),
      glow0: carry(cv, 20, n, 0, glow0, tr),
      glow1: carry(cv, 21, n, 0, glow1, tr),
      glow2: carry(cv, 22, n, 0, glow2, tr),
      one: carry(cv, 23, n, 0, one, tr),
      glint: carry(cv, 24, n, 0, glint, tr),
      ring: carry(cv, 25, n, 0, ODD[n], tr),
      lamps: carry(cv, 13, n, LAMPS_ON[p], LAMPS_ON[n], tr),
      ringX: ODD[n] ? pickAt(PICK_X, pickPos.value) : PICK_X[0],
      ringY: ODD[n] ? pickAt(PICK_Y, pickPos.value) : PICK_Y[0],
      ringR: ODD[n] ? pickAt(PICK_R, pickPos.value) : PICK_R[0],
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.mirrorFig);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
      </View>
      <Diagram S={SCENE} />
      <ObjectArt parts={LAMPS_ART} tone={IRON} />
      <Lamps S={SCENE} />
      {on(NAMES) ? <WallPlate S={SCENE} /> : null}
      <ObjectArt parts={MIRROR_ART} tone={WOOD} />
      <Glass S={SCENE} DM={DM} />
      <ObjectArt parts={LECTERN_ART} tone={WOOD} />
      <Book S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_M} />
      {/* the lever stands in the floor in front of him: he walks behind it, and works it from its left */}
      <SetArt parts={FRAME_ART} tone={IRON} line={1.8} />
      <PointsLever S={SCENE} />
      <ObjectArt parts={TABLE_ART} tone={WOOD} />
      <ObjectArt parts={STAND_ART} tone={IRON} />
      <Balance S={SCENE} DF={DF} />
      <ObjectArt parts={BOX_ART} tone={WOOD} />
      {on(NAMES) ? <StandPlates S={SCENE} /> : null}
      {LAMPS_ON[i] ? <TrueFalse picked={picked} onPick={onPick} S={SCENE} /> : null}
      {on(ODD) ? <PickRing S={SCENE} /> : null}
    </View>
  );
}

const LAMPS_ART = lamps();
const MIRROR_ART = mirror();
const FRAME_ART = leverFrame();
const LECTERN_ART = lectern();
const TABLE_ART = table();
const STAND_ART = balanceStand();
const BOX_ART = weightBox();
const BOOK_ART = ruleBook();

// ── the track diagram ─────────────────────────────────────────────────────────

/** A straight piece of track on the diagram, from one point to another. */
function seg(x0: number, y0: number, x1: number, y1: number) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const deg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return {
    left: (x0 + x1) / 2 - len / 2 - BOARD.x0, top: (y0 + y1) / 2 - 1 - BOARD.top, width: len,
    transform: [{ rotate: `${deg}deg` }],
  };
}
const SEG_IN = seg(LINE_X0, LINE_Y, POINTS_X, LINE_Y);
const SEG_MAIN = seg(POINTS_X + 12, LINE_Y, MAIN_X1, LINE_Y);
const SEG_UP = seg(BRANCH_UP.x0, LINE_Y - 4, BRANCH_UP.x1, BRANCH_Y);
const SEG_BRANCH = seg(BRANCH_UP.x1, BRANCH_Y, MAIN_X1, BRANCH_Y);

function Diagram({ S }: { S: SharedValue<any> }) {
  const lines = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * S.value.lit }));
  const main = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * S.value.blade }));
  const branch = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * S.value.blade }));
  // it blinks while it is being pointed out (b3, b4), and holds steady after that
  const route = useAnimatedStyle(() => ({ opacity: S.value.route * (1 - S.value.blade) * (0.75 + 0.25 * S.value.blink * Math.sin(S.value.t * 4)) }));
  const blade = useAnimatedStyle(() => ({ transform: [{ rotate: `${-40 * S.value.blade}deg` }] }));
  const runaway = useAnimatedStyle(() => ({
    opacity: S.value.runShow * (0.7 + 0.3 * Math.sin(S.value.t * 6)),
    transform: [{ translateX: lerp(LINE_X0, TRAIN_STOP, S.value.run) - BOARD.x0 - 5 }],
  }));
  const one = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.5 * S.value.one }] }));
  return (
    <View style={styles.board} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, lines]}>
        <View style={[styles.track, SEG_IN]} />
        <Animated.View style={[styles.track, SEG_MAIN, main]} />
        <Animated.View style={[styles.track, SEG_UP, branch]} />
        <Animated.View style={[styles.track, SEG_BRANCH, branch]} />
        <Animated.View style={[styles.bladeArm, blade]} />
        {FIVE_X.map((fx) => <View key={fx} style={[styles.dot, { left: fx - 3 - BOARD.x0, top: LINE_Y - 3 - BOARD.top }]} />)}
        <Animated.View style={[styles.dot, { left: ONE_X - 3 - BOARD.x0, top: BRANCH_Y - 3 - BOARD.top }, one]} />
        <Text style={[styles.boardText, { left: FIVE_X[2] - 10 - BOARD.x0, top: LINE_Y + 4 - BOARD.top }]} numberOfLines={1}>5</Text>
        <Text style={[styles.boardText, { left: ONE_X - 10 - BOARD.x0, top: BRANCH_Y - 15 - BOARD.top }]} numberOfLines={1}>1</Text>
      </Animated.View>
      <Animated.View style={[styles.routeMark, SEG_UP, route]} />
      <Animated.View style={[styles.routeMark, SEG_BRANCH, route]} />
      <Animated.View style={[styles.runaway, runaway]} />
    </View>
  );
}

// ── the two repeater lamps ────────────────────────────────────────────────────

function Lamps({ S }: { S: SharedValue<any> }) {
  const lens = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * S.value.lamps }));
  return (
    <>
      {LAMPS.map((l) => (
        <Animated.View key={l.x} style={[styles.lens, { left: l.x - LAMP_R + 3, top: l.y - LAMP_R + 3 }, lens]} pointerEvents="none" />
      ))}
    </>
  );
}

// ── the points lever ─────────────────────────────────────────────────────────

/**
 * The points lever: a long black lever, tapering to a polished grip, with the spring
 * catch-rod up its side and the catch handle under the grip — the shape every real
 * one has (Wikimedia Commons, "Coombe No. 2 Ground Frame").
 */
function PointsLever({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${lerp(LEVER_REST, LEVER_PULLED, S.value.lever)}deg` }] }));
  return (
    <Animated.View style={[styles.lever, st]} pointerEvents="none">
      <View style={styles.leverShaft} />
      <View style={styles.catchRod} />
      <View style={styles.catchHandle} />
      <View style={styles.leverGrip} />
    </Animated.View>
  );
}

// ── the balance, and the weights in his hand or on its pans ──────────────────

function Balance({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  const beam = useAnimatedStyle(() => ({ transform: [{ rotate: `${beamDeg(S.value.wv)}deg` }] }));
  const panL = useAnimatedStyle(() => {
    const e = panAt(beamDeg(S.value.wv), -1);
    return { transform: [{ translateX: e.x }, { translateY: e.y }] };
  });
  const panR = useAnimatedStyle(() => {
    const e = panAt(beamDeg(S.value.wv), 1);
    return { transform: [{ translateX: e.x }, { translateY: e.y }] };
  });
  const five = useAnimatedStyle(() => {
    const e = panAt(beamDeg(S.value.wv), -1);
    const w = DF.value.wrR;
    const h = S.value.h5;
    return {
      opacity: Math.max(h, clamp01(S.value.wv)),
      transform: [
        { translateX: lerp(e.x, w[0].translateX, h) },
        { translateY: lerp(e.y + BALANCE.string, w[1].translateY + 4, h) },
      ],
    };
  });
  const single = useAnimatedStyle(() => {
    const e = panAt(beamDeg(S.value.wv), 1);
    return { transform: [{ translateX: e.x }, { translateY: e.y + BALANCE.string }] };
  });
  return (
    <>
      <Animated.View style={[styles.beam, beam]} pointerEvents="none" />
      <Animated.View style={[styles.rider, panL]} pointerEvents="none">
        <View style={styles.string} />
        <View style={styles.pan} />
      </Animated.View>
      <Animated.View style={[styles.rider, panR]} pointerEvents="none">
        <View style={styles.string} />
        <View style={styles.pan} />
      </Animated.View>
      <Animated.View style={[styles.rider, five]} pointerEvents="none">
        {[0, 1, 2].map((k) => <KnobWeight key={k} left={-11 + k * 7.5} top={-6} />)}
        {[0, 1].map((k) => <KnobWeight key={k} left={-7.2 + k * 7.5} top={-14} />)}
      </Animated.View>
      <Animated.View style={[styles.rider, single]} pointerEvents="none">
        <KnobWeight left={-3.5} top={-6} />
      </Animated.View>
    </>
  );
}

/** A knob weight, the kind a pan balance is sold with: a short cylinder with a knob to lift it by. */
function KnobWeight({ left, top }: { left: number; top: number }) {
  return (
    <View style={{ position: 'absolute', left, top }}>
      <View style={styles.weightKnob} />
      <View style={styles.weight}>
        <View style={styles.weightLit} />
      </View>
    </View>
  );
}

// ── the rule book, closed and then open ──────────────────────────────────────

function Book({ S }: { S: SharedValue<any> }) {
  const closed = useAnimatedStyle(() => ({ opacity: 1 - S.value.open }));
  const opened = useAnimatedStyle(() => ({ opacity: S.value.open }));
  const leaf = useAnimatedStyle(() => ({
    opacity: S.value.page > 0.02 && S.value.page < 0.98 ? 1 : 0,
    transform: [{ scaleX: Math.cos(Math.PI * S.value.page) }],
  }));
  return (
    <>
      <Animated.View style={[styles.closedBook, closed]} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, opened]} pointerEvents="none">
        <ObjectArt parts={BOOK_ART} tone={WOOD} />
      </Animated.View>
      <Animated.View style={[styles.leaf, leaf]} pointerEvents="none" />
    </>
  );
}

// ── the mirror's glass, and him in it ────────────────────────────────────────

function Glass({ S, DM }: { S: SharedValue<any>; DM: SharedValue<Bundle> }) {
  const glint = useAnimatedStyle(() => ({
    opacity: Math.sin(Math.PI * S.value.glint) * 0.8,
    transform: [{ translateX: -30 + 90 * S.value.glint }, { rotate: '25deg' }],
  }));
  return (
    <View style={styles.glass} pointerEvents="none">
      {/* the reflection is posed in stage units, so it is laid out in a stage-sized
          layer offset back by the glass's own position and clipped by the glass */}
      <View style={styles.inGlass}>
        <Stickman D={DM} k={K_M} />
      </View>
      <View style={styles.glassTint} />
      <Animated.View style={[styles.glint, glint]} />
    </View>
  );
}

// ── the three plates: on the wall over the balance, on the lectern, under the mirror ──

function PlateRows({ S, k, name, gloss }: { S: SharedValue<any>; k: 0 | 1 | 2; name: string; gloss: string }) {
  const nameSt = useAnimatedStyle(() => {
    const g = k === 0 ? S.value.g0 : k === 1 ? S.value.g1 : S.value.g2;
    return { transform: [{ translateY: 5 * (1 - g) }] };
  });
  const glossSt = useAnimatedStyle(() => ({ opacity: k === 0 ? S.value.g0 : k === 1 ? S.value.g1 : S.value.g2 }));
  return (
    <>
      <Animated.Text style={[styles.plateName, nameSt]} numberOfLines={1}>{name}</Animated.Text>
      <Animated.Text style={[styles.plateGloss, glossSt]} numberOfLines={1}>{gloss}</Animated.Text>
    </>
  );
}
function WallPlate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.n0, transform: [{ scale: 1 + 0.08 * S.value.glow0 }] }));
  return (
    <Animated.View style={[styles.plate, styles.millPlate, st]} pointerEvents="none">
      <PlateRows S={S} k={0} name="MILL" gloss="5 LIVES > 1" />
    </Animated.View>
  );
}
function StandPlates({ S }: { S: SharedValue<any> }) {
  const kant = useAnimatedStyle(() => ({ opacity: S.value.n1, transform: [{ scale: 1 + 0.08 * S.value.glow1 }] }));
  const aris = useAnimatedStyle(() => ({ opacity: S.value.n2, transform: [{ scale: 1 + 0.08 * S.value.glow2 }] }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.kantPlate, kant]} pointerEvents="none">
        <PlateRows S={S} k={1} name="KANT" gloss="DIGNITY" />
      </Animated.View>
      <Animated.View style={[styles.plate, styles.arisPlate, aris]} pointerEvents="none">
        <PlateRows S={S} k={2} name="ARISTOTLE" gloss="PHRONESIS" />
      </Animated.View>
    </>
  );
}

// ── Q1: the thing picked is ringed where it is in the room ──────────────────

function PickRing({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.ringR;
    return {
      opacity: S.value.ring * (0.75 + 0.25 * Math.sin(S.value.t * 4)),
      width: 2 * r, height: 2 * r, borderRadius: r,
      transform: [{ translateX: S.value.ringX - r }, { translateY: S.value.ringY - r }],
    };
  });
  return <Animated.View style={[styles.pickRing, st]} pointerEvents="none" />;
}

// ── Q2: the two lamps, TRUE and FALSE ───────────────────────────────────────

function TrueFalse({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.lamps }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TF_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.tf, { left: q.x - 20, top: LAMPS[0].y - LAMP_R - 2 }]}
        >
          <View style={styles.tfFill}>
            <View style={[styles.tfTag, answered && q.correct && styles.tagRight]}>
              <Text style={[styles.tfText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const MIRROR_W = MIRROR.x1 - MIRROR.x0;
const MIRROR_H = MIRROR.bottom - MIRROR.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  panel: { position: 'absolute', top: 0, bottom: 0, width: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  rider: { position: 'absolute', left: 0, top: 0 },

  board: {
    position: 'absolute', left: BOARD.x0, top: BOARD.top, width: BOARD.x1 - BOARD.x0, height: BOARD.bottom - BOARD.top,
    borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: DEEP, boxShadow: LIP, overflow: 'hidden',
  },
  track: { position: 'absolute', height: 2, borderRadius: 1, backgroundColor: PAPER_LIT },
  routeMark: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: EMBER, marginTop: -1 },
  bladeArm: {
    position: 'absolute', left: POINTS_X - BOARD.x0, top: LINE_Y - 1 - BOARD.top, width: 12, height: 2, borderRadius: 1,
    backgroundColor: PAPER_LIT, transformOrigin: '0% 50%',
  },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: PAPER_LIT },
  boardText: {
    position: 'absolute', width: 20, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: PAPER_LIT, includeFontPadding: false,
  },
  runaway: {
    position: 'absolute', left: 0, top: LINE_Y - 5 - BOARD.top, width: 10, height: 10, borderRadius: 5,
    backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK,
  },

  lens: {
    position: 'absolute', width: 2 * LAMP_R - 6, height: 2 * LAMP_R - 6, borderRadius: LAMP_R - 3,
    backgroundColor: PAPER_LIT, borderWidth: 1.2, borderColor: INK,
  },

  lever: {
    position: 'absolute', left: LEVER_X - 5, top: GROUND - 5 - LEVER_LEN, width: 10, height: LEVER_LEN,
    transformOrigin: '50% 100%',
  },
  leverShaft: {
    position: 'absolute', left: 3, top: 3, width: 4, bottom: 0, borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: INK,
  },
  catchRod: { position: 'absolute', left: 7.2, top: 11, width: 1.3, bottom: 8, backgroundColor: INK },
  catchHandle: {
    position: 'absolute', left: 5, top: 9, width: 5.5, height: 3.4, borderRadius: 1.2, backgroundColor: IRON.SHADE,
    borderWidth: 1, borderColor: INK,
  },
  leverGrip: {
    position: 'absolute', left: 2.4, top: -2, width: 5.2, height: 10, borderRadius: 2.2, backgroundColor: PAPER_LIT,
    borderWidth: 1.1, borderColor: INK,
  },

  beam: {
    position: 'absolute', left: BALANCE.x - BALANCE.arm - 2, top: BALANCE.beamY - 1.5, width: 2 * BALANCE.arm + 4, height: 3,
    borderRadius: 1.5, backgroundColor: IRON.SHADE, borderWidth: 0.8, borderColor: INK,
  },
  string: { position: 'absolute', left: -0.6, top: 0, width: 1.2, height: BALANCE.string, borderRadius: 0.6, backgroundColor: INK },
  pan: {
    position: 'absolute', left: -13, top: BALANCE.string - 1, width: 26, height: 5, borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12, backgroundColor: IRON.SHADE, borderWidth: 1.2, borderColor: INK,
  },
  weight: {
    position: 'absolute', left: 0, top: 2, width: 7, height: 6, borderRadius: 1.5, backgroundColor: IRON.SHADE,
    borderWidth: 1, borderColor: INK, overflow: 'hidden',
  },
  weightLit: { position: 'absolute', left: 1, top: 0.5, width: 1.4, height: 3.5, borderRadius: 0.7, backgroundColor: PAPER_LIT },
  weightKnob: {
    position: 'absolute', left: 2, top: -0.5, width: 3, height: 3.2, borderRadius: 1.5, backgroundColor: IRON.SHADE,
    borderWidth: 1, borderColor: INK,
  },

  closedBook: {
    position: 'absolute', left: BOOK.x - 13, top: BOOK.y + 2, width: 26, height: 6, borderRadius: 1.5,
    backgroundColor: WOOD.SHADE, borderWidth: 1.2, borderColor: INK,
  },
  leaf: {
    position: 'absolute', left: BOOK.x, top: BOOK.y - 7, width: 13, height: 11, borderRadius: 1,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK, transformOrigin: '0% 50%',
  },

  glass: {
    position: 'absolute', left: MIRROR.x0 + 4, top: MIRROR.top + 4, width: MIRROR_W - 8, height: MIRROR_H - 8,
    borderRadius: 2, backgroundColor: stageToneOf(TEAL).STONE, overflow: 'hidden',
  },
  inGlass: {
    position: 'absolute', left: -(MIRROR.x0 + 4), top: -(MIRROR.top + 4), width: STAGE_W, height: STAGE_H, opacity: 0.72,
  },
  glassTint: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: PAPER_LIT, opacity: 0.12 },
  glint: { position: 'absolute', left: 0, top: -10, width: 8, height: 100, borderRadius: 4, backgroundColor: PAPER_LIT },

  plate: {
    position: 'absolute', height: 26, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', paddingTop: 3,
  },
  millPlate: { left: BALANCE.x - 31, top: 370, width: 62 },
  kantPlate: { left: LECTERN.x0 + 1, top: 468, width: LECTERN.x1 - LECTERN.x0 - 2 },
  arisPlate: { left: MIRROR_PLATE.x0, top: MIRROR_PLATE.top, width: MIRROR_PLATE.x1 - MIRROR_PLATE.x0 },
  plateName: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  plateGloss: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },

  pickRing: { position: 'absolute', left: 0, top: 0, borderWidth: 2.5, borderColor: EMBER },

  tf: { position: 'absolute', width: 40, height: 2 * LAMP_R + 20 },
  tfFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' },
  tfTag: {
    paddingHorizontal: 3, height: 13, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  tfText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },
});

export function Ethics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics3Scene} band={[288, 514]} camera={CAM} />;
}
