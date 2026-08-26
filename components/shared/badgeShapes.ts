// ─────────────────────────────────────────────────────────────────────────────
// THE MEDAL GEOMETRY, AND NOTHING ELSE.
//
// ZERO IMPORTS, on purpose — the same reason `cinematic/rig.ts` has none. A file
// with no React and no react-native in it can be required by plain Node, which
// means the question "does the mark actually fit inside the shield's point?" is
// answerable by measuring rather than by looking at a screenshot and deciding it
// seems fine. See scripts/validate-badges.mjs.
//
// Everything is authored in one 100×100 box, and every outline is a FUNCTION of
// how far it is stepped in from the edge. That is what lets the tier-II inner
// rule and the tier-III hatch band be the same outline moved inward, instead of
// a second hand-drawn path that can drift out of register with the first.
// ─────────────────────────────────────────────────────────────────────────────

export type Family = 'lessons' | 'streak' | 'thinkers' | 'quotes' | 'xp' | 'mastery';

export const circlePath = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;

export const polygonPath = (cx: number, cy: number, r: number, n: number, rot: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
};

/** The six silhouettes, each as a function of its inset from the outer edge. */
export const SHAPE: Record<Family, (m: number) => string> = {
  // stele — a standing stone, arched at the top
  lessons: (m) => {
    const x0 = 14 + m, x1 = 86 - m, top = 8 + m, bot = 92 - m;
    const r = (x1 - x0) / 2;
    return `M${x0} ${bot} L${x0} ${top + r} A${r} ${r} 0 0 1 ${x1} ${top + r} L${x1} ${bot} Z`;
  },
  // pennant — a flag, swallow-tailed
  streak: (m) => {
    const x0 = 16 + m, x1 = 84 - m, top = 8 + m, bot = 92 - m, notch = 16 - m * 0.5;
    return `M${x0} ${top} L${x1} ${top} L${x1} ${bot} L50 ${bot - notch} L${x0} ${bot} Z`;
  },
  // roundel — a portrait medal
  thinkers: (m) => circlePath(50, 50, 42 - m),
  // ex-libris — a book label, bottom corners clipped
  quotes: (m) => {
    const x0 = 13 + m, x1 = 87 - m, top = 11 + m, bot = 89 - m, cut = 13 - m * 0.4;
    return `M${x0} ${top} L${x1} ${top} L${x1} ${bot - cut} L${x1 - cut} ${bot} L${x0 + cut} ${bot} L${x0} ${bot - cut} Z`;
  },
  // struck coin — an octagon
  xp: (m) => polygonPath(50, 50, 43 - m, 8, -Math.PI / 8),
  // shield
  mastery: (m) => {
    const x0 = 14 + m, x1 = 86 - m, top = 10 + m, bot = 92 - m;
    const sh = top + 34;
    return `M${x0} ${top} L${x1} ${top} L${x1} ${sh} C${x1} ${bot - 14} 50 ${bot} 50 ${bot} C50 ${bot} ${x0} ${bot - 14} ${x0} ${sh} Z`;
  },
};

/**
 * The same six outlines as flattened POLYGONS, for measuring against.
 *
 * The renderer draws from the `d` strings above; this is the identical geometry
 * expressed as points so a checker can ask whether something is inside one. The
 * two are written side by side, from the same numbers, deliberately — a checker
 * that carried its own idea of where the shield's point sits would pass while
 * the shield it was checking had moved.
 */
