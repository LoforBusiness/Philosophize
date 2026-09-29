// ─────────────────────────────────────────────────────────────────────────────
// THE SUBJECT DRAWINGS — seven subjects and philosophy's six branches (2026-09-29).
//
// A tile on Learn, a card in Home's carousel and a subject page's masthead all draw
// one of these. The owner picked "drawn object scenes" over photographs and over a
// single big icon: a small still life of two objects, in the app's own flat inked
// language — the same one the lesson objects and the tab icons speak.
//
// ── BUILT FROM THE LESSON OBJECTS' PARTS ────────────────────────────────────
//
// Every part is one of `objects.ts`'s four shapes, with a ROLE rather than a colour
// (`mass` the lit body, `face` a body plane in shade, `dark` a recess, `line` ink, `lit`
// paper). So the drawing is struck in its own subject's hue without a hex anywhere
// but `sceneTones()`, and the renderer is the lessons' own: every body outlined as one
// union in ink, then filled, then the marks on top.
//
// ── A SCENE IS LAYERS, NOT ONE PART LIST ────────────────────────────────────
//
// The outline goes round the UNION of a part list, which is right for one object and
// wrong for two: a bust standing behind a book would come out as one silhouette with
// no edge where the book passes in front. So a scene is a list of objects, back to
// front, each outlined on its own.
//
// ── ZERO RUNTIME IMPORTS, LIKE objects.ts ───────────────────────────────────
//
// Its one import is `mix`, from tone.ts, which has none. So `npm run sheet:subjects`
// draws every scene in plain Node and "does that read as a flask?" is answered in
// seconds. That loop is the whole reason any of this is affordable.
//
// ── EACH DRAWING STATES ITS REFERENCE ───────────────────────────────────────
//
// Above each scene is what its reference picture actually shows (fetched with
// `npm run ref`), so a correction is an argument about construction and not about
// taste.
// ─────────────────────────────────────────────────────────────────────────────
import type { ObjPart, Role } from '@/components/lesson/cinematic/objects';
import { mix, INK, EMBER, PAPER_LIT } from '@/components/shared/tone';

// The four shapes, declared locally rather than imported, so this file needs no
// runtime import from objects.ts (which a .tsx chain would drag into the sheet).
const E = (role: Role, x: number, y: number, w: number, h: number, rot = 0): ObjPart => ({ k: 'ell', role, x, y, w, h, rot });
const R = (role: Role, x: number, y: number, w: number, h: number, rot = 0, rad = 0): ObjPart => ({ k: 'rect', role, x, y, w, h, rot, rad });
const B = (role: Role, x1: number, y1: number, x2: number, y2: number, t: number): ObjPart => ({ k: 'bar', role, x1, y1, x2, y2, t });
const T = (role: Role, x: number, y: number, w: number, h: number, dir: 'up' | 'down' | 'left' | 'right', rot = 0): ObjPart => ({ k: 'tri', role, x, y, w, h, dir, rot });

/** objects.ts's trapezoid: a narrow rectangle with a triangle half-buried at each side. */
function trap(role: Role, x: number, y: number, wTop: number, wBot: number, h: number): ObjPart[] {
  const narrow = Math.min(wTop, wBot);
  const flank = Math.abs(wBot - wTop) / 2;
  if (flank < 0.01) return [R(role, x, y, narrow, h)];
  const up = wTop < wBot;
  return [R(role, x, y, narrow, h), T(role, x - narrow / 2, y, flank * 2, h, up ? 'up' : 'down'), T(role, x + narrow / 2, y, flank * 2, h, up ? 'up' : 'down')];
}

/**
 * An elliptical RING as a chain of short ink bars. A ring cannot be a filled part —
 * its middle would be painted — so an orbit, a planet's ring and a lens rim are drawn
 * as a stroke, which is what the tab icons' ink line already is. `from`/`to` are
 * degrees, so a ring can pass BEHIND a body in one layer and in front of it in another.
 */
