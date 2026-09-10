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
import { C } from '@/constants/design';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { SPLASH_BG } from './launchArt';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── THE TITLE PAGE ──────────────────────────────────────────────────────────
//
// The cold-start loading moment. It was six near-black illustrated landscapes
// with the figure living in them; then a title page with a laurel over the
// wordmark and a stickman who walked the progress line. The reader rejected
// both of those last two — "I just don't like the logo above ashmere and also
// that quick walking animation, I want some other cleaner animation" — and what
// replaced them was RESEARCHED rather than guessed.
//
// ── WHAT THE REFERENCES ACTUALLY SAY ────────────────────────────────────────
//
// Two independent sources describe the same object, and it is the one a book
// wants. The luxury/premium pattern is a minimal line-draw reveal: a thin line
// traces, then the wordmark arrives, soft easing, about two seconds, ending on
// the exact logo centred and fully readable. The signature-drawing literature
// then gives the cadence in NUMBERS — 140ms of stagger between strokes for a
// pen-lift rhythm, and ROUND CAPS, because butt caps leave the dashoffset
// reveal with hard rectangular ends and it reads as a clipped vector wipe,
// where round caps give the ink a soft pen-tip start and finish.
//
// So the animation IS the drawing, and there are exactly two moving things:
//
//   · THE WORDMARK IS SET, one letter at a time, at that 140ms rhythm — the
//     title being composed on the page rather than a logo dropped onto it. It
//     replaced a STRIKE (squash, recoil, back-easing), which is the right
//     motion for a streak seal and the wrong one here: a bounce is the gamified
//     register this screen is deliberately not in.
//   · THE RULE DRAWS ITSELF as the progress, with a NIB at its tip. The nib is
//     not an addition — a stroke-dashoffset reveal already IS a pen moving, and
//     the references say so in as many words; the nib only makes the thing
//     doing it visible. It is one small ink mark riding the line's own measured
//     y, and it LIFTS at the end, because that is what a pen does.
//
// WHY NOT THE FIGURE. He is the mascot of the lessons, and at 57px on a title
// page he read as a sprite scurrying along a rule — limbs at speed, in a
// composition whose whole argument is stillness. Removing him also takes the
// rig off the boot path entirely, which is worth a line of its own: this screen
// died once on walk()'s defaulted gait never reaching the UI runtime's closure
// — fatal in release, on every launch. No worklet here can throw at all now.
//
// WHY NOTHING REPLACED THE LAUREL. A title page does not need an ornament; the
// type is the ornament. Swapping one mark for another mark is how you get asked
// to remove the second one.
//
// WHAT THE REDESIGN BUYS STRUCTURALLY, beyond taste:
//
//   · NO scrims. Nothing may take its contrast from artwork (§19), and there is
//     no artwork: everything is ink on C.paper, and check-launch holds every
//     pairing by arithmetic.
//   · NO first-frame flash. The native splash is SPLASH_BG (pale grey) and the
//     old scenes were near-black — a 10:1 step. Paper is 1.2:1 from it.
//   · NO status-bar flip. Paper from the splash hand-off to the welcome's
//     cream, so the bar is dark-content throughout with no crossing to time.

// The ground, and the two inks on it. Tokens, not local hexes — check-launch
// re-derives every pairing from constants/design.ts and fails the build if a
// text tone here stops clearing 4.5:1 on the ground it sits on.
const GROUND = C.paper;

const STROKE_SVG_H = 14;

// ── THE WORDMARK ────────────────────────────────────────────────────────────
//
// ONE CONSTANT, AND THE LETTERS ARE DERIVED FROM IT. That is not tidiness: this
// screen spelled the PREVIOUS brand for a whole rename because its masthead was
// written one letter at a time, and so matched no search for the name itself,
// and nothing reported it (§19). Setting the letters individually is exactly
// that shape again — so the string lives here whole, check-launch derives the
// expected value from app.json's expo.name, and a rename fails the build
// instead of shipping.
const WORDMARK = 'ASHMERE';
const LETTERS = WORDMARK.split('');

