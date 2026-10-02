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
// this is a MIRROR built from the same zero-import modules the widget is —
// lib/widget/mood.ts, widgetLayout.ts, widgetTheme.ts, widgetIcons.ts and
// data/widgetFacts.ts — with StudyWidget.tsx's paddings and sizes. The type is
// Inter, which runs a little WIDER than the phone's Roboto, so a line that fits
// here fits there.
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
  'components/widget/widgetLayout.ts': 'widgetLayout.mjs',
  'components/widget/widgetTheme.ts': 'widgetTheme.mjs',
  'components/widget/widgetIcons.ts': 'widgetIcons.mjs',
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
  layout: await load('widgetLayout.mjs'),
  theme: await load('widgetTheme.mjs'),
  icons: await load('widgetIcons.mjs'),
  mood: await load('mood.mjs'),
  facts: (await load('widgetFacts.mjs')).WIDGET_FACTS,
  subjects: (await load('subjects.mjs')).SUBJECTS,
};
const { layoutWidget, PAD, RADIUS, T, WEEK, FACT, GAP } = W.layout;
const { W: C, markFor, mix, STATUS_COLOR, STATUS_ICON } = W.theme;
const { ICONS, ICON_VIEWBOX } = W.icons;

// ── the states worth looking at, as real inputs to widgetMood ───────────────
const at = (h, m = 0, day = 15) => new Date(2026, 9, day, h, m); // Thu 15 Oct 2026
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const back = (now, n) => key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - n));
/** The days studied for a streak that ended `last` days ago and ran `run` days. */
const ran = (now, last, run) => Array.from({ length: run }, (_, i) => back(now, last + i));
export const STATES = [
  ['new · 10 AM', at(10), { streak: 0, last: null }],
  ['morning, not yet', at(8, 10), { streak: 12, last: 1 }],
  ['afternoon, not yet', at(14, 30), { streak: 12, last: 1 }],
  ['evening, not yet', at(19, 40), { streak: 12, last: 1 }],
  ['night, streak at risk', at(22, 40), { streak: 12, last: 1 }],
  ['after midnight', at(1, 30), { streak: 12, last: 1 }],
  ['lesson done', at(18, 5), { streak: 13, last: 0 }],
  ['rest day holding', at(12, 0), { streak: 20, last: 2, rest: 1 }],
  ['missed yesterday', at(9, 0), { streak: 0, last: 2, run: 6 }],
  ['gone 4 days', at(16, 0), { streak: 0, last: 4, run: 6 }],
];
export function moodFor([, now, s]) {
  const run = s.run ?? s.streak;
  const activeDays = s.last == null ? [] : ran(now, s.last, Math.max(1, run));
  const restDays = s.rest ? [back(now, 1)] : [];
  return W.mood.widgetMood({ now, streak: s.streak, lastLessonDate: s.last == null ? null : back(now, s.last), restHeld: s.rest ?? 0, activeDays, restDays }, W.facts);
}

const font = (p) => `url(data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'node_modules/@expo-google-fonts/inter', p)).toString('base64')}) format('truetype')`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const icon = (n, color, size, mr = 0) => `<svg viewBox="${ICON_VIEWBOX}" width="${size}" height="${size}" style="flex:none;margin-right:${mr}px"><path fill="${color}" d="${ICONS[n]}"/></svg>`;
const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function dayLook(d) {
  switch (d) {
    case 'done': return { bg: C.ember, fg: '#FFFFFF', ring: false };
    case 'todayDone': return { bg: C.ember, fg: '#FFFFFF', ring: true };
    case 'rest': return { bg: C.rest, fg: C.bg, ring: false };
    case 'today': return { bg: null, fg: C.on, ring: true };
    case 'missed': return { bg: mix(C.pill, C.on, 0.14), fg: C.soft, ring: false };
    default: return { bg: null, fg: C.faint, ring: false };
  }
}
const week = (wk, disc, letters = true) => `<div class="row" style="justify-content:space-between;width:100%">${wk.map((d, i) => {
  const L = dayLook(d);
  const bg = L.bg ?? (letters ? null : C.faint);
  return `<div style="width:${disc}px;height:${disc}px;border-radius:${disc / 2}px;${bg ? `background:${bg};` : ''}${L.ring ? `border:2px solid ${C.on};` : ''}display:flex;align-items:center;justify-content:center;font-size:${Math.round(disc * 0.48)}px;font-weight:800;color:${L.fg}">${letters ? DAY[i] : ''}</div>`;
}).join('')}</div>`;

