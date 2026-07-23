import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './ethics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Two figures under two different emblems argue across a gap; then a shared moral
// floor lights up under both. Emblems sit above the heads, the floor below the feet
// — the figures own the middle band alone, so nothing overlaps them.

const A_X = 118;
const B_X = 282;
const EMBLEM_Y = 332;

const A_CODE = BEATS.map((b) => b.a ?? 0);
const B_CODE = BEATS.map((b) => b.b ?? 0);
const FLOOR = BEATS.map((b) => b.floor ?? 0);

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.0, cx: 200, cy: 410, tr: 0.85 }));

export default function Ethics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const a = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const b = mixStance(emoteHold(B_CODE[p], t), emoteLive(B_CODE[n], t, bt.value), tr);
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      a: pose(a, A_X, GROUND, K_FIG, 1, 1),
      b: pose(b, B_X, GROUND, K_FIG, -1, 1),
      floor: L(FLOOR[p], FLOOR[n]),
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.b);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const floorStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.floor }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.floor }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* two cultures, two emblems */}
        <View style={[styles.triangle, { left: A_X - 13, top: EMBLEM_Y }]} />
        <View style={[styles.diamond, { left: B_X - 11, top: EMBLEM_Y + 2 }]} />

        {/* the shared moral floor */}
        <Animated.View style={[styles.floor, floorStyle]} />
        <Animated.Text style={[styles.floorLabel, labelStyle]}>HUMAN UNIVERSALS</Animated.Text>

        <Stickman D={DA} k={K_FIG} />
        <Stickman D={DB} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  triangle: {
    position: 'absolute', width: 0, height: 0,
    borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 22,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  diamond: { position: 'absolute', width: 20, height: 20, borderWidth: 2.5, borderColor: INK, transform: [{ rotate: '45deg' }] },
  floor: { position: 'absolute', left: 78, right: 78, top: GROUND + 8, height: 5, backgroundColor: INK, borderRadius: 2 },
  floorLabel: {
    position: 'absolute', left: 0, right: 0, top: GROUND + 16, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: SOFT,
  },
});

export function Ethics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics4Scene} />;
}
