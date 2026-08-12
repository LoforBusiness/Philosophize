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

export const PALETTES: Record<SceneKey, Palette> = {
  // amber dusk — low sun behind a long ridge
  walk: {
    steps: ['#3A2A26', '#5E4038', '#8A5E45', '#B98A5E', '#DFB98A', '#F2DCBC'],
    disc: '#FFE0A8',
    sky: [5, 3],
  },
  // pale gold morning — high hazy sun over a grass crest
  sip: {
    steps: ['#2E2B25', '#55503F', '#837A5F', '#B0A585', '#D8CFB4', '#F1EBDA'],
    disc: '#FFF4D2',
    sky: [5, 3],
  },
  // cool slate — a pale disc through winter mist
  read: {
    steps: ['#1E232A', '#3A424B', '#5A6773', '#8794A0', '#B4BFC8', '#DEE5EA'],
    disc: '#F2F6F8',
    sky: [5, 3],
  },
  // forest teal — deep canopy, a cliff edge, a valley below
  thinker: {
    steps: ['#122A25', '#24473F', '#3A6357', '#5C8779', '#8FB3A4', '#C4D8CE'],
    disc: '#DCEFE4',
    sky: [4, 3],
  },
  // dusk blue — THE NIGHT SCENE. Sky is the DARK end, so chrome comes out cream.
  // This is the case a fixed "the sky is always light" rule would have banned.
  stargazer: {
    steps: ['#12161F', '#2C3849', '#465468', '#6B7A8E', '#9BA7B6', '#D3DAE2'],
    disc: '#E8EDF4',
    sky: [0, 2],
  },
  // muted rose dusk — receding ridges to a far spire
  lookout: {
    steps: ['#2A1E28', '#503A48', '#785764', '#A67F85', '#CDAAA8', '#EFDCD4'],
    disc: '#FFDCC0',
    sky: [5, 3],
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

/** A ridge filled down to the bottom edge — land reads as mass, not as a wire. */
function ridgePath(base: number, amp: number, off: number, per: number, jag: number): string {
  let d = `M-20 ${(base - Math.sin((-20 - off) / per) * amp).toFixed(1)}`;
  for (let x = 0; x <= ART_W + 20; x += 20) {
    const y = base - Math.sin((x - off) / per) * amp
      + Math.sin(x * 0.37 + off) * jag;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${ART_W + 20} ${ART_H + 20} L-20 ${ART_H + 20} Z`;
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

/** Where each scene's one celestial anchor sits, and how big it is. */
const DISCS: Record<SceneKey, { cx: number; cy: number; r: number }> = {
  walk:      { cx: 296, cy: 330, r: 54 },
  sip:       { cx: 118, cy: 208, r: 46 },
  read:      { cx: 250, cy: 250, r: 38 },
  thinker:   { cx: 210, cy: 372, r: 44 },
  // The moon is LARGE and sits low, so the reclining figure is silhouetted
  // against it. On a dark-sky scene that disc is the only thing that can keep an
  // ink figure readable — see the figure-band check in Task 5.
  stargazer: { cx: 214, cy: 470, r: 96 },
  lookout:   { cx: 232, cy: 400, r: 78 },
};

export function discFor(key: SceneKey): { d: string; fill: string } {
  const { cx, cy, r } = DISCS[key];
  return { d: discPath(cx, cy, r), fill: PALETTES[key].disc };
}

/**
 * The receding planes, BACK TO FRONT.
 *
 * `step` is the palette index, and it must DECREASE toward the viewer — depth is
 * carried by value, not by detail. That is the single thing every reference
 * image has in common, and the thing the old scenes did not do at all.
 */
export function planesFor(key: SceneKey): Array<{ d: string; fill: string; step: number }> {
  const p = PALETTES[key];
  const c = CRESTS[key];
  const spec: Array<{ dy: number; amp: number; off: number; per: number; jag: number; step: number }> = [
    { dy: -150, amp: c.amp * 0.5, off: c.off + 120, per: c.per * 1.9, jag: 0,   step: 4 },
    { dy: -104, amp: c.amp * 0.7, off: c.off - 70,  per: c.per * 1.5, jag: 1.5, step: 3 },
    { dy: -58,  amp: c.amp * 0.9, off: c.off + 40,  per: c.per * 1.2, jag: 2.5, step: 2 },
    { dy: 0,    amp: c.amp,       off: c.off,       per: c.per,       jag: 3.5, step: 1 },
    { dy: 96,   amp: c.amp * 1.3, off: c.off - 110, per: c.per * 0.8, jag: 6,   step: 0 },
  ];
  return spec.map((s) => ({
    d: ridgePath(c.base + s.dy, s.amp, s.off, s.per, s.jag),
    fill: p.steps[s.step],
    step: s.step,
  }));
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
