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
import type { LeverBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A SETTING, THROWN.
//
// `drag` answers "how much" and `cards` answers "which of these two". This one
// answers "which SETTING", where the options are named positions rather than
// amounts — what punishment is FOR, whether a condition is necessary or merely
// sufficient, which of three things you keep when an argument goes wrong.
//
// A row of buttons would answer the same question and feel like nothing. The arm
// is the point: it has weight, it swings past the slot you were aiming at, it
// clunks in, and the reader ends up committed to a position in a way that
// tapping a box never quite does. That is the same productive-struggle argument
// DragScale makes about its rail, in a discrete register.
//
// ── WHAT MAKES IT TEACH ─────────────────────────────────────────────────────
//
// The readout above the arm, exactly as on the rail: a slot's `reads` is the
// sentence the setting commits you to, not its name. Swinging from "he could not
// have done otherwise" to "he could have, if he had wanted to" IS the lesson
// about compatibilism, and the reader finds it by moving the handle.
//
// ── AND THE ARM IS NOT THE ONLY THING THAT MOVES ────────────────────────────
//
// `pos` is the player's shared value, so the scene reads the same number and
// changes with the arm on the UI thread. A lever whose only consequence is a
// word above it is a widget; a lever that visibly re-aims the picture is a
// control. See SceneApi.dragPos.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  lever: LeverBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 0..1 across the arc — owned by the player so the scene can read it too. */
  pos: SharedValue<number>;
}

/** How far the arm swings, end to end. */
const SPREAD = 104;
const ARM = 52;
const PIVOT = 15;
const REVEAL = 420;
const SETTLE = { damping: 14, stiffness: 190 } as const;

export default function LeverPick({ lever, picked, onPick, pos }: Props) {
  const answered = picked !== null;
  const n = lever.stops.length;

  // Flat arrays: a worklet closure may capture primitives and arrays of them,
  // never the objects' methods (§17 rule 6).
  const reads = lever.stops.map((s) => s.reads);
  const rightIdx = lever.stops.findIndex((s) => s.correct);

  const padW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastStop = useSharedValue(-1);

  // DECLARED BEFORE EVERY WORKLET THAT CALLS IT — the babel plugin builds worklet
  // closures at module scope, so calling one declared further down throws at
  // import and takes the route tree with it (§17 rule 2, check:worklets).
  const stopAt = useCallback((p: number) => {
    'worklet';
    const k = Math.round(p * (n - 1));
    return k < 0 ? 0 : k > n - 1 ? n - 1 : k;
  }, [n]);

  const commit = useCallback((k: number) => {
    const st = lever.stops[k];
    onPick(st.id, Boolean(st.correct));
  }, [lever.stops, onPick]);

  useEffect(() => {
    // The arm starts in its declared slot, and a second lever question in one
    // lesson must not begin wherever the first was left.
    pos.value = n > 1 ? lever.start / (n - 1) : 0;
    lastStop.value = lever.start;
  }, [lever.start, n, pos, lastStop]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  // THE VALUE FOLLOWS WHERE THE FINGER IS, NOT HOW FAR IT HAS MOVED.
  //
  // This integrated `translationX / width`, which means the full range cost a
  // full WIDTH of travel — and the reader reported the consequence exactly:
  // "my finger gets to the end of the screen and I'll answer wrong because I
  // can't move it enough". Starting anywhere but the far edge, the far end was
  // literally unreachable inside the screen.
  //
  // Absolute placement removes the failure instead of retuning it: touch the far
  // end and you ARE at the far end, a tap sets the value, and there is no gain to
  // get wrong. `FieldPick` and `ShapePlot` were built this way and are the two
  // nobody complained about.
  const setAt = useCallback((x: number) => {
    'worklet';
    const p = x / padW.value;
    pos.value = p < 0 ? 0 : p > 1 ? 1 : p;
    const k = stopAt(pos.value);
    // The clunk. It fires as the arm passes into a slot's half, which is what
    // makes the row of settings something you can find without looking.
    if (k !== lastStop.value) { lastStop.value = k; runOnJS(touch)(); }
  }, [padW, pos, stopAt, lastStop]);

  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onBegin((e) => {
      held.value = withTiming(1, { duration: 120 });
      setAt(e.x);
    })
    .onUpdate((e) => { setAt(e.x); })
    .onEnd(() => {
      held.value = withTiming(0, { duration: 160 });
      const k = stopAt(pos.value);
      pos.value = withSpring(n > 1 ? k / (n - 1) : 0, SETTLE);
      runOnJS(commit)(k);
    });

  const armStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: ARM / 2 },
      { rotate: `${(pos.value - 0.5) * SPREAD}deg` },
      { translateY: -ARM / 2 },
      { scaleX: 1 + 0.05 * held.value },
    ],
  }));
  const wordProps = useAnimatedProps(() => ({ text: reads[stopAt(pos.value)] } as never));

  const slots = lever.stops.map((_, k) => k);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ACounter
        style={[styles.word, counterStyle]}
        animatedProps={wordProps}
        defaultValue={reads[lever.start] ?? reads[0]}
        editable={false}
        pointerEvents="none"
        accessibilityLabel="current setting"
      />

      <GestureDetector gesture={pan}>
        {/* The whole strip is the target, not the arm — see DragScale on why a
            knob-sized hit area is a knob you keep missing. `nativeID` so the
            browser harnesses can drive it: a lever has no button to click, and a
            sweep that cannot answer a question stops the lesson at that beat and
            reports the short run as a clean one (§21). */}
        <View
          style={styles.pad}
          nativeID="lever-arc"
          onLayout={(e) => { padW.value = e.nativeEvent.layout.width; }}
        >
          {/* The slots, drawn before the arm so the arm sits over them. */}
          <View style={styles.slotRow} pointerEvents="none">
            {slots.map((k) => (
              <View key={k} style={styles.slotCell}>
                <View style={[styles.notch, rightIdx === k && styles.notchRight]} />
              </View>
            ))}
          </View>

          <View style={styles.plate} pointerEvents="none" />

          <Animated.View style={[styles.armWrap, armStyle]} pointerEvents="none">
            <View style={styles.arm} />
            <View style={styles.grip} />
          </Animated.View>

          <View style={styles.pivot} pointerEvents="none" />
        </View>
      </GestureDetector>

      {/* The names, under their own slots. Marked once answered — the right slot
          is shown even when the reader hit it, because the band is the teaching
          and not the score (same rule as DragScale's dashed band). */}
      <View style={styles.labelRow} pointerEvents="none">
        {slots.map((k) => (
          <Label key={k} text={lever.stops[k].reads} right={rightIdx === k} done={done} />
        ))}
      </View>
    </View>
  );
}

