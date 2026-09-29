import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly, type PolyPart } from './setShapes';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF political-political-3 — A COUNCIL ROOM. Redrawn 2026-09-26, the third
// lesson of the branch in reading order.
//
//   the doorway   at the left, open: the gunman is only ever his shadow, thrown in
//                 through it onto the wall.
//   the plinth    the crown on its cushion, and a hook on the plinth's side for the
//                 keys that are held in trust.
//   the charter   pinned on the wall, with a small shelf under it for the ink and the
//                 quill. He signs it, and later adds a line to it.
//   the frame     the Declaration of 1776, hung high on the wall.
//   the box       a glass ballot box on a stand at the right.
//
// He works from four spots, each measured against his reach (shoulder 49 above the
// floor, a hand's reach about 25): 144 at the plinth (far enough that the crown on its cushion clears his face), 160 at the charter, 232 under
// the frame and 310 at the ballot box. Nothing stands on the floor between them.
//
// The shadow, the crown, the keys, the signature, the slips and the plates are the
// scene's. STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The open doorway at the left. */
export const DOORWAY = { x0: 10, x1: 50, top: 404 };
/** Where the gunman's shadow falls on the wall, beside the doorway. */
export const SHADOW = { x: 76, top: 392 };
/** The plinth, its cushion, and the hook on its side. */
export const PLINTH = { x: 110, w: 24, top: 452 };
export const CUSHION = { x: 110, y: 446 };
export const HOOK = { x: 124, y: 466 };
/** The charter on the wall, and the shelf under it with the ink and the quill. */
export const CHARTER = { x0: 170, x1: 226, top: 390, bottom: 452 };
export const INK_SHELF = { x0: 168, x1: 194, top: 460 };
export const INKPOT = { x: 178, top: 452 };
/** Where he signs, and where a later line goes. */
export const SIGN = { x0: 180, x1: 206, y: 438 };
export const LINE2 = { x0: 180, x1: 214, y: 446 };
/** The framed Declaration, high on the wall. */
export const DECL = { x0: 250, x1: 296, top: 336, bottom: 386 };
/** The glass ballot box on its stand, and its slot. */
export const BOX = { x0: 322, x1: 358, top: 440, bottom: 470 };
export const SLOT = { x: 334, y: 440 };
/** Where he stands. */
export const AT_PLINTH = 144;
export const AT_CHARTER = 160;
export const AT_DECL = 232;
export const AT_BOX = 310;

/** The doorway: two jambs, a head, and the leaf swung open against the wall. */
export function doorway(): ObjPart[] {
  const { x0, x1, top } = DOORWAY;
  return [
    oBar('mass', x0, top, x0, GROUND, 4),
    oBar('mass', x1, top, x1, GROUND, 4),
    oBar('mass', x0 - 2, top, x1 + 2, top, 5),
    oRect('mass', x1 + 5, (top + GROUND) / 2 + 2, 7, GROUND - top - 4, 0, 1.5),
  ];
}

/** The plinth and its hook; the cushion on top. */
export function plinth(): ObjPart[] {
  const { x, w, top } = PLINTH;
  return [
    oRect('mass', x, (top + GROUND) / 2, w, GROUND - top, 0, 2),
    oRect('mass', x, top + 2, w + 6, 5, 0, 1.5),
    oRect('mass', x, GROUND - 3, w + 6, 6, 0, 1.5),
    oBar('line', x + w / 2, HOOK.y - 2, HOOK.x + 1, HOOK.y - 2, 1.6),
    oBar('line', HOOK.x + 1, HOOK.y - 2, HOOK.x + 1, HOOK.y + 1, 1.6),
  ];
}
export function cushion(): ObjPart[] {
  return [oEll('mass', CUSHION.x, CUSHION.y, 30, 10), oEll('dark', CUSHION.x, CUSHION.y + 1, 18, 3)];
}

/** The charter's sheet on the wall, and the shelf with the inkpot and the quill. */
export function charter(): ObjPart[] {
  const { x0, x1, top, bottom } = CHARTER;
  return [
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0 + 6, 5, 0, 2.5),
    oRect('mass', (x0 + x1) / 2, bottom - 1, x1 - x0 + 6, 5, 0, 2.5),
    oRect('mass', (INK_SHELF.x0 + INK_SHELF.x1) / 2, INK_SHELF.top + 2, INK_SHELF.x1 - INK_SHELF.x0, 4, 0, 1),
    oRect('mass', INKPOT.x, INKPOT.top + 4, 8, 8, 0, 2),
  ];
}

/** The Declaration's frame. */
export function declFrame(): ObjPart[] {
  const { x0, x1, top, bottom } = DECL;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0, bottom - top, 0, 2)];
}

/** The ballot box's stand and its lid; the glass is the scene's. */
export function ballotStand(): ObjPart[] {
  const { x0, x1, top, bottom } = BOX;
  const cx = (x0 + x1) / 2;
  return [
    oBar('mass', x0 + 4, bottom, x0 + 2, GROUND, 3),
    oBar('mass', x1 - 4, bottom, x1 - 2, GROUND, 3),
    oRect('mass', cx, bottom + 1.5, x1 - x0 + 4, 4, 0, 1),
    oRect('mass', cx, top - 1, x1 - x0 + 4, 4, 0, 1),
    oTri('mass', cx, top - 6, 12, 6, 'up'),
  ];
}

