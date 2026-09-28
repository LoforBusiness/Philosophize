import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF political-political-4 — A FENCED GARDEN, AND A VILLAGE SCHOOLROOM.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE GARDEN   his own plot behind a picket fence with a gate (negative liberty: the
//              area where no one interferes), a soapbox, a garden table with a slice of
//              cake and a reading primer on it, and the village well outside the fence.
// THE SCHOOL   a schoolroom: a wall chart with a big letter A, desks, an open door, a
//              newspaper on a desk, a satchel on a hook, a bookshelf.
//
// THE CHANGE goes into the big A on the primer's page and comes out of the big A on the
// wall chart; the chart's A is twice the page's, so the garden is pushed in twice as deep.
//
// He reaches about 25 from a shoulder 49 above the floor: the cake at 230 and the primer
// at 214 on a table top at 466, from 252 and 236. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the garden ───────────────────────────────────────────────────────────────

export const FENCE = { x0: 34, x1: 300, top: 452, gate: 300 };
export const SOAPBOX = { x: 120, top: 484 };
export const TABLE = { x0: 196, x1: 240, top: 466 };
export const CAKE = { x: 230, y: 461 };
export const PRIMER = { x: 212, y: 462 };
export const WELL = { x: 354, top: 452 };

export function fence(): ObjPart[] {
  const parts: ObjPart[] = [
    oBar('mass', FENCE.x0, FENCE.top + 16, FENCE.x1, FENCE.top + 16, 3),
    oBar('mass', FENCE.x0, FENCE.top + 34, FENCE.x1, FENCE.top + 34, 3),
  ];
  for (let x = FENCE.x0; x <= FENCE.x1 - 4; x += 14) {
    parts.push(oRect('mass', x, (FENCE.top + GROUND) / 2 + 2, 7, GROUND - FENCE.top - 4, 0, 1));
    parts.push(oTri('mass', x, FENCE.top - 2, 7, 5, 'up'));
  }
  return parts;
}
export function soapbox(): ObjPart[] {
  const { x, top } = SOAPBOX;
  return [oRect('mass', x, (top + GROUND) / 2, 34, GROUND - top, 0, 1.5), oRect('dark', x, (top + GROUND) / 2, 26, 6, 0, 1)];
}
export function gardenTable(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  return [
    oBar('mass', x0 + 5, top + 3, x0 + 3, GROUND, 3),
    oBar('mass', x1 - 5, top + 3, x1 - 3, GROUND, 3),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}
/** The village well: a round stone wall, two posts and a little roof. */
export function well(): ObjPart[] {
  const { x, top } = WELL;
  return [
    oRect('mass', x, top + 32, 40, 32, 0, 4),
    oEll('dark', x, top + 17, 34, 6),
    oBar('mass', x - 16, top + 16, x - 16, top - 18, 3),
    oBar('mass', x + 16, top + 16, x + 16, top - 18, 3),
    oTri('mass', x, top - 24, 48, 14, 'up'),
    oBar('line', x, top - 16, x, top + 4, 1.2),
  ];
}

// ── the school ───────────────────────────────────────────────────────────────

/** The wall chart and the middle of its big A, where the change comes out. */
export const CHART = { x0: 272, x1: 344, top: 336, bottom: 404 };
export const CHART_A = { x: 300, y: 364, h: 40 };
/** The page's A, where the change goes in: half the chart's. */
export const PAGE_A_H = 14;
export const DOOR = { x0: 16, x1: 56, top: 396 };
export const DESKS = [104, 166];
export const SHELF = { x0: 356, x1: 396, top: 410 };
export const HOOK = { x: 76, y: 424 };

export function desks(): ObjPart[] {
  return DESKS.flatMap((x) => [
    oBar('mass', x - 14, 470, x - 14, GROUND, 3),
    oBar('mass', x + 14, 470, x + 14, GROUND, 3),
    oRect('mass', x, 466, 36, 6, -6, 1.5),
    oRect('mass', x + 26, 482, 16, 4, 0, 1),
    oBar('mass', x + 32, 484, x + 32, GROUND, 2.4),
  ]);
}
export function doorway(): ObjPart[] {
  const { x0, x1, top } = DOOR;
  return [
    oBar('mass', x0, top, x0, GROUND, 4),
    oBar('mass', x1, top, x1, GROUND, 4),
    oBar('mass', x0 - 2, top, x1 + 2, top, 5),
    oRect('mass', x1 + 6, (top + GROUND) / 2, 8, GROUND - top - 4, 0, 1.5),
  ];
}
export function bookshelf(): ObjPart[] {
  const { x0, x1, top } = SHELF;
  const parts: ObjPart[] = [oRect('mass', (x0 + x1) / 2, (top + GROUND) / 2, x1 - x0, GROUND - top, 0, 2)];
  for (const y of [436, 466]) parts.push(oRect('dark', (x0 + x1) / 2, y + 10, x1 - x0 - 8, 22, 0, 1));
  return parts;
}
