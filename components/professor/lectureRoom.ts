import { oEll, oRect, oBar, book, type ObjPart } from '@/components/lesson/cinematic/objects';
import { BOARD_W, BOARD_H } from './chalk';

// ─────────────────────────────────────────────────────────────────────────────
// THE LECTURE ROOM — where everything stands, and what each prop is made of.
//
// The professor's intro plays in a room: a chalkboard on an A-frame easel, a wall
// clock, and books — a stack with a globe on it under the board, and another with an
// open book on top that stands in for his lectern. Every prop is drawn in the object
// library's own vocabulary (objects.ts: ellipses, rounded rectangles, bars, each with
// a ROLE that picks its tone), so `ObjectArt` paints it the way it paints a lesson's
// props, and it was drawn against real pictures (`npm run ref`) rather than from
// memory — the rule group AM of the rule book learned the hard way:
//
//   the easel  an A-frame: two front legs splayed wider at the floor than at the
//              top, a back leg between them, the board resting on a ledge, and the
//              leg tops standing proud of the board's top edge.
//   the clock  a thick dark rim round a white face, four hour marks heavier than
//              the rest, and two hands from a centre pin, hung high on the wall.
//   the books  never squared up: each a different size and a degree or two off the
//              one below, spines banded, the page block a light strip.
//
// STAGE UNITS: 400 wide, STAGE_H tall, the floor at GROUND. The chalk is laid out
// in BOARD units (chalk.ts) and drawn at BOARD_S, with its top-left at CHALK_X,
// CHALK_Y — so the board can be resized here without touching a word of chalk.
//
// Imports only zero-import siblings, so the sheet can draw it in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_W = 400;
export const STAGE_H = 380;
export const GROUND = 350;

/** The board is drawn at this scale of its own units. */
export const BOARD_S = 0.87;
/** Where the chalk area's top-left sits on the stage. */
export const CHALK_X = 16;
export const CHALK_Y = 77;
/** The wooden frame round the slate, board units. */
const FRAME = 8;

const bx = (u: number) => CHALK_X + u * BOARD_S;
const by = (u: number) => CHALK_Y + u * BOARD_S;

/** The slate itself, stage units: painted DEEP by the film, under the chalk. */
export const SLATE = {
  x: bx(-3), y: by(-3), w: (BOARD_W + 6) * BOARD_S, h: (BOARD_H + 6) * BOARD_S,
};
/** The frame's outer edge, stage units. */
export const FRAME_BOX = {
  x: bx(-FRAME), y: by(-FRAME), w: (BOARD_W + FRAME * 2) * BOARD_S, h: (BOARD_H + FRAME * 2) * BOARD_S,
};
const frameBottom = FRAME_BOX.y + FRAME_BOX.h;
const frameCx = FRAME_BOX.x + FRAME_BOX.w / 2;

/** Where the professor stands, and the off-stage point he walks in from. */
export const X_MARK = 314;
export const X_OFF = 450;

// ── the easel, drawn BEHIND the board ────────────────────────────────────────
export const EASEL_BACK: readonly ObjPart[] = [
  // the back leg, in shade, reaching the floor behind the board
  oBar('face', frameCx, FRAME_BOX.y - 8, frameCx, GROUND - 4, 5),
  // the two front legs, splayed: narrower at the top than at the floor
  oBar('mass', FRAME_BOX.x + 30, FRAME_BOX.y - 14, FRAME_BOX.x + 12, GROUND, 7),
  oBar('mass', FRAME_BOX.x + FRAME_BOX.w - 30, FRAME_BOX.y - 14, FRAME_BOX.x + FRAME_BOX.w - 12, GROUND, 7),
  // a brace between them, low down
  oBar('face', FRAME_BOX.x + 20, GROUND - 52, FRAME_BOX.x + FRAME_BOX.w - 20, GROUND - 52, 4),
];

/** The frame round the slate, and the ledge the board rests on. The slate is the film's. */
export const BOARD_FRAME: readonly ObjPart[] = [
  oRect('mass', frameCx, FRAME_BOX.y + FRAME_BOX.h / 2, FRAME_BOX.w, FRAME_BOX.h, 0, 4),
];
export const LEDGE: readonly ObjPart[] = [
  oBar('mass', FRAME_BOX.x - 5, frameBottom + 3, FRAME_BOX.x + FRAME_BOX.w + 5, frameBottom + 3, 7),
  // a stick of chalk and the duster, waiting on the ledge
  oBar('lit', FRAME_BOX.x + 40, frameBottom - 2, FRAME_BOX.x + 54, frameBottom - 2, 3),
  oRect('face', FRAME_BOX.x + FRAME_BOX.w - 44, frameBottom - 3, 22, 7, 0, 2),
  oRect('lit', FRAME_BOX.x + FRAME_BOX.w - 44, frameBottom - 5.5, 22, 2.5, 0, 1),
];

