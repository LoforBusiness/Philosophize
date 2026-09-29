import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './aesthetics3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
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
  theatre, cord, frame, paintedShip, urn, pedestal, basin, piano,
  THEATRE, CORD, MASK, STAGE_LAMP, PAINTING, URN, TAP, BASIN, PIANO, KEYS, AT_CORD, AT_PIANO,
} from './aesthetics3Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// aesthetics-aesthetics-3, "Why Humans Love Music and Stories" — A MUSIC ROOM WITH A
// PUPPET THEATRE.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest). A
// grave word is in it (N11), so nothing in it is a gag.
//
//   b0   he plays two notes on the piano, then turns to look at the theatre.
//   b1   he walks to the theatre and pulls its cord; the curtains open on a tragic mask.
//   b2   back at the urn, it fills with pity and fear; he opens the tap and they run
//        out into the basin.
//   b3   the urn's plate reads CATHARSIS.
//   b4   he pulls the cord again and the stage lamp lights the mask: RECOGNITION.
//   b5   he turns to the storm on the wall, lightning in it.
//   b6   Q1 on the stage: the urn or the painting.
//   b7   at the piano, he plays; notes rise, and he goes sad for no reason. THE WILL.
//   b8   he lowers the fallboard halfway over the keys.
//   b10  Q2: the order control lifts and lowers the fallboard as the answer moves (R7c).
//
// COMPOSITION, in stage units: the theatre 10–110 from 344, its cord at 114; the
// painting 150–206 × 340–392; the amphora at 234 (400–454) on a marble console on the
// wall, its spigot at 258 over a wall basin 247–269; the upright piano 286–372 from
// 404 in three-quarter view, its keyboard 291–367 at 448. He stands at 130 by the cord
// and at 276 between the spigot and the keys. Band [288, 514].
//
// The amphora and the piano were redrawn on 2026-09-28 against references (see
// aesthetics3Set): the urn had read as a pink egg on a hook, the piano as a cabinet.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('aesthetics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const CLOTH = stageToneOf(TEAL);
/**
 * Terracotta: the ember taken a third of the way to the olive, which is a fired-clay
 * brown rather than the pink the ember's own light tone gives; its shade toward ink.
 */
const TERRA = mix(EMBER, OLIVE, 0.3);
const CLAY = { ...stageToneOf(EMBER), STONE: TERRA, SHADE: mix(TERRA, INK, 0.28) };
/** White marble: the console and the basin, shaded in the wall's own tone. */
const MARBLE = { ...WALL, STONE: PAPER_LIT, SHADE: WALL.STONE };
const TR = 0.85;
/** Where the notes rise from: just over the keys, left of the middle. */
const NOTE_X = KEYS.x0 + 16;
const NOTE_Y = KEYS.y - 12;
/** The keyboard: fourteen white keys, and the black keys in their twos and threes. */
const WHITE_N = 14;
const WHITE_W = (KEYS.x1 - KEYS.x0) / WHITE_N;
const WHITE_GAPS = Array.from({ length: WHITE_N - 1 }, (_, k) => k);
const BLACK_AT = WHITE_GAPS.filter((k) => [0, 1, 3, 4, 5].includes(k % 7));
/** The fallboard, in front view: it comes down over the keys from the lip above them. */
const FALL_TOP = KEYS.y - 5;
const FALL_H = 10;
/** Where the pity and fear show rising inside the amphora: a window on its belly. */
const URN_WIN = { x: URN.x - 11, y: URN.top + 20, w: 22, h: 26 };

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, aesthetics-aesthetics-3. */
const LINES = [6.88, 6.16, 5.2, 6.8, 10.48, 5.76, 0, 9.48, 7.64, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? AT_PIANO);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_MUSIC = is('music');
const A_CURTAIN = is('curtain');
const A_FILL = is('fill');
const A_NAMED = is('named');
const A_RECOG = is('recognise');
const A_IMAGE = is('image');
const A_WILL = is('will');
const A_PLATO = is('plato');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const OPEN = flag((b) => b.open);
const DRAINED = flag((b) => b.drained);
const NAMED = flag((b) => b.named);
const LIT = flag((b) => b.lit);
const Q1 = flag((b) => b.q1);
const WILL = flag((b) => b.will);
const LID = BEATS.map((b) => b.lid ?? 0);
/** The order control is being answered: the fallboard follows it (R7c) — open, halfway, shut. */
const ORDER = flag((b) => b.interact?.order);
const LID_AT = [0, 0.5, 1];
/** Which way he faces once each beat settles: the tap and the theatre to his left, then right. */
const DIR = BEATS.map((b, k) => (k <= 4 ? -1 : 1));

