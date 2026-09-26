import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF ethics-ethics-1 — A HALLWAY AT NIGHT, with a tall mirror. The owner
// approved it on 2026-09-25, one of five first lessons redesigned after the logic
// debate studio, each in a setting of its own.
//
//   the window     night glass with the moon in it, a sill and a pot on the sill.
//   the hall table under the window, carrying an open diary.
//   the mirror     a tall floor mirror on two feet; its glass is drawn by the scene,
//                  because the reflection lives inside it.
//   the bookcase   three shelves behind the reader, one book on each.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The window: its frame, and the night glass inside it. */
export const WIN = { x: 14, y: 296, w: 126, h: 66 };
export const GLASS = { x: WIN.x + 6, y: WIN.y + 6, w: WIN.w - 12, h: WIN.h - 12 };
export const SILL_Y = WIN.y + WIN.h;
/** The pot on the sill, and where its plant grows from. */
export const POT = { cx: 118, top: SILL_Y - 14, w: 20 };

/** The hall table under the window, and the diary lying open on it. */
export const TABLE = { x: 12, top: 440, w: 132 };
export const DIARY = { x: 18, y: 400, w: 120, h: 40 };

/** The mirror: frame, glass, and where the reflection stands. */
export const MIRROR = { x: 154, y: 298, w: 100, h: 190 };
export const MGLASS = { x: MIRROR.x + 8, y: MIRROR.y + 8, w: MIRROR.w - 16, h: MIRROR.h - 16 };

/** The bookcase behind the reader: sides, and three shelves. */
export const CASE = { x: 326, w: 68, top: 368 };
export const SHELF_Y = [404, 440, 476];

/** The window frame and sill. The glass is drawn by the scene: it is night in it. */
export function windowFrame(): ObjPart[] {
  const cx = WIN.x + WIN.w / 2;
  return [
    oRect('mass', cx, WIN.y + WIN.h / 2, WIN.w, WIN.h, 0, 2),
    oRect('mass', cx, SILL_Y + 3, WIN.w + 12, 6, 0, 1.5),
    oRect('dark', cx, SILL_Y + 6, WIN.w + 8, 2, 0, 1),
  ];
}

/** A clay pot on the sill. */
export function pot(): ObjPart[] {
  const { cx, top, w } = POT;
  return [
    oRect('mass', cx, top + 8, w - 4, 12, 0, 2),
    oRect('face', cx, top + 2, w, 5, 0, 1.5),
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
  ];
}
