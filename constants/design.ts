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

  /** Progress tracks and faint fills.
   *
   *  NOTHING CONSUMES THIS TODAY, and the value moved (#F0F7F6 → #CEDEDC)
   *  without a pixel changing anywhere, because the two tracks that used to
   *  hold it are on `hairline` now. The old value was the reason: at #F0F7F6 a
   *  track measured ΔL* 1.50 against `paper` and 3.30 against a Card face —
   *  1.04:1 and 1.09:1 — so the six Branch Mastery bars had no visible unfilled
   *  remainder at all, which is the only thing a progress bar communicates.
   *  It passed 117 checks because it was the ONE token with no contrast pair.
   *  It has two now (see PAIRS in scripts/check-ui.mjs, floor 1.2), and this
   *  value clears them at 1.33:1 on paper and 1.39:1 on surface. A faint fill
   *  still has to be a fill you can see. */
  HUE_SOFT: '#CEDEDC',

  ink: '#1A1A1A',
  inkSoft: '#686868',
  /** For disabled and decorative marks ONLY — never for text a user needs to
   *  read. Measured at 2.11:1 on `paper`, under even the 3:1 non-text floor;
   *  it recedes on purpose and is not a body/caption colour.
   *
   *  ON A DARK GROUND it is the opposite story, and that is what makes it the
   *  right edge for a field sitting on ink: 7.87:1 on `ink`, and 7.28:1 on the
   *  heaviest stop of the Thinkers hero scrim. Both are non-text marks, which
   *  is the use this comment has always allowed — the prohibition is on text,
   *  not on lines. `inkSoft` was measured for the same job and reads 2.89:1
   *  there, under the 3:1 floor, so it is not a substitute. */
  dim: '#B3AEA3',

  paper: '#FAFAF7',
  /** SECONDARY TEXT ON A DARK GROUND — what `inkSoft` is on paper, reversed.
   *
   *  The palette had no such token, so `hairline` absorbed the role by default
   *  and ended up doing three unrelated jobs at once: a border, on-dark caption
   *  text, and a placeholder. The cost was measurable — `hairline` sits ΔL* 7.88
   *  from `paper`, so every kicker, wordmark, date and attribution on the
   *  Thinkers hero came out at almost exactly the brightness of the headlines
   *  they were meant to sit under, and the hierarchy flattened.
   *
   *  This value is not invented: it is the tone that screen already had for the
   *  job (`PaperMuteOnArt`), and it restores the spread it was tuned to give —
   *  ΔL* 19.79 below `paper`. It has to survive TWO grounds, which is what rules
   *  the darker candidates out: solid `ink` (9.76:1) and the lightest stop of
   *  the hero scrim, where the wordmark sits (5.05:1, over a 0.62 ink wash on
   *  pen-on-white art). The screen's older, darker mute measured 3.2:1 there and
   *  that is exactly why it needed a second tone; one token that clears both is
   *  the point of having a system.
   *
   *  It is TEXT. Borders on a dark ground are `dim`'s job, per its comment
   *  above — do not let this one drift back into doing two things. */
  paperSoft: '#C4C2BB',
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

// ─────────────────────────────────────────────────────────────────────────────
// THE ERAS, AND THE ONE PLACE THIS APP IS ALLOWED A HUE THAT MEANS SOMETHING.
//
// The identity is ink on paper, and it stays that way everywhere else. 322
// thinkers is the exception, and the reason is legibility rather than
// decoration: a list that long is unnavigable in one tone, and "which era is
// this person from" is the single fact a reader sorts them by. Five colours, one
// per era, is therefore a LABEL, not a mood — the same argument §19 makes for
// letting photographs behind the branch cards.
//
// A SEPARATE SCALE, NOT PART OF `C`. Two reasons, and the first is hard:
// check-ui caps the palette at 14 and it currently holds 13, so five more would
// fail the build. The second is that they are not interchangeable with `C` —
// nothing here may be used as a general-purpose colour, only to say "this
// thinker belongs to this era".
//
// CHOSEN BY SEARCH, NOT BY EYE. The first hand-picked set put a terracotta
// ANCIENT 19 RGB units from `wrong` and a jade EASTERN 39 from `correct`, so an
// era chip read as an answer state; MEDIEVAL and CONTEMPORARY were 49 apart and
// indistinguishable from each other. These are the output of a constrained
// search over muted HSL space: every one clears 4.5:1 on paper (so it can carry
// its own name as text, not only a rule), stays clear of `wrong`, `correct`,
// `HUE` and the greys, and is tellable from the other four. scripts/check-ui.mjs
// re-derives all of that.
//
// KEYED ON `EraGroup` from data/philosophers.ts — the same five strings that
// file already groups by, so there is no second mapping to drift.
export type EraKey = 'ANCIENT' | 'MEDIEVAL' | 'MODERN' | 'CONTEMPORARY' | 'EASTERN';

export const ERA: Record<EraKey, string> = {
  ANCIENT: '#6A5C2F',       // bronze / olive — antiquity
  MEDIEVAL: '#394974',      // manuscript ultramarine
  MODERN: '#592C2C',        // oxblood, the colour of a bound library
  CONTEMPORARY: '#794082',  // muted plum
  EASTERN: '#3B7D76',       // jade
};

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
