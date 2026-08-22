// Flavour for the Ranks "Almanac": each rank's one-line epithet, the eight
// thematic Circles the forty-eight ranks are grouped into, and a Roman-numeral
// helper.
// Kept beside the ranks so the sheet (and the rank-up ceremony) share one copy.
//
// ── THE CIRCLE AND THE ORDER ARE NOW THE SAME GROUPING ──────────────────────
//
// This was five Circles of five, for a twenty-five rank ladder. The ladder is
// forty-EIGHT now — see data/ranks.ts for why it tops out at 50,000 — and it is
// built as eight ORDERS of six: clay, iron, bronze, jade, lapis, crimson,
// amethyst, aurum.
//
// Two groupings over the same ladder, with different names and different
// boundaries, would be two things for a reader to learn where there is only one
// fact. So a Circle IS an order: same six ranks, same colour, same SHAPE (each
// order is struck in its own silhouette now — components/shared/rankShapes.ts),
// and the Circle is named after the material. `tierForRank` still returns
// 1-based groups, so nothing that consumed it has to change; only its divisor
// moved, from five to six.

export const tierForRank = (id: number) => Math.max(1, Math.min(8, Math.ceil(id / 6)));

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
  6: 'Copying it out is how it sticks.',
  // iron — the doubt
  7: 'Nothing is taken on trust.',
  8: 'Certainty is the first thing to go.',
  9: 'Asking better, not more.',
  10: 'Taking the claim apart.',
  11: 'Suspending judgement on purpose.',
  12: 'Doubt with the manners taken off.',
  // bronze — the argument
  13: 'Premises, and what follows.',
  14: 'The machinery of proof.',
  15: 'Two positions, one conversation.',
  16: 'Finding the joint to cut at.',
  17: 'Saying it so it lands.',
  18: 'Willing to be shown wrong in public.',
  // jade — the conduct
  19: 'The world before anyone explained it.',
  20: 'What is owed, and to whom.',
  21: 'Character over calculation.',
  22: 'What is yours to control.',
  23: 'Thinking while walking.',
  24: 'A citizen of nowhere in particular.',
  // lapis — the real
  25: 'What there is, under the names.',
  26: 'How anyone knows anything.',
  27: 'Being, and its furniture.',
  28: 'The mind was here first.',
  29: 'Reason settles it, not the eye.',
  30: 'Go and look, then argue.',
  // crimson — the quarrel
  31: 'Judgement becomes taste.',
  32: 'The argument taken to them.',
  33: 'Breaking what everyone agreed on.',
  34: 'Wrong in the useful direction.',
  35: 'The order was never necessary.',
  36: 'Some arguments are meant to spread.',
  // amethyst — the vision
  37: 'Knowing which questions are worth it.',
  38: 'Past what argument reaches.',
  39: 'A light for others to read by.',
  40: 'Answering what was not asked.',
  41: 'Seeing the shape of it whole.',
  42: 'Handing on what was handed down.',
  // aurum — the summit
  43: 'Holding the thread of the whole.',
  44: 'Others navigate by you now.',
  45: 'Knowledge old enough to look like magic.',
  46: 'The work outlasts the worker.',
  47: 'Past the edge of words.',
  48: 'The summit of the ascent.',
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
