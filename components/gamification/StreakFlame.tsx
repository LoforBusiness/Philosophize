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
  'M12.6 0.8 C12.9 4.3 11.4 6.4 9.7 8.6 C8.2 10.5 6.6 12.4 6.6 14.9 C6.6 16.4 7.1 17.6 7.9 18.5 C7.2 17.4 7.0 16.1 7.4 14.9 C8.0 12.9 9.9 11.6 10.8 9.8 C11.5 11.6 11.3 13.3 10.7 15.0 C10.1 16.6 9.4 18.2 10.0 19.9 C10.5 21.3 11.8 22.2 13.3 22.2 C15.9 22.2 18.0 20.1 18.0 17.2 C18.0 13.0 15.1 11.0 14.6 7.6 C14.2 4.9 15.0 3.3 15.0 3.3 C13.8 3.6 12.9 2.6 12.6 0.8 Z';
const INNER =
  'M13.0 22.2 C11.2 22.2 10.0 20.9 10.0 19.2 C10.0 17.3 11.4 16.2 12.2 14.3 C12.6 13.3 12.8 12.3 12.7 11.4 C14.4 13.2 16.1 15.5 16.1 18.0 C16.1 20.4 14.8 22.2 13.0 22.2 Z';

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
