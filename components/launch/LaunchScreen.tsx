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
import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';
import { LAUNCH_SCENES, SceneArt } from './launchScenes';
import LaunchFigure from './LaunchFigure';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';

const AnimatedPath = Animated.createAnimatedComponent(Path);

import { chromeOn, PALETTES, CREAM, INK } from './launchArt';

// The scene now runs full-bleed to the bottom edge and the foreground is the
// DARK end, which is what let the art stop being a blank sheet below the horizon.
// Two things carry the legibility that the old paper band used to:
//   · the quote sits on a FIXED scrim in one fixed cream with its own shadow
//     (§19 — never take text contrast from the artwork);
//   · the masthead and the progress stroke take `chromeOn(scene.key)`, which is
//     DERIVED from the sky band's own luminance rather than chosen per scene.
// scripts/check-launch.mjs measures both. Nothing here is a guess.
const SCRIM: readonly [string, string, string] = [
  'rgba(16,15,13,0)',
  'rgba(16,15,13,0.66)',
  'rgba(16,15,13,0.94)',
];

// The stage y the progress stroke sits on — up in the sky, well clear of both
// the figure below it and the masthead above.
const STROKE_STAGE_Y = 258;

// Quotes short enough to actually read during the ~3.4s the screen is up. The
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
// tiny Text only — the scene above it never re-renders during the count.
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
  ready: boolean;
  /**
   * Second boot of ONE cold start, because we restarted into a newly-downloaded
   * bundle (see lib/updates/firstRun.ts). The reader has already watched this
   * animation seconds ago; playing it again reads as a crash-and-restart, which
   * is a bad first impression for the one launch that is actually somebody's
   * first. So it stands down to a plain hold and lifts as soon as boot is ready.
   */
  skipAnimation?: boolean;
  onDone: () => void;
}

// The cold-start loading moment: one of six hand-drawn outdoor scenes (a
// different one each launch), the figure living in it, an ink stroke that draws
// itself across the sky as a progress line with a counting percentage, and a
// short quote resting on paper at the bottom. At 100% the screen lifts away.
export default function LaunchScreen({ ready, skipAnimation = false, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // One scene + one quote per launch.
  const seed = useMemo(() => Math.floor(Math.random() * 233280), []);
  const scene = LAUNCH_SCENES[seed % LAUNCH_SCENES.length];
  const chrome = chromeOn(scene.key);
  const chromeSoft = chrome === INK ? 'rgba(26,26,26,0.62)' : 'rgba(244,241,234,0.70)';
  const base = PALETTES[scene.key].steps[0];
  const quote = SHORT_QUOTES.length > 0 ? SHORT_QUOTES[seed % SHORT_QUOTES.length] : FALLBACK_QUOTE;

  // Cover-fit the 400×800 stage. The art and the figure both live inside it, so
  // sharing this one mapping is what guarantees the feet meet the hill.
  const fit = Math.max(width / STAGE_W, height / STAGE_H);
  const offX = (width - STAGE_W * fit) / 2;
  const offY = (height - STAGE_H * fit) / 2;

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
    if (skipAnimation) {
      // Straight to held: no draw-on, no counting, no second performance. The
      // `ready` effect below still governs the lift, so boot order is unchanged.
      introFade.value = 1;
      progress.value = 92;
      setHeld(true);
      return;
    }
    introFade.value = withTiming(1, { duration: 420 });
    sceneScale.value = withTiming(1.04, { duration: 3800, easing: Easing.out(Easing.quad) });
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
  // The scene breathes very slightly as it loads. Scaled about its centre, so the
  // picture grows into the frame instead of creeping off one corner.
  const stageStyle = useAnimatedStyle(() => ({
    opacity: introFade.value,
    transform: [{ scale: sceneScale.value }],
  }));
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: introFade.value,
    transform: [{ translateY: (1 - introFade.value) * 8 }],
  }));
  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - progress.value / 100),
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: base }, rootStyle]}
    >
      <StatusBar barStyle={chrome === INK ? 'dark-content' : 'light-content'} />

      {/* The scene: inert SVG art with the figure moving on top of it, both in
          stage coordinates. needsOffscreenAlphaCompositing so the intro fade
          composites the figure ONCE — otherwise overlapping limbs double-darken
          on the way in, the way they did on the welcome screen. */}
      <Animated.View
        needsOffscreenAlphaCompositing
        style={[
          styles.stageBox,
          { left: offX, top: offY, width: STAGE_W * fit, height: STAGE_H * fit },
          stageStyle,
        ]}
        pointerEvents="none"
      >
        <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
          <SceneArt scene={scene} />
          <LaunchFigure scene={scene} />
        </View>
      </Animated.View>

      {/* The quote's scrim. Fixed alphas, never derived from the picture — the
          art below the crest is deliberately near-black now, and the words have
          to be safe on the lightest scene as well as the darkest. */}
      <Svg width="100%" height="34%" style={styles.scrim} pointerEvents="none">
        <Defs>
          <LinearGradient id="ls-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgb(16,15,13)" stopOpacity={0} />
            <Stop offset="0.55" stopColor="rgb(16,15,13)" stopOpacity={0.66} />
            <Stop offset="1" stopColor="rgb(16,15,13)" stopOpacity={0.94} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ls-fade)" />
      </Svg>

      {/* Masthead */}
      <Animated.View style={[styles.mast, { top: insets.top + 18 }, fadeInStyle]}>
        <Text style={[styles.mastText, { color: chromeSoft }]}>D E E P L Y</Text>
      </Animated.View>

      {/* The ink stroke drawing itself + percentage, pinned to the sky */}
      <Animated.View style={[styles.strokeWrap, { top: offY + STROKE_STAGE_Y * fit }, fadeInStyle]}>
        <Svg width={strokeW} height={14} viewBox={`0 -7 ${strokeW} 14`}>
          <AnimatedPath
            d={d}
            stroke={chrome}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${len} ${len}`}
            animatedProps={strokeProps}
          />
        </Svg>
        <Pct progress={progress} color={chromeSoft} />
      </Animated.View>

      {/* Quote */}
      <Animated.View style={[styles.quoteWrap, { paddingBottom: insets.bottom + 34 }, fadeInStyle]}>
        <Text style={[styles.quoteText, { color: CREAM }]} numberOfLines={3}>
          “{quote.text}”
        </Text>
        <Text style={[styles.quoteBy, { color: 'rgba(244,241,234,0.72)' }]}>— {quote.author.toUpperCase()}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  stageBox: { position: 'absolute', overflow: 'hidden' },
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
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quoteBy: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    letterSpacing: 2,
    marginTop: 10,
  },
});
