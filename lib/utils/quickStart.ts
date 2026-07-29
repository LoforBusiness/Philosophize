import { ALL_BRANCHES } from '@/data';
import type { Branch, Lesson, Path as Unit } from '@/data/types';

export interface QuickStartPick {
  branch: Branch;
  unit: Unit;
  lesson: Lesson;
  /** 1-based position of this lesson within its branch, for "LESSON 7 OF 29". */
  indexInBranch: number;
  branchTotal: number;
}

/**
 * The next lesson a learner can actually open in a branch — the first lesson of
 * the first unit they haven't finished.
 *
 * No plan check is needed here, and that is not an oversight. The free rule is
 * "you must have finished every earlier unit", and the first INCOMPLETE unit is
 * by definition the one with every earlier unit behind it. So a branch's next
 * lesson is open to everyone; the Pass only buys the right to skip AHEAD to a
 * later unit, which a quick start never wants to do.
 */
function nextInBranch(branch: Branch, lessonsByUnit: Record<string, number>): QuickStartPick | null {
  let seenBefore = 0;
  const branchTotal = branch.paths.reduce((n, u) => n + u.lessons.length, 0);
  for (const unit of branch.paths) {
    const total = unit.lessons.length;
    const done = Math.max(0, Math.min(total, lessonsByUnit[unit.id] ?? 0));
    if (done < total) {
      return {
        branch,
        unit,
        lesson: unit.lessons[done],
        indexInBranch: seenBefore + done + 1,
        branchTotal,
      };
    }
    seenBefore += total;
  }
  return null; // every unit in this branch is finished
}

/** Deterministic hash — the same seed must always choose the same branch. */
function shuffleSeed(seed: number): number {
  let x = (seed + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return (x ^ (x >>> 15)) >>> 0;
}

/**
 * Choose the lesson the Quick Start offers.
 *
 * It has to move on two different clocks, which is why the seed is a SUM rather
 * than just the date:
 *
 *  • a new day should offer a different branch, so someone who opens the app and
 *    doesn't finish anything isn't shown the same card forever;
 *  • finishing a lesson should also change it, immediately, because the learner
 *    comes straight back to this screen and a card still pointing at the lesson
 *    they just completed reads as broken.
 *
 * `done` (the total number of lessons completed) covers the second: it ticks up
 * the instant a lesson is recorded, re-rolling the branch on the same day. The
 * lesson within the chosen branch has moved on regardless, so the card always
 * shows something new either way.
 */
export function pickQuickStart(
  lessonsByUnit: Record<string, number>,
  dayNumber: number
): QuickStartPick | null {
  const open: QuickStartPick[] = [];
  for (const branch of ALL_BRANCHES) {
    const next = nextInBranch(branch, lessonsByUnit);
    if (next) open.push(next);
  }
  if (open.length === 0) return null; // nothing left anywhere — every lesson done

  const done = Object.values(lessonsByUnit).reduce((n, v) => n + (v > 0 ? v : 0), 0);
  return open[shuffleSeed(dayNumber + done) % open.length];
}

/** Which background the card wears today. Rotates on the date alone, so the
 *  picture is the day's, not the lesson's — finishing a lesson swaps the lesson
 *  under the same sky. */
export function quickStartArtIndex(dayNumber: number, count: number): number {
  return ((dayNumber % count) + count) % count;
}
