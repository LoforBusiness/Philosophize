import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// TWO BARS, AND ONLY ONE OF THEM OBEYS THE READER.
//
// The left bar is the claim and tracks the knob exactly. The right bar is the hit
// rate and is deliberately CONCAVE — it keeps up early and gives up near the top,
// which is the shape of the overconfidence effect and the whole point of the
// picture. `holds()` is the curve, written once and used by both the bar and the
// gap bracket so they can never disagree.
//
// · both bars are 46 wide, growing up from the ground line: the claim at x 168…214
//   and the hit rate at x 240…286. Full height is 250, so a bar at 1 has its top
//   edge at y 250.
// · the gap bracket spans the two tops at x 214…240 and is drawn only when the
//   script asks for it; it is never taller than the claim bar.
// · the caption sits at y 344…358 above both bars.
// · the figure stands at x 54 facing right and reaches x 87, eighty-one clear of
//   the left bar.
//
// Ink runs from the caption (226) to the ground line (500). Band 220…512 = 292 (H59).

const BAR_W = 46;
const BAR_H = 250;
const CLAIM_L = 168;
const HOLD_L = 240;
const CAP_T = 226;
const FIG_X = 54;

/**
 * How often a claim at confidence `c` actually holds — the concave curve.
 *
 * Deliberately not a straight line and not a guess at real data either: it tracks
 * the shape the effect has (honest low down, opening up top) and bottoms out at
 * 0.5, because a claim you are making at all is at least a coin flip.
 */
function holds(c: number) {
  'worklet';
  return 0.5 + 0.5 * (c <= 0 ? 0 : Math.pow(c, 2.1)) * 0.62 + 0.5 * c * 0.38;
}

const CLAIM = BEATS.map((b) => b.claim ?? 0);
const GAP = BEATS.map((b) => b.gap ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology34'));

export default function Epistemology34Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const grow = ease01(bt.value / 1.0);
    const c = live ? dragPos.value : carry(cv, 0, n, CLAIM[p], CLAIM[n], grow);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      claim: c,
      // Normalised so a coin flip sits at the bottom of the bar rather than
      // halfway up it — the reader is watching the GAP, not the absolute rate.
      hold: (holds(c) - 0.5) * 2,
      gap: carry(cv, 1, n, GAP[p], GAP[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const claimStyle = useAnimatedStyle(() => ({ height: BAR_H * SCENE.value.claim }));
  const holdStyle = useAnimatedStyle(() => ({ height: BAR_H * SCENE.value.hold }));
  const gapStyle = useAnimatedStyle(() => {
    const top = GROUND - BAR_H * SCENE.value.claim;
    const bot = GROUND - BAR_H * SCENE.value.hold;
    return { opacity: SCENE.value.gap, top, height: bot - top < 0 ? 0 : bot - top };
  });

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>WHAT YOU SAY   ·   WHAT HOLDS</Text>

      <Animated.View style={[styles.claim, claimStyle]} pointerEvents="none" />
      <Animated.View style={[styles.hold, holdStyle]} pointerEvents="none" />
      <Animated.View style={[styles.gap, gapStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: 130, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  // Both grow UP from the ground line, so `bottom` is pinned and `height` animates.
  claim: { position: 'absolute', left: CLAIM_L, bottom: STAGE_H - GROUND, width: BAR_W, backgroundColor: INK },
  hold: {
    position: 'absolute', left: HOLD_L, bottom: STAGE_H - GROUND, width: BAR_W,
    borderWidth: 2, borderColor: INK,
  },
  // The space between the two tops — a dashed bracket, never a second colour (§19).
  gap: {
    position: 'absolute', left: CLAIM_L + BAR_W, width: HOLD_L - CLAIM_L - BAR_W,
    borderTopWidth: 2, borderBottomWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
});

export function Epistemology34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology34Scene} band={[220, 512]} camera={CAM} />;
}
