import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';

// ─────────────────────────────────────────────────────────────────────────────
// The launch screen's landscape, as pure data and path strings.
//
// NO REACT IN THIS FILE. That is what lets scripts/sheet-launch.mjs draw every
// scene to a PNG and scripts/check-launch.mjs measure it, both in plain Node —
// the fastest loop in the repo for anything shape-shaped. Importing rig.ts is
// fine: it is pure maths too, and the checker transpiles both.
//
// PATH DATA ONLY. No arcs, no circles. rasterpath.mjs flattens path commands
// assuming every argument is an (x, y) pair, so an `A` command is silently
// mis-drawn rather than rejected. Discs are polygons; see `discPath`.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = '#1A1A1A';
export const CREAM = '#F4F1EA';

/** The frame everything here is authored in. Same stage as the figure. */
export const ART_W = STAGE_W;   // 400
export const ART_H = STAGE_H;   // 800

export type SceneKey = 'walk' | 'sip' | 'read' | 'thinker' | 'stargazer' | 'lookout';

export const SCENE_KEYS: readonly SceneKey[] = [
  'walk', 'sip', 'read', 'thinker', 'stargazer', 'lookout',
];

export interface Palette {
  /** Six tonal steps of ONE hue family, index 0 darkest → 5 lightest. */
  steps: readonly [string, string, string, string, string, string];
  /** The celestial anchor's fill. May sit a touch warmer than the family. */
  disc: string;
  /** Which steps the sky occupies, top → horizon. Drives chromeOn(). */
  sky: readonly [number, number];
}

// THE LIGHT IS AT THE HORIZON. `sky` used to run [5, 3] on four scenes — lightest
// at the top, darkening downward — which is upside down: every reference is
// brightest where the sun is, and the sun is at the horizon. It also put the
// farthest plane (step 4) against a step-3 sky, so the land POPPED brighter than
// the sky behind it and every scene grew a bright seam along its horizon.
//
// Two rules follow, and `check:launch` asserts both:
//   sky[1] > sky[0]      the sky brightens downward (night is exempt)
//   planes[0].step <= sky[1]   the farthest land is never lighter than its horizon
//
// `chromeOn` reads steps[sky[0]], so the top of the sky decides whether the
// masthead comes out ink or cream. A mid-tone top fails the 4.5:1 assertion in
// both directions — the sky top has to commit to being dark or being pale.
export const PALETTES: Record<SceneKey, Palette> = {
  // amber dusk — a low sun going down behind desert mesas
  walk: {
    steps: ['#3A2A26', '#5E4038', '#8A5E45', '#B98A5E', '#DFB98A', '#F2DCBC'],
    disc: '#FFE0A8',
    sky: [1, 4],
  },
  // pale gold morning — the high-key one, and the one scene whose chrome still
  // comes out INK. It has to span two steps: [4, 5] is a one-step sky, and this
  // family's top two steps are 1.29:1 apart, so the whole thing rendered as a
  // single flat cream with the far hills invisible inside it.
  sip: {
    steps: ['#2E2B25', '#55503F', '#837A5F', '#B0A585', '#D8CFB4', '#F1EBDA'],
    disc: '#FFF4D2',
    sky: [3, 5],
  },
  // cool slate — a cold sun over conifer bands dissolving into mist
  read: {
    steps: ['#1E232A', '#3A424B', '#5A6773', '#8794A0', '#B4BFC8', '#DEE5EA'],
    disc: '#F2F6F8',
    sky: [1, 5],
  },
  // forest teal — deep canopy and a cliff edge over a bright valley haze
  thinker: {
    steps: ['#122A25', '#24473F', '#3A6357', '#5C8779', '#8FB3A4', '#C4D8CE'],
    disc: '#DCEFE4',
    sky: [1, 5],
  },
  // dusk blue — THE NIGHT SCENE. Sky is the DARK end, so chrome comes out cream.
  // This is the case a fixed "the sky is always light" rule would have banned.
  // Its horizon still lifts to step 4, because a moon lays a glow on the skyline
  // and because the far treeline has to have something to read against.
  stargazer: {
    steps: ['#12161F', '#2C3849', '#465468', '#6B7A8E', '#9BA7B6', '#D3DAE2'],
    disc: '#E8EDF4',
    sky: [0, 4],
  },
  // muted rose dusk — receding ridges rising to one far spire
  lookout: {
    steps: ['#2A1E28', '#503A48', '#785764', '#A67F85', '#CDAAA8', '#EFDCD4'],
    disc: '#FFDCC0',
    sky: [1, 4],
  },
};

/** The tone the top band (y 0–300) averages to — what chrome sits on. */
export function skyBandTone(key: SceneKey): string {
  return PALETTES[key].steps[PALETTES[key].sky[0]];
}

/**
 * Ink or cream, DERIVED — never hand-picked per scene.
 *
 * The old file fixed the dark zone to the top third so chrome could always be
 * light. That worked, and it also banned every night sky. Reading the sky band's
 * own luminance keeps the guarantee (nothing lands on a background it cannot be
 * read against) without the ban.
 */
export function chromeOn(key: SceneKey): string {
  const l = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const r = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const sky = l(skyBandTone(key));
  return r(l(INK), sky) >= r(l(CREAM), sky) ? INK : CREAM;
}

/**
 * A crest contour as PLAIN NUMBERS: y = base - sin((x - off) / per) * amp.
 *
 * Deliberately not a function. The figure's pose is solved inside a Reanimated
 * worklet, and a plain JS closure captured by a worklet is not callable there —
 * it throws "Object is not a function" and takes the app down. This is the same
 * shape, and the same reason, as `groundWave` on the old walk scene.
 */
export interface Crest { base: number; amp: number; off: number; per: number }

const CRESTS: Record<SceneKey, Crest> = {
  walk:      { base: 596, amp: 18, off: 40,  per: 170 },
  sip:       { base: 604, amp: 12, off: -60, per: 155 },
  read:      { base: 612, amp: 10, off: 30,  per: 170 },
  thinker:   { base: 584, amp: 14, off: 90,  per: 150 },
  stargazer: { base: 620, amp: 16, off: -20, per: 180 },
  lookout:   { base: 592, amp: 20, off: 60,  per: 165 },
};

export function crestFor(key: SceneKey): Crest {
  return CRESTS[key];
}

