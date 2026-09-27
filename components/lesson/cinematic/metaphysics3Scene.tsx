import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './metaphysics3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, seated, stand, travelStance,
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
import {
  stairs, doorFrame, stool, table, lantern, grateBars, easel, railY,
  TREADS, CLIMB_X, DOOR, STOOL, APPLE_AT, LANTERN, STICKS, GRATE, CANVAS,
} from './metaphysics3Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// metaphysics-being-3, "What Counts as Real?" — A CELLAR STUDIO.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest).
//
//   b0   he picks the apple up off the table and looks at it; for a moment it thins,
//        partly real, between what is and what is not.
//   b1   he looks up at the grate, where the river runs past outside.
//   b2   BEING lights over the cellar door, and he points to it.
//   b3   BECOMING lights over the table, and the apple in his hand bruises.
//   b4   he sets the apple by the lantern, sits on the stool and watches its shadow
//        on the wall; then he stands, climbs the stairs a tread at a time with a
//        hand on the rail, and opens the door onto daylight.
//   b5   he shields his eyes; the Form of the apple stands in the sun.
//   b7   he comes back down, tread by tread, and sets two sticks side by side in a
//        block with a ruler across them: one is a hair longer.
//   b8   the apple on the table wrinkles; the Form in the doorway does not change.
//   b9   Q1: the apple, its shadow, its painting, the Form.   b10  Q2: odd one out.
//
// COMPOSITION, in stage units: the stairs rise left from x 142 to a landing at 452
// and the door at 6–46; the stool at 172; the table 200–282 with the apple at 218
// and the lantern at 266; the grate 298–374 high on the wall; the easel 318–378.
// He stands at 196 by the table, 62 on the landing, 214 at the sticks, 172 by the
// stool for the questions. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('metaphysics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, metaphysics-being-3. */
const LINES = [6.64, 8.32, 7.88, 4.88, 10.96, 7.2, 0, 7.0, 5.92, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
/** One tread's rise, in the rig's units at his scale. */
const RISE = 12 / K_M;
/** The stool's seat height, in the rig's units. */
const SEAT_H = (GROUND - STOOL.seat) / K_M;

const X = BEATS.map((b) => b.x ?? 172);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_APPLE = is('apple');
const A_FLOW = is('flow');
const A_BEING = is('being');
const A_BECOMING = is('becoming');
const A_CAVE = is('cave');
const A_SUN = is('sun');
const A_STICKS = is('sticks');
const A_OPINION = is('opinion');
const PLAQUES = BEATS.map((b) => b.plaques ?? 0);
const AGE = BEATS.map((b) => b.age ?? 0);
const SHADOW = BEATS.map((b) => (b.shadow ? 1 : 0));
const OPEN = BEATS.map((b) => (b.open ? 1 : 0));
const STICKS_ON = BEATS.map((b) => (b.sticks ? 1 : 0));
const GRADES = BEATS.map((b) => (b.grades ? 1 : 0));
/** The odd-one-out is being answered: a ring finds each thing in the room as it is picked (R7c). */
const ODD = BEATS.map((b) => (b.interact?.odd ? 1 : 0));
/** Where each tile's thing is in the room, in the tiles' own order: apple, shadow, painting, Form. */
const PICK_X = [APPLE_AT.x, 206, (CANVAS.x0 + CANVAS.x1) / 2, (DOOR.x0 + DOOR.x1) / 2];
const PICK_Y = [APPLE_AT.y - 2, 380, (CANVAS.top + CANVAS.bottom) / 2, 400];
const PICK_R = [12, 26, 34, 24];
const BEING_ON = PLAQUES.map((v) => (v >= 1 ? 1 : 0));
const BECOMING_ON = PLAQUES.map((v) => (v >= 2 ? 1 : 0));
/** He holds the apple from b0 until he sets it down on b4. */
const HOLD = BEATS.map((_, k) => (k <= 3 ? 1 : 0));
/** Where each beat leaves him, and on what: the landing after the climb. */
const END_X = BEATS.map((b) => b.x ?? 172);
const END_GY = BEATS.map((b) => (b.act === 'cave' || b.act === 'sun' || (b.x === 62 && !b.act) ? TREADS[3].top : GROUND));
/** Which way he faces once a beat settles: the table and the wall to the right, the door to the left. */
const DIR = BEATS.map((b) => (b.x === 62 ? -1 : 1));

/** b4 and b7: the stairs, a tread every 0.65 seconds. */
const UP_AT = [6.5, 7.15, 7.8, 8.45];
const DOWN_AT = [0.3, 0.95, 1.6, 2.25];
const STEP_S = 0.6;

const GRADE_Q = [
  { id: 'apple', label: 'THE APPLE', x: APPLE_AT.x, y: 414, w: 58, h: 44, correct: false },
  { id: 'shadow', label: 'ITS SHADOW', x: 206, y: 350, w: 64, h: 56, correct: false },
  { id: 'painting', label: 'THE PAINTING', x: (CANVAS.x0 + CANVAS.x1) / 2, y: 366, w: 70, h: 68, correct: false },
  { id: 'form', label: 'THE FORM', x: (DOOR.x0 + DOOR.x1) / 2 + 2, y: DOOR.top, w: 56, h: DOOR.bottom - DOOR.top, correct: true },
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
function handOn(s: Stance, x: number, gy: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K_M, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}
/**
 * One tread, taken the way a person takes it. Everything is in the rig's units against
 * the LOWER tread, which is the ground he is posed on for the whole step. Going UP, the
 * lead foot lifts onto the tread above, the weight rises after it, then the back foot
 * follows. Going DOWN it is the other way about: the lead foot reaches down, the weight
 * lowers, the back foot comes off the tread above. At either end both feet stand flat
 * on a tread, so the next step starts from there without a seam. The legs take turns.
 */
function treadStep(base: Stance, k: number, u: number, x0: number, x1: number, up: boolean): { s: Stance; x: number } {
  'worklet';
  const f = x1 > x0 ? 1 : -1;
  const e1 = ease01(clamp01(u / 0.42));
  const ex = ease01(clamp01((u - 0.22) / 0.56));
  const eb = ease01(clamp01((u - 0.3) / 0.45));
  const e2 = ease01(clamp01((u - 0.62) / 0.38));
  const x = lerp(x0, x1, ex);
  const leadY = up ? -RISE * e1 : -RISE * (1 - e1);
  const trailY = up ? -RISE * e2 : -RISE * (1 - e2);
  const lead = { x: ((lerp(x0 + 3 * f, x1 + 3 * f, e1) - x) * f) / K_M, y: leadY - 8 * Math.sin(Math.PI * e1) };
  const trail = { x: ((lerp(x0 - 3 * f, x1 - 3 * f, e2) - x) * f) / K_M, y: trailY - 8 * Math.sin(Math.PI * e2) };
  const lean = Math.sin(Math.PI * u);
  const s = {
    ...base,
    tilt: base.tilt - (up ? 0.14 : 0.04) * lean,
    bob: base.bob + (up ? RISE * eb : RISE * (1 - eb)),
    footR: k % 2 === 0 ? lead : trail,
    footL: k % 2 === 0 ? trail : lead,
    fistR: { x: base.fistR.x + (k % 2 === 0 ? -6 : 6) * lean, y: base.fistR.y },
    fistL: { x: base.fistL.x + (k % 2 === 0 ? 6 : -6) * lean, y: base.fistL.y },
  };
  return { s, x };
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics'));

export default function Metaphysics3Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(16);
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
    const xp = END_X[p];
    const xn = X[n];
    const gp = END_GY[p];
    const choreo = A_CAVE[n] || A_STICKS[n];
    const walking = !choreo && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    let tx = xn;
    let gy = END_GY[n];
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    let sit = 0;
    let railHand = 0;
    let stepping = 0;
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);

    if (A_CAVE[n]) {
      // set the apple down, to the stool, sit and watch, stand, to the stairs, climb
      const toStool = ease01(clamp01((b - 0.8) / moveTr(xp, STOOL.x, TR)));
      const toFoot = ease01(clamp01((b - 6.0) / moveTr(STOOL.x, CLIMB_X[0], TR)));
      tx = lerp(lerp(xp, STOOL.x, toStool), CLIMB_X[0], toFoot);
      gy = GROUND;
      if (toStool > 0 && toStool < 1) s = travelStance(xp, STOOL.x, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), toStool, WALK, 0);
      if (toFoot > 0 && toFoot < 1) s = travelStance(STOOL.x, CLIMB_X[0], hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), toFoot, WALK, 0);
      sit = sec(1.4, 2.0) * (1 - sec(5.3, 5.9));
      let done = 0;
      for (let k = 0; k < 4; k++) {
        const u = clamp01((b - UP_AT[k]) / STEP_S);
        if (u >= 1) done = k + 1;
        else if (u > 0) {
          const step = treadStep(hLive(P[n], t, b), k, u, CLIMB_X[k], CLIMB_X[k + 1], true);
          s = step.s;
          tx = step.x;
          stepping = 1;
        }
      }
      railHand = sec(UP_AT[0] - 0.25, UP_AT[0]) * (1 - sec(UP_AT[3] + STEP_S, UP_AT[3] + STEP_S + 0.3));
      if (b >= UP_AT[0]) {
        gy = TREADS[Math.max(0, done - 1)].top;
        if (done === 0) gy = GROUND;
        if (done > 0 && !stepping) tx = CLIMB_X[done];
        // standing on a tread: the pose is flat against it
        if (stepping && done > 0) gy = TREADS[done - 1].top;
      }
      const d0 = 1 - 2 * sec(0.6, 0.8) + 2 * sec(1.35, 1.55) - 2 * sec(5.7, 5.95);
      dirV = lerp(facing(DIR[p], 1, b), d0, clamp01(b / 0.4));
    } else if (A_STICKS[n]) {
      // turn to the stairs, down them tread by tread, then along to the table
      let done = 0;
      for (let k = 0; k < 4; k++) {
        const u = clamp01((b - DOWN_AT[k]) / STEP_S);
        const from = 4 - k;
        if (u >= 1) done = k + 1;
        else if (u > 0) {
          const step = treadStep(hLive(P[n], t, b), k, u, CLIMB_X[from], CLIMB_X[from - 1], false);
          s = step.s;
          tx = step.x;
          stepping = 1;
          gy = from - 2 >= 0 ? TREADS[from - 2].top : GROUND;
        }
      }
      railHand = sec(DOWN_AT[0] - 0.25, DOWN_AT[0]) * (1 - sec(DOWN_AT[3] + STEP_S, DOWN_AT[3] + STEP_S + 0.3));
      if (!stepping) {
        const at = 4 - done;
        gy = at - 1 >= 0 ? TREADS[at - 1].top : GROUND;
        tx = CLIMB_X[at];
        if (done === 4) {
          const toTable = ease01(clamp01((b - 2.95) / moveTr(CLIMB_X[0], xn, TR)));
          tx = lerp(CLIMB_X[0], xn, toTable);
          if (toTable > 0 && toTable < 1) s = travelStance(CLIMB_X[0], xn, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), toTable, WALK, 0);
        }
      }
      dirV = facing(DIR[p], 1, b);
    }
    const dir = dirV < 0 ? -1 : 1;
    const x = n === 0 ? tx : carry(cv, 0, n, xp, tx, walking ? walkU : choreo ? 1 : tr);
    const figGY = n === 0 ? gy : carry(cv, 1, n, gp, gy, choreo ? 1 : tr);

    // a hand on the rail, a little ahead of him, all the way up and all the way down
    s = handOn(s, x, figGY, dir, x + 5 * dir, railY(x + 5 * dir), railHand);
    // sitting on the stool
    s = mixStance(s, { ...seated(SEAT_H, t), neck: -0.12 }, sit);

    // ── the apple in his hand ────────────────────────────────────────────────
    const pick = A_APPLE[n] ? pulse(0.3, 0.8, 1.3) : 0;
    s = handOn(s, x, figGY, dir, APPLE_AT.x, APPLE_AT.y - 2, pick);
    const holding = A_APPLE[n] ? sec(0.75, 0.85) : A_CAVE[n] ? 1 - sec(0.45, 0.55) : HOLD[n];
    const look = (A_APPLE[n] ? sec(1.2, 1.8) : HOLD[n] && !A_CAVE[n] ? 1 : 0) * (1 - (A_BEING[n] ? pulse(3.8, 4.4, 6.2) : 0));
    // held out in front of his chest, clear of his head, where he can look at it
    s = mixStance(s, { ...s, fistR: { x: 25, y: -18 } }, look * holding);
    const put = A_CAVE[n] ? pulse(0.05, 0.4, 0.7) : 0;
    s = handOn(s, x, figGY, dir, APPLE_AT.x, APPLE_AT.y - 2, put);
    // pointing to BEING over the door (b2)
    const point = A_BEING[n] ? pulse(3.8, 4.4, 6.2) : 0;
    s = handOn(s, x, figGY, dir, DOOR.x1 - 6, 330, point);
    // looking up at the river (b1)
    const upLook = A_FLOW[n] ? pulse(0.8, 1.6, 7.0) : 0;
    s = { ...s, neck: s.neck + 0.25 * upLook };
    // opening the door, and shielding his eyes from the day (b4, b5)
    const knob = A_CAVE[n] ? pulse(9.1, 9.4, 9.95) : 0;
    s = handOn(s, x, figGY, dir, DOOR.x1 - 6, 404, knob);
    const shield = A_SUN[n] ? pulse(0.3, 0.9, 3.4) : 0;
    s = mixStance(s, { ...s, fistR: { x: 9, y: -74 }, neck: s.neck - 0.1 }, shield);
    // the sticks set in their block, then the ruler across them (b7)
    const setSticks = A_STICKS[n] ? pulse(4.1, 4.45, 4.9) : 0;
    s = handOn(s, x, figGY, dir, STICKS.x, STICKS.base - 22, setSticks);
    const setRuler = A_STICKS[n] ? pulse(5.2, 5.55, 6.1) : 0;
    s = handOn(s, x, figGY, dir, STICKS.x + 5, STICKS.base - 42, setRuler);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the room ─────────────────────────────────────────────────────────────
    const fade = A_APPLE[n] ? pulse(3.6, 4.4, 6.0) : 0;
    const age = A_BECOMING[n] ? st(0.3, 0.8) : A_OPINION[n] ? 1 + st(0.15, 0.6) : AGE[n];
    const lit = A_CAVE[n] ? sec(1.8, 3.0) : SHADOW[n];
    const open = A_CAVE[n] ? sec(9.3, 9.9) : OPEN[n];
    const day = A_CAVE[n] ? sec(9.4, 10.5) : OPEN[n];
    const form = A_SUN[n] ? sec(1.5, 3.4) : A_CAVE[n] ? 0 : OPEN[n];

    return {
      fig: lookPose(fig, x, figGY, K_M, dirV, 1, gazeX.value, gazeY.value, gazeOn.value),
      holding: carry(cv, 2, n, HOLD[p], holding, tr),
      fade: carry(cv, 3, n, 0, fade, tr),
      age: carry(cv, 4, n, AGE[p], age, tr),
      being: carry(cv, 5, n, BEING_ON[p], A_BEING[n] ? sec(3.6, 4.2) : BEING_ON[n], tr),
      becoming: carry(cv, 6, n, BECOMING_ON[p], A_BECOMING[n] ? sec(0.2, 1.0) : BECOMING_ON[n], tr),
      lit: carry(cv, 7, n, SHADOW[p], lit, tr),
      open: carry(cv, 8, n, OPEN[p], open, tr),
      day: carry(cv, 9, n, OPEN[p], day, tr),
      form: carry(cv, 10, n, OPEN[p] && !A_CAVE[p] ? 1 : 0, form, tr),
      sticks: carry(cv, 11, n, STICKS_ON[p], A_STICKS[n] ? sec(4.3, 4.7) : STICKS_ON[n], tr),
      ruler: carry(cv, 12, n, STICKS_ON[p], A_STICKS[n] ? sec(5.45, 5.9) : STICKS_ON[n], tr),
      grades: carry(cv, 13, n, GRADES[p], GRADES[n], tr),
      glow: carry(cv, 14, n, 0, A_OPINION[n] ? pulse(2.0, 3.0, 5.5) : 0, tr),
      ring: carry(cv, 15, n, 0, ODD[n], tr),
      ringX: ODD[n] ? pickAt(PICK_X, pickPos.value) : PICK_X[0],
      ringY: ODD[n] ? pickAt(PICK_Y, pickPos.value) : PICK_Y[0],
      ringR: ODD[n] ? pickAt(PICK_R, pickPos.value) : PICK_R[0],
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const apple = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = SCENE.value.holding;
    return {
      opacity: 1 - 0.6 * SCENE.value.fade,
      transform: [
        { translateX: lerp(APPLE_AT.x, w[0].translateX, h) },
        { translateY: lerp(APPLE_AT.y, w[1].translateY - 3, h) },
        { scale: 1 - 0.12 * clamp01(SCENE.value.age - 1) },
      ],
    };
  });
  const bruise = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.age) }));
  const wrinkle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.age - 1) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((k) => <View key={k} style={[styles.course, { top: 18 + k * 30 }]} />)}
      </View>
      <River S={SCENE} />
      <ObjectArt parts={GRATE_ART} tone={WALL} />
      <Doorway S={SCENE} />
      <ObjectArt parts={DOOR_ART} tone={WOOD} />
      <Plaques S={SCENE} on={on} />
      <Shadow S={SCENE} />
      <ObjectArt parts={STAIRS_ART} tone={WOOD} />
      <Spill S={SCENE} />
      <ObjectArt parts={EASEL_ART} tone={WOOD} />
      <View style={styles.canvas} pointerEvents="none">
        <View style={styles.paintApple} />
        <View style={styles.paintStem} />
        <View style={styles.paintLeaf} />
      </View>
      <ObjectArt parts={STOOL_ART} tone={WOOD} />
      <ObjectArt parts={TABLE_ART} tone={WOOD} />
      <ObjectArt parts={LANTERN_ART} tone={WOOD} />
      <Flame S={SCENE} />
      {on(STICKS_ON) ? <Sticks S={SCENE} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_M} />
      <Animated.View style={[styles.rider, apple]} pointerEvents="none">
        <View style={styles.apple} />
        <Animated.View style={[styles.bruise, bruise]} />
        <Animated.View style={[styles.wrinkle, wrinkle]} />
        <View style={styles.stem} />
      </Animated.View>
      {GRADES[i] ? <Grades picked={picked} onPick={onPick} S={SCENE} /> : null}
      {on(ODD) ? <PickRing S={SCENE} /> : null}
    </View>
  );
}

