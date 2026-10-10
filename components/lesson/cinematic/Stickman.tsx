import { memo, useMemo, type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { BONE_SRC, STR, pose, stand, type Bundle } from './rig';
import { pillStyle } from './stageSkin';
import type { Piece } from './wardrobe';
import { GARB_LINE, GARB_SLOTS, bandAt, type Band } from './garb';

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
  /**
   * What this figure is wearing — see `wardrobe.ts`.
   *
   * A costume is per-FIGURE and per-lesson, never per-beat: a hat that appears
   * halfway through an argument is a thing the reader has to account for, and
   * they are meant to be following the argument.
   */
  wear?: Piece[];
  /**
   * Which figure this is — `lead`, `second` or `crowd`. It used to pick a costume
   * from the lesson's rotation and hand the lead the lawn chair; both went with the
   * narrated library (2026-10-02), and a figure now wears exactly its `wear`. Kept so
   * the scenes that state it need no edit.
   */
  role?: 'lead' | 'second' | 'crowd';
  /**
   * CLOTHES ON THE BODY (garb.ts) — unit 2's costumes: a toga, a tunic. Drawn after the
   * legs and the trunk and before the head and the near arm, so the cloth covers the
   * body and his near arm still works in front of it.
   */
  garb?: Band[];
}

/**
 * A FIXED number of accessory slots, and the hook rule is why.
 *
 * §17's first standing rule is that the hook count may never change between
 * renders — a lesson once threw on its final tap because a hook sat below an
 * early return, and it took down the reward modal with it. Mapping hooks over
 * `wear.length` would be the same defect with a costume change as the trigger.
 * Eight slots is more than any costume uses (a cast costume once ran to seven); unused ones cost a worklet that returns `opacity: 0` and nothing else.
 * A costume with MORE pieces than this loses the rest in silence, so `check:wardrobe`
 * reads this number and fails one that does not fit.
 */
const WORN_SLOTS = 16;

/** The stage's own ground, so a `paper` piece reads as a gap rather than a mark. */
const PAPER = '#FAFAF7';

/** One empty costume, shared, so a bare figure's `worn` is the same array every render. */
const NO_WEAR: Piece[] = [];

/** No garment, shared, for the same reason as NO_WEAR. */
const NO_GARB: Band[] = [];

// ── a still figure is not redrawn (2026-10-09) ──────────────────────────────
//
// The owner: "the lessons are very laggy". Measured in a CPU-throttled browser, the
// first story lesson of the science road restyled 248 figure elements on EVERY frame —
// eight costumed figures, every bone, joint and band — while most of them stood
// perfectly still: a scene derives each pose from the clock, so the bundle is a new
// object every frame even when no number in it moved, and every style built from it
// is new too. Reanimated skips a write only when a style hands back the SAME values
// (shallowEqual, by reference), so nothing was ever skipped.
//
// So the figure keeps the last bundle it drew and goes on handing THAT back until a
// joint really moves (STILL_EPS), and the styles it builds (the shadow, the garment
// bands, the worn pieces) are kept on that bundle's record, so a still figure costs one
// comparison a frame and writes nothing.
const XF_KEYS = ['thighL', 'shinL', 'thighR', 'shinR', 'torso', 'uarmL', 'farmL', 'uarmR', 'farmR',
  'kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd', 'pel', 'shB', 'head'];
/** A hundredth of a unit (or of a degree): below a pixel at any scale a lesson draws. */
const STILL_EPS = 0.15;
function numOf(v: unknown): number {
  'worklet';
  return typeof v === 'number' ? v : parseFloat(String(v));
}
function xfSame(a: Record<string, unknown>[], b: Record<string, unknown>[]): boolean {
  'worklet';
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i]; const q = b[i];
    for (const key in q) if (Math.abs(numOf(p[key]) - numOf(q[key])) > STILL_EPS) return false;
  }
  return true;
}
function bundleSame(a: Bundle, b: Bundle): boolean {
  'worklet';
  if (a === b) return true;
  if (a.opacity !== b.opacity || a.dir !== b.dir || a.scale !== b.scale) return false;
  for (let i = 0; i < XF_KEYS.length; i++) {
    const key = XF_KEYS[i];
    if (!xfSame((a as any)[key], (b as any)[key])) return false;
  }
  return true;
}
/** An unused slot, one object for good, so it is never rewritten. */
const HIDDEN = { opacity: 0, transform: [{ translateX: -9999 }, { translateY: -9999 }] };
/** What a figure last drew: its bundle and the styles built from it. */
interface Drawn { B: Bundle; s: Record<string, any> }

