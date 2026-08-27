import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology15Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A GRID OF FOUR BOXES, ONE OF WHICH IS SUPPOSED TO BE EMPTY (H64). The cells are
// the Q1 targets, so the answer is a position rather than a piece of vocabulary.
//
// · the GRID is x 96…312, y 268…484 — two columns 104 wide on a 112 pitch, two
//   rows 96 tall on a 120 pitch. Cells: x 96 / 208, y 268 / 388.
// · the COLUMN headings sit above their columns at y 246…264. The ROW headings sit
//   to the RIGHT of the grid at x 320…390, centred on each row — on the right
//   because the figure has the left, and a legend column at x 20 would have run
//   straight through him.
// · the figure stands at x = 44 facing right. Widest ink is a fist at x ≈ 77,
//   nineteen clear of the grid, and his crown is y 397 — level with the gap
//   between the two rows and well left of both (D23).
// · highest ink is a column heading at y 246; lowest is the grid at y 484.
//
// Band 240…512 = 272 would put one figure at 38% — exactly check:scale's line —
// so it runs 232…512 = 280 instead (37%).

const FIG_X = 44;

const HEAD_T = 246;
const COL_X = [96, 208];
const ROW_Y = [268, 388];
const CELL_W = 104;
const CELL_H = 96;

const ROWH_L = 320;
const ROWH_W = 70;

const CELLS = [
  { id: 'ana-post', col: 0, row: 1, note: '', correct: false },
  { id: 'syn-post', col: 1, row: 1, note: 'THE CHAIR IS OVER THERE', correct: false },
  { id: 'ana-prior', col: 0, row: 0, note: 'BACHELORS ARE UNMARRIED', correct: false },
  { id: 'syn-prior', col: 1, row: 0, note: '', correct: true },
];

const G = BEATS.map((b) => b.g ?? 0);
const CELLN = BEATS.map((b) => b.cells ?? 0);
const DEALT = BEATS.map((b) => b.dealt ?? 0);
const SUM = BEATS.map((b) => b.sum ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology15'));

export default function Epistemology15Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
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
    const deal = ease01(bt.value / 1.2);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      cells: carry(cv, 0, n, CELLN[p], CELLN[n], grow),
      dealt: carry(cv, 1, n, DEALT[p], DEALT[n], deal),
      // R7b — the seam puts twelve in the fourth cell. Slide toward SOMETHING
      // GENUINELY NEW and the sum arrives from outside the row; slide back and it
      // sinks into what was already there.
      sum: carry(cv, 2, n, SUM[p], reacting ? 1 - dragPos.value : SUM[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The Q1 reveal rides the same track as the cells: they are already on stage, so
  // becoming answerable is a state of theirs and not a new prop (C20c).
  const pickable = live;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={[styles.colHead, { left: COL_X[0] }]} numberOfLines={2}>UNPACKS A{'\n'}DEFINITION</Text>
      <Text style={[styles.colHead, { left: COL_X[1] }]} numberOfLines={2}>ADDS{'\n'}SOMETHING</Text>
      <Text style={[styles.rowHead, { top: ROW_Y[0] + 30 }]} numberOfLines={3}>BEFORE YOU LOOK</Text>
      <Text style={[styles.rowHead, { top: ROW_Y[1] + 30 }]} numberOfLines={3}>ONLY AFTER YOU LOOK</Text>

      {CELLS.map((c, k) => (
        <Cell key={c.id} k={k} SCENE={SCENE} live={pickable} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One box of the grid — and one of the Q1 targets. */
function Cell({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { cells: number; dealt: number; sum: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const c = CELLS[k];
  const on = answered && c.correct;
  const box = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.cells - k);
    return { opacity: a, transform: [{ scale: 0.94 + 0.06 * a }] };
  });
  // The three easy examples deal in order; the fourth cell instead receives the sum.
  const note = useAnimatedStyle(() => ({
    opacity: c.note ? clamp01(SCENE.value.dealt - CELLS.slice(0, k).filter((x) => x.note).length) : 0,
  }));
  const sum = useAnimatedStyle(() => ({ opacity: c.correct ? SCENE.value.sum : 0 }));

  return (
    <Animated.View
      style={[styles.cell, { left: COL_X[c.col], top: ROW_Y[c.row] }, box]}
    >
      <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.cellInner,
          on && styles.pickRight,
          answered && picked === c.id && !c.correct && styles.pickWrong,
        ]}>
          {c.note ? (
            <Animated.Text style={[styles.note, note]} numberOfLines={3}>{c.note}</Animated.Text>
          ) : null}
          {c.correct ? (
            <Animated.Text style={[styles.sum, on && styles.onInk, sum]} numberOfLines={1}>7 + 5 = 12</Animated.Text>
          ) : null}
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

  colHead: {
    position: 'absolute', top: HEAD_T, width: CELL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10.8, letterSpacing: 1.1, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  rowHead: {
    position: 'absolute', left: ROWH_L, width: ROWH_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10.8, letterSpacing: 1.1, color: SOFT,
    textAlign: 'left', includeFontPadding: false, backgroundColor: STONE },

  cell: { position: 'absolute', width: CELL_W, height: CELL_H },
  cellInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  note: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.8, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  sum: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the column headings (246) to the bottom row of the grid (484).
// Band 232…512 = 280 — see the header for why it is not tighter.
export function Epistemology15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology15Scene} band={[232, 512]} camera={CAM} />;
}
