import { oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF logic-arguments-2 — A STONEMASON'S YARD WITH A TOWER CRANE. The owner
// approved it on 2026-09-26, one of six second lessons redesigned after the
// first-lesson sets.
//
//   the crane    a lattice mast on the right, a jib across the top of the yard that
//                runs on out past the left edge — the stones are fetched from the
//                stockpile off to the LEFT, so every lift travels in front of the
//                mason, who stands by the mast facing the work; a cab at the head of
//                the mast. The trolley, cable and hook are the scene's, because they
//                move all lesson.
//   the stones   DRESSED ASHLAR (reference: dressed limestone walling, 2026-09-28): a
//                face with a chiselled margin, the lit top bed and the shaded end
//                seen in three-quarter, the arrises picked out. They were plates with
//                a border before, and read as cards. Drawn in each stone's own units,
//                so the scene can move one as a piece.
//   the pendant  the crane's control box, hanging on its own cable from the jib, clear
//                of the mason — it stood on the floor behind him and he walked into it.
//   the yard     a back fence, and a stack of spare blocks behind the mast.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects and ./setShapes.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The crane: the mast's x, the jib's underside, and the jib's reach (off the left edge). */
export const CRANE = { mast: 366, jib: 310, x0: -90, x1: 396 };
/**
 * The stones: two premises side by side, the conclusion resting across them. `d` is
 * the depth the top bed and the end show in three-quarter: a stone's FACE runs from
 * `d` below its top to its bottom, and a stone resting on another sits back by `d`,
 * its face's foot on the lower stone's front arris.
 */
export const STONE = { h: 34, baseW: 108, keyW: 116, d: 5 };
export const P1 = { cx: 110 };
export const P2 = { cx: 222 };
export const KEY = { cx: 166 };
export const BASE_TOP = GROUND - STONE.h;
export const KEY_TOP = BASE_TOP - STONE.h + STONE.d;
/** The pendant control box: its left edge, width, top and bottom, and where its cable hangs. */
export const PENDANT = { x0: 214, w: 70, top: 326, bottom: 404, cable: 249 };

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

/**
 * ONE DRESSED BLOCK, in its own units: x 0…w, y 0…h. The top bed and the right-hand
 * end recede up and to the right by `d`, so the face is (0, d)…(w − d, h). The margin
 * a mason draws round the face with a chisel runs 2.5 inside it, and the tooling —
 * short parallel strokes — sits only in the face's corners, where no word is written.
 */
export function ashlar(w: number): SetPart[] {
  const { h, d } = STONE;
  const f = w - d;
  const m = 2.5;
  const tool: SetPart[] = [];
  for (const [x, y, s] of [[m + 3, h - m - 3, 1], [f - m - 3, h - m - 3, -1]] as const) {
    for (let k = 0; k < 3; k++) tool.push(oBar('dark', x + s * k * 2.4, y, x + s * k * 2.4 + s * 1.6, y - 3, 0.8));
  }
  return [
    // the shaded end, the top bed and the face — one body, so one outline goes round it
    oPoly('face', [f, d, w, 0, w, h - d, f, h]),
    oPoly('mass', [0, d, d, 0, w, 0, f, d]),
    oRect('mass', f / 2, (h + d) / 2, f, h - d, 0, 1),
    // the top bed catches the light, which falls from the top left. A rectangle laid
    // along it rather than a polygon: a long, thin polygon is cut into long, thin
    // triangles, and the seam between them shows as a hairline across the bed.
    oRect('lit', w / 2, d / 2, w - d - 2.4, d - 1.8, 0, 0.6),
    // the chiselled margin round the face
    oBar('dark', m, d + m, f - m, d + m, 0.8),
    oBar('dark', m, h - m, f - m, h - m, 0.8),
    oBar('dark', m, d + m, m, h - m, 0.8),
    oBar('dark', f - m, d + m, f - m, h - m, 0.8),
    ...tool,
    // the arrises where the face meets the bed and the end
    oBar('line', 0.6, d, f, d, 1.2),
    oBar('line', f, d, f, h - 0.6, 1.2),
  ];
}

/** The pendant control box on its cable: a steel case with its shaded side and a bumper. */
export function pendant(): SetPart[] {
  const { x0, w, top, bottom, cable } = PENDANT;
  const x1 = x0 + w;
  return [
    oBar('line', cable, CRANE.jib + 2, cable, top - 3, 1.5),
    oPoly('face', [x1 - 5, top, x1, top - 3, x1, bottom - 4, x1 - 5, bottom]),
    oRect('mass', cable, top - 2, 14, 6, 0, 2),
    oRect('mass', x0 + (w - 5) / 2, (top + bottom) / 2, w - 5, bottom - top, 0, 4),
    oRect('dark', x0 + (w - 5) / 2, bottom - 4, w - 15, 3, 0, 1),
  ];
}

/** A stack of spare blocks behind the mast, off to the right: two courses, the top one set back. */
export function spares(): SetPart[] {
  const bw = 44;
  const lift = (parts: SetPart[], dx: number, dy: number): SetPart[] => parts.map((p) => {
    if (p.k === 'poly') return { ...p, pts: p.pts.map((v, i) => v + (i % 2 ? dy : dx)) };
    if (p.k === 'bar') return { ...p, x1: p.x1 + dx, x2: p.x2 + dx, y1: p.y1 + dy, y2: p.y2 + dy };
    return { ...p, x: (p as { x: number }).x + dx, y: (p as { y: number }).y + dy } as SetPart;
  });
  return [
    ...lift(ashlar(bw), 372, GROUND - STONE.h),
    ...lift(ashlar(bw), 380, GROUND - 2 * STONE.h + STONE.d),
  ];
}
