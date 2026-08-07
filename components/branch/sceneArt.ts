// ─────────────────────────────────────────────────────────────────────────────
// THE SCENERY, AS DRAWN SHAPES.
//
// ZERO IMPORTS, so every path can be rendered and looked at in plain Node before
// it reaches a device — which is how the first attempt was caught being four grey
// triangles and a circle.
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
// ── EVERY LAYER IS A BAND, AND THAT IS A PERFORMANCE RULE ───────────────────
//
// Each layer used to be authored as a shape closed to the FULL 360-tall tile, so
// five layers meant five full-height surfaces stacked on the screen, all of them
// moving. §17 rule 6 already records what that costs: an animated full-screen
// <Svg> is worth about ten frames a second on an S24. Five of them, each twice
// the width of the phone, made the branch screen unusable.
//
// So a layer now declares the BAND it occupies — `top` and `h` — and its <Svg> is
// only that tall, with the viewBox offset to match. A far ridge paints 170 rows
// instead of 360; a hero paints the 90 its cabin actually needs. The art is
// identical and the painted area is a third of what it was.
//
// Two numbers make the band computable rather than guessed:
//
//   · `minY`  — the highest point the shape reaches. The band starts just above it.
//   · `baseY` — where its mass sits. Everything BEHIND it only has to be filled
//               down to here, because below this line it is covered anyway.
//
// A hero (`solo`) is exempt from the second: it is a single object, not a mass,
// so nothing behind it may be cut off at its feet.
//
// Coordinates are in a 1000-wide × 360-tall tile that repeats seamlessly: every
// generator starts and ends at the same height, so tiles butt together with no
// visible seam.
// ─────────────────────────────────────────────────────────────────────────────

export const TILE_W = 1000;
export const TILE_H = 360;

function rnd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A MOUNTAIN RANGE — one jagged line, peaks of varied height, sagging shoulders.
 *
 * `base` is where the range meets the ground, `amp` the tallest peak above it.
 * The first and last points are pinned to the same height so tiles repeat.
 */
export function ridge(seed: number, base: number, amp: number, peaks = 7, bottom = TILE_H): string {
  const pts: [number, number][] = [[0, base - amp * 0.42]];
  for (let i = 1; i < peaks; i++) {
    const x = (TILE_W / peaks) * i + (rnd(seed + i) - 0.5) * (TILE_W / peaks) * 0.5;
    // Peaks alternate tall/short rather than being uniformly random: a range with
    // every summit the same height reads as a saw blade.
    const tall = i % 2 === 0 ? 0.62 + rnd(seed + i * 3) * 0.38 : 0.28 + rnd(seed + i * 5) * 0.34;
    pts.push([x, base - amp * tall]);
  }
  pts.push([TILE_W, base - amp * 0.42]);

  let d = `M0 ${bottom} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    // A saddle between two summits, pulled below the straight line so the range
    // has valleys instead of straight edges.
    const mx = (px + x) / 2;
    const my = Math.max(py, y) + amp * (0.10 + rnd(seed + i * 7) * 0.14);
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${bottom} Z`;
}

/**
 * A PINE TREELINE — one mass, spiky along the top, closed along the bottom.
 *
 * Each tree is a zigzag rather than a triangle: a fir's outline steps in and out
 * on the way up, and that stepping is what tells it apart from a mountain at the
 * same silhouette weight.
 */