const Q1_T = [
  { id: 'catharsis', label: 'CATHARSIS', x: URN.x - 30, y: URN.top - 20, w: 60, h: URN.bottom - URN.top + 26, correct: true },
  { id: 'mimesis', label: 'MIMESIS', x: PAINTING.x0 - 2, y: PAINTING.top - 2, w: 56, h: PAINTING.bottom - PAINTING.top + 14, correct: false },
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
/**
 * The fallboard's front edge where his hand takes it, for a lid 0 (up in the case) to
 * 1 (down over the keys). The piano is seen from the front, so lowering it is the
 * board coming DOWN over the keyboard; he holds it near the left, where he stands.
 */
function lidEdge(lid: number): { x: number; y: number } {
  'worklet';
  return { x: KEYS.x0 + 10, y: FALL_TOP + FALL_H * lid };
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics'));

export default function Aesthetics3Scene({
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
    const xp = X[p];
    const xn = X[n];
    const walking = Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const x = n === 0 ? xn : carry(cv, 0, n, xp, xn, walking ? walkU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    // b0 opens at the piano, facing its keys, and turns to the theatre as the line reaches stories
    if (n === 0) dirV = lerp(1, DIR[0], ease01(clamp01((b - 4.3) / 0.3)));
    const dir = dirV < 0 ? -1 : 1;
    const arrive = walking ? walkDur : 0;

    // ── at the piano: both hands on the keys, pressing (b0, b7), then off them ──
    const keys = A_MUSIC[n] ? sec(0.5, 0.9) * (1 - sec(3.7, 4.1)) : A_WILL[n] ? sec(arrive + 0.2, arrive + 0.6) : A_PLATO[n] ? 1 - sec(0.2, 0.5) : 0;
    const press = 1.6 * Math.abs(Math.sin(t * 5));
    s = handOn(s, x, dir, 1, KEYS.x0 + 10, KEYS.y - 3 + press, keys);
    s = handOn(s, x, dir, -1, KEYS.x0 + 5, KEYS.y - 3 + 1.6 - press, keys);
    // the fallboard lowered halfway, a hand on its edge (b8)
    const lid = A_PLATO[n] ? 0.5 * sec(1.3, 2.6) : ORDER[n] ? pickAt(LID_AT, pickPos.value) : LID[n];
    const edge = lidEdge(lid);
    const lower = A_PLATO[n] ? pulse(0.9, 1.3, 3.0) : 0;
    s = handOn(s, x, dir, 1, edge.x, edge.y, lower);
    // sad for no reason (b7): the head goes down while he plays. A POSITIVE neck is
    // down in this rig (moves' code 25, "still looking up", is neck −0.10), so this
    // was tipping his head UP until 2026-09-28.
    s = { ...s, neck: s.neck + 0.2 * (A_WILL[n] ? sec(arrive + 2.0, arrive + 3.0) : 0) };

    // ── the theatre's cord (b1, b4) ─────────────────────────────────────────
    const cordAt = A_CURTAIN[n] || A_RECOG[n] ? arrive + 0.25 : 99;
    const pull = pulse(cordAt, cordAt + 0.3, cordAt + 0.95);
    const tug = 8 * pulse(cordAt + 0.3, cordAt + 0.5, cordAt + 0.8);
    s = handOn(s, x, dir, 1, CORD.x, CORD.handle + tug, pull);

    // ── the urn's tap (b2) ──────────────────────────────────────────────────
    const tapT = A_FILL[n] ? arrive + 0.35 : 99;
    const turn = pulse(tapT, tapT + 0.3, tapT + 1.3);
    // his hand on the spigot's key, which stands up off the spout (aesthetics3Set)
    s = handOn(s, x, dir, 1, TAP.x - 3, TAP.y - 5 + 2 * Math.sin(Math.PI * sec(tapT + 0.3, tapT + 0.7)), turn);

    // ── a hand out to the storm on the wall (b5), and a tilt of the head at the word (b3) ──
    s = { ...s, tilt: s.tilt + 0.06 * (A_NAMED[n] ? pulse(1.6, 2.2, 4.4) : 0) };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the room ─────────────────────────────────────────────────────────────
    const open = A_CURTAIN[n] ? sec(cordAt + 0.45, cordAt + 1.5) : OPEN[n];
    const level = A_FILL[n] ? sec(0.6, arrive + 0.3) * (1 - sec(tapT + 0.55, tapT + 2.0)) : 0;
    const stream = A_FILL[n] ? sec(tapT + 0.45, tapT + 0.6) * (1 - sec(tapT + 1.9, tapT + 2.1)) : 0;
    const basin = A_FILL[n] ? sec(tapT + 0.6, tapT + 2.0) : DRAINED[n];
    const named = A_NAMED[n] ? sec(0.4, 1.0) : NAMED[n];
    const lit = A_RECOG[n] ? sec(cordAt + 0.5, cordAt + 1.3) : LIT[n];
    const recog = A_RECOG[n] ? st(0.58, 0.66) : LIT[n];
    const flash = A_IMAGE[n] ? pulse(1.4, 1.5, 1.9) + pulse(2.6, 2.7, 3.1) : 0;
    const will = A_WILL[n] ? st(0.7, 0.78) : WILL[n];
    const notes = A_MUSIC[n] ? sec(0.9, 1.2) * (1 - sec(3.8, 4.4)) : A_WILL[n] ? sec(arrive + 0.6, arrive + 1.0) : A_PLATO[n] ? 1 - sec(0.2, 1.0) : 0;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // Every key is an event this scene already times: the keys under his hands, the
    // notes rising off them (Note draws them at x 306–328 from y 432 up), the cord
    // he pulls (cordAt), the curtains opening on the mask, the tap he turns (tapT)
    // and the water into the basin, the CATHARSIS plate over the urn, the lamp and
    // the RECOGNITION plate, the storm, the fallboard's edge as it comes down (live).
    // On the will beat he lets go at arrive + 2.0, so his own sad head shows.
    const LK = A_MUSIC[n] ? [0.3, KEYS.x0 + 8, KEYS.y, 1, 1.2, NOTE_X + 12, NOTE_Y - 30, 0.9, 4.2, MASK.x, MASK.y, 0.8, L * 0.92, 0, 0, 0]
      : A_CURTAIN[n] ? [0.2, CORD.x, CORD.handle - 30, 0.7, cordAt, CORD.x, CORD.handle, 1, cordAt + 0.5, MASK.x, MASK.y, 1, L * 0.93, 0, 0, 0]
      : A_FILL[n] ? [0.3, URN.x, (URN.top + URN.bottom) / 2, 1, tapT, TAP.x, TAP.y, 1, tapT + 0.5, (BASIN.x0 + BASIN.x1) / 2, BASIN.top, 1, tapT + 2.2, 0, 0, 0]
      : A_NAMED[n] ? [0.3, URN.x, URN.top - 10, 1, L * 0.55, 0, 0, 0]
      : A_RECOG[n] ? [0.2, CORD.x, CORD.handle - 30, 0.7, cordAt, CORD.x, CORD.handle, 1, cordAt + 0.5, STAGE_LAMP.x, STAGE_LAMP.y, 1, cordAt + 1.3, MASK.x, MASK.y, 1, L * 0.58, MASK.x, THEATRE.top + 8, 1, L * 0.9, 0, 0, 0]
      : A_IMAGE[n] ? [0.3, (PAINTING.x0 + PAINTING.x1) / 2, (PAINTING.top + PAINTING.bottom) / 2, 1, L * 0.9, 0, 0, 0]
      : Q1[n] ? [0.3, (PAINTING.x0 + PAINTING.x1) / 2, (PAINTING.top + PAINTING.bottom) / 2, 0.6, 1.4, URN.x, URN.top + 20, 0.6, 2.6, 0, 0, 0]
      : A_WILL[n] ? [0.2, KEYS.x0 + 8, KEYS.y, 0.7, arrive + 0.2, KEYS.x0 + 8, KEYS.y, 1, arrive + 0.8, NOTE_X + 12, NOTE_Y - 30, 0.9, arrive + 2.0, 0, 0, 0]
      : A_PLATO[n] ? [0.2, KEYS.x0 + 8, KEYS.y, 0.8, 0.9, edge.x, edge.y, 1, 3.2, 0, 0, 0]
      : ORDER[n] ? [0.3, edge.x, edge.y, 0.7]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);
    return {
      fig: lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 13, n, lk.x, lk.x, tr), carry(cv, 14, n, lk.y, lk.y, tr), carry(cv, 15, n, 0, lk.w, tr)),
      open: carry(cv, 1, n, OPEN[p], open, tr),
      level: carry(cv, 2, n, 0, level, tr),
      stream: carry(cv, 3, n, 0, stream, tr),
      basin: carry(cv, 4, n, DRAINED[p], basin, tr),
      named: carry(cv, 5, n, NAMED[p], named, tr),
      lit: carry(cv, 6, n, LIT[p], lit, tr),
      recog: carry(cv, 7, n, LIT[p], recog, tr),
      flash: carry(cv, 8, n, 0, flash, tr),
      q1: carry(cv, 9, n, Q1[p], Q1[n], tr),
      will: carry(cv, 10, n, WILL[p], will, tr),
      lid: carry(cv, 11, n, LID[p], lid, tr),
      notes: carry(cv, 12, n, 0, notes, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
      </View>
      <ObjectArt parts={FRAME_ART} tone={WOOD} />
      <Painting S={SCENE} />
      <Stage S={SCENE} />
      <ObjectArt parts={THEATRE_ART} tone={WOOD} />
      <Curtains S={SCENE} />
      <ObjectArt parts={CORD_ART} tone={CLOTH} />
      <Urn S={SCENE} />
      <SetArt parts={PIANO_ART} tone={WOOD} />
      <View style={styles.keyboard} pointerEvents="none">
        {WHITE_GAPS.map((k) => <View key={`w${k}`} style={[styles.whiteGap, { left: (k + 1) * WHITE_W - 1.4 }]} />)}
        {BLACK_AT.map((k) => <View key={`b${k}`} style={[styles.blackKey, { left: (k + 1) * WHITE_W - 2.4 }]} />)}
      </View>
      <Fallboard S={SCENE} />
      <Plates S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_M} />
      <Notes S={SCENE} />
      {Q1[i] ? <Answers picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const THEATRE_ART = theatre();
const CORD_ART = cord();
const FRAME_ART = frame();
const SHIP_ART = paintedShip();
const URN_ART = urn();
const CONSOLE_ART = pedestal();
const BASIN_ART = basin();
const PIANO_ART = piano();

// ── the storm on the wall ────────────────────────────────────────────────────

function Painting({ S }: { S: SharedValue<any> }) {
  const bolt = useAnimatedStyle(() => ({ opacity: S.value.flash }));
  const sky = useAnimatedStyle(() => ({ opacity: 0.35 * S.value.flash }));
  const rock = useAnimatedStyle(() => ({ transform: [{ rotate: `${4 * Math.sin(S.value.t * 1.3)}deg` }] }));
  return (
    <View style={styles.canvas} pointerEvents="none">
      <Animated.View style={[styles.skyFlash, sky]} />
      <Animated.View style={[StyleSheet.absoluteFill, rock]}>
        <ObjectArt parts={SHIP_ART} tone={WOOD} />
      </Animated.View>
      <View style={styles.sea} />
      <View style={[styles.wave, { left: 4 }]} />
      <View style={[styles.wave, { left: 26 }]} />
      <Animated.View style={[styles.bolt, bolt]}>
        <View style={[styles.boltBar, { left: 0, top: 0, transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.boltBar, { left: 3, top: 8, transform: [{ rotate: '-25deg' }] }]} />
      </Animated.View>
    </View>
  );
}

// ── the little stage: the mask, the lamp over it, and the curtains ───────────

function Stage({ S }: { S: SharedValue<any> }) {
  const dim = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - S.value.lit) }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.4 * S.value.lit }));
  const bulb = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * S.value.lit }));
  return (
    <View style={styles.opening} pointerEvents="none">
      <Animated.View style={[styles.cone, glow]} />
      <View style={styles.mask}>
        <View style={[styles.eye, { left: 5 }]} />
        <View style={[styles.eye, { right: 5 }]} />
        <View style={styles.mouth} />
      </View>
      <Animated.View style={[styles.dim, dim]} />
      <Animated.View style={[styles.bulb, bulb]} />
    </View>
  );
}
function Curtains({ S }: { S: SharedValue<any> }) {
  const left = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.78 * S.value.open }] }));
  const right = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.78 * S.value.open }] }));
  return (
    <>
      <Animated.View style={[styles.curtain, styles.curtainL, left]} pointerEvents="none" />
      <Animated.View style={[styles.curtain, styles.curtainR, right]} pointerEvents="none" />
    </>
  );
}