const STAIRS_ART = stairs();
const DOOR_ART = doorFrame();
const STOOL_ART = stool();
const TABLE_ART = table();
const LANTERN_ART = lantern();
const GRATE_ART = grateBars();
const EASEL_ART = easel();

// ── the river past the grate ─────────────────────────────────────────────────

function River({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.river} pointerEvents="none">
      {[0, 1, 2].map((k) => <Ripple key={k} S={S} k={k} />)}
    </View>
  );
}
function Ripple({ S, k }: { S: SharedValue<any>; k: number }) {
  // the water always runs one way, and never the same water twice
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: ((S.value.t * 22 + k * 30) % 96) - 20 }] }));
  return <Animated.View style={[styles.ripple, { top: 5 + k * 5 }, st]} />;
}

// ── the door, and the day beyond it ──────────────────────────────────────────

function Doorway({ S }: { S: SharedValue<any> }) {
  const leaf = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.08, 1 - 0.92 * S.value.open) }] }));
  const light = useAnimatedStyle(() => ({ opacity: S.value.day }));
  const form = useAnimatedStyle(() => ({ opacity: S.value.form * (0.85 + 0.15 * Math.sin(S.value.t * 2)) + 0.25 * S.value.glow }));
  return (
    <>
      <Animated.View style={[styles.daylight, light]} pointerEvents="none">
        <View style={styles.sun} />
        <Animated.View style={[styles.formRing, form]}>
          <View style={styles.formStem} />
          <View style={styles.formLeaf} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.leaf, leaf]} pointerEvents="none">
        {[0, 1, 2].map((k) => <View key={k} style={[styles.plank, { left: 4 + k * 12 }]} />)}
        <View style={styles.knob} />
      </Animated.View>
    </>
  );
}
function Spill({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.4 * S.value.day }));
  return <Animated.View style={[styles.spill, st]} pointerEvents="none" />;
}

