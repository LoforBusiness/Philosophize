// Can the Quick Start card still be read, on all five photographs?
//
//   node scripts/check-quickstart-contrast.mjs          (npm run check:quickstart)
//   node scripts/check-quickstart-contrast.mjs --h=196 --alphas=0.20,0.62,0.92 --stops=0,0.5,1
//
// The card is the one big invitation on Home, and §19's rule applies to it more
// than to anything else: the five skies run from a near-black gorge to a bright
// cloud bank, so no word on it may take its contrast from the picture. It takes
// it from a FIXED scrim and one fixed cream, and this is the arithmetic.
//
// The override flags exist for one job: proving a change did not make things
// worse. Growing a card moves a gradient's stops away from the type, because
// stops are fractions — so "it looks fine" is not evidence, and running the old
// numbers beside the new ones is.
//
// No browser. The card is a photograph, a linear gradient and some text boxes;
// all three composite exactly in plain Node, and doing it here means the check
// runs in about a second.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = createRequire(import.meta.url)('jimp-compact');
const ts = (await import(pathToFileURL(path.join(ROOT, 'node_modules/typescript/lib/typescript.js')).href)).default;

const tmp = path.join(ROOT, 'node_modules/.cache/qs-contrast');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(
  path.join(tmp, 'qs.mjs'),
  ts.transpileModule(fs.readFileSync(path.join(ROOT, 'constants/quickStartArt.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText
);
const C = await import(pathToFileURL(path.join(tmp, 'qs.mjs')).href);

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1];
const H = Number(arg('h') ?? C.QS_CARD_H);
const ALPHAS = (arg('alphas')?.split(',').map(Number)) ?? C.QS_SCRIM.map((s) => Number(s.match(/([\d.]+)\)$/)[1]));
const STOPS = (arg('stops')?.split(',').map(Number)) ?? C.QS_SCRIM_STOPS;

// Card widths worth testing: a common phone and a narrow one. Width sets the
// cover-crop scale, so it changes WHICH slice of a portrait photo is on show.
const WIDTHS = [342, 272];
const SCRIM_RGB = [14, 13, 11];

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const rgba = (s) => {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  return [...[1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)), 1];
};

/** Scrim alpha at a fraction down the card, piecewise-linear between stops. */
function alphaAt(t) {
  if (t <= STOPS[0]) return ALPHAS[0];
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i]) {
      const f = (t - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]);
      return ALPHAS[i - 1] + f * (ALPHAS[i] - ALPHAS[i - 1]);
    }
  }
  return ALPHAS[ALPHAS.length - 1];
}

// The kicker and the branch are NOT here, and their absence is the point: they
// sit on an ink tab now, so their contrast is fixed by construction and no
// property of the photograph can change it. What remains is the type that really
// is laid straight over the picture.
const RUNS = [
  { label: 'title (opaque cream)', band: C.QS_BODY_BAND, colour: C.QS_CREAM, floor: C.QS_FLOOR_BODY },
  { label: 'meta (translucent)', band: C.QS_BODY_BAND, colour: C.QS_FAINT, floor: C.QS_FLOOR_BODY },
];

const files = fs.readdirSync(path.join(ROOT, 'assets/images/quickstart')).filter((f) => /\.jpe?g$/i.test(f)).sort();

console.log(`\nQUICK START — TYPE OVER ALL ${files.length} SKIES`);
console.log(`  card ${H}dp tall, scrim ${ALPHAS.join('/')} at ${STOPS.join('/')}`);
console.log(`  worst pixel in each band, at widths ${WIDTHS.join(' and ')}dp\n`);

let failures = 0;
for (const f of files) {
  const img = await J.read(path.join(ROOT, 'assets/images/quickstart', f));
  const { width: iw, height: ih } = img.bitmap;
  const worst = RUNS.map(() => ({ v: Infinity, w: 0, y: 0 }));

  for (const W of WIDTHS) {
    // `cover`: scale so the card is filled, then centre-crop the overflow.
    const s = Math.max(W / iw, H / ih);
    const offX = (iw * s - W) / 2;
    const offY = (ih * s - H) / 2;
    for (let y = 0; y < H; y++) {
      const a = alphaAt(y / H);
      const sy = Math.min(ih - 1, Math.max(0, Math.round((y + offY) / s)));
      for (let x = 0; x < W; x += 2) {
        const sx = Math.min(iw - 1, Math.max(0, Math.round((x + offX) / s)));
        const p = J.intToRGBA(img.getPixelColor(sx, sy));
        // photograph under the scrim — this is what a letter actually sits on
        const bg = [
          p.r * (1 - a) + SCRIM_RGB[0] * a,
          p.g * (1 - a) + SCRIM_RGB[1] * a,
          p.b * (1 - a) + SCRIM_RGB[2] * a,
        ];
        const bl = lum(...bg);
        RUNS.forEach((run, i) => {
          if (y < run.band[0] || y >= run.band[1]) return;
          const [tr, tg, tb, ta] = rgba(run.colour);
          // A translucent cream is not its own colour: it is that cream mixed
          // with whatever is behind it. Measuring the pure hex would flatter it.
          const tl = lum(tr * ta + bg[0] * (1 - ta), tg * ta + bg[1] * (1 - ta), tb * ta + bg[2] * (1 - ta));
          const c = ratio(tl, bl);
          if (c < worst[i].v) { worst[i] = { v: c, w: W, y }; }
        });
      }
    }
  }

  const bad = worst.some((w, i) => w.v < RUNS[i].floor);
  if (bad) failures++;
  console.log(`  ${bad ? 'FAIL' : 'ok  '}  ${f}`);
  worst.forEach((w, i) => {
    const ok = w.v >= RUNS[i].floor;
    console.log(`        ${ok ? ' ' : '>'} ${RUNS[i].label.padEnd(24)} ${w.v.toFixed(2)}:1  (floor ${RUNS[i].floor}, at ${w.w}dp wide, y ${w.y})`);
  });
}

console.log('');
if (failures) {
  console.log(`${failures} picture(s) fail. Deepen the scrim where the band is, or move the band.\n`);
  process.exit(1);
}
console.log('Every run clears its floor on every sky.\n');
