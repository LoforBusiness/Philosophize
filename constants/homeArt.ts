// ─────────────────────────────────────────────────────────────────────────────
// THE HOME MASTHEAD'S ART CONTRACT.
//
// Home wears the reader's own chosen profile picture behind its wordmark. That
// image is one of ten, and they range from a near-white woodcut sky to a nearly
// black spiral — so the type on top cannot take its contrast from the artwork
// (§19). It takes it from a FIXED scrim and ONE fixed cream, exactly the way
// QuickStartCard does, and the numbers live here rather than in the component
// for one reason: `scripts/check-profile-contrast.mjs` parses this file and
// measures those exact values against every image. Change a number here and the
// check tells you what it did to the worst row of the worst picture.
//
// ── WHY NOT THE `tone` FLAG THE IMAGES ALREADY CARRY ────────────────────────
//
// data/profileBackgrounds.ts gives each image a measured `tone`, and the profile
// header switches between ink-on-paper and paper-on-ink from it. That flag is
// correct and it is NOT reusable here: it was measured over the band the PROFILE
// header's text occupies — from 34% down the image to the bottom, under an
// avatar. Home crops a short band from a different part of the same picture and
// puts a wordmark across it. Reusing the flag would be trusting a measurement
// taken somewhere else, which is the class of mistake §19 exists to prevent.
//
// So Home commits to one direction — cream on a dark scrim, always — and pays
// for it with a heavier wash than the profile needs. One direction is also what
// keeps the masthead looking like the same masthead when the reader changes
// their picture.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Height of the band, in dp.
 *
 * 120 rather than the 104 this started at, and the extra 16 is not padding — it
 * is the only picture in the band. A 27px wordmark plus its caption plus the
 * bottom padding is about 69dp of type no matter how tall the band is, so the
 * band's height IS how much photograph there is above the words. At 104 that
 * left 35dp and the scrim had to be so deep so early that the image stopped
 * being visible at all. Still 10dp shorter than the five stacked lines it
 * replaced.
 */
export const HOME_BAND_H = 120;

/**
 * The wash, top to bottom, at HOME_SCRIM_STOPS.
 *
 * SHAPED, not linear — the same move the welcome end card makes (§19). A plain
 * top-to-bottom ramp has to be thin in the middle, and the middle is exactly
 * where the wordmark's cap-height lands; the measurement below caught The Range
 * and The Small House failing there at 4.27 and 4.48 against a 4.5 floor. So the
 * wash goes shallow-then-deep: the top third carries the picture, and it has
 * already reached its working depth by the time the first letter starts.
 *
 * The floor is arithmetic, not taste. Cream (#F4F1EA) needs its background under
 * about 0.15 relative luminance to clear WCAG AA at small sizes, and against a
 * WHITE pixel an ink wash only gets there around 0.62 alpha — so nothing the
 * type touches may be thinner than that.
 */
export const HOME_SCRIM: readonly [string, string, string] = [
  'rgba(14,13,11,0.10)',
  'rgba(14,13,11,0.72)',
  'rgba(14,13,11,0.93)',
];
export const HOME_SCRIM_STOPS: readonly [number, number, number] = [0, 0.40, 1];

/**
 * Where the type starts, as a fraction of the band — MEASURED off the styles
 * below, not chosen.
 *
 * band 120 − paddingBottom 14 − (wordmark ~36 + gap 6 + line ~13) = 51 → 0.425,
 * rounded down to 0.40 so the check errs against itself. Getting this wrong is
 * silent and one-directional: too high and the script simply never looks at the
 * rows the wordmark actually sits on. It was 0.55 first, which is why the first
 * run reported everything comfortable.
 */
export const HOME_TEXT_TOP = 0.40;

/** The wordmark and the line under it. One cream, never sampled from the art. */
export const HomeCream = '#F4F1EA';
export const HomeSoft = 'rgba(240,237,229,0.82)';

/** Behind a picture that has not decoded yet, and under a transparent one. */
export const HomeBase = '#1A1A1A';

/**
 * The slow push over the art — the page's only always-on motion.
 *
 * The floor is 1.05 rather than 1.0 because a `cover` image scaled to exactly 1
 * has its edge on the band's edge, and the translate would walk paper into
 * frame. Everything here is a transform on one View, so it composites on the GPU
 * and never repaints the picture (§17 rule 6 is about re-rasterising SVG; an
 * Image under a transform is not that).
 */
export const HOME_DRIFT = { from: 1.05, to: 1.12, shiftX: -7, ms: 26_000 } as const;
