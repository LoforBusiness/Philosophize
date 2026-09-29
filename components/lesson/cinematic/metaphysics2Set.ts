import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF metaphysics-being-2 — A MAGICIAN'S THEATRE STAGE. The owner approved it
// on 2026-09-26, one of six second lessons redesigned after the first-lesson sets.
//
//   the proscenium  curtains either side, a valance across the top carrying the
//                   marquee (drawn by the scene, because it lights up).
//   the table       a draped conjuror's table; its cloth is the scene's, it lifts.
//   the easel       a showman's card stand at the front left.
//   the trapdoor    a hatch in the stage floor; the scene opens it.
//   the doors       two freestanding stage doors on casters, rolled in by the scene.
//                   Redrawn 2026-09-28 against a photograph of a panelled front door
//                   (Bredevoort, Markt): a CASING round the opening — two jambs and a
//                   head — standing on a sill, braced by a foot each side as a stage
//                   door flat is, with the leaf (the scene's, because it opens) hung
//                   on visible hinges, raised panels above and below a lock rail, and
//                   a handle on the latch side. The old drawing was a box on wheels.
//   the backdrop    a painted temple flat that descends from the flies.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The proscenium: the curtains' inner edges and the valance. */
export const PROS = { left: 26, right: 374, top: 290, valance: 314 };
/** The conjuror's table, and the top hat standing on it. */
export const TABLE = { cx: 152, top: 456, w: 60 };
export const HAT = { cx: 152, brim: 456, w: 30, h: 22 };
/** The easel's card board. */
export const EASEL = { x: 52, y: 330, w: 78, h: 64 };
/** The trapdoor in the floor, under the table: the whole act sinks through it. */
export const TRAP = { x0: 116, x1: 188 };
/**
 * The two stage doors, where they stand once rolled in: IT IS at the back, IT IS NOT
 * nearer the table, so that when he tries the second way he stands to its LEFT, facing
 * it — and IT IS, lit at the end, is in front of him too, past it.
 */
export const DOORS = [
  { x: 318, label: 'IT IS' },
  { x: 264, label: 'IT IS NOT' },
];
export const DOOR = { w: 36, h: 70 };
/** The painted backdrop's box, once lowered. */
export const BACKDROP = { x: 70, y: 318, w: 260, h: 112 };

/** One curtain: a heavy drape with its folds, and a tie-back. */
export function curtain(side: -1 | 1): ObjPart[] {
  const x0 = side < 0 ? 0 : PROS.right;
  const x1 = side < 0 ? PROS.left : 400;
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  return [
    oRect('mass', cx, (PROS.top + GROUND) / 2, w, GROUND - PROS.top, 0, 0),
    oBar('dark', x0 + w * 0.3, PROS.top + 4, x0 + w * 0.3, GROUND, 2),
    oBar('dark', x0 + w * 0.7, PROS.top + 4, x0 + w * 0.7, GROUND, 2),
    oRect('face', cx, 412, w + 4, 6, 0, 2),
  ];
}

/** The valance across the top, which the marquee sits on. */
export function valance(): ObjPart[] {
  return [
    oRect('mass', 200, (PROS.top + PROS.valance) / 2, 400, PROS.valance - PROS.top, 0, 0),
    ...[40, 100, 160, 220, 280, 340].map((x) => oTri('dark', x + 30, PROS.valance + 4, 60, 8, 'down')),
  ];
}

/** The conjuror's table: a round top on one turned leg and a foot. */
export function table(): ObjPart[] {
  const { cx, top, w } = TABLE;
  return [
    oBar('mass', cx, top + 4, cx, GROUND - 6, 6),
    oRect('mass', cx, GROUND - 3, 34, 6, 0, 3),
    oRect('mass', cx, top + 2, w, 5, 0, 2),
  ];
}

/** The top hat: a crown and a brim, with a band. */
export function hat(): ObjPart[] {
  const { cx, brim, w, h } = HAT;
  return [
    oRect('mass', cx, brim - h / 2 - 1, w - 8, h, 0, 2),
    oRect('mass', cx, brim - 2, w, 4, 0, 2),
    oRect('face', cx, brim - 8, w - 8, 4, 0, 0),
  ];
}

