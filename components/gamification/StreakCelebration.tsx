import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ramp, rampFace } from '@/components/shared/tone';
import { PATINA, PATINA_DEEP, PATINA_SOFT, SLATE, nextMilestone, STREAK_MILESTONES } from '@/constants/streak';
import { buildWeek } from '@/lib/utils/streakCalendar';

const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const FAINT = '#E4E1D8';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK MOMENT, after a lesson.
//
// This is the single most valuable animation in the app: it is the one that
// decides whether somebody comes back tomorrow. It is built to a shape borrowed
// from Duolingo, and the shape matters more than the polish:
//
//   1. THE SEAL IS STRUCK  — overshoots to 1.18 and settles. A thing that arrives
//                           at its final size directly reads as a page element;
//                           a thing that overshoots reads as an event.
//   2. THE NUMBER COUNTS  — from the OLD streak to the new one, not from zero.
//                           Counting from zero is a slot machine. Counting from
//                           yesterday's number is a story about the reader.
//   3. THE DAY LANDS      — the week strip fills today's disc LAST, after the
//                           number has settled, so the eye has somewhere to go
//                           and the sequence ends on "and here is the day you
//                           just did".
//
// The order is the whole design. Playing them together is the same information
// and a fraction of the feeling.
//
// ── WHY THE COUNT IS setState AND NOT A WORKLET ─────────────────────────────
//
// Reanimated cannot drive a Text's CONTENT from the UI thread — only its style.
// A count-up therefore has to cross to JS anyway, so it is an interval rather
// than a shared value pretending. It runs for at most ~700ms and ticks at most
// a dozen times, which is nothing; the seal and the discs, which animate every
// frame, stay on the UI thread where they belong.
// ─────────────────────────────────────────────────────────────────────────────

// ── THE FLAME IS GONE, AND SO IS THE FIRE ──────────────────────────
//
// This drew a literal seal in two paths, and it was right while the streak was
// an EMBER. The streak is a verdigris now — the green a bronze takes from being
// kept (constants/streak.ts) — and a teal seal is a metaphor arguing with
// itself. Nothing needed inventing to replace it: the calendar strikes a token
// for every day of the run, and the thing to hold up at the end of a lesson is
// THAT token, struck large, with the count beside it.
//
// It also inherits the calendar's milestone rule for free: a landmark day wears
// a COLLAR, the same ring a capstone rank pin and a tier-V badge wear (§7), so
// the reward screen and the grid agree about which days were the big ones
// instead of each having a private opinion.
const METAL = ramp(PATINA);
const FACE = rampFace(METAL);

const STRIKE_AT = 260;   // ms — the seal is struck
const COUNT_AT = 620;    // …then the number starts moving
const COUNT_MS = 680;
const WEEK_AT = 1180;    // …and the day lands last

interface Props {
  streak: number;
  prevStreak: number;
  restSpent: number;
  activeDays: readonly string[];
  restDays: readonly string[];
  /** Days a rest day is ABOUT to cover — see the union note below. */
  pendingRest?: readonly string[];
  today: string;
  since: string | null;
}

