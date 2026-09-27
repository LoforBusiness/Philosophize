import { oEll, oRect, oBar, oTri, ship as libShip, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF aesthetics-aesthetics-3 — A MUSIC ROOM WITH A PUPPET THEATRE. Redrawn
// 2026-09-26, the third lesson of the branch in reading order.
//
//   the theatre   a puppet booth on the floor at the left, a tragic mask on its little
//                 stage, curtains, a stage lamp, and a pull-cord down its right side.
//   the painting  a storm at sea, hung on the wall.
//   the urn       on a bracket on the wall, with a tap on its right and a basin under
//                 it: it fills with pity and fear, and he opens the tap to let them go.
//   the piano     an upright at the right, its keys towards him.
//
// He works from two spots. At 130 he is at the theatre's cord; at 274 the urn's tap is
// on his left and the piano's keys on his right, both inside his reach (his shoulder is
// 49 above the floor, his hand reaches about 25). The painting and the urn are fixed
// to the wall, so walking between the two spots he passes in front of them, never
// through anything on the floor.
//
// The curtains, the lamp's light, the mask, the urn's water, the fallboard and the
// notes are the scene's. STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The puppet theatre: the booth, the opening, the pediment, and the cord. */
export const THEATRE = { x0: 10, x1: 110, top: 344, pedBottom: 362, open: { x0: 24, x1: 96, top: 372, bottom: 444 } };
export const CORD = { x: 114, top: 364, handle: 458 };
/** The mask on the little stage, and the stage lamp over it. */
export const MASK = { x: 60, y: 414 };
export const STAGE_LAMP = { x: 60, y: 378 };
/** The storm painting on the wall. */
export const PAINTING = { x0: 150, x1: 206, top: 340, bottom: 392 };
/** The urn on its bracket, its tap, and the basin under the tap. */
export const URN = { x: 236, top: 412, bottom: 454, r: 14 };
export const TAP = { x: 253, y: 449 };
export const BASIN = { x0: 242, x1: 268, top: 474 };
/** The upright piano and its keys. */
export const PIANO = { x0: 300, x1: 392, top: 420 };
export const KEYS = { x0: 286, x1: 302, y: 456 };
/** Where he stands: the theatre's cord, and between the urn and the piano. */
export const AT_CORD = 130;
export const AT_PIANO = 274;

/** The booth: a box on the floor with two posts and a pediment. */
export function theatre(): ObjPart[] {
  const { x0, x1, top, pedBottom, open } = THEATRE;
  const cx = (x0 + x1) / 2;
  return [
    oRect('mass', cx, (open.bottom + GROUND) / 2, x1 - x0, GROUND - open.bottom, 0, 2),
    oRect('mass', (x0 + open.x0) / 2, (pedBottom + open.bottom) / 2, open.x0 - x0, open.bottom - pedBottom, 0, 1),
    oRect('mass', (open.x1 + x1) / 2, (pedBottom + open.bottom) / 2, x1 - open.x1, open.bottom - pedBottom, 0, 1),
    oRect('mass', cx, (top + pedBottom) / 2, x1 - x0 + 6, pedBottom - top, 0, 2),
    oRect('face', cx, (open.bottom + GROUND) / 2 + 4, x1 - x0 - 14, GROUND - open.bottom - 18, 0, 2),
  ];
}

/** The cord down the booth's right side, with its tassel. */
export function cord(): ObjPart[] {
  return [oBar('line', CORD.x, CORD.top, CORD.x, CORD.handle - 3, 1.4), oEll('mass', CORD.x, CORD.handle, 6, 8)];
}

/** The painting's frame. */
export function frame(): ObjPart[] {
  const { x0, x1, top, bottom } = PAINTING;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0, bottom - top, 0, 2)];
}

/** The storm in the painting: a ship, laid out in the painting's own units. */
export function paintedShip(): ObjPart[] {
  const w = PAINTING.x1 - PAINTING.x0;
  return libShip(w * 0.52, 30, 26, 22);
}

/** The urn on its bracket, the tap, and the basin under it on its own bracket. */
export function urn(): ObjPart[] {
  const { x, top, bottom, r } = URN;
  return [
    oBar('mass', x - 8, bottom + 2, x - 8, bottom + 16, 3),
    oRect('mass', x - 2, bottom + 16, 26, 4, 0, 1.5),
    oRect('mass', x, top - 4, 12, 6, 0, 1.5),
    oEll('mass', x, (top + bottom) / 2 + 2, 2 * r, bottom - top),
    oBar('mass', x + r - 2, TAP.y, TAP.x + 3, TAP.y, 3),
    oRect('face', TAP.x + 3, TAP.y + 3, 3, 5, 0, 1),
    // the basin, on a bracket from the wall
    oRect('mass', (BASIN.x0 + BASIN.x1) / 2, BASIN.top + 4, BASIN.x1 - BASIN.x0, 8, 0, 3),
    oBar('mass', (BASIN.x0 + BASIN.x1) / 2, BASIN.top + 8, (BASIN.x0 + BASIN.x1) / 2, BASIN.top + 18, 3),
  ];
}

/** The upright piano: its case, its lid, the key shelf and the keys, two feet. */
export function piano(): ObjPart[] {
  const { x0, x1, top } = PIANO;
  const cx = (x0 + x1) / 2;
  return [
    oRect('mass', cx, (top + GROUND - 4) / 2, x1 - x0, GROUND - 4 - top, 0, 3),
    oRect('mass', cx, top - 2, x1 - x0 + 4, 5, 0, 1.5),
    oRect('face', cx + 4, (top + KEYS.y - 10) / 2, x1 - x0 - 20, KEYS.y - 10 - top - 8, 0, 2),
    oRect('mass', (KEYS.x0 + x0 + 4) / 2, KEYS.y + 2, x0 + 4 - KEYS.x0, 6, 0, 1.5),
    oRect('lit', (KEYS.x0 + x0) / 2 + 1, KEYS.y - 2, x0 - KEYS.x0 + 2, 3, 0, 0.5),
    oBar('mass', KEYS.x0 + 3, KEYS.y + 5, KEYS.x0 + 3, GROUND - 2, 3),
    oRect('mass', x0 + 8, GROUND - 2, 12, 4, 0, 1),
    oRect('mass', x1 - 8, GROUND - 2, 12, 4, 0, 1),
    oTri('mass', x1 - 16, top - 8, 10, 6, 'up'),
  ];
}
