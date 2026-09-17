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
   *  Never a flooded surface: the loudest thing on any screen stays ink.
   *
   *  This IS one of the owner's six swatches (DEEP, components/shared/tone.ts).
   *  It moved #1B3B3C → #2A4343 on 2026-09-15 and almost nothing changed on
   *  screen, which is the finding rather than the edit: the app's outlines had
   *  been a slate teal all along, L* 22.6 against the swatch's 26.5, so the
   *  palette the owner supplied was already the palette the app was drawn in.
   *  10.13:1 on paper, against the 3:1 an outline needs. */
  HUE: '#2A4343',

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
   *  value clears them at 1.31:1 on paper and 1.37:1 on surface. A faint fill
   *  still has to be a fill you can see.
   *
   *  DERIVED, not picked: `HUE` taken 0.84 of the way to paper, so it is the
   *  accent whispering rather than a fourteenth colour somebody chose. */
  HUE_SOFT: '#D9DDDA',

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
  /** THE EDGE OF A SURFACE, AND THE LEDGE UNDER ONE YOU CAN PRESS (2026-09-16).
   *
   *  Paper taken 12% toward ink, with no warmth added — `FLAT_EDGE` in
   *  components/shared/tone.ts is the same mix, and check-ui holds the two equal.
   *  It is Duolingo's construction measured off their live CSS: a white face,
   *  a 2px edge in a pale neutral grey, and — only on something you can press —
   *  a solid ledge in the SAME grey under it. 1.34:1 on white, where theirs is
   *  1.26. The fourteenth colour, which is the cap. */
  edge: '#DFDFDC',

  // ── THE ANSWER STATES, AND THE ONE PLACE LOUD IS CORRECT ──────────────────
  //
  // These mean answer states in components/lesson/theme.ts and must go on
  // meaning that. They are the ONLY two colours in the app allowed past the
  // family's C* 30 ceiling, and the reason is not decoration: a verdict is the
  // one mark a reader must never read as ornament, so it is the one mark that
  // may out-shout the palette around it.
  //
  // BOTH MOVED WHEN THE FAMILY ARRIVED, and both for collisions the old pair
  // could not have had:
  //
  // · `correct` was #4F7A4A, a muted green sitting ΔRGB 27 from the new ethics
  //   olive and 12 from the new logic. A lesson strikes its controls in the
  //   BRANCH hue and then re-strikes them on answering, so on those branches the
  //   verdict and the control would have been the same colour. #2F6440 is deeper
  //   and richer, and the six branches are placed to leave the green wedge
  //   (hue 130–175) empty for it.
  // · `wrong` was #A8513F, a rust — ΔE 21.7 from EMBER, the owner's own spark.
  //   The app's "you got it wrong" and its "your streak is alive" were the same
  //   red-orange. #8E3340 is a cooler oxblood, ΔE 56.6 from the spark.
  //
  // Neither is a free change: `check-ui` measures both against every branch,
  // every era and the accent, in ΔE and in raw sRGB.
  correct: '#2F6440',
  /** `wrong` on `wrongSoft` is the Danger Zone's text on its own fill. The old
   *  pair cleared 4.5:1 by 0.04 and this note used to warn about that margin;
   *  deriving the fill from the ink (0.90 toward paper) rather than picking it
   *  separately puts the pair at 7.22:1 and retires the warning. */
  wrong: '#8E3340',
  wrongSoft: '#EFE6E5',
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

