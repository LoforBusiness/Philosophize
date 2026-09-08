import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO MILLS, THE SAME THREE STEPS IN BOTH, AND ONE TRAY THAT IS ABSURD.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · a MILL is one column 116 wide. Two of them, at x 140 and x 270, so the pair
//   runs 140…386 with 14 between and 14 of margin at the stage's right edge.
// · each mill, top to bottom: a HOPPER 116×24 at y 250…274 holding the word that
//   goes in; a 20-wide CHUTE 274…282; a FRAME 116×92 at y 282…374 filled STONE,
//   holding three STEP plates 100×24 at y 288, 318 and 348; a second chute
//   374…382; and a TRAY 116×30 at y 382…412 where the verdict lands.
// · THE STEPS ARE THE SAME THREE STRINGS IN BOTH MILLS. That is not economy, it
//   is the lesson: Gaunilo changed the hopper and nothing else, so a reader who
//   compares the two columns can see for themselves that the frames are equal.
//   Only HOP and TRAY differ, and they are the only two arrays with two entries.
// · the GRAIN is a 12-disc that falls the 134 units from hopper to tray as a run
//   turns, and the three steps arrive under it one at a time (`run * 4 - k`), so
//   the argument is watched being run rather than found already run.
// · the three VERDICT plates are 80×40 at y 424…464, x 140 · 223 · 306 — the
//   mills' own column, so they read as the output of what is above them.
// · the BLAME BRACKETS are 4-wide bars at x MILL_X − 7. The upper one spans the
//   hopper (250…274), the lower one the frame (282…374), and the split's seam
//   cross-fades between them: drag toward IN THE SHAPE and the mark slides off
//   the word and onto the steps. One picture, one gesture, the whole question.
// · the figure stands at x 60 and walks to 100; his right edge is 126, which
//   clears the first mill's 140 by 14.
//
// Ink runs y 228 (the caption) … y 500 (ground). BAND 226…512 = 286 — a 103-unit
// figure at 36%, inside H58's 38%, and under H59's 280-unit width-limited floor
// by little enough to cost nothing on screen.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const MILL_X = [140, 270];
const MILL_W = 116;

const HOP_Y = 250;
const HOP_H = 24;
const FRAME_Y = 282;
const FRAME_H = 92;
const TRAY_Y = 382;
const TRAY_H = 30;

const STEP_Y = [288, 318, 348];
const STEP_W = 100;
const STEP_H = 24;
/** The three steps, IDENTICAL in both mills — see the header. */
const STEP = ['1 THE GREATEST', '2 REAL IS GREATER', '3 SO IT IS REAL'];

/** What goes in, and what comes out. The only two things that differ. */
const HOP = ['GOD', 'AN ISLAND'];
const TRAY = ['GOD EXISTS', 'THE ISLAND EXISTS'];

const GRAIN = 12;
const GRAIN_TOP = HOP_Y + (HOP_H - GRAIN) / 2;
const GRAIN_FALL = TRAY_Y + (TRAY_H - GRAIN) / 2 - GRAIN_TOP;

const VER_Y = 424;
const VER_W = 80;
const VER_H = 40;
const VER_X = [140, 223, 306];
// TWO LINES, TWO <Text>s. A newline inside one string measures as ONE line to
// `check:fits`, which is the offline instrument that has to be able to see this.
const VER_CAP = [['THE FORM', 'IS FAULTY'], ['THE ISLAND', 'IS REAL'], ['NO FAIR', 'COMPARISON']];
const VER_ID = ['form', 'island', 'refuse'];

