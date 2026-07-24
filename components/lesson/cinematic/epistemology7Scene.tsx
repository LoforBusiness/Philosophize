import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './epistemology7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A farmer tosses feed to a chicken while a row of "fed" ✓ days piles up overhead —
// then the last day turns to a ? (Russell's twist). Farmer left, chicken centre,
// day-row up top.

const FIG_X = 84;
const HEN_X = 216;
const DAYS_X = [150, 190, 230, 270];        // the ✓ days
const TWIST_X = 310;                         // the ? day

const P_CODE = BEATS.map((b) => b.p ?? 0);
const DAYS = BEATS.map((b) => b.days ?? 0);
const TWIST = BEATS.map((b) => b.twist ?? 0);

export default function Epistemology7Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 202, cy: 378 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      days: L(DAYS[p], DAYS[n]),
      twist: L(TWIST[p], TWIST[n]),
      peck: Math.max(0, Math.sin(t * 3.2)),   // the hen pecks
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const henStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.peck * 6 }] }));
  const twistStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.twist, transform: [{ scale: 0.6 + 0.4 * SCENE.value.twist }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the row of "fed" days */}
        {DAYS_X.map((x, k) => <Day key={k} S={SCENE} x={x} k={k} />)}
        <View style={styles.dayTrack} pointerEvents="none" />
        <Animated.View style={[styles.twistDay, { left: TWIST_X - 15 }, twistStyle]}>
          <Text style={styles.twistQ}>?</Text>
        </Animated.View>

        {/* feed scattered on the ground */}
        <View style={[styles.feed, { left: HEN_X - 26 }]} />
        <View style={[styles.feed, { left: HEN_X - 12 }]} />
        <View style={[styles.feed, { left: HEN_X + 2 }]} />

        {/* the chicken */}
        <Animated.View style={[styles.hen, { left: HEN_X - 24 }, henStyle]}>
          <View style={styles.henBody} />
          <View style={styles.henHead} />
          <View style={styles.henComb} />
          <View style={styles.henBeak} />
          <View style={styles.henEye} />
          <View style={[styles.henLeg, { left: 16 }]} />
          <View style={[styles.henLeg, { left: 26 }]} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Day({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.days - k) }));
  return (
    <Animated.View style={[styles.day, { left: x - 15 }, st]}>
      <View style={styles.checkA} />
      <View style={styles.checkB} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  dayTrack: { position: 'absolute', left: 132, top: 316, width: 194, height: 2, backgroundColor: RULE },
  day: { position: 'absolute', top: 296, width: 30, height: 30, borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  checkA: { position: 'absolute', left: 8, top: 15, width: 7, height: 2.5, backgroundColor: INK, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  checkB: { position: 'absolute', left: 11, top: 12, width: 13, height: 2.5, backgroundColor: INK, borderRadius: 2, transform: [{ rotate: '-50deg' }] },
  twistDay: { position: 'absolute', top: 294, width: 32, height: 32, borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  twistQ: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: PAPER },

  feed: { position: 'absolute', top: GROUND - 3, width: 3, height: 3, borderRadius: 2, backgroundColor: SOFT },
  hen: { position: 'absolute', top: GROUND - 42, width: 52, height: 42 },
  henBody: { position: 'absolute', left: 4, top: 12, width: 40, height: 26, borderRadius: 15, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER },
  henHead: { position: 'absolute', left: 28, top: 0, width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER },
  henComb: { position: 'absolute', left: 34, top: -4, width: 8, height: 6, borderRadius: 3, backgroundColor: INK },
  henBeak: { position: 'absolute', left: 44, top: 8, width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 7, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK },
  henEye: { position: 'absolute', left: 38, top: 6, width: 3, height: 3, borderRadius: 2, backgroundColor: INK },
  henLeg: { position: 'absolute', top: 36, width: 2, height: 8, backgroundColor: INK },
});

export function Epistemology7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology7Scene} />;
}