function ring(x: number, y: number, rx: number, ry: number, t: number, rot = 0, from = 0, to = 360, n = 28): ObjPart[] {
  const out: ObjPart[] = [];
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const at = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    const dx = rx * Math.cos(a);
    const dy = ry * Math.sin(a);
    return [x + dx * c - dy * s, y + dx * s + dy * c] as const;
  };
  const steps = Math.max(2, Math.round((n * (to - from)) / 360));
  for (let i = 0; i < steps; i++) {
    const [x1, y1] = at(from + ((to - from) * i) / steps);
    const [x2, y2] = at(from + ((to - from) * (i + 1)) / steps);
    out.push(B('line', x1, y1, x2, y2, t));
  }
  return out;
}

/** A gear: a disc, `teeth` square teeth round it, and a hub recess. */
function gear(x: number, y: number, r: number, teeth: number, phase = 0): ObjPart[] {
  const out: ObjPart[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = phase + (360 / teeth) * i;
    const rad = (a * Math.PI) / 180;
    out.push(R('mass', x + Math.cos(rad) * r, y + Math.sin(rad) * r, r * 0.42, r * 0.42, a, 1.2));
  }
  out.push(E('face', x + r * 0.08, y + r * 0.08, r * 2, r * 2));
  out.push(E('mass', x - r * 0.05, y - r * 0.05, r * 1.86, r * 1.86));
  out.push(E('dark', x, y, r * 0.62, r * 0.62));
  return out;
}

/** The shelf every still life stands on, in the design box. The renderer lays it first,
 * flat and unoutlined, in the scene's ground tone: a ledge, not an object. */
export const GROUND_SLAB = { x: 50, y: 93, w: 92, h: 7, rad: 3 } as const;

/** One drawing: its objects back to front, and where its one ember spark sits. */
export interface Scene {
  layers: readonly (readonly ObjPart[])[];
  /** The spark — the one small ember mark every tab icon carries. */
  spark: { x: number; y: number; s: number };
}

// ── PHILOSOPHY ──────────────────────────────────────────────────────────────
// REFERENCE: a classical marble bust — a socle, a truncated chest wider than the head,
// a short neck, and a head of curls; and an open book lying in front of it.
const PHILOSOPHY: Scene = {
  layers: [
    [
      // Shade is a CRESCENT, not a patch: the body drawn once in shade, nudged down
      // and right, and again lit, nudged up and left — so the lamp (top-left) leaves a
      // clean dark edge on the far side. A dark blob inside the shape read as a bruise.
      R('face', 63, 86, 34, 7, 0, 2),                     // the socle's foot
      R('mass', 63, 79, 24, 8, 0, 1.5),                   // the socle
      R('mass', 63, 55, 13, 12),                          // the neck
      E('face', 66, 69, 46, 22), E('mass', 61.5, 67.5, 42, 19), // the chest, cut off below
      E('face', 65, 39, 29, 34), E('mass', 62, 37, 26, 31),     // the head
      E('face', 63, 25, 30, 13),                          // the curls: a cap…
      E('face', 52, 29, 11, 10), E('face', 63, 21, 13, 10), E('face', 74, 29, 11, 10), // …scalloped
    ],
    [
      R('face', 29, 87, 44, 7, 0, 2),                     // the cover, under the pages
      R('mass', 19, 81, 22, 11, -8, 1.5),                 // the left leaf
      R('mass', 39, 81, 22, 11, 8, 1.5),                  // the right leaf
      B('line', 29, 77, 29, 87, 1.4),                     // the gutter
      B('line', 13, 80, 25, 78.5, 1), B('line', 14, 83.5, 25, 82, 1),
      B('line', 33, 78.5, 45, 80, 1), B('line', 33, 82, 44, 83.5, 1),
    ],
  ],
  spark: { x: 89, y: 14, s: 7 },
};

