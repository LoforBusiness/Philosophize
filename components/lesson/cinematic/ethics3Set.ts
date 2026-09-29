import { oEll, oRect, oBar, book as libBook, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF ethics-ethics-3 — A SIGNAL BOX. Redrawn 2026-09-26, the third lesson of
// the branch in reading order.
//
//   the board     the track diagram on the wall: the line coming in, the points, the
//                 main line on to the five, the branch up to the one. The runaway is a
//                 lamp on it, and it never reaches either of them.
//   the lever     a railway points lever in its ground frame at the far left, drawn
//                 against photographs of real ones (Wikimedia Commons, "Coombe No. 2
//                 Ground Frame", "Hermannstadt railway station ground frame"): a long
//                 black lever rising out of a toothed quadrant on a cast base, with a
//                 polished grip and the spring catch-rod running up beside it. He
//                 stands to its LEFT, facing right — so the lever, the diagram, the
//                 plates and everything the narration names are all in front of him;
//                 at 78 he used to face left at a lever frame with his back to all of
//                 it. Pulling it brings the grip towards him.
//   the table     beside them, with a balance at its near end and a box of weights at
//                 its far end (Mill). One weight is on the far pan from the start; he
//                 fetches five from the box from behind the table and sets them on the
//                 near pan from its end, so his head is never over the balance.
//
// The room runs lever · table · lectern · mirror from left to right, so every walk he
// takes goes past things or behind the table, and never through the lever frame.
//   the lectern   in the middle, with the rule book open on it (Kant).
//   the mirror    on the right-hand wall (Aristotle).
//   the lamps     two repeater lamps high on the left wall, for the true/false question.
//
// Everything he touches is measured against him: his shoulder is 49 above the floor
// and his hand reaches about 25 from it, so the lever's handle, the pans, the weight
// box and the book all sit at chest height, within 25 of where he stands.
//
// The balance's beam and pans, the points blade, the runaway's lamp, the points lever,
// the weights and the reflection are the scene's. STAGE UNITS, GROUND at 500. Zero
// imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The track diagram on the wall. */
export const BOARD = { x0: 100, x1: 300, top: 300, bottom: 360 };
/** The diagram's lines: the line in and the main line at LINE_Y, the branch at BRANCH_Y. */
export const LINE_Y = 344;
export const LINE_X0 = 114;
export const POINTS_X = 176;
export const MAIN_X1 = 288;
export const BRANCH_Y = 318;
/** Where the branch leaves the main line and where it levels out. */
export const BRANCH_UP = { x0: 182, x1: 208 };
/** The five on the main line, the one on the branch, and where the runaway stops. */
export const FIVE_X = [240, 249, 258, 267, 276];
export const ONE_X = 268;
export const TRAIN_STOP = 160;

/** The points lever: its pivot in the ground frame, and its length to the grip. */
export const LEVER_X = 70;
export const LEVER_LEN = 48;
/** The points lever's angle from upright, in degrees: at rest (leaning away from him), and pulled (towards him). */
export const LEVER_REST = 10;
export const LEVER_PULLED = -14;
/** Where he stands to work it: to its left, facing it. */
export const LEVER_STAND = 52;
/** Where the points lever's handle is at an angle. */
export function handleAt(deg: number): { x: number; y: number } {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: LEVER_X + LEVER_LEN * Math.sin(a), y: GROUND - LEVER_LEN * Math.cos(a) };
}

/** The table on the left, the balance on it, and the box the weights are kept in. */
export const TABLE = { x0: 100, x1: 180, top: 470 };
export const BALANCE = { x: 122, beamY: 440, arm: 17, string: 18 };
export const WEIGHT_BOX = { x: 164, top: 462 };
/** The lectern, and the rule book open on its top. */
export const LECTERN = { x0: 244, x1: 290, top: 458 };
export const BOOK = { x: 256, y: 450, w: 32, h: 17 };
/** The mirror on the right-hand wall, and the plate under it. */
export const MIRROR = { x0: 336, x1: 392, top: 380, bottom: 456 };
export const MIRROR_PLATE = { x0: 334, x1: 394, top: 460, bottom: 486 };
/** The two repeater lamps high on the left wall. */
export const LAMPS = [{ x: 30, y: 318 }, { x: 72, y: 318 }];
export const LAMP_R = 13;

