import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// FACTS THAT NEVER MOVE, AND A FRAME THAT DOES (H64). Not one dot changes position
// across the whole lesson; a second frame is simply drawn somewhere else over them.
//
// · the FACT FIELD is fifteen dots 13 across: five columns on a 52 pitch from
//   x 112, three rows at y 322 / 372 / 422. Its right edge is x 333.
// · the OLD frame is x 96…290, y 306…392; the NEW frame is x 160…380, y 352…456.
//   They overlap deliberately — a revolution is not a move to a different subject.
// · the three ANOMALIES are crosses 14 across at (346, 316), (360, 386) and
//   (344, 440) — all outside the old frame's right edge at 290, which is what
//   makes them anomalies rather than facts (A1).
// · the three BOARDS are 116 × 44 at x 20 / 142 / 264, y 246…290, on stage only
//   for the graded beat.
// · the label sits at y 228…244, the highest ink; the lowest is the new frame at
//   y 456, forty-four above the ground line.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77 and
//   his crown is y 397, so he passes to the left of the field, never through it.
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;
const BOARD_T = 246;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const DOT = 13;
const COL_L = 112;
const COL_PITCH = 52;
const ROW_Y = [322, 372, 422];
const COLS = 5;

const ODD_AT = [[346, 316], [360, 386], [344, 440]];

const BOARDS = [
  { id: 'facts', text: 'THE FACTS', correct: false },
  { id: 'frame', text: 'THE FRAME', correct: true },
  { id: 'tools', text: 'THE INSTRUMENTS', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const FACTS = BEATS.map((b) => b.facts ?? 0);
const FRAME = BEATS.map((b) => b.frame ?? 0);
const ODD = BEATS.map((b) => b.odd ?? 0);
const SHIFT = BEATS.map((b) => b.shift ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology17'));

export default function Epistemology17Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const slow = ease01(bt.value / 1.4);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      facts: carry(cv, 0, n, FACTS[p], FACTS[n], grow),
      frame: carry(cv, 1, n, FRAME[p], FRAME[n], grow),
      odd: carry(cv, 2, n, ODD[p], ODD[n], slow),
      shift: carry(cv, 3, n, SHIFT[p], SHIFT[n], slow),
      boards: carry(cv, 4, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const facts = useAnimatedStyle(() => ({ opacity: SCENE.value.facts }));
  // The old frame fades as the new one is drawn, so for a moment both are up and
  // the reader can see they enclose the same dots.
  const oldFrame = useAnimatedStyle(() => ({ opacity: SCENE.value.frame * (1 - 0.65 * SCENE.value.shift) }));
  const newFrame = useAnimatedStyle(() => ({
    opacity: SCENE.value.shift,
    transform: [{ scale: 0.92 + 0.08 * SCENE.value.shift }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>THE FACTS DO NOT MOVE</Text>

      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <Animated.View style={[styles.oldFrame, oldFrame]} pointerEvents="none" />
      <Animated.View style={[styles.newFrame, newFrame]} pointerEvents="none" />

      <Animated.View style={[styles.field, facts]} pointerEvents="none">
        {ROW_Y.map((y, r) => (
          Array.from({ length: COLS }, (_, c) => (
            <View key={`${r}-${c}`} style={[styles.dot, { left: COL_L + c * COL_PITCH, top: y }]} />
          ))
        ))}
      </Animated.View>

      {ODD_AT.map((at, k) => <Odd key={k} k={k} SCENE={SCENE} />)}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One thing the frame cannot account for. */
function Odd({ k, SCENE }: { k: number; SCENE: { value: { odd: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.odd - k);
    return { opacity: a, transform: [{ scale: 0.6 + 0.4 * a }] };
  });
  const [x, y] = ODD_AT[k];
  return (
    <Animated.View style={[styles.odd, { left: x, top: y }, st]} pointerEvents="none">
      <View style={styles.oddBar} />
      <View style={[styles.oddBar, styles.oddBarB]} />
    </Animated.View>
  );
}

/** One answer board — a Q1 target. */
function Board({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { boards: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const b = BOARDS[k];
  const on = answered && b.correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value.boards;
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  return (
    <Animated.View style={[styles.board, { left: BOARD_X[k] }, st]}>
      <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.boardInner,
          on && styles.pickRight,
          answered && picked === b.id && !b.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.boardText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  board: { position: 'absolute', top: BOARD_T, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  field: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  dot: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: INK },

  oldFrame: {
    position: 'absolute', left: 96, top: 306, width: 194, height: 86,
    borderWidth: 2, borderColor: SOFT, borderRadius: 4,
  },
  newFrame: {
    position: 'absolute', left: 160, top: 352, width: 220, height: 104,
    borderWidth: 3, borderColor: INK, borderRadius: 4,
  },

  odd: { position: 'absolute', width: 14, height: 14 },
  oddBar: {
    position: 'absolute', left: -1, top: 6, width: 16, height: 2.5,
    backgroundColor: SOFT, transform: [{ rotate: '45deg' }],
  },
  oddBarB: { transform: [{ rotate: '-45deg' }] },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the new frame (456). Band 222…512 = 290.
export function Epistemology17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology17Scene} band={[222, 512]} camera={CAM} />;
}
