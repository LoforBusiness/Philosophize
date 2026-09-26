import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './epistemology2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  stove, windowFrame, slateHanger, desk, saucer,
  STOVE, FIREBOX, WINDOW, PORTRAIT, SLATE, REACH_X, DESK, NOTEBOOK, CANDLE, DESK_X, WALL_FOOT,
} from './epistemology2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// epistemology-knowledge-3, "Can You Be Wrong About Something You're Certain Of?" —
// DESCARTES' STOVE-HEATED ROOM AT NIGHT.
//
// Redrawn 2026-09-26: the second lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest).
//
//   b0   he writes at his desk by candlelight, stops, and thinks.
//   b1   he takes up the candle and holds it close: certainty is a feeling in you.
//   b2   he carries it to the wall — the window, the portrait, the slate — and a
//        question hangs over each: can it withstand every possible doubt?
//   b3   the stove's fire throws a horned shadow up the wall, and it reaches out and
//        corrupts each in turn: day in the night window, a face that is not hers,
//        2 + 3 = 6.
//   b4   he treats each as false with his own hand: wipes the slate, turns the
//        portrait to the wall, closes the shutters.
//   b6   the shadow thins — he doesn't believe in it; he holds the candle up to each
//        and each question becomes a cross.
//   b7   he walks back to the desk, sets the candle down and writes I EXIST.
//   b8   he puts the room back on that foundation: the sum rewritten, the portrait
//        turned round, the shutters opened, each cross now a tick.
//   b9   Q1: three notes pinned on the wall.   b10  Q2: three tags.
//
// COMPOSITION, in stage units: the stove 4–56 in the corner, the window 68–122, the
// portrait at 158, the slate 194–242, the desk 286–382 with the notebook at 304 and
// the candle at 334. He stands at 290 at the desk, 238 at the slate, 186 at the
// portrait and 140 at the window. The shadow lives on the wall above the stove and
// its arm reaches along y 392–404, under the labels. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('epistemology');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(OLIVE);
const TILE = stageToneOf(TEAL);
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, epistemology-knowledge-3. */
const LINES = [7.84, 5.92, 8.24, 7.76, 5.2, 0, 8.2, 7.36, 7.24, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_D = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? 140);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_WRITE = is('write');
const A_CANDLE = is('candle');
const A_WORLD = is('world');
const A_DEMON = is('demon');
const A_TREAT = is('treat');
const A_TEST = is('test');
const A_EXIST = is('exist');
const A_REBUILD = is('rebuild');
const flag = (k: keyof (typeof BEATS)[number]) => BEATS.map((b) => (b[k] ? 1 : 0));
const LIT = flag('lit');
const TESTED = flag('tested');
const SHADOW = flag('shadow');
const FAKED = flag('faked');
const TREATED = flag('treated');
const GHOST = flag('ghost');
const FAILED = flag('failed');
const WRITTEN = flag('written');
const REBUILT = flag('rebuilt');
const NOTES = flag('notes');
const TAGS = flag('tags');
/** Which way he faces once a beat has settled: the desk is to his right, the wall to his left. */
const DIR = BEATS.map((b) => (b.act === 'write' || b.act === 'candle' || b.act === 'exist' ? 1 : -1));
/** The candle: in his hand from b1 until he sets it down on b7. */
const HELD = BEATS.map((_, k) => (k >= 1 && k <= 6 ? 1 : 0));

/** The three things on the wall, in the order the narration names them. */
const THINGS = [
  { id: 'window', label: 'SENSES', x: (WINDOW.x0 + WINDOW.x1) / 2 },
  { id: 'portrait', label: 'MEMORY', x: PORTRAIT.cx },
  { id: 'slate', label: 'SUMS', x: (SLATE.x0 + SLATE.x1) / 2 },
];
const LABEL_Y = 346;

