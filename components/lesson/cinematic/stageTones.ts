// ─────────────────────────────────────────────────────────────────────────────
// THE STAGE TAKES ITS LESSON'S BRANCH HUE — AT THE GREY'S OWN LUMINANCE.
//
// The picture above the words was INK · PAPER · RULE · STONE · SHADE and nothing
// else, while everything below it — the controls, the kicker, the coin, the
// verdict — had been struck in the lesson's branch colour since R18. So a reader
// met a coloured question under a grey diagram, and the owner named the diagram:
// they want the visuals above the words to look like Imprint's, and Imprint's are
// in colour.
//
// The hue is NOT a new decision. `questionTone.accentOf` already derives a whole
// struck ramp from `BRANCH`, one hue per lesson, and `check:controls` already
// measures it. This file is that same rule carried above the words, so a lesson is
// one colour from its ground line to its answer button rather than two.
//
// ── WHY LUMINANCE IS HELD EXACTLY, AND WHAT THAT BUYS ───────────────────────
//
// Every caption in 244 scenes was measured against the grey it sits on —
// `check:shade` pairs a fill with its word three different ways, and STONE is the
// tone where SOFT already fails at 3.26:1. A hued mass at a DIFFERENT lightness
// re-opens every one of those pairings and costs a corpus-wide re-measure.
//
// So these tones keep their grey's relative luminance to the fourth decimal. Ink
// on STONE is 10.63:1 before and 10.6:1 after, on all six branches. Nothing a
// scene draws moves, no box changes, no stamp goes stale, and `check:shade`'s
// existing verdicts stay true. The colour is free.
//
// ── AND WHY THE CHROMA CLIMBS AS THE TONE DARKENS ───────────────────────────
//
// The obvious construction — mix the branch hue toward paper until it hits the
// grey's luminance — was built first and it FAILS, for a measured reason. Mixing
// toward paper desaturates, and the greys here are themselves warm and
// near-neutral (C* 4.8–7.6), so at matched lightness the two warm branches land
// on top of them: ethics ΔE 1.5 and aesthetics ΔE 0.4 against the grey they were
// replacing. §19's `WASH` rendered as white at ΔE 5.0. Four of six branches would
// have shipped a tint nobody could see, which is worse than no tint at all
// because the source would claim otherwise.
//
// Holding L* and taking C* UP instead is exact. What it cannot do is go far: at
// C* 26 a light mass is #92d3f5 and #85d7e2 — sky blue and cyan, which is
// precisely the corner `design.ts` records its own colour search falling into
// ("electric magenta … neon mint"). Light plus saturated is candy; mid plus
// saturated is rich. Hence the ramp:
//
//   RULE   L* 89.5   C* 10   a hairline and the floor — a warm breath, not a hue
//   STONE  L* 81.4   C* 14   the light mass — tinted paper, not a painted slab
//   SHADE  L* 66.8   C* 20   the shaded side — where the colour is allowed to be rich
//
// The set stays inside the owner's own band: five tame colours at C* 10–33, one
// spark at C* 62. Nothing here is the spark.
//
// ── THE THIRD RUNG IS THE POINT, NOT THE COLOUR ─────────────────────────────
//
// 237 scenes use STONE, 244 use RULE and **4 use SHADE**. The tonal pass gave the
// corpus a light mass and stopped; a mass with no shaded side is a shape, not an
// object, and that is most of what reads as flat. SHADE is exported here in the
// same breath as the hue so the codemod that hues a scene can also give its masses
// a lit and a shaded face, which is the one light this app has lit everything by
// since `tone.ts`.
//
// ZERO REACT, so `check:stage` can load it in plain Node and re-derive every
// number above rather than trusting this comment.
// ─────────────────────────────────────────────────────────────────────────────
import { BRANCH, C, type BranchKey } from '@/constants/design';

/** The greys these tones stand in for. Their luminance is the contract. */
export const GREY = {
  RULE: '#E4E1D8',
  STONE: '#CFCABC',
  SHADE: '#A8A296',
} as const;

