import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect, Defs, Pattern, G, Text as SvgText } from 'react-native-svg';

export interface PiePoint {
  label: string;
  value: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data: PiePoint[];
  valueMode?: 'raw' | 'percent';
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

type HatchStyle = 'horizontal' | 'diagonal' | 'vertical' | 'cross' | 'solid' | 'dots';
const STYLES: HatchStyle[] = ['horizontal', 'diagonal', 'vertical', 'cross', 'solid', 'dots'];

// 6×6 repeating tile for each fill style.
function PatternTile({ id, style }: { id: string; style: HatchStyle }) {
  return (
    <Pattern id={id} patternUnits="userSpaceOnUse" width={6} height={6}>
      <Rect x={0} y={0} width={6} height={6} fill="#FAFAF7" />
      {style === 'horizontal' && <Line x1={0} y1={3} x2={6} y2={3} stroke={Ink} strokeWidth={1.2} />}
      {style === 'vertical' && <Line x1={3} y1={0} x2={3} y2={6} stroke={Ink} strokeWidth={1.2} />}
      {style === 'diagonal' && <Line x1={0} y1={6} x2={6} y2={0} stroke={Ink} strokeWidth={1.2} />}
      {style === 'cross' && (
        <>
          <Line x1={0} y1={3} x2={6} y2={3} stroke={Ink} strokeWidth={1} />
          <Line x1={3} y1={0} x2={3} y2={6} stroke={Ink} strokeWidth={1} />
        </>
      )}
      {style === 'solid' && <Rect x={0} y={0} width={6} height={6} fill={Ink} />}
      {style === 'dots' && <Circle cx={3} cy={3} r={1} fill={Ink} />}
    </Pattern>
  );
}

// Tiny legend swatch drawn with explicit lines (no shared pattern ids).
function Swatch({ style }: { style: HatchStyle }) {
  const w = 18;
  const h = 12;
  return (
    <Svg width={w} height={h}>
      <Rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill="#FAFAF7" stroke={Ink} strokeWidth={1} />
      {style === 'horizontal' &&
        [3, 6, 9].map((y) => <Line key={y} x1={1} y1={y} x2={w - 1} y2={y} stroke={Ink} strokeWidth={1} />)}
      {style === 'vertical' &&
        [4, 9, 14].map((x) => <Line key={x} x1={x} y1={1} x2={x} y2={h - 1} stroke={Ink} strokeWidth={1} />)}
      {style === 'diagonal' &&
        [-6, 0, 6, 12].map((o) => (
          <Line key={o} x1={o} y1={h} x2={o + h} y2={0} stroke={Ink} strokeWidth={1} />
        ))}
      {style === 'cross' && (
        <>
          {[4, 9, 14].map((x) => <Line key={`v${x}`} x1={x} y1={1} x2={x} y2={h - 1} stroke={Ink} strokeWidth={0.8} />)}
          {[4, 8].map((y) => <Line key={`h${y}`} x1={1} y1={y} x2={w - 1} y2={y} stroke={Ink} strokeWidth={0.8} />)}
        </>
      )}
      {style === 'solid' && <Rect x={1} y={1} width={w - 2} height={h - 2} fill={Ink} />}
      {style === 'dots' &&
        [4, 9, 14].map((x) => <Circle key={x} cx={x} cy={6} r={1.2} fill={Ink} />)}
    </Svg>
  );
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// A black-and-white pie chart with hatched slices and a swatch legend.
export default function SketchPieChart({ title, subtitle, data, valueMode = 'percent' }: Props) {
  const points = data.filter((d) => d.value > 0);
  const total = points.reduce((a, b) => a + b.value, 0) || 1;
  const uid = 'pie-' + title.replace(/[^a-z0-9]/gi, '').toLowerCase();

  const R = 50;            // pie radius
  const PAD = 50;          // room for the outside percentage labels
  const C = R + PAD;       // center
  const BOX = C * 2;       // square svg canvas
  const cx = C;
  const cy = C;
  const r = R;
  // % label distance from center. Kept well clear of the leader-tick end
  // (r + 10 below): the label is vertically centred on this point, so its
  // ~half-height must not overlap where the tick stops, or the line pokes
  // into the number (worst for the near-vertical top/bottom labels).
  const rLabel = R + 18;
  const LABEL_FS = 10.5;

  // Build slice geometry.
  let acc = 0;
  const slices = points.map((p, i) => {
    const frac = p.value / total;
    const start = acc * 360;
    const end = (acc + frac) * 360;
    const mid = (start + end) / 2;
    acc += frac;
    return { ...p, frac, start, end, mid, style: STYLES[i % STYLES.length] };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={[styles.pieWrap, { height: BOX }]}>
        <Svg width={BOX} height={BOX}>
          <Defs>
            {STYLES.map((st) => (
              <PatternTile key={st} id={`${uid}-${st}`} style={st} />
            ))}
          </Defs>

          {slices.length === 1 ? (
            <Circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-${slices[0].style})`} stroke={Ink} strokeWidth={1.5} />
          ) : (
            slices.map((sl, i) => {
              const a = polar(cx, cy, r, sl.start);
              const b = polar(cx, cy, r, sl.end);
              const large = sl.frac > 0.5 ? 1 : 0;
              const d = `M ${cx} ${cy} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
              return <Path key={i} d={d} fill={`url(#${uid}-${sl.style})`} stroke={Ink} strokeWidth={1.5} />;
            })
          )}

          {/* Percentages OUTSIDE the pie, anchored on each slice's mid-angle with
              a short leader tick. Drawn in SVG space so they sit correctly
              regardless of how the chart is centered in its card. */}
          {slices.length > 1 &&
            slices
              .filter((sl) => sl.frac >= 0.04)
              .map((sl, i) => {
                const edge = polar(cx, cy, r, sl.mid);
                const tick = polar(cx, cy, r + 10, sl.mid);
                const lp = polar(cx, cy, rLabel, sl.mid);
                const anchor = lp.x > cx + 3 ? 'start' : lp.x < cx - 3 ? 'end' : 'middle';
                return (
                  <G key={`lbl-${i}`}>
                    <Line x1={edge.x} y1={edge.y} x2={tick.x} y2={tick.y} stroke={Ink} strokeWidth={1} />
                    <SvgText
                      x={lp.x}
                      // Center vertically on lp.y manually — `alignmentBaseline`
                      // is ignored by react-native-svg on web, which pushed the
                      // bottom labels out of the chart box.
                      y={lp.y + LABEL_FS * 0.34}
                      fontSize={LABEL_FS}
                      fontFamily="Inter_700Bold"
                      fill={Ink}
                      textAnchor={anchor}
                    >
                      {Math.round(sl.frac * 100)}%
                    </SvgText>
                  </G>
                );
              })}
        </Svg>
      </View>

      {/* legend */}
      <View style={styles.legend}>
        {slices.map((sl, i) => (
          <View key={i} style={styles.legendRow}>
            <Swatch style={sl.style} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {sl.label}
            </Text>
            <Text style={styles.legendValue}>
              {valueMode === 'raw' ? sl.value : `${Math.round(sl.frac * 100)}%`}
            </Text>
          </View>
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
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink },
  subtitle: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: InkSoft, marginTop: 2 },
  pieWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 14, marginBottom: 14, height: 150 },
  sliceLabel: {
    position: 'absolute',
    width: 32,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: Ink,
  },
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendLabel: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Ink },
  legendValue: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },
});
