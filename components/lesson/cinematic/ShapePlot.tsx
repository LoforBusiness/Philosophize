import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue,
  withDelay, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import ControlRead from './ControlRead';
import { INK, PAPER, RULE, SOFT } from './cinematicKit';
import type { PlotBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A SHAPE, DRAWN.
//
// A whole class of claim in philosophy is about what happens to one thing AS
// another changes — the value of an original as copies multiply, whether a ship
// is still the ship as planks come out, what a life is worth as the real contact
// in it falls away. Every one of those is a CURVE, and no pick can express one:
// offer four cards and the reader is choosing between four sentences about a
// shape instead of committing to the shape.
//
// So the reader draws it. One finger, straight across the columns, and the line
// follows — which is the gesture the reader asked for in as many words ("line
// graphs that you slide"). Nothing is snapped to a grid while the finger is
// down; the curve is theirs until they lift.
//
// ── HOW IT IS GRADED, AND WHY THAT IS FAIR ──────────────────────────────────
//
// Not by hitting numbers. Each shape the question knows is a PROFILE, and the
// drawn curve is scored to the nearest one by root-mean-square distance. So a
// reader who draws a cliff gets "a cliff" whether it falls at 0.9 or 0.7, and the
// question is testing whether they think the value collapses — which is the
// thing actually being asked. A tolerance dressed up as precision would be a
// worse question, not a stricter one.
//
// ── THE READOUT IS THE LESSON, AS EVERYWHERE ELSE ───────────────────────────
//
// The name of the shape currently drawn, live, above the plot: "it barely
// changes" → "it slides" → "it falls off a cliff". The reader hunts for the
// description that matches what they believe, and finds out that they believed
// something with a shape.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  plot: PlotBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** The drawn curve's MEAN height, 0..1 — what the scene reads (SceneApi.dragPos). */
  pos: SharedValue<number>;
}

const H = 84;              // plot height
const CAP = 9;             // the draggable cap on each column
const REVEAL = 460;

