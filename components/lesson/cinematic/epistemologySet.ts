import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-1 — A COURTROOM, with Plato's own jurors. The
// owner approved it on 2026-09-25, one of five first lessons redesigned after the
// logic debate studio, each in a setting of its own.
//
//   the easel     an evidence board on a three-legged easel: a wooden frame, the
//                 board face, a ledge tray along its foot the loose cards rest on.
//   the jury box  a panelled front with a heavy top rail, chairs, the jurors seated in it.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The evidence board: its frame, and the face the cards are pinned to. */
export const BOARD = { x: 56, y: 330, w: 184, h: 98 };
/** The tray along the board's foot. */
export const TRAY_Y = BOARD.y + BOARD.h + 4;

/** The jury box: left edge, right edge, rail top. */
export const JURY = { x0: 296, x1: 398, top: 452 };

/** The easel: two splayed front legs, a back leg, and the tray. The board is drawn by the scene. */
export function easel(): ObjPart[] {
  const cx = BOARD.x + BOARD.w / 2;
  return [
    // the back leg, behind everything
    oBar('face', cx, BOARD.y + 10, cx + 10, GROUND, 3),
    // the frame round the board
    oRect('mass', cx, BOARD.y + BOARD.h / 2, BOARD.w + 10, BOARD.h + 10, 0, 3),
    // the two front legs, splayed
    oBar('mass', BOARD.x + 26, BOARD.y + BOARD.h, BOARD.x + 12, GROUND, 4),
    oBar('mass', BOARD.x + BOARD.w - 26, BOARD.y + BOARD.h, BOARD.x + BOARD.w - 12, GROUND, 4),
    // the ledge tray the loose cards stand on
    oRect('mass', cx, TRAY_Y + 3, BOARD.w + 14, 6, 0, 2),
    oRect('dark', cx, TRAY_Y + 5, BOARD.w + 8, 2, 0, 1),
  ];
}

// ── THE JURY BOX, redrawn 2026-09-28 against photographs of real ones ────────
//
// Owner: the old box "reads as three dots" — three standing jurors whose heads were
// all that cleared a plain slab. Every jury box photographed (Conway County and Boone
// County courthouses, Arkansas) has the same three things the slab lacked: a heavy
// flat TOP RAIL that overhangs the front, a front of RAISED PANELS in a frame, and a
// row of CHAIRS whose backs stand up over the rail, with the jurors SEATED in them —
// shoulders and forearms on the rail, not heads on a shelf.
//
// So the jurors sit (seated pose, a step up on the box's dais), each in front of a
// chair back that shows either side of him; the front is drawn after them and hides
// their legs. Two layers: `juryChairs()` behind the jurors, `juryFront()` in front.

/** Where the seated jurors are: x, the dais their feet rest on, their scale. */
export const JURORS = { xs: [316, 350, 384], dais: 480, k: 0.7 };
/** A seated juror's head centre: the dais less (seat 21 + spine and head 49) × k. */
export const JUROR_HEAD_Y = JURORS.dais - 70 * JURORS.k;

/**
 * The chair backs, behind the jurors. They face the court (left), so each chair is
 * seen in PROFILE: a high back raked a little behind him, a flat crest over his
 * shoulder, standing in the gap between one juror's head and the next — which is
 * what separates three heads into three people.
 */
export function juryChairs(): ObjPart[] {
  const out: ObjPart[] = [];
  const k = JURORS.k;
  for (const x of JURORS.xs) {
    const bx = x + 9 * k + 4;
    out.push(
      // the back, raked: from the seat (behind the front) up past his shoulder
      oBar('face', bx, JURY.top + 6, bx + 3, JUROR_HEAD_Y - 4, 4),
      // the top rail of the back, seen end-on: a short flat cap, not a knob (a knob beside a head reads as a second head)
      oRect('mass', bx + 3.5, JUROR_HEAD_Y - 5, 9, 4, -8, 1.5),
    );
  }
  return out;
}

/** The front of the box: an end post, a panelled front on a plinth, and the heavy top rail. */
export function juryFront(): ObjPart[] {
  const { x0, x1, top } = JURY;
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const panels: ObjPart[] = [];
  const n = 3;
  const pw = (w - 16) / n;
  for (let k = 0; k < n; k += 1) {
    const px = x0 + 8 + pw * (k + 0.5);
    const ph = GROUND - top - 22;
    const py = top + 9 + ph / 2;
    panels.push(
      // a raised panel in its frame: the moulding is shaded along the top and the
      // left, where the frame overhangs it, and lit along the bottom and the right
      // (the light in this app is always top-left)
      oRect('dark', px, py - ph / 2 + 1, pw - 8, 2, 0, 0.8),
      oRect('dark', px - (pw - 8) / 2 + 1, py, 2, ph, 0, 0.8),
      oRect('lit', px, py + ph / 2 - 1, pw - 8, 1.6, 0, 0.8),
      oRect('lit', px + (pw - 8) / 2 - 1, py, 1.6, ph, 0, 0.8),
    );
  }
  return [
    // the front, from the rail to the floor
    oRect('mass', cx, (top + GROUND) / 2 + 2, w, GROUND - top - 4, 0, 2),
    ...panels,
    // the plinth along the floor
    oRect('face', cx, GROUND - 4, w + 4, 8, 0, 1.5),
    // the end post, standing a little proud of the rail
    oRect('face', x0 + 3, (top + GROUND) / 2 - 2, 8, GROUND - top + 4, 0, 2),
    oRect('mass', x0 + 3, top - 5, 11, 5, 0, 2),
    // the top rail: a heavy flat board overhanging the front, lit along its top
    oRect('mass', cx + 2, top + 2, w + 12, 8, 0, 2.5),
    oRect('lit', cx + 2, top - 0.6, w + 6, 1.6, 0, 0.8),
    oRect('dark', cx + 2, top + 5, w + 8, 1.4, 0, 0.7),
  ];
}
