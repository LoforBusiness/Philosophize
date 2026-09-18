// ONE STAGE, PHOTOGRAPHED — for looking at the skin (group AG).
//
//   node scripts/shot-skin.mjs <lesson-id> [beat] [tag]
//
// Shoots the stage only (the deck and the header cropped away), at 3× so a corner
// radius and a 3-unit ledge are actually visible. Run it before the codemod and
// after it with a different tag, and the two files are a before and after of the
// same picture.
//
// Metro on 8871, Chrome on 9401, route `previewwander`.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9401);
const WEB = +(process.env.WEB_PORT || 8871);
const ROUTE = process.env.WANDER_ROUTE || 'previewwander';
const LESSON = process.argv[2] || 'political-political-7';
const BEAT = +(process.argv[3] || 0);
const TAG = process.argv[4] || 'shot';
const OUT = path.join(REPO, 'scripts', '.lesson-shots');

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
// 3× so the depth is legible: §19 records three separate marks being "fixed"
// against a downscaled screenshot, and a 3-unit ledge is one pixel at 1×.
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
};
const TAP = `(() => {
  const w = innerWidth, h = innerHeight;
  const el = document.elementFromPoint(w / 2, h * 0.30);
  if (!el) return false;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: w / 2, clientY: h * 0.30 }));
  return true;
})()`;
const CLIP = `(() => {
  const c = document.getElementById('stage-clip');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
})()`;

await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${LESSON}&notour=1&nowander=1` });
let ready = false;
for (let i = 0; i < 120; i += 1) {
  const c = await ev("document.querySelectorAll('div').length");
  if (typeof c === 'number' && c > 60) { ready = true; break; }
  await wait(1000);
}
if (!ready) { console.log(`${LESSON} — NEVER RENDERED A STAGE`); process.exit(1); }
await wait(2600);
for (let i = 0; i < BEAT; i += 1) { await ev(TAP); await wait(1500); }
await wait(1200);

const clip = await ev(CLIP);
if (!clip) { console.log('no #stage-clip on the page'); process.exit(1); }
const shot = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 3 },
});
if (!shot?.data) { console.log('no screenshot came back'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `skin-${TAG}-${LESSON}-${BEAT}.png`);
fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
console.log(`${file}`);
await send('Page.close');
process.exit(0);
