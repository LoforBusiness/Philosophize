import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF epistemology-knowledge-2 — A SWIMMING POOL. The owner approved it on
// 2026-09-26, one of six second lessons redesigned after the first-lesson sets.
//
//   the pool       a three-quarter-view basin on the right: far coping, the water
//                  plane (drawn by the scene, because it moves), the near coping.
//   the board      a poolside noticeboard, HOW TO SWIM, with THE BOX under it that
//                  the narration keeps pointing at (both drawn by the scene).
//   the bench      a slatted bench under the board, where the books pile up.
//   the ladder     the pool ladder at the near corner.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The pool: its left edge, and the far and near copings of the water plane. */
export const POOL = { x0: 196, x1: 400, far: 436, near: 500 };
/** The noticeboard and the box underneath it. */
export const BOARD = { x: 10, y: 298, w: 184, h: 92 };
export const BOX = { x: 30, y: 396, w: 136, h: 30 };
/** The bench the books pile on. */
export const BENCH = { x: 16, w: 96, top: 474 };

/** The pool basin: the far coping, the tiled wall under it, the near coping. */
export function pool(): ObjPart[] {
  const { x0, x1, far, near } = POOL;
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  return [
    oRect('mass', cx, far - 3, w, 6, 0, 1),
    oRect('face', x0 + 3, (far + near) / 2, 6, near - far, 0, 1),
    oRect('mass', cx, near + 3, w, 6, 0, 1),
  ];
}

/** The pool ladder at the near left corner: two rails and three rungs. */
export function ladder(): ObjPart[] {
  const x = POOL.x0 + 18;
  return [
    oBar('mass', x, 470, x - 4, 426, 3),
    oBar('mass', x + 14, 470, x + 10, 426, 3),
    oBar('mass', x - 4, 426, x + 2, 420, 3),
    oBar('mass', x + 10, 426, x + 16, 420, 3),
    ...[438, 452, 466].map((y) => oBar('dark', x - 1, y, x + 13, y, 2)),
  ];
}

/** The board's two posts, under the board and the box. */
export function boardPosts(): ObjPart[] {
  const { x, y, w, h } = BOARD;
  return [
    oRect('mass', x + 14, (y + h + GROUND) / 2, 5, GROUND - y - h, 0, 1),
    oRect('mass', x + w - 14, (y + h + GROUND) / 2, 5, GROUND - y - h, 0, 1),
  ];
}

/** A slatted bench on two legs. */
export function bench(): ObjPart[] {
  const { x, w, top } = BENCH;
  const cx = x + w / 2;
  return [
    oBar('mass', x + 10, top + 4, x + 8, GROUND, 4),
    oBar('mass', x + w - 10, top + 4, x + w - 8, GROUND, 4),
    oRect('mass', cx, top + 2, w, 5, 0, 1.5),
    oRect('face', cx, top + 8, w - 8, 3, 0, 0),
  ];
}

/** A lifebuoy on a hook, on the board's right post. */
export function lifebuoy(): ObjPart[] {
  const x = BOARD.x + BOARD.w - 14;
  return [
    oEll('mass', x, 452, 22, 22),
    oEll('lit', x, 452, 10, 10),
  ];
}
