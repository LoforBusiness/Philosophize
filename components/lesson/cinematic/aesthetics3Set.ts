import { oEll, oRect, oBar, oTri, ship as libShip, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF aesthetics-aesthetics-3 — A MUSIC ROOM WITH A PUPPET THEATRE. Redrawn
// 2026-09-26, the third lesson of the branch in reading order.
//
//   the theatre   a puppet booth on the floor at the left, a tragic mask on its little
//                 stage, curtains, a stage lamp, and a pull-cord down its right side.
//   the painting  a storm at sea, hung on the wall.
//   the urn       an amphora on a marble console on the wall, a spigot low on its belly
//                 over a wall basin: it fills with pity and fear, and he lets them go.
//   the piano     an upright at the right, in three-quarter view.
//
// He works from two spots. At 130 he is at the theatre's cord; at 276 the spigot is
// on his left and the piano's keys on his right, both inside his reach (his shoulder is
// 49 above the floor, his hand reaches about 25). The painting and the urn are fixed
// to the wall, so walking between the two spots he passes in front of them, never
// through anything on the floor.
//
// The curtains, the lamp's light, the mask, the urn's water, the fallboard and the
// notes are the scene's. STAGE UNITS, GROUND at 500. Zero imports beyond ./objects
// and ./setShapes.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The puppet theatre: the booth, the opening, the pediment, and the cord. */
export const THEATRE = { x0: 10, x1: 110, top: 344, pedBottom: 362, open: { x0: 24, x1: 96, top: 372, bottom: 444 } };
export const CORD = { x: 114, top: 364, handle: 458 };
/** The mask on the little stage, and the stage lamp over it. */
export const MASK = { x: 60, y: 414 };
export const STAGE_LAMP = { x: 60, y: 378 };
/** The storm painting on the wall. */
export const PAINTING = { x0: 150, x1: 206, top: 340, bottom: 392 };
/** The amphora (top of its lip to its foot), its spigot, and the bowl on the floor under it. */
export const URN = { x: 234, top: 400, bottom: 454, r: 16 };
export const PEDESTAL = { top: 454, cap: 32 };
export const TAP = { x: 258, y: 442 };
export const BASIN = { x0: 247, x1: 269, top: 474 };
/** The upright piano (its front, and how far its side runs back), and its keyboard. */
export const PIANO = { x0: 286, x1: 372, top: 404, side: 14 };
export const KEYS = { x0: 291, x1: 367, y: 448 };
/** Where he stands: the theatre's cord, and between the urn's spigot and the keys. */
export const AT_CORD = 130;
export const AT_PIANO = 276;

/** The booth: a box on the floor with two posts and a pediment. */
export function theatre(): ObjPart[] {
  const { x0, x1, top, pedBottom, open } = THEATRE;
  const cx = (x0 + x1) / 2;
  return [
    oRect('mass', cx, (open.bottom + GROUND) / 2, x1 - x0, GROUND - open.bottom, 0, 2),
    oRect('mass', (x0 + open.x0) / 2, (pedBottom + open.bottom) / 2, open.x0 - x0, open.bottom - pedBottom, 0, 1),
    oRect('mass', (open.x1 + x1) / 2, (pedBottom + open.bottom) / 2, x1 - open.x1, open.bottom - pedBottom, 0, 1),
    oRect('mass', cx, (top + pedBottom) / 2, x1 - x0 + 6, pedBottom - top, 0, 2),
    oRect('face', cx, (open.bottom + GROUND) / 2 + 4, x1 - x0 - 14, GROUND - open.bottom - 18, 0, 2),
  ];
}

/** The cord down the booth's right side, with its tassel. */
export function cord(): ObjPart[] {
  return [oBar('line', CORD.x, CORD.top, CORD.x, CORD.handle - 3, 1.4), oEll('mass', CORD.x, CORD.handle, 6, 8)];
}

/** The painting's frame. */
export function frame(): ObjPart[] {
  const { x0, x1, top, bottom } = PAINTING;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0, bottom - top, 0, 2)];
}

/** The storm in the painting: a ship, laid out in the painting's own units. */
export function paintedShip(): ObjPart[] {
  const w = PAINTING.x1 - PAINTING.x0;
  return libShip(w * 0.52, 30, 26, 22);
}

