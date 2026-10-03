// ─────────────────────────────────────────────────────────────────────────────
// THE SET FOR history-foundations-5, "On Trial in Athens": a bedroom of today standing
// inside an Athenian law court, in WORLD units (the scene's camera frames it).
//
// REFERENCES (npm run ref; scratchpad/ref/h6*): the Acropolis from Philopappos hill —
// a pale limestone rock with a wall round its top and the Parthenon on it, the city
// low in front, Lycabettus and Hymettus beyond; the Parthenon's west front — eight
// Doric columns on three steps, a plain architrave, a frieze of triglyphs and
// metopes, a low pediment; the Doric order drawn — a tapering fluted shaft, an
// echinus and a square abacus, triglyphs over every column and between; the Stoa of
// Attalos — tall columns down a long hall, sun laid across the floor between them; a
// kleroterion and the Heliaia's walls. Athenian jurors sat on wooden benches.
//
// THE WORLD: the floor is y 470. His bedroom is a room x 108–412, ceiling 230, with
// its door in the right wall (330–470). The court's colonnade runs behind everything,
// Doric columns 122–470 tall under an entablature and a tiled roof (38–122), with a
// wide middle bay (680–840) that frames the Acropolis — rock 262–372, the Parthenon
// 186–252 on it. Juror stands rise in three tiers on the left (416–612) and the
// right (922–1200), their ledges at 446, 376 and 306. The presiding magistrate sits
// on a dais (708–812, top 350) at the back. Props: the water clock on its block at
// 888, the bronze ballot urn at 812 and the wooden one at 840.
//
// Zero imports beyond the two zero-import drawing modules, so it renders in Node.
// ─────────────────────────────────────────────────────────────────────────────
import { oPoly, type PolyPart } from './setShapes';
import { oRect, oEll, oBar, oTri, type NaturalKey, type ObjPart } from './objects';

type Role = 'mass' | 'face' | 'dark' | 'lit' | 'line';
export type Part = (ObjPart | PolyPart) & { nat?: NaturalKey };

