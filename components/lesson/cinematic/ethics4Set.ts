import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly } from './setShapes';
import type { SetPart } from './SetArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE SETS OF ethics-ethics-4 — AN ANTHROPOLOGIST'S STUDY, AND A VILLAGE OF THE WORLD.
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts).
//
// THE STUDY    a globe on a floor stand, a wall map pinned with many colours, and a
//              desk with Ruth Benedict's book on it.
// THE VILLAGE  five homes from five parts of the world in one row — an igloo, a tent, a
//              round hut, a pagoda, a cottage — on one ground, with the stone foundation
//              under all of them that the lesson ends on.
//
// THE CHANGE goes into the globe's ocean and comes out of the village's sky, which is
// the same blue.
//
// A grave lesson (N11): nothing in either set is a gag, and nothing draws a harm the
// narration names. He reaches about 25 from a shoulder 49 above the floor: the globe at
// 80 from 114, the book at 330 from 312. STAGE UNITS, GROUND at 500.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

// ── the study ────────────────────────────────────────────────────────────────

export const GLOBE = { x: 80, y: 438, r: 20 };
export const MAP = { x0: 150, x1: 310, top: 330, bottom: 404 };
/** The pins on the map: where, and in which of the palette's colours each culture flies. */
export const PINS = [[172, 350], [196, 366], [222, 346], [248, 372], [268, 352], [290, 368], [186, 384], [276, 386]];
export const DESK = { x0: 300, x1: 380, top: 466 };
export const BOOK = { x: 330, y: 461 };

export function globeStand(): ObjPart[] {
  const { x, y, r } = GLOBE;
  return [
    oBar('mass', x, y + r + 2, x, GROUND - 4, 3),
    oRect('mass', x, GROUND - 3, 30, 6, 0, 1.5),
    oBar('line', x - r - 3, y - 6, x + r - 2, y + 10, 1.4),
  ];
}
export function mapFrame(): ObjPart[] {
  const { x0, x1, top, bottom } = MAP;
  return [oRect('mass', (x0 + x1) / 2, (top + bottom) / 2, x1 - x0 + 6, bottom - top + 6, 0, 2)];
}
export function desk(): ObjPart[] {
  const { x0, x1, top } = DESK;
  return [
    oBar('mass', x0 + 6, top + 4, x0 + 6, GROUND, 4),
    oBar('mass', x1 - 6, top + 4, x1 - 6, GROUND, 4),
    oRect('mass', (x0 + x1) / 2, top + 2, x1 - x0, 5, 0, 1.5),
    oRect('face', (x0 + x1) / 2, top + 9, x1 - x0 - 12, 8, 0, 1.5),
  ];
}

// ── the village ──────────────────────────────────────────────────────────────

/** Where the homes stand, their ground, and each one's door. */
export const HOME_GROUND = 470;
export const HOMES = [48, 122, 200, 278, 352];
/** The two signs of the last question, on posts in front. */
export const SIGNS = [96, 304];

