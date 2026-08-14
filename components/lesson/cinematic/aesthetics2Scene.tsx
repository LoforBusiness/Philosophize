import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aesthetics2Script';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THE INFECTION CHAIN.
//
// Tolstoy's claim is that the SAME feeling arrives at the other end — so the stage
// argues it with a chart. One nine-bar shape (read it as a feeling's profile) is
// drawn three times: vague and grey behind a DASHED frame in the artist's panel,
// sharpened to ink behind a solid frame in the work (that is Collingwood's
// clarifying), and identical again in the viewer's. Three panels, two arrows, the
// same silhouette — the transfer is visible rather than merely asserted.
//
// Once the chain completes, a dashed REFERENCE LINE ties the three peaks together
// — the standard chart annotation for "these reach the same level" — and the
// eyebrow performs the lesson's word animation: it opens as THE INFECTION CHAIN
// and cross-fades to THE SAME FEELING ARRIVES, so the chart states the finding
// itself rather than waiting for the narration to assert it.
//
// Below, the artist, a proper easel carrying that same shape in miniature, and the
// viewer. The feeling crosses as a travelling wave of three arcs, over the top of
// the canvas so it never disappears behind it, and the viewer's chest ring lights
// when it lands.
//
// Composition rule: the chart stops at y 330 and the figures' crowns reach ~352 at
// their highest (the beat-4 shrug), so nothing overlaps. The canvas sits in the gap
// between the two figures (x 168–236) — the artist's widest reach is x 165 and the
// viewer's is x 239. The old static camera transform is gone; the band scales now.
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

// The tallest bar (index 5) is the feeling's peak. A dashed rule laid across all
// three peaks is the chart annotation that says "these reach the same level" —
// which is exactly Tolstoy's claim, drawn instead of asserted.
const PEAK_I = 5;
const TIE_Y = 224;                              // 4 units above the peak tips (228)
const PEAK_CX = PANEL_X.map((x) => x + BAR_PAD + PEAK_I * (BAR_W + BAR_GAP) + BAR_W / 2);
const TIE_X = Array.from({ length: 17 }, (_, k) => 79 + k * 16);

const CANVAS_L = 168;
const CANVAS_T = 396;
const CANVAS_W = 68;
const CANVAS_H = 76;
const MINI_BASE = CANVAS_T + CANVAS_H - 9;      // y = 463

// Studio floorboards, so the ground is a floor rather than one bare rule.
const FLOOR = [52, 104, 156, 208, 260, 312, 364];

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 112 and 292, so the track is the point BETWEEN them (202) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 202);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics2'));

export default function Aesthetics2Scene({ clock, bt, bi }: SceneApi) {
  const heldArtistS = useHeld();
  const heldViewerS = useHeld();
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const artistS = keepHeld(heldArtistS, mixStance(carryFrom(heldArtistS, n, emoteHold(A_CODE[p], t)), emoteLive(A_CODE[n], t, bt.value), tr));
    const viewerS = keepHeld(heldViewerS, mixStance(carryFrom(heldViewerS, n, emoteHold(V_CODE[p], t)), emoteLive(V_CODE[n], t, bt.value), tr));

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
  // WORD ANIMATION. The eyebrow states the setup, then states the finding — both
  // at the same spot, so the swap costs no vertical room. Driven by `chain`, which
  // only ever advances, so it can never flip back on a later beat.
  const eyeAsk = useAnimatedStyle(() => ({ opacity: 1 - clamp01(SCENE.value.chain - 2) }));
  const eyeAns = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.chain - 2) }));
  // The peak-alignment rule appears only once all three panels carry the profile.
  const tie = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.chain - 2) }));

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the chain of panels ───────────────────────────────────────────── */}
      <Animated.Text style={[styles.eyebrow, eyeAsk]}>THE INFECTION CHAIN</Animated.Text>
      <Animated.Text style={[styles.eyebrow, eyeAns]}>THE SAME FEELING ARRIVES</Animated.Text>

      <View style={[styles.arrowBar, { left: 127 }]} />
      <View style={[styles.arrowHead, { left: 137 }]} />
      <View style={[styles.arrowBar, { left: 255 }]} />
      <View style={[styles.arrowHead, { left: 265 }]} />

      {PANEL_X.map((x, j) => <Panel key={x} S={SCENE} j={j} x={x} />)}

      {/* the reference line: one level, three peaks — the transfer, measured */}
      <Animated.View style={[StyleSheet.absoluteFill, tie]} pointerEvents="none">
        {TIE_X.map((x) => <View key={x} style={[styles.tieDash, { left: x }]} />)}
        {PEAK_CX.map((x) => <View key={x} style={[styles.peakDot, { left: x - 4.5 }]} />)}
      </Animated.View>

      {/* ── the studio floor: artist, easel, viewer ───────────────────────── */}
      <View style={styles.ground} />
      {FLOOR.map((x) => <View key={x} style={[styles.floorTick, { left: x }]} />)}

      <View style={styles.easelBrace} />
      <View style={styles.easelLegL} />
      <View style={styles.easelLegR} />
      <View style={styles.easelTray} />
      <View style={styles.canvas} />
      <View style={styles.canvasMat} />
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

/**
 * One link of the chain: a framed panel holding the feeling's profile. The FIRST
 * panel — the feeling as the artist has it, before the work clarifies it — is
 * framed with a dashed rule and grey bars; the two after it are solid ink. That
 * is Collingwood's point drawn rather than stated: the silhouette is identical
 * from the start, but only the work makes it definite.
 */
