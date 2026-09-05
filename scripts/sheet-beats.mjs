// EVERY BEAT OF ONE LESSON, STITCHED INTO A STRIP.
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/sheet-beats.mjs epistemology-knowledge-23
//
// `sheet-lessons` renders MANY lessons at ONE beat, which is the right shape for
// comparing scenes against each other. This is the other axis: ONE lesson at
// EVERY beat, which is what you need to judge whether a scene actually changes
// as the reader taps — the complaint "the animations aren't very smooth … it's
// kinda difficult to understand what's really going on" is about the sequence,
// and a single frame cannot show it.
//
// BEAT_TOUR=1 lets the camera run; by default it is off, because a tour crops the
// stage differently on every beat and the question here is what the ART does.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE = process.env.BEAT_ROUTE || 'previewsheet23';
const COLS = +(process.env.BEAT_COLS || 3);
const TOUR = process.env.BEAT_TOUR ? '' : '&notour=1';
const OUT = path.join(REPO, 'scripts', '.lesson-shots');
const TAG = process.env.BEAT_TAG || 'beats';

const ids = process.argv.slice(2);
if (!ids.length) { console.log('usage: node scripts/sheet-beats.mjs <lesson-id> [beats]'); process.exit(1); }
const LESSON = ids[0];
const NBEATS = +(ids[1] || process.env.BEAT_N || 9);

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;
const { default: Jimp } = await import(pathToFileURL(path.join(REPO, 'node_modules/jimp-compact/dist/jimp.js')).href);

const tab = await put('/json/new?about:blank');
const ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let mid = 0; const pend = new Map();
ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); } });
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await new Promise((r) => ws.on('open', r));
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r?.exceptionDetails) return null;
  return r?.result?.value;
};

const TAP = `(() => {
  const w = innerWidth, h = innerHeight;
  const el = document.elementFromPoint(w / 2, h * 0.30);
  if (!el) return false;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: w / 2, clientY: h * 0.30 }));
  return true;
})()`;

// The stage's clipping box — the same anchor sheet-lessons uses: every cinematic
// scene root carries transformOrigin 0 0, and the stage is the clipping parent.
const STAGE_BOX = `(() => {
  const scene = [...document.querySelectorAll('div')].find((e) => {
    const s = getComputedStyle(e);
    return s.transformOrigin === '0px 0px' && e.getBoundingClientRect().width > 100;
  });
  if (!scene) return null;
  let n = scene.parentElement;
  while (n && n !== document.body) {
    const s = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    if (s.overflow === 'hidden' && r.height > 90) return { x: r.x, y: r.y, width: r.width, height: r.height };
    n = n.parentElement;
  }
  const r = scene.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
})()`;

fs.mkdirSync(OUT, { recursive: true });
await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${LESSON}${TOUR}` });
let ready = false;
for (let i = 0; i < 90; i++) {
  const c = await ev("document.querySelectorAll('div').length");
  if (c > 60) { ready = true; break; }
  await wait(700);
}
if (!ready) { console.log(`${LESSON} — NEVER RENDERED A STAGE`); process.exit(1); }
await wait(2000);

// A SCENE TARGET IS NOT A CONTROL, AND ANSWER_CONTROL ONLY KNOWS CONTROLS.
// The same rule §21 states for every harness: a beat this cannot answer parks the
// run, and every beat after it is recorded as a copy of the one it stuck on —
// which is exactly how a first pass at this script reported six identical frames
// as six beats.
// SCOPED TO THE STAGE AND THE DECK, WHICH COST A WHOLE RUN TO LEARN. Taking the
// first [role=button] in the DOCUMENT takes the header's BACK ARROW — so the run
// leaves the lesson, lands on the branch screen, and photographs six frames of
// some other lesson while reporting nine clean beats. The stage carries
// nativeID="stage-clip"; nothing above it is ever an answer.
const ANSWER_TARGET = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return '';
  const c = clip.getBoundingClientRect();
  const els = [...document.querySelectorAll('[role="button"],[tabindex]')]
    .filter((e) => e.getAttribute('data-testid') !== 'thinker-name')
    .filter((e) => e.getAttribute('aria-disabled') !== 'true')
    .filter((e) => {
      const r = e.getBoundingClientRect();
      // On the stage, or in the deck immediately under it — never above it.
      return r.width > 24 && r.height > 10 && r.top >= c.top - 2 && r.top < c.bottom + 240;
    });
  if (!els.length) return '';
  els[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
  return 'target';
})()`;

