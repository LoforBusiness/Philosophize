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

/** Rig units per second for the hill walk — an unhurried pace. */
const WALK_SPEED = 25;
/** After this long the walker eases to a halt, so a slow launch can't march it off-stage. */
const WALK_FOR = 4.6;

interface Props {
  scene: LaunchScene;
}

export default function LaunchFigure({ scene }: Props) {
  const { activity, k, dir, x: x0, groundY: gy0, pivot, kite, groundAt } = scene;

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
      const dist = Math.min(t, WALK_FOR) * WALK_SPEED;
      x = x0 + dist * k * dir;
      // Feet track the hill instead of a flat line.
      if (groundAt) groundY = groundAt(x);
      const settle = clamp01((t - WALK_FOR) / 0.9);
      s = settle > 0 ? mixStance(walk(dist, WALK), stand(t), settle) : walk(dist, WALK);
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
    transform: [{ translateX: J.value.wrR.x - 6 }, { translateY: J.value.wrR.y - 12 }],
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
          <View style={styles.cup} />
          <View style={styles.cupHandle} />
        </Animated.View>
      ) : null}
      {activity === 'read' ? (
        <Animated.View style={[styles.prop, bookStyle]}>
          <View style={styles.book} />
          <View style={styles.bookSpine} />
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
            <View style={styles.kite} />
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
          <View style={[styles.rope, { left: pivot.x - 1.2, top: pivot.y, height: 150 }]} />
          <View style={[styles.tire, { left: pivot.x - 30, top: pivot.y + 146 }]} />
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
    width: 13, height: 14, borderWidth: 2.2, borderColor: INK,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: 'transparent',
  },
  cupHandle: {
    position: 'absolute', left: 12, top: 3,
    width: 7, height: 8, borderWidth: 2, borderColor: INK, borderRadius: 4,
    borderLeftColor: 'transparent',
  },

  book: {
    width: 40, height: 27, borderWidth: 2.4, borderColor: INK,
    borderRadius: 2, backgroundColor: '#F7F5F0',
    marginLeft: -20, marginTop: -22,
  },
  bookSpine: {
    position: 'absolute', left: -1.2, top: -22,
    width: 2.4, height: 27, backgroundColor: INK,
  },

  stringWrap: { height: 1.4, backgroundColor: INK, opacity: 0.5, transformOrigin: '0% 50%' },
  kite: {
    width: 30, height: 30, borderWidth: 2.4, borderColor: INK,
    backgroundColor: 'transparent', marginLeft: -15, marginTop: -15,
  },

  rope: { position: 'absolute', width: 2.4, backgroundColor: INK, opacity: 0.85 },
  tire: {
    position: 'absolute', width: 60, height: 60,
    borderWidth: 7, borderColor: INK, borderRadius: 30, backgroundColor: 'transparent',
  },
});
