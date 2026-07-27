import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aesthetics2Script';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// THE INFECTION CHAIN.
//
// Tolstoy's claim is that the SAME feeling arrives at the other end — so the stage
// argues it with a chart. One nine-bar shape (read it as a feeling's profile) is
// drawn three times: vague and grey in the artist's panel, sharpened to ink in the
// work (that is Collingwood's clarifying), and identical again in the viewer's.
// Three panels, two arrows, the same silhouette — the transfer is visible rather
// than merely asserted.
//
// Below, the artist, a proper easel carrying that same shape in miniature, and the
// viewer. The feeling crosses as a travelling wave of three arcs, over the top of
// the canvas so it never disappears behind it, and the viewer's chest ring lights
// when it lands.
//
// Composition rule: the chart stops at y 330 and the figures' crowns reach ~352 at
// their highest (the beat-4 shrug), so nothing overlaps. The canvas sits in the gap
// between the two figures (x 168–236) — the artist's widest reach is x 157 and the
// viewer's is x 247. The old static camera transform is gone; the band scales now.
// ─────────────────────────────────────────────────────────────────────────────

const ARTIST_X = 112;
const VIEWER_X = 292;
const CHEST_Y = GROUND - 96;
const WAVE_Y = 372;

const A_CODE = BEATS.map((b) => b.a ?? 0);
const V_CODE = BEATS.map((b) => b.v ?? 0);
const WAVE = BEATS.map((b) => (b.wave ? 1 : 0));
const FELT = BEATS.map((b) => (b.felt ? 1 : 0));
const CHAIN = BEATS.map((b) => b.chain ?? 0);

const PANEL_T = 206;
const PANEL_H = 106;
const PANEL_W = 108;
const PANEL_X = [18, 146, 274];
const BASE_Y = PANEL_T + PANEL_H - 10;          // the bars' baseline, y = 302
const LABELS = ['1 ARTIST FEELS', '2 WORK CARRIES', '3 YOU FEEL IT'];

// One feeling, expressed as a profile. Every panel draws this same shape — that
// sameness IS the lesson.
const SHAPE = [16, 30, 48, 66, 40, 74, 26, 54, 20];
const BAR_W = 6;
const BAR_GAP = 5;
const BAR_PAD = (PANEL_W - (SHAPE.length * BAR_W + (SHAPE.length - 1) * BAR_GAP)) / 2;

const CANVAS_L = 168;
const CANVAS_T = 396;
const CANVAS_W = 68;
const CANVAS_H = 76;
const MINI_BASE = CANVAS_T + CANVAS_H - 9;      // y = 463

export default function Aesthetics2Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const artistS = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const viewerS = mixStance(emoteHold(V_CODE[p], t), emoteLive(V_CODE[n], t, bt.value), tr);

    // The feeling-pulse crosses from artist to viewer over the first ~1.4s of a
    // transmission beat, brightest mid-flight.
    const cross = clamp01(bt.value / 1.4);
    return {
      artist: pose(artistS, ARTIST_X, GROUND, K_FIG, 1, 1),
      viewer: pose(viewerS, VIEWER_X, GROUND, K_FIG, -1, 1),
      waveX: lerp(ARTIST_X + 46, VIEWER_X - 46, ease01(cross)),
      waveVis: WAVE[n] * Math.sin(Math.PI * cross),
      felt: lerp(FELT[p], FELT[n], tr),
      // A single continuous 1→3 value: panel j fills as it crosses j + 1.
      chain: lerp(CHAIN[p], CHAIN[n], tr),
      t,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.artist);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.viewer);

  const pulse = useAnimatedStyle(() => ({
    opacity: SCENE.value.waveVis,
    transform: [
      { translateX: SCENE.value.waveX }, { translateY: WAVE_Y },
      { scale: 0.75 + 0.35 * SCENE.value.waveVis },
    ],
  }));
  const felt = useAnimatedStyle(() => {
    const p = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: SCENE.value.felt * p, transform: [{ scale: 0.92 + 0.12 * p }] };
  });

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the chain of panels ───────────────────────────────────────────── */}
      <Text style={styles.eyebrow}>THE INFECTION CHAIN</Text>

      <View style={[styles.arrowBar, { left: 127 }]} />
      <View style={[styles.arrowHead, { left: 138 }]} />
      <View style={[styles.arrowBar, { left: 255 }]} />
      <View style={[styles.arrowHead, { left: 266 }]} />

      {PANEL_X.map((x, j) => <Panel key={x} S={SCENE} j={j} x={x} />)}

      {/* ── the studio floor: artist, easel, viewer ───────────────────────── */}
      <View style={styles.ground} />

      <View style={styles.easelTray} />
      <View style={styles.easelLegL} />
      <View style={styles.easelLegR} />
      <View style={styles.canvas} />
      <View style={styles.canvasBase} />
      {SHAPE.map((h, k) => <MiniBar key={k} S={SCENE} k={k} h={h} />)}

      <Animated.View style={[styles.feltRing, felt]}>
        <View style={styles.feltOuter} />
        <View style={styles.feltInner} />
      </Animated.View>

      <Stickman D={DA} k={K_FIG} />
      <Stickman D={DV} k={K_FIG} />

      {/* the feeling crossing the gap — three arcs riding one anchor */}
      <Animated.View style={[styles.anchor, pulse]}>
        <View style={[styles.arc, { left: -9, top: -9, width: 18, height: 18, borderRadius: 9 }]} />
        <View style={[styles.arc, { left: -13, top: -13, width: 26, height: 26, borderRadius: 13, opacity: 0.6 }]} />
        <View style={[styles.arc, { left: -17, top: -17, width: 34, height: 34, borderRadius: 17, opacity: 0.3 }]} />
      </Animated.View>
    </Animated.View>
  );
}

