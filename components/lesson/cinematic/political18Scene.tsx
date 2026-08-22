import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political18Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// TWO LANES, TWO IDENTICAL BICYCLES, TWO VERY DIFFERENT DISTANCES (H64). What is
// equal is at the left-hand end of the picture and what matters is the length.
//
// · the two LANES are x 96…386, y 320…384 and y 400…464 — a 2-unit rule down the
//   middle of each, from the bicycle's rear wheel to the far end.
// · each BICYCLE is 42 wide at the head of its lane, x 96…138, centred on the
//   rule: two 18-wide wheels and a frame bar.
// · the RIDDEN part of each lane is an ink bar over the rule: the top rider
//   reaches x 366 and the bottom one x 168, and the two ends are what the reader
//   is being asked to compare (A1).
// · the three BOARDS are 116 × 44 at x 20 / 142 / 264, y 246…290, on stage only
//   for the graded beat.
// · the label sits at y 228…244, the highest ink; the lowest is the second lane
//   at y 464, thirty-six above the ground line.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   nineteen units clear of the lanes, and his crown is y 397 — between the two
//   of them and entirely to their left (D23).
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;
const BOARD_T = 246;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const LANE_L = 96;
const LANE_R = 386;
const LANE_MID = [352, 432];
const BIKE_W = 42;
const REACH = [366, 168];

const BOARDS = [
  { id: 'bikes', text: 'THE BICYCLES', correct: false },
  { id: 'far', text: 'HOW FAR THEY GET', correct: true },
  { id: 'effort', text: 'HOW HARD THEY TRY', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const LANES = BEATS.map((b) => b.lanes ?? 0);
const BIKES = BEATS.map((b) => b.bikes ?? 0);
const RIDE = BEATS.map((b) => b.ride ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political18'));

export default function Political18Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    // The ride is the slowest track here: the two distances only mean anything
    // while they are being travelled side by side.
    const roll = ease01(bt.value / 1.7);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      lanes: carry(cv, 0, n, LANES[p], LANES[n], grow),
      bikes: carry(cv, 1, n, BIKES[p], BIKES[n], grow),
      ride: carry(cv, 2, n, RIDE[p], RIDE[n], roll),
      boards: carry(cv, 3, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>SAME BICYCLE · SAME MONEY</Text>

      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      {LANE_MID.map((y, k) => <Lane key={k} k={k} SCENE={SCENE} />)}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One rider's lane: an identical bicycle, and however far it got them. */
function Lane({ k, SCENE }: { k: number; SCENE: { value: { lanes: number; bikes: number; ride: number } } }) {
  const y = LANE_MID[k];
  const lane = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.lanes - k) }));
  const bike = useAnimatedStyle(() => ({ opacity: SCENE.value.bikes }));
  const ridden = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.ride }] }));

  return (
    <Animated.View style={[styles.lane, lane]} pointerEvents="none">
      <View style={[styles.rule, { top: y - 1 }]} />
      <Animated.View
        style={[styles.ridden, { top: y - 3, width: REACH[k] - (LANE_L + BIKE_W) }, ridden]}
      />
      <View style={[styles.stop, { left: REACH[k] - 2, top: y - 12 }]} />

      <Animated.View style={[styles.bike, { top: y - 12 }, bike]}>
        <View style={[styles.wheel, { left: 0 }]} />
        <View style={[styles.wheel, { left: 24 }]} />
        <View style={styles.frame} />
      </Animated.View>
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
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  board: { position: 'absolute', top: BOARD_T, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  lane: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rule: { position: 'absolute', left: LANE_L, width: LANE_R - LANE_L, height: 2, backgroundColor: RULE },
  ridden: {
    position: 'absolute', left: LANE_L + BIKE_W, height: 6, borderRadius: 3,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  stop: { position: 'absolute', width: 4, height: 24, borderRadius: 2, backgroundColor: SOFT },

  bike: { position: 'absolute', left: LANE_L, width: BIKE_W, height: 24 },
  wheel: {
    position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, borderColor: INK,
  },
  frame: { position: 'absolute', left: 9, top: 11, width: 24, height: 2.5, backgroundColor: INK },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the lower lane (464). Band 222…512 = 290.
export function Political18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political18Scene} band={[222, 512]} camera={CAM} />;
}
