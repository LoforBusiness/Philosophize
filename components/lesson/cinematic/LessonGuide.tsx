// ─────────────────────────────────────────────────────────────────────────────
// THE GUIDE AT THE START OF A LESSON — tap left to go back, right to go forward, and
// the Aa button, drawn OVER the lesson rather than instead of it.
//
// ── WHAT IS IMPRINT'S AND WHAT IS NOT ────────────────────────────────────────
//
// Measured frame by frame from two recorded reviews (2024, 2026), Imprint's guide is
// a single hairline dividing the screen a third of the way in, "back" small on the
// left and "forward" large on the right — the type size says which is the common
// action — and in 2026 the line grows from a stub in the middle and slides to the
// one-third mark. It shows at the start of every lesson. That construction is kept
// here whole: the line, the split, the growth, the slide, the two sizes.
//
// Two things are deliberately NOT Imprint's. Theirs is an opaque white screen that
// hides the lesson; the owner asked to "see the background of the lesson" through
// it, so this is DARK GLASS — ink over the lesson at 60%. Dark rather than a paper
// wash because an overlay has to look unmistakably unlike the screen it explains
// (NN/g), and these lessons are paper-white: a white wash over them reads as the
// screen still loading. And theirs has no "Don't show again"; NN/g's finding that
// help must be easy to dismiss AND easy to bring back is why this one has both, with
// Settings › Lessons as the way back.
//
// ── THE WORDS SIT ON THEIR OWN GLASS, AND THAT IS WHAT THE FIRST RENDER SAID ──
//
// Drawn bare on the scrim, "back" and "forward" landed on the lesson's own opening
// paragraph showing through underneath — two layers of words in one place, which is
// the clutter a see-through guide invites. So every piece of guide type sits on a
// darker plate of its own (ink at 74%, a hairline rim), and the scrim can stay light
// enough for the lesson to read through it.
//
// The numbers: 60% ink over a white stage composites to about #747474, and solid
// white on that is 4.7:1 — the one word left bare, "Don't show again", clears 4.5.
// On a plate white is past 12:1. The hierarchy is carried by SIZE and WEIGHT, as
// Imprint carries it, and never by fading a word: white at 60% opacity would fall
// to 2.9:1. The line is near-white with the palette's teal in it, 3.9:1 on the
// scrim where a mark needs 3; the palette's own TEAL would vanish into the grey.
//
// ── THE LESSON WAITS BEHIND IT ───────────────────────────────────────────────
//
// The route arms the guide before the player's first render (LessonGuideHost), so
// the beat clock holds at its first frame and the first line is not spoken to a
// reader still reading this. It lets go the moment the reader closes it — at the
// START of the fade, so the lesson begins as the glass lifts rather than after.
//
// ── ONE DRIVER FOR THE ENTRANCE ──────────────────────────────────────────────
//
// Every stage of the entrance is a slice of one linear 0→1 value (ThinkerPeek's
// construction, and for its reason: a stage window is only honest on a linear
// driver, with the easing inside each stage). The tap ripples are a second, looping
// value that starts once the entrance is done. With Reduce Motion on there is no line
// to draw and no ripple: the guide fades in complete.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withRepeat, Easing, runOnJS,
  useReducedMotion, interpolate, Extrapolation, type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/ui/Button';
import { INK } from '@/components/shared/tone';
import { useGuideStore, setGuideOpen } from './lessonGuideState';
import { useUserDataStore } from '@/stores/userDataStore';
import { BACK_SHARE } from './tapNav';

/** Ink over the lesson. See the header: 60% lets bare white type clear 4.5:1 on a white stage. */
const SCRIM = 'rgba(26,26,26,0.60)';
/** Near-white with the palette's teal in it: 3.9:1 on the scrim over paper, where a mark needs 3. */
const LINE = '#E2ECEA';
/** The glass every word of the guide sits on. */
const PLATE = 'rgba(18,18,18,0.74)';
const WHITE = '#FFFFFF';

const ENTER_MS = 1300;
const EXIT_MS = 240;
const RIPPLE_MS = 2600;

/** A stage of the entrance: the slice [a, b] of the driver, eased out. */
function stage(u: number, a: number, b: number) {
  'worklet';
  const t = Math.min(1, Math.max(0, (u - a) / (b - a)));
  return 1 - (1 - t) * (1 - t) * (1 - t);
}

interface Ring { x: number; y: number; d: number }

