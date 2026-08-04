import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { router } from 'expo-router';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useTodayKey } from '@/lib/utils/useTodayKey';
import { dayKey, dueLessonIds, FREE_DAILY_REVIEW_QUESTIONS } from '@/lib/review';

// ─────────────────────────────────────────────────────────────────────────────
// The Daily Review entry on Home.
//
// Sits ABOVE Quick Start deliberately: review is the thing that keeps what you
// already did, and Quick Start is the thing that adds more. Offering "more"
// first is how an app ends up with a reader who has finished sixty lessons and
// remembers eight.
//
// It renders nothing at all when nothing is due — an empty state on the main
// screen every day would train people to ignore the slot, and the slot is worth
// more than the reminder.
// ─────────────────────────────────────────────────────────────────────────────

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#ECEAE2';

export default function ReviewCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const reviewState = useUserDataStore((s) => s.reviewState);
  const reviewDayCount = useUserDataStore((s) => s.reviewDayCount);
  const reviewDayDate = useUserDataStore((s) => s.reviewDayDate);
  const ensureReviewBacklog = useUserDataStore((s) => s.ensureReviewBacklog);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  // Re-derive across midnight, so a queue that fills at 00:00 appears without
  // the app having to be restarted.
  const todayTick = useTodayKey();

  // Catch lessons finished before review existed, and lessons that arrived from
  // another device since the last visit. Idempotent, and a no-op once there is
  // nothing to add — so running it on every Home visit costs one branch walk.
  useEffect(() => {
    if (hasHydrated) ensureReviewBacklog();
  }, [hasHydrated, ensureReviewBacklog, todayTick]);

  const today = dayKey();
  const due = useMemo(() => dueLessonIds(reviewState, today).length, [reviewState, today, todayTick]);
  const usedToday = reviewDayDate === today ? reviewDayCount : 0;
  const remaining = isPro ? due : Math.min(due, Math.max(0, FREE_DAILY_REVIEW_QUESTIONS - usedToday));

  if (due === 0) return null;

  const spent = !isPro && remaining === 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.85 }]}
      onPress={() => router.push('/(app)/review')}
    >
      {/* `clock`, not `spark` — spark is already the Insights action three rows
          down, and two identical marks on one screen read as one thing. */}
      <View style={styles.iconWrap}>
        <SketchIcon name="clock" size={22} color={Ink} />
      </View>
      <View style={styles.text}>
        <Text style={styles.kicker}>DAILY REVIEW</Text>
        <Text style={styles.head}>
          {spent
            ? 'Done for today'
            : `${remaining} question${remaining === 1 ? '' : 's'} waiting`}
        </Text>
        <Text style={styles.sub} numberOfLines={2}>
          {spent
            ? `${due} still due — Scholar’s Pass reviews them all.`
            : 'From lessons you’ve already finished. Keeps them from fading.'}
        </Text>
      </View>
      {/* The set has no right-chevron; the down one turned a quarter is the same
          drawn stroke rather than a second, subtly different hand. */}
      <View style={styles.chevron}>
        <SketchIcon name="chevron-down" size={18} color={InkSoft} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Rule,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    letterSpacing: 1.8,
    color: InkSoft,
    marginBottom: 3,
  },
  chevron: { transform: [{ rotate: '-90deg' }] },
  head: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16.5, color: Ink, marginBottom: 2 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12.5, color: InkSoft, lineHeight: 17 },
});
