import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById, lessonAccessibility } from '@/data';
import { subjectOfBranch } from '@/data/subjects';
import type { Lesson } from '@/data/types';
import LoaderHandoff from '@/components/lesson/LoaderHandoff';
import { useCurtainLift } from '@/components/shared/Curtain';
import { exitLesson } from '@/components/lesson/exitLesson';
import { track } from '@/lib/posthog';
import { LessonGuideHost } from '@/components/lesson/cinematic/LessonGuide';
import { Econ1Lesson } from '@/components/lesson/cinematic/econ1Scene';
import { Phil2Lesson } from '@/components/lesson/cinematic/phil2Scene';
import { Psych2Lesson } from '@/components/lesson/cinematic/psych2Scene';
import { Growth2Lesson } from '@/components/lesson/cinematic/growth2Scene';
import { Biz2Lesson } from '@/components/lesson/cinematic/biz2Scene';
import { Econ2Lesson } from '@/components/lesson/cinematic/econ2Scene';
import { Sci2Lesson } from '@/components/lesson/cinematic/sci2Scene';
import { Hist2Lesson } from '@/components/lesson/cinematic/hist2Scene';
import { Phil3Lesson } from '@/components/lesson/cinematic/phil3Scene';
import { Psych3Lesson } from '@/components/lesson/cinematic/psych3Scene';
import { Growth3Lesson } from '@/components/lesson/cinematic/growth3Scene';
import { Biz3Lesson } from '@/components/lesson/cinematic/biz3Scene';
import { Econ3Lesson } from '@/components/lesson/cinematic/econ3Scene';
import { Sci3Lesson } from '@/components/lesson/cinematic/sci3Scene';
import { Hist3Lesson } from '@/components/lesson/cinematic/hist3Scene';
import { Phil4Lesson } from '@/components/lesson/cinematic/phil4Scene';
import { Psych4Lesson } from '@/components/lesson/cinematic/psych4Scene';
import { Growth4Lesson } from '@/components/lesson/cinematic/growth4Scene';
import { Biz4Lesson } from '@/components/lesson/cinematic/biz4Scene';
import { Econ4Lesson } from '@/components/lesson/cinematic/econ4Scene';
import { Sci4Lesson } from '@/components/lesson/cinematic/sci4Scene';
import { Hist4Lesson } from '@/components/lesson/cinematic/hist4Scene';
import { Hist5Lesson } from '@/components/lesson/cinematic/hist5Scene';
import { Phil5Lesson } from '@/components/lesson/cinematic/phil5Scene';
import { Psych5Lesson } from '@/components/lesson/cinematic/psych5Scene';
import { Growth5Lesson } from '@/components/lesson/cinematic/growth5Scene';
import { Biz5Lesson } from '@/components/lesson/cinematic/biz5Scene';
import { Econ5Lesson } from '@/components/lesson/cinematic/econ5Scene';
import { Sci5Lesson } from '@/components/lesson/cinematic/sci5Scene';
import { Phil6Lesson } from '@/components/lesson/cinematic/phil6Scene';
import { Psych6Lesson } from '@/components/lesson/cinematic/psych6Scene';
import { Growth6Lesson } from '@/components/lesson/cinematic/growth6Scene';
import { Biz6Lesson } from '@/components/lesson/cinematic/biz6Scene';
import { Econ6Lesson } from '@/components/lesson/cinematic/econ6Scene';
import { Sci6Lesson } from '@/components/lesson/cinematic/sci6Scene';
import { Hist6Lesson } from '@/components/lesson/cinematic/hist6Scene';
import { Phil7Lesson } from '@/components/lesson/cinematic/phil7Scene';
import { Biz7Lesson } from '@/components/lesson/cinematic/biz7Scene';
import { Econ7Lesson } from '@/components/lesson/cinematic/econ7Scene';
import { Hist7Lesson } from '@/components/lesson/cinematic/hist7Scene';
import { Growth7Lesson } from '@/components/lesson/cinematic/growth7Scene';
import { Psych7Lesson } from '@/components/lesson/cinematic/psych7Scene';
import { Sci7Lesson } from '@/components/lesson/cinematic/sci7Scene';
import { Caesar1Lesson } from '@/components/lesson/cinematic/caesar1Scene';
import { Phil1Lesson } from '@/components/lesson/cinematic/phil1Scene';
import { Psych1Lesson } from '@/components/lesson/cinematic/psych1Scene';
import { Growth1Lesson } from '@/components/lesson/cinematic/growth1Scene';
import { Biz1Lesson } from '@/components/lesson/cinematic/biz1Scene';
import { Sci1Lesson } from '@/components/lesson/cinematic/sci1Scene';
import { Hist1Lesson } from '@/components/lesson/cinematic/hist1Scene';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import LessonLocked from '@/components/paywall/LessonLocked';
import HardPaywall from '@/components/paywall/HardPaywall';
import ProfessorIntro from '@/components/professor/ProfessorIntro';
import { PROFESSOR_INTRO_ON } from '@/components/professor/openIntro';
import { openedLesson, closedLesson } from '@/lib/analytics/lessonClock';

