// Derives every icon the app ships from ONE artwork: assets/brand/ashmere-reader-1024.png.
//
//   node scripts/make-icons.mjs
//
// Six files come out of it, and they are not the same picture at six sizes —
// each surface crops, masks or recolours differently, and getting that wrong is
// invisible until it is on a phone:
//
//   icon.png                     1024  full-bleed, as drawn
//   android-icon-background.png  1024  the paper, flat
//   android-icon-foreground.png  1024  the reader alone, inside the adaptive safe zone
//   android-icon-monochrome.png  1024  themed icons — alpha only, speckles closed
//   notification-icon.png          96  status bar — alpha only, speckles closed
//   favicon.png                    48  web
//
// TWO THINGS ARE MEASURED, NOT CHOSEN.
//
// 1. THE SAFE ZONE. An adaptive icon is a 108dp canvas the launcher masks to its
//    own shape; only the centre 66dp is guaranteed to survive. The reader's
//    furthest ink from its own centre is 472.2px out of 512 — the mug on one
//    side and the trailing foot on the other — so drawn full size he would lose
//    both to a circular mask. FIT scales by the measured extreme rather than by
//    the bounding box, because the bbox CORNER holds no ink (552.9px) and using
//    it would shrink the mark by a fifth for nothing.
//
// 2. THE CLOSE. The reader is line art on paper, so isolate() — which reads
//    alpha from LUMINANCE — turns the mug body, the book pages and the stool
//    seat transparent along with the background: they are the same paper. The
//    silhouette outputs are therefore outlines, and an outline is mush at 24dp,
//    which is the crossed-swords lesson in §19 again. The morphological CLOSE
//    welds those hairlines into a mass without moving the drawing's outer edge.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import J from 'jimp-compact';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/brand/ashmere-reader-1024.png');
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

// ── the SOLID silhouette, for the two outputs drawn small ───────────────────
// isolate() reads alpha from luminance, which is right for the launcher: the mug
// body, the book pages and the stool seat ARE paper, and letting the adaptive
// background show through them is what makes the drawing look drawn.
//
// At 24dp it is a disaster. Everything that survives is a hairline, so the status
// bar gets a scatter of disconnected white pixels that reads as dirt — measured,
// not guessed: rendered at 24dp the reader was not identifiable as a figure at all.
//
// So the silhouette outputs use the drawing's OUTER CONTOUR instead. A flood fill
// from the border marks the true background; everything the fill cannot reach is
// ink, enclosed paper included. The mug becomes a solid block, the book a solid
// wedge, and the whole mark becomes one connected mass that still reads as a
// seated figure holding two things when it is 24 pixels wide.
function solid(src) {
  const w = src.bitmap.width, h = src.bitmap.height, d = src.bitmap.data;
  const bg = new Uint8Array(w * h);
  const paperish = (i) => (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) >= LUM_CLEAR;
  // iterative flood so a 1024² canvas cannot blow the stack
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, 0, x, h - 1); }
  for (let y = 0; y < h; y++) { stack.push(0, y, w - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const k = y * w + x;
    if (bg[k]) continue;
    if (!paperish(k * 4)) continue;
    bg[k] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  const out = new J(w, h, 0x00000000);
  const o = out.bitmap.data;
  for (let k = 0; k < w * h; k++) {
    const j = k * 4;
    o[j] = 0; o[j + 1] = 0; o[j + 2] = 0; o[j + 3] = bg[k] ? 0 : 255;
  }
  return out;
}

// ── drop what is too small to survive the size it will be drawn at ──────────
// The steam over the mug is three curls and four flecks — seven ink components,
// none above 0.32% of the figure, which is ONE component at 236,064px because the
// mug, the book and the stool all touch him. At 24dp those seven become loose
// specks beside the mark and read as dirt in the status bar; at launcher size they
// are the nicest thing in the drawing. So they are dropped from the silhouettes
// and kept everywhere else.
//
// By AREA rather than by a hardcoded rectangle: a rectangle would be a number
// nobody could check, and it would silently clip the mug the day the artwork is
// redrawn an inch to the left.
function dropSpecks(img, minShare = 0.02) {
  const w = img.bitmap.width, h = img.bitmap.height, d = img.bitmap.data;
  const lab = new Int32Array(w * h).fill(-1);
  const areas = [];
  for (let s0 = 0; s0 < w * h; s0++) {
    if (d[s0 * 4 + 3] <= 10 || lab[s0] >= 0) continue;
    const id = areas.length; let a = 0; const q = [s0]; lab[s0] = id;
    while (q.length) {
      const k = q.pop(); a++; const x = k % w;
      for (const m of [k + 1, k - 1, k + w, k - w]) {
        if (m < 0 || m >= w * h) continue;
        if (Math.abs((m % w) - x) > 1) continue;          // no wrap at the row edge
        if (d[m * 4 + 3] <= 10 || lab[m] >= 0) continue;
        lab[m] = id; q.push(m);
      }
    }
    areas.push(a);
  }
  const big = Math.max(...areas, 1);
  for (let k = 0; k < w * h; k++) {
    const id = lab[k];
    if (id >= 0 && areas[id] < big * minShare) d[k * 4 + 3] = 0;
  }
  return img;
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
const blob = dropSpecks(solid(src));   // outer contour, steam dropped: for anything drawn small
const m = extremes(mark);
console.log(`ink ${m.w}x${m.h}, centre (${m.cx.toFixed(1)}, ${m.cy.toFixed(1)}), extreme ${m.maxR.toFixed(1)}px`);

// 1 — full-bleed launcher / store icon, exactly as drawn
await save(src.clone(), 'icon.png');

// 2 — adaptive background: the paper, flat edge to edge
await save(new J(N, N, PAPER), 'android-icon-background.png');

// 3 — adaptive foreground. 0.3055 = 66dp of 108, halved: the guaranteed safe radius.
await save(place(mark, N, 0.3055, null), 'android-icon-foreground.png');

// 4 — themed (monochrome) icon. Alpha carries the shape and the system tints it,
// so the RGB is set flat; speckles closed because this is drawn small.
await save(place(close(blob.clone(), 3), N, 0.3055, [0, 0, 0]), 'android-icon-monochrome.png');

// 5 — notification icon: silhouette in the status bar at ~24dp. Same closing, and
// a little more inset than the adaptive zone because the bar crops tightly.
await save(place(close(blob.clone(), 3), 96, 0.40, [255, 255, 255]), 'notification-icon.png');

// 6 — web favicon
await save(src.clone().resize(48, 48), 'favicon.png');

console.log('');
for (const [n, size, kb] of wrote) console.log(`  ${n.padEnd(30)} ${size.padEnd(10)} ${kb}`);
