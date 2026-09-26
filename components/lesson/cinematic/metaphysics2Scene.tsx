import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { Outlined, ell, bar, tri } from './Silhouette';
import { BEATS } from './metaphysics2Script';
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
  curtain, valance, table, hat, easel, door, temple,
  PROS, TABLE, HAT, EASEL, TRAP, DOORS, DOOR, BACKDROP,
} from './metaphysics2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// metaphysics-being-2, "Something vs. Nothing" — A MAGICIAN'S THEATRE STAGE.
//
// Redrawn 2026-09-26, one of six second lessons. The owner's note that set its pace:
// the stage keeps acting for the WHOLE of every voiced line, not one second of
// motion and then ten of stillness. Every act below is laid across its line in
// stages (pace.ts), with the line lengths copied from the narration manifest.
//
//   b0   the curtains part; he taps the hat, a dove flies out and vanishes in a puff —
//        a thing that could fail to exist — and he draws the universe out of the hat
//        as a globe and sets it on the table.
//   b1   the marquee lights letter by letter: WHY SOMETHING RATHER THAN NOTHING?; he
//        tips the empty hat and shakes it, and nothing falls out.
//   b2   the principle goes up on the easel; he lifts the table cloth, and the trick's
//        mechanism is there, running — nothing without a reason.
//   b3   he walks to the wings and pulls back the curtain looking for the mechanism
//        behind the stage itself.
//   b4   back at the table: the trapdoor opens and the whole act sinks away — the
//        simpler state, nothing — and then comes back up: existence needs the reason.
//   b5   a painted temple comes down from the flies for Parmenides; a spotlight finds
//        it and he bows.
//   b6   two stage doors roll in from the wings, IT IS and IT IS NOT.
//   b8   he opens IT IS NOT: there is no floor behind it. He steps and pulls back.
//   b9   he tries it three ways — a step, the wand, a thought — and each finds
//        nothing; IT IS lights.
//   b10  Q1: three hats — a horse, a unicorn, nothing at all.
//   b11  Q2: three cards lowered from the flies.
//
// COMPOSITION, in stage units: curtains 0–26 and 374–400, the valance 290–314 with
// the marquee on it; the easel's board 34–158 × 322–396; the table at x 152 (top 456)
// over the trapdoor; he works at x 196; the temple flat 70–330 × 318–430; the doors
// at x 270 and 322. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('metaphysics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const DRAPE = stageToneOf(TEAL);
const PAINT = stageToneOf(SAGE);
const TR = 0.85;
/** The magician's scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_MAG = K_FIG * 0.82;
/** A hand on a stage point, at the magician's own scale. */
function handOn(s: Stance, x: number, dir: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_MAG, dir }, 1, tx, ty, w);
}

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, metaphysics-being-2. */
const LINES = [4.7, 5.8, 4.7, 5.4, 7.4, 5.7, 7.6, 0, 5.1, 7.0, 0, 0, 0];