const nat = <T extends ObjPart | PolyPart>(p: T, n: NaturalKey): Part => ({ ...p, nat: n }) as Part;
const poly = (n: NaturalKey, pts: number[], role: Role = 'mass') => nat(oPoly(role, pts), n);
const box = (n: NaturalKey, x0: number, y0: number, x1: number, y1: number, role: Role = 'mass') =>
  nat(oRect(role, (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0), n);
const ell = (n: NaturalKey, x: number, y: number, w: number, h: number, role: Role = 'mass') => nat(oEll(role, x, y, w, h), n);
const bar = (n: NaturalKey, x1: number, y1: number, x2: number, y2: number, t: number, role: Role = 'mass') =>
  nat(oBar(role, x1, y1, x2, y2, t), n);
const tri = (n: NaturalKey, x: number, y: number, w: number, h: number, dir: 'up' | 'down' | 'left' | 'right', role: Role = 'mass') =>
  nat(oTri(role, x, y, w, h, dir), n);

export const FLOOR = 470;

// ── the sky, the hills and the city beyond the colonnade ─────────────────────

export const SKY: Part[] = [
  box('clearSky', -300, -400, 1500, 300),
  box('skyGlow', -300, 260, 1500, 380),
  poly('clearSky', [-300, 296, 1500, 296, 1500, 262, -300, 262], 'face'),
  // fair-weather clouds
  ...[[210, -120, 1], [520, -60, 0.8], [880, -140, 1.1], [1210, -40, 0.9]].flatMap(([x, y, s]) => [
    ell('cloudWhite', x, y, 90 * s, 34 * s),
    ell('cloudWhite', x - 34 * s, y + 6 * s, 56 * s, 26 * s),
    ell('cloudWhite', x + 38 * s, y + 8 * s, 60 * s, 24 * s),
    ell('cloudWhite', x + 8 * s, y + 12 * s, 110 * s, 16 * s, 'face'),
  ]),
];

/** Hymettus along the back, and Lycabettus' cone to the right. */
export const HILLS: Part[] = [
  poly('atticHill', [-300, 340, -300, 300, 120, 286, 380, 296, 560, 280, 760, 292, 900, 276, 1500, 296, 1500, 340]),
  poly('atticHill', [960, 340, 1030, 300, 1062, 244, 1078, 236, 1094, 252, 1130, 296, 1190, 340]),
  poly('atticHill', [1062, 244, 1078, 236, 1094, 252, 1130, 296, 1190, 340, 1100, 340], 'face'),
  // the little chapel on Lycabettus' top
  box('whitewash', 1072, 228, 1084, 238),
];

/** A low house with a tiled roof: walls in stucco, the roof in terracotta. */
function house(x: number, w: number, h: number, base: number, roof = 'terracotta' as NaturalKey): Part[] {
  const top = base - h;
  return [
    box('stucco', x, top, x + w, base),
    box('stucco', x + w * 0.7, top, x + w, base, 'face'),
    poly(roof, [x - 3, top + 1, x + w / 2, top - h * 0.38, x + w + 3, top + 1]),
    box('roofBoard', x + w * 0.2, top + h * 0.35, x + w * 0.2 + 4, top + h * 0.35 + 6, 'dark'),
    box('roofBoard', x + w * 0.6, top + h * 0.35, x + w * 0.6 + 4, top + h * 0.35 + 6, 'dark'),
  ];
}

/** An Italian cypress: a tall dark flame on a short trunk. */
export function cypress(x: number, base: number, h: number): Part[] {
  const w = h * 0.24;
  return [
    bar('bark', x, base, x, base - h * 0.12, w * 0.18),
    poly('cypressGreen', [x, base - h, x + w * 0.42, base - h * 0.62, x + w * 0.5, base - h * 0.3,
      x + w * 0.3, base - h * 0.08, x - w * 0.3, base - h * 0.08, x - w * 0.5, base - h * 0.3, x - w * 0.42, base - h * 0.62]),
    poly('cypressGreen', [x, base - h, x + w * 0.42, base - h * 0.62, x + w * 0.5, base - h * 0.3,
      x + w * 0.3, base - h * 0.08, x + w * 0.05, base - h * 0.08, x + w * 0.1, base - h * 0.6], 'face'),
  ];
}

/** An olive: a gnarled, forked trunk under one wide silvery canopy with a ragged edge. */
export function olive(x: number, base: number, h: number): Part[] {
  const w = h * 1.3;
  const cy = base - h * 0.62;
  return [
    bar('bark', x - w * 0.06, base, x - w * 0.02, base - h * 0.38, h * 0.1),
    bar('bark', x - w * 0.02, base - h * 0.36, x - w * 0.16, base - h * 0.58, h * 0.07),
    bar('bark', x - w * 0.02, base - h * 0.36, x + w * 0.14, base - h * 0.56, h * 0.07),
    ell('oliveLeaf', x, cy, w, h * 0.62),
    ell('oliveLeaf', x - w * 0.34, cy + h * 0.06, w * 0.5, h * 0.44),
    ell('oliveLeaf', x + w * 0.34, cy + h * 0.04, w * 0.5, h * 0.46),
    ell('oliveLeaf', x + w * 0.12, cy + h * 0.14, w * 0.7, h * 0.3, 'face'),
  ];
}

/** The city between the hall and the rock: houses, olives and cypresses. */
export const CITY: Part[] = [
  ...house(410, 34, 22, 362), ...house(452, 28, 18, 368), ...house(500, 40, 26, 356),
  ...olive(560, 364, 26), ...house(590, 30, 20, 366), ...cypress(630, 364, 44),
  ...house(870, 36, 22, 360), ...cypress(912, 360, 48), ...house(930, 30, 18, 368),
  ...olive(986, 364, 28), ...house(1010, 42, 26, 358), ...house(1062, 30, 20, 366),
  ...cypress(1104, 362, 40), ...house(1120, 38, 24, 360), ...olive(1176, 366, 24),
];

/** The Acropolis: the rock, its wall, the Parthenon's west front, and the Erechtheion. */
export const ACROPOLIS: Part[] = [
  poly('atticRock', [596, 376, 632, 340, 660, 306, 676, 272, 690, 262, 846, 258, 866, 268, 884, 296, 912, 334, 942, 376]),
  poly('atticRock', [846, 258, 866, 268, 884, 296, 912, 334, 942, 376, 880, 376, 858, 310], 'face'),
  // strata and gullies in the rock face
  bar('atticRock', 640, 334, 700, 330, 1.4, 'dark'), bar('atticRock', 662, 304, 720, 300, 1.2, 'dark'),
  bar('atticRock', 760, 330, 840, 336, 1.4, 'dark'), bar('atticRock', 806, 296, 860, 300, 1.2, 'dark'),
  bar('atticRock', 730, 312, 736, 350, 1.2, 'dark'),
  // the wall round the top
  poly('stoaShade', [682, 270, 690, 256, 848, 252, 862, 266]),
  box('stoaStone', 690, 252, 848, 258),
  ...cypress(660, 372, 30), ...olive(716, 372, 20), ...cypress(890, 374, 28),
  // the Erechtheion, small, to the left
  box('stoaStone', 694, 238, 722, 252), box('stoaShade', 696, 242, 720, 250, 'face'),
  ...[699, 705, 711, 717].map((x) => box('stoaStone', x - 1.4, 242, x + 1.4, 251)),
  poly('stoaStone', [692, 238, 708, 231, 724, 238]),
  // the Parthenon: three steps, eight columns, architrave, triglyph frieze, pediment
  box('stoaShade', 744, 214, 836, 244, 'face'),
  box('stoaStone', 738, 244, 842, 248), box('stoaStone', 736, 248, 844, 252),
  box('stoaShade', 736, 250, 844, 252, 'face'),
  ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => {
    const x = 744 + i * 13.1;
    return [
      poly('stoaStone', [x - 3.2, 244, x + 3.2, 244, x + 2.6, 216, x - 2.6, 216]),
      box('stoaStone', x - 3.6, 213, x + 3.6, 216),
      bar('stoaStone', x + 1, 242, x + 0.8, 218, 0.8, 'dark'),
    ];
  }),
  box('stoaStone', 738, 206, 842, 213),
  box('stoaStone', 738, 199, 842, 206), ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => box('stoaShade', 740 + i * 6.8, 200, 743 + i * 6.8, 205, 'dark')),
  box('stoaStone', 735, 196, 845, 199),
  tri('stoaStone', 790, 186, 112, 12, 'up'),
  tri('stoaShade', 790, 188, 94, 8, 'up', 'face'),
];

