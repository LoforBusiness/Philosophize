import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics37Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO SYSTEMS, AND ONLY ONE OF THEM HAS ANYTHING WRITTEN ABOVE IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · a SYSTEM is a score stave above a performance line: five 1-thick rules 6
//   apart, and a heavier 2-thick performance rule 34 below the lowest.
//   Composed system at y 264 (stave) / 328 (performance); improvised system at
//   y 366 / 430. Both run x 136…372.
// · eight NOTES per row: 9-wide discs at x 150 stepping 28. A composed note sits
//   on the stave AND on the performance line, joined by a 1-thick stem, because
//   the performance is of something. An improvised note sits only on the
//   performance line, and its stem goes nowhere.
// · the TRANSCRIBE MOVE lifts each improvised note from its performance line up
//   to the empty stave above it — a 64-unit rise, the same gap the composed
//   system already shows, so the two end up drawn identically.
// · the ROW LABELS sit left of each system at x 136, y 250 and y 352.
// · the figure stands at x 54 and walks to 126; crown ~397, left of x 136.
//
// Ink runs y 250 (the first label) … y 500 (ground). BAND 244…512 = 268 puts the
// figure at exactly 38%, so the caption row is at 236 and the BAND IS 230…512 =
// 282 — 37%, with margin (H58).
//
// THE IMPROVISED NOTES ARRIVE ONE AT A TIME and the composed ones are there from
// the first frame. That difference is the lesson, and it is the only difference
// between the two rows until the reader transcribes.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SYS_X = 136;
const SYS_W = 236;
const STAVE_Y = [264, 366];
const PERF_Y = [328, 430];
const NOTE_X = [150, 178, 206, 234, 262, 290, 318, 346];
const LIFT = 64;

const CAP_T = 236;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const STAVES = BEATS.map((b) => (b.staves ? 1 : 0));
const SCORE = BEATS.map((b) => (b.score ? 1 : 0));
const PLAYED = BEATS.map((b) => b.played ?? 0);
const LIFTED = BEATS.map((b) => b.lift ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics37'));

export default function Aesthetics37Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
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

    // The solo is PLAYED on the beat that plays it — arriving note by note on the
    // beat clock — and held after, so it never un-plays itself between beats.
    const arriving = PLAYED[n] > 0 && PLAYED[p] === 0;
    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      t,
      stavesOn: carry(cv, 1, n, STAVES[p], STAVES[n], tr),
      scoreOn: carry(cv, 2, n, SCORE[p], SCORE[n], tr),
      played: arriving ? ease01((bt.value - 0.2) / 1.6) : carry(cv, 3, n, PLAYED[p], PLAYED[n], tr),
      // Reader's thumb on the drag beat, the script's own track everywhere else.
      lift: LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 4, n, LIFTED[p], LIFTED[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const stavesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stavesOn }));
  const scoreStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.scoreOn }));

  return (
    <View style={styles.scene}>
      <Text style={[styles.rowCap, { top: 250 }]}>WRITTEN FIRST</Text>
      <Text style={[styles.rowCap, { top: 352 }]}>MADE UP TONIGHT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, stavesStyle]}>
        {/* EACH STAVE RIDES WITH ITS OWN TARGET (E39). */}
        {[0, 1].map((r) => (
          <AnswerLift key={r} id={r === 0 ? 'written' : 'solo'} picked={picked} correct={r === 1}>
            {[0, 1, 2, 3, 4].map((l) => (
              <View key={l} style={[styles.staveLine, { top: STAVE_Y[r] + l * 6 }]} />
            ))}
            <View style={[styles.perfLine, { top: PERF_Y[r] }]} />
          </AnswerLift>
        ))}

        <Animated.View style={[StyleSheet.absoluteFill, scoreStyle]} pointerEvents="none">
          {NOTE_X.map((nx) => (
            <View key={nx}>
              <View style={[styles.stem, { left: nx + 4, top: STAVE_Y[0] + 12, height: PERF_Y[0] - STAVE_Y[0] - 12 }]} />
              <View style={[styles.note, { left: nx, top: STAVE_Y[0] + 6 }]} />
              <View style={[styles.note, { left: nx, top: PERF_Y[0] - 4 }]} />
            </View>
          ))}
        </Animated.View>

        {/* The solo notes ride with the SOLO answer (E39). */}
        <AnswerLift id={'solo'} picked={picked} correct={true}>
          {NOTE_X.map((nx, k) => <Solo key={nx} S={SCENE} left={nx} index={k} />)}
        </AnswerLift>

        {[0, 1].map((r) => (
          <Target
            key={r}
            id={r === 0 ? 'written' : 'solo'}
            correct={r === 1}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: STAVE_Y[r] - 8 }]}
          >
            <View
              style={[styles.hitBox, answered && picked === 'written' && r === 0 && styles.hitWrong]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One improvised note: it arrives on the performance line, then can be lifted up. */
function Solo({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.played * 8 - index),
    transform: [{ translateY: -LIFT * S.value.lift }],
  }));
  // The stem grows as the note rises: nothing stood behind it until the reader
  // put something there.
  const stemStyle = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.played * 8 - index) * S.value.lift,
    height: LIFT * S.value.lift,
  }));
  return (
    <>
      <Animated.View style={[styles.stem, { left: left + 4, top: PERF_Y[1] - LIFT }, stemStyle]} pointerEvents="none" />
      <Animated.View style={[styles.note, { left, top: PERF_Y[1] - 4 }, st]} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  rowCap: {
    position: 'absolute', left: SYS_X, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  staveLine: { position: 'absolute', left: SYS_X, width: SYS_W, height: 1, backgroundColor: SOFT },
  perfLine: { position: 'absolute', left: SYS_X, width: SYS_W, height: 2, backgroundColor: INK },
  note: { position: 'absolute', width: 9, height: 9, borderRadius: 4.5, backgroundColor: INK },
  stem: { position: 'absolute', width: 1.5, backgroundColor: SOFT },

  hit: { position: 'absolute', left: SYS_X - 6, width: SYS_W + 12, height: 84 },
  hitBox: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 4 },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Aesthetics37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics37Scene} band={[230, 512]} camera={CAM} />;
}
