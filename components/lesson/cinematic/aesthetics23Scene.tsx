import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics23Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A TUNE, AND ONE ARROW WITH THREE PLACES TO AIM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the STAVE is five 1.2-thick rules at y 250 · 258 · 266 · 274 · 282, running
//   x 28…372. It is the one object here that is a picture rather than a diagram,
//   which matters: the lesson is about something you hear, and a stage made only
//   of labelled boxes would be a lecture slide.
// · SEVEN NOTES, heads 13×9, at x 44 · 90 · 136 · 182 · 228 · 274 · 320 with
//   tops 268 · 262 · 274 · 266 · 270 · 262 · 276, each with a 2×22 stem rising
//   from its right edge. The line rises and falls rather than climbing, so it
//   reads as a tune and not a scale.
// · the THREE PLATES sit at y 314…356 — 102 wide at
//   x 28 · 150 · 272, centres 79 · 201 · 323 — with the CAPTION under them at
//   y 364, clear of the arrow that sweeps between the stave and the plates.
// · the ARROW is a 3-wide riser from y 288 to y 306 plus a head of three bars
//   (12 · 8 · 4 wide) at y 306 · 309 · 312, and its x is carried, so moving the
//   claim moves the arrow across the stage rather than cutting to it (L1).
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the plates at y 356, so 41 units stay clear.
//
// Ink runs y 240 (the highest stem) … y 500. BAND 234…512 = 278, with the
// 103-unit figure at 37.1%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ST_L = 28;
const ST_R = 372;
const ST_Y = [250, 258, 266, 274, 282];

const NOTE_X = [44, 90, 136, 182, 228, 274, 320];
const NOTE_TOP = [268, 262, 274, 266, 270, 262, 276];
const NOTE_W = 13;
const NOTE_H = 9;
const STEM_H = 22;

// BELOW THE PLATES, because the arrow's row belongs to the arrow. The caption
// used to sit at 300 and the riser runs 288 to 306 at whichever plate is being
// pointed at — so at plate one (centre 79) it came straight down through IT
// POINTS AT. There is no x that escapes it: the three centres are 79, 201 and
// 323 and the caption is 71 wide wherever it starts. The band's top has 6 units
// spare, which is not a caption, so it goes under the plates instead.
const CAP_Y = 364;
const PL_Y = 314;
const PL_H = 42;
const PL_W = 102;
const PL_X = [28, 150, 272];
const PL_MID = [79, 201, 323];
const PL_TEXT = ['A MOOD', 'A BIRD', 'NOTHING OUTSIDE ITSELF'];

const AR_TOP = 288;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const STAVE = BEATS.map((b) => b.stave ?? 0);
const PLATES = BEATS.map((b) => b.plates ?? 0);
const POINT = BEATS.map((b) => b.point ?? 0);
const AIM = BEATS.map((b) => PL_MID[b.aim ?? 0]);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics23'));

export default function Aesthetics23Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
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

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      stave: carry(cv, 1, n, STAVE[p], STAVE[n], tr),
      plates: carry(cv, 2, n, PLATES[p], PLATES[n], tr),
      point: carry(cv, 3, n, POINT[p], POINT[n], tr),
      // R7c — the lever's three stops ARE the three plates, so the arrow travels to
      // whichever one the reader is standing on. `AIM` is already a stage x, not an
      // index, so the reaction interpolates between the outer two plate mid-points.
      aim: carry(cv, 4, n, AIM[p], reacting ? PL_MID[0] + (PL_MID[2] - PL_MID[0]) * pickPos.value : AIM[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stave }));
  const plStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  // The arrow travels; it never cuts from one plate to the next (L1).
  const arStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.point,
    transform: [{ translateX: SCENE.value.aim }],
  }));

  const notes = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, stStyle]} pointerEvents="none">
        {ST_Y.map((y) => <View key={y} style={[styles.staveLine, { top: y }]} />)}
        {notes.map((k) => (
          <View key={k}>
            <View style={[styles.stem, { left: NOTE_X[k] + NOTE_W - 2, top: NOTE_TOP[k] - STEM_H + 4 }]} />
            <View style={[styles.head, { left: NOTE_X[k], top: NOTE_TOP[k] }]} />
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, plStyle]} pointerEvents="none">
        <Text style={styles.caption}>IT POINTS AT</Text>
        {PL_X.map((px, k) => (
          <AnswerLift key={px} id={`p${k}`} picked={picked} correct={k === 2}>
            <View style={[styles.plate, { left: px }, k === 2 && styles.plateOpen]} />
            <Text style={[styles.plateText, { left: px }]} numberOfLines={2}>{PL_TEXT[k]}</Text>
          </AnswerLift>
        ))}
      </Animated.View>

      <Animated.View style={[styles.arrow, arStyle]} pointerEvents="none">
        <View style={styles.riser} />
        <View style={[styles.headBar, { top: 18, left: -6, width: 12 }]} />
        <View style={[styles.headBar, { top: 21, left: -4, width: 8 }]} />
        <View style={[styles.headBar, { top: 24, left: -2, width: 4 }]} />
      </Animated.View>

      {PL_X.map((px, k) => (
        <Target
          key={px}
          id={`p${k}`}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: px }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 2 ? (answered && styles.right) : (answered && picked === `p${k}` && styles.wrong),
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  staveLine: { position: 'absolute', left: ST_L, width: ST_R - ST_L, height: 1.2, backgroundColor: SOFT },
  head: { position: 'absolute', width: NOTE_W, height: NOTE_H, borderRadius: 5, backgroundColor: INK },
  stem: { position: 'absolute', width: 2, height: STEM_H, backgroundColor: INK },

  caption: {
    position: 'absolute', left: ST_L, top: CAP_Y,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  plate: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  plateOpen: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: SOFT },
  plateText: {
    position: 'absolute', top: PL_Y + 12, width: PL_W, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false },

  arrow: { position: 'absolute', left: 0, top: AR_TOP, width: 0, height: 0 },
  riser: { position: 'absolute', left: -1.5, top: 0, width: 3, height: 18, backgroundColor: INK },
  headBar: { position: 'absolute', height: 3, backgroundColor: INK },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Aesthetics23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics23Scene} band={[234, 512]} camera={CAM} />;
}