/** The crest's y at a given x. Plain maths, safe to call from JS or a worklet. */
export function crestY(c: Crest, x: number): number {
  'worklet';
  return c.base - Math.sin((x - c.off) / c.per) * c.amp;
}

/** Where the figure stands in each scene, and how wide a lane he needs kept clear. */
const FIG_X: Record<SceneKey, number> = {
  walk: 150, sip: 200, read: 200, thinker: 200, stargazer: 200, lookout: 200,
};

export function figureX(key: SceneKey): number {
  return FIG_X[key];
}

/**
 * A disc as a POLYGON, not an arc.
 *
 * rasterpath.mjs flattens path commands assuming every argument is an (x, y)
 * pair, so an `A` command is silently mis-drawn rather than rejected. 48 sides
 * is indistinguishable from a circle at every size this is ever drawn.
 */
function discPath(cx: number, cy: number, r: number): string {
  let d = '';
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const x = (cx + Math.cos(a) * r).toFixed(1);
    const y = (cy + Math.sin(a) * r).toFixed(1);
    d += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
  }
  return d + ' Z';
}

/**
 * Where each scene's one celestial anchor sits, and how big it is.
 *
 * THE DISC WANTS A DARK EDGE ACROSS IT. A disc floating in clear sky is a
 * sticker; a disc a ridge or a tree cuts into is light and land interacting,
 * which is the one thing the first contact sheet's two best scenes were doing
 * and the other four were not. So each of these is placed low enough that a
 * plane or a silhouette crosses it — the numbers in `SCENE_PLANES` below and
 * these numbers are a pair, and moving one without the other breaks the shot.
 *
 * It also wants sky it can be seen against, and the sky is now BRIGHTEST at the
 * horizon. So low is good and touching the horizon is not: `lookout`'s disc sits
 * where the gradient is still mid-dark and lets its far spire do the cutting.
 */
const DISCS: Record<SceneKey, { cx: number; cy: number; r: number }> = {
  // going down behind the mesas: the far plane clips its foot, and the tall
  // butte on the step-3 plane cuts a hard notch out of its right side
  walk:      { cx: 288, cy: 404, r: 60 },
  // a morning sun dropped onto the near tree cluster — cut the way walk's is,
  // rather than raised in tone, which would fight the pale-gold sky it owns
  sip:       { cx: 112, cy: 360, r: 48 },
  // a cold sun high in a slate sky, well above the mist bands
  read:      { cx: 252, cy: 218, r: 46 },
  // glimpsed through the canopy: the big tree on the step-3 plane overlaps it
  thinker:   { cx: 268, cy: 358, r: 48 },
  // The moon is LARGE and sits low, so it is the whole composition and the far
  // treeline eats its bottom half. On a dark-sky scene that disc is the only
  // thing that can keep an ink figure readable — see the figure-band check.
  stargazer: { cx: 214, cy: 470, r: 96 },
  // the sun the lookout is looking at, with the far spire cutting its right side
  lookout:   { cx: 236, cy: 352, r: 74 },
};

export function discFor(key: SceneKey): { d: string; fill: string } {
  const { cx, cy, r } = DISCS[key];
  return { d: discPath(cx, cy, r), fill: PALETTES[key].disc };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHAPES ON THE LAND
//
// The first version of this file gave every plane in every scene the same gentle
// sine wave, and all six read as flat stacked stripes — the same failure the
// branch scenery shipped and took five contact sheets to undo. A plane is not a
// place until something GROWS on it or STANDS on it.
//
// Everything below is polygons. No arcs anywhere: rasterpath.mjs flattens path
// commands assuming every argument is an (x, y) pair, so an `A` is silently
// mis-drawn rather than rejected — you get wrong pixels and no error. Rounded
// forms (canopies, mist, the disc) are polygons with enough sides to pass for
// curves at the only size this is ever drawn.
// ─────────────────────────────────────────────────────────────────────────────

/** How far past each frame edge the land runs, so nothing shows a cut end. */
const EDGE = 20;

/** Deterministic 0..1 sequence, so a scene draws identically on every call. */
function rnd(seed: number): () => number {
  let s = ((seed * 9301 + 49297) % 233280 + 233280) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * A closed polygon, wound the same way as the land mass it is added to.
 *
 * NON-ZERO WINDING is the SVG default, and it is what unions a tree with the
 * hill it stands on instead of punching a tree-shaped hole in it — but only if
 * both wind the same way. Rather than trust every generator below to author its
 * points in the right order, measure the signed area and reverse when it is
 * wrong. One shoelace per shape, and the union can never come out inverted.
 */
function poly(pts: Array<[number, number]>): string {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  const p = a < 0 ? pts.slice().reverse() : pts;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length; i++) d += ` L${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)}`;
  return `${d} Z`;
}

type YAt = (x: number) => number;
type SilOpts = Record<string, number | undefined>;

/**
 * The silhouette a plane carries, appended to its ridge before the path closes.
 *
 * Every generator is handed the ridge's y at a given x so its shapes SIT ON the
 * ridge rather than floating above it or sinking into it — the ridge is a
 * different curve on every plane of every scene, and a shape authored against a
 * flat baseline shows the moment the ridge moves. Shapes overrun a few pixels
 * BELOW the ridge on purpose: the union hides it, and it costs nothing, whereas
 * a hairline of sky between a tree and its hill is visible at any size.
 */
type Silhouette = (x0: number, x1: number, yAt: YAt, seed: number, o?: SilOpts) => string;

/** Flat-topped buttes: near-vertical sides, a hard cap, a little talus. */
const mesas: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 16, hMax = o.hMax ?? 40;
  const wMin = o.wMin ?? 30, wMax = o.wMax ?? 84;
  const gap = o.gap ?? 16;
  let d = '', x = x0 + r() * gap;
  while (x < x1) {
    const w = wMin + r() * (wMax - wMin);
    if (x + w > x1) break;
    const h = hMin + r() * (hMax - hMin);
    const l = x, rt = x + w;
    const ty = Math.min(yAt(l), yAt(rt)) - h;
    const cap = Math.min(11, h * 0.3);
    const bat = w * (0.05 + r() * 0.07);
    const shelf = r() < 0.45 ? h * (0.22 + r() * 0.2) : 0;   // a terrace on one side
    const pts: Array<[number, number]> = [[l, yAt(l) + 5]];
    if (shelf > 0) {
      pts.push([l + bat * 0.6, ty + shelf + cap * 0.5]);
      pts.push([l + w * 0.22, ty + shelf]);
      pts.push([l + w * 0.28, ty + shelf]);
    }
    pts.push([l + bat + w * (shelf > 0 ? 0.28 : 0), ty + cap]);
    pts.push([l + bat * 1.6 + w * (shelf > 0 ? 0.28 : 0), ty]);
    pts.push([rt - bat * 1.6, ty]);
    pts.push([rt - bat, ty + cap]);
    pts.push([rt, yAt(rt) + 5]);
    d += poly(pts) + ' ';
    x = rt + gap * (0.35 + r() * 1.7);
  }
  return d;
};

