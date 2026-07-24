import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Two societies as bar charts. A: everyone equal but low. B: unequal, yet the worst-
// off bar is HIGHER than under equality — the one Rawls permits. Tap the just society.
// Figure far left, the two panels centre-right.

const FIG_X = 58;
// each society's bars (heights); the FIRST bar is the worst-off group
const SOC = {
  equal: { x: 150, label: 'ALL EQUAL', bars: [34, 34, 34] },
  lift: { x: 300, label: 'SOME RICHER', bars: [48, 62, 78] },
};
const BASE_Y = 452;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BARS = BEATS.map((b) => b.bars ?? 0);

export default function Political6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const isSummary = !!cur.summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 200, cy: 356 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      bars: L(BARS[p], BARS[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  const panel = (id: 'equal' | 'lift') => {
    const soc = SOC[id];
    const chosen = picked === id;
    const correct = id === 'lift';
    const inner = (
      <View style={[styles.panel, answered && correct && styles.panelRight, answered && chosen && !correct && styles.panelWrong]}>
        <View style={styles.barRow}>
          {soc.bars.map((h, k) => (
            <View key={k} style={styles.barSlot}>
              <View style={[styles.bar, { height: h }, k === 0 && styles.barWorst]} />
              {k === 0 ? <View style={styles.worstDot} /> : null}
            </View>
          ))}
        </View>
        <Text style={[styles.panelLabel, answered && correct && styles.panelLabelOn]}>{soc.label}</Text>
      </View>
    );
    return showPick ? (
      <Pressable key={id} style={[styles.panelHit, { left: soc.x - 60 }]} disabled={answered} onPress={() => onPick(id, correct)}>{inner}</Pressable>
    ) : (
      <View key={id} style={[styles.panelHit, { left: soc.x - 60 }]} pointerEvents="none">{inner}</View>
    );
  };

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {panel('equal')}
        {panel('lift')}
        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  panelHit: { position: 'absolute', top: BASE_Y - 118, width: 120, alignItems: 'center' },
  panel: { width: 118, borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER, paddingTop: 8, paddingBottom: 6, alignItems: 'center' },
  panelRight: { borderColor: INK, backgroundColor: INK },
  panelWrong: { borderColor: SOFT, opacity: 0.45 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', height: 82, gap: 8 },
  barSlot: { alignItems: 'center', justifyContent: 'flex-end', height: 82 },
  bar: { width: 18, backgroundColor: SOFT, borderRadius: 2 },
  barWorst: { backgroundColor: INK },
  worstDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: INK, marginTop: 3 },
  panelLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5, color: INK, marginTop: 4 },
  panelLabelOn: { color: PAPER },
});

export function Political6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political6Scene} />;
}
