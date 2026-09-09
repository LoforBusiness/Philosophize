import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE BODIES IN A FRAME, SLID EAST, AND A SCALE THAT MAY OR MAY NOT COME ALONG.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FRAME is 250×150 at x 136 (136…386), y 276…426 — the scene's filled mass
//   (T2), and the room the argument is about.
// · a SCALE of eleven TICKS of 2×9 runs inside its top edge at a pitch of 23 from
//   x 148, y 282. It is Newton's absolute space made visible, and it is the ONLY
//   thing in the picture the sort can leave behind.
// · THREE BODIES are discs of 28 at relative offsets 0 · 62 · 140 from a base of
//   x 160, y 330…358. The whole arrangement slides 30 units east, so at full shift
//   the rightmost sits at 358, still inside the frame at 386.
// · TWO GAP BARS of height 3 run between the discs at y 372, from one edge to the
//   next. Their lengths are 34 and 50 at every beat of the lesson: the distances
//   are what both sides agree about, so they are the thing that visibly holds.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   frame at 426 and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and twenty-three
//   clear of the frame at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FRAME_X = 136;
const FRAME_Y = 276;
const FRAME_W = 250;
const FRAME_H = 150;

const TICK_N = 11;
const TICK_X0 = 148;
const TICK_PITCH = 23;
const TICK_Y = 282;

const BODY_BASE = 160;
const BODY_OFF = [0, 62, 140];
const BODY_Y = 330;
const BODY_D = 28;
const BODY_N = 3;
const SLIDE = 30;

const GAP_Y = 372;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['NO REASON', 'NOTHING SHOWS', 'NO ROOM LEFT'];
const PLATE_ID = ['reason', 'shows', 'room'];
/** The principle he actually leans on. The other two are the weaker cousins. */
const REASON = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BODIES = BEATS.map((b) => b.bodies ?? 0);
const SCALE = BEATS.map((b) => (b.scale ? 1 : 0));
const SHIFT = BEATS.map((b) => b.shift ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 a real change · 1 the
// same world · 2 an empty question. Each row is read off that bin's own words.
//   real  — the bodies moved and the scale stayed, so there is something they
//           moved against, and nobody can see it.
//   same  — the scale travels with them: space IS the arrangement, so it came too.
//   empty — the scale is not there at all, and the question has nothing to be about.
const SCALE_SHIFT_AT = [0, 1, 1];
const SCALE_ON_AT = [1, 1, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics41'));

export default function Metaphysics41Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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
      bodies: carry(cv, 1, n, BODIES[p], BODIES[n], tr),
      scaleOn: carry(cv, 2, n, SCALE[p], reacting ? pickAt(SCALE_ON_AT, pickPos.value) : SCALE[n], tr),
      shift: carry(cv, 3, n, SHIFT[p], SHIFT[n], tr),
      // Whether the scale travelled with the bodies is the whole answer.
      scaleShift: carry(cv, 4, n, 0, reacting ? pickAt(SCALE_SHIFT_AT, pickPos.value) : 0, tr),
      platesOn: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const scaleStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.scaleOn,
    transform: [{ translateX: SLIDE * SCENE.value.shift * SCENE.value.scaleShift }],
  }));
  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: SLIDE * SCENE.value.shift }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME WORLD, MOVED</Text>

      <View style={styles.frame} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, scaleStyle]} pointerEvents="none">
        {Array.from({ length: TICK_N }, (_, k) => (
          <View key={k} style={[styles.tick, { left: TICK_X0 + k * TICK_PITCH }]} />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, worldStyle]} pointerEvents="none">
        {BODY_OFF.map((off, k) => <Body key={off} S={SCENE} off={off} index={k} />)}
        {/* THE DISTANCES, WHICH NEVER CHANGE. Both sides agree about these, so
            they are the one thing the picture holds perfectly still. */}
        <Gap S={SCENE} from={0} to={1} />
        <Gap S={SCENE} from={1} to={2} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === REASON}
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

/** One of the three things there are. */
function Body({ S, off, index }: { S: SharedValue<any>; off: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.bodies * BODY_N - index) }));
  return <Animated.View style={[styles.body, { left: BODY_BASE + off }, st]} pointerEvents="none" />;
}

/** The distance between two of them, drawn edge to edge. */
function Gap({ S, from, to }: { S: SharedValue<any>; from: number; to: number }) {
  const left = BODY_BASE + BODY_OFF[from] + BODY_D;
  const width = BODY_OFF[to] - BODY_OFF[from] - BODY_D;
  const st = useAnimatedStyle(() => ({ opacity: S.value.bodies }));
  return <Animated.View style={[styles.gap, { left, width }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: FRAME_X, top: CAP_T, width: FRAME_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  frame: {
    position: 'absolute', left: FRAME_X, top: FRAME_Y, width: FRAME_W, height: FRAME_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  tick: { position: 'absolute', top: TICK_Y, width: 2, height: 9, backgroundColor: INK },

  body: {
    position: 'absolute', top: BODY_Y, width: BODY_D, height: BODY_D, borderRadius: BODY_D / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  gap: { position: 'absolute', top: GAP_Y, height: 3, backgroundColor: INK },

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

export function Metaphysics41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics41Scene} band={[240, 512]} camera={CAM} />;
}
