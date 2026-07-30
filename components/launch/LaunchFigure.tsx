import { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useFrameCallback,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import {
  solve, bundle, DEG, STAGE_W, STAGE_H,
  type Joints, type Bundle,
} from '@/components/lesson/cinematic/rig';
import { launchStance, swingPhaseAt, walkPlacement } from './launchMotion';
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

interface Props {
  scene: LaunchScene;
}

// memo, so LaunchScreen's own state changes (the progress hold at 2.7s, the
// finish) never reach this component. The clock above survives a re-render
// anyway; this stops one being asked for in the first place, and keeps the
// figure's frame budget away from the screen's bookkeeping.
export default memo(function LaunchFigure({ scene }: Props) {
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

  // ACCUMULATE the clock; never read timeSinceFirstFrame.
  //
  // useFrameCallback's effect depends on [callback, autostart], and the callback
  // closure is a new function on every render — so each re-render unregisters and
  // re-registers it, and registerFrameCallback starts a fresh entry with
  // startTime null. The very next frame then reports timeSinceFirstFrame: 0.
  //
  // LaunchScreen calls setHeld(true) at exactly 2.7s, which re-renders this
  // component. Reading timeSinceFirstFrame therefore sent the clock back to zero
  // and the figure snapped to its opening pose, ~0.7s before the screen lifted —
  // every single launch. Adding up timeSincePreviousFrame keeps the elapsed time
  // in a shared value, which survives any number of re-registrations. It is the
  // same pattern CinematicPlayer uses, which is why lessons never had this.
  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;   // null on a re-registered first frame
    if (dt > 0.05) dt = 0.05;                           // a stall must not fast-forward the scene
    clock.value += dt;
  }, true);

  // Swing phase, -1..1. Kept separate because the scene rotates the whole rig by
  // it AND the body leans into it — one source, two consumers.
  const swingPhase = useDerivedValue(() => {
    'worklet';
    return activity === 'swing' ? swingPhaseAt(clock.value) : 0;
  });

  // Stance + placement for this activity, every frame. The maths lives in
  // launchMotion.ts so it can be sampled frame by frame outside the app — a loop
  // that jumps once every forty seconds is not something eyes find.
  const J = useDerivedValue<Joints>(() => {
    'worklet';
    const t = clock.value;
    const s = launchStance(activity, t);
    let x = x0;
    let groundY = gy0;
    if (activity === 'walk' && walkSpan) {
      const p = walkPlacement(t, k, dir, walkSpan, groundWave, gy0);
      x = p.x;
      groundY = p.groundY;
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
});

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
