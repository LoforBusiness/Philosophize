// HOW FAR THROUGH EACH BRANCH A READER IS — for the badges, which were written for
// philosophy's six branches of 41 lessons.
//
// "Half of One Branch", "One Branch Complete", "The Whole Tree", "Every Unit" and their
// siblings count philosophy's branches and units. Economics opened on 2026-09-29 with ONE
// lesson in one unit, and counted here it would make finishing that lesson "100% of a
// branch" and "a unit complete" — and a badge, once earned, is kept and cloud-synced for
// ever. So this counts only the courses data/subjects.ts gives philosophy. Another
// subject's badges are a decision for when it has a real course, not an accident of
// sharing the branch list. check:subjects §9 holds it.
import { ALL_BRANCHES } from '@/data';
import { getSubject } from '@/data/subjects';

export interface BranchMastery {
  /** Percent of each philosophy branch read, 0–100, keyed by branch slug. */
  mastery: Record<string, number>;
  /** Philosophy units whose every lesson is read. */
  unitsComplete: number;
}

export function branchMastery(
  lessonsByBranch: Record<string, number>,
  lessonsByUnit: Record<string, number>,
): BranchMastery {
  const philosophy = new Set<string>(getSubject('philosophy')?.courses ?? []);
  const mastery: Record<string, number> = {};
  let unitsComplete = 0;
  for (const b of ALL_BRANCHES) {
    if (!philosophy.has(b.slug)) continue;
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    for (const p of b.paths) {
      if (p.lessons.length > 0 && (lessonsByUnit[p.id] ?? 0) >= p.lessons.length) unitsComplete++;
    }
  }
  return { mastery, unitsComplete };
}
