// DOES HE ACTUALLY MOVE, IN THE REAL APP? (group AF)
//
//   node scripts/shot-wander.mjs <lesson-id> [beat]
//
// `check:wander` replays the layer through the rig in plain Node, which proves the
// maths. It cannot prove the WIRING: the plan reaches the figure through a
// module-level shared value that no scene mentions by name, and §17 records
// exactly what that costs — 51 scenes whose reaction flag could never fire while
// every source-level question about them answered yes, and `check:nod`, which had
// to be written because a grep finds nothing in a working scene and nothing in a
// broken one.
//
// So this loads the lesson for real, records the figure's own box every frame, and
// writes a strip of what it saw. Metro on 8871 and Chrome on 9401:
//
//   npx expo start --web --port 8871 --clear
//   chrome --headless=new --remote-debugging-port=9401 --no-first-run about:blank
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9401);
const WEB = +(process.env.WEB_PORT || 8871);
const ROUTE = process.env.WANDER_ROUTE || 'previewwander';
const LESSON = process.argv[2] || 'logic-arguments-25';
const BEAT = +(process.argv[3] || 0);
const OUT = path.join(REPO, 'scripts', '.lesson-shots');

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
  if (r?.exceptionDetails) return { err: JSON.stringify(r.exceptionDetails).slice(0, 300) };
  return r?.result?.value;
};

const TAP = `(() => {
  const w = innerWidth, h = innerHeight;
  const el = document.elementFromPoint(w / 2, h * 0.30);
  if (!el) return false;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: w / 2, clientY: h * 0.30 }));
  return true;
})()`;

// HIS ANKLES AND HIS HEAD, NOT HIS ROOT — and the first draft of this file measured
// the root and reported a figure that never moved by a single pixel. `Stickman`'s own
// comment says why: "the root itself is a zero-size absolute box, so the figure's
// real extent is the union of this element's descendants". A box that is zero by
// construction cannot report a walk, and a probe that believes it says the wiring is
// dead when it is fine — §21's own failure mode, in a new instrument.
const SAMPLER = `(() => {
  window.__w = { rows: [], t0: performance.now() };
  const pick = (sel) => {
    const e = document.querySelector('[data-testid="' + sel + '"]');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  };
  const step = () => {
    requestAnimationFrame(step);
    const a = pick('ankle-l');
    const b = pick('fist-l');
    if (!a || !b) return;
    window.__w.rows.push([+(performance.now() - window.__w.t0).toFixed(1),
      +a[0].toFixed(2), +a[1].toFixed(2), +b[0].toFixed(2), +b[1].toFixed(2)]);
  };
  requestAnimationFrame(step);
  return true;
})()`;

await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${LESSON}&notour=1` });
let ready = false;
for (let i = 0; i < 120; i += 1) {
  const c = await ev("document.querySelectorAll('div').length");
  if (typeof c === 'number' && c > 60) { ready = true; break; }
  await wait(1000);
}
if (!ready) { console.log(`${LESSON} — NEVER RENDERED A STAGE`); process.exit(1); }
await wait(2500);
for (let i = 0; i < BEAT; i += 1) { await ev(TAP); await wait(1400); }
await wait(400);

await ev(SAMPLER);
fs.mkdirSync(OUT, { recursive: true });
const shots = [];
const SPAN = +(process.env.WANDER_SPAN || 6200);
const N = 8;
for (let i = 0; i < N; i += 1) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  if (r?.data) shots.push(Buffer.from(r.data, 'base64'));
  await wait(SPAN / N);
}
const rows = await ev('window.__w ? window.__w.rows : null');
if (!rows || !rows.length) { console.log('the figure was never found on the page'); process.exit(1); }

const xs = rows.map((r) => r[1]);                   // his left ankle, across the stage
const ys = rows.map((r) => r[2]);                   // and how high it is
const hs = rows.map((r) => r[4]);                   // his left fist's height
const span = (a) => Math.max(...a) - Math.min(...a);
let jump = 0;
for (let i = 1; i < rows.length; i += 1) jump = Math.max(jump, Math.abs(xs[i] - xs[i - 1]));
console.log(`${LESSON} beat ${BEAT} · ${rows.length} frames over ${(rows[rows.length - 1][0] / 1000).toFixed(1)}s`);
console.log(`  his ankle moves ${span(xs).toFixed(1)}px across and ${span(ys).toFixed(1)}px up · his fist ${span(hs).toFixed(1)}px up`);
console.log(`  the worst one-frame move is ${jump.toFixed(2)}px`);

// The strip, so it can be looked at rather than only counted.
const imgs = [];
for (const b of shots) imgs.push(await Jimp.read(b));
if (imgs.length) {
  const w = imgs[0].bitmap.width;
  const h = Math.round(imgs[0].bitmap.height * 0.42);
  const sheet = new Jimp(w * imgs.length + 8 * (imgs.length + 1), h + 16, 0xefede6ff);
  for (const [i, im] of imgs.entries()) {
    im.crop(0, Math.round(imgs[0].bitmap.height * 0.10), w, h);
    sheet.composite(im, 8 + i * (w + 8), 8);
  }
  const file = path.join(OUT, `wander-live-${LESSON}-${BEAT}.png`);
  await sheet.writeAsync(file);
  console.log(`  ${file}`);
}
await send('Page.close');
process.exit(0);
