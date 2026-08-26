// ─────────────────────────────────────────────────────────────────────────────
// FORTY-EIGHT PINS, NO TWO ALIKE — and why this is the third attempt.
//
// ── THE TWO FAILURES THIS ONE HAS TO ANSWER AT THE SAME TIME ────────────────
//
// FIRST it escalated once across the whole ladder, one silhouette per ORDER:
// disc → plate → hexagon → gem → shield → crested shield → winged → crowned.
// The reader: "it only becomes actually complex when the user is really far
// along … also the ranks that do get more complex, I don't like that design,
// looks like horns and then looks as if it gains wings."
//
// THEN it cycled six shapes inside every order, the same six each time. That
// fixed the pacing and broke something else, which the same reader named:
// "especially for the more complex ones for each colour, they are all the same,
// I want uniqueness … and for the really far ranks they must be extremely
// complex and look very good."
//
// Both notes are right and they do not conflict, which took a while to see.
// Cycling is about PACING — a reader should always have a grander pin within
// reach. Uniqueness is about VOCABULARY — the grand pin of the clay order and
// the grand pin of the aurum order must not be one drawing in two paints. The
// first two attempts each fixed one and broke the other, because both treated
// complexity as a single number.
//
// ── SO IT IS A SAWTOOTH THAT CLIMBS ─────────────────────────────────────────
//
// Complexity resets at every colour, and each reset lands higher than the last:
//
//        ▁▂▃▄▅▆   ▂▃▄▅▆▇   ▃▄▅▆▇█   ▄▅▆▇██   …
//         clay      iron     bronze    jade
//
// Every order runs the same six-STEP build — core, rule, studs, underplate,
// facets, collar — but each step is drawn in that order's own vocabulary, and
// the vocabulary gets richer as the ladder climbs. Clay's rung 6 is a plain disc
// with a square behind it. Aurum's rung 6 is a sixteen-lobe rosette on a
// counter-rotated sixteen-point star, cut into sixteen facets and ringed twice.
// Same six steps; nothing whatever in common to look at.
//
// ── WHAT MAKES ONE LOOK GOOD, WHICH IS THE OTHER HALF OF THE NOTE ───────────
//
// "The design just isn't cool looking." It was a flat polygon with one gradient
// across it, and three things fix that without adding a single limb:
//
//   THE UNDERPLATE — a counter-rotated shape behind the core, showing only in the
//   gaps between the core's points. It is the classic struck-badge move and it is
//   pure silhouette: legible at 44px, symmetric all the way round, and incapable
//   of becoming a horn, because it has no direction.
//
//   FACETS — the face is CUT rather than filled. Each wedge takes its own lift
//   from the angle between its own centre and the light, so a pin reads as a
//   struck object catching a lamp instead of as a coloured shape with a gradient
//   on it. This is the biggest single change to how they look, and it costs one
//   extra path per wedge.
//
//   A REAL BEVEL — the rim carries a bright arc on the lit side and a dark one on
//   the shaded side, rather than one flat outline all the way round.
//
// All three obey the rule the earlier versions were right about: EVERYTHING GROWS
// OUTWARD. `markScale` stays flat while the drawn area doubles, so a grand pin is
// never a plain pin with a smaller glyph in it.
//
// ── ZERO IMPORTS, for the reason rig.ts and tone.ts have zero imports ───────
//
// scripts/sheet-ranks.mjs renders all forty-eight in plain Node (§21). Every
// correction written up here was found there before it reached a phone.
//
// Geometry is a 100×100 viewBox centred on (50,50), y DOWN, absolute M/L/C/Z
// only — the subset scripts/lib/rasterpath.mjs reads, and no arcs at all.
// ─────────────────────────────────────────────────────────────────────────────

const CX = 50;
const CY = 50;

const n2 = (v: number) => String(Math.round(v * 100) / 100);
const pt = (x: number, y: number) => `${n2(x)} ${n2(y)}`;

