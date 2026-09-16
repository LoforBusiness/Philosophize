// ─────────────────────────────────────────────────────────────────────────────
// THE PEN STROKE A STAGE MARK DRAWS.
//
// ZERO IMPORTS, for the reason rig.ts and tone.ts have none: check:marks loads this in
// plain Node and proves every stroke stays inside the box the generator cleared.
//
// A mark is drawn the way a teacher marks a board, so every shape is a little off —
// a ring that overshoots where it started, an underline with a slight wave, a box whose
// last side runs past the corner. A perfect vector ellipse reads as UI chrome laid over
// the picture; a hand's reads as somebody pointing at it. The wobble is DETERMINISTIC,
// seeded per mark, so a lesson draws the same mark every time it is opened.
// ─────────────────────────────────────────────────────────────────────────────

export type MarkShape = 'ring' | 'underline' | 'bracket' | 'box' | 'arrowL' | 'arrowR';

export interface MarkStroke {
  /** SVG path data in the box's own coordinates, origin at its top-left. */
  d: string;
  /** Total drawn length, which the dash reveal needs. */
  len: number;
  /** Every point the stroke passes through, for the checker. */
  pts: [number, number][];
}

/** A stroke's inset from its box edge, so a round cap of half the width stays inside. */
export const MARK_INSET = 1.4;

/** The seed a mark's wobble is drawn from — one per lesson and beat, shared with check:marks. */
export function seedOf(s: string): number {
  let h = 2166136261;
  for (let k = 0; k < s.length; k += 1) h = Math.imul(h ^ s.charCodeAt(k), 16777619) >>> 0;
  return h;
}

function rng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function polyline(parts: [number, number][][]): MarkStroke {
  let d = '';
  let len = 0;
  const pts: [number, number][] = [];
  for (const run of parts) {
    run.forEach(([x, y], k) => {
      d += `${k ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)} `;
      if (k) len += Math.hypot(x - run[k - 1][0], y - run[k - 1][1]);
      pts.push([x, y]);
    });
  }
  return { d: d.trim(), len, pts };
}

/** The stroke for `shape` inside a `w` × `h` box. */
export function markPath(shape: MarkShape, w: number, h: number, seed: number): MarkStroke {
  const r = rng(seed);
  const i = MARK_INSET;
  const W = w - 2 * i;
  const H = h - 2 * i;
  const jit = (a: number) => (r() - 0.5) * 2 * a;

  switch (shape) {
    case 'ring': {
      // One loop and a little more, starting low-left the way a right hand starts one,
      // and the radius breathing slightly so it is drawn rather than stamped.
      //
      // A SQUIRCLE, NOT AN ELLIPSE. An ellipse inscribed in a box round a word passes
      // INSIDE the word's corners — the first render ran this ring through the R and the
      // S of REASONS — because a label is a rectangle and its corners sit at 45°. The
      // exponent below (|cos|^½, |sin|^½) is the superellipse of degree four: it keeps
      // the loop's round ends and swells its shoulders out past the corners, so the word
      // sits inside it at no extra width.
      const cx = w / 2, cy = h / 2;
      const rx = W / 2, ry = H / 2;
      const a0 = Math.PI * (0.78 + jit(0.05));
      const sweep = Math.PI * 2 * 1.1;
      const N = 44;
      const run: [number, number][] = [];
      const wob = 0.035;
      const ph = r() * Math.PI * 2;
      for (let k = 0; k <= N; k += 1) {
        const t = k / N;
        const a = a0 - sweep * t;
        // The overshoot runs slightly INSIDE the first pass, never outside the box.
        const s = (1 - wob) + wob * Math.sin(ph + t * 5) - (t > 0.9 ? (t - 0.9) * 0.6 : 0);
        const c = Math.cos(a), sn = Math.sin(a);
        run.push([cx + Math.sign(c) * Math.sqrt(Math.abs(c)) * rx * s, cy + Math.sign(sn) * Math.sqrt(Math.abs(sn)) * ry * s]);
      }
      return polyline([run]);
    }
    case 'underline': {
      const N = 18;
      const y0 = h * 0.4;
      const amp = Math.min(1.3, H * 0.2);
      const ph = r() * Math.PI * 2;
      const tilt = jit(0.8);
      const run: [number, number][] = [];
      for (let k = 0; k <= N; k += 1) {
        const t = k / N;
        run.push([i + W * t, y0 + tilt * t + Math.sin(ph + t * 6) * amp]);
      }
      return polyline([run]);
    }
    case 'bracket': {
      const lip = Math.min(6, W * 0.2);
      const left: [number, number][] = [[i + lip, i + jit(0.4)], [i, i + 0.6], [i + jit(0.3), i + H - 0.6], [i + lip, i + H + jit(0.3)]];
      const right: [number, number][] = [[i + W - lip, i + jit(0.4)], [i + W, i + 0.6], [i + W + jit(0.3), i + H - 0.6], [i + W - lip, i + H + jit(0.3)]];
      return polyline([left, right].map((run) => run.map(([x, y]) => [clamp(x, i, w - i), clamp(y, i, h - i)] as [number, number])));
    }
    case 'box': {
      // Four sides, the last one running a touch past its corner.
      const run: [number, number][] = [
        [i + 1.5, i + jit(0.4) + 0.5],
        [i + W, i + jit(0.4) + 0.5],
        [i + W + jit(0.3) - 0.3, i + H],
        [i, i + H + jit(0.3) - 0.3],
        [i + jit(0.3) + 0.3, i],
        [i + Math.min(8, W * 0.2), i + 0.4],
      ];
      return polyline([run.map(([x, y]) => [clamp(x, i, w - i), clamp(y, i, h - i)] as [number, number])]);
    }
    case 'arrowL':
    case 'arrowR': {
      // The shaft first, then the two strokes of the head — the order a hand draws it.
      const toRight = shape === 'arrowL';
      const mid = h / 2 + jit(0.8);
      const tail = toRight ? i : w - i;
      const tip = toRight ? w - i : i;
      const back = toRight ? -1 : 1;
      const head = Math.min(6, W * 0.3);
      const shaft: [number, number][] = [];
      for (let k = 0; k <= 8; k += 1) {
        const t = k / 8;
        shaft.push([tail + (tip - tail) * t, mid + Math.sin(t * Math.PI) * jit(0.9) * 0.6 + (h / 2 - mid) * t]);
      }
      const hy = h / 2;
      const barbA: [number, number][] = [[tip + back * head, clamp(hy - head * 0.8, i, h - i)], [tip, hy]];
      const barbB: [number, number][] = [[tip, hy], [tip + back * head, clamp(hy + head * 0.8, i, h - i)]];
      return polyline([shaft, barbA, barbB]);
    }
    default:
      return polyline([[[i, h / 2], [w - i, h / 2]]]);
  }
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}
