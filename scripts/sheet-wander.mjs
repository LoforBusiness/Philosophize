// A FILMSTRIP OF THE MOVEMENT LAYER, IN PLAIN NODE.
//
//   node scripts/sheet-wander.mjs                     every pattern, 8 frames each
//   node scripts/sheet-wander.mjs ethics-ethics-3     that lesson's real plans
//   FRAMES=12 node scripts/sheet-wander.mjs
//
// `check:wander` can prove a plan stays in its room and never jumps. It cannot say
// whether a sit READS as sitting down, and §19 records what that costs: three
// launch poses that travelled 0.2 units passed every check in the suite and were,
// in the terms that matter, photographs. This is the instrument that answers it —
// the real rig, the real plan, drawn at the size a lesson draws it.
//
// Plain Node, no Metro and no browser, because `rig.ts`, `moves.ts` and `wander.ts`
// all keep the zero-React rule: they are maths.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { canvas, text } from './lib/rasterpath.mjs';
import { loadTs } from './lib/loadts.mjs';
import { W, stepSeconds } from './lib/wanderrule.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = process.cwd();

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-wander-sheet');
mkdirSync(TMP, { recursive: true });
// `from` overrides where a file is read from — WANDER_SRC draws a HEAD copy of
// wander.ts for a before strip, without touching the working tree.
const emit = (rel, name, from) => {
  const src = transform(readFileSync(from || path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));
const WA = await import(emit('components/lesson/cinematic/wander.ts', 'wander.mjs', process.env.WANDER_SRC));

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

function disc(cx, cy, r) {
  const n = 40;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (2 * Math.PI * i) / n;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
function bonePath(xf, thick) {
  const tx = xf[0].translateX; const ty = xf[1].translateY;
  const deg = parseFloat(String(xf[2].rotate));
  const len = xf[3].scaleX * RIG.BONE_SRC;
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r); const s = Math.sin(r);
  return `M${[[0, -thick / 2], [len, -thick / 2], [len, thick / 2], [0, thick / 2]]
    .map(([x, y]) => `${(tx + x * c - y * s).toFixed(2)},${(ty + x * s + y * c).toFixed(2)}`)
    .join('L')}Z`;
}
const jointAt = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);
function figurePath(B, k) {
  const limb = RIG.STR.limb * k;
  const torso = RIG.STR.torso * k;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) d += bonePath(B[n], limb);
  d += bonePath(B.torso, torso);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) d += jointAt(B[n], limb / 2);
  return d + jointAt(B.pel, torso / 2) + jointAt(B.shB, torso / 2) + jointAt(B.head, RIG.STR.headR * k);
}

/** The patterns, written the way `make-wander` writes them, for the default sheet. */
const S = (span) => stepSeconds(span);
const PATTERNS = [
  ['stroll · out, look up, back', [-60, 60,
    W.TURN, 0.6, 0.3, -1,
    W.STEP, 0.96, S(-40), -40,
    W.LOOK, 2.0, 0.5, 1,
    W.LOOK, 3.1, 0.45, 0,
    W.TURN, 3.6, 0.3, 1,
    W.STEP, 3.96, S(40), 0]],
  ['there and back', [-60, 60,
    W.STEP, 0.6, S(34), 34,
    W.STEP, 2.2, S(34), 0]],
  ['sit on the ground', [-60, 60,
    W.SIT, 0.7, 1.1, 1,
    W.LOOK, 2.1, 0.5, 1,
    W.LOOK, 4.4, 0.4, 0,
    W.SIT, 4.9, 0.95, 0]],
  ['crouch and peer', [-40, 40,
    W.CROUCH, 0.6, 0.6, 1,
    W.LOOK, 1.3, 0.4, -1,
    W.LOOK, 2.3, 0.4, 0,
    W.CROUCH, 2.7, 0.6, 0]],
  ['look up, then down', [0, 0,
    W.LOOK, 0.6, 0.55, 1,
    W.LOOK, 1.75, 0.5, -0.55,
    W.LOOK, 2.8, 0.5, 0]],
  ['look down, full', [0, 0,
    W.LOOK, 0.6, 0.55, -1,
    W.LOOK, 2.4, 0.5, 0]],
  ['over the shoulder', [0, 0,
    W.TURN, 0.6, 0.32, -1,
    W.LOOK, 1.0, 0.4, -0.5,
    W.LOOK, 1.7, 0.4, 0,
    W.TURN, 2.0, 0.32, 1]],
  ['weight shift', [0, 0,
    W.LEAN, 0.6, 0.6, 1,
    W.LEAN, 2.0, 0.6, 0]],
];

