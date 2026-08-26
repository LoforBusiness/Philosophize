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
// WHAT CHANGED, AND WHY THE SHEET IS READ THE OTHER WAY UP NOW. The frame used
// to be chosen by ORDER, so a row of this sheet was six copies of one silhouette
// and a column was the escalation. It is chosen by DEGREE now -- complexity
// cycles inside a colour and resets at the next one -- so ACROSS is the shape
// ladder and DOWN is the material ladder. The two questions this sheet has to
// answer are therefore "is every step across visibly bigger than the last" and
// "does every one of the six survive being struck in the drabbest order".
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
// PIN=50 npm run sheet:ranks -- the size the ranks LADDER actually draws them at,
// which is the size any question about legibility has to be asked at. 104 is the
// hero on the ranks sheet and 56 is Profile's; the grid is 50.
const PIN = Number(process.env.PIN) || (only ? 300 : 104);
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
//
// The paint order IS the design, and it is the same order RankSeal uses:
// underplate, shadow, core, facets, rule, bevel, studs, collar, mark. Two of
// those are drawn the hard way here because the rasteriser fills and does not
// stroke — a stroke is faked as a larger fill with a smaller one laid over it.
function pin(order, degree, box) {
  const cv = canvas(box, box, T.PAPER);
  const m = I.ORDER[order];
  const oi = I.ORDERS.indexOf(order);
  const p = S.pinFor(oi, degree);
  const k = box / 100;

  const face = I.insigniaFace(m);
  const rim = I.insigniaRim(m);
  const core = p.core(0);

  // 1 · THE UNDERPLATE, counter-rotated, in the material's shaded end so it
  //     reads as being BEHIND rather than beside. Its own rim first, so the tips
  //     showing through the core's valleys have an edge on them.
  if (p.under) {
    fill(cv, p.under, flatStops(m.rim), T.SHADOW.dx * 0.6, T.SHADOW.dy * 0.6, k);
    fill(cv, p.under, I.insigniaUnder(m), 0, 0, k);
  }

  // 2 · the shadow the whole object casts on the page
  fill(cv, core, flatStops(T.INK), T.SHADOW.dx, T.SHADOW.dy, k, T.SHADOW.opacity);

  // 3 · THE COLLAR GOES DOWN BEFORE THE PIN. It is a stroke on device and two
  //     fills here, and the outer of those two is BIGGER than the core — laid
  //     down afterwards the paper one paints the pin out, which is exactly what
  //     an early run of this sheet showed: a column of degree-5 pins reduced to
  //     an empty ring.
  if (p.build.collar) {
    fill(cv, p.core(S.COLLAR - 1.5), flatStops(m.base), 0, 0, k);
    fill(cv, p.core(S.COLLAR + 1.5), flatStops(T.PAPER), 0, 0, k);
  }

  // 4 · the turned edge, with the face laid inside it
  fill(cv, core, I.insigniaBevel(m), 0, 0, k);
  fill(cv, p.core(2.2), face, 0, 0, k);

  // 5 · the inner rule
  if (p.build.rule) {
    fill(cv, p.core(S.INNER), flatStops(m.rule), 0, 0, k);
    fill(cv, p.core(S.INNER + 1.1), face, 0, 0, k);
  }

  // 6 · THE FACETS. Each wedge is lifted by how squarely it faces the lamp —
  //     white over the ones pointing into it, ink over the ones pointing away.
  //     This is what stops a pin reading as a coloured shape with a gradient.
  for (const f of p.facets) {
    const { end, opacity } = S.facetPaint(f.lift);
    if (opacity < 0.02) continue;
    fill(cv, f.d, flatStops(m[end]), 0, 0, k, opacity);
  }

  // 7 · the studs — a rivet, not a dot: the dark seat under it is what makes it
  //     sit IN the face rather than float on it.
  for (let i = 0; i < p.build.studs; i++) {
    const [sx, sy] = p.studs[i];
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

  fill(cv, markPath(p.markScale, 0), flatStops(m.on), 0, 0, k);
  return cv;
}

// ── the sheet ──────────────────────────────────────────────────────────────
const cols = 6;
const cellW = PIN + PAD;
const cellH = PIN + PAD + LABEL;
const sheetW = PAD + cols * cellW;
const sheetH = PAD + orders.length * cellH + LABEL;
const sheet = canvas(sheetW, sheetH, '#EFEDE6');

text(sheet,
  `${orders.length} ORDERS DOWN X ${cols} DEGREES ACROSS - EACH ORDER ITS OWN SHAPE: ` +
  S.VOCAB.map((v) => v.label).join(' ').toUpperCase(),
  PAD, 5, '#6B6B6B', 1);

orders.forEach((order, r) => {
  const y = PAD + LABEL + r * cellH;
  for (let d = 0; d < cols; d++) {
    const x = PAD + d * cellW;
    sheet.blit(pin(order, d, PIN), x, y);
    const id = I.ORDERS.indexOf(order) * cols + d + 1;
    text(sheet, `${id} ${S.VOCAB[I.ORDERS.indexOf(order)].label.toUpperCase()}`, x, y + PIN + 3, '#4A4A4A', 1);
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
