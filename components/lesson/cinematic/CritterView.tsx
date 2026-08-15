import { useEffect, useMemo } from 'react';
import Animated, { useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { critter, type CritterKind } from './critters';

// Draws one animal from critters.ts as native RN Views — the same primitives and
// the same reason as Stickman.tsx: react-native-svg re-uploads its whole surface
// every frame, Reanimated transforms on Views composite on the GPU.
//
// A bone is a 1-wide View with transformOrigin '0% 50%', so
// [translate, rotate, scaleX(len)] stretches it from its start joint. The segment
// COUNT is fixed (15 segs, 12 dots — the cow's horn is the 15th and the dog leaves
// it at zero width) because a changing number of children would remount every
// frame; unused slots simply draw nothing.
//
// The dots are the caps that make a butt-capped bone read as a filled limb, and
// the belly chain that makes the barrel one mass rather than three circles.
//
// THESE WERE TOO LOW, AND IT COST THE ANIMAL ITS TAIL. DOTS was 13 while
// critters.ts pushed 14, so the last dot — the cap on the tail's tip — was never
// drawn, and the tail ended in two square corners for as long as it existed.
// The comment here warned that being too low is SILENT and it was right; nothing
// failed, nothing logged, the animal just had a plank on the back.
//
// So both counts now carry real headroom over what either animal asks for (the
// cow is the larger: 16 segs, 34 dots), and the assert below turns the silent
// version of this mistake into a loud one. An unfilled slot costs an early
// return and nothing else, so headroom is close to free; a missing one is
// invisible until somebody looks at the picture.
const SEGS = 20;
const DOTS = 44;

export default function CritterView({
  kind, clock, x, ground, k, dir = 1, gait, phase, opacity, color = '#1A1A1A',
}: {
  kind: CritterKind;
  clock: SharedValue<number>;
  /** Stage x of the animal's SHOULDER, and the ground line it stands on. */
  x: SharedValue<number> | number;
  ground: number;
  /** Stage units per wither unit — the animal's height at the shoulder. */
  k: number;
  dir?: 1 | -1;
  gait?: SharedValue<number>;
  phase?: SharedValue<number>;
  opacity?: SharedValue<number>;
  color?: string;
}) {
  const D = useDerivedValue(() =>
    critter(kind, clock.value, gait ? gait.value : 0, phase ? phase.value : 0));

  // The loud version of the bug above. Dev only, once per kind, off the UI
  // thread: if critters.ts ever asks for more slots than exist, say so instead of
  // quietly drawing an animal with a piece missing.
  useEffect(() => {
    if (!__DEV__) return;
    const probe = critter(kind, 0, 0, 0);
    if (probe.seg.length > SEGS || probe.dot.length > DOTS) {
      console.warn(
        `CritterView: "${kind}" needs ${probe.seg.length} segs / ${probe.dot.length} dots, ` +
        `but only ${SEGS} / ${DOTS} are rendered. Raise them — the extras are dropped silently.`
      );
    }
  }, [kind]);

  const wrap = useAnimatedStyle(() => ({
    opacity: opacity ? opacity.value : 1,
    transform: [{ translateX: typeof x === 'number' ? x : x.value }, { translateY: ground }],
  }));

  const segStyles = useMemo(
    () => Array.from({ length: SEGS }, (_, i) => ({ i })),
    [],
  );

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, wrap]} pointerEvents="none">
      {segStyles.map(({ i }) => (
        <Bone key={i} i={i} D={D} k={k} dir={dir} color={color} />
      ))}
      {Array.from({ length: DOTS }, (_, i) => (
        <Joint key={i} i={i} D={D} k={k} dir={dir} color={color} />
      ))}
    </Animated.View>
  );
}

function Bone({ i, D, k, dir, color }: any) {
  const st = useAnimatedStyle(() => {
    const s = D.value.seg[i];
    if (!s) return { width: 0, height: 0, opacity: 0 };
    const x1 = dir * s.x1 * k, y1 = s.y1 * k, x2 = dir * s.x2 * k, y2 = s.y2 * k;
    const len = Math.hypot(x2 - x1, y2 - y1);
    return {
      opacity: 1,
      width: 1,
      height: s.w * k,
      transform: [
        { translateX: x1 },
        { translateY: y1 - (s.w * k) / 2 },
        { rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` },
        { scaleX: Math.max(0.001, len) },
      ],
    };
  });
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, backgroundColor: color, transformOrigin: '0% 50%' }, st]} />;
}

function Joint({ i, D, k, dir, color }: any) {
  const st = useAnimatedStyle(() => {
    const d = D.value.dot[i];
    if (!d) return { width: 0, height: 0, opacity: 0 };
    const r = d.r * k;
    return {
      opacity: 1,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      transform: [{ translateX: dir * d.x * k - r }, { translateY: d.y * k - r }],
    };
  });
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, backgroundColor: color }, st]} />;
}
