import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { bounceTo } from '@/components/stats/InsightBoard';
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

export function Legend({ rows, total, selected, onSelect, grown, playToken, animate }: {
  rows: LegendRow[]; total: number; selected: string | null; onSelect: (k: string) => void;
  /** Keys whose value went up since the reader last looked. */
  grown: Set<string>;
  playToken: number; animate: boolean;
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
          onPress={() => onSelect(r.key)}
        />
      ))}
    </View>
  );
}

/**
 * ONE LEGEND ROW, AND IT IS ITS OWN COMPONENT FOR THE REASON §17'S RULE 1 GIVES.
 *
 * Each row needs its own `useAnimatedStyle` to carry its own bounce, and calling
 * the hook inside the `.map()` would be a hook in a loop. It would even work
 * today, because there are always exactly six branches — which is precisely the
 * "fine until it isn't" the rule is about.
 */
function LegendLine({ row: r, index, count, total, on, pop, playToken, animate, onPress }: {
  row: LegendRow; index: number; count: number; total: number;
  on: boolean; pop: boolean; playToken: number; animate: boolean; onPress: () => void;
}) {
  const g = glow(r.hue);
  const frac = total > 0 ? r.value / total : 0;

  // THE ROW THAT GREW SQUEEZES AND OVERSHOOTS; the rest sweep in.
  //
  // This nearly went missing in the move to the instrument. The branch bars used
  // to carry the bounce, and when they became legend rows their fill became a
  // WIDTH rather than a transform — so the one row the reader had actually moved
  // stopped reacting, and only the dial popped. Measured in a browser: every
  // fill sat at a flat 0 to 1 through a real growth event.
  const grow = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) { grow.value = 1; return; }
    if (pop) { grow.value = 1; grow.value = bounceTo(1, 300, true); return; }
    grow.value = 0;
    grow.value = bounceTo(1, 120 + (index / Math.max(1, count)) * 260, false);
  }, [playToken, animate, pop, index, count, grow]);

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
          </Pressable>
  );
}

// ── the line chart ───────────────────────────────────────────────────────────

export interface SparkProps {
  /** One value per day, oldest first. */
  series: number[];
  /** Days per x-axis label, for the two end captions. */
  spanLabel: string;
  width: number;
  height?: number;
  playToken: number;
  animate: boolean;
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
export function SparkLine({ series, spanLabel, width, height = 108, playToken, animate }: SparkProps) {
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

  // The curtain: a flat block of the panel's own ground, slid off to the right.
  const reveal = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) { reveal.value = 1; return; }
    reveal.value = 0;
    reveal.value = withDelay(260, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [playToken, animate, reveal]);

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

      <Animated.View style={[s.curtain, { width, height }, curtain]} pointerEvents="none" />

      <View style={s.axis} pointerEvents="none">
        <Text style={s.axisLabel}>{spanLabel}</Text>
        <Text style={s.axisLabel}>TODAY</Text>
      </View>
    </View>
  );
}

// ── the metric strip ─────────────────────────────────────────────────────────

export interface Metric { key: string; label: string; value: number; suffix?: string }

export function MetricStrip({ metrics, playToken, animate }: {
  metrics: Metric[]; playToken: number; animate: boolean;
}) {
  return (
    <View style={s.metrics}>
      {metrics.map((m, i) => (
        <MetricCell key={m.key} metric={m} index={i} playToken={playToken} animate={animate} last={i === metrics.length - 1} />
      ))}
    </View>
  );
}

function MetricCell({ metric, index, playToken, animate, last }: {
  metric: Metric; index: number; playToken: number; animate: boolean; last: boolean;
}) {
  const n = useSharedValue(animate ? 0 : metric.value);
  useEffect(() => {
    if (!animate) { n.value = metric.value; return; }
    n.value = 0;
    n.value = withDelay(420 + index * 90, withTiming(metric.value, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [playToken, animate, metric.value, index, n]);
  const props = useAnimatedProps(() => ({ text: `${Math.round(n.value)}` }) as never);

  return (
    <View style={[s.metricCell, !last && s.metricDivide]}>
      <View style={s.metricValueRow}>
        <ACounter
          editable={false}
          pointerEvents="none"
          underlineColorAndroid="transparent"
          defaultValue={`${animate ? 0 : metric.value}`}
          style={[s.metricValue, counterStyle]}
          animatedProps={props}
        />
        {metric.suffix ? <Text style={s.metricSuffix}>{metric.suffix}</Text> : null}
      </View>
      <Text style={s.metricLabel} numberOfLines={1}>{metric.label}</Text>
    </View>
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
    flexDirection: 'row', justifyContent: 'space-between',
  },
  axisLabel: { fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: C.dim },

  // ── metrics ──
  metrics: { flexDirection: 'row', marginTop: 2 },
  metricCell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  metricDivide: { borderRightWidth: 1, borderRightColor: PANEL_RULE },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  metricValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 23,
    color: C.paper, textAlign: 'center', width: 46, padding: 0, margin: 0,
  },
  metricSuffix: { fontFamily: 'Inter_500Medium', fontSize: 9, color: C.dim, marginLeft: -8 },
  metricLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.1,
    color: C.dim, marginTop: 2,
  },
});
