import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay,
  withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { touch } from '@/lib/feedback';
import { INK, PAPER, PAPER_LIT, FLOOR, mix } from '@/components/shared/tone';
import ControlRead from './ControlRead';
import { orderFor } from './ChoiceCards';
import { LipPlate, PLATE_LIP, VerdictSeal, useQuestionAccent, type PlateState } from './QuestionParts';
import { VERDICT } from './questionTone';
import type { SortBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A PLACE TO PUT SOMETHING.
//
// This replaced the lever, whose fifty questions were all picks among named claims
// wearing a slider. What they asked was a CLASSIFICATION: given this thing, which of
// these does it belong to? So there is one named chip and two or three labelled
// bins, and a question the reader could answer out loud.
//
// ── WHY A DRAG AND NOT A TAP ────────────────────────────────────────────────
//
// Carrying the chip is the point: the reader picks up the thing being classified,
// holds it over a bin, sees the readout change to what that bin would commit them
// to, and lets go. The chip follows the finger absolutely, so the far bin is never
// out of reach (S5).
//
// ── A RAISED CHIP AND CUT-IN SOCKETS, IN THE LESSON'S COLOUR ────────────────
//
// The chip is a raised plate on the branch colour's lip (./QuestionParts), and the
// bins are RECESSES: the plate's gradient run backwards, dark along the top where
// light cannot reach into the cut. The socket under the chip lights in the branch
// colour before the drop, so the reader can see where it will land. The verdict
// strikes the right bin green and a wrong drop rust, and stamps the bin you chose.
//
// ── THE SCENE MOVES WITH IT ─────────────────────────────────────────────────
//
// `pos` follows the chip continuously; `sem` is the bin in the AUTHOR'S order and
// steps, eased, as the chip crosses a boundary. A scene reads `sem` (X3).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  sort: SortBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 0..1 across the pad AS DRAWN — this is the chip's own x, and nothing else. */
  pos: SharedValue<number>;
  /** 0..1 across the bins AS AUTHORED — what a scene reads (SceneApi.pickPos). */
  sem?: SharedValue<number>;
  /** The question's own words, so the bin order is stable but not authored. */
  seed: string;
}

// A THIRD OF THE FALL-OFF: a wide surface lit from one side barely shades (§19).
// Neutral: this was a third of the way to the tan PAPER_SHADE, which read as gold.
const FACE_FOOT = FLOOR;
const CHIP_W = 150;
const CHIP_H = 34;
const BIN_H = 46;
const REVEAL = 420;

