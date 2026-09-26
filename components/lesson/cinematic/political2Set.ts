import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF political-political-2 — A HARBOUR. The owner approved it on 2026-09-26,
// one of six second lessons redesigned after the first-lesson sets.
//
//   the booth       the harbour office on the left, with its sign and a bracket on
//                   its wall where the harbourmaster's signal flag is kept.
//   the toll box    a post box on the quay, where dues are paid.
//   the quay wall   the far edge of the quay, where the water meets the stone.
//   the lighthouse  at the harbour mouth, on the horizon.
//   the bollards    three mooring posts on the quay front, for the second question.
//
// The water, the ships, the flagpoles and the flags move, so the scene draws them.
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The harbour office. */
export const BOOTH = { x0: 6, x1: 62, top: 434, roof: 420 };
/** Where the signal flag hangs on the booth's wall. */
export const BRACKET = { x: 66, y: 468 };
/** The toll box on the quay. */
export const TOLL = { x: 138, top: 468 };
/** The water, from the horizon to the quay wall. */
export const WATER = { top: 420, bottom: 486 };
/** The three flagpoles and how high a flag goes. */
export const POLES = [206, 262, 318];
export const POLE_TOP = 318;
/** The three bollards. */
export const BOLLARDS = [216, 280, 344];

/** The harbour office: walls, a pitched roof, a window, a door. */
export function booth(): ObjPart[] {
  const { x0, x1, top, roof } = BOOTH;
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  return [
    oRect('mass', cx, (top + GROUND) / 2, w, GROUND - top, 0, 2),
    oTri('mass', cx, (roof + top) / 2 + 1, w + 12, top - roof + 2, 'up'),
    oRect('face', cx, top + 1, w + 8, 4, 0, 1),
    oRect('dark', cx + 12, 484, 16, 30, 0, 2),
    oBar('line', x1 + 1, BRACKET.y, x1 + 7, BRACKET.y, 2.5),
    oBar('line', x1 + 1, BRACKET.y + 20, x1 + 7, BRACKET.y + 20, 2.5),
  ];
}

/** A post box on a short pedestal, with its slot. */
export function tollBox(): ObjPart[] {
  const { x, top } = TOLL;
  return [
    oRect('mass', x, top + 10, 20, 20, 0, 4),
    oRect('face', x, (top + 20 + GROUND) / 2, 8, GROUND - top - 20, 0, 1),
    oBar('line', x - 5, top + 5, x + 5, top + 5, 2),
    oRect('face', x, GROUND - 2, 16, 4, 0, 1),
  ];
}

/** The quay wall: a strip of dressed stone where the water meets the quay. */
export function quayWall(): ObjPart[] {
  const top = WATER.bottom;
  const parts: ObjPart[] = [oRect('mass', 200, (top + GROUND) / 2, 400, GROUND - top, 0, 1)];
  for (let x = 30; x < 400; x += 44) parts.push(oBar('line', x, top + 1, x, GROUND - 1, 1.2));
  return parts;
}

/** A lighthouse on its rock at the harbour mouth. */
export function lighthouse(): ObjPart[] {
  const x = 384;
  return [
    oEll('face', x, WATER.top + 3, 34, 10),
    oRect('mass', x, 398, 10, 40, 0, 2),
    oRect('dark', x, 384, 10, 5, 0, 0),
    oRect('lit', x, 373, 8, 7, 0, 1.5),
    oTri('mass', x, 364, 14, 8, 'up'),
  ];
}

/** A mooring bollard: a short post with a cap. */
export function bollard(x: number): ObjPart[] {
  return [
    oRect('mass', x, GROUND - 7, 12, 14, 0, 3),
    oEll('mass', x, GROUND - 15, 18, 7),
  ];
}
