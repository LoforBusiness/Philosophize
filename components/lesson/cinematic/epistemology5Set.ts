import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

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
/**
 * AN ARMCHAIR, where he reads (owner: *"if the stick man is like waiting, he can pull
 * up a chair"* — set furniture first). A Windsor chair in side view, facing left to
 * the table: its seat at a quarter of his height, back legs rising into the back with
 * three spindles, the front legs splayed. He sits in it to read Aristotle.
 */
export const CHAIR = { x: 232, seat: 470 };
export function armchair(): SetPart[] {
  const { x, seat } = CHAIR;
  return [
    oBar('mass', x - 10, seat + 2, x - 13, 500, 2.4),
    oBar('mass', x + 10, seat + 2, x + 12, 500, 2.4),
    oBar('mass', x + 11, seat, x + 15, seat - 38, 2.6),
    oBar('mass', x + 15, seat - 38, x + 13, seat - 40, 3.4),
    oBar('mass', x + 12, seat - 4, x + 14, seat - 30, 1.4),
    oBar('mass', x - 12, seat - 12, x + 12, seat - 14, 2.2),
    oBar('mass', x - 12, seat - 12, x - 12, seat, 2),
    oRect('mass', x, seat + 1, 28, 4, 0, 1.5),
    oRect('face', x + 2, seat + 2.4, 24, 1.2),
  ];
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
/**
 * A TOWER MILL on the crest of the far hill (reference: the Hemingford Grey tower
 * mill and the Great Gransden post mill, Wikimedia Commons). The tower tapers from
 * 26 at the foot to 16 under the cap; the cap is a dome; a reefing stage rings the
 * tower a third of the way up; the sails turn on a hub at the FRONT of the cap —
 * the first drawing hung them from a point twelve units off to one side, so they
 * swung round empty air. The foot sits ON the hill's crest (the hill's top at x 332
 * is y 451), not buried inside it.
 */
export const MILL = { x: 332, top: 414, base: 452, hub: 411, sail: 34 };
/** Stars scattered over the sky, and the ones that join into a question mark. */
export const STARS = [
  [30, 306], [58, 380], [150, 300], [190, 350], [262, 312], [300, 360], [370, 306], [388, 350], [128, 404], [230, 404],
];
export const ASK = [[176, 322], [190, 310], [206, 314], [212, 330], [202, 344], [192, 354], [192, 368], [192, 384]];

/**
 * THE HILL, REDRAWN 2026-09-28 (owner: the second scene's objects *"seem to be more
 * cheap"*). It was two ovals. Now, as a moonlit landscape reads (reference: the
 * Saxtead Green post mill under the moon; the Mykonos mills at night, Commons): the
 * sky the darkest thing, the land lighter than it, in layers — the far downs rolling
 * across, the mill's own hill with its crest where the mill stands, and the near
 * field he stands in with a footpath through it that climbs away toward the mill.
 */
export function farDowns(): SetPart[] {
  return [oPoly('mass', [0, 470, 0, 440, 60, 430, 130, 440, 200, 432, 260, 446, 300, 452, 360, 450, 400, 444, 400, 470])];
}
export function millHill(): SetPart[] {
  return [
    oPoly('mass', [180, 480, 230, 468, 280, 456, 320, 451, 350, 452, 380, 458, 400, 462, 400, 480]),
    oPoly('face', [350, 452, 380, 458, 400, 462, 400, 480, 360, 480]),
  ];
}
export function nearField(): SetPart[] {
  return [oPoly('mass', [0, 516, 0, 472, 80, 466, 170, 470, 260, 478, 400, 476, 400, 516])];
}
/** The footpath he stands on, running the width of the field. */
export function footpath(): SetPart[] {
  return [
    oPoly('mass', [0, 490, 140, 488, 230, 492, 400, 490, 400, 516, 0, 516]),
  ];
}
export function tufts(): SetPart[] {
  return [
    oPoly('face', [30, 488, 34, 478, 38, 488]), oPoly('face', [36, 488, 41, 480, 44, 488]),
    oPoly('face', [360, 488, 364, 479, 368, 488]), oPoly('face', [120, 487, 123, 479, 127, 487]),
  ];
}
export function mill(): ObjPart[] {
  const { x, top, base } = MILL;
  const h = base - top;
  const y = top + h / 2;
  const narrow = 16;
  const flank = (26 - narrow) / 2;
  return [
    // the tower, tapering: a column with a sloped flank either side
    oRect('mass', x, y, narrow, h),
    oTri('mass', x - narrow / 2, y, flank * 2, h, 'up'),
    oTri('mass', x + narrow / 2, y, flank * 2, h, 'up'),
    // its shaded side, away from the moon on the left
    oRect('face', x + narrow / 4 + 1, y + 2, narrow / 2 - 2, h - 4),
    // the footing it stands on
    oRect('mass', x, base - 1.5, 30, 3, 0, 1),
    // the reefing stage, a third of the way up, where the miller sets the sails
    oRect('mass', x, top + h * 0.38, 32, 2.5, 0, 1),
    oBar('dark', x - 15, top + h * 0.38 + 1, x - 12, top + h * 0.38 + 7, 1),
    oBar('dark', x + 15, top + h * 0.38 + 1, x + 12, top + h * 0.38 + 7, 1),
    // the domed cap, and the finial on it
    oEll('mass', x, top - 1, 22, 12),
    oRect('face', x + 4, top + 1, 9, 3, 0, 1.5),
    oBar('mass', x, top - 7, x, top - 11, 1.4),
    // the door at the foot, arched
    oRect('dark', x - 2, base - 7, 7, 12, 0, 3.5),
  ];
}