// ── AND ON 2026-09-15 THE FIVE BECAME A LADDER, WHICH IS WHAT AN ERA IS ─────
//
// The set above was five unrelated hues — bronze, ultramarine, oxblood, plum,
// jade — chosen by a search that was allowed the whole colour wheel. Folded into
// the owner's family (hue 45–198) they would not fit: six branches, five eras,
// the accent and two answer states is THIRTEEN meaning-carrying colours, and a
// joint search over all thirteen inside that arc could not clear the old floors
// however it was run. That is not a tuning failure, it is the owner's own
// complaint stated numerically — "there's so many different colors and it's too
// confusing."
//
// So one of the two scales had to stop spending hue, and this is the one, for a
// reason that makes it better rather than merely cheaper: AN ERA IS A POSITION
// IN TIME, and time is an axis. The four Western eras are now one warm hue at
// four lightnesses, oldest darkest — a shelf of spines aged by how long they
// have been on it. EASTERN is the one cool member because it is the one era that
// is not a step in that sequence.
//
// What that buys, measured: the five are told apart by LIGHTNESS (adjacent steps
// differ by 0.024–0.035 of luminance, against the 0.02 floor), so they survive
// being small, and they no longer compete with the six branches for the same
// crowded arc. Every one still clears 4.5:1 on paper, which is what lets an era
// carry its own name as text and not merely be a rule under one.
//
// The chroma is DELIBERATELY BELOW THE BRANCHES' (C* 14–18 against 16–27). That
// is what separates the two scales where they genuinely do meet — a quote plate
// is struck in its era while the lesson around it is struck in its branch — and
// it was added after a first placement put aesthetics and MODERN ΔE 4.2 apart,
// which is to say the same colour.
export const ERA: Record<EraKey, string> = {
  ANCIENT: '#56352F',       // the deepest rung — oldest, darkest
  MEDIEVAL: '#5F4636',      // umber
  MODERN: '#665742',        // the ladder, lightening
  CONTEMPORARY: '#6C6951',  // the newest Western rung, lightest
  // The one cool member: not a step in that sequence. It is also the LIGHTEST of
  // the five, and that is a measurement rather than a flourish — three of the six
  // branches live in the teal-blue band, and at L* 40 this sat ΔE 4.8 from
  // metaphysics, which is to say it was the same colour. Lifting it to L* 46
  // clears every one of them and still reads 4.93:1 on paper.
  EASTERN: '#41757F',
};

// ─────────────────────────────────────────────────────────────────────────────
// THE SIX BRANCHES, AND THE SECOND PLACE A COLOUR CARRIES INFORMATION.
//
// Same argument as ERA above, applied to the other fact a reader sorts this app
// by. Profile draws six mastery bars, a reading-share stack and a run of branch
// marks; in one tone those are six identical readings that have to be matched to
// their labels one at a time, which is exactly the "dull" the redesign was asked
// to fix. A hue per branch makes the stack readable without a legend and makes a
// bar recognisable before its name is read.
//
// A SEPARATE SCALE, NOT PART OF `C`, for both of ERA's reasons: check-ui caps
// the palette at 14 and it holds 13, and nothing here may be used as a
// general-purpose colour — only to say "this is that branch".
//
// ── CHOSEN BY SEARCH, AND THE SEARCH HAD TO BE REWRITTEN TWICE ──────────────
//
// Eight colours were already spoken for (`wrong`, `correct`, `HUE`, and ERA's
// five), so six more is a genuinely crowded fit and picking by eye was never an
// option. Two things the first attempts got wrong, both worth keeping written
// down:
//
// · MEASURED IN sRGB, the search ran straight to the most saturated corner it
//   was allowed — #AE22C3 electric magenta, #167E16 pure green. Everything dark
//   enough to clear 4.5:1 on near-white paper crowds toward the origin in RGB,
//   so a muted set scores as "too close" and the only way to win is to shout.
//   These are measured in CIELAB instead, which separates the way an eye does.
//
// · LEFT FREE, IT BOUGHT SEPARATION WITH LIGHTNESS rather than hue, and returned
//   logic at L* 7.0 (#0C0C45, indistinguishable from ink) beside epistemology at
//   L* 47.8. Six branches are peers; a set where one bar reads as black and
//   another reads as a colour is a hierarchy nobody meant to declare. So all six
//   are pinned into one band — L* 30.2–44.8, C* 24.1–34.0 — and every bit of the
//   separation comes from hue.
//
// The result sits at minimum ΔE 25.1 between any two, against the 29.3 the
// shipped ERA scale manages, and every one clears 4.5:1 on BOTH paper and a
// white card face, so a branch may carry its own name as text. scripts/check-ui.mjs
// re-derives all of it.
//
// ── WHAT THESE ARE DELIBERATELY NOT CHECKED AGAINST, AND WHY ────────────────
//
// ERA and the answer states are held to a LOWER floor here (ΔE 15 and 18) than
// the branches are held to each other (24). That is not the constraint being
// quietly dropped — it is the observation that confusability needs a shared
// view. Six branch bars sit in one list and must be told apart at a glance; an
// era chip lives on Thinkers and an answer state lives inside a lesson, and
// neither is ever on screen beside a mastery bar. The floors that remain are
// insurance for the day one of them is.
export type BranchKey =
  | 'metaphysics' | 'epistemology' | 'logic'
  | 'ethics' | 'aesthetics' | 'political-philosophy';

