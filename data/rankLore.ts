// Flavour for the Ranks "Almanac": each rank's one-line epithet, the eight
// thematic Circles the forty ranks are grouped into, and a Roman-numeral helper.
// Kept beside the ranks so the sheet (and the rank-up ceremony) share one copy.
//
// ── THE CIRCLE AND THE ORDER ARE NOW THE SAME GROUPING ──────────────────────
//
// This was five Circles of five, for a twenty-five rank ladder. The ladder is
// forty now (see data/ranks.ts for why: the old one topped out at 52,000 XP in
// an app that contains 21,400), and it is built as eight ORDERS of five —
// clay, iron, bronze, jade, lapis, crimson, amethyst, aurum.
//
// Two groupings of five over the same ladder, with different names and different
// boundaries, would be two things for a reader to learn where there is only one
// fact. So a Circle IS an order: same five ranks, same colour, and the Circle is
// named after the material its pins are struck in. `tierForRank` still returns
// 1-based groups, so nothing that consumed it has to change.

export const tierForRank = (id: number) => Math.max(1, Math.min(8, Math.ceil(id / 5)));

export interface Circle {
  tier: number;
  name: string;
  subtitle: string;
}

export const CIRCLES: Circle[] = [
  { tier: 1, name: 'The Clay Circle', subtitle: 'The Foundations' },
  { tier: 2, name: 'The Iron Circle', subtitle: 'The Doubt' },
  { tier: 3, name: 'The Bronze Circle', subtitle: 'The Argument' },
  { tier: 4, name: 'The Jade Circle', subtitle: 'The Conduct' },
  { tier: 5, name: 'The Lapis Circle', subtitle: 'The Real' },
  { tier: 6, name: 'The Crimson Circle', subtitle: 'The Quarrel' },
  { tier: 7, name: 'The Amethyst Circle', subtitle: 'The Vision' },
  { tier: 8, name: 'The Aurum Circle', subtitle: 'The Summit' },
];

export const circleForRank = (id: number): Circle => CIRCLES[tierForRank(id) - 1];

export const RANK_EPITHETS: Record<number, string> = {
  // clay — the foundations
  1: 'Every sage began here.',
  2: 'The first question is asked.',
  3: 'Learning to wield the quill.',
  4: 'Reading the great conversation.',
  5: 'The page stops being difficult.',
  // iron — the doubt
  6: 'Nothing is taken on trust.',
  7: 'Certainty is the first thing to go.',
  8: 'Asking better, not more.',
  9: 'Taking the claim apart.',
  10: 'Suspending judgement on purpose.',
  // bronze — the argument
  11: 'Premises, and what follows.',
  12: 'The machinery of proof.',
  13: 'Two positions, one conversation.',
  14: 'Finding the joint to cut at.',
  15: 'Saying it so it lands.',
  // jade — the conduct
  16: 'The world before anyone explained it.',
  17: 'What is owed, and to whom.',
  18: 'Character over calculation.',
  19: 'What is yours to control.',
  20: 'Thinking while walking.',
  // lapis — the real
  21: 'What there is, under the names.',
  22: 'How anyone knows anything.',
  23: 'Being, and its furniture.',
  24: 'The mind was here first.',
  25: 'Reason settles it, not the eye.',
  // crimson — the quarrel
  26: 'Judgement becomes taste.',
  27: 'The argument taken to them.',
  28: 'Breaking what everyone agreed on.',
  29: 'Wrong in the useful direction.',
  30: 'The order was never necessary.',
  // amethyst — the vision
  31: 'Knowing which questions are worth it.',
  32: 'Past what argument reaches.',
  33: 'A light for others to read by.',
  34: 'Answering what was not asked.',
  35: 'Seeing the shape of it whole.',
  // aurum — the summit
  36: 'Holding the thread of the whole.',
  37: 'Others navigate by you now.',
  38: 'The work outlasts the worker.',
  39: 'Past the edge of words.',
  40: 'The summit of the ascent.',
};

export const toRoman = (n: number): string => {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '', left = Math.max(0, Math.floor(n));
  for (const [v, s] of table) while (left >= v) { out += s; left -= v; }
  return out;
};
