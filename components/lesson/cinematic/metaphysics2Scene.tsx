import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './metaphysics2Script';
import {
  WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, strideStance, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A traveller who WALKS a road to Parmenides' fork: IT IS (a solid sign) and
// IT IS NOT (a sign that dissolves the moment he nears it).

const E = BEATS.map((b) => b.e ?? 0);
const X = BEATS.map((b) => b.x ?? 206);
const GONE = BEATS.map((b) => b.gone ?? 0);

const SIGN_IS_X = 286;
const SIGN_NOT_X = 340;

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.0, cx: 206, cy: 430, tr: 0.9 }));

export default function Metaphysics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const moving = Math.abs(X[n] - X[p]) > 10;   // he only ever walks rightward, toward the fork
    const travS = moving
      ? strideStance(X[p], X[n], emoteLive(E[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(E[p], t), emoteLive(E[n], t, bt.value), tr);
    const tx = L(X[p], X[n]);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      trav: pose(travS, tx, GROUND, K_FIG, 1, 1),
      gone: L(GONE[p], GONE[n]),
      t,
    };
  });

  const DT = useDerivedValue<Bundle>(() => SCENE.value.trav);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const notSign = useAnimatedStyle(() => {
    const flick = 0.75 + 0.25 * Math.sin(SCENE.value.t * 5.0);
    return { opacity: (1 - SCENE.value.gone) * flick };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {/* the two roads diverging at the fork */}
        <View style={[styles.road, { left: SIGN_IS_X - 8, top: GROUND - 1, width: 60, transform: [{ rotate: '-9deg' }] }]} />
        <Animated.View style={[styles.roadDash, { left: SIGN_NOT_X - 20, top: GROUND - 1, width: 60, transform: [{ rotate: '9deg' }] }, notSign]} />

        {/* IT IS — a solid signpost */}
        <View style={{ position: 'absolute', left: SIGN_IS_X - 1, top: GROUND - 78, width: 2.5, height: 78, backgroundColor: INK }} />
        <View style={styles.signIs}><Text style={styles.signIsText}>IT IS</Text></View>

        {/* IT IS NOT — a dissolving signpost */}
        <Animated.View style={notSign}>
          <View style={{ position: 'absolute', left: SIGN_NOT_X - 1, top: GROUND - 70, width: 2, height: 70, backgroundColor: SOFT }} />
          <View style={styles.signNot}><Text style={styles.signNotText}>IT IS NOT</Text></View>
        </Animated.View>

        <Stickman D={DT} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 250, top: GROUND, height: 1.5, backgroundColor: RULE },
  road: { position: 'absolute', height: 1.5, backgroundColor: RULE, transformOrigin: '0% 50%' },
  roadDash: { position: 'absolute', height: 1.5, borderTopWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', transformOrigin: '0% 50%' },
  signIs: {
    position: 'absolute', left: SIGN_IS_X - 28, top: GROUND - 96, width: 56, paddingVertical: 5,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, alignItems: 'center',
  },
  signIsText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1, color: INK },
  signNot: {
    position: 'absolute', left: SIGN_NOT_X - 34, top: GROUND - 88, width: 68, paddingVertical: 5,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3, alignItems: 'center',
  },
  signNotText: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 0.8, color: SOFT },
});

export function Metaphysics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics2Scene} />;
}