const X = BEATS.map((b) => b.x ?? 200);
/** Which way he faces: the table is to his left; the wings, the doors and the hats to his right. */
const DIR = [-1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1];
const E = BEATS.map((b) => b.e ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_DOVE = is('dove');
const A_SHAKE = is('shake');
const A_REVEAL = is('reveal');
const A_SEARCH = is('search');
const A_SWEEP = is('sweep');
const A_BOW = is('bow');
const A_DOORS = is('doors');
const A_STEP = is('step');
const A_TRIES = is('tries');
const since = (k0: number) => BEATS.map((_, k) => (k0 >= 0 && k >= k0 ? 1 : 0));
const ASK = since(BEATS.findIndex((b) => b.ask));
const CARDS = BEATS.map((b) => b.cards ?? 0);
const TEMPLE = since(BEATS.findIndex((b) => b.temple));
const DOORS_ON = since(BEATS.findIndex((b) => b.doors));
const OPEN = since(BEATS.findIndex((b) => b.open));
/** The cloth stays up once lifted; the globe stays on the table once drawn out. */
const CLOTH = since(A_REVEAL.indexOf(1));
const GLOBE = since(0);
const HATS = BEATS.map((b) => (b.hats ? 1 : 0));
const FLIES = BEATS.map((b) => (b.flies ? 1 : 0));

// the three hats of Q1, on the floor in front of the doors
const HAT_X = [198, 246, 294];
const HATS_Q = [
  { id: 'horse', label: 'HORSE', correct: false },
  { id: 'unicorn', label: 'UNICORN', correct: false },
  { id: 'nothing', label: 'NOTHING', correct: true },
];
// the three cards of Q2, lowered from the flies
const FLY_X = [196, 268, 340];
const FLY_W = 68;
const FLY = [
  { id: 'never', l1: 'NEVER', l2: 'POSSIBLE', correct: false },
  { id: 'lost', l1: 'POSSIBLE,', l2: 'AND LOST', correct: true },
  { id: 'must', l1: 'ALWAYS', l2: 'NECESSARY', correct: false },
];

const MARQUEE = 'WHY SOMETHING RATHER THAN NOTHING?';
const CARD_LINES = [
  ['NOTHING IS WITHOUT', 'A REASON'],
  ['SO EXISTENCE ITSELF', 'NEEDS A REASON'],
  ['NOTHING IS SIMPLER', 'THAN SOMETHING'],
];

/** Where the globe rests on the table once he has set it down. */
const GLOBE_REST = { x: 174, y: TABLE.top - 9 };
const GLOBE_R = 8;

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

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics'));

export default function Metaphysics2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
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

    // where he stands: a walk lasts as long as its distance needs
    const walking = Math.abs(X[n] - X[p]) > 1;
    const walkU = walking ? ease01(b / moveTr(X[p], X[n], TR)) : 1;
    const x = carry(cv, 0, n, X[p], X[n], walkU);
    const dir = DIR[n] as 1 | -1;

    // ── his act, laid across the line ──────────────────────────────────────
    let s: Stance = walking
      ? travelStance(X[p], X[n], hHold(E[p], t), hHold(E[n], t), hLive(E[n], t, b), walkU, WALK, 0)
      : hLive(E[n], t, b);

    // the hat: tapped with the wand, then the globe drawn out and set down
    const tap = A_DOVE[n] ? bump(b, L, 0.2, 0.3, 0.42) : 0;
    const dove = A_DOVE[n] ? st(0.38, 0.66) : 0;
    const puff = A_DOVE[n] ? bump(b, L, 0.62, 0.68, 0.8) : 0;
    const draw = A_DOVE[n] ? st(0.72, 0.88) : 1;
    const setDown = A_DOVE[n] ? st(0.88, 1) : 1;
    const gx = A_DOVE[n] ? lerp(lerp(HAT.cx, HAT.cx + 12, draw), GLOBE_REST.x, setDown) : GLOBE_REST.x;
    const gy = A_DOVE[n] ? lerp(lerp(HAT.brim - HAT.h, 410, draw), GLOBE_REST.y, setDown) : GLOBE_REST.y;
    const holdGlobe = A_DOVE[n] ? bump(b, L, 0.7, 0.8, 1) : 0;
    s = handOn(s, x, dir, HAT.cx + 6, HAT.brim - HAT.h - 2, tap);
    s = handOn(s, x, dir, gx + 4, gy, holdGlobe);

    // the empty hat tipped and shaken
    const shake = A_SHAKE[n] ? bump(b, L, 0.42, 0.55, 0.88) : 0;
    const shrug = A_SHAKE[n] ? st(0.86, 1) : 0;
    s = handOn(s, x, dir, HAT.cx + 10, HAT.brim - HAT.h + 2, shake);
    s = mixStance(s, emoteAny(178, t), shrug * 0.8);
    const hatTilt = shake * (38 + 14 * Math.sin(t * 16));

    // the cloth lifted on the mechanism
    const lift = A_REVEAL[n] ? st(0.3, 0.58) : CLOTH[n] ? 1 : 0;
    const liftHand = A_REVEAL[n] ? bump(b, L, 0.25, 0.4, 0.66) : 0;
    s = handOn(s, x, dir, TABLE.cx + TABLE.w / 2 - 4, lerp(TABLE.top + 30, TABLE.top + 4, lift), liftHand);

    // the curtain pulled back in the wings
    const peek = A_SEARCH[n] ? st(Math.min(0.6, moveTr(X[p], X[n], TR) / L), 0.85) : 0;
    s = handOn(s, x, dir, PROS.right + 2, 430, A_SEARCH[n] ? bump(b, L, 0.5, 0.62, 0.98) : 0);

    // the whole act sinks through the trapdoor and comes back
    const sweepFrom = A_SWEEP[n] ? moveTr(X[p], X[n], TR) / L : 0;
    const trap = A_SWEEP[n] ? bump(b, L, sweepFrom, sweepFrom + 0.1, 0.98) : 0;
    const sink = A_SWEEP[n] ? bump(b, L, sweepFrom + 0.08, sweepFrom + 0.3, 0.92) : 0;
    s = mixStance(s, emoteAny(183, t), A_SWEEP[n] ? bump(b, L, sweepFrom, sweepFrom + 0.12, sweepFrom + 0.35) : 0);

    // the temple lowered and the bow
    const bow = A_BOW[n] ? bump(b, L, 0.62, 0.78, 1) : 0;
    s = { ...s, tilt: s.tilt - 0.42 * bow, neck: s.neck + 0.3 * bow };

    // the doors rolled in, and he points at each as it stops
    const roll1 = A_DOORS[n] ? st(0.0, 0.38) : DOORS_ON[n] ? 1 : 0;
    const roll2 = A_DOORS[n] ? st(0.28, 0.68) : DOORS_ON[n] ? 1 : 0;
    const signs = A_DOORS[n] ? st(0.66, 0.84) : DOORS_ON[n] ? 1 : 0;
    s = mixStance(s, emoteAny(183, t), A_DOORS[n] ? bump(b, L, 0.4, 0.5, 0.64) + bump(b, L, 0.84, 0.92, 1) : 0);

    // IT IS NOT opened: the step onto nothing, and the three tries
    const walkEnd = walking ? moveTr(X[p], X[n], TR) / L : 0;
    const leaf = A_STEP[n] ? st(walkEnd + 0.02, walkEnd + 0.22) : OPEN[n] ? 1 : 0;
    s = handOn(s, x, dir, DOORS[1].x + 4, GROUND - 38, A_STEP[n] ? bump(b, L, walkEnd, walkEnd + 0.1, walkEnd + 0.26) : 0);
    const probe = (A_STEP[n] ? bump(b, L, 0.55, 0.64, 0.74) : 0) + (A_TRIES[n] ? bump(b, L, 0.02, 0.14, 0.3) : 0);
    s = { ...s, footR: { x: s.footR.x + 20 * probe, y: s.footR.y - 6 * probe }, tilt: s.tilt - 0.08 * probe };
    const recoil = A_STEP[n] ? st(0.72, 0.8) : 0;
    s = mixStance(s, emoteAnyLive(318, t, Math.max(0, b - 0.72 * L)), recoil);
    const point = A_TRIES[n] ? bump(b, L, 0.34, 0.44, 0.64) : 0;
    s = handOn(s, x, dir, DOORS[1].x + 6, GROUND - 42, point);
    const think = A_TRIES[n] ? st(0.66, 0.78) * (1 - st(0.94, 1)) : 0;
    s = mixStance(s, emoteAny(158, t), think * 0.7);
    const only = A_TRIES[n] ? st(0.86, 1) : OPEN[n] && !A_STEP[n] ? 1 : 0;

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(E[p], t)), s, tr));

    return {
      fig: lookPose(fig, x, GROUND, K_MAG, facing(DIR[p], DIR[n], b), 1, gazeX.value, gazeY.value, gazeOn.value),
      open: carry(cv, 1, n, n === 0 ? 0 : 1, 1, n === 0 ? st(0, 0.24) : 1),
      dove: carry(cv, 22, n, 0, dove, tr),
      puff: carry(cv, 23, n, 0, puff, tr),
      gx: carry(cv, 2, n, GLOBE_REST.x, gx, tr),
      gy: carry(cv, 3, n, GLOBE_REST.y, gy, tr),
      globe: GLOBE[n],
      hatTilt: carry(cv, 21, n, 0, hatTilt, tr),
      ask: carry(cv, 4, n, ASK[p], ASK[n], A_SHAKE[n] ? stage(b, L, 0, 0.45) : tr),
      cards: carry(cv, 5, n, CARDS[p], CARDS[n], st(0.02, 0.24)),
      lift: carry(cv, 6, n, CLOTH[p], lift, tr),
      peek: carry(cv, 15, n, 0, peek, tr),
      trap: carry(cv, 16, n, 0, trap, tr),
      sink: carry(cv, 17, n, 0, sink, tr),
      temple: carry(cv, 7, n, TEMPLE[p], TEMPLE[n], A_BOW[n] ? st(0, 0.6) : tr),
      spot: carry(cv, 18, n, 0, A_BOW[n] ? bump(b, L, 0.3, 0.55, 1) : 0, tr),
      roll1: carry(cv, 8, n, DOORS_ON[p], roll1, tr),
      roll2: carry(cv, 9, n, DOORS_ON[p], roll2, tr),
      signs: carry(cv, 10, n, DOORS_ON[p], signs, tr),
      leaf: carry(cv, 11, n, OPEN[p], leaf, tr),
      point: carry(cv, 20, n, 0, point, tr),
      think: carry(cv, 19, n, 0, think, tr),
      only: carry(cv, 12, n, 0, only, tr),
      hats: carry(cv, 13, n, HATS[p], HATS[n], tr),
      flies: carry(cv, 14, n, FLIES[p], FLIES[n], ease01(b / 1.1)),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const wand = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const pt = SCENE.value.point;
    return {
      transform: [
        { translateX: w[0].translateX }, { translateY: w[1].translateY },
        { rotate: `${lerp(-30, 90, pt)}deg` },
      ],
    };
  });
  const wandTip = useAnimatedStyle(() => ({ height: lerp(24, 9, SCENE.value.point) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.back} pointerEvents="none" />
      <Temple S={SCENE} on={on} />
      <Doors S={SCENE} on={on} />
      <Easel S={SCENE} />
      <Table S={SCENE} />
      <Dove S={SCENE} on={on} />
      {HATS[i] ? <Hats picked={picked} onPick={onPick} S={SCENE} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_MAG} />
      <Animated.View style={[styles.rider, wand]} pointerEvents="none">
        <Animated.View style={[styles.wand, wandTip]} />
      </Animated.View>
      <Thought S={SCENE} on={on} />
      <Curtains S={SCENE} />
      <Marquee S={SCENE} />
      {FLIES[i] ? <Flies picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

// ── the curtains, the valance and the marquee ───────────────────────────────

const CURTAIN_L = curtain(-1);
const CURTAIN_R = curtain(1);
const VALANCE = valance();

function Curtains({ S }: { S: SharedValue<any> }) {
  // closed across the stage at the start, drawn back as the act begins
  const left = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - S.value.open) * 150 }] }));
  const right = useAnimatedStyle(() => ({ transform: [{ translateX: -(1 - S.value.open) * 150 + S.value.peek * 16 }] }));
  const slit = useAnimatedStyle(() => ({ opacity: S.value.peek, width: 16 * S.value.peek }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.backstage, slit]}>
        {[0, 1, 2].map((k) => <View key={k} style={[styles.rope, { left: 3 + k * 5 }]} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, left]}><ObjectArt parts={CURTAIN_L} tone={DRAPE} /></Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, right]}><ObjectArt parts={CURTAIN_R} tone={DRAPE} /></Animated.View>
      <ObjectArt parts={VALANCE} tone={DRAPE} />
    </View>
  );
}

