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
// over a photograph, on a different branch each day. Lessons are the product, so
// this is the card that has to be unmissable — it leads the screen, above the
// reflection, and it is meant to be the thing a reader taps before anything else.
//
// The numbers live here rather than in the component for the same reason
// homeArt.ts exists: `npm run check:quickstart` reads THIS file and measures
// these exact values against all five photographs, at every height the card can
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
// ── WHY GROWING IT COSTS NOTHING ────────────────────────────────────────────
//
// The five source images are PORTRAIT — 317×586 up to 382×570 — and the card
// crops a landscape strip out of the middle with `cover`. At 196 a full-width
// card showed about 30% of the picture's height; at 404 it shows 62%. Horizontal
// scale is pinned by the card's WIDTH either way (~1.13× on the narrowest
// source), so a taller card is not a softer one. It is simply more photograph.
//
// ── AND WHY THE SCRIM IS A FUNCTION OF THE HEIGHT ───────────────────────────
//
// A gradient's stops are FRACTIONS, and the body of the card is a fixed number
// of dp. So as the card grows, the body occupies a SMALLER fraction of it, and a
// hard-coded stop drifts further from the type every time the card gets taller —
// making a bigger card a less legible one. The stops below are computed from
// where the body actually starts, so the wash arrives in the same place, in dp,
// at every height. This is the bug that a fixed [0, 0.5, 1] hid at 196dp.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What the body block occupies, in dp: two lines of title, the meta line, the
 * CTA bar and the bottom padding. Everything above it is photograph.
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
 * The wash, top to bottom.
 *
 * SHAPED rather than linear, the same move the welcome end card and the Home
 * masthead make (§19). The top stays deliberately thin so the sky reads —
 * nothing is written up there, because the kicker sits on an ink tab — then it
 * deepens hard just above the title and holds to the bottom.
 */
export const QS_SCRIM: readonly [string, string, string, string] = [
  'rgba(14,13,11,0.16)',
  'rgba(14,13,11,0.36)',
  'rgba(14,13,11,0.80)',
  'rgba(14,13,11,0.95)',
];

/**
 * Where those stops sit for a card of height `h`, as fractions.
 *
 * The third is the load-bearing one: pinned 14dp ABOVE where the title starts,
 * so the wash has already reached working depth by the time the first letter
 * arrives. The second trails it so the transition is a gradient and not an edge.
 */
export function qsScrimStops(h: number): [number, number, number, number] {
  const deep = Math.max(0.18, Math.min(0.9, (h - QS_BODY_DP - 14) / h));
  return [0, deep * 0.62, deep, 1];
}

/**
 * The band the type occupies, as dp from the top of a card of height `h`.
 *
 * Only ONE band. The kicker and the branch used to sit loose on the thin top
 * wash and measured 1.36:1 on four of the five skies — translucent cream over a
 * bright cloud bank is not a colour, it is a suggestion. They are on a solid ink
 * tab now, so their contrast is self-contained (cream on ink) and no measurement
 * of the photograph applies to them at all.
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

/** The tab that carries the kicker and the branch. Ink, so contrast is a given. */
export const QS_TAB_INK = 'rgba(20,19,17,0.92)';
