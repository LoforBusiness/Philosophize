import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political6Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// Rawls's two principles, drawn as INFORMATION rather than illustration.
//
//   · a ranked ladder up top — 1 LIBERTY, then 2 DIFFERENCE — because the whole
//     lesson (and Q2) turns on the fact that the order is strict;
//   · two bar charts below it, sharing ONE dashed EQUALITY LINE drawn at the height
//     of the equal society's bars. That single line is the instrument the question
//     is answered with: under UNEQUAL, the worst-off (dark) bar pokes ABOVE it, so
//     the gap actually lifts the people at the bottom. Without the line the reader
//     has to eyeball two unrelated charts; with it the answer is legible at a glance
//     but still requires knowing Rawls's criterion, which the prompt states.
//
// ── COMPOSITION / OCCLUSION ────────────────────────────────────────────────────
// The figure is FIXED at x = 46, so its body + arms occupy x ∈ [30, 100] and
// y ∈ [359, 507]. Every chart element lives right of x = 108 and, apart from the
// panels themselves (which stop at y = 470, well right of the figure), above the
// crown. No camera transform, so stage coordinates ARE final coordinates.

const FIG_X = 46;

const CH_L = 108;                 // the chart region: 108 … 396
const CH_W = 288;
const PAN_W = 138;
const PAN_H = 168;
const PAN_T = 302;                // panels: 302 … 470

const PRIN_T = 238;               // the ranked two-principle ladder: 238 … 272
const PRIN_H = 34;
const LEG_T = 280;                // the legend row: 280 … 294
const TAP_T = 476;                // "tap the society…": 476 … 492

const BAR_BASE = 420;             // absolute y the bars stand on
const BAR_W = 26;
const BAR_GAP = 12;
const BAR_X0 = (PAN_W - (BAR_W * 3 + BAR_GAP * 2)) / 2;   // 18
const FOOT_T = 126;               // relative to the panel top → absolute 428
const FOOT_H = 40;

