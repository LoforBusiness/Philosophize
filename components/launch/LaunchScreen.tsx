import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useDerivedValue,
  interpolateColor,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { C } from '@/constants/design';
import InkDrawing from './InkDrawing';
import { ART } from './inkArt';
import { SPLASH_BG } from './launchArt';

// ─── THE DRAWING ─────────────────────────────────────────────────────────────
//
// The cold-start loading moment. It has been six near-black illustrated
// landscapes, then a laurel over the wordmark, then a title page whose rule drew
// itself under a struck quotation. What it is now was asked for directly, and in
// this order: a completely white page; the scribble on the left drawing itself
// out, stroke by stroke, into a ball of ink; the line carrying on across the
// page and drawing the light bulb; and then the yellow going in and the light
// coming on. Everything is DRAWN — nothing appears.
//
// ── WHAT THE SCREEN IS MADE OF NOW ──────────────────────────────────────────
//
// The picture is one unbroken pen line, and `inkArt.ts` holds it as the path the
// pen actually took rather than as an outline of the ink — that distinction is
// the whole reason it can be drawn at all, and its header records how the
// centreline was recovered from the JPEG. `InkDrawing` reveals it along its own
// length and explains why each stroke gets its own small <Svg>.
//
// ONE CLOCK RUNS ALL OF IT. `progress` is the readout, 0 → 92 while the drawing
// is made and 92 → 100 on the way out; `u` is that same value re-expressed as
// the drawing's own 0 → 1 timeline. The pen, the marker, the light and the title
// are all functions of `u`, so none of them can drift out of step with the
// others — which is the trap group L of the rule book is entirely about, and
// which this screen has already been bitten by once in the status-bar flip.
//
// THE DRAW RUNS LINEAR ON PURPOSE. An eased driver would put the pen's speed in
// the easing curve, where it belongs to the SCHEDULE: `InkDrawing` deals time by
// stroke length, so the tangle is scribbled fast and the bulb is drawn slowly
// because those are two different acts, not because a cubic happens to be
// flattening out at that moment.
//
// WHY THE PAGE IS PURE WHITE rather than `C.paper`. Everything else in this app
// is printed on #FAFAF7 and this screen was too. It was asked for white, the
// source drawing's own page measures #FEFEFE, and a bulb glowing on a warm sheet
// is a slightly different picture from a bulb glowing on a white one. The cost
// is one number: the native splash is a COMPILED resource (§18) and cannot be
// changed over the air, so the first frame is still the splash grey and the step
// up to white is 1.28:1 instead of 1.02:1 — imperceptible, and against the 10.7:1
// flash the old near-black scenes opened with. The ground still STARTS on the
// splash colour and settles, so the hand-off has no seam.
//
// NO RIG, NO FIGURE, NO FRAME CLOCK, and that is a safety rule rather than a
// taste one. This screen died in release once on `walk()`'s defaulted gait never
// reaching the UI runtime's closure — fatal on every launch, invisible to tsc
// and invisible in a browser. Nothing here can throw on the UI thread.

/** The page. See the note above — this screen is the one pure-white surface. */
const GROUND = '#FFFFFF';

/**
 * How long the drawing takes. It is a floor on every cold start, so it is the
 * one number here worth being tight about: 2,900ms plus the 1,040ms outro puts
 * the screen at 3.94s, against the 3.74s the title page it replaces took.
 */
const DRAW_MS = 2900;

// ── THE TITLE ───────────────────────────────────────────────────────────────
//
// ONE CONSTANT, AND THE LETTERS ARE DERIVED FROM IT. That is not tidiness: this
// screen spelled the PREVIOUS brand for a whole rename because its masthead was
// written one letter at a time and so matched no search for the name itself, and
// nothing reported it (§19). Setting the letters individually is exactly that
// shape again — so the string lives here whole, check-launch derives the
// expected value from app.json's expo.name, and a rename fails the build.
const WORDMARK = 'ASHMERE';
const LETTERS = WORDMARK.split('');

/** The pen-lift rhythm, from the signature-drawing literature. */
const LETTER_STAGGER = 140;
/** Tracking as a real gap rather than letterSpacing — a per-character
 *  letterSpacing also pads AFTER the last letter, which shifts a centred word
 *  off centre by half a track. */
const LETTER_TRACK = 3;

/**
 * Where in the drawing's timeline the title starts setting itself.
 *
 * Derived rather than picked: the seven letters take LETTERS.length ×
 * LETTER_STAGGER to arrive, and the name has to be finished before the drawing
 * is. Starting here, the title composes while the marker fills the glass and
 * lands as the light settles — the app's name arriving under the idea.
 */