/** How far inside the edge the inner rule is drawn. */
export const INNER = 5;
/** How far outside its own edge the capstone's collar is struck. */
export const COLLAR = -5;

// ── the primitives ──────────────────────────────────────────────────────────

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

/** A regular polygon, clockwise on screen (y is down). */
function poly(r: number, sides: number, rot: number): string {
  const p: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * 2 * Math.PI) / sides;
    p.push(pt(CX + r * Math.cos(a), CY + r * Math.sin(a)));
  }
  return `M${p.join(' L')} Z`;
}

/**
 * A notched polygon — `points` outer vertices with an inner one between each.
 *
 * HOW DEEP IS THE WHOLE QUESTION, and the contact sheet answered it twice. A
 * hexagon's own edge already dips to cos(30°) = 0.866 of its radius at the
 * midpoint, so a valley shallower than that does not clear the flat it is cut
 * into and the pin renders as a slightly dented hexagon. Go the other way, past
 * about 0.75 on six points, and it is a sheriff's star — long spikes, which is
 * the family of shape this redesign exists to remove. The more points there are
 * the deeper the valley may safely go, because each spike gets shorter.
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
 * The one primitive that is neither straight nor spiked, and what lets the
 * ladder keep getting finer after the polygons have run out without turning into
 * a fringe. The control radius is SOLVED rather than guessed: a symmetric cubic's
 * midpoint is (P0 + 3·P1 + 3·P2 + P3)/8, so projecting that onto the lobe's own
 * axis and setting it equal to `r` gives where the controls have to sit. Nudging
 * them by eye is how one lobe ends up not quite reaching the radius its
 * neighbours were measured at.
 */
function cusped(r: number, inner: number, lobes: number, rot = 0): string {
  const step = (2 * Math.PI) / lobes;
  const rc = (8 * r - 2 * inner * Math.cos(step / 2)) / (6 * Math.cos(step / 6));
  const at = (rad: number, a: number) => pt(CX + rad * Math.cos(a), CY + rad * Math.sin(a));
  let d = `M${at(inner, rot - step / 2)}`;
  for (let i = 0; i < lobes; i++) {
    const a0 = rot - step / 2 + i * step;
    d += ` C${at(rc, a0 + step / 3)} ${at(rc, a0 + (2 * step) / 3)} ${at(inner, a0 + step)}`;
  }
  return `${d} Z`;
}

// ── the eight vocabularies ──────────────────────────────────────────────────

export type Edge = 'round' | 'flat' | 'notch' | 'cusp';

export interface Vocab {
  /** The order's own name for its shape — for the contact sheet and the checks. */
  label: string;
  /** Outer feature count. 0 means a circle. */
  points: number;
  edge: Edge;
  /** How far the valleys cut back, as a fraction of the radius. */
  valley: number;
  /** How far the core reaches. */
  outer: number;
  /** The counter-rotated plate behind it. */
  under: { points: number; edge: Edge; reach: number; valley: number };
  /** How many wedges the face is cut into. */
  facets: number;
  /** The mark's room, as a fraction of the box. */
  mark: number;
}

/**
 * BOTTOM TO TOP, and every row differs from every other in at least three of the
 * six columns. That is what "uniqueness" means here, and `check:ui` measures it
 * on the DRAWINGS rather than on the numbers.
 *
 * The core counts climb 0 · 6 · 8 · 6 · 8 · 10 · 12 · 8, and the dips are
 * deliberate, because POINT COUNT IS NOT GRANDEUR. Jade drops from bronze's
 * eight flats to six NOTCHES: the edge changes character there, and a cut stone
 * with six deep facets is a richer object than an octagon with eight shallow
 * ones. Aurum drops all the way to eight lobes and puts a SIXTEEN-POINT BURST
 * behind them — the top of the ladder is the most layered pin, not the one with
 * the most edges. Sixteen lobes on the core was tried and read as a bottle cap.
 *
 * THE UNDERPLATE ALWAYS REACHES PAST THE CORE, by 4 units at clay and 11 at
 * aurum. The first draft had jade's plate at 37.5 behind a core of 40 — entirely
 * hidden, so three of that order's six rungs were identical. An underplate that
 * does not clear the core is not an underplate, it is a wasted path.
 */
