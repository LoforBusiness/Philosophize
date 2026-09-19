// ─────────────────────────────────────────────────────────────────────────────
// THE UNIT REVIEW SCREEN.
//
// A sibling of the lesson route rather than a lesson inside it, because a review is
// not a lesson: it is not in `ALL_BRANCHES`, it never moves `lessonsByUnit`, and it
// is reached by unit rather than by lesson id. It is entered with `openReview` in
// `components/lesson/lessonNav.ts`, which pushes with the anchor the nested stack
// needs (§11's check:nav — a tab entered from outside itself has nothing beneath it).
//
// It is wrapped in `LessonGuideHost` for the same reason the cinematic lesson is: a
// review is played by `CinematicPlayer`, so it has the same tap-left-to-go-back
// navigation, and the guide that explains it belongs in the ROUTE rather than in the
// player (group AI — a harness renders players directly and would freeze on beat 0).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_BRANCHES } from '@/data';
import { LessonGuideHost } from '@/components/lesson/cinematic/LessonGuide';
import UnitReview, { hasReview } from '@/components/lesson/cinematic/review/UnitReview';
import { exitLesson } from '@/components/lesson/exitLesson';
import { track } from '@/lib/posthog';

export default function UnitReviewScreen() {
  const { branchSlug, pathSlug } = useLocalSearchParams<{ branchSlug: string; pathSlug: string }>();
  const branch = ALL_BRANCHES.find((b) => b.slug === branchSlug) ?? null;
  const unit = branch?.paths.find((p) => p.slug === pathSlug) ?? null;
  const ok = !!branch && !!unit && hasReview(unit.id);

  useEffect(() => {
    if (ok && unit) track('unit_review_started', { unit_id: unit.id, branch_slug: branchSlug });
  }, [ok, unit, branchSlug]);

  if (!ok || !branch || !unit) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF7' }}>
        <Text style={{ fontFamily: 'Inter_500Medium', color: '#1A1A1A' }}>
          This unit has no review yet.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LessonGuideHost>
        <UnitReview
          unitId={unit.id}
          unitName={unit.name}
          branchSlug={branch.slug}
          lessons={unit.lessons.length}
          onLeave={exitLesson}
        />
      </LessonGuideHost>
    </View>
  );
}
