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

import {
  PALETTES, CREAM, SCRIM_RGB, SCRIM_STOPS,
  TOP_SCRIM_STOPS, topScrimHeight,
} from './launchArt';

// The scene now runs full-bleed to the bottom edge and the foreground is the
// DARK end, which is what let the art stop being a blank sheet below the horizon.
// NOTHING ON THIS SCREEN TAKES ITS CONTRAST FROM THE ARTWORK (§19). Both ends
// are built the same way: a FIXED gradient scrim mixed from SCRIM_RGB, one fixed
// cream over it, and a drop shadow on top of that.
//   · the quote, at the bottom, on SCRIM_STOPS — clear at its top edge, 0.94
//     where the words are;
//   · the masthead, the stroke and the percentage, at the top, on
//     TOP_SCRIM_STOPS — the same thing inverted, 0.66 across the whole chrome
//     band and out to nothing below it.
// scripts/check-launch.mjs composites the real art under both and measures them.
// Nothing here is a guess.

// ─── THE CHROME BAND ─────────────────────────────────────────────────────────
//
// The masthead, the progress stroke and the percentage, in that order down the
// top of the screen. They are declared as named constants rather than typed
// into the styles because scripts/check-launch.mjs READS THESE VERY LINES and
// lays the band out itself on eight device sizes — so the check can never again
// be measuring a geometry the component does not have.
//
// TWO COORDINATE SPACES MEET HERE, and that is the whole hazard. The masthead
// is positioned in SCREEN space (`insets.top + MAST_TOP_PAD`); the stroke wants
// to be in STAGE space, pinned to a dark part of the sky. The stage is
// cover-fitted — fit = max(w/400, h/800), offY = (h - 800·fit)/2 — so `offY` is
// 0 only when the device is exactly 2:1 or taller. Below that it goes NEGATIVE
// and stage space slides upward relative to the screen: at 820×1180 by 230px,
// on a Z Fold's inner screen by 253px. A stroke placed at a bare
// `offY + STROKE_STAGE_Y * fit` therefore climbs through the masthead and then
// off the top of the display entirely, and `app.json` ships
// `orientation: portrait` with `supportsTablet: true` and excludes neither
// tablets nor foldables on Play. `strokeTop` below CLAMPS against the
// masthead's own box for exactly that reason.
//
// Both line heights are SET, not inherited from the font. Inter at fontSize 10
// lays out ≈12.1px and at 12 ≈14.6px, but the exact figure is platform metrics —
// and a checker cannot measure a box whose height it has to guess at.
const MAST_TOP_PAD = 18;        // masthead box top, below the safe-area inset
const MAST_LINE_H = 13;         // the masthead's line box
const CHROME_GAP = 12;          // clear air between the masthead box and strokeWrap's top
const STROKE_W = 3;             // the ink line's own width
const STROKE_JITTER = 2.6;      // makeStroke's worst |y|: 1.4 sine + 1.2 noise
const STROKE_SVG_H = 14;        // the Svg box the stroke is centred in
const PCT_GAP = 12;             // strokeWrap's own `gap`, stroke box → percentage
const PCT_LINE_H = 15;          // the percentage's line box
// The ink therefore reaches STROKE_JITTER + STROKE_W/2 = 4.1 either side of that
// box's centre — 2.9 to 11.1 down from strokeWrap's top, which is the extent
// check-launch.mjs tests against the masthead and against the top of the screen.

// The stage y the progress stroke PREFERS — up in the sky, clear of the figure
// below it and below the masthead above. It is a preference, not a position:
// `strokeTop` takes the lower of it and the masthead's floor.
//
// launchArt.ts inverted the sky so it is brightest at the HORIZON: the top of
// the frame is now the dark end. 258 was chosen for the OLD sky — dark at top,
// pale at bottom — and under the new gradient that y sits ~58% down, in the
// brightest part of the frame. 90 keeps the stroke up where the composition
// wants it, high in the sky and well clear of the figure. Legibility is no
// longer a reason to prefer one y over another — the top scrim covers whatever
// row the clamp lands on — but the composition still is.
//
// The clearance it buys, on the 390×844 reference check-launch.mjs measures
// (insets.top 47, fit 1.055, offY 0), with every term shown:
//
//   masthead box   47 + 18 = 65 → 65 + 13 = 78 screen   (stage 61.6 – 73.9)
//   strokeWrap top 0 + 90 × 1.055 = 94.95 screen
//   stroke ink     94.95 + 2.9 = 97.85 → 106.05 screen  (stage 92.7 – 100.5)
//   clearance      97.85 − 78 = 19.85 screen px ÷ 1.055 = 18.8 STAGE UNITS
//
// 18.8, not the ~28 an earlier version of this comment claimed: that number
// measured the stroke's ANCHOR to the masthead box's TOP, which throws away the
// masthead's 13px line box and the stroke's own 2.9px inset. The figure's crown
// sits at stage y 512–575, so the other end has ~420 units and is not close.
const STROKE_STAGE_Y = 90;

// There were two alphas here, one for ink chrome and one for cream, tuned until
// the chrome could be read off the sky. The last note left on them said the
// cream one had "0.04 of margin and there is no more… if this needs to give
// again, the answer is a scrim under the chrome". It did, and it is: the chrome
// is cream on TOP_SCRIM_STOPS now and neither alpha has anything left to do.

