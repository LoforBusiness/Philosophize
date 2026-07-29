import type { GlyphName } from '@/components/shared/Glyph';

export interface RankDef {
  id: number; // 1-based rank number
  name: string;
  xp: number; // XP required to reach this rank
  glyph: GlyphName;
}

// The 25-rank ladder, shared by the profile rank chip and the Ranks sheet.
export const RANKS: RankDef[] = [
  { id: 1, name: 'Novice', xp: 0, glyph: 'candle' },
  { id: 2, name: 'Seeker', xp: 100, glyph: 'book' },
  { id: 3, name: 'Apprentice', xp: 250, glyph: 'quill' },
  { id: 4, name: 'Student', xp: 450, glyph: 'scroll' },
  { id: 5, name: 'Scholar', xp: 700, glyph: 'cap' },
  { id: 6, name: 'Thinker', xp: 1000, glyph: 'eye' },
  { id: 7, name: 'Inquirer', xp: 1400, glyph: 'question' },
  { id: 8, name: 'Reasoner', xp: 1900, glyph: 'scales' },
  { id: 9, name: 'Analyst', xp: 2500, glyph: 'magnifier' },
  { id: 10, name: 'Philosopher', xp: 3000, glyph: 'bust' },
  { id: 11, name: 'Dialectician', xp: 4000, glyph: 'cycle' },
  { id: 12, name: 'Logician', xp: 5000, glyph: 'infinity' },
  { id: 13, name: 'Ethicist', xp: 6200, glyph: 'heart' },
  { id: 14, name: 'Metaphysician', xp: 7600, glyph: 'pyramid' },
  { id: 15, name: 'Epistemologist', xp: 9300, glyph: 'target' },
  { id: 16, name: 'Stoic', xp: 11000, glyph: 'column' },
  { id: 17, name: 'Sage', xp: 13000, glyph: 'mountain' },
  { id: 18, name: 'Illuminate', xp: 15500, glyph: 'torch' },
  { id: 19, name: 'Wanderer', xp: 18500, glyph: 'signpost' },
  { id: 20, name: 'Archon', xp: 22000, glyph: 'crown' },
  { id: 21, name: 'Elder', xp: 26000, glyph: 'tree' },
  { id: 22, name: 'Luminary', xp: 31000, glyph: 'sunface' },
  { id: 23, name: 'Archetype', xp: 37000, glyph: 'ring' },
  { id: 24, name: 'Transcendent', xp: 44000, glyph: 'lotus' },
  { id: 25, name: 'Grand Philosopher', xp: 52000, glyph: 'bookrays' },
];

/**
 * The rank a given amount of XP has EARNED. Not necessarily the rank the user
 * holds — see `awardedRank`.
 */
export function rankForXP(xp: number): {
  current: RankDef;
  next: RankDef | null;
  index: number;
} {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].xp) index = i;
  }
  return { current: RANKS[index], next: RANKS[index + 1] ?? null, index };
}

/**
 * THE RANK THE USER ACTUALLY HOLDS, which is not the same thing.
 *
 * XP comes from several places — lessons, saved quotes, thinkers met, quizzes —
 * but a promotion is meant to be earned by WORK, so `rankIndex` (in userDataStore)
 * only ever advances inside `recordLessonComplete`, and by one step at a time. A
 * reader who bookmarks their way past a threshold keeps the XP and keeps the rank
 * they had, and collects the promotion the next time they finish a lesson.
 *
 * `pending` says exactly that has happened, so the UI can promise it rather than
 * leaving a full progress bar looking broken.
 */
export function awardedRank(rankIndex: number, totalXP: number): {
  current: RankDef;
  next: RankDef | null;
  index: number;
  pending: boolean;
} {
  const i = Math.max(0, Math.min(RANKS.length - 1, Math.floor(rankIndex) || 0));
  return {
    current: RANKS[i],
    next: RANKS[i + 1] ?? null,
    index: i,
    pending: rankForXP(totalXP).index > i,
  };
}