/** Chroma per rung — light stays tame, dark may be rich. See the header. */
export const CHROMA = { RULE: 10, STONE: 14, SHADE: 20 } as const;

// ── colour maths, self-contained so a checker needs no browser ──────────────
const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
const lin = (c: number) => { const u = c / 255; return u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; };
const unlin = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
const fi = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);

/** Relative luminance, WCAG. */
export function lum(h: string): number {
  const [r, g, b] = hx(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** CIELAB. */
export function lab(h: string): [number, number, number] {
  const [r, g, b] = hx(h).map(lin);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function fromLab(L: number, a: number, b2: number) {
  const y = (L + 16) / 116, x = y + a / 500, z = y - b2 / 200;
  const X = fi(x) * 0.95047, Y = fi(y), Z = fi(z) * 1.08883;
  const r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  const g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  const b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  return { rgb: [unlin(r), unlin(g), unlin(b)] as [number, number, number],
    inGamut: [r, g, b].every((v) => v >= -0.002 && v <= 1.002) };
}
/** CIE76 distance — the metric `design.ts` places the whole palette by. */
export function deltaE(p: string, q: string): number {
  const A = lab(p), B = lab(q);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}

/**
 * `hue`'s own hue angle, set at `grey`'s lightness and the given chroma.
 *
 * Chroma is walked DOWN until the result is inside sRGB, so a hue whose angle
 * cannot hold C* at that lightness degrades to the most it can rather than
 * clipping to a channel and landing on some other colour entirely.
 */
export function atGrey(hue: string, grey: string, chroma: number): string {
  const L = lab(grey)[0];
  const [, , h] = (() => { const [Ll, a, b] = lab(hue); return [Ll, Math.hypot(a, b), Math.atan2(b, a)]; })();
  for (let c = chroma; c > 0; c -= 0.25) {
    const r = fromLab(L, c * Math.cos(h), c * Math.sin(h));
    if (r.inGamut) return toHex(...r.rgb);
  }
  return grey;
}

export interface StageTone {
  /** Hairlines, the ground line and the floor the scene lays down. */ RULE: string;
  /** The light mass — slabs, tablets, walls, cards meant to read solid. */ STONE: string;
  /** The shaded side of a mass, or a heavier object behind a lighter one. */ SHADE: string;
  /** The branch hue itself, for a rim or a mark. Never a large fill. */ EDGE: string;
}

const CACHE = new Map<string, StageTone>();

/** The stage palette for a branch hue. */
export function stageToneOf(hue: string): StageTone {
  const got = CACHE.get(hue);
  if (got) return got;
  const t: StageTone = {
    RULE: atGrey(hue, GREY.RULE, CHROMA.RULE),
    STONE: atGrey(hue, GREY.STONE, CHROMA.STONE),
    SHADE: atGrey(hue, GREY.SHADE, CHROMA.SHADE),
    EDGE: hue,
  };
  CACHE.set(hue, t);
  return t;
}

/**
 * Scene-file prefix → branch. The three that predate the naming convention are
 * named rather than parsed, because guessing a branch from `valid3Scene` is how a
 * lesson silently gets another branch's colour.
 */
const PREFIX: Record<string, BranchKey> = {
  metaphysics: 'metaphysics',
  epistemology: 'epistemology',
  logic: 'logic',
  ethics: 'ethics',
  aesthetics: 'aesthetics',
  political: 'political-philosophy',
  // The three older scenes, from before scenes were named for their branch.
  valid: 'logic',
  strong: 'logic',
  knowHow: 'epistemology',
};

/** The stage palette for a branch key, or the app's own petrol outside the six. */
export function stageTone(branch: BranchKey | keyof typeof PREFIX | null): StageTone {
  if (!branch) return stageToneOf(C.HUE);
  const key = (PREFIX as Record<string, BranchKey>)[branch] ?? (branch as BranchKey);
  return stageToneOf(BRANCH[key] ?? C.HUE);
}
