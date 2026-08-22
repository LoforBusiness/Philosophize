import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology33Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A COLUMN THAT NEVER MOVES, AND A BAR THAT DOES.
//
// The whole argument is that the left side is constant, so the left side is drawn
// as five identical bricks that arrive once and then are never touched again. Only
// the bar and its label animate — which is also why this is cheap: two moving
// Views over inert art (§17 rule 7).
//
// · the column is 5 bricks 66 wide × 34 tall at x 196…262, stacked from the ground
//   line up to y 405, with a 2 gap. Its top edge is therefore fixed at y 405.
// · the bar is a 132-wide rule at x 163…295 that travels y 462 (low stakes) up to
//   y 240 (the house). It crosses the column top at 0.64 of its travel, which is
//   what puts the flip inside the drag's middle zone rather than at an end.
// · the STAKES caption rides with the bar, 12 above it, so at the top of the travel
//   its own top edge is y 344 — the highest ink in the scene.
// · the figure stands at x 56 facing right and reaches x 89, one hundred and seven
//   clear of the column.
//
// Ink runs from the bar label at full stakes (224) to the ground line (500).
// Band 218…512 = 294 (H59).

const COL_L = 196;
const COL_W = 66;
const BRICK_H = 34;
const BRICK_GAP = 2;
const BRICKS = 5;
/** Where the top brick's upper edge sits — the constant this lesson is about. */
const COL_TOP = GROUND - BRICKS * (BRICK_H + BRICK_GAP);

const BAR_L = 163;
const BAR_W = 132;
const BAR_LOW = 462;
const BAR_HIGH = 240;
const FIG_X = 56;

const BAR = BEATS.map((b) => b.bar ?? 0);
const EV = BEATS.map((b) => b.ev ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology33'));

export default function Epistemology33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const rise = ease01(bt.value / 1.0);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      bar: live ? dragPos.value : carry(cv, 0, n, BAR[p], BAR[n], rise),
      ev: carry(cv, 1, n, EV[p], EV[n], rise),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (BAR_LOW - BAR_HIGH) * (1 - SCENE.value.bar) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>WHAT YOU HAVE</Text>

      {Array.from({ length: BRICKS }, (_, k) => (
        <Brick key={k} k={k} SCENE={SCENE} />
      ))}

      <Animated.View style={[styles.barWrap, barStyle]} pointerEvents="none">
        <Text style={styles.barLabel} numberOfLines={1}>WHAT IT HAS TO CLEAR</Text>
        <View style={styles.bar} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One brick of evidence. Own component — a hook cannot run inside `.map()`. */
function Brick({ k, SCENE }: { k: number; SCENE: { value: { ev: number } } }) {
  const top = GROUND - (k + 1) * (BRICK_H + BRICK_GAP);
  const style = useAnimatedStyle(() => {
    // They stack in from the bottom up, so the column BUILDS on the beat that
    // introduces it rather than appearing whole.
    const e = SCENE.value.ev * BRICKS - k;
    const a = e <= 0 ? 0 : e >= 1 ? 1 : e;
    return { opacity: a, transform: [{ translateX: (1 - a) * -14 }] };
  });
  return <Animated.View style={[styles.brick, { top }, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: COL_L - 30, top: COL_TOP - 16, width: COL_W + 60,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  brick: {
    position: 'absolute', left: COL_L, width: COL_W, height: BRICK_H,
    borderWidth: 1.5, borderColor: INK,
  },

  barWrap: { position: 'absolute', left: BAR_L, top: BAR_HIGH, width: BAR_W },
  barLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: INK,
    textAlign: 'center', includeFontPadding: false, marginBottom: 4,
  },
  bar: { height: 4, backgroundColor: INK },
});

export function Epistemology33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology33Scene} band={[218, 512]} camera={CAM} />;
}