// ── the urn, its water, the stream from the tap, and the basin ──────────────

function Urn({ S }: { S: SharedValue<any> }) {
  const water = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - S.value.level) * URN_WIN.h }] }));
  const stream = useAnimatedStyle(() => ({ opacity: S.value.stream, transform: [{ scaleY: S.value.stream }] }));
  const basin = useAnimatedStyle(() => ({
    opacity: S.value.basin,
    transform: [{ scaleX: 0.9 + 0.1 * Math.sin(S.value.t * 3) * S.value.basin }],
  }));
  return (
    <>
      <SetArt parts={CONSOLE_ART} tone={MARBLE} />
      <SetArt parts={BASIN_ART} tone={MARBLE} />
      <SetArt parts={URN_ART} tone={CLAY} />
      <View style={styles.urnInside} pointerEvents="none">
        <Animated.View style={[styles.urnWater, water]} />
      </View>
      <Animated.View style={[styles.stream, stream]} pointerEvents="none" />
      <Animated.View style={[styles.basinWater, basin]} pointerEvents="none" />
    </>
  );
}

// ── the fallboard over the keys ─────────────────────────────────────────────

function Fallboard({ S }: { S: SharedValue<any> }) {
  // seen from the front, the board comes down over the keys from the lip above them
  const st = useAnimatedStyle(() => ({ opacity: S.value.lid > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.02, S.value.lid) }] }));
  return <Animated.View style={[styles.fallboard, st]} pointerEvents="none" />;
}

