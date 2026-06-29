import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@/data';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

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
  const openPaywall = useUIStore((s) => s.openPaywall);

  // Decide the free-tier daily-limit gate ONCE, when the lesson opens. Finishing
  // the lesson bumps the daily count (in LessonReward) — but that must never flip
  // this screen to the lock screen mid-celebration and steal the XP + streak
  // reward. The gate only ever blocks OPENING a lesson, so we freeze it here.
  const gateRef = useRef<boolean | null>(null);
  if (gateRef.current === null) {
    const used = dailyLessonDate === todayStr() ? dailyLessonCount : 0;
    gateRef.current = !isPro && used >= FREE_DAILY_LESSON_LIMIT;
  }
  const atLimit = gateRef.current;

  if (!result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#1A1A1A', fontSize: 18 }}>Lesson not found.</Text>
      </SafeAreaView>
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

  return (
    <ScreenTransition bg="#FAFAF7">
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : (
        <LessonRunner lesson={result.lesson} />
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
