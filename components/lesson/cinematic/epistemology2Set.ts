import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-3 — DESCARTES' STOVE-HEATED ROOM, AT NIGHT.
// Redrawn 2026-09-26, the second lesson of the epistemology branch in reading order.
//
//   the stove      a tiled stove in the corner, its fire the only other light in the
//                  room; the demon is the shadow that fire throws on the wall.
//   the window     the senses: a night sky, a tree and the moon (the view is the
//                  scene's, because the demon changes it).
//   the portrait   memory: an oval frame on the wall.
//   the slate      simple sums: 2 + 3 = 5, hung on a nail.
//   the desk       his notebook and his candle.
//
// Things that move — the view, the portrait's face, the chalk, the shutters, the
// candle, the shadow — are the scene's. STAGE UNITS, GROUND at 500. Zero imports
// beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The back wall's skirting. */
export const WALL_FOOT = 486;
/** The stove in the corner, and its firebox. */
export const STOVE = { x0: 4, x1: 56, top: 404, pipeX: 30 };
export const FIREBOX = { x: 30, y: 470, w: 26, h: 18 };
/** The window, the portrait and the slate, and where he stands to reach each. */
export const WINDOW = { x0: 68, x1: 122, top: 366, bottom: 442 };
export const PORTRAIT = { cx: 158, cy: 402, w: 36, h: 50 };
export const SLATE = { x0: 194, x1: 242, top: 396, bottom: 436 };
export const REACH_X = { window: 140, portrait: 180, slate: 180 };
/** The desk, and where the notebook and the candle sit on it. */
export const DESK = { x0: 286, x1: 382, top: 452 };
export const NOTEBOOK = { x: 304, y: 448, w: 40 };
export const CANDLE = { x: 334, y: 438 };
/** Where he stands at the desk. */
export const DESK_X = 290;

/** The tiled stove: its body, its tiles, the firebox mouth and the flue. */
export function stove(): ObjPart[] {
  const { x0, x1, top, pipeX } = STOVE;
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  const parts: ObjPart[] = [
    oRect('mass', pipeX, (300 + top) / 2, 10, top - 300, 0, 1),
    oRect('mass', cx, (top + GROUND) / 2, w, GROUND - top, 0, 3),
    oRect('face', cx, top + 3, w + 6, 6, 0, 2),
    oRect('dark', FIREBOX.x, FIREBOX.y, FIREBOX.w + 6, FIREBOX.h + 6, 0, 3),
  ];
  for (let y = top + 18; y < 452; y += 16) parts.push(oBar('line', x0 + 3, y, x1 - 3, y, 1));
  for (let x = x0 + 13; x < x1; x += 13) parts.push(oBar('line', x, top + 8, x, 452, 1));
  return parts;
}

/** The window's frame, its sill and its glazing bars (the view behind is the scene's). */
export function windowFrame(): ObjPart[] {
  const { x0, x1, top, bottom } = WINDOW;
  const cx = (x0 + x1) / 2;
  return [
    oBar('line', x0, top, x1, top, 4),
    oBar('line', x0, top, x0, bottom, 4),
    oBar('line', x1, top, x1, bottom, 4),
    oBar('line', cx, top, cx, bottom, 2.5),
    oBar('line', x0, (top + bottom) / 2, x1, (top + bottom) / 2, 2.5),
    oRect('mass', cx, bottom + 3, x1 - x0 + 12, 6, 0, 1.5),
  ];
}

/** The slate's nail and cord, and its wooden frame (the chalk is the scene's). */
export function slateHanger(): ObjPart[] {
  const { x0, x1, top } = SLATE;
  const cx = (x0 + x1) / 2;
  return [
    oBar('line', cx, top - 14, x0 + 8, top, 1.4),
    oBar('line', cx, top - 14, x1 - 8, top, 1.4),
    oEll('line', cx, top - 14, 4, 4),
  ];
}

/** The desk: its top, its legs and a drawer. */
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  const cx = (x0 + x1) / 2;
  return [
    oBar('mass', x0 + 8, top + 4, x0 + 8, GROUND, 5),
    oBar('mass', x1 - 8, top + 4, x1 - 8, GROUND, 5),
    oRect('mass', cx, top + 3, x1 - x0, 7, 0, 2),
    oRect('face', cx + 10, top + 16, 44, 14, 0, 2),
    oEll('lit', cx + 10, top + 16, 5, 3),
  ];
}

/** The candlestick's saucer, left on the desk while he carries the candle. */
export function saucer(): ObjPart[] {
  return [oEll('mass', CANDLE.x, CANDLE.y + 12, 18, 5), oTri('face', CANDLE.x, CANDLE.y + 8, 8, 6, 'up')];
}
