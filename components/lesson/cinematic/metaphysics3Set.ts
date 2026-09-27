import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF metaphysics-being-3 — A CELLAR STUDIO. Redrawn 2026-09-26, the third
// lesson of the branch in reading order.
//
//   the stairs    four treads rising to the LEFT, up to a landing and the cellar door;
//                 a handrail beside them. He climbs them tread by tread, hand on the
//                 rail, and never walks through them.
//   the stool     where he sits to watch the shadow.
//   the table     the apple, and the lantern that throws its shadow on the wall.
//   the grate     a high window onto the river running past outside.
//   the easel     a painting of the apple.
//
// The door, the light beyond it, the apple, the shadow, the river and the sticks
// move, so the scene draws them. STAGE UNITS, GROUND at 500. Zero imports beyond
// ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** Each tread: its top and its right end (they all run to the wall at x 0), bottom first. */
export const TREADS = [
  { top: 488, x1: 142 },
  { top: 476, x1: 120 },
  { top: 464, x1: 100 },
  { top: 452, x1: 80 },
];
/** Where he stands: on the floor at the foot, then on each tread; the last is the landing. */
export const CLIMB_X = [154, 131, 110, 90, 62];
/** The cellar door in the wall above the landing. */
export const DOOR = { x0: 6, x1: 46, top: 344, bottom: 452 };
/** The handrail: its foot and its head. */
export const RAIL = { x0: 148, y0: 452, x1: 84, y1: 414 };
export function railY(x: number): number {
  'worklet';
  const u = Math.max(0, Math.min(1, (RAIL.x0 - x) / (RAIL.x0 - RAIL.x1)));
  return RAIL.y0 + (RAIL.y1 - RAIL.y0) * u;
}
/** The stool, and the height of its seat. */
export const STOOL = { x: 172, seat: 475 };
/** The table, and where the apple and the lantern sit on it. */
export const TABLE = { x0: 200, x1: 282, top: 452 };
export const APPLE_AT = { x: 218, y: 445 };
export const LANTERN = { x: 266, y: 436 };
/** The sticks, stood in their block on the table. */
export const STICKS = { x: 240, base: 450 };
/** The high window grate onto the river. */
export const GRATE = { x0: 298, x1: 374, top: 330, bottom: 352 };
/** The easel, and the canvas on it. */
export const CANVAS = { x0: 318, x1: 378, top: 384, bottom: 432 };

/** The four treads, stacked blocks down to the floor, and the rail beside them. */
export function stairs(): ObjPart[] {
  const parts: ObjPart[] = TREADS.map((t) => oRect('mass', t.x1 / 2, (t.top + GROUND) / 2, t.x1, GROUND - t.top, 0, 1));
  parts.push(
    oBar('line', RAIL.x0, TREADS[0].top, RAIL.x0, RAIL.y0 - 2, 2.5),
    oBar('line', RAIL.x1, TREADS[3].top, RAIL.x1, RAIL.y1 - 2, 2.5),
    oBar('line', RAIL.x0 + 3, RAIL.y0 + 2, RAIL.x1 - 3, RAIL.y1 - 2, 3),
  );
  return parts;
}

/** The door's frame and its lintel (the leaf and the daylight are the scene's). */
export function doorFrame(): ObjPart[] {
  const { x0, x1, top, bottom } = DOOR;
  return [
    oBar('line', x0 - 2, top - 2, x1 + 2, top - 2, 4),
    oBar('line', x1 + 2, top - 2, x1 + 2, bottom, 3),
    oRect('mass', (x0 + x1) / 2, top - 8, x1 - x0 + 12, 6, 0, 1.5),
  ];
}

/** A three-legged stool. */
export function stool(): ObjPart[] {
  const { x, seat } = STOOL;
  return [
    oBar('mass', x - 10, seat + 3, x - 14, GROUND, 3),
    oBar('mass', x + 10, seat + 3, x + 14, GROUND, 3),
    oBar('mass', x, seat + 3, x, GROUND, 3),
    oRect('mass', x, seat + 1, 34, 5, 0, 2),
  ];
}

/** A plain table on four legs, a drawer across its front. */
export function table(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  const cx = (x0 + x1) / 2;
  return [
    oBar('mass', x0 + 7, top + 4, x0 + 7, GROUND, 5),
    oBar('mass', x1 - 7, top + 4, x1 - 7, GROUND, 5),
    oRect('mass', cx, top + 3, x1 - x0, 7, 0, 2),
    oRect('face', cx, top + 14, x1 - x0 - 20, 10, 0, 2),
  ];
}

/** The lantern: a base, a glass body and a cap with a ring (the flame is the scene's). */
export function lantern(): ObjPart[] {
  const { x, y } = LANTERN;
  return [
    oRect('mass', x, y + 13, 16, 4, 0, 1.5),
    oRect('lit', x, y + 3, 12, 16, 0, 3),
    oRect('mass', x, y - 7, 16, 4, 0, 1.5),
    oEll('line', x, y - 12, 6, 5),
  ];
}

/** The grate's frame and bars (the water behind is the scene's). */
export function grateBars(): ObjPart[] {
  const { x0, x1, top, bottom } = GRATE;
  const parts: ObjPart[] = [
    oBar('line', x0, top, x1, top, 3), oBar('line', x0, bottom, x1, bottom, 3),
    oBar('line', x0, top, x0, bottom, 3), oBar('line', x1, top, x1, bottom, 3),
  ];
  for (let x = x0 + 12; x < x1; x += 12) parts.push(oBar('line', x, top, x, bottom, 2));
  return parts;
}

/** The easel: three legs and the ledge the canvas stands on. */
export function easel(): ObjPart[] {
  const { x0, x1, bottom } = CANVAS;
  const cx = (x0 + x1) / 2;
  return [
    oBar('mass', cx - 18, bottom + 2, cx - 26, GROUND, 3.5),
    oBar('mass', cx + 18, bottom + 2, cx + 26, GROUND, 3.5),
    oBar('mass', cx, CANVAS.top - 10, cx, GROUND - 6, 3),
    oRect('mass', cx, bottom + 3, x1 - x0 + 10, 5, 0, 1.5),
  ];
}
