import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political2Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A ruler and a subject playing out power vs authority — threat/cower, then a
// podium of legitimacy with a bow or adoration.

const RULER_X = 120;
const SUBJECT_X = 288;
const PODIUM_H = 26;

const R_CODE = BEATS.map((b) => b.r ?? 0);
const SUB_CODE = BEATS.map((b) => b.sub ?? 0);
const POD = BEATS.map((b) => (b.podium ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.12, cx: 204, cy: 432, tr: 0.85 }));

export default function Political2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const rulerS = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    const subS = mixStance(emoteHold(SUB_CODE[p], t), emoteLive(SUB_CODE[n], t, bt.value), tr);
    const pod = L(POD[p], POD[n]);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      ruler: pose(rulerS, RULER_X, GROUND - pod * PODIUM_H, K_FIG, 1, 1),
      subject: pose(subS, SUBJECT_X, GROUND, K_FIG, -1, 1),
      pod,
    };
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.ruler);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.subject);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const podium = useAnimatedStyle(() => ({
    opacity: SCENE.value.pod,
    transform: [{ scaleY: SCENE.value.pod }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {/* the podium of legitimacy under the ruler */}
        <Animated.View style={[styles.podium, podium]} />
        <Stickman D={DR} k={K_FIG} />
        <Stickman D={DS} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  podium: {
    position: 'absolute', left: RULER_X - 30, top: GROUND - PODIUM_H, width: 60, height: PODIUM_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER, transformOrigin: '50% 100%',
  },
});

export function Political2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political2Scene} />;
}
