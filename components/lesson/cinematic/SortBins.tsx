import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay,
  withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { touch } from '@/lib/feedback';
import { PAPER_LIT, PAPER_SHADE, SHADOW, mix } from '@/components/shared/tone';
import ControlRead from './ControlRead';
import { orderFor } from './ChoiceCards';
import { INK, PAPER, RULE, SOFT } from './cinematicKit';
import type { SortBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A PLACE TO PUT SOMETHING.
//
// This replaces the lever, which a reader named twice over: "the lever is kind
// of confusing as well, and also doesn't look very good, and it really isn't
// that different from the line you drag back and forth."
//
// The last clause is the diagnosis. Reading all fifty of its questions, NOT ONE
// was a quantity. They are picks among named claims — "the fear is faked · the
// fun is faked · the fear is real, with the consequences taken out" — and a pick
// wearing a slider is indistinguishable from a slider, because that is what the
// reader's thumb is doing. It looked like the drag rail because it WAS the drag
// rail, with the numbers filed off.
//
// What those questions were actually asking is a CLASSIFICATION: given this
// thing, which of these does it belong to? So that is what the control does. One
// named chip, two or three labelled bins, and a question the reader could answer
// out loud — "where does testimony belong: direct, or second-hand?"
//
// ── WHY A DRAG AND NOT A TAP ────────────────────────────────────────────────
//
// Three bins could be three buttons, and it would answer the same question and
// feel like nothing. Carrying the chip is the point: the reader picks up the
// thing being classified, holds it over a bin, sees the readout change to what
// that bin would COMMIT them to, and lets go. That is the same
// productive-struggle argument DragScale makes about its rail, in the one
// register that is honestly discrete.
//
// It also tracks the finger absolutely, like every other control here since the
// gain fix: the chip is wherever the thumb is, so a bin at the far edge is never
// unreachable inside the screen.
//
// ── AND IT IS A STRUCK OBJECT, NOT AN OUTLINE ───────────────────────────────
//
// The first version was a bordered rectangle over three dashed rectangles, and
// the reader's verdict was the one this app has heard before about every flat
// surface it has ever shipped: "pretty boring and not very cool. Not very
// gamified."
//
// The identity already has an answer and it is used everywhere else — the rank
// pins, the badges, the certificates, the streak calendar and the profile's
// tiles are all STRUCK: a face lit from the top left, a shaded corner, a rim, a
// shadow. §19 records the quote plate being "the one object in the app still
// drawn as an outline while every button, card and rank pin sat on a lip". The
// answer controls were the next ones.
//
// So the chip is a raised tile and the bins are RECESSES — the same gradient run
// backwards, which is the only thing that says CUT IN rather than raised. That
// is not decoration here, it is the metaphor made literal: you pick a thing up
// and you put it in a socket. The chip's shadow grows while it is held and the
// socket it is over lights its own floor, so the reader can see where it will
// land before letting go.
//
// ── THE SCENE MOVES WITH IT ─────────────────────────────────────────────────
//
// `pos` is the player's shared value and follows the chip continuously, not the
// bin index — so a scene reading `dragPos` re-aims as the chip travels rather
// than jumping a whole step when it lands (R7c, and group L on teleports).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  sort: SortBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 0..1 across the pad AS DRAWN — this is the chip's own x, and nothing else. */
  pos: SharedValue<number>;
  /**
   * 0..1 across the bins AS AUTHORED — what a scene reads (SceneApi.pickPos).
   *
   * The bins are shuffled, so `pos` says "the chip is 60% across the pad" and
   * only this says "the chip is over the bin the author wrote second". A scene
   * following `pos` would follow the shuffle.
   */
  sem?: SharedValue<number>;
  /** The question's own words, so the bin order is stable but not authored. */
  seed: string;
}

// A THIRD OF THE FALL-OFF, for the reason §19 measured on the profile's panels
// and PollBallot's rows repeated: a wide surface lit from one side barely shades
// at all, and running the full PAPER_LIT -> PAPER_SHADE across it comes out as a
// tan stain rather than as light. The depth is in the edges.
const FACE_FOOT = mix(PAPER, PAPER_SHADE, 0.34);
const CHIP_W = 140;
const CHIP_H = 34;
const BIN_H = 44;
const REVEAL = 420;

