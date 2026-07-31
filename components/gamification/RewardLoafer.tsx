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

// WHERE HIS HEAD ACTUALLY IS, derived from the rig rather than guessed (B10).
// Pelvis 34 rig units above the ground, head centre 49 above that; leaning back at
// tilt 0.17 carries it ~7.3 behind the pelvis, and `dir: -1` mirrors that to +x on
// screen. The thought is pinned to THESE, so it tracks if he ever moves.
const HEAD_X = FIG_X + 7.3 * K;              // ≈ 101
const HEAD_Y = GROUND - (34 + 49) * K;       // ≈ 46
const HEAD_R = 20 * K;                       // ≈ 18.4

// Anchors, all measured out from HIS HEAD rather than from the container's edges —
// which is the entire fix. In a flex row the cloud sat at the far end of a `flex: 1`
// column, about 100px from the head it was supposed to belong to, so it read as a
// caption floating in the middle of the screen rather than as something he was
// thinking. `right` is from the block's right edge, and the stage is flush right.
//
// AND THE BLOCK DOES NOT GROW TO HOLD IT. The obvious move is to add height above the
// stage and put the thought up there, but this screen already had exactly zero pixels
// of slack at 360×690, so 60 more rows would push the Continue button off a short
// phone. It does not need them: he stands at x 94 of a 126-wide stage, so the LEFT
// HALF of his own box is empty paper. The cloud lives there — 33px clear of his head
// at the nearest point, inside the block that was always there.
// A three-line cloud is 72px tall and his head centre is only 46 down the block, so
// the cloud cannot sit ABOVE him — it straddles his head height and the puffs step up
// to it. Seated 32 below the head centre it clears the block's top edge by 6px; at 26
// the tallest lines landed at exactly 0, which Android's font padding turns into a
// clip (D29).
const DOT_S = { right: W - (HEAD_X - 26) - 2.5, top: HEAD_Y - 10 - 2.5 };
const DOT_B = { right: W - (HEAD_X - 40) - 4, top: HEAD_Y - 18 - 4 };
const CLOUD_R = W - (HEAD_X - 51);
const CLOUD_B = H - (HEAD_Y + 32);

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
  'You did that.\nOn purpose, even.',
  'Aristotle taught\nwhile walking.\nYou sat down.',
  'Nietzsche stared\ninto the abyss.\nYou stared at this.',
  'Somewhere a tutor\njust lost a job.',
  'That was nearly\ncritical thinking.',
  'Diogenes lived in\na jar. Standards\nhave slipped.',
  'Not bad for\nsomeone on a sofa.',
  'The unexamined\nlesson is not\nworth tapping.',
  "I'd applaud, but\nlook at my arms.",
  'Marcus Aurelius\nran an empire.\nYou ran a streak.',
  'You have opinions\nnow. Terrifying.',
  'Zeno proved you\ncan never finish.\nAwkward.',
  'Sartre said hell\nis other people.\nLucky you.',
  'A syllogism died\nto bring you this.',
  'Hume would doubt\nyou learned that.',
  'Your brain grew.\nSlightly. Legally.',
  'Kierkegaard leapt.\nYou tapped.',
  'One lesson from\nbeing insufferable.',
  'You could be\nscrolling instead.\nThis is better.',
  'Ockham says stop.\nOckham is wrong.',
  'You again.\nI had plans.',
  'A little knowledge.\nVery little.',
  'Aquinas wrote two\nmillion words.\nYou tapped.',
  'You are now\ndangerous at\ndinner parties.',
  'Well. Somebody\nhad to.',
  'Your ancestors\nhunted. You tap.',
  'That counts.\nBarely. It counts.',
  'I have seen worse.\nNot today.',
  'Epictetus was a\nslave. You are\ntired.',
  'Knowledge: gained.\nWisdom: pending.',
  'You have peaked.\nEnjoy the view.',
  'Nobody is\nimpressed. I am\npaid to be.',
  'Spinoza was\nexcommunicated.\nYou got XP.',
  'Do it again.\nI dare you.',
  'The Stoics would\nsay nothing.\nSo will I.',
  'You learned a\nthing. Terrible\nprecedent.',
  'Hegel was harder.\nMuch harder.',
  'One day this\nwill be useful.\nProbably not.',
  "Look at you.\nActually, don't.",
  'Aristotle had\nAlexander.\nI have you.',
  'That was the\neasy one.',
  'You may now\nargue with a bus.',
  'Congratulations,\nI suppose.',
  'Hume slept\nthrough worse.',
  'Your streak is\nheld together\nby spite.',
  'A mind expanded.\nBy a little.',
  'Pascal wagered.\nYou wager\nnothing.',
  'I would explain,\nbut you just did.',
  'Somewhere Plato\nis rolling.\nSlowly.',
  'You did the\nreading. Once.',
  'Boethius wrote\nin prison.\nYou had snacks.',
  'Nietzsche said\nbecome who you\nare. Careful.',
  'This is not a\npersonality.\nYet.',
  'Half an idea\nis still an idea.',
  'You are ahead\nof most people.\nMost people.',
  'Diderot needed a\nwhole encyclopedia.',
  'That is one for\nthe CV.',
  'I counted. It\nwas correct.',
  'Wittgenstein\nburned his notes.\nYou saved a quote.',
  'Keep going and\nsomeone will\nnotice.',
  'You have opinions.\nNow get evidence.',
  'Locke would have\nliked you. Locke\nwas polite.',
  'Marcus wrote\nto himself.\nYou tap at me.',
  'Every day. That\nis the trick.\nEvery day.',
  'Doubt everything.\nStart with this\nnumber.',
  'You are learning\nfaster than\nyou are aging.',
  'A philosopher\nwould ask why.\nSo. Why?',
  'Bentham is\nstuffed in a\ncabinet. Aim low.',
  'That was fine.\nFine is a word.',
  'Now go outside.\nIt is a premise.',
  'Camus said push\nthe rock.\nYou tapped it.',
  'You know more\nthan yesterday.\nLow bar.',
  'Very impressive.\nI am easily\nimpressed.',
  'Simone de\nBeauvoir. Look\nher up. Go on.',
  'You have a brain.\nIt has been used.',
  'Hypatia taught\nmaths in Greek.\nYou tapped B.',
  'Do not let this\ngo to your head.\nToo late.',
  'One lesson does\nnot make a sage.\nTwo might.',
  'Zhuangzi dreamt\nhe was a butterfly.\nYou dreamt of bed.',
  'The examined life\ncontinues.\nUnfortunately.',
  'Good. Now the\nother 173.',
  'Nobody made you\ndo that. Odd.',
  'You are becoming\nthe sort of person\nwho reads.',
  'A whole lesson.\nWithout crying.',
  'Kant never left\nhis town. You\nnever left bed.',
  'Two things fill\nme with awe.\nNeither is this.',
  'You could quit.\nHistory is full\nof quitters.',
  'Sartre wrote\nsix hundred pages.\nOn nothing.',
  'That is a fact\nyou now own.\nNo refunds.',
  'Heraclitus says\nyou cannot do\nthat twice.',
  'Behold: a person\nwho finishes\nthings. Allegedly.',
];

