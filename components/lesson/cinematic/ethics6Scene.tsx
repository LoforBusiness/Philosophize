import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './ethics6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The footbridge: a trolley on the ground track bears down on five; on a bridge above
// stand the decider and a larger stranger. Two levels — bridge figures at BRIDGE_Y,
// trolley + the five on the ground.

const BRIDGE_Y = 410;
const DEC_X = 150;
const STR_X = 216;
const MAIN5 = [300, 318, 336, 354, 372];

const D_CODE = BEATS.map((b) => b.d ?? 0);
const S_CODE = BEATS.map((b) => b.str ?? 0);
const TX = BEATS.map((b) => b.tx ?? 60);

export default function Ethics6Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const d = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    const str = mixStance(emoteHold(S_CODE[p], t), emoteLive(S_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.9, cx: 222, cy: 452 },
      dec: pose(d, DEC_X, BRIDGE_Y, K_FIG, 1, 1),
      str: pose(str, STR_X, BRIDGE_Y, K_FIG * 1.16, -1, 1),
      tx: L(TX[p], TX[n]),
      wheel: (t * 220) % 360,
    };
  });

  const DD = useDerivedValue<Bundle>(() => SCENE.value.dec);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.str);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const trolleyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.tx }] }));
  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.wheel}deg` }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {/* ground track */}
        <View style={styles.track} />
        {MAIN5.map((x) => <Peg key={x} x={x} />)}

        {/* trolley bearing down under the bridge */}
        <Animated.View style={[styles.trolleyWrap, trolleyStyle]}>
          <View style={styles.car} />
          <View style={styles.carRoof} />
          <Animated.View style={[styles.wheel, { left: 4 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
          <Animated.View style={[styles.wheel, { right: 4 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
        </Animated.View>

        {/* the bridge */}
        <View style={styles.bridgePost1} />
        <View style={styles.bridgePost2} />
        <View style={styles.bridgeDeck} />
        <View style={styles.bridgeRail} />

        {/* the decider + the large stranger, on the bridge */}
        <Stickman D={DD} k={K_FIG} />
        <Stickman D={DS} k={K_FIG * 1.16} />
      </Animated.View>
    </Animated.View>
  );
}

function Peg({ x }: { x: number }) {
  return (
    <View style={[styles.peg, { left: x - 3, top: GROUND - 26 }]}>
      <View style={styles.pegHead} />
      <View style={styles.pegBody} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  track: { position: 'absolute', left: 30, right: 20, top: GROUND, height: 2, backgroundColor: INK },
  peg: { position: 'absolute', width: 6, alignItems: 'center' },
  pegHead: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  pegBody: { width: 4, height: 18, backgroundColor: INK, marginTop: -1, borderRadius: 2 },

  trolleyWrap: { position: 'absolute', left: 0, top: GROUND - 30, width: 46, height: 30 },
  car: { position: 'absolute', left: 0, top: 4, width: 46, height: 22, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER },
  carRoof: { position: 'absolute', left: 6, top: 0, width: 34, height: 5, backgroundColor: INK, borderRadius: 2 },
  wheel: { position: 'absolute', bottom: -3, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center' },
  spoke: { width: 2, height: 8, backgroundColor: INK },

  bridgePost1: { position: 'absolute', left: 116, top: BRIDGE_Y + 6, width: 5, height: GROUND - BRIDGE_Y - 6, backgroundColor: SOFT },
  bridgePost2: { position: 'absolute', left: 250, top: BRIDGE_Y + 6, width: 5, height: GROUND - BRIDGE_Y - 6, backgroundColor: SOFT },
  bridgeDeck: { position: 'absolute', left: 104, top: BRIDGE_Y + 4, width: 158, height: 7, backgroundColor: INK, borderRadius: 2 },
  bridgeRail: { position: 'absolute', left: 104, top: BRIDGE_Y - 26, width: 158, height: 3, backgroundColor: SOFT, borderRadius: 2 },
});

export function Ethics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics6Scene} />;
}
