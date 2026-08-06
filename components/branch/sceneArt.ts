// ─────────────────────────────────────────────────────────────────────────────
// THE SCENERY, AS DRAWN SHAPES.
//
// ZERO IMPORTS, so every path can be rendered and looked at in plain Node before
// it reaches a device — which is how the previous attempt was caught being four
// grey triangles and a circle.
//
// ── WHY PATHS AND NOT PRIMITIVES ────────────────────────────────────────────
//
// The first pass built scenery out of React Native Views: a triangle for a peak,
// a circle on a stick for a tree. Views can only be rectangles, so every shape
// was a rectangle, a border-triangle or a circle — and the result read as clip
// art because those are the only three things it could say.
//
// What the reference art is actually made of is ONE BIG IRREGULAR SILHOUETTE per
// layer. A mountain range is not five triangles, it is a single jagged line
// across the whole width with peaks of different heights and shoulders that sag
// between them. A forest is not twelve trees, it is one mass with a spiky top
// edge. That is a PATH, and it is why this file exists.
//
// Drawn as inert <Path> under an animated parent (§17 rule 6): the surface is
// rasterised once and the parent translates it, so nothing re-uploads per frame.
//
// ── THE FOUR THINGS THAT MAKE IT READ ───────────────────────────────────────
//
//   1. IRREGULARITY. Peaks of varied height and width, never a repeated unit.
//   2. OVERLAP. Layers sit in front of one another with no gap between them, so
//      the eye reads occlusion as distance.
//   3. TONAL SEPARATION. A real gap between layers — the last attempt ran three
//      greys within 12% of each other and they fused into one wash.
//   4. A CROPPED FOREGROUND. Something huge and near, running off the top or the
//      side of the frame. It is most of what gives these images their depth, and
//      it was entirely missing.
//
// Coordinates are in a 1000-wide × 360-tall tile that repeats seamlessly: every
// generator starts and ends at the same height, so tiles butt together with no
// visible seam.
// ─────────────────────────────────────────────────────────────────────────────

export const TILE_W = 1000;
export const TILE_H = 360;