const WORD_SPAN = (LETTERS.length * LETTER_STAGGER) / DRAW_MS;
const WORD_AT = 1 - WORD_SPAN - 0.01;

/**
 * One letter of the title, arriving in its turn.
 *
 * All seven read ONE driver — `set`, which counts LETTERS rather than seconds —
 * so the stagger is a subtraction rather than seven timings that could drift
 * apart. The ease is a DECELERATE: a letter is a thing coming to rest.
 */
const Letter = memo(function Letter({
  ch,
  index,
  set,
}: {
  ch: string;
  index: number;
  set: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, set.value - index));
    const e = 1 - Math.pow(1 - u, 3);
    return { opacity: e, transform: [{ translateY: (1 - e) * 7 }] };
  });
  return <Animated.Text style={[styles.letter, style]}>{ch}</Animated.Text>;
});

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

  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const introFade = useSharedValue(0);
  const [held, setHeld] = useState(false);

  /**
   * The drawing's own timeline. Everything the page draws reads THIS — one
   * clock, so the pen, the marker, the light and the title cannot disagree.
   * The mapping is the same min(progress, 92) / 92 the old rule and its nib
   * shared, and for the same reason.
   */
  const u = useDerivedValue(() => Math.min(progress.value, 92) / 92);

  /** How many letters have been set. Counts letters, not seconds — see Letter. */
  const set = useDerivedValue(() => {
    const t = (u.value - WORD_AT) / WORD_SPAN;
    const p = t < 0 ? 0 : t > 1 ? 1 : t;
    return p * LETTERS.length;
  });

  // The drawing is made over DRAW_MS and then waits for `ready` — normally
  // already true, so the finish chains straight on.
  useEffect(() => {
    if (skipAnimation) {
      // Straight to held: no drawing, no counting, no second performance. The
      // `ready` effect below still governs the lift, so boot order is unchanged.
      // It still FADES briefly — the hand-off from the fresh native splash this
      // path restarts behind. 260ms buys that and nothing else.
      introFade.value = withTiming(1, { duration: 260 });
      progress.value = 92;
      setHeld(true);
      return;
    }
    introFade.value = withTiming(1, { duration: 420 });
    // LINEAR, and that is the point: the pen's speed belongs to the schedule in
    // InkDrawing, which deals time by stroke length, not to an easing curve that
    // would quietly make the bulb draw slowly because a cubic is flattening out.
    progress.value = withTiming(
      92,
      { duration: DRAW_MS, easing: Easing.linear },
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
  // the count reading as a cut. scripts/check-ui.mjs §10 reads these numbers out
  // of this block and holds them against the tab warm-up's SETTLE_MS.
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
  // THE GROUND STARTS WHERE THE SPLASH LEFT OFF. See SPLASH_BG in launchArt.ts:
  // the compiled splash colour cannot be changed over the air, so the page
  // settles onto white across the intro rather than cutting to it.
  const groundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(introFade.value, [0, 1], [SPLASH_BG, GROUND]),
  }));
  const artStyle = useAnimatedStyle(() => ({ opacity: introFade.value }));

  // THE DRAWING IS FULL-BLEED, and that is the composition rather than a
  // shortcut. The line enters the page at the left edge and the bulb sits hard
  // against the right one; inset it and both ends stop being a line that came
  // from somewhere and became something.
  const artH = useMemo(() => (width / ART.w) * ART.h, [width]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, groundStyle, rootStyle]}>
      {/* Dark icons for the whole life of the screen. The ground is white from
          the splash hand-off to the welcome page's cream, so there is no
          crossing to time. This stays the only barStyle in the app. */}
      <StatusBar barStyle="dark-content" />

      <View style={[styles.col, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.spacerA} />

        <Animated.View style={[{ width, height: artH }, artStyle]}>
          <InkDrawing u={u} width={width} />
        </Animated.View>

        {/* The title composes under the drawing as the glass fills, and is
            finished as the light settles. */}
        <View style={styles.word}>
          {LETTERS.map((ch, i) => (
            <Letter key={`${ch}-${i}`} ch={ch} index={i} set={set} />
          ))}
        </View>

        <View style={styles.spacerB} />

        <Pct progress={progress} color={C.inkSoft} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  col: { flex: 1, alignItems: 'center' },
  spacerA: { flex: 5 },
  spacerB: { flex: 4 },
  word: {
    flexDirection: 'row',
    gap: LETTER_TRACK,
    marginTop: 34,
  },
  letter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: 0,
    color: C.ink,
  },
  pct: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    color: C.inkSoft,
  },
});