export default function SortBins({ sort, picked, onPick, pos, sem, seed }: Props) {
  const answered = picked !== null;
  const n = sort.bins.length;
  // THE ORDER IS DECIDED HERE, for the reason ChoiceCards.orderFor sets out: the
  // lever these questions came from put its answer in the LAST slot 70% of the
  // time, which as a row of bins is "always throw it to the far end".
  const bins = orderFor(seed, n).map((k) => sort.bins[k]);
  const padW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastBin = useSharedValue(-1);
  const landed = useSharedValue(-1);
  // Which bin the chip is over RIGHT NOW, so a socket can light before the drop.
  // Derived on the UI thread; -1 until the reader touches the control.
  const overBin = useSharedValue(-1);

  // WHICH BIN THE CHIP IS OVER — computed on the UI thread, and DECLARED BEFORE
  // any worklet that calls it. The babel plugin builds worklet closures at module
  // scope, so a worklet calling one declared further down hits its temporal dead
  // zone and throws AT IMPORT, taking down the route tree (§17 rule 2).
  const binAt = useCallback((p: number) => {
    'worklet';
    const k = Math.floor(p * n);
    return k < 0 ? 0 : k > n - 1 ? n - 1 : k;
  }, [n]);

  // WHERE EACH DRAWN BIN SITS IN THE AUTHOR'S OWN ORDER, as plain numbers so the
  // worklet below can close over it. `orderFor(seed, n)[k]` is which authored bin
  // is drawn in slot k, which is exactly the mapping a scene needs undone.
  const semOf = orderFor(seed, n).map((k) => (n > 1 ? k / (n - 1) : 0));

  useEffect(() => {
    // The chip opens in the middle, over no bin in particular, so the control
    // never pre-answers its own question.
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
    // The tick as the chip crosses into a new bin — the whole feel of the
    // control, and it has to fire on a tap as well as a drag.
    overBin.value = k;
    if (k !== lastBin.value) {
      lastBin.value = k;
      // AND THE SCENE MOVES ON THE CROSSING, NOT WITH THE THUMB. The semantic
      // value is per BIN, so it steps; easing the step is what stops a scene
      // track covering the whole distance between two frames.
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
      // Settle to the middle of the bin it was dropped in, so the chip reads as
      // sitting IN the bin rather than wherever the thumb happened to stop.
      pos.value = withSpring((k + 0.5) / n, { damping: 18, stiffness: 190 });
      runOnJS(commit)(k);
    });

  // PICKED UP, not merely moved. It rises, grows a little and casts further --
  // the three things that together read as a hand lifting an object off a table.
  const chipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.value * padW.value - CHIP_W / 2 },
      { translateY: -5 * held.value },
      { scale: 1 + 0.06 * held.value },
    ],
    shadowOpacity: 0.18 + 0.22 * held.value,
    shadowRadius: 3 + 6 * held.value,
    elevation: 2 + 5 * held.value,
  }));

  const reading = bins.map((b) => b.reads);
  // WHICH READING IS SHOWING — derived on the UI thread, never React state.
  // ControlRead's own header sets out why: a value arriving through a render is
  // what made the rail stutter, and this control changes reading every time the
  // chip crosses a bin edge.
  const idx = useDerivedValue(() => binAt(pos.value));

  return (
    <View style={styles.wrap}>
      {/* The readout says what THIS bin would commit you to, which is where the
          teaching is — the same job the rail's zone words do. */}
      <ControlRead texts={reading} idx={idx} />

      <GestureDetector gesture={pan}>
        <View
          style={styles.pad}
          onLayout={(e) => { padW.value = e.nativeEvent.layout.width; }}
          // INSIDE THE GestureDetector, NOT ON THE WRAPPER. The harnesses find a
          // control by this id and dispatch a pointer sequence AT that element,
          // and a pointer event on a parent never reaches a child's handler -- so
          // with the id one level out, every sort beat was simply unanswerable.
          // The must-box sweep said so precisely: five lessons stopped short, and
          // all five were the sort lessons. DragScale puts its `drag-strip`
          // inside its own GestureDetector for exactly this reason.
          nativeID="sort-bins"
        >
          <View style={styles.bins}>
            {bins.map((b, k) => (
              <Bin key={b.id} bin={b} index={k} landed={landed} over={overBin} done={done} answered={answered} />
            ))}
          </View>

          <Animated.View style={[styles.chipWrap, chipStyle]} pointerEvents="none">
            <LinearGradient
              colors={[PAPER_LIT, PAPER, FACE_FOOT]}
              locations={[0, 0.5, 1]}
              start={{ x: 0.25, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={styles.chip}
            >
              <Text style={styles.chipText} numberOfLines={2}>{sort.chip}</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function Bin({ bin, index, landed, over, done, answered }: {
  bin: SortBlock['bins'][number];
  index: number;
  landed: SharedValue<number>;
  /** Which bin the chip is currently over, or -1. */
  over: SharedValue<number>;
  done: SharedValue<number>;
  answered: boolean;
}) {
  // A SOCKET LIGHTS UP BEFORE THE CHIP LANDS IN IT. Without this the reader is
  // aiming blind: the chip follows the thumb, but nothing says which bin it is
  // going into until they have already let go. This is the whole difference
  // between dropping something in and hoping.
  const lit = useAnimatedStyle(() => {
    const hot = over.value === index ? 1 : 0;
    const won = landed.value === index ? 1 : 0;
    return {
      // 0.8 AT REST, NOT 0.35. The first version dimmed every un-hovered bin to a
      // third, which made the labels harder to read than before the redesign --
      // the exact opposite of "easier to know what you can touch". Emphasis is
      // added to the live one, never taken from the others.
      opacity: 0.8 + 0.2 * Math.max(hot, won),
      borderColor: won ? INK : hot ? INK : RULE,
      borderWidth: won || hot ? 1.6 : 1,
    };
  });
  // THE SOCKET IS CUT IN AT REST, not only when the chip is over it. Drawn only
  // on hover, the bins spend almost all their life as three dashed rectangles --
  // which is the flat thing the redesign was meant to replace, showing itself
  // exactly when nobody is looking at it. A resting floor says "these are slots"
  // before the reader has touched anything; the lift on hover then says "this
  // one".
  const floor = useAnimatedStyle(() => ({
    opacity: (over.value === index || landed.value === index) ? 0.95 : 0.45,
  }));
  const markStyle = useAnimatedStyle(() => ({ opacity: done.value }));
  return (
    <Animated.View style={[styles.bin, lit]}>
      {/* THE FLOOR OF THE SOCKET — a recess is the tile's gradient run backwards,
          dark at the top left where the light cannot reach into the cut. That
          inversion is the only thing that says CUT IN rather than raised. */}
      <Animated.View style={[StyleSheet.absoluteFill, floor]} pointerEvents="none">
        <LinearGradient
          colors={[FACE_FOOT, PAPER, PAPER_LIT]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Text style={styles.binLabel} numberOfLines={2}>{bin.label}</Text>
      {answered && bin.correct ? (
        <Animated.Text style={[styles.binTick, markStyle]}>✓</Animated.Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  // TALL ENOUGH TO HOLD BOTH. The chip is absolutely placed at the top and the
  // bins are flex-end at the bottom, so the pad has to be at least the two of them
  // plus a gap -- at BIN_H + 22 the chip sat ON the bin lips and covered the first
  // two labels. Only the render showed it; every label measured as fitting,
  // because each one does fit its own box.
  pad: { height: BIN_H + CHIP_H + 10, justifyContent: 'flex-end' },
  bins: { flexDirection: 'row', gap: 6, height: BIN_H },
  bin: {
    flex: 1,
    borderRadius: 4,
    // DASHED, because a bin is a place to put something rather than an object.
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  binLabel: {
    color: SOFT, fontSize: 10, letterSpacing: 0.8, textAlign: 'center',
    textTransform: 'uppercase',
  },
  binTick: { position: 'absolute', top: 3, right: 5, color: INK, fontSize: 12, fontWeight: '700' },
  chipWrap: {
    position: 'absolute', top: 0, left: 0,
    width: CHIP_W,
    borderRadius: 4,
    // The one light, top-left, so the shadow falls bottom-right exactly as it
    // does under every other struck thing in the app. `SHADOW` is a {dx, dy,
    // opacity} triple, not a colour -- passing it as `shadowColor` is what
    // collapsed StyleSheet.create's per-key inference and produced a type error
    // pointing at a completely innocent line 90 lines away.
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy + 1 },
  },
  chip: {
    // 140, NOT 80. `check:controls` measured the authored chips against an 80pt
    // box the moment this control was added and found 39 of 50 needing three
    // lines in a box with one -- "a wall you were told about" is 138dp. The chip
    // names the thing being classified, and those names are lesson copy; the box
    // is the part that was wrong.
    width: CHIP_W, minHeight: CHIP_H,
    borderRadius: 4,
    borderWidth: 1.2, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6, paddingVertical: 4,
  },
  chipText: { color: INK, fontSize: 10, lineHeight: 13, fontWeight: '600', textAlign: 'center' },
});
