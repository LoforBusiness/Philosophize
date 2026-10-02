// ─────────────────────────────────────────────────────────────────────────────
// THE OBJECTS IN THE RANK PINS AND THE BADGES (2026-10-01).
//
// "They all pretty much look the same. There's not much difference other than the
// color and a little bit of different design." Measured against the sheets, the
// reader was right about why: every one of the forty-eight pins and seventy-four
// badges was a struck plate with a thin WHITE LINE ICON in the middle. Change the
// plate's colour and outline and it is still the same picture — a white glyph on a
// metal disc — so the eye files all of them under one heading.
//
// So the middle of every pin and badge is now an OBJECT, drawn in colour in the
// app's own illustration style (the Quick Start and profile pictures): flat fills,
// two tones a part with the light from the top left, and ONE dark outline round the
// whole object — the one concession to size, because these are drawn at 22 to 120
// points and a flat illustration with no edge dissolves at the small end. It sits in
// a lit WINDOW cut into the plate, so its colours read against something pale.
//
// A candle is wax and flame; a lighthouse is white and red over the sea; a crown is
// gold with a red stone. Forty-eight ranks and thirty-seven badges are now as many
// different pictures, and the metal frame round each says which order or tier.
//
// ── HOW AN OBJECT IS WRITTEN ────────────────────────────────────────────────
//
// A list of PARTS in a 100 × 100 box (y down), drawn back to front. Keep the object
// inside about 12…88 so it has air in its window. Each part is a path and a colour;
// `objectNodes` draws the outline of EVERY outlined part first, as one thick stroke
// under everything, and then the fills — so parts that touch share one outline and
// no seam is ruled between them (the rule Silhouette.tsx learned for the animals).
// A part with `edge: false` (a highlight, a shading facet, a detail stroke) draws no
// outline of its own.
//
// ZERO RUNTIME IMPORTS, like insigniaArt.ts: the sheets draw these in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

import type { Node } from './insigniaArt';

export interface Part {
  /** SVG path data in the 100 × 100 box. Curves and arcs are fine here. */
  d: string;
  /** Fill colour. */
  c: string;
  /** Draw this part's outline (default true). Highlights and facets set false. */
  edge?: boolean;
  /** Opacity, for a soft highlight. */
  o?: number;
  /** A stroke instead of a fill (a wick, a string, a line of text): its width. */
  w?: number;
}

/** The one outline colour, round every object. A warm near-black, never grey. */
export const OUT = '#2B2420';
/** How thick the outline is, in box units — doubled, because half sits under the fill. */
export const OUT_W = 6.5;

// ── colour ─────────────────────────────────────────────────────────────────

const hexIn = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hexOut = (c: number[]) =>
  '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export function mix(a: string, b: string, t: number): string {
  const x = hexIn(a), y = hexIn(b);
  return hexOut(x.map((v, i) => v + (y[i] - v) * t));
}
/** The lit face of a colour: toward white. */
export const lit = (c: string, t = 0.28) => mix(c, '#FFFFFF', t);
/** The shaded face: toward a warm black. */
export const dark = (c: string, t = 0.24) => mix(c, '#1E1712', t);

/**
 * THE PALETTE — named materials, so a candle's wax and a book's paper are the same
 * colour in every pin and the set reads as one hand. Saturated enough to be colour,
 * never neon: every value sits where the app's subject pictures sit.
 */
export const P = {
  wax: '#F3E6C8', flame: '#F2A23A', flameHot: '#FFD66B', ember: '#D35E36',
  paper: '#F7F1E1', page: '#EDE3CB', ink: '#2B2420',
  wood: '#9A6A44', woodDark: '#6E4A30', leather: '#A4462F', leatherDark: '#7A3324',
  gold: '#E3B23C', goldDark: '#B5852A', silver: '#C9CED6', steel: '#8C97A6', iron: '#5E6672',
  stone: '#C9C2B4', stoneDark: '#9C9384', marble: '#EEEAE2',
  leaf: '#6E9A4E', leafDark: '#4F7538', moss: '#8AA65A',
  sky: '#8EC5E0', sea: '#3E7FA6', night: '#2E3A66', violet: '#7E5CB0', rose: '#D9677A',
  red: '#C8463A', teal: '#3E8E86', jade: '#4FA37E', lapis: '#3A64B8', cream: '#FBF6EA',
  glass: '#BFE3EE', white: '#FFFFFF',
};

