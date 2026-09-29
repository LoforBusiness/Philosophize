import type { SketchIconName } from './SketchIcon';

// The two things every surface that lists the six branches needs alongside their
// hue in `constants/design.ts`: a short name that fits a row, and the icon that
// stands for them.
//
// Extracted because a SECOND screen now draws mastery rows. Profile held both
// maps privately, and the paywall drawing its own copy is precisely how "Politics"
// becomes "Political Philosophy" on one screen and not the other — the same drift
// `constants/design.ts` gives its own reasons for avoiding with the hues. One
// place, three facts, keyed on the same slug.
//
// NOT in design.ts, though they belong beside `BRANCH` conceptually: that file
// declares "NO REACT IN THIS FILE" so `scripts/check-ui.mjs` can import it in
// plain Node, and naming `SketchIconName` there would drag a .tsx into the
// checker's module graph.

/** Fits a mastery row. "Political Philosophy" does not; "POLITICS" does. */
export const BRANCH_SHORT: Record<string, string> = {
  logic: 'LOGIC',
  ethics: 'ETHICS',
  epistemology: 'EPISTEMOLOGY',
  metaphysics: 'METAPHYSICS',
  aesthetics: 'AESTHETICS',
  'political-philosophy': 'POLITICS',
};

export const BRANCH_ICON: Record<string, SketchIconName> = {
  logic: 'logic',
  ethics: 'scales',
  epistemology: 'eye',
  metaphysics: 'spiral',
  aesthetics: 'palette',
  'political-philosophy': 'building',
};

// ── AND THE SEVEN SUBJECTS (2026-09-29) ─────────────────────────────────────
// Profile's "where your reading goes" lists subjects now, not philosophy's branches.
// Each subject's short name fits the same row; its mark is the nearest SketchIcon to
// its poster (posters.ts): the mortarboard, a thought cloud, a star for a goal, a
// building, a stack of coins, a globe, a clock.

export const SUBJECT_SHORT: Record<string, string> = {
  philosophy: 'PHILOSOPHY',
  psychology: 'PSYCHOLOGY',
  'personal-growth': 'GROWTH',
  business: 'BUSINESS',
  economics: 'ECONOMICS',
  science: 'SCIENCE',
  history: 'HISTORY',
};

export const SUBJECT_ICON: Record<string, SketchIconName> = {
  philosophy: 'grad',
  psychology: 'cloud',
  'personal-growth': 'star',
  business: 'building',
  economics: 'database',
  science: 'globe',
  history: 'clock',
};
