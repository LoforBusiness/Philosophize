// ─────────────────────────────────────────────────────────────────────────────
// THE SIX FRAMES — what a rank pin is SHAPED like, and why that RESETS.
//
// ── WHAT THIS FILE USED TO DO, AND WHY IT WAS THE WRONG ANSWER ──────────────
//
// It gave each of the eight ORDERS its own silhouette, escalating by accretion
// all the way up the ladder: disc → plate → hexagon → gem → shield → crested
// shield → winged → crowned. It answered the complaint it was written for ("the
// icons get prettier, and more complex") and it created two new ones, both of
// which the same reader then named:
//
//   "it only becomes actually complex when the user is really far along. I want
//    it to become complex when the user gets far on a certain colour, then the
//    colour resets and so does the complexity … also the ranks that do get more
//    complex, I don't like that design, looks like horns and then looks as if it
//    gains wings. I don't want this design at all."
//
// Both halves are right, and they are the same fault seen from two sides.
// Spreading ONE escalation over forty-eight ranks means thirty-six of them are
// somewhere in the dull middle of it: a reader at rank 12 could see that pins
// got grander later, and had nothing grander to reach in the next six months of
// reading. And an escalation with forty-eight rungs to fill has to keep adding
// LIMBS — shoulder spikes, wings, a coronet — long after the token itself has
// run out of edge to work. Horns and wings are what "keep adding" looks like.
//
// ── SO COMPLEXITY IS A CYCLE, AND COLOUR IS THE LADDER ──────────────────────
//
// The six frames below are keyed on the DEGREE — how far through its order a
// rank is — not on the order. Every order runs the same six, so:
//
//   · a reader always has a grander shape three ranks away, wherever they are;
//   · the reward for finishing an order is a NEW MATERIAL, which is the thing
//     constants/insignia.ts was built to escalate and the thing the reader said
//     they liked ("the colour palette … will look better");
//   · and no frame ever has to be the eighth step of anything, so none of them
//     needs a limb. The whole ladder is one worked token.
//
//   0  DISC      a plain circle. Cast, uncut: nothing but the mark.
//   1  HEX       six flats. The edge is cut for the first time.
//   2  PLATE     eight. Finer work on the same idea.
//   3  GEM       the flats are cut back into facets — six points, six valleys.
//   4  SCALLOP   the edge stops being straight at all: eight bowed lobes.
//   5  ROSETTE   twelve of them, the finest edge in the set, and a collar around
//                the whole thing. The capstone of its colour.
//
// ANGULAR, THEN CURVED, and that order is not a preference. The first draft ran
// disc · hex · plate · scallop · gem · rosette, and the contact sheet showed the
// fault at once: a scalloped pin followed by a faceted one and then a scalloped
// one again reads as the ladder changing its mind. Straight edges are worked
// into more straight edges, then into curved ones, then into finer curved ones —
// one direction, no doubling back.
//
// Read down a column of the contact sheet and it is one object being worked
// harder; read across a row and it is the same six struck in a better material.
//
// ── THE TWO DISCIPLINES THAT MAKE IT SURVIVE 44px ───────────────────────────
//
// EVERYTHING GROWS OUTWARD. `markScale` is flat (0.37–0.40 of the box) across
// all six while the drawn area grows by half again. A rank-6 pin is not a rank-1
// pin with a smaller glyph in it, and RankSeal's oldest warning — ornament "so
// busy that it fought the glyph it framed" — cannot recur, because nothing added
// here is inside the mark's room.
//
// NOTHING IS MADE OF TIPS. §19 wrote this down about a different mark: crossed
// swords behind a medal were "horns at 168px, mush at the 66px the badge grid
// actually draws", while "a laurel is a continuous curved mass, so being
// half-covered costs it nothing". A wing, a coronet and a sunburst are all the
// sword problem. A lobe, a facet and a collar are the laurel one.
//
// ── ZERO IMPORTS, for the reason rig.ts and tone.ts have zero imports ───────
//
// scripts/sheet-ranks.mjs renders all forty-eight pins in plain Node and writes
// a contact sheet, so they can be LOOKED at without a device (§21). That is how
// the wing died twice and the coronet once, and it is how the numbers below were
// settled.
//
// Geometry is a 100×100 viewBox centred on (50,50), y DOWN, and every path is
// emitted with absolute M/L/C/Z only — scripts/lib/rasterpath.mjs understands
// exactly that subset and no arcs at all.
// ─────────────────────────────────────────────────────────────────────────────

export type FrameName = 'disc' | 'hex' | 'plate' | 'gem' | 'scallop' | 'rosette';

