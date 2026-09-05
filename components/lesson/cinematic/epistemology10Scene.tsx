import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology10Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// One gauge across the top of the stage: a guess at the left end, absolute certainty
// at the right. A shaded BAND says where knowledge is allowed to live — a sliver at
// the far end under the old demand, most of the scale under fallibilism — and a
// needle rides inside it and moves when evidence arrives.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS x = 92 → 160 → 228. Widest body span x ≈ 56 … 264.
//   · the gauge is one horizontal rule at y 300 running x 40 … 360, with its band
//     drawn 12 either side of it, so all of it lives in y 288 … 312.
//   · the end captions sit at y 262 … 284; the tick labels at y 316 … 330.
//   · the three flags hang BELOW the gauge, y 312 … 372 — a stem and a box, so a
//     tap lands on a POSITION along the scale rather than on a list of sentences.
//   · a standing crown is y 397 and a raised hand reaches about y 410, so the
//     lowest ink up there (372) clears the figure by 25 units at its tallest. No
//     gesture in this script goes overhead (D23).
// Nothing is drawn above y 262 or below the ground line, hence band [256, 512] —
// 256 tall, which is inside the width-limited crop, so the picture is as large as
// this stage can render (H59).

const SC_L = 40;
const SC_R = 360;
const SC_Y = 300;
const SC_W = SC_R - SC_L;

// Where each answer plants its flag, as a fraction of the gauge.
const FLAGS = [
  { id: 'thin', at: 0.16, head: 'HERE', sub: 'a hunch, barely\nany evidence', correct: false },
  { id: 'short', at: 0.5, head: 'HERE', sub: 'good evidence,\nstill open', correct: true },
  { id: 'certain', at: 0.87, head: 'HERE', sub: 'only when you\ncannot be wrong', correct: false },
];
const FLAG_W = 92;
const FLAG_T = 336;

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 92);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology10'));
const DIR = dirsFrom(X, 1);
const GAUGE = BEATS.map((b) => b.gauge ?? 0);
const BAND = BEATS.map((b) => b.band ?? 0);
const NEEDLE = BEATS.map((b) => b.needle ?? 0.5);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

// Where the shaded band starts, per state: nothing · the last sliver · most of it.
const BAND_L = [0.98, 0.93, 0.34];

export default function Epistemology10Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const gaugeFade = (cur.gauge ?? 0) !== (prev?.gauge ?? 0);
  const bandOn = (cur.band ?? 0) > 0;
  const flagsOn = !!cur.flags;
  const flagsFade = flagsOn !== !!prev?.flags;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    const bl = lerp(BAND_L[BAND[p]], BAND_L[BAND[n]], tr);
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      gauge: carry(cv, 1, n, GAUGE[p], GAUGE[n], tr, gaugeFade ? grow : 1),
      bandL: SC_L + bl * SC_W,
      bandW: Math.max(0, SC_W * (1 - bl)),
      bandOn: bandOn ? 1 : 0,
      // The needle takes its own unhurried time to travel, so the beat where the
      // evidence arrives reads as a movement rather than a cut.
      // R7b — the knob IS the needle. The rail runs from barely believed to beyond
      // question and so does the gauge on stage, so the reader sets the confidence
      // they are being asked about rather than reading about it.
      needle: SC_L + carry(cv, 2, n, NEEDLE[p], reacting ? dragPos.value : NEEDLE[n], ease01(clamp01(bt.value / 1.4)), SC_W),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const gaugeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gauge }));
  const bandStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.bandOn * SCENE.value.gauge,
    left: SCENE.value.bandL,
    width: SCENE.value.bandW,
  }));
  const needleStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.gauge,
    transform: [{ translateX: SCENE.value.needle - SC_L }],
  }));
  const flagStyle = useAnimatedStyle(() => ({
    opacity: flagsOn ? (flagsFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── the gauge ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.gaugeWrap, gaugeStyle]} pointerEvents="none">
        <Text style={[styles.endCap, styles.endL]}>A GUESS</Text>
        <Text style={[styles.endCap, styles.endR]}>ABSOLUTE{'\n'}CERTAINTY</Text>
        <View style={styles.rail} />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <View key={f} style={[styles.tick, { left: SC_L + f * SC_W }]} />
        ))}
      </Animated.View>

      {/* where knowledge is allowed to live */}
      <Animated.View style={[styles.band, bandStyle]} pointerEvents="none" />
      <Animated.View style={[styles.needle, needleStyle]} pointerEvents="none" />

      {/* ── Q1: plant the flag where knowledge begins ───────────────────────── */}
      {flagsOn &&
        FLAGS.map((f) => {
          const chosen = picked === f.id;
          const cx = SC_L + f.at * SC_W;
          return (
            <Animated.View
              key={f.id}
              style={[styles.flagSlot, { left: cx - FLAG_W / 2 }, flagStyle]}
            >
              <Target id={f.id} correct={f.correct} picked={picked} onPick={onPick}
              disabled={answered}>
                <View style={styles.stem} />
                <View
                  style={[
                    styles.flag,
                    answered && f.correct && styles.flagRight,
                    answered && chosen && !f.correct && styles.flagWrong,
                  ]}
                >
                  <Text style={[styles.flagHead, answered && f.correct && styles.flagOn]}>{f.head}</Text>
                  <Text style={[styles.flagSub, answered && f.correct && styles.flagOn]}>{f.sub}</Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  gaugeWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rail: { position: 'absolute', left: SC_L, top: SC_Y, width: SC_W, height: 2.5, backgroundColor: INK },
  tick: { position: 'absolute', top: SC_Y - 5, width: 2, height: 13, backgroundColor: INK },
  endCap: {
    position: 'absolute', top: 262, fontFamily: 'Inter_700Bold', fontSize: 9.5,
    letterSpacing: 1.5, lineHeight: 13, color: SOFT, includeFontPadding: false,
  },
  endL: { left: SC_L },
  endR: { left: SC_R - 78, width: 78, textAlign: 'right' },

  // The band is the claim being made about the gauge, so it is the only filled
  // shape up there — a shaded run of the scale rather than another outlined box.
  band: {
    position: 'absolute', top: SC_Y - 9, height: 21,
    backgroundColor: INK, opacity: 0.14, borderRadius: 2,
  },
  needle: {
    position: 'absolute', left: SC_L - 1.5, top: SC_Y - 16, width: 3, height: 35,
    backgroundColor: INK,
  },

  flagSlot: { position: 'absolute', top: SC_Y + 12, width: FLAG_W, alignItems: 'center' },
  stem: { width: 2, height: FLAG_T - (SC_Y + 12), backgroundColor: SOFT },
  flag: {
    width: FLAG_W, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    paddingVertical: 5, paddingHorizontal: 4, alignItems: 'center',
  },
  flagRight: { backgroundColor: INK, borderColor: INK },
  flagWrong: { borderColor: SOFT },
  flagHead: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  flagSub: {
    fontFamily: 'Inter_400Regular', fontSize: 8.6, lineHeight: 11.5, color: INK,
    textAlign: 'center', marginTop: 2, includeFontPadding: false,
  },
  flagOn: { color: PAPER },
});

// Art runs from the end captions (262) to the ground line (500); the flags bottom
// out at 372, well clear of a crown at 397. A 256-unit band is inside the crop's
// width limit, so this renders at the largest size the stage can give (H59).
export function Epistemology10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology10Scene} band={[256, 512]} camera={CAM} />;
}
