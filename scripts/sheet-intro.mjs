// THE FIRST SCREEN, AS A SEQUENCE.
//
//   npx expo start --web --port 8875 --clear
//   node scripts/sheet-intro.mjs                 # the whole intro, 18 frames
//   node scripts/sheet-intro.mjs 3,6,9,12        # only these intro-times
//   INTRO_W=320 node scripts/sheet-intro.mjs     # the narrow phone
//
// Chrome is started for you on 9405 if it is not already there.
//
// ── WHY THIS EXISTS, WHEN check-intro ALREADY LOADS THIS SCREEN ─────────────
//
// `check-intro` measures one frame at a time and asks countable questions of it:
// does a line break into three rows, is a lit word clipped, do two names on a
// board touch. Every one of those is a property of a SINGLE frame, and it answers
// them well.
//
// "Is it entertaining", "is it smooth" and "does it look like the rest of the
// app" are not properties of any frame. They are properties of the SEQUENCE, and
// nothing in this repo could look at forty-one seconds of it at once — which is
// why a screen drawn in the palette the app threw out in September, with its top
// half empty on every board beat, went unnoticed while three checkers stayed
// green. This is `sheet:beats` for the intro: one page load, a frame at each
// interesting moment, stitched into a grid a person can read.
//
// ── THE ANCHOR IS THE FIRST SPOKEN WORD, NOT THE PAGE LOAD ──────────────────
//
// The intro's clock starts when it mounts, and on a dev server the launch drawing
// plus the bundle evaluation put that anywhere from four to twenty seconds after
// the navigation. A stopwatch started at the navigation therefore mislabels every
// frame — the first draft of this tool reported the six-branch board at "t=36s"
// on a script whose map beats run 12.7 to 23, and the strip read as a screen that
// had lost its own timeline.
//
// So the run waits for the first word to appear in the bubble and calls that
// moment SPEAK_T0, which is what the script itself calls it. Every label after
// that is the intro's own time, and it is honest at any load speed.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { claimRoute } from './lib/previewroute.mjs';
import { SPEAK_T0, T_BEGIN } from './lib/introtime.mjs';

const WEB = Number(process.env.INTRO_WEB || 8875);
const CDP = Number(process.env.INTRO_CDP || 9405);
const ROUTE = process.env.SHEET_ROUTE || 'previewsheetintro';
const DEVICE_W = Number(process.env.INTRO_W || 390);
const DEVICE_H = Number(process.env.INTRO_H || 844);
const OUT = process.env.INTRO_OUT || 'scratchpad/sheet-intro.png';

// Eighteen moments, chosen to land one INSIDE each beat rather than on its seam:
// the walk-on, each spoken line while it stands complete, each board while it is
// fully drawn, the exit, and the end card. A frame on a seam photographs a
// cross-fade and tells you nothing about either side of it.
const DEFAULT_AT = [0.8, 2.6, 4.4, 7.6, 10.6, 14.0, 17.2, 20.6, 24.4, 27.6, 30.8, 33.0, 36.2, 38.4, 40.0, 41.6, T_BEGIN + 0.9, T_BEGIN + 2.6];
const AT = (process.argv[2] ? process.argv[2].split(',').map(Number) : DEFAULT_AT)
  .filter((n) => Number.isFinite(n)).sort((a, b) => a - b);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port, path: p }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(d));
  }).on('error', rej);
});
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});

const SRC = `// Written by scripts/sheet-intro.mjs. Deleted on the way out.
import WelcomeAnimation from '@/components/welcome/WelcomeAnimation';

export default function PreviewSheetIntro() {
  return <WelcomeAnimation start />;
}
`;

const { release } = claimRoute({
  route: `app/${ROUTE}.tsx`,
  src: SRC,
  owner: 'sheet-intro',
  keep: process.env.SHEET_KEEP === '1',
});

