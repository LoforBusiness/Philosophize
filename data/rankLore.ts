// Flavour for the Ranks "Almanac": each rank's one-line epithet, the five
// thematic "Circles" the 25 ranks are grouped into, and a Roman-numeral helper.
// Kept beside the ranks so the sheet (and the future rank-up ceremony) can share
// the same copy.

export const tierForRank = (id: number) => Math.max(1, Math.min(5, Math.ceil(id / 5)));

export interface Circle {
  tier: number;
  name: string; // e.g. "The First Circle"
  subtitle: string; // e.g. "The Foundations"
}

export const CIRCLES: Circle[] = [
  { tier: 1, name: 'The First Circle', subtitle: 'The Foundations' },
  { tier: 2, name: 'The Second Circle', subtitle: 'The Inquiry' },
  { tier: 3, name: 'The Third Circle', subtitle: 'The Disciplines' },
  { tier: 4, name: 'The Fourth Circle', subtitle: 'The Mastery' },
  { tier: 5, name: 'The Fifth Circle', subtitle: 'The Summit' },
];

export const circleForRank = (id: number): Circle => CIRCLES[tierForRank(id) - 1];

export const RANK_EPITHETS: Record<number, string> = {
  1: 'Every sage began here.',
  2: 'The first question is asked.',
  3: 'Learning to wield the quill.',
  4: 'Reading the great conversation.',
  5: 'Knowledge becomes discipline.',
  6: 'Ideas that are your own.',
  7: 'Doubt, used as a method.',
  8: 'Weighing every claim.',
  9: 'Taking arguments apart.',
  10: 'A lover of wisdom.',
  11: 'Truth pursued through dialogue.',
  12: 'The architecture of reason.',
  13: 'How, then, shall we live?',
  14: 'What is — and why.',
  15: 'How we know what we know.',
  16: 'Master of the inner citadel.',
  17: 'Wisdom, worn lightly.',
  18: 'Seeing by your own light.',
  19: 'Beyond the marked roads.',
  20: 'First among thinkers.',
  21: 'Keeper of the long view.',
  22: 'A light for others to read by.',
  23: 'The pattern itself.',
  24: 'Past the edge of words.',
  25: 'The summit of the ascent.',
};

const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRoman(n: number): string {
  let out = '';
  let v = Math.max(0, Math.floor(n));
  for (const [val, sym] of ROMAN) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out || '—';
}
