import { useEffect, useMemo, useState, memo } from 'react';
import { View, Text, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedReaction,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { INK_SCENES } from '@/components/lesson/inkScenes';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PAPER = '#F4F3EE';
const INK = '#1A1A1A';

// Quotes short enough to actually read during the ~2s the screen is up. The
// fallback can't realistically be hit, but this screen sits on the boot path —
// an empty pool must never be able to crash the launch.
const SHORT_QUOTES = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({ text: q.text, author: p.name }))
).filter((q) => q.text.length <= 90);
const FALLBACK_QUOTE = { text: 'The unexamined life is not worth living.', author: 'Socrates' };

// A slightly wobbly hand-drawn horizontal stroke, plus its exact length so the
// draw-on animation (strokeDashoffset) can map progress 0–100 to the path.
function makeStroke(width: number, seed: number) {
  const segs = 40;
  const dx = width / segs;
  let s = seed % 233280;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let d = 'M0 0';
  let len = 0;
  let px = 0;
  let py = 0;
  for (let i = 1; i <= segs; i++) {
    const x = i * dx;
    const y = Math.sin(i * 0.7) * 1.4 + (rand() - 0.5) * 2.4;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return { d, len: Math.ceil(len) };
}

// The percentage readout. Isolated so the tick-by-tick re-render touches this
// tiny Text only — the scene SVG above it never re-renders during the count.
const Pct = memo(function Pct({
  progress,
  color,
}: {
  progress: SharedValue<number>;
  color: string;
}) {
  const [n, setN] = useState(0);
  useAnimatedReaction(
    () => Math.min(100, Math.round(progress.value)),
    (cur, prev) => {
      if (cur !== prev) runOnJS(setN)(cur);
    }
  );
  return <Text style={[styles.pct, { color }]}>{n}%</Text>;
});

interface Props {
  // True once the app is genuinely ready underneath (fonts, hydration, auth
  // routing). The counter climbs to 92 on its own, holds there until ready,
  // then finishes to 100 and fades the whole screen away.
  ready: boolean;
  onDone: () => void;
}

// The cold-start loading moment: one of the hand-drawn ink scenes (a different
// one each launch, slowly breathing), an ink stroke that draws itself across
// the screen as a progress line with a counting percentage, and a short quote
// resting at the bottom. At 100% the screen lifts away onto Home.
export default function LaunchScreen({ ready, onDone }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // One scene + one quote per launch.
  const seed = useMemo(() => Math.floor(Math.random() * 233280), []);
  const scene = INK_SCENES[seed % INK_SCENES.length];
  const quote = SHORT_QUOTES.length > 0 ? SHORT_QUOTES[seed % SHORT_QUOTES.length] : FALLBACK_QUOTE;
  const dark = scene.meta.mode === 'dark';

  const strokeW = Math.round(width * 0.68);
  const { d, len } = useMemo(() => makeStroke(strokeW, seed + 7), [strokeW, seed]);

  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const sceneScale = useSharedValue(1);
  const introFade = useSharedValue(0);
  const [held, setHeld] = useState(false);

  // Choreography: draw to 92 over 2.7s (fast start, gentle settle), then wait
  // for `ready` — normally already true, so the finish chains straight on.
  // With the finish + fade this puts the whole moment a little over 3s — long
  // enough to actually read the quote at the bottom.
  useEffect(() => {
    introFade.value = withTiming(1, { duration: 420 });
    sceneScale.value = withTiming(1.045, { duration: 3800, easing: Easing.out(Easing.quad) });
    progress.value = withTiming(
      92,
      { duration: 2700, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setHeld)(true);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!held || !ready) return;
    progress.value = withTiming(100, { duration: 280, easing: Easing.out(Easing.quad) }, (f) => {
      if (f) {
        screenOpacity.value = withDelay(
          120,
          withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) }, (done) => {
            if (done) runOnJS(onDone)();
          })
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, ready]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const sceneStyle = useAnimatedStyle(() => ({ transform: [{ scale: sceneScale.value }] }));
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: introFade.value,
    transform: [{ translateY: (1 - introFade.value) * 8 }],
  }));
  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - progress.value / 100),
  }));

  const inkColor = dark ? PAPER : INK;
  const softColor = dark ? 'rgba(244,243,238,0.55)' : 'rgba(26,26,26,0.5)';
  const bg = dark ? '#0E0E0E' : '#E4E4DF';
  // The words sit where the scene leaves blank room (same contract as lessons).
  const strokeTopPct = scene.meta.zone === 'top' ? '32%' : '52%';

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: bg }, rootStyle]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Animated.View style={[StyleSheet.absoluteFill, sceneStyle]} pointerEvents="none">
        <scene.Scene />
      </Animated.View>

      {/* Soft fade behind the bottom quote so it reads over any ground art. */}
      <Svg width="100%" height="30%" style={styles.scrim} pointerEvents="none">
        <Defs>
          <LinearGradient id="ls-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={bg} stopOpacity={0} />
            <Stop offset="1" stopColor={bg} stopOpacity={0.88} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ls-fade)" />
      </Svg>

      {/* Masthead */}
      <Animated.View style={[styles.mast, { top: insets.top + 18 }, fadeInStyle]}>
        <Text style={[styles.mastText, { color: softColor }]}>P H I L O S O P H I Z E</Text>
      </Animated.View>

      {/* The ink stroke drawing itself + percentage */}
      <Animated.View style={[styles.strokeWrap, { top: strokeTopPct as `${number}%` }, fadeInStyle]}>
        <Svg width={strokeW} height={14} viewBox={`0 -7 ${strokeW} 14`}>
          <AnimatedPath
            d={d}
            stroke={inkColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${len} ${len}`}
            animatedProps={strokeProps}
          />
        </Svg>
        <Pct progress={progress} color={softColor} />
      </Animated.View>

      {/* Quote */}
      <Animated.View style={[styles.quoteWrap, { paddingBottom: insets.bottom + 34 }, fadeInStyle]}>
        <Text style={[styles.quoteText, { color: inkColor }]} numberOfLines={3}>
          “{quote.text}”
        </Text>
        <Text style={[styles.quoteBy, { color: softColor }]}>— {quote.author.toUpperCase()}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  mast: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  mastText: { fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 4 },
  strokeWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 12 },
  pct: { fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 2 },
  quoteWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 16.5,
    lineHeight: 24,
    textAlign: 'center',
  },
  quoteBy: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    letterSpacing: 2,
    marginTop: 10,
  },
});
