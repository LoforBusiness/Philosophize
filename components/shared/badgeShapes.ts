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

/**
 * A sword, pointing up, drawn about its own centreline at x.
 *
 * Deliberately plain — blade, guard, grip, pommel. The pair of these crossed
 * behind a medal is the tier-III flourish, and at the 28px a badge is drawn in a
 * grid anything more detailed turns to mud. What must survive that size is the
 * SILHOUETTE: a long thin blade and a wide crossguard.
 */
export function swordPaths(x: number, tipY: number, len: number) {
  const w = len * 0.055;          // blade half-width
  const guardY = tipY + len * 0.72;
  const guardW = len * 0.20;
  const gripEnd = tipY + len;
  return {
    blade: `M${x} ${tipY} L${x + w} ${tipY + len * 0.10} L${x + w} ${guardY} L${x - w} ${guardY} L${x - w} ${tipY + len * 0.10} Z`,
    guard: `M${x - guardW} ${guardY} L${x + guardW} ${guardY} L${x + guardW} ${guardY + len * 0.05} L${x - guardW} ${guardY + len * 0.05} Z`,
    grip: `M${x - w * 0.7} ${guardY + len * 0.05} L${x + w * 0.7} ${guardY + len * 0.05} L${x + w * 0.7} ${gripEnd} L${x - w * 0.7} ${gripEnd} Z`,
    pommel: { cx: x, cy: gripEnd + len * 0.035, r: len * 0.045 },
  };
}

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
 * A laurel sprig hugging one side of the medal — the alternative tier-III flourish.
 *
 * WHY THIS EXISTS BESIDE THE SWORDS. Crossed swords are the obvious heraldic
 * choice and they were tried first: at the size a badge is actually drawn the
 * medal covers the crossing, so all that shows is two pointed tips above and two
 * dark hilts below, which reads as ears rather than as weapons. A laurel is a
 * CONTINUOUS CURVED MASS rather than a thin straight line, so it survives being
 * half-covered — and a wreath is what a philosopher is crowned with, where a
 * sword belongs to somebody else's app.
 *
 * `side` is -1 for the left sprig, +1 for the right. The stem is a quadratic arc
 * and the leaves are placed ALONG it by sampling the same curve, so a leaf can
 * never drift off its own branch.
 */
export function laurelSprig(side: -1 | 1, leaves = 7) {
  const x0 = 50 + side * 11, y0 = 90;   // at the foot, near the ribbon
  const cx = 50 + side * 47, cy = 62;   // bowing outward
  const x1 = 50 + side * 27, y1 = 20;   // tip, curling back in over the shoulder
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
  const leaf: { cx: number; cy: number; rx: number; ry: number; rot: number }[] = [];
  for (let i = 0; i < leaves; i++) {
    const t = 0.10 + (i / (leaves - 1)) * 0.82;
    const p = at(t);
    const ang = (Math.atan2(p.dy, p.dx) * 180) / Math.PI;
    // Leaves shrink toward the tip, which is what makes a sprig read as growing
    // rather than as a row of identical blobs.
    const k = 1 - 0.35 * (i / (leaves - 1));
    leaf.push({
      cx: p.x + side * 3.5 * k,
      cy: p.y,
      rx: 6.4 * k,
      ry: 2.9 * k,
      rot: ang + side * 34,
    });
  }
  return { stem: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, leaf };
}
