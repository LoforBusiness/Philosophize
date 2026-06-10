import { View, Text, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { weekDays } from '@/lib/utils/week';

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const INK_SOFT = '#6B6B6B';
const FAINT = '#CFCDC6';

// The current week as a row of day circles — a weekday label above a ring that
// fills with ink and a check the day it is completed. Today, if not yet done,
// is ringed in solid ink. Pure black-and-white, matching the streak flame.
interface Props {
  streak: number;
  lastLessonDate: string | null;
  size?: number; // diameter of each day circle
}

export default function StreakWeek({ streak, lastLessonDate, size = 32 }: Props) {
  const days = weekDays(streak, lastLessonDate);
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const done = d.state === 'done';
        const today = d.state === 'today';
        return (
          <View key={i} style={styles.col}>
            <Text style={[styles.label, (done || today) && styles.labelActive]}>{d.label}</Text>
            <View
              style={[
                styles.dot,
                { width: size, height: size, borderRadius: size / 2 },
                done && styles.dotDone,
                today && styles.dotToday,
              ]}
            >
              {done ? <SketchIcon name="check" size={Math.round(size * 0.62)} color={PAPER} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  col: { alignItems: 'center', gap: 7 },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    color: FAINT,
  },
  labelActive: { color: INK_SOFT },
  dot: {
    borderWidth: 1.5,
    borderColor: FAINT,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: INK, borderColor: INK },
  dotToday: { borderColor: INK, borderWidth: 2 },
});
