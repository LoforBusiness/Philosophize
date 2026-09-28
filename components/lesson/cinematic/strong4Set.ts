import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF logic-arguments-4 — A LECTURE ROOM, AND A GREEK BANQUET BY THE SEA.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE ROOM     a chalkboard split into DEDUCTIVE and INDUCTIVE, with a padlock that
//              shuts on the valid argument; a desk under it with a bowl of olives.
// THE BANQUET  a terrace over the sea at dusk: a long table set with plates of olives,
//              one place marked SOCRATES under a covered dish, four clay voting shards
//              on the ledge behind, three amphorae at the edge of the terrace.
//
// THE CHANGE goes into the olive he holds up and comes out of an olive on a plate. The
// two olives are one shape; the one in his hand is the larger, so the room is pushed in
// less deep and they meet at the same size.
//
// He reaches about 25 from a shoulder 49 above the floor: the bowl at 236 from 262, the
// dish at 300 from 280. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the room ─────────────────────────────────────────────────────────────────

export const BOARD = { x0: 50, x1: 350, top: 326, bottom: 430, mid: 200 };
export const DESK = { x0: 150, x1: 250, top: 468 };
export const BOWL = { x: 236, y: 462 };
export const LOCK = { x: 176, y: 404 };

export function board(): ObjPart[] {
  const { x0, x1, top, bottom } = BOARD;
  return [
    oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0 + 8, bottom - top + 8, 0, 2),
    oRect('mass', (x0 + x1) / 2, bottom + 6, x1 - x0 - 20, 4, 0, 1),
  ];
}
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  return [
    oBar('mass', x0 + 6, top + 4, x0 + 6, GROUND, 4),
    oBar('mass', x1 - 6, top + 4, x1 - 6, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}
export function bowl(): ObjPart[] {
  const { x, y } = BOWL;
  return [oEll('mass', x, y, 26, 12), oEll('dark', x, y - 3, 20, 4)];
}

// ── the banquet ──────────────────────────────────────────────────────────────

export const TABLE = { x0: 64, x1: 326, top: 470 };
/** The plates along the table; the fifth has no olives on it. */
export const PLATES = [86, 114, 142, 170, 198, 226, 254];
export const EMPTY_PLATE = 4;
/** Socrates' place, under a covered dish. */
export const DISH = { x: 300, y: 462 };
/** The olive the change comes out of: the middle olive on the first plate. */
export const OLIVE_PLATE = { x: PLATES[0], y: TABLE.top - 7, r: 2.5 };
export const LEDGE = { x0: 60, x1: 330, y: 420 };
export const SHARDS = [84, 132, 180, 228];
export const AMPHORAE = [20, 36, 52];

// ── REDRAWN 2026-09-28, against references ──────────────────────────────────
//
// Owner: the second scene's objects *"seem to be more cheap"*. The terrace was two
// plain posts and a bar, the table a board on sticks with ovals for plates, each
// amphora an egg on a peg. Now (references: the Parthenon's Doric order, the Elgin
// amphora in the British Museum, Attic cups on a foot, Wikimedia Commons):

/** Two Doric columns under an architrave, and a low parapet whose coping is the LEDGE. */
export function terrace(): SetPart[] {
  const column = (x: number): SetPart[] => {
    const top = 314;
    const p: SetPart[] = [
      oRect('mass', x, GROUND - 3, 30, 6, 0, 0.5),
      oPoly('mass', [x - 11, GROUND - 6, x - 9, top + 12, x + 9, top + 12, x + 11, GROUND - 6]),
      oPoly('mass', [x - 9, top + 12, x - 14, top + 6, x + 14, top + 6, x + 9, top + 12]),
      oRect('mass', x, top + 3, 30, 6, 0, 0.5),
      oPoly('face', [x + 3, top + 12, x + 9, top + 12, x + 11, GROUND - 6, x + 4, GROUND - 6]),
    ];
    for (const f of [-6, -2, 2]) p.push(oPoly('line', [x + f, top + 14, x + f + 0.7, top + 14, x + f * 1.15 + 0.7, GROUND - 8, x + f * 1.15, GROUND - 8]));
    return p;
  };
  const { x0, x1, y } = LEDGE;
  return [
    oRect('mass', (x0 + x1) / 2, (y + 474) / 2, x1 - x0 - 8, 474 - y, 0, 0.5),
    oRect('mass', (x0 + x1) / 2, y + 2, x1 - x0 + 6, 5, 0, 1),
    oRect('face', (x0 + x1) / 2, y + 6, x1 - x0 - 8, 2),
    oRect('face', (x0 + x1) / 2, 447, x1 - x0 - 8, 1.2),
    oRect('mass', 200, 304, 400, 12),
    oRect('face', 200, 309, 400, 2),
    ...column(22),
    ...column(378),
  ];
}
/** The low banquet table: its board, a cloth over the front, three turned legs, the cups. */
export function banquetTable(): SetPart[] {
  const { x0, x1, top } = TABLE;
  const parts: SetPart[] = [
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0 + 6, 5, 0, 1),
    ...[x0 + 10, (x0 + x1) / 2, x1 - 10].flatMap((lx) => [
      oRect('mass', lx, top + 14, 5, 12, 0, 1),
      oEll('mass', lx, top + 21, 7, 4),
      oRect('mass', lx, (top + 23 + GROUND) / 2, 4, GROUND - top - 23, 0, 1),
    ]),
    oPoly('lit', [x0 + 4, top + 4, x1 - 4, top + 4, x1 - 4, top + 10, x1 - 16, top + 12, x1 - 34, top + 10, (x0 + x1) / 2, top + 12, x0 + 34, top + 10, x0 + 16, top + 12, x0 + 4, top + 10]),
  ];
  // the cups: shallow bowls on a short foot
  for (const px of PLATES) parts.push(oPoly('mass', [px - 10, top - 5, px + 10, top - 5, px + 7, top - 1.5, px + 2, top - 0.5, px - 2, top - 0.5, px - 7, top - 1.5]), oRect('mass', px, top - 0.3, 6, 1.4, 0, 0.5));
  return parts;
}
/** One amphora standing at ax, drawn on its own so it can rock on its foot. */
export function amphora(ax: number): SetPart[] {
  const g = GROUND;
  return [
    oEll('mass', ax, g - 16, 16, 22),
    oPoly('mass', [ax - 5, g - 24, ax - 3, g - 33, ax + 3, g - 33, ax + 5, g - 24]),
    oRect('mass', ax, g - 34, 10, 3, 0, 1.5),
    oPoly('mass', [ax - 3, g - 6, ax + 3, g - 6, ax + 4, g, ax - 4, g]),
    oBar('mass', ax - 4, g - 31, ax - 8.5, g - 29, 1.8), oBar('mass', ax - 8.5, g - 29, ax - 7, g - 23, 1.8),
    oBar('mass', ax + 4, g - 31, ax + 8.5, g - 29, 1.8), oBar('mass', ax + 8.5, g - 29, ax + 7, g - 23, 1.8),
    oPoly('face', [ax + 2, g - 26, ax + 7, g - 21, ax + 8, g - 15, ax + 6, g - 9, ax + 2, g - 7]),
    oPoly('line', [ax - 7.4, g - 18, ax + 7.4, g - 18, ax + 7.4, g - 16.8, ax - 7.4, g - 16.8]),
    oPoly('line', [ax - 6.2, g - 11, ax + 6.2, g - 11, ax + 6.2, g - 10, ax - 6.2, g - 10]),
  ];
}
