// THE WALLPAPER TILE — `npm run make:wallpaper`.
//
// Writes assets/images/wallpaper/doodle.png, @2x and @3x: one 132dp square of faint
// line doodles (a book, a bulb, a star, a question mark, a column, an atom, a flask and
// an hourglass — one for every subject) that DoodleGround repeats behind Home, Learn
// and a subject page.
//
// A small TILE and not a screen-sized drawing, on purpose: §19's GPU rule. An <Svg> or
// an image the size of the screen is held as a screen-sized bitmap for as long as its
// tab is built (Home's ruled paper was 9.6MB for sixty hairlines); a repeated 396px
// tile is one small bitmap drawn through a shader.
//
// The colours come from tone.ts (WALL, WALL_DOODLE), so the tile and the page colour
// it sits on can never drift apart. Rendered by headless Chrome, then cropped exactly.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import JimpPkg from 'jimp-compact';

const Jimp = JimpPkg.default || JimpPkg;
const REPO = process.cwd();
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const js = transform(fs.readFileSync(path.join(REPO, 'components/shared/tone.ts'), 'utf8'), { transforms: ['typescript', 'imports'] }).code;
const tone = { exports: {} };
new Function('exports', 'module', 'require', js)(tone.exports, tone, (m) => { throw new Error(`tone.ts imports ${m}`); });
const { WALL, WALL_DOODLE } = tone.exports;

export const TILE = 132;

// Every doodle keeps 4 units clear of the tile's edge, so the repeat has no seam.
const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 132 132" fill="none" stroke="${WALL_DOODLE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect width="132" height="132" fill="${WALL}" stroke="none"/>
<path d="M10 18h11a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H10zM40 18H29a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h11z"/>
<path d="M92 10a9 9 0 0 1 5 16v4h-10v-4a9 9 0 0 1 5-16zM88 34h8"/>
<path d="M58 62l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
<path d="M108 62q0-8 8-8t8 8q0 5-8 7v4M116 80v.5"/>
<path d="M14 88h16M16 88v22M28 88v22M12 112h20"/>
<circle cx="80" cy="110" r="2.5"/><ellipse cx="80" cy="110" rx="12" ry="4.5"/><ellipse cx="80" cy="110" rx="12" ry="4.5" transform="rotate(60 80 110)"/><ellipse cx="80" cy="110" rx="12" ry="4.5" transform="rotate(-60 80 110)"/>
<path d="M55 12v9l-7 12h18l-7-12v-9M53 12h8"/>
<path d="M113 96h12M113 124h12M115 96q0 7 4 14q-4 7-4 14M123 96q0 7-4 14q4 7 4 14"/>
<circle cx="30" cy="62" r="1.8" fill="${WALL_DOODLE}"/><circle cx="96" cy="84" r="1.8" fill="${WALL_DOODLE}"/>
</svg>`;

const outDir = path.join(REPO, 'assets/images/wallpaper');
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ashmere-wall-'));
const page = path.join(tmp, 'tile.html');
fs.writeFileSync(page, `<!doctype html><style>html,body{margin:0;background:${WALL}}svg{display:block}</style>${tileSvg}`);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

for (const [scale, suffix] of [[1, ''], [2, '@2x'], [3, '@3x']]) {
  const shot = path.join(tmp, `shot${scale}.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    '--window-size=400,400', `--screenshot=${shot}`, pathToFileURL(page).href], { stdio: 'ignore' });
  const im = await Jimp.read(shot);
  im.crop(0, 0, TILE * scale, TILE * scale);
  const out = path.join(outDir, `doodle${suffix}.png`);
  await im.writeAsync(out);
  console.log(`${path.relative(REPO, out)}   ${im.bitmap.width}x${im.bitmap.height}   ${fs.statSync(out).size} bytes`);
}