export default function ShapePlot({ plot, picked, onPick, pos }: Props) {
  const answered = picked !== null;
  const n = plot.cols.length;

  // Flat arrays only — a worklet may capture primitives and arrays of them, never
  // object methods (§17 rule 6). The profiles go across as one flattened run.
  const reads = plot.shapes.map((s) => s.reads);
  const flat: number[] = [];
  for (const sh of plot.shapes) for (let k = 0; k < n; k += 1) flat.push(sh.profile[k] ?? 0);
  const rightIdx = plot.shapes.findIndex((s) => s.correct);

  // One shared value per column. `useSharedValue` in a loop would be a hook in a
  // loop, so the columns are fixed at six and the unused ones simply never draw —
  // six is the declared maximum in PlotBlock and the check enforces it.
  const c0 = useSharedValue(0); const c1 = useSharedValue(0); const c2 = useSharedValue(0);
  const c3 = useSharedValue(0); const c4 = useSharedValue(0); const c5 = useSharedValue(0);
  const cols = [c0, c1, c2, c3, c4, c5];

  const padW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastShape = useSharedValue(-1);
  const anyDraw = useSharedValue(0);

  const readAt = useCallback(() => {
    'worklet';
    // Nearest profile by RMS. Written out rather than mapped because a worklet
    // cannot call the array methods it closed over.
    let best = 0;
    let bestD = 1e9;
    for (let s = 0; s < reads.length; s += 1) {
      let acc = 0;
      for (let k = 0; k < n; k += 1) {
        const d = cols[k].value - flat[s * n + k];
        acc += d * d;
      }
      if (acc < bestD) { bestD = acc; best = s; }
    }
    return best;
  }, [reads.length, n, flat, cols]);


  // WHICH READING IS SHOWING — REACT STATE, AND THAT IS NOT A REGRESSION.
  // See ./ControlRead: this index changes on the same boundary crossing that
  // already fires the haptic tick, so a wrapping <Text> costs a handful of renders
  // of one leaf, and the <input> it replaces could not wrap at all.
  const [shape, setShape] = useState(0);
  // HAS THE READER DRAWN ANYTHING YET. Gates the SET button, so an idle tap on the
  // pad cannot answer a question the reader has not thought about.
  const [drawn, setDrawn] = useState(false);

  const commit = useCallback((k: number) => {
    const sh = plot.shapes[k];
    onPick(sh.id, Boolean(sh.correct));
  }, [plot.shapes, onPick]);

  useEffect(() => {
    for (let k = 0; k < 6; k += 1) cols[k].value = plot.start[k] ?? 0;
    // The scene reads the mean, so it has something to follow before any drag.
    let m = 0;
    for (let k = 0; k < n; k += 1) m += plot.start[k] ?? 0;
    pos.value = n ? m / n : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plot.start, n]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  /** Set whichever column the finger is over, from where it is vertically. */
  const paint = useCallback((x: number, y: number) => {
    'worklet';
    const w = padW.value / n;
    let k = Math.floor(x / w);
    if (k < 0) k = 0; if (k > n - 1) k = n - 1;
    let v = 1 - y / H;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    cols[k].value = v;
    let m = 0;
    for (let j = 0; j < n; j += 1) m += cols[j].value;
    pos.value = m / n;
    const s = readAt();
    if (s !== lastShape.value) { lastShape.value = s; runOnJS(touch)(); runOnJS(setShape)(s); }
    if (!anyDraw.value) { anyDraw.value = 1; runOnJS(setDrawn)(true); }
  }, [n, padW, cols, pos, readAt, lastShape, anyDraw]);

  // ── LIFTING YOUR FINGER IS NOT AN ANSWER, AND IT USED TO BE ────────────────
  //
  // This committed in `onEnd`. Every other control in the family has ONE value, so
  // release-is-commit is right for them: there is nothing left to say. A plot has
  // one value PER COLUMN, and the only way to set four of them is to lift between
  // them — so the reader set the first column, lifted to reach the second, and the
  // question was over. They reported it exactly:
  //
  //   "when you move one up or down then want to go to the next it simply thinks
  //    your done and doesnt let you finish"
  //
  // A drag straight across still works and still sets every column; what has gone
  // is the assumption that it was the only way anyone would do it. The commit is
  // now a deliberate act, which is also the honest shape for a question whose
  // answer the reader has to BUILD rather than land on.
  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onBegin((e) => { held.value = withTiming(1, { duration: 110 }); paint(e.x, e.y); })
    .onUpdate((e) => { paint(e.x, e.y); })
    .onEnd(() => { held.value = withTiming(0, { duration: 160 }); });

  const padStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.06 * held.value }));

  const idx = plot.cols.map((_, k) => k);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ControlRead text={reads[shape] ?? reads[0]} />

      <View style={styles.row}>
        {/* The left gutter holds BOTH the axis label and the commit, so the button
            costs the deck no height at all — the column is already 70 x 84 and the
            label uses the top third of it. */}
        <View style={styles.gutter}>
          <Text style={styles.axis} numberOfLines={3}>{plot.axis}</Text>
          {!answered ? (
            <Pressable
              nativeID="plot-set"
              accessibilityRole="button"
              accessibilityLabel="set this shape"
              disabled={!drawn}
              onPress={() => { touch(); commit(readAt()); }}
              style={({ pressed }) => [styles.set, drawn && styles.setOn, pressed && styles.setDown]}
            >
              <Text style={[styles.setText, drawn && styles.setTextOn]}>
                {drawn ? 'SET' : 'DRAW IT'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <GestureDetector gesture={pan}>
          {/* `nativeID` for the browser harnesses — see DragScale on why an
              analogue control that cannot be driven turns a short sweep into a
              silent one (§21). */}
          <Animated.View
            style={[styles.pad, padStyle]}
            nativeID="shape-plot"
            onLayout={(e) => { padW.value = e.nativeEvent.layout.width; }}
          >
            <View style={styles.grid} pointerEvents="none">
              {[0.25, 0.5, 0.75].map((g) => (
                <View key={g} style={[styles.gridLine, { top: H * g }]} />
              ))}
            </View>

            {idx.map((k) => <Column key={k} v={cols[k]} n={n} k={k} />)}

            {/* The answer's own profile, dashed, once it is in. */}
            {rightIdx >= 0
              ? idx.map((k) => (
                <Ghost key={`g${k}`} n={n} k={k} at={plot.shapes[rightIdx].profile[k] ?? 0} done={done} />
              ))
              : null}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.labels} pointerEvents="none">
        {idx.map((k) => (
          <Text key={k} style={styles.label} numberOfLines={2}>{plot.cols[k]}</Text>
        ))}
      </View>
    </View>
  );
}

