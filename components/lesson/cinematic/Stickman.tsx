import { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { BONE_SRC, STR, type Bundle } from './rig';

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
      // BONE_SRC wide, not 1 — and `bundle` divides its scaleX by the same
      // constant, so the drawn length is unchanged. See the note on BONE_SRC in
      // rig.ts: stretching a one-pixel-wide View is what left a nick at every
      // joint. The two must be changed together.
      width: BONE_SRC,
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
    // A JOINT IS EXACTLY AS WIDE AS THE BONE IT CAPS. NOT ONE UNIT MORE.
    //
    // A bone is a squared-off rectangle of half-thickness r, so its end corners sit
    // exactly r from the joint. A circle of radius r centred there is tangent to
    // both bones' outer edges, and the union is a true capsule — a smooth limb with
    // a rounded bend and no seam. Any radius LARGER than r stops being a cap and
    // becomes a bead threaded onto the limb: a step in the silhouette at every
    // elbow, knee, wrist and ankle. That is what "you can see the joints" means,
    // and a previous attempt to insure against hairline seams by widening these to
    // r + 0.6 is precisely what caused it. The seams it was insuring against were
    // never a geometry problem — they were the one-pixel bone source, fixed at
    // BONE_SRC in rig.ts.
    //
    // The pelvis is the torso's own half-width for the same reason. The thighs hang
    // off hips at ±1 with a half-width of 5.5, so their corners reach ±6.5 against
    // the torso's 6 and overhang it by half a unit — well under a pixel on a phone,
    // and a slightly wider hip reads as anatomy rather than as a defect. Bulging the
    // dot to cover them puts a ball on the hip and the figure reads pot-bellied.
    return {
      limbBone: boneBase(limb),
      torsoBone: boneBase(torso),
      joint: dotBase(limb / 2),
      torsoJoint: dotBase(torso / 2),
      pelvis: dotBase(torso / 2),
      head: dotBase(headR),
      fist: dotBase(gloves ? gloveR : limb / 2),
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
    shLd: useAnimatedStyle(() => ({ transform: D.value.shLd })),
    shRd: useAnimatedStyle(() => ({ transform: D.value.shRd })),
    pel: useAnimatedStyle(() => ({ transform: D.value.pel })),
    shB: useAnimatedStyle(() => ({ transform: D.value.shB })),
    head: useAnimatedStyle(() => ({ transform: D.value.head })),
  };
  const groupFade = useAnimatedStyle(() => ({ opacity: D.value.opacity }));

  return (
    <Animated.View
      pointerEvents="none"
      needsOffscreenAlphaCompositing
      // MEASURABLE, because "is the man in shot?" was being answered by a model
      // rather than by the man. validate-cinematic tests a single x and a head and
      // feet height; that misses the arms, misses a second figure, and misses
      // whatever he is holding — so a camera could cut a reaching hand, or half a
      // guide, and every check stayed green.
      //
      // A testID rather than a nativeID: React Native Web renders this as
      // data-testid, and unlike an id it is legal for the several figures a scene
      // may have on stage to share it. The root itself is a zero-size absolute box,
      // so the figure's real extent is the union of this element's descendants —
      // see scripts/measure-must.mjs.
      testID="figure"
      style={[{ position: 'absolute', left: 0, top: 0 }, groupFade]}
    >
      {/* Far side first, so the near limbs read in front. */}
      <Animated.View style={[S.limbBone, a.thighL]} />
      <Animated.View style={[S.limbBone, a.shinL]} />
      <Animated.View style={[S.limbBone, a.uarmL]} />
      <Animated.View style={[S.limbBone, a.farmL]} />
      <Animated.View style={[S.joint, a.shLd]} />
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
      <Animated.View style={[S.joint, a.shRd]} />
      <Animated.View style={[S.joint, a.elR]} />
      <Animated.View style={[S.fist, a.wrR]} />
    </Animated.View>
  );
}