// ── the crown, and the gunman's shadow ───────────────────────────────────────
//
// THE CROWN. REFERENCE: the Imperial State Crown, photographed. It is not a ring of
// spikes: from the bottom up it is an ERMINE band (white, spotted black), a jewelled
// CIRCLET, crosses and fleurs standing on the circlet, a velvet CAP rising inside
// them, two ARCHES crossing over the cap, and an ORB with a CROSS where they meet.
// Each piece is drawn about the crown's own origin — the middle of the circlet — so
// it can sit on the cushion or ride between his hands.

/**
 * The crown's size on the stage. Drawn at 1 it is 28 wide and 32 tall — the size of
 * his chest, which is a prop, not a crown. A real crown is about a seventh of a man's
 * height, so it is struck at a little over half that.
 */
export const CROWN_K = 0.56;
const kp = (parts: ObjPart[], k: number): ObjPart[] => parts.map((p) => {
  if (p.k === 'bar') return { ...p, x1: p.x1 * k, y1: p.y1 * k, x2: p.x2 * k, y2: p.y2 * k, t: p.t * k };
  if (p.k === 'rect') return { ...p, x: p.x * k, y: p.y * k, w: p.w * k, h: p.h * k, rad: p.rad * k };
  return { ...p, x: p.x * k, y: p.y * k, w: p.w * k, h: p.h * k };
});

/** The velvet cap inside the arches: a dome, drawn in a dark tone behind the metal. */
export function crownCap(): ObjPart[] {
  return kp([oEll('face', 0, -7, 20, 17)], CROWN_K);
}
/** The metal of the crown: circlet, crosses and fleurs, arches, orb and cross. */
export function crownMetal(): ObjPart[] {
  return kp([
    // the arches, from each end of the circlet up to the orb, and the front one
    oBar('mass', -10.5, -2, -8, -11, 2.2),
    oBar('mass', -8, -11, -1, -15.5, 2.2),
    oBar('mass', 10.5, -2, 8, -11, 2.2),
    oBar('mass', 8, -11, 1, -15.5, 2.2),
    oBar('mass', 0, -3, 0, -15, 2.2),
    // a cross pattée at the front and a fleur each side, standing on the circlet
    oRect('mass', 0, -5.5, 2.4, 6, 0, 0.6),
    oRect('mass', 0, -5.5, 6, 2.4, 0, 0.6),
    oTri('mass', -7, -4.8, 4, 5, 'up'),
    oTri('mass', 7, -4.8, 4, 5, 'up'),
    // the circlet
    oRect('mass', 0, 0, 25, 5.5, 0, 1.5),
    // the orb and its cross
    oEll('mass', 0, -17.5, 5.5, 5.5),
    oBar('mass', 0, -20, 0, -24.5, 1.6),
    oBar('mass', -2.2, -22.6, 2.2, -22.6, 1.6),
    // jewels in the circlet
    oEll('dark', -7.5, 0, 3, 3),
    oEll('dark', 0, 0, 4, 3.4),
    oEll('dark', 7.5, 0, 3, 3),
    oEll('lit', -0.6, -0.6, 1.2, 1),
  ], CROWN_K);
}
/** The ermine band under the circlet: white fur, spotted black. */
export function crownErmine(): ObjPart[] {
  return kp([
    oRect('line', 0, 4.6, 28.4, 6.4, 0, 3.2),
    oRect('lit', 0, 4.6, 26.2, 4.2, 0, 2.1),
    oEll('line', -8.5, 4.6, 1.3, 1.8),
    oEll('line', -2.5, 4.9, 1.3, 1.8),
    oEll('line', 3.5, 4.4, 1.3, 1.8),
    oEll('line', 9.5, 4.8, 1.3, 1.8),
  ], CROWN_K);
}

/**
 * THE GUNMAN'S SHADOW, thrown onto the wall through the doorway. REFERENCE: film-noir
 * stills of a man's shadow on a wall — what makes it read as a threat, not a figure,
 * is the SILHOUETTE: a brimmed hat, a long coat flaring at the knee, legs set apart,
 * and one arm held out level with the pistol at the end of it. Solid, one flat tone;
 * the scene lays it on the wall at a fraction of ink.
 */
export function gunmanShadow(): (ObjPart | PolyPart)[] {
  const x = SHADOW.x;
  return [
    oPoly('line', [x - 6, 403, x - 5, 395, x - 1, 393, x + 1, 395.5, x + 3, 393, x + 7, 395, x + 8, 403]),
    oRect('line', x + 1, 404, 27, 3.2, 0, 1.6),
    oEll('line', x + 1, 412, 14, 15),
    oPoly('line', [x - 7, 419, x + 8, 419, x + 9, 432, x + 12, 462, x - 12, 462, x - 9, 432]),
    oBar('line', x - 4, 460, x - 12, 492, 7),
    oBar('line', x + 4, 460, x + 11, 492, 7),
    oBar('line', x - 7, 486, x - 17, 492, 5),
    oBar('line', x + 9, 488, x + 18, 492, 5),
    oBar('line', x + 3, 425, x + 27, 424, 6),
    oRect('line', x + 32, 422, 12, 5, 0, 1),
    oBar('line', x + 28, 424, x + 26, 431, 4.5),
    oBar('line', x - 6, 425, x - 10, 452, 5),
  ];
}
