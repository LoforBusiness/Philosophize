// ─────────────────────────────────────────────────────────────────────────────
// Daily Review — the spaced-repetition engine.
//
// WHAT IS SCHEDULED IS A LESSON, NOT A QUESTION. Every lesson carries a card
// deck in data/ even when it plays as a cinematic scene (§11 keeps the deck as
// the rollback fallback), so its questions are re-presentable no matter which
// runner the reader actually used. That means the review pool needs no capture
// at all — and lesson-level correctness, which both runners already compute and
// hand to the reward overlay, is enough to schedule with. Tracking per question
// would add a whole capture path to buy precision the ladder below cannot use.
//
// The ladder is Leitner, not SM-2. Per-item ease factors need dozens of
// repetitions per item to mean anything, and a lesson has two questions.
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_BRANCHES, getLessonById } from '@/data';
import type { CardData, Lesson } from '@/data/types';

/** Days until the next sighting, indexed by strength. */
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35] as const;
export const MAX_STRENGTH = REVIEW_INTERVALS.length - 1;

/** How many questions a free reader gets per day. Scholar's Pass has no cap. */
export const FREE_DAILY_REVIEW_QUESTIONS = 3;

/** Cap on one Pass session, so a long backlog is a sitting rather than a slog. */
export const MAX_REVIEW_SESSION = 12;

export interface ReviewEntry {
  /** 0…MAX_STRENGTH — how well it is holding. */
  s: number;
  /** Day key ('YYYY-MM-DD') this lesson next wants seeing. */
  due: string;
  /**
   * Epoch ms this entry was last written.
   *
   * Carried ONLY so two devices can be merged correctly. Every other field here
   * is progress-shaped, where "keep the larger" is right, but a review entry can
   * legitimately go DOWN — failing a question drops it to strength 0 — and a
   * max-merge would quietly undo that, handing back a mastery the reader just
   * demonstrated they had lost. Newest-write-wins is the only rule that respects
   * a fall, and it needs a clock to sort by.
   */
  t: number;
}

export type ReviewState = Record<string, ReviewEntry>;

/** One question, flattened out of whichever interaction shape it came from. */
export interface ReviewQuestion {
  lessonId: string;
  lessonTitle: string;
  branchSlug: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
}

// ─── day keys ────────────────────────────────────────────────────────────────
// 'YYYY-MM-DD' in LOCAL time, matching what the lesson runner writes to
// lastLessonDate. Local rather than UTC because a streak and a due date are both
// about the reader's calendar day, not the server's.

export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  // Month is 0-indexed on the way in; Date normalises overflow, so day 32 of a
  // 31-day month becomes the 1st of the next. That is what carries this across
  // month and year boundaries without any arithmetic of our own.
  return dayKey(new Date(y, m - 1, d + n));
}

/** Lexicographic comparison is date order for zero-padded 'YYYY-MM-DD'. */
export function isDue(entry: ReviewEntry, today: string): boolean {
  return entry.due <= today;
}

// ─── the ladder ──────────────────────────────────────────────────────────────

/**
 * The entry a just-finished lesson enters the schedule with.
 *
 * A clean run starts two rungs up because it has already been demonstrated
 * once; anything less starts at the bottom and comes back tomorrow. This is the
 * whole of what "which ones you got wrong" buys us, and it is bought from
 * numbers both runners already produce.
 */
export function seedEntry(correct: number, total: number, today: string): ReviewEntry {
  const perfect = total > 0 && correct === total;
  const s = perfect ? 2 : 0;
  return { s, due: addDays(today, REVIEW_INTERVALS[s]), t: Date.now() };
}

/** Move a lesson up one rung, or all the way back down on a miss. */
export function gradeEntry(entry: ReviewEntry, wasCorrect: boolean, today: string): ReviewEntry {
  const s = wasCorrect ? Math.min(entry.s + 1, MAX_STRENGTH) : 0;
  return { s, due: addDays(today, REVIEW_INTERVALS[s]), t: Date.now() };
}

// ─── the pool ────────────────────────────────────────────────────────────────

/**
 * Every gradeable question in a lesson's deck, flattened to one shape.
 *
 * Three of the interaction types reduce to "tap one of these, one is right",
 * which is the only shape this screen renders: `multiple-choice`, `true-false`,
 * and `tap-flaw` — whose steps ARE its options, with the flawed one as the
 * answer. `sort` and `two-camps` are genuinely gestural (an ordering, a throw
 * into one of two camps) and would need their own surface to be asked honestly.
 * A `dilemma` has no correct answer at all: it reveals what thinkers said after
 * you choose, which is the opposite of a thing to be graded on.
 */
