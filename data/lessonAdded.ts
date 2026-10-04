// ─────────────────────────────────────────────────────────────────────────────
// WHEN EACH LESSON WAS ADDED — what puts NEW on its sign on the road.
//
// The owner (2026-10-01): "when a new lesson is made, I want you to put a NEW on
// the top right of the sign and to make it very noticeable. And that NEW goes away
// five days after that lesson is created." Later the same day: twelve days, not five.
//
// A TABLE AND NOT A FIELD ON THE LESSON, for the reason the maxim is one
// (data/lessonFocus.ts): a lesson file is pinned by the must-box stamp and edited by
// whoever is writing lessons, and a date is not part of what a lesson says.
//
// EVERY LESSON A READER CAN OPEN MUST BE HERE. `npm run check:subjects` fails on a
// live lesson with no date, so a new lesson cannot ship without one — add its line
// the day it is written, as the date it will first be published. The first fourteen
// are the days git first saw each lesson's file.
// ─────────────────────────────────────────────────────────────────────────────

export const LESSON_ADDED: Record<string, string> = {
  'economics-foundations-1': '2026-09-29',
  'philosophy-foundations-1': '2026-09-30',
  'psychology-foundations-1': '2026-09-30',
  'personal-growth-foundations-1': '2026-09-30',
  'business-foundations-1': '2026-09-30',
  'science-foundations-1': '2026-09-30',
  'history-foundations-1': '2026-09-30',
  'philosophy-foundations-2': '2026-09-30',
  'philosophy-foundations-3': '2026-10-01',
  'philosophy-foundations-4': '2026-10-02',
  'philosophy-foundations-5': '2026-10-03',
  'psychology-foundations-2': '2026-09-30',
  'psychology-foundations-3': '2026-10-01',
  'psychology-foundations-4': '2026-10-02',
  'psychology-foundations-5': '2026-10-03',
  'personal-growth-foundations-2': '2026-09-30',
  'personal-growth-foundations-3': '2026-10-01',
  'personal-growth-foundations-4': '2026-10-02',
  'personal-growth-foundations-5': '2026-10-03',
  'business-foundations-2': '2026-09-30',
  'business-foundations-3': '2026-10-01',
  'business-foundations-4': '2026-10-02',
  'business-foundations-5': '2026-10-03',
  'economics-foundations-2': '2026-09-30',
  'economics-foundations-3': '2026-10-01',
  'economics-foundations-4': '2026-10-02',
  'economics-foundations-5': '2026-10-03',
  'science-foundations-2': '2026-09-30',
  'science-foundations-3': '2026-10-01',
  'science-foundations-4': '2026-10-02',
  'science-foundations-5': '2026-10-03',
  'history-foundations-2': '2026-09-30',
  'history-foundations-3': '2026-10-01',
  'history-foundations-4': '2026-10-02',
  'history-foundations-5': '2026-10-03',
};

/** How long a lesson wears NEW, in days from the day it was added. */
export const NEW_FOR_DAYS = 12;

/**
 * Is this lesson still new? Counted in the reader's own calendar days: a lesson
 * added on the 1st is new on the 1st and the eleven days after it, and not on the
 * 13th. A lesson with no date is never new — the check is what stops that happening.
 */
export function isNewLesson(id: string, now: Date = new Date()): boolean {
  const added = LESSON_ADDED[id];
  if (!added) return false;
  const [y, m, d] = added.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  return days >= 0 && days < NEW_FOR_DAYS;
}
