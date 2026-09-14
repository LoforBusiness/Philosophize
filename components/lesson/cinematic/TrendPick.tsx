import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { INK, PAPER, PAPER_LIT, mix } from '@/components/shared/tone';
import { orderFor } from './ChoiceCards';
import { LipPlate, VerdictSeal, useQuestionAccent, type PlateState } from './QuestionParts';
import { VERDICT } from './questionTone';
import { RULE, SOFT } from './cinematicKit';
import type { PlotBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A SHAPE, CHOSEN IN ONE TAP.
//
// A whole class of claim in philosophy is about what happens to one thing AS
// another changes: the value of an original as copies multiply, the shock of a
// broken rule as the decades pass, the duty that is left as a crowd grows. Every
// one of those is a curve, which is why this question is still asked with graphs.
//
// It used to be DRAWN. `ShapePlot` gave the reader three to six columns to drag up
// and down and a SET button to press, and a reader rejected it in plain terms:
// "too complicated to do, it takes too much time." Four drags and a commit is a
// small task in front of the question, and it earned nothing a pick does not.
//
// So the curves are drawn FOR the reader, one to a tile, and the reader chooses the
// shape they believe in with one tap. The block type stays `plot`, with the same
// profiles, so every scene that reacts to a plot beat still does.
//
// ── THE TILES ARE SHUFFLED ─────────────────────────────────────────────────
//
// Measured before this existed, the correct shape was the FIRST one authored in 15
// of 18 plot questions. Drawn freehand that did not matter; offered as tiles it is
// "always tap the top left". `orderFor` permutes them exactly as it permutes a poll.
//
// ── THE CURVES DRAW THEMSELVES IN ───────────────────────────────────────────
//
// Each chart is inert Views (§17 rule 7: nothing here animates a path), with a
// strip of the chart's own ground sliding off it left to right, tile after tile.
// The strip is the same flat colour as the chart it uncovers, so it is invisible
// except as the line arriving.
//
// ── THE SCENE STILL MOVES WITH IT ───────────────────────────────────────────
//
// `pos` (the scene's `dragPos`) was the drawn curve's MEAN height, and it still is:
// the chosen shape's mean, eased. `sem` (the scene's `pickPos`) is the chosen shape
// in the author's own order. A scene that followed the drawing follows the choice.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  plot: PlotBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** The chosen shape's mean height, 0..1 — what a scene reads as `dragPos`. */
  pos: SharedValue<number>;
  /** The chosen shape in the AUTHOR'S order, 0..1 — what a scene reads as `pickPos`. */
  sem?: SharedValue<number>;
  /** The question's own words, so the tile order is stable but not authored. */
  seed: string;
}

const mean = (xs: readonly number[] | undefined) => (xs && xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0.5);

