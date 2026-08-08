import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, type View, type PressableProps } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { INK } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// A THING IN THE PICTURE THAT CAN BE TAPPED, AND LOOKS LIKE IT.
//
// Eighty-two of the 102 cinematic lessons ask their question by having the
// reader tap something on the stage rather than press a button underneath. That
// mechanic is the reason the format won — a lesson about which of three maps is
// true is better answered by pointing at a map than by reading three sentences
// that describe maps. It was also, measurably, where readers got lost:
//
//   69 of 82 prompts already said "tap"      — the instruction was never missing
//   13 of 82 named something you can SEE     — "board", "pipe", "shelf"
//   15 of 82 pointed at an abstraction       — "tap the claim that is still
//                                               owed an account"
//
// So the reader knew a tap was wanted and could not tell WHAT was tappable,
// because a scene's answer targets were drawn exactly like the scenery around
// them. Nothing on the stage said "these two rectangles are the buttons".
//
// This component is the answer, and it is one component on purpose: wrapping a
// scene's existing Pressable in it costs one line per target and fixes every
// lesson the same way, rather than 82 scenes each inventing an affordance.
//
// ── WHAT IT DRAWS ───────────────────────────────────────────────────────────
//
// While the question is open: an ink ring on the target's own bounds, breathing
// slowly. Not a fill and not a colour — §19 has no second colour to reach for.
// The breath is what separates "this is a button" from "this is a box someone
// drew"; a static outline reads as part of the picture, which is the whole
// problem being fixed. See the note on RING_INSET for why it sits ON the bounds
// rather than outside them.
//
// The moment an answer lands, every ring is cancelled and removed. The scene's
// own right/wrong styling then has the stage to itself — this component
// deliberately does NOT style the answered state, because each scene already
// does that in its own vocabulary and two systems fighting over it would be
// worse than none.
//
// ── WHY IT ALSO COUNTS ITSELF ───────────────────────────────────────────────
//
// Every mounted Target registers with the surrounding TargetCount provider, so
// the question panel underneath can say how many marked things there are without
// any lesson having to declare it. That number is the difference between "answer
// in the scene above" — which is what the panel used to say, and which tells the
// reader nothing — and "tap one of the 3 marked parts above".
// ─────────────────────────────────────────────────────────────────────────────

// THE RING SITS ON THE TARGET'S OWN BOUNDS, NOT OUTSIDE THEM.
//
// It was -5 first, on the reasoning that a ring outside the art never covers the
// thing being chosen. The audit measured what it covered instead: across the
// first 26 lessons alone, 32 pairs of rings overlapped each other — by up to 46px
// — and 29 rings crossed text belonging to something else. On a stage where the
// answer targets are stacked rows of a proof, five units in every direction is
// enough for each ring to reach into its neighbour, and two overlapping outlines
// are worse than none: they say the two things are one thing.
//
// At 0 the ring is exactly the target's footprint, and a React Native border is
// drawn INSIDE the box, so it cannot extend past it by even a pixel. Two rings
// can now only touch if the two targets themselves overlap — which is a layout
// fault the audit should report, not something the affordance should cause.
const RING_INSET = 0;
const RING_W = 2;
const BREATH_MS = 1100;

interface Registry {
  add: (key: string) => void;
  remove: (key: string) => void;
  /** Where this target actually is, in SCENE coordinates. See `measure` below. */
  report?: (key: string, box: { x: number; y: number; w: number; h: number }) => void;
  /** The camera view a target measures itself against. */
  host?: { current: unknown };
}
const TargetCtx = createContext<Registry | null>(null);

/** Wrap the scene so its Targets can be counted. Mounted by CinematicPlayer. */
export function TargetCountProvider({
  children, onCount, onBox, host,
}: {
  children: React.ReactNode;
  onCount: (n: number) => void;
  /** The union of every target on this beat, or null while none has measured. */
  onBox?: (b: { x: number; y: number; w: number; h: number } | null) => void;
  host?: { current: unknown };
}) {
  const reg = useMemo(() => {
    const keys = new Set<string>();
    const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
    const union = () => {
      if (!boxes.size) return null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      boxes.forEach((b) => {
        x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
        x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
      });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    };
    return {
      add: (k: string) => { keys.add(k); onCount(keys.size); },
      remove: (k: string) => {
        keys.delete(k); boxes.delete(k);
        onCount(keys.size);
        onBox?.(union());
      },
      report: (k: string, b: { x: number; y: number; w: number; h: number }) => {
        boxes.set(k, b);
        onBox?.(union());
      },
      host,
    };
  }, [onCount, onBox, host]);
  return <TargetCtx.Provider value={reg}>{children}</TargetCtx.Provider>;
}

