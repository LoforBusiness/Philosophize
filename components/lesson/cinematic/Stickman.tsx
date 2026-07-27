import { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { STR, type Bundle } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// Draws one figure from a Bundle of transform arrays, as native RN Views.
//
// Views rather than SVG for a specific, measured reason (see rig.ts and
// WelcomeAnimation.tsx): react-native-svg 15 has no partial invalidation, so any
// animated child re-uploads the whole <Svg> surface to a GPU bitmap every frame
// — ~10fps full-screen on an S24 Ultra. Reanimated transforms on Views composite
// on the GPU with no per-frame rasterization at all.
//
// The primitives, matching the SVG shapes they replace:
//   bone  — a 1×STR View whose LEFT-CENTRE is the origin (transformOrigin
//           '0% 50%'), so [translate, rotate, scaleX(len)] stretches it from the
//           start joint along the bone. Butt-capped, because a non-uniform
//           scaleX would smear a round cap into an ellipse.
//   joint — a borderRadius View centred on the origin, so translate places it.
//   head  — the same, at head radius.
//   glove — a fatter joint at the wrists, drawn only when boxing.
//
// Every figure owns a fixed `k` (stage units per rig unit). Camera moves belong
// on the scene container's transform, never on k — changing k would relayout
// every one of these Views instead of just re-compositing them.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  D: SharedValue<Bundle>;
  /** Stage units per rig unit. Must match the `k` used to build the Bundle. */
  k: number;
  /** Fatter fists, for the boxers. */
  gloves?: boolean;
  color?: string;
}

