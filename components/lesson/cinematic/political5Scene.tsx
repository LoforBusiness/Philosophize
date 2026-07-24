import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Plato's ordered city stands behind the figure; then a veil of ignorance drops over
// them, marked with the "?" of an unknown identity, so the rules they choose stay fair.

const FIG_X = 200;
const COLS = [96, 154, 246, 304];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const CITY = BEATS.map((b) => b.city ?? 0);
const VEIL = BEATS.map((b) => b.veil ?? 0);

export default function Political5Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 200, cy: 372 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      city: L(CITY[p], CITY[n]),
      veil: L(VEIL[p], VEIL[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const cityStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.city * 0.9 }));
  const veilStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.veil * 0.88, transform: [{ translateY: (1 - SCENE.value.veil) * -120 }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* Plato's ordered city */}
        <Animated.View style={cityStyle} pointerEvents="none">
          <View style={styles.pediment} />
          {COLS.map((x) => <View key={x} style={[styles.col, { left: x }]} />)}
          <View style={styles.stylobate} />
        </Animated.View>
        <View style={styles.ground} />

        <Stickman D={DF} k={K_FIG} />

        {/* the veil of ignorance, drawn down over the figure */}
        <Animated.View style={[styles.veil, veilStyle]} pointerEvents="none">
          <View style={styles.veilRod} />
          <Text style={styles.veilQ}>?</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  pediment: { position: 'absolute', left: 82, top: 300, width: 236, height: 0, borderLeftWidth: 20, borderRightWidth: 20, borderBottomWidth: 22, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: RULE },
  col: { position: 'absolute', top: 322, width: 14, height: 172, borderLeftWidth: 2, borderRightWidth: 2, borderColor: RULE },
  stylobate: { position: 'absolute', left: 78, top: 322, width: 244, height: 5, backgroundColor: RULE },

  veil: { position: 'absolute', left: FIG_X - 66, top: 300, width: 132, height: 130, backgroundColor: PAPER, borderWidth: 2, borderColor: SOFT, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  veilRod: { position: 'absolute', top: -3, left: -8, right: -8, height: 5, backgroundColor: INK, borderRadius: 2 },
  veilQ: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 60, color: SOFT },
});

export function Political5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political5Scene} />;
}
