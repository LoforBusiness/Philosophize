import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology16Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// EVERY RESULT THE ECLIPSE COULD HAVE GIVEN, AND WHAT EACH THEORY PERMITS (H64).
// A theory's bar is as wide as the results it allows, so "forbids something" is a
// width rather than a definition. The bars are the Q1 targets.
//
// · the five RESULT cards are 54 × 40 on a 58 pitch at x 96 / 154 / 212 / 270 /
//   328, y 250…290. The right-hand one ends at x 382.
// · the three BARS lie under the results they permit, at y 306 / 358 / 410, each
//   40 tall: the wide one spans x 96…382, Einstein's spans the third card
//   (x 212…266) and Newton's the second (x 154…208).
// · the RING marks the result that came back, round the third card at
//   x 206…272, y 244…296.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   nineteen units clear of the first result card, and his crown is y 397 — level
//   with Newton's bar and well left of it (D23).
// · the label sits at y 228…244, the highest ink; the lowest is the last bar at
//   y 450, fifty above the ground line.
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;

const RES_W = 54;
const RES_PITCH = 58;
const RES_L = 96;
const RES_T = 250;
const RES_H = 40;
const RESULTS = ['NONE', 'HALF', '1.75″', 'DOUBLE', 'MORE'];

const BAR_T = [306, 358, 410];
const BAR_H = 40;

const BARS = [
  { id: 'wide', text: 'FITS ANY RESULT', left: RES_L, width: RES_PITCH * 4 + RES_W, correct: true },
  { id: 'einstein', text: 'BENDS 1.75″', left: RES_L + RES_PITCH * 2, width: RES_W, correct: false },
  { id: 'newton', text: 'BENDS HALF', left: RES_L + RES_PITCH, width: RES_W, correct: false },
];

const RING_L = RES_L + RES_PITCH * 2 - 6;
const RING_W = RES_W + 12;

const G = BEATS.map((b) => b.g ?? 0);
const RESN = BEATS.map((b) => b.results ?? 0);
const BARN = BEATS.map((b) => b.bars ?? 0);
const FOUND = BEATS.map((b) => b.found ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology16'));

export default function Epistemology16Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const deal = ease01(bt.value / 1.3);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // R7b — the knob rules the results out. A theory that forbids more leaves fewer
      // possible outcomes standing, so dragging toward FORBIDS ALMOST ALL clears the
      // row: the reader watches a claim become risky.
      results: carry(cv, 0, n, RESN[p], reacting ? (1 - dragPos.value) * 5 : RESN[n], deal),
      bars: carry(cv, 1, n, BARN[p], BARN[n], deal),
      found: carry(cv, 2, n, FOUND[p], FOUND[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const ring = useAnimatedStyle(() => ({ opacity: SCENE.value.found }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>EVERY RESULT THE ECLIPSE COULD HAVE GIVEN</Text>

      {RESULTS.map((r, k) => <Result key={r} k={k} SCENE={SCENE} />)}
      <Animated.View style={[styles.ring, ring]} pointerEvents="none" />

      {BARS.map((b, k) => (
        <Bar key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One result the world could have returned. */
function Result({ k, SCENE }: { k: number; SCENE: { value: { results: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.results - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * -8 }] };
  });
  return (
    <Animated.View style={[styles.result, { left: RES_L + k * RES_PITCH }, st]} pointerEvents="none">
      <Text style={styles.resultText} numberOfLines={1}>{RESULTS[k]}</Text>
    </Animated.View>
  );
}

/** One theory, drawn as wide as the results it allows — and a Q1 target. */
function Bar({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { bars: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const b = BARS[k];
  const on = answered && b.correct;
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.bars - k);
    return { opacity: a, transform: [{ scaleX: 0.3 + 0.7 * a }] };
  });
  return (
    <Animated.View style={[styles.bar, { left: b.left, top: BAR_T[k], width: b.width }, st]}>
      <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.barInner,
          on && styles.pickRight,
          answered && picked === b.id && !b.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.barText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  result: {
    position: 'absolute', top: RES_T, width: RES_W, height: RES_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  resultText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK,
    includeFontPadding: false,
  },
  ring: {
    position: 'absolute', left: RING_L, top: RES_T - 6, width: RING_W, height: RES_H + 12,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6,
  },

  bar: { position: 'absolute', height: BAR_H, transformOrigin: '0% 50%' },
  barInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  barText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.7, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the last bar (450). Band 222…512 = 290.
export function Epistemology16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology16Scene} band={[222, 512]} camera={CAM} />;
}
