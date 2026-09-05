import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, useDerivedValue,
  runOnJS, withTiming, Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { touch } from '@/lib/feedback';
import {
  Underscore, revealTo, EASE_REVEAL, D_WIPE, D_RISE, LEAD, STEP,
} from '@/components/stats/reveal';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line as SvgLine, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import { PANEL_BASE, PANEL_LIP, PANEL_RULE, METAL, glow, mix } from '@/components/shared/tone';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE INSTRUMENT — the dark block at the top of Insights.
//
//   > "the whole tab looks too much childish, I need more premium feel and
//   > vibrent colors, not just a bunch of colors that make the app feel cheep."
//
// ── WHAT WAS ACTUALLY CHEAP, AND IT WAS NOT THE HUES ────────────────────────
//
// The old tab put six saturated fills on white and made every one of them large:
// a 26px ring, twelve-pixel rounded pill bars, pastel tinted cards behind the
// text. Six big colours competing on paper is a rainbow, and a rainbow is the
// cheapest an interface can look — the palette was never the problem, the AREA
// was.
//
// So the instrument inverts it. The ground is near-black, the type is cream, the
// hairlines are grey, and the branch colours appear only as a THIN arc and an
// 8px swatch. The same six hues look like cut stones instead of poster paint,
// because a colour on near-black at small size reads as light rather than as
// ink. `glow()` in tone.ts does the cutting and explains the two ways it can be
// got wrong.
//
// ── ONE ACCENT, NOT SIX, FOR EVERYTHING THAT IS NOT A BRANCH ────────────────
//
// The line chart is gold and nothing else. It is the app's own METAL.GOLD, the
// same material a first-place league disc and a top-tier badge are struck in,
// and XP is exactly the thing gold already means here. A second data colour on
// this panel would start a palette; one accent plus six labels is a system.
//
// ── NOT ONE SVG PROPERTY IS ANIMATED ────────────────────────────────────────
//
// §17's rule. The chart is drawn once and revealed by a CURTAIN — a flat block
// of the panel's own ground sliding right, which is one transform on the UI
// thread. That is also why the chart block sits on flat `PANEL_BASE` while the
// panel above it carries the gradient: a curtain can only be invisible if it is
// exactly the colour of what it is covering.
// ─────────────────────────────────────────────────────────────────────────────

export function Instrument({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.shell, style]}>
      {/* The bezel: one lit hairline along the top edge. It is the whole of the
          panel's depth, and it is enough — a raised surface is a surface that
          catches light on the edge facing it. */}
      <LinearGradient
        colors={[PANEL_LIP, PANEL_BASE]}
        locations={[0, 0.42]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={s.bezel} pointerEvents="none" />
      {children}
    </View>
  );
}

export function PanelHead({ kicker, right }: { kicker: string; right?: string }) {
  return (
    <View style={s.headRow}>
      <Text style={s.kicker}>{kicker}</Text>
      {right ? <Text style={s.kickerRight}>{right}</Text> : null}
    </View>
  );
}

export function PanelRule() {
  return <View style={s.rule} />;
}

// ── the legend beside the ring ───────────────────────────────────────────────

export interface LegendRow { key: string; label: string; value: number; hue: string }

export function Legend({ rows, total, selected, onSelect, grown, playToken, animate, entrance }: {
  rows: LegendRow[]; total: number; selected: string | null; onSelect: (k: string) => void;
  /** Keys whose value went up since the reader last looked. */
  grown: Set<string>;
  playToken: number; animate: boolean;
  /** Arriving at the tab, or reacting while already on it. See InsightBoard. */
  entrance: boolean;
}) {
  return (
    <View style={s.legend}>
      {rows.map((r, i) => (
        <LegendLine
          key={r.key}
          row={r}
          index={i}
          count={rows.length}
          total={total}
          on={selected === r.key}
          pop={grown.has(r.key)}
          playToken={playToken}
          animate={animate}
          entrance={entrance}
          onPress={() => onSelect(r.key)}
        />
      ))}
    </View>
  );
}

/**
 * ONE LEGEND ROW, AND IT IS ITS OWN COMPONENT FOR THE REASON §17'S RULE 1 GIVES.
 *
 * Each row needs its own `useAnimatedStyle` to carry its own reveal, and calling
 * the hook inside the `.map()` would be a hook in a loop. It would even work
 * today, because there are always exactly six branches — which is precisely the
 * "fine until it isn't" the rule is about.
 */