/**
 * The ground frame the points lever stands in: a cast base on the floor, and the
 * toothed QUADRANT the lever swings through — an arc plate over the pivot with the
 * notches its catch drops into at each end of the throw. The lever itself is the
 * scene's, because it moves.
 */
export function leverFrame(): SetPart[] {
  const cx = LEVER_X;
  const py = GROUND - 5;
  const arc: number[] = [];
  const R = 13;
  for (let k = 0; k <= 8; k++) {
    const a = ((-38 + (76 * k) / 8) * Math.PI) / 180;
    arc.push(cx + R * Math.sin(a), py - R * Math.cos(a));
  }
  const notches: ObjPart[] = [-30, 22].map((d) => {
    const a = (d * Math.PI) / 180;
    return oEll('line', cx + (R - 2) * Math.sin(a), py - (R - 2) * Math.cos(a), 2.4, 2.4);
  });
  return [
    oPoly('mass', [cx - 5, py + 1, ...arc, cx + 5, py + 1]),
    oRect('mass', cx, GROUND - 3, 30, 6, 0, 1.5),
    oRect('face', cx, GROUND - 5.5, 16, 3, 0, 1),
    ...notches,
    oEll('lit', cx, py - 1, 3, 3),
  ];
}

/** The balance's foot, pillar and pivot, standing on the table. */
export function balanceStand(): ObjPart[] {
  const { x, beamY } = BALANCE;
  const { top } = TABLE;
  return [
    oRect('mass', x, top - 3, 20, 5, 0, 1.5),
    oBar('mass', x, top - 4, x, beamY + 1, 3),
    oEll('mass', x, beamY - 2, 6, 6),
  ];
}

/** The table: a top on two legs. Drawn over him, since he stands behind it. */
export function table(): ObjPart[] {
  const { x0, x1, top } = TABLE;
  return [
    oBar('mass', x0 + 5, top + 4, x0 + 5, GROUND, 4),
    oBar('mass', x1 - 5, top + 4, x1 - 5, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}

/** The box the weights are kept in, on the table beside the balance. */
export function weightBox(): ObjPart[] {
  const { x, top } = WEIGHT_BOX;
  return [
    oRect('mass', x, (top + TABLE.top) / 2, 18, TABLE.top - top, 0, 1.5),
    oRect('dark', x, top + 1.5, 14, 2.5, 0, 1),
  ];
}

/** The lectern: a post on a foot and a flat top. */
export function lectern(): ObjPart[] {
  const { x0, x1, top } = LECTERN;
  const cx = (x0 + x1) / 2;
  return [
    oRect('mass', cx, GROUND - 3, 36, 6, 0, 1.5),
    oBar('mass', cx, top + 4, cx, GROUND - 4, 6),
    oRect('mass', cx, top + 2, x1 - x0, 5, 0, 1.5),
  ];
}

/** The rule book, open, on the lectern. */
export function ruleBook(): ObjPart[] {
  return libBook(BOOK.x, BOOK.y, BOOK.w, BOOK.h);
}

/** The mirror's frame. */
export function mirror(): ObjPart[] {
  const { x0, x1, top, bottom } = MIRROR;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0, bottom - top, 0, 4)];
}

/** The two lamp housings, each on a bracket from the wall. */
export function lamps(): ObjPart[] {
  const parts: ObjPart[] = [];
  for (const l of LAMPS) {
    parts.push(oBar('mass', l.x, l.y - LAMP_R - 8, l.x, l.y - LAMP_R + 2, 3));
    parts.push(oEll('mass', l.x, l.y, 2 * LAMP_R + 4, 2 * LAMP_R + 4));
  }
  return parts;
}