/** Conifer spires: a tapering zigzag, four tiers of branch, one point. */
const conifers: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 22, hMax = o.hMax ?? 54;
  const wf = o.wf ?? 0.34;
  const gap = o.gap ?? 8;
  const tiers = Math.round(o.tiers ?? 4);
  let d = '', x = x0;
  while (x < x1) {
    const h = hMin + r() * (hMax - hMin);
    const hw = h * wf * (0.8 + r() * 0.45);
    const cx = x + hw;
    if (cx + hw > x1) break;
    const b = yAt(cx) + 5;
    const pts: Array<[number, number]> = [[cx - hw, b]];
    for (let t = 0; t < tiers; t++) {
      const u = (t + 1) / (tiers + 1);
      const w = hw * (1 - u);
      pts.push([cx - w * 1.18, b - h * (u - 0.055)]);
      pts.push([cx - w * 0.72, b - h * u]);
    }
    pts.push([cx, b - h]);
    for (let t = tiers - 1; t >= 0; t--) {
      const u = (t + 1) / (tiers + 1);
      const w = hw * (1 - u);
      pts.push([cx + w * 0.72, b - h * u]);
      pts.push([cx + w * 1.18, b - h * (u - 0.055)]);
    }
    pts.push([cx + hw, b]);
    d += poly(pts) + ' ';
    x = cx + hw + gap * (0.25 + r() * 1.5);
  }
  return d;
};

/** Broadleaf masses on trunks. Rounded, and therefore a 26-gon — never an arc. */
const canopy: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const rMin = o.rMin ?? 26, rMax = o.rMax ?? 46;
  const gap = o.gap ?? 10;
  const lift = o.lift ?? 0.45;
  let d = '', x = x0;
  while (x < x1) {
    const rr = rMin + r() * (rMax - rMin);
    const cx = x + rr;
    if (cx + rr > x1) break;
    const b = yAt(cx) + 5;
    const th = rr * lift * (0.6 + r() * 0.9);
    const cy = b - th - rr * 0.92;
    const p1 = r() * 6.2832, p2 = r() * 6.2832;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * 6.2832;
      const k = 1 + 0.15 * Math.sin(3 * a + p1) + 0.09 * Math.sin(5 * a + p2);
      pts.push([cx + Math.cos(a) * rr * k * 1.06, cy + Math.sin(a) * rr * k * 0.84]);
    }
    d += poly(pts) + ' ';
    // A 2.2px trunk was correct arboriculture and wrong drawing: on the lone
    // trees it vanished and left the canopy floating over the hill. Everything
    // here has to survive a half-scale contact sheet, so the trunk is a mass.
    const tw = Math.max(3, rr * 0.15);
    d += poly([[cx - tw, b], [cx - tw * 0.62, cy], [cx + tw * 0.62, cy], [cx + tw, b]]) + ' ';
    x = cx + rr + gap * (0.2 + r() * 1.3);
  }
  return d;
};

/** Rolling grass swells: asymmetric bells that overlap into a run of hills. */
const swells: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 8, hMax = o.hMax ?? 22;
  const wMin = o.wMin ?? 70, wMax = o.wMax ?? 150;
  let d = '', x = x0;
  while (x < x1) {
    const w = wMin + r() * (wMax - wMin);
    if (x + w > x1) break;
    const h = hMin + r() * (hMax - hMin);
    const skew = 0.28 + r() * 0.44;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const xx = x + w * u;
      const v = u < skew ? u / skew : (1 - u) / (1 - skew);
      const e = 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, v)));
      pts.push([xx, yAt(xx) - h * e]);
    }
    pts.push([x + w, yAt(x + w) + 5]);
    pts.push([x, yAt(x) + 5]);
    d += poly(pts) + ' ';
    x += w * (0.5 + r() * 0.45);
  }
  return d;
};

/** A far treeline: a solid low band with a fur of small spires along its top. */
const treeline: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 7, hMax = o.hMax ?? 18;
  const band = o.band ?? 5;
  const pts: Array<[number, number]> = [];
  for (let xx = x0; xx <= x1; xx += 16) pts.push([xx, yAt(xx) - band]);
  pts.push([x1, yAt(x1) + 5]);
  pts.push([x0, yAt(x0) + 5]);
  let d = poly(pts) + ' ';
  let x = x0;
  while (x < x1) {
    const h = hMin + r() * (hMax - hMin);
    const hw = h * (0.2 + r() * 0.16);
    const cx = x + hw;
    if (cx + hw > x1) break;
    const b = yAt(cx) + 2;
    d += poly([
      [cx - hw, b],
      [cx - hw * 0.52, b - h * 0.5],
      [cx - hw * 0.66, b - h * 0.58],
      [cx, b - h],
      [cx + hw * 0.66, b - h * 0.58],
      [cx + hw * 0.52, b - h * 0.5],
      [cx + hw, b],
    ]) + ' ';
    x = cx + hw * (0.5 + r() * 1.7);
  }
  return d;
};

