// THE SUBJECT DRAWINGS, ON ONE SHEET — in plain Node, no Metro, no browser.
//
//   npm run sheet:subjects                 every scene
//   npm run sheet:subjects -- logic ethics just these
//
// Writes scripts/.lesson-shots/subjects.png: each drawing large on its own tile, and
// again at 96px, which is about what the Learn grid draws one at on a narrow phone. A
// drawing that only reads when it is large is a drawing that does not read.
//
// It draws through `components/subjects/subjectArt.ts` itself — the same parts, the
// same role → fill mapping (`fillFor`), the same outline order as SubjectArt.tsx — so
// what it shows is what the app draws, not a restatement of it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const R = await import(pathToFileURL(path.join(REPO, 'scripts/lib/rasterpath.mjs')).href);
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);

const TMP = path.join(os.tmpdir(), 'ashmere-subject-sheet');
fs.mkdirSync(TMP, { recursive: true });
/** A module whose only imports are handed to it (check-marks.mjs's idiom). */
function loadWith(rel, deps = {}) {
  const js = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript', 'imports'] }).code;
  const mod = { exports: {} };
  new Function('exports', 'module', 'require', js)(mod.exports, mod, (m) => {
    if (deps[m]) return deps[m];
    throw new Error(`${rel} imports ${m}, which sheet-subjects cannot hand it`);
  });
  return mod.exports;
}
const tone = loadWith('components/shared/tone.ts');
const design = loadWith('constants/design.ts');
const A = loadWith('components/subjects/subjectArt.ts', { '@/components/shared/tone': tone });
const S = loadWith('data/subjects.ts');

const hueOf = (key) => S.getSubject(key)?.hue ?? design.BRANCH[key];

// ── the four primitives as path data — Silhouette.tsx's geometry exactly ────
const K = (4 / 3) * (Math.SQRT2 - 1);
const rot2 = (x, y, rot) => {
  const c = Math.cos((rot * Math.PI) / 180); const s = Math.sin((rot * Math.PI) / 180);
  return (dx, dy) => `${(x + dx * c - dy * s).toFixed(2)} ${(y + dx * s + dy * c).toFixed(2)}`;
};
function ellD(x, y, w, h, rot = 0) {
  const a = w / 2; const b = h / 2; const P = rot2(x, y, rot);
  return `M ${P(-a, 0)} C ${P(-a, -b * K)} ${P(-a * K, -b)} ${P(0, -b)} C ${P(a * K, -b)} ${P(a, -b * K)} ${P(a, 0)}`
    + ` C ${P(a, b * K)} ${P(a * K, b)} ${P(0, b)} C ${P(-a * K, b)} ${P(-a, b * K)} ${P(-a, 0)} Z`;
}
function rectD(x, y, w, h, rot = 0, rad = 0) {
  const P = rot2(x, y, rot); const a = w / 2; const b = h / 2; const r = Math.max(0, Math.min(rad, a, b));
  if (r <= 0.01) return `M ${P(-a, -b)} L ${P(a, -b)} L ${P(a, b)} L ${P(-a, b)} Z`;
  return `M ${P(-a + r, -b)} L ${P(a - r, -b)} Q ${P(a, -b)} ${P(a, -b + r)} L ${P(a, b - r)} Q ${P(a, b)} ${P(a - r, b)}`
    + ` L ${P(-a + r, b)} Q ${P(-a, b)} ${P(-a, b - r)} L ${P(-a, -b + r)} Q ${P(-a, -b)} ${P(-a + r, -b)} Z`;
}
function barD(x1, y1, x2, y2, t) {
  const dx = x2 - x1; const dy = y2 - y1; const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len; const uy = dy / len; const r = t / 2; const nx = -uy * r; const ny = ux * r; const c = 0.5523;
  return `M ${x1 + nx} ${y1 + ny} L ${x2 + nx} ${y2 + ny}`
    + ` C ${x2 + nx + ux * r * c} ${y2 + ny + uy * r * c} ${x2 + ux * r + nx * c} ${y2 + uy * r + ny * c} ${x2 + ux * r} ${y2 + uy * r}`
    + ` C ${x2 + ux * r - nx * c} ${y2 + uy * r - ny * c} ${x2 - nx + ux * r * c} ${y2 - ny + uy * r * c} ${x2 - nx} ${y2 - ny}`
    + ` L ${x1 - nx} ${y1 - ny}`
    + ` C ${x1 - nx - ux * r * c} ${y1 - ny - uy * r * c} ${x1 - ux * r - nx * c} ${y1 - uy * r - ny * c} ${x1 - ux * r} ${y1 - uy * r}`
    + ` C ${x1 - ux * r + nx * c} ${y1 - uy * r + ny * c} ${x1 + nx - ux * r * c} ${y1 + ny - uy * r * c} ${x1 + nx} ${y1 + ny} Z`;
}
function triD(x, y, w, h, dir, rot = 0) {
  const P = rot2(x, y, rot); const a = w / 2; const b = h / 2;
  if (dir === 'up') return `M ${P(0, -b)} L ${P(a, b)} L ${P(-a, b)} Z`;
  if (dir === 'down') return `M ${P(-a, -b)} L ${P(a, -b)} L ${P(0, b)} Z`;
  if (dir === 'left') return `M ${P(-a, 0)} L ${P(a, -b)} L ${P(a, b)} Z`;
  return `M ${P(a, 0)} L ${P(-a, -b)} L ${P(-a, b)} Z`;
}
function partD(p, g = 0) {
  if (p.k === 'ell') return ellD(p.x, p.y, p.w + 2 * g, p.h + 2 * g, p.rot);
  if (p.k === 'rect') return rectD(p.x, p.y, p.w + 2 * g, p.h + 2 * g, p.rot, p.rad + g);
  if (p.k === 'bar') return barD(p.x1, p.y1, p.x2, p.y2, p.t + 2 * g);
  return triD(p.x, p.y, p.w + 3 * g, p.h + 3 * g, p.dir, p.rot);
}

