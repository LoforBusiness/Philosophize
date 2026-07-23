import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './epistemology4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Empiricist + slate (left) vs rationalist + glowing mind (right); a Kantian bridge
// arcs between them at the end. The slate + eye sit low-right of the empiricist, the
// glow hugs the rationalist's head, the bridge rides above — the figures' own band
// stays clear.

const E_X = 96;
const R_X = 296;
const SLATE = { x: 156, y: 408 };
const EYE_Y = 352;

const E_CODE = BEATS.map((b) => b.e ?? 0);
const R_CODE = BEATS.map((b) => b.r ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0);
const GLOW = BEATS.map((b) => b.glow ?? 0);
const BRIDGE = BEATS.map((b) => b.bridge ?? 0);
const MARKS = [0.15, 0.38, 0.6, 0.82];         // slate lines appear as fill crosses these

export default function Epistemology4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const s = 1.0, cx = 196, cy = 404;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const e = mixStance(emoteHold(E_CODE[p], t), emoteLive(E_CODE[n], t, bt.value), tr);
    const r = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : s, cx, cy },
      e: pose(e, E_X, GROUND, K_FIG, 1, 1),
      r: pose(r, R_X, GROUND, K_FIG, -1, 1),
      fill: L(FILL[p], FILL[n]),
      glow: L(GLOW[p], GLOW[n]),
      bridge: L(BRIDGE[p], BRIDGE[n]),
      t,
    };
  });

  const DE = useDerivedValue<Bundle>(() => SCENE.value.e);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.r);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const glowStyle = useAnimatedStyle(() => {
    const g = SCENE.value.glow, pulse = 0.75 + 0.25 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: g * pulse, transform: [{ scale: 0.9 + 0.12 * pulse }] };
  });
  const bridgeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bridge }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* Kant's bridge, arcing overhead */}
        <Animated.View style={[styles.bridge, bridgeStyle]} />

        {/* the eye — the senses — over the slate */}
        <View style={[styles.eye, { left: SLATE.x - 15, top: EYE_Y }]}><View style={styles.pupil} /></View>
        {/* sensations raining into the slate */}
        {[0, 1, 2].map((k) => <Drop key={k} S={SCENE} k={k} />)}

        {/* the slate — Locke's white paper */}
        <View style={[styles.slate, { left: SLATE.x - 22, top: SLATE.y - 29 }]}>
          {MARKS.map((th, k) => <Mark key={k} S={SCENE} th={th} idx={k} />)}
        </View>

        {/* the rationalist's innate glow */}
        <Animated.View style={[styles.glow, glowStyle]} />

        <Stickman D={DE} k={K_FIG} />
        <Stickman D={DR} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Drop({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const active = clamp01(S.value.fill * 3);
    const frac = ((S.value.t * 0.7 + k * 0.34) % 1 + 1) % 1;
    const y = lerp(EYE_Y + 12, SLATE.y - 30, frac);
    return { opacity: active * (1 - frac) * 0.9, transform: [{ translateY: y - (EYE_Y + 12) }] };
  });
  return <Animated.View style={[styles.drop, { left: SLATE.x - 3 + (k - 1) * 6, top: EYE_Y + 12 }, st]} />;
}

function Mark({ S, th, idx }: { S: SharedValue<any>; th: number; idx: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01((S.value.fill - th) / 0.12) }));
  return <Animated.View style={[styles.mark, { top: 8 + idx * 11 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  bridge: {
    position: 'absolute', left: E_X + 6, top: 322, width: R_X - E_X - 12, height: 70,
    borderWidth: 2, borderColor: SOFT, borderBottomWidth: 0, borderTopLeftRadius: 80, borderTopRightRadius: 80,
  },
  eye: { position: 'absolute', width: 30, height: 18, borderWidth: 2, borderColor: INK, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER },
  pupil: { width: 7, height: 7, borderRadius: 4, backgroundColor: INK },
  drop: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: INK },
  slate: { position: 'absolute', width: 44, height: 58, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, paddingHorizontal: 7, paddingTop: 2 },
  mark: { position: 'absolute', left: 7, width: 30, height: 2.5, backgroundColor: INK, borderRadius: 2 },
  glow: { position: 'absolute', left: R_X - 26, top: GROUND - 156, width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: INK },
});

export function Epistemology4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology4Scene} />;
}