/** One tall pointed peak with shoulders — the thing a ridge line rises TO. */
const ridgeSpire: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const cx = o.cx ?? (x0 + x1) / 2;
  const h = o.h ?? 120;
  const hw = o.hw ?? h * 0.34;
  const b = yAt(cx) + 6;
  const apex = cx + h * ((o.lean ?? (r() - 0.5) * 0.3));
  let d = poly([
    [cx - hw, b],
    [cx - hw * 0.74, b - h * 0.28],
    [cx - hw * 0.88, b - h * 0.35],
    [cx - hw * 0.42, b - h * 0.66],
    [cx - hw * 0.52, b - h * 0.73],
    [apex - hw * 0.12, b - h * 0.93],
    [apex, b - h],
    [apex + hw * 0.18, b - h * 0.88],
    [cx + hw * 0.46, b - h * 0.62],
    [cx + hw * 0.6, b - h * 0.55],
    [cx + hw * 0.82, b - h * 0.24],
    [cx + hw, b],
  ]) + ' ';
  // A subsidiary summit, so the peak reads as the high point of a range rather
  // than a lone cone dropped on a flat line.
  const sw = hw * (0.5 + r() * 0.3);
  const sh = h * (0.4 + r() * 0.18);
  const sx = cx + (o.side ?? 1) * (hw + sw * 0.55);
  d += poly([
    [sx - sw, yAt(sx - sw) + 6],
    [sx - sw * 0.5, yAt(sx) - sh * 0.6],
    [sx, yAt(sx) - sh],
    [sx + sw * 0.62, yAt(sx) - sh * 0.42],
    [sx + sw, yAt(sx + sw) + 6],
  ]) + ' ';
  return d;
};

/** Short tufts — a comb of spikes off the ridge. The near plane's stubble. */
const scrub: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 5, hMax = o.hMax ?? 13;
  const gap = o.gap ?? 26;
  let d = '', x = x0 + r() * gap;
  while (x < x1) {
    const h = hMin + r() * (hMax - hMin);
    const n = 3 + Math.floor(r() * 3);
    const w = h * (0.5 + r() * 0.55);
    const b = yAt(x) + 4;
    const pts: Array<[number, number]> = [[x - w, b]];
    for (let i = 0; i < n; i++) {
      const bh = h * (0.5 + r() * 0.8);
      pts.push([x - w + 2 * w * ((i + 0.5) / n), b - bh]);
      if (i < n - 1) pts.push([x - w + 2 * w * ((i + 1) / n), b - bh * 0.16]);
    }
    pts.push([x + w, b]);
    d += poly(pts) + ' ';
    x += gap * (0.3 + r() * 1.7);
  }
  return d;
};

/** Angular blocks — boulders, and the crags a bare ridge is made of. */
const rocks: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 8, hMax = o.hMax ?? 24;
  const gap = o.gap ?? 40;
  let d = '', x = x0 + r() * gap;
  while (x < x1) {
    const h = hMin + r() * (hMax - hMin);
    const w = h * (1.1 + r() * 1.6);
    if (x + w > x1) break;
    const b = Math.max(yAt(x), yAt(x + w)) + 5;
    const t = b - h;
    d += poly([
      [x, b],
      [x + w * (0.1 + r() * 0.1), t + h * 0.32],
      [x + w * (0.2 + r() * 0.14), t],
      [x + w * (0.56 + r() * 0.2), t + h * (0.05 + r() * 0.2)],
      [x + w * 0.87, t + h * 0.44],
      [x + w, b],
    ]) + ' ';
    x += w + gap * (0.25 + r() * 1.6);
  }
  return d;
};

/** A broken tower and a run of fallen wall, for the knoll on `sip`. */
const ruin: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const cx = o.cx ?? (x0 + x1) / 2;
  const h = o.h ?? 34;
  const w = o.w ?? 6.5;
  const b = yAt(cx) + 5;
  let d = poly([
    [cx - w, b],
    [cx - w, b - h * 0.98],
    [cx - w * 0.42, b - h * 0.88],
    [cx - w * 0.08, b - h],
    [cx + w * 0.34, b - h * 0.82],
    [cx + w * 0.78, b - h * 0.92],
    [cx + w, b - h * 0.7],
    [cx + w, b],
  ]) + ' ';
  const wl = o.wall ?? 26;
  const wh = h * 0.28;
  d += poly([
    [cx + w, b],
    [cx + w, b - wh],
    [cx + w + wl * 0.34, b - wh * 1.12],
    [cx + w + wl * 0.52, b - wh * 0.5],
    [cx + w + wl * 0.78, b - wh * 0.86],
    [cx + w + wl, b - wh * 0.16],
    [cx + w + wl, b],
  ]) + ' ';
  return d;
};

/** A shelf of land that ends in a hard vertical face — the cliff on `thinker`. */
const cliff: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const from = o.from ?? x0;
  const edge = o.edge ?? x1;
  const rise = o.rise ?? 44;
  const pts: Array<[number, number]> = [];
  for (let x = from; x < edge; x += 14) {
    const u = (x - from) / Math.max(1, edge - from);
    pts.push([x, yAt(x) - rise * Math.min(1, u * 2.4) + (r() - 0.5) * 2.4]);
  }
  pts.push([edge, yAt(edge) - rise]);
  pts.push([edge + 2, yAt(edge) - rise * 0.18]);   // the face, near-vertical
  pts.push([edge + 6, yAt(edge) + 6]);
  pts.push([from, yAt(from) + 6]);
  return poly(pts) + ' ';
};

/** Tall leaning grass — sparser and taller than `scrub`, one blade at a time. */
const blades: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 10, hMax = o.hMax ?? 26;
  const gap = o.gap ?? 7;
  let d = '', x = x0;
  while (x < x1) {
    const h = hMin + r() * (hMax - hMin);
    const lean = (r() - 0.5) * h * 0.5;
    const w = 1.5 + r() * 1.9;
    const b = yAt(x) + 4;
    d += poly([
      [x - w, b],
      [x - w * 0.3 + lean * 0.5, b - h * 0.58],
      [x + lean, b - h],
      [x + w * 0.5 + lean * 0.45, b - h * 0.52],
      [x + w, b],
    ]) + ' ';
    x += gap * (0.35 + r() * 1.7);
  }
  return d;
};

/** Snow mounds: flat-crowned domes that overlap into drift. */
const hummocks: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const hMin = o.hMin ?? 6, hMax = o.hMax ?? 16;
  let d = '', x = x0;
  while (x < x1) {
    const w = 34 + r() * 60;
    if (x + w > x1) break;
    const h = hMin + r() * (hMax - hMin);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const xx = x + w * u;
      const e = u < 0.3 ? u / 0.3 : u > 0.72 ? (1 - u) / 0.28 : 1;
      pts.push([xx, yAt(xx) - h * Math.min(1, e)]);
    }
    pts.push([x + w, yAt(x + w) + 5]);
    pts.push([x, yAt(x) + 5]);
    d += poly(pts) + ' ';
    x += w * (0.58 + r() * 0.5);
  }
  return d;
};