// ── PSYCHOLOGY ──────────────────────────────────────────────────────────────
// REFERENCE: a head in profile (forehead, nose, chin, the skull's round back) on a
// neck and shoulders; and a THOUGHT bubble — one cloud with a scalloped edge and a
// trail of smaller discs leading back to the head.
const PSYCHOLOGY: Scene = {
  layers: [
    [
      E('face', 37, 92, 50, 14), E('mass', 33, 90.5, 46, 12), // the shoulders
      B('mass', 38, 70, 34, 86, 15),                      // the neck, leaning back
      E('face', 34, 45, 46, 44), E('mass', 31, 42.5, 43, 41), // the skull, shaded far side
      E('mass', 49, 56, 16, 20),                          // the brow and cheek, forward of the skull
      T('mass', 59, 53, 9, 9, 'right'),                   // the nose
      E('mass', 54, 62, 8, 6),                            // the lips
      E('mass', 50, 69, 14, 10),                          // the chin
      // The MIND inside it: a pale brain with its folds, which is what says psychology
      // rather than "a head". Marks, so it is not outlined — it sits IN the skull.
      E('lit', 31, 38, 30, 20), E('lit', 22, 44, 12, 11), E('lit', 40, 44, 14, 11),
      ...ring(28, 38, 6, 5, 1.2, 0, 180, 360, 10), ...ring(38, 39, 6, 5, 1.2, 0, 180, 360, 10),
      B('line', 31, 30, 31, 47, 1.2),
    ],
    [
      E('mass', 57, 38, 7, 7),                            // the trail
      E('mass', 63, 30, 10, 10),
    ],
    [
      E('mass', 76, 20, 36, 22),                          // the cloud
      E('mass', 63, 18, 16, 15), E('mass', 89, 16, 16, 15),
      E('mass', 71, 10, 17, 14), E('mass', 84, 26, 16, 12), E('mass', 67, 27, 15, 11),
      E('dark', 78, 27, 26, 5),                           // its underside
    ],
  ],
  spark: { x: 76, y: 18, s: 8 },
};

// ── PERSONAL GROWTH ─────────────────────────────────────────────────────────
// REFERENCE: a seedling — one stem and two opposed leaves, broad and pointed — and a
// flight of steps rising left to right, which is the icon for progress.
const PERSONAL_GROWTH: Scene = {
  layers: [
    [
      R('mass', 24, 82, 24, 16, 0, 1.5),                  // step one
      R('mass', 46, 75, 24, 30, 0, 1.5),                  // step two
      R('mass', 68, 68, 24, 44, 0, 1.5),                  // step three
      R('dark', 34, 82, 4, 16), R('dark', 56, 75, 4, 30), R('dark', 78, 68, 4, 44),
    ],
    [
      B('mass', 68, 46, 68, 22, 3.6),                     // the stem, from the top step
      E('mass', 59, 24, 18, 9, -28),                      // the leaves
      E('face', 78, 17, 18, 9, 28),
      B('line', 52, 28, 64, 21, 1), B('line', 72, 20, 84, 14, 1),
    ],
  ],
  spark: { x: 86, y: 34, s: 7 },
};

// ── BUSINESS ────────────────────────────────────────────────────────────────
// REFERENCE: a briefcase — a wide body with rounded corners, a flap seam across its
// upper third, a clasp on the seam and an arched handle — in front of a bar chart
// rising to the right with an arrow over it.
const BUSINESS: Scene = {
  layers: [
    [
      R('mass', 60, 62, 11, 36, 0, 1), R('mass', 73, 52, 11, 56, 0, 1), R('mass', 86, 42, 11, 76, 0, 1),
      R('dark', 64, 62, 3, 36), R('dark', 77, 52, 3, 56), R('dark', 90, 42, 3, 76),
    ],
    [B('line', 50, 38, 80, 16, 3), T('line', 82, 14, 9, 9, 'right', -36)],
    [
      B('mass', 26, 62, 26, 56, 3.6), B('mass', 26, 55, 44, 55, 3.6), B('mass', 44, 55, 44, 62, 3.6),
      R('mass', 35, 76, 52, 30, 0, 4),                    // the body
      R('face', 35, 83, 52, 16, 0, 4),                    // its lower half, in shade
      B('line', 10, 70, 60, 70, 1.4),                     // the flap seam
      R('lit', 35, 70, 9, 7, 0, 1.5),                     // the clasp
    ],
  ],
  spark: { x: 54, y: 22, s: 7 },
};

