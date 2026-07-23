import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './strong4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A presenter under one probability meter. It fills to 100% and a lock snaps for a
// deduction; it slips to "likely" and dice roll out for an induction. The meter
// sits well above the figure's reach so the two never overlap.

const FIG_X = 200;
const MW = 176;                      // meter width
const MX = 200;                      // meter centre x
const MTOP = 300;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0.5);
const LOCK = BEATS.map((b) => b.lock ?? 0);
const DICE = BEATS.map((b) => b.dice ?? 0);

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.02, cx: 200, cy: 392, tr: 0.85 }));

export default function Strong4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    const dice = L(DICE[p], DICE[n]);
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      fill: L(FILL[p], FILL[n]),
      lock: L(LOCK[p], LOCK[n]),
      dice,
      // dice jitter only while they are out
      wob: Math.sin(t * 6.0) * 5 * dice,
      wob2: Math.sin(t * 5.1 + 1.3) * 5 * dice,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, SCENE.value.fill) }] }));
  const lockStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lock, transform: [{ scale: 0.6 + 0.4 * SCENE.value.lock }] }));
  const die1Style = useAnimatedStyle(() => ({ opacity: SCENE.value.dice, transform: [{ rotate: `${SCENE.value.wob}deg` }] }));
  const die2Style = useAnimatedStyle(() => ({ opacity: SCENE.value.dice, transform: [{ rotate: `${SCENE.value.wob2}deg` }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the probability meter */}
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, fillStyle]} />
        </View>
        <Text style={styles.meterLo}>0%</Text>
        <Text style={styles.meterHi}>100%</Text>

        {/* the guarantee lock, at the full end */}
        <Animated.View style={[styles.lock, lockStyle]}>
          <View style={styles.lockShackle} />
          <View style={styles.lockBody} />
        </Animated.View>

        {/* the dice — only out for an induction */}
        <Animated.View style={[styles.die, { left: MX - 34 }, die1Style]}>
          <View style={[styles.pip, { top: 4, left: 4 }]} />
          <View style={[styles.pip, { bottom: 4, right: 4 }]} />
        </Animated.View>
        <Animated.View style={[styles.die, { left: MX + 12 }, die2Style]}>
          <View style={[styles.pip, { top: 4, left: 4 }]} />
          <View style={[styles.pip, { top: 9, left: 9 }]} />
          <View style={[styles.pip, { bottom: 4, right: 4 }]} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  meterTrack: {
    position: 'absolute', left: MX - MW / 2, top: MTOP, width: MW, height: 18,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, overflow: 'hidden',
  },
  meterFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', backgroundColor: INK, transformOrigin: '0% 50%' },
  meterLo: { position: 'absolute', left: MX - MW / 2, top: MTOP + 20, fontFamily: 'Inter_500Medium', fontSize: 9, color: SOFT },
  meterHi: { position: 'absolute', left: MX + MW / 2 - 24, top: MTOP + 20, fontFamily: 'Inter_500Medium', fontSize: 9, color: SOFT },
  lock: { position: 'absolute', left: MX + MW / 2 + 6, top: MTOP - 4, width: 20, height: 26, alignItems: 'center', transformOrigin: '50% 50%' },
  lockShackle: { width: 12, height: 10, borderWidth: 2.5, borderColor: INK, borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  lockBody: { width: 18, height: 14, borderWidth: 2, borderColor: INK, backgroundColor: INK, borderRadius: 2, marginTop: -1 },
  die: {
    position: 'absolute', top: 258, width: 22, height: 22, borderWidth: 2, borderColor: INK,
    borderRadius: 4, backgroundColor: PAPER, transformOrigin: '50% 50%',
  },
  pip: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: INK },
});

export function Strong4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Strong4Scene} />;
}