/** A stone shelf: flat runs broken by blocky steps. Nothing curved in it. */
const shelf: Silhouette = (x0, x1, yAt, seed, o = {}) => {
  const r = rnd(seed);
  const lift = o.lift ?? 16;
  const pts: Array<[number, number]> = [];
  let x = x0, y = yAt(x0) - lift;
  pts.push([x, y]);
  while (x < x1) {
    const nx = Math.min(x1, x + 18 + r() * 48);
    pts.push([nx, y]);
    y = Math.max(yAt(nx) - lift * 2, Math.min(yAt(nx) - 3, y + (r() - 0.5) * lift * 1.1));
    pts.push([nx, y]);
    x = nx;
  }
  pts.push([x1, yAt(x1) + 6]);
  pts.push([x0, yAt(x0) + 6]);
  return poly(pts) + ' ';
};

// ── ridges ───────────────────────────────────────────────────────────────────

type RidgeKind = 'sine' | 'angular' | 'terrace';

/**
 * The ridge line itself, sampled every 20px.
 *
 * Three kinds, because one kind six times over is what stacked the stripes:
 * `sine` rolls (grass, mist), `angular` breaks into peaks (mountains), and
 * `terrace` runs long flats broken by short steps (desert). `tilt` leans the
 * whole line across the frame, which is the cheapest thing there is for
 * stopping five horizontals from reading as five horizontals.
 *
 * 20px, not finer, ON PURPOSE: the checker's silhouette assertion counts path
 * commands, and a ridge dense enough to clear that count on its own would let a
 * bare plane pass as a populated one.
 */
function ridgePoints(
  kind: RidgeKind, base: number, amp: number, off: number, per: number,
  jag: number, tilt: number, seed: number, maxY: number,
): Array<[number, number]> {
  const r = rnd(seed);
  const n = Math.round((ART_W + 2 * EDGE) / 20) + 1;
  const every = Math.max(1, Math.round(per / 45));
  const node: number[] = [];
  for (let i = 0; i < n + every + 1; i++) node.push(r());
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const x = -EDGE + i * 20;
    let y: number;
    if (kind === 'sine') {
      y = base - Math.sin((x - off) / per) * amp + Math.sin(x * 0.37 + off) * jag;
    } else if (kind === 'angular') {
      const a = Math.floor(i / every);
      const u = (i % every) / every;
      const h = node[a] + (node[a + 1] - node[a]) * u;
      y = base - (h - 0.5) * 2 * amp + (r() - 0.5) * jag * 2;
    } else {
      const q = Math.round(node[Math.floor(i / every)] * 3) / 3;
      y = base - (q - 0.5) * 2 * amp + (r() - 0.5) * jag;
    }
    pts.push([x, Math.min(maxY, y + tilt * (x / ART_W - 0.5))]);
  }
  return pts;
}

/** The drawn ridge's y at any x — linear between samples, so shapes sit ON it. */
function sampler(pts: Array<[number, number]>): YAt {
  return (x: number) => {
    const t = (x + EDGE) / 20;
    const i = Math.max(0, Math.min(pts.length - 2, Math.floor(t)));
    const u = Math.max(0, Math.min(1, t - i));
    return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
  };
}

/** Ridge + silhouette, filled down past the bottom edge so land reads as mass. */
function landPath(pts: Array<[number, number]>, extra: string): string {
  let d = `M${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]} ${pts[i][1].toFixed(1)}`;
  d += ` L${ART_W + EDGE} ${ART_H + EDGE} L${-EDGE} ${ART_H + EDGE} Z`;
  return extra ? `${d} ${extra}` : d;
}

interface PlaneSpec {
  step: number;
  /** Ridge offset from the crest's base. Negative is further away and higher. */
  dy: number;
  amp: number; off: number; per: number; jag: number;
  kind?: RidgeKind;
  tilt?: number;
  seed?: number;
  /** The lowest the ridge may sag — used to keep the far plane off the sky. */
  maxY?: number;
  /** Silhouette passes: [generator, the x spans it may occupy, options]. */
  sil?: Array<[Silhouette, Array<[number, number]>, SilOpts?]>;
}

const FULL: Array<[number, number]> = [[-EDGE, ART_W + EDGE]];

/**
 * The x spans that leave the figure a clear lane.
 *
 * He is solid ink, head included, and he is drawn in front of everything here.
 * A dark mass behind him is not drama, it is the man vanishing — so on any plane
 * dark enough to swallow him (step 2 and below), the silhouette generators are
 * only allowed either side of where he stands.
 */
function beside(key: SceneKey, pad = 46): Array<[number, number]> {
  const fx = FIG_X[key];
  return [[-EDGE, fx - pad], [fx + pad, ART_W + EDGE]];
}
/**
 * The receding planes, BACK TO FRONT.
 *
 * `step` is the palette index, and it must DECREASE toward the viewer — depth is
 * carried by value, not by detail. That is the single thing every reference
 * image has in common, and the thing the old scenes did not do at all.
 *
 * THE FIGURE STANDS ON THE step-2 PLANE, NOT THE step-1 PLANE, so the plane
 * immediately behind him — the one his whole body is read against — is step 3.
 * The obvious layout is three planes above the crest and one below, which puts
 * the crest at step 1 and his head and torso against step 2; measured under his
 * own ink that comes out at 2.3:1 on `stargazer` and 2.6:1 on `thinker`, with
 * two thirds of him below 3:1. Against step 3 the same figure measures 3.9:1 and
 * 4.2:1. Five steps, strictly decreasing, only stretch so far: two planes above
 * the crest and two below is the arrangement that spends them on the man rather
 * than on a fourth band of distance nobody would miss. It is also what gives the
 * foreground the two overlapping dark masses it was short of.
 *
 * The farthest plane also carries `maxY`, pinning its ridge above the horizon
 * line the sky gradient runs down to. Without it the ridge sags below where the
 * sky stops and a strip of raw sky-top colour shows through underneath — which
 * on the old palettes was the brightest tone in the scene, and was half of the
 * "bright seam at every horizon".
 *
 * A silhouette on a plane is filled with that plane's own step, so it can only be
 * seen against whatever is BEHIND it. That is why the far planes carry shapes at
 * all, and why `beside()` is only needed from the crest plane forward: a step-3
 * mesa standing directly behind the figure changes nothing about his backdrop,
 * but a step-2 one growing out of the ground he is standing on erases him.
 */
