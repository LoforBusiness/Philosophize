import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue,
  withDelay, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import { touch } from '@/lib/feedback';
import { INK, PAPER, RULE, SOFT } from './cinematicKit';
import type { DragBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A POSITION, NOT A PICK.
//
// Every graded question in the first 102 lessons is a CHOICE: tap one of N things
// the scene drew, or take one of two cards. That is the right shape for "which of
// these", and the wrong shape for the question a lot of philosophy actually asks,
// which is "HOW MUCH". How much may a society tolerate. How much of your income is
// morally required. How simple should an explanation be. How sure are you.
//
// Offer those as two cards and you have quietly answered them for the reader: the
// interesting part of "how much" is that the answer is somewhere on a line and
// reasonable people put it in different places. So this draws the line and hands
// the reader the knob.
//
// ── WHAT MAKES IT TEACH RATHER THAN JUST SLIDE ──────────────────────────────
//
// The readout. Dragging a bare knob teaches nothing; dragging a knob while a word
// above it changes — "a hunch" → "a good bet" → "knowledge" — is the lesson. The
// reader feels the categories give way to each other, and finds the boundary by
// hunting for the flip rather than by being told where it is. That is the same
// productive-struggle rule (§13) the tap targets serve, in an analogue register.
//
// So a zone is not scoring furniture, it is the thing being taught, and `reads` is
// a piece of lesson copy under group J like any other.
//
// ── WHY THE WORD IS A TextInput ─────────────────────────────────────────────
//
// It changes at frame rate under the reader's thumb. A <Text> fed by React state
// would re-render this component sixty times a second while a finger is down,
// which is precisely what `scripts/check-poll.mjs` exists to stop. Reanimated can
// write a NATIVE prop from the UI thread and `text` on a TextInput is one, so the
// whole drag costs zero React renders. See components/shared/ACounter.
//
// ── AND WHY IT SITS WHERE ChoiceCards SITS ──────────────────────────────────
//
// Directly under the art, above the prompt, in deck coordinates. Not in the scene:
// every lesson crops the 400×560 stage to its own band and pushes a camera around
// inside it, so a rail placed there is a rail 12 lessons each get to clip
// differently (H60). Not pinned over the stage either — the figure stands on the
// ground line at the bottom of the band, and a rail there lands on top of him.
// The same three paragraphs are argued out at length in ./ChoiceCards; this
// follows that decision rather than re-litigating it.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  drag: DragBlock;
  /** A zone id once answered; null while the question is open. */
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /**
   * The knob's position, 0..1 — OWNED BY THE PLAYER, not by this control.
   *
   * That is the whole reason this mechanic is worth having. The scene gets the same
   * shared value as `dragPos`, so the reader is not moving a widget next to a
   * picture, they are moving the picture: the painting cleans as the knob travels,
   * the population fills in, the curve grows its wiggles. The knob and the art are
   * one gesture on the UI thread with no React render between them.
   */
  pos: SharedValue<number>;
}

/** How long the knob takes to settle into its zone after release. */
const SETTLE = { damping: 15, stiffness: 180 } as const;
/** How long the verdict takes to resolve once the knob has landed. */
const REVEAL = 420;

const KNOB = 30;
const RAIL_H = 4;

