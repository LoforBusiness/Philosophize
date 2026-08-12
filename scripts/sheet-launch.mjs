// THE LAUNCH SCREEN, DRAWN — six scenes on one sheet.
//
//   node scripts/sheet-launch.mjs           all six, small
//   node scripts/sheet-launch.mjs thinker   one scene, full size
//
// Numbers find geometry; only a picture finds "that does not look like the thing
// it is called". The scenery this replaces passed every check it had.
//
// AND THE MAN IS IN THE PICTURE. He is drawn ENTIRELY IN INK, head included, and
// he stands in front of every layer. A scenery tone is not "nice and dark", it is
// a backdrop that either lets a black figure read or swallows him — and the only
// way to know which is to put him there.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';
import { canvas, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'deeply-launch-sheet');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const src = readFileSync(path.join(REPO, rel), 'utf8')
    .replace(/from '@\/components\/lesson\/cinematic\/rig'/g, "from './rig.mjs'");
  writeFileSync(path.join(TMP, name), transform(src, { transforms: ['typescript'] }).code);
  return pathToFileURL(path.join(TMP, name)).href;
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const A = await import(emit('components/launch/launchArt.ts', 'launchArt.mjs'));

const W = A.ART_W, H = A.ART_H;
const FIG_INK = '#1A1A1A';

function stroke(cv, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    cv.fillRect(x - w, y - w, w * 2 + 1, w * 2 + 1, FIG_INK);
  }
}

function figure(cv, stance, x, groundY, k) {
  const limbW = (R.STR.limb / 2) * k;
  const torsoW = (R.STR.torso / 2) * k;
  const headR = R.STR.headR * k;
  const j = R.solve({ x, groundY, k, dir: 1, ...stance });
  stroke(cv, j.shL, j.elL, limbW); stroke(cv, j.elL, j.wrL, limbW);
  stroke(cv, j.hipL, j.kneeL, limbW); stroke(cv, j.kneeL, j.ankL, limbW);
  stroke(cv, j.pel, j.chest, torsoW);
  stroke(cv, j.hipR, j.kneeR, limbW); stroke(cv, j.kneeR, j.ankR, limbW);
  stroke(cv, j.shR, j.elR, limbW); stroke(cv, j.elR, j.wrR, limbW);
  for (let dx = -headR; dx <= headR; dx++) {
    for (let dy = -headR; dy <= headR; dy++) {
      if (dx * dx + dy * dy > headR * headR) continue;
      cv.fillRect(j.head.x + dx, j.head.y + dy, 1, 1, FIG_INK);
    }
  }
}

/** One scene, composited exactly as launchScenes.tsx will composite it. */
function panel(key) {
  const p = A.PALETTES[key];
  const cv = canvas(W, H, p.steps[p.sky[0]]);

  // sky gradient, painted as horizontal bands down to the horizon
  const stops = A.skyStops(key);
  const skyBottom = A.crestFor(key).base - 150;
  for (let y = 0; y < skyBottom; y++) {
    const t = y / skyBottom;
    let a = stops[0], b = stops[stops.length - 1];
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i].offset) { a = stops[i - 1]; b = stops[i]; break; }
    }
    const f = (t - a.offset) / Math.max(1e-6, b.offset - a.offset);
    const ca = [1, 3, 5].map((i) => parseInt(a.color.slice(i, i + 2), 16));
    const cb = [1, 3, 5].map((i) => parseInt(b.color.slice(i, i + 2), 16));
    const hex = '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * f)
      .toString(16).padStart(2, '0')).join('');
    cv.fillRect(0, y, W, 1, hex);
  }

  const disc = A.discFor(key);
  cv.path(disc.d, disc.fill, 0, 0);
  for (const pl of A.planesFor(key)) cv.path(pl.d, pl.fill, 0, 0);

  // the figure, on the crest, at this scene's scale
  const c = A.crestFor(key);
  const x = A.figureX(key);
  figure(cv, R.walk(14), x, A.crestY(c, x), A.figureK(key));
  return cv;
}

const only = process.argv[2];
const keys = only ? [only] : A.SCENE_KEYS;
const scale = only ? 1 : 0.5;
const cellW = Math.round(W * scale), cellH = Math.round(H * scale);
const PAD = 10, LABEL = 18;
const cols = Math.min(keys.length, 6);
const sheetW = PAD + cols * (cellW + PAD);
const sheetH = PAD + LABEL + cellH + PAD;
const sheet = canvas(sheetW, sheetH, '#FFFFFF');

for (let i = 0; i < keys.length; i++) {
  const x = PAD + i * (cellW + PAD);
  text(sheet, keys[i], x, PAD, '#000000', 2);
  const full = panel(keys[i]);
  // nearest-neighbour downscale into the cell
  const cell = canvas(cellW, cellH, '#FFFFFF');
  for (let y = 0; y < cellH; y++) {
    for (let xx = 0; xx < cellW; xx++) {
      const sx = Math.floor(xx / scale), sy = Math.floor(y / scale);
      const si = (sy * W + sx) * 3, di = (y * cellW + xx) * 3;
      cell.px[di] = full.px[si];
      cell.px[di + 1] = full.px[si + 1];
      cell.px[di + 2] = full.px[si + 2];
    }
  }
  sheet.blit(cell, x, PAD + LABEL);
}

const out = new Jimp(sheetW, sheetH);
for (let i = 0; i < sheetW * sheetH; i++) {
  out.bitmap.data[i * 4] = sheet.px[i * 3];
  out.bitmap.data[i * 4 + 1] = sheet.px[i * 3 + 1];
  out.bitmap.data[i * 4 + 2] = sheet.px[i * 3 + 2];
  out.bitmap.data[i * 4 + 3] = 255;
}
const dest = path.join(os.tmpdir(), `launch-sheet${only ? '-' + only : ''}.png`);
await out.writeAsync(dest);
console.log(`${keys.length} scene(s) -> ${dest}  (${sheetW}×${sheetH})`);