// ── AND THE SEARCH ABOVE WAS RUN AGAIN, INSIDE THE OWNER'S SIX (2026-09-15) ──
//
// Everything the two notes above say about HOW to search still holds — measure in
// CIELAB, pin the lightness band, take the separation from hue. What changed is
// the room: the arc is the owner's family (hue 42–242 by the time logic is let
// back to its slate blue) instead of the whole wheel, and the chroma ceiling is
// their own register, C* 30, instead of 38.
//
// THE FLOOR CAME DOWN FROM ΔE 24 TO 11.4, AND THAT IS THE DECISION RATHER THAN A
// SLIP. Six hues inside a 200° arc at tame chroma cannot be 24 apart; the
// optimiser will buy that number if you let it, and what it hands back is
// #126B46 and #546422 — a set louder than the swatches it was derived from,
// which is the note the owner wrote. Asked for "blend them a lot", the honest
// answer is a smaller number, and these are the terms it was accepted on.
//
// IT COSTS LESS THAN IT USED TO, because the six no longer have to be told apart
// by colour alone. The one screen that showed six bars together — Profile's
// BRANCH MASTERY — is gone (§14), and the row that replaced it carries the
// branch's ICON and its NAME on every line. A hue that says "this is a set" is
// worth more there than six that say "these are strangers".
//
// TWO OF THE SIX ARE THE OWNER'S OWN SWATCHES within a rounding error —
// epistemology is their teal (ΔE 1.5 from #416B66) and ethics their olive — and
// logic is BACK TO SLATE BLUE, which is what this file always called it and what
// the aubergine-and-rose set had quietly taken away.
//
// THE GREEN WEDGE (hue 130–175) IS LEFT EMPTY ON PURPOSE. `correct` lives there.
// A lesson strikes its controls in the branch hue and re-strikes them green on a
// right answer, so a green branch makes the verdict unreadable as a verdict —
// which is exactly what the first placement did, at ΔRGB 12.
export const BRANCH: Record<BranchKey, string> = {
  metaphysics: '#2E5B61',           // deep teal — the cosmos
  epistemology: '#427069',          // the owner's teal — the clear eye
  logic: '#33647B',                 // slate blue — the machinery of proof
  ethics: '#656E50',                // the owner's olive — conduct
  aesthetics: '#6A5733',            // bronze — taste
  'political-philosophy': '#935D4D',// sienna, the family's warm end — the forum
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

/**
 * 16 for a card since 2026-09-16: the owner asked for the screens outside the
 * lessons to feel more gamified, and every reference measured for it (Duolingo's
 * live CSS uses 16 on 205 rules and 12 on 111; Brilliant's course cards match)
 * rounds a surface more than the 12 this was. Two radii and the pill, no more.
 */
export const RADIUS = { card: 16, button: 14, pill: 999 } as const;

/**
 * How far a pressable drops onto its own ledge.
 *
 * The card's went 2 → 3 with the same pass, and the chip is new. Duolingo's
 * white buttons carry a 2px edge plus a 2px ledge; a card here is a larger
 * object, and at 2 the ledge read as a slightly heavy bottom border rather than
 * as something to press.
 */
export const LIP = { button: 4, card: 3, chip: 2 } as const;
