import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A COMPLETE WALL, A DOOR, AND ONE CARD ON THE OTHER SIDE OF IT (H64). The wall
// never gains or loses a tick: it is finished before the lesson opens, and the
// card is simply not on it.
//
// · the WALL is x 90…240, y 306…470 — 150 × 164, ruled into 42 ticks: six columns
//   18 wide on a 24 pitch from x 100, seven rows 8 tall on a 22 pitch from y 320.
// · the DOOR is x 252…300, y 340…500, hinged on its left; the leaf swings back
//   into the room as it opens, so nothing of it crosses the wall.
// · the CARD is x 312…392, y 330…404 — 80 × 74, outside the door and outside the
//   wall on every axis, which is the whole claim (A1).
// · the three BOARDS are 116 × 44 at x 20 / 142 / 264, y 246…290, on stage only
//   for the graded beat.
// · the label sits at y 228…244, the highest ink; the lowest is the door at 500.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   thirteen units clear of the wall, and his crown is y 397 — inside the wall's
//   vertical span but entirely to its left (D23).
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 44;

const LABEL_T = 228;
const BOARD_T = 246;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const WALL_L = 90;
const WALL_W = 150;
const WALL_T = 306;
const WALL_H = 164;
const TICK_COLS = 6;
const TICK_ROWS = 7;

const DOOR_L = 252;
const DOOR_W = 48;
const DOOR_T = 340;

const CARD_L = 312;
const CARD_W = 80;
const CARD_T = 330;
const CARD_H = 74;

const BOARDS = [
  { id: 'physical', text: 'A NEW PHYSICAL FACT', correct: false },
  { id: 'like', text: 'WHAT RED IS LIKE', correct: true },
  { id: 'nothing', text: 'NOTHING AT ALL', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const WALL = BEATS.map((b) => b.wall ?? 0);
const DOOR = BEATS.map((b) => b.door ?? 0);
const CARD = BEATS.map((b) => b.card ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics17'));

export default function Metaphysics17Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
    const swing = ease01(bt.value / 1.3);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      wall: carry(cv, 0, n, WALL[p], WALL[n], grow),
      door: carry(cv, 1, n, DOOR[p], DOOR[n], swing),
      card: carry(cv, 2, n, CARD[p], CARD[n], grow),
      boards: carry(cv, 3, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const wall = useAnimatedStyle(() => ({ opacity: SCENE.value.wall }));
  // The leaf swings inward on its own left edge, so the opening it leaves is real
  // and the leaf never crosses the wall beside it.
  const door = useAnimatedStyle(() => ({
    transform: [{ perspective: 600 }, { rotateY: `${-72 * SCENE.value.door}deg` }],
  }));
  const card = useAnimatedStyle(() => ({
    opacity: SCENE.value.card,
    transform: [{ translateX: (1 - SCENE.value.card) * -14 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>EVERY PHYSICAL FACT ABOUT COLOUR</Text>

      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      {/* ── THE WALL, WHICH NEVER CHANGES ────────────────────────────────── */}
      <Animated.View style={[styles.wall, wall]} pointerEvents="none">
        {Array.from({ length: TICK_ROWS }, (_, r) => (
          Array.from({ length: TICK_COLS }, (_, c) => (
            <View key={`${r}-${c}`} style={[styles.tick, { left: 10 + c * 24, top: 14 + r * 22 }]} />
          ))
        ))}
      </Animated.View>

      {/* ── THE DOOR ─────────────────────────────────────────────────────── */}
      <View style={styles.jamb} pointerEvents="none" />
      <Animated.View style={[styles.door, door]} pointerEvents="none">
        <View style={styles.knob} />
      </Animated.View>

      {/* ── AND WHAT IS OUTSIDE IT ───────────────────────────────────────── */}
      <Animated.View style={[styles.card, card]} pointerEvents="none">
        <Text style={styles.cardText} numberOfLines={3}>WHAT RED IS LIKE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
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

  wall: {
    position: 'absolute', left: WALL_L, top: WALL_T, width: WALL_W, height: WALL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  tick: { position: 'absolute', width: 18, height: 8, borderRadius: 2, backgroundColor: SOFT },

  jamb: {
    position: 'absolute', left: DOOR_L - 3, top: DOOR_T - 3, width: DOOR_W + 6, height: 500 - DOOR_T + 3,
    borderWidth: 2, borderColor: SOFT, borderBottomWidth: 0,
  },
  door: {
    position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: 500 - DOOR_T,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
    transformOrigin: '0% 50%',
  },
  knob: {
    position: 'absolute', right: 6, top: 70, width: 7, height: 7, borderRadius: 4, backgroundColor: INK,
  },

  card: {
    position: 'absolute', left: CARD_L, top: CARD_T, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.9, color: PAPER,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the ground line (500). Band 222…512 = 290.
export function Metaphysics17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics17Scene} band={[222, 512]} camera={CAM} />;
}
