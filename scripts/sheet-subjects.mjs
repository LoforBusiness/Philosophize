// THE SUBJECT POSTERS, ON ONE SHEET — no Metro, no app.
//
//   npm run sheet:subjects                 every poster
//   npm run sheet:subjects -- logic ethics just these
//
// Writes scripts/.lesson-shots/subjects.png: each poster at the three shapes the app
// draws it in — a Home carousel card (wide), a Learn tile (near square) and a subject
// page's masthead (very wide) — at the sizes a 390dp phone draws them. A poster that
// only works at one shape is a poster that does not work; posterViewBox grows the
// frame to each box, and this is where that is looked at.
//
// It builds the SVG through `components/subjects/posters.ts` itself, so what it shows
// is what the app draws. The strings are rendered by headless Chrome, which reads SVG
// the way react-native-svg does for everything these posters use (paths, rects,
// circles, ellipses, strokes, one transform per element).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);

/** A module whose only imports are handed to it (check-marks.mjs's idiom). */
function loadWith(rel, deps = {}) {
  const js = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript', 'imports'] }).code;
  const mod = { exports: {} };
  new Function('exports', 'module', 'require', js)(mod.exports, mod, (m) => {
    if (deps[m]) return deps[m];
    throw new Error(`${rel} imports ${m}, which sheet-subjects cannot hand it`);
  });
  return mod.exports;
}
const tone = loadWith('components/shared/tone.ts');
const design = loadWith('constants/design.ts');
const P = loadWith('components/subjects/posters.ts', { '@/components/shared/tone': tone });
const S = loadWith('data/subjects.ts');
const L = loadWith('components/subjects/tileLayout.ts');
const hueOf = (key) => S.getSubject(key)?.hue ?? design.BRANCH[key];

const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const keys = asked.length ? asked : P.POSTER_KEYS;
for (const k of keys) if (!P.POSTER_KEYS.includes(k)) { console.log(`no poster "${k}" — have: ${P.POSTER_KEYS.join(' ')}`); process.exit(1); }

const W = 390;
const shapes = [
  ['card', L.cardWidth(W), L.cardArtHeight(L.cardWidth(W))],
  ['tile', L.tileSize(W), L.tileArtHeight(L.tileSize(W))],
  ['mast', W - 2 * L.PAGE_PAD, L.MAST_ART_H],
];
const cells = keys.map((k) => `<section><h2>${k}</h2><div class="row">${shapes.map(([n, w, h]) =>
  `<figure><div class="box" style="width:${w}px;height:${h}px">${P.posterXml(k, hueOf(k), w, h)}</div><figcaption>${n} ${w}×${h}</figcaption></figure>`).join('')}</div></section>`).join('');
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:20px;background:#FAFAF7;font:600 12px system-ui;color:#1A1A1A}
section{margin-bottom:18px}h2{font:800 13px system-ui;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 6px}
.row{display:flex;gap:14px;align-items:flex-end}.box{border-radius:14px;overflow:hidden}.box svg{display:block}
figure{margin:0}figcaption{margin-top:4px;color:#666}
</style>${cells}`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ashmere-posters-'));
const page = path.join(tmp, 'sheet.html');
fs.writeFileSync(page, html);
fs.mkdirSync('scripts/.lesson-shots', { recursive: true });
const out = path.resolve(process.env.OUT || 'scripts/.lesson-shots/subjects.png');
const width = 40 + shapes.reduce((s, [, w]) => s + w + 14, 0);
const height = 40 + keys.length * (Math.max(...shapes.map(([, , h]) => h)) + 50);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2',
  `--window-size=${width},${height}`, `--screenshot=${out}`, pathToFileURL(page).href], { stdio: 'ignore' });
console.log(`${path.relative(REPO, out)}   ${keys.length} poster(s), ${width}x${height} @2x`);
