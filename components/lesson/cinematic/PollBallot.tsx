import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { touch } from '@/lib/feedback';
import { METAL, PAPER_LIT, PAPER_SHADE, SHADOW, mix } from '@/components/shared/tone';
import { orderFor } from './ChoiceCards';
import { INK, PAPER, RULE, SOFT } from './cinematicKit';
import type { PollBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A POSITION, AND THE COMPANY IT PUTS YOU IN.
//
// This replaces the two-axis pad, which a reader named as the hardest thing in
// the app: "the box with the four squares, and you drag the circle to one of the
// four boxes — that one's always really difficult, it takes a long time to
// understand what is actually being said."
//
// They were right, and the diagnosis is not that the pad was badly drawn. Its
// four corners ARE named positions — presentism, the growing block, the
// shrinking tree, eternalism — but the reader had to reconstruct them from two
// axis labels before they could even read the question. A puzzle was sitting in
// front of the question, and solving it earned nothing.
//
// So the positions are simply listed. One dimension, named, in the order the
// lesson argued them. The question above says what is being asked in words a
// reader could answer out loud.
//
// ── WHAT MAKES IT MORE THAN A MULTIPLE CHOICE ───────────────────────────────
//
// The reveal. Answering does not just mark you right or wrong: each position
// grows the names of the people who actually held it. You do not merely pick the
// correct box, you find out you agreed with Hume and disagreed with Kant — which
// is the reader's own idea for this control, and it is the difference between a
// quiz and a place to stand.
//
// ── AND THERE ARE NO PERCENTAGES, BY CONSTRUCTION ───────────────────────────
//
// The obvious version of a poll shows what share of people said each thing, and
// there is no honest source for that inside this app. `PollOption` therefore has
// no field to type one into: the bar is drawn from how many NAMED holders a
// position lists, so it is always a count of real people. A position with no
// holders draws no bar at all rather than an empty one, because an empty bar
// still reads as "nobody, measured" when the truth is "not recorded here".
//
// ── AND EVERY ROW IS A STRUCK PLATE ─────────────────────────────────────────
//
// The first version was four bordered rectangles, and the reader said what this
// app has now heard about every flat surface it has shipped: "pretty boring and
// not very cool. Not very gamified."
//
// The identity has an answer already, used on the rank pins, the badges, the
// certificates and the profile's tiles: things are STRUCK, lit from the top
// left, with a shaded corner and a shadow. An unpicked position is a raised
// plate you could press. The one you choose is PRESSED IN -- the same gradient
// run backwards, dark where the light cannot reach into the cut, which is the
// only thing that says pushed rather than raised.
//
// The reveal is then worth watching rather than merely correct: the holder bars
// grow from nothing, staggered down the ballot, and the row that was right takes
// a gold rail down its cut edge. Gold because that is what XP and first place
// are already struck in here; nothing new is invented.
//
// ── THE SCENE MOVES WITH IT ─────────────────────────────────────────────────
//
// `pos` is the player's shared value, eased between rows rather than snapped, so
// a scene reading `dragPos` re-aims smoothly as the reader moves down the ballot
// (R7c). Snapping it would be a track jumping a whole step in one frame, which
// is the teleport group L exists to forbid.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  poll: PollBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 0..1 down the ballot AS DRAWN — the control's own position. */
  pos: SharedValue<number>;
  /**
   * 0..1 across the options AS AUTHORED — what a scene reads (SceneApi.pickPos).
   *
   * These are two different numbers because the rows are shuffled, and only this
   * one means anything outside the control: row 2 of the ballot is a different
   * claim in every lesson, while option 2 of the block is the claim the author
   * put second. A scene animating off `pos` would be animating off the shuffle.
   */
  sem?: SharedValue<number>;
  /** The question's own words, so the row order is stable but not authored. */
  seed: string;
}

const ROW_H = 34;
// A WIDE ROW BARELY SHADES, AND §19 HAD ALREADY MEASURED THAT.
//
// The first pass ran StruckTile's full PAPER_LIT -> PAPER -> PAPER_SHADE across
// a 350dp row on a 0.15->0.85 diagonal, and the render came back with a tan
// stain down the right-hand half. §19 records the identical failure on the
// profile's panels, in the same words: "a tile's shading does not survive being
// scaled up ... a big flat surface lit from one side barely shades at all -- its
// depth is in its EDGES."
//
// So: a third of the fall-off, running mostly DOWN rather than across (a wide
// surface is lit from above, not from the left), and the rest of the depth comes
// from a lit top rim, a hairline and the shadow the row sits on.
const FACE_FOOT = mix(PAPER, PAPER_SHADE, 0.30);
const FACE_FROM = { x: 0.2, y: 0 } as const;
const FACE_TO = { x: 0.55, y: 1 } as const;
const REVEAL = 420;