// ── the hall: columns, entablature, roof, floor ──────────────────────────────

/** Where the hall's columns stand: the middle bay is wide, to frame the Acropolis. */
export const COLUMN_X = [340, 430, 520, 610, 680, 840, 910, 1000, 1090, 1180, 1270];

function doricColumn(x: number): Part[] {
  const top = 122;
  return [
    poly('stoaStone', [x - 13, FLOOR, x + 13, FLOOR, x + 10, top, x - 10, top]),
    poly('stoaStone', [x + 4, FLOOR, x + 13, FLOOR, x + 10, top, x + 3, top], 'face'),
    ...[-6, -1, 4].map((d) => bar('stoaStone', x + d, FLOOR - 6, x + d * 0.8, top + 8, 1.1, 'dark')),
    poly('stoaStone', [x - 10, top, x + 10, top, x + 16, top - 8, x - 16, top - 8]),
    box('stoaStone', x - 17, top - 14, x + 17, top - 8),
    box('stoaStone', x - 17, top - 9, x + 17, top - 8, 'face'),
  ];
}

export const COLONNADE: Part[] = COLUMN_X.flatMap(doricColumn);

/** The entablature over the columns and the tiled roof over that. */
export const ENTABLATURE: Part[] = [
  box('stoaStone', 300, 92, 1320, 108),
  box('stoaStone', 300, 104, 1320, 108, 'face'),
  box('stoaStone', 300, 72, 1320, 92),
  // a triglyph over every column and one between: a dark tablet with its grooves
  ...Array.from({ length: 30 }, (_, i) => 306 + i * 34).flatMap((x) => [
    box('stoaShade', x, 73, x + 11, 91, 'face'),
    bar('stoaShade', x + 5.5, 75, x + 5.5, 89, 1.2, 'dark'),
  ]),
  box('stoaStone', 296, 64, 1324, 72),
  box('terracotta', 292, 46, 1328, 64),
  // the tiles' joints, and an antefix standing at the end of each row
  ...Array.from({ length: 35 }, (_, i) => 300 + i * 30).flatMap((x) => [
    bar('terracotta', x, 48, x, 62, 1.2, 'dark'),
    tri('terracotta', x + 15, 42, 10, 8, 'up'),
  ]),
];

