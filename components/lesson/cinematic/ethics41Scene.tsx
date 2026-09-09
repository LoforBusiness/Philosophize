import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO OPEN DOORS, A FLOOR THAT LEANS, AND NOTHING TOUCHING THE BALL.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO DOORS of 70×110, filled STONE with an ink edge, at x 160 (160…230) and
//   x 290 (290…360), y 300…410. They carry DECLINE and JOIN under them at y 416.
//   Both stand the whole lesson: the argument is that a nudge takes nothing away.
// · the FLOOR is 200×10 at x 160 (160…360), y 420, pivoting about its own centre
//   (x 260) through 0…12°, so its ends rise and fall by up to 21 units and it
//   stays inside y 399…441.
// · the BALL is a disc of 22 that rides the floor: its centre runs x 260 → 316 as
//   the tilt grows, and its y follows the floor's own surface at that x, so it is
//   always ON the plank and never near a hand. Nothing in the scene ever pushes
//   it — a push would be force, and the difficulty with a nudge is that there is
//   no push anywhere and it still ends up on one side.
// · the SHUTTER falls over the JOIN door's twin only in the last third of the
//   range: a 70-wide ink panel at x 160 growing from 0 to 110 tall, so at the top
//   of the scale one door is genuinely gone.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   door labels and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and forty-seven
//   clear of the first door at 160.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const DOOR_X = [160, 290];
const DOOR_Y = 300;
const DOOR_W = 70;
const DOOR_H = 110;
const DOOR_CAP = ['DECLINE', 'JOIN'];
/** INSIDE the door, near its foot. Set below the doors at 416 the words were
 *  painted over by the plank at 420, which is D33 and only the render said so. */
const DOOR_LABEL_Y = 386;

const PLANK_X = 160;
const PLANK_W = 200;
const PLANK_Y = 420;
const PLANK_H = 10;
const PLANK_MID = PLANK_X + PLANK_W / 2;
/** Degrees at full tilt, and what that costs the ends in units. */
const TILT_DEG = 12;

const BALL_D = 22;
const BALL_RUN = 56;

/** The shutter only starts to come down once the drag is past the nudge zone. */
const SHUT_FROM = 0.68;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['YOUR REASONS', 'YOUR HABITS', 'YOUR MONEY'];
const PLATE_ID = ['reasons', 'habits', 'money'];
/** What a default actually reaches. The other two are the other two levers. */
const HABITS = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const DOORS = BEATS.map((b) => (b.doors ? 1 : 0));
const FLOORV = BEATS.map((b) => (b.floorOn ? 1 : 0));
const TILT = BEATS.map((b) => b.tilt ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics41'));

export default function Ethics41Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      doorsOn: carry(cv, 1, n, DOORS[p], DOORS[n], tr),
      floorOn: carry(cv, 2, n, FLOORV[p], FLOORV[n], tr),
      // R7c — the knob's own 0…1 IS the slope, so nothing has to be mapped and the
      // reader is leaning the floor rather than moving a widget beside it.
      tilt: carry(cv, 3, n, TILT[p], reacting ? dragPos.value : TILT[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const doorsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.doorsOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const plankStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.floorOn,
    transform: [{ rotate: `${TILT_DEG * SCENE.value.tilt}deg` }],
  }));
  const ballStyle = useAnimatedStyle(() => {
    const k = SCENE.value.tilt;
    const dx = BALL_RUN * k;
    // The plank pivots at its middle, so a point dx along it drops by dx·tan θ.
    const drop = dx * Math.tan((TILT_DEG * k * Math.PI) / 180);
    return {
      opacity: SCENE.value.floorOn,
      left: PLANK_MID - BALL_D / 2 + dx,
      top: PLANK_Y - BALL_D + drop,
    };
  });
  const shutterStyle = useAnimatedStyle(() => {
    const h = DOOR_H * clamp01((SCENE.value.tilt - SHUT_FROM) / (1 - SHUT_FROM));
    return { opacity: SCENE.value.doorsOn, height: h };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floorRule} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">BOTH DOORS STILL OPEN</Text>

      <Animated.View style={[StyleSheet.absoluteFill, doorsStyle]} pointerEvents="none">
        {DOOR_X.map((dx, k) => (
          <View key={dx}>
            <View style={[styles.door, { left: dx }]} />
            <Text style={[styles.doorText, { left: dx }]}>{DOOR_CAP[k]}</Text>
          </View>
        ))}
      </Animated.View>

      {/* THE SHUTTER — the only thing in the scene that takes an option away, and
          it arrives only at the very top of the range. */}
      <Animated.View style={[styles.shutter, shutterStyle]} pointerEvents="none" />

      <Animated.View style={[styles.plank, plankStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ball, ballStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === HABITS}
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
  floorRule: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: DOOR_X[0], top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  door: {
    position: 'absolute', top: DOOR_Y, width: DOOR_W, height: DOOR_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  doorText: {
    position: 'absolute', top: DOOR_LABEL_Y, width: DOOR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  shutter: {
    position: 'absolute', left: DOOR_X[0], top: DOOR_Y, width: DOOR_W,
    backgroundColor: INK,
  },

  // PIVOTS AT ITS OWN MIDDLE, so tilting it raises one end and drops the other
  // rather than swinging the whole plank sideways.
  plank: {
    position: 'absolute', left: PLANK_X, top: PLANK_Y, width: PLANK_W, height: PLANK_H,
    backgroundColor: INK, transformOrigin: '50% 50%',
  },
  ball: {
    position: 'absolute', width: BALL_D, height: BALL_D, borderRadius: BALL_D / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
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

export function Ethics41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics41Scene} band={[240, 512]} camera={CAM} />;
}
