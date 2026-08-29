import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, seated, type Bundle, type Stance, } from './rig';
import { BEATS } from './logic31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A SEATED lesson, and the composition is turned ninety degrees from the walking
// ones: the run of flips is a full-width band across the top, the odds needle is a
// horizontal scale under it, and the figure sits at a table bottom-left instead of
// pacing a track.
//
// · the figure never moves. Seated at x 96 on a bench top at y 479, its pelvis is
//   21 rig units up and its crown lands at y ≈ 410 — below every prop on the stage.
//   Legs run forward to about x 130, hands rest at x ≈ 110.
// · coins y 232…260 across x 30…390 · the scale y 300…316 with its ticks y 322…362
//   · the bench x 52…148, y 479…500.
// · A5 — nothing here is within reach and nothing claims to be: the figure watches
//   a table it is sitting at, and the run and the needle are the lesson's diagram
//   rather than objects it handles (D32).

const FIG_X = 96;
const SEAT_H = 21;

const COIN = 28;
const COIN_N = 7;
const COIN_GAP = 12;
const COIN_ROW_W = COIN_N * COIN + (COIN_N - 1) * COIN_GAP;
const COIN_L = (STAGE_W - COIN_ROW_W) / 2;
const COIN_T = 232;

const SC_L = 200;
const SC_R = 390;
const SC_W = SC_R - SC_L;
const SC_T = 300;
const SC_H = 16;

const TICK_T = 322;
const TICK_H = 40;
const TICK_N = 5;
const TICK_GAP = 5;
const TICK_W = (SC_W - (TICK_N - 1) * TICK_GAP) / TICK_N;

const BENCH_L = 52;
const BENCH_W = 96;
const BENCH_T = GROUND - SEAT_H;

// The needle never moves off centre. Its position is a CONSTANT, not a channel the
// script can set — the lesson's whole claim is that seven heads change nothing, so
// there is no way to animate it even by accident.
const NEEDLE_AT = 0.5;

const TICKS = [
  { id: 't0', label: '0%', correct: false },
  { id: 't25', label: '25%', correct: false },
  { id: 't50', label: '50%', correct: true },
  { id: 't75', label: '75%', correct: false },
  { id: 't100', label: '100%', correct: false },
];

/** Four seated attitudes. Built from `seated` so the sit itself never drifts. */
function attitude(code: number, t: number): Stance {
  'worklet';
  const s = seated(SEAT_H, t);
  if (code === 1) return { ...s, tilt: s.tilt - 0.16, neck: 0.1 };          // leaning in
  if (code === 2) return { ...s, tilt: s.tilt - 0.22, neck: 0.16, bob: s.bob - 2 }; // sure of it
  if (code === 3) return { ...s, tilt: s.tilt + 0.14, neck: -0.08 };        // sitting back
  return s;
}

const P = BEATS.map((b) => b.p ?? 0);
const FLIPS = BEATS.map((b) => b.flips ?? 0);
const SCALEV = BEATS.map((b) => b.scale ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic31'));

export default function Logic31Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const scaleFade = (cur.scale ?? 0) !== (prev?.scale ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // No walking here, so the transition is a fixed blend rather than moveTr —
    // the figure changes attitude, it does not travel (C17 is about distance).
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n,attitude(P[p], t)), attitude(P[n], t), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      flips: carry(cv, 0, n, FLIPS[p], FLIPS[n], grow),
      scale: carry(cv, 1, n, SCALEV[p], SCALEV[n], tr, scaleFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const scaleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.scale }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the run, full width across the top ──────────────────────────────── */}
      {Array.from({ length: COIN_N }, (_, k) => (
        <Coin key={k} index={k} SCENE={SCENE} />
      ))}

      {/* ── the odds scale, which is the thing that does not move ───────────── */}
      <Animated.View style={[styles.scaleWrap, scaleStyle]} pointerEvents="none">
        <View style={styles.track} />
        <View style={[styles.needle, { left: SC_L + NEEDLE_AT * SC_W - 3 }]} />
        <Text style={styles.scaleLab} numberOfLines={1}>CHANCE OF HEADS, NEXT FLIP</Text>
      </Animated.View>

      {showPick &&
        TICKS.map((tk, k) => {
          const chosen = picked === tk.id;
          return (
            <Target id={tk.id} correct={tk.correct} picked={picked} onPick={onPick}
              key={tk.id} style={[styles.tick, { left: SC_L + k * (TICK_W + TICK_GAP) }]} hitSlop={{ top: 8, bottom: 8, left: TICK_GAP / 2, right: TICK_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.tickInner,
                  answered && tk.correct && styles.pickRight,
                  answered && chosen && !tk.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.tickText, answered && tk.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {tk.label}
                </Text>
              </View>
            </Target>
          );
        })}

      {/* the table the figure is sitting at */}
      <View style={styles.bench} pointerEvents="none" />
      <View style={[styles.benchLeg, { left: BENCH_L + 6 }]} pointerEvents="none" />
      <View style={[styles.benchLeg, { left: BENCH_L + BENCH_W - 10 }]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One flip. Lands with a small drop rather than a fade, so the run reads as dealt. */
function Coin({ index, SCENE }: { index: number; SCENE: { value: { flips: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = Math.max(0, Math.min(1, SCENE.value.flips - index));
    return { opacity: a, transform: [{ translateY: (1 - a) * -12 }] };
  });
  return (
    <Animated.View
      style={[styles.coin, { left: COIN_L + index * (COIN + COIN_GAP) }, st]}
      pointerEvents="none"
    >
      <Text style={styles.coinText} numberOfLines={1}>H</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  coin: {
    position: 'absolute', top: COIN_T, width: COIN, height: COIN, borderRadius: COIN / 2,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  coinText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, color: INK,
    includeFontPadding: false,
  },

  scaleWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  track: {
    position: 'absolute', left: SC_L, top: SC_T, width: SC_W, height: SC_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  needle: {
    position: 'absolute', top: SC_T - 4, width: 6, height: SC_H + 8,
    backgroundColor: INK, borderRadius: 2,
  },
  scaleLab: {
    position: 'absolute', left: SC_L, top: SC_T - 18, width: SC_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },

  tick: { position: 'absolute', top: TICK_T, width: TICK_W },
  tickInner: {
    height: TICK_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  tickText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  bench: {
    position: 'absolute', left: BENCH_L, top: BENCH_T, width: BENCH_W, height: 6,
    backgroundColor: INK, borderRadius: 2,
  },
  benchLeg: {
    position: 'absolute', top: BENCH_T + 6, width: 4, height: GROUND - BENCH_T - 6,
    backgroundColor: SOFT,
  },
});

// Ink runs from the scale label (282) and the coins (232) down to the ground line.
// Band 226…512 = 286 (H59).
export function Logic31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic31Scene} band={[226, 512]} camera={CAM} />;
}
