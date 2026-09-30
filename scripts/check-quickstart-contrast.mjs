// Can the Quick Start card still be read, on every one of its pictures?
//
//   node scripts/check-quickstart-contrast.mjs          (npm run check:quickstart)
//
// The card is the one big invitation on Home, and §19's rule applies to it more
// than to anything else: no word on it may take its contrast from the picture.
// Since 2026-09-29 the pictures are drawn scenes (components/home/quickStartScenes.ts),
// each standing on a horizon with a dark ground, and the card slides the picture so
// that horizon lands just above the title. So the words sit on the scene's ground by
// CONSTRUCTION — and this is what proves it: it lays every rendered PNG exactly as the
// card does (qsLayout), at every height and width the card can take, and measures
// the worst pixel under the type. An object that reaches down into the words — a coin
// stack, a lit doorway, a pot — fails here by name.
//
// No browser. The card is a picture on two flat fills; all of it composites exactly
// in plain Node.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = createRequire(import.meta.url)('jimp-compact');
const { transform } = await import(pathToFileURL(path.join(ROOT, 'node_modules/sucrase/dist/index.js')).href);
const load = (rel) => {
  const js = transform(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { transforms: ['typescript', 'imports'] }).code;
  const mod = { exports: {} };
  new Function('exports', 'module', 'require', js)(mod.exports, mod, (m) => { throw new Error(`${rel} imports ${m}`); });
  return mod.exports;
};
const C = load('constants/quickStartArt.ts');
const { QS_SCENES, QS_CANVAS, qsLayout } = load('components/home/quickStartScenes.ts');

const HEIGHTS = [...C.QS_TEST_HEIGHTS];
// A narrow phone, a common one and a wide one: width decides how far the picture
// is scaled, and so where its objects land against the words.
const WIDTHS = [272, 342, 382];

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const rgba = (s) => {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  return [...[1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)), 1];
};

// The kicker is NOT here: it sits on an ink tab, so its contrast is fixed by
// construction. What remains is the type laid on the card's own ground.
const RUNS = [
  { label: 'title (opaque cream)', colour: C.QS_CREAM, floor: C.QS_FLOOR_BODY },
  { label: 'meta (translucent)', colour: C.QS_FAINT, floor: C.QS_FLOOR_BODY },
];

console.log(`
QUICK START — TYPE OVER ALL ${QS_SCENES.length} PICTURES`);
console.log(`  heights ${HEIGHTS.join(', ')}dp · widths ${WIDTHS.join(', ')}dp · laid by qsLayout, no scrim`);
console.log(`  worst pixel under the words, across every height×width
`);

const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
let failures = 0;
for (const sc of QS_SCENES) {
  const file = path.join(ROOT, 'assets/images/quickstart', `${sc.id}.png`);
  if (!fs.existsSync(file)) { failures++; console.log(`  FAIL  ${sc.id}: no PNG — run npm run make:quickstart`); continue; }
  const img = await J.read(file);
  const px = img.bitmap.width / QS_CANVAS;
  const sky = hex(sc.sky), grd = hex(sc.ground);
  const worst = RUNS.map(() => ({ v: Infinity, w: 0, h: 0, y: 0 }));

  for (const H of HEIGHTS) {
   const band = C.qsBodyBand(H);
   for (const W of WIDTHS) {
    const L = qsLayout(W, H, C.QS_BODY_DP);
    for (let y = Math.max(0, Math.floor(band[0])); y < H; y++) {
      for (let x = 0; x < W; x += 2) {
        const cx = (x - L.left) / L.s, cy = (y - L.top) / L.s;
        let bg;
        if (cy < 0) bg = sky;
        else if (cy >= QS_CANVAS) bg = grd;
        else {
          const p = J.intToRGBA(img.getPixelColor(Math.min(img.bitmap.width - 1, Math.round(cx * px)), Math.min(img.bitmap.height - 1, Math.round(cy * px))));
          bg = [p.r, p.g, p.b];
        }
        const bl = lum(...bg);
        RUNS.forEach((run, i) => {
          const [tr, tg, tb, ta] = rgba(run.colour);
          // A translucent cream is not its own colour: it is that cream mixed
          // with whatever is behind it. Measuring the pure hex would flatter it.
          const tl = lum(tr * ta + bg[0] * (1 - ta), tg * ta + bg[1] * (1 - ta), tb * ta + bg[2] * (1 - ta));
          const c = ratio(tl, bl);
          if (c < worst[i].v) { worst[i] = { v: c, w: W, h: H, y }; }
        });
      }
    }
   }
  }

  const bad = worst.some((w, i) => w.v < RUNS[i].floor);
  if (bad) failures++;
  console.log(`  ${bad ? 'FAIL' : 'ok  '}  ${sc.id} · ${sc.name}`);
  worst.forEach((w, i) => {
    const ok = w.v >= RUNS[i].floor;
    console.log(`        ${ok ? ' ' : '>'} ${RUNS[i].label.padEnd(24)} ${w.v.toFixed(2)}:1  (floor ${RUNS[i].floor}, worst at ${w.h}×${w.w}dp, y ${w.y})`);
  });
}

console.log('');
if (failures) {
  console.log(`${failures} picture(s) fail. Something in the scene reaches below its horizon into the words: lift it, or darken the ground. Then npm run make:quickstart.\n`);
  process.exit(1);
}
console.log('Every run clears its floor on every picture.\n');
