import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure moved by music. Two note-streams rise on the flanks (never crossing the
// figure); a theatre mask looks on during the tragedy. The figure sways, clutches
// its chest, then opens in catharsis.

const FIG_X = 200;
const MASK = { x: 96, y: 300 };
// note columns kept to the flanks so nothing crosses the figure
const NOTES = [
  { x: 108, ph: 0.0 }, { x: 132, ph: 0.5 }, { x: 92, ph: 0.75 },
  { x: 292, ph: 0.2 }, { x: 268, ph: 0.6 }, { x: 308, ph: 0.9 },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const NOTEB = BEATS.map((b) => b.notes ?? 0);
const MASKB = BEATS.map((b) => b.mask ?? 0);

export default function Aesthetics3Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 200, cy: 404 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      notes: L(NOTEB[p], NOTEB[n]),
      mask: L(MASKB[p], MASKB[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const maskStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.mask, transform: [{ translateY: (1 - SCENE.value.mask) * 8 }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the note-streams, flanking the figure */}
        {NOTES.map((nt, k) => <Note key={k} S={SCENE} nt={nt} k={k} />)}

        {/* the tragic mask */}
        <Animated.View style={[styles.mask, { left: MASK.x - 22, top: MASK.y - 26 }, maskStyle]}>
          <View style={[styles.maskEye, { left: 10 }]} />
          <View style={[styles.maskEye, { right: 10 }]} />
          <View style={styles.maskMouth} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Note({ S, nt, k }: { S: SharedValue<any>; nt: { x: number; ph: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const frac = ((S.value.t * 0.32 + nt.ph) % 1 + 1) % 1;   // rise over a loop
    const y = lerp(GROUND - 20, 250, frac);
    const fade = Math.sin(frac * Math.PI);                    // fade in then out
    const sway = Math.sin(S.value.t * 2 + k) * 8;
    return { opacity: clamp01(S.value.notes) * fade, transform: [{ translateX: sway }, { translateY: y - (GROUND - 20) }] };
  });
  return (
    <Animated.View style={[styles.note, { left: nt.x - 5, top: GROUND - 20 }, st]}>
      <View style={styles.noteHead} />
      <View style={styles.noteStem} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  note: { position: 'absolute', width: 14, height: 16 },
  noteHead: { position: 'absolute', bottom: 0, left: 0, width: 10, height: 8, borderRadius: 4, backgroundColor: INK, transform: [{ rotate: '-20deg' }] },
  noteStem: { position: 'absolute', bottom: 4, left: 8, width: 2, height: 14, backgroundColor: INK },
  mask: { position: 'absolute', width: 44, height: 52, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, borderRadius: 20, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  maskEye: { position: 'absolute', top: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  maskMouth: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 18, height: 9, borderBottomWidth: 2.5, borderColor: INK, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, transform: [{ rotate: '180deg' }] },
});

export function Aesthetics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics3Scene} />;
}
