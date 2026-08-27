import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import StreakCalendar from '@/components/gamification/StreakCalendar';
import StreakMascot from '@/components/gamification/StreakMascot';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  PATINA, PATINA_DEEP, PATINA_SOFT, SLATE,
  restDaysHeld, restEarnEvery, restCap, tierFor, nextTier,
} from '@/constants/streak';
import { effectiveStreak, streakIsAlive, restDaysToSpend } from '@/lib/utils/streak';
import { moodFor } from '@/lib/utils/streakMood';
import { daysInMonth, dayKey } from '@/lib/utils/streakCalendar';
import { C, TYPE, SPACE, RADIUS, type TypeKey } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK SCREEN.
//
// A streak was a number on a card in the Profile tab and a bottom sheet on Home.
// Both said the same true thing quietly, and neither gave a reader any reason to
// come back tomorrow. This is the stage: the mascot, what the streak has made you,
// and the month you built it in.
//
// ── WHY A SCREEN AND NOT A BIGGER CARD ──────────────────────────────────────
//
// The thing being sold is that the streak MATTERS, and a feature that matters gets
// a room. It is also the only way the mascot works: he needs to be big enough to
// read a pose off, and a pose at 66px is a smudge.
//
// It is a HIDDEN route, like settings and the paywall — reached by tapping the
// streak anywhere it appears, never by a tab. Six tabs on a 390pt phone is ~62pt
// each and the labels clip; the streak does not need to outrank Learn.
//
// ── EVERY NUMBER HERE IS DERIVED, NONE IS STORED ────────────────────────────
//
// `effectiveStreak` rather than `streak`, because the stored one only moves when a
// lesson is finished and lingers at its old value after a missed day. The mood, the
// tier and the ember all hang off that one honest number, so there is no way for
// this screen to congratulate a reader on a streak they have actually lost.
// ─────────────────────────────────────────────────────────────────────────────

const role = (k: TypeKey) => ({
  fontFamily: TYPE[k].family,
  fontSize: TYPE[k].fontSize,
  lineHeight: TYPE[k].lineHeight,
  letterSpacing: TYPE[k].letterSpacing ?? 0,
});

