import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById, lessonAccessibility } from '@/data';
import type { Lesson } from '@/data/types';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import ArgumentFightLesson from '@/components/lesson/cinematic/ArgumentFightLesson';
import PremisesBuilderLesson from '@/components/lesson/cinematic/PremisesBuilderLesson';
import { EthicsLesson } from '@/components/lesson/cinematic/ethicsScene';
import { EpistemologyLesson } from '@/components/lesson/cinematic/epistemologyScene';
import { MetaphysicsLesson } from '@/components/lesson/cinematic/metaphysicsScene';
import { AestheticsLesson } from '@/components/lesson/cinematic/aestheticsScene';
import { PoliticalLesson } from '@/components/lesson/cinematic/politicalScene';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

// Lessons that play as a continuous animated scene instead of the card pager.
// A cinematic component takes the same `{ lesson }` prop and renders LessonReward
// itself when it finishes, so XP, the streak, badges and the daily counter all
// still run through exactly one path. Everything above this line — hydration, the
// unlock gate, the daily limit — applies to both kinds of lesson unchanged.
// Removing an entry here is a complete, safe rollback to the normal card runner.
const CINEMATIC: Record<string, React.ComponentType<{ lesson: Lesson }>> = {
  'logic-arguments-1': ArgumentFightLesson,
  'logic-arguments-2': PremisesBuilderLesson,
  'ethics-ethics-1': EthicsLesson,
  'epistemology-knowledge-1': EpistemologyLesson,
  'metaphysics-being-1': MetaphysicsLesson,
  'aesthetics-aesthetics-1': AestheticsLesson,
  'political-political-1': PoliticalLesson,
};

function todayStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const result = getLessonById(lessonId);
  const [loading, setLoading] = useState(true);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const dailyLessonCount = useUserDataStore((s) => s.dailyLessonCount);
  const dailyLessonDate = useUserDataStore((s) => s.dailyLessonDate);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  const openPaywall = useUIStore((s) => s.openPaywall);

  // Freeze the daily-limit gate ONCE — but only after the persisted store has
  // hydrated, so we never freeze a pre-hydration default (which would read used=0
  // and let a capped free user sneak an extra lesson). atLimit must be frozen
  // because completing the lesson bumps the daily count, and that must not flip
  // this screen to the limit lock mid-celebration and steal the XP + streak.
  const atLimitRef = useRef<boolean | null>(null);
  if (hasHydrated && atLimitRef.current === null) {
    const used = dailyLessonDate === todayStr() ? dailyLessonCount : 0;
    atLimitRef.current = !isPro && used >= FREE_DAILY_LESSON_LIMIT;
  }
  const atLimit = atLimitRef.current ?? false;

  // Access is computed LIVE (not frozen): completing a lesson only ever advances
  // progress, which can unlock but never lock — so there's no mid-reward flip
  // risk — and live values avoid a stale pre-hydration {} snapshot false-locking
  // an already-completed lesson reached via a deep link.
  const access = lessonAccessibility(lessonId, lessonsByUnit, isPro);
  const locked = !access.accessible;
  const gatedByPro = access.gatedByPro;

  if (!result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#1A1A1A', fontSize: 18 }}>Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  // Wait for persisted progress before deciding access / the daily limit, so a
  // cold deep-link into a lesson never evaluates the gates against an empty
  // default store. AsyncStorage rehydration is near-instant.
  if (!hasHydrated) {
    return <ScreenTransition bg="#FAFAF7"><View style={{ flex: 1, backgroundColor: '#FAFAF7' }} /></ScreenTransition>;
  }

  // Locked lesson (reached via a deep link / back stack, not the list). Free
  // users must finish the previous unit first; the Pass lets them jump ahead.
  if (locked) {
    return (
      <ScreenTransition bg={Page}>
        <SafeAreaView style={styles.lockWrap}>
          <View style={styles.lockIcon}>
            <SketchIcon name="lock" color={Ink} size={34} />
          </View>
          <Text style={styles.lockTitle}>
            {gatedByPro ? 'This unit is a jump ahead' : 'Not yet unlocked'}
          </Text>
          <Text style={styles.lockBody}>
            {gatedByPro
              ? 'Finish the previous unit to reach this one — or unlock Scholar’s Pass to start any unit whenever you like.'
              : 'Finish the earlier lessons in this unit first to unlock this one.'}
          </Text>
          {gatedByPro && (
            <Pressable
              onPress={openPaywall}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryText}>Unlock Scholar’s Pass</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.back()} style={styles.secondaryBtn} hitSlop={8}>
            <Text style={styles.secondaryText}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  if (atLimit) {
    return (
      <ScreenTransition bg={Page}>
        <SafeAreaView style={styles.lockWrap}>
          <View style={styles.lockIcon}>
            <SketchIcon name="lock" color={Ink} size={34} />
          </View>
          <Text style={styles.lockTitle}>
            {FREE_DAILY_LESSON_LIMIT === 1 ? 'That’s your lesson for today' : `That’s your ${FREE_DAILY_LESSON_LIMIT} for today`}
          </Text>
          <Text style={styles.lockBody}>
            Free thinkers get {FREE_DAILY_LESSON_LIMIT} {lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day. Come back
            tomorrow — or unlock unlimited, ad-free lessons with Scholar’s Pass and keep the momentum going.
          </Text>
          <Pressable
            onPress={openPaywall}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryText}>Unlock Scholar’s Pass</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.secondaryBtn} hitSlop={8}>
            <Text style={styles.secondaryText}>Maybe tomorrow</Text>
          </Pressable>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  const Runner = CINEMATIC[lessonId] ?? LessonRunner;

  return (
    <ScreenTransition bg="#FAFAF7">
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : (
        <Runner lesson={result.lesson} />
      )}
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  lockIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, textAlign: 'center' },
  lockBody: { fontFamily: 'Inter_400Regular', fontSize: 15, color: InkSoft, lineHeight: 22, textAlign: 'center', marginTop: 14 },
  primaryBtn: {
    backgroundColor: Ink,
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'stretch',
  },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Page, letterSpacing: 0.3 },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },
});
