import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing,
} from 'react-native-reanimated';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import RankUpScreen from '@/components/gamification/RankUpScreen';
import RewardLoafer, { pickLine } from '@/components/gamification/RewardLoafer';
import { RANKS, type RankDef } from '@/data/ranks';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { ads } from '@/lib/ads';
import { FREE_DAILY_LESSON_LIMIT } from '@/constants/subscription';
import {
  XP_PER_LESSON_COMPLETION, XP_PER_CORRECT_ANSWER, XP_PER_PERFECT_LESSON,
} from '@/constants/xp';
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
const Rule = '#E4E1D8';
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

// ─────────────────────────────────────────────────────────────────────────────
// THE NUMBER, INKED ON.
//
// It used to arrive on a spring — scale 0.6 → 1 at damping 11, which overshoots and
// wobbles, and a wobbling number reads as a cheap toy rather than as a result. This
// draws it instead: a paper-coloured cover slides off left-to-right, so the digits
// appear the way a stroke appears under a nib, while the value counts up underneath.
// No bounce anywhere in it.
//
// The box is sized by a hidden copy of the FINAL value, so the reveal cannot judder
// as the counter widens from one digit to two.
// ─────────────────────────────────────────────────────────────────────────────
function InkedNumber({ value, delay }: { value: number; delay: number }) {
  const [shown, setShown] = useState(0);
  const [w, setW] = useState(0);
  const wipe = useSharedValue(0);

  useEffect(() => {
    wipe.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    if (value <= 0) return;
    const DURATION = 980;
    const t0 = Date.now() + delay;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / DURATION);
      if (t < 0) return;
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(eased * value));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [value]);

  const cover = useAnimatedStyle(() => ({
    transform: [{ translateX: wipe.value * (w + 10) }],
    opacity: w > 0 ? 1 : 0,
  }));

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View style={styles.xpNumWrap} onLayout={onLayout}>
      <Text style={[styles.xpNumber, styles.xpSizer]}>{value}</Text>
      <Text style={[styles.xpNumber, StyleSheet.absoluteFill as any]} numberOfLines={1}>
        {shown}
      </Text>
      <Animated.View style={[styles.wipeCover, cover]} pointerEvents="none" />
    </View>
  );
}

/** A rule that draws itself on, left to right. */
function DrawnRule({ delay, width = '100%' as const }: { delay: number; width?: any }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  return <Animated.View style={[styles.drawnRule, { width }, st]} />;
}

