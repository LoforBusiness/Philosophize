import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF aesthetics-aesthetics-4 — A STUDIO, AND THE EXHIBITION HALL OF 1917.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE STUDIO   a work table with a factory-made urinal on it under a cloth, and two
//              easels for the older theories: a painted apple beside a real one
//              (imitation), and a painting of a feeling (expression).
// THE HALL     a grand exhibition hall: arched windows, framed paintings on the walls,
//              the urinal on a plinth under a spotlight, a screen that can be slid in
//              front of it, and a banner for the artworld.
//
// THE CHANGE goes into the signed urinal on the table and comes out of the same urinal
// on its plinth: one drawing at one size, so the push in and the pull out meet.
//
// He reaches about 25 from a shoulder 49 above the floor: the urinal's near side at
// 208 from 232. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the studio ───────────────────────────────────────────────────────────────

export const TABLE = { x0: 130, x1: 214, top: 466 };
/** Where the urinal stands on the table, and on the plinth in the hall. */
export const PIECE_TABLE = { x: 194, base: TABLE.top };
export const EASELS = [{ x: 44 }, { x: 98 }];
export const CANVAS_Y = { top: 378, bottom: 416 };

export function workTable(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  return [
    oBar('mass', x0 + 6, top + 4, x0 + 6, GROUND, 4),
    oBar('mass', x1 - 6, top + 4, x1 - 6, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}
/** An easel: two front legs and a back leg, and the ledge the canvas stands on. */
export function easel(x: number): ObjPart[] {
  return [
    oBar('mass', x - 12, GROUND, x - 3, CANVAS_Y.top - 6, 3),
    oBar('mass', x + 12, GROUND, x + 3, CANVAS_Y.top - 6, 3),
    oBar('mass', x, CANVAS_Y.bottom, x + 10, GROUND, 2.4),
    oRect('mass', x, CANVAS_Y.bottom + 2, 34, 4, 0, 1),
  ];
}

// ── the hall ─────────────────────────────────────────────────────────────────

export const PLINTH = { x: 196, top: 452 };
export const PIECE_PLINTH = { x: 196, base: PLINTH.top };
/** Two framed paintings on the hall's walls, and the arched windows between. */
export const FRAMES = [{ x0: 20, x1: 76, top: 340, bottom: 392 }, { x0: 318, x1: 380, top: 336, bottom: 394 }];
export const WINDOWS = [120, 272];

export function plinth(): ObjPart[] {
  const { x, top } = PLINTH;
  return [
    oRect('mass', x, (top + GROUND) / 2, 54, GROUND - top, 0, 1.5),
    oRect('mass', x, top + 2, 62, 5, 0, 1.5),
    oRect('mass', x, GROUND - 3, 62, 6, 0, 1.5),
  ];
}
export function frames(): ObjPart[] {
  return FRAMES.map((f) => oRect('mass', (f.x0 + f.x1) / 2, (f.top + f.bottom) / 2, f.x1 - f.x0, f.bottom - f.top, 0, 2));
}
/** Posts for the velvet rope in front of the plinth. */
export function ropePosts(): ObjPart[] {
  return [
    oBar('mass', 158, 474, 158, GROUND - 2, 3),
    oEll('mass', 158, 472, 7, 7),
    oBar('mass', 234, 474, 234, GROUND - 2, 3),
    oEll('mass', 234, 472, 7, 7),
  ];
}
