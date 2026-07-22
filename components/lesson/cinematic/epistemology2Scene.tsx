import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './epistemology2Script';
import {
  clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A doubter, a horned demon faking reality, floating beliefs that fade under doubt,
// and the one belief that will not fade — the glowing self, "I exist".

const DOUBT_X = 272;
const DEMON_X = 96;

const D_CODE = BEATS.map((b) => b.d ?? 0);
const M_CODE = BEATS.map((b) => (b.m ?? -1));
const M_ON = BEATS.map((b) => ((b.m ?? -1) >= 0 ? 1 : 0));
const DOUBT = BEATS.map((b) => b.doubt ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));

// Beliefs the demon can counterfeit — float around the doubter, fade as doubt rises.
const TOKENS = [
  { x: 214, y: 300, th: 0.28 }, { x: 250, y: 276, th: 0.44 },
  { x: 292, y: 292, th: 0.58 }, { x: 322, y: 328, th: 0.74 },
  { x: 236, y: 344, th: 0.88 },
];

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.08, cx: 190, cy: 400, tr: 0.85 }));

export default function Epistemology2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const doubterS = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    const mOn = L(M_ON[p], M_ON[n]);
    const demonS = mixStance(emoteHold(M_CODE[p] < 0 ? 0 : M_CODE[p], t), emoteLive(M_CODE[n] < 0 ? 0 : M_CODE[n], t, bt.value), tr);

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      doubter: pose(doubterS, DOUBT_X, GROUND, K_FIG, -1, 1),
      demon: pose(demonS, DEMON_X, GROUND, K_FIG, 1, mOn),
      demonOn: mOn,
      doubt: L(DOUBT[p], DOUBT[n]),
      glow: L(GLOW[p], GLOW[n]),
      t,
    };
  });

  const DD = useDerivedValue<Bundle>(() => SCENE.value.doubter);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.demon);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const horns = useAnimatedStyle(() => {
    const h = DM.value.head;
    return { opacity: SCENE.value.demonOn, transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY - 24 }] };
  });
  const glow = useAnimatedStyle(() => {
    const g = SCENE.value.glow;
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.4);
    return { opacity: g * pulse, transform: [{ scale: 0.9 + 0.15 * pulse }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {TOKENS.map((tk, k) => <Token key={k} S={SCENE} tk={tk} />)}
        {/* the surviving self */}
        <Animated.View style={[styles.glow, glow]} />
        <Stickman D={DM} k={K_FIG} />
        <Stickman D={DD} k={K_FIG} />
        {/* the demon's horns, following its head */}
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, horns]} pointerEvents="none">
          <View style={[styles.horn, { left: -14, transform: [{ rotate: '-24deg' }] }]} />
          <View style={[styles.horn, { left: 8, transform: [{ rotate: '24deg' }] }]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function Token({ S, tk }: { S: SharedValue<any>; tk: { x: number; y: number; th: number } }) {
  const st = useAnimatedStyle(() => {
    const gone = clamp01((S.value.doubt - tk.th) / 0.14);
    const bob = Math.sin(S.value.t * 1.4 + tk.x) * 3;
    return { opacity: (1 - gone) * 0.9, transform: [{ translateY: bob }, { scale: 1 - 0.3 * gone }, { rotate: `${gone * 40}deg` }] };
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
  token: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tokenDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: SOFT, backgroundColor: 'transparent' },
  glow: { position: 'absolute', left: DOUBT_X - 30, top: GROUND - 128, width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: INK },
  horn: { position: 'absolute', top: -8, width: 0, height: 0, borderLeftWidth: 3.5, borderRightWidth: 3.5, borderBottomWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK },
});

export function Epistemology2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology2Scene} />;
}