// ── THE URN AND THE PIANO, REDRAWN 2026-09-28 against references ─────────────
//
// Owner: the objects *"seem to be more cheap"*. The urn read as a pink egg on a hook
// and the piano as a cabinet with a strip of keys painted on it.
//
//   the urn     an AMPHORA (references: a Geometric amphora and a red-figure stamnos
//               on Wikimedia Commons): a flared lip, a narrow neck, two handles from
//               the neck down to the shoulder, the belly widest a third of the way
//               down, tapering to a small foot ring. Terracotta with black-figure
//               bands on the neck and round the belly. It stands on a PEDESTAL (cap,
//               die, base) on the floor, not on a bracket; the tap is a spigot low on
//               the belly, and the water falls into a bowl on the floor beside it.
//   the piano   an UPRIGHT in three-quarter view (references: a Steinway K-132, and a
//               19th-century upright photographed from the side): the lid, the upper
//               panel, the fallboard's lip, the whole keyboard across the front
//               between its cheek blocks, the key slip, two legs on toe blocks under
//               the keybed, the lower panel set back with its pedals, and the case's
//               side running back on the right.

/**
 * The amphora, its handles and its spigot. Built from a few whole shapes — an oval
 * belly, the shoulder and the taper as four-cornered pieces, a neck, a lip, a foot —
 * rather than one many-cornered polygon: cut into triangles, a polygon of fourteen
 * pairs of corners leaves slivers whose seams showed as pale streaks across the pot.
 */
export function urn(): SetPart[] {
  const { x, top } = URN;
  return [
    // the handles, neck to shoulder, then the pot over them
    oBar('mass', x - 5, top + 8, x - 13, top + 9.5, 2.6),
    oBar('mass', x - 13, top + 9.5, x - 12, top + 19.5, 2.6),
    oBar('mass', x + 5, top + 8, x + 13, top + 9.5, 2.6),
    oBar('mass', x + 13, top + 9.5, x + 12, top + 19.5, 2.6),
    // lip, neck, shoulder, belly, the taper to the foot, and the foot ring
    oRect('mass', x, top + 2, 20, 4.5, 0, 1.5),
    oRect('mass', x, top + 10, 11, 10, 0, 0.5),
    oPoly('mass', [x - 5.4, top + 13, x + 5.4, top + 13, x + 13, top + 20, x - 13, top + 20]),
    oEll('mass', x, top + 30, 32, 30),
    oPoly('mass', [x - 12, top + 37, x + 12, top + 37, x + 4.5, top + 49.5, x - 4.5, top + 49.5]),
    oRect('mass', x, top + 51.5, 14, 5, 0, 1),
    // the belly's shaded right — the lamp is top left and never moves
    oEll('face', x + 11.5, top + 30, 7, 22),
    oPoly('face', [x + 8, top + 39, x + 11.5, top + 37.5, x + 4.5, top + 49.5, x + 2.5, top + 49.5]),
    // black-figure: the lip's edge, the neck panel, a band round the belly and a line under it
    oRect('line', x, top + 1.4, 19, 1.6),
    oRect('line', x, top + 11.5, 10.4, 5),
    oRect('line', x, top + 28.5, 30, 3.2),
    oRect('line', x, top + 36, 27, 1.3),
    // the spigot, low on the belly, its key standing up
    oBar('mass', x + 11, TAP.y, TAP.x + 1, TAP.y, 3),
    oRect('face', TAP.x + 1, TAP.y + 2.5, 3, 4, 0, 0.8),
    oRect('mass', TAP.x - 3, TAP.y - 3.2, 2, 4, 0, 0.5),
  ];
}

/**
 * The marble console the amphora stands on, fixed to the wall: a moulded shelf over a
 * scrolled corbel. ON THE WALL and not on the floor, because he walks between the
 * theatre and the piano past it — a pedestal on the floor would be walked through.
 */
export function pedestal(): SetPart[] {
  const { x } = URN;
  const top = PEDESTAL.top;
  const w = PEDESTAL.cap;
  return [
    // the corbel: wide under the shelf, narrowing into a scroll
    oPoly('mass', [x - 11, top + 5, x + 11, top + 5, x + 9, top + 9, x + 4, top + 14, x + 3, top + 22, x + 1, top + 28,
      x - 4, top + 28, x - 6, top + 20, x - 8, top + 12]),
    oEll('mass', x - 1.5, top + 26, 9, 9),
    oEll('face', x - 1.5, top + 26, 4, 4),
    oPoly('face', [x + 4, top + 7, x + 9, top + 7, x + 4, top + 14, x + 3, top + 22, x + 1, top + 24, x + 1, top + 14]),
    // the shelf, and its moulding
    oRect('mass', x, top + 2.5, w, 5, 0, 1),
    oRect('face', x, top + 6, w - 6, 2, 0, 0.5),
  ];
}

