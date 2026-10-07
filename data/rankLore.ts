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
// order is struck in its own silhouette now — components/shared/insigniaArt.ts),
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
  { tier: 2, name: 'The Iron Circle', subtitle: 'The Questions' },
  { tier: 3, name: 'The Bronze Circle', subtitle: 'The Reasoning' },
  { tier: 4, name: 'The Jade Circle', subtitle: 'The Practice' },
  { tier: 5, name: 'The Lapis Circle', subtitle: 'The Depth' },
  { tier: 6, name: 'The Crimson Circle', subtitle: 'The Daring' },
  { tier: 7, name: 'The Amethyst Circle', subtitle: 'The Mastery' },
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
  // iron — the questions
  7: 'Nothing is taken on trust.',
  8: 'Following the clue to its source.',
  9: 'Seeing what is actually there.',
  10: 'Taking the claim apart.',
  11: 'Suspending judgement on purpose.',
  12: 'Judging the work, not the worker.',
  // bronze — the reasoning
  13: 'Premises, and what follows.',
  14: 'Thinking three moves ahead.',
  15: 'Two sides, one conversation.',
  16: 'Finding the joint to cut at.',
  17: 'Saying it so it lands.',
  18: 'Willing to be shown wrong in public.',
  // jade — the practice
  19: 'The world before anyone explained it.',
  20: 'Passing on what you have learned.',
  21: 'Good hands, and getting better.',
  22: 'Deep in one thing, curious about the rest.',
  23: 'Learning on the road.',
  24: 'Finding the way between subjects.',
  // lapis — the depth
  25: 'Going to the source.',
  26: 'Others ask you now.',
  27: 'Building ideas that hold weight.',
  28: 'Seeing the pattern under the facts.',
  29: 'At home in every subject.',
  30: 'Go and test it, then argue.',
  // crimson — the daring
  31: 'Lighting the way others will follow.',
  32: 'Turning an idea into a thing.',
  33: 'Breaking what everyone agreed on.',
  34: 'Right in the unexpected direction.',
  35: 'Off the edge of the map.',
  36: 'Some ideas are meant to spread.',
  // amethyst — the mastery
  37: 'The long study, chosen on purpose.',
  38: 'Knowing which questions are worth it.',
  39: 'First down a road nobody had taken.',
  40: 'Able to teach it to anyone.',
  41: 'Seeing the shape of it whole.',
  42: 'Holding the keys to the subject.',
  // aurum — the summit
  43: 'Holding the thread of the whole.',
  44: 'Others navigate by you now.',
  45: 'Making the difficult look easy.',
  46: 'The work outlasts the worker.',
  47: 'The example others measure by.',
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