// ── ECONOMICS ───────────────────────────────────────────────────────────────
// REFERENCE: a stack of coins, each a short cylinder — an elliptical top over a band
// of edge — and beside it a price line climbing to a marked point.
function coin(x: number, y: number, top: boolean): ObjPart[] {
  const out: ObjPart[] = [E('face', x, y + 6, 38, 12), R('face', x, y + 3, 38, 6), E('mass', x, y, 38, 12)];
  if (top) out.push(E('dark', x, y, 26, 7));
  return out;
}
const ECONOMICS: Scene = {
  layers: [
    [
      B('mass', 50, 70, 62, 55, 4), B('mass', 62, 55, 72, 62, 4), B('mass', 72, 62, 88, 30, 4),
      E('mass', 88, 30, 10, 10),
    ],
    coin(32, 81, false), coin(32, 73, false), coin(32, 65, false), coin(32, 57, true),
  ],
  spark: { x: 88, y: 14, s: 7 },
};

// ── SCIENCE ─────────────────────────────────────────────────────────────────
// REFERENCE: an Erlenmeyer flask — a narrow neck with a lip, a conical body, a wide
// flat base, liquid filling the lower half; and an atom — a nucleus and electrons on
// orbits crossing at an angle.
const SCIENCE: Scene = {
  layers: [
    [...ring(72, 30, 22, 8, 1.8, 35), ...ring(72, 30, 22, 8, 1.8, -35)],
    [E('mass', 72, 30, 11, 11)],
    [E('mass', 90, 42, 6, 6), E('mass', 54, 18, 6, 6)],
    [
      R('mass', 36, 42, 18, 5, 0, 2),                     // the lip
      R('mass', 36, 52, 12, 18, 0, 1),                    // the neck
      ...trap('mass', 36, 74, 12, 44, 30),                // the cone
      R('mass', 36, 87, 44, 6, 0, 3),                     // the base
      ...trap('face', 36, 80, 30, 44, 14),                // the liquid
      E('lit', 30, 80, 4, 4), E('lit', 38, 76, 3, 3),     // bubbles
      B('lit', 27, 60, 22, 72, 2),                        // the glass's highlight
    ],
  ],
  spark: { x: 60, y: 44, s: 6 },
};

// ── HISTORY ─────────────────────────────────────────────────────────────────
// REFERENCE: a Doric column — abacus, echinus, a fluted shaft that narrows, a plinth —
// and a scroll unrolled between its two rollers, lines of writing on it.
const HISTORY: Scene = {
  layers: [
    [
      R('mass', 67, 87, 32, 6, 0, 1),                     // the plinth
      ...trap('mass', 67, 58, 18, 22, 52),                // the shaft, narrowing
      R('mass', 67, 30, 26, 5, 0, 1),                     // the echinus
      R('mass', 67, 24, 34, 7, 0, 1),                     // the abacus
      R('dark', 75, 58, 4, 50),                           // the far flank
      B('line', 62, 36, 62, 82, 1.2), B('line', 67, 36, 67, 82, 1.2), B('line', 72, 36, 72, 82, 1.2),
    ],
    [
      R('mass', 32, 76, 40, 17, 0, 1),                    // the sheet
      R('face', 12, 76, 7, 24, 0, 3), R('face', 52, 76, 7, 24, 0, 3),
      E('face', 12, 63, 5, 4), E('face', 12, 89, 5, 4), E('face', 52, 63, 5, 4), E('face', 52, 89, 5, 4),
      B('line', 20, 71, 44, 71, 1.4), B('line', 20, 76, 42, 76, 1.4), B('line', 20, 81, 38, 81, 1.4),
    ],
  ],
  spark: { x: 88, y: 16, s: 7 },
};