function Marquee({ S }: { S: SharedValue<any> }) {
  const reveal = useAnimatedStyle(() => ({ width: 300 * S.value.ask }));
  const bulbs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <View style={styles.marquee} pointerEvents="none">
      <Animated.View style={[styles.marqueeClip, reveal]}>
        <Text style={styles.marqueeText} numberOfLines={1}>{MARQUEE}</Text>
      </Animated.View>
      {bulbs.map((k) => <Bulb key={k} S={S} k={k} />)}
    </View>
  );
}

function Bulb({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.ask * (0.45 + 0.55 * (Math.sin(S.value.t * 5 + k * 1.3) > 0 ? 1 : 0)),
  }));
  return <Animated.View style={[styles.bulb, { left: 6 + k * 27 }, st]} />;
}

// ── the easel's cards ────────────────────────────────────────────────────────

function Easel({ S }: { S: SharedValue<any> }) {
  const cover = useAnimatedStyle(() => {
    const off = clamp01(S.value.cards);
    return { opacity: 1 - off, transform: [{ translateY: 50 * off }, { scaleY: 1 - 0.6 * off }] };
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ObjectArt parts={EASEL_ART} tone={WOOD} />
      <View style={styles.board}>
        {CARD_LINES.map((c, k) => <CardLine key={k} S={S} k={k} lines={c} />)}
      </View>
      <Animated.View style={[styles.boardCover, cover]}>
        <View style={styles.coverTassel} />
      </Animated.View>
    </View>
  );
}
const EASEL_ART = easel();

function CardLine({ S, k, lines }: { S: SharedValue<any>; k: number; lines: string[] }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.cards - k);
    return { opacity: v, transform: [{ translateX: (1 - v) * -10 }] };
  });
  return (
    <Animated.View style={[styles.cardRow, k > 0 && styles.cardRule, st]}>
      <View style={styles.cardPip} />
      <View>
        <Text style={styles.cardText} numberOfLines={1}>{lines[0]}</Text>
        <Text style={styles.cardText} numberOfLines={1}>{lines[1]}</Text>
      </View>
    </Animated.View>
  );
}

