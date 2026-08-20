import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics3Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// Three charts and a figure caught between them.
//
// TOP (Aristotle's beats) — THE TRAGIC ARC. A real line graph of pity and fear
// over the length of a play: six segments that draw themselves left to right, a
// ringed peak marked RECOGNITION, and the long fall labelled KATHARSIS. It lives
// entirely above y = 356, so it can never collide with the figure.
//
// TOP (the music beats) — SCHOPENHAUER'S LADDER. The graph steps aside and its
// slot is taken by a two-rung diagram: the OTHER ARTS copy the Ideas; MUSIC copies
// the will itself. Same geometry, opposite half of the lesson — so the upper third
// is never empty, and the quote card's claim is on the wall before it is read.
//
// BOTTOM-LEFT — THE MODES. A live bar meter of the five Greek modes on a ruled
// baseline, each bar dancing on its own frequency so the meter reads as music
// rather than a static chart. On the Plato beat the three soft modes sink and are
// stamped out with an ink cross while Dorian and Phrygian keep playing: regulated,
// not banned.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · Figure at x = 344 on GROUND = 500 → spans about x 296–392, crown ~361.
//   · Arc and ladder both stop at y 344, a clear 17 units above that crown.
//   · The meter owns x 20–218 and the tragic MASK x 134–218; they are mutually
//     exclusive (mask only on the Aristotle beats, meter only on the music ones),
//     so they share the lower-left quarter and neither half of the stage is ever
//     blank. Nothing but the ground line is drawn right of x = 384.
//   · Both shared slots hand over with a STAGGERED gate rather than a cross-fade —
//     see the occupancy tracks below — so two occupants are never on screen at
//     half opacity together.
//   · Art runs y 226 (the peak label) → 507.4 (the ankle joints), hence band
//     [218, 512]: a ~2.20× render instead of the letterboxed 1.15×.

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
const BAR_SPAN = MODES.length * BAR_W + (MODES.length - 1) * BAR_GAP;   // 198

// ── Schopenhauer's ladder ─────────────────────────────────────────────────────
// Two rungs sharing the arc's slot. Rung 0 is the ordinary case (arts copy the
// Ideas); rung 1 is the exception the quote is about (music copies the will), so
// it carries the ink fill and the heavier frame.
const RUNG_T = [248, 300];
const RUNG_H = 44;
const FROM_L = 16;
const FROM_W = 148;
const TO_L = 210;
const TO_W = 174;
const RUNGS = [
  { from: 'THE OTHER ARTS', to: 'COPY THE IDEAS' },
  { from: 'MUSIC', to: 'COPIES THE WILL' },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);

