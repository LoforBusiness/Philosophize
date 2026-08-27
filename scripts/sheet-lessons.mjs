// A CONTACT SHEET OF MANY LESSONS AT ONCE.
//
//   npx expo start --web --port 8867 --clear
//   chrome --headless=new --remote-debugging-port=9397 --user-data-dir=<tmp>
//   node scripts/sheet-lessons.mjs aesthetics11 aesthetics15 …
//   SHEET_FROM=shade node scripts/sheet-lessons.mjs        # the flattest, in order
//
// ── WHY A SHEET AND NOT ONE LESSON AT A TIME ────────────────────────────────
//
// The tonal pass has to be judged by LOOKING — the note left by the first
// attempt is explicit that picking by size fails, and that an automatic pass
// toned answer cards and a panel that spends the lesson hidden behind a shutter.
// But looking at 111 scenes one screenshot at a time is not a loop anybody
// finishes.
//
// So this renders many, crops each to its own stage, and stitches them into one
// grid. Twelve scenes to a sheet is about what a person can actually compare,
// and comparison is the point: a scene that is flat looks fine on its own and
// obviously empty beside one that is not.
//
// It renders the REAL screen (§21: a contact sheet that never imports the
// component cannot catch a module or render fault), advances with a synthetic
// `click` because a CDP mouse event does nothing to a React Native Web
// Pressable, and waits for the stage rather than sleeping at it.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9397);
const WEB = +(process.env.WEB_PORT || 8867);
const ROUTE = process.env.SHEET_ROUTE || 'previewsheet';
const BEAT = +(process.env.SHEET_BEAT || 2);
const COLS = +(process.env.SHEET_COLS || 4);
const TAG = process.env.SHEET_TAG || 'sheet';
const OUT = path.join(REPO, 'scripts/.lesson-shots');

const JimpPkg = (await import(pathToFileURL(path.join(REPO, 'node_modules/jimp-compact/dist/jimp.js')).href)).default;
const Jimp = JimpPkg.default || JimpPkg;

// ── which lessons ───────────────────────────────────────────────────────────
const CIN = path.join(REPO, 'components', 'lesson', 'cinematic');
const idMap = new Map(
  [...fs.readFileSync(path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8')
    .matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+)Lesson,/gm)].map((m) => [m[2].replace(/^[A-Z]/, (c) => c.toLowerCase()), m[1]]),
);

let names = process.argv.slice(2);
if (!names.length) {
  console.log('name at least one scene, or set SHEET_FROM=shade');
  process.exit(1);
}
const jobs = names.map((n) => ({ name: n, id: idMap.get(n) })).filter((j) => {
  if (!j.id) console.log(`  (no lesson id for ${j.name} — skipped)`);
  return !!j.id;
});

// ── the browser ─────────────────────────────────────────────────────────────
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;

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

// The stage's own box, so each cell is the ART rather than a phone screenshot
// with two thirds of it blank paper.
const STAGE_BOX = `(() => {
  // THE STAGE IS FOUND BY ITS SCENE, NOT BY ITS SIZE.
  //
  // The first version took the largest overflow:hidden box in the top 60% and
  // cropped to that — and it returned the TEXT DECK on every lesson, so a sheet
  // of eight scenes came back as eight paragraphs of narration. Every cinematic
  // scene's root View carries \`transformOrigin: '0% 0%'\` (that is what the
  // camera scales about), so the scene is findable exactly, and the stage is the
  // clipping parent it sits in.
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
const shots = [];
for (const [n, job] of jobs.entries()) {
  await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${job.id}&notour=1` });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    const c = await ev("document.querySelectorAll('div').length");
    if (c > 60) { ready = true; break; }
    await wait(700);
  }
  if (!ready) { console.log(`  ${job.name}  — NEVER RENDERED A STAGE`); continue; }
  await wait(1800);
  for (let b = 0; b < BEAT; b++) { await ev(TAP); await wait(900); }
  await wait(1600);

  const box = await ev(STAGE_BOX);
  const png = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(png.data, 'base64');
  const img = await Jimp.read(buf);
  if (box) {
    // deviceScaleFactor 2 — the screenshot is twice the CSS box.
    img.crop(Math.round(box.x * 2), Math.round(box.y * 2), Math.round(box.width * 2), Math.round(box.height * 2));
  }
  shots.push({ name: job.name, img });
  console.log(`  ${String(n + 1).padStart(3)}/${jobs.length}  ${job.name}`);
}

if (!shots.length) { console.log('nothing rendered'); process.exit(1); }

// ── stitch ──────────────────────────────────────────────────────────────────
const CW = 380, CH = 300, PADT = 22;
const rows = Math.ceil(shots.length / COLS);
const sheet = new Jimp(CW * COLS, (CH + PADT) * rows, 0xf2f0ebff);
for (const [i, s] of shots.entries()) {
  const cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * (CH + PADT);
  s.img.scaleToFit(CW - 12, CH - 12);
  sheet.composite(s.img, cx + 6, cy + PADT + 6);
  // a hairline so the cells read as separate pictures
  for (let x = 0; x < CW; x++) sheet.setPixelColor(0xd8d5ccff, cx + x, cy + PADT);
}
const out = path.join(OUT, `${TAG}.png`);
await sheet.writeAsync(out);
console.log(`\n  ${out}   (${shots.length} scenes, ${COLS} across)`);
console.log(`  order: ${shots.map((s) => s.name).join(' · ')}\n`);

await fetch(`http://127.0.0.1:${CDP}/json/close/${tab.id}`).catch(() => {});
ws.close();
process.exit(0);
