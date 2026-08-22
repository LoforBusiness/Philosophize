// LOOK AT ALL FORTY-EIGHT PINS, without a phone and without a browser.
//
//   node scripts/sheet-ranks.mjs            every order × every degree
//   node scripts/sheet-ranks.mjs jade       one order, drawn large
//
// WHY THIS EXISTS. The rank ladder is the one part of this app whose whole job
// is to be looked at, and until now the only thing that could look at it was a
// person holding a phone. scripts/check-ui.mjs measures the palette — contrast,
// tonal swing, ΔE between orders — and every one of those numbers can be green
// while the pins themselves are unreadable, identical, or ugly. Numbers cannot
// see a shape.
//
// components/shared/rankShapes.ts and constants/insignia.ts both have ZERO
// imports precisely so this is possible: the geometry and the materials are
// plain data, scripts/lib/rasterpath.mjs turns path strings into pixels, and the
// gradient below is the same three stops react-native-svg is handed on device.
//
// The MARK is a stand-in — a triangle ring rather than the real Glyph, which is
// a React component and cannot be rendered here. That is deliberate and it is
// enough: what this sheet is for is the FRAME and the room it leaves, and a
// stand-in of the right size answers "is the mark crowded" exactly as well as
// the real one would.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { coverage, canvas, rgb, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-ranks');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  writeFileSync(
    path.join(TMP, name),
    transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code,
  );
  return pathToFileURL(path.join(TMP, name)).href;
};

const I = await import(emit('constants/insignia.ts', 'insignia.mjs'));
const S = await import(emit('components/shared/rankShapes.ts', 'rankShapes.mjs'));
const T = await import(emit('components/shared/tone.ts', 'tone.mjs'));

const only = process.argv[2]?.toUpperCase() ?? null;
const orders = only ? [only] : I.ORDERS;
const PIN = only ? 300 : 104;                     // the pin's drawn size, in px
const PAD = only ? 24 : 13;
const LABEL = 15;

// ── shading ────────────────────────────────────────────────────────────────
// `LIGHT` in components/shared/tone.ts is an objectBoundingBox gradient, so it
// is measured against the PATH'S OWN box rather than the tile — which is what
// makes a wing and a shield light consistently even though one is twice as wide.
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function stopsAt(stops, t) {
  const at = stops.map(([o, c]) => [parseFloat(o) / 100, rgb(c)]);
  if (t <= at[0][0]) return at[0][1];
  for (let i = 1; i < at.length; i++) {
    if (t <= at[i][0]) {
      const span = at[i][0] - at[i - 1][0] || 1;
      return mix(at[i - 1][1], at[i][1], (t - at[i - 1][0]) / span);
    }
  }
  return at[at.length - 1][1];
}

/** The bounding box of a path, so the gradient axis can be laid across it. */
function bbox(d) {
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  return [x0, y0, x1, y1];
}

const pc = (s) => parseFloat(s) / 100;

/** Fill a path with a gradient (or a flat colour when `stops` is one entry). */
function fill(cv, d, stops, ox, oy, scale, alpha = 1) {
  const cov = coverage(d, cv.w, cv.h, ox, oy, scale, 4);
  const [bx0, by0, bx1, by1] = bbox(d);
  const bw = Math.max(1e-6, bx1 - bx0), bh = Math.max(1e-6, by1 - by0);
  const ax = pc(T.LIGHT.x1), ay = pc(T.LIGHT.y1);
  const dx = pc(T.LIGHT.x2) - ax, dy = pc(T.LIGHT.y2) - ay;
  const den = dx * dx + dy * dy;
  for (let py = 0; py < cv.h; py++) {
    for (let px = 0; px < cv.w; px++) {
      const i = py * cv.w + px;
      const a = Math.min(1, cov[i]) * alpha;
      if (a <= 0.003) continue;
      // Back out of device pixels into the path's own box, then project.
      const ux = ((px + 0.5) / scale - ox - bx0) / bw;
      const uy = ((py + 0.5) / scale - oy - by0) / bh;
      const t = Math.max(0, Math.min(1, ((ux - ax) * dx + (uy - ay) * dy) / den));
      const [r, g, b] = stopsAt(stops, t);
      const j = i * 3;
      cv.px[j] += (r - cv.px[j]) * a;
      cv.px[j + 1] += (g - cv.px[j + 1]) * a;
      cv.px[j + 2] += (b - cv.px[j + 2]) * a;
    }
  }
}

const flatStops = (hex) => [['0%', hex, 1], ['100%', hex, 1]];

/** The stand-in mark: a triangle ring, hollow by the non-zero winding rule. */
function markPath(size, dy) {
  const r = size * 50;
  const cy = 50 + dy * 100 + r * 0.12;
  const tri = (rr, dir) => {
    const p = [];
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (dir * i * 2 * Math.PI) / 3;
      p.push(`${(50 + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`);
    }
    return `M${p.join(' L')} Z`;
  };
  return `${tri(r, 1)} ${tri(r * 0.58, -1)}`;
}

