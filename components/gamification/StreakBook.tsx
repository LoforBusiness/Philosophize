import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

// A closed, tilted hardcover book (spine on the left, page edges + a bookmark
// ribbon at the foot) with the streak number written on its cover. When a new
// day is earned, a small hand with a pencil rubs out the old number and writes
// the new one. Drop-in replacement for the old StreakFlame.
interface Props {
  value: number;
  from?: number;
  animate?: boolean;
  size?: number;
  color?: string;
  paper?: string;
}

// The number sits on the cover's upper face, tilted to match the book.
const NUM_DX = 0.06; // × size
const NUM_DY = -0.08; // × size
const NUM_ROT = -10; // deg, matches the cover tilt

export default function StreakBook({
  value,
  from,
  animate,
  size = 120,
  color = INK,
  paper = PAPER,
}: Props) {
  const willAnimate = !!animate && from != null && value > from;
  const eraseFirst = willAnimate && (from as number) >= 1;

  const W = size;
  const H = Math.round(size * 1.16);
  const numSize = Math.round(size * 0.4);

  const [display, setDisplay] = useState<number>(willAnimate && eraseFirst ? (from as number) : value);

  const numOpacity = useSharedValue(willAnimate && !eraseFirst ? 0 : 1);
  const numScale = useSharedValue(1);
  const handOpacity = useSharedValue(0);
  const writing = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    if (!willAnimate) {
      numOpacity.value = 1;
      numScale.value = 1;
      handOpacity.value = 0;
      return;
    }
    handOpacity.value = withTiming(1, { duration: 280 });
    wiggle.value = withRepeat(withTiming(1, { duration: 150, easing: Easing.inOut(Easing.sin) }), -1, true);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const writeAt = eraseFirst ? 1250 : 360;

    if (eraseFirst) {
      timers.push(
        setTimeout(() => {
          numOpacity.value = withTiming(0, { duration: 760, easing: Easing.in(Easing.quad) });
          numScale.value = withTiming(0.82, { duration: 760 });
        }, 360)
      );
    }
    timers.push(
      setTimeout(() => {
        writing.value = withTiming(1, { duration: 240 });
      }, writeAt - 140)
    );
    timers.push(
      setTimeout(() => {
        setDisplay(value);
        numOpacity.value = 0;
        numScale.value = 0.4;
        numOpacity.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) });
        numScale.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.back(1.6)) });
      }, writeAt)
    );
    timers.push(
      setTimeout(() => {
        handOpacity.value = withTiming(0, { duration: 340 });
      }, writeAt + 760)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [willAnimate, eraseFirst, value, from]);

  const numStyle = useAnimatedStyle(() => ({
    opacity: numOpacity.value,
    transform: [{ scale: numScale.value }],
  }));

  const handStyle = useAnimatedStyle(() => {
    const osc = (wiggle.value - 0.5) * 2;
    const scrub = osc * numSize * 0.5;
    const writeX = osc * numSize * 0.16;
    const x = interpolate(writing.value, [0, 1], [scrub, writeX]);
    const y = writing.value * Math.abs(osc) * -size * 0.03;
    const rot = interpolate(writing.value, [0, 1], [9, -4]);
    return {
      opacity: handOpacity.value,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }],
    };
  });

  return (
    <View style={[styles.wrap, { width: W, height: H }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 232">
        {/* spine (left binding) */}
        <Path
          d="M52 52 C 36 56 25 62 23 68 L 41 214 C 42 221 53 215 68 200 Z"
          fill={paper}
          stroke={color}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* bookmark ribbon (tucked behind the pages, hanging below) */}
        <Path
          d="M104 188 L100 250 L116 240 L131 251 L124 188 Z"
          fill={paper}
          stroke={color}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        {/* front cover */}
        <Path
          d="M56 50 L162 28 Q171 26 173 35 L182 178 Q183 188 173 191 L72 200 Q62 201 60 191 L50 62 Q48 51 56 50 Z"
          fill={paper}
          stroke={color}
          strokeWidth={4.6}
          strokeLinejoin="round"
        />
        {/* page block at the foot */}
        <Path
          d="M64 194 L72 212 Q74 216 80 214 L186 194 Q191 192 188 187 L181 178 Z"
          fill={paper}
          stroke={color}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* a couple of page-edge lines */}
        <Path d="M76 205 L184 186" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.55} />
        <Path d="M80 211 L186 192" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.4} />
        {/* bottom cover lip */}
        <Path
          d="M72 212 L78 221 L191 201 L188 192 Z"
          fill={paper}
          stroke={color}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
        {/* cover decoration lines */}
        <Path d="M86 150 L152 138" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Path d="M88 161 L148 150" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Path d="M90 172 L140 163" stroke={color} strokeWidth={3} strokeLinecap="round" />
      </Svg>

      {/* number, written on the cover face */}
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <View
          style={[
            styles.center,
            { transform: [{ translateX: size * NUM_DX }, { translateY: size * NUM_DY }, { rotate: `${NUM_ROT}deg` }] },
          ]}
        >
          <Animated.Text style={[styles.num, { fontSize: numSize, color }, numStyle]} numberOfLines={1}>
            {display}
          </Animated.Text>
        </View>
      </View>

      {/* hand + pencil while rewriting */}
      {willAnimate ? (
        <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
          <View style={{ transform: [{ translateX: size * NUM_DX }, { translateY: size * NUM_DY }] }}>
            <Animated.View style={handStyle}>
              <PencilHand size={Math.round(size * 0.66)} color={color} paper={paper} />
            </Animated.View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// A small hand gripping a pencil, tip pointing DOWN onto the cover, hand above.
function PencilHand({ size, color, paper }: { size: number; color: string; paper: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        transform: [{ translateX: size * 0.13 }, { translateY: -size * 0.25 }],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 120 120">
        <Path d="M48 92 L90 46" stroke={color} strokeWidth={8} strokeLinecap="round" />
        <Path d="M44 90 L39 105 L55 99 Z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M88 48 C95 40 103 47 98 54" stroke={color} strokeWidth={4} fill={paper} strokeLinejoin="round" />
        <Path
          d="M64 50 C79 42 99 49 102 65 C104 79 95 92 81 92 C67 92 57 80 57 68 C57 60 59 54 64 50 Z"
          fill={paper}
          stroke={color}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Path d="M66 58 C72 52 82 52 88 58" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <Path d="M64 67 C71 61 83 61 90 68" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <Path d="M64 76 C71 71 82 71 89 77" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <Path d="M62 73 C56 77 56 85 62 88" stroke={color} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: 'Caveat_700Bold', textAlign: 'center', includeFontPadding: false },
});
