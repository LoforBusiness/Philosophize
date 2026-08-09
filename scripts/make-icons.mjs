// Derives every icon the app ships from ONE artwork: assets/brand/deeply-D-1024.png.
//
//   node scripts/make-icons.mjs
//
// Six files come out of it, and they are not the same picture at six sizes —
// each surface crops, masks or recolours differently, and getting that wrong is
// invisible until it is on a phone:
//
//   icon.png                     1024  full-bleed, as drawn
//   android-icon-background.png  1024  the paper, flat
//   android-icon-foreground.png  1024  the D alone, inside the adaptive safe zone
//   android-icon-monochrome.png  1024  themed icons — alpha only, speckles closed
//   notification-icon.png          96  status bar — alpha only, speckles closed
//   favicon.png                    48  web
//
// TWO THINGS ARE MEASURED, NOT CHOSEN.
//
// 1. THE SAFE ZONE. An adaptive icon is a 108dp canvas the launcher masks to its
//    own shape; only the centre 66dp is guaranteed to survive. The D's furthest
//    ink from its own centre is the bottom-left serif, 460.4px out of 512 — so
//    the full-size D would lose that serif to a circular mask. FIT scales by the
//    measured extreme rather than by the bounding box, because the bbox CORNER
//    holds no ink (485.6px) and using it would shrink the mark for nothing.
//
// 2. THE SPECKLES. The artwork is letterpress: the ink is full of tiny holes.
//    That reads as texture at launcher size and as dirt at 24dp, which is the
//    same lesson as the crossed swords in §19 — a fine detail is mush at the size
//    it is actually drawn. So the two silhouette outputs get a morphological
//    CLOSE first, which fills the holes without moving the letterform's edge.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import J from 'jimp-compact';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/brand/deeply-D-1024.png');
const IMG = path.join(ROOT, 'assets/images');
const N = 1024;

// The paper the D is printed on. Read from the artwork so it can never disagree.
let PAPER = null;

// ── isolate ─────────────────────────────────────────────────────────────────
// Alpha from luminance on a ramp, not a hard threshold: a threshold would strip
// the anti-aliasing and leave the curve of the bowl visibly stepped.
const LUM_CLEAR = 200; // >= this is paper
const LUM_SOLID = 120; // <= this is ink

function isolate(src) {
  const out = new J(N, N, 0x00000000);
  src.scan(0, 0, N, N, function (x, y, i) {
    const d = this.bitmap.data;
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const a = lum >= LUM_CLEAR ? 0 : lum <= LUM_SOLID ? 255
      : Math.round(255 * (LUM_CLEAR - lum) / (LUM_CLEAR - LUM_SOLID));
    const o = out.bitmap.data, j = (y * N + x) * 4;
    o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = a;
  });
  return out;
}

// ── morphological close on the alpha channel ────────────────────────────────
// Separable (square structuring element) — a disc would be more correct and is
// indistinguishable here, at a fraction of the cost.
function rank(img, r, pick) {
  const w = img.bitmap.width, h = img.bitmap.height, d = img.bitmap.data;
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = pick === Math.max ? 0 : 255;
    for (let k = -r; k <= r; k++) {
      const xx = x + k; if (xx < 0 || xx >= w) continue;
      v = pick(v, d[(y * w + xx) * 4 + 3]);
    }
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = pick === Math.max ? 0 : 255;
    for (let k = -r; k <= r; k++) {
      const yy = y + k; if (yy < 0 || yy >= h) continue;
      v = pick(v, tmp[yy * w + x]);
    }
    d[(y * w + x) * 4 + 3] = v;
  }
  return img;
}
const close = (img, r) => rank(rank(img, r, Math.max), r, Math.min);

// ── measure + place ─────────────────────────────────────────────────────────
// The furthest ink from the mark's own centre. This is the number the safe zone
// has to contain, and it is smaller than the bbox diagonal.
function extremes(img) {
  const w = img.bitmap.width, h = img.bitmap.height, d = img.bitmap.data;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 10) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let maxR = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 10) maxR = Math.max(maxR, Math.hypot(x - cx, y - cy));
  }
  return { x0, y0, x1, y1, cx, cy, maxR, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Scale `mark` so its extreme ink sits at `radius` of a `size` canvas, and centre
// the INK (not the source frame) on that canvas.
function place(mark, size, radius, tint) {
  const m = extremes(mark);
  const s = (radius * size) / m.maxR;
  const scaled = mark.clone().resize(Math.round(N * s), Math.round(N * s));
  const out = new J(size, size, 0x00000000);
  out.composite(scaled, Math.round(size / 2 - m.cx * s), Math.round(size / 2 - m.cy * s));
  if (tint) {
    out.scan(0, 0, size, size, function (x, y, i) {
      const d = this.bitmap.data;
      d[i] = tint[0]; d[i + 1] = tint[1]; d[i + 2] = tint[2];
    });
  }
  return out;
}

const wrote = [];
async function save(img, name) {
  const p = path.join(IMG, name);
  fs.rmSync(p, { force: true });
  await img.writeAsync(p);
  if (!fs.existsSync(p)) throw new Error(`${name} was not written`);
  wrote.push([name, `${img.bitmap.width}x${img.bitmap.height}`, `${(fs.statSync(p).size / 1024).toFixed(0)} KB`]);
}

const src = await J.read(SRC);
if (src.bitmap.width !== N || src.bitmap.height !== N) throw new Error(`source must be ${N}x${N}`);
{
  const d = src.bitmap.data;
  PAPER = J.rgbaToInt(d[0], d[1], d[2], 255);
  console.log(`paper #${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('')} (read from the artwork's corner)`);
}

const mark = isolate(src);
const m = extremes(mark);
console.log(`D ink ${m.w}x${m.h}, centre (${m.cx.toFixed(1)}, ${m.cy.toFixed(1)}), extreme ${m.maxR.toFixed(1)}px`);

// 1 — full-bleed launcher / store icon, exactly as drawn
await save(src.clone(), 'icon.png');

// 2 — adaptive background: the paper, flat edge to edge
await save(new J(N, N, PAPER), 'android-icon-background.png');

// 3 — adaptive foreground. 0.3055 = 66dp of 108, halved: the guaranteed safe radius.
await save(place(mark, N, 0.3055, null), 'android-icon-foreground.png');

// 4 — themed (monochrome) icon. Alpha carries the shape and the system tints it,
// so the RGB is set flat; speckles closed because this is drawn small.
await save(place(close(mark.clone(), 9), N, 0.3055, [0, 0, 0]), 'android-icon-monochrome.png');

// 5 — notification icon: silhouette in the status bar at ~24dp. Same closing, and
// a little more inset than the adaptive zone because the bar crops tightly.
await save(place(close(mark.clone(), 9), 96, 0.40, [255, 255, 255]), 'notification-icon.png');

// 6 — web favicon
await save(src.clone().resize(48, 48), 'favicon.png');

console.log('');
for (const [n, size, kb] of wrote) console.log(`  ${n.padEnd(30)} ${size.padEnd(10)} ${kb}`);