// ── the notes that rise from the piano ──────────────────────────────────────

function Notes({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2, 3].map((k) => <Note key={k} S={S} k={k} />)}
    </>
  );
}
function Note({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    // each note rises for 2.4 seconds on its own phase, drifting as it goes, and is gone
    const u = ((S.value.t + k * 0.6) % 2.4) / 2.4;
    return {
      opacity: S.value.notes * Math.sin(Math.PI * u),
      transform: [{ translateX: NOTE_X + 22 * u + 4 * Math.sin(u * 6 + k) }, { translateY: NOTE_Y - 60 * u }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.noteStem} />
      <View style={styles.noteHead} />
    </Animated.View>
  );
}

// ── the plates: CATHARSIS over the urn, RECOGNITION on the theatre, THE WILL on the piano ──

function Plates({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const cath = useAnimatedStyle(() => ({ opacity: S.value.named * (1 - S.value.q1), transform: [{ translateY: (1 - S.value.named) * -5 }] }));
  const recog = useAnimatedStyle(() => ({ opacity: S.value.recog }));
  const will = useAnimatedStyle(() => ({ opacity: S.value.will }));
  return (
    <>
      {on(NAMED) ? (
        <Animated.View style={[styles.plate, styles.cathPlate, cath]} pointerEvents="none">
          <Text style={styles.plateText} numberOfLines={1}>CATHARSIS</Text>
        </Animated.View>
      ) : null}
      {on(LIT) ? (
        <Animated.View style={[styles.plate, styles.recogPlate, recog]} pointerEvents="none">
          <Text style={styles.plateText} numberOfLines={1}>RECOGNITION</Text>
        </Animated.View>
      ) : null}
      {on(WILL) ? (
        <Animated.View style={[styles.plate, styles.willPlate, will]} pointerEvents="none">
          <Text style={styles.plateText} numberOfLines={1}>THE WILL</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── Q1: the urn, or the painting ────────────────────────────────────────────

function Answers({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {Q1_T.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.answer, { left: q.x, top: q.y, width: q.w, height: q.h }]}
        >
          <View style={q.id === 'catharsis' ? styles.answerTop : styles.answerFoot}>
            <View style={[styles.answerTag, answered && q.correct && styles.tagRight]}>
              <Text style={[styles.answerText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const OPEN_W = THEATRE.open.x1 - THEATRE.open.x0;
const OPEN_H = THEATRE.open.bottom - THEATRE.open.top;
const CANVAS_W = PAINTING.x1 - PAINTING.x0 - 8;
const CANVAS_H = PAINTING.bottom - PAINTING.top - 8;

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

  canvas: {
    position: 'absolute', left: PAINTING.x0 + 4, top: PAINTING.top + 4, width: CANVAS_W, height: CANVAS_H,
    backgroundColor: DEEP, overflow: 'hidden', borderRadius: 1,
  },
  skyFlash: { position: 'absolute', left: 0, top: 0, right: 0, height: CANVAS_H * 0.6, backgroundColor: PAPER_LIT },
  sea: { position: 'absolute', left: 0, right: 0, top: CANVAS_H * 0.66, bottom: 0, backgroundColor: TEAL },
  wave: {
    position: 'absolute', top: CANVAS_H * 0.66 - 3, width: 18, height: 6, borderRadius: 3, backgroundColor: TEAL,
    borderTopWidth: 1.5, borderColor: PAPER_LIT,
  },
  bolt: { position: 'absolute', left: 8, top: 3, width: 10, height: 18 },
  boltBar: { position: 'absolute', width: 2.2, height: 10, borderRadius: 1, backgroundColor: PAPER_LIT },

  opening: {
    position: 'absolute', left: THEATRE.open.x0, top: THEATRE.open.top, width: OPEN_W, height: OPEN_H,
    backgroundColor: DEEP, overflow: 'hidden',
  },
  cone: {
    position: 'absolute', left: STAGE_LAMP.x - THEATRE.open.x0 - 22, top: 6, width: 44, height: OPEN_H - 6,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: PAPER_LIT,
  },
  mask: {
    position: 'absolute', left: MASK.x - THEATRE.open.x0 - 11, top: MASK.y - THEATRE.open.top - 14, width: 22, height: 28,
    borderRadius: 11, backgroundColor: PAPER_LIT, borderWidth: 1.5, borderColor: INK,
  },
  eye: { position: 'absolute', top: 8, width: 4, height: 5, borderRadius: 2, backgroundColor: INK },
  mouth: {
    position: 'absolute', left: 6, top: 18, width: 10, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5,
    borderTopWidth: 1.6, borderLeftWidth: 1.6, borderRightWidth: 1.6, borderColor: INK,
  },
  dim: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: INK },
  bulb: {
    position: 'absolute', left: STAGE_LAMP.x - THEATRE.open.x0 - 3.5, top: 2, width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  curtain: {
    position: 'absolute', top: THEATRE.open.top, width: OPEN_W / 2, height: OPEN_H, backgroundColor: CLOTH.SHADE,
    borderWidth: 1.2, borderColor: INK, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  curtainL: { left: THEATRE.open.x0, transformOrigin: '0% 50%' },
  curtainR: { left: THEATRE.open.x0 + OPEN_W / 2, transformOrigin: '100% 50%' },

  urnInside: {
    position: 'absolute', left: URN_WIN.x, top: URN_WIN.y, width: URN_WIN.w, height: URN_WIN.h,
    borderRadius: URN_WIN.w / 2, overflow: 'hidden',
  },
  urnWater: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 2, backgroundColor: TEAL },
  stream: {
    position: 'absolute', left: TAP.x, top: TAP.y + 5, width: 2, height: BASIN.top + 3 - TAP.y - 5, borderRadius: 1,
    backgroundColor: TEAL, transformOrigin: '50% 0%',
  },
  basinWater: {
    position: 'absolute', left: BASIN.x0 + 3, top: BASIN.top + 2, width: BASIN.x1 - BASIN.x0 - 6, height: 3.5, borderRadius: 2,
    backgroundColor: TEAL,
  },

  // the keys, seen from the front of the case: fourteen white keys with their black keys over them
  keyboard: {
    position: 'absolute', left: KEYS.x0, top: KEYS.y - 4, width: KEYS.x1 - KEYS.x0, height: 8, borderRadius: 1,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK, overflow: 'hidden',
  },
  whiteGap: { position: 'absolute', top: 0, bottom: 0, width: 0.8, backgroundColor: INK },
  blackKey: { position: 'absolute', top: -1, width: 3.2, height: 5, borderRadius: 0.5, backgroundColor: INK },
  fallboard: {
    position: 'absolute', left: KEYS.x0 - 1, top: FALL_TOP, width: KEYS.x1 - KEYS.x0 + 2, height: FALL_H, borderRadius: 1,
    backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK, transformOrigin: '50% 0%',
  },

  noteStem: { position: 'absolute', left: 3, top: -9, width: 1.4, height: 9, borderRadius: 0.7, backgroundColor: INK },
  noteHead: {
    position: 'absolute', left: -1, top: -2, width: 6, height: 4.5, borderRadius: 2.5, backgroundColor: INK,
    transform: [{ rotate: '-20deg' }],
  },

  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  cathPlate: { left: URN.x - 30, top: URN.top - 18, width: 60 },
  recogPlate: { left: THEATRE.x0 + 10, top: THEATRE.top + 2, width: THEATRE.x1 - THEATRE.x0 - 20 },
  willPlate: { left: (PIANO.x0 + PIANO.x1) / 2 - 30, top: PIANO.top + 10, width: 60 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },

  answer: { position: 'absolute' },
  answerTop: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  answerFoot: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' },
  answerTag: {
    paddingHorizontal: 3, height: 13, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  answerText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },
});

export function Aesthetics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics3Scene} band={[288, 514]} camera={CAM} />;
}
