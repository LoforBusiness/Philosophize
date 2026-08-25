import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics23Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A TUNE, AND ONE ARROW WITH THREE PLACES TO AIM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the STAVE is five 1.2-thick rules at y 250 · 258 · 266 · 274 · 282, running
//   x 28…372. It is the one object here that is a picture rather than a diagram,
//   which matters: the lesson is about something you hear, and a stage made only
//   of labelled boxes would be a lecture slide.
// · SEVEN NOTES, heads 13×9, at x 44 · 90 · 136 · 182 · 228 · 274 · 320 with
//   tops 268 · 262 · 274 · 266 · 270 · 262 · 276, each with a 2×22 stem rising
//   from its right edge. The line rises and falls rather than climbing, so it
//   reads as a tune and not a scale.
// · the CAPTION sits at y 300 and the THREE PLATES at y 314…356 — 102 wide at
//   x 28 · 150 · 272, centres 79 · 201 · 323.
// · the ARROW is a 3-wide riser from y 288 to y 306 plus a head of three bars
//   (12 · 8 · 4 wide) at y 306 · 309 · 312, and its x is carried, so moving the
//   claim moves the arrow across the stage rather than cutting to it (L1).
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the plates at y 356, so 41 units stay clear.
//
// Ink runs y 240 (the highest stem) … y 500. BAND 234…512 = 278, with the
// 103-unit figure at 37.1%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const ST_L = 28;
const ST_R = 372;
const ST_Y = [250, 258, 266, 274, 282];

const NOTE_X = [44, 90, 136, 182, 228, 274, 320];
const NOTE_TOP = [268, 262, 274, 266, 270, 262, 276];
const NOTE_W = 13;
const NOTE_H = 9;
const STEM_H = 22;

const CAP_Y = 300;
const PL_Y = 314;
const PL_H = 42;
const PL_W = 102;
const PL_X = [28, 150, 272];
const PL_MID = [79, 201, 323];
const PL_TEXT = ['A MOOD', 'A BIRD', 'NOTHING OUTSIDE ITSELF'];

const AR_TOP = 288;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const STAVE = BEATS.map((b) => b.stave ?? 0);
const PLATES = BEATS.map((b) => b.plates ?? 0);
const POINT = BEATS.map((b) => b.point ?? 0);
const AIM = BEATS.map((b) => PL_MID[b.aim ?? 0]);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics23'));

export default function Aesthetics23Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
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

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      stave: carry(cv, 1, n, STAVE[p], STAVE[n], tr),
      plates: carry(cv, 2, n, PLATES[p], PLATES[n], tr),
      point: carry(cv, 3, n, POINT[p], POINT[n], tr),
      aim: carry(cv, 4, n, AIM[p], AIM[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stave }));
  const plStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  // The arrow travels; it never cuts from one plate to the next (L1).
  const arStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.point,
    transform: [{ translateX: SCENE.value.aim }],
  }));

  const notes = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, stStyle]} pointerEvents="none">
        {ST_Y.map((y) => <View key={y} style={[styles.staveLine, { top: y }]} />)}
        {notes.map((k) => (
          <View key={k}>
            <View style={[styles.stem, { left: NOTE_X[k] + NOTE_W - 2, top: NOTE_TOP[k] - STEM_H + 4 }]} />
            <View style={[styles.head, { left: NOTE_X[k], top: NOTE_TOP[k] }]} />
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, plStyle]} pointerEvents="none">
        <Text style={styles.caption}>IT POINTS AT</Text>
        {PL_X.map((px, k) => (
          <View key={px}>
            <View style={[styles.plate, { left: px }, k === 2 && styles.plateOpen]} />
            <Text style={[styles.plateText, { left: px }]} numberOfLines={2}>{PL_TEXT[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.arrow, arStyle]} pointerEvents="none">
        <View style={styles.riser} />
        <View style={[styles.headBar, { top: 18, left: -6, width: 12 }]} />
        <View style={[styles.headBar, { top: 21, left: -4, width: 8 }]} />
        <View style={[styles.headBar, { top: 24, left: -2, width: 4 }]} />
      </Animated.View>

      {PL_X.map((px, k) => (
        <Target
          key={px}
          id={`p${k}`}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: px }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 2 ? (answered && styles.right) : (answered && picked === `p${k}` && styles.wrong),
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  staveLine: { position: 'absolute', left: ST_L, width: ST_R - ST_L, height: 1.2, backgroundColor: SOFT },
  head: { position: 'absolute', width: NOTE_W, height: NOTE_H, borderRadius: 5, backgroundColor: INK },
  stem: { position: 'absolute', width: 2, height: STEM_H, backgroundColor: INK },

  caption: {
    position: 'absolute', left: ST_L, top: CAP_Y,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  plate: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateOpen: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: SOFT },
  plateText: {
    position: 'absolute', top: PL_Y + 12, width: PL_W, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  arrow: { position: 'absolute', left: 0, top: AR_TOP, width: 0, height: 0 },
  riser: { position: 'absolute', left: -1.5, top: 0, width: 3, height: 18, backgroundColor: INK },
  headBar: { position: 'absolute', height: 3, backgroundColor: INK },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics23Scene} band={[234, 512]} camera={CAM} />;
}