// ── one pin ────────────────────────────────────────────────────────────────
function pin(order, degree, box) {
  const cv = canvas(box, box, T.PAPER);
  const m = I.ORDER[order];
  const frame = S.FRAMES[I.ORDERS.indexOf(order)];
  const g = S.frameGeom(frame);
  const orn = S.ORNAMENT[frame];
  const fin = I.finishFor(degree);
  const k = box / 100;

  const face = I.insigniaFace(m);
  const rim = I.insigniaRim(m);
  const core = S.CORE[frame](0);

  // The shadow, under everything, exactly as RankSeal draws it.
  fill(cv, core, flatStops(T.INK), T.SHADOW.dx, T.SHADOW.dy, k, T.SHADOW.opacity);

  if (orn.rays) fill(cv, orn.rays, [['0%', m.lit, 1], ['100%', m.base, 1]], 0, 0, k);
  if (orn.wings) {
    fill(cv, orn.wings, flatStops(m.rim), 0, 0, k);
    fill(cv, S.wingsInset(1.3), [['0%', m.base, 1], ['100%', m.shade, 1]], 0, 0, k);
  }
  if (orn.crown) {
    fill(cv, orn.crown, flatStops(m.rim), 0, 0, k);
    fill(cv, S.crownInset(1.6), face, 0, 0, k);
  }

  // THE COLLAR GOES DOWN FIRST. It is a STROKE outside the edge on device, and
  // the offline equivalent is a larger copy of the frame with the pin laid over
  // it — draw it afterwards and it paints the pin out, which is exactly what the
  // first sheet showed: a whole column of degree-5 pins reduced to studs on paper.
  if (fin.collar) {
    fill(cv, S.CORE[frame](-3.6), flatStops(m.rule), 0, 0, k);
    fill(cv, S.CORE[frame](-2.0), flatStops(T.PAPER), 0, 0, k);
  }

  fill(cv, core, rim, 0, 0, k);                 // the turned edge…
  fill(cv, S.CORE[frame](1.7), face, 0, 0, k);  // …with the face laid inside it

  if (fin.rule) {
    fill(cv, S.CORE[frame](S.INNER), flatStops(m.rule), 0, 0, k);
    fill(cv, S.CORE[frame](S.INNER + 1.1), face, 0, 0, k);
  }
  for (let i = 0; i < fin.studs; i++) {
    const [sx, sy] = g.studs[i];
    const dot = (rr, hex) => fill(
      cv,
      `M${sx - rr} ${sy} C${sx - rr} ${sy - rr * 0.55} ${sx - rr * 0.55} ${sy - rr} ${sx} ${sy - rr}` +
      ` C${sx + rr * 0.55} ${sy - rr} ${sx + rr} ${sy - rr * 0.55} ${sx + rr} ${sy}` +
      ` C${sx + rr} ${sy + rr * 0.55} ${sx + rr * 0.55} ${sy + rr} ${sx} ${sy + rr}` +
      ` C${sx - rr * 0.55} ${sy + rr} ${sx - rr} ${sy + rr * 0.55} ${sx - rr} ${sy} Z`,
      flatStops(hex), 0, 0, k,
    );
    dot(3.4, m.rim);
    dot(2.4, m.rule);
  }

  fill(cv, markPath(g.markScale, g.markDy), flatStops(m.on), 0, 0, k);
  return cv;
}

// ── the sheet ──────────────────────────────────────────────────────────────
const cols = I.DEGREES;
const cellW = PIN + PAD;
const cellH = PIN + PAD + LABEL;
const sheetW = PAD + cols * cellW;
const sheetH = PAD + orders.length * cellH + LABEL;
const sheet = canvas(sheetW, sheetH, '#EFEDE6');

text(sheet, `${orders.length} ORDERS X ${cols} DEGREES`, PAD, 5, '#6B6B6B', 1);

orders.forEach((order, r) => {
  const y = PAD + LABEL + r * cellH;
  for (let d = 0; d < cols; d++) {
    const x = PAD + d * cellW;
    sheet.blit(pin(order, d, PIN), x, y);
    const id = r * cols + d + 1;
    text(sheet, `${order} ${d} - RANK ${id}`, x, y + PIN + 3, '#4A4A4A', 1);
  }
});

const out = new Jimp(sheetW, sheetH);
for (let i = 0; i < sheetW * sheetH; i++) {
  out.bitmap.data[i * 4] = sheet.px[i * 3];
  out.bitmap.data[i * 4 + 1] = sheet.px[i * 3 + 1];
  out.bitmap.data[i * 4 + 2] = sheet.px[i * 3 + 2];
  out.bitmap.data[i * 4 + 3] = 255;
}
const dest = path.join(os.tmpdir(), `rank-sheet${only ? '-' + only.toLowerCase() : ''}.png`);
await out.writeAsync(dest);
console.log(`${orders.length} order(s) x ${cols} degrees -> ${dest}  (${sheetW}x${sheetH})`);
