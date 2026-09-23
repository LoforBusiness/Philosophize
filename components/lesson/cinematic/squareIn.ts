/**
 * The largest square that fits inside a measured box, with a breath of margin.
 *
 * ── WHY A SQUARE IS THE ONLY HONEST SHAPE FOR A DRAWING ─────────────────────
 *
 * Every object in `objects.ts` is authored in a 100×100 design box, and `fit()`
 * scales x and y INDEPENDENTLY off it (`sx = w / 100`, `sy = h / 100`). So the
 * box a drawing is handed does not crop it or letterbox it — it STRETCHES it.
 * A tile 158 wide and 38 tall therefore draws a tree four times wider than it is
 * meant to be, which the owner named on sight: "the boxes that have the four
 * object they seem to be squished."
 *
 * There is no per-object aspect ratio to consult, and there does not need to be:
 * the design box is square, so a square is the one shape that cannot distort
 * anything. Passing `squareIn(box)` for BOTH dimensions keeps every drawing in
 * the proportions it was drawn in, whatever the tile around it is doing.
 *
 * Zero imports on purpose, so a check or a contact sheet can use the same
 * arithmetic the app uses rather than restating it.
 */
export function squareIn(box: { w: number; h: number }, margin = 0.86): number {
  return Math.max(0, Math.min(box.w, box.h) * margin);
}
