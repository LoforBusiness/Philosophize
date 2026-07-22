import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethicsScript';
import {
  BLANK, clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand,
  type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The conscience that steps out of a figure and weighs the deed on a balance,
// beside an animal that shares the instincts but never judges itself.

const HUMAN_X = 250;
const CON_DX = 30;              // the conscience self rises up-and-behind
const CRIT_X = 86;
const PIVOT_X = 158;
const PIVOT_Y = 452;

// ── per-beat cues, precomputed for the worklet ────────────────────────────────
const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const JUDGE = BEATS.map((b) => (b.judge ? 1 : 0));
const CRITTER = BEATS.map((b) => (b.critter ? 1 : 0));
const PLANT = BEATS.map((b) => (b.plant ? 1 : 0));
const Q2 = BEATS.map((b) => (b.weigh === 'q2' ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({
  s: b.summary ? 1 : 1.14, cx: 196, cy: 430, tr: 0.8,
}));

// ── extra human poses (the rig covers gestures 0/2/3/4) ───────────────────────
function actPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.11, neck: 0.10, fistR: { x: 30, y: 9 }, fistL: { x: -4, y: -3 } };
}
function gaze(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: 0.02, neck: 0.24, fistR: { x: 7, y: -7 }, fistL: { x: -7, y: -7 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

export default function EthicsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const humanS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    const conOn = L(JUDGE[p], JUDGE[n]);
    const critOn = L(CRITTER[p], CRITTER[n]);

    // On Q2 the animal ambles off while the human's conscience holds — the point
    // that only the human steps out to judge.
    const critX = CRIT_X - (Q2[n] ? q * 70 : 0);
    const rise = 46 * conOn + (n === 6 ? q * 16 : 0);       // beat 6 (index) = Q1

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      human: pose(humanS, HUMAN_X, GROUND, K_FIG, -1, 1),
      con: conOn > 0.01 ? pose(gaze(t), HUMAN_X + CON_DX, GROUND - rise, K_FIG, -1, conOn * 0.4) : BLANK,
      scaleOn: conOn,
      tip: Math.sin(t * 1.2) * 4 * conOn * (1 - (n === 6 ? q : 0)),  // settles level on a considered Q1
      critOn,
      critX,
    };
  });

  const DH = useDerivedValue<Bundle>(() => SCENE.value.human);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.con);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        <Critter S={SCENE} />
        <Stickman D={DC} k={K_FIG} />
        <Stickman D={DH} k={K_FIG} />
        <Scale S={SCENE} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the balance ───────────────────────────────────────────────────────────────
function Scale({ S }: { S: SharedValue<any> }) {
  const beam = useAnimatedStyle(() => ({
    opacity: S.value.scaleOn,
    transform: [{ translateX: PIVOT_X }, { translateY: PIVOT_Y }, { rotate: `${S.value.tip}deg` }],
  }));
  const post = useAnimatedStyle(() => ({ opacity: S.value.scaleOn }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: 'absolute', left: PIVOT_X - 1.5, top: PIVOT_Y, width: 3, height: 42, backgroundColor: INK }, post]} />
      <Animated.View style={[{ position: 'absolute', left: PIVOT_X - 26, top: PIVOT_Y + 42, width: 52, height: 3, backgroundColor: INK, borderRadius: 2 }, post]} />
      {/* beam + pans, rotating about the pivot */}
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, transformOrigin: '0% 0%' }, beam]}>
        <View style={{ position: 'absolute', left: -48, top: -1.5, width: 96, height: 3, backgroundColor: INK, borderRadius: 2 }} />
        <View style={styles.pan} />
        <View style={[styles.pan, { left: 42 }]} />
        <View style={{ position: 'absolute', left: -48, top: 0, width: 1.5, height: 12, backgroundColor: SOFT }} />
        <View style={{ position: 'absolute', left: 46.5, top: 0, width: 1.5, height: 12, backgroundColor: SOFT }} />
      </Animated.View>
    </View>
  );
}

// ── the animal (shares the instincts, never steps out) ────────────────────────
function Critter({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({
    opacity: S.value.critOn,
    transform: [{ translateX: S.value.critX }, { translateY: GROUND - 22 }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, wrap]} pointerEvents="none">
      {/* body */}
      <View style={{ position: 'absolute', left: -24, top: -10, width: 48, height: 20, borderRadius: 10, backgroundColor: INK }} />
      {/* head (front / left) */}
      <View style={{ position: 'absolute', left: -34, top: -16, width: 17, height: 17, borderRadius: 9, backgroundColor: INK }} />
      {/* ear */}
      <View style={{ position: 'absolute', left: -33, top: -22, width: 7, height: 8, borderRadius: 3, backgroundColor: INK }} />
      {/* legs */}
      <View style={{ position: 'absolute', left: -20, top: 6, width: 3.5, height: 16, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: -8, top: 8, width: 3.5, height: 14, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: 10, top: 8, width: 3.5, height: 14, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: 18, top: 6, width: 3.5, height: 16, backgroundColor: INK }} />
      {/* tail */}
      <View style={{ position: 'absolute', left: 22, top: -8, width: 12, height: 2.5, backgroundColor: INK, borderRadius: 2, transform: [{ rotate: '-25deg' }] }} />
    </Animated.View>
  );
}

export function EthicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EthicsScene} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  pan: {
    position: 'absolute', left: -54, top: 11, width: 12, height: 7,
    borderColor: INK, borderWidth: 1.5, borderTopWidth: 0, borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
    backgroundColor: PAPER,
  },
});