const Page = '#FAFAF7';

// Every lesson the app can open, by id. A cinematic component takes the `{ lesson }`
// prop and renders LessonReward itself when it finishes, so XP, the streak, badges
// and the daily counter all run through exactly one path.
// A lesson id with no entry here opens nothing: the same "Lesson not found." a
// retired id gets. There used to be a card runner to fall back on; it went with the
// narrated library on 2026-10-02, so removing an entry is no longer a rollback.
// EXPORTED so the lesson audit can mount any scene without duplicating the map.
// A named export in a route file is inert — Expo Router only reads the default.
export const CINEMATIC: Record<string, React.ComponentType<{ lesson: Lesson }>> = {
  // The dialogue lessons, three on each subject's road (CLAUDE.md §23). Philosophy's 246
  // narrated lessons were deleted on 2026-10-02; a reader's progress in them is kept as
  // counts only (data/retiredBranches.ts).
  'economics-foundations-1': Econ1Lesson,
  'economics-foundations-2': Econ2Lesson,
  'economics-foundations-3': Econ3Lesson,
  'economics-foundations-4': Econ4Lesson,
  'economics-foundations-5': Econ5Lesson,
  'economics-foundations-6': Econ6Lesson,
  'economics-foundations-7': Econ7Lesson,
  'philosophy-foundations-1': Phil1Lesson,
  'philosophy-foundations-2': Phil2Lesson,
  'philosophy-foundations-3': Phil3Lesson,
  'philosophy-foundations-4': Phil4Lesson,
  'philosophy-foundations-5': Phil5Lesson,
  'philosophy-foundations-6': Phil6Lesson,
  'philosophy-foundations-7': Phil7Lesson,
  'psychology-foundations-1': Psych1Lesson,
  'psychology-foundations-2': Psych2Lesson,
  'psychology-foundations-3': Psych3Lesson,
  'psychology-foundations-4': Psych4Lesson,
  'psychology-foundations-5': Psych5Lesson,
  'psychology-foundations-6': Psych6Lesson,
  'psychology-foundations-7': Psych7Lesson,
  'personal-growth-foundations-1': Growth1Lesson,
  'personal-growth-foundations-2': Growth2Lesson,
  'personal-growth-foundations-3': Growth3Lesson,
  'personal-growth-foundations-4': Growth4Lesson,
  'personal-growth-foundations-5': Growth5Lesson,
  'personal-growth-foundations-6': Growth6Lesson,
  'personal-growth-foundations-7': Growth7Lesson,
  'business-foundations-1': Biz1Lesson,
  'business-foundations-2': Biz2Lesson,
  'business-foundations-3': Biz3Lesson,
  'business-foundations-4': Biz4Lesson,
  'business-foundations-5': Biz5Lesson,
  'business-foundations-6': Biz6Lesson,
  'business-foundations-7': Biz7Lesson,
  'science-foundations-1': Sci1Lesson,
  'science-foundations-2': Sci2Lesson,
  'science-foundations-3': Sci3Lesson,
  'science-foundations-4': Sci4Lesson,
  'science-foundations-5': Sci5Lesson,
  'science-foundations-6': Sci6Lesson,
  'science-foundations-7': Sci7Lesson,
  'history-foundations-1': Hist1Lesson,
  'history-foundations-2': Hist2Lesson,
  'history-foundations-3': Hist3Lesson,
  'history-foundations-4': Hist4Lesson,
  'history-foundations-5': Hist5Lesson,
  'history-foundations-6': Hist6Lesson,
  'history-foundations-7': Hist7Lesson,
  'history-caesar-1': Caesar1Lesson,
};

