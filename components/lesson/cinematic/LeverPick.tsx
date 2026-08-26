import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue,
  withDelay, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import ControlRead from './ControlRead';
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

// ── THE GRIP TRACKS THE FINGER 1:1, AND UNTIL NOW IT MOVED A QUARTER AS FAR ──
//
// The reader: "make it so the lever moves easier instead of it feeling like a
// struggle to move over."
//
// The VALUE was already absolute — touch the far end and you are at the far end,
// which is the fix DragScale's header describes. What was not absolute was the
// PICTURE. The arm was 52 long swinging +-52deg, so its grip travelled
// 2 x 52 x sin(52) = 82dp while the finger travelled the pad's full 308. Pull all
// the way across and the handle tilts a little: a control that has already obeyed
// the gesture while visibly refusing it. Only the second half is felt.
//
// ── WHY A RIGID ARM CANNOT BE THE ANSWER, MEASURED ──────────────────────────
//
// The obvious fix is a LONGER arm on a pivot dropped below the control, so a small
// angle covers the whole width. It was built, and the rendered DOM said it cannot
// work: a rigid arm's tip traces a CIRCLE, so it sinks by L(1 - cos t) as it
// swings. Spanning 308 at 42deg needs L = 230, and 230 x (1 - cos 42) = 59 units of
// sink in a control that is 70 tall. The arm left the box entirely at the ends —
// the tilted tip measured at y 501 against a pad ending at 485.
//
// ── SO IT IS A LEVER IN A STRAIGHT GATE ─────────────────────────────────────
//
// The grip rides a horizontal GATE at a constant height, and the arm runs from a
// fixed fulcrum up to wherever the grip is, lengthening as it leans. That is what
// a gear lever in a straight gate actually does, it is one drawing rather than
// two, and it makes the arithmetic exact rather than approximate:
//
//     L = hypot(dx, dy)        the arm's drawn length
//     angle = atan2(dx, dy)    measured from straight up
//
// Rotating a bar of length L about its foot by that angle puts its tip at exactly
// (dx, dy) — under the thumb, on the gate, at every position, with no gain to tune
// and nothing that can fall out of the box.
const PIVOT_Y = 8;    // the fulcrum, above the pad floor
const GATE_Y = 58;    // the gate the grip rides, above the pad floor
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


  // WHICH READING IS SHOWING — REACT STATE, AND THAT IS NOT A REGRESSION.
  // See ./ControlRead: this index changes on the same boundary crossing that
  // already fires the haptic tick, so a wrapping <Text> costs a handful of renders
  // of one leaf, and the <input> it replaces could not wrap at all.
  const [stop, setStop] = useState(lever.start);

  const commit = useCallback((k: number) => {
    const st = lever.stops[k];
    onPick(st.id, Boolean(st.correct));
  }, [lever.stops, onPick]);

  useEffect(() => {
    // The arm starts in its declared slot, and a second lever question in one
    // lesson must not begin wherever the first was left.
    pos.value = n > 1 ? lever.start / (n - 1) : 0;
    lastStop.value = lever.start;
    setStop(lever.start);
  }, [lever, lever.start, n, pos, lastStop]);

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
    if (k !== lastStop.value) { lastStop.value = k; runOnJS(touch)(); runOnJS(setStop)(k); }
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
      runOnJS(setStop)(k);
      runOnJS(commit)(k);
    });

  // The arm reaches from the fulcrum to the grip, so both its length and its angle
  // come out of one offset. Rotation is about the wrap's own foot: its centre is
  // L/2 above that, hence the two translates around the rotate.
  const armStyle = useAnimatedStyle(() => {
    const dx = (pos.value - 0.5) * padW.value;
    const dy = GATE_Y - PIVOT_Y;
    const L = Math.sqrt(dx * dx + dy * dy);
    const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
    return {
      height: L,
      transform: [
        { translateY: L / 2 },
        { rotate: `${deg}deg` },
        { translateY: -L / 2 },
        { scaleX: 1 + 0.06 * held.value },
      ],
    };
  });

  const slots = lever.stops.map((_, k) => k);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ControlRead text={reads[stop] ?? reads[0]} />

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
          {/* The gate the grip rides, and the slots cut into it. Drawn before the
              arm so the arm sits over them. */}
          <View style={styles.gate} pointerEvents="none" />
          <View style={styles.slotRow} pointerEvents="none">
            {slots.map((k) => (
              <View key={k} style={styles.slotCell}>
                <View style={[styles.notch, rightIdx === k && styles.notchRight]} />
              </View>
            ))}
          </View>

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
      {/* FOUR LINES AT 8.5, NOT TWO AT 9.5. Each cell is a third or a quarter of
          the row and holds a whole `reads` sentence — "nothing was never possible,
          so there is nothing to explain" is 292dp of lettering in 99dp of cell.
          Two lines cut every one of them off. Same vertical room, more of it used
          by the words; 8.5 clears the 8pt floor (D34). */}
      <Animated.Text style={[styles.label, right && styles.labelRight, st]} numberOfLines={4}>
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // See DragScale on why the top margin pays for the reading's second line.
  wrap: { paddingHorizontal: 26, marginTop: 2 },

  // NOT overflow hidden. The grip is 22 across and centres on the far end of the
  // gate, so half of it sits outside the pad — and the wrap's own 26 of padding is
  // there to receive it.
  pad: { height: 70, justifyContent: 'flex-end', alignItems: 'center' },
  // Centred on the gate: a notch spans 6…17 from the top of a 70-tall pad, whose
  // middle is 11.5 — and the grip's centre rides at 70 − 58 = 12. They line up, so
  // the arm clunks into a slot the reader can watch it entering.
  slotRow: { position: 'absolute', left: 0, right: 0, top: 6, flexDirection: 'row' },
  slotCell: { flex: 1, alignItems: 'center' },
  notch: { width: 2, height: 11, backgroundColor: SOFT, borderRadius: 1 },
  notchRight: { backgroundColor: INK, width: 3 },

  /** The gate the grip runs along — the track, at the grip's own height. */
  gate: { position: 'absolute', left: 0, right: 0, bottom: GATE_Y - 1, height: 2, backgroundColor: RULE },

  armWrap: { position: 'absolute', bottom: PIVOT_Y, alignItems: 'center' },
  arm: { width: 5, height: '100%', borderRadius: 3, backgroundColor: INK },
  grip: {
    position: 'absolute', top: -11, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  /** The fulcrum, so the arm reads as hinged rather than floating. */
  pivot: {
    position: 'absolute', bottom: PIVOT_Y - 6, width: 12, height: 12, borderRadius: 6,
    backgroundColor: INK,
  },

  labelRow: { flexDirection: 'row', marginTop: 4 },
  labelCell: { flex: 1, paddingHorizontal: 2 },
  label: {
    fontFamily: 'Inter_500Medium', fontSize: 8.5, lineHeight: 11,
    // INK, not SOFT: SOFT is 5.3:1 at full strength and these are drawn at 0.62,
    // which would put them at 2.0. Weight carries the hierarchy instead of tone.
    color: INK, textAlign: 'center',
  },
  labelRight: { fontFamily: 'Inter_700Bold', color: INK },
});
