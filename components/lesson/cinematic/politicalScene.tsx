import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './politicalScript';
import {
  boxMove, clamp01, ease01, lerp, mixStance, pose, stand, type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The war of all against all resolving into order under one crowned sovereign.

const CIT_X = [88, 150, 250, 312];
const CIT_DIR = [1, 1, -1, -1];            // all face the centre
const CIT_K = K_FIG * 0.82;
const SOV_X = 200;
const PED = 30;                             // the sovereign stands a step higher

const AUTH = BEATS.map((b) => b.auth ?? 0);
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: 1.0, cx: 200, cy: 416, tr: 0.85 }));

// Each citizen runs an out-of-phase loop of blows — no two in sync, the brawl.
function melee(t: number, k: number): Stance {
  'worklet';
  const codes = [1, 3, 2, 0, 5, 1, 6];     // jab hook cross guard block jab duck
  const period = 0.72;
  const local = t * 1.1 + k * 1.9;
  const idx = Math.floor(local / period) % codes.length;
  const u = (local / period) % 1;
  return boxMove(codes[idx], t, u);
}
function sovereignPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.02, fistR: { x: 16, y: -42 }, fistL: { x: -9, y: -4 } };
}

export default function PoliticalScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const auth = Q1[n] ? ease01(q) : L(AUTH[p], AUTH[n]);

    const cit = (k: number): Bundle => {
      'worklet';
      const dir = CIT_DIR[k];
      const m = melee(t, k);
      const calm = stand(t);
      const s = mixStance(m, calm, auth);
      const x = CIT_X[k] + s.adv * dir * (1 - auth);   // lunges only in the brawl
      return pose(s, x, GROUND, CIT_K, dir, 1);
    };

    const sovGY = (GROUND - PED) + (1 - auth) * 74;      // rises from below on authorisation
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      c0: cit(0), c1: cit(1), c2: cit(2), c3: cit(3),
      sov: auth > 0.01 ? pose(sovereignPose(t), SOV_X, sovGY, K_FIG, -1, auth) : { ...pose(stand(t), SOV_X, sovGY, K_FIG, -1, 0) },
      auth,
    };
  });

  const DC0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const DC1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const DC3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const DSov = useDerivedValue<Bundle>(() => SCENE.value.sov);

  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const ped = useAnimatedStyle(() => ({ opacity: SCENE.value.auth }));
  const crown = useAnimatedStyle(() => {
    const h = DSov.value.head;
    return { opacity: DSov.value.opacity, transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY - 30 }] };
  });
  const sword = useAnimatedStyle(() => {
    const w = DSov.value.wrR;
    return { opacity: DSov.value.opacity, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {/* pedestal */}
        <Animated.View style={[{ position: 'absolute', left: SOV_X - 26, top: GROUND - PED, width: 52, height: PED, backgroundColor: PAPER, borderWidth: 2, borderColor: INK }, ped]} />
        <Stickman D={DC0} k={CIT_K} />
        <Stickman D={DC1} k={CIT_K} />
        <Stickman D={DC2} k={CIT_K} />
        <Stickman D={DC3} k={CIT_K} />
        <Stickman D={DSov} k={K_FIG} />
        {/* sword held aloft, from the right hand up */}
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, sword]} pointerEvents="none">
          <View style={{ position: 'absolute', left: -1.5, top: -46, width: 3, height: 46, backgroundColor: INK }} />
          <View style={{ position: 'absolute', left: -9, top: -4, width: 18, height: 3, backgroundColor: INK, borderRadius: 2 }} />
          <View style={{ position: 'absolute', left: -3, top: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: INK }} />
        </Animated.View>
        {/* crown on the sovereign's head */}
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, crown]} pointerEvents="none">
          <View style={{ position: 'absolute', left: -13, top: 0, width: 26, height: 7, backgroundColor: INK, borderRadius: 1 }} />
          <View style={[styles.crownPoint, { left: -13 }]} />
          <View style={[styles.crownPoint, { left: -3 }]} />
          <View style={[styles.crownPoint, { left: 7 }]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  crownPoint: {
    position: 'absolute', top: -7, width: 0, height: 0,
    borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
});

export function PoliticalLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={PoliticalScene} />;
}