export const VOCAB: Vocab[] = [
  { // CLAY — fired earth. A plain round token on a square plate: the floor.
    label: 'disc', points: 0, edge: 'round', valley: 1, outer: 32,
    under: { points: 4, edge: 'flat', reach: 39, valley: 1 }, facets: 6, mark: 0.40,
  },
  { // IRON — cold and hard. The edge is cut for the first time, over a triangle.
    label: 'hex', points: 6, edge: 'flat', valley: 1, outer: 35,
    under: { points: 3, edge: 'flat', reach: 43, valley: 1 }, facets: 6, mark: 0.39,
  },
  { // BRONZE — the first thing worth polishing. Finer work, and a cross behind.
    label: 'plate', points: 8, edge: 'flat', valley: 1, outer: 35.5,
    under: { points: 4, edge: 'notch', reach: 45, valley: 0.52 }, facets: 8, mark: 0.39,
  },
  { // JADE — the ladder turns precious and the edge stops being straight.
    label: 'gem', points: 6, edge: 'notch', valley: 0.79, outer: 38,
    under: { points: 6, edge: 'notch', reach: 45, valley: 0.60 }, facets: 6, mark: 0.37,
  },
  { // LAPIS — ground stone. Bowed lobes over an eight-point star.
    label: 'scallop', points: 8, edge: 'cusp', valley: 0.84, outer: 38,
    under: { points: 8, edge: 'notch', reach: 46, valley: 0.64 }, facets: 8, mark: 0.38,
  },
  { // CRIMSON — the dye a city went bankrupt over. Ten points over five.
    label: 'star', points: 10, edge: 'notch', valley: 0.78, outer: 39,
    under: { points: 5, edge: 'notch', reach: 47, valley: 0.50 }, facets: 10, mark: 0.36,
  },
  { // AMETHYST — a twelve-point star with twelve lobes flaring behind it.
    label: 'coronet', points: 12, edge: 'notch', valley: 0.80, outer: 39,
    under: { points: 12, edge: 'cusp', reach: 47, valley: 0.80 }, facets: 12, mark: 0.36,
  },
  { // AURUM — a jewel in a sunburst. There is nothing above it and it should
    //   look like it: a compact eight-lobe rosette sitting inside a
    //   sixteen-point burst, which is the most LAYERED object on the ladder
    //   rather than the one with the most edges. Sixteen lobes on the core was
    //   tried first and read as a bottle cap — past about twelve, more edges
    //   stop adding grandeur and start subtracting legibility.
    label: 'sunburst', points: 8, edge: 'cusp', valley: 0.82, outer: 36,
    under: { points: 16, edge: 'notch', reach: 47.5, valley: 0.68 }, facets: 8, mark: 0.37,
  },
];

/** One shape from an edge style. `m` pulls it in; a negative `m` grows it. */
function shape(edge: Edge, points: number, r: number, valley: number, rot: number): string {
  if (edge === 'round' || points < 3) return circle(r);
  if (edge === 'flat') return poly(r, points, rot);
  if (edge === 'notch') return notched(r, r * valley, points, rot);
  return cusped(r, r * valley, points, rot);
}

// ── the six steps, which are the same six in every order ────────────────────

/**
 * WHAT EACH RUNG ADDS. The steps never change; what they are drawn in does.
 *
 *   0  the core, plain
 *   1  + the inner rule
 *   2  + the facets — the face stops being filled and starts being CUT
 *   3  + the underplate, counter-rotated behind it
 *   4  + the studs
 *   5  + the collar, struck outside the edge
 *
 * FIVE ADDITIONS FOR FIVE RUNGS, one each, and that is the correction. The first
 * draft spent rungs 2, 3 and 4 on two studs, then four, then six — three steps of
 * the same quiet thing — and put the facets last but one. At 44px the result was
 * that rungs 0, 1 and 2 of every order were indistinguishable, which is the
 * pacing complaint again three ranks lower down. Facets are the loudest of the
 * five, so they come early; the studs are the quietest, so they arrive as one
 * step rather than three.
 */
