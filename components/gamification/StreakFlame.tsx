import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

// A bold, hand-drawn black-and-white flame: an ink silhouette wrapped around a
// paper-white inner flame, with the streak count resting at its heart. It
// breathes with a constant gentle flicker (the fire is always moving), and
// leaps — rolling the number up — the moment a new day is earned.
interface Props {
  value: number;        // the streak to display
  from?: number;        // previous streak; with `animate`, the number rolls from→value
  animate?: boolean;    // play the leap + number roll (used right after a lesson)
  size?: number;        // flame width in px (height is 1.2×)
  color?: string;
  paper?: string;
}

// viewBox 0 0 100 120 — taller than wide, like a real flame.
const OUTER =
  'M50 4 C 56 22 64 31 70 43 C 79 60 80 71 80 83 C 80 103 67 117 50 117 ' +
  'C 33 117 20 103 20 83 C 20 69 27 60 33 52 C 39 46 43 41 43 33 ' +
  'C 46 39 47 44 49 49 C 47 33 45 18 50 4 Z';

const INNER =
  'M50 42 C 54 54 62 60 62 73 C 62 90 56 102 50 109 ' +
  'C 44 102 38 90 38 73 C 38 60 46 54 50 42 Z';

export default function StreakFlame({
  value,
  from,
  animate,
  size = 120,
  color = INK,
  paper = PAPER,
}: Props) {
  const willRoll = !!animate && from != null && value > from;

  const pulse = useSharedValue(0); // breathing (vertical stretch)
  const sway = useSharedValue(0);  // side-to-side lick
  const leap = useSharedValue(0);  // one-shot burst on increment

  const [display, setDisplay] = useState(willRoll ? (from as number) : value);

  // Two looping, out-of-phase motions give the flame an organic, living flicker.
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 820, easing: Easing.inOut(Easing.sin) }), -1, true);
    sway.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When a new day is earned: let the screen settle, then leap and roll the
  // number up to its new value.
  useEffect(() => {
    if (!willRoll) {
      setDisplay(value);
      return;
    }
    setDisplay(from as number);
    const t = setTimeout(() => {
      setDisplay(value);
      leap.value = withSequence(
        withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }),
        withSpring(0, { damping: 8, stiffness: 150 })
      );
    }, 820);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [willRoll, from, value]);

  const flameStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(pulse.value, [0, 1], [1, 1.06]) + leap.value * 0.16;
    const scaleX = interpolate(pulse.value, [0, 1], [1, 0.975]) + leap.value * 0.05;
    const rotate = interpolate(sway.value, [0, 1], [-2.6, 2.6]);
    const translateY = interpolate(pulse.value, [0, 1], [0, -2]) - leap.value * 8;
    return { transform: [{ translateY }, { rotate: `${rotate}deg` }, { scaleX }, { scaleY }] };
  });

  return (
    <View style={[styles.wrap, { width: size, height: size * 1.2 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, flameStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 120">
          <Path d={OUTER} fill={color} />
          <Path d={INNER} fill={paper} />
        </Svg>
      </Animated.View>

      <View style={[StyleSheet.absoluteFill, styles.numWrap]} pointerEvents="none">
        <View style={{ transform: [{ translateY: size * 0.15 }] }}>
          <MotiView
            key={display}
            from={{ translateY: willRoll ? 16 : 0, opacity: willRoll ? 0 : 1 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 380, easing: Easing.out(Easing.cubic) }}
          >
            <Text style={[styles.num, { fontSize: Math.round(size * 0.34), color }]}>{display}</Text>
          </MotiView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  numWrap: { alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center', includeFontPadding: false },
});
