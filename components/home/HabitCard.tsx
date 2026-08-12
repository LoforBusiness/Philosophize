import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import StreakSheet from '@/components/gamification/StreakSheet';
import { INK, MID } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THIS WEEK — and NOT how close you are to the end.
//
// What stood here was six columns filling toward each branch's total: "23 / 192".
// That number has an expiry date built into it. Lessons are still being written,
// so every batch added pushes the denominator up and makes the reader's bar
// SHORTER for doing nothing wrong. A progress bar against a moving target
// punishes the reader for the author's productivity, which is the opposite of
// what a home screen should do.
//
// So: no denominator anywhere on this card. A week of days either happened or
// did not — that is true no matter how much content exists — and the two totals
// underneath only ever go up.
//
// It also ABSORBS the bare streak row that used to sit below it. The streak book
// and the day count were already on Home twice over once this card existed, and
// folding them in gives back about 100dp — which is what the home stickman needs
// to have a band to walk in at all (see StickmanStroll: below a 37dp band his
// routine stretches from 19s to 39s).
// ─────────────────────────────────────────────────────────────────────────────

export default function HabitCard({
  streak,
  lastLessonDate,
  lessons,
  xp,
  restBridging,
  style,
}: {
  streak: number;
  lastLessonDate: string | null;
  lessons: number;
  xp: number;
  restBridging: boolean;
  style?: object;
}) {
  const [streakOpen, setStreakOpen] = useState(false);
  return (
    <View style={[styles.card, style]}>
      {/* The whole head opens the month. The streak is the thing readers come
          back to check, and making them hunt for it in Settings would waste the
          one habit the app is trying to build. */}
      <Pressable style={styles.head} onPress={() => setStreakOpen(true)} hitSlop={6}>
        <StreakBook value={streak} size={40} />
        <View style={styles.headText}>
          <Text style={styles.streak}>
            {streak} DAY{streak === 1 ? '' : 'S'} RUNNING
          </Text>
          {/* Only when a rest day is actually holding it up. It says the streak is
              safe WITHOUT saying it has been spent, because it has not: the
              deduction happens when they finish something today. */}
          <Text style={styles.sub} numberOfLines={2}>
            {restBridging
              ? 'A day of rest is holding it — finish anything today.'
              : 'Every day you turn up is a day here.'}
          </Text>
        </View>
      </Pressable>

      <StreakSheet visible={streakOpen} onClose={() => setStreakOpen(false)} />

      <View style={styles.week}>
        <StreakWeek streak={streak} lastLessonDate={lastLessonDate} size={28} />
      </View>

      {/* Two odometers. No totals to be a fraction of — these only ever climb. */}
      <View style={styles.foot}>
        <Text style={styles.tally}>
          <Text style={styles.tallyNum}>{lessons}</Text>
          <Text style={styles.tallyWord}>  {lessons === 1 ? 'LESSON' : 'LESSONS'}</Text>
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.tally}>
          <Text style={styles.tallyNum}>{xp.toLocaleString()}</Text>
          <Text style={styles.tallyWord}>  XP</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    backgroundColor: '#FAFAF7',
    paddingTop: 12,
    paddingBottom: 13,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headText: { flex: 1 },
  streak: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: INK,
    letterSpacing: 1.6,
    includeFontPadding: false,
  },
  sub: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: MID,
    marginTop: 3,
    lineHeight: 16,
  },
  week: { marginTop: 13 },
  foot: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 9,
    marginTop: 13,
  },
  tally: { includeFontPadding: false },
  tallyNum: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: INK },
  tallyWord: { fontFamily: 'Inter_500Medium', fontSize: 9, color: MID, letterSpacing: 1.5 },
  dot: { fontFamily: 'Inter_500Medium', fontSize: 11, color: MID },
});
