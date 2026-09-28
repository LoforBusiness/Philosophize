import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF metaphysics-being-4 — A STUDY AT NIGHT, AND THE ROAD IN ITS PAINTING.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, and the first
// with a scene change (portal.ts).
//
// THE STUDY    a desk with a small box on it and a bust of Parmenides; on the wall a
//              painting of a mountain crossroads at dusk.
// THE ROAD     that crossroads, for real: a signpost at the fork, the road on the left
//              climbing to a lit gate on a hill (IT IS), the road on the right going
//              down into fog (IT IS NOT), a waterfall on the right, an acorn on the
//              path, a lantern hanging from the signpost.
//
// THE PAINTING IS THE ROAD, drawn from the same parts at a quarter size, which is what
// makes the change seamless: pushed into four times deeper than the road is pulled out
// of, the two reach the same picture at the same size (portal.ts, the seamless case).
//
// He is 49 above the floor at the shoulder and reaches about 25: the box is at 128 on
// a desk top at 466, and he works it from 150. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the study ────────────────────────────────────────────────────────────────

export const DESK = { x0: 56, x1: 146, top: 466 };
export const BOX = { x: 126, w: 22, h: 14 };
export const BUST = { x: 76 };
/** The painting: its frame, and the canvas the road is drawn into at a quarter size. */
export const FRAME = { x0: 238, x1: 350, top: 340, bottom: 408 };
export const CANVAS = { x0: 244, top: 346, w: 100, h: 56.5 };
export const MINI = 0.25;
/** The road's band is [288, 514]; the canvas shows y from 288, so a road point maps here. */
export function onCanvas(x: number, y: number): { x: number; y: number } {
  'worklet';
  return { x: CANVAS.x0 + x * MINI, y: CANVAS.top + (y - 288) * MINI };
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
/** The box's body (the lid is the scene's, it opens). */
export function box(): ObjPart[] {
  const { x, w, h } = BOX;
  return [oRect('mass', x, DESK.top - h / 2, w, h, 0, 1.5), oRect('dark', x, DESK.top - h + 2, w - 5, 2.5, 0, 1)];
}
/** A small marble bust on a block. */
export function bust(): ObjPart[] {
  const x = BUST.x;
  const top = DESK.top;
  return [
    oRect('mass', x, top - 4, 16, 8, 0, 1.5),
    oEll('mass', x, top - 14, 18, 12),
    oEll('mass', x, top - 27, 12, 15),
    oRect('face', x + 2, top - 30, 5, 3, 0, 1),
  ];
}
export function frame(): ObjPart[] {
  const { x0, x1, top, bottom } = FRAME;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0, bottom - top, 0, 2)];
}

// ── the road ─────────────────────────────────────────────────────────────────

/** The signpost at the fork, and its two arms. */
export const POST = { x: 250, top: 384 };
export const ARM_IS = { x0: 212, x1: 250, y: 392 };
export const ARM_NOT = { x0: 250, x1: 306, y: 406 };
/** The lantern hanging under the right arm. */
export const LANTERN = { x: 292, y: 424 };
/** The gate on its hill, where the left road goes. */
export const GATE = { x: 64, y: 426 };
/** The waterfall at the right, and its pool. */
export const FALL = { x: 360, top: 436, bottom: 488 };
/** The acorn on the path, where the sapling grows. */
export const ACORN = { x: 186 };
/** Where the change goes into the painting and comes out of the road: the fork. */
export const FOCUS_ROAD = { x: 226, y: 430 };

/** Far mountains against the sky. */
export function mountains(): ObjPart[] {
  return [
    oTri('mass', 60, 408, 150, 64, 'up'),
    oTri('mass', 180, 414, 170, 52, 'up'),
    oTri('mass', 320, 404, 180, 72, 'up'),
  ];
}
/** The hill the gate stands on, and the gate: two posts and a lintel. */
export function hillGate(): ObjPart[] {
  const { x, y } = GATE;
  return [
    oEll('mass', x + 6, 452, 150, 48),
    oBar('mass', x - 10, y + 16, x - 10, y - 12, 4),
    oBar('mass', x + 10, y + 16, x + 10, y - 12, 4),
    oRect('mass', x, y - 14, 30, 5, 0, 1.5),
    oRect('mass', x, y - 19, 22, 4, 0, 1.5),
  ];
}
/** The signpost: its post and its two arms, each an arrow the way it points. */
export function signpost(): ObjPart[] {
  return [
    oBar('mass', POST.x, POST.top, POST.x, GROUND, 4),
    oRect('mass', (ARM_IS.x0 + ARM_IS.x1) / 2 + 3, ARM_IS.y, ARM_IS.x1 - ARM_IS.x0 - 6, 11, 0, 1.5),
    oTri('mass', ARM_IS.x0 + 3, ARM_IS.y, 8, 11, 'left'),
    oRect('mass', (ARM_NOT.x0 + ARM_NOT.x1) / 2 - 3, ARM_NOT.y, ARM_NOT.x1 - ARM_NOT.x0 - 6, 11, 0, 1.5),
    oTri('mass', ARM_NOT.x1 - 3, ARM_NOT.y, 8, 11, 'right'),
    oBar('line', LANTERN.x, ARM_NOT.y + 5, LANTERN.x, LANTERN.y - 7, 1.2),
  ];
}
/** The rock ledge the waterfall spills over, the rock under it, and its pool. */
export function fallRocks(): ObjPart[] {
  const { x, top, bottom } = FALL;
  return [
    oRect('mass', x + 12, (top + bottom) / 2 + 4, 40, bottom - top + 8, 0, 6),
    oRect('mass', x + 4, top - 2, 64, 12, 0, 5),
    oRect('face', x + 4, top + 5, 60, 4, 0, 2),
    oEll('dark', x - 4, bottom + 4, 50, 10),
  ];
}
