// HOW MUCH OF AN OBJECT DRAWING IS OUTLINE, AND WHETHER THE OUTLINE HUGS IT.
//
// Zero imports, like rig.ts: the parts are rasterised in plain Node the way
// `Silhouette.tsx` draws them — every BODY part grown by the outline weight in ink,
// then every body part in its fill — so `check:objects` can hold what the owner
// complained about as a number (LESSON_RULES AM11):
//
//   inkShare   of everything the body covers once outlined, the share that is outline.
//              A 22-unit café cup at the old fixed weight was 48% ink.
//   spill      ink that lies further from the object than the outline's own weight,
//              in stage units² — a corner poking out, a backing behind the object.
//
// The GROW MODEL IS SILHOUETTE'S, NOT GEOMETRY'S, which is the whole point of it:
// ellipses grow by their two radii, rectangles by their size and corner, capsules by
// their thickness, and a triangle is itself plus a capsule along each edge. A model of
// the ideal outline would pass a renderer that draws a worse one.

const rot = (x, y, cx, cy, deg) => {
  const a = (-(deg || 0) * Math.PI) / 180, dx = x - cx, dy = y - cy;
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
};
const segDist = (x, y, x1, y1, x2, y2) => {
  const vx = x2 - x1, vy = y2 - y1, L2 = vx * vx + vy * vy || 1e-9;
  const u = Math.max(0, Math.min(1, ((x - x1) * vx + (y - y1) * vy) / L2));
  return Math.hypot(x - x1 - u * vx, y - y1 - u * vy);
};
/** A triangle part's corners, exactly as `Silhouette.triCorners` computes them. */
export function triCorners(p) {
  const w = p.w / 2, h = p.h / 2;
  const local = p.dir === 'up' ? [[0, -h], [w, h], [-w, h]]
    : p.dir === 'down' ? [[-w, -h], [w, -h], [0, h]]
      : p.dir === 'left' ? [[-w, 0], [w, -h], [w, h]]
        : [[-w, -h], [w, 0], [-w, h]];
  const a = ((p.rot || 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return local.map(([x, y]) => [p.x + x * c - y * s, p.y + x * s + y * c]);
}
function inTri(p, x, y) {
  const [dx, dy] = rot(x, y, p.x, p.y, p.rot);
  const w = p.w, h = p.h;
  if (Math.abs(dx) > w / 2 || Math.abs(dy) > h / 2) return false;
  const ty = (dy + h / 2) / h, tx = (dx + w / 2) / w;
  if (p.dir === 'up') return Math.abs(dx) <= (w / 2) * ty;
  if (p.dir === 'down') return Math.abs(dx) <= (w / 2) * (1 - ty);
  if (p.dir === 'left') return Math.abs(dy) <= (h / 2) * tx;
  return Math.abs(dy) <= (h / 2) * (1 - tx);
}
/** Is (x, y) inside part `p` grown by `g`, as Silhouette draws it? */
export function inside(p, x, y, g) {
  if (p.k === 'ell') {
    const [dx, dy] = rot(x, y, p.x, p.y, p.rot);
    return (dx / (p.w / 2 + g)) ** 2 + (dy / (p.h / 2 + g)) ** 2 <= 1;
  }
  if (p.k === 'rect') {
    const [dx, dy] = rot(x, y, p.x, p.y, p.rot);
    const w = p.w / 2 + g, h = p.h / 2 + g, r = Math.min(Math.max(0, (p.rad || 0) + g), w, h);
    if (Math.abs(dx) > w || Math.abs(dy) > h) return false;
    const qx = Math.abs(dx) - (w - r), qy = Math.abs(dy) - (h - r);
    return qx > 0 && qy > 0 ? qx * qx + qy * qy <= r * r : true;
  }
  if (p.k === 'bar') return segDist(x, y, p.x1, p.y1, p.x2, p.y2) <= p.t / 2 + g;
  if (p.k === 'tri') {
    if (inTri(p, x, y)) return true;
    if (!g) return false;
    const v = triCorners(p);
    for (let i = 0; i < 3; i++) if (segDist(x, y, ...v[i], ...v[(i + 1) % 3]) <= g) return true;
    return false;
  }
  return false;                         // a 'poly' is SetArt's, drawn edge by edge — not modelled
}
function extent(p, g) {
  if (p.k === 'bar') {
    const t = p.t / 2 + g;
    return [Math.min(p.x1, p.x2) - t, Math.min(p.y1, p.y2) - t, Math.max(p.x1, p.x2) + t, Math.max(p.y1, p.y2) + t];
  }
  const r = Math.hypot(p.w / 2, p.h / 2) + g;
  return [p.x - r, p.y - r, p.x + r, p.y + r];
}
const isBody = (p) => p.role === 'mass' || p.role === 'face';

/**
 * Measure one drawing at outline weight `line`. `px` is the grid's cells across the
 * drawing's longer side, so a 16-unit cup and a 160-unit counter are measured to the
 * same relative accuracy.
 */
export function measureInk(parts, line, px = 320) {
  const body = parts.filter(isBody);
  if (!body.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of body) { const e = extent(p, line); x0 = Math.min(x0, e[0]); y0 = Math.min(y0, e[1]); x1 = Math.max(x1, e[2]); y1 = Math.max(y1, e[3]); }
  const R = px / Math.max(x1 - x0, y1 - y0);
  const W = Math.ceil((x1 - x0) * R) + 2, H = Math.ceil((y1 - y0) * R) + 2;
  const F = new Uint8Array(W * H), G = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = x0 + (i + 0.5) / R, y = y0 + (j + 0.5) / R;
    let f = 0, g = 0;
    for (const p of body) {
      if (!f && inside(p, x, y, 0)) { f = 1; g = 1; break; }
      if (!g && inside(p, x, y, line)) g = 1;
    }
    F[j * W + i] = f; G[j * W + i] = g;
  }
  // chamfer distance, in cells, from every cell to the nearest FILL cell
  const D = new Float32Array(W * H).fill(1e9);
  for (let k = 0; k < W * H; k++) if (F[k]) D[k] = 0;
  const S = Math.SQRT2;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i; let v = D[k];
    if (i > 0) v = Math.min(v, D[k - 1] + 1);
    if (j > 0) { v = Math.min(v, D[k - W] + 1); if (i > 0) v = Math.min(v, D[k - W - 1] + S); if (i < W - 1) v = Math.min(v, D[k - W + 1] + S); }
    D[k] = v;
  }
  for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) {
    const k = j * W + i; let v = D[k];
    if (i < W - 1) v = Math.min(v, D[k + 1] + 1);
    if (j < H - 1) { v = Math.min(v, D[k + W] + 1); if (i < W - 1) v = Math.min(v, D[k + W + 1] + S); if (i > 0) v = Math.min(v, D[k + W - 1] + S); }
    D[k] = v;
  }
  // a cell is SPILL when it is further from the object than the outline reaches, less
  // a margin for the chamfer's own error (up to ~8% on a diagonal) and two cells
  const allow = line * 1.1 + 2 / R;
  let fill = 0, ink = 0, spill = 0, worst = 0;
  for (let k = 0; k < W * H; k++) {
    if (F[k]) { fill++; continue; }
    if (!G[k]) continue;
    ink++;
    const d = D[k] / R;
    if (d > allow) spill++;
    worst = Math.max(worst, d);
  }
  return { inkShare: ink / (ink + fill), spill: spill / (R * R), worstPast: worst - line, fill: fill / (R * R) };
}
