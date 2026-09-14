import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue,
  withDelay, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { INK, PAPER, mix } from '@/components/shared/tone';
import ControlRead from './ControlRead';
import { Medallion, VerdictSeal, useQuestionAccent } from './QuestionParts';
import { VERDICT } from './questionTone';
import type { DragBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A POSITION, NOT A PICK.
//
// Every graded question in the first 102 lessons was a CHOICE, which is the right
// shape for "which of these" and the wrong one for the question a lot of philosophy
// asks: HOW MUCH. How much may a society tolerate, how sure are you, how far back
// does an explanation reach. Offer those as two cards and the interesting part, that
// the answer lies somewhere on a line, has been answered for the reader. So this
// draws the line and hands the reader the knob.
//
// ── WHAT MAKES IT TEACH RATHER THAN JUST SLIDE ──────────────────────────────
//
// The readout. A word above the rail changes as the knob travels, "a hunch" → "a
// good bet" → "knowledge", and the reader finds the boundary by hunting for the
// flip. So a zone is not scoring furniture, it is the thing being taught, and
// `reads` is lesson copy like any other.
//
// ── AND IT IS A STRUCK INSTRUMENT, IN THE LESSON'S COLOUR ───────────────────
//
// It was a hairline with a ring on it, in ink and grey, and a reader called the
// question controls "very simple black and white … not very gamified". The rail is
// a GROOVE now, cut into the page, filled in the lesson's branch hue up to a knob
// struck in the same hue (./QuestionParts, ./questionTone). The verdict re-strikes
// the knob green or rust and lays a solid band where the right answer was.
//
// ── WHY IT SITS WHERE ChoiceCards SITS ──────────────────────────────────────
//
// Directly under the art, above the prompt, in deck coordinates (L6, H60). The
// argument is set out in ./ChoiceCards and this follows it.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  drag: DragBlock;
  /** A zone id once answered; null while the question is open. */
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /**
   * The knob's position, 0..1 — OWNED BY THE PLAYER, not by this control. The scene
   * gets the same shared value as `dragPos`, so the reader moves the picture, not a
   * widget beside it.
   */
  pos: SharedValue<number>;
}

/** How the knob settles into its zone after release. */
const SETTLE = { damping: 15, stiffness: 180 } as const;
/** How long the verdict takes to resolve once the knob has landed. */
const REVEAL = 420;

const KNOB = 34;
const GROOVE = 12;

