// PHOTOGRAPH A LESSON'S QUOTE BEAT.
//
//   npx expo start --web --port 8875 --clear
//   chrome --headless=new --remote-debugging-port=9405 --user-data-dir=<tmp>
//   node scripts/shot-quote.mjs epistemology-knowledge-19
//
// The quotation is the one thing in a lesson that also exists somewhere else —
// the thinker's profile — and the reader asked for the two to be the same object.
// So this stops on the beat that carries it and photographs the deck, which is
// the only way to compare them.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const CDP = +(process.env.CDP_PORT || 9405);
const WEB = +(process.env.WEB_PORT || 8875);
const ROUTE = process.env.QUOTE_ROUTE || 'previewquote';
const OUT = path.join('scripts', '.lesson-shots');

const id = process.argv[2] || 'epistemology-knowledge-19';
const out = process.argv[3] || 'quote.png';

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

// A quote beat is the one carrying the plate's bookmark control and a byline.
// Advance until the deck shows one.
const HAS_QUOTE = `(() => {
  const t = document.body.innerText || '';
  return /[“"]/.test(t) && /·/.test(t) && !!document.querySelector('svg');
})()`;
const CLICK = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";

let found = false;
for (let b = 0; b < 14; b++) {
  const txt = await evalJs('document.body.innerText || ""');
  if (/,\s*(c\.\s*)?\d{3,4}\s*(BCE|CE)?/.test(txt) && /[A-Z]{3,}/.test(txt) && await evalJs(HAS_QUOTE)) { found = true; break; }
  await evalJs(CLICK);
  await new Promise((r) => setTimeout(r, 1300));
}

await new Promise((r) => setTimeout(r, 700));
const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, out), Buffer.from(shot.data, 'base64'));
console.log(found ? 'quote beat reached' : 'no quote beat found — photographed where it stopped');
console.log('wrote', path.join(OUT, out));
process.exit(0);