export default function Stickman({ D, k, gloves = false, color = '#1A1A1A' }: Props) {
  // Thicknesses are baked per figure. They never animate, so they stay in style.
  const S = useMemo(() => {
    const limb = STR.limb * k;
    const torso = STR.torso * k;
    const headR = STR.headR * k;
    const gloveR = STR.glove * k;
    const boneBase = (thick: number): ViewStyle => ({
      position: 'absolute',
      left: 0,
      top: -thick / 2,
      width: 1,
      height: thick,
      backgroundColor: color,
      transformOrigin: '0% 50%',
    });
    const dotBase = (r: number): ViewStyle => ({
      position: 'absolute',
      left: -r,
      top: -r,
      width: 2 * r,
      height: 2 * r,
      borderRadius: r,
      backgroundColor: color,
    });
    // JOINTS MUST OVERLAP THEIR BONES, NOT SIT TANGENT TO THEM.
    //
    // A bone is a butt-capped rectangle and a joint dot was drawn at exactly half
    // the bone's thickness, so the circle only touched the rectangle's edges — it
    // never covered them. Every junction was therefore a hairline seam waiting for
    // a rounding error, and at the pelvis, where a 12-wide torso meets two 11-wide
    // thighs fanning out from ±1, it opened into a visible notch: the figure read
    // as a torso and a pair of legs rather than one body. Enlarging the stages made
    // it plain. `weld` is the overlap that closes it — small enough to be invisible
    // as a bulge, large enough that no joint can ever come apart.
    //
    // The pelvis needs slightly more than the rest, but only slightly. A dot at the
    // torso's half-width (6) leaves the thigh corners poking out, because the thighs
    // hang off hips at ±1 with a half-width of 5.5 and so reach ±6.5 — those exposed
    // corners are the notch. 0.9 covers them and no more. It is tempting to weld the
    // pelvis hard, but anything near 1.7 renders as a ball at the hip and the figure
    // reads pot-bellied once the stage is scaled up.
    const weld = 0.6 * k;
    return {
      limbBone: boneBase(limb),
      torsoBone: boneBase(torso),
      joint: dotBase(limb / 2 + weld),
      torsoJoint: dotBase(torso / 2 + weld),
      pelvis: dotBase(torso / 2 + 0.9 * k),
      head: dotBase(headR),
      fist: dotBase(gloves ? gloveR : limb / 2 + weld),
    };
  }, [k, color, gloves]);

  // One hook per node — transform only, never layout, never opacity.
  //
  // Opacity belongs on the GROUP, not the bones. Fading each bone separately
  // double-darkens every overlap (a limb crossing the torso reads as a blotch,
  // and joints darken the bone ends), because two 50% shapes stack to 75%. The
  // group carries the alpha and `needsOffscreenAlphaCompositing` makes the
  // figure composite as one flat shape first — the same fix WelcomeAnimation
  // uses to match SVG group-opacity semantics.
  const a = {
    thighL: useAnimatedStyle(() => ({ transform: D.value.thighL })),
    shinL: useAnimatedStyle(() => ({ transform: D.value.shinL })),
    thighR: useAnimatedStyle(() => ({ transform: D.value.thighR })),
    shinR: useAnimatedStyle(() => ({ transform: D.value.shinR })),
    torso: useAnimatedStyle(() => ({ transform: D.value.torso })),
    uarmL: useAnimatedStyle(() => ({ transform: D.value.uarmL })),
    farmL: useAnimatedStyle(() => ({ transform: D.value.farmL })),
    uarmR: useAnimatedStyle(() => ({ transform: D.value.uarmR })),
    farmR: useAnimatedStyle(() => ({ transform: D.value.farmR })),
    kneeL: useAnimatedStyle(() => ({ transform: D.value.kneeL })),
    kneeR: useAnimatedStyle(() => ({ transform: D.value.kneeR })),
    ankL: useAnimatedStyle(() => ({ transform: D.value.ankL })),
    ankR: useAnimatedStyle(() => ({ transform: D.value.ankR })),
    elL: useAnimatedStyle(() => ({ transform: D.value.elL })),
    elR: useAnimatedStyle(() => ({ transform: D.value.elR })),
    wrL: useAnimatedStyle(() => ({ transform: D.value.wrL })),
    wrR: useAnimatedStyle(() => ({ transform: D.value.wrR })),
    pel: useAnimatedStyle(() => ({ transform: D.value.pel })),
    shB: useAnimatedStyle(() => ({ transform: D.value.shB })),
    head: useAnimatedStyle(() => ({ transform: D.value.head })),
  };
  const groupFade = useAnimatedStyle(() => ({ opacity: D.value.opacity }));

  return (
    <Animated.View
      pointerEvents="none"
      needsOffscreenAlphaCompositing
      style={[{ position: 'absolute', left: 0, top: 0 }, groupFade]}
    >
      {/* Far side first, so the near limbs read in front. */}
      <Animated.View style={[S.limbBone, a.thighL]} />
      <Animated.View style={[S.limbBone, a.shinL]} />
      <Animated.View style={[S.limbBone, a.uarmL]} />
      <Animated.View style={[S.limbBone, a.farmL]} />
      <Animated.View style={[S.joint, a.kneeL]} />
      <Animated.View style={[S.joint, a.ankL]} />
      <Animated.View style={[S.joint, a.elL]} />
      <Animated.View style={[S.fist, a.wrL]} />

      <Animated.View style={[S.torsoBone, a.torso]} />
      <Animated.View style={[S.pelvis, a.pel]} />
      <Animated.View style={[S.torsoJoint, a.shB]} />

      <Animated.View style={[S.limbBone, a.thighR]} />
      <Animated.View style={[S.limbBone, a.shinR]} />
      <Animated.View style={[S.joint, a.kneeR]} />
      <Animated.View style={[S.joint, a.ankR]} />

      <Animated.View style={[S.head, a.head]} />

      <Animated.View style={[S.limbBone, a.uarmR]} />
      <Animated.View style={[S.limbBone, a.farmR]} />
      <Animated.View style={[S.joint, a.elR]} />
      <Animated.View style={[S.fist, a.wrR]} />
    </Animated.View>
  );
}
