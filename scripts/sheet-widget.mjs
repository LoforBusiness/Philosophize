// Contact sheet for the widget backdrops: every scene, at several real widget
// sizes, with the REAL text on top.
//
//   node scripts/sheet-widget.mjs
//
// A backdrop cannot be judged empty. The whole difficulty is that the card is
// dense — header, rule, four lines of quote, attribution, streak — so a scene
// that looks handsome on its own can still be a mess behind type, and the only
// way to see that is to draw the type. check-widget-contrast.mjs answers the
// other half ("can it be READ") in numbers.
//
// ── AND IT DRAWS THE SVG THE WAY ANDROID DOES ───────────────────────────────
//
// This sheet used to inline the SVG into the page, where a browser honours
// `preserveAspectRatio="slice"` and covers the card. Android does not: androidsvg
// renders the picture at the document's own size and hands it to an ImageView,
// which fit-centers it. So the sheet showed a full-bleed scene while the phone
// showed a letterboxed one, and it showed that happily for as long as the bug
// existed — a harness agreeing with the intention instead of with the device.
//
// So the scene goes in an <img> with `object-fit: contain`, which IS fit-center.
// If a scene's aspect does not match its card, this sheet now shows the bars.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] ?? path.join(ROOT, 'widget-scenes.png');

/** Real sizes the widget can be, in dp — min, the 4×2 target, and resized tall. */
const SIZES = [
  { w: 180, h: 110, label: '180×110 min' },
  { w: 250, h: 110, label: '250×110 target' },
  { w: 300, h: 220, label: '300×220 resized' },
];
const S = 2.4;   // sheet pixels per dp, so 9sp type is legible here

const ts = (await import(pathToFileURL(path.join(ROOT, 'node_modules/typescript/lib/typescript.js')).href)).default;
const tmp = path.join(ROOT, 'node_modules/.cache/widget-sheet');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(
  path.join(tmp, 'bg.mjs'),
  ts.transpileModule(fs.readFileSync(path.join(ROOT, 'components/widget/backgrounds.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText
);
const { WIDGET_BACKGROUNDS } = await import(pathToFileURL(path.join(tmp, 'bg.mjs')).href);

const font = (p) =>
  `url(data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'node_modules/@expo-google-fonts/inter', p)).toString('base64')}) format('truetype')`;

const QUOTE = '\u201cThe unexamined life is not worth living.\u201d';
const MARK = (ink) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2 C6 7 3 12 3 16 a9 9 0 0 0 18 0 c0-4-3-9-9-14 Z" fill="${ink}"/>
<path d="M12 7 C9 11 7.5 13.5 7.5 16 a4.5 4.5 0 0 0 9 0 c0-2.5-1.5-5-4.5-9 Z" fill="${ink}" opacity="0.28"/></svg>`;

const dataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const card = (b, size) => {
  const W = size.w * S, H = size.h * S;
  const px = (n) => `${n * S}px`;
  return `
<figure>
  <div class="card" style="width:${W}px;height:${H}px;border-width:${px(2)};border-radius:${px(16)}">
    <img class="art" src="${dataUri(b.svg(size.w, size.h))}" style="background:${b.paper}">
    <div class="body" style="color:${b.ink};padding:${px(11)} ${px(13)}">
      <div class="head">
        <div style="font-size:${px(9)};font-weight:700;letter-spacing:${px(2)}">DAILY QUOTE</div>
        <div style="font-size:${px(9)};font-weight:500;letter-spacing:${px(1)};color:${b.inkSoft}">JUL 6</div>
      </div>
      <div class="rule" style="background:${b.hairline};height:${px(1)};margin:${px(5)} 0"></div>
      <div class="quote" style="font-size:${px(14)}">${QUOTE}</div>
      <div class="foot" style="margin-top:${px(3)}">
        <div style="flex:1;font-size:${px(9)};font-weight:700;letter-spacing:${px(1)};color:${b.inkSoft}">&mdash; SOCRATES</div>
        <div class="mark" style="width:${px(11)};height:${px(11)};margin-right:${px(4)}">${MARK(b.inkSoft)}</div>
        <div style="font-size:${px(9)};font-weight:700;letter-spacing:${px(1)};color:${b.inkSoft}">3 DAYS</div>
      </div>
    </div>
  </div>
  <figcaption>${b.name}${b.dark ? ' \u00b7 dark' : ''} &nbsp;&nbsp; ${size.label}</figcaption>
</figure>`;
};

const rowsHtml = WIDGET_BACKGROUNDS
  .map((b) => `<div class="row">${SIZES.map((s) => card(b, s)).join('')}</div>`)
  .join('');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:I;font-weight:400;src:${font('400Regular/Inter_400Regular.ttf')}}
@font-face{font-family:I;font-weight:500;src:${font('500Medium/Inter_500Medium.ttf')}}
@font-face{font-family:I;font-weight:700;src:${font('700Bold/Inter_700Bold.ttf')}}
@font-face{font-family:I;font-weight:400;font-style:italic;src:${font('400Regular_Italic/Inter_400Regular_Italic.ttf')}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#9a9a96;padding:22px;font-family:I}
.row{display:flex;align-items:flex-start;gap:26px;margin-bottom:26px}
figure{margin:0}
figcaption{font-size:13px;color:#fff;letter-spacing:1px;margin-top:7px;text-transform:uppercase;font-weight:700}
.card{position:relative;overflow:hidden;border-style:solid;border-color:#1A1A1A}
/* object-fit:contain IS Android's FIT_CENTER. If a scene is the wrong shape for
   its card, the bars show here exactly as they do on the phone. */
.art{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
.body{position:absolute;inset:0;display:flex;flex-direction:column}
.head{display:flex;justify-content:space-between;align-items:baseline}
.quote{flex:1;display:flex;align-items:center;font-style:italic;line-height:1.34}
.foot{display:flex;align-items:center}
.mark svg{width:100%;height:100%;display:block}
</style>${rowsHtml}`;

const page = path.join(tmp, 'sheet.html');
fs.writeFileSync(page, html);

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found');

const wide = SIZES.reduce((n, s) => n + s.w * S + 26, 0) + 44;
const tall = WIDGET_BACKGROUNDS.length * (Math.max(...SIZES.map((s) => s.h)) * S + 60) + 44;
fs.rmSync(OUT, { force: true });
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--screenshot=${OUT.replace(/\\/g, '/')}`,
  `--window-size=${Math.ceil(wide)},${Math.ceil(tall)}`,
  '--force-device-scale-factor=1', pathToFileURL(page).href], { stdio: 'pipe' });
if (!fs.existsSync(OUT)) throw new Error('Chrome exited without writing the sheet');
console.log(`${WIDGET_BACKGROUNDS.length} scenes × ${SIZES.length} sizes -> ${OUT}  (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
