import { oRect, oBar, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

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
/** Tall enough (2026-09-28) that he fits inside its outline ducking in at the door. */
export const TENT = { peak: { x: 76, y: 404 }, left: 4, right: 148 };
/** The fire. */
export const FIRE = { cx: 208, top: 486 };
/** The three listeners' chairs, and their seat height. */
export const CHAIRS = [262, 312, 362];
export const SEAT = 474;

/**
 * The screen's frame and legs. REDRAWN 2026-09-28 (reference: an outdoor cinema screen
 * at King's Cross): a deep frame round the picture, on two legs each braced back to a
 * foot — a board on two sticks does not stand up outdoors.
 */
export function screen(): ObjPart[] {
  const { x, y, w, h } = SCREEN;
  const l = x + 12;
  const r = x + w - 12;
  return [
    oBar('mass', l, y + h, l, GROUND, 4),
    oBar('mass', r, y + h, r, GROUND, 4),
    oBar('mass', l, y + h + 40, l - 10, GROUND, 2.5),
    oBar('mass', r, y + h + 40, r - 10, GROUND, 2.5),
    oRect('mass', l, GROUND - 2, 16, 4, 0, 1),
    oRect('mass', r - 4, GROUND - 2, 14, 4, 0, 1),
    oRect('mass', x + w / 2, y + h / 2, w + 10, h + 10, 0, 2),
    oRect('face', x + w / 2, y + h + 4, w + 6, 3, 0, 1),
  ];
}

/**
 * The tent. REDRAWN 2026-09-28 (references: a Whymper tent's crossed poles, a
 * two-person ridge tent in the Caucasus): the poles CROSS above the ridge, the canvas's
 * right half is in shade (the lamp is top left), the door's flaps are tied back either
 * side of it, and a guy rope runs from the ridge to a peg on each side.
 */
export function tent(): SetPart[] {
  const { peak, left, right } = TENT;
  const dx = peak.x;
  const doorTop = peak.y + 30;
  return [
    // the guy ropes, ridge to pegs, drawn first so the canvas covers their ends
    oBar('line', peak.x - 4, peak.y + 4, left - 6, GROUND - 3, 1),
    oBar('line', peak.x + 4, peak.y + 4, right + 3, GROUND - 3, 1),
    oBar('dark', left - 6, GROUND - 1, left - 8, GROUND - 7, 2),
    oBar('dark', right + 3, GROUND - 1, right + 5, GROUND - 7, 2),
    // the crossed poles over the ridge
    oBar('mass', peak.x - 5, peak.y - 6, peak.x + 2, peak.y + 4, 2.6),
    oBar('mass', peak.x + 5, peak.y - 6, peak.x - 2, peak.y + 4, 2.6),
    // the canvas, its shaded right half, its seam down the middle
    oPoly('mass', [peak.x, peak.y, right, GROUND, left, GROUND]),
    oPoly('face', [peak.x, peak.y + 1, right - 1, GROUND, peak.x, GROUND]),
    // the door's flaps, rolled and tied back either side of the opening
    oPoly('dark', [dx - 16, doorTop + 10, dx - 27, GROUND - 6, dx - 18, GROUND]),
    oPoly('lit', [dx + 16, doorTop + 10, dx + 27, GROUND - 6, dx + 18, GROUND]),
    oBar('line', dx - 24, doorTop + 34, dx - 17, doorTop + 34, 1.4),
    oBar('line', dx + 17, doorTop + 34, dx + 24, doorTop + 34, 1.4),
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
