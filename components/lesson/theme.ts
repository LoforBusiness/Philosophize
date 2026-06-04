// Shared palette for the dark, editorial lesson experience.
export const T = {
  bg: '#1A1A1A',        // page background (near-black)
  panel: '#232220',     // lifted panels / answer rows
  panelSoft: '#1E1D1A',
  border: '#3A382F',    // subtle hairline border on dark
  borderSoft: '#2D2B25',
  cream: '#F4F0E7',     // primary text
  creamSoft: '#B7B2A6', // secondary text
  dim: '#54514A',       // unspoken / not-yet-read words
  gold: '#B7B2A6',      // muted accent (kickers, ★, emphasis) — kept B&W, no gold
  cardCream: '#F1ECE2', // light question card
  ink: '#1A1A1A',       // text on cream
  inkSoft: '#6B6B6B',
  green: '#8BA585',     // correct accent
  greenBg: '#20271E',
  red: '#C77F72',       // incorrect accent
  redBg: '#2A1E1B',
} as const;
