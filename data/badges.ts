import type { GlyphName } from '@/components/shared/Glyph';

// Snapshot of the user's progress used to decide which badges are earned.
export interface ProgressStats {
  totalXP: number;
  lessons: number;
  quotes: number;
  philosophers: number; // distinct philosophers viewed
  streak: number;
  mastery: Record<string, number>; // branch slug -> percent (0–100)
}

export interface BadgeDef {
  id: string;
  name: string;
  glyph: GlyphName;
  earned: (s: ProgressStats) => boolean;
}

const branchesStarted = (s: ProgressStats) =>
  Object.values(s.mastery).filter((v) => v > 0).length;
const branchesMastered = (s: ProgressStats) =>
  Object.values(s.mastery).filter((v) => v >= 50).length;

// 50 badges, ordered easiest → hardest, mirroring the Badges sheet layout.
export const BADGES: BadgeDef[] = [
  { id: 'first-light', name: 'First Light', glyph: 'starcompass', earned: (s) => s.lessons >= 1 },
  { id: 'star-pupil', name: 'Star Pupil', glyph: 'star', earned: (s) => s.lessons >= 3 },
  { id: 'arch-of-wisdom', name: 'Arch of Wisdom', glyph: 'arch', earned: (s) => s.lessons >= 5 },
  { id: 'true-north', name: 'True North', glyph: 'dottarget', earned: (s) => s.philosophers >= 1 },
  { id: 'the-pillars', name: 'The Pillars', glyph: 'shieldcross', earned: (s) => s.philosophers >= 3 },
  { id: 'grid-thinker', name: 'Grid Thinker', glyph: 'grid', earned: (s) => s.quotes >= 1 },
  { id: 'the-great-question', name: 'The Great Question', glyph: 'question', earned: (s) => s.quotes >= 3 },
  { id: 'diamond-eye', name: 'Diamond Eye', glyph: 'eye', earned: (s) => s.philosophers >= 5 },
  { id: 'turning-point', name: 'Turning Point', glyph: 'flag', earned: (s) => s.streak >= 3 },
  { id: 'lamp-bearer', name: 'Lamp Bearer', glyph: 'lamp', earned: (s) => s.lessons >= 10 },
  { id: 'oval-seeker', name: 'Oval Seeker', glyph: 'eye', earned: (s) => s.philosophers >= 8 },
  { id: 'crowned-star', name: 'Crowned Star', glyph: 'star', earned: (s) => s.lessons >= 15 },
  { id: 'tender-heart', name: 'Tender Heart', glyph: 'heart', earned: (s) => (s.mastery['ethics'] ?? 0) >= 25 },
  { id: 'peak-climber', name: 'Peak Climber', glyph: 'mountain', earned: (s) => s.totalXP >= 1000 },
  { id: 'radiant-mind', name: 'Radiant Mind', glyph: 'sun', earned: (s) => s.lessons >= 20 },
  { id: 'marble-pillar', name: 'Marble Pillar', glyph: 'column', earned: (s) => (s.mastery['metaphysics'] ?? 0) >= 25 },
  { id: 'summit', name: 'Summit', glyph: 'mountain', earned: (s) => s.totalXP >= 1500 },
  { id: 'half-circle', name: 'Half Circle', glyph: 'dome', earned: (s) => s.quotes >= 8 },
  { id: 'moonlit-path', name: 'Moonlit Path', glyph: 'crescent', earned: (s) => s.streak >= 7 },
  { id: 'the-crown', name: 'The Crown', glyph: 'crown', earned: (s) => s.totalXP >= 3000 },
  { id: 'deep-roots', name: 'Deep Roots', glyph: 'tree', earned: (s) => s.lessons >= 30 },
  { id: 'solar-mind', name: 'Solar Mind', glyph: 'sun', earned: (s) => s.totalXP >= 2500 },
  { id: 'lotus-bloom', name: 'Lotus Bloom', glyph: 'lotus', earned: (s) => (s.mastery['aesthetics'] ?? 0) >= 25 },
  { id: 'compass-rose', name: 'Compass Rose', glyph: 'wheel', earned: (s) => s.philosophers >= 12 },
  { id: 'the-shield', name: 'The Shield', glyph: 'shieldcross', earned: (s) => s.totalXP >= 2000 },
  { id: 'crossroads', name: 'Crossroads', glyph: 'xcross', earned: (s) => branchesStarted(s) >= 3 },
  { id: 'the-arch', name: 'The Arch', glyph: 'arch', earned: (s) => s.lessons >= 25 },
  { id: 'open-page', name: 'Open Page', glyph: 'page', earned: (s) => s.quotes >= 12 },
  { id: 'balance', name: 'Balance', glyph: 'target', earned: (s) => (s.mastery['logic'] ?? 0) >= 25 },
  { id: 'bright-star', name: 'Bright Star', glyph: 'star', earned: (s) => s.totalXP >= 4000 },
  { id: 'ascent', name: 'Ascent', glyph: 'dome', earned: (s) => s.totalXP >= 5000 },
  { id: 'the-vessel', name: 'The Vessel', glyph: 'drop', earned: (s) => s.quotes >= 20 },
  { id: 'flourish', name: 'Flourish', glyph: 'flag', earned: (s) => s.streak >= 14 },
  { id: 'the-rings', name: 'The Rings', glyph: 'ripple', earned: (s) => s.philosophers >= 16 },
  { id: 'delta-rise', name: 'Delta Rise', glyph: 'pyramid', earned: (s) => s.totalXP >= 6000 },
  { id: 'the-amphora', name: 'The Amphora', glyph: 'amphora', earned: (s) => s.lessons >= 40 },
  { id: 'crossed-paths', name: 'Crossed Paths', glyph: 'xcross', earned: (s) => branchesStarted(s) >= 5 },
  { id: 'the-gate', name: 'The Gate', glyph: 'gate', earned: (s) => s.totalXP >= 7000 },
  { id: 'circle-of-stars', name: 'Circle of Stars', glyph: 'starcompass', earned: (s) => s.philosophers >= 20 },
  { id: 'the-keep', name: 'The Keep', glyph: 'dottarget', earned: (s) => s.totalXP >= 9000 },
  { id: 'facets', name: 'Facets', glyph: 'gem', earned: (s) => branchesMastered(s) >= 3 },
  { id: 'the-lens', name: 'The Lens', glyph: 'eye', earned: (s) => s.lessons >= 50 },
  { id: 'the-colosseum', name: 'The Colosseum', glyph: 'gate', earned: (s) => s.totalXP >= 11000 },
  { id: 'mandala', name: 'Mandala', glyph: 'wheel', earned: (s) => branchesMastered(s) >= 6 },
  { id: 'the-fortress', name: 'The Fortress', glyph: 'shieldcross', earned: (s) => s.totalXP >= 13000 },
  { id: 'the-vessel-ii', name: 'The Vessel II', glyph: 'drop', earned: (s) => s.quotes >= 30 },
  { id: 'star-of-david', name: 'Star of David', glyph: 'hexagram', earned: (s) => s.totalXP >= 15000 },
  { id: 'the-infinite', name: 'The Infinite', glyph: 'ripple', earned: (s) => s.totalXP >= 20000 },
  { id: 'the-willow', name: 'The Willow', glyph: 'willow', earned: (s) => s.streak >= 30 },
  { id: 'the-hourglass', name: 'The Hourglass', glyph: 'hourglass', earned: (s) => s.streak >= 60 },
];