export function treeline(seed: number, base: number, h: number, n = 26, bottom = TILE_H): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const th = h * (0.55 + rnd(seed + i) * 0.75);
    const w = step * (0.42 + rnd(seed + i * 3) * 0.30);
    const tipX = x + step / 2;
    // THREE TIERS, EACH NARROWER THAN THE ONE BELOW IT. The version before this
    // stepped IN to 0.45w and then back OUT to 0.62w — a bulge wider than the one
    // under it — and the whole treeline read as broken glass rather than as firs.
    // A conifer only ever narrows on the way up; the flare at the foot of each
    // tier is what makes it a fir instead of a cone, and it must stay inside the
    // tier below.
    d += ` L${(tipX - w).toFixed(1)} ${(base - th * 0.24).toFixed(1)}`;
    d += ` L${(tipX - w * 0.60).toFixed(1)} ${(base - th * 0.34).toFixed(1)}`;
    d += ` L${(tipX - w * 0.70).toFixed(1)} ${(base - th * 0.40).toFixed(1)}`;
    d += ` L${(tipX - w * 0.34).toFixed(1)} ${(base - th * 0.62).toFixed(1)}`;
    d += ` L${(tipX - w * 0.42).toFixed(1)} ${(base - th * 0.68).toFixed(1)}`;
    d += ` L${tipX.toFixed(1)} ${(base - th).toFixed(1)}`;
    d += ` L${(tipX + w * 0.42).toFixed(1)} ${(base - th * 0.68).toFixed(1)}`;
    d += ` L${(tipX + w * 0.34).toFixed(1)} ${(base - th * 0.62).toFixed(1)}`;
    d += ` L${(tipX + w * 0.70).toFixed(1)} ${(base - th * 0.40).toFixed(1)}`;
    d += ` L${(tipX + w * 0.60).toFixed(1)} ${(base - th * 0.34).toFixed(1)}`;
    d += ` L${(tipX + w).toFixed(1)} ${(base - th * 0.24).toFixed(1)}`;
    d += ` L${(x + step).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${bottom} Z`;
}

/**
 * ROLLING HILLS — the quietest layer, for scenes that need air rather than mass.
 */
export function hills(seed: number, base: number, amp: number, n = 4, bottom = TILE_H): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const top = base - amp * (0.4 + rnd(seed + i * 11) * 0.6);
    d += ` Q${(x + step * 0.5).toFixed(1)} ${top.toFixed(1)} ${(x + step).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${bottom} Z`;
}

/**
 * BROADLEAF CANOPY.
 *
 * The version before this was one quadratic per crown, which gives a row of even
 * domes — bubbles, which is exactly what it looked like. A real canopy is crowns
 * of DIFFERENT sizes overlapping at DIFFERENT heights, each lopsided, so this
 * draws every crown as three arcs whose ends sit inside its neighbours.
 */
export function canopy(seed: number, base: number, h: number, n = 11, bottom = TILE_H): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
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
  return `${d} L${TILE_W} ${base.toFixed(1)} L${TILE_W} ${bottom} Z`;
}

// ── HERO SILHOUETTES ────────────────────────────────────────────────────────
// Every reference image has a SUBJECT — a cabin, a windmill, an arch, a tower.
// Without one the eye has nothing to land on and a scene is wallpaper. One per
// tile, so it comes past about once a lesson.
//
// They stand ABOVE the near treeline's base rather than down at the walking
// ground, which is the fix for the two that were never seen: the ground band
// reaches y 349 at its lowest, so a hero based at 340 spent most of its life
// behind the hill the reader was walking over.

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
 * BIRDS — the one thing up there that is neither land nor sky.
 *
 * Four gull silhouettes per tile, high and slow (k around 0.06), which is the
 * cheapest possible way to say the sky is a place and not a background colour.
 * Each is one closed shape: two arcs up for the wings and one back under, which
 * is the whole of a bird at this size.
 */
export function birds(seed: number, y: number, n = 4): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * TILE_W + (rnd(seed + i) - 0.5) * 140;
    const by = y + (rnd(seed + i * 3) - 0.5) * 44;
    const s = 4.5 + rnd(seed + i * 7) * 4;
    d += ` M${(x - s).toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x - s * 0.5).toFixed(1)} ${(by - s * 0.75).toFixed(1)} ${x.toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x + s * 0.5).toFixed(1)} ${(by - s * 0.75).toFixed(1)} ${(x + s).toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x + s * 0.5).toFixed(1)} ${(by - s * 0.30).toFixed(1)} ${x.toFixed(1)} ${(by + s * 0.24).toFixed(1)}`
      + ` Q${(x - s * 0.5).toFixed(1)} ${(by - s * 0.30).toFixed(1)} ${(x - s).toFixed(1)} ${by.toFixed(1)} Z`;
  }
  return d;
}