export interface Build {
  rule: boolean;
  studs: number;
  under: boolean;
  facets: boolean;
  collar: boolean;
}

export function buildFor(degree: number): Build {
  const d = Math.max(0, Math.min(5, Math.floor(degree) || 0));
  return {
    rule: d >= 1,
    facets: d >= 2,
    under: d >= 3,
    studs: d >= 4 ? 6 : 0,
    collar: d >= 5,
  };
}

// ── one pin ─────────────────────────────────────────────────────────────────

export interface Facet {
  d: string;
  /** −1 (deepest shade) … +1 (brightest), from the angle to the light. */
  lift: number;
}

/**
 * HOW A FACET IS PAINTED, so the two renderers cannot drift apart.
 *
 * The material's OWN extremes, not white and black. The first draft laid pure
 * `#FFFFFF` over the lit wedges at 0.46 and every faceted pin came out visibly
 * desaturated — a jade gem went pale mint, a crimson star went pink, and the
 * middle rung of each order looked like a washed copy of the rung below it
 * rather than a richer one. White does not light a coloured surface, it removes
 * the colour from it. `lit` and `rim` are the same face's own ends, so the
 * wedges read as planes of one material catching a lamp at different angles,
 * which is what a cut stone actually is.
 */
export function facetPaint(lift: number): { end: 'lit' | 'rim'; opacity: number } {
  return { end: lift > 0 ? 'lit' : 'rim', opacity: Math.min(0.62, Math.abs(lift) * 0.62) };
}

export interface Pin {
  /** The core, as a function of how far it is pulled in from its own edge. */
  core: (m: number) => string;
  /** The counter-rotated plate behind it, or null below degree 3. */
  under: string | null;
  /** Wedges cut into the face. Empty below degree 4. */
  facets: Facet[];
  /** Six points on the face for the studs, in the order they are filled. */
  studs: [number, number][];
  /** The core flattened, starting at top centre, for the progress arc. */
  outline: string;
  perimeter: number;
  markScale: number;
  label: string;
  build: Build;
}

/**
 * THE LIGHT, and it is the one every struck thing in this app shares.
 *
 * tone.ts puts it top-left and never moves it; `LIGHT` there is an
 * objectBoundingBox gradient running (0,0) → (1,1). In polar terms that is a ray
 * pointing down-right, so a face is brightest where its own normal points back
 * up-LEFT — which is −135° in a y-down world.
 */
const LIGHT_ANGLE = (-135 * Math.PI) / 180;

/** A wedge from the centre out to two adjacent points of the outline. */
function wedge(a0: number, a1: number, rEdge: number, rTip: number): string {
  const P = (r: number, a: number) => pt(CX + r * Math.cos(a), CY + r * Math.sin(a));
  return `M${pt(CX, CY)} L${P(rEdge, a0)} L${P(rTip, (a0 + a1) / 2)} L${P(rEdge, a1)} Z`;
}

const CACHE = new Map<string, Pin>();

