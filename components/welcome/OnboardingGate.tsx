import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeOut, SlideInRight, SlideOutLeft, useAnimatedStyle,
  useSharedValue, withSequence, withSpring, withTiming, Easing,
} from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { WELCOME_VERSION } from './WelcomeAnimation';
import { branchFromAnswers, ONBOARDING_QUESTIONS, type OnboardingOption } from './onboardingQuestions';
import { C, TYPE, SPACE, RADIUS, LIP, BRANCH, type BranchKey } from '@/constants/design';
import { touch } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE THREE WELCOME QUESTIONS.
//
// A beginner used to meet six branches and 222 lessons with no steer at all.
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
//
// ── WHY IT LOOKS LIKE THIS NOW ──────────────────────────────────────────────
//
// A reader, on the version this replaces: "it's pretty bland. It's just black and
// white text and a boring flat box. Nothing's really gamified. Nothing really
// pops out or is really fun to do about answering those questions."
//
// It was four white rectangles with a hairline border and a row of grey dots.
// Three things changed, and only one of them is decoration:
//
// 1. EVERY ANSWER IS COLOURED BY WHERE IT POINTS. Each option already carries a
//    weight vector over the six branches — that is the whole mechanism of this
//    screen — and `BRANCH` in constants/design.ts is the app's licensed colour
//    for exactly that fact. So an answer is tinted with the subject it leans
//    toward: the screen stops being a form and becomes a set of four doors with
//    different things behind them, and the colour is information rather than
//    paint. It is also the reader's first sight of the palette they will meet
//    again on every mastery bar.
//
// 2. IT ANSWERS BACK. Tapping used to swap the question instantly, which reads
//    as a page reloading. The chosen card now fills with its branch's colour and
//    lifts, its siblings recede, and only then does the next question arrive —
//    from the right, as a slide, because three questions in a row that
//    cross-fade in place look like one question that keeps changing its mind.
//
// 3. THE PROGRESS IS A RAIL, NOT DOTS. Same 10px pill the lesson runner uses,
//    for the same reason: three dots the size of a full stop are not a thing a
//    reader can feel themselves moving along.
// ─────────────────────────────────────────────────────────────────────────────

export const ONBOARDING_VERSION = 1;

/** How long the chosen card is allowed to be looked at before the next question. */
const SETTLE_MS = 460;