export default function DragScale({ drag, picked, onPick, pos }: Props) {
  const answered = picked !== null;

  // Zone geometry as flat number arrays, because a worklet closure may capture
  // primitives and arrays of them but NOT the objects' methods (§17 rule 6).
  const uptos = drag.zones.map((z) => z.upto);
  const reads = drag.zones.map((z) => z.reads);
  const rightIdx = drag.zones.findIndex((z) => z.correct);

  const railW = useSharedValue(1);          // measured, so a fraction can become pixels
  const held = useSharedValue(0);           // 0 released · 1 finger down
  const done = useSharedValue(0);           // 0 open · 1 answered and revealed
  const lastZone = useSharedValue(-1);      // for the tick as a boundary is crossed
  // Where the knob was when this drag began. `translationX` is cumulative from the
  // press, so integrating a per-frame delta instead drifts; this version of
  // gesture-handler has no `changeX` to integrate anyway.
  const grabbed = useSharedValue(drag.start);

  // DECLARED BEFORE EVERY WORKLET THAT CALLS IT. The babel plugin rewrites a
  // 'worklet' function into a const and builds closures at module scope, so a
  // worklet calling one declared further down hits its temporal dead zone and
  // throws AT IMPORT — taking down the route tree, not just this control (§17
  // rule 2). `npm run check:worklets` enforces it.
  const zoneAt = useCallback((p: number) => {
    'worklet';
    for (let k = 0; k < uptos.length; k += 1) if (p <= uptos[k]) return k;
    return uptos.length - 1;
  }, [uptos]);

  const commit = useCallback((k: number) => {
    const z = drag.zones[k];
    onPick(z.id, Boolean(z.correct));
  }, [drag.zones, onPick]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  const pan = Gesture.Pan()
    .enabled(!answered)
    .onBegin(() => {
      held.value = withTiming(1, { duration: 120 });
      grabbed.value = pos.value;
      lastZone.value = zoneAt(pos.value);
    })
    .onUpdate((e) => {
      const raw = grabbed.value + e.translationX / railW.value;
      pos.value = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      // A tick as the verdict word flips. This is the whole feel of the control:
      // the reader hunts the boundary by touch as much as by reading.
      const z = zoneAt(pos.value);
      if (z !== lastZone.value) { lastZone.value = z; runOnJS(touch)(); }
    })
    .onEnd(() => {
      held.value = withTiming(0, { duration: 160 });
      const k = zoneAt(pos.value);
      const from = k === 0 ? 0 : uptos[k - 1];
      pos.value = withSpring((from + uptos[k]) / 2, SETTLE);
      runOnJS(commit)(k);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.value * railW.value - KNOB / 2 },
      { scale: 1 + 0.14 * held.value },
    ],
  }));
  const fillStyle = useAnimatedStyle(() => ({ width: pos.value * railW.value }));
  // The rail lifts a little under the thumb, so the control reads as picked up.
  const railStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + 0.6 * held.value }] }));

  const wordProps = useAnimatedProps(() => ({ text: reads[zoneAt(pos.value)] } as never));

  // WHERE THE RIGHT ANSWER WAS. Marked only once answered, and marked even when the
  // reader got it right — the band is the teaching, not the score. Same reasoning
  // as ChoiceCards lifting the correct card nobody took.
  const from = rightIdx <= 0 ? 0 : uptos[rightIdx - 1];
  const to = rightIdx < 0 ? 0 : uptos[rightIdx];
  const bandStyle = useAnimatedStyle(() => ({
    opacity: done.value,
    left: `${from * 100}%`,
    width: `${(to - from) * 100}%`,
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ACounter
        style={[styles.word, counterStyle]}
        animatedProps={wordProps}
        defaultValue={reads[Math.max(0, zoneAt(drag.start))]}
        editable={false}
        pointerEvents="none"
        accessibilityLabel="current reading"
      />

      <GestureDetector gesture={pan}>
        {/* The touch target is the whole strip, not the 30px knob — a knob-sized
            hit area on a phone is a knob you keep missing.

            `nativeID` so the measurement harness can find it: a drag has no button
            to click, so scripts/measure-must.mjs could not answer one and stopped
            every drag lesson two beats short of its end. Same fix, same reason as
            the `beat-progress` id — a harness that has to guess which element to
            drive will eventually guess wrong and report a short sweep as a clean
            one. See §21. */}
        <View style={styles.strip} nativeID="drag-strip">
          <View
            style={styles.rail}
            onLayout={(e) => { railW.value = e.nativeEvent.layout.width; }}
          >
            <Animated.View style={[styles.railLine, railStyle]} />
            <Animated.View style={[styles.railFill, fillStyle]} />

            {/* The band the answer was in — thickness, never a second colour (§19). */}
            {rightIdx >= 0 ? <Animated.View style={[styles.band, bandStyle]} pointerEvents="none" /> : null}

            {/* Boundary ticks. Drawn for every zone edge except the far end, so the
                reader can see there ARE regions before they start hunting. */}
            {uptos.slice(0, -1).map((u, k) => (
              <View key={k} style={[styles.tick, { left: `${u * 100}%` }]} pointerEvents="none" />
            ))}

            <Animated.View style={[styles.knob, knobStyle]} pointerEvents="none">
              <View style={styles.knobCore} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.ends} pointerEvents="none">
        <Text style={styles.end}>{drag.lo}</Text>
        <Text style={styles.end}>{drag.hi}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, marginTop: 8 },
  word: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    lineHeight: 22,
    color: INK,
    textAlign: 'center',
    marginBottom: 6,
  },
  // Tall enough to catch a thumb that lands near the rail rather than on it.
  strip: { height: 44, justifyContent: 'center' },
  rail: { height: KNOB, justifyContent: 'center' },
  railLine: {
    position: 'absolute', left: 0, right: 0,
    height: RAIL_H, borderRadius: RAIL_H / 2, backgroundColor: RULE,
  },
  railFill: {
    position: 'absolute', left: 0,
    height: RAIL_H, borderRadius: RAIL_H / 2, backgroundColor: INK,
  },
  band: {
    position: 'absolute',
    height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed',
  },
  tick: { position: 'absolute', width: 2, height: 12, backgroundColor: SOFT },
  knob: {
    position: 'absolute', left: 0,
    width: KNOB, height: KNOB, borderRadius: KNOB / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  knobCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  end: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.1,
    color: SOFT,
  },
});