function Chevron({ left, size = 14 }: { left: boolean; size?: number }) {
  const h = size * 1.7;
  return (
    <Svg width={size} height={h} viewBox="0 0 14 24">
      <Path d={left ? 'M10 4 L3 12 L10 20' : 'M4 4 L11 12 L4 20'} stroke={WHITE} strokeWidth={2.6}
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** A fingertip landing: a dot, and a ring that leaves it. Driven by the loop value. */
function Ripple({ loop, from, to }: { loop: SharedValue<number>; from: number; to: number }) {
  const ring = useAnimatedStyle(() => {
    const t = interpolate(loop.value, [from, to], [0, 1], Extrapolation.CLAMP);
    const on = loop.value >= from && loop.value <= to ? 1 : 0;
    return { opacity: on * (1 - t) * 0.9, transform: [{ scale: 0.5 + t * 1.9 }] };
  });
  const dot = useAnimatedStyle(() => {
    const t = interpolate(loop.value, [from, from + (to - from) * 0.3, to], [1, 0.72, 1], Extrapolation.CLAMP);
    return { transform: [{ scale: t }] };
  });
  return (
    <View style={styles.ripple} pointerEvents="none">
      <Animated.View style={[styles.rippleRing, ring]} />
      <Animated.View style={[styles.rippleDot, dot]} />
    </View>
  );
}

export default function LessonGuide({ onRelease, onGone, onNever }: {
  /** The reader has closed it: let the lesson start (called as the fade begins). */
  onRelease: () => void;
  /** The fade has finished: unmount. */
  onGone: () => void;
  /** "Don't show again". */
  onNever: () => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const wordsRef = useGuideStore((s) => s.wordsRef);

  const enter = useSharedValue(0);
  const exit = useSharedValue(1);
  const loop = useSharedValue(0);
  const closing = useRef(false);

  useEffect(() => {
    if (reduce) {
      enter.value = withTiming(1, { duration: 260 });
      return;
    }
    enter.value = withTiming(1, { duration: ENTER_MS, easing: Easing.linear });
    loop.value = withDelay(ENTER_MS - 100, withRepeat(withTiming(1, { duration: RIPPLE_MS, easing: Easing.linear }), -1, false));
  }, [enter, loop, reduce]);

  // ── RING THE REAL Aa BUTTON ───────────────────────────────────────────────
  // Both boxes are measured in the WINDOW and subtracted, so the ring lands on the
  // button wherever the lesson's container sits. `measureInWindow` answers (0, 0) for
  // a view that is not attached yet (CLAUDE.md §21), so a reading at the origin is
  // taken as "not yet" and asked again, a few times, before the ring is left out.
  const root = useRef<View>(null);
  const [ring, setRing] = useState<Ring | null>(null);
  const measure = useCallback((tries = 0) => {
    const btn = wordsRef?.current;
    const me = root.current;
    if (!btn || !me) return;
    me.measureInWindow((ox, oy) => {
      btn.measureInWindow((x, y, w, h) => {
        const unattached = w === 0 || (x === 0 && y === 0);
        if (unattached) {
          if (tries < 8) setTimeout(() => measure(tries + 1), 90);
          return;
        }
        const d = Math.max(w, h) + 14;
        setRing({ x: x - ox + w / 2, y: y - oy + h / 2, d });
      });
    });
  }, [wordsRef]);
  const onLayout = useCallback((_e: LayoutChangeEvent) => measure(0), [measure]);
  // The player registers the button in an effect, which can land after this
  // overlay's first layout — so a button arriving is itself a reason to measure.
  useEffect(() => { measure(0); }, [measure]);

  const close = useCallback((never: boolean) => {
    if (closing.current) return;
    closing.current = true;
    if (never) onNever();
    onRelease();
    exit.value = withTiming(0, { duration: EXIT_MS, easing: Easing.in(Easing.quad) }, (fin) => {
      if (fin) runOnJS(onGone)();
    });
  }, [exit, onGone, onNever, onRelease]);

  // ── GEOMETRY ─────────────────────────────────────────────────────────────
  const split = W * BACK_SHARE;
  const lineTop = insets.top + 132;
  const lineBottom = H - insets.bottom - 150;
  const lineH = Math.max(80, lineBottom - lineTop);
  const midY = lineTop + lineH / 2;

  // ── STAGES ───────────────────────────────────────────────────────────────
  const rootStyle = useAnimatedStyle(() => ({ opacity: exit.value }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: reduce ? enter.value : stage(enter.value, 0, 0.18) }));
  const lineStyle = useAnimatedStyle(() => {
    const grow = reduce ? 1 : stage(enter.value, 0.10, 0.42);
    const slide = reduce ? 1 : stage(enter.value, 0.42, 0.70);
    const x = W / 2 + (split - W / 2) * slide;
    return {
      opacity: reduce ? enter.value : Math.min(1, grow * 3),
      height: lineH * grow,
      top: midY - (lineH * grow) / 2,
      left: x - 1,
    };
  });
  const leftStyle = useAnimatedStyle(() => {
    const t = reduce ? enter.value : stage(enter.value, 0.55, 0.80);
    return { opacity: t, transform: [{ translateY: (1 - t) * 8 }] };
  });
  const rightStyle = useAnimatedStyle(() => {
    const t = reduce ? enter.value : stage(enter.value, 0.62, 0.87);
    return { opacity: t, transform: [{ translateY: (1 - t) * 8 }] };
  });
  const calloutStyle = useAnimatedStyle(() => {
    const t = reduce ? enter.value : stage(enter.value, 0.66, 0.92);
    return { opacity: t, transform: [{ translateY: (1 - t) * -6 }] };
  });
  const ringStyle = useAnimatedStyle(() => {
    const t = reduce ? enter.value : stage(enter.value, 0.66, 0.90);
    return { opacity: t, transform: [{ scale: 1.25 - 0.25 * t }] };
  });
  const buttonsStyle = useAnimatedStyle(() => {
    const t = reduce ? enter.value : stage(enter.value, 0.74, 1);
    return { opacity: t, transform: [{ translateY: (1 - t) * 14 }] };
  });

  const labelTop = midY - 44;
  // The callout hangs under the ring when there is one, and under the header's right
  // end when there is not.
  const calloutTop = ring ? ring.y + ring.d / 2 + 16 : 0;

  return (
    <Animated.View
      ref={root}
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, styles.root, rootStyle]}
      accessibilityViewIsModal
    >
      {/* Tapping anywhere closes it. No button ROLE on this layer: react-native-web
          renders a role="button" Pressable as a real <button>, and "Got it" inside
          it would then be a button inside a button. The buttons below are the
          accessible way out. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }, scrimStyle]} pointerEvents="none">
          {/* Deeper toward the foot, behind the two buttons: the lesson's own
              "Tap to continue" sits there and read straight through the first
              render, underneath "Don't show again". */}
          <LinearGradient
            colors={['rgba(18,18,18,0)', 'rgba(18,18,18,0.62)']}
            style={[styles.foot, { height: 170 + insets.bottom }]}
          />
        </Animated.View>

        {/* THE LINE — grows from the middle, then slides to the one-third mark. */}
        <Animated.View style={[styles.line, lineStyle]} pointerEvents="none" />

        {/* BACK — the left third, set small: it is the recovery, not the action. */}
        <Animated.View style={[styles.zone, { left: 0, width: split, top: labelTop }, leftStyle]} pointerEvents="none">
          <View style={styles.plate}>
            <Text style={styles.kicker}>TAP HERE</Text>
            <View style={styles.row}>
              <Chevron left size={11} />
              <Text style={styles.back}>back</Text>
            </View>
          </View>
          {!reduce ? <Ripple loop={loop} from={0.04} to={0.36} /> : null}
        </Animated.View>

        {/* FORWARD — the other two-thirds, set large: it is what a reader does. */}
        <Animated.View style={[styles.zone, { left: split, width: W - split, top: labelTop }, rightStyle]} pointerEvents="none">
          <View style={styles.plate}>
            <Text style={styles.kicker}>TAP HERE</Text>
            <View style={styles.row}>
              <Text style={styles.forward}>forward</Text>
              <Chevron left={false} size={17} />
            </View>
          </View>
          {!reduce ? <Ripple loop={loop} from={0.5} to={0.82} /> : null}
        </Animated.View>

        {/* THE Aa BUTTON — the real one, ringed, with what it does. */}
        {ring ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { left: ring.x - ring.d / 2, top: ring.y - ring.d / 2, width: ring.d, height: ring.d, borderRadius: ring.d / 2 }, ringStyle]}
          />
        ) : null}
        {ring ? (
          <Animated.View pointerEvents="none" style={[styles.leader, { left: ring.x - 1, top: ring.y + ring.d / 2 + 3 }, calloutStyle]} />
        ) : null}
        {/* Only when there is a real Aa button to point at: a lesson with no voice
            (and the web, which never speaks) has none, and a callout about a
            button that is not there is a claim about nothing. */}
        {ring ? (
        <Animated.View pointerEvents="none" style={[styles.callout, { top: calloutTop, right: 12 }, calloutStyle]}>
          <View style={styles.calloutHead}>
            <View style={styles.aaChip}>
              <Text style={styles.aaBig}>A</Text><Text style={styles.aaSmall}>a</Text>
            </View>
            <Text style={styles.calloutTitle}>Show every word at once</Text>
          </View>
          <Text style={styles.calloutBody}>The voice keeps reading.</Text>
        </Animated.View>
        ) : null}

        {/* THE WAY OUT — and the way to never see this again. */}
        <Animated.View style={[styles.buttons, { bottom: insets.bottom + 16 }, buttonsStyle]}>
          <Button label="Got it" variant="secondary" size="lg" onPress={() => close(false)} style={styles.gotIt} />
          <Pressable
            onPress={() => close(true)}
            hitSlop={10}
            style={styles.never}
            accessibilityRole="button"
            accessibilityLabel="Don't show this guide again"
          >
            <Text style={styles.neverText}>Don’t show again</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Above every sibling in the lesson route — the lesson is drawn first and this is
  // laid over it, so it needs the stacking order stated rather than implied.
  root: { zIndex: 50, elevation: 50 },
  line: { position: 'absolute', width: 2, borderRadius: 1, backgroundColor: LINE },
  foot: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  zone: { position: 'absolute', alignItems: 'center' },
  // One height for both plates, so the two ripples under them sit on one line.
  plate: {
    alignItems: 'center', justifyContent: 'center', minHeight: 92, backgroundColor: PLATE, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    // 14 a side, not 18: at 320 wide the back zone is 107 points and the plate
    // touched both of its edges; this leaves it about four clear either side.
    paddingVertical: 12, paddingHorizontal: 14,
  },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, color: WHITE, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  back: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: WHITE },
  forward: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: WHITE },
  ripple: { marginTop: 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rippleRing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: WHITE },
  rippleDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: WHITE },
  ring: { position: 'absolute', borderWidth: 2, borderColor: WHITE, backgroundColor: 'rgba(255,255,255,0.14)' },
  leader: { position: 'absolute', width: 2, height: 12, borderRadius: 1, backgroundColor: WHITE },
  callout: {
    position: 'absolute', alignItems: 'flex-end', maxWidth: 270,
    backgroundColor: PLATE, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 10, paddingHorizontal: 14,
  },
  calloutHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aaChip: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: WHITE, borderRadius: 7,
    paddingHorizontal: 5, paddingTop: 1, paddingBottom: 2,
  },
  aaBig: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, lineHeight: 16, color: INK },
  aaSmall: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 11, lineHeight: 13, color: INK },
  calloutTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: WHITE },
  calloutBody: { fontFamily: 'Inter_500Medium', fontSize: 13, color: WHITE, marginTop: 4 },
  buttons: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  gotIt: { alignSelf: 'stretch' },
  never: { marginTop: 14, paddingVertical: 4, paddingHorizontal: 8 },
  neverText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: WHITE, textDecorationLine: 'underline' },
});