export const FLOOR_PAVING: Part[] = [
  box('stoaFloor', -300, FLOOR, 1500, 800),
  box('floorShade', -300, FLOOR, 1500, FLOOR + 3, 'face'),
  ...Array.from({ length: 22 }, (_, i) => -260 + i * 80).map((x) => bar('floorShade', x, FLOOR + 3, x - 16, 800, 1.2, 'dark')),
  bar('floorShade', -300, 520, 1500, 520, 1.2, 'dark'),
  bar('floorShade', -300, 596, 1500, 596, 1.2, 'dark'),
  // sun laid across the floor between the columns
  ...COLUMN_X.map((x) => poly('floorShade', [x + 14, FLOOR + 3, x + 40, FLOOR + 3, x + 2, 800, x - 24, 800], 'face')),
];

// ── the dais and the magistrate's chair ──────────────────────────────────────

export const DAIS: Part[] = [
  box('stoaStone', 708, 350, 812, FLOOR),
  box('stoaStone', 790, 350, 812, FLOOR, 'face'),
  box('stoaStone', 706, 346, 814, 352),
  box('stoaShade', 720, 368, 798, 452, 'face'),
  box('stoaStone', 726, 374, 792, 446),
  // three steps up its left side
  box('stoaStone', 690, 440, 708, FLOOR), box('stoaStone', 696, 410, 708, 440), box('stoaStone', 702, 380, 708, 410),
  box('stoaShade', 690, 440, 708, 443, 'face'), box('stoaShade', 696, 410, 708, 413, 'face'),
];

/** A klismos chair, seen side-on: splayed legs, a curved back. He faces left on it. */
export const ARCHON_CHAIR: Part[] = [
  bar('oak', 754, 333, 746, 350, 2.6),
  bar('oak', 784, 333, 792, 350, 2.6),
  bar('oak', 782, 334, 790, 302, 2.6),
  bar('oak', 784, 306, 794, 300, 4),
  box('oak', 750, 330, 788, 335),
  box('oak', 750, 333, 788, 335, 'face'),
];

// ── the stands: three stone tiers a side, a wooden bench on each ─────────────

export const TIERS = [446, 352, 258];

function stand(x0: number, x1: number): Part[] {
  return [
    box('stoaShade', x0, TIERS[2], x1, FLOOR),
    ...TIERS.flatMap((y) => [
      box('stoaStone', x0 - 2, y, x1 + 2, y + 6),
      box('stoaShade', x0, y + 6, x1, y + 9, 'face'),
      // the bench on the ledge: a plank on legs
      box('oak', x0 + 2, y - 18, x1 - 2, y - 13),
      box('oak', x0 + 2, y - 14, x1 - 2, y - 13, 'face'),
      ...Array.from({ length: Math.floor((x1 - x0) / 46) + 1 }, (_, i) => x0 + 10 + i * 46).filter((x) => x < x1 - 4)
        .map((x) => box('oak', x, y - 13, x + 3, y)),
    ]),
    box('stoaStone', x0 - 4, TIERS[2] - 2, x0 + 2, FLOOR),
    box('stoaStone', x1 - 2, TIERS[2] - 2, x1 + 4, FLOOR),
    box('stoaStone', x1 + 1, TIERS[2] - 2, x1 + 4, FLOOR, 'face'),
  ];
}
export const LEFT_STAND: Part[] = stand(416, 612);
export const RIGHT_STAND: Part[] = stand(922, 1262);

// ── his bedroom ──────────────────────────────────────────────────────────────

export const ROOM = { l: 108, r: 412, top: 218, ceil: 230, door: { x: 400, top: 330 } };

