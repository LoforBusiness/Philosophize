import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF metaphysics-being-1 — A PLANETARIUM AT NIGHT. The owner approved it on
// 2026-09-25, one of five first lessons redesigned after the logic debate studio,
// each in a setting of its own.
//
// Drawn against references pulled with `npm run ref`:
//   the projector   a Zeiss star projector: a SPHERE studded with round lens
//                   ports and a band round its equator, on splayed legs over a
//                   squat octagonal drum (Deutsches Museum, Planetarium Laupheim).
//   the console     the operator's desk: a sloped top with a row of keys and one
//                   big dial, the top LOW on the operator's side (LESSON_RULES Y7).
//   the box         the open box the dominoes came out of.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects, so the set can be drawn
// in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The projector's centre x, and the sphere's centre and radius. */
export const PROJ_X = 44;
export const SPHERE_Y = 432;
export const SPHERE_R = 20;
/** The lamp window on the sphere's crown, where every beam comes from. */
export const LENS = { x: PROJ_X, y: SPHERE_Y - SPHERE_R + 2 };

/** The operator's console: centre x, the top's upper face at its centre, half-width, tilt. */
export const CONSOLE = { cx: 298, top: 452, half: 20, tilt: 9 };
/** The dial he turns, on the near half of the top. */
export const DIAL = { x: 306, r: 5.5 };

/** The Zeiss star projector. */
export function projector(): ObjPart[] {
  const x = PROJ_X;
  const cy = SPHERE_Y;
  const r = SPHERE_R;
  const lens = (dx: number, dy: number, d: number): ObjPart[] => [
    oEll('lit', x + dx, cy + dy, d + 2.4, d + 2.4),
    oEll('dark', x + dx, cy + dy, d, d),
  ];
  return [
    // the drum it stands on, and the plate on top of it
    oRect('mass', x, GROUND - 13, 50, 26, 0, 3),
    oRect('face', x + 12, GROUND - 13, 14, 26, 0, 2),
    oEll('face', x, GROUND - 26, 58, 8),
    // splayed legs up to the sphere
    oBar('face', x - 18, GROUND - 26, x - 10, cy + r - 3, 3),
    oBar('face', x + 18, GROUND - 26, x + 10, cy + r - 3, 3),
    oBar('face', x, GROUND - 26, x, cy + r, 3),
    // the sphere, its equator band, and its lens ports
    oEll('mass', x, cy, r * 2, r * 2),
    oRect('face', x, cy, r * 2 + 2, 6, 0, 2),
    ...lens(-9, -9, 5), ...lens(9, -9, 5), ...lens(0, -14, 4),
    ...lens(-11, 8, 5), ...lens(11, 8, 5), ...lens(0, 12, 4),
    // the lamp window on its crown
    oRect('lit', LENS.x, LENS.y, 8, 4, 0, 1.5),
  ];
}

/** The operator's console, top sloping down toward him (he stands to its RIGHT). */
export function controlDesk(): ObjPart[] {
  const { cx, top, half, tilt } = CONSOLE;
  const surf = (x: number) => top + (x - cx) * Math.tan((tilt * Math.PI) / 180);
  return [
    oRect('mass', cx, (top + 5 + GROUND) / 2, 30, GROUND - top - 5, 0, 2),
    oRect('dark', cx, (top + 5 + GROUND) / 2 + 2, 18, GROUND - top - 19, 0, 2),
    oRect('mass', cx, top + 3, half * 2, 6, tilt, 2),
    // a row of keys along the far half
    oRect('lit', cx - 14, surf(cx - 14) - 1.5, 5, 2.5, tilt, 1),
    oRect('lit', cx - 7, surf(cx - 7) - 1.5, 5, 2.5, tilt, 1),
    oRect('lit', cx, surf(cx) - 1.5, 5, 2.5, tilt, 1),
    // the dial's face (its pointer is drawn by the scene, because it turns)
    oEll('line', DIAL.x, surf(DIAL.x) - DIAL.r + 1, DIAL.r * 2 + 2, DIAL.r * 2 + 2),
    oEll('lit', DIAL.x, surf(DIAL.x) - DIAL.r + 1, DIAL.r * 2, DIAL.r * 2),
  ];
}

/** Where the dial's centre is, for the scene's pointer and his hand. */
export function dialCentre(): { x: number; y: number } {
  const { cx, top, tilt } = CONSOLE;
  const surf = top + (DIAL.x - cx) * Math.tan((tilt * Math.PI) / 180);
  return { x: DIAL.x, y: surf - DIAL.r + 1 };
}

/** The open box the dominoes came out of, at `cx`. */
export function dominoBox(cx: number): ObjPart[] {
  return [
    oRect('mass', cx, GROUND - 10, 30, 20, 0, 2),
    oRect('dark', cx, GROUND - 14, 24, 10, 0, 1.5),
    // two more dominoes still inside it, standing up out of the dark
    oRect('lit', cx - 5, GROUND - 19, 5, 10, -8, 1),
    oRect('lit', cx + 4, GROUND - 18, 5, 9, 6, 1),
  ];
}
