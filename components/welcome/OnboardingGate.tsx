import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { WELCOME_VERSION } from './WelcomeAnimation';
import { branchFromAnswers, ONBOARDING_QUESTIONS } from './onboardingQuestions';

// ─────────────────────────────────────────────────────────────────────────────
// THE THREE WELCOME QUESTIONS.
//
// A beginner used to meet six branches and 192 lessons with no steer at all.
// These ask why they came, and point them at one branch to start in. Nothing is
// locked either way — see onboardingQuestions.ts.
//
// WHY IT IS MOUNTED AT THE ROOT AND NOT INSIDE THE WELCOME ANIMATION. A reader
// who is already signed in never renders app/index.tsx: the root layout
// redirects into (app) as soon as the session resolves, which is exactly why the
// intro has never been able to reach them either. Hanging the questions off the
// intro would therefore have asked only guests and new installs — and existing
// signed-in readers, the largest group, would never have seen them. At the root
// it covers whatever screen they land on.
//
// It carries its OWN version (`onboardingVersion`), so introducing it does not
// require bumping WELCOME_VERSION and replaying a thirty-second animation at
// someone forty lessons deep.
// ─────────────────────────────────────────────────────────────────────────────

export const ONBOARDING_VERSION = 1;

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#ECEAE2';

export default function OnboardingGate() {
  const hydrated = useUserDataStore((s) => s._hasHydrated);
  const onboardingVersion = useUserDataStore((s) => s.onboardingVersion);
  const welcomeVersion = useUserDataStore((s) => s.welcomeVersion);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const completeOnboarding = useUserDataStore((s) => s.completeOnboarding);
  const launchDone = useUIStore((s) => s.launchDone);

  const [picked, setPicked] = useState<(string | null)[]>(() =>
    ONBOARDING_QUESTIONS.map(() => null),
  );
  const [i, setI] = useState(0);

  // Every hook is above this line. Three players in this codebase learned the
  // same lesson the hard way: a hook below an early return throws the moment the
  // condition flips, and takes the whole tree with it.
  if (!hydrated) return null;
  if (onboardingVersion >= ONBOARDING_VERSION) return null;
  // Never over the launch screen, and never over the intro animation — the intro
  // ends by writing welcomeVersion, and this appears on the far side of it.
  if (!launchDone) return null;
  if (welcomeVersion < WELCOME_VERSION) return null;

  const returning = totalXP > 0;
  const q = ONBOARDING_QUESTIONS[i];

  const choose = (optId: string) => {
    const next = [...picked];
    next[i] = optId;
    setPicked(next);
    if (i + 1 < ONBOARDING_QUESTIONS.length) {
      setI(i + 1);
    } else {
      completeOnboarding(branchFromAnswers(next), ONBOARDING_VERSION);
    }
  };

  // Skipping still records the version, so it is asked once and not on every
  // launch. A null branch is simply the no-steer the app had before.
  const skip = () => completeOnboarding(branchFromAnswers(picked), ONBOARDING_VERSION);

  return (
    <Animated.View style={StyleSheet.absoluteFill} entering={FadeIn.duration(260)} exiting={FadeOut.duration(220)}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>
            {returning ? 'LET US TUNE WHAT WE SUGGEST' : 'BEFORE YOU BEGIN'}
          </Text>
          <View style={styles.rule} />
          <Text style={styles.lede}>
            {returning
              ? 'Three questions, and the app will point you somewhere that fits. Everything stays open either way.'
              : 'Three questions, so we can point you somewhere worth starting. Nothing is locked — all six branches stay open.'}
          </Text>

          <View style={styles.dots}>
            {ONBOARDING_QUESTIONS.map((_, n) => (
              <View key={n} style={[styles.dot, n <= i && styles.dotOn]} />
            ))}
          </View>

          <Animated.View key={q.id} entering={FadeInDown.duration(300)}>
            <Text style={styles.prompt}>{q.prompt}</Text>
            {q.options.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => choose(o.id)}
                style={({ pressed }) => [styles.opt, pressed && { opacity: 0.72 }]}
              >
                <Text style={styles.optText}>{o.text}</Text>
              </Pressable>
            ))}
          </Animated.View>

          <Pressable onPress={skip} hitSlop={10} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  page: { padding: 26, paddingTop: 40, flexGrow: 1 },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 2.4,
    color: InkSoft,
    textAlign: 'center',
  },
  rule: {
    height: 1,
    backgroundColor: Rule,
    alignSelf: 'center',
    width: 60,
    marginVertical: 14,
  },
  lede: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
    alignSelf: 'center',
  },
  dots: { flexDirection: 'row', gap: 7, alignSelf: 'center', marginTop: 26, marginBottom: 26 },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: InkSoft },
  dotOn: { backgroundColor: Ink, borderColor: Ink },
  prompt: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    color: Ink,
    lineHeight: 31,
    marginBottom: 20,
    textAlign: 'center',
  },
  opt: {
    borderWidth: 1,
    borderColor: Rule,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Ink, lineHeight: 21 },
  skip: { alignSelf: 'center', marginTop: 20, paddingVertical: 10, paddingHorizontal: 24 },
  skipText: { fontFamily: 'Inter_500Medium', fontSize: 13.5, color: InkSoft },
});