// ── BEING over the door, BECOMING over the table ────────────────────────────

function Plaques({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const being = useAnimatedStyle(() => ({ opacity: S.value.being, transform: [{ translateY: (1 - S.value.being) * -6 }] }));
  const becoming = useAnimatedStyle(() => ({ opacity: S.value.becoming, transform: [{ translateY: (1 - S.value.becoming) * -6 }] }));
  return (
    <>
      {on(BEING_ON) ? (
        <Animated.View style={[styles.plaque, styles.beingPlaque, being]} pointerEvents="none">
          <Text style={styles.plaqueText} numberOfLines={1}>BEING</Text>
        </Animated.View>
      ) : null}
      {on(BECOMING_ON) ? (
        <Animated.View style={[styles.plaque, styles.becomingPlaque, becoming]} pointerEvents="none">
          <Text style={styles.plaqueText} numberOfLines={1}>BECOMING</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── the lantern's flame and the apple's shadow on the wall ──────────────────

function Flame({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * S.value.lit,
    transform: [{ scaleY: 0.85 + 0.2 * Math.sin(S.value.t * 11) }],
  }));
  return <Animated.View style={[styles.flame, st]} pointerEvents="none" />;
}
function Shadow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.32 * S.value.lit,
    transform: [{ scale: 0.7 + 0.3 * S.value.lit + 0.02 * Math.sin(S.value.t * 11) }],
  }));
  return (
    <Animated.View style={[styles.shadow, st]} pointerEvents="none">
      <View style={styles.shadowApple} />
      <View style={styles.shadowStem} />
    </Animated.View>
  );
}