export function outlinePoints(family: Family, m: number, n = 96): [number, number][] {
  const pts: [number, number][] = [];
  const push = (x: number, y: number) => pts.push([x, y]);

  if (family === 'thinkers') {
    const r = 42 - m;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      push(50 + r * Math.cos(a), 50 + r * Math.sin(a));
    }
    return pts;
  }
  if (family === 'xp') {
    const r = 43 - m;
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 8 + (i * 2 * Math.PI) / 8;
      push(50 + r * Math.cos(a), 50 + r * Math.sin(a));
    }
    return pts;
  }
  if (family === 'lessons') {
    const x0 = 14 + m, x1 = 86 - m, top = 8 + m, bot = 92 - m;
    const r = (x1 - x0) / 2, cy = top + r;
    push(x0, bot);
    // the arch, left round to right
    for (let i = 0; i <= 48; i++) {
      const a = Math.PI - (i / 48) * Math.PI;
      push(50 + r * Math.cos(a), cy - r * Math.sin(a));
    }
    push(x1, bot);
    return pts;
  }
  if (family === 'streak') {
    const x0 = 16 + m, x1 = 84 - m, top = 8 + m, bot = 92 - m, notch = 16 - m * 0.5;
    return [[x0, top], [x1, top], [x1, bot], [50, bot - notch], [x0, bot]];
  }
  if (family === 'quotes') {
    const x0 = 13 + m, x1 = 87 - m, top = 11 + m, bot = 89 - m, cut = 13 - m * 0.4;
    return [
      [x0, top], [x1, top], [x1, bot - cut], [x1 - cut, bot], [x0 + cut, bot], [x0, bot - cut],
    ];
  }
  // mastery — flatten the two cubics that make the point
  const x0 = 14 + m, x1 = 86 - m, top = 10 + m, bot = 92 - m;
  const sh = top + 34;
  const bez = (p0: number[], p1: number[], p2: number[], p3: number[]) => {
    for (let i = 1; i <= 24; i++) {
      const t = i / 24, u = 1 - t;
      push(
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      );
    }
  };
  push(x0, top); push(x1, top); push(x1, sh);
  bez([x1, sh], [x1, bot - 14], [50, bot], [50, bot]);
  bez([50, bot], [50, bot], [x0, bot - 14], [x0, sh]);
  return pts;
}

/** Outline length + ~6% slack. Undershooting leaves a stub visible at draw 0. */
export const LEN: Record<Family, number> = {
  lessons: 298, streak: 330, thinkers: 280, quotes: 306, xp: 279, mastery: 276,
};

/**
 * The mark's side, as a fraction of the medal.
 *
 * The round shapes started at 0.44 because they LOOK like they have the most
 * room, and they have the least: a circle's tightest point against a square mark
 * is the corner, and the tier-III hatch band then takes another 9 units off the
 * radius. Measured, the octagon left 0.3 units between the mark and its own inner
 * rule — they were touching. Every number here is now set so the worst corner of
 * the mark clears the rule by 3, which is a stroke of daylight either side.
 * scripts/validate-badges.mjs holds the derivation and fails the build on it.
 */
export const GLYPH_SCALE: Record<Family, number> = {
  lessons: 0.40, streak: 0.38, thinkers: 0.41, quotes: 0.40, xp: 0.39, mastery: 0.35,
};

/** The pennant's notch and the shield's point pull their mark off centre. */
export const GLYPH_DY: Record<Family, number> = {
  lessons: 0.02, streak: -0.05, thinkers: 0, quotes: 0, xp: 0, mastery: -0.04,
};

/**
 * HOW FAR OUTSIDE THE EDGE THE TOP TIER'S COLLAR SITS.
 *
 * Negative, because every `SHAPE` above is a function of its inset and a
 * negative inset grows it — the same one-line trick `CORE` in rankShapes.ts uses
 * for the sixth degree of a rank pin, and deliberately the same GESTURE too. A
 * reader who has learnt that a ring around a pin means "as far as this material
 * goes" should not have to learn a second vocabulary for the badge case.
 *
 * It is drawn inside the medal's own 0.74 transform, so 5 units here land as
 * about 3.7 on the page — which is roughly where the pin's collar sits as well.
 */
export const COLLAR = -5;

