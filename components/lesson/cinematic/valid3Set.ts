import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF logic-arguments-3 — AN ARGUMENT MACHINE IN A WORKSHOP. Redrawn
// 2026-09-26, the third lesson of the branch in reading order.
//
//   the machine   a waist-high box on feet: a hopper over each end, a slot on top the
//                 conclusion rises out of, a crank on its right side, a pocket of cards
//                 on its left, a gear window and two lamps on its front. He works it
//                 standing clear of it at its two ends, 132 and 290: the pocket and the
//                 first hopper from the left, the second hopper and the crank from the
//                 right. Each is inside his reach from there (his shoulder is 49 above
//                 the floor and his hand reaches about 25), and he never stands on the
//                 machine's front, where the lamps and their plates are.
//   the board     over the machine, where the premises and the conclusion are written.
//   the stand     a small side table with the toaster on it.
//   the rack      three rubber stamps on the wall, for the first question.
//
// The lamps, the gear, the cards, the crank handle and the toaster are the scene's.
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The machine's body, its two hopper mouths, the card box on its top. */
export const BODY = { x0: 150, x1: 262, top: 454 };
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

/** The machine: feet, body, the rim along its top, two funnels, the slot, the pocket of cards. */
export function machine(): ObjPart[] {
  const { x0, x1, top } = BODY;
  const cx = (x0 + x1) / 2;
  const parts: ObjPart[] = [
    oRect('mass', x0 + 10, GROUND - 3, 14, 6, 0, 1.5),
    oRect('mass', x1 - 10, GROUND - 3, 14, 6, 0, 1.5),
    oRect('mass', cx, (top + GROUND - 6) / 2, x1 - x0, GROUND - 6 - top, 0, 4),
    oRect('face', cx, top + 3, x1 - x0 + 6, 6, 0, 2),
    oRect('dark', OUT.x, OUT.y + 1, 18, 2.5, 0, 1),
    oRect('mass', CARD_BOX.x, CARD_BOX.y, 8, 16, 0, 1.5),
    oRect('lit', CARD_BOX.x - 1, CARD_BOX.y - 8, 5, 4, 0, 0.5),
  ];
  for (const h of HOPPERS) {
    parts.push(oTri('mass', h, HOPPER_MOUTH + 6, 26, 14, 'down'));
    parts.push(oRect('face', h, HOPPER_MOUTH, 28, 3, 0, 1));
  }
  // the crank's hub on the right side
  parts.push(oEll('mass', CRANK.x - 3, CRANK.y, 10, 10));
  return parts;
}

/** The gear window's frame, and the plates the lamps sit in. */
export function panel(): ObjPart[] {
  return [
    oEll('dark', GEAR.x, GEAR.y, 2 * GEAR.r + 6, 2 * GEAR.r + 6),
    oEll('dark', LAMPS.valid, LAMPS.y, 16, 16),
    oEll('dark', LAMPS.sound, LAMPS.y, 16, 16),
  ];
}

/** The side table the toaster stands on. */
export function stand(): ObjPart[] {
  const { x, top } = STAND;
  return [
    oBar('mass', x - 12, top + 3, x - 14, GROUND, 3),
    oBar('mass', x + 12, top + 3, x + 14, GROUND, 3),
    oRect('mass', x, top + 2, 36, 5, 0, 2),
  ];
}

/** The rack the stamps hang on. */
export function rack(): ObjPart[] {
  const { x0, x1, top } = RACK;
  return [oRect('mass', (x0 + x1) / 2, top, x1 - x0 + 6, 6, 0, 2)];
}
