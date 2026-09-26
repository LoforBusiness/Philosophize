import { oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF aesthetics-aesthetics-2 — A CAMPSITE AT NIGHT, WITH AN OUTDOOR SCREEN.
// The owner approved it on 2026-09-26, one of six second lessons redesigned after
// the first-lesson sets.
//
//   the screen   an outdoor cinema screen on two posts, top left; what it shows is
//                the scene's, because it changes.
//   the tent     an A-frame tent below the screen, its wall the shadow puppets land on;
//                its flap is the scene's, because it closes over the boy.
//   the fire     a ring of stones in the middle; the flames and sparks are the scene's.
//   the chairs   three folding camp chairs on the right, where the listeners sit.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The screen's picture area, and its two posts. */
export const SCREEN = { x: 16, y: 298, w: 184, h: 96 };
/** The tent: its peak, and its two feet. */
export const TENT = { peak: { x: 76, y: 414 }, left: 12, right: 140 };
/** The fire. */
export const FIRE = { cx: 208, top: 486 };
/** The three listeners' chairs, and their seat height. */
export const CHAIRS = [262, 312, 362];
export const SEAT = 474;

/** The screen's frame and posts. */
export function screen(): ObjPart[] {
  const { x, y, w, h } = SCREEN;
  return [
    oBar('mass', x + 10, y + h, x + 10, GROUND, 4),
    oBar('mass', x + w - 10, y + h, x + w - 10, GROUND, 4),
    oRect('mass', x + w / 2, y + h / 2, w + 8, h + 8, 0, 2),
  ];
}

/** The tent: two slopes of canvas, a ridge pole, pegs. */
export function tent(): ObjPart[] {
  const { peak, left, right } = TENT;
  return [
    oTri('mass', peak.x, (peak.y + GROUND) / 2, right - left, GROUND - peak.y, 'up'),
    oBar('dark', peak.x, peak.y + 2, peak.x, GROUND, 2),
    oBar('mass', peak.x, peak.y - 6, peak.x, peak.y + 4, 3),
    oBar('dark', left - 6, GROUND - 2, left, GROUND - 8, 2),
    oBar('dark', right + 6, GROUND - 2, right, GROUND - 8, 2),
  ];
}

/** The fire's ring of stones and two crossed logs. */
export function fireRing(): ObjPart[] {
  const { cx, top } = FIRE;
  return [
    oBar('dark', cx - 14, GROUND - 4, cx + 12, top + 4, 4),
    oBar('dark', cx + 14, GROUND - 4, cx - 12, top + 4, 4),
    ...[-18, -9, 0, 9, 18].map((dx) => oRect('mass', cx + dx, GROUND - 3, 9, 7, 0, 3.5)),
  ];
}

/** A folding camp chair: a sling seat, a back, crossed legs. */
export function chair(x: number): ObjPart[] {
  return [
    oBar('mass', x - 10, SEAT + 2, x + 10, GROUND, 2.5),
    oBar('mass', x + 10, SEAT + 2, x - 10, GROUND, 2.5),
    oRect('mass', x, SEAT + 1, 26, 5, 0, 2),
    oBar('mass', x + 12, SEAT, x + 16, SEAT - 30, 3),
    oRect('face', x + 15, SEAT - 16, 5, 22, 8, 1.5),
  ];
}
