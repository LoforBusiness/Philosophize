import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import RankUpScreen from '@/components/gamification/RankUpScreen';
import { rankForXP, type RankDef } from '@/data/ranks';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { ads } from '@/lib/ads';
import { FREE_DAILY_LESSON_LIMIT } from '@/constants/subscription';
import { track } from '@/lib/posthog';
import { refreshQuoteWidget } from '@/lib/widget/render';

interface Props {
  xp: number;
  correct: number;
  total: number;
  branchSlug: string | null;
  lessonId: string;
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

export default function LessonReward({ xp, correct, total, branchSlug, lessonId, onDone }: Props) {
  const recordLessonComplete = useUserDataStore((s) => s.recordLessonComplete);
  const registerDailyActivity = useUserDataStore((s) => s.registerDailyActivity);
  const bumpDailyLessons = useUserDataStore((s) => s.bumpDailyLessons);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const dailyLessonCount = useUserDataStore((s) => s.dailyLessonCount);
  const dailyLessonDate = useUserDataStore((s) => s.dailyLessonDate);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const openPaywall = useUIStore((s) => s.openPaywall);

  const ran = useRef(false);
  const [info, setInfo] = useState<DayInfo | null>(null);
  const [xpShown, setXpShown] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  // A rank-up takes the screen FIRST, before XP and the streak — it is the rarest
  // thing that can happen on a completion and it used to pass in total silence.
  // `null` until the completion effect has run, so the reward never paints for a
  // frame before we know whether it has been pre-empted.
  const [phase, setPhase] = useState<'pending' | 'rankup' | 'reward'>('pending');
  const [rankUp, setRankUp] = useState<{ from: RankDef; to: RankDef; next: RankDef | null; totalXP: number } | null>(null);

  // Has this free user now used up today's lesson allowance? (bumpDailyLessons
  // runs on mount, so the count already reflects the just-finished lesson.)
  const usedToday = dailyLessonDate === dateStr(new Date()) ? dailyLessonCount : 0;
  const atLimit = !isPro && usedToday >= FREE_DAILY_LESSON_LIMIT;

  // Continue order for FREE users: reward screen → interstitial ad → then, if
  // they've hit the daily cap, the Scholar's Pass slides up as a dismissible
  // option over the lesson list (never a blocking gate). Subscribers and free
  // users with lessons left just return. showInterstitial never throws and
  // resolves even with no ad ready, so navigation is never blocked.
  const handleContinue = async () => {
    if (advancing) return;
    if (isPro) {
      onDone();
      return;
    }
    setAdvancing(true);
    try {
      await ads.showInterstitial();
    } catch {}
    onDone(); // close the reward + leave the lesson, back to the lesson list
    if (atLimit) openPaywall(); // …then float the optional paywall up over it
  };

  // Record completion + update streak exactly once.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // Straddle the XP award: recordLessonComplete is what moves totalXP, so the
    // rank either side of it is the whole question. Read the store directly —
    // subscribing to totalXP here would re-render this screen mid-count-up.
    const before = rankForXP(useUserDataStore.getState().totalXP);
    recordLessonComplete(lessonId, xp);
    const afterXP = useUserDataStore.getState().totalXP;
    const after = rankForXP(afterXP);
    if (after.index > before.index) {
      setRankUp({ from: before.current, to: after.current, next: after.next, totalXP: afterXP });
      setPhase('rankup');
    } else {
      setPhase('reward');
    }
    const today = dateStr(new Date());
    const yesterday = dateStr(new Date(Date.now() - 86_400_000));
    bumpDailyLessons(today); // count this completion toward the free daily allowance
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
    // The home-screen widget shows the day streak — keep it current (best-effort).
    refreshQuoteWidget();
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

  // One frame of bare paper while the completion effect decides which screen this
  // is. Painting the reward first would flash XP behind a rank-up.
  if (phase === 'pending') {
    return (
      <Modal visible animationType="fade" transparent={false} onRequestClose={onDone}>
        <View style={styles.root} />
      </Modal>
    );
  }

  if (phase === 'rankup' && rankUp) {
    return (
      <Modal visible animationType="fade" transparent={false} onRequestClose={onDone}>
        <RankUpScreen
          from={rankUp.from}
          to={rankUp.to}
          next={rankUp.next}
          totalXP={rankUp.totalXP}
          onDone={() => setPhase('reward')}
        />
      </Modal>
    );
  }

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
          onPress={handleContinue}
          disabled={advancing}
          style={({ pressed }) => [styles.btn, (pressed || advancing) && { opacity: 0.8 }]}
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