export default function TrendPick({ plot, picked, onPick, pos, sem, seed }: Props) {
  const accent = useQuestionAccent();
  const answered = picked !== null;
  const n = plot.shapes.length;
  const order = orderFor(seed, n);
  const shapes = order.map((k) => plot.shapes[k]);
  // Four shapes go two by two, so each caption keeps a readable width; three sit
  // in one row.
  const perRow = n >= 4 ? 2 : n;
  const rows: number[][] = [];
  for (let d = 0; d < n; d += perRow) rows.push(shapes.slice(d, d + perRow).map((_, j) => d + j));
  const chartH = n >= 4 ? 34 : 40;
  // Three tiles in a row are narrow, so their captions get a fourth line in a
  // slightly smaller face rather than an ellipsis (check:controls measures both).
  const lines = n >= 4 ? 2 : 4;
  const small = n < 4;

  useEffect(() => {
    pos.value = mean(plot.start);
    // Mid-scale: nothing is chosen, so the scene must not be shown either end yet.
    if (sem) sem.value = 0.5;
  }, [plot, pos, sem]);

  const choose = (d: number) => {
    if (answered) return;
    const sh = shapes[d];
    pos.value = withTiming(mean(sh.profile), { duration: 260, easing: Easing.out(Easing.cubic) });
    if (sem) sem.value = withTiming(n > 1 ? order[d] / (n - 1) : 0, { duration: 260, easing: Easing.out(Easing.cubic) });
    touch();
    onPick(sh.id, Boolean(sh.correct));
  };

  const first = plot.cols[0] ?? '';
  const last = plot.cols[plot.cols.length - 1] ?? '';

  return (
    <View style={styles.wrap} nativeID="trend-pick">
      <View style={styles.head}>
        <Text style={[styles.axis, { color: accent.text }]} numberOfLines={1}>{plot.axis}</Text>
        {first || last ? <Text style={styles.range} numberOfLines={1}>{`${first}  →  ${last}`}</Text> : null}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((d) => (
            <Tile
              key={shapes[d].id}
              shape={shapes[d]}
              index={d}
              answered={answered}
              picked={picked}
              chartH={chartH}
              lines={lines}
              onPress={() => choose(d)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Tile({
  shape, index, answered, picked, chartH, lines, onPress,
}: {
  shape: PlotBlock['shapes'][number];
  index: number;
  answered: boolean;
  picked: string | null;
  chartH: number;
  lines: number;
  onPress: () => void;
}) {
  const accent = useQuestionAccent();
  const small = lines > 2;
  const mine = picked === shape.id;
  const state: PlateState = !answered ? 'idle' : shape.correct ? 'right' : mine ? 'wrong' : 'rest';
  const ink = state === 'right' ? VERDICT.right.ink
    : state === 'wrong' ? VERDICT.wrong.ink
      : state === 'rest' ? mix(PAPER, INK, 0.38)
        : accent.base;

  const down = useSharedValue(0);
  useEffect(() => {
    down.value = withTiming(answered && mine ? 1 : 0, { duration: 90 });
  }, [answered, mine, down]);

  // The chart's width is only known once it is laid out. One state change per
  // tile, when it mounts, never while a finger is moving.
  const [w, setW] = useState(0);
  const draw = useSharedValue(0);
  useEffect(() => {
    if (w <= 0) return;
    draw.value = 0;
    draw.value = withDelay(120 + index * 110, withTiming(1, { duration: 560, easing: Easing.inOut(Easing.cubic) }));
  }, [w, index, draw]);
  const curtain = useAnimatedStyle(() => ({ transform: [{ translateX: draw.value * (w + 2) }] }));

  // THE TRUE SHAPE RISES whether or not it was taken, so a reader who missed is
  // shown the answer rather than merely denied the point. Same language as the
  // cards and the stage targets.
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!(answered && shape.correct)) { lift.value = 0; return; }
    lift.value = withDelay(80, withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withSpring(0.55, { damping: 12, stiffness: 180 }),
    ));
  }, [answered, shape.correct, lift]);
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * lift.value }] }));

  return (
    <Animated.View style={[styles.slot, liftStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={shape.reads}
        disabled={answered}
        onPress={onPress}
        onPressIn={() => { if (!answered) down.value = 1; }}
        onPressOut={() => { if (!answered) down.value = 0; }}
      >
        <LipPlate state={state} down={down} radius={10} faceStyle={styles.face}>
          <View
            style={[styles.screen, { height: chartH }]}
            onLayout={(e) => setW(e.nativeEvent.layout.width)}
          >
            {w > 0 ? <Curve profile={shape.profile} w={w} h={chartH} ink={ink} /> : null}
            <Animated.View pointerEvents="none" style={[styles.curtain, curtain]} />
          </View>
          {/* Every caption reserves its full number of lines, so tiles in a row are
              one height whatever their captions run to. */}
          <Text
            style={[styles.caption, small && styles.captionSmall, { minHeight: lines * (small ? 12.5 : 13) }]}
            numberOfLines={lines}
          >
            {shape.reads}
          </Text>
        </LipPlate>
      </Pressable>
      {answered && mine ? <VerdictSeal correct={Boolean(shape.correct)} size={22} style={styles.seal} /> : null}
    </Animated.View>
  );
}

/** A polyline made of Views: a bar per segment, a dot per point, one faint midline. */
function Curve({ profile, w, h, ink }: { profile: readonly number[]; w: number; h: number; ink: string }) {
  const pad = 6;
  const th = 2.5;
  const n = profile.length;
  const pts = profile.map((v, k) => ({
    x: pad + (n > 1 ? (k * (w - 2 * pad)) / (n - 1) : (w - 2 * pad) / 2),
    y: pad + (1 - Math.max(0, Math.min(1, v))) * (h - 2 * pad),
  }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.mid, { top: h / 2 }]} />
      {pts.slice(1).map((p, k) => {
        const a = pts[k];
        const dx = p.x - a.x;
        const dy = p.y - a.y;
        const len = Math.hypot(dx, dy);
        return (
          <View
            key={`s${k}`}
            style={{
              position: 'absolute',
              left: (a.x + p.x) / 2 - len / 2,
              top: (a.y + p.y) / 2 - th / 2,
              width: len,
              height: th,
              borderRadius: th / 2,
              backgroundColor: ink,
              transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
            }}
          />
        );
      })}
      {pts.map((p, k) => (
        <View
          key={`d${k}`}
          style={[styles.dot, { left: p.x - 3, top: p.y - 3, borderColor: ink }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, marginTop: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 8 },
  axis: { flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  range: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 0.8, color: SOFT },
  row: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  slot: { flex: 1 },
  face: { padding: 5 },
  screen: {
    borderRadius: 6,
    backgroundColor: PAPER_LIT,
    borderWidth: 1,
    borderColor: RULE,
    overflow: 'hidden',
  },
  curtain: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', backgroundColor: PAPER_LIT },
  mid: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: RULE },
  dot: {
    position: 'absolute', width: 6, height: 6, borderRadius: 3,
    backgroundColor: PAPER_LIT, borderWidth: 1.5,
  },
  caption: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 13, color: INK,
    textAlign: 'center', marginTop: 4,
  },
  captionSmall: { fontSize: 10, lineHeight: 12.5 },
  seal: { top: -6, right: -4 },
});
