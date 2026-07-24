import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './logic6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Two big boxes wired by a bold arrow: [IF it rains] → [THEN streets wet]. On the
// rain beat, drops fall on the IF box and the THEN box fills. On Q1 the boxes are
// tappable (tap the antecedent). Figure sits far left, boxes to the right.

const FIG_X = 60;
const IF_X = 168;
const THEN_X = 312;
const BOX_Y = 322;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const LINK = BEATS.map((b) => b.link ?? 0);
const RAIN = BEATS.map((b) => b.rain ?? 0);
const RAINCOLS = [138, 158, 178, 198];

export default function Logic6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      cam: { s: isSummary ? 1 : 1.0, cx: 200, cy: 336 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      link: L(LINK[p], LINK[n]),
      rain: L(RAIN[p], RAIN[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const arrowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  const wetStyle = useAnimatedStyle(() => ({ height: 12 + SCENE.value.rain * 32 }));

  const answered = picked !== null;
  const showTap = (cur.tapBoxes ?? 0) > 0 && !!cur.interact;

  const box = (id: 'if' | 'then', x: number, l1: string, l2: string) => {
    const chosen = picked === id;
    const correct = id === 'if';
    const inner = (
      <View style={[styles.box, answered && correct && styles.boxRight, answered && chosen && !correct && styles.boxWrong]}>
        {id === 'then' ? <Animated.View style={[styles.wet, wetStyle]} pointerEvents="none" /> : null}
        <Text style={[styles.boxTag, answered && correct && styles.boxTagOn]}>{l1}</Text>
        <Text style={[styles.boxTxt, answered && correct && styles.boxTagOn]}>{l2}</Text>
      </View>
    );
    return showTap ? (
      <Pressable key={id} style={[styles.boxHit, { left: x - 62 }]} disabled={answered} onPress={() => onPick(id, correct)}>{inner}</Pressable>
    ) : (
      <View key={id} style={[styles.boxHit, { left: x - 62 }]} pointerEvents="none">{inner}</View>
    );
  };

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* rain on the IF box */}
        {RAINCOLS.map((x, k) => <Rain key={k} S={SCENE} x={x} k={k} />)}

        {/* the two boxes + arrow */}
        {box('if', IF_X, 'IF', 'it rains')}
        <Animated.View style={[styles.arrow, arrowStyle]} pointerEvents="none" />
        <Animated.View style={[styles.arrowHead, arrowStyle]} pointerEvents="none" />
        {box('then', THEN_X, 'THEN', 'streets wet')}

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Rain({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * 1.1 + k * 0.25) % 1 + 1) % 1;
    const y = lerp(276, BOX_Y - 4, f);
    return { opacity: S.value.rain * (1 - f), transform: [{ translateY: y - 276 }] };
  });
  return <Animated.View style={[styles.drop, { left: x, top: 276 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  boxHit: { position: 'absolute', top: BOX_Y - 34, width: 124, alignItems: 'center' },
  box: { width: 120, height: 68, borderWidth: 3, borderColor: INK, borderRadius: 10, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  boxRight: { borderColor: INK, backgroundColor: INK },
  boxWrong: { borderColor: SOFT, opacity: 0.5 },
  wet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: SOFT },
  boxTag: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1, color: INK },
  boxTxt: { fontFamily: 'Inter_400Regular', fontSize: 12, color: INK, marginTop: 2 },
  boxTagOn: { color: PAPER },

  arrow: { position: 'absolute', left: IF_X + 62, top: BOX_Y - 3, width: THEN_X - IF_X - 124, height: 5, backgroundColor: INK, borderRadius: 2 },
  arrowHead: { position: 'absolute', left: THEN_X - 66, top: BOX_Y - 8, width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 12, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK },
  drop: { position: 'absolute', width: 3, height: 10, backgroundColor: SOFT, borderRadius: 2 },
});

export function Logic6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic6Scene} />;
}
