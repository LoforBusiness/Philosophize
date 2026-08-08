// THE BRANCH ROAD, DRAWN — six places × five units of weather, on one sheet.
//
// The counterpart to sheet-moves.mjs and sheet-critters.mjs, and it exists for
// the same reason: numbers find geometry, only a picture finds "that does not
// look like the thing it is called". The scenery this replaces passed every check
// it had and read as five grey stripes with a cabin on it.
//
// Renders exactly what the phone renders — the same path strings from sceneArt
// and worldPath, composited in the same order, at the same 390×360 the strip
// actually occupies. Nothing is redrawn "for the sheet"; if the sheet is wrong
// the screen is wrong.
//
//   node scripts/sheet-scene.mjs               all thirty, small
//   node scripts/sheet-scene.mjs logic         one place, five units, full size
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
const TMP = path.join(os.tmpdir(), 'philosophize-scene-sheet');
mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  writeFileSync(path.join(TMP, name),
    transform(readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code);
}
emit('components/branch/sceneArt.ts', 'sceneArt.mjs');
const A = await import(pathToFileURL(path.join(TMP, 'sceneArt.mjs')).href);
// worldPath imports nothing, so it needs no rewriting either.
emit('components/branch/worldPath.ts', 'worldPath.mjs');
const W = await import(pathToFileURL(path.join(TMP, 'worldPath.mjs')).href);
emit('components/lesson/cinematic/rig.ts', 'rig.mjs');
const R = await import(pathToFileURL(path.join(TMP, 'rig.mjs')).href);

/** The two ground tones BranchWorld uses. Kept in step by eye, not by import —
 *  the component is TSX and pulling React through sucrase for two hex strings is
 *  not worth it. If they drift, the sheet says so loudly. */
const EARTH = '#635D51';
const INK = '#1A1A1A';

const VIEW_W = 390;                    // a phone
const VIEW_H = 360;                    // the strip's own height, H in BranchWorld
const FIG_K = 0.62;                    // FIG_K in BranchWorld
const FIG_X = VIEW_W * W.LEAD;         // the camera keeps him here, left of centre

// ── AND THE MAN IS IN THE PICTURE ──────────────────────────────────────────
//
// Two rounds of this sheet were judged without him, which is judging the wrong
// thing: he is drawn ENTIRELY IN INK, head included, and he stands in front of
// every layer here. A scenery tone is not "nice and dark", it is a backdrop that
// either lets a black figure read or swallows him — and the only way to know
// which is to put him there.
const LIMB_W = (R.STR.limb / 2) * FIG_K;
const TORSO_W = (R.STR.torso / 2) * FIG_K;
const HEAD_R = R.STR.headR * FIG_K;
const FIG_INK = '#1A1A1A';

function stroke(cv, a, b, w) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2) + 1;
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    cv.fillRect(x - w, y - w, w * 2 + 1, w * 2 + 1, FIG_INK);
  }
}
function figure(cv, stance) {
  const j = R.solve({ x: FIG_X, groundY: W.BASE_Y, k: FIG_K, dir: 1, ...stance });
  stroke(cv, j.shL, j.elL, LIMB_W); stroke(cv, j.elL, j.wrL, LIMB_W);
  stroke(cv, j.hipL, j.kneeL, LIMB_W); stroke(cv, j.kneeL, j.ankL, LIMB_W);
  stroke(cv, j.pel, j.chest, TORSO_W);
  stroke(cv, j.hipR, j.kneeR, LIMB_W); stroke(cv, j.kneeR, j.ankR, LIMB_W);
  stroke(cv, j.shR, j.elR, LIMB_W); stroke(cv, j.elR, j.wrR, LIMB_W);
  for (let dx = -HEAD_R; dx <= HEAD_R; dx++) {
    for (let dy = -HEAD_R; dy <= HEAD_R; dy++) {
      if (dx * dx + dy * dy > HEAD_R * HEAD_R) continue;
      cv.fillRect(j.head.x + dx, j.head.y + dy, 1, 1, FIG_INK);
    }
  }
}