const SCENE_PLANES: Record<SceneKey, (c: Crest) => PlaneSpec[]> = {
  // AMBER DUSK, DESERT. Terraced ground and flat-topped buttes in three sizes,
  // with one tall butte at x≈300 standing up into the setting sun. Boulders and
  // sparse scrub close the bottom over two planes.
  walk: (c) => [
    {
      step: 4, dy: -180, amp: 7, off: c.off + 120, per: c.per * 2, jag: 1,
      kind: 'terrace', seed: 11, maxY: c.base - 153,
      sil: [[mesas, FULL, { hMin: 9, hMax: 21, wMin: 26, wMax: 62, gap: 22 }]],
    },
    {
      step: 3, dy: -100, amp: 11, off: c.off - 70, per: c.per * 1.5, jag: 1.5,
      kind: 'terrace', tilt: -14, seed: 23,
      sil: [
        [mesas, [[-EDGE, 258], [356, ART_W + EDGE]], { hMin: 22, hMax: 62, wMin: 56, wMax: 128, gap: 30 }],
        [mesas, [[262, 352]], { hMin: 80, hMax: 90, wMin: 64, wMax: 76, gap: 2 }],
      ],
    },
    {
      step: 2, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 3,
      kind: 'terrace', seed: 41,
      sil: [[rocks, beside('walk', 62), { hMin: 7, hMax: 17, gap: 54 }]],
    },
    {
      // The MIDDLE foreground plane stays quiet. Loading both near planes with
      // shapes gave the bottom third two busy horizontal bands, which is the
      // stripe problem again one plane lower down.
      step: 1, dy: 78, amp: 13, off: c.off + 60, per: c.per * 1.1, jag: 3,
      kind: 'angular', tilt: -30, seed: 47,
      sil: [[scrub, FULL, { hMin: 8, hMax: 20, gap: 36 }]],
    },
    {
      step: 0, dy: 146, amp: 14, off: c.off - 110, per: c.per * 0.8, jag: 4,
      kind: 'angular', tilt: 34, seed: 53,
      sil: [
        [rocks, FULL, { hMin: 20, hMax: 54, gap: 22 }],
        [scrub, FULL, { hMin: 10, hMax: 24, gap: 40 }],
      ],
    },
  ],

  // PALE GOLD MORNING, GRASSLAND. FOUR planes, and that is the repair of this
  // scene. Against a step-5 horizon a step-4 far plane measures 1.29:1 — it was
  // there and nobody could see it, which is what made this the washed-out one.
  // Starting the stack at step 3 buys 2.05:1 and turns the land into a dark
  // silhouette under a bright sky, which is what the reference does.
  //
  // Everything rolls: overlapping swells, a broken tower on a far knoll, two
  // lone trees for hard edges among all the soft ones, tall grass at the bottom.
  sip: (c) => [
    {
      step: 3, dy: -166, amp: 8, off: c.off + 90, per: c.per * 2.2, jag: 0.6,
      seed: 61, maxY: c.base - 153,
      sil: [
        [swells, FULL, { hMin: 9, hMax: 22, wMin: 70, wMax: 140 }],
        [ruin, [[254, 366]], { cx: 288, h: 52, w: 9, wall: 40 }],
        [canopy, [[80, 156]], { rMin: 19, rMax: 23, gap: 40, lift: 0.7 }],
      ],
    },
    {
      step: 2, dy: -96, amp: 12, off: c.off - 40, per: c.per * 1.5, jag: 1,
      tilt: -18, seed: 67,
      sil: [
        [swells, FULL, { hMin: 14, hMax: 34, wMin: 76, wMax: 154 }],
        [canopy, [[298, 374]], { rMin: 23, rMax: 27, gap: 40, lift: 0.62 }],
      ],
    },
    {
      step: 1, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 2.5, seed: 79,
      sil: [
        [swells, beside('sip', 66), { hMin: 12, hMax: 30, wMin: 70, wMax: 140 }],
        [blades, beside('sip', 92), { hMin: 7, hMax: 15, gap: 18 }],
      ],
    },
    {
      step: 0, dy: 88, amp: 14, off: c.off - 90, per: c.per * 0.9, jag: 3,
      tilt: -26, seed: 83,
      sil: [
        [swells, FULL, { hMin: 16, hMax: 40, wMin: 84, wMax: 170 }],
        [blades, FULL, { hMin: 16, hMax: 44, gap: 6 }],
      ],
    },
  ],

  // COLD SLATE, WINTER FOREST. Five bands of conifer, each shorter and a step
  // lighter than the one in front, so the forest dissolves into the mist at the
  // horizon. Two big near trees frame the edges; snow drifts at the bottom.
  read: (c) => [
    {
      step: 4, dy: -178, amp: 5, off: c.off + 100, per: c.per * 2.1, jag: 0.6,
      seed: 101, maxY: c.base - 153,
      sil: [[conifers, FULL, { hMin: 10, hMax: 24, gap: 3, wf: 0.4, tiers: 3 }]],
    },
    {
      step: 3, dy: -102, amp: 8, off: c.off - 60, per: c.per * 1.6, jag: 1,
      tilt: 12, seed: 103,
      sil: [[conifers, FULL, { hMin: 22, hMax: 48, gap: 5 }]],
    },
    {
      step: 2, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 2.5, seed: 107,
      sil: [
        [conifers, beside('read', 62), { hMin: 28, hMax: 58, gap: 9 }],
        [hummocks, beside('read', 84), { hMin: 4, hMax: 9 }],
      ],
    },
    {
      step: 1, dy: 80, amp: 12, off: c.off + 50, per: c.per * 1.1, jag: 2.5,
      tilt: -20, seed: 109,
      sil: [
        [conifers, [[-EDGE, 82], [318, ART_W + EDGE]], { hMin: 70, hMax: 116, gap: 6, wf: 0.3 }],
        [hummocks, FULL, { hMin: 10, hMax: 24 }],
      ],
    },
    {
      step: 0, dy: 148, amp: 12, off: c.off - 100, per: c.per * 0.85, jag: 3,
      tilt: 24, seed: 113,
      sil: [
        [hummocks, FULL, { hMin: 14, hMax: 34 }],
        [conifers, [[-EDGE, 130], [268, ART_W + EDGE]], { hMin: 46, hMax: 88, gap: 16, wf: 0.3 }],
      ],
    },
  ],

  // FOREST TEAL, THE CLIFF. Broadleaf masses instead of spires — the only scene
  // built from round shapes — with a hard vertical cliff face on the left of the
  // crest, and the sun caught in the branches of the big tree at x≈300.
  thinker: (c) => [
    {
      step: 4, dy: -170, amp: 6, off: c.off + 80, per: c.per * 2.1, jag: 0.6,
      seed: 131, maxY: c.base - 153,
      sil: [[conifers, FULL, { hMin: 8, hMax: 20, gap: 4, wf: 0.42, tiers: 3 }]],
    },
    {
      step: 3, dy: -96, amp: 9, off: c.off - 50, per: c.per * 1.55, jag: 1,
      tilt: -14, seed: 137,
      sil: [
        [canopy, [[-EDGE, 244]], { rMin: 15, rMax: 34, gap: 18, lift: 0.5 }],
        [canopy, [[252, ART_W + EDGE]], { rMin: 27, rMax: 48, gap: 14, lift: 0.66 }],
      ],
    },
    {
      step: 2, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 2.5, seed: 139,
      sil: [
        [cliff, [[-EDGE, 136]], { from: -EDGE, edge: 132, rise: 58 }],
        [canopy, [[268, ART_W + EDGE]], { rMin: 22, rMax: 34, gap: 18, lift: 0.5 }],
      ],
    },
    {
      // lift 0 on the near clumps ON PURPOSE. At the tree lift the canopy rides
      // up its trunk, and a 3px trunk is gone by the time the sheet is halved —
      // so a row of foreground bushes came out as blobs floating in mid-air.
      step: 1, dy: 76, amp: 12, off: c.off + 40, per: c.per * 1.1, jag: 2.5,
      tilt: 22, seed: 149,
      sil: [[canopy, FULL, { rMin: 18, rMax: 30, gap: 30, lift: 0 }]],
    },
    {
      step: 0, dy: 142, amp: 13, off: c.off - 80, per: c.per * 0.85, jag: 3,
      tilt: -26, seed: 151,
      sil: [
        [canopy, FULL, { rMin: 28, rMax: 44, gap: 4, lift: 0 }],
        [scrub, FULL, { hMin: 8, hMax: 20, gap: 34 }],
      ],
    },
  ],

  // NIGHT. Four planes, not five: the seam rule caps the farthest at the sky's
  // horizon step, and a step-4 treeline against a step-4 horizon is a treeline
  // nobody can see. So the moon rises out of a step-3 treeline, over a long open
  // slope with nothing on it — which is the whole point of the scene, and which
  // is also the slope the figure is read against.
  stargazer: (c) => [
    {
      step: 3, dy: -158, amp: 5, off: c.off + 110, per: c.per * 2, jag: 0.6,
      seed: 173, maxY: c.base - 153,
      sil: [[treeline, FULL, { hMin: 8, hMax: 21, band: 4 }]],
    },
    {
      step: 2, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 2.5, seed: 179,
      sil: [[scrub, beside('stargazer', 74), { hMin: 4, hMax: 10, gap: 52 }]],
    },
    {
      step: 1, dy: 76, amp: 12, off: c.off + 50, per: c.per * 1.15, jag: 3,
      kind: 'angular', tilt: -24, seed: 181,
      sil: [
        [scrub, FULL, { hMin: 9, hMax: 22, gap: 30 }],
        [rocks, FULL, { hMin: 9, hMax: 20, gap: 96 }],
      ],
    },
    {
      step: 0, dy: 142, amp: 14, off: c.off - 100, per: c.per * 0.85, jag: 3.5,
      kind: 'angular', tilt: 26, seed: 191,
      sil: [
        [scrub, FULL, { hMin: 14, hMax: 34, gap: 24 }],
        [rocks, FULL, { hMin: 14, hMax: 30, gap: 70 }],
      ],
    },
  ],

  // ROSE DUSK, THE LOOKOUT. The only scene whose ridges are `angular` all the way
  // down — broken rock, not rolling ground — rising to one spire at x≈288 whose
  // point stands inside the sun. A stone shelf closes the bottom.
  lookout: (c) => [
    {
      step: 4, dy: -176, amp: 9, off: c.off + 100, per: c.per * 1.9, jag: 1,
      kind: 'angular', seed: 211, maxY: c.base - 153,
      sil: [[rocks, FULL, { hMin: 5, hMax: 15, gap: 30 }]],
    },
    {
      step: 3, dy: -104, amp: 13, off: c.off - 60, per: c.per * 1.5, jag: 1.5,
      kind: 'angular', tilt: -16, seed: 223,
      sil: [
        [ridgeSpire, [[240, 340]], { cx: 288, h: 154, hw: 46, lean: -0.03, side: 1 }],
        [rocks, [[-EDGE, 236]], { hMin: 8, hMax: 24, gap: 34 }],
      ],
    },
    {
      step: 2, dy: 0, amp: c.amp, off: c.off, per: c.per, jag: 3,
      kind: 'angular', seed: 227,
      sil: [[rocks, beside('lookout', 62), { hMin: 8, hMax: 22, gap: 40 }]],
    },
    {
      // Crags here, the shelf only on the plane in front — two stone ledges one
      // above the other read as courses of brickwork, not as a lookout.
      step: 1, dy: 78, amp: 14, off: c.off + 50, per: c.per * 1.1, jag: 2.5,
      kind: 'angular', tilt: 26, seed: 229,
      sil: [[rocks, FULL, { hMin: 14, hMax: 36, gap: 34 }]],
    },
    {
      step: 0, dy: 148, amp: 12, off: c.off - 90, per: c.per * 0.85, jag: 3,
      kind: 'angular', tilt: -26, seed: 233,
      sil: [
        [shelf, FULL, { lift: 30 }],
        [rocks, FULL, { hMin: 18, hMax: 44, gap: 44 }],
      ],
    },
  ],
};

