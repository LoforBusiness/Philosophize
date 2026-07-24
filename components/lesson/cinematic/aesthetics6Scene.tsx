import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A tiny figure at the foot of a vast mountain range, snow drifting — dwarfed and
// awed. A small flower is the beautiful foil. The figure keeps the lower-left; the
// mountain fills the rest, towering over it.

const FIG_X = 92;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const VAST = BEATS.map((b) => b.vast ?? 0);
const FLOWER = BEATS.map((b) => b.flower ?? 0);
const FLAKES = Array.from({ length: 14 }, (_, k) => ({ x: 70 + (k * 311) % 300, ph: (k * 0.17) % 1, sp: 0.14 + (k % 4) * 0.03 }));

export default function Aesthetics6Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.94, cx: 210, cy: 372 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      vast: L(VAST[p], VAST[n]),
      flower: L(FLOWER[p], FLOWER[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const vastStyle = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * SCENE.value.vast }));
  const flowerStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flower, transform: [{ scale: 0.7 + 0.3 * SCENE.value.flower }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* the vast mountain range */}
        <Animated.View style={vastStyle} pointerEvents="none">
          <View style={styles.peakBack} />
          <View style={styles.peakMain} />
          <View style={styles.snowCap} />
        </Animated.View>
        <View style={styles.ground} />

        {/* snow */}
        {FLAKES.map((s, k) => <Flake key={k} S={SCENE} s={s} k={k} />)}

        {/* the beautiful little flower */}
        <Animated.View style={[styles.flower, flowerStyle]} pointerEvents="none">
          <View style={styles.stem} />
          {[0, 72, 144, 216, 288].map((a) => <View key={a} style={[styles.petal, { transform: [{ rotate: `${a}deg` }, { translateY: -7 }] }]} />)}
          <View style={styles.flowerCore} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Flake({ S, s, k }: { S: SharedValue<any>; s: { x: number; ph: number; sp: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * s.sp + s.ph) % 1 + 1) % 1;
    const y = lerp(250, GROUND - 4, f);
    const sway = Math.sin(S.value.t * 1.2 + k) * 12;
    return { opacity: (0.4 + 0.4 * Math.sin(f * Math.PI)) * S.value.vast, transform: [{ translateX: sway }, { translateY: y - 250 }] };
  });
  return <Animated.View style={[styles.flake, { left: s.x, top: 250 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  // border-triangles: base at the ground, apex up
  peakMain: { position: 'absolute', left: 90, top: 244, width: 0, height: 0, borderLeftWidth: 165, borderRightWidth: 165, borderBottomWidth: 256, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: SOFT },
  peakBack: { position: 'absolute', left: 200, top: 286, width: 0, height: 0, borderLeftWidth: 120, borderRightWidth: 120, borderBottomWidth: 214, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: RULE },
  snowCap: { position: 'absolute', left: 232, top: 244, width: 0, height: 0, borderLeftWidth: 26, borderRightWidth: 26, borderBottomWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: PAPER },
  flake: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: PAPER },

  flower: { position: 'absolute', left: 150, top: 452, width: 24, height: 48, alignItems: 'center' },
  stem: { position: 'absolute', bottom: 0, width: 2.5, height: 34, backgroundColor: SOFT },
  petal: { position: 'absolute', top: 4, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER },
  flowerCore: { position: 'absolute', top: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
});

export function Aesthetics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics6Scene} />;
}
