import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// Two charts and a figure caught between them.
//
// TOP — THE TRAGIC ARC. A real line graph of pity and fear over the length of a
// play: six segments that draw themselves left to right, a ringed peak marked
// RECOGNITION, and the long fall labelled KATHARSIS. It lives entirely above
// y = 356, so it can never collide with the figure.
//
// BOTTOM-LEFT — THE MODES. A live bar meter of the five Greek modes, each bar
// dancing on its own frequency so the meter reads as music rather than a static
// chart. On the Plato beat the three soft modes sink and are stamped out with an
// ink cross while Dorian and Phrygian keep playing: regulated, not banned.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Figure at x = 344 on GROUND = 500 → spans about x 296–392, y 353–500.
//   · The meter owns x 20–218, the mask x 236–286, the caption x 20–260. Nothing
//     but the ground line is drawn right of x = 372 below y = 356.
//   · Art runs y 227 (the peak label) → 501.5 (the ground line), hence band
//     [220, 508]: a ~2.25× render instead of the letterboxed 1.15×.

const FIG_X = 344;

// ── the tragic arc ────────────────────────────────────────────────────────────
const AX_L = 52;
const AX_R = 372;
const BASE_Y = 336;
const TOP_Y = 250;

// t = how far through the play, v = how high pity and fear have climbed.
const CURVE: [number, number][] = [
  [0, 0.06], [0.16, 0.18], [0.34, 0.34], [0.52, 0.62], [0.68, 1], [0.82, 0.42], [1, 0.12],
];
const PTS = CURVE.map(([t, v]) => ({ x: AX_L + t * (AX_R - AX_L), y: BASE_Y - v * (BASE_Y - TOP_Y) }));