export default function SortBins({ sort, picked, onPick, pos, sem, seed }: Props) {
  const answered = picked !== null;
  const n = sort.bins.length;
  // THE ORDER IS DECIDED HERE, for the reason ChoiceCards.orderFor sets out.
  const bins = orderFor(seed, n).map((k) => sort.bins[k]);
  const landedBin = sort.bins.find((b) => b.id === picked);
  const chipState: PlateState = !answered ? 'idle' : landedBin?.correct ? 'right' : 'wrong';
  const padW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastBin = useSharedValue(-1);
  const landed = useSharedValue(-1);
  // Which bin the chip is over RIGHT NOW, so a socket can light before the drop.
  const overBin = useSharedValue(-1);

  // DECLARED BEFORE any worklet that calls it (§17 rule 2).
  const binAt = useCallback((p: number) => {
    'worklet';
    const k = Math.floor(p * n);
    return k < 0 ? 0 : k > n - 1 ? n - 1 : k;
  }, [n]);

  // WHERE EACH DRAWN BIN SITS IN THE AUTHOR'S OWN ORDER, as plain numbers.
  const semOf = orderFor(seed, n).map((k) => (n > 1 ? k / (n - 1) : 0));

  useEffect(() => {
    // The chip opens in the middle, over no bin in particular.
    pos.value = 0.5;
    if (sem) sem.value = 0.5;
    lastBin.value = -1;
    landed.value = -1;
    overBin.value = -1;
  }, [sort, pos, sem, lastBin, landed, overBin]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(120, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  const commit = useCallback((k: number) => {
    const b = bins[k];
    onPick(b.id, Boolean(b.correct));
  }, [bins, onPick]);

  const setAt = useCallback((x: number) => {
    'worklet';
    const p = x / padW.value;
    pos.value = p < 0 ? 0 : p > 1 ? 1 : p;
    const k = binAt(pos.value);
    overBin.value = k;
    if (k !== lastBin.value) {
      lastBin.value = k;
      // THE SCENE MOVES ON THE CROSSING, eased, never a whole step in one frame.
      if (sem) sem.value = withTiming(semOf[k], { duration: 200, easing: Easing.out(Easing.cubic) });
      runOnJS(touch)();
    }
  }, [padW, pos, sem, semOf, binAt, lastBin, overBin]);

  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onBegin((e) => { held.value = withTiming(1, { duration: 120 }); setAt(e.x); })
    .onUpdate((e) => { setAt(e.x); })
    .onEnd(() => {
      held.value = withTiming(0, { duration: 160 });
      const k = binAt(pos.value);
      landed.value = k;
      pos.value = withSpring((k + 0.5) / n, { damping: 18, stiffness: 190 });
      runOnJS(commit)(k);
    });

  // PICKED UP, not merely moved: it rises and grows a little.
  const chipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.value * padW.value - CHIP_W / 2 },
      { translateY: -5 * held.value },
      { scale: 1 + 0.06 * held.value },
    ],
  }));

  const reading = bins.map((b) => b.reads);
  // WHICH READING IS SHOWING — derived on the UI thread, never React state (S7).
  const idx = useDerivedValue(() => binAt(pos.value));
  const accent = useQuestionAccent();

  return (
    <View style={styles.wrap}>
      <ControlRead texts={reading} idx={idx} color={accent.text} />

      <GestureDetector gesture={pan}>
        <View
          style={styles.pad}
          onLayout={(e) => { padW.value = e.nativeEvent.layout.width; }}
          // INSIDE THE GestureDetector: a pointer event on a parent never reaches a
          // child's handler, so the harness must find this element itself (§21).
          nativeID="sort-bins"
        >
          <View style={styles.bins}>
            {bins.map((b, k) => (
              <Bin key={b.id} bin={b} index={k} over={overBin} answered={answered} mine={picked === b.id} />
            ))}
          </View>

          <Animated.View style={[styles.chipWrap, chipStyle]} pointerEvents="none">
            <LipPlate state={chipState} radius={9} faceStyle={styles.chipFace}>
              <Text style={styles.chipText} numberOfLines={2}>{sort.chip}</Text>
            </LipPlate>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function Bin({ bin, index, over, answered, mine }: {
  bin: SortBlock['bins'][number];
  index: number;
  /** Which bin the chip is currently over, or -1. */
  over: SharedValue<number>;
  answered: boolean;
  mine: boolean;
}) {
  const accent = useQuestionAccent();
  const edge = accent.edge;
  const base = accent.base;
  // A SOCKET LIGHTS UP BEFORE THE CHIP LANDS IN IT. Emphasis is added to the live
  // one, never taken from the others (the first version dimmed them and made the
  // labels harder to read).
  const lit = useAnimatedStyle(() => {
    const hot = over.value === index ? 1 : 0;
    return { borderColor: hot ? base : edge, transform: [{ scale: 1 + 0.03 * hot }] };
  });
  const wash = useAnimatedStyle(() => ({ opacity: over.value === index ? 1 : 0 }));

  const verdict = !answered ? null : bin.correct ? VERDICT.right : mine ? VERDICT.wrong : null;
  return (
    <Animated.View
      style={[
        styles.bin,
        answered ? { borderColor: verdict ? verdict.ink : mix(PAPER, INK, 0.16), borderStyle: 'solid' } : lit,
      ]}
    >
      {/* THE FLOOR OF THE SOCKET: the tile's gradient run backwards, which is the
          only thing that says CUT IN rather than raised. */}
      <LinearGradient
        colors={verdict ? [verdict.face, verdict.face, PAPER_LIT] : [FACE_FOOT, PAPER, PAPER_LIT]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {!answered ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: accent.wash }, wash]} />
      ) : null}
      <Text style={[styles.binLabel, { color: verdict ? verdict.ink : accent.text }]} numberOfLines={2}>{bin.label}</Text>
      {answered && mine ? <VerdictSeal correct={Boolean(bin.correct)} size={20} style={styles.binSeal} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', paddingHorizontal: 20 },
  // TALL ENOUGH TO HOLD BOTH: the chip at the top, the bins at the bottom, and a
  // gap, so the chip never sits on a bin's label (the render caught that once).
  pad: { height: BIN_H + CHIP_H + PLATE_LIP + 10, justifyContent: 'flex-end' },
  bins: { flexDirection: 'row', gap: 7, height: BIN_H },
  bin: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    // DASHED at rest, because a bin is a place to put something rather than an object.
    borderStyle: 'dashed',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  binLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.8, textAlign: 'center',
    textTransform: 'uppercase',
  },
  binSeal: { top: -8, right: -6 },
  chipWrap: { position: 'absolute', top: 0, left: 0, width: CHIP_W },
  chipFace: { minHeight: CHIP_H, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontFamily: 'Inter_700Bold', color: INK, fontSize: 10.5, lineHeight: 13, textAlign: 'center' },
});
