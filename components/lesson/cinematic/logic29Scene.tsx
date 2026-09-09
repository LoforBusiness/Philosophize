import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic29Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A BEAM ON A PIVOT, AND ONE WEIGHT THAT HAS TO GO SOMEWHERE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PIVOT is a filled STONE wedge 46 wide and 54 tall standing on the land at
//   x 197, y 328…382, drawn as a triangle so the beam has something to turn on.
// · the BEAM is 240×10 centred on x 220, hinged at its middle and tilting ±9°.
//   `transformOrigin` is stated in px at the pivot, because on an absoluteFill a
//   bare rotate swings about the middle of the whole design space.
// · the WEIGHT is a 30×24 STONE block riding the beam, at 100 units either side
//   of the pivot at the extremes. It is what makes the tilt mean something: a
//   beam that leans with nothing on it is a preference, not a burden.
// · TWO NAMES of 104 under the land at y 396, centred on x 120 and x 320.
// · the LAND is a RULE band 260×8 at x 90 (90…350), y 382…390.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his crown is at y 397, under the
//   land, and his widest span at the walked mark is x ≈ 55…105.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PIV_MID = 220;
const PIV_HALF = 23;
const PIV_TOP = 328;
const PIV_H = 54;

const BEAM_W = 240;
const BEAM_H = 10;
const BEAM_Y = 318;
/** How far the beam leans at the extremes, in degrees. */
const TILT = 9;

const LOAD_W = 30;
const LOAD_H = 24;
/** How far from the pivot the weight can ride. */
const LOAD_REACH = 100;

const LAND_X = 90;
const LAND_Y = 382;
const LAND_W = 260;

const NAME = ['THE CLAIMANT', 'THE DOUBTER'];
const NAME_MID = [130, 310];
const NAME_W = 104;
const NAME_T = 396;

const CAP_T = 244;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT ASKS TOO MUCH', 'IT HANDS OVER THE WORK', 'IT IS ONLY RUDE'];
const PLATE_ID = ['much', 'hands', 'rude'];
/** Burden shifting: failing to refute a claim is not evidence for the claim. */
const HANDS = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BEAM = BEATS.map((b) => (b.beam ? 1 : 0));
const LOAD = BEATS.map((b) => (b.load ? 1 : 0));
const SIDE = BEATS.map((b) => b.side ?? 0.5);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic29'));

export default function Logic29Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      beam: carry(cv, 1, n, BEAM[p], BEAM[n], tr),
      load: carry(cv, 2, n, LOAD[p], LOAD[n], tr),
      // R7b — a split's seam is the LEFT side's share, and the left side here is
      // the claimant, so a high seam means the person asserting carries it.
      side: carry(cv, 3, n, SIDE[p], reacting ? dragPos.value : SIDE[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const beamOn = useAnimatedStyle(() => ({ opacity: SCENE.value.beam }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  // THE BEAM LEANS TOWARD WHOEVER IS CARRYING IT, and only while something is on
  // it. `load` scales the tilt so an empty beam is dead level (A1).
  const beamStyle = useAnimatedStyle(() => {
    const lean = (clamp01(SCENE.value.side) - 0.5) * 2;
    return { transform: [{ rotate: `${-lean * TILT * clamp01(SCENE.value.load)}deg` }] };
  });
  // THE WEIGHT RIDES THE BEAM RATHER THAN FLOATING OVER IT: at dx from the pivot
  // the beam's surface has dropped by dx·tan(theta), and the block follows it.
  const loadStyle = useAnimatedStyle(() => {
    const on = clamp01(SCENE.value.load);
    const lean = (clamp01(SCENE.value.side) - 0.5) * 2;
    const dx = -lean * LOAD_REACH;
    const dy = dx * Math.tan((-lean * TILT * on * Math.PI) / 180);
    return { opacity: on, left: PIV_MID + dx - LOAD_W / 2, top: BEAM_Y - LOAD_H + dy };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHO CARRIES THE WEIGHT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, beamOn]} pointerEvents="none">
        <Animated.View style={[styles.beam, beamStyle]} />
        <View style={styles.pivot} />
        <View style={styles.land} />
        {NAME_MID.map((mx, k) => (
          <Text key={mx} style={[styles.name, { left: mx - NAME_W / 2 }]}>{NAME[k]}</Text>
        ))}
      </Animated.View>

      <Animated.View style={[styles.load, loadStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === HANDS}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === HANDS}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
    position: 'absolute', left: LAND_X, top: CAP_T, width: LAND_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  // A BARE ROTATE ON AN absoluteFill SWINGS ABOUT THE MIDDLE OF THE DESIGN SPACE,
  // so the origin is stated in px at the pivot itself.
  beam: {
    position: 'absolute', left: PIV_MID - BEAM_W / 2, top: BEAM_Y, width: BEAM_W, height: BEAM_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
    transformOrigin: `${BEAM_W / 2}px ${BEAM_H / 2}px`,
  },
  pivot: {
    position: 'absolute', left: PIV_MID - PIV_HALF, top: PIV_TOP, width: 0, height: 0,
    borderLeftWidth: PIV_HALF, borderRightWidth: PIV_HALF, borderBottomWidth: PIV_H,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: STONE,
  },
  load: {
    position: 'absolute', width: LOAD_W, height: LOAD_H,
    backgroundColor: INK, borderWidth: 2, borderColor: INK,
  },
  land: { position: 'absolute', left: LAND_X, top: LAND_Y, width: LAND_W, height: 8, backgroundColor: RULE },
  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Logic29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic29Scene} band={[240, 512]} camera={CAM} />;
}
