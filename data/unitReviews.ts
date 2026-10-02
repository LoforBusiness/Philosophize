// ─────────────────────────────────────────────────────────────────────────────
// THE REVIEW AT THE END OF A UNIT.
//
// The owner: *"at the end of each unit there is a lesson review … it goes through
// some of the information that was talked about or questions or different kinds of
// questions that are asked inside the unit that the user just completed. This
// operates just like another lesson but it's strictly for a lesson review. I want
// all the animations, all the things a lesson has into this review. And at the end …
// a certificate or a celebration."*
//
// ── WHY THE QUESTIONS ARE NEW AND THE STAGE IS SHARED ───────────────────────
//
// Two decisions, both the owner's, and they pull in opposite directions on cost.
// The QUESTIONS are written per unit rather than recycled from the lessons: a
// review that re-asks the lesson's own question is a lesson played twice, and the
// interesting question at the end of a unit is the one that only makes sense once
// all of it has been read — which of these three theories the trolley case splits,
// which of four fallacies this argument is. The STAGE is shared, because a
// hand-drawn scene per unit is the same build as twenty-eight new lessons.
//
// So a review declares WHAT IS ON THE TABLE — up to four ideas the unit covered, as
// labelled plates — and the shared scene stages them, walks the figure between them,
// lights the one under discussion and hands the question to the player's own
// controls. Every animation a lesson has, because it IS the lesson player.
//
// ── IT IS NOT A LESSON, AND THREE THINGS FOLLOW ─────────────────────────────
//
//   · it is not in `ALL_BRANCHES`, so it never moves `lessonsByUnit` and cannot
//     disturb the per-unit progress model or the free-tier gate;
//   · it is not in the `CINEMATIC` map, so `check:cinematic`'s house shape — 7–11
//     beats, exactly two graded questions, one quote, the summary last — does not
//     apply, and a review is free to be four questions and no quote;
//   · it has no narration, no must-boxes and no generated tables. The tables are all
//     keyed by lesson id and a review's id is absent from every one of them, which
//     every reader of them already handles.
//
// `XP_PER_PATH_MASTERY` has been defined and unused since the beginning; a finished
// review is what pays it, once.
// ─────────────────────────────────────────────────────────────────────────────
import type { InteractBlock } from '@/components/lesson/cinematic/cinematicKit';

/** One step of a review: a line to read, and sometimes a question to answer. */
export interface ReviewStep {
  /**
   * The line, in the deck, exactly as a lesson's narration sits there.
   *
   * Optional, and absent on a question step: a graded beat's words are its PROMPT,
   * and a lesson that also narrated over its own question would be talking across it
   * (group O — the reveal owns that moment).
   */
  text?: string;
  /**
   * Which of the unit's plates this step is about, or −1 for none.
   *
   * The figure walks to it and it lights. That is the whole of the staging language:
   * a review is a tour of the things the unit put on the table.
   */
  at?: number;
  /** How many plates have arrived by now. Latched — a review builds its table up. */
  upto?: number;
  /** A graded question, in exactly the shape a lesson beat carries one. */
  ask?: InteractBlock;
}

export interface UnitReview {
  /** Up to four ideas the unit covered, in the words the lessons used for them. */
  plates: string[];
  /** The steps, in order. */
  steps: ReviewStep[];
}

/**
 * Keyed by UNIT id — the `Path.id` in `data/branches/<branch>/paths/<unit>/index.ts`.
 * A unit with no entry simply has no review, which is what every unit had before.
 */
export const UNIT_REVIEWS: Record<string, UnitReview> = {
  // ── EPISTEMOLOGY 1 · What Is Knowledge? ─────────────────────────────────────
};
