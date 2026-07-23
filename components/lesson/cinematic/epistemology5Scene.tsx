import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './epistemology5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A lone figure gazes up at a star of understanding. The star climbs in brightness,
// then throws off rays as Bacon turns knowing into power. The star and the smaller
// twinkling stars ride high overhead; the figure stands well below them, reaching —
// their hands never reach the star's band, so nothing overlaps.

const FIG_X = 200;
const STAR = { x: 208, y: 246 };
const SKY = [
  { x: 96, y: 214 }, { x: 148, y: 176 }, { x: 268, y: 190 },
  { x: 312, y: 236 }, { x: 132, y: 268 }, { x: 296, y: 292 },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const STARB = BEATS.map((b) => b.star ?? 0);
const POWER = BEATS.map((b) => b.power ?? 0);

export default function Epistemology5Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.92, cx: 200, cy: 372 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      star: L(STARB[p], STARB[n]),
      power: L(POWER[p], POWER[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const coreStyle = useAnimatedStyle(() => {
    const pulse = 0.8 + 0.2 * Math.sin(SCENE.value.t * 3.2);
    return { opacity: 0.25 + 0.75 * SCENE.value.star, transform: [{ scale: (0.7 + 0.3 * SCENE.value.star) * pulse }] };
  });
  const haloStyle = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.4);
    return { opacity: SCENE.value.star * 0.5 * pulse, transform: [{ scale: 1 + 0.25 * pulse }] };
  });
  const raysStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.power, transform: [{ rotate: `${SCENE.value.t * 40}deg` }, { scale: 0.8 + 0.3 * SCENE.value.power }] }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {SKY.map((s, k) => <Twinkle key={k} S={SCENE} s={s} k={k} />)}

        {/* the star of understanding */}
        <Animated.View style={[styles.rays, { left: STAR.x - 34, top: STAR.y - 34 }, raysStyle]}>
          {[0, 45, 90, 135].map((a) => <View key={a} style={[styles.ray, { transform: [{ rotate: `${a}deg` }] }]} />)}
        </Animated.View>
        <Animated.View style={[styles.halo, { left: STAR.x - 22, top: STAR.y - 22 }, haloStyle]} />
        <Animated.View style={[styles.core, { left: STAR.x - 11, top: STAR.y - 11 }, coreStyle]} />

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Twinkle({ S, s, k }: { S: SharedValue<any>; s: { x: number; y: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(S.value.t * (1.6 + k * 0.3) + k));
    return { opacity: (0.35 + 0.5 * S.value.star) * tw };
  });
  return <Animated.View style={[styles.smallStar, { left: s.x - 3, top: s.y - 3 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  smallStar: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  core: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: INK },
  halo: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: INK },
  rays: { position: 'absolute', width: 68, height: 68, alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%' },
  ray: { position: 'absolute', width: 68, height: 2, backgroundColor: INK, borderRadius: 2 },
});

export function Epistemology5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology5Scene} />;
}
