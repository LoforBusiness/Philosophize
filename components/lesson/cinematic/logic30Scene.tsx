import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE COURSES LAID FROM THE BOTTOM UP, AND A HAMMER OVER THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FIVE COURSES of 128×24 at x 146 (146…274), stacked bottom to top at y 362 ·
//   336 · 310 · 284 · 258. Each carries its own name in ink and arrives in order
//   as `built` climbs, because the ORDER is the method being taught.
// · the FOOTING is a RULE band 160×8 at x 130 (130…290), y 386…394.
// · the HAMMER is a 44×16 ink head on a 7×54 handle, pivoting at the handle's
//   foot at (312, 320) and drawing back from 0° to −54° as `swing` climbs. Its
//   origin is stated in px, because on an absoluteFill a bare rotate swings about
//   the middle of the whole design space.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, twenty-five units clear of the footing at 130.
//
// Ink runs y 242 (the caption) … y 500 (ground). BAND 238…512 = 274 — a 103-unit
// figure at 37.6%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CRS_X = 146;
const CRS_W = 128;
const CRS_H = 24;
/** Bottom course first: the order they arrive in IS the method. */
const CRS_Y = [362, 336, 310, 284, 258];
const CRS_CAP = ['THE CONCLUSION', 'THE PREMISES', 'HIDDEN ONES', 'VALID FORM', 'TRUE PREMISES'];

const FOOT_X = 130;
const FOOT_Y = 386;
const FOOT_W = 160;

const HAM_X = 312;
const HAM_Y = 320;
const HEAD_W = 44;
const HEAD_H = 16;
const HAND_W = 7;
const HAND_H = 54;

const CAP_T = 242;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['THE CONCLUSION', 'THE HIDDEN ONES', 'THE STRESS TEST'];
const PLATE_ID = ['conc', 'hidden', 'test'];
/** Everything above it is chosen for the job of forcing it. */
const CONC = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BUILT = BEATS.map((b) => b.built ?? 0);
const SWING = BEATS.map((b) => b.swing ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic30'));

/** One course of the stack. Five of these is five hooks, so each gets a component. */
function Course({ S, k }: { S: { value: { built: number } }; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.built * 5 - k) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.course, { top: CRS_Y[k] }]} />
      <Text style={[styles.courseText, { top: CRS_Y[k] + 8 }]}>{CRS_CAP[k]}</Text>
    </Animated.View>
  );
}

export default function Logic30Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
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
      built: carry(cv, 1, n, BUILT[p], BUILT[n], tr),
      swing: carry(cv, 2, n, SWING[p], SWING[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  const hammerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-54 * clamp01(SCENE.value.swing)}deg` }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE ARGUMENT, COURSE BY COURSE</Text>

      <View style={styles.foot} pointerEvents="none" />
      {CRS_Y.map((cy, k) => <Course key={cy} S={SCENE} k={k} />)}

      <Animated.View style={[styles.hammer, hammerStyle]} pointerEvents="none">
        <View style={styles.handle} />
        <View style={styles.head} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === CONC}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === CONC}
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
    position: 'absolute', left: CRS_X - 20, top: CAP_T, width: CRS_W + 40, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  foot: { position: 'absolute', left: FOOT_X, top: FOOT_Y, width: FOOT_W, height: 8, backgroundColor: RULE },
  course: {
    position: 'absolute', left: CRS_X, width: CRS_W, height: CRS_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  courseText: {
    position: 'absolute', left: CRS_X, width: CRS_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // A BARE ROTATE ON AN absoluteFill SWINGS ABOUT THE MIDDLE OF THE DESIGN SPACE,
  // so the origin is stated in px at the handle's foot.
  hammer: {
    position: 'absolute', left: HAM_X, top: HAM_Y - HAND_H, width: HAND_W, height: HAND_H,
    transformOrigin: `${HAND_W / 2}px ${HAND_H}px`,
  },
  handle: { position: 'absolute', left: 0, top: 0, width: HAND_W, height: HAND_H, backgroundColor: INK },
  head: {
    position: 'absolute', left: HAND_W / 2 - HEAD_W / 2, top: -HEAD_H, width: HEAD_W, height: HEAD_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
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

export function Logic30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic30Scene} band={[238, 512]} camera={CAM} />;
}