/**
 * Stable per completion, so the line never changes while it is being read.
 *
 * FNV-1a with a Murmur3 finaliser, and the finaliser is the point. The seed is
 * `${lessonId}:${streak}`, so EVERY seed on a given day ends in the same few
 * characters — and a plain `h = h·31 + c` leaves the low bits dominated by exactly
 * those. Taken mod 105 that clustered badly: finishing two different lessons back to
 * back produced the same thought **8% of the time** against the 1% you would expect
 * from 105 lines, which is the one failure a reader would actually notice. Mixing the
 * high bits down brings it to 1.5%.
 */
export function pickLine(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return LOAFER_LINES[(h >>> 0) % LOAFER_LINES.length];
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
      {/* Up and to his LEFT — the side he faces, and the only empty corner of this
          screen. Stacked directly above him the cloud grew up into the streak week on
          any phone shorter than a Pro Max and sat on Thursday through Sunday; parked
          in a flex row it ended up halfway across the screen, belonging to nobody.
          Anchored off HEAD_X/HEAD_Y it starts at his head and reads as his. */}
      <Animated.View style={[styles.cloud, cloud]}>
        <Text style={styles.cloudText}>{line}</Text>
      </Animated.View>
      <Animated.View style={[styles.dot, styles.dotBig, dot2]} />
      <Animated.View style={[styles.dot, styles.dotSmall, dot1]} />

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
  wrap: { alignSelf: 'stretch', height: H },
  stage: { position: 'absolute', right: 0, top: 0, width: W, height: H },
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
  // maxWidth 152 is not a taste call — it is the width the lines were BROKEN to.
  // Every line in LOAFER_LINES is hand-cut to nineteen characters at this size (D32b),
  // so widening the box would strand short lines and narrowing it would re-wrap them.
  cloud: {
    position: 'absolute', right: CLOUD_R, bottom: CLOUD_B, maxWidth: 152,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 15,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 9,
  },
  cloudText: {
    fontFamily: 'Inter_500Medium', fontSize: 12.5, lineHeight: 17,
    color: SOFT, textAlign: 'right', includeFontPadding: false,
  },
  // Two puffs stepping down from the cloud to his head, the small one nearest him.
  dot: { position: 'absolute', borderWidth: 1.5, borderColor: SOFT, backgroundColor: PAPER },
  dotBig: { width: 8, height: 8, borderRadius: 4, right: DOT_B.right, top: DOT_B.top },
  dotSmall: { width: 5, height: 5, borderRadius: 3, right: DOT_S.right, top: DOT_S.top },
});

export { INK };
