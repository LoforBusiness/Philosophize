import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useDerivedValue, useFrameCallback, useAnimatedStyle,
  withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { emoteLive, pose, type Bundle } from '@/components/lesson/cinematic/rig';
import { INK, PAPER, PAPER_LIT, PAPER_SHADE, MID, mix } from '@/components/shared/tone';
import { SPACE } from '@/constants/design';
import { POSE, type Quip } from '@/lib/utils/passQuips';

// ─────────────────────────────────────────────────────────────────────────────
// THE HERALD — the stickman standing beside the certificate, being rude about it.
//
// Same figure as the streak mascot and the reward-screen loafer, and that is the
// point of him: a reader who has been needled about their streak recognises the
// person selling them the Pass, so the offer arrives in a voice the app has
// already established rather than in the voice of a pricing page.
//
// ── WHERE HE STANDS, AND WHY IT IS NOT BESIDE THE CARD ──────────────────────
//
// The brief was a man standing next to the certificate. The literal layout — a
// column for him, a column for it — was drawn and does not survive a narrow
// phone: at 320dp the content column is 288, so a 96pt figure leaves 184 for a
// certificate carrying eleven ruled rows of two-part text. It stops being a
// certificate and becomes a receipt.
//
// So he stands ON its top edge instead. The ground line under his feet IS the
// head of the certificate directly below, he faces right into it, and he speaks
// across the space beside him. He is next to it in the way a person is next to a
// thing they are presenting — which is what the brief was actually asking for —
// and the certificate keeps the whole width.
//
// ── HE IS DRAWN AS VIEWS, NOT SVG ───────────────────────────────────────────
//
// §17's rule 7, and it is not negotiable for anything that moves: an animated
// full-screen `<Svg>` costs about 10fps on an S24. `Stickman` draws bones as
// native Views and the frame loop runs on the UI thread through a worklet, so
// this costs no React renders at all once mounted.
// ─────────────────────────────────────────────────────────────────────────────

// Design box. The figure is 103 rig units tall; K scales rig units to points.
const W = 96;
const H = 118;
const GROUND = 112;
const K = 0.98;
// He stands a little in from the left edge so the near arm, at full reach, still
// has paper under it. At x = W/2 the pointing hand crossed the bubble.
const FIG_X = 30;

export default function PassHerald({
  quip, width, delay = 0,
}: {
  quip: Quip;
  /** The whole band's width — he takes W and the bubble takes the rest. */
  width: number;
  delay?: number;
}) {
  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    // Clamped, so a frame the app spent elsewhere does not jump the gesture.
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
  }, true);

  const code = POSE[quip.pose];

  // FACING +1 — into the certificate below and to his right.
  //
  // `emoteLive` rather than `emoteHold`: the live overlay is what gives a held
  // gesture its own secondary motion, so he reads as someone standing there
  // rather than as a drawing that has been placed. The second argument is the
  // life clock and the third is the gesture's own phase; both run off the same
  // value here because he has no beats to be in step with.
  const D = useDerivedValue<Bundle>(
    () => pose(emoteLive(code, clock.value, clock.value), FIG_X, GROUND, K, 1, 1),
    [code],
  );

  const inV = useSharedValue(0);
  const say = useSharedValue(0);
  useEffect(() => {
    inV.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    say.value = withDelay(delay + 380, withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const figStyle = useAnimatedStyle(() => ({
    opacity: inV.value,
    transform: [{ translateY: (1 - inV.value) * 8 }],
  }));
  const sayStyle = useAnimatedStyle(() => ({
    opacity: say.value,
    // Grows out of the side nearest him rather than fading in place, so the line
    // reads as coming FROM him.
    transform: [{ translateX: (1 - say.value) * -10 }, { scale: 0.96 + say.value * 0.04 }],
  }));

  return (
    <View style={[st.band, { width }]} pointerEvents="none">
      <Animated.View style={[st.stage, figStyle]}>
        <Stickman D={D} k={K} />
      </Animated.View>

      <Animated.View style={[st.bubbleWrap, sayStyle]}>
        {/* THE TAIL IS A ROTATED SQUARE, not a triangle border trick. A square
            turned 45° and tucked under the bubble's left edge keeps the bubble's
            own border and its own ground on two of its sides, which is what makes
            the join invisible; the classic transparent-border triangle cannot
            carry a border at all. */}
        <View style={st.tail} />
        <View style={st.bubble}>
          <Text style={st.said}>{quip.line}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  // minHeight, NOT height, and it is load-bearing.
  //
  // The bubble is bottom-aligned, so a line that wraps to one row more than the
  // band allows does not clip — it grows UPWARD, straight through the headline
  // above it, which is D31: nothing may be painted over a word, the app's own
  // decoration included. With `minHeight` the row simply gets taller and pushes
  // the certificate down instead, which is survivable at any line length.
  //
  // `check:quips` still holds the lines to three rows on a 320dp phone, because
  // "survivable" is not the same as "looks composed" — a five-row bubble beside a
  // 118pt figure reads as a wall of text with a man standing next to it.
  band: { minHeight: H, flexDirection: 'row', alignItems: 'flex-end' },
  stage: { width: W, height: H },

  bubbleWrap: {
    flex: 1, minWidth: 0,
    // Sits at his head rather than at his feet: the bubble's bottom edge lands
    // just under the crown, which for a 103-unit figure at K 0.98 is about 40pt
    // off the ground line.
    marginBottom: 34,
    marginLeft: -6,
  },
  tail: {
    position: 'absolute', left: -4, bottom: 13,
    width: 11, height: 11,
    backgroundColor: PAPER_LIT,
    borderLeftWidth: 1, borderBottomWidth: 1,
    borderColor: mix(PAPER_SHADE, INK, 0.35),
    transform: [{ rotate: '45deg' }],
  },
  bubble: {
    backgroundColor: PAPER_LIT,
    borderWidth: 1,
    borderColor: mix(PAPER_SHADE, INK, 0.35),
    borderRadius: 12,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[2],
    // The same one light every struck thing in the app carries. A speech bubble
    // with no shadow sits ON the page; with one it sits above it, which is what
    // makes the figure and the bubble read as one object in front of the
    // certificate rather than two decals printed on it.
    shadowColor: INK,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 2 },
    elevation: 2,
  },
  said: {
    // Caveat, because this is the same character SPEAKING — StreakMascot uses
    // it for exactly that, and the reward screen's Inter is for a THOUGHT. Two
    // faces, two acts, one person.
    //
    // 700Bold, not 600: only 400 and 700 are registered (app/_layout.tsx), and a
    // weight that was never loaded does not fail — it silently falls back to the
    // system face, so his handwriting would quietly become Roboto on one screen.
    fontFamily: 'Caveat_700Bold',
    fontSize: 19,
    lineHeight: 22,
    color: INK,
  },
});

/** What the herald leaves for the certificate to sit against. */
export const HERALD_HEIGHT = H;
/** The figure's own column — what `check:quips` measures the bubble against. */
export const HERALD_FIGURE_W = W;