/** The pen-lift rhythm, from the signature-drawing literature. */
const LETTER_STAGGER = 140;
/** Tracking, as a real gap rather than letterSpacing — a per-character
 *  letterSpacing also pads AFTER the last letter, which shifts a centred word
 *  off centre by half a track. */
const LETTER_TRACK = 3;

const NIB = 5;

// Quotes short enough to actually read during the ~3.4s the screen is up. The
// fallback can't realistically be hit, but this screen sits on the boot path —
// an empty pool must never be able to crash the launch. The id rides along so
// QuotePlate can dress the plate in the author's era.
const SHORT_QUOTES = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({ text: q.text, author: p.name, id: p.id }))
).filter((q) => q.text.length <= 90);
const FALLBACK_QUOTE = { text: 'The unexamined life is not worth living.', author: 'Socrates', id: 'socrates' };

/**
 * A slightly wobbly hand-drawn horizontal stroke, its exact length so the
 * draw-on (strokeDashoffset) can map progress onto the path, and the SAMPLED ys
 * so the nib can ride the line rather than float near it.
 *
 * The ys matter more than they look. The path wobbles about 2.6 units either
 * way, and a nib pinned to the centreline would sit off the ink for most of its
 * journey — at 5px that reads as a speck of dirt travelling beside a line.
 * Interpolating the same samples the path was built from puts it exactly on the
 * stroke, by construction, for any seed.
 */
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
  const ys: number[] = [0];
  for (let i = 1; i <= segs; i++) {
    const x = i * dx;
    const y = Math.sin(i * 0.7) * 1.4 + (rand() - 0.5) * 2.4;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
    ys.push(y);
  }
  return { d, len: Math.ceil(len), ys };
}

