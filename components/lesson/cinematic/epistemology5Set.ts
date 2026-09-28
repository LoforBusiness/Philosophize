import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF epistemology-knowledge-5 — A STUDY AT NIGHT, AND THE HILL UNDER ITS MOON.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE STUDY    a bookcase with a library ladder leaning on it (the ladder of
//              knowledge, one rung for each kind), a side table with Aristotle's book,
//              and a window onto the night with the moon in it and a bird on the sill.
// THE HILL     the same night, out under it: the moon, the stars, and a windmill on
//              the far hill for Bacon.
//
// THE CHANGE goes into the moon in the window and comes out of the moon over the hill.
// The two moons are one drawing on one sky, the hill's twice the size of the window's,
// so the study is pushed in twice as deep and the two meet at the same size.
//
// He reaches about 25 from a shoulder 49 above the floor: the book at 198 from 224, the
// window's latch at 288 from 262. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the study ────────────────────────────────────────────────────────────────

export const CASE = { x0: 10, x1: 80, top: 352 };
/** The ladder leaning on the bookcase: its foot on the floor and its head at the top shelf. */
export const LADDER = { footL: 86, footR: 112, headL: 70, headR: 96, top: 362 };
/** The rungs, bottom to top, and the height of each. */
export const RUNG_Y = [480, 456, 432, 408, 384];
export const TABLE = { x0: 178, x1: 216, top: 466 };
export const BOOK = { x: 198, y: 461 };
export const WINDOW = { x0: 280, x1: 372, top: 364, sill: 444 };
export const LATCH = { x: 288, y: 434 };
/** The moon in the window, and where the change goes into it. */
export const MOON_WIN = { x: 344, y: 388, r: 7 };

export function bookcase(): ObjPart[] {
  const { x0, x1, top } = CASE;
  const parts: ObjPart[] = [oRect('mass', (x0 + x1) / 2, (top + GROUND) / 2, x1 - x0, GROUND - top, 0, 2)];
  const shelves = [382, 420, 458];
  for (const y of shelves) parts.push(oRect('dark', (x0 + x1) / 2, y + 16, x1 - x0 - 8, 30, 0, 1));
  const books = [[16, 5, 26], [22, 6, 22], [29, 5, 27], [36, 7, 24], [45, 5, 26], [52, 6, 21], [60, 5, 25], [67, 6, 23]];
  for (const y of shelves) {
    for (const [bx, w, h] of books) parts.push(oRect('lit', x0 + bx, y + 31 - h / 2, w, h, 0, 0.8));
  }
  return parts;
}
export function ladder(): ObjPart[] {
  const { footL, footR, headL, headR, top } = LADDER;
  const parts: ObjPart[] = [oBar('mass', footL, GROUND, headL, top, 3.5), oBar('mass', footR, GROUND, headR, top, 3.5)];
  for (const y of RUNG_Y) {
    const u = (GROUND - y) / (GROUND - top);
    parts.push(oBar('mass', footL + (headL - footL) * u, y, footR + (headR - footR) * u, y, 2.6));
  }
  return parts;
}
export function sideTable(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  return [
    oBar('mass', x0 + 5, top + 3, x0 + 3, GROUND, 3),
    oBar('mass', x1 - 5, top + 3, x1 - 3, GROUND, 3),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}
export function windowFrame(): ObjPart[] {
  const { x0, x1, top, sill } = WINDOW;
  return [
    oBar('mass', x0, top, x0, sill, 4),
    oBar('mass', x1, top, x1, sill, 4),
    oBar('mass', x0 - 2, top, x1 + 2, top, 5),
    oRect('mass', (x0 + x1) / 2, sill + 3, x1 - x0 + 12, 6, 0, 1.5),
  ];
}

// ── the hill ─────────────────────────────────────────────────────────────────

/** The moon over the hill, twice the window's, which is where the change comes out. */
export const MOON = { x: 96, y: 336, r: 14 };
export const MILL = { x: 332, top: 404, base: 478, hub: 404 };
/** Stars scattered over the sky, and the ones that join into a question mark. */
export const STARS = [
  [30, 306], [58, 380], [150, 300], [190, 350], [262, 312], [300, 360], [370, 306], [388, 350], [128, 404], [230, 404],
];
export const ASK = [[176, 322], [190, 310], [206, 314], [212, 330], [202, 344], [192, 354], [192, 368], [192, 384]];

export function hills(): ObjPart[] {
  return [
    oEll('mass', 330, 486, 240, 70),
    oEll('mass', 70, 494, 260, 60),
  ];
}
export function mill(): ObjPart[] {
  const { x, top, base } = MILL;
  return [
    oTri('mass', x, (top + base) / 2, 26, base - top, 'up'),
    oRect('mass', x, base - 2, 30, 6, 0, 1.5),
    oTri('mass', x, top - 4, 20, 10, 'up'),
    oRect('dark', x, base - 14, 6, 10, 0, 1),
  ];
}
