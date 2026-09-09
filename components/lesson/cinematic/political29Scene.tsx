import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political29Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO IDENTICAL CRIBS, A LINE BETWEEN THEM, AND TWO COLUMNS OF LIFE CHANCES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO CRIBS of 56×34 in STONE at x 138 (138…194) and x 242 (242…298), y 366…400.
//   They are drawn from the same numbers on purpose: neither newborn did anything,
//   and a picture that made one look more deserving would answer the question
//   before it was asked (A1).
// · the LINE is a 10-wide ink column at x 209, y 262…400, standing between them.
// · TWO COLUMNS of 20 rise from the crib tops at x 156 and x 260. Their height runs
//   77 ± 47 in opposite directions off one value, so the tallest tops out at y 242.
// · TWO NAMES of 90 under the cribs at y 406, centred on each crib.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, sixteen units clear of the left name at 121.
//
// Ink runs y 242 (a column at full height) … y 500 (ground). BAND 238…512 = 274 —
// a 103-unit figure at 37.6%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CRIB_X = [138, 242];
const CRIB_Y = 366;
const CRIB_W = 56;
const CRIB_H = 34;
const CRIB_MID = [166, 270];

const WALL_X = 209;
const WALL_Y = 262;
const WALL_W = 10;

const COL_W = 20;
/** The two columns at rest, and how far apart the line can drive them. */
const COL_MID = 77;
const COL_SWING = 47;

const NAME = ['BORN INSIDE', 'BORN OUTSIDE'];
const NAME_W = 90;
const NAME_T = 406;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['BIRTH DECIDES TOO MUCH', 'CITIZENS ARE NOBLES', 'FEUDALISM IS BACK'];
const PLATE_ID = ['birth', 'nobles', 'feudal'];
/** The comparison is normative: inherited rank is refused at home and kept at the border. */
const BIRTH = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CRIBS = BEATS.map((b) => (b.cribs ? 1 : 0));
const WALL = BEATS.map((b) => (b.wall ? 1 : 0));
const DECIDE = BEATS.map((b) => b.decide ?? 0.5);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political29'));

export default function Political29Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      cribs: carry(cv, 1, n, CRIBS[p], CRIBS[n], tr),
      wall: carry(cv, 2, n, WALL[p], WALL[n], tr),
      // HOW MUCH THE LINE DECIDES. At 0 the two columns come out level, which is
      // a claim about the world the reader can check.
      decide: carry(cv, 3, n, DECIDE[p], reacting ? dragPos.value : DECIDE[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const cribsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cribs }));
  const wallStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wall }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  // ONE VALUE, TWO COLUMNS, PARTING IN OPPOSITE DIRECTIONS. At 0 they are level,
  // which is the reading the far-left zone actually states.
  const insideCol = useAnimatedStyle(() => {
    const h = COL_MID + COL_SWING * clamp01(SCENE.value.decide);
    return { top: CRIB_Y - h, height: h, opacity: clamp01(SCENE.value.cribs) };
  });
  const outsideCol = useAnimatedStyle(() => {
    const h = COL_MID - COL_SWING * clamp01(SCENE.value.decide);
    return { top: CRIB_Y - h, height: h, opacity: clamp01(SCENE.value.cribs) };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[styles.col, { left: 156 }, insideCol]} pointerEvents="none" />
      <Animated.View style={[styles.col, { left: 260 }, outsideCol]} pointerEvents="none" />

      <Animated.View style={[styles.wall, wallStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, cribsStyle]} pointerEvents="none">
        {CRIB_X.map((cx, k) => (
          <View key={cx}>
            <View style={[styles.crib, { left: cx }]} />
            <View style={[styles.blanket, { left: cx + 6 }]} />
            <Text style={[styles.name, { left: CRIB_MID[k] - NAME_W / 2 }]}>{NAME[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === BIRTH}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === BIRTH}
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

  wall: {
    position: 'absolute', left: WALL_X, top: WALL_Y, width: WALL_W, height: CRIB_Y + CRIB_H - WALL_Y,
    backgroundColor: INK,
  },
  crib: {
    position: 'absolute', top: CRIB_Y, width: CRIB_W, height: CRIB_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  blanket: { position: 'absolute', top: CRIB_Y + 18, width: CRIB_W - 12, height: 10, backgroundColor: PAPER },
  col: { position: 'absolute', width: COL_W, backgroundColor: STONE, borderWidth: 1.5, borderColor: INK },
  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: SOFT, includeFontPadding: false,
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

export function Political29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political29Scene} band={[238, 512]} camera={CAM} />;
}