const NOTE_Q = [
  { id: 'doubt', l1: 'TO FIND WHAT', l2: 'CAN’T BE DOUBTED', x: 112, correct: true },
  { id: 'unreal', l1: 'TO PROVE THE', l2: 'WORLD UNREAL', x: 214, correct: false },
  { id: 'fear', l1: 'HE FEARED', l2: 'DEMONS', x: 316, correct: false },
];
const NOTE_W = 94;
const TAG_Q = [
  { id: 'doubter', l1: 'THE', l2: 'DOUBTER', x: 140, correct: true },
  { id: 'sums', l1: 'SIMPLE', l2: 'SUMS', x: 218, correct: false },
  { id: 'nothing', l1: 'NOTHING', l2: 'AT ALL', x: 334, correct: false },
];
const TAG_W = 66;

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
/** A hand on a stage point: `which` 1 is the right hand, -1 the left. */
function handOn(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_D, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/**
 * A walk between stops inside one beat: `stops` are [x, arrive-seconds] pairs, and
 * between two of them he walks at the pace the distance needs, starting as soon as
 * the last act is done. Returns where he is and how far into the current leg.
 */
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
/** b4: slate wiped from 0.1s, then the portrait at 2.0s, then the shutters at 3.7s. */
const TREAT_LEGS = [[REACH_X.window, 2.3]];
/** b8: from the desk to the slate, then the portrait, then the window. */
const REBUILD_LEGS = [[REACH_X.slate, 0.2], [REACH_X.window, 4.5]];
/** Where he stands to reach the candle on the desk. */
const CANDLE_X = CANDLE.x - 22;
/** b7: across to the candle's side of the desk, then a step back to the notebook. */
const EXIST_LEGS = [[CANDLE_X, 0.3], [DESK_X, 4.0]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function Epistemology2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(27);
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

    // ── where he is: a walk between beats, or the legs inside one ───────────
    const xp = X[p];
    const xn = X[n];
    const inBeat = A_TREAT[n] || A_REBUILD[n] || A_EXIST[n];
    const walking = !inBeat && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const leg = A_TREAT[n] ? legAt(b, xp, TREAT_LEGS) : A_REBUILD[n] ? legAt(b, xp, REBUILD_LEGS)
      : A_EXIST[n] ? legAt(b, xp, EXIST_LEGS) : null;
    const tx = leg ? leg.x : xn;
    const x = carry(cv, 0, n, xp, tx, walking ? walkU : leg ? 1 : tr);
    // he faces the way he walks, and what the beat is about once he gets there
    const travel = leg ? (leg.to > leg.from ? 1 : -1) : xn > xp ? 1 : -1;
    const moving = walking ? walkU < 1 : leg ? leg.u < 1 && leg.to !== leg.from : false;
    const settle = walking ? clamp01((b - walkDur) / 0.3) : 1;
    const toSlate = A_TREAT[n] ? sec(0, 0.3) * (1 - sec(1.1, 1.4)) : A_REBUILD[n] ? sec(2.2, 2.5) * (1 - sec(3.4, 3.7)) : 0;
    const dirV = inBeat
      ? lerp(facing(DIR[p], DIR[n], b), 1, toSlate)
      : walking
        ? lerp(facing(DIR[p], travel, b), DIR[n], settle)
        : facing(DIR[p], DIR[n], b);
    const dir = dirV < 0 ? -1 : 1;

    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (leg && moving) s = travelStance(leg.from, leg.to, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), leg.u, WALK, 0);

    // ── the candle: in his left hand, held near his chest, raised to look ───
    const holding = A_CANDLE[n] ? sec(1.15, 1.3) : A_EXIST[n] ? 1 - sec(3.6, 3.75) : HELD[n];
    const raise = (A_TEST[n] ? pulse(4.8, 5.3, 7.9) : 0) + (A_DEMON[n] ? pulse(2.2, 2.8, 4.0) : 0);
    // held in front of his chest, not up at his face, and raised to look at a thing
    s = mixStance(s, { ...s, fistL: { x: 15, y: -20 - 24 * raise } }, holding);
    // taking it up (b1) and setting it down (b7), with the right hand
    const takeUp = A_CANDLE[n] ? pulse(0.6, 1.2, 1.8) : 0;
    s = handOn(s, x, dir, -1, CANDLE.x, CANDLE.y - 4, takeUp);
    const setDown = A_EXIST[n] ? pulse(3.35, 3.65, 4.0) : 0;
    s = handOn(s, x, dir, -1, CANDLE.x, CANDLE.y, setDown);

    // ── writing at the desk (b0, b7), and the pause to think (b0) ──────────
    const writing = A_WRITE[n] ? 1 - sec(3.8, 4.3) + sec(6.6, 7.1) : A_EXIST[n] ? sec(4.5, 4.7) * (1 - sec(6.6, 7.0)) : 0;
    const nib = { x: NOTEBOOK.x - 10 + 12 * (0.5 + 0.5 * Math.sin(t * 3.1)), y: NOTEBOOK.y - 3 + 1.5 * Math.sin(t * 11) };
    s = handOn(s, x, dir, 1, nib.x, nib.y, clamp01(writing));
    const think = A_WRITE[n] ? sec(4.3, 4.8) * (1 - sec(6.4, 6.9)) : 0;
    s = mixStance(s, { ...s, fistR: { x: 6, y: -68 }, neck: s.neck - 0.1 }, think);

    // ── b2: the question over each, as he looks at it ─────────────────────
    // ── b3: the recoil from the shadow ────────────────────────────────────
    const recoil = A_DEMON[n] ? pulse(2.0, 2.6, 4.2) : 0;
    s = { ...s, tilt: s.tilt + 0.16 * recoil };

    // ── b4: wipe the slate, turn the portrait, close the shutters ─────────
    const slateMid = { x: (SLATE.x0 + SLATE.x1) / 2, y: (SLATE.top + SLATE.bottom) / 2 };
    const wipe = A_TREAT[n] ? pulse(0.3, 0.5, 1.1) : 0;
    const wipeX = SLATE.x0 + 14 + 8 * Math.sin(t * 9);
    s = handOn(s, x, dir, 1, wipeX, slateMid.y, wipe);
    const turnP = A_TREAT[n] ? pulse(1.4, 1.65, 2.2) : 0;
    s = handOn(s, x, dir, 1, PORTRAIT.cx + PORTRAIT.w / 2 - 2, PORTRAIT.cy + 6, turnP);
    const shut = A_TREAT[n] ? pulse(3.1, 3.35, 4.0) : 0;
    s = handOn(s, x, dir, 1, lerp(WINDOW.x1, (WINDOW.x0 + WINDOW.x1) / 2 + 4, sec(3.35, 3.85)), (WINDOW.top + WINDOW.bottom) / 2 + 12, shut);

    // ── b6: shaking his head at the shadow ─────────────────────────────────
    const nope = A_TEST[n] ? pulse(0.6, 1.0, 2.6) : 0;
    s = { ...s, neck: s.neck + 0.12 * nope * Math.sin(t * 9) };

    // ── b8: chalk, portrait, shutters, the other way round ────────────────
    const chalk = A_REBUILD[n] ? pulse(2.4, 2.6, 3.4) : 0;
    s = handOn(s, x, dir, 1, SLATE.x0 + 6 + 14 * sec(2.6, 3.3), slateMid.y + 2 * Math.sin(t * 13), chalk);
    const turnB = A_REBUILD[n] ? pulse(3.7, 3.95, 4.4) : 0;
    s = handOn(s, x, dir, 1, PORTRAIT.cx + PORTRAIT.w / 2 - 2, PORTRAIT.cy + 6, turnB);
    const open = A_REBUILD[n] ? pulse(5.3, 5.55, 6.3) : 0;
    s = handOn(s, x, dir, 1, lerp((WINDOW.x0 + WINDOW.x1) / 2 + 4, WINDOW.x1, sec(5.55, 6.05)), (WINDOW.top + WINDOW.bottom) / 2 + 12, open);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the room ──────────────────────────────────────────────────────────
    // the shadow: grows on b3, thins on b6, and reaches for one thing at a time
    const grow = A_DEMON[n] ? st(0.02, 0.35) : SHADOW[n];
    const thin = A_TEST[n] ? st(0.08, 0.34) : GHOST[n];
    const reachAt = A_DEMON[n] ? (b / L < 0.62 ? 0 : b / L < 0.75 ? 1 : 2) : A_EXIST[n] ? 3 : -1;
    const reach = A_DEMON[n]
      ? bump(b, L, 0.5, 0.56, 0.66) + bump(b, L, 0.63, 0.69, 0.78) + bump(b, L, 0.76, 0.82, 0.94)
      : A_EXIST[n] ? bump(b, L, 0.76, 0.84, 1) : 0;
    const reachX = reachAt === 0 ? WINDOW.x0 + 6 : reachAt === 1 ? PORTRAIT.cx - PORTRAIT.w / 2 : reachAt === 2 ? SLATE.x0 : 250;
    // what the shadow corrupts, one after another (b3), and what he treats as false (b4)
    const fk = (m: number) => {
      'worklet';
      return A_DEMON[n] ? st(m, m + 0.05) : FAKED[n] && !REBUILT[n] ? 1 : 0;
    };
    const faked = [fk(0.56), fk(0.69), fk(0.82)];
    const shutters = A_TREAT[n] ? sec(3.35, 3.85) : A_REBUILD[n] ? 1 - sec(5.55, 6.05) : TREATED[n] && !REBUILT[n] ? 1 : 0;
    const turned = A_TREAT[n] ? sec(1.65, 2.05) : A_REBUILD[n] ? 1 - sec(3.95, 4.35) : TREATED[n] && !REBUILT[n] ? 1 : 0;
    const wiped = A_TREAT[n] ? sec(0.5, 1.1) : A_REBUILD[n] ? 1 - sec(2.6, 3.3) : TREATED[n] && !REBUILT[n] ? 1 : 0;
    // the marks over each: a question (b2), a cross (b6), a tick when it is put back (b8)
    const q = (k: number) => {
      'worklet';
      return A_WORLD[n] ? st(0.6 + 0.1 * k, 0.66 + 0.1 * k) : TESTED[n];
    };
    const cross = (k: number) => {
      'worklet';
      return A_TEST[n] ? st(0.58 + 0.12 * k, 0.63 + 0.12 * k) : FAILED[n] && !REBUILT[n] ? 1 : 0;
    };
    const tick = (k: number) => {
      'worklet';
      const at = [6.0, 4.4, 3.3][k];
      return A_REBUILD[n] ? sec(at, at + 0.3) : REBUILT[n];
    };

    return {
      fig: lookPose(fig, x, GROUND, K_D, dirV, 1, gazeX.value, gazeY.value, gazeOn.value),
      holding: carry(cv, 1, n, HELD[p], holding, tr),
      glow: carry(cv, 2, n, LIT[p], A_CANDLE[n] ? sec(2.8, 3.6) : LIT[n], tr),
      grow: carry(cv, 3, n, SHADOW[p], grow, tr),
      thin: carry(cv, 4, n, GHOST[p], thin, tr),
      // the arm's length is carried whole, so a tap mid-reach never snaps it to another target
      armLen: carry(cv, 5, n, 0, Math.max(0, reachX - 60) * reach, tr),
      armOn: carry(cv, 26, n, 0, Math.min(1, reach * 3), tr),
      fw: carry(cv, 6, n, FAKED[p] && !REBUILT[p] ? 1 : 0, faked[0], tr),
      fp: carry(cv, 7, n, FAKED[p] && !REBUILT[p] ? 1 : 0, faked[1], tr),
      fs: carry(cv, 8, n, FAKED[p] && !REBUILT[p] ? 1 : 0, faked[2], tr),
      shutters: carry(cv, 9, n, TREATED[p] && !REBUILT[p] ? 1 : 0, shutters, tr),
      turned: carry(cv, 10, n, TREATED[p] && !REBUILT[p] ? 1 : 0, turned, tr),
      wiped: carry(cv, 11, n, TREATED[p] && !REBUILT[p] ? 1 : 0, wiped, tr),
      q0: carry(cv, 12, n, TESTED[p], q(0), tr),
      q1: carry(cv, 13, n, TESTED[p], q(1), tr),
      q2: carry(cv, 14, n, TESTED[p], q(2), tr),
      x0: carry(cv, 15, n, FAILED[p] && !REBUILT[p] ? 1 : 0, cross(0), tr),
      x1: carry(cv, 16, n, FAILED[p] && !REBUILT[p] ? 1 : 0, cross(1), tr),
      x2: carry(cv, 17, n, FAILED[p] && !REBUILT[p] ? 1 : 0, cross(2), tr),
      t0: carry(cv, 18, n, REBUILT[p], tick(0), tr),
      t1: carry(cv, 19, n, REBUILT[p], tick(1), tr),
      t2: carry(cv, 20, n, REBUILT[p], tick(2), tr),
      ink: carry(cv, 21, n, WRITTEN[p], A_EXIST[n] ? sec(4.6, 6.5) : WRITTEN[n], tr),
      found: carry(cv, 22, n, WRITTEN[p], A_EXIST[n] ? sec(6.5, 7.0) : WRITTEN[n], tr),
      notes: carry(cv, 23, n, NOTES[p], NOTES[n], tr),
      tags: carry(cv, 24, n, TAGS[p], TAGS[n], tr),
      flare: carry(cv, 25, n, 0, A_EXIST[n] ? pulse(6.5, 6.9, 7.3) : 0, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const candle = useAnimatedStyle(() => {
    const w = DF.value.wrL;
    const h = SCENE.value.holding;
    return {
      transform: [
        { translateX: lerp(CANDLE.x, w[0].translateX, h) },
        { translateY: lerp(CANDLE.y, w[1].translateY - 6, h) },
      ],
    };
  });
  // the flame is the only light he carries: it grows when he holds the candle close
  // ("certainty is something happening in you") and flares when he writes I EXIST
  const flame = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + 0.12 * Math.sin(SCENE.value.t * 13) + 0.45 * SCENE.value.glow + 0.35 * SCENE.value.flare }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        <View style={styles.skirting} />
      </View>
      <Shadow S={SCENE} />
      <ObjectArt parts={STOVE_ART} tone={TILE} />
      <Fire S={SCENE} />
      <View style={styles.view} pointerEvents="none">
        <View style={styles.moon} />
        <View style={styles.hill} />
        <View style={styles.trunk} />
        <View style={styles.crown} />
        <Day S={SCENE} />
      </View>
      <ObjectArt parts={WINDOW_ART} tone={WOOD} />
      <Shutters S={SCENE} />
      <Portrait S={SCENE} />
      <ObjectArt parts={SLATE_ART} tone={WOOD} />
      <Slate S={SCENE} />
      <Labels S={SCENE} on={on} />
      <ObjectArt parts={DESK_ART} tone={WOOD} />
      <ObjectArt parts={SAUCER_ART} tone={WOOD} />
      <Notebook S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_D} />
      <Animated.View style={[styles.rider, candle]} pointerEvents="none">
        <View style={styles.stick} />
        <Animated.View style={[styles.flame, flame]} />
      </Animated.View>
      {NOTES[i] ? <Notes picked={picked} onPick={onPick} S={SCENE} /> : null}
      {TAGS[i] ? <Tags picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const STOVE_ART = stove();
const WINDOW_ART = windowFrame();
const SLATE_ART = slateHanger();
const DESK_ART = desk();
const SAUCER_ART = saucer();

// ── the fire and the shadow it throws ───────────────────────────────────────

function Fire({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.75 + 0.25 * Math.sin(S.value.t * 11),
    transform: [{ scaleY: 0.85 + 0.2 * Math.sin(S.value.t * 7) }],
  }));
  return <Animated.View style={[styles.fire, st]} pointerEvents="none" />;
}
/**
 * The demon is the shadow the stove's fire throws on the wall: a horned head and
 * shoulders over the stove, flickering with the flame, and one long arm that reaches
 * along the wall to whatever it corrupts. It is ink at part strength, so it reads as
 * a shadow on the wall rather than as a thing in the room.
 */