/** One line of the tally, sliding up as it lands. */
function TallyRow({ label, amount, delay }: { label: string; amount: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }));
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 7 }],
  }));
  return (
    <Animated.View style={[styles.tallyRow, st]}>
      <Text style={styles.tallyLabel}>{label}</Text>
      <View style={styles.tallyLead} />
      <Text style={styles.tallyAmount}>+{amount}</Text>
    </Animated.View>
  );
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
    // Straddle the award. The rank is NO LONGER derived from XP — `rankIndex` is
    // what the user holds, it moves only inside recordLessonComplete, and by one
    // step — so the question is simply whether that index moved.
    const before = useUserDataStore.getState().rankIndex;
    recordLessonComplete(lessonId, xp);
    const st = useUserDataStore.getState();
    if (st.rankIndex > before) {
      setRankUp({
        from: RANKS[before],
        to: RANKS[st.rankIndex],
        next: RANKS[st.rankIndex + 1] ?? null,
        totalXP: st.totalXP,
      });
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

  // The tally, rebuilt from the same constants the runners award from. Shown only
  // when the parts actually add up to what was awarded — a breakdown that doesn't
  // reconcile is worse than no breakdown.
  const perfect = total > 0 && correct >= total;
  const parts: { label: string; amount: number }[] = [
    { label: 'LESSON COMPLETE', amount: XP_PER_LESSON_COMPLETION },
    ...(correct > 0
      ? [{ label: `${correct} ANSWERED RIGHT`, amount: correct * XP_PER_CORRECT_ANSWER }]
      : []),
    ...(perfect ? [{ label: 'NOTHING MISSED', amount: XP_PER_PERFECT_LESSON }] : []),
  ];
  const tallyAdds = parts.reduce((a, p) => a + p.amount, 0) === xp;

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
          <Text style={styles.eyebrow}>LESSON COMPLETE</Text>
          <DrawnRule delay={120} width={54} />

          {/* the number, drawn on */}
          <View style={styles.xpBlock}>
            <InkedNumber value={xp} delay={260} />
            <Text style={styles.xpLabel}>XP EARNED</Text>
          </View>

          {/* …and where it came from */}
          {tallyAdds && (
            <View style={styles.tally}>
              {parts.map((p, k) => (
                <TallyRow key={p.label} label={p.label} amount={p.amount} delay={1000 + k * 190} />
              ))}
            </View>
          )}

          {total > 0 && !tallyAdds && (
            <Text style={styles.correct}>
              {correct} / {total} correct
            </Text>
          )}

          {/* Streak */}
          {info &&
            (info.firstOfDay ? (
              <View style={styles.streakBox}>
                <DrawnRule delay={1500} width={54} />
                <Text style={styles.streakHeading}>
                  {info.prevStreak === 0 ? 'Streak started' : 'Streak extended'}
                </Text>
                <StreakBook value={info.streak} from={info.prevStreak} animate size={100} />
                <View style={styles.weekWrap}>
                  <StreakWeek streak={info.streak} lastLessonDate={lastLessonDate} size={30} />
                </View>
              </View>
            ) : (
              <View style={styles.streakSmallRow}>
                <StreakBook value={info.streak} size={52} />
                <Text style={styles.streakSmall}>{info.streak}-day streak</Text>
              </View>
            ))}
        </View>

        {/* Someone is waiting for you to finish reading. */}
        <View style={styles.loaferRow}>
          <RewardLoafer line={pickLine(`${lessonId}:${info?.streak ?? 0}`)} delay={1700} />
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
    paddingTop: 56,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  eyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 3.4,
    color: InkSoft,
    marginBottom: 10,
  },
  drawnRule: { height: 2, backgroundColor: Ink, transformOrigin: '0% 50%' },

  xpBlock: { alignItems: 'center', marginTop: 10 },
  xpNumWrap: { position: 'relative', overflow: 'hidden' },
  xpNumber: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 88,
    color: Ink,
    lineHeight: 96,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  // An invisible copy of the FINAL value that gives the box its width, so the
  // counter widening from 0 to 70 cannot shift the reveal underneath it.
  xpSizer: { opacity: 0 },
  wipeCover: { position: 'absolute', left: -2, top: 0, bottom: 0, right: -6, backgroundColor: Paper },
  xpLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 3.4,
    marginTop: -4,
  },

  // The tally: a printed receipt for the number above it.
  tally: { alignSelf: 'stretch', marginTop: 16, paddingHorizontal: 10, gap: 8 },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tallyLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, letterSpacing: 1.6, color: InkSoft,
  },
  tallyLead: { flex: 1, height: 1, backgroundColor: Rule },
  tallyAmount: {
    fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink, fontVariant: ['tabular-nums'],
  },

  correct: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Ink, marginTop: 14 },

  streakBox: { alignSelf: 'stretch', alignItems: 'center', marginTop: 18 },
  streakHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 2,
  },
  weekWrap: { alignSelf: 'stretch', paddingHorizontal: 8, marginTop: 6 },
  streakSmallRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  streakSmall: { fontFamily: 'Inter_500Medium', fontSize: 15, color: InkSoft },

  // He leans on the right-hand edge, standing on the line above the button.
  // Room above him so the thought never lands on the streak week beneath it.
  loaferRow: { alignSelf: 'stretch', marginTop: 10, marginBottom: 4 },

  btn: {
    backgroundColor: Ink,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Paper },
});