/** One column: a bar from the floor to the cap, and the cap the finger rides. */
function Column({ v, n, k }: { v: SharedValue<number>; n: number; k: number }) {
  const barStyle = useAnimatedStyle(() => ({ height: Math.max(2, v.value * H) }));
  const capStyle = useAnimatedStyle(() => ({ bottom: v.value * H - CAP / 2 }));
  return (
    <View style={[styles.col, { left: `${(k / n) * 100}%`, width: `${(1 / n) * 100}%` }]} pointerEvents="none">
      <Animated.View style={[styles.bar, barStyle]} />
      <Animated.View style={[styles.cap, capStyle]} />
    </View>
  );
}

/** Where the right shape sat, marked in outline once answered. */
function Ghost({
  n, k, at, done,
}: { n: number; k: number; at: number; done: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ opacity: done.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ghost, { left: `${(k / n) * 100}%`, width: `${(1 / n) * 100}%`, bottom: at * H - 1 }, st]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, marginTop: 0 },

  row: { flexDirection: 'row', alignItems: 'flex-end' },
  gutter: { width: 70, height: H, justifyContent: 'space-between', alignItems: 'flex-end' },
  axis: {
    // 64 WIDE, NOT 26. The axis label is a whole question — HOW MUCH IT STILL ASKS
    // is 118dp of lettering, and REASONABLE alone is 55 — so a 21dp column of text
    // could not hold one WORD of it, at any number of lines. The pad is flex, so
    // this comes out of the drawing area rather than off the screen.
    width: 70, fontFamily: 'Inter_700Bold', fontSize: 8, lineHeight: 10,
    letterSpacing: 0.6, color: SOFT, textAlign: 'right', paddingRight: 6, paddingBottom: 2,
  },

  /** The commit. Flat and cool until there is something to commit, exactly the way
   *  a locked rank pin is flat and cool (§19) — "the same thing, dimmer" reads as a
   *  rendering fault, so an unavailable control says what it wants instead. */
  set: {
    marginRight: 6, marginBottom: 2, paddingHorizontal: 7, height: 24,
    borderRadius: 12, borderWidth: 1.5, borderColor: RULE,
    alignItems: 'center', justifyContent: 'center',
  },
  setOn: { borderColor: INK, backgroundColor: INK },
  setDown: { opacity: 0.72 },
  setText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.9, color: SOFT,
    includeFontPadding: false,
  },
  setTextOn: { color: PAPER },
  pad: {
    flex: 1, height: H, borderBottomWidth: 2, borderBottomColor: INK,
    backgroundColor: PAPER, justifyContent: 'flex-end',
  },
  grid: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: RULE },

  col: { position: 'absolute', bottom: 0, height: H, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 14, backgroundColor: INK, borderRadius: 2, opacity: 0.16 },
  cap: {
    position: 'absolute', width: 26, height: CAP, borderRadius: CAP / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  ghost: {
    position: 'absolute', height: 2, borderRadius: 1,
    borderTopWidth: 2, borderStyle: 'dashed', borderColor: INK,
  },

  // 70, MATCHING THE GUTTER. This was 26 because the axis column used to be 26
  // wide; widening that to 70 left every column label sitting 44 units to the LEFT
  // of the column it names — the reader was reading "10 FLIPS" under nothing and
  // the last column had no label under it at all.
  labels: { flexDirection: 'row', marginTop: 3, paddingLeft: 70 },
  label: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 8.5, lineHeight: 11,
    color: SOFT, textAlign: 'center', paddingHorizontal: 1,
  },
});
