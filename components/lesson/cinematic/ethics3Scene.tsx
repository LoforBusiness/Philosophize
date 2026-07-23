import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './ethics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The trolley problem, staged. The decider + lever sit far left; the track, the
// trolley, the five (main line) and the one (branch) are all to the right, so the
// figure never overlaps the rolling stock. The trolley advances toward the five as
// the verdicts are weighed.

const FIG_X = 92;
const LEVER_X = 122;
const JUNCTION = 264;
const MAIN5 = [300, 318, 336, 354, 372];      // the five, on the main line
const ONE = { x: 322, y: GROUND - 46 };        // the one, up the branch

const D_CODE = BEATS.map((b) => b.d ?? 0);
const TX = BEATS.map((b) => b.tx ?? 150);

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 0.96, cx: 212, cy: 430, tr: 0.85 }));

export default function Ethics3Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const d = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      fig: pose(d, FIG_X, GROUND, K_FIG, 1, 1),
      tx: L(TX[p], TX[n]),
      wheel: (t * 220) % 360,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const trolleyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.tx }] }));
  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.wheel}deg` }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* main track */}
        <View style={styles.track} />
        {/* the branch line, up-right off the junction */}
        <View style={styles.branch} />

        {/* the lever */}
        <View style={styles.leverBase} />
        <View style={styles.leverArm} />

        {/* the five, on the main line */}
        {MAIN5.map((x) => <Peg key={x} x={x} y={GROUND} />)}
        {/* the one, on the branch */}
        <Peg x={ONE.x} y={ONE.y} />

        {/* the trolley, rolling toward the five */}
        <Animated.View style={[styles.trolleyWrap, trolleyStyle]}>
          <View style={styles.car} />
          <View style={styles.carRoof} />
          <Animated.View style={[styles.wheel, { left: 4 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
          <Animated.View style={[styles.wheel, { right: 4 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Peg({ x, y }: { x: number; y: number }) {
  return (
    <View style={[styles.peg, { left: x - 3, top: y - 26 }]}>
      <View style={styles.pegHead} />
      <View style={styles.pegBody} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  track: { position: 'absolute', left: 40, right: 20, top: GROUND, height: 2, backgroundColor: INK },
  branch: {
    position: 'absolute', left: JUNCTION, top: GROUND - 24, width: 74, height: 2, backgroundColor: SOFT,
    transformOrigin: '0% 50%', transform: [{ rotate: '-33deg' }],
  },
  leverBase: { position: 'absolute', left: LEVER_X - 8, top: GROUND - 6, width: 16, height: 6, borderWidth: 1.5, borderColor: INK, backgroundColor: INK },
  leverArm: {
    position: 'absolute', left: LEVER_X - 1.5, top: GROUND - 34, width: 3, height: 30, backgroundColor: INK,
    transformOrigin: '50% 100%', transform: [{ rotate: '14deg' }], borderRadius: 2,
  },
  peg: { position: 'absolute', width: 6, alignItems: 'center' },
  pegHead: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  pegBody: { width: 4, height: 18, backgroundColor: INK, marginTop: -1, borderRadius: 2 },

  trolleyWrap: { position: 'absolute', left: 0, top: GROUND - 30, width: 46, height: 30 },
  car: { position: 'absolute', left: 0, top: 4, width: 46, height: 22, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER },
  carRoof: { position: 'absolute', left: 6, top: 0, width: 34, height: 5, backgroundColor: INK, borderRadius: 2 },
  wheel: { position: 'absolute', bottom: -3, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  spoke: { width: 2, height: 8, backgroundColor: INK },
});

export function Ethics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics3Scene} />;
}