export default function DragScale({ drag, picked, onPick, pos }: Props) {
  const accent = useQuestionAccent();
  const answered = picked !== null;

  // Zone geometry as flat number arrays, because a worklet closure may capture
  // primitives and arrays of them but NOT the objects' methods (§17 rule 6).
  const uptos = drag.zones.map((z) => z.upto);
  const reads = drag.zones.map((z) => z.reads);
  const rightIdx = drag.zones.findIndex((z) => z.correct);
  const pickedZone = drag.zones.find((z) => z.id === picked);
  const verdict = !answered ? null : pickedZone?.correct ? 'right' : 'wrong';
  const fillInk = verdict === 'right' ? VERDICT.right.ink : verdict === 'wrong' ? VERDICT.wrong.ink : accent.base;

  const railW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastZone = useSharedValue(-1);

  // DECLARED BEFORE EVERY WORKLET THAT CALLS IT (§17 rule 2).
  const zoneAt = useCallback((p: number) => {
    'worklet';
    for (let k = 0; k < uptos.length; k += 1) if (p <= uptos[k]) return k;
    return uptos.length - 1;
  }, [uptos]);

  // WHICH READING IS SHOWING — a derived value, never React state (S7).
  const zone = useDerivedValue(() => zoneAt(pos.value));

  const commit = useCallback((k: number) => {
    const z = drag.zones[k];
    onPick(z.id, Boolean(z.correct));
  }, [drag.zones, onPick]);

  // A SECOND DRAG BEAT MUST NOT OPEN ON THE FIRST ONE'S ANSWER.
  useEffect(() => { lastZone.value = zoneAt(drag.start); }, [drag, zoneAt, lastZone]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  // THE VALUE FOLLOWS WHERE THE FINGER IS, NOT HOW FAR IT HAS MOVED (S5): touch the
  // far end and you ARE at the far end, and a tap sets the value.
  const setAt = useCallback((x: number) => {
    'worklet';
    const p = x / railW.value;
    pos.value = p < 0 ? 0 : p > 1 ? 1 : p;
    const z = zoneAt(pos.value);
    if (z !== lastZone.value) { lastZone.value = z; runOnJS(touch)(); }
  }, [railW, pos, zoneAt, lastZone]);

  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onBegin((e) => {
      held.value = withTiming(1, { duration: 120 });
      lastZone.value = zoneAt(pos.value);
      setAt(e.x);
    })
    .onUpdate((e) => { setAt(e.x); })
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
  const fillStyle = useAnimatedStyle(() => ({ width: Math.max(GROOVE, pos.value * railW.value) }));

  // WHERE THE RIGHT ANSWER WAS. Marked once answered, whether or not the reader got
  // it: the band is the teaching, not the score.
  const from = rightIdx <= 0 ? 0 : uptos[rightIdx - 1];
  const to = rightIdx < 0 ? 0 : uptos[rightIdx];
  const bandStyle = useAnimatedStyle(() => ({
    opacity: done.value,
    left: `${from * 100}%`,
    width: `${(to - from) * 100}%`,
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ControlRead texts={reads} idx={zone} color={accent.text} />

      <GestureDetector gesture={pan}>
        {/* The touch target is the whole strip, not the knob, and `nativeID` lets
            a harness find it (§21). */}
        <View style={styles.strip} nativeID="drag-strip">
          <View
            style={styles.rail}
            onLayout={(e) => { railW.value = e.nativeEvent.layout.width; }}
          >
            {rightIdx >= 0 ? (
              <Animated.View
                style={[styles.band, { backgroundColor: VERDICT.right.face, borderColor: VERDICT.right.ink }, bandStyle]}
                pointerEvents="none"
              />
            ) : null}

            {/* THE GROOVE: cut into the page, darker along its top edge where the
                light cannot reach into the cut. */}
            <View style={[styles.groove, { backgroundColor: mix(PAPER, INK, 0.07), borderColor: mix(PAPER, INK, 0.14) }]}>
              <View style={[styles.grooveShade, { backgroundColor: mix(PAPER, INK, 0.13) }]} />
              <Animated.View style={[styles.fill, { backgroundColor: fillInk }, fillStyle]}>
                <View style={[styles.fillSheen, { backgroundColor: mix(fillInk, PAPER, 0.4) }]} />
              </Animated.View>
            </View>

            {/* Boundary notches, so the reader can see there ARE regions before
                they start hunting. */}
            {uptos.slice(0, -1).map((u, k) => (
              <View key={k} style={[styles.notch, { left: `${u * 100}%`, backgroundColor: accent.edge }]} pointerEvents="none" />
            ))}

            <Animated.View style={[styles.knob, knobStyle]} pointerEvents="none">
              <Medallion held={held} size={KNOB} verdict={verdict} />
              {verdict ? <VerdictSeal correct={verdict === 'right'} size={18} delay={220} style={styles.seal} /> : null}
            </Animated.View>
          </View>
        </View>
      </GestureDetector>

      {/* HALF THE ROW EACH, AND TWO LINES, so a long pair cannot push past both
          edges of the screen. */}
      <View style={styles.ends} pointerEvents="none">
        <Text style={[styles.end, { color: accent.text }]} numberOfLines={2}>{drag.lo}</Text>
        <Text style={[styles.end, styles.endRight, { color: accent.text }]} numberOfLines={2}>{drag.hi}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 4, NOT 8. The deck below is `overflow: hidden`, so what the reading's second
  // line gains has to come from the margins.
  wrap: { paddingHorizontal: 26, marginTop: 4 },
  strip: { height: 46, justifyContent: 'center' },
  rail: { height: KNOB, justifyContent: 'center' },
  band: {
    position: 'absolute',
    height: GROOVE + 12, borderRadius: (GROOVE + 12) / 2,
    borderWidth: 1.5,
  },
  groove: {
    position: 'absolute', left: 0, right: 0,
    height: GROOVE, borderRadius: GROOVE / 2, borderWidth: 1,
    overflow: 'hidden',
  },
  grooveShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 2.5 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: GROOVE / 2 },
  fillSheen: { position: 'absolute', left: 3, right: 3, top: 2, height: 2, borderRadius: 1, opacity: 0.8 },
  notch: { position: 'absolute', width: 2, height: 20, borderRadius: 1, marginLeft: -1 },
  knob: { position: 'absolute', left: 0, width: KNOB, height: KNOB },
  seal: { top: -9, right: -9 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  end: {
    flex: 1,
    paddingHorizontal: 3,
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    lineHeight: 12.5,
    letterSpacing: 1,
  },
  endRight: { textAlign: 'right' },
});
