import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethics2Script';
import {
  BLANK, WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, strideStance,
  type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A found wallet, a finder who deliberates, and a guide who walks in to try each
// ethical lens on it — every beat a different gesture.

const P_CODE = BEATS.map((b) => b.p ?? 0);
const PX = BEATS.map((b) => b.px ?? 262);
const G_CODE = BEATS.map((b) => (b.g ?? -1));
const GX = BEATS.map((b) => b.gx ?? 108);
const G_ON = BEATS.map((b) => ((b.g ?? -1) >= 0 ? 1 : 0));

const WALLET_X = 176;

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.13, cx: 186, cy: 432, tr: 0.85 }));

export default function Ethics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    // Finder — gesture blend, small steps.
    const finderS = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    const fx = L(PX[p], PX[n]);

    // Guide — walks in when its position jumps; otherwise blends gestures in place.
    const gOn = L(G_ON[p], G_ON[n]);
    const moving = Math.abs(GX[n] - GX[p]) > 10;
    const guideS = moving
      ? strideStance(GX[p], GX[n], emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(G_CODE[p] < 0 ? 0 : G_CODE[p], t), emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr);
    const gx = L(GX[p], GX[n]);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      finder: pose(finderS, fx, GROUND, K_FIG, -1, 1),
      guide: gOn > 0.02 ? pose(guideS, gx, GROUND, K_FIG, 1, gOn) : BLANK,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.finder);
  const DG = useDerivedValue<Bundle>(() => SCENE.value.guide);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {/* the wallet on the pavement */}
        <View style={styles.walletShadow} />
        <View style={styles.wallet}>
          <View style={styles.walletFold} />
        </View>
        <Stickman D={DG} k={K_FIG} />
        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  walletShadow: { position: 'absolute', left: WALLET_X - 16, top: GROUND - 2, width: 32, height: 4, borderRadius: 2, backgroundColor: RULE },
  wallet: {
    position: 'absolute', left: WALLET_X - 15, top: GROUND - 17, width: 30, height: 17, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  walletFold: { position: 'absolute', left: 0, right: 0, top: 7, height: 1.2, backgroundColor: SOFT },
});

export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} />;
}