function Shadow({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => {
    const g = S.value.grow;
    return {
      opacity: (0.5 - 0.34 * S.value.thin) * g,
      transform: [
        { translateY: 18 * (1 - g) },
        { scale: 0.6 + 0.4 * g + 0.025 * Math.sin(S.value.t * 7) },
      ],
    };
  });
  const arm = useAnimatedStyle(() => {
    return { width: Math.max(2, S.value.armLen), opacity: (0.5 - 0.34 * S.value.thin) * S.value.grow * S.value.armOn };
  });
  return (
    <>
      <Animated.View style={[styles.shadow, body]} pointerEvents="none">
        <View style={styles.shHead} />
        <View style={[styles.horn, { left: 11, transform: [{ rotate: '-24deg' }] }]} />
        <View style={[styles.horn, { left: 27, transform: [{ rotate: '24deg' }] }]} />
        <View style={styles.shBody} />
      </Animated.View>
      <Animated.View style={[styles.arm, arm]} pointerEvents="none">
        <View style={styles.claw} />
      </Animated.View>
    </>
  );
}

// ── the window's view, and the daylight the demon puts in it ────────────────

function Day({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fw * (0.85 + 0.15 * Math.sin(S.value.t * 23)) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.day, st]}>
      <View style={styles.sun} />
      <View style={styles.crack} />
    </Animated.View>
  );
}
function Shutters({ S }: { S: SharedValue<any> }) {
  const l = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.02, S.value.shutters) }] }));
  const r = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.02, S.value.shutters) }] }));
  return (
    <>
      <Animated.View style={[styles.shutter, { left: WINDOW.x0, transformOrigin: '0% 50%' }, l]} pointerEvents="none">
        <View style={styles.slat} />
        <View style={[styles.slat, { top: 26 }]} />
        <View style={[styles.slat, { top: 46 }]} />
      </Animated.View>
      <Animated.View style={[styles.shutter, { left: (WINDOW.x0 + WINDOW.x1) / 2, transformOrigin: '100% 50%' }, r]} pointerEvents="none">
        <View style={styles.slat} />
        <View style={[styles.slat, { top: 26 }]} />
        <View style={[styles.slat, { top: 46 }]} />
      </Animated.View>
    </>
  );
}

