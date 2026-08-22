// ─────────────────────────────────────────────────────────────────────────────
// THE EIGHT FRAMES — what a rank pin is SHAPED like, and why that changes.
//
// A reader, holding the coloured ladder that constants/insignia.ts had just
// given them: "the rank icons are better, but they don't improve in look. This
// is what I mean by the improvement in ranks — the icons get prettier, and more
// complex."
//
// They were right and the reason is written into RankSeal's own header, which
// said the frame does NOT escalate by tier: "a pin is ONE frame, repeated
// exactly, with the mark inside doing all the distinguishing." That is a good
// rule for a SET — forty siblings — and the wrong rule for a LADDER, where the
// whole point is that the top is worth climbing to. Colour alone cannot say it:
// a jade hexagon and a clay hexagon are the same object in two paints, and
// paint is not an achievement.
//
// So the silhouette now changes every order, and it changes by ACCRETION —
// each frame is the one below it plus one thing:
//
//   CLAY      disc       a plain circle. The floor: nothing but the mark.
//   IRON      plate      eight flat facets. The edge is cut for the first time.
//   BRONZE    hex        six bolder ones. Fewer, larger, deliberate.
//   JADE      facet      the hexagon notched into twelve points — a cut stone.
//   LAPIS     shield     the silhouette gains a POINT and a peak. It is no
//                        longer a token; it is armour, and it has a top.
//   CRIMSON   crest      + two shoulder spikes. It is worn into an argument.
//   AMETHYST  winged     + a pair of wings. The first frame wider than it is tall.
//   AURUM     imperial   + a crown and a ray halo. There is nothing left to add.
//
// ── THE ONE DISCIPLINE THAT MAKES IT SURVIVE 50px ───────────────────────────
//
// RankSeal's header also records what happened the FIRST time ornament
// escalated here: "so busy at 54px that it fought the glyph it framed". That
// verdict stands, and the fix is not restraint, it is DIRECTION —
//
//   EVERYTHING ADDED GROWS OUTWARD. The mark's room is `markScale`, and it is
//   flat across all eight frames (0.36–0.40 of the box). A crown, a wing, a
//   spike and a ray all live in the margin the low frames simply leave empty:
//   the disc is 66 units across in a 100-unit box, the imperial is 96. The
//   ladder grows into its own frame rather than crowding its mark.
//
// That is also why the footprint escalation is legible at any size — a reader
// comparing two pins side by side sees one fill more of its slot, which no
// amount of detail can say at 50px.
//
// ── ZERO IMPORTS, for the reason rig.ts and tone.ts have zero imports ───────
//
// scripts/sheet-ranks.mjs renders every frame in every order in plain Node and
// writes a contact sheet, so all forty-eight pins can be LOOKED at without a
// device (§21). Everything below that is written as a correction was found
// there, before any of it reached a phone: two wings that were not wings, a halo
// painted in a tone that happens to be white on the one order that has it, and a
// coronet that vanished into the halo behind it. None of those is a defect a
// number could have caught, and every number was already green.
//
// Geometry is a 100×100 viewBox centred on (50,50), y DOWN, and every path is
// emitted with absolute M/L/C/Z only — scripts/lib/rasterpath.mjs understands
// exactly that subset and no arcs at all.
// ─────────────────────────────────────────────────────────────────────────────

export type FrameName =
  | 'disc' | 'plate' | 'hex' | 'facet' | 'shield' | 'crest' | 'winged' | 'imperial';

/**
 * Bottom of the ladder to the top, ONE PER ORDER.
 *
 * The index lines up with `ORDERS` in constants/insignia.ts, and
 * scripts/check-ui.mjs asserts the two arrays are the same length — a frame
 * list that falls out of step with the order list would silently strike a whole
 * order in the wrong shape.
 */
export const FRAMES: FrameName[] = [
  'disc', 'plate', 'hex', 'facet', 'shield', 'crest', 'winged', 'imperial',
];

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
 * A regular twelve-gon is the obvious way to say "more facets than a hexagon"
 * and it is the wrong one: at 50px a twelve-sided regular polygon has no corner
 * the eye can find, so the fourth rung of the ladder would have read as the
 * first — a disc. Notching it puts the corners back. The outline still turns
 * twelve times, but six of those turns are RE-ENTRANT, and a re-entrant corner
 * survives being small in a way a 150° one does not.
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

/**
 * The shield family, authored once at k = 1 and scaled about the centre.
 *
 * `spikes` raises the two top corners into points and is the whole difference
 * between LAPIS and CRIMSON. The top edge carries a shallow peak either way:
 * a flat-topped heater shield reads as a tombstone, and the peak is what makes
 * it read as something with a front.
 */