function Panel({ S, j, x }: { S: SharedValue<any>; j: number; x: number }) {
  const inked = useAnimatedStyle(() => ({ opacity: clamp01(S.value.chain - j) }));
  return (
    <>
      <View style={[styles.panel, { left: x }]} />
      <Animated.View style={[j === 0 ? styles.panelInkVague : styles.panelInk, { left: x }, inked]} />
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
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  panel: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 3, backgroundColor: PAPER,
  },
  panelInk: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3,
  },
  // The artist's own panel: the feeling is there, but not yet made definite. The
  // frame is SOFT as well as dashed — Android sometimes renders a dashed border
  // with a radius as solid, and the weight difference has to survive that.
  panelInkVague: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
  },
  panelBase: {
    position: 'absolute', top: BASE_Y, width: PANEL_W - BAR_PAD * 2, height: 1.5, backgroundColor: RULE,
  },
  panelLabel: {
    position: 'absolute', top: 316, width: PANEL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 0.4, color: SOFT,
    includeFontPadding: false,
  },
  barInk: { position: 'absolute', width: BAR_W, backgroundColor: INK, transformOrigin: '50% 100%' },
  barSoft: { position: 'absolute', width: BAR_W, backgroundColor: SOFT, transformOrigin: '50% 100%' },

  // the peak-alignment annotation
  tieDash: { position: 'absolute', top: TIE_Y - 0.75, width: 9, height: 1.5, backgroundColor: SOFT },
  peakDot: {
    position: 'absolute', top: TIE_Y - 4.5, width: 9, height: 9, borderRadius: 4.5,
    borderWidth: 1.5, borderColor: SOFT, backgroundColor: PAPER,
  },

  arrowBar: { position: 'absolute', top: 256, width: 10, height: 3, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', top: 250, width: 0, height: 0,
    borderTopWidth: 7.5, borderBottomWidth: 7.5, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  // ── the studio floor ──────────────────────────────────────────────────────
  floorTick: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },

  // ── the easel and its canvas ──────────────────────────────────────────────
  canvas: {
    position: 'absolute', left: CANVAS_L, top: CANVAS_T, width: CANVAS_W, height: CANVAS_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  // the stretched face inside the frame, so the canvas reads as a made object
  canvasMat: {
    position: 'absolute', left: CANVAS_L + 3, top: CANVAS_T + 3, width: CANVAS_W - 6, height: CANVAS_H - 6,
    borderWidth: 1, borderColor: RULE,
  },
  canvasBase: { position: 'absolute', left: CANVAS_L + 4, top: MINI_BASE, width: 60, height: 1.2, backgroundColor: RULE },
  miniBar: { position: 'absolute', width: 4, backgroundColor: INK, transformOrigin: '50% 100%' },
  easelTray: { position: 'absolute', left: 176, top: CANVAS_T + CANVAS_H, width: 52, height: 3.5, borderRadius: 2, backgroundColor: INK },
  // The legs SPLAY outward and stop on the ground line. They used to converge —
  // rotate is clockwise-positive, so a +8° left leg swings its foot inward — which
  // left the easel standing on a point.
  easelLegL: {
    position: 'absolute', left: 182, top: CANVAS_T + CANVAS_H + 2, width: 2.5, height: 26,
    backgroundColor: SOFT, transformOrigin: '50% 0%', transform: [{ rotate: '-9deg' }],
  },
  easelLegR: {
    position: 'absolute', left: 222, top: CANVAS_T + CANVAS_H + 2, width: 2.5, height: 26,
    backgroundColor: SOFT, transformOrigin: '50% 0%', transform: [{ rotate: '9deg' }],
  },
  easelBrace: { position: 'absolute', left: 181, top: 489, width: 44, height: 2, backgroundColor: SOFT },

  feltRing: { position: 'absolute', left: VIEWER_X, top: CHEST_Y },
  feltOuter: { position: 'absolute', left: -24, top: -24, width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: INK },
  feltInner: { position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 14, borderWidth: 1.2, borderColor: SOFT },

  arc: { position: 'absolute', borderWidth: 2.5, borderColor: 'transparent', borderRightColor: INK },
});

// BAND. Measured against every beat, not just the first.
//   top    · the eyebrow at 186. The peak-alignment rule sits at 224 and the panel
//            frames at 206, so nothing drawn ever rises above the eyebrow; 180
//            leaves 6 units of air.
//   bottom · the ankle JOINT is a circle of radius STR.limb/2 × K_FIG = 7.4 drawn
//            centred on GROUND, so a planted foot inks to 507.4 — lower than the
//            floorboard ticks (507), the easel's feet (~500) or the ground rule
//            (501.5). 512 clears the true lowest pixel by 4.6.
// Figures: crown = GROUND − FIG_H × K_FIG ≈ 361, and the highest lift here is the
// viewer's beat-4 shrug (hold bob +3, live accent +2.5, breath +1.1 → crown ~352),
// still 23 units below the panel labels at 330. The travelling wave rides y 372
// with a 19-unit radius at full scale, so it stays inside 353…391 — clear of the
// labels above and of the canvas top at 396 below.
export function Aesthetics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics2Scene} band={[180, 512]} camera={CAM} />;
}
