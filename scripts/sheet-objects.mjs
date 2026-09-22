// EVERY OBJECT, DRAWN, IN PLAIN NODE.
//
//   node scripts/sheet-objects.mjs                 all of them, at lesson size and 4x
//   node scripts/sheet-objects.mjs ship tree       just these
//   BRANCH=ethics node scripts/sheet-objects.mjs   struck in one branch's own tones
//   FIG=0 node scripts/sheet-objects.mjs           without the figure beside them
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
//
// "Does that look like a ship?" is not a question any number answers, and it is the
// only question that matters about `objects.ts`. `check:objects` can prove an object
// is built from more than one box, is lit from one direction and keeps its shaded
// plane inside its own mass — and a drawing can satisfy all three and still read as
// a soup bowl, which the first hull did.
//
// So this renders them the way `sheet-critters.mjs` renders the animals: through the
// REAL table, with the REAL primitives, offline. `objects.ts` has zero imports for
// exactly this, and the loop is seconds rather than a Metro and a browser.
//
// ── TWO SIZES, AND THE FIGURE ───────────────────────────────────────────────
//
// An object is drawn at the size the lessons actually use it (40–90 units) and again
// at 4x. §19 records three separate marks being "fixed" against a downscaled
// screenshot when the geometry was right all along, and the opposite too — a numeral
// that looked sliced at 2x was whole at 4x. Both readings are cheap; take both.
//
// The figure stands beside them because scale is a comparison. `critters.ts` records
// its own first animal passing every check while reading as "a slab of chest on four
// wires", and what made that legible was putting the person next to it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const R = await import(pathToFileURL(path.join(REPO, 'scripts/lib/rasterpath.mjs')).href);
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);

const TMP = path.join(os.tmpdir(), 'philosophize-object-sheet');
fs.mkdirSync(TMP, { recursive: true });
/** A zero-import module, as ESM. */
function load(rel, name) {
  const js = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code;
  fs.writeFileSync(path.join(TMP, name), js);
  return import(pathToFileURL(path.join(TMP, name)).href);
}
/**
 * A module with exactly one import, handed that import rather than re-implemented —
 * `check-marks.mjs`'s idiom. `stageTones.ts` reads the six branch hues out of
 * `constants/design.ts`, and restating them here is the "one rule, two readers" drift
 * this file's own §17 records three times over.
 */
function loadWith(rel, deps) {
  const js = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), {
    transforms: ['typescript', 'imports'],
  }).code;
  const mod = { exports: {} };
  new Function('exports', 'module', 'require', js)(mod.exports, mod, (m) => {
    if (deps[m]) return deps[m];
    throw new Error(`${rel} imports ${m}, which sheet-objects cannot hand it`);
  });
  return mod.exports;
}
const O = await load('components/lesson/cinematic/objects.ts', 'objects.mjs');
const design = await load('constants/design.ts', 'design.mjs');
const T = loadWith('components/lesson/cinematic/stageTones.ts', { '@/constants/design': design });

const BRANCH = process.env.BRANCH || 'metaphysics';
const TONE = T.stageTone(BRANCH);
const INK = '#1A1A1A';
const PAPER = '#FAFAF7';
const SOFT = '#8A8177';
const LINE = 2.2;                                  // the outline weight the scenes use

