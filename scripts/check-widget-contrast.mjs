// Can every word on the widget actually be read, on every backdrop?
//
//   node scripts/check-widget-contrast.mjs      (npm run check:widget)
//
// The widget is the densest card in the app — header, rule, four lines of quote,
// attribution, streak caption — laid over a drawing. §19's rule is that contrast
// must be CONSTRUCTED rather than taken from the artwork, and this is the
// arithmetic that proves it was.
//
// HOW THE TEXT BOXES ARE FOUND. Not by re-deriving the layout here — that is a
// copy that drifts. The card is rendered twice at the same size from the same
// CSS: once with one group of text runs painted solid magenta, once with all the
// text hidden. Every magenta pixel in the first render is a pixel a letter can
// occupy; the second render says what is UNDER it. So the boxes come from the
// layout itself, and a layout change moves them automatically.
//
// The measure is deliberately pessimistic: the WORST pixel anywhere in a run's
// box, not the average, and not only the pixels a glyph actually inks. A run
// passes when even its worst pixel clears the floor.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const S = 3;
// The scene is a FUNCTION of the card's size now — see backgrounds.ts. Passing
// the widget's own 250x110 is not a detail: `b.svg` on its own stringifies to
// the function's SOURCE, which is not SVG, so the card renders blank and every
// run measures 1.00:1 against nothing. That is what this check reported the
// first time it was run after the change, and a 1.00:1 is always this, never art.
const W = 250 * S;
const H = 110 * S;
// WCAG AA for body text. The quote is 15sp italic — not large text, so 4.5.
const FLOOR = 4.5;

const ts = (await import(pathToFileURL(path.join(ROOT, 'node_modules/typescript/lib/typescript.js')).href)).default;
const tmp = path.join(ROOT, 'node_modules/.cache/widget-contrast');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(
  path.join(tmp, 'bg.mjs'),
  ts.transpileModule(fs.readFileSync(path.join(ROOT, 'components/widget/backgrounds.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText
);
const { WIDGET_BACKGROUNDS } = await import(pathToFileURL(path.join(tmp, 'bg.mjs')).href);
const { createRequire } = await import('node:module');
const J = createRequire(import.meta.url)('jimp-compact');

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found');

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const font = (p) =>
  `url(data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'node_modules/@expo-google-fonts/inter', p)).toString('base64')}) format('truetype')`;
const px = (n) => `${n * S}px`;
const QUOTE = '\u201cA long quote that runs the full width of the card and wraps onto four separate lines to reach the very bottom of the space.\u201d';

// `mode`: 'ink' paints the ink-coloured runs magenta, 'soft' the soft ones,
// 'none' hides all text. Magenta because no scene contains it.
function page(b, mode) {
  const M = '#FF00FF';
  const inkMark = mode === 'ink' ? `color:transparent;background:${M}` : 'color:transparent';
  const softMark = mode === 'soft' ? `color:transparent;background:${M}` : 'color:transparent';
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:I;font-weight:400;src:${font('400Regular/Inter_400Regular.ttf')}}
@font-face{font-family:I;font-weight:500;src:${font('500Medium/Inter_500Medium.ttf')}}
@font-face{font-family:I;font-weight:700;src:${font('700Bold/Inter_700Bold.ttf')}}
@font-face{font-family:I;font-weight:400;font-style:italic;src:${font('400Regular_Italic/Inter_400Regular_Italic.ttf')}}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px}
.card{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.art{position:absolute;inset:0}.art svg{width:100%;height:100%;display:block}
.body{position:absolute;inset:0;padding:${px(16)};display:flex;flex-direction:column;font-family:I}
.head{display:flex;justify-content:space-between;align-items:baseline}
.kicker{font-size:${px(9)};font-weight:700;letter-spacing:${px(2)};${inkMark}}
.date{font-size:${px(9)};font-weight:500;letter-spacing:${px(1)};${softMark}}
.rule{height:${px(1)};margin:${px(8)} 0;background:transparent}
.quote{flex:1;display:flex;align-items:center;font-size:${px(15)};font-style:italic;line-height:1.34}
.quote span{${inkMark}}
.foot{display:flex;align-items:flex-end;margin-top:${px(4)}}
.author{flex:1;font-size:${px(10)};font-weight:500;letter-spacing:${px(1)};padding-bottom:${px(6)};${softMark}}
.streak{display:flex;flex-direction:column;align-items:center}
.spacer{width:${px(44)};height:${px(57)}}
.day{font-size:${px(7)};font-weight:700;letter-spacing:${px(1)};margin-top:${px(1)};${softMark}}
</style>
<div class="card"><div class="art">${b.svg(250, 110)}</div><div class="body">
<div class="head"><div class="kicker">DAILY QUOTE</div><div class="date">JUL 6</div></div>
<div class="rule"></div>
<div class="quote"><span>${QUOTE}</span></div>
<div class="foot"><div class="author">&mdash; SOCRATES</div>
<div class="streak"><div class="spacer"></div><div class="day">DAY STREAK</div></div></div>
</div></div>`;
}

function shoot(html, name) {
  const p = path.join(tmp, `${name}.html`);
  const out = path.join(tmp, `${name}.png`);
  fs.writeFileSync(p, html);
  fs.rmSync(out, { force: true });
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--screenshot=${out.replace(/\\/g, '/')}`, `--window-size=${W},${H}`,
    '--force-device-scale-factor=1', pathToFileURL(p).href], { stdio: 'pipe' });
  if (!fs.existsSync(out)) throw new Error(`Chrome wrote no screenshot for ${name}`);
  return out;
}

