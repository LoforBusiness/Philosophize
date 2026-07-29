// ─────────────────────────────────────────────────────────────────────────────
// THE XP MODEL — one source of truth.
//
// These constants used to be aspirational: the runners carried their own
// `COMPLETION_XP = 5` and awarded 5 + 5×correct, so a lesson paid 15 while this
// file claimed 25. Every award site now imports from here.
//
// THE SHAPE OF IT. A lesson is worth roughly twenty times a saved quote, and that
// ratio is the point: browsing the app should feel rewarded, but only WORK should
// move you up the ladder. See `rankIndex` in userDataStore — the rank itself is
// gated behind lesson completion regardless of how the XP was earned, so no amount
// of bookmarking can promote anyone.
// ─────────────────────────────────────────────────────────────────────────────

/** Finishing a lesson at all. */
export const XP_PER_LESSON_COMPLETION = 25;
/** Each graded question answered correctly. */
export const XP_PER_CORRECT_ANSWER = 10;
/** On top, for getting every graded question right. */
export const XP_PER_PERFECT_LESSON = 15;
/** Completing every lesson in a unit. */
export const XP_PER_PATH_MASTERY = 100;

// ── the small change ─────────────────────────────────────────────────────────
// Deliberately minor, and deliberately reversible: saving a quote pays, unsaving
// it takes the same back, so the total always reflects what is actually in the
// collection and there is nothing to farm by tapping a bookmark repeatedly.
/** Keeping a quote in your collection. */
export const XP_PER_SAVED_QUOTE = 3;
/** The FIRST time you open a given thinker's profile. */
export const XP_PER_PHILOSOPHER_MET = 2;
/** Finishing a thinker's quiz (and the one-time bonus for acing it). */
export const XP_PER_QUIZ = 5;
export const XP_PER_QUIZ_PERFECT = 15;

/** What one lesson is worth, so a runner never has to do this sum itself. */
export function lessonXP(correct: number, total: number): number {
  const perfect = total > 0 && correct >= total;
  return (
    XP_PER_LESSON_COMPLETION +
    correct * XP_PER_CORRECT_ANSWER +
    (perfect ? XP_PER_PERFECT_LESSON : 0)
  );
}

// Level n requires Math.floor(50 * n * Math.sqrt(n)) XP total
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (getXPForLevel(level + 1) <= totalXP) level++;
  return level;
}

export function getXPForLevel(level: number): number {
  return Math.floor(50 * level * Math.sqrt(level));
}

export function getXPProgressInLevel(totalXP: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const current = totalXP - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percent: Math.min(current / needed, 1) };
}