export default function LessonScreen() {
  const { lessonId, test } = useLocalSearchParams<{ lessonId: string; test?: string }>();
  const result = getLessonById(lessonId);
  // ── PLAYED FROM THE LESSON TESTER ──────────────────────────────────────────
  //
  // Only ever true when the hidden tester pushed this route, and it does two
  // things: it opens a lesson the reader has not earned, and it tells
  // LessonReward to write nothing when the lesson ends.
  //
  // The flag is NAMED WITH THE LESSON and re-set on every mount — to this id
  // under test, to null otherwise. So there is no state to leak: walking out of
  // a test run and into a real lesson clears it on the way in, and a real run
  // can never be silently swallowed.
  const testing = test === '1';
  const setTestLesson = useUIStore((s) => s.setTestLesson);
  useEffect(() => {
    setTestLesson(testing ? lessonId : null);
  }, [lessonId, testing, setTestLesson]);
  // Quick Start arrives behind the curtain (components/shared/Curtain.tsx); the
  // route lifts it once drawn, whichever of its screens that turns out to be.
  useCurtainLift();

  const isPro = useSubscriptionStore((s) => s.isPro);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  // The one free lesson (userDataStore.freeLesson): a reader without the Pass may
  // open any lesson they have reached until they finish one, and then only that one.
  const freeLesson = useUserDataStore((s) => s.freeLesson);
  // The gate screens are their own components now (components/paywall/), so the
  // reader's name, rank and card width are read where they are drawn rather than
  // here — this route was carrying six store reads and a width calculation for
  // two screens it did not otherwise know anything about.

  // ── ONCE IT HAS OPENED, IT STAYS OPEN FOR THIS VISIT ───────────────────────
  //
  // Access is computed LIVE, so a stale pre-hydration `{}` cannot false-lock a
  // finished lesson reached by deep link. That used to be safe on its own,
  // because "completing a lesson only ever advances progress, which can unlock
  // but never lock".
  //
  // THAT INVARIANT IS GONE. Every lesson needs the Pass since the hard paywall
  // (2026-09-25), so a trial that ENDS while a reader is mid-lesson closes the
  // lesson live, while they are still standing in it. Without the latch below
  // they are thrown onto the paywall at the exact moment they earn the reward,
  // for a lesson they have this second completed. It is the worst possible
  // place to put one. (Before the hard paywall the same thing happened to a free
  // reader finishing lesson 3, which then became a paid replay.)
  //
  // A ONE-WAY latch: openable → stays openable until they leave. It does not
  // latch the other way, so buying the Pass mid-lesson still unlocks at once.
  const live = lessonAccessibility(lessonId, lessonsByUnit, isPro, freeLesson);
  const everOpen = useRef(false);
  if (live.accessible) everOpen.current = true;
  const access = everOpen.current ? { accessible: true, gatedByPro: false } : live;
  const locked = !access.accessible && !testing;
  const gatedByPro = access.gatedByPro;

  // ── THE BACKSTOP FOR THE PROFESSOR'S INTRO ─────────────────────────────────
  //
  // The intro's two doors are Home's Quick Start and the Learn tab, and it never
  // plays by itself (2026-09-25). But a lesson can still be reached another way —
  // a thinker's "lessons featuring", an old link — and one reached like that
  // before the intro has been watched plays it first. That is still a reader's
  // tap. After it: the lesson with the Pass, the paywall without (`source:
  // intro`). Every hook here sits above the early returns below (§17 rule 1).
  const introSeen = useUserDataStore((s) => s.seenProfessorIntro);
  const markIntroSeen = useUserDataStore((s) => s.markProfessorIntroSeen);
  const [afterIntro, setAfterIntro] = useState(false);

  if (!result || !CINEMATIC[lessonId]) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#1A1A1A', fontSize: 18 }}>Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  // Wait for persisted progress before deciding access, so a
  // cold deep-link into a lesson never evaluates the gates against an empty
  // default store. AsyncStorage rehydration is near-instant.
  if (!hasHydrated) {
    return <ScreenTransition bg="#FAFAF7"><View style={{ flex: 1, backgroundColor: '#FAFAF7' }} /></ScreenTransition>;
  }

  // ── THE GATE, DRAWN ELSEWHERE ──────────────────────────────────────────────
  //
  // Since the hard paywall (2026-09-25) there are two ways a lesson stays shut.
  // Where the Pass would open it, the one paywall: access is computed live, so
  // the moment a trial starts or a purchase lands this route re-renders straight
  // into the lesson and nothing needs doing in `onUnlocked`. Where it would not
  // (a Pass holder further along a unit than they have read), `LessonLocked`
  // names the lesson to open instead, and shows no paywall.
  // The professor lectures on PHILOSOPHY (professorScript.ts names its six branches),
  // so he stands in front of a philosophy lesson only; another subject's lesson opens
  // straight onto its own gate.
  const philosophyLesson = subjectOfBranch(result?.branch.slug ?? '')?.slug === 'philosophy';
  if (PROFESSOR_INTRO_ON && !introSeen && !testing && !afterIntro && philosophyLesson) {
    return (
      <ScreenTransition bg={Page}>
        <ProfessorIntro onDone={() => { markIntroSeen(); setAfterIntro(true); }} />
      </ScreenTransition>
    );
  }

  if (locked) {
    return (
      <ScreenTransition bg={Page}>
        {gatedByPro ? (
          <HardPaywall source={afterIntro ? 'intro' : 'locked_lesson'} onClose={exitLesson} />
        ) : (
          <LessonLocked
            lesson={result.lesson}
            branch={result.branch}
            unit={result.path}
            onExit={exitLesson}
          />
        )}
      </ScreenTransition>
    );
  }

  const Runner = CINEMATIC[lessonId];

  return (
    <ScreenTransition bg="#FAFAF7">
      {/* The loader stays over the lesson until its stage has drawn, then lifts off it
          (LoaderHandoff, AI8): no blank frame between the two. */}
      <LoaderHandoff>
        {(revealed) => (
          // THE LESSON GUIDE is mounted HERE, around the lesson, rather than inside a
          // player: the browser harnesses render lesson components directly, so they
          // can never meet it (components/lesson/cinematic/LessonGuide.tsx).
          <LessonGuideHost revealed={revealed}>
            <StartedRunner
              Runner={Runner}
              lesson={result.lesson}
              branchSlug={result.branch.slug}
              unitId={result.path.id}
              format="cinematic"
            />
          </LessonGuideHost>
        )}
      </LoaderHandoff>
    </ScreenTransition>
  );
}