// ── the four primitives, as path data ───────────────────────────────────────
//
// These mirror `Silhouette.tsx` exactly, and the two that are easy to get wrong are
// the two the component itself warns about: an ellipse is a CIRCLE SCALED (Android
// clamps a corner radius to half the short side, so a wide oval drawn as a rounded
// box comes out a capsule), and a bar is a capsule whose caps overlap its neighbour's.
const K = (4 / 3) * (Math.SQRT2 - 1);
function ellD(x, y, w, h, rot = 0) {
  const a = w / 2; const b = h / 2;
  const c = Math.cos((rot * Math.PI) / 180); const s = Math.sin((rot * Math.PI) / 180);
  const P = (dx, dy) => `${(x + dx * c - dy * s).toFixed(2)} ${(y + dx * s + dy * c).toFixed(2)}`;
  return `M ${P(-a, 0)} C ${P(-a, -b * K)} ${P(-a * K, -b)} ${P(0, -b)}`
    + ` C ${P(a * K, -b)} ${P(a, -b * K)} ${P(a, 0)}`
    + ` C ${P(a, b * K)} ${P(a * K, b)} ${P(0, b)}`
    + ` C ${P(-a * K, b)} ${P(-a, b * K)} ${P(-a, 0)} Z`;
}
function rectD(x, y, w, h, rot = 0, rad = 0) {
  const c = Math.cos((rot * Math.PI) / 180); const s = Math.sin((rot * Math.PI) / 180);
  const P = (dx, dy) => `${(x + dx * c - dy * s).toFixed(2)} ${(y + dx * s + dy * c).toFixed(2)}`;
  const a = w / 2; const b = h / 2;
  const r = Math.max(0, Math.min(rad, a, b));
  if (r <= 0.01) return `M ${P(-a, -b)} L ${P(a, -b)} L ${P(a, b)} L ${P(-a, b)} Z`;
  return `M ${P(-a + r, -b)} L ${P(a - r, -b)} Q ${P(a, -b)} ${P(a, -b + r)}`
    + ` L ${P(a, b - r)} Q ${P(a, b)} ${P(a - r, b)}`
    + ` L ${P(-a + r, b)} Q ${P(-a, b)} ${P(-a, b - r)}`
    + ` L ${P(-a, -b + r)} Q ${P(-a, -b)} ${P(-a + r, -b)} Z`;
}
function barD(x1, y1, x2, y2, t) {
  const dx = x2 - x1; const dy = y2 - y1; const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len; const uy = dy / len; const r = t / 2;
  const nx = -uy * r; const ny = ux * r; const c = 0.5523;
  return `M ${x1 + nx} ${y1 + ny} L ${x2 + nx} ${y2 + ny}`
    + ` C ${x2 + nx + ux * r * c} ${y2 + ny + uy * r * c} ${x2 + ux * r + nx * c} ${y2 + uy * r + ny * c} ${x2 + ux * r} ${y2 + uy * r}`
    + ` C ${x2 + ux * r - nx * c} ${y2 + uy * r - ny * c} ${x2 - nx + ux * r * c} ${y2 - ny + uy * r * c} ${x2 - nx} ${y2 - ny}`
    + ` L ${x1 - nx} ${y1 - ny}`
    + ` C ${x1 - nx - ux * r * c} ${y1 - ny - uy * r * c} ${x1 - ux * r - nx * c} ${y1 - uy * r - ny * c} ${x1 - ux * r} ${y1 - uy * r}`
    + ` C ${x1 - ux * r + nx * c} ${y1 - uy * r + ny * c} ${x1 + nx - ux * r * c} ${y1 + ny - uy * r * c} ${x1 + nx} ${y1 + ny} Z`;
}
function triD(x, y, w, h, dir, rot = 0) {
  const c = Math.cos((rot * Math.PI) / 180); const s = Math.sin((rot * Math.PI) / 180);
  const P = (dx, dy) => `${(x + dx * c - dy * s).toFixed(2)} ${(y + dx * s + dy * c).toFixed(2)}`;
  const a = w / 2; const b = h / 2;
  if (dir === 'up') return `M ${P(0, -b)} L ${P(a, b)} L ${P(-a, b)} Z`;
  if (dir === 'down') return `M ${P(-a, -b)} L ${P(a, -b)} L ${P(0, b)} Z`;
  if (dir === 'left') return `M ${P(-a, 0)} L ${P(a, -b)} L ${P(a, b)} Z`;
  return `M ${P(a, 0)} L ${P(-a, -b)} L ${P(-a, b)} Z`;
}

/** One part → path data, at its own geometry grown by `g` (Silhouette's `Piece`). */
export function partD(p, g = 0) {
  if (p.k === 'ell') return ellD(p.x, p.y, p.w + 2 * g, p.h + 2 * g, p.rot);
  if (p.k === 'rect') return rectD(p.x, p.y, p.w + 2 * g, p.h + 2 * g, p.rot, p.rad + g);
  if (p.k === 'bar') return barD(p.x1, p.y1, p.x2, p.y2, p.t + 2 * g);
  return triD(p.x, p.y, p.w + 3 * g, p.h + 3 * g, p.dir, p.rot);
}

/**
 * Draw one object into a canvas. The order is `Outlined`'s: every BODY part grown in
 * the line colour, then every body part in its fill, then the marks on top.
 *
 * The marks are drawn last and never grown, which is the rule that keeps a rim from
 * becoming a black band — the style render that preceded this file grew everything
 * and the canopy's shading ran out past its own edge.
 */
