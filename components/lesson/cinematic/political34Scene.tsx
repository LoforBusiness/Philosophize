import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// FIVE NESTED RINGS, AND TWO MARKS THAT HAVE TO BE BROUGHT TOGETHER.
//
// The rings are inert — five bordered circles that never move. What animates is
// which of them is LIT (the deciding level, driven by the reader) and where the
// dashed effects ring sits (fixed by the script). Bringing the two into agreement
// is the answer, so the picture states the principle rather than illustrating it.
//
// · the rings are concentric on x 250, y 420, at radii 22 / 40 / 58 / 76 / 94. The
//   widest therefore spans x 156…344 and y 326…514 — which reaches BELOW the
//   ground line at 500, so the outermost ring is deliberately drawn as an arc that
//   stops at the ground: its container is clipped at y 500.
// · the level labels run down the left at x 150…196, y 336…430, one per ring.
// · the caption sits at y 310…324, above the widest ring.
// · the figure stands at x 50 and reaches x 83, sixty-seven clear of the labels.
//
// Ink runs from the caption (236) to the ground line (500). Band 230…512 = 282 (H59).

const CX = 250;
const CY = 382;
const RADII = [30, 55, 80, 105, 130];
const RINGS = RADII.length;
const CAP_T = 236;
const FIG_X = 50;

const NAMES = ['YOU', 'STREET', 'TOWN', 'COUNTRY', 'EVERYONE'];

const LEVEL = BEATS.map((b) => b.level ?? 0);
const REACH = BEATS.map((b) => b.reach ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political34'));

export default function Political34Scene({ clock, bt, bi, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const widen = ease01(bt.value / 1.1);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      level: live ? dragPos.value : carry(cv, 0, n, LEVEL[p], LEVEL[n], widen),
      reach: carry(cv, 1, n, REACH[p], REACH[n], widen),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const reachStyle = useAnimatedStyle(() => {
    // The dashed ring sits at whatever radius the reach names, between the rings.
    const r = RADII[0] + SCENE.value.reach * (RADII[RINGS - 1] - RADII[0]);
    return { left: CX - r, top: CY - r, width: r * 2, height: r * 2, borderRadius: r };
  });

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>WHICH ROOM DECIDES?</Text>

      <View style={styles.clip} pointerEvents="none">
        {RADII.map((r, k) => <Ring key={k} k={k} r={r} SCENE={SCENE} />)}
        <Animated.View style={[styles.reach, reachStyle]} pointerEvents="none" />
      </View>

      <View style={styles.labels} pointerEvents="none">
        {NAMES.map((n) => <Text key={n} style={styles.label} numberOfLines={1}>{n}</Text>)}
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One jurisdiction ring. Own component — a hook cannot run inside `.map()`. */
function Ring({ k, r, SCENE }: { k: number; r: number; SCENE: { value: { level: number } } }) {
  const style = useAnimatedStyle(() => {
    // Lit while the deciding level has reached this ring, and the outermost lit
    // ring is drawn thickest so "where the decision is made" is unambiguous.
    const at = SCENE.value.level * (RINGS - 1);
    const on = at >= k - 0.5 ? 1 : 0;
    const edge = Math.abs(at - k) < 0.5 ? 1 : 0;
    return { opacity: 0.28 + 0.72 * on, borderWidth: 1.5 + 2 * edge };
  });
  return (
    <Animated.View
      style={[styles.ring, { left: CX - r, top: CY - r, width: r * 2, height: r * 2, borderRadius: r }, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: 156, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  // The widest ring reaches y 514, below the ground line. Clipping here is what
  // keeps the art inside the band rather than the band being stretched to hold a
  // circle nobody needed the bottom of.
  clip: { position: 'absolute', left: 0, top: 240, right: 0, height: GROUND - 240, overflow: 'hidden' },

  ring: { position: 'absolute', borderColor: INK, marginTop: -240 },
  reach: {
    position: 'absolute', borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    marginTop: -300, backgroundColor: STONE },

  // 60 WIDE, NOT 46: EVERYONE is 53dp with its tracking and was losing its tail on
  // every beat — and it is the outermost ring, the whole point of the question.
  labels: { position: 'absolute', left: 108, top: 300, width: 60, gap: 10 },
  label: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
});

export function Political34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political34Scene} band={[230, 512]} camera={CAM} />;
}