export function planesFor(key: SceneKey): Array<{ d: string; fill: string; step: number }> {
  const p = PALETTES[key];
  const c = CRESTS[key];
  return SCENE_PLANES[key](c).map((s) => {
    const seed = s.seed ?? 1;
    const pts = ridgePoints(
      s.kind ?? 'sine', c.base + s.dy, s.amp, s.off, s.per, s.jag,
      s.tilt ?? 0, seed, s.maxY ?? ART_H,
    );
    const yAt = sampler(pts);
    let extra = '', n = 0;
    for (const [make, spans, o] of s.sil ?? []) {
      for (const [a, b] of spans) {
        n += 1;
        if (b > a) extra += make(a, b, yAt, seed * 31 + n * 7, o ?? {});
      }
    }
    return { d: landPath(pts, extra.trim()), fill: p.steps[s.step], step: s.step };
  });
}

// ── the sky is not a bare gradient either ────────────────────────────────────

/** A lenticular cloud: lumpy on top, near-flat underneath. */
function cloudPoly(cx: number, cy: number, w: number, h: number, seed: number): string {
  const r = rnd(seed);
  const p1 = r() * 6.2832, p2 = r() * 6.2832;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 18; i++) {
    const u = i / 18;
    const env = Math.sin(Math.PI * u);
    const k = 0.66 + 0.2 * Math.sin(3.1 * u * Math.PI + p1) + 0.12 * Math.sin(5.7 * u * Math.PI + p2);
    pts.push([cx - w / 2 + w * u, cy - h * env * Math.max(0.25, k)]);
  }
  for (let i = 18; i >= 0; i--) {
    const u = i / 18;
    pts.push([cx - w / 2 + w * u, cy + h * 0.14 * Math.sin(Math.PI * u)]);
  }
  return poly(pts);
}

