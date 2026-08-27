import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic36Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWENTY-FOUR SQUARES, AND HOW MANY OF THEM YOU ACTUALLY LOOKED IN.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the ROOM is a 6×4 grid of 38×26 squares with 2 of gap, at x 128…368,
//   y 262…374. A searched square carries a 2-thick diagonal stroke corner to
//   corner — a mark, not a fill, so a searched square still reads as empty, which
//   is the whole point of the lesson.
// · the SEARCH ORDER is fixed and reading-order, so the grid fills predictably
//   under the thumb instead of flickering.
// · the two CASE CARDS are 116×54 at x 128 and x 252, y 392…446: "40 PEOPLE" and
//   "40,000 PEOPLE", each with "FOUND NOTHING" beneath. Identical result, and the
//   cards are drawn identically apart from the number, because the number is the
//   only difference that matters.
// · the figure stands at x 58 and walks to 130; crown ~397. The grid starts at
//   x 128, so he is beside the room rather than inside it.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
//
// EVERY SQUARE IS EMPTY IN EVERY VERSION. Nothing is ever found here, and nothing
// is ever drawn being found — the variable is coverage alone, and putting a
// hidden elephant somewhere would quietly turn the lesson into a different one.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CELL_W = 38;
const CELL_H = 26;
const GRID_X = 128;
const GRID_Y = 262;
const COLS = 6;
const ROWS = 4;
const CELLS = COLS * ROWS;

const CASE_X = [128, 252];
const CASE_Y = 392;
const CASE_W = 116;
const CASE_H = 54;
const CASE_TOP = ['40 PEOPLE', '40,000 PEOPLE'];
const CASE_ID = ['small', 'large'];

const CAP_T = 240;
const FIG_X = 58;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const ROOM = BEATS.map((b) => (b.room ? 1 : 0));
const DONE = BEATS.map((b) => b.done ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const CASES = BEATS.map((b) => (b.cases ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic36'));

export default function Logic36Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      roomOn: carry(cv, 1, n, ROOM[p], ROOM[n], tr),
      // The reader's thumb on the drag beat, the script's own track everywhere else.
      done: LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 2, n, DONE[p], DONE[n], tr),
      casesOn: carry(cv, 3, n, CASES[p], CASES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const roomStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.roomOn }));
  const casesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.casesOn }));

  const cells: number[] = [];
  for (let c = 0; c < CELLS; c++) cells.push(c);

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>WHERE YOU COULD HAVE LOOKED</Text>

      <Animated.View style={[StyleSheet.absoluteFill, roomStyle]} pointerEvents="none">
        {cells.map((c) => {
          const left = GRID_X + (c % COLS) * (CELL_W + 2);
          const top = GRID_Y + Math.floor(c / COLS) * (CELL_H + 2);
          return (
            <View key={c} style={{ position: 'absolute', left, top }}>
              <View style={styles.cell} />
              <Searched S={SCENE} index={c} />
            </View>
          );
        })}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, casesStyle]}>
        {CASE_X.map((cx, k) => (
          <Target
            key={cx}
            id={CASE_ID[k]}
            correct={k === 1}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.case, { left: cx }]}
          >
            <View
              style={[styles.caseBox, answered && picked === CASE_ID[k] && k === 0 && styles.caseWrong]}
              pointerEvents="none"
            />
            <Text style={styles.caseTop}>{CASE_TOP[k]}</Text>
            <Text style={styles.caseFoot}>FOUND NOTHING</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** The stroke through one searched square. Reading order, so the grid fills predictably. */
function Searched({ S, index }: { S: SharedValue<any>; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.done * CELLS - index) }));
  return <Animated.View style={[styles.mark, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 128, top: CAP_T, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  cell: {
    position: 'absolute', left: 0, top: 0, width: CELL_W, height: CELL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },
  // A stroke corner to corner: the square was looked in, and is still empty.
  mark: {
    position: 'absolute', left: 3, top: CELL_H / 2 - 1, width: CELL_W - 6, height: 2,
    backgroundColor: SOFT, transform: [{ rotate: '-34deg' }],
  },

  case: { position: 'absolute', top: CASE_Y, width: CASE_W, height: CASE_H },
  caseBox: {
    position: 'absolute', left: 0, top: 0, width: CASE_W, height: CASE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  caseWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  caseTop: {
    position: 'absolute', left: 0, top: 12, width: CASE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  caseFoot: {
    position: 'absolute', left: 0, top: 32, width: CASE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
});

export function Logic36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic36Scene} band={[234, 512]} camera={CAM} />;
}