/** The basin under the spigot: a round bowl hung on the wall, on a small scrolled corbel. */
export function basin(): SetPart[] {
  const bx = (BASIN.x0 + BASIN.x1) / 2;
  const hw = (BASIN.x1 - BASIN.x0) / 2 + 1;
  const bowl: number[] = [];
  const shade: number[] = [];
  for (let k = 0; k <= 10; k++) {
    const a = (Math.PI * k) / 10;
    bowl.push(bx + hw * Math.cos(a), BASIN.top + 1 + 9 * Math.sin(a));
  }
  for (let k = 0; k <= 4; k++) {
    const a = (Math.PI * k) / 10;
    shade.push(bx + hw * Math.cos(a), BASIN.top + 1 + 9 * Math.sin(a));
  }
  shade.push(bx + 2, BASIN.top + 8, bx + hw - 5, BASIN.top + 2.5);
  return [
    oPoly('mass', [bx - 4, BASIN.top + 8, bx + 4, BASIN.top + 8, bx + 2, BASIN.top + 16, bx - 2, BASIN.top + 16]),
    oEll('mass', bx, BASIN.top + 16, 6, 6),
    oPoly('mass', bowl),
    oPoly('face', shade),
    oRect('mass', bx, BASIN.top + 0.5, 2 * hw + 2, 2.6, 0, 1),
  ];
}

/** The upright piano, in three-quarter view. The keys, the fallboard and the notes are the scene's. */
export function piano(): SetPart[] {
  const { x0, x1, top, side } = PIANO;
  const cx = (x0 + x1) / 2;
  const kTop = KEYS.y - 4;
  const kBot = KEYS.y + 4;
  return [
    // the case's side, running back on the right
    oPoly('face', [x1 - 1, top + 3, x1 + side, top - 2, x1 + side, GROUND - 4, x1 - 1, GROUND]),
    // the upper case and its lid
    oRect('mass', cx, (top + kTop) / 2 + 1, x1 - x0 - 4, kTop - top - 2, 0, 1),
    oRect('mass', cx + 1, top + 1, x1 - x0 + 4, 5, 0, 1.5),
    oRect('dark', cx, top + 17, x1 - x0 - 22, 17, 0, 1.5),
    // the music desk, and the fallboard's lip over the keys
    oRect('mass', cx, kTop - 9, x1 - x0 - 12, 3, 0, 1),
    oRect('face', cx, kTop - 3, x1 - x0 - 10, 6, 0, 1),
    // the lower case, set back: its panel and the pedals
    oRect('face', cx, (kBot + GROUND) / 2 + 2, x1 - x0 - 14, GROUND - kBot - 4, 0, 1),
    oRect('dark', cx, (kBot + GROUND) / 2 + 1, x1 - x0 - 32, GROUND - kBot - 16, 0, 1),
    oRect('lit', cx - 5, GROUND - 6, 6, 2, 0, 1),
    oRect('lit', cx + 5, GROUND - 6, 6, 2, 0, 1),
    // the key slip under the keys, and the cheek blocks at either end
    oRect('mass', cx, kBot + 2.5, x1 - x0 + 2, 5, 0, 1),
    oRect('mass', x0 + 2, (kTop + kBot) / 2 + 1.5, 7, kBot - kTop + 7, 0, 1),
    oRect('mass', x1 - 2, (kTop + kBot) / 2 + 1.5, 7, kBot - kTop + 7, 0, 1),
    // two legs on toe blocks under the keybed
    oBar('mass', x0 + 4, kBot + 6, x0 + 4, GROUND - 7, 4),
    oBar('mass', x1 - 4, kBot + 6, x1 - 4, GROUND - 7, 4),
    oRect('mass', x0 + 4, GROUND - 3.5, 10, 7, 0, 1),
    oRect('mass', x1 - 4, GROUND - 3.5, 10, 7, 0, 1),
  ];
}
