// ─────────────────────────────────────────────────────────────────────────────
// THE QUICK START CARD'S ART CONTRACT.
//
// The one big invitation on Home: the next lesson this reader can actually open,
// over a photograph, on a different branch each day. Lessons are the product, so
// this is the card that has to be unmissable.
//
// The numbers live here rather than in the component for the same reason
// homeArt.ts exists: `scripts/check-quickstart-contrast.mjs` reads THIS file and
// measures these exact values against all five photographs. Change a number and
// the check tells you what it did to the worst row of the worst picture.
//
// ── WHY THE CARD GREW, AND WHY THAT IS FREE ─────────────────────────────────
//
// It was 196dp. The five source images are PORTRAIT — 317×586 up to 382×570 —
// and the card crops a landscape strip out of the middle with `cover`. At 196 a
// full-width card showed about 30% of the picture's height; at 288 it shows 44%.
// The horizontal scale is unchanged (it is pinned by the card's width, ~1.13×
// on the narrowest source), so a taller card is not a softer one. It is simply
// more photograph, which is the opposite of the usual cost of making a card big.
//
// ── AND WHY THE SCRIM HAD TO BE RE-SHAPED, NOT JUST STRETCHED ───────────────
//
// A gradient's stops are FRACTIONS. Keeping [0, 0.5, 1] while the card grows by
// 92dp moves the middle stop 46dp further from the type, so the wash that used
// to be arriving right where the title starts now arrives well above it — the
// card gets taller and the words get LESS protected. The stops below are pinned
// to where the type actually is at this height, and the check is what proves it.
// ─────────────────────────────────────────────────────────────────────────────

/** Card height in dp. */
export const QS_CARD_H = 288;

/**
 * The wash, top to bottom, at QS_SCRIM_STOPS.
 *
 * SHAPED rather than linear, the same move the welcome end card and the Home
 * masthead make (§19). The top stays deliberately thin so the sky reads — the
 * kicker up there is small, and it is the one run allowed to sit on a light
 * wash — then it deepens early and holds, because everything from the title
 * down is the part a reader has to be able to read at a glance.
 */
export const QS_SCRIM: readonly [string, string, string, string] = [
  'rgba(14,13,11,0.16)',
  'rgba(14,13,11,0.36)',
  'rgba(14,13,11,0.80)',
  'rgba(14,13,11,0.95)',
];

/**
 * Where those four stops sit, as fractions of QS_CARD_H.
 *
 * The third stop is the load-bearing one: it is pinned just ABOVE where the
 * title starts, so the wash has already reached working depth by the time the
 * first letter of the lesson name arrives. The first two are deliberately thin
 * — nothing is written up there any more (see the tab below), so that is the
 * part of the card where the photograph gets to be a photograph.
 */
export const QS_SCRIM_STOPS: readonly [number, number, number, number] = [0, 0.26, 0.4, 1];

/**
 * The band the type occupies, as dp from the top of the card.
 *
 * Only ONE band now. The kicker and the branch used to sit loose on the thin top
 * wash and measured 1.36:1 on four of the five skies — translucent cream over a
 * bright cloud bank is not a colour, it is a suggestion. They are now on a solid
 * ink tab, so their contrast is self-contained (cream on ink, 15:1) and no
 * measurement of the photograph applies to them at all. That is the §19 move
 * played properly: construct the contrast rather than hope the crop is kind.
 *
 * Deliberately generous at the top edge: a band that under-states where a letter
 * can land would pass a card that fails.
 */
export const QS_BODY_BAND: readonly [number, number] = [QS_CARD_H - 175, QS_CARD_H];

/** Type colours. One fixed cream, never sampled from the picture. */
export const QS_CREAM = '#F4F1EA';
export const QS_SOFT = 'rgba(240,237,229,0.88)';
export const QS_FAINT = 'rgba(240,237,229,0.76)';

/** WCAG AA. Everything measured is body-sized, so there is no lower allowance. */
export const QS_FLOOR_BODY = 4.5;

/** The tab that carries the kicker and the branch. Ink, so contrast is a given. */
export const QS_TAB_INK = 'rgba(20,19,17,0.92)';