/** How far in the tier's inner rule sits. Tier I has none. */
// Tiers IV and V share tier III's inset deliberately. The inset is what the
// inner rule is drawn at, and validate-badges measures every mark against the
// tightest one — moving it for the two new tiers would re-open a geometry
// question that is already settled, to buy a difference nobody can see at 72px.
// What separates III, IV and V is MATERIAL and FURNITURE, not inset.
export const INNER: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 7, 3: 9, 4: 9, 5: 9 };

// ─────────────────────────────────────────────────────────────────────────────
// THE RANK PIN, AND THE HERALDIC FURNITURE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The rank pin: one flat-topped hexagon, every rank, the mark inside is what
 * changes. Twenty-five frames that each did something different would be a
 * collection of ornaments; one frame repeated is a SET, and a set is the thing
 * worth climbing.
 *
 * Flat top (vertices at 0°, 60°, …) rather than pointed, because a flat edge
 * gives the mark a horizon to sit on and stacks cleanly in a row.
 */
export const hexPath = (cx: number, cy: number, r: number) => polygonPath(cx, cy, r, 6, 0);

/**
 * A regular hexagon's perimeter is exactly 6r — its side equals its radius.
 *
 * Worth stating rather than measuring: this is the dasharray the rank's progress
 * arc runs against, and an approximation would leave the arc short of the corner
 * it is supposed to reach at 100%.
 */
export const hexPerimeter = (r: number) => 6 * r;

/** The pin's outer radius in the 100-box, and the inset of its inner rule. */
export const HEX_R = 44;
export const HEX_INNER = 5;

/**
 * A ribbon banner beneath a medal — the tier-II flourish.
 *
 * Three pieces, so it reads as a real ribbon rather than a rectangle: the band
 * itself with a swallow-tailed end, and a folded tab at each side that turns back
 * behind the medal. The fold is what stops it looking like a sticker.
 */
export function ribbonPaths(cy: number, halfW: number, h: number) {
  const x0 = 50 - halfW, x1 = 50 + halfW;
  const notch = h * 0.42;
  const fold = h * 0.55;
  return {
    // the folded tabs, drawn first so the band overlaps them
    tabL: `M${x0 + 2} ${cy - h / 2} L${x0 - 7} ${cy - h / 2 - fold * 0.5} L${x0 - 7} ${cy + h / 2 - fold * 0.2} L${x0 + 2} ${cy + h / 2} Z`,
    tabR: `M${x1 - 2} ${cy - h / 2} L${x1 + 7} ${cy - h / 2 - fold * 0.5} L${x1 + 7} ${cy + h / 2 - fold * 0.2} L${x1 - 2} ${cy + h / 2} Z`,
    // the band, swallow-tailed at both ends
    band: `M${x0} ${cy - h / 2} L${x1} ${cy - h / 2} L${x1 - notch} ${cy} L${x1} ${cy + h / 2} L${x0} ${cy + h / 2} L${x0 + notch} ${cy} Z`,
  };
}

// THE SWORDS ARE GONE, and this is the note that replaces them.
//
// `swordPaths` was kept here for a year as a one-line way back to the tier-III
// flourish that was tried first, on the grounds that the decision was worth
// being able to revisit. It is not any more. §19 recorded why they failed —
// "the medal covers the crossing, so all that shows is two tips above and two
// hilts below … horns at 168px, mush at the 66px the badge grid actually draws"
// — and the reader has since ruled on the entire family in as many words, about
// the rank pins: "looks like horns and then looks as if it gains wings. I don't
// want this design at all."
//
// A door nobody may walk through is not an option, it is a distraction. What
// survives from that episode is the rule, and it is in `laurelSprig` below: a
// flourish has to be a CONTINUOUS CURVED MASS, because half of it is always
// behind the medal.

