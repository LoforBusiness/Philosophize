// ─────────────────────────────────────────────────────────────────────────────
// ZERO IMPORTS, and that is a hard requirement rather than a style — the same
// rule rig.ts and tone.ts carry. `npm run check:quickstart` transpiles this file
// and loads it in plain Node, so one `import { Dimensions } from 'react-native'`
// makes the whole check die on react-native's Flow syntax before it measures
// anything. The device read lives in the component; everything here is a
// function of a number the caller supplies.
//
// THE QUICK START CARD'S ART CONTRACT.
//
// The one big invitation on Home: the next lesson this reader can actually open,
// over a picture of its subject. Lessons are the product, so
// this is the card that has to be unmissable — it leads the screen, above the
// reflection, and it is meant to be the thing a reader taps before anything else.
//
// The numbers live here rather than in the component for the same reason
// homeArt.ts exists: `npm run check:quickstart` reads THIS file and measures
// these exact values against all 21 pictures, at every height the card can
// take. Change a number and the check tells you what it did to the worst row of
// the worst picture.
//
// ── THE HEIGHT IS A FRACTION OF THE SCREEN, NOT A NUMBER ────────────────────
//
// It was 196dp, then 288dp, and a fixed number is the wrong shape for "make it
// dominant": 288 fills a 640dp phone and floats in the middle of an 870dp one.
// Dominance is proportional, so the height is too — 48% of the window, clamped.
//
// The clamp ends are both load-bearing. The FLOOR (320) is above the 288 it
// replaces, so no device gets a smaller card than before. The CEILING (404) is
// what keeps the daily reflection peeking below it on the tallest phones: a hero
// that fills the viewport exactly reads as the whole page, and nobody scrolls.
//
// The arithmetic the floor has to survive, on the smallest phone worth counting
// (window 640dp): page padding 6 + masthead 120 + gap 22 + card 320 + gap 18
// = 486, then ~50dp of reflection showing = 536, against 640 − ~100dp of tab bar
// and status bar = 540. It fits, with 4dp to spare, which is why the floor is
// 320 and not 340.
//
// ── THERE IS NO SCRIM ANY MORE (2026-09-29) ─────────────────────────────────
//
// The five black-and-white photographs are gone. The card shows a drawn scene for
// the lesson's subject (components/home/quickStartScenes.ts), each standing on a
// horizon with a dark ground below, and the card lays the picture so that horizon
// lands just above the title (qsLayout). The words sit on the scene's own ground,
// so the gradient that used to protect them has nothing left to do, and it went —
// with the stops it had to recompute for every card height.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What the body block occupies, in dp: two lines of title, the meta line, the
 * CTA bar and the bottom padding. Everything above it is picture.
 *
 * Kept in step with QuickStartCard's styles by hand — it is six numbers, and the
 * alternative (measuring on device) is not available to the check.
 */
export const QS_BODY_DP = 191;

const CLAMP_MIN = 320;
const CLAMP_MAX = 404;
const SCREEN_SHARE = 0.48;

/** The card's height for a given window height, in dp. */
export function qsCardHeight(windowH: number): number {
  return Math.round(Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, windowH * SCREEN_SHARE)));
}

/** Every height the check has to clear: both clamp ends and a few in between. */
export const QS_TEST_HEIGHTS: readonly number[] = [
  CLAMP_MIN,
  qsCardHeight(740),
  qsCardHeight(800),
  CLAMP_MAX,
];

/**
 * The band the type occupies, as dp from the top of a card of height `h`.
 *
 * Only ONE band: the kicker sits on a solid ink tab, so its contrast is
 * self-contained and no measurement of the picture applies to it.
 *
 * Deliberately generous at the top edge: a band that under-states where a letter
 * can land would pass a card that fails.
 */
export function qsBodyBand(h: number): [number, number] {
  return [h - QS_BODY_DP - 8, h];
}

/** Type colours. One fixed cream, never sampled from the picture. */
export const QS_CREAM = '#F4F1EA';
export const QS_FAINT = 'rgba(240,237,229,0.76)';

/** WCAG AA. Everything measured is body-sized, so there is no lower allowance. */
export const QS_FLOOR_BODY = 4.5;

/** The tab that carries the kicker. Ink, so contrast is a given. */
export const QS_TAB_INK = 'rgba(20,19,17,0.92)';
