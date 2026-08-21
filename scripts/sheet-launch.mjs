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
    .replace(/from '@\/components\/lesson\/cinematic\/rig'/g, "from './rig.mjs'")
    // moves.ts imports rig relatively rather than through the '@/...' alias, and
    // launchMotion.ts imports moves.ts through the alias — both need the same
    // on-disk rewrite rig.ts already gets, or Node's ESM loader can't resolve
    // the bare specifier. Same rewrite check-launch.mjs's emit() carries.
    .replace(/from '@\/components\/lesson\/cinematic\/moves'/g, "from './moves.mjs'")
    .replace(/from '\.\/rig'/g, "from './rig.mjs'");
  writeFileSync(path.join(TMP, name), transform(src, { transforms: ['typescript'] }).code);
  return pathToFileURL(path.join(TMP, name)).href;
}
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);
const A = await import(emit('components/launch/launchArt.ts', 'launchArt.mjs'));
// LM.launchStance is what check-launch.mjs actually measures each scene against
// (§Defect 2) — draw that instead of a universal standing gait so the sheet
// stops rendering a pose no scene plays.
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const LM = await import(emit('components/launch/launchMotion.ts', 'launchMotion.mjs'));

const W = A.ART_W, H = A.ART_H;
const FIG_INK = '#1A1A1A';

// The sky gradient's colour at a given y — the SAME interpolation
// check-launch.mjs's skyHexAt uses, ported here rather than written a third
// time. panel()'s own row-by-row sky wash below is the same formula inlined
// per-pixel.
function skyHexAt(key, y) {
  const stops = A.skyStops(key);
  const t = Math.min(1, Math.max(0, y) / (A.crestFor(key).base - 150));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].offset) { a = stops[i - 1]; b = stops[i]; break; }
  }
  const f = (t - a.offset) / Math.max(1e-6, b.offset - a.offset);
  const ca = [1, 3, 5].map((i) => parseInt(a.color.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.color.slice(i, i + 2), 16));
  const byte = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + ca.map((v, i) => byte(v + (cb[i] - v) * f)).join('');
}

function stroke(cv, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    cv.fillRect(x - w, y - w, w * 2 + 1, w * 2 + 1, FIG_INK);
  }
}

/**
 * The contact shadow, drawn the same way LaunchFigure draws it.
 *
 * It is a second copy of that geometry, which is a cost worth paying: the
 * shadow is the whole answer to "he looks like he is sitting on air", and a
 * sheet that omits it shows a picture nobody will ever see. Same straddle of
 * the ankles, same 34k + stride width, same tenth-of-width height, same 0.5.
 */
function contactShadow(cv, j, k, tone, cast) {
  const lo = Math.min(j.ankL.x, j.ankR.x);
  const hi = Math.max(j.ankL.x, j.ankR.x);
  const cy = Math.max(j.ankL.y, j.ankR.y);
  const reach = R.FIG_H * k * cast.len;
  const fullW = 22 * k + (hi - lo) + reach;
  const foot = (lo + hi) / 2 + cast.dir * ((hi - lo) / 2 + 11 * k);
  // Same anchoring as LaunchFigure: the ellipse starts at the feet and grows
  // only in the direction the light throws it.
  const cx = cast.dir === 1 ? foot - 11 * k - (hi - lo) / 2 + fullW / 2
                            : foot + 11 * k + (hi - lo) / 2 - fullW / 2;
  const w = fullW / 2;
  const h = Math.max(2.5, 5 * k) / 2;
  const [tr, tg, tb] = [1, 3, 5].map((i) => parseInt(tone.slice(i, i + 2), 16));
  for (let dx = -w; dx <= w; dx++) {
    const dy = h * Math.sqrt(Math.max(0, 1 - (dx / w) * (dx / w)));
    // The same ramp LaunchFigure's LinearGradient applies: full strength for the
    // first 18% out from the feet, then falling to nothing. u is 0 at the foot
    // end whichever way the light throws it.
    const u = cast.dir === 1 ? (dx + w) / (2 * w) : 1 - (dx + w) / (2 * w);
    const fade = u <= 0.18 ? 1 : Math.max(0, (1 - u) / 0.82);
    const a = 0.42 * fade;
    if (a <= 0.004) continue;
    for (let y = -Math.ceil(dy); y <= Math.ceil(dy); y++) {
      const px = Math.round(cx + dx), py = Math.round(cy + y);
      if (px < 0 || py < 0 || px >= cv.w || py >= cv.h) continue;
      const i = (py * cv.w + px) * 3;
      cv.px[i] += (tr - cv.px[i]) * a;
      cv.px[i + 1] += (tg - cv.px[i + 1]) * a;
      cv.px[i + 2] += (tb - cv.px[i + 2]) * a;
    }
  }
}

function figure(cv, stance, x, groundY, k, shadowTone, cast) {
  const limbW = (R.STR.limb / 2) * k;
  const torsoW = (R.STR.torso / 2) * k;
  const headR = R.STR.headR * k;
  const j = R.solve({ x, groundY, k, dir: 1, ...stance });
  if (shadowTone) contactShadow(cv, j, k, shadowTone, cast);
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
  // Base fill matches launchScenes.tsx's own base <Rect>: the sky's HORIZON
  // step, covering the full stage before the gradient (which only reaches
  // down to the horizon) is laid on top of it.
  const cv = canvas(W, H, p.steps[p.sky[1]]);

  // sky gradient, painted as horizontal bands down to the horizon
  const skyBottom = A.crestFor(key).base - 150;
  for (let y = 0; y < skyBottom; y++) cv.fillRect(0, y, W, 1, skyHexAt(key, y));

  // PAINT ORDER matches launchScenes.tsx exactly: disc, then sky bands (cloud
  // in front of the sun, mist in front of the far land), then planes LAST — the
  // vanish check below assumes a plane, not the disc, is what the figure's body
  // is actually read against.
  const disc = A.discFor(key);
  cv.path(disc.d, disc.fill, 0, 0);
  // `alpha` composites PER PIXEL against whatever is already painted there —
  // the same thing SVG's fillOpacity does, and the reason this has to be a
  // canvas-level parameter rather than a pre-mixed fill colour. A band that
  // crosses the disc shows disc·(1-o) + band·o at those pixels and
  // sky·(1-o) + band·o everywhere else, in one pass, because the canvas
  // underneath is already whichever of the two is there. Pre-blending a single
  // "the sky tone this band sits over" hex (the previous version) got that
  // wrong wherever a band crossed the disc — the whole reason a band was
  // authored to cross the disc in the first place (lookout, sip).
  for (const b of A.skyBandsFor(key)) cv.path(b.d, b.fill, 0, 0, 1, b.opacity);
  for (const pl of A.planesFor(key)) cv.path(pl.d, pl.fill, 0, 0);
  // (the near cover is painted AFTER the figure — see below)

  // the figure, on the crest, at this scene's scale — the pose it actually
  // plays (t = 2.0, the same instant check-launch.mjs samples), not a
  // universal walk cycle.
  const c = A.crestFor(key);
  const x = A.figureX(key);
  figure(cv, LM.launchStance(key, 2.0), x, A.crestY(c, x), A.figureK(key),
    A.PALETTES[key].steps[0], A.castFor(key));

  // THE NEAR GROUND COVER, in front of him — the same order launchScenes.tsx
  // composites: back, figure, front.
  const fore = A.foreFor(key);
  if (fore.d) cv.path(fore.d, fore.fill, 0, 0);
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
