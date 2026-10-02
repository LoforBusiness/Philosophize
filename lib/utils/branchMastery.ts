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
// SINCE 2026-09-30 THOSE SIX ARE RETIRED, and since 2026-10-02 their lessons are deleted:
// the badges count them from `RETIRED_BRANCHES` (data/retiredBranches.ts), their units and
// lengths alone. The badges still
// count the six, so what a reader earned in them stands and a one-lesson road is never
// "a whole branch". What the badges should count on the new roads is the owner's call.
import { RETIRED_BRANCHES } from '@/data';

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
  for (const b of RETIRED_BRANCHES) {
    const total = b.units.reduce((acc, u) => acc + u.lessons, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    for (const u of b.units) {
      if (u.lessons > 0 && (lessonsByUnit[u.id] ?? 0) >= u.lessons) unitsComplete++;
    }
  }
  return { mastery, unitsComplete };
}