const CAP_T = 228;
const FIG_X = 60;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const MILL = BEATS.map((b) => (b.mill ? 1 : 0));
const RUN_A = BEATS.map((b) => b.runA ?? 0);
const TWIN = BEATS.map((b) => (b.twin ? 1 : 0));
const RUN_B = BEATS.map((b) => b.runB ?? 0);
const VERDICTS = BEATS.map((b) => (b.verdicts ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about, and so `check:echo` is never charged for
// a channel that is really a fact about the question.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic38'));

export default function Logic38Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(8);
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
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      millOn: carry(cv, 1, n, MILL[p], MILL[n], tr),
      runA: carry(cv, 2, n, RUN_A[p], RUN_A[n], tr),
      twinOn: carry(cv, 3, n, TWIN[p], TWIN[n], tr),
      runB: carry(cv, 4, n, RUN_B[p], RUN_B[n], tr),
      verdictsOn: carry(cv, 5, n, VERDICTS[p], VERDICTS[n], tr),
      // The brackets exist only while the seam is being set, so their presence is
      // the question's own fact rather than a channel anybody could forget to
      // clear on the beat after.
      markOn: carry(cv, 6, n, REACT[p], REACT[n], tr),
      // R7c — the seam IS the mark's position. `dragPos` is the LEFT side's share
      // (R7b), the left side is IN THE SHAPE, so dragging right moves the bracket
      // off the hopper and onto the three steps.
      shapeShare: carry(cv, 7, n, 0, reacting ? dragPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const verdictStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdictsOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME MILL, FED TWICE</Text>

      <Mill S={SCENE} side={0} />
      <Mill S={SCENE} side={1} />

      <Animated.View style={[StyleSheet.absoluteFill, verdictStyle]}>
        {VER_X.map((vx, k) => (
          <Target
            key={vx}
            id={VER_ID[k]}
            correct={k === 0}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.verHit, { left: vx }]}
          >
            <View
              style={[
                styles.verBox,
                answered && picked === VER_ID[k] && k !== 0 && styles.verWrong,
                answered && k === 0 && styles.verRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.verText, answered && k === 0 && styles.verTextOn]}>{VER_CAP[k][0]}</Text>
              <Text style={[styles.verText, styles.verText2, answered && k === 0 && styles.verTextOn]}>{VER_CAP[k][1]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One mill: hopper, three steps in a frame, tray, and the grain falling through.
 *
 * Both sides draw from the same styles by construction, so they cannot drift
 * apart — which is the one thing this picture has to be able to promise.
 */
function Mill({ S, side }: { S: SharedValue<any>; side: number }) {
  const left = MILL_X[side];
  const mid = left + MILL_W / 2;

  const on = useAnimatedStyle(() => ({ opacity: side === 0 ? S.value.millOn : S.value.twinOn }));
  const grainStyle = useAnimatedStyle(() => {
    const r = side === 0 ? S.value.runA : S.value.runB;
    return {
      opacity: clamp01(r * 8) - clamp01(r * 8 - 7),
      transform: [{ translateY: GRAIN_FALL * r }],
    };
  });
  const trayStyle = useAnimatedStyle(() => ({
    opacity: clamp01((side === 0 ? S.value.runA : S.value.runB) * 4 - 3),
  }));
  const hopMark = useAnimatedStyle(() => ({ opacity: S.value.markOn * (1 - S.value.shapeShare) }));
  const frameMark = useAnimatedStyle(() => ({ opacity: S.value.markOn * S.value.shapeShare }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, on]} pointerEvents="none">
      <View style={[styles.hopper, { left }]} />
      <Text style={[styles.hopText, { left }]}>{HOP[side]}</Text>
      <View style={[styles.chute, { left: mid - 10, top: HOP_Y + HOP_H }]} />

      <View style={[styles.frame, { left }]} />
      {STEP_Y.map((sy, k) => (
        <Step key={sy} S={S} side={side} index={k} left={left + (MILL_W - STEP_W) / 2} top={sy} />
      ))}

      <View style={[styles.chute, { left: mid - 10, top: FRAME_Y + FRAME_H }]} />
      <View style={[styles.tray, { left }]} />
      <Animated.View style={trayStyle}>
        <Text style={[styles.trayText, { left }]}>{TRAY[side]}</Text>
      </Animated.View>

      <Animated.View style={[styles.grain, { left: mid - GRAIN / 2 }, grainStyle]} />

      <Animated.View style={[styles.bracket, { left: left - 7, top: HOP_Y, height: HOP_H }, hopMark]} />
      <Animated.View style={[styles.bracket, { left: left - 7, top: FRAME_Y, height: FRAME_H }, frameMark]} />
    </Animated.View>
  );
}

/** One step of the argument, arriving as the run reaches it. */
function Step({ S, side, index, left, top }: { S: SharedValue<any>; side: number; index: number; left: number; top: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: clamp01((side === 0 ? S.value.runA : S.value.runB) * 4 - index),
  }));
  return (
    <Animated.View style={[styles.step, { left, top }, st]}>
      <Text style={styles.stepText}>{STEP[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  hopper: {
    position: 'absolute', top: HOP_Y, width: MILL_W, height: HOP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  hopText: {
    position: 'absolute', top: HOP_Y + 7, width: MILL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  chute: { position: 'absolute', width: 20, height: 8, backgroundColor: STONE },

  frame: {
    position: 'absolute', top: FRAME_Y, width: MILL_W, height: FRAME_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  step: {
    position: 'absolute', width: STEP_W, height: STEP_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  stepText: {
    position: 'absolute', left: 0, top: 7, width: STEP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  tray: {
    position: 'absolute', top: TRAY_Y, width: MILL_W, height: TRAY_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  trayText: {
    position: 'absolute', top: TRAY_Y + 10, width: MILL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },

  grain: {
    position: 'absolute', top: GRAIN_TOP, width: GRAIN, height: GRAIN,
    borderRadius: GRAIN / 2, backgroundColor: INK,
  },

  bracket: { position: 'absolute', width: 4, borderRadius: 2, backgroundColor: INK },

  verHit: { position: 'absolute', top: VER_Y, width: VER_W, height: VER_H },
  verBox: {
    position: 'absolute', left: 0, top: 0, width: VER_W, height: VER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  verRight: { backgroundColor: INK },
  verWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  verText: {
    position: 'absolute', left: 0, top: 9, width: VER_W, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  verText2: { top: 21 },
  verTextOn: { color: PAPER },
});

export function Logic38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic38Scene} band={[226, 512]} camera={CAM} />;
}