function Stickman({ D, k, gloves = false, color = '#1A1A1A', wear, garb }: Props) {
  // What he wears is exactly what the scene hands him; with nothing he is the bare
  // mascot, which is what the launch screen, the road and the welcome have always drawn.
  const worn = wear && wear.length ? wear : NO_WEAR;
  const bands = garb && garb.length ? garb : NO_GARB;
  const drawn = useSharedValue<Drawn | null>(null);
  const E = useDerivedValue<Drawn>(() => {
    const B = D.value;
    const c = drawn.value;
    // An invisible figure (a costume change keeps the other copy at opacity 0) is not
    // redrawn at all until it shows again.
    if (c && (bundleSame(c.B, B) || (c.B.opacity === 0 && B.opacity === 0))) return c;
    const n: Drawn = { B, s: {} };
    drawn.value = n;
    return n;
  });
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
      // THE SHADOW HE STANDS IN, AS A PILL (group AG). Duolingo's illustration
      // rules are explicit about the shape: *"shadows always appear below
      // characters and objects as a pill shape — never an oval, because ovals imply
      // perspective"* — and this drawing is flat and seen straight on, so the rule
      // applies exactly. It is the one thing that puts him ON the floor rather than
      // in front of it.
      //
      // It is a FILL PLUS A HALO now rather than a flat capsule, and it hugs his
      // feet instead of standing 11 units clear of them on each side — the flat
      // one read as a grey object lying on the floor, which is what the owner
      // reported. `pillStyle` carries the whole finding and `npm run sheet:shadow`
      // is what showed it.
      pill: pillStyle(k),
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
    // WHERE HE IS TOUCHING THE FLOOR — the midpoint of his ankles, at whichever of
    // them is lower, so the pill travels with a walk and does not slide out from
    // under a sit. It fades as his feet part: a figure mid-stride is not standing on
    // one spot, and a full-strength pill under a stride reads as a puddle.
    pill: useAnimatedStyle(() => {
      const c = E.value; if (c.s.pill) return c.s.pill; const B = c.B;
      const lx = B.ankL[0].translateX; const rx = B.ankR[0].translateX;
      const ly = B.ankL[1].translateY; const ry = B.ankR[1].translateY;
      const part = Math.min(1, Math.abs(lx - rx) / (26 * k));
      c.s.pill = {
        transform: [{ translateX: (lx + rx) / 2 }, { translateY: Math.max(ly, ry) }],
        opacity: 1 - 0.45 * part,
      };
      return c.s.pill;
    }),
    thighL: useAnimatedStyle(() => ({ transform: E.value.B.thighL })),
    shinL: useAnimatedStyle(() => ({ transform: E.value.B.shinL })),
    thighR: useAnimatedStyle(() => ({ transform: E.value.B.thighR })),
    shinR: useAnimatedStyle(() => ({ transform: E.value.B.shinR })),
    torso: useAnimatedStyle(() => ({ transform: E.value.B.torso })),
    uarmL: useAnimatedStyle(() => ({ transform: E.value.B.uarmL })),
    farmL: useAnimatedStyle(() => ({ transform: E.value.B.farmL })),
    uarmR: useAnimatedStyle(() => ({ transform: E.value.B.uarmR })),
    farmR: useAnimatedStyle(() => ({ transform: E.value.B.farmR })),
    kneeL: useAnimatedStyle(() => ({ transform: E.value.B.kneeL })),
    kneeR: useAnimatedStyle(() => ({ transform: E.value.B.kneeR })),
    ankL: useAnimatedStyle(() => ({ transform: E.value.B.ankL })),
    ankR: useAnimatedStyle(() => ({ transform: E.value.B.ankR })),
    elL: useAnimatedStyle(() => ({ transform: E.value.B.elL })),
    elR: useAnimatedStyle(() => ({ transform: E.value.B.elR })),
    wrL: useAnimatedStyle(() => ({ transform: E.value.B.wrL })),
    wrR: useAnimatedStyle(() => ({ transform: E.value.B.wrR })),
    shLd: useAnimatedStyle(() => ({ transform: E.value.B.shLd })),
    shRd: useAnimatedStyle(() => ({ transform: E.value.B.shRd })),
    pel: useAnimatedStyle(() => ({ transform: E.value.B.pel })),
    shB: useAnimatedStyle(() => ({ transform: E.value.B.shB })),
    head: useAnimatedStyle(() => ({ transform: E.value.B.head })),
  };
  const groupFade = useAnimatedStyle(() => ({ opacity: E.value.B.opacity }));

  // ── the costume ───────────────────────────────────────────────────────────
  //
  // Each piece hangs off a JOINT the bundle already carries, so it inherits every
  // bit of motion the figure has for free — including the walk, the settle and
  // the living holds — with no second animation to keep in step.
  //
  // A HEAD piece rotates with the NECK, and that matters more than it sounds: a
  // hat that stays level while its wearer leans is a hat floating in mid-air, and
  // the neck angle is the same axis N12 says attention has to ride, so the hat
  // and the gaze can never disagree.
  const wornStatic = useMemo(
    () => Array.from({ length: WORN_SLOTS }, (_, i) => {
      const p = worn[i];
      if (!p) return null;
      const w = p.w * k;
      const h = p.h * k;
      const base: ViewStyle = {
        position: 'absolute',
        left: -w / 2,
        top: -h / 2,
        width: w,
        height: h,
        borderRadius: (p.r ?? 0) * k,
      };
      // A RING SHOWS WHAT IS BEHIND IT, which is the whole point of the monocle:
      // most of its circle sits proud of the head, so the hole reads against
      // paper. Drawn as a fill it would be a black disc stuck to his temple.
      if (p.ring) return { ...base, borderWidth: p.ring * k, borderColor: p.fill ?? color, borderRadius: w / 2 };
      // A COLOURED piece (garb.ts) wears a thin ink edge, so it reads on the black
      // head and on the paper alike. The edge is grown OUTSIDE the drawn size.
      if (p.fill) {
        const e = GARB_LINE * 0.75 * k;
        return {
          ...base, left: -w / 2 - e, top: -h / 2 - e, width: w + 2 * e, height: h + 2 * e,
          borderRadius: (p.r ?? 0) * k + e, borderWidth: e, borderColor: color, backgroundColor: p.fill,
        };
      }
      // PAPER, not ink — see `Piece.paper`. The value matches the stage ground so
      // the line reads as an absence rather than as a pale object.
      return { ...base, backgroundColor: p.paper ? PAPER : color };
    }),
    [worn, k, color],
  );

  // ── the garment (garb.ts) ─────────────────────────────────────────────────
  //
  // Each band is ONE View sized at its length in a standing pose, moved, turned and
  // stretched to where the joints put it this frame. Band lengths barely change with
  // a pose (a thigh is a thigh), so the stretch is a few percent and the rounded ends
  // keep their shape. A band is drawn twice: an ink copy grown by the outline, then its
  // fill — all the body's outlines first, so overlapping bands share one edge.
  const garbStatic = useMemo(() => {
    const B0 = pose(stand(0), 0, 0, k, 1, 1) as unknown as Parameters<typeof bandAt>[0];
    const line = GARB_LINE * k;
    return Array.from({ length: GARB_SLOTS }, (_, i) => {
      const b = bands[i];
      if (!b) return null;
      const box = (grow: number, fill: string): ViewStyle => {
        const g = bandAt(B0, k, b, grow);
        const L = Math.max(g.len, 1);
        return {
          position: 'absolute', left: -L / 2, top: -g.w / 2, width: L, height: g.w,
          borderRadius: (b.r ?? b.w / 2) * k + grow, backgroundColor: fill,
        };
      };
      return { out: b.flat ? null : box(line, color), fill: box(0, b.fill), len0: Math.max(bandAt(B0, k, b, 0).len, 1), layer: b.layer ?? 0 };
    });
  }, [bands, k, color]);

  const garbStyles = Array.from({ length: GARB_SLOTS }, (_, i) => {
    const b = bands[i];
    const len0 = garbStatic[i]?.len0 ?? 1;
    // eslint-disable-next-line react-hooks/rules-of-hooks -- GARB_SLOTS is constant
    return useAnimatedStyle(() => {
      if (!b) return HIDDEN;
      const c = E.value; const key = 'g' + i;
      if (c.s[key]) return c.s[key];
      const g = bandAt(c.B as unknown as Parameters<typeof bandAt>[0], k, b, 0);
      return c.s[key] = {
        opacity: 1,
        transform: [
          { translateX: g.cx }, { translateY: g.cy },
          { rotate: `${(g.ang * 180) / Math.PI}deg` },
          { scaleX: g.len / len0 },
        ],
      };
    });
  });
  const garbLayer = (layer: number) => {
    const out: ReactNode[] = [];
    const idx = garbStatic.map((s, i) => (s && s.layer === layer ? i : -1)).filter((i) => i >= 0);
    if (layer !== 1) {
      for (const i of idx) if (garbStatic[i]!.out) out.push(<Animated.View key={`go${i}`} style={[garbStatic[i]!.out!, garbStyles[i]]} />);
      for (const i of idx) out.push(<Animated.View key={`gf${i}`} style={[garbStatic[i]!.fill, garbStyles[i]]} />);
    } else {
      for (const i of idx) {
        if (garbStatic[i]!.out) out.push(<Animated.View key={`go${i}`} style={[garbStatic[i]!.out!, garbStyles[i]]} />);
        out.push(<Animated.View key={`gf${i}`} style={[garbStatic[i]!.fill, garbStyles[i]]} />);
      }
    }
    return out;
  };

  const wornStyles = Array.from({ length: WORN_SLOTS }, (_, i) => {
    const p = worn[i];
    // eslint-disable-next-line react-hooks/rules-of-hooks -- WORN_SLOTS is constant; see above
    return useAnimatedStyle(() => {
      if (!p) return HIDDEN;
      const d = E.value; const key = 'w' + i;
      if (d.s[key]) return d.s[key];
      const B = d.B;
      const dir = B.dir < 0 ? -1 : 1;
      const hx = B.head[0].translateX; const hy = B.head[1].translateY;
      const sx = B.shB[0].translateX; const sy = B.shB[1].translateY;
      // 0 when upright: the neck points straight up, and atan2 of that is −90°.
      const neck = Math.atan2(hy - sy, hx - sx) + Math.PI / 2;

      let ax = hx; let ay = hy; let rot = neck;
      if (p.at === 'neck') { ax = sx; ay = sy; }
      else if (p.at === 'pelvis') { ax = B.pel[0].translateX; ay = B.pel[1].translateY; rot = 0; }
      else if (p.at === 'handR') { ax = B.wrR[0].translateX; ay = B.wrR[1].translateY; rot = 0; }
      else if (p.at === 'handL') { ax = B.wrL[0].translateX; ay = B.wrL[1].translateY; rot = 0; }

      const px = p.x * dir * k; const py = p.y * k;
      const c = Math.cos(rot); const s = Math.sin(rot);
      return d.s[key] = {
        opacity: 1,
        transform: [
          { translateX: ax + px * c - py * s },
          { translateY: ay + px * s + py * c },
          { rotate: `${(rot * 180) / Math.PI + (p.rot ?? 0) * dir}deg` },
        ],
      };
    });
  });

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
      {/* The floor he is standing on, before anything that stands on it. */}
      <Animated.View style={[S.pill, a.pill]} />
      {/* Far side first, so the near limbs read in front. */}
      <Animated.View style={[S.limbBone, a.thighL]} />
      <Animated.View style={[S.limbBone, a.shinL]} />
      <Animated.View style={[S.limbBone, a.uarmL]} />
      <Animated.View style={[S.limbBone, a.farmL]} />
      <Animated.View style={[S.joint, a.shLd]} />
      <Animated.View style={[S.joint, a.kneeL]} />
      {/* The ankles are findable for the same reason the fists are: "resting on
          the floor" is measured against where his feet actually are, not against
          the bottom of his bounding box — a joint is a disc CENTRED on the ground,
          so the box hangs half a joint below it. */}
      <Animated.View testID="ankle-l" style={[S.joint, a.ankL]} />
      <Animated.View style={[S.joint, a.elL]} />
      {/* testID for the same reason the root has one: group P's check has to
          find the hands before it can ask whether the thing drawn in them is
          in them. React Native Web renders it as data-testid. */}
      <Animated.View testID="fist-l" style={[S.fist, a.wrL]} />
      {/* cloth on the far limbs (garb.ts layer −1): with them, behind the trunk */}
      {garbLayer(-1)}

      <Animated.View style={[S.torsoBone, a.torso]} />
      <Animated.View style={[S.pelvis, a.pel]} />
      <Animated.View style={[S.torsoJoint, a.shB]} />

      <Animated.View style={[S.limbBone, a.thighR]} />
      <Animated.View style={[S.limbBone, a.shinR]} />
      <Animated.View style={[S.joint, a.kneeR]} />
      <Animated.View testID="ankle-r" style={[S.joint, a.ankR]} />

      {/* The garment (garb.ts): over the legs and the trunk, under the head and the
          near arm. Empty for every figure that wears none. */}
      {garbLayer(0)}
      {garbLayer(1)}

      {/* testID for the same reason the ankles and the fists have one, and it is
          AL1's: "does he move up and down" is a question about the HEAD, and the
          union of his descendants cannot answer it — a punch or a raised hand is
          the top of that union and swamps the body by an order of magnitude
          (measured: 20px of glove against 0.1px of skull on the same beat). */}
      <Animated.View testID="head" style={[S.head, a.head]} />

      <Animated.View style={[S.limbBone, a.uarmR]} />
      <Animated.View style={[S.limbBone, a.farmR]} />
      <Animated.View style={[S.joint, a.shRd]} />
      <Animated.View style={[S.joint, a.elR]} />
      <Animated.View testID="fist-r" style={[S.fist, a.wrR]} />
      {/* cloth on the near arm (garb.ts layer 2): a sleeve over it */}
      {garbLayer(2)}

      {/* LAST, so a hat sits over the head rather than under it. Everything here
          is the same ink as the figure, so overlap costs nothing — except the
          monocle's ring, which needs what is behind it to show through. */}
      {wornStatic.map((st, i) => (
        st ? <Animated.View key={i} testID="worn" style={[st, wornStyles[i]]} /> : null
      ))}
    </Animated.View>
  );
}

/** Two lists the same for drawing: the same list, or both empty (scenes write `wear={[]}`). */
function sameList(a?: readonly unknown[], b?: readonly unknown[]): boolean {
  return a === b || ((!a || a.length === 0) && (!b || b.length === 0));
}

// A FIGURE IS NOT REBUILT ON A TAP (2026-10-09). Every tap re-renders the scene, and with
// it every figure: in the science story that was eight costumed figures, three times each,
// about a hundred views and sixty animation hooks apiece — while nothing a figure is drawn
// FROM had changed (its pose arrives on the UI thread through `D`). So a figure re-renders
// only when what it wears or how big it is changes.
export default memo(Stickman, (p, n) => p.D === n.D && p.k === n.k && p.gloves === n.gloves
  && p.color === n.color && p.role === n.role && sameList(p.wear, n.wear) && sameList(p.garb, n.garb));