// ── two sticks that should be equal, and the ruler that says they are not ───

function Sticks({ S }: { S: SharedValue<any> }) {
  const sticks = useAnimatedStyle(() => ({ opacity: S.value.sticks, transform: [{ translateY: (1 - S.value.sticks) * -8 }] }));
  const ruler = useAnimatedStyle(() => ({ opacity: S.value.ruler, transform: [{ translateY: (1 - S.value.ruler) * -6 }, { rotate: '-4deg' }] }));
  return (
    <>
      <Animated.View style={[styles.sticksBox, sticks]} pointerEvents="none">
        <View style={[styles.stick, { left: 2, height: 38, top: 3 }]} />
        <View style={[styles.stick, { left: 12, height: 41, top: 0 }]} />
        <View style={styles.block} />
      </Animated.View>
      <Animated.View style={[styles.ruler, ruler]} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => <View key={k} style={[styles.tickMark, { left: 3 + k * 7 }]} />)}
      </Animated.View>
    </>
  );
}

// ── Q2: the thing picked is ringed where it stands in the room ─────────────

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

// ── Q1: the four grades, labelled where they are ────────────────────────────

function Grades({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.grades }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {GRADE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.grade, { left: q.x - q.w / 2, top: q.y, width: q.w, height: q.h }]}
        >
          <View style={styles.gradeFill}>
            <View style={[styles.gradeTag, answered && q.correct && styles.tagRight]}>
              <Text style={[styles.gradeText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const DOOR_W = DOOR.x1 - DOOR.x0;
const DOOR_H = DOOR.bottom - DOOR.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: WALL.RULE },
  rider: { position: 'absolute', left: 0, top: 0 },

  river: {
    position: 'absolute', left: GRATE.x0, top: GRATE.top, width: GRATE.x1 - GRATE.x0, height: GRATE.bottom - GRATE.top,
    backgroundColor: TEAL, overflow: 'hidden', borderRadius: 1,
  },
  ripple: { position: 'absolute', left: 0, width: 26, height: 1.6, borderRadius: 1, backgroundColor: PAPER_LIT, opacity: 0.7 },

  daylight: {
    position: 'absolute', left: DOOR.x0, top: DOOR.top, width: DOOR_W, height: DOOR_H, backgroundColor: PAPER_LIT,
    overflow: 'hidden', borderRadius: 1,
  },
  sun: { position: 'absolute', left: 24, top: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: EMBER },
  formRing: {
    position: 'absolute', left: DOOR_W / 2 - 11, top: 44, width: 22, height: 21, borderRadius: 11,
    borderWidth: 2, borderColor: INK,
  },
  formStem: { position: 'absolute', left: 9, top: -7, width: 2, height: 7, borderRadius: 1, backgroundColor: INK },
  formLeaf: {
    position: 'absolute', left: 11, top: -8, width: 8, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: INK,
    transform: [{ rotate: '-20deg' }],
  },
  leaf: {
    position: 'absolute', left: DOOR.x0, top: DOOR.top, width: DOOR_W, height: DOOR_H, borderRadius: 1,
    backgroundColor: WOOD.SHADE, borderWidth: 1.5, borderColor: INK, transformOrigin: '0% 50%',
  },
  plank: { position: 'absolute', top: 4, bottom: 4, width: 1.2, borderRadius: 0.6, backgroundColor: INK, opacity: 0.35 },
  pickRing: { position: 'absolute', left: 0, top: 0, borderWidth: 2.5, borderColor: EMBER },
  knob: { position: 'absolute', right: 5, top: DOOR_H / 2 + 6, width: 5, height: 5, borderRadius: 2.5, backgroundColor: INK },
  spill: {
    position: 'absolute', left: 0, top: DOOR.bottom - 2, width: 150, height: 10, borderRadius: 5, backgroundColor: PAPER_LIT,
  },

  plaque: {
    position: 'absolute', height: 15, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  beingPlaque: { left: 2, top: 318, width: 58 },
  becomingPlaque: { left: 214, top: 322, width: 70 },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  flame: {
    position: 'absolute', left: LANTERN.x - 3, top: LANTERN.y - 3, width: 6, height: 9, borderRadius: 3,
    backgroundColor: EMBER, transformOrigin: '50% 100%',
  },
  shadow: { position: 'absolute', left: 184, top: 356, width: 44, height: 46, transformOrigin: '50% 100%' },
  shadowApple: { position: 'absolute', left: 2, top: 8, width: 40, height: 36, borderRadius: 20, backgroundColor: INK },
  shadowStem: { position: 'absolute', left: 21, top: 0, width: 3, height: 10, borderRadius: 1.5, backgroundColor: INK },

  canvas: {
    position: 'absolute', left: CANVAS.x0, top: CANVAS.top, width: CANVAS.x1 - CANVAS.x0, height: CANVAS.bottom - CANVAS.top,
    borderRadius: 2, borderWidth: 3, borderColor: WOOD.SHADE, backgroundColor: PLATE_FACE, alignItems: 'center',
  },
  paintApple: { position: 'absolute', left: 17, top: 16, width: 20, height: 19, borderRadius: 10, backgroundColor: EMBER },
  paintStem: { position: 'absolute', left: 26, top: 9, width: 2, height: 7, borderRadius: 1, backgroundColor: INK },
  paintLeaf: { position: 'absolute', left: 28, top: 8, width: 8, height: 4, borderRadius: 2, backgroundColor: OLIVE },

  sticksBox: { position: 'absolute', left: STICKS.x - 4, top: STICKS.base - 44, width: 20, height: 46 },
  stick: { position: 'absolute', width: 4, borderRadius: 1.5, backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK },
  block: { position: 'absolute', left: -2, bottom: 0, width: 24, height: 6, borderRadius: 1.5, backgroundColor: DEEP },
  ruler: {
    position: 'absolute', left: STICKS.x - 12, top: STICKS.base - 48, width: 38, height: 5, borderRadius: 1,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK,
  },
  tickMark: { position: 'absolute', top: 0, width: 1, height: 2.5, backgroundColor: INK },

  apple: { position: 'absolute', left: -6, top: -6, width: 12, height: 11, borderRadius: 6, backgroundColor: EMBER, borderWidth: 1, borderColor: INK },
  bruise: { position: 'absolute', left: -3, top: -3, width: 5, height: 4, borderRadius: 2, backgroundColor: OLIVE },
  wrinkle: { position: 'absolute', left: -6, top: -6, width: 12, height: 11, borderRadius: 6, backgroundColor: DEEP, opacity: 0.5 },
  stem: { position: 'absolute', left: -0.75, top: -10, width: 1.5, height: 5, backgroundColor: INK },

  grade: { position: 'absolute' },
  gradeFill: { flexGrow: 1, alignItems: 'center' },
  gradeTag: {
    marginTop: -2, paddingHorizontal: 4, height: 14, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  gradeText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },
});

export function Metaphysics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics3Scene} band={[288, 514]} camera={CAM} />;
}
