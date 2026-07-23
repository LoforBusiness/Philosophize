import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './metaphysics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure reaches into a dark void; each reach pops a "something" token into the
// gap between the void and the figure. The void breathes, unsettling. Void left,
// tokens centre, figure right.

const FIG_X = 214;
const VOID = { x: 108, y: 384 };
const TOKENS = [{ x: 150, y: 350 }, { x: 168, y: 392 }, { x: 138, y: 418 }];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const TOK = BEATS.map((b) => b.tokens ?? 0);

export default function Metaphysics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 1.0, cx: 166, cy: 396 },
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      tokens: L(TOK[p], TOK[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const voidStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.06 * Math.sin(SCENE.value.t * 1.8) }] }));
  const rimStyle = useAnimatedStyle(() => ({ opacity: 0.4 + 0.3 * Math.sin(SCENE.value.t * 1.8), transform: [{ scale: 1.1 + 0.08 * Math.sin(SCENE.value.t * 1.8) }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the void — an absence that will not stay empty */}
        <Animated.View style={[styles.voidRim, { left: VOID.x - 30, top: VOID.y - 30 }, rimStyle]} />
        <Animated.View style={[styles.voidCore, { left: VOID.x - 24, top: VOID.y - 24 }, voidStyle]} />

        {/* the "somethings" that keep popping out */}
        {TOKENS.map((tk, k) => <Token key={k} S={SCENE} tk={tk} k={k} />)}

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Token({ S, tk, k }: { S: SharedValue<any>; tk: { x: number; y: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.tokens - k);
    const bob = Math.sin(S.value.t * 2.2 + k * 1.7) * 3;
    return { opacity: on, transform: [{ translateY: bob }, { scale: 0.4 + 0.6 * on }] };
  });
  return (
    <Animated.View style={[styles.token, { left: tk.x - 9, top: tk.y - 9 }, st]}>
      <View style={styles.tokenDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  voidCore: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: INK },
  voidRim: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: SOFT },
  token: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tokenDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
});

export function Metaphysics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics4Scene} />;
}