export function questionsForLesson(lesson: Lesson, branchSlug: string): ReviewQuestion[] {
  const out: ReviewQuestion[] = [];
  lesson.cards.forEach((card: CardData) => {
    if (card.type !== 'question') return;
    const it = card.interaction;
    if (it.type === 'multiple-choice') {
      out.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        branchSlug,
        prompt: card.prompt,
        options: it.options.map((o) => ({ id: o.id, text: o.text, correct: o.isCorrect })),
        explanation: it.explanation,
      });
    } else if (it.type === 'true-false') {
      out.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        branchSlug,
        prompt: card.prompt,
        options: [
          { id: 'true', text: 'True', correct: it.answer === true },
          { id: 'false', text: 'False', correct: it.answer === false },
        ],
        explanation: it.explanation,
      });
    } else if (it.type === 'tap-flaw') {
      out.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        branchSlug,
        prompt: card.prompt,
        options: it.steps.map((s) => ({ id: s.id, text: s.text, correct: s.id === it.flawedId })),
        explanation: it.explanation,
      });
    }
  });
  return out;
}

/** True if this lesson can supply a review question at all. */
export function isReviewable(lessonId: string): boolean {
  const found = getLessonById(lessonId);
  if (!found) return false;
  return questionsForLesson(found.lesson, found.branch.slug).length > 0;
}

// ─── choosing a session ──────────────────────────────────────────────────────

/**
 * A stable small number from a lesson id. Used to spread a backfilled backlog
 * across the calendar and to pick WHICH question of a lesson gets asked, so
 * both are deterministic — the same reader opening review twice in a day is
 * shown the same thing rather than a reshuffle that looks like a bug.
 */
export function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Lesson ids due today, oldest due date first (longest overdue leads). */
export function dueLessonIds(state: ReviewState, today: string): string[] {
  return Object.keys(state)
    .filter((id) => isDue(state[id], today))
    .sort((a, b) => (state[a].due < state[b].due ? -1 : state[a].due > state[b].due ? 1 : 0));
}

/**
 * Build the questions for one session: one question per due lesson, rotating
 * WHICH question by strength so a second sighting is not the identical card.
 */
export function buildSession(state: ReviewState, today: string, limit: number): ReviewQuestion[] {
  const out: ReviewQuestion[] = [];
  for (const id of dueLessonIds(state, today)) {
    if (out.length >= limit) break;
    const found = getLessonById(id);
    if (!found) continue; // lesson removed since it was scheduled
    const qs = questionsForLesson(found.lesson, found.branch.slug);
    if (qs.length === 0) continue;
    out.push(qs[(hashId(id) + state[id].s) % qs.length]);
  }
  return out;
}

// ─── backfill ────────────────────────────────────────────────────────────────

/** Lesson ids a reader has completed, derived from the per-unit counters. */
export function completedLessonIds(lessonsByUnit: Record<string, number>): string[] {
  const out: string[] = [];
  for (const branch of ALL_BRANCHES) {
    for (const unit of branch.paths) {
      const done = lessonsByUnit[unit.id] ?? 0;
      for (let i = 0; i < Math.min(done, unit.lessons.length); i++) out.push(unit.lessons[i].id);
    }
  }
  return out;
}

/** Days a backfilled backlog is spread across. */
export const BACKFILL_SPREAD = 14;

/**
 * Schedule completed lessons that are not in the schedule yet.
 *
 * Two callers, one job. On the update that introduces review it catches
 * everything finished beforehand — without it the feature would look broken for
 * weeks to exactly the readers who have earned it most, their queue empty until
 * enough NEW lessons filled it. Afterwards it catches lessons that arrive from
 * ANOTHER DEVICE through cloud sync, which is why this is idempotent and re-run
 * rather than fired once behind a flag: a one-time latch would set itself on
 * this phone and then silently ignore the 60 lessons that merged in at sign-in.
 *
 * Everything enters at strength 2 — it was passed once already — with due dates
 * fanned deterministically across a fortnight, so a reader with 120 finished
 * lessons meets a handful a day rather than a wall of 120 on the first morning.
 *
 * Returns only the ADDITIONS, so it can never disturb a lesson already tracked.
 * Walks the branch tree once and reads each lesson's cards in place: the earlier
 * shape called isReviewable(id) per candidate, and that re-searched all 192
 * lessons every time.
 */
export function backfillEntries(
  state: ReviewState,
  lessonsByUnit: Record<string, number>,
  today: string,
): ReviewState {
  const add: ReviewState = {};
  for (const branch of ALL_BRANCHES) {
    for (const unit of branch.paths) {
      const done = Math.min(lessonsByUnit[unit.id] ?? 0, unit.lessons.length);
      for (let i = 0; i < done; i++) {
        const lesson = unit.lessons[i];
        if (state[lesson.id]) continue;
        if (questionsForLesson(lesson, branch.slug).length === 0) continue;
        add[lesson.id] = {
          s: 2,
          due: addDays(today, hashId(lesson.id) % BACKFILL_SPREAD),
          t: Date.now(),
        };
      }
    }
  }
  return add;
}
