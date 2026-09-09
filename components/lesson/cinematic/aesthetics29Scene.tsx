import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics29Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO TRAYS OVER ONE BOOK, AND WHAT ENDS UP IN EACH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO TRAYS of 130×18, both at x 140 (140…270): FACTS at y 274…292 and
//   UNDERSTANDING at y 316…334. Each is a STONE box with a 2 ink edge and an ink
//   fill that grows from its left wall.
// · THEIR NAMES sit to the RIGHT of the trays at x 282, y 278 and y 320, so a
//   filling tray never runs over its own label (D31).
// · the BOOK is a 76×60 STONE block at x 160 (160…236), y 356…416, with a 5-wide
//   ink spine and three RULE page rules. It never changes: the same invented
//   story is on the table at every setting of the control.
// · a STEM of 3 runs from the book's top at x 197 up to the lower tray, y 334…356.
// · THE TWO TRAYS FILL AT DIFFERENT RATES off one value — understanding from 0.2
//   and facts only past 0.7 — which is the claim itself rather than a decoration.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, thirty-five units clear of the trays at 140.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const TRAY_X = 140;
const TRAY_W = 130;
const TRAY_H = 18;
const TRAY_Y = [274, 316];
const TRAY_CAP = ['FACTS', 'UNDERSTANDING'];
const CAP_X = 282;
const CAP_W = 110;

const BOOK_X = 160;
const BOOK_Y = 356;
const BOOK_W = 76;
const BOOK_H = 60;

const HEAD_T = 244;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['NOTHING AT ALL', 'A DEEPER GRASP', 'NEW HISTORICAL FACTS'];
const PLATE_ID = ['nothing', 'grasp', 'facts'];
/** Not new facts, but a familiar thing seen from inside. */
const GRASP = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TRAYS = BEATS.map((b) => (b.trays ? 1 : 0));
const BOOK = BEATS.map((b) => (b.book ? 1 : 0));
const GIVES = BEATS.map((b) => b.gives ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics29'));

export default function Aesthetics29Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      trays: carry(cv, 1, n, TRAYS[p], TRAYS[n], tr),
      book: carry(cv, 2, n, BOOK[p], BOOK[n], tr),
      // HOW MUCH THE NOVEL HANDS OVER, which is the only thing the knob measures.
      gives: carry(cv, 3, n, GIVES[p], reacting ? dragPos.value : GIVES[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const traysStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.trays }));
  const bookStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.book }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  // FACTS ARRIVE LATE AND UNDERSTANDING ARRIVES EARLY, off one value. That
  // difference IS the claim, so it is stated here rather than in two channels.
  const factFill = useAnimatedStyle(() => ({ width: (TRAY_W - 4) * clamp01((SCENE.value.gives - 0.7) / 0.3) }));
  const graspFill = useAnimatedStyle(() => ({ width: (TRAY_W - 4) * clamp01((SCENE.value.gives - 0.2) / 0.45) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.head} pointerEvents="none">WHAT THE NOVEL HANDS OVER</Text>

      <Animated.View style={[StyleSheet.absoluteFill, traysStyle]} pointerEvents="none">
        {TRAY_Y.map((ty, k) => (
          <View key={ty}>
            <View style={[styles.tray, { top: ty }]} />
            <Text style={[styles.trayText, { top: ty + 5 }]}>{TRAY_CAP[k]}</Text>
          </View>
        ))}
        <Animated.View style={[styles.fill, { top: TRAY_Y[0] + 2 }, factFill]} />
        <Animated.View style={[styles.fill, { top: TRAY_Y[1] + 2 }, graspFill]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, bookStyle]} pointerEvents="none">
        <View style={styles.stem} />
        <View style={styles.book} />
        <View style={styles.spine} />
        {[16, 30, 44].map((dy) => (
          <View key={dy} style={[styles.page, { top: BOOK_Y + dy }]} />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === GRASP}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === GRASP}
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

  head: {
    position: 'absolute', left: TRAY_X, top: HEAD_T, width: 252,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  tray: {
    position: 'absolute', left: TRAY_X, width: TRAY_W, height: TRAY_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  fill: { position: 'absolute', left: TRAY_X + 2, height: TRAY_H - 4, backgroundColor: INK },
  trayText: {
    position: 'absolute', left: CAP_X, width: CAP_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  stem: { position: 'absolute', left: BOOK_X + BOOK_W / 2 - 1.5, top: TRAY_Y[1] + TRAY_H, width: 3, height: BOOK_Y - TRAY_Y[1] - TRAY_H, backgroundColor: INK },
  book: {
    position: 'absolute', left: BOOK_X, top: BOOK_Y, width: BOOK_W, height: BOOK_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  spine: { position: 'absolute', left: BOOK_X, top: BOOK_Y, width: 5, height: BOOK_H, backgroundColor: INK },
  page: { position: 'absolute', left: BOOK_X + 16, width: BOOK_W - 28, height: 2, backgroundColor: RULE },

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

export function Aesthetics29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics29Scene} band={[240, 512]} camera={CAM} />;
}
