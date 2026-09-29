import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF ethics-ethics-2 — A PAVEMENT OUTSIDE A CAFÉ. The owner approved it on
// 2026-09-26, one of six second lessons redesigned after the first-lesson sets.
//
//   the shop      a shopfront on the left with a door up three front steps; the
//                 HONESTY plaque over the door and the steps' glow are the scene's.
//   the A-board   a pavement sign in the middle, chalked with the three lenses.
//   the café      an awning on the right over a round table and a chair, where the
//                 wallet's owner sits; the three glasses cases are on the table.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The shopfront, its door, and the three front steps up to it. */
export const SHOP = { x0: 0, x1: 132, top: 318 };
export const DOOR = { x: 72, w: 50, top: 390 };
/**
 * Each step: its top edge and its left and right ends, bottom step first. They rise
 * to the LEFT, up to the door, so he reaches their foot from the café side and
 * climbs them the way a person does — up the treads, never through them. The top
 * one is the landing in front of the door.
 */
export const STEPS = [
  { top: 488, x0: 70, x1: 146 },
  { top: 476, x0: 70, x1: 134 },
  { top: 464, x0: 70, x1: 122 },
];
/** Where he stands on the pavement at the foot of the steps, then on each tread. */
export const CLIMB_X = [156, 140, 128, 104];
/** The handrail up the steps: its two posts, foot and head, and where each stands. */
export const RAIL = { x0: 146, y0: 458, x1: 116, y1: 432 };
/** The rail's height over a point of the steps. */
export function railY(x: number): number {
  'worklet';
  const u = Math.max(0, Math.min(1, (RAIL.x0 - x) / (RAIL.x0 - RAIL.x1)));
  return RAIL.y0 + (RAIL.y1 - RAIL.y0) * u;
}
/**
 * The A-board: the slate inside its frame. RE-STOOD 2026-09-28 at chest height to
 * his left as he works at the café end, so he faces it and chalks it — it used to
 * stand behind him while he faced the café, and he chalked, swapped lenses and read
 * Kant's rule with his back to it.
 */
export const BOARD = { x: 186, y: 430, w: 84, h: 50 };
/** The café: the awning's span, the table, and the owner's chair. */
export const AWNING = { x0: 258, x1: 400, y: 330 };
export const TABLE = { cx: 318, top: 468, w: 64 };
/** Where the three glasses cases lie on the café table, and how big each is. */
export const CASES = [TABLE.cx - 21, TABLE.cx, TABLE.cx + 21];
export const CASE_W = 18;
export const CHAIR = { x: 358, seat: 474 };

/** The shopfront: wall, window, door frame, and a sign band over it. */
export function shop(): ObjPart[] {
  const { x0, x1, top } = SHOP;
  const cx = (x0 + x1) / 2;
  return [
    oRect('face', cx, (top + 464) / 2, x1 - x0, 464 - top, 0, 0),
    oRect('mass', cx, top + 6, x1 - x0 + 4, 12, 0, 1),
    oRect('mass', DOOR.x + DOOR.w / 2, (DOOR.top + 464) / 2, DOOR.w + 8, 464 - DOOR.top + 4, 0, 2),
    oRect('dark', DOOR.x + DOOR.w / 2, (DOOR.top + 464) / 2 + 2, DOOR.w - 4, 464 - DOOR.top - 6, 0, 1),
    oEll('lit', DOOR.x + DOOR.w - 10, 432, 5, 5),
    oRect('lit', 30, 404, 36, 44, 0, 2),
  ];
}

/** The three front steps, and the handrail beside them. */
export function steps(): ObjPart[] {
  // each step a block down to the ground, the higher ones stacked on the lower
  const blocks = STEPS.map((s) => oRect('mass', (s.x0 + s.x1) / 2, (s.top + GROUND) / 2, s.x1 - s.x0, GROUND - s.top, 0, 1));
  const { x0, y0, x1, y1 } = RAIL;
  return [
    ...blocks,
    oBar('line', x0, STEPS[0].top, x0, y0 - 2, 2.5),
    oBar('line', x1, STEPS[2].top, x1, y1 - 2, 2.5),
    oBar('line', x0 + 3, y0 + 2, x1 - 3, y1 - 2, 3),
  ];
}

/**
 * The A-board, drawn against a photograph of a café sandwich board (Wikimedia
 * Commons, "Prefixed menu"): a wooden frame whose two sides run on down to the
 * pavement as its legs, splayed a little, a rail under the slate and a crossbar
 * near the foot, the rear leg showing past the far side, and the hinge on top. It
 * was two sticks under a rectangle. The slate itself is the scene's.
 */
export function aBoard(): ObjPart[] {
  const { x, y, w, h } = BOARD;
  return [
    oBar('dark', x + w + 2, y - 3, x + w + 13, GROUND, 3),
    oBar('mass', x - 1, y - 4, x - 7, GROUND, 5),
    oBar('mass', x + w + 1, y - 4, x + w + 7, GROUND, 5),
    oRect('mass', x + w / 2, y - 3, w + 8, 7, 0, 1.5),
    oRect('mass', x + w / 2, y + h + 3, w + 6, 6, 0, 1),
    oRect('mass', x + w / 2, y + h + 13, w + 10, 3.5, 0, 1),
    oRect('lit', x + w / 2, y - 5, 16, 2, 0, 1),
  ];
}

/**
 * The café: its front wall with a window, the awning fixed to that wall (it had a
 * pole at its front edge, which stood right where he now works the A-board), a round
 * table on one leg, and a chair.
 */
export function cafe(): ObjPart[] {
  const { x0, x1, y } = AWNING;
  const stripes: ObjPart[] = [];
  for (let x = x0 + 6; x < x1 - 8; x += 24) stripes.push(oRect('face', x + 6, y + 9, 12, 16, 0, 0));
  const { cx, top, w } = TABLE;
  const { x: chx, seat } = CHAIR;
  return [
    oRect('face', (x0 + x1) / 2 + 6, (y + 464) / 2, x1 - x0 - 12, 464 - y, 0, 0),
    oRect('mass', 372, 400, 40, 44, 0, 2),
    oRect('lit', 372, 400, 32, 36, 0, 1),
    oBar('line', 372, 383, 372, 417, 1.5),
    oRect('mass', (x0 + x1) / 2, y + 9, x1 - x0, 18, 0, 2),
    ...stripes,
    oRect('mass', (x0 + x1) / 2, y + 19, x1 - x0, 3, 0, 1),
    oBar('mass', cx, top + 3, cx, GROUND - 4, 4),
    oRect('mass', cx, GROUND - 2, 24, 4, 0, 2),
    oRect('mass', cx, top + 2, w, 5, 0, 2.5),
    oBar('mass', chx - 12, seat + 3, chx - 14, GROUND, 3),
    oBar('mass', chx + 12, seat + 3, chx + 14, GROUND, 3),
    oRect('mass', chx, seat + 1, 30, 4, 0, 1.5),
    oBar('mass', chx + 13, seat, chx + 17, seat - 40, 3),
  ];
}
