import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics33Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A TOWER THAT COMES APART UNDER THE READER'S THUMB.
//
// The scatter is the only animated thing and it is nine Views moving — §17 rule 7
// is satisfied by the count, not by a promise: nine transforms is a fraction of a
// path's worth of repaint, and the ground rule and the kicker underneath are inert.
//
// · the stack is nine blocks 46 wide × 24 tall at x 177…223, resting on GROUND and
//   climbing to y 275. Gap of 1 between them, so the tower reads as stacked rather
//   than as one bar.
// · SCATTER holds each block's rubble pose as (dx, dy, deg), hand-written rather
//   than random so the picture is the same every run and can be checked. Every dy
//   is >= 0 — blocks fall, they do not rise — and the widest dx is 118, which puts
//   the far block's outer edge at x 118+223 = 341, inside the stage.
// · the kicker sits at y 338…352, the highest ink in the scene.
// · the figure stands at x 62 facing right; across his poses he reaches x 95, which
//   is 82 clear of the tower's left edge, so he never overlaps the blocks.
//
// Ink runs from the kicker (222) to the ground line (500). Band 216…512 = 296 (H59).

const BLOCK_W = 46;
const BLOCK_H = 24;
const BLOCK_GAP = 1;
const N = 9;
const STACK_X = 177;
const KICK_T = 222;
const FIG_X = 62;

/** Where each block ends up once the tower is rubble: dx, dy, rotation. */
const SCATTER: readonly (readonly [number, number, number])[] = [
  [-2, 0, 0], [26, -1, 8], [-34, 0, -6], [62, -2, 15], [-70, -1, -12],
  [98, 0, 24], [-104, -1, -19], [118, -2, 33], [-126, 0, -28],
];

const FALL = BEATS.map((b) => b.fall ?? 0);
const REV = BEATS.map((b) => b.rev ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics33'));

export default function Metaphysics33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    // A tower takes a moment to go over — 1.1s, so the fall is watchable (C17).
    const drop = ease01(bt.value / 1.1);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // ON THE DRAG BEAT THE READER IS THE ANIMATION. Everywhere else the script
      // drives it. One value, two sources, and the picture never disagrees with
      // whichever is in charge.
      fall: live ? dragPos.value : carry(cv, 0, n, FALL[p], FALL[n], drop),
      rev: carry(cv, 1, n, REV[p], REV[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const revStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rev }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>NINE BLOCKS</Text>
      <Animated.Text style={[styles.rev, revStyle]} numberOfLines={1}>◀  RUNNING BACKWARDS</Animated.Text>

      {SCATTER.map((s, k) => (
        <Block key={k} k={k} to={s} SCENE={SCENE} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One block. Its own component because a hook cannot be called inside `.map()` —
 * `useAnimatedStyle` per block in a loop is the React rule broken nine times over.
 */
function Block({ k, to, SCENE }: {
  k: number;
  to: readonly [number, number, number];
  SCENE: { value: { fall: number } };
}) {
  const bottom = GROUND - (k + 1) * (BLOCK_H + BLOCK_GAP);
  const style = useAnimatedStyle(() => {
    const f = SCENE.value.fall;
    // Blocks lower in the stack barely move; the top ones fly. Scaling the travel
    // by height is what makes it read as a COLLAPSE rather than an explosion.
    const w = 0.35 + 0.65 * (k / (N - 1));
    return {
      transform: [
        { translateX: to[0] * f * w },
        // Everything ends up on the floor, so the drop is whatever it takes to get
        // this block down to the bottom course, plus its own small settle.
        { translateY: (GROUND - BLOCK_H - bottom + to[1]) * f * w },
        { rotate: `${to[2] * f}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[styles.block, { top: bottom, left: STACK_X }, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: 120, top: KICK_T, width: 160,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  rev: {
    position: 'absolute', left: 120, top: KICK_T + 12, width: 160,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  block: {
    position: 'absolute', width: BLOCK_W, height: BLOCK_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: 'transparent',
  },
});

export function Metaphysics33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics33Scene} band={[216, 512]} camera={CAM} />;
}
