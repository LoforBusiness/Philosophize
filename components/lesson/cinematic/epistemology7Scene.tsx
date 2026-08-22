import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology7Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE CONFIDENCE CHART. Hume's problem drawn as the picture it actually is: a bar
// chart of the chicken's confidence climbing one fed morning at a time, a trend line
// ruled straight through the tops of the bars — and then the vertical rule marked
// TOMORROW, past which there is no bar at all. Only a dashed box with a "?" sitting
// exactly where the projection says the next bar "should" be.
//
// COMPOSITION / OCCLUSION —
//   · the farmer stands at x = 58 and never moves. His widest gesture (13,
//     point-forward) reaches x ≈ 113; his head circle spans x ≈ 34…88; his crown
//     rides to y ≈ 358 and his ankles to y ≈ 508.
//   · the hen occupies x 120…201, y 419…500 — clear of the farmer's reach by 7 and
//     entirely BELOW the chart baseline (418).
//   · the chart owns x ≥ 156 above y = 440, so nothing it draws can ever touch the
//     figure or the hen.
//
// GEOMETRY — bars are pitched 42 apart and grow 28 taller each morning, so the four
// tops are exactly collinear: the trend line is one straight View and its dashed
// projection continues at the identical angle into the unknown column.

const FIG_X = 58;

const BASE = 418;                       // chart baseline
const AX_L = 156;                       // y-axis
const BAR_W = 30;
const BAR_X = [168, 210, 252, 294];     // pitch 42
const BAR_H = [34, 62, 90, 118];        // +28 per morning
const TIP = BAR_H.map((h) => BASE - h); // 384 · 356 · 328 · 300
const MID = BAR_X.map((x) => x + BAR_W / 2); // 183 · 225 · 267 · 309

const DIV_X = 330;                      // the TODAY rule, drawn as a dash stack
const DIV_Y = Array.from({ length: 12 }, (_, k) => 254 + k * 16);   // 254 … 430

const FUT_L = 334;
const FUT_W = 34;
const FUT_H = 146;                      // the height the trend PREDICTS
const FUT_T = BASE - FUT_H;             // 272

// One straight rule through all four bar tops, and its continuation past TODAY.
const TREND_LEN = Math.hypot(MID[3] - MID[0], TIP[3] - TIP[0]);     // 151.4
const PROJ_LEN = Math.hypot(42, 28);                                // 50.5
const TREND_ANG = '-33.69deg';

const HEN_L = 120;
const HEN_T = GROUND - 76;              // 424 — the hen stands on the ground line
const FEED_X = [100, 108, 116];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const DAYS = BEATS.map((b) => b.days ?? 0);
const TWIST = BEATS.map((b) => b.twist ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology7'));

export default function Epistemology7Scene({ clock, bt, bi }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const days = carry(cv, 0, n, DAYS[p], DAYS[n], tr);
    const twist = carry(cv, 1, n, TWIST[p], TWIST[n], tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      days,
      twist,
      // The rule draws itself along with the bars: 1 morning = nothing, 4 = full.
      trend: clamp01((days - 1) / 3),
      peck: Math.max(0, Math.sin(t * 3.2)),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const trendStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.days - 1),
    transform: [{ rotate: TREND_ANG }, { scaleX: SCENE.value.trend }],
  }));
  const projStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.twist,
    transform: [{ rotate: TREND_ANG }, { scaleX: SCENE.value.twist }],
  }));
  const futStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.twist,
    transform: [{ scale: 0.82 + 0.18 * SCENE.value.twist }],
  }));
  const henStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: SCENE.value.peck * 7 }, { scaleX: -1 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the chart frame ──────────────────────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <Text style={styles.axisTitle}>CONFIDENCE</Text>
        <Text style={styles.futTitle}>TOMORROW</Text>
        <View style={styles.axis} />
        <View style={styles.baseline} />
        <Text style={styles.pastTitle}>MORNINGS FED</Text>
        {DIV_Y.map((y) => (
          <View key={y} style={[styles.divDash, { top: y }]} />
        ))}
      </View>

      {/* ── one bar per morning the farmer turned up ─────────────────────────── */}
      {BAR_X.map((_, k) => (
        <Bar key={k} S={SCENE} k={k} />
      ))}

      {/* ── the rule through the tops, and the projection past TODAY ─────────── */}
      <Animated.View style={[styles.trend, trendStyle]} pointerEvents="none" />
      <Animated.View style={[styles.proj, projStyle]} pointerEvents="none" />

      {/* ── the column the projection promises, and never delivers ───────────── */}
      <Animated.View style={[styles.future, futStyle]} pointerEvents="none">
        <Text style={styles.futureQ}>?</Text>
      </Animated.View>

      {/* ── a ✓ badge riding the top of every confirmed morning ──────────────── */}
      {BAR_X.map((_, k) => (
        <Badge key={k} S={SCENE} k={k} />
      ))}

      {/* ── the yard ─────────────────────────────────────────────────────────── */}
      {FEED_X.map((x) => (
        <View key={x} style={[styles.feed, { left: x }]} pointerEvents="none" />
      ))}

      <Animated.View style={[styles.hen, henStyle]} pointerEvents="none">
        <View style={styles.henBody} />
        <View style={styles.henHead} />
        <View style={styles.henComb} />
        <View style={styles.henBeak} />
        <View style={styles.henEye} />
        <View style={[styles.henLeg, { left: 26 }]} />
        <View style={[styles.henLeg, { left: 44 }]} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One morning's bar, growing out of the baseline as the evidence lands. */
function Bar({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.days - k);
    return { opacity: v, transform: [{ scaleY: 0.05 + 0.95 * v }] };
  });
  return (
    <Animated.View
      style={[styles.bar, { left: BAR_X[k], top: TIP[k], height: BAR_H[k] }, st]}
      pointerEvents="none"
    />
  );
}

