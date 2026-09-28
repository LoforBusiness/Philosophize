import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF ethics-ethics-4 — AN ANTHROPOLOGIST'S STUDY, AND A VILLAGE OF THE WORLD.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE STUDY    a globe on a floor stand, a wall map pinned with many colours, and a
//              desk with Ruth Benedict's book on it.
// THE VILLAGE  five homes from five parts of the world in one row — an igloo, a tent, a
//              round hut, a pagoda, a cottage — on one ground, with the stone foundation
//              under all of them that the lesson ends on.
//
// THE CHANGE goes into the globe's ocean and comes out of the village's sky, which is
// the same blue.
//
// A grave lesson (N11): nothing in either set is a gag, and nothing draws a harm the
// narration names. He reaches about 25 from a shoulder 49 above the floor: the globe at
// 80 from 114, the book at 330 from 312. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the study ────────────────────────────────────────────────────────────────

export const GLOBE = { x: 80, y: 438, r: 20 };
export const MAP = { x0: 150, x1: 310, top: 330, bottom: 404 };
/** The pins on the map: where, and in which of the palette's colours each culture flies. */
export const PINS = [[172, 350], [196, 366], [222, 346], [248, 372], [268, 352], [290, 368], [186, 384], [276, 386]];
export const DESK = { x0: 300, x1: 380, top: 466 };
export const BOOK = { x: 330, y: 461 };

export function globeStand(): ObjPart[] {
  const { x, y, r } = GLOBE;
  return [
    oBar('mass', x, y + r + 2, x, GROUND - 4, 3),
    oRect('mass', x, GROUND - 3, 30, 6, 0, 1.5),
    oBar('line', x - r - 3, y - 6, x + r - 2, y + 10, 1.4),
  ];
}
export function mapFrame(): ObjPart[] {
  const { x0, x1, top, bottom } = MAP;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0 + 6, bottom - top + 6, 0, 2)];
}
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  return [
    oBar('mass', x0 + 6, top + 4, x0 + 6, GROUND, 4),
    oBar('mass', x1 - 6, top + 4, x1 - 6, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
    oRect('face', (x0 + x1) / 2, top + 9, x1 - x0 - 12, 8, 0, 1.5),
  ];
}

// ── the village ──────────────────────────────────────────────────────────────

/** Where the homes stand, their ground, and each one's door. */
export const HOME_GROUND = 470;
export const HOMES = [48, 122, 200, 278, 352];
/** The two signs of the last question, on posts in front. */
export const SIGNS = [96, 304];

export function igloo(x: number): ObjPart[] {
  return [oEll('mass', x, HOME_GROUND - 2, 56, 50), oRect('dark', x, HOME_GROUND - 8, 14, 14, 0, 6)];
}
export function tent(x: number): ObjPart[] {
  return [
    oTri('mass', x, HOME_GROUND - 22, 56, 44, 'up'),
    oTri('dark', x, HOME_GROUND - 10, 14, 20, 'up'),
    oBar('line', x, HOME_GROUND - 44, x, HOME_GROUND - 52, 1.6),
  ];
}
export function roundHut(x: number): ObjPart[] {
  return [
    oRect('mass', x, HOME_GROUND - 13, 44, 26, 0, 3),
    oTri('mass', x, HOME_GROUND - 38, 60, 26, 'up'),
    oRect('dark', x, HOME_GROUND - 9, 10, 18, 0, 2),
  ];
}
export function pagoda(x: number): ObjPart[] {
  return [
    oRect('mass', x, HOME_GROUND - 14, 40, 28, 0, 1.5),
    oTri('mass', x, HOME_GROUND - 34, 62, 12, 'up'),
    oRect('mass', x, HOME_GROUND - 42, 26, 10, 0, 1),
    oTri('mass', x, HOME_GROUND - 52, 40, 10, 'up'),
    oRect('dark', x, HOME_GROUND - 9, 10, 18, 0, 1),
  ];
}
export function cottage(x: number): ObjPart[] {
  return [
    oRect('mass', x, HOME_GROUND - 15, 46, 30, 0, 1.5),
    oTri('mass', x, HOME_GROUND - 40, 54, 22, 'up'),
    oRect('mass', x + 14, HOME_GROUND - 48, 7, 12, 0, 1),
    oRect('dark', x - 8, HOME_GROUND - 9, 10, 18, 0, 1),
    oRect('dark', x + 11, HOME_GROUND - 18, 10, 9, 0, 1),
  ];
}
export function signPosts(): ObjPart[] {
  return SIGNS.flatMap((x) => [oBar('mass', x, 420, x, GROUND - 2, 4)]);
}
