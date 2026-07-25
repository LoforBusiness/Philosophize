import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById, lessonAccessibility } from '@/data';
import type { Lesson } from '@/data/types';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import { exitLesson } from '@/components/lesson/exitLesson';
import ArgumentFightLesson from '@/components/lesson/cinematic/ArgumentFightLesson';
import PremisesBuilderLesson from '@/components/lesson/cinematic/PremisesBuilderLesson';
import { EthicsLesson } from '@/components/lesson/cinematic/ethicsScene';
import { EpistemologyLesson } from '@/components/lesson/cinematic/epistemologyScene';
import { MetaphysicsLesson } from '@/components/lesson/cinematic/metaphysicsScene';
import { AestheticsLesson } from '@/components/lesson/cinematic/aestheticsScene';
import { PoliticalLesson } from '@/components/lesson/cinematic/politicalScene';
import { Ethics2Lesson } from '@/components/lesson/cinematic/ethics2Scene';
import { Epistemology2Lesson } from '@/components/lesson/cinematic/epistemology2Scene';
import { Metaphysics2Lesson } from '@/components/lesson/cinematic/metaphysics2Scene';
import { Aesthetics2Lesson } from '@/components/lesson/cinematic/aesthetics2Scene';
import { Political2Lesson } from '@/components/lesson/cinematic/political2Scene';
import { Valid3Lesson } from '@/components/lesson/cinematic/valid3Scene';
import { Strong4Lesson } from '@/components/lesson/cinematic/strong4Scene';
import { Ethics3Lesson } from '@/components/lesson/cinematic/ethics3Scene';
import { Ethics4Lesson } from '@/components/lesson/cinematic/ethics4Scene';
import { Epistemology4Lesson } from '@/components/lesson/cinematic/epistemology4Scene';
import { Epistemology5Lesson } from '@/components/lesson/cinematic/epistemology5Scene';
import { Metaphysics3Lesson } from '@/components/lesson/cinematic/metaphysics3Scene';
import { Metaphysics4Lesson } from '@/components/lesson/cinematic/metaphysics4Scene';
import { Aesthetics3Lesson } from '@/components/lesson/cinematic/aesthetics3Scene';
import { Aesthetics4Lesson } from '@/components/lesson/cinematic/aesthetics4Scene';
import { Political3Lesson } from '@/components/lesson/cinematic/political3Scene';
import { Political4Lesson } from '@/components/lesson/cinematic/political4Scene';
import { Logic5Lesson } from '@/components/lesson/cinematic/logic5Scene';
import { Ethics5Lesson } from '@/components/lesson/cinematic/ethics5Scene';
import { Logic6Lesson } from '@/components/lesson/cinematic/logic6Scene';
import { Metaphysics6Lesson } from '@/components/lesson/cinematic/metaphysics6Scene';
import { Aesthetics6Lesson } from '@/components/lesson/cinematic/aesthetics6Scene';
import { Ethics6Lesson } from '@/components/lesson/cinematic/ethics6Scene';
import { Epistemology6Lesson } from '@/components/lesson/cinematic/epistemology6Scene';
import { Epistemology7Lesson } from '@/components/lesson/cinematic/epistemology7Scene';
import { Metaphysics5Lesson } from '@/components/lesson/cinematic/metaphysics5Scene';
import { Aesthetics5Lesson } from '@/components/lesson/cinematic/aesthetics5Scene';
import { Political5Lesson } from '@/components/lesson/cinematic/political5Scene';
import { Political6Lesson } from '@/components/lesson/cinematic/political6Scene';
import { Logic7Lesson } from '@/components/lesson/cinematic/logic7Scene';
import { Logic8Lesson } from '@/components/lesson/cinematic/logic8Scene';
import { Ethics7Lesson } from '@/components/lesson/cinematic/ethics7Scene';
import { Ethics8Lesson } from '@/components/lesson/cinematic/ethics8Scene';
import { Epistemology8Lesson } from '@/components/lesson/cinematic/epistemology8Scene';
import { Epistemology9Lesson } from '@/components/lesson/cinematic/epistemology9Scene';
import { Metaphysics7Lesson } from '@/components/lesson/cinematic/metaphysics7Scene';
import { Metaphysics8Lesson } from '@/components/lesson/cinematic/metaphysics8Scene';
import { Aesthetics7Lesson } from '@/components/lesson/cinematic/aesthetics7Scene';
import { Aesthetics8Lesson } from '@/components/lesson/cinematic/aesthetics8Scene';
import { Political7Lesson } from '@/components/lesson/cinematic/political7Scene';
import { Political8Lesson } from '@/components/lesson/cinematic/political8Scene';
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
  'ethics-ethics-2': Ethics2Lesson,
  'epistemology-knowledge-3': Epistemology2Lesson,
  'metaphysics-being-2': Metaphysics2Lesson,
  'aesthetics-aesthetics-2': Aesthetics2Lesson,
  'political-political-2': Political2Lesson,
  // second wave — lessons 3 & 4 of each branch's first unit
  'logic-arguments-3': Valid3Lesson,
  'logic-arguments-4': Strong4Lesson,
  'ethics-ethics-3': Ethics3Lesson,
  'ethics-ethics-4': Ethics4Lesson,
  'epistemology-knowledge-4': Epistemology4Lesson,
  'epistemology-knowledge-5': Epistemology5Lesson,
  'metaphysics-being-3': Metaphysics3Lesson,
  'metaphysics-being-4': Metaphysics4Lesson,
  'aesthetics-aesthetics-3': Aesthetics3Lesson,
  'aesthetics-aesthetics-4': Aesthetics4Lesson,
  'political-political-3': Political3Lesson,
  'political-political-4': Political4Lesson,
  // showcase — richer scenes + scene-driven answers
  'logic-arguments-5': Logic5Lesson,
  'ethics-ethics-5': Ethics5Lesson,
  'logic-arguments-6': Logic6Lesson,
  'metaphysics-being-6': Metaphysics6Lesson,
  'aesthetics-aesthetics-6': Aesthetics6Lesson,
  'ethics-ethics-6': Ethics6Lesson,
  'epistemology-knowledge-6': Epistemology6Lesson,
  'epistemology-knowledge-7': Epistemology7Lesson,
  'metaphysics-being-5': Metaphysics5Lesson,
  'aesthetics-aesthetics-5': Aesthetics5Lesson,
  'political-political-5': Political5Lesson,
  'political-political-6': Political6Lesson,
  // fourth wave — the figure walks the stage: to a whiteboard, a sprinkler, a
  // timeline, a gallery wall, a fence. Lessons 7 & 8 of every branch.
  'logic-arguments-7': Logic7Lesson,
  'logic-arguments-8': Logic8Lesson,
  'ethics-ethics-7': Ethics7Lesson,
  'ethics-ethics-8': Ethics8Lesson,
  'epistemology-knowledge-8': Epistemology8Lesson,
  'epistemology-knowledge-9': Epistemology9Lesson,
  'metaphysics-being-7': Metaphysics7Lesson,
  'metaphysics-being-8': Metaphysics8Lesson,
  'aesthetics-aesthetics-7': Aesthetics7Lesson,
  'aesthetics-aesthetics-8': Aesthetics8Lesson,
  'political-political-7': Political7Lesson,
  'political-political-8': Political8Lesson,
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
          <Pressable onPress={exitLesson} style={styles.secondaryBtn} hitSlop={8}>
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
          <Pressable onPress={exitLesson} style={styles.secondaryBtn} hitSlop={8}>
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
