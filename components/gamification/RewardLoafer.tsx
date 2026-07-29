import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useDerivedValue, useFrameCallback, useAnimatedStyle,
  withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { BLANK, leanLive, pose, type Bundle } from '@/components/lesson/cinematic/rig';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE WHO WAITS.
//
// The completion screen is the only place in the app the reader just sits and
// reads, so it is the one place a figure can loiter. He props himself against the
// rule at the right-hand edge, looks around, checks his nails, gives a small wave,
// and thinks something at the reader's expense.
//
// Deliberately small — about a third of the panel's height. He is furniture with a
// pulse, not the subject: the XP and the streak are the subject, and a figure big
// enough to compete with them would be a worse screen, not a better one.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';

// Design box. The figure is 103 rig units tall and stands on GROUND; the wall is a
// rule down the right-hand edge that he leans against.
const W = 126;
const H = 134;
const GROUND = 122;
const K = 0.92;                 // rig units → design units (103 tall, crown at 27)
const WALL_X = 118;
// Where he stands so his HEAD meets the rule rather than overlapping it. Leaning
// back at tilt 0.17 the head centre sits ~7.5 units behind the pelvis and its radius
// is 20, so the back of the head is 27.5 out — stand him 26 clear and it just kisses
// the wall. At 11 (the first guess) the rule ran straight through his skull.
const FIG_X = WALL_X - 24;   // head just kisses the rule

/**
 * Things he thinks AT THE READER. Gentle, on-brand, and always at their expense —
 * a compliment here would be worse than nothing, because the screen is already
 * telling them they did well.
 */
// Every line is hand-broken to fit the cloud, which holds about NINETEEN characters
// at this size — measured off a render, not guessed, after "Descartes doubted all."
// wrapped and stranded "all." on a line of its own. That is the orphaned-break
// defect the rule book calls out (D30), and a short line is the only cure.
export const LOAFER_LINES = [
  'Still here? Bold.',
  'Socrates wrote\nnothing.\nYou did more.',
  "That's XP.\nIt isn't real.\nNeither is money.",
  'Impressive,\nfor a mortal.',
  'Descartes doubted\neverything.\nYou doubted B.',
  'A professor\njust felt a chill.',
  'Better than the\nman in the cave.',
  'Two more and I\nmight believe you.',
  'Plato had an\nacademy. You have\na phone.',
  'Unexamined life?\nYours looks fine.',
  'An act of will.\nOr indigestion.',
  'You could stop.\nBut then what\nare you?',
  'I was told there\nwas a syllabus.',
  'Kant did this\nevery single day.',
];

/** Stable per completion, so the line never changes while it is being read. */
export function pickLine(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return LOAFER_LINES[h % LOAFER_LINES.length];
}

export default function RewardLoafer({ line, delay = 0 }: { line: string; delay?: number }) {
  const clock = useSharedValue(0);
  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
  }, true);

  // Faces LEFT (toward the reader's score), wall on his right.
  const D = useDerivedValue<Bundle>(() =>
    pose(leanLive(clock.value), FIG_X, GROUND, K, -1, 1),
  );

  const inV = useSharedValue(0);
  const thought = useSharedValue(0);
  useEffect(() => {
    inV.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    thought.value = withDelay(delay + 520, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, []);

  const figStyle = useAnimatedStyle(() => ({
    opacity: inV.value,
    transform: [{ translateY: (1 - inV.value) * 10 }],
  }));
  // The thought arrives as thoughts do: the small dot first, then the big one, then
  // the cloud — which is why each puff has its own delay off the same value.
  const puff = (a: number, b: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const u = Math.max(0, Math.min(1, (thought.value - a) / (b - a)));
      return { opacity: u, transform: [{ scale: 0.5 + 0.5 * u }] };
    });
  const dot1 = puff(0, 0.3);
  const dot2 = puff(0.2, 0.55);
  const cloud = puff(0.45, 1);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* BESIDE him, at head height — not above him. Stacked above, the cloud grew
          upward into the streak week on any phone shorter than a Pro Max and sat on
          top of Thursday through Sunday. Alongside, it can only ever take horizontal
          space, which there is plenty of. */}
      <View style={styles.thoughtRow}>
        <Animated.View style={[styles.cloud, cloud]}>
          <Text style={styles.cloudText}>{line}</Text>
        </Animated.View>
        <Animated.View style={[styles.dot, styles.dotBig, dot2]} />
        <Animated.View style={[styles.dot, styles.dotSmall, dot1]} />
      </View>

      <Animated.View style={[styles.stage, figStyle]}>
        {/* the wall he is leaning on, and the floor he is standing on */}
        <View style={styles.wall} />
        <View style={styles.floor} />
        <Stickman D={D} k={K} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'flex-start' },
  // Pulled down to his head: the crown sits GROUND − 103·K from the top of the
  // stage, so its centre is about 46 down, and the cloud is centred on that.
  thoughtRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingTop: 16, gap: 4,
  },
  stage: { width: W, height: H },
  wall: {
    position: 'absolute', left: WALL_X, top: 8, width: 2, height: GROUND - 6,
    backgroundColor: '#E4E1D8',
  },
  floor: {
    position: 'absolute', left: 22, right: 8, top: GROUND, height: 1.5,
    backgroundColor: '#E4E1D8',
  },

  // A THOUGHT, not speech: a soft-cornered cloud and two puffs trailing to his head,
  // rather than the hard box + pointer the lesson stage uses for things said aloud.
  cloud: {
    flexShrink: 1,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 15,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 9,
  },
  cloudText: {
    fontFamily: 'Inter_500Medium', fontSize: 12.5, lineHeight: 17,
    color: SOFT, textAlign: 'right',
  },
  // Two puffs bridging the gap from the cloud to his head, small one nearest him.
  dot: { borderWidth: 1.5, borderColor: SOFT, backgroundColor: PAPER },
  dotBig: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  dotSmall: { width: 5, height: 5, borderRadius: 3, marginTop: 12 },
});

export { INK };
