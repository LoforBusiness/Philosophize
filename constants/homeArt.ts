// ─────────────────────────────────────────────────────────────────────────────
// THE HOME MASTHEAD'S ART CONTRACT.
//
// Home wears the reader's own chosen picture behind its wordmark. Since 2026-10-01
// that picture is a DRAWN place (components/shared/profileScenes.ts) standing on a
// horizon with dark ground below it, so the type no longer takes its contrast from
// a scrim laid over a photograph: the band puts the horizon at HOME_HORIZON and the
// words stand on the ground underneath. `scripts/check-profile-contrast.mjs` reads
// these numbers, lays every place the way the band does and measures the pixels
// the words actually stand on.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Height of the band, in dp. Taller than the 120 it was, because the picture is
 * now ABOVE the words rather than under them: 186 − 112 leaves 74dp of ground for
 * a 27px wordmark, its line and the padding, and 112dp of place above it.
 */
export const HOME_BAND_H = 186;

/** Where the picture's horizon lands, in dp from the top of the band. */
export const HOME_HORIZON = 112;

/** The wordmark and the line under it. One cream, on every place's ground. */
export const HomeCream = '#F4F1EA';
export const HomeSoft = 'rgba(240,237,229,0.82)';

/**
 * The slow slide under the words — the page's only always-on motion. A translate
 * on one View, so it composites on the GPU and never repaints the picture.
 */
export const HOME_DRIFT = { shiftX: 10, ms: 26_000 } as const;
