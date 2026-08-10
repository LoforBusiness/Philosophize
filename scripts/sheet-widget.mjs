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

// The streak book, straight out of QuoteWidget so the sheet shows what ships.
const BOOK = (ink, paper) => `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
<path d="M52 52 C 36 56 25 62 23 68 L 41 214 C 42 221 53 215 68 200 Z" fill="${paper}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
<path d="M56 50 L162 28 Q171 26 173 35 L182 178 Q183 188 173 191 L72 200 Q62 201 60 191 L50 62 Q48 51 56 50 Z" fill="${paper}" stroke="${ink}" stroke-width="8" stroke-linejoin="round"/>
<path d="M64 194 L72 212 Q74 216 80 214 L186 194 Q191 192 188 187 L181 178 Z" fill="${paper}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
<path d="M86 150 L152 138 M88 161 L148 150 M90 172 L140 163" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
<text x="116" y="126" font-family="serif" font-weight="bold" font-size="80" fill="${ink}" text-anchor="middle" transform="rotate(-10 116 108)">3</text></svg>`;

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
        <div class="streak">
          <div class="book">${BOOK(b.ink, b.paper)}</div>
          <div class="day" style="color:${b.inkSoft}">DAY STREAK</div>
        </div>
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
.body{position:absolute;inset:0;padding:${px(16)};display:flex;flex-direction:column}
.head{display:flex;justify-content:space-between;align-items:baseline}
.kicker{font-size:${px(9)};font-weight:700;letter-spacing:${px(2)}}
.date{font-size:${px(9)};font-weight:500;letter-spacing:${px(1)}}
.rule{height:${px(1)};margin:${px(8)} 0}
.quote{flex:1;display:flex;align-items:center;font-size:${px(15)};font-style:italic;line-height:1.34}
.foot{display:flex;align-items:flex-end;margin-top:${px(4)}}
.author{flex:1;font-size:${px(10)};font-weight:500;letter-spacing:${px(1)};padding-bottom:${px(6)}}
.streak{display:flex;flex-direction:column;align-items:center}
.book{width:${px(44)};height:${px(57)}}.book svg{width:100%;height:100%;display:block}
.day{font-size:${px(7)};font-weight:700;letter-spacing:${px(1)};margin-top:${px(1)}}
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