/** What the reader is being shown — used only to tell a moved beat from a stuck one. */
const SIG = `(() => {
  const t = [...document.querySelectorAll('div,span')].map((e) => (e.children.length ? '' : e.textContent || '')).join('|');
  return t.length + ':' + t.slice(0, 400);
})()`;

// WAIT FOR THE CAMERA, NOT FOR A CLOCK.
//
// A fixed wait photographs whatever the camera happens to be doing. Half of this
// lesson's frames came back as a figure filling the screen with the machine
// nowhere — which reads exactly like a scene that has lost its subject, and was a
// tour station caught mid-travel at its 1.72× ceiling, three seconds in and still
// panning. Every one of those was a correct, checked, authored camera move.
//
// So settle on the camera's own rect: the innermost transform-origin layer, which
// is the one the camera moves. Budgeted, because a station that FOLLOWS a moving
// subject never fully stops.
const CAM_RECT = `(() => {
  const all = [...document.querySelectorAll('div')]
    .filter((e) => getComputedStyle(e).transformOrigin === '0px 0px' && e.getBoundingClientRect().width > 100);
  if (!all.length) return '';
  const r = all[all.length - 1].getBoundingClientRect();
  return Math.round(r.x) + '/' + Math.round(r.width);
})()`;

const settle = async () => {
  let last = null;
  for (let i = 0; i < 14; i++) {
    const now = await ev(CAM_RECT);
    if (now && now === last) return;
    last = now;
    await wait(450);
  }
};

const shots = [];
let sig = await ev(SIG);
for (let b = 0; b < NBEATS; b++) {
  await wait(700);
  await settle();
  const box = await ev(STAGE_BOX);
  const png = await send('Page.captureScreenshot', { format: 'png' });
  const img = await Jimp.read(Buffer.from(png.data, 'base64'));
  if (box) img.crop(Math.round(box.x * 2), Math.round(box.y * 2), Math.round(box.width * 2), Math.round(box.height * 2));
  img.scale(0.5);
  shots.push({ b, img });

  await ev(TAP);
  await wait(1000);
  let now = await ev(SIG);
  let how = '';
  if (now === sig) {                    // the beat is gated on an answer
    how = (await ev(ANSWER_CONTROL)) || (await ev(ANSWER_TARGET)) || '';
    await wait(1100);
    await ev(TAP);
    await wait(1000);
    now = await ev(SIG);
  }
  process.stdout.write(`  beat ${b}${how ? `  (answered via ${how})` : ''}${now === sig ? '  STUCK' : ''}\n`);
  sig = now;
}

const cw = Math.max(...shots.map((s) => s.img.bitmap.width));
const ch = Math.max(...shots.map((s) => s.img.bitmap.height));
const rows = Math.ceil(shots.length / COLS);
const sheet = new Jimp(cw * COLS + (COLS + 1) * 8, (ch + 16) * rows + 8, 0xefeee9ff);
for (const [k, s] of shots.entries()) {
  const cx = 8 + (k % COLS) * (cw + 8);
  const cy = 8 + Math.floor(k / COLS) * (ch + 16);
  sheet.composite(s.img, cx, cy);
}
const file = path.join(OUT, `${TAG}.png`);
await sheet.writeAsync(file);
console.log(`\n  ${file}   (${shots.length} beats, ${COLS} across)`);
process.exit(0);