/** The ✓ that caps a confirmed morning — the data point on the trend line. */
function Badge({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.days - k);
    return { opacity: v, transform: [{ scale: 0.5 + 0.5 * v }] };
  });
  return (
    <Animated.View
      style={[styles.badge, { left: MID[k] - 11, top: TIP[k] - 11 }, st]}
      pointerEvents="none"
    >
      <View style={styles.checkA} />
      <View style={styles.checkB} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for the static chart furniture. Always pointerEvents="none".
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── chart furniture ─────────────────────────────────────────────────────────
  axis: { position: 'absolute', left: AX_L, top: 252, width: 2, height: BASE - 252, backgroundColor: INK },
  baseline: { position: 'absolute', left: AX_L, top: BASE, width: 238, height: 2, backgroundColor: INK },
  axisTitle: {
    position: 'absolute', left: AX_L, top: 234, width: 174,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  // Tracking 0.3, not 1: "TOMORROW" is eight wide capitals (two of them M and W) and
  // at 1 it measured a hair over the 68-unit box, so it wrapped and left the final
  // "W" stranded on a line of its own.
  futTitle: {
    position: 'absolute', left: DIV_X, top: 234, width: 68, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.3, color: SOFT,
    includeFontPadding: false,
  },
  pastTitle: {
    position: 'absolute', left: 168, top: 426, width: 156, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  divDash: { position: 'absolute', left: DIV_X, width: 2, height: 8, backgroundColor: SOFT },

  // ── the data ────────────────────────────────────────────────────────────────
  bar: { position: 'absolute', width: BAR_W, backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%' },
  trend: {
    position: 'absolute', left: MID[0], top: TIP[0] - 1.5, width: TREND_LEN, height: 3,
    backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%',
  },
  proj: {
    position: 'absolute', left: MID[3], top: TIP[3] - 1.25, width: PROJ_LEN, height: 2.5,
    backgroundColor: SOFT, borderRadius: 1.25, transformOrigin: '0% 50%',
  },
  badge: {
    position: 'absolute', width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  checkA: { position: 'absolute', left: 6, top: 11, width: 5, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  checkB: { position: 'absolute', left: 8, top: 9, width: 10, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '-50deg' }] },

  // borderRadius stays 0: Android silently falls back to a SOLID border when a
  // dashed one is rounded, and the whole point of this column is that it is drawn
  // in dashes — the bar that was predicted but never actually observed.
  future: {
    position: 'absolute', left: FUT_L, top: FUT_T, width: FUT_W, height: FUT_H,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  futureQ: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 38, color: INK,
    includeFontPadding: false,
  },

  // ── the yard ────────────────────────────────────────────────────────────────
  feed: { position: 'absolute', top: GROUND - 4, width: 4, height: 4, borderRadius: 2, backgroundColor: SOFT },
  hen: { position: 'absolute', left: HEN_L, top: HEN_T, width: 88, height: 76 },
  henBody: {
    position: 'absolute', left: 7, top: 22, width: 68, height: 44, borderRadius: 25,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER,
  },
  henHead: {
    position: 'absolute', left: 48, top: 2, width: 30, height: 30, borderRadius: 15,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER,
  },
  henComb: { position: 'absolute', left: 58, top: -5, width: 14, height: 10, borderRadius: 5, backgroundColor: INK },
  henBeak: {
    position: 'absolute', left: 76, top: 14, width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  henEye: { position: 'absolute', left: 64, top: 11, width: 5, height: 5, borderRadius: 2.5, backgroundColor: INK },
  henLeg: { position: 'absolute', top: 64, width: 3, height: 12, backgroundColor: INK },
});

// Art runs from the chart titles (y 234) down to the farmer's ankles (y 508). The
// player crops to that slice, so everything renders about twice the size it did when
// the full 560 was letterboxed into the stage.
export function Epistemology7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology7Scene} band={[226, 514]} camera={CAM} />;
}
