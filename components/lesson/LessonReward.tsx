import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';

interface Props {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  onDone: () => void;
}

// Dark reward screen: cream text/marks on a near-black field; the cream button
// keeps dark text. (Names kept so the existing style references map cleanly.)
const Ink = '#F4F0E7';
const InkSoft = '#B7B2A6';
const Paper = '#1A1A1A';

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

  const ran = useRef(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [xpShown, setXpShown] = useState(0);
  const [streakShown, setStreakShown] = useState<number | null>(null);

  // Record completion + update streak exactly once.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (branchSlug) recordLessonComplete(branchSlug);
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    setInfo(registerDailyActivity(today, yesterday));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count the XP up.
  useEffect(() => {
    if (xp <= 0) {
      setXpShown(0);
      return;
    }
    let cur = 0;
    const steps = Math.min(xp, 24);
    const inc = Math.max(1, Math.round(xp / steps));
    const id = setInterval(() => {
      cur = Math.min(xp, cur + inc);
      setXpShown(cur);
      if (cur >= xp) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [xp]);

  // Tick the streak number up if this is the first lesson of the day.
  useEffect(() => {
    if (!info) return;
    if (info.firstOfDay && info.streak > info.prevStreak) {
      setStreakShown(info.prevStreak);
      const t = setTimeout(() => setStreakShown(info.streak), 950);
      return () => clearTimeout(t);
    }
    setStreakShown(info.streak);
  }, [info]);

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
            <Text style={styles.xpNumber}>+{xpShown}</Text>
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
                transition={{ type: 'spring', delay: 500, damping: 12, stiffness: 130 }}
                style={styles.streakBox}
              >
                <Text style={styles.streakHeading}>
                  {info.prevStreak === 0 ? 'Streak started!' : 'Streak extended!'}
                </Text>
                <View style={styles.streakRow}>
                  <SketchIcon name="flame" size={44} color={Ink} />
                  <MotiView
                    key={streakShown ?? info.prevStreak}
                    from={{ scale: 0.4, translateY: -6 }}
                    animate={{ scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 9, stiffness: 160 }}
                  >
                    <Text style={styles.streakNumber}>{streakShown ?? info.prevStreak}</Text>
                  </MotiView>
                </View>
                <Text style={styles.streakLabel}>
                  day{(streakShown ?? info.streak) === 1 ? '' : 's'} in a row
                </Text>
              </MotiView>
            ) : (
              <View style={styles.streakSmallRow}>
                <SketchIcon name="flame" size={22} color={InkSoft} />
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
    fontFamily: 'Caveat_700Bold',
    fontSize: 96,
    color: Ink,
    lineHeight: 104,
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
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 40,
  },
  streakHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakNumber: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 64,
    color: Ink,
    lineHeight: 70,
  },
  streakLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    marginTop: 4,
  },
  streakSmallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 36,
  },
  streakSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
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