/**
 * One letter of the title, arriving in its turn.
 *
 * All seven read ONE driver — `set`, which counts LETTERS rather than seconds —
 * so the stagger is a subtraction rather than seven timings that could drift
 * apart. The ease is a DECELERATE: a letter is a thing coming to rest, and the
 * handwriting bezier the references give is for a stroke being drawn, which is
 * the rule's job below rather than the type's.
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
    'worklet';
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

  // One quote per launch.
  const seed = useMemo(() => Math.floor(Math.random() * 233280), []);
  const quote = SHORT_QUOTES.length > 0 ? SHORT_QUOTES[seed % SHORT_QUOTES.length] : FALLBACK_QUOTE;

  const strokeW = Math.round(width * 0.56);
  const { d, len, ys } = useMemo(() => makeStroke(strokeW, seed + 7), [strokeW, seed]);

  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const introFade = useSharedValue(0);
  /** How many letters have been set. Counts letters, not seconds — see Letter. */
  const set = useSharedValue(0);
  const plateIn = useSharedValue(0);
  const footIn = useSharedValue(0);
  const [held, setHeld] = useState(false);

  // Choreography: the title sets itself while the rule draws to 92 over 2.7s
  // (fast start, gentle settle), then waits for `ready` — normally already true,
  // so the finish chains straight on. With the finish + fade this puts the whole
  // moment a little over 3s — long enough to actually read the plate.
  useEffect(() => {
    if (skipAnimation) {
      // Straight to held: no draw-on, no counting, no second performance. The
      // `ready` effect below still governs the lift, so boot order is unchanged.
      // It still FADES briefly — the hand-off from the fresh native splash this
      // path restarts behind. 260ms buys that and nothing else.
      introFade.value = withTiming(1, { duration: 260 });
      set.value = LETTERS.length;
      plateIn.value = withTiming(1, { duration: 260 });
      footIn.value = withTiming(1, { duration: 260 });
      progress.value = 92;
      setHeld(true);
      return;
    }
    introFade.value = withTiming(1, { duration: 420 });
    // LINEAR, and that is the point: the driver counts letters, so a linear ramp
    // IS an even 140ms apart. Easing the DRIVER would bunch the middle letters
    // and space the outer ones — the stagger has to live in the value, and each
    // letter's own ease lives in Letter.
    set.value = withDelay(
      160,
      withTiming(LETTERS.length, {
        duration: LETTERS.length * LETTER_STAGGER,
        easing: Easing.linear,
      })
    );
    // The plate is DEALT onto the table rather than faded up: it slides in with
    // a slight tilt and settles flat, a touch past level and back. It waits for
    // the title to finish setting, so the page composes top-down.
    plateIn.value = withDelay(
      160 + LETTERS.length * LETTER_STAGGER,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.back(1.5)) })
    );
    footIn.value = withDelay(1400, withTiming(1, { duration: 420 }));
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
  // Paper is only a 1.2:1 step from the splash grey, but the settle still rides
  // the intro curve so the very first frame is the splash's own colour and the
  // hand-off has no seam at all.
  const groundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(introFade.value, [0, 1], [SPLASH_BG, GROUND]),
  }));
  const plateStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, plateIn.value * 1.5),
    transform: [
      { translateY: (1 - plateIn.value) * 30 },
      { rotate: `${(1 - plateIn.value) * -2.2}deg` },
    ],
  }));
  const footStyle = useAnimatedStyle(() => ({ opacity: footIn.value }));
  const lineStyle = useAnimatedStyle(() => ({ opacity: introFade.value }));
  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - Math.min(progress.value, 92) / 92),
  }));
  // THE NIB READS THE SAME MAPPING AS THE LINE'S TIP — min(progress, 92) / 92
  // across the same span — so it cannot lead or trail the ink it is drawing.
  // Its y is interpolated out of the path's own samples, so it sits ON the
  // stroke through every wobble; and it LIFTS over the last stretch, which is
  // the pen-lift the reference names rather than a mark that reaches the end of
  // the line and parks there.
  const nibStyle = useAnimatedStyle(() => {
    'worklet';
    const p = Math.min(progress.value, 92) / 92;
    const t = p * (ys.length - 1);
    const i = Math.floor(t);
    const j = Math.min(ys.length - 1, i + 1);
    const y = ys[i] + (ys[j] - ys[i]) * (t - i);
    const lift = Math.max(0, Math.min(1, (p - 0.9) / 0.1));
    return {
      opacity: 1 - lift,
      transform: [
        { translateX: strokeW * p - NIB / 2 },
        { translateY: y - NIB / 2 - lift * 3 },
      ],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, groundStyle, rootStyle]}>
      {/* Dark icons for the whole life of the screen: the ground is paper from
          the splash hand-off to the welcome page's cream, so there is no longer
          a crossing to time. This stays the only barStyle in the app. */}
      <StatusBar barStyle="dark-content" />

      <View style={[styles.col, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 26 }]}>
        <View style={styles.spacerA} />

        {/* The head of the page: the title sets itself letter by letter, then
            the rule draws under it as the progress line. The wordmark is ONE
            constant derived from app.json — see WORDMARK. */}
        <View style={styles.mast}>
          <View style={styles.word}>
            {LETTERS.map((ch, i) => (
              <Letter key={`${ch}-${i}`} ch={ch} index={i} set={set} />
            ))}
          </View>

          <Animated.View style={[styles.strokeWrap, lineStyle]}>
            <View style={{ width: strokeW, height: STROKE_SVG_H }}>
              <Svg
                width={strokeW}
                height={STROKE_SVG_H}
                viewBox={`0 ${-STROKE_SVG_H / 2} ${strokeW} ${STROKE_SVG_H}`}
                style={StyleSheet.absoluteFill}
              >
                {/* ROUND CAPS, and the reference is explicit about why: butt
                    caps end the dashoffset reveal on a hard rectangle and it
                    reads as a clipped vector wipe rather than as ink. */}
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
              {/* The nib. A View rather than an animated Circle: §17's rule 7
                  keeps animation off SVG properties and on native Views. */}
              <Animated.View style={[styles.nib, nibStyle]} pointerEvents="none" />
            </View>
            <Pct progress={progress} color={C.inkSoft} />
          </Animated.View>
        </View>

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
  word: { flexDirection: 'row', gap: LETTER_TRACK },
  letter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: C.ink,
  },
  strokeWrap: { alignItems: 'center', gap: 9, marginTop: 18 },
  nib: {
    position: 'absolute',
    left: 0,
    top: STROKE_SVG_H / 2,
    width: NIB,
    height: NIB,
    borderRadius: NIB / 2,
    backgroundColor: C.ink,
  },
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
