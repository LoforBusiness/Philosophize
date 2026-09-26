import { oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF logic-arguments-2 — A STONEMASON'S YARD WITH A TOWER CRANE. The owner
// approved it on 2026-09-26, one of six second lessons redesigned after the
// first-lesson sets.
//
//   the crane    a lattice mast on the right, a jib across the top of the yard, a cab
//                at the head of the mast; the trolley, cable and hook are the scene's,
//                because they move all lesson.
//   the stones   drawn by the scene: two premises at the base, the conclusion on top.
//   the yard     a back fence and a stack of spare blocks.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The crane: the mast's x, the jib's underside, and the jib's reach. */
export const CRANE = { mast: 366, jib: 310, x0: 40, x1: 396 };
/** The stones: two premises side by side, the conclusion resting across them. */
export const STONE = { h: 34, baseW: 108, keyW: 116 };
export const P1 = { cx: 110 };
export const P2 = { cx: 222 };
export const KEY = { cx: 166 };
export const BASE_TOP = GROUND - STONE.h;
export const KEY_TOP = BASE_TOP - STONE.h - 2;

/** The tower crane: lattice mast, the jib with its bracing, the cab and counterweight. */
export function crane(): ObjPart[] {
  const { mast, jib, x0, x1 } = CRANE;
  const lattice: ObjPart[] = [];
  for (let y = jib + 14; y < GROUND - 10; y += 22) {
    lattice.push(oBar('dark', mast - 7, y, mast + 7, y + 22, 1.5));
    lattice.push(oBar('dark', mast + 7, y, mast - 7, y + 22, 1.5));
  }
  const brace: ObjPart[] = [];
  for (let x = x0 + 10; x < mast - 20; x += 26) {
    brace.push(oBar('dark', x, jib - 1, x + 13, jib - 9, 1.5));
    brace.push(oBar('dark', x + 13, jib - 9, x + 26, jib - 1, 1.5));
  }
  return [
    oRect('mass', mast - 8, (jib + GROUND) / 2, 3, GROUND - jib, 0, 0),
    oRect('mass', mast + 8, (jib + GROUND) / 2, 3, GROUND - jib, 0, 0),
    ...lattice,
    oRect('mass', (x0 + x1) / 2, jib - 1, x1 - x0, 4, 0, 1),
    oRect('mass', (x0 + x1) / 2, jib - 12, x1 - x0 - 30, 3, 0, 1),
    ...brace,
    oRect('face', mast + 4, jib + 16, 26, 20, 0, 3),
    oRect('lit', mast - 1, jib + 13, 9, 8, 0, 1),
    oRect('mass', x1 - 10, jib - 6, 16, 14, 0, 2),
    oTri('mass', mast, jib - 24, 16, 12, 'up'),
    oRect('mass', mast, GROUND - 4, 34, 8, 0, 1),
  ];
}

/** A stack of spare blocks by the back fence, left of the crane. */
export function spares(): ObjPart[] {
  return [
    oRect('mass', 318, GROUND - 9, 36, 18, 0, 2),
    oRect('face', 318, GROUND - 26, 28, 16, 0, 2),
  ];
}
