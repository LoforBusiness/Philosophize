import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';

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
const Paper = '#FAFAF7';
const SW = Dimensions.get('window').width;

const CHART_H = 150; // tallest a bar can grow, in px
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// A bold black-and-white bar chart. Every time the user lands on this screen the
// bars rise slowly from the baseline to their true heights — the ones for areas
// and thinkers they've engaged with most climb the highest, so the relative
// "contrast" between bars settles in front of the user.
export default function SketchBarChart({ title, points, width }: Props) {
  const w = width ?? SW - 40;

  // Bumping runId remounts the bars so their grow-from-zero entrance replays
  // each time the tab regains focus (e.g. after finishing a lesson).
  const [runId, setRunId] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setRunId((r) => r + 1);
    }, [])
  );

  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.title}>{title}</Text>

      <View style={[styles.frame, { width: w }]}>
        <View style={styles.barsRow}>
          {points.map((p, i) => {
            const frac = clamp(p.value / max, 0.12, 1);
            const barPx = Math.max(8, Math.round(frac * CHART_H));
            const solid = i % 2 === 0;
            return (
              <View key={p.label} style={styles.col}>
                <View style={styles.barArea}>
                  <MotiView
                    key={`${runId}-${i}`}
                    from={{ height: 0 }}
                    animate={{ height: barPx }}
                    transition={{
                      type: 'timing',
                      duration: 1200,
                      delay: 150 + i * 160,
                      easing: Easing.out(Easing.cubic),
                    }}
                    style={[
                      styles.bar,
                      solid
                        ? { backgroundColor: Ink }
                        : { backgroundColor: Paper, borderWidth: 2, borderColor: Ink },
                    ]}
                  >
                    <Text style={styles.barValue}>{p.value}</Text>
                  </MotiView>
                </View>
              </View>
            );
          })}
        </View>

        {/* floor */}
        <View style={styles.baseline} />

        {/* category labels — sit directly under each bar */}
        <View style={styles.labelsRow}>
          {points.map((p) => (
            <View key={p.label} style={styles.col}>
              <Text numberOfLines={1} style={styles.xlabel}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>
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
  frame: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
    paddingTop: 24,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_H,
  },
  col: { flex: 1, alignItems: 'center' },
  barArea: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '56%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barValue: {
    position: 'absolute',
    top: -20,
    left: -10,
    right: -10,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Ink,
  },
  baseline: {
    height: 2,
    backgroundColor: Ink,
    marginTop: -1,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  xlabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: InkSoft,
    textAlign: 'center',
  },
});
