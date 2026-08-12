// ─────────────────────────────────────────────────────────────────────────────
// THE UI SYSTEM'S ONE SOURCE OF VALUES.
//
// Before this file, Settings held three off-whites four points apart and
// Thinkers held three near-blacks. Nobody chose nine greys; nothing said there
// should be three. Every boundary landed at a slightly different value, so
// nothing grouped and the eye could not tell which differences meant anything.
// That is what "cluttered" turned out to be.
//
// NO REACT IN THIS FILE, so scripts/check-ui.mjs can measure it in plain Node.
// A colour that is not in here is a colour nobody decided on, and the checker
// fails the build on one appearing in a converted screen.
// ─────────────────────────────────────────────────────────────────────────────

export const C = {
  /** The accent. STRUCTURAL ONLY — outlines, button lips, rings, tracks.
   *  Never a flooded surface: the loudest thing on any screen stays ink. */
  HUE: '#1B3B3C',

  // NO SEPARATE SHADOW COLOUR — and don't add one back. The button's lip is a
  // solid slab of `HUE` itself; the face lands on it, so the lip IS the shadow.
  // A second "deeper" petrol tone (`HUE_DEEP`) was tried here and removed:
  // nothing ever consumed it, and the only value that cleared the distinctness
  // check against `HUE` and `ink` was LIGHTER than `HUE` — backwards for a
  // shadow. A colour and its own shade are meant to read as one material, which
  // is what `components/shared/tone.ts` does correctly for the rank pins
  // (light/shadow on one hex), not a second, separately-named hex.

  /** Progress tracks and faint fills. */
  HUE_SOFT: '#F0F7F6',

  ink: '#1A1A1A',
  inkSoft: '#686868',
  /** For disabled and decorative marks ONLY — never for text a user needs to
   *  read. Measured at 2.11:1 on `paper`, under even the 3:1 non-text floor;
   *  it recedes on purpose and is not a body/caption colour. */
  dim: '#B3AEA3',

  paper: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceSoft: '#F4F2EC',
  hairline: '#E7E3DA',

  /** Unchanged, and NOT repurposed: these mean answer states in
   *  components/lesson/theme.ts and must go on meaning that. */
  correct: '#4F7A4A',
  /** `wrong` on `wrongSoft` (the Danger Zone's text on its own fill) measures
   *  4.54:1 against a 4.5:1 floor — passing, but by only 0.04. Both are
   *  hard-gated in scripts/check-ui.mjs's PAIRS with no buffer built in, so
   *  do not nudge either value without re-running the checker: this margin is
   *  thin enough that a small change to either token, or a different
   *  contrast calculator's rounding, could tip it under. Left as measured,
   *  not adjusted — see the checker for the number in context. */
  wrong: '#A8513F',
  wrongSoft: '#F7E9E9',
} as const;

export type TypeKey = 'display' | 'title' | 'body' | 'label' | 'micro';

/** Five sizes. Inter is loaded at 400/500/700 only — there is no 600. */
export const TYPE: Record<TypeKey, {
  family: string; fontSize: number; lineHeight: number; letterSpacing?: number;
}> = {
  display: { family: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 34 },
  title:   { family: 'PlayfairDisplay_700Bold', fontSize: 22, lineHeight: 28 },
  body:    { family: 'Inter_400Regular',        fontSize: 16, lineHeight: 24 },
  label:   { family: 'Inter_500Medium',         fontSize: 13, lineHeight: 18 },
  micro:   { family: 'Inter_500Medium',         fontSize: 11, lineHeight: 14, letterSpacing: 1.5 },
};

/** The only gaps and paddings allowed. */
export const SPACE = [4, 8, 12, 16, 24, 32] as const;
export type SpaceKey = 0 | 1 | 2 | 3 | 4 | 5;

export const RADIUS = { card: 12, button: 14, pill: 999 } as const;

/** How far a pressable drops onto its own shadow. */
export const LIP = { button: 4, card: 2 } as const;
