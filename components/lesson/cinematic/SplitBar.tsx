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
import type { SplitBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A DIVISION.
//
// `drag` puts a knob on a rail and asks how far along. This asks something the
// rail cannot: how does one thing DIVIDE between two — how much of the surgeon's
// act was intended and how much merely foreseen, how much of who you are you
// chose and how much was handed to you, how much of your searching went to
// evidence that could have proved you wrong.
//
// The difference is that both sides are drawn, both are named, and both numbers
// are on screen the whole time. Giving one side more visibly takes it off the
// other, which is the fact the question is about — a rail with one label at each
// end says "more of this way" and says nothing about what you gave up.
//
// ── THE SEAM, NOT A KNOB ────────────────────────────────────────────────────
//
// One solid bar with a join in it rather than a dot on a line. The reader is
// moving a boundary between two quantities, so the control is a boundary; a knob
// would be a third object in a picture that only has two things in it.
//
// The two running counts are TextInputs written from the UI thread for the same
// reason the readout is (see ./DragScale and components/shared/ACounter): they
// change at frame rate under a thumb, and React state there is sixty renders a
// second of a component that owns a gesture.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  split: SplitBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** Where the seam sits, 0..1 — the player's value, so the scene follows it. */
  pos: SharedValue<number>;
}

const BAR_H = 26;
const SEAM = 22;
const REVEAL = 420;
const SETTLE = { damping: 16, stiffness: 200 } as const;

export default function SplitBar({ split, picked, onPick, pos }: Props) {
  const answered = picked !== null;

  const uptos = split.zones.map((z) => z.upto);
  const reads = split.zones.map((z) => z.reads);
  const rightIdx = split.zones.findIndex((z) => z.correct);

  const barW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastZone = useSharedValue(-1);

  // Declared before every worklet that calls it (§17 rule 2).
  const zoneAt = useCallback((p: number) => {
    'worklet';
    for (let k = 0; k < uptos.length; k += 1) if (p <= uptos[k]) return k;
    return uptos.length - 1;
  }, [uptos]);

  const commit = useCallback((k: number) => {
    const z = split.zones[k];
    onPick(z.id, Boolean(z.correct));
  }, [split.zones, onPick]);

  useEffect(() => { pos.value = split.start; }, [split.start, pos]);

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
    const p = x / barW.value;
    // Never all the way to an end: a split with nothing on one side is not a
    // split, and the two labels would have nothing to sit under.
    pos.value = p < 0.06 ? 0.06 : p > 0.94 ? 0.94 : p;
    const z = zoneAt(pos.value);
    if (z !== lastZone.value) { lastZone.value = z; runOnJS(touch)(); }
  }, [barW, pos, zoneAt, lastZone]);

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
      const mid = (from + uptos[k]) / 2;
      pos.value = withSpring(mid < 0.06 ? 0.06 : mid > 0.94 ? 0.94 : mid, SETTLE);
      runOnJS(commit)(k);
    });

  const leftStyle = useAnimatedStyle(() => ({ width: pos.value * barW.value }));
  const seamStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * barW.value - SEAM / 2 }, { scaleY: 1 + 0.12 * held.value }],
  }));
  const wordProps = useAnimatedProps(() => ({ text: reads[zoneAt(pos.value)] } as never));
  const lProps = useAnimatedProps(() => ({ text: `${Math.round(pos.value * 100)}` } as never));
  const rProps = useAnimatedProps(() => ({ text: `${100 - Math.round(pos.value * 100)}` } as never));

  const from = rightIdx <= 0 ? 0 : uptos[rightIdx - 1];
  const to = rightIdx < 0 ? 0 : uptos[rightIdx];
  const bandStyle = useAnimatedStyle(() => ({
    opacity: done.value, left: `${from * 100}%`, width: `${(to - from) * 100}%`,
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ACounter
        style={[styles.word, counterStyle]}
        animatedProps={wordProps}
        defaultValue={reads[Math.max(0, zoneAt(split.start))]}
        editable={false}
        pointerEvents="none"
        accessibilityLabel="current division"
      />

      <GestureDetector gesture={pan}>
        {/* `nativeID` for the browser harnesses (§21). */}
        <View style={styles.strip} nativeID="split-bar">
          <View
            style={styles.bar}
            onLayout={(e) => { barW.value = e.nativeEvent.layout.width; }}
          >
            <Animated.View style={[styles.left, leftStyle]} pointerEvents="none" />
            {rightIdx >= 0 ? <Animated.View style={[styles.band, bandStyle]} pointerEvents="none" /> : null}
            <Animated.View style={[styles.seam, seamStyle]} pointerEvents="none">
              <View style={styles.seamGrip} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.ends} pointerEvents="none">
        <View style={styles.endCol}>
          <View style={styles.endRow}>
            <ACounter
              style={[styles.num, counterStyle]}
              animatedProps={lProps}
              defaultValue={`${Math.round(split.start * 100)}`}
              editable={false}
              pointerEvents="none"
              accessibilityLabel="left share"
            />
            <Text style={styles.pct}>%</Text>
          </View>
          <Text style={styles.side} numberOfLines={2}>{split.left}</Text>
        </View>
        <View style={[styles.endCol, styles.endRight]}>
          <View style={styles.endRow}>
            <ACounter
              style={[styles.num, counterStyle]}
              animatedProps={rProps}
              defaultValue={`${100 - Math.round(split.start * 100)}`}
              editable={false}
              pointerEvents="none"
              accessibilityLabel="right share"
            />
            <Text style={styles.pct}>%</Text>
          </View>
          <Text style={[styles.side, styles.sideRight]} numberOfLines={2}>{split.right}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, marginTop: 6 },
  word: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17, lineHeight: 22, color: INK, textAlign: 'center', marginBottom: 6,
  },

  strip: { height: 42, justifyContent: 'center' },
  bar: {
    height: BAR_H, borderRadius: 4, borderWidth: 2, borderColor: INK,
    backgroundColor: PAPER, overflow: 'visible', justifyContent: 'center',
  },
  left: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: INK, borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
  },
  band: {
    position: 'absolute', top: -6, height: BAR_H + 12,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 6,
  },
  seam: {
    position: 'absolute', left: 0, width: SEAM, height: BAR_H + 12, top: -6,
    alignItems: 'center', justifyContent: 'center',
  },
  seamGrip: {
    width: SEAM, height: BAR_H + 12, borderRadius: 4,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },

  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  endCol: { flex: 1 },
  endRight: { alignItems: 'flex-end' },
  endRow: { flexDirection: 'row', alignItems: 'baseline' },
  num: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: INK, width: 34,
  },
  pct: { fontFamily: 'Inter_500Medium', fontSize: 10, color: SOFT },
  side: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: SOFT, maxWidth: 130,
  },
  sideRight: { textAlign: 'right' },
});
