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
//
// ── IT CAN BE PRINTED THE OTHER WAY UP ──────────────────────────────────────
//
// The four colours used to be file constants, which meant this row could only
// ever live on paper: a completed day is a SOLID INK disc with a paper check cut
// out of it, so on a dark panel the discs vanish into the ground and the checks
// are the only thing left — the week would read as four floating ticks.
//
// `tint` is the mark and `ground` is the surface it is drawn on, so inverting
// the pair inverts the whole row correctly, including the check inside the
// filled disc. Every default is the value this file already had, so the two
// existing call sites are unchanged to the pixel.
interface Props {
  streak: number;
  lastLessonDate: string | null;
  size?: number; // diameter of each day circle
  /** The mark: a completed day's fill, and today's ring. */
  tint?: string;
  /** The surface beneath — an unfilled day's fill, and the check drawn on `tint`. */
  ground?: string;
  /** Unearned rings and their labels. */
  faint?: string;
  /** Labels for days that are earned or current. */
  soft?: string;
}

export default function StreakWeek({
  streak,
  lastLessonDate,
  size = 32,
  tint = INK,
  ground = PAPER,
  faint = FAINT,
  soft = INK_SOFT,
}: Props) {
  const days = weekDays(streak, lastLessonDate);
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const done = d.state === 'done';
        const today = d.state === 'today';
        return (
          <View key={i} style={styles.col}>
            <Text style={[styles.label, { color: done || today ? soft : faint }]}>{d.label}</Text>
            <View
              style={[
                styles.dot,
                { width: size, height: size, borderRadius: size / 2 },
                { backgroundColor: ground, borderColor: faint },
                done && { backgroundColor: tint, borderColor: tint },
                today && { borderColor: tint, borderWidth: 2 },
              ]}
            >
              {done ? <SketchIcon name="check" size={Math.round(size * 0.62)} color={ground} /> : null}
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
  },
  dot: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