console.log('\nWIDGET TEXT OVER EVERY BACKDROP');
console.log(`  worst pixel in each run's box, WCAG floor ${FLOOR}:1\n`);

let failures = 0;
// A letter is read against the tone AROUND it, not against one pixel. Sampling
// raw pixels makes a 2px star count the same as a moon, which is why the first
// run of this script flagged a star field as unreadable. Blurring the backdrop
// by about a stroke width (1.5dp) before sampling is what "what tone is this
// letter sitting on" actually means — a dot dissolves into its surroundings, a
// disc does not.
const BLUR = Math.round(1.5 * S);

for (const b of WIDGET_BACKGROUNDS) {
  const bare = (await J.read(shoot(page(b, 'none'), `${b.id}-bare`))).blur(BLUR);
  const rows = [];
  for (const [mode, colour, label] of [['ink', b.ink, 'kicker + quote'], ['soft', b.inkSoft, 'date + author + streak']]) {
    const marked = await J.read(shoot(page(b, mode), `${b.id}-${mode}`));
    const tl = lum(...hex(colour));
    let worst = Infinity, at = null;
    marked.scan(0, 0, W, H, function (x, y, i) {
      const d = this.bitmap.data;
      if (!(d[i] > 200 && d[i + 1] < 60 && d[i + 2] > 200)) return; // not a text box pixel
      const k = (y * W + x) * 4, u = bare.bitmap.data;
      const c = ratio(tl, lum(u[k], u[k + 1], u[k + 2]));
      if (c < worst) { worst = c; at = [x, y]; }
    });
    const ok = worst >= FLOOR;
    if (!ok) failures++;
    rows.push([ok, label, worst, at]);
  }
  const bad = rows.some((r) => !r[0]);
  console.log(`  ${bad ? 'FAIL' : 'ok  '}  ${b.name.padEnd(11)}${b.dark ? 'dark ' : 'light'}`);
  for (const [ok, label, worst, at] of rows) {
    console.log(`          ${ok ? ' ' : '>'} ${label.padEnd(24)} worst ${worst.toFixed(2)}:1${at ? `  at ${at[0]},${at[1]}` : ''}`);
  }
}

console.log('');
if (failures) {
  console.log(`${failures} run(s) below ${FLOOR}:1 — move the art out from under them, or lighten it.\n`);
  process.exit(1);
}
console.log('Every word on every backdrop clears the floor.\n');