// ── the table, the hat, the globe, the cloth and the mechanism under it ────

const TABLE_ART = table();
const HAT_ART = hat();

function Table({ S }: { S: SharedValue<any> }) {
  const act = useAnimatedStyle(() => ({ transform: [{ translateY: 70 * S.value.sink }] }));
  const hatSt = useAnimatedStyle(() => ({ transform: [{ rotate: `${-S.value.hatTilt}deg` }] }));
  const cloth = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 - 0.86 * S.value.lift }] }));
  const globe = useAnimatedStyle(() => ({
    opacity: S.value.globe,
    transform: [{ translateX: S.value.gx - GLOBE_R }, { translateY: S.value.gy - GLOBE_R }],
  }));
  const meridian = useAnimatedStyle(() => ({ transform: [{ translateX: 4 * Math.sin(S.value.t * 1.4) }] }));
  const gear = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.t * 90}deg` }] }));
  const piston = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * Math.abs(Math.sin(S.value.t * 2.2)) }] }));
  const trap = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.trap }] }));
  return (
    <>
      <Animated.View style={[styles.trapHole, trap]} pointerEvents="none" />
      <View style={styles.sinkClip} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, act]}>
          {/* the mechanism under the table, running whether or not anyone can see it */}
          <Animated.View style={[styles.gear, gear]}>
            <View style={styles.gearBar} />
            <View style={[styles.gearBar, { transform: [{ rotate: '90deg' }] }]} />
          </Animated.View>
          <Animated.View style={[styles.piston, piston]} />
          <View style={styles.pulley} />
          <ObjectArt parts={TABLE_ART} tone={WOOD} />
          <Animated.View style={[styles.cloth, cloth]}>
            <View style={styles.clothFringe} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${HAT.cx}px ${HAT.brim}px` }, hatSt]}>
            <ObjectArt parts={HAT_ART} tone={stageToneOf(DEEP)} />
          </Animated.View>
          <Animated.View style={[styles.globe, globe]}>
            <View style={styles.globeBand} />
            <Animated.View style={[styles.globeMeridian, meridian]} />
          </Animated.View>
        </Animated.View>
      </View>
    </>
  );
}