function rnd(n: number): number {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A MOUNTAIN RANGE — one jagged line, peaks of varied height, sagging shoulders.
 *
 * `base` is where the range meets the ground, `amp` the tallest peak above it.
 * The first and last points are pinned to the same height so tiles repeat.
 */
export function ridge(seed: number, base: number, amp: number, peaks = 7): string {
  const pts: [number, number][] = [[0, base - amp * 0.42]];
  for (let i = 1; i < peaks; i++) {
    const x = (TILE_W / peaks) * i + (rnd(seed + i) - 0.5) * (TILE_W / peaks) * 0.5;
    // Peaks alternate tall/short rather than being uniformly random: a range with
    // every summit the same height reads as a saw blade.
    const tall = i % 2 === 0 ? 0.62 + rnd(seed + i * 3) * 0.38 : 0.28 + rnd(seed + i * 5) * 0.34;
    pts.push([x, base - amp * tall]);
  }
  pts.push([TILE_W, base - amp * 0.42]);

  let d = `M0 ${TILE_H} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    // A saddle between two summits, pulled below the straight line so the range
    // has valleys instead of straight edges.
    const mx = (px + x) / 2;
    const my = Math.max(py, y) + amp * (0.10 + rnd(seed + i * 7) * 0.14);
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${TILE_H} Z`;
}

/**
 * A PINE TREELINE — one mass, spiky along the top, closed along the bottom.
 *
 * Each tree is a zigzag rather than a triangle: a fir's outline steps in and out
 * on the way up, and that stepping is what tells it apart from a mountain at the
 * same silhouette weight.
 */
export function treeline(seed: number, base: number, h: number, n = 26): string {
  let d = `M0 ${TILE_H} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const th = h * (0.55 + rnd(seed + i) * 0.75);
    const w = step * (0.42 + rnd(seed + i * 3) * 0.30);
    const tipX = x + step / 2;
    // up the left side in two steps, down the right in two — a fir, not a cone
    d += ` L${(tipX - w).toFixed(1)} ${(base - th * 0.30).toFixed(1)}`;
    d += ` L${(tipX - w * 0.45).toFixed(1)} ${(base - th * 0.34).toFixed(1)}`;
    d += ` L${(tipX - w * 0.62).toFixed(1)} ${(base - th * 0.68).toFixed(1)}`;
    d += ` L${(tipX - w * 0.24).toFixed(1)} ${(base - th * 0.70).toFixed(1)}`;
    d += ` L${tipX.toFixed(1)} ${(base - th).toFixed(1)}`;
    d += ` L${(tipX + w * 0.24).toFixed(1)} ${(base - th * 0.70).toFixed(1)}`;
    d += ` L${(tipX + w * 0.62).toFixed(1)} ${(base - th * 0.68).toFixed(1)}`;
    d += ` L${(tipX + w * 0.45).toFixed(1)} ${(base - th * 0.34).toFixed(1)}`;
    d += ` L${(tipX + w).toFixed(1)} ${(base - th * 0.30).toFixed(1)}`;
    d += ` L${(x + step).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${TILE_H} Z`;
}

/**
 * BROADLEAF WOOD — a rolling mass of overlapping crowns.
 *
 * Circles butted together read as bubbles; arcs that CUT INTO one another read as
 * foliage. Each crown is drawn as an arc whose ends sit inside its neighbours, so
 * the top edge is a series of overlapping bulges rather than a row of domes.
 */
export function wood(seed: number, base: number, h: number, n = 14): string {
  let d = `M0 ${TILE_H} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const r = step * (0.58 + rnd(seed + i) * 0.34);
    const top = base - h * (0.5 + rnd(seed + i * 5) * 0.7);
    d += ` Q${(x + step * 0.5).toFixed(1)} ${top.toFixed(1)} ${(x + step).toFixed(1)} ${(base - h * 0.12 * rnd(seed + i * 9)).toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${TILE_H} Z`;
}

/**
 * ROLLING HILLS — the quietest layer, for scenes that need air rather than mass.
 */
export function hills(seed: number, base: number, amp: number, n = 4): string {
  let d = `M0 ${TILE_H} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const top = base - amp * (0.4 + rnd(seed + i * 11) * 0.6);
    d += ` Q${(x + step * 0.5).toFixed(1)} ${top.toFixed(1)} ${(x + step).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${TILE_H} Z`;
}

/**
 * BROADLEAF CANOPY, replacing `wood`.
 *
 * `wood` was one quadratic per crown, which gives a row of even domes — bubbles,
 * which is exactly what it looked like. A real canopy is crowns of DIFFERENT
 * sizes overlapping at DIFFERENT heights, each lopsided, so this draws every
 * crown as three arcs whose ends sit inside its neighbours.
 */
export function canopy(seed: number, base: number, h: number, n = 11): string {
  let d = `M0 ${TILE_H} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const cx = i * step + step * (0.35 + rnd(seed + i) * 0.3);
    const r = step * (0.52 + rnd(seed + i * 3) * 0.42);
    const top = base - h * (0.45 + rnd(seed + i * 7) * 0.75);
    d += ` L${(cx - r).toFixed(1)} ${(base - h * 0.10).toFixed(1)}`;
    d += ` Q${(cx - r * 0.75).toFixed(1)} ${(top + h * 0.18).toFixed(1)} ${(cx - r * 0.30).toFixed(1)} ${top.toFixed(1)}`;
    d += ` Q${cx.toFixed(1)} ${(top - h * 0.10).toFixed(1)} ${(cx + r * 0.42).toFixed(1)} ${(top + h * 0.06).toFixed(1)}`;
    d += ` Q${(cx + r * 0.85).toFixed(1)} ${(top + h * 0.30).toFixed(1)} ${(cx + r).toFixed(1)} ${(base - h * 0.08).toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${base.toFixed(1)} L${TILE_W} ${TILE_H} Z`;
}

// ── HERO SILHOUETTES ────────────────────────────────────────────────────────
// Every reference image has a SUBJECT — a cabin, a windmill, an arch, a tower.
// Without one the eye has nothing to land on and a scene is wallpaper. One per
// tile on the mid layer, so it comes past about once a lesson.

export function cabin(x: number, base: number, w: number): string {
  const h = w * 0.62, r = w * 0.44;
  return `M${x - w / 2} ${base} L${x - w / 2} ${base - h} L${x - w * 0.58} ${base - h} `
    + `L${x} ${base - h - r} L${x + w * 0.58} ${base - h} L${x + w / 2} ${base - h} `
    + `L${x + w / 2} ${base} Z `
    + `M${x + w * 0.16} ${base - h - r * 0.55} L${x + w * 0.16} ${base - h - r * 1.15} `
    + `L${x + w * 0.30} ${base - h - r * 1.15} L${x + w * 0.30} ${base - h - r * 0.28} Z`;
}

export function windmill(x: number, base: number, h: number): string {
  const w = h * 0.17;
  let d = `M${x - w} ${base} L${x - w * 0.42} ${base - h} L${x + w * 0.42} ${base - h} L${x + w} ${base} Z`;
  const hy = base - h, s = h * 0.42;
  for (const a of [0.5, 2.07, 3.64, 5.21]) {
    const dx = Math.cos(a) * s, dy = Math.sin(a) * s;
    const px = -Math.sin(a) * s * 0.11, py = Math.cos(a) * s * 0.11;
    d += ` M${(x + px).toFixed(1)} ${(hy + py).toFixed(1)} L${(x + dx + px).toFixed(1)} ${(hy + dy + py).toFixed(1)} `
      + `L${(x + dx - px).toFixed(1)} ${(hy + dy - py).toFixed(1)} L${(x - px).toFixed(1)} ${(hy - py).toFixed(1)} Z`;
  }
  return d;
}

/** A rock arch — the Alto motif, and the only shape here with a hole in it. */
export function arch(x: number, base: number, w: number): string {
  const h = w * 0.86;
  return `M${x - w / 2} ${base} L${x - w / 2} ${base - h * 0.55} `
    + `Q${x} ${base - h * 1.5} ${x + w / 2} ${base - h * 0.55} L${x + w / 2} ${base} `
    + `L${x + w * 0.30} ${base} L${x + w * 0.30} ${base - h * 0.46} `
    + `Q${x} ${base - h * 0.98} ${x - w * 0.30} ${base - h * 0.46} L${x - w * 0.30} ${base} Z`;
}

export function tower(x: number, base: number, h: number): string {
  const w = h * 0.46;
  return `M${x - w * 0.10} ${base} L${x - w * 0.30} ${base - h * 0.62} L${x - w * 0.20} ${base - h * 0.62} L${x - w * 0.05} ${base} Z `
    + `M${x + w * 0.10} ${base} L${x + w * 0.30} ${base - h * 0.62} L${x + w * 0.20} ${base - h * 0.62} L${x + w * 0.05} ${base} Z `
    + `M${x - w * 0.5} ${base - h * 0.62} L${x + w * 0.5} ${base - h * 0.62} L${x + w * 0.5} ${base - h * 0.88} `
    + `L${x + w * 0.62} ${base - h * 0.88} L${x} ${base - h * 1.12} L${x - w * 0.62} ${base - h * 0.88} `
    + `L${x - w * 0.5} ${base - h * 0.88} Z`;
}

/**
 * THE CROPPED FOREGROUND — a trunk running off BOTH ends of frame with one bough.
 *
 * The first attempt floated a parallelogram in the sky: the bough was drawn above
 * the trunk's top and the shape never closed. Built from explicit corners now, so
 * it cannot come apart again. This is the single biggest thing separating the
 * reference images from a row of stripes — something huge and near, cut off.
 */
export function foreTrunk(side: -1 | 1): string {
  const x = side < 0 ? 52 : TILE_W - 52;
  const w = 30;
  const reach = side * 260;
  return `M${x - w} ${TILE_H + 20} L${x - w} -20 L${x + w} -20 L${x + w} ${TILE_H + 20} Z `
    + `M${x} 70 L${(x + reach).toFixed(0)} 34 L${(x + reach).toFixed(0)} 62 L${x} 104 Z`;
}

export function grass(seed: number, base: number, h: number, n = 60): string {
  let d = `M0 ${TILE_H} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const bh = h * (0.4 + rnd(seed + i * 17) * 1.0);
    d += ` L${(x + step * 0.35).toFixed(1)} ${(base - bh).toFixed(1)} L${(x + step * 0.7).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${TILE_H} Z`;
}

export type LayerArt = { d: string; tone: string; k: number };

/** A real tonal gap. The first ramp ran within 12% and the layers fused. */
export const TONES = ['#DFDCD4', '#BEB8AB', '#8C8679', '#575249', '#1A1A1A'];

/** Where the disc sits, per scene, as a fraction of the frame. */
export const DISC: Record<string, { x: number; y: number; r: number }> = {
  'the hills': { x: 0.24, y: 0.20, r: 54 },
  'deep forest': { x: 0.62, y: 0.14, r: 34 },
  'the moor': { x: 0.30, y: 0.26, r: 62 },
  'the ridge': { x: 0.70, y: 0.17, r: 44 },
  'the orchard': { x: 0.20, y: 0.19, r: 48 },
  'the pass': { x: 0.50, y: 0.22, r: 38 },
};

/**
 * The six places.
 *
 * EACH HAS ITS OWN HORIZON. The first version gave every layer the same base, so
 * six scenes came out as one stack of stripes at one set of heights. A moor is
 * mostly sky above a low line; a forest closes over you. That difference lives in
 * where each layer's base sits, not only in what stands on it.
 */
export function sceneLayers(name: string): LayerArt[] {
  const s = name.length * 17;
  switch (name) {
    case 'deep forest':
      return [
        { d: hills(s, 210, 54), tone: TONES[0], k: 0.10 },
        { d: treeline(s + 3, 250, 175, 20), tone: TONES[1], k: 0.26 },
        { d: treeline(s + 7, 300, 205, 15), tone: TONES[2], k: 0.48 },
        { d: cabin(620, 322, 118), tone: TONES[3], k: 0.48 },
        { d: grass(s + 5, 352, 24), tone: TONES[4], k: 1.32 },
      ];
    case 'the ridge':
      return [
        { d: ridge(s, 232, 168, 6), tone: TONES[0], k: 0.08 },
        { d: ridge(s + 5, 288, 128, 8), tone: TONES[1], k: 0.22 },
        { d: treeline(s + 9, 322, 74, 28), tone: TONES[2], k: 0.46 },
        { d: tower(300, 340, 118), tone: TONES[3], k: 0.46 },
        { d: grass(s + 2, 352, 26), tone: TONES[4], k: 1.30 },
      ];
    case 'the orchard':
      return [
        { d: hills(s, 268, 62), tone: TONES[0], k: 0.10 },
        { d: canopy(s + 4, 306, 118), tone: TONES[1], k: 0.26 },
        { d: canopy(s + 8, 330, 142, 8), tone: TONES[2], k: 0.50 },
        { d: windmill(760, 346, 150), tone: TONES[3], k: 0.50 },
        { d: grass(s + 6, 352, 22), tone: TONES[4], k: 1.28 },
      ];
    case 'the moor':
      return [
        { d: hills(s, 244, 74, 3), tone: TONES[0], k: 0.09 },
        { d: hills(s + 5, 302, 52, 5), tone: TONES[1], k: 0.24 },
        { d: hills(s + 11, 336, 34, 7), tone: TONES[2], k: 0.46 },
        { d: cabin(420, 348, 92), tone: TONES[3], k: 0.46 },
        { d: grass(s + 3, 352, 30), tone: TONES[4], k: 1.32 },
      ];
    case 'the pass':
      return [
        { d: ridge(s, 205, 190, 5), tone: TONES[1], k: 0.10 },
        { d: ridge(s + 6, 268, 158, 7), tone: TONES[2], k: 0.28 },
        { d: ridge(s + 13, 330, 88, 9), tone: TONES[3], k: 0.52 },
        { d: arch(520, 348, 200), tone: TONES[4], k: 0.52 },
        { d: grass(s + 9, 354, 20), tone: TONES[4], k: 1.38 },
      ];
    default: // 'the hills'
      return [
        { d: ridge(s, 246, 132, 6), tone: TONES[0], k: 0.09 },
        { d: hills(s + 4, 296, 74), tone: TONES[1], k: 0.25 },
        { d: treeline(s + 8, 328, 66, 22), tone: TONES[2], k: 0.48 },
        { d: cabin(700, 344, 100), tone: TONES[3], k: 0.48 },
        { d: grass(s + 1, 352, 24), tone: TONES[4], k: 1.30 },
      ];
  }
}