/**
 * How much the medal shrinks to leave room for its flourish.
 *
 * THE SAME AT EVERY TIER, and that is the point. Scaling the medal down as the
 * tier rises would make a tier-III badge SMALLER than a tier-I one, which is
 * backwards; leaving tier I full-size and shrinking the others would make the
 * grid jump. So every medal is struck at 0.80 and the margin is simply empty at
 * tier I, carries a ribbon at II, and swords behind the ribbon at III.
 */
export const MEDAL_SCALE = 0.74;
/** Pulled up a touch, because the flourish hangs below and wants the room. */
export const MEDAL_DY = -6;


/**
 * A laurel sprig hugging one side of the medal — the tier-III flourish and, in
 * its `full` form, the tier-IV and V one.
 *
 * WHY A LAUREL AND NOT SWORDS. Crossed swords are the obvious heraldic choice
 * and they were tried first: at the size a badge is actually drawn the medal
 * covers the crossing, so all that shows is two pointed tips above and two dark
 * hilts below, which reads as ears rather than as weapons. A laurel is a
 * CONTINUOUS CURVED MASS rather than a thin straight line, so it survives being
 * half-covered — and a wreath is what a philosopher is crowned with, where a
 * sword belongs to somebody else's app.
 *
 * `side` is -1 for the left sprig, +1 for the right. The stem is a quadratic arc
 * and the leaves are placed ALONG it by sampling the same curve, so a leaf can
 * never drift off its own branch.
 *
 * ── AND THEN TIER IV CLOSED IT OVER THE CROWN, WHICH WAS THE SWORDS AGAIN ───
 *
 * The five badge tiers used to be three: I bare, II a ribbon, III a wreath — and
 * then IV and V were added and given no furniture at all, so the top three tiers
 * of the case were the same object in three metals. The answer at the time was
 * to CLOSE the wreath at IV: carry both stems on over the medal's crown, where
 * the tips almost meet. A laurel offered at III, a laurel worn at IV.
 *
 * It is a nice idea and it drew the exact failure the swords drew, for the exact
 * reason this comment already gives three paragraphs above. Closing the arc
 * means bending it INWARD, and inward is where the medal is. Measured against
 * all six silhouettes: EIGHT of the closed wreath's eighteen leaves were
 * entirely behind a medal, and the whole thing reached 34.7 units from the
 * centre where the OPEN one reaches 40.2. So tier IV wore a wreath that was
 * smaller than tier III's and mostly invisible, and what a reader could actually
 * see of it was two leaf tips poking over the crown — horns, one more time. They
 * said so: "for the red badges … those white things on the side to be out more
 * instead of behind, like what the green badge looks like".
 *
 * ── SO THE STEP UP IS OUTWARD, NOT INWARD ───────────────────────────────────
 *
 * `full` is the same gesture as `open`, grown: it bows further out, climbs past
 * the medal's shoulder to the height of its crown, carries nine leaves instead
 * of seven, and each leaf is bigger. Berries fill the stem between them, which
 * is what a laurel in fruit looks like and what the plain sprig has no room for.
 *
 * Measured the same way, and scripts/validate-badges.mjs §4 re-derives all of it
 * on every run: TWENTY-SIX marks against the open sprig's fourteen, 45.5 units of
 * reach against 40.2, a top edge at y 11.8 against 22.6, and NOT ONE of them
 * behind a medal on any of the six families. It is unambiguously the bigger
 * object at a glance, which is the whole job: "make the red badges a bit more
 * complex too signifying they are better than the green ones."
 *
 * THE RULE UNDER BOTH EPISODES, and it is the third time this file has paid for
 * it: a flourish only counts if it is OUTSIDE the medal. Anything drawn behind
 * the medal is not subtle, it is absent — and the part that does show is a
 * fragment, which reads as a fault rather than as furniture. scripts/
 * sheet-badges.mjs is what shows this, and it is where both were caught.
 */
export type LaurelKind = 'open' | 'full';