// ── the dove: out of the hat, round once, and gone ──────────────────────────

const DOVE_PARTS = [
  ell(0, 0, 18, 10, PAPER_LIT),
  ell(9, -4, 8, 7, PAPER_LIT),
  tri(15, -4, 5, 3, 'right', EMBER),
];
function Dove({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.dove;
    const x = lerp(HAT.cx, 250, u) + 30 * Math.sin(u * Math.PI);
    const y = lerp(HAT.brim - HAT.h, 350, u) - 30 * Math.sin(u * Math.PI);
    return { opacity: u > 0 && u < 1 ? 1 - S.value.puff * 1.4 : 0, transform: [{ translateX: x }, { translateY: y }] };
  });
  const wing = useAnimatedStyle(() => ({ transform: [{ rotate: `${-30 + 40 * Math.sin(S.value.t * 18)}deg` }] }));
  const puff = useAnimatedStyle(() => ({
    opacity: S.value.puff,
    transform: [{ translateX: 250 }, { translateY: 350 }, { scale: 0.5 + 1.2 * S.value.puff }],
  }));
  if (!on(A_DOVE)) return null;
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <Outlined parts={DOVE_PARTS} width={1.5} line={INK} />
        <Animated.View style={[styles.doveWing, wing]}>
          <Outlined parts={[ell(0, -5, 8, 14, PAPER_LIT)]} width={1.5} line={INK} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.rider, puff]} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <View key={k} style={[styles.puffDot, { left: 14 * Math.cos(k * 1.26) - 5, top: 14 * Math.sin(k * 1.26) - 5 }]} />
        ))}
      </Animated.View>
    </>
  );
}

// ── the temple flat, and the spotlight on it ────────────────────────────────

