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
export const INNER: Record<1 | 2 | 3, number> = { 1: 0, 2: 7, 3: 9 };
