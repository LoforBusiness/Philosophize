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

/** The small label pills (tag.tsx). */
export const PILL = { fontSize: 9, letterSpacing: 0.8, padX: 7 } as const;

export const BRANCH_TITLE = { family: 'PlayfairDisplay_700Bold', fontSize: 18, lineHeight: 22 } as const;
/** How many lines a branch card gives its name: "Political Philosophy" needs two on a narrow phone. */
export const BRANCH_NAME_LINES = 2;
/**
 * A branch card's poster: a panel flush with the card's left edge, the card's full
 * height (BRANCH_CARD_H), this wide.
 */
export function branchArt(screenW: number): number {
  return screenW < 360 ? 80 : 112;
}
/** A branch card's height — two lines of name, two of description and the foot. */
export const BRANCH_CARD_H = 132;
/** The card's own 2px border, each side (Card's face). */
const CARD_BORDER = 2;
/** The room a branch card leaves its words: the page less the poster, gaps, arrow and borders. */
export function branchTextWidth(screenW: number): number {
  return screenW - 2 * PAGE_PAD - branchArt(screenW) - 3 * TILE_PAD - 12 - 2 * CARD_BORDER;
}

// ── THE POSTERS' BOXES (2026-09-29) ──────────────────────────────────────────
// The art fills the top of every card, edge to edge (posters.ts). Each height is a
// share of the card's width, so the poster keeps one shape on every phone.

/** A Home carousel card's poster height. */
export function cardArtHeight(cardW: number): number {
  return Math.round(cardW * 0.64);
}
/** A Learn grid tile's poster height. */
export function tileArtHeight(tileW: number): number {
  return Math.round(tileW * 0.7);
}
/** The wide (Philosophy) Learn tile's poster height. */
export function heroArtHeight(w: number): number {
  return Math.round(w * 0.5);
}
/** A subject page's masthead poster height. */
export const MAST_ART_H = 170;

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