/** One slot's name. It firms up if it was the right one, once the answer is in. */
function Label({
  text, right, done,
}: { text: string; right: boolean; done: SharedValue<number> }) {
  // 0.62, NOT 0.45, AND THE TYPE IS INK (D35).
  //
  // Every stop on every lever was drawn in SOFT at 0.45, which reaches the reader
  // at 1.7:1 — a grey smudge in the shape of a word. These are not decoration:
  // they are the OPTIONS, the thing the reader is choosing between, and there are
  // fifty lever questions. It is what the reader meant by
  //
  //   "for the new answering of questions, I have noticed a lot of the words are
  //    cut off from there"
  //
  // Ink at 0.62 measures 4.8:1 and the chosen one still steps out at full strength
  // in bold, so the hierarchy survives being legible.
  const st = useAnimatedStyle(() => ({ opacity: right ? 0.62 + 0.38 * done.value : 0.62 }));
  return (
    <View style={styles.labelCell}>
      <Animated.Text style={[styles.label, right && styles.labelRight, st]} numberOfLines={2}>
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, marginTop: 6 },
  word: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17, lineHeight: 22, color: INK, textAlign: 'center', marginBottom: 4,
  },

  pad: { height: 70, justifyContent: 'flex-end', alignItems: 'center' },
  slotRow: { position: 'absolute', left: 0, right: 0, top: 6, flexDirection: 'row' },
  slotCell: { flex: 1, alignItems: 'center' },
  notch: { width: 2, height: 11, backgroundColor: SOFT, borderRadius: 1 },
  notchRight: { backgroundColor: INK, width: 3 },

  /** The bed the arm swings over. */
  plate: { position: 'absolute', left: 0, right: 0, bottom: PIVOT, height: 2, backgroundColor: RULE },

  armWrap: { position: 'absolute', bottom: PIVOT - 2, alignItems: 'center', height: ARM },
  arm: { width: 5, height: ARM, borderRadius: 3, backgroundColor: INK },
  grip: {
    position: 'absolute', top: -7, width: 20, height: 20, borderRadius: 10,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  pivot: {
    position: 'absolute', bottom: PIVOT - 7, width: 14, height: 14, borderRadius: 7,
    backgroundColor: INK,
  },

  labelRow: { flexDirection: 'row', marginTop: 4 },
  labelCell: { flex: 1, paddingHorizontal: 2 },
  label: {
    fontFamily: 'Inter_500Medium', fontSize: 9.5, lineHeight: 12,
    // INK, not SOFT: SOFT is 5.3:1 at full strength and these are drawn at 0.62,
    // which would put them at 2.0. Weight carries the hierarchy instead of tone.
    color: INK, textAlign: 'center',
  },
  labelRight: { fontFamily: 'Inter_700Bold', color: INK },
});