const arg = process.argv[2];
let strips = PATTERNS;
if (arg) {
  const { WANDER_PLANS } = await loadTs('data/lessonWander.ts');
  const list = WANDER_PLANS[arg];
  if (!list) { console.log(`no plans for ${arg}`); process.exit(1); }
  strips = list.map((p, i) => [`beat ${i}`, p]).filter(([, p]) => p);
}

// ONLY=<text> keeps the strips whose name contains it — one move, drawn large.
if (process.env.ONLY) strips = strips.filter(([n]) => process.env.ONLY.split('|').some((o) => n.includes(o)));
const OUT_TAG = process.env.OUT_TAG ? `-${process.env.OUT_TAG}` : '';
const FRAMES = Number(process.env.FRAMES || 8);
const FIG = Number(process.env.FIG || 132);
const k = FIG / RIG.FIG_H;
const CELL_W = Math.round(FIG * 1.15);
const CELL_H = Math.round(FIG * 1.3);
const PAD = 6;
const LABEL = 16;

const rowW = FRAMES * CELL_W + (FRAMES + 1) * PAD;
const rowH = CELL_H + LABEL + PAD;
const sheet = canvas(rowW, strips.length * rowH + PAD, '#EFEDE6');

const span = (plan) => {
  let end = 1.5;
  for (let j = 2; j + 3 < plan.length; j += 4) end = Math.max(end, plan[j + 1] + plan[j + 2]);
  return end + 0.5;
};

for (const [i, [name, plan]] of strips.entries()) {
  const oy = PAD + i * rowH;
  text(sheet, name, PAD + 2, oy, INK, 1);
  const total = span(plan);
  for (let f = 0; f < FRAMES; f += 1) {
    const ox = PAD + f * (CELL_W + PAD);
    const top = oy + LABEL;
    sheet.fillRect(ox, top, CELL_W, CELL_H, PAPER);
    const t = (f / (FRAMES - 1)) * total;
    const st = WA.wanderState(plan, t, WA.wanderRest());
    // The base pose is the plainest thing in the library, so everything the strip
    // shows is the layer's own doing rather than a gesture underneath it.
    const base = RIG.emoteHold(0, 3 + t);
    const s = WA.wanderStance(base, st, 3 + t, k);
    const groundY = CELL_H - Math.round(FIG * 0.14);
    const B = RIG.pose(s, CELL_W / 2 + st.dx * k, groundY, k, WA.wanderDir(1, st), 1);
    sheet.fillRect(ox + 3, top + groundY, CELL_W - 6, 1, '#BEBCB4');
    sheet.path(figurePath(B, k), INK, ox, top);
    text(sheet, `${t.toFixed(1)}s  dx${st.dx.toFixed(0)}`, ox + 3, top + CELL_H - 11, '#6B6A64', 1);
  }
}

const OUT = path.join(REPO, 'scripts', '.lesson-shots', `wander-${arg || 'patterns'}${OUT_TAG}.png`);
mkdirSync(path.dirname(OUT), { recursive: true });
const img = new Jimp(sheet.w, sheet.h);
for (let q = 0; q < sheet.w * sheet.h; q += 1) {
  img.bitmap.data[q * 4] = sheet.px[q * 3];
  img.bitmap.data[q * 4 + 1] = sheet.px[q * 3 + 1];
  img.bitmap.data[q * 4 + 2] = sheet.px[q * 3 + 2];
  img.bitmap.data[q * 4 + 3] = 255;
}
await img.writeAsync(OUT);
console.log(`${strips.length} strip(s) · ${FRAMES} frames · ${OUT}`);
