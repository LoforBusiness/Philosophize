import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { attendAt } from './attend';
import { BEATS } from './strong4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, hideLeadWhile, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing, pickAt,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { PORTAL, PORTAL_Z, portalAt, portalSwapAt, portalXf, portalScale, wordsAt } from './portal';
import {
  board, desk, bowl, terrace, banquetTable, amphora,
  BOARD, BOWL, LOCK, TABLE, PLATES, EMPTY_PLATE, DISH, OLIVE_PLATE, LEDGE, SHARDS, AMPHORAE,
} from './strong4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-4, "Strong Arguments vs Weak Arguments" — A LECTURE ROOM, AND A
// GREEK BANQUET BY THE SEA.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every act is laid across its voiced line in stages.
//
//   b0   the board heads its two columns, DEDUCTIVE and INDUCTIVE; he points to each.
//   b2   VALID · SOUND under the first.   b3  STRONG · COGENT under the second.
//   b4   the Socrates syllogism goes up, and a padlock shuts on it.
//   b5   its words turn into letters, the lock still shut; he takes an olive and holds it up.
//   b6   THE CHANGE: into the olive, out of an olive on a plate at a banquet by the sea.
//        He walks the long table: most places have olives.
//   b7   at Socrates' place he lifts the cover: bread. PROBABLE.
//   b9   Q1: four clay voting shards on the ledge.
//   b10  Q2: the amphora for each bin rocks as the chip crosses it (R7c).
//
// COMPOSITION, in stage units. The room: the board 50–350 × 326–430, split at 200, the
// padlock at 176; the desk 150–250 with the bowl at 236. The banquet: columns at 20 and
// 380, the table 64–326 at 470 with seven plates and Socrates' covered dish at 300, the
// ledge at 420 with the shards, the amphorae at 20–52. He stands at 262 in the room;
// at the banquet he walks in at 70 and stops at 280. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('logic');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const CLAY = stageToneOf(EMBER);
const MARBLE = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, logic-arguments-4. */
const LINES = [5.28, 4.36, 8.52, 8.16, 8.88, 3.92, 8.92, 6.16, 0, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
const MID = { x: STAGE_W / 2, y: 401 };
/** The olive in his hand is the larger, so the room is pushed in less deep and they meet. */
const OLIVE_HAND_R = 3.5;
const Z_ROOM = PORTAL_Z * (OLIVE_PLATE.r / OLIVE_HAND_R);
/**
 * How long the camera holds before it pushes in on the change beat: time for him to
 * step clear of the thing it goes into, so he leaves the frame at his own size
 * rather than being faded out while he is large (portal.ts, STAND CLEAR).
 */
const DELAY = 1.3;
/** Where he sets the olive down on the desk, beside the bowl — the camera goes into it there. */
const OLIVE_REST = { x: 246, y: 463 };
/** Where he steps back to before the push: the far end of the board, clear of the olive. */
const ROOM_BACK = 332;
/** When he steps back: after setting the olive down, before the camera moves. */
const BACK_AT = 0.7;
/** The crossover on the change beat, where he can change place or turn unseen. */
const SWAP_FROM = portalSwapAt(Z_ROOM, undefined, DELAY) - PORTAL.swapFor / 2;
/** Where he walks in at the banquet, and when he sets off. */
// lands well along the table from the plate the camera pulls back from, so the pull-out
// brings him in from the edge at his own size (portal.ts, STAND CLEAR)
const FEAST_IN = 184;
const FEAST_GO = (PORTAL.outTo + DELAY) + 0.4;

const X = BEATS.map((b) => b.x ?? 280);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_HEADS = is('heads');
const A_VALID = is('valid');
const A_STRONG = is('strong');
const A_SYL = is('syllogism');
const A_FORM = is('form');
const A_ENTER = is('enter');
const A_DISH = is('dish');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const HEADS = flag((b) => b.heads);
const VALID = flag((b) => b.valid);
const STRONG = flag((b) => b.strong);
const SYL = flag((b) => b.syl);
const FORM = flag((b) => b.form);
const FEAST = flag((b) => b.feast);
const LIFTED = flag((b) => b.lifted);
const Q1 = flag((b) => b.q1);
/** The sort is being answered: the amphora for the bin the chip is over rocks (R7c). */
const SORT = flag((b) => b.interact?.sort);
const ROCK_AT = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** Which way he faces once each beat settles: the bowl and the board on his left; then along the table. */
const DIR = BEATS.map((b) => (b.feast ? 1 : -1));

const Q1_T = [
  { id: 'a', title: 'STRONG', correct: true },
  { id: 'b', title: 'SOUND', correct: false },
  { id: 'c', title: 'INVALID', correct: false },
  { id: 'd', title: 'WEAK', correct: false },
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
function handOn(s: Stance, x: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic'));

export default function Strong4Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(22);
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

    // ── the change (b6), and which set he is in otherwise ───────────────────
    const pt = portalAt(b, Z_ROOM, undefined, DELAY);
    const world = A_ENTER[n] ? pt.world : FEAST[n];
    const kRoom = A_ENTER[n] ? pt.out : FEAST[n];
    const kFeast = A_ENTER[n] ? pt.into : 1 - FEAST[n];

    // ── where he is: in the room at the desk, then along the banquet table ───
    const xp = X[p];
    const xn = X[n];
    const feastDur = moveTr(FEAST_IN, xn, TR);
    const feastU = A_ENTER[n] ? ease01(clamp01((b - FEAST_GO) / feastDur)) : 1;
    const feastWalk = A_ENTER[n] && world >= 0.5 && feastU > 0 && feastU < 1;
    const walking = !A_ENTER[n] && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    // THE CHANGE, STAGED (portal.ts, STAND CLEAR): he sets the olive down, steps back to
    // the far end of the board, and only then does the camera push into the olive — so
    // the push carries him out of frame at his own size instead of fading him out.
    const backDur = moveTr(xp, ROOM_BACK, TR);
    const backU = A_ENTER[n] ? ease01(clamp01((b - BACK_AT) / backDur)) : 0;
    const backWalk = A_ENTER[n] && world < 0.5 && backU > 0 && backU < 1;
    const target = A_ENTER[n] ? (world < 0.5 ? lerp(xp, ROOM_BACK, backU) : lerp(FEAST_IN, xn, feastU)) : xn;
    const x = n === 0 ? xn : carry(cv, 0, n, xp, target, A_ENTER[n] ? 1 : walking ? walkU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : feastWalk
        ? travelStance(FEAST_IN, xn, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), feastU, WALK, 0)
        : backWalk
          ? travelStance(xp, ROOM_BACK, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), backU, WALK, 0)
          : hLive(P[n], t, b);
    // stepping back he faces the way he walks, and turns round to the board when he gets there
    const dirV = A_ENTER[n]
      ? (world < 0.5
        ? lerp(facing(DIR[p], 1, b - BACK_AT), DIR[p], clamp01((b - BACK_AT - backDur) / 0.3))
        : facing(DIR[p], DIR[n], b - SWAP_FROM))
      : facing(DIR[p], DIR[n], b);
    const dir = dirV < 0 ? -1 : 1;

    // ── pointing up at the board's two columns (b0), and at the lock (b4) ───
    const ptL = A_HEADS[n] ? pulse(0.4, 0.9, 2.2) : A_SYL[n] ? pulse(L * 0.7, L * 0.78, L * 0.95) : 0;
    s = handOn(s, x, dir, 150, 420, ptL);
    const ptR = A_HEADS[n] ? pulse(2.6, 3.1, 4.6) : 0;
    s = handOn(s, x, dir, 248, 420, ptR);
    // ── the olive: taken from the bowl (b5), held up, into the change (b6) ──
    const take = A_FORM[n] ? pulse(1.7, 2.1, 2.5) : 0;
    s = handOn(s, x, dir, BOWL.x, BOWL.y - 4, take);
    // on the change beat he lowers it to the desk and lets go
    const setDown = A_ENTER[n] ? pulse(0.05, 0.35, 0.65) : 0;
    const placed = A_ENTER[n] ? sec(0.3, 0.38) : 0;
    const hold = A_FORM[n] ? sec(2.3, 2.9) : A_ENTER[n] ? 1 - placed : 0;
    s = mixStance(s, { ...s, fistR: { x: 18, y: -44 } }, hold * (1 - take) * (1 - setDown));
    s = handOn(s, x, dir, OLIVE_REST.x, OLIVE_REST.y - 2, setDown);
    // ── the cover off Socrates' dish (b7) ────────────────────────────────────
    const lift = A_DISH[n] ? pulse(0.3, 0.8, 1.6) : 0;
    s = handOn(s, x, dir, DISH.x, DISH.y - 6 - 12 * sec(0.8, 1.2), lift);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the room ─────────────────────────────────────────────────────────────
    const hd = A_HEADS[n] ? st(0.05, 0.2) : HEADS[n];
    const hi = A_HEADS[n] ? st(0.5, 0.65) : HEADS[n];
    const va = A_VALID[n] ? st(0.3, 0.45) : VALID[n];
    const so = A_VALID[n] ? st(0.78, 0.9) : VALID[n];
    const stg = A_STRONG[n] ? st(0.3, 0.45) : STRONG[n];
    const cog = A_STRONG[n] ? st(0.78, 0.9) : STRONG[n];
    const l1 = A_SYL[n] ? st(0.1, 0.2) : SYL[n];
    const l2 = A_SYL[n] ? st(0.28, 0.38) : SYL[n];
    const l3 = A_SYL[n] ? st(0.5, 0.6) : SYL[n];
    const shut = A_SYL[n] ? st(0.72, 0.8) : SYL[n];
    const form = A_FORM[n] ? sec(0.3, 1.2) : FORM[n];

    // ── the banquet ──────────────────────────────────────────────────────────
    const lifted = A_DISH[n] ? sec(0.8, 1.2) : LIFTED[n];
    const prob = A_DISH[n] ? st(0.2, 0.3) : LIFTED[n];
    const rock0 = SORT[n] ? pickAt(ROCK_AT[0], pickPos.value) : 0;
    const rock1 = SORT[n] ? pickAt(ROCK_AT[1], pickPos.value) : 0;
    const rock2 = SORT[n] ? pickAt(ROCK_AT[2], pickPos.value) : 0;

    // ── WHERE HE LOOKS (attend.ts): at what he points to, holds or uncovers ────
    const colL = (BOARD.x0 + BOARD.mid) / 2;
    const colR = (BOARD.mid + BOARD.x1) / 2;
    const LK = A_HEADS[n] ? [0.3, colL, BOARD.top + 16, 1, 2.5, colR, BOARD.top + 16, 1, 4.8, 0, 0, 0]
      : ACT[n] === 'both' ? [0.3, BOARD.mid, BOARD.top + 30, 0.7, L * 0.8, 0, 0, 0]
      : A_VALID[n] ? [L * 0.25, colL, BOARD.top + 50, 1, L * 0.72, colL, BOARD.top + 70, 1, L * 0.97, 0, 0, 0]
      : A_STRONG[n] ? [L * 0.25, colR, BOARD.top + 50, 1, L * 0.72, colR, BOARD.top + 70, 1, L * 0.97, 0, 0, 0]
      : A_SYL[n] ? [L * 0.08, colL, BOARD.top + 40, 1, L * 0.5, colL, BOARD.top + 76, 1, L * 0.7, LOCK.x, LOCK.y, 1]
      : A_FORM[n] ? [0.2, colL, BOARD.top + 60, 1, 1.5, BOWL.x, BOWL.y, 1, 2.4, x + 16 * dir, 424, 1]
      : A_ENTER[n] ? [(PORTAL.outTo + DELAY), x + 40 * dir, TABLE.top - 4, 0.9, (PORTAL.outTo + DELAY) + 1.4, DISH.x, DISH.y - 6, 1]
      : A_DISH[n] ? [0.1, DISH.x, DISH.y - 6, 1, 1.2, DISH.x - 10, DISH.y - 20, 1, L * 0.8, DISH.x, DISH.y - 4, 0.8]
      : Q1[n] ? [0.3, (LEDGE.x0 + LEDGE.x1) / 2, LEDGE.y, 0.7]
      : SORT[n] ? [0.3, AMPHORAE[1], GROUND - 18, 0.8]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: hideLeadWhile(lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 19, n, lk.x, lk.x, tr), carry(cv, 20, n, lk.y, lk.y, tr), carry(cv, 21, n, 0, lk.w, tr)), A_ENTER[n] === 1 && b < (PORTAL.outTo + DELAY) + 0.2),
      world: carry(cv, 1, n, FEAST[p], world, A_ENTER[n] ? 1 : tr),
      kRoom: carry(cv, 2, n, FEAST[p], kRoom, A_ENTER[n] ? 1 : tr),
      kFeast: carry(cv, 3, n, 1 - FEAST[p], kFeast, A_ENTER[n] ? 1 : tr),
      hold: carry(cv, 4, n, 0, hold, tr),
      placed: A_ENTER[n] && world < 0.5 ? placed : 0,
      hd: carry(cv, 5, n, HEADS[p], hd, tr),
      hi: carry(cv, 6, n, HEADS[p], hi, tr),
      va: carry(cv, 7, n, VALID[p], va, tr),
      so: carry(cv, 8, n, VALID[p], so, tr),
      stg: carry(cv, 9, n, STRONG[p], stg, tr),
      cog: carry(cv, 10, n, STRONG[p], cog, tr),
      l1: carry(cv, 11, n, SYL[p], l1, tr),
      l2: carry(cv, 12, n, SYL[p], l2, tr),
      l3: carry(cv, 13, n, SYL[p], l3, tr),
      shut: carry(cv, 14, n, SYL[p], shut, tr),
      form: carry(cv, 15, n, FORM[p], form, tr),
      lifted: carry(cv, 16, n, LIFTED[p], lifted, tr),
      prob: carry(cv, 17, n, LIFTED[p], prob, tr),
      q1: carry(cv, 18, n, Q1[p], Q1[n], tr),
      rock0, rock1, rock2,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // the room goes in towards the olive where his hand holds it
  const roomXf = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const u = SCENE.value.placed;
    return {
      opacity: 1 - SCENE.value.world,
      ...portalXf(SCENE.value.kRoom, lerp(w[0].translateX, OLIVE_REST.x, u), lerp(w[1].translateY - 3, OLIVE_REST.y, u), MID.x, MID.y, Z_ROOM),
    };
  });
  const feastXf = useAnimatedStyle(() => ({
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kFeast, OLIVE_PLATE.x, OLIVE_PLATE.y, MID.x, MID.y),
  }));
  const figXf = useAnimatedStyle(() => {
    const atFeast = SCENE.value.world >= 0.5;
    const k = atFeast ? SCENE.value.kFeast : SCENE.value.kRoom;
    const w = DF.value.wrR;
    const s = atFeast ? portalScale(k) : portalScale(k, Z_ROOM);
    const xf = atFeast
      ? portalXf(k, OLIVE_PLATE.x, OLIVE_PLATE.y, MID.x, MID.y)
      : portalXf(k, lerp(w[0].translateX, OLIVE_REST.x, SCENE.value.placed), lerp(w[1].translateY - 3, OLIVE_REST.y, SCENE.value.placed), MID.x, MID.y, Z_ROOM);
    return { opacity: 1, ...xf };
  });
  const feastWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kFeast) : 0));
  const roomWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kRoom));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, feastXf]} pointerEvents="none">
        <Feast S={SCENE} />
      </Animated.View>
      <Animated.View style={[styles.set, roomXf]} pointerEvents="none">
        <View style={styles.floor} />
        <View style={styles.wall}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
        </View>
        <ObjectArt parts={BOARD_ART} tone={WOOD} />
        <View style={styles.slate} />
        <Padlock S={SCENE} />
        <ObjectArt parts={DESK_ART} tone={WOOD} />
        <ObjectArt parts={BOWL_ART} tone={CLAY} />
        <View style={[styles.olive, { left: BOWL.x - 7, top: BOWL.y - 8 }]} />
        <View style={[styles.olive, { left: BOWL.x + 1, top: BOWL.y - 9 }]} />
        <View style={styles.ground} />
        <Held S={SCENE} DF={DF} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <FeastWords S={SCENE} words={feastWords} on={on} />
      <Chalk S={SCENE} words={roomWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Stickman D={DF} k={K_M} />
      </Animated.View>
      {Q1[i] ? <Shards picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const BOARD_ART = board();
const DESK_ART = desk();
const BOWL_ART = bowl();
const TERRACE_ART = terrace();
const TABLE_ART = banquetTable();

// ── the room ─────────────────────────────────────────────────────────────────

function Row({ v, text, x, y, w }: { v: SharedValue<number>; text: string; x: number; y: number; w: number }) {
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.Text style={[styles.chalk, { left: x, top: y, width: w }, st]} numberOfLines={1}>{text}</Animated.Text>;
}
function Chalk({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const w = words;
  const hd = useDerivedValue(() => S.value.hd * w.value);
  const hi = useDerivedValue(() => S.value.hi * w.value);
  const va = useDerivedValue(() => S.value.va * w.value);
  const so = useDerivedValue(() => S.value.so * w.value);
  const stg = useDerivedValue(() => S.value.stg * w.value);
  const cog = useDerivedValue(() => S.value.cog * w.value);
  // the example lines, and the same lines as letters: one fades as the other comes
  const l1 = useDerivedValue(() => S.value.l1 * (1 - S.value.form) * w.value);
  const l2 = useDerivedValue(() => S.value.l2 * (1 - S.value.form) * w.value);
  const l3 = useDerivedValue(() => S.value.l3 * (1 - S.value.form) * w.value);
  const f = useDerivedValue(() => S.value.form * w.value);
  const L = BOARD.x0 + 10;
  const R = BOARD.mid + 10;
  return (
    <>
      <Row v={hd} text="DEDUCTIVE" x={L} y={334} w={130} />
      <Row v={hi} text="INDUCTIVE" x={R} y={334} w={130} />
      <Row v={va} text="VALID ·" x={L} y={352} w={48} />
      <Row v={so} text="SOUND" x={L + 46} y={352} w={60} />
      <Row v={stg} text="STRONG ·" x={R} y={352} w={58} />
      <Row v={cog} text="COGENT" x={R + 56} y={352} w={60} />
      <Row v={l1} text="ALL MEN ARE MORTAL" x={L} y={376} w={112} />
      <Row v={l2} text="SOCRATES IS A MAN" x={L} y={392} w={112} />
      <Row v={l3} text="SO HE IS MORTAL" x={L} y={408} w={112} />
      <Row v={f} text="ALL A ARE B" x={L} y={376} w={112} />
      <Row v={f} text="S IS A" x={L} y={392} w={112} />
      <Row v={f} text="SO S IS B" x={L} y={408} w={112} />
    </>
  );
}
function Padlock({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => ({ opacity: S.value.l1 }));
  const shackle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * (1 - S.value.shut) }] }));
  return (
    <Animated.View style={[styles.lock, body]}>
      <Animated.View style={[styles.shackle, shackle]} />
      <View style={styles.lockBody}>
        <View style={styles.keyhole} />
      </View>
    </Animated.View>
  );
}
function Held({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  // the olive rides his hand; it is in the room's layer, so it grows with the room when
  // the change goes into it, while he himself fades
  const st = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const u = S.value.placed;
    return {
      opacity: S.value.hold > 0.02 || u > 0.5 ? 1 : 0,
      transform: [{ translateX: lerp(w[0].translateX, OLIVE_REST.x, u) }, { translateY: lerp(w[1].translateY - 3, OLIVE_REST.y, u) }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.oliveHeld} />
    </Animated.View>
  );
}

// ── the banquet ──────────────────────────────────────────────────────────────

function Feast({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.dusk} />
      <View style={styles.sun} />
      <View style={styles.sea} />
      <View style={styles.island} />
      <View style={styles.stone} />
      <SetArt parts={TERRACE_ART} tone={MARBLE} />
      <SetArt parts={TABLE_ART} tone={WOOD} />
      {PLATES.map((px, k) => (k === EMPTY_PLATE ? null : <Olives key={px} x={px} />))}
      <Dish S={S} />
      {AMPHORAE.map((ax, k) => <Amphora key={ax} S={S} ax={ax} k={k} />)}
      <View style={styles.feastFloor} />
    </>
  );
}
function Olives({ x }: { x: number }) {
  return (
    <>
      <View style={[styles.olive, { left: x - 7, top: TABLE.top - 9 }]} />
      <View style={[styles.olive, { left: x - OLIVE_PLATE.r, top: OLIVE_PLATE.y - 2 }]} />
      <View style={[styles.olive, { left: x + 2, top: TABLE.top - 9 }]} />
    </>
  );
}
function Dish({ S }: { S: SharedValue<any> }) {
  const lid = useAnimatedStyle(() => ({
    transform: [{ translateX: -10 * S.value.lifted }, { translateY: -16 * S.value.lifted }, { rotate: `${-20 * S.value.lifted}deg` }],
  }));
  return (
    <>
      <View style={styles.bread} />
      <Animated.View style={[styles.cloche, lid]}>
        <View style={styles.knob} />
      </Animated.View>
    </>
  );
}
function Amphora({ S, ax, k }: { S: SharedValue<any>; ax: number; k: number }) {
  const art = amphora(ax);
  const st = useAnimatedStyle(() => {
    const r = k === 0 ? S.value.rock0 : k === 1 ? S.value.rock1 : S.value.rock2;
    return { transform: [{ rotate: `${7 * r * Math.sin(S.value.t * 7)}deg` }] };
  });
  return (
    <Animated.View style={[styles.set, { transformOrigin: `${ax}px ${GROUND}px` }, st]}>
      <SetArt parts={art} tone={CLAY} />
    </Animated.View>
  );
}
function FeastWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const soc = useAnimatedStyle(() => ({ opacity: words.value * (1 - S.value.q1) }));
  const prob = useAnimatedStyle(() => ({ opacity: words.value * S.value.prob * (1 - S.value.q1) }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.socPlate, soc]}>
        <Text style={styles.plateText} numberOfLines={1}>SOCRATES</Text>
      </Animated.View>
      {on(LIFTED) ? (
        <Animated.View style={[styles.plate, styles.probPlate, prob]}>
          <Text style={styles.plateText} numberOfLines={1}>PROBABLE</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── Q1: four clay voting shards on the ledge ────────────────────────────────

function Shards({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {Q1_T.map((c, k) => (
        <Target
          key={c.id} id={c.id} correct={c.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.shard, { left: SHARDS[k] - 22, top: LEDGE.y - 26 }]}
        >
          <View style={[styles.shardFace, answered && c.correct && styles.tagRight]}>
            <Text style={[styles.plateText, answered && c.correct && styles.onInk]} numberOfLines={1}>{c.title}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  set: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0 },

  // ── the room ──────────────────────────────────────────────────────────────
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 288, width: STAGE_W, height: GROUND - 288, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  panel: { position: 'absolute', top: 0, bottom: 0, width: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  slate: {
    position: 'absolute', left: BOARD.x0, top: BOARD.top, width: BOARD.x1 - BOARD.x0, height: BOARD.bottom - BOARD.top,
    backgroundColor: DEEP, borderRadius: 1,
  },
  chalk: {
    position: 'absolute', fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: PAPER_LIT,
    includeFontPadding: false,
  },
  lock: { position: 'absolute', left: LOCK.x - 7, top: LOCK.y - 10, width: 14, height: 20 },
  shackle: {
    position: 'absolute', left: 2.5, top: 0, width: 9, height: 10, borderTopLeftRadius: 4.5, borderTopRightRadius: 4.5,
    borderWidth: 2, borderBottomWidth: 0, borderColor: PAPER_LIT,
  },
  lockBody: {
    position: 'absolute', left: 0, top: 8, width: 14, height: 11, borderRadius: 2, backgroundColor: EMBER,
    borderWidth: 1, borderColor: PAPER_LIT, alignItems: 'center',
  },
  keyhole: { marginTop: 3, width: 2.4, height: 4, borderRadius: 1.2, backgroundColor: INK },
  olive: {
    position: 'absolute', width: 5, height: 4, borderRadius: 2.5, backgroundColor: stageToneOf(OLIVE).SHADE,
    borderWidth: 0.8, borderColor: INK,
  },
  oliveHeld: {
    position: 'absolute', left: -OLIVE_HAND_R, top: -OLIVE_HAND_R * 0.8, width: 2 * OLIVE_HAND_R, height: 1.6 * OLIVE_HAND_R,
    borderRadius: OLIVE_HAND_R, backgroundColor: stageToneOf(OLIVE).SHADE, borderWidth: 0.8, borderColor: INK,
  },

  // ── the banquet ───────────────────────────────────────────────────────────
  dusk: { position: 'absolute', left: 0, right: 0, top: 288, height: 112, backgroundColor: stageToneOf(EMBER).STONE },
  sun: { position: 'absolute', left: 250, top: 380, width: 30, height: 30, borderRadius: 15, backgroundColor: EMBER },
  sea: { position: 'absolute', left: 0, right: 0, top: 398, height: 28, backgroundColor: TEAL },
  island: { position: 'absolute', left: 60, top: 390, width: 90, height: 16, borderTopLeftRadius: 45, borderTopRightRadius: 45, backgroundColor: stageToneOf(TEAL).SHADE },
  stone: { position: 'absolute', left: 0, right: 0, top: 452, height: 48, borderRadius: 1, backgroundColor: MARBLE.STONE },
  bread: {
    position: 'absolute', left: DISH.x - 8, top: TABLE.top - 10, width: 16, height: 8, borderRadius: 4,
    backgroundColor: stageToneOf(OLIVE).STONE, borderWidth: 1, borderColor: INK,
  },
  cloche: {
    position: 'absolute', left: DISH.x - 12, top: TABLE.top - 18, width: 24, height: 14, borderTopLeftRadius: 12,
    borderTopRightRadius: 12, backgroundColor: MARBLE.SHADE, borderWidth: 1.2, borderColor: INK, alignItems: 'center',
  },
  knob: { marginTop: -4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: INK },
  feastFloor: floorStyle(TONE, GROUND),

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  socPlate: { left: DISH.x - 30, top: LEDGE.y - 36, width: 60 },
  probPlate: { left: DISH.x - 30, top: LEDGE.y - 54, width: 60 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  shard: { position: 'absolute', width: 44, height: 24 },
  shardFace: {
    flexGrow: 1, borderRadius: 6, borderTopRightRadius: 12, borderBottomLeftRadius: 10, backgroundColor: CLAY.STONE,
    borderWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },
});

export function Strong4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Strong4Scene} band={[288, 514]} camera={CAM} />;
}