function shieldish(k: number, spikes: boolean): string {
  const P = (x: number, y: number) => pt(CX + (x - CX) * k, CY + (y - CY) * k);
  const top = spikes
    ? `M${P(16, 22)} L${P(7, 11)} L${P(27, 17)} L${P(50, 10)} L${P(73, 17)} L${P(93, 11)} L${P(84, 22)}`
    : `M${P(16, 17)} L${P(50, 12)} L${P(84, 17)}`;
  return (
    `${top} L${P(84, 48)}` +
    ` C${P(84, 70)} ${P(68, 84)} ${P(50, 92)}` +
    ` C${P(32, 84)} ${P(16, 70)} ${P(16, 48)} Z`
  );
}

/**
 * One wing, springing from the shield's shoulder and swept back and up.
 *
 * THREE COVERTS, NOT A FEATHER FAN. The first attempt drew nine tapering
 * quills; at 50px they merged into a solid lobe with a fringe and the sheet's
 * verdict was written down as "a moustache". Three broad, overlapping coverts
 * survive being small, because each one is still several pixels deep when the
 * whole wing is twenty across.
 */
function wing(side: 1 | -1, m = 0): string {
  const k = (47 - m) / 47;                       // 47 = the wing's own reach
  const P = (x: number, y: number) =>
    pt(CX + (x - CX) * side * k, CY + (y - CY) * k);
  return (
    // The leading edge: one unbroken curve from a root hidden behind the shield,
    // sweeping UP and OUT. THE TIP HAS TO FINISH HIGHER THAN THE ROOT. The
    // second attempt at this ran level, out to the side, and read as a serrated
    // collar — a wing is a diagonal before it is anything else.
    `M${P(52, 54)}` +
    ` C${P(60, 30)} ${P(76, 13)} ${P(97, 14)}` +
    // …then the trailing edge back along the diagonal, four feathers deep. Each
    // notch cuts in about six units and NONE of them reaches back past the
    // leading edge — the first attempt let them, and what came out was not a
    // feathered wing but three loose petals with daylight between them.
    ` L${P(99, 27)} L${P(88, 23)}` +
    ` L${P(92, 37)} L${P(81, 33)}` +
    ` L${P(85, 48)} L${P(74, 44)}` +
    ` L${P(78, 60)} L${P(66, 54)}` +
    ` C${P(61, 55)} ${P(56, 55)} ${P(52, 54)} Z`
  );
}

/** Both wings, pulled in — the renderer lays this over a full-size copy in the
 *  rim tone, because a dark wing against a dark shield on pale paper is one mass
 *  unless something turns its edge. Same trick the coronet needs. */
export const wingsInset = (m: number) => `${wing(1, m)} ${wing(-1, m)}`;




/**
 * A three-point coronet, sitting on the crest's peak.
 *
 * Drawn as a function of its own inset so the renderer can lay a smaller copy
 * inside a larger one and get a rimmed crown out of two fills. It was a single
 * flat shape first, and on the contact sheet it vanished: a gold coronet on a
 * gold pin in front of gold rays is one continuous mass unless something turns
 * its edge.
 */
function crown(m: number): string {
  const P = (x: number, y: number) => {
    const k = (26 - m) / 26;                     // 26 = its own half-height
    return pt(CX + (x - CX) * k, 28 + (y - 28) * k);
  };
  return (
    `M${pt(30 + m, 24)} L${P(32, 6)} L${P(41, 15)} L${P(50, 2)}` +
    ` L${P(59, 15)} L${P(68, 6)} L${pt(70 - m, 24)} Z`
  );
}

/** The coronet pulled in, for the renderer to lay over the rimmed copy. */
export const crownInset = (m: number) => crown(m);

/**
 * The halo — sixteen tapered spikes, from under the shield out past its edge.
 *
 * It starts at r 34, well inside the frame that covers it, so the visible length
 * of every spike is decided by the silhouette in front of it rather than by a
 * radius: they are long past the shield's waist, short past its shoulders, and
 * absent behind its point. That is what makes a burst look like it is BEHIND
 * something instead of arranged around it.
 */
function rays(): string {
  const N = 16;
  const inner = 34;
  const outer = 49;
  const half = Math.PI / N / 2.3;
  const out: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i * 2 * Math.PI) / N + Math.PI / N;
    out.push(
      `M${pt(CX + inner * Math.cos(a - half), CY + inner * Math.sin(a - half))}` +
      ` L${pt(CX + outer * Math.cos(a), CY + outer * Math.sin(a))}` +
      ` L${pt(CX + inner * Math.cos(a + half), CY + inner * Math.sin(a + half))} Z`,
    );
  }
  return out.join(' ');
}


// ── the eight ───────────────────────────────────────────────────────────────

