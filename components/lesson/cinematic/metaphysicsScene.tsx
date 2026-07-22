import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './metaphysicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure wiping the sky toward "nothing" (a void remains), and a causal chain of
// "because ←" links that never reaches a floor.

const FIG_X = 258;

const STARS: { x: number; y: number; th: number; ph: number }[] = [
  { x: 70, y: 92, th: 0.15, ph: 0.2 }, { x: 122, y: 70, th: 0.55, ph: 1.1 },
  { x: 176, y: 104, th: 0.30, ph: 2.0 }, { x: 232, y: 78, th: 0.72, ph: 0.7 },
  { x: 286, y: 96, th: 0.22, ph: 1.6 }, { x: 330, y: 122, th: 0.62, ph: 2.5 },
  { x: 94, y: 150, th: 0.80, ph: 0.9 }, { x: 150, y: 138, th: 0.40, ph: 1.9 },
  { x: 210, y: 162, th: 0.66, ph: 0.4 }, { x: 266, y: 150, th: 0.34, ph: 2.2 },
  { x: 316, y: 176, th: 0.50, ph: 1.3 }, { x: 60, y: 214, th: 0.48, ph: 0.6 },
  { x: 132, y: 204, th: 0.76, ph: 1.7 }, { x: 192, y: 232, th: 0.26, ph: 2.4 },
  { x: 250, y: 216, th: 0.58, ph: 0.3 }, { x: 302, y: 240, th: 0.44, ph: 1.5 },
];

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const ERASE = BEATS.map((b) => b.erase ?? 0);
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
const QREG = BEATS.map((b) => (b.qregress ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: 1.0, cx: 200, cy: 282, tr: 0.85 }));

function hHold(code: number, t: number) { 'worklet'; return code === 0 ? stand(t) : narratorHold(code, t); }
function hLive(code: number, t: number, bt: number) { 'worklet'; return code === 0 ? stand(t) : narratorLive(code, t, bt); }

export default function MetaphysicsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    const erase = L(ERASE[p], ERASE[n]);
    const chainOn = L(CHAIN[p], CHAIN[n]);
    const regress = QREG[n] ? q : 0;

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      fig: pose(figS, FIG_X, GROUND, K_FIG, -1, 1),
      erase, twinkle: t, chainOn, regress,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const voidStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.erase * 0.6 }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* the void that remains when the sky is wiped away */}
        <Animated.View style={[styles.voidDisc, voidStyle]} />
        {STARS.map((s, k) => <Star key={k} S={SCENE} star={s} />)}
        <Chain S={SCENE} />
        <View style={styles.ground} />
        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Star({ S, star }: { S: SharedValue<any>; star: { x: number; y: number; th: number; ph: number } }) {
  const st = useAnimatedStyle(() => {
    const gone = clamp01((S.value.erase - star.th) / 0.12);
    const tw = 0.55 + 0.45 * Math.sin(S.value.twinkle * 1.6 + star.ph);
    const r = 1 + 1.6 * (1 - gone);
    return { opacity: (1 - gone) * tw, transform: [{ scale: r }] };
  });
  return <Animated.View style={[styles.star, { left: star.x, top: star.y }, st]} />;
}

// the chain of causes: each link explained by an earlier one, to the left, forever
const LINK_X = [312, 258, 204, 150, 96];
function Chain({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({
    opacity: S.value.chainOn,
    transform: [{ translateX: -S.value.regress * 26 }],
  }));
  const qmark = useAnimatedStyle(() => ({ opacity: S.value.chainOn * (0.4 + 0.6 * Math.abs(Math.sin(S.value.twinkle * 1.4))) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      {LINK_X.map((x, k) => (
        <View key={k}>
          <View style={[styles.link, { left: x - 8, top: 322 }]} />
          {k < LINK_X.length - 1 ? <Text style={[styles.arrow, { left: x - 30, top: 314 }]}>←</Text> : null}
        </View>
      ))}
      <Animated.Text style={[styles.arrow, { left: 66, top: 314 }, qmark]}>←</Animated.Text>
      <Animated.Text style={[styles.qmark, { left: 44, top: 312 }, qmark]}>?</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  voidDisc: {
    position: 'absolute', left: 110, top: 90, width: 180, height: 170, borderRadius: 90, backgroundColor: INK,
  },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: INK },
  link: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: INK, backgroundColor: RULE },
  arrow: { position: 'absolute', fontFamily: 'Inter_700Bold', fontSize: 15, color: SOFT },
  qmark: { position: 'absolute', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: SOFT },
});

export function MetaphysicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={MetaphysicsScene} />;
}
