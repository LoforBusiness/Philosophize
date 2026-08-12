import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo, Platform } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withSpring, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import ACounter, { counterStyle } from './ACounter';
import { milestoneFor, type StatElement, type Milestone } from '@/lib/utils/statsMilestone';
import { cue } from '@/lib/feedback';

export interface PiePoint {
  label: string;
  value: number;
  // Optional explicit slice fill. When set, it overrides the index-based tint —
  // used so a branch keeps the SAME colour across charts even if slices are
  // filtered/reordered. Omitted → falls back to the grayscale ramp by index.
  color?: string;
  /**
   * What this slice is, for the tap interaction. Carried ON the point rather
   * than passed as a parallel array because this component FILTERS zero-value
   * points — two arrays would silently fall out of step and every milestone
   * would be computed against the wrong slice.
   */
  element?: StatElement;
}

interface Props {
  title: string;
  subtitle?: string;
  data: PiePoint[];
  valueMode?: 'raw' | 'percent';
  /**
   * Changing this replays the entrance. The screen owns the decision — see
   * `statsSeenFingerprint`: the charts spring up only when their numbers differ
   * from the last time this reader looked, so movement here MEANS something
   * happened rather than decorating every visit.
   */
  playToken?: number;
  /** False renders finished and still, with no entrance at all. */
  animate?: boolean;
  /** Milliseconds to hold this card back, so two pies do not fire as one. */
  delay?: number;
  /**
   * True when the two pies are stacked rather than side by side.
   *
   * `flex: 1` splits the WIDTH between two cards in a row, which is what it is
   * for — but the same rule in a COLUMN splits the height, and then a card whose
   * content is taller than its equal share overflows its own border. That is
   * exactly what the tap detail did: the Areas pie has six legend rows to the
   * Philosophers' five, and adding a line of copy pushed "Politics" out through
   * the bottom of the card. Stacked, a card sizes to its content instead.
   */
  stacked?: boolean;
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

// Warm-gray tint ramp (dark → light). Assigned per slice by index so a slice's
// fill and its legend swatch always match. The range is deliberately compressed
// toward ink: even the lightest step (#BEBBB0) stays clearly darker than the
// #FAFAF7 paper, so no slice washes out, while ~32-luminance steps keep
// neighbouring slices distinguishable across the thin paper gap between them.
export const TINTS = ['#1A1A1A', '#3D3B38', '#5E5B55', '#7E7B72', '#9E9B90', '#BEBBB0'];

/**
 * HOW SMALL A GHOST MAY BE AND STILL BE A GHOST — six degrees of arc.
 *
 * Passed into `milestoneFor`, which discards any target whose ghost would fall
 * under it. This is the number that killed the obvious "+1 lesson" design: one
 * lesson moves a filled-in slice about a point and a half, which is four
 * degrees, which is a rendering artifact rather than an animation.
 * `scripts/check-stats.mjs` measures against this exact constant.
 */
const MIN_GHOST = 6 / 360;

// Legend swatch: a tinted rect with a thin ink outline (mirrors the slice fill).
function Swatch({ tint }: { tint: string }) {
  const w = 18;
  const h = 12;
  return (
    <Svg width={w} height={h}>
      <Rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill={tint} stroke={Ink} strokeWidth={1} />
    </Svg>
  );
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Just the arc, no wedge — used for the "where you are / where next" rail. */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const a = polar(cx, cy, r, a0);
  const b = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

// A black-and-white pie chart: grayscale-tinted slices separated by thin paper
// gaps, with percentage labels held clear of their leader ticks.
//
// ── WHAT MOVES, AND WHAT DELIBERATELY DOES NOT ──────────────────────────────
//
// §17's rule is that the painted AREA is the cost and that a moving parent
// repaints all of it, and `check-poll` exists because a counter driving React
// state at frame rate dragged a whole <Svg> behind it. So the drawing here is
// INERT: not one SVG property is animated. The entrance is a single transform on
// one wrapper, the ghost is drawn at full size and revealed by a transform on a
// second, and the counting percentage is a native-prop write from the UI thread
// (see ACounter). Selecting a slice is the only thing that re-renders, and a tap
// is not a frame.
export default function SketchPieChart({
  title, subtitle, data, valueMode = 'percent', playToken = 0, animate = true, delay = 0,
  stacked = false,
}: Props) {
  const points = data.filter((d) => d.value > 0);
  const total = points.reduce((a, b) => a + b.value, 0) || 1;

  const R = 50; // pie radius
  const PAD = 50; // room for the outside percentage labels
  const C = R + PAD; // center
  const BOX = C * 2; // square svg canvas
  const cx = C;
  const cy = C;
  const r = R;

  const LABEL_FS = 10.5; // % label font size
  const TICK_LEN = 7; // leader tick length beyond the rim
  const LABEL_GAP = 9; // guaranteed clearance between tick end and the text box
  const SLICE_GAP = 2; // total paper gap (deg) between adjacent slices
  const RAIL = r + 13; // radius of the "where you are / where next" rail

  // Build slice geometry.
  let acc = 0;
  const slices = points.map((p, i) => {
    const frac = p.value / total;
    const start = acc * 360;
    const end = (acc + frac) * 360;
    const mid = (start + end) / 2;
    acc += frac;
    return { ...p, frac, start, end, mid, tint: p.color ?? TINTS[i % TINTS.length] };
  });

  const [reduce, setReduce] = useState(false);
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); });
    return () => { alive = false; };
  }, []);

  // A slice that vanishes (its branch reset to zero) must not leave a selection
  // pointing past the end of the array.
  useEffect(() => {
    if (sel != null && sel >= slices.length) setSel(null);
  }, [slices.length, sel]);

  const enter = useSharedValue(animate ? 0 : 1);
  const ghost = useSharedValue(0);
  const shown = useSharedValue(0);

  useEffect(() => {
    if (!animate || reduce) { enter.value = 1; return; }
    enter.value = 0;
    // "Grow from nothing" — a spring so it overshoots and settles, which is the
    // punch that separates this from a fade.
    enter.value = withDelay(delay, withSpring(1, { damping: 11, stiffness: 140, mass: 0.9 }));
  }, [playToken, animate, reduce, delay, enter]);

  const milestone: Milestone | null = useMemo(() => {
    if (sel == null) return null;
    const els = slices.map((s) => s.element).filter(Boolean) as StatElement[];
    if (els.length !== slices.length) return null;   // chart not wired for taps
    return milestoneFor(els, sel, { mode: 'pie', minGhost: MIN_GHOST });
  }, [sel, slices]);

  // Percentages the detail line reads, before and after the milestone is paid.
  const nowPct = sel != null ? Math.round(slices[sel].frac * 100) : 0;
  const nextPct = useMemo(() => {
    if (sel == null || !milestone || milestone.kind === 'complete') return nowPct;
    const added = milestone.projected - slices[sel].value;
    return Math.round((milestone.projected / (total + added)) * 100);
  }, [sel, milestone, slices, total, nowPct]);

  useEffect(() => {
    const live = sel != null && milestone != null && milestone.kind !== 'complete';
    if (!live) { ghost.value = withTiming(0, { duration: 140 }); return; }
    shown.value = nowPct;
    if (reduce) { ghost.value = 1; shown.value = nextPct; return; }
    ghost.value = 0;
    ghost.value = withSpring(1, { damping: 13, stiffness: 160 });
    shown.value = withTiming(nextPct, { duration: 620, easing: Easing.out(Easing.cubic) });
  }, [sel, milestone, nowPct, nextPct, reduce, ghost, shown]);

  const pieStyle = useAnimatedStyle(() => ({
    opacity: enter.value < 0.02 ? 0 : 1,
    transform: [
      { scale: enter.value },
      { rotate: `${(1 - enter.value) * -25}deg` },
    ],
  }));
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: ghost.value,
    transform: [{ scale: 0.72 + 0.28 * ghost.value }],
  }));
  const countProps = useAnimatedProps(() => ({ text: `${Math.round(shown.value)}%` }) as never);

  const pick = (i: number) => {
    setSel((prev) => (prev === i ? null : i));
    // `keep`, not `impact`. `impact` is "something in the scene is struck" — 950ms
    // and the second-loudest clip in the set, which is a boulder landing, not a
    // reader touching a pie slice. `keep` is the clasp: 130ms at peak 0.40, the
    // shortest quiet mechanical sound the vocabulary has, and a slice latching
    // open is the same gesture as a quote latching into the library.
    cue('keep');
  };

  /**
   * TAPPING THE SLICE ITSELF — NATIVE ONLY, DELIBERATELY.
   *
   * `react-native-svg` handles `onPress` on a <Path> properly on iOS and
   * Android. On react-native-web it forwards the whole responder set
   * (`onStartShouldSetResponder`, `onResponderGrant`, …) to a raw SVG DOM node,
   * and React answers with six "Unknown event handler property … It will be
   * ignored" warnings — so it does not even work there, it just makes noise.
   *
   * Measured: dropping it takes the web console from ten warnings to three, and
   * this repo verifies in a browser (§21). A harness whose baseline is ten
   * warnings is a harness nobody reads.
   *
   * Nothing is lost by gating it: every slice also has a legend row below, which
   * is a real Pressable, has a far bigger hit area than a 4% wedge, and carries
   * the accessibility label. The slice tap is the nicety; the row is the way in.
   */
  const tapSlice = (i: number) =>
    (Platform.OS === 'web' || !slices[i]?.element ? undefined : () => pick(i));

  const selSlice = sel != null ? slices[sel] : null;
  const ghostDeg = milestone && milestone.kind !== 'complete' ? milestone.ghost * 360 : 0;

  return (
    <View style={[styles.card, stacked && styles.cardStacked]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={[styles.pieWrap, { height: BOX }]}>
        <View style={{ width: BOX, height: BOX }}>
          <Animated.View style={[{ width: BOX, height: BOX }, pieStyle]}>
            <Svg width={BOX} height={BOX}>
              {slices.length === 1 ? (
                <Circle
                  cx={cx} cy={cy} r={r} fill={slices[0].tint} stroke={Ink} strokeWidth={1.3}
                  onPress={tapSlice(0)}
                />
              ) : (
                slices.map((sl, i) => {
                  // Inset each slice by a small angle so a paper gap shows between
                  // slices; clamp so a tiny slice never collapses past its center.
                  const pad = Math.min(SLICE_GAP / 2, (sl.end - sl.start) / 4);
                  const a0 = sl.start + pad;
                  const a1 = sl.end - pad;
                  const a = polar(cx, cy, r, a0);
                  const b = polar(cx, cy, r, a1);
                  const large = a1 - a0 > 180 ? 1 : 0;
                  const d = `M ${cx} ${cy} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
                  return (
                    <Path
                      key={i}
                      d={d}
                      fill={sl.tint}
                      stroke={Ink}
                      strokeWidth={sel === i ? 2.6 : 1.3}
                      onPress={tapSlice(i)}
                    />
                  );
                })
              )}

              {/* Percentages OUTSIDE the pie. The label is centered on a point pushed
                  far enough out that the NEAR edge of its bounding box always sits
                  LABEL_GAP beyond where the leader tick stops — so the tick can never
                  poke into the number, at any angle or percentage. */}
              {slices.length > 1 &&
                slices
                  .filter((sl) => sl.frac >= 0.04)
                  .map((sl, i) => {
                    const rad = ((sl.mid - 90) * Math.PI) / 180;
                    const ux = Math.cos(rad);
                    const uy = Math.sin(rad);
                    const rim = polar(cx, cy, r, sl.mid);
                    const tickEnd = polar(cx, cy, r + TICK_LEN, sl.mid);

                    const label = `${Math.round(sl.frac * 100)}%`;
                    // Generous box estimate → err toward extra clearance.
                    const textW = label.length * LABEL_FS * 0.62;
                    const textH = LABEL_FS;
                    // Half-extent of the axis-aligned text box along the radius.
                    const proj = 0.5 * (Math.abs(ux) * textW + Math.abs(uy) * textH);
                    const cLabel = polar(cx, cy, r + TICK_LEN + LABEL_GAP + proj, sl.mid);

                    return (
                      <G key={`lbl-${i}`}>
                        <Line x1={rim.x} y1={rim.y} x2={tickEnd.x} y2={tickEnd.y} stroke={Ink} strokeWidth={1} />
                        <SvgText
                          x={cLabel.x}
                          // Baseline offset centers the digits vertically on cLabel.y
                          // (alignmentBaseline is ignored by react-native-svg on web).
                          y={cLabel.y + LABEL_FS * 0.34}
                          fontSize={LABEL_FS}
                          fontFamily="Inter_700Bold"
                          fill={Ink}
                          textAnchor="middle"
                        >
                          {label}
                        </SvgText>
                      </G>
                    );
                  })}
            </Svg>
          </Animated.View>

          {/* THE GHOST — a rail bent around the rim. A solid arc over the span the
              slice holds now, then a DASHED arc over the span one more push would
              add. Drawn at full size and revealed by a transform, so nothing here
              animates an SVG property. */}
          {selSlice && ghostDeg > 0 && (
            <Animated.View
              style={[{ position: 'absolute', left: 0, top: 0, width: BOX, height: BOX }, ghostStyle]}
              pointerEvents="none"
            >
              <Svg width={BOX} height={BOX}>
                <Path
                  d={arcPath(cx, cy, RAIL, selSlice.start, selSlice.end)}
                  stroke={Ink} strokeWidth={3} fill="none" strokeLinecap="round"
                />
                <Path
                  d={arcPath(cx, cy, RAIL, selSlice.end, selSlice.end + ghostDeg)}
                  stroke={Ink} strokeWidth={3} fill="none" strokeLinecap="round"
                  strokeDasharray="4 4"
                />
              </Svg>
            </Animated.View>
          )}
        </View>
      </View>

      {/* What the tap said. Absent until something is tapped, so the card keeps
          its resting height for a reader who never taps. */}
      {selSlice && milestone && (
        <View style={styles.detail}>
          <View style={styles.detailHead}>
            <Text style={styles.detailLabel} numberOfLines={1}>{selSlice.label.toUpperCase()}</Text>
            {milestone.kind === 'complete' ? null : (
              <>
                <Text style={styles.detailNow}>{nowPct}%</Text>
                <Text style={styles.detailArrow}>→</Text>
                <ACounter
                  editable={false}
                  pointerEvents="none"
                  underlineColorAndroid="transparent"
                  defaultValue={`${nowPct}%`}
                  style={[styles.detailNext, counterStyle]}
                  animatedProps={countProps}
                />
              </>
            )}
          </View>
          <Text style={styles.detailCopy}>{milestone.copy}</Text>
        </View>
      )}

      {/* legend — also the reliable hit target. A 4% slice is a sliver to tap;
          its legend row is a full-width button that says the same thing. */}
      <View style={styles.legend}>
        {slices.map((sl, i) => (
          <Pressable
            key={i}
            onPress={sl.element ? () => pick(i) : undefined}
            style={[styles.legendRow, sel === i && styles.legendRowOn]}
            accessibilityRole={sl.element ? 'button' : undefined}
            accessibilityLabel={sl.element ? `${sl.label}, ${Math.round(sl.frac * 100)} per cent` : undefined}
          >
            <Swatch tint={sl.tint} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {sl.label}
            </Text>
            <Text style={styles.legendValue}>
              {valueMode === 'raw' ? sl.value : `${Math.round(sl.frac * 100)}%`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 4,
    padding: 16,
  },
  // Stacked: size to content, so the tap detail can lengthen the card instead of
  // pushing the legend out through its own border.
  //
  // `flex: 0` is NOT the way to say that. In React Native `flex: n` is shorthand
  // for a flex BASIS of 0 as well as a grow of n, so `flex: 0` gives the card a
  // zero basis and nothing to grow with: both cards collapsed to no height at
  // all and drew their pies on top of each other. The basis has to be said out
  // loud.
  cardStacked: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%' },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink },
  subtitle: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: InkSoft, marginTop: 2 },
  pieWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 14, height: 150 },

  detail: { borderTopWidth: 1, borderTopColor: '#E2E0D8', paddingTop: 10, marginBottom: 12 },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: InkSoft },
  detailNow: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },
  detailArrow: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },
  detailNext: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink, minWidth: 34, textAlign: 'right' },
  detailCopy: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5,
    color: Ink, lineHeight: 19, marginTop: 5,
  },

  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2, borderRadius: 3 },
  legendRowOn: { backgroundColor: '#EFEDE5' },
  legendLabel: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Ink },
  legendValue: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },
});
