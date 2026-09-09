import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics26Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A ROAD OF CARS, A RUN OF THEM STOPPED, AND THE RUN WALKING BACKWARDS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the ROAD is 250×54 at x 136 (136…386), y 330…384 — the scene's filled STONE
//   mass, with a dashed centre line down the middle of it at y 356.
// · EIGHT CARS of 22×14 at a pitch of 29 from x 146, y 348…362, so the last sits
//   at 349…371 inside the road's right edge at 386. All eight are drawn from one
//   style; the jam is not a different kind of car, which is the whole claim.
// · the JAM is a BRACKET above them — a 3-unit bar at y 316 with two down-ticks —
//   spanning four car pitches, and it DRIFTS backwards along the road on the
//   monotonic clock, wrapping. It rides `clock` and never `bt`, so it keeps moving
//   between taps: a jam that only moved when the reader tapped would be arguing
//   the reductionist's case by accident (Z7, L1).
// · the GHOST band is 250×18 at x 136, y 292…310 — a second thing above the road,
//   drawn only insofar as the reader's seam puts the jam outside the cars.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   road and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and twenty-three
//   clear of the road at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ROAD_X = 136;
const ROAD_Y = 330;
const ROAD_W = 250;
const ROAD_H = 54;

const CAR_N = 8;
const CAR_X0 = 146;
const CAR_PITCH = 29;
const CAR_W = 22;
const CAR_H = 14;
const CAR_Y = 348;

/** How many car pitches the stopped run covers, and how fast it walks back. */
const JAM_SPAN = 4;
const JAM_Y = 316;
const JAM_SPEED = 13;

const GHOST_Y = 292;
const GHOST_H = 18;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['IT SURPRISED US', 'THE PARTS FIX IT', 'IT HAS A NAME'];
const PLATE_ID = ['surprise', 'parts', 'name'];
/** The only test that separates them. The other two separate nothing. */
const PARTS = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROAD = BEATS.map((b) => (b.road ? 1 : 0));
const JAM = BEATS.map((b) => (b.jam ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics26'));

export default function Metaphysics26Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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

    // THE JAM WALKS BACKWARDS ON THE SCENE CLOCK, wrapping the length of the road.
    const span = ROAD_W + JAM_SPAN * CAR_PITCH;
    const drift = ROAD_W - ((t * JAM_SPEED) % span);

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      roadOn: carry(cv, 1, n, ROAD[p], ROAD[n], tr),
      jamOn: carry(cv, 2, n, JAM[p], JAM[n], tr),
      drift,
      // R7b — the seam's position is the LEFT side's share, and LEFT is THE CARS.
      // So a seam at 1 puts the whole jam in the cars and the ghost band goes.
      inCars: carry(cv, 3, n, 1, reacting ? dragPos.value : 1, tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const roadStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.roadOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const jamStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.jamOn,
    transform: [{ translateX: SCENE.value.drift }],
  }));
  // THE EXTRA THING, if the reader says the jam is one. It is drawn only by the
  // share of the jam they place OUTSIDE the cars.
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.jamOn * (1 - SCENE.value.inCars),
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">NOTHING BUT CARS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, ghostStyle]} pointerEvents="none">
        <View style={styles.ghost} />
        <Text style={styles.ghostText}>SOMETHING MORE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, roadStyle]} pointerEvents="none">
        <View style={styles.road} />
        <View style={styles.centre} />
        {Array.from({ length: CAR_N }, (_, k) => (
          <View key={k} style={[styles.car, { left: CAR_X0 + k * CAR_PITCH }]} />
        ))}
      </Animated.View>

      <View style={styles.jamClip} pointerEvents="none">
        <Animated.View style={[styles.jamRow, jamStyle]}>
          <View style={styles.jamBar} />
          <View style={[styles.jamTick, { left: 0 }]} />
          <View style={[styles.jamTick, { left: JAM_SPAN * CAR_PITCH - 3 }]} />
        </Animated.View>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === PARTS}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: ROAD_X, top: CAP_T, width: ROAD_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  road: {
    position: 'absolute', left: ROAD_X, top: ROAD_Y, width: ROAD_W, height: ROAD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  centre: {
    position: 'absolute', left: ROAD_X + 6, top: ROAD_Y + ROAD_H / 2, width: ROAD_W - 12, height: 0,
    borderTopWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  // ONE STYLE FOR ALL EIGHT. A jammed car is not a different kind of car, and a
  // drawing that made it one would answer the question in the furniture.
  car: {
    position: 'absolute', top: CAR_Y, width: CAR_W, height: CAR_H, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },

  // THE JAM RIDES ITS OWN CLIPPING STRIP, so a bracket that has walked off the
  // road's left end does not appear over the caption.
  jamClip: { position: 'absolute', left: ROAD_X, top: JAM_Y - 4, width: ROAD_W, height: 20, overflow: 'hidden' },
  jamRow: { position: 'absolute', left: -JAM_SPAN * CAR_PITCH, top: 0, width: JAM_SPAN * CAR_PITCH, height: 20 },
  jamBar: { position: 'absolute', left: 0, top: 4, width: JAM_SPAN * CAR_PITCH, height: 3, backgroundColor: INK },
  jamTick: { position: 'absolute', top: 4, width: 3, height: 11, backgroundColor: INK },

  // A SECOND THING ABOVE THE ROAD — present only in proportion to how much of the
  // jam the reader has placed outside the cars.
  ghost: {
    position: 'absolute', left: ROAD_X, top: GHOST_Y, width: ROAD_W, height: GHOST_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  ghostText: {
    position: 'absolute', left: ROAD_X, top: GHOST_Y + 5, width: ROAD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics26Scene} band={[240, 512]} camera={CAM} />;
}
