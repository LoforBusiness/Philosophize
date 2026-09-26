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
 * to the RIGHT, to a door at the right of the shopfront, so he climbs facing the
 * café and the woman at its table (two figures on a stage face each other, N21).
 */
export const STEPS = [
  { top: 488, x0: 30, x1: 132 },
  { top: 476, x0: 50, x1: 132 },
  { top: 464, x0: 70, x1: 132 },
];
/** Where he stands on the ground at the foot of the steps, then on each step. */
export const CLIMB_X = [18, 42, 62, 90];
/** The A-board. */
export const BOARD = { x: 146, y: 414, w: 84, h: 56 };
/** The café: the awning's span, the table, and the owner's chair. */
export const AWNING = { x0: 258, x1: 400, y: 330 };
export const TABLE = { cx: 318, top: 468, w: 44 };
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

/** The three front steps. */
export function steps(): ObjPart[] {
  // each step a block down to the ground, the higher ones stacked on the lower
  return STEPS.map((s) => oRect('mass', (s.x0 + s.x1) / 2, (s.top + GROUND) / 2, s.x1 - s.x0, GROUND - s.top, 0, 1));
}

/** The A-board's two legs and its hinge. */
export function aBoard(): ObjPart[] {
  const { x, y, w, h } = BOARD;
  return [
    oBar('mass', x + 10, y + h - 4, x + 2, GROUND, 4),
    oBar('mass', x + w - 10, y + h - 4, x + w - 2, GROUND, 4),
    oRect('mass', x + w / 2, y - 3, 16, 5, 0, 2),
  ];
}

/** The café: an awning on two poles, a round table on one leg, and a chair. */
export function cafe(): ObjPart[] {
  const { x0, x1, y } = AWNING;
  const stripes: ObjPart[] = [];
  for (let x = x0 + 6; x < x1 - 8; x += 24) stripes.push(oRect('face', x + 6, y + 9, 12, 16, 0, 0));
  const { cx, top, w } = TABLE;
  const { x: chx, seat } = CHAIR;
  return [
    oBar('mass', x0 + 10, y + 16, x0 + 10, GROUND, 3),
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
