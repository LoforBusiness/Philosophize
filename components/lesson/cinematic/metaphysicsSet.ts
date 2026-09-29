import { oEll, oRect, oBar, type ObjPart } from './objects';
import { oPoly, type PolyPart } from './setShapes';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF metaphysics-being-1 — A PLANETARIUM AT NIGHT. The owner approved it on
// 2026-09-25, one of five first lessons redesigned after the logic debate studio,
// each in a setting of its own.
//
// Redrawn 2026-09-28 (*"the objects … seem to be more cheap … find reference for
// them"*), against pictures pulled with `node scripts/get-reference.mjs`:
//
//   the projector   a Zeiss star projector (Velvet, Planetarium Laupheim): a DUMBBELL —
//                   two star balls studded with lens ports at either end of a long
//                   tube, a hub in the middle — held up on a slender TRUSS over a
//                   squat box pedestal. The old drawing was one ball on legs, which
//                   is the older single-sphere machine at a size where it read as a
//                   lamp. The upper ball's crown lens is where the beam comes from.
//   the console     a planetarium operator's desk: a SLOPED control top carrying
//                   rows of keys and knobs, a raised back with a small screen, the
//                   top overhanging a kneehole on the operator's side, and a big
//                   MASTER DIMMER he pulls toward himself to take the sky down —
//                   a lever reads as a hand doing it at phone size, where a 5-unit
//                   dial under a fist did not (LESSON_RULES Y7).
//   the box         the open box the dominoes came out of.
//   the skyline     the horizon silhouette every planetarium dome carries at its
//                   base — trees, roofs and a little observatory — which is what
//                   turns a teal half-ellipse into a sky seen from somewhere.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects and ./setShapes, so the
// set can be drawn in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;
type Part = ObjPart | PolyPart;

/** The projector's pedestal x; the dumbbell's hub, its tilt (deg, right end up) and half-length. */
export const PROJ_X = 50;
const HUB = { x: 50, y: 426 };
const TILT = -17;
const ARM = 32;
const BALL_R = 11;
const ax = Math.cos((TILT * Math.PI) / 180);
const ay = Math.sin((TILT * Math.PI) / 180);
/** The two star balls' centres: left (low) and right (high). */
const BALL_L = { x: HUB.x - ARM * ax, y: HUB.y - ARM * ay };
const BALL_R_C = { x: HUB.x + ARM * ax, y: HUB.y + ARM * ay };
/** The lamp window on the upper ball's crown, where every beam comes from. */
export const LENS = { x: BALL_R_C.x + 2, y: BALL_R_C.y - BALL_R + 1 };

/** The operator's console: centre x, the top's upper face at its centre, half-width, tilt. */
export const CONSOLE = { cx: 298, top: 450, half: 24, tilt: 14 };
/** The master dimmer: its pivot on the near half of the top, and the lever's length. */
export const LEVER = { x: 311, len: 17 };

const slope = Math.tan((CONSOLE.tilt * Math.PI) / 180);
/** The y of the console's top at stage x. */
const surf = (x: number) => CONSOLE.top + (x - CONSOLE.cx) * slope;

/** One star ball: the ball, its equator seam and a ring of lens ports round it. */
function starBall(cx: number, cy: number, r: number): Part[] {
  const port = (a: number, d: number, k: number): Part[] => {
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    return [oEll('lit', px, py, k + 2, k + 2), oEll('line', px, py, k, k)];
  };
  const out: Part[] = [oEll('mass', cx, cy, r * 2, r * 2)];
  // the shaded lower-right half of the sphere (light from the top left)
  out.push(oEll('face', cx + 2.2, cy + 2.2, r * 1.5, r * 1.5));
  // ports round the rim and a few on the face, big and small
  for (let k = 0; k < 7; k += 1) out.push(...port(-Math.PI / 2 + (k * 2 * Math.PI) / 7, r - 2.6, k % 2 ? 2.6 : 3.4));
  out.push(...port(-2.3, 3.5, 3.2), ...port(0.6, 4.2, 2.6));
  return out;
}