export function pinFor(orderIndex: number, degree: number): Pin {
  const oi = Math.max(0, Math.min(VOCAB.length - 1, Math.floor(orderIndex) || 0));
  const dg = Math.max(0, Math.min(5, Math.floor(degree) || 0));
  const key = `${oi}:${dg}`;
  const hit = CACHE.get(key);
  if (hit) return hit;

  const v = VOCAB[oi];
  const build = buildFor(dg);
  // A FLAT AT THE TOP on the polygons: a vertex straight up puts a point exactly
  // where the progress arc opens, and the arc then appears to start off-centre.
  const rot = v.edge === 'flat' && v.points >= 3 ? Math.PI / v.points : 0;
  const core = (m: number) => shape(v.edge, v.points, v.outer - m, v.valley, rot);

  // THE UNDERPLATE IS COUNTER-ROTATED BY HALF A STEP, which is the whole trick:
  // its points land in the core's valleys, so it reads as a ring of tips showing
  // through the gaps rather than as a second shape parked behind a first.
  const uStep = v.under.points >= 3 ? Math.PI / v.under.points : 0;
  const under = build.under
    ? shape(v.under.edge, v.under.points, v.under.reach, v.under.valley, rot + uStep)
    : null;

  const ring = flatten(core(0));
  const start = topmost(ring);
  const rotated = ring.slice(start).concat(ring.slice(0, start));

  let perimeter = 0;
  for (let i = 0; i < rotated.length; i++) {
    const a = rotated[i];
    const b = rotated[(i + 1) % rotated.length];
    perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }

  // ── the facets ────────────────────────────────────────────────────────────
  //
  // One wedge per outer feature, each lifted by how squarely it faces the lamp.
  // The cosine of the angle between the wedge's own centre and the light runs +1
  // to −1, and that IS the lift: the wedge pointing up-left is brightest, the one
  // opposite is deepest, everything between shades smoothly. Nothing is
  // hand-tuned, so a sixteen-facet pin lights identically to a six-facet one.
  const facets: Facet[] = [];
  if (build.facets && v.facets >= 3) {
    const step = (2 * Math.PI) / v.facets;
    const rEdge = v.edge === 'flat' || v.edge === 'round' ? v.outer * 0.94 : v.outer * v.valley;
    for (let i = 0; i < v.facets; i++) {
      const a0 = rot + i * step - step / 2;
      const a1 = a0 + step;
      facets.push({
        d: wedge(a0, a1, rEdge, v.outer * 0.97),
        lift: Math.cos((a0 + a1) / 2 - LIGHT_ANGLE),
      });
    }
  }

  // ── the studs ─────────────────────────────────────────────────────────────
  //
  // Angles rather than vertices, so two, four and six are all symmetric about the
  // vertical whatever the frame is. Straight up and straight down stay empty:
  // that is where the progress arc opens and closes, and a stud on the seam reads
  // as a fault in it.
  const STUD_ANGLES = [180, 0, 235, 305, 125, 55];
  const studs = STUD_ANGLES.map((deg) => {
    const a = (deg * Math.PI) / 180;
    const r = Math.max(0, rayHit(rotated, a) - 6.5);
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as [number, number];
  });

  const pin: Pin = {
    core, under, facets, studs,
    outline: `M${rotated.map(([x, y]) => pt(x, y)).join(' L')} Z`,
    perimeter,
    markScale: v.mark,
    label: v.label,
    build,
  };
  CACHE.set(key, pin);
  return pin;
}

/**
 * How much ink the pin puts on the page. The union of the core and whatever the
 * underplate shows past it — approximated, because the question this answers is
 * only ever "is this rung bigger than the one below it".
 */
export function pinArea(orderIndex: number, degree: number): number {
  const p = pinFor(orderIndex, degree);
  const area = (d: string) => {
    const ring = flatten(d);
    let a = 0;
    for (let i = 0; i < ring.length; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[(i + 1) % ring.length];
      a += x1 * y2 - x2 * y1;
    }
    return Math.abs(a) / 2;
  };
  const core = area(p.core(0));
  const under = p.under ? area(p.under) : 0;
  return Math.max(core, under) + Math.min(core, under) * 0.14;
}

/** How far the pin reaches from centre, underplate included. */
export function pinReach(orderIndex: number, degree: number, m = 0): number {
  const p = pinFor(orderIndex, degree);
  const far = (d: string) =>
    flatten(d).reduce((k, [x, y]) => Math.max(k, Math.hypot(x - CX, y - CY)), 0);
  return Math.max(far(p.core(m)), p.under ? far(p.under) : 0);
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

/** The index of the point nearest top centre — where a progress arc starts. */
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