/** The room's walls, floor and fittings — everything that does not move. */
export const BEDROOM: Part[] = [
  // the shell: walls, roof slab and floor, in painted plaster
  box('whitewash', 108, 218, 412, 230),
  box('whitewash', 108, 218, 120, FLOOR),
  box('whitewash', 400, 218, 412, 330),
  box('whitewash', 108, 226, 412, 230, 'face'),
  // the back wall, papered in a quiet stripe
  box('bedWall', 120, 230, 400, FLOOR),
  ...Array.from({ length: 14 }, (_, i) => 130 + i * 20).map((x) => box('bedWall', x, 230, x + 6, 462, 'face')),
  box('sashWhite', 120, 460, 400, FLOOR),
  box('oak', 108, FLOOR, 412, FLOOR + 8),
  // the window, its panes lit by the morning, its curtains drawn back
  box('sashWhite', 166, 262, 234, 334),
  box('dawnSky', 171, 267, 229, 329),
  box('dawnGlow', 171, 306, 229, 329),
  bar('sashWhite', 200, 267, 200, 329, 2.4), bar('sashWhite', 171, 298, 229, 298, 2.4),
  box('sashWhite', 160, 334, 240, 339),
  poly('canvasTeal', [156, 256, 172, 256, 168, 300, 176, 344, 154, 344]),
  poly('canvasTeal', [228, 256, 244, 256, 246, 344, 224, 344, 232, 300]),
  poly('canvasTeal', [228, 256, 244, 256, 246, 344, 238, 344], 'face'),
  box('roofBoard', 150, 252, 250, 256),
  // the rug
  ell('posterRed', 300, 471, 150, 8),
  ell('posterRed', 300, 471, 120, 4, 'face'),
];

/** The bed, side-on: headboard left, footboard right, mattress top at y 438. */
export const BED_TOP = 438;
export const BED: Part[] = [
  box('oak', 138, 362, 150, FLOOR),
  box('oak', 138, 362, 150, 368, 'face'),
  box('oak', 292, 410, 300, FLOOR),
  box('oak', 150, 450, 292, 460),
  box('oak', 150, 457, 292, 460, 'face'),
  box('linen', 150, BED_TOP, 292, 450),
  box('linen', 150, 446, 292, 450, 'face'),
  // the pillow
  ell('linen', 168, 432, 38, 14),
  ell('linen', 172, 436, 30, 6, 'face'),
];

/** The duvet, drawn about its right edge (x 292) so it can be pulled back. */
export const DUVET_RIGHT = 292;
export const DUVET: Part[] = [
  poly('duvet', [292, 452, 172, 452, 176, 436, 196, 425, 236, 422, 272, 424, 292, 430]),
  poly('duvet', [292, 452, 230, 452, 236, 430, 272, 426, 292, 431], 'face'),
  bar('duvet', 180, 442, 290, 442, 1.2, 'dark'),
];

/** The nightstand by the bed, with its drawer. */
export const NIGHTSTAND: Part[] = [
  box('oak', 312, 426, 352, FLOOR),
  box('oak', 342, 426, 352, FLOOR, 'face'),
  box('oak', 310, 422, 354, 428),
  box('oak', 316, 436, 338, 452, 'dark'),
  ell('brass', 327, 444, 4, 4),
];

/** An alarm clock: a red drum on two feet, a white face, two bells and a hammer. */
export function alarmClock(x: number, base: number): Part[] {
  return [
    bar('clockRed', x - 5, base - 3, x - 7, base, 2),
    bar('clockRed', x + 5, base - 3, x + 7, base, 2),
    ell('clockRed', x - 5, base - 17, 7, 6),
    ell('clockRed', x + 5, base - 17, 7, 6),
    ell('clockRed', x, base - 9, 15, 15),
    ell('clockRed', x + 2, base - 7, 9, 11, 'face'),
    ell('dialWhite', x, base - 9, 10.5, 10.5),
    bar('clockRed', x, base - 9, x, base - 13, 1, 'line'),
    bar('clockRed', x, base - 9, x + 3, base - 8, 1, 'line'),
  ];
}

/** The door in the right wall, shut: a slab filling the doorway, with its handle. */
export const DOOR_SHUT: Part[] = [
  box('doorPaint', 400, 330, 412, FLOOR),
  box('doorPaint', 406, 330, 412, FLOOR, 'face'),
  ell('brass', 398, 404, 5, 5),
];

/**
 * The door swung open into the court, drawn about its hinge (x 412) so it opens by
 * growing: its outer face, panelled, as it turns toward us.
 */
export const DOOR_HINGE = 412;
export const DOOR_FACE: Part[] = [
  box('doorPaint', 412, 330, 470, FLOOR),
  box('doorPaint', 420, 342, 462, 396, 'dark'),
  box('doorPaint', 420, 408, 462, 460, 'dark'),
  ell('brass', 462, 404, 5, 5),
];

/** The morning light the open door lays on the bedroom floor. */
export const DOOR_LIGHT: Part[] = [poly('skyGlow', [400, FLOOR, 400, 330, 330, FLOOR])];