/** The Zeiss star projector: two star balls on a tube, on a truss, on a box. */
export function projector(): Part[] {
  const x = PROJ_X;
  const deckY = GROUND - 30;
  const nx = -ay; // the tube's normal, for its ribs
  const ny = ax;
  const rib = (t: number, w: number): Part =>
    oBar('lit', HUB.x + ARM * ax * t + nx * w, HUB.y + ARM * ay * t + ny * w, HUB.x + ARM * ax * t - nx * w, HUB.y + ARM * ay * t - ny * w, 1.2);
  return [
    // the pedestal: a squat box on a plinth, its front panel and a lit maker's plate
    oRect('mass', x, GROUND - 2, 50, 4, 0, 1),
    oPoly('mass', [x - 21, GROUND - 3, x - 18, deckY, x + 18, deckY, x + 21, GROUND - 3]),
    oPoly('face', [x + 9, GROUND - 3, x + 9, deckY, x + 18, deckY, x + 21, GROUND - 3]),
    // (a polygon is cut into triangles, and the cut can show as a hairline of paper on
    // a big flat face — so the face is covered by a plain rectangle of the same role)
    oRect('mass', x - 4.5, (deckY + GROUND - 3) / 2, 25, GROUND - deckY - 5),
    oRect('dark', x - 5, GROUND - 16, 16, 9, 0, 1),
    oRect('lit', x - 5, GROUND - 16, 10, 2, 0, 0.8),
    // the slewing ring on top of the box
    oRect('face', x, deckY - 2, 30, 4, 0, 1.5),
    // the truss: two slender legs, braced, from the ring up to the hub
    oBar('face', x - 9, deckY - 3, HUB.x - 3, HUB.y + 6, 2.6),
    oBar('face', x + 9, deckY - 3, HUB.x + 3, HUB.y + 6, 2.6),
    oBar('line', x - 7, deckY - 10, x + 5, deckY - 24, 1.2),
    oBar('line', x + 7, deckY - 10, x - 5, deckY - 24, 1.2),
    // the tube between the balls, ribbed where its planet cages are
    oBar('face', BALL_L.x, BALL_L.y, BALL_R_C.x, BALL_R_C.y, 9),
    rib(-0.62, 4.4), rib(-0.5, 4.4), rib(-0.38, 4.4), rib(0.38, 4.4), rib(0.5, 4.4), rib(0.62, 4.4),
    // the hub the truss holds, with its bearing
    oEll('mass', HUB.x, HUB.y, 16, 16),
    oEll('dark', HUB.x, HUB.y + 1, 8, 8),
    // the star balls at either end
    ...starBall(BALL_L.x, BALL_L.y, BALL_R),
    ...starBall(BALL_R_C.x, BALL_R_C.y, BALL_R),
    // the lamp window on the upper ball's crown
    oRect('lit', LENS.x, LENS.y + 1, 7, 3.5, TILT, 1.4),
  ];
}

/** The operator's console, top sloping down toward him (he stands to its RIGHT). */
export function controlDesk(): Part[] {
  const { cx, half } = CONSOLE;
  const L = cx - half;
  const R = cx + half;
  const back = L + 3; // the cabinet's back
  const knee = R - 10; // the cabinet's near side; the top overhangs his kneehole past it
  const key = (x: number): Part => oRect('lit', x, surf(x) - 1.4, 4.2, 2.4, CONSOLE.tilt, 0.8);
  const knob = (x: number): Part[] => [
    oRect('face', x, surf(x) - 2.6, 4.6, 5.2, CONSOLE.tilt, 1.2),
    oEll('lit', x - 0.3, surf(x) - 4.8, 4, 2.2, CONSOLE.tilt),
  ];
  return [
    // the cabinet, its shaded back edge and a kick plinth
    oPoly('mass', [back, surf(back) + 4, knee, surf(knee) + 4, knee, GROUND - 4, back, GROUND - 4]),
    oRect('mass', (back + 7 + knee - 1) / 2, (surf(knee) + 5 + GROUND - 5) / 2, knee - back - 8, GROUND - 10 - surf(knee)),
    oPoly('face', [back, surf(back) + 4, back + 6, surf(back + 6) + 4, back + 6, GROUND - 4, back, GROUND - 4]),
    oRect('dark', (back + knee) / 2, GROUND - 2.5, knee - back - 2, 5, 0, 1),
    // the panel the level lights sit in (the lights are the scene's: they go out)
    oRect('dark', cx - 1, CONSOLE.top + 20, 26, 7, 0, 2),
    // the raised back with its screen: a little star map
    oRect('mass', L + 6, surf(L) - 9, 14, 21, 0, 1.5),
    oRect('line', L + 6, surf(L) - 10, 9.5, 13, 0, 1),
    oEll('lit', L + 4, surf(L) - 12, 1.4, 1.4), oEll('lit', L + 8, surf(L) - 9, 1.2, 1.2),
    oEll('lit', L + 5, surf(L) - 6, 1, 1), oEll('lit', L + 8.5, surf(L) - 13, 1, 1),
    // the sloped control top: a slab with a lip on the near edge
    oRect('mass', CONSOLE.cx, CONSOLE.top + 2.5, (R - L) / Math.cos((CONSOLE.tilt * Math.PI) / 180), 5, CONSOLE.tilt, 1),
    oRect('face', R - 1, surf(R - 1) + 2.5, 4.5, 5.5, CONSOLE.tilt, 1),
    // keys along the far half, knobs across the middle
    key(L + 17), key(L + 22), key(L + 27),
    ...knob(cx + 5), ...knob(cx + 9),
    // the master dimmer's slot boot (its lever is the scene's, because he pulls it)
    oEll('face', LEVER.x, surf(LEVER.x) - 0.5, 9, 4.5, CONSOLE.tilt),
    oEll('line', LEVER.x, surf(LEVER.x) - 0.8, 4, 2, CONSOLE.tilt),
  ];
}