/** A layer, ready to draw: a path, a tone, a parallax rate, and its band. */
export type LayerArt = { d: string; tone: string; k: number; top: number; h: number };

/**
 * A real tonal gap. The first ramp ran within 12% and the layers fused.
 *
 * TONES[0] is a shade darker than it was: against the sky at #EFECE4 the old
 * #DFDCD4 was a 6% step, and the far ridge in the open scenes read as a smudge
 * rather than as a range of hills.
 */
export const TONES = ['#D8D3C8', '#BEB8AB', '#8C8679', '#575249', '#1A1A1A'];

/** Where the disc sits, per scene, as a fraction of the frame. */
export const DISC: Record<string, { x: number; y: number; r: number }> = {
  'the hills': { x: 0.24, y: 0.20, r: 54 },
  'deep forest': { x: 0.62, y: 0.13, r: 34 },
  'the moor': { x: 0.30, y: 0.26, r: 62 },
  'the ridge': { x: 0.70, y: 0.16, r: 44 },
  'the orchard': { x: 0.20, y: 0.18, r: 48 },
  'the pass': { x: 0.50, y: 0.20, r: 38 },
};

interface Spec {
  tone: string;
  k: number;
  /** The highest point the shape reaches — the band starts just above it. */
  minY: number;
  /** Where its mass sits — layers behind it need only be filled to here. */
  baseY: number;
  /** A single object rather than a mass: it covers nothing, and is its own band. */
  solo?: boolean;
  make: (bottom: number) => string;
}

/** Turn the declared shapes into bands. See the header for why this exists. */
function bands(specs: Spec[]): LayerArt[] {
  return specs.map((s, i) => {
    let bottom = TILE_H;
    if (s.solo) {
      bottom = Math.min(TILE_H, s.baseY + 2);
    } else {
      for (let j = i + 1; j < specs.length; j++) {
        if (!specs[j].solo) { bottom = Math.min(TILE_H, specs[j].baseY + 8); break; }
      }
    }
    const top = Math.max(0, Math.floor(s.minY - 4));
    return { d: s.make(bottom), tone: s.tone, k: s.k, top, h: Math.max(10, Math.ceil(bottom - top)) };
  });
}

/**
 * The six places.
 *
 * EACH HAS ITS OWN HORIZON. The first version gave every layer the same base, so
 * six scenes came out as one stack of stripes at one set of heights. A moor is
 * mostly sky above a low line; a forest closes over you. That difference lives in
 * where each layer's base sits, not only in what stands on it.
 *
 * There is no foreground grass layer here any more, and its absence was a bug
 * fix: it sat at y 352 moving at k 1.3, and the walking ground — ink, k 1.0, and
 * drawn on top of all of this — never dips below 349. So it was either invisible
 * or, in the dips, a strip of grass sliding sideways against the hill it was
 * supposedly growing on. What grows at the reader's feet is drawn by
 * `groundDeco`, on the ground itself, at the ground's own speed.
 */
