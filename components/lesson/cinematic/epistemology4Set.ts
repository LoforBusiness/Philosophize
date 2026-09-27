import { oEll, oRect, oBar, tree as libTree, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-4 — A DARK CLOSET WITH ONE OPENING (Locke's own
// picture of the understanding: "a closet wholly shut from light, with only some
// little openings left, to let in external visible resemblances"). Redrawn
// 2026-09-26, the third lesson of the branch in reading order.
//
//   outside      a strip of the world beyond the left wall: a tree with a red apple.
//   the wall     thick, with one small opening at chest height and a shutter on it.
//   the paper    a sheet of white paper on the far wall, where the image falls.
//   the desk     a drafting desk with a sheet on it, for the compass and the tiles.
//   the cord     hanging by the paper, to lower the grid.
//
// The light, the image, the shutter, the circle, the tiles and the grid are the
// scene's. STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The world outside, beyond the left wall. */
export const OUTSIDE = { x1: 62 };
export const TREE = { x: 32, y: 446, w: 52, h: 84 };
/** The wall, and the opening in it at chest height. */
export const WALL_X = { x0: 62, x1: 76 };
export const HOLE = { x: 76, y: 440 };
/** The sheet of white paper on the far wall. */
export const PAPER = { x0: 282, x1: 392, top: 356, bottom: 438 };
/** The drafting desk and the sheet lying on it. */
export const DESK = { x0: 176, x1: 244, top: 456 };
export const SHEET = { x0: 180, x1: 226, top: 426, bottom: 452 };
/** The cord that lowers the grid, and its handle. */
export const CORD = { x: 268, top: 300, handle: 444 };

/** The ground outside the wall. */
export function outsideGround(): ObjPart[] {
  return [oRect('mass', OUTSIDE.x1 / 2, GROUND - 4, OUTSIDE.x1, 8, 0, 1)];
}
/** The tree outside, from the object library. */
export function tree(): ObjPart[] {
  return libTree(TREE.x, TREE.y, TREE.w, TREE.h);
}
/** The same tree, laid out about a centre, for the image the opening throws. */
export function treeAt(x: number, y: number, s: number): ObjPart[] {
  return libTree(x, y, TREE.w * s, TREE.h * s);
}

/** The thick wall and the rim of its opening. */
export function wall(): ObjPart[] {
  const { x0, x1 } = WALL_X;
  return [
    oRect('mass', (x0 + x1) / 2, 400, x1 - x0, 200, 0, 1),
    oEll('dark', HOLE.x - 3, HOLE.y, 8, 8),
  ];
}

/** The drafting desk: a sloped top on two legs, and a pencil tray. */
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  const cx = (x0 + x1) / 2;
  return [
    oBar('mass', x0 + 6, top + 3, x0 + 6, GROUND, 5),
    oBar('mass', x1 - 6, top + 3, x1 - 6, GROUND, 5),
    oRect('mass', cx, top + 2, x1 - x0, 6, 0, 2),
    oRect('face', cx, top + 12, x1 - x0 - 16, 8, 0, 2),
  ];
}

/** The paper's pins and the rail it hangs from; the cord's pulley. */
export function paperRail(): ObjPart[] {
  const { x0, x1, top } = PAPER;
  return [
    oBar('line', x0 - 4, top - 6, x1 + 4, top - 6, 3),
    oEll('mass', x0 + 6, top + 4, 5, 5),
    oEll('mass', x1 - 6, top + 4, 5, 5),
    oEll('line', CORD.x, CORD.top + 4, 8, 8),
  ];
}

/** A sun behind the tree. */
export function sun(): ObjPart[] {
  return [oEll('lit', 18, 326, 16, 16)];
}
