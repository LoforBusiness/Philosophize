import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic13Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// FOUR STEPS DOWN A HILL, AND THE JOINS BETWEEN THEM (H64). The steps are the Q1
// targets, so the reader points at the argument itself (E33).
//
// · the four STEPS are 150 × 42, staggered right and down: x 22 / 66 / 110 / 154
//   at tops y 244 / 300 / 356 / 412. The lowest ends at y 454 and at x 304,
//   forty-six clear of the ground line and fifty-two left of the figure.
// · the three JOINS are 26-wide question marks in the 14-unit gaps, at the left
//   edge of the step below: x 76 / 120 / 164, y 286 / 342 / 398. Each sits between
//   two steps and touches neither (D23).
// · the HONEST slope is a narrow column at x 306…382 — three linked marks at
//   y 262 / 322 / 382 with solid joins, captioned at y 244. It is the counter-case
//   and it is drawn small on purpose: it is not what the lesson is about.
// · the figure stands at x = 356 facing LEFT, at the bottom of the hill and to the
//   right of every step (the lowest ends at x 304). His widest ink to the left is
//   a fist at x ≈ 323, nineteen clear, and his crown is y 397.
// · highest ink is the first step at y 244; lowest is the ground at 500.
//
// Band 238…512 = 274, which puts one figure at 38% of the frame — exactly on
// check:scale's line — so the band takes the honest slope's caption in as well and
// runs 226…512 = 286 (36%).

const FIG_X = 356;

const STEP_W = 150;
const STEP_H = 42;
const STEP_X = [22, 66, 110, 154];
const STEP_T = [244, 300, 356, 412];

const JOIN_X = [76, 120, 164];
const JOIN_T = [286, 342, 398];

const HON_L = 306;
const HON_W = 76;
const HON_T = [262, 322, 382];

const STEPS = [
  { id: 's1', text: 'LET ONE STUDENT RETAKE ONE QUIZ', correct: false },
  { id: 's2', text: 'THEN THEY WILL RETAKE EVERY TEST', correct: true },
  { id: 's3', text: 'THEN GRADES MEAN NOTHING', correct: false },
  { id: 's4', text: 'SO ALLOW NO RETAKES AT ALL', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const STEPN = BEATS.map((b) => b.steps ?? 0);
const JOINS = BEATS.map((b) => b.joins ?? 0);
const HONEST = BEATS.map((b) => b.honest ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic13'));

export default function Logic13Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
    // The three extra steps arrive one after another rather than together, so the
    // "and then, and then" of the narration is what the reader watches happen.
    const fall = ease01(bt.value / 1.3);
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      // He faces LEFT, up the hill he is being told he will fall down.
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      steps: carry(cv, 0, n, STEPN[p], STEPN[n], fall),
      joins: carry(cv, 1, n, JOINS[p], JOINS[n], grow),
      honest: carry(cv, 2, n, HONEST[p], HONEST[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const honest = useAnimatedStyle(() => ({ opacity: SCENE.value.honest }));

  return (
    <Animated.View style={styles.scene}>
      {STEPS.map((s, k) => (
        <Step key={s.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}
      {JOIN_X.map((_, k) => <Join key={k} k={k} SCENE={SCENE} />)}

      {/* ── THE SLOPE THAT DOES HOLD, FOR COMPARISON ─────────────────────── */}
      <Animated.View style={[styles.honest, honest]} pointerEvents="none">
        <Text style={styles.honestCap} numberOfLines={3}>A SLOPE WITH ITS REASONS</Text>
        {HON_T.map((t, k) => (
          <View key={k} style={[styles.honMark, { top: t - 244 }]}>
            <View style={styles.honDot} />
            {k < HON_T.length - 1 ? <View style={styles.honJoin} /> : null}
          </View>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One claim in the chain — and one of the Q1 targets. */
function Step({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { steps: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const s = STEPS[k];
  const on = answered && s.correct;
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.steps - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * -12 }] };
  });
  return (
    <Animated.View style={[styles.step, { left: STEP_X[k], top: STEP_T[k] }, st]}>
      <Target id={s.id} correct={s.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.stepInner,
          on && styles.pickRight,
          answered && picked === s.id && !s.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.stepText, on && styles.onInk]} numberOfLines={2}>{s.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

/** The gap where a reason should be. */
function Join({ k, SCENE }: { k: number; SCENE: { value: { joins: number } } }) {
  const st = useAnimatedStyle(() => ({ opacity: SCENE.value.joins }));
  return (
    <Animated.View style={[styles.join, { left: JOIN_X[k], top: JOIN_T[k] }, st]} pointerEvents="none">
      <Text style={styles.joinMark} numberOfLines={1}>?</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  step: { position: 'absolute', width: STEP_W, height: STEP_H },
  stepInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  stepText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.7, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  join: { position: 'absolute', width: 26, height: 14, alignItems: 'center', justifyContent: 'center' },
  joinMark: {
    fontFamily: 'Inter_700Bold', fontSize: 12, color: SOFT, includeFontPadding: false,
  },

  honest: { position: 'absolute', left: HON_L, top: 244, width: HON_W, height: 176 },
  honestCap: {
    position: 'absolute', left: 0, top: 0, width: HON_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10.8, letterSpacing: 1, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  honMark: { position: 'absolute', left: HON_W / 2 - 7, width: 14, height: 60, alignItems: 'center' },
  honDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: INK },
  honJoin: { position: 'absolute', top: 14, width: 2.5, height: 46, backgroundColor: INK },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the first step (244) to the ground line (500), with the honest
// slope's caption at 244 too. Band 226…512 = 286.
export function Logic13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic13Scene} band={[226, 512]} camera={CAM} />;
}
