import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology33Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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

const DATUM = BEATS.map((b) => b.datum ?? 0);
const SEEMS = BEATS.map((b) => b.seems ?? 0);
const BAR = BEATS.map((b) => b.bar ?? 0);
const EV = BEATS.map((b) => b.ev ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology33'));

export default function Epistemology33Scene({ clock, bt, bi, i, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(4);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const rise = ease01(bt.value / 1.0);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      bar: live ? pickPos.value : carry(cv, 0, n, BAR[p], BAR[n], rise),
      ev: carry(cv, 1, n, EV[p], EV[n], rise),
      // Carried, so each fades out as well as in (group L).
      datum: carry(cv, 2, n, DATUM[p], DATUM[n], rise),
      seems: carry(cv, 3, n, SEEMS[p], SEEMS[n], rise),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (BAR_LOW - BAR_HIGH) * (1 - SCENE.value.bar) }],
  }));

  // ── the two tap events (group AH) ──────────────────────────────────────────
  //
  // THE DATUM IS DRAWN AT THE COLUMN'S OWN TOP and runs OUT from it, so what the
  // reader watches is a measurement being taken off the thing that has not moved.
  const datumStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.datum,
    transform: [{ scaleX: SCENE.value.datum }],
  }));
  const datumCapStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.datum - 0.5) / 0.5) }));
  // And the verdict, in the clear column right of the bar's own span.
  const seemsStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.seems,
    transform: [{ scale: 0.94 + 0.06 * SCENE.value.seems }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>WHAT YOU HAVE</Text>

      {Array.from({ length: BRICKS }, (_, k) => (
        <Brick key={k} k={k} SCENE={SCENE} />
      ))}

      <Animated.View style={[styles.barWrap, barStyle]} pointerEvents="none">
        <Text style={styles.barLabel} numberOfLines={1}>WHAT IT HAS TO CLEAR</Text>
        <View style={styles.bar} />
      </Animated.View>

      {/* The evidence is exactly as tall as it was. */}
      <Animated.View style={[styles.datumRule, datumStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.datumCap, datumCapStyle]} pointerEvents="none">UNCHANGED</Animated.Text>

      {/* And yet. */}
      <Animated.View style={[styles.seemsPlate, seemsStyle]} pointerEvents="none">
        <Text style={styles.seemsText}>{'SEEMS\nWRONG NOW'}</Text>
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
  // ── the two tap events (group AH) ──────────────────────────────────────────
  // At the full column's own top, drawn outward from its left edge.
  datumRule: {
    position: 'absolute', left: COL_L - 76, top: COL_TOP - 1, width: 76, height: 2,
    borderTopWidth: 2, borderColor: INK, borderStyle: 'dashed',
    transformOrigin: '100% 50%',
  },
  datumCap: {
    position: 'absolute', left: COL_L - 150, top: COL_TOP - 18, width: 140, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },
  // RIGHT OF THE BAR'S OWN SPAN (it runs BAR_L … BAR_L + BAR_W), so it cannot be
  // crossed by the bar at any height the reader drives it to.
  seemsPlate: {
    position: 'absolute', left: BAR_L + BAR_W + 12, top: 332, width: 88, height: 44,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  seemsText: {
    textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  kicker: {
    position: 'absolute', left: COL_L - 30, top: COL_TOP - 16, width: COL_W + 60,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  brick: {
    position: 'absolute', left: COL_L, width: COL_W, height: BRICK_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },

  barWrap: { position: 'absolute', left: BAR_L, top: BAR_HIGH, width: BAR_W },
  barLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK,
    textAlign: 'center', includeFontPadding: false, marginBottom: 4,
  },
  bar: { height: 4, backgroundColor: INK },
});

export function Epistemology33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology33Scene} band={[218, 512]} camera={CAM} />;
}