/**
 * WHERE THE GUIDE IS MOUNTED: around the lesson, by the lesson ROUTE.
 *
 * Not inside a player, on purpose. Every browser harness in scripts/ renders lesson
 * components directly through a preview route, so a guide mounted here can never
 * appear in front of one — and a guide that did would freeze its beat clock at the
 * first frame and make it measure nothing while reporting a clean sweep (§21).
 *
 * The setting is read ONCE, as the lesson opens, and the guide is armed in the state
 * initialiser — during this component's render, before the lesson's own first render
 * — so the player's very first frame and its first narration effect already see it
 * held. Arming it in an effect would let the opening line start and then be cut.
 */
export function LessonGuideHost({ children }: { children: ReactNode }) {
  const setSetting = useUserDataStore((s) => s.setSetting);
  const [mounted, setMounted] = useState(() => {
    const on = useUserDataStore.getState().settings.lessonGuide;
    setGuideOpen(on);
    return on;
  });
  // Leaving the lesson must never leave the next one held.
  useEffect(() => () => setGuideOpen(false), []);
  const release = useCallback(() => setGuideOpen(false), []);
  const gone = useCallback(() => setMounted(false), []);
  const never = useCallback(() => setSetting('lessonGuide', false), [setSetting]);
  return (
    <View style={{ flex: 1 }}>
      {children}
      {mounted ? <LessonGuide onRelease={release} onGone={gone} onNever={never} /> : null}
    </View>
  );
}
