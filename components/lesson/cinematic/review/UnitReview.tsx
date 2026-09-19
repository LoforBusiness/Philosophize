// ─────────────────────────────────────────────────────────────────────────────
// A UNIT REVIEW, PLAYED BY THE LESSON PLAYER.
//
// The owner asked for *"all the animations, all the things a lesson has"*, and the
// only way to be certain of that is not to reimplement any of it. A review is handed
// to `CinematicPlayer` as a lesson: the deck, the camera, the six answer controls,
// the verdict seal, the XP coin, the rising letters, tap-left-to-go-back and its
// guide are the same code paths rather than lookalikes.
//
// Three seams make that possible, and each is deliberately small:
//
//   · THE LESSON IS SYNTHETIC. The player wants a `Lesson` for its id, its title and
//     the reward hand-off; a review builds one that is in no branch, so it can never
//     touch `lessonsByUnit`, the free-tier gate or any generated table (every one of
//     which is keyed by lesson id and handles a missing key by doing nothing).
//   · THE BEATS ARE GENERATED from `data/unitReviews.ts` rather than authored as a
//     script, because the shape is the same every time: a line, sometimes a
//     question, and a plate to stand beside.
//   · THE ENDING IS THE ONE PROP THE PLAYER GAINED. `finish` replaces the reward
//     overlay with the unit stamp; without it the player ends exactly as it always
//     has for all 246 lessons.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useMemo, useState } from 'react';
import type { Lesson } from '@/data/types';
import { UNIT_REVIEWS, type ReviewStep } from '@/data/unitReviews';
import { XP_PER_CORRECT_ANSWER, XP_PER_PATH_MASTERY } from '@/constants/xp';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { track } from '@/lib/posthog';
import CinematicPlayer, { type SceneApi } from '../CinematicPlayer';
import type { BaseBeat } from '../cinematicKit';
import ReviewScene from './ReviewScene';
import UnitStamp from './UnitStamp';

/** The band the shared stage occupies — the plates, the figure and the floor. */
const BAND: [number, number] = [268, 530];

/** Is there a review for this unit at all? */
export function hasReview(unitId: string): boolean {
  return !!UNIT_REVIEWS[unitId];
}

/**
 * The beats, from the steps.
 *
 * A review has NO summary beat: the summary's job is to say what the lesson was
 * about, and the celebration that follows says what the unit was about far better
 * than a card would. `stageGone` therefore keeps the picture up to the last tap.
 */
function beatsOf(steps: ReviewStep[]): BaseBeat[] {
  return steps.map((s) => ({
    ...(s.text ? { text: s.text } : {}),
    ...(s.ask ? { interact: s.ask } : {}),
    dur: s.ask ? 1.0 : 1.8,
  }));
}

export default function UnitReview({
  unitId, unitName, branchSlug, lessons, onLeave,
}: {
  unitId: string;
  unitName: string;
  branchSlug: string;
  /** How many lessons the unit holds, for the celebration's tally. */
  lessons: number;
  onLeave: () => void;
}) {
  const armWalk = useUIStore((st) => st.markLessonFinished);
  const review = UNIT_REVIEWS[unitId];
  const [done, setDone] = useState(false);
  // WHAT THE READER EARNED, CAPTURED BEFORE IT IS BANKED. `first` is read from the
  // store, and `markUnitReviewed` writes to the store — so the celebration rendered
  // after it saw a unit that had already been reviewed and offered +0 XP for it.
  const [earned, setEarned] = useState(0);
  const reviewed = useUserDataStore((st) => st.unitsReviewed);
  const markReviewed = useUserDataStore((st) => st.markUnitReviewed);
  const first = !reviewed.includes(unitId);

  const beats = useMemo(() => beatsOf(review?.steps ?? []), [review]);
  const lesson = useMemo<Lesson>(() => ({
    id: `review:${unitId}`,
    title: `${unitName} · Review`,
    subtitle: 'Unit review',
    estimatedMinutes: 3,
    cards: [],
  } as unknown as Lesson), [unitId, unitName]);

  // THE MASTERY XP IS PAID ONCE, and `XP_PER_PATH_MASTERY` has been defined and
  // unused since the constant file was written. A review can be replayed as often as
  // the reader likes; it cannot be farmed.
  // The store pays the mastery XP and records the unit in one statement, so "once"
  // cannot come apart from the record of it.
  const finish = useCallback((r: { correct: number; total: number }) => {
    track('unit_review_completed', {
      unit_id: unitId, branch_slug: branchSlug, correct: r.correct, total: r.total, first,
    });
    // What the header has been counting all the way through, plus the mastery.
    const answers = r.correct * XP_PER_CORRECT_ANSWER;
    setEarned(answers + (first ? XP_PER_PATH_MASTERY : 0));
    markReviewed(unitId, answers);
    setDone(true);
  }, [markReviewed, unitId, branchSlug, first]);

  const Scene = useCallback(
    (api: SceneApi) => (
      <ReviewScene {...api} plates={review?.plates ?? []} steps={review?.steps ?? []} branch={branchSlug} />
    ),
    [review, branchSlug],
  );

  if (!review) return null;
  return (
    <>
      <CinematicPlayer
        lesson={lesson}
        beats={beats}
        Scene={Scene}
        band={BAND}
        stageGone={() => false}
        finish={finish}
      />
      {done ? (
        <UnitStamp
          unitName={unitName}
          branch={branchSlug}
          lessons={lessons}
          xp={earned}
          onDone={() => {
            // THE FIGURE WALKS ON. The branch road treats a review as the stop after
            // its unit's last lesson, so arming the same finish event the reward
            // screen arms sends him from the review into the next unit — with the id
            // the road gave the stop, which is what the walk looks itself up by.
            armWalk({ lessonId: `review:${unitId}`, unitId, branchSlug });
            onLeave();
          }}
        />
      ) : null}
    </>
  );
}
