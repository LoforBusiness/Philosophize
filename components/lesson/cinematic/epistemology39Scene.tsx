import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A PANEL'S VOTES, RULED INTO A TABLE, AND THE ROW THAT COUNTING MADE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the TABLE runs x 140…386 and y 262…414. One name column of 54, then three
//   vote columns of 64 at x 194 · 258 · 322.
// · the HEAD is 26 tall and filled STONE, carrying CONTRACT · BROKEN · LIABLE.
//   Three JUDGE ROWS of 30 follow at y 288 · 318 · 348, then a rule at y 378 and
//   the MAJORITY row, 32 tall and also STONE, at y 382.
// · EVERY CELL IS THE WORD YES OR NO, at 8.6 INK. There is no legend to learn and
//   no tick to decode, and a reader who can read three rows has the result.
// · the judges arrive with `votes` — one row per third — and the majority row
//   fills column by column with `tally`, so the bottom line is watched being
//   made rather than found already made.
// · the three MAJORITY CELLS are the answer targets, each 64×32, and each holds
//   its own word (E39): what lifts when the reader taps is the cell they chose.
// · THE VERDICT CELL HAS TWO WORDS STACKED IN IT, NO over YES, cross-fading on
//   `flip`. The drag turns the bottom of the table over under the reader's thumb,
//   which is exactly what the premise-first repair does to a real panel.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of
//   the table's 140.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const T_X = 140;
const T_W = 246;
const NAME_W = 54;
const COL_W = 64;
const COL_X = [T_X + NAME_W, T_X + NAME_W + COL_W, T_X + NAME_W + 2 * COL_W];
const COL_CAP = ['CONTRACT', 'BROKEN', 'LIABLE'];

const HEAD_Y = 262;
const HEAD_H = 26;
const ROW_H = 30;
const ROW_Y = [288, 318, 348];
const ROW_CAP = ['JUDGE A', 'JUDGE B', 'JUDGE C'];
const RULE_Y = 378;
const MAJ_Y = 382;
const MAJ_H = 32;

/** Each judge's two findings and the verdict that follows from them. */
const VOTE = [
  ['YES', 'YES', 'YES'],
  ['YES', 'NO', 'NO'],
  ['NO', 'YES', 'NO'],
];
/** What counting each column gives — and the third one is the paradox. */
const MAJ = ['YES', 'YES', 'NO'];
const MAJ_ID = ['contract', 'broken', 'liable'];

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const GRID = BEATS.map((b) => (b.grid ? 1 : 0));
const VOTES = BEATS.map((b) => b.votes ?? 0);
const TALLY = BEATS.map((b) => b.tally ?? 0);
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology39'));

export default function Epistemology39Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      gridOn: carry(cv, 1, n, GRID[p], GRID[n], tr),
      votes: carry(cv, 2, n, VOTES[p], VOTES[n], tr),
      tally: carry(cv, 3, n, TALLY[p], TALLY[n], tr),
      // R7c — the rail turns the bottom row over. `dragPos` runs from counting the
      // verdict to following the reasons, and the verdict cell reads NO at one end
      // and YES at the other, which is the repair and its bill in one cell.
      flip: carry(cv, 4, n, 0, reacting ? dragPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const gridStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gridOn }));
  const railStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flip }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE CASE, TWO FINDINGS, THREE JUDGES</Text>

      <Animated.View style={[StyleSheet.absoluteFill, gridStyle]}>
        <View style={styles.frame} pointerEvents="none" />
        <View style={styles.head} pointerEvents="none" />
        {COL_CAP.map((c, k) => (
          <Text key={c} style={[styles.headText, { left: COL_X[k] }]} pointerEvents="none">{c}</Text>
        ))}

        {ROW_Y.map((ry, r) => (
          <View key={ry} pointerEvents="none">
            <Text style={[styles.rowName, { top: ry + 11 }]}>{ROW_CAP[r]}</Text>
            {VOTE[r].map((v, c) => <Cell key={c} S={SCENE} row={r} col={c} vote={v} />)}
          </View>
        ))}

        <View style={styles.midRule} pointerEvents="none" />
        <View style={styles.maj} pointerEvents="none" />
        <Text style={[styles.rowName, { top: MAJ_Y + 12 }]} pointerEvents="none">MAJORITY</Text>
        {/* The two premise columns carry a rail once the reasons are in charge. */}
        <Animated.View style={[styles.reasonRail, railStyle]} pointerEvents="none" />

        {MAJ_ID.map((id, c) => (
          <Target
            key={id}
            id={id}
            correct={c === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.majHit, { left: COL_X[c] }]}
            sealAt="tr"
          >
            <MajCell S={SCENE} col={c} marked={answered && c === 2} />
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One judge's vote in one column, arriving with their row. */
function Cell({ S, row, col, vote }: { S: SharedValue<any>; row: number; col: number; vote: string }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.votes * 3 - row) }));
  return (
    <Animated.View style={[styles.cell, { left: COL_X[col], top: ROW_Y[row] }, st]}>
      <Text style={styles.cellText}>{vote}</Text>
    </Animated.View>
  );
}

/**
 * One counted column. The verdict cell carries BOTH words, stacked and
 * cross-faded, because it is the one reading the drag is allowed to change.
 */
function MajCell({ S, col, marked }: { S: SharedValue<any>; col: number; marked: boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tally * 3 - col) }));
  // Declared for every column and used only by the verdict, because a hook count
  // that changes between renders is rule 1 of the section this file lives in.
  const noStyle = useAnimatedStyle(() => ({ opacity: 1 - S.value.flip }));
  const yesStyle = useAnimatedStyle(() => ({ opacity: S.value.flip }));
  return (
    <Animated.View style={[styles.majCell, marked && styles.majMarked, st]} pointerEvents="none">
      {col === 2 ? (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, noStyle]}><Text style={styles.majText}>NO</Text></Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, yesStyle]}><Text style={styles.majText}>YES</Text></Animated.View>
        </>
      ) : (
        <Text style={styles.majText}>{MAJ[col]}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: T_X, top: CAP_T, width: T_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  frame: {
    position: 'absolute', left: T_X, top: HEAD_Y, width: T_W, height: MAJ_Y + MAJ_H - HEAD_Y,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  head: {
    position: 'absolute', left: T_X, top: HEAD_Y, width: T_W, height: HEAD_H,
    borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: STONE,
  },
  headText: {
    position: 'absolute', top: HEAD_Y + 9, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  rowName: {
    position: 'absolute', left: T_X, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  cell: { position: 'absolute', width: COL_W, height: ROW_H },
  cellText: {
    position: 'absolute', left: 0, top: 11, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  midRule: { position: 'absolute', left: T_X, top: RULE_Y, width: T_W, height: 2, backgroundColor: INK },
  maj: {
    position: 'absolute', left: T_X, top: MAJ_Y, width: T_W, height: MAJ_H,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: STONE,
  },
  reasonRail: {
    position: 'absolute', left: COL_X[0], top: MAJ_Y + MAJ_H - 4, width: COL_W * 2, height: 3,
    backgroundColor: INK,
  },

  majHit: { position: 'absolute', top: MAJ_Y, width: COL_W, height: MAJ_H },
  majCell: {
    position: 'absolute', left: 0, top: 0, width: COL_W, height: MAJ_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3,
  },
  majMarked: { borderWidth: 2.5, borderColor: INK },
  majText: {
    position: 'absolute', left: 0, top: 11, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
});

export function Epistemology39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology39Scene} band={[232, 512]} camera={CAM} />;
}
