import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF logic-arguments-4 — A LECTURE ROOM, AND A GREEK BANQUET BY THE SEA.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE ROOM     a chalkboard split into DEDUCTIVE and INDUCTIVE, with a padlock that
//              shuts on the valid argument; a desk under it with a bowl of olives.
// THE BANQUET  a terrace over the sea at dusk: a long table set with plates of olives,
//              one place marked SOCRATES under a covered dish, four clay voting shards
//              on the ledge behind, three amphorae at the edge of the terrace.
//
// THE CHANGE goes into the olive he holds up and comes out of an olive on a plate. The
// two olives are one shape; the one in his hand is the larger, so the room is pushed in
// less deep and they meet at the same size.
//
// He reaches about 25 from a shoulder 49 above the floor: the bowl at 236 from 262, the
// dish at 300 from 280. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the room ─────────────────────────────────────────────────────────────────

export const BOARD = { x0: 50, x1: 350, top: 326, bottom: 430, mid: 200 };
export const DESK = { x0: 150, x1: 250, top: 468 };
export const BOWL = { x: 236, y: 462 };
export const LOCK = { x: 176, y: 404 };

export function board(): ObjPart[] {
  const { x0, x1, top, bottom } = BOARD;
  return [
    oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0 + 8, bottom - top + 8, 0, 2),
    oRect('mass', (x0 + x1) / 2, bottom + 6, x1 - x0 - 20, 4, 0, 1),
  ];
}
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  return [
    oBar('mass', x0 + 6, top + 4, x0 + 6, GROUND, 4),
    oBar('mass', x1 - 6, top + 4, x1 - 6, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}
export function bowl(): ObjPart[] {
  const { x, y } = BOWL;
  return [oEll('mass', x, y, 26, 12), oEll('dark', x, y - 3, 20, 4)];
}

// ── the banquet ──────────────────────────────────────────────────────────────

export const TABLE = { x0: 64, x1: 326, top: 470 };
/** The plates along the table; the fifth has no olives on it. */
export const PLATES = [86, 114, 142, 170, 198, 226, 254];
export const EMPTY_PLATE = 4;
/** Socrates' place, under a covered dish. */
export const DISH = { x: 300, y: 462 };
/** The olive the change comes out of: the middle olive on the first plate. */
export const OLIVE_PLATE = { x: PLATES[0], y: TABLE.top - 7, r: 2.5 };
export const LEDGE = { x0: 60, x1: 330, y: 420 };
export const SHARDS = [84, 132, 180, 228];
export const AMPHORAE = [20, 36, 52];

export function terrace(): ObjPart[] {
  return [
    oRect('mass', 20, 416, 18, 168, 0, 2),
    oRect('mass', 20, 332, 26, 8, 0, 2),
    oRect('mass', 380, 416, 18, 168, 0, 2),
    oRect('mass', 380, 332, 26, 8, 0, 2),
    oRect('mass', (LEDGE.x0 + LEDGE.x1) / 2, LEDGE.y + 3, LEDGE.x1 - LEDGE.x0, 6, 0, 2),
  ];
}
export function banquetTable(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  const parts: ObjPart[] = [
    oBar('mass', x0 + 8, top + 4, x0 + 8, GROUND, 4),
    oBar('mass', (x0 + x1) / 2, top + 4, (x0 + x1) / 2, GROUND, 4),
    oBar('mass', x1 - 8, top + 4, x1 - 8, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
  for (const px of PLATES) parts.push(oEll('mass', px, top - 2, 22, 5));
  parts.push(oEll('mass', DISH.x, top - 2, 26, 5));
  return parts;
}
/** One amphora standing at ax, drawn on its own so it can rock on its foot. */
export function amphora(ax: number): ObjPart[] {
  return [
    oEll('mass', ax, GROUND - 13, 13, 20),
    oRect('mass', ax, GROUND - 25, 6, 6, 0, 1),
    oTri('mass', ax, GROUND - 2, 7, 5, 'down'),
  ];
}