// ── the portrait, which the demon changes and he turns to the wall ─────────

function Portrait({ S }: { S: SharedValue<any> }) {
  // turning it round is a flip about its own upright: the face, edge-on, then the back
  const flip = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.03, Math.abs(Math.cos(Math.PI * S.value.turned))) }] }));
  const front = useAnimatedStyle(() => ({ opacity: S.value.turned < 0.5 ? 1 : 0 }));
  const back = useAnimatedStyle(() => ({ opacity: S.value.turned < 0.5 ? 0 : 1 }));
  const horns = useAnimatedStyle(() => ({ opacity: S.value.fp * (0.8 + 0.2 * Math.sin(S.value.t * 19)) }));
  return (
    <Animated.View style={[styles.frame, flip]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.canvas, front]}>
        <View style={styles.sitterHead} />
        <View style={styles.sitterBody} />
        <Animated.View style={[styles.sitterHorns, horns]}>
          <View style={[styles.miniHorn, { left: 0, transform: [{ rotate: '-24deg' }] }]} />
          <View style={[styles.miniHorn, { left: 10, transform: [{ rotate: '24deg' }] }]} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.canvasBack, back]}>
        <View style={[styles.batten, { transform: [{ rotate: '52deg' }] }]} />
        <View style={[styles.batten, { transform: [{ rotate: '-52deg' }] }]} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the slate: 2 + 3 = 5, then 6, wiped, and written again ────────────────