/**
 * ONE PER DEGREE, plainest first — NOT one per order.
 *
 * The index is the rank's position inside its own order (`degreeOf` in
 * constants/insignia.ts), so this array is the same length as `DEGREES` and
 * scripts/check-ui.mjs asserts it. A frame list that fell out of step with the
 * degree count would leave one rung of every order unreachable, in every colour
 * at once.
 */
export const FRAMES: FrameName[] = ['disc', 'hex', 'plate', 'gem', 'scallop', 'rosette'];

/** The frame a rank's degree is struck in. Clamped, so an over-run stays legal. */
export function frameForDegree(degree: number): FrameName {
  const d = Math.floor(degree) || 0;
  return FRAMES[Math.max(0, Math.min(FRAMES.length - 1, d))];
}

/** How far inside the edge the inner rule is drawn. */
export const INNER = 5;

const CX = 50;
const CY = 50;

const n2 = (v: number) => String(Math.round(v * 100) / 100);
const pt = (x: number, y: number) => `${n2(x)} ${n2(y)}`;

// ── the primitives ──────────────────────────────────────────────────────────

/** A regular polygon, listed clockwise on screen (y is down). */
function poly(r: number, sides: number, rot: number): string {
  const p: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * 2 * Math.PI) / sides;
    p.push(pt(CX + r * Math.cos(a), CY + r * Math.sin(a)));
  }
  return `M${p.join(' L')} Z`;
}

/**
 * A notched polygon — `points` outer vertices with an inner vertex between each.
 *
 * A regular twelve-gon is the obvious way to say "more facets than an octagon"
 * and it is the wrong one: at 44px a twelve-sided regular polygon has no corner
 * the eye can find, so that rung would have read as the first — a disc. Notching
 * it puts the corners back. The outline still turns twelve times, but six of
 * those turns are RE-ENTRANT, and a re-entrant corner survives being small in a
 * way a 150° one does not.
 *
 * HOW DEEP IS THE WHOLE QUESTION, and the contact sheet answered it twice. At a
 * valley of 0.85 the notch does not even reach the flat it is cut into — a
 * hexagon's own edge dips to cos(30°) = 0.866 of its radius at the midpoint — so
 * the pin rendered as a slightly dented HEXAGON, which is the rung two below it
 * in a brighter colour. At 0.74 it is a SHERIFF'S STAR: six long spikes, which is
 * the family of shape this whole redesign exists to remove. 0.81 is a cut stone.
 */
function notched(r: number, inner: number, points: number, rot: number): string {
  const p: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points;
    const rr = i % 2 === 0 ? r : inner;
    p.push(pt(CX + rr * Math.cos(a), CY + rr * Math.sin(a)));
  }
  return `M${p.join(' L')} Z`;
}

/**
 * A CUSPED edge — `lobes` outward bows meeting at cusps on a smaller radius.
 *
 * This is the one primitive that is neither straight nor spiked, and it is what
 * lets the ladder go on getting finer after the polygons have run out without
 * turning into a fringe. Eight deep lobes read as scalloped; twelve shallow ones
 * read as milled, the way a coin's edge is.
 *
 * Each lobe is ONE cubic, and the control radius is solved rather than guessed:
 * a symmetric cubic's midpoint is (P0 + 3·P1 + 3·P2 + P3)/8, so projecting that
 * onto the lobe's own axis and setting it equal to `r` gives the radius the two
 * control points have to sit at. Nudging a control point by eye instead is how
 * a lobe ends up not quite reaching the radius its neighbours were measured at.
 */
function cusped(r: number, inner: number, lobes: number): string {
  const step = (2 * Math.PI) / lobes;
  // The control radius that makes the bow's midpoint land exactly on `r`.
  const rc = (8 * r - 2 * inner * Math.cos(step / 2)) / (6 * Math.cos(step / 6));
  const at = (rad: number, a: number) => pt(CX + rad * Math.cos(a), CY + rad * Math.sin(a));
  let d = `M${at(inner, -step / 2)}`;
  for (let i = 0; i < lobes; i++) {
    const a0 = -step / 2 + i * step;
    d += ` C${at(rc, a0 + step / 3)} ${at(rc, a0 + (2 * step) / 3)} ${at(inner, a0 + step)}`;
  }
  return `${d} Z`;
}