export default function PollBallot({ poll, picked, onPick, pos, sem, seed }: Props) {
  const answered = picked !== null;
  const n = poll.options.length;
  // THE ORDER IS DECIDED HERE AND NOWHERE ELSE, exactly as ChoiceCards decides
  // its two. Measured before this existed, the pad these questions came from put
  // its answer in the first quadrant 68% of the time — which in a ballot is the
  // top row, and a reader who noticed could tap their way through the app.
  const options = orderFor(seed, n).map((k) => poll.options[k]);
  const done = useSharedValue(0);
  // NOTHING IS SELECTED UNTIL THE READER SELECTS IT. An authored opening row is
  // one more value that can land on the answer -- the exact fault this control
  // was built to remove -- and pre-committing the reader to a position they did
  // not choose is the wrong way to ask them where they stand.
  const sel = useSharedValue(-1);

  // WHERE EACH DRAWN ROW SITS IN THE AUTHOR'S OWN ORDER. Plain numbers, so the
  // worklet that writes `sem` can close over it.
  const semOf = orderFor(seed, n).map((k) => (n > 1 ? k / (n - 1) : 0));

  useEffect(() => {
    sel.value = -1;
    pos.value = 0.5;
    // Mid-scale, matching `pos`: nothing is chosen yet, so the scene must not be
    // shown either end of the question before the reader has said anything.
    if (sem) sem.value = 0.5;
  }, [poll, pos, sem, sel]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(120, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  const choose = useCallback((k: number) => {
    const o = options[k];
    sel.value = k;
    // EASED, NOT SNAPPED. See the header: a scene track driven off `dragPos`
    // would otherwise cover a whole step between two frames.
    pos.value = withTiming(n > 1 ? k / (n - 1) : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
    // The same move in the question's own space, for the scene (SceneApi.pickPos).
    if (sem) sem.value = withTiming(semOf[k], { duration: 220, easing: Easing.out(Easing.cubic) });
    touch();
    onPick(o.id, Boolean(o.correct));
  }, [options, n, onPick, pos, sem, semOf, sel]);

  // The widest holder list decides the bar scale, so two positions with one name
  // each do not both draw a full bar and imply a tie that was never measured.
  const widest = Math.max(1, ...options.map((o) => (o.holders ? o.holders.length : 0)));

  return (
    <View style={styles.wrap} nativeID="poll-ballot">
      {options.map((o, k) => (
        <Row
          key={o.id}
          option={o}
          index={k}
          selected={sel}
          done={done}
          widest={widest}
          answered={answered}
          onPress={() => { if (!answered) choose(k); }}
        />
      ))}
    </View>
  );
}

function Row({ option, index, selected, done, widest, answered, onPress }: {
  option: PollBlock['options'][number];
  index: number;
  selected: SharedValue<number>;
  done: SharedValue<number>;
  widest: number;
  answered: boolean;
  onPress: () => void;
}) {
  const chosen = useAnimatedStyle(() => {
    const on = selected.value === index ? 1 : 0;
    return {
      borderColor: on ? INK : RULE,
      borderWidth: on ? 1.6 : 1,
      // A pressed plate sinks and stops casting. Both, or it reads as a colour
      // change rather than a movement.
      transform: [{ translateY: on * 1.5 }],
      shadowOpacity: (1 - on) * SHADOW.opacity,
    };
  });
  // THE FACE FLIPS when the row is taken: raised runs light -> dark down-right,
  // pressed runs dark -> light, and that inversion is the only thing that says
  // pushed IN rather than merely marked.
  const pressedFace = useAnimatedStyle(() => ({ opacity: selected.value === index ? 1 : 0 }));

  // The holder bar and names arrive after the answer, one row after another --
  // a stagger down the ballot, so the reveal reads as a result coming in rather
  // than four things appearing at once.
  const revealStyle = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (done.value - index * 0.12) / 0.6));
    return { opacity: t };
  });
  const barStyle = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (done.value - index * 0.12) / 0.6));
    return { width: `${t * 100 * ((option.holders?.length ?? 0) / widest)}%` };
  });
  const railStyle = useAnimatedStyle(() => ({ opacity: option.correct ? done.value : 0 }));
  const held = option.holders && option.holders.length > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={answered}
      accessibilityRole="button"
      style={styles.press}
    >
      <Animated.View style={[styles.row, chosen]}>
        <LinearGradient
          colors={[PAPER_LIT, PAPER, FACE_FOOT]}
          locations={[0, 0.5, 1]}
          start={FACE_FROM}
          end={FACE_TO}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* The lit top edge, which is where a wide surface's depth actually is. */}
        <View style={styles.lip} pointerEvents="none" />
        <Animated.View style={[StyleSheet.absoluteFill, pressedFace]} pointerEvents="none">
          <LinearGradient
            colors={[FACE_FOOT, PAPER, PAPER_LIT]}
            locations={[0, 0.5, 1]}
            start={FACE_FROM}
            end={FACE_TO}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* The gold rail down the cut edge — the same metal a first-place disc
            and the XP line are struck in, so it is a material the app already
            owns rather than a new colour (§19). */}
        <Animated.View style={[styles.rail, railStyle]} pointerEvents="none" />
        <Text style={styles.reads} numberOfLines={2}>{option.reads}</Text>
        {/* The tick is drawn only once the answer is in, so the ballot itself
            never gives away which row is right (group O). */}
        {answered && option.correct ? <Text style={styles.tick}>✓</Text> : null}
      </Animated.View>
      {held ? (
        <Animated.View style={[styles.holders, revealStyle]}>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, barStyle]} />
          </View>
          <Text style={styles.names} numberOfLines={1}>{option.holders!.join(' · ')}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', paddingHorizontal: 2 },
  press: { marginBottom: 4 },
  row: {
    minHeight: ROW_H,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy },
    shadowRadius: 2.5,
    elevation: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  // flexShrink so a long position wraps inside the row rather than pushing the
  // tick off the end (S8).
  reads: { flexShrink: 1, color: INK, fontSize: 12.5, lineHeight: 15.5 },
  tick: { color: INK, fontSize: 13, fontWeight: '700' },
  lip: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 1,
    backgroundColor: PAPER_LIT,
  },
  rail: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    backgroundColor: METAL.GOLD.base,
  },
  holders: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 9, paddingTop: 2 },
  barTrack: { width: 46, height: 3, backgroundColor: RULE, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 3, backgroundColor: INK, borderRadius: 2 },
  names: { flexShrink: 1, color: SOFT, fontSize: 10.5, letterSpacing: 0.2 },
});
