// ─────────────────────────────────────────────────────────────────────────────
// ANY SHAPE, FROM VIEWS — the geometry behind SetArt.
//
// Owner, 2026-09-28: *"the objects in the second scene … seem to be more cheap …
// if a stick man walks on a road, it needs to look like he's walking on a road."*
//
// `objects.ts` builds everything from ellipses, rectangles, bars and isosceles
// triangles, which is enough for a crate and not enough for a PLACE: a road that
// narrows into the distance is a trapezoid at an angle, a mountain range is a
// ragged polygon, a roof is a pitched one, a waterfall spreads as it falls. Built
// from boxes they come out as the bars and blobs the owner called cheap.
//
// So a set can now name a POLYGON by its corners. It is cut into triangles (ear
// clipping, so it may be concave), and each triangle is ONE View: the classic
// border triangle, laid along the triangle's longest edge and rotated into place.
// Still Views, never SVG, for the reason §17 rule 7 gives — and one more that is
// new with the scene change: an SVG is rasterised at its layout size, so a set
// zoomed nine times over would draw a blurred bitmap, where a View is re-drawn
// crisp at every scale.
//
// Zero imports, like rig.ts and objects.ts, so it runs in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'mass' | 'face' | 'dark' | 'lit' | 'line';

/** A polygon by its corners, flat: `[x0, y0, x1, y1, …]`, in stage units. */
export interface PolyPart { k: 'poly'; role: Role; pts: readonly number[] }
export const oPoly = (role: Role, pts: readonly number[]): PolyPart => ({ k: 'poly', role, pts });

/** One triangle, ready to draw: where its base starts, how it is turned, and its border widths. */
export interface TriBox { x: number; y: number; rot: number; left: number; right: number; h: number }

function area2(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function inside(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
  const d1 = area2(px, py, ax, ay, bx, by);
  const d2 = area2(px, py, bx, by, cx, cy);
  const d3 = area2(px, py, cx, cy, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Cut a simple polygon into triangles (ear clipping). Returns flat [ax,ay,bx,by,cx,cy, …]. */
export function triangulate(pts: readonly number[]): number[] {
  const n = pts.length / 2;
  const idx: number[] = [];
  for (let i = 0; i < n; i++) idx.push(i);
  let signed = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    signed += pts[2 * i] * pts[2 * j + 1] - pts[2 * j] * pts[2 * i + 1];
  }
  const ccw = signed > 0;
  const out: number[] = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 1000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const a = idx[(k + idx.length - 1) % idx.length];
      const b = idx[k];
      const c = idx[(k + 1) % idx.length];
      const ax = pts[2 * a], ay = pts[2 * a + 1];
      const bx = pts[2 * b], by = pts[2 * b + 1];
      const cx = pts[2 * c], cy = pts[2 * c + 1];
      const cr = area2(ax, ay, bx, by, cx, cy);
      if (ccw ? cr <= 0 : cr >= 0) continue; // a reflex corner is not an ear
      let blocked = false;
      for (const o of idx) {
        if (o === a || o === b || o === c) continue;
        if (inside(pts[2 * o], pts[2 * o + 1], ax, ay, bx, by, cx, cy)) { blocked = true; break; }
      }
      if (blocked) continue;
      out.push(ax, ay, bx, by, cx, cy);
      idx.splice(k, 1);
      cut = true;
      break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) {
    const [a, b, c] = idx;
    out.push(pts[2 * a], pts[2 * a + 1], pts[2 * b], pts[2 * b + 1], pts[2 * c], pts[2 * c + 1]);
  }
  return out;
}

/**
 * A triangle grown outward by `g`, to close the seams between the pieces of one
 * polygon's FILL. Each corner moves out along its own bisector, by at most `2g`:
 * the exact offset of a corner is g / sin(half its angle), and ear clipping makes
 * slivers whose corners are a degree or two — grown exactly, those threw spikes the
 * length of the stage (the first render of the crossroads had one off every peak).
 * The OUTLINE is not drawn this way at all; see `edgesOf`.
 */
export function growTri(t: readonly number[], g: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < 3; k++) {
    const px = t[2 * k], py = t[2 * k + 1];
    const ax = t[2 * ((k + 1) % 3)], ay = t[2 * ((k + 1) % 3) + 1];
    const bx = t[2 * ((k + 2) % 3)], by = t[2 * ((k + 2) % 3) + 1];
    let ux = px - ax, uy = py - ay;
    let vx = px - bx, vy = py - by;
    const ul = Math.hypot(ux, uy) || 1, vl = Math.hypot(vx, vy) || 1;
    ux /= ul; uy /= ul; vx /= vl; vy /= vl;
    let dx = ux + vx, dy = uy + vy;
    const dl = Math.hypot(dx, dy);
    if (dl < 1e-6) { out.push(px, py); continue; }
    dx /= dl; dy /= dl;
    const half = Math.acos(Math.max(-1, Math.min(1, ux * vx + uy * vy))) / 2;
    const d = Math.min(g / Math.max(Math.sin(half), 1e-3), 2 * g);
    out.push(px + dx * d, py + dy * d);
  }
  return out;
}

/**
 * A polygon's OUTLINE, as the bars along its edges: each edge a capsule `2g` thick,
 * centred on the edge, so half of it lies outside the fill and the rounded caps make
 * the joins round — the same look Silhouette gets by growing a box or an ellipse.
 * Flat: [x1, y1, x2, y2, …] per edge.
 */
export function edgesOf(pts: readonly number[]): number[] {
  const n = pts.length / 2;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out.push(pts[2 * i], pts[2 * i + 1], pts[2 * j], pts[2 * j + 1]);
  }
  return out;
}

/**
 * How to draw one triangle as a border triangle. It is laid along its LONGEST edge,
 * because the apex then always falls between the base's two ends and neither border
 * width can go negative. `x, y` is where the base starts, `rot` how far the base is
 * turned, `left` and `right` the two transparent borders, `h` the coloured one.
 */
export function triBox(t: readonly number[]): TriBox {
  const P = [[t[0], t[1]], [t[2], t[3]], [t[4], t[5]]];
  let best = 0;
  let bestL = -1;
  for (let e = 0; e < 3; e++) {
    const [x0, y0] = P[e];
    const [x1, y1] = P[(e + 1) % 3];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (L > bestL) { bestL = L; best = e; }
  }
  let A = P[best];
  let B = P[(best + 1) % 3];
  const C = P[(best + 2) % 3];
  let dx = (B[0] - A[0]) / bestL;
  let dy = (B[1] - A[1]) / bestL;
  // the apex must be ABOVE the base in the base's own frame (negative y); if it
  // falls below, run the base the other way
  if (-dy * (C[0] - A[0]) + dx * (C[1] - A[1]) > 0) {
    [A, B] = [B, A];
    dx = -dx;
    dy = -dy;
  }
  const u = dx * (C[0] - A[0]) + dy * (C[1] - A[1]);
  const h = -(-dy * (C[0] - A[0]) + dx * (C[1] - A[1]));
  return { x: A[0], y: A[1], rot: (Math.atan2(dy, dx) * 180) / Math.PI, left: u, right: bestL - u, h };
}
