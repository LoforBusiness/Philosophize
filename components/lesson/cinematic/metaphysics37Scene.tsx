import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics37Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE GLASS THAT NEVER MOVES, AND EVERYTHING ELSE THAT DOES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SHELF is a 3-thick rule from x 128 to x 384 at y 396, with two brackets
//   dropping 12 below it at x 148 and x 360.
// · the GLASS stands on it at x 240…282, y 340…396: a bowl (42 wide, 34 tall,
//   rounded at the bottom), a 4-wide stem and a 26-wide foot. It is drawn ONCE
//   and never animated — no wobble, no shatter, no scale. Everything the lesson
//   claims depends on it doing nothing.
// · the HAMMER hangs above at x 258, pivoting about (258, 250): a 3-thick shaft
//   58 long with a 22×14 head. It swings from −64° to −6°, so at full swing the
//   head sits at the rim of the bowl and never inside it.
// · the WARD is a 60-radius ring centred on the glass's bowl, drawn only when the
//   blow is stopped — an outline, no fill, so the glass stays visible through it.
// · the four LABELS are 150×24 boxes at x 128, stacked y 258, 286, 314, 342 —
//   they occupy the air the hammer uses, so they and the hammer never share a
//   beat, which the script enforces.
// · the figure stands at x 56 and walks to 128; crown ~397, level with the shelf
//   and clear of it to the left.
//
// Ink runs y 250 (the hammer pivot) … y 500 (ground). BAND 232…512 = 280 (H59),
// and the 103-unit figure is 37% of it (H58).
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const SHELF_Y = 396;
const GLASS_X = 240;

const PIVOT_X = 258;
const PIVOT_Y = 250;
const SWING_FROM = -64;
const SWING_TO = -6;

const LABEL_X = 128;
const LABEL_Y = [258, 286, 314, 342];
const LABEL_TEXT = ['WHAT IT DID', 'WHAT IT IS MADE OF', 'WHAT IT WOULD DO', 'WHAT WE EXPECT'];
const LABEL_ID = ['did', 'made', 'would', 'expect'];

const CAP_T = 236;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SHELF = BEATS.map((b) => (b.shelf ? 1 : 0));
const HAMMER = BEATS.map((b) => (b.hammer ? 1 : 0));
const SWING = BEATS.map((b) => b.swing ?? 0);
const WARD = BEATS.map((b) => (b.ward ? 1 : 0));
const LABELS = BEATS.map((b) => (b.labels ? 1 : 0));
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics37'));

export default function Metaphysics37Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(7);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The hammer swings on the beat that raises it and HOLDS at the bottom after,
    // so it never re-swings behind the reader; the ward is the same.
    const swinging = SWING[n] > 0 && SWING[p] === 0;
    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      shelfOn: carry(cv, 1, n, SHELF[p], SHELF[n], tr),
      hammerOn: carry(cv, 2, n, HAMMER[p], HAMMER[n], tr),
      swing: swinging ? ease01((bt.value - 0.3) / 0.9) : carry(cv, 3, n, SWING[p], SWING[n], tr),
      wardOn: carry(cv, 4, n, WARD[p], WARD[n], tr),
      labelsOn: carry(cv, 5, n, LABELS[p], LABELS[n], tr),
      // The rail reads the reader's thumb only on its own beat.
      grip: LIVE_D[n] === 1 ? clamp01(dragPos.value) : 0,
      gripOn: carry(cv, 6, n, LIVE_D[p], LIVE_D[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelfOn }));
  const hammerStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hammerOn,
    transform: [{ rotate: `${SWING_FROM + (SWING_TO - SWING_FROM) * SCENE.value.swing}deg` }],
  }));
  const wardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wardOn }));
  const labelsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.labelsOn }));
  // The reader's answer drawn ON the glass: a ring that tightens as they claim it
  // is more fragile. Nothing about the glass itself changes — only the mark.
  const gripStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.gripOn * SCENE.value.grip,
    transform: [{ scale: 1.25 - 0.25 * SCENE.value.grip }],
  }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>NINETY YEARS, UNTOUCHED</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hammerStyle]} pointerEvents="none">
        <View style={styles.shaft} />
        <View style={styles.head} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]} pointerEvents="none">
        <View style={styles.shelf} />
        <View style={[styles.bracket, { left: 148 }]} />
        <View style={[styles.bracket, { left: 360 }]} />
        <View style={styles.bowl} />
        <View style={styles.stem} />
        <View style={styles.foot} />
      </Animated.View>

      <Animated.View style={[styles.ward, wardStyle]} pointerEvents="none" />
      <Animated.View style={[styles.grip, gripStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, labelsStyle]}>
        {LABEL_Y.map((ly, k) => (
          <Target
            key={ly}
            id={LABEL_ID[k]}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.label, { top: ly }]}
          >
            <View
              style={[styles.labelBox, answered && picked === LABEL_ID[k] && k !== 2 && styles.labelWrong]}
              pointerEvents="none"
            />
            <Text style={styles.labelText}>{LABEL_TEXT[k]}</Text>
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

  cap: {
    position: 'absolute', left: 128, top: CAP_T, width: 256,
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  shelf: { position: 'absolute', left: 128, top: SHELF_Y, width: 256, height: 3, backgroundColor: INK },
  bracket: { position: 'absolute', top: SHELF_Y + 3, width: 3, height: 12, backgroundColor: SOFT },

  bowl: {
    position: 'absolute', left: GLASS_X, top: 340, width: 42, height: 34,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  stem: { position: 'absolute', left: GLASS_X + 19, top: 374, width: 4, height: 16, backgroundColor: INK },
  foot: { position: 'absolute', left: GLASS_X + 8, top: 390, width: 26, height: 4, borderRadius: 2, backgroundColor: INK },

  // Pivots about its top end, which is where a hammer is held.
  shaft: {
    position: 'absolute', left: PIVOT_X - 1.5, top: PIVOT_Y, width: 3, height: 58,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },
  head: {
    position: 'absolute', left: PIVOT_X - 11, top: PIVOT_Y + 56, width: 22, height: 14,
    borderRadius: 2, backgroundColor: INK,
  },

  ward: {
    position: 'absolute', left: GLASS_X - 39, top: 297, width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  grip: {
    position: 'absolute', left: GLASS_X - 15, top: 325, width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: INK,
  },

  label: { position: 'absolute', left: LABEL_X, width: 150, height: 24 },
  labelBox: {
    position: 'absolute', left: 0, top: 0, width: 150, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  labelWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  labelText: {
    position: 'absolute', left: 0, top: 7, width: 150, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics37Scene} band={[232, 512]} camera={CAM} />;
}