// ── the wall clock ───────────────────────────────────────────────────────────
export const CLOCK = { cx: 360, cy: 62, r: 22 };
export const CLOCK_PARTS: readonly ObjPart[] = (() => {
  const { cx, cy, r } = CLOCK;
  const parts: ObjPart[] = [
    oEll('mass', cx, cy, r * 2, r * 2),
    oEll('lit', cx, cy, r * 1.6, r * 1.6),
  ];
  for (let h = 0; h < 12; h += 1) {
    const a = (h / 12) * Math.PI * 2;
    const big = h % 3 === 0;
    const r1 = r * 0.78, r0 = r * (big ? 0.6 : 0.68);
    parts.push(oBar('line', cx + Math.sin(a) * r0, cy - Math.cos(a) * r0, cx + Math.sin(a) * r1, cy - Math.cos(a) * r1, big ? 2.2 : 1.2));
  }
  // the hour hand at ten, the minute hand at two: the clockmaker's resting smile
  const hand = (turn: number, len: number, t: number) => {
    const a = turn * Math.PI * 2;
    return oBar('line', cx, cy, cx + Math.sin(a) * len, cy - Math.cos(a) * len, t);
  };
  parts.push(hand(10 / 12, r * 0.42, 2.4), hand(2 / 12, r * 0.6, 1.8), oEll('line', cx, cy, 4, 4));
  return parts;
})();
/** The second hand's length; the film turns it on its own clock. */
export const SECOND_HAND = CLOCK.r * 0.7;

// ── books ────────────────────────────────────────────────────────────────────

/**
 * One closed book lying flat, seen from the fore-edge corner: a cover (the mass), a
 * page block cut into it (lit), and two bands across the spine end.
 */
function flatBook(cx: number, bottom: number, w: number, h: number, rot: number): ObjPart[] {
  const cy = bottom - h / 2;
  const spine = w * 0.28;
  return [
    oRect('mass', cx, cy, w, h, rot, 2),
    oRect('lit', cx + spine / 2 + 1, cy, w - spine - 5, h - 4, rot, 1),
    oBar('line', cx - w / 2 + spine * 0.35, cy - h / 2 + 1.5, cx - w / 2 + spine * 0.35, cy + h / 2 - 1.5, 1.4),
    oBar('line', cx - w / 2 + spine * 0.7, cy - h / 2 + 1.5, cx - w / 2 + spine * 0.7, cy + h / 2 - 1.5, 1.4),
  ];
}

export interface Prop {
  /** Which palette hue it is struck in: an index into the film's list of tones. */
  tone: number;
  parts: readonly ObjPart[];
}

/** The stack under the board, with the globe on it. */
const STACK_X = FRAME_BOX.x + 64;
const S1 = { w: 62, h: 12 }, S2 = { w: 54, h: 10 }, S3 = { w: 58, h: 11 };
const stackTop = GROUND - S1.h - S2.h - S3.h;
export const BOOKS_LEFT: readonly Prop[] = [
  { tone: 0, parts: flatBook(STACK_X, GROUND, S1.w, S1.h, 0) },
  { tone: 1, parts: flatBook(STACK_X + 3, GROUND - S1.h, S2.w, S2.h, -1.5) },
  { tone: 2, parts: flatBook(STACK_X - 2, GROUND - S1.h - S2.h, S3.w, S3.h, 1) },
];

/** The globe: a sphere on a stem and foot, two continents, and the meridian ring. */
export const GLOBE: readonly ObjPart[] = (() => {
  const cx = STACK_X, foot = stackTop, r = 17;
  const cy = foot - 12 - r;
  const ring: ObjPart[] = [];
  // the meridian: a half ring on the left, in short bars
  const seg = 8;
  for (let i = 0; i < seg; i += 1) {
    const a0 = Math.PI * (0.55 + (i / seg) * 0.9), a1 = Math.PI * (0.55 + ((i + 1) / seg) * 0.9);
    ring.push(oBar('line', cx + Math.cos(a0) * (r + 4), cy - Math.sin(a0) * (r + 4), cx + Math.cos(a1) * (r + 4), cy - Math.sin(a1) * (r + 4), 2));
  }
  return [
    oEll('face', cx, foot - 2, 26, 6),
    oBar('line', cx, foot - 3, cx, cy + r, 3),
    ...ring,
    oEll('mass', cx, cy, r * 2, r * 2),
    oEll('dark', cx - 5, cy - 4, 13, 9, -20),
    oEll('dark', cx + 7, cy + 6, 9, 7, 30),
  ];
})();

/** The second stack, with an open book on it: the lectern he does not need. */
const LECT_X = FRAME_BOX.x + FRAME_BOX.w - 70;
export const BOOKS_RIGHT: readonly Prop[] = [
  { tone: 3, parts: flatBook(LECT_X, GROUND, 58, 13, 0) },
  { tone: 1, parts: flatBook(LECT_X - 2, GROUND - 13, 50, 11, 1.5) },
  { tone: 4, parts: book(LECT_X, GROUND - 24 - 11, 48, 22) },
];

/** A small pile on the floor behind him, at the room's right edge. */
export const BOOKS_FAR: readonly Prop[] = [
  { tone: 2, parts: flatBook(377, GROUND, 40, 11, 0) },
  { tone: 0, parts: flatBook(376, GROUND - 11, 34, 9, -2) },
];
