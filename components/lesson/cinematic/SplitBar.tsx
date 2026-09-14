import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue,
  withDelay, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import { touch } from '@/lib/feedback';
import { INK, PAPER, mix } from '@/components/shared/tone';
import ControlRead from './ControlRead';
import { VerdictSeal, useQuestionAccent } from './QuestionParts';
import { VERDICT } from './questionTone';
import { SOFT } from './cinematicKit';
import type { SplitBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A DIVISION.
//
// `drag` puts a knob on a rail and asks how far along. This asks something the
// rail cannot: how one thing DIVIDES between two — how much of an outcome was
// intended and how much merely foreseen, how much of who you are you chose. Both
// sides are drawn, both are named, and both numbers are on screen the whole time,
// so giving one side more visibly takes it off the other.
//
// ── THE SEAM, NOT A KNOB ────────────────────────────────────────────────────
//
// One bar with a join in it: the reader moves a boundary between two quantities,
// so the control is a boundary. The left share fills in the lesson's branch colour
// and the right stays the colour's own pale track, so the division reads at a
// glance (./questionTone). The verdict re-strikes the seam green or rust and lays a
// band where the right division lies.
//
// The two running counts are TextInputs written from the UI thread (ACounter):
// they change at frame rate under a thumb, and React state there is sixty renders a
// second of a component that owns a gesture. The percent sign is part of each count,
// so a single digit does not leave a gap before its sign.
//
// THE SEAM'S POSITION IS THE LEFT SIDE'S SHARE (R7b).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  split: SplitBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** Where the seam sits, 0..1 — the player's value, so the scene follows it. */
  pos: SharedValue<number>;
}

const BAR_H = 22;
const SEAM_W = 18;
const SEAM_H = 38;
const REVEAL = 420;
const SETTLE = { damping: 16, stiffness: 200 } as const;