/** A long thin bar of mist, feathered at both ends. */
function mistPoly(y: number, x0: number, x1: number, h: number, seed: number): string {
  const r = rnd(seed);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const env = Math.pow(Math.sin(Math.PI * u), 0.5);
    pts.push([x0 + (x1 - x0) * u, y - h * env * (0.7 + r() * 0.5)]);
  }
  for (let i = 16; i >= 0; i--) {
    const u = i / 16;
    const env = Math.pow(Math.sin(Math.PI * u), 0.5);
    pts.push([x0 + (x1 - x0) * u, y + h * env * (0.25 + r() * 0.35)]);
  }
  return poly(pts);
}

/** Four-pointed stars, scattered. One band's worth of `d`, not one per star. */
function starField(x0: number, y0: number, x1: number, y1: number, n: number, seed: number): string {
  const r = rnd(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    const s = 0.9 + r() * 2;
    d += poly([
      [x, y - s], [x + s * 0.3, y - s * 0.3], [x + s, y], [x + s * 0.3, y + s * 0.3],
      [x, y + s], [x - s * 0.3, y + s * 0.3], [x - s, y], [x - s * 0.3, y - s * 0.3],
    ]) + ' ';
  }
  return d.trim();
}

export interface SkyBand { d: string; fill: string; opacity: number }

/**
 * Two to four flat bands of cloud or mist, drawn into the sky above the horizon.
 *
 * They are NOT gradients — the whole identity here is flat vector shapes with a
 * few tonal steps, so a band is one palette step at one opacity, and any
 * softness comes from how many bands overlap rather than from a blur. Fills are
 * always a step of the scene's own family, which is what keeps the six scenes
 * hue-disciplined while the shapes vary wildly.
 */
export function skyBandsFor(key: SceneKey): SkyBand[] {
  const s = PALETTES[key].steps;
  switch (key) {
    // Long dusk clouds catching the low sun, all below the sun's own height.
    case 'walk':
      return [
        { d: cloudPoly(210, 146, 300, 13, 2), fill: s[3], opacity: 0.34 },
        { d: cloudPoly(150, 268, 250, 15, 3), fill: s[3], opacity: 0.5 },
        { d: cloudPoly(268, 322, 300, 12, 5), fill: s[4], opacity: 0.42 },
        { d: cloudPoly(96, 372, 210, 9, 7), fill: s[4], opacity: 0.34 },
      ];
    // A pale sky needs its bands DARKER than it, not lighter, or nothing shows.
    case 'sip':
      return [
        { d: mistPoly(250, -20, 300, 11, 11), fill: s[3], opacity: 0.3 },
        { d: mistPoly(330, 100, 420, 9, 13), fill: s[3], opacity: 0.26 },
        { d: mistPoly(404, -20, 420, 13, 17), fill: s[4], opacity: 0.55 },
      ];
    // Winter mist: three bars stacked toward the horizon, the lowest thickest.
    case 'read':
      return [
        { d: mistPoly(300, -20, 260, 10, 19), fill: s[4], opacity: 0.28 },
        { d: mistPoly(370, 80, 420, 12, 23), fill: s[4], opacity: 0.36 },
        { d: mistPoly(432, -20, 420, 16, 29), fill: s[5], opacity: 0.44 },
      ];
    // Valley haze pooling under the canopy line.
    case 'thinker':
      return [
        { d: mistPoly(300, -20, 300, 12, 31), fill: s[4], opacity: 0.26 },
        { d: mistPoly(404, -20, 420, 15, 37), fill: s[5], opacity: 0.4 },
      ];
    // Stars, and two thin cloud bars crossing them. The star field is one band's
    // worth of path data, kept clear of the moon's box so nothing scatters over
    // it whichever order the surface draws in.
    case 'stargazer':
      return [
        { d: starField(10, 34, 390, 316, 54, 41), fill: s[5], opacity: 0.85 },
        { d: mistPoly(238, 40, 380, 7, 43), fill: s[2], opacity: 0.6 },
        { d: mistPoly(330, -20, 250, 9, 47), fill: s[3], opacity: 0.4 },
      ];
    // Three streaks raking across a rose dusk, one of them under the sun.
    default:
      return [
        { d: cloudPoly(120, 232, 230, 11, 53), fill: s[3], opacity: 0.5 },
        { d: cloudPoly(276, 296, 260, 9, 59), fill: s[4], opacity: 0.4 },
        { d: cloudPoly(150, 392, 320, 13, 61), fill: s[4], opacity: 0.46 },
      ];
  }
}

/** Gradient stops for the sky, top → horizon. */
export function skyStops(key: SceneKey): Array<{ offset: number; color: string }> {
  const p = PALETTES[key];
  return [
    { offset: 0, color: p.steps[p.sky[0]] },
    { offset: 0.62, color: p.steps[Math.round((p.sky[0] + p.sky[1]) / 2)] },
    { offset: 1, color: p.steps[p.sky[1]] },
  ];
}
