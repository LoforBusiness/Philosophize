import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useFrameCallback,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import {
  solve, bundle, stand, walk, mixStance, clamp01,
  sipStance, swingStance, kiteStance, picnicStance, readStance,
  WALK, DEG, STAGE_W, STAGE_H,
  type Joints, type Bundle, type Stance,
} from '@/components/lesson/cinematic/rig';
import type { LaunchScene } from './launchScenes';

// ─────────────────────────────────────────────────────────────────────────────
// The moving half of a launch scene: the figure, plus whatever it is holding.
//
// All native Views driven by Reanimated transforms — never SVG. The art behind
// it is inert SVG drawn once; putting the motion here is what keeps a cold start
// at the panel's refresh rate instead of the ~10fps an animated full-screen
// <Svg> costs. (Same reason, same measurement, as WelcomeAnimation.)
//
// Props that a hand holds (cup, book, kite string) are positioned from the SOLVED
// WRIST each frame rather than being guessed at, so they can never drift off the
// hand mid-animation.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';

/** Rig units per second for the hill walk — an unhurried pace at this distance. */
const WALK_SPEED = 22;

interface Props {
  scene: LaunchScene;
}

export default function LaunchFigure({ scene }: Props) {
  const { activity, k, dir, x: x0, groundY: gy0, pivot, kite, groundWave, walkSpan } = scene;

  // Everything the figure holds is sized in the SAME rig units as the figure, so
  // shrinking the figure into the distance shrinks its props with it. Fixed pixel
  // sizes would leave a distant walker carrying a comically oversized book.
  const P = useMemo(() => {
    const u = k / 1.3;                       // the scale these props were drawn at
    const pelvisY = gy0 - 20 * k;            // where a seated rider's hips land
    const tireR = Math.max(9, 30 * u);
    return {
      cupW: 13 * u, cupH: 14 * u, cupB: Math.max(1, 2.2 * u),
      bookW: 40 * u, bookH: 27 * u, bookB: Math.max(1, 2.4 * u),
      kiteS: Math.max(15, 30 * u), kiteB: Math.max(1.4, 2.4 * u),
      tireR, tireB: Math.max(3, 7 * u),
      ropeW: Math.max(1.6, 2.4 * u),
      // The rope must END at the top of the tire, which hangs at the rider's hips.
      ropeLen: pivot ? Math.max(20, pelvisY - tireR - pivot.y) : 0,
    };
  }, [k, gy0, pivot]);

  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    clock.value = (f.timeSinceFirstFrame ?? 0) / 1000;
  }, true);

  // Swing phase, -1..1. Kept separate because the scene rotates the whole rig by
  // it AND the body leans into it — one source, two consumers.
  const swingPhase = useDerivedValue(() => {
    'worklet';
    return activity === 'swing' ? Math.sin(clock.value * 1.35) : 0;
  });

  // Stance + placement for this activity, every frame.
  const J = useDerivedValue<Joints>(() => {
    'worklet';
    const t = clock.value;
    let s: Stance;
    let x = x0;
    let groundY = gy0;

    if (activity === 'walk') {
      // `dist` only ever increases, so the gait is continuous no matter how long
      // the screen is up — the step phase comes from distance, so it can never
      // snap back to a start pose. Only the POSITION wraps, and it wraps across a
      // span that begins and ends off-screen, so the reset is never seen.
      const dist = t * WALK_SPEED;
      if (walkSpan) {
        const span = walkSpan.to - walkSpan.from;
        const travelled = dist * k * dir;
        x = walkSpan.from + (((travelled % span) + span) % span);
      } else {
        x = x0 + dist * k * dir;
      }
      // Feet track the hill instead of a flat line. The contour is evaluated
      // from NUMBERS here rather than by calling a function off the scene: a
      // plain JS closure is not callable on the UI runtime, and doing so threw
      // "Object is not a function" and crashed the app on every walk scene.
      if (groundWave) {
        groundY = groundWave.base - Math.sin((x - groundWave.off) / groundWave.per) * groundWave.amp;
      }
      s = walk(dist, WALK);
    } else if (activity === 'kite') {
      // Irregular tugs — a kite pulls when the wind decides to, not on a beat.
      const g = Math.sin(t * 1.7) * 0.5 + Math.sin(t * 1.06 + 0.9) * 0.5;
      s = kiteStance(t, clamp01(g * 0.9 + 0.25));
    } else if (activity === 'swing') {
      s = swingStance(t, swingPhase.value);
    } else if (activity === 'sip') {
      const p = t % 7.4;
      const u = p > 1.5 && p < 4.7 ? (p - 1.5) / 3.2 : 0;
      s = sipStance(t, u);
    } else if (activity === 'picnic') {
      const p = t % 6.8;
      const u = p > 1.2 && p < 5.2 ? (p - 1.2) / 4 : 0;
      s = picnicStance(t, u);
    } else {
      const p = t % 5.6;
      const turn = p > 3.9 && p < 4.7 ? (p - 3.9) / 0.8 : 0;
      s = readStance(t, turn);
    }

    return solve({
      x, groundY, k, dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    });
  });

  const D = useDerivedValue<Bundle>(() => {
    'worklet';
    return bundle(J.value, k, 1);
  });

  // The swing arc: rotate the rope, tire and rider together about the bough.
  const swingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swingPhase.value * 13}deg` }],
  }));

  // ── held props ─────────────────────────────────────────────────────────────

  const cupStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: J.value.wrR.x - P.cupW / 2 }, { translateY: J.value.wrR.y - P.cupH }],
  }));

  // The book spans wrist to wrist and tips with them.
  const bookStyle = useAnimatedStyle(() => {
    'worklet';
    const a = J.value.wrL;
    const b = J.value.wrR;
    return {
      transform: [
        { translateX: (a.x + b.x) / 2 },
        { translateY: (a.y + b.y) / 2 },
        { rotate: `${Math.atan2(b.y - a.y, b.x - a.x) * DEG}deg` },
      ],
    };
  });

  // Kite: drifts on the wind, and the string is redrawn from the hand to wherever
  // it has drifted to — so the line always meets both ends.
  const kiteAt = useDerivedValue(() => {
    'worklet';
    if (!kite) return { x: 0, y: 0, a: 0 };
    const t = clock.value;
    const sway = Math.sin(t * 0.9) * 0.6 + Math.sin(t * 0.57 + 1.2) * 0.4;
    const rise = Math.sin(t * 0.72 + 0.4) * 0.5 + Math.sin(t * 1.13) * 0.5;
    return { x: kite.x + sway * 16, y: kite.y + rise * 11, a: sway * 12 };
  });

  const kiteStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: kiteAt.value.x },
      { translateY: kiteAt.value.y },
      { rotate: `${45 + kiteAt.value.a}deg` },
    ],
  }));

  const stringStyle = useAnimatedStyle(() => {
    'worklet';
    const h = J.value.wrR;
    const kx = kiteAt.value.x;
    const ky = kiteAt.value.y;
    return {
      width: Math.hypot(kx - h.x, ky - h.y),
      transform: [
        { translateX: h.x },
        { translateY: h.y },
        { rotate: `${Math.atan2(ky - h.y, kx - h.x) * DEG}deg` },
      ],
    };
  });

  const figure = (
    <>
      <Stickman D={D} k={k} color={INK} />
      {activity === 'sip' ? (
        <Animated.View style={[styles.prop, cupStyle]}>
          <View style={[styles.cup, { width: P.cupW, height: P.cupH, borderWidth: P.cupB }]} />
        </Animated.View>
      ) : null}
      {activity === 'read' ? (
        <Animated.View style={[styles.prop, bookStyle]}>
          <View style={[styles.book, { width: P.bookW, height: P.bookH, borderWidth: P.bookB, marginLeft: -P.bookW / 2, marginTop: -P.bookH * 0.8 }]} />
        </Animated.View>
      ) : null}
    </>
  );

  return (
    <View style={styles.stage} pointerEvents="none">
      {activity === 'kite' && kite ? (
        <>
          <Animated.View style={[styles.prop, styles.stringWrap, stringStyle]} />
          <Animated.View style={[styles.prop, kiteStyle]}>
            <View style={[styles.kite, { width: P.kiteS, height: P.kiteS, borderWidth: P.kiteB, marginLeft: -P.kiteS / 2, marginTop: -P.kiteS / 2 }]} />
          </Animated.View>
        </>
      ) : null}

      {activity === 'swing' && pivot ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transformOrigin: `${pivot.x}px ${pivot.y}px` },
            swingStyle,
          ]}
        >
          {/* rope, then the tire it carries — both hang straight down from the bough */}
          <View style={[styles.rope, { left: pivot.x - P.ropeW / 2, top: pivot.y, width: P.ropeW, height: P.ropeLen }]} />
          <View style={[styles.tire, { left: pivot.x - P.tireR, top: pivot.y + P.ropeLen, width: P.tireR * 2, height: P.tireR * 2, borderRadius: P.tireR, borderWidth: P.tireB }]} />
          {figure}
        </Animated.View>
      ) : (
        figure
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  // Props place themselves by transform from a 0,0 origin, exactly like the bones.
  prop: { position: 'absolute', left: 0, top: 0 },

  cup: {
    borderColor: INK,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: 'transparent',
  },
  cupHandle: {
    position: 'absolute', left: 12, top: 3,
    width: 7, height: 8, borderWidth: 2, borderColor: INK, borderRadius: 4,
    borderLeftColor: 'transparent',
  },

  book: { borderColor: INK, borderRadius: 2, backgroundColor: '#F7F5F0' },
  bookSpine: {
    position: 'absolute', left: -1.2, top: -22,
    width: 2.4, height: 27, backgroundColor: INK,
  },

  stringWrap: { height: 1.4, backgroundColor: INK, opacity: 0.5, transformOrigin: '0% 50%' },
  kite: { borderColor: INK, backgroundColor: 'transparent' },

  rope: { position: 'absolute', backgroundColor: INK, opacity: 0.85 },
  tire: { position: 'absolute', borderColor: INK, backgroundColor: 'transparent' },
});
