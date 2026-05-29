import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export interface PathNode {
  id: string;
  label: string;
  meta?: string;
  onPress: () => void;
  active?: boolean; // highlighted (e.g. selected)
}

interface Props {
  nodes: PathNode[];
  width?: number;
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

const SLOT = 132; // vertical space per node
const TOP = 40;

// A winding hand-drawn path with lesson/path nodes hanging off alternating sides.
export default function LessonPath({ nodes, width }: Props) {
  const W = width ?? Dimensions.get('window').width - 40;
  const centerX = W / 2;
  const amp = Math.min(W * 0.26, 96);

  const points = nodes.map((_, i) => ({
    x: i % 2 === 0 ? centerX - amp : centerX + amp,
    y: TOP + i * SLOT,
  }));

  const totalH = TOP + (nodes.length - 1) * SLOT + TOP + 30;

  // Smooth S-curve through the top, every node, and the bottom.
  const pts = [{ x: centerX, y: 0 }, ...points, { x: centerX, y: totalH }];
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x.toFixed(1)} ${midY.toFixed(1)}, ${cur.x.toFixed(1)} ${midY.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
  }

  return (
    <View style={{ width: W, height: totalH, alignSelf: 'center' }}>
      <Svg width={W} height={totalH} style={StyleSheet.absoluteFill}>
        <Path d={d} fill="none" stroke={Ink} strokeWidth={2} strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={7}
            fill={nodes[i].active ? Ink : '#FAFAF7'}
            stroke={Ink}
            strokeWidth={2}
          />
        ))}
      </Svg>

      {nodes.map((n, i) => {
        const p = points[i];
        const left = i % 2 === 0;
        const boxStyle = left
          ? { left: 0, width: p.x - 20, alignItems: 'flex-end' as const }
          : { left: p.x + 20, right: 0, alignItems: 'flex-start' as const };
        return (
          <Pressable
            key={n.id}
            onPress={n.onPress}
            style={({ pressed }) => [
              styles.nodeBox,
              boxStyle,
              { top: p.y - 24 },
              pressed && { opacity: 0.55 },
            ]}
          >
            <Text
              style={[styles.label, { textAlign: left ? 'right' : 'left' }, n.active && { opacity: 0.5 }]}
            >
              {n.label}
            </Text>
            {n.meta ? (
              <Text style={[styles.meta, { textAlign: left ? 'right' : 'left' }]}>{n.meta}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nodeBox: {
    position: 'absolute',
  },
  label: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: Ink,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: InkSoft,
    marginTop: 3,
  },
});
