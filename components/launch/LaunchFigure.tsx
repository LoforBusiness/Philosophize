import { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useFrameCallback,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import {
  solve, bundle, DEG, STAGE_W, STAGE_H, FIG_H,
  type Joints, type Bundle,
} from '@/components/lesson/cinematic/rig';
import { launchStance, walkPlacement } from './launchMotion';
import type { LaunchScene } from './launchScenes';

// ─────────────────────────────────────────────────────────────────────────────
// The moving half of a launch scene: the figure, plus whatever it is holding.
//
// All native Views driven by Reanimated transforms — never SVG. The art behind
// it is inert SVG drawn once; putting the motion here is what keeps a cold start
// at the panel's refresh rate instead of the ~10fps an animated full-screen
// <Svg> costs. (Same reason, same measurement, as WelcomeAnimation.)
//
// Props that a hand holds (cup, book) are positioned from the SOLVED WRIST each
// frame rather than being guessed at, so they can never drift off the hand
// mid-animation.
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
  const { activity, k, dir, x: x0, groundY: gy0, crest, walkSpan, shadow, cast } = scene;

  // Everything the figure holds is sized in the SAME rig units as the figure, so
  // shrinking the figure into the distance shrinks its props with it. Fixed pixel
  // sizes would leave a distant walker carrying a comically oversized book.
  const P = useMemo(() => {
    const u = k / 1.3;                       // the scale these props were drawn at
    return {
      cupW: 13 * u, cupH: 14 * u, cupB: Math.max(1, 2.2 * u),
      bookW: 40 * u, bookH: 27 * u, bookB: Math.max(1, 2.4 * u),
    };
  }, [k]);

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
      const p = walkPlacement(t, k, dir, walkSpan, crest, gy0);
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

  // ── the contact shadow ─────────────────────────────────────────────────────
  //
  // "The stickman is just like he is sitting on air." He was: he stood at
  // crestY(x) — geometrically ON the ridge — but nothing on the page said so.
  // A silhouette standing on the top EDGE of a plane that recedes away from the
  // camera has no contact cue at all, and the eye reads it as pasted on.
  //
  // It has to live HERE rather than in the scenery, because `walk` moves the
  // figure right across the frame and re-solves his groundY from the crest every
  // frame. A shadow painted into the inert SVG would be a smudge he walks away
  // from.
  //
  // It is drawn UNDER the figure and reads as a darkening of the ground rather
  // than an object: the palette's darkest step, and a WIDE flat ellipse. Height
  // is a tenth of the width — anything rounder stops being a shadow cast by a
  // low sun and starts being a stone he is standing on.
  const shade = useDerivedValue(() => {
    'worklet';
    const j = J.value;
    // Straddle the feet rather than centring on his origin: mid-stride the two
    // feet are a stride apart, and one puddle under the pelvis would sit between
    // them touching neither.
    const lo = Math.min(j.ankL.x, j.ankR.x);
    const hi = Math.max(j.ankL.x, j.ankR.x);
    return { cx: (lo + hi) / 2, span: hi - lo, y: Math.max(j.ankL.y, j.ankR.y) };
  });

  // The figure's own height in stage units — `FIG_H` is the rig's, so the cast
  // scales with him and a distant walker's shadow is short in the same way he is.
  const figH = FIG_H * k;

  const shadowStyle = useAnimatedStyle(() => {
    const s = shade.value;
    // The pool at the feet, plus the cast reaching away from the light. They are
    // one ellipse: two shapes would show a seam where they met, and the seam is
    // exactly where the eye is looking for the contact.
    const reach = figH * cast.len;
    const w = 22 * k + s.span + reach;
    const h = Math.max(2.5, 5 * k);
    // Anchored at the feet, growing only in the direction the light throws it.
    const left = cast.dir === 1 ? s.cx - (11 * k + s.span / 2) : s.cx + (11 * k + s.span / 2) - w;
    return {
      width: w,
      height: h,
      borderRadius: h / 2,
      transform: [{ translateX: left }, { translateY: s.y - h / 2 }],
    };
  });

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

  const figure = (
    <>
      {/* BEFORE the figure, so his feet sit on top of it rather than in it.
          A GRADIENT, not a fill: a shadow is darkest where the thing casting it
          touches the ground and dissolves as it runs out. Solid, it read as a
          plank lying on the hillside — the shape was right and the edge was the
          tell. Ends at 0 opacity, so nothing has to decide where to stop it. */}
      <Animated.View style={[styles.shade, shadowStyle]}>
        <LinearGradient
          colors={[shadow, shadow, `${shadow}00`]}
          locations={[0, 0.18, 1]}
          start={cast.dir === 1 ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 }}
          end={cast.dir === 1 ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Stickman D={D} k={k} color={INK} />
      {activity === 'sip' ? (
        <Animated.View style={[styles.prop, cupStyle]}>
          {/* a mug, not a box: tapered body, a handle on the trailing side and a
              rim line across the top so it reads as something open */}
          <View style={[styles.cup, { width: P.cupW, height: P.cupH, borderWidth: P.cupB }]}>
            <View style={[styles.cupRim, { height: Math.max(1, P.cupB) }]} />
          </View>
          <View
            style={[
              styles.cupHandle,
              {
                left: -P.cupW * 0.42, top: P.cupH * 0.24,
                width: P.cupW * 0.44, height: P.cupH * 0.44,
                borderWidth: Math.max(1, P.cupB * 0.85),
                borderRadius: P.cupH * 0.3,
              },
            ]}
          />
        </Animated.View>
      ) : null}
      {activity === 'read' ? (
        <Animated.View style={[styles.prop, bookStyle]}>
          {/* two leaves meeting at a spine, so it reads as an open book rather
              than a card: each half tilts away from the centre line */}
          <View style={[styles.bookWrap, { marginLeft: -P.bookW / 2, marginTop: -P.bookH * 0.8 }]}>
            <View style={[styles.leaf, { width: P.bookW / 2, height: P.bookH, borderWidth: P.bookB, transform: [{ rotate: '-7deg' }] }]} />
            <View style={[styles.leaf, { width: P.bookW / 2, height: P.bookH, borderWidth: P.bookB, transform: [{ rotate: '7deg' }] }]} />
            <View style={[styles.bookSpine, { height: P.bookH * 0.96, width: Math.max(1.2, P.bookB) }]} />
          </View>
        </Animated.View>
      ) : null}
    </>
  );

  return (
    <View style={styles.stage} pointerEvents="none">
      {figure}
    </View>
  );
});

const styles = StyleSheet.create({
  stage: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  // Soft rather than solid: a cast shadow on open ground has no edge, and at
  // this size an opaque ellipse reads as a hole in the hillside.
  shade: { position: 'absolute', left: 0, top: 0, opacity: 0.42, overflow: 'hidden' },
  // Props place themselves by transform from a 0,0 origin, exactly like the bones.
  prop: { position: 'absolute', left: 0, top: 0 },

  cup: {
    borderColor: INK,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: '#F7F5F0',
  },
  cupRim: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: INK },
  // The handle sits on the TRAILING side (the figure faces +x), so it isn't hidden
  // behind the fist. borderLeftColor transparent leaves a C rather than an O.
  cupHandle: {
    position: 'absolute',
    borderColor: INK, borderRightColor: 'transparent', backgroundColor: 'transparent',
  },

  bookWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  leaf: { borderColor: INK, backgroundColor: '#F7F5F0' },
  bookSpine: { position: 'absolute', left: '50%', top: 0, backgroundColor: INK },
});