export function sceneLayers(name: string): LayerArt[] {
  const s = name.length * 17;
  switch (name) {
    case 'deep forest':
      return bands([
        { tone: TONES[0], k: 0.10, minY: 188, baseY: 232, make: (b) => hills(s, 232, 44, 3, b) },
        { tone: TONES[1], k: 0.26, minY: 149, baseY: 274, make: (b) => treeline(s + 3, 274, 96, 26, b) },
        { tone: TONES[2], k: 0.48, minY: 174, baseY: 320, make: (b) => treeline(s + 7, 320, 112, 18, b) },
        { tone: TONES[3], k: 0.48, minY: 244, baseY: 318, solo: true, make: () => cabin(300, 318, 66) },
      ]);
    case 'the ridge':
      return bands([
        { tone: TONES[1], k: 0.05, minY: 76, baseY: 126, solo: true, make: () => birds(s + 21, 100, 3) },
        { tone: TONES[0], k: 0.08, minY: 86, baseY: 236, make: (b) => ridge(s, 236, 150, 5, b) },
        { tone: TONES[1], k: 0.22, minY: 176, baseY: 288, make: (b) => ridge(s + 5, 288, 112, 7, b) },
        { tone: TONES[2], k: 0.46, minY: 245, baseY: 326, make: (b) => treeline(s + 9, 326, 62, 26, b) },
        { tone: TONES[3], k: 0.46, minY: 184, baseY: 300, solo: true, make: () => tower(300, 300, 104) },
      ]);
    case 'the orchard':
      return bands([
        { tone: TONES[0], k: 0.10, minY: 200, baseY: 258, make: (b) => hills(s, 258, 58, 4, b) },
        { tone: TONES[1], k: 0.26, minY: 180, baseY: 300, make: (b) => canopy(s + 4, 300, 92, 11, b) },
        { tone: TONES[2], k: 0.50, minY: 185, baseY: 328, make: (b) => canopy(s + 8, 328, 110, 8, b) },
        { tone: TONES[3], k: 0.50, minY: 148, baseY: 316, solo: true, make: () => windmill(760, 316, 118) },
      ]);
    case 'the moor':
      return bands([
        { tone: TONES[1], k: 0.06, minY: 112, baseY: 162, solo: true, make: () => birds(s + 17, 136, 4) },
        { tone: TONES[0], k: 0.09, minY: 172, baseY: 244, make: (b) => hills(s, 244, 72, 3, b) },
        { tone: TONES[1], k: 0.24, minY: 250, baseY: 296, make: (b) => hills(s + 5, 296, 46, 5, b) },
        { tone: TONES[2], k: 0.46, minY: 298, baseY: 328, make: (b) => hills(s + 11, 328, 30, 7, b) },
        { tone: TONES[3], k: 0.46, minY: 164, baseY: 300, solo: true, make: () => windmill(420, 300, 96) },
      ]);
    case 'the pass':
      return bands([
        { tone: TONES[1], k: 0.10, minY: 56, baseY: 224, make: (b) => ridge(s, 224, 168, 5, b) },
        { tone: TONES[2], k: 0.28, minY: 140, baseY: 280, make: (b) => ridge(s + 6, 280, 140, 7, b) },
        { tone: TONES[3], k: 0.52, minY: 250, baseY: 330, make: (b) => ridge(s + 13, 330, 80, 9, b) },
        { tone: TONES[4], k: 0.52, minY: 185, baseY: 320, solo: true, make: () => arch(520, 320, 150) },
      ]);
    default: // 'the hills'
      return bands([
        { tone: TONES[1], k: 0.06, minY: 84, baseY: 134, solo: true, make: () => birds(s + 13, 108, 4) },
        { tone: TONES[0], k: 0.09, minY: 134, baseY: 250, make: (b) => ridge(s, 250, 116, 6, b) },
        { tone: TONES[1], k: 0.24, minY: 226, baseY: 292, make: (b) => hills(s + 4, 292, 66, 4, b) },
        { tone: TONES[2], k: 0.46, minY: 247, baseY: 322, make: (b) => treeline(s + 8, 322, 58, 22, b) },
        { tone: TONES[3], k: 0.46, minY: 233, baseY: 316, solo: true, make: () => cabin(700, 316, 74) },
      ]);
  }
}

export const SCENE_NAMES = ['the hills', 'deep forest', 'the moor', 'the ridge', 'the orchard', 'the pass'];
