// Contact sheet for the widget backdrops: every scene, drawn at the widget's own
// proportions, with the REAL text on top.
//
//   node scripts/sheet-widget.mjs
//
// A backdrop cannot be judged empty. The whole difficulty is that the card is
// dense — header, rule, four lines of quote, attribution, streak book — so a
// scene that looks handsome on its own can still be a mess behind type, and the
// only way to see that is to draw the type. The companion script
// check-widget-contrast.mjs answers the other half ("can it be READ") in numbers.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] ?? path.join(ROOT, 'widget-scenes.png');
const S = 3; // 3x the widget's dp, so the type is legible on the sheet
const W = 250 * S;
const H = 110 * S;

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

const px = (n) => `${n * S}px`;
const QUOTE = '\u201cThe unexamined life is not worth living.\u201d';

// The streak mark, straight out of QuoteWidget so the sheet shows what ships.
const MARK = (ink) => `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2 C6 7 3 12 3 16 a9 9 0 0 0 18 0 c0-4-3-9-9-14 Z" fill="${ink}"/>
<path d="M12 7 C9 11 7.5 13.5 7.5 16 a4.5 4.5 0 0 0 9 0 c0-2.5-1.5-5-4.5-9 Z" fill="${ink}" opacity="0.28"/></svg>`;

const card = (b) => `
<figure>
  <div class="card">
    <div class="art">${b.svg}</div>
    <div class="body" style="color:${b.ink}">
      <div class="head">
        <div class="kicker">DAILY QUOTE</div>
        <div class="date" style="color:${b.inkSoft}">JUL 6</div>
      </div>
      <div class="rule" style="background:${b.hairline}"></div>
      <div class="quote">${QUOTE}</div>
      <div class="foot">
        <div class="author" style="color:${b.inkSoft}">&mdash; SOCRATES</div>
        <div class="mark">${MARK(b.inkSoft)}</div>
        <div class="day" style="color:${b.inkSoft}">3 DAYS</div>
      </div>
    </div>
  </div>
  <figcaption>${b.name}${b.dark ? ' \u00b7 dark' : ''}</figcaption>
</figure>`;

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:I;font-weight:400;src:${font('400Regular/Inter_400Regular.ttf')}}
@font-face{font-family:I;font-weight:500;src:${font('500Medium/Inter_500Medium.ttf')}}
@font-face{font-family:I;font-weight:700;src:${font('700Bold/Inter_700Bold.ttf')}}
@font-face{font-family:I;font-weight:400;font-style:italic;src:${font('400Regular_Italic/Inter_400Regular_Italic.ttf')}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#9a9a96;padding:${px(9)};display:flex;flex-wrap:wrap;gap:${px(11)};font-family:I;width:${(W + 33 * S) * 2}px}
figure{margin:0}
figcaption{font-size:${px(7)};color:#fff;letter-spacing:${px(1)};margin-top:${px(4)};text-transform:uppercase;font-weight:700}
.card{position:relative;width:${W}px;height:${H}px;border-radius:${px(16)};overflow:hidden;border:${px(2)} solid #1A1A1A}
.art{position:absolute;inset:0}
.art svg{width:100%;height:100%;display:block}
.body{position:absolute;inset:0;padding:${px(11)} ${px(13)};display:flex;flex-direction:column}
.head{display:flex;justify-content:space-between;align-items:baseline}
.kicker{font-size:${px(9)};font-weight:700;letter-spacing:${px(2)}}
.date{font-size:${px(9)};font-weight:500;letter-spacing:${px(1)}}
.rule{height:${px(1)};margin:${px(5)} 0}
.quote{flex:1;display:flex;align-items:center;font-size:${px(14)};font-style:italic;line-height:1.34}
.foot{display:flex;align-items:center;margin-top:${px(3)}}
.author{flex:1;font-size:${px(9)};font-weight:700;letter-spacing:${px(1)}}
.mark{width:${px(11)};height:${px(11)};margin-right:${px(4)}}.mark svg{width:100%;height:100%;display:block}
.day{font-size:${px(9)};font-weight:700;letter-spacing:${px(1)}}
</style>${WIDGET_BACKGROUNDS.map(card).join('')}`;

const page = path.join(tmp, 'sheet.html');
fs.writeFileSync(page, html);

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found');

const rows = Math.ceil(WIDGET_BACKGROUNDS.length / 2);
fs.rmSync(OUT, { force: true });
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--screenshot=${OUT.replace(/\\/g, '/')}`,
  `--window-size=${(W + 33 * S) * 2},${rows * (H + 22 * S) + 18 * S}`,
  '--force-device-scale-factor=1', pathToFileURL(page).href], { stdio: 'pipe' });
if (!fs.existsSync(OUT)) throw new Error('Chrome exited without writing the sheet');
console.log(`${WIDGET_BACKGROUNDS.length} scenes -> ${OUT}  (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
