import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';

export interface PiePoint {
  label: string;
  value: number;
  // Optional explicit slice fill. When set, it overrides the index-based tint —
  // used so a branch keeps the SAME colour across charts even if slices are
  // filtered/reordered. Omitted → falls back to the grayscale ramp by index.
  color?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  data: PiePoint[];
  valueMode?: 'raw' | 'percent';
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

// Warm-gray tint ramp (dark → light). Assigned per slice by index so a slice's
// fill and its legend swatch always match. The range is deliberately compressed
// toward ink: even the lightest step (#BEBBB0) stays clearly darker than the
// #FAFAF7 paper, so no slice washes out, while ~32-luminance steps keep
// neighbouring slices distinguishable across the thin paper gap between them.
export const TINTS = ['#1A1A1A', '#3D3B38', '#5E5B55', '#7E7B72', '#9E9B90', '#BEBBB0'];

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

// A black-and-white pie chart: grayscale-tinted slices separated by thin paper
// gaps, with percentage labels held clear of their leader ticks.
export default function SketchPieChart({ title, subtitle, data, valueMode = 'percent' }: Props) {
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={[styles.pieWrap, { height: BOX }]}>
        <Svg width={BOX} height={BOX}>
          {slices.length === 1 ? (
            <Circle cx={cx} cy={cy} r={r} fill={slices[0].tint} stroke={Ink} strokeWidth={1.3} />
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
              return <Path key={i} d={d} fill={sl.tint} stroke={Ink} strokeWidth={1.3} />;
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
      </View>

      {/* legend */}
      <View style={styles.legend}>
        {slices.map((sl, i) => (
          <View key={i} style={styles.legendRow}>
            <Swatch tint={sl.tint} />
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
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendLabel: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Ink },
  legendValue: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },
});
