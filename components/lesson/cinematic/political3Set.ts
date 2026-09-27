import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

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
// floor, a hand's reach about 25): 132 at the plinth, 160 at the charter, 232 under
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
export const AT_PLINTH = 132;
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
