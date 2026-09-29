import { oEll, oRect, oBar, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF ethics-ethics-1 — A HALLWAY AT NIGHT, with a tall mirror. The owner
// approved it on 2026-09-25, one of five first lessons redesigned after the logic
// debate studio, each in a setting of its own.
//
//   the bookcase   three shelves at the far end of the hall, one book on each.
//   the window     night glass with the moon in it, a sill and a pot on the sill.
//   the hall table under the window, carrying an open diary.
//   the mirror     a tall floor mirror on two feet; its glass is drawn by the scene,
//                  because the reflection lives inside it.
//
// RE-HUNG 2026-09-28, so that everything in the hall is IN FRONT of him. He stands
// at the right and faces the mirror all lesson; the bookcase used to stand behind
// him, so the whole where-does-conscience-come-from part of the lesson happened at
// his back. It is at the far end of the hall now, past the window, and the room
// reads left to right: bookcase · window over the table · mirror · him.
//
// The pot is a real terracotta flowerpot now (reference: a seedling in a pot,
// Wikimedia Commons): a tapered body under a rolled rim, with the soil showing.
//
// STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The bookcase at the far end of the hall: sides, and three shelves. */
export const CASE = { x: 6, w: 64, top: 368 };
export const SHELF_Y = [404, 440, 476];

/** The window: its frame, and the night glass inside it. */
export const WIN = { x: 82, y: 296, w: 126, h: 66 };
export const GLASS = { x: WIN.x + 6, y: WIN.y + 6, w: WIN.w - 12, h: WIN.h - 12 };
export const SILL_Y = WIN.y + WIN.h;
/** The pot on the sill, and where its plant grows from (the soil line). */
export const POT = { cx: WIN.x + 113, top: SILL_Y - 14, w: 20 };

/** The hall table under the window, and the diary lying open on it. */
export const TABLE = { x: 80, top: 440, w: 132 };
export const DIARY = { x: 86, y: 400, w: 120, h: 40 };

/** The mirror: frame, glass, and where the reflection stands. */
export const MIRROR = { x: 220, y: 298, w: 100, h: 190 };
export const MGLASS = { x: MIRROR.x + 8, y: MIRROR.y + 8, w: MIRROR.w - 16, h: MIRROR.h - 16 };

/** The window frame and sill. The glass is drawn by the scene: it is night in it. */
export function windowFrame(): ObjPart[] {
  const cx = WIN.x + WIN.w / 2;
  return [
    oRect('mass', cx, WIN.y + WIN.h / 2, WIN.w, WIN.h, 0, 2),
    oRect('mass', cx, SILL_Y + 3, WIN.w + 12, 6, 0, 1.5),
    oRect('dark', cx, SILL_Y + 6, WIN.w + 8, 2, 0, 1),
  ];
}

/**
 * A terracotta flowerpot on the sill: a body that narrows to its foot, a rolled rim
 * wider than the body, and dark soil just inside the rim. The plant grows out of the
 * soil at POT.top.
 */
export function pot(): SetPart[] {
  const { cx, top } = POT;
  const foot = SILL_Y;
  return [
    oPoly('mass', [cx - 9, top + 3, cx + 9, top + 3, cx + 6.5, foot, cx - 6.5, foot]),
    oRect('face', cx, top + 2, 23, 5, 0, 1.5),
    oRect('line', cx, top + 0.4, 17, 1.8, 0, 0.8),
    oBar('lit', cx - 5.2, top + 6.5, cx - 4.2, foot - 2, 1.4),
  ];
}

/** The hall table: a top with an apron, and two legs to the floor. */
export function hallTable(): ObjPart[] {
  const { x, top, w } = TABLE;
  const cx = x + w / 2;
  return [
    oBar('mass', x + 10, top + 8, x + 10, GROUND, 5),
    oBar('mass', x + w - 10, top + 8, x + w - 10, GROUND, 5),
    oRect('mass', cx, top + 3, w, 6, 0, 1.5),
    oRect('face', cx, top + 10, w - 12, 8, 0, 1),
  ];
}

/** The mirror's frame and its two splayed feet. */
export function mirrorFrame(): ObjPart[] {
  const { x, y, w, h } = MIRROR;
  const cx = x + w / 2;
  return [
    oBar('mass', x + 18, y + h - 6, x + 6, GROUND, 5),
    oBar('mass', x + w - 18, y + h - 6, x + w - 6, GROUND, 5),
    oRect('mass', cx, y + h / 2, w, h, 0, 6),
    oEll('lit', cx, y + 4, 10, 4),
  ];
}

/** The bookcase: a back, two sides, a top, three shelves. */
export function bookcase(): ObjPart[] {
  const { x, w, top } = CASE;
  const cx = x + w / 2;
  return [
    oRect('face', cx, (top + GROUND) / 2, w - 6, GROUND - top, 0, 1),
    oBar('mass', x + 2, top, x + 2, GROUND, 5),
    oBar('mass', x + w - 2, top, x + w - 2, GROUND, 5),
    oRect('mass', cx, top + 2, w + 6, 6, 0, 1.5),
    ...SHELF_Y.map((sy) => oRect('mass', cx, sy + 2, w, 4, 0, 1)),
    ...SHELF_Y.flatMap((sy, k) => spines(sy, k)),
  ];
}

/**
 * A row of book spines standing on one shelf, of mixed heights and thicknesses, so
 * the case reads as a bookcase before the three books the lesson names are turned
 * face-out in front of them.
 */
function spines(sy: number, k: number): ObjPart[] {
  const W = [6, 8, 5, 7, 6, 8, 5, 7];
  const H = [22, 26, 20, 24, 27, 21, 25, 23];
  const out: ObjPart[] = [];
  let x = CASE.x + 6;
  for (let i = 0; x + W[(i + k) % 8] <= CASE.x + CASE.w - 5; i++) {
    const w = W[(i + k * 3) % 8];
    const h = H[(i + k * 5) % 8];
    out.push(oRect(i % 2 ? 'face' : 'mass', x + w / 2, sy - h / 2, w, h, 0, 0.8));
    x += w + 0.6;
  }
  return out;
}
