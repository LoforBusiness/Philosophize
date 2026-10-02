// ─────────────────────────────────────────────────────────────────────────────
// PHILOSOPHY'S SIX RETIRED BRANCHES, AS PROGRESS ONLY (2026-10-02).
//
// The owner: "I will no longer have any use of the old philosophy lessons … those can
// be removed." Their 246 narrated lessons, their scenes and their voices are deleted.
// What a reader did in them is NOT: `lessonsByUnit` still holds their counts, and the
// totals, the branch-mastery badges already earned, the profile's title and the
// subject a day counts for all read them. So this table keeps exactly what counting
// needs — each branch's slug and name, and each of its 28 units' id and length —
// and nothing a reader can open.
//
// Written once from the last data that had them; never edited by hand.
// ─────────────────────────────────────────────────────────────────────────────

export interface RetiredBranch {
  slug: string;
  name: string;
  units: readonly { id: string; lessons: number }[];
}

export const RETIRED_BRANCHES: readonly RetiredBranch[] = [
  {
    slug: 'logic', name: 'Logic',
    units: [
      { id: 'logic-the-anatomy-of-an-argument', lessons: 8 },
      { id: 'logic-where-arguments-cheat', lessons: 7 },
      { id: 'logic-evidence-bias-and-the-fair-fight', lessons: 7 },
      { id: 'logic-the-logician-s-toolkit', lessons: 5 },
      { id: 'logic-advanced-moves-and-mastery', lessons: 14 },
    ],
  },
  {
    slug: 'ethics', name: 'Ethics',
    units: [
      { id: 'ethics-what-is-ethics', lessons: 5 },
      { id: 'ethics-when-intuitions-collide', lessons: 5 },
      { id: 'ethics-the-great-theories', lessons: 6 },
      { id: 'ethics-ethics-in-the-wild', lessons: 10 },
      { id: 'ethics-stepping-back', lessons: 15 },
    ],
  },
  {
    slug: 'epistemology', name: 'Epistemology',
    units: [
      { id: 'epistemology-what-is-knowledge', lessons: 10 },
      { id: 'epistemology-the-classic-puzzles', lessons: 5 },
      { id: 'epistemology-evidence-science-and-the-crowd', lessons: 5 },
      { id: 'epistemology-what-holds-belief-up', lessons: 6 },
      { id: 'epistemology-the-wise-knower', lessons: 15 },
    ],
  },
  {
    slug: 'metaphysics', name: 'Metaphysics',
    units: [
      { id: 'metaphysics-being-and-non-being', lessons: 5 },
      { id: 'metaphysics-change-identity-and-the-self', lessons: 8 },
      { id: 'metaphysics-the-fabric-of-reality', lessons: 7 },
      { id: 'metaphysics-puzzles-at-the-edge-of-the-real', lessons: 6 },
      { id: 'metaphysics-frontiers-of-reality', lessons: 15 },
    ],
  },
  {
    slug: 'aesthetics', name: 'Aesthetics',
    units: [
      { id: 'aesthetics-what-is-aesthetics', lessons: 10 },
      { id: 'aesthetics-theories-and-hard-cases', lessons: 11 },
      { id: 'aesthetics-puzzles-at-the-edge', lessons: 20 },
    ],
  },
  {
    slug: 'political-philosophy', name: 'Political Philosophy',
    units: [
      { id: 'political-philosophy-order-and-the-right-to-rule', lessons: 5 },
      { id: 'political-philosophy-the-goods-we-argue-over', lessons: 6 },
      { id: 'political-philosophy-liberty-justice-and-dissent', lessons: 5 },
      { id: 'political-philosophy-cracks-in-the-consensus', lessons: 7 },
      { id: 'political-philosophy-identity-and-the-hard-cases', lessons: 18 },
    ],
  },
];