/**
 * How wide the frame's core reaches, and the radius its own author drew it at.
 *
 * `outer` is the escalation: 33 units for clay, 42 for crimson. `authored` is
 * only bookkeeping — the shield family is drawn once at full size and scaled,
 * so an inset of `m` has to become a scale factor of (outer − m) / authored.
 */
const OUTER: Record<FrameName, number> = {
  // PLATE IS 37 TO BE BIGGER THAN A 33-UNIT DISC, which is not the arithmetic
  // anyone expects. An octagon at this rotation presents its FLAT to the tile
  // edge, and the flat of a circumradius-35 octagon is 32.3 — narrower than the
  // disc below it on the ladder. check-ui caught it; a radius is not a footprint.
  disc: 33, plate: 37, hex: 37, facet: 39,
  // THE WINGED CORE IS SMALLER THAN THE CREST BELOW IT, on purpose. The footprint
  // still grows — the wings take it from 86 units of the tile to 94 — but the
  // shield has to step back or the wings are shoulder flaps. At 37 they stuck out
  // eleven units either side and read as flares; at 34 they stick out sixteen and
  // read as wings.
  shield: 40, crest: 43, winged: 34, imperial: 34,
};
const AUTHORED: Record<FrameName, number> = {
  disc: 33, plate: 37, hex: 37, facet: 39,
  shield: 40, crest: 43, winged: 43, imperial: 43,
};

/**
 * THE CORE, as a function of how far it is pulled in from its own edge.
 *
 * The same signature `SHAPE` in badgeShapes.ts uses, and for the same reason:
 * a rim is this path at m = 0 with the face at m = 1.4 laid over it, and the
 * inner rule is it again at m = INNER. A NEGATIVE m grows it, which is how the
 * capstone's outer collar is drawn without a second set of geometry.
 */
export const CORE: Record<FrameName, (m: number) => string> = {
  disc: (m) => circle(OUTER.disc - m),
  plate: (m) => poly(OUTER.plate - m, 8, Math.PI / 8),
  hex: (m) => poly(OUTER.hex - m, 6, 0),
  facet: (m) => notched(OUTER.facet - m, (OUTER.facet - m) * 0.79, 6, 0),
  shield: (m) => shieldish((OUTER.shield - m) / AUTHORED.shield, false),
  crest: (m) => shieldish((OUTER.crest - m) / AUTHORED.crest, true),
  winged: (m) => shieldish((OUTER.winged - m) / AUTHORED.winged, true),
  imperial: (m) => shieldish((OUTER.imperial - m) / AUTHORED.imperial, true),
};

/** Ornament that lives OUTSIDE the core, drawn behind it. Null for most frames. */
export interface Ornament {
  wings: string | null;
  crown: string | null;
  rays: string | null;
}

const NONE: Ornament = { wings: null, crown: null, rays: null };
const WINGS = wingsInset(0);

export const ORNAMENT: Record<FrameName, Ornament> = {
  disc: NONE, plate: NONE, hex: NONE, facet: NONE, shield: NONE, crest: NONE,
  winged: { wings: WINGS, crown: null, rays: null },
  imperial: { wings: WINGS, crown: crown(0), rays: rays() },
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
  /** And how far above centre it sits — a shield's mass is not in its middle. */
  markDy: number;
}

/**
 * THE MARK'S ROOM IS ALMOST FLAT ACROSS THE LADDER, and that is the point.
 *
 * 0.40 down to 0.36 — a 10% spread over eight frames that grow their footprint
 * by 45%. Everything the ladder gains it gains OUTSIDE the mark, so a
 * hierophant's pin is not a Grand Philosopher's pin with a smaller glyph in it.
 */
const MARK: Record<FrameName, [number, number]> = {
  disc: [0.40, 0],
  plate: [0.40, 0],
  hex: [0.39, 0],
  facet: [0.37, 0],
  shield: [0.37, -0.035],
  crest: [0.37, -0.025],
  winged: [0.36, -0.02],
  imperial: [0.36, -0.02],
};

/**
 * WHERE THE STUDS GO, as angles rather than vertices.
 *
 * They used to be the hexagon's own six corners, which cannot survive a frame
 * that is not a hexagon. Angles can: each pair is symmetric about the vertical,
 * so two studs, four studs and six studs are all balanced, and the pin never
 * looks knocked askew part-way through an order.
 *
 * Straight up and straight down are both deliberately empty. Down is where a
 * shield's point is and up is where its peak and its crown are — a stud there
 * would sit on the one part of the frame that is doing something else.
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

  const [markScale, markDy] = MARK[name];
  const geom: FrameGeom = {
    outline: `M${rot.map(([x, y]) => pt(x, y)).join(' L')} Z`,
    perimeter,
    studs,
    markScale,
    markDy,
  };
  CACHE.set(name, geom);
  return geom;
}

// ── the small amount of maths the two answers above need ────────────────────

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
