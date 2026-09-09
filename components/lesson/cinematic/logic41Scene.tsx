import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO BOXES, ONE INSIDE THE OTHER, AND A WALL THE INNER ONE CANNOT PASS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the OUTER box is 220×120 at x 150 (150…370), y 280…400 — every bank teller,
//   drawn as the scene's filled STONE mass (T2).
// · the INNER box grows from its own bottom-left corner at x 170, y 390. Its width
//   runs 40 → 190 and its height 24 → 100, so at full stretch it occupies
//   x 170…360 and y 290…390 and touches the outer box's inside face on three
//   sides. It cannot be drawn any larger, which is the argument: a conjunction is
//   a subset, and the geometry refuses to draw the thing the intuition wants.
// · a LEGEND sits under the outer box at y 410: two 12-unit swatches at x 152 and
//   x 250 with their names at x 170 (170…242) and x 268 (268…354). The names live
//   outside the boxes on purpose — a label inside the inner box would be a word in
//   a container that changes size under the reader's thumb (S8).
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 448 — below the
//   legend and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and thirty-seven
//   clear of the outer box at 150.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const OUT_X = 150;
const OUT_Y = 280;
const OUT_W = 220;
const OUT_H = 120;

/** The inner box grows out of this corner, which is inside the outer one. */
const IN_X = 170;
const IN_FLOOR = 390;
const IN_W_MIN = 40;
const IN_W_MAX = 190;
const IN_H_MIN = 24;
const IN_H_MAX = 100;

const LEG_Y = 410;
const LEG_SW = 12;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 448;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['IT FITS HER', 'MORE PRECISE', 'TWO CLAIMS'];
const PLATE_ID = ['fits', 'precise', 'two'];
/** Resemblance, which is the question the mind answers instead. */
const FITS = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const OUTER = BEATS.map((b) => (b.outer ? 1 : 0));
const INNER = BEATS.map((b) => (b.inner ? 1 : 0));
const FILL = BEATS.map((b) => b.fill ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic41'));

export default function Logic41Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      outerOn: carry(cv, 1, n, OUTER[p], OUTER[n], tr),
      innerOn: carry(cv, 2, n, INNER[p], INNER[n], tr),
      // R7c — the knob's own 0…1 IS the inner group's share, so nothing has to be
      // mapped, and the wall the drag runs into is the conjunction rule.
      fill: carry(cv, 3, n, FILL[p], reacting ? dragPos.value : FILL[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const outerStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.outerOn }));
  const legendStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.innerOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const innerStyle = useAnimatedStyle(() => {
    const h = IN_H_MIN + (IN_H_MAX - IN_H_MIN) * SCENE.value.fill;
    return {
      opacity: SCENE.value.innerOn,
      width: IN_W_MIN + (IN_W_MAX - IN_W_MIN) * SCENE.value.fill,
      height: h,
      top: IN_FLOOR - h,
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE GROUP INSIDE ANOTHER</Text>

      <Animated.View style={[StyleSheet.absoluteFill, outerStyle]} pointerEvents="none">
        <View style={styles.outer} />
      </Animated.View>

      <Animated.View style={[styles.inner, innerStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, legendStyle]} pointerEvents="none">
        <View style={[styles.swatchOuter, { left: 152 }]} />
        <Text style={[styles.legend, { left: 170, width: 72 }]}>BANK TELLERS</Text>
        <View style={[styles.swatchInner, { left: 250 }]} />
        <Text style={[styles.legend, { left: 268, width: 86 }]}>ALSO ACTIVISTS</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FITS}
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
    position: 'absolute', left: OUT_X, top: CAP_T, width: OUT_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  outer: {
    position: 'absolute', left: OUT_X, top: OUT_Y, width: OUT_W, height: OUT_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  // GROWN FROM ITS OWN BOTTOM-LEFT CORNER, so the reader watches one group swell
  // inside the other rather than a rectangle drifting about.
  inner: {
    position: 'absolute', left: IN_X,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },

  swatchOuter: {
    position: 'absolute', top: LEG_Y, width: LEG_SW, height: LEG_SW,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },
  swatchInner: {
    position: 'absolute', top: LEG_Y, width: LEG_SW, height: LEG_SW,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  legend: {
    position: 'absolute', top: LEG_Y + 2,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
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

export function Logic41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic41Scene} band={[240, 512]} camera={CAM} />;
}
