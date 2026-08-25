import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A BULL MADE OF ELEVEN STROKES, LOSING THEM ONE AT A TIME.
//
// Each stroke is one rotated View, so the animal is eleven Views and the whole
// animation is eleven opacities — comfortably inside §17 rule 7, and no <Svg>
// anywhere near it.
//
// THE ORDER MATTERS AND IS NOT ARBITRARY. `KEEP` ranks the strokes by how much
// each one carries: the horns, the back line and the head go last, because those
// are what still say "bull" when everything else has gone. Dragging therefore
// strips detail first and structure never — which is the reason the readout can
// honestly keep saying "still a bull" all the way to the end of the rail.
//
// · the animal occupies x 156…332, y 366…458, and is drawn from strokes given as
//   [left, top, length, degrees] in stage units.
// · the arrows sit at x 150…340, y 248…272 — ABOVE the animal, where they explain
//   it before it is stripped rather than sitting under it as a footnote.
// · the caption is at y 230…244, the highest ink in the scene.
// · the figure stands at x 50 and reaches x 83, seventy-three clear of the animal.
//
// Ink runs from the caption (230) to the ground line (500). Band 224…512 = 288 (H59).

type Stroke = readonly [x: number, y: number, len: number, deg: number];

/** The animal, thickest structure first. Index order is DRAW order, not strip order. */
const STROKES: readonly Stroke[] = [
  [180, 380, 96, 2],     // 0  the back
  [176, 382, 60, 88],    // 1  the hind leg drop
  [268, 384, 58, 86],    // 2  the fore leg drop
  [268, 380, 44, -22],   // 3  the neck up to the head
  [300, 368, 30, 6],     // 4  the head
  [300, 366, 20, -46],   // 5  the near horn
  [316, 364, 18, -14],   // 6  the far horn
  [180, 436, 22, 84],    // 7  the hind hoof
  [270, 438, 20, 86],    // 8  the fore hoof
  [176, 388, 26, 42],    // 9  the tail
  [214, 396, 40, 4],     // 10 the belly
];

/** How well each stroke survives the stripping — higher stays longer. */
const KEEP = [1.00, 0.55, 0.52, 0.86, 0.92, 0.98, 0.96, 0.22, 0.20, 0.10, 0.34];

const CAP_T = 230;
const FIG_X = 50;

const STRIP = BEATS.map((b) => b.strip ?? 0);
const ARROWS = BEATS.map((b) => b.arrows ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics34'));

export default function Aesthetics34Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const wipe = ease01(bt.value / 1.1);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      strip: live ? dragPos.value : carry(cv, 0, n, STRIP[p], STRIP[n], wipe),
      arrows: carry(cv, 1, n, ARROWS[p], ARROWS[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const arrowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arrows }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>ELEVEN STROKES</Text>

      {STROKES.map((s, k) => <Stroke key={k} k={k} s={s} SCENE={SCENE} />)}

      <Animated.View style={[styles.arrows, arrowStyle]} pointerEvents="none">
        <Text style={styles.arrowLine} numberOfLines={1}>PICTURE  ──▶  BULL</Text>
        <Text style={styles.arrowLine} numberOfLines={1}>BULL  ──✕──▶  PICTURE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One stroke of the animal. Own component — a hook cannot run inside `.map()`. */
function Stroke({ k, s, SCENE }: { k: number; s: Stroke; SCENE: { value: { strip: number } } }) {
  const style = useAnimatedStyle(() => {
    // A stroke fades once the stripping passes its keep value. The 0.14 window is
    // what makes them go one at a time rather than all dissolving together.
    const d = (SCENE.value.strip - (1 - KEEP[k])) / 0.14;
    const gone = d <= 0 ? 0 : d >= 1 ? 1 : d;
    return { opacity: 1 - gone };
  });
  return (
    <Animated.View
      style={[
        styles.stroke,
        { left: s[0], top: s[1], width: s[2], transform: [{ rotate: `${s[3]}deg` }] },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: 156, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  // Rotated about the left end, so a stroke's declared x,y is where it starts.
  stroke: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: INK, transformOrigin: '0% 50%' },

  arrows: { position: 'absolute', left: 150, top: 248, width: 190, gap: 4 },
  arrowLine: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
});

export function Aesthetics34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics34Scene} band={[224, 512]} camera={CAM} />;
}
