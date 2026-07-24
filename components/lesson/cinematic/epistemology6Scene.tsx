import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './epistemology6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A great balance holds two equal, opposing arguments — perfectly level, it never
// tips. The figure sits calm beneath it (ataraxia). Later a "NOTHING IS KNOWN" block
// cracks under its own weight. Balance up top, figure below-left — no overlap.

const FIG_X = 96;
const BAL_X = 236;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BAL = BEATS.map((b) => b.bal ?? 0);
const CRACK = BEATS.map((b) => b.crack ?? 0);

export default function Epistemology6Scene({ clock, bt, bi, i }: SceneApi) {
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
      bal: L(BAL[p], BAL[n]),
      crack: L(CRACK[p], CRACK[n]),
      // the beam quivers a hair but never commits — suspended judgment
      tilt: Math.sin(t * 1.1) * 2,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const balStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bal }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt}deg` }] }));
  const panL = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.tilt * 0.9 }] }));
  const panR = useAnimatedStyle(() => ({ transform: [{ translateY: -SCENE.value.tilt * 0.9 }] }));
  const crackStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.crack,
    transform: [{ translateY: (1 - SCENE.value.crack) * -8 }, { rotate: `${Math.sin(SCENE.value.t * 9) * SCENE.value.crack * 2}deg` }],
  }));
  const crackLine = useAnimatedStyle(() => ({ opacity: SCENE.value.crack }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the balance of arguments */}
        <Animated.View style={balStyle} pointerEvents="none">
          <View style={styles.post} />
          <View style={styles.fulcrum} />
          <Animated.View style={[styles.beam, beamStyle]}>
            <View style={[styles.hang, { left: 4 }]} />
            <View style={[styles.hang, { right: 4 }]} />
          </Animated.View>
          <Animated.View style={[styles.pan, { left: BAL_X - 78 }, panL]}><Text style={styles.panT}>FOR</Text></Animated.View>
          <Animated.View style={[styles.pan, { left: BAL_X + 30 }, panR]}><Text style={styles.panT}>AGAINST</Text></Animated.View>
        </Animated.View>

        {/* the self-refuting boast, cracking */}
        <Animated.View style={[styles.claim, crackStyle]} pointerEvents="none">
          <Text style={styles.claimT}>NOTHING IS KNOWN</Text>
          <Animated.View style={[styles.crackA, crackLine]} />
          <Animated.View style={[styles.crackB, crackLine]} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  post: { position: 'absolute', left: BAL_X - 2, top: 300, width: 4, height: 118, backgroundColor: INK },
  fulcrum: { position: 'absolute', left: BAL_X - 8, top: 294, width: 16, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK },
  beam: { position: 'absolute', left: BAL_X - 84, top: 300, width: 168, height: 4, backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 50%' },
  hang: { position: 'absolute', top: 0, width: 2, height: 22, backgroundColor: SOFT },
  pan: { position: 'absolute', top: 322, width: 66, height: 30, borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  panT: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, color: INK },

  claim: { position: 'absolute', left: BAL_X - 66, top: 430, width: 132, height: 40, borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  claimT: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.5, color: INK },
  crackA: { position: 'absolute', left: 64, top: 0, width: 2, height: 20, backgroundColor: INK, transform: [{ rotate: '20deg' }] },
  crackB: { position: 'absolute', left: 68, top: 18, width: 2, height: 22, backgroundColor: INK, transform: [{ rotate: '-24deg' }] },
});

export function Epistemology6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology6Scene} />;
}