function Slate({ S }: { S: SharedValue<any> }) {
  const sum = useAnimatedStyle(() => ({ opacity: 1 - S.value.wiped }));
  const five = useAnimatedStyle(() => ({ opacity: S.value.fs > 0.5 && Math.sin(S.value.t * 17) > -0.6 ? 0 : 1 }));
  const six = useAnimatedStyle(() => ({ opacity: S.value.fs > 0.5 && Math.sin(S.value.t * 17) > -0.6 ? 1 : 0 }));
  const smear = useAnimatedStyle(() => ({ opacity: 0.5 * S.value.wiped * (1 - S.value.wiped) * 4 }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.sumRow, sum]}>
        <Text style={styles.chalk} numberOfLines={1}>2 + 3 =</Text>
        <View style={styles.digit}>
          <Animated.Text style={[styles.chalk, five]}>5</Animated.Text>
          <Animated.Text style={[styles.chalk, styles.over, six]}>6</Animated.Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.smear, smear]} />
    </View>
  );
}

// ── the labels over the three, and the question, cross or tick on each ────

function Labels({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  return (
    <>
      {THINGS.map((th, k) => <Label key={th.id} S={S} k={k} x={th.x} text={th.label} on={on} />)}
    </>
  );
}
function Label({ S, k, x, text, on }: { S: SharedValue<any>; k: number; x: number; text: string; on: (a: readonly number[]) => boolean }) {
  const q = useAnimatedStyle(() => {
    const v = k === 0 ? S.value.q0 : k === 1 ? S.value.q1 : S.value.q2;
    const c = k === 0 ? S.value.x0 : k === 1 ? S.value.x1 : S.value.x2;
    const t = k === 0 ? S.value.t0 : k === 1 ? S.value.t1 : S.value.t2;
    return { opacity: v * (1 - c) * (1 - t), transform: [{ scale: 0.6 + 0.4 * v }] };
  });
  const x2 = useAnimatedStyle(() => {
    const c = k === 0 ? S.value.x0 : k === 1 ? S.value.x1 : S.value.x2;
    const t = k === 0 ? S.value.t0 : k === 1 ? S.value.t1 : S.value.t2;
    return { opacity: c * (1 - t), transform: [{ scale: 1.6 - 0.6 * c }, { rotate: '-8deg' }] };
  });
  const ok = useAnimatedStyle(() => {
    const t = k === 0 ? S.value.t0 : k === 1 ? S.value.t1 : S.value.t2;
    return { opacity: t, transform: [{ scale: 1.6 - 0.6 * t }] };
  });
  return (
    <View style={[styles.label, { left: x - 30 }]} pointerEvents="none">
      <Text style={styles.labelText} numberOfLines={1}>{text}</Text>
      <View style={styles.markSlot}>
        {on(TESTED) ? <Animated.Text style={[styles.mark, q]}>?</Animated.Text> : null}
        {on(FAILED) ? <Animated.Text style={[styles.mark, styles.over, styles.cross, x2]}>✕</Animated.Text> : null}
        {on(REBUILT) ? <Animated.Text style={[styles.mark, styles.over, styles.tick, ok]}>✓</Animated.Text> : null}
      </View>
    </View>
  );
}

// ── the notebook, and I EXIST written into it ──────────────────────────────

function Notebook({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const ink = useAnimatedStyle(() => ({ width: 38 * S.value.ink }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.6 * S.value.found + 0.3 * S.value.flare }));
  return (
    <View style={styles.notebook} pointerEvents="none">
      <Animated.View style={[styles.pageGlow, glow]} />
      <View style={styles.spine} />
      {on(WRITTEN) ? (
        <Animated.View style={[styles.inkClip, ink]}>
          <Text style={styles.written} numberOfLines={1}>I EXIST</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── Q1: three notes pinned to the wall ─────────────────────────────────────

function Notes({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const drop = useAnimatedStyle(() => ({ opacity: S.value.notes, transform: [{ translateY: (1 - S.value.notes) * -10 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drop]} pointerEvents="box-none">
      {NOTE_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={[styles.note, { left: q.x - NOTE_W / 2, transform: [{ rotate: `${[-2, 1.5, -1][k]}deg` }] }]}
        >
          <View style={[styles.noteFace, answered && q.correct && styles.faceRight]}>
            <Text style={[styles.noteText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.noteText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
            <View style={styles.pin} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q2: three tags, one over him ────────────────────────────────────────────

function Tags({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const drop = useAnimatedStyle(() => ({ opacity: S.value.tags, transform: [{ translateY: (1 - S.value.tags) * -10 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drop]} pointerEvents="box-none">
      {TAG_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.tag, { left: q.x - TAG_W / 2 }]}
        >
          <View style={styles.tagFill}>
            <View style={[styles.tagFace, answered && q.correct && styles.faceRight]}>
              <Text style={[styles.noteText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
              <Text style={[styles.noteText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
            </View>
            <View style={styles.tagString} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const WIN_W = WINDOW.x1 - WINDOW.x0;
const WIN_H = WINDOW.bottom - WINDOW.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 290, width: STAGE_W, height: GROUND - 290, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  skirting: { position: 'absolute', left: 0, right: 0, top: WALL_FOOT - 290, height: GROUND - WALL_FOOT, backgroundColor: WALL.SHADE },
  rider: { position: 'absolute', left: 0, top: 0 },

  fire: {
    position: 'absolute', left: FIREBOX.x - FIREBOX.w / 2 + 2, top: FIREBOX.y - FIREBOX.h / 2 + 2,
    width: FIREBOX.w - 4, height: FIREBOX.h - 4, borderRadius: 6, backgroundColor: EMBER, transformOrigin: '50% 100%',
  },
  shadow: { position: 'absolute', left: 4, top: 318, width: 52, height: 80, transformOrigin: '50% 100%' },
  shHead: { position: 'absolute', left: 12, top: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: INK },
  horn: {
    position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 16,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  shBody: {
    position: 'absolute', left: 0, top: 38, width: 52, height: 42, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    backgroundColor: INK,
  },
  arm: {
    position: 'absolute', left: 50, top: 396, height: 7, borderRadius: 3.5, backgroundColor: INK,
    justifyContent: 'center', alignItems: 'flex-end',
  },
  claw: { width: 12, height: 12, borderRadius: 6, marginRight: -4, backgroundColor: INK },

  view: {
    position: 'absolute', left: WINDOW.x0, top: WINDOW.top, width: WIN_W, height: WIN_H,
    backgroundColor: DEEP, overflow: 'hidden', borderRadius: 2,
  },
  moon: { position: 'absolute', left: 36, top: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: PAPER_LIT },
  hill: { position: 'absolute', left: -10, right: -10, bottom: -16, height: 34, borderRadius: 40, backgroundColor: TEAL },
  trunk: { position: 'absolute', left: 14, bottom: 10, width: 4, height: 22, borderRadius: 2, backgroundColor: INK },
  crown: { position: 'absolute', left: 4, bottom: 26, width: 24, height: 22, borderRadius: 12, backgroundColor: INK },
  day: { backgroundColor: SAGE },
  sun: { position: 'absolute', left: 8, top: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: EMBER },
  crack: {
    position: 'absolute', left: 12, top: 30, width: 44, height: 2, borderRadius: 1, backgroundColor: INK,
    transform: [{ rotate: '-28deg' }],
  },
  shutter: {
    position: 'absolute', top: WINDOW.top - 2, width: WIN_W / 2, height: WIN_H + 4, borderRadius: 2,
    backgroundColor: WOOD.SHADE, borderWidth: 1.5, borderColor: INK,
  },
  slat: { position: 'absolute', left: 4, right: 4, top: 8, height: 2, borderRadius: 1, backgroundColor: INK, opacity: 0.4 },

  frame: {
    position: 'absolute', left: PORTRAIT.cx - PORTRAIT.w / 2, top: PORTRAIT.cy - PORTRAIT.h / 2,
    width: PORTRAIT.w, height: PORTRAIT.h, borderRadius: PORTRAIT.w / 2, borderWidth: 3, borderColor: WOOD.SHADE,
    overflow: 'hidden', backgroundColor: PAPER_LIT,
  },
  canvas: { backgroundColor: SAGE, alignItems: 'center' },
  sitterHead: { marginTop: 9, width: 14, height: 14, borderRadius: 7, backgroundColor: INK },
  sitterBody: { marginTop: 2, width: 26, height: 18, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: INK },
  sitterHorns: { position: 'absolute', left: 8, top: 3, width: 20, height: 10 },
  miniHorn: {
    position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: 2.5, borderRightWidth: 2.5, borderBottomWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: EMBER,
  },
  canvasBack: { backgroundColor: WOOD.STONE, alignItems: 'center', justifyContent: 'center' },
  batten: { position: 'absolute', width: 40, height: 3, borderRadius: 1.5, backgroundColor: WOOD.SHADE },

  slate: {
    position: 'absolute', left: SLATE.x0, top: SLATE.top, width: SLATE.x1 - SLATE.x0, height: SLATE.bottom - SLATE.top,
    borderRadius: 3, borderWidth: 3, borderColor: WOOD.SHADE, backgroundColor: DEEP,
    alignItems: 'center', justifyContent: 'center',
  },
  sumRow: { flexDirection: 'row', alignItems: 'center' },
  chalk: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.3, color: PAPER_LIT, includeFontPadding: false,
  },
  digit: { marginLeft: 3, width: 8 },
  over: { position: 'absolute', left: 0, top: 0 },
  smear: { position: 'absolute', left: 6, right: 6, top: 12, height: 10, borderRadius: 5, backgroundColor: PAPER_LIT },

  label: { position: 'absolute', top: LABEL_Y, width: 60, alignItems: 'center' },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  markSlot: { marginTop: 1, width: 16, height: 14, alignItems: 'center' },
  mark: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 14, color: INK, includeFontPadding: false, textAlign: 'center',
    width: 16,
  },
  cross: { color: EMBER },
  tick: { color: TEAL },

  notebook: {
    position: 'absolute', left: NOTEBOOK.x - NOTEBOOK.w / 2, top: NOTEBOOK.y - 9, width: NOTEBOOK.w, height: 9,
    borderRadius: 1.5, borderWidth: 1.2, borderColor: INK, backgroundColor: PLATE_FACE, overflow: 'visible',
  },
  pageGlow: {
    position: 'absolute', left: -4, right: -4, top: -4, bottom: -4, borderRadius: 4, backgroundColor: SAGE,
  },
  spine: { position: 'absolute', left: NOTEBOOK.w / 2 - 0.6, top: 0, bottom: 0, width: 1.2, backgroundColor: INK },
  inkClip: { position: 'absolute', left: 1, top: -13, height: 12, overflow: 'hidden' },
  written: {
    width: 38, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },

  stick: { position: 'absolute', left: -2.5, top: -12, width: 5, height: 14, borderRadius: 1.5, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK },
  flame: {
    position: 'absolute', left: -3, top: -21, width: 6, height: 9, borderRadius: 4, backgroundColor: EMBER,
    transformOrigin: '50% 100%',
  },

  note: { position: 'absolute', top: 298, width: NOTE_W, height: 30 },
  noteFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  pin: { position: 'absolute', top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: EMBER, borderWidth: 1, borderColor: INK },
  noteText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.1, color: INK, includeFontPadding: false,
  },
  faceRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },
  tag: { position: 'absolute', top: 300, width: TAG_W, height: 44 },
  tagFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' },
  tagString: { position: 'absolute', top: 0, width: 1.2, height: 16, backgroundColor: INK },
  tagFace: {
    width: TAG_W, height: 28, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
});

export function Epistemology2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology2Scene} band={[288, 514]} camera={CAM} />;
}
