import { useCallback } from 'react';
import { StyleSheet, ScrollView, InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { RatePromptHost } from '@/components/shared/RatePrompt';
import QuickStartCard from '@/components/home/QuickStartCard';
import HomeHeader from '@/components/home/HomeHeader';
import SubjectCarousel from '@/components/home/SubjectCarousel';
import Arrive from '@/components/home/Arrive';
import { useCurtainLift } from '@/components/shared/Curtain';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';
import DoodleGround from '@/components/shared/DoodleGround';
import { WALL } from '@/components/shared/tone';


/** The page's side margin, which the subject shelf runs past to the screen's edge. */
const PAD = 24;

// ── HOME IS THREE THINGS NOW (2026-09-29) ────────────────────────────────────
//
// Ashmere went from philosophy to seven subjects, and the owner asked for a
// simpler Home to match: the masthead with the streak, the next lesson (Quick
// Start — the professor's intro until it has been watched), and the SUBJECTS
// as a sideways shelf, Brilliant's shape. The daily quotation and Thinker of the
// Day went with the Thinkers tab; the habit panel and the strolling stickman went
// for simplicity — the streak is one tap away on the masthead's count.
//
// If you are tempted to put shortcuts to other tabs back, check the tab bar first:
// they are sixty dp below.

export default function HomeScreen() {
  // A road's back arrow returns here behind the curtain; Home lifts it once drawn.
  useCurtainLift();
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  // Rest days are passed in so a streak they are about to save still READS as
  // alive. Without them the reader who missed yesterday sees a 0 on Home, gives
  // up on the streak they actually still have, and the rest day never gets spent.
  const streak = effectiveStreak(streakRaw, lastLessonDate, restDaysHeld(restDaysEarned, restDaysUsed));
  // THE WIDGET'S THINKER LANDS HERE NOW (2026-09-29). The Quote-of-the-Day widget is
  // compiled into the installed app and still links to a thinker; that link parks
  // the id and routes Home (app/thinker/[id].tsx), and Home opens their card —
  // keyed on FOCUS, after interactions and a beat, because every tab is built at
  // startup and a mount-keyed effect would slide a sheet over whatever screen the
  // reader was actually on. The Thinkers tab carried this effect until it went.
  const pendingThinker = useUIStore((s) => s.pendingPhilosopherId);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  useFocusEffect(
    useCallback(() => {
      if (!pendingThinker) return;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const task = InteractionManager.runAfterInteractions(() => {
        timer = setTimeout(() => {
          useUIStore.getState().setPendingPhilosopher(null);
          openPhilosopher(pendingThinker);
        }, 260);
      });
      return () => {
        task.cancel();
        if (timer) clearTimeout(timer);
      };
    }, [pendingThinker, openPhilosopher]),
  );

  return (
    <ScreenTransition bg={WALL}>
    <SafeAreaView style={styles.safe}>
      <DoodleGround />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead — the reader's own art, the wordmark, and today. Outside the
            stagger: it IS the page arriving, so it must already be there. */}
        <HomeHeader streak={streak} />

        {/* The next lesson this learner can open. FIRST, because lessons are the
            product: whatever sits directly under the masthead is what the app is
            claiming to be about. `quickStartLead` opens the gap that keeps two
            photographs from reading as one tall picture. */}
        <Arrive index={0}>
          <QuickStartCard style={styles.quickStartLead} />
        </Arrive>

        {/* Every subject, one swipe apart. */}
        <Arrive index={1}>
          <SubjectCarousel pad={PAD} style={styles.section} />
        </Arrive>

      </ScrollView>

      {/* The one rating ask, raised on the reader's first arrival here after
          onboarding and never again. It owns its own timing -- see the host in
          RatePrompt.tsx. Mounted HERE rather than at the root because Home is
          the only screen it may appear over. The home-screen widget's offer
          (WidgetOffer, in the tab layout) waits while this is up — the button
          that used to sit at the foot of this page went on 2026-10-02. */}
      <RatePromptHost />
    </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WALL },
  scroll: { flex: 1 },
  // flexGrow, NOT flex — `flex: 1` on a scroll content container pins it to the
  // viewport height and the view can never scroll.
  page: { flexGrow: 1, paddingHorizontal: PAD, paddingTop: 6, paddingBottom: 24 },

  // 22, not the 18 every other block uses. This one sits directly under the
  // masthead photograph and is itself a photograph; at 18 the two crops read as
  // a single tall picture with a wordmark buried in it.
  quickStartLead: { marginTop: 22 },
  section: { marginTop: 30 },
});