let ws;
try {
  let up = false;
  for (let i = 0; i < 240; i++) { try { await get(WEB, '/'); up = true; break; } catch { await sleep(1000); } }
  if (!up) { console.error(`no Metro on ${WEB} — see the header.`); process.exit(1); }
  try { await get(WEB, '/index.bundle?platform=web&dev=true'); } catch { /* warm enough */ }

  let alive = false;
  try { JSON.parse(await get(CDP, '/json/version')); alive = true; } catch { /* start one */ }
  if (!alive) {
    const CH = [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].find((p) => fs.existsSync(p));
    if (!CH) { console.error('no Chrome found'); process.exit(1); }
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'sheet-intro-chrome-'));
    spawn(CH, ['--headless=new', `--remote-debugging-port=${CDP}`, `--user-data-dir=${prof}`,
      '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
    for (let i = 0; i < 80; i++) {
      try { JSON.parse(await get(CDP, '/json/version')); break; } catch { await sleep(400); }
    }
  }

  const WS = (await import(pathToFileURL(path.join(process.cwd(), 'node_modules/ws/index.js')).href)).default;
  const tab = await put('/json/new?about:blank');
  ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
  let mid = 0; const pend = new Map();
  ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); } });
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', {
    width: DEVICE_W, height: DEVICE_H, deviceScaleFactor: 2, mobile: true,
  });
  const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true }))?.result?.value;

  // Every leaf that carries a visible word, with its box. `opacity` is walked up
  // the tree because a parent fading out takes its children with it, and a word
  // inside a group at 0.04 is not on screen however opaque its own style is.
  const WORDS = `(() => {
    const vis = (e) => { let o = 1, n = e;
      while (n && n.nodeType === 1) { const c = getComputedStyle(n);
        if (c.display === 'none' || c.visibility === 'hidden') return 0;
        o *= parseFloat(c.opacity); if (o < 0.001) return 0; n = n.parentElement; }
      return o; };
    const out = [];
    for (const e of document.querySelectorAll('*')) {
      if (e.children.length) continue;
      const t = (e.textContent || '').trim(); if (!t) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const o = vis(e); if (o < 0.08) continue;
      out.push({ t, o: +o.toFixed(2), x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
    }
    return out; })()`;

  console.log(`THE FIRST SCREEN, FRAME BY FRAME  ·  ${DEVICE_W}x${DEVICE_H}\n`);
  await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}` });

  // ── THE ANCHOR, IN TWO STAGES, AND THE FIRST DRAFT ONLY HAD THE SECOND ────
  //
  // On a dev server the LAUNCH drawing plays over this route first (the root
  // layout mounts it), and it ends by writing the wordmark on a letter at a time
  // — "AS", "ASH", "ASHMERE". Those are word boxes in the middle of the screen
  // with no percent sign on them, so a rule that waits for "any word that is not
  // Skip and not a percentage" fires on the loader and every label in the strip
  // comes out early. The first run of this tool duly spent three of its eighteen
  // frames photographing the launch screen.
  //
  // `Skip` exists only on the intro, so it is the honest gate: wait for the intro
  // to be on the glass AT ALL, and only then for the first word it speaks.
  let t0 = 0;
  let sawSkip = false;
  for (let i = 0; i < 600; i++) {
    const w = (await ev(WORDS)) ?? [];
    if (!sawSkip) sawSkip = w.some((b) => b.t === 'Skip');
    if (sawSkip && w.some((b) => b.y > DEVICE_H * 0.2 && b.y < DEVICE_H * 0.92 && b.t !== 'Skip')) {
      t0 = Date.now() - SPEAK_T0 * 1000; break;
    }
    await sleep(200);
  }
  if (!t0) {
    console.error(sawSkip ? 'the intro mounted but never spoke' : 'the intro never appeared — is the route rendering?');
    process.exit(1);
  }

  const shots = [];
  let clashes = 0;
  for (const at of AT) {
    const due = t0 + at * 1000;
    while (Date.now() < due) await sleep(Math.min(100, due - Date.now()));
    const img = await send('Page.captureScreenshot', { format: 'png' });
    const words = (await ev(WORDS)) ?? [];
    // Two VISIBLE words sharing pixels. 2 units of slack, because a glyph box is
    // the em box and two lines of one paragraph at a tight leading graze without
    // a reader ever seeing them touch.
    // AN SVG TEXT'S RECT IS ITS EM BOX, AND THAT IS THE WHOLE OF WHY THIS RULE
    // IS NOT "DO THE BOXES TOUCH".
    //
    // §19 records `check-intro` learning this on the growth board: its kicker and
    // its headline reported "103px through one another" while sitting a
    // comfortable 19px apart, because an em box carries the face's whole ascent
    // and descent and an all-caps label uses almost none of the descent. The
    // first run of THIS tool duly re-found the same pair, plus every thinker's
    // name against its own dates — a confident list of defects that are not on
    // the screen, which is the failure mode CLAUDE.md keeps recording.
    //
    // So a pair is only a collision when they share a real share of the smaller
    // box's HEIGHT. Two lines of one label grazing by two or three units of em
    // box is typography; half a line through another line is a defect.
    const bad = [];
    for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) {
      const a = words[i], b = words[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 0.45 * Math.min(a.h, b.h)) bad.push(`"${a.t}" x "${b.t}"`);
    }
    clashes += bad.length;
    // The faintest word on screen, which is the smear rule's own measurement: a
    // line caught at 0.2 is not a line the reader is reading.
    const faint = words.filter((w) => w.o < 0.55).sort((a, b) => a.o - b.o)[0];
    console.log(`  t=${String(at).padStart(5)}s  ${String(words.length).padStart(2)} word(s)`
      + `${faint ? `  faintest ${faint.o} "${faint.t.slice(0, 22)}"` : ''}`
      + `${bad.length ? `  OVERLAP: ${bad.slice(0, 2).join(', ')}${bad.length > 2 ? ` +${bad.length - 2}` : ''}` : ''}`);
    if (img?.data) shots.push({ at, buf: Buffer.from(img.data, 'base64') });
  }

  // Stitch. jimp-compact rides in with @expo/image-utils, so this costs no
  // dependency — the same one §21 names for offline image work.
  const { default: Jimp } = await import('jimp-compact');
  const tiles = await Promise.all(shots.map((s) => Jimp.read(s.buf)));
  const TW = 260;
  const scaled = tiles.map((t) => t.clone().resize(TW, Jimp.AUTO));
  const TH = scaled[0]?.bitmap.height ?? 1;
  const COLS = Math.min(6, scaled.length);
  const ROWS = Math.ceil(scaled.length / COLS);
  const LABEL = 22;
  // NO TEXT LABELS ON THE SHEET. jimp-compact does not ship the bitmap fonts
  // `Jimp.loadFont` wants, so the obvious `print` throws ENOENT on a .fnt that
  // was never there — and a label is not worth a font dependency. The band above
  // each frame is a RULER instead: it fills in proportion to how far through the
  // intro that frame sits, so the strip reads left to right as time without a
  // glyph, and the exact seconds are in the console and the sidecar.
  const sheet = new Jimp(COLS * TW, ROWS * (TH + LABEL), 0xffffffff);
  const span = AT[AT.length - 1] || 1;
  scaled.forEach((t, i) => {
    const cx = (i % COLS) * TW;
    const cy = Math.floor(i / COLS) * (TH + LABEL);
    sheet.composite(t, cx, cy + LABEL);
    const fill = Math.max(2, Math.round((shots[i].at / span) * (TW - 8)));
    for (let x = 0; x < fill; x++) for (let y = 6; y < 14; y++) {
      sheet.setPixelColor(0xff1a1a1aff >>> 0, cx + 4 + x, cy + y);
    }
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await sheet.writeAsync(OUT);
  fs.writeFileSync(OUT.replace(/\.png$/, '.json'),
    JSON.stringify({ width: DEVICE_W, height: DEVICE_H, cols: COLS, at: shots.map((s) => s.at) }, null, 1));
  console.log(`\n${shots.length} frames · ${clashes} overlapping word pair(s) across the run`);
  console.log(`   reading order, left to right: ${shots.map((s) => `${s.at}s`).join(' ')}`);
  console.log(`-> ${OUT}`);
} finally {
  try { ws?.close(); } catch { /* going anyway */ }
  release();
}
