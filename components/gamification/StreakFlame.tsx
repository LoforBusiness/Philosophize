import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { EMBER, EMBER_DEEP, ASH } from '@/constants/streak';

const PAPER = '#FAFAF7';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK FLAME.
//
// One mark that has to answer, from a glance: is this alive, and how big is it.
//
// ── WHY THE FLAME IS SVG AND THE MOTION IS A VIEW TRANSFORM ─────────────────
//
// §17's performance rule: an animated full-screen <Svg> costs about 10fps on an
// S24, and putting it under an animated parent does not buy an exemption because
// what costs is the AREA being repainted. This flame is ~28dp square, so the area
// is negligible — but the shape is still drawn ONCE and inert, with the breathing
// done by a transform on the wrapper. Same discipline, and it means the flame can
// sit in a list row or a header without thinking about it.
//
// ── THE BREATH IS ASYMMETRIC, AND THAT IS THE WHOLE TRICK ───────────────────
//
// A flame that scales up and down on a symmetric ease reads as a pulsing button.
// Fire flares fast and settles slow. The sequence below rises in 420ms and falls
// in 1180ms, which is what makes a static shape read as burning. It is the same
// lesson as `travelEase` on the branch road: a symmetric ease is almost never
// what a physical thing does.
//
// A cold streak does not breathe at all. Stillness is the signal.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  count: number;
  /** False once the streak has lapsed — the flame goes ash and stops moving. */
  alive: boolean;
  size?: number;
  /** Hide the number and draw the mark alone (used inside a row of stats). */
  markOnly?: boolean;
}

// One closed path. The inner tongue is a second path at low opacity so the shape
// has depth without a gradient — gradients inside a 28dp glyph are invisible.
const OUTER =
  'M12 1.6 C7.2 6.4 3.4 10.9 3.4 15.4 a8.6 8.6 0 0 0 17.2 0 c0-4.5-3.8-9-8.6-13.8 Z';
const INNER =
  'M12 8.4 C9.4 11.5 7.6 13.8 7.6 15.9 a4.4 4.4 0 0 0 8.8 0 c0-2.1-1.8-4.4-4.4-7.5 Z';

export default function StreakFlame({ count, alive, size = 30, markOnly = false }: Props) {
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!alive) {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 240 });
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 1180, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(breath);
  }, [alive, breath]);

  const flame = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + breath.value * 0.075 },
      // Rises very slightly as it flares, so it reads as licking upward rather
      // than as inflating in place.
      { translateY: -breath.value * 1.1 },
    ],
  }));

  const body = alive ? EMBER : ASH;
  const core = alive ? EMBER_DEEP : ASH;

  return (
    <View style={styles.row}>
      <Animated.View style={[{ width: size, height: size }, flame]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d={OUTER} fill={body} />
          <Path d={INNER} fill={core} opacity={alive ? 0.55 : 0.35} />
        </Svg>
      </Animated.View>
      {markOnly ? null : (
        <Text style={[styles.count, { fontSize: size * 0.95, color: alive ? EMBER : ASH }]}>
          {count}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  count: {
    fontFamily: 'PlayfairDisplay_700Bold',
    marginLeft: 7,
    // Both ember and ash clear 4.5:1 on paper, so this number is body text
    // rather than decoration — see constants/streak.ts for the measurements.
    includeFontPadding: false,
  },
});