export default function StreakCelebration({
  streak, prevStreak, restSpent, activeDays, restDays, pendingRest, today, since,
}: Props) {
  const [shown, setShown] = useState(prevStreak);
  const seal = useSharedValue(0);

  useEffect(() => {
    seal.value = withDelay(
      STRIKE_AT,
      // Overshoot and settle. Easing.out on the rise so it snaps in, a slower
      // settle back so it does not look like a bounce toy.
      withSequence(
        withTiming(1.18, { duration: 240, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
      ),
    );
  }, [seal]);

  useEffect(() => {
    if (streak === prevStreak) { setShown(streak); return; }
    const steps = Math.min(streak - prevStreak, 12);
    if (steps <= 0) { setShown(streak); return; }
    const every = COUNT_MS / steps;
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        setShown(prevStreak + Math.round(((streak - prevStreak) * i) / steps));
        if (i >= steps) clearInterval(id);
      }, every);
    }, COUNT_AT);
    return () => clearTimeout(start);
  }, [streak, prevStreak]);

  const sealStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, seal.value * 2),
    transform: [{ scale: seal.value }],
  }));

  // TODAY IS UNIONED IN, and this is not a nicety.
  //
  // The reward screen writes NOTHING until Continue is pressed — everything on it
  // is a preview computed from the store without touching it (see the `commit`
  // comment in LessonReward). So `activeDays` does not contain today yet, and a
  // week built straight from the store would land today's disc as an empty ring
  // at the exact instant the screen is congratulating the reader for filling it.
  // This component's job is to show the state AFTER this lesson counts, so it
  // says so.
  const week = buildWeek({
    active: new Set([...activeDays, today]),
    rest: new Set([...restDays, ...(pendingRest ?? [])]),
    today,
    since,
  });
  const hitMilestone = STREAK_MILESTONES.includes(streak as 7 | 30 | 100 | 365);
  const next = nextMilestone(streak);

  return (
    <View style={styles.wrap}>
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 260 }}
      >
        <Text style={styles.heading}>
          {restSpent > 0 ? 'STREAK KEPT' : prevStreak === 0 ? 'STREAK STARTED' : 'STREAK EXTENDED'}
        </Text>
      </MotiView>

      <View style={styles.sealRow}>
        <Animated.View style={[styles.seal, sealStyle]}>
          {/* The collar, outside the disc — a landmark day only. */}
          {hitMilestone ? <View pointerEvents="none" style={styles.sealCollar} /> : null}
          <LinearGradient
            colors={[FACE[0][1], FACE[1][1], FACE[2][1]]}
            locations={[0, 0.52, 1]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.sealFace}
          />
        </Animated.View>
        <Text style={styles.count}>{shown}</Text>
      </View>

      <Text style={styles.dayWord}>{shown === 1 ? 'DAY' : 'DAYS'}</Text>

      {restSpent > 0 && (
        <Text style={styles.restNote}>
          {restSpent === 1 ? 'A day of rest covered yesterday.' : `${restSpent} rest days covered the gap.`}
        </Text>
      )}

      {/* The week. Today's disc is the LAST thing to move on the whole screen. */}
      <View style={styles.week}>
        {week.map((d, i) => {
          const isToday = d.key === today;
          const lit = d.state === 'done' || d.state === 'rest';
          return (
            <View key={i} style={styles.dayCol}>
              <Text style={[styles.dayLabel, lit && styles.dayLabelOn]}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </Text>
              <MotiView
                from={{ scale: isToday ? 0.4 : 1, opacity: isToday ? 0 : 1 }}
                animate={{ scale: 1, opacity: 1 }}
                // Two distinct transitions rather than one with conditional
                // fields: Moti's type is a union per `type`, so mixing spring
                // damping into a timing transition does not typecheck — and it
                // would silently do nothing if it did.
                transition={
                  isToday
                    ? { type: 'spring', delay: WEEK_AT, damping: 11, stiffness: 190 }
                    : { type: 'timing', duration: 1 }
                }
                style={[
                  styles.disc,
                  d.state === 'done' && styles.done,
                  d.state === 'rest' && styles.rested,
                  d.state === 'missed' && styles.missed,
                  d.state === 'future' && styles.future,
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* A landmark, or how far to the next one. Duolingo's "keep going" line,
          and the reason a 6-day streak feels like it is worth a seventh. */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 320, delay: WEEK_AT + 260 }}
      >
        {hitMilestone ? (
          <Text style={styles.milestone}>{streak} DAYS · A LANDMARK</Text>
        ) : next ? (
          <Text style={styles.toGo}>
            {next - streak} {next - streak === 1 ? 'day' : 'days'} to {next}
          </Text>
        ) : null}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 22 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 10.5, color: INK_SOFT, letterSpacing: 2.6 },

  sealRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  seal: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  sealFace: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 1, borderColor: METAL.rim,
  },
  sealCollar: {
    position: 'absolute', width: 62, height: 62, borderRadius: 31,
    borderWidth: 2, borderColor: PATINA_DEEP,
  },
  count: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 62,
    color: PATINA,
    marginLeft: 10,
    includeFontPadding: false,
  },
  dayWord: { fontFamily: 'Inter_700Bold', fontSize: 10, color: INK_SOFT, letterSpacing: 3, marginTop: 2 },

  restNote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: INK_SOFT,
    marginTop: 10,
    textAlign: 'center',
  },

  week: { flexDirection: 'row', marginTop: 20 },
  dayCol: { alignItems: 'center', marginHorizontal: 6 },
  dayLabel: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: INK_SOFT, marginBottom: 6 },
  dayLabelOn: { color: INK, fontFamily: 'Inter_700Bold' },
  disc: { width: 22, height: 22, borderRadius: 11 },
  done: { backgroundColor: PATINA },
  rested: { backgroundColor: PATINA_SOFT },
  missed: { borderWidth: 1.5, borderColor: FAINT },
  future: { borderWidth: 1.5, borderColor: FAINT, opacity: 0.55 },

  milestone: { fontFamily: 'Inter_700Bold', fontSize: 11, color: PATINA, letterSpacing: 2.4, marginTop: 20 },
  toGo: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5, color: INK_SOFT, marginTop: 20 },
});
