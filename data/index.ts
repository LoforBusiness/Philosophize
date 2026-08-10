import type { Branch } from './types';
import logicBranch from './branches/logic';
import ethicsBranch from './branches/ethics';
import epistemologyBranch from './branches/epistemology';
import metaphysicsBranch from './branches/metaphysics';
import aestheticsBranch from './branches/aesthetics';
import politicalBranch from './branches/political-philosophy';

export const ALL_BRANCHES: Branch[] = [
  logicBranch,
  ethicsBranch,
  epistemologyBranch,
  metaphysicsBranch,
  aestheticsBranch,
  politicalBranch,
];

export function getBranchBySlug(slug: string): Branch | undefined {
  return ALL_BRANCHES.find((b) => b.slug === slug);
}

export function getLessonById(lessonId: string) {
  for (const branch of ALL_BRANCHES) {
    for (const path of branch.paths) {
      for (const lesson of path.lessons) {
        if (lesson.id === lessonId) return { branch, path, lesson };
      }
    }
  }
  return null;
}

// ─── Per-unit progress helpers ───────────────────────────────────────────────
// Progress is tracked per UNIT (path.id -> lessons completed), which lets a paid
// user advance several units independently. These helpers translate between that
// per-unit shape and the per-branch totals the stats/mastery screens still read,
// and migrate the old per-branch counts forward.

// Where a lesson sits: its branch, its unit (path) id, its 0-based index within
// that unit, and the unit's length. null if the id is unknown.
export function getLessonUnitInfo(lessonId: string): {
  branchSlug: string;
  unitId: string;
  indexInUnit: number;
  unitLength: number;
} | null {
  const found = getLessonById(lessonId);
  if (!found) return null;
  const indexInUnit = found.path.lessons.findIndex((l) => l.id === lessonId);
  return {
    branchSlug: found.branch.slug,
    unitId: found.path.id,
    indexInUnit,
    unitLength: found.path.lessons.length,
  };
}

// Sum each branch's unit counts into a per-branch total (the mirror the mastery
// screens read). Counts are clamped to each unit's real length for safety.
export function branchCountsFromUnits(
  lessonsByUnit: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const branch of ALL_BRANCHES) {
    let total = 0;
    for (const path of branch.paths) {
      total += Math.max(0, Math.min(path.lessons.length, lessonsByUnit[path.id] ?? 0));
    }
    out[branch.slug] = total;
  }
  return out;
}

/**
 * THE ONE RULE ABOUT WHO MAY OPEN A LESSON.
 *
 * Written once, here, taking numbers the caller already has, because four
 * surfaces have to agree about the same lesson — the road's markers, the units
 * drawer, the lesson route's own guard and a thinker's "lessons featuring".
 * When the branch screen kept its own copy of this reasoning the two drifted,
 * and a reader could be shown a lesson in one place and refused it in another.
 *
 *  • a lesson further ahead in its unit is locked, for everybody;
 *  • a unit's NEXT lesson is openable if the plan lets them start that unit —
 *    paid may start any unit, free must have closed every earlier one;
 *  • an ALREADY-FINISHED lesson is a REPLAY, and replay is part of the Pass.
 *
 * That last line changed, and it takes something away rather than merely
 * withholding it: replaying a finished lesson used to be free. It is a
 * deliberate product decision, not a tidy-up — see the note on the flip risk in
 * `[lessonId].tsx`, which is the one place it could have gone badly wrong.
 *
 * `needsPass` is true only where money is actually the obstacle, so a paywall is
 * offered exactly there and never in front of a lesson the reader simply has not
 * reached yet.
 */
export function lessonAccess(
  li: number, unitDone: number, unitStartable: boolean, isPro: boolean
): { open: boolean; needsPass: boolean } {
  if (li > unitDone) return { open: false, needsPass: false };   // not reached yet
  if (li < unitDone) return { open: isPro, needsPass: !isPro };  // a replay
  return { open: unitStartable, needsPass: !unitStartable };     // the next one
}

// Can this user open this lesson right now? The id-based form of `lessonAccess`
// above, for callers that have a lesson id and nothing else. Defense-in-depth
// for deep links and the back stack.
export function lessonAccessibility(
  lessonId: string,
  lessonsByUnit: Record<string, number>,
  isPro: boolean
): { accessible: boolean; gatedByPro: boolean } {
  const found = getLessonById(lessonId);
  if (!found) return { accessible: false, gatedByPro: false };
  const { branch, path } = found;
  const li = path.lessons.findIndex((l) => l.id === lessonId);
  const unitDone = Math.max(0, Math.min(path.lessons.length, lessonsByUnit[path.id] ?? 0));
  const ui = branch.paths.findIndex((p) => p.id === path.id);
  let allPrevComplete = true;
  for (let k = 0; k < ui; k++) {
    const pp = branch.paths[k];
    if ((lessonsByUnit[pp.id] ?? 0) < pp.lessons.length) {
      allPrevComplete = false;
      break;
    }
  }
  const startable = isPro || ui === 0 || allPrevComplete;
  const a = lessonAccess(li, unitDone, startable, isPro);
  return { accessible: a.open, gatedByPro: a.needsPass };
}

/**
 * The lesson Auto-advance goes to next, or null if there isn't one.
 *
 * Deliberately confined to the SAME UNIT. Running on past the end of a unit would
 * skip the unit list — the one screen that shows a unit was just finished — and
 * on a free account the next unit is usually locked anyway, so the reader would
 * be auto-advanced straight into a paywall. Stopping at the unit boundary makes
 * the setting describable in one line: it goes to the next lesson in the unit.
 *
 * Accessibility is still checked, because the same gate the Learn screen applies
 * has to apply here — this must never be a side door into a locked lesson.
 */
export function nextLessonInUnit(
  lessonId: string,
  lessonsByUnit: Record<string, number>,
  isPro: boolean
): { branchSlug: string; pathSlug: string; lessonId: string } | null {
  const found = getLessonById(lessonId);
  if (!found) return null;
  const { branch, path } = found;
  const li = path.lessons.findIndex((l) => l.id === lessonId);
  const next = li >= 0 ? path.lessons[li + 1] : undefined;
  if (!next) return null;
  if (!lessonAccessibility(next.id, lessonsByUnit, isPro).accessible) return null;
  return { branchSlug: branch.slug, pathSlug: path.slug, lessonId: next.id };
}

// Rebuild per-unit counts from the legacy per-branch totals. The old model was a
// single continuous count per branch (unit 1's lessons, then unit 2's, …), so we
// fill each branch's units in order — a faithful reconstruction of where the
// learner actually was.
export function unitsFromBranchCounts(
  lessonsByBranch: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const branch of ALL_BRANCHES) {
    let remaining = Math.max(0, lessonsByBranch[branch.slug] ?? 0);
    for (const path of branch.paths) {
      const take = Math.min(path.lessons.length, remaining);
      if (take > 0) out[path.id] = take;
      remaining -= take;
    }
  }
  return out;
}