const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function StreakScreen() {
  const streak = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const activeDays = useUserDataStore((s) => s.activeDays);
  const restDays = useUserDataStore((s) => s.restDays);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const earned = useUserDataStore((s) => s.restDaysEarned);
  const used = useUserDataStore((s) => s.restDaysUsed);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const now = new Date();
  const today = dateStr(now);
  const since = joinedAt ? dateStr(new Date(joinedAt)) : null;

  const held = restDaysHeld(earned, used);
  const alive = streakIsAlive(lastLessonDate, held);
  const shown = effectiveStreak(streak, lastLessonDate, held);
  const fedToday = lastLessonDate === today;
  const restSpent = restDaysToSpend(lastLessonDate, today, held);

  // THE MOOD IS THE WHOLE CHARACTER, and it is computed from the mechanic rather
  // than chosen here. This screen never decides he is cross; it asks.
  const mood = useMemo(
    () => moodFor({ streak: shown, alive, fedToday, hour: now.getHours(), restSpent, dayKey: today }),
    [shown, alive, fedToday, restSpent, today],
  );

  const tier = tierFor(shown);
  const next = nextTier(shown);

  // The month the GRID is showing, which is not always this one — the reader can
  // page back, and figures that stayed on the current month while the calendar
  // moved would be quietly describing a different month than the one on screen.
  const [month, setMonth] = useState<{ y: number; m: number }>(
    { y: now.getFullYear(), m: now.getMonth() },
  );
  const onMonth = useCallback((y: number, m: number) => setMonth({ y, m }), []);

  const stats = useMemo(() => {
    const act = new Set(activeDays);
    const rst = new Set(restDays);
    const n = daysInMonth(month.y, month.m);
    let practised = 0;
    let rested = 0;
    let missed = 0;
    for (let d = 1; d <= n; d++) {
      const k = dayKey(month.y, month.m, d);
      if (k > today) break;                 // the future is not a miss
      if (since && k < since) continue;     // nor is anything before you arrived
      if (act.has(k)) practised++;
      else if (rst.has(k)) rested++;
      else missed++;
    }
    // A PERFECT MONTH NEEDS A DAY IN IT. Without the `practised > 0` guard, a month
    // entirely before the reader joined has nothing to miss and would be awarded a
    // perfect — congratulating them for a month they were not here for.
    return { practised, rested, missed, perfect: missed === 0 && practised > 0 };
  }, [activeDays, restDays, month.y, month.m, today, since]);

  const toNext = next ? next.at - shown : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenTransition>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <SketchIcon name="back" size={20} color={C.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>STREAK</Text>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* ── THE HERO ────────────────────────────────────────────────────
              The count is the loudest thing on the screen and it takes the ember
              when it is alive and the ash when it is not. That is the one colour
              §19 and constants/streak.ts allow, in the one place they allow it. */}
          <View style={styles.hero}>
            <StreakMascot mood={mood} alive={alive} />
            <Text style={[styles.count, { color: alive ? PATINA : SLATE }]}>{shown}</Text>
            <Text style={styles.countWord}>
              {alive ? `DAY${shown === 1 ? '' : 'S'} RUNNING` : 'STREAK LAPSED'}
            </Text>

            {tier ? (
              <View style={styles.tierChip}>
                <Text style={styles.tierChipText}>{tier.name.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>

          {/* ── THE SOCIETY ─────────────────────────────────────────────────
              What the streak has made you, and what it would make you next. */}
          <View style={styles.card}>
            <Text style={styles.cardHead}>THE SOCIETY</Text>
            {tier ? (
              <Text style={styles.tierBlurb}>{tier.blurb}</Text>
            ) : (
              <Text style={styles.tierBlurb}>
                Seven days admits you to the Peripatetics. Aristotle&rsquo;s lot. They
                walked while they argued, which is more than you have done today.
              </Text>
            )}
            {next ? (
              <View style={styles.nextRow}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.max(4, Math.round((shown / next.at) * 100))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.nextText}>
                  {toNext} {toNext === 1 ? 'day' : 'days'} to {next.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.nextText}>Every society has admitted you. There are no more.</Text>
            )}
          </View>

          {/* ── THE MONTH ───────────────────────────────────────────────────
              Figures first, then the grid they describe. */}
          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: alive ? PATINA : C.ink }]}>{stats.practised}</Text>
                <Text style={styles.statWord}>days practised</Text>
              </View>
              <View style={styles.statDivide} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>{stats.rested}</Text>
                <Text style={styles.statWord}>rest days used</Text>
              </View>
              {stats.perfect ? (
                <View style={styles.perfect}>
                  <Text style={styles.perfectText}>PERFECT</Text>
                </View>
              ) : null}
            </View>

            <StreakCalendar
              activeDays={activeDays}
              restDays={restDays}
              today={today}
              since={since}
              onMonth={onMonth}
            />
          </View>

          {/* ── REST DAYS ───────────────────────────────────────────────────
              Named honestly. They are the reason a bad Tuesday does not cost a
              reader ninety days, and a reader who does not know they exist gets
              no comfort from having them. */}
          <View style={styles.card}>
            <Text style={styles.cardHead}>REST DAYS</Text>
            <Text style={styles.restNum}>{held} of {restCap(isPro)}</Text>
            <Text style={styles.restText}>
              One is spent automatically to cover a day you miss, so a single bad day
              costs you nothing. You earn one every {restEarnEvery(isPro)} days.
            </Text>
          </View>
        </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE[3], paddingBottom: SPACE[2],
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...role('label'), letterSpacing: 2, color: C.ink },

  body: { paddingHorizontal: SPACE[3], paddingBottom: SPACE[5], gap: SPACE[3] },

  hero: { alignItems: 'center', paddingTop: SPACE[2] },
  // Big. A streak screen whose number is the same size as a stat tile has not
  // understood which of the two the reader came for.
  count: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 72, lineHeight: 78,
    includeFontPadding: false, marginTop: SPACE[2],
  },
  countWord: { ...role('micro'), letterSpacing: 2, color: C.inkSoft },
  tierChip: {
    marginTop: SPACE[2], paddingHorizontal: SPACE[2], paddingVertical: 5,
    borderRadius: RADIUS.pill, backgroundColor: PATINA_SOFT,
  },
  tierChipText: { ...role('micro'), letterSpacing: 2, color: PATINA_DEEP, fontFamily: 'Inter_700Bold' },

  card: {
    backgroundColor: C.surface, borderRadius: RADIUS.card, borderWidth: 1,
    borderColor: C.hairline, padding: SPACE[3], gap: SPACE[2],
  },
  cardHead: { ...role('micro'), letterSpacing: 2, color: C.inkSoft },
  tierBlurb: { ...role('body'), color: C.ink },

  nextRow: { gap: SPACE[1] },
  track: { height: 6, borderRadius: RADIUS.pill, backgroundColor: C.hairline, overflow: 'hidden' },
  fill: { height: 6, borderRadius: RADIUS.pill, backgroundColor: PATINA },
  nextText: { ...role('micro'), color: C.inkSoft },

  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1 },
  statDivide: { width: 1, height: 30, backgroundColor: C.hairline, marginHorizontal: SPACE[2] },
  statNum: { ...role('title'), color: C.ink },
  statWord: { ...role('micro'), color: C.inkSoft },
  perfect: {
    paddingHorizontal: SPACE[2], paddingVertical: 4,
    borderRadius: RADIUS.pill, backgroundColor: PATINA_SOFT,
  },
  perfectText: { ...role('micro'), letterSpacing: 1.5, color: PATINA_DEEP, fontFamily: 'Inter_700Bold' },

  restNum: { ...role('title'), color: C.ink },
  restText: { ...role('body'), color: C.inkSoft },
});