// ── shapes, as path data ───────────────────────────────────────────────────

const f = (v: number) => Math.round(v * 100) / 100;

/** A rectangle, optionally rounded. */
export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (!r) return `M${f(x)} ${f(y)} H${f(x + w)} V${f(y + h)} H${f(x)} Z`;
  const q = Math.min(r, w / 2, h / 2);
  return `M${f(x + q)} ${f(y)} H${f(x + w - q)} A${f(q)} ${f(q)} 0 0 1 ${f(x + w)} ${f(y + q)}`
    + ` V${f(y + h - q)} A${f(q)} ${f(q)} 0 0 1 ${f(x + w - q)} ${f(y + h)}`
    + ` H${f(x + q)} A${f(q)} ${f(q)} 0 0 1 ${f(x)} ${f(y + h - q)}`
    + ` V${f(y + q)} A${f(q)} ${f(q)} 0 0 1 ${f(x + q)} ${f(y)} Z`;
}
/** A circle. */
export function circ(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)} A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)} A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)} Z`;
}
/** An ellipse. */
export function ell(cx: number, cy: number, rx: number, ry: number): string {
  return `M${f(cx - rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)} Z`;
}
/** A closed polygon through points. */
export function poly(pts: [number, number][]): string {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z';
}
/** An open polyline, for a stroked part. */
export function line(pts: [number, number][]): string {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L');
}
/** A star of `n` points. */
export function starPath(cx: number, cy: number, r: number, inner: number, n: number, rot = -Math.PI / 2): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return poly(pts);
}
/** A flame: a teardrop with a lean, base at (cx, base). */
export function flame(cx: number, base: number, w: number, h: number, lean = 0): string {
  return `M${f(cx)} ${f(base)} C${f(cx - w * 0.75)} ${f(base)} ${f(cx - w * 0.62)} ${f(base - h * 0.55)} ${f(cx + lean)} ${f(base - h)}`
    + ` C${f(cx + w * 0.62)} ${f(base - h * 0.55)} ${f(cx + w * 0.75)} ${f(base)} ${f(cx)} ${f(base)} Z`;
}

// ── drawing ────────────────────────────────────────────────────────────────

/** The grey a locked insignia's object is drawn in: its own lightness, no hue. */
function locked(c: string): string {
  const [r, g, b] = hexIn(c);
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const v = 175 + (l / 255) * 62;
  return hexOut([v - 2, v, v + 4]);
}

/**
 * An object's parts as insignia nodes: every outline first, as one thick stroke the
 * fills then sit on, so touching parts share a single edge.
 */
export function objectNodes(parts: Part[], isLocked = false): Node[] {
  const tone = (c: string) => (isLocked ? locked(c) : c);
  const out: Node[] = [];
  const edge = isLocked ? '#AAB1BC' : OUT;
  for (const p of parts) {
    if (p.edge === false) continue;
    out.push({ k: 'line', d: p.d, c: edge, w: (p.w ?? 0) + OUT_W });
  }
  for (const p of parts) {
    if (p.w) out.push({ k: 'line', d: p.d, c: tone(p.c), w: p.w, o: p.o });
    else out.push({ k: 'fill', d: p.d, c: tone(p.c), o: p.o });
  }
  return out;
}

/** Shorthand for writing parts. */
export const fill = (d: string, c: string, edge = true): Part => ({ d, c, edge });
export const hi = (d: string, c: string, o = 1): Part => ({ d, c, edge: false, o });
export const stroke = (d: string, c: string, w: number, edge = true): Part => ({ d, c, w, edge });