export default function SplitBar({ split, picked, onPick, pos }: Props) {
  const accent = useQuestionAccent();
  const answered = picked !== null;

  const uptos = split.zones.map((z) => z.upto);
  const reads = split.zones.map((z) => z.reads);
  const rightIdx = split.zones.findIndex((z) => z.correct);
  const pickedZone = split.zones.find((z) => z.id === picked);
  const verdict = !answered ? null : pickedZone?.correct ? 'right' : 'wrong';

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

  // WHICH READING IS SHOWING — a derived value, never React state (S7).
  const zone = useDerivedValue(() => zoneAt(pos.value));

  const commit = useCallback((k: number) => {
    const z = split.zones[k];
    onPick(z.id, Boolean(z.correct));
  }, [split.zones, onPick]);

  useEffect(() => { pos.value = split.start; }, [split.start, pos]);
  // A second split beat opens on its own start, not where the last one was answered.
  useEffect(() => { lastZone.value = zoneAt(split.start); }, [split, zoneAt, lastZone]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  // THE VALUE FOLLOWS WHERE THE FINGER IS, NOT HOW FAR IT HAS MOVED (S5).
  const setAt = useCallback((x: number) => {
    'worklet';
    const p = x / barW.value;
    // Never all the way to an end: a split with nothing on one side is not a split.
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
    transform: [{ translateX: pos.value * barW.value - SEAM_W / 2 }, { scale: 1 + 0.1 * held.value }],
  }));
  const lProps = useAnimatedProps(() => ({ text: `${Math.round(pos.value * 100)}%` } as never));
  const rProps = useAnimatedProps(() => ({ text: `${100 - Math.round(pos.value * 100)}%` } as never));

  const from = rightIdx <= 0 ? 0 : uptos[rightIdx - 1];
  const to = rightIdx < 0 ? 0 : uptos[rightIdx];
  const bandStyle = useAnimatedStyle(() => ({
    opacity: done.value, left: `${from * 100}%`, width: `${(to - from) * 100}%`,
  }));

  const seamInk = verdict === 'right' ? VERDICT.right.ink : verdict === 'wrong' ? VERDICT.wrong.ink : accent.rim;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ControlRead texts={reads} idx={zone} color={accent.text} />

      <GestureDetector gesture={pan}>
        {/* `nativeID` for the browser harnesses (§21). */}
        <View style={styles.strip} nativeID="split-bar">
          <View
            style={styles.bar}
            onLayout={(e) => { barW.value = e.nativeEvent.layout.width; }}
          >
            {rightIdx >= 0 ? (
              <Animated.View
                style={[styles.band, { backgroundColor: VERDICT.right.face, borderColor: VERDICT.right.ink }, bandStyle]}
                pointerEvents="none"
              />
            ) : null}
            <View style={[styles.groove, { backgroundColor: accent.track, borderColor: accent.edge }]}>
              <Animated.View style={[styles.left, { backgroundColor: accent.base }, leftStyle]} pointerEvents="none">
                <View style={[styles.sheen, { backgroundColor: accent.lit }]} />
              </Animated.View>
            </View>
            <Animated.View style={[styles.seam, seamStyle]} pointerEvents="none">
              <View style={[styles.grip, { borderColor: seamInk }]}>
                {[0, 1, 2].map((g) => <View key={g} style={[styles.gripLine, { backgroundColor: seamInk }]} />)}
              </View>
              {verdict ? <VerdictSeal correct={verdict === 'right'} size={18} delay={220} style={styles.seal} /> : null}
            </Animated.View>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.ends} pointerEvents="none">
        <View style={styles.endCol}>
          <ACounter
            style={[styles.num, counterStyle, { color: accent.text }]}
            animatedProps={lProps}
            defaultValue={`${Math.round(split.start * 100)}%`}
            editable={false}
            pointerEvents="none"
            accessibilityLabel="left share"
          />
          <Text style={[styles.side, { color: accent.text }]} numberOfLines={2}>{split.left}</Text>
        </View>
        <View style={[styles.endCol, styles.endRight]}>
          <ACounter
            style={[styles.num, styles.numRight, counterStyle]}
            animatedProps={rProps}
            defaultValue={`${100 - Math.round(split.start * 100)}%`}
            editable={false}
            pointerEvents="none"
            accessibilityLabel="right share"
          />
          <Text style={[styles.side, styles.sideRight]} numberOfLines={2}>{split.right}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // See DragScale on why the top margin pays for the reading's second line.
  wrap: { paddingHorizontal: 26, marginTop: 2 },

  strip: { height: 44, justifyContent: 'center' },
  bar: { height: SEAM_H, justifyContent: 'center' },
  band: {
    position: 'absolute', height: BAR_H + 12, borderRadius: (BAR_H + 12) / 2, borderWidth: 1.5,
  },
  groove: {
    position: 'absolute', left: 0, right: 0,
    height: BAR_H, borderRadius: 8, borderWidth: 1.5, overflow: 'hidden',
  },
  left: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  sheen: { position: 'absolute', left: 3, right: 3, top: 3, height: 2.5, borderRadius: 1.5, opacity: 0.7 },
  seam: { position: 'absolute', left: 0, width: SEAM_W, height: SEAM_H, alignItems: 'center', justifyContent: 'center' },
  grip: {
    width: SEAM_W, height: SEAM_H, borderRadius: 7, borderWidth: 2.5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', gap: 3,
    shadowColor: INK, shadowOffset: { width: 1.2, height: 1.8 }, shadowOpacity: 0.25, shadowRadius: 2.5,
  },
  gripLine: { width: 6, height: 1.5, borderRadius: 1 },
  seal: { top: -10, right: -12 },

  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  endCol: { flex: 1 },
  endRight: { alignItems: 'flex-end' },
  num: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: INK, width: 58,
  },
  numRight: { textAlign: 'right' },
  side: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: SOFT, maxWidth: 130,
  },
  sideRight: { textAlign: 'right', color: mix(SOFT, INK, 0.3) },
});
