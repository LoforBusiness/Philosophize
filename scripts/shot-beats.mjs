// EVERY BEAT OF ONE LESSON, STITCHED INTO A STRIP.
//
//   npx expo start --web --port 8877 --clear
//   chrome --headless=new --remote-debugging-port=9407 --user-data-dir=<tmp>
//   node scripts/shot-beats.mjs political-political-19
//
// The measuring harnesses answer "is this word inside its box" and "does the
// camera hold it". They do not answer "what does a reader see on beat 4", and a
// reader walking a lesson is the only thing that found the last three defects.
// This photographs each beat's STAGE and puts them in one column so a whole
// lesson can be read at a glance.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const CDP = +(process.env.CDP_PORT || 9407);
const WEB = +(process.env.WEB_PORT || 8877);
const ROUTE = process.env.BEATS_ROUTE || 'previewread';
const OUT = path.join('scripts', '.lesson-shots');
const id = process.argv[2] || 'political-political-19';
const MAX = +(process.env.BEATS_MAX || 12);

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
  });
  r.on('error', rej); r.end();
});

const tab = await put('/json/new?about:blank');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let mid = 0; const pending = new Map();
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
});
await new Promise((r) => ws.addEventListener('open', r));
const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r?.exceptionDetails) throw new Error(String(r.exceptionDetails.exception?.description ?? '').slice(0, 300));
  return r?.result?.value;
};

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${id}&notour=1` });

const STAGE = "document.querySelector('#stage-cam')";
for (let i = 0; i < 240; i++) {
  if (await evalJs(`!!${STAGE}`)) break;
  await new Promise((r) => setTimeout(r, 1000));
}
if (!await evalJs(`!!${STAGE}`)) { console.log('NEVER RENDERED A STAGE'); process.exit(1); }

// The clip is the STAGE's own box, so the strip shows exactly what the camera
// gives the reader — the deck below it is a different question.
const CLIP = `(()=>{const h=${STAGE}.parentElement||${STAGE};const r=h.getBoundingClientRect();
  return JSON.stringify({x:Math.max(0,r.x),y:Math.max(0,r.y),width:r.width,height:r.height})})()`;

const CLICK = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";
const BEAT = "(()=>{const p=document.querySelector('[id=\"beat-progress\"],[data-nativeid=\"beat-progress\"]');return p?p.getAttribute('aria-valuenow')||p.textContent||'':''})()";

fs.mkdirSync(OUT, { recursive: true });
const shots = [];
for (let b = 0; b < MAX; b++) {
  await new Promise((r) => setTimeout(r, 1500));
  const clip = JSON.parse(await evalJs(CLIP));
  const r = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 },
  });
  const f = path.join(OUT, `beat-${String(b).padStart(2, '0')}.png`);
  fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
  shots.push(f);
  await evalJs(CLICK);
  await new Promise((r) => setTimeout(r, 900));
  // NOT /Continue/ — every beat says "Tap to continue", so the first version
  // stopped after one photograph and reported it as the whole lesson.
  const done = await evalJs("!document.querySelector('#stage-cam')");
  if (done) break;
}
console.log(shots.length + ' beat(s) photographed into ' + OUT);
process.exit(0);
