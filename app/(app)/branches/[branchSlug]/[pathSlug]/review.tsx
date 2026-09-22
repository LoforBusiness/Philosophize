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
//
// AND IT OPENS ON THE SAME LOADER EVERY LESSON OPENS ON. `LessonLoader` — the block
// tumbling down the staircase — is mounted by the lesson ROUTE, not by any runner, so
// a review being played by the same player was never going to inherit it. A review is
// entered the same way a lesson is, from the same road, and arriving straight into a
// beat where every lesson gives a moment first reads as the review being a different
// kind of thing. It is not.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_BRANCHES } from '@/data';
import LessonLoader from '@/components/lesson/LessonLoader';
import { LessonGuideHost } from '@/components/lesson/cinematic/LessonGuide';
import UnitReview, { hasReview } from '@/components/lesson/cinematic/review/UnitReview';
import { exitLesson } from '@/components/lesson/exitLesson';
import { track } from '@/lib/posthog';

export default function UnitReviewScreen() {
  const { branchSlug, pathSlug } = useLocalSearchParams<{ branchSlug: string; pathSlug: string }>();
  const branch = ALL_BRANCHES.find((b) => b.slug === branchSlug) ?? null;
  const unit = branch?.paths.find((p) => p.slug === pathSlug) ?? null;
  const ok = !!branch && !!unit && hasReview(unit.id);
  const [loading, setLoading] = useState(true);

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

  // It sits BELOW the not-found return, exactly as the lesson route puts it below its
  // own gates: a unit with no review is an error state, and a moment's pause in front
  // of one is a moment spent on nothing.
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LessonLoader onDone={() => setLoading(false)} />
      </View>
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
