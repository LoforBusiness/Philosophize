import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { ads } from '@/lib/ads';
import SketchIcon from '@/components/shared/SketchIcon';
import { track } from '@/lib/posthog';
import {
  buildSession,
  dayKey,
  FREE_DAILY_REVIEW_QUESTIONS,
  MAX_REVIEW_SESSION,
  type ReviewQuestion,
} from '@/lib/review';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';

// ─────────────────────────────────────────────────────────────────────────────
// DAILY REVIEW.
//
// The retention half of the app. A lesson teaches something once; this is what
// makes it still be there on Friday, and it is the only surface that asks about
// work already done rather than adding more.
//
// It is also the free tier's second surface. A free reader gets ONE lesson a
// day, and before this there was nothing behind that wall — the app simply
// stopped. Now the day ends with three questions instead of a dead end, and the
// streak can be fed by them (a streak whose only food is the same single lesson
// that is capped has no slack in it at all).
//
// Questions come from the card decks in data/, which every lesson carries even
// when it plays as a cinematic scene — so nothing here depends on which runner
// the reader actually used, and no capture path had to be built to feed it.
// ─────────────────────────────────────────────────────────────────────────────

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#ECEAE2';

type Phase = 'asking' | 'done';

export default function ReviewScreen() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const reviewState = useUserDataStore((s) => s.reviewState);
  const reviewDayCount = useUserDataStore((s) => s.reviewDayCount);
  const reviewDayDate = useUserDataStore((s) => s.reviewDayDate);
  const gradeReview = useUserDataStore((s) => s.gradeReview);
  const bumpDailyReviews = useUserDataStore((s) => s.bumpDailyReviews);
  const registerDailyActivity = useUserDataStore((s) => s.registerDailyActivity);
  const openPaywall = useUIStore((s) => s.openPaywall);

  const today = dayKey();
  const usedToday = reviewDayDate === today ? reviewDayCount : 0;
  const allowance = isPro
    ? MAX_REVIEW_SESSION
    : Math.max(0, FREE_DAILY_REVIEW_QUESTIONS - usedToday);

  // The session is FROZEN on mount. Answering mutates reviewState — every graded
  // lesson gets a new due date — so a queue recomputed from the live store would
  // rewrite itself under the reader's thumb, dropping the question they are
  // looking at the instant they tapped it.
  const [queue] = useState<ReviewQuestion[]>(() =>
    buildSession(useUserDataStore.getState().reviewState, today, allowance),
  );

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const finished = useRef(false);

  const q = queue[i];
  const answered = picked !== null;

  const onPick = useCallback(
    (optId: string, correct: boolean) => {
      if (picked !== null) return;
      setPicked(optId);
      if (correct) setRight((n) => n + 1);
      // Committed on the tap, not at the end of the session: a reader who closes
      // the app mid-review has still answered, and the ladder should remember it.
      gradeReview(q.lessonId, correct);
      bumpDailyReviews();
    },
    [picked, q, gradeReview, bumpDailyReviews],
  );

  const next = useCallback(() => {
    if (i + 1 < queue.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      setPhase('done');
    }
  }, [i, queue.length]);

  // Finishing a review feeds the streak, exactly like finishing a lesson — which
  // is the whole point of the free tier having this at all. It goes through the
  // same store action, so rest days are spent and earned by the same rule and
  // there is no second copy of the streak logic to drift.
  useEffect(() => {
    if (phase !== 'done' || finished.current || queue.length === 0) return;
    finished.current = true;
    const y = new Date(Date.now() - 86_400_000);
    const p = (n: number) => String(n).padStart(2, '0');
    const yesterday = `${y.getFullYear()}-${p(y.getMonth() + 1)}-${p(y.getDate())}`;
    registerDailyActivity(today, yesterday, { isPro });
    track('review_completed', { asked: queue.length, correct: right, is_pro: isPro });
  }, [phase]);

  // The ad a free review pays for, on the same terms as a lesson: shown AFTER
  // the ladder and the streak are already written, so a slow or missing ad can
  // never cost someone the review they just did.
  const leave = useCallback(async () => {
    if (!isPro) {
      try {
        await ads.showInterstitial();
      } catch {}
    }
    router.back();
  }, [isPro]);

  const nothingDue = queue.length === 0;
  const cappedOut = !isPro && allowance === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <SketchIcon name="close" size={20} color={Ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Review</Text>
        <Text style={styles.headerCount}>
          {nothingDue ? '' : phase === 'done' ? '' : `${i + 1}/${queue.length}`}
        </Text>
      </View>

      {nothingDue ? (
        <View style={styles.centre}>
          <Text style={styles.emptyHead}>{cappedOut ? 'That’s your review for today' : 'Nothing due'}</Text>
          <Text style={styles.emptyBody}>
            {cappedOut
              ? `Free thinkers get ${FREE_DAILY_REVIEW_QUESTIONS} review questions a day. Scholar’s Pass reviews everything that’s due, whenever you want it.`
              : 'Everything you’ve learned is still fresh. Finish a lesson and it’ll come back here when it’s ready to be tested.'}
          </Text>
          {cappedOut && (
            <Pressable style={styles.cta} onPress={openPaywall}>
              <Text style={styles.ctaText}>See Scholar’s Pass</Text>
            </Pressable>
          )}
          <Pressable style={styles.ghost} onPress={() => router.back()}>
            <Text style={styles.ghostText}>Back</Text>
          </Pressable>
        </View>
      ) : phase === 'done' ? (
        <View style={styles.centre}>
          <Text style={styles.emptyHead}>Review done</Text>
          <Text style={styles.score}>
            {right} of {queue.length}
          </Text>
          <Text style={styles.emptyBody}>
            {right === queue.length
              ? 'All of it held. Those come back further apart now.'
              : 'The ones you missed come back tomorrow. That’s the point of them.'}
          </Text>
          <Pressable style={styles.cta} onPress={leave}>
            <Text style={styles.ctaText}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.from}>{q.lessonTitle}</Text>
          <Animated.View layout={LinearTransition.duration(300)}>
            <Text style={styles.prompt}>{q.prompt}</Text>
            {q.options.map((o) => {
              const chosen = picked === o.id;
              const reveal = answered && o.correct;
              // Once answered, drop everything that is neither the pick nor the
              // answer — same reduction the lesson deck does, same reason.
              if (answered && !chosen && !o.correct) return null;
              return (
                <Pressable
                  key={o.id}
                  disabled={answered}
                  onPress={() => onPick(o.id, o.correct)}
                  style={({ pressed }) => [
                    styles.opt,
                    reveal && styles.optRight,
                    chosen && !o.correct && styles.optWrong,
                    pressed && !answered && { opacity: 0.75 },
                  ]}
                >
                  <Text style={[styles.optText, reveal && styles.optRightText]}>{o.text}</Text>
                </Pressable>
              );
            })}
            {answered && (
              <Animated.View style={styles.explain} entering={FadeInDown.duration(300)}>
                <Text style={styles.explainHead}>
                  {q.options.find((o) => o.id === picked)?.correct
                    ? `Correct  ·  +${XP_PER_CORRECT_ANSWER} XP`
                    : 'Not quite'}
                </Text>
                <Text style={styles.explainText}>{q.explanation}</Text>
              </Animated.View>
            )}
          </Animated.View>
          {answered && (
            <Pressable style={styles.cta} onPress={next}>
              <Text style={styles.ctaText}>{i + 1 < queue.length ? 'Next' : 'Finish'}</Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Rule,
  },
  close: { width: 32 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: Ink,
  },
  headerCount: {
    width: 32,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
  },
  body: { padding: 22, paddingBottom: 48 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  from: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: InkSoft,
    marginBottom: 10,
  },
  prompt: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: Ink,
    lineHeight: 27,
    marginBottom: 18,
  },
  opt: {
    borderWidth: 1,
    borderColor: Rule,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginBottom: 9,
    backgroundColor: '#FFFFFF',
  },
  optRight: { borderColor: Ink, backgroundColor: Ink },
  optRightText: { color: Paper, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: InkSoft, opacity: 0.55 },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: Ink, lineHeight: 20 },
  explain: {
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: Ink,
    paddingLeft: 13,
    paddingVertical: 2,
  },
  explainHead: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: Ink,
    marginBottom: 5,
  },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: InkSoft, lineHeight: 21 },
  emptyHead: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: Ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  score: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    color: Ink,
    marginBottom: 10,
  },
  emptyBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14.5,
    color: InkSoft,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    marginTop: 26,
    backgroundColor: Ink,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 34,
    alignSelf: 'center',
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Paper, letterSpacing: 0.3 },
  ghost: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 20 },
  ghostText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft },
});
