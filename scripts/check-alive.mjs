// IS THE PICTURE A PHOTOGRAPH BETWEEN TAPS?
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/check-alive.mjs <lesson-id> [<lesson-id> …]
//
// A reader asked twice for the lessons to feel as smooth and alive as the app's
// own ad reels. Counted from the SOURCE, 166 of 184 scenes read the monotonic
// clock for nothing but the figure — but a grep cannot tell an idle wobble that
// is actually visible from one multiplied by zero, and it misses a scene that
// moves by some other route. `epistemology11`'s new second hand is the worked
// example: the source test still called it dead, and the pixels say ALIVE.
//
// It is NOT in `npm run check` — it needs Metro and a browser — and it carries no
// budget on purpose. A scene about a thing that is deliberately still SHOULD come
// back a photograph, and only a person can say which those are.
//
// Two screenshots from ONE page load, a couple of seconds apart, differenced.
// Reloading between shots would prove nothing: the scene clock starts at 0 on
// every load, so a fixed delay after load reproduces the same frame exactly.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/landy/Documents/Philosophize';
const { default: Jimp } = await import(pathToFileURL(path.join(REPO, 'node_modules/jimp-compact/dist/jimp.js')).href);
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: 9391, path: p, method: 'PUT' }, (x) => {
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
  return r?.result?.value;
};

const STAGE = `(() => { const c = document.getElementById('stage-clip'); if (!c) return null;
  const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`;

/** Ignore the stickman: he has ambient life already and would mask everything. */
const FIG = `(() => { const f = document.querySelector('[data-testid="figure"]'); if (!f) return null;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const p of f.querySelectorAll('*')) { const r=p.getBoundingClientRect();
    if (r.width<1||r.height<1) continue;
    x0=Math.min(x0,r.x); y0=Math.min(y0,r.y); x1=Math.max(x1,r.right); y1=Math.max(y1,r.bottom); }
  return x0>1e8 ? null : { x: x0, y: y0, w: x1-x0, h: y1-y0 }; })()`;

const shot = async () => {
  const png = await send('Page.captureScreenshot', { format: 'png' });
  return Jimp.read(Buffer.from(png.data, 'base64'));
};

for (const id of process.argv.slice(2)) {
  await send('Page.navigate', { url: `http://localhost:8861/previewsheet23?id=${id}` });
  let ok = false;
  for (let i = 0; i < 90; i++) { const c = await ev("document.querySelectorAll('div').length"); if (c > 60) { ok = true; break; } await wait(700); }
  if (!ok) { console.log(`${id.padEnd(30)} NEVER RENDERED`); continue; }
  await wait(2600);
  const box = await ev(STAGE);
  const fig = await ev(FIG);
  const a = await shot();
  await wait(2000);
  const b = await shot();
  if (!box) { console.log(`${id.padEnd(30)} no stage`); continue; }

  const X = Math.round(box.x * 2), Y = Math.round(box.y * 2);
  const W = Math.round(box.w * 2), H = Math.round(box.h * 2);
  const fx0 = fig ? Math.round((fig.x - 6) * 2) : -1, fx1 = fig ? Math.round((fig.x + fig.w + 6) * 2) : -1;
  const fy0 = fig ? Math.round((fig.y - 6) * 2) : -1, fy1 = fig ? Math.round((fig.y + fig.h + 6) * 2) : -1;

  let diff = 0, total = 0;
  for (let y = Y; y < Y + H; y += 2) {
    for (let x = X; x < X + W; x += 2) {
      if (fig && x >= fx0 && x <= fx1 && y >= fy0 && y <= fy1) continue;   // skip the figure
      total += 1;
      if (a.getPixelColor(x, y) !== b.getPixelColor(x, y)) diff += 1;
    }
  }
  const pct = total ? (100 * diff / total) : 0;
  console.log(`${id.padEnd(30)} ${diff} of ${total} sampled points changed over 2s  (${pct.toFixed(2)}%)  ${diff ? 'ALIVE' : 'a photograph'}`);
}
process.exit(0);