/** The branch an answer leans toward hardest — what colours its card. */
function leadBranch(o: OnboardingOption): BranchKey {
  let best: BranchKey = 'metaphysics';
  let top = -Infinity;
  for (const [slug, w] of Object.entries(o.weights)) {
    if ((w ?? 0) > top) { top = w ?? 0; best = slug as BranchKey; }
  }
  return best;
}

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
  /** The option being celebrated, if any — locks the row while it plays. */
  const [landing, setLanding] = useState<string | null>(null);

  // Every hook is above this line. Three players in this codebase learned the
  // hard way that a hook below an early return crashes the tree the moment the
  // condition flips (§17, rule 1).
  if (!hydrated || !launchDone) return null;
  if (welcomeVersion < WELCOME_VERSION) return null;
  if (onboardingVersion >= ONBOARDING_VERSION) return null;

  const returning = totalXP > 0;
  const q = ONBOARDING_QUESTIONS[i];

  const choose = (optId: string) => {
    if (landing) return;
    touch();
    setLanding(optId);
    const next = [...picked];
    next[i] = optId;
    setPicked(next);
    // The answer is allowed to land before the screen moves on. Advancing on the
    // same frame as the tap is what made this feel like a form rather than a game.
    setTimeout(() => {
      setLanding(null);
      if (i + 1 < ONBOARDING_QUESTIONS.length) setI(i + 1);
      else completeOnboarding(branchFromAnswers(next), ONBOARDING_VERSION);
    }, SETTLE_MS);
  };

  // Skipping still records the version, so it is asked once and not on every
  // launch. A null branch is simply the no-steer the app had before.
  const skip = () => completeOnboarding(branchFromAnswers(picked), ONBOARDING_VERSION);

  return (
    <Animated.View
      style={StyleSheet.absoluteFill}
      entering={FadeIn.duration(320)}
      exiting={FadeOut.duration(220)}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>
            {returning ? 'LET US TUNE WHAT WE SUGGEST' : 'BEFORE YOU BEGIN'}
          </Text>
          <Text style={styles.lede}>
            {returning
              ? 'Three questions, and the app will point you somewhere that fits. Everything stays open either way.'
              : 'Three questions, so we can point you somewhere worth starting. Nothing is locked — all six branches stay open.'}
          </Text>

          {/* The rail, and the count. Two ways of saying the same thing, because
              "1 of 3" is the one a reader can act on and the bar is the one they
              can feel. */}
          <View style={styles.railRow}>
            <View style={styles.rail}>
              {ONBOARDING_QUESTIONS.map((_, n) => (
                <View key={n} style={[styles.seg, n <= i && styles.segOn]} />
              ))}
            </View>
            <Text style={styles.count}>{i + 1} / {ONBOARDING_QUESTIONS.length}</Text>
          </View>

          <Animated.View
            key={q.id}
            entering={SlideInRight.duration(340).easing(Easing.out(Easing.cubic))}
            exiting={SlideOutLeft.duration(220)}
          >
            <Text style={styles.prompt}>{q.prompt}</Text>
            {q.options.map((o) => (
              <Option
                key={o.id}
                option={o}
                chosen={landing === o.id}
                dimmed={landing != null && landing !== o.id}
                onPress={() => choose(o.id)}
              />
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

/** One answer. Chunky, coloured by where it points, and it reacts when taken. */
function Option({
  option, chosen, dimmed, onPress,
}: {
  option: OnboardingOption; chosen: boolean; dimmed: boolean; onPress: () => void;
}) {
  const hue = BRANCH[leadBranch(option)];
  const [down, setDown] = useState(false);
  const pop = useSharedValue(0);

  // IN AN EFFECT, not in the render body. Writing a shared value while rendering
  // happens to work in Reanimated and is still a side effect during render —
  // it fires again on any unrelated re-render of this row, and under StrictMode
  // it fires twice.
  useEffect(() => {
    if (!chosen) { pop.value = 0; return; }
    pop.value = withSequence(
      withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }),
      withSpring(0.86, { damping: 9, stiffness: 200 }),
    );
  }, [chosen, pop]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: down && !chosen ? LIP.button : -6 * pop.value },
      { scale: 1 + 0.03 * pop.value },
    ],
    opacity: dimmed ? 0.35 : 1,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={dimmed || chosen}
      accessibilityRole="button"
      accessibilityLabel={option.text}
      style={styles.slot}
    >
      {/* The ledge, in the answer's own colour — see components/ui/Button for why
          the slab is absolute and only translateY animates. */}
      <View style={{ paddingBottom: LIP.button }}>
        <View pointerEvents="none" style={[styles.lip, { top: LIP.button, backgroundColor: hue }]} />
        <Animated.View
          style={[
            styles.opt,
            { borderColor: hue },
            chosen && { backgroundColor: hue },
            style,
          ]}
        >
          {/* A colour chip rather than a coloured border alone: at a 2px edge the
              six branch hues are hard to tell apart, and telling them apart is
              the only reason they are here. */}
          <View style={[styles.pip, { backgroundColor: chosen ? C.paper : hue }]} />
          <Text style={[styles.optText, chosen && { color: C.paper }]}>{option.text}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { padding: SPACE[4], paddingTop: SPACE[5], flexGrow: 1 },
  kicker: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 2.4, color: C.inkSoft, textAlign: 'center',
  },
  lede: {
    fontFamily: TYPE.body.family, fontSize: TYPE.label.fontSize, color: C.inkSoft,
    lineHeight: 21, textAlign: 'center', maxWidth: 330, alignSelf: 'center',
    marginTop: SPACE[2],
  },

  railRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[4], marginBottom: SPACE[4] },
  rail: { flex: 1, flexDirection: 'row', gap: SPACE[0], height: 10 },
  seg: { flex: 1, height: 10, borderRadius: RADIUS.pill, backgroundColor: C.hairline },
  segOn: { backgroundColor: C.ink },
  count: {
    fontFamily: TYPE.micro.family, fontSize: TYPE.micro.fontSize,
    letterSpacing: 1, color: C.inkSoft,
  },

  prompt: {
    fontFamily: TYPE.display.family, fontSize: TYPE.title.fontSize, color: C.ink,
    lineHeight: 31, marginBottom: SPACE[3], textAlign: 'center',
  },
  slot: { marginBottom: SPACE[2] },
  lip: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: RADIUS.button },
  opt: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE[2],
    borderWidth: 2, borderRadius: RADIUS.button,
    paddingVertical: SPACE[3], paddingHorizontal: SPACE[3],
    backgroundColor: C.surface,
  },
  pip: { width: 10, height: 10, borderRadius: 5 },
  optText: {
    flex: 1, fontFamily: TYPE.body.family, fontSize: TYPE.label.fontSize,
    color: C.ink, lineHeight: 21,
  },
  skip: { alignSelf: 'center', marginTop: SPACE[3], paddingVertical: SPACE[2], paddingHorizontal: SPACE[4] },
  skipText: { fontFamily: TYPE.label.family, fontSize: TYPE.label.fontSize, color: C.inkSoft },
});