/** One widget, w × h dp, as HTML — the mirror of StudyWidget.tsx. */
export function widgetHtml(m, w, h) {
  const subj = W.subjects.find((s) => s.slug === m.subject);
  const L = layoutWidget(w, h, m.streak, m.line, m.fact);
  const sc = STATUS_COLOR[m.statusTone], si = STATUS_ICON[m.statusTone];
  const flame = m.streak > 0 ? C.ember : C.out;
  if (L.mode === 'strip') {
    return `<div class="w row" style="width:${w}px;height:${h}px;background:${C.bg};border-radius:${RADIUS}px;padding:0 ${PAD}px">
      ${icon('flame', flame, 22, 2)}<div style="font-size:30px;font-weight:600;color:${C.on};margin-right:14px">${m.streak}</div>
      <div class="col" style="flex:1;min-width:0"><div class="one" style="font-size:14px;font-weight:700;color:${sc}">${esc(m.status)}</div>${L.line ? `<div class="one" style="font-size:${T.line.size}px;color:${C.soft};margin-top:2px">${esc(m.line)}</div>` : ''}</div></div>`;
  }
  if (L.mode === 'glance') {
    return `<div class="w col" style="width:${w}px;height:${h}px;background:${C.bg};border-radius:${Math.round(Math.min(w, h) * 0.32)}px;padding:${PAD}px;align-items:center;justify-content:center">
      <div class="row">${icon('flame', flame, 30, 4)}<div style="font-size:${T.glanceHero.size}px;line-height:${T.glanceHero.lh}px;font-weight:600;color:${C.on}">${m.streak}</div></div>
      <div style="font-size:12px;font-weight:600;color:${C.soft};margin-top:2px">day streak</div>
      <div class="one" style="font-size:12.5px;font-weight:700;color:${sc};margin-top:6px">${esc(m.status)}</div>
      ${L.week ? `<div style="width:100%;margin-top:10px;padding:0 6px">${week(m.week, 11, false)}</div>` : ''}</div>`;
  }
  return `<div class="w col" style="width:${w}px;height:${h}px;background:${C.bg};border-radius:${RADIUS}px;padding:${PAD}px">
    <div class="row" style="align-items:flex-start">
      <div class="col" style="width:${Math.floor(L.leftW)}px">
        <div class="row">${icon(si, sc, 18, 6)}<div class="one" style="font-size:${T.status.size}px;line-height:${T.status.lh}px;font-weight:700;color:${sc}">${esc(m.status)}</div></div>
        ${L.lineLines ? `<div class="clamp" style="font-size:${T.line.size}px;line-height:${T.line.lh}px;color:${C.soft};margin-top:3px;-webkit-line-clamp:${L.lineLines}">${esc(m.line)}</div>` : ''}
      </div>
      <div class="row" style="flex:1;justify-content:flex-end">${icon('flame', flame, T.heroFlame, 2)}<div style="font-size:${T.hero.size}px;line-height:${T.hero.lh}px;font-weight:600;color:${C.on}">${m.streak}</div></div>
    </div>
    <div style="flex:1"></div>
    <div style="background:${C.pill};border-radius:18px;padding:${WEEK.padY}px ${WEEK.padX}px">${week(m.week, WEEK.disc)}</div>
    ${L.factLines ? `<div class="row" style="margin-top:${GAP}px;background:${C.pill};border-radius:16px;padding:${FACT.padY}px ${FACT.padX}px">${icon(m.subject, markFor(subj.hue), FACT.icon, FACT.gap)}<div class="clamp" style="width:${Math.floor(L.factW)}px;font-size:${T.fact.size}px;line-height:${T.fact.lh}px;color:${C.on};-webkit-line-clamp:${L.factLines}">${esc(m.fact)}</div></div>` : ''}
  </div>`;
}

export const CSS = `@font-face{font-family:I;font-weight:400;src:${font('400Regular/Inter_400Regular.ttf')}}@font-face{font-family:I;font-weight:600;src:${font('600SemiBold/Inter_600SemiBold.ttf')}}@font-face{font-family:I;font-weight:700;src:${font('700Bold/Inter_700Bold.ttf')}}@font-face{font-family:I;font-weight:800;src:${font('800ExtraBold/Inter_800ExtraBold.ttf')}}
*{box-sizing:border-box}body{margin:0;font-family:I}
.row{display:flex;flex-direction:row;align-items:center}.col{display:flex;flex-direction:column}
.w{overflow:hidden}.one{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clamp{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}`;

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
export function shoot(html, out, w, h, scale = 1) {
  const file = path.join(TMP, `page-${path.basename(out)}.html`);
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${CSS}</style>${html}`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    `--window-size=${w},${h}`, `--screenshot=${out}`, '--default-background-color=00000000', pathToFileURL(file).href], { stdio: 'ignore' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const W4 = 330, H4 = 190;
  if (OFFER || PREVIEW) {
    const dir = path.join(ROOT, 'assets/images/widget-offer');
    fs.mkdirSync(dir, { recursive: true });
    const pick = { morning: STATES[1], night: STATES[4], done: STATES[6] };
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
    const SIZES = [[330, 190, '330×190 (4×2 typical)'], [320, 150, '320×150 (4×2 short)'], [172, 172, '2×2'], [320, 100, '4×1']];
    let html = `<div style="background:linear-gradient(160deg,#7E9A9C,#3E4E58);color:#eef3f4;padding:20px;width:1260px;font-family:I">`;
    for (const st of STATES) {
      const m = moodFor(st);
      html += `<div style="font-weight:800;font-size:13px;margin:16px 0 6px">${esc(st[0])} — ${m.state} · ${m.tod} · ${m.subject}</div><div class="row" style="gap:14px;align-items:flex-start">`;
      for (const [w, h, lab] of SIZES) html += `<div><div style="font-size:11px;opacity:.8;margin-bottom:4px">${lab}</div>${widgetHtml(m, w, h)}</div>`;
      html += '</div>';
    }
    html += '</div>';
    const out = args.find((a) => !a.startsWith('--')) ?? path.join(ROOT, 'widget-states.png');
    shoot(html, out, 1300, 60 + STATES.length * 236, 1);
    console.log(`wrote ${out}`);
  }
}