// TWO SHARED SLOTS, ONE CLEAN HAND-OVER.
// The arc and the ladder share the upper third; the mask and the mode meter share
// the lower left. Cross-fading them straight against each other left BOTH occupants
// sitting at half opacity through the middle of every swap — on a phone that reads
// as a smudge, not a transition. So each prop now carries an OCCUPANCY track (0/1)
// which the scene turns into a staggered gate: the outgoing prop is gone by 45% of
// the transition, the incoming one starts at 55%, and the slot is briefly — and
// deliberately — empty in between.
const ARC_ON = BEATS.map((b) => ((b.arc ?? 0) > 0 ? 1 : 0));
const MASK_ON = BEATS.map((b) => ((b.mask ?? 0) > 0 ? 1 : 0));
const METER_ON = BEATS.map((b) => ((b.modes ?? 0) > 0 ? 1 : 0));
const WILL_ON = BEATS.map((b) => ((b.will ?? 0) > 0 ? 1 : 0));
// The arc's VALUE track HOLDS its last drawn amount rather than falling back to 0
// when the ladder takes the slot, so the curve never un-draws itself on its way
// out — it simply stops being there.
const ARC = (() => {
  let last = 0;
  return BEATS.map((b) => { const v = b.arc ?? 0; if (v > 0) last = v; return last; });
})();
const CUTB = BEATS.map((b) => b.cut ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics3'));

export default function Aesthetics3Scene({ clock, bt, bi, i }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      arc: lerp(ARC[p], ARC[n], tr),
      cut: lerp(CUTB[p], CUTB[n], tr),
      // The staggered slot gates: out by 45%, in from 55%, never both at once.
      arcOn: ease01(clamp01((lerp(ARC_ON[p], ARC_ON[n], tr) - 0.55) / 0.45)),
      maskOn: ease01(clamp01((lerp(MASK_ON[p], MASK_ON[n], tr) - 0.55) / 0.45)),
      meterOn: ease01(clamp01((lerp(METER_ON[p], METER_ON[n], tr) - 0.55) / 0.45)),
      willOn: ease01(clamp01((lerp(WILL_ON[p], WILL_ON[n], tr) - 0.55) / 0.45)),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const axisStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arcOn }));
  const peakStyle = useAnimatedStyle(() => ({
    opacity: ease01(clamp01((SCENE.value.arc - 0.72) / 0.2)) * SCENE.value.arcOn,
  }));
  const tailStyle = useAnimatedStyle(() => ({
    opacity: ease01(clamp01((SCENE.value.arc - 0.85) / 0.13)) * SCENE.value.arcOn,
  }));
  const maskStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.maskOn,
    transform: [{ translateY: (1 - SCENE.value.maskOn) * 10 }],
  }));
  const meterStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.meterOn }));
  const willStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.willOn }));

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

      {/* ── SCHOPENHAUER'S LADDER (the arc's slot, on the music beats) ───────── */}
      <Animated.View style={[styles.willWrap, willStyle]} pointerEvents="none">
        <Text style={styles.willTitle}>WHAT EACH ART COPIES</Text>
        {/* absoluteFill on the row wrapper, so each child keeps STAGE coordinates
            instead of being measured against a zero-height flex box. */}
        {RUNGS.map((r, k) => (
          <View key={r.from} style={StyleSheet.absoluteFill}>
            <View style={[styles.fromBox, { top: RUNG_T[k] }, k === 1 && styles.fromBoxOn]}>
              <Text style={[styles.fromText, k === 1 && styles.fromTextOn]}>{r.from}</Text>
            </View>
            <View style={[styles.willShaft, { top: RUNG_T[k] + RUNG_H / 2 - 1.5 }]} />
            <View style={[styles.willHead, { top: RUNG_T[k] + RUNG_H / 2 - 6.5 }]} />
            <View style={[styles.toBox, { top: RUNG_T[k] }, k === 1 && styles.toBoxOn]}>
              <Text style={[styles.toText, k === 1 && styles.toTextOn]}>{r.to}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* ── THE MODE METER ───────────────────────────────────────────────────── */}
      <Animated.Text style={[styles.meterTitle, meterStyle]}>THE MODES</Animated.Text>
      {MODES.map((m, k) => <Bar key={m} S={SCENE} k={k} label={m} />)}
      <Animated.View style={[styles.meterBase, meterStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.meterFoot, meterStyle]}>
        {(cur.cut ?? 0) > 0 ? 'REGULATED — NOT BANNED' : 'MUSIC ARRIVES BEFORE REASON'}
      </Animated.Text>

      {/* ── the tragic mask, in the meter's slot on the Aristotle beats ──────── */}
      <Animated.View style={[styles.maskWrap, maskStyle]} pointerEvents="none">
        <Text style={styles.maskCap}>THE TRAGIC MASK</Text>
        <View style={styles.mask}>
          <View style={[styles.maskBrow, { left: 12, transform: [{ rotate: '15deg' }] }]} />
          <View style={[styles.maskBrow, { right: 12, transform: [{ rotate: '-15deg' }] }]} />
          <View style={[styles.maskEye, { left: 15 }]} />
          <View style={[styles.maskEye, { right: 15 }]} />
          <View style={styles.maskMouth} />
          <View style={styles.maskTear} />
        </View>
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
    return { opacity: on * S.value.arcOn, transform: [{ rotate: rot }, { scaleX: on }] };
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
      opacity: S.value.meterOn * (1 - 0.7 * c),
      transform: [{ scaleY: lerp(live, 0.16, ease01(c)) }],
    };
  });
  const labelStyle = useAnimatedStyle(() => ({
    opacity: S.value.meterOn * (1 - 0.55 * (cut ? S.value.cut : 0)),
  }));
  const crossStyle = useAnimatedStyle(() => ({
    opacity: cut ? S.value.meterOn * ease01(S.value.cut) : 0,
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
    position: 'absolute', left: 20, top: 229, width: 140,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  footL: {
    position: 'absolute', left: AX_L, top: 342, width: 126,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  footR: {
    position: 'absolute', left: 234, top: 342, width: 138, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },

  seg: { position: 'absolute', height: 3, backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%' },
  peakGuide: { position: 'absolute', left: PEAK.x, top: PEAK.y, width: 1, height: BASE_Y - PEAK.y, backgroundColor: RULE },
  peakRing: {
    position: 'absolute', left: PEAK.x - 8, top: PEAK.y - 8, width: 16, height: 16,
    borderRadius: 8, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  peakLabel: {
    position: 'absolute', left: PEAK.x - 74, top: 226, width: 148, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },

  // ── Schopenhauer's ladder ────────────────────────────────────────────────────
  // A full-stage wrapper so every child can be authored in stage coordinates.
  willWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  willTitle: {
    position: 'absolute', left: 0, top: 227, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  fromBox: {
    position: 'absolute', left: FROM_L, width: FROM_W, height: RUNG_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  fromBoxOn: { borderWidth: 2.5, borderColor: INK, backgroundColor: INK },
  fromText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
  fromTextOn: { color: PAPER, fontSize: 15, letterSpacing: 1.6 },
  willShaft: { position: 'absolute', left: 172, width: 22, height: 3, backgroundColor: INK },
  willHead: {
    position: 'absolute', left: 192, width: 0, height: 0,
    borderTopWidth: 6.5, borderBottomWidth: 6.5, borderLeftWidth: 11,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  toBox: {
    position: 'absolute', left: TO_L, width: TO_W, height: RUNG_H,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  toBoxOn: { borderWidth: 2.5, borderColor: INK },
  toText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.4, color: SOFT,
    includeFontPadding: false,
  },
  toTextOn: { color: INK, fontSize: 13.5, letterSpacing: 0.8 },

  meterTitle: {
    position: 'absolute', left: BAR_L0, top: 373, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  // Full-height bars anchored at the baseline; only scaleY animates, so the meter
  // never triggers layout.
  bar: {
    position: 'absolute', top: BAR_BASE - BAR_H, width: BAR_W, height: BAR_H,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%',
  },
  // A ruled baseline turns five floating bars into a chart.
  meterBase: { position: 'absolute', left: BAR_L0, top: BAR_BASE, width: BAR_SPAN, height: 1.5, backgroundColor: SOFT },
  // ── THE LABEL ROW AND THE CAPTION WERE INSIDE EACH OTHER (D33) ─────────────
  //
  // barLabel ran 474..486.5 (top 474, lineHeight 12.5) and meterFoot began at 485,
  // so the two overlapped by a unit and a half and the caption's capitals sat on
  // the mode labels' baseline. Five words — DOR PHR LYD MIX ION — each measured
  // 9-11% covered by "MUSIC ARRIVES BEFORE REASON".
  //
  // There is no room BELOW: the caption already bottomed out 4 units above the
  // ground rule at 501.5, and pushing it down would put a rule through it, which
  // is the same defect wearing the other hat. So the leading comes in instead —
  // 12.5 to 11 on both, which these two 10.5/10pt capital-only lines can spare —
  // and that buys the 4 units of air between them.
  barLabel: {
    position: 'absolute', top: BAR_BASE + 4, width: BAR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 11, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },
  cross: { position: 'absolute', top: 426, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  crossBar: { position: 'absolute', width: 28, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  meterFoot: {
    position: 'absolute', left: BAR_L0, top: 489, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 11, letterSpacing: 0.9, color: SOFT,
    includeFontPadding: false,
  },

  // ── the tragic mask ──────────────────────────────────────────────────────────
  // Big enough to read as a carved object (84 × 100) and drawn properly: raised
  // brows, hollow eyes, a downturned mouth and a painted tear-line.
  maskWrap: { position: 'absolute', left: 116, top: 366, width: 120, height: 132 },
  maskCap: {
    position: 'absolute', left: 0, top: 0, width: 120, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  mask: {
    position: 'absolute', left: 18, top: 18, width: 84, height: 100,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderTopLeftRadius: 42, borderTopRightRadius: 42,
    borderBottomLeftRadius: 38, borderBottomRightRadius: 38,
  },
  maskBrow: { position: 'absolute', top: 26, width: 22, height: 3, backgroundColor: INK, borderRadius: 2 },
  maskEye: { position: 'absolute', top: 36, width: 14, height: 14, borderRadius: 7, backgroundColor: INK },
  maskTear: { position: 'absolute', top: 53, left: 21, width: 3, height: 14, borderRadius: 1.5, backgroundColor: SOFT },
  maskMouth: {
    position: 'absolute', bottom: 16, alignSelf: 'center', width: 36, height: 16,
    borderBottomWidth: 3.5, borderColor: INK,
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18, transform: [{ rotate: '180deg' }],
  },
});

// MEASURED BAND, top and bottom.
//   TOP    the RECOGNITION label at y 226 (the ladder's title sits at 227, the axis
//          label at 229, the peak ring at 242). Nothing on any beat is drawn higher.
//   BOTTOM the true extreme is NOT the ground line at 501.5 but the figure's ankle
//          JOINTS: circles of radius STR.limb·K_FIG/2 = 7.43 centred exactly on
//          GROUND, so ink reaches y = 507.4. The meter's caption bottoms out at
//          500 (489 + an 11-unit line, moved down 4 to clear the mode labels — D33)
//          and the mask at 484.
// The figure stands on GROUND = 500 with its crown near 361, and nothing is drawn
// right of x 386. [218, 512] therefore holds every extreme on every beat with 8
// units of margin at the top and 4.6 at the foot, and renders the scene ~2.20×
// instead of the letterboxed 1.15× — within 5% of the width-limited ceiling of
// 2.31×, so there is nothing left to win by cropping harder.
export function Aesthetics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics3Scene} band={[218, 512]} camera={CAM} />;
}
