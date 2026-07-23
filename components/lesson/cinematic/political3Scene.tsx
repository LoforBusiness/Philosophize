import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A subject offers up a scroll of consent to a crowned ruler; a trust bond stretches
// between them. Subject left, ruler right, the scroll arcs through the gap, the crown
// rides above the ruler's head — the figures' bodies stay clear.

const SUB_X = 118;
const R_X = 282;
const HAND_Y = 430;

const SUB_CODE = BEATS.map((b) => b.sub ?? 0);
const R_CODE = BEATS.map((b) => b.r ?? 0);
const SCROLL = BEATS.map((b) => b.scroll ?? 0);
const BOND = BEATS.map((b) => b.bond ?? 0);

export default function Political3Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const sub = mixStance(emoteHold(SUB_CODE[p], t), emoteLive(SUB_CODE[n], t, bt.value), tr);
    const r = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    const scroll = L(SCROLL[p], SCROLL[n]);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 200, cy: 408 },
      sub: pose(sub, SUB_X, GROUND, K_FIG, 1, 1),
      ruler: pose(r, R_X, GROUND, K_FIG, -1, 1),
      scroll,
      scx: lerp(SUB_X + 32, R_X - 32, scroll),
      scy: HAND_Y - Math.sin(scroll * Math.PI) * 26,
      bond: L(BOND[p], BOND[n]),
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.sub);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.ruler);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const bondStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bond * 0.85 }));
  const scrollStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.scx - 200 }, { translateY: SCENE.value.scy - HAND_Y }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the trust bond */}
        <Animated.View style={[styles.bond, bondStyle]} />

        {/* the ruler's crown, above the head */}
        <View style={styles.crown}>
          <View style={[styles.crownPt, { left: 0 }]} />
          <View style={[styles.crownPt, { left: 9 }]} />
          <View style={[styles.crownPt, { left: 18 }]} />
          <View style={styles.crownBand} />
        </View>

        {/* the scroll of consent, arcing across */}
        <Animated.View style={[styles.scroll, scrollStyle]}>
          <View style={styles.scrollBody} />
          <View style={[styles.scrollCap, { left: -2 }]} />
          <View style={[styles.scrollCap, { right: -2 }]} />
        </Animated.View>

        <Stickman D={DS} k={K_FIG} />
        <Stickman D={DR} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  bond: { position: 'absolute', left: SUB_X + 16, right: STAGE_W - (R_X - 16), top: 402, height: 2, backgroundColor: SOFT, borderRadius: 2 },
  crown: { position: 'absolute', left: R_X - 11, top: GROUND - 168, width: 22, height: 12 },
  crownPt: { position: 'absolute', top: -4, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK },
  crownBand: { position: 'absolute', top: 3, width: 22, height: 5, backgroundColor: INK, borderRadius: 1 },
  scroll: { position: 'absolute', left: 200 - 13, top: HAND_Y - 5, width: 26, height: 10 },
  scrollBody: { position: 'absolute', left: 3, width: 20, height: 10, backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK, borderRadius: 2 },
  scrollCap: { position: 'absolute', top: -1, width: 5, height: 12, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER },
});

export function Political3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political3Scene} />;
}
