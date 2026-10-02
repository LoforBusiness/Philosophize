// THE HOME-SCREEN WIDGET, DRAWN IN EVERY STATE, IN PLAIN NODE + HEADLESS CHROME.
//
//   npm run sheet:widget                 → widget-states.png (repo root, untracked)
//   npm run sheet:widget -- --offer      → assets/images/widget-offer/*.png, the
//                                          pictures the in-app offer cycles through
//   npm run sheet:widget -- --preview    → assets/images/widget-preview.png, the
//                                          picker's thumbnail. COMPILED into the APK
//                                          (app.json), so run it before a BUILD.
//
// The widget renders to RemoteViews on the phone, which no browser can show. So
// this is a MIRROR: the same zero-import modules the widget is built from —
// lib/widget/mood.ts (what he says and how he feels), widgetScenes.ts (the
// picture, the very SVG string the phone draws), widgetLayout.ts (every size
// decision) and data/widgetFacts.ts — laid out with the same paddings as
// StudyWidget.tsx. The SVG goes in an <img> with object-fit: contain, which is
// what Android's fit-center does, so a scene drawn to the wrong size would show
// its bars here exactly as it would on the phone.
//
// The type is Inter, which runs a little WIDER than the phone's Roboto, so a line
// that fits here fits there.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const OFFER = args.includes('--offer');
const PREVIEW = args.includes('--preview');