const SOC = {
  equal: { left: CH_L, label: 'ALL EQUAL', bars: [46, 46, 46] },
  lift: { left: CH_L + PAN_W + 12, label: 'UNEQUAL', bars: [64, 80, 96] },
};
const EQ_Y = BAR_BASE - SOC.equal.bars[0];                // 374 — the dashed line
const EQ_DASHES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BARS = BEATS.map((b) => b.bars ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political6'));

export default function Political6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(1);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const prinOn = (cur.prin ?? 0) > 0;
  const prinFade = (cur.prin ?? 0) !== (prev?.prin ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    // The charts grow up out of the axis once, on the opening beat only.
    const intro = n === 0 ? ease01(bt.value / 1.1) : 1;
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      chart: carry(cv, 0, n, BARS[p], BARS[n], tr, intro),
      prinA: prinOn ? (prinFade ? ease01(bt.value / 0.45) : 1) : 0,
      prinB: prinOn ? (prinFade ? ease01((bt.value - 0.32) / 0.45) : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.chart }] }));
  const chartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chart }));
  const prinAStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.prinA,
    transform: [{ translateY: (1 - SCENE.value.prinA) * -8 }],
  }));
  const prinBStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.prinB,
    transform: [{ translateY: (1 - SCENE.value.prinB) * -8 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  const renderPanel = (id: 'equal' | 'lift') => {
    const soc = SOC[id];
    const isAnswer = id === 'lift';              // the only society Rawls permits
    const chosen = picked === id;
    const won = answered && isAnswer;
    const lost = answered && chosen && !isAnswer;
    const inner = (
      <>
        <View style={[styles.frame, won && styles.frameOn, lost && styles.frameOff]} pointerEvents="none" />
        <View style={styles.axis} pointerEvents="none" />
        {soc.bars.map((h, k) => (
          <Animated.View
            key={k}
            style={[
              styles.bar,
              k === 0 && styles.barWorst,
              { left: BAR_X0 + k * (BAR_W + BAR_GAP), top: BAR_BASE - PAN_T - h, height: h },
              barStyle,
            ]}
            pointerEvents="none"
          />
        ))}
        <View style={styles.worstTick} pointerEvents="none" />
        <View style={[styles.foot, won && styles.footOn]} pointerEvents="none">
          <Text style={[styles.footText, won && styles.footTextOn]}>{soc.label}</Text>
        </View>
      </>
    );
    return showPick ? (
      <Target id={id} correct={isAnswer} picked={picked} onPick={onPick}
              key={id} style={[styles.panelHit, { left: soc.left }, lost && styles.faded]} disabled={answered}>
        {inner}
      </Target>
    ) : (
      <View key={id} style={[styles.panelHit, { left: soc.left }]} pointerEvents="none">{inner}</View>
    );
  };

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the two principles, in their strict order ────────────────────────── */}
      <Animated.View style={[styles.chip, styles.chipA, prinAStyle]} pointerEvents="none">
        <Text style={styles.chipHead}>1 · LIBERTY</Text>
        <Text style={styles.chipSub}>SAME FOR EVERYONE</Text>
      </Animated.View>
      <Animated.View style={[styles.arrowWrap, prinBStyle]} pointerEvents="none">
        <Text style={styles.arrow}>→</Text>
      </Animated.View>
      <Animated.View style={[styles.chip, styles.chipB, prinBStyle]} pointerEvents="none">
        <Text style={styles.chipHead}>2 · DIFFERENCE</Text>
        <Text style={styles.chipSub}>ONLY IF IT LIFTS</Text>
      </Animated.View>

      {/* ── legend: what the dark bar and the dashed line mean ───────────────── */}
      <Animated.View style={[styles.legend, chartStyle]} pointerEvents="none">
        <View style={styles.legSwatch} />
        <Text style={styles.legText}>WORST-OFF</Text>
        <View style={styles.legDash} />
        <View style={styles.legDash} />
        <Text style={styles.legText}>EQUALITY LINE</Text>
      </Animated.View>

      {/* ── the two societies ────────────────────────────────────────────────── */}
      {renderPanel('equal')}
      {renderPanel('lift')}

      {/* ── the shared reference level, drawn across BOTH charts ─────────────── */}
      {EQ_DASHES.map((k) => <EqDash key={k} S={SCENE} k={k} />)}

      {showPick ? (
        <View style={styles.tapWrap} pointerEvents="none">
          <Text style={styles.tapLabel}>TAP THE SOCIETY RAWLS ALLOWS</Text>
        </View>
      ) : null}

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One dash of the equality line. They light up left→right as the charts grow. */
function EqDash({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01((S.value.chart - k / 22) * 6) }));
  return <Animated.View style={[styles.eqDash, { left: CH_L + k * 20.6 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 22, top: GROUND, width: 366, height: 1.5, backgroundColor: RULE },

  // ── the ranked principles ───────────────────────────────────────────────────
  chip: {
    position: 'absolute', top: PRIN_T, height: PRIN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipA: { left: CH_L, width: 130 },
  chipB: { left: CH_L + 150, width: 138 },
  chipHead: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  chipSub: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 0.8, color: SOFT, marginTop: 2, includeFontPadding: false },
  arrowWrap: {
    position: 'absolute', left: CH_L + 130, top: PRIN_T, width: 20, height: PRIN_H,
    alignItems: 'center', justifyContent: 'center',
  },
  arrow: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK, includeFontPadding: false },

  // ── legend ──────────────────────────────────────────────────────────────────
  legend: {
    position: 'absolute', left: CH_L, top: LEG_T, width: CH_W, height: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  legSwatch: { width: 11, height: 11, borderRadius: 2, backgroundColor: INK, marginRight: 1 },
  legDash: { width: 9, height: 2.5, borderRadius: 1.25, backgroundColor: INK },
  legText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1, color: SOFT,
    marginRight: 8, includeFontPadding: false,
  },

  // ── a society panel (the tap target: 138 × 168) ─────────────────────────────
  panelHit: { position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H },
  faded: { opacity: 0.45 },
  frame: {
    position: 'absolute', left: 0, top: 0, width: PAN_W, height: PAN_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  frameOn: { borderWidth: 3.5 },
  frameOff: { borderColor: SOFT },
  axis: { position: 'absolute', left: 10, top: BAR_BASE - PAN_T, width: PAN_W - 20, height: 1.5, backgroundColor: RULE },
  bar: { position: 'absolute', width: BAR_W, backgroundColor: SOFT, borderRadius: 2, transformOrigin: '50% 100%' },
  barWorst: { backgroundColor: INK },
  worstTick: {
    position: 'absolute', left: BAR_X0, top: BAR_BASE - PAN_T + 4, width: BAR_W, height: 3,
    borderRadius: 1.5, backgroundColor: INK,
  },
  foot: {
    position: 'absolute', left: 3, top: FOOT_T, width: PAN_W - 6, height: FOOT_H,
    borderTopWidth: 2, borderTopColor: RULE, alignItems: 'center', justifyContent: 'center',
  },
  footOn: { backgroundColor: INK, borderTopColor: INK },
  footText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  footTextOn: { color: PAPER },

  // ── the equality line ───────────────────────────────────────────────────────
  eqDash: { position: 'absolute', top: EQ_Y - 1.25, width: 12, height: 2.5, borderRadius: 1.25, backgroundColor: INK },

  // ── what to tap ─────────────────────────────────────────────────────────────
  tapWrap: { position: 'absolute', left: CH_L, top: TAP_T, width: CH_W, alignItems: 'center' },
  tapLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
});

// Art runs from the principle ladder (238) down to the figure's planted foot dot
// (507); nothing is drawn outside that, so the player crops to it and the whole
// scene renders about twice the size of the letterboxed full-height fit.
export function Political6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political6Scene} band={[232, 514]} camera={CAM} />;
}
