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
//
// SINCE 2026-09-30 THOSE SIX ARE RETIRED (data/index.ts LEGACY_BRANCHES): philosophy is
// one road, and its old lessons are hidden until they are rebuilt. The badges still
// count the six, so what a reader earned in them stands and a one-lesson road is never
// "a whole branch". What the badges should count on the new roads is the owner's call.
import { LEGACY_BRANCHES } from '@/data';

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
  const mastery: Record<string, number> = {};
  let unitsComplete = 0;
  for (const b of LEGACY_BRANCHES) {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    for (const p of b.paths) {
      if (p.lessons.length > 0 && (lessonsByUnit[p.id] ?? 0) >= p.lessons.length) unitsComplete++;
    }
  }
  return { mastery, unitsComplete };
}
