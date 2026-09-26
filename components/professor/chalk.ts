import { GLYPHS, CAP_TOP, BASELINE } from './hershey';
import type { ChalkId } from './professorScript';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE CHALK WRITES, AND WHEN EACH STROKE OF IT IS DRAWN.
//
// Each of the professor's six lines puts one drawing on the board, and the drawing
// writes itself as he speaks (docs/superpowers/specs/2026-09-25-hard-paywall-
// professor-intro-design.md). This lays each drawing out as PIECES — a word, or one
// shape — in BOARD units (BOARD_W × BOARD_H), and gives every stroke a window of the
// line's chalk time.
//
// A PIECE IS ONE <Svg>, sized to its own box (CLAUDE.md §17 rule 7, §19's GPU
// budget): a board-sized SVG redrawn every frame is the most expensive way to draw
// a few lines of chalk. Inside a piece every stroke has its own dash reveal.
//
// THE PEN HOLDS ONE SPEED. Time is dealt by stroke LENGTH, with a small allowance
// for lifting the chalk between pieces, the way the launch drawing deals its
// schedule — so a long word takes longer than a short one, and nothing races.
//
// HAND, NOT TYPE. Every point is nudged by a tiny DETERMINISTIC wobble keyed on the
// drawing and the stroke, so the letters look written and the same frame is drawn
// the same way on every phone and every run.
//
// ZERO IMPORTS BEYOND ITS OWN SIBLINGS, both zero-import, so `check:professor` and
// `sheet:chalk` run it in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

export const BOARD_W = 262;
export const BOARD_H = 166;
/** Chalk line width, in board units. */
export const CHALK_W = 1.9;
/** A lift of the chalk between pieces, charged as this much drawing. */
const LIFT = 14;

export interface ChalkStroke {
  /** SVG path data, in the piece's own coordinates. */
  d: string;
  /** Length in board units, which the dash reveal uses. */
  len: number;
  /** When the stroke starts and ends, as fractions (0..1) of the line's chalk window. */
  t0: number;
  t1: number;
}

export interface ChalkPiece {
  /** Where the piece sits on the board, board units. */
  box: { x: number; y: number; w: number; h: number };
  strokes: ChalkStroke[];
  /** The piece's own window: its first stroke's t0 to its last stroke's t1. */
  t0: number;
  t1: number;
  /** The words it spells, if it is a word — for the checker. */
  text?: string;
}

type Poly = number[]; // flat x, y pairs, board units

