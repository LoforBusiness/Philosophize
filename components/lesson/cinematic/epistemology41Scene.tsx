import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, lerp, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A SHAFT CROSSING A WATERLINE, AND THE ANGLE IT PICKS UP ON THE WAY DOWN.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the WATER is 130×80 at x 136 (136…266), y 350…430 — a filled STONE mass, with
//   its SURFACE drawn as a separate 142-wide ink rule at x 130, y 348, so the line
//   runs a little past the body of the water the way a surface does.
// · the OAR is two shafts of 9 wide meeting at the KINK, x 201, y 350. The upper
//   is 70 long and leans 18°, so its far end sits at x 179, y 283. The lower is 66
//   long; in the water it leans 40° and ends at x 243, y 401, and when the oar is
//   lifted clear it straightens to the upper's own 18°. Both rotate about the
//   kink itself (`transformOrigin`), so the two halves cannot come apart.
// · the GHOST is the same two shafts in SOFT, offset 13 units right — the
//   sense-datum, drawn only when the reader's answer puts one there.
// · THREE PLATES of 122×26 sit in a COLUMN at x 274 (274…396), tops y 356 · 396 ·
//   436. A column rather than a row (H60b): the oar is a tall object, and a row of
//   plates beneath it would push the band past 300 units to hold both.
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-three units clear of the water's left edge at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WATER_X = 136;
const WATER_Y = 350;
const WATER_W = 130;
const WATER_H = 80;
const SURFACE_X = 130;
const SURFACE_W = 142;

const KINK_X = 201;
const SHAFT_W = 9;
const UPPER_L = 70;
const LOWER_L = 66;
/** The lean of the dry half, in degrees, and the two leans of the wet half. */
const LEAN = 18;
const REFRACTED = 40;
/** How far right of the real shaft the sense-datum is drawn. */
const GHOST_DX = 13;

const PLATE_X = 274;
const PLATE_W = 122;
const PLATE_H = 26;
const PLATE_Y = [356, 396, 436];
const PLATE_CAP = ['IT LOOKS BENT', 'THE OAR IS STRAIGHT', 'A BENT THING IS SEEN'];
const PLATE_ID = ['looks', 'straight', 'seen'];
/** The step a direct realist throws out. The other two are agreed by everybody. */
const SEEN = 2;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WATER = BEATS.map((b) => (b.water ? 1 : 0));
const OAR = BEATS.map((b) => (b.oar ? 1 : 0));
const LIFTED = BEATS.map((b) => (b.lifted ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 the oar · 1 a sense-datum
// · 2 a state of mind. Each row is read off that option's own words.
//   oar   — "the oar, which merely looks bent"  → nothing is added to the picture.
//   datum — "a bent sense-datum standing in"    → a second shaft appears in front.
//   mind  — "nothing outside"                   → the water and the oar recede and
//                                                 only the datum is left.
const GHOST_AT = [0, 1, 1];
const WORLD_AT = [1, 1, 0.15];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology41'));

export default function Epistemology41Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
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
      waterOn: carry(cv, 1, n, WATER[p], WATER[n], tr),
      oarOn: carry(cv, 2, n, OAR[p], OAR[n], tr),
      // 0 = the wet half is refracted, 1 = the oar is out and the shaft is one line.
      lifted: carry(cv, 3, n, LIFTED[p], LIFTED[n], tr),
      ghost: carry(cv, 4, n, 0, reacting ? pickAt(GHOST_AT, pickPos.value) : 0, tr),
      world: carry(cv, 5, n, 1, reacting ? pickAt(WORLD_AT, pickPos.value) : 1, tr),
      platesOn: carry(cv, 6, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const waterStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.waterOn * SCENE.value.world }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));

  const upperStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.oarOn * SCENE.value.world,
    transform: [{ rotate: `${LEAN}deg` }],
  }));
  const lowerStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.oarOn * SCENE.value.world,
    transform: [{ rotate: `${lerp(REFRACTED, LEAN, SCENE.value.lifted)}deg` }],
  }));
  const ghostUpper = useAnimatedStyle(() => ({
    opacity: SCENE.value.ghost,
    transform: [{ rotate: `${LEAN}deg` }],
  }));
  const ghostLower = useAnimatedStyle(() => ({
    opacity: SCENE.value.ghost,
    transform: [{ rotate: `${REFRACTED}deg` }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">HALF IN, HALF OUT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, waterStyle]} pointerEvents="none">
        <View style={styles.water} />
        <View style={styles.surface} />
      </Animated.View>

      <Animated.View style={[styles.upper, upperStyle]} pointerEvents="none" />
      {/* THE BLADE RIDES INSIDE THE SUBMERGED SHAFT, so it leans with it. Without
          one the drawing is a stick through a box, and the lesson is about an oar
          (group Z: the picture must BE the thing it names). */}
      <Animated.View style={[styles.lower, lowerStyle]} pointerEvents="none">
        <View style={styles.blade} />
      </Animated.View>

      {/* THE SENSE-DATUM, if the reader's answer puts one there — the same two
          shafts, offset and drawn in the one tone the scene keeps for a thing
          that is not the object itself. */}
      <Animated.View style={[styles.upper, styles.ghost, { left: KINK_X - SHAFT_W / 2 + GHOST_DX }, ghostUpper]} pointerEvents="none" />
      <Animated.View style={[styles.lower, styles.ghost, { left: KINK_X - SHAFT_W / 2 + GHOST_DX }, ghostLower]} pointerEvents="none">
        <View style={[styles.blade, styles.ghost]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SEEN}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: PLATE_Y[k] }]}
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
    position: 'absolute', left: WATER_X, top: CAP_T, width: 262,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  water: {
    position: 'absolute', left: WATER_X, top: WATER_Y, width: WATER_W, height: WATER_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  // THE SURFACE RUNS PAST THE BODY OF THE WATER, because a waterline is a line
  // and a tank is a box, and the argument is entirely about the line.
  surface: { position: 'absolute', left: SURFACE_X, top: WATER_Y - 2, width: SURFACE_W, height: 2.5, backgroundColor: INK },

  // BOTH HALVES PIVOT ABOUT THE KINK ITSELF, so they can lean independently and
  // still meet — the dry half at the bottom of its box, the wet half at the top.
  upper: {
    position: 'absolute', left: KINK_X - SHAFT_W / 2, top: WATER_Y - UPPER_L, width: SHAFT_W, height: UPPER_L,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  lower: {
    position: 'absolute', left: KINK_X - SHAFT_W / 2, top: WATER_Y, width: SHAFT_W, height: LOWER_L,
    backgroundColor: INK, transformOrigin: '50% 0%',
  },
  // A FLATTENED PADDLE at the wet end, overlapping the shaft so the two read as
  // one object rather than a bar with a tile beside it.
  blade: {
    position: 'absolute', left: (SHAFT_W - 24) / 2, top: LOWER_L - 26, width: 24, height: 32,
    borderRadius: 9, backgroundColor: INK,
  },
  ghost: { backgroundColor: SOFT },

  hit: { position: 'absolute', left: PLATE_X, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Epistemology41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology41Scene} band={[240, 512]} camera={CAM} />;
}
