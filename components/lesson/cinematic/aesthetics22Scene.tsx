import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics22Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO INSTRUMENTS ON ONE VIEWER, AND ONLY ONE OF THEM MOVES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SCREEN is 208×94 at x 28…236, y 246…340, 2.5 thick — the largest object
//   on the stage, because the whole question is why something that size can do
//   anything to you at all.
// · THREE SLIME LOBES rise from the screen floor at x 44 · 110 · 176, each 58
//   wide, to heights 34 · 52 · 40 at full advance. Three, and uneven, so it
//   reads as something creeping rather than a bar chart in a box.
// · TWO METER ROWS at x 252…380: tracks 128×30 with tops 256 and 312, each with
//   an 8pt label 12 above it at y 244 and y 300. Two, not three — a third flat
//   reading would make the first question ambiguous, and the picture only has
//   one thing to say.
// · the HEART fill runs the full 124 inner units. the BELIEF fill is drawn and
//   never given a value: an instrument reading zero is a measurement, and an
//   absent instrument is not (A1).
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the belief track at y 342, so 55 units stay clear.
//
// Ink runs y 244 (the first label) … y 500. BAND 238…512 = 274, with the
// 103-unit figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SC_X = 28;
const SC_Y = 246;
const SC_W = 208;
const SC_H = 94;

const LOBE_X = [44, 110, 176];
const LOBE_W = 58;
const LOBE_H = [34, 52, 40];
const FLOOR = SC_Y + SC_H - 4;

const M_X = 252;
const M_W = 128;
const M_H = 30;
const HEART_Y = 256;
const BELIEF_Y = 312;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SCREEN = BEATS.map((b) => b.screen ?? 0);
const SLIME = BEATS.map((b) => b.slime ?? 0);
const METERS = BEATS.map((b) => b.meters ?? 0);
const HEART = BEATS.map((b) => b.heart ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// On its own split beat the seam drives the instrument (R7). Giving the left
// side more empties the heart meter, so a reader who says it was all a game is
// watching themselves erase the reading the lesson opened with — which is the
// price of that answer, and a sentence could only assert it.
const PULL = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics22'));

export default function Aesthetics22Scene({
  clock, bt, bi, i, picked, onPick, dragPos,
}: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const pulling = PULL[i] === 1;
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
      screen: carry(cv, 1, n, SCREEN[p], SCREEN[n], tr),
      slime: carry(cv, 2, n, SLIME[p], SLIME[n], tr),
      meters: carry(cv, 3, n, METERS[p], METERS[n], tr),
      // A heart under a thing that is still coming — a slow live sway, so the
      // reading is a reading and not a filled bar somebody printed.
      // Through `carry` so the seam takes over across the transition rather than
      // on one frame — see metaphysics21Scene for why that matters.
      heart: carry(cv, 4, n, HEART[p], pulling ? 1 - dragPos.value : HEART[n], tr)
        * (0.86 + 0.07 * Math.sin(t * 3.1)),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const scStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.screen }));
  const slimeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slime }));
  const mStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.meters }));
  const heartStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.meters, width: (M_W - 8) * SCENE.value.heart,
  }));

  const lobes = [0, 1, 2];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, scStyle]} pointerEvents="none">
        <View style={styles.screen} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, slimeStyle]} pointerEvents="none">
        {lobes.map((k) => <Lobe key={k} S={SCENE} k={k} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, mStyle]} pointerEvents="none">
        <Text style={[styles.mLabel, { top: HEART_Y - 12 }]}>HEART RATE</Text>
        <View style={[styles.track, { top: HEART_Y }]} />
        <Text style={[styles.mLabel, { top: BELIEF_Y - 12 }]}>BELIEF IT IS REAL</Text>
        <View style={[styles.track, { top: BELIEF_Y }]} />
        {/* Drawn at zero rather than left out: a reading of nothing is still a
            reading, and an absent instrument would be a different claim (A1). */}
        <View style={[styles.fill, { top: BELIEF_Y + 4, width: 3 }]} />
      </Animated.View>
      <Animated.View style={[styles.fill, { top: HEART_Y + 4 }, heartStyle]} pointerEvents="none" />

      <Target
        id="screen" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: SC_X, top: SC_Y, width: SC_W, height: SC_H }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: SC_W, height: SC_H }, answered && picked === 'screen' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="heart" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: M_X, top: HEART_Y, width: M_W, height: M_H }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: M_W, height: M_H }, answered && picked === 'heart' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="belief" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: M_X, top: BELIEF_Y, width: M_W, height: M_H }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: M_W, height: M_H }, answered && styles.right]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One lobe of the thing coming down the screen. Uneven on purpose. */
function Lobe({ S, k }: { S: { value: { slime: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const h = LOBE_H[k] * S.value.slime;
    return { height: h, top: FLOOR - h };
  });
  return <Animated.View pointerEvents="none" style={[styles.lobe, { left: LOBE_X[k] }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  screen: {
    position: 'absolute', left: SC_X, top: SC_Y, width: SC_W, height: SC_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  lobe: {
    position: 'absolute', width: LOBE_W, backgroundColor: SOFT,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
  },

  mLabel: {
    position: 'absolute', left: M_X, width: M_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },
  track: {
    position: 'absolute', left: M_X, width: M_W, height: M_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  fill: {
    position: 'absolute', left: M_X + 4, height: M_H - 8, backgroundColor: INK, borderRadius: 2,
  },

  hit: { position: 'absolute' },
  hitBox: { borderRadius: 4 },
  /** WHAT "TAP ONE OF THESE" LOOKS LIKE WHILE THE QUESTION IS OPEN.
   *
   * These hit boxes took a border only once the answer was IN, so up to that moment
   * the reader was choosing between regions with no edges — the complaint exactly:
   * "blank boxes that you cannot read so it is a guess for which one to press". The
   * outline says where the choices are; the picture under each one says what it is.
   */
  hitLive: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics22Scene} band={[238, 512]} camera={CAM} />;
}
