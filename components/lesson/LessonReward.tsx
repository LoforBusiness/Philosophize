import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import { useUserDataStore } from '@/stores/userDataStore';
import { track } from '@/lib/posthog';

interface Props {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  onDone: () => void;
}

// Light reward screen: ink text/marks on paper; the ink button keeps paper text.
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Paper = '#FAFAF7';

function dateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface DayInfo {
  firstOfDay: boolean;
  streak: number;
  prevStreak: number;
}

export default function LessonReward({ xp, correct, total, branchSlug, onDone }: Props) {
  const recordLessonComplete = useUserDataStore((s) => s.recordLessonComplete);
  const registerDailyActivity = useUserDataStore((s) => s.registerDailyActivity);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);

  const ran = useRef(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [xpShown, setXpShown] = useState(0);

  // Record completion + update streak exactly once.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (branchSlug) recordLessonComplete(branchSlug, xp);
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    const dayInfo = registerDailyActivity(today, yesterday);
    setInfo(dayInfo);
    track('lesson_completed', {
      branch_slug: branchSlug,
      xp,
      correct,
      total,
      new_streak: dayInfo.streak,
      streak_increased: dayInfo.firstOfDay,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count the XP up from zero, smoothly (eased over ~1s, ~60fps).
  useEffect(() => {
    setXpShown(0);
    if (xp <= 0) return;
    const DURATION = 1000;
    const t0 = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — decelerates as it lands
      setXpShown(Math.round(eased * xp));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [xp]);

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={onDone}>
      <View style={styles.root}>
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <Text style={styles.title}>Lesson Complete!</Text>
          </MotiView>

          {/* XP */}
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 200, damping: 11, stiffness: 130 }}
            style={styles.xpBlock}
          >
            <Text style={styles.xpNumber}>{xpShown}</Text>
            <Text style={styles.xpLabel}>XP EARNED</Text>
          </MotiView>

          {total > 0 && (
            <Text style={styles.correct}>
              {correct} / {total} correct
            </Text>
          )}

          {/* Streak */}
          {info &&
            (info.firstOfDay ? (
              <MotiView
                from={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 450, damping: 13, stiffness: 130 }}
                style={styles.streakBox}
              >
                <Text style={styles.streakHeading}>
                  {info.prevStreak === 0 ? 'Streak started!' : 'Streak extended!'}
                </Text>
                <StreakBook value={info.streak} from={info.prevStreak} animate size={150} />
                <View style={styles.weekWrap}>
                  <StreakWeek streak={info.streak} lastLessonDate={lastLessonDate} size={32} />
                </View>
                <Text style={styles.streakSub}>Build a streak, one day at a time</Text>
              </MotiView>
            ) : (
              <View style={styles.streakSmallRow}>
                <StreakBook value={info.streak} size={58} />
                <Text style={styles.streakSmall}>{info.streak}-day streak</Text>
              </View>
            ))}
        </View>

        <Pressable
          onPress={onDone}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.btnText}>Continue →</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Paper,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 60,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: Ink,
    textAlign: 'center',
    marginBottom: 28,
  },
  xpBlock: { alignItems: 'center', marginBottom: 16 },
  xpNumber: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 84,
    color: Ink,
    lineHeight: 92,
  },
  xpLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: InkSoft,
    letterSpacing: 3,
    marginTop: -6,
  },
  correct: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Ink,
    marginTop: 4,
  },
  streakBox: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 26,
  },
  streakHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: InkSoft,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  weekWrap: { alignSelf: 'stretch', paddingHorizontal: 8, marginTop: 6 },
  streakSub: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    color: InkSoft,
    marginTop: 20,
    textAlign: 'center',
  },
  streakSmallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 26,
  },
  streakSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: InkSoft,
  },
  btn: {
    backgroundColor: Ink,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Paper },
});
