import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political33Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// TWO DOORS IN A WALL, SWINGING UNDER THE READER'S THUMB.
//
// A door is drawn as a panel whose WIDTH shrinks as it opens — the flat-on
// foreshortening a hinged door actually has, which reads as swinging without
// needing a 3D transform or an SVG. Two Views and one number.
//
// · the wall spans x 150…342 with a gateway at x 196…296. The left leaf hinges at
//   x 196 and the right at x 296, each 50 wide when shut.
// · the threat figure stands IN the gateway at x 232, drawn as a plain silhouette
//   rather than a Stickman so it never competes with the reader's own figure — and
//   it is a mid tone, not ink, because §17 forbids anything near-black standing at
//   the walking figure's height where it could swallow him.
// · the gateway floor line is at y 470; the wall runs y 252…470.
// · the caption sits at y 234…248 above the wall.
// · the figure stands at x 52 and reaches x 85, sixty-five clear of the wall.
//
// Ink runs from the caption (234) to the ground line (500). Band 228…512 = 284 (H59).

const WALL_L = 150;
const WALL_R = 342;
const WALL_T = 252;
const WALL_B = 470;
const GATE_L = 196;
const GATE_R = 296;
const LEAF_W = 50;
const CAP_T = 234;
const FIG_X = 52;

const OPEN = BEATS.map((b) => b.open ?? 0);
const THREAT = BEATS.map((b) => b.threat ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political33'));

export default function Political33Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    // A door takes a moment to swing — 1.2s, so it is watchable rather than snapping.
    const swing = ease01(bt.value / 1.2);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      open: live ? dragPos.value : carry(cv, 0, n, OPEN[p], OPEN[n], swing),
      threat: carry(cv, 1, n, THREAT[p], THREAT[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // Foreshortening: a leaf keeps a sliver of width at full open so it still reads
  // as a door standing edge-on rather than vanishing.
  const leftStyle = useAnimatedStyle(() => ({ width: LEAF_W * (1 - 0.88 * SCENE.value.open) }));
  const rightStyle = useAnimatedStyle(() => {
    const w = LEAF_W * (1 - 0.88 * SCENE.value.open);
    return { width: w, left: GATE_R - w };
  });
  const threatStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.threat * SCENE.value.open,
  }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>WHAT THE SOCIETY LETS IN</Text>

      <View style={styles.wallL} pointerEvents="none" />
      <View style={styles.wallR} pointerEvents="none" />
      <View style={styles.lintel} pointerEvents="none" />

      {/* Behind the doors, so a shut door hides it. */}
      <Animated.View style={[styles.threat, threatStyle]} pointerEvents="none">
        <View style={styles.banner} />
        <View style={styles.pole} />
      </Animated.View>

      <Animated.View style={[styles.leafL, leftStyle]} pointerEvents="none" />
      <Animated.View style={[styles.leafR, rightStyle]} pointerEvents="none" />

      <View style={styles.gateFloor} pointerEvents="none" />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: WALL_L, top: CAP_T, width: 230,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  wallL: { position: 'absolute', left: WALL_L, top: WALL_T, width: GATE_L - WALL_L, height: WALL_B - WALL_T, borderWidth: 2, borderColor: INK },
  wallR: { position: 'absolute', left: GATE_R, top: WALL_T, width: WALL_R - GATE_R, height: WALL_B - WALL_T, borderWidth: 2, borderColor: INK },
  lintel: { position: 'absolute', left: GATE_L, top: WALL_T, width: GATE_R - GATE_L, height: 4, backgroundColor: INK },
  gateFloor: { position: 'absolute', left: GATE_L, top: WALL_B - 2, width: GATE_R - GATE_L, height: 2, backgroundColor: SOFT },

  // Hinged at the wall, so each leaf keeps its outer edge and loses width inward.
  leafL: {
    position: 'absolute', left: GATE_L, top: WALL_T + 6, height: WALL_B - WALL_T - 8,
    borderWidth: 2, borderColor: INK,
  },
  leafR: {
    position: 'absolute', top: WALL_T + 6, height: WALL_B - WALL_T - 8,
    borderWidth: 2, borderColor: INK,
  },

  // A BANNER, NOT A BODY, and for two reasons. `check-scale` counts people built
  // out of plain Views and is right to — a hand-made torso next to a rigged figure
  // reads as a different draughtsman. And a MOVEMENT is what actually walks through
  // this gate; drawing one person makes it a story about somebody in particular.
  //
  // A MID TONE, never ink. §17: nothing near-black may stand at the walking figure's
  // own height, or the man in front of it stops being readable as a man.
  threat: { position: 'absolute', left: 230, top: WALL_T + 26, width: 32, alignItems: 'center' },
  banner: { width: 30, height: 34, backgroundColor: SOFT, borderRadius: 2 },
  pole: { width: 3, height: 60, backgroundColor: SOFT },
});

export function Political33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political33Scene} band={[228, 512]} camera={CAM} />;
}
