import { oEll, oRect, oBar, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

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

// ── THE HALL, REDRAWN 2026-09-28 against references ─────────────────────────
//
// Owner: the second scene's objects *"seem to be more cheap"*. The plinth was one box,
// the frames two plain rectangles, the windows two rounded boxes, the rope a red bar.
// Now (references: a statue pedestal's three parts — base, die, cap; a gilt picture
// frame's moulding; a museum's brass stanchions and velvet rope; a gallery's tall
// arched windows with glazing bars):

/** The pedestal: a stepped base, the die, and a moulded cap. */
export function plinth(): SetPart[] {
  const { x, top } = PLINTH;
  return [
    oRect('mass', x, GROUND - 4, 70, 8, 0, 1),
    oRect('mass', x, GROUND - 10, 62, 5, 0, 1),
    oRect('mass', x, (top + 8 + GROUND - 12) / 2, 52, GROUND - 12 - top - 8, 0, 0.5),
    oRect('mass', x, top + 5, 60, 5, 0, 1),
    oRect('mass', x, top + 1.5, 66, 4, 0, 1),
    oRect('face', x + 16, (top + 8 + GROUND - 12) / 2, 14, GROUND - 22 - top - 8),
    oRect('face', x, top + 7.5, 60, 1.2),
  ];
}
/** Two paintings in gilt frames: an outer moulding and a recessed inner edge. */
export function frames(): SetPart[] {
  return FRAMES.flatMap((f) => {
    const cx = (f.x0 + f.x1) / 2;
    const cy = (f.top + f.bottom) / 2;
    const w = f.x1 - f.x0;
    const h = f.bottom - f.top;
    return [
      oRect('mass', cx, cy, w + 6, h + 6, 0, 1.5),
      oRect('face', cx + 1, cy + 1, w + 1, h + 1, 0, 1),
      oRect('dark', cx, cy, w - 2, h - 2, 0, 0.5),
    ];
  });
}
/** Tall arched windows with a sill and glazing bars. */
export function windows(): SetPart[] {
  return WINDOWS.flatMap((wx) => [
    oRect('mass', wx, 424, 48, 6, 0, 1),
    oPoly('lit', [wx - 18, 420, wx - 18, 338, wx - 15, 330, wx - 8, 324, wx, 322, wx + 8, 324, wx + 15, 330, wx + 18, 338, wx + 18, 420]),
    oRect('line', wx, 372, 1.6, 96),
    oRect('line', wx, 356, 36, 1.6),
    oRect('line', wx, 392, 36, 1.6),
  ]);
}
/** The wall's rails: a picture rail high up and a dado rail with panelling below it. */
export function rails(): SetPart[] {
  return [
    oRect('face', 200, 332, 400, 2.4),
    oRect('mass', 200, 438, 400, 4, 0, 0),
    ...[30, 110, 290, 370].map((px) => oRect('face', px, 446, 60, 1.2)),
  ];
}
/** Posts for the velvet rope in front of the plinth. */
export function ropePosts(): SetPart[] {
  const post = (x: number): SetPart[] => [
    oEll('mass', x, GROUND - 1.5, 14, 4),
    oBar('mass', x, GROUND - 3, x, 474, 3),
    oEll('mass', x, 472, 7, 7),
  ];
  return [
    ...post(158),
    ...post(234),
  ];
}
/** The velvet rope, sagging between the two posts. */
export function rope(): SetPart[] {
  return [
    oPoly('dark', [160, 474, 176, 481, 196, 484, 216, 481, 232, 474, 232, 477, 216, 484.5, 196, 487.5, 176, 484.5, 160, 477]),
  ];
}
