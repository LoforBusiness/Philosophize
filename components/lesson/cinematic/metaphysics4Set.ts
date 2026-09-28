import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

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

// ── REDRAWN 2026-09-28, against references ──────────────────────────────────
//
// Owner: *"the objects in the second scene … seem to be more cheap"* and *"if a stick
// man walks on a road, it needs to look like he's walking on a road."* The road was two
// white bars laid diagonally across the meadow and straight through his legs; the
// hill was an oval, the mountains three bare triangles, the waterfall a rounded box.
// Now (references: a fingerpost at an Irish crossroads, Bunbury's "How to lose your
// way", a five-bar field gate, a small fall over rock, all on Wikimedia Commons):
//
//   · a DIRT ROAD he stands in the middle of, running the width of the stage, with
//     two forks leaving it — the left one narrowing up the hill to the gate, the right
//     bending away into the fog — and wheel ruts along it;
//   · a far RANGE as one ridge, each peak shaded on its far side, snow on the high ones;
//   · the gate's HILL rising out of the meadow, and a proper FIVE-BAR GATE on its crown;
//   · a CLIFF of rock the water falls from, spreading as it drops, into a pool;
//   · a square SIGNPOST with plank arms cut to a point, left for IT IS, right for IT IS NOT.

/** The far range: one ridge, each peak's far side in shade, snow on the high ones. */
export function range(): SetPart[] {
  return [
    oPoly('mass', [0, 452, 0, 404, 36, 384, 62, 398, 104, 352, 138, 384, 170, 374, 214, 336, 262, 380, 300, 364, 334, 388, 372, 358, 400, 372, 400, 452]),
    oPoly('face', [104, 352, 138, 384, 124, 452, 104, 452]),
    oPoly('face', [214, 336, 262, 380, 250, 452, 214, 452]),
    oPoly('face', [372, 358, 400, 372, 400, 452, 380, 452]),
    oPoly('lit', [104, 352, 115, 364, 108, 362, 101, 368, 94, 363]),
    oPoly('lit', [214, 336, 227, 349, 219, 346, 211, 353, 203, 346]),
    oPoly('lit', [372, 358, 382, 366, 376, 365, 368, 370, 364, 366]),
  ];
}
/** The gate's hill, rising out of the meadow on the left, and the meadow itself. */
export function hill(): SetPart[] {
  return [
    oPoly('mass', [0, 474, 0, 436, 30, 424, 66, 418, 108, 426, 156, 450, 190, 474]),
    oPoly('face', [108, 426, 156, 450, 190, 474, 130, 474]),
  ];
}
export function meadow(): SetPart[] {
  return [oPoly('mass', [0, 516, 0, 470, 120, 466, 240, 466, 400, 460, 400, 516])];
}
/** The road across the foreground, and the left fork climbing to the gate. */
export function road(): SetPart[] {
  return [
    oPoly('mass', [0, 489, 120, 488, 160, 486, 214, 486, 262, 486, 330, 487, 400, 488, 400, 516, 0, 516]),
    oPoly('mass', [132, 488, 164, 487, 124, 460, 94, 438, 82, 427, 76, 429, 90, 442, 110, 464]),
  ];
}
/** The right fork, bending away into the fog — drawn on its own so it can dim. */
export function roadNot(): SetPart[] {
  return [oPoly('mass', [290, 487, 336, 487, 362, 476, 386, 468, 370, 466, 340, 474])];
}
/** The ruts the wheels have worn along the road. */
export function ruts(): SetPart[] {
  return [
    oPoly('face', [0, 495, 400, 494, 400, 496, 0, 497]),
    oPoly('face', [0, 505, 400, 504, 400, 506, 0, 507]),
  ];
}
/** A five-bar field gate on the hill's crown: two posts, five bars, the brace. */
export function gate(): SetPart[] {
  const { x } = GATE;
  return [
    oRect('mass', x - 10, 407, 4, 24, 0, 1), oRect('mass', x + 26, 407, 4, 24, 0, 1),
    oBar('mass', x - 8, 399, x + 24, 399, 2), oBar('mass', x - 8, 404, x + 24, 404, 2), oBar('mass', x - 8, 409, x + 24, 409, 2),
    oBar('mass', x - 8, 414, x + 24, 414, 2), oBar('mass', x - 6, 414, x + 22, 399, 1.8),
  ];
}
/** The cliff the water falls from, its shaded side, and a crack in it. */
export function cliff(): SetPart[] {
  return [
    oPoly('mass', [340, 490, 344, 434, 352, 422, 380, 416, 400, 418, 400, 494]),
    oPoly('face', [376, 418, 380, 416, 400, 418, 400, 494, 384, 494]),
    oPoly('dark', [346, 458, 352, 450, 355, 462]),
  ];
}
/** The fall itself, spreading as it drops, and the pool it lands in. */
export function water(): SetPart[] {
  const { x, top, bottom } = FALL;
  return [
    oPoly('lit', [x - 6, top, x + 6, top, x + 11, bottom, x - 11, bottom]),
    oEll('mass', x, bottom + 3, 54, 9),
  ];
}
/** The signpost: a square post, a plank arm left (IT IS) and a plank arm right (IT IS NOT). */
export function post(): SetPart[] {
  return [
    oRect('mass', POST.x, (POST.top + GROUND - 12) / 2, 7, GROUND - 12 - POST.top, 0, 1),
    oPoly('mass', [POST.x + 3, ARM_IS.y - 6, ARM_IS.x0 + 8, ARM_IS.y - 6, ARM_IS.x0, ARM_IS.y, ARM_IS.x0 + 8, ARM_IS.y + 6, POST.x + 3, ARM_IS.y + 6]),
    oPoly('mass', [POST.x - 3, ARM_NOT.y - 6, ARM_NOT.x1 - 8, ARM_NOT.y - 6, ARM_NOT.x1, ARM_NOT.y, ARM_NOT.x1 - 8, ARM_NOT.y + 6, POST.x - 3, ARM_NOT.y + 6]),
    oRect('face', POST.x + 2.3, (POST.top + GROUND - 12) / 2 + 2, 2.2, GROUND - 16 - POST.top),
    oBar('line', LANTERN.x, ARM_NOT.y + 6, LANTERN.x, LANTERN.y - 7, 1.2),
  ];
}
