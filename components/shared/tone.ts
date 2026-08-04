// ─────────────────────────────────────────────────────────────────────────────
// THE TONAL SYSTEM FOR STRUCK THINGS — rank pins and badges.
//
// ZERO IMPORTS, the same rule as badgeShapes.ts and cinematic/rig.ts: a file with
// no React in it can be required by plain Node, so a contact sheet of all
// seventy-five marks can be generated and measured without Metro or a device.
//
// ── WHY THERE IS NO COLOUR HERE ─────────────────────────────────────────────
//
// The app is hand-drawn black and white, and §19 says photographs are the ONE
// place that bends. This does not add a second place. Every value below is ink,
// grey, or the warm paper the app is already printed on — what changes is that a
// pin now has a LIT SIDE AND A SHADED SIDE, which is what makes a flat outline
// read as an object you could pick up.
//
// ── ONE LIGHT, AND IT NEVER MOVES ───────────────────────────────────────────
//
// Everything is lit from the TOP LEFT. That is the whole discipline: the face
// gradient runs light→dark down-right, the rim highlight sits top-left, the drop
// shadow falls bottom-right. Seventy-five marks lit from one direction read as a
// set; seventy-five lit from wherever suited each one reads as clip art.
//
// The angles are expressed as gradient endpoints in the unit square, so they are
// resolution-independent and identical on every shape.
// ─────────────────────────────────────────────────────────────────────────────

/** The ink the app is drawn in. */
export const INK = '#1A1A1A';
/** One step off ink — the rim's dark side, so the outline still reads as darkest. */
export const RIM_DARK = '#3A3A37';
/** Mid grey: secondary rules, the shaded half of a face. */
export const MID = '#6B6B6B';
/** The warm paper the app is printed on. */
export const PAPER = '#FAFAF7';
/** Paper, one step down — the shaded end of a face gradient. */
export const PAPER_SHADE = '#C6C0B2';
/** Paper, one step up — the lit corner. */
export const PAPER_LIT = '#FFFFFF';
/** The faint rule used for a tier's inner line. */
export const FAINT = '#C9C5BA';

/**
 * Locked linework: a cool slate, deliberately OFF the warm paper ramp above.
 *
 * A locked pin must not read as "the same pin, dimmer" — at a glance that is
 * indistinguishable from a rendering fault. Cool against the warm set reads as
 * unlit, which is the thing being said. It is also drawn FLAT, with no gradient
 * at all, so the lit/shaded contrast is itself the reward for earning it.
 */
export const GHOST = '#AAB1BC';

/** The unit-square endpoints of the one light direction: top-left to bottom-right. */
export const LIGHT = { x1: '15%', y1: '0%', x2: '85%', y2: '100%' } as const;

/** A gradient's stops, as [offset, colour, opacity] — fed straight to <Stop>. */
export type Stops = [string, string, number][];

/**
 * The face of a struck thing: lit at the top-left corner, shaded at the bottom
 * right, with the turn placed just past the middle so the lit half dominates.
 */
export const FACE: Stops = [
  ['0%', PAPER_LIT, 1],
  ['46%', PAPER, 1],
  ['100%', PAPER_SHADE, 1],
];

/**
 * The rim: ink where the light does not reach, lifting toward mid-grey where it
 * does. Drawn as a stroke, so this is what gives the outline its turned edge.
 */
export const RIM: Stops = [
  ['0%', MID, 1],
  ['40%', INK, 1],
  ['100%', RIM_DARK, 1],
];

/**
 * The recess a mark sits in — the same light, inverted. A dish is dark where a
 * dome is bright, and that inversion is the only thing that says "cut in" rather
 * than "raised". Kept shallow (a 0.09 delta) so it never competes with the mark.
 */
export const RECESS: Stops = [
  ['0%', '#00000000', 0],
  ['0%', INK, 0.09],
  ['100%', INK, 0],
];

/** Flat slate for everything locked — no gradient, by the rule above. */
export const LOCKED_FACE: Stops = [
  ['0%', '#F2F3F5', 1],
  ['100%', '#E4E7EB', 1],
];

/**
 * How far the drop shadow is offset, in the 100-unit design box.
 *
 * Down and to the right, because the light is up and to the left. Small on
 * purpose: at the 28px a badge is drawn in a grid, anything past about 1.5 units
 * stops reading as depth and starts reading as a misregistered second copy.
 */
export const SHADOW = { dx: 1.2, dy: 1.4, opacity: 0.16 } as const;
