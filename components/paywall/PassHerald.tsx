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
    // ── THE TAIL HAS TO REACH HIS HEAD, AND THAT IS WHAT SETS THIS NUMBER ──
    //
    // A reader: the pointer should be "higher up so it looks like it's actually
    // the stick man saying" it. It was at 34, which put the tail's centre 52.5
    // above the band's bottom — and the head, measured off the rig rather than
    // guessed, sits at 87.1..92.3 with its chin at 67.5..72.7. So the bubble was
    // level with his chest and the tail pointed at his waist.
    //
    // MOVING THE TAIL ALONE CANNOT FIX IT, which is the part worth writing down.
    // The bubble's corners are 12 and a one-row bubble is only 40 tall, so the
    // straight edge a tail can sit against is the middle 16 — the tail is pinned
    // to within ±8 of the bubble's own centre whatever else happens. To put the
    // tail at his chin the BUBBLE has to be at his chin.
    //
    // ── AND THE CHIN WAS THE WRONG TARGET. SECOND ROUND. ──────────────────
    //
    // 50 put the tail at 68.5, which cleared the chin at 67.5 by a single point
    // -- the lowest it could sit and still pass. The reader came back: the tail
    // is "on the lower part of the left side ... I need it higher up so it is
    // closer in parallel to the [stickman's] face."
    //
    // They are right, and the first fix aimed one head too low. The FACE is the
    // head's centre, 87.1..92.3 above the band's bottom; the chin is where the
    // head STOPS. A tail at the chin reads as a bubble resting on his shoulder,
    // and on a two-row quip -- where the bubble is 70 tall -- it sat 26% up from
    // the bottom, which is exactly the "lower part of the left side" described.
    //
    // BOTH NUMBERS MOVE, and that is the point the first round got right and
    // then under-applied. Raising the tail alone runs it into the bubble's
    // rounded corner; raising the bubble alone drags the tail up with it and
    // leaves it low ON the bubble. 62 + 20 puts the tail at 87.5 -- dead in the
    // face's range -- while keeping it 8 points clear of both corners on the
    // SHORTEST bubble, which is the case that binds.
    //
    // `check:quips` re-derives all of it from the rig, and now requires the
    // middle third of the head rather than anywhere between chin and crown --
    // so this cannot quietly slide back down to his jaw a third time.
    marginBottom: 62,
    marginLeft: -6,
  },
  tail: {
    // BOTTOM-ANCHORED, never top-anchored. The bubble grows UPWARD as a line
    // wraps, so a tail measured from the top would climb with it and end up
    // above his head on a three-row day; measured from the bottom it stays put
    // relative to the ground, exactly as the figure does.
    // 20, not 13: with the bubble at 62 this lands the tail's centre at 87.5,
    // level with the face. See the note on `marginBottom` above -- the pair is
    // solved together, and check:quips holds both halves.
    position: 'absolute', left: -4, bottom: 20,
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
