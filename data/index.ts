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

// Can this user open this lesson right now? Mirrors the branch screen's gate:
//  • an already-completed lesson is always openable (review);
//  • a unit's NEXT lesson is openable if the plan lets them start that unit
//    (paid can start any unit; free must have finished all previous units);
//  • lessons further ahead in a unit are locked.
// gatedByPro is true only for the case a free user could unlock with the Pass
// (a future unit's first lesson). Defense-in-depth for deep links / the back
// stack — the list already hides locked lessons.
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
  if (li < unitDone) return { accessible: true, gatedByPro: false };
  if (li > unitDone) return { accessible: false, gatedByPro: false };
  // li === unitDone: the unit's next lesson.
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
  return startable ? { accessible: true, gatedByPro: false } : { accessible: false, gatedByPro: true };
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
