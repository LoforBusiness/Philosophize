import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology19Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE DOORS WITH SUBJECTS ON THEM, AND A KEY CUT FOR ONE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FIVE DOORS, 62 wide and 76 tall, at y 282…358, lefts 30 · 100 · 170 · 240 ·
//   310 — the row ends at x 372. Each carries a subject in caps across the top of
//   its face and a small standing mark (a filled bar) at its foot, so "this person
//   really is qualified" is visible on every one of them including the decoys.
// · the QUESTION CHIP is 132×28 at x 134…266, y 234…262 — IS THIS DIET SAFE. It
//   is the only rounded object on the stage, which is what makes it read as a
//   thing that travels rather than another panel.
// · the STRAY is the chip translated to sit over the HEART door (x 100) and
//   tilted 6°, with a 2-thick bar across that door's face. Nothing about the
//   door dims: the credentials stay drawn, because the lesson is that they are
//   real and still do not apply.
// · the SPLIT is two small opposed marks inside the NUTRITION door on the last
//   beats, at y 300 and y 318 — the same door holding two answers.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the doors
//   end at y 358, so 39 units stay clear.
//
// Ink runs y 234 (the chip) … y 500. BAND 228…512 = 284, with the 103-unit
// figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const DOOR_Y = 282;
const DOOR_W = 62;
const DOOR_H = 76;
const DOOR_X = [30, 100, 170, 240, 310];
const DOOR_ID = ['engines', 'heart', 'nutrition', 'tax', 'climate'];
const DOOR_CAP = ['ENGINES', 'HEART', 'NUTRITION', 'TAX LAW', 'CLIMATE'];
/** Years of standing, drawn as a bar at the foot of each door. All are real. */
const STANDING = [0.7, 1, 0.8, 0.9, 0.85];

const CHIP_X = 134;
const CHIP_Y = 234;
const CHIP_W = 132;
const CHIP_H = 28;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const DOORS = BEATS.map((b) => b.doors ?? 0);
const CHIP = BEATS.map((b) => b.chip ?? 0);
const STRAY = BEATS.map((b) => b.stray ?? 0);
const SPLIT = BEATS.map((b) => b.split ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology19'));

export default function Epistemology19Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      doors: carry(cv, 1, n, DOORS[p], DOORS[n], tr),
      chip: carry(cv, 2, n, CHIP[p], CHIP[n], tr),
      stray: carry(cv, 3, n, STRAY[p], STRAY[n], tr),
      split: carry(cv, 4, n, SPLIT[p], SPLIT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const doorsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.doors }));
  const splitStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.split }));
  // The chip travels to the WRONG door and tilts. It never dims — a faded chip
  // would read as the question being withdrawn, and it was not.
  const chipStyle = useAnimatedStyle(() => {
    const s = SCENE.value.stray;
    return {
      opacity: SCENE.value.chip,
      transform: [
        { translateX: (DOOR_X[1] + DOOR_W / 2 - (CHIP_X + CHIP_W / 2)) * s },
        { translateY: 42 * s },
        { rotate: `${s * 6}deg` },
      ],
    };
  });
  const barStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stray }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, doorsStyle]}>
        {DOOR_X.map((dx, k) => (
          <View key={`d${dx}`} pointerEvents="none">
            <View style={[styles.door, { left: dx }]} />
            <Text style={[styles.doorCap, { left: dx }]} numberOfLines={1}>{DOOR_CAP[k]}</Text>
            <View style={[styles.standing, { left: dx + 8, width: (DOOR_W - 16) * STANDING[k] }]} />
          </View>
        ))}

        {/* THE SAME DOOR HOLDING TWO ANSWERS — the last beats' hard case. */}
        <Animated.View style={[StyleSheet.absoluteFill, splitStyle]} pointerEvents="none">
          <View style={[styles.claimMark, { left: DOOR_X[2] + 10, top: 302 }]} />
          <View style={[styles.claimMark, { left: DOOR_X[2] + 10, top: 320 }]} />
        </Animated.View>

        {DOOR_X.map((dx, k) => (
          <Target
            key={DOOR_ID[k]}
            id={DOOR_ID[k]}
            correct={DOOR_ID[k] === 'nutrition'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: dx }]}
          >
            <View
              style={[
                styles.hitBox,
                answered && DOOR_ID[k] === 'nutrition' && styles.hitRight,
                answered && picked === DOOR_ID[k] && DOOR_ID[k] !== 'nutrition' && styles.hitWrong,
              ]}
              pointerEvents="none"
            />
          </Target>
        ))}

        {/* The bar across the heart door: tried, did not turn. */}
        <Animated.View style={[styles.tried, barStyle]} pointerEvents="none" />
      </Animated.View>

      <Animated.View style={[styles.chip, chipStyle]} pointerEvents="none">
        <Text style={styles.chipText}>IS THIS DIET SAFE?</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  door: {
    position: 'absolute', top: DOOR_Y, width: DOOR_W, height: DOOR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  doorCap: {
    position: 'absolute', top: DOOR_Y + 8, width: DOOR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  standing: { position: 'absolute', top: DOOR_Y + DOOR_H - 14, height: 4, backgroundColor: SOFT, borderRadius: 2 },
  claimMark: { position: 'absolute', width: DOOR_W - 20, height: 3, backgroundColor: INK, borderRadius: 1 },

  chip: {
    position: 'absolute', left: CHIP_X, top: CHIP_Y, width: CHIP_W, height: CHIP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 14, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  tried: {
    position: 'absolute', left: DOOR_X[1] - 4, top: DOOR_Y + DOOR_H / 2, width: DOOR_W + 8, height: 2.5,
    backgroundColor: INK,
  },

  hit: { position: 'absolute', top: DOOR_Y, width: DOOR_W, height: DOOR_H },
  hitBox: { width: DOOR_W, height: DOOR_H, borderRadius: 3 },
  hitRight: { borderWidth: 3, borderColor: INK },
  hitWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Epistemology19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology19Scene} band={[228, 512]} camera={CAM} />;
}
