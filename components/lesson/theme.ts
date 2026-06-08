// Shared palette for the light, Blinkist-style reading experience.
// Keys are kept stable so every consumer maps cleanly; only the values flipped
// from the old dark editorial theme to a paper-and-ink light theme.
export const T = {
  bg: '#FAFAF7',        // page background (paper)
  panel: '#FFFFFF',     // lifted panels / answer rows
  panelSoft: '#F5F2EB',
  border: '#D9D5CB',    // hairline border on paper
  borderSoft: '#E7E3DA',
  cream: '#1A1A1A',     // primary text (ink)
  creamSoft: '#5F5C55', // secondary text
  dim: '#B3AEA3',       // faint / disabled
  gold: '#8A857A',      // muted accent (kickers) — B&W, no gold
  cardCream: '#FFFFFF', // inner question card
  ink: '#1A1A1A',       // text on white cards
  inkSoft: '#6B6B6B',
  green: '#4F7A4A',     // correct accent (darkened for light bg)
  greenBg: '#EAF1E6',
  red: '#A8513F',       // incorrect accent
  redBg: '#F5E7E2',
  press: '#EFEBE2',     // pressed-row highlight on light bg
  segOff: '#E2DED4',    // inactive progress segment
} as const;