// ── a deterministic wobble ───────────────────────────────────────────────────
function hash(n: number): number {
  let h = (n | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return ((h >>> 0) % 10000) / 10000 - 0.5;
}

function wobble(p: Poly, seed: number, amp: number): Poly {
  return p.map((v, i) => v + hash(seed * 131 + i) * 2 * amp);
}

function lengthOf(p: Poly): number {
  let n = 0;
  for (let i = 2; i < p.length; i += 2) n += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
  return n;
}

// ── writing ──────────────────────────────────────────────────────────────────

/** The width a string sets at a cap height, board units. */
export function textWidth(str: string, cap: number): number {
  const k = cap / (BASELINE - CAP_TOP);
  const tr = trackFor(cap);
  let w = 0;
  for (const ch of normalise(str)) w += (ch === ' ' ? 12 : (GLYPHS[ch]?.w ?? 12)) * k * tr;
  return w;
}
/**
 * Hershey's sans is set loose for a plotter, and large chalk by hand runs a little
 * tighter. SMALL chalk must not: the line is the same width at any size, so at a
 * small cap height tight letters close up into a smear. Measured on the sheet —
 * METAPHYSICS at 11 units ran its letters together at 0.9.
 */
function trackFor(cap: number): number {
  return cap >= 16 ? 0.9 : cap <= 10 ? 1.06 : 0.9 + (16 - cap) * (0.16 / 6);
}

/** Chaikin's corner cutting: a large glyph's straight segments read as a polygon. */
function smooth(p: Poly, passes: number): Poly {
  let q = p;
  for (let n = 0; n < passes; n += 1) {
    if (q.length < 6) return q;
    const out: Poly = [q[0], q[1]];
    for (let i = 0; i + 3 < q.length; i += 2) {
      out.push(0.75 * q[i] + 0.25 * q[i + 2], 0.75 * q[i + 1] + 0.25 * q[i + 3]);
      out.push(0.25 * q[i] + 0.75 * q[i + 2], 0.25 * q[i + 1] + 0.75 * q[i + 3]);
    }
    out.push(q[q.length - 2], q[q.length - 1]);
    q = out;
  }
  return q;
}

function normalise(str: string): string {
  return str.toUpperCase().replace(/[’‘]/g, "'");
}

/**
 * One piece before layout: its strokes as flat point lists in BOARD units, and the
 * words it spells if it is a word. The builders below make these; `layoutRaws`
 * turns a list of them into timed pieces. PUBLIC since 2026-09-25, so a lesson can
 * write its own boards in the same chalk (logic-arguments-1 does).
 */
export interface ChalkRaw { polys: Poly[]; text?: string }
type Raw = ChalkRaw;

/**
 * A line of chalk lettering with its cap top at `y`. `align` places it at `x`
 * (left edge, centre or right edge); `maxW` shrinks the cap height until it fits.
 */
export function text(str: string, x: number, y: number, cap: number, opts: { align?: 'left' | 'center'; maxW?: number } = {}): Raw {
  let c = cap;
  if (opts.maxW) while (c > 6 && textWidth(str, c) > opts.maxW) c -= 0.5;
  const k = c / (BASELINE - CAP_TOP);
  const tr = trackFor(c);
  const w = textWidth(str, c);
  let pen = opts.align === 'center' ? x - w / 2 : x;
  const polys: Poly[] = [];
  for (const ch of normalise(str)) {
    if (ch === ' ') { pen += 12 * k * tr; continue; }
    const g = GLYPHS[ch];
    if (!g) { pen += 12 * k * tr; continue; }
    for (const s of g.s) {
      const p: Poly = [];
      for (let i = 0; i < s.length; i += 2) p.push(pen + s[i] * k, y + (s[i + 1] - CAP_TOP) * k);
      // Only large letters are smoothed: small ones have too few points to lose.
      polys.push(c >= 28 ? smooth(p, 2) : p);
    }
    pen += g.w * k * tr;
  }
  return { polys, text: str };
}

export const line = (x1: number, y1: number, x2: number, y2: number): Raw => ({ polys: [[x1, y1, x2, y2]] });

/** Any freehand stroke: a flat list of x, y pairs, board units. */
export const stroke = (...pts: number[]): Raw => ({ polys: [pts] });

/** A line ending in an arrowhead at (x2, y2). */
export function arrow(x1: number, y1: number, x2: number, y2: number, head = 7): Raw {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const l = [x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head];
  const r = [x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head];
  return { polys: [[x1, y1, x2, y2], [l[0], l[1], x2, y2, r[0], r[1]]] };
}

/** A hand-drawn loop: an ellipse that overshoots where it began, as a hand does. */
export function loop(cx: number, cy: number, rx: number, ry: number, from = -2.8, sweep = 6.9): Raw {
  const p: Poly = [];
  const n = 48;
  for (let i = 0; i <= n; i += 1) {
    const a = from + (sweep * i) / n;
    const r = 1 + 0.05 * Math.sin(a * 1.7);
    p.push(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r);
  }
  return { polys: [p] };
}

/** A shallow arc from (x1, y) to (x2, y), sagging `sag` below: a pan, or an underline. */
export function arc(x1: number, x2: number, y: number, sag: number): Raw {
  const p: Poly = [];
  const n = 12;
  for (let i = 0; i <= n; i += 1) {
    const u = i / n;
    p.push(x1 + (x2 - x1) * u, y + sag * 4 * u * (1 - u));
  }
  return { polys: [p] };
}

export const tick = (x: number, y: number, s: number): Raw => ({ polys: [[x, y + 0.45 * s, x + 0.35 * s, y + 0.85 * s, x + s, y - 0.1 * s]] });
export const cross = (x1: number, y1: number, x2: number, y2: number): Raw => ({ polys: [[x1, y1, x2, y2], [x2, y1, x1, y2]] });

// ── the six boards ───────────────────────────────────────────────────────────

const W = BOARD_W;

function board(id: ChalkId): Raw[] {
  switch (id) {
    case 'title':
      return [
        text('Lecture one', W / 2, 36, 24, { align: 'center', maxW: W - 30 }),
        arc(56, W - 56, 76, 3),
        text('What you will learn', W / 2, 98, 11, { align: 'center', maxW: W - 40 }),
      ];
    case 'branches': {
      const L = 16, R = W / 2 + 8, colW = W / 2 - 22;
      return [
        text('Six branches', W / 2, 12, 14, { align: 'center' }),
        arc(70, W - 70, 36, 2),
        text('Metaphysics', L, 56, 11, { maxW: colW }),
        text('Epistemology', L, 90, 11, { maxW: colW }),
        text('Logic', L, 124, 11, { maxW: colW }),
        text('Ethics', R, 56, 11, { maxW: colW }),
        text('Aesthetics', R, 90, 11, { maxW: colW }),
        text('Politics', R, 124, 11, { maxW: colW }),
      ];
    }
    case 'logic_ethics': {
      // LEFT: a bad argument, crossed out — affirming the consequent. RIGHT: a
      // balance, the oldest picture there is of deciding what is right. The
      // argument gets the wider column: it has to be READ before it is struck out.
      const colW = W * 0.56 - 14;
      const bx = W * 0.79;
      return [
        text('Logic', 10 + colW / 2, 12, 13, { align: 'center' }),
        text('Rain makes it wet', 10, 44, 10, { maxW: colW }),
        text('It is wet', 10, 66, 10, { maxW: colW }),
        line(10, 84, 10 + colW * 0.78, 84),
        text('So it rained', 10, 92, 10, { maxW: colW }),
        cross(6, 38, 12 + colW * 0.92, 110),
        text('Ethics', bx, 12, 13, { align: 'center' }),
        // the balance: stand, base, beam, two strings a side, two pans
        line(bx, 136, bx, 52),
        line(bx - 22, 138, bx + 22, 138),
        line(bx - 38, 66, bx + 38, 59),
        line(bx - 38, 66, bx - 48, 96), line(bx - 38, 66, bx - 28, 96),
        arc(bx - 52, bx - 24, 96, 7),
        line(bx + 38, 59, bx + 28, 87), line(bx + 38, 59, bx + 48, 87),
        arc(bx + 24, bx + 52, 87, 7),
      ];
    }
    case 'epistemology':
      return [
        text('?', W / 2, 10, 74, { align: 'center' }),
        text('How do you know?', W / 2, 104, 14, { align: 'center', maxW: W - 30 }),
        arc(60, W - 60, 126, 2.5),
      ];
    case 'format': {
      const rows = ['Short', 'Narrated', 'Animated'];
      const out: Raw[] = [];
      rows.forEach((r, i) => {
        const y = 18 + i * 44;
        out.push(text(r, 40, y, 17, { maxW: 150 }));
        out.push(tick(196, y, 18));
      });
      return out;
    }
    case 'pass':
      return [
        text('Scholar’s Pass', W / 2, 18, 17, { align: 'center', maxW: W - 30 }),
        arc(40, W - 40, 44, 2.5),
        text('3 days free', W / 2, 84, 19, { align: 'center', maxW: W - 70 }),
        loop(W / 2, 94, 100, 30),
      ];
  }
}

// ── pieces, and their time ───────────────────────────────────────────────────

const round = (v: number) => Math.round(v * 10) / 10;

/**
 * The drawing for one of the professor's lines, as pieces with every stroke's window
 * set. Deterministic: the same id always lays out the same way.
 */
export function layoutChalk(id: ChalkId): ChalkPiece[] {
  return layoutRaws(board(id), id);
}

/**
 * Any list of pieces, laid out and timed: every stroke's window dealt by length
 * across 0..1, with a lift between pieces. `seed` keys the hand-drawn wobble, so the
 * same board is drawn the same way on every run.
 */
export function layoutRaws(raws: readonly ChalkRaw[], seed: string): ChalkPiece[] {
  const seedBase = seed.split('').reduce((n, c) => n * 31 + c.charCodeAt(0), 7);
  // Wobble scales with the stroke's size, but never past a third of a unit.
  const pieces = raws.map((r, pi) => {
    const polys = r.polys.map((p, si) => wobble(p, seedBase + pi * 97 + si, 0.3));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of polys) {
      for (let i = 0; i < p.length; i += 2) {
        x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]);
        y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]);
      }
    }
    const pad = CHALK_W;
    const box = { x: round(x0 - pad), y: round(y0 - pad), w: round(x1 - x0 + pad * 2), h: round(y1 - y0 + pad * 2) };
    const strokes = polys.map((p) => {
      let d = '';
      for (let i = 0; i < p.length; i += 2) d += `${i ? 'L' : 'M'}${round(p[i] - box.x)} ${round(p[i + 1] - box.y)}`;
      return { d, len: lengthOf(p), t0: 0, t1: 0 };
    });
    return { box, strokes, t0: 0, t1: 0, text: r.text } as ChalkPiece;
  });

  // Deal the time by length, with a lift between pieces.
  const total = pieces.reduce((n, p) => n + p.strokes.reduce((m, s) => m + s.len, 0), 0) + LIFT * (pieces.length - 1);
  let acc = 0;
  pieces.forEach((p, pi) => {
    if (pi > 0) acc += LIFT;
    p.t0 = acc / total;
    for (const s of p.strokes) {
      s.t0 = acc / total;
      acc += s.len;
      s.t1 = acc / total;
      s.len = round(s.len);
    }
    p.t1 = acc / total;
  });
  return pieces;
}