// ── THE FIVE HOMES, REDRAWN 2026-09-28 against references ───────────────────
//
// Owner: the second scene's objects *"seem to be more cheap"*. They were an oval, a
// triangle and three copies of one box house. Now each is built from what its
// reference shows (Wikimedia Commons): an IGLOO as a half-dome of snow courses with
// its entrance tunnel; a Mongolian GER, a short round wall under a low cone of felt
// with a painted door; a Lesotho RONDAVEL, a stone drum under a tall overhanging
// cone of thatch; a five-storey PAGODA (Sensō-ji), each storey narrower under wide
// eaves turned up at the tips, and a ringed spire; an English thatched COTTAGE,
// whitewashed, with a deep rounded roof and a brick chimney.
//
// Each stands on the village's own ground line, behind him — which is why it is
// smaller than he is: it is further away.
const G0 = HOME_GROUND;
const iglooAt = (x: number, G: number): SetPart[] => [
  // a half dome, flat on the snow, and the entrance tunnel out of its side
  oPoly('mass', [x - 24, G, x - 23, G - 8, x - 19, G - 17, x - 12, G - 23, x - 3, G - 26, x + 6, G - 25, x + 14, G - 21, x + 20, G - 14, x + 24, G - 5, x + 24, G]),
  oPoly('mass', [x + 14, G, x + 14, G - 12, x + 18, G - 15, x + 30, G - 15, x + 34, G - 11, x + 34, G]),
  oPoly('face', [x + 6, G - 25, x + 14, G - 21, x + 20, G - 14, x + 24, G - 5, x + 24, G, x + 10, G]),
  oPoly('dark', [x + 25, G, x + 25, G - 7, x + 28, G - 10, x + 31, G - 7, x + 31, G]),
  // the courses of snow blocks
  oPoly('line', [x - 22, G - 9, x + 13, G - 9, x + 13, G - 8.2, x - 22, G - 8.2]),
  oPoly('line', [x - 17, G - 17, x + 16, G - 17, x + 16, G - 16.2, x - 17, G - 16.2]),
];
const ger = (x: number, G: number): SetPart[] => [
  // a short round wall, a low cone of felt, the crown ring on top
  oRect('mass', x, G - 9, 44, 18, 0, 2),
  oPoly('mass', [x - 25, G - 17, x - 8, G - 30, x + 8, G - 30, x + 25, G - 17]),
  oRect('mass', x, G - 31, 16, 3, 0, 1.5),
  oPoly('face', [x + 8, G - 30, x + 25, G - 17, x + 22, G - 17, x + 6, G - 29]),
  oRect('face', x + 14, G - 9, 16, 18, 0, 0),
  // the rope band and the painted door
  oPoly('line', [x - 22, G - 12, x + 22, G - 12, x + 22, G - 11.2, x - 22, G - 11.2]),
  oRect('dark', x - 4, G - 7, 9, 13, 0, 0.5),
  oRect('lit', x - 4, G - 7, 5, 11, 0, 0.5),
];
const rondavel = (x: number, G: number): SetPart[] => [
  // a drum of stone under a big cone of thatch that overhangs it
  oRect('mass', x, G - 10, 34, 20, 0, 1.5),
  oPoly('mass', [x - 26, G - 18, x - 2, G - 46, x + 2, G - 46, x + 26, G - 18, x + 20, G - 16, x - 20, G - 16]),
  oPoly('face', [x + 2, G - 46, x + 26, G - 18, x + 20, G - 16, x + 6, G - 20]),
  oRect('dark', x - 3, G - 6, 8, 12, 0, 3),
  // the thatch's layers, and the stones
  oPoly('line', [x - 17, G - 26, x + 17, G - 26, x + 17, G - 25.3, x - 17, G - 25.3]),
  oPoly('line', [x - 9, G - 36, x + 9, G - 36, x + 9, G - 35.3, x - 9, G - 35.3]),
  oEll('face', x - 11, G - 12, 5, 3), oEll('face', x + 9, G - 7, 5, 3), oEll('face', x - 13, G - 4, 4, 3),
];
const pagodaAt = (x: number, G: number): SetPart[] => {
  const p: SetPart[] = [];
  // four storeys, each narrower, each under wide eaves turned up at the tips
  let base = G;
  const ws = [28, 23, 18, 13];
  for (let k = 0; k < 4; k++) {
    const w = ws[k]; const h = k === 0 ? 11 : 8;
    p.push(oRect('mass', x, base - h / 2, w, h, 0, 0.5));
    const ey = base - h; const ew = w + 16;
    p.push(oPoly('mass', [x - ew / 2 - 3, ey - 5, x - ew / 2 + 2, ey - 2, x - w / 2, ey - 4, x - w / 2 + 3, ey - 8, x + w / 2 - 3, ey - 8, x + w / 2, ey - 4, x + ew / 2 - 2, ey - 2, x + ew / 2 + 3, ey - 5, x + ew / 2, ey + 1, x - ew / 2, ey + 1]));
    p.push(oPoly('face', [x + w / 2 - 3, ey - 8, x + w / 2, ey - 4, x + ew / 2 - 2, ey - 2, x + ew / 2, ey + 1, x + w / 2, ey + 1]));
    base = ey - 8;
  }
  // the spire with its rings
  p.push(oBar('mass', x, base, x, base - 16, 2.2));
  p.push(oEll('lit', x, base - 5, 5, 1.6), oEll('lit', x, base - 9, 4.5, 1.6), oEll('lit', x, base - 13, 4, 1.6));
  p.push(oRect('dark', x, G - 4, 7, 8, 0, 0.5));
  return p;
};
const cottageAt = (x: number, G: number): SetPart[] => [
  // whitewashed walls, a deep thatched roof rounded at the eaves, a brick chimney
  oRect('mass', x, G - 11, 40, 22, 0, 1),
  oPoly('mass', [x - 25, G - 19, x - 20, G - 25, x - 8, G - 40, x + 8, G - 40, x + 20, G - 25, x + 25, G - 19, x + 20, G - 17, x - 20, G - 17]),
  oRect('mass', x + 11, G - 42, 6, 12, 0, 0.5),
  oPoly('face', [x + 8, G - 40, x + 20, G - 25, x + 25, G - 19, x + 20, G - 17, x + 12, G - 22]),
  oRect('dark', x - 9, G - 6, 7, 12, 0, 0.5),
  oRect('dark', x + 7, G - 12, 9, 7, 0, 0.5),
  oPoly('lit', [x + 3, G - 15, x + 11, G - 15, x + 11, G - 9, x + 3, G - 9]),
  oPoly('line', [x - 18, G - 28, x + 18, G - 28, x + 18, G - 27.3, x - 18, G - 27.3]),
];

export const igloo = (x: number) => iglooAt(x, G0);
export const tent = (x: number) => ger(x, G0);
export const roundHut = (x: number) => rondavel(x, G0);
export const pagoda = (x: number) => pagodaAt(x, G0);
export const cottage = (x: number) => cottageAt(x, G0);

export function signPosts(): ObjPart[] {
  return SIGNS.flatMap((x) => [oBar('mass', x, 420, x, GROUND - 2, 4)]);
}
