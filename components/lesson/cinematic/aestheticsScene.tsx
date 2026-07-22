import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aestheticsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand,
  type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure before a framed sunset that glows and asks for nothing (vs. the apple
// he reaches to grab), then a feeling that turns outward to a whole crowd.

const FIG_X = 232;
const APPLE_X = 206;
const SUN_X = 150;
const SUN_Y = 150;
const CROWD_X = [300, 330, 360];

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));
const APPLE = BEATS.map((b) => (b.apple ? 1 : 0));
const CROWD = BEATS.map((b) => (b.crowd ? 1 : 0));
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: 1.02, cx: 206, cy: 300, tr: 0.82 }));

function reachApple(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.08, fistR: { x: 20, y: 6 }, fistL: { x: -4, y: -4 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

export default function AestheticsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    // On Q1 the reaching hand for the apple falls away — pleasure that wants nothing.
    const appleOn = L(APPLE[p], APPLE[n]) * (Q1[n] ? 1 - ease01(q) : 1);
    const glowOn = L(GLOW[p], GLOW[n]) * (Q1[n] ? 1 + 0.4 * ease01(q) : 1);
    const crowdOn = L(CROWD[p], CROWD[n]);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      fig: pose(figS, FIG_X, GROUND, K_FIG, -1, 1),
      appleOn, glowOn, crowdOn, t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const appleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.appleOn }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <SunsetFrame S={SCENE} />
        <Crowd S={SCENE} />
        <View style={styles.ground} />
        {/* apple of appetite on its stand */}
        <Animated.View style={[{ position: 'absolute', left: APPLE_X - 11, top: 430 }, appleStyle]} pointerEvents="none">
          <View style={styles.apple} />
          <View style={styles.appleStem} />
          <View style={styles.applePost} />
        </Animated.View>
        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function SunsetFrame({ S }: { S: SharedValue<any> }) {
  const ring = (off: number) =>
    useAnimatedStyle(() => {
      const ph = ((S.value.t * 0.45 + off) % 1 + 1) % 1;
      return { opacity: S.value.glowOn * (1 - ph) * 0.55, transform: [{ scale: 0.35 + ph * 1.5 }] };
    });
  const r0 = ring(0), r1 = ring(0.33), r2 = ring(0.66);
  const rays = [];
  for (let a = -70; a <= 70; a += 20) rays.push(a);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* glow rings from the sun */}
      {[r0, r1, r2].map((st, k) => (
        <Animated.View key={k} style={[{ position: 'absolute', left: SUN_X - 40, top: SUN_Y - 40, width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: SOFT }, st]} />
      ))}
      {/* frame */}
      <View style={styles.frame}>
        {/* sky + horizon */}
        <View style={styles.horizon} />
        {/* rays */}
        {rays.map((a, k) => (
          <View key={k} style={[styles.ray, { transform: [{ translateX: 66 }, { translateY: 64 }, { rotate: `${a}deg` }, { translateY: -26 }] }]} />
        ))}
        {/* sun */}
        <View style={styles.sun} />
      </View>
    </View>
  );
}

function Crowd({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.crowdOn }));
  const wave = (off: number) =>
    useAnimatedStyle(() => {
      const ph = ((S.value.t * 0.5 + off) % 1 + 1) % 1;
      return { opacity: S.value.crowdOn * (1 - ph) * 0.5, transform: [{ scaleX: 0.4 + ph }, { scaleY: 0.4 + ph }] };
    });
  const w0 = wave(0), w1 = wave(0.5);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      {/* the claim reaching outward */}
      {[w0, w1].map((st, k) => (
        <Animated.View key={k} style={[{ position: 'absolute', left: 250, top: 380, width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: SOFT }, st]} />
      ))}
      {/* the crowd */}
      {CROWD_X.map((x, k) => (
        <View key={k} style={{ position: 'absolute', left: x - 5, top: 452 }}>
          <View style={styles.crowdHead} />
          <View style={styles.crowdBody} />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  frame: {
    position: 'absolute', left: 84, top: 86, width: 132, height: 104,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER, overflow: 'hidden',
  },
  horizon: { position: 'absolute', left: 0, right: 0, top: 64, height: 1.5, backgroundColor: INK },
  sun: { position: 'absolute', left: 66 - 20, top: 64 - 20, width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  ray: { position: 'absolute', left: 0, top: 0, width: 1.5, height: 14, backgroundColor: INK },

  apple: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  appleStem: { position: 'absolute', left: 11, top: -3, width: 2, height: 6, backgroundColor: INK, transform: [{ rotate: '18deg' }] },
  applePost: { position: 'absolute', left: 9, top: 22, width: 3, height: 40, backgroundColor: SOFT },

  crowdHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: INK },
  crowdBody: { position: 'absolute', left: 4, top: 10, width: 2.5, height: 26, backgroundColor: INK },
});

export function AestheticsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={AestheticsScene} />;
}