/**
 * EVERY OTHER PROP GOES STRAIGHT THROUGH TO THE PRESSABLE, on purpose.
 *
 * The 98 targets this replaces are plain Pressables carrying their own styles,
 * hit slop, function-style children and `disabled` flags. Passing the rest
 * through makes converting one a tag rename plus four props — which is a change
 * a compiler can check — rather than a reshaping of each scene's props, which is
 * a change only a person can check, 98 times.
 */
export default function Target({
  id,
  correct,
  picked,
  onPick,
  children,
  /** Match the target's own corner, so the ring does not square off a round thing. */
  radius = 4,
  ...rest
}: {
  id: string;
  correct: boolean;
  /** From SceneApi — null until this beat has been answered. */
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  radius?: number;
} & Omit<PressableProps, 'onPress' | 'children'> & { children?: React.ReactNode }) {
  const answered = picked !== null;
  const reg = useContext(TargetCtx);
  const key = useId();

  useEffect(() => {
    reg?.add(key);
    return () => reg?.remove(key);
  }, [reg, key]);

  const breath = useSharedValue(0);
  useEffect(() => {
    if (answered) {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 180 });
      return;
    }
    breath.value = 0;
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [answered]);

  // Opacity only. A ring that also SCALED would drift off a target whose own art
  // is moving, and every one of these sits on a stage where something is walking.
  const ring = useAnimatedStyle(() => ({ opacity: 0.35 + breath.value * 0.65 }));

  // WHERE THIS TARGET ACTUALLY IS, so the camera can be made to contain it.
  //
  // Measured against the CAMERA VIEW rather than read off the scene's styles,
  // because a Target is positioned by whatever wraps it — a row, a card, a column
  // — and only the tree knows the accumulated offset. `measureLayout` against an
  // ancestor returns the offset inside that ancestor's own coordinate space, which
  // is scene space: the camera's transform lives ON the host and so is not counted.
  //
  // If it ever fails, nothing is reported and CinematicPlayer falls back to
  // framing the whole band — see the note there. Wrong is not an option; blunt is.
  const boxRef = useRef<View>(null);
  const measure = () => {
    const host = reg?.host?.current as never;
    if (!host || !boxRef.current) return;
    boxRef.current.measureLayout(
      host,
      (x, y, w, h) => reg?.report?.(key, { x, y, w, h }),
      () => {},
    );
  };

  return (
    <Pressable
      ref={boxRef}
      onLayout={measure}
      accessibilityRole="button"
      {...rest}
      // After the spread: a scene's own `disabled` may add a reason to be
      // untappable, but it may never make an answered target tappable again.
      disabled={answered || !!rest.disabled}
      onPress={() => onPick(id, correct)}
    >
      {children}
      {!answered ? (
        <Animated.View
          pointerEvents="none"
          // Named so the lesson audit can find rings exactly. Detecting them by
          // "a 2px border with a radius" also matched scene art — logic-3 draws
          // bordered boxes — and reported 28 collisions between things that were
          // not rings at all.
          nativeID="target-ring"
          style={[
            StyleSheet.absoluteFill,
            {
              top: RING_INSET, left: RING_INSET, right: RING_INSET, bottom: RING_INSET,
              borderWidth: RING_W,
              borderColor: INK,
              borderRadius: radius,
            },
            ring,
          ]}
        />
      ) : null}
    </Pressable>
  );
}

/**
 * The same ring with no Pressable, for a scene whose target is already a
 * Pressable it cannot give up (a drag handle, a control with its own gesture).
 */
export function TargetRing({ answered, radius = 4 }: { answered: boolean; radius?: number }) {
  // Registers like a Target does, so a scene using rings instead of Targets still
  // gets a counted hint. Without this the panel silently falls back to "Answer in
  // the scene above" — the wording this whole change exists to replace — for
  // exactly the scenes whose targets are hardest to spot.
  const reg = useContext(TargetCtx);
  const key = useId();
  useEffect(() => {
    reg?.add(key);
    return () => reg?.remove(key);
  }, [reg, key]);

  const breath = useSharedValue(0);
  useEffect(() => {
    if (answered) { cancelAnimation(breath); breath.value = withTiming(0, { duration: 180 }); return; }
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(breath);
  }, [answered]);
  const ring = useAnimatedStyle(() => ({ opacity: answered ? 0 : 0.35 + breath.value * 0.65 }));
  return (
    <Animated.View
      pointerEvents="none"
      nativeID="target-ring"
      style={[
        StyleSheet.absoluteFill,
        {
          top: RING_INSET, left: RING_INSET, right: RING_INSET, bottom: RING_INSET,
          borderWidth: RING_W, borderColor: INK, borderRadius: radius,
        },
        ring,
      ]}
    />
  );
}

export const TARGET_RING_INSET = RING_INSET;