// ── load the real modules ───────────────────────────────────────────────────
const { transform } = await import(pathToFileURL(path.join(ROOT, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), 'ph-widget-sheet');
fs.mkdirSync(TMP, { recursive: true });
const FILES = {
  'components/widget/widgetPoses.ts': 'widgetPoses.mjs',
  'components/widget/widgetScenes.ts': 'widgetScenes.mjs',
  'components/widget/widgetLayout.ts': 'widgetLayout.mjs',
  'lib/widget/mood.ts': 'mood.mjs',
  'data/widgetFacts.ts': 'widgetFacts.mjs',
  'data/subjects.ts': 'subjects.mjs',
};
for (const [rel, out] of Object.entries(FILES)) {
  const src = transform(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  fs.writeFileSync(path.join(TMP, out), src);
}
const load = (f) => import(pathToFileURL(path.join(TMP, f)).href);
export const W = {
  scenes: await load('widgetScenes.mjs'),
  layout: await load('widgetLayout.mjs'),
  mood: await load('mood.mjs'),
  facts: (await load('widgetFacts.mjs')).WIDGET_FACTS,
  subjects: (await load('subjects.mjs')).SUBJECTS,
  poses: (await load('widgetPoses.mjs')).WIDGET_POSES,
};
const { sceneSvg, paletteFor, inkFor, SEAL_EMBER, SEAL_CORE } = W.scenes;
const { layoutWidget, PAD, KICKER, FOOT, RADIUS, FACT_LH } = W.layout;

const PAPER = '#FBFAF6', INK = '#1A1A1A', LINE_CALM = '#5C574F', LINE_URGENT = '#A8401F';

// ── the states worth looking at, as real inputs to widgetMood ───────────────
const at = (h, m = 0, day = 15) => new Date(2026, 9, day, h, m);
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ago = (now, n) => key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
export const STATES = [
  ['new · 10 AM', at(10), { streak: 0, last: null }],
  ['morning, not yet', at(8, 10), { streak: 12, last: 1 }],
  ['afternoon, not yet', at(14, 30), { streak: 12, last: 1 }],
  ['evening, not yet', at(19, 40), { streak: 12, last: 1 }],
  ['night, streak at risk', at(22, 40), { streak: 12, last: 1 }],
  ['after midnight', at(1, 30), { streak: 12, last: 1 }],
  ['lesson done', at(18, 5), { streak: 13, last: 0 }],
  ['done, at night', at(23, 0, 16), { streak: 13, last: 0 }],
  ['rest day holding', at(12, 0), { streak: 20, last: 2, rest: 1 }],
  ['missed yesterday', at(9, 0), { streak: 0, last: 2 }],
  ['gone 4 days', at(16, 0), { streak: 0, last: 4 }],
  ['gone 2 weeks', at(11, 0), { streak: 0, last: 14 }],
];
export function moodFor([, now, s]) {
  return W.mood.widgetMood({ now, streak: s.streak, lastLessonDate: s.last == null ? null : ago(now, s.last), restHeld: s.rest ?? 0 }, W.facts);
}

const font = (p) => `url(data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'node_modules/@expo-google-fonts/inter', p)).toString('base64')}) format('truetype')`;
const uri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function seal(n, P) {
  return `<div class="seal" style="background:${P.pillBg};color:${P.pillFg}"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="5.4" fill="${SEAL_EMBER}"/><circle cx="6" cy="6" r="2.5" fill="${SEAL_CORE}"/></svg>${n}</div>`;
}

/** One widget, w × h dp, as HTML — the mirror of StudyWidget.tsx. */
export function widgetHtml(m, w, h) {
  const subj = W.subjects.find((s) => s.slug === m.subject);
  const P = paletteFor(m.tod, m.rain);
  const L = layoutWidget(w, h, m.fact, m.line);
  const spec = { tod: m.tod, rain: m.rain, pose: m.pose, mug: m.mug, crate: m.crate };
  if (L.mode === 'day') {
    return `<div class="w" style="width:${w}px;height:${h}px">
      <img class="art" src="${uri(sceneSvg(spec, w, h, [RADIUS, RADIUS, RADIUS, RADIUS], 0.8))}" style="width:${w}px;height:${h}px">
      <div class="ov" style="padding:${PAD.t}px ${PAD.r}px 0 ${PAD.l}px">${seal(m.streak, P)}
        <div class="day" style="width:${Math.floor(L.textW)}px;margin-top:8px;font-size:${L.lineSize}px;color:${P.text};-webkit-line-clamp:${L.lineLines}">${esc(m.line)}</div></div></div>`;
  }
  const urgent = m.state === 'waiting' && (m.atRisk || m.tod === 'evening');
  return `<div class="w" style="width:${w}px;height:${h}px">
    <img class="art" src="${uri(sceneSvg(spec, L.leftW, h, [RADIUS, 0, 0, RADIUS], 0.56))}" style="width:${L.leftW}px;height:${h}px">
    <div class="ov" style="width:${L.leftW}px;padding:10px">${seal(m.streak, P)}</div>
    <div class="panel" style="left:${L.leftW}px;width:${L.rightW}px;border-radius:0 ${RADIUS}px ${RADIUS}px 0;padding:${PAD.t}px ${PAD.r}px ${PAD.b}px ${PAD.l}px;background:${PAPER}">
      <div class="kick" style="height:${KICKER.h}px;margin-bottom:${KICKER.gap}px;color:${inkFor(subj.hue, PAPER)};font-size:${KICKER.size}px"><span class="dot" style="background:${inkFor(subj.hue, PAPER)}"></span>${esc(subj.short.toUpperCase())}</div>
      <div class="factbox"><div class="fact" style="font-size:${L.factSize}px;line-height:${L.factSize * FACT_LH}px;-webkit-line-clamp:${L.factLines}">${esc(m.fact)}</div></div>
      ${L.footLines ? `<div class="line" style="margin-top:${FOOT.gap}px;font-size:${FOOT.size}px;line-height:${FOOT.lh}px;color:${urgent ? LINE_URGENT : LINE_CALM};-webkit-line-clamp:${L.footLines}">${esc(m.line)}</div>` : ''}
    </div></div>`;
}

export const CSS = `@font-face{font-family:I;font-weight:600;src:${font('600SemiBold/Inter_600SemiBold.ttf')}}@font-face{font-family:I;font-weight:800;src:${font('800ExtraBold/Inter_800ExtraBold.ttf')}}
*{box-sizing:border-box}body{margin:0;font-family:I}
.w{position:relative;overflow:hidden;border-radius:${RADIUS}px}
.art{position:absolute;left:0;top:0;object-fit:contain}
.ov{position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:flex-start}
.panel{position:absolute;top:0;bottom:0;display:flex;flex-direction:column}
.seal{display:inline-flex;align-items:center;gap:4px;font-weight:800;font-size:14px;padding:3px 8px 3px 5px;border-radius:11px}
.kick{white-space:nowrap;display:flex;align-items:center;gap:5px;font-weight:800;letter-spacing:1.4px}.dot{width:7px;height:7px;border-radius:4px}
.factbox{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
.fact,.line,.day{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.fact{font-weight:600;color:${INK}}.line,.day{font-weight:800}.day{line-height:1.2}`;

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
export function shoot(html, out, w, h, scale = 1) {
  const file = path.join(TMP, `page-${path.basename(out)}.html`);
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${CSS}</style>${html}`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    `--window-size=${w},${h}`, `--screenshot=${out}`, '--default-background-color=00000000', pathToFileURL(file).href], { stdio: 'ignore' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (OFFER || PREVIEW) {
    // The offer's three pictures: how the day goes, in three frames.
    const dir = path.join(ROOT, 'assets/images/widget-offer');
    fs.mkdirSync(dir, { recursive: true });
    const pick = { morning: STATES[1], night: STATES[4], done: STATES[6] };
    const W4 = 320, H4 = 150;
    if (OFFER) {
      for (const [name, st] of Object.entries(pick)) {
        shoot(`<div style="width:${W4}px;height:${H4}px">${widgetHtml(moodFor(st), W4, H4)}</div>`, path.join(dir, `${name}.png`), W4, H4, 3);
        console.log(`wrote assets/images/widget-offer/${name}.png`);
      }
    }
    if (PREVIEW) {
      shoot(`<div style="width:${W4}px;height:${H4}px">${widgetHtml(moodFor(STATES[3]), W4, H4)}</div>`, path.join(ROOT, 'assets/images/widget-preview.png'), W4, H4, 2);
      console.log('wrote assets/images/widget-preview.png — compiled into the APK; ships with the next BUILD, not an update');
    }
  } else {
    const SIZES = [[180, 110, '180×110 (min, his day)'], [250, 110, '250×110 (4×2 short)'], [320, 150, '320×150 (4×2 typical)'], [160, 160, '2×2']];
    let html = `<div style="background:#22262B;color:#cfd3da;padding:20px;width:1460px;font-family:I">`;
    for (const st of STATES) {
      const m = moodFor(st);
      html += `<div style="font-weight:800;font-size:13px;margin:16px 0 6px">${esc(st[0])} — ${m.state} · ${m.tod} · pose ${m.pose} · ${m.subject}</div><div style="display:flex;gap:16px;align-items:flex-start">`;
      for (const [w, h, lab] of SIZES) html += `<div><div style="font-size:11px;color:#8a919c;margin-bottom:4px">${lab}</div>${widgetHtml(m, w, h)}</div>`;
      html += '</div>';
    }
    html += '</div>';
    const out = args.find((a) => !a.startsWith('--')) ?? path.join(ROOT, 'widget-states.png');
    shoot(html, out, 1500, 40 + STATES.length * 212, 1);
    console.log(`wrote ${out}`);
  }
}
