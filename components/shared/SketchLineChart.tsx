import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

export interface ChartPoint {
  label: string;
  value: number;
}

interface Props {
  title: string;
  points: ChartPoint[];
  width?: number;
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const SW = Dimensions.get('window').width;

// A hand-drawn framed line chart (matches the "framed picture" sketch look).
export default function SketchLineChart({ title, points, width }: Props) {
  const w = width ?? SW - 40;
  const h = 170;
  const padX = 26;
  const padTop = 28;
  const padBottom = 40;
  const innerH = h - padTop - padBottom;
  const innerW = w - padX * 2;
  const n = points.length;
  const max = Math.max(...points.map((p) => p.value), 1);

  const xs = points.map((_, i) => (n === 1 ? padX + innerW / 2 : padX + (i * innerW) / (n - 1)));
  const ys = points.map((p) => padTop + (1 - p.value / max) * innerH);
  const baselineY = padTop + innerH;

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');

  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: w, height: h }}>
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {/* hand-drawn frame */}
          <Path
            d={`M 6 8 L ${w - 6} 8 L ${w - 6} ${baselineY + 10} L 6 ${baselineY + 10} Z`}
            fill="none"
            stroke={Ink}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* baseline */}
          <Line x1={padX} y1={baselineY} x2={w - padX} y2={baselineY} stroke={InkFaint} strokeWidth={1.5} />
          {/* data line */}
          {n >= 2 && (
            <Path
              d={linePath}
              fill="none"
              stroke={Ink}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* drop lines + markers */}
          {points.map((_, i) => (
            <Line
              key={`d${i}`}
              x1={xs[i]}
              y1={ys[i]}
              x2={xs[i]}
              y2={baselineY}
              stroke={InkFaint}
              strokeWidth={1}
            />
          ))}
          {points.map((_, i) => (
            <Circle key={`c${i}`} cx={xs[i]} cy={ys[i]} r={5} fill={Ink} />
          ))}
        </Svg>

        {/* value above each marker */}
        {points.map((p, i) => (
          <Text key={`v${i}`} style={[styles.value, { left: xs[i] - 30, top: ys[i] - 22, width: 60 }]}>
            {p.value}
          </Text>
        ))}

        {/* category label under each point */}
        {points.map((p, i) => (
          <Text
            key={`l${i}`}
            numberOfLines={1}
            style={[styles.xlabel, { left: xs[i] - 55, top: baselineY + 16, width: 110 }]}
          >
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: Ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  value: {
    position: 'absolute',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Ink,
    textAlign: 'center',
  },
  xlabel: {
    position: 'absolute',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: InkSoft,
    textAlign: 'center',
  },
});
