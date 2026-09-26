import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-1 — A COURTROOM, with Plato's own jurors. The
// owner approved it on 2026-09-25, one of five first lessons redesigned after the
// logic debate studio, each in a setting of its own.
//
//   the easel     an evidence board on a three-legged easel: a wooden frame, the
//                 board face, a ledge tray along its foot the loose cards rest on.
//   the jury box  a panelled box with a top rail, the jurors standing behind it.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The evidence board: its frame, and the face the cards are pinned to. */
export const BOARD = { x: 22, y: 330, w: 184, h: 98 };
/** The tray along the board's foot. */
export const TRAY_Y = BOARD.y + BOARD.h + 4;

/** The jury box: left edge, right edge, rail top. */
export const JURY = { x0: 300, x1: 394, top: 452 };

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

/** The jury box: a panelled front with a moulded top rail. The jurors stand behind it. */
export function juryBox(): ObjPart[] {
  const { x0, x1, top } = JURY;
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const panels: ObjPart[] = [];
  const n = 3;
  for (let k = 0; k < n; k += 1) {
    const px = x0 + (w / n) * (k + 0.5);
    panels.push(oRect('dark', px, (top + 8 + GROUND) / 2 + 2, w / n - 12, GROUND - top - 22, 0, 2));
  }
  return [
    oRect('mass', cx, (top + GROUND) / 2 + 2, w, GROUND - top - 4, 0, 2),
    ...panels,
    // the top rail, standing proud of the front
    oRect('face', cx, top + 2, w + 8, 7, 0, 2),
    oEll('lit', x0 + 4, top + 1, 3, 3),
    oEll('lit', x1 - 4, top + 1, 3, 3),
  ];
}
