import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics33Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A CANVAS THAT CLEANS FROM THE LEFT AS THE READER DRAGS.
//
// The swab travels across the picture and everything behind it is clean, so the
// canvas carries its own before-and-after at every moment. That is done with a
// CLIPPED overlay — the dirty layers sit on top and their width shrinks — rather
// than by fading, because a fade would clean the whole canvas at once and lose the
// argument, which is that partial cleaning is exactly what a restorer does.
//
// §19 has no second colour, so "dirty" is hatching: nine diagonal strokes over the
// picture, which read as grime at any size and cost nine Views.
//
// · the frame is 168 × 238 at x 160…328, y 246…484, with an inner picture area at
//   x 168…320, y 254…476.
// · the swab is a 4-wide ink rule that rides the cleaning edge, full picture height.
// · the layer labels stack down the right at x 334…392, y 254…326, drawn only when
//   the script asks for them — the widest is "VARNISH" at 7pt, well inside 58.
// · the caption sits at y 228…242 above the frame.
// · the figure stands at x 52 and reaches x 85, seventy-five clear of the frame.
//
// Ink runs from the caption (228) to the ground line (500). Band 222…512 = 290 (H59).

const FR_L = 160;
const FR_T = 246;
const FR_W = 168;
const FR_H = 238;
const PIC_L = FR_L + 8;
const PIC_T = FR_T + 8;
const PIC_W = FR_W - 16;
const PIC_H = FR_H - 16;
const CAP_T = 228;
const FIG_X = 52;

const LAYERS = ['DIRT', 'VARNISH', 'GLAZE', 'PAINT'];

const CLEAN = BEATS.map((b) => b.clean ?? 0);
const LAYERED = BEATS.map((b) => b.layers ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics33'));

export default function Aesthetics33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const wipe = ease01(bt.value / 1.2);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      clean: live ? dragPos.value : carry(cv, 0, n, CLEAN[p], CLEAN[n], wipe),
      layers: carry(cv, 1, n, LAYERED[p], LAYERED[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The dirty overlay is pinned to the RIGHT edge and loses width, so the clean
  // part grows from the left and the boundary is a hard edge the swab can sit on.
  const grimeStyle = useAnimatedStyle(() => ({ width: PIC_W * (1 - SCENE.value.clean) }));
  const swabStyle = useAnimatedStyle(() => ({ left: PIC_L + PIC_W * SCENE.value.clean - 2 }));
  const layerStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.layers }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>ONE CANVAS, FOUR HUNDRED YEARS</Text>

      <View style={styles.frame} pointerEvents="none">
        {/* THE PAINTING UNDERNEATH — a simple ink composition, always fully drawn.
            What changes is only how much of it the grime is still covering. */}
        <View style={styles.hill} />
        <View style={styles.sun} />
        <View style={styles.treeTrunk} />
        <View style={styles.treeTop} />
        <View style={styles.horizon} />

        {/* THE GRIME — hatching, because there is no second colour to dirty with. */}
        <Animated.View style={[styles.grime, grimeStyle]} pointerEvents="none">
          {Array.from({ length: 9 }, (_, k) => (
            <View key={k} style={[styles.hatch, { top: k * 15 - 10 }]} />
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.swab, swabStyle]} pointerEvents="none" />

      <Animated.View style={[styles.layerCol, layerStyle]} pointerEvents="none">
        {LAYERS.map((l) => (
          <Text key={l} style={styles.layerName} numberOfLines={1}>{l}</Text>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: FR_L - 20, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  frame: {
    position: 'absolute', left: FR_L, top: FR_T, width: FR_W, height: FR_H,
    borderWidth: 4, borderColor: INK, backgroundColor: PAPER, overflow: 'hidden',
  },

  horizon: { position: 'absolute', left: 0, right: 0, top: 74, height: 1.5, backgroundColor: SOFT },
  hill: {
    position: 'absolute', left: 14, top: 44, width: 84, height: 84, borderRadius: 42,
    backgroundColor: STONE,
    borderWidth: 2, borderColor: INK,
  },
  sun: {
    position: 'absolute', right: 22, top: 18, width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: INK,
  },
  treeTrunk: { position: 'absolute', right: 40, top: 62, width: 4, height: 30, backgroundColor: INK },
  treeTop: {
    position: 'absolute', right: 30, top: 44, width: 24, height: 24, borderRadius: 12,
    backgroundColor: INK,
  },

  grime: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    overflow: 'hidden', backgroundColor: 'transparent',
  },
  // Long enough that a 40° stroke still crosses the full picture width.
  hatch: {
    position: 'absolute', left: -60, width: 300, height: 3.5,
    backgroundColor: SOFT, opacity: 0.55, transform: [{ rotate: '40deg' }],
  },

  swab: { position: 'absolute', top: PIC_T - 6, width: 4, height: PIC_H + 12, backgroundColor: INK },

  layerCol: { position: 'absolute', left: FR_L + FR_W + 6, top: FR_T + 8, width: 58, gap: 12 },
  layerName: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
});

export function Aesthetics33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics33Scene} band={[222, 512]} camera={CAM} />;
}
