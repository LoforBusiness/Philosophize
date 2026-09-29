import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF aesthetics-aesthetics-1 — A HILLTOP LOOKOUT AT SUNSET. The owner
// approved it on 2026-09-25, one of five first lessons redesigned after the logic
// debate studio, each in a setting of its own.
//
//   the view       the sky and the hills, drawn by the scene (the sun is in it).
//   the rail       a wooden lookout rail across the whole stage, posts to the grass.
//   the info board a lookout's board on one post, top left.
//   the telescope  a coin telescope on a post, aimed at the sun.
//   the crate      a crate with a picnic basket on it, at the height of his hand.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The sky, down to where the rail stands in front of it. */
export const SKY = { top: 292, bottom: 466 };
/** The sun, half set behind the far ridge. */
export const SUN = { x: 322, y: 426, r: 17 };
/** The rail's top bar. */
export const RAIL_Y = 460;
/** The info board and its one post. */
export const BOARD = { x: 12, y: 300, w: 176, h: 76 };
/** The telescope's post and head. */
export const SCOPE = { x: 362, top: 438 };
/**
 * The crate and the basket on it. The apple rests where the reach-for-apple hand
 * lands with him at x 250 facing right — (275, 464), read off the rig (Y7).
 */
export const CRATE = { x: 258, w: 40, top: 474 };
export const APPLE = { x: 279, y: 463, r: 8 };

/** The rail: a top bar across the stage, and posts that stop short of where he stands. */
export function rail(): ObjPart[] {
  const posts = [18, 98, 178, 336].map((x) => oRect('mass', x, (RAIL_Y + GROUND) / 2 + 2, 6, GROUND - RAIL_Y, 0, 1));
  return [
    ...posts,
    oRect('mass', 200, RAIL_Y + 2.5, 404, 5, 0, 1),
    oRect('face', 200, RAIL_Y + 11, 404, 3, 0, 1),
  ];
}

/** The info board's post; the board itself is drawn by the scene. */
export function boardPost(): ObjPart[] {
  const cx = BOARD.x + BOARD.w / 2;
  return [oRect('mass', cx, (BOARD.y + BOARD.h + GROUND) / 2, 6, GROUND - BOARD.y - BOARD.h, 0, 1)];
}

/** A coin telescope: a post, a coin box, and a tube aimed left at the sun. */
export function telescope(): ObjPart[] {
  const { x, top } = SCOPE;
  return [
    oRect('mass', x, (top + GROUND) / 2 + 6, 5, GROUND - top - 12, 0, 1),
    oRect('mass', x, top + 8, 14, 16, 0, 2),
    oRect('dark', x, top + 6, 6, 2, 0, 1),
    oRect('mass', x - 8, top - 4, 34, 11, -14, 3),
    oRect('face', x - 26, top + 1, 6, 14, -14, 1.5),
  ];
}

/** A slatted crate, and the wicker basket standing on it. */
export function crate(): ObjPart[] {
  const { x, w, top } = CRATE;
  const cx = x + w / 2;
  return [
    oRect('mass', cx, (top + GROUND) / 2, w, GROUND - top, 0, 1.5),
    oBar('dark', x + 4, top + 9, x + w - 4, top + 9, 2),
    oBar('dark', x + 4, top + 18, x + w - 4, top + 18, 2),
    // the basket: a body and its rim, the apple sitting in it
    oRect('face', cx, top - 4, w - 6, 9, 0, 2),
    oRect('mass', cx, top - 8.5, w - 2, 3, 0, 1),
  ];
}

// ── THE VIEW, REDRAWN 2026-09-28 against references ──────────────────────────
//
// The owner: the hills and the sun were the cheapest thing on the stage — two
// rounded rectangles and a flat disc. References (a sunset over the tumuli at
// Gyeongju, Weardale's hills in mist, both on Wikimedia Commons) agree on three
// things, and they are the whole of the drawing:
//
//   · RIDGES IN LAYERS, each lighter than the one in front of it — atmospheric
//     depth — the farthest nearly the colour of the sky, the nearest the darkest.
//   · A ridgeline is IRREGULAR: many rounded crowns at different heights, never
//     one dome. Each layer is a run of overlapping ovals, so its crest rises and
//     falls, and a line of small tree crowns breaks the near crest.
//   · THE SUN SITS IN THE RIDGE, half hidden, with the sky paling round it.
//
// Every part is a recess ('dark') so none is outlined: a hill is a colour field,
// not an object with an ink edge. The scene gives each layer its own tone.

/** The far ridge: crowns [x, y, w, h]. Its crest meets the sun's middle at x 322. */
export const RIDGE_FAR: readonly (readonly number[])[] = [
  [-10, 446, 120, 40], [70, 438, 110, 34], [150, 444, 120, 34], [226, 438, 110, 30], [300, 438, 110, 26],
  [372, 442, 100, 34],
];
/** The middle ridge, lower and nearer. */
export const RIDGE_MID: readonly (readonly number[])[] = [
  [10, 460, 150, 40], [120, 454, 130, 30], [214, 460, 130, 36], [300, 456, 120, 30], [396, 452, 120, 40],
];
/** The near slope the lookout stands on: its crest, then down to the ground. */
export const SLOPE_TOP = 462;
export const RIDGE_NEAR: readonly (readonly number[])[] = [
  [40, 466, 170, 22], [190, 468, 190, 20], [350, 464, 160, 24],
];
/** A line of tree crowns along the middle ridge, for scale. */
export const TREES: readonly (readonly number[])[] = [
  [36, 441, 9], [47, 443, 7], [132, 440, 8], [141, 442, 6], [236, 443, 8], [246, 444, 10], [256, 445, 7],
  [352, 441, 8], [362, 442, 6],
];

/** One layer of the view as recesses, so the SCENE picks the colour. */
export function ridge(crowns: readonly (readonly number[])[], fillTo = 0): ObjPart[] {
  const out: ObjPart[] = crowns.map(([x, y, w, h]) => oEll('dark', x, y, w, h));
  if (fillTo) {
    const top = Math.min(...crowns.map(([, y]) => y));
    out.push(oRect('dark', 200, (top + fillTo) / 2, 420, fillTo - top));
  }
  return out;
}
export function trees(): ObjPart[] {
  return TREES.map(([x, y, r]) => oEll('dark', x, y, r, r * 1.15));
}
