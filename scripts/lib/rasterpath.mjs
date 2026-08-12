// Draw an SVG path string into a pixel buffer, in plain Node.
//
// WHY THIS EXISTS. The scenery, the ground and the figure are all authored as
// path data by files with zero imports, specifically so they can be checked
// without a device. But numbers only catch geometry. "That does not look like the
// thing it is called" has to be LOOKED at — the branch scenery passed every
// numeric check it had while reading as five grey stripes — and nothing in this
// repo could turn a <Path> into pixels offline.
//
// There is no SVG rasteriser in node_modules and none is worth adding for this.
// The subset actually emitted is tiny: M, L, Q, C, Z, absolute, and always as
// (x, y) pairs. Flatten the two curve types into line segments, scanline-fill by
// the non-zero winding rule, supersample for the edges. About a hundred lines,
// and it makes every generated shape in the app inspectable.
//
// NON-ZERO WINDING is the SVG default and it matters here: a cumulus is drawn as
// overlapping circles in one path, and non-zero is what unions them instead of
// punching every overlap into a hole.

/** Split a path into closed polygons, curves flattened to segments. */
export function flatten(d, steps = 14) {
  const tok = d.match(/[MLQCZmlqcz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const subs = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, cmd = 'M', i = 0;
  const num = () => parseFloat(tok[i++]);
  const push = (px, py) => { if (cur) cur.push([px, py]); };
  while (i < tok.length) {
    const t = tok[i];
    if (/[MLQCZmlqcz]/.test(t)) { cmd = t; i++; }
    if (cmd === 'Z' || cmd === 'z') { if (cur && cur.length > 2) subs.push(cur); cur = null; x = sx; y = sy; continue; }
    if (cmd === 'M' || cmd === 'm') {
      if (cur && cur.length > 2) subs.push(cur);
      x = num(); y = num(); sx = x; sy = y; cur = [[x, y]];
      cmd = cmd === 'M' ? 'L' : 'l';                 // implicit lineto after moveto
      continue;
    }
    if (cmd === 'L' || cmd === 'l') { x = num(); y = num(); push(x, y); continue; }
    if (cmd === 'Q' || cmd === 'q') {
      const cx = num(), cy = num(), ex = num(), ey = num();
      for (let s = 1; s <= steps; s++) {
        const u = s / steps, v = 1 - u;
        push(v * v * x + 2 * v * u * cx + u * u * ex, v * v * y + 2 * v * u * cy + u * u * ey);
      }
      x = ex; y = ey; continue;
    }
    if (cmd === 'C' || cmd === 'c') {
      const a1 = num(), b1 = num(), a2 = num(), b2 = num(), ex = num(), ey = num();
      for (let s = 1; s <= steps; s++) {
        const u = s / steps, v = 1 - u;
        push(v * v * v * x + 3 * v * v * u * a1 + 3 * v * u * u * a2 + u * u * u * ex,
          v * v * v * y + 3 * v * v * u * b1 + 3 * v * u * u * b2 + u * u * u * ey);
      }
      x = ex; y = ey; continue;
    }
    i++;                                              // unknown command: skip a token
  }
  if (cur && cur.length > 2) subs.push(cur);
  return subs;
}

/**
 * Coverage of a path over a w×h grid, 0→1 per pixel.
 *
 * `ss` scanlines per pixel row, and exact x-coverage along each — so an edge is
 * anti-aliased in both directions without building a buffer `ss`² times the size.
 */
export function coverage(d, w, h, ox = 0, oy = 0, scale = 1, ss = 4) {
  const cov = new Float32Array(w * h);
  const subs = flatten(d);
  if (!subs.length) return cov;
  const edges = [];
  let minY = Infinity, maxY = -Infinity;
  for (const p of subs) {
    for (let n = 0; n < p.length; n++) {
      const [x0, y0] = p[n];
      const [x1, y1] = p[(n + 1) % p.length];
      const ay = (y0 + oy) * scale, by = (y1 + oy) * scale;
      if (ay === by) continue;
      edges.push([(x0 + ox) * scale, ay, (x1 + ox) * scale, by]);
      minY = Math.min(minY, ay, by);
      maxY = Math.max(maxY, ay, by);
    }
  }
  if (!edges.length) return cov;
  const y0px = Math.max(0, Math.floor(minY));
  const y1px = Math.min(h - 1, Math.ceil(maxY));
  const hits = [];
  for (let py = y0px; py <= y1px; py++) {
    for (let s = 0; s < ss; s++) {
      const sy = py + (s + 0.5) / ss;
      hits.length = 0;
      for (let e = 0; e < edges.length; e++) {
        const [ax, ay, bx, by] = edges[e];
        if ((sy < ay && sy < by) || (sy >= ay && sy >= by)) continue;
        hits.push([ax + (bx - ax) * (sy - ay) / (by - ay), by > ay ? 1 : -1]);
      }
      if (hits.length < 2) continue;
      hits.sort((a, b) => a[0] - b[0]);
      let wind = 0;
      for (let n = 0; n < hits.length - 1; n++) {
        wind += hits[n][1];
        if (wind === 0) continue;
        span(cov, w, py, hits[n][0], hits[n + 1][0], 1 / ss);
      }
    }
  }
  return cov;
}

/** Add `amt` of coverage to row `py` between two exact x positions. */
function span(cov, w, py, xa, xb, amt) {
  if (xb <= 0 || xa >= w) return;
  const a = Math.max(0, xa), b = Math.min(w, xb);
  if (b <= a) return;
  const row = py * w;
  const ia = Math.floor(a), ib = Math.floor(b - 1e-9);
  if (ia === ib) { cov[row + ia] += (b - a) * amt; return; }
  cov[row + ia] += (ia + 1 - a) * amt;
  for (let x = ia + 1; x < ib; x++) cov[row + x] += amt;
  cov[row + ib] += (b - ib) * amt;
}

/** #RRGGBB → [r,g,b]. */
export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A plain RGB canvas with the two operations a contact sheet needs. */
export function canvas(w, h, bg = '#FFFFFF') {
  const px = new Uint8ClampedArray(w * h * 3);
  const [r, g, b] = rgb(bg);
  for (let i = 0; i < w * h; i++) { px[i * 3] = r; px[i * 3 + 1] = g; px[i * 3 + 2] = b; }
  return {
    w, h, px,
    fillRect(x0, y0, rw, rh, hex) {
      const [cr, cg, cb] = rgb(hex);
      for (let y = Math.max(0, y0 | 0); y < Math.min(h, (y0 + rh) | 0); y++) {
        for (let x = Math.max(0, x0 | 0); x < Math.min(w, (x0 + rw) | 0); x++) {
          const i = (y * w + x) * 3;
          px[i] = cr; px[i + 1] = cg; px[i + 2] = cb;
        }
      }
    },
    path(d, hex, ox = 0, oy = 0, scale = 1, alpha = 1) {
      const cov = coverage(d, w, h, ox, oy, scale);
      const [cr, cg, cb] = rgb(hex);
      for (let i = 0; i < w * h; i++) {
        const a = Math.min(1, cov[i]) * alpha;
        if (a <= 0.002) continue;
        const j = i * 3;
        px[j] += (cr - px[j]) * a;
        px[j + 1] += (cg - px[j + 1]) * a;
        px[j + 2] += (cb - px[j + 2]) * a;
      }
    },
    /** Paste another canvas in, for building a sheet out of panels. */
    blit(src, x0, y0) {
      for (let y = 0; y < src.h; y++) {
        const ty = y0 + y;
        if (ty < 0 || ty >= h) continue;
        for (let x = 0; x < src.w; x++) {
          const tx = x0 + x;
          if (tx < 0 || tx >= w) continue;
          const s = (y * src.w + x) * 3, t = (ty * w + tx) * 3;
          px[t] = src.px[s]; px[t + 1] = src.px[s + 1]; px[t + 2] = src.px[s + 2];
        }
      }
    },
  };
}

/** Five-by-seven block capitals, so a panel can say what it is. */
const GLYPHS = {
  A: '01110100011000111111100011000110001', B: '11110100011111010001100011000111110',
  C: '01110100011000010000100001000101110', D: '11110100011000110001100011000111110',
  E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001',
  I: '11111001000010000100001000010011111', J: '00111000100001000010000101001001100',
  K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110001100011000110001', N: '10001110011010110011100011000110001',
  O: '01110100011000110001100011000101110', P: '11110100011000111110100001000010000',
  Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100',
  U: '10001100011000110001100011000101110', V: '10001100011000110001100010101000100',
  W: '10001100011000110001101011101110001', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110',
  2: '01110100010000100010001000100011111', 3: '11111000100010000010000011000101110',
  4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110',
  6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000',
  8: '01110100011000101110100011000101110', 9: '01110100011000101111000010001001100',
  ' ': '00000000000000000000000000000000000', '-': '00000000000000111000000000000000000',
  '.': '00000000000000000000000000000000100', "'": '00100001000000000000000000000000000',
};

export function text(cv, str, x0, y0, hex, px = 2) {
  const [r, g, b] = rgb(hex);
  let cx = x0;
  for (const ch of str.toUpperCase()) {
    const gl = GLYPHS[ch] || GLYPHS[' '];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (gl[row * 5 + col] !== '1') continue;
        for (let dy = 0; dy < px; dy++) {
          for (let dx = 0; dx < px; dx++) {
            const X = cx + col * px + dx, Y = y0 + row * px + dy;
            if (X < 0 || X >= cv.w || Y < 0 || Y >= cv.h) continue;
            const i = (Y * cv.w + X) * 3;
            cv.px[i] = r; cv.px[i + 1] = g; cv.px[i + 2] = b;
          }
        }
      }
    }
    cx += 6 * px;
  }
}