function LegendLine({ row: r, index, count, total, on, pop, playToken, animate, entrance, onPress }: {
  row: LegendRow; index: number; count: number; total: number;
  on: boolean; pop: boolean; playToken: number; animate: boolean;
  entrance: boolean; onPress: () => void;
}) {
  const g = glow(r.hue);
  const frac = total > 0 ? r.value / total : 0;

  // THE ROW THAT GREW IS MARKED; the rest sweep in and nothing overshoots.
  //
  // The distinction nearly went missing in the move to the instrument — the
  // branch bars used to carry the feedback, and when they became legend rows
  // their fill became a WIDTH rather than a transform, so the one row the reader
  // had actually moved stopped reacting and only the dial popped. It is kept,
  // and it is now an underscore rather than a 39% overshoot on a measured share.
  // See components/stats/reveal.tsx.
  const grow = useSharedValue(animate && entrance ? 0 : 1);
  const playedToken = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;
    if (!animate) { grow.value = 1; return; }
    // See LedgerTile: an entrance is gated on a NEW PLAY, everywhere. These
    // effects have no figure in their dependencies today, so the guard is
    // currently free — which is the point of making it uniform. The one that did
    // have a figure in its dependencies is the one that shipped the bug.
    if (!newPlay) return;
    // A ROW THAT DID NOT MOVE DOES NOT MOVE — and now neither does the one that
    // did. On a reaction every measure holds exactly where it is; sweeping all
    // six in again would say "here is your reading" when the reader asked "what
    // did that do", and springing one of them past its own share would answer
    // with a number that is not true.
    if (!entrance) { grow.value = 1; return; }
    grow.value = 0;
    grow.value = revealTo(1, LEAD + (index / Math.max(1, count)) * 260, D_WIPE);
  }, [playToken, animate, entrance, pop, index, count, grow]);

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: grow.value }] }));

  return (
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${r.label}, ${r.value} lessons`}
            style={({ pressed }) => [s.legendRow, pressed && { opacity: 0.7 }]}
          >
            <View style={s.legendTop}>
              <View style={[
                s.swatch,
                { backgroundColor: g.mark },
                on && { borderColor: C.paper, borderWidth: 1.5 },
              ]} />
              {/* THE NAME STAYS CREAM. Three of the six jewel tones sit under
                  4.5:1 on this ground — fine for a mark, not for a word. */}
              <Text style={[s.legendName, on && { color: C.paper }]} numberOfLines={1}>{r.label}</Text>
              <Text style={[s.legendValue, on && { color: C.paper }]}>{r.value}</Text>
            </View>
            {/* THE SHARE NEEDS ITS TRACK. Drawn as a bare rule it came out as
                six underlines of six different lengths — Ethics long, Politics a
                two-pixel tick — which reads as an artefact rather than a scale,
                because there was nothing to read the length AGAINST. A groove
                costs one more hairline and turns it back into a measurement. */}
            <View style={s.legendTrack}>
              <Animated.View
                nativeID={`legfill-${r.key}`}
                style={[
                  s.legendFill,
                  { width: `${Math.max(frac * 100, r.value > 0 ? 4 : 0)}%`, backgroundColor: g.mark },
                  fillStyle,
                ]}
              />
            </View>
            {/* The branch whose reading moved, marked in its own jewel tone.
                It sits in the 9pt gap below the row and lines up with the
                measure above it. */}
            <Underscore
              hue={g.mark}
              playToken={playToken}
              on={animate && pop}
              delay={entrance ? LEAD + D_WIPE * 0.6 : 60}
              style={{ bottom: -5, left: 15 }}
            />
          </Pressable>
  );
}

// ── the line chart ───────────────────────────────────────────────────────────

/** The scrubber's dot. Big enough to see over the 2px line, small enough not to
 *  cover the day either side of it. */
const DOT = 11;

export interface SparkProps {
  /** One value per day, oldest first. */
  series: number[];
  /** Days per x-axis label, for the two end captions. */
  spanLabel: string;
  /**
   * One short label per day, oldest first — what the scrubber names when a
   * finger lands on a point. From `dayLabels()` in the same module as the
   * series, so the window's arithmetic is not done twice (see its note).
   */
  labels?: string[];
  width: number;
  height?: number;
  playToken: number;
  animate: boolean;
  entrance: boolean;
}

/**
 * THIRTY DAYS OF XP, WITH THE TREND UNDER IT.
 *
 * Two lines, because one is a fact and the other is the shape of a habit: the
 * gold run is what was actually earned each day, and the cream line is its
 * seven-day mean, which is the only way a reader can tell a good fortnight from
 * a good Tuesday. The high day is marked, because on a thirty-point series the
 * peak is the one point anybody looks for.
 */
export function SparkLine({
  series, spanLabel, labels, width, height = 108, playToken, animate, entrance,
}: SparkProps) {
  const gold = METAL.GOLD;
  const n = series.length;
  const padT = 12;
  const padB = 18;
  const plotH = height - padT - padB;
  const max = Math.max(1, ...series);

  const geom = useMemo(() => {
    const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
    const y = (v: number) => padT + plotH - (v / max) * plotH;

    // A light quadratic smoothing through the midpoints. Straight segments on a
    // thirty-point series read as a seismograph; a full spline is more curve
    // than the data earns.
    const smooth = (pts: number[]) => {
      if (pts.length === 0) return '';
      let d = `M ${x(0).toFixed(2)} ${y(pts[0]).toFixed(2)}`;
      for (let i = 1; i < pts.length; i++) {
        const mx = (x(i - 1) + x(i)) / 2;
        d += ` Q ${x(i - 1).toFixed(2)} ${y(pts[i - 1]).toFixed(2)} ${mx.toFixed(2)} ${((y(pts[i - 1]) + y(pts[i])) / 2).toFixed(2)}`;
        d += ` Q ${x(i).toFixed(2)} ${y(pts[i]).toFixed(2)} ${x(i).toFixed(2)} ${y(pts[i]).toFixed(2)}`;
      }
      return d;
    };

    const line = smooth(series);
    const area = n > 0
      ? `${line} L ${x(n - 1).toFixed(2)} ${(padT + plotH).toFixed(2)} L ${x(0).toFixed(2)} ${(padT + plotH).toFixed(2)} Z`
      : '';

    // Seven-day mean, trailing — the same window the streak is counted in.
    const mean = series.map((_, i) => {
      const from = Math.max(0, i - 6);
      const slice = series.slice(from, i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });

    let peak = 0;
    for (let i = 1; i < n; i++) if (series[i] > series[peak]) peak = i;

    return { line, area, meanPath: smooth(mean), peak, px: x(peak), py: y(series[peak] ?? 0), y0: padT + plotH };
  }, [series, n, width, plotH, max]);

  // ── PUT A FINGER ON THE LINE AND IT TELLS YOU THE DAY ─────────────────────
  //
  //   "if the user puts their finger and scrolls or puts their finger on
  //    somewhere on the line, it will show how much XP the user made for whatever
  //    place the user's fingers at. And then if they scroll, the number will
  //    change based on whichever day they are on."
  //
  // Three decisions, and each of them is a rule this app has already paid for:
  //
  // · NOT ONE SVG PROPERTY MOVES. §17 rule 7 — an animated full-screen <Svg>
  //   costs about ten frames a second on a real phone. The chart stays the inert
  //   drawing it already was and the two things that move are native Views on
  //   top of it, which is the same arrangement every cinematic scene uses.
  //
  // · THE VALUE GOES WHERE THE FINGER IS, not how far it has travelled (S5).
  //   Touch the middle of the line and you are on the middle day; there is no
  //   gain to tune and a tap works as well as a drag.
  //
  // · THE READOUT IS AN ACounter, WHICH IS WHAT ACounter IS FOR. `ControlRead`'s
  //   header sets out why a lesson's READING had to stop being one — it is a
  //   sentence, and a TextInput cannot wrap. These two are a number and a short
  //   date that never wrap, they change under a moving thumb, and writing them
  //   from the UI thread means a scrub costs zero React renders. That is the
  //   case ACounter was built for.
  const days = useMemo(() => {
    const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * width);
    const y = (v: number) => padT + plotH - (v / max) * plotH;
    // Flat arrays of primitives: a worklet may capture those and not much else
    // (§17 rule 6). One entry per day, so the worklet only ever indexes.
    return {
      xs: series.map((_, i) => x(i)),
      ys: series.map((v) => y(v)),
      vs: series.slice(),
      ls: labels && labels.length === n ? labels.slice() : series.map(() => ''),
    };
  }, [series, labels, n, width, plotH, max, padT]);

  /** Which day the finger is on, and whether there is a finger at all. */
  const pick = useSharedValue(Math.max(0, n - 1));
  const held = useSharedValue(0);
  const shown = useSharedValue(0);

  const setAt = useCallback((px: number) => {
    'worklet';
    if (n <= 1) return;
    const u = px / Math.max(1, width);
    let i = Math.round(u * (n - 1));
    if (i < 0) i = 0; if (i > n - 1) i = n - 1;
    if (i !== pick.value) { pick.value = i; runOnJS(touch)(); }
  }, [n, width, pick]);

  // `activeOffsetX` is what lets this live inside a ScrollView: a sideways drag
  // scrubs, a downward one still scrolls the tab. Without it the chart would eat
  // every vertical swipe that began on it.
  const scrub = useMemo(() => {
    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onBegin((e) => { held.value = withTiming(1, { duration: 120 }); shown.value = 1; setAt(e.x); })
      .onUpdate((e) => { setAt(e.x); })
      .onEnd(() => { held.value = withTiming(0, { duration: 220 }); });
    // A TAP IS A PICK TOO. The reader said "puts their finger on somewhere on the
    // line" before they said "scrolls", and a pan that needs 6px of travel does
    // not answer a stationary finger.
    const tap = Gesture.Tap()
      .maxDuration(600)
      .onEnd((e) => { shown.value = 1; setAt(e.x); held.value = withTiming(1, { duration: 90 }); });
    return Gesture.Exclusive(pan, tap);
  }, [held, shown, setAt]);

  const ruleStyle = useAnimatedStyle(() => ({
    opacity: shown.value * (0.35 + 0.4 * held.value),
    transform: [{ translateX: days.xs[Math.round(pick.value)] ?? 0 }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [
      { translateX: (days.xs[Math.round(pick.value)] ?? 0) - DOT / 2 },
      { translateY: (days.ys[Math.round(pick.value)] ?? 0) - DOT / 2 },
      { scale: 1 + 0.18 * held.value },
    ],
  }));
  const readStyle = useAnimatedStyle(() => ({ opacity: shown.value }));
  const endStyle = useAnimatedStyle(() => ({ opacity: 1 - shown.value }));
  const valProps = useAnimatedProps(() => (
    { text: `${days.vs[Math.round(pick.value)] ?? 0} XP` } as never));
  const dayProps = useAnimatedProps(() => (
    { text: days.ls[Math.round(pick.value)] ?? '' } as never));

  // The curtain: a flat block of the panel's own ground, slid off to the right.
  const reveal = useSharedValue(animate && entrance ? 0 : 1);
  const playedToken = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;
    // The curtain is a REVEAL, so it can only happen once per arrival. Drawing
    // it again over a chart the reader is already looking at wipes the month off
    // the screen and paints it back — a reload, not a reaction.
    if (!animate || !entrance) { reveal.value = 1; return; }
    // See LedgerTile: an entrance is gated on a NEW PLAY, everywhere. These
    // effects have no figure in their dependencies today, so the guard is
    // currently free — which is the point of making it uniform. The one that did
    // have a figure in its dependencies is the one that shipped the bug.
    if (!newPlay) return;
    reveal.value = 0;
    // THE CURTAIN IS THE MODEL THE REST OF THE TAB NOW FOLLOWS, so it moved onto
    // the shared curve with them. `Easing.out(Easing.cubic)` and emphasized
    // decelerate are the same idea — enter fast, stop dead — and having one
    // named curve is what stops six files drifting apart again.
    reveal.value = revealTo(1, 260, 900);
  }, [playToken, animate, entrance, reveal]);

  const curtain = useAnimatedStyle(() => ({ transform: [{ translateX: reveal.value * width }] }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGrad id="xpArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gold.base} stopOpacity={0.34} />
            <Stop offset="100%" stopColor={gold.base} stopOpacity={0} />
          </SvgGrad>
        </Defs>

        {/* Two gridlines and a baseline — enough to give the run a floor and a
            ceiling without ruling the panel into a spreadsheet. */}
        <SvgLine x1={0} y1={padT} x2={width} y2={padT} stroke={PANEL_RULE} strokeWidth={1} />
        <SvgLine x1={0} y1={padT + plotH / 2} x2={width} y2={padT + plotH / 2} stroke={PANEL_RULE} strokeWidth={1} strokeDasharray="2 5" />
        <SvgLine x1={0} y1={geom.y0} x2={width} y2={geom.y0} stroke={mix(PANEL_RULE, C.paper, 0.15)} strokeWidth={1} />

        {geom.area ? <Path d={geom.area} fill="url(#xpArea)" /> : null}
        {geom.meanPath ? (
          <Path d={geom.meanPath} stroke={C.paperSoft} strokeWidth={1} fill="none" opacity={0.45} strokeDasharray="3 4" />
        ) : null}
        {geom.line ? <Path d={geom.line} stroke={gold.lit} strokeWidth={2} fill="none" strokeLinejoin="round" /> : null}

        {max > 1 ? (
          <>
            <Circle cx={geom.px} cy={geom.py} r={4.5} fill={PANEL_BASE} stroke={gold.lit} strokeWidth={2} />
            <Circle cx={geom.px} cy={geom.py} r={1.6} fill={gold.lit} />
          </>
        ) : null}
      </Svg>

      {/* The scrubber's two moving parts, both native Views over the inert
          drawing. Under the curtain, so the entrance still reveals a clean chart
          if a finger arrives during it. */}
      <Animated.View
        style={[s.scrubRule, { top: padT, height: plotH }, ruleStyle]}
        pointerEvents="none"
      />
      <Animated.View style={[s.scrubDot, dotStyle]} pointerEvents="none" />

      <Animated.View style={[s.curtain, { width, height }, curtain]} pointerEvents="none" />

      {/* The foot does double duty: the two end captions while nothing is picked,
          the day and its XP when something is. One fixed row either way, so
          nothing below the chart moves when a finger lands on it (L6's rule about
          a box that resizes under a thumb, in a smaller key). */}
      <View style={s.axis} pointerEvents="none">
        <Animated.View style={[s.axisEnds, endStyle]}>
          <Text style={s.axisLabel}>{spanLabel}</Text>
          <Text style={s.axisLabel}>TODAY</Text>
        </Animated.View>
        <Animated.View style={[s.axisEnds, s.readRow, readStyle]}>
          <ACounter
            style={[s.readDay, counterStyle]}
            animatedProps={dayProps}
            defaultValue=""
            editable={false}
            pointerEvents="none"
            accessibilityLabel="the day you are on"
          />
          <ACounter
            style={[s.readVal, counterStyle]}
            animatedProps={valProps}
            defaultValue=""
            editable={false}
            pointerEvents="none"
            accessibilityLabel="XP earned that day"
          />
        </Animated.View>
      </View>

      {/* Last, and over everything, so the whole plot is the target rather than
          the two-pixel line itself. */}
      <GestureDetector gesture={scrub}>
        <View style={[s.scrubPad, { width, height: height - 6 }]} nativeID="xp-scrub" />
      </GestureDetector>
    </View>
  );
}

// ── the metric strip ─────────────────────────────────────────────────────────

export interface Metric { key: string; label: string; value: number; suffix?: string }

export function MetricStrip({ metrics, playToken, animate, entrance }: {
  metrics: Metric[]; playToken: number; animate: boolean; entrance: boolean;
}) {
  return (
    <View style={s.metrics}>
      {metrics.map((m, i) => (
        <MetricCell
          key={m.key}
          metric={m}
          index={i}
          playToken={playToken}
          animate={animate}
          entrance={entrance}
          last={i === metrics.length - 1}
        />
      ))}
    </View>
  );
}

function MetricCell({ metric, index, playToken, animate, entrance, last }: {
  metric: Metric; index: number; playToken: number;
  animate: boolean; entrance: boolean; last: boolean;
}) {
  // NEVER ZERO — the same rule the ledger states at length. These four are the
  // reader's month, and a strip reading 0 / 0 / 0 / 0 while it climbs is one of
  // the two things they reported seeing. The CELL arrives; the figure is true
  // from the first frame it is drawn.
  const n = useSharedValue(metric.value);
  const rise = useSharedValue(animate && entrance ? 0 : 1);
  // `newPlay` for the reason LedgerTile spells out: `metric.value` is a
  // dependency, meeting a thinker awards XP, and XP moves three of these four
  // figures — so without it the strip re-counts from zero on a value change
  // carrying the previous play's `entrance`.
  const playedToken = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = playedToken.current !== playToken;
    playedToken.current = playToken;
    if (!animate) { n.value = metric.value; rise.value = 1; return; }
    if (newPlay && entrance) {
      n.value = metric.value;
      rise.value = 0;
      rise.value = revealTo(1, 360 + index * STEP, D_RISE);
      return;
    }
    // Roll from what is on screen to the new figure.
    n.value = withTiming(metric.value, { duration: 460, easing: EASE_REVEAL });
  }, [playToken, animate, entrance, metric.value, index, n, rise]);
  const props = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);
  const cell = useAnimatedStyle(() => ({
    opacity: Math.min(1, rise.value * 1.7),
    transform: [{ translateY: (1 - rise.value) * 8 }],
  }));

  return (
    <Animated.View style={[s.metricCell, !last && s.metricDivide, cell]}>
      <View style={s.metricValueRow}>
        <ACounter
          editable={false}
          pointerEvents="none"
          underlineColorAndroid="transparent"
          defaultValue={`${metric.value}`}
          style={[s.metricValue, counterStyle]}
          animatedProps={props}
        />
        {metric.suffix ? <Text style={s.metricSuffix}>{metric.suffix}</Text> : null}
      </View>
      {/* TWO LINES, AND THE SAME BOX ON ALL FOUR. At one line "PER ACTIVE DAY"
          was the one caption in the app a reader could not read — fourteen
          tracked characters at 7.5px in a cell about 78px wide, cut to an
          ellipsis. Letting it wrap and giving every cell an identical two-line
          box keeps the strip's foot even while the long one takes its second
          line. Shortening it was the other option and it loses the meaning:
          this is XP per day ACTIVE, which is not XP per day. */}
      <Text style={s.metricLabel} numberOfLines={2}>{metric.label}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  shell: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginTop: 22,
  },
  bezel: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: mix(PANEL_LIP, C.paper, 0.22),
  },

  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: C.paperSoft },
  kickerRight: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.4, color: C.dim },

  rule: { height: 1, backgroundColor: PANEL_RULE, marginVertical: 14 },

  // ── legend ──
  legend: { flex: 1, justifyContent: 'center', gap: 9 },
  legendRow: {},
  legendTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  legendName: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 10.5,
    letterSpacing: 0.2, color: C.paperSoft,
  },
  legendValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12.5, color: C.paperSoft },
  legendTrack: {
    height: 3, borderRadius: 1.5, marginTop: 4, marginLeft: 15,
    backgroundColor: mix(PANEL_BASE, C.paper, 0.10), overflow: 'hidden',
  },
  // Anchored left, so the bounce grows out of the groove's start rather than
  // out of its middle — RN scales about the centre by default.
  legendFill: { height: '100%', borderRadius: 1.5, transformOrigin: 'left' },

  // ── spark ──
  curtain: { position: 'absolute', top: 0, left: 0, backgroundColor: PANEL_BASE },
  axis: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    // A fixed height, because the two states are stacked in it rather than
    // swapped in and out — see the note at the markup.
    height: 12, justifyContent: 'center',
  },
  axisEnds: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  readRow: { justifyContent: 'flex-start', gap: 8 },
  axisLabel: { fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: C.dim },
  // WIDTHS ARE EXPLICIT, because an ACounter is a TextInput and an unstyled
  // <input> claims about twenty characters of intrinsic width — the trap its own
  // header records eating a flex row on this very tab.
  readDay: {
    width: 108, fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2,
    color: C.paperSoft,
  },
  readVal: {
    width: 84, fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.8,
    color: METAL.GOLD.lit,
  },
  /** The hairline down the day the finger is on. */
  scrubRule: {
    position: 'absolute', left: 0, width: 1, backgroundColor: C.paperSoft,
  },
  /** The point itself, ringed in gold like the peak marker it may land on. */
  scrubDot: {
    position: 'absolute', left: 0, top: 0, width: DOT, height: DOT,
    borderRadius: DOT / 2, borderWidth: 2, borderColor: METAL.GOLD.lit,
    backgroundColor: PANEL_BASE,
  },
  scrubPad: { position: 'absolute', left: 0, top: 0 },

  // ── metrics ──
  metrics: { flexDirection: 'row', marginTop: 2, alignItems: 'stretch' },
  metricCell: { flex: 1, alignItems: 'center', paddingVertical: 2, paddingHorizontal: 2 },
  metricDivide: { borderRightWidth: 1, borderRightColor: PANEL_RULE },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  metricValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 23,
    color: C.paper, textAlign: 'center', width: 46, padding: 0, margin: 0,
  },
  metricSuffix: { fontFamily: 'Inter_500Medium', fontSize: 9, color: C.dim, marginLeft: -8 },
  metricLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 0.7,
    lineHeight: 10, height: 20, color: C.dim, marginTop: 2, textAlign: 'center',
  },
});