const isBody = (p) => p.role === 'mass' || p.role === 'face';

/** One scene into a size×size tile at (ox, oy) — SubjectArt.tsx's order, exactly. */
function drawScene(cv, key, ox, oy, size) {
  const t = A.sceneTones(hueOf(key));
  const s = size / 100;
  const line = A.ART_LINE * s;
  cv.path(rectD(size / 2, size / 2, size - 2, size - 2, 0, size * 0.14), t.tileEdge, ox, oy, 1);
  cv.path(rectD(size / 2, size / 2, size - 6, size - 6, 0, size * 0.12), t.tile, ox, oy, 1);
  const g = A.GROUND_SLAB;
  cv.path(rectD(g.x * s, g.y * s, g.w * s, g.h * s, 0, g.rad * s), t.ground, ox, oy, 1);
  const sc = A.artIn(key, 0, 0, size, size);
  for (const layer of sc.layers) {
    const body = layer.filter(isBody);
    const marks = layer.filter((p) => !isBody(p));
    for (const p of body) cv.path(partD(p, line), t.ink, ox, oy, 1);
    for (const p of body) cv.path(partD(p), A.fillFor(p.role, t), ox, oy, 1);
    for (const p of marks) cv.path(partD(p), A.fillFor(p.role, t), ox, oy, 1);
  }
  const k = sc.spark;
  cv.path(rectD(k.x, k.y, k.s + 2 * line, k.s + 2 * line, 45, k.s * 0.2), t.ink, ox, oy, 1);
  cv.path(rectD(k.x, k.y, k.s, k.s, 45, k.s * 0.2), t.spark, ox, oy, 1);
}

const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const keys = asked.length ? asked : Object.keys(A.ART);
for (const k of keys) if (!A.ART[k]) { console.log(`no scene "${k}" — have: ${Object.keys(A.ART).join(' ')}`); process.exit(1); }

const BIG = 240; const SMALL = 96; const GAP = 20; const HEAD = 26;
const CELL_W = BIG + GAP; const CELL_H = HEAD + BIG + 10 + SMALL + GAP;
const COLS = Math.min(4, keys.length);
const ROWS = Math.ceil(keys.length / COLS);
const cv = R.canvas(COLS * CELL_W + GAP, ROWS * CELL_H + GAP, '#FAFAF7');
keys.forEach((key, i) => {
  const x = GAP + (i % COLS) * CELL_W;
  const y = GAP + Math.floor(i / COLS) * CELL_H;
  R.text(cv, key.toUpperCase(), x, y, '#1A1A1A', 2);
  drawScene(cv, key, x, y + HEAD, BIG);
  drawScene(cv, key, x, y + HEAD + BIG + 10, SMALL);
});

fs.mkdirSync('scripts/.lesson-shots', { recursive: true });
const out = process.env.OUT || 'scripts/.lesson-shots/subjects.png';
const img = await new Promise((res, rej) => new Jimp(cv.w, cv.h, (e, im) => (e ? rej(e) : res(im))));
for (let i = 0; i < cv.w * cv.h; i += 1) {
  img.bitmap.data[i * 4] = cv.px[i * 3];
  img.bitmap.data[i * 4 + 1] = cv.px[i * 3 + 1];
  img.bitmap.data[i * 4 + 2] = cv.px[i * 3 + 2];
  img.bitmap.data[i * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`${out}   ${keys.length} scene(s), ${cv.w}x${cv.h}`);