/** A circle as the four cubics every renderer draws one with. */
function circle(r: number): string {
  const k = 0.5523 * r;
  return (
    `M${pt(CX - r, CY)}` +
    ` C${pt(CX - r, CY - k)} ${pt(CX - k, CY - r)} ${pt(CX, CY - r)}` +
    ` C${pt(CX + k, CY - r)} ${pt(CX + r, CY - k)} ${pt(CX + r, CY)}` +
    ` C${pt(CX + r, CY + k)} ${pt(CX + k, CY + r)} ${pt(CX, CY + r)}` +
    ` C${pt(CX - k, CY + r)} ${pt(CX - r, CY + k)} ${pt(CX - r, CY)} Z`
  );
}

// ── the six ─────────────────────────────────────────────────────────────────

/**
 * How far each frame reaches, and how deep its cusps or notches cut.
 *
 * THE LADDER IS MEASURED BY AREA, NOT BY REACH, and check-ui measures it that
 * way for a reason this table makes plain: the hexagon reaches further than the
 * octagon above it (37 against 34.2 at the tile edge) because it spends its
 * reach on two points and leaves the rest of its slot empty. Reach punishes a
 * shape for being round, and the gem — which spends nearly a third of its
 * outline in the valleys between its points — would be punished hardest by it.
 * Ink on the page is what a reader actually compares, so the drawn areas are the
 * monotone series, and check-ui re-derives them: half again from bottom to top.
 */
const OUTER: Record<FrameName, number> = {
  disc: 33, hex: 37, plate: 37, gem: 41, scallop: 40.5, rosette: 42,
};

/**
 * How far outside its own edge the capstone's collar is struck.
 *
 * 5, and it started at 3.4, which is what it was when a collar was the sixth
 * step of an eight-frame ladder and nobody had drawn one at 44px. Count the
 * pixels: the rim is a 2.4-wide stroke ON the edge, so it reaches 1.2 units
 * out; the collar is 2 wide, so it reaches 1 unit in. At 3.4 that leaves 1.2
 * units of paper between two dark rings — half a pixel on a Profile pin, which
 * is not a gap, it is an edge that has got thicker. The top two frames gave up
 * a unit and a half of reach to pay for this, and the area ladder is unchanged
 * because area is not reach.
 */
export const COLLAR = -5;

/**
 * How far the valleys cut back, as a fraction of `OUTER`.
 *
 * THE GEM'S 0.74 IS THE ONE NUMBER HERE THAT WAS WRONG, and the contact sheet
 * is what said so. It was 0.85, which sounds like a deep bite and is not one: a
 * hexagon's own edge already dips to cos(30 deg) = 0.866 of its radius at the
 * midpoint, so notching to 0.85 cut the outline back by six tenths of a unit and
 * the fifth rung of every order rendered as a slightly dented HEXAGON — the
 * second rung, one colour brighter. A notch has to clear the flat it is cut into
 * before it is a notch at all.
 */
const VALLEY: Record<'gem' | 'scallop' | 'rosette', number> = {
  gem: 0.81, scallop: 0.85, rosette: 0.90,
};

/**
 * THE CORE, as a function of how far it is pulled in from its own edge.
 *
 * The same signature `SHAPE` in badgeShapes.ts uses, and for the same reason:
 * a rim is this path at m = 0 with the face at m = 1.7 laid over it, and the
 * inner rule is it again at m = INNER. A NEGATIVE m grows it, which is how the
 * capstone's outer collar is drawn without a second set of geometry.
 */
export const CORE: Record<FrameName, (m: number) => string> = {
  disc: (m) => circle(OUTER.disc - m),
  hex: (m) => poly(OUTER.hex - m, 6, 0),
  plate: (m) => poly(OUTER.plate - m, 8, Math.PI / 8),
  gem: (m) => notched(OUTER.gem - m, (OUTER.gem - m) * VALLEY.gem, 6, 0),
  scallop: (m) => cusped(OUTER.scallop - m, (OUTER.scallop - m) * VALLEY.scallop, 8),
  rosette: (m) => cusped(OUTER.rosette - m, (OUTER.rosette - m) * VALLEY.rosette, 12),
};

// ── what a renderer needs to know about a frame it has never seen ───────────

export interface FrameGeom {
  /** The core as a closed polyline starting at TOP CENTRE, clockwise. */
  outline: string;
  /** Its length, so a progress arc's dasharray is exact rather than estimated. */
  perimeter: number;
  /** Six points on the face for the finish's studs, in the order they appear. */
  studs: [number, number][];
  /** The mark's size, as a fraction of the pin's drawn box. */
  markScale: number;
  /** And how far above centre it sits. Zero here — every frame is centred. */
  markDy: number;
}