// Precomputed on the JS side: each segment is one rotated bar whose scaleX draws
// it in. No worklet ever does trigonometry on the curve.
const SEGS = PTS.slice(0, -1).map((a, k) => {
  const b = PTS[k + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { x: a.x, y: a.y, len: Math.hypot(dx, dy), rot: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` };
});
const SEG_N = SEGS.length;
const PEAK = PTS[4];

// ── the mode meter ────────────────────────────────────────────────────────────
const BAR_W = 30;
const BAR_GAP = 12;
const BAR_L0 = 20;
const BAR_BASE = 470;
const BAR_H = 78;
const MODES = ['DOR', 'PHR', 'LYD', 'MIX', 'ION'];
// Republic 398e–399a: Socrates keeps the Dorian and the Phrygian and throws out
// the mixolydian and the slack lydian and ionian. Two survive — hence "regulated".
const CUT = [false, false, true, true, true];
const BAR_X = MODES.map((_, k) => BAR_L0 + k * (BAR_W + BAR_GAP));

const P_CODE = BEATS.map((b) => b.p ?? 0);
const ARC = BEATS.map((b) => b.arc ?? 0);
const MASKB = BEATS.map((b) => b.mask ?? 0);
const METER = BEATS.map((b) => b.modes ?? 0);
const CUTB = BEATS.map((b) => b.cut ?? 0);

export default function Aesthetics3Scene({ clock, bt, bi, i }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      arc: lerp(ARC[p], ARC[n], tr),
      mask: lerp(MASKB[p], MASKB[n], tr),
      meter: lerp(METER[p], METER[n], tr),
      cut: lerp(CUTB[p], CUTB[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const axisStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.arc * 4) }));
  const peakStyle = useAnimatedStyle(() => ({
    opacity: ease01(clamp01((SCENE.value.arc - 0.72) / 0.2)),
  }));
  const tailStyle = useAnimatedStyle(() => ({
    opacity: ease01(clamp01((SCENE.value.arc - 0.85) / 0.13)),
  }));
  const maskStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.mask,
    transform: [{ translateY: (1 - SCENE.value.mask) * 10 }],
  }));
  const meterStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.meter * 1.6) }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── THE TRAGIC ARC ───────────────────────────────────────────────────── */}
      <Animated.View style={[styles.axisY, axisStyle]} pointerEvents="none" />
      <Animated.View style={[styles.axisX, axisStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.axisLabel, axisStyle]}>{'PITY & FEAR ↑'}</Animated.Text>
      <Animated.Text style={[styles.footL, axisStyle]}>{'THE PLAY →'}</Animated.Text>

      {SEGS.map((_, k) => <Seg key={k} S={SCENE} k={k} />)}

      <Animated.View style={[styles.peakGuide, peakStyle]} pointerEvents="none" />
      <Animated.View style={[styles.peakRing, peakStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.peakLabel, peakStyle]}>RECOGNITION</Animated.Text>
      <Animated.Text style={[styles.footR, tailStyle]}>KATHARSIS ↓</Animated.Text>

      {/* ── THE MODE METER ───────────────────────────────────────────────────── */}
      <Animated.Text style={[styles.meterTitle, meterStyle]}>THE MODES</Animated.Text>
      {MODES.map((m, k) => <Bar key={m} S={SCENE} k={k} label={m} />)}
      <Animated.Text style={[styles.meterFoot, meterStyle]}>
        {(cur.cut ?? 0) > 0 ? 'REGULATED — NOT BANNED' : 'MUSIC ARRIVES BEFORE REASON'}
      </Animated.Text>

      {/* ── the tragic mask, watching from the wings ─────────────────────────── */}
      <Animated.View style={[styles.mask, maskStyle]} pointerEvents="none">
        <View style={[styles.maskEye, { left: 11 }]} />
        <View style={[styles.maskEye, { right: 11 }]} />
        <View style={styles.maskMouth} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One segment of the arc: a bar rotated to the chord and stretched into being. */
function Seg({ S, k }: { S: SharedValue<any>; k: number }) {
  const rot = SEGS[k].rot;
  const st = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.arc * SEG_N - k));
    return { opacity: on, transform: [{ rotate: rot }, { scaleX: on }] };
  });
  return (
    <Animated.View
      style={[
        styles.seg,
        { left: SEGS[k].x, top: SEGS[k].y - 1.5, width: SEGS[k].len },
        st,
      ]}
      pointerEvents="none"
    />
  );
}

/** One mode: a bar that dances on its own frequency until Plato takes it out. */
function Bar({ S, k, label }: { S: SharedValue<any>; k: number; label: string }) {
  const cut = CUT[k];
  const f = 2.1 + k * 0.37;
  const ph = k * 1.31;
  const st = useAnimatedStyle(() => {
    const live = 0.26 + 0.74 * (0.5 + 0.5 * Math.sin(S.value.t * f + ph));
    const c = cut ? S.value.cut : 0;
    return {
      opacity: clamp01(S.value.meter * 1.6) * (1 - 0.7 * c),
      transform: [{ scaleY: lerp(live, 0.16, ease01(c)) }],
    };
  });
  const labelStyle = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.meter * 1.6) * (1 - 0.55 * (cut ? S.value.cut : 0)),
  }));
  const crossStyle = useAnimatedStyle(() => ({
    opacity: cut ? clamp01(S.value.meter) * ease01(S.value.cut) : 0,
    transform: [{ scale: 0.7 + 0.3 * ease01(cut ? S.value.cut : 0) }],
  }));
  return (
    <>
      <Animated.View style={[styles.bar, { left: BAR_X[k] }, st]} pointerEvents="none" />
      <Animated.Text style={[styles.barLabel, { left: BAR_X[k] }, labelStyle]}>{label}</Animated.Text>
      {cut ? (
        <Animated.View style={[styles.cross, { left: BAR_X[k] + BAR_W / 2 - 14 }, crossStyle]} pointerEvents="none">
          <View style={[styles.crossBar, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.crossBar, { transform: [{ rotate: '-45deg' }] }]} />
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  axisY: { position: 'absolute', left: AX_L, top: TOP_Y - 4, width: 1.5, height: BASE_Y - TOP_Y + 4, backgroundColor: SOFT },
  axisX: { position: 'absolute', left: AX_L, top: BASE_Y, width: AX_R - AX_L, height: 1.5, backgroundColor: SOFT },
  axisLabel: {
    position: 'absolute', left: 20, top: 230, width: 130,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT,
  },
  footL: {
    position: 'absolute', left: AX_L, top: 342, width: 120,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT,
  },
  footR: {
    position: 'absolute', left: 240, top: 342, width: 132, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: INK,
  },

  seg: { position: 'absolute', height: 3, backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%' },
  peakGuide: { position: 'absolute', left: PEAK.x, top: PEAK.y, width: 1, height: BASE_Y - PEAK.y, backgroundColor: RULE },
  peakRing: {
    position: 'absolute', left: PEAK.x - 8, top: PEAK.y - 8, width: 16, height: 16,
    borderRadius: 8, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  peakLabel: {
    position: 'absolute', left: PEAK.x - 70, top: 227, width: 140, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },

  meterTitle: {
    position: 'absolute', left: BAR_L0, top: 374, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  // Full-height bars anchored at the baseline; only scaleY animates, so the meter
  // never triggers layout.
  bar: {
    position: 'absolute', top: BAR_BASE - BAR_H, width: BAR_W, height: BAR_H,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%',
  },
  barLabel: {
    position: 'absolute', top: BAR_BASE + 5, width: BAR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.8, color: SOFT,
  },
  cross: { position: 'absolute', top: 426, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  crossBar: { position: 'absolute', width: 28, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  meterFoot: {
    position: 'absolute', left: BAR_L0, top: 487, width: 244,
    fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 11, letterSpacing: 0.9, color: SOFT,
    includeFontPadding: false,
  },

  mask: {
    position: 'absolute', left: 236, top: 398, width: 50, height: 60,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderRadius: 22, borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
  },
  maskEye: { position: 'absolute', top: 19, width: 9, height: 9, borderRadius: 5, backgroundColor: INK },
  maskMouth: {
    position: 'absolute', bottom: 10, alignSelf: 'center', width: 21, height: 10,
    borderBottomWidth: 3, borderColor: INK,
    borderBottomLeftRadius: 11, borderBottomRightRadius: 11, transform: [{ rotate: '180deg' }],
  },
});

// Every drawn pixel sits between the peak label at y 227 and the ground line at
// y 501.5, so the player crops to that slice and renders the scene ~2.25×.
export function Aesthetics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics3Scene} band={[220, 508]} />;
}