interface Sprig {
  /** How far the foot sits from the centre, and how low. */
  x0: number; y0: number;
  /** The control point — how far the branch bows out, and at what height. */
  cx: number; cy: number;
  /** The tip. */
  x1: number; y1: number;
  /** Leaf count, where they start and stop along the curve, and how they shrink. */
  n: number; t0: number; span: number; taper: number;
  /** Leaf size and how far it sits off its own branch. */
  rx: number; ry: number; off: number;
  /** Berries between the leaves. `full` only. */
  berries: number;
}

const SPRIG: Record<LaurelKind, Sprig> = {
  open: {
    x0: 11, y0: 90, cx: 47, cy: 62, x1: 27, y1: 20,
    n: 7, t0: 0.10, span: 0.82, taper: 0.35, rx: 6.4, ry: 2.9, off: 3.5, berries: 0,
  },
  full: {
    // Every number here is larger than its `open` counterpart except the taper,
    // which is gentler so the leaves stay big further up the branch. The tip at
    // (±28, 13) is the one that was tuned rather than chosen: at ±24 the topmost
    // leaf grazes the ex-libris's flat top by 1.4 units, and at ±30 the whole
    // sprig reaches 46 of the 48 the 100-box allows. 28 clears by 5 and reaches
    // 45.4, which is room at both ends.
    x0: 13, y0: 90, cx: 55, cy: 57, x1: 28, y1: 13,
    n: 9, t0: 0.08, span: 0.88, taper: 0.32, rx: 6.9, ry: 3.2, off: 3.5, berries: 4,
  },
};

export function laurelSprig(side: -1 | 1, kind: LaurelKind = 'open') {
  const s = SPRIG[kind];
  const x0 = 50 + side * s.x0, y0 = s.y0;
  const cx = 50 + side * s.cx, cy = s.cy;
  const x1 = 50 + side * s.x1, y1 = s.y1;
  const at = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * cx + t * t * x1,
      y: u * u * y0 + 2 * u * t * cy + t * t * y1,
      // derivative, for the leaf's angle — a leaf sits ACROSS the branch
      dx: 2 * u * (cx - x0) + 2 * t * (x1 - cx),
      dy: 2 * u * (cy - y0) + 2 * t * (y1 - cy),
    };
  };
  const size = (i: number) => 1 - s.taper * (i / (s.n - 1));
  const leaf: { cx: number; cy: number; rx: number; ry: number; rot: number }[] = [];
  for (let i = 0; i < s.n; i++) {
    const t = s.t0 + (i / (s.n - 1)) * s.span;
    const p = at(t);
    const ang = (Math.atan2(p.dy, p.dx) * 180) / Math.PI;
    // Leaves shrink toward the tip, which is what makes a sprig read as growing
    // rather than as a row of identical blobs.
    const k = size(i);
    leaf.push({
      cx: p.x + side * s.off * k,
      cy: p.y,
      rx: s.rx * k,
      ry: s.ry * k,
      rot: ang + side * 34,
    });
  }
  // IN THE NOTCHES BETWEEN THE LEAVES, not on the branch. On the branch is where
  // a real laurel carries them and it is the one place they cannot be seen: the
  // stem is stroked in the same ink the berry is filled with, so the first pass
  // drew eight of them and rendered nothing. Set out level with the leaves they
  // land on paper, in the scallops the leaf chain leaves along its outer edge —
  // and they cost the silhouette nothing, because a leaf already reaches further
  // out than this from the same point on the branch.
  const berry: { cx: number; cy: number; r: number }[] = [];
  for (let i = 0; i < s.berries; i++) {
    const j = 1 + i * 2;                       // between leaves 1-2, 3-4, 5-6, 7-8
    const t = s.t0 + ((j + 0.5) / (s.n - 1)) * s.span;
    const p = at(t);
    const k = size(j);
    berry.push({ cx: p.x + side * (s.off + 3.4) * k, cy: p.y, r: 2.3 * k });
  }
  return { stem: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, leaf, berry };
}
