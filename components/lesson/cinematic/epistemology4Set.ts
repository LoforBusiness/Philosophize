import { oEll, oRect, oBar, type ObjPart } from './objects';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-4 — A DARK CLOSET WITH ONE OPENING (Locke's own
// picture of the understanding: "a closet wholly shut from light, with only some
// little openings left, to let in external visible resemblances"). Redrawn
// 2026-09-26, the third lesson of the branch in reading order.
//
//   outside      a strip of the world beyond the left wall: an apple tree with a red apple.
//   the wall     thick, with one small opening at chest height and a shutter on it.
//   the paper    a sheet of white paper on the far wall, where the image falls.
//   the desk     a drafting desk with a sheet on it, for the compass and the tiles.
//   the cord     hanging by the paper, to lower the grid.
//
// The light, the image, the shutter, the circle, the tiles and the grid are the
// scene's. STAGE UNITS, GROUND at 500. Zero runtime imports beyond ./objects.
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
// ── THE APPLE TREE, redrawn 2026-09-28 against a photograph ──────────────────
//
// Owner: the tree "reads as a mushroom". It was the object library's tree squeezed
// into a 52 × 84 box: a narrow dome on a stalk that FLARED at its foot, with a dark
// ellipse across the canopy's underside — which is a mushroom's cap, stem and gills,
// part for part. A photographed apple tree (Barkedal, Sweden, laden with red fruit)
// is the opposite on every count: the canopy is WIDER than it is tall and hangs LOW
// at its edges; the trunk is short and thick and FORKS into two leaning limbs that
// disappear up into the leaves; and the shade is on the side away from the light,
// not a band under the whole crown.
//
// So: a dome 74 wide by ~50 tall, one big mass with leaf clusters bulging from its
// edge (the scallop), its skirt drooping at both ends; shade low on the right; lit
// clusters top-left; a trunk in WOOD that forks into two limbs under the canopy.
//
// ELLIPSES AND BARS, NOT A POLYGON. The first draft cut the crown as one 72-corner
// polygon, which setShapes fans into 70 sliver triangles — and every sliver edge came
// out a faint light hairline in the real render, so the crown looked scratched. An
// ellipse or a bar is one View with no seams at all.
//
// Local units about the trunk's foot, scaled by `s`, so the same drawing serves the
// tree outside and its small upside-down image on the paper.

/** The apple tree outside: where its trunk stands, and its size. */
export const APPLE_TREE = { x: 32, base: 494, s: 1 };

const CROWN = { cy: -58, rx: 37, ry: 25 };
/** Leaf clusters round the crown's edge: [x, y, w, h] about its centre, each bulging a few units past it. */
const CLUSTERS: readonly (readonly number[])[] = [
  [-27, 8, 26, 20], [-30, -6, 22, 24], [-20, -18, 26, 22], [-4, -23, 28, 20],
  [13, -20, 26, 22], [27, -9, 22, 24], [28, 7, 24, 20], [12, 13, 30, 16], [-10, 13, 30, 16],
];

/** The trunk and its two limbs, in WOOD: short, thick, forking into the crown. */
export function appleTrunkAt(x: number, y: number, s: number): SetPart[] {
  const X = (v: number) => x + v * s;
  const Y = (v: number) => y + v * s;
  return [
    // the foot, a little wider than the trunk
    oEll('face', X(0), Y(-1.5), 15 * s, 4.5 * s),
    // the trunk, then the two limbs leaning out of the fork
    oBar('face', X(0), Y(-2), X(0.5), Y(-22), 10 * s),
    oBar('face', X(0), Y(-21), X(-14), Y(-44), 7 * s),
    oBar('face', X(1), Y(-21), X(13), Y(-47), 7 * s),
    // a knot, and the bark's lit edge on the side toward the light
    oEll('dark', X(1.5), Y(-11), 2.6 * s, 3.6 * s),
    oBar('lit', X(-2.6), Y(-4), X(-2.4), Y(-18), 1.2 * s),
  ];
}

/** The crown, in LEAF: one mass with leaf clusters round its edge, shade low right, lit top-left. */
export function appleCrownAt(x: number, y: number, s: number): SetPart[] {
  const cx = x;
  const cy = y + CROWN.cy * s;
  return [
    oEll('mass', cx, cy, CROWN.rx * 2 * s, CROWN.ry * 2 * s),
    ...CLUSTERS.map(([dx, dy, w, h]) => oEll('mass', cx + dx * s, cy + dy * s, w * s, h * s)),
    // the side away from the lamp is the right and the foot, never a band across the
    // underside (a dark band under a dome is exactly what made it a mushroom)
    // the shade, as darker clusters dappled down the right and along the foot
    ...[[25, -4, 9, 6, 30], [30, 8, 8, 6, -20], [18, 14, 11, 5, -10], [4, 18, 11, 4, 0], [14, 3, 7, 5, 20]].map(([dx, dy, w, h, r]) =>
      oEll('dark', cx + dx * s, cy + dy * s, w * s, h * s, r)),
    // leaf clusters catching the light, top-left
    oEll('lit', cx - 16 * s, cy - 11 * s, 9 * s, 4 * s, -20),
    oEll('lit', cx - 3 * s, cy - 16 * s, 7 * s, 3 * s, -10),
    oEll('lit', cx - 25 * s, cy - 1 * s, 6 * s, 3 * s, -35),
  ];
}

/** The tree outside, in two layers: the trunk (WOOD) and then the crown (LEAF). */
export function appleTrunk(): SetPart[] {
  return appleTrunkAt(APPLE_TREE.x, APPLE_TREE.base, APPLE_TREE.s);
}
export function appleCrown(): SetPart[] {
  return appleCrownAt(APPLE_TREE.x, APPLE_TREE.base, APPLE_TREE.s);
}
/** The image on the paper: the same tree, small, its crown centred on (x, y). */
export function imageTrunk(x: number, y: number, s: number): SetPart[] {
  return appleTrunkAt(x, y - CROWN.cy * s, s);
}
export function imageCrown(x: number, y: number, s: number): SetPart[] {
  return appleCrownAt(x, y - CROWN.cy * s, s);
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
