import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// AN ERROR BAND THAT CLOSES TOO SLOWLY TO FEEL FAIR.
//
// The bracket's half-width is `1/sqrt(n)`, scaled — the real law, not a linear
// stand-in, because the whole lesson is that the shape of that curve is
// disappointing. A reader who drags this will spend two thirds of the rail
// watching almost nothing happen, which is the argument.
//
// · the scale runs x 156…336 across, and the band lives at y 244…442.
// · the TRUE line is a dashed vertical at 0.62 of the span, x 268. It never moves.
// · the estimate is a solid vertical, and the band is a bracket around it. When
//   `biased` the estimate slides to 0.30 (x 210) and stays there however tight the
//   band gets, which is the second question's whole content.
// · the widest the band ever gets is the full span, so nothing leaves x 156…336.
// · the caption sits at y 224…238; the ESTIMATE / TRUE labels at y 220…460.
// · the figure stands at x 50 and reaches x 83, seventy-three clear of the scale.
//
// Ink runs from the caption (224) to the ground line (500). Band 218…512 = 294 (H59).

const SCL_L = 156;
const SCL_R = 336;
const SCL_W = SCL_R - SCL_L;
const BAND_T = 244;
const BAND_H = 198;
const TRUE_AT = 0.62;
const BIASED_AT = 0.30;
const CAP_T = 224;
const FIG_X = 50;

/**
 * How wide the bracket is, as a fraction of the span, for sample position `u`.
 *
 * The real 1/sqrt(n) law. `n` runs 4…900 across the rail, so the band starts at
 * half the span and ends near a fortieth of it — and does most of that in the
 * first quarter of the drag, which is precisely what the reader is meant to
 * notice and resent.
 */
function halfWidth(u: number) {
  'worklet';
  const n = 4 + u * u * 896;
  return 1.0 / Math.sqrt(n);
}

const N = BEATS.map((b) => b.n ?? 0);
const BIAS = BEATS.map((b) => b.biased ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic34'));

export default function Logic34Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const grow = ease01(bt.value / 1.0);
    const u = live ? dragPos.value : lerp(N[p], N[n], grow);
    const bias = lerp(BIAS[p], BIAS[n], tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // Half-width in fractions of the span, clamped so a tiny sample cannot draw
      // a bracket wider than the scale it sits on.
      hw: Math.min(halfWidth(u), 0.5),
      at: lerp(TRUE_AT, BIASED_AT, bias),
      bias,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const bandStyle = useAnimatedStyle(() => {
    const c = SCENE.value.at;
    const hw = SCENE.value.hw;
    const l = Math.max(0, c - hw);
    const r = Math.min(1, c + hw);
    return { left: SCL_L + l * SCL_W, width: (r - l) * SCL_W };
  });
  const estStyle = useAnimatedStyle(() => ({ left: SCL_L + SCENE.value.at * SCL_W - 1.5 }));
  const estLabelStyle = useAnimatedStyle(() => ({ left: SCL_L + SCENE.value.at * SCL_W - 40 }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>WHAT FRACTION ARE DARK?</Text>

      <View style={styles.axis} pointerEvents="none" />

      {/* The truth, which never moves and which you are not allowed to look at. */}
      <View style={styles.trueLine} pointerEvents="none" />
      <Text style={styles.trueLabel} numberOfLines={1}>TRUE</Text>

      <Animated.View style={[styles.band, bandStyle]} pointerEvents="none" />
      <Animated.View style={[styles.est, estStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.estLabel, estLabelStyle]} numberOfLines={1}>ESTIMATE</Animated.Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: SCL_L - 16, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  axis: { position: 'absolute', left: SCL_L, top: BAND_T + BAND_H, width: SCL_W, height: 1.5, backgroundColor: RULE },

  trueLine: {
    position: 'absolute', left: SCL_L + TRUE_AT * SCL_W - 1, top: BAND_T - 6, width: 2, height: BAND_H + 12,
    borderLeftWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  trueLabel: {
    position: 'absolute', left: SCL_L + TRUE_AT * SCL_W - 20, top: BAND_T + BAND_H + 6, width: 40,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 1, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  // The bracket: open top and bottom, so it reads as a span rather than a block.
  band: {
    position: 'absolute', top: BAND_T, height: BAND_H,
    borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2, borderBottomWidth: 2,
    borderColor: INK, borderRadius: 3, opacity: 0.55,
  },
  est: { position: 'absolute', top: BAND_T - 10, width: 3, height: BAND_H + 20, backgroundColor: INK },
  estLabel: {
    position: 'absolute', top: BAND_T - 24, width: 80,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 1, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
});

export function Logic34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic34Scene} band={[218, 512]} camera={CAM} />;
}
