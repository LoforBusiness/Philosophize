import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aesthetics2Script';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// An artist who relives a feeling and a viewer who catches it — a feeling-pulse
// crosses the gap between them; the viewer's chest glows when it lands.

const ARTIST_X = 112;
const VIEWER_X = 292;
const CHEST_Y = GROUND - 96;

const A_CODE = BEATS.map((b) => b.a ?? 0);
const V_CODE = BEATS.map((b) => b.v ?? 0);
const WAVE = BEATS.map((b) => (b.wave ? 1 : 0));
const FELT = BEATS.map((b) => (b.felt ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.08, cx: 200, cy: 430, tr: 0.85 }));

export default function Aesthetics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const artistS = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const viewerS = mixStance(emoteHold(V_CODE[p], t), emoteLive(V_CODE[n], t, bt.value), tr);

    // The feeling-pulse crosses from artist to viewer over the first ~1.4s of a
    // transmission beat, brightest mid-flight.
    const cross = clamp01(bt.value / 1.4);
    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      artist: pose(artistS, ARTIST_X, GROUND, K_FIG, 1, 1),
      viewer: pose(viewerS, VIEWER_X, GROUND, K_FIG, -1, 1),
      waveOn: WAVE[n],
      waveX: lerp(ARTIST_X + 26, VIEWER_X - 26, ease01(cross)),
      waveVis: WAVE[n] * Math.sin(Math.PI * cross),
      felt: L(FELT[p], FELT[n]),
      t,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.artist);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.viewer);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  const pulse = useAnimatedStyle(() => ({
    opacity: SCENE.value.waveVis,
    transform: [{ translateX: SCENE.value.waveX - 8 }, { translateY: CHEST_Y - 8 }, { scale: 0.7 + 0.6 * SCENE.value.waveVis }],
  }));
  const felt = useAnimatedStyle(() => {
    const p = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: SCENE.value.felt * p, transform: [{ scale: 0.9 + 0.15 * p }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        {/* easel + canvas beside the artist */}
        <View style={styles.easelLegL} />
        <View style={styles.easelLegR} />
        <View style={styles.canvas}><View style={styles.brush} /></View>

        {/* the viewer's chest glows when the feeling lands */}
        <Animated.View style={[styles.felt, felt]} />

        <Stickman D={DA} k={K_FIG} />
        <Stickman D={DV} k={K_FIG} />

        {/* the feeling crossing the gap */}
        <Animated.View style={[styles.pulse, pulse]} pointerEvents="none" />
      </Animated.View>
    </Animated.View>
  );
}

const EASEL_X = 60;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  easelLegL: { position: 'absolute', left: EASEL_X - 16, top: GROUND - 52, width: 2, height: 52, backgroundColor: SOFT, transform: [{ rotate: '10deg' }] },
  easelLegR: { position: 'absolute', left: EASEL_X + 16, top: GROUND - 52, width: 2, height: 52, backgroundColor: SOFT, transform: [{ rotate: '-10deg' }] },
  canvas: {
    position: 'absolute', left: EASEL_X - 20, top: GROUND - 88, width: 40, height: 46,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  brush: { position: 'absolute', left: 9, top: 16, width: 22, height: 3, backgroundColor: SOFT, borderRadius: 2, transform: [{ rotate: '-18deg' }] },
  felt: { position: 'absolute', left: VIEWER_X - 22, top: CHEST_Y - 22, width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: INK },
  pulse: { position: 'absolute', left: 0, top: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: INK },
});

export function Aesthetics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics2Scene} />;
}