/** The master dimmer's pivot on the console top. */
export function leverPivot(): { x: number; y: number } {
  return { x: LEVER.x, y: surf(LEVER.x) - 1.5 };
}

/**
 * The dimmer lever's angle from upright, in degrees, for how far the sky is taken
 * down (0 full sky … 1 none): it stands leaning toward the dome with the sky up and
 * comes back toward him as he pulls it down.
 */
export function leverDeg(erase: number): number {
  'worklet';
  return -28 + 92 * erase;
}

/** The open box the dominoes came out of, at `cx`. */
export function dominoBox(cx: number): Part[] {
  return [
    oRect('mass', cx, GROUND - 10, 30, 20, 0, 2),
    oPoly('face', [cx + 8, GROUND - 20, cx + 15, GROUND - 20, cx + 15, GROUND, cx + 8, GROUND]),
    // the lid, thrown open to the side
    oPoly('mass', [cx + 15, GROUND - 20, cx + 23, GROUND - 33, cx + 18, GROUND - 35, cx + 9, GROUND - 20]),
    oRect('dark', cx - 2, GROUND - 14, 20, 8, 0, 1.5),
    // two more dominoes still inside it, standing up out of the dark
    oRect('lit', cx - 5, GROUND - 19, 5, 10, -8, 1),
    oRect('lit', cx + 3, GROUND - 18, 5, 9, 6, 1),
  ];
}

/**
 * The horizon on the dome: the silhouette a planetarium projects round its base, so
 * the sky is seen from somewhere. Ink, like any skyline at night; it stays below the
 * slides (y ≥ 340) and the NEEDS A REASON tag is drawn over it.
 */
export function skyline(base: number): Part[] {
  const b = base + 2;
  return [
    oPoly('line', [
      12, b, 12, b - 10, 22, b - 14, 30, b - 11, 38, b - 18, 46, b - 13, 52, b - 15,
      // a roof and chimney
      60, b - 15, 60, b - 24, 72, b - 32, 84, b - 24, 84, b - 18, 88, b - 18, 88, b - 26, 91, b - 26, 91, b - 16,
      102, b - 13, 116, b - 10, 128, b - 12, 150, b - 9,
      // the little observatory: a drum and its dome
      170, b - 9, 170, b - 20, 172, b - 25, 177, b - 29, 183, b - 30, 189, b - 29, 194, b - 25, 196, b - 20, 196, b - 9,
      220, b - 8, 238, b - 11, 250, b - 9,
      // a stand of pines
      262, b - 9, 268, b - 26, 274, b - 12, 279, b - 30, 285, b - 12, 290, b - 22, 296, b - 10,
      318, b - 12, 338, b - 9, 352, b - 14, 366, b - 11, 380, b - 15, 388, b - 10, 388, b,
    ]),
    // the observatory's slit, open on the sky
    oBar('lit', 183, b - 28, 183, b - 21, 1.4),
    // two lit windows under the roof
    oRect('lit', 67, b - 18, 3, 3, 0, 0.5), oRect('lit', 77, b - 18, 3, 3, 0, 0.5),
  ];
}
