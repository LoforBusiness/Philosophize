import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic33Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A CURVE MADE OF SEGMENTS, BECAUSE A CURVE MADE OF SVG WOULD COST TEN FRAMES.
//
// §17 rule 7 is the constraint that shapes this whole scene: an animated <Svg>
// path is the one thing that must not happen, and "hundreds of Views under one
// transform is the same bill". So the curve is TWENTY-TWO segments — each a thin
// View rotated to join the last — which is few enough to be free and enough to
// read as a line. Each segment owns its own animated style, so nothing recomputes
// the whole curve to move one piece.
//
// · the grid is x 150…340, y 240…470. The seven dots never move; their positions
//   are hand-written below so the picture is identical every run and checkable.
// · the eighth dot (the new measurement) sits at x 352, outside the fitted span,
//   which is what makes it a prediction rather than a fit.
// · the curve spans the same x range at 22 segments of ~8.6 each.
// · the caption sits at y 342…356 above the grid.
// · the figure stands at x 52 and reaches x 85, sixty-five clear of the grid.
//
// Ink runs from the caption (222) to the ground line (500). Band 216…512 = 296 (H59).

const GRID_L = 150;
const GRID_R = 340;
const GRID_T = 240;
const GRID_B = 470;
const SEGS = 22;
const SEG_W = (GRID_R - GRID_L) / SEGS;
const CAP_T = 222;
const FIG_X = 52;

/** The seven measurements, as fractions of the grid: [across, up]. */
const DOTS: readonly (readonly [number, number])[] = [
  [0.02, 0.30], [0.18, 0.52], [0.33, 0.41], [0.50, 0.66], [0.66, 0.55], [0.82, 0.78], [0.97, 0.68],
];
/** The eighth, which arrives later and is not fitted. */
const NEXT: readonly [number, number] = [1.12, 0.74];

const gridY = (up: number) => GRID_B - up * (GRID_B - GRID_T);

/**
 * The fitted value at `u` across the grid, for a curve with `b` bend, 0…1.
 *
 * At b = 0 it is the least-squares straight line through the dots. At b = 1 it
 * whips through every one of them. In between it is the blend, which is exactly
 * the picture the lesson argues about — and one function, so the segments and the
 * dots can never disagree about where the curve is.
 */
function fit(u: number, b: number) {
  'worklet';
  const line = 0.36 + 0.34 * u;
  // A wobble tuned to pass near each dot: three harmonics is enough to look like
  // a curve that has been tortured into place without needing a real spline.
  const wobble =
    0.13 * Math.sin(u * 9.4 + 0.6) +
    0.08 * Math.sin(u * 17.1 + 2.1) +
    0.05 * Math.sin(u * 26.5 + 4.3);
  return line + wobble * b;
}

const BEND = BEATS.map((b) => b.bend ?? 0);
const NEXTD = BEATS.map((b) => b.nextDot ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic33'));

export default function Logic33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = mixStance(emoteHold(P[p], t), emoteLive(P[n], t, bt.value), tr);
    const grow = ease01(bt.value / 1.0);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      bend: live ? dragPos.value : lerp(BEND[p], BEND[n], grow),
      next: lerp(NEXTD[p], NEXTD[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const nextStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.next }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>SEVEN MEASUREMENTS</Text>

      <View style={styles.axisY} pointerEvents="none" />
      <View style={styles.axisX} pointerEvents="none" />

      {Array.from({ length: SEGS }, (_, k) => <Seg key={k} k={k} SCENE={SCENE} />)}

      {DOTS.map(([u, v], k) => (
        <View key={k} style={[styles.dot, { left: GRID_L + u * (GRID_R - GRID_L) - 4, top: gridY(v) - 4 }]} pointerEvents="none" />
      ))}

      <Animated.View
        style={[styles.nextDot, { left: GRID_L + NEXT[0] * (GRID_R - GRID_L) - 5, top: gridY(NEXT[1]) - 5 }, nextStyle]}
        pointerEvents="none"
      />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One segment of the curve. Own component — `useAnimatedStyle` cannot be called
 * inside a `.map()`, which is the hooks rule broken twenty-two times over.
 */
function Seg({ k, SCENE }: { k: number; SCENE: { value: { bend: number } } }) {
  const style = useAnimatedStyle(() => {
    const b = SCENE.value.bend;
    const u0 = k / SEGS;
    const u1 = (k + 1) / SEGS;
    const y0 = gridY(fit(u0, b));
    const y1 = gridY(fit(u1, b));
    const dy = y1 - y0;
    return {
      top: y0,
      // Long enough to close the gap on a steep segment, and rotated about its
      // left end so consecutive segments meet.
      width: Math.sqrt(SEG_W * SEG_W + dy * dy),
      transform: [{ rotate: `${Math.atan2(dy, SEG_W)}rad` }],
    };
  });
  return <Animated.View style={[styles.seg, { left: GRID_L + k * SEG_W }, style]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: GRID_L - 20, top: CAP_T, width: 230,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  axisY: { position: 'absolute', left: GRID_L - 10, top: GRID_T - 6, width: 1.5, height: GRID_B - GRID_T + 18, backgroundColor: RULE },
  axisX: { position: 'absolute', left: GRID_L - 10, top: GRID_B + 12, width: GRID_R - GRID_L + 46, height: 1.5, backgroundColor: RULE },

  seg: { position: 'absolute', height: 2.5, backgroundColor: INK, transformOrigin: '0% 50%' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  // Hollow, so the measurement the curve failed to predict is plainly a different
  // kind of thing from the seven it was fitted to.
  nextDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: INK },
});

export function Logic33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic33Scene} band={[216, 512]} camera={CAM} />;
}