// ── THE SIX BRANCHES ────────────────────────────────────────────────────────

// METAPHYSICS — REFERENCE: a ringed planet; the ring passes behind the sphere at the
// top and in front of it at the bottom, which is what makes it read as a ring.
const METAPHYSICS: Scene = {
  layers: [
    [...ring(50, 46, 40, 10, 2.4, -14, 180, 360)],
    [E('face', 52.5, 48.5, 44, 44), E('mass', 49, 45, 39, 39)],
    [...ring(50, 46, 40, 10, 2.4, -14, 0, 180)],
    [E('mass', 16, 80, 12, 12), E('dark', 18, 82, 6, 6)],
  ],
  spark: { x: 84, y: 16, s: 7 },
};

// EPISTEMOLOGY — REFERENCE: an open eye (almond, iris, pupil, a catch-light) and a
// magnifying glass — a rimmed lens on a handle.
const EPISTEMOLOGY: Scene = {
  layers: [
    [
      E('mass', 44, 40, 66, 34),                          // the almond
      E('face', 44, 40, 28, 28),                          // the iris
      E('line', 44, 40, 11, 11),                          // the pupil
      E('lit', 39, 35, 6, 6),                             // the catch-light
      B('line', 12, 40, 26, 30, 1.6), B('line', 76, 40, 62, 30, 1.6),
    ],
    [B('mass', 80, 90, 70, 78, 6), E('mass', 64, 70, 24, 24), E('dark', 64, 70, 16, 16), ...ring(64, 70, 12, 12, 2.2)],
  ],
  spark: { x: 86, y: 18, s: 7 },
};

// LOGIC — REFERENCE: two meshed gears of different sizes, teeth interleaved.
const LOGIC: Scene = {
  layers: [gear(66, 38, 16, 8, 22), gear(38, 64, 21, 10, 0)],
  spark: { x: 86, y: 14, s: 7 },
};

// ETHICS — REFERENCE: a balance — a base, a central post with a finial, a beam, and a
// pan hanging from each end on converging chains.
const ETHICS: Scene = {
  layers: [
    [
      B('line', 18, 26, 10, 54, 1.4), B('line', 18, 26, 26, 54, 1.4),
      B('line', 82, 26, 74, 54, 1.4), B('line', 82, 26, 90, 54, 1.4),
    ],
    [
      R('mass', 50, 87, 34, 6, 0, 2), R('mass', 50, 82, 18, 5, 0, 1.5), // the base, stepped
      B('mass', 50, 82, 50, 22, 5),                       // the post
      B('mass', 18, 26, 82, 26, 4),                       // the beam
      E('mass', 50, 18, 10, 10),                          // the finial
      E('mass', 18, 56, 26, 9), E('mass', 82, 56, 26, 9), // the pans
      E('dark', 18, 58, 20, 4), E('dark', 82, 58, 20, 4),
    ],
  ],
  spark: { x: 88, y: 12, s: 6 },
};

// AESTHETICS — REFERENCE: a studio easel (two raked front legs, a back leg, a ledge)
// holding a canvas with a landscape painted on it.
const AESTHETICS: Scene = {
  layers: [
    [B('mass', 50, 28, 50, 88, 3)],
    [B('mass', 44, 28, 24, 90, 3.6), B('mass', 56, 28, 76, 90, 3.6), B('mass', 28, 67, 72, 67, 3.4)],
    [
      R('mass', 50, 42, 50, 40, 0, 1.5),                  // the canvas
      // The painting ON it — marks, kept inside the canvas (y 22…62), so they read as
      // paint and not as objects bulging out of the frame.
      R('dark', 50, 58.2, 47, 6.5), E('dark', 40, 55, 26, 9), E('dark', 60, 56, 24, 7),
      E('lit', 60, 34, 11, 11),                           // the painted sun
    ],
  ],
  spark: { x: 86, y: 16, s: 7 },
};

