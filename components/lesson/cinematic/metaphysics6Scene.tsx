import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './metaphysics6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A shipwright beside a ship whose planks crossfade old→new (endless replacement).
// On the last question a SECOND ship, built from the old planks, fades in to the
// right. Figure left, ships right — no overlap.

const FIG_X = 84;
const SHIP_X = 224;                 // main ship centre
const SHIP2_X = 336;                // the rebuilt ship
const PLANKS = [0, 1, 2, 3];        // hull courses, top→bottom

const P_CODE = BEATS.map((b) => b.p ?? 0);
const SWAP = BEATS.map((b) => b.swap ?? 0);
const TWO = BEATS.map((b) => b.two ?? 0);

export default function Metaphysics6Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 202, cy: 400 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      swap: L(SWAP[p], SWAP[n]),
      two: L(TWO[p], TWO[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const two = useAnimatedStyle(() => ({ opacity: SCENE.value.two, transform: [{ translateX: (1 - SCENE.value.two) * 20 }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        <Ship S={SCENE} x={SHIP_X} live />
        <Animated.View style={[StyleSheet.absoluteFill, two]} pointerEvents="none">
          <Ship S={SCENE} x={SHIP2_X} live={false} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const PLANK_W = [120, 106, 86, 56];        // hull courses taper toward the keel
const PLANK_Y = [418, 430, 442, 454];

function Ship({ S, x, live }: { S: SharedValue<any>; x: number; live: boolean }) {
  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      {/* mast + sail */}
      <View style={[styles.mast, { left: x - 2 }]} />
      <View style={[styles.sail, { left: x + 4 }]} />
      {/* deck line + raised prow */}
      <View style={[styles.deck, { left: x - 62 }]} />
      <View style={[styles.prow, { left: x + 56 }]} />
      {/* hull, built of tapering plank courses that swap old→new */}
      {PLANKS.map((k) => <Plank key={k} S={S} x={x} k={k} live={live} />)}
    </View>
  );
}

function Plank({ S, x, k, live }: { S: SharedValue<any>; x: number; k: number; live: boolean }) {
  const w = PLANK_W[k];
  const bottom = k === PLANKS.length - 1;
  const st = useAnimatedStyle(() => {
    // a "new plank" wave sweeps through the hull, one course at a time
    const wave = (S.value.t * 0.5 + k * 0.28) % 1;
    const nu = live ? clamp01(S.value.swap * (0.35 + 0.65 * Math.pow(Math.sin(wave * Math.PI), 4))) : 0;
    return { opacity: 0.4 + 0.6 * nu };
  });
  return (
    <>
      <View style={[styles.plankOld, bottom && styles.plankBottom, { left: x - w / 2, top: PLANK_Y[k], width: w }]} />
      <Animated.View style={[styles.plankNew, bottom && styles.plankBottom, { left: x - w / 2, top: PLANK_Y[k], width: w }, st]} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  mast: { position: 'absolute', top: 336, width: 4, height: 84, backgroundColor: INK, borderRadius: 2 },
  sail: { position: 'absolute', top: 342, width: 0, height: 0, borderTopWidth: 0, borderBottomWidth: 64, borderLeftWidth: 44, borderBottomColor: 'transparent', borderLeftColor: SOFT },
  deck: { position: 'absolute', top: 414, width: 124, height: 5, backgroundColor: INK, borderRadius: 2 },
  prow: { position: 'absolute', top: 398, width: 0, height: 0, borderBottomWidth: 18, borderRightWidth: 12, borderBottomColor: INK, borderRightColor: 'transparent' },
  plankOld: { position: 'absolute', height: 12, backgroundColor: SOFT },
  plankNew: { position: 'absolute', height: 12, backgroundColor: INK },
  plankBottom: { borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
});

export function Metaphysics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics6Scene} />;
}
