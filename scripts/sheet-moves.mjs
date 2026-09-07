// DRAW A MOVEMENT AS A FILMSTRIP, IN PLAIN NODE.
//
//   node scripts/sheet-moves.mjs 121 132        acts 121…132, six frames each
//   node scripts/sheet-moves.mjs 145            one act, large
//   FRAMES=8 node scripts/sheet-moves.mjs 133 144
//
// `check:moves` proves a motion is SOUND — no foot skate, no hand inside the
// skull, no jump between frames, feet on the ground. It cannot tell you whether
// the thing reads as what it is called, and this library is full of evidence
// that the two are different questions: `read` on the launch screen travelled 0.2
// units and passed every smoothness check ever written, because a photograph has
// no discontinuities (§19). N12 is the same finding — three of four "looking"
// actions drew a figure standing perfectly still and every number was fine.
//
// So this is the wardrobe sheet's method pointed at motion instead of costume:
// the REAL rig, the REAL act, frames across `u` (or across the clock for the
// living holds), drawn at the size a lesson draws them. It costs no Metro and no
// browser because `rig.ts` and `moves.ts` are zero-import.
//
// READ IT AS A STRIP, NOT AS FRAMES. What matters is whether the sequence has an
// ARC — a start, a middle that is different, and an end that is somewhere. A
// strip whose six cells look alike is act 39's problem: a gesture that measures
// perfectly and does nothing.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { canvas, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.Jimp ?? JimpPkg;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-moves-sheet');
mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};

const RIG = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const M = await import(emit('components/lesson/cinematic/moves.ts', 'moves.mjs'));

const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

// ── geometry → path data (no arc commands; see rasterpath's header) ──────────
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
  const pts = [[0, -thick / 2], [len, -thick / 2], [len, thick / 2], [0, thick / 2]]
    .map(([x, y]) => [tx + x * c - y * s, ty + x * s + y * c]);
  return `M${pts.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join('L')}Z`;
}
const jointAt = (xf, r) => disc(xf[0].translateX, xf[1].translateY, r);

function figurePath(B, k) {
  const limb = RIG.STR.limb * k;
  const torso = RIG.STR.torso * k;
  const headR = RIG.STR.headR * k;
  let d = '';
  for (const n of ['thighL', 'shinL', 'thighR', 'shinR', 'uarmL', 'farmL', 'uarmR', 'farmR']) {
    d += bonePath(B[n], limb);
  }
  d += bonePath(B.torso, torso);
  for (const n of ['kneeL', 'kneeR', 'ankL', 'ankR', 'elL', 'elR', 'wrL', 'wrR', 'shLd', 'shRd']) {
    d += jointAt(B[n], limb / 2);
  }
  d += jointAt(B.pel, torso / 2) + jointAt(B.shB, torso / 2) + jointAt(B.head, headR);
  return d;
}

// ── which acts, and how each is sampled ─────────────────────────────────────
//
// THE LIVING SHELVES ARE SAMPLED ON THE CLOCK. 59–78 and 157–168 ignore `u`
// entirely, so stepping `u` across them draws the same frame six times and the
// strip says "this does nothing" about a motion that loops perfectly well. This
// is check-moves' own trap, one instrument over.
const LIVING = (a) => (a >= 59 && a <= 78) || (a >= 157 && a <= 168);

const from = Number(process.argv[2] || 121);
const to = Number(process.argv[3] || from);
const acts = [];
for (let a = from; a <= to; a += 1) acts.push(a);

const FRAMES = Number(process.env.FRAMES || 6);
const one = acts.length === 1;
const FIG = Number(process.env.FIG || (one ? 250 : 120));
const k = FIG / RIG.FIG_H;
const CELL_W = Math.round(FIG * 0.82);
const CELL_H = Math.round(FIG * 1.34);
const PAD = 6;
const LABEL = 18;

// The act's own comment, so the strip says what it is meant to be showing.
const SRC = readFileSync(path.join(REPO, 'components/lesson/cinematic/moves.ts'), 'utf8');
const nameOf = (a) => {
  const m = new RegExp(`code === ${a}\\)\\s*\\{\\s*//\\s*(.+)`).exec(SRC);
  return m ? m[1].trim().slice(0, 46) : `act ${a}`;
};

const rowW = FRAMES * CELL_W + (FRAMES + 1) * PAD;
const rowH = CELL_H + LABEL + PAD;
const sheetW = rowW;
const sheetH = acts.length * rowH + PAD;
const sheet = canvas(sheetW, sheetH, '#EFEDE6');

for (const [i, a] of acts.entries()) {
  const oy = PAD + i * rowH;
  text(sheet, `${a}  ${nameOf(a)}`, PAD + 2, oy, '#1A1A1A', one ? 2 : 1);

  for (let f = 0; f < FRAMES; f += 1) {
    const ox = PAD + f * (CELL_W + PAD);
    const top = oy + LABEL;
    sheet.fillRect(ox, top, CELL_W, CELL_H, PAPER);

    // u across the shot for a one-shot; t across twelve seconds for a hold.
    const u = FRAMES === 1 ? 1 : f / (FRAMES - 1);
    const st = LIVING(a) ? M.actStance(a, 3 + u * 12, 1) : M.actStance(a, 3, u);

    const groundY = CELL_H - Math.round(FIG * 0.16);
    const B = RIG.pose(st, CELL_W / 2, groundY, k, 1, 1);
    sheet.fillRect(ox + 4, top + groundY, CELL_W - 8, 1, '#BEBCB4');
    sheet.path(figurePath(B, k), INK, ox, top);
  }
}

const outDir = path.join(REPO, 'scripts', '.lesson-shots');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, one ? `move-${from}.png` : `moves-${from}-${to}.png`);
const img = new Jimp(sheetW, sheetH);
for (let p = 0; p < sheetW * sheetH; p += 1) {
  img.bitmap.data[p * 4] = sheet.px[p * 3];
  img.bitmap.data[p * 4 + 1] = sheet.px[p * 3 + 1];
  img.bitmap.data[p * 4 + 2] = sheet.px[p * 3 + 2];
  img.bitmap.data[p * 4 + 3] = 255;
}
await img.writeAsync(out);
console.log(`wrote ${out}  (${acts.length} act${acts.length > 1 ? 's' : ''} × ${FRAMES} frames)`);
