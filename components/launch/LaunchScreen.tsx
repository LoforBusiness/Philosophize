import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedReaction,
  interpolateColor,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import QuotePlate from '@/components/shared/QuotePlate';
import LaurelMark from '@/components/shared/LaurelMark';
import { C } from '@/constants/design';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { SPLASH_BG } from './launchArt';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── THE TITLE PAGE ──────────────────────────────────────────────────────────
//
// The cold-start loading moment, redesigned 2026-09-08. It was six near-black
// illustrated landscapes with the figure living in them; the reader asked for a
// completely new look, no figure required. What replaced it is the front of a
// printed book — which is what this app already claims to be everywhere else:
//
//   · the laurel and the wordmark, set like a title page's head;
//   · a hand-drawn ink rule that draws itself across the page as the progress
//     line, with a counting percentage under it;
//   · one short quotation from the library, presented on the SAME struck
//     QuotePlate every other surface uses — era spine, printer's mark, the one
//     top-left light. A different quotation every launch;
//   · the tagline at the foot, where a title page carries its imprint.
//
// WHAT THE REDESIGN BUYS STRUCTURALLY, beyond taste:
//
//   · NO scrims. The old screen needed two measured gradient scrims because
//     nothing may take its contrast from artwork (§19). There is no artwork:
//     everything here is ink on `C.paper`, and scripts/check-launch.mjs holds
//     every pairing by arithmetic.
//   · NO first-frame flash, by construction. The native splash is SPLASH_BG
//     (pale grey) and the old scenes were near-black — a 10:1 step the ground
//     had to be eased across. Paper is a 1.1:1 step from the splash; the ground
//     still starts on SPLASH_BG and settles into GROUND on the intro curve, so
//     the hand-off stays one continuous surface.
//   · NO status-bar flip. The old screen was the only thing in the app setting
//     `barStyle`, light over dark art, flipped mid-dissolve so the icons
//     crossed with the picture. The ground is paper from the first frame to the
//     welcome page's cream, so the bar is dark-content the whole way and there
//     is no crossing left to time.
//
// The six scene files (launchArt's landscapes, launchScenes, launchMotion) are
// no longer mounted here. launchArt still exports SPLASH_BG — app/_layout.tsx
// reads it — and LaunchFigure + launchMotion are alive on the sign-in screen's
// mascot. The landscape data itself is dormant; sheet-launch.mjs still draws it.

// The ground, and the two inks on it. Tokens, not local hexes — check-launch
// re-derives every pairing from constants/design.ts and fails the build if a
// text tone here stops clearing 4.5:1 on the ground it sits on.
const GROUND = C.paper;

const STROKE_SVG_H = 14;

// Quotes short enough to actually read during the ~3.4s the screen is up. The
// fallback can't realistically be hit, but this screen sits on the boot path —
// an empty pool must never be able to crash the launch. The id rides along so
// QuotePlate can dress the plate in the author's era.
const SHORT_QUOTES = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({ text: q.text, author: p.name, id: p.id }))
).filter((q) => q.text.length <= 90);
const FALLBACK_QUOTE = { text: 'The unexamined life is not worth living.', author: 'Socrates', id: 'socrates' };

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
// tiny Text only — nothing above it re-renders during the count.
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
  /**
   * THE SCREEN UNDERNEATH MAY START NOW — fired when the lift BEGINS, not when
   * it ends, and the two are a second apart on purpose.
   *
   * `onDone` fires after the fade and is what starts the welcome's clock — so
   * firing only that dissolved the launch onto the welcome at clock ZERO, and
   * the welcome at clock zero is EMPTY CREAM: its host walks on from off-stage
   * and his first pixel does not cross the frame until t = 1.03s (measured
   * against the real rig). So the screen underneath is told at the top of the
   * outro instead. The 100% run, the hold and the fade together give it 1.04s
   * of cover — just past 1.03 — which means the launch page is dissolving over
   * a host who is already walking, rather than off a blank page.
   */
  onLift?: () => void;
  onDone: () => void;
}

