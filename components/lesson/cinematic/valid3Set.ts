import { oEll, oRect, oBar, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF logic-arguments-3 — AN ARGUMENT MACHINE IN A WORKSHOP. Redrawn
// 2026-09-26, the third lesson of the branch in reading order; its objects drawn
// again 2026-09-28 against references, because they read as boxes:
//
//   the machine   a crank calculating machine (reference: the Brunsviga and Thomas
//                 arithmometers — a heavy cast base on feet, a housing seen in
//                 three-quarter with its top plate and shaded end, rivets at the corners, the crank coming
//                 out of a side boss). A funnel hopper over each end — a cone with a
//                 rolled rim and a dark mouth — the slot on its top plate the
//                 conclusion rises out of, a gear window and two lamps on its front.
//                 He works it standing clear of it at its two ends, 132 and 290: the
//                 card box and the first hopper from the left, the second hopper and the
//                 crank from the right. Each is inside his reach from there (his
//                 shoulder is 49 above the floor and his hand reaches about 25), and he
//                 is always BEHIND its front, where the lamps and their plates are.
//   the card box  a little open-topped wooden card box (reference: a filing-card box)
//                 hung on the machine's left end, the premise cards standing up in it.
//                 It was an 8 × 16 rectangle, and read as nothing.
//   the board     over the machine, where the premises and the conclusion are written.
//   the stand     a small side table with the toaster on it.
//   the toaster   a two-slot pop-up toaster (reference: a chrome toaster on a black base):
//                 a body with rounded shoulders, the top with its two slots, the lever in
//                 its channel on the end, a browning dial, the base and its feet. Drawn in
//                 its own units about its handle point, so it rides his hand.
//   the rack      three rubber stamps on the wall, for the first question.
//
// The lamps, the gear, the cards in flight, the crank handle and the toaster's place are
// the scene's. STAGE UNITS, GROUND at 500. Zero imports beyond ./objects and ./setShapes.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The machine's front face, left to right, and the top plate's front edge. */
export const BODY = { x0: 150, x1: 262, top: 458 };
/** How far the top plate and the right-hand end recede, up and to the right. */
const DEPTH = 6;
export const HOPPERS = [158, 264];
export const HOPPER_MOUTH = 442;
export const CARD_BOX = { x: 146, y: 466 };
/** The crank's hub on the machine's right side, and its throw. */
export const CRANK = { x: 270, y: 474, r: 7 };
/** The slot on top the conclusion rises out of. */
export const OUT = { x: 212, y: 452 };
/** The lamps, and the gear window between them. */
export const LAMPS = { valid: 173, sound: 239, y: 466 };
export const GEAR = { x: 206, y: 474, r: 10 };
/** The board over the machine. */
export const BOARD = { x0: 60, x1: 330, top: 320, bottom: 384 };
/** The toaster's stand. */
export const STAND = { x: 342, top: 462 };
/** The stamp rack on the wall. */
export const RACK = { x0: 334, x1: 398, top: 338 };

/** The machine: feet, the cast base, the housing in three-quarter, rivets, the crank boss. */
export function machine(): SetPart[] {
  const { x0, x1, top } = BODY;
  const d = DEPTH;
  const foot = GROUND - 12;
  const parts: SetPart[] = [
    // the feet and the cast base under the housing
    oRect('face', x0 + 12, GROUND - 2.5, 16, 5, 0, 2),
    oRect('face', x1 - 8, GROUND - 2.5, 16, 5, 0, 2),
    // (a rectangle, not a polygon: a long, thin polygon is cut into long, thin
    // triangles, and the seam between two of them shows as a hairline across it)
    oRect('mass', (x0 - 5 + x1 + d + 5) / 2, (foot - 3 + GROUND - 5) / 2, x1 - x0 + d + 10, GROUND - 5 - foot + 3, 0, 2.5),
    // the housing: its top plate, its shaded right-hand end, its front
    oPoly('mass', [x0, top, x0 + d, top - d, x1 + d, top - d, x1, top]),
    oPoly('face', [x1, top, x1 + d, top - d, x1 + d, foot - d - 1, x1, foot - 3]),
    oRect('mass', (x0 + x1) / 2, (top + foot - 3) / 2, x1 - x0, foot - 3 - top, 0, 1.5),
    // the top plate catches the light
    // (a rectangle laid along it, for the reason the base gives)
    oRect('lit', (x0 + x1 + d) / 2, top - d / 2, x1 - x0 - d - 2, d - 1.8, 0, 0.6),
    // the base's lit edge and the shadow the housing drops on it
    oBar('lit', x0 - 3, foot - 1.6, x1 + d + 3, foot - 1.6, 1),
    oBar('dark', x0 + 1, foot - 4, x1 - 1, foot - 4, 1.4),
    // the slot in the top plate
    oRect('dark', OUT.x + 2, OUT.y + 1.5, 20, 2.6, 0, 1),
    // the crank's boss on the right-hand end
    oEll('mass', CRANK.x - 1, CRANK.y, 12, 13),
    oEll('dark', CRANK.x - 1, CRANK.y, 5, 5),
    // rivets at the housing's four corners
    oEll('dark', x0 + 4.5, top + 4.5, 2.4, 2.4),
    oEll('dark', x1 - 4.5, top + 4.5, 2.4, 2.4),
    oEll('dark', x0 + 4.5, foot - 8, 2.4, 2.4),
    oEll('dark', x1 - 4.5, foot - 8, 2.4, 2.4),
    // the arris between the front and the top plate, and the front and the end
    oBar('line', x0 + 0.6, top, x1, top, 1.1),
    oBar('line', x1, top, x1, foot - 3.4, 1.1),
  ];
  // the funnels: a cone from the rolled rim down into the top plate, the mouth dark
  for (const h of HOPPERS) {
    parts.push(oPoly('mass', [h - 13, HOPPER_MOUTH + 1, h + 13, HOPPER_MOUTH + 1, h + 4, HOPPER_MOUTH + 12, h - 4, HOPPER_MOUTH + 12]));
    parts.push(oPoly('face', [h + 5, HOPPER_MOUTH + 1, h + 13, HOPPER_MOUTH + 1, h + 4, HOPPER_MOUTH + 12, h + 1, HOPPER_MOUTH + 12]));
    parts.push(oRect('mass', h, HOPPER_MOUTH + 12.5, 10, 3, 0, 1));
    parts.push(oEll('mass', h, HOPPER_MOUTH, 30, 7));
    parts.push(oEll('dark', h, HOPPER_MOUTH - 0.3, 22, 3.6));
  }
  return parts;
}

/** The gear window's frame and the lamps' bezels. */
export function panel(): SetPart[] {
  return [
    oEll('dark', GEAR.x, GEAR.y, 2 * GEAR.r + 6, 2 * GEAR.r + 6),
    oEll('dark', LAMPS.valid, LAMPS.y, 16, 16),
    oEll('dark', LAMPS.sound, LAMPS.y, 16, 16),
  ];
}

/**
 * The card box hung on the machine's left end: the box, and apart from it the two
 * premise cards standing in it, which the scene hides once he has taken them out.
 */
export function cardBox(): { box: SetPart[]; cards: SetPart[] } {
  const { x, y } = CARD_BOX;
  const card = (cx: number, top: number, rot: number): SetPart[] => [
    oRect('line', cx, top + 4, 8.4, 9, rot, 0.8),
    oRect('lit', cx, top + 4, 6.4, 7, rot, 0.4),
  ];
  return {
    cards: [...card(x - 2.5, y - 13, -8), ...card(x + 1.5, y - 12, 6)],
    box: [
      // a bracket from the housing
      oRect('face', x + 5, y - 5, 4, 5, 0, 0.5),
      // the box: its front, its lip, the brass label holder
      oRect('mass', x, y + 1, 15, 16, 0, 1.5),
      oRect('face', x, y - 6.6, 16, 2.4, 0, 0.8),
      oRect('lit', x, y + 3, 7, 4, 0, 0.6),
      oRect('dark', x, y + 5, 5, 1.2, 0, 0.4),
    ],
  };
}

/** The side table the toaster stands on: a top with its edge, four legs, a stretcher. */
export function stand(): SetPart[] {
  const { x, top } = STAND;
  return [
    oBar('face', x - 9, top + 4, x - 10, GROUND, 2.6),
    oBar('face', x + 9, top + 4, x + 10, GROUND, 2.6),
    oBar('mass', x - 14, top + 4, x - 16, GROUND, 3.2),
    oBar('mass', x + 14, top + 4, x + 16, GROUND, 3.2),
    oBar('mass', x - 15, GROUND - 12, x + 15, GROUND - 12, 2.2),
    oRect('mass', x, top + 2, 38, 5, 0, 1.5),
    oBar('lit', x - 17, top + 0.6, x + 17, top + 0.6, 0.9),
  ];
}

/**
 * The toaster, in its own units about the point his hand holds it by: x −15…15, y
 * −14…5. It is the SAME drawing on the stand and in his hand, so it never changes when
 * it is picked up.
 */
export function toaster(): SetPart[] {
  return [
    // the black base and its two feet
    oRect('face', -9, 4.5, 5, 2.4, 0, 1),
    oRect('face', 9, 4.5, 5, 2.4, 0, 1),
    oRect('face', 0, 2, 32, 4, 0, 1.5),
    // the body, shoulders rounded, and its shaded end
    oRect('mass', -1, -6, 27, 15, 0, 5),
    oPoly('face', [11, -12.2, 15, -10.6, 15, 0.2, 11, 1.4]),
    // the top, catching the light, with its two slots
    oRect('lit', -1, -12.4, 20, 1.6, 0, 0.8),
    oRect('dark', -6.5, -12.3, 7, 1.4, 0, 0.6),
    oRect('dark', 4.5, -12.3, 7, 1.4, 0, 0.6),
    // the lever in its channel on the end, the browning dial, the vents
    oRect('dark', 13, -5, 1.6, 10, 0, 0.8),
    oRect('line', 13, -8, 4.4, 2.6, 0, 1),
    oEll('dark', -9, -2.5, 4.6, 4.6),
    oEll('lit', -9.6, -3.1, 1.4, 1.4),
    oBar('dark', -3, -3, -3, 0, 1),
    oBar('dark', 0, -3, 0, 0, 1),
    oBar('dark', 3, -3, 3, 0, 1),
    oBar('dark', 6, -3, 6, 0, 1),
  ];
}

/** The rack the stamps hang on. */
export function rack(): ObjPart[] {
  const { x0, x1, top } = RACK;
  return [oRect('mass', (x0 + x1) / 2, top, x1 - x0 + 6, 6, 0, 2)];
}
