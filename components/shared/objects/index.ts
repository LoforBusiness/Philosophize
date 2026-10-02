// Every insignia object, looked up by what it is drawn for. Ranks are keyed by their
// glyph name (data/ranks.ts), badges by their id (data/badges.ts), so a rank and a
// badge that happen to share a glyph still get different pictures.
import type { Part } from '../insigniaObjects';
import { RANK_OBJECTS_A } from './rankObjectsA';
import { RANK_OBJECTS_B } from './rankObjectsB';
import { BADGE_OBJECTS } from './badgeObjects';

const RANKS: Record<string, () => Part[]> = { ...RANK_OBJECTS_A, ...RANK_OBJECTS_B };
const BADGES: Record<string, () => Part[]> = { ...BADGE_OBJECTS };

/** A rank's object, or null if it has none (the pin then falls back to its glyph). */
export function rankObject(glyph: string): (() => Part[]) | null {
  return RANKS[glyph] ?? null;
}

/**
 * A badge's object by id; failing that, the rank object drawn for the same glyph
 * (the retired badges, which only their holders see, mostly share one); else null.
 */
export function badgeObject(id: string | undefined, glyph?: string): (() => Part[]) | null {
  return (id && BADGES[id]) || (glyph ? RANKS[glyph] ?? null : null);
}
