import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './metaphysics5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A lone figure under a vast starfield with a great "?" hanging in the sky; then the
// figure itself glows (Dasein). Stars fill the top, figure at the bottom-centre.

const FIG_X = 200;
const STARS = Array.from({ length: 40 }, (_, k) => ({
  x: 40 + (k * 137) % 320, y: 210 + (k * 89) % 210, r: 1 + (k % 3), ph: (k * 0.13) % 1,
}));

const P_CODE = BEATS.map((b) => b.p ?? 0);
const STARB = BEATS.map((b) => b.stars ?? 0);
const QB = BEATS.map((b) => b.q ?? 0);
const DAS = BEATS.map((b) => b.dasein ?? 0);

export default function Metaphysics5Scene({ clock, bt, bi, i }: SceneApi) {
  const isSummary = !!BEATS[i].summary;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.94, cx: 200, cy: 372 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      stars: L(STARB[p], STARB[n]),
      q: L(QB[p], QB[n]),
      dasein: L(DAS[p], DAS[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const qStyle = useAnimatedStyle(() => {
    const pulse = 0.8 + 0.2 * Math.sin(SCENE.value.t * 2.2);
    return { opacity: SCENE.value.q * pulse, transform: [{ scale: (0.7 + 0.3 * SCENE.value.q) * pulse }] };
  });
  const dasein = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: SCENE.value.dasein * pulse, transform: [{ scale: 0.9 + 0.15 * pulse }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        {STARS.map((s, k) => <Star key={k} S={SCENE} s={s} k={k} />)}

        {/* the great question hanging in the void */}
        <Animated.View style={[styles.qWrap, qStyle]} pointerEvents="none"><Text style={styles.qGlyph}>?</Text></Animated.View>

        <View style={styles.ground} />

        {/* Dasein — the figure glows, existence questioning itself */}
        <Animated.View style={[styles.aura, dasein]} pointerEvents="none" />
        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Star({ S, s, k }: { S: SharedValue<any>; s: { x: number; y: number; r: number; ph: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(S.value.t * (1.4 + k * 0.11) + k));
    return { opacity: S.value.stars * tw };
  });
  return <Animated.View style={[styles.star, { left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: s.r }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  star: { position: 'absolute', backgroundColor: INK },
  qWrap: { position: 'absolute', left: 0, right: 0, top: 250, alignItems: 'center' },
  qGlyph: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 84, color: INK },
  aura: { position: 'absolute', left: FIG_X - 34, top: GROUND - 150, width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: INK },
});

export function Metaphysics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics5Scene} />;
}