/** CREAM, alpha-blended — derived from the constant, never retyped as decimals. */
function toRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

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
// different one each launch), the figure living in it, a cream stroke that draws
// itself across the sky as a progress line with a counting percentage, and a
// short quote resting on a dark scrim at the bottom. Both ends of the screen are
// fixed cream on a fixed scrim, so the scene underneath can be anything at all.
// At 100% the screen lifts away.
export default function LaunchScreen({ ready, skipAnimation = false, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // One scene + one quote per launch.
  const seed = useMemo(() => Math.floor(Math.random() * 233280), []);
  const scene = LAUNCH_SCENES[seed % LAUNCH_SCENES.length];
  const base = PALETTES[scene.key].steps[0];
  const quote = SHORT_QUOTES.length > 0 ? SHORT_QUOTES[seed % SHORT_QUOTES.length] : FALLBACK_QUOTE;

  // Cover-fit the 400×800 stage. The art and the figure both live inside it, so
  // sharing this one mapping is what guarantees the feet meet the hill.
  const fit = Math.max(width / STAGE_W, height / STAGE_H);
  const offX = (width - STAGE_W * fit) / 2;
  const offY = (height - STAGE_H * fit) / 2;

  const strokeW = Math.round(width * 0.68);
  const { d, len } = useMemo(() => makeStroke(strokeW, seed + 7), [strokeW, seed]);

  // Where the chrome band lands. The masthead is plain screen space; the stroke
  // takes the LOWER of its preferred stage y and a screen-space floor sitting
  // CHROME_GAP under the masthead's box. On a 2:1-or-taller device offY is 0 and
  // the floor never binds, so the composition is exactly the one authored above;
  // below 2:1 offY goes negative, the stage placement would climb through the
  // masthead and off the display, and the floor takes over. See the two-spaces
  // note by MAST_TOP_PAD — this one line is the whole of that fix.
  const mastTop = insets.top + MAST_TOP_PAD;
  const strokeTop = Math.max(mastTop + MAST_LINE_H + CHROME_GAP, offY + STROKE_STAGE_Y * fit);

  // THE BOTTOM OF THE CHROME, and therefore the bottom of the scrim's full-alpha
  // run. Derived from `strokeTop` — the clamped one — down through the stroke's
  // box, `strokeWrap`'s own gap and the percentage's line box, which is the same
  // chain check-launch.mjs lays out. Every term is a named constant above, so a
  // scrim that stops short of the percentage is not a thing that can be typed.
  const chromeBottom = strokeTop + STROKE_SVG_H + PCT_GAP + PCT_LINE_H;

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
      {/* Always light: the status bar sits inside the top scrim's full-alpha
          run on every device, whatever scene came up behind it. */}
      <StatusBar barStyle="light-content" />

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
            {SCRIM_STOPS.map((s) => (
              <Stop
                key={s.offset}
                offset={s.offset}
                stopColor={`rgb(${SCRIM_RGB.join(',')})`}
                stopOpacity={s.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ls-fade)" />
      </Svg>

      {/* The chrome's scrim — the same construction as the quote's, inverted:
          full alpha from the top edge down to `chromeBottom`, then out to
          nothing. `topScrimHeight` is what makes the hold land exactly there,
          so this is sized by the layout rather than by a guessed percentage.
          Unanimated, like the quote's — the text fades in over it. */}
      <Svg
        width="100%"
        height={topScrimHeight(chromeBottom)}
        style={styles.topScrim}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="ls-top-fade" x1="0" y1="0" x2="0" y2="1">
            {TOP_SCRIM_STOPS.map((s) => (
              <Stop
                key={s.offset}
                offset={s.offset}
                stopColor={`rgb(${SCRIM_RGB.join(',')})`}
                stopOpacity={s.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ls-top-fade)" />
      </Svg>

      {/* Masthead */}
      <Animated.View style={[styles.mast, { top: mastTop }, fadeInStyle]}>
        <Text style={[styles.mastText, { color: CREAM }]}>D E E P L Y</Text>
      </Animated.View>

      {/* The cream stroke drawing itself + percentage, pinned to the sky — but
          never above the masthead, and never off the top of the display. */}
      <Animated.View style={[styles.strokeWrap, { top: strokeTop }, fadeInStyle]}>
        <Svg
          width={strokeW}
          height={STROKE_SVG_H}
          viewBox={`0 ${-STROKE_SVG_H / 2} ${strokeW} ${STROKE_SVG_H}`}
        >
          <AnimatedPath
            d={d}
            stroke={CREAM}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${len} ${len}`}
            animatedProps={strokeProps}
          />
        </Svg>
        <Pct progress={progress} color={CREAM} />
      </Animated.View>

      {/* Quote */}
      <Animated.View style={[styles.quoteWrap, { paddingBottom: insets.bottom + 34 }, fadeInStyle]}>
        <Text style={[styles.quoteText, { color: CREAM }]} numberOfLines={3}>
          “{quote.text}”
        </Text>
        <Text style={[styles.quoteBy, { color: toRgba(CREAM, 0.72) }]}>— {quote.author.toUpperCase()}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  stageBox: { position: 'absolute', overflow: 'hidden' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  topScrim: { position: 'absolute', left: 0, right: 0, top: 0 },
  mast: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // The same drop-shadow the quote wears below, and it is the same hedge for
  // the same reason: it sits ON TOP of the measured scrim contrast, never
  // instead of it. Nothing here is relying on a shadow to be readable.
  mastText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: MAST_LINE_H,
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  strokeWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: PCT_GAP },
  pct: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: PCT_LINE_H,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
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