/** The easel: two front legs and a back leg under the card board. */
export function easel(): ObjPart[] {
  const { x, y, w, h } = EASEL;
  return [
    oBar('face', x + w / 2, y + 10, x + w / 2 + 6, GROUND, 3),
    oBar('mass', x + 14, y + h - 4, x + 6, GROUND, 4),
    oBar('mass', x + w - 14, y + h - 4, x + w - 6, GROUND, 4),
    oRect('mass', x + w / 2, y + h + 3, w + 6, 5, 0, 1),
  ];
}

/** A freestanding stage door, drawn at x (the left edge of its opening): the casing, sill, feet and casters. */
export function door(x: number): ObjPart[] {
  const { w, h } = DOOR;
  const top = GROUND - h - 6;
  const foot = GROUND - 4;
  return [
    // the braced feet a door flat stands on, one each side
    oBar('face', x - 4, top + h - 14, x - 9, foot, 3),
    oBar('face', x + w + 4, top + h - 14, x + w + 9, foot, 3),
    oRect('face', x + w / 2, foot + 0.5, w + 22, 3, 0, 1),
    // the casing: two jambs and a head with a cornice over it
    oRect('mass', x - 2.5, top + h / 2 - 2, 5, h + 6, 0, 1),
    oRect('mass', x + w + 2.5, top + h / 2 - 2, 5, h + 6, 0, 1),
    oRect('mass', x + w / 2, top - 3.5, w + 10, 7, 0, 1),
    oRect('face', x + w / 2, top - 8, w + 14, 3, 0, 1),
    // the sill under the opening
    oRect('face', x + w / 2, top + h + 1.5, w + 8, 3, 0, 0.5),
    // the casters it was rolled in on
    oEll('mass', x - 7, GROUND - 2, 5, 5),
    oEll('mass', x + w + 7, GROUND - 2, 5, 5),
  ];
}

/** The painted temple backdrop: a pediment on four columns over a step. */
export function temple(): ObjPart[] {
  const { x, y, w, h } = BACKDROP;
  const cx = x + w / 2;
  const colTop = y + 38;
  const cols = [0, 1, 2, 3].map((k) => {
    const px = x + 60 + k * ((w - 120) / 3);
    return oRect('lit', px, (colTop + y + h - 12) / 2, 12, y + h - 12 - colTop, 0, 1);
  });
  return [
    oRect('face', cx, y + h / 2, w, h, 0, 2),
    oTri('mass', cx, y + 20, w - 90, 30, 'up'),
    oRect('mass', cx, y + 36, w - 90, 5, 0, 0),
    ...cols,
    oRect('mass', cx, y + h - 8, w - 70, 6, 0, 0),
  ];
}

/**
 * A door's LEAF, in its own box (0,0)–(w,h), for the scene to hang in the opening and
 * swing: raised panels above and below a lock rail, a lever handle on the latch side
 * (the left, where he stands) and two hinges on the right, where it swings from.
 */
export function leaf(): ObjPart[] {
  const { w, h } = DOOR;
  const cx = w / 2;
  return [
    oRect('mass', cx, h / 2, w, h, 0, 1),
    // the upper panel: a sunk frame round a raised field
    oRect('face', cx, 19, w - 10, 26, 0, 1),
    oRect('mass', cx, 19, w - 16, 20, 0, 1),
    // the lower panel
    oRect('face', cx, 53, w - 10, 22, 0, 1),
    oRect('mass', cx, 53, w - 16, 16, 0, 1),
    // the handle: a rose and a lever, on the lock rail
    oEll('line', 6, 36.5, 4.5, 4.5),
    oBar('line', 6, 36.5, 12, 36.5, 2.4),
    oEll('lit', 5.4, 35.9, 1.4, 1.4),
    // the hinges it swings on
    oRect('line', w - 1, 9, 2.4, 7, 0, 0.6),
    oRect('line', w - 1, h - 9, 2.4, 7, 0, 0.6),
  ];
}