export default function LaunchScreen({ ready, skipAnimation = false, onLift, onDone }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // One quote per launch.
  const seed = useMemo(() => Math.floor(Math.random() * 233280), []);
  const quote = SHORT_QUOTES.length > 0 ? SHORT_QUOTES[seed % SHORT_QUOTES.length] : FALLBACK_QUOTE;

  const strokeW = Math.round(width * 0.56);
  const { d, len } = useMemo(() => makeStroke(strokeW, seed + 7), [strokeW, seed]);

  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const introFade = useSharedValue(0);
  const plateIn = useSharedValue(0);
  const footIn = useSharedValue(0);
  const [held, setHeld] = useState(false);

  // Choreography: draw to 92 over 2.7s (fast start, gentle settle), then wait
  // for `ready` — normally already true, so the finish chains straight on.
  // With the finish + fade this puts the whole moment a little over 3s — long
  // enough to actually read the plate. The head, the plate and the foot arrive
  // as three slices of one entrance, top of the page first.
  useEffect(() => {
    if (skipAnimation) {
      // Straight to held: no draw-on, no counting, no second performance. The
      // `ready` effect below still governs the lift, so boot order is unchanged.
      // It still FADES briefly — the hand-off from the fresh native splash this
      // path restarts behind. 260ms buys that and nothing else.
      introFade.value = withTiming(1, { duration: 260 });
      plateIn.value = withTiming(1, { duration: 260 });
      footIn.value = withTiming(1, { duration: 260 });
      progress.value = 92;
      setHeld(true);
      return;
    }
    introFade.value = withTiming(1, { duration: 420 });
    plateIn.value = withDelay(180, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
    footIn.value = withDelay(340, withTiming(1, { duration: 420 }));
    progress.value = withTiming(
      92,
      { duration: 2700, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setHeld)(true);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // THE OUTRO, and its three durations are a budget rather than a taste.
  //
  // 280 + 240 + 520 = 1.04s of cover, against the 1.03s the welcome's host needs
  // to walk into frame — see `onLift`. Shorten any of the three and the handover
  // goes back to revealing an empty page; the hold at 100% is also what stops
  // the count reading as a cut. scripts/check-ui.mjs §10 reads these numbers
  // out of this block and holds them against the tab warm-up's SETTLE_MS.
  const lifted = useRef(false);
  useEffect(() => {
    if (!held || !ready || lifted.current) return;
    lifted.current = true;
    onLift?.();
    progress.value = withTiming(100, { duration: 280, easing: Easing.out(Easing.quad) }, (f) => {
      if (f) {
        screenOpacity.value = withDelay(
          240,
          withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }, (done) => {
            if (done) runOnJS(onDone)();
          })
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held, ready]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  // THE GROUND STARTS WHERE THE SPLASH LEFT OFF. See SPLASH_BG in launchArt.ts.
  // Paper is only a 1.1:1 step from the splash grey, but the settle still rides
  // the intro curve so the very first frame is the splash's own colour and the
  // hand-off has no seam at all.
  const groundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(introFade.value, [0, 1], [SPLASH_BG, GROUND]),
  }));
  const mastStyle = useAnimatedStyle(() => ({
    opacity: introFade.value,
    transform: [{ translateY: (1 - introFade.value) * 8 }],
  }));
  const plateStyle = useAnimatedStyle(() => ({
    opacity: plateIn.value,
    transform: [{ translateY: (1 - plateIn.value) * 10 }],
  }));
  const footStyle = useAnimatedStyle(() => ({ opacity: footIn.value }));
  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - progress.value / 100),
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, groundStyle, rootStyle]}>
      {/* Dark icons for the whole life of the screen: the ground is paper from
          the splash hand-off to the welcome page's cream, so there is no longer
          a crossing to time. This stays the only barStyle in the app. */}
      <StatusBar barStyle="dark-content" />

      <View style={[styles.col, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 26 }]}>
        <View style={styles.spacerA} />

        {/* The head of the page: mark, wordmark, and the rule that draws itself
            as the progress line. The wordmark is the brand from app.json —
            check-launch derives the expected string from expo.name, the rule
            that caught this screen still saying the previous name (§19). */}
        <Animated.View style={[styles.mast, mastStyle]}>
          <LaurelMark width={78} />
          <Text style={styles.wordmark}>ASHMERE</Text>
          <View style={styles.strokeWrap}>
            <Svg
              width={strokeW}
              height={STROKE_SVG_H}
              viewBox={`0 ${-STROKE_SVG_H / 2} ${strokeW} ${STROKE_SVG_H}`}
            >
              <AnimatedPath
                d={d}
                stroke={C.ink}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={`${len} ${len}`}
                animatedProps={strokeProps}
              />
            </Svg>
            <Pct progress={progress} color={C.inkSoft} />
          </View>
        </Animated.View>

        <View style={styles.spacerB} />

        {/* The epigraph — the app's own struck plate, era spine and all, so the
            first object anyone sees is the object the whole app is made of.
            Its tones are tone.plate()'s and are already held by check-ui. */}
        <Animated.View style={plateStyle}>
          <QuotePlate
            text={quote.text}
            author={quote.author}
            philosopherId={quote.id}
            size="md"
            kicker="FROM THE LIBRARY"
          />
        </Animated.View>

        <View style={styles.spacerC} />

        <Animated.Text style={[styles.foot, footStyle]}>
          THE ART OF THINKING DEEPLY
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  col: { flex: 1, paddingHorizontal: 26 },
  spacerA: { flex: 3 },
  spacerB: { flex: 2 },
  spacerC: { flex: 3 },
  mast: { alignItems: 'center' },
  wordmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 3,
    color: C.ink,
    marginTop: 10,
  },
  strokeWrap: { alignItems: 'center', gap: 9, marginTop: 14 },
  pct: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
  },
  foot: {
    alignSelf: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 2.5,
    color: C.inkSoft,
  },
});