// POLITICAL PHILOSOPHY — REFERENCE: a speaker's podium (a lectern top over a panelled
// front) and a flag on a pole beside it.
const POLITICAL: Scene = {
  layers: [
    [B('mass', 74, 88, 74, 14, 3), T('face', 84, 22, 20, 16, 'right'), R('mass', 81, 22, 10, 16)],
    [
      R('mass', 36, 87, 34, 6, 0, 2),                     // the foot
      R('face', 38, 68, 13, 32), R('mass', 35, 68, 10, 32), // the post, shaded far side
      R('face', 37, 51, 48, 10, -9, 2), R('mass', 36, 49.5, 46, 8, -9, 2), // the slanted reading top
    ],
  ],
  spark: { x: 88, y: 40, s: 6 },
};

export type ArtKey =
  | 'philosophy' | 'psychology' | 'personal-growth' | 'business' | 'economics' | 'science' | 'history'
  | 'metaphysics' | 'epistemology' | 'logic' | 'ethics' | 'aesthetics' | 'political-philosophy';

export const ART: Record<ArtKey, Scene> = {
  philosophy: PHILOSOPHY, psychology: PSYCHOLOGY, 'personal-growth': PERSONAL_GROWTH,
  business: BUSINESS, economics: ECONOMICS, science: SCIENCE, history: HISTORY,
  metaphysics: METAPHYSICS, epistemology: EPISTEMOLOGY, logic: LOGIC, ethics: ETHICS,
  aesthetics: AESTHETICS, 'political-philosophy': POLITICAL,
};

/**
 * A scene laid into the LARGEST SQUARE inside w×h at (x, y) — never stretched. The
 * odd-one-out tiles learned this: fitting x and y independently squashes a drawing
 * four to one in a wide box.
 */
export function artIn(key: ArtKey, x: number, y: number, w: number, h: number): Scene {
  const size = Math.min(w, h);
  const s = size / 100;
  const ox = x + (w - size) / 2;
  const oy = y + (h - size) / 2;
  const P = (p: ObjPart): ObjPart => {
    if (p.k === 'bar') return { ...p, x1: ox + p.x1 * s, y1: oy + p.y1 * s, x2: ox + p.x2 * s, y2: oy + p.y2 * s, t: p.t * s };
    if (p.k === 'rect') return { ...p, x: ox + p.x * s, y: oy + p.y * s, w: p.w * s, h: p.h * s, rad: p.rad * s };
    return { ...p, x: ox + p.x * s, y: oy + p.y * s, w: p.w * s, h: p.h * s } as ObjPart;
  };
  const sc = ART[key];
  return {
    layers: sc.layers.map((l) => l.map(P)),
    spark: { x: ox + sc.spark.x * s, y: oy + sc.spark.y * s, s: sc.spark.s * s },
  };
}

/**
 * The tones a scene is struck in, from its hue. `mass` is the lit body, `face` the
 * hue itself, `dark` the hue toward ink, the tile a pale wash of it. Flat values, no gradient — the
 * light is in the one darker side, which is how the tab icons carry it (§7).
 */
export function sceneTones(hue: string) {
  return {
    tile: mix(hue, PAPER_LIT, 0.86),
    tileEdge: mix(hue, PAPER_LIT, 0.62),
    lit: mix(hue, PAPER_LIT, 0.5),
    shade: hue,
    deep: mix(hue, INK, 0.35),
    ink: INK,
    paper: PAPER_LIT,
    spark: EMBER,
    ground: mix(hue, PAPER_LIT, 0.7),
  };
}

export type SceneTones = ReturnType<typeof sceneTones>;

/** Role → fill, in the one place both the app and the sheet read. */
export function fillFor(role: Role, t: SceneTones): string {
  if (role === 'mass') return t.lit;
  if (role === 'face') return t.shade;
  if (role === 'dark') return t.deep;
  if (role === 'lit') return t.paper;
  return t.ink;
}

/** The outline weight, in design units of the 100-box. */
export const ART_LINE = 2.4;