function drawObject(cv, parts, ox, oy, zoom) {
  const body = O.bodyOf(parts);
  const marks = O.marksOf(parts);
  const painted = O.paint(parts, TONE);
  const fillOf = (p) => painted[parts.indexOf(p)].fill;
  for (const p of body) cv.path(partD(p, LINE), INK, ox, oy, zoom);
  for (const p of body) cv.path(partD(p), fillOf(p), ox, oy, zoom);
  for (const p of marks) cv.path(partD(p), fillOf(p), ox, oy, zoom);
}

// ── the figure, for scale ───────────────────────────────────────────────────
// Not the rig: a standing stickman at the lessons' own K_FIG proportions is six
// numbers, and importing the rig here would buy a pose nobody is judging.
function drawFigure(cv, ox, oy, zoom, h) {
  const s = h / 103;
  const X = 50;
  const put = (d) => cv.path(d, INK, ox, oy, zoom);
  put(ellD(X, 100 - 92 * s, 40 * s, 40 * s));                       // head
  put(barD(X, 100 - 72 * s, X, 100 - 38 * s, 12 * s));              // trunk
  put(barD(X, 100 - 64 * s, X - 16 * s, 100 - 44 * s, 11 * s));     // arms
  put(barD(X, 100 - 64 * s, X + 16 * s, 100 - 44 * s, 11 * s));
  put(barD(X, 100 - 38 * s, X - 10 * s, 100, 11 * s));              // legs
  put(barD(X, 100 - 38 * s, X + 10 * s, 100, 11 * s));
}

// ── the sheet ───────────────────────────────────────────────────────────────
const names = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const list = names.length ? names : Object.keys(O.OBJECTS);
for (const n of list) {
  if (!O.OBJECTS[n]) {
    console.log(`no object called "${n}" — have: ${Object.keys(O.OBJECTS).join(' ')}`);
    process.exit(1);
  }
}

const WITH_FIG = process.env.FIG !== '0';
const SMALL = 56;                      // about what a lesson draws one at
const BIG = 4;                         // the magnification for the second reading
const CELL = 120;
const HEAD = 20;
const GAP = 12;
const ROW = CELL + HEAD + GAP;
const COLS = 2 + (WITH_FIG ? 1 : 0);
const Z = 3;
const W = Math.round((CELL * COLS + GAP * (COLS + 1)) * Z);
const H = Math.round((ROW * list.length + GAP) * Z);
const cv = R.canvas(W, H, PAPER);

let y = GAP;
for (const name of list) {
  const py = Math.round(y * Z);
  R.text(cv, `${name}   ${BRANCH}`, Math.round(GAP * Z), py, INK, Math.round(Z * 0.8));
  const top = y + HEAD;
  // at lesson size
  drawObject(cv, O.OBJECTS[name](50, 50, SMALL, SMALL), GAP, top, Z);
  R.text(cv, `${SMALL} UNITS`, Math.round(GAP * Z), py + Math.round(11 * Z), SOFT, Math.max(1, Math.round(Z * 0.5)));
  // and magnified
  drawObject(cv, O.OBJECTS[name](50, 50, 88, 88), GAP * 2 + CELL, top, Z * 1.0);
  R.text(cv, `${BIG}X`, Math.round((GAP * 2 + CELL) * Z), py + Math.round(11 * Z), SOFT, Math.max(1, Math.round(Z * 0.5)));
  // beside the figure
  if (WITH_FIG) {
    const ox = GAP * 3 + CELL * 2;
    drawFigure(cv, ox, top, Z, 62);
    drawObject(cv, O.OBJECTS[name](78, 72, SMALL, SMALL), ox, top, Z);
    R.text(cv, 'BESIDE HIM', Math.round(ox * Z), py + Math.round(11 * Z), SOFT, Math.max(1, Math.round(Z * 0.5)));
  }
  y += ROW;
}

fs.mkdirSync('scripts/.lesson-shots', { recursive: true });
const out = `scripts/.lesson-shots/objects-${BRANCH}.png`;
const img = await new Promise((res, rej) => new Jimp(cv.w, cv.h, (e, i) => (e ? rej(e) : res(i))));
for (let i = 0; i < cv.w * cv.h; i += 1) {
  img.bitmap.data[i * 4] = cv.px[i * 3];
  img.bitmap.data[i * 4 + 1] = cv.px[i * 3 + 1];
  img.bitmap.data[i * 4 + 2] = cv.px[i * 3 + 2];
  img.bitmap.data[i * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`${out}   ${list.length} object(s), ${cv.w}x${cv.h}`);