/**
 * THE MARK'S ROOM IS ALMOST FLAT ACROSS THE SIX, and that is the point.
 *
 * 0.40 down to 0.37 — an 8% spread over six frames whose drawn area grows by
 * 54%. Everything a rung gains it gains OUTSIDE the mark.
 */
const MARK: Record<FrameName, number> = {
  disc: 0.40, hex: 0.39, plate: 0.39, gem: 0.37, scallop: 0.38, rosette: 0.37,
};

/**
 * WHERE THE STUDS GO, as angles rather than vertices.
 *
 * They used to be the hexagon's own six corners, which cannot survive a frame
 * that is not a hexagon. Angles can: each pair is symmetric about the vertical,
 * so two studs, four studs and six studs are all balanced, and the pin never
 * looks knocked askew part-way through an order.
 *
 * Straight up and straight down are both deliberately empty — that is where a
 * progress arc opens and closes, and a stud sitting on the seam would read as
 * the arc having a defect.
 */
const STUD_ANGLES = [180, 0, 235, 305, 125, 55];

/** How far inside the edge a stud sits. */
const STUD_INSET = 6.5;

const CACHE = new Map<FrameName, FrameGeom>();

export function frameGeom(name: FrameName): FrameGeom {
  const hit = CACHE.get(name);
  if (hit) return hit;

  const ring = flatten(CORE[name](0));
  const start = topmost(ring);
  const rot = ring.slice(start).concat(ring.slice(0, start));

  let perimeter = 0;
  for (let i = 0; i < rot.length; i++) {
    const a = rot[i];
    const b = rot[(i + 1) % rot.length];
    perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }

  const studs = STUD_ANGLES.map((deg) => {
    const a = (deg * Math.PI) / 180;
    const r = Math.max(0, rayHit(rot, a) - STUD_INSET);
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as [number, number];
  });

  const geom: FrameGeom = {
    outline: `M${rot.map(([x, y]) => pt(x, y)).join(' L')} Z`,
    perimeter,
    studs,
    markScale: MARK[name],
    markDy: 0,
  };
  CACHE.set(name, geom);
  return geom;
}

/**
 * The area the frame actually covers, by the shoelace on its own flattened
 * outline. This is the ladder's monotone quantity — see the note on `OUTER`.
 */
export function frameArea(name: FrameName): number {
  const ring = flatten(CORE[name](0));
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** How far the frame reaches from centre, on the flattened outline. */
export function frameReach(name: FrameName, m = 0): number {
  return flatten(CORE[name](m)).reduce(
    (far, [x, y]) => Math.max(far, Math.hypot(x - CX, y - CY)), 0,
  );
}

// ── the small amount of maths the answers above need ────────────────────────

/**
 * Absolute M / L / C / Z into a point list. Not a general SVG parser and not
 * trying to be — it reads exactly what the builders above emit, which is the
 * same subset scripts/lib/rasterpath.mjs reads, for the same reason.
 */
function flatten(d: string, steps = 16): [number, number][] {
  const tok = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const out: [number, number][] = [];
  let i = 0, cmd = 'M', x = 0, y = 0;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[MLCZ]/.test(tok[i])) { cmd = tok[i]; i++; continue; }
    if (cmd === 'M' || cmd === 'L') {
      x = num(); y = num(); out.push([x, y]);
      if (cmd === 'M') cmd = 'L';
      continue;
    }
    if (cmd === 'C') {
      const a1 = num(), b1 = num(), a2 = num(), b2 = num(), ex = num(), ey = num();
      for (let s = 1; s <= steps; s++) {
        const u = s / steps, v = 1 - u;
        out.push([
          v * v * v * x + 3 * v * v * u * a1 + 3 * v * u * u * a2 + u * u * u * ex,
          v * v * v * y + 3 * v * v * u * b1 + 3 * v * u * u * b2 + u * u * u * ey,
        ]);
      }
      x = ex; y = ey;
      continue;
    }
    i++;
  }
  return out;
}

/** The index of the point nearest the top centre — where a progress arc starts. */
function topmost(ring: [number, number][]): number {
  let best = 0;
  let score = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const s = ring[i][1] * 3 + Math.abs(ring[i][0] - CX);
    if (s < score) { score = s; best = i; }
  }
  return best;
}

/** How far the outline is from the centre along a ray. */
function rayHit(ring: [number, number][], a: number): number {
  const dx = Math.cos(a), dy = Math.sin(a);
  let far = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((x1 - CX) * ey - (y1 - CY) * ex) / den;
    const u = ((x1 - CX) * dy - (y1 - CY) * dx) / den;
    if (t > 0 && u >= 0 && u <= 1 && t > far) far = t;
  }
  return far;
}
