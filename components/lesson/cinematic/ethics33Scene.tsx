import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics33Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// TWELVE COINS THAT MOVE ACROSS UNDER THE READER'S THUMB.
//
// Both columns are drawn from the SAME twelve Views. A coin is never created or
// destroyed, it is placed in the left stack or the right one according to how far
// the transfer has gone — which is the honest picture of the argument, where
// nothing is generated and the only question is where it sits.
//
// · the left column stands at x 166…212 and the right at x 254…300, both growing
//   up from the ground line. A coin is 46 × 13 with a 2 gap, so twelve of them in
//   one column reach y 320 — which would be the top of the band and leaves no room
//   for a caption above it. The columns therefore START level at six each, and the
//   tallest either ever gets is twelve, at y 320.
// · the caption sits at y 302…316 above the tallest possible column.
// · the MORE tag hangs beside the right column at y 336…350.
// · the figure stands at x 48 and reaches x 81, eighty-five clear of the left column.
//
// Ink runs from the caption (244) to the ground line (500). Band 238…512 = 274 (H59).

const COIN_W = 46;
const COIN_H = 18;
const COIN_GAP = 2;
const TOTAL = 12;
/** How many each side holds before anything moves. */
const START_L = 9;
const LEFT_X = 166;
const RIGHT_X = 254;
const CAP_T = 244;
const FIG_X = 48;

const GIVE = BEATS.map((b) => b.give ?? 0);
const MORE = BEATS.map((b) => b.more ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics33'));

export default function Ethics33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const slide = ease01(bt.value / 1.1);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      give: live ? dragPos.value : carry(cv, 0, n, GIVE[p], GIVE[n], slide),
      more: carry(cv, 1, n, MORE[p], MORE[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const moreStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.more }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>YOURS            THEIRS</Text>

      {Array.from({ length: TOTAL }, (_, k) => <Coin key={k} k={k} SCENE={SCENE} />)}

      <Animated.Text style={[styles.more, moreStyle]} numberOfLines={1}>STILL ANOTHER LIFE ▸</Animated.Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One coin. It belongs to whichever column its index falls in, and CROSSES when
 * the transfer reaches it — so a coin slides over rather than blinking out of one
 * stack and into the other.
 */
function Coin({ k, SCENE }: { k: number; SCENE: { value: { give: number } } }) {
  const style = useAnimatedStyle(() => {
    // How many have left the left column so far, as a smooth number.
    const moved = SCENE.value.give * START_L;
    // This coin is one of the top `moved` on the left. Index counts from the top
    // down, so the highest coin goes first — a stack pays from the top.
    const rank = START_L - 1 - k;
    const t = moved - rank;
    const a = t <= 0 ? 0 : t >= 1 ? 1 : t;

    if (k >= START_L) {
      // Already theirs, and it stays put. It only has to move UP as arrivals stack
      // beneath it, which they do not — arrivals land on top. So: nothing.
      return { left: RIGHT_X, top: GROUND - (k - START_L + 1) * (COIN_H + COIN_GAP), opacity: 1 };
    }
    const fromTop = GROUND - (k + 1) * (COIN_H + COIN_GAP);
    // Landing height on the right: on top of whatever is already there.
    const landed = TOTAL - START_L + Math.ceil(moved - t + a);
    const toTop = GROUND - landed * (COIN_H + COIN_GAP);
    return {
      left: LEFT_X + (RIGHT_X - LEFT_X) * a,
      top: fromTop + (toTop - fromTop) * a,
      // A small lift through the middle of the crossing, so it arcs rather than slides.
      opacity: 1,
      transform: [{ translateY: -14 * Math.sin(a * Math.PI) }],
    };
  });
  return <Animated.View style={[styles.coin, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: LEFT_X - 10, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  more: {
    position: 'absolute', left: RIGHT_X - 6, top: 278, width: 130,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: INK,
    includeFontPadding: false,
  },

  coin: {
    position: 'absolute', width: COIN_W, height: COIN_H, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK,
  },
});

export function Ethics33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics33Scene} band={[238, 512]} camera={CAM} />;
}