/** One place at one unit, exactly as the screen composites it. */
function panel(place, unit, camX = 0) {
  const p = A.paletteFor(place);
  const cv = canvas(VIEW_W, VIEW_H, p.sky);

  // the disc, first and behind everything — BranchWorld draws it as a plain View
  const dsc = A.discFor(place, unit);
  if (dsc) {
    const cx = VIEW_W * dsc.x, cy = VIEW_H * dsc.y;
    const [r, g, b] = [0, 1, 2].map((i) => parseInt(p.cloud.slice(1 + i * 2, 3 + i * 2), 16));
    for (let y = Math.max(0, cy - dsc.r | 0); y < Math.min(VIEW_H, cy + dsc.r); y++) {
      for (let x = Math.max(0, cx - dsc.r | 0); x < Math.min(VIEW_W, cx + dsc.r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > dsc.r * dsc.r) continue;
        const i = (y * VIEW_W + x) * 3, a = dsc.opacity;
        cv.px[i] += (r - cv.px[i]) * a;
        cv.px[i + 1] += (g - cv.px[i + 1]) * a;
        cv.px[i + 2] += (b - cv.px[i + 2]) * a;
      }
    }
  }

  // then the layers, back to front, each shifted by its own parallax rate
  for (const l of A.sceneLayers(place, unit)) {
    const t = ((camX * l.k) % A.TILE_W + A.TILE_W) % A.TILE_W;
    for (const tile of [0, A.TILE_W]) {
      const ox = tile - t;
      if (ox > VIEW_W || ox + A.TILE_W < 0) continue;
      if (l.under) cv.path(l.under, l.underTone, ox, 0);
      cv.path(l.d, l.tone, ox, 0);
    }
  }

  // and the ground the reader walks on, in its two tones
  const art = W.groundArt(Math.floor(camX / W.CHUNK));
  const gx = W.chunkLeft(Math.floor(camX / W.CHUNK)) - camX;
  cv.path(art.earth, EARTH, gx, 0);
  cv.path(art.ink, INK, gx, 0);
  // Mid-stride rather than standing: a walk spreads the legs and swings an arm
  // clear of the torso, which is the widest the figure ever is against a backdrop.
  figure(cv, R.walk(unit * 9 + 14));
  return cv;
}

const only = process.argv[2];
const places = only ? [only] : A.PLACES;
const UNITS = 5;
const scale = only ? 1 : 1;
const PAD = 10, LABEL = 18;
const cellW = VIEW_W * scale, cellH = VIEW_H * scale;
const sheetW = PAD + UNITS * (cellW + PAD);
const sheetH = PAD + places.length * (cellH + LABEL + PAD);
const sheet = canvas(sheetW, sheetH, '#FFFFFF');

for (let r = 0; r < places.length; r++) {
  const place = places[r];
  const y = PAD + r * (cellH + LABEL + PAD);
  text(sheet, place.replace('-', ' '), PAD, y, '#000000', 2);
  for (let c = 0; c < UNITS; c++) {
    // A camera offset per unit as well, so the sheet is not five views of x = 0 —
    // a tiling seam or a hero that only exists at one x would hide there.
    sheet.blit(panel(place, c, c * 137), PAD + c * (cellW + PAD), y + LABEL);
    text(sheet, `UNIT ${c + 1}`, PAD + c * (cellW + PAD) + 4, y + LABEL + 4, '#FFFFFF', 1);
  }
}

const out = new Jimp(sheetW, sheetH);
for (let i = 0; i < sheetW * sheetH; i++) {
  out.bitmap.data[i * 4] = sheet.px[i * 3];
  out.bitmap.data[i * 4 + 1] = sheet.px[i * 3 + 1];
  out.bitmap.data[i * 4 + 2] = sheet.px[i * 3 + 2];
  out.bitmap.data[i * 4 + 3] = 255;
}
const dest = path.join(os.tmpdir(), `scene-sheet${only ? '-' + only : ''}.png`);
await out.writeAsync(dest);
console.log(`${places.length} place(s) × ${UNITS} units -> ${dest}  (${sheetW}×${sheetH})`);