/** One link of the chain: a framed panel holding the feeling's profile. */
function Panel({ S, j, x }: { S: SharedValue<any>; j: number; x: number }) {
  const inked = useAnimatedStyle(() => ({ opacity: clamp01(S.value.chain - j) }));
  return (
    <>
      <View style={[styles.panel, { left: x }]} />
      <Animated.View style={[styles.panelInk, { left: x }, inked]} />
      <View style={[styles.panelBase, { left: x + BAR_PAD }]} />
      {SHAPE.map((h, k) => <Bar key={k} S={S} j={j} k={k} h={h} x={x} />)}
      <Text style={[styles.panelLabel, { left: x }]}>{LABELS[j]}</Text>
    </>
  );
}

/** One bar of the profile. Grows from the baseline, staggered left to right. */
function Bar({ S, j, k, h, x }: { S: SharedValue<any>; j: number; k: number; h: number; x: number }) {
  const st = useAnimatedStyle(() => {
    const f = clamp01(S.value.chain - j);
    const grown = ease01(clamp01((f - k * 0.05) * 2.4));
    // A slow, non-uniform breath so a filled panel never freezes into a diagram.
    const live = 1 + 0.035 * Math.sin(S.value.t * 1.7 + k * 0.7 + j);
    return { opacity: grown, transform: [{ scaleY: grown * live }] };
  });
  return (
    <Animated.View
      style={[
        j === 0 ? styles.barSoft : styles.barInk,
        { left: x + BAR_PAD + k * (BAR_W + BAR_GAP), top: BASE_Y - h, height: h },
        st,
      ]}
    />
  );
}

/** The same profile again, small, on the canvas the artist is working at. */
function MiniBar({ S, k, h }: { S: SharedValue<any>; k: number; h: number }) {
  const mh = h * 0.62;
  const st = useAnimatedStyle(() => {
    const f = clamp01(S.value.chain - 1);
    const grown = ease01(clamp01((f - k * 0.05) * 2.4));
    return { opacity: grown, transform: [{ scaleY: grown }] };
  });
  return (
    <Animated.View
      style={[styles.miniBar, { left: CANVAS_L + 4 + k * 7, top: MINI_BASE - mh, height: mh }, st]}
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 34, right: 30, top: GROUND, height: 1.5, backgroundColor: RULE },
  anchor: { position: 'absolute', left: 0, top: 0 },

  eyebrow: {
    position: 'absolute', left: 0, top: 186, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.6, color: SOFT,
  },

  panel: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 3, backgroundColor: PAPER,
  },
  panelInk: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3,
  },
  panelBase: {
    position: 'absolute', top: BASE_Y, width: PANEL_W - BAR_PAD * 2, height: 1.5, backgroundColor: RULE,
  },
  panelLabel: {
    position: 'absolute', top: 316, width: PANEL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 13, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
  barInk: { position: 'absolute', width: BAR_W, backgroundColor: INK, transformOrigin: '50% 100%' },
  barSoft: { position: 'absolute', width: BAR_W, backgroundColor: SOFT, transformOrigin: '50% 100%' },

  arrowBar: { position: 'absolute', top: 257, width: 11, height: 2, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', top: 252, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  // ── the easel and its canvas ──────────────────────────────────────────────
  canvas: {
    position: 'absolute', left: CANVAS_L, top: CANVAS_T, width: CANVAS_W, height: CANVAS_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  canvasBase: { position: 'absolute', left: CANVAS_L + 4, top: MINI_BASE, width: 60, height: 1.2, backgroundColor: RULE },
  miniBar: { position: 'absolute', width: 4, backgroundColor: INK, transformOrigin: '50% 100%' },
  easelTray: { position: 'absolute', left: 176, top: CANVAS_T + CANVAS_H, width: 52, height: 3.5, borderRadius: 2, backgroundColor: INK },
  easelLegL: {
    position: 'absolute', left: 182, top: CANVAS_T + CANVAS_H + 2, width: 2.5, height: 30,
    backgroundColor: SOFT, transformOrigin: '50% 0%', transform: [{ rotate: '8deg' }],
  },
  easelLegR: {
    position: 'absolute', left: 222, top: CANVAS_T + CANVAS_H + 2, width: 2.5, height: 30,
    backgroundColor: SOFT, transformOrigin: '50% 0%', transform: [{ rotate: '-8deg' }],
  },

  feltRing: { position: 'absolute', left: VIEWER_X, top: CHEST_Y },
  feltOuter: { position: 'absolute', left: -24, top: -24, width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: INK },
  feltInner: { position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 14, borderWidth: 1.2, borderColor: SOFT },

  arc: { position: 'absolute', borderWidth: 2.5, borderColor: 'transparent', borderRightColor: INK },
});

// BAND. Topmost ink is the eyebrow at y 186; the lowest is the easel's legs, which
// end at about 504. The chart stops at 330, the figures' crowns reach ~352, and the
// travelling wave rides y 372 with a 17-unit radius, so nothing is clipped.
export function Aesthetics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics2Scene} band={[180, 512]} />;
}