/**
 * WHERE `lesson_started` BELONGS, which is here and not inside a runner.
 *
 * It used to live in LessonRunner — the CARD runner — so it reported the 90 card
 * lessons and none of the 102 cinematic ones. Meanwhile `lesson_completed` fires
 * from LessonReward, which every runner reaches. The result was a funnel that
 * counted completions with no matching starts: cinematic lessons appeared to have
 * an impossible completion rate and card lessons looked worse than they were, and
 * the comparison between the two formats — the single most important content
 * question this app has (§5) — read exactly backwards.
 *
 * This wrapper mounts with whichever runner the route chose, so a new runner is
 * instrumented by existing, not by remembering. `format` is what makes the
 * cinematic-versus-cards question answerable at all.
 */
function StartedRunner({
  Runner,
  lesson,
  branchSlug,
  unitId,
  format,
}: {
  Runner: React.ComponentType<{ lesson: Lesson }>;
  lesson: Lesson;
  branchSlug: string;
  unitId: string;
  format: 'cinematic' | 'cards';
}) {
  useEffect(() => {
    track('lesson_started', {
      lesson_id: lesson.id,
      branch_slug: branchSlug,
      unit_id: unitId,
      format,
      total_cards: lesson.cards.length,
    });
    // AND START THE CLOCK. The reward screen is a global overlay and cannot see
    // any of these four facts; the cleanup is what turns a missing completion
    // into a reportable one — see lib/analytics/lessonClock.ts.
    openedLesson({ lesson_id: lesson.id, branch_slug: branchSlug, unit_id: unitId, format });
    return closedLesson;
    // Once per lesson, not once per re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);
  return <Runner lesson={lesson} />;
}

// NO STYLESHEET. Everything this route used to style belonged to the two gate
// screens, and both now draw themselves (components/paywall/). What is left is a
// router: it decides hydration, access and the daily limit, then hands over.
