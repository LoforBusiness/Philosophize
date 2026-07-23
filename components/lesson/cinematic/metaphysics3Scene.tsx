import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './metaphysics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The cave: a prisoner (facing the wall on the left), flickering shadows on that
// wall, a perfect Form overhead, and an imperfect apple wobbling to the side. Wall
// left · Form up · apple right — the figure keeps the middle to itself.

const FIG_X = 176;
const WALL_X = 58;
const FORM = { x: 214, y: 246 };
const APPLE = { x: 250, y: 322 };

const P_CODE = BEATS.map((b) => b.p ?? 0);
const SHADOW = BEATS.map((b) => b.shadow ?? 0);
const FORMB = BEATS.map((b) => b.form ?? 0);
const APPLEB = BEATS.map((b) => b.apple ?? 0);

export default function Metaphysics3Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.92, cx: 172, cy: 372 },
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      shadow: L(SHADOW[p], SHADOW[n]),
      form: L(FORMB[p], FORMB[n]),
      apple: L(APPLEB[p], APPLEB[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const sh1 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.5 + 0.5 * Math.abs(Math.sin(SCENE.value.t * 3.1))) }));
  const sh2 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.5 + 0.5 * Math.abs(Math.sin(SCENE.value.t * 2.3 + 1))) }));
  const formCore = useAnimatedStyle(() => {
    const pulse = 0.85 + 0.15 * Math.sin(SCENE.value.t * 2.2);
    return { opacity: 0.2 + 0.8 * SCENE.value.form, transform: [{ scale: (0.6 + 0.4 * SCENE.value.form) * pulse }] };
  });
  const formHalo = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 1.9);
    return { opacity: SCENE.value.form * 0.5 * pulse, transform: [{ scale: 1 + 0.2 * pulse }] };
  });
  const appleStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.apple,
    // a real thing: never quite steady — it breathes and lists
    transform: [{ scaleX: 1 + 0.09 * Math.sin(SCENE.value.t * 2.6) }, { scaleY: 1 + 0.09 * Math.sin(SCENE.value.t * 2.6 + 1.6) }, { rotate: `${Math.sin(SCENE.value.t * 1.4) * 5}deg` }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the cave wall + its flickering shadows */}
        <View style={styles.wall} />
        <Animated.View style={[styles.shadow, { top: 356 }, sh1]} />
        <Animated.View style={[styles.shadow, { top: 404, width: 30, height: 34 }, sh2]} />

        {/* the perfect Form, overhead */}
        <Animated.View style={[styles.formHalo, { left: FORM.x - 26, top: FORM.y - 26 }, formHalo]} />
        <Animated.View style={[styles.formCore, { left: FORM.x - 15, top: FORM.y - 15 }, formCore]} />

        {/* a real apple — a deficient, changing copy */}
        <Animated.View style={[styles.apple, { left: APPLE.x - 13, top: APPLE.y - 13 }, appleStyle]}>
          <View style={styles.stem} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: { position: 'absolute', left: WALL_X, top: 300, width: 6, height: 200, backgroundColor: INK, borderRadius: 2 },
  shadow: { position: 'absolute', left: WALL_X + 12, width: 34, height: 40, borderRadius: 8, backgroundColor: SOFT },
  formCore: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: INK },
  formHalo: { position: 'absolute', width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: INK },
  apple: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center' },
  stem: { width: 2.5, height: 7, backgroundColor: INK, marginTop: -5 },
});

export function Metaphysics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics3Scene} />;
}