const TEMPLE_ART = temple();
function Temple({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: -(1 - S.value.temple) * 150 }] }));
  const spot = useAnimatedStyle(() => ({ opacity: 0.35 * S.value.spot }));
  if (!on(TEMPLE)) return null;
  return (
    <View style={styles.templeClip} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, st]}>
        <View style={[styles.templeRope, { left: BACKDROP.x + 20 }]} />
        <View style={[styles.templeRope, { left: BACKDROP.x + BACKDROP.w - 22 }]} />
        <View style={{ position: 'absolute', left: 0, top: -PROS.valance }}>
          <ObjectArt parts={TEMPLE_ART} tone={PAINT} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.spot, spot]} />
    </View>
  );
}

// ── the doors: rolled in, labelled, and the second opened onto nothing ──────

const DOOR_ART = DOORS.map((d) => door(d.x));
/** The door signs ride on posts above head height: he works in front of the doors. */
const SIGN_Y = 374;
function Doors({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const d1 = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - S.value.roll1) * 140 }] }));
  const d2 = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - S.value.roll2) * 110 }] }));
  const sign = useAnimatedStyle(() => ({ opacity: S.value.signs, transform: [{ translateY: (1 - S.value.signs) * -10 }] }));
  const leaf = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.82 * S.value.leaf }] }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.5 * S.value.only * (0.75 + 0.25 * Math.sin(S.value.t * 3)) }));
  if (!on(DOORS_ON)) return null;
  const top = GROUND - DOOR.h - 6;
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, d1]} pointerEvents="none">
        <Animated.View style={[styles.doorGlow, { left: DOORS[0].x - 8, top: top - 8 }, glow]} />
        <ObjectArt parts={DOOR_ART[0]} tone={WOOD} />
        <View style={[styles.doorLeaf, { left: DOORS[0].x, top }]}><View style={styles.knob} /></View>
        <View style={[styles.signPost, { left: DOORS[0].x + DOOR.w / 2 - 0.75, top: SIGN_Y + 14 }]} />
        <Animated.View style={[styles.doorSign, { left: DOORS[0].x - 6, top: SIGN_Y }, sign]}>
          <Text style={styles.signText} numberOfLines={1}>{DOORS[0].label}</Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, d2]} pointerEvents="none">
        <ObjectArt parts={DOOR_ART[1]} tone={WOOD} />
        {/* behind this door there is no floor: the gap runs through the stage line */}
        <View style={[styles.void, { left: DOORS[1].x, top }]} />
        <View style={[styles.voidFloor, { left: DOORS[1].x }]} />
        <Animated.View style={[styles.doorLeaf, { left: DOORS[1].x, top, transformOrigin: '0% 50%' }, leaf]}>
          <View style={styles.knob} />
        </Animated.View>
        <View style={[styles.signPost, { left: DOORS[1].x + DOOR.w / 2 - 0.75, top: SIGN_Y + 14 }]} />
        <Animated.View style={[styles.doorSign, { left: DOORS[1].x - 8, top: SIGN_Y, width: DOOR.w + 16 }, sign]}>
          <Text style={styles.signText} numberOfLines={1}>{DOORS[1].label}</Text>
        </Animated.View>
      </Animated.View>
    </>
  );
}

// ── the thought he tries to have about it: an empty frame ───────────────────

function Thought({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.think, transform: [{ scale: 0.7 + 0.3 * S.value.think }] }));
  if (!on(A_TRIES)) return null;
  return (
    <Animated.View style={[styles.cloud, st]} pointerEvents="none">
      <View style={styles.cloudFrame} />
      <View style={[styles.cloudDot, { left: 4, top: 40, width: 6, height: 6 }]} />
      <View style={[styles.cloudDot, { left: -2, top: 50, width: 4, height: 4 }]} />
    </Animated.View>
  );
}

// ── Q1: three hats on the floor ─────────────────────────────────────────────

const HORSE = [
  ell(0, 0, 26, 12, PAPER_LIT),
  bar(10, -2, 16, -12, 6, PAPER_LIT),
  ell(18, -14, 10, 6, PAPER_LIT, 20),
  bar(-9, 4, -10, 14, 3, PAPER_LIT), bar(-4, 4, -5, 14, 3, PAPER_LIT),
  bar(6, 4, 7, 14, 3, PAPER_LIT), bar(10, 4, 11, 14, 3, PAPER_LIT),
  bar(-13, -2, -18, 6, 3, PAPER_LIT),
];
const UNICORN = [...HORSE, tri(20, -21, 3, 9, 'up', EMBER, 20)];

