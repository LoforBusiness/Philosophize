// ─────────────────────────────────────────────────────────────────────────────
// THE SUBJECT TILES' NUMBERS — in one zero-import file, so check:subjects can measure
// every name against the real font at every phone width without loading React Native.
//
// The components (SubjectTile, SubjectCard, BranchCard, SubjectMasthead) read these;
// the check reads the same ones. A size changed here is re-measured on the next run.
// ─────────────────────────────────────────────────────────────────────────────

/** The page's side gutter on Learn, Home and a subject page. */
export const PAGE_PAD = 20;
/** Between two grid tiles, both ways. */
export const GRID_GAP = 12;
/** Inside a tile or card. */
export const TILE_PAD = 12;
/** Inside a carousel card. */
export const CARD_PAD = 16;
/** The art square on the wide (Philosophy) tile and on a branch card. */
export const WIDE_ART = 104;
/** How much of the screen a carousel card takes — the next one peeks in. */
export const CARD_FRAC = 0.78;
/** Between carousel cards. */
export const CARD_GAP = 14;

export const TILE_TITLE = { family: 'PlayfairDisplay_700Bold', fontSize: 17, lineHeight: 21 } as const;
export const CARD_TITLE = { family: 'PlayfairDisplay_700Bold', fontSize: 21, lineHeight: 26 } as const;
export const MAST_TITLE = { family: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 34 } as const;

/** A grid tile's side, two to a row. */
export function tileSize(screenW: number): number {
  return Math.floor((screenW - 2 * PAGE_PAD - GRID_GAP) / 2);
}

/** A carousel card's width. */
export function cardWidth(screenW: number): number {
  return Math.round(screenW * CARD_FRAC);
}

/** Which name a grid tile shows: the short one, since a tile is narrow on every phone. */
export function tileTitle(s: { name: string; short: string }, _tile: number): string {
  return s.short;
}
