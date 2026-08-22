import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import PassCard from '@/components/shared/PassCard';
import Button from '@/components/ui/Button';
import StreakWeek from '@/components/gamification/StreakWeek';
import { MetalPlate } from '@/components/profile/Struck';
import { METAL } from '@/components/shared/tone';
import { BRANCH_SHORT } from '@/components/shared/branchMarks';
import { NextUp, Rule, useRenewal } from '@/components/paywall/PassParts';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { awardedRank } from '@/data/ranks';
import { C, SPACE } from '@/constants/design';
import { restDaysHeld } from '@/constants/streak';
import { FREE_DAILY_LESSON_LIMIT } from '@/constants/subscription';
import { effectiveStreak } from '@/lib/utils/streak';
import { allowanceLabel } from '@/lib/utils/passValue';
import type { Branch, Lesson } from '@/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// "THAT'S YOUR LESSON FOR TODAY."
//
// The free tier IS one admission a day, and this reader has just spent theirs on
// a lesson they finished. The screen therefore leads with what they DID, not
// with what they cannot do.
//
// ── THE ORDER IS THE WHOLE DESIGN ───────────────────────────────────────────
//
// 1 · the streak, alive, with today's day filled — the thing they just earned;
// 2 · the day pass in their name with today's date struck across it — WHY they
//     are here, said as an object rather than as a refusal;
// 3 · the lesson that was waiting, BY NAME, with the clock to when it opens;
// 4 · and only then the Pass, as the way to carry on tonight.
//
// It used to be 2 → a sentence → the offer, which read as a wall with a till in
// front of it. A wait you can see the end of is a held position; a wait with no
// end named is a refusal. Naming the lesson costs one lookup and turns "come
// back tomorrow" into an appointment.
//
// ── THE LESSON NAMED IS THE ONE THEY TAPPED ─────────────────────────────────
//
// Not a quick-start pick. They chose this one seconds ago, and offering a
// different one would be answering a question nobody asked — the reader would
// have to work out whether their choice had been overridden or simply lost.
//
// NO EMBER ON THIS SCREEN, and that is deliberate rather than an oversight.
// `constants/streak.ts` licenses the one colour in three places, and a gate is
// not among them; `StreakWeek` is drawn here in its ink default, which is the
// same row the reward screen and Profile already show.
// ─────────────────────────────────────────────────────────────────────────────

function stampDate(d = new Date()) {
  const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${d.getDate()} ${M[d.getMonth()]}`;
}

export default function DailyLimit({
  lesson,
  branch,
  onExit,
}: {
  /** The lesson they tried to open. */
  lesson: Lesson;
  branch: Branch;
  onExit: () => void;
}) {
  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  const openPaywall = useUIStore((s) => s.openPaywall);

  const rank = awardedRank(rankIndex, totalXP);
  const streak = effectiveStreak(
    streakRaw, lastLessonDate, restDaysHeld(restDaysEarned, restDaysUsed),
  );
  const renewal = useRenewal();

  const { width: winW } = useWindowDimensions();
  const cardW = Math.min(320, winW - SPACE[4] * 2 - SPACE[3]);

  // Where this lesson sits in its branch, for "LOGIC · 15 OF 37". Counted out of
  // the tree rather than taken from the id, which is cosmetic (§11).
  const place = useMemo(() => {
    let seen = 0;
    let position = 0;
    let total = 0;
    for (const unit of branch.paths) {
      const i = unit.lessons.findIndex((l) => l.id === lesson.id);
      if (i >= 0) position = seen + i + 1;
      seen += unit.lessons.length;
      total += unit.lessons.length;
    }
    return { position: position || 1, total };
  }, [branch, lesson.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 1 · WHAT THEY JUST EARNED. */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420 }}
          style={styles.streakBox}
        >
          {streak > 0 ? (
            <>
              <View style={styles.streakHead}>
                <Text style={styles.streakNum}>{streak}</Text>
                <Text style={styles.streakWord}>
                  DAY{streak === 1 ? '' : 'S'} RUNNING
                </Text>
              </View>
              <StreakWeek streak={streak} lastLessonDate={lastLessonDate} size={30} />
            </>
          ) : null}
          <View style={styles.bankedPlate}>
            <MetalPlate metal={METAL.GOLD} label="TODAY BANKED" />
          </View>
        </MotiView>

        {/* 2 · WHY THEY ARE HERE — the pass they hold, spent. */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 460, delay: 120 }}
          style={styles.cardWrap}
        >
          <PassCard
            variant="day"
            name={displayName || 'Philosopher'}
            rank={rank.current.name}
            glyph={rank.current.glyph}
            lines={[allowanceLabel(), 'Renews at midnight']}
            stamp={`USED · ${stampDate()}`}
            width={cardW}
          />
        </MotiView>

        <Text style={styles.title}>
          {FREE_DAILY_LESSON_LIMIT === 1
            ? 'That’s your lesson for today.'
            : `That’s your ${FREE_DAILY_LESSON_LIMIT} for today.`}
        </Text>

        {/* 3 · WHAT IS WAITING, by name, with the clock on it. */}
        <Rule label="WAITING FOR YOU" />
        <NextUp
          branchSlug={branch.slug}
          branchName={BRANCH_SHORT[branch.slug] ?? branch.name}
          title={lesson.title}
          position={place.position}
          total={place.total}
          caption={`Opens in ${renewal.label}`}
        />

        {/* 4 · AND THE WAY TO CARRY ON TONIGHT. */}
        <Text style={styles.offer}>
          The Scholar’s Pass has no daily stamp. Open this one now, and the rest
          whenever you like.
        </Text>
        <Button label="See the Scholar’s Pass" onPress={openPaywall} size="lg" style={styles.cta} />
        <Button label="Maybe tomorrow" onPress={onExit} variant="ghost" style={styles.ghost} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  scroll: { paddingHorizontal: SPACE[4], paddingTop: SPACE[3], paddingBottom: SPACE[4] },

  streakBox: { alignItems: 'center' },
  streakHead: { flexDirection: 'row', alignItems: 'baseline', gap: SPACE[1], marginBottom: SPACE[2] },
  streakNum: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: C.ink },
  streakWord: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6, color: C.inkSoft,
  },
  bankedPlate: { marginTop: SPACE[2] },

  cardWrap: { alignItems: 'center', marginTop: SPACE[4] },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 30, color: C.ink,
    textAlign: 'center', marginTop: SPACE[4],
  },

  offer: {
    fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: C.inkSoft,
    textAlign: 'center', marginTop: SPACE[4],
  },
  cta: { marginTop: SPACE[3] },
  ghost: { marginTop: SPACE[1] },
});
