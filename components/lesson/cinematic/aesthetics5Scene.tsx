import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A brooding figure with a self-cloud overhead; a kestrel hovers and the ego fades
// (unselfing). Later a single leaf (Ruskin). Figure left, bird/leaf to the right.

const FIG_X = 118;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BIRD = BEATS.map((b) => b.bird ?? 0);
const EGO = BEATS.map((b) => b.ego ?? 0);
const LEAF = BEATS.map((b) => b.leaf ?? 0);

export default function Aesthetics5Scene({ clock, bt, bi, i }: SceneApi) {
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
      bird: L(BIRD[p], BIRD[n]),
      ego: L(EGO[p], EGO[n]),
      leaf: L(LEAF[p], LEAF[n]),
      hover: Math.sin(t * 2.4) * 6,
      flap: Math.sin(t * 9) * 16,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const birdStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bird, transform: [{ translateY: SCENE.value.hover }] }));
  const wingL = useAnimatedStyle(() => ({ transform: [{ rotate: `${-20 - SCENE.value.flap}deg` }] }));
  const wingR = useAnimatedStyle(() => ({ transform: [{ rotate: `${20 + SCENE.value.flap}deg` }] }));
  const egoStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ego * 0.85, transform: [{ scale: 0.7 + 0.3 * SCENE.value.ego }, { translateY: (1 - SCENE.value.ego) * -14 }] }));
  const leafStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.leaf, transform: [{ rotate: `${Math.sin(SCENE.value.t * 1.3) * 6}deg` }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the brooding self-cloud */}
        <Animated.View style={[styles.ego, egoStyle]} pointerEvents="none">
          <Text style={styles.egoT}>me me me</Text>
        </Animated.View>

        {/* the hovering kestrel */}
        <Animated.View style={[styles.bird, birdStyle]} pointerEvents="none">
          <Animated.View style={[styles.wing, { left: -14 }, wingL]} />
          <Animated.View style={[styles.wing, { right: -14 }, wingR]} />
          <View style={styles.birdBody} />
          <View style={styles.birdHead} />
          <View style={styles.birdBeak} />
          <View style={styles.birdTail} />
        </Animated.View>

        {/* Ruskin's single leaf */}
        <Animated.View style={[styles.leaf, leafStyle]} pointerEvents="none">
          <View style={styles.leafBlade} />
          <View style={styles.leafVein} />
          <View style={styles.leafStem} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  ego: { position: 'absolute', left: FIG_X - 26, top: 320, width: 76, height: 34, borderWidth: 2, borderColor: SOFT, borderRadius: 18, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  egoT: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1, color: SOFT },

  bird: { position: 'absolute', left: 272, top: 320, width: 40, height: 30, alignItems: 'center' },
  birdBody: { position: 'absolute', top: 8, width: 20, height: 14, borderRadius: 8, backgroundColor: INK, transform: [{ rotate: '90deg' }] },
  birdHead: { position: 'absolute', top: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: INK },
  birdBeak: { position: 'absolute', top: 6, left: 24, width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK },
  birdTail: { position: 'absolute', top: 22, width: 5, height: 12, backgroundColor: INK, borderRadius: 2 },
  wing: { position: 'absolute', top: 8, width: 26, height: 8, borderRadius: 5, backgroundColor: INK, transformOrigin: '50% 50%' },

  leaf: { position: 'absolute', left: 286, top: 420, width: 34, height: 60, alignItems: 'center' },
  leafBlade: { position: 'absolute', top: 0, width: 26, height: 40, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 3, borderBottomRightRadius: 20 },
  leafVein: { position: 'absolute', top: 6, width: 2, height: 30, backgroundColor: SOFT },
  leafStem: { position: 'absolute', top: 38, width: 2.5, height: 20, backgroundColor: INK },
});

export function Aesthetics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics5Scene} />;
}
