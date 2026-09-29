import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly, type PolyPart } from './setShapes';

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

// ── THE PIRATE, AND ALEXANDER'S FLEET ───────────────────────────────────────
//
// Augustine's story is ONE small ship against a FLEET, so they must not be one
// drawing stamped four times. Each is drawn bow to the right about its own origin
// (x 0 at midships, y 0 at the waterline) and scaled by `s`; the scene turns them to
// sail in from the right.
//
// THE PIRATE is a SLOOP. REFERENCE: sloop plans and pirate-ship illustrations — one
// mast stepped forward of midships, a big gaff mainsail aft of it on a boom and a
// gaff, a triangular jib forward to a long bowsprit, a low hull with a raised stern,
// a row of gunports, and the black flag at the masthead.
//
// THE FLEET are GALLEYS. REFERENCE: trireme and galley drawings — a long, LOW hull
// whose stern sweeps up and curls over, a RAM at the waterline under the bow with an
// eye painted above it, a bank of OARS raking back into the water, and one square
// sail on a yard (two on the biggest, a small one leaning over the bow).

type Part = ObjPart | PolyPart;
const sc = (pts: number[], s: number, dx: number, dy: number) => pts.map((v, i) => (i % 2 ? dy + v * s : dx + v * s));

/** The pirate sloop, waterline at (x, y). */
export function sloop(x: number, y: number, s: number): Part[] {
  const P = (pts: number[]) => sc(pts, s, x, y);
  const b = (x1: number, y1: number, x2: number, y2: number, t: number, role: 'line' | 'mass' = 'line') =>
    oBar(role, x + x1 * s, y + y1 * s, x + x2 * s, y + y2 * s, t * s);
  return [
    // the sails first, so the hull stands in front of their feet
    oPoly('mass', P([0, -20, 0, -70, -30, -78, -40, -21])),
    oPoly('mass', P([6, -66, 6, -21, 52, -19])),
    // the hull: a raised stern, a sheer falling to the waist and rising to the bow
    // a pirate's hull is tarred black, which is the one tone the sea can never be
    oPoly('line', P([-44, -18, -40, -12, 34, -11, 46, -16, 40, -4, 28, 4, -32, 4, -42, -3])),
    // gunports
    oBar('lit', x - 40 * s, y - 13 * s, x + 34 * s, y - 12 * s, 1.2 * s),
    oRect('lit', x - 16 * s, y - 6 * s, 4 * s, 3 * s, 0, 0.6 * s),
    oRect('lit', x - 2 * s, y - 6 * s, 4 * s, 3 * s, 0, 0.6 * s),
    oRect('lit', x + 12 * s, y - 6 * s, 4 * s, 3 * s, 0, 0.6 * s),
    // mast, boom, gaff and bowsprit
    b(3, -11, 3, -84, 2.6),
    b(1, -21, -41, -21, 1.8),
    b(1, -70, -31, -79, 1.8),
    b(42, -14, 60, -20, 2),
    // the black flag at the masthead, a white mark on it
    oRect('line', x - 4 * s, y - 83 * s, 12 * s, 7 * s, 0, 0.8 * s),
    oEll('lit', x - 4 * s, y - 83 * s, 3 * s, 3 * s),
  ];
}

/** A war galley, waterline at (x, y); `big` adds the foresail and more oars. */
export function galley(x: number, y: number, s: number, big: boolean): Part[] {
  const P = (pts: number[]) => sc(pts, s, x, y);
  const b = (x1: number, y1: number, x2: number, y2: number, t: number, role: 'line' | 'mass' = 'line') =>
    oBar(role, x + x1 * s, y + y1 * s, x + x2 * s, y + y2 * s, t * s);
  const parts: Part[] = [
    // the square sail on its yard, with the two stripes a Greek sail carries
    oPoly('mass', P([-24, -56, 24, -56, 22, -18, -22, -18])),
    oRect('dark', x - 9 * s, y - 37 * s, 5 * s, 36 * s, 0, 0),
    oRect('dark', x + 9 * s, y - 37 * s, 5 * s, 36 * s, 0, 0),
  ];
  if (big) parts.push(oPoly('mass', P([30, -40, 44, -40, 44, -20, 32, -20])));
  parts.push(
    // the oars, raking back into the water under the hull
    ...[-34, -22, -10, 2, 14, 26].slice(0, big ? 6 : 5).map((ox) => b(ox, -4, ox - 11, 10, 1.6)),
    // the hull: long and low, the stern sweeping up and curling, the ram forward
    oPoly('face', P([-52, -12, -44, -8, 42, -8, 52, -5, 50, -1, 62, 2, 50, 4, 38, 6, -40, 6, -50, 1])),
    b(-50, -10, -58, -24, 3.4, 'mass'),
    b(-58, -24, -52, -32, 3, 'mass'),
    b(-52, -32, -47, -29, 2.4, 'mass'),
    b(-44, -9, 46, -9, 1.4),
    // the eye on the bow
    oEll('lit', x + 42 * s, y - 2 * s, 6 * s, 3.4 * s),
    oEll('line', x + 42.5 * s, y - 2 * s, 2 * s, 2 * s),
    // the mast and the yard
    b(0, -8, 0, -64, 2.4),
    b(-26, -56, 26, -56, 2),
    oTri('line', x + 3 * s, y - 63 * s, 6 * s, 4 * s, 'right'),
  );
  if (big) parts.push(b(36, -8, 40, -46, 2), b(28, -40, 46, -40, 1.6));
  return parts;
}
