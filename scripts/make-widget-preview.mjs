// Draws assets/images/widget-preview.png — the thumbnail Android shows in the
// widget picker, before anything has been placed.
//
// WHY THIS IS A SCRIPT AND NOT A HAND-DRAWN FILE. The preview is a picture of the
// widget, so the two can disagree, and a picture that lies about what you are
// about to add is worse than no picture. Everything below is read out of
// components/widget/QuoteWidget.tsx — the colours, both SVGs, and the type scale
// — so the preview cannot drift from the thing it depicts. It also drew the app's
// NAME into a native asset, which quietly made renaming the app a native change;
// the widget says DAILY QUOTE now and this file has no name in it at all.
//
//   node scripts/make-widget-preview.mjs
//
// Scale is fixed by the existing asset rather than chosen: 984x420 with a 5px
// border, a 40px corner radius and content inset 45px from the edge is the
// widget's own 2dp / 16dp / 16dp at exactly 2.5x. All three agree, so 2.5 it is.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/images/widget-preview.png');
const WIDGET = path.join(ROOT, 'components/widget/QuoteWidget.tsx');
const S = 2.5;
const W = 984;
const H = 420;

// ── read the real widget ────────────────────────────────────────────────────
// Everything above `export function QuoteWidget` is plain TS: the colour consts,
// SCENE_SVG and bookSvg(). Cut there, drop the react-native-android-widget import
// (it can't load in Node), transpile, and import what's left. The alternative —
// copying the SVG strings into this file — is exactly the drift described above.
const src = fs.readFileSync(WIDGET, 'utf8');
const head = src.slice(0, src.indexOf('export function QuoteWidget'));
if (!head || head.length === src.length) throw new Error('QuoteWidget.tsx: component marker moved');
const ts = (await import(pathToFileURL(path.join(ROOT, 'node_modules/typescript/lib/typescript.js')).href)).default;
const js = ts.transpileModule(
  head.replace(/^import .*from 'react-native-android-widget';$/m, '') +
    '\nexport { PAPER, INK, INK_SOFT, HAIRLINE, SCENE_SVG, bookSvg };\n',
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }
).outputText;

const tmp = path.join(ROOT, 'node_modules/.cache/widget-preview');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'widget.mjs'), js);
const { PAPER, INK, INK_SOFT, HAIRLINE, SCENE_SVG, bookSvg } = await import(
  pathToFileURL(path.join(tmp, 'widget.mjs')).href
);

// ── fonts ───────────────────────────────────────────────────────────────────
// Inter is the app's body face (§2). Embedded base64 because Chrome will not load
// a file:// font off a file:// page.
const font = (p) => {
  const f = path.join(ROOT, 'node_modules/@expo-google-fonts/inter', p);
  return `url(data:font/ttf;base64,${fs.readFileSync(f).toString('base64')}) format('truetype')`;
};

// ── the card, at the widget's own numbers x 2.5 ─────────────────────────────
const px = (n) => `${n * S}px`;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:I;font-weight:400;font-style:normal;src:${font('400Regular/Inter_400Regular.ttf')}}
@font-face{font-family:I;font-weight:500;font-style:normal;src:${font('500Medium/Inter_500Medium.ttf')}}
@font-face{font-family:I;font-weight:700;font-style:normal;src:${font('700Bold/Inter_700Bold.ttf')}}
@font-face{font-family:I;font-weight:400;font-style:italic;src:${font('400Regular_Italic/Inter_400Regular_Italic.ttf')}}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:#fff}
.card{position:relative;width:${W}px;height:${H}px;background:${PAPER};
  border:${px(2)} solid ${INK};border-radius:${px(16)};overflow:hidden}
/* layer 2 — the faint scene, bottom-left, padding 8 (QuoteWidget layer 2) */
.scene{position:absolute;left:${px(8)};bottom:${px(8)};width:${px(216)};height:${px(99)}}
.scene svg{width:100%;height:100%;display:block}
/* layer 3 — content, padding 16 */
.body{position:absolute;inset:0;padding:${px(16)};display:flex;flex-direction:column;
  font-family:I;color:${INK}}
.head{display:flex;justify-content:space-between;align-items:baseline}
.kicker{font-size:${px(9)};font-weight:700;letter-spacing:${px(2)}}
.date{font-size:${px(9)};font-weight:500;letter-spacing:${px(1)};color:${INK_SOFT}}
.rule{height:${px(1)};background:${HAIRLINE};margin:${px(8)} 0}
.quote{flex:1;display:flex;align-items:center;font-size:${px(15)};font-style:italic;line-height:1.34}
.foot{display:flex;align-items:flex-end;margin-top:${px(4)}}
.author{flex:1;font-size:${px(10)};font-weight:500;letter-spacing:${px(1)};color:${INK_SOFT};
  padding-bottom:${px(6)}}
.streak{display:flex;flex-direction:column;align-items:center}
.streak svg{width:${px(44)};height:${px(57)};display:block}
.day{font-size:${px(7)};font-weight:700;letter-spacing:${px(1)};color:${INK_SOFT};margin-top:${px(1)}}
</style>
<div class="card">
  <div class="scene">${SCENE_SVG}</div>
  <div class="body">
    <div class="head"><div class="kicker">DAILY QUOTE</div><div class="date">JUL 6</div></div>
    <div class="rule"></div>
    <div class="quote">&ldquo;The unexamined life is not worth living.&rdquo;</div>
    <div class="foot">
      <div class="author">&mdash; SOCRATES</div>
      <div class="streak">${bookSvg(3)}<div class="day">DAY STREAK</div></div>
    </div>
  </div>
</div>`;

const page = path.join(tmp, 'preview.html');
fs.writeFileSync(page, html);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found — install it or edit CHROME in this script');

// Chrome on Windows will not take a backslash path here: it exits 0, prints
// nothing, and writes nothing. Forward slashes, and then PROVE it wrote — the
// first version of this script stat()ed the previous file, found 34 KB and
// reported success on a screenshot that never happened.
fs.rmSync(OUT, { force: true });
execFileSync(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--screenshot=${OUT.replace(/\\/g, '/')}`,
  `--window-size=${W},${H}`,
  '--force-device-scale-factor=1',
  pathToFileURL(page).href,
], { stdio: 'pipe' });

if (!fs.existsSync(OUT)) throw new Error('Chrome exited without writing the screenshot');
const { size } = fs.statSync(OUT);
console.log(`widget-preview.png  ${W}x${H}  ${(size / 1024).toFixed(0)} KB`);
console.log('drawn from QuoteWidget.tsx — no app name anywhere in it');
