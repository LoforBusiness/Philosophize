// THE WHOLE COMIC SHELF ON ONE PAGE.
//
//   node scripts/sheet-comic.mjs            .moves-sheets/comic.png
//
// `sheet-moves.mjs` draws one motion per file, which is right for judging a
// single action and useless for judging a SET — and a set is what has to be
// judged here, because the rule the shelf exists to satisfy is that no two
// lessons do the same funny thing. Twenty-four strips side by side is the only
// way to see that they are actually twenty-four different jokes.
//
// Plain Node, same loader as `check-moves`: rig.ts and moves.ts have no imports,
// sucrase strips the types, jimp draws bones as thick lines and joints as discs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import JimpPkg from 'jimp-compact';
// rasterpath's canvas, because jimp-compact ships NO FONTS — `loadFont` throws
// ENOENT on its own bundled path. `text()` there is a 5x7 bitmap set that needs
// nothing on disk, and it is what every other contact sheet in this repo uses.
import { canvas, text } from './lib/rasterpath.mjs';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'philosophize-comic-sheet');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const js = transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/(rig|moves)(['"])/g, '$1./$2.mjs$3');
  writeFileSync(path.join(TMP, name), js);
  return pathToFileURL(path.join(TMP, name)).href;
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const M = await import(pathToFileURL(path.join(TMP, 'moves.mjs')).href);
const { COMIC } = await import(pathToFileURL(path.join(REPO, 'scripts/lib/liveliness.mjs')).href);

const K = 1.15;
const FRAMES = 6;
const CELL = Math.round(112 * K);
const ROW_H = Math.round(150 * K);
const GROUND = Math.round(126 * K);
const LABEL_W = Math.round(215 * K);   // long names ran into the first figure
const COLS = 2;                       // two columns of twelve reads better than one of 24
const INK = '#1A1A1A', PAPER = '#FAFAF7', RULE = '#DEDBD2';

const LIMB_W = (R.STR.limb / 2) * K;
const TORSO_W = (R.STR.torso / 2) * K;
const HEAD_R = R.STR.headR * K;

function line(img, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    for (let dx = -w; dx <= w; dx++) {
      for (let dy = -w; dy <= w; dy++) {
        if (dx * dx + dy * dy <= w * w) img.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1, INK);
      }
    }
  }
}
function disc(img, c, r) {
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (dx * dx + dy * dy <= r * r) img.fillRect(Math.round(c.x + dx), Math.round(c.y + dy), 1, 1, INK);
    }
  }
}
function draw(img, j) {
  line(img, j.shL, j.elL, LIMB_W); line(img, j.elL, j.wrL, LIMB_W);
  line(img, j.hipL, j.kneeL, LIMB_W); line(img, j.kneeL, j.ankL, LIMB_W);
  line(img, j.pel, j.chest, TORSO_W);
  line(img, j.hipR, j.kneeR, LIMB_W); line(img, j.kneeR, j.ankR, LIMB_W);
  line(img, j.shR, j.elR, LIMB_W); line(img, j.elR, j.wrR, LIMB_W);
  disc(img, j.head, HEAD_R);
}

// Only the twenty-four NEW ones. The eight older gags in COMIC are in the shelf
// so the rotation counts them, but they are not what is being shown off here.
const shelf = COMIC.filter((c) => c.act >= 97).sort((a, b) => a.act - b.act);
const rows = Math.ceil(shelf.length / COLS);
const colW = LABEL_W + CELL * FRAMES;
const W = colW * COLS;
const Hpx = ROW_H * rows;

const img = canvas(W, Hpx, PAPER);

shelf.forEach((gag, idx) => {
  const col = Math.floor(idx / rows);
  const row = idx % rows;
  const ox = col * colW;
  const oy = row * ROW_H;
  // ground rule under the strip
  img.fillRect(ox + LABEL_W, oy + GROUND, colW - LABEL_W, 1, RULE);
  if (row) img.fillRect(ox, oy + 2, colW, 1, RULE);
  for (let f = 0; f < FRAMES; f++) {
    const u = f / (FRAMES - 1);
    const s = M.actStance(gag.act, 3.1, u);
    const j = R.solve({ x: ox + LABEL_W + f * CELL + CELL / 2, groundY: oy + GROUND, k: K, dir: 1, ...s });
    draw(img, j);
  }
  text(img, `${gag.act} ${gag.name}`, ox + 10, oy + Math.round(GROUND * 0.45), INK, 2);
});

mkdirSync('.moves-sheets', { recursive: true });
const out = '.moves-sheets/comic.png';
const png = new Jimp(W, Hpx);
for (let i = 0; i < W * Hpx; i++) {
  png.bitmap.data[i * 4] = img.px[i * 3];
  png.bitmap.data[i * 4 + 1] = img.px[i * 3 + 1];
  png.bitmap.data[i * 4 + 2] = img.px[i * 3 + 2];
  png.bitmap.data[i * 4 + 3] = 255;
}
await png.writeAsync(out);
console.log(`${out}  —  ${shelf.length} actions, ${FRAMES} frames each, ${W}×${Hpx}`);