function Hats({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const rise = useAnimatedStyle(() => ({ opacity: S.value.hats }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, rise]} pointerEvents="box-none">
      {HATS_Q.map((h, k) => (
        <Target
          key={h.id} id={h.id} correct={h.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.hatTarget, { left: HAT_X[k] - 23 }]}
        >
          <View style={styles.hatFill}>
            {answered && h.id !== 'nothing' ? (
              <View style={styles.pictured}>
                <Outlined parts={h.id === 'horse' ? HORSE : UNICORN} width={1.5} line={INK} />
              </View>
            ) : null}
            <View style={styles.qHatCrown} />
            <View style={styles.qHatBrim} />
            <View style={[styles.hatLabel, answered && h.correct && styles.hatLabelRight]}>
              <Text style={[styles.hatLabelText, answered && h.correct && styles.onInk]} numberOfLines={1}>{h.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q2: three cards lowered from the flies ──────────────────────────────────

function Flies({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const drop = useAnimatedStyle(() => ({ transform: [{ translateY: -(1 - S.value.flies) * 16 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drop]} pointerEvents="box-none">
      {FLY.map((c, k) => (
        <View key={c.id} style={[styles.flyRope, { left: FLY_X[k] - 0.75 }]} pointerEvents="none" />
      ))}
      {FLY.map((c, k) => (
        <Target
          key={c.id} id={c.id} correct={c.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.flyCard, { left: FLY_X[k] - FLY_W / 2 }]}
        >
          <View style={[styles.flyFace, answered && c.correct && styles.flyRight]}>
            <Text style={[styles.flyText, answered && c.correct && styles.onInk]} numberOfLines={1}>{c.l1}</Text>
            <Text style={[styles.flyText, answered && c.correct && styles.onInk]} numberOfLines={1}>{c.l2}</Text>
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
  back: {
    position: 'absolute', left: PROS.left, top: PROS.valance, width: PROS.right - PROS.left, height: GROUND - PROS.valance,
    backgroundColor: DRAPE.STONE,
  },
  rider: { position: 'absolute', left: 0, top: 0 },
  wand: {
    position: 'absolute', left: -1.5, bottom: 0, width: 3, borderRadius: 1.5, backgroundColor: INK,
    borderTopWidth: 5, borderTopColor: PAPER_LIT,
  },

  backstage: {
    position: 'absolute', left: PROS.right - 2, top: PROS.valance, height: GROUND - PROS.valance, backgroundColor: INK,
  },
  rope: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: DRAPE.SHADE },
  marquee: {
    position: 'absolute', left: 50, top: PROS.top + 2, width: 300, height: 20,
    backgroundColor: DEEP, borderRadius: 4, borderWidth: 1.5, borderColor: INK,
  },
  marqueeClip: { position: 'absolute', left: 0, top: 2, height: 13, overflow: 'hidden' },
  marqueeText: {
    width: 300, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 0.8, color: PAPER_LIT, includeFontPadding: false,
  },
  bulb: { position: 'absolute', top: 15, width: 3, height: 3, borderRadius: 1.5, backgroundColor: EMBER },

  board: {
    position: 'absolute', left: EASEL.x - 18, top: EASEL.y - 8, width: 124, height: EASEL.h + 12, paddingHorizontal: 5, paddingTop: 3,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  boardCover: {
    position: 'absolute', left: EASEL.x - 20, top: EASEL.y - 10, width: 128, height: EASEL.h + 16,
    backgroundColor: DRAPE.SHADE, borderWidth: 1.5, borderColor: INK, borderRadius: 4, transformOrigin: '50% 100%',
  },
  coverTassel: { position: 'absolute', right: 10, bottom: -6, width: 6, height: 12, borderRadius: 3, backgroundColor: EMBER },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 1.5 },
  cardRule: { borderTopWidth: 1, borderTopColor: DRAPE.SHADE },
  cardPip: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: EMBER, marginTop: 3, marginRight: 4 },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },

  sinkClip: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: GROUND, overflow: 'hidden' },
  trapHole: {
    position: 'absolute', left: TRAP.x0, top: GROUND - 2, width: TRAP.x1 - TRAP.x0, height: 8, borderRadius: 2,
    backgroundColor: INK, transformOrigin: '50% 50%',
  },
  cloth: {
    position: 'absolute', left: TABLE.cx - TABLE.w / 2 - 2, top: TABLE.top + 3, width: TABLE.w + 4, height: GROUND - TABLE.top - 5,
    backgroundColor: DRAPE.SHADE, borderWidth: 1.5, borderColor: INK, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    transformOrigin: '50% 0%', overflow: 'hidden',
  },
  clothFringe: { position: 'absolute', left: 0, right: 0, bottom: 2, height: 3, backgroundColor: EMBER },
  gear: {
    position: 'absolute', left: TABLE.cx - 20, top: GROUND - 26, width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  gearBar: { position: 'absolute', width: 14, height: 2, backgroundColor: INK },
  piston: {
    position: 'absolute', left: TABLE.cx + 4, top: TABLE.top + 8, width: 10, height: 26, borderRadius: 2,
    backgroundColor: DRAPE.SHADE, borderWidth: 1.5, borderColor: INK,
  },
  pulley: { position: 'absolute', left: TABLE.cx + 20, top: TABLE.top + 6, width: 1.5, height: 36, backgroundColor: INK },
  globe: {
    position: 'absolute', left: 0, top: 0, width: GLOBE_R * 2, height: GLOBE_R * 2, borderRadius: GLOBE_R,
    backgroundColor: TEAL, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  globeBand: { position: 'absolute', width: 14, height: 1.5, backgroundColor: PAPER_LIT },
  globeMeridian: { position: 'absolute', width: 7, height: 14, borderRadius: 4, borderWidth: 1.2, borderColor: PAPER_LIT },

  doveWing: { position: 'absolute', left: -2, top: -2, transformOrigin: '50% 100%' },
  puffDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK },

  templeClip: { position: 'absolute', left: 0, top: PROS.valance, width: STAGE_W, height: GROUND - PROS.valance, overflow: 'hidden' },
  templeRope: { position: 'absolute', top: -PROS.valance, width: 1.5, height: BACKDROP.y, backgroundColor: INK },
  spot: {
    position: 'absolute', left: 140, top: 0, width: 120, height: GROUND - PROS.valance, backgroundColor: PAPER_LIT,
    borderTopLeftRadius: 50, borderTopRightRadius: 50,
  },

  doorLeaf: {
    position: 'absolute', width: DOOR.w, height: DOOR.h, backgroundColor: PLATE_FACE,
    borderWidth: 1.5, borderColor: INK, borderRadius: 1.5,
  },
  knob: { position: 'absolute', right: 5, top: DOOR.h / 2, width: 5, height: 5, borderRadius: 2.5, backgroundColor: EMBER },
  void: { position: 'absolute', width: DOOR.w, height: DOOR.h, backgroundColor: INK },
  voidFloor: { position: 'absolute', top: GROUND - 2, width: DOOR.w, height: 14, backgroundColor: INK },
  doorSign: {
    position: 'absolute', width: DOOR.w + 12, height: 14, borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  signPost: { position: 'absolute', width: 1.5, height: GROUND - DOOR.h - 6 - 374 - 14, backgroundColor: INK },
  doorGlow: { position: 'absolute', width: DOOR.w + 16, height: DOOR.h + 12, borderRadius: 10, backgroundColor: SAGE },

  cloud: {
    position: 'absolute', left: 272, top: 334, width: 50, height: 40, borderRadius: 16,
    backgroundColor: PLATE_FACE, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  cloudFrame: { width: 26, height: 18, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', borderRadius: 2 },
  cloudDot: { position: 'absolute', borderRadius: 4, backgroundColor: PLATE_FACE, borderWidth: 1.5, borderColor: INK },

  hatTarget: { position: 'absolute', top: GROUND - 52, width: 46, height: 64 },
  hatFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' },
  pictured: { position: 'absolute', left: 23, top: 6 },
  qHatCrown: { width: 20, height: 18, backgroundColor: INK, borderRadius: 2 },
  qHatBrim: { width: 30, height: 4, backgroundColor: INK, borderRadius: 2, marginBottom: 1 },
  hatLabel: {
    height: 13, width: 46, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  hatLabelRight: { backgroundColor: INK },
  hatLabelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.2, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },

  flyRope: { position: 'absolute', top: PROS.valance, width: 1.5, height: 18, backgroundColor: INK },
  flyCard: { position: 'absolute', top: PROS.valance + 18, width: FLY_W, height: 32 },
  flyFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  flyRight: { backgroundColor: INK },
  flyText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics2Scene} band={[288, 514]} camera={CAM} />;
}
